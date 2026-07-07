// ======================================
// WA DUAL CRM PREMIUM LANDING
// home.js
// ======================================

document.addEventListener("DOMContentLoaded", () => {

  initLenis();

  initNavbar();

  initScrollProgress();

  initSmoothLinks();

  initCounterAnimation();

  initMobileEffects();

});

// ======================================
// LENIS SMOOTH SCROLL
// ======================================

function initLenis() {

  if (typeof Lenis === "undefined") return;

  const lenis = new Lenis({
    duration: 1.2,
    smoothWheel: true,
    smoothTouch: true,
    wheelMultiplier: 1
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  window.lenis = lenis;
}

// ======================================
// NAVBAR
// ======================================

function initNavbar() {

  const navbar = document.querySelector(".navbar");

  if (!navbar) return;

  window.addEventListener("scroll", () => {

    if (window.scrollY > 40) {

      navbar.style.background =
        "rgba(8,8,8,.75)";

      navbar.style.backdropFilter =
        "blur(24px)";

      navbar.style.borderBottom =
        "1px solid rgba(255,255,255,.08)";

    } else {

      navbar.style.background =
        "rgba(8,8,8,.50)";

    }

  });

}

// ======================================
// SCROLL PROGRESS
// ======================================

function initScrollProgress() {

  const progress =
    document.getElementById(
      "scrollProgress"
    );

  if (!progress) return;

  window.addEventListener("scroll", () => {

    const winScroll =
      document.documentElement
        .scrollTop;

    const height =
      document.documentElement
        .scrollHeight -
      document.documentElement
        .clientHeight;

    const scrolled =
      (winScroll / height) * 100;

    progress.style.width =
      scrolled + "%";

  });

}

// ======================================
// SMOOTH SECTION LINKS
// ======================================

function initSmoothLinks() {

  const links =
    document.querySelectorAll(
      'a[href^="#"]'
    );

  links.forEach(link => {

    link.addEventListener(
      "click",
      e => {

        const targetId =
          link.getAttribute("href");

        if (
          !targetId ||
          targetId === "#"
        )
          return;

        const target =
          document.querySelector(
            targetId
          );

        if (!target) return;

        e.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }
    );

  });

}

// ======================================
// HERO COUNTERS
// ======================================

function initCounterAnimation() {

  const counters =
    document.querySelectorAll(
      ".stat-card h3"
    );

  if (!counters.length) return;

  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (
            !entry.isIntersecting
          )
            return;

          animateCounter(
            entry.target
          );

          observer.unobserve(
            entry.target
          );

        });

      },
      {
        threshold: 0.5
      }
    );

  counters.forEach(counter =>
    observer.observe(counter)
  );

}

// ======================================
// COUNTER ANIMATION
// ======================================

function animateCounter(el) {

  const original =
    el.innerText;

  const numeric =
    parseInt(
      original.replace(
        /[^0-9]/g,
        ""
      )
    );

  if (!numeric) return;

  let current = 0;

  const increment =
    numeric / 60;

  const timer =
    setInterval(() => {

      current += increment;

      if (current >= numeric) {

        el.innerText =
          original;

        clearInterval(timer);

      } else {

        const suffix =
          original.replace(
            /[0-9]/g,
            ""
          );

        el.innerText =
          Math.floor(current) +
          suffix;

      }

    }, 25);

}

// ======================================
// ACTIVE MENU
// ======================================

const sections =
  document.querySelectorAll(
    "section[id]"
  );

const navLinks =
  document.querySelectorAll(
    "nav a"
  );

window.addEventListener(
  "scroll",
  () => {

    let current = "";

    sections.forEach(section => {

      const top =
        section.offsetTop - 150;

      const height =
        section.offsetHeight;

      if (
        pageYOffset >= top &&
        pageYOffset <
          top + height
      ) {
        current =
          section.getAttribute(
            "id"
          );
      }

    });

    navLinks.forEach(link => {

      link.classList.remove(
        "active"
      );

      if (
        link.getAttribute(
          "href"
        ) ===
        "#" + current
      ) {
        link.classList.add(
          "active"
        );
      }

    });

  }
);

// ======================================
// KEYBOARD NAVIGATION
// ======================================

document.addEventListener(
  "keydown",
  e => {

    const sectionList =
      [
        ...document.querySelectorAll(
          ".snap-section"
        )
      ];

    if (
      !sectionList.length
    )
      return;

    const current =
      sectionList.findIndex(
        section => {

          const rect =
            section.getBoundingClientRect();

          return (
            rect.top >= -100 &&
            rect.top <= 200
          );

        }
      );

    if (
      e.key ===
      "ArrowDown"
    ) {

      const next =
        sectionList[
          current + 1
        ];

      if (next) {

        next.scrollIntoView({
          behavior:
            "smooth"
        });

      }

    }

    if (
      e.key ===
      "ArrowUp"
    ) {

      const prev =
        sectionList[
          current - 1
        ];

      if (prev) {

        prev.scrollIntoView({
          behavior:
            "smooth"
        });

      }

    }

  }
);

// ======================================
// TOUCH SWIPE
// ======================================

let touchStartY = 0;

document.addEventListener(
  "touchstart",
  e => {

    touchStartY =
      e.changedTouches[0]
        .clientY;

  }
);

document.addEventListener(
  "touchend",
  e => {

    const touchEndY =
      e.changedTouches[0]
        .clientY;

    const diff =
      touchStartY -
      touchEndY;

    const sections =
      [
        ...document.querySelectorAll(
          ".snap-section"
        )
      ];

    const current =
      sections.findIndex(
        section => {

          const rect =
            section.getBoundingClientRect();

          return (
            rect.top >= -100 &&
            rect.top <= 200
          );

        }
      );

    if (
      Math.abs(diff) < 80
    )
      return;

    if (diff > 0) {

      const next =
        sections[
          current + 1
        ];

      if (next) {

        next.scrollIntoView({
          behavior:
            "smooth"
        });

      }

    } else {

      const prev =
        sections[
          current - 1
        ];

      if (prev) {

        prev.scrollIntoView({
          behavior:
            "smooth"
        });

      }

    }

  }
);

// ======================================
// OPTIONAL MAGNETIC BUTTON
// ======================================

document
  .querySelectorAll(
    ".btn-primary"
  )
  .forEach(button => {

    button.addEventListener(
      "mousemove",
      e => {

        const rect =
          button.getBoundingClientRect();

        const x =
          e.clientX -
          rect.left -
          rect.width / 2;

        const y =
          e.clientY -
          rect.top -
          rect.height / 2;

        button.style.transform =
          `translate(${x * .12}px, ${y * .12}px)`;

      }
    );

    button.addEventListener(
      "mouseleave",
      () => {

        button.style.transform =
          "translate(0,0)";

      }
    );

  });

// ======================================
// AUTH PLACEHOLDER
// Existing Firebase logic remains
// ======================================

if (
  typeof showAuth !==
  "function"
) {

  window.showAuth =
    function(type) {

      console.log(
        "Auth:",
        type
      );

    };

}
