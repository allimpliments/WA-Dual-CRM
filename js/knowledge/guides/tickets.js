// js/knowledge/guides/tickets.js — Ticket System Guide
const TicketsGuide = {
  guideId: 'tickets',

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
        .gd-breadcrumb span { cursor: pointer; transition: color 0.2s; } .gd-breadcrumb span:hover { color: #dc2626; }
        .gd-hero { background: #fff; border-radius: 20px; padding: 36px 32px; margin-bottom: 24px; border: 1px solid #f1f5f9; position: relative; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #dc2626, #b91c1c, #dc2626); }
        .gd-hero-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #fff; margin-bottom: 16px; background: linear-gradient(135deg, #dc2626, #b91c1c); }
        .gd-hero h3 { font-weight: 900; font-size: 28px; margin: 0 0 10px; color: #0f172a; line-height: 1.3; }
        .gd-hero p { color: #64748b; font-size: 15px; margin: 0; max-width: 700px; line-height: 1.7; }
        .gd-hero-meta { display: flex; gap: 18px; margin-top: 18px; flex-wrap: wrap; align-items: center; }
        .gd-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; } .gd-meta-item i { color: #dc2626; font-size: 14px; }
        .gd-hero-actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
        .gd-btn { padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .gd-btn-primary { background: #dc2626; color: #fff; } .gd-btn-primary:hover { background: #b91c1c; transform: scale(1.03); }
        .gd-btn-outline { background: #fff; color: #dc2626; border: 1px solid #dc2626; } .gd-btn-outline:hover { background: #fef2f2; }
        .gd-btn-success { background: #10b981; color: #fff; } .gd-btn-success:hover { background: #059669; transform: scale(1.03); }
        .gd-btn-completed { background: #d1d5db; color: #fff; cursor: default; } .gd-btn-completed:hover { transform: none; }
        .gd-content-card { background: #fff; border-radius: 20px; padding: 32px; margin-bottom: 20px; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-content-card h4 { font-weight: 800; font-size: 20px; margin: 0 0 8px; color: #0f172a; }
        .gd-content-card .gd-subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
        .gd-overview { background: #fef2f2; border-radius: 14px; padding: 20px 24px; margin-bottom: 28px; border-left: 4px solid #dc2626; }
        .gd-overview p { margin: 0; font-size: 14px; color: #7f1d1d; line-height: 1.8; }
        .gd-section-title { font-weight: 800; font-size: 18px; color: #0f172a; margin: 28px 0 16px; display: flex; align-items: center; gap: 8px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9; }
        .gd-step { display: flex; gap: 16px; padding: 20px 0; border-bottom: 1px solid #f1f5f9; align-items: flex-start; }
        .gd-step:last-child { border-bottom: none; }
        .gd-step-num { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #dc2626, #b91c1c); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 17px; flex-shrink: 0; }
        .gd-step-content { flex: 1; } .gd-step-content h6 { font-weight: 700; font-size: 15px; margin: 0 0 4px; color: #0f172a; }
        .gd-step-content p { font-size: 14px; color: #475569; margin: 0; line-height: 1.7; }
        .gd-tips-card { background: linear-gradient(135deg, #fef3c7, #fffbeb); border-radius: 16px; padding: 22px 26px; margin-top: 24px; border: 1px solid #fcd34d; }
        .gd-tips-card h5 { font-weight: 800; color: #92400e; margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
        .gd-tips-card ul { margin: 0; padding-left: 20px; } .gd-tips-card li { font-size: 13px; color: #a16207; margin-bottom: 6px; line-height: 1.6; } .gd-tips-card li:last-child { margin-bottom: 0; }
        .gd-related { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
        .gd-related-pill { padding: 9px 18px; border-radius: 20px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 13px; cursor: pointer; transition: 0.2s; color: #475569; display: inline-flex; align-items: center; gap: 6px; }
        .gd-related-pill:hover { background: #fef2f2; border-color: #dc2626; color: #dc2626; }
        .gd-upsell { background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 18px; padding: 28px 32px; margin-top: 28px; border: 1px solid #c7d2fe; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .gd-upsell h5 { font-weight: 800; color: #3730a3; margin: 0; font-size: 18px; } .gd-upsell p { color: #4f46e5; margin: 4px 0 0; font-size: 14px; }
        .gd-nav-btns { display: flex; justify-content: space-between; margin-top: 32px; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 768px) { .gd-hero { padding: 24px 18px; } .gd-hero h3 { font-size: 22px; } .gd-content-card { padding: 20px 16px; } .gd-step { flex-direction: column; gap: 10px; } .gd-upsell { flex-direction: column; text-align: center; } .gd-nav-btns { flex-direction: column; align-items: stretch; } }
      </style>

      <div class="gd-wrap">
        <div class="gd-back-row">
          <button class="gd-back-btn" onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();"><i class="fas fa-arrow-left"></i> Back to All Guides</button>
          <div class="gd-breadcrumb"><span onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();">📖 Platform Documentation</span><i class="fas fa-chevron-right" style="font-size:10px;"></i><span style="color:#dc2626;font-weight:600;">Ticket System</span></div>
        </div>

        <div class="gd-hero">
          <div class="gd-hero-icon"><i class="fas fa-headset"></i></div>
          <h3>Ticket System — Professional Customer Support</h3>
          <p>Organize customer issues with a complete ticketing system. Create, assign, prioritize, track SLAs, and measure customer satisfaction — never lose track of a customer problem again.</p>
          <div class="gd-hero-meta">
            <div class="gd-meta-item"><i class="fas fa-signal"></i> 🟢 Beginner</div>
            <div class="gd-meta-item"><i class="fas fa-clock"></i> 6 min read</div>
            <div class="gd-meta-item"><i class="fas fa-layer-group"></i> 5 Steps</div>
            <div class="gd-meta-item"><i class="fas fa-globe"></i> Updated: Jul 2026</div>
          </div>
          <div class="gd-hero-actions">
            ${isCompleted ? `<button class="gd-btn gd-btn-completed"><i class="fas fa-check-circle"></i> Completed ✓</button>` : `<button class="gd-btn gd-btn-success" onclick="TicketsGuide.triggerComplete()"><i class="fas fa-check"></i> Mark as Complete</button>`}
            <button class="gd-btn gd-btn-outline" onclick="PlatformDocs.toggleBookmark('tickets');PlatformDocs.currentGuide='tickets';PlatformDocs.render();"><i class="fas ${isBookmarked ? 'fa-star' : 'fa-star'}"></i> ${isBookmarked ? 'Bookmarked' : 'Bookmark'}</button>
            <button class="gd-btn gd-btn-outline" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
          </div>
        </div>

        <div class="gd-content-card">
          <h4>🎫 Turn Chaos into Organized Support</h4>
          <p class="gd-subtitle">A professional ticketing system ensures every customer issue is tracked, assigned, and resolved — with full visibility.</p>
          <div class="gd-overview"><p>Customer support can make or break your business. The ticket system converts every issue — from WhatsApp messages, emails, web forms, or manual creation — into a <strong>trackable, assignable ticket</strong>. With <strong>priority levels, SLA tracking, auto-assignment, and customer satisfaction surveys</strong>, you'll deliver faster, more consistent support. Happy customers = repeat business and referrals.</p></div>

          <div class="gd-section-title"><i class="fas fa-list-ol" style="color:#dc2626;"></i> Ticket System Steps</div>
          
          <div class="gd-step"><div class="gd-step-num">1</div><div class="gd-step-content"><h6>Ticket Creation — Multiple Entry Points</h6><p>Tickets can be created from anywhere: <strong>WhatsApp message</strong> (agent clicks "Create Ticket" on any chat), <strong>Email</strong> (customer emails support@yourcompany.com → auto-creates ticket), <strong>Web form</strong> (support request form on your website), <strong>Manual creation</strong> (agent creates ticket for phone calls or walk-ins), <strong>API/Webhook</strong> (from external systems). Each ticket auto-captures: customer info, issue description, source, and timestamp.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">2</div><div class="gd-step-content"><h6>Ticket Fields & Categorization</h6><p>Every ticket has: <strong>Subject</strong> (brief summary), <strong>Description</strong> (detailed issue), <strong>Priority</strong> (🟢 Low / 🟡 Medium / 🟠 High / 🔴 Urgent), <strong>Status</strong> (Open, In Progress, Waiting on Customer, Resolved, Closed), <strong>Assigned Agent</strong>, <strong>Category</strong> (Billing, Technical, General Inquiry, Feature Request, Complaint), <strong>Attachments</strong> (screenshots, documents). Categorization helps identify patterns — if 30% of tickets are "Billing", you know where to focus improvements.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">3</div><div class="gd-step-content"><h6>Auto-Assignment & Routing</h6><p>Configure smart routing rules: <strong>Category-based:</strong> "Billing" → Finance agent, "Technical" → Tech support team. <strong>Priority-based:</strong> "Urgent" → Senior agent, "Low" → Junior agent or chatbot. <strong>Round-robin:</strong> Distribute evenly among support team. <strong>Customer-based:</strong> VIP customers → dedicated support agent. <strong>Language-based:</strong> English tickets → Team A, Hindi tickets → Team B. Manual assignment always available for exceptions.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">4</div><div class="gd-step-content"><h6>SLA Tracking — Meet Your Promises</h6><p>Set Service Level Agreement targets: <strong>Urgent:</strong> First response within 1 hour, Resolution within 4 hours. <strong>High:</strong> Response within 4 hours, Resolution within 24 hours. <strong>Medium:</strong> Response within 24 hours, Resolution within 72 hours. <strong>Low:</strong> Response within 48 hours, Resolution within 1 week. The system tracks time automatically. <strong>Auto-escalation:</strong> If SLA is breached, ticket is auto-escalated to manager with notification. <strong>SLA Dashboard:</strong> See compliance % — target: > 95%.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">5</div><div class="gd-step-content"><h6>Resolution & Customer Satisfaction</h6><p>When resolved, agent adds <strong>resolution notes</strong> (what was done, root cause). Ticket status changes to "Resolved". Customer gets auto-notification: "Your ticket #12345 has been resolved. Here's what we did: [resolution summary]". <strong>CSAT Survey:</strong> Auto-sent after resolution — "How was your experience? 😊 Good / 😐 Okay / 😞 Poor". <strong>Track CSAT scores</strong> per agent, per category, over time. <strong>Reopen tickets</strong> if customer replies — prevents duplicate tickets. <strong>Knowledge base:</strong> Convert common resolutions into help articles for self-service.</p></div></div>

          <div class="gd-tips-card">
            <h5><i class="fas fa-lightbulb" style="color:#f59e0b;"></i> Pro Tips</h5>
            <ul>
              <li><strong>Build a knowledge base from resolved tickets</strong> — turn common solutions into self-service articles that reduce future ticket volume.</li>
              <li><strong>Use ticket tags for reporting:</strong> #BugReport, #FeatureRequest, #BillingIssue — spot patterns across your ticket history.</li>
              <li><strong>Review unresolved tickets weekly</strong> — they often contain valuable product improvement ideas from real users.</li>
              <li><strong>Set realistic SLAs and communicate them</strong> — customers appreciate knowing when to expect a response, even if it's not instant.</li>
            </ul>
          </div>

          <h5 style="font-weight:700;margin-top:28px;color:#0f172a;">🔗 Related Guides</h5>
          <div class="gd-related">
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('chats')">💬 WhatsApp Chat</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('agents')">👥 Team Management</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('analytics')">📈 Analytics & Reports</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('forms')">📝 Form Builder</span>
          </div>
        </div>

        <div class="gd-upsell"><div><h5>🎫 Advanced Support Features</h5><p>Free plan: Basic ticketing. Pro: SLA tracking, auto-escalation, CSAT surveys, and advanced reporting.</p></div><button class="gd-btn gd-btn-primary" onclick="Plan.render()"><i class="fas fa-crown"></i> Upgrade Support</button></div>

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
    PlatformDocs.markComplete('tickets');
    PlatformDocs.currentGuide = 'tickets';
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
      if (!pg['tickets'] || pg['tickets'] < 10) {
        pg['tickets'] = 10;
        await docRef.set({ platformGuides: pg, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    } catch (e) { console.error('Progress error:', e); }
  }
};
window.TicketsGuide = TicketsGuide;