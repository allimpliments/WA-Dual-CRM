const Templates = {
  currentTab: 'all',
  currentFilter: '',
  currentCategory: '',
  currentLang: '',

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading templates...</p>';
    await this.fetchFromMeta();

    let templates = [];
    try {
      const snap = await db.collection('templates').orderBy('createdAt', 'desc').get();
      templates = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error('Error loading templates:', err);
    }

    const categories = [...new Set(templates.map(t => t.category).filter(Boolean))];
    const languages = [...new Set(templates.map(t => t.language).filter(Boolean))];
    const statuses = ['APPROVED', 'PENDING', 'REJECTED', 'PAUSED', 'DISABLED'];

    const filtered = templates.filter(t => {
      if (this.currentTab === 'active') return t.metaStatus === 'APPROVED';
      if (this.currentTab === 'pending') return t.metaStatus === 'PENDING';
      if (this.currentTab === 'rejected') return t.metaStatus === 'REJECTED';
      if (this.currentCategory && t.category !== this.currentCategory) return false;
      if (this.currentLang && t.language !== this.currentLang) return false;
      if (this.currentFilter && t.metaStatus !== this.currentFilter) return false;
      return true;
    });

    let html = `
      <style>
        .tpl-row { cursor: pointer; transition: background 0.15s; }
        .tpl-row:hover { background: #f8fafc; }
        .tpl-row.active-row { background: #e8f0fe; border-left: 3px solid #1a73e8; }
        .insight-panel { max-height: 80vh; overflow-y: auto; }
        .wa-preview-msg { background: #e5ddd5; border-radius: 8px; padding: 12px; max-width: 320px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .wa-preview-msg .wa-header-text { font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #111b21; }
        .wa-preview-msg .wa-body { font-size: 13px; color: #111b21; white-space: pre-wrap; line-height: 1.4; }
        .wa-preview-msg .wa-footer { font-size: 11px; color: #667781; margin-top: 4px; }
        .wa-preview-msg .wa-btn { display: block; text-align: center; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 4px; background: #fff; color: #008069; border: 1px solid #008069; }
        .tab-btn { border: none; background: transparent; padding: 8px 16px; border-radius: 20px; font-size: 13px; cursor: pointer; color: #5f6368; }
        .tab-btn.active { background: #e8f0fe; color: #1a73e8; font-weight: 600; }
        .filter-chip { display: inline-block; padding: 4px 10px; border-radius: 16px; font-size: 11px; cursor: pointer; border: 1px solid #dadce0; margin: 2px; }
        .filter-chip.active { background: #1a73e8; color: #fff; border-color: #1a73e8; }
      </style>

      <div class="card-widget p-2">
        <!-- Tabs -->
        <div class="d-flex gap-1 mb-2 flex-wrap">
          <button class="tab-btn ${this.currentTab==='all'?'active':''}" onclick="Templates.setTab('all')">Templates</button>
          <button class="tab-btn ${this.currentTab==='active'?'active':''}" onclick="Templates.setTab('active')">Active</button>
          <button class="tab-btn ${this.currentTab==='pending'?'active':''}" onclick="Templates.setTab('pending')">Pending</button>
          <button class="tab-btn ${this.currentTab==='rejected'?'active':''}" onclick="Templates.setTab('rejected')">Rejected</button>
        </div>

        <!-- Filters -->
        <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
          <select class="form-select form-select-sm" style="width:auto" onchange="Templates.setCategory(this.value)">
            <option value="">All Categories</option>
            ${categories.map(c => `<option value="${c}" ${this.currentCategory===c?'selected':''}>${c}</option>`).join('')}
          </select>
          <select class="form-select form-select-sm" style="width:auto" onchange="Templates.setLang(this.value)">
            <option value="">All Languages</option>
            ${languages.map(l => `<option value="${l}" ${this.currentLang===l?'selected':''}>${l}</option>`).join('')}
          </select>
          <div class="d-flex flex-wrap gap-1">
            ${statuses.map(s => `<span class="filter-chip ${this.currentFilter===s?'active':''}" onclick="Templates.setFilter('${s}')">${s}</span>`).join('')}
          </div>
          <button class="btn btn-outline-primary btn-sm ms-auto" onclick="Templates.fetchFromMeta().then(()=>Templates.render())"><i class="fas fa-sync-alt me-1"></i> Sync</button>
          <button class="btn btn-primary btn-sm" onclick="Templates.showBuilder()"><i class="fas fa-plus me-1"></i> Create</button>
        </div>

        <!-- Table + Insight Panel -->
        <div class="row g-2">
          <div class="col-md-7">
            <div class="table-responsive" style="max-height:60vh;overflow-y:auto;">
              <table class="table table-sm table-hover">
                <thead class="table-light sticky-top">
                  <tr><th>Template Name</th><th>Category</th><th>Language</th><th>Status</th></tr>
                </thead>
                <tbody>
                  ${filtered.length === 0
                    ? '<tr><td colspan="4" class="text-center text-muted py-4">No templates found.</td></tr>'
                    : filtered.map(tpl => `
                      <tr class="tpl-row" onclick="Templates.showInsight('${tpl.id}')" id="row-${tpl.id}">
                        <td><strong>${tpl.name || '-'}</strong></td>
                        <td><span class="badge bg-${tpl.category==='MARKETING'?'warning':tpl.category==='UTILITY'?'info':'secondary'}">${tpl.category || '-'}</span></td>
                        <td>${tpl.language || 'en'}</td>
                        <td><span class="badge bg-${tpl.metaStatus==='APPROVED'?'success':tpl.metaStatus==='PENDING'?'warning':tpl.metaStatus==='REJECTED'?'danger':'secondary'}">${tpl.metaStatus || 'Draft'}</span></td>
                      </tr>
                    `).join('')
                  }
                </tbody>
              </table>
            </div>
          </div>
          <div class="col-md-5">
            <div class="insight-panel border rounded p-2 bg-light" id="insightPanel">
              <p class="text-muted text-center mt-3">Select a template to view insights.</p>
            </div>
          </div>
        </div>
      </div>
      <div id="templateBuilderContainer"></div>
    `;
    contentArea.innerHTML = html;
  },

  setTab(tab) { this.currentTab = tab; this.currentFilter = ''; this.render(); },
  setCategory(cat) { this.currentCategory = cat; this.render(); },
  setLang(lang) { this.currentLang = lang; this.render(); },
  setFilter(f) { this.currentFilter = this.currentFilter === f ? '' : f; this.render(); },

  async showInsight(id) {
    document.querySelectorAll('.tpl-row').forEach(r => r.classList.remove('active-row'));
    document.getElementById('row-' + id)?.classList.add('active-row');

    const doc = await db.collection('templates').doc(id).get();
    const tpl = doc.data();
    if (!tpl) return;

    const headerText = (tpl.components || []).find(c => c.type === 'HEADER')?.text || tpl.headerValue || '';
    const bodyText = (tpl.components || []).find(c => c.type === 'BODY')?.text || tpl.body || '';
    const footerText = (tpl.components || []).find(c => c.type === 'FOOTER')?.text || tpl.footer || '';
    const buttons = (tpl.components || []).find(c => c.type === 'BUTTONS')?.buttons || [];

    document.getElementById('insightPanel').innerHTML = `
      <div class="text-end">
        <button class="btn btn-sm btn-outline-info me-1" onclick="Templates.showBuilder('${id}')"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-success me-1" onclick="Templates.sendTemplate('${id}')"><i class="fab fa-whatsapp"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="Templates.deleteTemplate('${id}')"><i class="fas fa-trash"></i></button>
      </div>
      <h6 class="mt-2">${tpl.name} · ${tpl.language || 'en'}</h6>
      <span class="badge bg-${tpl.metaStatus==='APPROVED'?'success':'warning'}">${tpl.metaStatus || 'Draft'}</span>
      <span class="badge bg-secondary ms-1">${tpl.category || '-'}</span>
      <p class="text-muted small mt-1">Updated on ${tpl.updatedAt ? new Date(tpl.updatedAt.toDate()).toLocaleDateString() : '-'}</p>
      <hr>
      <p class="small fw-bold">Your template</p>
      <div class="wa-preview-msg">
        ${headerText ? `<div class="wa-header-text">${headerText}</div>` : ''}
        <div class="wa-body">${bodyText || 'No body.'}</div>
        ${footerText ? `<div class="wa-footer">${footerText}</div>` : ''}
        ${buttons.map(b => `<div class="wa-btn">${b.text || 'Button'}</div>`).join('')}
      </div>
      <hr>
      <p class="small text-muted">Performance insights available on <a href="https://business.facebook.com/wa/manage/message-templates/" target="_blank">Meta Business Manager ↗</a></p>
    `;
  },

  async fetchFromMeta() {
    const cfg = (await db.collection('settings').doc('whatsapp').get()).data();
    if (!cfg?.accessToken) return;
    try {
      const res = await fetch('https://graph.facebook.com/v22.0/342856675576986/message_templates?limit=100', {
        headers: { 'Authorization': 'Bearer ' + cfg.accessToken }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        for (const mt of result.data) {
          const existing = await db.collection('templates').where('name', '==', mt.name).get();
          const data = {
            name: mt.name, category: mt.category, language: mt.language,
            metaTemplateId: mt.id, metaStatus: mt.status, components: mt.components || [],
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          };
          if (existing.empty) {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('templates').add(data);
          } else {
            await existing.docs[0].ref.update(data);
          }
        }
      }
    } catch (err) { console.error('Sync error:', err); }
  },

  async showBuilder(editId = null) {
    let tpl = { name: '', category: 'UTILITY', language: 'en_US', headerType: 'none', headerValue: '', body: '', footer: '', buttonType: 'none', buttonText: '', buttonUrl: '', buttonPhone: '', buttonPhone2: '', quickReply: false };
    if (editId) {
      const doc = await db.collection('templates').doc(editId).get();
      if (doc.exists) tpl = { ...tpl, ...doc.data(), _id: editId };
    }
    const html = `
      <div class="card border-info mt-3">
        <div class="card-body p-3">
          <h5>${editId ? 'Edit' : 'Create'} Template</h5>
          <div class="row g-2">
            <div class="col-md-6"><input id="tplName" class="form-control form-control-sm" value="${tpl.name}" placeholder="Name"></div>
            <div class="col-md-3"><select id="tplCategory" class="form-select form-select-sm"><option value="UTILITY" ${tpl.category==='UTILITY'?'selected':''}>Utility</option><option value="MARKETING" ${tpl.category==='MARKETING'?'selected':''}>Marketing</option><option value="AUTHENTICATION" ${tpl.category==='AUTHENTICATION'?'selected':''}>Authentication</option></select></div>
            <div class="col-md-3"><select id="tplLanguage" class="form-select form-select-sm"><option value="en_US" ${tpl.language==='en_US'?'selected':''}>English (US)</option><option value="hi" ${tpl.language==='hi'?'selected':''}>Hindi</option></select></div>
            <div class="col-md-6">
              <select id="tplHeaderType" class="form-select form-select-sm" onchange="Templates.toggleHeaderFields()">
                <option value="none" ${tpl.headerType==='none'?'selected':''}>No Header</option>
                <option value="text" ${tpl.headerType==='text'?'selected':''}>Text Header</option>
              </select>
            </div>
            <div class="col-md-6" id="headerTextField" style="display:${tpl.headerType==='text'?'block':'none'}">
              <input id="tplHeaderValue" class="form-control form-control-sm" value="${tpl.headerValue||''}" placeholder="Header text">
            </div>
          </div>
          <textarea id="tplBody" class="form-control form-control-sm mt-2" rows="4" placeholder="Body">${tpl.body}</textarea>
          <input id="tplFooter" class="form-control form-control-sm mt-1" value="${tpl.footer||''}" placeholder="Footer">
          <div class="form-check mt-1"><input class="form-check-input" type="checkbox" id="tplQuickReply"><label class="form-check-label small">Quick Reply</label></div>
          <div class="mt-1">
            <select id="tplButtonType" class="form-select form-select-sm" onchange="Templates.toggleCTAFields()">
              <option value="none" ${tpl.buttonType==='none'?'selected':''}>No CTA</option>
              <option value="visit" ${tpl.buttonType==='visit'?'selected':''}>Visit Website</option>
              <option value="call" ${tpl.buttonType==='call'?'selected':''}>Call</option>
              <option value="both" ${tpl.buttonType==='both'?'selected':''}>Both</option>
            </select>
          </div>
          <div id="ctaFields" style="display:${tpl.buttonType!=='none'?'block':'none'}">
            <div class="row g-2 mt-1"><div class="col-6"><input id="tplButtonText" class="form-control form-control-sm" value="${tpl.buttonText||''}" placeholder="Btn Text"></div><div class="col-6"><input id="tplButtonUrl" class="form-control form-control-sm" value="${tpl.buttonUrl||''}" placeholder="URL"></div></div>
            <div class="row g-2 mt-1"><div class="col-6"><input id="tplButtonPhone" class="form-control form-control-sm" value="${tpl.buttonPhone||''}" placeholder="Call Text"></div><div class="col-6"><input id="tplButtonPhone2" class="form-control form-control-sm" value="${tpl.buttonPhone2||''}" placeholder="+91..."></div></div>
          </div>
          <div class="mt-2">
            <button class="btn btn-outline-secondary btn-sm" onclick="Templates.saveTemplate('${editId||''}')">Save Draft</button>
            <button class="btn btn-warning btn-sm" onclick="Templates.submitToMeta('${editId||''}')">Submit to Meta</button>
            <button class="btn btn-light btn-sm" onclick="Templates.render()">Cancel</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('templateBuilderContainer').innerHTML = html;
  },

  toggleHeaderFields() {
    const v = document.getElementById('tplHeaderType').value;
    document.getElementById('headerTextField').style.display = v === 'text' ? 'block' : 'none';
  },
  toggleCTAFields() {
    const v = document.getElementById('tplButtonType').value;
    document.getElementById('ctaFields').style.display = v !== 'none' ? 'block' : 'none';
  },

  async saveTemplate(editId) {
    const data = {
      name: document.getElementById('tplName').value.trim(),
      category: document.getElementById('tplCategory').value,
      language: document.getElementById('tplLanguage').value,
      headerType: document.getElementById('tplHeaderType').value,
      headerValue: document.getElementById('tplHeaderValue')?.value?.trim() || '',
      body: document.getElementById('tplBody').value.trim(),
      footer: document.getElementById('tplFooter').value.trim(),
      buttonType: document.getElementById('tplButtonType').value,
      buttonText: document.getElementById('tplButtonText')?.value?.trim() || '',
      buttonUrl: document.getElementById('tplButtonUrl')?.value?.trim() || '',
      buttonPhone: document.getElementById('tplButtonPhone')?.value?.trim() || '',
      buttonPhone2: document.getElementById('tplButtonPhone2')?.value?.trim() || '',
      quickReply: document.getElementById('tplQuickReply')?.checked || false,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    if (!data.name || !data.body) return alert('Name & Body required!');
    try {
      if (editId) await db.collection('templates').doc(editId).update(data);
      else { data.createdAt = firebase.firestore.FieldValue.serverTimestamp(); await db.collection('templates').add(data); }
      alert('✅ Saved!'); this.render();
    } catch (err) { alert('Error: ' + err.message); }
  },

  async submitToMeta(editId) {
    if (!editId) return alert('Save draft first.');
    const doc = await db.collection('templates').doc(editId).get();
    const tpl = doc.data();
    const cfg = (await db.collection('settings').doc('whatsapp').get()).data();
    if (!cfg?.accessToken) return alert('WhatsApp not configured.');

    const components = [];
    if (tpl.headerType === 'text' && tpl.headerValue) components.push({ type: 'HEADER', format: 'TEXT', text: tpl.headerValue });
    components.push({ type: 'BODY', text: tpl.body });
    if (tpl.footer) components.push({ type: 'FOOTER', text: tpl.footer });

    const buttons = [];
    if (tpl.quickReply) { buttons.push({ type: 'QUICK_REPLY', text: 'Yes' }, { type: 'QUICK_REPLY', text: 'No' }); }
    if (tpl.buttonType === 'visit' || tpl.buttonType === 'both') buttons.push({ type: 'URL', text: tpl.buttonText || 'Visit', url: tpl.buttonUrl || 'https://example.com' });
    if (tpl.buttonType === 'call' || tpl.buttonType === 'both') buttons.push({ type: 'PHONE_NUMBER', text: tpl.buttonPhone || 'Call', phone_number: tpl.buttonPhone2 || '+919999999999' });
    if (buttons.length) components.push({ type: 'BUTTONS', buttons });

    const payload = {
      name: tpl.name.toLowerCase().replace(/[^a-z0-9_]/g, '_').substring(0, 60),
      category: tpl.category, language: tpl.language, components
    };

    try {
      const res = await fetch('https://graph.facebook.com/v22.0/342856675576986/message_templates', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + cfg.accessToken, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.ok && result.id) {
        await db.collection('templates').doc(editId).update({ metaTemplateId: result.id, metaStatus: result.status || 'PENDING', submittedAt: firebase.firestore.FieldValue.serverTimestamp() });
        alert('✅ Submitted!'); await this.fetchFromMeta(); this.render();
      } else {
        alert('❌ ' + JSON.stringify(result.error || result));
      }
    } catch (err) { alert('Error: ' + err.message); }
  },

  async sendTemplate(id) {
    let phone = prompt('Enter phone number:'); if (!phone) return;
    phone = phone.replace(/[^0-9+]/g, '');
    const doc = await db.collection('templates').doc(id).get(), tpl = doc.data();
    const cfg = (await db.collection('settings').doc('whatsapp').get()).data();
    if (!cfg?.phoneNumberId) return alert('WhatsApp not configured.');
    try {
      const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.phoneNumberId}/messages`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + cfg.accessToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaging_product: 'whatsapp', to: phone, type: 'template', template: { name: tpl.name, language: { code: tpl.language || 'en' } } })
      });
      alert(res.ok ? '✅ Sent!' : '❌ ' + ((await res.json()).error?.message || 'Failed'));
    } catch (err) { alert('Error: ' + err.message); }
  },

  async deleteTemplate(id) {
    if (!confirm('Delete?')) return;
    await db.collection('templates').doc(id).delete();
    alert('Deleted.'); this.render();
  }
};
