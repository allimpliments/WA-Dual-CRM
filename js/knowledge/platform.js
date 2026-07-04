// js/knowledge/platform.js — Platform Mastery Module
function(Knowledge, contentArea, db, firebase) {
  const guides = [
    {
      title: '11 Avatar CRM — Complete System Guide',
      description: 'End-to-end walkthrough of every module. Dashboard analytics, lead pipeline management, campaign orchestration, chatbot configuration, and social media integration.',
      sections: 12,
      icon: 'fa-cube',
      color: '#4f46e5'
    },
    {
      title: 'WhatsApp Business API — Setup & Configuration',
      description: 'Step-by-step Meta Business verification, phone number registration, webhook configuration, message template submission, and production readiness checklist.',
      sections: 8,
      icon: 'fa-plug',
      color: '#059669'
    },
    {
      title: 'Chatbot Architecture & Best Practices',
      description: 'Design principles for conversational AI. Intent mapping, fallback strategies, multi-turn dialogue design, and performance optimization techniques.',
      sections: 10,
      icon: 'fa-brain',
      color: '#d97706'
    },
    {
      title: 'Campaign Optimization — Data-Driven Approach',
      description: 'A/B testing frameworks, audience segmentation strategies, send time optimization, message personalization techniques, and analytics interpretation.',
      sections: 6,
      icon: 'fa-chart-bar',
      color: '#db2777'
    }
  ];

  contentArea.innerHTML = `
    <style>
      .pm-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;transition:0.25s;cursor:pointer;}
      .pm-card:hover{border-color:#3b82f6;box-shadow:0 8px 20px rgba(0,0,0,0.05);}
      .pm-icon{width:40px;height:40px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;}
    </style>
    <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Hub</button>
    <h5 style="font-weight:700;">Platform Mastery</h5>
    <p class="text-muted small mb-3">Technical guides for mastering the 11 Avatar CRM ecosystem and WhatsApp Business platform.</p>
    <div class="row g-3">
      ${guides.map(g => `
        <div class="col-md-6">
          <div class="pm-card" onclick="Knowledge.showEmailPopup()">
            <div class="d-flex gap-3">
              <div class="pm-icon" style="background:${g.color}15;color:${g.color};"><i class="fas ${g.icon}"></i></div>
              <div>
                <h6 style="font-weight:600;">${g.title}</h6>
                <p style="color:#6b7280;font-size:12px;">${g.description}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <small class="text-muted">${g.sections} sections</small>
                  <small style="color:#3b82f6;font-weight:500;">Access Guide →</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
