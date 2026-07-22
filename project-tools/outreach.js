const OUTREACH_STATE_KEY = "shortform-content-os-outreach-state-v1";

const copyButtons = document.querySelectorAll("[data-copy-target]");
const checklistItems = document.querySelectorAll("[data-outreach-check]");
const toast = document.querySelector("#outreachToast");

let state = JSON.parse(localStorage.getItem(OUTREACH_STATE_KEY) || "{}");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1600);
}

function persist() {
  localStorage.setItem(OUTREACH_STATE_KEY, JSON.stringify(state));
}

function updateChecklistUi() {
  checklistItems.forEach((item) => {
    const key = item.dataset.outreachCheck;
    const checked = Boolean(state[key]);
    item.classList.toggle("complete", checked);
    const checkbox = item.querySelector("input");
    if (checkbox) checkbox.checked = checked;
  });
}

copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const target = document.querySelector(`#${button.dataset.copyTarget}`);
    if (!target) return;
    await navigator.clipboard.writeText(target.textContent.trim());
    showToast("Copied");
  });
});

checklistItems.forEach((item) => {
  item.addEventListener("click", () => {
    const key = item.dataset.outreachCheck;
    state[key] = !state[key];
    persist();
    updateChecklistUi();
  });
});

updateChecklistUi();
