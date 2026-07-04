// js/integrations.js — API Access, Webhooks, Google Sheets, Webhook Logs
const Integrations = {
  currentTab: 'api',

  // ✅ SINGLE PLACE — Apna Worker URL yahan daalo
  getWorkerUrl() {
    // Production URL — apna actual Cloudflare Worker URL daalo
    return 'https://wa-crm.11avatardigitalhub.workers.dev/';
  },

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading integrations...</p>';
    if (this.currentTab === 'webhooks') { await this.renderWebhooks(); return; }
    if (this.currentTab === 'sheets') { await this.renderSheets(); return; }
    if (this.currentTab === 'logs') { await this.renderLogs(); return; }
    await this.renderAPI();
  },

  renderTabs(active) {
    return `
      <div class="d-flex gap-2 mb-3 flex-wrap">
        <button class="btn btn-${active==='api'?'primary':'outline-primary'} btn-sm" onclick="Integrations.currentTab='api';Integrations.render();">🔑 API Keys</button>
        <button class="btn btn-${active==='webhooks'?'primary':'outline-primary'} btn-sm" onclick="Integrations.currentTab='webhooks';Integrations.render();">🪝 Webhooks</button>
        <button class="btn btn-${active==='sheets'?'primary':'outline-primary'} btn-sm" onclick="Integrations.currentTab='sheets';Integrations.render();">📊 Google Sheets</button>
        <button class="btn btn-${active==='logs'?'primary':'outline-primary'} btn-sm" onclick="Integrations.currentTab='logs';Integrations.render();">📋 Logs</button>
      </div>
    `;
  },

  // ==================== API KEYS ====================
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
            <p class="text-muted small">Generate API keys for external access.</p>
            <div id="apiKeyList">
              ${apiKeys.length === 0 ? '<p class="text-muted text-center py-3">No API keys yet.</p>' : apiKeys.map((k, i) => `
                <div class="d-flex justify-content-between align-items-center border rounded p-2 mb-2">
                  <div>
                    <strong>${k.name||'Untitled'}</strong>
                    <br><code class="small">${k.key?.substring(0,24)}...</code>
                  </div>
                  <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-outline-info" onclick="navigator.clipboard.writeText('${k.key}');alert('Copied!')"><i class="fas fa-copy"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="Integrations.deleteKey(${i})"><i class="fas fa-trash"></i></button>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="input-group mt-3">
              <input type="text" id="newKeyName" class="form-control form-control-sm" placeholder="Key name">
              <button class="btn btn-primary btn-sm" onclick="Integrations.generateKey()"><i class="fas fa-plus me-1"></i> Generate</button>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card-widget">
            <h5><i class="fas fa-plug me-2"></i>Quick Connect</h5>
            <button class="btn btn-outline-primary btn-sm w-100 mb-2" onclick="Integrations.currentTab='webhooks';Integrations.render();">🪝 Webhooks</button>
            <button class="btn btn-outline-success btn-sm w-100 mb-2" onclick="Integrations.currentTab='sheets';Integrations.render();">📊 Google Sheets</button>
            <button class="btn btn-outline-info btn-sm w-100" onclick="Integrations.currentTab='logs';Integrations.render();">📋 Logs</button>
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
    try { const snap = await db.collection('settings').doc('api_keys').get(); if (snap.exists) keys = snap.data().keys || []; } catch(e) {}
    keys.push({ name, key, createdAt: new Date().toISOString() });
    await db.collection('settings').doc('api_keys').set({ keys }, { merge: true });
    prompt('Copy your API key (shown only once):', key);
    this.render();
  },

  async deleteKey(index) {
    if (!confirm('Delete?')) return;
    const snap = await db.collection('settings').doc('api_keys').get();
    const keys = snap.data().keys || [];
    keys.splice(index, 1);
    await db.collection('settings').doc('api_keys').set({ keys }, { merge: true });
    this.render();
  },

  // ==================== WEBHOOKS ====================
  async renderWebhooks() {
    const W = this.getWorkerUrl();

    let html = `
      ${this.renderTabs('webhooks')}
      <div class="row g-3">
        <div class="col-md-6">
          <div class="card-widget">
            <h5><i class="fab fa-whatsapp text-success me-2"></i>WhatsApp Webhook</h5>
            <label class="form-label small fw-bold">Webhook URL</label>
            <div class="input-group mb-2"><input type="text" class="form-control form-control-sm" value="${W}/" readonly><button class="btn btn-outline-primary btn-sm" onclick="navigator.clipboard.writeText('${W}/');alert('Copied!')"><i class="fas fa-copy"></i></button></div>
            <label class="form-label small fw-bold">Verify Token</label>
            <input type="text" class="form-control form-control-sm" value="my_verify_token_123" readonly>
            <button class="btn btn-success btn-sm mt-2" onclick="Integrations.testWebhook('whatsapp')">🧪 Test</button>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card-widget">
            <h5><i class="fab fa-facebook text-primary me-2"></i>Facebook Webhook</h5>
            <label class="form-label small fw-bold">Webhook URL</label>
            <div class="input-group mb-2"><input type="text" class="form-control form-control-sm" value="${W}/fb-webhook" readonly><button class="btn btn-outline-primary btn-sm" onclick="navigator.clipboard.writeText('${W}/fb-webhook');alert('Copied!')"><i class="fas fa-copy"></i></button></div>
            <label class="form-label small fw-bold">Verify Token</label>
            <input type="text" class="form-control form-control-sm" value="my_verify_token_123" readonly>
            <button class="btn btn-primary btn-sm mt-2" onclick="Integrations.testWebhook('facebook')">🧪 Test</button>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card-widget">
            <h5><i class="fab fa-instagram text-danger me-2"></i>Instagram Webhook</h5>
            <label class="form-label small fw-bold">Webhook URL</label>
            <div class="input-group mb-2"><input type="text" class="form-control form-control-sm" value="${W}/ig-webhook" readonly><button class="btn btn-outline-primary btn-sm" onclick="navigator.clipboard.writeText('${W}/ig-webhook');alert('Copied!')"><i class="fas fa-copy"></i></button></div>
            <label class="form-label small fw-bold">Verify Token</label>
            <input type="text" class="form-control form-control-sm" value="my_verify_token_123" readonly>
            <button class="btn btn-danger btn-sm mt-2" onclick="Integrations.testWebhook('instagram')">🧪 Test</button>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card-widget">
            <h5><i class="fas fa-link me-2"></i>Lead Ads Webhook</h5>
            <label class="form-label small fw-bold">Webhook URL</label>
            <div class="input-group mb-2"><input type="text" class="form-control form-control-sm" value="${W}/fb-lead-webhook" readonly><button class="btn btn-outline-primary btn-sm" onclick="navigator.clipboard.writeText('${W}/fb-lead-webhook');alert('Copied!')"><i class="fas fa-copy"></i></button></div>
            <label class="form-label small fw-bold">Verify Token</label>
            <input type="text" class="form-control form-control-sm" value="my_verify_token_123" readonly>
            <button class="btn btn-warning btn-sm mt-2" onclick="Integrations.testWebhook('leadads')">🧪 Test</button>
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
      alert('✅ Test logged! Check Logs tab.');
    } catch(e) { alert('Error: ' + e.message); }
  },

  // ==================== GOOGLE SHEETS ====================
  async renderSheets() {
    let html = `
      ${this.renderTabs('sheets')}
      <div class="row g-3">
        <div class="col-md-8">
          <div class="card-widget">
            <h5><i class="fas fa-table me-2"></i>Google Sheets Sync</h5>
            <div class="mb-2"><label class="form-label small fw-bold">Sheet URL</label><input type="url" id="sheetUrl" class="form-control form-control-sm" placeholder="https://docs.google.com/spreadsheets/d/..."></div>
            <div class="mb-2"><label class="form-label small fw-bold">Sheet Name</label><input type="text" id="sheetName" class="form-control form-control-sm" value="Sheet1"></div>
            <div class="form-check"><input class="form-check-input" type="checkbox" id="syncLeads" checked><label class="form-check-label small">Sync Leads</label></div>
            <div class="form-check"><input class="form-check-input" type="checkbox" id="syncContacts" checked><label class="form-check-label small">Sync Contacts</label></div>
            <button class="btn btn-success btn-sm mt-2" onclick="Integrations.saveSheetConfig()">💾 Save</button>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card-widget">
            <h5>Setup Guide</h5>
            <ol class="small"><li>Create Google Sheet</li><li>Share → Anyone with link → Editor</li><li>Paste URL above</li></ol>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  async saveSheetConfig() {
    const url = document.getElementById('sheetUrl').value.trim();
    if (!url) return alert('Enter URL!');
    await db.collection('settings').doc('google_sheets').set({
      url, sheetName: document.getElementById('sheetName').value.trim()||'Sheet1',
      syncLeads: document.getElementById('syncLeads').checked,
      syncContacts: document.getElementById('syncContacts').checked,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    alert('✅ Saved!');
  },

  // ==================== LOGS ====================
  async renderLogs() {
    let logs = [];
    try {
      const snap = await db.collection('webhook_logs').orderBy('createdAt','desc').limit(50).get();
      logs = snap.docs.map(d=>({id:d.id,...d.data()}));
    } catch(e) {}

    let html = `
      ${this.renderTabs('logs')}
      <div class="card-widget">
        <div class="d-flex justify-content-between mb-2">
          <h5><i class="fas fa-history me-2"></i>Webhook Logs</h5>
          <button class="btn btn-outline-danger btn-sm" onclick="Integrations.clearLogs()">🗑 Clear</button>
        </div>
        <div style="max-height:500px;overflow-y:auto;">
          <table class="table table-sm small">
            <thead><tr><th>Time</th><th>Type</th><th>Status</th></tr></thead>
            <tbody>
              ${logs.length===0?'<tr><td colspan="3" class="text-center text-muted">No logs</td></tr>':logs.map(l=>`
                <tr><td>${l.createdAt?.toDate().toLocaleString()||''}</td><td><span class="badge bg-info">${l.type}</span></td><td><span class="badge bg-success">${l.status}</span></td></tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  async clearLogs() {
    if(!confirm('Delete all?')) return;
    const snap=await db.collection('webhook_logs').get();
    const b=db.batch(); snap.forEach(d=>b.delete(d.ref)); await b.commit();
    this.render();
  }
};
