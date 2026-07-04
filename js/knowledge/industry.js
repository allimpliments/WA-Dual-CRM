(function(Knowledge, contentArea, db, firebase) {
  contentArea.innerHTML = `
    <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Hub</button>
    <h5 style="font-weight:700;">Industry Solutions</h5>
    <p class="text-muted small mb-3">Tailored WhatsApp strategies for specific industries.</p>
    <div class="row g-3">
      ${[
        {n:'Real Estate',i:'fa-home',s:'40% more qualified leads',d:'Virtual tours, instant inquiries, automated visit scheduling.',c:'#4f46e5'},
        {n:'Healthcare',i:'fa-hospital',s:'65% fewer no-shows',d:'Appointment reminders, prescriptions, teleconsultation.',c:'#059669'},
        {n:'Education',i:'fa-graduation-cap',s:'3x student engagement',d:'Admission inquiries, fee reminders, parent communication.',c:'#d97706'},
        {n:'E-commerce',i:'fa-shopping-cart',s:'25% cart recovery',d:'Order updates, abandoned cart, product recommendations.',c:'#db2777'},
        {n:'Financial Services',i:'fa-landmark',s:'50% faster processing',d:'Document collection, KYC, payment reminders.',c:'#7c3aed'}
      ].map(ind => `
        <div class="col-md-6 col-lg-4"><div class="ke-module-card" onclick="Knowledge.showEmailPopup()">
          <div style="width:40px;height:40px;border-radius:8px;background:${ind.c}15;color:${ind.c};display:flex;align-items:center;justify-content:center;margin-bottom:10px;"><i class="fas ${ind.i}"></i></div>
          <h6 style="font-weight:600;">${ind.n}</h6>
          <p style="color:${ind.c};font-weight:600;font-size:13px;">${ind.s}</p>
          <p style="font-size:11px;color:#6b7280;">${ind.d}</p>
        </div></div>
      `).join('')}
    </div>
    <style>.ke-module-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:18px;cursor:pointer;transition:0.25s;}.ke-module-card:hover{border-color:#3b82f6;box-shadow:0 8px 20px rgba(0,0,0,0.05);}</style>
  `;
}) 
