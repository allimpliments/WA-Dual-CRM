// js/knowledge/platform.js — Technical Documentation Hub
(function(Knowledge, contentArea, db, firebase) {
  const guides = [
    {
      title: '11 Avatar CRM — Complete System Guide',
      description: 'End-to-end technical walkthrough covering every module architecture, data flow patterns, API integration points, and best practices for optimal configuration.',
      sections: 12,
      difficulty: 'Intermediate',
      lastUpdated: 'July 2026',
      icon: 'fa-cube',
      color: '#4f46e5',
      chapters: ['Architecture Overview', 'Dashboard Configuration', 'Lead Pipeline Setup', 'Campaign Orchestration', 'Chatbot Integration', 'Form Builder Deep Dive', 'Social Media Connect', 'Analytics Framework', 'Team Management', 'Security & Permissions', 'Backup & Recovery', 'Performance Tuning']
    },
    {
      title: 'WhatsApp Business API — Complete Setup',
      description: 'Step-by-step Meta Business verification process, phone number registration, webhook configuration patterns, message template submission workflow, and production deployment checklist.',
      sections: 8,
      difficulty: 'Advanced',
      lastUpdated: 'June 2026',
      icon: 'fa-plug',
      color: '#059669',
      chapters: ['Meta Business Account', 'Phone Number Registration', 'Webhook Configuration', 'Template Submission', 'Production Checklist', 'Error Handling', 'Rate Limiting', 'Compliance Guide']
    },
    {
      title: 'Chatbot Architecture & Best Practices',
      description: 'Design principles for conversational AI systems. Intent mapping strategies, fallback handling patterns, multi-turn dialogue design, context management, and performance optimization.',
      sections: 10,
      difficulty: 'Advanced',
      lastUpdated: 'July 2026',
      icon: 'fa-brain',
      color: '#d97706',
      chapters: ['Intent Mapping', 'Fallback Strategies', 'Multi-Turn Dialogue', 'Context Management', 'Performance Optimization', 'Testing Framework', 'Analytics Integration', 'A/B Testing Bots', 'Human Handoff', 'Continuous Learning']
    },
    {
      title: 'Campaign Optimization — Data-Driven Approach',
      description: 'A/B testing frameworks, audience segmentation strategies, send time optimization algorithms, message personalization techniques, and comprehensive analytics interpretation guide.',
      sections: 6,
      difficulty: 'Intermediate',
      lastUpdated: 'May 2026',
      icon: 'fa-chart-bar',
      color: '#db2777',
      chapters: ['A/B Testing Framework', 'Audience Segmentation', 'Send Time Optimization', 'Personalization Techniques', 'Analytics Dashboard', 'ROI Calculation']
    }
  ];

  let activeGuide = null;

  function renderList() {
    contentArea.innerHTML = `
      <style>
        .pm-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:22px;cursor:pointer;transition:0.25s;position:relative;}
        .pm-card:hover{border-color:#3b82f6;box-shadow:0 10px 25px rgba(0,0,0,0.06);}
        .pm-card.active{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,0.1);}
        .pm-icon{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
        .pm-chapter{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:6px;font-size:12px;margin:2px 0;background:#f9fafb;}
        .pm-chapter i{color:#10b981;font-size:10px;}
      </style>

      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
        <button onclick="Knowledge.currentSection='home';Knowledge.render();" style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:13px;"><i class="fas fa-arrow-left me-1"></i> Hub</button>
        <div><h5 style="font-weight:700;margin:0;">Platform Mastery</h5><small class="text-muted">Technical documentation & implementation guides</small></div>
      </div>

      <div class="row g-3" id="pmGrid">
        ${guides.map((g, i) => `
          <div class="col-md-6">
            <div class="pm-card" id="pmCard${i}" onclick="document.querySelectorAll('.pm-card').forEach(c=>c.classList.remove('active'));this.classList.add('active');var panel=document.getElementById('pmDetail');panel.innerHTML='<h5 style=«font-weight:700;»>${g.title}</h5><p style=«color:#6b7280;»>${g.description}</p><div class=«row g-2 mt-3»><div class=«col-4»><strong>Difficulty</strong><br><span class=«badge bg-${g.difficulty==='Advanced'?'danger':'warning'}»>${g.difficulty}</span></div><div class=«col-4»><strong>Sections</strong><br>${g.sections}</div><div class=«col-4»><strong>Updated</strong><br>${g.lastUpdated}</div></div><h6 style=«margin-top:14px;»>Chapters</h6>${g.chapters.map(c=>'<div class=«pm-chapter»><i class=«fas fa-check-circle»></i> '+c+'</div>').join('')}<button onclick=«Knowledge.showEmailPopup()» style=«margin-top:14px;background:#3b82f6;color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:600;width:100%;»>Access Complete Guide →</button>';panel.style.display='block';">
              <div style="display:flex;gap:14px;align-items:start;">
                <div class="pm-icon" style="background:${g.color}15;color:${g.color};"><i class="fas ${g.icon}"></i></div>
                <div>
                  <h6 style="font-weight:600;">${g.title}</h6>
                  <p style="font-size:12px;color:#6b7280;">${g.description.substring(0,100)}...</p>
                  <div class="d-flex gap-3 mt-2">
                    <small class="text-muted"><i class="far fa-file-alt me-1"></i>${g.sections} sections</small>
                    <small class="text-muted"><i class="fas fa-signal me-1"></i>${g.difficulty}</small>
                    <small class="text-muted"><i class="far fa-clock me-1"></i>${g.lastUpdated}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div id="pmDetail" style="display:none;background:#fff;border-radius:14px;padding:24px;margin-top:16px;border:1px solid #e5e7eb;"></div>
    `;
  }

  renderList();
})
