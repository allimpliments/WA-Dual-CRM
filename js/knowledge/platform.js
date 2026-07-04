(function(Knowledge, contentArea, db, firebase) {
  contentArea.innerHTML = `
    <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Hub</button>
    <h5 style="font-weight:700;">Platform Mastery</h5>
    <p class="text-muted small mb-3">Technical guides for mastering the 11 Avatar CRM ecosystem.</p>
    <div class="row g-3">
      ${[
        {t:'11 Avatar CRM Complete Guide',d:'End-to-end walkthrough of every module. Dashboard, leads, campaigns, chatbot, forms, social.',s:12,icon:'fa-cube',color:'#4f46e5'},
        {t:'WhatsApp Business API Setup',d:'Meta verification, phone registration, webhook configuration, template submission.',s:8,icon:'fa-plug',color:'#059669'},
        {t:'Chatbot Architecture',d:'Intent mapping, fallback strategies, multi-turn dialogue, performance optimization.',s:10,icon:'fa-brain',color:'#d97706'},
        {t:'Campaign Optimization',d:'A/B testing, audience segmentation, send time optimization, analytics.',s:6,icon:'fa-chart-bar',color:'#db2777'}
      ].map(g => `
        <div class="col-md-6"><div class="ke-module-card" onclick="Knowledge.showEmailPopup()" style="display:flex;gap:14px;align-items:start;">
          <div style="width:40px;height:40px;border-radius:8px;background:${g.color}15;color:${g.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fas ${g.icon}"></i></div>
          <div><h6 style="font-weight:600;">${g.t}</h6><p style="font-size:11px;color:#6b7280;">${g.d}</p><small class="text-muted">${g.s} sections</small></div>
        </div></div>
      `).join('')}
    </div>
    <style>.ke-module-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:18px;cursor:pointer;transition:0.25s;}.ke-module-card:hover{border-color:#3b82f6;box-shadow:0 8px 20px rgba(0,0,0,0.05);}</style>
  `;
}) 
