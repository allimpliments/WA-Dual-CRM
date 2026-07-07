// js/chats.js — Unified Live Chat (WhatsApp Live + Meta Inbox + Social Platforms + clientId isolation)
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

    const tabs = [
      { key: 'whatsapp', name: 'WhatsApp', icon: 'fa-whatsapp', color: '#25D366', status: 'live' },
      { key: 'facebook', name: 'FB Messenger', icon: 'fa-facebook-messenger', color: '#00B2FF', status: 'meta' },
      { key: 'instagram', name: 'Instagram', icon: 'fa-instagram', color: '#E4405F', status: 'meta' },
      { key: 'linkedin', name: 'LinkedIn', icon: 'fa-linkedin', color: '#0A66C2', status: 'coming' },
      { key: 'youtube', name: 'YouTube', icon: 'fa-youtube', color: '#FF0000', status: 'coming' },
      { key: 'telegram', name: 'Telegram', icon: 'fa-telegram', color: '#0088cc', status: 'coming' },
      { key: 'email', name: 'Email', icon: 'fa-envelope', color: '#ea4335', status: 'coming' },
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
        .chat-status-badge.meta{background:#f59e0b;color:#fff;}
        .chat-status-badge.coming{background:#6b7280;color:#fff;}
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
        .meta-open-btn{padding:14px 32px;border-radius:12px;font-weight:600;border:none;cursor:pointer;color:#fff;font-size:15px;}
        .platform-status{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:12px;font-size:11px;font-weight:500;}
        .platform-status.connected{background:#d1fae5;color:#065f46;}
        .platform-status.disconnected{background:#fee2e2;color:#991b1b;}
        .platform-status.coming{background:#f3f4f6;color:#6b7280;}
      </style>

      <div class="chat-tabs">
        ${tabs.map(t => `
          <div class="chat-tab ${t.key} ${this.currentChatTab===t.key?'active':''}" onclick="Chats.currentChatTab='${t.key}';Chats.render();">
            <i class="fab ${t.icon}"></i> ${t.name}
            <span class="chat-status-badge ${t.status}">${t.status==='live'?'LIVE':t.status==='meta'?'META':'SOON'}</span>
          </div>
        `).join('')}
      </div>
    `;

    if (this.currentChatTab === 'whatsapp') {
      html += await this.renderWhatsAppChat();
    } else if (this.currentChatTab === 'facebook' || this.currentChatTab === 'instagram') {
      html += this.renderMetaInbox(this.currentChatTab);
    } else {
      html += this.renderComingSoon(this.currentChatTab);
    }

    contentArea.innerHTML = html;
    this.setupRealtime(this.currentChatTab);
  },

  // ==================== WHATSAPP (LIVE) ====================
  async renderWhatsAppChat() {
    let messages = [];
    let waConfig = { connected: false };
    try {
      // WhatsApp config चेक करें
      const cfgDoc = await db.collection('settings').doc('whatsapp').get();
      if (cfgDoc.exists) {
        const cfg = cfgDoc.data();
        waConfig.connected = !!(cfg.accessToken && cfg.phoneNumberId);
      }

      // Messages लोड करें
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
              <h6 class="mb-0"><i class="fab fa-whatsapp text-success me-1"></i>Send Message</h6>
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
            <h6><i class="fas fa-robot text-warning me-1"></i>AI Auto-Reply (Groq)</h6>
            <p class="small text-muted">Bot auto-replies via Groq AI + Meta Keywords.</p>
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

  // ==================== META INBOX (FB + IG) ====================
  renderMetaInbox(platform) {
    const config = {
      facebook: { name: 'Facebook Messenger', icon: 'fa-facebook-messenger', color: '#00B2FF', url: 'https://business.facebook.com/latest/inbox' },
      instagram: { name: 'Instagram Direct', icon: 'fa-instagram', color: '#E4405F', url: 'https://business.facebook.com/latest/inbox/instagram_direct' },
    };
    const cfg = config[platform];

    return `
      <div class="text-center" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:calc(100vh - 200px);">
        <i class="fab ${cfg.icon} fa-4x mb-3" style="color:${cfg.color};"></i>
        <h5>${cfg.name}</h5>
        <p class="text-muted small mb-2">Manage ${cfg.name} via Meta Business Inbox</p>
        <p class="text-muted small mb-4">Free auto-replies available via Meta Automations</p>
        <button class="meta-open-btn" style="background:${cfg.color};" onclick="Chats.openPopup('${platform}')">
          <i class="fas fa-external-link-alt me-2"></i> Open ${cfg.name}
        </button>
        <button class="btn btn-outline-info btn-sm mt-3" onclick="window.open('https://business.facebook.com/latest/inbox/automated_responses','_blank')">
          <i class="fas fa-magic me-1"></i> Setup Meta Auto-Replies (Free)
        </button>
        <div class="mt-4 p-3 rounded" style="background:#f0fdf4;max-width:400px;">
          <span class="badge bg-warning mb-2">🔜 Coming Soon</span>
          <p class="small text-muted mb-0">Real-time AI chat for ${cfg.name} is coming! Currently you can manage messages via Meta Inbox with free automations.</p>
        </div>
      </div>
    `;
  },

  // ==================== COMING SOON (LinkedIn + YouTube + Telegram + Email) ====================
  renderComingSoon(platform) {
    const config = {
      linkedin: { name: 'LinkedIn Messages', icon: 'fa-linkedin', color: '#0A66C2', url: 'https://www.linkedin.com/messaging' },
      youtube: { name: 'YouTube Comments', icon: 'fa-youtube', color: '#FF0000', url: 'https://studio.youtube.com/comments' },
      telegram: { name: 'Telegram Chat', icon: 'fa-telegram', color: '#0088cc', url: 'https://web.telegram.org' },
      email: { name: 'Email Inbox', icon: 'fa-envelope', color: '#ea4335', url: 'https://mail.google.com' },
    };
    const cfg = config[platform];

    return `
      <div class="text-center" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:calc(100vh - 200px);">
        <i class="fab ${cfg.icon} fa-4x mb-3" style="opacity:0.3;"></i>
        <h5>${cfg.name}</h5>
        <p class="text-muted small mb-4">Real-time AI chat coming soon for ${cfg.name}.</p>
        <button class="btn btn-outline-primary btn-sm mb-2" onclick="Chats.openPopup('${platform}')">
          <i class="fas fa-external-link-alt me-1"></i> Open ${cfg.name} Website
        </button>
        <div class="mt-4 p-3 rounded" style="background:#fef3c7;max-width:400px;">
          <span class="badge bg-warning mb-2">🔜 Coming Soon</span>
          <p class="small text-muted mb-0">We're working on bringing AI-powered live chat for ${cfg.name}. Stay tuned!</p>
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
      if (!ai.enabled || !ai.apiKey) {
        document.getElementById('aiTestResult').innerHTML = '<span class="text-warning">AI not enabled. Configure in Chatbot settings.</span>';
        return;
      }
      let reply = '';
      if (ai.provider === 'groq') {
        const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${ai.apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: ai.model || 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: msg }], max_tokens: 150 })
        });
        const d = await r.json();
        reply = d.choices?.[0]?.message?.content || d.error?.message || 'No response';
      }
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
          <div class="chat-msg ${msg.type||'incoming'}">
            <div class="chat-msg-avatar">${(msg.type==='incoming'?(this.contactCache[msg.from]||msg.from||'?')[0]:(this.contactCache[msg.to]||msg.to||'?')[0]).toUpperCase()}</div>
            <div class="chat-msg-body">
              <div class="d-flex justify-content-between"><span class="chat-msg-name">${msg.type==='incoming'?(this.contactCache[msg.from]||msg.from):(this.contactCache[msg.to]||msg.to)}</span><span class="chat-badge ${msg.type||'incoming'}">${msg.type}</span></div>
              <div class="chat-msg-text">${msg.body||'(media)'}</div>
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
