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
