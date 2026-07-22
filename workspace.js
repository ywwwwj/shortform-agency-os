const form = document.querySelector("#projectForm");
const tabs = document.querySelectorAll(".tab");
const views = document.querySelectorAll(".result-view");
const saveProjectBtn = document.querySelector("#saveProjectBtn");
const newProjectBtn = document.querySelector("#newProjectBtn");
const sampleClientBtn = document.querySelector("#sampleClientBtn");
const jumpWebsiteBtn = document.querySelector("#jumpWebsiteBtn");
const projectList = document.querySelector("#projectList");
const projectCount = document.querySelector("#projectCount");
const toast = document.querySelector("#toast");
const briefDrawer = document.querySelector("#briefDrawer");
const drawerBackdrop = document.querySelector("#drawerBackdrop");
const openBriefBtn = document.querySelector("#openBriefBtn");
const closeBriefBtn = document.querySelector("#closeBriefBtn");
const helpDialog = document.querySelector("#helpDialog");
const openHelpBtn = document.querySelector("#openHelpBtn");
const closeHelpBtn = document.querySelector("#closeHelpBtn");
const helpOpenBriefBtn = document.querySelector("#helpOpenBriefBtn");
const activeViewTitle = document.querySelector("#activeViewTitle");
const exportMenuBtn = document.querySelector("#exportMenuBtn");
const exportMenu = document.querySelector("#exportMenu");
const cloudAuthBtn = document.querySelector("#cloudAuthBtn");
const cloudStatus = document.querySelector("#cloudStatus");
const authDialog = document.querySelector("#authDialog");
const closeAuthBtn = document.querySelector("#closeAuthBtn");
const authForm = document.querySelector("#authForm");
const authEmail = document.querySelector("#authEmail");
const authDialogStatus = document.querySelector("#authDialogStatus");
const syncCloudBtn = document.querySelector("#syncCloudBtn");
const importLocalBtn = document.querySelector("#importLocalBtn");
const signOutBtn = document.querySelector("#signOutBtn");
const modeSwitchBtn = document.querySelector("#modeSwitchBtn");
const modeDialog = document.querySelector("#modeDialog");
const feedbackBtn = document.querySelector("#feedbackBtn");
const feedbackDialog = document.querySelector("#feedbackDialog");
const closeFeedbackBtn = document.querySelector("#closeFeedbackBtn");
const feedbackForm = document.querySelector("#feedbackForm");
const emailFeedbackBtn = document.querySelector("#emailFeedbackBtn");
const revisionDialog = document.querySelector("#revisionDialog");
const closeRevisionBtn = document.querySelector("#closeRevisionBtn");
const revisionForm = document.querySelector("#revisionForm");
const performanceDialog = document.querySelector("#performanceDialog");
const closePerformanceBtn = document.querySelector("#closePerformanceBtn");
const performanceForm = document.querySelector("#performanceForm");
const restoreBackupInput = document.querySelector("#restoreBackupInput");

const storageKey = "shortform-studio-projects-v2";
const modeStorageKey = "shortform-content-os-mode-v1";
let projects = loadProjects();
let latestMarkdown = "";
let latestWebsiteHtml = "";
let latestAdvisorReport = "";
let latestRenewalExport = "";
let latestDeliveryPacks = {};
let latestContentLearningExport = "";
let latestContentWorkspaceExport = "";
let latestAiSuggestion = null;
let cloudSyncInProgress = false;
let workspaceMode = localStorage.getItem(modeStorageKey) || "";
let activeContentId = "";
let activeLibraryFilter = "all";
let activeLibraryBrand = "all";
let activeLibraryPlatform = "all";
let activeLibraryFormat = "all";
let latestBrandExtraction = null;
let activeContentComparisonId = "";

function trackUsage(event, metadata = {}) {
  window.ShortFormContentOS?.trackUsage?.(event, metadata);
}

function buildFeedbackEmailHref(input = {}) {
  const subject = "ShortForm Content OS beta feedback";
  const body = [
    "ShortForm Content OS beta feedback",
    "",
    `Role: ${input.role || "Not recorded"}`,
    `Usefulness: ${input.rating || "Not recorded"}/5`,
    `Would pay: ${input.wouldPay || "Not recorded"}`,
    `Workspace mode: ${input.mode || "Not recorded"}`,
    `Content project: ${input.activeContentId || "Not recorded"}`,
    "",
    `Confusing or missing: ${input.blocker || "Not recorded"}`,
    `Reason to reopen: ${input.nextValue || "Not recorded"}`,
    `Quote: ${input.quote || "Not recorded"}`,
  ].join("\n");
  return `mailto:yiwenjun@westlake.edu.cn?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

window.ShortFormContentOS?.migrateLegacyProjects(projects);

if (window.lucide) {
  window.lucide.createIcons();
}

const platformTip = {
  TikTok: "Prioritize the first three seconds, fast cuts, visible tension, and a clear comment or DM prompt.",
  "Instagram Reels": "Prioritize visual polish, captions, creator proof, and save-worthy framing.",
  "YouTube Shorts": "Prioritize retention, simple story arcs, and repeatable series formats.",
  LinkedIn: "Prioritize founder credibility, insight-led clips, and conversion to calls or newsletters.",
  "Multi-platform": "Create one idea, then rewrite hooks and endings for each platform.",
};

const serviceMap = {
  "Short-form management": {
    columns: ["Behind the scenes", "Offer education", "Customer proof", "Founder POV"],
    deliverables: ["content pillars", "monthly topic bank", "scripts", "captions", "weekly report"],
  },
  "UGC ad production": {
    columns: ["Pain point hook", "Product demo", "Creator proof", "Offer CTA"],
    deliverables: ["creator brief", "hook bank", "shot list", "ad variants", "testing notes"],
  },
  "Founder content": {
    columns: ["Founder story", "Strong opinion", "Lesson learned", "Client insight"],
    deliverables: ["positioning notes", "content pillars", "talking points", "clip plan", "DM prompt"],
  },
  "AI content repurposing": {
    columns: ["Long-form clip", "Quote card", "How-to snippet", "Newsletter-to-video"],
    deliverables: ["source audit", "repurposing plan", "short scripts", "posting calendar", "report"],
  },
};

const nextActions = {
  "New lead": ["Send intake questions", "Confirm budget range", "Offer a low-risk starter package"],
  "Proposal sent": ["Follow up within 24 hours", "Add one smaller pilot option", "Ask what would block approval"],
  Won: ["Confirm deposit and timeline", "Collect brand assets", "Generate the first weekly calendar"],
  "In delivery": ["Send progress update", "Record edit notes", "Prepare a weekly report"],
  "Needs report": ["Summarize best performers", "Identify next week's test", "Prepare renewal angle"],
  "Renewal due": ["Send performance summary", "Pitch the next month plan", "Offer an upgrade path"],
  Lost: ["Record the objection", "Adjust pricing or scope", "Add the lead to a future follow-up list"],
};

const actionExplainRules = {
  "Send intake questions": {
    why: "The file is still a lead, so the fastest win is turning uncertainty into usable client memory.",
    risk: "prevents weak briefs, generic scripts, and avoidable revision loops",
    next: "Ask for audience, offer, proof assets, red lines, approval owner, and one success metric.",
  },
  "Confirm budget range": {
    why: "Budget determines whether this should be a diagnosis sprint, organic test, paid creative test, or retainer.",
    risk: "prevents over-scoping before the client has approved a realistic delivery level",
    next: "Offer two ranges with clear deliverables and explain what is excluded from each.",
  },
  "Offer a low-risk starter package": {
    why: "A starter sprint lets the client see the approval and learning loop before committing to volume.",
    risk: "reduces buyer hesitation and protects operator time",
    next: "Package one brief, one hook set, one script batch, and one renewal readout.",
  },
  "Follow up within 24 hours": {
    why: "Proposal-stage deals often stall because the next decision is not named.",
    risk: "reduces ghosting and vague approval delays",
    next: "Ask what would block approval and offer to simplify scope if needed.",
  },
  "Add one smaller pilot option": {
    why: "A smaller option keeps the conversation alive when budget or confidence is uncertain.",
    risk: "reduces lost deals caused by all-or-nothing retainer asks",
    next: "Turn the main package into a one-week proof sprint with one measurable learning goal.",
  },
  "Ask what would block approval": {
    why: "The system needs the real objection before it can recommend the next handoff.",
    risk: "prevents blind revisions and unpriced extra work",
    next: "Ask whether the blocker is budget, proof, scope, brand risk, timing, or internal review.",
  },
  "Confirm deposit and timeline": {
    why: "Won projects need operational clarity before creative work begins.",
    risk: "reduces unpaid production and timeline drift",
    next: "Confirm payment, first asset deadline, approval owner, and revision window.",
  },
  "Collect brand assets": {
    why: "Short-form and UGC output quality depends on proof, scenes, and brand-safe examples.",
    risk: "reduces generic outputs and rights-risky references",
    next: "Collect photos, clips, testimonials, product notes, creator references, and red lines.",
  },
  "Generate the first weekly calendar": {
    why: "A calendar turns the approved strategy into visible delivery.",
    risk: "reduces client anxiety and scattered production",
    next: "Build five posts around one trend mechanic, one proof asset, and one CTA.",
  },
  "Send progress update": {
    why: "In-delivery clients need proof that work is moving before they approve more.",
    risk: "reduces surprise revisions and status-check interruptions",
    next: "Send what is done, what is waiting on approval, and the next decision needed.",
  },
  "Record edit notes": {
    why: "Revision notes become margin defense and next-sprint learning.",
    risk: "reduces repeated subjective edits and unpaid scope changes",
    next: "Classify each request as fix, minor edit, new version, reshoot, or scope change.",
  },
  "Prepare a weekly report": {
    why: "The report connects outputs to learning while the sprint is still fresh.",
    risk: "reduces renewal conversations that rely only on content volume",
    next: "Log winner, loser, approval blocker, and one next experiment.",
  },
  "Summarize best performers": {
    why: "The client needs a simple read on what worked before approving the next cycle.",
    risk: "reduces random ideation and disconnected trend chasing",
    next: "Compare saves, replies, comments, qualified leads, and client feedback.",
  },
  "Identify next week's test": {
    why: "A renewal-ready workflow should always name the next controlled experiment.",
    risk: "reduces vague monthly retainers and unfocused content volume",
    next: "Keep the winning proof mechanism and change one variable: hook, CTA, format, or platform.",
  },
  "Prepare renewal angle": {
    why: "Renewal is easier when framed as the next learning cycle, not more posts.",
    risk: "reduces churn caused by unclear business value",
    next: "Write the next sprint promise, evidence from this cycle, and the approval guardrail.",
  },
  "Send performance summary": {
    why: "Renewal-due clients need proof, not a generic check-in.",
    risk: "reduces price objections and unclear value perception",
    next: "Lead with the strongest result, the biggest learning, and the next experiment.",
  },
  "Pitch the next month plan": {
    why: "A concrete plan turns saved learning into a reason to continue.",
    risk: "reduces renewal friction and one-off project churn",
    next: "Show what stays, what changes, and why the next month should improve.",
  },
  "Offer an upgrade path": {
    why: "A stronger scope is justified only when the learning log shows compounding value.",
    risk: "reduces premature upsells and protects trust",
    next: "Tie the upgrade to reporting, creator sourcing, paid testing, or faster approval ops.",
  },
  "Record the objection": {
    why: "Lost deals still teach positioning, pricing, and proof gaps.",
    risk: "reduces repeated sales mistakes",
    next: "Save the exact objection and tag it as budget, proof, scope, timing, trust, or fit.",
  },
  "Adjust pricing or scope": {
    why: "A loss can mean the package was too broad, too expensive, or poorly explained.",
    risk: "reduces future mismatch between promise and buyer readiness",
    next: "Create a smaller pilot or a clearer setup service before the next outreach batch.",
  },
  "Add the lead to a future follow-up list": {
    why: "Some leads need timing and proof, not more persuasion today.",
    risk: "reduces pushy follow-up and preserves the relationship",
    next: "Follow up with a relevant case note, template update, or proof asset in 2-4 weeks.",
  },
};

const skillDepthMap = {
  Operator: {
    promise: "fast delivery with clear weekly outputs",
    focus: "reduce production chaos and make the next action obvious",
    cadence: "weekly production sprint",
    evidence: "asset checklist, posting log, and basic performance notes",
  },
  Strategist: {
    promise: "better positioning, offer clarity, and creative decisions",
    focus: "decide what to say, who it is for, and which proof should lead",
    cadence: "biweekly strategy review",
    evidence: "positioning memo, objection map, and concept scoring table",
  },
  Advisor: {
    promise: "high-ticket diagnosis, retention, and measurable business learning",
    focus: "turn content activity into customer insight, renewal logic, and next-month decisions",
    cadence: "monthly advisory review",
    evidence: "decision log, retention report, and proprietary client insight library",
  },
};

const testingModeMap = {
  "Organic validation": {
    goal: "find which message earns saves, replies, comments, and profile actions before spending money",
    volume: "6-10 organic posts",
    metric: "reply rate, save rate, profile click, comment quality",
    next: "turn the best organic post into a paid or landing page test",
  },
  "Paid creative test": {
    goal: "identify winning hooks and proof angles with controlled creative variants",
    volume: "8-16 ad variants",
    metric: "thumb-stop rate, CTR, hold rate, cost per lead, comment sentiment",
    next: "scale the best hook-proof pair and kill weak angles quickly",
  },
  "Retainer optimization": {
    goal: "compound learning month by month and make renewal decisions easier",
    volume: "weekly content batch plus monthly strategy review",
    metric: "qualified inbound, lead quality, objection reduction, renewal confidence",
    next: "convert learning into next-month positioning, offers, and content pillars",
  },
};

const maturityMap = {
  Beginner: {
    template: "Neighborhood Loop or the original ViralCraft template",
    strategy: "avoid complexity, sell one clear starter sprint, and focus on proof collection",
    firstWin: "publish simple proof-led assets and get the first qualified reply",
  },
  Growing: {
    template: "ViralCraft Studio or Atelier Proof",
    strategy: "standardize offers, improve proof packaging, and build a repeatable content calendar",
    firstWin: "turn existing proof into 3 repeatable campaign angles",
  },
  Advanced: {
    template: "SignalForge Neon or Conversion Lab",
    strategy: "run controlled creative tests, compare variants, and build a monthly learning loop",
    firstWin: "identify the best hook-proof-CTA combination and document why it won",
  },
};

const sampleClients = {
  nova: {
    clientName: "NovaClips AI",
    industry: "AI short drama studio",
    serviceType: "AI content repurposing",
    templateType: "AI video workflow pack",
    platform: "TikTok",
    audience: "solo founders and small content teams launching AI video channels",
    audienceMemory: "They want repeatable episode formats, fast production, and proof that AI video can become a real offer.",
    goal: "test a new offer",
    tone: "story-driven",
    brandBrain: "Cinematic, direct, founder-friendly, proof-first. Explain the workflow like a production system, not a magic AI trick.",
    redLines: "No copied characters, no copyrighted footage, no fake virality promise, no misleading revenue claims.",
    competitors: "Faceless TikTok drama channels, AI story channels, creator workflow agencies, short-form production studios.",
    maturity: "Growing",
    priorityConstraint: "unclear offer",
    trendSignal: "Trend Remix",
    trendInput: "AI mini drama / faceless story channel / comment-to-episode format",
    budget: "$1,500-$3,000",
    testingMode: "Organic validation",
    testResult: "Comment-led episode ideas got higher saves. Viewers asked for tools, prompts, and behind-the-scenes workflow.",
    winningPattern: "Comment-to-episode hook plus workflow proof and a founder CTA",
    approvalOwner: "Founder",
    approvalState: "Needs client approval",
    revisionReason: "Clarify the offer and avoid making the content look like a gimmick.",
    briefPrepMinutes: "55",
    approvalWaitDays: "3",
    revisionRounds: "3",
    reportPrepMinutes: "40",
    status: "Proposal sent",
    feedback: "Untested",
    skillDepth: "Strategist",
    assets: "Character prompts, voiceover samples, Midjourney references, CapCut templates, 2 sample clips.",
    notes: "Make the workflow repeatable for weekly episodes. Package the result as a productized service.",
  },
  harbor: {
    clientName: "Harbor Coffee",
    industry: "local coffee shop",
    serviceType: "Short-form management",
    templateType: "Client proposal pack",
    platform: "Instagram Reels",
    audience: "students and young professionals within 3 miles",
    audienceMemory: "Students respond to budget-friendly offers, locals save posts about seasonal drinks, and new customers need proof that the cafe is worth a stop.",
    goal: "increase store visits",
    tone: "authentic and casual",
    brandBrain: "Proof-first, concrete, friendly, local, no exaggerated promises. Show real scenes before selling.",
    redLines: "Do not promise viral results. Do not use fake scarcity. Do not copy competitor creators or copyrighted sounds.",
    competitors: "Nearby cafes with strong Reels, student discount campaigns, creator-style drink reviews.",
    maturity: "Beginner",
    priorityConstraint: "weak proof",
    trendSignal: "Reali-TEA",
    trendInput: "summer reset / study cafe / graduation week",
    budget: "$500-$1,500",
    testingMode: "Organic validation",
    testResult: "Variant A got the most saves; customers replied to local proof and student discount framing.",
    winningPattern: "Comment reply plus local proof and a simple student-offer CTA",
    approvalOwner: "Founder",
    approvalState: "Drafting",
    revisionReason: "Do not make the discount the only reason to watch.",
    briefPrepMinutes: "45",
    approvalWaitDays: "2",
    revisionRounds: "2",
    reportPrepMinutes: "30",
    status: "New lead",
    feedback: "Topics worked",
    skillDepth: "Operator",
    assets: "Store photos, menu, product shots, founder can record 2 hours per week.",
    notes: "Avoid hard-selling. Make the content feel useful, local, and easy to act on.",
  },
  glowbar: {
    clientName: "GlowBar Studio",
    industry: "premium beauty UGC studio",
    serviceType: "UGC ad production",
    templateType: "UGC creator brief",
    platform: "Instagram Reels",
    audience: "beauty founders and premium DTC operators",
    audienceMemory: "They care about taste, creator fit, proof quality, and whether the content feels premium enough for paid ads.",
    goal: "generate inbound leads",
    tone: "premium and polished",
    brandBrain: "Elegant, proof-led, calm, editorial, high trust. Avoid noisy trend-chasing.",
    redLines: "No cheap urgency, no exaggerated transformation, no low-quality creator references.",
    competitors: "Premium UGC studios, beauty creator collectives, founder-led skincare brands.",
    maturity: "Advanced",
    priorityConstraint: "needs premium positioning",
    trendSignal: "Emotional ROI",
    trendInput: "beauty ritual / premium proof / before-after confidence",
    budget: "$3,000+",
    testingMode: "Paid creative test",
    testResult: "Transformation proof beat product-only hooks. Founder-led credibility improved qualified inquiries.",
    winningPattern: "Premium ritual hook plus proof asset and calm CTA",
    approvalOwner: "Marketing lead",
    approvalState: "Approved to produce",
    revisionReason: "Keep language premium and avoid discount framing.",
    briefPrepMinutes: "70",
    approvalWaitDays: "4",
    revisionRounds: "3",
    reportPrepMinutes: "50",
    status: "In delivery",
    feedback: "Quote accepted",
    skillDepth: "Advisor",
    assets: "Creator clips, product demo footage, testimonials, before-after assets, brand guidelines.",
    notes: "Position the offer as a premium creative testing system, not generic UGC.",
  },
};

const constraintMap = {
  "low time": "Use fewer formats, tighter approval, and a weekly batch workflow. Do not recommend daily production.",
  "low budget": "Sell diagnosis, organic validation, or a starter sprint before proposing a retainer.",
  "weak proof": "Prioritize testimonials, demos, before/after scenes, and founder credibility before scaling content volume.",
  "unclear offer": "Clarify one audience, one promise, one proof asset, and one CTA before producing scripts.",
  "needs premium positioning": "Reduce noisy trend language. Lead with taste, proof, calm authority, and stronger pricing logic.",
};

const templateFitRules = [
  {
    name: "SaaS Lab",
    path: "./templates/saas-lab/index.html",
    keywords: ["saas", "b2b", "automation", "workflow", "founder", "linkedin", "ai ops", "consultant"],
    reason: "Use this when the client sells expertise, systems, automation, or founder-led B2B demand.",
  },
  {
    name: "Creator Neon",
    path: "./templates/creator-neon/index.html",
    keywords: ["ai video", "creator", "ugc", "drama", "tiktok", "faceless", "shorts", "reels"],
    reason: "Use this when speed, production energy, trend remixing, or AI video workflow is the main signal.",
  },
  {
    name: "Editorial Luxury",
    path: "./templates/editorial-luxury/index.html",
    keywords: ["beauty", "wellness", "fashion", "premium", "luxury", "skincare", "editorial", "polished"],
    reason: "Use this when taste, premium proof, founder trust, and restraint matter more than loud conversion language.",
  },
  {
    name: "Local Growth",
    path: "./templates/local-growth/index.html",
    keywords: ["local", "cafe", "coffee", "restaurant", "clinic", "gym", "salon", "nearby", "visits"],
    reason: "Use this when the buyer needs calls, bookings, visits, local trust, and repeat neighborhood awareness.",
  },
  {
    name: "ViralCraft Original",
    path: "./live-template.html",
    keywords: ["agency", "short-form", "content", "growth", "studio", "campaign"],
    reason: "Use this as the flexible general agency template when the client does not fit a narrower style.",
  },
];

const industryPresetRules = [
  {
    name: "AI Video Studio",
    keywords: ["ai video", "ai drama", "short drama", "faceless", "episode", "midjourney", "runway", "pika"],
    template: "Creator Neon",
    sprint: "$1.5k-$3k",
    proof: ["sample episodes", "prompt stack", "production timeline", "comment-to-episode examples"],
    cta: "DM 'episode' for the production map",
    redFlag: "Do not imply copied characters, copyrighted footage, or guaranteed channel growth.",
  },
  {
    name: "Beauty UGC Studio",
    keywords: ["beauty", "skincare", "makeup", "wellness", "ugc", "creator proof", "transformation"],
    template: "Editorial Luxury",
    sprint: "$1.2k-$3k",
    proof: ["before-after assets", "creator clips", "product ritual shots", "testimonial lines"],
    cta: "Request a premium creative test",
    redFlag: "Avoid cheap urgency, exaggerated transformation claims, and low-quality creator references.",
  },
  {
    name: "Local Cafe or Restaurant",
    keywords: ["cafe", "coffee", "restaurant", "bakery", "local", "nearby", "menu", "visit", "students"],
    template: "Local Growth",
    sprint: "$500-$1.5k",
    proof: ["store photos", "menu clips", "customer moments", "location and offer proof"],
    cta: "Save this for your next visit",
    redFlag: "Do not sell vague awareness. Connect content to visits, bookings, or local search behavior.",
  },
  {
    name: "B2B SaaS Founder Content",
    keywords: ["saas", "b2b", "founder", "linkedin", "automation", "workflow", "consulting", "ai ops"],
    template: "SaaS Lab",
    sprint: "$1.5k-$3k",
    proof: ["demo clips", "sales objections", "case notes", "founder POV clips"],
    cta: "Book a workflow audit",
    redFlag: "Do not write fluffy thought leadership. Tie every post to a buying objection or sales asset.",
  },
  {
    name: "Fitness or Wellness Local",
    keywords: ["fitness", "gym", "pilates", "yoga", "clinic", "wellness", "health", "salon"],
    template: "Local Growth",
    sprint: "$800-$2.4k",
    proof: ["coach clips", "member stories", "facility shots", "booking screenshots"],
    cta: "Book the first session",
    redFlag: "Avoid medical or body-transformation guarantees. Show process, trust, and realistic next steps.",
  },
  {
    name: "Course Creator or Coach",
    keywords: ["course", "coach", "creator", "newsletter", "community", "students", "cohort", "education"],
    template: "ViralCraft Original",
    sprint: "$1k-$3k",
    proof: ["student outcomes", "lesson clips", "community comments", "framework screenshots"],
    cta: "DM 'framework' for the starter map",
    redFlag: "Do not promise income outcomes. Lead with learning proof and clear audience fit.",
  },
  {
    name: "Ecommerce Product Launch",
    keywords: ["ecommerce", "dtc", "shopify", "product launch", "tiktok shop", "product demo", "paid ads"],
    template: "Creator Neon",
    sprint: "$1.2k-$3k",
    proof: ["product demo", "reviews", "use-case clips", "comparison shots"],
    cta: "Comment 'test' for the creative map",
    redFlag: "Do not scale ads without proof angles, offer clarity, and rights-safe creative.",
  },
  {
    name: "Real Estate or Home Service",
    keywords: ["real estate", "realtor", "home service", "contractor", "roofing", "cleaning", "plumbing", "interior"],
    template: "Local Growth",
    sprint: "$800-$2.5k",
    proof: ["before-after jobs", "local trust signals", "client reviews", "process walkthroughs"],
    cta: "Request a local quote",
    redFlag: "Avoid generic lead-gen claims. Use proof, area specificity, and service trust.",
  },
];

const topicTemplates = [
  "Why {industry} content should not only show the product",
  "3 content pillars every {industry} account can start with",
  "How a {industry} brand can build trust from zero",
  "A {tone} way to show the real value of {industry}",
  "The 5 questions {audience} ask before buying",
  "What customers need to know before they contact you",
  "Turn one client story into three short-form posts",
  "How to make one video drive inbound messages",
  "A {platform} title format for {industry}",
  "The lowest-risk content idea to test this week",
];

const trendPlaybooks = {
  "Reali-TEA": {
    brief:
      "Real-life proof is outperforming polished fantasy. Show the everyday moment, the awkward truth, and the human reason the offer matters.",
    adaptation:
      "Use the trend as a documentary wrapper: one real scene, one honest tension, one visible proof point, one simple next step.",
    angles: [
      "The real daily moment behind {industry} that customers never see",
      "A tiny problem {audience} deal with before they ever buy",
      "What a normal day looks like when {clientName} is doing the work",
      "The honest before-and-after of solving this {industry} problem",
      "A customer-proof story that feels useful instead of promotional",
    ],
    hooks: [
      "This is the part of {industry} nobody puts in the ad.",
      "Here is what actually happens before a customer says yes.",
      "If you only see the finished result, you miss this part.",
      "This looks ordinary, but it is why people come back.",
    ],
    proof: ["raw behind-the-scenes clip", "real customer words", "before/after scene", "small operational detail"],
    ctas: ["Comment 'real' for the checklist", "DM 'plan' and I will send the starter version", "Save this before your next visit"],
    risk: "Do not fake vulnerability or manufacture drama. The content should feel observed, not performed.",
  },
  "Curiosity Detour": {
    brief:
      "TikTok search behavior is becoming more exploratory. People arrive with one question, then follow comments, examples, and unexpected rabbit holes.",
    adaptation:
      "Turn the trend into a search-led mini journey: start with a specific question, reveal one surprising detail, then branch into a useful next question.",
    angles: [
      "The question {audience} search before choosing a {industry} solution",
      "A weird but useful rabbit hole connected to {trendInput}",
      "What people get wrong when they compare {industry} options",
      "The comment-section answer that should become a full video",
      "A beginner guide that starts broad and ends with a precise next step",
    ],
    hooks: [
      "I searched this so you do not have to.",
      "This started as one question and turned into a better answer.",
      "The useful detail is hiding in the comments.",
      "Most people search the wrong thing first.",
    ],
    proof: ["search phrase", "comment screenshot recreated as text", "comparison table", "quick demo"],
    ctas: ["Comment your exact question", "Save this as your search shortcut", "DM the word 'map' for the full breakdown"],
    risk: "Do not stuff random hashtags. The detour still needs to connect back to the buyer's actual problem.",
  },
  "Emotional ROI": {
    brief:
      "Shoppers want the purchase to feel justified. The content must explain the emotional return, not only the feature list.",
    adaptation:
      "Connect the product or service to relief, confidence, time saved, identity, ritual, or social proof before asking for a sale.",
    angles: [
      "The small emotional payoff {audience} get after using {clientName}",
      "Why this {industry} purchase feels worth it after the first use",
      "A cost-versus-relief breakdown around {trendInput}",
      "The ritual or identity shift behind the offer",
      "A proof-first video that turns a want into a justified decision",
    ],
    hooks: [
      "The real reason this feels worth paying for is not the feature.",
      "This is what you are actually buying.",
      "If you are trying to justify this purchase, start here.",
      "Here is the emotional ROI in plain English.",
    ],
    proof: ["saved time", "reduced stress", "customer quote", "side-by-side result"],
    ctas: ["Save this if you are comparing options", "DM 'worth it' for the decision checklist", "Comment what would make this feel worth it"],
    risk: "Do not overpromise transformation. Tie the emotion to a specific, believable result.",
  },
  "Community Co-creation": {
    brief:
      "Comments, replies, stitches, and creator participation turn passive viewers into collaborators. The audience helps decide the next asset.",
    adaptation:
      "Build the post so the next video depends on viewer input: answer comments, rank options, invite duets, or let customers choose the next test.",
    angles: [
      "Reply to the comment every {industry} buyer secretly has",
      "Let viewers choose the next {clientName} content test",
      "Turn customer objections into a three-part response series",
      "A stitchable prompt for creators in the {industry} niche",
      "A comment-to-video loop based on {trendInput}",
    ],
    hooks: [
      "Someone asked this in the comments, so here is the honest answer.",
      "Pick which version we should test next.",
      "I am turning the top comment into tomorrow's video.",
      "If you disagree, stitch this with your version.",
    ],
    proof: ["comment prompt", "poll result", "reply video", "viewer-submitted example"],
    ctas: ["Drop the next question below", "Vote A or B in the comments", "Stitch this with your version"],
    risk: "Do not ask for comments without a real loop. The next piece of content should visibly use audience input.",
  },
  "Trend Remix": {
    brief:
      "Fast-moving hashtags, sounds, and formats are useful only when adapted to a niche. Copying the surface trend is weaker than translating the mechanic.",
    adaptation:
      "Identify the trend mechanic, then rewrite it for the client's niche: contrast, reveal, ranking, POV, transformation, or comment response.",
    angles: [
      "Remix {trendInput} into a niche-specific {industry} POV",
      "Use the format to show a before/after transformation",
      "Turn the sound or hashtag into a customer objection video",
      "Make a low-production version that can be posted within 24 hours",
      "Create three hook variants before the trend cools down",
    ],
    hooks: [
      "I am stealing the format, not the idea.",
      "Here is how this trend works for {industry}.",
      "This trend is actually a perfect customer objection format.",
      "Use this while the format is still warm.",
    ],
    proof: ["trend mechanic note", "niche rewrite", "24-hour posting checklist", "variant table"],
    ctas: ["Comment the trend you want remixed", "DM 'remix' for three versions", "Save this before the trend expires"],
    risk:
      "Check music and usage rights before using a sound in paid or client work. When in doubt, copy the structure, not the asset.",
  },
};

function loadProjects() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function persistProjects() {
  localStorage.setItem(storageKey, JSON.stringify(projects));
}

function getData() {
  return Object.fromEntries(new FormData(form).entries());
}

function formatDate(timestamp) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(timestamp || Date.now())
  );
}

function setFormData(data) {
  Object.entries(data).forEach(([key, value]) => {
    const field = form.elements[key];
    if (field) {
      field.value = value;
    }
  });
}

function getCurrentProject() {
  const id = form.elements.projectId.value;
  return projects.find((project) => project.id === id);
}

function getClientKey(data) {
  return `${(data.clientName || "unknown-client").trim().toLowerCase()}::${(data.industry || "unknown-industry")
    .trim()
    .toLowerCase()}`;
}

function splitSignals(value) {
  return (value || "")
    .split(/[.,;\n]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 8);
}

function uniqueList(items, limit = 6) {
  return [...new Set(items.filter(Boolean))].slice(0, limit);
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function getClientProjects(data = getData()) {
  const key = getClientKey(data);
  const current = { ...data, projectId: data.projectId || form.elements.projectId.value, updatedAt: Date.now() };
  const related = projects.filter((project) => getClientKey(project) === key);
  const hasCurrent = related.some((project) => project.id === current.projectId);
  return (hasCurrent ? related : [current, ...related]).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

function getAllLearningEntries(clientProjects) {
  return clientProjects
    .flatMap((project) =>
      (project.learningLog || []).map((entry) => ({
        ...entry,
        projectName: project.templateType || project.serviceType || "Client project",
        projectId: project.id,
      }))
    )
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

function buildClientProfile(data = getData()) {
  const clientProjects = getClientProjects(data);
  const learningEntries = getAllLearningEntries(clientProjects);
  const latest = clientProjects[0] || data;
  const redLines = uniqueList(clientProjects.flatMap((project) => splitSignals(project.redLines)));
  const audienceMemory = uniqueList(clientProjects.flatMap((project) => splitSignals(project.audienceMemory)));
  const proofAssets = uniqueList(clientProjects.flatMap((project) => splitSignals(project.assets)));
  const winningPatterns = uniqueList([
    ...clientProjects.map((project) => project.winningPattern),
    ...learningEntries.map((entry) => entry.winningPattern),
  ]);
  const revisionReasons = uniqueList([
    ...clientProjects.map((project) => project.revisionReason),
    ...learningEntries.map((entry) => entry.revisionReason),
  ]);
  const approvalStates = learningEntries.map((entry) => entry.approvalState).filter(Boolean);
  const blockedCount = approvalStates.filter((state) => state === "Blocked" || state === "Needs client approval").length;
  const memoryDepth = Math.min(100, clientProjects.length * 18 + learningEntries.length * 10 + winningPatterns.length * 8);
  const reuseRule =
    winningPatterns.length > 0
      ? `Start the next pack from "${winningPatterns[0]}" and keep the proof mechanism stable while changing one variable.`
      : "Save one winning hook/proof/CTA pattern before relying on this client profile for reuse.";

  return {
    key: getClientKey(data),
    latest,
    clientProjects,
    learningEntries,
    redLines,
    audienceMemory,
    proofAssets,
    winningPatterns,
    revisionReasons,
    blockedCount,
    memoryDepth,
    reuseRule,
  };
}

function getProjectHistory(data = getData()) {
  const id = data.projectId || form.elements.projectId.value;
  const project = projects.find((item) => item.id === id);
  return project?.learningLog || [];
}

function buildLearningEntry(data, previousProject) {
  const previousLog = previousProject?.learningLog || [];
  const lastEntry = previousLog[0];
  const changed = [];

  if (!lastEntry || lastEntry.winningPattern !== data.winningPattern) changed.push("winning pattern");
  if (!lastEntry || lastEntry.approvalState !== data.approvalState) changed.push("approval state");
  if (!lastEntry || lastEntry.feedback !== data.feedback) changed.push("feedback");
  if (!lastEntry || lastEntry.testResult !== data.testResult) changed.push("latest learning");
  if (
    !lastEntry ||
    ["briefPrepMinutes", "approvalWaitDays", "revisionRounds", "reportPrepMinutes"].some(
      (key) => String(lastEntry[key] ?? "") !== String(data[key] ?? "")
    )
  ) {
    changed.push("efficiency metrics");
  }

  return {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    status: data.status || "New lead",
    feedback: data.feedback || "Untested",
    approvalState: data.approvalState || "Drafting",
    approvalOwner: data.approvalOwner || "Founder",
    testResult: data.testResult || "No test result logged yet.",
    winningPattern: data.winningPattern || "No winner logged yet.",
    revisionReason: data.revisionReason || "No blocker logged yet.",
    briefPrepMinutes: data.briefPrepMinutes || "0",
    approvalWaitDays: data.approvalWaitDays || "0",
    revisionRounds: data.revisionRounds || "0",
    reportPrepMinutes: data.reportPrepMinutes || "0",
    nextDecision: getRenewalDecision(data),
    changed: changed.length ? changed : ["snapshot"],
  };
}

function mergeLearningLog(data, previousProject) {
  const previousLog = previousProject?.learningLog || [];
  const nextEntry = buildLearningEntry(data, previousProject);
  const lastEntry = previousLog[0];
  const isSameAsLast =
    lastEntry &&
    lastEntry.status === nextEntry.status &&
    lastEntry.feedback === nextEntry.feedback &&
    lastEntry.approvalState === nextEntry.approvalState &&
    lastEntry.testResult === nextEntry.testResult &&
    lastEntry.winningPattern === nextEntry.winningPattern &&
    lastEntry.revisionReason === nextEntry.revisionReason &&
    lastEntry.briefPrepMinutes === nextEntry.briefPrepMinutes &&
    lastEntry.approvalWaitDays === nextEntry.approvalWaitDays &&
    lastEntry.revisionRounds === nextEntry.revisionRounds &&
    lastEntry.reportPrepMinutes === nextEntry.reportPrepMinutes;

  return isSameAsLast ? previousLog : [nextEntry, ...previousLog].slice(0, 8);
}

const efficiencyMetricConfig = [
  { key: "briefPrepMinutes", label: "Brief prep", unit: "min", lowerIsBetter: true },
  { key: "approvalWaitDays", label: "Approval wait", unit: "days", lowerIsBetter: true },
  { key: "revisionRounds", label: "Revision rounds", unit: "rounds", lowerIsBetter: true },
  { key: "reportPrepMinutes", label: "Report prep", unit: "min", lowerIsBetter: true },
];

function toMetricNumber(value) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function getEfficiencySnapshot(data) {
  return Object.fromEntries(efficiencyMetricConfig.map((metric) => [metric.key, toMetricNumber(data[metric.key])]));
}

function getEfficiencyComparison(data) {
  const history = getProjectHistory(data)
    .filter((entry) => efficiencyMetricConfig.some((metric) => entry[metric.key] !== undefined))
    .slice()
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  const baseline = history.length ? getEfficiencySnapshot(history[0]) : null;
  const current = getEfficiencySnapshot(data);
  return { baseline, current, snapshots: history.length };
}

function formatMetricAmount(value, unit) {
  const normalizedUnit = value === 1 ? { days: "day", rounds: "round" }[unit] || unit : unit;
  const displayValue = value.toFixed(value % 1 ? 1 : 0);
  return `${displayValue} ${normalizedUnit}`;
}

function describeEfficiencyChange(metric, baseline, current) {
  if (!baseline || baseline <= 0) {
    return { summary: "Baseline pending", detail: "Save this project once to establish an honest starting point.", className: "efficiency-baseline" };
  }

  const delta = baseline - current;
  const percentage = Math.round((Math.abs(delta) / baseline) * 100);
  if (delta > 0) {
    return {
      summary: `${formatMetricAmount(delta, metric.unit)} less`,
      detail: `${percentage}% lower than the first saved snapshot.`,
      className: "efficiency-change",
    };
  }
  if (delta < 0) {
    return {
      summary: `${formatMetricAmount(Math.abs(delta), metric.unit)} more`,
      detail: `${percentage}% higher than the first saved snapshot. Review the blocker before claiming an efficiency gain.`,
      className: "efficiency-baseline",
    };
  }
  return { summary: "No change yet", detail: "Current value matches the first saved snapshot.", className: "efficiency-baseline" };
}

function renderEfficiency(data) {
  const comparison = getEfficiencyComparison(data);
  const timeSaved = comparison.baseline
    ? Math.max(0, comparison.baseline.briefPrepMinutes - comparison.current.briefPrepMinutes) +
      Math.max(0, comparison.baseline.reportPrepMinutes - comparison.current.reportPrepMinutes)
    : 0;
  const improvedMetrics = comparison.baseline
    ? efficiencyMetricConfig.filter((metric) => comparison.current[metric.key] < comparison.baseline[metric.key]).length
    : 0;

  return `
    <h3>Efficiency ledger</h3>
    <p>Measure whether the workspace actually reduces delivery effort. Values are self-reported process metrics, not guaranteed savings.</p>
    <div class="efficiency-strip">
      <article><span>Saved snapshots</span><strong>${comparison.snapshots}</strong><p>${comparison.baseline ? "Compared with the first saved sprint." : "Save this project to establish the baseline."}</p></article>
      <article><span>Tracked time saved</span><strong>${comparison.baseline ? `${timeSaved} min` : "Pending"}</strong><p>Brief preparation plus report preparation only.</p></article>
      <article><span>Metrics improved</span><strong>${comparison.baseline ? `${improvedMetrics} / 4` : "Pending"}</strong><p>No improvement is claimed until a baseline exists.</p></article>
      <article><span>Evidence standard</span><strong>Before / after</strong><p>Use saved snapshots instead of invented ROI percentages.</p></article>
    </div>
    <div class="efficiency-strip">
      ${efficiencyMetricConfig
        .map((metric) => {
          const current = comparison.current[metric.key];
          const baseline = comparison.baseline?.[metric.key];
          const change = describeEfficiencyChange(metric, baseline, current);
          return `
            <article>
              <span>${metric.label}</span>
              <strong class="${change.className}">${change.summary}</strong>
              <p>Current: ${formatMetricAmount(current, metric.unit)}${comparison.baseline ? ` / baseline: ${formatMetricAmount(baseline, metric.unit)}` : ""}</p>
              <p>${change.detail}</p>
            </article>
          `;
        })
        .join("")}
    </div>
    <div class="result-card">
      <h4>How to improve the next sprint</h4>
      <ul>
        <li>Reuse the saved client profile instead of rebuilding the brief.</li>
        <li>Name one approval owner, one deadline, and one revision window before production.</li>
        <li>Classify every request as a fix, minor edit, new version, reshoot, or scope change.</li>
        <li>Generate the renewal report from saved learning while the sprint is still fresh.</li>
      </ul>
    </div>
  `;
}

function setWorkspaceMode(mode) {
  workspaceMode = mode;
  localStorage.setItem(modeStorageKey, mode);
  document.body.dataset.workspaceMode = mode;
  document.querySelectorAll(".agency-only").forEach((element) => {
    element.hidden = mode !== "agency";
  });
  if (openBriefBtn) openBriefBtn.innerHTML = mode === "agency" ? "<span>+</span> Edit client brief" : "<span>+</span> Edit brand context";
  if (openBriefBtn) openBriefBtn.setAttribute("aria-label", mode === "agency" ? "Edit client brief" : "Edit brand context");
  document.querySelector(".form-panel .kicker")?.replaceChildren(document.createTextNode(mode === "agency" ? "Project setup" : "Brand setup"));
  document.querySelector(".form-panel .drawer-head strong")?.replaceChildren(document.createTextNode(mode === "agency" ? "Client context" : "Brand context"));
  document.querySelector(".form-panel .panel-head .kicker")?.replaceChildren(document.createTextNode(mode === "agency" ? "Start from a client or industry preset" : "Start from a Brand or industry preset"));
  document.querySelector(".project-desk h2")?.replaceChildren(document.createTextNode(mode === "agency" ? "Saved client work" : "Saved brand work"));
  if (modeSwitchBtn) modeSwitchBtn.title = mode === "agency" ? "Agency mode: switch workspace mode" : "Brand mode: switch workspace mode";
  if (modeDialog?.open) modeDialog.close();
  if (mode !== "agency" && document.querySelector(".tab.active")?.dataset.target === "clients") activateTab("today");
}

function getBrands() {
  return window.ShortFormContentOS?.listBrands?.() || [];
}

function getCurrentBrand() {
  const data = getData();
  const normalized = `${String(data.clientName || "").trim().toLowerCase()}::${String(data.industry || "").trim().toLowerCase()}`;
  return getBrands().find((brand) => `${brand.name.trim().toLowerCase()}::${brand.category.trim().toLowerCase()}` === normalized) || getBrands()[0] || null;
}

function renderBrandOptions(selectedId) {
  const brands = getBrands();
  return brands.length
    ? brands.map((brand) => `<option value="${brand.id}"${brand.id === selectedId ? " selected" : ""}>${escapeHtml(brand.name)}${brand.category ? ` - ${escapeHtml(brand.category)}` : ""}</option>`).join("")
    : `<option value="">Create a Brand Brain first</option>`;
}

function renderToday() {
  const brands = getBrands();
  const brand = getCurrentBrand();
  const content = window.ShortFormContentOS?.listContent?.({}) || [];
  const drafts = content.filter((item) => ["Idea", "Draft", "Review"].includes(item.status));
  const thisWeek = content.filter((item) => Date.now() - item.updatedAt < 7 * 24 * 60 * 60 * 1000);
  const missing = brand ? window.ShortFormContentOS.missingBrandFields(brand) : ["Create your first Brand Brain"];
  const learning = brand ? window.ShortFormContentOS.getLearning(brand.id) : null;
  const hasContent = content.length > 0;
  const hasResult = content.some((item) => item.status === "Learned" || String(item.performance?.value || "").trim());
  const feedback = window.ShortFormContentOS?.listFeedback?.() || [];
  const usage = window.ShortFormContentOS?.getUsageSummary?.() || { counts: {} };
  const agencyExtra = workspaceMode === "agency"
    ? `<div class="today-agency-grid">
        <article><span>Waiting approval</span><strong>${content.filter((item) => item.status === "Review").length}</strong><p>Content projects currently in review.</p></article>
        <article><span>Needs report</span><strong>${projects.filter((project) => project.status === "Needs report").length}</strong><p>Saved client sprints waiting for a report.</p></article>
        <article><span>Renewal due</span><strong>${projects.filter((project) => project.status === "Renewal due").length}</strong><p>Use saved learning to prepare the next conversation.</p></article>
      </div>`
    : "";
  return `
    <div class="today-hero">
      <span>Today / ${workspaceMode === "agency" ? "Agency mode" : "Brand mode"}</span>
      <h3>${brand ? `${escapeHtml(brand.name)} content system` : "Start your content system"}</h3>
      <p>${brand ? "Use the brand context you have already saved. Create one focused asset, review it, and record the result before creating more volume." : "Create a Brand Brain first. It becomes the context used by every content project."}</p>
      <div class="today-actions">${brand ? '<button type="button" data-content-nav="create">Create content</button><button type="button" data-content-nav="brain">Open Brand Brain</button>' : '<button type="button" data-content-nav="brain">Build Brand Brain first</button>'}<button type="button" data-open-feedback>Record test feedback</button></div>
    </div>
    <section class="today-path" aria-label="Your first content loop">
      <div class="today-path-head"><span>Your repeatable loop</span><strong>${[Boolean(brand), hasContent, hasResult].filter(Boolean).length}/3 complete</strong></div>
      <div class="today-path-steps">
        <button type="button" class="${brand ? "complete" : ""}" data-content-nav="brain"><b>1</b><span><strong>${brand ? "Brand Brain saved" : "Set your Brand Brain"}</strong><small>${brand ? "Your next draft can reuse this context." : "Add audience, offer, voice, and proof once."}</small></span></button>
        <button type="button" class="${hasContent ? "complete" : ""}" data-content-nav="create"${brand ? "" : " disabled"}><b>2</b><span><strong>${hasContent ? "First draft created" : "Create one focused draft"}</strong><small>${hasContent ? "Open it to review, rewrite, or repurpose." : "Use a real customer question or product topic."}</small></span></button>
        <button type="button" class="${hasResult ? "complete" : ""}" data-content-nav="library"${hasContent ? "" : " disabled"}><b>3</b><span><strong>${hasResult ? "Learning captured" : "Record a result"}</strong><small>${hasResult ? "The next test can now build on evidence." : "After publishing, save one result and what changed."}</small></span></button>
      </div>
    </section>
    <div class="today-grid">
      <article><span>To finish</span><strong>${drafts.length}</strong><p>${drafts.length ? "Drafts and reviews waiting for a decision." : "No unfinished content projects."}</p></article>
      <article><span>Recent drafts</span><strong>${thisWeek.length}</strong><p>Content created or updated in the last seven days.</p></article>
      <article><span>This week</span><strong>${content.filter((item) => item.status === "Approved").length}</strong><p>Approved content ready to schedule or publish.</p></article>
      <article><span>Reusable winner</span><strong>${learning?.topHook || "Pending"}</strong><p>${learning ? "Based on saved content outcomes." : "Record one learned project to create a reusable pattern."}</p></article>
      <article><span>Test feedback</span><strong>${feedback.length}</strong><p>${feedback.length ? `${feedback.filter((item) => item.wouldPay === "Yes, now").length} payment-ready response(s) saved locally.` : "Capture the first tester response after one real task."}</p></article>
    </div>
    ${agencyExtra}
    <div class="today-split">
      <article><span>Brand Memory gaps</span><ul>${missing.slice(0, 5).map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li>Brand Brain has the core details needed for a stronger first draft.</li>"}</ul></article>
      <article><span>Recommended next content</span><strong>${learning?.nextTest || "Create a first draft from a real customer question, proof asset, or product topic."}</strong><p>${brand?.winningPatterns ? `Reuse the saved pattern: ${escapeHtml(brand.winningPatterns)}.` : "Keep the first test narrow enough to learn from it."} ${usage.counts.content_created ? `${usage.counts.content_created} content project(s) created on this device.` : ""}</p></article>
    </div>
  `;
}

function renderBrandBrain() {
  const brand = getCurrentBrand() || { id: "", name: "", category: "", positioning: "", audience: "", offer: "", voice: "", proof: "", products: "", prohibitedClaims: "", competitors: "", winningPatterns: "", contentExamples: "", customerObjections: "" };
  const missing = brand.id ? window.ShortFormContentOS.missingBrandFields(brand) : ["Brand positioning", "Audience", "Offer", "Voice", "Proof"];
  return `
    <div class="brain-hero"><span>Brand Brain</span><h3>Give every draft a stable brand context.</h3><p>Brand Brain is not an AI score. It only shows the facts and examples that are missing before a stronger content brief can be generated.</p></div>
    <div class="brain-layout">
      <form class="brand-brain-form" id="brandBrainForm">
        <input type="hidden" name="id" value="${escapeHtml(brand.id)}" />
        <label>Brand name<input name="name" value="${escapeHtml(brand.name)}" required /></label>
        <label>Category / industry<input name="category" value="${escapeHtml(brand.category)}" /></label>
        <label>Brand positioning<textarea name="positioning">${escapeHtml(brand.positioning)}</textarea></label>
        <label>Audience<textarea name="audience">${escapeHtml(brand.audience)}</textarea></label>
        <label>Offer<textarea name="offer">${escapeHtml(brand.offer)}</textarea></label>
        <label>Voice + examples<textarea name="voice">${escapeHtml(brand.voice)}</textarea></label>
        <label>Approved proof<textarea name="proof">${escapeHtml(brand.proof)}</textarea></label>
        <label>Products / services<textarea name="products">${escapeHtml(brand.products)}</textarea></label>
        <label>Prohibited claims<textarea name="prohibitedClaims">${escapeHtml(brand.prohibitedClaims)}</textarea></label>
        <label>Competitors / references<textarea name="competitors">${escapeHtml(brand.competitors)}</textarea></label>
        <label>Winning patterns<textarea name="winningPatterns">${escapeHtml(brand.winningPatterns)}</textarea></label>
        <label>Content examples<textarea name="contentExamples">${escapeHtml(brand.contentExamples)}</textarea></label>
        <label>Customer objections<textarea name="customerObjections">${escapeHtml(brand.customerObjections)}</textarea></label>
        <button class="primary-btn" type="submit">Save Brand Brain</button>
      </form>
      <aside class="brain-sidecar">
        <span>Missing information</span>
        <h4>Complete what helps the next draft.</h4>
        <ul>${missing.map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li>No urgent gaps found.</li>"}</ul>
        <p>Paste old copy, customer feedback, website text, or chat notes below. Local rules can suggest fields from lines such as <strong>Audience: ...</strong>; nothing is saved until you review and submit the form.</p>
        <textarea id="brandMemorySource" class="memory-source" placeholder="Audience: ...\nOffer: ...\nVoice: ...\nProof: ..."></textarea>
        <div class="brain-sidecar-actions"><button type="button" data-brand-action="extract">Suggest fields</button><button type="button" data-brand-action="apply-extraction"${latestBrandExtraction ? "" : " disabled"}>Apply suggestions</button></div>
        ${latestBrandExtraction ? `<div class="extraction-preview"><strong>Suggested fields</strong>${Object.entries(latestBrandExtraction).map(([key, value]) => `<p><b>${escapeHtml(aiFieldLabels[key] || key)}:</b> ${escapeHtml(value)}</p>`).join("")}</div>` : ""}
        <button type="button" data-brand-action="new">Start a new Brand</button>
      </aside>
    </div>
  `;
}

function renderContentOutput(item) {
  if (!item) return `<div class="content-empty"><strong>No content project open</strong><p>Choose a Brand, goal, format, and topic. The first draft will show exactly which Brand Memory it used.</p></div>`;
  const output = item.output;
  const versions = item.versions || [];
  const latestVersion = versions.at(-1);
  const previousVersion = versions.at(-2);
  const comparison = activeContentComparisonId === item.id && previousVersion && latestVersion
    ? `<article class="content-version-compare"><span>Latest change</span><div><strong>${escapeHtml(previousVersion.label)}</strong><p><b>Hook:</b> ${escapeHtml(previousVersion.output?.hooks?.[0] || "No hook saved")}</p><p><b>CTA:</b> ${escapeHtml(previousVersion.output?.cta || "No CTA saved")}</p></div><div><strong>${escapeHtml(latestVersion.label)}</strong><p><b>Hook:</b> ${escapeHtml(latestVersion.output?.hooks?.[0] || "No hook saved")}</p><p><b>CTA:</b> ${escapeHtml(latestVersion.output?.cta || "No CTA saved")}</p></div><p class="version-reason"><b>Why it changed:</b> ${escapeHtml(latestVersion.reason || "No reason recorded")}</p></article>`
    : "";
  return `
    <div class="content-output-head"><span>${escapeHtml(item.status)}</span><h4>${escapeHtml(item.topic || "Untitled content project")}</h4><p>${escapeHtml(output.angle)}</p></div>
    <div class="content-output-grid">
      <article><span>Hooks</span><ol>${output.hooks.map((hook) => `<li>${escapeHtml(hook)}</li>`).join("")}</ol></article>
      <article><span>Caption + CTA</span><p>${escapeHtml(output.caption)}</p><strong>${escapeHtml(output.cta)}</strong></article>
      <article><span>Visual beats</span><ol>${output.visualBeats.map((beat) => `<li>${escapeHtml(beat)}</li>`).join("")}</ol></article>
      <article><span>Repurpose variants</span><ul>${output.repurposeVariants.map((variant) => `<li>${escapeHtml(variant)}</li>`).join("")}</ul></article>
    </div>
    <article class="content-script"><span>Script</span><pre>${escapeHtml(output.script)}</pre></article>
    <div class="content-explain-grid">
      <article><span>Memory used</span><ul>${output.memoryUsed.map((item) => `<li><strong>${escapeHtml(item.type)}</strong>${escapeHtml(item.value)}<small>${escapeHtml(item.reason)}</small></li>`).join("")}</ul></article>
      <article><span>Why this angle</span><p>${escapeHtml(output.why)}</p><span>Assumptions</span><ul>${output.assumptions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>
      <article><span>Possible risks</span><ul>${output.risks.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>
    </div>
    <article class="content-version-history"><span>Version history</span><p>${versions.length} saved version${versions.length === 1 ? "" : "s"}. Every rewrite, repurpose, and result keeps its reason.</p><ol>${versions.slice().reverse().slice(0, 4).map((version) => `<li><strong>${escapeHtml(version.label)}</strong><small>${escapeHtml(version.reason || "No reason recorded")}</small></li>`).join("")}</ol></article>
    ${comparison}
    <div class="content-output-actions"><button type="button" data-content-action="save-memory" data-content-id="${item.id}">Save pattern to Brand Memory</button><button type="button" data-content-action="rewrite" data-content-id="${item.id}">Rewrite with feedback</button><button type="button" data-content-action="repurpose" data-content-id="${item.id}">Repurpose for platform</button>${versions.length > 1 ? `<button type="button" data-content-action="compare" data-content-id="${item.id}">${activeContentComparisonId === item.id ? "Hide version comparison" : "Compare latest version"}</button>` : ""}<button type="button" data-content-action="advance" data-content-id="${item.id}">Move to next status</button></div>
  `;
}

function renderCreateStudio() {
  const brands = getBrands();
  if (!brands.length) {
    return `
      <div class="studio-hero"><span>Content Studio / Local rules</span><h3>Start with a Brand Brain.</h3><p>A local draft needs saved brand context: at minimum a name, audience, offer, voice, or proof. This browser flow does not call an AI model.</p></div>
      <div class="content-empty"><strong>No Brand Brain is ready yet</strong><p>Save one Brand before creating the first content project. The next draft will then show exactly which context it used.</p><div class="today-actions"><button type="button" data-content-nav="brain">Build Brand Brain</button></div></div>
    `;
  }
  const active = activeContentId ? window.ShortFormContentOS.getContent(activeContentId) : null;
  const selectedBrand = active?.brandId || getCurrentBrand()?.id || brands[0]?.id || "";
  return `
    <div class="studio-hero"><span>Content Studio / Local rules</span><h3>Create one on-brand content project.</h3><p>Choose a Brand, goal, format, topic or source material, then create a structured local draft from the Brand Brain you saved. This browser flow does not call an AI model. Long-term Brand Memory changes still require confirmation.</p></div>
    <div class="studio-layout">
      <form class="content-studio-form" id="contentStudioForm">
        <label>1. Choose Brand<select name="brandId" required>${renderBrandOptions(selectedBrand)}</select></label>
        <label>2. Choose goal<select name="objective"><option>Awareness</option><option>Lead</option><option>Sales</option><option>Education</option></select></label>
        <label>3. Choose format<select name="format"><option>Short video</option><option>UGC</option><option>Founder content</option><option>Ad</option><option>Landing page</option></select></label>
        <label>Platform<select name="platform"><option>Instagram Reels</option><option>TikTok</option><option>YouTube Shorts</option><option>LinkedIn</option><option>Multi-platform</option></select></label>
        <label>4. Theme or customer question<textarea name="topic" placeholder="What should this content help the audience understand, decide, or do?"></textarea></label>
        <label>5. Source material<textarea name="sourceMaterial" placeholder="Paste notes, feedback, product details, a customer quote, or a rough idea."></textarea></label>
        <button class="primary-btn" type="submit">Create local content draft</button>
      </form>
      <section class="content-output-panel">${renderContentOutput(active)}</section>
    </div>
  `;
}

function renderContentLibrary() {
  const allItems = window.ShortFormContentOS?.listContent?.({}) || [];
  const items = allItems.filter((item) => activeLibraryFilter === "all" || item.status === activeLibraryFilter).filter((item) => activeLibraryBrand === "all" || item.brandId === activeLibraryBrand).filter((item) => activeLibraryPlatform === "all" || item.platform === activeLibraryPlatform).filter((item) => activeLibraryFormat === "all" || item.format === activeLibraryFormat);
  const brands = getBrands();
  const platforms = [...new Set(allItems.map((item) => item.platform).filter(Boolean))];
  const formats = [...new Set(allItems.map((item) => item.format).filter(Boolean))];
  return `
    <div class="library-hero"><span>Content Library</span><h3>Every draft, decision, version, and result in one place.</h3><p>Content moves through Idea, Draft, Review, Approved, Published, and Learned. Use the same Brand Brain to create the next version without restarting context.</p></div>
    <div class="library-filter-bar"><button type="button" class="${activeLibraryFilter === "all" ? "active" : ""}" data-library-filter="all">All ${allItems.length}</button><button type="button" class="${activeLibraryFilter === "Draft" ? "active" : ""}" data-library-filter="Draft">Draft</button><button type="button" class="${activeLibraryFilter === "Review" ? "active" : ""}" data-library-filter="Review">Review</button><button type="button" class="${activeLibraryFilter === "Published" ? "active" : ""}" data-library-filter="Published">Published</button><button type="button" class="${activeLibraryFilter === "Learned" ? "active" : ""}" data-library-filter="Learned">Learned</button><select data-library-select="brand"><option value="all">All Brands</option>${brands.map((brand) => `<option value="${brand.id}"${activeLibraryBrand === brand.id ? " selected" : ""}>${escapeHtml(brand.name)}</option>`).join("")}</select><select data-library-select="platform"><option value="all">All platforms</option>${platforms.map((platform) => `<option value="${escapeHtml(platform)}"${activeLibraryPlatform === platform ? " selected" : ""}>${escapeHtml(platform)}</option>`).join("")}</select><select data-library-select="format"><option value="all">All formats</option>${formats.map((format) => `<option value="${escapeHtml(format)}"${activeLibraryFormat === format ? " selected" : ""}>${escapeHtml(format)}</option>`).join("")}</select></div>
    <div class="content-library-grid">
      ${items.length ? items.map((item) => {
        const brand = window.ShortFormContentOS.getBrand(item.brandId);
        return `<article data-library-card data-status="${item.status}"><span>${escapeHtml(item.status)} / ${escapeHtml(item.format)}</span><h4>${escapeHtml(item.topic || "Untitled topic")}</h4><p>${escapeHtml(brand?.name || "Unknown brand")} - ${escapeHtml(item.platform)}</p><small>${escapeHtml(item.output?.hooks?.[0] || "No hook")}</small><div><button type="button" data-content-action="open" data-content-id="${item.id}">Open</button><button type="button" data-content-action="duplicate" data-content-id="${item.id}">Duplicate</button><button type="button" data-content-action="rewrite" data-content-id="${item.id}">Rewrite</button><button type="button" data-content-action="repurpose" data-content-id="${item.id}">Repurpose</button><button type="button" data-content-action="advance" data-content-id="${item.id}">Advance</button><button type="button" data-content-action="record-performance" data-content-id="${item.id}">Record result</button></div></article>`;
      }).join("") : `<article class="content-empty"><strong>No content projects yet</strong><p>Create the first content project from a Brand Brain.</p></article>`}
    </div>
  `;
}

function renderContentCalendar() {
  const items = window.ShortFormContentOS?.listContent?.({}) || [];
  const planned = items
    .filter((item) => ["Draft", "Review", "Approved"].includes(item.status))
    .sort((a, b) => {
      if (a.scheduledAt && b.scheduledAt) return a.scheduledAt.localeCompare(b.scheduledAt);
      if (a.scheduledAt) return -1;
      if (b.scheduledAt) return 1;
      return b.updatedAt - a.updatedAt;
    })
    .slice(0, 12);
  return `
    <div class="calendar-hero"><span>Calendar</span><h3>Turn approved ideas into a simple publishing rhythm.</h3><p>Save a local publish date for each project. This does not publish to social platforms; after it goes live, mark it Published or Learned and record the result.</p></div>
    <div class="content-calendar">${planned.length ? planned.map((item, index) => `<article><span>${item.scheduledAt ? `Planned ${escapeHtml(item.scheduledAt)}` : `Backlog ${index + 1}`}</span><strong>${escapeHtml(item.topic || "Untitled content")}</strong><p>${escapeHtml(item.format)} / ${escapeHtml(item.platform)} / ${escapeHtml(item.status)}</p><label class="calendar-schedule-label">Publish date<input type="date" data-schedule-input="${item.id}" value="${escapeHtml(item.scheduledAt || "")}" /></label><div class="calendar-actions"><button type="button" data-content-action="schedule" data-content-id="${item.id}">${item.scheduledAt ? "Update date" : "Add to calendar"}</button>${item.scheduledAt ? `<button type="button" data-content-action="unschedule" data-content-id="${item.id}">Remove date</button>` : ""}<button type="button" data-content-action="advance" data-content-id="${item.id}">Move forward</button></div></article>`).join("") : `<article><strong>No content in the publishing queue</strong><p>Create a draft, review it, then save a publish date here.</p></article>`}</div>
  `;
}

function renderLearning() {
  const brands = getBrands();
  const brand = getCurrentBrand() || brands[0];
  const learning = brand ? window.ShortFormContentOS.getLearning(brand.id) : { total: 0, learned: 0, topHook: "Pending", topCta: "Pending", revisions: [], nextTest: "Create a Brand and publish one piece of content first." };
  return `
    <div class="learning-hero"><span>Learning Memory</span><h3>Let content decisions compound.</h3><p>Start with manually entered results. The goal is not a fake performance score; it is remembering which hooks, proof, CTA, and themes survived real review and publication.</p></div>
    <div class="learning-grid"><article><span>Content projects</span><strong>${learning.total}</strong><p>Created for this Brand.</p></article><article><span>Published or learned</span><strong>${learning.learned}</strong><p>Items with a real outcome to review.</p></article><article><span>Repeated hook</span><strong>${escapeHtml(learning.topHook)}</strong><p>Most often retained opening pattern.</p></article><article><span>Repeated CTA</span><strong>${escapeHtml(learning.topCta)}</strong><p>CTA retained in completed content.</p></article></div>
    <div class="learning-detail-grid"><article><span>Revision signals</span><ul>${learning.revisions.length ? learning.revisions.map((item) => `<li>${escapeHtml(item)}</li>`).join("") : "<li>No revision reasons recorded yet.</li>"}</ul></article><article><span>Next test</span><strong>${escapeHtml(learning.nextTest)}</strong><p>When performance exists, compare one variable at a time instead of producing unrelated variations.</p></article></div>
  `;
}

function renderApprovals(data) {
  const content = window.ShortFormContentOS?.listContent?.({}) || [];
  const review = content.filter((item) => item.status === "Review");
  return `
    <div class="agency-screen-hero"><span>Agency mode / Approvals</span><h3>Keep client review separate from content creation.</h3><p>Only available in Agency mode. Use approval state, revision reason, and owner to stop unbounded changes before they become production work.</p></div>
    <div class="today-agency-grid"><article><span>In review</span><strong>${review.length}</strong><p>Content projects awaiting a decision.</p></article><article><span>Blocked client sprints</span><strong>${projects.filter((project) => project.approvalState === "Blocked").length}</strong><p>Saved projects needing an owner or next decision.</p></article><article><span>Current bottleneck</span><strong>${escapeHtml(analyzeApprovalBottleneck(data).type)}</strong><p>${escapeHtml(analyzeApprovalBottleneck(data).next)}</p></article></div>
    ${renderClientOS(data)}
  `;
}

function renderReports(data) {
  return `<div class="agency-screen-hero"><span>Agency mode / Reports</span><h3>Turn learning into the next client conversation.</h3><p>Keep renewal reports, efficiency data, approval history, and delivery packs in the advanced Agency workflow.</p></div>${renderDeliveryPacks(data)}`;
}

function getTrendInput(data) {
  return (data.trendInput || "a live hashtag, sound, comment, or format").trim() || "a live hashtag, sound, comment, or format";
}

function getTrendPlaybook(data) {
  return trendPlaybooks[data.trendSignal] || trendPlaybooks["Trend Remix"];
}

function fill(template, data) {
  return template
    .replaceAll("{clientName}", data.clientName || "the client")
    .replaceAll("{industry}", data.industry || "the niche")
    .replaceAll("{tone}", data.tone || "clear")
    .replaceAll("{audience}", data.audience || "target buyers")
    .replaceAll("{platform}", data.platform || "TikTok")
    .replaceAll("{trendInput}", getTrendInput(data))
    .replaceAll("{trendSignal}", data.trendSignal || "Trend Remix");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1600);
}

function cloudIsReady() {
  return Boolean(window.ShortFormCloud?.configured?.());
}

function setCloudStatus(message, state = "local") {
  if (!cloudStatus) return;
  cloudStatus.textContent = message;
  cloudStatus.dataset.state = state;
}

async function refreshCloudStatus() {
  if (!cloudIsReady()) {
    setCloudStatus("Local mode: saved on this device", "local");
    return;
  }
  try {
    const user = await window.ShortFormCloud.getUser();
    setCloudStatus(user ? `Cloud connected: ${user.email}` : "Cloud ready: sign in to sync", user ? "connected" : "ready");
  } catch {
    setCloudStatus("Cloud unavailable: working locally", "local");
  }
}

async function syncCloudData() {
  if (!cloudIsReady()) throw new Error("Cloud sync has not been configured yet.");
  if (cloudSyncInProgress) return;
  cloudSyncInProgress = true;
  setCloudStatus("Cloud sync in progress...", "syncing");
  try {
    const result = await window.ShortFormCloud.syncContentWorkspace({
      mode: workspaceMode || "brand",
      brands: getBrands(),
      content: window.ShortFormContentOS.listContent({}),
    });
    window.ShortFormContentOS.replaceData(result);
    renderProjectList();
    generate();
    await refreshCloudStatus();
    showToast("Cloud data synced");
  } finally {
    cloudSyncInProgress = false;
  }
}

function downloadText(filename, content, mimeType = "text/markdown;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function buildTestEvidenceExport() {
  const feedback = window.ShortFormContentOS?.listFeedback?.() || [];
  const usage = window.ShortFormContentOS?.getUsageSummary?.() || { total: 0, counts: {} };
  const counts = usage.counts || {};
  const rows = feedback.map((entry, index) => `## Response ${index + 1}\n\n- Date: ${new Date(entry.createdAt).toISOString()}\n- Role: ${entry.role || "Not recorded"}\n- Usefulness: ${entry.rating || "Not recorded"}/5\n- Willingness to pay: ${entry.wouldPay || "Not recorded"}\n- Blocker: ${entry.blocker || "Not recorded"}\n- Reason to reopen: ${entry.nextValue || "Not recorded"}\n- Quote: ${entry.quote || "Not recorded"}`).join("\n\n");
  return `# ShortForm Content OS Test Evidence\n\n## Local usage\n\n- Workspace opens: ${counts.workspace_opened || 0}\n- Content projects created: ${counts.content_created || 0}\n- Performance entries recorded: ${counts.performance_recorded || 0}\n- Exports used: ${counts.export_used || 0}\n- Feedback responses: ${feedback.length}\n- Total tracked events: ${usage.total || 0}\n\n## Feedback responses\n\n${rows || "No feedback responses saved yet."}`;
}

function buildContentLearningExport() {
  const brands = getBrands();
  const sections = brands.map((brand) => {
    const items = window.ShortFormContentOS.listContent({ brandId: brand.id });
    const learning = window.ShortFormContentOS.getLearning(brand.id);
    const missing = window.ShortFormContentOS.missingBrandFields(brand);
    const outcomes = items.filter((item) => String(item.performance?.value || "").trim());
    const revisions = items.filter((item) => String(item.revisionReason || "").trim());
    const projectRows = items.map((item) => {
      const result = item.performance?.value ? `\n  - Result: ${item.performance.metric || "Manual result"}: ${item.performance.value}` : "";
      const lesson = item.performance?.notes ? `\n  - Learning: ${item.performance.notes}` : "";
      const revision = item.revisionReason ? `\n  - Revision reason: ${item.revisionReason}` : "";
      const schedule = item.scheduledAt ? `\n  - Planned publish date: ${item.scheduledAt}` : "";
      return `- ${item.topic || "Untitled content project"} (${item.format || "Content"} / ${item.platform || "Platform"} / ${item.status})${schedule}${result}${lesson}${revision}`;
    }).join("\n") || "- No content projects saved yet.";
    const revisionRows = revisions.map((item) => `- ${item.topic || "Untitled content project"}: ${item.revisionReason}`).join("\n") || "- No revision reasons recorded yet.";
    const outcomeRows = outcomes.map((item) => `- ${item.topic || "Untitled content project"}: ${item.performance.metric || "Manual result"} = ${item.performance.value}${item.performance.notes ? ` (${item.performance.notes})` : ""}`).join("\n") || "- No published results recorded yet.";
    return `## ${brand.name}\n\n### Brand readiness\n\n- Category: ${brand.category || "Not recorded"}\n- Missing context: ${missing.length ? missing.join(", ") : "No urgent gaps recorded"}\n- Saved winning pattern: ${brand.winningPatterns || "No pattern saved yet"}\n\n### Content activity\n\n- Total content projects: ${learning.total}\n- Published or learned projects: ${learning.learned}\n- Reusable hook: ${learning.topHook}\n- Reusable CTA: ${learning.topCta}\n\n### Recorded results\n\n${outcomeRows}\n\n### Revision signals\n\n${revisionRows}\n\n### Next content test\n\n${learning.nextTest}\n\n### Content records\n\n${projectRows}`;
  });
  return `# ShortForm Content OS Brand Learning Report\n\nGenerated locally on ${new Date().toLocaleDateString()}. This report only contains content, feedback, and performance entered on this device.\n\n${sections.join("\n\n") || "No Brand Brains saved yet. Create one before exporting a learning report."}`;
}

function buildContentWorkspaceExport() {
  const brands = getBrands();
  const content = window.ShortFormContentOS.listContent({});
  const rows = content.map((item) => {
    const brand = window.ShortFormContentOS.getBrand(item.brandId);
    const source = item.sourceMaterial ? `\n- Project source: ${item.sourceMaterial}` : "";
    const schedule = item.scheduledAt ? `\n- Planned publish date: ${item.scheduledAt}` : "";
    return `## ${item.topic || "Untitled content project"}\n\n- Brand: ${brand?.name || "Unknown Brand"}\n- Goal: ${item.objective || "Not recorded"}\n- Format: ${item.format || "Not recorded"}\n- Platform: ${item.platform || "Not recorded"}\n- Status: ${item.status || "Draft"}${schedule}\n- Angle: ${item.output?.angle || "Not generated"}\n- Primary hook: ${item.output?.hooks?.[0] || "Not generated"}\n- CTA: ${item.output?.cta || "Not generated"}${source}`;
  }).join("\n\n") || "No content projects saved yet.";
  return `# ShortForm Content OS Workspace Export\n\n## Brands\n\n${brands.map((brand) => `- ${brand.name}${brand.category ? ` (${brand.category})` : ""}`).join("\n") || "No Brand Brains saved yet."}\n\n## Content projects\n\n${rows}\n\n${buildContentLearningExport()}`;
}

function exportItemsForView(viewId = "aidesk") {
  const data = getData();
  const isBrandWorkspace = workspaceMode === "brand";
  const recommendation = {
    today: "test-evidence",
    website: "website-html",
    efficiency: "renewal-report",
    memory: "renewal-report",
    advisor: "renewal-report",
    packs: "learning-report",
    report: "learning-report",
    learning: "learning-report",
    library: "learning-report",
  }[viewId] || "client-delivery-pack";
  const items = [
    { key: "copy-workspace", label: isBrandWorkspace ? "Copy Brand workspace" : "Copy workspace", detail: "Copy the full structured workspace", recommended: recommendation === "copy-workspace" },
    { key: "client-delivery-pack", label: isBrandWorkspace ? "Brand workspace pack" : "Client delivery pack", detail: isBrandWorkspace ? "Download Brand, content, and Learning records as Markdown" : "Download all workspace outputs as Markdown", recommended: recommendation === "client-delivery-pack" },
    { key: "website-html", label: "Website HTML", detail: "Download the generated landing page", recommended: recommendation === "website-html" },
    { key: "renewal-report", label: "Renewal report", detail: "Download the current renewal advisor report", recommended: recommendation === "renewal-report" },
    { key: "learning-report", label: "Learning report", detail: isBrandWorkspace ? "Download content results, revision signals, and the next test" : "Download monthly learning and approval analysis", recommended: recommendation === "learning-report" },
    { key: "test-evidence", label: "Test evidence", detail: "Download local product feedback and usage evidence", recommended: recommendation === "test-evidence" },
    { key: "backup-all", label: "Backup all client data", detail: "Download a JSON backup of this device", recommended: recommendation === "backup-all" },
    { key: "restore-backup", label: "Restore local backup", detail: "Replace this device data from a JSON backup", recommended: false },
  ];
  return { data, items };
}

function renderExportMenu(viewId) {
  if (!exportMenu) return;
  const { items } = exportItemsForView(viewId);
  exportMenu.innerHTML = `
    <p class="export-menu-label">Recommended for this view</p>
    ${items
      .map(
        (item) => `
          <button class="export-menu-item${item.recommended ? " recommended" : ""}" type="button" data-export-action="${item.key}">
            <strong>${item.label}${item.recommended ? " <span>Recommended</span>" : ""}</strong>
            <small>${item.detail}</small>
          </button>
        `
      )
      .join("")}
  `;
}

async function recordCloudExport(type) {
  try {
    await window.ShortFormCloud?.recordExport?.(activeContentId ? window.ShortFormContentOS.getContent(activeContentId) : null, type);
  } catch {
    // Export remains local when cloud telemetry is unavailable.
  }
}

async function runExport(action) {
  const data = getData();
  const filename = data.clientName || "client";
  if (action === "copy-workspace") {
    await navigator.clipboard.writeText(workspaceMode === "brand" ? latestContentWorkspaceExport : latestMarkdown);
    showToast("Workspace copied");
  }
  if (action === "client-delivery-pack") {
    downloadText(`${filename}-client-delivery-pack.md`, workspaceMode === "brand" ? latestContentWorkspaceExport : latestMarkdown);
    showToast("Client delivery pack downloaded");
  }
  if (action === "website-html") {
    downloadWebsiteHtml();
  }
  if (action === "renewal-report") {
    downloadText(`${filename}-renewal-advisor-report.md`, latestAdvisorReport);
    showToast("Renewal report downloaded");
  }
  if (action === "learning-report") {
    downloadText(`${filename}-brand-learning-report.md`, workspaceMode === "brand" ? latestContentLearningExport : latestDeliveryPacks.monthly || latestRenewalExport);
    showToast("Learning report downloaded");
  }
  if (action === "test-evidence") {
    downloadText(`shortform-content-os-test-evidence-${new Date().toISOString().slice(0, 10)}.md`, buildTestEvidenceExport());
    showToast("Test evidence downloaded");
  }
  if (action === "backup-all") {
    const backup = { legacyProjects: projects, contentOS: window.ShortFormContentOS?.exportData?.() || {} };
    downloadText(`shortform-content-os-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(backup, null, 2), "application/json;charset=utf-8");
    showToast("Local workspace backup downloaded");
  }
  if (action === "restore-backup") {
    restoreBackupInput.value = "";
    restoreBackupInput.click();
    return;
  }
  trackUsage("export_used", { action });
  recordCloudExport(action);
}

function activateTab(targetId) {
  tabs.forEach((item) => item.classList.toggle("active", item.dataset.target === targetId));
  views.forEach((view) => view.classList.toggle("active", view.id === targetId));
  const activeTab = [...tabs].find((item) => item.dataset.target === targetId);
  if (activeTab && activeViewTitle) activeViewTitle.textContent = activeTab.textContent.trim();
  renderExportMenu(targetId);
  trackUsage("view_opened", { view: targetId, mode: workspaceMode || "brand" });
}

function openBriefDrawer() {
  briefDrawer.classList.add("open");
  briefDrawer.setAttribute("aria-hidden", "false");
  drawerBackdrop.hidden = false;
  document.body.classList.add("drawer-open");
  window.setTimeout(() => briefDrawer.querySelector("input, select, textarea")?.focus(), 120);
}

function closeBriefDrawer() {
  briefDrawer.classList.remove("open");
  briefDrawer.setAttribute("aria-hidden", "true");
  drawerBackdrop.hidden = true;
  document.body.classList.remove("drawer-open");
  openBriefBtn.focus();
}

function activateHashTab() {
  const targetId = window.location.hash.replace("#", "");
  if (targetId && document.querySelector(`#${targetId}`)) {
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    activateTab(targetId);
    window.requestAnimationFrame(() => {
      history.replaceState(null, "", `#${targetId}`);
      window.scrollTo(0, 0);
    });
  }
}

function renderProjectList() {
  projectCount.textContent = `${projects.length} saved items`;
  const currentId = form.elements.projectId.value;
  projectList.innerHTML = "";

  if (projects.length === 0) {
    projectList.innerHTML = `<div class="project-item"><strong>No saved projects yet</strong><span>Generate, then save</span></div>`;
    return;
  }

  projects
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .forEach((project) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `project-item${project.id === currentId ? " active" : ""}`;
      const memoryCount = project.learningLog?.length || 0;
      button.innerHTML = `
        <strong>${project.clientName || "Untitled client"}</strong>
        <span>${project.industry || "No niche"}</span>
        <span>${project.trendSignal || "No trend"}</span>
        <span>${project.status || "New lead"}</span>
        <span>${memoryCount} memory ${memoryCount === 1 ? "log" : "logs"}</span>
      `;
      button.addEventListener("click", () => {
        setFormData(project);
        generate();
        renderProjectList();
      });
      projectList.appendChild(button);
    });
}

async function saveProject() {
  const data = getData();
  const id = data.projectId || crypto.randomUUID();
  const index = projects.findIndex((project) => project.id === id);
  const previousProject = index >= 0 ? projects[index] : null;
  const learningLog = mergeLearningLog({ ...data, projectId: id }, previousProject);
  const payload = {
    ...data,
    projectId: id,
    id,
    learningLog,
    createdAt: previousProject?.createdAt || Date.now(),
    updatedAt: Date.now(),
  };

  if (index >= 0) {
    projects[index] = payload;
  } else {
    projects.push(payload);
  }

  form.elements.projectId.value = id;
  persistProjects();
  renderProjectList();
  trackUsage("legacy_project_saved", { projectId: id, mode: workspaceMode || "brand" });
  generate();
  showToast("Project saved locally");
  if (cloudIsReady()) {
    window.ShortFormCloud
      .getUser()
      .then((user) => {
        if (user) return syncCloudData();
        return null;
      })
      .catch(() => setCloudStatus("Cloud sync paused: local copy is safe", "local"));
  }
}

function newProject() {
  form.reset();
  form.elements.projectId.value = "";
  form.elements.clientName.value = "New Client";
  form.elements.industry.value = "local service business";
  form.elements.templateType.value = "Client proposal pack";
  form.elements.audience.value = "target buyers";
  form.elements.audienceMemory.value = "List the recurring customer triggers, objections, and proof expectations here.";
  form.elements.trendSignal.value = "Trend Remix";
  form.elements.trendInput.value = "graduation / summer reset / TikTok Shop Memorial Day";
  form.elements.trendSource.value = "TikTok Creative Center check + client comments. Save source, date, and fit before using the mechanic.";
  form.elements.rightsCheck.value = "Use owned footage, licensed sounds, or platform-safe commercial assets. Record the AI/video tool and approval owner.";
  form.elements.winningPattern.value = "No winner logged yet";
  form.elements.approvalOwner.value = "Founder";
  form.elements.approvalState.value = "Drafting";
  form.elements.revisionReason.value = "No blocker logged yet.";
  form.elements.briefPrepMinutes.value = "45";
  form.elements.approvalWaitDays.value = "2";
  form.elements.revisionRounds.value = "2";
  form.elements.reportPrepMinutes.value = "30";
  form.elements.assets.value = "Existing photos, product notes, testimonials, and founder clips.";
  form.elements.notes.value = "Make the content useful, clear, and easy to act on.";
  generate();
  renderProjectList();
  showToast("New project created");
}

function loadSampleClient(sampleKey = "nova") {
  const sample = sampleClients[sampleKey] || sampleClients.nova;
  form.reset();
  setFormData({ ...sample, projectId: "" });
  generate();
  activateTab("today");
  renderProjectList();
  showToast(`${sample.clientName} sample loaded`);
}

const aiFieldLabels = {
  positioning: "Brand positioning",
  audience: "Audience",
  offer: "Offer",
  voice: "Voice",
  proof: "Proof",
  products: "Products",
  prohibitedClaims: "Prohibited claims",
  competitors: "Competitors",
  winningPatterns: "Winning patterns",
  contentExamples: "Content examples",
  customerObjections: "Customer objections",
  revisionReason: "Revision reason",
};

function renderAiSuggestion() {
  if (!latestAiSuggestion) return `<div class="ai-empty-state"><strong>No AI suggestion yet</strong><p>Choose one focused job. The AI will return the context it used, its reasoning, uncertainty, and proposed memory updates for you to approve.</p></div>`;
  const suggestion = latestAiSuggestion.suggestion || {};
  return `
    <div class="ai-suggestion-card">
      <span>${escapeHtml(suggestion.title || "AI suggestion")}</span>
      <h4>${escapeHtml(suggestion.summary || "Review this before saving")}</h4>
      <p><strong>Suggestion:</strong> ${escapeHtml(suggestion.suggestion || "No suggestion returned.")}</p>
      <p><strong>Why:</strong> ${escapeHtml(suggestion.reason || "No reasoning returned.")}</p>
      <div class="ai-suggestion-columns">
        <div><strong>Client memory used</strong><ul>${(suggestion.memory_used || []).map((item) => `<li>${escapeHtml(item.type)}: ${escapeHtml(item.value)}<small>${escapeHtml(item.reason)}</small></li>`).join("") || "<li>No saved memory was used.</li>"}</ul></div>
        <div><strong>Model is uncertain about</strong><ul>${(suggestion.uncertainties || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li>No uncertainty was identified.</li>"}</ul></div>
      </div>
      <div class="ai-proposed-updates">
        <strong>Proposed memory updates</strong>
        ${(suggestion.proposed_memory_updates || []).map((item) => `<p><b>${escapeHtml(aiFieldLabels[item.field] || item.field)}:</b> ${escapeHtml(item.value)}<small>${escapeHtml(item.rationale)}</small></p>`).join("") || "<p>No memory changes proposed.</p>"}
      </div>
      <div class="ai-suggestion-actions">
        <button type="button" data-ai-suggestion-action="approve">Approve and save</button>
        <button type="button" data-ai-suggestion-action="reject">Reject suggestion</button>
      </div>
    </div>
  `;
}

function renderCloudAiAssistant() {
  const connected = cloudIsReady();
  return `
    <section class="cloud-ai-assistant">
      <div>
        <span>Cloud AI assistant</span>
        <h4>Use account memory, not a blank prompt.</h4>
        <p>${connected ? "Three focused jobs are ready. Save and sync the current project first, then review every proposed memory update before it becomes permanent." : "Cloud AI is not configured in this deployment yet. The local workspace and BYO-AI prompt remain available."}</p>
      </div>
      <div class="cloud-ai-jobs">
        <button type="button" data-ai-job="intake"${connected ? "" : " disabled"}>Organize client info</button>
        <button type="button" data-ai-job="revision"${connected ? "" : " disabled"}>Analyze revision reasons</button>
        <button type="button" data-ai-job="next-sprint"${connected ? "" : " disabled"}>Recommend next sprint</button>
      </div>
      <div id="aiSuggestionPanel">${renderAiSuggestion()}</div>
    </section>
  `;
}

async function runCloudAiJob(job) {
  if (!cloudIsReady()) {
    authDialog.showModal();
    showToast("Configure cloud sync before using AI jobs");
    return;
  }
  try {
    await syncCloudData();
    const content = activeContentId ? window.ShortFormContentOS.getContent(activeContentId) : null;
    const result = await window.ShortFormCloud.runAi(job, content);
    latestAiSuggestion = { runId: result.runId, job, suggestion: result.suggestion };
    generate();
    activateTab("aidesk");
    showToast("AI suggestion ready for review");
  } catch (error) {
    showToast(error.message || "AI job could not run");
  }
}

async function applyAiSuggestion(approved) {
  if (!latestAiSuggestion) return;
  try {
    if (approved) {
      const content = activeContentId ? window.ShortFormContentOS.getContent(activeContentId) : null;
      const brand = content ? window.ShortFormContentOS.getBrand(content.brandId) : getCurrentBrand();
      const updates = {};
      for (const update of latestAiSuggestion.suggestion.proposed_memory_updates || []) {
        if (aiFieldLabels[update.field]) updates[update.field] = update.value;
      }
      if (brand) window.ShortFormContentOS.saveBrand({ ...brand, ...updates });
      if (updates.revisionReason && content) window.ShortFormContentOS.updateContent(content.id, { revisionReason: updates.revisionReason });
      await window.ShortFormCloud?.setAiDisposition?.(latestAiSuggestion.runId, "approved");
      if (cloudIsReady()) await syncCloudData();
      showToast("Approved AI updates saved to client memory");
    } else {
      await window.ShortFormCloud?.setAiDisposition?.(latestAiSuggestion.runId, "rejected");
      showToast("AI suggestion rejected; client memory was unchanged");
    }
    latestAiSuggestion = null;
    generate();
    activateTab("aidesk");
  } catch (error) {
    showToast(error.message || "Could not update AI suggestion status");
  }
}

function renderAIDesk(data) {
  const approval = analyzeApprovalBottleneck(data);
  const learning = analyzeLearningLog(data);
  const profile = buildClientProfile(data);
  const trendDecisionCards = getTrendDecisionCards(data);
  const aiHandoffPrompt = `You are helping prepare a client sprint for ${data.clientName}, a ${data.industry}.

Client memory:
- Audience: ${data.audience}
- Buying triggers: ${data.audienceMemory || "No audience memory saved yet."}
- Brand voice: ${data.brandBrain || "No brand rules saved yet."}
- Red lines: ${data.redLines || "No red lines saved yet."}
- Proof assets: ${data.assets || "No proof assets saved yet."}

Current sprint:
- Goal: ${data.goal}
- Platform: ${data.platform}
- Trend evidence: ${data.trendSource || "No trend source logged yet."}
- Rights check: ${data.rightsCheck || "No asset rights check logged yet."}
- Testing mode: ${data.testingMode}
- Latest learning: ${data.testResult || "No learning logged yet."}
- Winning pattern: ${data.winningPattern || "No winner logged yet."}
- Approval state: ${data.approvalOwner || "Founder"} / ${data.approvalState || "Drafting"}
- Revision blocker: ${data.revisionReason || "No blocker logged yet."}

Return:
1. a clean client profile
2. one AI handoff brief
3. one creative test plan
4. one approval checklist
5. one renewal report outline`;
  const trendScoutPrompt = `Act as a social trend scout for ${data.clientName}.

Use fresh signals from TikTok Creative Center, YouTube Culture & Trends, Instagram/Reels observation, Reddit creator discussions, and client comments.
Current source note: ${data.trendSource || "No source note logged yet."}
Current rights note: ${data.rightsCheck || "No rights note logged yet."}

Return a template update table with:
1. Trend source
2. Observed signal
3. Format mechanic
4. Audience fit for ${data.audience}
5. Safe adaptation for ${data.industry}
6. Brand risk or red line
7. Which workspace field to update

Do not copy a meme, sound, or creator directly. Extract the mechanic and rewrite it for the client.`;

  return `
    <div class="ai-desk-hero">
      <span>AI Desk / platform entry</span>
      <h3>Paste notes once. Get a brief, decision reason, and next client action.</h3>
      <p>Use AI Desk as the entry point for messy emails, DMs, trend links, revision notes, and call summaries. The workspace turns them into client memory, output assets, approval logic, learning, and renewal material.</p>
    </div>
    ${renderCloudAiAssistant()}
    <div class="operator-path">
      <article><span>Step 1</span><strong>Paste messy notes</strong><p>Client email, WhatsApp notes, trend link, revision blocker, and any proof assets go into one handoff.</p></article>
      <article><span>Step 2</span><strong>Approve the decision</strong><p>Check why it was recommended, what risk it reduces, and the next action before sending client-facing work.</p></article>
      <article><span>Step 3</span><strong>Export or save learning</strong><p>Send the pack, update the approval tracker, and store the winning pattern for renewal.</p></article>
    </div>
    <div class="decision-explain-panel">
      ${trendDecisionCards
        .map(
          (card) => `
            <article>
              <span>${escapeHtml(card.label)}</span>
              <strong>${escapeHtml(card.title)}</strong>
              <p><b>Why:</b> ${escapeHtml(card.why)}</p>
              <p><b>Risk reduced:</b> ${escapeHtml(card.risk)}</p>
              <p><b>Next action:</b> ${escapeHtml(card.next)}</p>
            </article>
          `
        )
        .join("")}
    </div>
    <div class="ai-desk-grid">
      <article><span>1. Intake cleaner</span><strong>Messy notes -> client profile</strong><p>Use pasted emails, DMs, meeting notes, and briefs to extract audience, offer, proof, red lines, and approval owner.</p></article>
      <article><span>2. AI handoff</span><strong>Profile -> clean AI prompt</strong><p>Send a structured brief into ChatGPT, Claude, Runway, CapCut, or your internal model without losing client context.</p></article>
      <article><span>3. Delivery loop</span><strong>Output -> approval tracker</strong><p>Website, scripts, templates, and calendars remain here as the output layer, but approvals and blockers are recorded.</p></article>
      <article><span>4. Renewal loop</span><strong>Learning -> next sprint</strong><p>Every result becomes a learning log entry, approval diagnosis, and renewal-ready client report.</p></article>
    </div>
    <div class="explainability-grid">
      <article><span>Recommended next action</span><strong>${approval.next}</strong><p>The platform picked this because the current approval signal is ${approval.severity.toLowerCase()} risk and the bottleneck looks like ${approval.type.toLowerCase()}.</p></article>
      <article><span>Revision scope check</span><strong>${approval.type === "Offer clarity" ? "Scope may be unclear" : "Record before revising"}</strong><p>Classify the client request as a fix, minor edit, new version, reshoot, or scope change before doing extra work.</p></article>
      <article><span>Template freshness</span><strong>Refresh weekly</strong><p>Update trend mechanics from social sources, then store only the reusable mechanic, client-safe adaptation, and risk note.</p></article>
    </div>
    <div class="advisor-score-row compact">
      <article><span>Client memory depth</span><strong>${profile.memoryDepth}%</strong><p>${profile.clientProjects.length} saved project(s), ${profile.learningEntries.length} learning cycle(s).</p></article>
      <article><span>Approval risk</span><strong>${approval.severity}</strong><p>${approval.type}: ${approval.next}</p></article>
      <article><span>Next AI job</span><strong>${learning.latest ? "Summarize sprint" : "Clean intake"}</strong><p>${learning.nextExperiment}</p></article>
    </div>
    <div class="ai-job-board">
      <article>
        <span>BYO-AI mode now</span>
        <h4>Copy this platform prompt into your AI tool</h4>
        <pre>${escapeHtml(aiHandoffPrompt)}</pre>
      </article>
      <article>
        <span>Future API mode</span>
        <h4>What the platform should automate later</h4>
        <ul>
          <li>Classify pasted client notes into profile fields.</li>
          <li>Extract learning and revision reasons after each sprint.</li>
          <li>Detect repeated approval bottlenecks across clients.</li>
          <li>Draft renewal reports and next-sprint plans automatically.</li>
        </ul>
      </article>
    </div>
    <div class="decision-explain-panel">
      <article>
        <span>Recommendation</span>
        <strong>${approval.next}</strong>
        <p>${approval.why}</p>
      </article>
      <article>
        <span>Risk reduced</span>
        <strong>${approval.severity} approval risk</strong>
        <p>This keeps production from moving ahead while ${approval.type.toLowerCase()} is still unresolved.</p>
      </article>
      <article>
        <span>Next action</span>
        <strong>Send a tighter handoff</strong>
        <p>${approval.nextFasterMove}</p>
      </article>
    </div>
    <div class="ai-job-board">
      <article>
        <span>Trend refresh prompt</span>
        <h4>Update data templates without rebuilding the app</h4>
        <pre>${escapeHtml(trendScoutPrompt)}</pre>
      </article>
      <article>
        <span>Source rhythm</span>
        <h4>Where to refresh signals</h4>
        <ul>
          <li>TikTok Creative Center: hashtags, songs, creators, videos by region and industry.</li>
          <li>YouTube Culture & Trends: broader creator and format shifts.</li>
          <li>Reddit creator communities: revision, pricing, approval, and brief pain.</li>
          <li>Client comments and DMs: questions that should become FAQ, hooks, or proof assets.</li>
        </ul>
      </article>
    </div>
    <h4>Weekly source -> signal -> mechanic -> client-fit -> risk -> field update</h4>
    <table>
      <thead><tr><th>Source</th><th>Signal</th><th>Mechanic</th><th>Client fit</th><th>Risk</th><th>Field update</th></tr></thead>
      <tbody>
        ${getWeeklyTrendRefreshRows(data)
          .map(
            (row) => `
              <tr>
                <td>${row.source}</td>
                <td>${row.signal}</td>
                <td>${row.mechanic}</td>
                <td>${row.fit}</td>
                <td>${row.risk}</td>
                <td>${row.update}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
    <div class="analysis-card">
      <strong>Platform rule</strong>
      <p>Simple enough for daily client work. Explainable enough to trust. Fast enough to update when the market moves.</p>
    </div>
  `;
}

function renderSummary(data) {
  const service = serviceMap[data.serviceType] || serviceMap["Short-form management"];
  return `
    <h3>${data.clientName} project summary</h3>
    <div class="metric-row">
      <div class="metric"><span>Status</span><strong>${data.status}</strong></div>
      <div class="metric"><span>Feedback</span><strong>${data.feedback}</strong></div>
      <div class="metric"><span>Platform</span><strong>${data.platform}</strong></div>
      <div class="metric"><span>Template</span><strong>${data.templateType}</strong></div>
    </div>
    <div class="grid-two">
      <div class="result-card">
        <h4>Positioning</h4>
        <p>Create a <strong>${data.serviceType}</strong> system for <strong>${data.industry}</strong>, focused on <strong>${data.goal}</strong> through <strong>${data.platform}</strong>.</p>
      </div>
      <div class="result-card">
        <h4>Creative direction</h4>
        <p>Use a <strong>${data.tone}</strong> tone for <strong>${data.audience}</strong>. Adapt <strong>${getTrendInput(data)}</strong> through the <strong>${data.trendSignal}</strong> playbook.</p>
      </div>
    </div>
    <h4>Recommended content pillars</h4>
    <ul>${service.columns.map((item) => `<li>${item}</li>`).join("")}</ul>
    <h4>Recommended deliverables</h4>
    <ul>${service.deliverables.map((item) => `<li>${item}</li>`).join("")}</ul>
    <h4>Platform note</h4>
    <p>${platformTip[data.platform]}</p>
    <h4>Available assets</h4>
    <p>${data.assets}</p>
    <h4>Brand brain</h4>
    <p>${data.brandBrain || "No brand voice rules added yet."}</p>
    <h4>Audience memory</h4>
    <p>${data.audienceMemory || "No audience memory saved yet."}</p>
    <h4>Testing mode</h4>
    <p>${data.testingMode || "Organic validation"}</p>
    <h4>Approval state</h4>
    <p>${data.approvalState || "Drafting"} with ${data.approvalOwner || "Founder"} as owner.</p>
    <h4>Constraints</h4>
    <p>${data.notes}</p>
  `;
}

function renderClientProfile(data) {
  const maturity = maturityMap[data.maturity] || maturityMap.Beginner;
  const constraintRule = constraintMap[data.priorityConstraint] || constraintMap["weak proof"];
  const history = getProjectHistory(data);
  const clientProfile = buildClientProfile(data);
  return `
    <div class="profile-hero">
      <span>Persistent client profile</span>
      <h3>${data.clientName} operating memory</h3>
      <p>This profile is what makes the workspace feel like an operating system instead of a one-off prompt. Save it locally, update it after each test, and reuse it in every future generation.</p>
    </div>
    <div class="profile-grid">
      <article><span>Brand voice</span><strong>${data.brandBrain || "No rules yet"}</strong></article>
      <article><span>Red lines</span><strong>${data.redLines || "No red lines yet"}</strong></article>
      <article><span>Audience triggers</span><strong>${data.audienceMemory || "No audience memory yet"}</strong></article>
      <article><span>Competitor references</span><strong>${data.competitors || "No references yet"}</strong></article>
      <article><span>Maturity</span><strong>${data.maturity || "Beginner"}</strong><p>${maturity.strategy}</p></article>
      <article><span>Constraint</span><strong>${data.priorityConstraint || "weak proof"}</strong><p>${constraintRule}</p></article>
      <article><span>Winning pattern</span><strong>${data.winningPattern || "No winner logged yet"}</strong></article>
      <article><span>Latest learning</span><strong>${data.testResult || "No test result logged yet"}</strong></article>
    </div>
    <div class="memory-strip">
      <article><span>Client memory depth</span><strong>${clientProfile.memoryDepth}%</strong><p>${clientProfile.clientProjects.length} reusable project(s)</p></article>
      <article><span>Saved learning cycles</span><strong>${history.length}</strong><p>${history.length ? `Last saved ${formatDate(history[0].createdAt)}` : "Save this project to start the local memory log."}</p></article>
      <article><span>Approval owner</span><strong>${data.approvalOwner || "Founder"}</strong><p>${data.approvalState || "Drafting"}</p></article>
      <article><span>Renewal signal</span><strong>${getRenewalSignal(data)}</strong><p>${getRenewalDecision(data)}</p></article>
    </div>
    <div class="analysis-card">
      <strong>Reusable profile rule</strong>
      <p>${clientProfile.reuseRule}</p>
    </div>
    <form class="profile-editor" id="profileMemoryEditor">
      <div>
        <span>Editable profile memory</span>
        <h4>Update the client brain before the next generation</h4>
        <p>Use this when the client gives feedback, approves a direction, rejects a claim, or reveals a new buying trigger. Apply edits to regenerate outputs, or save them as a new local learning snapshot.</p>
      </div>
      <label>
        Brand Brain / voice rules
        <textarea name="brandBrain">${escapeHtml(data.brandBrain)}</textarea>
      </label>
      <label>
        Audience memory / buying triggers
        <textarea name="audienceMemory">${escapeHtml(data.audienceMemory)}</textarea>
      </label>
      <label>
        Proof assets
        <textarea name="assets">${escapeHtml(data.assets)}</textarea>
      </label>
      <label>
        Brand red lines
        <textarea name="redLines">${escapeHtml(data.redLines)}</textarea>
      </label>
      <label>
        Latest test result / learning
        <textarea name="testResult">${escapeHtml(data.testResult)}</textarea>
      </label>
      <label>
        Winning pattern
        <input name="winningPattern" value="${escapeHtml(data.winningPattern)}" />
      </label>
      <label>
        Revision reason / blocker
        <textarea name="revisionReason">${escapeHtml(data.revisionReason)}</textarea>
      </label>
      <label>
        Approval state
        <select name="approvalState">
          ${["Drafting", "Needs internal review", "Needs client approval", "Approved to produce", "Approved to publish", "Blocked"]
            .map((state) => `<option value="${state}"${(data.approvalState || "Drafting") === state ? " selected" : ""}>${state}</option>`)
            .join("")}
        </select>
      </label>
      <div class="profile-editor-actions">
        <button type="button" data-profile-editor-action="apply">Apply edits to output</button>
        <button type="button" data-profile-editor-action="save">Save as learning snapshot</button>
      </div>
    </form>
    <div class="result-card">
      <h4>How to use this professionally</h4>
      <p>After each client sprint, update the winning pattern, latest learning, objections, proof assets, and approval state. The next generation will become more specific because the memory is no longer generic.</p>
    </div>
  `;
}

function getRenewalSignal(data) {
  if (data.feedback === "Client renewed") return "Strong";
  if (data.status === "Renewal due" || data.feedback === "Quote accepted") return "Ready";
  if (data.feedback === "Client requested edits" || data.approvalState === "Blocked") return "At risk";
  if (data.feedback === "Client churned" || data.status === "Lost") return "Recover";
  return "Building";
}

function getRenewalDecision(data) {
  const testMode = testingModeMap[data.testingMode] || testingModeMap["Organic validation"];
  const signal = getRenewalSignal(data);
  const learning = data.testResult || "No test result logged yet.";
  const winner = data.winningPattern || "No winner logged yet.";

  if (signal === "Strong") {
    return `Recommend renewal with an upgraded learning loop. Use "${winner}" as the next sprint anchor and report progress against ${testMode.metric}.`;
  }

  if (signal === "Ready") {
    return `Pitch the next cycle now. The renewal argument should connect "${learning}" to a tighter ${data.platform} test and a clearer approval workflow.`;
  }

  if (signal === "At risk") {
    return `Do not pitch volume first. Resolve "${data.revisionReason || "the current blocker"}", then propose a smaller proof sprint.`;
  }

  if (signal === "Recover") {
    return "Treat this as a recovery file. Record the objection, preserve useful learning, and follow up later with a narrower offer.";
  }

  return `Keep building evidence. Save one proof asset, one objection, and one result metric before asking for a higher commitment.`;
}

function analyzeApprovalBottleneck(data = getData()) {
  const profile = buildClientProfile(data);
  const text = [
    data.approvalState,
    data.revisionReason,
    data.feedback,
    ...profile.revisionReasons,
    ...profile.learningEntries.map((entry) => entry.revisionReason),
  ]
    .join(" ")
    .toLowerCase();

  const rules = [
    {
      type: "Offer clarity",
      match: /offer|scope|package|pricing|discount|budget|unclear/,
      why: "The client is not fully aligned on what is being sold, what is included, or why the offer is worth approving.",
      next: "Send a one-page scope lock: audience, promise, proof asset, CTA, deliverables, and what is out of scope.",
    },
    {
      type: "Proof gap",
      match: /proof|testimonial|asset|case|result|demo|before|after|credibility/,
      why: "The client likely needs more evidence before approving stronger claims or a bigger sprint.",
      next: "Collect one proof asset before the next revision: customer quote, screenshot, demo clip, or before-after scene.",
    },
    {
      type: "Brand risk",
      match: /brand|tone|premium|cheap|voice|copy|competitor|copyright|claim|viral|fake/,
      why: "The client is protecting brand perception, legal safety, or taste standards.",
      next: "Create a red-line checklist and score each concept against voice, claims, proof, and rights safety before sending.",
    },
    {
      type: "Approval ownership",
      match: /owner|team|internal|approval|blocked|review|stakeholder|client approval/,
      why: "The blocker is probably process-related: unclear owner, too many reviewers, or no approval deadline.",
      next: "Ask for one approval owner, one deadline, and one revision window. Move all taste debates into scoring criteria.",
    },
  ];
  const matched = rules.find((rule) => rule.match.test(text)) || {
    type: "Learning gap",
    why: "The recorded blocker is not specific enough yet, so the system cannot confidently explain the delay.",
    next: "Rewrite the revision reason as: what changed, who requested it, what proof is missing, and what decision is needed.",
  };
  const severity =
    data.approvalState === "Blocked" || profile.blockedCount >= 2
      ? "High"
      : data.approvalState === "Needs client approval" || data.feedback === "Client requested edits"
        ? "Medium"
        : "Low";

  return {
    ...matched,
    severity,
    blockedCount: profile.blockedCount,
    nextFasterMove:
      "Before the next client handoff, send the concept with a decision reason, proof asset, red-line check, and one explicit approval question.",
  };
}

function analyzeLearningLog(data = getData()) {
  const profile = buildClientProfile(data);
  const entries = profile.learningEntries;
  const latest = entries[0];
  const previous = entries[1];
  const changed = uniqueList(entries.flatMap((entry) => entry.changed || []), 8);
  const repeatedRevision =
    profile.revisionReasons.length > 1 && profile.revisionReasons[0].toLowerCase() === profile.revisionReasons[1]?.toLowerCase();
  const improvement =
    latest && previous && latest.winningPattern !== previous.winningPattern
      ? "A new winning pattern was logged. Preserve the proof mechanism and test one new hook variable."
      : latest
        ? "Learning exists, but the next sprint needs a cleaner comparison between winner and challenger."
        : "No saved learning cycle yet. Save the project after the next client touchpoint to create the first compounding loop.";

  return {
    entries,
    latest,
    changed,
    repeatedRevision,
    improvement,
    nextExperiment:
      profile.winningPatterns.length > 0
        ? `Build the next experiment around "${profile.winningPatterns[0]}" and change only one variable: hook, proof, CTA, or platform.`
        : "Run a baseline test and record the first winning pattern before generating more variants.",
  };
}

function explainAction(action, data) {
  const fallback = {
    why: `This follows the current status "${data.status}" and feedback "${data.feedback}".`,
    risk: "reduces stalled delivery and unclear client handoff",
    next: "Write the decision, proof needed, owner, and deadline before moving to production.",
  };
  return actionExplainRules[action] || fallback;
}

function getWeeklyTrendRefreshRows(data) {
  const trendInput = getTrendInput(data);
  const playbook = getTrendPlaybook(data);
  const approval = analyzeApprovalBottleneck(data);
  const trendSource = data.trendSource || "No source note logged yet. Add platform, date, and observed source before delivery.";
  const rightsCheck = data.rightsCheck || "No rights note logged yet. Confirm owned footage, licensed sound, creator usage, and AI-video disclosure needs.";
  return [
    {
      source: "TikTok Creative Center",
      signal: `${trendInput} / ${trendSource}`,
      mechanic: "Convert a live hashtag, sound, creator format, or comment pattern into a repeatable hook/proof structure.",
      fit: `Use only if it supports ${data.audience} and the ${data.goal} goal.`,
      risk: playbook.risk,
      update: "trendInput, trendSignal, trendSource, topic hooks, script opener",
    },
    {
      source: "AI video tool release notes / asset library",
      signal: rightsCheck,
      mechanic: "Log the AI tool, source assets, prompt origin, and commercial-use status before recommending production.",
      fit: `Best when ${data.templateType || "the client pack"} includes AI video, UGC ads, or synthetic B-roll.`,
      risk: "Do not send AI-generated footage or copied creator assets without a documented rights and approval check.",
      update: "rightsCheck, redLines, assets, approval owner",
    },
    {
      source: "YouTube Culture & Trends",
      signal: "Broader creator, fandom, remix, and format behavior",
      mechanic: "Translate the larger culture pattern into a slower, more durable content series.",
      fit: `Best when ${data.clientName} needs explainability beyond one fast trend.`,
      risk: "Do not overfit a broad culture report into a weak client niche.",
      update: "content pillars, calendar series, renewal report context",
    },
    {
      source: "Reddit / creator communities",
      signal: "Approval delays, revision scope confusion, pricing pressure, and hidden labor",
      mechanic: "Turn pain language into approval checklist fields and revision boundaries.",
      fit: `Relevant because current bottleneck reads as ${approval.type}.`,
      risk: "Do not treat anonymous anecdotes as proof. Use them to improve workflow questions.",
      update: "approvalState, revisionReason, redLines, delivery pack notes",
    },
    {
      source: "Client comments, DMs, and review notes",
      signal: data.testResult || "No client-side signal logged yet.",
      mechanic: "Promote repeated questions into FAQ, proof clips, and next-sprint tests.",
      fit: `Best source for client-specific freshness because it comes from ${data.clientName}'s real audience.`,
      risk: "Do not generalize one comment into the whole strategy without a follow-up test.",
      update: "audienceMemory, winningPattern, FAQ pack, renewal decision",
    },
  ];
}

function getTrendDecisionCards(data) {
  const rows = getWeeklyTrendRefreshRows(data);
  const playbook = getTrendPlaybook(data);
  const approval = analyzeApprovalBottleneck(data);
  return [
    {
      label: "Use this trend only if",
      title: data.trendSignal || "Trend Remix",
      why: `The current mechanic is useful when it can support ${data.goal || "the sprint goal"} without breaking brand memory.`,
      risk: playbook.risk,
      next: `Update ${rows[0].update}, then create one hook, one proof beat, and one approval question before generating variants.`,
    },
    {
      label: "Approval shortcut",
      title: approval.next,
      why: approval.why,
      risk: `Reduces ${approval.severity.toLowerCase()} approval risk caused by ${approval.type.toLowerCase()}.`,
      next: approval.nextFasterMove,
    },
    {
      label: "Freshness rule",
      title: "Source -> signal -> mechanic",
      why: "Trend sources change faster than client strategy, so only the reusable mechanic should enter the template.",
      risk: "Prevents copying a meme, sound, or creator surface detail that may be stale, unsafe, or off-brand.",
      next: "Save source, date, signal, mechanic, client fit, risk, and the exact workspace field to update.",
    },
  ];
}

function buildClientLibrary() {
  return Object.values(
    projects.reduce((acc, project) => {
      const key = getClientKey(project);
      acc[key] ||= { key, clientName: project.clientName, industry: project.industry, projects: [], logs: [] };
      acc[key].projects.push(project);
      acc[key].logs.push(...(project.learningLog || []));
      return acc;
    }, {})
  )
    .map((client) => {
      const sortedProjects = client.projects.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      const latest = sortedProjects[0];
      const profile = buildClientProfile(latest);
      const approval = analyzeApprovalBottleneck(latest);
      return {
        ...client,
        projects: sortedProjects,
        latest,
        profile,
        approval,
        updatedAt: latest?.updatedAt || latest?.createdAt || 0,
      };
    })
    .sort((a, b) => b.profile.memoryDepth - a.profile.memoryDepth || b.updatedAt - a.updatedAt);
}

function buildApprovalBottleneckSummary(clients = buildClientLibrary()) {
  const summary = clients.reduce((acc, client) => {
    const key = client.approval.type;
    acc[key] ||= { type: key, count: 0, highRisk: 0, clients: [] };
    acc[key].count += 1;
    if (client.approval.severity !== "Low") acc[key].highRisk += 1;
    acc[key].clients.push(client.clientName || "Untitled client");
    return acc;
  }, {});
  const ranked = Object.values(summary).sort((a, b) => b.highRisk - a.highRisk || b.count - a.count);
  const mostCommon = ranked[0];

  return {
    ranked,
    mostCommon,
    highRiskClients: clients.filter((client) => client.approval.severity !== "Low"),
    recommendation: mostCommon
      ? `Most recurring friction is ${mostCommon.type}. Create one reusable approval checklist for ${mostCommon.clients.slice(0, 3).join(", ")} before producing more assets.`
      : "Save at least one client project to see which approval step slows delivery most often.",
  };
}

function loadSavedClientProfile(projectId) {
  const project = projects.find((item) => item.id === projectId);
  if (!project) return;
  setFormData({ ...project, projectId: project.id });
  renderOutput();
  renderProjectList();
  activateTab("clients");
  showToast(`${project.clientName || "Client"} profile loaded`);
}

function applyClientMemory(projectId) {
  const project = projects.find((item) => item.id === projectId);
  if (!project) return;
  const profile = buildClientProfile(project);
  setFormData({
    clientName: project.clientName,
    industry: project.industry,
    audience: project.audience,
    audienceMemory: profile.audienceMemory.join(". ") || project.audienceMemory,
    brandBrain: project.brandBrain,
    assets: profile.proofAssets.join(". ") || project.assets,
    redLines: profile.redLines.join(". ") || project.redLines,
    winningPattern: profile.winningPatterns[0] || project.winningPattern,
    testResult: profile.learningEntries[0]?.testResult || project.testResult,
    revisionReason: profile.revisionReasons[0] || project.revisionReason,
    approvalOwner: project.approvalOwner,
    approvalState: project.approvalState,
  });
  renderOutput();
  activateTab("profile");
  showToast(`${project.clientName || "Client"} memory applied to the form`);
}

function applyProfileEditor(saveAfterApply = false) {
  const editor = document.querySelector("#profileMemoryEditor");
  if (!editor) return;
  const updates = Object.fromEntries(new FormData(editor).entries());
  setFormData(updates);
  renderOutput();
  activateTab("profile");
  if (saveAfterApply) {
    saveProject();
    showToast("Profile memory saved locally");
  } else {
    showToast("Profile edits applied");
  }
}

function renderLearningTimeline(history) {
  if (!history.length) {
    return `
      <div class="empty-memory">
        <strong>No saved learning cycles yet</strong>
        <p>Click Save project after each sprint. The workspace will keep a local timeline of status, feedback, approval state, winning pattern, and next renewal decision.</p>
      </div>
    `;
  }

  return `
    <div class="learning-timeline">
      ${history
        .map(
          (entry, index) => `
            <article>
              <div class="timeline-marker">${index + 1}</div>
              <div>
                <span>${formatDate(entry.createdAt)} / ${entry.status} / ${entry.feedback}</span>
                <h4>${entry.nextDecision}</h4>
                <p><strong>Learning:</strong> ${entry.testResult}</p>
                <p><strong>Winning pattern:</strong> ${entry.winningPattern}</p>
                <p><strong>Approval:</strong> ${entry.approvalState} by ${entry.approvalOwner}</p>
                <small>Changed: ${entry.changed.join(", ")}</small>
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderClientOS(data) {
  const profile = buildClientProfile(data);
  const approval = analyzeApprovalBottleneck(data);
  const learning = analyzeLearningLog(data);
  const clients = buildClientLibrary();
  const bottlenecks = buildApprovalBottleneckSummary(clients);

  return `
    <div class="client-hero">
      <span>Client-Level Memory</span>
      <h3>${data.clientName} reusable client profile</h3>
      <p>This is the compounding layer: multiple saved projects for the same client are merged into one profile so the next delivery starts from context, not a blank brief.</p>
    </div>

    <div class="client-score-row">
      <article><span>Memory depth</span><strong>${profile.memoryDepth}%</strong><p>${profile.clientProjects.length} project(s), ${profile.learningEntries.length} learning cycle(s)</p></article>
      <article><span>Approval bottleneck</span><strong>${approval.type}</strong><p>${approval.severity} severity</p></article>
      <article><span>Next reuse rule</span><strong>${profile.winningPatterns[0] || "No winner yet"}</strong><p>${profile.reuseRule}</p></article>
    </div>

    <h4>Memory management actions</h4>
    <div class="client-action-panel">
      <article>
        <span>Current profile</span>
        <strong>${data.clientName || "Untitled client"}</strong>
        <p>Edit the form fields on the left, then save the project. The saved profile becomes the source for future client memory.</p>
      </article>
      <article>
        <span>Apply latest memory</span>
        <strong>${profile.latest?.clientName || data.clientName}</strong>
        <p>Use saved audience triggers, proof assets, red lines, and winning patterns as the starting point for the next sprint.</p>
        ${
          profile.latest?.id
            ? `<button type="button" data-client-memory-action="apply" data-client-project-id="${profile.latest.id}">Apply current client memory</button>`
            : `<button type="button" disabled>Save first to apply memory</button>`
        }
      </article>
    </div>

    <div class="client-grid">
      <article>
        <span>Audience memory</span>
        <ul>${(profile.audienceMemory.length ? profile.audienceMemory : [data.audienceMemory || "No audience memory saved yet."]).map((item) => `<li>${item}</li>`).join("")}</ul>
      </article>
      <article>
        <span>Proof assets</span>
        <ul>${(profile.proofAssets.length ? profile.proofAssets : [data.assets || "No proof assets saved yet."]).map((item) => `<li>${item}</li>`).join("")}</ul>
      </article>
      <article>
        <span>Red lines</span>
        <ul>${(profile.redLines.length ? profile.redLines : [data.redLines || "No red lines saved yet."]).map((item) => `<li>${item}</li>`).join("")}</ul>
      </article>
      <article>
        <span>Winning patterns</span>
        <ul>${(profile.winningPatterns.length ? profile.winningPatterns : ["No winning pattern saved yet."]).map((item) => `<li>${item}</li>`).join("")}</ul>
      </article>
    </div>

    <h4>Learning analysis</h4>
    <div class="analysis-card">
      <strong>${learning.improvement}</strong>
      <p>${learning.nextExperiment}</p>
      <p><strong>Changed fields:</strong> ${learning.changed.length ? learning.changed.join(", ") : "No saved changes yet."}</p>
    </div>

    <h4>Approval bottleneck analysis</h4>
    <div class="analysis-card">
      <strong>${approval.severity} / ${approval.type}</strong>
      <p>${approval.why}</p>
      <p><strong>Next faster move:</strong> ${approval.next}</p>
      <p>${approval.nextFasterMove}</p>
    </div>

    <h4>Cross-client approval bottlenecks</h4>
    <div class="bottleneck-grid">
      <article class="bottleneck-lead">
        <span>Most common blocker</span>
        <strong>${bottlenecks.mostCommon?.type || "No saved blockers yet"}</strong>
        <p>${bottlenecks.recommendation}</p>
      </article>
      ${
        bottlenecks.ranked.length
          ? bottlenecks.ranked
              .map(
                (item) => `
                  <article>
                    <span>${item.count} client profile(s)</span>
                    <strong>${item.type}</strong>
                    <p>${item.highRisk} medium/high risk. Seen in: ${item.clients.slice(0, 3).join(", ")}</p>
                  </article>
                `
              )
              .join("")
          : `<article><span>Empty</span><strong>No saved projects yet</strong><p>Save 3-5 real client sprints to discover your most expensive approval delay.</p></article>`
      }
    </div>

    <h4>Saved client profiles</h4>
    <div class="client-list">
      ${
        clients.length
          ? clients
              .map(
                (client) => `
                  <article>
                    <strong>${client.clientName || "Untitled client"}</strong>
                    <span>${client.industry || "No niche"} / ${client.projects.length} project(s) / ${client.logs.length} log(s)</span>
                    <p>${client.profile.reuseRule}</p>
                    <small>Approval: ${client.approval.severity} / ${client.approval.type}</small>
                    <div class="client-card-actions">
                      <button type="button" data-client-memory-action="load" data-client-project-id="${client.latest.id}">Load profile</button>
                      <button type="button" data-client-memory-action="apply" data-client-project-id="${client.latest.id}">Apply memory</button>
                    </div>
                  </article>
                `
              )
              .join("")
          : `<article><strong>No saved client profiles yet</strong><span>Save projects to build reusable client memory.</span></article>`
      }
    </div>
  `;
}

function buildDeliveryPacks(data = getData()) {
  const profile = buildClientProfile(data);
  const approval = analyzeApprovalBottleneck(data);
  const learning = analyzeLearningLog(data);
  const preset = getIndustryPreset(data);
  const playbook = getTrendPlaybook(data);
  const questions = [
    `Why should ${data.audience || "the audience"} care about ${data.clientName || "this offer"} now?`,
    `What proof makes ${data.clientName || "this client"} believable?`,
    `What is the safest first step before buying or booking?`,
    `What objection should the next post answer?`,
    `What should the client avoid saying because of brand red lines?`,
  ];
  const answers = [
    `Because the current goal is ${data.goal}, and the content should connect that goal to a concrete proof moment instead of a generic claim.`,
    profile.proofAssets[0] || data.assets || "Collect a testimonial, demo clip, screenshot, or before-after scene before sending stronger claims.",
    preset.cta,
    profile.revisionReasons[0] || data.revisionReason || "Clarify the offer, proof, and next decision.",
    profile.redLines[0] || data.redLines || preset.redFlag,
  ];
  const faq = `# ${data.clientName} FAQ / Answer Pack

${questions.map((question, index) => `## ${question}\n\n${answers[index]}`).join("\n\n")}

## Reuse rule

${profile.reuseRule}
`;

  const proof = `# ${data.clientName} Proof Content Pack

## Proof assets to collect

${uniqueList([...profile.proofAssets, ...preset.proof], 8).map((item) => `- ${item}`).join("\n")}

## Proof-led content angles

${playbook.angles
  .slice(0, 5)
  .map((angle, index) => `${index + 1}. ${fill(angle, data)}`)
  .join("\n")}

## Proof CTA

${preset.cta}

## Red flag

${preset.redFlag}
`;

  const monthly = `# ${data.clientName} Monthly Learning Report

## Current learning

${learning.improvement}

## Winning pattern

${profile.winningPatterns[0] || data.winningPattern || "No winner logged yet."}

## What changed

${learning.changed.length ? learning.changed.map((item) => `- ${item}`).join("\n") : "- No saved changes yet."}

## Next experiment

${learning.nextExperiment}

## Renewal argument

${getRenewalDecision(data)}
`;

  const approvalPack = `# ${data.clientName} Approval + Revision Summary

## Current approval state

${data.approvalState || "Drafting"} / owner: ${data.approvalOwner || "Founder"}

## Bottleneck

${approval.severity} / ${approval.type}

## Why it is stuck

${approval.why}

## Next faster move

${approval.next}

${approval.nextFasterMove}

## Revision reasons logged

${(profile.revisionReasons.length ? profile.revisionReasons : [data.revisionReason || "No revision reason logged yet."])
  .map((item) => `- ${item}`)
  .join("\n")}
`;

  return {
    faq,
    proof,
    monthly,
    approval: approvalPack,
  };
}

function renderDeliveryPacks(data) {
  const packs = buildDeliveryPacks(data);
  const cards = [
    {
      key: "faq",
      title: "FAQ / Answer Pack",
      body: "Client-ready answers for objections, proof, offer clarity, and red-line-safe messaging.",
    },
    {
      key: "proof",
      title: "Proof Content Pack",
      body: "Proof assets to collect, proof-led angles, CTA, and risk guardrails.",
    },
    {
      key: "monthly",
      title: "Monthly Learning Report",
      body: "What changed, what won, what to test next, and why renewal is justified.",
    },
    {
      key: "approval",
      title: "Approval + Revision Summary",
      body: "Approval state, bottleneck diagnosis, revision reasons, and next faster move.",
    },
  ];

  return `
    <div class="packs-hero">
      <span>Client-Ready Delivery Packs</span>
      <h3>Export the assets buyers can send to clients or teams.</h3>
      <p>These packs turn memory, proof, learning, and approval analysis into handoff documents. This is where the workspace becomes more than generation.</p>
    </div>
    <div class="packs-grid">
      ${cards
        .map(
          (card) => `
            <article>
              <span>${card.key}</span>
              <h4>${card.title}</h4>
              <p>${card.body}</p>
              <div class="pack-actions">
                <button type="button" data-pack-action="copy" data-pack-key="${card.key}">Copy</button>
                <button type="button" data-pack-action="download" data-pack-key="${card.key}">Download</button>
              </div>
            </article>
          `
        )
        .join("")}
    </div>
    <h4>Preview: Monthly Learning Report</h4>
    <pre class="pack-preview">${packs.monthly.replace(/[<>&]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[char])}</pre>
  `;
}

function renderMemory(data) {
  const history = getProjectHistory(data);
  const profile = buildClientProfile(data);
  const approval = analyzeApprovalBottleneck(data);
  const learning = analyzeLearningLog(data);
  const renewalSignal = getRenewalSignal(data);
  const renewalDecision = getRenewalDecision(data);

  return `
    <div class="memory-hero">
      <span>Client Memory + Renewal Engine</span>
      <h3>${data.clientName} repeat-use workspace</h3>
      <p>The workspace becomes valuable after week one because it turns saved projects into a reusable client profile, then uses learning and approval analysis to improve the next handoff.</p>
      <div class="memory-actions">
        <button type="button" data-renewal-action="copy">Copy renewal report</button>
        <button type="button" data-renewal-action="download">Download renewal report</button>
      </div>
    </div>

    <div class="memory-strip">
      <article><span>Client memory depth</span><strong>${profile.memoryDepth}%</strong><p>${profile.clientProjects.length} project(s), ${profile.learningEntries.length} learning cycle(s)</p></article>
      <article><span>Renewal signal</span><strong>${renewalSignal}</strong><p>${data.status || "New lead"} / ${data.feedback || "Untested"}</p></article>
      <article><span>Current winner</span><strong>${data.winningPattern || "No winner logged yet"}</strong><p>${data.testingMode || "Organic validation"}</p></article>
      <article><span>Approval bottleneck</span><strong>${approval.type}</strong><p>${approval.severity} severity</p></article>
    </div>

    <div class="memory-grid">
      <article>
        <span>Brand Brain</span>
        <p>${data.brandBrain || "No voice rules saved yet."}</p>
      </article>
      <article>
        <span>Red lines</span>
        <p>${data.redLines || "No red lines saved yet."}</p>
      </article>
      <article>
        <span>Audience memory</span>
        <p>${data.audienceMemory || "No audience memory saved yet."}</p>
      </article>
      <article>
        <span>Proof assets</span>
        <p>${data.assets || "No proof assets saved yet."}</p>
      </article>
    </div>

    <h4>Learning log</h4>
    ${renderLearningTimeline(history)}

    <h4>Learning analysis</h4>
    <div class="analysis-card">
      <strong>${learning.improvement}</strong>
      <p>${learning.nextExperiment}</p>
    </div>

    <h4>Approval bottleneck</h4>
    <div class="analysis-card">
      <strong>${approval.type}: ${approval.why}</strong>
      <p>${approval.next}</p>
      <p>${approval.nextFasterMove}</p>
    </div>

    <h4>Renewal decision</h4>
    <div class="renewal-card">
      <strong>${renewalDecision}</strong>
      <p>Use this as the client-facing reason to continue: the next month is not "more content"; it is a narrower experiment built from stored learning.</p>
    </div>

    <h4>Next memory update</h4>
    <table>
      <thead><tr><th>Field</th><th>What to add before the next generation</th><th>Why it matters</th></tr></thead>
      <tbody>
        <tr><td>Latest test result</td><td>One concrete metric or observed behavior from the last sprint.</td><td>Turns reporting into a learning loop.</td></tr>
        <tr><td>Winning pattern</td><td>The hook/proof/CTA structure that performed best.</td><td>Lets the OS create better variants next time.</td></tr>
        <tr><td>Revision reason</td><td>The real blocker behind edits or delayed approval.</td><td>Prevents repeated client friction.</td></tr>
        <tr><td>Proof assets</td><td>New screenshots, clips, testimonials, comments, or before-after scenes.</td><td>Improves trust and renewal quality.</td></tr>
      </tbody>
    </table>
  `;
}

function renderGeneratedTemplate(data) {
  const playbook = getTrendPlaybook(data);
  const service = serviceMap[data.serviceType] || serviceMap["Short-form management"];
  const templateType = data.templateType || "Client proposal pack";
  const trendInput = getTrendInput(data);
  const primaryHook = fill(playbook.hooks[0], data);
  const angle = fill(playbook.angles[0], data);

  return `
    <h3>${templateType}</h3>
    <p>This is the customer-facing template generated from the brief. Copy it into Notion, Google Docs, a proposal deck, or your client portal.</p>

    <div class="template-sheet">
      <section>
        <h4>1. Client context</h4>
        <table>
          <tbody>
            <tr><th>Client</th><td>${data.clientName}</td></tr>
            <tr><th>Industry</th><td>${data.industry}</td></tr>
            <tr><th>Audience</th><td>${data.audience}</td></tr>
            <tr><th>Audience memory</th><td>${data.audienceMemory || "No audience memory saved yet."}</td></tr>
            <tr><th>Goal</th><td>${data.goal}</td></tr>
            <tr><th>Platform</th><td>${data.platform}</td></tr>
            <tr><th>Approval owner</th><td>${data.approvalOwner || "Founder"}</td></tr>
            <tr><th>Approval state</th><td>${data.approvalState || "Drafting"}</td></tr>
            <tr><th>Revision reason</th><td>${data.revisionReason || "No blocker logged yet."}</td></tr>
          </tbody>
        </table>
      </section>

      <section>
        <h4>2. Generated offer promise</h4>
        <div class="result-card">
          <p>We will turn <strong>${trendInput}</strong> into a <strong>${data.tone}</strong> ${data.platform} content workflow for <strong>${data.clientName}</strong>, designed to help <strong>${data.audience}</strong> move toward <strong>${data.goal}</strong>.</p>
        </div>
      </section>

      <section>
        <h4>3. Trend-to-template decision</h4>
        <table>
          <tbody>
            <tr><th>Trend mechanic</th><td>${data.trendSignal}</td></tr>
            <tr><th>Adaptation rule</th><td>${playbook.adaptation}</td></tr>
            <tr><th>Best first angle</th><td>${angle}</td></tr>
            <tr><th>Opening hook</th><td>${primaryHook}</td></tr>
            <tr><th>Rights check</th><td>${playbook.risk}</td></tr>
          </tbody>
        </table>
      </section>

      <section>
        <h4>4. Output structure</h4>
        <ul>
          <li><strong>Headline:</strong> ${primaryHook}</li>
          <li><strong>Problem:</strong> ${data.audience} need a faster way to understand why ${data.industry} matters.</li>
          <li><strong>Proof:</strong> Use ${playbook.proof[0]}, ${playbook.proof[1]}, and available assets from the client.</li>
          <li><strong>CTA:</strong> ${playbook.ctas[0]}</li>
          <li><strong>Delivery:</strong> ${service.deliverables.join(", ")}</li>
        </ul>
      </section>

      <section>
        <h4>5. Editable client instructions</h4>
        <ol>
          <li>Replace placeholders with the client's exact product, proof, location, and offer.</li>
          <li>Verify the trend manually inside TikTok or TikTok Creative Center before posting.</li>
          <li>Keep the trend structure, but do not copy protected sounds, creator footage, or competitor assets.</li>
          <li>Export this template as a client proposal, production brief, or weekly content sprint.</li>
        </ol>
      </section>
    </div>
  `;
}

function scoreFromText(text, seed, min = 2, max = 5) {
  const source = `${text || ""}${seed}`;
  const total = [...source].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return min + (total % (max - min + 1));
}

function hasUsefulText(value, minLength = 16) {
  return (value || "").trim().length >= minLength;
}

function getBriefQuality(data) {
  const checks = [
    {
      label: "Specific client and niche",
      passed: hasUsefulText(data.clientName, 3) && hasUsefulText(data.industry, 8),
      fix: "Name the client and define the niche more precisely.",
    },
    {
      label: "Target audience",
      passed: hasUsefulText(data.audience, 18),
      fix: "Define who should buy, follow, visit, book, or reply.",
    },
    {
      label: "Business goal",
      passed: hasUsefulText(data.goal, 8),
      fix: "Choose one business goal instead of asking for general content.",
    },
    {
      label: "Proof assets",
      passed: hasUsefulText(data.assets, 24),
      fix: "Add testimonials, clips, screenshots, demos, founder proof, or before-after assets.",
    },
    {
      label: "Brand Brain and red lines",
      passed: hasUsefulText(data.brandBrain, 24) && hasUsefulText(data.redLines, 24),
      fix: "Add voice rules and do-not-say rules so outputs do not become generic.",
    },
    {
      label: "Learning memory",
      passed: hasUsefulText(data.testResult, 24) && hasUsefulText(data.winningPattern, 16),
      fix: "Log the latest result and the current winning hook/proof/CTA pattern.",
    },
  ];
  const passed = checks.filter((check) => check.passed).length;
  const score = Math.round((passed / checks.length) * 100);
  const status = score >= 84 ? "Ready" : score >= 58 ? "Needs tightening" : "Too vague";

  return { checks, passed, score, status };
}

function getTemplateFit(data) {
  const source = [
    data.clientName,
    data.industry,
    data.serviceType,
    data.templateType,
    data.platform,
    data.audience,
    data.goal,
    data.tone,
    data.brandBrain,
    data.competitors,
    data.notes,
  ]
    .join(" ")
    .toLowerCase();

  const ranked = templateFitRules
    .map((rule) => ({
      ...rule,
      score: rule.keywords.reduce((total, keyword) => total + (source.includes(keyword) ? 1 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score);

  const primary = ranked[0].score > 0 ? ranked[0] : templateFitRules[4];
  const fallback = ranked.find((rule) => rule.name !== primary.name && rule.score > 0) || templateFitRules[4];

  return {
    primary,
    fallback,
    ranked,
    confidence: Math.min(100, 48 + primary.score * 13),
  };
}

function getIndustryPreset(data) {
  const source = [
    data.clientName,
    data.industry,
    data.serviceType,
    data.templateType,
    data.platform,
    data.audience,
    data.goal,
    data.tone,
    data.brandBrain,
    data.competitors,
    data.assets,
    data.notes,
  ]
    .join(" ")
    .toLowerCase();

  const ranked = industryPresetRules
    .map((rule) => ({
      ...rule,
      score: rule.keywords.reduce((total, keyword) => total + (source.includes(keyword) ? 1 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score);

  return ranked[0].score > 0 ? ranked[0] : industryPresetRules[0];
}

function getGenericOutputCheck(data) {
  const issues = [
    {
      label: "Generic audience",
      failed: !hasUsefulText(data.audience, 24) || ["target buyers", "everyone", "customers"].includes((data.audience || "").trim().toLowerCase()),
      fix: "Rewrite the audience as a specific buyer with context, urgency, and buying trigger.",
    },
    {
      label: "Missing proof",
      failed: !hasUsefulText(data.assets, 28),
      fix: "Add proof assets before scaling scripts: testimonial, demo, comment, screenshot, or before-after scene.",
    },
    {
      label: "Weak memory",
      failed: !hasUsefulText(data.testResult, 28) || !hasUsefulText(data.winningPattern, 18),
      fix: "Save one latest learning and one winning pattern so next outputs can improve.",
    },
    {
      label: "No guardrails",
      failed: !hasUsefulText(data.redLines, 24),
      fix: "Add red lines to block fake scarcity, virality promises, copied assets, or off-brand claims.",
    },
    {
      label: "Approval risk",
      failed: data.approvalState === "Blocked" || data.approvalState === "Needs client approval",
      fix: "Resolve approval owner, blocker, and revision reason before producing more variants.",
    },
    {
      label: "Too broad platform plan",
      failed: data.platform === "Multi-platform" && data.priorityConstraint !== "low time",
      fix: "Pick one primary platform for the first test, then adapt the winner.",
    },
  ];
  const failed = issues.filter((issue) => issue.failed);
  const score = Math.max(0, 100 - failed.length * 15);
  const verdict = failed.length === 0 ? "Client-ready" : failed.length <= 2 ? "Revise before sending" : "Reject generic output";

  return { issues, failed, score, verdict };
}

function renderAdvisor(data) {
  const brief = getBriefQuality(data);
  const fit = getTemplateFit(data);
  const preset = getIndustryPreset(data);
  const generic = getGenericOutputCheck(data);
  const approval = analyzeApprovalBottleneck(data);

  return `
    <div class="advisor-hero">
      <span>Advisor Layer</span>
      <h3>Quality gate before you send anything to a client.</h3>
      <p>This is the local rule engine that makes the workspace more than a prompt pack: it scores the brief, recommends the best template, and rejects generic outputs before export.</p>
    </div>

    <div class="advisor-score-row">
      <article><span>Brief Quality</span><strong>${brief.score}%</strong><p>${brief.status}</p></article>
      <article><span>Template Fit</span><strong>${fit.primary.name}</strong><p>${fit.confidence}% confidence</p></article>
      <article><span>Industry Preset</span><strong>${preset.name}</strong><p>${preset.sprint} sprint range</p></article>
    </div>

    <div class="decision-explain-panel">
      <article>
        <span>Recommendation</span>
        <strong>Use ${fit.primary.name}</strong>
        <p>${fit.primary.reason}</p>
      </article>
      <article>
        <span>Risk reduced</span>
        <strong>${generic.verdict}</strong>
        <p>The gate blocks generic outputs, weak proof, missing red lines, and unresolved approval issues before export.</p>
      </article>
      <article>
        <span>Next action</span>
        <strong>${approval.next}</strong>
        <p>${approval.why}</p>
      </article>
    </div>

    <div class="grid-two">
      <div class="result-card">
        <h4>Brief quality checklist</h4>
        <table>
          <thead><tr><th>Check</th><th>Status</th><th>Fix if weak</th></tr></thead>
          <tbody>
            ${brief.checks
              .map((check) => `<tr><td>${check.label}</td><td>${check.passed ? "Pass" : "Needs work"}</td><td>${check.passed ? "Ready to use." : check.fix}</td></tr>`)
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="result-card">
        <h4>Template fit engine</h4>
        <p><strong>Recommended:</strong> ${fit.primary.name}</p>
        <p>${fit.primary.reason}</p>
        <p><strong>Fallback:</strong> ${fit.fallback.name}</p>
        <a class="inline-template-link" href="${fit.primary.path}">Open recommended template</a>
      </div>
    </div>

    <h4>Industry preset pack</h4>
    <div class="preset-card">
      <div>
        <span>${preset.name}</span>
        <h4>${preset.template} / ${preset.sprint}</h4>
        <p><strong>CTA:</strong> ${preset.cta}</p>
        <p><strong>Red flag:</strong> ${preset.redFlag}</p>
      </div>
      <div>
        <strong>Proof assets to collect</strong>
        <ul>${preset.proof.map((item) => `<li>${item}</li>`).join("")}</ul>
      </div>
    </div>

    <h4>Reject Generic Output checker</h4>
    <div class="advisor-score-row compact">
      <article><span>Generic Check</span><strong>${generic.score}%</strong><p>${generic.verdict}</p></article>
    </div>
    <div class="quality-grid">
      ${generic.issues
        .map(
          (issue) => `
            <article class="${issue.failed ? "failed" : "passed"}">
              <span>${issue.failed ? "Fix" : "Pass"}</span>
              <strong>${issue.label}</strong>
              <p>${issue.failed ? issue.fix : "This guardrail is strong enough for the current output."}</p>
            </article>
          `
        )
        .join("")}
    </div>

    <div class="advisor-decision">
      <h4>Send / revise decision</h4>
      <p><strong>${generic.verdict}.</strong> ${
        generic.failed.length
          ? `Fix ${generic.failed.map((issue) => issue.label.toLowerCase()).join(", ")} before sending the client pack.`
          : "This brief has enough specificity, proof, memory, and guardrails to export."
      }</p>
    </div>
  `;
}

function renderSkillOS(data) {
  const playbook = getTrendPlaybook(data);
  const service = serviceMap[data.serviceType] || serviceMap["Short-form management"];
  const depth = skillDepthMap[data.skillDepth] || skillDepthMap.Operator;
  const testMode = testingModeMap[data.testingMode] || testingModeMap["Organic validation"];
  const maturity = maturityMap[data.maturity] || maturityMap.Beginner;
  const constraintRule = constraintMap[data.priorityConstraint] || constraintMap["weak proof"];
  const trendInput = getTrendInput(data);
  const learning = data.testResult || "No test result logged yet. Treat this sprint as a baseline learning cycle.";
  const audienceMemory = data.audienceMemory || "No audience memory saved yet. Capture triggers, objections, and proof expectations after each sprint.";
  const winningPattern = data.winningPattern || "No winner logged yet.";
  const approvalOwner = data.approvalOwner || "Founder";
  const approvalState = data.approvalState || "Drafting";
  const revisionReason = data.revisionReason || "No blocker logged yet.";
  const brief = getBriefQuality(data);
  const fit = getTemplateFit(data);
  const preset = getIndustryPreset(data);
  const generic = getGenericOutputCheck(data);
  const scores = {
    demand: scoreFromText(data.industry, "demand"),
    proof: scoreFromText(data.assets, "proof"),
    urgency: scoreFromText(data.goal, "urgency"),
    distribution: scoreFromText(data.platform, "distribution"),
  };
  const total = scores.demand + scores.proof + scores.urgency + scores.distribution;
  const decision =
    total >= 17
      ? "Greenlight a paid sprint. The client has enough demand, proof, and urgency to justify a concrete offer."
      : total >= 13
        ? "Sell a smaller diagnostic sprint first. The offer has potential, but proof or urgency needs tightening."
        : "Do not sell a full package yet. Run discovery, collect proof, and narrow the audience before pitching.";
  const risk =
    data.feedback === "Client churned" || data.status === "Lost"
      ? "Retention risk is high. Lead with diagnosis and learning, not volume promises."
      : data.feedback === "Client requested edits"
        ? "Scope risk is present. Define approval checkpoints and what counts as one revision."
        : "Main risk is generic output. Protect value by using the decision rules and data log below.";

  return `
    <div class="skill-hero">
      <span>Proprietary Skill OS</span>
      <h3>${data.clientName} retention-grade operating system</h3>
      <p>This is the layer generic AI tools do not give by default: personalized diagnosis, decision rules, brand memory, SOP, client data capture, and renewal logic for ${data.serviceType}.</p>
    </div>

    <div class="skill-score-grid">
      <article><span>Demand clarity</span><strong>${scores.demand}/5</strong><p>Is the buyer pain specific and visible?</p></article>
      <article><span>Proof readiness</span><strong>${scores.proof}/5</strong><p>Do we have assets, testimonials, scenes, or product evidence?</p></article>
      <article><span>Urgency</span><strong>${scores.urgency}/5</strong><p>Is there a business reason to act this month?</p></article>
      <article><span>Distribution fit</span><strong>${scores.distribution}/5</strong><p>Does ${data.platform} match the audience behavior?</p></article>
    </div>

    <div class="skill-decision">
      <h4>1. Go / no-go decision</h4>
      <p><strong>${decision}</strong></p>
      <p>${risk}</p>
    </div>

    <div class="advisor-score-row compact">
      <article><span>Brief quality</span><strong>${brief.score}%</strong><p>${brief.status}</p></article>
      <article><span>Template fit</span><strong>${fit.primary.name}</strong><p>${fit.primary.reason}</p></article>
      <article><span>Industry preset</span><strong>${preset.name}</strong><p>${preset.sprint} / ${preset.cta}</p></article>
      <article><span>Generic output</span><strong>${generic.verdict}</strong><p>${generic.failed.length ? `${generic.failed.length} issue(s) to fix.` : "Ready to export."}</p></article>
    </div>

    <div class="grid-two">
      <div class="result-card">
        <h4>2. Skill promise</h4>
        <p>At the <strong>${data.skillDepth}</strong> level, sell <strong>${depth.promise}</strong>. The goal is to ${depth.focus}.</p>
      </div>
      <div class="result-card">
        <h4>3. Operating cadence</h4>
        <p>Run this as a <strong>${depth.cadence}</strong>. Required evidence: ${depth.evidence}.</p>
      </div>
    </div>

    <h4>4. Personalized advisor profile</h4>
    <div class="advisor-grid">
      <article><span>Maturity</span><strong>${data.maturity || "Beginner"}</strong><p>${maturity.strategy}.</p></article>
      <article><span>Best template fit</span><strong>${maturity.template}</strong><p>Use this visual direction because it matches the buyer's current sophistication.</p></article>
      <article><span>Priority constraint</span><strong>${data.priorityConstraint || "weak proof"}</strong><p>${constraintRule}</p></article>
      <article><span>First win</span><strong>${maturity.firstWin}</strong><p>This is the smallest result that proves the workflow is working.</p></article>
    </div>

    <h4>5. Decision rules buyers cannot get from a generic prompt</h4>
    <table>
      <thead><tr><th>Situation</th><th>Rule</th><th>Action</th></tr></thead>
      <tbody>
        <tr><td>Weak proof</td><td>Do not scale volume before proof exists.</td><td>Create 3 proof assets from ${data.assets || "available client material"}.</td></tr>
        <tr><td>Trend mismatch</td><td>Copy the mechanic, not the meme.</td><td>Translate ${trendInput} through ${data.trendSignal}: ${playbook.adaptation}</td></tr>
        <tr><td>Low budget</td><td>Sell diagnosis before production.</td><td>Offer a 7-day audit with ${service.deliverables.slice(0, 2).join(" and ")}.</td></tr>
        <tr><td>Client edits too much</td><td>Move from taste debates to scoring criteria.</td><td>Score every concept by hook clarity, proof strength, audience fit, and CTA.</td></tr>
      </tbody>
    </table>

    <h4>6. Proprietary data log</h4>
    <table>
      <thead><tr><th>Data to capture</th><th>Why it compounds</th><th>Example field</th></tr></thead>
      <tbody>
        <tr><td>Winning hook pattern</td><td>Builds a niche-specific hook library.</td><td>"Comment reply + local proof"</td></tr>
        <tr><td>Objection answered</td><td>Turns sales friction into content briefs.</td><td>"Too expensive", "No time", "Not for me"</td></tr>
        <tr><td>Proof asset used</td><td>Shows what evidence creates trust.</td><td>testimonial, demo, before/after, founder clip</td></tr>
        <tr><td>Next decision</td><td>Creates renewal logic instead of random posting.</td><td>double down, revise, pause, retest</td></tr>
      </tbody>
    </table>

    <h4>7. Client-facing premium deliverable</h4>
    <ul>
      <li><strong>Diagnosis memo:</strong> why this offer should or should not be promoted now.</li>
      <li><strong>Decision log:</strong> what was tested, what changed, and what we learned.</li>
      <li><strong>Asset map:</strong> which proof assets are missing before scaling.</li>
      <li><strong>Renewal argument:</strong> the next sprint is justified by captured customer insight, not vague content volume.</li>
    </ul>

    <h4>8. Brand Brain memory</h4>
    <div class="result-card">
      <p><strong>Voice rules:</strong> ${data.brandBrain || "Define what the brand should always sound like, avoid, and prove."}</p>
      <p><strong>Red lines:</strong> ${data.redLines || "Define claims, tactics, and references the brand must avoid."}</p>
      <p><strong>Audience memory:</strong> ${audienceMemory}</p>
      <p><strong>Competitive references:</strong> ${data.competitors || "Add competitor offers, references, and content styles to compare against."}</p>
      <p><strong>Reuse rule:</strong> every future output must preserve the voice rules, obey red lines, avoid generic claims, and explain how it is different from the references.</p>
    </div>

    <h4>9. Creative testing matrix</h4>
    <table>
      <thead><tr><th>Variant</th><th>Hook type</th><th>Proof asset</th><th>CTA</th><th>Success metric</th></tr></thead>
      <tbody>
        <tr><td>A</td><td>${fill(playbook.hooks[0], data)}</td><td>${playbook.proof[0]}</td><td>${playbook.ctas[0]}</td><td>${testMode.metric}</td></tr>
        <tr><td>B</td><td>${fill(playbook.hooks[1] || playbook.hooks[0], data)}</td><td>${playbook.proof[1] || "customer quote"}</td><td>${playbook.ctas[1] || playbook.ctas[0]}</td><td>compare against A</td></tr>
        <tr><td>C</td><td>${fill(playbook.hooks[2] || playbook.hooks[0], data)}</td><td>${playbook.proof[2] || "before/after scene"}</td><td>${playbook.ctas[2] || playbook.ctas[0]}</td><td>comment quality and lead intent</td></tr>
      </tbody>
    </table>

    <h4>10. Testing mode</h4>
    <div class="result-card">
      <p><strong>${data.testingMode || "Organic validation"}:</strong> ${testMode.goal}.</p>
      <p><strong>Recommended volume:</strong> ${testMode.volume}.</p>
      <p><strong>Primary metric:</strong> ${testMode.metric}.</p>
      <p><strong>Next move:</strong> ${testMode.next}.</p>
    </div>

    <h4>11. Approval and retention workflow</h4>
    <div class="result-card">
      <p><strong>Current owner:</strong> ${approvalOwner}</p>
      <p><strong>Current state:</strong> ${approvalState}</p>
      <p><strong>Latest revision reason:</strong> ${revisionReason}</p>
    </div>
    <table>
      <thead><tr><th>Stage</th><th>Client sees</th><th>Decision captured</th></tr></thead>
      <tbody>
        <tr><td>Before production</td><td>diagnosis score, offer angle, testing matrix</td><td>what we will test and why</td></tr>
        <tr><td>Before publishing</td><td>scripts, proof asset, CTA, risk check</td><td>approved concept and revision reason</td></tr>
        <tr><td>After results</td><td>metric read, winning pattern, weak signal</td><td>next decision: scale, revise, pause, or retest</td></tr>
        <tr><td>Renewal</td><td>learning log and next-month plan</td><td>why continuing creates better decisions</td></tr>
      </tbody>
    </table>

    <h4>12. Next learning task</h4>
    <div class="result-card">
      <p><strong>Run this before the next generation:</strong> collect one new proof asset, one customer objection, one competitor reference, and one result metric. Add them back into Brand Brain so the next output becomes more specific.</p>
      <p><strong>Personalization lock:</strong> if future outputs ignore <em>${data.priorityConstraint || "the priority constraint"}</em> or violate the red lines, reject them and regenerate with stricter rules.</p>
    </div>

    <h4>13. Winner selection rule</h4>
    <div class="result-card">
      <p><strong>Logged learning:</strong> ${learning}</p>
      <p><strong>Winning pattern:</strong> ${winningPattern}</p>
      <p><strong>Selection rule:</strong> choose the next winner by evidence quality first, metric second, taste last. If a variant earns stronger saves, replies, qualified comments, or lead intent, adapt its hook structure into the next sprint.</p>
      <p><strong>Next variant recommendation:</strong> keep the strongest proof mechanism, change only one variable at a time, and test a new hook angle against the current winner.</p>
    </div>
  `;
}

function renderWebsitePreview(data) {
  const playbook = getTrendPlaybook(data);
  const service = serviceMap[data.serviceType] || serviceMap["Short-form management"];
  const hook = fill(playbook.hooks[0], data);
  const angle = fill(playbook.angles[0], data);
  const trendInput = getTrendInput(data);
  const columns = service.columns.slice(0, 4);
  const deliverables = service.deliverables.slice(0, 5);

  return `
    <div class="website-action-strip">
      <div>
        <strong>Generated website is ready</strong>
        <p>Preview it below, then download or copy the standalone HTML.</p>
      </div>
      <div>
        <button type="button" data-website-action="download">Download HTML</button>
        <button type="button" data-website-action="copy">Copy HTML</button>
        <button type="button" data-website-action="preview">Open preview</button>
      </div>
    </div>
    <div class="website-preview-shell">
      <div class="website-preview-bar">
        <span></span><span></span><span></span>
        <strong>${data.clientName || "Generated Website"} landing page</strong>
      </div>
      <div class="generated-site">
        <header>
          <div class="site-mark">${(data.clientName || "AI").slice(0, 2).toUpperCase()}</div>
          <nav><a>Work</a><a>Services</a><a>Pricing</a><a>Contact</a></nav>
        </header>
        <section class="generated-hero">
          <p>${data.serviceType} / ${data.platform} / ${data.trendSignal}</p>
          <h1>${hook}</h1>
          <span>Generated for ${data.clientName}, a ${data.industry}, to help ${data.audience} ${data.goal}.</span>
          <div class="generated-actions"><a>Book a sprint</a><a>See the plan</a></div>
        </section>
        <section class="generated-grid">
          ${columns
            .map(
              (column, index) => `
                <article>
                  <small>0${index + 1}</small>
                  <strong>${column}</strong>
                  <p>${index === 0 ? angle : fill(playbook.angles[index % playbook.angles.length], data)}</p>
                </article>
              `
            )
            .join("")}
        </section>
        <section class="generated-dark">
          <div>
            <p>Trend signal</p>
            <h2>${trendInput}</h2>
          </div>
          <ul>${deliverables.map((item) => `<li>${item}</li>`).join("")}</ul>
        </section>
        <section class="generated-pricing">
          <article><span>Pilot</span><strong>${data.budget}</strong><p>Trend brief, hooks, scripts, and first content sprint.</p></article>
          <article><span>CTA</span><strong>${playbook.ctas[0]}</strong><p>Use this as the landing page conversion action.</p></article>
        </section>
      </div>
    </div>
    <div class="download-note">
      <strong>This is a generated website preview.</strong>
      <p>Click the globe download button in the top-right toolbar to export it as a standalone HTML file.</p>
    </div>
  `;
}

function downloadWebsiteHtml() {
  const data = getData();
  const blob = new Blob([latestWebsiteHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${data.clientName || "generated"}-landing-page.html`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("Website HTML downloaded");
}

async function copyWebsiteHtml() {
  await navigator.clipboard.writeText(latestWebsiteHtml);
  showToast("Website HTML copied");
}

function openWebsitePreview() {
  const blob = new Blob([latestWebsiteHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function buildStandaloneWebsite(data) {
  const playbook = getTrendPlaybook(data);
  const service = serviceMap[data.serviceType] || serviceMap["Short-form management"];
  const hook = fill(playbook.hooks[0], data);
  const trendInput = getTrendInput(data);
  const angles = playbook.angles.slice(0, 4).map((angle) => fill(angle, data));

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${data.clientName} | Generated Short-Form Landing Page</title>
    <style>
      :root{--ink:#10110e;--paper:#f7f0df;--panel:#fffaf0;--lime:#c7ff4f;--coral:#ff5b4a;--muted:#70695f;--line:rgba(16,17,14,.14)}
      *{box-sizing:border-box}body{margin:0;color:var(--ink);background:radial-gradient(circle at 90% 10%,rgba(199,255,79,.38),transparent 24rem),linear-gradient(135deg,#fff8ea,#eadcc2);font-family:Arial,sans-serif}a{text-decoration:none;color:inherit}
      header,section,footer{width:min(1120px,calc(100% - 32px));margin:18px auto 0}header{display:flex;justify-content:space-between;align-items:center;border:1px solid var(--line);padding:14px;background:rgba(255,250,240,.84);backdrop-filter:blur(16px)}nav{display:flex;gap:16px;color:var(--muted);font-weight:800}.logo{display:flex;gap:10px;align-items:center;font-weight:900}.logo span{display:grid;place-items:center;width:36px;height:36px;background:var(--ink);color:var(--paper)}
      .hero{border:1px solid var(--line);padding:clamp(32px,7vw,78px);background:rgba(255,250,240,.9);box-shadow:0 26px 90px rgba(16,17,14,.15)}.eyebrow{color:var(--coral);font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:900}h1{max-width:900px;margin:0;font-size:clamp(44px,8vw,96px);line-height:.96;letter-spacing:-.06em}p{color:var(--muted);line-height:1.7}.actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}.btn{border:1px solid var(--ink);padding:15px 18px;font-weight:900;background:var(--lime)}.btn.secondary{background:var(--panel)}
      .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.grid article,.pricing article{border:1px solid var(--line);padding:20px;background:var(--panel)}.grid small{color:var(--coral);font-weight:900}.grid strong{display:block;margin:12px 0;font-size:24px}.dark{display:grid;grid-template-columns:1fr 1fr;gap:20px;color:var(--paper);border:1px solid var(--line);padding:32px;background:var(--ink)}.dark p{color:rgba(255,255,255,.65)}.dark h2{margin:0;font-size:44px;line-height:1}.dark li{margin:10px 0;color:rgba(255,255,255,.78)}.pricing{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px}.pricing strong{display:block;font-size:38px;letter-spacing:-.04em}
      footer{padding:24px 0;color:var(--muted);font-weight:800}@media(max-width:800px){.grid,.dark,.pricing{grid-template-columns:1fr}nav{display:none}}
    </style>
  </head>
  <body>
    <header><div class="logo"><span>${(data.clientName || "AI").slice(0, 2).toUpperCase()}</span>${data.clientName}</div><nav><a>Work</a><a>Services</a><a>Pricing</a><a>Contact</a></nav></header>
    <section class="hero"><p class="eyebrow">${data.serviceType} / ${data.platform} / ${data.trendSignal}</p><h1>${hook}</h1><p>Generated for ${data.clientName}, a ${data.industry}, to help ${data.audience} ${data.goal}. Trend signal: ${trendInput}.</p><div class="actions"><a class="btn">Book a sprint</a><a class="btn secondary">See the plan</a></div></section>
    <section class="grid">${angles.map((angle, index) => `<article><small>0${index + 1}</small><strong>${service.columns[index % service.columns.length]}</strong><p>${angle}</p></article>`).join("")}</section>
    <section class="dark"><div><p>Trend signal</p><h2>${trendInput}</h2></div><ul>${service.deliverables.map((item) => `<li>${item}</li>`).join("")}</ul></section>
    <section class="pricing"><article><span>Pilot</span><strong>${data.budget}</strong><p>Trend brief, hooks, scripts, and first content sprint.</p></article><article><span>CTA</span><strong>${playbook.ctas[0]}</strong><p>Use this as the landing page conversion action.</p></article></section>
    <footer>Generated by ShortForm Studio Kit. Replace text, proof, links, and pricing before publishing.</footer>
  </body>
</html>`;
}

function renderNext(data) {
  const actions = nextActions[data.status] || nextActions["New lead"];
  const approval = analyzeApprovalBottleneck(data);
  const learning = analyzeLearningLog(data);
  return `
    <h3>Recommended next steps</h3>
    <div class="action-list">
      ${actions
        .map((action, index) => {
          const explanation = explainAction(action, data);
          return `
            <article>
              <h4>${index + 1}. ${action}</h4>
              <p><strong>Why:</strong> ${explanation.why}</p>
              <p><strong>Risk reduced:</strong> ${explanation.risk}.</p>
              <p><strong>Next operator action:</strong> ${explanation.next}</p>
            </article>
          `;
        })
        .join("")}
    </div>
    <div class="decision-explain-panel">
      <article><span>Approval read</span><strong>${approval.type}</strong><p>${approval.why}</p></article>
      <article><span>Learning read</span><strong>${learning.latest ? "Use saved learning" : "Create first learning snapshot"}</strong><p>${learning.nextExperiment}</p></article>
      <article><span>Renewal link</span><strong>${getRenewalSignal(data)}</strong><p>${getRenewalDecision(data)}</p></article>
    </div>
    <h4>Follow-up script</h4>
    <div class="result-card">
      <p>I reviewed your goal, trend signal, and available assets. I suggest starting with a low-risk pilot so we can test which ${data.platform} angles around ${getTrendInput(data)} produce ${data.goal}, then decide whether a monthly system makes sense.</p>
    </div>
  `;
}

function renderTrends(data) {
  const playbook = getTrendPlaybook(data);
  const trendInput = getTrendInput(data);
  const refreshRows = getWeeklyTrendRefreshRows(data);
  const angles = playbook.angles
    .map(
      (angle, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${fill(angle, data)}</td>
          <td>${fill(playbook.hooks[index % playbook.hooks.length], data)}</td>
          <td>${index % 2 === 0 ? "Proof-first clip" : "Comment-led clip"}</td>
        </tr>
      `
    )
    .join("");

  return `
    <h3>TikTok trend adapter</h3>
    <div class="metric-row">
      <div class="metric"><span>Trend signal</span><strong>${data.trendSignal}</strong></div>
      <div class="metric"><span>Observed trend</span><strong>${trendInput}</strong></div>
      <div class="metric"><span>Source note</span><strong>${data.trendSource || "Add evidence"}</strong></div>
      <div class="metric"><span>Client niche</span><strong>${data.industry}</strong></div>
      <div class="metric"><span>Best use</span><strong>${data.platform}</strong></div>
    </div>
    <div class="grid-two">
      <div class="result-card">
        <h4>Why this works now</h4>
        <p>${playbook.brief}</p>
      </div>
      <div class="result-card">
        <h4>Adaptation rule</h4>
        <p>${playbook.adaptation}</p>
      </div>
    </div>
    <h4>Weekly source -> signal -> mechanic -> client-fit -> risk -> field update</h4>
    <table>
      <thead><tr><th>Source</th><th>Signal</th><th>Mechanic</th><th>Client fit</th><th>Risk</th><th>Field update</th></tr></thead>
      <tbody>
        ${refreshRows
          .map(
            (row) => `
              <tr>
                <td>${row.source}</td>
                <td>${row.signal}</td>
                <td>${row.mechanic}</td>
                <td>${row.fit}</td>
                <td>${row.risk}</td>
                <td>${row.update}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
    <h4>Trend-to-content angles</h4>
    <table>
      <thead><tr><th>#</th><th>Client-ready angle</th><th>Opening hook</th><th>Format</th></tr></thead>
      <tbody>${angles}</tbody>
    </table>
    <div class="grid-two">
      <div class="result-card">
        <h4>Proof assets to collect</h4>
        <ul>${playbook.proof.map((item) => `<li>${item}</li>`).join("")}</ul>
      </div>
      <div class="result-card">
        <h4>CTA options</h4>
        <ul>${playbook.ctas.map((item) => `<li>${item}</li>`).join("")}</ul>
      </div>
    </div>
    <div class="result-card">
      <h4>Brand-fit and rights check</h4>
      <p>${playbook.risk}</p>
      <p><strong>Logged source:</strong> ${data.trendSource || "Add the source, date, and observed signal before delivery."}</p>
      <p><strong>Asset rights:</strong> ${data.rightsCheck || "Confirm owned footage, licensed sound, creator permissions, and AI-video disclosure needs."}</p>
      <p>Before client delivery, verify the current hashtag, sound, and creator format in TikTok Creative Center or inside the TikTok app. This workspace adapts trends; it does not scrape live TikTok data.</p>
    </div>
  `;
}

function renderTopics(data) {
  const playbook = getTrendPlaybook(data);
  const topics = topicTemplates.map((topic, index) => ({
    title: fill(topic, data),
    type: index % 3 === 0 ? "Conversion" : index % 3 === 1 ? data.trendSignal : "Growth",
    hook: fill(playbook.hooks[index % playbook.hooks.length], data),
  }));

  return `
    <h3>10-topic short-form bank</h3>
    <p>Built around <strong>${data.trendSignal}</strong> and the observed signal <strong>${getTrendInput(data)}</strong>. Replace the signal weekly with a fresh hashtag, sound, comment pattern, or creator format.</p>
    <table>
      <thead><tr><th>#</th><th>Topic</th><th>Type</th><th>Opening hook</th><th>CTA</th></tr></thead>
      <tbody>
        ${topics
          .map(
            (topic, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${topic.title}</td>
                <td>${topic.type}</td>
                <td>${topic.hook}</td>
                <td>${index % 2 === 0 ? "Comment or DM for the plan" : "Ask viewers to choose the next test"}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderCalendar(data) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const service = serviceMap[data.serviceType] || serviceMap["Short-form management"];
  const topics = topicTemplates.slice(0, 5).map((topic) => fill(topic, data));
  return `
    <h3>One-week content calendar</h3>
    <table>
      <thead><tr><th>Day</th><th>Platform</th><th>Pillar</th><th>Title</th><th>Source</th><th>Goal</th></tr></thead>
      <tbody>
        ${days
          .map(
            (day, index) => `
              <tr>
                <td>${day}</td>
                <td>${data.platform}</td>
                <td>${service.columns[index % service.columns.length]}</td>
                <td>${topics[index]}</td>
                <td>${index % 2 === 0 ? `Trend signal: ${getTrendInput(data)}` : "Founder clip + client assets"}</td>
                <td>${data.goal}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderQuote(data) {
  return `
    <h3>${data.clientName} quote package</h3>
    <div class="grid-two">
      <div class="result-card">
        <h4>Pilot package</h4>
        <p>Best for testing one trend-to-content sprint. Includes 3 scripts or 1 finished short-form asset.</p>
        <p><strong>Suggested price:</strong> $299 - $799</p>
      </div>
      <div class="result-card">
        <h4>Monthly system</h4>
        <p>Best for weekly trend scanning, scripts, editing, reporting, and comment-loop planning.</p>
        <p><strong>Suggested price:</strong> ${data.budget}</p>
      </div>
    </div>
    <div class="result-card">
      <h4>Sales framing</h4>
      <p>Given your current assets and goal, I would start with a small pilot to identify which ${data.platform} angles around ${getTrendInput(data)} create ${data.goal}, then move into a monthly content system.</p>
    </div>
    <h4>Delivery process</h4>
    <ul>
      <li>Confirm scope and assets</li>
      <li>Collect deposit</li>
      <li>Scan current TikTok trend references</li>
      <li>Send the first topic and script batch</li>
      <li>Produce the first deliverables</li>
      <li>Report results and recommend next tests</li>
    </ul>
  `;
}

function renderScript(data) {
  const playbook = getTrendPlaybook(data);
  return `
    <h3>Story/script starter</h3>
    <div class="result-card">
      <h4>Creative direction</h4>
      <p>Create a ${data.tone} short-form story around ${getTrendInput(data)}. The viewer should see themselves in the problem before the offer appears.</p>
    </div>
    <table>
      <thead><tr><th>Scene</th><th>Visual</th><th>Line</th><th>Shot</th><th>Production note</th></tr></thead>
      <tbody>
        <tr><td>1</td><td>Open with the trend mechanic</td><td>${fill(playbook.hooks[0], data)}</td><td>Close-up</td><td>${data.tone}, fast first 3 seconds</td></tr>
        <tr><td>2</td><td>Show the specific customer problem</td><td>Most people think this is enough, but one step is missing.</td><td>Medium shot</td><td>Use a real ${data.industry} scene</td></tr>
        <tr><td>3</td><td>Show proof or transformation</td><td>This is the small change that makes the offer easier to trust.</td><td>Push-in</td><td>${playbook.proof[0]}</td></tr>
        <tr><td>4</td><td>End with participation</td><td>${playbook.ctas[0]}</td><td>Freeze frame</td><td>Clear caption, simple action</td></tr>
      </tbody>
    </table>
  `;
}

function renderReport(data) {
  const renewalSignal = getRenewalSignal(data);
  const renewalDecision = getRenewalDecision(data);
  const approval = analyzeApprovalBottleneck(data);
  const learning = analyzeLearningLog(data);
  return `
    <h3>Delivery report template</h3>
    <h4>Cycle goal</h4>
    <p>Test which ${data.platform} content pillars work best for ${data.industry}, using ${data.trendSignal} and ${getTrendInput(data)} to move the account toward ${data.goal}.</p>
    <table>
      <thead><tr><th>Content</th><th>Platform</th><th>Result</th><th>Read</th><th>Next improvement</th></tr></thead>
      <tbody>
        <tr><td>${fill(topicTemplates[0], data)}</td><td>${data.platform}</td><td>To fill</td><td>Watch saves, DMs, and comments</td><td>Improve title and ending CTA</td></tr>
        <tr><td>${fill(topicTemplates[1], data)}</td><td>${data.platform}</td><td>To fill</td><td>Watch comment questions</td><td>Turn the strongest comment into a reply video</td></tr>
      </tbody>
    </table>
    <h4>Next cycle</h4>
    <ul>
      <li>Keep the strongest pillar and create 3 variations.</li>
      <li>Turn comment questions into new content ideas.</li>
      <li>Log the approval state, owner, and revision reason before the next client handoff.</li>
      <li>Replace the observed trend input with a fresh weekly signal.</li>
      <li>Keep one clear DM or comment prompt in every asset.</li>
    </ul>
    <h4>Workflow memory</h4>
    <p>Audience memory: ${data.audienceMemory || "No audience memory saved yet."}</p>
    <p>Winning pattern: ${data.winningPattern || "No winner logged yet."}</p>
    <p>Approval owner/state: ${data.approvalOwner || "Founder"} / ${data.approvalState || "Drafting"}</p>
    <p>Revision reason: ${data.revisionReason || "No blocker logged yet."}</p>
    <h4>Learning analysis</h4>
    <div class="analysis-card">
      <strong>${learning.improvement}</strong>
      <p>${learning.nextExperiment}</p>
    </div>
    <h4>Approval bottleneck analysis</h4>
    <div class="analysis-card">
      <strong>${approval.severity} / ${approval.type}</strong>
      <p>${approval.why}</p>
      <p>${approval.next}</p>
    </div>
    <h4>Renewal recommendation</h4>
    <div class="renewal-card">
      <strong>${renewalSignal}: ${renewalDecision}</strong>
      <p>The renewal should be sold as a sharper next experiment based on saved learning, not as generic content volume.</p>
    </div>
  `;
}

function buildAdvisorReport(data) {
  const container = document.createElement("div");
  container.innerHTML = `
    <h1>${data.clientName} Renewal Advisor Report</h1>
    ${renderAdvisor(data)}
    ${renderSummary(data)}
    ${renderMemory(data)}
    ${renderClientProfile(data)}
    ${renderSkillOS(data)}
    ${renderReport(data)}
  `;
  return `# ${data.clientName} Renewal Advisor Report\n\n${container.innerText.trim()}`;
}

function buildRenewalExport(data) {
  const history = getProjectHistory(data);
  const latest = history[0];
  const clientProfile = buildClientProfile(data);
  const approval = analyzeApprovalBottleneck(data);
  const learning = analyzeLearningLog(data);
  const brief = getBriefQuality(data);
  const fit = getTemplateFit(data);
  const preset = getIndustryPreset(data);
  const generic = getGenericOutputCheck(data);
  return `# ${data.clientName} Renewal Report

## Renewal Signal

${getRenewalSignal(data)}

## Recommendation

${getRenewalDecision(data)}

## Advisor Quality Gate

- Brief Quality: ${brief.score}% (${brief.status})
- Recommended Template: ${fit.primary.name} (${fit.confidence}% confidence)
- Industry Preset: ${preset.name} (${preset.sprint})
- Proof Assets to Collect: ${preset.proof.join(", ")}
- Preset CTA: ${preset.cta}
- Preset Red Flag: ${preset.redFlag}
- Generic Output Check: ${generic.verdict} (${generic.score}%)
- Issues to fix: ${generic.failed.length ? generic.failed.map((issue) => issue.label).join(", ") : "None"}

## Current Memory

- Client memory depth: ${clientProfile.memoryDepth}%
- Reuse rule: ${clientProfile.reuseRule}
- Audience memory: ${data.audienceMemory || "No audience memory saved yet."}
- Brand Brain: ${data.brandBrain || "No brand rules saved yet."}
- Red lines: ${data.redLines || "No red lines saved yet."}
- Trend source: ${data.trendSource || "No trend source logged yet."}
- Rights check: ${data.rightsCheck || "No asset rights check logged yet."}
- Winning pattern: ${data.winningPattern || "No winner logged yet."}
- Latest test result: ${data.testResult || "No test result logged yet."}
- Approval owner/state: ${data.approvalOwner || "Founder"} / ${data.approvalState || "Drafting"}
- Revision reason: ${data.revisionReason || "No blocker logged yet."}

## Latest Learning Cycle

${latest ? `Saved: ${formatDate(latest.createdAt)}
Status: ${latest.status}
Feedback: ${latest.feedback}
Learning: ${latest.testResult}
Winning pattern: ${latest.winningPattern}
Next decision: ${latest.nextDecision}` : "No saved learning cycle yet. Save the project after a client sprint to create the first memory snapshot."}

## Learning Analysis

${learning.improvement}

Next experiment: ${learning.nextExperiment}

## Approval Bottleneck Analysis

- Severity: ${approval.severity}
- Bottleneck: ${approval.type}
- Why it is stuck: ${approval.why}
- Next faster move: ${approval.next}

## Next Sprint

- Keep the strongest proof mechanism and change one variable at a time.
- Turn the biggest revision reason into a pre-approval checklist.
- Add one new proof asset before the next generation.
- Report against the metric from ${data.testingMode || "Organic validation"}.
`;
}

function htmlToMarkdown(title, html) {
  const container = document.createElement("div");
  container.innerHTML = html;
  return `## ${title}\n\n${container.innerText.trim()}\n`;
}

function generate() {
  const data = getData();
  const sections = {
    today: renderToday(),
    brain: renderBrandBrain(),
    create: renderCreateStudio(),
    library: renderContentLibrary(),
    learning: renderLearning(),
    approvals: renderApprovals(data),
    reports: renderReports(data),
    aidesk: renderAIDesk(data),
    advisor: renderAdvisor(data),
    summary: renderSummary(data),
    website: renderWebsitePreview(data),
    skill: renderSkillOS(data),
    profile: renderClientProfile(data),
    clients: renderClientOS(data),
    memory: renderMemory(data),
    efficiency: renderEfficiency(data),
    packs: renderDeliveryPacks(data),
    template: renderGeneratedTemplate(data),
    next: renderNext(data),
    trends: renderTrends(data),
    topics: renderTopics(data),
    calendar: renderContentCalendar(),
    quote: renderQuote(data),
    script: renderScript(data),
    report: renderReport(data),
  };

  Object.entries(sections).forEach(([id, html]) => {
    const view = document.querySelector(`#${id}`);
    if (view) {
      view.innerHTML = html;
    }
  });

  latestMarkdown = [
    `# ${data.clientName} ShortForm Project Pack`,
    htmlToMarkdown("AI Desk", sections.aidesk),
    htmlToMarkdown("Advisor Quality Gate", sections.advisor),
    htmlToMarkdown("Project Summary", sections.summary),
    htmlToMarkdown("Skill OS", sections.skill),
    htmlToMarkdown("Client Profile", sections.profile),
    htmlToMarkdown("Client-Level Memory", sections.clients),
    htmlToMarkdown("Client Memory", sections.memory),
    htmlToMarkdown("Efficiency Ledger", sections.efficiency),
    htmlToMarkdown("Client-Ready Delivery Packs", sections.packs),
    htmlToMarkdown("Generated Template", sections.template),
    htmlToMarkdown("Next Steps", sections.next),
    htmlToMarkdown("TikTok Trend Adapter", sections.trends),
    htmlToMarkdown("Topic Bank", sections.topics),
    htmlToMarkdown("Content Calendar", sections.calendar),
    htmlToMarkdown("Quote Package", sections.quote),
    htmlToMarkdown("Script Starter", sections.script),
    htmlToMarkdown("Delivery Report", sections.report),
  ].join("\n\n");

  latestWebsiteHtml = buildStandaloneWebsite(data);
  latestAdvisorReport = buildAdvisorReport(data);
  latestRenewalExport = buildRenewalExport(data);
  latestDeliveryPacks = buildDeliveryPacks(data);
  latestContentLearningExport = buildContentLearningExport();
  latestContentWorkspaceExport = buildContentWorkspaceExport();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  generate();
  activateTab("today");
  closeBriefDrawer();
  showToast("Workspace pack generated");
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activateTab(tab.dataset.target);
    history.replaceState(null, "", `#${tab.dataset.target}`);
    document.querySelector(".output-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

openBriefBtn.addEventListener("click", () => {
  if (workspaceMode !== "agency") {
    activateTab("brain");
    document.querySelector("#brain")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  openBriefDrawer();
});
closeBriefBtn.addEventListener("click", closeBriefDrawer);
drawerBackdrop.addEventListener("click", closeBriefDrawer);
openHelpBtn.addEventListener("click", () => helpDialog.showModal());
closeHelpBtn.addEventListener("click", () => helpDialog.close());
helpOpenBriefBtn.addEventListener("click", () => {
  helpDialog.close();
  openBriefBtn.click();
});
helpDialog.addEventListener("click", (event) => {
  if (event.target === helpDialog) helpDialog.close();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && briefDrawer.classList.contains("open")) closeBriefDrawer();
});

jumpWebsiteBtn.addEventListener("click", () => {
  activateTab("create");
  document.querySelector("#create").scrollIntoView({ behavior: "smooth", block: "start" });
});

saveProjectBtn.addEventListener("click", saveProject);
newProjectBtn.addEventListener("click", () => {
  newProject();
  openBriefDrawer();
});
sampleClientBtn.addEventListener("click", () => {
  loadSampleClient("nova");
  openBriefDrawer();
});

exportMenuBtn.addEventListener("click", () => {
  const isOpen = !exportMenu.hidden;
  exportMenu.hidden = isOpen;
  exportMenuBtn.setAttribute("aria-expanded", String(!isOpen));
  if (!isOpen) renderExportMenu([...tabs].find((tab) => tab.classList.contains("active"))?.dataset.target);
});

cloudAuthBtn.addEventListener("click", async () => {
  authDialog.showModal();
  if (!cloudIsReady()) {
    authDialogStatus.textContent = "Cloud sync is not configured in this deployment. Add the Supabase public URL, anon key, and Worker URL to cloud-config.js when you are ready.";
    authForm.hidden = true;
    syncCloudBtn.hidden = true;
    importLocalBtn.hidden = true;
    signOutBtn.hidden = true;
    return;
  }
  authForm.hidden = false;
  syncCloudBtn.hidden = false;
  importLocalBtn.hidden = false;
  try {
    const user = await window.ShortFormCloud.getUser();
    authDialogStatus.textContent = user ? `Signed in as ${user.email}. Sync or upload your local projects.` : "Sign in with an email link, then upload the projects already saved on this device.";
    signOutBtn.hidden = !user;
  } catch {
    authDialogStatus.textContent = "Cloud connection could not be reached. Your local projects are unchanged.";
  }
});

closeAuthBtn.addEventListener("click", () => authDialog.close());
authDialog.addEventListener("click", (event) => {
  if (event.target === authDialog) authDialog.close();
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await window.ShortFormCloud.signInWithEmail(authEmail.value.trim());
    authDialogStatus.textContent = "Sign-in link sent. Open it in this browser, then return here to sync your projects.";
  } catch (error) {
    authDialogStatus.textContent = error.message || "Could not send sign-in link.";
  }
});

syncCloudBtn.addEventListener("click", async () => {
  try {
    await syncCloudData();
    authDialogStatus.textContent = "Cloud sync complete. Your local projects remain available offline.";
  } catch (error) {
    authDialogStatus.textContent = error.message || "Cloud sync could not run.";
  }
});

importLocalBtn.addEventListener("click", async () => {
  try {
    await syncCloudData();
    authDialogStatus.textContent = `Uploaded ${projects.length} local project(s) to your cloud workspace.`;
  } catch (error) {
    authDialogStatus.textContent = error.message || "Could not upload local projects.";
  }
});

signOutBtn.addEventListener("click", async () => {
  try {
    await window.ShortFormCloud.signOut();
    authDialogStatus.textContent = "Signed out. All existing local projects remain on this device.";
    await refreshCloudStatus();
  } catch (error) {
    authDialogStatus.textContent = error.message || "Could not sign out.";
  }
});

modeSwitchBtn.addEventListener("click", () => modeDialog.showModal());
modeDialog.addEventListener("click", (event) => {
  const mode = event.target.closest("[data-workspace-mode]")?.dataset.workspaceMode;
  if (!mode) return;
  setWorkspaceMode(mode);
  generate();
  activateTab("today");
});

feedbackBtn.addEventListener("click", () => feedbackDialog.showModal());
closeFeedbackBtn.addEventListener("click", () => feedbackDialog.close());
feedbackDialog.addEventListener("click", (event) => {
  if (event.target === feedbackDialog) feedbackDialog.close();
});
feedbackForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const response = Object.fromEntries(new FormData(feedbackForm).entries());
  response.mode = workspaceMode || "brand";
  response.activeContentId = activeContentId || "";
  window.ShortFormContentOS.recordFeedback(response);
  feedbackForm.reset();
  feedbackDialog.close();
  generate();
  activateTab("today");
  showToast("Feedback saved on this device");
});

emailFeedbackBtn.addEventListener("click", () => {
  const response = Object.fromEntries(new FormData(feedbackForm).entries());
  response.mode = workspaceMode || "brand";
  response.activeContentId = activeContentId || "";
  trackUsage("feedback_email_opened", { mode: response.mode });
  window.location.href = buildFeedbackEmailHref(response);
});

closeRevisionBtn.addEventListener("click", () => revisionDialog.close());
revisionDialog.addEventListener("click", (event) => {
  if (event.target === revisionDialog) revisionDialog.close();
});
revisionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = Object.fromEntries(new FormData(revisionForm).entries());
  const content = window.ShortFormContentOS.getContent(input.contentId);
  const reason = String(input.reason || "").trim();
  if (!content || !reason) return;
  const variant = window.ShortFormContentOS.createContentVariant(content.id, "rewrite", content.platform, reason);
  activeContentId = variant?.id || content.id;
  revisionDialog.close();
  generate();
  activateTab("create");
  showToast("Feedback rewrite created and saved to Learning");
});

closePerformanceBtn.addEventListener("click", () => performanceDialog.close());
performanceDialog.addEventListener("click", (event) => {
  if (event.target === performanceDialog) performanceDialog.close();
});
performanceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = Object.fromEntries(new FormData(performanceForm).entries());
  const content = window.ShortFormContentOS.getContent(input.contentId);
  const value = String(input.value || "").trim();
  if (!content || !value) return;
  window.ShortFormContentOS.recordPerformance(content.id, { metric: input.metric || "Manual result", value, notes: String(input.notes || "").trim() });
  trackUsage("performance_recorded", { contentId: content.id, metric: input.metric || "Manual result" });
  performanceDialog.close();
  generate();
  activateTab("learning");
  showToast("Result recorded in Learning");
});

restoreBackupInput.addEventListener("change", async () => {
  const file = restoreBackupInput.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const contentSnapshot = parsed.contentOS || parsed;
    if (!window.confirm("Restore this backup and replace the local Brand, content, feedback, and usage data on this device?")) return;
    window.ShortFormContentOS.importData(contentSnapshot);
    if (Array.isArray(parsed.legacyProjects)) {
      projects = parsed.legacyProjects;
      persistProjects();
      window.ShortFormContentOS.migrateLegacyProjects(projects);
    }
    activeContentId = "";
    activeContentComparisonId = "";
    renderProjectList();
    generate();
    activateTab("today");
    trackUsage("backup_restored", { fileName: file.name });
    showToast("Local backup restored");
  } catch (error) {
    showToast(error.message || "Could not restore this backup");
  } finally {
    restoreBackupInput.value = "";
  }
});

document.addEventListener("submit", (event) => {
  if (event.target.id === "brandBrainForm") {
    event.preventDefault();
    const input = Object.fromEntries(new FormData(event.target).entries());
    const brand = window.ShortFormContentOS.saveBrand(input);
    form.elements.clientName.value = brand.name;
    form.elements.industry.value = brand.category;
    form.elements.audience.value = brand.audience;
    form.elements.brandBrain.value = brand.voice;
    form.elements.assets.value = brand.proof;
    form.elements.redLines.value = brand.prohibitedClaims;
    form.elements.winningPattern.value = brand.winningPatterns;
    generate();
    activateTab("brain");
    showToast("Brand Brain saved locally");
  }

  if (event.target.id === "contentStudioForm") {
    event.preventDefault();
    try {
      const input = Object.fromEntries(new FormData(event.target).entries());
      const item = window.ShortFormContentOS.createContent(input);
      activeContentId = item.id;
      trackUsage("content_created", { contentId: item.id, brandId: item.brandId, format: item.format, platform: item.platform });
      generate();
      activateTab("create");
      showToast("Content draft created from Brand Brain");
    } catch (error) {
      showToast(error.message || "Could not create content");
    }
  }
});

document.addEventListener("click", (event) => {
  const sampleKey = event.target.closest("[data-sample]")?.dataset.sample;
  if (sampleKey) {
    loadSampleClient(sampleKey);
  }
});

document.addEventListener("change", (event) => {
  const librarySelect = event.target.closest("[data-library-select]");
  if (!librarySelect) return;
  const key = librarySelect.dataset.librarySelect;
  if (key === "brand") activeLibraryBrand = librarySelect.value;
  if (key === "platform") activeLibraryPlatform = librarySelect.value;
  if (key === "format") activeLibraryFormat = librarySelect.value;
  generate();
  activateTab("library");
});

document.addEventListener("click", async (event) => {
  const navTarget = event.target.closest("[data-content-nav]")?.dataset.contentNav;
  if (navTarget) {
    activateTab(navTarget);
    return;
  }

  if (event.target.closest("[data-open-feedback]")) {
    feedbackDialog.showModal();
    return;
  }

  const brandAction = event.target.closest("[data-brand-action]")?.dataset.brandAction;
  if (brandAction === "extract") {
    const source = document.querySelector("#brandMemorySource")?.value || "";
    latestBrandExtraction = window.ShortFormContentOS.extractBrandMemory(source);
    generate();
    activateTab("brain");
    showToast(Object.keys(latestBrandExtraction || {}).length ? "Field suggestions ready to review" : "Add labelled notes to extract fields");
    return;
  }
  if (brandAction === "apply-extraction") {
    const editor = document.querySelector("#brandBrainForm");
    if (editor && latestBrandExtraction) {
      Object.entries(latestBrandExtraction).forEach(([field, value]) => {
        const input = editor.elements[field];
        if (input && !String(input.value || "").trim()) input.value = value;
      });
      showToast("Suggestions added to the form; review and save");
    }
    return;
  }
  if (brandAction === "new") {
    const editor = document.querySelector("#brandBrainForm");
    if (editor) {
      editor.reset();
      editor.querySelectorAll("input, textarea").forEach((field) => {
        field.value = "";
      });
      latestBrandExtraction = null;
      generate();
      activateTab("brain");
    }
    return;
  }

  const libraryFilter = event.target.closest("[data-library-filter]")?.dataset.libraryFilter;
  if (libraryFilter) {
    activeLibraryFilter = libraryFilter;
    generate();
    activateTab("library");
    return;
  }

  const librarySelect = event.target.closest("[data-library-select]");
  if (librarySelect) {
    const key = librarySelect.dataset.librarySelect;
    if (key === "brand") activeLibraryBrand = librarySelect.value;
    if (key === "platform") activeLibraryPlatform = librarySelect.value;
    if (key === "format") activeLibraryFormat = librarySelect.value;
    generate();
    activateTab("library");
    return;
  }

  const contentAction = event.target.closest("[data-content-action]")?.dataset.contentAction;
  const contentId = event.target.closest("[data-content-id]")?.dataset.contentId;
  if (contentAction && contentId) {
    const content = window.ShortFormContentOS.getContent(contentId);
    if (contentAction === "open") {
      activeContentId = contentId;
      generate();
      activateTab("create");
      return;
    }
    if (contentAction === "duplicate") {
      const copy = window.ShortFormContentOS.duplicateContent(contentId);
      activeContentId = copy?.id || "";
      generate();
      activateTab("library");
      showToast("Content project duplicated");
      return;
    }
    if (contentAction === "advance") {
      window.ShortFormContentOS.advanceContent(contentId);
      generate();
      showToast("Content status updated");
      return;
    }
    if (contentAction === "schedule" || contentAction === "unschedule") {
      const dateInput = document.querySelector(`[data-schedule-input="${contentId}"]`);
      const scheduledAt = contentAction === "schedule" ? String(dateInput?.value || "") : "";
      if (contentAction === "schedule" && !scheduledAt) {
        showToast("Choose a publish date first");
        return;
      }
      window.ShortFormContentOS.scheduleContent(contentId, scheduledAt);
      trackUsage(scheduledAt ? "content_scheduled" : "content_unscheduled", { contentId, scheduledAt });
      generate();
      activateTab("calendar");
      showToast(scheduledAt ? "Publish date saved locally" : "Publish date removed");
      return;
    }
    if (contentAction === "compare") {
      activeContentComparisonId = activeContentComparisonId === contentId ? "" : contentId;
      generate();
      activateTab("create");
      return;
    }
    if (contentAction === "rewrite" || contentAction === "repurpose") {
      let platform = content.platform;
      if (contentAction === "rewrite") {
        revisionForm.elements.contentId.value = content.id;
        revisionForm.elements.reason.value = content.revisionReason || "";
        revisionDialog.showModal();
        return;
      }
      if (contentAction === "repurpose") {
        platform = window.prompt("Repurpose for which platform?", content.platform || "Instagram Reels");
        if (!platform) return;
      }
      const variant = window.ShortFormContentOS.createContentVariant(contentId, contentAction, platform);
      activeContentId = variant?.id || contentId;
      generate();
      activateTab("create");
      showToast(contentAction === "repurpose" ? "Platform variant created" : "Feedback rewrite created");
      return;
    }
    if (contentAction === "save-memory" && content) {
      const brand = window.ShortFormContentOS.getBrand(content.brandId);
      if (brand) {
        const nextPattern = [brand.winningPatterns, content.output?.hooks?.[0]].filter(Boolean).join("\n");
        window.ShortFormContentOS.saveBrand({ ...brand, winningPatterns: nextPattern });
        generate();
        showToast("Content pattern saved to Brand Memory");
      }
      return;
    }
    if (contentAction === "record-performance" && content) {
      performanceForm.elements.contentId.value = content.id;
      performanceForm.elements.metric.value = content.performance?.metric || "Saves";
  performanceForm.elements["value"].value = content.performance?.value || "";
      performanceForm.elements.notes.value = content.performance?.notes || "";
      performanceDialog.showModal();
      return;
    }
  }

  const exportAction = event.target.closest("[data-export-action]")?.dataset.exportAction;
  if (exportAction) {
    exportMenu.hidden = true;
    exportMenuBtn.setAttribute("aria-expanded", "false");
    await runExport(exportAction);
    return;
  }

  const aiJob = event.target.closest("[data-ai-job]")?.dataset.aiJob;
  if (aiJob) {
    await runCloudAiJob(aiJob);
    return;
  }

  const aiSuggestionAction = event.target.closest("[data-ai-suggestion-action]")?.dataset.aiSuggestionAction;
  if (aiSuggestionAction) {
    await applyAiSuggestion(aiSuggestionAction === "approve");
    return;
  }

  const profileEditorAction = event.target.closest("[data-profile-editor-action]")?.dataset.profileEditorAction;
  if (profileEditorAction) {
    applyProfileEditor(profileEditorAction === "save");
    return;
  }

  const clientMemoryAction = event.target.closest("[data-client-memory-action]")?.dataset.clientMemoryAction;
  const clientProjectId = event.target.closest("[data-client-project-id]")?.dataset.clientProjectId;
  if (clientMemoryAction && clientProjectId) {
    if (clientMemoryAction === "load") {
      loadSavedClientProfile(clientProjectId);
      return;
    }

    if (clientMemoryAction === "apply") {
      applyClientMemory(clientProjectId);
      return;
    }
  }

  const renewalAction = event.target.closest("[data-renewal-action]")?.dataset.renewalAction;
  if (renewalAction === "copy") {
    await navigator.clipboard.writeText(latestRenewalExport);
    showToast("Renewal report copied");
    return;
  }

  if (renewalAction === "download") {
    const data = getData();
    const blob = new Blob([latestRenewalExport], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.clientName || "client"}-renewal-report.md`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Renewal report downloaded");
    return;
  }

  const packAction = event.target.closest("[data-pack-action]")?.dataset.packAction;
  const packKey = event.target.closest("[data-pack-key]")?.dataset.packKey;
  if (packAction && packKey && latestDeliveryPacks[packKey]) {
    const data = getData();
    const packContent = latestDeliveryPacks[packKey];
    if (packAction === "copy") {
      await navigator.clipboard.writeText(packContent);
      showToast("Delivery pack copied");
      return;
    }

    if (packAction === "download") {
      const blob = new Blob([packContent], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${data.clientName || "client"}-${packKey}-pack.md`;
      link.click();
      URL.revokeObjectURL(url);
      showToast("Delivery pack downloaded");
      return;
    }
  }

  const action = event.target.closest("[data-website-action]")?.dataset.websiteAction;
  if (!action) return;

  if (action === "download") {
    downloadWebsiteHtml();
  }

  if (action === "copy") {
    await copyWebsiteHtml();
  }

  if (action === "preview") {
    openWebsitePreview();
  }
});

trackUsage("workspace_opened", { mode: workspaceMode || "brand" });
generate();
renderProjectList();
if (workspaceMode) {
  setWorkspaceMode(workspaceMode);
} else {
  document.body.dataset.workspaceMode = "brand";
  document.querySelectorAll(".agency-only").forEach((element) => {
    element.hidden = true;
  });
  modeDialog.showModal();
}
activateHashTab();
renderExportMenu([...tabs].find((tab) => tab.classList.contains("active"))?.dataset.target || "today");
refreshCloudStatus();
window.addEventListener("shortform:cloud-status", (event) => {
  const detail = event.detail || {};
  setCloudStatus(detail.message || "Cloud status updated", detail.state || "ready");
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".export-menu-wrap") && !exportMenu.hidden) {
    exportMenu.hidden = true;
    exportMenuBtn.setAttribute("aria-expanded", "false");
  }
});
