// home.js – Navigation, scroll snap, testimonials, auth, custom plan

// ========== Feature Data ==========
const featureData = {
  whatsapp: [
    {icon:'fa-whatsapp',title:'Live Chat — All Platforms',desc:'Unified inbox: WhatsApp, FB, Instagram, LinkedIn, YouTube.'},
    {icon:'fa-robot',title:'AI Chatbot (Gemini & ChatGPT)',desc:'Multi‑AI support. Keyword triggers, flows, handoff. No per‑message cost.'},
    {icon:'fa-rocket',title:'Campaigns — Bulk & Drip',desc:'Send thousands. Drip sequences. Personalization. Analytics.'},
    {icon:'fa-comment-dots',title:'WhatsApp Flows',desc:'Interactive conversations. Meta templates + visual builder.'},
    {icon:'fa-palette',title:'Template Builder',desc:'Sync templates. Variables, buttons, quick replies.'},
    {icon:'fa-bell',title:'Smart Notifications',desc:'Order alerts, payment reminders, delivery updates.'}
  ],
  crm: [
    {icon:'fa-funnel-dollar',title:'Lead Management',desc:'10+ sources. Kanban pipeline, lead scoring, auto‑assign.'},
    {icon:'fa-users',title:'Contact Management',desc:'Groups, custom fields, CSV import/export.'},
    {icon:'fa-tasks',title:'Kanban Pipeline',desc:'7 stages, notes, follow‑ups, deal value.'},
    {icon:'fa-calendar-check',title:'Appointment System',desc:'Booking, Google Meet, WhatsApp reminders, telecalling.'},
    {icon:'fa-user-tie',title:'Agents & Clients',desc:'Role‑based access, team management, white‑label ready.'},
    {icon:'fa-shield-alt',title:'Enterprise Security',desc:'Firebase Auth, Firestore rules, Cloudflare Worker.'}
  ],
  ecommerce: [
    {icon:'fa-store',title:'Multi‑Platform Hub',desc:'Shopify, WooCommerce, Wix, Dukaan.'},
    {icon:'fa-shopping-cart',title:'Cart Recovery',desc:'Auto‑remind via WhatsApp.'},
    {icon:'fa-truck',title:'Shipping Updates',desc:'Live tracking & delivery confirmations.'},
    {icon:'fa-star',title:'Review Collection',desc:'Post‑delivery review requests.'}
  ],
  automation: [
    {icon:'fa-robot',title:'Chatbot Flows',desc:'Visual builder: message, question, input, condition.'},
    {icon:'fa-clock',title:'Drip Sequences',desc:'Automated follow‑ups with custom delays.'},
    {icon:'fa-plug',title:'30+ Integrations',desc:'Zapier, Stripe, Razorpay, Sheets, Slack.'},
    {icon:'fa-code',title:'API Access',desc:'REST API & webhooks for custom integrations.'}
  ],
  analytics: [
    {icon:'fa-chart-bar',title:'Real‑time Dashboards',desc:'Leads, conversions, campaigns, revenue.'},
    {icon:'fa-file-alt',title:'Exportable Reports',desc:'CSV/PDF exports. Scheduled reports.'},
    {icon:'fa-chart-pie',title:'Lead Sources',desc:'Track best performing channels.'},
    {icon:'fa-bullseye',title:'ROI Calculator',desc:'Project WhatsApp revenue.'}
  ],
  marketing: [
    {icon:'fa-ad',title:'Meta Ads Manager',desc:'Create & sync lead forms.'},
    {icon:'fa-google',title:'Google Ads',desc:'Track conversions, auto‑capture leads.'},
    {icon:'fa-envelope',title:'Email Campaigns (Coming Soon)',desc:'Integrated sequences.'},
    {icon:'fa-chart-line',title:'Performance Analytics',desc:'Ad ROI, cost per lead.'}
  ],
  social: [
    {icon:'fa-globe',title:'Multi‑Platform Posting',desc:'FB, IG, LinkedIn, Twitter, YouTube.'},
    {icon:'fa-calendar-alt',title:'Content Calendar',desc:'Drag‑drop scheduling.'},
    {icon:'fa-camera',title:'Media Library',desc:'Upload & reuse images/videos.'},
    {icon:'fa-chart-simple',title:'Social Analytics',desc:'Engagement, reach, follower growth.'}
  ]
};

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

// Dynamic text rotation
const phrases = ["Automate Your Sales", "Generate More Leads", "Engage Customers 24/7", "Scale with AI"];
let idx = 0;
setInterval(() => {
  document.getElementById('dynamicText').textContent = phrases[idx];
  idx = (idx + 1) % phrases.length;
}, 2000);

// Scroll Snap active section detection & initial visibility
const sections = document.querySelectorAll('.snap-section');
const navLinks = document.querySelectorAll('.nav-link');
const header = document.getElementById('header');
const observerOptions = { threshold: 0.6 };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.target === id) link.classList.add('active');
      });
    }
  });
}, observerOptions);
sections.forEach(section => {
  observer.observe(section);
  if (section.getBoundingClientRect().top < window.innerHeight) {
    section.classList.add('in-view');
  }
});
window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 50));

// Nav link click: smooth scroll to target section
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.dataset.target;
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const current = [...sections].find(s => s.getBoundingClientRect().top >= -100);
    const next = e.key === 'ArrowDown' ? current?.nextElementSibling : current?.previousElementSibling;
    if (next && next.classList.contains('snap-section')) next.scrollIntoView({ behavior: 'smooth' });
  }
});

// Touch swipe
let touchStartY = 0;
document.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; });
document.addEventListener('touchend', e => {
  const diff = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(diff) > 60) {
    const current = [...sections].find(s => s.getBoundingClientRect().top >= -100);
    if (diff > 0) current?.nextElementSibling?.scrollIntoView({ behavior: 'smooth' });
    else current?.previousElementSibling?.scrollIntoView({ behavior: 'smooth' });
  }
});

// Testimonials Slider
const testimonials = [
  { initials:'RS', name:'Rahul Sharma', role:'Real Estate Agent, Mumbai', text:'"11 Avatar CRM ne hamari lead conversion 3x kar di! WhatsApp automation se response time minutes se seconds mein aa gaya."' },
  { initials:'PP', name:'Priya Patel', role:'E-commerce Owner, Ahmedabad', text:'"AI chatbot Gemini aur ChatGPT dono support karta hai, 80% queries auto handle. Support team ka load 60% kam hua."' },
  { initials:'AK', name:'Amit Kumar', role:'Marketing Head, Delhi', text:'"Campaign management ne sales 40% badha di. Drip sequences set karo aur bhool jao."' },
  { initials:'SD', name:'Sneha Desai', role:'Clinic Manager, Pune', text:'"Appointment reminders ne no‑show rate 70% kam kar diya. WhatsApp reminders patients ko bohot pasand aaye."' },
  { initials:'VJ', name:'Vikram Joshi', role:'Retail Chain Owner, Jaipur', text:'"E‑commerce integration ne order updates seamless kar diye. Customers happy, team happy."' },
  { initials:'NS', name:'Neha Singh', role:'Freelancer, Bangalore', text:'"Free AI chatbot se leads 24/7 qualify hote hain. Mera personal assistant jaisa kaam karta hai."' },
  { initials:'RM', name:'Rohit Mehta', role:'Real Estate, Gurgaon', text:'"WhatsApp API setup 2 minute mein ho gaya. Ab tak ki best CRM investment."' },
  { initials:'AP', name:'Ankit Patel', role:'Education Consultant, Surat', text:'"Form builder aur lead capture ne admission process 2x fast kar diya."' },
  { initials:'KS', name:'Kavita Sharma', role:'Beauty Salon Chain, Indore', text:'"Social media posting ek jagah se ho jati hai. Time bachta hai aur brand consistent lagta hai."' },
  { initials:'DY', name:'Deepak Yadav', role:'Logistics, Lucknow', text:'"Bulk campaigns se driver update bhejna ab simple hai. Customer satisfaction up."' }
];

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

// Custom Plan Request
function requestCustomPlan() {
  const email = document.getElementById('customEmail').value.trim();
  if (!email) return alert('Please enter your email.');
  const modules = Array.from(document.querySelectorAll('#customModules input:checked')).map(cb => cb.value);
  if (modules.length === 0) return alert('Select at least one module.');
  alert(`Thanks! We'll send a custom ${modules.join(', ')} plan to ${email}.`);
}

// ========== AUTH & CONTACT (unchanged from original) ==========
function showAuth(type) {
  const isLogin = type === 'login';
  document.getElementById('authModal').innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
      <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:28px;width:400px;max-width:90vw;" onclick="event.stopPropagation()">
        <button class="btn-close btn-close-white position-absolute top-0 end-0 mt-2 me-2" onclick="document.getElementById('authModal').innerHTML=''"></button>
        <h4 class="text-center mb-3" style="color:var(--white);">${isLogin ? 'Welcome Back' : 'Start Free Trial'}</h4>
        ${!isLogin ? '<input type="text" id="regName" class="form-control mb-2" style="background:var(--dark);border-color:var(--border);color:#fff;" placeholder="Full Name">' : ''}
        <input type="email" id="authEmail" class="form-control mb-2" style="background:var(--dark);border-color:var(--border);color:#fff;" placeholder="Email">
        <input type="password" id="authPassword" class="form-control mb-3" style="background:var(--dark);border-color:var(--border);color:#fff;" placeholder="Password">
        <button class="btn btn-primary w-100" onclick="${isLogin ? 'doLogin()' : 'doRegister()'}">${isLogin ? 'Login' : 'Create Free Account'}</button>
        <p class="text-center mt-2 small" style="color:var(--text);">${isLogin ? "Don't have account?" : "Already have account?"} <a href="#" style="color:var(--gold);" onclick="showAuth('${isLogin ? 'register' : 'login'}')">${isLogin ? 'Sign Up' : 'Login'}</a></p>
      </div>
    </div>`;
}

async function doRegister() {
  const n = document.getElementById('regName')?.value?.trim();
  const e = document.getElementById('authEmail').value.trim();
  const p = document.getElementById('authPassword').value;
  if (!n || !e || p.length < 6) return alert('Fill all fields!');
  try {
    const c = await firebase.auth().createUserWithEmailAndPassword(e, p);
    await firebase.firestore().collection('users').doc(c.user.uid).set({
      name:n, email:e, role:'client', plan:'free',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    window.location.href = '/WA-Dual-CRM/';
  } catch(err) { alert(err.message); }
}

async function doLogin() {
  const e = document.getElementById('authEmail').value.trim();
  const p = document.getElementById('authPassword').value;
  if (!e || !p) return alert('Enter email & password!');
  try {
    await firebase.auth().signInWithEmailAndPassword(e, p);
    window.location.href = '/WA-Dual-CRM/';
  } catch(err) { alert(err.message); }
}

async function submitContact() {
  const n = document.getElementById('contactName')?.value?.trim();
  const e = document.getElementById('contactEmail')?.value?.trim();
  const p = document.getElementById('contactPhone')?.value?.trim();
  const m = document.getElementById('contactMessage')?.value?.trim();
  if (!n || !e || !m) return alert('Fill required fields!');
  try {
    await firebase.firestore().collection('contact_inquiries').add({
      name:n, email:e, phone:p, message:m,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    document.getElementById('contactResult').innerHTML = '<span style="color:#34d399;">Thank you! We\'ll get back shortly.</span>';
  } catch(err) {
    document.getElementById('contactResult').innerHTML = '<span style="color:#f87171;">Error.</span>';
  }
}
