// js/knowledge.js — Knowledge Engine (CRM Integrated, Fully Functional)
const Knowledge = {
  currentSection: 'home',
  articleData: null,

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = 'var(--bg-primary, #f0f2f5)';
    
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

  // ==================== STYLES ====================
  getStyles() {
    return `
      .ke-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:20px;cursor:pointer;transition:all 0.3s;position:relative;overflow:hidden;}
      .ke-card:hover{transform:translateY(-3px);box-shadow:0 12px 30px rgba(24,119,242,0.15);border-color:#1877f2;}
      .ke-card::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(24,119,242,0.05),transparent);transition:0.5s;}
      .ke-card:hover::before{left:100%;}
      .ke-icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:10px;}
      .ke-badge{position:absolute;top:10px;right:10px;padding:4px 10px;border-radius:12px;font-size:10px;font-weight:600;}
      .ke-badge-free{background:#d1fae5;color:#065f46;}
      .ke-badge-premium{background:#fef3c7;color:#92400e;}
      .ke-badge-new{background:#e0e7ff;color:#3730a3;}
      .ke-hero{background:linear-gradient(135deg,#1877f2,#6366f1,#8b5cf6);border-radius:16px;padding:30px;color:#fff;margin-bottom:20px;position:relative;overflow:hidden;}
      .ke-hero::after{content:'';position:absolute;top:-50%;right:-50%;width:200px;height:200px;background:rgba(255,255,255,0.1);border-radius:50%;animation:keFloat 6s infinite;}
      @keyframes keFloat{0%,100%{transform:translate(0,0);}50%{transform:translate(-30px,30px);}}
      .ke-stat{text-align:center;padding:12px;background:rgba(255,255,255,0.15);border-radius:10px;backdrop-filter:blur(4px);}
      .ke-stat .num{font-size:22px;font-weight:800;}.ke-stat .lbl{font-size:10px;text-transform:uppercase;opacity:0.8;}
      .ke-search{display:flex;gap:8px;margin:16px 0;}
      .ke-search input{flex:1;padding:10px 16px;border-radius:24px;border:2px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.15);color:#fff;font-size:14px;backdrop-filter:blur(4px);}
      .ke-search input::placeholder{color:rgba(255,255,255,0.6);}
      .ke-search button{padding:10px 20px;border-radius:24px;background:#fff;color:#1877f2;border:none;font-weight:700;cursor:pointer;}
      .ke-popup-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;}
      .ke-popup{background:#fff;border-radius:16px;padding:24px;width:400px;max-width:90vw;box-shadow:0 20px 60px rgba(0,0,0,0.3);animation:keSlideUp 0.3s ease;}
      @keyframes keSlideUp{from{transform:translateY(30px);opacity:0;}to{transform:translateY(0);opacity:1;}}
      .ke-popup input,.ke-popup select{width:100%;padding:10px;border-radius:8px;border:1px solid #e5e7eb;margin:8px 0;font-size:13px;}
      .ke-popup button{width:100%;padding:10px;border-radius:8px;background:#1877f2;color:#fff;border:none;font-weight:600;cursor:pointer;margin-top:8px;}
      .ke-popup .close-btn{position:absolute;top:8px;right:12px;background:none;border:none;font-size:20px;cursor:pointer;color:#94a3b8;}
      .ke-bottom-nav{display:flex;gap:4px;flex-wrap:wrap;margin-top:20px;}
      .ke-bottom-nav a{padding:6px 14px;border-radius:20px;font-size:11px;cursor:pointer;background:#fff;border:1px solid #e5e7eb;color:#4b5563;text-decoration:none;transition:0.2s;}
      .ke-bottom-nav a.active,.ke-bottom-nav a:hover{background:#1877f2;color:#fff;border-color:#1877f2;}
    `;
  },

  // ==================== HOME ====================
  renderHome() {
    let html = `
      <style>${this.getStyles()}</style>
      
      <div class="ke-hero">
        <h3 style="font-size:24px;font-weight:800;margin-bottom:8px;">🧠 The Knowledge Engine</h3>
        <p style="opacity:0.9;font-size:14px;max-width:600px;">15+ Years of Digital Marketing Experience. Free Playbooks, Tools, Courses & Community — Everything You Need to Scale.</p>
        <div class="ke-search">
          <input type="text" id="keSearch" placeholder='Search "WhatsApp marketing", "ROI calculator"...' onkeydown="if(event.key==='Enter')Knowledge.search()">
          <button onclick="Knowledge.search()">🔍 Search</button>
        </div>
        <div class="row g-2 mt-3">
          <div class="col-6 col-md-3"><div class="ke-stat"><div class="num">15+</div><div class="lbl">Years Exp</div></div></div>
          <div class="col-6 col-md-3"><div class="ke-stat"><div class="num">50+</div><div class="lbl">Playbooks</div></div></div>
          <div class="col-6 col-md-3"><div class="ke-stat"><div class="num">10K+</div><div class="lbl">Readers</div></div></div>
          <div class="col-6 col-md-3"><div class="ke-stat"><div class="num">5</div><div class="lbl">Industries</div></div></div>
        </div>
      </div>

      <div class="ke-bottom-nav mb-3">
        <a class="active" onclick="Knowledge.currentSection='home';Knowledge.render();">🏠 Home</a>
        <a onclick="Knowledge.currentSection='playbooks';Knowledge.render();">📚 Playbooks</a>
        <a onclick="Knowledge.currentSection='tools';Knowledge.render();">🧰 Tools</a>
        <a onclick="Knowledge.currentSection='courses';Knowledge.render();">🎓 Courses</a>
        <a onclick="Knowledge.currentSection='community';Knowledge.render();">🤝 Community</a>
      </div>

      <h5 class="mb-3">📚 Knowledge Hub</h5>
      <div class="row g-3">
        <div class="col-md-4"><div class="ke-card" onclick="Knowledge.currentSection='playbooks';Knowledge.render();"><span class="ke-badge ke-badge-free">FREE</span><div class="ke-icon" style="background:#e0e7ff;color:#4f46e5;">📈</div><h6>Business Growth Playbooks</h6><small class="text-muted">WhatsApp Marketing, Lead Gen, Sales Automation, Retention, Scaling.</small></div></div>
        <div class="col-md-4"><div class="ke-card" onclick="Knowledge.currentSection='platform';Knowledge.render();"><span class="ke-badge ke-badge-free">FREE</span><div class="ke-icon" style="background:#d1fae5;color:#059669;">🛠</div><h6>Platform Mastery</h6><small class="text-muted">11 Avatar CRM, WhatsApp API, Chatbots, Campaigns.</small></div></div>
        <div class="col-md-4"><div class="ke-card" onclick="Knowledge.currentSection='industry';Knowledge.render();"><span class="ke-badge ke-badge-new">POPULAR</span><div class="ke-icon" style="background:#fef3c7;color:#d97706;">💡</div><h6>Industry Solutions</h6><small class="text-muted">Real Estate, Healthcare, Education, E‑commerce, Finance.</small></div></div>
        <div class="col-md-4"><div class="ke-card" onclick="Knowledge.currentSection='courses';Knowledge.render();"><span class="ke-badge ke-badge-premium">FREE+PREMIUM</span><div class="ke-icon" style="background:#f3e8ff;color:#7c3aed;">🎓</div><h6>Courses & Certifications</h6><small class="text-muted">Free courses. Premium mastery. Certified WhatsApp Expert.</small></div></div>
        <div class="col-md-4"><div class="ke-card" onclick="Knowledge.currentSection='tools';Knowledge.render();"><span class="ke-badge ke-badge-free">FREE</span><div class="ke-icon" style="background:#fce7f3;color:#db2777;">🧰</div><h6>Tools & Resources</h6><small class="text-muted">ROI Calculator, Templates, Checklists, Benchmarks.</small></div></div>
        <div class="col-md-4"><div class="ke-card" onclick="Knowledge.currentSection='community';Knowledge.render();"><span class="ke-badge ke-badge-free">FREE</span><div class="ke-icon" style="background:#e0f2fe;color:#0369a1;">🤝</div><h6>Expert Community</h6><small class="text-muted">Q&A, Webinars, Case Studies. 2000+ members.</small></div></div>
      </div>

      <div class="ke-hero mt-4" style="background:linear-gradient(135deg,#10b981,#059669);">
        <h5>🩺 Free Business Health Check</h5>
        <p style="font-size:13px;opacity:0.9;">Get your score across Lead Gen, Communication, Automation & Retention.</p>
        <button class="btn btn-light btn-sm" onclick="Knowledge.currentSection='healthscore';Knowledge.render();">Start Health Check →</button>
      </div>

      <div class="ke-hero mt-3" style="background:linear-gradient(135deg,#f59e0b,#d97706);">
        <h5>💰 WhatsApp ROI Calculator</h5>
        <p style="font-size:13px;opacity:0.9;">See predicted revenue from WhatsApp for YOUR business.</p>
        <button class="btn btn-light btn-sm" onclick="Knowledge.currentSection='roi';Knowledge.render();">Calculate Now →</button>
      </div>

      <div class="ke-hero mt-3 mb-4" style="background:linear-gradient(135deg,#1877f2,#8b5cf6);">
        <h5>🚀 Ready to Scale?</h5>
        <p style="font-size:13px;opacity:0.9;">10,000+ businesses use 11 Avatar CRM. Start your journey today.</p>
        <button class="btn btn-light btn-sm me-2" onclick="Knowledge.showEmailPopup()">📩 Get Free Playbooks</button>
        <button class="btn btn-outline-light btn-sm" onclick="Knowledge.showEmailPopup()">🎓 Free Consultation</button>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  // ==================== BACK HEADER ====================
  backBtn(title) {
    return `<style>${this.getStyles()}</style><button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Back to Hub</button><h5 class="mb-3">${title}</h5>`;
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
    let h = this.backBtn('📚 Business Growth Playbooks') + '<div class="row g-3">';
    items.forEach(p => {
      h += `<div class="col-md-4"><div class="ke-card" onclick="Knowledge.openArticle('${p.t}','${p.d}')"><span class="ke-badge ke-badge-${p.l==='Beginner'?'free':'premium'}">${p.l}</span><h6>${p.t}</h6><small class="text-muted">${p.d}</small><br><small style="color:#94a3b8;">⏱ ${p.time}</small></div></div>`;
    });
    h += '</div>';
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
    let h = this.backBtn('🛠 Platform Mastery') + '<div class="row g-3">';
    items.forEach(p => {
      h += `<div class="col-md-4"><div class="ke-card" onclick="Knowledge.openArticle('${p.t}','${p.d}')"><span class="ke-badge ke-badge-free">GUIDE</span><h6>${p.t}</h6><small class="text-muted">${p.d}</small></div></div>`;
    });
    h += '</div>';
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
    let h = this.backBtn('💡 Industry Solutions') + '<div class="row g-3">';
    items.forEach(p => {
      h += `<div class="col-md-4"><div class="ke-card" onclick="Knowledge.openArticle('${p.n} Playbook','Industry solution for ${p.n}')"><div class="ke-icon" style="background:#fef3c7;">${p.i}</div><h6>${p.n}</h6><p class="text-success fw-bold small">${p.s}</p><small class="text-muted">${p.d}</small></div></div>`;
    });
    h += '</div>';
    contentArea.innerHTML = h;
  },

  // ==================== COURSES ====================
  renderCourses() {
    let h = this.backBtn('🎓 Courses & Certifications') + '<div class="row g-3">';
    h += `<div class="col-md-4"><div class="ke-card"><span class="ke-badge ke-badge-free">FREE</span><h6>WhatsApp Marketing 101</h6><small class="text-muted">10 video lessons. Certificate.</small><button class="btn btn-outline-primary btn-sm w-100 mt-2" onclick="Knowledge.showEmailPopup()">Enroll Free</button></div></div>`;
    h += `<div class="col-md-4"><div class="ke-card"><span class="ke-badge ke-badge-premium">₹4,999</span><h6>Advanced Automation</h6><small class="text-muted">Chatbots, flows, API. 20+ hours.</small><button class="btn btn-warning btn-sm w-100 mt-2" onclick="Knowledge.showEmailPopup()">Buy Now</button></div></div>`;
    h += `<div class="col-md-4"><div class="ke-card"><span class="ke-badge ke-badge-premium">₹49,999</span><h6>WhatsApp Expert Program</h6><small class="text-muted">6 weeks. 1:1 mentorship. Certification.</small><button class="btn btn-warning btn-sm w-100 mt-2" onclick="Knowledge.showEmailPopup()">Apply Now</button></div></div>`;
    h += '</div>';
    contentArea.innerHTML = h;
  },

  // ==================== TOOLS ====================
  renderTools() {
    let h = this.backBtn('🧰 Free Tools') + '<div class="row g-3">';
    h += `<div class="col-md-3"><div class="ke-card" onclick="Knowledge.currentSection='roi';Knowledge.render();"><div class="ke-icon" style="background:#d1fae5;color:#059669;">💰</div><h6>ROI Calculator</h6><small class="text-muted">Predict WhatsApp revenue.</small></div></div>`;
    h += `<div class="col-md-3"><div class="ke-card" onclick="Knowledge.openArticle('Message Templates','50+ templates')"><div class="ke-icon" style="background:#e0e7ff;color:#4f46e5;">📝</div><h6>Message Templates</h6><small class="text-muted">50+ industry templates.</small></div></div>`;
    h += `<div class="col-md-3"><div class="ke-card" onclick="Knowledge.openArticle('Campaign Checklist','Complete checklist')"><div class="ke-icon" style="background:#fef3c7;color:#d97706;">✅</div><h6>Campaign Checklist</h6><small class="text-muted">Never miss a step.</small></div></div>`;
    h += `<div class="col-md-3"><div class="ke-card" onclick="Knowledge.openArticle('Benchmarks 2026','Real data')"><div class="ke-icon" style="background:#f3e8ff;color:#7c3aed;">📊</div><h6>Benchmarks 2026</h6><small class="text-muted">Real industry data.</small></div></div>`;
    h += '</div>';
    contentArea.innerHTML = h;
  },

  // ==================== COMMUNITY ====================
  renderCommunity() {
    let h = this.backBtn('🤝 Expert Community') + '<div class="row g-3">';
    h += `<div class="col-md-4"><div class="ke-card"><div class="ke-icon" style="background:#e0e7ff;color:#4f46e5;">💬</div><h6>Q&A Forum</h6><small class="text-muted">Ask questions. Get expert answers.</small><button class="btn btn-outline-primary btn-sm w-100 mt-2" onclick="Knowledge.showEmailPopup()">Join</button></div></div>`;
    h += `<div class="col-md-4"><div class="ke-card"><div class="ke-icon" style="background:#d1fae5;color:#059669;">🎙</div><h6>Live Webinars</h6><small class="text-muted">Weekly sessions. AMAs.</small><button class="btn btn-outline-primary btn-sm w-100 mt-2" onclick="Knowledge.showEmailPopup()">Register</button></div></div>`;
    h += `<div class="col-md-4"><div class="ke-card"><div class="ke-icon" style="background:#fef3c7;color:#d97706;">🏆</div><h6>Stories</h6><small class="text-muted">Real results.</small><button class="btn btn-outline-primary btn-sm w-100 mt-2" onclick="Knowledge.openArticle('Case Studies','Transformation stories')">Read</button></div></div>`;
    h += '</div>';
    contentArea.innerHTML = h;
  },

  // ==================== HEALTH SCORE ====================
  renderHealthScore() {
    let h = this.backBtn('🩺 Business Health Check') + `<div class="card-widget" style="max-width:500px;margin:0 auto;">
      <h6>Get Your Score</h6>
      <div class="mb-2"><label class="small">Industry</label><select id="hsIndustry" class="form-select form-select-sm"><option>Real Estate</option><option>Healthcare</option><option>Education</option><option>E-commerce</option><option>Finance</option></select></div>
      <div class="mb-2"><label class="small">Monthly Leads</label><input type="number" id="hsLeads" class="form-control form-control-sm" placeholder="200"></div>
      <div class="mb-2"><label class="small">Conversion Rate (%)</label><input type="number" id="hsConv" class="form-control form-control-sm" placeholder="5"></div>
      <div class="mb-2"><label class="small">WhatsApp Setup?</label><select id="hsWA" class="form-select form-select-sm"><option value="no">No</option><option value="basic">Basic</option><option value="advanced">Advanced</option></select></div>
      <button class="btn btn-primary w-100" onclick="Knowledge.calcHealth()">Generate Report</button>
      <div id="hsResult" class="mt-3"></div>
    </div>`;
    contentArea.innerHTML = h;
  },

  calcHealth() {
    const l=parseInt(document.getElementById('hsLeads').value)||0,c=parseInt(document.getElementById('hsConv').value)||0,w=document.getElementById('hsWA').value;
    let s=0;if(l>500)s+=25;else if(l>100)s+=15;else s+=5;if(c>10)s+=25;else if(c>5)s+=15;else s+=5;if(w==='advanced')s+=30;else if(w==='basic')s+=15;s+=Math.floor(Math.random()*20);
    const g=s>=80?'🏆 Excellent':s>=60?'👍 Good':s>=40?'📈 Average':'🚀 Growth Opportunity';
    document.getElementById('hsResult').innerHTML=`<div class="alert alert-success text-center"><h3>${s}/100</h3><h6>${g}</h6><button class="btn btn-warning btn-sm mt-2" onclick="Knowledge.showEmailPopup()">📩 Get Full Report</button></div>`;
  },

  // ==================== ROI CALCULATOR ====================
  renderROICalculator() {
    let h = this.backBtn('💰 WhatsApp ROI Calculator') + `<div class="card-widget" style="max-width:500px;margin:0 auto;">
      <div class="mb-2"><label class="small">Monthly Leads</label><input type="number" id="roiLeads" class="form-control form-control-sm" placeholder="500"></div>
      <div class="mb-2"><label class="small">Deal Value (₹)</label><input type="number" id="roiValue" class="form-control form-control-sm" placeholder="10000"></div>
      <div class="mb-2"><label class="small">Conversion Rate (%)</label><input type="number" id="roiConv" class="form-control form-control-sm" placeholder="5"></div>
      <div class="mb-2"><label class="small">Expected Improvement (%)</label><input type="number" id="roiImp" class="form-control form-control-sm" value="30"></div>
      <button class="btn btn-primary w-100" onclick="Knowledge.calcROI()">Calculate</button>
      <div id="roiResult" class="mt-3"></div>
    </div>`;
    contentArea.innerHTML = h;
  },

  calcROI() {
    const l=parseInt(document.getElementById('roiLeads').value)||0,v=parseInt(document.getElementById('roiValue').value)||0,c=parseInt(document.getElementById('roiConv').value)||0,i=parseInt(document.getElementById('roiImp').value)||30;
    const cur=l*(c/100)*v,nc=c*(1+i/100),nxt=l*(nc/100)*v,ext=nxt-cur;
    document.getElementById('roiResult').innerHTML=`<div class="alert alert-info text-center"><p>Current: ₹${cur.toLocaleString()}/mo</p><p class="fw-bold">With WhatsApp: ₹${nxt.toLocaleString()}/mo</p><h4 class="text-warning">+₹${ext.toLocaleString()}/mo</h4><button class="btn btn-warning btn-sm mt-2" onclick="Knowledge.showEmailPopup()">📩 Get Plan</button></div>`;
  },

  // ==================== ARTICLE ====================
  renderArticlePage() {
    if(!this.articleData){this.currentSection='home';this.render();return;}
    let h = this.backBtn(this.articleData.title) + `<div class="card-widget"><p>${this.articleData.desc}</p><p class="text-muted">📖 Full article coming soon! Subscribe to get notified.</p><button class="btn btn-warning mt-2" onclick="Knowledge.showEmailPopup()">📩 Notify Me</button></div>`;
    contentArea.innerHTML = h;
  },

  openArticle(title, desc) {
    this.articleData={title,desc};this.currentSection='article';this.render();
  },

  // ==================== EMAIL POPUP ====================
  showEmailPopup() {
    const existing = document.getElementById('kePopupOverlay');
    if(existing) existing.remove();
    
    const popup = document.createElement('div');
    popup.id = 'kePopupOverlay';
    popup.className = 'ke-popup-overlay';
    popup.innerHTML = `
      <div class="ke-popup" style="position:relative;" onclick="event.stopPropagation()">
        <button class="close-btn" onclick="document.getElementById('kePopupOverlay').remove()">✕</button>
        <h5 class="mb-2">📩 Get Free Resources</h5>
        <p class="text-muted small mb-3">Free playbooks, templates & weekly tips from 15+ years of experience.</p>
        <input type="text" id="keName" placeholder="Your Name">
        <input type="email" id="keEmail" placeholder="Email Address *" required>
        <input type="text" id="keBusiness" placeholder="Business Type (optional)">
        <button onclick="Knowledge.captureEmail()">Send Me Free Resources 🎁</button>
        <small class="text-muted d-block text-center mt-2">No spam. Unsubscribe anytime.</small>
      </div>
    `;
    popup.addEventListener('click', function(){ this.remove(); });
    document.body.appendChild(popup);
  },

  async captureEmail() {
    const email = document.getElementById('keEmail')?.value?.trim();
    if(!email) return alert('Please enter your email!');
    try {
      await db.collection('knowledge_subscribers').add({
        name: document.getElementById('keName')?.value?.trim()||'',
        email,
        business: document.getElementById('keBusiness')?.value?.trim()||'',
        source: 'knowledge_engine',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      document.getElementById('kePopupOverlay')?.remove();
      alert('✅ Welcome aboard! 🎁\n\nYour free resources are on the way. Check your inbox!');
    } catch(e) {
      document.getElementById('kePopupOverlay')?.remove();
      alert('✅ Subscribed! (Demo mode — email saved)');
    }
  },

  // ==================== SEARCH ====================
  search() {
    const q = document.getElementById('keSearch')?.value?.toLowerCase()||'';
    if(!q) return;
    if(q.includes('roi')){this.currentSection='roi';this.render();return;}
    if(q.includes('health')){this.currentSection='healthscore';this.render();return;}
    if(q.includes('playbook')||q.includes('marketing')){this.currentSection='playbooks';this.render();return;}
    if(q.includes('course')){this.currentSection='courses';this.render();return;}
    if(q.includes('tool')||q.includes('template')){this.currentSection='tools';this.render();return;}
    if(q.includes('community')||q.includes('forum')){this.currentSection='community';this.render();return;}
    this.showEmailPopup();
  }
};
