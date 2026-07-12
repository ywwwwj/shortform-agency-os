const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const JOBS = {
  intake: {
    title: "Organize client information",
    instruction:
      "Convert the project context into a structured client profile. Keep only evidence-backed details. Put uncertain or missing items in uncertainties.",
  },
  revision: {
    title: "Analyze revision reasons",
    instruction:
      "Classify revision and approval friction into information missing, preference change, execution error, scope change, or approval delay. Recommend a client-safe next move.",
  },
  "next-sprint": {
    title: "Recommend the next sprint",
    instruction:
      "Use memory, approval history, learning logs, and efficiency snapshots to recommend one narrow next test and a renewal argument. Do not promise outcomes.",
  },
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
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: auth },
  });
  if (!response.ok) return null;
  return response.json();
}

async function rest(env, path, options = {}) {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: { ...serviceHeaders(env), ...(options.headers || {}) },
  });
  const body = await response.text();
  if (!response.ok) throw new Error(body || "Supabase request failed.");
  return body ? JSON.parse(body) : null;
}

async function loadContext(env, userId, projectId) {
  const projectRows = await rest(
    env,
    `projects?id=eq.${encodeURIComponent(projectId)}&owner_id=eq.${encodeURIComponent(userId)}&select=id,client_id,title,status,workspace_data,updated_at`
  );
  const project = projectRows?.[0];
  if (!project) throw new Error("Project not found or not owned by this account.");
  const query = `owner_id=eq.${encodeURIComponent(userId)}&project_id=eq.${encodeURIComponent(projectId)}&order=created_at.desc`;
  const [memory, revisions, learning, efficiency, approvals] = await Promise.all([
    rest(env, `memory_entries?${query}&select=entry_type,value,source,created_at`),
    rest(env, `revision_logs?${query}&select=reason,approval_state,approval_owner,occurred_at`),
    rest(env, `learning_logs?${query}&select=learning,winning_pattern,next_decision,changed_fields,happened_at`),
    rest(env, `efficiency_snapshots?${query}&select=brief_prep_minutes,approval_wait_days,revision_rounds,report_prep_minutes,captured_at`),
    rest(env, `approvals?${query}&select=owner_name,state,revision_reason,updated_at`),
  ]);
  return { project, memory, revisions, learning, efficiency, approvals };
}

function planLimit(plan) {
  return { free: 10, solo: 100, studio: 1000 }[plan] || 10;
}

async function assertQuota(env, userId) {
  const profiles = await rest(env, `profiles?id=eq.${encodeURIComponent(userId)}&select=plan`);
  const plan = profiles?.[0]?.plan || "free";
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const runs = await rest(env, `ai_runs?owner_id=eq.${encodeURIComponent(userId)}&created_at=gte.${encodeURIComponent(start.toISOString())}&select=id`);
  if ((runs?.length || 0) >= planLimit(plan)) throw new Error(`Monthly AI allowance reached for the ${plan} plan.`);
  return { plan, remaining: planLimit(plan) - (runs?.length || 0) - 1 };
}

function outputSchema() {
  return {
    type: "json_schema",
    name: "shortform_workspace_suggestion",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        summary: { type: "string" },
        suggestion: { type: "string" },
        reason: { type: "string" },
        memory_used: {
          type: "array",
          items: { type: "object", additionalProperties: false, properties: { type: { type: "string" }, value: { type: "string" }, reason: { type: "string" } }, required: ["type", "value", "reason"] },
        },
        proposed_memory_updates: {
          type: "array",
          items: { type: "object", additionalProperties: false, properties: { field: { type: "string" }, value: { type: "string" }, rationale: { type: "string" } }, required: ["field", "value", "rationale"] },
        },
        next_actions: { type: "array", items: { type: "string" } },
        uncertainties: { type: "array", items: { type: "string" } },
      },
      required: ["title", "summary", "suggestion", "reason", "memory_used", "proposed_memory_updates", "next_actions", "uncertainties"],
    },
  };
}

function responseText(payload) {
  for (const item of payload.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text") return content.text;
    }
  }
  throw new Error("The AI response did not include text output.");
}

async function callOpenAI(env, job, context) {
  const task = JOBS[job];
  const system = `You are a careful agency operations assistant. ${task.instruction}

Rules:
- Never claim guaranteed business results, virality, or revenue.
- Never invent customer facts, metrics, approvals, or legal clearance.
- Use only the supplied client context and name every memory item you rely on.
- AI cannot overwrite long-term memory. Proposed updates must be explicit suggestions for a human to approve.
- Limit proposed_memory_updates fields to: audienceMemory, brandBrain, redLines, assets, winningPattern, testResult, revisionReason, notes, approvalOwner, approvalState.
- Write concise, operator-ready English.`;
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        { role: "system", content: [{ type: "input_text", text: system }] },
        { role: "user", content: [{ type: "input_text", text: JSON.stringify(context) }] },
      ],
      text: { format: outputSchema() },
    }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error?.message || "OpenAI request failed.");
  return { output: JSON.parse(responseText(payload)), model: payload.model || env.OPENAI_MODEL || "gpt-4.1-mini" };
}

async function saveRun(env, userId, projectId, job, model, context, output) {
  const rows = await rest(env, "ai_runs", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      owner_id: userId,
      project_id: projectId,
      job_type: job,
      model,
      input_summary: { project_title: context.project.title, memory_count: context.memory.length, learning_count: context.learning.length },
      context_sources: ["workspace_data", "memory_entries", "revision_logs", "learning_logs", "efficiency_snapshots", "approvals"],
      output,
    }),
  });
  return rows?.[0];
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") return json({ ok: true, service: "shortform-ai-proxy" });
    if (request.method !== "POST" || !url.pathname.startsWith("/v1/ai/")) return json({ error: "Not found" }, { status: 404 });
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY || !env.OPENAI_API_KEY) {
      return json({ error: "Worker secrets are not configured." }, { status: 503 });
    }
    const job = url.pathname.split("/").pop();
    if (!JOBS[job]) return json({ error: "Unsupported AI job." }, { status: 400 });
    const user = await getUser(request, env);
    if (!user) return json({ error: "Unauthorized" }, { status: 401 });
    try {
      const body = await request.json();
      if (!body.projectId) return json({ error: "projectId is required." }, { status: 400 });
      const quota = await assertQuota(env, user.id);
      const context = await loadContext(env, user.id, body.projectId);
      const result = await callOpenAI(env, job, context);
      const run = await saveRun(env, user.id, body.projectId, job, result.model, context, result.output);
      return json({ runId: run?.id, job, suggestion: result.output, quota });
    } catch (error) {
      return json({ error: error.message || "AI request failed." }, { status: 400 });
    }
  },
};
