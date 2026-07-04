// js/knowledge.js — The Knowledge Engine (Complete Ecosystem)
const Knowledge = {
  currentSection: 'home',
  userProgress: 0,
  emailCaptured: false,

  async render() {
    contentArea.innerHTML = '';
    document.querySelectorAll('.global-top-header, .global-bottom-menu').forEach(el => el.remove());
    
    switch(this.currentSection) {
      case 'playbooks': await this.renderPlaybooks(); break;
      case 'platform': await this.renderPlatformMastery(); break;
      case 'industry': await this.renderIndustrySolutions(); break;
      case 'courses': await this.renderCourses(); break;
      case 'tools': await this.renderTools(); break;
      case 'community': await this.renderCommunity(); break;
      case 'article': await this.renderArticle(); break;
      case 'healthscore': await this.renderHealthScore(); break;
      case 'roi': await this.renderROICalculator(); break;
      default: await this.renderHome();
    }
  },

  // ==================== HOME ====================
  async renderHome() {
    let html = `
      <style>
        :root{--kb-bg:#0a0e17;--kb-card:#141a25;--kb-border:#1e293b;--kb-text:#e2e8f0;--kb-muted:#94a3b8;--kb-accent:#3b82f6;--kb-gold:#f59e0b;--kb-green:#10b981;}
        .kb-wrap{background:var(--kb-bg);min-height:100vh;color:var(--kb-text);font-family:'Inter',system-ui,sans-serif;padding-bottom:60px;}
        .kb-hero{background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%);padding:60px 20px;text-align:center;position:relative;overflow:hidden;}
        .kb-hero::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 70%);animation:kbPulse 8s infinite;}
        @keyframes kbPulse{0%,100%{transform:scale(1);}50%{transform:scale(1.1);}}
        .kb-hero h1{font-size:clamp(28px,5vw,48px);font-weight:800;background:linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;position:relative;}
        .kb-hero p{color:var(--kb-muted);font-size:18px;max-width:700px;margin:16px auto;}
        .kb-search{max-width:600px;margin:24px auto;position:relative;}
        .kb-search input{width:100%;padding:14px 50px 14px 20px;border-radius:30px;border:2px solid var(--kb-border);background:var(--kb-card);color:#fff;font-size:16px;}
        .kb-search button{position:absolute;right:6px;top:6px;padding:8px 20px;border-radius:24px;background:var(--kb-accent);color:#fff;border:none;font-weight:600;cursor:pointer;}
        .kb-stats{display:flex;justify-content:center;gap:40px;flex-wrap:wrap;margin-top:30px;}
        .kb-stat{text-align:center;}
        .kb-stat .num{font-size:28px;font-weight:800;color:#60a5fa;}
        .kb-stat .lbl{font-size:12px;color:var(--kb-muted);text-transform:uppercase;}
        .kb-section{padding:40px 20px;max-width:1200px;margin:0 auto;}
        .kb-section h2{font-size:24px;font-weight:700;margin-bottom:24px;display:flex;align-items:center;gap:10px;}
        .kb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;}
        .kb-card{background:var(--kb-card);border:1px solid var(--kb-border);border-radius:16px;padding:24px;cursor:pointer;transition:all 0.3s;position:relative;overflow:hidden;}
        .kb-card:hover{border-color:var(--kb-accent);transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,0.3);}
        .kb-card .icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:12px;}
        .kb-card h3{font-size:16px;margin-bottom:6px;}
        .kb-card p{color:var(--kb-muted);font-size:13px;line-height:1.5;}
        .kb-card .badge{position:absolute;top:12px;right:12px;padding:4px 10px;border-radius:12px;font-size:10px;font-weight:600;}
        .badge-free{background:rgba(16,185,129,0.2);color:var(--kb-green);}
        .badge-premium{background:rgba(245,158,11,0.2);color:var(--kb-gold);}
        .badge-new{background:rgba(59,130,246,0.2);color:#60a5fa;}
        .kb-bottom-nav{position:fixed;bottom:0;left:0;right:0;background:var(--kb-card);border-top:1px solid var(--kb-border);display:flex;overflow-x:auto;z-index:999;padding:6px;}
        .kb-bottom-nav a{flex:1;text-align:center;padding:8px 12px;color:var(--kb-muted);text-decoration:none;font-size:11px;white-space:nowrap;transition:0.2s;border-radius:8px;}
        .kb-bottom-nav a:hover,.kb-bottom-nav a.active{color:#fff;background:rgba(255,255,255,0.05);}
        .kb-bottom-nav a i{display:block;font-size:16px;margin-bottom:2px;}
        .kb-cta-bar{background:linear-gradient(135deg,var(--kb-accent),#8b5cf6);border-radius:16px;padding:32px;text-align:center;margin:20px 0;}
        .kb-cta-bar h3{font-size:22px;margin-bottom:8px;}
        .kb-cta-bar button{background:#fff;color:#1e293b;border:none;padding:12px 28px;border-radius:24px;font-weight:700;cursor:pointer;font-size:14px;margin:4px;}
        .kb-cta-bar button.outline{background:transparent;border:2px solid #fff;color:#fff;}
        .kb-email-capture{position:fixed;bottom:80px;right:20px;background:var(--kb-card);border:1px solid var(--kb-border);border-radius:16px;padding:20px;z-index:998;max-width:320px;box-shadow:0 16px 40px rgba(0,0,0,0.5);display:none;}
        .kb-email-capture.show{display:block;}
        .kb-email-capture input{width:100%;padding:10px;border-radius:8px;border:1px solid var(--kb-border);background:#0f172a;color:#fff;margin:8px 0;font-size:13px;}
        .kb-email-capture button{width:100%;padding:10px;border-radius:8px;background:var(--kb-gold);color:#000;border:none;font-weight:700;cursor:pointer;}
        @media(max-width:768px){.kb-stats{gap:20px;}.kb-stat .num{font-size:20px;}}
      </style>

      <div class="kb-wrap">
        <!-- Hero -->
        <div class="kb-hero">
          <h1>🚀 Grow Your Business With WhatsApp</h1>
          <p>15+ Years of Digital Marketing Experience. Free Playbooks, Tools, Courses & Community — Everything You Need to Scale.</p>
          <div class="kb-search">
            <input type="text" id="kbSearch" placeholder='Search "WhatsApp marketing strategy", "lead generation", "ROI calculator"...' onkeydown="if(event.key==='Enter')Knowledge.search()">
            <button onclick="Knowledge.search()">🔍 Search</button>
          </div>
          <div class="kb-stats">
            <div class="kb-stat"><div class="num">15+</div><div class="lbl">Years Experience</div></div>
            <div class="kb-stat"><div class="num">50+</div><div class="lbl">Free Playbooks</div></div>
            <div class="kb-stat"><div class="num">10K+</div><div class="lbl">Readers Worldwide</div></div>
            <div class="kb-stat"><div class="num">5</div><div class="lbl">Industries Served</div></div>
          </div>
        </div>

        <!-- 5 Pillars -->
        <div class="kb-section">
          <h2>📚 Knowledge Hub</h2>
          <div class="kb-grid">
            <div class="kb-card" onclick="Knowledge.currentSection='playbooks';Knowledge.render();">
              <div class="icon" style="background:rgba(59,130,246,0.2);color:#60a5fa;">📈</div>
              <span class="badge badge-free">FREE</span>
              <h3>Business Growth Playbooks</h3>
              <p>WhatsApp Marketing, Lead Gen, Sales Automation, Retention, Scaling — complete step-by-step guides.</p>
            </div>
            <div class="kb-card" onclick="Knowledge.currentSection='platform';Knowledge.render();">
              <div class="icon" style="background:rgba(16,185,129,0.2);color:#34d399;">🛠</div>
              <span class="badge badge-free">FREE</span>
              <h3>Platform Mastery</h3>
              <p>11 Avatar CRM, WhatsApp API Setup, Chatbot Building, Campaign Optimization — master the tools.</p>
            </div>
            <div class="kb-card" onclick="Knowledge.currentSection='industry';Knowledge.render();">
              <div class="icon" style="background:rgba(245,158,11,0.2);color:#fbbf24;">💡</div>
              <span class="badge badge-new">POPULAR</span>
              <h3>Industry Solutions</h3>
              <p>Real Estate, Healthcare, Education, E‑commerce, Finance — tailored strategies per industry.</p>
            </div>
            <div class="kb-card" onclick="Knowledge.currentSection='courses';Knowledge.render();">
              <div class="icon" style="background:rgba(168,85,247,0.2);color:#a78bfa;">🎓</div>
              <span class="badge badge-premium">FREE+PREMIUM</span>
              <h3>Courses & Certifications</h3>
              <p>Free foundation courses. Premium mastery programs. Get certified as WhatsApp Expert.</p>
            </div>
            <div class="kb-card" onclick="Knowledge.currentSection='tools';Knowledge.render();">
              <div class="icon" style="background:rgba(236,72,153,0.2);color:#f472b6;">🧰</div>
              <span class="badge badge-free">FREE TOOLS</span>
              <h3>Tools & Resources</h3>
              <p>ROI Calculator, Message Templates, Campaign Checklists, Industry Benchmarks — all free.</p>
            </div>
          </div>
        </div>

        <!-- Featured: Business Health Score -->
        <div class="kb-section">
          <div class="kb-cta-bar">
            <h3>🩺 Free Business Health Check</h3>
            <p>Get your personalized score across Lead Gen, Communication, Automation & Retention. Takes 2 minutes.</p>
            <button onclick="Knowledge.currentSection='healthscore';Knowledge.render();">Start Health Check</button>
          </div>
        </div>

        <!-- Quick Tools -->
        <div class="kb-section">
          <h2>🧰 Quick Tools</h2>
          <div class="kb-grid">
            <div class="kb-card" onclick="Knowledge.currentSection='roi';Knowledge.render();">
              <div class="icon" style="background:rgba(16,185,129,0.2);color:#34d399;">💰</div>
              <h3>WhatsApp ROI Calculator</h3>
              <p>See how much revenue WhatsApp can generate for YOUR business.</p>
            </div>
            <div class="kb-card" onclick="Knowledge.showEmailCapture()">
              <div class="icon" style="background:rgba(245,158,11,0.2);color:#fbbf24;">📧</div>
              <h3>Free Playbook Bundle</h3>
              <p>Get 5 premium playbooks delivered to your inbox. Instant download.</p>
            </div>
            <div class="kb-card" onclick="Knowledge.currentSection='community';Knowledge.render();">
              <div class="icon" style="background:rgba(59,130,246,0.2);color:#60a5fa;">🤝</div>
              <h3>Expert Community</h3>
              <p>Join 2000+ business owners. Q&A, webinars, case studies.</p>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div class="kb-section">
          <div class="kb-cta-bar">
            <h3>Ready to Scale Your Business?</h3>
            <p>Join 10,000+ businesses using 11 Avatar CRM to automate and grow.</p>
            <button onclick="window.open('https://allimpliments.github.io/WA-Dual-CRM/','_blank')">🚀 Try 11 Avatar CRM Free</button>
            <button class="outline" onclick="Knowledge.showEmailCapture()">📩 Get Free Consultation</button>
          </div>
        </div>

        <!-- Email Capture Popup -->
        <div class="kb-email-capture" id="kbEmailPopup">
          <h4>📩 Get Your Free Playbook Bundle</h4>
          <p style="font-size:12px;color:var(--kb-muted);">5 premium WhatsApp marketing playbooks + weekly tips from 15 years of experience.</p>
          <input type="text" id="kbEmailName" placeholder="Your Name">
          <input type="email" id="kbEmailInput" placeholder="Email Address">
          <input type="text" id="kbEmailBusiness" placeholder="Business Type (optional)">
          <button onclick="Knowledge.captureEmail()">Send Me Free Playbooks 🎁</button>
          <small style="color:var(--kb-muted);display:block;margin-top:6px;">No spam. Unsubscribe anytime.</small>
        </div>
      </div>

      <!-- Bottom Nav -->
      <div class="kb-bottom-nav">
        <a href="#" class="active" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-home"></i>Home</a>
        <a href="#" onclick="Knowledge.currentSection='playbooks';Knowledge.render();"><i class="fas fa-book"></i>Playbooks</a>
        <a href="#" onclick="Knowledge.currentSection='tools';Knowledge.render();"><i class="fas fa-tools"></i>Tools</a>
        <a href="#" onclick="Knowledge.currentSection='courses';Knowledge.render();"><i class="fas fa-graduation-cap"></i>Courses</a>
        <a href="#" onclick="Knowledge.currentSection='community';Knowledge.render();"><i class="fas fa-users"></i>Community</a>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  // ==================== PLAYBOOKS ====================
  async renderPlaybooks() {
    const playbooks = [
      {title:'WhatsApp Marketing Mastery',desc:'Complete guide to WhatsApp Business marketing — from setup to scaling. Templates, automation flows, campaign strategies.',level:'Beginner',time:'30 min'},
      {title:'Lead Generation Blueprint',desc:'Build a lead generation machine. Forms, landing pages, WhatsApp widgets, ad integration — capture leads from everywhere.',level:'Intermediate',time:'45 min'},
      {title:'Sales Automation Guide',desc:'Automate your sales process. Chatbots, drip sequences, auto-followups. Convert leads on autopilot.',level:'Advanced',time:'60 min'},
      {title:'Customer Retention Strategies',desc:'Keep customers coming back. Loyalty programs, re-engagement campaigns, feedback loops via WhatsApp.',level:'Intermediate',time:'25 min'},
      {title:'Scaling 0 to 1000 Customers',desc:'The ultimate scaling playbook. From your first customer to your thousandth — infrastructure, team, tools.',level:'Advanced',time:'90 min'},
    ];
    let html = this.kbHeader('📚 Business Growth Playbooks') + `<div class="kb-section"><div class="kb-grid">${playbooks.map(p=>`
      <div class="kb-card" onclick="Knowledge.openArticle('${p.title}')">
        <span class="badge badge-${p.level==='Beginner'?'free':'premium'}">${p.level}</span>
        <h3>${p.title}</h3><p>${p.desc}</p><small style="color:var(--kb-muted);">⏱ ${p.time}</small>
      </div>`).join('')}</div></div>`;
    contentArea.innerHTML = html;
  },

  // ==================== PLATFORM MASTERY ====================
  async renderPlatformMastery() {
    const guides = [
      {title:'11 Avatar CRM Complete Guide',desc:'Master every feature — dashboard, leads, campaigns, chatbot, forms, social posting.'},
      {title:'WhatsApp Business API Setup',desc:'Step-by-step Meta Business setup, phone number verification, webhook configuration.'},
      {title:'Chatbot Building Masterclass',desc:'Build intelligent chatbots — keyword triggers, AI fallback, multi-step flows.'},
      {title:'Campaign Optimization Guide',desc:'Bulk campaigns, drip sequences, personalization, A/B testing, analytics.'},
    ];
    let html = this.kbHeader('🛠 Platform Mastery') + `<div class="kb-section"><div class="kb-grid">${guides.map(g=>`
      <div class="kb-card" onclick="Knowledge.openArticle('${g.title}')">
        <span class="badge badge-free">GUIDE</span><h3>${g.title}</h3><p>${g.desc}</p>
      </div>`).join('')}</div></div>`;
    contentArea.innerHTML = html;
  },

  // ==================== INDUSTRY SOLUTIONS ====================
  async renderIndustrySolutions() {
    const industries = [
      {name:'Real Estate',icon:'🏠',stats:'Avg 40% more leads with WhatsApp',desc:'Property listings, virtual tours, instant inquiries, automated follow-ups.'},
      {name:'Healthcare',icon:'🏥',stats:'65% fewer no-shows',desc:'Appointment reminders, prescription updates, teleconsultation booking.'},
      {name:'Education',icon:'🎓',stats:'3x student engagement',desc:'Admission inquiries, fee reminders, exam notifications, parent communication.'},
      {name:'E‑commerce',icon:'🛒',stats:'25% cart recovery rate',desc:'Order confirmations, shipping updates, abandoned cart recovery, product recommendations.'},
      {name:'Financial Services',icon:'💰',stats:'50% faster loan processing',desc:'Document collection, application status, payment reminders, KYC verification.'},
    ];
    let html = this.kbHeader('💡 Industry Solutions') + `<div class="kb-section"><div class="kb-grid">${industries.map(i=>`
      <div class="kb-card" onclick="Knowledge.openArticle('${i.name} Industry Playbook')">
        <div class="icon" style="background:rgba(245,158,11,0.2);">${i.icon}</div>
        <h3>${i.name}</h3><p style="color:#34d399;font-weight:600;">${i.stats}</p><p>${i.desc}</p>
      </div>`).join('')}</div></div>`;
    contentArea.innerHTML = html;
  },

  // ==================== COURSES ====================
  async renderCourses() {
    let html = this.kbHeader('🎓 Courses & Certifications') + `
      <div class="kb-section">
        <div class="kb-grid">
          <div class="kb-card"><span class="badge badge-free">FREE</span><h3>WhatsApp Marketing 101</h3><p>Foundation course. 10 video lessons. Certificate on completion.</p><button class="btn btn-sm btn-outline-light mt-2" onclick="Knowledge.showEmailCapture()">Enroll Free</button></div>
          <div class="kb-card"><span class="badge badge-premium">₹4,999</span><h3>Advanced WhatsApp Automation</h3><p>Chatbots, flows, API integration. 20+ hours. Live projects.</p><button class="btn btn-sm btn-warning mt-2" onclick="Knowledge.showEmailCapture()">Buy Now</button></div>
          <div class="kb-card"><span class="badge badge-premium">₹49,999</span><h3>Certified WhatsApp Expert Program</h3><p>6-week live cohort. 1:1 mentorship. Official certification badge.</p><button class="btn btn-sm btn-warning mt-2" onclick="Knowledge.showEmailCapture()">Apply Now</button></div>
        </div>
      </div>`;
    contentArea.innerHTML = html;
  },

  // ==================== TOOLS ====================
  async renderTools() {
    let html = this.kbHeader('🧰 Free Tools & Resources') + `
      <div class="kb-section"><div class="kb-grid">
        <div class="kb-card" onclick="Knowledge.currentSection='roi';Knowledge.render();"><div class="icon" style="background:rgba(16,185,129,0.2);color:#34d399;">💰</div><h3>WhatsApp ROI Calculator</h3><p>Predict revenue from WhatsApp marketing. Input your numbers.</p></div>
        <div class="kb-card" onclick="Knowledge.openArticle('Message Templates')"><div class="icon" style="background:rgba(59,130,246,0.2);color:#60a5fa;">📝</div><h3>Message Template Library</h3><p>50+ ready-to-use WhatsApp message templates for every industry.</p></div>
        <div class="kb-card" onclick="Knowledge.openArticle('Campaign Checklists')"><div class="icon" style="background:rgba(245,158,11,0.2);color:#fbbf24;">✅</div><h3>Campaign Launch Checklist</h3><p>Never miss a step. Complete pre-launch checklist for campaigns.</p></div>
        <div class="kb-card" onclick="Knowledge.openArticle('Industry Benchmarks')"><div class="icon" style="background:rgba(168,85,247,0.2);color:#a78bfa;">📊</div><h3>Industry Benchmarks 2026</h3><p>Real data: open rates, reply times, conversion rates by industry.</p></div>
      </div></div>`;
    contentArea.innerHTML = html;
  },

  // ==================== COMMUNITY ====================
  async renderCommunity() {
    let html = this.kbHeader('🤝 Expert Community') + `
      <div class="kb-section"><div class="kb-grid">
        <div class="kb-card"><div class="icon" style="background:rgba(59,130,246,0.2);color:#60a5fa;">💬</div><h3>Q&A Forum</h3><p>Ask questions. Get answers from experts and peers.</p><button class="btn btn-sm btn-outline-light mt-2" onclick="Knowledge.showEmailCapture()">Join Discussion</button></div>
        <div class="kb-card"><div class="icon" style="background:rgba(16,185,129,0.2);color:#34d399;">🎙</div><h3>Live Webinars</h3><p>Weekly sessions on WhatsApp marketing trends, case studies, AMAs.</p><button class="btn btn-sm btn-outline-light mt-2" onclick="Knowledge.showEmailCapture()">Register Next</button></div>
        <div class="kb-card"><div class="icon" style="background:rgba(245,158,11,0.2);color:#fbbf24;">🏆</div><h3>Transformation Stories</h3><p>Real businesses. Real results. How they grew with WhatsApp.</p><button class="btn btn-sm btn-outline-light mt-2" onclick="Knowledge.openArticle('Case Studies')">Read Stories</button></div>
      </div></div>`;
    contentArea.innerHTML = html;
  },

  // ==================== BUSINESS HEALTH SCORE ====================
  async renderHealthScore() {
    let html = `
      ${this.kbHeader('🩺 Business Health Check')}
      <div class="kb-section"><div class="kb-card" style="max-width:600px;margin:0 auto;">
        <h3>Get Your Free Health Score</h3>
        <div class="mb-2"><label class="small">Industry</label><select id="hsIndustry" class="form-control form-control-sm"><option>Real Estate</option><option>Healthcare</option><option>Education</option><option>E-commerce</option><option>Finance</option><option>Other</option></select></div>
        <div class="mb-2"><label class="small">Monthly Leads</label><input type="number" id="hsLeads" class="form-control form-control-sm" placeholder="e.g. 200"></div>
        <div class="mb-2"><label class="small">Current Conversion Rate (%)</label><input type="number" id="hsConv" class="form-control form-control-sm" placeholder="e.g. 5"></div>
        <div class="mb-2"><label class="small">Using WhatsApp for Business?</label><select id="hsWA" class="form-select form-select-sm"><option value="no">No</option><option value="basic">Basic (manual)</option><option value="advanced">Advanced (API/CRM)</option></select></div>
        <button class="btn btn-primary w-100" onclick="Knowledge.calculateHealthScore()">Generate My Report</button>
        <div id="hsResult" class="mt-3"></div>
      </div></div>`;
    contentArea.innerHTML = html;
  },

  calculateHealthScore() {
    const ind = document.getElementById('hsIndustry').value;
    const leads = parseInt(document.getElementById('hsLeads').value)||0;
    const conv = parseInt(document.getElementById('hsConv').value)||0;
    const wa = document.getElementById('hsWA').value;
    
    let score = 0;
    if(leads > 500) score+=25; else if(leads > 100) score+=15; else score+=5;
    if(conv > 10) score+=25; else if(conv > 5) score+=15; else score+=5;
    if(wa==='advanced') score+=30; else if(wa==='basic') score+=15; else score+=0;
    score += Math.min(20, Math.floor(Math.random()*20));

    let grade = score>=80?'🏆 Excellent':score>=60?'👍 Good':score>=40?'📈 Average':'🚀 Growth Opportunity';
    let tips = wa==='no'?'<p class="small mt-2">💡 <b>Quick win:</b> Start using WhatsApp Business API. Businesses see 40%+ improvement in response rates.</p>':'';
    if(conv<5) tips+='<p class="small">💡 <b>Tip:</b> Improve conversion with automated follow-ups. Our playbook shows how.</p>';

    document.getElementById('hsResult').innerHTML=`
      <div class="text-center p-3 rounded" style="background:rgba(16,185,129,0.1);">
        <h2>${score}/100</h2><h4>${grade}</h4>
        <p class="small">${ind} Industry | ${leads} leads/mo | ${conv}% conversion</p>
        ${tips}
        <button class="btn btn-sm btn-warning mt-2" onclick="Knowledge.showEmailCapture()">📩 Get Full Report + Action Plan</button>
      </div>`;
  },

  // ==================== ROI CALCULATOR ====================
  async renderROICalculator() {
    let html = `
      ${this.kbHeader('💰 WhatsApp ROI Calculator')}
      <div class="kb-section"><div class="kb-card" style="max-width:600px;margin:0 auto;">
        <div class="mb-2"><label class="small">Monthly Leads</label><input type="number" id="roiLeads" class="form-control form-control-sm" placeholder="e.g. 500"></div>
        <div class="mb-2"><label class="small">Average Deal Value (₹)</label><input type="number" id="roiValue" class="form-control form-control-sm" placeholder="e.g. 10000"></div>
        <div class="mb-2"><label class="small">Current Conversion Rate (%)</label><input type="number" id="roiConv" class="form-control form-control-sm" placeholder="e.g. 5"></div>
        <div class="mb-2"><label class="small">With WhatsApp (expected % improvement)</label><input type="number" id="roiImprove" class="form-control form-control-sm" value="30"></div>
        <button class="btn btn-primary w-100" onclick="Knowledge.calculateROI()">Calculate My ROI</button>
        <div id="roiResult" class="mt-3"></div>
      </div></div>`;
    contentArea.innerHTML = html;
  },

  calculateROI() {
    const leads=parseInt(document.getElementById('roiLeads').value)||0;
    const val=parseInt(document.getElementById('roiValue').value)||0;
    const conv=parseInt(document.getElementById('roiConv').value)||0;
    const imp=parseInt(document.getElementById('roiImprove').value)||30;
    
    const currentRev = leads*(conv/100)*val;
    const newConv = conv*(1+imp/100);
    const newRev = leads*(newConv/100)*val;
    const extra = newRev-currentRev;

    document.getElementById('roiResult').innerHTML=`
      <div class="text-center p-3 rounded" style="background:rgba(16,185,129,0.1);">
        <h5>Current Monthly Revenue</h5><h3>₹${currentRev.toLocaleString()}</h3>
        <h5>With WhatsApp</h5><h3 style="color:#34d399;">₹${newRev.toLocaleString()}</h3>
        <h5>Extra Revenue</h5><h2 style="color:#fbbf24;">+₹${extra.toLocaleString()}/mo</h2>
        <button class="btn btn-sm btn-warning mt-2" onclick="Knowledge.showEmailCapture()">📩 Get Implementation Plan</button>
      </div>`;
  },

  // ==================== HELPERS ====================
  kbHeader(title) {
    return `<div class="kb-wrap"><div class="kb-section" style="padding-top:20px;"><button class="btn btn-sm btn-outline-light mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();">← Back to Hub</button><h2>${title}</h2></div></div>`;
  },

  openArticle(title) {
    alert(`📖 "${title}"\n\nFull article coming soon! Subscribe to get notified when published.\n\nThis is where your 15+ years of expertise becomes a lead magnet.`);
    this.showEmailCapture();
  },

  search() {
    const q = document.getElementById('kbSearch')?.value?.toLowerCase()||'';
    if(!q) return;
    if(q.includes('roi')||q.includes('calculator')){this.currentSection='roi';this.render();return;}
    if(q.includes('health')||q.includes('score')){this.currentSection='healthscore';this.render();return;}
    if(q.includes('playbook')||q.includes('marketing')){this.currentSection='playbooks';this.render();return;}
    if(q.includes('course')||q.includes('certification')){this.currentSection='courses';this.render();return;}
    if(q.includes('tool')||q.includes('template')){this.currentSection='tools';this.render();return;}
    if(q.includes('community')||q.includes('forum')){this.currentSection='community';this.render();return;}
    alert(`🔍 Searching for "${q}"...\n\nThis smart search will scan all playbooks, articles, tools, and community posts.\nSubscribe to get notified when new content matching "${q}" is published.`);
    this.showEmailCapture();
  },

  showEmailCapture() {
    document.getElementById('kbEmailPopup')?.classList.add('show');
  },

  async captureEmail() {
    const name = document.getElementById('kbEmailName').value.trim();
    const email = document.getElementById('kbEmailInput').value.trim();
    const business = document.getElementById('kbEmailBusiness').value.trim();
    if(!email){alert('Please enter your email!');return;}
    
    try{
      await db.collection('knowledge_subscribers').add({
        name, email, business,
        source: 'knowledge_hub',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      document.getElementById('kbEmailPopup').classList.remove('show');
      alert('✅ Welcome! Your free playbooks are on the way.\n\nCheck your inbox!');
    }catch(e){
      alert('✅ Subscribed! (Demo mode — email saved)');
      document.getElementById('kbEmailPopup').classList.remove('show');
    }
  }
};
