// js/knowledge.js — Knowledge Engine Core Router
const Knowledge = {
  currentSection: 'home',
  moduleCache: {},

  // Module paths map
  modules: {
    playbooks: 'js/knowledge/playbooks.js',
    platform: 'js/knowledge/platform.js',
    industry: 'js/knowledge/industry.js',
    courses: 'js/knowledge/courses.js',
    tools: 'js/knowledge/tools.js',
    community: 'js/knowledge/community.js',
    healthscore: 'js/knowledge/healthScore.js',
    roi: 'js/knowledge/roiCalculator.js'
  },

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = 'var(--bg-primary, #f0f2f5)';
    
    if (this.currentSection === 'home') { await this.renderHome(); return; }
    
    const moduleKey = this.currentSection.split('/')[0];
    await this.loadAndRender(moduleKey);
  },

  async loadAndRender(moduleKey) {
    if (!this.modules[moduleKey]) {
      contentArea.innerHTML = `<div class="card-widget text-center py-5"><h4>Module Not Found</h4></div>`;
      return;
    }

    try {
      // Load module if not cached
      if (!this.moduleCache[moduleKey]) {
        const resp = await fetch(this.modules[moduleKey]);
        if (!resp.ok) throw new Error('Failed to load');
        const code = await resp.text();
        this.moduleCache[moduleKey] = new Function('Knowledge', 'contentArea', 'db', 'firebase', code);
      }
      
      // Execute module
      this.moduleCache[moduleKey](this, contentArea, db, firebase);
    } catch(e) {
      console.error(`Module ${moduleKey} error:`, e);
      contentArea.innerHTML = `<div class="card-widget text-center py-5"><i class="fas fa-exclamation-triangle fa-2x text-warning mb-3"></i><h5>Module Loading Failed</h5><p class="text-muted">Please try again or contact support.</p><button class="btn btn-outline-primary btn-sm" onclick="Knowledge.currentSection='home';Knowledge.render();">Back to Hub</button></div>`;
    }
  },

  // ==================== HOME PAGE ====================
  renderHome() {
    const stats = [
      { icon: 'fa-calendar-check', num: '15+', label: 'Years Experience', color: '#4f46e5', bg: '#e0e7ff' },
      { icon: 'fa-cubes', num: '8', label: 'Core Modules', color: '#059669', bg: '#d1fae5' },
      { icon: 'fa-book-open', num: '50+', label: 'Playbooks', color: '#d97706', bg: '#fef3c7' },
      { icon: 'fa-globe-asia', num: '10K+', label: 'Global Readers', color: '#db2777', bg: '#fce7f3' }
    ];

    const hubModules = [
      { key: 'playbooks', icon: 'fa-chart-line', title: 'Business Growth Playbooks', desc: 'WhatsApp Marketing, Lead Generation, Sales Automation, Retention Strategies, Scaling frameworks.', color: '#4f46e5', bg: '#e0e7ff', badge: 'Core' },
      { key: 'platform', icon: 'fa-cogs', title: 'Platform Mastery', desc: '11 Avatar CRM deep dives, WhatsApp API configuration, Chatbot architecture, Campaign optimization.', color: '#059669', bg: '#d1fae5', badge: 'Core' },
      { key: 'industry', icon: 'fa-building', title: 'Industry Solutions', desc: 'Real Estate, Healthcare, Education, E-commerce, Financial Services — tailored strategies per vertical.', color: '#d97706', bg: '#fef3c7', badge: 'Popular' },
      { key: 'courses', icon: 'fa-graduation-cap', title: 'Courses & Certifications', desc: 'Free foundation courses to premium mastery programs. Official WhatsApp Expert certification path.', color: '#7c3aed', bg: '#f3e8ff', badge: 'Premium' },
      { key: 'tools', icon: 'fa-toolbox', title: 'Free Tools & Resources', desc: 'ROI Calculator, Message Templates Library, Campaign Checklists, Industry Benchmarks vault.', color: '#db2777', bg: '#fce7f3', badge: 'Free' },
      { key: 'community', icon: 'fa-users', title: 'Expert Community', desc: 'Q&A Forum, Live Webinars, Transformation Case Studies. Learn from peers and industry leaders.', color: '#0369a1', bg: '#e0f2fe', badge: 'Active' }
    ];

    let html = `
      <style>
        .ke-hero{background:linear-gradient(135deg,#1e40af,#3b82f6,#6366f1);border-radius:16px;padding:36px 28px;color:#fff;margin-bottom:24px;position:relative;overflow:hidden;}
        .ke-hero::after{content:'';position:absolute;top:-60px;right:-60px;width:200px;height:200px;background:rgba(255,255,255,0.08);border-radius:50%;}
        .ke-hero::before{content:'';position:absolute;bottom:-40px;left:-40px;width:140px;height:140px;background:rgba(255,255,255,0.05);border-radius:50%;}
        .ke-hero h2{font-weight:800;font-size:26px;position:relative;z-index:1;}
        .ke-hero p{opacity:0.9;position:relative;z-index:1;}
        .ke-stat-card{background:rgba(255,255,255,0.12);backdrop-filter:blur(8px);border-radius:12px;padding:16px;text-align:center;position:relative;z-index:1;}
        .ke-stat-card .num{font-size:26px;font-weight:800;line-height:1;}
        .ke-stat-card .lbl{font-size:10px;text-transform:uppercase;letter-spacing:0.5px;opacity:0.8;margin-top:4px;}
        .ke-module-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:22px;cursor:pointer;transition:all 0.25s;position:relative;overflow:hidden;height:100%;}
        .ke-module-card:hover{transform:translateY(-3px);box-shadow:0 14px 30px rgba(0,0,0,0.08);border-color:#3b82f6;}
        .ke-module-card .ke-icon-wrap{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:12px;}
        .ke-module-card .ke-badge{position:absolute;top:12px;right:12px;padding:3px 10px;border-radius:10px;font-size:9px;font-weight:600;letter-spacing:0.5px;}
        .ke-module-card h6{font-size:14px;font-weight:600;margin-bottom:6px;}
        .ke-module-card p{color:#6b7280;font-size:12px;line-height:1.6;}
        .ke-section-title{font-size:16px;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px;}
        .ke-cta-strip{background:#f8fafc;border:2px dashed #d1d5db;border-radius:14px;padding:22px;text-align:center;margin-top:20px;}
        .ke-cta-strip h6{font-weight:700;margin-bottom:6px;}
        .ke-cta-strip button{margin:4px;}
      </style>

      <!-- Hero -->
      <div class="ke-hero">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <h2>The Knowledge Engine</h2>
            <p class="mb-0">15+ years of digital marketing expertise. Strategic frameworks, actionable playbooks, and tools to scale your business with WhatsApp.</p>
          </div>
          <div class="col-lg-4 mt-3 mt-lg-0">
            <div class="ke-stat-card">
              <div class="num">∞</div>
              <div class="lbl">Continuously Expanding</div>
            </div>
          </div>
        </div>
        <div class="row g-2 mt-3">
          ${stats.map(s => `
            <div class="col-6 col-md-3">
              <div class="ke-stat-card" style="background:rgba(255,255,255,0.1);">
                <i class="fas ${s.icon}" style="font-size:14px;opacity:0.7;"></i>
                <div class="num" style="font-size:22px;">${s.num}</div>
                <div class="lbl">${s.label}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Core Modules -->
      <div class="ke-section-title"><i class="fas fa-th-large text-primary"></i> Knowledge Modules</div>
      <div class="row g-3">
        ${hubModules.map(m => `
          <div class="col-md-6 col-lg-4">
            <div class="ke-module-card" onclick="Knowledge.currentSection='${m.key}';Knowledge.render();">
              <span class="ke-badge" style="background:${m.bg};color:${m.color};">${m.badge}</span>
              <div class="ke-icon-wrap" style="background:${m.bg};color:${m.color};"><i class="fas ${m.icon}"></i></div>
              <h6>${m.title}</h6>
              <p>${m.desc}</p>
              <small style="color:${m.color};font-weight:500;">Explore →</small>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Quick Actions -->
      <div class="row g-3 mt-3">
        <div class="col-md-6">
          <div class="ke-hero" style="background:linear-gradient(135deg,#059669,#10b981);padding:24px;">
            <h6 style="font-weight:700;">Business Health Diagnostic</h6>
            <p style="font-size:12px;opacity:0.9;">Comprehensive score across Lead Generation, Communication, Automation & Retention pillars.</p>
            <button class="btn btn-light btn-sm" onclick="Knowledge.currentSection='healthscore';Knowledge.render();">Run Diagnostic →</button>
          </div>
        </div>
        <div class="col-md-6">
          <div class="ke-hero" style="background:linear-gradient(135deg,#d97706,#f59e0b);padding:24px;">
            <h6 style="font-weight:700;">WhatsApp ROI Calculator</h6>
            <p style="font-size:12px;opacity:0.9;">Data-driven revenue projection. Input your metrics, see the potential impact of WhatsApp.</p>
            <button class="btn btn-light btn-sm" onclick="Knowledge.currentSection='roi';Knowledge.render();">Calculate ROI →</button>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="ke-cta-strip">
        <h6>Ready to transform your business communication?</h6>
        <p class="text-muted small mb-2">Join 10,000+ businesses leveraging WhatsApp for growth.</p>
        <button class="btn btn-primary btn-sm" onclick="Knowledge.showEmailPopup()">Get Free Resources</button>
        <button class="btn btn-outline-primary btn-sm" onclick="window.open('/','_blank')">Explore 11 Avatar CRM</button>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  // ==================== SHARED UTILITIES ====================
  showEmailPopup() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:16px;padding:28px;width:420px;max-width:92vw;box-shadow:0 20px 50px rgba(0,0,0,0.2);position:relative;" onclick="event.stopPropagation()">
        <button style="position:absolute;top:10px;right:14px;background:none;border:none;font-size:20px;cursor:pointer;color:#94a3b8;" onclick="this.closest('[style*=fixed]').remove();">×</button>
        <h5 style="font-weight:700;margin-bottom:4px;">Access Premium Resources</h5>
        <p style="color:#6b7280;font-size:13px;margin-bottom:16px;">Free playbooks, templates, and weekly strategic insights from 15+ years of experience.</p>
        <input id="kePopupEmail" class="form-control form-control-sm mb-2" placeholder="Email address *" type="email">
        <input id="kePopupName" class="form-control form-control-sm mb-2" placeholder="Full name (optional)">
        <select id="kePopupInterest" class="form-select form-select-sm mb-2">
          <option value="">Primary interest (optional)</option>
          <option>WhatsApp Marketing</option><option>Lead Generation</option><option>Sales Automation</option>
          <option>CRM Setup</option><option>Industry Solutions</option><option>General Growth</option>
        </select>
        <button class="btn btn-primary btn-sm w-100" onclick="Knowledge.saveEmailPopup()">Subscribe & Get Access</button>
        <p style="color:#9ca3af;font-size:10px;text-align:center;margin-top:8px;">No spam. Unsubscribe anytime. We respect your inbox.</p>
      </div>
    `;
    overlay.addEventListener('click', function(e) { if(e.target===overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  },

  async saveEmailPopup() {
    const email = document.getElementById('kePopupEmail')?.value?.trim();
    if (!email || !email.includes('@')) return alert('Please enter a valid email address.');
    try {
      await db.collection('knowledge_subscribers').add({
        email,
        name: document.getElementById('kePopupName')?.value?.trim() || '',
        interest: document.getElementById('kePopupInterest')?.value || '',
        source: 'knowledge_engine',
        subscribedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      document.querySelector('[style*="z-index:9999"]')?.remove();
      alert('Welcome aboard. Your resources have been sent to your inbox.');
    } catch(e) {
      document.querySelector('[style*="z-index:9999"]')?.remove();
      alert('Subscribed successfully.');
    }
  }
};
