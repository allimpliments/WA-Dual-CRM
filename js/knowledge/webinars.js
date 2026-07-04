// js/knowledge/webinars.js — Live & Recorded Webinars Module
function(Knowledge, contentArea, db, firebase) {
  const upcoming = [
    {
      title: 'WhatsApp Marketing Masterclass 2026',
      date: 'July 15, 2026',
      time: '4:00 PM IST',
      duration: '90 min',
      speaker: 'Digital Strategy Lead',
      seats: 'Limited',
      description: 'Comprehensive session covering the latest WhatsApp Business features, advanced automation techniques, and real-world case studies from top-performing businesses.',
      icon: 'fa-video',
      color: '#4f46e5'
    },
    {
      title: 'Lead Generation Workshop: Build Your Funnel',
      date: 'July 22, 2026',
      time: '3:00 PM IST',
      duration: '60 min',
      speaker: 'Growth Team',
      seats: 'Open',
      description: 'Hands-on workshop where you will build a complete lead generation funnel using WhatsApp widgets, forms, and automation sequences.',
      icon: 'fa-laptop-code',
      color: '#059669'
    }
  ];

  const recorded = [
    { title:'Getting Started with WhatsApp Business API', views:'1.2K', duration:'45 min', date:'June 2026', icon:'fa-play-circle', color:'#d97706' },
    { title:'Advanced Chatbot Design Patterns', views:'890', duration:'55 min', date:'May 2026', icon:'fa-brain', color:'#db2777' },
    { title:'Campaign Analytics Deep Dive', views:'650', duration:'40 min', date:'April 2026', icon:'fa-chart-pie', color:'#7c3aed' },
    { title:'Customer Retention Strategies Workshop', views:'720', duration:'50 min', date:'March 2026', icon:'fa-heart', color:'#0369a1' }
  ];

  contentArea.innerHTML = `
    <style>
      .webinar-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:20px;transition:0.25s;cursor:pointer;}
      .webinar-card:hover{border-color:#3b82f6;box-shadow:0 8px 20px rgba(0,0,0,0.05);}
      .webinar-icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;}
      .recording-card{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:14px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:0.2s;}
      .recording-card:hover{border-color:#3b82f6;}
    </style>

    <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Hub</button>
    <h5 style="font-weight:700;">Expert Webinars</h5>
    <p class="text-muted small mb-3">Live sessions and recorded content from industry practitioners.</p>

    <h6 style="font-weight:600;" class="mb-3"><i class="fas fa-calendar-alt text-primary me-2"></i>Upcoming Live Sessions</h6>
    <div class="row g-3 mb-4">
      ${upcoming.map(w => `
        <div class="col-md-6">
          <div class="webinar-card" onclick="Knowledge.showEmailPopup()">
            <div class="d-flex gap-3">
              <div class="webinar-icon" style="background:${w.color}15;color:${w.color};"><i class="fas ${w.icon}"></i></div>
              <div class="flex-grow-1">
                <h6 style="font-weight:600;">${w.title}</h6>
                <div class="d-flex flex-wrap gap-3 small text-muted mb-2">
                  <span><i class="far fa-calendar me-1"></i>${w.date}</span>
                  <span><i class="far fa-clock me-1"></i>${w.time} · ${w.duration}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="badge bg-success">${w.seats} Seats</span>
                  <small style="color:#3b82f6;font-weight:500;">Register →</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <h6 style="font-weight:600;" class="mb-3"><i class="fas fa-play text-success me-2"></i>Recorded Sessions</h6>
    <div class="row g-2">
      ${recorded.map(r => `
        <div class="col-md-6">
          <div class="recording-card" onclick="Knowledge.showEmailPopup()">
            <div style="width:36px;height:36px;border-radius:50%;background:${r.color}15;color:${r.color};display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;"><i class="fas ${r.icon}"></i></div>
            <div class="flex-grow-1">
              <strong style="font-size:13px;">${r.title}</strong>
              <div class="small text-muted">${r.duration} · ${r.views} views · ${r.date}</div>
            </div>
            <i class="fas fa-chevron-right text-muted"></i>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="text-center mt-4">
      <button class="btn btn-primary btn-sm" onclick="Knowledge.showEmailPopup()"><i class="fas fa-bell me-1"></i> Get Notified About New Webinars</button>
    </div>
  `;
} 
