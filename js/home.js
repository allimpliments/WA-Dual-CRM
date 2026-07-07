// home.js — Immediately visible sections + navigation, testimonials, auth

// 1. Immediately make ALL sections visible (no waiting for observer)
document.querySelectorAll('.snap-section').forEach(s => s.classList.add('in-view'));

// 2. Intersection Observer ONLY for active nav link update
const sections = document.querySelectorAll('.snap-section');
const navLinks = document.querySelectorAll('.nav-link');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.target === id) link.classList.add('active');
      });
    }
  });
}, { threshold: 0.5 });

sections.forEach(section => observer.observe(section));

// 3. Header scroll effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 50));

// 4. Nav click smooth scroll
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(link.dataset.target);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// 5. Feature categories (same as before)
const featureData = { /* unchanged feature data object */ };
function renderFeatures(category) {
  const container = document.getElementById('featuresContainer');
  const features = featureData[category] || [];
  container.innerHTML = features.map(f => `
    <div class="feature-card">
      <i class="fas ${f.icon}"></i>
      <h4>${f.title}</h4>
      <p>${f.desc}</p>
    </div>
  `).join('');
}
document.querySelectorAll('.category-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    renderFeatures(this.dataset.category);
  });
});
renderFeatures('whatsapp');

// 6. Dynamic text rotation
const phrases = ["Automate Your Sales", "Generate More Leads", "Engage Customers 24/7", "Scale with AI"];
let idx = 0;
setInterval(() => {
  document.getElementById('dynamicText').textContent = phrases[idx];
  idx = (idx + 1) % phrases.length;
}, 2000);

// 7. Testimonials slider (unchanged)
const testimonials = [ /* same array */ ];
const track = document.getElementById('testimonialTrack');
const dotsContainer = document.getElementById('sliderDots');
let currentSlide = 0;
function buildSlider() {
  track.innerHTML = testimonials.map(t => `
    <div class="testimonial-slide">
      <div class="testimonial-card">
        <div class="chat-bubble">${t.text}</div>
        <div class="client-info">
          <div class="client-avatar">${t.initials}</div>
          <div><strong>${t.name}</strong><br><small>${t.role}</small></div>
        </div>
      </div>
    </div>
  `).join('');
  dotsContainer.innerHTML = testimonials.map((_, i) => `<span class="dot ${i===0?'active':''}" data-index="${i}"></span>`).join('');
  document.querySelectorAll('.dot').forEach(dot => dot.addEventListener('click', function() {
    goToSlide(parseInt(this.dataset.index));
  }));
}
function goToSlide(index) {
  currentSlide = index;
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
  document.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
  document.querySelector(`.dot[data-index="${currentSlide}"]`).classList.add('active');
}
buildSlider();
setInterval(() => {
  currentSlide = (currentSlide + 1) % testimonials.length;
  goToSlide(currentSlide);
}, 3000);

// 8. Custom plan request
function requestCustomPlan() {
  const email = document.getElementById('customEmail').value.trim();
  if (!email) return alert('Please enter your email.');
  const modules = Array.from(document.querySelectorAll('#customModules input:checked')).map(cb => cb.value);
  if (modules.length === 0) return alert('Select at least one module.');
  alert(`Thanks! We'll send a custom ${modules.join(', ')} plan to ${email}.`);
}

// 9. Auth & Contact (unchanged)
function showAuth(type) { /* same as before */ }
async function doRegister() { /* same */ }
async function doLogin() { /* same */ }
async function submitContact() { /* same */ }
