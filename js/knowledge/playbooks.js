// js/knowledge/playbooks.js — Business Growth Playbooks Module
function(Knowledge, contentArea, db, firebase) {
  const playbooks = [
    {
      id: 'whatsapp-mastery',
      title: 'WhatsApp Marketing Mastery',
      subtitle: 'From Setup to Scale',
      description: 'Complete framework for WhatsApp Business marketing. Covers profile optimization, broadcast strategy, template design, engagement metrics, and scaling from 100 to 100,000 messages.',
      level: 'Beginner',
      duration: '35 min read',
      topics: ['Profile Setup', 'Broadcast Strategy', 'Template Design', 'Engagement Metrics', 'Scaling'],
      icon: 'fa-comment-dots',
      color: '#4f46e5'
    },
    {
      id: 'lead-generation',
      title: 'Lead Generation Blueprint',
      subtitle: 'Multi-Channel Capture System',
      description: 'Build a comprehensive lead capture infrastructure. WhatsApp widgets, landing pages, social media integration, ad campaigns, and form optimization for maximum conversion.',
      level: 'Intermediate',
      duration: '45 min read',
      topics: ['Widget Integration', 'Landing Pages', 'Social Capture', 'Ad Integration', 'Form Optimization'],
      icon: 'fa-funnel-dollar',
      color: '#059669'
    },
    {
      id: 'sales-automation',
      title: 'Sales Automation Architecture',
      subtitle: 'Convert on Autopilot',
      description: 'Design intelligent automation flows. Multi-step chatbots, conditional branching, drip sequences, lead scoring triggers, and CRM integration for hands-free conversion.',
      level: 'Advanced',
      duration: '60 min read',
      topics: ['Chatbot Flows', 'Conditional Logic', 'Drip Sequences', 'Lead Scoring', 'CRM Sync'],
      icon: 'fa-robot',
      color: '#d97706'
    },
    {
      id: 'customer-retention',
      title: 'Customer Retention Systems',
      subtitle: 'Maximize Lifetime Value',
      description: 'Proven retention frameworks. Loyalty programs via WhatsApp, re-engagement campaigns, feedback collection, NPS surveys, and churn prediction strategies.',
      level: 'Intermediate',
      duration: '30 min read',
      topics: ['Loyalty Programs', 'Re-engagement', 'Feedback Loops', 'NPS Surveys', 'Churn Prevention'],
      icon: 'fa-heart',
      color: '#db2777'
    },
    {
      id: 'scaling-blueprint',
      title: 'Scaling from 0 to 1,000 Customers',
      subtitle: 'Infrastructure & Growth',
      description: 'The complete scaling playbook. Team structure, tool stack, automation infrastructure, hiring framework, and maintaining quality at scale.',
      level: 'Advanced',
      duration: '75 min read',
      topics: ['Team Structure', 'Tool Stack', 'Automation Infrastructure', 'Hiring Framework', 'Quality at Scale'],
      icon: 'fa-rocket',
      color: '#7c3aed'
    }
  ];

  const levelColors = {
    'Beginner': { bg: '#d1fae5', text: '#065f46' },
    'Intermediate': { bg: '#fef3c7', text: '#92400e' },
    'Advanced': { bg: '#fce7f3', text: '#9d174d' }
  };

  // Render function
  contentArea.innerHTML = `
    <style>
      .pl-header{display:flex;align-items:center;gap:12px;margin-bottom:20px;}
      .pl-header button{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:13px;transition:0.2s;}
      .pl-header button:hover{background:#f3f4f6;}
      .pl-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;cursor:pointer;transition:all 0.25s;height:100%;}
      .pl-card:hover{transform:translateY(-2px);box-shadow:0 10px 25px rgba(0,0,0,0.06);border-color:#3b82f6;}
      .pl-icon{width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;}
      .pl-level{padding:2px 8px;border-radius:8px;font-size:10px;font-weight:600;}
      .pl-topic{display:inline-block;padding:2px 8px;border-radius:6px;font-size:10px;background:#f3f4f6;color:#4b5563;margin:2px;}
      .pl-detail-panel{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:24px;margin-top:16px;}
    </style>

    <div class="pl-header">
      <button onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Hub</button>
      <div>
        <h5 style="font-weight:700;margin:0;">Business Growth Playbooks</h5>
        <small class="text-muted">Strategic frameworks for every stage of business growth</small>
      </div>
    </div>

    <div class="row g-3" id="plGrid">
      ${playbooks.map((p, i) => `
        <div class="col-md-6 col-lg-4">
          <div class="pl-card" onclick="document.getElementById('plDetail${i}').scrollIntoView({behavior:'smooth'});document.querySelectorAll('.pl-card').forEach(c=>c.style.borderColor='#e5e7eb');event.currentTarget.style.borderColor='#3b82f6';">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div class="pl-icon" style="background:${p.color}15;color:${p.color};"><i class="fas ${p.icon}"></i></div>
              <span class="pl-level" style="background:${levelColors[p.level].bg};color:${levelColors[p.level].text};">${p.level}</span>
            </div>
            <h6 style="font-weight:600;">${p.title}</h6>
            <p style="color:#6b7280;font-size:11px;margin-bottom:4px;">${p.subtitle}</p>
            <small class="text-muted"><i class="far fa-clock me-1"></i>${p.duration}</small>
            <div class="mt-2">${p.topics.map(t => `<span class="pl-topic">${t}</span>`).join(' ')}</div>
          </div>
        </div>
        <div class="col-12" id="plDetail${i}" style="display:none;">
          <div class="pl-detail-panel">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h5 style="font-weight:700;">${p.title}</h5>
                <p style="color:#6b7280;">${p.subtitle}</p>
              </div>
              <button class="btn btn-sm btn-outline-secondary" onclick="this.closest('.col-12').style.display='none';">×</button>
            </div>
            <p>${p.description}</p>
            <div class="row g-2 mt-3">
              <div class="col-sm-6"><strong>Duration:</strong> ${p.duration}</div>
              <div class="col-sm-6"><strong>Level:</strong> ${p.level}</div>
            </div>
            <button class="btn btn-primary btn-sm mt-3" onclick="Knowledge.showEmailPopup()">Download Full Playbook</button>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="text-center mt-4 py-3" style="background:#f9fafb;border-radius:12px;">
      <p class="text-muted small mb-2">New playbooks added monthly. Have a topic request?</p>
      <button class="btn btn-outline-primary btn-sm" onclick="Knowledge.showEmailPopup()">Request a Playbook</button>
    </div>
  `;

  // Click handler for detail panels
  document.querySelectorAll('.pl-card').forEach((card, i) => {
    card.addEventListener('click', function() {
      const detail = document.getElementById('plDetail' + i);
      const isVisible = detail.style.display !== 'none';
      document.querySelectorAll('[id^=plDetail]').forEach(d => d.style.display = 'none');
      detail.style.display = isVisible ? 'none' : 'block';
      if (!isVisible) detail.scrollIntoView({ behavior: 'smooth' });
    });
  });
}
