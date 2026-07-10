// ==========================================
// js/templates.js — Advanced Meta WhatsApp Template Manager
// COMPLETE UPGRADE - All existing features preserved
// ==========================================

const Templates = {
  currentTab: 'all',
  currentFilter: '',
  currentCategory: '',
  currentLang: '',
  
  // Builder state
  editingId: null,
  headerType: 'none',
  headerMediaFile: null,
  headerMediaUrl: '',
  buttons: [],
  currentCatalogueFormat: 'catalogue',

  // ==================== RENDER ====================
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
        .template-builder { background: #fff; border: 2px solid #1a73e8; border-radius: 16px; padding: 20px; margin-top: 16px; max-height: 90vh; overflow-y: auto; }
        .template-builder h5 { color: #1a73e8; font-weight: 700; }
        .header-type-btn { border: 2px solid #dadce0; background: #fff; padding: 12px 16px; border-radius: 12px; cursor: pointer; text-align: center; transition: 0.2s; flex: 1; min-width: 60px; }
        .header-type-btn:hover { border-color: #1a73e8; }
        .header-type-btn.active { border-color: #1a73e8; background: #e8f0fe; }
        .header-type-btn i { font-size: 24px; display: block; margin-bottom: 4px; color: #1a73e8; }
        .header-type-btn span { font-size: 11px; color: #5f6368; }
        .media-upload-zone { border: 2px dashed #dadce0; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: 0.2s; }
        .media-upload-zone:hover { border-color: #1a73e8; background: #f8f9fa; }
        .media-upload-zone i { font-size: 32px; color: #1a73e8; }
        .preview-panel { background: #f0f2f5; border-radius: 12px; padding: 16px; max-width: 360px; }
        .button-row { display: flex; gap: 8px; align-items: center; margin-top: 8px; flex-wrap: wrap; }
        .button-row input, .button-row select { flex: 1; min-width: 100px; }
        .header-type-grid { display: flex; gap: 6px; flex-wrap: wrap; margin: 8px 0; }
        .meta-char-count { font-size: 12px; color: #5f6368; text-align: right; margin-top: 2px; }
        .category-btn { transition: all 0.2s; }
        .category-btn.active { border-color: #1a73e8 !important; background: #e8f0fe !important; }
        .catalogue-format-card { border: 2px solid #dadce0; border-radius: 10px; padding: 12px; cursor: pointer; transition: all 0.2s; }
        .catalogue-format-card:hover { border-color: #1a73e8; }
        .catalogue-format-card.active { border-color: #1a73e8; background: #e8f0fe; }
        .btn-remove { color: #d93025; background: none; border: none; font-size: 18px; cursor: pointer; padding: 0 6px; }
        .btn-remove:hover { color: #b31412; }
        .status-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; display: inline-block; }
        .status-badge.approved { background: #e6f4ea; color: #1e7e34; }
        .status-badge.pending { background: #fef7e0; color: #b65c00; }
        .status-badge.rejected { background: #fce8e6; color: #c62828; }
        .status-badge.draft { background: #f1f3f4; color: #5f6368; }
        .status-badge.paused { background: #fff3e0; color: #e65100; }
        .status-badge.disabled { background: #f5f5f5; color: #757575; }
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
                        <td><span class="status-badge ${(tpl.metaStatus||'draft').toLowerCase()}">${tpl.metaStatus || 'Draft'}</span></td>
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

  // ==================== SHOW INSIGHT ====================
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
      <span class="status-badge ${(tpl.metaStatus||'draft').toLowerCase()}">${tpl.metaStatus || 'Draft'}</span>
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
    
    if (body) {
      html += `<div class="wa-body">${(body.text || '').replace(/\{\{(\d+)\}\}/g, '<span class="var">{{$1}}</span>')}</div>`;
    }
    
    if (footer) {
      html += `<div class="wa-footer">${footer.text}</div>`;
    }
    
    if (buttons && buttons.buttons) {
      buttons.buttons.forEach(b => {
        if (b.type === 'QUICK_REPLY') {
          html += `<span class="wa-btn quick-reply">${b.text}</span>`;
        } else if (b.type === 'URL') {
          html += `<div class="wa-btn">🌐 ${b.text || 'Visit'}</div>`;
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

  // ==================== SYNC FROM META ====================
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

  // ==================== SEND TEMPLATE ====================
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

      // HEADER with media
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
      // HEADER with text variables
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

      // BODY variables
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

      // BUTTON URL variables
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

  // ==================== DELETE TEMPLATE ====================
  async deleteTemplate(id) {
    if (!confirm('Delete?')) return;
    await db.collection('templates').doc(id).delete();
    alert('Deleted.');
    this.render();
  },

  // ==================== SHOW BUILDER (UPGRADED) ====================
  async showBuilder(editId = null) {
    this.editingId = editId;
    this.buttons = [];
    this.headerType = 'none';
    this.headerMediaUrl = '';
    
    let tpl = {
      name: '', category: 'UTILITY', language: 'en_US',
      headerType: 'none', headerText: '', headerMediaUrl: '',
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
        this.buttons = tpl.buttons;
        this.headerType = tpl.headerType;
        this.headerMediaUrl = tpl.headerMediaUrl;
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
            <!-- Template Name & Language -->
            <div class="row g-2 mb-3">
              <div class="col-md-6">
                <label class="form-label small fw-bold">Template Name *</label>
                <input id="tplName" class="form-control" value="${tpl.name}" placeholder="Enter a template name" oninput="Templates.updatePreview()">
                <div class="meta-char-count"><span id="nameCount">${tpl.name.length}</span>/512</div>
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-bold">Category</label>
                <select id="tplCategory" class="form-select" onchange="Templates.setCategorySelect(this.value)">
                  <option value="UTILITY" ${tpl.category==='UTILITY'?'selected':''}>Utility</option>
                  <option value="MARKETING" ${tpl.category==='MARKETING'?'selected':''}>Marketing</option>
                  <option value="AUTHENTICATION" ${tpl.category==='AUTHENTICATION'?'selected':''}>Authentication</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-bold">Language</label>
                <select id="tplLanguage" class="form-select" onchange="Templates.updatePreview()">
                  <option value="en" ${tpl.language==='en'?'selected':''}>English</option>
                  <option value="en_US" ${tpl.language==='en_US'?'selected':''}>English (US)</option>
                  <option value="en_GB" ${tpl.language==='en_GB'?'selected':''}>English (UK)</option>
                  <option value="hi" ${tpl.language==='hi'?'selected':''}>Hindi</option>
                  <option value="es" ${tpl.language==='es'?'selected':''}>Spanish</option>
                  <option value="fr" ${tpl.language==='fr'?'selected':''}>French</option>
                  <option value="ar" ${tpl.language==='ar'?'selected':''}>Arabic</option>
                  <option value="pt_BR" ${tpl.language==='pt_BR'?'selected':''}>Portuguese (Brazil)</option>
                  <option value="de" ${tpl.language==='de'?'selected':''}>German</option>
                  <option value="it" ${tpl.language==='it'?'selected':''}>Italian</option>
                  <option value="ja" ${tpl.language==='ja'?'selected':''}>Japanese</option>
                  <option value="ko" ${tpl.language==='ko'?'selected':''}>Korean</option>
                  <option value="ru" ${tpl.language==='ru'?'selected':''}>Russian</option>
                  <option value="zh_CN" ${tpl.language==='zh_CN'?'selected':''}>Chinese (Simplified)</option>
                  <option value="zh_HK" ${tpl.language==='zh_HK'?'selected':''}>Chinese (Hong Kong)</option>
                </select>
              </div>
            </div>

            <!-- Catalogue Format (Marketing only) -->
            <div id="catalogueSection" style="display:${tpl.category==='MARKETING'?'block':'none'}" class="mb-3">
              <label class="form-label small fw-bold">Catalogue format</label>
              <div class="row g-2">
                <div class="col-md-6">
                  <div class="catalogue-format-card ${this.currentCatalogueFormat==='catalogue'?'active':''}" onclick="Templates.setCatalogueFormat('catalogue')">
                    <h6 class="mb-1"><i class="fas fa-th-list me-2"></i>Catalogue message</h6>
                    <p class="small text-muted mb-0">Include the entire catalogue to give your users a comprehensive view of all of your products.</p>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="catalogue-format-card ${this.currentCatalogueFormat==='multi'?'active':''}" onclick="Templates.setCatalogueFormat('multi')">
                    <h6 class="mb-1"><i class="fas fa-th me-2"></i>Multi-product message</h6>
                    <p class="small text-muted mb-0">Include up to 30 products from the catalogue. Useful for showcasing new collection or a specific product category.</p>
                  </div>
                </div>
              </div>
              <div id="catalogueSetup" class="mt-2 p-2 bg-light rounded" style="display:${tpl.category==='MARKETING'?'block':'none'}">
                <p class="small text-muted mb-1"><i class="fas fa-info-circle me-1"></i>Connecting a catalogue will allow customers to view, message and send carts containing your products and services via WhatsApp.</p>
                <button class="btn btn-outline-primary btn-sm" onclick="alert('Manage catalogue connection')"><i class="fas fa-link me-1"></i>Manage catalogue connection</button>
              </div>
            </div>

            <!-- Header -->
            <label class="form-label small fw-bold">Header <small class="text-muted">· Optional</small></label>
            <div class="header-type-grid">
              ${headerTypes.map(ht => `
                <div class="header-type-btn ${tpl.headerType===ht.id?'active':''}" onclick="Templates.selectHeaderType('${ht.id}')" data-type="${ht.id}">
                  <i class="fas ${ht.icon}"></i>
                  <span>${ht.label}</span>
                </div>
              `).join('')}
            </div>

            <div id="headerFields" style="display:${tpl.headerType!=='none'?'block':'none'}">
              <div id="headerTextField" style="display:${(tpl.headerType==='text'||tpl.headerType==='location')?'block':'none'}">
                <input id="tplHeaderText" class="form-control mb-2" value="${tpl.headerText}" placeholder="${tpl.headerType==='location'?'Location name':'Header text'}" oninput="Templates.updatePreview()">
                <div class="meta-char-count"><span id="headerCount">${tpl.headerText.length}</span>/60</div>
                <button class="btn btn-outline-secondary btn-sm mt-1" onclick="Templates.addVariable('header')"><i class="fas fa-plus"></i> Add variable</button>
              </div>
              <div id="headerMediaField" style="display:${['image','video','document'].includes(tpl.headerType)?'block':'none'}">
                <div class="media-upload-zone mb-2" onclick="document.getElementById('headerMediaUpload').click()">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <p class="small mt-2 mb-0">Drag and drop to upload<br>Or choose files on your device</p>
                </div>
                <input type="file" id="headerMediaUpload" style="display:none" accept="image/*,video/*,.pdf,.doc,.docx" onchange="Templates.uploadHeaderMedia(this)">
                <input id="tplHeaderMediaUrl" class="form-control mb-2" value="${tpl.headerMediaUrl}" placeholder="Media URL" oninput="Templates.updatePreview()">
                <div id="headerMediaPreview">${tpl.headerMediaUrl ? `<img src="${tpl.headerMediaUrl}" style="max-width:100%;max-height:150px;border-radius:8px;margin-top:8px;">` : ''}</div>
              </div>
            </div>

            <!-- Body -->
            <label class="form-label small fw-bold mt-2">Body</label>
            <textarea id="tplBody" class="form-control mb-1" rows="5" placeholder="Enter text in English" oninput="Templates.updatePreview()">${tpl.body}</textarea>
            <div class="meta-char-count"><span id="bodyCount">${tpl.body.length}</span>/1024</div>
            <div class="d-flex gap-1 flex-wrap mt-1">
              <button class="btn btn-outline-secondary btn-sm" onclick="Templates.addVariable('body')"><i class="fas fa-plus"></i> Add variable</button>
              <button class="btn btn-outline-secondary btn-sm" onclick="Templates.insertFormatting('bold')"><i class="fas fa-bold"></i></button>
              <button class="btn btn-outline-secondary btn-sm" onclick="Templates.insertFormatting('italic')"><i class="fas fa-italic"></i></button>
              <button class="btn btn-outline-secondary btn-sm" onclick="Templates.insertFormatting('strike')"><i class="fas fa-strikethrough"></i></button>
              <button class="btn btn-outline-secondary btn-sm" onclick="Templates.insertFormatting('monospace')"><i class="fas fa-code"></i></button>
              <button class="btn btn-outline-secondary btn-sm" onclick="Templates.openEmojiPicker()"><i class="far fa-smile"></i></button>
            </div>

            <!-- Footer -->
            <label class="form-label small fw-bold mt-2">Footer <small class="text-muted">· Optional</small></label>
            <input id="tplFooter" class="form-control" value="${tpl.footer}" placeholder="Add a short line of text to the bottom of your message in English" oninput="Templates.updatePreview()">
            <div class="meta-char-count"><span id="footerCount">${tpl.footer.length}</span>/60</div>

            <!-- Buttons -->
            <div class="d-flex justify-content-between align-items-center mt-2">
              <label class="form-label small fw-bold mb-0">Buttons <small class="text-muted">· Optional</small></label>
              <button class="btn btn-outline-primary btn-sm" onclick="Templates.addButton()"><i class="fas fa-plus"></i> Add button</button>
            </div>
            <div class="small text-muted mb-2">Create buttons that let customers respond to your message or take action. You can add up to ten buttons. If you add more than three buttons, they will appear in a list.</div>
            <div id="buttonsContainer">
              ${this.buttons.map((b, i) => this.renderButtonRow(b, i)).join('')}
            </div>

            <!-- Validity Period -->
            <div class="mt-3 p-2 bg-light rounded">
              <label class="form-label small fw-bold">Message validity period</label>
              <div class="small text-muted mb-2">You can set a custom validity period that your message must be delivered by before it expires. If a message has not been delivered within this time frame, you will not be charged and your customer will not see the message.</div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="customValidity" onchange="Templates.toggleValidity()">
                <label class="form-check-label small" for="customValidity">Set custom validity period for your message</label>
              </div>
              <div id="validityOptions" style="display:none;" class="mt-2">
                <select class="form-select form-select-sm" style="width:auto;">
                  <option value="5">5 minutes</option>
                  <option value="10" selected>10 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="180">3 hours</option>
                  <option value="360">6 hours</option>
                  <option value="720">12 hours</option>
                  <option value="1440">24 hours</option>
                </select>
                <span class="small text-muted ms-2">Standard: ${tpl.category==='MARKETING'?'12 hours':'10 minutes'}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-3 d-flex gap-2 flex-wrap">
              <button class="btn btn-primary" onclick="Templates.saveTemplate()"><i class="fas fa-save me-1"></i> Save Draft</button>
              <button class="btn btn-warning" onclick="Templates.submitToMeta()"><i class="fas fa-paper-plane me-1"></i> Submit for Review</button>
              <button class="btn btn-light" onclick="Templates.render()">Cancel</button>
            </div>
          </div>

          <!-- Preview Column -->
          <div class="col-md-5">
            <label class="form-label small fw-bold">Template Preview</label>
            <div class="preview-panel" id="livePreview">
              ${this.generateLivePreview(tpl)}
            </div>
            <div class="mt-2 text-center">
              <span class="badge bg-${tpl.category==='MARKETING'?'warning':tpl.category==='UTILITY'?'info':'secondary'}">${tpl.category}</span>
              <span class="badge bg-secondary ms-1">${tpl.language || 'en'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    document.getElementById('templateBuilderContainer').innerHTML = html;
    setTimeout(() => this.attachPreviewListeners(), 100);
  },

  // ==================== RENDER BUTTON ROW ====================
  renderButtonRow(button, index) {
    const types = [
      { id: 'QUICK_REPLY', label: 'Quick Reply' },
      { id: 'URL', label: 'Visit Website' },
      { id: 'PHONE_NUMBER', label: 'Call Phone Number' },
      { id: 'COPY_CODE', label: 'Copy Code' }
    ];
    
    return `
      <div class="button-row border rounded p-2 mb-2" data-button-index="${index}">
        <select class="form-select form-select-sm" style="width:140px" onchange="Templates.updateButtonType(this, ${index})">
          ${types.map(t => `<option value="${t.id}" ${button.type===t.id?'selected':''}>${t.label}</option>`).join('')}
        </select>
        <input class="form-control form-control-sm" value="${button.text||''}" placeholder="Button text" maxlength="40" onchange="Templates.updateButtonText(this, ${index})">
        ${button.type === 'URL' ? `<input class="form-control form-control-sm" value="${button.url||''}" placeholder="https://example.com" onchange="Templates.updateButtonUrl(this, ${index})">` : ''}
        ${button.type === 'PHONE_NUMBER' ? `<input class="form-control form-control-sm" value="${button.phone_number||''}" placeholder="+91 1234567890" onchange="Templates.updateButtonPhone(this, ${index})">` : ''}
        ${button.type === 'COPY_CODE' ? `<input class="form-control form-control-sm" value="${button.example||''}" placeholder="Code to copy" onchange="Templates.updateButtonCode(this, ${index})">` : ''}
        <button class="btn-remove" onclick="Templates.removeButton(${index})">×</button>
      </div>
    `;
  },

  // ==================== BUILDER HELPERS ====================
  selectHeaderType(type) {
    this.headerType = type;
    document.querySelectorAll('.header-type-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-type="${type}"]`)?.classList.add('active');
    document.getElementById('headerFields').style.display = type === 'none' ? 'none' : 'block';
    document.getElementById('headerTextField').style.display = (type === 'text' || type === 'location') ? 'block' : 'none';
    document.getElementById('headerMediaField').style.display = ['image','video','document'].includes(type) ? 'block' : 'none';
    this.updatePreview();
  },

  setCategorySelect(category) {
    this.currentCategory = category;
    document.getElementById('catalogueSection').style.display = category === 'MARKETING' ? 'block' : 'none';
    document.getElementById('catalogueSetup').style.display = category === 'MARKETING' ? 'block' : 'none';
    this.updatePreview();
  },

  setCatalogueFormat(format) {
    this.currentCatalogueFormat = format;
    document.querySelectorAll('.catalogue-format-card').forEach(el => {
      el.classList.toggle('active', el.dataset.format === format);
    });
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
      document.getElementById('headerMediaPreview').innerHTML = `<img src="${url}" style="max-width:100%;max-height:150px;border-radius:8px;margin-top:8px;">`;
      this.headerMediaUrl = url;
      showToast('✅ Uploaded!', 'success');
      this.updatePreview();
    } catch(e) {
      showToast('Upload failed: ' + e.message, 'error');
    }
  },

  addVariable(target) {
    const varName = prompt('Enter variable name (e.g., customer_name, order_id):');
    if (!varName) return;
    let el = target === 'header' ? document.getElementById('tplHeaderText') : document.getElementById('tplBody');
    if (!el) return;
    const cursorPos = el.selectionStart;
    const text = el.value;
    const varText = `{{${varName}}}`;
    el.value = text.substring(0, cursorPos) + varText + text.substring(cursorPos);
    el.focus();
    el.selectionStart = el.selectionEnd = cursorPos + varText.length;
    this.updatePreview();
    this.updateCharCounts();
  },

  insertFormatting(type) {
    const el = document.getElementById('tplBody');
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.substring(start, end);
    let prefix, suffix;
    switch(type) {
      case 'bold': prefix = '*'; suffix = '*'; break;
      case 'italic': prefix = '_'; suffix = '_'; break;
      case 'strike': prefix = '~'; suffix = '~'; break;
      case 'monospace': prefix = '```'; suffix = '```'; break;
      default: return;
    }
    const newText = el.value.substring(0, start) + prefix + selected + suffix + el.value.substring(end);
    el.value = newText;
    el.focus();
    el.selectionStart = start + prefix.length;
    el.selectionEnd = end + prefix.length;
    this.updatePreview();
    this.updateCharCounts();
  },

  openEmojiPicker() {
    const emojis = ['😊','👍','❤️','🎉','🔥','⭐','✅','💯','🎯','💪','🙌','✨','🌟','💎','🚀','📱','💻','🛒','📦','🎁'];
    const emoji = prompt('Choose an emoji:\n' + emojis.join(' '), '😊');
    if (emoji) {
      const el = document.getElementById('tplBody');
      if (!el) return;
      const cursorPos = el.selectionStart;
      const text = el.value;
      el.value = text.substring(0, cursorPos) + emoji + text.substring(cursorPos);
      el.focus();
      el.selectionStart = el.selectionEnd = cursorPos + emoji.length;
      this.updatePreview();
      this.updateCharCounts();
    }
  },

  addButton() {
    if (this.buttons.length >= 10) {
      alert('Maximum 10 buttons allowed!');
      return;
    }
    const quickReplies = this.buttons.filter(b => b.type === 'QUICK_REPLY').length;
    if (quickReplies >= 3) {
      alert('Maximum 3 Quick Reply buttons allowed!');
      return;
    }
    this.buttons.push({ type: 'QUICK_REPLY', text: '' });
    this.renderButtons();
    this.updatePreview();
  },

  removeButton(index) {
    this.buttons.splice(index, 1);
    this.renderButtons();
    this.updatePreview();
  },

  updateButtonType(select, index) {
    this.buttons[index].type = select.value;
    if (select.value === 'URL') this.buttons[index].url = '';
    else if (select.value === 'PHONE_NUMBER') this.buttons[index].phone_number = '';
    else if (select.value === 'COPY_CODE') this.buttons[index].example = '';
    this.renderButtons();
    this.updatePreview();
  },

  updateButtonText(input, index) {
    this.buttons[index].text = input.value;
    this.updatePreview();
  },

  updateButtonUrl(input, index) {
    this.buttons[index].url = input.value;
    this.updatePreview();
  },

  updateButtonPhone(input, index) {
    this.buttons[index].phone_number = input.value;
    this.updatePreview();
  },

  updateButtonCode(input, index) {
    this.buttons[index].example = input.value;
    this.updatePreview();
  },

  renderButtons() {
    const container = document.getElementById('buttonsContainer');
    if (!container) return;
    if (this.buttons.length === 0) {
      container.innerHTML = '<div class="text-muted small py-2">No buttons added. Click "Add button" to create one.</div>';
      return;
    }
    container.innerHTML = this.buttons.map((b, i) => this.renderButtonRow(b, i)).join('');
  },

  toggleValidity() {
    const checked = document.getElementById('customValidity')?.checked;
    document.getElementById('validityOptions').style.display = checked ? 'block' : 'none';
  },

  // ==================== PREVIEW ====================
  attachPreviewListeners() {
    ['tplName', 'tplHeaderText', 'tplHeaderMediaUrl', 'tplBody', 'tplFooter'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => this.updatePreview());
    });
    this.updatePreview();
  },

  updatePreview() {
    const preview = document.getElementById('livePreview');
    if (!preview) return;

    const name = document.getElementById('tplName')?.value || '';
    const language = document.getElementById('tplLanguage')?.value || 'en';
    const headerType = this.headerType;
    const headerText = document.getElementById('tplHeaderText')?.value || '';
    const headerMediaUrl = document.getElementById('tplHeaderMediaUrl')?.value || this.headerMediaUrl;
    const body = document.getElementById('tplBody')?.value || '';
    const footer = document.getElementById('tplFooter')?.value || '';
    
    this.updateCharCounts();

    let html = '<div class="wa-preview">';
    
    if (headerType !== 'none') {
      if (headerType === 'text' && headerText) {
        html += `<div class="wa-header-text">${this.formatPreviewText(headerText)}</div>`;
      } else if (headerType === 'image' && headerMediaUrl) {
        html += `<img src="${headerMediaUrl}" class="wa-header-img" alt="Header" onerror="this.style.display='none'">`;
      } else if (headerType === 'video' && headerMediaUrl) {
        html += `<div class="wa-header-video"><i class="fas fa-play-circle" style="font-size:32px;"></i><br><small>Video</small></div>`;
      } else if (headerType === 'document' && headerMediaUrl) {
        html += `<div class="wa-header-doc"><i class="fas fa-file-pdf" style="font-size:24px;color:#ef4444;"></i><small>Document</small></div>`;
      } else if (headerType === 'location') {
        html += `<div class="wa-header-doc"><i class="fas fa-map-marker-alt" style="font-size:24px;color:#ef4444;"></i><small>${headerText || 'Location'}</small></div>`;
      }
    }
    
    html += `<div class="wa-body">${this.formatPreviewText(body) || 'Enter your message...'}</div>`;
    if (footer) html += `<div class="wa-footer">${footer}</div>`;
    
    const quickReplies = this.buttons.filter(b => b.type === 'QUICK_REPLY' && b.text);
    const actionButtons = this.buttons.filter(b => b.type !== 'QUICK_REPLY' && b.text);
    
    if (quickReplies.length > 0) {
      html += '<div class="d-flex flex-wrap gap-1 mt-1">';
      quickReplies.forEach(b => {
        html += `<span class="wa-btn quick-reply">${b.text}</span>`;
      });
      html += '</div>';
    }
    
    if (actionButtons.length > 0) {
      actionButtons.forEach(b => {
        if (b.type === 'URL') html += `<div class="wa-btn">🌐 ${b.text}</div>`;
        else if (b.type === 'PHONE_NUMBER') html += `<div class="wa-btn">📞 ${b.text}</div>`;
        else if (b.type === 'COPY_CODE') html += `<div class="wa-btn">📋 ${b.text}</div>`;
        else html += `<div class="wa-btn">${b.text}</div>`;
      });
    }
    
    const totalButtons = this.buttons.filter(b => b.text).length;
    if (totalButtons > 3) {
      html += `<div class="text-center mt-1" style="font-size:10px;color:#667781;">See all options</div>`;
    }
    
    html += '</div>';
    preview.innerHTML = html;
  },

  formatPreviewText(text) {
    return text
      .replace(/\{\{([^}]+)\}\}/g, '<span class="var">{{$1}}</span>')
      .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/~(.*?)~/g, '<del>$1</del>')
      .replace(/```(.*?)```/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  },

  generateLivePreview(tpl) {
    let html = '<div class="wa-preview">';
    if (tpl.headerType !== 'none') {
      if (tpl.headerType === 'text' && tpl.headerText) {
        html += `<div class="wa-header-text">${tpl.headerText}</div>`;
      } else if (tpl.headerType === 'image' && tpl.headerMediaUrl) {
        html += `<img src="${tpl.headerMediaUrl}" class="wa-header-img" alt="Header">`;
      } else if (tpl.headerType === 'video' && tpl.headerMediaUrl) {
        html += `<div class="wa-header-video"><i class="fas fa-play-circle" style="font-size:32px;"></i><br><small>Video</small></div>`;
      } else if (tpl.headerType === 'document' && tpl.headerMediaUrl) {
        html += `<div class="wa-header-doc"><i class="fas fa-file-pdf" style="font-size:24px;color:#ef4444;"></i><small>Document</small></div>`;
      } else if (tpl.headerType === 'location') {
        html += `<div class="wa-header-doc"><i class="fas fa-map-marker-alt" style="font-size:24px;color:#ef4444;"></i><small>${tpl.headerText || 'Location'}</small></div>`;
      }
    }
    html += `<div class="wa-body">${tpl.body || 'Enter your message...'}</div>`;
    if (tpl.footer) html += `<div class="wa-footer">${tpl.footer}</div>`;
    tpl.buttons.forEach(b => {
      if (b.text) {
        if (b.type === 'QUICK_REPLY') html += `<span class="wa-btn quick-reply">${b.text}</span>`;
        else if (b.type === 'URL') html += `<div class="wa-btn">🌐 ${b.text}</div>`;
        else if (b.type === 'PHONE_NUMBER') html += `<div class="wa-btn">📞 ${b.text}</div>`;
        else if (b.type === 'COPY_CODE') html += `<div class="wa-btn">📋 ${b.text}</div>`;
      }
    });
    html += '</div>';
    return html;
  },

  updateCharCounts() {
    const name = document.getElementById('tplName')?.value || '';
    const header = document.getElementById('tplHeaderText')?.value || '';
    const body = document.getElementById('tplBody')?.value || '';
    const footer = document.getElementById('tplFooter')?.value || '';
    document.getElementById('nameCount').textContent = name.length;
    document.getElementById('headerCount').textContent = header.length;
    document.getElementById('bodyCount').textContent = body.length;
    document.getElementById('footerCount').textContent = footer.length;
  },

  // ==================== SAVE TEMPLATE ====================
  async saveTemplate() {
    const name = document.getElementById('tplName')?.value?.trim();
    const body = document.getElementById('tplBody')?.value?.trim();
    
    if (!name) return alert('Template name is required!');
    if (!body) return alert('Body content is required!');
    
    const components = [];
    
    // Header
    if (this.headerType !== 'none') {
      const headerComp = { type: 'HEADER' };
      if (this.headerType === 'text' || this.headerType === 'location') {
        headerComp.format = 'TEXT';
        headerComp.text = document.getElementById('tplHeaderText')?.value || '';
      } else if (['image', 'video', 'document'].includes(this.headerType)) {
        headerComp.format = this.headerType.toUpperCase();
        const mediaUrl = document.getElementById('tplHeaderMediaUrl')?.value || this.headerMediaUrl;
        if (mediaUrl) {
          headerComp.example = { header_handle: [mediaUrl] };
        }
      }
      if (headerComp.text || headerComp.example) {
        components.push(headerComp);
      }
    }
    
    // Body
    components.push({ type: 'BODY', text: body });
    
    // Footer
    const footer = document.getElementById('tplFooter')?.value?.trim();
    if (footer) components.push({ type: 'FOOTER', text: footer });
    
    // Buttons
    const validButtons = this.buttons.filter(b => b.text?.trim());
    if (validButtons.length > 0) {
      const buttons = validButtons.map(b => {
        const btn = { type: b.type, text: b.text.trim() };
        if (b.type === 'URL') btn.url = b.url || '';
        else if (b.type === 'PHONE_NUMBER') btn.phone_number = b.phone_number || '';
        else if (b.type === 'COPY_CODE') btn.example = b.example || '';
        return btn;
      });
      components.push({ type: 'BUTTONS', buttons });
    }
    
    const data = {
      name: name.toLowerCase().replace(/[^a-z0-9_]/g, '_').substring(0, 60),
      category: document.getElementById('tplCategory')?.value || 'UTILITY',
      language: document.getElementById('tplLanguage')?.value || 'en_US',
      components,
      clientId: getCurrentClientId(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
      if (this.editingId) {
        await db.collection('templates').doc(this.editingId).update(data);
        alert('✅ Template updated!');
      } else {
        data.metaStatus = 'DRAFT';
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('templates').add(data);
        alert('✅ Template saved as draft!');
      }
      this.render();
    } catch (err) { alert('Error: ' + err.message); }
  },

  // ==================== SUBMIT TO META ====================
  async submitToMeta() {
    const name = document.getElementById('tplName')?.value?.trim();
    if (!name) return alert('Template name is required!');
    
    // Save first
    await this.saveTemplate();
    
    // Then submit
    const doc = await db.collection('templates').where('name', '==', name.toLowerCase().replace(/[^a-z0-9_]/g, '_').substring(0, 60)).get();
    if (doc.empty) return alert('Template not found. Please save first.');
    
    const tpl = doc.docs[0].data();
    const cfg = (await db.collection('settings').doc('whatsapp').get()).data();
    if (!cfg?.accessToken) return alert('WhatsApp not configured.');

    const payload = {
      name: tpl.name,
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
        await doc.docs[0].ref.update({
          metaTemplateId: result.id,
          metaStatus: result.status || 'PENDING',
          submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert('✅ Submitted for review!');
        await this.fetchFromMeta();
        this.render();
      } else {
        alert('❌ ' + JSON.stringify(result.error || result));
      }
    } catch (err) { alert('Error: ' + err.message); }
  }
};
