// js/knowledge/playbooks.js — Interactive Growth Playbooks
(function(Knowledge, contentArea, db, firebase) {
  const playbooks = [
    {
      id: 'whatsapp-mastery',
      title: 'WhatsApp Marketing Mastery',
      subtitle: 'From Zero to WhatsApp Power User',
      description: 'Complete strategic framework covering WhatsApp Business ecosystem, profile optimization, broadcast strategy, template design psychology, engagement metrics, and scaling infrastructure from 100 to 100,000 monthly messages.',
      level: 'Beginner',
      duration: '35 min read',
      modules: 7,
      completionRate: '92%',
      topics: ['Profile Setup', 'Broadcast Strategy', 'Template Design', 'Engagement Metrics', 'Scaling Infrastructure'],
      icon: 'fa-comment-dots',
      color: '#4f46e5'
    },
    {
      id: 'lead-generation',
      title: 'Lead Generation Blueprint',
      subtitle: 'Multi-Channel Capture System',
      description: 'Build a comprehensive lead capture infrastructure. Covers WhatsApp widgets, landing page optimization, social media integration, Meta/Google ad lead forms, and A/B testing frameworks for maximum conversion rates.',
      level: 'Intermediate',
      duration: '45 min read',
      modules: 9,
      completionRate: '87%',
      topics: ['Widget Integration', 'Landing Pages', 'Social Capture', 'Ad Integration', 'Form Optimization'],
      icon: 'fa-funnel-dollar',
      color: '#059669'
    },
    {
      id: 'sales-automation',
      title: 'Sales Automation Architecture',
      subtitle: 'Convert Leads on Autopilot',
      description: 'Design intelligent multi-step automation flows. Deep dive into chatbot branching logic, conditional triggers, drip sequence timing psychology, lead scoring algorithms, and seamless CRM synchronization patterns.',
      level: 'Advanced',
      duration: '60 min read',
      modules: 12,
      completionRate: '78%',
      topics: ['Chatbot Flows', 'Conditional Logic', 'Drip Sequences', 'Lead Scoring', 'CRM Sync'],
      icon: 'fa-robot',
      color: '#d97706'
    },
    {
      id: 'customer-retention',
      title: 'Customer Retention Systems',
      subtitle: 'Maximize Lifetime Value',
      description: 'Proven retention frameworks specifically designed for WhatsApp. Loyalty program structures, win-back campaign sequences, NPS survey integration, churn prediction signals, and referral automation workflows.',
      level: 'Intermediate',
      duration: '30 min read',
      modules: 6,
      completionRate: '85%',
      topics: ['Loyalty Programs', 'Win-Back Campaigns', 'NPS Surveys', 'Churn Prevention', 'Referral Systems'],
      icon: 'fa-heart',
      color: '#db2777'
    },
    {
      id: 'scaling-blueprint',
      title: 'Scaling from 0 to 1,000 Customers',
      subtitle: 'The Complete Growth Infrastructure',
      description: 'The ultimate scaling playbook covering team structure design, technology stack selection, automation infrastructure, hiring frameworks for WhatsApp-focused roles, and quality assurance at scale without losing personalization.',
      level: 'Advanced',
      duration: '75 min read',
      modules: 14,
      completionRate: '71%',
      topics: ['Team Structure', 'Tool Stack', 'Automation Infrastructure', 'Hiring Framework', 'Quality at Scale'],
      icon: 'fa-rocket',
      color: '#7c3aed'
    }
  ];

  let selectedPlaybook = null;

  const levelColors = {
    'Beginner': { bg: '#d1fae5', text: '#065f46', icon: 'fa-seedling' },
    'Intermediate': { bg: '#fef3c7', text: '#92400e', icon: 'fa-chart-line' },
    'Advanced': { bg: '#fce7f3', text: '#9d174d', icon: 'fa-crown' }
  };

  function renderList() {
    contentArea.innerHTML = `
      <style>
        .pb-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:22px;cursor:pointer;transition:all 0.25s;position:relative;overflow:hidden;}
        .pb-card:hover{transform:translateY(-3px);box-shadow:0 14px 30px rgba(0,0,0,0.08);border-color:#3b82f6;}
        .pb-card::after{content:'';position:absolute;top:0;right:0;width:80px;height:80px;background:var(--pb-color);opacity:0.05;border-radius:0 0 0 80px;transition:0.3s;}
        .pb-card:hover::after{width:120px;height:120px;}
        .pb-icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:14px;}
        .pb-level{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:8px;font-size:10px;font-weight:600;}
        .pb-progress{height:4px;border-radius:2px;background:#e5e7eb;margin-top:10px;}
        .pb-progress-bar{height:100%;border-radius:2px;transition:width 0.5s;}
        .pb-detail{background:#fff;border-radius:14px;padding:28px;margin-top:16px;border:2px solid #3b82f6;box-shadow:0 8px 30px rgba(59,130,246,0.1);}
        .pb-topic{display:inline-block;padding:4px 10px;border-radius:6px;font-size:10px;background:#f3f4f6;color:#4b5563;margin:2px;}
      </style>

      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
        <button onclick="Knowledge.currentSection='home';Knowledge.render();" style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:13px;"><i class="fas fa-arrow-left me-1"></i> Hub</button>
        <div><h5 style="font-weight:700;margin:0;">Business Growth Playbooks</h5><small class="text-muted">Strategic frameworks for every stage of business growth</small></div>
      </div>

      <div class="row g-3" id="pbGrid">
        ${playbooks.map(p => `
          <div class="col-lg-6">
            <div class="pb-card" style="--pb-color:${p.color};" onclick="document.querySelectorAll('.pb-detail').forEach(d=>d.remove());var detail=document.createElement('div');detail.className='pb-detail';detail.id='detail-${p.id}';detail.innerHTML='<div style=«display:flex;justify-content:space-between;align-items:start;»><div><h4 style=«font-weight:700;»>${p.title}</h4><p style=«color:#6b7280;»>${p.subtitle}</p></div><button onclick=«this.closest(\\\\'.pb-detail\\\\').remove()» style=«background:none;border:none;font-size:20px;cursor:pointer;»>×</button></div><p style=«margin-top:12px;line-height:1.7;»>${p.description}</p><div class=«row g-3 mt-3»><div class=«col-sm-4»><strong>Level</strong><br><span class=«pb-level» style=«background:${levelColors[p.level].bg};color:${levelColors[p.level].text};»><i class=«fas ${levelColors[p.level].icon}»></i> ${p.level}</span></div><div class=«col-sm-4»><strong>Duration</strong><br><span>${p.duration}</span></div><div class=«col-sm-4»><strong>Modules</strong><br><span>${p.modules} chapters</span></div></div><div style=«margin-top:12px;»>${p.topics.map(t=>'<span class=«pb-topic»>'+t+'</span>').join(' ')}</div><button onclick=«Knowledge.showEmailPopup()» style=«margin-top:14px;background:${p.color};color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:600;»>Download Full Playbook →</button>';
            this.parentElement.appendChild(detail);detail.scrollIntoView({behavior:'smooth'});">
              <div class="d-flex justify-content-between align-items-start">
                <div class="pb-icon" style="background:${p.color}15;color:${p.color};"><i class="fas ${p.icon}"></i></div>
                <span class="pb-level" style="background:${levelColors[p.level].bg};color:${levelColors[p.level].text};"><i class="fas ${levelColors[p.level].icon} me-1"></i>${p.level}</span>
              </div>
              <h6 style="font-weight:600;font-size:15px;">${p.title}</h6>
              <p style="color:#6b7280;font-size:12px;margin-bottom:8px;">${p.subtitle}</p>
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted"><i class="far fa-clock me-1"></i>${p.duration} · ${p.modules} chapters</small>
                <small style="color:${p.color};font-weight:500;">${p.completionRate}% completion</small>
              </div>
              <div class="pb-progress"><div class="pb-progress-bar" style="width:${p.completionRate};background:${p.color};"></div></div>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="text-align:center;margin-top:24px;padding:20px;background:#f9fafb;border-radius:12px;">
        <p style="color:#6b7280;font-size:13px;margin-bottom:8px;">New playbooks published monthly. Have a specific topic request?</p>
        <button onclick="Knowledge.showEmailPopup()" style="background:#fff;border:1px solid #3b82f6;color:#3b82f6;padding:8px 18px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;">Request Custom Playbook</button>
      </div>
    `;
  }

  renderList();
})
