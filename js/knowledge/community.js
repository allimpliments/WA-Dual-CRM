// js/knowledge/community.js — Expert Community Hub
(function(Knowledge, contentArea, db, firebase) {
  const discussions = [
    { title: 'Best practices for WhatsApp broadcast frequency?', author: 'Priya M.', replies: 34, views: '1.2K', time: '2 hours ago', category: 'Strategy', solved: true },
    { title: 'How to handle opt-in compliance for existing customers?', author: 'Rajesh K.', replies: 28, views: '980', time: '5 hours ago', category: 'Compliance', solved: true },
    { title: 'WhatsApp chatbot vs human agent — when to switch?', author: 'Anita S.', replies: 42, views: '1.5K', time: '1 day ago', category: 'Automation', solved: false },
    { title: 'Template rejected by Meta — common reasons?', author: 'Vikram P.', replies: 19, views: '750', time: '2 days ago', category: 'Troubleshooting', solved: true },
    { title: 'ROI calculation for WhatsApp campaigns — your approach?', author: 'Deepak R.', replies: 15, views: '620', time: '3 days ago', category: 'Analytics', solved: false }
  ];

  const events = [
    { title: 'WhatsApp Strategy Masterclass Q3 2026', type: 'Live Webinar', date: 'July 15, 2026', time: '4:00 PM IST', seats: 'Limited', icon: 'fa-video', color: '#4f46e5' },
    { title: 'Building Advanced Chatbot Flows', type: 'Workshop', date: 'July 22, 2026', time: '3:00 PM IST', seats: 'Open', icon: 'fa-laptop-code', color: '#059669' },
    { title: 'Community AMA with Product Team', type: 'Q&A Session', date: 'July 28, 2026', time: '5:00 PM IST', seats: 'Unlimited', icon: 'fa-microphone', color: '#d97706' }
  ];

  const stories = [
    { company: 'GreenLeaf Realty', industry: 'Real Estate', result: '3x lead conversion in 60 days', quote: 'WhatsApp automation transformed how we handle property inquiries. Response time dropped from hours to seconds.', icon: 'fa-home', color: '#4f46e5' },
    { company: 'MediCare Plus', industry: 'Healthcare', result: '65% reduction in no-shows', quote: 'Automated appointment reminders via WhatsApp saved our practice thousands in lost revenue.', icon: 'fa-hospital', color: '#059669' },
    { company: 'EduFirst Academy', industry: 'Education', result: '2x student enrollment', quote: 'Our WhatsApp admission bot handles 80% of initial inquiries, freeing our counselors for high-value conversations.', icon: 'fa-graduation-cap', color: '#d97706' }
  ];

  contentArea.innerHTML = `
    <style>
      .cm-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:20px;transition:0.25s;}
      .cm-card:hover{border-color:#3b82f6;box-shadow:0 8px 20px rgba(0,0,0,0.05);}
      .cm-event{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;cursor:pointer;transition:0.25s;}
      .cm-event:hover{border-color:#3b82f6;box-shadow:0 6px 16px rgba(0,0,0,0.05);}
      .cm-story{background:#fff;border-left:4px solid var(--sc);border-radius:0 12px 12px 0;padding:18px;margin-bottom:10px;}
      .cm-stat{text-align:center;padding:16px;background:#f9fafb;border-radius:10px;}
      .cm-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:14px;flex-shrink:0;}
    </style>

    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <button onclick="Knowledge.currentSection='home';Knowledge.render();" style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:13px;"><i class="fas fa-arrow-left me-1"></i> Hub</button>
      <div><h5 style="font-weight:700;margin:0;">Expert Community</h5><small class="text-muted">Connect, learn, and grow with industry peers</small></div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-4"><div class="cm-stat"><h4 style="color:#4f46e5;">2,400+</h4><small class="text-muted">Members</small></div></div>
      <div class="col-4"><div class="cm-stat"><h4 style="color:#059669;">850+</h4><small class="text-muted">Discussions</small></div></div>
      <div class="col-4"><div class="cm-stat"><h4 style="color:#d97706;">50+</h4><small class="text-muted">Events</small></div></div>
    </div>

    <div class="row g-3">
      <div class="col-lg-7">
        <h6 style="font-weight:600;margin-bottom:12px;"><i class="fas fa-comments text-primary me-1"></i>Active Discussions</h6>
        ${discussions.map(d => `
          <div class="cm-card mb-2" onclick="Knowledge.showEmailPopup()" style="cursor:pointer;">
            <div class="d-flex justify-content-between align-items-start">
              <div class="d-flex gap-2 flex-grow-1">
                <div class="cm-avatar" style="background:#6366f1;">${d.author[0]}</div>
                <div>
                  <strong style="font-size:13px;">${d.title}</strong> ${d.solved?'<span class="badge bg-success" style="font-size:9px;">Solved</span>':''}
                  <div class="small text-muted mt-1">${d.author} · ${d.replies} replies · ${d.views} views · ${d.time}</div>
                </div>
              </div>
              <span class="badge bg-light text-dark">${d.category}</span>
            </div>
          </div>
        `).join('')}
        <button onclick="Knowledge.showEmailPopup()" style="width:100%;padding:10px;border:2px dashed #d1d5db;border-radius:10px;background:transparent;cursor:pointer;color:#6b7280;font-weight:500;margin-top:8px;">+ Start New Discussion</button>
      </div>

      <div class="col-lg-5">
        <h6 style="font-weight:600;margin-bottom:12px;"><i class="fas fa-calendar-alt text-warning me-1"></i>Upcoming Events</h6>
        ${events.map(e => `
          <div class="cm-event mb-2" onclick="Knowledge.showEmailPopup()">
            <div class="d-flex gap-3">
              <div style="width:44px;height:44px;border-radius:10px;background:${e.color}15;color:${e.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fas ${e.icon}"></i></div>
              <div class="flex-grow-1">
                <strong style="font-size:13px;">${e.title}</strong>
                <div class="small text-muted">${e.date} · ${e.time}</div>
                <span class="badge bg-${e.seats==='Limited'?'danger':'success'} mt-1" style="font-size:9px;">${e.seats} Seats</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <h6 style="font-weight:600;margin:20px 0 12px;"><i class="fas fa-trophy text-warning me-1"></i>Transformation Stories</h6>
    <div class="row g-3">
      ${stories.map(s => `
        <div class="col-md-4">
          <div class="cm-story" style="--sc:${s.color};">
            <div style="width:36px;height:36px;border-radius:8px;background:${s.color}15;color:${s.color};display:flex;align-items:center;justify-content:center;margin-bottom:8px;"><i class="fas ${s.icon}"></i></div>
            <strong>${s.company}</strong><br><small class="text-muted">${s.industry}</small>
            <p style="color:${s.color};font-weight:600;font-size:13px;margin:8px 0;">${s.result}</p>
            <p style="font-size:11px;color:#6b7280;font-style:italic;">"${s.quote}"</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;
})
