const faqItems = document.querySelectorAll(".faq-item");
const leadForm = document.querySelector(".lead-form");
const cursorGlow = document.querySelector(".cursor-glow");
const revealTargets = document.querySelectorAll(".section, .contact, .logo-strip, .marquee-band, .subpage-hero");
const tiltCards = document.querySelectorAll(".tilt-card");
const magnets = document.querySelectorAll(".magnet, .primary-btn, .header-cta");

if (cursorGlow) {
  window.addEventListener("pointermove", (event) => {
    cursorGlow.style.transform = `translate3d(${event.clientX - 180}px, ${event.clientY - 180}px, 0)`;
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealTargets.forEach((target) => {
  target.classList.add("reveal");
  revealObserver.observe(target);
});

tiltCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${y * -8}deg) rotateY(${x * 10}deg) translateY(-4px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

magnets.forEach((item) => {
  item.addEventListener("pointermove", (event) => {
    const rect = item.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.16;
    item.style.transform = `translate(${x}px, ${y}px)`;
  });

  item.addEventListener("pointerleave", () => {
    item.style.transform = "";
  });
});

faqItems.forEach((item) => {
  item.addEventListener("click", () => {
    item.classList.toggle("open");
  });
});

leadForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = leadForm.querySelector("button");
  button.textContent = "Request captured";
  setTimeout(() => {
    button.textContent = "Send sprint request";
  }, 1800);
});
