const Chats = {
  contactCache: {},

  async getContactName(number) {
    if (!number || number === 'unknown' || number === '342354115627791') return null;
    if (this.contactCache[number]) return this.contactCache[number];

    try {
      const clean = number.replace(/\+/g, '');
      const snap = await db.collection('contacts')
        .where('mobile', '==', clean).limit(1).get();
      if (!snap.empty) {
        const c = snap.docs[0].data();
        const name = `${c.firstName || ''} ${c.lastName || ''}`.trim();
        this.contactCache[number] = name || number;
        return this.contactCache[number];
      }
    } catch(e) {}

    try {
      const clean = number.replace(/\+/g, '');
      const snap = await db.collection('leads')
        .where('phone', '==', clean).limit(1).get();
      if (!snap.empty) {
        const name = snap.docs[0].data().name;
        this.contactCache[number] = name || number;
        return this.contactCache[number];
      }
    } catch(e) {}

    this.contactCache[number] = number;
    return number;
  },

  isSystemMessage(msg) {
    const body = (msg.body || '').toLowerCase();
    if (body.includes('key advantages of being a meta verified')) return true;
    if (body.includes('tech provider')) return true;
    if (!msg.from || msg.from === 'unknown') return true;
    if (msg.from === '342354115627791' && msg.type === 'incoming') return true;
    return false;
  },

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading chats...</p>';

    let messages = [];
    try {
      const snap = await db.collection('messages').orderBy('createdAt', 'desc').limit(100).get();
      messages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Preload contact names
      for (const msg of messages) {
        if (msg.from && msg.from !== 'unknown' && msg.from !== '342354115627791') {
          await this.getContactName(msg.from);
        }
        if (msg.to && msg.to !== '342354115627791') {
          await this.getContactName(msg.to);
        }
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }

    const displayMessages = messages.filter(msg => !this.isSystemMessage(msg));

    let html = `
      <div class="row g-3">
        <div class="col-md-4">
          <div class="card-widget">
            <h5><i class="fab fa-whatsapp text-success me-2"></i>Send Message</h5>
            <div class="mb-3">
              <label class="form-label">Phone Number</label>
              <input type="text" id="chatPhone" class="form-control form-control-sm" placeholder="+919810012345">
            </div>
            <div class="mb-3">
              <label class="form-label">Message</label>
              <textarea id="chatMessage" class="form-control form-control-sm" rows="3" placeholder="Type your message..."></textarea>
            </div>
            <button class="btn btn-success btn-sm w-100" onclick="Chats.sendMessage()">
              <i class="fab fa-whatsapp me-1"></i> Send Message
            </button>
            <div id="chatResult" class="mt-2"></div>
          </div>
        </div>

        <div class="col-md-8">
          <div class="card-widget">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="mb-0"><i class="fas fa-history text-primary me-2"></i>Message History</h5>
              <div>
                <span class="badge bg-success me-2">Real-time</span>
                <button class="btn btn-outline-primary btn-sm" onclick="Chats.refreshFromMeta()">
                  <i class="fas fa-sync-alt me-1"></i> Refresh
                </button>
              </div>
            </div>

            <div class="mb-2">
              <input type="text" id="chatSearch" class="form-control form-control-sm" placeholder="Search messages..." oninput="Chats.filterMessages()">
            </div>

            <div style="max-height: 450px; overflow-y: auto;" id="messageList">
              ${displayMessages.length === 0
                ? '<p class="text-center text-muted py-4">No messages yet.</p>'
                : displayMessages.map(msg => `
                  <div class="d-flex mb-2 p-2 border rounded message-row ${msg.type === 'incoming' ? 'bg-light' : ''}">
                    <div class="me-2">
                      <i class="fas fa-arrow-${msg.type === 'incoming' ? 'down text-info' : 'up text-success'}"></i>
                    </div>
                    <div class="flex-grow-1">
                      <div class="d-flex justify-content-between">
                        <strong>${msg.type === 'incoming' ? (Chats.contactCache[msg.from] || msg.from || 'Unknown') : (Chats.contactCache[msg.to] || msg.to || 'Unknown')}</strong>
                        <small class="text-muted">${msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleString() : '-'}</small>
                      </div>
                      <p class="mb-0 small message-body">${msg.body || '(media)'}</p>
                      <div class="mt-1">
                        <span class="badge bg-${msg.type === 'incoming' ? 'info' : 'success'}">${msg.type || 'outgoing'}</span>
                        <small class="text-muted ms-1">${msg.type === 'incoming' ? msg.from : msg.to}</small>
                      </div>
                    </div>
                  </div>
                `).join('')
              }
            </div>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;

    // Real-time listener
    if (window._chatUnsubscribe) window._chatUnsubscribe();
    window._chatUnsubscribe = db.collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .onSnapshot(async snap => {
        const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        for (const msg of msgs) {
          if (msg.from && msg.from !== 'unknown') await Chats.getContactName(msg.from);
          if (msg.to && msg.to !== '342354115627791') await Chats.getContactName(msg.to);
        }
        const filtered = msgs.filter(msg => !Chats.isSystemMessage(msg));
        const list = document.getElementById('messageList');
        if (!list) return;
        list.innerHTML = filtered.length === 0
          ? '<p class="text-center text-muted py-4">No messages yet.</p>'
          : filtered.map(msg => `
            <div class="d-flex mb-2 p-2 border rounded message-row ${msg.type === 'incoming' ? 'bg-light' : ''}">
              <div class="me-2">
                <i class="fas fa-arrow-${msg.type === 'incoming' ? 'down text-info' : 'up text-success'}"></i>
              </div>
              <div class="flex-grow-1">
                <div class="d-flex justify-content-between">
                  <strong>${msg.type === 'incoming' ? (Chats.contactCache[msg.from] || msg.from || 'Unknown') : (Chats.contactCache[msg.to] || msg.to || 'Unknown')}</strong>
                  <small class="text-muted">${msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleString() : '-'}</small>
                </div>
                <p class="mb-0 small message-body">${msg.body || '(media)'}</p>
                <span class="badge bg-${msg.type === 'incoming' ? 'info' : 'success'}">${msg.type || 'outgoing'}</span>
                <small class="text-muted ms-1">${msg.type === 'incoming' ? msg.from : msg.to}</small>
              </div>
            </div>
          `).join('');
      });
  },

  filterMessages() {
    const search = document.getElementById('chatSearch')?.value?.toLowerCase() || '';
    document.querySelectorAll('.message-row').forEach(row => {
      const body = row.querySelector('.message-body')?.textContent?.toLowerCase() || '';
      row.style.display = body.includes(search) ? '' : 'none';
    });
  },

  async sendMessage() {
    let phone = document.getElementById('chatPhone').value.trim();
    const message = document.getElementById('chatMessage').value.trim();

    if (!phone) return alert('Please enter a phone number!');
    if (!message) return alert('Please enter a message!');

    phone = phone.replace(/[^0-9+]/g, '');
    if (!phone.startsWith('+') && phone.length === 10) phone = '+91' + phone;
    if (phone.startsWith('91') && phone.length === 12) phone = '+' + phone;

    let config = {};
    try {
      const doc = await db.collection('settings').doc('whatsapp').get();
      if (doc.exists) config = doc.data();
    } catch (err) { console.error('Config error:', err); }

    if (!config.phoneNumberId || !config.accessToken) return alert('WhatsApp not configured.');

    document.getElementById('chatResult').innerHTML = '<span class="text-info">Sending...</span>';

    try {
      const url = 'https://graph.facebook.com/v22.0/' + config.phoneNumberId + '/messages';
      const payload = { messaging_product: 'whatsapp', to: phone, type: 'text', text: { body: message } };
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + config.accessToken, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (response.ok && result.messages) {
        await db.collection('messages').add({
          to: phone, from: config.phoneNumberId, body: message, type: 'outgoing',
          waMessageId: result.messages[0]?.id || '',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        document.getElementById('chatResult').innerHTML = '<span class="text-success">✅ Sent!</span>';
      } else {
        document.getElementById('chatResult').innerHTML = '<span class="text-danger">❌ ' + (result.error?.message || 'Failed') + '</span>';
      }
    } catch (err) {
      document.getElementById('chatResult').innerHTML = '<span class="text-danger">❌ ' + err.message + '</span>';
    }
  },

  async refreshFromMeta() {
    const cfg = (await db.collection('settings').doc('whatsapp').get()).data();
    if (!cfg?.accessToken) return alert('WhatsApp not configured.');
    contentArea.innerHTML = '<p class="text-center py-5">Refreshing...</p>';
    let added = 0;
    try {
      const wabaId = '342856675576986';
      const convRes = await fetch(`https://graph.facebook.com/v22.0/${wabaId}/conversations?limit=10`, {
        headers: { 'Authorization': 'Bearer ' + cfg.accessToken }
      });
      const convData = await convRes.json();
      if (convData.data) {
        for (const conv of convData.data) {
          try {
            const msgRes = await fetch(`https://graph.facebook.com/v22.0/${conv.id}/messages?limit=20`, {
              headers: { 'Authorization': 'Bearer ' + cfg.accessToken }
            });
            const msgData = await msgRes.json();
            if (msgData.data) {
              for (const msg of msgData.data) {
                const existing = await db.collection('messages').where('waMessageId', '==', msg.id).get();
                if (existing.empty) {
                  await db.collection('messages').add({
                    from: msg.from, to: msg.to, body: msg.text?.body || '(media)',
                    type: msg.from === cfg.phoneNumberId ? 'outgoing' : 'incoming',
                    waMessageId: msg.id,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                  });
                  added++;
                }
              }
            }
          } catch (e) {}
        }
      }
      alert(`✅ Refreshed! ${added} new messages.`);
      this.render();
    } catch (err) { alert('Error: ' + err.message); this.render(); }
  }
};
