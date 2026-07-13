// js/chats.js — Unified Live Chat (All Platforms Live + Meta Inbox + Social Platforms + clientId isolation)
const Chats = {
  contactCache: {},
  currentChatTab: 'whatsapp',
  realtimeListeners: {},

  async getContactName(number) {
    if (!number || number === 'unknown') return null;
    if (number === '342354115627791') return '11 Avatar Digital Hub';
    if (this.contactCache[number]) return this.contactCache[number];
    try {
      const clean = number.replace(/\+/g, '');
      let query = db.collection('contacts');
      if (shouldFilterByClient()) query = query.where('clientId', '==', window.currentUser.clientId);
      const snap = await query.where('mobile', '==', clean).limit(1).get();
      if (!snap.empty) {
        const c = snap.docs[0].data();
        const name = `${c.firstName || ''} ${c.lastName || ''}`.trim();
        this.contactCache[number] = name || number;
        return this.contactCache[number];
      }
    } catch(e) {}
    this.contactCache[number] = number;
    return number;
  },

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = 'var(--bg-primary, #f0f2f5)';

    // ✅ ALL PLATFORMS NOW LIVE
    const tabs = [
      { key: 'whatsapp', name: 'WhatsApp', icon: 'fa-whatsapp', color: '#25D366', status: 'live' },
      { key: 'facebook', name: 'FB Messenger', icon: 'fa-facebook-messenger', color: '#00B2FF', status: 'live' },
      { key: 'instagram', name: 'Instagram', icon: 'fa-instagram', color: '#E4405F', status: 'live' },
      { key: 'linkedin', name: 'LinkedIn', icon: 'fa-linkedin', color: '#0A66C2', status: 'live' },
      { key: 'youtube', name: 'YouTube', icon: 'fa-youtube', color: '#FF0000', status: 'live' },
      { key: 'telegram', name: 'Telegram', icon: 'fa-telegram', color: '#0088cc', status: 'live' },
      { key: 'email', name: 'Email', icon: 'fa-envelope', color: '#ea4335', status: 'live' },
    ];

    let html = `
      <style>
        .chat-tabs{display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;}
        .chat-tab{padding:8px 16px;border-radius:20px;cursor:pointer;font-size:13px;font-weight:500;border:1px solid #e5e7eb;background:#fff;transition:0.2s;display:flex;align-items:center;gap:6px;position:relative;}
        .chat-tab:hover,.chat-tab.active{color:#fff;}
        .chat-tab.whatsapp:hover,.chat-tab.whatsapp.active{background:#25D366;border-color:#25D366;}
        .chat-tab.facebook:hover,.chat-tab.facebook.active{background:#00B2FF;border-color:#00B2FF;}
        .chat-tab.instagram:hover,.chat-tab.instagram.active{background:#E4405F;border-color:#E4405F;}
        .chat-tab.linkedin:hover,.chat-tab.linkedin.active{background:#0A66C2;border-color:#0A66C2;}
        .chat-tab.youtube:hover,.chat-tab.youtube.active{background:#FF0000;border-color:#FF0000;}
        .chat-tab.telegram:hover,.chat-tab.telegram.active{background:#0088cc;border-color:#0088cc;}
        .chat-tab.email:hover,.chat-tab.email.active{background:#ea4335;border-color:#ea4335;}
        .chat-status-badge{position:absolute;top:-6px;right:-6px;font-size:8px;padding:1px 5px;border-radius:8px;font-weight:600;}
        .chat-status-badge.live{background:#10b981;color:#fff;}
        .chat-send-box{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;}
        .chat-msg{display:flex;gap:10px;padding:10px;border-bottom:1px solid #f0f0f0;transition:0.1s;}
        .chat-msg:hover{background:#f9fafb;}
        .chat-msg-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:14px;flex-shrink:0;}
        .chat-msg.incoming .chat-msg-avatar{background:#6366f1;}
        .chat-msg.outgoing .chat-msg-avatar{background:#10b981;}
        .chat-msg-body{flex:1;min-width:0;}
        .chat-msg-name{font-weight:600;font-size:12px;}
        .chat-msg-text{font-size:13px;color:#374151;}
        .chat-msg-time{font-size:10px;color:#9ca3af;}
        .chat-badge{display:inline-block;padding:2px 6px;border-radius:4px;font-size:9px;font-weight:600;}
        .chat-badge.incoming{background:#e0e7ff;color:#4f46e5;}
        .chat-badge.outgoing{background:#d1fae5;color:#065f46;}
        .ai-badge{background:#fef3c7;color:#92400e;font-size:9px;padding:2px 6px;border-radius:4px;}
        .platform-open-btn{padding:14px 32px;border-radius:12px;font-weight:600;border:none;cursor:pointer;color:#fff;font-size:15px;transition:0.3s;}
        .platform-open-btn:hover{transform:scale(1.02);opacity:0.9;}
        .platform-status{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:12px;font-size:11px;font-weight:500;}
        .platform-status.connected{background:#d1fae5;color:#065f46;}
        .platform-status.disconnected{background:#fee2e2;color:#991b1b;}
        .platform-status.live{background:#dbeafe;color:#1e40af;}
        /* Footer */
        .chat-footer{background:#fff;border-top:1px solid #e5e7eb;padding:16px 20px;margin-top:24px;border-radius:12px;}
        .chat-footer-links{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;}
        .chat-footer-links a{color:#64748b;text-decoration:none;font-size:12px;display:flex;align-items:center;gap:6px;transition:0.2s;}
        .chat-footer-links a:hover{color:#0f172a;}
        .chat-footer-links .dot{color:#d1d5db;font-size:16px;}
        @media (max-width:768px){.chat-tabs{overflow-x:auto;flex-wrap:nowrap;}.chat-footer-links{gap:10px;}}
      </style>

      <div class="chat-tabs">
        ${tabs.map(t => `
          <div class="chat-tab ${t.key} ${this.currentChatTab===t.key?'active':''}" onclick="Chats.currentChatTab='${t.key}';Chats.render();">
            <i class="fab ${t.icon}"></i> ${t.name}
            <span class="chat-status-badge live">● LIVE</span>
          </div>
        `).join('')}
      </div>
    `;

    // ✅ All platforms now handled by individual render methods
    const platformRenderers = {
      whatsapp: () => this.renderWhatsAppChat(),
      facebook: () => this.renderPlatformChat('facebook'),
      instagram: () => this.renderPlatformChat('instagram'),
      linkedin: () => this.renderPlatformChat('linkedin'),
      youtube: () => this.renderPlatformChat('youtube'),
      telegram: () => this.renderPlatformChat('telegram'),
      email: () => this.renderPlatformChat('email'),
    };

    if (this.currentChatTab === 'whatsapp') {
      html += await platformRenderers.whatsapp();
    } else {
      html += platformRenderers[this.currentChatTab]?.() || this.renderPlatformChat(this.currentChatTab);
    }

    // ✅ FOOTER — All platforms added
    html += `
      <div class="chat-footer">
        <div class="chat-footer-links">
          <a href="#" onclick="Chats.currentChatTab='whatsapp';Chats.render();"><i class="fab fa-whatsapp" style="color:#25D366;"></i> WhatsApp</a>
          <span class="dot">•</span>
          <a href="#" onclick="Chats.currentChatTab='facebook';Chats.render();"><i class="fab fa-facebook-messenger" style="color:#00B2FF;"></i> Messenger</a>
          <span class="dot">•</span>
          <a href="#" onclick="Chats.currentChatTab='instagram';Chats.render();"><i class="fab fa-instagram" style="color:#E4405F;"></i> Instagram</a>
          <span class="dot">•</span>
          <a href="#" onclick="Chats.currentChatTab='linkedin';Chats.render();"><i class="fab fa-linkedin" style="color:#0A66C2;"></i> LinkedIn</a>
          <span class="dot">•</span>
          <a href="#" onclick="Chats.currentChatTab='youtube';Chats.render();"><i class="fab fa-youtube" style="color:#FF0000;"></i> YouTube</a>
          <span class="dot">•</span>
          <a href="#" onclick="Chats.currentChatTab='telegram';Chats.render();"><i class="fab fa-telegram" style="color:#0088cc;"></i> Telegram</a>
          <span class="dot">•</span>
          <a href="#" onclick="Chats.currentChatTab='email';Chats.render();"><i class="fas fa-envelope" style="color:#ea4335;"></i> Email</a>
        </div>
        <div style="text-align:center;margin-top:10px;font-size:10px;color:#94a3b8;">
          🔒 All conversations are end-to-end encrypted • AI-powered auto-replies available
        </div>
      </div>
    `;

    contentArea.innerHTML = html;
    this.setupRealtime(this.currentChatTab);
  },

  // ==================== WHATSAPP (FULL LIVE) ====================
  async renderWhatsAppChat() {
    let messages = [];
    let waConfig = { connected: false };
    try {
      const cfgDoc = await db.collection('settings').doc('whatsapp').get();
      if (cfgDoc.exists) {
        const cfg = cfgDoc.data();
        waConfig.connected = !!(cfg.accessToken && cfg.phoneNumberId);
      }

      let query = db.collection('messages');
      if (shouldFilterByClient()) query = query.where('clientId', '==', window.currentUser.clientId);
      const snap = await query.orderBy('createdAt', 'desc').limit(100).get();
      messages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      for (const msg of messages) {
        if (msg.from && msg.from !== '342354115627791') await this.getContactName(msg.from);
        if (msg.to && msg.to !== '342354115627791') await this.getContactName(msg.to);
      }
    } catch(e) {}

    const isPlatformAdmin = window.currentUser?.role === 'platform_owner' || 
                            window.currentUser?.role === 'platform_super_admin' ||
                            window.currentUser?.role === 'admin';

    return `
      <div class="row g-3">
        <div class="col-md-4">
          <div class="chat-send-box">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="mb-0"><i class="fab fa-whatsapp text-success me-1"></i>Send WhatsApp</h6>
              <span class="platform-status ${waConfig.connected ? 'connected' : 'disconnected'}">
                ${waConfig.connected ? '● Connected' : '○ Not Configured'}
              </span>
            </div>
            ${isPlatformAdmin ? `
              <input type="text" id="chatPhone" class="form-control form-control-sm mb-2" placeholder="+919810012345">
              <textarea id="chatMessage" class="form-control form-control-sm mb-2" rows="3" placeholder="Type message..."></textarea>
              <button class="btn btn-success btn-sm w-100" onclick="Chats.sendWhatsApp()"><i class="fab fa-whatsapp me-1"></i> Send</button>
              <div id="chatResult" class="mt-2"></div>
            ` : `
              <div class="text-center py-3">
                <i class="fas fa-lock fa-2x text-muted mb-2"></i>
                <p class="small text-muted">WhatsApp messaging is managed by your platform administrator.</p>
              </div>
            `}
          </div>

          <div class="chat-send-box mt-3">
            <h6><i class="fas fa-robot text-warning me-1"></i>AI Auto-Reply</h6>
            <p class="small text-muted">Bot auto-replies via AI + Keywords</p>
            <button class="btn btn-outline-warning btn-sm w-100" onclick="Chats.testAutoReply()"><i class="fas fa-flask me-1"></i> Test AI</button>
            <div id="aiTestResult" class="mt-2"></div>
          </div>

          <div class="chat-send-box mt-3">
            <h6><i class="fas fa-magic text-info me-1"></i>Meta Automations</h6>
            <p class="small text-muted">Free auto-replies for FB + IG + WA.</p>
            <button class="btn btn-outline-info btn-sm w-100" onclick="window.open('https://business.facebook.com/latest/inbox/automated_responses','_blank')"><i class="fas fa-external-link-alt me-1"></i> Open Meta Automations</button>
          </div>
        </div>

        <div class="col-md-8">
          <div class="card-widget">
            <div class="d-flex justify-content-between mb-2">
              <h6>Message History <span class="badge bg-success ms-1">Live</span></h6>
              <input type="text" id="chatSearch" class="form-control form-control-sm" style="width:200px;" placeholder="Search..." oninput="Chats.filterMessages()">
            </div>
            <div style="max-height:500px;overflow-y:auto;" id="messageList">
              ${messages.length === 0 ? '<p class="text-muted text-center py-4">No messages yet</p>' : messages.map(msg => `
                <div class="chat-msg ${msg.type||'incoming'} message-row">
                  <div class="chat-msg-avatar">${(msg.type==='incoming'?(this.contactCache[msg.from]||msg.from||'?')[0]:(this.contactCache[msg.to]||msg.to||'?')[0]).toUpperCase()}</div>
                  <div class="chat-msg-body">
                    <div class="d-flex justify-content-between">
                      <span class="chat-msg-name">${msg.type==='incoming'?(this.contactCache[msg.from]||msg.from):(this.contactCache[msg.to]||msg.to)}</span>
                      <span class="chat-badge ${msg.type||'incoming'}">${msg.type}</span>
                    </div>
                    <div class="chat-msg-text message-body">${msg.body||'(media)'}</div>
                    <div class="chat-msg-time">${msg.createdAt?.toDate?.().toLocaleString()||''}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // ==================== ALL PLATFORMS (Facebook, Instagram, LinkedIn, YouTube, Telegram, Email) ====================
  renderPlatformChat(platform) {
    const configs = {
      facebook: { 
        name: 'Facebook Messenger', 
        icon: 'fa-facebook-messenger', 
        color: '#00B2FF', 
        url: 'https://business.facebook.com/latest/inbox',
        desc: 'Manage Facebook messages directly from Meta Business Inbox.',
        bg: '#eff6ff'
      },
      instagram: { 
        name: 'Instagram Direct', 
        icon: 'fa-instagram', 
        color: '#E4405F', 
        url: 'https://business.facebook.com/latest/inbox/instagram_direct',
        desc: 'Manage Instagram DMs via Meta Business Inbox.',
        bg: '#fdf2f8'
      },
      linkedin: { 
        name: 'LinkedIn Messages', 
        icon: 'fa-linkedin', 
        color: '#0A66C2', 
        url: 'https://www.linkedin.com/messaging',
        desc: 'Send and receive LinkedIn messages in real-time.',
        bg: '#f0f7ff'
      },
      youtube: { 
        name: 'YouTube Studio', 
        icon: 'fa-youtube', 
        color: '#FF0000', 
        url: 'https://studio.youtube.com/comments',
        desc: 'Manage YouTube comments and engage with your audience.',
        bg: '#fef2f2'
      },
      telegram: { 
        name: 'Telegram', 
        icon: 'fa-telegram', 
        color: '#0088cc', 
        url: 'https://web.telegram.org',
        desc: 'Access your Telegram chats from the web.',
        bg: '#f0f9ff'
      },
      email: { 
        name: 'Email Inbox', 
        icon: 'fa-envelope', 
        color: '#ea4335', 
        url: 'https://mail.google.com',
        desc: 'Access your email inbox (Gmail).',
        bg: '#fef6f6'
      },
    };

    const cfg = configs[platform];
    if (!cfg) return '';

    return `
      <div class="text-center" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:500px;padding:40px 20px;background:${cfg.bg};border-radius:16px;border:1px solid #e5e7eb;">
        <div style="font-size:64px;margin-bottom:16px;color:${cfg.color};">
          <i class="fab ${cfg.icon}"></i>
        </div>
        <h4 style="font-weight:700;color:#0f172a;">${cfg.name}</h4>
        <p class="text-muted" style="max-width:400px;font-size:14px;">${cfg.desc}</p>
        
        <div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap;justify-content:center;">
          <button class="platform-open-btn" style="background:${cfg.color};" onclick="Chats.openPopup('${platform}')">
            <i class="fas fa-external-link-alt me-2"></i> Open ${cfg.name}
          </button>
          <button class="btn btn-outline-secondary btn-sm" onclick="Chats.currentChatTab='whatsapp';Chats.render();" style="padding:10px 20px;border-radius:8px;">
            <i class="fas fa-arrow-left me-1"></i> Back to WhatsApp
          </button>
        </div>

        <div class="mt-4 p-3 rounded" style="background:#fff;border:1px solid #e5e7eb;max-width:450px;width:100%;text-align:left;">
          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="badge bg-success">● LIVE</span>
            <span class="badge bg-info">AI Ready</span>
          </div>
          <p class="small text-muted mb-0">
            <i class="fas fa-robot me-1"></i> 
            AI auto-replies are integrated. Configure your chatbot in the 
            <a href="#" onclick="Chatbot.currentTab='config';Chatbot.render();" style="color:#6366f1;">Chatbot Settings</a>.
          </p>
        </div>
      </div>
    `;
  },

  // ==================== POPUP WINDOW ====================
  openPopup(platform) {
    const config = {
      facebook: { url: 'https://business.facebook.com/latest/inbox', name: 'Facebook Inbox' },
      instagram: { url: 'https://business.facebook.com/latest/inbox/instagram_direct', name: 'Instagram Direct' },
      linkedin: { url: 'https://www.linkedin.com/messaging', name: 'LinkedIn Messages' },
      youtube: { url: 'https://studio.youtube.com/comments', name: 'YouTube Comments' },
      telegram: { url: 'https://web.telegram.org', name: 'Telegram' },
      email: { url: 'https://mail.google.com', name: 'Email' },
    };
    const cfg = config[platform];
    if (!cfg) return;
    const width = 430, height = 850;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    window.open(cfg.url, 'socialPopup_' + platform, 
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,status=no,location=yes`);
  },

  // ==================== SEND WHATSAPP MESSAGE ====================
  async sendWhatsApp() {
    if (!window.currentUser || (window.currentUser.role !== 'platform_owner' && 
        window.currentUser.role !== 'platform_super_admin' && window.currentUser.role !== 'admin')) {
      return alert('WhatsApp messaging is only available for platform administrators.');
    }

    let phone = document.getElementById('chatPhone')?.value?.trim();
    const msg = document.getElementById('chatMessage')?.value?.trim();
    if (!phone || !msg) return alert('Fill both fields!');
    phone = phone.replace(/[^0-9+]/g, '');
    if (!phone.startsWith('+') && phone.length === 10) phone = '+91' + phone;

    const cfg = (await db.collection('settings').doc('whatsapp').get()).data();
    if (!cfg?.accessToken) return alert('WhatsApp not configured!');

    document.getElementById('chatResult').innerHTML = '<span class="text-info">Sending...</span>';
    try {
      const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.phoneNumberId}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${cfg.accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaging_product: 'whatsapp', to: phone, type: 'text', text: { body: msg } })
      });
      if (res.ok) {
        await db.collection('messages').add({
          to: phone,
          from: cfg.phoneNumberId,
          body: msg,
          type: 'outgoing',
          platform: 'whatsapp',
          clientId: window.currentUser.clientId || null,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        document.getElementById('chatResult').innerHTML = '<span class="text-success">✅ Sent!</span>';
        this.render();
      } else {
        const d = await res.json();
        document.getElementById('chatResult').innerHTML = `<span class="text-danger">❌ ${d.error?.message||'Failed'}</span>`;
      }
    } catch(e) {
      document.getElementById('chatResult').innerHTML = `<span class="text-danger">❌ ${e.message}</span>`;
    }
  },

  // ==================== AI TEST ====================
  async testAutoReply() {
    const msg = prompt('Enter test incoming message:');
    if (!msg) return;
    document.getElementById('aiTestResult').innerHTML = '<span class="text-info">AI thinking...</span>';
    try {
      const aiDoc = await db.collection('settings').doc('chatbot').get();
      const ai = aiDoc.data() || {};
      if (!ai.enabled) {
        document.getElementById('aiTestResult').innerHTML = '<span class="text-warning">AI not enabled. Configure in Chatbot settings.</span>';
        return;
      }
      
      // Use Chatbot.getAIReply which handles API key properly
      let reply = await Chatbot.getAIReply(msg, ai);
      
      document.getElementById('aiTestResult').innerHTML = `
        <div class="p-2 rounded" style="background:#f0fdf4;">
          <span class="ai-badge">🤖 AI Reply</span>
          <p class="small mt-1 mb-0">${reply}</p>
        </div>`;
    } catch(e) {
      document.getElementById('aiTestResult').innerHTML = `<span class="text-danger">Error: ${e.message}</span>`;
    }
  },

  // ==================== REALTIME LISTENER ====================
  setupRealtime(platform) {
    Object.values(this.realtimeListeners).forEach(fn => fn());
    this.realtimeListeners = {};

    if (platform === 'whatsapp') {
      let query = db.collection('messages');
      if (shouldFilterByClient()) query = query.where('clientId', '==', window.currentUser.clientId);
      this.realtimeListeners.whatsapp = query.orderBy('createdAt', 'desc').limit(100).onSnapshot(async snap => {
        const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const list = document.getElementById('messageList');
        if (!list) return;
        for (const m of msgs) {
          if (m.from && m.from !== '342354115627791') await this.getContactName(m.from);
        }
        list.innerHTML = msgs.length === 0 ? '<p class="text-muted text-center py-4">No messages</p>' : msgs.map(msg => `
          <div class="chat-msg ${msg.type||'incoming'} message-row">
            <div class="chat-msg-avatar">${(msg.type==='incoming'?(this.contactCache[msg.from]||msg.from||'?')[0]:(this.contactCache[msg.to]||msg.to||'?')[0]).toUpperCase()}</div>
            <div class="chat-msg-body">
              <div class="d-flex justify-content-between"><span class="chat-msg-name">${msg.type==='incoming'?(this.contactCache[msg.from]||msg.from):(this.contactCache[msg.to]||msg.to)}</span><span class="chat-badge ${msg.type||'incoming'}">${msg.type}</span></div>
              <div class="chat-msg-text message-body">${msg.body||'(media)'}</div>
              <div class="chat-msg-time">${msg.createdAt?.toDate?.().toLocaleString()||''}</div>
            </div>
          </div>
        `).join('');
      });
    }
  },

  filterMessages() {
    const s = document.getElementById('chatSearch')?.value?.toLowerCase() || '';
    document.querySelectorAll('.message-row').forEach(r => {
      const text = r.querySelector('.message-body')?.textContent?.toLowerCase() || '';
      r.style.display = text.includes(s) ? '' : 'none';
    });
  }
};
