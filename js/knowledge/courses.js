// js/knowledge/courses.js — Courses & Certifications Module
function(Knowledge, contentArea, db, firebase) {
  const courses = [
    {
      title: 'WhatsApp Marketing Foundation',
      level: 'Free',
      modules: 8,
      duration: '4 hours',
      description: 'Core concepts: WhatsApp ecosystem, profile optimization, broadcast fundamentals, message templates, and compliance basics.',
      color: '#059669',
      icon: 'fa-seedling'
    },
    {
      title: 'Advanced WhatsApp Automation',
      level: 'Premium',
      price: '₹4,999',
      modules: 16,
      duration: '12 hours',
      description: 'Deep dive into chatbot architecture, API integration, webhook handling, custom flows, and performance analytics.',
      color: '#d97706',
      icon: 'fa-cogs'
    },
    {
      title: 'Certified WhatsApp Expert Program',
      level: 'Professional',
      price: '₹49,999',
      modules: 24,
      duration: '6 weeks',
      description: 'Live cohort-based program. 1:1 mentorship, real client projects, official certification badge, and partner network access.',
      color: '#7c3aed',
      icon: 'fa-award'
    }
  ];

  contentArea.innerHTML = `
    <style>
      .course-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:24px;height:100%;display:flex;flex-direction:column;}
      .course-badge{display:inline-block;padding:3px 10px;border-radius:8px;font-size:10px;font-weight:600;margin-bottom:12px;}
    </style>
    <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Hub</button>
    <h5 style="font-weight:700;">Courses & Certifications</h5>
    <p class="text-muted small mb-3">Structured learning paths from foundation to mastery.</p>
    <div class="row g-3">
      ${courses.map(c => `
        <div class="col-md-4">
          <div class="course-card">
            <div>
              <span class="course-badge" style="background:${c.color}15;color:${c.color};">${c.level}${c.price?' · '+c.price:''}</span>
              <div style="width:40px;height:40px;border-radius:8px;background:${c.color}10;color:${c.color};display:flex;align-items:center;justify-content:center;font-size:16px;margin-bottom:10px;"><i class="fas ${c.icon}"></i></div>
              <h6 style="font-weight:600;">${c.title}</h6>
              <p style="font-size:12px;color:#6b7280;">${c.description}</p>
            </div>
            <div class="mt-auto">
              <div class="d-flex justify-content-between small text-muted mb-2">
                <span>${c.modules} modules</span><span>${c.duration}</span>
              </div>
              <button class="btn btn-${c.level==='Free'?'outline-primary':'warning'} btn-sm w-100" onclick="Knowledge.showEmailPopup()">${c.level==='Free'?'Enroll Free':'Get Started'}</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
} 
