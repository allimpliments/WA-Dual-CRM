(function(Knowledge, contentArea, db, firebase) {
  contentArea.innerHTML = `
    <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Hub</button>
    <h5 style="font-weight:700;">Courses & Certifications</h5>
    <p class="text-muted small mb-3">Structured learning paths from foundation to mastery.</p>
    <div class="row g-3">
      ${[
        {t:'WhatsApp Marketing Foundation',l:'Free',m:8,d:'4 hours',desc:'Core concepts: ecosystem, profile optimization, broadcasts, templates, compliance.',c:'#059669',i:'fa-seedling'},
        {t:'Advanced WhatsApp Automation',l:'₹4,999',m:16,d:'12 hours',desc:'Chatbot architecture, API integration, webhooks, custom flows, analytics.',c:'#d97706',i:'fa-cogs'},
        {t:'Certified WhatsApp Expert',l:'₹49,999',m:24,d:'6 weeks',desc:'Live cohort. 1:1 mentorship. Real projects. Official certification badge.',c:'#7c3aed',i:'fa-award'}
      ].map(c => `
        <div class="col-md-4"><div class="ke-module-card" onclick="Knowledge.showEmailPopup()" style="display:flex;flex-direction:column;">
          <div><span class="badge bg-${c.l==='Free'?'success':'warning'} mb-2">${c.l}</span>
          <div style="width:36px;height:36px;border-radius:8px;background:${c.c}10;color:${c.c};display:flex;align-items:center;justify-content:center;margin-bottom:8px;"><i class="fas ${c.i}"></i></div>
          <h6 style="font-weight:600;">${c.t}</h6>
          <p style="font-size:11px;color:#6b7280;">${c.desc}</p></div>
          <div class="mt-auto"><div class="d-flex justify-content-between small text-muted mb-2"><span>${c.m} modules</span><span>${c.d}</span></div>
          <button class="btn btn-${c.l==='Free'?'outline-primary':'warning'} btn-sm w-100">${c.l==='Free'?'Enroll Free':'Get Started'}</button></div>
        </div></div>
      `).join('')}
    </div>
    <style>.ke-module-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:18px;cursor:pointer;transition:0.25s;height:100%;}.ke-module-card:hover{border-color:#3b82f6;box-shadow:0 8px 20px rgba(0,0,0,0.05);}</style>
  `;
}) 
