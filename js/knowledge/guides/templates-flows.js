// js/knowledge/guides/templates-flows.js — Templates & Flows Guide
const TemplatesFlowsGuide = {
  guideId: 'templates-flows',

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
        .gd-breadcrumb span { cursor: pointer; transition: color 0.2s; } .gd-breadcrumb span:hover { color: #8b5cf6; }
        .gd-hero { background: #fff; border-radius: 20px; padding: 36px 32px; margin-bottom: 24px; border: 1px solid #f1f5f9; position: relative; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #8b5cf6, #7c3aed, #8b5cf6); }
        .gd-hero-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #fff; margin-bottom: 16px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
        .gd-hero h3 { font-weight: 900; font-size: 28px; margin: 0 0 10px; color: #0f172a; line-height: 1.3; }
        .gd-hero p { color: #64748b; font-size: 15px; margin: 0; max-width: 700px; line-height: 1.7; }
        .gd-hero-meta { display: flex; gap: 18px; margin-top: 18px; flex-wrap: wrap; align-items: center; }
        .gd-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; } .gd-meta-item i { color: #8b5cf6; font-size: 14px; }
        .gd-hero-actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
        .gd-btn { padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .gd-btn-primary { background: #8b5cf6; color: #fff; } .gd-btn-primary:hover { background: #7c3aed; transform: scale(1.03); }
        .gd-btn-outline { background: #fff; color: #8b5cf6; border: 1px solid #8b5cf6; } .gd-btn-outline:hover { background: #f5f3ff; }
        .gd-btn-success { background: #10b981; color: #fff; } .gd-btn-success:hover { background: #059669; transform: scale(1.03); }
        .gd-btn-completed { background: #d1d5db; color: #fff; cursor: default; } .gd-btn-completed:hover { transform: none; }
        .gd-content-card { background: #fff; border-radius: 20px; padding: 32px; margin-bottom: 20px; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-content-card h4 { font-weight: 800; font-size: 20px; margin: 0 0 8px; color: #0f172a; }
        .gd-content-card .gd-subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
        .gd-overview { background: #f5f3ff; border-radius: 14px; padding: 20px 24px; margin-bottom: 28px; border-left: 4px solid #8b5cf6; }
        .gd-overview p { margin: 0; font-size: 14px; color: #4c1d95; line-height: 1.8; }
        .gd-section-title { font-weight: 800; font-size: 18px; color: #0f172a; margin: 28px 0 16px; display: flex; align-items: center; gap: 8px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9; }
        .gd-step { display: flex; gap: 16px; padding: 20px 0; border-bottom: 1px solid #f1f5f9; align-items: flex-start; }
        .gd-step:last-child { border-bottom: none; }
        .gd-step-num { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 17px; flex-shrink: 0; }
        .gd-step-content { flex: 1; } .gd-step-content h6 { font-weight: 700; font-size: 15px; margin: 0 0 4px; color: #0f172a; }
        .gd-step-content p { font-size: 14px; color: #475569; margin: 0; line-height: 1.7; }
        .gd-feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin: 14px 0; }
        .gd-feature-card { background: #f8fafc; border-radius: 12px; padding: 14px 16px; border: 1px solid #e2e8f0; }
        .gd-feature-card h6 { font-weight: 700; font-size: 13px; margin: 0 0 3px; } .gd-feature-card p { font-size: 11px; color: #64748b; margin: 0; }
        .gd-tips-card { background: linear-gradient(135deg, #fef3c7, #fffbeb); border-radius: 16px; padding: 22px 26px; margin-top: 24px; border: 1px solid #fcd34d; }
        .gd-tips-card h5 { font-weight: 800; color: #92400e; margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
        .gd-tips-card ul { margin: 0; padding-left: 20px; } .gd-tips-card li { font-size: 13px; color: #a16207; margin-bottom: 6px; line-height: 1.6; } .gd-tips-card li:last-child { margin-bottom: 0; }
        .gd-related { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
        .gd-related-pill { padding: 9px 18px; border-radius: 20px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 13px; cursor: pointer; transition: 0.2s; color: #475569; display: inline-flex; align-items: center; gap: 6px; }
        .gd-related-pill:hover { background: #f5f3ff; border-color: #8b5cf6; color: #8b5cf6; }
        .gd-upsell { background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 18px; padding: 28px 32px; margin-top: 28px; border: 1px solid #c7d2fe; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .gd-upsell h5 { font-weight: 800; color: #3730a3; margin: 0; font-size: 18px; } .gd-upsell p { color: #4f46e5; margin: 4px 0 0; font-size: 14px; }
        .gd-nav-btns { display: flex; justify-content: space-between; margin-top: 32px; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 768px) { .gd-hero { padding: 24px 18px; } .gd-hero h3 { font-size: 22px; } .gd-content-card { padding: 20px 16px; } .gd-step { flex-direction: column; gap: 10px; } .gd-feature-grid { grid-template-columns: 1fr; } .gd-upsell { flex-direction: column; text-align: center; } .gd-nav-btns { flex-direction: column; align-items: stretch; } }
      </style>

      <div class="gd-wrap">
        <div class="gd-back-row">
          <button class="gd-back-btn" onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();"><i class="fas fa-arrow-left"></i> Back to All Guides</button>
          <div class="gd-breadcrumb"><span onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();">📖 Platform Documentation</span><i class="fas fa-chevron-right" style="font-size:10px;"></i><span style="color:#8b5cf6;font-weight:600;">Templates & Flows</span></div>
        </div>

        <div class="gd-hero">
          <div class="gd-hero-icon"><i class="fas fa-sitemap"></i></div>
          <h3>Templates & Flows — Automate Your Communication</h3>
          <p>Create reusable message templates for brand consistency and build visual automation flows that work 24/7 — saving you hours every day while delivering personalized experiences at scale.</p>
          <div class="gd-hero-meta">
            <div class="gd-meta-item"><i class="fas fa-signal"></i> 🔴 Advanced</div>
            <div class="gd-meta-item"><i class="fas fa-clock"></i> 12 min read</div>
            <div class="gd-meta-item"><i class="fas fa-layer-group"></i> 6 Steps</div>
            <div class="gd-meta-item"><i class="fas fa-globe"></i> Updated: Jul 2026</div>
          </div>
          <div class="gd-hero-actions">
            ${isCompleted ? `<button class="gd-btn gd-btn-completed"><i class="fas fa-check-circle"></i> Completed ✓</button>` : `<button class="gd-btn gd-btn-success" onclick="TemplatesFlowsGuide.triggerComplete()"><i class="fas fa-check"></i> Mark as Complete</button>`}
            <button class="gd-btn gd-btn-outline" onclick="PlatformDocs.toggleBookmark('templates-flows');PlatformDocs.currentGuide='templates-flows';PlatformDocs.render();"><i class="fas ${isBookmarked ? 'fa-star' : 'fa-star'}"></i> ${isBookmarked ? 'Bookmarked' : 'Bookmark'}</button>
            <button class="gd-btn gd-btn-outline" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
          </div>
        </div>

        <div class="gd-content-card">
          <h4>🔄 Your 24/7 Marketing & Sales Engine</h4>
          <p class="gd-subtitle">Templates ensure brand consistency. Flows automate repetitive tasks. Together, they scale your communication effortlessly.</p>
          <div class="gd-overview"><p>Templates save you from typing the same messages repeatedly. Flows automate entire sequences based on triggers — like a lead being created, a form being submitted, or a payment being received. <strong>Set it once, and it works forever.</strong> This is how you scale personalized communication to thousands of contacts without hiring more agents.</p></div>

          <div class="gd-section-title"><i class="fas fa-file-alt" style="color:#8b5cf6;"></i> Message Templates</div>
          
          <div class="gd-feature-grid">
            <div class="gd-feature-card"><h6>📝 Dynamic Variables</h6><p>Insert {{name}}, {{company}}, {{product}}, {{offer_link}}, {{expiry_date}} — auto-filled per contact.</p></div>
            <div class="gd-feature-card"><h6>✅ WhatsApp Approved</h6><p>Templates submitted to Meta for pre-approval. Approved in 24-48 hours. Ready for outbound campaigns.</p></div>
            <div class="gd-feature-card"><h6>📂 Template Categories</h6><p>Organize by: Marketing, Utility, Authentication, Support. Easy to find and reuse.</p></div>
            <div class="gd-feature-card"><h6>🎨 Rich Media</h6><p>Add images, documents, videos, and call-to-action buttons to your templates.</p></div>
          </div>

          <div class="gd-section-title"><i class="fas fa-project-diagram" style="color:#8b5cf6;"></i> Automation Flows — Build Steps</div>
          
          <div class="gd-step"><div class="gd-step-num">1</div><div class="gd-step-content"><h6>Flow Builder Overview</h6><p>The <strong>visual drag-and-drop builder</strong> lets you create automation flows without coding. Each flow has three components: <strong>Triggers</strong> (what starts the flow), <strong>Actions</strong> (what happens), and <strong>Conditions</strong> (if-then branching). Connect blocks visually to design your automation. Test with dummy data before activating.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">2</div><div class="gd-step-content"><h6>Trigger Events — What Starts a Flow</h6><p>Available triggers: <strong>New lead created</strong>, <strong>Contact added to segment</strong>, <strong>Form submitted</strong>, <strong>Payment status changed</strong> (paid/failed/refunded), <strong>Ticket created</strong>, <strong>Lead stage changed</strong> (moved to "Proposal Sent"), <strong>Custom date reached</strong> (birthday, anniversary, renewal date), <strong>Webhook received</strong> (external system trigger), <strong>WhatsApp message received</strong> (keyword-based).</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">3</div><div class="gd-step-content"><h6>Action Blocks — What the Flow Does</h6><p><strong>Send WhatsApp/Email</strong> (using templates), <strong>Update contact field</strong> (change stage, add tag, update custom field), <strong>Add/Remove from segment</strong>, <strong>Move to pipeline stage</strong>, <strong>Create task</strong> (for agent follow-up), <strong>Send webhook</strong> (to external systems), <strong>Wait/Delay</strong> (pause for minutes/hours/days), <strong>Split (Condition)</strong> — if-then branching based on contact data or behavior.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">4</div><div class="gd-step-content"><h6>Conditional Branching (If-Then Logic)</h6><p>Create personalized paths: <strong>If lead score > 50</strong> → assign to senior agent and send premium offer. <strong>If lead source = Website</strong> → send case study about web customers. <strong>If contact replied</strong> → stop sequence and notify agent. <strong>If no reply in 7 days</strong> → move to "Cold" segment for re-engagement later. Branching ensures each contact gets the right message at the right time.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">5</div><div class="gd-step-content"><h6>Pre-Built Flow Templates</h6><p>Start with ready-made templates: <strong>"Welcome New Lead"</strong> (Welcome → Wait 2 days → Case Study → Wait 2 days → Special Offer), <strong>"Abandoned Cart Recovery"</strong> (1 hour → Reminder → 24 hours → Discount → 72 hours → Last Chance), <strong>"Post-Purchase Thank You"</strong> (Thank you → 7 days → Review request → 30 days → Replenishment reminder), <strong>"Re-engagement"</strong> (Win-back message → 3 days → Special comeback offer → 7 days → Final message).</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">6</div><div class="gd-step-content"><h6>Testing, Logs & Optimization</h6><p><strong>Test mode:</strong> Run flows with dummy contacts before activating. <strong>Execution logs:</strong> See exactly which path each contact took, any errors encountered, and time taken at each step. <strong>Performance metrics:</strong> Flow completion rate, message open rate, conversion rate. <strong>Clone & modify:</strong> Duplicate successful flows and adapt them for different products, segments, or campaigns.</p></div></div>

          <div class="gd-tips-card">
            <h5><i class="fas fa-lightbulb" style="color:#f59e0b;"></i> Pro Tips</h5>
            <ul>
              <li><strong>Start with the "Welcome New Lead" flow template</strong> — this alone can increase conversion by 30% with zero ongoing effort.</li>
              <li><strong>Use the Split action</strong> to create personalized paths based on lead source, score, or location — one size does NOT fit all.</li>
              <li><strong>Clone successful flows</strong> and adapt them for different products or customer segments — don't rebuild from scratch.</li>
              <li><strong>Review flow logs weekly</strong> — identify where contacts drop off and optimize those steps.</li>
            </ul>
          </div>

          <h5 style="font-weight:700;margin-top:28px;color:#0f172a;">🔗 Related Guides</h5>
          <div class="gd-related">
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('campaigns')">📨 Campaign Creation</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('chatbot')">🤖 AI Chatbot Setup</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('integrations')">🔌 Integrations Hub</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('leads')">🎯 Managing Leads</span>
          </div>
        </div>

        <div class="gd-upsell"><div><h5>🔄 Unlimited Automation Flows</h5><p>Free plan: 2 flows. Pro: Unlimited flows with conditional branching, webhooks, and 50+ trigger events.</p></div><button class="gd-btn gd-btn-primary" onclick="Plan.render()"><i class="fas fa-crown"></i> Build Unlimited Flows</button></div>

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
    PlatformDocs.markComplete('templates-flows');
    PlatformDocs.currentGuide = 'templates-flows';
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
      if (!pg['templates-flows'] || pg['templates-flows'] < 10) {
        pg['templates-flows'] = 10;
        await docRef.set({ platformGuides: pg, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    } catch (e) { console.error('Progress error:', e); }
  }
};
window.TemplatesFlowsGuide = TemplatesFlowsGuide;