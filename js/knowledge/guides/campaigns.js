// js/knowledge/guides/campaigns.js — Campaign Creation Guide
const CampaignsGuide = {
  guideId: 'campaigns',

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
        .gd-breadcrumb span { cursor: pointer; transition: color 0.2s; } .gd-breadcrumb span:hover { color: #ef4444; }
        .gd-hero { background: #fff; border-radius: 20px; padding: 36px 32px; margin-bottom: 24px; border: 1px solid #f1f5f9; position: relative; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #ef4444, #dc2626, #ef4444); }
        .gd-hero-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #fff; margin-bottom: 16px; background: linear-gradient(135deg, #ef4444, #dc2626); }
        .gd-hero h3 { font-weight: 900; font-size: 28px; margin: 0 0 10px; color: #0f172a; line-height: 1.3; }
        .gd-hero p { color: #64748b; font-size: 15px; margin: 0; max-width: 700px; line-height: 1.7; }
        .gd-hero-meta { display: flex; gap: 18px; margin-top: 18px; flex-wrap: wrap; align-items: center; }
        .gd-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; } .gd-meta-item i { color: #ef4444; font-size: 14px; }
        .gd-hero-actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
        .gd-btn { padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .gd-btn-primary { background: #ef4444; color: #fff; } .gd-btn-primary:hover { background: #dc2626; transform: scale(1.03); }
        .gd-btn-outline { background: #fff; color: #ef4444; border: 1px solid #ef4444; } .gd-btn-outline:hover { background: #fef2f2; }
        .gd-btn-success { background: #10b981; color: #fff; } .gd-btn-success:hover { background: #059669; transform: scale(1.03); }
        .gd-btn-completed { background: #d1d5db; color: #fff; cursor: default; } .gd-btn-completed:hover { transform: none; }
        .gd-content-card { background: #fff; border-radius: 20px; padding: 32px; margin-bottom: 20px; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-content-card h4 { font-weight: 800; font-size: 20px; margin: 0 0 8px; color: #0f172a; }
        .gd-content-card .gd-subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
        .gd-overview { background: #fef2f2; border-radius: 14px; padding: 20px 24px; margin-bottom: 28px; border-left: 4px solid #ef4444; }
        .gd-overview p { margin: 0; font-size: 14px; color: #7f1d1d; line-height: 1.8; }
        .gd-section-title { font-weight: 800; font-size: 18px; color: #0f172a; margin: 28px 0 16px; display: flex; align-items: center; gap: 8px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9; }
        .gd-step { display: flex; gap: 16px; padding: 20px 0; border-bottom: 1px solid #f1f5f9; align-items: flex-start; }
        .gd-step:last-child { border-bottom: none; }
        .gd-step-num { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #ef4444, #dc2626); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 17px; flex-shrink: 0; }
        .gd-step-content { flex: 1; } .gd-step-content h6 { font-weight: 700; font-size: 15px; margin: 0 0 4px; color: #0f172a; }
        .gd-step-content p { font-size: 14px; color: #475569; margin: 0; line-height: 1.7; }
        .gd-campaign-types { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin: 14px 0; }
        .gd-type-card { border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; background: #f8fafc; }
        .gd-type-card h6 { font-weight: 700; font-size: 13px; margin: 0 0 4px; } .gd-type-card p { font-size: 11px; color: #64748b; margin: 0; }
        .gd-tips-card { background: linear-gradient(135deg, #fef3c7, #fffbeb); border-radius: 16px; padding: 22px 26px; margin-top: 24px; border: 1px solid #fcd34d; }
        .gd-tips-card h5 { font-weight: 800; color: #92400e; margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
        .gd-tips-card ul { margin: 0; padding-left: 20px; } .gd-tips-card li { font-size: 13px; color: #a16207; margin-bottom: 6px; line-height: 1.6; } .gd-tips-card li:last-child { margin-bottom: 0; }
        .gd-related { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
        .gd-related-pill { padding: 9px 18px; border-radius: 20px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 13px; cursor: pointer; transition: 0.2s; color: #475569; display: inline-flex; align-items: center; gap: 6px; }
        .gd-related-pill:hover { background: #fef2f2; border-color: #ef4444; color: #ef4444; }
        .gd-upsell { background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 18px; padding: 28px 32px; margin-top: 28px; border: 1px solid #c7d2fe; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .gd-upsell h5 { font-weight: 800; color: #3730a3; margin: 0; font-size: 18px; } .gd-upsell p { color: #4f46e5; margin: 4px 0 0; font-size: 14px; }
        .gd-nav-btns { display: flex; justify-content: space-between; margin-top: 32px; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 768px) { .gd-hero { padding: 24px 18px; } .gd-hero h3 { font-size: 22px; } .gd-content-card { padding: 20px 16px; } .gd-step { flex-direction: column; gap: 10px; } .gd-campaign-types { grid-template-columns: 1fr; } .gd-upsell { flex-direction: column; text-align: center; } .gd-nav-btns { flex-direction: column; align-items: stretch; } }
      </style>

      <div class="gd-wrap">
        <div class="gd-back-row">
          <button class="gd-back-btn" onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();"><i class="fas fa-arrow-left"></i> Back to All Guides</button>
          <div class="gd-breadcrumb"><span onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();">📖 Platform Documentation</span><i class="fas fa-chevron-right" style="font-size:10px;"></i><span style="color:#ef4444;font-weight:600;">Campaign Creation</span></div>
        </div>

        <div class="gd-hero">
          <div class="gd-hero-icon"><i class="fas fa-bullhorn"></i></div>
          <h3>Campaign Creation — Bulk & Drip Campaigns That Convert</h3>
          <p>Create, schedule, and optimize campaigns that drive real revenue. From bulk broadcasts to automated drip sequences and A/B testing — master the art of campaign management.</p>
          <div class="gd-hero-meta">
            <div class="gd-meta-item"><i class="fas fa-signal"></i> 🟡 Intermediate</div>
            <div class="gd-meta-item"><i class="fas fa-clock"></i> 11 min read</div>
            <div class="gd-meta-item"><i class="fas fa-layer-group"></i> 6 Steps</div>
            <div class="gd-meta-item"><i class="fas fa-globe"></i> Updated: Jul 2026</div>
          </div>
          <div class="gd-hero-actions">
            ${isCompleted ? `<button class="gd-btn gd-btn-completed"><i class="fas fa-check-circle"></i> Completed ✓</button>` : `<button class="gd-btn gd-btn-success" onclick="CampaignsGuide.triggerComplete()"><i class="fas fa-check"></i> Mark as Complete</button>`}
            <button class="gd-btn gd-btn-outline" onclick="PlatformDocs.toggleBookmark('campaigns');PlatformDocs.currentGuide='campaigns';PlatformDocs.render();"><i class="fas ${isBookmarked ? 'fa-star' : 'fa-star'}"></i> ${isBookmarked ? 'Bookmarked' : 'Bookmark'}</button>
            <button class="gd-btn gd-btn-outline" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
          </div>
        </div>

        <div class="gd-content-card">
          <h4>📨 Campaigns — Your Revenue Engine</h4>
          <p class="gd-subtitle">Campaigns are how you communicate with your audience at scale. Master them and you master your revenue.</p>
          <div class="gd-overview"><p>Campaigns are the primary way you'll engage with your contacts. Whether it's a <strong>one-time promotional blast</strong>, an <strong>automated welcome sequence</strong>, or a <strong>recurring newsletter</strong> — campaigns drive conversations, nurture leads, and close deals. This guide covers all campaign types and optimization strategies.</p></div>

          <div class="gd-section-title"><i class="fas fa-cubes" style="color:#ef4444;"></i> Campaign Types</div>
          <div class="gd-campaign-types">
            <div class="gd-type-card"><h6>📢 Bulk Broadcast</h6><p>One-time message to a segment or list. Perfect for announcements, offers, event invites.</p></div>
            <div class="gd-type-card"><h6>💧 Drip Sequence</h6><p>Automated series: Welcome → Nurture → Offer → Follow-up. Set it once, runs forever.</p></div>
            <div class="gd-type-card"><h6>🔄 Recurring Campaign</h6><p>Daily/weekly/monthly sends. Great for newsletters, tips, weekly deals.</p></div>
            <div class="gd-type-card"><h6>⚡ Trigger-Based</h6><p>Auto-send when: lead enters stage, form submitted, payment received, birthday.</p></div>
          </div>

          <div class="gd-section-title"><i class="fas fa-list-ol" style="color:#ef4444;"></i> Campaign Creation Steps</div>
          
          <div class="gd-step"><div class="gd-step-num">1</div><div class="gd-step-content"><h6>Choose Campaign Type & Audience</h6><p>Select your campaign type (Bulk, Drip, Recurring, Trigger). Then choose your <strong>audience:</strong> All contacts, Specific segments (dynamic and auto-updating), Custom filters (location, tag, source, last contacted date), Upload a fresh list, or Exclude certain contacts (suppression list). Pro tip: segments get 3x better engagement than "all contacts" blasts.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">2</div><div class="gd-step-content"><h6>Craft Your Message</h6><p>Use the <strong>rich text editor</strong> with full formatting. Insert <strong>dynamic variables</strong> for personalization: <code>{{name}}</code>, <code>{{company}}</code>, <code>{{agent_name}}</code>, <code>{{custom_field}}</code>. Add <strong>media:</strong> images (product photos), PDFs (brochures, price lists), videos (demos, testimonials). Use the built-in <strong>AI Content Writer</strong> for message suggestions based on your business type and goal. Preview on desktop and mobile before sending.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">3</div><div class="gd-step-content"><h6>Scheduling — Send at the Perfect Time</h6><p>Options: <strong>Send Now</strong> (immediate delivery), <strong>Schedule for Later</strong> (pick date & time), <strong>Best Time to Send</strong> (AI analyzes each contact's activity and delivers at their optimal engagement time), <strong>Timezone-Aware Delivery</strong> (delivers at the scheduled time in each contact's local timezone — no more 3 AM messages!). For drip sequences, set delays: Day 1, Day 3, Day 7, Day 14.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">4</div><div class="gd-step-content"><h6>A/B Testing — Optimize for Results</h6><p>Test up to <strong>3 message variants</strong> on a small portion of your audience (e.g., 20%). The system automatically tracks: open rate, reply rate, click-through rate. After the test period (configurable: 2-24 hours), the <strong>winning variant is automatically sent</strong> to the remaining 80%. Test: Message text, Images, CTA buttons, Send time, Emoji usage. Even small improvements compound into significant revenue gains.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">5</div><div class="gd-step-content"><h6>Compliance & Best Practices</h6><p><strong>WhatsApp rules:</strong> Outbound marketing messages must use pre-approved templates. Customer service replies are free-form. <strong>Always include opt-out:</strong> "Reply STOP to unsubscribe" (handled automatically). <strong>Respect frequency:</strong> Don't send more than 2-3 marketing messages per week to avoid blocks. <strong>Test first:</strong> Always send a test to yourself before launching to the full audience.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">6</div><div class="gd-step-content"><h6>Monitor & Iterate</h6><p><strong>Real-time dashboard:</strong> Sent count, Delivered, Read, Replied, Bounced, Opted-out. <strong>Drill down</strong> to individual contact level — see exactly who engaged and who didn't. <strong>Compare campaigns</strong> side-by-side to identify what works. <strong>Pause/Resume</strong> campaigns anytime. After completion, review the Campaign Report in Analytics for detailed insights and use those learnings to improve your next campaign.</p></div></div>

          <div class="gd-tips-card">
            <h5><i class="fas fa-lightbulb" style="color:#f59e0b;"></i> Pro Tips</h5>
            <ul>
              <li><strong>Always A/B test your first 5 campaigns</strong> — you'll discover what messaging resonates with your specific audience.</li>
              <li><strong>Space out drip messages by at least 48 hours</strong> — anything less feels spammy and increases opt-outs.</li>
              <li><strong>Use emojis strategically</strong> — campaigns with 2-3 relevant emojis see 25% higher engagement (but don't overdo it).</li>
              <li><strong>Segment, segment, segment</strong> — a campaign to 100 highly-targeted contacts outperforms one to 1,000 random contacts every time.</li>
            </ul>
          </div>

          <h5 style="font-weight:700;margin-top:28px;color:#0f172a;">🔗 Related Guides</h5>
          <div class="gd-related">
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('templates-flows')">🔄 Templates & Flows</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('analytics')">📈 Analytics & Reports</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('contacts')">📇 Contacts Management</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('chats')">💬 WhatsApp Chat</span>
          </div>
        </div>

        <div class="gd-upsell"><div><h5>📨 Unlimited Campaigns & Advanced Automation</h5><p>Free plan: 5 campaigns/month. Pro: Unlimited campaigns, drip sequences, A/B testing, and detailed analytics.</p></div><button class="gd-btn gd-btn-primary" onclick="Plan.render()"><i class="fas fa-crown"></i> Unlock Unlimited Campaigns</button></div>

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
    PlatformDocs.markComplete('campaigns');
    PlatformDocs.currentGuide = 'campaigns';
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
      if (!pg['campaigns'] || pg['campaigns'] < 10) {
        pg['campaigns'] = 10;
        await docRef.set({ platformGuides: pg, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    } catch (e) { console.error('Progress error:', e); }
  }
};
window.CampaignsGuide = CampaignsGuide;