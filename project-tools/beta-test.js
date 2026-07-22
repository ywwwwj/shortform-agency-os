const STORAGE_KEY = "shortform-content-os-beta-tests-v2";

const form = document.querySelector("#betaTestForm");
const recordList = document.querySelector("#betaRecordList");
const scorePanel = document.querySelector("#betaScorePanel");
const exportBtn = document.querySelector("#exportBetaTests");
const resetBtn = document.querySelector("#resetBetaForm");
const toast = document.querySelector("#betaToast");

let records = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1600);
}

function getFormData() {
  return Object.fromEntries(new FormData(form).entries());
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function getSignal(record) {
  const canExplain = record.canExplain === "Yes";
  const mentionsMoat = ["Brand Brain", "Content Studio", "Learning loop", "Content Library"].includes(record.primaryValue);
  const hasPaidIntent = Number(record.purchaseIntent || 0) >= 4;
  const hasReuseIntent = hasReuseSignal(record) || record.testProgress === "Returned within 7 days";
  const completedFirstGeneration = record.testProgress === "Completed first generation" || record.testProgress === "Returned within 7 days";
  const asksBuyingQuestion = record.buyingQuestion === "Yes";
  const weakPositioning = ["AI script generator", "Prompt pack", "Website template"].includes(record.productCategory);

  if (hasPaidIntent && hasReuseIntent && completedFirstGeneration && canExplain) return "Strong";
  if ((mentionsMoat && asksBuyingQuestion) || (completedFirstGeneration && hasPaidIntent) || (mentionsMoat && hasReuseIntent)) return "Promising";
  if (weakPositioning) return "Positioning risk";
  return "Weak";
}

function hasReuseSignal(record) {
  return (
    Number(record.reuseIntent || 0) >= 4 ||
    record.testProgress === "Returned within 7 days" ||
    Boolean(record.reuseSignal && record.reuseSignal !== "No reuse signal yet")
  );
}

function summarizeRecords() {
  const total = records.length;
  const contactedCount = records.filter((record) => record.testProgress).length;
  const productTestCount = records.filter((record) => record.testProgress !== "Contacted only").length;
  const firstGenerationCount = records.filter((record) => ["Completed first generation", "Returned within 7 days"].includes(record.testProgress)).length;
  const returnedCount = records.filter((record) => record.testProgress === "Returned within 7 days").length;
  const explainCount = records.filter((record) => record.canExplain === "Yes").length;
  const moatCount = records.filter((record) => ["Brand Brain", "Content Studio", "Learning loop", "Content Library"].includes(record.primaryValue)).length;
  const buyingCount = records.filter((record) => record.buyingQuestion === "Yes").length;
  const paidIntentCount = records.filter((record) => Number(record.purchaseIntent || 0) >= 4).length;
  const reuseSignalCount = records.filter(hasReuseSignal).length;
  const confusedCount = records.filter((record) =>
    ["AI script generator", "Prompt pack", "Website template"].includes(record.productCategory)
  ).length;

  const verdict =
    contactedCount >= 20 && productTestCount >= 5 && firstGenerationCount >= 5 && returnedCount >= 2 && paidIntentCount >= 1
      ? "Validation threshold reached: repeat-use and paid signal exist. Review the evidence before expanding scope."
      : total >= 5 && confusedCount > moatCount
        ? "Positioning risk: testers still see a generic AI or template product. Tighten the first task and repeat-use story."
        : "Evidence is incomplete: keep recruiting and record the actual task outcome, not only opinions.";

  return { total, contactedCount, productTestCount, firstGenerationCount, returnedCount, explainCount, moatCount, buyingCount, paidIntentCount, reuseSignalCount, confusedCount, verdict };
}

function renderScorePanel() {
  const summary = summarizeRecords();
  scorePanel.innerHTML = `
    <article><span>Qualified contacts</span><strong>${summary.contactedCount}/20</strong><p>Record each real contact from Reddit, X, Instagram, referral, or another channel.</p></article>
    <article><span>Product tests</span><strong>${summary.productTestCount}/5</strong><p>Tester replied or completed a product task.</p></article>
    <article><span>First generations</span><strong>${summary.firstGenerationCount}/5</strong><p>Tester completed the first Brand Brain to content flow.</p></article>
    <article><span>7-day returns</span><strong>${summary.returnedCount}/2</strong><p>Tester reopened after the first task or real publish.</p></article>
    <article><span>Paid signal</span><strong>${summary.paidIntentCount}/1</strong><p>Purchase intent score is 4 or 5.</p></article>
    <article class="beta-verdict"><span>Current verdict</span><strong>${summary.verdict}</strong><p>Do not overbuild until this signal improves.</p></article>
  `;
}

function renderRecords() {
  if (!records.length) {
    recordList.innerHTML = `
      <article class="empty-beta-record">
        <strong>No market-test records yet</strong>
        <p>Log each real contact, then update the same record after a reply, first generation, or seven-day return.</p>
      </article>
    `;
    renderScorePanel();
    return;
  }

  recordList.innerHTML = records
    .slice()
    .reverse()
    .map(
      (record, index) => `
        <article>
          <span>${record.date} / ${record.channel || "Channel not recorded"} / ${record.persona}</span>
          <strong>${record.testerName || `Tester ${records.length - index}`}</strong>
          <p><b>Signal:</b> ${getSignal(record)} / <b>Primary value:</b> ${record.primaryValue}</p>
          <p><b>Category they used:</b> ${record.productCategory}</p>
          <p><b>Task outcome:</b> ${record.testProgress || "Not recorded"}</p>
          <p><b>Reuse:</b> ${record.reuseSignal || "Not recorded"} / intent ${record.reuseIntent || "?"}/5</p>
          <p><b>Quote:</b> ${record.notableQuote || "No quote saved."}</p>
          <small>Price: ${record.priceReaction} / intent ${record.purchaseIntent}/5 / buying question: ${record.buyingQuestion}</small>
        </article>
      `
    )
    .join("");
  renderScorePanel();
}

function saveRecord(event) {
  event.preventDefault();
  const data = getFormData();
  records.push({
    ...data,
    testProgress: data.testProgress || "Contacted only",
    id: crypto.randomUUID(),
    date: new Date().toISOString().slice(0, 10),
  });
  persist();
  renderRecords();
  form.reset();
  showToast("Beta test recorded");
}

function exportMarkdown() {
  const summary = summarizeRecords();
  const retentionImprovements = records
    .filter((record) => record.retentionImprovement || hasReuseSignal(record))
    .map(
      (record) =>
        `- ${record.testerName || record.persona}: ${record.retentionImprovement || record.reuseSignal || "No repeat-use improvement note added."}`
    )
    .join("\n");
  const body = records
    .map(
      (record, index) => `## Test ${index + 1}: ${record.testerName || "Unnamed tester"}

- Channel: ${record.channel || "Not recorded"}
- Persona: ${record.persona}
- Task progress: ${record.testProgress || "Not recorded"}
- Product category they used: ${record.productCategory}
- Can explain without help: ${record.canExplain}
- Primary value: ${record.primaryValue}
- Buying question: ${record.buyingQuestion}
- Price reaction: ${record.priceReaction}
- Purchase intent: ${record.purchaseIntent}/5
- Reuse signal: ${record.reuseSignal || "Not recorded"}
- Reuse intent: ${record.reuseIntent || "Not recorded"}/5
- Missing proof: ${record.missingProof || "Not recorded"}
- Next retention improvement: ${record.retentionImprovement || "Not recorded"}
- Notable quote: ${record.notableQuote || "Not recorded"}
- Signal: ${getSignal(record)}`
    )
    .join("\n\n");

  const markdown = `# ShortForm Content OS Beta Test Log

## Summary

- Records logged: ${summary.total}
- Qualified contacts: ${summary.contactedCount}/20
- Product tests: ${summary.productTestCount}/5
- First generations: ${summary.firstGenerationCount}/5
- 7-day returns: ${summary.returnedCount}/2
- Can explain it: ${summary.explainCount}
- Core value recognized: ${summary.moatCount}
- Buying questions: ${summary.buyingCount}
- Paid intent: ${summary.paidIntentCount}
- Reuse/retention signals: ${summary.reuseSignalCount}
- Confused with generic AI/template: ${summary.confusedCount}
- Verdict: ${summary.verdict}

## Next Retention Improvements

${retentionImprovements || "No retention improvement notes yet. Ask what would make testers reopen after their first content project."}

${body || "No records yet."}
`;

  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "shortform-content-os-beta-test-log.md";
  link.click();
  URL.revokeObjectURL(url);
  showToast("Beta log exported");
}

form.addEventListener("submit", saveRecord);
exportBtn.addEventListener("click", exportMarkdown);
resetBtn.addEventListener("click", () => {
  form.reset();
  showToast("Form cleared");
});

renderRecords();
