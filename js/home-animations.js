// ============================================
// WA DUAL CRM PREMIUM LANDING
// home-animations.js (FULLY FIXED)
// ============================================

gsap.registerPlugin(ScrollTrigger);

gsap.defaults({ ease: "power3.out", duration: 1.2 });

// ============================================
// HERO INTRO
// ============================================
const heroTimeline = gsap.timeline();
heroTimeline
  .from(".hero-badge", { opacity: 0, y: 30, duration: 0.8 })
  .from(".hero-title", { opacity: 0, y: 60, duration: 1 }, "-=0.4")
  .from(".hero-description", { opacity: 0, y: 40 }, "-=0.6")
  .from(".hero-actions", { opacity: 0, y: 40 }, "-=0.6")
  .from(".hero-stats .stat-card", { opacity: 0, y: 40, stagger: 0.12 }, "-=0.4");

// ============================================
// HERO FLOATING GLOW
// ============================================
gsap.to(".hero-bg", { scale: 1.1, duration: 10, repeat: -1, yoyo: true, ease: "sine.inOut" });

// ============================================
// SECTION REVEALS
// ============================================
gsap.utils.toArray(".section-header").forEach(section => {
  gsap.from(section, { opacity: 0, y: 80, scrollTrigger: { trigger: section, start: "top 80%", once: true } });
});

// ============================================
// DASHBOARD CHART BARS ANIMATION
// ============================================
gsap.from(".dash-chart-bars span", {
  height: 0,
  stagger: 0.1,
  duration: 1,
  scrollTrigger: { trigger: "#solution", start: "top 70%", once: true }
});

// ============================================
// DASHBOARD FLOAT
// ============================================
gsap.to(".dashboard-preview-real", { y: -15, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" });

// ============================================
// DASHBOARD PARALLAX
// ============================================
gsap.to(".dashboard-preview-real", {
  scrollTrigger: { trigger: "#solution", start: "top bottom", end: "bottom top", scrub: true },
  y: -120
});

// ============================================
// SPLIT SECTION
// ============================================
gsap.from(".content-side", { opacity: 0, x: -80, scrollTrigger: { trigger: "#solution", start: "top 70%", once: true } });
gsap.from(".visual-side", { opacity: 0, x: 80, scrollTrigger: { trigger: "#solution", start: "top 70%", once: true } });

// ============================================
// FEATURE CATEGORIES (STAGGER)
// ============================================
gsap.from(".feature-category", {
  opacity: 0,
  y: 100,
  stagger: 0.08,
  scrollTrigger: { trigger: ".features-categories", start: "top 75%", once: true }
});

// ============================================
// INTEGRATION CARDS
// ============================================
gsap.from(".integration-card", {
  opacity: 0,
  scale: 0.8,
  stagger: 0.08,
  scrollTrigger: { trigger: "#integrations", start: "top 70%", once: true }
});

// ============================================
// TESTIMONIALS
// ============================================
gsap.from(".testimonial-card", {
  opacity: 0,
  y: 80,
  stagger: 0.15,
  scrollTrigger: { trigger: "#testimonials", start: "top 75%", once: true }
});

// ============================================
// PRICING
// ============================================
gsap.from(".pricing-card", {
  opacity: 0,
  y: 120,
  stagger: 0.15,
  scrollTrigger: { trigger: "#pricing", start: "top 70%", once: true }
});

// ============================================
// FAQ
// ============================================
gsap.from(".faq-item", {
  opacity: 0,
  y: 60,
  stagger: 0.1,
  scrollTrigger: { trigger: "#faq", start: "top 75%", once: true }
});

// ============================================
// CONTACT FORM
// ============================================
gsap.from(".contact-form", {
  opacity: 0,
  y: 80,
  scrollTrigger: { trigger: "#contact", start: "top 75%", once: true }
});

// ============================================
// FINAL CTA
// ============================================
gsap.from(".final-cta h2", { opacity: 0, y: 80, scrollTrigger: { trigger: ".final-cta", start: "top 70%", once: true } });
gsap.from(".final-cta p", { opacity: 0, y: 60, scrollTrigger: { trigger: ".final-cta", start: "top 70%", once: true } });
gsap.from(".final-cta .btn-primary", { opacity: 0, scale: 0.8, scrollTrigger: { trigger: ".final-cta", start: "top 70%", once: true } });

// ============================================
// WHATSAPP FLOAT PULSE
// ============================================
gsap.to(".wa-float", { scale: 1.08, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut" });

// ============================================
// REDUCED MOTION SUPPORT
// ============================================
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  gsap.globalTimeline.clear();
}
