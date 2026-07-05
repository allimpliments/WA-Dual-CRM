// js/knowledge.js — Knowledge Engine (All-in-One, Direct Rendering)
const Knowledge = {
  currentSection: 'home',

  render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = 'var(--bg-primary, #f0f2f5)';

    switch(this.currentSection) {
      case 'home': this.renderHome(); break;
      case 'playbooks': this.renderPlaybooks(); break;
      case 'platform': this.renderPlatform(); break;
      case 'industry': this.renderIndustry(); break;
      case 'courses': this.renderCourses(); break;
      case 'tools': this.renderTools(); break;
      case 'community': this.renderCommunity(); break;
      case 'healthscore': this.renderHealthScore(); break;
      case 'roi': this.renderROI(); break;
      case 'blog': this.renderBlog(); break;
      case 'webinars': this.renderWebinars(); break;
      case 'templates': this.renderTemplates(); break;
    }
  },

  // ==================== PLATFORM MASTERY — LOADS FROM EXTERNAL FILE ====================
  renderPlatformPage() {
    contentArea.innerHTML = `
      <style>
        .kh-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:18px;cursor:pointer;transition:0.25s;}
        .kh-card:hover{border-color:#3b82f6;box-shadow:0 8px 20px rgba(0,0,0,0.05);}
      </style>
      <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Back to Hub</button>
      <h5 style="font-weight:700;">Platform Mastery</h5>
      <p class="text-muted small mb-3">Complete user guides for all 45+ features. Click any to view.</p>
      <div class="row g-3" id="platformGuides"></div>
      <div id="guideDetail" style="display:none;background:#fff;border-radius:14px;padding:24px;margin-top:16px;border:1px solid #e5e7eb;"></div>
    `;

    const guides = [
      {t:'Templates',d:'Create, sync & send WhatsApp message templates.',file:'js/knowledge/guides/templates.js',icon:'fa-layer-group',c:'#4f46e5'},
      {t:'Campaigns',d:'Bulk & Drip campaigns with targeting.',file:'js/knowledge/guides/campaigns.js',icon:'fa-rocket',c:'#f59e0b'},
      {t:'Chats',d:'Live chat: WhatsApp, FB, IG.',file:'js/knowledge/guides/chats.js',icon:'fa-comments',c:'#25D366'},
      {t:'Contacts',d:'Manage contacts, groups, CSV import.',file:'js/knowledge/guides/contacts.js',icon:'fa-users',c:'#1877f2'},
      {t:'Leads',d:'Lead capture, pipeline, filters.',file:'js/knowledge/guides/leads.js',icon:'fa-funnel-dollar',c:'#4f46e5'},
      {t:'Kanban',d:'Visual pipeline: 7 stages.',file:'js/knowledge/guides/kanban.js',icon:'fa-tasks',c:'#6366f1'},
      {t:'Flows',d:'Meta templates + visual builder.',file:'js/knowledge/guides/flows.js',icon:'fa-sitemap',c:'#8b5cf6'},
      {t:'Social',d:'Multi-platform posting.',file:'js/knowledge/guides/social.js',icon:'fa-globe',c:'#1877f2'},
      {t:'Chatbot',d:'AI settings, keywords, flows.',file:'js/knowledge/guides/chatbot.js',icon:'fa-robot',c:'#8b5cf6'},
      {t:'Appointments',d:'Booking, reminders, Meet.',file:'js/knowledge/guides/appointments.js',icon:'fa-calendar-check',c:'#059669'},
      {t:'Integrations',d:'APIs, webhooks, 30+ platforms.',file:'js/knowledge/guides/integrations.js',icon:'fa-plug',c:'#d97706'},
      {t:'Forms',d:'Builder, design, submissions.',file:'js/knowledge/guides/forms.js',icon:'fa-wpforms',c:'#db2777'}
    ];

    document.getElementById('platformGuides').innerHTML = guides.map(g => `
      <div class="col-md-6 col-lg-4">
        <div class="kh-card" onclick="var d=document.getElementById('guideDetail');d.style.display='block';d.innerHTML='Loading...';d.scrollIntoView({behavior:'smooth'});fetch('${g.file}').then(r=>r.text()).then(code=>{var fn=new Function('return '+code)();d.innerHTML=fn;}).catch(e=>{d.innerHTML='<p class=\\'text-danger\\'>Error: '+e.message+'</p>';});" style="display:flex;gap:12px;cursor:pointer;">
          <div style="width:40px;height:40px;border-radius:8px;background:${g.c}15;color:${g.c};display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fas ${g.icon}"></i></div>
          <div><h6 style="font-weight:600;">${g.t}</h6><p style="font-size:11px;color:#6b7280;">${g.d}</p></div>
        </div>
      </div>
    `).join('');
  },
  
  // ==================== HOME ====================
  renderHome() {
    contentArea.innerHTML = `
      <style>
        .kh-hero{background:linear-gradient(135deg,#1e40af,#3b82f6,#6366f1);border-radius:16px;padding:32px 24px;color:#fff;margin-bottom:20px;}
        .kh-hero h2{font-weight:800;font-size:24px;}
        .kh-stat{background:rgba(255,255,255,0.12);border-radius:10px;padding:14px;text-align:center;}
        .kh-stat .n{font-size:22px;font-weight:800;}.kh-stat .l{font-size:10px;text-transform:uppercase;opacity:0.8;}
        .kh-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:18px;cursor:pointer;transition:0.25s;height:100%;}
        .kh-card:hover{transform:translateY(-2px);box-shadow:0 10px 25px rgba(0,0,0,0.06);border-color:#3b82f6;}
        .kh-card .icon{width:40px;height:40px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;margin-bottom:10px;}
        .kh-card .badge{position:absolute;top:10px;right:10px;padding:2px 8px;border-radius:6px;font-size:9px;font-weight:600;}
        .kh-card h6{font-size:13px;font-weight:600;margin-bottom:4px;}
        .kh-card p{color:#6b7280;font-size:11px;line-height:1.4;}
      </style>

      <div class="kh-hero">
        <h2>The Knowledge Engine</h2>
        <p style="opacity:0.9;font-size:14px;">15+ years of digital marketing expertise. Strategic frameworks, actionable playbooks, and tools to scale your business.</p>
        <div class="row g-2 mt-3">
          <div class="col-6 col-md-3"><div class="kh-stat"><div class="n">15+</div><div class="l">Years</div></div></div>
          <div class="col-6 col-md-3"><div class="kh-stat"><div class="n">11</div><div class="l">Modules</div></div></div>
          <div class="col-6 col-md-3"><div class="kh-stat"><div class="n">50+</div><div class="l">Playbooks</div></div></div>
          <div class="col-6 col-md-3"><div class="kh-stat"><div class="n">10K+</div><div class="l">Readers</div></div></div>
        </div>
      </div>

      <h5 style="font-weight:700;margin-bottom:14px;">Knowledge Modules</h5>
      <div class="row g-3">
        ${[
          {k:'playbooks',i:'fa-chart-line',t:'Business Growth Playbooks',d:'WhatsApp Marketing, Lead Gen, Sales Automation, Retention, Scaling.',c:'#4f46e5',bg:'#e0e7ff',b:'Core'},
          {k:'platform',i:'fa-cogs',t:'Platform Mastery',d:'11 Avatar CRM Guides, WhatsApp API, Chatbots, Campaigns, Templates, Chats & more.',c:'#059669',bg:'#d1fae5',b:'Core'},
          {k:'industry',i:'fa-building',t:'Industry Solutions',d:'Real Estate, Healthcare, Education, E-commerce, Finance.',c:'#d97706',bg:'#fef3c7',b:'Popular'},
          {k:'courses',i:'fa-graduation-cap',t:'Courses & Certifications',d:'Free foundation to premium mastery. Certified Expert path.',c:'#7c3aed',bg:'#f3e8ff',b:'Premium'},
          {k:'tools',i:'fa-toolbox',t:'Free Tools & Resources',d:'ROI Calculator, Templates, Checklists, Benchmarks.',c:'#db2777',bg:'#fce7f3',b:'Free'},
          {k:'community',i:'fa-users',t:'Expert Community',d:'Q&A Forum, Webinars, Case Studies. Learn from peers.',c:'#0369a1',bg:'#e0f2fe',b:'Active'},
          {k:'blog',i:'fa-newspaper',t:'Strategic Blog',d:'Deep dives into WhatsApp strategy and digital marketing.',c:'#0891b2',bg:'#e0f2fe',b:'Read'},
          {k:'webinars',i:'fa-video',t:'Expert Webinars',d:'Live sessions and recorded content from practitioners.',c:'#be185d',bg:'#fce7f3',b:'Watch'},
          {k:'templates',i:'fa-file-alt',t:'Templates Library',d:'Message packs, worksheets, checklists, dashboards.',c:'#b45309',bg:'#fef3c7',b:'Download'}
        ].map(m => `
          <div class="col-md-6 col-lg-4">
            <div class="kh-card" onclick="Knowledge.currentSection='${m.k}';Knowledge.render();" style="position:relative;">
              <span class="badge" style="background:${m.bg};color:${m.c};">${m.b}</span>
              <div class="icon" style="background:${m.bg};color:${m.c};"><i class="fas ${m.i}"></i></div>
              <h6>${m.t}</h6><p>${m.d}</p>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="row g-3 mt-3">
        <div class="col-md-6"><div class="kh-hero" style="background:linear-gradient(135deg,#059669,#10b981);padding:20px;cursor:pointer;" onclick="Knowledge.currentSection='healthscore';Knowledge.render();"><h6 style="font-weight:700;">Business Health Diagnostic</h6><p style="font-size:12px;opacity:0.9;">Score across Lead Gen, Communication, Automation & Retention.</p><small>Run Diagnostic →</small></div></div>
        <div class="col-md-6"><div class="kh-hero" style="background:linear-gradient(135deg,#d97706,#f59e0b);padding:20px;cursor:pointer;" onclick="Knowledge.currentSection='roi';Knowledge.render();"><h6 style="font-weight:700;">WhatsApp ROI Calculator</h6><p style="font-size:12px;opacity:0.9;">Data-driven revenue projection for your business.</p><small>Calculate ROI →</small></div></div>
      </div>
    `;
  },

  // ==================== PLAYBOOKS ====================
  renderPlaybooks() {
    contentArea.innerHTML = `
      <style>.kh-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:18px;cursor:pointer;transition:0.25s;}.kh-card:hover{border-color:#3b82f6;box-shadow:0 8px 20px rgba(0,0,0,0.05);}</style>
      <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Back to Hub</button>
      <h5 style="font-weight:700;">Business Growth Playbooks</h5>
      <p class="text-muted small mb-3">Strategic frameworks for every stage of business growth.</p>
      <div class="row g-3">
        ${[
          {t:'WhatsApp Marketing Mastery',d:'Complete framework from setup to scaling.',l:'Beginner',tm:'35 min'},
          {t:'Lead Generation Blueprint',d:'Multi-channel capture system.',l:'Intermediate',tm:'45 min'},
          {t:'Sales Automation Architecture',d:'Intelligent flows, chatbots, drip sequences.',l:'Advanced',tm:'60 min'},
          {t:'Customer Retention Systems',d:'Loyalty programs, re-engagement campaigns.',l:'Intermediate',tm:'30 min'},
          {t:'Scaling 0 to 1000 Customers',d:'Infrastructure, team structure, tool stack.',l:'Advanced',tm:'75 min'}
        ].map(p => `
          <div class="col-md-6 col-lg-4"><div class="kh-card" onclick="Knowledge.showEmailPopup()">
            <span class="badge bg-${p.l==='Beginner'?'success':p.l==='Intermediate'?'warning':'danger'} mb-2">${p.l}</span>
            <h6 style="font-weight:600;">${p.t}</h6><p style="font-size:12px;color:#6b7280;">${p.d}</p>
            <small class="text-muted"><i class="far fa-clock me-1"></i>${p.tm}</small>
          </div></div>
        `).join('')}
      </div>
    `;
  },

  // ==================== INDUSTRY ====================
  renderIndustry() {
    contentArea.innerHTML = `
      <style>.kh-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:18px;cursor:pointer;transition:0.25s;}.kh-card:hover{border-color:#3b82f6;box-shadow:0 8px 20px rgba(0,0,0,0.05);}</style>
      <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Back to Hub</button>
      <h5 style="font-weight:700;">Industry Solutions</h5>
      <p class="text-muted small mb-3">Tailored WhatsApp strategies for specific industries.</p>
      <div class="row g-3">
        ${[
          {n:'Real Estate',i:'fa-home',s:'40% more qualified leads',d:'Virtual property tours, instant inquiry responses.',c:'#4f46e5'},
          {n:'Healthcare',i:'fa-hospital',s:'65% reduction in no-shows',d:'Automated appointment reminders, prescriptions.',c:'#059669'},
          {n:'Education',i:'fa-graduation-cap',s:'3x student engagement rate',d:'Admission inquiries, fee reminders, exam notifications.',c:'#d97706'},
          {n:'E-commerce',i:'fa-shopping-cart',s:'25% abandoned cart recovery',d:'Order confirmations, shipping updates, reviews.',c:'#db2777'},
          {n:'Financial Services',i:'fa-landmark',s:'50% faster loan processing',d:'Document collection, status tracking, KYC.',c:'#7c3aed'}
        ].map(ind => `
          <div class="col-md-6 col-lg-4"><div class="kh-card" onclick="Knowledge.showEmailPopup()">
            <div style="width:40px;height:40px;border-radius:8px;background:${ind.c}15;color:${ind.c};display:flex;align-items:center;justify-content:center;margin-bottom:8px;"><i class="fas ${ind.i}"></i></div>
            <h6 style="font-weight:600;">${ind.n}</h6><p style="color:${ind.c};font-weight:600;">${ind.s}</p><p style="font-size:11px;color:#6b7280;">${ind.d}</p>
          </div></div>
        `).join('')}
      </div>
    `;
  },

  // ==================== COURSES ====================
  renderCourses() {
    contentArea.innerHTML = `
      <style>.kh-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:18px;cursor:pointer;transition:0.25s;height:100%;display:flex;flex-direction:column;}.kh-card:hover{border-color:#3b82f6;box-shadow:0 8px 20px rgba(0,0,0,0.05);}</style>
      <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Back to Hub</button>
      <h5 style="font-weight:700;">Courses & Certifications</h5>
      <p class="text-muted small mb-3">Structured learning paths from foundation to mastery.</p>
      <div class="row g-3">
        ${[
          {t:'WhatsApp Marketing Foundation',l:'Free',m:8,d:'4 hours',desc:'Core concepts: WhatsApp ecosystem, profile optimization, broadcasts.',c:'#059669',i:'fa-seedling'},
          {t:'Advanced WhatsApp Automation',l:'₹4,999',m:16,d:'12 hours',desc:'Chatbot architecture, API integration, webhook handling.',c:'#d97706',i:'fa-cogs'},
          {t:'Certified WhatsApp Expert',l:'₹49,999',m:24,d:'6 weeks',desc:'Live cohort. 1:1 mentorship. Real projects.',c:'#7c3aed',i:'fa-award'}
        ].map(c => `
          <div class="col-md-4"><div class="kh-card" onclick="Knowledge.showEmailPopup()">
            <div><span class="badge bg-${c.l==='Free'?'success':'warning'} mb-2">${c.l}</span>
            <div style="width:36px;height:36px;border-radius:8px;background:${c.c}10;color:${c.c};display:flex;align-items:center;justify-content:center;margin-bottom:8px;"><i class="fas ${c.i}"></i></div>
            <h6 style="font-weight:600;">${c.t}</h6><p style="font-size:11px;color:#6b7280;">${c.desc}</p></div>
            <div class="mt-auto"><div class="d-flex justify-content-between small text-muted mb-2"><span>${c.m} modules</span><span>${c.d}</span></div>
            <button class="btn btn-${c.l==='Free'?'outline-primary':'warning'} btn-sm w-100">${c.l==='Free'?'Enroll Free':'Get Started'}</button></div>
          </div></div>
        `).join('')}
      </div>
    `;
  },

  // ==================== TOOLS ====================
  renderTools() {
    contentArea.innerHTML = `
      <style>.kh-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;cursor:pointer;transition:0.25s;}.kh-card:hover{border-color:#3b82f6;box-shadow:0 8px 20px rgba(0,0,0,0.05);}</style>
      <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Back to Hub</button>
      <h5 style="font-weight:700;">Free Tools & Resources</h5>
      <p class="text-muted small mb-3">Practical tools to optimize your WhatsApp marketing operations.</p>
      <div class="row g-3">
        ${[
          {t:'WhatsApp ROI Calculator',d:'Project revenue impact based on your metrics.',i:'fa-calculator',c:'#059669',a:"Knowledge.currentSection='roi';Knowledge.render();"},
          {t:'Message Template Library',d:'50+ professionally crafted message templates.',i:'fa-copy',c:'#4f46e5',a:"Knowledge.showEmailPopup()"},
          {t:'Campaign Launch Checklist',d:'Comprehensive pre-launch checklist.',i:'fa-clipboard-check',c:'#d97706',a:"Knowledge.showEmailPopup()"},
          {t:'Industry Benchmarks 2026',d:'Real performance data: open rates, conversions.',i:'fa-chart-simple',c:'#db2777',a:"Knowledge.showEmailPopup()"},
          {t:'Response Time Calculator',d:'Measure and optimize team response time.',i:'fa-stopwatch',c:'#7c3aed',a:"Knowledge.showEmailPopup()"},
          {t:'Campaign Budget Planner',d:'Calculate cost per message and projected ROI.',i:'fa-coins',c:'#0369a1',a:"Knowledge.showEmailPopup()"}
        ].map(t => `
          <div class="col-md-6 col-lg-4"><div class="kh-card" onclick="${t.a}">
            <div style="width:36px;height:36px;border-radius:8px;background:${t.c}15;color:${t.c};display:flex;align-items:center;justify-content:center;margin-bottom:8px;"><i class="fas ${t.i}"></i></div>
            <h6 style="font-weight:600;">${t.t}</h6><p style="font-size:11px;color:#6b7280;">${t.d}</p>
          </div></div>
        `).join('')}
      </div>
    `;
  },

  // ==================== COMMUNITY ====================
  renderCommunity() {
    contentArea.innerHTML = `
      <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Back to Hub</button>
      <h5 style="font-weight:700;">Expert Community</h5>
      <p class="text-muted small mb-3">Connect with peers, learn from experts.</p>
      <div class="row g-3">
        <div class="col-md-4"><div class="card-widget text-center py-4"><div style="width:44px;height:44px;border-radius:10px;background:#e0e7ff;color:#4f46e5;display:flex;align-items:center;justify-content:center;font-size:18px;margin:0 auto 10px;"><i class="fas fa-comments"></i></div><h6>Q&A Forum</h6><p style="font-size:11px;color:#6b7280;">Ask questions, share knowledge.</p><button class="btn btn-outline-primary btn-sm" onclick="Knowledge.showEmailPopup()">Join</button></div></div>
        <div class="col-md-4"><div class="card-widget text-center py-4"><div style="width:44px;height:44px;border-radius:10px;background:#d1fae5;color:#059669;display:flex;align-items:center;justify-content:center;font-size:18px;margin:0 auto 10px;"><i class="fas fa-video"></i></div><h6>Live Webinars</h6><p style="font-size:11px;color:#6b7280;">Weekly sessions.</p><button class="btn btn-outline-primary btn-sm" onclick="Knowledge.showEmailPopup()">Register</button></div></div>
        <div class="col-md-4"><div class="card-widget text-center py-4"><div style="width:44px;height:44px;border-radius:10px;background:#fef3c7;color:#d97706;display:flex;align-items:center;justify-content:center;font-size:18px;margin:0 auto 10px;"><i class="fas fa-trophy"></i></div><h6>Stories</h6><p style="font-size:11px;color:#6b7280;">Real results.</p><button class="btn btn-outline-primary btn-sm" onclick="Knowledge.showEmailPopup()">Read</button></div></div>
      </div>
    `;
  },

  // ==================== HEALTH SCORE ====================
  renderHealthScore() {
    contentArea.innerHTML = `
      <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();">Back to Hub</button>
      <h5 style="font-weight:700;">Business Health Diagnostic</h5>
      <div class="card-widget" style="max-width:500px;margin:0 auto;">
        <div class="mb-2"><label class="form-label small fw-bold">Industry</label><select id="hsIndustry" class="form-select form-select-sm"><option>Real Estate</option><option>Healthcare</option><option>Education</option><option>E-commerce</option><option>Finance</option></select></div>
        <div class="mb-2"><label class="form-label small fw-bold">Monthly Leads</label><input type="number" id="hsLeads" class="form-control form-control-sm" placeholder="200"></div>
        <div class="mb-2"><label class="form-label small fw-bold">Conversion Rate (%)</label><input type="number" id="hsConv" class="form-control form-control-sm" placeholder="5"></div>
        <div class="mb-2"><label class="form-label small fw-bold">WhatsApp Setup</label><select id="hsWA" class="form-select form-select-sm"><option value="none">Not using</option><option value="basic">Basic</option><option value="advanced">Advanced</option></select></div>
        <button class="btn btn-primary w-100" onclick="var l=parseInt(document.getElementById('hsLeads').value)||0,c=parseFloat(document.getElementById('hsConv').value)||0,w=document.getElementById('hsWA').value,s=25;if(l>500)s+=20;else if(l>100)s+=10;if(c>10)s+=20;else if(c>5)s+=10;if(w==='advanced')s+=25;else if(w==='basic')s+=10;s=Math.min(s,100);var g=s>=80?'Excellent':s>=60?'Good':s>=40?'Developing':'Early Stage';document.getElementById('hsResult').innerHTML='<div class=\"mt-3 p-3 text-center rounded\" style=\"background:#f0fdf4;\"><h3>'+s+'/100</h3><p><strong>'+g+'</strong></p><button class=\"btn btn-primary btn-sm\" onclick=\"Knowledge.showEmailPopup()\">Get Full Report</button></div>';">Generate Report</button>
        <div id="hsResult"></div>
      </div>
    `;
  },

  // ==================== ROI CALCULATOR ====================
  renderROI() {
    contentArea.innerHTML = `
      <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();">Back to Hub</button>
      <h5 style="font-weight:700;">WhatsApp ROI Calculator</h5>
      <div class="card-widget" style="max-width:500px;margin:0 auto;">
        <div class="mb-2"><label class="form-label small fw-bold">Monthly Leads</label><input type="number" id="roiLeads" class="form-control form-control-sm" placeholder="500"></div>
        <div class="mb-2"><label class="form-label small fw-bold">Deal Value (₹)</label><input type="number" id="roiValue" class="form-control form-control-sm" placeholder="10000"></div>
        <div class="mb-2"><label class="form-label small fw-bold">Conversion Rate (%)</label><input type="number" id="roiConv" class="form-control form-control-sm" placeholder="5"></div>
        <div class="mb-2"><label class="form-label small fw-bold">Expected Uplift (%)</label><input type="number" id="roiUplift" class="form-control form-control-sm" value="35"></div>
        <button class="btn btn-primary w-100" onclick="var l=parseInt(document.getElementById('roiLeads').value)||0,v=parseInt(document.getElementById('roiValue').value)||0,c=parseFloat(document.getElementById('roiConv').value)||0,u=parseFloat(document.getElementById('roiUplift').value)||35,cur=Math.round(l*(c/100)*v),nc=c*(1+u/100),nxt=Math.round(l*(nc/100)*v),up=nxt-cur;document.getElementById('roiResult').innerHTML='<div class=\"mt-3 p-3 text-center\" style=\"background:#f0fdf4;border-radius:12px;\"><div class=\"row\"><div class=\"col-6\"><small>Current</small><h5>₹'+cur.toLocaleString()+'</h5></div><div class=\"col-6\"><small>With WhatsApp</small><h5 style=\"color:#059669;\">₹'+nxt.toLocaleString()+'</h5></div></div><h4 style=\"color:#d97706;\">+₹'+up.toLocaleString()+'/mo</h4><button class=\"btn btn-primary btn-sm\" onclick=\"Knowledge.showEmailPopup()\">Get Plan</button></div>';">Calculate ROI</button>
        <div id="roiResult"></div>
      </div>
    `;
  },

  // ==================== BLOG ====================
  renderBlog() {
    contentArea.innerHTML = `
      <style>.blog-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;cursor:pointer;transition:0.25s;}.blog-card:hover{border-color:#3b82f6;}.blog-img{height:100px;display:flex;align-items:center;justify-content:center;font-size:30px;}.blog-body{padding:14px;}</style>
      <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();">Back to Hub</button>
      <h5 style="font-weight:700;">Strategic Blog</h5>
      <div class="row g-3">
        ${[{t:'WhatsApp Business Revolution 2026',c:'Industry Trends',a:'11 Avatar Team',d:'8 min',i:'fa-newspaper',co:'#4f46e5'},{t:'Lead Generation That Works',c:'Lead Gen',a:'Marketing Team',d:'12 min',i:'fa-magnet',co:'#059669'},{t:'Automation Without Losing Human Touch',c:'Automation',a:'Product Team',d:'10 min',i:'fa-robot',co:'#d97706'},{t:'Real Estate Firm Doubled Conversions',c:'Case Study',a:'Success Team',d:'6 min',i:'fa-building',co:'#db2777'},{t:'Broadcast vs Group vs Community',c:'Strategy',a:'Strategy Team',d:'7 min',i:'fa-bullhorn',co:'#7c3aed'},{t:'Marketing Metrics That Matter',c:'Analytics',a:'Analytics Team',d:'9 min',i:'fa-chart-line',co:'#0369a1'}].map(a=>`<div class="col-md-6 col-lg-4"><div class="blog-card" onclick="Knowledge.showEmailPopup()"><div class="blog-img" style="background:${a.co}10;color:${a.co};"><i class="fas ${a.i}"></i></div><div class="blog-body"><span class="badge bg-light text-dark mb-1">${a.c}</span><h6 style="font-weight:600;">${a.t}</h6><div class="d-flex justify-content-between small text-muted"><span>${a.a}</span><span>${a.d}</span></div></div></div></div>`).join('')}
      </div>
    `;
  },

  // ==================== WEBINARS ====================
  renderWebinars() {
    contentArea.innerHTML = `
      <style>.kh-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;cursor:pointer;transition:0.25s;}.kh-card:hover{border-color:#3b82f6;}</style>
      <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();">Back to Hub</button>
      <h5 style="font-weight:700;">Expert Webinars</h5>
      <h6 class="mb-2"><i class="fas fa-calendar-alt text-primary me-1"></i>Upcoming</h6>
      <div class="row g-3 mb-4"><div class="col-md-6"><div class="kh-card" onclick="Knowledge.showEmailPopup()"><div class="d-flex gap-3"><div style="width:40px;height:40px;border-radius:8px;background:#4f46e515;color:#4f46e5;display:flex;align-items:center;justify-content:center;"><i class="fas fa-video"></i></div><div><h6>WhatsApp Marketing Masterclass</h6><small>July 15 · 4:00 PM · 90 min</small></div></div></div></div><div class="col-md-6"><div class="kh-card" onclick="Knowledge.showEmailPopup()"><div class="d-flex gap-3"><div style="width:40px;height:40px;border-radius:8px;background:#05966915;color:#059669;display:flex;align-items:center;justify-content:center;"><i class="fas fa-laptop-code"></i></div><div><h6>Lead Generation Workshop</h6><small>July 22 · 3:00 PM · 60 min</small></div></div></div></div></div>
      <h6><i class="fas fa-play text-success me-1"></i>Recorded</h6>
      ${[{t:'Getting Started with WhatsApp API',v:'1.2K',d:'45 min'},{t:'Advanced Chatbot Design',v:'890',d:'55 min'},{t:'Campaign Analytics Deep Dive',v:'650',d:'40 min'},{t:'Customer Retention Strategies',v:'720',d:'50 min'}].map(r=>`<div class="kh-card mb-2" onclick="Knowledge.showEmailPopup()" style="display:flex;align-items:center;gap:12px;padding:12px;"><i class="fas fa-play-circle text-muted"></i><div class="flex-grow-1"><strong>${r.t}</strong><br><small>${r.d} · ${r.v} views</small></div></div>`).join('')}
    `;
  },

  // ==================== TEMPLATES ====================
  renderTemplates() {
    contentArea.innerHTML = `
      <style>.kh-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;cursor:pointer;transition:0.25s;}.kh-card:hover{border-color:#3b82f6;}</style>
      <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();">Back to Hub</button>
      <h5 style="font-weight:700;">Templates Library</h5>
      <div class="row g-3">
        ${[{t:'WhatsApp Message Template Pack',d:'25+ templates: welcome, follow-up, promotion.',cat:'Messaging',fmt:'PDF',i:'fa-message',c:'#4f46e5'},{t:'Campaign Planning Worksheet',d:'Segments, sequences, timeline.',cat:'Planning',fmt:'Sheets',i:'fa-calendar-check',c:'#059669'},{t:'Lead Qualification Scorecard',d:'Criteria, weights, auto-calculating.',cat:'Sales',fmt:'PDF+Sheets',i:'fa-clipboard-list',c:'#d97706'},{t:'Compliance Checklist',d:'15-point pre-send verification.',cat:'Compliance',fmt:'PDF',i:'fa-shield-alt',c:'#db2777'},{t:'Communication Calendar',d:'12-month planner.',cat:'Planning',fmt:'Sheets',i:'fa-table',c:'#7c3aed'},{t:'ROI Tracking Dashboard',d:'Auto-calculating spreadsheet.',cat:'Analytics',fmt:'Sheets',i:'fa-chart-simple',c:'#0369a1'}].map(t=>`<div class="col-md-6 col-lg-4"><div class="kh-card" onclick="Knowledge.showEmailPopup()"><div style="width:36px;height:36px;border-radius:8px;background:${t.c}15;color:${t.c};display:flex;align-items:center;justify-content:center;margin-bottom:8px;"><i class="fas ${t.i}"></i></div><h6>${t.t}</h6><p style="font-size:11px;color:#6b7280;">${t.d}</p><div class="d-flex gap-2 mt-2"><span class="badge bg-light text-dark">${t.cat}</span><span class="badge bg-light text-dark">${t.fmt}</span></div></div></div>`).join('')}
      </div>
    `;
  },

  // ==================== UTILITIES ====================
  showEmailPopup() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `<div style="background:#fff;border-radius:14px;padding:22px;width:380px;max-width:90vw;" onclick="event.stopPropagation()"><h5 style="font-weight:700;">Access Premium Resources</h5><p style="font-size:12px;color:#6b7280;">Free playbooks, templates, and weekly insights.</p><input id="keEmail" class="form-control form-control-sm mb-2" placeholder="Email *"><input id="keName" class="form-control form-control-sm mb-2" placeholder="Name"><button class="btn btn-primary btn-sm w-100" onclick="var e=document.getElementById('keEmail').value;if(!e)return alert('Enter email');db.collection('knowledge_subscribers').add({email:e,name:document.getElementById('keName').value,subscribedAt:firebase.firestore.FieldValue.serverTimestamp()});this.closest('[style*=fixed]').remove();alert('Subscribed!')">Subscribe</button></div>`;
    overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
    document.body.appendChild(overlay);
  }
};
