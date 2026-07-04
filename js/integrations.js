// js/integrations.js — API, Webhooks, Sheets, Logs (FIXED)
const Integrations = {
  currentTab: 'api',

  getWorkerUrl() {
    return 'https://wa-crm.11avatardigitalhub.workers.dev';
  },

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading...</p>';
    if (this.currentTab === 'webhooks') { await this.renderWebhooks(); return; }
    if (this.currentTab === 'sheets') { await this.renderSheets(); return; }
    if (this.currentTab === 'logs') { await this.renderLogs(); return; }
    await this.renderAPI();
  },

  renderTabs(active) {
    return `
      <div class="d-flex gap-2 mb-3 flex-wrap">
        <button class="btn btn-${active==='api'?'primary':'outline-primary'} btn-sm" onclick="Integrations.currentTab='api';Integrations.render();">API Keys</button>
        <button class="btn btn-${active==='webhooks'?'primary':'outline-primary'} btn-sm" onclick="Integrations.currentTab='webhooks';Integrations.render();">Webhooks</button>
        <button class="btn btn-${active==='sheets'?'primary':'outline-primary'} btn-sm" onclick="Integrations.currentTab='sheets';Integrations.render();">Google Sheets</button>
        <button class="btn btn-${active==='logs'?'primary':'outline-primary'} btn-sm" onclick="Integrations.currentTab='logs';Integrations.render();">Logs</button>
      </div>
    `;
  },

  async renderAPI() {
    let apiKeys = [];
    try {
      const snap = await db.collection('settings').doc('api_keys').get();
      if (snap.exists) apiKeys = snap.data().keys || [];
    } catch(e) {}

    let html = this.renderTabs('api') + `
      <div class="card-widget">
        <h5>API Keys</h5>
        <p class="small text-muted">Generate API keys for external access.</p>
        ${apiKeys.length === 0 ? '<p class="text-muted">No keys yet.</p>' : apiKeys.map((k, i) => `
          <div class="d-flex justify-content-between border rounded p-2 mb-2">
            <div><strong>${k.name}</strong><br><code>${k.key?.substring(0,24)}...</code></div>
            <div>
              <button class="btn btn-sm btn-outline-info" onclick="navigator.clipboard.writeText('${k.key}')">Copy</button>
              <button class="btn btn-sm btn-outline-danger" onclick="Integrations.deleteKey(${i})">Del</button>
            </div>
          </div>
        `).join('')}
        <div class="input-group mt-3">
          <input type="text" id="newKeyName" class="form-control form-control-sm" placeholder="Key name">
          <button class="btn btn-primary btn-sm" onclick="Integrations.generateKey()">Generate</button>
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
    prompt('API Key (copy now):', key);
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

  async renderWebhooks() {
    const W = this.getWorkerUrl();
    let html = this.renderTabs('webhooks') + `
      <div class="row g-3">
        <div class="col-md-6"><div class="card-widget"><h5>WhatsApp Webhook</h5>
          <label class="small">URL</label><div class="input-group mb-2"><input class="form-control form-control-sm" value="${W}/" readonly><button class="btn btn-sm btn-outline-primary" onclick="navigator.clipboard.writeText('${W}/')">Copy</button></div>
          <label class="small">Token</label><input class="form-control form-control-sm" value="my_verify_token_123" readonly>
        </div></div>
        <div class="col-md-6"><div class="card-widget"><h5>Facebook Webhook</h5>
          <label class="small">URL</label><div class="input-group mb-2"><input class="form-control form-control-sm" value="${W}/fb-webhook" readonly><button class="btn btn-sm btn-outline-primary" onclick="navigator.clipboard.writeText('${W}/fb-webhook')">Copy</button></div>
          <label class="small">Token</label><input class="form-control form-control-sm" value="my_verify_token_123" readonly>
        </div></div>
        <div class="col-md-6"><div class="card-widget"><h5>Instagram Webhook</h5>
          <label class="small">URL</label><div class="input-group mb-2"><input class="form-control form-control-sm" value="${W}/ig-webhook" readonly><button class="btn btn-sm btn-outline-primary" onclick="navigator.clipboard.writeText('${W}/ig-webhook')">Copy</button></div>
          <label class="small">Token</label><input class="form-control form-control-sm" value="my_verify_token_123" readonly>
        </div></div>
        <div class="col-md-6"><div class="card-widget"><h5>Lead Ads Webhook</h5>
          <label class="small">URL</label><div class="input-group mb-2"><input class="form-control form-control-sm" value="${W}/fb-lead-webhook" readonly><button class="btn btn-sm btn-outline-primary" onclick="navigator.clipboard.writeText('${W}/fb-lead-webhook')">Copy</button></div>
          <label class="small">Token</label><input class="form-control form-control-sm" value="my_verify_token_123" readonly>
        </div></div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  async renderSheets() {
    let html = this.renderTabs('sheets') + `
      <div class="card-widget">
        <h5>Google Sheets Sync</h5>
        <div class="mb-2"><label class="small">Sheet URL</label><input id="sheetUrl" class="form-control form-control-sm" placeholder="https://docs.google.com/spreadsheets/d/..."></div>
        <div class="mb-2"><label class="small">Sheet Name</label><input id="sheetName" class="form-control form-control-sm" value="Sheet1"></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" id="syncLeads" checked><label class="small">Sync Leads</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" id="syncContacts" checked><label class="small">Sync Contacts</label></div>
        <button class="btn btn-success btn-sm mt-2" onclick="Integrations.saveSheetConfig()">Save</button>
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
      syncContacts: document.getElementById('syncContacts').checked
    }, { merge: true });
    alert('Saved!');
  },

  async renderLogs() {
    let logs = [];
    try { const snap = await db.collection('webhook_logs').orderBy('createdAt','desc').limit(50).get(); logs = snap.docs.map(d=>({id:d.id,...d.data()})); } catch(e) {}
    let html = this.renderTabs('logs') + `
      <div class="card-widget">
        <div class="d-flex justify-content-between mb-2"><h5>Webhook Logs</h5><button class="btn btn-sm btn-outline-danger" onclick="Integrations.clearLogs()">Clear</button></div>
        <table class="table table-sm small">
          <thead><tr><th>Time</th><th>Type</th><th>Status</th></tr></thead>
          <tbody>${logs.length===0?'<tr><td colspan="3" class="text-muted text-center">No logs</td></tr>':logs.map(l=>`<tr><td>${l.createdAt?.toDate().toLocaleString()||''}</td><td>${l.type}</td><td>${l.status}</td></tr>`).join('')}</tbody>
        </table>
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
