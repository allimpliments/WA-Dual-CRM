// js/knowledge.js — Core Knowledge Engine (Router Only)
const Knowledge = {
  currentSection: 'home',
  modules: {},

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = 'var(--bg-primary, #f0f2f5)';
    
    // Lazy load module if needed
    if (this.currentSection === 'home') { this.renderHome(); return; }
    
    const moduleName = this.currentSection.split('/')[0];
    await this.loadModule(moduleName);
    if (this.modules[moduleName]) {
      this.modules[moduleName].render(this.currentSection);
    }
  },

  async loadModule(name) {
    if (this.modules[name]) return;
    
    const modulePaths = {
      'playbooks': 'js/knowledge/playbooks.js',
      'platform': 'js/knowledge/platform.js',
      'industry': 'js/knowledge/industry.js',
      'courses': 'js/knowledge/courses.js',
      'tools': 'js/knowledge/tools.js',
      'community': 'js/knowledge/community.js',
      'healthscore': 'js/knowledge/healthScore.js',
      'roi': 'js/knowledge/roiCalculator.js',
      'blog': 'js/knowledge/blog.js',
      'webinars': 'js/knowledge/webinars.js',
      'templates': 'js/knowledge/templates.js',
    };

    if (!modulePaths[name]) return;
    
    try {
      const response = await fetch(modulePaths[name]);
      const code = await response.text();
      const ModuleClass = eval(`(${code})`);
      this.modules[name] = new ModuleClass(this);
    } catch(e) {
      console.error(`Failed to load module: ${name}`, e);
      contentArea.innerHTML = `<div class="card-widget"><h5>Module Loading...</h5><p class="text-muted">Please try again.</p></div>`;
    }
  },

  // ==================== HOME ====================
  renderHome() {
    let html = `
      <style>
        .ke-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:20px;cursor:pointer;transition:all 0.3s;}
        .ke-card:hover{transform:translateY(-3px);box-shadow:0 12px 30px rgba(24,119,242,0.15);border-color:#1877f2;}
        .ke-icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:10px;}
        .ke-badge{position:absolute;top:10px;right:10px;padding:4px 10px;border-radius:12px;font-size:10px;font-weight:600;}
        .ke-badge-free{background:#d1fae5;color:#065f46;}
        .ke-badge-premium{background:#fef3c7;color:#92400e;}
        .ke-badge-new{background:#e0e7ff;color:#3730a3;}
        .ke-hero{background:linear-gradient(135deg,#1877f2,#6366f1,#8b5cf6);border-radius:16px;padding:30px;color:#fff;margin-bottom:20px;}
        .ke-stat{text-align:center;padding:12px;background:rgba(255,255,255,0.15);border-radius:10px;}
        .ke-stat .num{font-size:22px;font-weight:800;}.ke-stat .lbl{font-size:10px;text-transform:uppercase;opacity:0.8;}
      </style>
      
      <div class="ke-hero">
        <h3 style="font-size:24px;font-weight:800;">🧠 The Knowledge Engine</h3>
        <p style="opacity:0.9;font-size:14px;">15+ Years of Digital Marketing Experience. Modular, Scalable, Always Growing.</p>
        <div class="row g-2 mt-3">
          <div class="col-6 col-md-3"><div class="ke-stat"><div class="num">15+</div><div class="lbl">Years</div></div></div>
          <div class="col-6 col-md-3"><div class="ke-stat"><div class="num">10</div><div class="lbl">Modules</div></div></div>
          <div class="col-6 col-md-3"><div class="ke-stat"><div class="num">50+</div><div class="lbl">Playbooks</div></div></div>
          <div class="col-6 col-md-3"><div class="ke-stat"><div class="num">∞</div><div class="lbl">Scalable</div></div></div>
        </div>
      </div>

      <h5 class="mb-3">📚 Knowledge Modules</h5>
      <div class="row g-3">
        ${this.moduleCard('playbooks','📈','#e0e7ff','#4f46e5','Business Growth Playbooks','WhatsApp Marketing, Lead Gen, Sales Automation, Retention, Scaling.','FREE')}
        ${this.moduleCard('platform','🛠','#d1fae5','#059669','Platform Mastery','11 Avatar CRM, WhatsApp API, Chatbots, Campaigns.','FREE')}
        ${this.moduleCard('industry','💡','#fef3c7','#d97706','Industry Solutions','Real Estate, Healthcare, Education, E‑commerce, Finance.','POPULAR')}
        ${this.moduleCard('courses','🎓','#f3e8ff','#7c3aed','Courses & Certifications','Free courses. Premium mastery. Certified WhatsApp Expert.','PREMIUM')}
        ${this.moduleCard('tools','🧰','#fce7f3','#db2777','Tools & Resources','ROI Calculator, Templates, Checklists, Benchmarks.','FREE')}
        ${this.moduleCard('community','🤝','#e0f2fe','#0369a1','Expert Community','Q&A, Webinars, Case Studies. 2000+ members.','FREE')}
      </div>

      <div class="ke-hero mt-4" style="background:linear-gradient(135deg,#10b981,#059669);">
        <h5>🩺 Business Health Check</h5>
        <p style="font-size:13px;opacity:0.9;">Score across Lead Gen, Communication, Automation & Retention.</p>
        <button class="btn btn-light btn-sm" onclick="Knowledge.currentSection='healthscore';Knowledge.render();">Start →</button>
      </div>
      <div class="ke-hero mt-3" style="background:linear-gradient(135deg,#f59e0b,#d97706);">
        <h5>💰 WhatsApp ROI Calculator</h5>
        <p style="font-size:13px;opacity:0.9;">Predicted revenue from WhatsApp for YOUR business.</p>
        <button class="btn btn-light btn-sm" onclick="Knowledge.currentSection='roi';Knowledge.render();">Calculate →</button>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  moduleCard(section, icon, bg, color, title, desc, badge) {
    const badgeClass = badge==='FREE'?'ke-badge-free':badge==='PREMIUM'?'ke-badge-premium':'ke-badge-new';
    return `<div class="col-md-4"><div class="ke-card" style="position:relative;" onclick="Knowledge.currentSection='${section}';Knowledge.render();"><span class="ke-badge ${badgeClass}">${badge}</span><div class="ke-icon" style="background:${bg};color:${color};">${icon}</div><h6>${title}</h6><small class="text-muted">${desc}</small></div></div>`;
  },

  showEmailPopup() {
    const p = document.createElement('div');
    p.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;';
    p.innerHTML = `<div style="background:#fff;border-radius:16px;padding:24px;width:400px;max-width:90vw;" onclick="event.stopPropagation()"><h5>📩 Get Free Resources</h5><input id="keEmail" class="form-control form-control-sm mb-2" placeholder="Email *"><input id="keName" class="form-control form-control-sm mb-2" placeholder="Name"><button class="btn btn-primary btn-sm w-100" onclick="Knowledge.saveEmail()">Subscribe</button><small class="text-muted d-block text-center mt-2">No spam.</small></div>`;
    p.addEventListener('click',()=>p.remove());
    document.body.appendChild(p);
  },

  async saveEmail() {
    const email = document.getElementById('keEmail')?.value?.trim();
    if(!email) return alert('Enter email!');
    try {
      await db.collection('knowledge_subscribers').add({
        email, name: document.getElementById('keName')?.value?.trim()||'',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      document.querySelector('[style*="z-index:9999"]')?.remove();
      alert('✅ Subscribed!');
    } catch(e) { alert('✅ Done!'); }
  }
};
