// js/knowledge/templates.js — Downloadable Templates & Resources Module
function(Knowledge, contentArea, db, firebase) {
  const templates = [
    {
      title: 'WhatsApp Message Template Pack',
      category: 'Messaging',
      count: '25+ templates',
      format: 'PDF + Copy-Paste',
      description: 'Professionally crafted message templates for welcome, follow-up, promotion, feedback, and more. Industry-specific variations included.',
      icon: 'fa-message',
      color: '#4f46e5',
      featured: true
    },
    {
      title: 'Campaign Planning Worksheet',
      category: 'Planning',
      count: 'Editable',
      format: 'Google Sheets',
      description: 'Comprehensive campaign planning template with audience segments, message sequences, scheduling timeline, and performance tracking tabs.',
      icon: 'fa-calendar-check',
      color: '#059669'
    },
    {
      title: 'Lead Qualification Scorecard',
      category: 'Sales',
      count: 'Printable',
      format: 'PDF + Sheets',
      description: 'Structured lead scoring framework. Define criteria, assign weights, and automatically calculate lead quality scores for prioritization.',
      icon: 'fa-clipboard-list',
      color: '#d97706'
    },
    {
      title: 'WhatsApp Policy Compliance Checklist',
      category: 'Compliance',
      count: '15-point list',
      format: 'PDF',
      description: 'Stay compliant with WhatsApp Business policies. Pre-send checklist covering opt-in verification, template approval, and content guidelines.',
      icon: 'fa-shield-alt',
      color: '#db2777'
    },
    {
      title: 'Customer Communication Calendar',
      category: 'Planning',
      count: '12-month',
      format: 'Google Sheets',
      description: 'Annual communication calendar template. Plan campaigns, drip sequences, and seasonal promotions with a structured timeline view.',
      icon: 'fa-table',
      color: '#7c3aed'
    },
    {
      title: 'ROI Tracking Dashboard',
      category: 'Analytics',
      count: 'Auto-calculating',
      format: 'Google Sheets',
      description: 'Pre-built ROI tracking spreadsheet. Input your campaign data and automatically calculate cost per lead, conversion rates, and revenue attribution.',
      icon: 'fa-chart-simple',
      color: '#0369a1'
    },
    {
      title: 'Onboarding Flow Blueprint',
      category: 'Customer Success',
      count: '10-step flow',
      format: 'PDF + Miro',
      description: 'Complete customer onboarding sequence template. Welcome messages, product tours, check-in prompts, and feedback collection milestones.',
      icon: 'fa-diagram-project',
      color: '#0891b2'
    },
    {
      title: 'A/B Testing Framework',
      category: 'Optimization',
      count: 'Structured',
      format: 'Google Sheets',
      description: 'Systematic A/B testing template. Hypothesis documentation, variant tracking, statistical significance calculator, and results documentation.',
      icon: 'fa-flask',
      color: '#be185d'
    }
  ];

  const categories = [...new Set(templates.map(t => t.category))];
  let activeCategory = 'All';
  const filtered = activeCategory === 'All' ? templates : templates.filter(t => t.category === activeCategory);

  function render() {
    contentArea.innerHTML = `
      <style>
        .tpl-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:20px;transition:0.25s;cursor:pointer;position:relative;height:100%;}
        .tpl-card:hover{border-color:#3b82f6;box-shadow:0 8px 20px rgba(0,0,0,0.05);}
        .tpl-card.featured{border-color:#f59e0b;background:#fffdf7;}
        .tpl-icon{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:10px;}
        .tpl-badge{position:absolute;top:12px;right:12px;padding:2px 8px;border-radius:6px;font-size:9px;font-weight:600;}
        .tpl-meta{display:flex;gap:10px;flex-wrap:wrap;font-size:10px;color:#9ca3af;}
        .tpl-meta span{background:#f3f4f6;padding:2px 8px;border-radius:4px;}
        .cat-pill{display:inline-block;padding:6px 14px;border-radius:20px;font-size:12px;cursor:pointer;border:1px solid #e5e7eb;margin:2px;transition:0.2s;background:#fff;}
        .cat-pill:hover,.cat-pill.active{background:#3b82f6;color:#fff;border-color:#3b82f6;}
      </style>

      <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Hub</button>
      <h5 style="font-weight:700;">Resource Templates Library</h5>
      <p class="text-muted small mb-3">Ready-to-use templates for campaigns, planning, analytics, and compliance.</p>

      <div class="mb-3">
        <span class="cat-pill active" onclick="document.querySelectorAll('.cat-pill').forEach(el=>el.classList.remove('active'));event.target.classList.add('active');">All</span>
        ${categories.map(c => `<span class="cat-pill" onclick="document.querySelectorAll('.cat-pill').forEach(el=>el.classList.remove('active'));event.target.classList.add('active');">${c}</span>`).join('')}
      </div>

      <div class="row g-3">
        ${filtered.map(t => `
          <div class="col-md-6 col-lg-4">
            <div class="tpl-card ${t.featured?'featured':''}" onclick="Knowledge.showEmailPopup()">
              ${t.featured ? '<span class="tpl-badge" style="background:#fef3c7;color:#92400e;">Popular</span>' : ''}
              <div class="tpl-icon" style="background:${t.color}15;color:${t.color};"><i class="fas ${t.icon}"></i></div>
              <h6 style="font-weight:600;">${t.title}</h6>
              <p style="font-size:12px;color:#6b7280;">${t.description.substring(0,80)}...</p>
              <div class="tpl-meta">
                <span><i class="fas fa-layer-group me-1"></i>${t.count}</span>
                <span><i class="fas fa-file me-1"></i>${t.format}</span>
              </div>
              <small style="color:#3b82f6;font-weight:500;display:block;margin-top:8px;">Download →</small>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="text-center mt-4 py-3" style="background:#f9fafb;border-radius:12px;">
        <p class="text-muted small mb-2">New templates added regularly. Have a specific need?</p>
        <button class="btn btn-outline-primary btn-sm" onclick="Knowledge.showEmailPopup()">Request Custom Template</button>
      </div>
    `;
  }

  render();
} 
