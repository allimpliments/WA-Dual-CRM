// js/knowledge/guides/chats.js — WhatsApp Chat Setup Guide
const ChatsGuide = {
  guideId: 'chats',

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
        .gd-breadcrumb span { cursor: pointer; transition: color 0.2s; } .gd-breadcrumb span:hover { color: #25D366; }
        .gd-hero { background: #fff; border-radius: 20px; padding: 36px 32px; margin-bottom: 24px; border: 1px solid #f1f5f9; position: relative; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #25D366, #128C7E, #25D366); }
        .gd-hero-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #fff; margin-bottom: 16px; background: linear-gradient(135deg, #25D366, #128C7E); }
        .gd-hero h3 { font-weight: 900; font-size: 28px; margin: 0 0 10px; color: #0f172a; line-height: 1.3; }
        .gd-hero p { color: #64748b; font-size: 15px; margin: 0; max-width: 700px; line-height: 1.7; }
        .gd-hero-meta { display: flex; gap: 18px; margin-top: 18px; flex-wrap: wrap; align-items: center; }
        .gd-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; } .gd-meta-item i { color: #25D366; font-size: 14px; }
        .gd-hero-actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
        .gd-btn { padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .gd-btn-primary { background: #25D366; color: #fff; } .gd-btn-primary:hover { background: #128C7E; transform: scale(1.03); }
        .gd-btn-outline { background: #fff; color: #25D366; border: 1px solid #25D366; } .gd-btn-outline:hover { background: #f0fdf4; }
        .gd-btn-success { background: #10b981; color: #fff; } .gd-btn-success:hover { background: #059669; transform: scale(1.03); }
        .gd-btn-completed { background: #d1d5db; color: #fff; cursor: default; } .gd-btn-completed:hover { transform: none; }
        .gd-content-card { background: #fff; border-radius: 20px; padding: 32px; margin-bottom: 20px; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-content-card h4 { font-weight: 800; font-size: 20px; margin: 0 0 8px; color: #0f172a; }
        .gd-content-card .gd-subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
        .gd-overview { background: #f0fdf4; border-radius: 14px; padding: 20px 24px; margin-bottom: 28px; border-left: 4px solid #25D366; }
        .gd-overview p { margin: 0; font-size: 14px; color: #14532d; line-height: 1.8; }
        .gd-section-title { font-weight: 800; font-size: 18px; color: #0f172a; margin: 28px 0 16px; display: flex; align-items: center; gap: 8px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9; }
        .gd-step { display: flex; gap: 16px; padding: 20px 0; border-bottom: 1px solid #f1f5f9; align-items: flex-start; }
        .gd-step:last-child { border-bottom: none; }
        .gd-step-num { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #25D366, #128C7E); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 17px; flex-shrink: 0; }
        .gd-step-content { flex: 1; } .gd-step-content h6 { font-weight: 700; font-size: 15px; margin: 0 0 4px; color: #0f172a; }
        .gd-step-content p { font-size: 14px; color: #475569; margin: 0; line-height: 1.7; }
        .gd-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 14px 0; }
        .gd-compare-card { border-radius: 12px; padding: 16px 18px; border: 1px solid #e2e8f0; }
        .gd-compare-card.recommended { background: #f0fdf4; border-color: #25D366; }
        .gd-compare-card h6 { font-weight: 700; font-size: 14px; margin: 0 0 6px; }
        .gd-compare-card ul { margin: 0; padding-left: 16px; } .gd-compare-card li { font-size: 12px; color: #475569; margin-bottom: 3px; }
        .gd-tips-card { background: linear-gradient(135deg, #fef3c7, #fffbeb); border-radius: 16px; padding: 22px 26px; margin-top: 24px; border: 1px solid #fcd34d; }
        .gd-tips-card h5 { font-weight: 800; color: #92400e; margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
        .gd-tips-card ul { margin: 0; padding-left: 20px; } .gd-tips-card li { font-size: 13px; color: #a16207; margin-bottom: 6px; line-height: 1.6; } .gd-tips-card li:last-child { margin-bottom: 0; }
        .gd-related { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
        .gd-related-pill { padding: 9px 18px; border-radius: 20px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 13px; cursor: pointer; transition: 0.2s; color: #475569; display: inline-flex; align-items: center; gap: 6px; }
        .gd-related-pill:hover { background: #f0fdf4; border-color: #25D366; color: #25D366; }
        .gd-upsell { background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 18px; padding: 28px 32px; margin-top: 28px; border: 1px solid #c7d2fe; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .gd-upsell h5 { font-weight: 800; color: #3730a3; margin: 0; font-size: 18px; } .gd-upsell p { color: #4f46e5; margin: 4px 0 0; font-size: 14px; }
        .gd-nav-btns { display: flex; justify-content: space-between; margin-top: 32px; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 768px) { .gd-hero { padding: 24px 18px; } .gd-hero h3 { font-size: 22px; } .gd-content-card { padding: 20px 16px; } .gd-step { flex-direction: column; gap: 10px; } .gd-compare { grid-template-columns: 1fr; } .gd-upsell { flex-direction: column; text-align: center; } .gd-nav-btns { flex-direction: column; align-items: stretch; } }
      </style>

      <div class="gd-wrap">
        <div class="gd-back-row">
          <button class="gd-back-btn" onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();"><i class="fas fa-arrow-left"></i> Back to All Guides</button>
          <div class="gd-breadcrumb"><span onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();">📖 Platform Documentation</span><i class="fas fa-chevron-right" style="font-size:10px;"></i><span style="color:#25D366;font-weight:600;">WhatsApp Chat Setup</span></div>
        </div>

        <div class="gd-hero">
          <div class="gd-hero-icon"><i class="fab fa-whatsapp"></i></div>
          <h3>WhatsApp Chat Setup — Connect & Start Conversations</h3>
          <p>Connect WhatsApp API to your CRM, manage live chat with customers, use quick replies, handle multiple conversations simultaneously, and automate responses — all from one unified inbox.</p>
          <div class="gd-hero-meta">
            <div class="gd-meta-item"><i class="fas fa-signal"></i> 🟡 Intermediate</div>
            <div class="gd-meta-item"><i class="fas fa-clock"></i> 9 min read</div>
            <div class="gd-meta-item"><i class="fas fa-layer-group"></i> 6 Steps</div>
            <div class="gd-meta-item"><i class="fas fa-globe"></i> Updated: Jul 2026</div>
          </div>
          <div class="gd-hero-actions">
            ${isCompleted ? `<button class="gd-btn gd-btn-completed"><i class="fas fa-check-circle"></i> Completed ✓</button>` : `<button class="gd-btn gd-btn-success" onclick="ChatsGuide.triggerComplete()"><i class="fas fa-check"></i> Mark as Complete</button>`}
            <button class="gd-btn gd-btn-outline" onclick="PlatformDocs.toggleBookmark('chats');PlatformDocs.currentGuide='chats';PlatformDocs.render();"><i class="fas ${isBookmarked ? 'fa-star' : 'fa-star'}"></i> ${isBookmarked ? 'Bookmarked' : 'Bookmark'}</button>
            <button class="gd-btn gd-btn-outline" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
          </div>
        </div>

        <div class="gd-content-card">
          <h4>💬 WhatsApp — Your Primary Communication Channel</h4>
          <p class="gd-subtitle">WhatsApp has 2 billion+ users. Connect it to your CRM for seamless, professional communication at scale.</p>
          <div class="gd-overview"><p>WhatsApp is where your customers are. Setting up the official API connection unlocks <strong>multi-agent support, automation, template messaging, and 24/7 availability</strong> — all without your personal phone needing to be online. This guide covers both setup options and how to manage conversations efficiently.</p></div>

          <div class="gd-section-title"><i class="fas fa-balance-scale" style="color:#25D366;"></i> Choose Your WhatsApp Setup</div>
          
          <div class="gd-compare">
            <div class="gd-compare-card">
              <h6>📱 WhatsApp Web (Basic)</h6>
              <ul>
                <li>Scan QR code with phone</li>
                <li>1 agent only</li>
                <li>Phone must stay online</li>
                <li>No automation</li>
                <li>No template messages</li>
                <li>Free</li>
                <li>Good for: Solo entrepreneurs</li>
              </ul>
            </div>
            <div class="gd-compare-card recommended">
              <h6>☁️ WhatsApp Cloud API ⭐ Recommended</h6>
              <ul>
                <li>Connect via Meta Business Suite</li>
                <li>Unlimited agents</li>
                <li>Phone can be offline</li>
                <li>Full automation & chatbot</li>
                <li>Pre-approved templates</li>
                <li>Pay per conversation</li>
                <li>Good for: Teams & businesses</li>
              </ul>
            </div>
          </div>

          <div class="gd-section-title"><i class="fas fa-list-ol" style="color:#25D366;"></i> Setup Steps</div>
          
          <div class="gd-step"><div class="gd-step-num">1</div><div class="gd-step-content"><h6>API Connection (Cloud API)</h6><p>Go to <strong>Settings → WhatsApp Integration</strong>. Choose "Cloud API". You'll need: <strong>Business ID</strong> (from Meta Business Suite), <strong>Phone Number ID</strong> (your WhatsApp Business number), and <strong>Permanent Access Token</strong> (generated in Meta Developer Console). Paste all three, click "Test Connection" — you should see ✅ Connected. If using WhatsApp Web instead, simply scan the QR code with your phone.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">2</div><div class="gd-step-content"><h6>Chat Interface Walkthrough</h6><p><strong>Left panel:</strong> Conversation list with search bar and filters (All, Unread, Assigned to Me, Waiting). Each conversation shows contact name, last message preview, and timestamp. <strong>Center:</strong> Active chat window — full message history with date separators. Support for text, images, documents, voice notes, and location. <strong>Right panel:</strong> Contact details card — name, phone, tags, assigned agent, pipeline stage, notes, and quick actions.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">3</div><div class="gd-step-content"><h6>Quick Replies — Save Hours Daily</h6><p>Create saved message templates for common responses: <strong>/greeting</strong> → "Hello {{name}}! How can I help you today?", <strong>/pricing</strong> → "Our pricing starts at ₹999/month. Here's the full plan comparison...", <strong>/support</strong> → "I'm creating a support ticket for you. An agent will follow up within 2 hours.", <strong>/bookdemo</strong> → "Here's my calendar link to book a free demo: {{calendar_link}}". Agents type "/" in the chat to access all quick replies instantly.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">4</div><div class="gd-step-content"><h6>Chat Assignment — Get the Right Agent</h6><p>Configure auto-assignment rules: <strong>Round-robin</strong> (fair distribution), <strong>Contact owner</strong> (the agent who manages this contact), <strong>Language-based</strong> (English → Agent A, Hindi → Agent B), <strong>Manual assignment</strong> (admin assigns chats). New chats appear in the assigned agent's inbox. Unassigned chats go to "Unassigned" queue visible to all agents.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">5</div><div class="gd-step-content"><h6>Chat Labels & Status Tracking</h6><p>Label conversations for organization: <strong>"Hot Lead"</strong> (ready to buy), <strong>"Support"</strong> (customer issue), <strong>"Payment Pending"</strong> (waiting for payment), <strong>"Resolved"</strong> (closed successfully). Filter by status: <strong>Open</strong> (active conversation), <strong>Waiting</strong> (waiting for customer reply), <strong>Resolved</strong> (closed). Never lose track of a conversation — every chat has a clear status.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">6</div><div class="gd-step-content"><h6>Business Hours & Auto-Replies</h6><p>Set your business hours in <strong>Settings → WhatsApp → Business Hours</strong>. Outside these hours, auto-reply with: "We're currently offline. Our business hours are Mon-Sat, 9 AM - 7 PM IST. We'll respond first thing when we're back! For urgent issues, email support@yourcompany.com." You can also set <strong>away messages</strong> for when all agents are busy.</p></div></div>

          <div class="gd-tips-card">
            <h5><i class="fas fa-lightbulb" style="color:#f59e0b;"></i> Pro Tips</h5>
            <ul>
              <li><strong>Always use Cloud API</strong> if you have more than 1 agent — WhatsApp Web is severely limited for business use.</li>
              <li><strong>Pre-approve message templates</strong> in Meta Business Suite before running campaigns — approval takes 24-48 hours.</li>
              <li><strong>Set up chat transcript export</strong> for quality assurance — review agent conversations weekly.</li>
              <li><strong>Use the mobile app</strong> to respond to chats on the go — available for iOS and Android.</li>
            </ul>
          </div>

          <h5 style="font-weight:700;margin-top:28px;color:#0f172a;">🔗 Related Guides</h5>
          <div class="gd-related">
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('chatbot')">🤖 AI Chatbot Setup</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('templates-flows')">🔄 Templates & Flows</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('campaigns')">📨 Campaign Creation</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('contacts')">📇 Contacts Management</span>
          </div>
        </div>

        <div class="gd-upsell"><div><h5>💬 Multi-Agent WhatsApp & AI Chatbot</h5><p>Free plan: 1 agent on WhatsApp. Pro: Unlimited agents, AI auto-replies, WhatsApp Shop integration, and priority support.</p></div><button class="gd-btn gd-btn-primary" onclick="Plan.render()"><i class="fas fa-crown"></i> Add More Agents</button></div>

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
    PlatformDocs.markComplete('chats');
    PlatformDocs.currentGuide = 'chats';
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
      if (!pg['chats'] || pg['chats'] < 10) {
        pg['chats'] = 10;
        await docRef.set({ platformGuides: pg, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    } catch (e) { console.error('Progress error:', e); }
  }
};
window.ChatsGuide = ChatsGuide;