// js/knowledge/industry.js — Industry Solutions with Custom Calculators
(function(Knowledge, contentArea, db, firebase) {
  const industries = [
    {
      name: 'Real Estate',
      icon: 'fa-home',
      color: '#4f46e5',
      stat: '40% increase in qualified leads',
      statDetail: 'Average improvement reported by real estate firms using WhatsApp automation',
      description: 'Transform property inquiries with virtual tours via WhatsApp, instant AI-powered responses to listing questions, automated site visit scheduling with calendar integration, and document sharing workflows for agreements and disclosures.',
      features: ['Virtual Property Tours', 'Instant Inquiry Response', 'Automated Visit Scheduling', 'Document Sharing', 'Buyer/Seller Updates'],
      calculator: { label: 'Monthly Property Inquiries', placeholder: 'e.g. 150', result: 'Potential additional closings per month' }
    },
    {
      name: 'Healthcare',
      icon: 'fa-hospital',
      color: '#059669',
      stat: '65% reduction in patient no-shows',
      statDetail: 'Healthcare providers using automated WhatsApp reminders',
      description: 'Streamline patient communication with automated appointment reminders, prescription refill notifications with photo upload, teleconsultation booking links with doctor availability, and post-visit follow-up satisfaction surveys.',
      features: ['Appointment Reminders', 'Prescription Refills', 'Teleconsultation Booking', 'Lab Report Delivery', 'Post-Visit Surveys'],
      calculator: { label: 'Monthly Appointments', placeholder: 'e.g. 300', result: 'Estimated no-shows prevented per month' }
    },
    {
      name: 'Education',
      icon: 'fa-graduation-cap',
      color: '#d97706',
      stat: '3x student engagement rate',
      statDetail: 'Educational institutions using WhatsApp for communication',
      description: 'Enhance student experience with automated admission inquiry handling, fee payment reminders with payment links, exam schedule notifications with downloadable resources, and parent-teacher communication channels with translation support.',
      features: ['Admission Inquiries', 'Fee Reminders', 'Exam Notifications', 'Parent Communication', 'Assignment Submissions'],
      calculator: { label: 'Student Enrollments/Year', placeholder: 'e.g. 500', result: 'Potential increase in enrollment conversion' }
    },
    {
      name: 'E‑commerce',
      icon: 'fa-shopping-cart',
      color: '#db2777',
      stat: '25% abandoned cart recovery rate',
      statDetail: 'E-commerce stores using WhatsApp recovery campaigns',
      description: 'Boost revenue with automated order confirmation messages including tracking links, personalized product recommendations based on browsing history, flash sale alerts with urgency triggers, and post-purchase review collection for social proof.',
      features: ['Order Confirmations', 'Abandoned Cart Recovery', 'Product Recommendations', 'Flash Sale Alerts', 'Review Collection'],
      calculator: { label: 'Monthly Orders', placeholder: 'e.g. 1000', result: 'Estimated recovered revenue per month' }
    },
    {
      name: 'Financial Services',
      icon: 'fa-landmark',
      color: '#7c3aed',
      stat: '50% faster loan processing time',
      statDetail: 'Financial institutions using WhatsApp document collection',
      description: 'Accelerate financial operations with secure document collection via end-to-end encrypted WhatsApp, application status tracking with automated updates, payment reminder automation reducing defaults, and KYC verification workflows with photo upload.',
      features: ['Document Collection', 'Status Tracking', 'Payment Reminders', 'KYC Verification', 'Investment Updates'],
      calculator: { label: 'Monthly Applications', placeholder: 'e.g. 200', result: 'Estimated processing time saved (hours)' }
    }
  ];

  let selectedIndustry = null;

  contentArea.innerHTML = `
    <style>
      .ind-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:22px;cursor:pointer;transition:0.25s;position:relative;overflow:hidden;}
      .ind-card:hover{transform:translateY(-3px);box-shadow:0 12px 28px rgba(0,0,0,0.08);border-color:#3b82f6;}
      .ind-detail{background:#fff;border-radius:14px;padding:28px;margin-top:16px;border:2px solid #3b82f6;}
      .ind-feature{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#f9fafb;border-radius:8px;font-size:12px;margin:4px 0;}
      .ind-calc{background:#f0fdf4;border-radius:10px;padding:16px;margin-top:12px;}
    </style>

    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <button onclick="Knowledge.currentSection='home';Knowledge.render();" style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:13px;"><i class="fas fa-arrow-left me-1"></i> Hub</button>
      <div><h5 style="font-weight:700;margin:0;">Industry Solutions</h5><small class="text-muted">Tailored WhatsApp strategies for your industry</small></div>
    </div>

    <div class="row g-3">
      ${industries.map(ind => `
        <div class="col-lg-6">
          <div class="ind-card" onclick="document.querySelectorAll('.ind-detail').forEach(d=>d.remove());var detail=document.createElement('div');detail.className='ind-detail';detail.innerHTML='<div style=«display:flex;justify-content:space-between;align-items:start;»><h4 style=«font-weight:700;»>${ind.name} Solutions</h4><button onclick=«this.closest(\\\\'.ind-detail\\\\').remove()» style=«background:none;border:none;font-size:20px;cursor:pointer;»>×</button></div><p style=«margin-top:8px;line-height:1.7;»>${ind.description}</p><div class=«row g-3 mt-3»>${ind.features.map(f=>'<div class=«col-6»><div class=«ind-feature»><i class=«fas fa-check-circle» style=«color:#10b981;»></i> '+f+'</div></div>').join('')}</div><div class=«ind-calc»><strong>Quick Calculator</strong><p class=«small text-muted»>${ind.calculator.label}</p><input type=«number» id=«calcInput» class=«form-control form-control-sm» placeholder=«${ind.calculator.placeholder}»><button onclick=«var v=parseInt(document.getElementById(\\\\'calcInput\\\\').value)||0;var r=Math.round(v*0.'+['40','65','20','25','50'][industries.indexOf(ind)]+');document.getElementById(\\\\'calcResult\\\\').innerHTML=v>0?\\\\'<strong style=«color:#059669;»>'+r.toLocaleString()+'\\\\' + '${ind.calculator.result.replace('Estimated ','').replace('Potential ','').replace(' per month','')}'+'</strong>\\\\':\\\\'\\\\';» style=«margin-top:8px;background:#10b981;color:#fff;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;»>Calculate</button><div id=«calcResult» class=«mt-2»></div></div><button onclick=«Knowledge.showEmailPopup()» style=«margin-top:14px;background:${ind.color};color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:600;width:100%;»>Get ${ind.name} Solution →</button>';this.parentElement.appendChild(detail);detail.scrollIntoView({behavior:'smooth'});">
            <div style="display:flex;gap:14px;align-items:start;">
              <div style="width:48px;height:48px;border-radius:12px;background:${ind.color}15;color:${ind.color};display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;"><i class="fas ${ind.icon}"></i></div>
              <div>
                <h6 style="font-weight:600;">${ind.name}</h6>
                <p style="color:${ind.color};font-weight:600;font-size:14px;margin-bottom:4px;">${ind.stat}</p>
                <p style="font-size:11px;color:#6b7280;">${ind.statDetail}</p>
                <small style="color:#3b82f6;font-weight:500;">Explore Solution →</small>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
})
