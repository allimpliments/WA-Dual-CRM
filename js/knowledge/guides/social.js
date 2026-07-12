// js/knowledge/guides/social.js — Social Media Connect Guide
const SocialGuide = {
  guideId: 'social',

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
        .gd-breadcrumb span { cursor: pointer; transition: color 0.2s; } .gd-breadcrumb span:hover { color: #0ea5e9; }
        .gd-hero { background: #fff; border-radius: 20px; padding: 36px 32px; margin-bottom: 24px; border: 1px solid #f1f5f9; position: relative; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #0ea5e9, #0284c7, #0ea5e9); }
        .gd-hero-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #fff; margin-bottom: 16px; background: linear-gradient(135deg, #0ea5e9, #0284c7); }
        .gd-hero h3 { font-weight: 900; font-size: 28px; margin: 0 0 10px; color: #0f172a; line-height: 1.3; }
        .gd-hero p { color: #64748b; font-size: 15px; margin: 0; max-width: 700px; line-height: 1.7; }
        .gd-hero-meta { display: flex; gap: 18px; margin-top: 18px; flex-wrap: wrap; align-items: center; }
        .gd-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; } .gd-meta-item i { color: #0ea5e9; font-size: 14px; }
        .gd-hero-actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
        .gd-btn { padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .gd-btn-primary { background: #0ea5e9; color: #fff; } .gd-btn-primary:hover { background: #0284c7; transform: scale(1.03); }
        .gd-btn-outline { background: #fff; color: #0ea5e9; border: 1px solid #0ea5e9; } .gd-btn-outline:hover { background: #f0f9ff; }
        .gd-btn-success { background: #10b981; color: #fff; } .gd-btn-success:hover { background: #059669; transform: scale(1.03); }
        .gd-btn-completed { background: #d1d5db; color: #fff; cursor: default; } .gd-btn-completed:hover { transform: none; }
        .gd-content-card { background: #fff; border-radius: 20px; padding: 32px; margin-bottom: 20px; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-content-card h4 { font-weight: 800; font-size: 20px; margin: 0 0 8px; color: #0f172a; }
        .gd-content-card .gd-subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
        .gd-overview { background: #f0f9ff; border-radius: 14px; padding: 20px 24px; margin-bottom: 28px; border-left: 4px solid #0ea5e9; }
        .gd-overview p { margin: 0; font-size: 14px; color: #0c4a6e; line-height: 1.8; }
        .gd-section-title { font-weight: 800; font-size: 18px; color: #0f172a; margin: 28px 0 16px; display: flex; align-items: center; gap: 8px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9; }
        .gd-step { display: flex; gap: 16px; padding: 20px 0; border-bottom: 1px solid #f1f5f9; align-items: flex-start; }
        .gd-step:last-child { border-bottom: none; }
        .gd-step-num { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #0ea5e9, #0284c7); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 17px; flex-shrink: 0; }
        .gd-step-content { flex: 1; } .gd-step-content h6 { font-weight: 700; font-size: 15px; margin: 0 0 4px; color: #0f172a; }
        .gd-step-content p { font-size: 14px; color: #475569; margin: 0; line-height: 1.7; }
        .gd-platform-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 14px 0; }
        .gd-platform-card { border-radius: 12px; padding: 14px 16px; border: 1px solid #e2e8f0; background: #f8fafc; text-align: center; }
        .gd-platform-card i { font-size: 24px; margin-bottom: 6px; }
        .gd-platform-card h6 { font-weight: 700; font-size: 12px; margin: 0; } .gd-platform-card p { font-size: 10px; color: #64748b; margin: 2px 0 0; }
        .gd-tips-card { background: linear-gradient(135deg, #fef3c7, #fffbeb); border-radius: 16px; padding: 22px 26px; margin-top: 24px; border: 1px solid #fcd34d; }
        .gd-tips-card h5 { font-weight: 800; color: #92400e; margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
        .gd-tips-card ul { margin: 0; padding-left: 20px; } .gd-tips-card li { font-size: 13px; color: #a16207; margin-bottom: 6px; line-height: 1.6; } .gd-tips-card li:last-child { margin-bottom: 0; }
        .gd-related { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
        .gd-related-pill { padding: 9px 18px; border-radius: 20px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 13px; cursor: pointer; transition: 0.2s; color: #475569; display: inline-flex; align-items: center; gap: 6px; }
        .gd-related-pill:hover { background: #f0f9ff; border-color: #0ea5e9; color: #0ea5e9; }
        .gd-upsell { background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 18px; padding: 28px 32px; margin-top: 28px; border: 1px solid #c7d2fe; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .gd-upsell h5 { font-weight: 800; color: #3730a3; margin: 0; font-size: 18px; } .gd-upsell p { color: #4f46e5; margin: 4px 0 0; font-size: 14px; }
        .gd-nav-btns { display: flex; justify-content: space-between; margin-top: 32px; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 768px) { .gd-hero { padding: 24px 18px; } .gd-hero h3 { font-size: 22px; } .gd-content-card { padding: 20px 16px; } .gd-step { flex-direction: column; gap: 10px; } .gd-platform-grid { grid-template-columns: 1fr 1fr; } .gd-upsell { flex-direction: column; text-align: center; } .gd-nav-btns { flex-direction: column; align-items: stretch; } }
      </style>

      <div class="gd-wrap">
        <div class="gd-back-row">
          <button class="gd-back-btn" onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();"><i class="fas fa-arrow-left"></i> Back to All Guides</button>
          <div class="gd-breadcrumb"><span onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();">📖 Platform Documentation</span><i class="fas fa-chevron-right" style="font-size:10px;"></i><span style="color:#0ea5e9;font-weight:600;">Social Media Connect</span></div>
        </div>

        <div class="gd-hero">
          <div class="gd-hero-icon"><i class="fas fa-share-alt"></i></div>
          <h3>Social Media Connect — Unified Social Inbox</h3>
          <p>Connect Instagram, Facebook, LinkedIn, Twitter/X, and YouTube. Manage all social conversations from one unified inbox — never miss a lead from any platform again.</p>
          <div class="gd-hero-meta">
            <div class="gd-meta-item"><i class="fas fa-signal"></i> 🟡 Intermediate</div>
            <div class="gd-meta-item"><i class="fas fa-clock"></i> 8 min read</div>
            <div class="gd-meta-item"><i class="fas fa-layer-group"></i> 5 Steps</div>
            <div class="gd-meta-item"><i class="fas fa-globe"></i> Updated: Jul 2026</div>
          </div>
          <div class="gd-hero-actions">
            ${isCompleted ? `<button class="gd-btn gd-btn-completed"><i class="fas fa-check-circle"></i> Completed ✓</button>` : `<button class="gd-btn gd-btn-success" onclick="SocialGuide.triggerComplete()"><i class="fas fa-check"></i> Mark as Complete</button>`}
            <button class="gd-btn gd-btn-outline" onclick="PlatformDocs.toggleBookmark('social');PlatformDocs.currentGuide='social';PlatformDocs.render();"><i class="fas ${isBookmarked ? 'fa-star' : 'fa-star'}"></i> ${isBookmarked ? 'Bookmarked' : 'Bookmark'}</button>
            <button class="gd-btn gd-btn-outline" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
          </div>
        </div>

        <div class="gd-content-card">
          <h4>🌐 All Your Social Conversations — One Inbox</h4>
          <p class="gd-subtitle">Your customers reach out on multiple platforms. Bring everything together for faster responses and better service.</p>
          <div class="gd-overview"><p>Customers don't care which platform they use — they just want a response. The unified social inbox brings <strong>Instagram DMs, Facebook comments, LinkedIn messages, Twitter/X mentions, and YouTube comments</strong> into one feed. Every message becomes a trackable conversation in your CRM — no more switching between 5 different apps.</p></div>

          <div class="gd-section-title"><i class="fas fa-plug" style="color:#0ea5e9;"></i> Supported Platforms</div>
          <div class="gd-platform-grid">
            <div class="gd-platform-card"><i class="fab fa-instagram" style="color:#e4405f;"></i><h6>Instagram</h6><p>DMs + Post Comments</p></div>
            <div class="gd-platform-card"><i class="fab fa-facebook" style="color:#1877f2;"></i><h6>Facebook</h6><p>Page Messages + Comments</p></div>
            <div class="gd-platform-card"><i class="fab fa-linkedin" style="color:#0a66c2;"></i><h6>LinkedIn</h6><p>InMail + Post Comments</p></div>
            <div class="gd-platform-card"><i class="fab fa-x-twitter" style="color:#000;"></i><h6>Twitter/X</h6><p>DMs + Mentions</p></div>
            <div class="gd-platform-card"><i class="fab fa-youtube" style="color:#ff0000;"></i><h6>YouTube</h6><p>Video Comments</p></div>
          </div>

          <div class="gd-section-title"><i class="fas fa-list-ol" style="color:#0ea5e9;"></i> Setup & Management Steps</div>
          
          <div class="gd-step"><div class="gd-step-num">1</div><div class="gd-step-content"><h6>Connecting Your Platforms</h6><p>Go to <strong>Settings → Social Connect</strong>. Choose your platform and authenticate via OAuth (one-click login). Each platform requires page/admin access. Supported: <strong>Instagram Professional Account</strong> (DMs + comments), <strong>Facebook Page</strong> (messages + post comments), <strong>LinkedIn Page</strong> (messages + comments), <strong>Twitter/X</strong> (DMs + mentions), <strong>YouTube Channel</strong> (comments). Connect as many as you want — all feed into one inbox.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">2</div><div class="gd-step-content"><h6>Unified Inbox — Everything in One Place</h6><p>All messages from all platforms appear in <strong>one chronological feed</strong>. Each message shows: platform icon (Instagram/Facebook/etc.), sender name and profile picture, message preview, and timestamp. Click any message to open the full conversation. Reply directly from the CRM — your reply goes back to the original platform. The customer never knows you're using a CRM.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">3</div><div class="gd-step-content"><h6>Auto-Reply Rules — 24/7 Response</h6><p>Set up <strong>keyword-based auto-replies</strong> for common queries: Message contains "price" → Send pricing PDF automatically, Message contains "demo" → Share calendar booking link, Message contains "support" → Auto-create a support ticket, Message contains "job" → Send careers page link. Auto-replies work 24/7 — even when your team is asleep. Always include a note: "This is an automated reply. A human will respond shortly if needed."</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">4</div><div class="gd-step-content"><h6>Post Scheduling & Publishing</h6><p>Create and schedule posts for <strong>Instagram, Facebook, and LinkedIn</strong> directly from the CRM. Features: <strong>Visual grid preview</strong> (see how your Instagram feed will look), <strong>Hashtag suggestions</strong> (AI-powered based on your content), <strong>Best time to post</strong> (based on your audience's activity patterns), <strong>Location tagging</strong>, <strong>First comment</strong> (for additional hashtags on Instagram). Schedule weeks of content in one sitting.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">5</div><div class="gd-step-content"><h6>Social Analytics & Monitoring</h6><p>Track performance across all platforms: <strong>Messages received</strong> (by platform, by day), <strong>Average response time</strong> (track against your SLA), <strong>Sentiment analysis</strong> (positive/neutral/negative — AI-powered), <strong>Top keywords</strong> (what are people saying about your brand?), <strong>Most active followers</strong> (your brand advocates), <strong>Competitor tracking</strong> (monitor competitor pages — Pro feature). Export reports for stakeholders.</p></div></div>

          <div class="gd-tips-card">
            <h5><i class="fas fa-lightbulb" style="color:#f59e0b;"></i> Pro Tips</h5>
            <ul>
              <li><strong>Respond to Instagram comments within 15 minutes</strong> — the algorithm rewards fast responders with better visibility.</li>
              <li><strong>Use the bulk reply feature</strong> to thank everyone who commented on a viral post — saves hours of manual work.</li>
              <li><strong>Monitor competitor pages</strong> by adding them as "Tracked Pages" (Pro feature) — see what's working for them.</li>
              <li><strong>Connect at least Instagram + Facebook</strong> — these two platforms drive 80% of social media leads for most businesses.</li>
            </ul>
          </div>

          <h5 style="font-weight:700;margin-top:28px;color:#0f172a;">🔗 Related Guides</h5>
          <div class="gd-related">
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('chats')">💬 WhatsApp Chat Setup</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('integrations')">🔌 Integrations Hub</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('analytics')">📈 Analytics & Reports</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('forms')">📝 Form Builder</span>
          </div>
        </div>

        <div class="gd-upsell"><div><h5>🌐 Connect Unlimited Social Channels</h5><p>Free plan: 2 social channels. Pro: Unlimited channels, auto-reply rules, post scheduling, and social analytics.</p></div><button class="gd-btn gd-btn-primary" onclick="Plan.render()"><i class="fas fa-crown"></i> Connect All Channels</button></div>

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
    PlatformDocs.markComplete('social');
    PlatformDocs.currentGuide = 'social';
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
      if (!pg['social'] || pg['social'] < 10) {
        pg['social'] = 10;
        await docRef.set({ platformGuides: pg, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    } catch (e) { console.error('Progress error:', e); }
  }
};
window.SocialGuide = SocialGuide;