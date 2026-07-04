// js/knowledge/industry.js — Industry Solutions Module
function(Knowledge, contentArea, db, firebase) {
  const industries = [
    { name:'Real Estate', icon:'fa-home', stats:'40% increase in qualified leads', desc:'Virtual property tours via WhatsApp, instant inquiry responses, automated site visit scheduling, and document sharing workflows.', color:'#4f46e5' },
    { name:'Healthcare', icon:'fa-hospital', stats:'65% reduction in no-shows', desc:'Automated appointment reminders, prescription refill notifications, teleconsultation booking links, and post-visit follow-up surveys.', color:'#059669' },
    { name:'Education', icon:'fa-graduation-cap', stats:'3x student engagement rate', desc:'Admission inquiry management, fee payment reminders via WhatsApp, exam schedule notifications, and parent-teacher communication channels.', color:'#d97706' },
    { name:'E-commerce', icon:'fa-shopping-cart', stats:'25% abandoned cart recovery', desc:'Order confirmation with tracking, personalized product recommendations, flash sale alerts, and post-purchase review collection.', color:'#db2777' },
    { name:'Financial Services', icon:'fa-landmark', stats:'50% faster loan processing', desc:'Secure document collection via WhatsApp, application status tracking, payment reminder automation, and KYC verification workflows.', color:'#7c3aed' }
  ];

  contentArea.innerHTML = `
    <style>
      .ind-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:24px;transition:0.25s;cursor:pointer;}
      .ind-card:hover{border-color:#3b82f6;box-shadow:0 10px 25px rgba(0,0,0,0.06);}
      .ind-stat{font-weight:700;font-size:14px;}
    </style>
    <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Hub</button>
    <h5 style="font-weight:700;">Industry Solutions</h5>
    <p class="text-muted small mb-3">Tailored WhatsApp communication strategies for specific industries.</p>
    <div class="row g-3">
      ${industries.map(ind => `
        <div class="col-md-6 col-lg-4">
          <div class="ind-card" onclick="Knowledge.showEmailPopup()">
            <div style="width:44px;height:44px;border-radius:10px;background:${ind.color}15;color:${ind.color};display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:12px;"><i class="fas ${ind.icon}"></i></div>
            <h6 style="font-weight:600;">${ind.name}</h6>
            <p class="ind-stat" style="color:${ind.color};">${ind.stats}</p>
            <p style="color:#6b7280;font-size:12px;">${ind.desc}</p>
            <small style="color:#3b82f6;font-weight:500;">View Solution →</small>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
