// home-animations.js — GSAP ScrollTrigger animations
gsap.registerPlugin(ScrollTrigger);

// Fade-up and blur reveal for all sections
document.querySelectorAll('.snap-section').forEach(section => {
  gsap.fromTo(section,
    { opacity: 0, y: 40, filter: 'blur(8px)' },
    {
      opacity: 1, y: 0, filter: 'blur(0px)',
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    }
  );
});

// Staggered cards in features
document.querySelectorAll('.features-grid .feature-card').forEach((card, i) => {
  gsap.from(card, {
    opacity: 0, y: 30, scale: 0.95,
    duration: 0.6,
    delay: i * 0.1,
    scrollTrigger: {
      trigger: card,
      start: 'top 90%',
      toggleActions: 'play none none reverse'
    }
  });
});

// Parallax for hero elements (if any)
gsap.to('.hero-title', {
  y: -50,
  ease: 'none',
  scrollTrigger: {
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true
  }
});
