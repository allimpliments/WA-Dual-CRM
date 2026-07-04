// js/knowledge/courses.js — Digital Marketing University
(function(Knowledge, contentArea, db, firebase) {
  const courses = [
    {
      title: 'WhatsApp Marketing Foundation',
      tagline: 'Master the essentials of WhatsApp Business',
      level: 'Free',
      price: null,
      students: 3240,
      rating: 4.8,
      reviews: 456,
      duration: '4 hours',
      modules: 8,
      skills: ['WhatsApp Ecosystem', 'Profile Optimization', 'Broadcast Basics', 'Template Design', 'Compliance 101'],
      icon: 'fa-seedling',
      color: '#059669',
      curriculum: ['Introduction to WhatsApp Business', 'Setting Up Your Business Profile', 'Message Templates Mastery', 'Broadcast Fundamentals', 'Privacy & Compliance', 'Analytics Dashboard', 'Customer Engagement', 'Final Assessment']
    },
    {
      title: 'Advanced WhatsApp Automation',
      tagline: 'Build intelligent conversational systems',
      level: 'Premium',
      price: '₹4,999',
      students: 1240,
      rating: 4.9,
      reviews: 234,
      duration: '12 hours',
      modules: 16,
      skills: ['Chatbot Architecture', 'API Integration', 'Webhook Handling', 'Custom Flows', 'Performance Analytics'],
      icon: 'fa-cogs',
      color: '#d97706',
      curriculum: ['Chatbot Design Principles', 'Intent Mapping & Recognition', 'Multi-Turn Dialogue Design', 'API Integration Deep Dive', 'Webhook Configuration', 'Custom Flow Builder', 'Context Management', 'Fallback Strategies', 'A/B Testing Bots', 'Performance Optimization', 'Human Handoff Protocols', 'Analytics Integration', 'Security Best Practices', 'Error Handling', 'Production Deployment', 'Capstone Project']
    },
    {
      title: 'Certified WhatsApp Expert Program',
      tagline: 'Become a recognized industry authority',
      level: 'Professional',
      price: '₹49,999',
      students: 380,
      rating: 5.0,
      reviews: 89,
      duration: '6 weeks (Live Cohort)',
      modules: 24,
      skills: ['Enterprise Architecture', 'Team Leadership', 'Client Management', 'Solution Design', 'Certification'],
      icon: 'fa-award',
      color: '#7c3aed',
      curriculum: ['Platform Architecture', 'Enterprise Integration Patterns', 'Advanced Security', 'Team & Project Management', 'Client Consultation Framework', 'Solution Architecture Design', 'Industry-Specific Solutions', 'Pricing & Packaging', 'Partner Network Access', 'Live Projects', '1:1 Mentorship', 'Final Certification Exam']
    }
  ];

  let selectedCourse = null;

  contentArea.innerHTML = `
    <style>
      .cs-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:24px;transition:0.25s;cursor:pointer;height:100%;display:flex;flex-direction:column;}
      .cs-card:hover{border-color:#3b82f6;box-shadow:0 10px 25px rgba(0,0,0,0.06);transform:translateY(-2px);}
      .cs-card.featured{border-color:#f59e0b;background:#fffdf7;}
      .cs-skill{display:inline-block;padding:3px 8px;border-radius:6px;font-size:10px;background:#f3f4f6;color:#4b5563;margin:2px;}
      .cs-star{color:#f59e0b;font-size:12px;}
      .cs-detail-panel{background:#fff;border-radius:14px;padding:28px;margin-top:16px;border:2px solid #3b82f6;}
      .cs-chapter{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:6px;font-size:12px;margin:2px 0;}
    </style>

    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <button onclick="Knowledge.currentSection='home';Knowledge.render();" style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:13px;"><i class="fas fa-arrow-left me-1"></i> Hub</button>
      <div><h5 style="font-weight:700;margin:0;">Courses & Certifications</h5><small class="text-muted">Structured learning from foundation to professional mastery</small></div>
    </div>

    <div class="row g-3" id="csGrid">
      ${courses.map((c, i) => `
        <div class="col-lg-4">
          <div class="cs-card ${c.level==='Professional'?'featured':''}" id="csCard${i}" onclick="document.querySelectorAll('.cs-card').forEach(el=>el.style.borderColor='#e5e7eb');this.style.borderColor='#3b82f6';document.querySelectorAll('.cs-detail-panel').forEach(el=>el.remove());var detail=document.createElement('div');detail.className='cs-detail-panel';detail.id='csDetail${i}';detail.innerHTML='<div style=«display:flex;justify-content:space-between;align-items:start;»><h4 style=«font-weight:700;»>${c.title}</h4><button onclick=«this.closest(\\\\'.cs-detail-panel\\\\').remove()» style=«background:none;border:none;font-size:20px;cursor:pointer;»>×</button></div><p style=«color:#6b7280;»>${c.tagline}</p><div class=«row g-3 mt-3»><div class=«col-6»><strong>Students</strong><br>${c.students.toLocaleString()}</div><div class=«col-6»><strong>Rating</strong><br>${'<span class=«cs-star»>★</span>'.repeat(Math.floor(c.rating))} ${c.rating} (${c.reviews})</div><div class=«col-6»><strong>Duration</strong><br>${c.duration}</div><div class=«col-6»><strong>Modules</strong><br>${c.modules}</div></div><h6 style=«margin-top:14px;»>Skills You Will Gain</h6><div style=«margin-bottom:12px;»>${c.skills.map(s=>'<span class=«cs-skill»>'+s+'</span>').join(' ')}</div><h6>Curriculum</h6>${c.curriculum.map((ch,idx)=>'<div class=«cs-chapter»><span style=«width:20px;height:20px;border-radius:50%;background:#3b82f6;color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;»>'+(idx+1)+'</span> '+ch+'</div>').join('')}<button onclick=«Knowledge.showEmailPopup()» style=«margin-top:14px;background:${c.color};color:#fff;border:none;padding:12px 24px;border-radius:8px;cursor:pointer;font-weight:600;width:100%;»>${c.level==='Free'?'Enroll Free':'Get Started — '+c.price}</button>';this.parentElement.appendChild(detail);detail.scrollIntoView({behavior:'smooth'});">
            <div>
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div style="width:48px;height:48px;border-radius:12px;background:${c.color}15;color:${c.color};display:flex;align-items:center;justify-content:center;font-size:20px;"><i class="fas ${c.icon}"></i></div>
                <span class="badge bg-${c.level==='Free'?'success':'warning'}">${c.level}${c.price?' · '+c.price:''}</span>
              </div>
              <h6 style="font-weight:600;">${c.title}</h6>
              <p style="font-size:12px;color:#6b7280;">${c.tagline}</p>
              <div class="d-flex align-items-center gap-2 mt-2">
                <span class="cs-star">${'★'.repeat(Math.floor(c.rating))}</span>
                <small class="text-muted">${c.rating} (${c.reviews})</small>
              </div>
              <small class="text-muted d-block mt-1">${c.students.toLocaleString()} students · ${c.duration}</small>
            </div>
            <div class="mt-auto pt-3">
              <div class="d-flex justify-content-between small text-muted">
                <span>${c.modules} modules</span>
                <span style="color:${c.color};font-weight:500;">View Curriculum →</span>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
})
