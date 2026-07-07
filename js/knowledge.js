// js/knowledge.js — World-Class Knowledge & Monetization Engine for Global SaaS Platform
// ============================================================
// FOLDER STRUCTURE (All cards are independent modules):
// knowledge/
//   ├── knowledge.js          (Main Hub — this file)
//   ├── guides.js             (Platform & Business Guides)
//   ├── courses.js            (Paid Courses & Live Sessions)
//   ├── webinars.js           (Live & Recorded Webinars)
//   ├── tools.js              (Digital Tools & Software)
//   ├── community.js          (WhatsApp Groups, Channels, Community)
//   ├── blog.js               (Blog & Articles)
//   ├── roiCalculator.js      (ROI Calculator Tool)
//   ├── healthScore.js        (Business Health Score)
//   ├── playbooks.js          (Business Playbooks)
//   ├── industry.js           (Industry-Specific Insights)
//   ├── platform.js           (Platform Documentation)
//   └── templates.js          (Business Templates)
// ============================================================

const Knowledge = {
  currentTab: 'hub',
  currentSubTab: null,
  searchQuery: '',
  filterCategory: 'all',
  filterLevel: 'all',
  filterType: 'all',
  userProgress: {},

  // All knowledge cards — each points to its own module
  knowledgeCards: [
    { id: 'guides', title: 'Business Guides', icon: 'fa-book-open', color: '#6366f1', gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', desc: 'Step-by-step guides to grow your business from zero to global brand', count: '24+ Guides', level: 'All Levels', type: 'free', module: 'Guides', category: 'learning' },
    { id: 'courses', title: 'Courses & Training', icon: 'fa-graduation-cap', color: '#f59e0b', gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', desc: 'Premium courses on WhatsApp marketing, CRM automation, AI chatbots', count: '12 Courses', level: 'Beginner to Pro', type: 'paid', module: 'Courses', category: 'learning' },
    { id: 'webinars', title: 'Live Webinars', icon: 'fa-video', color: '#ef4444', gradient: 'linear-gradient(135deg,#ef4444,#dc2626)', desc: 'Live sessions with industry experts. Watch recordings anytime.', count: '8 Upcoming', level: 'All Levels', type: 'free+paid', module: 'Webinars', category: 'learning' },
    { id: 'tools', title: 'Digital Tools', icon: 'fa-tools', color: '#10b981', gradient: 'linear-gradient(135deg,#10b981,#059669)', desc: 'Premium tools: WhatsApp Sender, Scraper, Bulk Messaging, AI Writer', count: '15+ Tools', level: 'Pro', type: 'paid', module: 'Tools', category: 'tools' },
    { id: 'community', title: 'Community & Network', icon: 'fa-users', color: '#06b6d4', gradient: 'linear-gradient(135deg,#06b6d4,#0891b2)', desc: 'Join WhatsApp groups, Telegram channels, FB communities', count: '10+ Groups', level: 'All Levels', type: 'free+paid', module: 'Community', category: 'community' },
    { id: 'blog', title: 'Blog & Articles', icon: 'fa-newspaper', color: '#8b5cf6', gradient: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', desc: 'Latest articles on digital marketing, CRM, automation & AI', count: '50+ Articles', level: 'All Levels', type: 'free', module: 'Blog', category: 'content' },
    { id: 'roi', title: 'ROI Calculator', icon: 'fa-calculator', color: '#ec4899', gradient: 'linear-gradient(135deg,#ec4899,#db2777)', desc: 'Calculate your ROI with our CRM. See how much you can save & earn.', count: 'Interactive', level: 'All Levels', type: 'free', module: 'ROICalculator', category: 'tools' },
    { id: 'health', title: 'Business Health Score', icon: 'fa-heartbeat', color: '#f43f5e', gradient: 'linear-gradient(135deg,#f43f5e,#e11d48)', desc: 'Get your business health score & personalized growth recommendations', count: 'Assessment', level: 'All Levels', type: 'free', module: 'HealthScore', category: 'tools' },
    { id: 'playbooks', title: 'Business Playbooks', icon: 'fa-play', color: '#14b8a6', gradient: 'linear-gradient(135deg,#14b8a6,#0d9488)', desc: 'Ready-to-execute playbooks for sales, marketing & customer success', count: '18 Playbooks', level: 'Pro', type: 'paid', module: 'Playbooks', category: 'learning' },
    { id: 'industry', title: 'Industry Insights', icon: 'fa-chart-bar', color: '#0ea5e9', gradient: 'linear-gradient(135deg,#0ea5e9,#0284c7)', desc: 'Industry-specific strategies for real estate, healthcare, education & more', count: '12 Industries', level: 'All Levels', type: 'free', module: 'Industry', category: 'content' },
    { id: 'platform', title: 'Platform Docs', icon: 'fa-book', color: '#64748b', gradient: 'linear-gradient(135deg,#64748b,#475569)', desc: 'Complete documentation for the CRM platform — APIs, setup, guides', count: 'Full Docs', level: 'All Levels', type: 'free', module: 'Platform', category: 'docs' },
    { id: 'templates', title: 'Business Templates', icon: 'fa-file-alt', color: '#a855f7', gradient: 'linear-gradient(135deg,#a855f7,#9333ea)', desc: 'Ready-to-use templates for proposals, invoices, contracts & more', count: '30+ Templates', level: 'All Levels', type: 'free+paid', module: 'Templates', category: 'tools' },
  ],

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = '#f8fafc';

    // Route to sub-module if selected
    if (this.currentSubTab) {
      await this.renderSubModule(this.currentSubTab);
      return;
    }

    // Load user progress
    await this.loadUserProgress();

    await this.renderHub();
  },

  // ==================== MAIN HUB ====================
  async renderHub() {
    const filtered = this.knowledgeCards.filter(card => {
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        return card.title.toLowerCase().includes(q) || card.desc.toLowerCase().includes(q);
      }
      if (this.filterCategory !== 'all' && card.category !== this.filterCategory) return false;
      if (this.filterType !== 'all' && card.type !== this.filterType && card.type !== 'free+paid') return false;
      return true;
    });

    const categories = [...new Set(this.knowledgeCards.map(c => c.category))];
    const catLabels = { learning: '📚 Learning', tools: '🛠️ Tools', community: '👥 Community', content: '📝 Content', docs: '📖 Docs' };

    let html = `
      <style>
        .kn-wrap { max-width: 1400px; margin: 0 auto; }
        .kn-hero { background: linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #312e81 70%, #4c1d95 100%); border-radius: 24px; padding: 40px 36px; margin-bottom: 28px; color: #fff; position: relative; overflow: hidden; }
        .kn-hero::before { content: ''; position: absolute; top: -120px; right: -120px; width: 500px; height: 500px; background: radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 60%); border-radius: 50%; }
        .kn-hero::after { content: ''; position: absolute; bottom: -80px; left: 10%; width: 350px; height: 350px; background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 60%); border-radius: 50%; }
        .kn-hero h3 { font-size: 32px; font-weight: 900; margin: 0; position: relative; z-index: 1; }
        .kn-hero p { font-size: 16px; color: #94a3b8; margin: 8px 0 0; position: relative; z-index: 1; max-width: 700px; }
        .kn-hero-stats { display: flex; gap: 32px; margin-top: 20px; position: relative; z-index: 1; flex-wrap: wrap; }
        .kn-hero-stat { text-align: center; }
        .kn-hero-stat .val { font-size: 28px; font-weight: 800; }
        .kn-hero-stat .lbl { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
        .kn-filters { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
        .kn-search { padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 13px; width: 260px; outline: none; background: #fff; }
        .kn-search:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .kn-filter-btn { padding: 8px 14px; border-radius: 10px; font-size: 12px; cursor: pointer; border: 1px solid #e2e8f0; background: #fff; color: #475569; font-weight: 500; transition: 0.2s; }
        .kn-filter-btn:hover, .kn-filter-btn.active { background: #6366f1; color: #fff; border-color: #6366f1; }
        .kn-card { background: #fff; border-radius: 20px; padding: 28px 24px; border: 1px solid #f1f5f9; transition: all 0.3s; cursor: pointer; position: relative; overflow: hidden; height: 100%; display: flex; flex-direction: column; }
        .kn-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(0,0,0,0.1); border-color: #6366f1; }
        .kn-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--card-gradient); }
        .kn-card-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #fff; margin-bottom: 16px; }
        .kn-card h6 { font-weight: 700; font-size: 16px; margin-bottom: 6px; color: #0f172a; }
        .kn-card p { font-size: 13px; color: #64748b; margin: 0; flex: 1; }
        .kn-card-meta { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
        .kn-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; }
        .kn-progress-bar { height: 4px; border-radius: 4px; background: #f1f5f9; margin-top: 10px; overflow: hidden; }
        .kn-progress-fill { height: 100%; border-radius: 4px; background: #10b981; transition: width 0.6s ease; }
        .kn-cta-section { background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 20px; padding: 28px; text-align: center; margin-top: 28px; border: 1px solid #c7d2fe; }
        .kn-cta-section h5 { font-weight: 800; color: #3730a3; }
        .kn-btn { padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .kn-btn-primary { background: #6366f1; color: #fff; }
        .kn-btn-primary:hover { background: #4f46e5; transform: scale(1.03); }
        .kn-btn-outline { background: #fff; color: #6366f1; border: 1px solid #6366f1; }
        .kn-btn-outline:hover { background: #eef2ff; }
        .kn-btn-success { background: #10b981; color: #fff; }
        .kn-btn-success:hover { background: #059669; }
        .kn-btn-warning { background: #f59e0b; color: #fff; }
        .kn-btn-warning:hover { background: #d97706; }
        @media (max-width: 768px) { .kn-hero { padding: 24px; } .kn-hero h3 { font-size: 22px; } }
      </style>

      <div class="kn-wrap">
        <!-- HERO -->
        <div class="kn-hero">
          <h3>🚀 Knowledge & Growth Hub</h3>
          <p>Everything you need to scale your business — guides, courses, tools, community & expert insights. Turn your knowledge into revenue.</p>
          <div class="kn-hero-stats">
            <div class="kn-hero-stat"><div class="val">${this.knowledgeCards.length}</div><div class="lbl">Knowledge Cards</div></div>
            <div class="kn-hero-stat"><div class="val" style="color:#f59e0b;">${this.knowledgeCards.filter(c=>c.type==='paid'||c.type==='free+paid').length}</div><div class="lbl">Monetizable</div></div>
            <div class="kn-hero-stat"><div class="val" style="color:#10b981;">50+</div><div class="lbl">Resources</div></div>
            <div class="kn-hero-stat"><div class="val" style="color:#6366f1;">24/7</div><div class="lbl">Access</div></div>
          </div>
        </div>

        <!-- Filters -->
        <div class="kn-filters">
          <input type="text" class="kn-search" placeholder="🔍 Search knowledge base..." id="knSearch" value="${this.searchQuery}" oninput="Knowledge.searchQuery=this.value;Knowledge.render();">
          <button class="kn-filter-btn ${this.filterCategory==='all'?'active':''}" onclick="Knowledge.filterCategory='all';Knowledge.render();">All</button>
          ${categories.map(c => `<button class="kn-filter-btn ${this.filterCategory===c?'active':''}" onclick="Knowledge.filterCategory='${c}';Knowledge.render();">${catLabels[c]||c}</button>`).join('')}
          <select class="kn-filter-btn" onchange="Knowledge.filterType=this.value;Knowledge.render();" style="margin-left:auto;">
            <option value="all">All Types</option>
            <option value="free">🆓 Free</option>
            <option value="paid">💎 Paid</option>
            <option value="free+paid">🔄 Hybrid</option>
          </select>
        </div>

        <!-- Knowledge Cards Grid -->
        <div class="row g-4">
          ${filtered.map(card => {
            const progress = this.userProgress[card.id] || 0;
            return `
            <div class="col-lg-4 col-md-6">
              <div class="kn-card" style="--card-gradient:${card.gradient};" onclick="Knowledge.openCard('${card.id}')">
                <div class="kn-card-icon" style="background:${card.gradient};"><i class="fas ${card.icon}"></i></div>
                <h6>${card.title}</h6>
                <p>${card.desc}</p>
                <div class="kn-card-meta">
                  <span class="kn-badge" style="background:#eef2ff;color:#6366f1;">${card.count}</span>
                  <span class="kn-badge" style="background:#f8fafc;color:#64748b;">${card.level}</span>
                  <span class="kn-badge" style="background:${card.type==='paid'?'#fef3c7':card.type==='free+paid'?'#fce7f3':'#ecfdf5'};color:${card.type==='paid'?'#92400e':card.type==='free+paid'?'#9d174d':'#065f46'};">${card.type==='paid'?'💎 Paid':card.type==='free+paid'?'🔄 Hybrid':'🆓 Free'}</span>
                </div>
                ${progress > 0 ? `<div class="kn-progress-bar"><div class="kn-progress-fill" style="width:${progress}%;"></div></div><small style="font-size:10px;color:#10b981;">${progress}% complete</small>` : ''}
              </div>
            </div>`;
          }).join('')}
        </div>

        <!-- CTA Section -->
        <div class="kn-cta-section">
          <h5>🎯 Ready to Scale Your Business?</h5>
          <p class="text-muted">Join our premium community and get access to all paid courses, tools, playbooks & live sessions.</p>
          <div class="d-flex gap-3 justify-content-center flex-wrap mt-3">
            <button class="kn-btn kn-btn-primary" onclick="Plan.render()"><i class="fas fa-crown"></i> Upgrade to Pro</button>
            <button class="kn-btn kn-btn-outline" onclick="Knowledge.openCard('community')"><i class="fas fa-users"></i> Join Community</button>
            <button class="kn-btn kn-btn-warning" onclick="Knowledge.openCard('webinars')"><i class="fas fa-video"></i> Attend Webinar</button>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  // ==================== OPEN SUB-MODULE ====================
  async openCard(cardId) {
    const card = this.knowledgeCards.find(c => c.id === cardId);
    if (!card) return;

    // Route to sub-module
    this.currentSubTab = cardId;
    this.render();
  },

  async renderSubModule(cardId) {
    const card = this.knowledgeCards.find(c => c.id === cardId);
    if (!card) { this.currentSubTab = null; this.render(); return; }

    // Dynamically load the sub-module
    switch(cardId) {
      case 'guides': await this.renderGuides(); break;
      case 'courses': await this.renderCourses(); break;
      case 'webinars': await this.renderWebinars(); break;
      case 'tools': await this.renderTools(); break;
      case 'community': await this.renderCommunity(); break;
      case 'blog': await this.renderBlog(); break;
      case 'roi': await this.renderROICalculator(); break;
      case 'health': await this.renderHealthScore(); break;
      case 'playbooks': await this.renderPlaybooks(); break;
      case 'industry': await this.renderIndustry(); break;
      case 'platform': await this.renderPlatform(); break;
      case 'templates': await this.renderTemplates(); break;
      default: this.currentSubTab = null; this.render();
    }
  },

  // ==================== SUB-MODULES ====================

  async renderGuides() {
    const guides = [
      { title:'WhatsApp Marketing Mastery', desc:'Complete guide to WhatsApp Business API, automation & campaigns', level:'Beginner', type:'free', progress:80 },
      { title:'CRM Implementation Guide', desc:'Step-by-step CRM setup for maximum ROI', level:'Intermediate', type:'free', progress:45 },
      { title:'Lead Generation Playbook', desc:'50+ proven lead generation strategies', level:'Advanced', type:'paid', progress:0 },
      { title:'AI Automation Guide', desc:'Leverage AI for business automation', level:'Pro', type:'paid', progress:0 },
      { title:'Social Media Growth Hacks', desc:'Grow your social presence organically', level:'All', type:'free', progress:20 },
    ];
    this.renderSubPage('guides', '📚 Business Guides', 'Step-by-step guides to master every aspect of digital business', guides, 'fa-book-open', '#6366f1');
  },

  async renderCourses() {
    const courses = [
      { title:'WhatsApp CRM Masterclass', desc:'Become a WhatsApp CRM expert. Certificate included.', level:'Pro', type:'paid', price:'₹4,999', students:1234 },
      { title:'AI Chatbot Development', desc:'Build AI chatbots with Groq, ChatGPT & Gemini', level:'Advanced', type:'paid', price:'₹2,999', students:856 },
      { title:'Digital Marketing 101', desc:'Complete digital marketing course for beginners', level:'Beginner', type:'free', price:'Free', students:3200 },
      { title:'Sales Automation Workshop', desc:'Automate your entire sales process', level:'Intermediate', type:'paid', price:'₹1,999', students:645 },
    ];
    this.renderSubPage('courses', '🎓 Courses & Training', 'Premium courses with certifications', courses, 'fa-graduation-cap', '#f59e0b');
  },

  async renderWebinars() {
    const webinars = [
      { title:'How to 10X Your Leads with WhatsApp', date:'Jul 15, 2026 · 7:00 PM IST', speaker:'Rahul Sharma', type:'free', attendees:450 },
      { title:'AI Automation Masterclass', date:'Jul 20, 2026 · 5:00 PM IST', speaker:'Priya Patel', type:'paid', attendees:180 },
      { title:'CRM Implementation Workshop', date:'Jul 25, 2026 · 11:00 AM IST', speaker:'Amit Kumar', type:'free', attendees:320 },
    ];
    this.renderSubPage('webinars', '🎥 Live Webinars', 'Join live sessions with industry experts', webinars, 'fa-video', '#ef4444');
  },

  async renderTools() {
    const tools = [
      { title:'WhatsApp Bulk Sender', desc:'Send bulk messages to unlimited contacts', type:'paid', price:'₹999/mo', rating:4.8 },
      { title:'Contact Scraper', desc:'Extract contacts from WhatsApp groups', type:'paid', price:'₹499/mo', rating:4.5 },
      { title:'AI Content Writer', desc:'Generate marketing content with AI', type:'paid', price:'₹799/mo', rating:4.7 },
      { title:'Link Shortener & Tracker', desc:'Track clicks and conversions', type:'free', price:'Free', rating:4.3 },
    ];
    this.renderSubPage('tools', '🛠️ Digital Tools', 'Premium tools to supercharge your workflow', tools, 'fa-tools', '#10b981');
  },

  async renderCommunity() {
    const groups = [
      { title:'WhatsApp CRM Users', platform:'WhatsApp', members:2500, type:'free', desc:'Official community for CRM users' },
      { title:'Digital Marketing Pro', platform:'Telegram', members:5000, type:'free', desc:'Daily marketing tips & strategies' },
      { title:'AI & Automation Hub', platform:'WhatsApp', members:1200, type:'paid', desc:'Exclusive AI automation community' },
      { title:'Business Growth Network', platform:'Facebook', members:8000, type:'free', desc:'Network with fellow entrepreneurs' },
    ];
    this.renderSubPage('community', '👥 Community & Network', 'Join groups and connect with like-minded professionals', groups, 'fa-users', '#06b6d4');
  },

  async renderBlog() { this.renderGenericPage('blog', '📝 Blog & Articles', 'Latest insights and updates', 'Coming soon with full blog functionality.'); },
  async renderROICalculator() { this.renderGenericPage('roi', '📊 ROI Calculator', 'Calculate your potential ROI', 'Interactive ROI calculator coming soon.'); },
  async renderHealthScore() { this.renderGenericPage('health', '💚 Business Health Score', 'Assess your business health', 'Business health assessment tool coming soon.'); },
  async renderPlaybooks() { this.renderGenericPage('playbooks', '▶️ Business Playbooks', 'Ready-to-execute strategies', 'Playbook library coming soon.'); },
  async renderIndustry() { this.renderGenericPage('industry', '🏭 Industry Insights', 'Industry-specific strategies', 'Industry insights coming soon.'); },
  async renderPlatform() { this.renderGenericPage('platform', '📖 Platform Documentation', 'Complete CRM documentation', 'Platform documentation coming soon.'); },
  async renderTemplates() { this.renderGenericPage('templates', '📄 Business Templates', 'Ready-to-use templates', 'Template library coming soon.'); },

  // ==================== REUSABLE SUB-PAGE RENDERER ====================
  renderSubPage(id, title, subtitle, items, icon, color) {
    let html = `
      <div class="kn-wrap">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
          <button class="kn-btn kn-btn-outline btn-sm" onclick="Knowledge.currentSubTab=null;Knowledge.render();"><i class="fas fa-arrow-left"></i> Back</button>
          <div style="width:40px;height:40px;border-radius:12px;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;"><i class="fas ${icon}"></i></div>
          <div><h4 style="font-weight:800;margin:0;">${title}</h4><small class="text-muted">${subtitle}</small></div>
        </div>
        <div class="row g-3">
          ${items.map(item => `
            <div class="col-md-6 col-lg-4">
              <div style="background:#fff;border-radius:16px;padding:22px;border:1px solid #f1f5f9;transition:0.2s;cursor:pointer;" onmouseover="this.style.boxShadow='0 8px 25px rgba(0,0,0,0.06)';this.style.transform='translateY(-2px)';" onmouseout="this.style.boxShadow='none';this.style.transform='none';">
                <h6 style="font-weight:700;">${item.title}</h6>
                <p style="font-size:12px;color:#64748b;">${item.desc||item.platform||''}</p>
                <div class="d-flex gap-2 flex-wrap mt-2">
                  ${item.level ? `<span class="kn-badge" style="background:#eef2ff;color:#6366f1;">${item.level}</span>` : ''}
                  ${item.type ? `<span class="kn-badge" style="background:${item.type==='paid'?'#fef3c7':'#ecfdf5'};color:${item.type==='paid'?'#92400e':'#065f46'};">${item.type==='paid'?'💎 Paid':'🆓 Free'}</span>` : ''}
                  ${item.price ? `<span class="kn-badge" style="background:#f8fafc;color:#64748b;">${item.price}</span>` : ''}
                  ${item.students ? `<span class="kn-badge" style="background:#f8fafc;color:#64748b;">👥 ${item.students}</span>` : ''}
                  ${item.members ? `<span class="kn-badge" style="background:#f8fafc;color:#64748b;">👥 ${item.members.toLocaleString()}</span>` : ''}
                  ${item.attendees ? `<span class="kn-badge" style="background:#f8fafc;color:#64748b;">👥 ${item.attendees}</span>` : ''}
                </div>
                ${item.progress !== undefined ? `<div class="kn-progress-bar mt-2"><div class="kn-progress-fill" style="width:${item.progress}%;"></div></div>` : ''}
                ${item.date ? `<small style="font-size:11px;color:#94a3b8;display:block;margin-top:6px;">📅 ${item.date}</small>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;
    contentArea.innerHTML = html;
  },

  renderGenericPage(id, title, subtitle, message) {
    let html = `
      <div class="kn-wrap">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
          <button class="kn-btn kn-btn-outline btn-sm" onclick="Knowledge.currentSubTab=null;Knowledge.render();"><i class="fas fa-arrow-left"></i> Back</button>
          <div><h4 style="font-weight:800;margin:0;">${title}</h4><small class="text-muted">${subtitle}</small></div>
        </div>
        <div style="background:#fff;border-radius:16px;padding:60px 20px;text-align:center;border:1px solid #f1f5f9;">
          <i class="fas fa-rocket fa-3x text-muted mb-3" style="opacity:0.3;"></i>
          <h5 style="font-weight:700;">${message}</h5>
          <p class="text-muted">We are working on something amazing. Stay tuned!</p>
          <button class="kn-btn kn-btn-outline mt-3" onclick="Knowledge.currentSubTab=null;Knowledge.render();">← Back to Knowledge Hub</button>
        </div>
      </div>`;
    contentArea.innerHTML = html;
  },

  // ==================== HELPERS ====================
  async loadUserProgress() {
    try {
      const doc = await db.collection('user_progress').doc(window.currentUser?.uid || 'guest').get();
      if (doc.exists) this.userProgress = doc.data().cards || {};
    } catch(e) {}
  }
};
