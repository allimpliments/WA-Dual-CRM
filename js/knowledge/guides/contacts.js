// js/knowledge/guides/contacts.js — Contacts Management Guide
const ContactsGuide = {
  guideId: 'contacts',

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
        .gd-breadcrumb span { cursor: pointer; transition: color 0.2s; } .gd-breadcrumb span:hover { color: #06b6d4; }
        .gd-hero { background: #fff; border-radius: 20px; padding: 36px 32px; margin-bottom: 24px; border: 1px solid #f1f5f9; position: relative; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #06b6d4, #0891b2, #06b6d4); }
        .gd-hero-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #fff; margin-bottom: 16px; background: linear-gradient(135deg, #06b6d4, #0891b2); }
        .gd-hero h3 { font-weight: 900; font-size: 28px; margin: 0 0 10px; color: #0f172a; line-height: 1.3; }
        .gd-hero p { color: #64748b; font-size: 15px; margin: 0; max-width: 700px; line-height: 1.7; }
        .gd-hero-meta { display: flex; gap: 18px; margin-top: 18px; flex-wrap: wrap; align-items: center; }
        .gd-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; } .gd-meta-item i { color: #06b6d4; font-size: 14px; }
        .gd-hero-actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
        .gd-btn { padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .gd-btn-primary { background: #06b6d4; color: #fff; } .gd-btn-primary:hover { background: #0891b2; transform: scale(1.03); }
        .gd-btn-outline { background: #fff; color: #06b6d4; border: 1px solid #06b6d4; } .gd-btn-outline:hover { background: #ecfeff; }
        .gd-btn-success { background: #10b981; color: #fff; } .gd-btn-success:hover { background: #059669; transform: scale(1.03); }
        .gd-btn-completed { background: #d1d5db; color: #fff; cursor: default; } .gd-btn-completed:hover { transform: none; }
        .gd-content-card { background: #fff; border-radius: 20px; padding: 32px; margin-bottom: 20px; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-content-card h4 { font-weight: 800; font-size: 20px; margin: 0 0 8px; color: #0f172a; }
        .gd-content-card .gd-subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
        .gd-overview { background: #ecfeff; border-radius: 14px; padding: 20px 24px; margin-bottom: 28px; border-left: 4px solid #06b6d4; }
        .gd-overview p { margin: 0; font-size: 14px; color: #155e75; line-height: 1.8; }
        .gd-section-title { font-weight: 800; font-size: 18px; color: #0f172a; margin: 28px 0 16px; display: flex; align-items: center; gap: 8px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9; }
        .gd-step { display: flex; gap: 16px; padding: 20px 0; border-bottom: 1px solid #f1f5f9; align-items: flex-start; }
        .gd-step:last-child { border-bottom: none; }
        .gd-step-num { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #06b6d4, #0891b2); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 17px; flex-shrink: 0; }
        .gd-step-content { flex: 1; } .gd-step-content h6 { font-weight: 700; font-size: 15px; margin: 0 0 4px; color: #0f172a; }
        .gd-step-content p { font-size: 14px; color: #475569; margin: 0; line-height: 1.7; }
        .gd-tips-card { background: linear-gradient(135deg, #fef3c7, #fffbeb); border-radius: 16px; padding: 22px 26px; margin-top: 24px; border: 1px solid #fcd34d; }
        .gd-tips-card h5 { font-weight: 800; color: #92400e; margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
        .gd-tips-card ul { margin: 0; padding-left: 20px; } .gd-tips-card li { font-size: 13px; color: #a16207; margin-bottom: 6px; line-height: 1.6; } .gd-tips-card li:last-child { margin-bottom: 0; }
        .gd-related { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
        .gd-related-pill { padding: 9px 18px; border-radius: 20px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 13px; cursor: pointer; transition: 0.2s; color: #475569; display: inline-flex; align-items: center; gap: 6px; }
        .gd-related-pill:hover { background: #ecfeff; border-color: #06b6d4; color: #06b6d4; }
        .gd-upsell { background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 18px; padding: 28px 32px; margin-top: 28px; border: 1px solid #c7d2fe; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .gd-upsell h5 { font-weight: 800; color: #3730a3; margin: 0; font-size: 18px; } .gd-upsell p { color: #4f46e5; margin: 4px 0 0; font-size: 14px; }
        .gd-nav-btns { display: flex; justify-content: space-between; margin-top: 32px; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 768px) { .gd-hero { padding: 24px 18px; } .gd-hero h3 { font-size: 22px; } .gd-content-card { padding: 20px 16px; } .gd-step { flex-direction: column; gap: 10px; } .gd-upsell { flex-direction: column; text-align: center; } .gd-nav-btns { flex-direction: column; align-items: stretch; } }
      </style>

      <div class="gd-wrap">
        <div class="gd-back-row">
          <button class="gd-back-btn" onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();"><i class="fas fa-arrow-left"></i> Back to All Guides</button>
          <div class="gd-breadcrumb"><span onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();">📖 Platform Documentation</span><i class="fas fa-chevron-right" style="font-size:10px;"></i><span style="color:#06b6d4;font-weight:600;">Contacts Management</span></div>
        </div>

        <div class="gd-hero">
          <div class="gd-hero-icon"><i class="fas fa-address-book"></i></div>
          <h3>Contacts Management — Organize & Segment Your Database</h3>
          <p>Import, organize, segment, and enrich your contact database. Your contact list is your most valuable business asset — learn to manage it like a pro for better targeting and higher conversions.</p>
          <div class="gd-hero-meta">
            <div class="gd-meta-item"><i class="fas fa-signal"></i> 🟢 Beginner</div>
            <div class="gd-meta-item"><i class="fas fa-clock"></i> 7 min read</div>
            <div class="gd-meta-item"><i class="fas fa-layer-group"></i> 6 Steps</div>
            <div class="gd-meta-item"><i class="fas fa-globe"></i> Updated: Jul 2026</div>
          </div>
          <div class="gd-hero-actions">
            ${isCompleted ? `<button class="gd-btn gd-btn-completed"><i class="fas fa-check-circle"></i> Completed ✓</button>` : `<button class="gd-btn gd-btn-success" onclick="ContactsGuide.triggerComplete()"><i class="fas fa-check"></i> Mark as Complete</button>`}
            <button class="gd-btn gd-btn-outline" onclick="PlatformDocs.toggleBookmark('contacts');PlatformDocs.currentGuide='contacts';PlatformDocs.render();"><i class="fas ${isBookmarked ? 'fa-star' : 'fa-star'}"></i> ${isBookmarked ? 'Bookmarked' : 'Bookmark'}</button>
            <button class="gd-btn gd-btn-outline" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
          </div>
        </div>

        <div class="gd-content-card">
          <h4>📇 Your Contact Database</h4>
          <p class="gd-subtitle">A well-organized contact database is the foundation of effective marketing and sales.</p>
          <div class="gd-overview"><p>Your contact database is more than just names and numbers — it's the foundation of every campaign, every message, and every deal. Proper organization means <strong>better targeting, higher open rates, and more conversions.</strong> This guide covers importing, segmentation, custom fields, bulk actions, and data hygiene best practices.</p></div>

          <div class="gd-section-title"><i class="fas fa-list-ol" style="color:#06b6d4;"></i> Contact Management Steps</div>
          
          <div class="gd-step"><div class="gd-step-num">1</div><div class="gd-step-content"><h6>Importing Contacts — Multiple Sources</h6><p>Bring contacts in through: <strong>CSV/Excel upload</strong> (download template, fill data, map columns to CRM fields), <strong>Google Contacts sync</strong> (one-time auth, real-time sync), <strong>WhatsApp contact sync</strong> (import from connected WhatsApp account), <strong>Manual entry</strong> (+ Add Contact button), <strong>API integration</strong> (from your website, app, or landing page). The system auto-deduplicates — same phone number = merged into one contact.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">2</div><div class="gd-step-content"><h6>Contact Fields — Default & Custom</h6><p>Default fields: <strong>Name, Phone, Email, Company, Source, Tags, Notes, Address, Birthday.</strong> Create unlimited <strong>custom fields</strong> for your business needs: "Preferred Language", "Product Interest", "Anniversary Date", "Last Purchase Amount", "Customer Since". Custom fields enable hyper-personalized messaging — use them in campaign variables like <code>{{custom_field_name}}</code>.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">3</div><div class="gd-step-content"><h6>Segmentation — Dynamic Groups</h6><p>Create dynamic segments that auto-update: <strong>"High-Value Customers"</strong> (spent > ₹50,000), <strong>"Inactive 90 Days"</strong> (no engagement in 3 months), <strong>"Mumbai Leads"</strong> (location = Mumbai), <strong>"WhatsApp Active"</strong> (responded in last 30 days), <strong>"VIP"</strong> (tag = #VIP). Segments update in real-time as contacts meet or don't meet criteria. Use segments for targeted campaigns — segmented campaigns get 3x higher response rates.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">4</div><div class="gd-step-content"><h6>Bulk Actions — Save Hours</h6><p>Select multiple contacts (checkbox or Select All) to perform: <strong>Send broadcast message</strong> to selected, <strong>Add/Remove tags</strong> (e.g., tag all event attendees #Event2026), <strong>Change owner</strong> (reassign to another agent), <strong>Export</strong> selected contacts, <strong>Delete</strong> (with confirmation), <strong>Merge duplicates</strong> (auto-detect and merge duplicate phone numbers).</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">5</div><div class="gd-step-content"><h6>Contact Timeline — Full History</h6><p>Every contact has a complete timeline showing: <strong>All messages exchanged</strong> (WhatsApp, email), <strong>Emails sent/opened/clicked</strong>, <strong>Forms submitted</strong>, <strong>Payments made</strong>, <strong>Tickets created/resolved</strong>, <strong>Notes added by team members</strong>, <strong>Stage changes in pipeline</strong>. This 360° view helps agents have contextual conversations — never ask "What was our last conversation?" again.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">6</div><div class="gd-step-content"><h6>Data Hygiene — Keep It Clean</h6><p>Monthly maintenance checklist: <strong>Merge duplicates</strong> (use built-in duplicate detector), <strong>Remove bounced contacts</strong> (messages that never delivered), <strong>Update outdated info</strong> (old numbers, changed companies), <strong>Verify WhatsApp-active numbers</strong> (use validation tool — green check = active, red X = inactive), <strong>Archive inactive contacts</strong> (no engagement in 6+ months). Clean data = higher delivery rates and better sender reputation.</p></div></div>

          <div class="gd-tips-card">
            <h5><i class="fas fa-lightbulb" style="color:#f59e0b;"></i> Pro Tips</h5>
            <ul>
              <li><strong>Use tags strategically:</strong> #VIP, #NeedsFollowUp, #InterestedInProductX — these enable laser-targeted campaigns.</li>
              <li><strong>The "Last Contacted" filter</strong> helps identify neglected contacts who need re-engagement.</li>
              <li><strong>Export contacts before major campaigns</strong> as a safety backup (Settings → Data Export).</li>
              <li><strong>Create a "New This Week" segment</strong> to send a special welcome sequence to fresh contacts.</li>
            </ul>
          </div>

          <h5 style="font-weight:700;margin-top:28px;color:#0f172a;">🔗 Related Guides</h5>
          <div class="gd-related">
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('leads')">🎯 Managing Leads</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('campaigns')">📨 Campaign Creation</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('integrations')">🔌 Integrations Hub</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('chats')">💬 WhatsApp Chat</span>
          </div>
        </div>

        <div class="gd-upsell"><div><h5>📇 Unlimited Contacts & Advanced Segments</h5><p>Free plan: 1,000 contacts. Pro: Unlimited contacts, custom fields, advanced segmentation, and bulk actions.</p></div><button class="gd-btn gd-btn-primary" onclick="Plan.render()"><i class="fas fa-crown"></i> Go Unlimited</button></div>

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
    PlatformDocs.markComplete('contacts');
    PlatformDocs.currentGuide = 'contacts';
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
      if (!pg['contacts'] || pg['contacts'] < 10) {
        pg['contacts'] = 10;
        await docRef.set({ platformGuides: pg, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    } catch (e) { console.error('Progress error:', e); }
  }
};
window.ContactsGuide = ContactsGuide;