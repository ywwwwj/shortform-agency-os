(function () {
  const brandKey = "shortform-content-os-brands-v1";
  const contentKey = "shortform-content-os-content-v1";
  const feedbackKey = "shortform-content-os-feedback-v1";
  const usageKey = "shortform-content-os-usage-v1";

  function load(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  }

  let brands = load(brandKey);
  let contentProjects = load(contentKey);
  let feedbackEntries = load(feedbackKey);
  let usageEvents = load(usageKey);

  function persist() {
    localStorage.setItem(brandKey, JSON.stringify(brands));
    localStorage.setItem(contentKey, JSON.stringify(contentProjects));
    localStorage.setItem(feedbackKey, JSON.stringify(feedbackEntries));
    localStorage.setItem(usageKey, JSON.stringify(usageEvents));
  }

  function newId() {
    return crypto.randomUUID();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function brandIdentity(name, category) {
    return `${normalize(name)}::${normalize(category)}`;
  }

  function splitItems(value) {
    return String(value || "")
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function makeBrand(source = {}) {
    const now = Date.now();
    return {
      id: source.id || newId(),
      name: source.name || source.clientName || "Untitled brand",
      category: source.category || source.industry || "",
      positioning: source.positioning || source.offer || "",
      audience: source.audience || "",
      offer: source.offer || source.goal || "",
      voice: source.voice || source.brandBrain || "",
      proof: source.proof || source.assets || "",
      products: source.products || "",
      prohibitedClaims: source.prohibitedClaims || source.redLines || "",
      competitors: source.competitors || "",
      winningPatterns: source.winningPatterns || source.winningPattern || "",
      contentExamples: source.contentExamples || "",
      customerObjections: source.customerObjections || "",
      createdAt: source.createdAt || now,
      updatedAt: now,
    };
  }

  function migrateLegacyProjects(projects) {
    let changed = false;
    (projects || []).forEach((project) => {
      const key = brandIdentity(project.clientName, project.industry);
      if (brands.some((brand) => brandIdentity(brand.name, brand.category) === key)) return;
      brands.push(makeBrand(project));
      changed = true;
    });
    if (changed) persist();
    return brands;
  }

  function listBrands() {
    return [...brands].sort((a, b) => b.updatedAt - a.updatedAt);
  }

  function getBrand(id) {
    return brands.find((brand) => brand.id === id);
  }

  function saveBrand(input) {
    const existing = input.id ? getBrand(input.id) : null;
    const brand = makeBrand({ ...(existing || {}), ...input, id: input.id || existing?.id });
    if (existing) {
      brands = brands.map((item) => (item.id === existing.id ? { ...brand, createdAt: existing.createdAt } : item));
    } else {
      brands.push(brand);
    }
    persist();
    return brand;
  }

  function missingBrandFields(brand) {
    const checks = [
      ["positioning", "Brand positioning is missing"],
      ["audience", "Audience is missing"],
      ["offer", "Offer is missing"],
      ["voice", "Brand voice has no examples"],
      ["proof", "No approved proof saved"],
      ["products", "Products or services are missing"],
      ["prohibitedClaims", "Prohibited claims are missing"],
      ["customerObjections", "Missing customer objections"],
      ["winningPatterns", "No successful hooks recorded"],
    ];
    return checks.filter(([field]) => !String(brand?.[field] || "").trim()).map(([, label]) => label);
  }

  function extractBrandMemory(source) {
    const fields = {};
    const aliases = {
      positioning: "positioning",
      audience: "audience",
      offer: "offer",
      voice: "voice",
      proof: "proof",
      products: "products",
      "prohibited claims": "prohibitedClaims",
      claims: "prohibitedClaims",
      competitors: "competitors",
      "winning patterns": "winningPatterns",
      objections: "customerObjections",
      "customer objections": "customerObjections",
    };
    String(source || "").split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*([^:：-]{2,32})\s*[:：-]\s*(.+)$/);
      if (!match) return;
      const key = aliases[normalize(match[1])];
      if (key) fields[key] = fields[key] ? `${fields[key]}\n${match[2].trim()}` : match[2].trim();
    });
    if (!Object.keys(fields).length && String(source || "").trim()) fields.contentExamples = String(source).trim();
    return fields;
  }

  function contentTemplate(input, brand) {
    const goalMap = {
      Awareness: "make the brand recognizable through a useful, specific point of view",
      Lead: "turn attention into a qualified conversation or inquiry",
      Sales: "make the offer easier to understand and trust before asking for action",
      Education: "teach one clear idea that builds authority and future demand",
    };
    const formatMap = {
      "Short video": "Open with the tension, show a real proof moment, then give one clear next action.",
      UGC: "Use a creator-style observation, believable product proof, and a direct but calm CTA.",
      "Founder content": "Lead with a founder insight, explain the tradeoff, and make the operating lesson concrete.",
      Ad: "Name the buyer problem early, make the proof visual, and remove one purchase objection.",
      "Landing page": "Translate the theme into a sharp promise, proof blocks, objections, and a single CTA.",
    };
    const formatOpening = {
      "Short video": `Most people misunderstand ${input.topic || "the current customer question"}.`,
      UGC: `I wish I had understood this before I tried to solve ${input.topic || "the current customer question"}.`,
      "Founder content": `The tradeoff behind ${input.topic || "the current customer question"} is rarely discussed.`,
      Ad: `Before you spend more time on ${input.topic || "the current customer question"}, check this.`,
      "Landing page": `A clearer way to decide about ${input.topic || "the current customer question"}.`,
    };
    const topic = input.topic || "the current customer question";
    const proof = splitItems(brand.proof)[0] || "a real customer example, demo, or before-after moment";
    const pattern = splitItems(brand.winningPatterns)[0] || "a proof-led opening";
    const sourceMaterial = splitItems(input.sourceMaterial)[0] || "";
    const draftEvidence = sourceMaterial || proof;
    const objective = input.objective || "Awareness";
    const objectiveHook = objective === "Sales"
      ? `What ${topic} needs to show before someone is ready to buy.`
      : objective === "Lead"
        ? `The question to answer before asking someone to start a conversation about ${topic}.`
        : objective === "Education"
          ? `One practical rule for making ${topic} easier to understand.`
          : `The useful detail that makes ${topic} worth remembering.`;
    const angle = `${brand.name}: use ${topic} to ${goalMap[objective] || goalMap.Awareness}, grounded in ${draftEvidence}.`;
    const hooks = [
      formatOpening[input.format] || formatOpening["Short video"],
      objectiveHook,
      sourceMaterial ? `The source detail we are working from: ${sourceMaterial}` : `Before you choose ${brand.name}, look for this one proof point.`,
      `Use ${pattern} to make the decision around ${topic} easier.`,
    ];
    return {
      angle,
      hooks,
      script: `Hook: ${hooks[0]}\n\nProblem: Name the specific tension around ${topic}.\n\nEvidence: Show ${draftEvidence}.\n\nShift: Explain what the audience should do differently.\n\nCTA: ${objective === "Lead" ? "Ask for the next step or a tailored plan." : objective === "Sales" ? "See the offer and choose the next step." : "Save this and use it when you need it."}`,
      caption: `${brand.name} on ${topic}. ${sourceMaterial ? `Start from this supplied detail: ${sourceMaterial}. ` : ""}Keep it specific, useful, and consistent with the brand voice: ${brand.voice || "clear and evidence-led"}.`,
      cta: objective === "Sales" ? "See the offer" : objective === "Lead" ? "Start a conversation" : objective === "Education" ? "Save this lesson" : "Save this for later",
      visualBeats: ["Open on the customer tension", `Show ${draftEvidence}`, `Make the ${objective.toLowerCase()} decision rule visible`, "End with the single CTA"],
      repurposeVariants: [`Rewrite as a ${input.platform || "platform"} carousel`, "Turn the strongest hook into a comment reply", "Use the proof moment in a landing-page section"],
      memoryUsed: [
        { type: "Voice", value: brand.voice || "No saved voice example", reason: "Keeps the draft on-brand." },
        { type: "Proof", value: proof, reason: "Avoids unsupported claims." },
        { type: "Winning pattern", value: pattern, reason: "Reuses an existing evidence-led structure." },
        ...(sourceMaterial ? [{ type: "This project source", value: sourceMaterial, reason: "Shapes this draft only; it is not saved to Brand Memory or treated as approved proof." }] : []),
      ],
      why: `${formatMap[input.format] || formatMap["Short video"]} ${sourceMaterial ? "The supplied source material changes the example and evidence block for this project." : "No project source was supplied, so the draft uses the saved Brand Brain proof."}`,
      assumptions: ["The supplied topic is relevant to the target audience.", "The saved proof asset is approved for use.", ...(sourceMaterial ? ["The supplied project source is accurate and can be used after review."] : [])],
      risks: [...(splitItems(brand.prohibitedClaims).length ? splitItems(brand.prohibitedClaims) : ["Do not imply guaranteed results or use unsupported claims."]), ...(sourceMaterial ? ["The project source is not automatically approved proof; verify it before publishing."] : [])],
    };
  }

  function extractBrandMemorySafe(source) {
    const fields = {};
    const aliases = {
      positioning: "positioning",
      audience: "audience",
      offer: "offer",
      voice: "voice",
      proof: "proof",
      products: "products",
      "prohibited claims": "prohibitedClaims",
      claims: "prohibitedClaims",
      competitors: "competitors",
      "winning patterns": "winningPatterns",
      objections: "customerObjections",
      "customer objections": "customerObjections",
    };
    String(source || "").split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*([^:\uFF1A]{2,32})\s*[:\uFF1A]\s*(.+)$/);
      if (!match) return;
      const key = aliases[normalize(match[1])];
      if (key) fields[key] = fields[key] ? `${fields[key]}\n${match[2].trim()}` : match[2].trim();
    });
    if (!Object.keys(fields).length && String(source || "").trim()) fields.contentExamples = String(source).trim();
    return fields;
  }

  function createContent(input) {
    const brand = getBrand(input.brandId);
    if (!brand) throw new Error("Choose a Brand before creating content.");
    const now = Date.now();
    const output = contentTemplate(input, brand);
    const item = {
      id: newId(),
      brandId: brand.id,
      objective: input.objective,
      format: input.format,
      platform: input.platform || "Multi-platform",
      topic: input.topic || "",
      sourceMaterial: input.sourceMaterial || "",
      status: "Draft",
      scheduledAt: "",
      output,
      revisionReason: "",
      performance: { metric: "", value: "", notes: "" },
      versions: [{ id: newId(), createdAt: now, label: "First draft", output, reason: "Generated from current Brand Brain" }],
      createdAt: now,
      updatedAt: now,
    };
    contentProjects.push(item);
    persist();
    return item;
  }

  function listContent(filters = {}) {
    return contentProjects
      .filter((item) => !filters.brandId || item.brandId === filters.brandId)
      .filter((item) => !filters.status || item.status === filters.status)
      .filter((item) => !filters.format || item.format === filters.format)
      .filter((item) => !filters.platform || item.platform === filters.platform)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  function getContent(id) {
    return contentProjects.find((item) => item.id === id);
  }

  function updateContent(id, updates, versionReason = "Updated in Content Library") {
    const existing = getContent(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: Date.now() };
    if (updates.output) {
      updated.versions = [...existing.versions, { id: newId(), createdAt: Date.now(), label: `Version ${existing.versions.length + 1}`, output: updates.output, reason: versionReason }];
    }
    contentProjects = contentProjects.map((item) => (item.id === id ? updated : item));
    persist();
    return updated;
  }

  function advanceContent(id) {
    const order = ["Idea", "Draft", "Review", "Approved", "Published", "Learned"];
    const item = getContent(id);
    if (!item) return null;
    const next = order[Math.min(order.indexOf(item.status) + 1, order.length - 1)];
    return updateContent(id, { status: next }, `Status changed to ${next}`);
  }

  function scheduleContent(id, scheduledAt) {
    const value = String(scheduledAt || "").trim();
    return updateContent(id, { scheduledAt: value }, value ? `Scheduled for ${value}` : "Removed from calendar");
  }

  function duplicateContent(id) {
    const original = getContent(id);
    if (!original) return null;
    const copy = { ...original, id: newId(), status: "Idea", createdAt: Date.now(), updatedAt: Date.now(), versions: [...original.versions] };
    contentProjects.push(copy);
    persist();
    return copy;
  }

  function createContentVariant(id, variantType, platform, feedback = "") {
    const original = getContent(id);
    if (!original) return null;
    const output = original.output || {};
    const targetPlatform = platform || original.platform || "Multi-platform";
    const firstHook = output.hooks?.[0] || "Start with the clearest customer tension.";
    const cleanFeedback = String(feedback || "").trim();
    const variant = variantType === "repurpose"
      ? {
          ...output,
          angle: `${output.angle || original.topic} Reworked for ${targetPlatform}.`,
          hooks: [`For ${targetPlatform}: ${firstHook}`, ...(output.hooks || []).slice(1, 4)],
          caption: `${output.caption || ""} Adapted for ${targetPlatform}; keep the proof and change the opening context.`,
          cta: output.cta || "Save this for later",
          repurposeVariants: [...(output.repurposeVariants || []), `Repurposed for ${targetPlatform}`],
          assumptions: [...(output.assumptions || []), `The same proof is suitable for ${targetPlatform}.`],
        }
      : {
          ...output,
          angle: `${output.angle || original.topic} Rewritten${cleanFeedback ? ` for: ${cleanFeedback}` : " after feedback"}.`,
          hooks: [`${cleanFeedback ? `${cleanFeedback}: ` : ""}A clearer version: ${firstHook}`, ...(output.hooks || []).slice(1, 4)],
          script: `${output.script || ""}\n\nFeedback pass: ${cleanFeedback || "make the customer tension concrete before introducing the offer"}.`,
          assumptions: [...(output.assumptions || []), "The rewrite keeps the approved proof and changes only the framing.", ...(cleanFeedback ? [`The revision follows this saved request: ${cleanFeedback}`] : [])],
        };
    const reason = variantType === "repurpose"
      ? `Repurposed for ${targetPlatform}`
      : cleanFeedback || "Rewritten from feedback";
    return updateContent(id, {
      output: variant,
      platform: targetPlatform,
      status: "Draft",
      revisionReason: variantType === "rewrite" ? reason : original.revisionReason || "",
    }, reason);
  }

  function recordPerformance(id, performance) {
    return updateContent(id, { performance, status: "Learned" }, "Performance and learning recorded");
  }

  function trackUsage(event, metadata = {}) {
    usageEvents = [...usageEvents, { id: newId(), event, metadata, createdAt: Date.now() }].slice(-300);
    localStorage.setItem(usageKey, JSON.stringify(usageEvents));
  }

  function recordFeedback(input = {}) {
    const entry = { id: newId(), createdAt: Date.now(), ...input };
    feedbackEntries = [...feedbackEntries, entry].slice(-100);
    localStorage.setItem(feedbackKey, JSON.stringify(feedbackEntries));
    trackUsage("feedback_submitted", { rating: input.rating || "", wouldPay: input.wouldPay || "" });
    return entry;
  }

  function listFeedback() {
    return [...feedbackEntries].sort((a, b) => b.createdAt - a.createdAt);
  }

  function getUsageSummary() {
    const counts = {};
    usageEvents.forEach((entry) => {
      counts[entry.event] = (counts[entry.event] || 0) + 1;
    });
    return { total: usageEvents.length, counts, lastEventAt: usageEvents.at(-1)?.createdAt || null };
  }

  function exportData() {
    return { brands: listBrands(), content: listContent({}), feedback: listFeedback(), usage: [...usageEvents] };
  }

  function importData(snapshot = {}) {
    if (!Array.isArray(snapshot.brands) || !Array.isArray(snapshot.content)) {
      throw new Error("This file does not contain a valid ShortForm Content OS backup.");
    }
    brands = snapshot.brands;
    contentProjects = snapshot.content;
    feedbackEntries = Array.isArray(snapshot.feedback) ? snapshot.feedback : [];
    usageEvents = Array.isArray(snapshot.usage) ? snapshot.usage : [];
    persist();
    return exportData();
  }

  function getLearning(brandId) {
    const items = listContent({ brandId });
    const learned = items.filter((item) => item.status === "Learned" || item.status === "Published");
    const hookCount = {};
    const ctaCount = {};
    const revisions = [];
    learned.forEach((item) => {
      (item.output?.hooks || []).slice(0, 1).forEach((hook) => (hookCount[hook] = (hookCount[hook] || 0) + 1));
      if (item.output?.cta) ctaCount[item.output.cta] = (ctaCount[item.output.cta] || 0) + 1;
      if (item.revisionReason) revisions.push(item.revisionReason);
    });
    const top = (object) => Object.entries(object).sort((a, b) => b[1] - a[1])[0]?.[0] || "No pattern recorded yet";
    return {
      total: items.length,
      learned: learned.length,
      topHook: top(hookCount),
      topCta: top(ctaCount),
      revisions: [...new Set(revisions)].slice(0, 4),
      nextTest: learned.length ? "Keep the strongest proof mechanism and test one new hook or CTA variable." : "Publish one focused draft and record a basic result before creating more variants.",
    };
  }

  function replaceData(next) {
    brands = Array.isArray(next.brands) ? next.brands : brands;
    contentProjects = Array.isArray(next.content) ? next.content : contentProjects;
    persist();
  }

  window.ShortFormContentOS = {
    migrateLegacyProjects,
    listBrands,
    getBrand,
    saveBrand,
    missingBrandFields,
    extractBrandMemory: extractBrandMemorySafe,
    createContent,
    listContent,
    getContent,
    updateContent,
    advanceContent,
    scheduleContent,
    duplicateContent,
    createContentVariant,
    recordPerformance,
    trackUsage,
    recordFeedback,
    listFeedback,
    getUsageSummary,
    exportData,
    importData,
    getLearning,
    replaceData,
  };
})();
