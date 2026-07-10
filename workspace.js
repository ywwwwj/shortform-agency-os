const form = document.querySelector("#projectForm");
const tabs = document.querySelectorAll(".tab");
const views = document.querySelectorAll(".result-view");
const copyAllBtn = document.querySelector("#copyAllBtn");
const downloadBtn = document.querySelector("#downloadBtn");
const downloadWebsiteBtn = document.querySelector("#downloadWebsiteBtn");
const downloadReportBtn = document.querySelector("#downloadReportBtn");
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

const storageKey = "shortform-studio-projects-v2";
let projects = loadProjects();
let latestMarkdown = "";
let latestWebsiteHtml = "";
let latestAdvisorReport = "";
let latestRenewalExport = "";
let latestDeliveryPacks = {};

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

function activateTab(targetId) {
  tabs.forEach((item) => item.classList.toggle("active", item.dataset.target === targetId));
  views.forEach((view) => view.classList.toggle("active", view.id === targetId));
  const activeTab = [...tabs].find((item) => item.dataset.target === targetId);
  if (activeTab && activeViewTitle) activeViewTitle.textContent = activeTab.textContent.trim();
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
  projectCount.textContent = `${projects.length} projects`;
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

function saveProject() {
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
  generate();
  showToast("Project saved locally");
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
  activateTab("aidesk");
  renderProjectList();
  showToast(`${sample.clientName} sample loaded`);
}

function renderAIDesk(data) {
  const approval = analyzeApprovalBottleneck(data);
  const learning = analyzeLearningLog(data);
  const profile = buildClientProfile(data);
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
      <h3>Turn messy client work into a structured operating system.</h3>
      <p>This is the bridge from the old tool kit to the platform: paste client notes into AI, then store the structured result as profile, brief, approval logic, learning, and renewal material.</p>
    </div>
    <div class="operator-path">
      <article><span>Step 1</span><strong>Paste messy notes</strong><p>Use client emails, WhatsApp messages, briefs, call notes, trend links, or revision feedback.</p></article>
      <article><span>Step 2</span><strong>Review why</strong><p>Each recommendation should show the reason, risk, and next operator action before you send anything to the client.</p></article>
      <article><span>Step 3</span><strong>Export the pack</strong><p>Turn the structured workspace into AI handoff, approval summary, learning log, renewal report, and output assets.</p></article>
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
    calendar: renderCalendar(data),
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
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  generate();
  activateTab("aidesk");
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

openBriefBtn.addEventListener("click", openBriefDrawer);
closeBriefBtn.addEventListener("click", closeBriefDrawer);
drawerBackdrop.addEventListener("click", closeBriefDrawer);
openHelpBtn.addEventListener("click", () => helpDialog.showModal());
closeHelpBtn.addEventListener("click", () => helpDialog.close());
helpOpenBriefBtn.addEventListener("click", () => {
  helpDialog.close();
  openBriefDrawer();
});
helpDialog.addEventListener("click", (event) => {
  if (event.target === helpDialog) helpDialog.close();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && briefDrawer.classList.contains("open")) closeBriefDrawer();
});

jumpWebsiteBtn.addEventListener("click", () => {
  activateTab("website");
  document.querySelector("#website").scrollIntoView({ behavior: "smooth", block: "start" });
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

document.addEventListener("click", (event) => {
  const sampleKey = event.target.closest("[data-sample]")?.dataset.sample;
  if (sampleKey) {
    loadSampleClient(sampleKey);
  }
});

copyAllBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(latestMarkdown);
  showToast("Copied all content");
});

downloadBtn.addEventListener("click", () => {
  const data = getData();
  const blob = new Blob([latestMarkdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${data.clientName || "client"}-shortform-project-pack.md`;
  link.click();
  URL.revokeObjectURL(url);
});

downloadWebsiteBtn.addEventListener("click", () => {
  downloadWebsiteHtml();
});

downloadReportBtn.addEventListener("click", () => {
  const data = getData();
  const blob = new Blob([latestAdvisorReport], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${data.clientName || "client"}-renewal-advisor-report.md`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("Renewal advisor report downloaded");
});

document.addEventListener("click", async (event) => {
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

generate();
renderProjectList();
activateHashTab();
