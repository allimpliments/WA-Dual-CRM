// js/knowledge/guides/settings.js — Settings & Profile Guide
const SettingsGuide = {
  guideId: 'settings',

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
        .gd-breadcrumb span { cursor: pointer; transition: color 0.2s; } .gd-breadcrumb span:hover { color: #64748b; }
        .gd-hero { background: #fff; border-radius: 20px; padding: 36px 32px; margin-bottom: 24px; border: 1px solid #f1f5f9; position: relative; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #64748b, #475569, #64748b); }
        .gd-hero-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #fff; margin-bottom: 16px; background: linear-gradient(135deg, #64748b, #475569); }
        .gd-hero h3 { font-weight: 900; font-size: 28px; margin: 0 0 10px; color: #0f172a; line-height: 1.3; }
        .gd-hero p { color: #64748b; font-size: 15px; margin: 0; max-width: 700px; line-height: 1.7; }
        .gd-hero-meta { display: flex; gap: 18px; margin-top: 18px; flex-wrap: wrap; align-items: center; }
        .gd-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; } .gd-meta-item i { color: #64748b; font-size: 14px; }
        .gd-hero-actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
        .gd-btn { padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .gd-btn-primary { background: #64748b; color: #fff; } .gd-btn-primary:hover { background: #475569; transform: scale(1.03); }
        .gd-btn-outline { background: #fff; color: #64748b; border: 1px solid #64748b; } .gd-btn-outline:hover { background: #f8fafc; }
        .gd-btn-success { background: #10b981; color: #fff; } .gd-btn-success:hover { background: #059669; transform: scale(1.03); }
        .gd-btn-completed { background: #d1d5db; color: #fff; cursor: default; } .gd-btn-completed:hover { transform: none; }
        .gd-content-card { background: #fff; border-radius: 20px; padding: 32px; margin-bottom: 20px; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-content-card h4 { font-weight: 800; font-size: 20px; margin: 0 0 8px; color: #0f172a; }
        .gd-content-card .gd-subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
        .gd-overview { background: #f8fafc; border-radius: 14px; padding: 20px 24px; margin-bottom: 28px; border-left: 4px solid #64748b; }
        .gd-overview p { margin: 0; font-size: 14px; color: #334155; line-height: 1.8; }
        .gd-section-title { font-weight: 800; font-size: 18px; color: #0f172a; margin: 28px 0 16px; display: flex; align-items: center; gap: 8px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9; }
        .gd-step { display: flex; gap: 16px; padding: 20px 0; border-bottom: 1px solid #f1f5f9; align-items: flex-start; }
        .gd-step:last-child { border-bottom: none; }
        .gd-step-num { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #64748b, #475569); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 17px; flex-shrink: 0; }
        .gd-step-content { flex: 1; } .gd-step-content h6 { font-weight: 700; font-size: 15px; margin: 0 0 4px; color: #0f172a; }
        .gd-step-content p { font-size: 14px; color: #475569; margin: 0; line-height: 1.7; }
        .gd-setting-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin: 14px 0; }
        .gd-setting-card { border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; background: #f8fafc; }
        .gd-setting-card h6 { font-weight: 700; font-size: 13px; margin: 0 0 4px; display: flex; align-items: center; gap: 6px; } .gd-setting-card p { font-size: 11px; color: #64748b; margin: 0; }
        .gd-tips-card { background: linear-gradient(135deg, #fef3c7, #fffbeb); border-radius: 16px; padding: 22px 26px; margin-top: 24px; border: 1px solid #fcd34d; }
        .gd-tips-card h5 { font-weight: 800; color: #92400e; margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
        .gd-tips-card ul { margin: 0; padding-left: 20px; } .gd-tips-card li { font-size: 13px; color: #a16207; margin-bottom: 6px; line-height: 1.6; } .gd-tips-card li:last-child { margin-bottom: 0; }
        .gd-related { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
        .gd-related-pill { padding: 9px 18px; border-radius: 20px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 13px; cursor: pointer; transition: 0.2s; color: #475569; display: inline-flex; align-items: center; gap: 6px; }
        .gd-related-pill:hover { background: #f1f5f9; border-color: #64748b; color: #64748b; }
        .gd-upsell { background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 18px; padding: 28px 32px; margin-top: 28px; border: 1px solid #c7d2fe; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .gd-upsell h5 { font-weight: 800; color: #3730a3; margin: 0; font-size: 18px; } .gd-upsell p { color: #4f46e5; margin: 4px 0 0; font-size: 14px; }
        .gd-nav-btns { display: flex; justify-content: space-between; margin-top: 32px; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 768px) { .gd-hero { padding: 24px 18px; } .gd-hero h3 { font-size: 22px; } .gd-content-card { padding: 20px 16px; } .gd-step { flex-direction: column; gap: 10px; } .gd-setting-grid { grid-template-columns: 1fr; } .gd-upsell { flex-direction: column; text-align: center; } .gd-nav-btns { flex-direction: column; align-items: stretch; } }
      </style>

      <div class="gd-wrap">
        <div class="gd-back-row">
          <button class="gd-back-btn" onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();"><i class="fas fa-arrow-left"></i> Back to All Guides</button>
          <div class="gd-breadcrumb"><span onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();">📖 Platform Documentation</span><i class="fas fa-chevron-right" style="font-size:10px;"></i><span style="color:#64748b;font-weight:600;">Settings & Profile</span></div>
        </div>

        <div class="gd-hero">
          <div class="gd-hero-icon"><i class="fas fa-cog"></i></div>
          <h3>Settings & Profile — Configure Your CRM Your Way</h3>
          <p>Complete walkthrough of all settings — company profile, pipeline customization, notifications, security, data management, and more. Make the CRM work exactly how your business needs.</p>
          <div class="gd-hero-meta">
            <div class="gd-meta-item"><i class="fas fa-signal"></i> 🟢 Beginner</div>
            <div class="gd-meta-item"><i class="fas fa-clock"></i> 8 min read</div>
            <div class="gd-meta-item"><i class="fas fa-layer-group"></i> 5 Sections</div>
            <div class="gd-meta-item"><i class="fas fa-globe"></i> Updated: Jul 2026</div>
          </div>
          <div class="gd-hero-actions">
            ${isCompleted ? `<button class="gd-btn gd-btn-completed"><i class="fas fa-check-circle"></i> Completed ✓</button>` : `<button class="gd-btn gd-btn-success" onclick="SettingsGuide.triggerComplete()"><i class="fas fa-check"></i> Mark as Complete</button>`}
            <button class="gd-btn gd-btn-outline" onclick="PlatformDocs.toggleBookmark('settings');PlatformDocs.currentGuide='settings';PlatformDocs.render();"><i class="fas ${isBookmarked ? 'fa-star' : 'fa-star'}"></i> ${isBookmarked ? 'Bookmarked' : 'Bookmark'}</button>
            <button class="gd-btn gd-btn-outline" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
          </div>
        </div>

        <div class="gd-content-card">
          <h4>⚙️ Make the CRM Yours</h4>
          <p class="gd-subtitle">Proper configuration is the difference between a CRM that works FOR you and one you fight against.</p>
          <div class="gd-overview"><p>Settings is where you <strong>customize the CRM to match your exact business processes.</strong> From your company profile that appears on every invoice and form, to your pipeline stages that mirror your sales process, to notification preferences that keep you informed without overwhelm — getting these right is crucial. Spend time here during setup and revisit monthly as your business evolves.</p></div>

          <div class="gd-section-title"><i class="fas fa-th-list" style="color:#64748b;"></i> Settings Overview</div>
          <div class="gd-setting-grid">
            <div class="gd-setting-card"><h6>🏢 Company Profile</h6><p>Business name, logo, address, GST, website, industry, timezone, currency, brand colors.</p></div>
            <div class="gd-setting-card"><h6>📋 Pipeline Configuration</h6><p>Define sales stages, set colors, mark Won/Lost stages, reorder, add custom stages.</p></div>
            <div class="gd-setting-card"><h6>🔔 Notifications</h6><p>Choose triggers: new lead, stage change, payment, ticket. Channels: in-app, email, WhatsApp, Slack.</p></div>
            <div class="gd-setting-card"><h6>🔐 Security</h6><p>Enable 2FA, set password policies, view login history, manage sessions, IP whitelisting.</p></div>
            <div class="gd-setting-card"><h6>💾 Data Management</h6><p>Export all data, import data, data retention, GDPR tools, backup settings.</p></div>
            <div class="gd-setting-card"><h6>🔌 Integrations</h6><p>Connect WhatsApp, payment gateways, email, calendar, e‑commerce, webhooks, API keys.</p></div>
          </div>

          <div class="gd-section-title"><i class="fas fa-list-ol" style="color:#64748b;"></i> Key Settings Steps</div>
          
          <div class="gd-step"><div class="gd-step-num">1</div><div class="gd-step-content"><h6>Company Profile — Your Business Identity</h6><p>Go to <strong>Settings → Company Profile</strong>. Fill in: <strong>Business name & display name</strong> (appears on forms, invoices, email footers), <strong>Logo</strong> (upload 500×500px PNG — appears on dashboard, forms, emails), <strong>Business address & GST number</strong> (for Indian businesses — appears on invoices), <strong>Website URL & industry type</strong> (helps AI tools generate relevant content), <strong>Timezone & currency</strong> (CRITICAL — affects campaign scheduling, appointment times, report date ranges, and revenue calculations), <strong>Brand colors</strong> (primary & accent — used on forms, emails, and booking pages).</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">2</div><div class="gd-step-content"><h6>Pipeline Configuration — Your Sales Process</h6><p>Go to <strong>Settings → Pipeline</strong>. Default stages: New → Contacted → Qualified → Proposal Sent → Negotiation → Won (set as "Won" stage) → Lost (set as "Lost" stage). <strong>Customize:</strong> Add stages (e.g., "Demo Scheduled", "Contract Review"), remove stages you don't need, rename stages to match your terminology, reorder by dragging, set colors per stage (green for Won, red for Lost, blue for active stages). <strong>Set probability % per stage</strong> for revenue forecasting: Qualified=20%, Proposal=50%, Negotiation=80%.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">3</div><div class="gd-step-content"><h6>Notification Preferences — Stay Informed, Not Overwhelmed</h6><p>Go to <strong>Settings → Notifications</strong>. Choose what triggers notifications: <strong>New lead created</strong>, <strong>Lead stage changed</strong>, <strong>Payment received</strong>, <strong>Ticket created/updated</strong>, <strong>Campaign completed</strong>, <strong>Agent response time exceeded SLA</strong>, <strong>Daily/weekly summary</strong>. Choose delivery channel per trigger: <strong>In-app</strong> (bell icon), <strong>Email</strong>, <strong>WhatsApp</strong>, <strong>Slack</strong>. Pro tip: Critical alerts (payment, SLA breach) → WhatsApp + Email. Informational (daily summary) → Email only.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">4</div><div class="gd-step-content"><h6>Security Settings — Protect Your Data</h6><p>Go to <strong>Settings → Security</strong>. <strong>Enable 2FA</strong> (Two-Factor Authentication) — highly recommended for all users, especially admins. <strong>Password policies:</strong> Minimum length, require uppercase + number + special character, password expiry (90 days). <strong>View login history:</strong> See all logins with IP address, location, device, and timestamp. <strong>Manage active sessions:</strong> See who's logged in right now — force logout suspicious sessions. <strong>IP whitelisting:</strong> Restrict access to specific IP ranges (office network) — Pro & Enterprise feature.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">5</div><div class="gd-step-content"><h6>Data Management — Import, Export & Compliance</h6><p>Go to <strong>Settings → Data</strong>. <strong>Export all data:</strong> Contacts, leads, campaigns, tickets, analytics — download as CSV/Excel/PDF. <strong>Import data:</strong> Bulk upload contacts, leads, or historical data. <strong>Data retention:</strong> Set auto-archive/delete rules — e.g., "Archive resolved tickets older than 6 months", "Delete bounced contacts after 90 days". <strong>GDPR compliance:</strong> Handle data deletion requests — search by email/phone and permanently delete all associated data with one click. <strong>Backup settings:</strong> Schedule automatic daily/weekly backups (Pro feature).</p></div></div>

          <div class="gd-tips-card">
            <h5><i class="fas fa-lightbulb" style="color:#f59e0b;"></i> Pro Tips</h5>
            <ul>
              <li><strong>Set your timezone correctly FIRST</strong> — it affects campaign scheduling, appointment times, and report date ranges. Changing later causes data inconsistencies.</li>
              <li><strong>Customize pipeline stages to match your exact sales process</strong> — accurate reporting depends on this.</li>
              <li><strong>Review notification settings monthly</strong> — too many notifications reduce productivity. Keep only what you actually act on.</li>
              <li><strong>Enable 2FA for all admin accounts immediately</strong> — it's the single most effective security measure you can take.</li>
            </ul>
          </div>

          <h5 style="font-weight:700;margin-top:28px;color:#0f172a;">🔗 Related Guides</h5>
          <div class="gd-related">
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('dashboard')">📊 Dashboard Overview</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('plans')">💳 Plans & Billing</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('integrations')">🔌 Integrations Hub</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('agents')">👥 Team Management</span>
          </div>
        </div>

        <div class="gd-upsell"><div><h5>⚙️ Advanced Configuration Options</h5><p>Free plan: Basic settings. Pro: Custom pipeline stages, IP whitelisting, automated backups, and priority support.</p></div><button class="gd-btn gd-btn-primary" onclick="Plan.render()"><i class="fas fa-crown"></i> Unlock Pro Settings</button></div>

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
    PlatformDocs.markComplete('settings');
    PlatformDocs.currentGuide = 'settings';
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
      if (!pg['settings'] || pg['settings'] < 10) {
        pg['settings'] = 10;
        await docRef.set({ platformGuides: pg, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    } catch (e) { console.error('Progress error:', e); }
  }
};
window.SettingsGuide = SettingsGuide;