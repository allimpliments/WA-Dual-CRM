// js/knowledge/tools.js — Free Tools & Resources Module
function(Knowledge, contentArea, db, firebase) {
  const tools = [
    { title:'WhatsApp ROI Calculator', desc:'Project revenue impact based on your lead volume, conversion rate, and average deal value.', icon:'fa-calculator', color:'#059669', action: "Knowledge.currentSection='roi';Knowledge.render();" },
    { title:'Message Template Library', desc:'50+ professionally crafted message templates across industries and use cases.', icon:'fa-copy', color:'#4f46e5', action: "Knowledge.showEmailPopup()" },
    { title:'Campaign Launch Checklist', desc:'Comprehensive pre-launch checklist. Never miss a critical step in your campaign setup.', icon:'fa-clipboard-check', color:'#d97706', action: "Knowledge.showEmailPopup()" },
    { title:'Industry Benchmarks 2026', desc:'Real performance data: open rates, response times, conversion benchmarks by industry.', icon:'fa-chart-simple', color:'#db2777', action: "Knowledge.showEmailPopup()" },
    { title:'Response Time Calculator', desc:'Measure and optimize your team response time. Set targets and track improvements.', icon:'fa-stopwatch', color:'#7c3aed', action: "Knowledge.showEmailPopup()" },
    { title:'Campaign Budget Planner', desc:'Optimize your WhatsApp marketing spend. Calculate cost per message and projected ROI.', icon:'fa-coins', color:'#0369a1', action: "Knowledge.showEmailPopup()" }
  ];

  contentArea.innerHTML = `
    <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Hub</button>
    <h5 style="font-weight:700;">Free Tools & Resources</h5>
    <p class="text-muted small mb-3">Practical tools to optimize your WhatsApp marketing operations.</p>
    <div class="row g-3">
      ${tools.map(t => `
        <div class="col-md-6 col-lg-4">
          <div class="ke-module-card" onclick="${t.action}" style="height:100%;">
            <div style="width:40px;height:40px;border-radius:8px;background:${t.color}15;color:${t.color};display:flex;align-items:center;justify-content:center;font-size:16px;margin-bottom:10px;"><i class="fas ${t.icon}"></i></div>
            <h6 style="font-weight:600;">${t.title}</h6>
            <p style="font-size:12px;color:#6b7280;">${t.desc}</p>
          </div>
        </div>
      `).join('')}
    </div>
    <style>.ke-module-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;cursor:pointer;transition:0.25s;}.ke-module-card:hover{border-color:#3b82f6;box-shadow:0 8px 20px rgba(0,0,0,0.05);transform:translateY(-2px);}</style>
  `;
}
