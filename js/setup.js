const Setup = {
  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading setup...</p>';

    let waConfig = {}, fbConfig = {}, igConfig = {};
    try {
      const waDoc = await db.collection('settings').doc('whatsapp').get();
      if (waDoc.exists) waConfig = waDoc.data();
      const fbDoc = await db.collection('settings').doc('facebook').get();
      if (fbDoc.exists) fbConfig = fbDoc.data();
      const igDoc = await db.collection('settings').doc('instagram').get();
      if (igDoc.exists) igConfig = igDoc.data();
    } catch (err) { console.error(err); }

    const waPhoneId = waConfig.phoneNumberId || '';
    const waToken = waConfig.accessToken || '';
    const waConfigured = waPhoneId && waToken;
    const fbConfigured = fbConfig.pageId && fbConfig.pageAccessToken;
    const igConfigured = igConfig.accountId && igConfig.accessToken;

    let html = `
      <!-- WhatsApp Cloud API Setup -->
      <div class="row g-3 mb-4">
        <div class="col-12">
          <div class="card-widget">
            <h4><i class="fab fa-whatsapp text-success me-2"></i>WhatsApp Cloud API Setup (Official)</h4>
            <p class="text-muted">Connect your official WhatsApp Business API to send and receive messages.</p>
            <div class="alert alert-${waConfigured ? 'success' : 'warning'}">
              <strong>Status:</strong> ${waConfigured ? 'Connected ✅' : 'Not Configured ⚠️'}
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card-widget">
            <h5>API Configuration</h5>
            <div class="mb-3">
              <label class="form-label">Phone Number ID</label>
              <input type="text" id="waPhoneId" class="form-control" value="${waPhoneId}" placeholder="342354115627791">
            </div>
            <div class="mb-3">
              <label class="form-label">Access Token</label>
              <input type="password" id="waToken" class="form-control" value="${waToken}" placeholder="EAA1O...">
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
            <button class="btn btn-success" onclick="Setup.sendTestMessage()" ${waConfigured ? '' : 'disabled'}>
              <i class="fab fa-whatsapp me-1"></i> Send Test
            </button>
            <div id="testResult" class="mt-2"></div>
          </div>
        </div>
      </div>

      <!-- WhatsApp Device Connect (QR Scan) -->
      <div class="row g-3 mb-4">
        <div class="col-12">
          <div class="card-widget">
            <h5><i class="fas fa-qrcode text-dark me-2"></i>WhatsApp Device Connect (QR Scan)</h5>
            <p class="text-muted">Optional: Connect your WhatsApp directly by QR or phone login.</p>
            <div class="alert alert-warning py-2 small">
              <strong>⚠️ Experimental:</strong> This method is unofficial and may risk account ban. Use only for internal team.
            </div>
            <div class="row g-2">
              <div class="col-md-6">
                <label class="form-label small fw-bold">Device Name</label>
                <input type="text" id="deviceName" class="form-control form-control-sm" placeholder="e.g. Sales Team Phone">
              </div>
              <div class="col-md-6 d-flex align-items-end">
                <button class="btn btn-dark btn-sm" onclick="Setup.connectDevice()">
                  <i class="fas fa-qrcode me-1"></i> Connect Device
                </button>
              </div>
            </div>
            <div id="qrCodeArea" class="mt-3 text-center" style="display:none;">
              <p class="small text-muted">Scan this QR code with your WhatsApp (Linked Devices)</p>
              <div id="qrCodeImage" style="background:#fff;padding:16px;display:inline-block;border-radius:12px;"></div>
              <p id="qrStatus" class="small text-info mt-2"></p>
            </div>
          </div>
        </div>
      </div>

      <!-- Facebook Setup -->
      <div class="row g-3 mb-4">
        <div class="col-12">
          <div class="card-widget">
            <h4><i class="fab fa-facebook text-primary me-2"></i>Facebook Setup</h4>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card-widget">
            <h5>Page Configuration</h5>
            <div class="mb-3">
              <label class="form-label">Facebook Page ID</label>
              <input type="text" id="fbPageId" class="form-control" value="${fbConfig.pageId || ''}" placeholder="Enter Page ID">
            </div>
            <div class="mb-3">
              <label class="form-label">Page Access Token</label>
              <input type="password" id="fbToken" class="form-control" value="${fbConfig.pageAccessToken || ''}" placeholder="EAA...">
            </div>
            <button class="btn btn-primary" onclick="Setup.saveConfig('facebook')">
              <i class="fas fa-save me-1"></i> Save Facebook
            </button>
            <span class="badge bg-${fbConfigured ? 'success' : 'warning'} ms-2">${fbConfigured ? 'Configured' : 'Not Configured'}</span>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card-widget">
            <h5>Connection Status</h5>
            ${fbConfigured ? `
              <div class="alert alert-success">✅ Facebook Page Connected</div>
              <p class="small text-muted">Page ID: ${fbConfig.pageId}</p>
              <p class="small text-muted">Use for: Messenger Chat & Post Publishing</p>
            ` : `
              <div class="alert alert-warning">⚠️ Not Configured</div>
              <p class="small text-muted">Enter your Page ID and Token to connect.</p>
            `}
          </div>
        </div>
      </div>

      <!-- Instagram Setup -->
      <div class="row g-3">
        <div class="col-12">
          <div class="card-widget">
            <h4><i class="fab fa-instagram text-danger me-2"></i>Instagram Setup</h4>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card-widget">
            <h5>Account Configuration</h5>
            <div class="mb-3">
              <label class="form-label">Instagram Business Account ID</label>
              <input type="text" id="igAccountId" class="form-control" value="${igConfig.accountId || ''}" placeholder="Enter Account ID">
            </div>
            <div class="mb-3">
              <label class="form-label">Access Token</label>
              <input type="password" id="igToken" class="form-control" value="${igConfig.accessToken || ''}" placeholder="EAA...">
            </div>
            <button class="btn btn-danger" onclick="Setup.saveConfig('instagram')">
              <i class="fas fa-save me-1"></i> Save Instagram
            </button>
            <span class="badge bg-${igConfigured ? 'success' : 'warning'} ms-2">${igConfigured ? 'Configured' : 'Not Configured'}</span>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card-widget">
            <h5>Connection Status</h5>
            ${igConfigured ? `
              <div class="alert alert-success">✅ Instagram Connected</div>
              <p class="small text-muted">Account ID: ${igConfig.accountId}</p>
              <p class="small text-muted">Use for: Direct Messages & Post Publishing</p>
            ` : `
              <div class="alert alert-warning">⚠️ Not Configured</div>
              <p class="small text-muted">Enter your Account ID and Token to connect.</p>
            `}
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
    } catch (err) { alert('Error: ' + err.message); }
  },

  async sendTestMessage() {
    const phone = document.getElementById('testPhone').value.trim();
    if (!phone) return alert('Please enter a phone number!');
    let config = {};
    try {
      const doc = await db.collection('settings').doc('whatsapp').get();
      if (doc.exists) config = doc.data();
    } catch (err) {}
    if (!config.phoneNumberId || !config.accessToken) return alert('WhatsApp not configured.');
    document.getElementById('testResult').innerHTML = '<span class="text-info">Sending...</span>';
    try {
      const url = `https://graph.facebook.com/v22.0/${config.phoneNumberId}/messages`;
      const payload = {
        messaging_product: 'whatsapp',
        to: phone,
        type: 'template',
        template: { name: 'hello_world', language: { code: 'en_US' } }
      };
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${config.accessToken}`, 'Content-Type': 'application/json' },
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
  },

  async saveConfig(platform) {
    if (platform === 'facebook') {
      const pageId = document.getElementById('fbPageId').value.trim();
      const pageAccessToken = document.getElementById('fbToken').value.trim();
      if (!pageId || !pageAccessToken) return alert('Both fields required!');
      await db.collection('settings').doc('facebook').set({ pageId, pageAccessToken, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
      alert('✅ Facebook saved!');
    } else if (platform === 'instagram') {
      const accountId = document.getElementById('igAccountId').value.trim();
      const accessToken = document.getElementById('igToken').value.trim();
      if (!accountId || !accessToken) return alert('Both fields required!');
      await db.collection('settings').doc('instagram').set({ accountId, accessToken, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
      alert('✅ Instagram saved!');
    }
    this.render();
  },

  async connectDevice() {
    const deviceName = document.getElementById('deviceName').value.trim() || 'CRM Device';
    document.getElementById('qrCodeArea').style.display = 'block';
    document.getElementById('qrStatus').innerText = 'Generating QR code...';
    document.getElementById('qrCodeImage').innerHTML = '<div class="spinner-border text-dark"></div>';
    
    try {
      const res = await fetch('https://cloudwa.11avatardigitalhub.cloud:3100/connect?device=' + encodeURIComponent(deviceName));
      const data = await res.json();
      if (data.qr) {
        document.getElementById('qrCodeImage').innerHTML = `<img src="${data.qr}" style="width:256px;height:256px;">`;
        document.getElementById('qrStatus').innerText = '📱 Scan with WhatsApp → Linked Devices → Link a Device';
      } else {
        document.getElementById('qrStatus').innerText = '❌ Failed to generate QR. Server may be offline.';
      }
    } catch (err) {
      document.getElementById('qrStatus').innerText = '⚠️ QR server not available. Use Cloud API instead.';
      document.getElementById('qrCodeImage').innerHTML = '';
    }
  }
};
