if (window.lucide) {
  window.lucide.createIcons();
}

document.querySelectorAll("[data-checkout-tier]").forEach((link) => {
  const tier = link.dataset.checkoutTier;
  const checkout = window.SHORTFORM_CHECKOUT?.[tier];
  if (checkout) {
    link.href = checkout;
  }
  link.target = "_blank";
  link.rel = "noopener";
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const componentSearch = document.getElementById("componentSearch");
const filterButtons = Array.from(document.querySelectorAll(".library-filter"));
const cards = Array.from(document.querySelectorAll(".component-card"));
const sections = Array.from(document.querySelectorAll(".library-section"));

if (componentSearch && cards.length) {
  const applyFilter = () => {
    const query = componentSearch.value.trim().toLowerCase();
    const activeFilter = document.querySelector(".library-filter.is-active")?.dataset.filter || "all";

    cards.forEach((card) => {
      const tags = (card.dataset.tags || "").toLowerCase();
      const matchesQuery = !query || tags.includes(query) || card.textContent.toLowerCase().includes(query);
      const section = card.closest(".library-section");
      const matchesSection =
        activeFilter === "all" ||
        (section && section.dataset.section === activeFilter) ||
        tags.includes(activeFilter);
      card.hidden = !(matchesQuery && matchesSection);
    });

    sections.forEach((section) => {
      const visibleCards = section.querySelectorAll(".component-card:not([hidden])");
      section.hidden = visibleCards.length === 0;
    });
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      applyFilter();
    });
  });

  componentSearch.addEventListener("input", applyFilter);
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      const panel = componentSearch.closest(".library-search");
      if (!panel) return;
      event.preventDefault();
      componentSearch.focus();
      componentSearch.select();
    }
  });

  applyFilter();
}
