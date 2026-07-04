// js/knowledge/tools.js — Free Tools & Interactive Resources
(function(Knowledge, contentArea, db, firebase) {
  const tools = [
    { title:'WhatsApp ROI Calculator', desc:'Advanced revenue projection with cost analysis, conversion uplift modeling, and annualized return calculations.', icon:'fa-calculator', color:'#059669', action:"Knowledge.currentSection='roi';Knowledge.render();", badge:'Interactive' },
    { title:'Message Template Generator', desc:'Generate customized WhatsApp message templates by industry, purpose, and tone. Preview before download.', icon:'fa-magic', color:'#4f46e5', action:"Knowledge.showEmailPopup()", badge:'Generator' },
    { title:'Campaign Budget Planner', desc:'Plan your WhatsApp marketing budget. Calculate cost per message, projected reach, and expected conversions.', icon:'fa-coins', color:'#d97706', action:"Knowledge.showEmailPopup()", badge:'Calculator' },
    { title:'Response Time Analyzer', desc:'Benchmark your response times against industry standards. Get personalized improvement recommendations.', icon:'fa-stopwatch', color:'#db2777', action:"Knowledge.showEmailPopup()", badge:'Analyzer' },
    { title:'Template Compliance Checker', desc:'Check your message templates against WhatsApp Business policy before submission to avoid rejection.', icon:'fa-check-double', color:'#7c3aed', action:"Knowledge.showEmailPopup()", badge:'Checker' },
    { title:'Lead Quality Scoring Tool', desc:'Build custom lead scoring models. Assign weights to behaviors and demographics for prioritization.', icon:'fa-star-half-alt', color:'#0369a1', action:"Knowledge.showEmailPopup()", badge:'Scorer' },
    { title:'Industry Benchmarks Dashboard', desc:'Interactive dashboard comparing your metrics against industry averages for your vertical.', icon:'fa-chart-pie', color:'#0891b2', action:"Knowledge.showEmailPopup()", badge:'Dashboard' },
    { title:'Campaign Performance Grader', desc:'Grade your past campaigns across deliverability, engagement, conversion, and ROI dimensions.', icon:'fa-graduation-cap', color:'#be185d', action:"Knowledge.showEmailPopup()", badge:'Grader' }
  ];

  contentArea.innerHTML = `
    <style>
      .tool-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:20px;cursor:pointer;transition:0.25s;position:relative;}
      .tool-card:hover{transform:translateY(-2px);box-shadow:0 10px 25px rgba(0,0,0,0.06);border-color:#3b82f6;}
      .tool-badge{position:absolute;top:10px;right:10px;padding:2px 8px;border-radius:6px;font-size:9px;font-weight:600;}
    </style>

    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <button onclick="Knowledge.currentSection='home';Knowledge.render();" style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:13px;"><i class="fas fa-arrow-left me-1"></i> Hub</button>
      <div><h5 style="font-weight:700;margin:0;">Free Tools & Resources</h5><small class="text-muted">Practical interactive tools to optimize your operations</small></div>
    </div>

    <div class="row g-3">
      ${tools.map(t => `
        <div class="col-md-6 col-lg-4">
          <div class="tool-card" onclick="${t.action}">
            <span class="tool-badge" style="background:${t.color}15;color:${t.color};">${t.badge}</span>
            <div style="width:44px;height:44px;border-radius:10px;background:${t.color}15;color:${t.color};display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:10px;"><i class="fas ${t.icon}"></i></div>
            <h6 style="font-weight:600;">${t.title}</h6>
            <p style="font-size:12px;color:#6b7280;">${t.desc}</p>
            <small style="color:#3b82f6;font-weight:500;">Launch Tool →</small>
          </div>
        </div>
      `).join('')}
    </div>
  `;
})
