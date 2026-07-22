const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const JOBS = {
  intake: "Organize brand information from the current Brand Brain and content context.",
  revision: "Analyze revision reasons and classify whether the friction comes from missing information, preference change, execution error, scope change, or approval delay.",
  "next-sprint": "Recommend the next content test using memory, content versions, revision history, and performance entries.",
  generate: "Generate a complete on-brand content project: angle, hooks, script, caption, CTA, visual beats, and repurpose variants.",
  rewrite: "Rewrite the current content project using its revision history and approved Brand Brain without losing the original goal.",
  repurpose: "Repurpose the current content project for another platform while retaining the same Brand Brain and proof standards.",
  extract: "Extract proposed Brand Brain updates from supplied source material. Never state uncertain details as facts.",
  compare: "Compare content versions, identify what changed, what was repeatedly removed, and what should be tested next.",
};

function json(data, init = {}) {
  return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json", ...CORS_HEADERS }, ...init });
}

function serviceHeaders(env) {
  return { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": "application/json" };
}

async function getUser(request, env) {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: auth } });
  return response.ok ? response.json() : null;
}

async function rest(env, path, options = {}) {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, { ...options, headers: { ...serviceHeaders(env), ...(options.headers || {}) } });
  const text = await response.text();
  if (!response.ok) throw new Error(text || "Supabase request failed.");
  return text ? JSON.parse(text) : null;
}

async function loadContext(env, userId, contentProjectId) {
  const rows = await rest(env, `content_projects?id=eq.${encodeURIComponent(contentProjectId)}&owner_id=eq.${encodeURIComponent(userId)}&select=id,workspace_id,brand_id,title,objective,format,platform,status,content_data`);
  const contentProject = rows?.[0];
  if (!contentProject) throw new Error("Content project not found or not owned by this account.");
  const [brands, memory, versions, revisions, performance, approvals] = await Promise.all([
    rest(env, `brands?id=eq.${encodeURIComponent(contentProject.brand_id)}&owner_id=eq.${encodeURIComponent(userId)}&select=id,name,category,brain_data`),
    rest(env, `memory_entries?brand_id=eq.${encodeURIComponent(contentProject.brand_id)}&owner_id=eq.${encodeURIComponent(userId)}&select=entry_type,value,source,approved_at&order=created_at.desc`),
    rest(env, `content_versions?content_project_id=eq.${encodeURIComponent(contentProjectId)}&owner_id=eq.${encodeURIComponent(userId)}&select=label,reason,output,created_at&order=created_at.asc`),
    rest(env, `revision_logs?content_project_id=eq.${encodeURIComponent(contentProjectId)}&owner_id=eq.${encodeURIComponent(userId)}&select=reason,classification,created_at&order=created_at.desc`),
    rest(env, `performance_entries?content_project_id=eq.${encodeURIComponent(contentProjectId)}&owner_id=eq.${encodeURIComponent(userId)}&select=metric,value,notes,captured_at&order=captured_at.desc`),
    rest(env, `approvals?content_project_id=eq.${encodeURIComponent(contentProjectId)}&owner_id=eq.${encodeURIComponent(userId)}&select=owner_name,state,revision_reason,updated_at&order=updated_at.desc`),
  ]);
  return { contentProject, brand: brands?.[0] || {}, memory, versions, revisions, performance, approvals };
}

function planLimit(plan) {
  return { free: 10, creator: 100, studio: 500, agency: 1500 }[plan] || 10;
}

async function assertQuota(env, userId) {
  const profile = (await rest(env, `profiles?id=eq.${encodeURIComponent(userId)}&select=plan`))?.[0];
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const runs = await rest(env, `ai_runs?owner_id=eq.${encodeURIComponent(userId)}&created_at=gte.${encodeURIComponent(start.toISOString())}&select=id`);
  const plan = profile?.plan || "free";
  const limit = planLimit(plan);
  if ((runs?.length || 0) >= limit) throw new Error(`Monthly AI allowance reached for the ${plan} plan.`);
  return { plan, remaining: limit - (runs?.length || 0) - 1 };
}

function outputSchema() {
  return {
    type: "json_schema",
    name: "shortform_content_os_response",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        summary: { type: "string" },
        suggestion: { type: "string" },
        reason: { type: "string" },
        memory_used: { type: "array", items: { type: "object", additionalProperties: false, properties: { type: { type: "string" }, value: { type: "string" }, reason: { type: "string" } }, required: ["type", "value", "reason"] } },
        proposed_memory_updates: { type: "array", items: { type: "object", additionalProperties: false, properties: { field: { type: "string" }, value: { type: "string" }, rationale: { type: "string" } }, required: ["field", "value", "rationale"] } },
        content_output: { type: "object", additionalProperties: false, properties: { angle: { type: "string" }, hooks: { type: "array", items: { type: "string" } }, script: { type: "string" }, caption: { type: "string" }, cta: { type: "string" }, visual_beats: { type: "array", items: { type: "string" } }, repurpose_variants: { type: "array", items: { type: "string" } } }, required: ["angle", "hooks", "script", "caption", "cta", "visual_beats", "repurpose_variants"] },
        next_actions: { type: "array", items: { type: "string" } },
        uncertainties: { type: "array", items: { type: "string" } },
      },
      required: ["title", "summary", "suggestion", "reason", "memory_used", "proposed_memory_updates", "content_output", "next_actions", "uncertainties"],
    },
  };
}

function outputText(payload) {
  for (const item of payload.output || []) for (const content of item.content || []) if (content.type === "output_text") return content.text;
  throw new Error("The AI response did not include text output.");
}

async function callOpenAI(env, job, context) {
  const system = `You are ShortForm Content OS, a careful brand-memory and content-production assistant. ${JOBS[job]}

Rules:
- Use only the supplied context. Do not invent performance, approval, customer, or legal facts.
- Never promise virality, revenue, reach, sales, or platform safety.
- Explain which Brand Memory entries you used and why.
- Name uncertainty when a required fact is missing.
- AI never automatically modifies Brand Brain. Proposed memory updates are suggestions that require explicit user approval.
- Allowed proposed_memory_updates fields: positioning, audience, offer, voice, proof, products, prohibitedClaims, competitors, winningPatterns, contentExamples, customerObjections, revisionReason.
- Return concise, structured, brand-safe English.`;
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [{ role: "system", content: [{ type: "input_text", text: system }] }, { role: "user", content: [{ type: "input_text", text: JSON.stringify(context) }] }],
      text: { format: outputSchema() },
    }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error?.message || "OpenAI request failed.");
  return { output: JSON.parse(outputText(payload)), model: payload.model || env.OPENAI_MODEL || "gpt-4.1-mini" };
}

async function saveRun(env, userId, job, context, result) {
  const rows = await rest(env, "ai_runs", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      workspace_id: context.contentProject.workspace_id,
      brand_id: context.contentProject.brand_id,
      content_project_id: context.contentProject.id,
      owner_id: userId,
      job_type: job,
      model: result.model,
      input_summary: { title: context.contentProject.title, memory_count: context.memory.length, version_count: context.versions.length },
      context_sources: ["brand_brain", "memory_entries", "content_versions", "revision_logs", "performance_entries", "approvals"],
      output: result.output,
    }),
  });
  return rows?.[0];
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") return json({ ok: true, service: "shortform-content-os-ai" });
    if (request.method !== "POST" || !url.pathname.startsWith("/v1/ai/")) return json({ error: "Not found" }, { status: 404 });
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY || !env.OPENAI_API_KEY) return json({ error: "Worker secrets are not configured." }, { status: 503 });
    const job = url.pathname.split("/").pop();
    if (!JOBS[job]) return json({ error: "Unsupported AI job." }, { status: 400 });
    const user = await getUser(request, env);
    if (!user) return json({ error: "Unauthorized" }, { status: 401 });
    try {
      const body = await request.json();
      if (!body.contentProjectId) return json({ error: "contentProjectId is required." }, { status: 400 });
      const quota = await assertQuota(env, user.id);
      const context = await loadContext(env, user.id, body.contentProjectId);
      const result = await callOpenAI(env, job, context);
      const run = await saveRun(env, user.id, job, context, result);
      return json({ runId: run?.id, job, suggestion: result.output, quota });
    } catch (error) {
      return json({ error: error.message || "AI request failed." }, { status: 400 });
    }
  },
};
