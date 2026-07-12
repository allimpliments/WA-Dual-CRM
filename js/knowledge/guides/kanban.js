// js/knowledge/guides/kanban.js — Kanban Pipeline Guide
const KanbanGuide = {
  guideId: 'kanban',

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
        .gd-breadcrumb span { cursor: pointer; transition: color 0.2s; } .gd-breadcrumb span:hover { color: #ec4899; }
        .gd-hero { background: #fff; border-radius: 20px; padding: 36px 32px; margin-bottom: 24px; border: 1px solid #f1f5f9; position: relative; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #ec4899, #db2777, #ec4899); }
        .gd-hero-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #fff; margin-bottom: 16px; background: linear-gradient(135deg, #ec4899, #db2777); }
        .gd-hero h3 { font-weight: 900; font-size: 28px; margin: 0 0 10px; color: #0f172a; line-height: 1.3; }
        .gd-hero p { color: #64748b; font-size: 15px; margin: 0; max-width: 700px; line-height: 1.7; }
        .gd-hero-meta { display: flex; gap: 18px; margin-top: 18px; flex-wrap: wrap; align-items: center; }
        .gd-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; } .gd-meta-item i { color: #ec4899; font-size: 14px; }
        .gd-hero-actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
        .gd-btn { padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .gd-btn-primary { background: #ec4899; color: #fff; } .gd-btn-primary:hover { background: #db2777; transform: scale(1.03); }
        .gd-btn-outline { background: #fff; color: #ec4899; border: 1px solid #ec4899; } .gd-btn-outline:hover { background: #fdf2f8; }
        .gd-btn-success { background: #10b981; color: #fff; } .gd-btn-success:hover { background: #059669; transform: scale(1.03); }
        .gd-btn-completed { background: #d1d5db; color: #fff; cursor: default; } .gd-btn-completed:hover { transform: none; }
        .gd-content-card { background: #fff; border-radius: 20px; padding: 32px; margin-bottom: 20px; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-content-card h4 { font-weight: 800; font-size: 20px; margin: 0 0 8px; color: #0f172a; }
        .gd-content-card .gd-subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
        .gd-overview { background: #fdf2f8; border-radius: 14px; padding: 20px 24px; margin-bottom: 28px; border-left: 4px solid #ec4899; }
        .gd-overview p { margin: 0; font-size: 14px; color: #831843; line-height: 1.8; }
        .gd-section-title { font-weight: 800; font-size: 18px; color: #0f172a; margin: 28px 0 16px; display: flex; align-items: center; gap: 8px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9; }
        .gd-step { display: flex; gap: 16px; padding: 20px 0; border-bottom: 1px solid #f1f5f9; align-items: flex-start; }
        .gd-step:last-child { border-bottom: none; }
        .gd-step-num { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #ec4899, #db2777); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 17px; flex-shrink: 0; }
        .gd-step-content { flex: 1; } .gd-step-content h6 { font-weight: 700; font-size: 15px; margin: 0 0 4px; color: #0f172a; }
        .gd-step-content p { font-size: 14px; color: #475569; margin: 0; line-height: 1.7; }
        .gd-tips-card { background: linear-gradient(135deg, #fef3c7, #fffbeb); border-radius: 16px; padding: 22px 26px; margin-top: 24px; border: 1px solid #fcd34d; }
        .gd-tips-card h5 { font-weight: 800; color: #92400e; margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
        .gd-tips-card ul { margin: 0; padding-left: 20px; } .gd-tips-card li { font-size: 13px; color: #a16207; margin-bottom: 6px; line-height: 1.6; } .gd-tips-card li:last-child { margin-bottom: 0; }
        .gd-related { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
        .gd-related-pill { padding: 9px 18px; border-radius: 20px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 13px; cursor: pointer; transition: 0.2s; color: #475569; display: inline-flex; align-items: center; gap: 6px; }
        .gd-related-pill:hover { background: #fdf2f8; border-color: #ec4899; color: #ec4899; }
        .gd-upsell { background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 18px; padding: 28px 32px; margin-top: 28px; border: 1px solid #c7d2fe; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .gd-upsell h5 { font-weight: 800; color: #3730a3; margin: 0; font-size: 18px; } .gd-upsell p { color: #4f46e5; margin: 4px 0 0; font-size: 14px; }
        .gd-nav-btns { display: flex; justify-content: space-between; margin-top: 32px; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 768px) { .gd-hero { padding: 24px 18px; } .gd-hero h3 { font-size: 22px; } .gd-content-card { padding: 20px 16px; } .gd-step { flex-direction: column; gap: 10px; } .gd-upsell { flex-direction: column; text-align: center; } .gd-nav-btns { flex-direction: column; align-items: stretch; } }
      </style>

      <div class="gd-wrap">
        <div class="gd-back-row">
          <button class="gd-back-btn" onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();"><i class="fas fa-arrow-left"></i> Back to All Guides</button>
          <div class="gd-breadcrumb"><span onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();">📖 Platform Documentation</span><i class="fas fa-chevron-right" style="font-size:10px;"></i><span style="color:#ec4899;font-weight:600;">Kanban Pipeline</span></div>
        </div>

        <div class="gd-hero">
          <div class="gd-hero-icon"><i class="fas fa-columns"></i></div>
          <h3>Kanban Pipeline — Visual Sales Management</h3>
          <p>Visualize your entire sales pipeline with drag-and-drop simplicity. See exactly where every deal stands, identify bottlenecks instantly, and forecast revenue with clarity.</p>
          <div class="gd-hero-meta">
            <div class="gd-meta-item"><i class="fas fa-signal"></i> 🟢 Beginner</div>
            <div class="gd-meta-item"><i class="fas fa-clock"></i> 5 min read</div>
            <div class="gd-meta-item"><i class="fas fa-layer-group"></i> 5 Steps</div>
            <div class="gd-meta-item"><i class="fas fa-globe"></i> Updated: Jul 2026</div>
          </div>
          <div class="gd-hero-actions">
            ${isCompleted ? `<button class="gd-btn gd-btn-completed"><i class="fas fa-check-circle"></i> Completed ✓</button>` : `<button class="gd-btn gd-btn-success" onclick="KanbanGuide.triggerComplete()"><i class="fas fa-check"></i> Mark as Complete</button>`}
            <button class="gd-btn gd-btn-outline" onclick="PlatformDocs.toggleBookmark('kanban');PlatformDocs.currentGuide='kanban';PlatformDocs.render();"><i class="fas ${isBookmarked ? 'fa-star' : 'fa-star'}"></i> ${isBookmarked ? 'Bookmarked' : 'Bookmark'}</button>
            <button class="gd-btn gd-btn-outline" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
          </div>
        </div>

        <div class="gd-content-card">
          <h4>📋 Your Pipeline at a Glance</h4>
          <p class="gd-subtitle">The Kanban board gives you a bird's-eye view of your entire sales process — no more spreadsheets or guesswork.</p>
          <div class="gd-overview"><p>The Kanban view transforms your pipeline into a <strong>visual board</strong> where each column is a stage and each card is a deal. Simply <strong>drag and drop</strong> deals from one stage to the next as they progress. It's the fastest way to understand your pipeline health, spot stuck deals, and forecast revenue — all without running a single report.</p></div>

          <div class="gd-section-title"><i class="fas fa-list-ol" style="color:#ec4899;"></i> Kanban Pipeline Steps</div>
          
          <div class="gd-step"><div class="gd-step-num">1</div><div class="gd-step-content"><h6>Understanding the Kanban Board</h6><p>Each <strong>column</strong> represents a pipeline stage (New, Contacted, Qualified, Proposal Sent, Negotiation, Won, Lost). Each <strong>card</strong> represents a lead/deal showing: contact name, company, deal value (₹), assigned agent avatar, days in current stage, and a color-coded priority indicator (🔴 urgent, 🟡 follow-up, 🟢 on-track). The board gives you an instant answer to: "Where is my revenue coming from this month?"</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">2</div><div class="gd-step-content"><h6>Drag & Drop — Move Deals Instantly</h6><p>Simply <strong>drag a card</strong> from one column and drop it into the next to update the deal's stage. The system automatically: logs the stage change with timestamp, notifies the assigned agent, updates the contact's timeline, and recalculates pipeline metrics. You can also <strong>drag to reorder</strong> deals within a column to prioritize. It's that simple — no forms, no dropdowns, just drag.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">3</div><div class="gd-step-content"><h6>Quick Actions on Cards</h6><p>Click any card to open a quick action panel: <strong>Send Message</strong> (WhatsApp directly), <strong>Add Note</strong> (internal comment), <strong>Schedule Follow-up</strong> (creates task), <strong>Change Owner</strong> (reassign to another agent), <strong>Edit Deal Value</strong>, <strong>View Full Profile</strong> (opens contact details). All actions are one click away — no need to navigate away from the board.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">4</div><div class="gd-step-content"><h6>Filters & Custom Views</h6><p>Filter the board by: <strong>Owner</strong> (see only your deals or a specific agent's), <strong>Deal value range</strong> (focus on high-value deals > ₹50,000), <strong>Created date</strong> (this week, this month), <strong>Expected close date</strong> (closing this month). <strong>Save custom views</strong> for quick access — e.g., "My Hot Deals This Month", "Team Mumbai Pipeline", "Deals Over ₹1 Lakh". Toggle between <strong>Kanban view</strong> and <strong>List view</strong> anytime.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">5</div><div class="gd-step-content"><h6>Revenue Forecasting</h6><p>The board automatically calculates: <strong>Total pipeline value</strong> (sum of all deal values), <strong>Weighted forecast</strong> (deal value × probability based on stage: Qualified=20%, Proposal=50%, Negotiation=80%), <strong>Expected revenue this month</strong> (deals with close date this month), <strong>Stuck deals</strong> (deals sitting in one stage > 14 days — needs attention). Use this for accurate sales forecasting and resource planning.</p></div></div>

          <div class="gd-tips-card">
            <h5><i class="fas fa-lightbulb" style="color:#f59e0b;"></i> Pro Tips</h5>
            <ul>
              <li><strong>Color-code cards by priority</strong> — red for urgent (needs action today), yellow for follow-up (this week), green for on-track.</li>
              <li><strong>Set expected close dates</strong> on every deal — this powers accurate revenue forecasting and helps you prioritize.</li>
              <li><strong>Review the "Stuck Deals" filter weekly</strong> — deals sitting in one stage for 14+ days are at risk of going cold.</li>
              <li><strong>Use the Kanban + List toggle</strong> — Kanban for visual overview, List for detailed data entry and bulk edits.</li>
            </ul>
          </div>

          <h5 style="font-weight:700;margin-top:28px;color:#0f172a;">🔗 Related Guides</h5>
          <div class="gd-related">
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('leads')">🎯 Managing Leads</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('analytics')">📈 Analytics & Reports</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('settings')">⚙️ Settings & Profile</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('agents')">👥 Team Management</span>
          </div>
        </div>

        <div class="gd-upsell"><div><h5>📊 Advanced Pipeline Analytics</h5><p>Free plan: Basic Kanban. Pro: Custom pipeline stages, revenue forecasting, saved views, and team performance tracking.</p></div><button class="gd-btn gd-btn-primary" onclick="Plan.render()"><i class="fas fa-crown"></i> Unlock Pro Features</button></div>

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
    PlatformDocs.markComplete('kanban');
    PlatformDocs.currentGuide = 'kanban';
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
      if (!pg['kanban'] || pg['kanban'] < 10) {
        pg['kanban'] = 10;
        await docRef.set({ platformGuides: pg, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    } catch (e) { console.error('Progress error:', e); }
  }
};
window.KanbanGuide = KanbanGuide;