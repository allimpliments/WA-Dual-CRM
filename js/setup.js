const Setup = {
  async render() {
    // Firestore से WhatsApp Config लोड करें (अगर सेव है तो)
    let config = {};
    try {
      const doc = await db.collection('settings').doc('whatsapp').get();
      if (doc.exists) config = doc.data();
    } catch (err) {}

    const phoneId = config.phoneNumberId || '';
    const token = config.accessToken || '';
    const configured = phoneId && token;

    const html = `
      <div class="row g-3">
        <div class="col-12">
          <div class="card-widget">
            <h4><i class="fab fa-whatsapp text-success me-2"></i>WhatsApp Cloud API Setup</h4>
            <p class="text-muted">Connect your official WhatsApp Business API to send and receive messages.</p>
            <div class="alert alert-${configured ? 'success' : 'warning'}">
              <strong>Status:</strong> ${configured ? 'Connected ✅' : 'Not Configured ⚠️'}
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card-widget">
            <h5>API Configuration</h5>
            <div class="mb-3">
              <label class="form-label">Phone Number ID</label>
              <input type="text" id="waPhoneId" class="form-control" value="${phoneId}" placeholder="342354115627791">
            </div>
            <div class="mb-3">
              <label class="form-label">Access Token</label>
              <input type="password" id="waToken" class="form-control" value="${token}" placeholder="EAA1O...">
            </div>
            <button class="btn btn-primary" onclick="Setup.saveWhatsAppConfig()">
              <i class="fas fa-save me-1"></i> Save Configuration
            </button>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card-widget">
            <h5>Send Test Message</h5>
            <p class="text-muted">Send a test WhatsApp message to verify your setup.</p>
            <div class="mb-3">
              <label class="form-label">Phone Number (with country code)</label>
              <input type="text" id="testPhone" class="form-control" placeholder="919810012345">
            </div>
            <button class="btn btn-success" onclick="Setup.sendTestMessage()" ${configured ? '' : 'disabled'}>
              <i class="fab fa-whatsapp me-1"></i> Send Test
            </button>
            <div id="testResult" class="mt-2"></div>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  async saveWhatsAppConfig() {
    const phoneNumberId = document.getElementById('waPhoneId').value.trim();
    const accessToken = document.getElementById('waToken').value.trim();

    if (!phoneNumberId || !accessToken) return alert('Please fill both fields!');

    try {
      await db.collection('settings').doc('whatsapp').set({
        phoneNumberId, accessToken,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert('WhatsApp configuration saved!');
      this.render();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  },

  async sendTestMessage() {
    const phone = document.getElementById('testPhone').value.trim();
    if (!phone) return alert('Please enter a phone number!');

    let config = {};
    try {
      const doc = await db.collection('settings').doc('whatsapp').get();
      if (doc.exists) config = doc.data();
    } catch (err) {}

    if (!config.phoneNumberId || !config.accessToken) {
      return alert('WhatsApp not configured. Please save settings first.');
    }

    document.getElementById('testResult').innerHTML = '<span class="text-info">Sending...</span>';

    try {
      const url = `https://graph.facebook.com/v22.0/${config.phoneNumberId}/messages`;
      const payload = {
        messaging_product: 'whatsapp',
        to: phone,
        type: 'template',
        template: {
          name: 'hello_world',
          language: { code: 'en_US' }
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        document.getElementById('testResult').innerHTML = '<span class="text-success">✅ Message sent successfully!</span>';
      } else {
        document.getElementById('testResult').innerHTML = `<span class="text-danger">❌ Error: ${result.error?.message || 'Unknown error'}</span>`;
      }
    } catch (err) {
      document.getElementById('testResult').innerHTML = `<span class="text-danger">❌ Error: ${err.message}</span>`;
    }
  }
};
