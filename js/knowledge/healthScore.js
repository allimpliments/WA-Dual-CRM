// js/knowledge/healthScore.js — Multi-Step Business Diagnostic Wizard
(function(Knowledge, contentArea, db, firebase) {
  let step = 1;
  let answers = {};

  const questions = [
    {
      step: 1,
      title: 'Lead Generation Health',
      question: 'How would you rate your current lead generation system?',
      options: [
        { value: 5, label: 'Excellent — Multi-channel automated system', icon: 'fa-star' },
        { value: 4, label: 'Good — Few channels, semi-automated', icon: 'fa-check-circle' },
        { value: 3, label: 'Average — Manual processes, inconsistent', icon: 'fa-minus-circle' },
        { value: 2, label: 'Poor — No structured system', icon: 'fa-exclamation-circle' },
        { value: 1, label: 'Nonexistent — Starting from scratch', icon: 'fa-question-circle' }
      ]
    },
    {
      step: 2,
      title: 'Customer Communication',
      question: 'What is your average response time to customer inquiries?',
      options: [
        { value: 5, label: 'Under 1 minute — Instant automation', icon: 'fa-bolt' },
        { value: 4, label: '1-5 minutes — Quick manual responses', icon: 'fa-clock' },
        { value: 3, label: '5-30 minutes — Acceptable delays', icon: 'fa-hourglass-half' },
        { value: 2, label: '1-4 hours — Significant delays', icon: 'fa-hourglass-end' },
        { value: 1, label: '24+ hours — Major gap', icon: 'fa-calendar-times' }
      ]
    },
    {
      step: 3,
      title: 'Sales Automation',
      question: 'How automated is your sales follow-up process?',
      options: [
        { value: 5, label: 'Fully automated — Drip sequences + chatbot', icon: 'fa-robot' },
        { value: 4, label: 'Partially automated — Some sequences setup', icon: 'fa-cogs' },
        { value: 3, label: 'Basic automation — Template responses only', icon: 'fa-copy' },
        { value: 2, label: 'Manual — Team handles everything', icon: 'fa-user' },
        { value: 1, label: 'No follow-up system', icon: 'fa-times' }
      ]
    },
    {
      step: 4,
      title: 'Customer Retention',
      question: 'What retention strategies do you currently use?',
      options: [
        { value: 5, label: 'Comprehensive — Loyalty + re-engagement + NPS', icon: 'fa-heart' },
        { value: 4, label: 'Multiple — Regular campaigns + feedback', icon: 'fa-thumbs-up' },
        { value: 3, label: 'Basic — Occasional promotional messages', icon: 'fa-bell' },
        { value: 2, label: 'Minimal — Rarely engage existing customers', icon: 'fa-volume-off' },
        { value: 1, label: 'None — No retention strategy', icon: 'fa-heart-broken' }
      ]
    },
    {
      step: 5,
      title: 'Technology Stack',
      question: 'What technology do you use for business communication?',
      options: [
        { value: 5, label: 'WhatsApp API + CRM + Full automation stack', icon: 'fa-layer-group' },
        { value: 4, label: 'WhatsApp API with basic automation', icon: 'fa-plug' },
        { value: 3, label: 'WhatsApp Business App + some tools', icon: 'fa-mobile-alt' },
        { value: 2, label: 'Personal WhatsApp only', icon: 'fa-whatsapp' },
        { value: 1, label: 'No WhatsApp for business', icon: 'fa-ban' }
      ]
    }
  ];

  function renderStep() {
    if (step > questions.length) {
      renderResults();
      return;
    }

    const q = questions[step - 1];
    const progress = Math.round((step / questions.length) * 100);

    contentArea.innerHTML = `
      <style>
        .hs-wizard{max-width:600px;margin:0 auto;}
        .hs-progress{height:6px;border-radius:3px;background:#e5e7eb;margin-bottom:20px;}
        .hs-progress-bar{height:100%;border-radius:3px;background:linear-gradient(90deg,#3b82f6,#6366f1);transition:width 0.4s;}
        .hs-option{background:#fff;border:2px solid #e5e7eb;border-radius:12px;padding:16px;cursor:pointer;transition:0.2s;margin-bottom:8px;display:flex;align-items:center;gap:12px;}
        .hs-option:hover{border-color:#3b82f6;box-shadow:0 4px 12px rgba(59,130,246,0.1);}
        .hs-option.selected{border-color:#3b82f6;background:#e7f3ff;}
        .hs-option-icon{width:40px;height:40px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
        .hs-result-card{background:#fff;border-radius:14px;padding:24px;text-align:center;margin-bottom:12px;}
      </style>

      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
        <button onclick="Knowledge.currentSection='home';Knowledge.render();" style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:13px;"><i class="fas fa-arrow-left me-1"></i> Hub</button>
        <div><h5 style="font-weight:700;margin:0;">Business Health Diagnostic</h5><small class="text-muted">Step ${step} of ${questions.length}</small></div>
      </div>

      <div class="hs-wizard">
        <div class="hs-progress"><div class="hs-progress-bar" style="width:${progress}%;"></div></div>
        <h6 style="font-weight:600;color:#4f46e5;margin-bottom:4px;">${q.title}</h6>
        <p style="font-size:14px;margin-bottom:16px;">${q.question}</p>
        <div id="hsOptions">
          ${q.options.map((o, i) => `
            <div class="hs-option" id="opt${i}" onclick="document.querySelectorAll('.hs-option').forEach(el=>el.classList.remove('selected'));this.classList.add('selected');document.getElementById('hsOptions').dataset.value='${o.value}';">
              <div class="hs-option-icon" style="background:#e0e7ff;color:#4f46e5;"><i class="fas ${o.icon}"></i></div>
              <span style="font-size:13px;">${o.label}</span>
            </div>
          `).join('')}
        </div>
        <button id="hsNext" onclick="var v=document.getElementById('hsOptions').dataset.value;if(!v)return alert('Please select an option');answers['q'+${step}]=parseInt(v);step++;${renderStep.toString()};renderStep();" style="width:100%;padding:12px;background:#3b82f6;color:#fff;border:none;border-radius:10px;font-weight:600;cursor:pointer;margin-top:12px;">${step === questions.length ? 'View My Results →' : 'Next Step →'}</button>
      </div>
    `;
  }

  function renderResults() {
    const total = Object.values(answers).reduce((s, v) => s + v, 0);
    const maxScore = questions.length * 5;
    const score = Math.round((total / maxScore) * 100);
    
    const grades = [
      { min: 85, grade: 'Outstanding', emoji: '🏆', color: '#059669', desc: 'Your business is operating at peak efficiency. Focus on scaling and innovation.' },
      { min: 70, grade: 'Strong', emoji: '⭐', color: '#3b82f6', desc: 'Solid foundation with clear optimization opportunities in specific areas.' },
      { min: 55, grade: 'Developing', emoji: '📈', color: '#d97706', desc: 'Good progress but significant room for improvement with structured implementation.' },
      { min: 35, grade: 'Early Stage', emoji: '🌱', color: '#db2777', desc: 'Great potential. Implementing core systems will unlock substantial growth.' },
      { min: 0, grade: 'Foundation', emoji: '🏗️', color: '#6b7280', desc: 'Time to build your business communication infrastructure from the ground up.' }
    ];

    const grade = grades.find(g => score >= g.min);

    const pillars = [
      { name: 'Lead Generation', score: answers.q1 * 20, color: '#4f46e5' },
      { name: 'Communication', score: answers.q2 * 20, color: '#059669' },
      { name: 'Automation', score: answers.q3 * 20, color: '#d97706' },
      { name: 'Retention', score: answers.q4 * 20, color: '#db2777' },
      { name: 'Technology', score: answers.q5 * 20, color: '#7c3aed' }
    ];

    contentArea.innerHTML = `
      <div style="max-width:650px;margin:0 auto;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
          <button onclick="Knowledge.currentSection='home';Knowledge.render();" style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:13px;"><i class="fas fa-arrow-left me-1"></i> Hub</button>
          <div><h5 style="font-weight:700;margin:0;">Your Health Report</h5></div>
        </div>

        <div class="hs-result-card" style="border:3px solid ${grade.color};">
          <div style="font-size:48px;">${grade.emoji}</div>
          <h2 style="font-size:48px;font-weight:800;color:${grade.color};">${score}</h2>
          <p style="color:#6b7280;">out of 100</p>
          <h4 style="color:${grade.color};">${grade.grade}</h4>
          <p style="color:#6b7280;">${grade.desc}</p>
        </div>

        <h6 style="font-weight:600;margin-bottom:12px;">Pillar Breakdown</h6>
        ${pillars.map(p => `
          <div style="margin-bottom:8px;">
            <div class="d-flex justify-content-between small mb-1"><span>${p.name}</span><span style="color:${p.color};font-weight:600;">${p.score}/100</span></div>
            <div style="height:8px;border-radius:4px;background:#e5e7eb;"><div style="height:100%;border-radius:4px;background:${p.color};width:${p.score}%;"></div></div>
          </div>
        `).join('')}

        <button onclick="Knowledge.showEmailPopup()" style="width:100%;padding:12px;background:#3b82f6;color:#fff;border:none;border-radius:10px;font-weight:600;cursor:pointer;margin-top:16px;">Get Detailed Action Plan →</button>
        <button onclick="step=1;answers={};renderStep();" style="width:100%;padding:10px;background:transparent;border:1px solid #d1d5db;border-radius:10px;color:#6b7280;cursor:pointer;margin-top:8px;">Retake Diagnostic</button>
      </div>
    `;
  }

  renderStep();
})
