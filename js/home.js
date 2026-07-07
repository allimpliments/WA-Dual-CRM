// ======================================
// WA DUAL CRM PREMIUM LANDING
// home.js (FULL UPGRADED)
// ======================================

document.addEventListener("DOMContentLoaded", () => {
  initLenis();
  initNavbar();
  initScrollProgress();
  initSmoothLinks();
  initCounterAnimation();
  initFaqAccordion();
  initMobileEffects();
});

// ======================================
// LENIS SMOOTH SCROLL
// ======================================
function initLenis() {
  if (typeof Lenis === "undefined") return;
  const lenis = new Lenis({ duration: 1.2, smoothWheel: true, smoothTouch: true, wheelMultiplier: 1 });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
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
      navbar.style.background = "rgba(8,8,8,.75)";
      navbar.style.backdropFilter = "blur(24px)";
      navbar.style.borderBottom = "1px solid rgba(255,255,255,.08)";
    } else {
      navbar.style.background = "rgba(8,8,8,.50)";
    }
  });
}

// ======================================
// SCROLL PROGRESS
// ======================================
function initScrollProgress() {
  const progress = document.getElementById("scrollProgress");
  if (!progress) return;
  window.addEventListener("scroll", () => {
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    progress.style.width = (winScroll / height) * 100 + "%";
  });
}

// ======================================
// SMOOTH SECTION LINKS
// ======================================
function initSmoothLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", e => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      if (window.lenis) {
        window.lenis.scrollTo(target, { offset: 0, duration: 1.5 });
      } else {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      // Close mobile nav if open
      document.getElementById("mainNav")?.classList.remove("open");
      document.querySelector(".hamburger")?.classList.remove("active");
    });
  });
}

// ======================================
// COUNTER ANIMATION
// ======================================
function initCounterAnimation() {
  const counters = document.querySelectorAll(".stat-card h3");
  if (!counters.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
  const original = el.innerText;
  const numeric = parseInt(original.replace(/[^0-9]/g, ""));
  if (!numeric) return;
  let current = 0;
  const increment = numeric / 60;
  const timer = setInterval(() => {
    current += increment;
    if (current >= numeric) {
      el.innerText = original;
      clearInterval(timer);
    } else {
      const suffix = original.replace(/[0-9]/g, "");
      el.innerText = Math.floor(current) + suffix;
    }
  }, 25);
}

// ======================================
// FAQ ACCORDION
// ======================================
function initFaqAccordion() {
  document.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", function() {
      const item = this.parentElement;
      const isActive = item.classList.contains("active");
      // Close others
      document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("active"));
      if (!isActive) item.classList.add("active");
    });
  });
}

// ======================================
// ACTIVE MENU
// ======================================
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll("nav a");
window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(section => {
    const top = section.offsetTop - 150;
    if (pageYOffset >= top && pageYOffset < top + section.offsetHeight) {
      current = section.getAttribute("id");
    }
  });
  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active");
    }
  });
});

// ======================================
// MOBILE NAV TOGGLE
// ======================================
window.toggleMobileNav = function() {
  const nav = document.getElementById("mainNav");
  const hamburger = document.querySelector(".hamburger");
  nav.classList.toggle("open");
  hamburger.classList.toggle("active");
};

// ======================================
// MODAL FUNCTIONS
// ======================================
window.openModal = function(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("active");
  document.body.style.overflow = "hidden";
};

window.closeModal = function(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("active");
  document.body.style.overflow = "";
};

// Close modal on backdrop click
document.querySelectorAll(".modal").forEach(modal => {
  modal.addEventListener("click", function(e) {
    if (e.target === this) this.classList.remove("active");
    document.body.style.overflow = "";
  });
});

// ======================================
// AUTH FUNCTIONS (Fixed)
// ======================================
let authMode = "login";

window.showAuth = function(type) {
  authMode = type;
  const modal = document.getElementById("authModal");
  const title = document.getElementById("authModalTitle");
  const nameField = document.getElementById("regName");
  const btn = document.getElementById("authActionBtn");
  const toggleText = document.getElementById("authToggleText");

  if (type === "register") {
    title.innerText = "Create Free Account";
    nameField.style.display = "block";
    btn.innerText = "Start Free Trial";
    toggleText.innerHTML = `Already have an account? <a href="#" onclick="toggleAuthForm()">Login</a>`;
  } else {
    title.innerText = "Welcome Back";
    nameField.style.display = "none";
    btn.innerText = "Login";
    toggleText.innerHTML = `Don't have an account? <a href="#" onclick="toggleAuthForm()">Sign Up</a>`;
  }
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
};

window.toggleAuthForm = function() {
  showAuth(authMode === "login" ? "register" : "login");
};

window.handleAuth = async function() {
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  const name = document.getElementById("regName")?.value?.trim();
  const btn = document.getElementById("authActionBtn");

  if (!email || password.length < 6) {
    alert("Please fill all fields correctly (password min 6 chars).");
    return;
  }

  // Loading state
  const originalText = btn.innerText;
  btn.innerText = "Loading...";
  btn.disabled = true;
  btn.classList.add("loading");

  try {
    if (authMode === "register") {
      if (!name) { alert("Please enter your name."); return; }
      const cred = await firebase.auth().createUserWithEmailAndPassword(email, password);
      await firebase.firestore().collection("users").doc(cred.user.uid).set({
        name: name,
        email: email,
        role: "client",
        plan: "free",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert("Account created! Redirecting to app...");
      window.location.href = "index.html";
    } else {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      alert("Login successful! Redirecting...");
      window.location.href = "index.html";
    }
  } catch (err) {
    alert("Error: " + err.message);
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
    btn.classList.remove("loading");
  }
};

// ======================================
// DEMO MODAL
// ======================================
window.openDemoModal = function() {
  document.getElementById("demoModal").classList.add("active");
  document.body.style.overflow = "hidden";
};

window.submitDemo = function() {
  const name = document.getElementById("demoName").value.trim();
  const email = document.getElementById("demoEmail").value.trim();
  if (!name || !email) {
    document.getElementById("demoResult").innerHTML = '<span style="color:#f87171;">Please fill all required fields.</span>';
    return;
  }
  document.getElementById("demoResult").innerHTML = '<span style="color:#34d399;">✅ Thank you! We will contact you shortly.</span>';
  document.getElementById("demoName").value = "";
  document.getElementById("demoEmail").value = "";
  document.getElementById("demoPhone").value = "";
};

// ======================================
// VIDEO MODAL
// ======================================
window.openVideoModal = function() {
  document.getElementById("videoModal").classList.add("active");
  document.body.style.overflow = "hidden";
};

// ======================================
// CONTACT FORM (Firebase)
// ======================================
window.submitContact = async function() {
  const n = document.getElementById("contactName")?.value?.trim();
  const e = document.getElementById("contactEmail")?.value?.trim();
  const ph = document.getElementById("contactPhone")?.value?.trim();
  const m = document.getElementById("contactMessage")?.value?.trim();
  const result = document.getElementById("contactResult");
  if (!n || !e || !m) {
    result.innerHTML = '<span style="color:#f87171;">Please fill required fields.</span>';
    return;
  }
  try {
    await firebase.firestore().collection("contact_inquiries").add({
      name: n, email: e, phone: ph, message: m,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    result.innerHTML = '<span style="color:#34d399;">✅ Thank you! We\'ll get back shortly.</span>';
    document.getElementById("contactName").value = "";
    document.getElementById("contactEmail").value = "";
    document.getElementById("contactPhone").value = "";
    document.getElementById("contactMessage").value = "";
  } catch (err) {
    result.innerHTML = '<span style="color:#f87171;">❌ Error. Please try again.</span>';
  }
};

window.openContactForm = function() {
  document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
};

// ======================================
// MAGNETIC BUTTONS
// ======================================
document.querySelectorAll(".btn-primary, .btn-secondary").forEach(button => {
  button.addEventListener("mousemove", e => {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    button.style.transform = `translate(${x * .12}px, ${y * .12}px)`;
  });
  button.addEventListener("mouseleave", () => {
    button.style.transform = "translate(0,0)";
  });
});

// ======================================
// KEYBOARD & TOUCH NAVIGATION (Snap)
// ======================================
document.addEventListener("keydown", e => {
  const sectionList = [...document.querySelectorAll(".snap-section")];
  if (!sectionList.length) return;
  const current = sectionList.findIndex(section => {
    const rect = section.getBoundingClientRect();
    return rect.top >= -100 && rect.top <= 200;
  });
  if (e.key === "ArrowDown") {
    const next = sectionList[current + 1];
    if (next) next.scrollIntoView({ behavior: "smooth" });
  }
  if (e.key === "ArrowUp") {
    const prev = sectionList[current - 1];
    if (prev) prev.scrollIntoView({ behavior: "smooth" });
  }
});

let touchStartY = 0;
document.addEventListener("touchstart", e => { touchStartY = e.changedTouches[0].clientY; });
document.addEventListener("touchend", e => {
  const diff = touchStartY - e.changedTouches[0].clientY;
  const sections = [...document.querySelectorAll(".snap-section")];
  const current = sections.findIndex(section => {
    const rect = section.getBoundingClientRect();
    return rect.top >= -100 && rect.top <= 200;
  });
  if (Math.abs(diff) < 80) return;
  if (diff > 0) { const next = sections[current + 1]; if (next) next.scrollIntoView({ behavior: "smooth" }); }
  else { const prev = sections[current - 1]; if (prev) prev.scrollIntoView({ behavior: "smooth" }); }
});
