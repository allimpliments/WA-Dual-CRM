const Chats = {
  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading chats...</p>';

    let messages = [];
    try {
      const snap = await db.collection('messages').orderBy('createdAt', 'desc').limit(100).get();
      messages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error('Error loading messages:', err);
    }

    let html = `
      <div class="row g-3">
        <!-- Send Message Panel -->
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

        <!-- Message History Panel -->
        <div class="col-md-8">
          <div class="card-widget">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="mb-0"><i class="fas fa-history text-primary me-2"></i>Message History</h5>
              <div>
                <span class="badge bg-success me-2" id="webhookStatus">Webhook Active</span>
                <button class="btn btn-outline-primary btn-sm" onclick="Chats.refreshFromMeta()">
                  <i class="fas fa-sync-alt me-1"></i> Refresh
                </button>
              </div>
            </div>

            <!-- Webhook Info -->
            <div class="alert alert-success py-2 px-3 small mb-2">
              <i class="fas fa-check-circle me-1"></i> Webhook is active. Incoming messages appear automatically every 10 seconds.
            </div>

            <!-- Search Filter -->
            <div class="mb-2">
              <input type="text" id="chatSearch" class="form-control form-control-sm" placeholder="Search messages..." oninput="Chats.filterMessages()">
            </div>

            <!-- Message List -->
            <div style="max-height: 450px; overflow-y: auto;" id="messageList">
              ${messages.length === 0
                ? '<p class="text-center text-muted py-4">No messages yet. Send your first WhatsApp message!</p>'
                : messages.map(msg => `
                  <div class="d-flex mb-2 p-2 border rounded message-row ${msg.type === 'incoming' ? 'bg-light' : ''}">
                    <div class="me-2">
                      <i class="fas fa-arrow-${msg.type === 'incoming' ? 'down text-info' : 'up text-success'}"></i>
                    </div>
                    <div class="flex-grow-1">
                      <div class="d-flex justify-content-between">
                        <strong>${msg.from || msg.to || '-'}</strong>
                        <small class="text-muted">${msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleString() : '-'}</small>
                      </div>
                      <p class="mb-0 small message-body">${msg.body || '(media)'}</p>
                      <div class="mt-1">
                        <span class="badge bg-${msg.type === 'incoming' ? 'info' : 'success'}">${msg.type || 'outgoing'}</span>
                        ${msg.waMessageId ? `<small class="text-muted ms-1">ID: ${msg.waMessageId.substring(0,12)}...</small>` : ''}
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

    // Auto-refresh every 10 seconds
    if (window._chatInterval) clearInterval(window._chatInterval);
    window._chatInterval = setInterval(() => {
      const title = document.getElementById('currentSectionTitle');
      if (title && title.textContent === 'All Chats') {
        Chats.refreshMessages();
      }
    }, 10000);
  },

  // Silent refresh (no loading spinner)
  async refreshMessages() {
    try {
      const snap = await db.collection('messages').orderBy('createdAt', 'desc').limit(100).get();
      const messages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const list = document.getElementById('messageList');
      if (!list) return;

      list.innerHTML = messages.length === 0
        ? '<p class="text-center text-muted py-4">No messages yet.</p>'
        : messages.map(msg => `
          <div class="d-flex mb-2 p-2 border rounded message-row ${msg.type === 'incoming' ? 'bg-light' : ''}">
            <div class="me-2">
              <i class="fas fa-arrow-${msg.type === 'incoming' ? 'down text-info' : 'up text-success'}"></i>
            </div>
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between">
                <strong>${msg.from || msg.to || '-'}</strong>
                <small class="text-muted">${msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleString() : '-'}</small>
              </div>
              <p class="mb-0 small message-body">${msg.body || '(media)'}</p>
              <div class="mt-1">
                <span class="badge bg-${msg.type === 'incoming' ? 'info' : 'success'}">${msg.type || 'outgoing'}</span>
              </div>
            </div>
          </div>
        `).join('');
    } catch (e) { /* silent */ }
  },

  // Search filter
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
      const payload = {
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: message }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + config.accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.messages) {
        await db.collection('messages').add({
          to: phone,
          from: config.phoneNumberId,
          body: message,
          type: 'outgoing',
          waMessageId: result.messages[0]?.id || '',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        document.getElementById('chatResult').innerHTML = '<span class="text-success">✅ Sent!</span>';
        setTimeout(() => { Chats.render(); }, 500);
      } else {
        document.getElementById('chatResult').innerHTML = '<span class="text-danger">❌ ' + (result.error?.message || 'Failed') + '</span>';
      }
    } catch (err) {
      document.getElementById('chatResult').innerHTML = '<span class="text-danger">❌ ' + err.message + '</span>';
    }
  },

  async refreshFromMeta() {
    const cfg = (await db.collection('settings').doc('whatsapp').get()).data();
    if (!cfg?.accessToken || !cfg?.phoneNumberId) return alert('WhatsApp not configured.');

    contentArea.innerHTML = '<p class="text-center py-5">Refreshing from WhatsApp...</p>';

    let added = 0;
    try {
      // Fetch recent messages from phone number
      const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.phoneNumberId}/messages?limit=50`, {
        headers: { 'Authorization': 'Bearer ' + cfg.accessToken }
      });
      const data = await res.json();

      if (data.data) {
        for (const msg of data.data) {
          const existing = await db.collection('messages').where('waMessageId', '==', msg.id).get();
          if (existing.empty) {
            await db.collection('messages').add({
              from: msg.from,
              to: msg.to,
              body: msg.text?.body || '(media/template)',
              type: msg.from === cfg.phoneNumberId ? 'outgoing' : 'incoming',
              waMessageId: msg.id,
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            added++;
          }
        }
      }
      alert(`✅ Refreshed! ${added} new messages added.`);
      this.render();
    } catch (err) {
      alert('Error: ' + err.message);
      this.render();
    }
  },

  async checkIncoming() {
    const cfg = (await db.collection('settings').doc('whatsapp').get()).data();
    if (!cfg?.accessToken) return alert('WhatsApp not configured.');

    contentArea.innerHTML = '<p class="text-center py-5">Checking incoming messages...</p>';

    let added = 0;
    try {
      const wabaId = '342856675576986';
      // Try conversations endpoint
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
                    from: msg.from,
                    to: msg.to,
                    body: msg.text?.body || '(media)',
                    type: msg.from === cfg.phoneNumberId ? 'outgoing' : 'incoming',
                    waMessageId: msg.id,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                  });
                  added++;
                }
              }
            }
          } catch (e) { /* skip failed conversations */ }
        }
      }
      alert(`✅ Check complete! ${added} new messages found.`);
      this.render();
    } catch (err) {
      alert('Error: ' + err.message);
      this.render();
    }
  }
};
