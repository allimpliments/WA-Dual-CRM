(function(Knowledge, contentArea, db, firebase) {
  contentArea.innerHTML = `
    <style>
      .pl-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:18px;cursor:pointer;transition:0.25s;}
      .pl-card:hover{border-color:#3b82f6;box-shadow:0 8px 20px rgba(0,0,0,0.05);}
    </style>
    <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Hub</button>
    <h5 style="font-weight:700;">Business Growth Playbooks</h5>
    <p class="text-muted small mb-3">Strategic frameworks for every stage of business growth.</p>
    <div class="row g-3">
      ${[
        {t:'WhatsApp Marketing Mastery',d:'Complete framework from setup to scaling. Templates, automation flows, campaign strategies.',l:'Beginner',time:'35 min'},
        {t:'Lead Generation Blueprint',d:'Multi-channel capture system. Widgets, landing pages, social integration, ad campaigns.',l:'Intermediate',time:'45 min'},
        {t:'Sales Automation Architecture',d:'Intelligent flows, chatbots, drip sequences, lead scoring, CRM integration.',l:'Advanced',time:'60 min'},
        {t:'Customer Retention Systems',d:'Loyalty programs, re-engagement campaigns, NPS surveys, churn prevention.',l:'Intermediate',time:'30 min'},
        {t:'Scaling 0 to 1000 Customers',d:'Infrastructure, team structure, tool stack, maintaining quality at scale.',l:'Advanced',time:'75 min'}
      ].map(p => `
        <div class="col-md-6 col-lg-4"><div class="pl-card" onclick="Knowledge.showEmailPopup()">
          <span class="badge bg-${p.l==='Beginner'?'success':p.l==='Intermediate'?'warning':'danger'} mb-2">${p.l}</span>
          <h6 style="font-weight:600;">${p.t}</h6>
          <p style="font-size:12px;color:#6b7280;">${p.d}</p>
          <small class="text-muted"><i class="far fa-clock me-1"></i>${p.time}</small>
        </div></div>
      `).join('')}
    </div>
    <div class="text-center mt-4"><button class="btn btn-outline-primary btn-sm" onclick="Knowledge.showEmailPopup()">Request Custom Playbook</button></div>
  `;
})
