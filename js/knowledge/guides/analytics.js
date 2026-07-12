// js/knowledge/guides/analytics.js — Analytics & Reports Guide
const AnalyticsGuide = {
  guideId: 'analytics',

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
        .gd-breadcrumb span { cursor: pointer; transition: color 0.2s; } .gd-breadcrumb span:hover { color: #3b82f6; }
        .gd-hero { background: #fff; border-radius: 20px; padding: 36px 32px; margin-bottom: 24px; border: 1px solid #f1f5f9; position: relative; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #3b82f6, #2563eb, #3b82f6); }
        .gd-hero-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #fff; margin-bottom: 16px; background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .gd-hero h3 { font-weight: 900; font-size: 28px; margin: 0 0 10px; color: #0f172a; line-height: 1.3; }
        .gd-hero p { color: #64748b; font-size: 15px; margin: 0; max-width: 700px; line-height: 1.7; }
        .gd-hero-meta { display: flex; gap: 18px; margin-top: 18px; flex-wrap: wrap; align-items: center; }
        .gd-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; } .gd-meta-item i { color: #3b82f6; font-size: 14px; }
        .gd-hero-actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
        .gd-btn { padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .gd-btn-primary { background: #3b82f6; color: #fff; } .gd-btn-primary:hover { background: #2563eb; transform: scale(1.03); }
        .gd-btn-outline { background: #fff; color: #3b82f6; border: 1px solid #3b82f6; } .gd-btn-outline:hover { background: #eff6ff; }
        .gd-btn-success { background: #10b981; color: #fff; } .gd-btn-success:hover { background: #059669; transform: scale(1.03); }
        .gd-btn-completed { background: #d1d5db; color: #fff; cursor: default; } .gd-btn-completed:hover { transform: none; }
        .gd-content-card { background: #fff; border-radius: 20px; padding: 32px; margin-bottom: 20px; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-content-card h4 { font-weight: 800; font-size: 20px; margin: 0 0 8px; color: #0f172a; }
        .gd-content-card .gd-subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
        .gd-overview { background: #eff6ff; border-radius: 14px; padding: 20px 24px; margin-bottom: 28px; border-left: 4px solid #3b82f6; }
        .gd-overview p { margin: 0; font-size: 14px; color: #1e3a8a; line-height: 1.8; }
        .gd-section-title { font-weight: 800; font-size: 18px; color: #0f172a; margin: 28px 0 16px; display: flex; align-items: center; gap: 8px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9; }
        .gd-step { display: flex; gap: 16px; padding: 20px 0; border-bottom: 1px solid #f1f5f9; align-items: flex-start; }
        .gd-step:last-child { border-bottom: none; }
        .gd-step-num { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #3b82f6, #2563eb); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 17px; flex-shrink: 0; }
        .gd-step-content { flex: 1; } .gd-step-content h6 { font-weight: 700; font-size: 15px; margin: 0 0 4px; color: #0f172a; }
        .gd-step-content p { font-size: 14px; color: #475569; margin: 0; line-height: 1.7; }
        .gd-report-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin: 14px 0; }
        .gd-report-card { border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; background: #f8fafc; }
        .gd-report-card h6 { font-weight: 700; font-size: 13px; margin: 0 0 4px; display: flex; align-items: center; gap: 6px; } .gd-report-card p { font-size: 11px; color: #64748b; margin: 0; }
        .gd-tips-card { background: linear-gradient(135deg, #fef3c7, #fffbeb); border-radius: 16px; padding: 22px 26px; margin-top: 24px; border: 1px solid #fcd34d; }
        .gd-tips-card h5 { font-weight: 800; color: #92400e; margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
        .gd-tips-card ul { margin: 0; padding-left: 20px; } .gd-tips-card li { font-size: 13px; color: #a16207; margin-bottom: 6px; line-height: 1.6; } .gd-tips-card li:last-child { margin-bottom: 0; }
        .gd-related { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
        .gd-related-pill { padding: 9px 18px; border-radius: 20px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 13px; cursor: pointer; transition: 0.2s; color: #475569; display: inline-flex; align-items: center; gap: 6px; }
        .gd-related-pill:hover { background: #eff6ff; border-color: #3b82f6; color: #3b82f6; }
        .gd-upsell { background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 18px; padding: 28px 32px; margin-top: 28px; border: 1px solid #c7d2fe; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .gd-upsell h5 { font-weight: 800; color: #3730a3; margin: 0; font-size: 18px; } .gd-upsell p { color: #4f46e5; margin: 4px 0 0; font-size: 14px; }
        .gd-nav-btns { display: flex; justify-content: space-between; margin-top: 32px; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 768px) { .gd-hero { padding: 24px 18px; } .gd-hero h3 { font-size: 22px; } .gd-content-card { padding: 20px 16px; } .gd-step { flex-direction: column; gap: 10px; } .gd-report-grid { grid-template-columns: 1fr; } .gd-upsell { flex-direction: column; text-align: center; } .gd-nav-btns { flex-direction: column; align-items: stretch; } }
      </style>

      <div class="gd-wrap">
        <div class="gd-back-row">
          <button class="gd-back-btn" onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();"><i class="fas fa-arrow-left"></i> Back to All Guides</button>
          <div class="gd-breadcrumb"><span onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();">📖 Platform Documentation</span><i class="fas fa-chevron-right" style="font-size:10px;"></i><span style="color:#3b82f6;font-weight:600;">Analytics & Reports</span></div>
        </div>

        <div class="gd-hero">
          <div class="gd-hero-icon"><i class="fas fa-chart-pie"></i></div>
          <h3>Analytics & Reports — Data-Driven Decision Making</h3>
          <p>Comprehensive analytics across campaigns, agents, revenue, and customer behavior. Turn raw data into actionable insights that drive growth.</p>
          <div class="gd-hero-meta">
            <div class="gd-meta-item"><i class="fas fa-signal"></i> 🟡 Intermediate</div>
            <div class="gd-meta-item"><i class="fas fa-clock"></i> 10 min read</div>
            <div class="gd-meta-item"><i class="fas fa-layer-group"></i> 5 Steps</div>
            <div class="gd-meta-item"><i class="fas fa-globe"></i> Updated: Jul 2026</div>
          </div>
          <div class="gd-hero-actions">
            ${isCompleted ? `<button class="gd-btn gd-btn-completed"><i class="fas fa-check-circle"></i> Completed ✓</button>` : `<button class="gd-btn gd-btn-success" onclick="AnalyticsGuide.triggerComplete()"><i class="fas fa-check"></i> Mark as Complete</button>`}
            <button class="gd-btn gd-btn-outline" onclick="PlatformDocs.toggleBookmark('analytics');PlatformDocs.currentGuide='analytics';PlatformDocs.render();"><i class="fas ${isBookmarked ? 'fa-star' : 'fa-star'}"></i> ${isBookmarked ? 'Bookmarked' : 'Bookmark'}</button>
            <button class="gd-btn gd-btn-outline" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
          </div>
        </div>

        <div class="gd-content-card">
          <h4>📈 Know Your Numbers, Grow Your Business</h4>
          <p class="gd-subtitle">Data-driven businesses grow 3x faster. Learn to extract actionable insights from every part of your CRM.</p>
          <div class="gd-overview"><p>Analytics turn your CRM data into <strong>actionable insights</strong>. See which campaigns are driving revenue, which agents are closing the most deals, where leads are getting stuck in the pipeline, and what your ROI is on every rupee spent. <strong>If you can't measure it, you can't improve it.</strong> This guide covers all report types, customization, and export options.</p></div>

          <div class="gd-section-title"><i class="fas fa-file-alt" style="color:#3b82f6;"></i> Available Reports</div>
          <div class="gd-report-grid">
            <div class="gd-report-card"><h6>📨 Campaign Performance</h6><p>Sent, delivered, read, replied rates. Compare campaigns side-by-side. ROI per campaign.</p></div>
            <div class="gd-report-card"><h6>👥 Agent Leaderboard</h6><p>Leads handled, conversion rate, response time, deals closed, revenue generated per agent.</p></div>
            <div class="gd-report-card"><h6>💰 Revenue Overview</h6><p>Daily/weekly/monthly revenue. Won deals vs lost. Average deal size. Revenue by source.</p></div>
            <div class="gd-report-card"><h6>🎯 Lead Conversion Funnel</h6><p>Leads at each pipeline stage. Conversion % between stages. Bottleneck identification.</p></div>
            <div class="gd-report-card"><h6>⭐ Customer Lifetime Value</h6><p>Total revenue per customer. Repeat purchase rate. Churn analysis. VIP identification.</p></div>
            <div class="gd-report-card"><h6>📊 Custom Reports</h6><p>Build your own: choose metrics, filters, date range, visualization. Save and schedule.</p></div>
          </div>

          <div class="gd-section-title"><i class="fas fa-list-ol" style="color:#3b82f6;"></i> Analytics Steps</div>
          
          <div class="gd-step"><div class="gd-step-num">1</div><div class="gd-step-content"><h6>Reports Dashboard — Your Analytics Home</h6><p>Access from <strong>Analytics → Reports Dashboard</strong>. Pre-built reports organized by category: <strong>Campaign Reports</strong> (performance of every campaign — sent, delivered, read, replied, clicked, converted), <strong>Agent Reports</strong> (individual and team performance — leads handled, conversion rate, response time, revenue generated), <strong>Revenue Reports</strong> (income tracking — won deals, pending payments, revenue by source/channel), <strong>Lead Reports</strong> (pipeline health — leads by stage, conversion funnel, stuck deals, source analysis).</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">2</div><div class="gd-step-content"><h6>Campaign Analytics — What's Working?</h6><p>For each campaign, see: <strong>Delivery funnel:</strong> Sent → Delivered → Read → Replied → Clicked (for links) → Converted. <strong>Engagement metrics:</strong> Open rate, reply rate, click-through rate, conversion rate. <strong>Revenue metrics:</strong> Total revenue generated, revenue per message, ROI (revenue ÷ campaign cost). <strong>Compare campaigns</strong> side-by-side — identify what messaging, timing, and audience works best. <strong>A/B test results:</strong> See which variant won and by what margin.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">3</div><div class="gd-step-content"><h6>Agent Performance — Who's Your Top Performer?</h6><p>Track per agent: <strong>Leads handled</strong> (total, this week, this month), <strong>Conversion rate</strong> (% of leads → won deals), <strong>Response time</strong> (average time to first reply — target: < 5 minutes), <strong>Messages sent</strong> (total outbound communications), <strong>Deals closed</strong> (count and total value), <strong>Revenue generated</strong> (sum of won deal values), <strong>Customer satisfaction</strong> (average CSAT score from post-chat surveys). <strong>Gamification:</strong> Badges and leaderboards to motivate healthy competition. Identify top performers for rewards and struggling agents for coaching.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">4</div><div class="gd-step-content"><h6>Custom Reports — Build Your Own</h6><p>Create reports tailored to your business: <strong>Choose metrics:</strong> Pick from 50+ data points (leads created, messages sent, deals won, revenue, etc.). <strong>Add filters:</strong> By date range, agent, campaign, lead source, pipeline stage, tag. <strong>Select visualization:</strong> Bar chart, line graph, pie chart, data table, or summary cards. <strong>Save & schedule:</strong> Save custom reports for quick access. Schedule auto-delivery via email — daily, weekly, or monthly to yourself or stakeholders. <strong>Share:</strong> Generate shareable links with optional password protection.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">5</div><div class="gd-step-content"><h6>Export, Alerts & Action</h6><p><strong>Export data:</strong> Download reports as CSV, Excel, or PDF. Perfect for board meetings, investor updates, or deeper analysis in spreadsheets. <strong>Set up alerts:</strong> Get notified when metrics drop below normal — "Campaign open rate fell below 40%", "Agent response time exceeded 10 minutes", "Weekly leads dropped by 20%". Alerts via WhatsApp, email, or in-app notification. <strong>Take action:</strong> Every report has direct links to the relevant module — see a stuck deal? Click to open it. Low campaign performance? Jump to edit the campaign.</p></div></div>

          <div class="gd-tips-card">
            <h5><i class="fas fa-lightbulb" style="color:#f59e0b;"></i> Pro Tips</h5>
            <ul>
              <li><strong>Set up anomaly alerts immediately</strong> — catch problems before they become crises (e.g., sudden drop in lead volume).</li>
              <li><strong>Compare periods:</strong> Always view "This Month vs Last Month" to spot trends — not just absolute numbers.</li>
              <li><strong>Use the ROI calculator</strong> (separate tool in Knowledge Hub) to justify your CRM investment to management.</li>
              <li><strong>Schedule a weekly report email</strong> every Monday morning — start your week with data, not guesswork.</li>
            </ul>
          </div>

          <h5 style="font-weight:700;margin-top:28px;color:#0f172a;">🔗 Related Guides</h5>
          <div class="gd-related">
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('dashboard')">📊 Dashboard Overview</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('campaigns')">📨 Campaign Creation</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('agents')">👥 Team Management</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('settings')">⚙️ Settings & Profile</span>
          </div>
        </div>

        <div class="gd-upsell"><div><h5>📊 Advanced Analytics & Custom Reports</h5><p>Free plan: Basic reports, CSV export. Pro: Custom dashboards, PDF reports, API access, and scheduled report delivery.</p></div><button class="gd-btn gd-btn-primary" onclick="Plan.render()"><i class="fas fa-crown"></i> Unlock Advanced Analytics</button></div>

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
    PlatformDocs.markComplete('analytics');
    PlatformDocs.currentGuide = 'analytics';
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
      if (!pg['analytics'] || pg['analytics'] < 10) {
        pg['analytics'] = 10;
        await docRef.set({ platformGuides: pg, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    } catch (e) { console.error('Progress error:', e); }
  }
};
window.AnalyticsGuide = AnalyticsGuide;