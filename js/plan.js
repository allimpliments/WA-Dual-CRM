// js/plan.js — Subscription Plans & Billing
const Plan = {
  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = 'var(--bg-primary, #f0f2f5)';

    const currentUser = window.currentUser || {};
    const currentPlan = currentUser.plan || 'free';

    const plans = [
      {
        name: 'Free',
        price: '₹0',
        period: 'forever',
        color: '#6b7280',
        features: ['Up to 100 contacts', 'Basic WhatsApp messaging', '1 chatbot', '5 campaigns/month', 'Email support'],
        cta: 'Current Plan',
        highlighted: false
      },
      {
        name: 'Professional',
        price: '₹1,499',
        period: 'per month',
        color: '#3b82f6',
        features: ['Unlimited contacts', 'Advanced WhatsApp API', 'Unlimited chatbots', 'Unlimited campaigns', 'Drip sequences', 'Lead scoring', 'Priority support'],
        cta: 'Upgrade Now',
        highlighted: true
      },
      {
        name: 'Enterprise',
        price: '₹2,999',
        period: 'per month',
        color: '#7c3aed',
        features: ['Everything in Professional', 'Dedicated account manager', 'Custom integrations', 'White-label option', 'API access', 'SLA guarantee', '24/7 phone support'],
        cta: 'Contact Sales',
        highlighted: false
      }
    ];

    let html = `
      <style>
        .plan-card{background:#fff;border:2px solid #e5e7eb;border-radius:16px;padding:28px;text-align:center;transition:0.3s;position:relative;height:100%;display:flex;flex-direction:column;}
        .plan-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,0.08);}
        .plan-card.featured{border-color:#3b82f6;box-shadow:0 8px 30px rgba(59,130,246,0.15);}
        .plan-card.featured::before{content:'Most Popular';position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:#3b82f6;color:#fff;padding:6px 20px;border-radius:20px;font-size:11px;font-weight:600;}
        .plan-price{font-size:36px;font-weight:800;margin:12px 0;}
        .plan-period{color:#6b7280;font-size:13px;}
        .plan-feature{display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px;text-align:left;}
        .plan-feature i{color:#10b981;font-size:12px;}
        .plan-btn{width:100%;padding:12px;border-radius:10px;font-weight:600;cursor:pointer;margin-top:auto;border:none;font-size:14px;}
        .usage-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:20px;margin-bottom:14px;}
      </style>

      <h4 style="font-weight:700;margin-bottom:8px;"><i class="fas fa-wallet text-success me-2"></i>Subscription Plan</h4>
      <p class="text-muted small mb-4">Choose the right plan for your business needs</p>

      <div class="row g-3 mb-4">
        <div class="col-md-4"><div class="usage-card text-center"><h3 style="color:#4f46e5;">1,247</h3><small class="text-muted">Contacts Used</small></div></div>
        <div class="col-md-4"><div class="usage-card text-center"><h3 style="color:#059669;">45/50</h3><small class="text-muted">Campaigns This Month</small></div></div>
        <div class="col-md-4"><div class="usage-card text-center"><h3 style="color:#d97706;">8,420</h3><small class="text-muted">Messages Sent</small></div></div>
      </div>

      <div class="row g-3">
        ${plans.map(p => `
          <div class="col-lg-4">
            <div class="plan-card ${p.highlighted?'featured':''}">
              <h5 style="font-weight:700;color:${p.color};">${p.name}</h5>
              <div class="plan-price" style="color:${p.color};">${p.price}</div>
              <div class="plan-period">${p.period}</div>
              <hr>
              <div class="text-left">
                ${p.features.map(f => `<div class="plan-feature"><i class="fas fa-check-circle"></i> ${f}</div>`).join('')}
              </div>
              <button class="plan-btn" style="background:${currentPlan===p.name.toLowerCase()?'#e5e7eb':p.color};color:${currentPlan===p.name.toLowerCase()?'#6b7280':'#fff'};" ${currentPlan===p.name.toLowerCase()?'disabled':''} onclick="Plan.upgradePlan('${p.name}')">
                ${currentPlan===p.name.toLowerCase()?'✓ Current Plan':p.cta}
              </button>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="text-align:center;margin-top:20px;padding:16px;background:#f9fafb;border-radius:12px;">
        <p style="font-size:13px;color:#6b7280;">Need a custom enterprise solution?</p>
        <button onclick="alert('Our team will contact you within 24 hours.')" style="background:#7c3aed;color:#fff;border:none;padding:8px 18px;border-radius:8px;cursor:pointer;font-weight:500;">Contact Sales Team</button>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  upgradePlan(planName) {
    alert(`✨ You selected the ${planName} plan!\n\nOur team will reach out to complete your upgrade.`);
  }
};
