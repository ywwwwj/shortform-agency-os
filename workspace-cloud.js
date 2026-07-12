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

  function toIso(timestamp) {
    return new Date(Number(timestamp) || Date.now()).toISOString();
  }

  function toClientKey(project) {
    return `${(project.clientName || "unknown-client").trim().toLowerCase()}::${(project.industry || "unknown-industry")
      .trim()
      .toLowerCase()}`;
  }

  async function getSession() {
    const supabase = getClient();
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async function getUser() {
    const session = await getSession();
    return session?.user || null;
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
    emitStatus({ state: "local", message: "Signed out. Local projects remain on this device." });
  }

  function memoryRows(project, clientId, projectId, ownerId) {
    const fields = [
      ["audience_memory", project.audienceMemory],
      ["brand_brain", project.brandBrain],
      ["red_lines", project.redLines],
      ["proof_assets", project.assets],
      ["winning_pattern", project.winningPattern],
      ["latest_learning", project.testResult],
    ];
    return fields
      .filter(([, value]) => String(value || "").trim())
      .map(([entryType, value]) => ({ owner_id: ownerId, client_id: clientId, project_id: projectId, entry_type: entryType, value, source: "workspace-sync" }));
  }

  function learningRows(project, projectId, ownerId) {
    return (project.learningLog || []).map((entry) => ({
      owner_id: ownerId,
      project_id: projectId,
      local_id: entry.id,
      happened_at: toIso(entry.createdAt),
      status: entry.status,
      feedback: entry.feedback,
      learning: entry.testResult,
      winning_pattern: entry.winningPattern,
      next_decision: entry.nextDecision,
      changed_fields: entry.changed || [],
    }));
  }

  function revisionRows(project, projectId, ownerId) {
    const entries = project.learningLog?.length ? project.learningLog : [project];
    return entries.map((entry, index) => ({
      owner_id: ownerId,
      project_id: projectId,
      local_id: entry.id || `${project.id}-current-${index}`,
      reason: entry.revisionReason || project.revisionReason || "No revision reason logged.",
      approval_state: entry.approvalState || project.approvalState,
      approval_owner: entry.approvalOwner || project.approvalOwner,
      occurred_at: toIso(entry.createdAt || project.updatedAt),
    }));
  }

  function efficiencyRows(project, projectId, ownerId) {
    const entries = project.learningLog?.length ? project.learningLog : [project];
    return entries.map((entry, index) => ({
      owner_id: ownerId,
      project_id: projectId,
      local_id: entry.id || `${project.id}-efficiency-${index}`,
      captured_at: toIso(entry.createdAt || project.updatedAt),
      brief_prep_minutes: Number(entry.briefPrepMinutes || project.briefPrepMinutes || 0),
      approval_wait_days: Number(entry.approvalWaitDays || project.approvalWaitDays || 0),
      revision_rounds: Number(entry.revisionRounds || project.revisionRounds || 0),
      report_prep_minutes: Number(entry.reportPrepMinutes || project.reportPrepMinutes || 0),
    }));
  }

  async function syncProject(project, user) {
    const supabase = getClient();
    const clientPayload = {
      owner_id: user.id,
      client_key: toClientKey(project),
      name: project.clientName || "Untitled client",
      industry: project.industry || "",
      profile_data: {
        audience: project.audience,
        audience_memory: project.audienceMemory,
        brand_brain: project.brandBrain,
        red_lines: project.redLines,
        assets: project.assets,
        competitors: project.competitors,
      },
      updated_at: toIso(project.updatedAt),
    };
    const { data: cloudClient, error: clientError } = await supabase
      .from("clients")
      .upsert(clientPayload, { onConflict: "owner_id,client_key" })
      .select("id")
      .single();
    if (clientError) throw clientError;

    const projectPayload = {
      owner_id: user.id,
      client_id: cloudClient.id,
      local_id: project.id,
      title: project.templateType || project.serviceType || "Client sprint",
      status: project.status || "New lead",
      workspace_data: project,
      started_at: toIso(project.createdAt),
      updated_at: toIso(project.updatedAt),
    };
    const { data: cloudProject, error: projectError } = await supabase
      .from("projects")
      .upsert(projectPayload, { onConflict: "owner_id,local_id" })
      .select("id")
      .single();
    if (projectError) throw projectError;

    const deletes = await Promise.all([
      supabase.from("memory_entries").delete().eq("project_id", cloudProject.id),
      supabase.from("learning_logs").delete().eq("project_id", cloudProject.id),
      supabase.from("revision_logs").delete().eq("project_id", cloudProject.id),
      supabase.from("efficiency_snapshots").delete().eq("project_id", cloudProject.id),
      supabase.from("approvals").delete().eq("project_id", cloudProject.id),
    ]);
    const failedDelete = deletes.find((response) => response.error);
    if (failedDelete?.error) throw failedDelete.error;

    const memory = memoryRows(project, cloudClient.id, cloudProject.id, user.id);
    const learning = learningRows(project, cloudProject.id, user.id);
    const revisions = revisionRows(project, cloudProject.id, user.id);
    const efficiency = efficiencyRows(project, cloudProject.id, user.id);
    const writes = [
      ...(memory.length ? [supabase.from("memory_entries").insert(memory)] : []),
      ...(learning.length ? [supabase.from("learning_logs").insert(learning)] : []),
      ...(revisions.length ? [supabase.from("revision_logs").insert(revisions)] : []),
      ...(efficiency.length ? [supabase.from("efficiency_snapshots").insert(efficiency)] : []),
      supabase.from("approvals").insert({
        owner_id: user.id,
        project_id: cloudProject.id,
        owner_name: project.approvalOwner || "Founder",
        state: project.approvalState || "Drafting",
        revision_reason: project.revisionReason || "",
      }),
    ];
    const responses = await Promise.all(writes);
    const failed = responses.find((response) => response.error);
    if (failed?.error) throw failed.error;
    return { ...project, cloudId: cloudProject.id, clientCloudId: cloudClient.id };
  }

  function mergeProjects(localProjects, cloudProjects) {
    const merged = new Map(localProjects.map((project) => [project.id, project]));
    cloudProjects.forEach((cloudProject) => {
      const remote = { ...cloudProject.workspace_data, id: cloudProject.local_id, projectId: cloudProject.local_id, cloudId: cloudProject.id };
      const local = merged.get(remote.id);
      if (!local || Number(remote.updatedAt || 0) >= Number(local.updatedAt || 0)) merged.set(remote.id, remote);
    });
    return [...merged.values()];
  }

  async function syncProjects(localProjects) {
    const user = await getUser();
    if (!user) throw new Error("Sign in before syncing cloud data.");
    emitStatus({ state: "syncing", message: "Syncing encrypted account session with cloud workspace..." });
    const supabase = getClient();
    const { data: existingCloudProjects, error: readError } = await supabase
      .from("projects")
      .select("id,local_id,workspace_data,updated_at")
      .order("updated_at", { ascending: false });
    if (readError) throw readError;

    const cloudByLocalId = new Map((existingCloudProjects || []).map((project) => [project.local_id, project]));
    const uploaded = [];
    for (const project of localProjects) {
      const cloudProject = cloudByLocalId.get(project.id);
      const localUpdatedAt = Number(project.updatedAt || 0);
      const cloudUpdatedAt = Number(cloudProject?.workspace_data?.updatedAt || 0);
      if (!cloudProject || localUpdatedAt > cloudUpdatedAt) uploaded.push(await syncProject(project, user));
    }

    const { data: cloudProjects, error } = await supabase
      .from("projects")
      .select("id,local_id,workspace_data,updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    const merged = mergeProjects(uploaded, cloudProjects || []);
    emitStatus({ state: "synced", message: `Cloud synced: ${merged.length} project(s) available across devices.`, user });
    return merged;
  }

  async function recordExport(project, exportType) {
    const user = await getUser();
    if (!user || !project?.cloudId) return;
    const { error } = await getClient().from("exports").insert({
      owner_id: user.id,
      project_id: project.cloudId,
      export_type: exportType,
      metadata: { clientName: project.clientName, localId: project.id },
    });
    if (error) console.warn("Export telemetry was not saved", error.message);
  }

  async function runAi(job, project) {
    const session = await getSession();
    if (!session) throw new Error("Sign in before running cloud AI.");
    if (!config.workerUrl) throw new Error("Cloudflare Worker URL is missing from cloud-config.js.");
    if (!project?.cloudId) throw new Error("Save and sync this project before running cloud AI.");
    const response = await fetch(`${config.workerUrl.replace(/\/$/, "")}/v1/ai/${job}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ projectId: project.cloudId }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "AI request failed.");
    return payload;
  }

  async function setAiDisposition(runId, disposition) {
    const user = await getUser();
    if (!user || !runId) return;
    const { error } = await getClient()
      .from("ai_runs")
      .update({ disposition, adopted_at: disposition === "approved" ? new Date().toISOString() : null })
      .eq("id", runId)
      .eq("owner_id", user.id);
    if (error) throw error;
  }

  window.ShortFormCloud = {
    configured,
    getSession,
    getUser,
    signInWithEmail,
    signOut,
    syncProjects,
    recordExport,
    runAi,
    setAiDisposition,
  };
})();
