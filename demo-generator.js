const form = document.querySelector("#miniGeneratorForm");
const sampleBriefBtn = document.querySelector("#sampleBriefBtn");
const downloadPackBtn = document.querySelector("#downloadPackBtn");
const strategy = document.querySelector("#miniStrategy");
const creative = document.querySelector("#miniCreative");
const memo = document.querySelector("#miniMemo");
const pack = document.querySelector("#miniPack");

let latestMarkdown = "";

const sampleBrief = {
  client: "GlowBar Studio",
  niche: "premium beauty UGC studio",
  audience: "DTC skincare founders who need paid-social creative that still feels premium",
  offer: "monthly UGC creative testing system",
  platform: "Instagram Reels",
  tone: "premium and polished",
  constraint: "needs premium positioning",
  desiredOutput: "UGC ad test",
};

const constraintRules = {
  "unclear offer": {
    diagnosis: "The offer needs one buyer, one promise, one proof asset, and one action before volume makes sense.",
    revision: "Rewrite the CTA so the buyer knows exactly what happens after they reply.",
    risk: "Avoid producing ten generic scripts before the offer is sharp.",
    score: 72,
  },
  "weak proof": {
    diagnosis: "The content can start, but the first sprint should collect proof before pushing a bigger retainer.",
    revision: "Add demos, screenshots, testimonials, before-after scenes, or founder credibility to every asset.",
    risk: "Do not scale trend volume until there is something concrete to trust.",
    score: 68,
  },
  "low budget": {
    diagnosis: "This should be sold as a focused diagnostic sprint, not a full production retainer.",
    revision: "Cut scope to one platform, one offer, three hooks, and one weekly report.",
    risk: "Do not promise a monthly system if the buyer can only fund a small validation cycle.",
    score: 76,
  },
  "needs premium positioning": {
    diagnosis: "The buyer needs proof, taste, and calm decision logic more than noisy trend-chasing.",
    revision: "Remove cheap urgency and lead with quality signals, specific proof, and controlled testing.",
    risk: "Do not make premium buyers feel like they are buying commodity content.",
    score: 84,
  },
};

const outputMap = {
  "client pitch pack": {
    promise: "first-call clarity",
    deliverable: "positioning memo, hook set, starter landing outline, and renewal logic",
    metric: "qualified replies and booked calls",
  },
  "weekly content sprint": {
    promise: "one week of publishable momentum",
    deliverable: "campaign angle, scripts, storyboard, approval checklist, and learning log",
    metric: "saves, comments, replies, and profile actions",
  },
  "UGC ad test": {
    promise: "controlled creative learning",
    deliverable: "hook matrix, creator brief, shot list, paid test notes, and next-variant plan",
    metric: "thumb-stop rate, CTR, hold rate, and comment quality",
  },
  "landing page starter": {
    promise: "a conversion-ready first page",
    deliverable: "hero promise, proof sections, CTA, objections, and launch checklist",
    metric: "CTA clicks, form starts, and qualified DMs",
  },
};

const platformRules = {
  TikTok: "Open with tension in the first three seconds, then turn comments into visible next steps.",
  "Instagram Reels": "Lead with visual proof, captions, creator fit, and save-worthy framing.",
  "YouTube Shorts": "Use a compact story arc: problem, proof, shift, action.",
  LinkedIn: "Make the founder insight crisp enough to drive trust and calls.",
};

function getData() {
  return Object.fromEntries(new FormData(form).entries());
}

function setFormData(data) {
  Object.entries(data).forEach(([key, value]) => {
    const field = form.elements[key];
    if (field) {
      field.value = value;
    }
  });
}

function getRule(data) {
  return constraintRules[data.constraint] || constraintRules["unclear offer"];
}

function getOutput(data) {
  return outputMap[data.desiredOutput] || outputMap["client pitch pack"];
}

function buildHooks(data) {
  return [
    `Most ${data.audience} do not need more content. They need one ${data.offer} that proves the offer is real.`,
    `If ${data.niche} content feels generic, start with the proof moment before the trend.`,
    `Here is the simplest ${data.platform} test I would run before selling a bigger package.`,
    `The fastest way to make ${data.client} easier to trust is to show the decision, not just the result.`,
    `Turn one customer objection into a repeatable ${data.desiredOutput}.`,
  ];
}

function buildStoryboard(data, hooks) {
  return [
    ["Hook", "Open on the highest-friction buyer question.", hooks[0]],
    ["Proof", "Show a specific asset, process moment, customer line, or before-after frame.", `Make ${data.offer} feel concrete.`],
    ["Decision", "Explain why this path is lower risk than random posting.", platformRules[data.platform]],
    ["Action", "Ask for one simple reply, booking, or approval.", `CTA: DM or comment "sprint" for the ${data.desiredOutput}.`],
  ];
}

function buildLandingOutline(data) {
  return [
    `Hero: ${data.client} helps ${data.audience} turn ${data.niche} demand into ${data.offer}.`,
    `Proof block: show 3 assets that make the offer believable before asking for a call.`,
    `Workflow block: brief, angle, script, approval, publish, learn, renew.`,
    `Objection block: explain scope, timeline, platform focus, and what the first sprint will not promise.`,
    `CTA block: book a focused sprint or request the starter pack.`,
  ];
}

function buildRevisionChecklist(data, rule) {
  return [
    rule.revision,
    `Check that the tone stays ${data.tone} from hook to CTA.`,
    `Remove any claim that implies guaranteed virality, revenue, or platform-safe outcomes.`,
    `Keep the output focused on ${data.platform} before adapting it elsewhere.`,
    `Log the best-performing hook and one rejected angle for the next cycle.`,
  ];
}

function buildPack(data) {
  const rule = getRule(data);
  const output = getOutput(data);
  const hooks = buildHooks(data);
  const storyboard = buildStoryboard(data, hooks);
  const landing = buildLandingOutline(data);
  const checklist = buildRevisionChecklist(data, rule);
  const angle = `${data.client} should sell ${output.promise} by making ${data.offer} feel safer, more specific, and easier to approve for ${data.audience}.`;
  const script = [
    `[0-3s] ${hooks[0]}`,
    `[3-10s] Show the specific client problem: ${data.constraint}.`,
    `[10-20s] Demonstrate the workflow: brief, proof, hook, script, approval, report.`,
    `[20-27s] Explain the first sprint outcome: ${output.deliverable}.`,
    `[27-30s] CTA: comment or DM "sprint" to get the starter version.`,
  ];

  return {
    data,
    rule,
    output,
    hooks,
    storyboard,
    landing,
    checklist,
    angle,
    script,
    renewal:
      `Renew if ${output.metric} improve and the client can name the winning pattern. Next month should turn the best hook into three variants, one proof-led landing section, and a cleaner approval workflow.`,
  };
}

function renderStrategy(result) {
  const initials = (result.data.client || "OS").slice(0, 2).toUpperCase();
  strategy.innerHTML = `
    <div class="mini-site-top"><b>${initials}</b><span>${result.data.platform}</span><span>${result.data.desiredOutput}</span></div>
    <h2>${result.angle}</h2>
    <p>${result.rule.diagnosis}</p>
    <div class="mini-site-tags">
      <span>${result.output.promise}</span>
      <span>${result.rule.score}% readiness</span>
      <span>local/static</span>
    </div>
  `;
}

function renderCreative(result) {
  creative.innerHTML = `
    <div>
      <strong>Hook bank</strong>
      <ol>${result.hooks.slice(0, 4).map((hook) => `<li>${hook}</li>`).join("")}</ol>
    </div>
    <div>
      <strong>30-second script</strong>
      <p>${result.script.join(" ")}</p>
    </div>
    <div>
      <strong>Storyboard beats</strong>
      <ul>${result.storyboard.map((beat) => `<li><b>${beat[0]}:</b> ${beat[1]}</li>`).join("")}</ul>
    </div>
  `;
}

function renderMemo(result) {
  memo.innerHTML = `
    <div class="mini-score">${result.rule.score}%</div>
    <h3>Client readiness</h3>
    <p>${result.rule.risk}</p>
    <small>${result.renewal}</small>
  `;
}

function renderPack(result) {
  pack.innerHTML = `
    <article>
      <span>Campaign angle</span>
      <p>${result.angle}</p>
    </article>
    <article>
      <span>Landing page outline</span>
      <ul>${result.landing.map((item) => `<li>${item}</li>`).join("")}</ul>
    </article>
    <article>
      <span>Revision checklist</span>
      <ul>${result.checklist.map((item) => `<li>${item}</li>`).join("")}</ul>
    </article>
    <article>
      <span>Renewal logic</span>
      <p>${result.renewal}</p>
    </article>
  `;
}

function buildMarkdown(result) {
  return `# ${result.data.client} Mini Client Pack

Static/local demo generated by ShortForm Content OS.

## Brief

- Niche: ${result.data.niche}
- Audience: ${result.data.audience}
- Offer: ${result.data.offer}
- Platform: ${result.data.platform}
- Tone: ${result.data.tone}
- Constraint: ${result.data.constraint}
- Desired output: ${result.data.desiredOutput}

## Campaign Angle

${result.angle}

## Client Diagnosis

${result.rule.diagnosis}

## Hook Bank

${result.hooks.map((hook, index) => `${index + 1}. ${hook}`).join("\n")}

## 30-Second Script

${result.script.join("\n")}

## Storyboard Beats

${result.storyboard.map((beat) => `- ${beat[0]}: ${beat[1]} ${beat[2]}`).join("\n")}

## Landing Page Outline

${result.landing.map((item) => `- ${item}`).join("\n")}

## Revision Checklist

${result.checklist.map((item) => `- ${item}`).join("\n")}

## Renewal Note

${result.renewal}
`;
}

function render() {
  const result = buildPack(getData());
  renderStrategy(result);
  renderCreative(result);
  renderMemo(result);
  renderPack(result);
  latestMarkdown = buildMarkdown(result);
}

function downloadMarkdown() {
  const data = getData();
  const blob = new Blob([latestMarkdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${data.client || "client"}-mini-client-pack.md`;
  link.click();
  URL.revokeObjectURL(url);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  render();
});

form.addEventListener("input", render);

sampleBriefBtn.addEventListener("click", () => {
  setFormData(sampleBrief);
  render();
});

downloadPackBtn.addEventListener("click", downloadMarkdown);

render();
