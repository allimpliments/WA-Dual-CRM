const Chats = {
  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading chats...</p>';

    let messages = [];
    try {
      const snap = await db.collection('messages').orderBy('createdAt', 'desc').limit(50).get();
      messages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error('Error loading messages:', err);
    }

    let html = `
      <div class="row g-3">
        <div class="col-md-4">
          <div class="card-widget">
            <h5><i class="fab fa-whatsapp text-success me-2"></i>Send Message</h5>
            <div class="mb-3">
              <label class="form-label">Phone Number</label>
              <input type="text" id="chatPhone" class="form-control form-control-sm" placeholder="919810012345">
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
            <h5><i class="fas fa-history text-primary me-2"></i>Message History</h5>
            <div style="max-height: 400px; overflow-y: auto;">
              ${messages.length === 0
                ? '<p class="text-center text-muted py-4">No messages yet.</p>'
                : messages.map(msg => `
                  <div class="d-flex justify-content-between align-items-start mb-2 p-2 border rounded">
                    <div>
                      <strong>${msg.to || '-'}</strong>
                      <p class="mb-0 text-muted small">${msg.body || '(template message)'}</p>
                    </div>
                    <div class="text-end">
                      <span class="badge bg-success">outgoing</span>
                      <br><small class="text-muted">${msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleString() : '-'}</small>
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
  },

  async sendMessage() {
    const phone = document.getElementById('chatPhone').value.trim();
    const message = document.getElementById('chatMessage').value.trim();

    if (!phone) return alert('Please enter a phone number!');
    if (!message) return alert('Please enter a message!');

    let config = {};
    try {
      const doc = await db.collection('settings').doc('whatsapp').get();
      if (doc.exists) config = doc.data();
    } catch (err) {
      console.error('Config error:', err);
    }

    if (!config.phoneNumberId || !config.accessToken) {
      return alert('WhatsApp not configured. Please setup first.');
    }

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
          body: message,
          type: 'outgoing',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        document.getElementById('chatResult').innerHTML = '<span class="text-success">✅ Sent successfully!</span>';
        setTimeout(() => { Chats.render(); }, 1000);
      } else {
        document.getElementById('chatResult').innerHTML = '<span class="text-danger">❌ ' + (result.error?.message || 'Failed') + '</span>';
      }
    } catch (err) {
      document.getElementById('chatResult').innerHTML = '<span class="text-danger">❌ ' + err.message + '</span>';
    }
  }
};
