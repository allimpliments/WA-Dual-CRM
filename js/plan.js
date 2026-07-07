// js/plan.js — Enterprise-Grade Subscription & Multi-Payment Gateway Billing System
const Plan = {
  currentView: 'plans',
  editPlanId: null,
  plans: [],

  // All supported payment gateways — India + Global
  paymentGateways: [
    { id: 'razorpay', name: 'Razorpay', icon: 'fa-rupee-sign', color: '#3395FF', desc: 'UPI, Cards, Netbanking, Wallets', connected: true },
    { id: 'stripe', name: 'Stripe', icon: 'fa-credit-card', color: '#635BFF', desc: 'International cards, 135+ currencies', connected: true },
    { id: 'phonepe', name: 'PhonePe PG', icon: 'fa-mobile-alt', color: '#5F259F', desc: 'UPI, Cards, Netbanking, EMI', connected: false },
    { id: 'paytm', name: 'Paytm Payment Gateway', icon: 'fa-wallet', color: '#00B9F1', desc: 'UPI, Paytm Wallet, Cards, Netbanking', connected: false },
    { id: 'cashfree', name: 'Cashfree', icon: 'fa-bolt', color: '#FF6B35', desc: 'UPI, Cards, Netbanking, Auto-payouts', connected: false },
    { id: 'instamojo', name: 'Instamojo', icon: 'fa-shopping-bag', color: '#1B5E20', desc: 'UPI, Cards, Netbanking, Free setup', connected: false },
    { id: 'payu', name: 'PayU India', icon: 'fa-shield-alt', color: '#FF5722', desc: 'UPI, Cards, Netbanking, EMI options', connected: false },
    { id: 'direct_bank', name: 'Direct Bank Transfer', icon: 'fa-university', color: '#1a73e8', desc: 'NEFT, RTGS, IMPS — manual verification', connected: true },
  ],

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = '#f8fafc';

    const user = window.currentUser || {};
    const isPlatformAdmin = user.role === 'platform_owner' || user.role === 'platform_super_admin';

    if (isPlatformAdmin && this.currentView === 'manage') { await this.renderPlanManager(); return; }
    if (isPlatformAdmin && this.currentView === 'edit') { await this.renderPlanEditor(); return; }
    if (isPlatformAdmin && this.currentView === 'gateways') { await this.renderGatewayManager(); return; }
    if (this.currentView === 'payment') { await this.renderPaymentPage(); return; }

    await this.renderUserPlans(isPlatformAdmin);
  },

  // ==================== USER PLANS VIEW ====================
  async renderUserPlans(isPlatformAdmin) {
    let plans = [];
    try {
      const snap = await db.collection('plans').orderBy('price').get();
      plans = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) {}
    
    if (plans.length === 0) {
      plans = [
        { id:'starter', name:'Starter', price:999, period:'month', color:'#64748b', features:['Up to 500 contacts','WhatsApp Cloud API','1 Chatbot (Groq AI)','10 Campaigns/month','Email support','Basic Analytics'], modules:['dashboard','leads','contacts','chats','templates'], limits:{contacts:500,users:1,campaigns:10,messagesPerDay:100}, popular:false, trialDays:7 },
        { id:'advance', name:'Advance', price:2499, period:'month', color:'#6366f1', features:['Unlimited contacts','Advanced WhatsApp API','Unlimited chatbots','Unlimited campaigns','Drip sequences','Lead scoring','AI auto-replies','Priority support','All 22+ modules'], modules:['dashboard','leads','contacts','chats','campaigns','templates','flows','social','forms','kanban','knowledge','chatbot','appointments','tickets','analytics','reports','profile'], limits:{contacts:999999,users:5,campaigns:999,messagesPerDay:1000}, popular:true, trialDays:7 },
        { id:'professional', name:'Professional', price:9999, period:'month', color:'#8b5cf6', features:['Everything in Advance','White-label CRM','Custom integrations','REST API access','Advanced analytics','Team management (20 users)','Appointment system','E‑commerce hub','24/7 priority support'], modules:['dashboard','leads','contacts','chats','campaigns','templates','flows','social','forms','kanban','knowledge','chatbot','ecommerce','appointments','analytics','tickets','integrations','agents','clients','marketing','setup','reports','admin','profile'], limits:{contacts:999999,users:20,campaigns:999,messagesPerDay:10000}, popular:false, trialDays:7 },
        { id:'enterprise', name:'Enterprise', price:null, period:'custom', color:'#f59e0b', features:['Everything in Professional','Dedicated account manager','Custom AI model training','99.9% SLA guarantee','24/7 phone & priority support','Custom infrastructure','Unlimited everything','On-premise deployment option','Custom feature development'], modules:['dashboard','leads','contacts','chats','campaigns','templates','flows','social','forms','kanban','knowledge','chatbot','ecommerce','appointments','analytics','tickets','integrations','agents','clients','marketing','setup','reports','admin','profile'], limits:{contacts:999999,users:999,campaigns:999,messagesPerDay:999999}, popular:false, trialDays:7 },
      ];
    }

    this.plans = plans;
    const currentPlanId = user.plan || 'starter';
    const currentPlan = plans.find(p => p.id === currentPlanId) || plans[0];

    // Check trial status
    const trialEnd = user.trialEndsAt?.toDate?.();
    const isTrialActive = trialEnd && new Date() < trialEnd;
    const trialDaysLeft = isTrialActive ? Math.ceil((trialEnd - new Date()) / (1000*60*60*24)) : 0;

    // Usage stats (✅ clientId isolated)
    let usage = { contacts: 0, campaigns: 0, messages: 0, users: 0 };
    try {
      let cQuery = db.collection('contacts');
      if (shouldFilterByClient()) cQuery = cQuery.where('clientId', '==', user.clientId);
      usage.contacts = (await cQuery.get()).size;

      let campQuery = db.collection('campaigns');
      if (shouldFilterByClient()) campQuery = campQuery.where('clientId', '==', user.clientId);
      usage.campaigns = (await campQuery.get()).size;

      let mQuery = db.collection('messages');
      if (shouldFilterByClient()) mQuery = mQuery.where('clientId', '==', user.clientId);
      usage.messages = (await mQuery.get()).size;

      if (user.clientId) {
        usage.users = (await db.collection('users').where('clientId','==',user.clientId).get()).size;
      }
    } catch(e) {}

    const limits = currentPlan.limits || { contacts: 500, campaigns: 10, messages: 100, users: 1 };

    let html = `
      <style>
        .plan-wrap { max-width: 1300px; margin: 0 auto; }
        .plan-hero { background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%); border-radius: 24px; padding: 32px 36px; margin-bottom: 28px; color: #fff; position: relative; overflow: hidden; }
        .plan-hero::before { content: ''; position: absolute; top: -80px; right: -80px; width: 350px; height: 350px; background: radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%); border-radius: 50%; }
        .plan-hero::after { content: ''; position: absolute; bottom: -60px; left: 20%; width: 250px; height: 250px; background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%); border-radius: 50%; }
        .plan-hero h4 { margin: 0; font-weight: 800; font-size: 24px; position: relative; z-index: 1; }
        .plan-hero p { margin: 6px 0 0; color: #94a3b8; font-size: 14px; position: relative; z-index: 1; }
        .trial-banner { background: linear-gradient(135deg, #fef3c7, #fffbeb); border: 1px solid #fde68a; border-radius: 14px; padding: 14px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .trial-countdown { font-size: 14px; font-weight: 700; color: #92400e; }
        .trial-countdown span { background: #f59e0b; color: #fff; padding: 2px 10px; border-radius: 12px; margin: 0 2px; }
        .plan-usage-card { background: #fff; border-radius: 14px; padding: 18px 20px; border: 1px solid #f1f5f9; }
        .plan-usage-bar { height: 8px; border-radius: 10px; background: #f1f5f9; overflow: hidden; margin-top: 6px; }
        .plan-usage-fill { height: 100%; border-radius: 10px; transition: width 1s ease; }
        .plan-card { background: #fff; border-radius: 22px; padding: 34px 28px; border: 2px solid #e2e8f0; text-align: center; transition: all 0.3s; position: relative; height: 100%; display: flex; flex-direction: column; }
        .plan-card:hover { transform: translateY(-8px); box-shadow: 0 24px 50px rgba(0,0,0,0.1); }
        .plan-card.popular { border-color: #6366f1; box-shadow: 0 14px 40px rgba(99,102,241,0.18); }
        .plan-card.popular::before { content: '🔥 MOST POPULAR'; position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; padding: 7px 24px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 1px; white-space: nowrap; box-shadow: 0 4px 15px rgba(99,102,241,0.3); }
        .plan-card.current { border-color: #10b981; background: #f0fdf4; box-shadow: 0 8px 30px rgba(16,185,129,0.15); }
        .plan-card.current::before { content: '✓ YOUR PLAN'; position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: #10b981; color: #fff; padding: 7px 24px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 1px; white-space: nowrap; box-shadow: 0 4px 15px rgba(16,185,129,0.3); }
        .plan-name { font-size: 22px; font-weight: 800; margin-bottom: 6px; }
        .plan-price { font-size: 52px; font-weight: 800; margin: 18px 0 4px; line-height: 1; }
        .plan-price .currency { font-size: 26px; vertical-align: super; margin-right: 2px; }
        .plan-price .period { font-size: 13px; color: #94a3b8; font-weight: 400; display: block; }
        .plan-trial { font-size: 12px; color: #10b981; font-weight: 600; margin-top: 4px; }
        .plan-module-count { font-size: 11px; color: #64748b; margin-bottom: 16px; padding: 6px 12px; background: #f1f5f9; border-radius: 20px; display: inline-block; }
        .plan-feature-list { text-align: left; margin: 16px 0; flex: 1; }
        .plan-feature { display: flex; align-items: flex-start; gap: 10px; padding: 7px 0; font-size: 13px; color: #475569; border-bottom: 1px solid #f8fafc; }
        .plan-feature:last-child { border-bottom: none; }
        .plan-feature i { color: #10b981; font-size: 13px; margin-top: 2px; flex-shrink: 0; }
        .plan-btn { width: 100%; padding: 14px; border-radius: 14px; font-weight: 700; cursor: pointer; border: none; font-size: 15px; transition: all 0.25s; letter-spacing: 0.3px; }
        .plan-btn:hover { transform: scale(1.03); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
        .plan-btn-current { background: #f1f5f9; color: #64748b; cursor: default; }
        .plan-btn-current:hover { transform: none; box-shadow: none; }
        .plan-btn-upgrade { background: linear-gradient(135deg,#6366f1,#4f46e5); color: #fff; }
        .plan-btn-enterprise { background: linear-gradient(135deg,#f59e0b,#d97706); color: #fff; }
        .plan-btn-trial { background: linear-gradient(135deg,#10b981,#059669); color: #fff; }
        .plan-manage-btn { padding: 8px 18px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .plan-manage-btn-primary { background: #6366f1; color: #fff; }
        .plan-manage-btn-primary:hover { background: #4f46e5; }
        .plan-input { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13px; outline: none; margin-bottom: 8px; }
        .plan-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .gateway-card { background: #fff; border-radius: 14px; padding: 18px; border: 1px solid #f1f5f9; text-align: center; cursor: pointer; transition: 0.2s; }
        .gateway-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.06); border-color: #6366f1; }
        .gateway-card.selected { border-color: #6366f1; background: #eef2ff; }
        .gateway-icon { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #fff; margin: 0 auto 10px; }
        .secure-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; }
        @media (max-width: 768px) { .plan-hero { padding: 20px; } .plan-price { font-size: 38px; } }
      </style>

      <div class="plan-wrap">
        <div class="plan-hero">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h4><i class="fas fa-credit-card me-2"></i>Choose Your Plan</h4>
              <p>Current: <strong>${currentPlan.name}</strong> · All plans include 7-day free trial · Cancel anytime</p>
            </div>
            ${isPlatformAdmin ? `<button class="plan-manage-btn plan-manage-btn-primary" onclick="Plan.currentView='manage';Plan.render();"><i class="fas fa-cog"></i> Manage Plans</button>` : ''}
          </div>
        </div>

        <!-- Trial Banner -->
        ${isTrialActive ? `
          <div class="trial-banner">
            <div><i class="fas fa-clock text-warning me-2"></i><strong>Free Trial Active!</strong> Your ${currentPlan.name} trial ends soon.</div>
            <div class="trial-countdown"><span>${trialDaysLeft}</span> days left · <a href="#" onclick="Plan.currentView='payment';Plan.render();" style="color:#6366f1;font-weight:700;">Upgrade Now →</a></div>
          </div>
        ` : (currentPlan.price > 0 ? '' : `
          <div class="trial-banner">
            <div><i class="fas fa-gift text-warning me-2"></i><strong>Start your 7-day free trial</strong> on any paid plan — no credit card required!</div>
            <div><a href="#" onclick="Plan.scrollToPlans()" style="color:#6366f1;font-weight:700;">View Plans →</a></div>
          </div>
        `)}

        <!-- Usage -->
        <div class="row g-3 mb-4" id="plansSection">
          <div class="col-6 col-md-3">
            <div class="plan-usage-card">
              <div class="d-flex justify-content-between"><small class="text-muted">👥 Contacts</small><small style="font-weight:700;">${usage.contacts} / ${limits.contacts >= 999999 ? '∞' : limits.contacts.toLocaleString()}</small></div>
              <div class="plan-usage-bar"><div class="plan-usage-fill" style="width:${Math.min(100, (usage.contacts/(limits.contacts||1))*100)}%;background:#6366f1;"></div></div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="plan-usage-card">
              <div class="d-flex justify-content-between"><small class="text-muted">📢 Campaigns</small><small style="font-weight:700;">${usage.campaigns} / ${limits.campaigns >= 999 ? '∞' : limits.campaigns}</small></div>
              <div class="plan-usage-bar"><div class="plan-usage-fill" style="width:${Math.min(100, (usage.campaigns/(limits.campaigns||1))*100)}%;background:#10b981;"></div></div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="plan-usage-card">
              <div class="d-flex justify-content-between"><small class="text-muted">💬 Messages</small><small style="font-weight:700;">${usage.messages} / ${limits.messagesPerDay >= 999999 ? '∞' : limits.messagesPerDay.toLocaleString()}/day</small></div>
              <div class="plan-usage-bar"><div class="plan-usage-fill" style="width:${Math.min(100, (usage.messages/(limits.messagesPerDay||1))*100)}%;background:#f59e0b;"></div></div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="plan-usage-card">
              <div class="d-flex justify-content-between"><small class="text-muted">👤 Team</small><small style="font-weight:700;">${usage.users} / ${limits.users >= 999 ? '∞' : limits.users}</small></div>
              <div class="plan-usage-bar"><div class="plan-usage-fill" style="width:${Math.min(100, (usage.users/(limits.users||1))*100)}%;background:#8b5cf6;"></div></div>
            </div>
          </div>
        </div>

        <!-- Plans -->
        <div class="row g-4">
          ${plans.map(p => {
            const isCurrent = currentPlanId === p.id;
            return `
            <div class="col-xl-3 col-md-6">
              <div class="plan-card ${p.popular ? 'popular' : ''} ${isCurrent ? 'current' : ''}">
                <div class="plan-name" style="color:${p.color};">${p.name}</div>
                <div class="plan-module-count"><i class="fas fa-cubes me-1"></i> ${(p.modules||[]).length} Modules</div>
                <div class="plan-price" style="color:${p.color};">
                  ${p.price === null ? 'Custom' : `<span class="currency">₹</span>${p.price.toLocaleString()}`}
                  <span class="period">${p.period === 'custom' ? 'Contact us' : '/ ' + p.period}</span>
                </div>
                <div class="plan-trial"><i class="fas fa-clock"></i> ${p.trialDays || 7}-Day Free Trial</div>
                <div class="plan-feature-list">
                  ${(p.features||[]).slice(0, 7).map(f => `<div class="plan-feature"><i class="fas fa-check-circle"></i> ${f}</div>`).join('')}
                  ${(p.features||[]).length > 7 ? `<div class="plan-feature" style="color:#6366f1;font-weight:600;justify-content:center;">+ ${(p.features||[]).length - 7} more features</div>` : ''}
                </div>
                <button class="plan-btn ${isCurrent ? 'plan-btn-current' : p.price === null ? 'plan-btn-enterprise' : (isTrialActive ? 'plan-btn-trial' : 'plan-btn-upgrade')}" 
                  ${isCurrent ? 'disabled' : ''} 
                  onclick="${isCurrent ? '' : p.price === null ? "Plan.contactSales()" : "Plan.upgradePlan('${p.id}','${p.name}',${p.price||0},${p.trialDays||7})"}">
                  ${isCurrent ? '✓ Current Plan' : p.price === null ? '📞 Contact Sales' : isTrialActive ? '🎉 Continue with Trial' : '🚀 Start Free Trial'}
                </button>
              </div>
            </div>`;
          }).join('')}
        </div>

        <!-- Security & Trust -->
        <div style="text-align:center;margin-top:32px;padding:24px;background:#fff;border-radius:16px;border:1px solid #f1f5f9;">
          <h6 style="font-weight:700;">🔒 Secure Payments via Multiple Gateways</h6>
          <div class="d-flex justify-content-center gap-3 flex-wrap mt-3">
            ${this.paymentGateways.map(g => `
              <div class="secure-badge" style="background:#f8fafc;color:#475569;">
                <i class="fas ${g.icon}" style="color:${g.color};"></i> ${g.name}
              </div>
            `).join('')}
          </div>
          <p class="text-muted small mt-3 mb-0"><i class="fas fa-lock me-1"></i> All transactions secured with 256-bit encryption. Your payment data is never stored on our servers.</p>
        </div>

        <!-- FAQ -->
        <div style="text-align:center;margin-top:20px;padding:20px;">
          <div class="d-flex gap-3 justify-content-center flex-wrap">
            <button class="plan-manage-btn" style="background:#fff;border:1px solid #e2e8f0;" onclick="Plan.contactSales()"><i class="fas fa-headset"></i> Talk to Sales</button>
            <button class="plan-manage-btn" style="background:#fff;border:1px solid #e2e8f0;" onclick="Plan.toggleFAQ()"><i class="fas fa-question-circle"></i> FAQ</button>
          </div>
          <div id="planFAQ" style="display:none;max-width:600px;margin:16px auto;text-align:left;font-size:13px;color:#475569;">
            <p><strong>Q: Can I change my plan later?</strong><br>A: Yes! Upgrade or downgrade anytime. Unused time is credited.</p>
            <p><strong>Q: Is there a free trial?</strong><br>A: All plans come with a 7-day free trial. No credit card required.</p>
            <p><strong>Q: What payment methods are accepted?</strong><br>A: UPI, all major credit/debit cards, netbanking, wallets, and bank transfer.</p>
            <p><strong>Q: Can I cancel anytime?</strong><br>A: Absolutely. Cancel anytime with no questions asked.</p>
          </div>
        </div>
      </div>
      <div id="planModal"></div>
    `;
    contentArea.innerHTML = html;
  },

  scrollToPlans() { document.getElementById('plansSection')?.scrollIntoView({ behavior: 'smooth' }); },
  toggleFAQ() { const el = document.getElementById('planFAQ'); if(el) el.style.display = el.style.display === 'none' ? 'block' : 'none'; },

  // ==================== UPGRADE FLOW — Multi-Gateway Payment ====================
  upgradePlan(planId, planName, price, trialDays) {
    const user = window.currentUser || {};
    document.getElementById('planModal').innerHTML = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.innerHTML=''">
        <div style="background:#fff;border-radius:24px;padding:32px;width:520px;max-width:95vw;max-height:90vh;overflow-y:auto;text-align:center;" onclick="event.stopPropagation()">
          <i class="fas fa-rocket fa-3x" style="color:#6366f1;margin-bottom:12px;"></i>
          <h4 style="font-weight:800;">Upgrade to ${planName}</h4>
          <p style="font-size:32px;font-weight:800;color:#6366f1;margin:8px 0;">${price > 0 ? '₹'+price.toLocaleString() : 'Custom'}<span style="font-size:14px;color:#94a3b8;">/mo</span></p>
          <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;padding:10px;margin:12px 0;">
            <i class="fas fa-gift text-success"></i> <strong>${trialDays}-Day Free Trial</strong> — No charge until trial ends
          </div>

          <h6 style="font-weight:700;margin-top:16px;">Select Payment Gateway</h6>
          <div class="row g-2 mt-2">
            ${this.paymentGateways.map(g => `
              <div class="col-6">
                <div class="gateway-card ${g.connected ? '' : 'opacity-50'}" onclick="${g.connected ? "Plan.selectGateway('"+g.id+"')" : ''}" id="gw_${g.id}" style="${g.connected ? '' : 'cursor:not-allowed;'}">
                  <div class="gateway-icon" style="background:${g.color};"><i class="fas ${g.icon}"></i></div>
                  <strong style="font-size:13px;">${g.name}</strong>
                  <p style="font-size:10px;color:#64748b;margin:2px 0;">${g.desc}</p>
                  ${!g.connected ? '<span class="secure-badge" style="background:#fef2f2;color:#ef4444;">Coming Soon</span>' : ''}
                </div>
              </div>
            `).join('')}
          </div>
          <input type="hidden" id="selectedGateway" value="razorpay">

          <div style="background:#f8fafc;border-radius:12px;padding:14px;margin:12px 0;text-align:left;font-size:13px;">
            <p style="margin:2px 0;"><strong>Account:</strong> ${user.name||user.email}</p>
            <p style="margin:2px 0;"><strong>Plan:</strong> ${planName} · ₹${price.toLocaleString()}/mo</p>
            <p style="margin:2px 0;color:#10b981;"><strong>Trial:</strong> ${trialDays} days free, then ₹${price.toLocaleString()}/mo</p>
            <p style="margin:2px 0;color:#64748b;font-size:11px;">You can cancel anytime during the trial.</p>
          </div>

          <button class="plan-btn plan-btn-upgrade" style="width:100%;" onclick="Plan.processUpgrade('${planId}','${planName}')">
            <i class="fas fa-credit-card"></i> Start ${trialDays}-Day Free Trial
          </button>
          <button class="plan-btn" style="width:100%;margin-top:8px;background:#f1f5f9;border:none;font-size:13px;" onclick="document.getElementById('planModal').innerHTML=''">Cancel</button>
          <div class="d-flex justify-content-center gap-2 mt-3 flex-wrap">
            ${this.paymentGateways.filter(g=>g.connected).slice(0,4).map(g => `
              <span class="secure-badge" style="background:#f8fafc;color:#64748b;font-size:9px;"><i class="fas ${g.icon}" style="color:${g.color};"></i> ${g.name}</span>
            `).join('')}
          </div>
          <p class="text-muted small mt-2 mb-0"><i class="fas fa-lock"></i> Secured by 256-bit SSL encryption</p>
        </div></div>`;
  },

  selectGateway(gwId) {
    document.querySelectorAll('.gateway-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('gw_' + gwId)?.classList.add('selected');
    document.getElementById('selectedGateway').value = gwId;
    showToast(`✅ ${gwId} selected!`, 'success');
  },

  async processUpgrade(planId, planName) {
    const gateway = document.getElementById('selectedGateway')?.value || 'razorpay';
    const trialDays = 7;
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

    try {
      // Create billing record
      await db.collection('billing').add({
        userId: window.currentUser.uid,
        clientId: getCurrentClientId(),
        planId, planName,
        gateway,
        status: 'trial',
        trialEndsAt: firebase.firestore.Timestamp.fromDate(trialEndsAt),
        amount: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Update user
      await db.collection('users').doc(window.currentUser.uid).update({
        plan: planId,
        trialEndsAt: firebase.firestore.Timestamp.fromDate(trialEndsAt),
        planUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      window.currentUser.plan = planId;
      window.currentUser.trialEndsAt = trialEndsAt;
      document.getElementById('planModal').innerHTML = '';

      // Show success
      document.getElementById('planModal').innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.innerHTML='';Plan.render();">
          <div style="background:#fff;border-radius:24px;padding:36px;width:460px;max-width:92vw;text-align:center;" onclick="event.stopPropagation()">
            <i class="fas fa-check-circle fa-4x" style="color:#10b981;margin-bottom:12px;"></i>
            <h4 style="font-weight:800;">🎉 Trial Started!</h4>
            <p>You are now on <strong>${planName}</strong></p>
            <div style="background:#ecfdf5;border-radius:12px;padding:14px;margin:12px 0;">
              <strong>7-Day Free Trial</strong><br>
              <small>Ends on ${trialEndsAt.toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'})}</small>
            </div>
            <button class="plan-btn plan-btn-upgrade" style="width:100%;" onclick="document.getElementById('planModal').innerHTML='';Plan.render();">Go to Dashboard</button>
          </div></div>`;
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
  },

  // ==================== PAYMENT PAGE ====================
  async renderPaymentPage() {
    let html = `
      <div class="plan-wrap">
        <button class="plan-manage-btn mb-3" style="background:#fff;border:1px solid #e2e8f0;" onclick="Plan.currentView='plans';Plan.render();"><i class="fas fa-arrow-left"></i> Back</button>
        <h5 style="font-weight:700;">Payment Methods</h5>
        <div class="row g-3 mt-3">
          ${this.paymentGateways.map(g => `
            <div class="col-md-4"><div class="gateway-card"><div class="gateway-icon" style="background:${g.color};"><i class="fas ${g.icon}"></i></div><strong>${g.name}</strong><p style="font-size:11px;color:#64748b;">${g.desc}</p><span class="secure-badge" style="background:${g.connected?'#ecfdf5':'#fef2f2'};color:${g.connected?'#10b981':'#ef4444'};">${g.connected?'✓ Available':'Coming Soon'}</span></div></div>
          `).join('')}
        </div>
      </div>`;
    contentArea.innerHTML = html;
  },

  // ==================== PLAN MANAGER (Admin) ====================
  async renderPlanManager() {
    let plans = [];
    try { const s = await db.collection('plans').orderBy('price').get(); plans = s.docs.map(d=>({id:d.id,...d.data()})); } catch(e) {}
    let html = `
      <div class="plan-wrap">
        <button class="plan-manage-btn mb-3" style="background:#fff;border:1px solid #e2e8f0;" onclick="Plan.currentView='plans';Plan.render();"><i class="fas fa-arrow-left"></i> Back</button>
        <div class="d-flex justify-content-between mb-3">
          <h5 style="font-weight:700;">Manage Plans</h5>
          <div class="d-flex gap-2">
            <button class="plan-manage-btn" style="background:#fff;border:1px solid #e2e8f0;" onclick="Plan.currentView='gateways';Plan.render();"><i class="fas fa-plug"></i> Gateways</button>
            <button class="plan-manage-btn plan-manage-btn-primary" onclick="Plan.currentView='edit';Plan.editPlanId=null;Plan.render();"><i class="fas fa-plus"></i> Add Plan</button>
          </div>
        </div>
        <div style="background:#fff;border-radius:16px;padding:20px;border:1px solid #f1f5f9;"><div class="table-responsive"><table class="table"><thead><tr><th>Plan</th><th>Price</th><th>Modules</th><th>Users</th><th>Contacts</th><th>Trial</th><th>Popular</th><th>Actions</th></tr></thead><tbody>
          ${plans.length===0?'<tr><td colspan="8" class="text-muted text-center">No plans</td></tr>':plans.map(p=>`
            <tr><td><strong>${p.name}</strong></td><td>${p.price===null?'Custom':'₹'+p.price}</td><td>${(p.modules||[]).length}</td><td>${p.limits?.users||'-'}</td><td>${p.limits?.contacts||'-'}</td><td>${p.trialDays||7}d</td><td>${p.popular?'⭐':''}</td>
            <td><button class="plan-manage-btn btn-sm" style="background:#fff;border:1px solid #e2e8f0;" onclick="Plan.currentView='edit';Plan.editPlanId='${p.id}';Plan.render();"><i class="fas fa-edit"></i></button>
            <button class="plan-manage-btn btn-sm" style="background:#fef2f2;color:#ef4444;border:none;" onclick="Plan.deletePlan('${p.id}')"><i class="fas fa-trash"></i></button></td></tr>
          `).join('')}
        </tbody></table></div></div>
      </div>`;
    contentArea.innerHTML = html;
  },

  async renderPlanEditor() {
    const editId = this.editPlanId;
    let data = { name:'', price:0, period:'month', color:'#6366f1', features:[], modules:['dashboard','leads','contacts','chats'], limits:{contacts:500,users:1,campaigns:10,messagesPerDay:100}, popular:false, trialDays:7 };
    if (editId) { const d = await db.collection('plans').doc(editId).get(); if(d.exists) data = {...data,...d.data()}; }

    const allModules = ['dashboard','leads','contacts','chats','campaigns','templates','flows','social','forms','kanban','knowledge','chatbot','ecommerce','appointments','analytics','tickets','integrations','agents','clients','marketing','setup','reports','admin','profile'];
    
    let html = `
      <div class="plan-wrap">
        <button class="plan-manage-btn mb-3" style="background:#fff;border:1px solid #e2e8f0;" onclick="Plan.currentView='manage';Plan.render();"><i class="fas fa-arrow-left"></i> Back</button>
        <div style="background:#fff;border-radius:16px;padding:24px;border:1px solid #f1f5f9;max-width:800px;">
          <h5 style="font-weight:700;">${editId?'Edit':'Create'} Plan</h5>
          <div class="row g-2">
            <div class="col-md-4"><label class="small fw-bold">Plan Name</label><input id="pName" class="plan-input" value="${data.name}"></div>
            <div class="col-md-3"><label class="small fw-bold">Price (₹, 0=Free)</label><input type="number" id="pPrice" class="plan-input" value="${data.price||0}"></div>
            <div class="col-md-2"><label class="small fw-bold">Period</label><select id="pPeriod" class="plan-input"><option value="month" ${data.period==='month'?'selected':''}>Month</option><option value="year" ${data.period==='year'?'selected':''}>Year</option><option value="custom" ${data.period==='custom'?'selected':''}>Custom</option></select></div>
            <div class="col-md-3"><label class="small fw-bold">Trial Days</label><input type="number" id="pTrial" class="plan-input" value="${data.trialDays||7}"></div>
            <div class="col-md-3"><label class="small fw-bold">Color</label><input type="color" id="pColor" class="plan-input" value="${data.color||'#6366f1'}"></div>
            <div class="col-md-2"><label class="small fw-bold">Max Users</label><input type="number" id="pUsers" class="plan-input" value="${data.limits?.users||1}"></div>
            <div class="col-md-2"><label class="small fw-bold">Max Contacts</label><input type="number" id="pContacts" class="plan-input" value="${data.limits?.contacts||500}"></div>
            <div class="col-md-2"><label class="small fw-bold">Max Campaigns</label><input type="number" id="pCampaigns" class="plan-input" value="${data.limits?.campaigns||10}"></div>
            <div class="col-md-3"><label class="small fw-bold">Max Msg/Day</label><input type="number" id="pMessages" class="plan-input" value="${data.limits?.messagesPerDay||100}"></div>
            <div class="col-md-2"><label class="small fw-bold">&nbsp;</label><label style="display:flex;align-items:center;gap:8px;margin-top:4px;"><input type="checkbox" id="pPopular" ${data.popular?'checked':''}> Popular</label></div>
            <div class="col-12"><label class="small fw-bold">Included Modules</label><div style="display:flex;flex-wrap:wrap;gap:4px;max-height:120px;overflow-y:auto;">${allModules.map(m=>`<label style="font-size:11px;padding:4px 8px;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;display:flex;align-items:center;gap:4px;"><input type="checkbox" class="pModule" value="${m}" ${(data.modules||[]).includes(m)?'checked':''}> ${m}</label>`).join('')}</div></div>
            <div class="col-12"><label class="small fw-bold">Features (one per line)</label><textarea id="pFeatures" class="plan-input" rows="6">${(data.features||[]).join('\n')}</textarea></div>
          </div>
          <div class="d-flex gap-2 mt-3">
            <button class="plan-manage-btn plan-manage-btn-primary" onclick="Plan.savePlan('${editId||''}')"><i class="fas fa-save"></i> Save Plan</button>
            <button class="plan-manage-btn" style="background:#fff;border:1px solid #e2e8f0;" onclick="Plan.currentView='manage';Plan.render();">Cancel</button>
          </div>
        </div>
      </div>`;
    contentArea.innerHTML = html;
  },

  async savePlan(editId) {
    const name = document.getElementById('pName')?.value?.trim();
    if (!name) return showToast('Plan name required!', 'warning');
    const data = {
      name, price: parseInt(document.getElementById('pPrice')?.value)||0,
      period: document.getElementById('pPeriod')?.value||'month',
      trialDays: parseInt(document.getElementById('pTrial')?.value)||7,
      color: document.getElementById('pColor')?.value||'#6366f1',
      features: (document.getElementById('pFeatures')?.value||'').split('\n').map(f=>f.trim()).filter(Boolean),
      modules: Array.from(document.querySelectorAll('.pModule:checked')).map(cb=>cb.value),
      limits: { users: parseInt(document.getElementById('pUsers')?.value)||1, contacts: parseInt(document.getElementById('pContacts')?.value)||500, campaigns: parseInt(document.getElementById('pCampaigns')?.value)||10, messagesPerDay: parseInt(document.getElementById('pMessages')?.value)||100 },
      popular: document.getElementById('pPopular')?.checked||false,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    try {
      if (editId) { await db.collection('plans').doc(editId).update(data); }
      else { data.createdAt = firebase.firestore.FieldValue.serverTimestamp(); await db.collection('plans').add(data); }
      showToast('✅ Plan saved!', 'success');
      this.currentView = 'manage'; this.render();
    } catch(e) { showToast('Error: '+e.message, 'error'); }
  },

  async deletePlan(id) { if (!confirm('Delete?')) return; await db.collection('plans').doc(id).delete(); showToast('Deleted.', 'info'); this.render(); },

  // ==================== GATEWAY MANAGER ====================
  async renderGatewayManager() {
    let html = `
      <div class="plan-wrap">
        <button class="plan-manage-btn mb-3" style="background:#fff;border:1px solid #e2e8f0;" onclick="Plan.currentView='manage';Plan.render();"><i class="fas fa-arrow-left"></i> Back</button>
        <h5 style="font-weight:700;">Payment Gateway Configuration</h5>
        <p class="text-muted small">Enable and configure payment gateways for your clients</p>
        <div class="row g-3 mt-3">
          ${this.paymentGateways.map(g => `
            <div class="col-md-6">
              <div style="background:#fff;border-radius:14px;padding:18px;border:1px solid #f1f5f9;">
                <div class="d-flex justify-content-between align-items-center">
                  <div class="d-flex align-items-center gap-3">
                    <div class="gateway-icon" style="width:44px;height:44px;font-size:18px;background:${g.color};"><i class="fas ${g.icon}"></i></div>
                    <div><strong>${g.name}</strong><br><small class="text-muted">${g.desc}</small></div>
                  </div>
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" ${g.connected?'checked':''} onchange="Plan.toggleGateway('${g.id}',this.checked)">
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;
    contentArea.innerHTML = html;
  },

  async toggleGateway(gwId, enabled) {
    showToast(`${gwId} ${enabled?'enabled':'disabled'}.`, 'info');
  },

  // ==================== CONTACT SALES ====================
  contactSales() {
    document.getElementById('planModal').innerHTML = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.innerHTML=''">
        <div style="background:#fff;border-radius:20px;padding:28px;width:460px;max-width:92vw;" onclick="event.stopPropagation()">
          <h5 style="font-weight:700;"><i class="fas fa-headset me-2"></i>Contact Sales</h5>
          <p class="text-muted small">Our team will reach out within 24 hours.</p>
          <input id="salesName" class="plan-input" placeholder="Your Name" value="${window.currentUser?.name||''}">
          <input id="salesEmail" class="plan-input" placeholder="Email" value="${window.currentUser?.email||''}">
          <input id="salesPhone" class="plan-input" placeholder="Phone">
          <select id="salesPlan" class="plan-input"><option>Enterprise</option><option>Professional</option><option>Advance</option></select>
          <textarea id="salesMsg" class="plan-input" rows="3" placeholder="Tell us about your requirements..."></textarea>
          <button class="plan-btn plan-btn-enterprise w-100 mt-2" onclick="Plan.submitSalesInquiry()"><i class="fas fa-paper-plane"></i> Submit</button>
          <button class="plan-btn w-100 mt-2" style="background:#f1f5f9;border:none;" onclick="document.getElementById('planModal').innerHTML=''">Cancel</button>
        </div></div>`;
  },

  async submitSalesInquiry() {
    const data = {
      name: document.getElementById('salesName')?.value||'',
      email: document.getElementById('salesEmail')?.value||'',
      phone: document.getElementById('salesPhone')?.value||'',
      plan: document.getElementById('salesPlan')?.value||'',
      message: document.getElementById('salesMsg')?.value||'',
      userId: window.currentUser?.uid,
      clientId: getCurrentClientId(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection('sales_inquiries').add(data);
    document.getElementById('planModal').innerHTML = '';
    showToast('✅ Inquiry submitted! We will contact you soon.', 'success');
  }
};
