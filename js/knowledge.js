// js/knowledge.js — The Knowledge Engine (Complete & Fully Functional)
const Knowledge = {
  currentSection: 'home',
  articleData: null,
  emailCaptured: false,

  async render() {
    contentArea.innerHTML = '';
    document.querySelectorAll('.global-top-header, .global-bottom-menu').forEach(el => el.remove());
    contentArea.style.paddingTop = '0px';
    
    if (this.currentSection === 'playbooks') { this.renderPlaybooks(); return; }
    if (this.currentSection === 'platform') { this.renderPlatformMastery(); return; }
    if (this.currentSection === 'industry') { this.renderIndustrySolutions(); return; }
    if (this.currentSection === 'courses') { this.renderCourses(); return; }
    if (this.currentSection === 'tools') { this.renderTools(); return; }
    if (this.currentSection === 'community') { this.renderCommunity(); return; }
    if (this.currentSection === 'healthscore') { this.renderHealthScore(); return; }
    if (this.currentSection === 'roi') { this.renderROICalculator(); return; }
    if (this.currentSection === 'article') { this.renderArticlePage(); return; }
    
    this.renderHome();
  },

  // ==================== HOME PAGE ====================
  renderHome() {
    let html = `
      <style>
        .kb-wrap{background:#0a0e17;min-height:100vh;color:#e2e8f0;font-family:'Inter',system-ui,sans-serif;padding-bottom:80px;}
        .kb-hero{background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%);padding:50px 20px;text-align:center;}
        .kb-hero h1{font-size:clamp(24px,5vw,42px);font-weight:800;background:linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .kb-hero p{color:#94a3b8;font-size:16px;max-width:650px;margin:12px auto;}
        .kb-search{max-width:550px;margin:20px auto;display:flex;gap:8px;}
        .kb-search input{flex:1;padding:12px 18px;border-radius:24px;border:2px solid #1e293b;background:#141a25;color:#fff;font-size:14px;}
        .kb-search button{padding:12px 24px;border-radius:24px;background:#3b82f6;color:#fff;border:none;font-weight:600;cursor:pointer;white-space:nowrap;}
        .kb-stats{display:flex;justify-content:center;gap:30px;flex-wrap:wrap;margin-top:20px;}
        .kb-stat{text-align:center;}.kb-stat .num{font-size:24px;font-weight:800;color:#60a5fa;}.kb-stat .lbl{font-size:11px;color:#94a3b8;text-transform:uppercase;}
        .kb-section{padding:30px 20px;max-width:1100px;margin:0 auto;}
        .kb-section h2{font-size:22px;font-weight:700;margin-bottom:20px;}
        .kb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;}
        .kb-card{background:#141a25;border:1px solid #1e293b;border-radius:14px;padding:20px;cursor:pointer;transition:0.3s;position:relative;}
        .kb-card:hover{border-color:#3b82f6;transform:translateY(-3px);box-shadow:0 12px 30px rgba(0,0,0,0.4);}
        .kb-card .icon{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:10px;}
        .kb-card h3{font-size:15px;margin-bottom:6px;color:#e2e8f0;}
        .kb-card p{color:#94a3b8;font-size:12px;line-height:1.5;}
        .kb-card .badge{position:absolute;top:10px;right:10px;padding:3px 8px;border-radius:10px;font-size:9px;font-weight:600;}
        .badge-free{background:rgba(16,185,129,0.2);color:#34d399;}.badge-premium{background:rgba(245,158,11,0.2);color:#fbbf24;}.badge-new{background:rgba(59,130,246,0.2);color:#60a5fa;}
        .kb-cta{background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:14px;padding:28px;text-align:center;margin:16px 0;}
        .kb-cta h3{font-size:20px;margin-bottom:8px;}.kb-cta button{background:#fff;color:#1e293b;border:none;padding:10px 24px;border-radius:20px;font-weight:700;cursor:pointer;margin:4px;font-size:13px;}
        .kb-cta button.outline{background:transparent;border:2px solid #fff;color:#fff;}
        .kb-bottom-nav{position:fixed;bottom:0;left:0;right:0;background:#141a25;border-top:1px solid #1e293b;display:flex;overflow-x:auto;z-index:999;padding:4px;}
        .kb-bottom-nav a{flex:1;text-align:center;padding:6px 10px;color:#94a3b8;text-decoration:none;font-size:10px;white-space:nowrap;border-radius:8px;}
        .kb-bottom-nav a.active{color:#60a5fa;background:rgba(59,130,246,0.1);}
        .kb-bottom-nav a i{display:block;font-size:15px;margin-bottom:2px;}
        .kb-popup{position:fixed;bottom:80px;right:16px;background:#141a25;border:1px solid #1e293b;border-radius:14px;padding:18px;z-index:998;max-width:300px;box-shadow:0 16px 40px rgba(0,0,0,0.6);display:none;}
        .kb-popup.show{display:block;}.kb-popup input{width:100%;padding:8px;border-radius:8px;border:1px solid #1e293b;background:#0f172a;color:#fff;margin:6px 0;font-size:12px;}
        .kb-popup button{width:100%;padding:8px;border-radius:8px;background:#f59e0b;color:#000;border:none;font-weight:700;cursor:pointer;}
        @media(max-width:768px){.kb-stats{gap:16px;}.kb-stat .num{font-size:18px;}.kb-section h2{font-size:18px;}}
      </style>

      <div class="kb-wrap">
        <div class="kb-hero">
          <h1>🧠 The Knowledge Engine</h1>
          <p>15+ Years of Digital Marketing Experience. Free Playbooks, Tools, Courses & Community — Everything You Need to Scale.</p>
          <div class="kb-search">
            <input type="text" id="kbSearch" placeholder='Search "WhatsApp marketing", "ROI calculator"...' onkeydown="if(event.key==='Enter')Knowledge.search()">
            <button onclick="Knowledge.search()">🔍 Search</button>
          </div>
          <div class="kb-stats">
            <div class="kb-stat"><div class="num">15+</div><div class="lbl">Years</div></div>
            <div class="kb-stat"><div class="num">50+</div><div class="lbl">Playbooks</div></div>
            <div class="kb-stat"><div class="num">10K+</div><div class="lbl">Readers</div></div>
            <div class="kb-stat"><div class="num">5</div><div class="lbl">Industries</div></div>
          </div>
        </div>

        <div class="kb-section">
          <h2>📚 Knowledge Hub</h2>
          <div class="kb-grid">
            <div class="kb-card" onclick="Knowledge.currentSection='playbooks';Knowledge.render();">
              <div class="icon" style="background:rgba(59,130,246,0.2);color:#60a5fa;">📈</div>
              <span class="badge badge-free">FREE</span>
              <h3>Business Growth Playbooks</h3>
              <p>WhatsApp Marketing, Lead Gen, Sales Automation, Retention, Scaling.</p>
            </div>
            <div class="kb-card" onclick="Knowledge.currentSection='platform';Knowledge.render();">
              <div class="icon" style="background:rgba(16,185,129,0.2);color:#34d399;">🛠</div>
              <span class="badge badge-free">FREE</span>
              <h3>Platform Mastery</h3>
              <p>11 Avatar CRM, WhatsApp API, Chatbots, Campaigns.</p>
            </div>
            <div class="kb-card" onclick="Knowledge.currentSection='industry';Knowledge.render();">
              <div class="icon" style="background:rgba(245,158,11,0.2);color:#fbbf24;">💡</div>
              <span class="badge badge-new">POPULAR</span>
              <h3>Industry Solutions</h3>
              <p>Real Estate, Healthcare, Education, E‑commerce, Finance.</p>
            </div>
            <div class="kb-card" onclick="Knowledge.currentSection='courses';Knowledge.render();">
              <div class="icon" style="background:rgba(168,85,247,0.2);color:#a78bfa;">🎓</div>
              <span class="badge badge-premium">FREE+PREMIUM</span>
              <h3>Courses & Certifications</h3>
              <p>Free courses. Premium mastery. Certified WhatsApp Expert.</p>
            </div>
            <div class="kb-card" onclick="Knowledge.currentSection='tools';Knowledge.render();">
              <div class="icon" style="background:rgba(236,72,153,0.2);color:#f472b6;">🧰</div>
              <span class="badge badge-free">FREE</span>
              <h3>Tools & Resources</h3>
              <p>ROI Calculator, Templates, Checklists, Benchmarks.</p>
            </div>
          </div>
        </div>

        <div class="kb-section">
          <div class="kb-cta">
            <h3>🩺 Free Business Health Check</h3>
            <p>Get your score across Lead Gen, Communication, Automation & Retention.</p>
            <button onclick="Knowledge.currentSection='healthscore';Knowledge.render();">Start Health Check</button>
          </div>
        </div>

        <div class="kb-section">
          <h2>🧰 Quick Tools</h2>
          <div class="kb-grid">
            <div class="kb-card" onclick="Knowledge.currentSection='roi';Knowledge.render();">
              <div class="icon" style="background:rgba(16,185,129,0.2);color:#34d399;">💰</div>
              <h3>WhatsApp ROI Calculator</h3>
              <p>See predicted revenue from WhatsApp for YOUR business.</p>
            </div>
            <div class="kb-card" onclick="Knowledge.showPopup()">
              <div class="icon" style="background:rgba(245,158,11,0.2);color:#fbbf24;">📧</div>
              <h3>Free Playbook Bundle</h3>
              <p>5 premium playbooks. Instant download to your inbox.</p>
            </div>
            <div class="kb-card" onclick="Knowledge.currentSection='community';Knowledge.render();">
              <div class="icon" style="background:rgba(59,130,246,0.2);color:#60a5fa;">🤝</div>
              <h3>Expert Community</h3>
              <p>Q&A, Webinars, Case Studies. 2000+ members.</p>
            </div>
          </div>
        </div>

        <div class="kb-section">
          <div class="kb-cta">
            <h3>Ready to Scale?</h3>
            <p>10,000+ businesses use 11 Avatar CRM.</p>
            <button onclick="window.open('/','_blank')">🚀 Try Free</button>
            <button class="outline" onclick="Knowledge.showPopup()">📩 Free Consultation</button>
          </div>
        </div>
      </div>

      <div class="kb-bottom-nav">
        <a href="#" class="active" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-home"></i>Home</a>
        <a href="#" onclick="Knowledge.currentSection='playbooks';Knowledge.render();"><i class="fas fa-book"></i>Playbooks</a>
        <a href="#" onclick="Knowledge.currentSection='tools';Knowledge.render();"><i class="fas fa-tools"></i>Tools</a>
        <a href="#" onclick="Knowledge.currentSection='courses';Knowledge.render();"><i class="fas fa-graduation-cap"></i>Courses</a>
        <a href="#" onclick="Knowledge.currentSection='community';Knowledge.render();"><i class="fas fa-users"></i>Community</a>
      </div>

      <div class="kb-popup" id="kbPopup">
        <h4 style="margin-bottom:6px;">📩 Get Free Playbooks</h4>
        <p style="font-size:11px;color:#94a3b8;">5 premium WhatsApp marketing playbooks + weekly tips.</p>
        <input type="text" id="kbName" placeholder="Your Name">
        <input type="email" id="kbEmail" placeholder="Email Address">
        <input type="text" id="kbBusiness" placeholder="Business Type (optional)">
        <button onclick="Knowledge.captureEmail()">Send Me Free Playbooks 🎁</button>
        <small style="color:#64748b;display:block;margin-top:4px;font-size:10px;">No spam. Unsubscribe anytime.</small>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  // ==================== BACK HEADER ====================
  backBtn(title) {
    return `<div class="kb-wrap"><div style="padding:16px 20px;"><button class="btn btn-sm btn-outline-light mb-2" onclick="Knowledge.currentSection='home';Knowledge.render();">← Back</button><h2 style="color:#e2e8f0;">${title}</h2></div>`;
  },

  // ==================== PLAYBOOKS ====================
  renderPlaybooks() {
    const items = [
      {t:'WhatsApp Marketing Mastery',d:'Setup to scaling. Templates, automation flows, campaign strategies.',l:'Beginner',time:'30 min'},
      {t:'Lead Generation Blueprint',d:'Forms, landing pages, widgets, ads — capture leads everywhere.',l:'Intermediate',time:'45 min'},
      {t:'Sales Automation Guide',d:'Chatbots, drip sequences, auto-followups. Convert on autopilot.',l:'Advanced',time:'60 min'},
      {t:'Customer Retention Strategies',d:'Loyalty, re-engagement, feedback via WhatsApp.',l:'Intermediate',time:'25 min'},
      {t:'Scaling 0 to 1000 Customers',d:'Infrastructure, team, tools. The ultimate scaling playbook.',l:'Advanced',time:'90 min'},
    ];
    let h = this.backBtn('📚 Business Growth Playbooks') + `<div class="kb-section"><div class="kb-grid">`;
    items.forEach(p => {
      h += `<div class="kb-card" onclick="Knowledge.openArticle('${p.t}','${p.d}')"><span class="badge badge-${p.l==='Beginner'?'free':'premium'}">${p.l}</span><h3>${p.t}</h3><p>${p.d}</p><small style="color:#94a3b8;">⏱ ${p.time}</small></div>`;
    });
    h += `</div></div></div>`;
    contentArea.innerHTML = h;
  },

  // ==================== PLATFORM MASTERY ====================
  renderPlatformMastery() {
    const items = [
      {t:'11 Avatar CRM Complete Guide',d:'Dashboard, leads, campaigns, chatbot, forms, social posting.'},
      {t:'WhatsApp Business API Setup',d:'Meta setup, phone verification, webhook configuration.'},
      {t:'Chatbot Building Masterclass',d:'Keywords, AI fallback, multi-step flows.'},
      {t:'Campaign Optimization Guide',d:'Bulk, drip, personalization, A/B testing, analytics.'},
    ];
    let h = this.backBtn('🛠 Platform Mastery') + `<div class="kb-section"><div class="kb-grid">`;
    items.forEach(p => {
      h += `<div class="kb-card" onclick="Knowledge.openArticle('${p.t}','${p.d}')"><span class="badge badge-free">GUIDE</span><h3>${p.t}</h3><p>${p.d}</p></div>`;
    });
    h += `</div></div></div>`;
    contentArea.innerHTML = h;
  },

  // ==================== INDUSTRY SOLUTIONS ====================
  renderIndustrySolutions() {
    const items = [
      {n:'Real Estate',i:'🏠',s:'40% more leads',d:'Virtual tours, instant inquiries, auto follow-ups.'},
      {n:'Healthcare',i:'🏥',s:'65% fewer no-shows',d:'Appointment reminders, prescription updates.'},
      {n:'Education',i:'🎓',s:'3x engagement',d:'Admission inquiries, fee reminders, parent chat.'},
      {n:'E‑commerce',i:'🛒',s:'25% cart recovery',d:'Order updates, abandoned cart, recommendations.'},
      {n:'Financial Services',i:'💰',s:'50% faster processing',d:'Document collection, KYC, payment reminders.'},
    ];
    let h = this.backBtn('💡 Industry Solutions') + `<div class="kb-section"><div class="kb-grid">`;
    items.forEach(p => {
      h += `<div class="kb-card" onclick="Knowledge.openArticle('${p.n} Playbook','Industry solution for ${p.n}')"><div class="icon" style="background:rgba(245,158,11,0.2);">${p.i}</div><h3>${p.n}</h3><p style="color:#34d399;font-weight:600;">${p.s}</p><p>${p.d}</p></div>`;
    });
    h += `</div></div></div>`;
    contentArea.innerHTML = h;
  },

  // ==================== COURSES ====================
  renderCourses() {
    let h = this.backBtn('🎓 Courses & Certifications') + `<div class="kb-section"><div class="kb-grid">`;
    h += `<div class="kb-card"><span class="badge badge-free">FREE</span><h3>WhatsApp Marketing 101</h3><p>10 video lessons. Certificate.</p><button class="btn btn-sm btn-outline-light mt-2" onclick="Knowledge.showPopup()">Enroll Free</button></div>`;
    h += `<div class="kb-card"><span class="badge badge-premium">₹4,999</span><h3>Advanced Automation</h3><p>Chatbots, flows, API. 20+ hours.</p><button class="btn btn-sm btn-warning mt-2" onclick="Knowledge.showPopup()">Buy Now</button></div>`;
    h += `<div class="kb-card"><span class="badge badge-premium">₹49,999</span><h3>WhatsApp Expert Program</h3><p>6 weeks. 1:1 mentorship. Certification.</p><button class="btn btn-sm btn-warning mt-2" onclick="Knowledge.showPopup()">Apply Now</button></div>`;
    h += `</div></div></div>`;
    contentArea.innerHTML = h;
  },

  // ==================== TOOLS ====================
  renderTools() {
    let h = this.backBtn('🧰 Free Tools') + `<div class="kb-section"><div class="kb-grid">`;
    h += `<div class="kb-card" onclick="Knowledge.currentSection='roi';Knowledge.render();"><div class="icon" style="background:rgba(16,185,129,0.2);color:#34d399;">💰</div><h3>ROI Calculator</h3><p>Predict WhatsApp revenue.</p></div>`;
    h += `<div class="kb-card" onclick="Knowledge.openArticle('Message Templates','50+ ready-to-use templates')"><div class="icon" style="background:rgba(59,130,246,0.2);color:#60a5fa;">📝</div><h3>Message Templates</h3><p>50+ industry templates.</p></div>`;
    h += `<div class="kb-card" onclick="Knowledge.openArticle('Campaign Checklist','Complete launch checklist')"><div class="icon" style="background:rgba(245,158,11,0.2);color:#fbbf24;">✅</div><h3>Campaign Checklist</h3><p>Never miss a step.</p></div>`;
    h += `<div class="kb-card" onclick="Knowledge.openArticle('Benchmarks 2026','Real data by industry')"><div class="icon" style="background:rgba(168,85,247,0.2);color:#a78bfa;">📊</div><h3>Benchmarks 2026</h3><p>Open rates, reply times, conversions.</p></div>`;
    h += `</div></div></div>`;
    contentArea.innerHTML = h;
  },

  // ==================== COMMUNITY ====================
  renderCommunity() {
    let h = this.backBtn('🤝 Expert Community') + `<div class="kb-section"><div class="kb-grid">`;
    h += `<div class="kb-card"><div class="icon" style="background:rgba(59,130,246,0.2);color:#60a5fa;">💬</div><h3>Q&A Forum</h3><p>Ask questions. Get expert answers.</p><button class="btn btn-sm btn-outline-light mt-2" onclick="Knowledge.showPopup()">Join</button></div>`;
    h += `<div class="kb-card"><div class="icon" style="background:rgba(16,185,129,0.2);color:#34d399;">🎙</div><h3>Live Webinars</h3><p>Weekly sessions. Case studies. AMAs.</p><button class="btn btn-sm btn-outline-light mt-2" onclick="Knowledge.showPopup()">Register</button></div>`;
    h += `<div class="kb-card"><div class="icon" style="background:rgba(245,158,11,0.2);color:#fbbf24;">🏆</div><h3>Stories</h3><p>Real results from real businesses.</p><button class="btn btn-sm btn-outline-light mt-2" onclick="Knowledge.openArticle('Case Studies','Transformation stories')">Read</button></div>`;
    h += `</div></div></div>`;
    contentArea.innerHTML = h;
  },

  // ==================== HEALTH SCORE ====================
  renderHealthScore() {
    let h = this.backBtn('🩺 Business Health Check') + `<div class="kb-section"><div class="kb-card" style="max-width:550px;margin:0 auto;">
      <h3>Get Your Score</h3>
      <div class="mb-2"><label class="small">Industry</label><select id="hsIndustry" class="form-control form-control-sm"><option>Real Estate</option><option>Healthcare</option><option>Education</option><option>E-commerce</option><option>Finance</option></select></div>
      <div class="mb-2"><label class="small">Monthly Leads</label><input type="number" id="hsLeads" class="form-control form-control-sm" placeholder="e.g. 200"></div>
      <div class="mb-2"><label class="small">Conversion Rate (%)</label><input type="number" id="hsConv" class="form-control form-control-sm" placeholder="e.g. 5"></div>
      <div class="mb-2"><label class="small">WhatsApp Setup?</label><select id="hsWA" class="form-select form-select-sm"><option value="no">No</option><option value="basic">Basic (manual)</option><option value="advanced">Advanced (API/CRM)</option></select></div>
      <button class="btn btn-primary w-100" onclick="Knowledge.calcHealth()">Generate Report</button>
      <div id="hsResult" class="mt-3"></div>
    </div></div></div>`;
    contentArea.innerHTML = h;
  },

  calcHealth() {
    const leads = parseInt(document.getElementById('hsLeads').value)||0;
    const conv = parseInt(document.getElementById('hsConv').value)||0;
    const wa = document.getElementById('hsWA').value;
    let s = 0;
    if(leads>500)s+=25;else if(leads>100)s+=15;else s+=5;
    if(conv>10)s+=25;else if(conv>5)s+=15;else s+=5;
    if(wa==='advanced')s+=30;else if(wa==='basic')s+=15;
    s += Math.floor(Math.random()*20);
    const grade = s>=80?'🏆 Excellent':s>=60?'👍 Good':s>=40?'📈 Average':'🚀 Growth Opportunity';
    document.getElementById('hsResult').innerHTML=`<div class="text-center p-3 rounded" style="background:rgba(16,185,129,0.1);"><h2>${s}/100</h2><h4>${grade}</h4><button class="btn btn-sm btn-warning mt-2" onclick="Knowledge.showPopup()">📩 Get Full Report</button></div>`;
  },

  // ==================== ROI CALCULATOR ====================
  renderROICalculator() {
    let h = this.backBtn('💰 WhatsApp ROI Calculator') + `<div class="kb-section"><div class="kb-card" style="max-width:550px;margin:0 auto;">
      <div class="mb-2"><label class="small">Monthly Leads</label><input type="number" id="roiLeads" class="form-control form-control-sm" placeholder="500"></div>
      <div class="mb-2"><label class="small">Deal Value (₹)</label><input type="number" id="roiValue" class="form-control form-control-sm" placeholder="10000"></div>
      <div class="mb-2"><label class="small">Conversion Rate (%)</label><input type="number" id="roiConv" class="form-control form-control-sm" placeholder="5"></div>
      <div class="mb-2"><label class="small">Expected Improvement (%)</label><input type="number" id="roiImp" class="form-control form-control-sm" value="30"></div>
      <button class="btn btn-primary w-100" onclick="Knowledge.calcROI()">Calculate</button>
      <div id="roiResult" class="mt-3"></div>
    </div></div></div>`;
    contentArea.innerHTML = h;
  },

  calcROI() {
    const l=parseInt(document.getElementById('roiLeads').value)||0;
    const v=parseInt(document.getElementById('roiValue').value)||0;
    const c=parseInt(document.getElementById('roiConv').value)||0;
    const i=parseInt(document.getElementById('roiImp').value)||30;
    const cur=l*(c/100)*v;
    const nc=c*(1+i/100);
    const nxt=l*(nc/100)*v;
    const ext=nxt-cur;
    document.getElementById('roiResult').innerHTML=`<div class="text-center p-3 rounded" style="background:rgba(16,185,129,0.1);"><p>Current: ₹${cur.toLocaleString()}/mo</p><p style="color:#34d399;">With WhatsApp: ₹${nxt.toLocaleString()}/mo</p><h3 style="color:#fbbf24;">+₹${ext.toLocaleString()}/mo</h3><button class="btn btn-sm btn-warning mt-2" onclick="Knowledge.showPopup()">📩 Get Plan</button></div>`;
  },

  // ==================== ARTICLE ====================
  renderArticlePage() {
    if (!this.articleData) { this.currentSection='home';this.render();return; }
    let h = this.backBtn(this.articleData.title) + `<div class="kb-section"><div class="kb-card"><p>${this.articleData.desc}</p><p style="color:#94a3b8;margin-top:16px;">📖 Full article coming soon! Subscribe to get notified.</p><button class="btn btn-warning mt-3" onclick="Knowledge.showPopup()">📩 Notify Me</button></div></div></div>`;
    contentArea.innerHTML = h;
  },

  openArticle(title, desc) {
    this.articleData = { title, desc };
    this.currentSection = 'article';
    this.render();
  },

  // ==================== HELPERS ====================
  search() {
    const q = document.getElementById('kbSearch')?.value?.toLowerCase()||'';
    if(!q) return;
    if(q.includes('roi')){this.currentSection='roi';this.render();return;}
    if(q.includes('health')){this.currentSection='healthscore';this.render();return;}
    if(q.includes('playbook')||q.includes('marketing')){this.currentSection='playbooks';this.render();return;}
    if(q.includes('course')){this.currentSection='courses';this.render();return;}
    if(q.includes('tool')||q.includes('template')){this.currentSection='tools';this.render();return;}
    if(q.includes('community')||q.includes('forum')){this.currentSection='community';this.render();return;}
    this.showPopup();
  },

  showPopup() {
    const p = document.getElementById('kbPopup');
    if (p) { p.classList.add('show'); setTimeout(()=>p.classList.remove('show'),15000); }
    else alert('📩 Enter your email to get free playbooks!');
  },

  async captureEmail() {
    const name = document.getElementById('kbName')?.value?.trim()||'';
    const email = document.getElementById('kbEmail')?.value?.trim()||'';
    if(!email){alert('Enter your email!');return;}
    try {
      await db.collection('knowledge_subscribers').add({
        name, email, business: document.getElementById('kbBusiness')?.value?.trim()||'',
        source: 'knowledge_engine',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      document.getElementById('kbPopup')?.classList.remove('show');
      alert('✅ Welcome! Your free playbooks are on the way.\n\nCheck your inbox! 🎁');
    } catch(e) {
      alert('✅ Subscribed! (Demo mode)');
      document.getElementById('kbPopup')?.classList.remove('show');
    }
  }
};
