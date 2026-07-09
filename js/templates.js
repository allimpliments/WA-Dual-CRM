// js/templates.js — Advanced Meta WhatsApp Template Manager (FULL WORKING)
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
      let query = db.collection('templates');
      if (shouldFilterByClient()) query = query.where('clientId', '==', window.currentUser.clientId);
      const snap = await query.orderBy('createdAt', 'desc').get();
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
        .wa-preview { background: #e5ddd5; border-radius: 8px; padding: 12px; max-width: 320px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .wa-preview .wa-header-img { width: 100%; border-radius: 4px; margin-bottom: 6px; }
        .wa-preview .wa-header-video { width: 100%; border-radius: 4px; margin-bottom: 6px; background: #000; padding: 20px; text-align: center; color: #fff; }
        .wa-preview .wa-header-doc { background: #fff; border-radius: 4px; padding: 8px; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
        .wa-preview .wa-header-text { font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #111b21; }
        .wa-preview .wa-body { font-size: 13px; color: #111b21; white-space: pre-wrap; line-height: 1.4; }
        .wa-preview .wa-body .var { color: #1a73e8; font-weight: 500; }
        .wa-preview .wa-footer { font-size: 11px; color: #667781; margin-top: 4px; }
        .wa-preview .wa-btn { display: block; text-align: center; padding: 8px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 4px; background: #fff; color: #008069; border: 1px solid #008069; cursor: default; }
        .wa-preview .wa-btn.quick-reply { display: inline-block; margin-right: 4px; border-radius: 16px; padding: 4px 12px; font-size: 11px; }
        .tab-btn { border: none; background: transparent; padding: 8px 16px; border-radius: 20px; font-size: 13px; cursor: pointer; color: #5f6368; }
        .tab-btn.active { background: #e8f0fe; color: #1a73e8; font-weight: 600; }
        .filter-chip { display: inline-block; padding: 4px 10px; border-radius: 16px; font-size: 11px; cursor: pointer; border: 1px solid #dadce0; margin: 2px; }
        .filter-chip.active { background: #1a73e8; color: #fff; border-color: #1a73e8; }
        .template-builder { background: #fff; border: 2px solid #1a73e8; border-radius: 16px; padding: 20px; margin-top: 16px; }
        .template-builder h5 { color: #1a73e8; font-weight: 700; }
        .header-type-btn { border: 2px solid #dadce0; background: #fff; padding: 12px 16px; border-radius: 12px; cursor: pointer; text-align: center; transition: 0.2s; }
        .header-type-btn:hover { border-color: #1a73e8; }
        .header-type-btn.active { border-color: #1a73e8; background: #e8f0fe; }
        .header-type-btn i { font-size: 24px; display: block; margin-bottom: 4px; color: #1a73e8; }
        .header-type-btn span { font-size: 11px; color: #5f6368; }
        .media-upload-zone { border: 2px dashed #dadce0; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: 0.2s; }
        .media-upload-zone:hover { border-color: #1a73e8; background: #f8f9fa; }
        .media-upload-zone i { font-size: 32px; color: #1a73e8; }
        .preview-panel { background: #f0f2f5; border-radius: 12px; padding: 16px; max-width: 360px; }
        .button-row { display: flex; gap: 8px; align-items: center; margin-top: 8px; }
        .button-row input, .button-row select { flex: 1; }
      </style>

      <div class="card-widget p-2">
        <div class="d-flex gap-1 mb-2 flex-wrap">
          <button class="tab-btn ${this.currentTab==='all'?'active':''}" onclick="Templates.setTab('all')">All</button>
          <button class="tab-btn ${this.currentTab==='active'?'active':''}" onclick="Templates.setTab('active')">Active</button>
          <button class="tab-btn ${this.currentTab==='pending'?'active':''}" onclick="Templates.setTab('pending')">Pending</button>
          <button class="tab-btn ${this.currentTab==='rejected'?'active':''}" onclick="Templates.setTab('rejected')">Rejected</button>
        </div>

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
              <p class="text-muted text-center mt-3">Select a template to view preview.</p>
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

    const preview = this.generatePreview(tpl);
    
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
      <p class="small fw-bold">Preview</p>
      ${preview}
    `;
  },

  generatePreview(tpl) {
    const components = tpl.components || [];
    const header = components.find(c => c.type === 'HEADER');
    const body = components.find(c => c.type === 'BODY');
    const footer = components.find(c => c.type === 'FOOTER');
    const buttons = components.find(c => c.type === 'BUTTONS');
    
    let html = '<div class="wa-preview">';
    
    // Header
    if (header) {
      if (header.format === 'IMAGE' && header.example?.header_handle) {
        html += `<img src="${header.example.header_handle[0]}" class="wa-header-img" alt="Header">`;
      } else if (header.format === 'VIDEO' && header.example?.header_handle) {
        html += `<div class="wa-header-video"><i class="fas fa-play-circle" style="font-size:32px;"></i><br><small>Video Preview</small></div>`;
      } else if (header.format === 'DOCUMENT' && header.example?.header_handle) {
        html += `<div class="wa-header-doc"><i class="fas fa-file-pdf" style="font-size:24px;color:#ef4444;"></i><small>Document</small></div>`;
      } else if (header.format === 'LOCATION') {
        html += `<div class="wa-header-doc"><i class="fas fa-map-marker-alt" style="font-size:24px;color:#ef4444;"></i><small>Location</small></div>`;
      } else if (header.text) {
        html += `<div class="wa-header-text">${header.text}</div>`;
      }
    }
    
    // Body
    if (body) {
      html += `<div class="wa-body">${(body.text || '').replace(/\{\{(\d+)\}\}/g, '<span class="var">{{$1}}</span>')}</div>`;
    }
    
    // Footer
    if (footer) {
      html += `<div class="wa-footer">${footer.text}</div>`;
    }
    
    // Buttons
    if (buttons && buttons.buttons) {
      buttons.buttons.forEach(b => {
        if (b.type === 'QUICK_REPLY') {
          html += `<span class="wa-btn quick-reply">${b.text}</span>`;
        } else if (b.type === 'URL') {
          html += `<div class="wa-btn">${b.text || 'Visit'}</div>`;
        } else if (b.type === 'PHONE_NUMBER') {
          html += `<div class="wa-btn">📞 ${b.text || 'Call'}</div>`;
        } else if (b.type === 'COPY_CODE') {
          html += `<div class="wa-btn">📋 ${b.text || 'Copy'}</div>`;
        }
      });
    }
    
    html += '</div>';
    return html;
  },

  async fetchFromMeta() {
    const cfg = (await db.collection('settings').doc('whatsapp').get()).data();
    if (!cfg?.accessToken) return;
    try {
      const res = await fetch('https://graph.facebook.com/v22.0/342354115627791/message_templates?limit=100', {
        headers: { 'Authorization': 'Bearer ' + cfg.accessToken }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        for (const mt of result.data) {
          const existing = await db.collection('templates').where('name', '==', mt.name).get();
          const data = {
            name: mt.name, category: mt.category, language: mt.language,
            metaTemplateId: mt.id, metaStatus: mt.status, components: mt.components || [],
            clientId: getCurrentClientId(),
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

  // ==================== ADVANCED BUILDER ====================
  async showBuilder(editId = null) {
    let tpl = {
      name: '', category: 'UTILITY', language: 'en_US',
      headerType: 'none', headerText: '', headerMediaUrl: '', headerMediaId: '',
      body: '', footer: '',
      buttons: [],
      clientId: getCurrentClientId()
    };
    
    if (editId) {
      const doc = await db.collection('templates').doc(editId).get();
      if (doc.exists) {
        const d = doc.data();
        const header = (d.components || []).find(c => c.type === 'HEADER');
        const body = (d.components || []).find(c => c.type === 'BODY');
        const footer = (d.components || []).find(c => c.type === 'FOOTER');
        const buttonsComp = (d.components || []).find(c => c.type === 'BUTTONS');
        
        tpl = {
          ...tpl,
          name: d.name, category: d.category, language: d.language,
          headerType: header ? (header.format || 'text').toLowerCase() : 'none',
          headerText: header?.text || '',
          headerMediaUrl: header?.example?.header_handle?.[0] || '',
          body: body?.text || '',
          footer: footer?.text || '',
          buttons: buttonsComp?.buttons || [],
          _id: editId
        };
      }
    }

    const headerTypes = [
      { id: 'none', icon: 'fa-ban', label: 'None' },
      { id: 'text', icon: 'fa-font', label: 'Text' },
      { id: 'image', icon: 'fa-image', label: 'Image' },
      { id: 'video', icon: 'fa-video', label: 'Video' },
      { id: 'document', icon: 'fa-file-pdf', label: 'Document' },
      { id: 'location', icon: 'fa-map-marker-alt', label: 'Location' }
    ];

    const html = `
      <div class="template-builder">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5>${editId ? 'Edit' : 'Create'} WhatsApp Template</h5>
          <button class="btn btn-light btn-sm" onclick="Templates.render()">×</button>
        </div>
        
        <div class="row g-3">
          <div class="col-md-7">
            <div class="row g-2 mb-3">
              <div class="col-md-6">
                <label class="form-label small fw-bold">Template Name *</label>
                <input id="tplName" class="form-control" value="${tpl.name}" placeholder="e.g., welcome_message">
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-bold">Category</label>
                <select id="tplCategory" class="form-select">
                  <option value="UTILITY" ${tpl.category==='UTILITY'?'selected':''}>Utility</option>
                  <option value="MARKETING" ${tpl.category==='MARKETING'?'selected':''}>Marketing</option>
                  <option value="AUTHENTICATION" ${tpl.category==='AUTHENTICATION'?'selected':''}>Authentication</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-bold">Language</label>
                <select id="tplLanguage" class="form-select">
                  <option value="en_US" ${tpl.language==='en_US'?'selected':''}>English (US)</option>
                  <option value="en_GB" ${tpl.language==='en_GB'?'selected':''}>English (UK)</option>
                  <option value="hi" ${tpl.language==='hi'?'selected':''}>Hindi</option>
                </select>
              </div>
            </div>

            <label class="form-label small fw-bold">Header Type</label>
            <div class="row g-2 mb-3" id="headerTypeSelector">
              ${headerTypes.map(ht => `
                <div class="col-4 col-md-2">
                  <div class="header-type-btn ${tpl.headerType===ht.id?'active':''}" onclick="Templates.selectHeaderType('${ht.id}')" data-type="${ht.id}">
                    <i class="fas ${ht.icon}"></i>
                    <span>${ht.label}</span>
                  </div>
                </div>
              `).join('')}
            </div>

            <div id="headerFields" style="display:${tpl.headerType==='none'?'none':'block'}">
              <div id="headerTextField" style="display:${tpl.headerType==='text'||tpl.headerType==='location'?'block':'none'}">
                <input id="tplHeaderText" class="form-control mb-2" value="${tpl.headerText}" placeholder="${tpl.headerType==='location'?'Location name':'Header text'}">
              </div>
              <div id="headerMediaField" style="display:${['image','video','document'].includes(tpl.headerType)?'block':'none'}">
                <label class="form-label small fw-bold">Media URL *</label>
                <div class="input-group mb-2">
                  <input id="tplHeaderMediaUrl" class="form-control" value="${tpl.headerMediaUrl}" placeholder="https://example.com/image.jpg">
                  <button class="btn btn-outline-primary" onclick="document.getElementById('headerMediaUpload').click()"><i class="fas fa-upload"></i></button>
                </div>
                <input type="file" id="headerMediaUpload" style="display:none" accept="image/*,video/*,.pdf" onchange="Templates.uploadHeaderMedia(this)">
                <div class="media-upload-zone mb-2" onclick="document.getElementById('headerMediaUpload').click()">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <p class="small mt-2 mb-0">Click to upload ${tpl.headerType}</p>
                </div>
              </div>
            </div>

            <label class="form-label small fw-bold mt-2">Body *</label>
            <textarea id="tplBody" class="form-control mb-2" rows="5" placeholder="Enter your message. Use {{1}}, {{2}} for variables...">${tpl.body}</textarea>
            <small class="text-muted">Variables: {{1}}, {{2}} etc. Example: Hi {{1}}, your order #{{2}} is confirmed.</small>

            <label class="form-label small fw-bold mt-2">Footer (Optional)</label>
            <input id="tplFooter" class="form-control mb-2" value="${tpl.footer}" placeholder="e.g., © 2026 Company Name">

            <div class="d-flex justify-content-between align-items-center mt-2 mb-2">
              <label class="form-label small fw-bold mb-0">Buttons</label>
              <button class="btn btn-outline-primary btn-sm" onclick="Templates.addButton()"><i class="fas fa-plus"></i> Add Button</button>
            </div>
            <div id="buttonsContainer">
              ${(tpl.buttons || []).map((b, i) => this.renderButtonRow(b, i)).join('')}
            </div>
            <small class="text-muted">Quick Reply: max 3 | URL/Phone: max 2 total</small>
          </div>

          <div class="col-md-5">
            <label class="form-label small fw-bold">Live Preview</label>
            <div class="preview-panel" id="livePreview">
              <p class="text-muted text-center">Preview will update as you type...</p>
            </div>
          </div>
        </div>

        <div class="mt-3 d-flex gap-2">
          <button class="btn btn-primary" onclick="Templates.saveTemplate('${editId||''}')"><i class="fas fa-save me-1"></i> Save Draft</button>
          <button class="btn btn-warning" onclick="Templates.submitToMeta('${editId||''}')"><i class="fas fa-paper-plane me-1"></i> Submit to Meta</button>
          <button class="btn btn-light" onclick="Templates.render()">Cancel</button>
        </div>
      </div>
    `;
    document.getElementById('templateBuilderContainer').innerHTML = html;
    setTimeout(() => this.attachPreviewListeners(), 200);
  },

  renderButtonRow(button, index) {
    const types = [
      { id: 'QUICK_REPLY', label: 'Quick Reply' },
      { id: 'URL', label: 'Visit Website' },
      { id: 'PHONE_NUMBER', label: 'Call Phone' },
      { id: 'COPY_CODE', label: 'Copy Code' }
    ];
    
    return `
      <div class="button-row border rounded p-2 mb-2" data-button-index="${index}">
        <select class="form-select form-select-sm" style="width:120px" onchange="Templates.updateButtonType(this, ${index})">
          ${types.map(t => `<option value="${t.id}" ${button.type===t.id?'selected':''}>${t.label}</option>`).join('')}
        </select>
        <input class="form-control form-control-sm" value="${button.text||''}" placeholder="Button text" onchange="Templates.updateButtonText(this, ${index})">
        ${button.type === 'URL' ? `<input class="form-control form-control-sm" value="${button.url||''}" placeholder="https://..." onchange="Templates.updateButtonUrl(this, ${index})">` : ''}
        ${button.type === 'PHONE_NUMBER' ? `<input class="form-control form-control-sm" value="${button.phone_number||''}" placeholder="+91..." onchange="Templates.updateButtonPhone(this, ${index})">` : ''}
        ${button.type === 'COPY_CODE' ? `<input class="form-control form-control-sm" value="${button.example||''}" placeholder="Code to copy" onchange="Templates.updateButtonCode(this, ${index})">` : ''}
        <button class="btn btn-outline-danger btn-sm" onclick="Templates.removeButton(${index})">×</button>
      </div>
    `;
  },

  selectHeaderType(type) {
    document.querySelectorAll('.header-type-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-type="${type}"]`)?.classList.add('active');
    document.getElementById('headerFields').style.display = type === 'none' ? 'none' : 'block';
    document.getElementById('headerTextField').style.display = (type === 'text' || type === 'location') ? 'block' : 'none';
    document.getElementById('headerMediaField').style.display = ['image','video','document'].includes(type) ? 'block' : 'none';
    this.updatePreview();
  },

  async uploadHeaderMedia(input) {
    const file = input.files[0];
    if (!file) return;
    const path = `templates/headers/${Date.now()}_${file.name}`;
    const ref = storage.ref(path);
    try {
      showToast('Uploading...', 'info');
      await ref.put(file);
      const url = await ref.getDownloadURL();
      document.getElementById('tplHeaderMediaUrl').value = url;
      showToast('✅ Uploaded!', 'success');
      this.updatePreview();
    } catch(e) {
      showToast('Upload failed: ' + e.message, 'error');
    }
  },

  addButton() {
    const container = document.getElementById('buttonsContainer');
    const currentCount = container.querySelectorAll('.button-row').length;
    if (currentCount >= 3) return alert('Max 3 buttons allowed!');
    const html = this.renderButtonRow({ type: 'QUICK_REPLY', text: '', url: '', phone_number: '', example: '' }, currentCount);
    container.insertAdjacentHTML('beforeend', html);
    this.updatePreview();
  },

  removeButton(index) {
    document.querySelector(`[data-button-index="${index}"]`)?.remove();
    this.updatePreview();
  },

  updateButtonType(select, index) { this.updatePreview(); },
  updateButtonText(input, index) { this.updatePreview(); },
  updateButtonUrl(input, index) { this.updatePreview(); },
  updateButtonPhone(input, index) { this.updatePreview(); },
  updateButtonCode(input, index) { this.updatePreview(); },

  attachPreviewListeners() {
    ['tplHeaderText', 'tplHeaderMediaUrl', 'tplBody', 'tplFooter'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => this.updatePreview());
    });
    this.updatePreview();
  },

  updatePreview() {
    const preview = document.getElementById('livePreview');
    if (!preview) return;

    const headerType = document.querySelector('.header-type-btn.active')?.dataset?.type || 'none';
    const headerText = document.getElementById('tplHeaderText')?.value || '';
    const headerMediaUrl = document.getElementById('tplHeaderMediaUrl')?.value || '';
    const body = document.getElementById('tplBody')?.value || '';
    const footer = document.getElementById('tplFooter')?.value || '';
    
    let html = '<div class="wa-preview">';
    
    if (headerType !== 'none') {
      if (headerType === 'text') {
        html += `<div class="wa-header-text">${headerText || 'Header Text'}</div>`;
      } else if (headerType === 'image' && headerMediaUrl) {
        html += `<img src="${headerMediaUrl}" class="wa-header-img" alt="Header">`;
      } else if (headerType === 'video' && headerMediaUrl) {
        html += `<div class="wa-header-video"><i class="fas fa-play-circle" style="font-size:32px;"></i><br><small>Video</small></div>`;
      } else if (headerType === 'document' && headerMediaUrl) {
        html += `<div class="wa-header-doc"><i class="fas fa-file-pdf" style="font-size:24px;color:#ef4444;"></i><small>Document</small></div>`;
      } else if (headerType === 'location') {
        html += `<div class="wa-header-doc"><i class="fas fa-map-marker-alt" style="font-size:24px;color:#ef4444;"></i><small>${headerText || 'Location'}</small></div>`;
      }
    }
    
    html += `<div class="wa-body">${(body || 'Enter your message...').replace(/\{\{(\d+)\}\}/g, '<span class="var">{{$1}}</span>')}</div>`;
    if (footer) html += `<div class="wa-footer">${footer}</div>`;
    
    const buttonRows = document.querySelectorAll('#buttonsContainer .button-row');
    buttonRows.forEach(row => {
      const select = row.querySelector('select');
      const inputs = row.querySelectorAll('input');
      const type = select?.value || 'QUICK_REPLY';
      const text = inputs[0]?.value || '';
      if (!text) return;
      if (type === 'QUICK_REPLY') html += `<span class="wa-btn quick-reply">${text}</span>`;
      else if (type === 'URL') html += `<div class="wa-btn">🌐 ${text}</div>`;
      else if (type === 'PHONE_NUMBER') html += `<div class="wa-btn">📞 ${text}</div>`;
      else if (type === 'COPY_CODE') html += `<div class="wa-btn">📋 ${text}</div>`;
    });
    
    html += '</div>';
    preview.innerHTML = html;
  },

  async saveTemplate(editId) {
    const headerType = document.querySelector('.header-type-btn.active')?.dataset?.type || 'none';
    const components = [];
    
    if (headerType !== 'none') {
      const headerComp = { type: 'HEADER' };
      if (headerType === 'text' || headerType === 'location') {
        headerComp.format = 'TEXT';
        headerComp.text = document.getElementById('tplHeaderText')?.value || '';
      } else if (['image','video','document'].includes(headerType)) {
        headerComp.format = headerType.toUpperCase();
        const mediaUrl = document.getElementById('tplHeaderMediaUrl')?.value || '';
        headerComp.example = { header_handle: [mediaUrl] };
      }
      components.push(headerComp);
    }
    
    const bodyText = document.getElementById('tplBody')?.value || '';
    if (bodyText) components.push({ type: 'BODY', text: bodyText });
    
    const footerText = document.getElementById('tplFooter')?.value || '';
    if (footerText) components.push({ type: 'FOOTER', text: footerText });
    
    const buttons = [];
    document.querySelectorAll('#buttonsContainer .button-row').forEach(row => {
      const select = row.querySelector('select');
      const inputs = row.querySelectorAll('input');
      const type = select?.value || 'QUICK_REPLY';
      const text = inputs[0]?.value || '';
      if (!text) return;
      const btn = { type, text };
      if (type === 'URL' && inputs[1]) btn.url = inputs[1].value;
      if (type === 'PHONE_NUMBER' && inputs[1]) btn.phone_number = inputs[1].value;
      if (type === 'COPY_CODE' && inputs[1]) btn.example = inputs[1].value;
      buttons.push(btn);
    });
    if (buttons.length > 0) components.push({ type: 'BUTTONS', buttons });

    const data = {
      name: document.getElementById('tplName')?.value?.trim() || '',
      category: document.getElementById('tplCategory')?.value || 'UTILITY',
      language: document.getElementById('tplLanguage')?.value || 'en_US',
      components,
      clientId: getCurrentClientId(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    if (!data.name || components.length === 0) return alert('Name and at least Body are required!');
    
    try {
      if (editId) {
        await db.collection('templates').doc(editId).update(data);
      } else {
        data.metaStatus = 'DRAFT';
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('templates').add(data);
      }
      alert('✅ Saved!');
      this.render();
    } catch (err) { alert('Error: ' + err.message); }
  },

  async submitToMeta(editId) {
    if (!editId) return alert('Save draft first.');
    const doc = await db.collection('templates').doc(editId).get();
    const tpl = doc.data();
    const cfg = (await db.collection('settings').doc('whatsapp').get()).data();
    if (!cfg?.accessToken) return alert('WhatsApp not configured.');

    const payload = {
      name: (tpl.name || 'template').toLowerCase().replace(/[^a-z0-9_]/g, '_').substring(0, 60),
      category: tpl.category || 'UTILITY',
      language: tpl.language || 'en_US',
      components: tpl.components || []
    };

    try {
      const res = await fetch('https://graph.facebook.com/v22.0/342354115627791/message_templates', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + cfg.accessToken, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.ok && result.id) {
        await db.collection('templates').doc(editId).update({
          metaTemplateId: result.id,
          metaStatus: result.status || 'PENDING',
          submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert('✅ Submitted!');
        await this.fetchFromMeta();
        this.render();
      } else {
        alert('❌ ' + JSON.stringify(result.error || result));
      }
    } catch (err) { alert('Error: ' + err.message); }
  },

  // ✅ FIXED: sendTemplate — handles ALL template types
  async sendTemplate(id) {
    let phone = prompt('Enter phone number (with country code):');
    if (!phone) return;
    phone = phone.replace(/[^0-9]/g, '');
    
    const doc = await db.collection('templates').doc(id).get();
    const tpl = doc.data();
    const cfg = (await db.collection('settings').doc('whatsapp').get()).data();
    
    if (!cfg?.phoneNumberId || !cfg?.accessToken) return alert('WhatsApp not configured.');
    
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: phone,
        type: 'template',
        template: {
          name: tpl.name,
          language: { code: tpl.language || 'en_US' }
        }
      };

      const components = tpl.components || [];
      const body = components.find(c => c.type === 'BODY');
      const header = components.find(c => c.type === 'HEADER');
      const buttons = components.find(c => c.type === 'BUTTONS');
      
      const templateComponents = [];

      // ✅ HEADER with media
      if (header && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(header.format)) {
        if (header.example?.header_handle?.length > 0) {
          templateComponents.push({
            type: 'header',
            parameters: [{
              type: header.format.toLowerCase(),
              [header.format.toLowerCase()]: { link: header.example.header_handle[0] }
            }]
          });
        }
      } 
      // ✅ HEADER with text variables
      else if (header && header.format === 'TEXT' && header.text) {
        const headerVars = header.text.match(/\{\{(\d+)\}\}/g);
        if (headerVars) {
          const params = headerVars.map(v => {
            const val = prompt(`Header - Enter value for ${v}:`, '');
            if (!val) throw new Error('All header variables required!');
            return { type: 'text', text: val };
          });
          templateComponents.push({ type: 'header', parameters: params });
        }
      }

      // ✅ BODY variables
      if (body && body.text) {
        const bodyVars = body.text.match(/\{\{(\d+)\}\}/g);
        if (bodyVars) {
          const bodyParams = bodyVars.map(v => {
            const val = prompt(`Body - Enter value for ${v}:`, '');
            if (!val) throw new Error('All body variables required!');
            return { type: 'text', text: val };
          });
          templateComponents.push({ type: 'body', parameters: bodyParams });
        }
      }

      // ✅ BUTTON URL variables
      if (buttons && buttons.buttons) {
        const urlButton = buttons.buttons.find(b => b.type === 'URL' && (b.url || '').includes('{{'));
        if (urlButton) {
          const urlVars = (urlButton.url || '').match(/\{\{(\d+)\}\}/g);
          if (urlVars) {
            const btnParams = urlVars.map(v => {
              const val = prompt(`Button "${urlButton.text}" - Enter URL value for ${v}:`, '');
              if (!val) throw new Error('Button URL variable required!');
              return { type: 'text', text: val };
            });
            templateComponents.push({
              type: 'button',
              sub_type: 'url',
              index: String(buttons.buttons.indexOf(urlButton)),
              parameters: btnParams
            });
          }
        }
      }

      if (templateComponents.length > 0) {
        payload.template.components = templateComponents;
      }

      console.log('📤 Template Payload:', JSON.stringify(payload, null, 2));

      const res = await fetch(
        `https://graph.facebook.com/v22.0/${cfg.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + cfg.accessToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );
      
      const result = await res.json();
      console.log('📥 Meta Response:', result);
      
      if (res.ok) {
        alert('✅ Template sent! Message ID: ' + (result.messages?.[0]?.id || 'N/A'));
      } else {
        alert('❌ Failed!\nCode: ' + result.error?.code + '\nMessage: ' + result.error?.message);
      }
    } catch (err) { 
      alert(err.message || 'Error sending template'); 
    }
  },

  async deleteTemplate(id) {
    if (!confirm('Delete?')) return;
    await db.collection('templates').doc(id).delete();
    alert('Deleted.');
    this.render();
  }
};
