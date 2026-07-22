(function () {
  const config = window.SHORTFORM_CLOUD_CONFIG || {};
  let client = null;

  function configured() {
    return Boolean(config.enabled && config.supabaseUrl && config.supabaseAnonKey && window.supabase);
  }

  function getClient() {
    if (!configured()) return null;
    if (!client) client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
    return client;
  }

  function emitStatus(detail) {
    window.dispatchEvent(new CustomEvent("shortform:cloud-status", { detail }));
  }

  function iso(value) {
    return new Date(Number(value) || Date.now()).toISOString();
  }

  async function getSession() {
    const supabase = getClient();
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async function getUser() {
    return (await getSession())?.user || null;
  }

  async function signInWithEmail(email) {
    const supabase = getClient();
    if (!supabase) throw new Error("Cloud sync has not been configured yet.");
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } });
    if (error) throw error;
    emitStatus({ state: "email-sent", message: "Sign-in link sent. Open it on this device to finish cloud sync." });
  }

  async function signOut() {
    const supabase = getClient();
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    emitStatus({ state: "local", message: "Signed out. Local Brands and content remain on this device." });
  }

  function memoryRows(brand, workspaceId, cloudBrandId, ownerId) {
    const fields = [
      ["positioning", brand.positioning],
      ["audience", brand.audience],
      ["offer", brand.offer],
      ["voice", brand.voice],
      ["proof", brand.proof],
      ["products", brand.products],
      ["prohibited_claims", brand.prohibitedClaims],
      ["competitors", brand.competitors],
      ["winning_patterns", brand.winningPatterns],
      ["content_examples", brand.contentExamples],
      ["customer_objections", brand.customerObjections],
    ];
    return fields
      .filter(([, value]) => String(value || "").trim())
      .map(([entryType, value]) => ({ workspace_id: workspaceId, brand_id: cloudBrandId, owner_id: ownerId, entry_type: entryType, value, source: "brand_brain", approved_at: new Date().toISOString() }));
  }

  async function ensureWorkspace(user, mode) {
    const supabase = getClient();
    const { data, error } = await supabase
      .from("workspaces")
      .upsert({ owner_id: user.id, local_id: "personal", name: "My Content Workspace", mode }, { onConflict: "owner_id,local_id" })
      .select("id")
      .single();
    if (error) throw error;
    await supabase.from("workspace_members").upsert({ workspace_id: data.id, user_id: user.id, role: "owner" }, { onConflict: "workspace_id,user_id" });
    return data.id;
  }

  async function syncBrand(supabase, brand, workspaceId, user) {
    const { data: cloudBrand, error } = await supabase
      .from("brands")
      .upsert(
        {
          workspace_id: workspaceId,
          owner_id: user.id,
          local_id: brand.id,
          name: brand.name,
          category: brand.category || "",
          brain_data: brand,
          updated_at: iso(brand.updatedAt),
        },
        { onConflict: "workspace_id,local_id" }
      )
      .select("id")
      .single();
    if (error) throw error;
    await supabase.from("memory_entries").delete().eq("brand_id", cloudBrand.id);
    const memory = memoryRows(brand, workspaceId, cloudBrand.id, user.id);
    if (memory.length) {
      const { error: memoryError } = await supabase.from("memory_entries").insert(memory);
      if (memoryError) throw memoryError;
    }
    return cloudBrand.id;
  }

  async function syncContent(supabase, item, cloudBrandId, workspaceId, user) {
    const { data: cloudContent, error } = await supabase
      .from("content_projects")
      .upsert(
        {
          workspace_id: workspaceId,
          brand_id: cloudBrandId,
          owner_id: user.id,
          local_id: item.id,
          title: item.topic || "Untitled content",
          objective: item.objective || "Awareness",
          format: item.format || "Short video",
          platform: item.platform || "Multi-platform",
          status: item.status || "Idea",
          scheduled_for: item.scheduledAt || null,
          content_data: item,
          updated_at: iso(item.updatedAt),
        },
        { onConflict: "workspace_id,local_id" }
      )
      .select("id")
      .single();
    if (error) throw error;
    await Promise.all([
      supabase.from("content_versions").delete().eq("content_project_id", cloudContent.id),
      supabase.from("revision_logs").delete().eq("content_project_id", cloudContent.id),
      supabase.from("performance_entries").delete().eq("content_project_id", cloudContent.id),
      supabase.from("approvals").delete().eq("content_project_id", cloudContent.id),
    ]);
    const versions = (item.versions || []).map((version) => ({ content_project_id: cloudContent.id, owner_id: user.id, local_id: version.id, label: version.label, reason: version.reason || "", output: version.output || {} }));
    if (versions.length) await supabase.from("content_versions").insert(versions);
    if (item.revisionReason) await supabase.from("revision_logs").insert({ content_project_id: cloudContent.id, owner_id: user.id, reason: item.revisionReason, source: "content_library" });
    if (item.performance?.value || item.performance?.notes) await supabase.from("performance_entries").insert({ content_project_id: cloudContent.id, owner_id: user.id, metric: item.performance.metric || "Manual result", value: item.performance.value || "", notes: item.performance.notes || "" });
    return { ...item, cloudId: cloudContent.id };
  }

  function mergeByLocalId(localItems, remoteItems, dataKey) {
    const merged = new Map(localItems.map((item) => [item.id, item]));
    remoteItems.forEach((item) => {
      const remote = { ...item[dataKey], id: item.local_id, cloudId: item.id };
      if (dataKey === "content_data" && item.scheduled_for !== undefined) remote.scheduledAt = item.scheduled_for || "";
      const local = merged.get(remote.id);
      if (!local || Number(remote.updatedAt || 0) > Number(local.updatedAt || 0)) merged.set(remote.id, remote);
    });
    return [...merged.values()];
  }

  async function syncContentWorkspace({ mode, brands, content }) {
    const user = await getUser();
    if (!user) throw new Error("Sign in before syncing cloud data.");
    emitStatus({ state: "syncing", message: "Syncing Brand Brain and Content Library..." });
    const supabase = getClient();
    const workspaceId = await ensureWorkspace(user, mode);
    const cloudBrandIds = new Map();
    for (const brand of brands) cloudBrandIds.set(brand.id, await syncBrand(supabase, brand, workspaceId, user));
    const uploadedContent = [];
    for (const item of content) {
      const cloudBrandId = cloudBrandIds.get(item.brandId);
      if (cloudBrandId) uploadedContent.push(await syncContent(supabase, item, cloudBrandId, workspaceId, user));
    }
    const [{ data: remoteBrands, error: brandError }, { data: remoteContent, error: contentError }] = await Promise.all([
      supabase.from("brands").select("id,local_id,brain_data,updated_at").eq("workspace_id", workspaceId),
      supabase.from("content_projects").select("id,local_id,content_data,scheduled_for,updated_at").eq("workspace_id", workspaceId),
    ]);
    if (brandError) throw brandError;
    if (contentError) throw contentError;
    const result = {
      workspaceId,
      brands: mergeByLocalId(brands, remoteBrands || [], "brain_data"),
      content: mergeByLocalId(uploadedContent, remoteContent || [], "content_data"),
    };
    emitStatus({ state: "synced", message: `Cloud synced: ${result.brands.length} Brand(s), ${result.content.length} content project(s).`, user });
    return result;
  }

  async function recordExport(contentProject, exportType) {
    const user = await getUser();
    if (!user || !contentProject?.cloudId) return;
    const workspace = await ensureWorkspace(user, "brand");
    await getClient().from("exports").insert({ workspace_id: workspace, content_project_id: contentProject.cloudId, owner_id: user.id, export_type: exportType, metadata: { localId: contentProject.id } });
  }

  async function runAi(job, contentProject) {
    const session = await getSession();
    if (!session) throw new Error("Sign in before running cloud AI.");
    if (!config.workerUrl) throw new Error("Cloudflare Worker URL is missing from cloud-config.js.");
    if (!contentProject?.cloudId) throw new Error("Create and sync this content project before running cloud AI.");
    const response = await fetch(`${config.workerUrl.replace(/\/$/, "")}/v1/ai/${job}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ contentProjectId: contentProject.cloudId }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "AI request failed.");
    return payload;
  }

  async function setAiDisposition(runId, disposition) {
    const user = await getUser();
    if (!user || !runId) return;
    const { error } = await getClient().from("ai_runs").update({ disposition, adopted_at: disposition === "approved" ? new Date().toISOString() : null }).eq("id", runId).eq("owner_id", user.id);
    if (error) throw error;
  }

  window.ShortFormCloud = { configured, getSession, getUser, signInWithEmail, signOut, syncContentWorkspace, recordExport, runAi, setAiDisposition };
})();
