// js/knowledge/templates.js — Resource Templates Marketplace
(function(Knowledge, contentArea, db, firebase) {
  const templates = [
    { title:'WhatsApp Message Template Pack', desc:'25+ professionally crafted templates for welcome, follow-up, promotion, feedback, and re-engagement. Industry-specific variations included.', category:'Messaging', format:'PDF + Copy-Paste', downloads:'4.2K', rating:4.9, featured:true, icon:'fa-message', color:'#4f46e5' },
    { title:'Campaign Planning Worksheet', desc:'Comprehensive planning template with audience segments, message sequences, scheduling timeline, and performance tracking tabs.', category:'Planning', format:'Google Sheets', downloads:'2.8K', rating:4.7, icon:'fa-calendar-check', color:'#059669' },
    { title:'Lead Qualification Scorecard', desc:'Structured lead scoring framework. Define criteria, assign weights, auto-calculate quality scores for prioritization.', category:'Sales', format:'PDF + Sheets', downloads:'1.9K', rating:4.8, icon:'fa-clipboard-list', color:'#d97706' },
    { title:'WhatsApp Compliance Checklist', desc:'15-point pre-send compliance verification. Opt-in confirmation, template approval status, content guidelines check.', category:'Compliance', format:'PDF', downloads:'3.1K', rating:4.9, featured:true, icon:'fa-shield-alt', color:'#db2777' },
    { title:'Customer Communication Calendar', desc:'12-month planner with seasonal campaign slots, drip sequence scheduling, and content theme tracking.', category:'Planning', format:'Google Sheets', downloads:'1.5K', rating:4.6, icon:'fa-table', color:'#7c3aed' },
    { title:'ROI Tracking Dashboard', desc:'Pre-built spreadsheet with auto-calculating formulas. Track cost per lead, conversion rates, and revenue attribution.', category:'Analytics', format:'Google Sheets', downloads:'2.3K', rating:4.8, icon:'fa-chart-simple', color:'#0369a1' },
    { title:'Onboarding Flow Blueprint', desc:'10-step customer onboarding sequence with welcome messages, product tours, check-in prompts, and milestones.', category:'Customer Success', format:'PDF + Miro', downloads:'1.1K', rating:4.7, icon:'fa-diagram-project', color:'#0891b2' },
    { title:'A/B Testing Framework', desc:'Systematic testing template. Hypothesis documentation, variant tracking, significance calculator, results log.', category:'Optimization', format:'Google Sheets', downloads:'980', rating:4.5, icon:'fa-flask', color:'#be185d' }
  ];

  const categories = [...new Set(templates.map(t => t.category))];
  let activeCategory = 'All';
  const filtered = activeCategory === 'All' ? templates : templates.filter(t => t.category === activeCategory);

  contentArea.innerHTML = `
    <style>
      .tpl-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:20px;cursor:pointer;transition:0.25s;position:relative;height:100%;display:flex;flex-direction:column;}
      .tpl-card:hover{border-color:#3b82f6;box-shadow:0 8px 20px rgba(0,0,0,0.05);}
      .tpl-card.featured{border-color:#f59e0b;background:#fffdf7;}
      .tpl-icon{width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;margin-bottom:10px;}
      .cat-pill{display:inline-block;padding:6px 14px;border-radius:20px;font-size:12px;cursor:pointer;border:1px solid #e5e7eb;margin:2px;transition:0.2s;background:#fff;}
      .cat-pill:hover,.cat-pill.active{background:#3b82f6;color:#fff;border-color:#3b82f6;}
    </style>

    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
      <button onclick="Knowledge.currentSection='home';Knowledge.render();" style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:13px;"><i class="fas fa-arrow-left me-1"></i> Hub</button>
      <div><h5 style="font-weight:700;margin:0;">Templates Library</h5><small class="text-muted">Ready-to-use downloadable resources</small></div>
    </div>

    <div style="margin-bottom:16px;" id="tplCats">
      <span class="cat-pill active">All</span>
      ${categories.map(c => `<span class="cat-pill">${c}</span>`).join('')}
    </div>

    <div class="row g-3" id="tplGrid">
      ${filtered.map(t => `
        <div class="col-md-6 col-lg-4">
          <div class="tpl-card ${t.featured?'featured':''}" onclick="Knowledge.showEmailPopup()">
            ${t.featured?'<span style="position:absolute;top:10px;right:10px;background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:6px;font-size:9px;font-weight:600;">Popular</span>':''}
            <div>
              <div class="tpl-icon" style="background:${t.color}15;color:${t.color};"><i class="fas ${t.icon}"></i></div>
              <h6 style="font-weight:600;">${t.title}</h6>
              <p style="font-size:11px;color:#6b7280;">${t.desc.substring(0,80)}...</p>
              <div class="d-flex gap-2 mt-2 flex-wrap">
                <span class="badge bg-light text-dark">${t.category}</span>
                <span class="badge bg-light text-dark">${t.format}</span>
              </div>
            </div>
            <div class="mt-auto pt-3">
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted"><i class="fas fa-download me-1"></i>${t.downloads}</small>
                <small style="color:#f59e0b;">${'★'.repeat(Math.floor(t.rating))} ${t.rating}</small>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <div style="text-align:center;margin-top:20px;padding:18px;background:#f9fafb;border-radius:12px;">
      <p style="font-size:13px;color:#6b7280;margin-bottom:6px;">Need a custom template for your specific use case?</p>
      <button onclick="Knowledge.showEmailPopup()" style="background:#3b82f6;color:#fff;border:none;padding:8px 18px;border-radius:8px;cursor:pointer;font-weight:500;">Request Custom Template</button>
    </div>
  `;

  document.querySelectorAll('#tplCats .cat-pill').forEach(pill => {
    pill.addEventListener('click', function() {
      activeCategory = this.textContent.trim();
      document.querySelectorAll('#tplCats .cat-pill').forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      document.getElementById('tplGrid').innerHTML = (activeCategory==='All'?templates:templates.filter(t=>t.category===activeCategory)).map(t => `
        <div class="col-md-6 col-lg-4"><div class="tpl-card ${t.featured?'featured':''}" onclick="Knowledge.showEmailPopup()">${t.featured?'<span style="position:absolute;top:10px;right:10px;background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:6px;font-size:9px;font-weight:600;">Popular</span>':''}<div><div class="tpl-icon" style="background:${t.color}15;color:${t.color};"><i class="fas ${t.icon}"></i></div><h6 style="font-weight:600;">${t.title}</h6><p style="font-size:11px;color:#6b7280;">${t.desc.substring(0,80)}...</p><div class="d-flex gap-2 mt-2 flex-wrap"><span class="badge bg-light text-dark">${t.category}</span><span class="badge bg-light text-dark">${t.format}</span></div></div><div class="mt-auto pt-3"><div class="d-flex justify-content-between"><small class="text-muted"><i class="fas fa-download me-1"></i>${t.downloads}</small><small style="color:#f59e0b;">${'★'.repeat(Math.floor(t.rating))} ${t.rating}</small></div></div></div></div>
      `).join('');
    });
  });
})
