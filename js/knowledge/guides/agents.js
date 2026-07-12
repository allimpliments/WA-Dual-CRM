// js/knowledge/guides/agents.js — Team & Agent Management Guide
const AgentsGuide = {
  guideId: 'agents',

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
        .gd-breadcrumb span { cursor: pointer; transition: color 0.2s; } .gd-breadcrumb span:hover { color: #0f766e; }
        .gd-hero { background: #fff; border-radius: 20px; padding: 36px 32px; margin-bottom: 24px; border: 1px solid #f1f5f9; position: relative; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #0f766e, #115e59, #0f766e); }
        .gd-hero-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #fff; margin-bottom: 16px; background: linear-gradient(135deg, #0f766e, #115e59); }
        .gd-hero h3 { font-weight: 900; font-size: 28px; margin: 0 0 10px; color: #0f172a; line-height: 1.3; }
        .gd-hero p { color: #64748b; font-size: 15px; margin: 0; max-width: 700px; line-height: 1.7; }
        .gd-hero-meta { display: flex; gap: 18px; margin-top: 18px; flex-wrap: wrap; align-items: center; }
        .gd-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; } .gd-meta-item i { color: #0f766e; font-size: 14px; }
        .gd-hero-actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
        .gd-btn { padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .gd-btn-primary { background: #0f766e; color: #fff; } .gd-btn-primary:hover { background: #115e59; transform: scale(1.03); }
        .gd-btn-outline { background: #fff; color: #0f766e; border: 1px solid #0f766e; } .gd-btn-outline:hover { background: #f0fdfa; }
        .gd-btn-success { background: #10b981; color: #fff; } .gd-btn-success:hover { background: #059669; transform: scale(1.03); }
        .gd-btn-completed { background: #d1d5db; color: #fff; cursor: default; } .gd-btn-completed:hover { transform: none; }
        .gd-content-card { background: #fff; border-radius: 20px; padding: 32px; margin-bottom: 20px; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-content-card h4 { font-weight: 800; font-size: 20px; margin: 0 0 8px; color: #0f172a; }
        .gd-content-card .gd-subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
        .gd-overview { background: #f0fdfa; border-radius: 14px; padding: 20px 24px; margin-bottom: 28px; border-left: 4px solid #0f766e; }
        .gd-overview p { margin: 0; font-size: 14px; color: #134e4a; line-height: 1.8; }
        .gd-section-title { font-weight: 800; font-size: 18px; color: #0f172a; margin: 28px 0 16px; display: flex; align-items: center; gap: 8px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9; }
        .gd-step { display: flex; gap: 16px; padding: 20px 0; border-bottom: 1px solid #f1f5f9; align-items: flex-start; }
        .gd-step:last-child { border-bottom: none; }
        .gd-step-num { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #0f766e, #115e59); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 17px; flex-shrink: 0; }
        .gd-step-content { flex: 1; } .gd-step-content h6 { font-weight: 700; font-size: 15px; margin: 0 0 4px; color: #0f172a; }
        .gd-step-content p { font-size: 14px; color: #475569; margin: 0; line-height: 1.7; }
        .gd-role-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 14px 0; }
        .gd-role-card { border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; background: #f8fafc; }
        .gd-role-card h6 { font-weight: 700; font-size: 13px; margin: 0 0 4px; display: flex; align-items: center; gap: 6px; } .gd-role-card p { font-size: 11px; color: #64748b; margin: 0; }
        .gd-tips-card { background: linear-gradient(135deg, #fef3c7, #fffbeb); border-radius: 16px; padding: 22px 26px; margin-top: 24px; border: 1px solid #fcd34d; }
        .gd-tips-card h5 { font-weight: 800; color: #92400e; margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
        .gd-tips-card ul { margin: 0; padding-left: 20px; } .gd-tips-card li { font-size: 13px; color: #a16207; margin-bottom: 6px; line-height: 1.6; } .gd-tips-card li:last-child { margin-bottom: 0; }
        .gd-related { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
        .gd-related-pill { padding: 9px 18px; border-radius: 20px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 13px; cursor: pointer; transition: 0.2s; color: #475569; display: inline-flex; align-items: center; gap: 6px; }
        .gd-related-pill:hover { background: #f0fdfa; border-color: #0f766e; color: #0f766e; }
        .gd-upsell { background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 18px; padding: 28px 32px; margin-top: 28px; border: 1px solid #c7d2fe; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .gd-upsell h5 { font-weight: 800; color: #3730a3; margin: 0; font-size: 18px; } .gd-upsell p { color: #4f46e5; margin: 4px 0 0; font-size: 14px; }
        .gd-nav-btns { display: flex; justify-content: space-between; margin-top: 32px; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 768px) { .gd-hero { padding: 24px 18px; } .gd-hero h3 { font-size: 22px; } .gd-content-card { padding: 20px 16px; } .gd-step { flex-direction: column; gap: 10px; } .gd-role-grid { grid-template-columns: 1fr; } .gd-upsell { flex-direction: column; text-align: center; } .gd-nav-btns { flex-direction: column; align-items: stretch; } }
      </style>

      <div class="gd-wrap">
        <div class="gd-back-row">
          <button class="gd-back-btn" onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();"><i class="fas fa-arrow-left"></i> Back to All Guides</button>
          <div class="gd-breadcrumb"><span onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();">📖 Platform Documentation</span><i class="fas fa-chevron-right" style="font-size:10px;"></i><span style="color:#0f766e;font-weight:600;">Team & Agent Management</span></div>
        </div>

        <div class="gd-hero">
          <div class="gd-hero-icon"><i class="fas fa-user-tie"></i></div>
          <h3>Team & Agent Management — Scale Your Sales Force</h3>
          <p>Invite team members, assign roles and permissions, manage workloads, and track performance. Build a high-performing sales team with the right tools and visibility.</p>
          <div class="gd-hero-meta">
            <div class="gd-meta-item"><i class="fas fa-signal"></i> 🟡 Intermediate</div>
            <div class="gd-meta-item"><i class="fas fa-clock"></i> 7 min read</div>
            <div class="gd-meta-item"><i class="fas fa-layer-group"></i> 5 Steps</div>
            <div class="gd-meta-item"><i class="fas fa-globe"></i> Updated: Jul 2026</div>
          </div>
          <div class="gd-hero-actions">
            ${isCompleted ? `<button class="gd-btn gd-btn-completed"><i class="fas fa-check-circle"></i> Completed ✓</button>` : `<button class="gd-btn gd-btn-success" onclick="AgentsGuide.triggerComplete()"><i class="fas fa-check"></i> Mark as Complete</button>`}
            <button class="gd-btn gd-btn-outline" onclick="PlatformDocs.toggleBookmark('agents');PlatformDocs.currentGuide='agents';PlatformDocs.render();"><i class="fas ${isBookmarked ? 'fa-star' : 'fa-star'}"></i> ${isBookmarked ? 'Bookmarked' : 'Bookmark'}</button>
            <button class="gd-btn gd-btn-outline" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
          </div>
        </div>

        <div class="gd-content-card">
          <h4>👥 Build & Manage Your Dream Team</h4>
          <p class="gd-subtitle">As your business grows, you need a team. Control access, distribute work, and track who's performing.</p>
          <div class="gd-overview"><p>Team management is about giving the <strong>right people the right access</strong> and <strong>distributing work fairly</strong>. Whether you have 2 agents or 200, the CRM scales with you. Invite team members, set granular permissions, auto-assign leads, monitor workloads, and track performance — all from one dashboard. A well-managed team closes more deals with less chaos.</p></div>

          <div class="gd-section-title"><i class="fas fa-shield-alt" style="color:#0f766e;"></i> Roles & Permissions</div>
          <div class="gd-role-grid">
            <div class="gd-role-card"><h6>👑 Admin</h6><p>Full access: settings, billing, all data, team management. Can add/remove agents.</p></div>
            <div class="gd-role-card"><h6>📊 Manager</h6><p>Can manage agents, view team reports, access all leads. Cannot change billing.</p></div>
            <div class="gd-role-card"><h6>💼 Agent</h6><p>Can view & manage assigned leads only. Cannot see other agents' leads or settings.</p></div>
            <div class="gd-role-card"><h6>👁️ Viewer</h6><p>Read-only access to assigned data. Cannot send messages or edit. Good for auditors.</p></div>
            <div class="gd-role-card"><h6>⚙️ Custom</h6><p>Create custom roles with granular permissions per module. Pro & Enterprise plans.</p></div>
          </div>

          <div class="gd-section-title"><i class="fas fa-list-ol" style="color:#0f766e;"></i> Team Management Steps</div>
          
          <div class="gd-step"><div class="gd-step-num">1</div><div class="gd-step-content"><h6>Inviting Team Members</h6><p>Go to <strong>Settings → Team → Invite Member</strong>. Enter their email address and select a role (Admin, Manager, Agent, Viewer, or Custom). They receive an <strong>email invitation</strong> with a secure link. Once they accept and create their password, they can access the CRM with their own login. You can <strong>revoke access</strong> anytime. Each team member gets their own dashboard, lead list, and settings — but what they can see depends on their role and assigned leads.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">2</div><div class="gd-step-content"><h6>Lead Assignment — Fair Distribution</h6><p>Configure how new leads are distributed: <strong>Round-robin:</strong> Leads assigned evenly in rotation — Agent A, then B, then C, repeat. <strong>Capacity-based:</strong> Assign to the agent with the fewest open leads. <strong>Skill-based:</strong> English-speaking leads → Agent A, Hindi-speaking → Agent B, High-value (>₹50,000) → Senior agent. <strong>Source-based:</strong> Website leads → Team A, WhatsApp leads → Team B. <strong>Manual:</strong> Admin assigns leads manually. Agents only see their assigned leads — data privacy maintained.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">3</div><div class="gd-step-content"><h6>Workload Management</h6><p>Monitor each agent's workload from the <strong>Team Dashboard</strong>: Leads assigned, Open tasks, Overdue follow-ups, Response time (average), Availability status (online/away/offline). If one agent is overloaded (50+ open leads) while another has 10, <strong>rebalance leads</strong> with one click. Set <strong>max leads per agent</strong> to prevent burnout and ensure every lead gets proper attention. Get alerts when an agent's response time exceeds your SLA.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">4</div><div class="gd-step-content"><h6>Granular Permissions (Custom Roles)</h6><p>For Pro & Enterprise plans, create <strong>custom roles</strong> with module-level permissions: <strong>Contacts:</strong> View/Create/Edit/Delete/Export, <strong>Leads:</strong> View assigned/View all/Create/Edit/Delete/Change stage, <strong>Campaigns:</strong> View/Create/Edit/Delete/Send, <strong>Analytics:</strong> View own/View team/View all/Export, <strong>Settings:</strong> View/Edit (dangerous — only for trusted admins). Example: "Junior Agent" can view and edit assigned leads but cannot create campaigns or view analytics. "Senior Agent" can view all leads and create campaigns but cannot access billing.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">5</div><div class="gd-step-content"><h6>Performance Tracking & Gamification</h6><p>Track agent performance on the <strong>Agent Leaderboard</strong>: Leads handled, Conversion rate (%), Response time (avg), Deals closed, Revenue generated, Customer satisfaction (CSAT score). <strong>Gamification:</strong> Badges for achievements — "Top Closer" (most deals this month), "Speed Demon" (fastest response time), "Revenue Champion" (highest revenue), "Rising Star" (most improved). Leaderboards create healthy competition. Use data for: performance reviews, identifying coaching needs, rewarding top performers, and optimizing team structure.</p></div></div>

          <div class="gd-tips-card">
            <h5><i class="fas fa-lightbulb" style="color:#f59e0b;"></i> Pro Tips</h5>
            <ul>
              <li><strong>Create a "Senior Agent" role</strong> that can view junior agents' leads for mentoring — helps new agents learn faster.</li>
              <li><strong>Set up Slack/email notifications</strong> for when an agent's response time exceeds your SLA — address issues before customers complain.</li>
              <li><strong>Conduct weekly pipeline reviews</strong> using the Agent Performance report — identify bottlenecks and coach struggling agents.</li>
              <li><strong>Start with round-robin assignment</strong> — it's fair, simple, and works well for most teams. Graduate to skill-based as you grow.</li>
            </ul>
          </div>

          <h5 style="font-weight:700;margin-top:28px;color:#0f172a;">🔗 Related Guides</h5>
          <div class="gd-related">
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('clients')">🏢 Client Management</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('settings')">⚙️ Settings & Profile</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('analytics')">📈 Analytics & Reports</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('leads')">🎯 Managing Leads</span>
          </div>
        </div>

        <div class="gd-upsell"><div><h5>👥 Unlimited Team Members & Custom Roles</h5><p>Free plan: 1 user. Pro: Unlimited team members, custom roles, granular permissions, and performance tracking.</p></div><button class="gd-btn gd-btn-primary" onclick="Plan.render()"><i class="fas fa-crown"></i> Add Your Team</button></div>

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
    PlatformDocs.markComplete('agents');
    PlatformDocs.currentGuide = 'agents';
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
      if (!pg['agents'] || pg['agents'] < 10) {
        pg['agents'] = 10;
        await docRef.set({ platformGuides: pg, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    } catch (e) { console.error('Progress error:', e); }
  }
};
window.AgentsGuide = AgentsGuide;