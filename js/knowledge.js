// js/knowledge.js — Knowledge Engine Core Router
const Knowledge = {
  currentSection: 'home',
  moduleCache: {},

  modules: {
    playbooks: 'js/knowledge/playbooks.js',
    platform: 'js/knowledge/platform.js',
    industry: 'js/knowledge/industry.js',
    courses: 'js/knowledge/courses.js',
    tools: 'js/knowledge/tools.js',
    community: 'js/knowledge/community.js',
    healthscore: 'js/knowledge/healthScore.js',
    roi: 'js/knowledge/roiCalculator.js',
    blog: 'js/knowledge/blog.js',
    webinars: 'js/knowledge/webinars.js',
    templates: 'js/knowledge/templates.js'
  },

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = 'var(--bg-primary, #f0f2f5)';
    
    if (this.currentSection === 'home') { this.renderHome(); return; }
    
    const moduleKey = this.currentSection.split('/')[0];
    await this.loadAndRender(moduleKey);
  },

  async loadAndRender(moduleKey) {
    if (!this.modules[moduleKey]) {
      contentArea.innerHTML = `<div class="card-widget text-center py-5"><h4>Module Not Found</h4></div>`;
      return;
    }

    try {
      if (!this.moduleCache[moduleKey]) {
        const resp = await fetch(this.modules[moduleKey]);
        if (!resp.ok) throw new Error('Failed to load');
        const code = await resp.text();
        this.moduleCache[moduleKey] = new Function('Knowledge', 'contentArea', 'db', 'firebase', code);
      }
      
      this.moduleCache[moduleKey](this, contentArea, db, firebase);
    } catch(e) {
      console.error(`Module ${moduleKey} error:`, e);
      contentArea.innerHTML = `<div class="card-widget text-center py-5"><i class="fas fa-exclamation-triangle fa-2x text-warning mb-3"></i><h5>Module Loading Failed</h5><p class="text-muted">Please try again or contact support.</p><button class="btn btn-outline-primary btn-sm" onclick="Knowledge.currentSection='home';Knowledge.render();">Back to Hub</button></div>`;
    }
  },

  renderHome() {
    const stats = [
      { icon: 'fa-calendar-check', num: '15+', label: 'Years Experience', color: '#4f46e5' },
      { icon: 'fa-cubes', num: '11', label: 'Core Modules', color: '#059669' },
      { icon: 'fa-book-open', num: '50+', label: 'Playbooks', color: '#d97706' },
      { icon: 'fa-globe-asia', num: '10K+', label: 'Global Readers', color: '#db2777' }
    ];

    const hubModules = [
      { key: 'playbooks', icon: 'fa-chart-line', title: 'Business Growth Playbooks', desc: 'WhatsApp Marketing, Lead Generation, Sales Automation, Retention Strategies, Scaling frameworks.', color: '#4f46e5', bg: '#e0e7ff', badge: 'Core' },
      { key: 'platform', icon: 'fa-cogs', title: 'Platform Mastery', desc: '11 Avatar CRM deep dives, WhatsApp API configuration, Chatbot architecture, Campaign optimization.', color: '#059669', bg: '#d1fae5', badge: 'Core' },
      { key: 'industry', icon: 'fa-building', title: 'Industry Solutions', desc: 'Real Estate, Healthcare, Education, E-commerce, Financial Services — tailored strategies per vertical.', color: '#d97706', bg: '#fef3c7', badge: 'Popular' },
      { key: 'courses', icon: 'fa-graduation-cap', title: 'Courses & Certifications', desc: 'Free foundation courses to premium mastery programs. Official WhatsApp Expert certification path.', color: '#7c3aed', bg: '#f3e8ff', badge: 'Premium' },
      { key: 'tools', icon: 'fa-toolbox', title: 'Free Tools & Resources', desc: 'ROI Calculator, Message Templates Library, Campaign Checklists, Industry Benchmarks vault.', color: '#db2777', bg: '#fce7f3', badge: 'Free' },
      { key: 'community', icon: 'fa-users', title: 'Expert Community', desc: 'Q&A Forum, Live Webinars, Transformation Case Studies. Learn from peers and industry leaders.', color: '#0369a1', bg: '#e0f2fe', badge: 'Active' },
      { key: 'blog', icon: 'fa-newspaper', title: 'Strategic Blog', desc: 'Deep dives into WhatsApp strategy, digital marketing trends, and real-world implementation guides.', color: '#0891b2', bg: '#e0f2fe', badge: 'Read' },
      { key: 'webinars', icon: 'fa-video', title: 'Expert Webinars', desc: 'Live sessions and recorded content from practitioners. WhatsApp strategy, case studies, AMAs.', color: '#be185d', bg: '#fce7f3', badge: 'Watch' },
      { key: 'templates', icon: 'fa-file-alt', title: 'Templates Library', desc: 'Downloadable resources — message packs, planning worksheets, compliance checklists, ROI dashboards.', color: '#b45309', bg: '#fef3c7', badge: 'Download' }
    ];

    let html = `
      <style>
        .ke-hero{background:linear-gradient(135deg,#1e40af,#3b82f6,#6366f1);border-radius:16px;padding:36px 28px;color:#fff;margin-bottom:24px;position:relative;overflow:hidden;}
        .ke-hero h2{font-weight:800;font-size:26px;position:relative;z-index:1;}
        .ke-hero p{opacity:0.9;position:relative;z-index:1;font-size:14px;}
        .ke-stat-card{background:rgba(255,255,255,0.12);border-radius:12px;padding:14px;text-align:center;}
        .ke-stat-card .num{font-size:22px;font-weight:800;}
        .ke-stat-card .lbl{font-size:10px;text-transform:uppercase;opacity:0.8;margin-top:2px;}
        .ke-module-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:20px;cursor:pointer;transition:all 0.25s;position:relative;height:100%;}
        .ke-module-card:hover{transform:translateY(-2px);box-shadow:0 10px 25px rgba(0,0,0,0.06);border-color:#3b82f6;}
        .ke-module-card .ke-icon-wrap{width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;margin-bottom:10px;}
        .ke-module-card .ke-badge{position:absolute;top:10px;right:10px;padding:3px 8px;border-radius:8px;font-size:9px;font-weight:600;}
        .ke-module-card h6{font-size:13px;font-weight:600;margin-bottom:4px;}
        .ke-module-card p{color:#6b7280;font-size:11px;line-height:1.5;}
        .ke-section-title{font-size:16px;font-weight:700;margin-bottom:14px;}
        .ke-cta-strip{background:#f8fafc;border:2px dashed #d1d5db;border-radius:14px;padding:20px;text-align:center;margin-top:20px;}
      </style>

      <div class="ke-hero">
        <h2>The Knowledge Engine</h2>
        <p>15+ years of digital marketing expertise. Strategic frameworks, actionable playbooks, and tools to scale your business.</p>
        <div class="row g-2 mt-3">
          ${stats.map(s => `<div class="col-6 col-md-3"><div class="ke-stat-card"><div class="num">${s.num}</div><div class="lbl">${s.label}</div></div></div>`).join('')}
        </div>
      </div>

      <div class="ke-section-title"><i class="fas fa-th-large text-primary"></i> Knowledge Modules</div>
      <div class="row g-3">
        ${hubModules.map(m => `
          <div class="col-md-6 col-lg-4">
            <div class="ke-module-card" onclick="Knowledge.currentSection='${m.key}';Knowledge.render();">
              <span class="ke-badge" style="background:${m.bg};color:${m.color};">${m.badge}</span>
              <div class="ke-icon-wrap" style="background:${m.bg};color:${m.color};"><i class="fas ${m.icon}"></i></div>
              <h6>${m.title}</h6>
              <p>${m.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="row g-3 mt-3">
        <div class="col-md-6"><div class="ke-hero" style="background:linear-gradient(135deg,#059669,#10b981);padding:22px;"><h6 style="font-weight:700;">Business Health Diagnostic</h6><p style="font-size:12px;opacity:0.9;">Score across Lead Generation, Communication, Automation & Retention.</p><button class="btn btn-light btn-sm" onclick="Knowledge.currentSection='healthscore';Knowledge.render();">Run Diagnostic →</button></div></div>
        <div class="col-md-6"><div class="ke-hero" style="background:linear-gradient(135deg,#d97706,#f59e0b);padding:22px;"><h6 style="font-weight:700;">WhatsApp ROI Calculator</h6><p style="font-size:12px;opacity:0.9;">Data-driven revenue projection for your business.</p><button class="btn btn-light btn-sm" onclick="Knowledge.currentSection='roi';Knowledge.render();">Calculate ROI →</button></div></div>
      </div>

      <div class="ke-cta-strip">
        <h6>Ready to transform your business communication?</h6>
        <p class="text-muted small mb-2">Join 10,000+ businesses leveraging WhatsApp for growth.</p>
        <button class="btn btn-primary btn-sm" onclick="Knowledge.showEmailPopup()">Get Free Resources</button>
        <button class="btn btn-outline-primary btn-sm" onclick="window.open('/','_blank')">Explore 11 Avatar CRM</button>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  showEmailPopup() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:16px;padding:24px;width:400px;max-width:92vw;box-shadow:0 20px 50px rgba(0,0,0,0.2);position:relative;" onclick="event.stopPropagation()">
        <button style="position:absolute;top:8px;right:12px;background:none;border:none;font-size:20px;cursor:pointer;color:#94a3b8;" onclick="this.closest('[style*=fixed]').remove();">×</button>
        <h5 style="font-weight:700;margin-bottom:4px;">Access Premium Resources</h5>
        <p style="color:#6b7280;font-size:12px;margin-bottom:14px;">Free playbooks, templates, and weekly strategic insights.</p>
        <input id="kePopupEmail" class="form-control form-control-sm mb-2" placeholder="Email address *" type="email">
        <input id="kePopupName" class="form-control form-control-sm mb-2" placeholder="Full name (optional)">
        <button class="btn btn-primary btn-sm w-100" onclick="Knowledge.saveEmailPopup()">Subscribe & Get Access</button>
        <p style="color:#9ca3af;font-size:10px;text-align:center;margin-top:6px;">No spam. Unsubscribe anytime.</p>
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
        source: 'knowledge_engine',
        subscribedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      document.querySelector('[style*="z-index:9999"]')?.remove();
      alert('Welcome aboard. Resources sent to your inbox.');
    } catch(e) {
      document.querySelector('[style*="z-index:9999"]')?.remove();
      alert('Subscribed successfully.');
    }
  }
}; 
