// js/chats.js — Unified Live Chat with clientId isolation
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
    ];

    let html = `
      <style>
        /* ... सारी स्टाइल जस की तस ... */
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
    try {
      let query = db.collection('messages');
      if (shouldFilterByClient()) query = query.where('clientId', '==', window.currentUser.clientId);
      const snap = await query.orderBy('createdAt', 'desc').limit(100).get();
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
          <!-- AI और Meta वाले सेक्शन जस के तस -->
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

  // Meta Inbox और Coming Soon सेक्शन – कोई बदलाव नहीं

  async sendWhatsApp() {
    // केवल प्लेटफ़ॉर्म एडमिन या जिनके पास WhatsApp सेटअप हो, भेज सकते हैं
    if (!window.currentUser || (window.currentUser.role !== 'platform_owner' && window.currentUser.role !== 'platform_super_admin')) {
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

  // AI टेस्ट और बाकी फंक्शन – कोई बदलाव नहीं

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
