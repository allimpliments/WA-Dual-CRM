// js/knowledge/guides/dashboard.js — Dashboard Overview Guide
const DashboardGuide = {
  guideId: 'dashboard',

  async render(context) {
    const { guide, userProgress = 0, isBookmarked = false, getAdjacentGuide } = context;
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = '#f8fafc';

    if (userProgress === 0) {
      try { await this.markInProgress(); } catch (e) {}
    }

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
        .gd-breadcrumb span { cursor: pointer; transition: color 0.2s; } .gd-breadcrumb span:hover { color: #6366f1; }
        .gd-hero { background: #fff; border-radius: 20px; padding: 36px 32px; margin-bottom: 24px; border: 1px solid #f1f5f9; position: relative; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #10b981, #059669, #10b981); }
        .gd-hero-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #fff; margin-bottom: 16px; background: linear-gradient(135deg, #10b981, #059669); }
        .gd-hero h3 { font-weight: 900; font-size: 28px; margin: 0 0 10px; color: #0f172a; line-height: 1.3; }
        .gd-hero p { color: #64748b; font-size: 15px; margin: 0; max-width: 700px; line-height: 1.7; }
        .gd-hero-meta { display: flex; gap: 18px; margin-top: 18px; flex-wrap: wrap; align-items: center; }
        .gd-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; } .gd-meta-item i { color: #10b981; font-size: 14px; }
        .gd-hero-actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
        .gd-btn { padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .gd-btn-primary { background: #10b981; color: #fff; } .gd-btn-primary:hover { background: #059669; transform: scale(1.03); }
        .gd-btn-outline { background: #fff; color: #10b981; border: 1px solid #10b981; } .gd-btn-outline:hover { background: #ecfdf5; }
        .gd-btn-success { background: #10b981; color: #fff; } .gd-btn-success:hover { background: #059669; transform: scale(1.03); }
        .gd-btn-completed { background: #d1d5db; color: #fff; cursor: default; } .gd-btn-completed:hover { transform: none; }
        .gd-content-card { background: #fff; border-radius: 20px; padding: 32px; margin-bottom: 20px; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-content-card h4 { font-weight: 800; font-size: 20px; margin: 0 0 8px; color: #0f172a; }
        .gd-content-card .gd-subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
        .gd-overview { background: #f0fdf4; border-radius: 14px; padding: 20px 24px; margin-bottom: 28px; border-left: 4px solid #10b981; }
        .gd-overview p { margin: 0; font-size: 14px; color: #065f46; line-height: 1.8; }
        .gd-section-title { font-weight: 800; font-size: 18px; color: #0f172a; margin: 28px 0 16px; display: flex; align-items: center; gap: 8px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9; }
        .gd-step { display: flex; gap: 16px; padding: 20px 0; border-bottom: 1px solid #f1f5f9; align-items: flex-start; }
        .gd-step:last-child { border-bottom: none; }
        .gd-step-num { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #10b981, #059669); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 17px; flex-shrink: 0; }
        .gd-step-content { flex: 1; } .gd-step-content h6 { font-weight: 700; font-size: 15px; margin: 0 0 4px; color: #0f172a; }
        .gd-step-content p { font-size: 14px; color: #475569; margin: 0; line-height: 1.7; }
        .gd-widget-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-top: 14px; }
        .gd-widget-card { background: #f8fafc; border-radius: 12px; padding: 16px 18px; border: 1px solid #e2e8f0; }
        .gd-widget-card h6 { font-weight: 700; font-size: 13px; margin: 0 0 4px; color: #0f172a; display: flex; align-items: center; gap: 6px; }
        .gd-widget-card p { font-size: 11px; color: #64748b; margin: 0; }
        .gd-tips-card { background: linear-gradient(135deg, #fef3c7, #fffbeb); border-radius: 16px; padding: 22px 26px; margin-top: 24px; border: 1px solid #fcd34d; }
        .gd-tips-card h5 { font-weight: 800; color: #92400e; margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
        .gd-tips-card ul { margin: 0; padding-left: 20px; } .gd-tips-card li { font-size: 13px; color: #a16207; margin-bottom: 6px; line-height: 1.6; } .gd-tips-card li:last-child { margin-bottom: 0; }
        .gd-related { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
        .gd-related-pill { padding: 9px 18px; border-radius: 20px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 13px; cursor: pointer; transition: 0.2s; color: #475569; display: inline-flex; align-items: center; gap: 6px; }
        .gd-related-pill:hover { background: #ecfdf5; border-color: #10b981; color: #10b981; }
        .gd-upsell { background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 18px; padding: 28px 32px; margin-top: 28px; border: 1px solid #c7d2fe; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .gd-upsell h5 { font-weight: 800; color: #3730a3; margin: 0; font-size: 18px; } .gd-upsell p { color: #4f46e5; margin: 4px 0 0; font-size: 14px; }
        .gd-nav-btns { display: flex; justify-content: space-between; margin-top: 32px; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 768px) { .gd-hero { padding: 24px 18px; } .gd-hero h3 { font-size: 22px; } .gd-content-card { padding: 20px 16px; } .gd-step { flex-direction: column; gap: 10px; } .gd-widget-grid { grid-template-columns: 1fr; } .gd-upsell { flex-direction: column; text-align: center; } .gd-nav-btns { flex-direction: column; align-items: stretch; } }
      </style>

      <div class="gd-wrap">
        <div class="gd-back-row">
          <button class="gd-back-btn" onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();"><i class="fas fa-arrow-left"></i> Back to All Guides</button>
          <div class="gd-breadcrumb"><span onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();">📖 Platform Documentation</span><i class="fas fa-chevron-right" style="font-size:10px;"></i><span style="color:#10b981;font-weight:600;">Dashboard Overview</span></div>
        </div>

        <div class="gd-hero">
          <div class="gd-hero-icon"><i class="fas fa-tachometer-alt"></i></div>
          <h3>Dashboard Overview — Your Command Center</h3>
          <p>Master your dashboard — the first screen you see every time you log in. Learn every widget, KPI card, chart, quick action, and customization option to make data-driven decisions at a glance.</p>
          <div class="gd-hero-meta">
            <div class="gd-meta-item"><i class="fas fa-signal"></i> 🟢 Beginner</div>
            <div class="gd-meta-item"><i class="fas fa-clock"></i> 6 min read</div>
            <div class="gd-meta-item"><i class="fas fa-layer-group"></i> 5 Sections</div>
            <div class="gd-meta-item"><i class="fas fa-globe"></i> Updated: Jul 2026</div>
          </div>
          <div class="gd-hero-actions">
            ${isCompleted ? `<button class="gd-btn gd-btn-completed"><i class="fas fa-check-circle"></i> Completed ✓</button>` : `<button class="gd-btn gd-btn-success" onclick="DashboardGuide.triggerComplete()"><i class="fas fa-check"></i> Mark as Complete</button>`}
            <button class="gd-btn gd-btn-outline" onclick="PlatformDocs.toggleBookmark('dashboard');PlatformDocs.currentGuide='dashboard';PlatformDocs.render();"><i class="fas ${isBookmarked ? 'fa-star' : 'fa-star'}"></i> ${isBookmarked ? 'Bookmarked' : 'Bookmark'}</button>
            <button class="gd-btn gd-btn-outline" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
          </div>
        </div>

        <div class="gd-content-card">
          <h4>📊 Understanding Your Dashboard</h4>
          <p class="gd-subtitle">The dashboard gives you a complete snapshot of your business performance — all in one view.</p>
          <div class="gd-overview"><p>Your dashboard is designed to answer 3 questions instantly: <strong>How is my business doing right now? Where are my leads in the pipeline? What needs my attention today?</strong> Every widget, chart, and metric card is carefully placed to give you maximum insight with minimum effort.</p></div>

          <div class="gd-section-title"><i class="fas fa-th-large" style="color:#10b981;"></i> Dashboard Widgets — Complete Breakdown</div>
          
          <div class="gd-widget-grid">
            <div class="gd-widget-card"><h6>📈 Total Leads</h6><p>All-time lead count with today's new leads badge. Click to see detailed lead list.</p></div>
            <div class="gd-widget-card"><h6>💰 Revenue This Month</h6><p>Total revenue from won deals this month. Green arrow = up from last month.</p></div>
            <div class="gd-widget-card"><h6>📨 Active Campaigns</h6><p>Number of currently running campaigns. Click to jump to Campaigns module.</p></div>
            <div class="gd-widget-card"><h6>🎫 Open Tickets</h6><p>Unresolved support tickets. Red if SLA breached. Click to open Ticket System.</p></div>
            <div class="gd-widget-card"><h6>📊 Lead Funnel</h6><p>Visual pipeline — see leads at each stage. Drag stages to reorder. Hover for exact counts.</p></div>
            <div class="gd-widget-card"><h6>📅 Today's Appointments</h6><p>Upcoming meetings with customer names and times. Click to join Google Meet/Zoom.</p></div>
            <div class="gd-widget-card"><h6>🔄 Recent Activities</h6><p>Real-time feed: new leads, sent messages, payments, closed tickets. Filterable by type.</p></div>
            <div class="gd-widget-card"><h6>🎯 Conversion Rate</h6><p>Lead-to-customer conversion %. Compare weekly/monthly trends.</p></div>
          </div>

          <div class="gd-section-title"><i class="fas fa-sliders-h" style="color:#10b981;"></i> Customizing Your Dashboard</div>
          
          <div class="gd-step"><div class="gd-step-num">1</div><div class="gd-step-content"><h6>Add/Remove Widgets</h6><p>Click <strong>"Customize Dashboard"</strong> (top-right corner). Choose from 15+ available widgets. Drag to reorder. Remove widgets you don't need. Free plan: 5 widgets. Pro plan: Unlimited.</p></div></div>
          <div class="gd-step"><div class="gd-step-num">2</div><div class="gd-step-content"><h6>Change Layout</h6><p>Toggle between <strong>2-column</strong> (default) and <strong>3-column</strong> layout. 3-column shows more data but is better on larger screens. Your preference is saved automatically.</p></div></div>
          <div class="gd-step"><div class="gd-step-num">3</div><div class="gd-step-content"><h6>Set Default Date Range</h6><p>Choose your default view: Today, This Week, This Month, This Quarter, This Year, or Custom Range. This affects all dashboard metrics. Change anytime from the date picker on the dashboard.</p></div></div>
          <div class="gd-step"><div class="gd-step-num">4</div><div class="gd-step-content"><h6>Quick Actions Sidebar</h6><p>Right sidebar shows: <strong>+ Add Lead, + Send Message, + Create Ticket, + Schedule Appointment.</strong> Customize which actions appear in Settings → Dashboard Preferences.</p></div></div>
          <div class="gd-step"><div class="gd-step-num">5</div><div class="gd-step-content"><h6>Bookmark Widgets</h6><p>Click the ⭐ icon on any widget to add it to your "Favorites" section at the top. Great for widgets you check daily like Revenue and Active Campaigns.</p></div></div>

          <div class="gd-tips-card">
            <h5><i class="fas fa-lightbulb" style="color:#f59e0b;"></i> Pro Tips</h5>
            <ul>
              <li><strong>Set up daily email summaries</strong> in Settings → Notifications to get dashboard highlights in your inbox every morning.</li>
              <li><strong>Use the date range filter</strong> to compare performance week-over-week or month-over-month — spot trends before they become problems.</li>
              <li><strong>Click any KPI card</strong> to drill down into the detailed report behind that number.</li>
              <li><strong>Widgets update in real-time</strong> — no need to refresh. New leads and messages appear instantly.</li>
            </ul>
          </div>

          <h5 style="font-weight:700;margin-top:28px;color:#0f172a;">🔗 Related Guides</h5>
          <p style="color:#64748b;font-size:13px;margin:4px 0 12px;">Explore these related modules:</p>
          <div class="gd-related">
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('getting-started')">🚀 Getting Started</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('analytics')">📈 Analytics & Reports</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('settings')">⚙️ Settings & Profile</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('leads')">🎯 Managing Leads</span>
          </div>
        </div>

        <div class="gd-upsell"><div><h5>📊 Unlock Advanced Dashboard</h5><p>Free plan: 5 widgets. Pro plan: Unlimited widgets, custom charts, export reports, and real-time alerts.</p></div><button class="gd-btn gd-btn-primary" onclick="Plan.render()"><i class="fas fa-crown"></i> See Pro Features</button></div>

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
    PlatformDocs.markComplete('dashboard');
    PlatformDocs.currentGuide = 'dashboard';
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
      if (!pg['dashboard'] || pg['dashboard'] < 10) {
        pg['dashboard'] = 10;
        await docRef.set({ platformGuides: pg, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    } catch (e) { console.error('Progress error:', e); }
  }
};
window.DashboardGuide = DashboardGuide;