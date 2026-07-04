(function(Knowledge, contentArea, db, firebase) {
  contentArea.innerHTML = `
    <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Hub</button>
    <h5 style="font-weight:700;">Free Tools & Resources</h5>
    <p class="text-muted small mb-3">Practical tools to optimize your WhatsApp marketing operations.</p>
    <div class="row g-3">
      ${[
        {t:'WhatsApp ROI Calculator',d:'Project revenue impact based on your metrics.',i:'fa-calculator',c:'#059669',a:"Knowledge.currentSection='roi';Knowledge.render();"},
        {t:'Message Template Library',d:'50+ professionally crafted templates.',i:'fa-copy',c:'#4f46e5',a:"Knowledge.showEmailPopup()"},
        {t:'Campaign Launch Checklist',d:'Pre-launch checklist for every campaign.',i:'fa-clipboard-check',c:'#d97706',a:"Knowledge.showEmailPopup()"},
        {t:'Industry Benchmarks 2026',d:'Real data: open rates, reply times, conversions.',i:'fa-chart-simple',c:'#db2777',a:"Knowledge.showEmailPopup()"},
        {t:'Response Time Calculator',d:'Measure and optimize team response time.',i:'fa-stopwatch',c:'#7c3aed',a:"Knowledge.showEmailPopup()"},
        {t:'Campaign Budget Planner',d:'Calculate cost per message and projected ROI.',i:'fa-coins',c:'#0369a1',a:"Knowledge.showEmailPopup()"}
      ].map(t => `
        <div class="col-md-6 col-lg-4"><div class="ke-module-card" onclick="${t.a}">
          <div style="width:36px;height:36px;border-radius:8px;background:${t.c}15;color:${t.c};display:flex;align-items:center;justify-content:center;margin-bottom:8px;"><i class="fas ${t.i}"></i></div>
          <h6 style="font-weight:600;">${t.t}</h6><p style="font-size:11px;color:#6b7280;">${t.d}</p>
        </div></div>
      `).join('')}
    </div>
    <style>.ke-module-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:18px;cursor:pointer;transition:0.25s;}.ke-module-card:hover{border-color:#3b82f6;box-shadow:0 8px 20px rgba(0,0,0,0.05);}</style>
  `;
})
