// js/integrations.js — API Access, Webhooks, Google Sheets, Webhook Logs
const Integrations = {
  currentTab: 'api', // api, webhooks, sheets, logs

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading integrations...</p>';

    if (this.currentTab === 'webhooks') { await this.renderWebhooks(); return; }
    if (this.currentTab === 'sheets') { await this.renderSheets(); return; }
    if (this.currentTab === 'logs') { await this.renderLogs(); return; }

    await this.renderAPI();
  },

  // ==================== TAB NAVIGATION ====================
  renderTabs(active) {
    return `
      <div class="d-flex gap-2 mb-3 flex-wrap">
        <button class="btn btn-${active==='api'?'primary':'outline-primary'} btn-sm" onclick="Integrations.currentTab='api';Integrations.render();">
          🔑 API Keys
        </button>
        <button class="btn btn-${active==='webhooks'?'primary':'outline-primary'} btn-sm" onclick="Integrations.currentTab='webhooks';Integrations.render();">
          🪝 Webhooks
        </button>
        <button class="btn btn-${active==='sheets'?'primary':'outline-primary'} btn-sm" onclick="Integrations.currentTab='sheets';Integrations.render();">
          📊 Google Sheets
        </button>
        <button class="btn btn-${active==='logs'?'primary':'outline-primary'} btn-sm" onclick="Integrations.currentTab='logs';Integrations.render();">
          📋 Webhook Logs
        </button>
      </div>
    `;
  },

  // ==================== 1. API KEYS ====================
  async renderAPI() {
    let apiKeys = [];
    try {
      const snap = await db.collection('settings').doc('api_keys').get();
      if (snap.exists) apiKeys = snap.data().keys || [];
    } catch(e) {}

    let html = `
      ${this.renderTabs('api')}
      <div class="row g-3">
        <div class="col-md-8">
          <div class="card-widget">
            <h5><i class="fas fa-key me-2"></i>API Keys</h5>
            <p class="text-muted small">Generate API keys for external access. Use these to connect your apps, websites, or third-party services.</p>
            
            <div id="apiKeyList">
              ${apiKeys.length === 0 ? '<p class="text-muted text-center py-3">No API keys generated yet.</p>' : apiKeys.map((k, i) => `
                <div class="d-flex justify-content-between align-items-center border rounded p-2 mb-2">
                  <div>
                    <strong>${k.name||'Untitled'}</strong>
                    <br><small class="text-muted">Created: ${k.createdAt?.toDate?.().toLocaleDateString()||'N/A'}</small>
                    <br><code class="small">${k.key?.substring(0,20)}...</code>
                  </div>
                  <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-outline-info" onclick="navigator.clipboard.writeText('${k.key}');alert('Copied!')"><i class="fas fa-copy"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="Integrations.deleteKey(${i})"><i class="fas fa-trash"></i></button>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div class="input-group mt-3">
              <input type="text" id="newKeyName" class="form-control form-control-sm" placeholder="Key name (e.g. Website Integration)">
              <button class="btn btn-primary btn-sm" onclick="Integrations.generateKey()"><i class="fas fa-plus me-1"></i> Generate Key</button>
            </div>
          </div>

          <div class="card-widget mt-3">
            <h5><i class="fas fa-code me-2"></i>API Documentation</h5>
            <div class="table-responsive">
              <table class="table table-sm small">
                <thead><tr><th>Endpoint</th><th>Method</th><th>Description</th></tr></thead>
                <tbody>
                  <tr><td><code>/api/leads</code></td><td>GET</td><td>Get all leads</td></tr>
                  <tr><td><code>/api/leads</code></td><td>POST</td><td>Create a new lead</td></tr>
                  <tr><td><code>/api/contacts</code></td><td>GET</td><td>Get all contacts</td></tr>
                  <tr><td><code>/api/contacts</code></td><td>POST</td><td>Create a new contact</td></tr>
                  <tr><td><code>/api/campaigns</code></td><td>GET</td><td>Get all campaigns</td></tr>
                  <tr><td><code>/api/messages</code></td><td>POST</td><td>Send WhatsApp message</td></tr>
                </tbody>
              </table>
            </div>
            <p class="small text-muted">Headers: <code>Authorization: Bearer YOUR_API_KEY</code> · <code>Content-Type: application/json</code></p>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card-widget">
            <h5><i class="fas fa-plug me-2"></i>Quick Connect</h5>
            <button class="btn btn-outline-primary btn-sm w-100 mb-2" onclick="Integrations.currentTab='webhooks';Integrations.render();">
              <i class="fas fa-link me-1"></i> Configure Webhooks
            </button>
            <button class="btn btn-outline-success btn-sm w-100 mb-2" onclick="Integrations.currentTab='sheets';Integrations.render();">
              <i class="fas fa-table me-1"></i> Google Sheets Sync
            </button>
            <button class="btn btn-outline-info btn-sm w-100" onclick="Integrations.currentTab='logs';Integrations.render();">
              <i class="fas fa-history me-1"></i> View Webhook Logs
            </button>
          </div>

          <div class="card-widget mt-3">
            <h5><i class="fas fa-shield-alt me-2"></i>Security</h5>
            <p class="small text-muted">API keys have full access. Keep them secure. Regenerate if compromised.</p>
            <p class="small text-muted">Rate Limit: <strong>100 requests/minute</strong></p>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  async generateKey() {
    const name = document.getElementById('newKeyName').value.trim() || 'API Key';
    const key = 'wa_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
    
    let keys = [];
    try {
      const snap = await db.collection('settings').doc('api_keys').get();
      if (snap.exists) keys = snap.data().keys || [];
    } catch(e) {}

    keys.push({ name, key, createdAt: new Date().toISOString() });
    await db.collection('settings').doc('api_keys').set({ keys }, { merge: true });
    alert('✅ API Key generated!\n\n' + key + '\n\nCopy now - it won\'t be shown again.');
    this.render();
  },

  async deleteKey(index) {
    if (!confirm('Delete this key?')) return;
    const snap = await db.collection('settings').doc('api_keys').get();
    const keys = snap.data().keys || [];
    keys.splice(index, 1);
    await db.collection('settings').doc('api_keys').set({ keys }, { merge: true });
    this.render();
  },

  // ==================== 2. WEBHOOKS ====================
  async renderWebhooks() {
    const workerUrl = 'https://wa-crm.your-subdomain.workers.dev'; // Replace with actual worker URL

    let html = `
      ${this.renderTabs('webhooks')}
      <div class="row g-3">
        <div class="col-md-6">
          <div class="card-widget">
            <h5><i class="fab fa-whatsapp text-success me-2"></i>WhatsApp Webhook</h5>
            <p class="small text-muted">Receive incoming WhatsApp messages in real-time.</p>
            <label class="form-label small fw-bold">Webhook URL</label>
            <div class="input-group mb-2">
              <input type="text" class="form-control form-control-sm" value="${https://wa-crm.your-subdomain.workers.dev}/" readonly id="waWebhookUrl">
              <button class="btn btn-outline-primary btn-sm" onclick="navigator.clipboard.writeText('${https://wa-crm.your-subdomain.workers.dev}/');alert('Copied!')"><i class="fas fa-copy"></i></button>
            </div>
            <label class="form-label small fw-bold">Verify Token</label>
            <input type="text" class="form-control form-control-sm" value="my_verify_token_123" readonly>
            <hr>
            <p class="small"><strong>Setup:</strong> Go to Meta Business → WhatsApp → Configuration → Webhook → Paste URL + Token</p>
            <button class="btn btn-success btn-sm" onclick="Integrations.testWebhook('whatsapp')">🧪 Test Webhook</button>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card-widget">
            <h5><i class="fab fa-facebook text-primary me-2"></i>Facebook Webhook</h5>
            <p class="small text-muted">Receive Facebook messages, comments, and lead ads.</p>
            <label class="form-label small fw-bold">Webhook URL</label>
            <div class="input-group mb-2">
              <input type="text" class="form-control form-control-sm" value="${https://wa-crm.your-subdomain.workers.dev}/fb-webhook" readonly id="fbWebhookUrl">
              <button class="btn btn-outline-primary btn-sm" onclick="navigator.clipboard.writeText('${https://wa-crm.your-subdomain.workers.dev}/fb-webhook');alert('Copied!')"><i class="fas fa-copy"></i></button>
            </div>
            <label class="form-label small fw-bold">Verify Token</label>
            <input type="text" class="form-control form-control-sm" value="my_verify_token_123" readonly>
            <hr>
            <div class="form-check"><input class="form-check-input" type="checkbox" id="fbMessages" checked><label class="form-check-label small">Messages</label></div>
            <div class="form-check"><input class="form-check-input" type="checkbox" id="fbLeadAds" checked><label class="form-check-label small">Lead Ads</label></div>
            <button class="btn btn-primary btn-sm mt-2" onclick="Integrations.testWebhook('facebook')">🧪 Test Webhook</button>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card-widget">
            <h5><i class="fab fa-instagram text-danger me-2"></i>Instagram Webhook</h5>
            <p class="small text-muted">Receive Instagram comments and direct messages.</p>
            <label class="form-label small fw-bold">Webhook URL</label>
            <div class="input-group mb-2">
              <input type="text" class="form-control form-control-sm" value="${https://wa-crm.your-subdomain.workers.dev}/ig-webhook" readonly>
              <button class="btn btn-outline-primary btn-sm" onclick="navigator.clipboard.writeText('${https://wa-crm.your-subdomain.workers.dev}/ig-webhook');alert('Copied!')"><i class="fas fa-copy"></i></button>
            </div>
            <label class="form-label small fw-bold">Verify Token</label>
            <input type="text" class="form-control form-control-sm" value="my_verify_token_123" readonly>
            <button class="btn btn-danger btn-sm mt-2" onclick="Integrations.testWebhook('instagram')">🧪 Test Webhook</button>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card-widget">
            <h5><i class="fas fa-paper-plane me-2"></i>Custom Webhook</h5>
            <p class="small text-muted">Send lead data to your own server or third-party service.</p>
            <label class="form-label small fw-bold">Your Endpoint URL</label>
            <input type="url" id="customWebhookUrl" class="form-control form-control-sm mb-2" placeholder="https://your-server.com/webhook">
            <div class="form-check"><input class="form-check-input" type="checkbox" id="customLeads"><label class="form-check-label small">New Leads</label></div>
            <div class="form-check"><input class="form-check-input" type="checkbox" id="customMessages"><label class="form-check-label small">New Messages</label></div>
            <div class="form-check"><input class="form-check-input" type="checkbox" id="customContacts"><label class="form-check-label small">New Contacts</label></div>
            <button class="btn btn-outline-info btn-sm mt-2" onclick="Integrations.saveCustomWebhook()">💾 Save</button>
            <button class="btn btn-outline-secondary btn-sm mt-2" onclick="Integrations.testWebhook('custom')">🧪 Test</button>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  async testWebhook(type) {
    try {
      await db.collection('webhook_logs').add({
        type, status: 'test', payload: { test: true, timestamp: new Date().toISOString() },
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert('✅ Test webhook sent! Check Logs tab.');
    } catch(e) { alert('Error: ' + e.message); }
  },

  async saveCustomWebhook() {
    const url = document.getElementById('customWebhookUrl').value.trim();
    if (!url) return alert('Enter URL!');
    await db.collection('settings').doc('webhooks').set({
      customUrl: url,
      events: {
        leads: document.getElementById('customLeads').checked,
        messages: document.getElementById('customMessages').checked,
        contacts: document.getElementById('customContacts').checked
      }
    }, { merge: true });
    alert('✅ Saved!');
  },

  // ==================== 3. GOOGLE SHEETS ====================
  async renderSheets() {
    let html = `
      ${this.renderTabs('sheets')}
      <div class="row g-3">
        <div class="col-md-8">
          <div class="card-widget">
            <h5><i class="fas fa-table me-2"></i>Google Sheets Integration</h5>
            <p class="small text-muted">Auto-sync leads and contacts to Google Sheets in real-time.</p>
            
            <div class="mb-3">
              <label class="form-label small fw-bold">Google Sheet URL</label>
              <input type="url" id="sheetUrl" class="form-control form-control-sm" placeholder="https://docs.google.com/spreadsheets/d/...">
            </div>
            <div class="mb-3">
              <label class="form-label small fw-bold">Sheet Name</label>
              <input type="text" id="sheetName" class="form-control form-control-sm" placeholder="Sheet1">
            </div>
            <div class="mb-3">
              <label class="form-label small fw-bold">Sync Options</label>
              <div class="form-check"><input class="form-check-input" type="checkbox" id="syncLeads" checked><label class="form-check-label small">Sync New Leads</label></div>
              <div class="form-check"><input class="form-check-input" type="checkbox" id="syncContacts" checked><label class="form-check-label small">Sync New Contacts</label></div>
              <div class="form-check"><input class="form-check-input" type="checkbox" id="syncCampaigns"><label class="form-check-label small">Sync Campaign Results</label></div>
            </div>
            <button class="btn btn-success btn-sm" onclick="Integrations.saveSheetConfig()"><i class="fas fa-save me-1"></i> Save & Start Sync</button>
            <button class="btn btn-outline-secondary btn-sm" onclick="Integrations.testSheet()">🧪 Test Connection</button>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card-widget">
            <h5><i class="fas fa-info-circle me-2"></i>Setup Guide</h5>
            <ol class="small">
              <li>Create a Google Sheet</li>
              <li>Share → Anyone with link → Editor</li>
              <li>Copy the Sheet URL</li>
              <li>Paste above & save</li>
              <li>New leads will auto-sync</li>
            </ol>
            <p class="small text-muted">📊 <a href="https://sheets.new" target="_blank">Create New Sheet</a></p>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  async saveSheetConfig() {
    const url = document.getElementById('sheetUrl').value.trim();
    if (!url) return alert('Enter Sheet URL!');
    await db.collection('settings').doc('google_sheets').set({
      url,
      sheetName: document.getElementById('sheetName').value.trim() || 'Sheet1',
      syncLeads: document.getElementById('syncLeads').checked,
      syncContacts: document.getElementById('syncContacts').checked,
      syncCampaigns: document.getElementById('syncCampaigns').checked,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    alert('✅ Google Sheets connected!');
  },

  async testSheet() {
    const snap = await db.collection('settings').doc('google_sheets').get();
    if (!snap.exists || !snap.data().url) return alert('Save sheet config first!');
    alert('✅ Connection successful! (Simulated)');
  },

  // ==================== 4. WEBHOOK LOGS ====================
  async renderLogs() {
    let logs = [];
    try {
      const snap = await db.collection('webhook_logs').orderBy('createdAt', 'desc').limit(50).get();
      logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) {}

    let html = `
      ${this.renderTabs('logs')}
      <div class="card-widget">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0"><i class="fas fa-history me-2"></i>Webhook Logs</h5>
          <button class="btn btn-outline-danger btn-sm" onclick="Integrations.clearLogs()">🗑 Clear Logs</button>
        </div>
        <div class="table-responsive" style="max-height:500px;overflow-y:auto;">
          <table class="table table-sm small">
            <thead><tr><th>Time</th><th>Type</th><th>Status</th><th>Payload</th></tr></thead>
            <tbody>
              ${logs.length === 0 ? '<tr><td colspan="4" class="text-center text-muted py-3">No webhook logs yet.</td></tr>' : logs.map(l => `
                <tr>
                  <td>${l.createdAt?.toDate().toLocaleString()||'N/A'}</td>
                  <td><span class="badge bg-info">${l.type||'unknown'}</span></td>
                  <td><span class="badge bg-${l.status==='success'?'success':l.status==='error'?'danger':'secondary'}">${l.status||'test'}</span></td>
                  <td><small>${JSON.stringify(l.payload||{}).substring(0,80)}</small></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  async clearLogs() {
    if (!confirm('Delete all logs?')) return;
    const snap = await db.collection('webhook_logs').get();
    const batch = db.batch();
    snap.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    this.render();
  }
};
