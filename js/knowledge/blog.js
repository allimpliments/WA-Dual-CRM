(function(Knowledge, contentArea, db, firebase) {
  contentArea.innerHTML = `
    <style>.blog-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;cursor:pointer;transition:0.25s;}.blog-card:hover{border-color:#3b82f6;box-shadow:0 8px 20px rgba(0,0,0,0.05);}.blog-img{height:100px;display:flex;align-items:center;justify-content:center;font-size:30px;}.blog-body{padding:14px;}</style>
    <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Hub</button>
    <h5 style="font-weight:700;">Strategic Blog</h5>
    <p class="text-muted small mb-3">Deep dives into WhatsApp strategy, marketing, and industry trends.</p>
    <div class="row g-3">
      ${[
        {t:'WhatsApp Business Revolution 2026',c:'Industry Trends',a:'11 Avatar Team',d:'8 min',i:'fa-newspaper',co:'#4f46e5'},
        {t:'Lead Generation That Works',c:'Lead Gen',a:'Marketing Team',d:'12 min',i:'fa-magnet',co:'#059669'},
        {t:'Automation Without Losing Human Touch',c:'Automation',a:'Product Team',d:'10 min',i:'fa-robot',co:'#d97706'},
        {t:'Real Estate Firm Doubled Conversions',c:'Case Study',a:'Success Team',d:'6 min',i:'fa-building',co:'#db2777'},
        {t:'Broadcast vs Group vs Community',c:'Strategy',a:'Strategy Team',d:'7 min',i:'fa-bullhorn',co:'#7c3aed'},
        {t:'Marketing Metrics That Matter',c:'Analytics',a:'Analytics Team',d:'9 min',i:'fa-chart-line',co:'#0369a1'}
      ].map(a => `
        <div class="col-md-6 col-lg-4"><div class="blog-card" onclick="Knowledge.showEmailPopup()">
          <div class="blog-img" style="background:${a.co}10;color:${a.co};"><i class="fas ${a.i}"></i></div>
          <div class="blog-body"><span class="badge bg-light text-dark mb-1">${a.c}</span><h6 style="font-weight:600;">${a.t}</h6><div class="d-flex justify-content-between small text-muted"><span>${a.a}</span><span>${a.d}</span></div></div>
        </div></div>
      `).join('')}
    </div>
  `;
}) 
