// js/chats.js — Unified Live Chat with AI Auto-Reply (All Platforms)
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
      const snap = await db.collection('contacts').where('mobile', '==', clean).limit(1).get();
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
      { key: 'whatsapp', name: 'WhatsApp', icon: 'fa-whatsapp', color: '#25D366' },
      { key: 'facebook', name: 'FB Messenger', icon: 'fa-facebook-messenger', color: '#00B2FF' },
      { key: 'instagram', name: 'Instagram', icon: 'fa-instagram', color: '#E4405F' },
      { key: 'linkedin', name: 'LinkedIn', icon: 'fa-linkedin', color: '#0A66C2' },
      { key: 'youtube', name: 'YouTube', icon: 'fa-youtube', color: '#FF0000' },
    ];

    let html = `
      <style>
        .chat-tabs{display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;}
        .chat-tab{padding:8px 16px;border-radius:20px;cursor:pointer;font-size:13px;font-weight:500;border:1px solid #e5e7eb;background:#fff;transition:0.2s;display:flex;align-items:center;gap:6px;}
        .chat-tab:hover,.chat-tab.active{color:#fff;}
        .chat-tab.whatsapp:hover,.chat-tab.whatsapp.active{background:#25D366;border-color:#25D366;}
        .chat-tab.facebook:hover,.chat-tab.facebook.active{background:#00B2FF;border-color:#00B2FF;}
        .chat-tab.instagram:hover,.chat-tab.instagram.active{background:#E4405F;border-color:#E4405F;}
        .chat-tab.linkedin:hover,.chat-tab.linkedin.active{background:#0A66C2;border-color:#0A66C2;}
        .chat-tab.youtube:hover,.chat-tab.youtube.active{background:#FF0000;border-color:#FF0000;}
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
      </style>

      <div class="chat-tabs">
        ${tabs.map(t => `
          <div class="chat-tab ${t.key} ${this.currentChatTab===t.key?'active':''}" onclick="Chats.currentChatTab='${t.key}';Chats.render();">
            <i class="fab ${t.icon}"></i> ${t.name}
          </div>
        `).join('')}
      </div>
    `;

    if (this.currentChatTab === 'whatsapp') {
      html += await this.renderWhatsAppChat();
    } else {
      html += await this.renderSocialChat(this.currentChatTab);
    }

    contentArea.innerHTML = html;

    // Setup realtime listener
    this.setupRealtime(this.currentChatTab);
  },

  // ==================== WHATSAPP CHAT ====================
  async renderWhatsAppChat() {
    let messages = [];
    try {
      const snap = await db.collection('messages').orderBy('createdAt', 'desc').limit(100).get();
      messages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      for (const msg of messages) {
        if (msg.from && msg.from !== '342354115627791') await this.getContactName(msg.from);
        if (msg.to && msg.to !== '342354115627791') await this.getContactName(msg.to);
      }
    } catch(e) {}

    return `
      <div class="row g-3">
        <div class="col-md-4">
          <div class="chat-send-box">
            <h6><i class="fab fa-whatsapp text-success me-1"></i>Send Message</h6>
            <input type="text" id="chatPhone" class="form-control form-control-sm mb-2" placeholder="+919810012345">
            <textarea id="chatMessage" class="form-control form-control-sm mb-2" rows="3" placeholder="Type message..."></textarea>
            <button class="btn btn-success btn-sm w-100" onclick="Chats.sendWhatsApp()"><i class="fab fa-whatsapp me-1"></i> Send</button>
            <div id="chatResult" class="mt-2"></div>
          </div>
          <div class="chat-send-box mt-3">
            <h6><i class="fas fa-robot text-warning me-1"></i>AI Auto-Reply</h6>
            <p class="small text-muted">Bot automatically replies to incoming messages via Groq AI.</p>
            <button class="btn btn-outline-warning btn-sm w-100" onclick="Chats.testAutoReply()"><i class="fas fa-flask me-1"></i> Test AI Reply</button>
            <div id="aiTestResult" class="mt-2"></div>
          </div>
        </div>
        <div class="col-md-8">
          <div class="card-widget">
            <div class="d-flex justify-content-between mb-2">
              <h6>Message History</h6>
              <input type="text" id="chatSearch" class="form-control form-control-sm" style="width:200px;" placeholder="Search..." oninput="Chats.filterMessages()">
            </div>
            <div style="max-height:500px;overflow-y:auto;" id="messageList">
              ${messages.length === 0 ? '<p class="text-muted text-center py-4">No messages</p>' : messages.map(msg => `
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

  // ==================== SOCIAL CHAT (FB, IG, LI, YT) ====================
  async renderSocialChat(platform) {
    const config = {
      facebook: { name: 'Facebook Messenger', icon: 'fa-facebook-messenger', color: '#00B2FF', collection: 'socialMessages' },
      instagram: { name: 'Instagram Direct', icon: 'fa-instagram', color: '#E4405F', collection: 'socialMessages' },
      linkedin: { name: 'LinkedIn Messages', icon: 'fa-linkedin', color: '#0A66C2', collection: 'socialMessages' },
      youtube: { name: 'YouTube Comments', icon: 'fa-youtube', color: '#FF0000', collection: 'socialMessages' },
    };

    const cfg = config[platform];
    let messages = [];
    try {
      const snap = await db.collection(cfg.collection).where('platform','==',platform).orderBy('createdAt','desc').limit(50).get();
      messages = snap.docs.map(d=>({id:d.id,...d.data()}));
    } catch(e) {}

    return `
      <div class="row g-3">
        <div class="col-md-4">
          <div class="chat-send-box">
            <h6><i class="fab ${cfg.icon} me-1" style="color:${cfg.color};"></i>Send ${cfg.name} Message</h6>
            <input type="text" id="socialTo" class="form-control form-control-sm mb-2" placeholder="Recipient ID / Name">
            <textarea id="socialMessage" class="form-control form-control-sm mb-2" rows="3" placeholder="Type message..."></textarea>
            <button class="btn btn-sm w-100" style="background:${cfg.color};color:#fff;" onclick="Chats.sendSocial('${platform}')"><i class="fas fa-paper-plane me-1"></i> Send</button>
            <div id="socialResult" class="mt-2"></div>
          </div>
        </div>
        <div class="col-md-8">
          <div class="card-widget">
            <h6>${cfg.name} Messages</h6>
            <div style="max-height:500px;overflow-y:auto;">
              ${messages.length === 0 ? '<p class="text-muted text-center py-4">No messages yet</p>' : messages.map(m => `
                <div class="chat-msg ${m.type||'incoming'}">
                  <div class="chat-msg-avatar">${(m.from||'?')[0].toUpperCase()}</div>
                  <div class="chat-msg-body">
                    <div class="d-flex justify-content-between">
                      <span class="chat-msg-name">${m.from||'User'}</span>
                      <span class="chat-badge ${m.type||'incoming'}">${m.type}</span>
                    </div>
                    <div class="chat-msg-text">${m.body||'(no text)'}</div>
                    <div class="chat-msg-time">${m.createdAt?.toDate?.().toLocaleString()||''}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // ==================== SEND MESSAGES ====================
  async sendWhatsApp() {
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
      const d = await res.json();
      if (res.ok) {
        await db.collection('messages').add({ to: phone, from: cfg.phoneNumberId, body: msg, type: 'outgoing', createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        document.getElementById('chatResult').innerHTML = '<span class="text-success">✅ Sent!</span>';
        this.render();
      } else {
        document.getElementById('chatResult').innerHTML = `<span class="text-danger">❌ ${d.error?.message||'Failed'}</span>`;
      }
    } catch(e) { document.getElementById('chatResult').innerHTML = `<span class="text-danger">❌ ${e.message}</span>`; }
  },

  async sendSocial(platform) {
    const to = document.getElementById('socialTo')?.value?.trim();
    const msg = document.getElementById('socialMessage')?.value?.trim();
    if (!msg) return alert('Type a message!');

    await db.collection('socialMessages').add({
      platform, from: 'You', to: to || 'User', body: msg, type: 'outgoing',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    document.getElementById('socialResult').innerHTML = '<span class="text-success">✅ Sent!</span>';
    setTimeout(() => this.render(), 500);
  },

  // ==================== AI AUTO-REPLY TEST ====================
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
          body: JSON.stringify({
            model: ai.model || 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: msg }],
            max_tokens: 150
          })
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
    // Cleanup old listeners
    Object.values(this.realtimeListeners).forEach(fn => fn());
    this.realtimeListeners = {};

    if (platform === 'whatsapp') {
      this.realtimeListeners.whatsapp = db.collection('messages').orderBy('createdAt', 'desc').limit(100).onSnapshot(async snap => {
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
  },

  async refreshFromMeta() {
    const cfg = (await db.collection('settings').doc('whatsapp').get()).data();
    if (!cfg?.accessToken) return alert('Not configured!');
    let added = 0;
    try {
      const cr = await fetch('https://graph.facebook.com/v22.0/342856675576986/conversations?limit=10', { headers: { 'Authorization': `Bearer ${cfg.accessToken}` } });
      const cd = await cr.json();
      if (cd.data) {
        for (const c of cd.data) {
          const mr = await fetch(`https://graph.facebook.com/v22.0/${c.id}/messages?limit=20`, { headers: { 'Authorization': `Bearer ${cfg.accessToken}` } });
          const md = await mr.json();
          if (md.data) {
            for (const m of md.data) {
              const ex = await db.collection('messages').where('waMessageId', '==', m.id).get();
              if (ex.empty) {
                await db.collection('messages').add({
                  from: m.from, to: m.to, body: m.text?.body || '(media)',
                  type: m.from === cfg.phoneNumberId ? 'outgoing' : 'incoming',
                  waMessageId: m.id,
                  createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                added++;
              }
            }
          }
        }
      }
      alert(`✅ ${added} new messages synced!`);
      this.render();
    } catch(e) { alert('Error: ' + e.message); }
  }
};
