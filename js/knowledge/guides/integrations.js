// js/knowledge/guides/integrations.js — Integrations Hub Guide
const IntegrationsGuide = {
  guideId: 'integrations',

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
        .gd-breadcrumb span { cursor: pointer; transition: color 0.2s; } .gd-breadcrumb span:hover { color: #7c3aed; }
        .gd-hero { background: #fff; border-radius: 20px; padding: 36px 32px; margin-bottom: 24px; border: 1px solid #f1f5f9; position: relative; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #7c3aed, #6d28d9, #7c3aed); }
        .gd-hero-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #fff; margin-bottom: 16px; background: linear-gradient(135deg, #7c3aed, #6d28d9); }
        .gd-hero h3 { font-weight: 900; font-size: 28px; margin: 0 0 10px; color: #0f172a; line-height: 1.3; }
        .gd-hero p { color: #64748b; font-size: 15px; margin: 0; max-width: 700px; line-height: 1.7; }
        .gd-hero-meta { display: flex; gap: 18px; margin-top: 18px; flex-wrap: wrap; align-items: center; }
        .gd-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; } .gd-meta-item i { color: #7c3aed; font-size: 14px; }
        .gd-hero-actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
        .gd-btn { padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .gd-btn-primary { background: #7c3aed; color: #fff; } .gd-btn-primary:hover { background: #6d28d9; transform: scale(1.03); }
        .gd-btn-outline { background: #fff; color: #7c3aed; border: 1px solid #7c3aed; } .gd-btn-outline:hover { background: #f5f3ff; }
        .gd-btn-success { background: #10b981; color: #fff; } .gd-btn-success:hover { background: #059669; transform: scale(1.03); }
        .gd-btn-completed { background: #d1d5db; color: #fff; cursor: default; } .gd-btn-completed:hover { transform: none; }
        .gd-content-card { background: #fff; border-radius: 20px; padding: 32px; margin-bottom: 20px; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-content-card h4 { font-weight: 800; font-size: 20px; margin: 0 0 8px; color: #0f172a; }
        .gd-content-card .gd-subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
        .gd-overview { background: #f5f3ff; border-radius: 14px; padding: 20px 24px; margin-bottom: 28px; border-left: 4px solid #7c3aed; }
        .gd-overview p { margin: 0; font-size: 14px; color: #4c1d95; line-height: 1.8; }
        .gd-section-title { font-weight: 800; font-size: 18px; color: #0f172a; margin: 28px 0 16px; display: flex; align-items: center; gap: 8px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9; }
        .gd-step { display: flex; gap: 16px; padding: 20px 0; border-bottom: 1px solid #f1f5f9; align-items: flex-start; }
        .gd-step:last-child { border-bottom: none; }
        .gd-step-num { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #7c3aed, #6d28d9); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 17px; flex-shrink: 0; }
        .gd-step-content { flex: 1; } .gd-step-content h6 { font-weight: 700; font-size: 15px; margin: 0 0 4px; color: #0f172a; }
        .gd-step-content p { font-size: 14px; color: #475569; margin: 0; line-height: 1.7; }
        .gd-int-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin: 14px 0; }
        .gd-int-card { border-radius: 10px; padding: 14px; border: 1px solid #e2e8f0; background: #f8fafc; text-align: center; }
        .gd-int-card i { font-size: 22px; margin-bottom: 6px; color: #7c3aed; } .gd-int-card h6 { font-weight: 700; font-size: 11px; margin: 0; }
        .gd-tips-card { background: linear-gradient(135deg, #fef3c7, #fffbeb); border-radius: 16px; padding: 22px 26px; margin-top: 24px; border: 1px solid #fcd34d; }
        .gd-tips-card h5 { font-weight: 800; color: #92400e; margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
        .gd-tips-card ul { margin: 0; padding-left: 20px; } .gd-tips-card li { font-size: 13px; color: #a16207; margin-bottom: 6px; line-height: 1.6; } .gd-tips-card li:last-child { margin-bottom: 0; }
        .gd-related { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
        .gd-related-pill { padding: 9px 18px; border-radius: 20px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 13px; cursor: pointer; transition: 0.2s; color: #475569; display: inline-flex; align-items: center; gap: 6px; }
        .gd-related-pill:hover { background: #f5f3ff; border-color: #7c3aed; color: #7c3aed; }
        .gd-upsell { background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 18px; padding: 28px 32px; margin-top: 28px; border: 1px solid #c7d2fe; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .gd-upsell h5 { font-weight: 800; color: #3730a3; margin: 0; font-size: 18px; } .gd-upsell p { color: #4f46e5; margin: 4px 0 0; font-size: 14px; }
        .gd-nav-btns { display: flex; justify-content: space-between; margin-top: 32px; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 768px) { .gd-hero { padding: 24px 18px; } .gd-hero h3 { font-size: 22px; } .gd-content-card { padding: 20px 16px; } .gd-step { flex-direction: column; gap: 10px; } .gd-int-grid { grid-template-columns: 1fr 1fr; } .gd-upsell { flex-direction: column; text-align: center; } .gd-nav-btns { flex-direction: column; align-items: stretch; } }
      </style>

      <div class="gd-wrap">
        <div class="gd-back-row">
          <button class="gd-back-btn" onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();"><i class="fas fa-arrow-left"></i> Back to All Guides</button>
          <div class="gd-breadcrumb"><span onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();">📖 Platform Documentation</span><i class="fas fa-chevron-right" style="font-size:10px;"></i><span style="color:#7c3aed;font-weight:600;">Integrations Hub</span></div>
        </div>

        <div class="gd-hero">
          <div class="gd-hero-icon"><i class="fas fa-puzzle-piece"></i></div>
          <h3>Integrations Hub — Connect Your Entire Tech Stack</h3>
          <p>Connect 30+ third-party tools — payment gateways, email platforms, accounting software, and more. Make your CRM the central hub of your business operations.</p>
          <div class="gd-hero-meta">
            <div class="gd-meta-item"><i class="fas fa-signal"></i> 🔴 Advanced</div>
            <div class="gd-meta-item"><i class="fas fa-clock"></i> 8 min read</div>
            <div class="gd-meta-item"><i class="fas fa-layer-group"></i> 5 Steps</div>
            <div class="gd-meta-item"><i class="fas fa-globe"></i> Updated: Jul 2026</div>
          </div>
          <div class="gd-hero-actions">
            ${isCompleted ? `<button class="gd-btn gd-btn-completed"><i class="fas fa-check-circle"></i> Completed ✓</button>` : `<button class="gd-btn gd-btn-success" onclick="IntegrationsGuide.triggerComplete()"><i class="fas fa-check"></i> Mark as Complete</button>`}
            <button class="gd-btn gd-btn-outline" onclick="PlatformDocs.toggleBookmark('integrations');PlatformDocs.currentGuide='integrations';PlatformDocs.render();"><i class="fas ${isBookmarked ? 'fa-star' : 'fa-star'}"></i> ${isBookmarked ? 'Bookmarked' : 'Bookmark'}</button>
            <button class="gd-btn gd-btn-outline" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
          </div>
        </div>

        <div class="gd-content-card">
          <h4>🔌 Your CRM — The Center of Your Tech Universe</h4>
          <p class="gd-subtitle">Connect all your tools for seamless data flow. No more copy-pasting between apps.</p>
          <div class="gd-overview"><p>Your CRM shouldn't be an island. The Integrations Hub connects it to <strong>30+ tools</strong> you already use — payment gateways, email platforms, accounting software, video conferencing, and more. Plus, <strong>webhooks, API access, and Zapier/Make support</strong> for custom integrations with 5000+ apps. Data flows automatically between systems, eliminating manual work and errors.</p></div>

          <div class="gd-section-title"><i class="fas fa-th-large" style="color:#7c3aed;"></i> Integration Categories</div>
          <div class="gd-int-grid">
            <div class="gd-int-card"><i class="fas fa-credit-card"></i><h6>Payments</h6><p>Razorpay, Stripe, PayPal, Instamojo</p></div>
            <div class="gd-int-card"><i class="fas fa-envelope"></i><h6>Email</h6><p>Gmail, Outlook, Mailchimp</p></div>
            <div class="gd-int-card"><i class="fas fa-calculator"></i><h6>Accounting</h6><p>Tally, Zoho Books, QuickBooks</p></div>
            <div class="gd-int-card"><i class="fas fa-video"></i><h6>Meeting</h6><p>Zoom, Google Meet, Teams</p></div>
            <div class="gd-int-card"><i class="fas fa-shopping-cart"></i><h6>E‑commerce</h6><p>Shopify, WooCommerce, Magento</p></div>
            <div class="gd-int-card"><i class="fas fa-calendar"></i><h6>Calendar</h6><p>Google Calendar, Outlook Calendar</p></div>
            <div class="gd-int-card"><i class="fas fa-code"></i><h6>Custom</h6><p>Webhooks, REST API, Zapier, Make</p></div>
            <div class="gd-int-card"><i class="fas fa-database"></i><h6>Storage</h6><p>Google Drive, Dropbox, OneDrive</p></div>
          </div>

          <div class="gd-section-title"><i class="fas fa-list-ol" style="color:#7c3aed;"></i> Integration Steps</div>
          
          <div class="gd-step"><div class="gd-step-num">1</div><div class="gd-step-content"><h6>Browse & Connect — One-Click Setup</h6><p>Go to <strong>Settings → Integrations</strong>. Browse the catalog organized by category. Most integrations use <strong>OAuth</strong> — click "Connect", log into your account (e.g., Google, Stripe), and authorize permissions. Done. No coding, no API keys to copy-paste (for OAuth integrations). Your data starts syncing immediately. Check the <strong>Integration Health dashboard</strong> regularly — green check = connected, red X = needs attention (re-authenticate or check credentials).</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">2</div><div class="gd-step-content"><h6>Payment Gateway Integration</h6><p>Connect <strong>Razorpay, Stripe, PayPal, or Instamojo</strong> to: <strong>Auto-create invoices</strong> when a deal is marked "Won", <strong>Track payment status</strong> (paid, pending, failed, refunded) — updates automatically in the CRM, <strong>Send payment links</strong> via WhatsApp with one click, <strong>Reconcile payments</strong> — match incoming payments to deals automatically. Customers get WhatsApp receipts instantly. No more manual payment tracking in spreadsheets.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">3</div><div class="gd-step-content"><h6>Webhooks — Send Data Anywhere</h6><p>Webhooks let you send CRM data to any custom URL when events happen. Configure in <strong>Settings → Integrations → Webhooks</strong>: <strong>Select event:</strong> Lead created, form submitted, payment received, deal won, ticket created, etc. <strong>Enter URL:</strong> Your endpoint that will receive the data. <strong>Format:</strong> JSON payload with all relevant fields. <strong>Test:</strong> Send a test payload to verify. Use cases: send lead data to your custom dashboard, trigger Slack notifications, update your internal database, connect to any tool with a webhook URL.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">4</div><div class="gd-step-content"><h6>API Access — Build Anything</h6><p>For developers who need full control: <strong>Generate API keys</strong> in Settings → API. <strong>Full REST API documentation</strong> available at docs.yourcrm.com/api. <strong>Endpoints for:</strong> Contacts, Leads, Campaigns, Messages, Deals, Tickets, Appointments, Analytics. <strong>Authentication:</strong> Bearer token. <strong>Rate limits:</strong> Free plan: 100 requests/min, Pro: 1000 requests/min, Enterprise: Unlimited. Build custom integrations, mobile apps, internal tools, or connect systems that don't have pre-built integrations.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">5</div><div class="gd-step-content"><h6>Zapier & Make — 5000+ Apps</h6><p>Connect to <strong>5000+ additional apps</strong> through Zapier or Make (formerly Integromat) — no coding required. <strong>Example automations:</strong> "When a new lead is created in CRM → add to Google Sheets row", "When a deal is won → send Slack notification to #sales channel", "When a form is submitted → create Trello card", "When payment is received → update Mailchimp subscriber tag". Browse pre-built "Zaps" or create your own with the visual builder. Setup takes minutes, not days.</p></div></div>

          <div class="gd-tips-card">
            <h5><i class="fas fa-lightbulb" style="color:#f59e0b;"></i> Pro Tips</h5>
            <ul>
              <li><strong>Start with payment integration</strong> — it gives the fastest ROI by eliminating manual invoice creation and payment tracking.</li>
              <li><strong>Use webhooks to send lead data to your custom dashboard</strong> or internal tools — keep your team informed in real-time.</li>
              <li><strong>Check Integration Health weekly</strong> — a broken integration means lost data and missed opportunities.</li>
              <li><strong>Explore Zapier templates</strong> before building custom integrations — chances are someone has already built what you need.</li>
            </ul>
          </div>

          <h5 style="font-weight:700;margin-top:28px;color:#0f172a;">🔗 Related Guides</h5>
          <div class="gd-related">
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('ecommerce')">🛒 E‑commerce Integration</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('settings')">⚙️ Settings & Profile</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('analytics')">📈 Analytics & Reports</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('chats')">💬 WhatsApp Chat</span>
          </div>
        </div>

        <div class="gd-upsell"><div><h5>🔌 Unlimited Integrations & API Access</h5><p>Free plan: 3 integrations. Pro: Unlimited integrations, webhooks, API access, and Zapier/Make support.</p></div><button class="gd-btn gd-btn-primary" onclick="Plan.render()"><i class="fas fa-crown"></i> Connect Everything</button></div>

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
    PlatformDocs.markComplete('integrations');
    PlatformDocs.currentGuide = 'integrations';
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
      if (!pg['integrations'] || pg['integrations'] < 10) {
        pg['integrations'] = 10;
        await docRef.set({ platformGuides: pg, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    } catch (e) { console.error('Progress error:', e); }
  }
};
window.IntegrationsGuide = IntegrationsGuide;