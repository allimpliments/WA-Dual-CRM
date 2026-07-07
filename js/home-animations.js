// ============================================
// WA DUAL CRM PREMIUM LANDING
// home-animations.js
// GSAP + ScrollTrigger
// ============================================

gsap.registerPlugin(ScrollTrigger);

// ============================================
// GLOBAL SETTINGS
// ============================================

gsap.defaults({
  ease: "power3.out",
  duration: 1.2
});

// ============================================
// HERO INTRO
// ============================================

const heroTimeline = gsap.timeline();

heroTimeline
.from(".hero-badge", {
  opacity: 0,
  y: 30,
  duration: 0.8
})
.from(".hero-title", {
  opacity: 0,
  y: 60,
  duration: 1
}, "-=0.4")
.from(".hero-description", {
  opacity: 0,
  y: 40
}, "-=0.6")
.from(".hero-actions", {
  opacity: 0,
  y: 40
}, "-=0.6")
.from(".hero-stats .stat-card", {
  opacity: 0,
  y: 40,
  stagger: 0.12
}, "-=0.4");

// ============================================
// HERO FLOATING GLOW
// ============================================

gsap.to(".hero-bg", {
  scale: 1.1,
  duration: 10,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut"
});

// ============================================
// HERO GRID PARALLAX
// ============================================

gsap.to(".hero-grid", {
  backgroundPosition: "100px 100px",
  duration: 20,
  repeat: -1,
  ease: "none"
});

// ============================================
// SECTION REVEALS
// ============================================

gsap.utils.toArray(".section-header").forEach(section => {

  gsap.from(section, {

    opacity: 0,
    y: 80,

    scrollTrigger: {
      trigger: section,
      start: "top 80%",
      once: true
    }

  });

});

// ============================================
// GLASS CARDS
// ============================================

gsap.utils.toArray(".glass-card").forEach(card => {

  gsap.from(card, {

    opacity: 0,
    y: 80,
    scale: 0.92,

    scrollTrigger: {
      trigger: card,
      start: "top 85%",
      once: true
    }

  });

});

// ============================================
// FEATURE CARDS
// ============================================

gsap.from(".feature-card", {

  opacity: 0,
  y: 100,
  stagger: 0.12,

  scrollTrigger: {
    trigger: ".features-grid",
    start: "top 75%",
    once: true
  }

});

// ============================================
// SPLIT SECTION
// ============================================

gsap.from(".content-side", {

  opacity: 0,
  x: -80,

  scrollTrigger: {
    trigger: "#solution",
    start: "top 70%",
    once: true
  }

});

gsap.from(".visual-side", {

  opacity: 0,
  x: 80,

  scrollTrigger: {
    trigger: "#solution",
    start: "top 70%",
    once: true
  }

});

// ============================================
// DASHBOARD FLOAT
// ============================================

gsap.to(".dashboard-preview", {

  y: -15,

  duration: 3,

  repeat: -1,

  yoyo: true,

  ease: "sine.inOut"

});

// ============================================
// DASHBOARD PARALLAX
// ============================================

gsap.to(".dashboard-preview", {

  scrollTrigger: {

    trigger: "#solution",

    start: "top bottom",

    end: "bottom top",

    scrub: true

  },

  y: -120

});

// ============================================
// INTEGRATIONS
// ============================================

gsap.from(".integration-orbit div", {

  opacity: 0,
  scale: 0,
  rotate: 180,

  stagger: 0.08,

  scrollTrigger: {
    trigger: "#integrations",
    start: "top 70%",
    once: true
  }

});

// ============================================
// ICON FLOATING LOOP
// ============================================

document
.querySelectorAll(".integration-orbit div")
.forEach((icon,index)=>{

  gsap.to(icon,{

    y:-10,

    duration:
    2 + (index * 0.2),

    repeat:-1,

    yoyo:true,

    ease:"sine.inOut"

  });

});

// ============================================
// PRICING
// ============================================

gsap.from(".pricing-card", {

  opacity: 0,
  y: 120,

  stagger: 0.15,

  scrollTrigger: {
    trigger: "#pricing",
    start: "top 70%",
    once: true
  }

});

// ============================================
// CONTACT FORM
// ============================================

gsap.from(".contact-form", {

  opacity: 0,
  y: 80,

  scrollTrigger: {
    trigger: "#contact",
    start: "top 75%",
    once: true
  }

});

// ============================================
// FINAL CTA
// ============================================

gsap.from(".final-cta h2", {

  opacity: 0,
  y: 80,

  scrollTrigger: {
    trigger: ".final-cta",
    start: "top 70%",
    once: true
  }

});

gsap.from(".final-cta p", {

  opacity: 0,
  y: 60,

  scrollTrigger: {
    trigger: ".final-cta",
    start: "top 70%",
    once: true
  }

});

gsap.from(".final-cta .btn-primary", {

  opacity: 0,
  scale: 0.8,

  scrollTrigger: {
    trigger: ".final-cta",
    start: "top 70%",
    once: true
  }

});

// ============================================
// SCROLL SNAP DEPTH EFFECT
// ============================================

gsap.utils.toArray(".snap-section")
.forEach(section => {

  gsap.fromTo(section,

    {
      opacity: 0.85
    },

    {
      opacity: 1,

      scrollTrigger: {

        trigger: section,

        start: "top center",

        end: "bottom center",

        scrub: true

      }

    }

  );

});

// ============================================
// ACTIVE NAV UNDERLINE
// ============================================

const navLinks =
document.querySelectorAll("nav a");

navLinks.forEach(link => {

  link.addEventListener("mouseenter", () => {

    gsap.to(link, {
      color: "#c8a84e",
      duration: 0.2
    });

  });

  link.addEventListener("mouseleave", () => {

    if(!link.classList.contains("active")){

      gsap.to(link,{
        color:"#9ea5b3",
        duration:0.2
      });

    }

  });

});

// ============================================
// MOUSE PARALLAX HERO
// ============================================

const hero =
document.querySelector(".hero-section");

if(hero){

hero.addEventListener("mousemove",(e)=>{

const x =
(e.clientX / window.innerWidth) - 0.5;

const y =
(e.clientY / window.innerHeight) - 0.5;

gsap.to(".hero-bg",{

x:x * 50,
y:y * 50,

duration:1.5,

ease:"power2.out"

});

});

}

// ============================================
// WA FLOAT BUTTON PULSE
// ============================================

gsap.to(".wa-float",{

scale:1.08,

duration:1,

repeat:-1,

yoyo:true,

ease:"sine.inOut"

});

// ============================================
// REDUCED MOTION SUPPORT
// ============================================

if (
window.matchMedia(
'(prefers-reduced-motion: reduce)'
).matches
) {

ScrollTrigger.getAll().forEach(
trigger => trigger.kill()
);

gsap.globalTimeline.clear();

console.log(
"Reduced motion enabled"
);

}
