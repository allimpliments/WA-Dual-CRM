// js/knowledge/webinars.js — Live & Recorded Webinar Library
(function(Knowledge, contentArea, db, firebase) {
  const upcoming = [
    { title:'WhatsApp Marketing Masterclass 2026', type:'Masterclass', date:'July 15, 2026', time:'4:00 PM IST', duration:'90 min', speaker:'Digital Strategy Lead, 11 Avatar', seats:'Limited (47 remaining)', icon:'fa-video', color:'#4f46e5', topics:['2026 Trends','Campaign Strategy','Live Q&A','Case Studies'] },
    { title:'Lead Generation Workshop: Build Your Funnel', type:'Hands-on Workshop', date:'July 22, 2026', time:'3:00 PM IST', duration:'60 min', speaker:'Growth Team, 11 Avatar', seats:'Open', icon:'fa-laptop-code', color:'#059669', topics:['Funnel Design','Widget Setup','Form Optimization','Live Build'] },
    { title:'Community AMA: Ask the Product Team', type:'Q&A Session', date:'July 28, 2026', time:'5:00 PM IST', duration:'45 min', speaker:'Product & Engineering Team', seats:'Unlimited', icon:'fa-microphone', color:'#d97706', topics:['Product Roadmap','Feature Requests','Technical Q&A','Feedback'] }
  ];

  const recorded = [
    { title:'Getting Started with WhatsApp Business API', category:'Beginner', views:'1.2K', duration:'45 min', date:'June 2026', rating:4.8, icon:'fa-play-circle', color:'#d97706' },
    { title:'Advanced Chatbot Design Patterns', category:'Advanced', views:'890', duration:'55 min', date:'May 2026', rating:4.9, icon:'fa-brain', color:'#db2777' },
    { title:'Campaign Analytics Deep Dive', category:'Intermediate', views:'650', duration:'40 min', date:'April 2026', rating:4.7, icon:'fa-chart-pie', color:'#7c3aed' },
    { title:'Customer Retention Strategies Workshop', category:'Intermediate', views:'720', duration:'50 min', date:'March 2026', rating:4.6, icon:'fa-heart', color:'#0369a1' },
    { title:'WhatsApp Compliance & Policy Update Q2', category:'Essential', views:'1.5K', duration:'30 min', date:'March 2026', rating:4.9, icon:'fa-shield-alt', color:'#0891b2' },
    { title:'Building Your First Drip Campaign', category:'Beginner', views:'950', duration:'35 min', date:'February 2026', rating:4.7, icon:'fa-clock', color:'#be185d' }
  ];

  contentArea.innerHTML = `
    <style>
      .wb-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:18px;cursor:pointer;transition:0.25s;}
      .wb-card:hover{border-color:#3b82f6;box-shadow:0 8px 20px rgba(0,0,0,0.05);}
      .wb-recording{display:flex;align-items:center;gap:12px;padding:12px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;cursor:pointer;transition:0.2s;margin-bottom:6px;}
      .wb-recording:hover{border-color:#3b82f6;}
    </style>

    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <button onclick="Knowledge.currentSection='home';Knowledge.render();" style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:13px;"><i class="fas fa-arrow-left me-1"></i> Hub</button>
      <div><h5 style="font-weight:700;margin:0;">Expert Webinars</h5><small class="text-muted">Live sessions and recorded content from practitioners</small></div>
    </div>

    <h6 style="font-weight:600;margin-bottom:12px;"><i class="fas fa-calendar-alt text-primary me-1"></i>Upcoming Live Sessions</h6>
    <div class="row g-3 mb-4">
      ${upcoming.map(w => `
        <div class="col-lg-4">
          <div class="wb-card" onclick="Knowledge.showEmailPopup()">
            <div class="d-flex gap-3 mb-3">
              <div style="width:44px;height:44px;border-radius:10px;background:${w.color}15;color:${w.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fas ${w.icon}"></i></div>
              <div>
                <h6 style="font-weight:600;">${w.title}</h6>
                <span class="badge bg-light text-dark">${w.type}</span>
              </div>
            </div>
            <div class="small text-muted"><i class="far fa-calendar me-1"></i>${w.date}</div>
            <div class="small text-muted"><i class="far fa-clock me-1"></i>${w.time} · ${w.duration}</div>
            <div class="small text-muted"><i class="fas fa-user me-1"></i>${w.speaker}</div>
            <div class="mt-2">${w.topics.map(t=>`<span class="badge bg-light text-dark me-1" style="font-size:9px;">${t}</span>`).join('')}</div>
            <span class="badge bg-${w.seats.includes('Limited')?'danger':'success'} mt-2">${w.seats}</span>
          </div>
        </div>
      `).join('')}
    </div>

    <h6 style="font-weight:600;margin-bottom:12px;"><i class="fas fa-play-circle text-success me-1"></i>Recorded Library</h6>
    <div class="row g-2">
      ${recorded.map(r => `
        <div class="col-md-6">
          <div class="wb-recording" onclick="Knowledge.showEmailPopup()">
            <i class="fas ${r.icon}" style="color:${r.color};font-size:20px;"></i>
            <div class="flex-grow-1">
              <strong style="font-size:13px;">${r.title}</strong>
              <div class="small text-muted">${r.duration} · ${r.views} views · ${r.date}</div>
            </div>
            <span class="badge bg-light text-dark">${r.category}</span>
            <small style="color:#f59e0b;">★ ${r.rating}</small>
          </div>
        </div>
      `).join('')}
    </div>

    <div style="text-align:center;margin-top:20px;">
      <button onclick="Knowledge.showEmailPopup()" style="background:#3b82f6;color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:500;"><i class="fas fa-bell me-1"></i> Get Notified About New Webinars</button>
    </div>
  `;
})
