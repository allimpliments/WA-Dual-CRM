// js/knowledge/guides/clients.js — Client Management Guide (Agency)
const ClientsGuide = {
  guideId: 'clients',

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
        .gd-breadcrumb span { cursor: pointer; transition: color 0.2s; } .gd-breadcrumb span:hover { color: #1e40af; }
        .gd-hero { background: #fff; border-radius: 20px; padding: 36px 32px; margin-bottom: 24px; border: 1px solid #f1f5f9; position: relative; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #1e40af, #1e3a8a, #1e40af); }
        .gd-hero-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #fff; margin-bottom: 16px; background: linear-gradient(135deg, #1e40af, #1e3a8a); }
        .gd-hero h3 { font-weight: 900; font-size: 28px; margin: 0 0 10px; color: #0f172a; line-height: 1.3; }
        .gd-hero p { color: #64748b; font-size: 15px; margin: 0; max-width: 700px; line-height: 1.7; }
        .gd-hero-meta { display: flex; gap: 18px; margin-top: 18px; flex-wrap: wrap; align-items: center; }
        .gd-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; } .gd-meta-item i { color: #1e40af; font-size: 14px; }
        .gd-hero-actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
        .gd-btn { padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .gd-btn-primary { background: #1e40af; color: #fff; } .gd-btn-primary:hover { background: #1e3a8a; transform: scale(1.03); }
        .gd-btn-outline { background: #fff; color: #1e40af; border: 1px solid #1e40af; } .gd-btn-outline:hover { background: #eff6ff; }
        .gd-btn-success { background: #10b981; color: #fff; } .gd-btn-success:hover { background: #059669; transform: scale(1.03); }
        .gd-btn-completed { background: #d1d5db; color: #fff; cursor: default; } .gd-btn-completed:hover { transform: none; }
        .gd-content-card { background: #fff; border-radius: 20px; padding: 32px; margin-bottom: 20px; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-content-card h4 { font-weight: 800; font-size: 20px; margin: 0 0 8px; color: #0f172a; }
        .gd-content-card .gd-subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
        .gd-overview { background: #eff6ff; border-radius: 14px; padding: 20px 24px; margin-bottom: 28px; border-left: 4px solid #1e40af; }
        .gd-overview p { margin: 0; font-size: 14px; color: #1e3a8a; line-height: 1.8; }
        .gd-section-title { font-weight: 800; font-size: 18px; color: #0f172a; margin: 28px 0 16px; display: flex; align-items: center; gap: 8px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9; }
        .gd-step { display: flex; gap: 16px; padding: 20px 0; border-bottom: 1px solid #f1f5f9; align-items: flex-start; }
        .gd-step:last-child { border-bottom: none; }
        .gd-step-num { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #1e40af, #1e3a8a); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 17px; flex-shrink: 0; }
        .gd-step-content { flex: 1; } .gd-step-content h6 { font-weight: 700; font-size: 15px; margin: 0 0 4px; color: #0f172a; }
        .gd-step-content p { font-size: 14px; color: #475569; margin: 0; line-height: 1.7; }
        .gd-tips-card { background: linear-gradient(135deg, #fef3c7, #fffbeb); border-radius: 16px; padding: 22px 26px; margin-top: 24px; border: 1px solid #fcd34d; }
        .gd-tips-card h5 { font-weight: 800; color: #92400e; margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
        .gd-tips-card ul { margin: 0; padding-left: 20px; } .gd-tips-card li { font-size: 13px; color: #a16207; margin-bottom: 6px; line-height: 1.6; } .gd-tips-card li:last-child { margin-bottom: 0; }
        .gd-related { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
        .gd-related-pill { padding: 9px 18px; border-radius: 20px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 13px; cursor: pointer; transition: 0.2s; color: #475569; display: inline-flex; align-items: center; gap: 6px; }
        .gd-related-pill:hover { background: #eff6ff; border-color: #1e40af; color: #1e40af; }
        .gd-upsell { background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 18px; padding: 28px 32px; margin-top: 28px; border: 1px solid #c7d2fe; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .gd-upsell h5 { font-weight: 800; color: #3730a3; margin: 0; font-size: 18px; } .gd-upsell p { color: #4f46e5; margin: 4px 0 0; font-size: 14px; }
        .gd-nav-btns { display: flex; justify-content: space-between; margin-top: 32px; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 768px) { .gd-hero { padding: 24px 18px; } .gd-hero h3 { font-size: 22px; } .gd-content-card { padding: 20px 16px; } .gd-step { flex-direction: column; gap: 10px; } .gd-upsell { flex-direction: column; text-align: center; } .gd-nav-btns { flex-direction: column; align-items: stretch; } }
      </style>

      <div class="gd-wrap">
        <div class="gd-back-row">
          <button class="gd-back-btn" onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();"><i class="fas fa-arrow-left"></i> Back to All Guides</button>
          <div class="gd-breadcrumb"><span onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();">📖 Platform Documentation</span><i class="fas fa-chevron-right" style="font-size:10px;"></i><span style="color:#1e40af;font-weight:600;">Client Management</span></div>
        </div>

        <div class="gd-hero">
          <div class="gd-hero-icon"><i class="fas fa-building"></i></div>
          <h3>Client Management — Run Your Agency Like a Pro</h3>
          <p>Manage multiple clients from one master dashboard. Each client gets their own isolated workspace with separate contacts, campaigns, and reports — perfect for agencies.</p>
          <div class="gd-hero-meta">
            <div class="gd-meta-item"><i class="fas fa-signal"></i> 🔴 Advanced</div>
            <div class="gd-meta-item"><i class="fas fa-clock"></i> 8 min read</div>
            <div class="gd-meta-item"><i class="fas fa-layer-group"></i> 5 Steps</div>
            <div class="gd-meta-item"><i class="fas fa-globe"></i> Updated: Jul 2026</div>
          </div>
          <div class="gd-hero-actions">
            ${isCompleted ? `<button class="gd-btn gd-btn-completed"><i class="fas fa-check-circle"></i> Completed ✓</button>` : `<button class="gd-btn gd-btn-success" onclick="ClientsGuide.triggerComplete()"><i class="fas fa-check"></i> Mark as Complete</button>`}
            <button class="gd-btn gd-btn-outline" onclick="PlatformDocs.toggleBookmark('clients');PlatformDocs.currentGuide='clients';PlatformDocs.render();"><i class="fas ${isBookmarked ? 'fa-star' : 'fa-star'}"></i> ${isBookmarked ? 'Bookmarked' : 'Bookmark'}</button>
            <button class="gd-btn gd-btn-outline" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
          </div>
        </div>

        <div class="gd-content-card">
          <h4>🏢 One CRM, Unlimited Clients</h4>
          <p class="gd-subtitle">Running an agency? Manage all your clients from one account with complete data isolation and white-label branding.</p>
          <div class="gd-overview"><p>The Client Management module is built for <strong>agencies, freelancers with multiple clients, and businesses managing subsidiaries</strong>. Each client gets their own <strong>completely isolated workspace</strong> — separate contacts, campaigns, pipelines, and reports. Client A cannot see Client B's data. You get a master dashboard to view all clients at a glance. Plus, <strong>white-label branding</strong> so each client sees their own logo and colors.</p></div>

          <div class="gd-section-title"><i class="fas fa-list-ol" style="color:#1e40af;"></i> Client Management Steps</div>
          
          <div class="gd-step"><div class="gd-step-num">1</div><div class="gd-step-content"><h6>Adding & Onboarding Clients</h6><p>Go to <strong>Settings → Clients → Add Client</strong>. Enter client details: Business name, logo, industry, timezone, currency. A <strong>separate workspace</strong> is created instantly with its own contacts database, campaigns, pipeline, forms, and reports. You can also <strong>import existing data</strong> for this client. Each client workspace is completely isolated — data never mixes. You can have unlimited clients (Pro plan).</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">2</div><div class="gd-step-content"><h6>Data Isolation — Privacy by Design</h6><p>This is critical for agencies: <strong>Client A's contacts, campaigns, messages, and reports are 100% invisible to Client B.</strong> Even if both clients are competitors in the same industry, their data remains completely separate. Your agents can be assigned to specific clients — Agent 1 works on Client A, Agent 2 on Client B, Agent 3 on both. The master admin (you) can see all clients, but individual client users see only their own workspace.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">3</div><div class="gd-step-content"><h6>Client Access & User Invitations</h6><p>Invite your client's team members to <strong>their specific workspace</strong>. They log in and see only their company's data — branded with their logo and colors. You control <strong>what features they can access</strong>: Can they create campaigns? View analytics? Export data? Manage their own team? Set permissions per client. This is perfect for offering "CRM access" as part of your service package. You do the setup and heavy lifting — they get a professional CRM experience.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">4</div><div class="gd-step-content"><h6>White-Label Branding — Make It Theirs</h6><p>Customize each client's CRM experience: <strong>Logo & favicon</strong> (appears on login page, dashboard, forms, emails), <strong>Brand colors</strong> (primary, accent, background), <strong>Custom domain</strong> (clientname.youragency.com or their own domain), <strong>Email templates</strong> (from their email address, not yours), <strong>WhatsApp number</strong> (their business number for campaigns). The result: your client feels like they have their own dedicated CRM platform — increasing perceived value and justifying higher retainers.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">5</div><div class="gd-step-content"><h6>Consolidated Reporting & Billing</h6><p>From your <strong>Master Agency Dashboard</strong>, view all clients at a glance: Active campaigns, Total leads, Revenue generated, Support tickets open, Client status (active, onboarding, at-risk). <strong>Drill down</strong> into individual client reports. <strong>Automated monthly reports</strong> — generate and email performance reports to each client automatically (e.g., every 1st of the month). <strong>Billing management:</strong> Track what each client pays you, set renewal reminders, identify your most profitable clients.</p></div></div>

          <div class="gd-tips-card">
            <h5><i class="fas fa-lightbulb" style="color:#f59e0b;"></i> Pro Tips</h5>
            <ul>
              <li><strong>Use client tags:</strong> #HighValue, #NeedsAttention, #Growing — prioritize your efforts across clients.</li>
              <li><strong>Set up automated monthly reports</strong> — clients love seeing their ROI, and it reduces "What did you do this month?" conversations.</li>
              <li><strong>Offer CRM access as a premium add-on</strong> — charge clients extra for their own branded CRM dashboard.</li>
              <li><strong>Create templates per industry</strong> — real estate clients get one setup, healthcare clients another. Clone and customize.</li>
            </ul>
          </div>

          <h5 style="font-weight:700;margin-top:28px;color:#0f172a;">🔗 Related Guides</h5>
          <div class="gd-related">
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('agents')">👥 Team Management</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('settings')">⚙️ Settings & Profile</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('analytics')">📈 Analytics & Reports</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('plans')">💳 Plans & Billing</span>
          </div>
        </div>

        <div class="gd-upsell"><div><h5>🏢 Unlimited Clients & White-Label</h5><p>Free plan: 1 client (yourself). Pro: Unlimited clients, white-label branding, and client-specific reports.</p></div><button class="gd-btn gd-btn-primary" onclick="Plan.render()"><i class="fas fa-crown"></i> Scale Your Agency</button></div>

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
    PlatformDocs.markComplete('clients');
    PlatformDocs.currentGuide = 'clients';
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
      if (!pg['clients'] || pg['clients'] < 10) {
        pg['clients'] = 10;
        await docRef.set({ platformGuides: pg, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    } catch (e) { console.error('Progress error:', e); }
  }
};
window.ClientsGuide = ClientsGuide;