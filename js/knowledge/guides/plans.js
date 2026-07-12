// js/knowledge/guides/plans.js — Subscription & Plans Guide
const PlansGuide = {
  guideId: 'plans',

  async render(context) {
    const { guide, userProgress = 0, isBookmarked = false, getAdjacentGuide } = context;
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = '#f8fafc';
    if (userProgress === 0) { try { await this.markInProgress(); } catch (e) {} }
    const isCompleted = userProgress >= 100;
    const prevGuide = getAdjacentGuide ? getAdjacentGuide('prev') : null;
    const nextGuide = getAdjacentGuide ? getAdjacentGuide('next') : null;

    let html = `
      <style>
        .gd-wrap { max-width: 1100px; margin: 0 auto; padding: 0 16px; }
        .gd-back-row { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
        .gd-back-btn { padding: 9px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid #e2e8f0; background: #fff; color: #475569; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .gd-back-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }
        .gd-breadcrumb { font-size: 12px; color: #94a3b8; display: flex; align-items: center; gap: 6px; }
        .gd-breadcrumb span { cursor: pointer; transition: color 0.2s; } .gd-breadcrumb span:hover { color: #f59e0b; }
        .gd-hero { background: #fff; border-radius: 20px; padding: 36px 32px; margin-bottom: 24px; border: 1px solid #f1f5f9; position: relative; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #f59e0b, #d97706, #f59e0b); }
        .gd-hero-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #fff; margin-bottom: 16px; background: linear-gradient(135deg, #f59e0b, #d97706); }
        .gd-hero h3 { font-weight: 900; font-size: 28px; margin: 0 0 10px; color: #0f172a; line-height: 1.3; }
        .gd-hero p { color: #64748b; font-size: 15px; margin: 0; max-width: 700px; line-height: 1.7; }
        .gd-hero-meta { display: flex; gap: 18px; margin-top: 18px; flex-wrap: wrap; align-items: center; }
        .gd-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; } .gd-meta-item i { color: #f59e0b; font-size: 14px; }
        .gd-hero-actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
        .gd-btn { padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .gd-btn-primary { background: #f59e0b; color: #fff; } .gd-btn-primary:hover { background: #d97706; transform: scale(1.03); }
        .gd-btn-outline { background: #fff; color: #f59e0b; border: 1px solid #f59e0b; } .gd-btn-outline:hover { background: #fef3c7; }
        .gd-btn-success { background: #10b981; color: #fff; } .gd-btn-success:hover { background: #059669; transform: scale(1.03); }
        .gd-btn-completed { background: #d1d5db; color: #fff; cursor: default; } .gd-btn-completed:hover { transform: none; }
        .gd-content-card { background: #fff; border-radius: 20px; padding: 32px; margin-bottom: 20px; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-content-card h4 { font-weight: 800; font-size: 20px; margin: 0 0 8px; color: #0f172a; }
        .gd-content-card .gd-subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
        .gd-overview { background: #fef3c7; border-radius: 14px; padding: 20px 24px; margin-bottom: 28px; border-left: 4px solid #f59e0b; }
        .gd-overview p { margin: 0; font-size: 14px; color: #92400e; line-height: 1.8; }
        .gd-section-title { font-weight: 800; font-size: 18px; color: #0f172a; margin: 28px 0 16px; display: flex; align-items: center; gap: 8px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9; }
        .gd-step { display: flex; gap: 16px; padding: 20px 0; border-bottom: 1px solid #f1f5f9; align-items: flex-start; }
        .gd-step:last-child { border-bottom: none; }
        .gd-step-num { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #f59e0b, #d97706); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 17px; flex-shrink: 0; }
        .gd-step-content { flex: 1; } .gd-step-content h6 { font-weight: 700; font-size: 15px; margin: 0 0 4px; color: #0f172a; }
        .gd-step-content p { font-size: 14px; color: #475569; margin: 0; line-height: 1.7; }
        .gd-plan-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin: 14px 0; }
        .gd-plan-card { border-radius: 14px; padding: 20px; border: 2px solid #e2e8f0; background: #fff; position: relative; }
        .gd-plan-card.popular { border-color: #f59e0b; background: #fffbeb; }
        .gd-plan-card.popular::after { content: 'MOST POPULAR'; position: absolute; top: -12px; right: 16px; background: #f59e0b; color: #fff; padding: 4px 14px; border-radius: 20px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; }
        .gd-plan-card h6 { font-weight: 800; font-size: 16px; margin: 0 0 4px; } .gd-plan-card .gd-price { font-size: 24px; font-weight: 900; color: #f59e0b; }
        .gd-plan-card ul { margin: 14px 0 0; padding-left: 18px; } .gd-plan-card li { font-size: 12px; color: #475569; margin-bottom: 4px; }
        .gd-tips-card { background: linear-gradient(135deg, #fef3c7, #fffbeb); border-radius: 16px; padding: 22px 26px; margin-top: 24px; border: 1px solid #fcd34d; }
        .gd-tips-card h5 { font-weight: 800; color: #92400e; margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
        .gd-tips-card ul { margin: 0; padding-left: 20px; } .gd-tips-card li { font-size: 13px; color: #a16207; margin-bottom: 6px; line-height: 1.6; } .gd-tips-card li:last-child { margin-bottom: 0; }
        .gd-related { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
        .gd-related-pill { padding: 9px 18px; border-radius: 20px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 13px; cursor: pointer; transition: 0.2s; color: #475569; display: inline-flex; align-items: center; gap: 6px; }
        .gd-related-pill:hover { background: #fef3c7; border-color: #f59e0b; color: #f59e0b; }
        .gd-upsell { background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 18px; padding: 28px 32px; margin-top: 28px; border: 1px solid #c7d2fe; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .gd-upsell h5 { font-weight: 800; color: #3730a3; margin: 0; font-size: 18px; } .gd-upsell p { color: #4f46e5; margin: 4px 0 0; font-size: 14px; }
        .gd-nav-btns { display: flex; justify-content: space-between; margin-top: 32px; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 768px) { .gd-hero { padding: 24px 18px; } .gd-hero h3 { font-size: 22px; } .gd-content-card { padding: 20px 16px; } .gd-step { flex-direction: column; gap: 10px; } .gd-plan-grid { grid-template-columns: 1fr; } .gd-upsell { flex-direction: column; text-align: center; } .gd-nav-btns { flex-direction: column; align-items: stretch; } }
      </style>

      <div class="gd-wrap">
        <div class="gd-back-row">
          <button class="gd-back-btn" onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();"><i class="fas fa-arrow-left"></i> Back to All Guides</button>
          <div class="gd-breadcrumb"><span onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();">📖 Platform Documentation</span><i class="fas fa-chevron-right" style="font-size:10px;"></i><span style="color:#f59e0b;font-weight:600;">Subscription & Plans</span></div>
        </div>

        <div class="gd-hero">
          <div class="gd-hero-icon"><i class="fas fa-credit-card"></i></div>
          <h3>Subscription & Plans — Choose What's Right for You</h3>
          <p>Understand all pricing plans, features, billing cycles, and payment methods. Start small, upgrade as you grow — with no data loss and prorated billing.</p>
          <div class="gd-hero-meta">
            <div class="gd-meta-item"><i class="fas fa-signal"></i> 🟢 Beginner</div>
            <div class="gd-meta-item"><i class="fas fa-clock"></i> 5 min read</div>
            <div class="gd-meta-item"><i class="fas fa-layer-group"></i> 5 Steps</div>
            <div class="gd-meta-item"><i class="fas fa-globe"></i> Updated: Jul 2026</div>
          </div>
          <div class="gd-hero-actions">
            ${isCompleted ? `<button class="gd-btn gd-btn-completed"><i class="fas fa-check-circle"></i> Completed ✓</button>` : `<button class="gd-btn gd-btn-success" onclick="PlansGuide.triggerComplete()"><i class="fas fa-check"></i> Mark as Complete</button>`}
            <button class="gd-btn gd-btn-outline" onclick="PlatformDocs.toggleBookmark('plans');PlatformDocs.currentGuide='plans';PlatformDocs.render();"><i class="fas ${isBookmarked ? 'fa-star' : 'fa-star'}"></i> ${isBookmarked ? 'Bookmarked' : 'Bookmark'}</button>
            <button class="gd-btn gd-btn-outline" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
          </div>
        </div>

        <div class="gd-content-card">
          <h4>💳 Find the Perfect Plan for Your Business</h4>
          <p class="gd-subtitle">Start with our free plan and upgrade when you need more power. No data loss, prorated billing, cancel anytime.</p>
          <div class="gd-overview"><p>We believe in growing with you. <strong>Start with the Free plan</strong> to explore all features risk-free for 14 days. As your business grows, upgrade to a plan that matches your needs. <strong>All your data stays intact</strong> when you upgrade or downgrade. Billing is transparent — no hidden fees, prorated upgrades, and you can cancel anytime.</p></div>

          <div class="gd-section-title"><i class="fas fa-balance-scale" style="color:#f59e0b;"></i> Plan Comparison</div>
          <div class="gd-plan-grid">
            <div class="gd-plan-card">
              <h6>🆓 Free</h6>
              <div class="gd-price">₹0</div><p style="font-size:11px;color:#64748b;">Forever free</p>
              <ul>
                <li>500 Contacts</li><li>1 User</li><li>5 Campaigns/month</li><li>WhatsApp Web (1 agent)</li><li>3 Forms</li><li>2 Automation Flows</li><li>3 Integrations</li><li>Basic Reports (CSV export)</li><li>100 AI responses/month</li>
              </ul>
            </div>
            <div class="gd-plan-card popular">
              <h6>⭐ Starter</h6>
              <div class="gd-price">₹999</div><p style="font-size:11px;color:#64748b;">/month</p>
              <ul>
                <li>5,000 Contacts</li><li>3 Users</li><li>50 Campaigns/month</li><li>WhatsApp Cloud API</li><li>10 Forms</li><li>10 Automation Flows</li><li>10 Integrations</li><li>Advanced Reports (PDF export)</li><li>1,000 AI responses/month</li><li>Email support</li>
              </ul>
            </div>
            <div class="gd-plan-card">
              <h6>💎 Pro</h6>
              <div class="gd-price">₹2,499</div><p style="font-size:11px;color:#64748b;">/month</p>
              <ul>
                <li>Unlimited Contacts</li><li>Unlimited Users</li><li>Unlimited Campaigns</li><li>WhatsApp Cloud API + Chatbot</li><li>Unlimited Forms</li><li>Unlimited Flows</li><li>Unlimited Integrations</li><li>Custom Reports + API Access</li><li>10,000 AI responses/month</li><li>Priority support (24/7)</li><li>White-label branding</li><li>Client management</li>
              </ul>
            </div>
            <div class="gd-plan-card">
              <h6>🏢 Enterprise</h6>
              <div class="gd-price">Custom</div><p style="font-size:11px;color:#64748b;">Contact us</p>
              <ul>
                <li>Everything in Pro</li><li>Dedicated server</li><li>Custom integrations</li><li>SLA guarantee (99.9% uptime)</li><li>Dedicated account manager</li><li>Custom AI model training</li><li>On-premise deployment option</li><li>Volume discounts</li>
              </ul>
            </div>
          </div>

          <div class="gd-section-title"><i class="fas fa-list-ol" style="color:#f59e0b;"></i> Plan Management Steps</div>
          
          <div class="gd-step"><div class="gd-step-num">1</div><div class="gd-step-content"><h6>Upgrading Your Plan</h6><p>Go to <strong>Settings → Subscription → Upgrade</strong>. Choose your new plan (Starter, Pro, or Enterprise). Enter payment details. <strong>Upgrade is instant</strong> — all limits are lifted immediately. <strong>Prorated billing:</strong> If you upgrade mid-cycle, you only pay the difference for the remaining days. Example: On Starter (₹999/mo), upgrade to Pro (₹2,499/mo) on day 15 → pay only ₹750 for the remaining 15 days. All your data, campaigns, and settings remain exactly as they were.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">2</div><div class="gd-step-content"><h6>Annual Plans — Save 20%</h6><p>Switch to annual billing and <strong>save 20%</strong> compared to monthly: Free (always free), Starter Annual: ₹9,590/year (₹799/mo equivalent), Pro Annual: ₹23,990/year (₹1,999/mo equivalent). Annual plans are billed once upfront. Perfect for established businesses that want to set it and forget it. You still get all the same features — just at a better price. Upgrade from monthly to annual anytime — the discount applies immediately.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">3</div><div class="gd-step-content"><h6>Billing & Invoices</h6><p>View all invoices in <strong>Settings → Billing</strong>. Download as PDF — <strong>GST-compliant invoices</strong> for Indian businesses (includes GST number, HSN code, and tax breakdown). <strong>Payment methods accepted:</strong> Credit/Debit cards (Visa, Mastercard, Rupay), UPI (Google Pay, PhonePe, Paytm), Net Banking (50+ banks), Wallets (Paytm, Amazon Pay). International payments via Stripe. <strong>Auto-renewal</strong> is on by default — charges your saved method on the billing date. Toggle off anytime to switch to manual payment.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">4</div><div class="gd-step-content"><h6>Downgrading Your Plan</h6><p>You can downgrade anytime. <strong>Changes apply at the next billing cycle</strong> — you continue with your current plan's features until the current period ends. <strong>Data is preserved</strong> — your contacts, campaigns, and settings are NOT deleted when you downgrade. However, some features become locked: e.g., if you had 10,000 contacts on Pro and downgrade to Starter (5,000 limit), you can still see all contacts but cannot add new ones until you're under the limit. Export data before downgrading if needed.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">5</div><div class="gd-step-content"><h6>Cancellation & Data Export</h6><p>You can cancel your subscription anytime from <strong>Settings → Subscription → Cancel</strong>. Your account remains active until the end of the current billing period — no immediate cutoff. <strong>Before cancelling:</strong> Export all your data (Settings → Data → Export All) — contacts, leads, campaigns, analytics. After cancellation, your data is retained for <strong>30 days</strong> in case you change your mind. After 30 days, data is permanently deleted per our privacy policy. Reactivate anytime within those 30 days — all data will be as you left it.</p></div></div>

          <div class="gd-tips-card">
            <h5><i class="fas fa-lightbulb" style="color:#f59e0b;"></i> Pro Tips</h5>
            <ul>
              <li><strong>Start with the 14-day free trial of Pro</strong> — experience all features before deciding. No credit card required.</li>
              <li><strong>Annual plans save 20%</strong> — if you're committed to growing your business, annual billing is the smart financial choice.</li>
              <li><strong>You can switch plans anytime without losing data</strong> — all your contacts, campaigns, and settings remain intact.</li>
              <li><strong>Contact support for custom Enterprise plans</strong> — dedicated servers, custom SLAs, and volume discounts available.</li>
            </ul>
          </div>

          <h5 style="font-weight:700;margin-top:28px;color:#0f172a;">🔗 Related Guides</h5>
          <div class="gd-related">
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('settings')">⚙️ Settings & Profile</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('dashboard')">📊 Dashboard Overview</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('getting-started')">🚀 Getting Started</span>
          </div>
        </div>

        <div class="gd-upsell"><div><h5>🚀 Ready to Upgrade?</h5><p>Unlock unlimited contacts, campaigns, AI chatbots, white-label branding, and 24/7 priority support with Pro.</p></div><button class="gd-btn gd-btn-primary" onclick="Plan.render()"><i class="fas fa-crown"></i> Compare Plans & Upgrade</button></div>

        <div class="gd-nav-btns">
          <div>${prevGuide ? `<button class="gd-btn gd-btn-outline" onclick="PlatformDocs.openGuide('${prevGuide.id}')"><i class="fas fa-arrow-left"></i> Previous: ${prevGuide.title}</button>` : ''}</div>
          <div>${nextGuide ? `<button class="gd-btn gd-btn-primary" onclick="PlatformDocs.openGuide('${nextGuide.id}')">Next: ${nextGuide.title} <i class="fas fa-arrow-right"></i></button>` : ''}</div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
    contentArea.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  triggerComplete() {
    PlatformDocs.markComplete('plans');
    PlatformDocs.currentGuide = 'plans';
    PlatformDocs.render();
    if (typeof showToast === 'function') showToast('✅ Guide completed!', 'success');
  },

  async markInProgress() {
    try {
      if (!window.currentUser?.uid) return;
      const docRef = db.collection('user_progress').doc(window.currentUser.uid);
      const doc = await docRef.get();
      let pg = {};
      if (doc.exists && doc.data().platformGuides) pg = doc.data().platformGuides;
      if (!pg['plans'] || pg['plans'] < 10) {
        pg['plans'] = 10;
        await docRef.set({ platformGuides: pg, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    } catch (e) { console.error('Progress error:', e); }
  }
};
window.PlansGuide = PlansGuide;