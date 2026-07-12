// js/knowledge/guides/leads.js — Managing Leads Guide
const LeadsGuide = {
  guideId: 'leads',

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
        .gd-tips-card { background: linear-gradient(135deg, #fef3c7, #fffbeb); border-radius: 16px; padding: 22px 26px; margin-top: 24px; border: 1px solid #fcd34d; }
        .gd-tips-card h5 { font-weight: 800; color: #92400e; margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
        .gd-tips-card ul { margin: 0; padding-left: 20px; } .gd-tips-card li { font-size: 13px; color: #a16207; margin-bottom: 6px; line-height: 1.6; } .gd-tips-card li:last-child { margin-bottom: 0; }
        .gd-related { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
        .gd-related-pill { padding: 9px 18px; border-radius: 20px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 13px; cursor: pointer; transition: 0.2s; color: #475569; display: inline-flex; align-items: center; gap: 6px; }
        .gd-related-pill:hover { background: #fef3c7; border-color: #f59e0b; color: #f59e0b; }
        .gd-upsell { background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 18px; padding: 28px 32px; margin-top: 28px; border: 1px solid #c7d2fe; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .gd-upsell h5 { font-weight: 800; color: #3730a3; margin: 0; font-size: 18px; } .gd-upsell p { color: #4f46e5; margin: 4px 0 0; font-size: 14px; }
        .gd-nav-btns { display: flex; justify-content: space-between; margin-top: 32px; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 768px) { .gd-hero { padding: 24px 18px; } .gd-hero h3 { font-size: 22px; } .gd-content-card { padding: 20px 16px; } .gd-step { flex-direction: column; gap: 10px; } .gd-upsell { flex-direction: column; text-align: center; } .gd-nav-btns { flex-direction: column; align-items: stretch; } }
      </style>

      <div class="gd-wrap">
        <div class="gd-back-row">
          <button class="gd-back-btn" onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();"><i class="fas fa-arrow-left"></i> Back to All Guides</button>
          <div class="gd-breadcrumb"><span onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();">📖 Platform Documentation</span><i class="fas fa-chevron-right" style="font-size:10px;"></i><span style="color:#f59e0b;font-weight:600;">Managing Leads</span></div>
        </div>

        <div class="gd-hero">
          <div class="gd-hero-icon"><i class="fas fa-funnel-dollar"></i></div>
          <h3>Managing Leads — Capture, Track & Convert</h3>
          <p>Complete lead lifecycle management — from capturing leads through multiple channels to qualifying, nurturing, and converting them into paying customers. Master the pipeline that drives your revenue.</p>
          <div class="gd-hero-meta">
            <div class="gd-meta-item"><i class="fas fa-signal"></i> 🟡 Intermediate</div>
            <div class="gd-meta-item"><i class="fas fa-clock"></i> 10 min read</div>
            <div class="gd-meta-item"><i class="fas fa-layer-group"></i> 6 Steps</div>
            <div class="gd-meta-item"><i class="fas fa-globe"></i> Updated: Jul 2026</div>
          </div>
          <div class="gd-hero-actions">
            ${isCompleted ? `<button class="gd-btn gd-btn-completed"><i class="fas fa-check-circle"></i> Completed ✓</button>` : `<button class="gd-btn gd-btn-success" onclick="LeadsGuide.triggerComplete()"><i class="fas fa-check"></i> Mark as Complete</button>`}
            <button class="gd-btn gd-btn-outline" onclick="PlatformDocs.toggleBookmark('leads');PlatformDocs.currentGuide='leads';PlatformDocs.render();"><i class="fas ${isBookmarked ? 'fa-star' : 'fa-star'}"></i> ${isBookmarked ? 'Bookmarked' : 'Bookmark'}</button>
            <button class="gd-btn gd-btn-outline" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
          </div>
        </div>

        <div class="gd-content-card">
          <h4>🎯 The Lead Lifecycle</h4>
          <p class="gd-subtitle">Understand how leads move from first contact to closed deal — and how to optimize every stage.</p>
          <div class="gd-overview"><p>Leads are the lifeblood of your business. A well-managed lead pipeline can <strong>double your conversion rate</strong>. This guide covers everything: adding leads through multiple channels, qualifying them with lead scoring, tracking them through pipeline stages, nurturing with automated sequences, and finally converting them into customers.</p></div>

          <div class="gd-section-title"><i class="fas fa-list-ol" style="color:#f59e0b;"></i> Lead Management Steps</div>
          
          <div class="gd-step"><div class="gd-step-num">1</div><div class="gd-step-content"><h6>Adding Leads — Multiple Entry Points</h6><p>Leads can enter your CRM through: <strong>Manual entry</strong> (+ Add Lead button), <strong>CSV/Excel import</strong> (bulk upload), <strong>Web forms</strong> (auto-capture from your website), <strong>WhatsApp chat</strong> (convert a contact to lead with one click), <strong>Social media</strong> (Instagram DM, Facebook comment), <strong>API integration</strong> (from your app or landing page).</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">2</div><div class="gd-step-content"><h6>Lead Qualification & Scoring</h6><p>Not all leads are equal. Use <strong>lead scoring</strong> to prioritize: assign points for source (Web=10, Referral=30, Event=25), engagement (opened email=5, replied=20, clicked link=15), and budget (High=30, Medium=15, Low=5). Hot leads (score > 50) get priority assignment to senior agents. Cold leads (score < 20) go into nurture sequences.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">3</div><div class="gd-step-content"><h6>Pipeline Stage Management</h6><p>Default stages: <strong>New → Contacted → Qualified → Proposal Sent → Negotiation → Won/Lost.</strong> Customize these in Settings → Pipeline to match your exact sales process. Drag leads between stages on the Kanban board. The system auto-logs every stage change with timestamp and agent name.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">4</div><div class="gd-step-content"><h6>Auto-Assignment Rules</h6><p>Configure automatic lead distribution: <strong>Round-robin</strong> (fair distribution among all agents), <strong>Source-based</strong> (web leads → Agent A, WhatsApp leads → Agent B), <strong>Location-based</strong> (Mumbai leads → Mumbai team), <strong>Score-based</strong> (Hot leads → Senior agents, Cold leads → Junior agents). Set max leads per agent to prevent overload.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">5</div><div class="gd-step-content"><h6>Lead Nurturing with Drip Sequences</h6><p>Set up automated follow-up sequences: <strong>Day 1:</strong> Welcome message with introduction, <strong>Day 3:</strong> Case study or testimonial, <strong>Day 7:</strong> Special limited-time offer, <strong>Day 14:</strong> Follow-up call reminder for agent. Leads who engage get moved to "Warm" — those who don't get recycled after 30 days.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">6</div><div class="gd-step-content"><h6>Conversion Tracking & Reporting</h6><p>Mark leads as <strong>Won</strong> or <strong>Lost</strong> with reason codes (Budget, Not Interested, Competitor, Bad Timing). Track: conversion rate by source, by agent, by campaign. Lost leads can be <strong>recycled</strong> after 30-90 days for re-engagement campaigns. Use the Lead Funnel report to identify bottlenecks.</p></div></div>

          <div class="gd-tips-card">
            <h5><i class="fas fa-lightbulb" style="color:#f59e0b;"></i> Pro Tips</h5>
            <ul>
              <li><strong>Use bulk update</strong> (select multiple leads → Change Stage) to save hours when moving leads in batches.</li>
              <li><strong>Enable lead duplicate detection</strong> in Settings — prevents contacting the same person twice from different sources.</li>
              <li><strong>Export your lead database monthly</strong> as a backup (Settings → Data Export).</li>
              <li><strong>Review the "Stuck Deals" report weekly</strong> — leads sitting in one stage for too long need attention.</li>
            </ul>
          </div>

          <h5 style="font-weight:700;margin-top:28px;color:#0f172a;">🔗 Related Guides</h5>
          <div class="gd-related">
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('contacts')">📇 Contacts Management</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('kanban')">📋 Kanban Pipeline</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('forms')">📝 Form Builder</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('campaigns')">📨 Campaign Creation</span>
          </div>
        </div>

        <div class="gd-upsell"><div><h5>📈 Unlimited Leads & Advanced Features</h5><p>Free plan: 500 leads. Pro: Unlimited leads, auto-assignment rules, lead scoring, and drip automation.</p></div><button class="gd-btn gd-btn-primary" onclick="Plan.render()"><i class="fas fa-crown"></i> Unlock Unlimited Leads</button></div>

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
    PlatformDocs.markComplete('leads');
    PlatformDocs.currentGuide = 'leads';
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
      if (!pg['leads'] || pg['leads'] < 10) {
        pg['leads'] = 10;
        await docRef.set({ platformGuides: pg, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    } catch (e) { console.error('Progress error:', e); }
  }
};
window.LeadsGuide = LeadsGuide;