// ==========================================
// js/templates.js — Advanced Meta WhatsApp Template Manager
// COMPLETE UPGRADE - All existing features preserved
// FIXED: Dynamic WABA ID for Meta Sync & Submission
// FIXED: Media header_text removed for IMAGE/VIDEO/DOCUMENT
// FIXED: Extra try block removed from fetchFromMeta
// FIXED: sendTemplate language fallback
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

  // ==================== GET CONFIG ====================
  async getConfig() {
    const doc = await db.collection('settings').doc('whatsapp').get();
    return doc.data() || {};
  },

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
        
        .wa-preview { 
          background: #e5ddd5; 
          border-radius: 8px; 
          padding: 12px; 
          max-width: 320px; 
          margin: 0 auto; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .wa-preview .wa-header-img { width: 100%; border-radius: 4px; margin-bottom: 6px; max-height: 200px; object-fit: cover; }
        .wa-preview .wa-header-video { width: 100%; border-radius: 4px; margin-bottom: 6px; background: #000; padding: 20px; text-align: center; color: #fff; }
        .wa-preview .wa-header-doc { background: #fff; border-radius: 4px; padding: 8px; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; border: 1px solid #e4e7ec; }
        .wa-preview .wa-header-text { font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #111b21; }
        .wa-preview .wa-body { font-size: 13px; color: #111b21; white-space: pre-wrap; line-height: 1.4; word-break: break-word; }
        .wa-preview .wa-body .var { color: #1a73e8; font-weight: 500; background: #e8f0fe; padding: 0 4px; border-radius: 3px; }
        .wa-preview .wa-footer { font-size: 11px; color: #667781; margin-top: 4px; }
        .wa-preview .wa-btn { 
          display: block; 
          text-align: center; 
          padding: 8px 12px; 
          border-radius: 20px; 
          font-size: 12px; 
          font-weight: 600; 
          margin-top: 4px; 
          background: #fff; 
          color: #008069; 
          border: 1px solid #008069; 
          cursor: default;
        }
        .wa-preview .wa-btn.quick-reply { 
          display: inline-block; 
          margin-right: 4px; 
          border-radius: 16px; 
          padding: 4px 14px; 
          font-size: 11px; 
          background: #e8f0fe;
          border: none;
          color: #1a73e8;
        }
        .wa-preview .wa-time { font-size: 11px; color: #667781; text-align: right; margin-top: 4px; }
        .wa-preview .wa-btn-group { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
        
        .tab-btn { border: none; background: transparent; padding: 8px 16px; border-radius: 20px; font-size: 13px; cursor: pointer; color: #5f6368; }
        .tab-btn.active { background: #e8f0fe; color: #1a73e8; font-weight: 600; }
        .filter-chip { display: inline-block; padding: 4px 10px; border-radius: 16px; font-size: 11px; cursor: pointer; border: 1px solid #dadce0; margin: 2px; }
        .filter-chip.active { background: #1a73e8; color: #fff; border-color: #1a73e8; }
        
        .status-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; display: inline-block; }
        .status-badge.approved { background: #e6f4ea; color: #1e7e34; }
        .status-badge.pending { background: #fef7e0; color: #b65c00; }
        .status-badge.rejected { background: #fce8e6; color: #c62828; }
        .status-badge.paused { background: #fff3e0; color: #e65100; }
        .status-badge.disabled { background: #f5f5f5; color: #757575; }
        .status-badge.draft { background: #f1f3f4; color: #5f6368; }
        
        .template-builder { 
          background: #fff; 
          border-radius: 16px; 
          padding: 24px; 
          margin-top: 16px; 
          max-height: 90vh; 
          overflow-y: auto;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .meta-label { display: block; font-size: 13px; font-weight: 600; color: #1a1a2e; margin-bottom: 4px; }
        .meta-label small { font-weight: 400; color: #5f6368; }
        .meta-input { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
        .meta-input:focus { border-color: #1a73e8; outline: none; box-shadow: 0 0 0 3px rgba(26,115,232,0.15); }
        .meta-textarea { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; min-height: 100px; resize: vertical; font-family: inherit; }
        .meta-textarea:focus { border-color: #1a73e8; outline: none; box-shadow: 0 0 0 3px rgba(26,115,232,0.15); }
        .meta-select { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: #fff; }
        .meta-char-count { font-size: 12px; color: #5f6368; text-align: right; margin-top: 2px; }
        .header-type-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; margin: 8px 0 12px 0; }
        @media (max-width: 768px) { .header-type-grid { grid-template-columns: repeat(3, 1fr); } }
        .header-type-btn { 
          border: 2px solid #e4e7ec; 
          background: #fff; 
          padding: 10px 8px; 
          border-radius: 10px; 
          cursor: pointer; 
          text-align: center; 
          transition: all 0.2s;
          min-height: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .header-type-btn:hover { border-color: #1a73e8; background: #f8f9fa; }
        .header-type-btn.active { border-color: #1a73e8; background: #e8f0fe; }
        .header-type-btn i { font-size: 20px; color: #1a73e8; margin-bottom: 2px; }
        .header-type-btn span { font-size: 10px; color: #5f6368; }
        .media-upload-zone { 
          border: 2px dashed #d1d5db; 
          border-radius: 10px; 
          padding: 24px; 
          text-align: center; 
          cursor: pointer; 
          transition: all 0.2s;
          background: #fafbfc;
        }
        .media-upload-zone:hover { border-color: #1a73e8; background: #f8f9fa; }
        .media-upload-zone i { font-size: 32px; color: #1a73e8; }
        .media-upload-zone p { margin: 4px 0 0 0; font-size: 13px; color: #5f6368; }
        .button-row { 
          display: flex; 
          flex-wrap: wrap; 
          gap: 8px; 
          align-items: center; 
          padding: 10px 12px; 
          background: #f8f9fa; 
          border-radius: 8px; 
          margin-bottom: 8px; 
          border: 1px solid #e4e7ec;
        }
        .button-row select, .button-row input { flex: 1; min-width: 100px; }
        .btn-remove { color: #d93025; background: none; border: none; font-size: 18px; cursor: pointer; padding: 0 6px; }
        .btn-remove:hover { color: #b31412; }
        .btn-meta-primary { background: #1a73e8; color: #fff; border: none; padding: 8px 20px; border-radius: 8px; font-weight: 500; cursor: pointer; }
        .btn-meta-primary:hover { background: #1557b0; }
        .btn-meta-secondary { background: #f1f3f4; color: #1a1a2e; border: 1px solid #d1d5db; padding: 8px 20px; border-radius: 8px; font-weight: 500; cursor: pointer; }
        .btn-meta-secondary:hover { background: #e8eaed; }
        .btn-meta-warning { background: #fbbc04; color: #1a1a2e; border: none; padding: 8px 20px; border-radius: 8px; font-weight: 500; cursor: pointer; }
        .btn-meta-warning:hover { background: #e5a800; }
        .preview-panel { background: #f0f2f5; border-radius: 12px; padding: 16px; max-width: 360px; margin: 0 auto; }
        .catalogue-format-card { 
          border: 2px solid #e4e7ec; 
          border-radius: 10px; 
          padding: 12px; 
          cursor: pointer; 
          transition: all 0.2s;
          background: #fff;
        }
        .catalogue-format-card:hover { border-color: #1a73e8; }
        .catalogue-format-card.active { border-color: #1a73e8; background: #e8f0fe; }
        .catalogue-format-card h6 { font-weight: 600; color: #1a1a2e; margin-bottom: 2px; }
        .catalogue-format-card p { font-size: 13px; color: #5f6368; margin: 0; }
        .category-btn { transition: all 0.2s; }
        .category-btn.active { border-color: #1a73e8 !important; background: #e8f0fe !important; }
        .meta-scroll { max-height: 70vh; overflow-y: auto; }
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
          <button class="btn btn-outline-primary btn-sm ms-auto" onclick="Templates.fetchFromMeta().then(()=>Templates.render())">
            <i class="fas fa-sync-alt me-1"></i> Sync
          </button>
          <button class="btn btn-primary btn-sm" onclick="Templates.showBuilder()">
            <i class="fas fa-plus me-1"></i> Create
          </button>
        </div>

        <div class="row g-2">
          <div class="col-md-7">
            <div class="meta-scroll">
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
        html += `<div class="wa-header-text">${this.escapeHtml(header.text)}</div>`;
      }
    }
    
    if (body) {
      html += `<div class="wa-body">${this.highlightVariables(body.text || '')}</div>`;
    }
    
    if (footer) {
      html += `<div class="wa-footer">${this.escapeHtml(footer.text)}</div>`;
    }
    
    if (buttons && buttons.buttons) {
      const quickReplies = buttons.buttons.filter(b => b.type === 'QUICK_REPLY');
      const actionButtons = buttons.buttons.filter(b => b.type !== 'QUICK_REPLY');
      
      if (quickReplies.length > 0) {
        html += '<div class="wa-btn-group">';
        quickReplies.forEach(b => {
          html += `<span class="wa-btn quick-reply">${this.escapeHtml(b.text)}</span>`;
        });
        html += '</div>';
      }
      
      if (actionButtons.length > 0) {
        actionButtons.forEach(b => {
          if (b.type === 'URL') html += `<div class="wa-btn">🌐 ${this.escapeHtml(b.text || 'Visit')}</div>`;
          else if (b.type === 'PHONE_NUMBER') html += `<div class="wa-btn">📞 ${this.escapeHtml(b.text || 'Call')}</div>`;
          else if (b.type === 'COPY_CODE') html += `<div class="wa-btn">📋 ${this.escapeHtml(b.text || 'Copy')}</div>`;
          else html += `<div class="wa-btn">${this.escapeHtml(b.text)}</div>`;
        });
      }
    }
    
    html += `<div class="wa-time">${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>`;
    html += '</div>';
    return html;
  },

  highlightVariables(text) {
    return text.replace(/\{\{(\d+)\}\}/g, '<span class="var">{{$1}}</span>');
  },

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // ==================== SYNC FROM META (FIXED - Dynamic WABA ID) ====================
  async fetchFromMeta() {
    const cfg = await this.getConfig();
    if (!cfg?.accessToken) {
      console.warn('WhatsApp not configured — no access token');
      return;
    }
    
    const wabaId = cfg.wabaId || cfg.businessAccountId || cfg.phoneNumberId;
    
    if (!wabaId) {
      console.warn('No WABA ID or Phone Number ID configured');
      showToast('❌ WhatsApp Business Account ID not found in settings', 'error');
      return;
    }

    try {
      console.log('🔄 Syncing templates from Meta using ID:', wabaId);
      
      const res = await fetch(
        `https://graph.facebook.com/v22.0/${wabaId}/message_templates?limit=100`,
        {
          headers: { 'Authorization': 'Bearer ' + cfg.accessToken }
        }
      );
      const result = await res.json();
      
      if (res.ok && result.data) {
        let syncCount = 0;
        for (const mt of result.data) {
          const existing = await db.collection('templates').where('name', '==', mt.name).get();
          const data = {
            name: mt.name,
            category: mt.category,
            language: mt.language,
            metaTemplateId: mt.id,
            metaStatus: mt.status,
            components: mt.components || [],
            clientId: getCurrentClientId(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          };
          if (existing.empty) {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('templates').add(data);
          } else {
            await existing.docs[0].ref.update(data);
          }
          syncCount++;
        }
        showToast(`✅ Synced ${syncCount} templates from Meta`, 'success');
        console.log(`✅ ${syncCount} templates synced`);
      } else {
        console.error('❌ Sync failed:', result);
        if (result.error) {
          showToast('❌ Sync failed: ' + (result.error.message || 'Unknown error'), 'error');
        }
      }
    } catch (err) { 
      console.error('Sync error:', err);
      showToast('❌ Sync failed: ' + err.message, 'error');
    }
  },

  // ==================== SEND TEMPLATE (FIXED) ====================
  async sendTemplate(id) {
    let phone = prompt('Enter phone number (with country code):');
    if (!phone) return;
    phone = phone.replace(/[^0-9]/g, '');
    
    const doc = await db.collection('templates').doc(id).get();
    const tpl = doc.data();
    const cfg = await this.getConfig();
    
    if (!cfg?.phoneNumberId || !cfg?.accessToken) {
      return alert('WhatsApp not configured. Please set up WhatsApp settings first.');
    }
    
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: phone,
        type: 'template',
        template: {
          name: tpl.name,
          language: { code: tpl.language || 'en' }
        }
      };

      const components = tpl.components || [];
      const body = components.find(c => c.type === 'BODY');
      const header = components.find(c => c.type === 'HEADER');
      const buttons = components.find(c => c.type === 'BUTTONS');
      
      const templateComponents = [];

      // Header with media — only if example exists
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
      // Header with text variables — only if variables exist
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

      // Body variables — only if variables exist
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

      // Button URL variables
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
        showToast('✅ Template sent! Message ID: ' + (result.messages?.[0]?.id || 'N/A'), 'success');
      } else {
        const errorMsg = result.error?.message || 'Unknown error';
        showToast('❌ Failed: ' + errorMsg, 'error');
        console.error('Send error:', result);
      }
    } catch (err) { 
      showToast('❌ Error: ' + err.message, 'error');
    }
  },

  // ==================== DELETE TEMPLATE ====================
  async deleteTemplate(id) {
    if (!confirm('Are you sure you want to delete this template?')) return;
    await db.collection('templates').doc(id).delete();
    showToast('✅ Template deleted.', 'success');
    this.render();
  },

  // ==================== SHOW BUILDER ====================
  async showBuilder(editId = null) {
    this.editingId = editId;
    this.buttons = [];
    this.headerType = 'none';
    this.headerText = '';
    this.headerMediaUrl = '';
    this.bodyText = '';
    this.footerText = '';
    
    let tpl = {
      name: '',
      category: 'UTILITY',
      language: 'en',
      headerType: 'none',
      headerText: '',
      headerMediaUrl: '',
      body: '',
      footer: '',
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
          name: d.name,
          category: d.category,
          language: d.language,
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
        this.headerText = tpl.headerText;
        this.bodyText = tpl.body;
        this.footerText = tpl.footer;
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
          <h5>${editId ? 'Edit Template' : 'Create Template'}</h5>
          <button class="btn btn-light btn-sm" onclick="Templates.render()">✕</button>
        </div>
        
        <div class="row g-4">
          <div class="col-md-7">
            <div class="mb-3">
              <label class="meta-label">Template name and language</label>
              <div class="row g-2">
                <div class="col-md-8">
                  <input id="tplName" class="meta-input" value="${this.escapeHtml(tpl.name)}" placeholder="Enter a template name" oninput="Templates.updatePreview()">
                  <div class="meta-char-count"><span id="nameCount">${tpl.name.length}</span>/512</div>
                </div>
                <div class="col-md-4">
                  <select id="tplLanguage" class="meta-select" onchange="Templates.updatePreview()">
                    <option value="en" ${tpl.language==='en'?'selected':''}>English</option>
                    <option value="en_US" ${tpl.language==='en_US'?'selected':''}>English (US)</option>
                    <option value="en_GB" ${tpl.language==='en_GB'?'selected':''}>English (UK)</option>
                    <option value="hi" ${tpl.language==='hi'?'selected':''}>Hindi</option>
                    <option value="es" ${tpl.language==='es'?'selected':''}>Spanish</option>
                    <option value="fr" ${tpl.language==='fr'?'selected':''}>French</option>
                    <option value="ar" ${tpl.language==='ar'?'selected':''}>Arabic</option>
                    <option value="pt_BR" ${tpl.language==='pt_BR'?'selected':''}>Portuguese (BR)</option>
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
            </div>

            <div class="mb-3">
              <label class="meta-label">Category</label>
              <div class="row g-2">
                <div class="col-md-4">
                  <button class="meta-select category-btn ${tpl.category==='UTILITY'?'active':''}" style="text-align:left;padding:10px 12px;" onclick="Templates.setCategorySelect('UTILITY')" data-cat="UTILITY">
                    <i class="fas fa-tools me-2"></i> Utility
                  </button>
                </div>
                <div class="col-md-4">
                  <button class="meta-select category-btn ${tpl.category==='MARKETING'?'active':''}" style="text-align:left;padding:10px 12px;" onclick="Templates.setCategorySelect('MARKETING')" data-cat="MARKETING">
                    <i class="fas fa-bullhorn me-2"></i> Marketing
                  </button>
                </div>
                <div class="col-md-4">
                  <button class="meta-select category-btn ${tpl.category==='AUTHENTICATION'?'active':''}" style="text-align:left;padding:10px 12px;" onclick="Templates.setCategorySelect('AUTHENTICATION')" data-cat="AUTHENTICATION">
                    <i class="fas fa-shield-alt me-2"></i> Authentication
                  </button>
                </div>
              </div>
            </div>

            <div id="catalogueSection" style="display:${tpl.category==='MARKETING'?'block':'none'}" class="mb-3">
              <label class="meta-label">Catalogue format</label>
              <div class="row g-2">
                <div class="col-md-6">
                  <div class="catalogue-format-card ${this.currentCatalogueFormat==='catalogue'?'active':''}" onclick="Templates.setCatalogueFormat('catalogue')">
                    <h6><i class="fas fa-th-list me-2"></i> Catalogue message</h6>
                    <p>Include the entire catalogue to give your users a comprehensive view of all of your products.</p>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="catalogue-format-card ${this.currentCatalogueFormat==='multi'?'active':''}" onclick="Templates.setCatalogueFormat('multi')">
                    <h6><i class="fas fa-th me-2"></i> Multi-product message</h6>
                    <p>Include up to 30 products from the catalogue. Useful for showcasing new collection or a specific product category.</p>
                  </div>
                </div>
              </div>
              <div id="catalogueSetup" class="mt-2 p-3 bg-light rounded" style="display:${tpl.category==='MARKETING'?'block':'none'}">
                <p class="small text-muted mb-2"><i class="fas fa-info-circle me-1"></i> Connecting a catalogue will allow customers to view, message and send carts containing your products and services via WhatsApp.</p>
                <button class="btn btn-outline-primary btn-sm" onclick="alert('Manage catalogue connection')"><i class="fas fa-link me-1"></i> Manage catalogue connection</button>
              </div>
            </div>

            <div class="mb-2">
              <label class="meta-label">Header <small>· Optional</small></label>
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
                  <input id="tplHeaderText" class="meta-input" value="${this.escapeHtml(tpl.headerText)}" placeholder="${tpl.headerType==='location'?'Location name':'Add a short line of text to the header of your message in English'}" oninput="Templates.updatePreview()">
                  <div class="meta-char-count"><span id="headerCount">${tpl.headerText.length}</span>/60</div>
                  <button class="btn btn-outline-secondary btn-sm mt-1" onclick="Templates.addVariable('header')"><i class="fas fa-plus"></i> Add variable</button>
                </div>
                <div id="headerMediaField" style="display:${['image','video','document'].includes(tpl.headerType)?'block':'none'}">
                  <div class="media-upload-zone" onclick="document.getElementById('headerMediaUpload').click()">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Drag and drop to upload<br>Or choose files on your device</p>
                  </div>
                  <input type="file" id="headerMediaUpload" style="display:none" accept="image/*,video/*,.pdf,.doc,.docx" onchange="Templates.uploadHeaderMedia(this)">
                  <input id="tplHeaderMediaUrl" class="meta-input mt-2" value="${this.escapeHtml(tpl.headerMediaUrl)}" placeholder="Media URL" oninput="Templates.updatePreview()">
                  <div id="headerMediaPreview">${tpl.headerMediaUrl ? `<img src="${tpl.headerMediaUrl}" style="max-width:100%;max-height:150px;border-radius:8px;margin-top:8px;">` : ''}</div>
                </div>
              </div>
            </div>

            <div class="mb-2">
              <label class="meta-label">Body</label>
              <textarea id="tplBody" class="meta-textarea" placeholder="Enter text in English" oninput="Templates.updatePreview()">${this.escapeHtml(tpl.body)}</textarea>
              <div class="meta-char-count"><span id="bodyCount">${tpl.body.length}</span>/1024</div>
              <div class="d-flex gap-1 flex-wrap mt-1">
                <button class="btn btn-outline-secondary btn-sm" onclick="Templates.addVariable('body')"><i class="fas fa-plus"></i> Add variable</button>
                <button class="btn btn-outline-secondary btn-sm" onclick="Templates.insertFormatting('bold')"><i class="fas fa-bold"></i></button>
                <button class="btn btn-outline-secondary btn-sm" onclick="Templates.insertFormatting('italic')"><i class="fas fa-italic"></i></button>
                <button class="btn btn-outline-secondary btn-sm" onclick="Templates.insertFormatting('strike')"><i class="fas fa-strikethrough"></i></button>
                <button class="btn btn-outline-secondary btn-sm" onclick="Templates.insertFormatting('monospace')"><i class="fas fa-code"></i></button>
                <button class="btn btn-outline-secondary btn-sm" onclick="Templates.openEmojiPicker()"><i class="far fa-smile"></i></button>
              </div>
            </div>

            <div class="mb-2">
              <label class="meta-label">Footer <small>· Optional</small></label>
              <input id="tplFooter" class="meta-input" value="${this.escapeHtml(tpl.footer)}" placeholder="Add a short line of text to the bottom of your message in English" oninput="Templates.updatePreview()">
              <div class="meta-char-count"><span id="footerCount">${tpl.footer.length}</span>/60</div>
            </div>

            <div class="mb-2">
              <div class="d-flex justify-content-between align-items-center">
                <label class="meta-label mb-0">Buttons <small>· Optional</small></label>
                <button class="btn btn-outline-primary btn-sm" onclick="Templates.addButton()"><i class="fas fa-plus"></i> Add button</button>
              </div>
              <div class="small text-muted mb-2">Create buttons that let customers respond to your message or take action. You can add up to ten buttons. If you add more than three buttons, they will appear in a list.</div>
              <div id="buttonsContainer">
                ${this.buttons.map((b, i) => this.renderButtonRow(b, i)).join('')}
                ${this.buttons.length === 0 ? '<div class="text-muted small py-2">No buttons added.</div>' : ''}
              </div>
            </div>

            <div class="mb-2 p-3 bg-light rounded">
              <label class="meta-label">Message validity period</label>
              <div class="small text-muted mb-2">You can set a custom validity period that your message must be delivered by before it expires. If a message has not been delivered within this time frame, you will not be charged and your customer will not see the message.</div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="customValidity" onchange="Templates.toggleValidity()">
                <label class="form-check-label small" for="customValidity">Set custom validity period for your message</label>
              </div>
              <div id="validityOptions" style="display:none;" class="mt-2">
                <select class="meta-select" style="width:auto;">
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

            <div class="d-flex gap-2 mt-3 flex-wrap">
              <button class="btn btn-primary" onclick="Templates.saveTemplate()"><i class="fas fa-save me-1"></i> Save Draft</button>
              <button class="btn btn-warning" onclick="Templates.submitToMeta()"><i class="fas fa-paper-plane me-1"></i> Submit for Review</button>
              <button class="btn btn-light" onclick="Templates.render()"><i class="fas fa-times me-1"></i> Cancel</button>
            </div>
          </div>

          <div class="col-md-5">
            <label class="meta-label">Template preview</label>
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
      <div class="button-row" data-button-index="${index}">
        <select class="form-select form-select-sm" style="width:140px" onchange="Templates.updateButtonType(this, ${index})">
          ${types.map(t => `<option value="${t.id}" ${button.type===t.id?'selected':''}>${t.label}</option>`).join('')}
        </select>
        <input class="form-control form-control-sm" value="${this.escapeHtml(button.text||'')}" placeholder="Button text" maxlength="40" onchange="Templates.updateButtonText(this, ${index})">
        ${button.type === 'URL' ? `<input class="form-control form-control-sm" value="${this.escapeHtml(button.url||'')}" placeholder="https://example.com" onchange="Templates.updateButtonUrl(this, ${index})">` : ''}
        ${button.type === 'PHONE_NUMBER' ? `<input class="form-control form-control-sm" value="${this.escapeHtml(button.phone_number||'')}" placeholder="+91 1234567890" onchange="Templates.updateButtonPhone(this, ${index})">` : ''}
        ${button.type === 'COPY_CODE' ? `<input class="form-control form-control-sm" value="${this.escapeHtml(button.example||'')}" placeholder="Code to copy" onchange="Templates.updateButtonCode(this, ${index})">` : ''}
        <button class="btn-remove" onclick="Templates.removeButton(${index})">×</button>
      </div>
    `;
  },

  // ==================== BUILDER HELPERS ====================
  selectHeaderType(type) {
    this.headerType = type;
    document.querySelectorAll('.header-type-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-type="${type}"]`)?.classList.add('active');
    const fields = document.getElementById('headerFields');
    if (fields) fields.style.display = type === 'none' ? 'none' : 'block';
    const textField = document.getElementById('headerTextField');
    if (textField) textField.style.display = (type === 'text' || type === 'location') ? 'block' : 'none';
    const mediaField = document.getElementById('headerMediaField');
    if (mediaField) mediaField.style.display = ['image','video','document'].includes(type) ? 'block' : 'none';
    this.updatePreview();
  },

  setCategorySelect(category) {
    this.currentCategory = category;
    document.querySelectorAll('.category-btn').forEach(el => {
      el.classList.toggle('active', el.dataset.cat === category);
    });
    const section = document.getElementById('catalogueSection');
    if (section) section.style.display = category === 'MARKETING' ? 'block' : 'none';
    const setup = document.getElementById('catalogueSetup');
    if (setup) setup.style.display = category === 'MARKETING' ? 'block' : 'none';
    this.updatePreview();
  },

  setCatalogueFormat(format) {
    this.currentCatalogueFormat = format;
    document.querySelectorAll('.catalogue-format-card').forEach(el => {
      el.classList.toggle('active', el.dataset.format === format);
    });
    this.updatePreview();
  },

  // ==================== UPLOAD HEADER MEDIA ====================
  async uploadHeaderMedia(input) {
    const file = input.files[0];
    if (!file) return;
    
    const maxSize = file.type.startsWith('video/') ? 16 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast(`❌ File too large. Max ${maxSize/1024/1024}MB`, 'error');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/mov', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      showToast(`❌ Unsupported file type: ${file.type}`, 'error');
      return;
    }

    try {
      showToast('Uploading...', 'info');
      
      const path = `templates/headers/${getCurrentClientId() || 'system'}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const ref = storage.ref(path);
      
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: getCurrentClientId() || 'system',
          uploadedAt: new Date().toISOString(),
          originalName: file.name
        }
      };
      
      const snapshot = await ref.put(file, metadata);
      const url = await snapshot.ref.getDownloadURL();
      
      const urlInput = document.getElementById('tplHeaderMediaUrl');
      if (urlInput) urlInput.value = url;
      
      const preview = document.getElementById('headerMediaPreview');
      if (preview) {
        if (file.type.startsWith('image/')) {
          preview.innerHTML = `<img src="${url}" style="max-width:100%;max-height:150px;border-radius:8px;margin-top:8px;" alt="Header preview">`;
        } else if (file.type.startsWith('video/')) {
          preview.innerHTML = `<video src="${url}" style="max-width:100%;max-height:150px;border-radius:8px;margin-top:8px;" controls></video>`;
        } else {
          preview.innerHTML = `<div class="border rounded p-3 mt-2 bg-light"><i class="fas fa-file me-2"></i>${file.name}</div>`;
        }
      }
      
      this.headerMediaUrl = url;
      this.headerMediaFile = file;
      showToast('✅ Media uploaded successfully!', 'success');
      this.updatePreview();
      
    } catch(e) {
      console.error('Upload error:', e);
      if (e.code === 'storage/unauthorized') {
        showToast('❌ Permission denied. Check Firebase Storage rules.', 'error');
      } else {
        showToast('❌ Upload failed: ' + e.message, 'error');
      }
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
      showToast('❌ Maximum 10 buttons allowed!', 'error');
      return;
    }
    const quickReplies = this.buttons.filter(b => b.type === 'QUICK_REPLY').length;
    if (quickReplies >= 3) {
      showToast('❌ Maximum 3 Quick Reply buttons allowed!', 'error');
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
      container.innerHTML = '<div class="text-muted small py-2">No buttons added.</div>';
      return;
    }
    container.innerHTML = this.buttons.map((b, i) => this.renderButtonRow(b, i)).join('');
  },

  toggleValidity() {
    const checked = document.getElementById('customValidity')?.checked;
    const options = document.getElementById('validityOptions');
    if (options) options.style.display = checked ? 'block' : 'none';
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
    if (footer) html += `<div class="wa-footer">${this.escapeHtml(footer)}</div>`;
    
    const quickReplies = this.buttons.filter(b => b.type === 'QUICK_REPLY' && b.text);
    const actionButtons = this.buttons.filter(b => b.type !== 'QUICK_REPLY' && b.text);
    
    if (quickReplies.length > 0) {
      html += '<div class="wa-btn-group">';
      quickReplies.forEach(b => {
        html += `<span class="wa-btn quick-reply">${this.escapeHtml(b.text)}</span>`;
      });
      html += '</div>';
    }
    
    if (actionButtons.length > 0) {
      actionButtons.forEach(b => {
        if (b.type === 'URL') html += `<div class="wa-btn">🌐 ${this.escapeHtml(b.text)}</div>`;
        else if (b.type === 'PHONE_NUMBER') html += `<div class="wa-btn">📞 ${this.escapeHtml(b.text)}</div>`;
        else if (b.type === 'COPY_CODE') html += `<div class="wa-btn">📋 ${this.escapeHtml(b.text)}</div>`;
        else html += `<div class="wa-btn">${this.escapeHtml(b.text)}</div>`;
      });
    }
    
    const totalButtons = this.buttons.filter(b => b.text).length;
    if (totalButtons > 3) {
      html += `<div class="text-center mt-1" style="font-size:10px;color:#667781;">See all options</div>`;
    }
    
    html += `<div class="wa-time">${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>`;
    html += '</div>';
    preview.innerHTML = html;
  },

  formatPreviewText(text) {
    if (!text) return '';
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
        html += `<div class="wa-header-text">${this.escapeHtml(tpl.headerText)}</div>`;
      } else if (tpl.headerType === 'image' && tpl.headerMediaUrl) {
        html += `<img src="${tpl.headerMediaUrl}" class="wa-header-img" alt="Header">`;
      } else if (tpl.headerType === 'video' && tpl.headerMediaUrl) {
        html += `<div class="wa-header-video"><i class="fas fa-play-circle" style="font-size:32px;"></i><br><small>Video</small></div>`;
      } else if (tpl.headerType === 'document' && tpl.headerMediaUrl) {
        html += `<div class="wa-header-doc"><i class="fas fa-file-pdf" style="font-size:24px;color:#ef4444;"></i><small>Document</small></div>`;
      } else if (tpl.headerType === 'location') {
        html += `<div class="wa-header-doc"><i class="fas fa-map-marker-alt" style="font-size:24px;color:#ef4444;"></i><small>${this.escapeHtml(tpl.headerText) || 'Location'}</small></div>`;
      }
    }
    html += `<div class="wa-body">${this.escapeHtml(tpl.body) || 'Enter your message...'}</div>`;
    if (tpl.footer) html += `<div class="wa-footer">${this.escapeHtml(tpl.footer)}</div>`;
    tpl.buttons.forEach(b => {
      if (b.text) {
        if (b.type === 'QUICK_REPLY') html += `<span class="wa-btn quick-reply">${this.escapeHtml(b.text)}</span>`;
        else if (b.type === 'URL') html += `<div class="wa-btn">🌐 ${this.escapeHtml(b.text)}</div>`;
        else if (b.type === 'PHONE_NUMBER') html += `<div class="wa-btn">📞 ${this.escapeHtml(b.text)}</div>`;
        else if (b.type === 'COPY_CODE') html += `<div class="wa-btn">📋 ${this.escapeHtml(b.text)}</div>`;
      }
    });
    html += `<div class="wa-time">${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>`;
    html += '</div>';
    return html;
  },

  updateCharCounts() {
    const name = document.getElementById('tplName')?.value || '';
    const header = document.getElementById('tplHeaderText')?.value || '';
    const body = document.getElementById('tplBody')?.value || '';
    const footer = document.getElementById('tplFooter')?.value || '';
    const nameEl = document.getElementById('nameCount');
    const headerEl = document.getElementById('headerCount');
    const bodyEl = document.getElementById('bodyCount');
    const footerEl = document.getElementById('footerCount');
    if (nameEl) nameEl.textContent = name.length;
    if (headerEl) headerEl.textContent = header.length;
    if (bodyEl) bodyEl.textContent = body.length;
    if (footerEl) footerEl.textContent = footer.length;
  },

  // ==================== SAVE TEMPLATE ====================
  async saveTemplate(editId = null) {
    const id = editId || this.editingId;
    const name = document.getElementById('tplName')?.value?.trim();
    const body = document.getElementById('tplBody')?.value?.trim();
    
    if (!name) return showToast('❌ Template name is required!', 'error');
    if (!body) return showToast('❌ Body content is required!', 'error');
    
    const components = [];
    
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
    
    components.push({ type: 'BODY', text: body });
    
    const footer = document.getElementById('tplFooter')?.value?.trim();
    if (footer) components.push({ type: 'FOOTER', text: footer });
    
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
      category: this.currentCategory || document.getElementById('tplCategory')?.value || 'UTILITY',
      language: document.getElementById('tplLanguage')?.value || 'en',
      components,
      clientId: getCurrentClientId(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
      if (id) {
        await db.collection('templates').doc(id).update(data);
        showToast('✅ Template updated!', 'success');
      } else {
        data.metaStatus = 'DRAFT';
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        const ref = await db.collection('templates').add(data);
        this.editingId = ref.id;
        showToast('✅ Template saved as draft!', 'success');
      }
      this.render();
    } catch (err) { 
      showToast('❌ Error: ' + err.message, 'error');
    }
  },

  // ==================== SUBMIT TO META (FIXED) ====================
  async submitToMeta(editId = null) {
    const id = editId || this.editingId;
    
    if (!id) {
        await this.saveTemplate();
        if (!this.editingId) {
            return showToast('❌ Please save the template first!', 'error');
        }
    }
    
    const docId = id || this.editingId;
    const doc = await db.collection('templates').doc(docId).get();
    
    if (!doc.exists) {
        return showToast('❌ Template not found. Please save first.', 'error');
    }
    
    const tpl = doc.data();
    const cfg = await this.getConfig();
    
    if (!cfg?.accessToken) {
        return showToast('❌ WhatsApp not configured.', 'error');
    }
    
    const wabaId = cfg.wabaId || cfg.businessAccountId || cfg.phoneNumberId;
    if (!wabaId) {
        return showToast('❌ WhatsApp Business Account ID not configured.', 'error');
    }

    // Build components in Meta's EXACT expected format
    let metaComponents = [];
    const components = tpl.components || [];
    
    for (const comp of components) {
        
        if (comp.type === 'HEADER') {
            const headerComp = { type: 'HEADER' };
            
            if (comp.format === 'TEXT') {
                headerComp.format = 'TEXT';
                headerComp.text = comp.text || ' ';
            } else if (comp.format === 'LOCATION') {
                headerComp.format = 'LOCATION';
            } else if (comp.format === 'IMAGE') {
                headerComp.format = 'IMAGE';
                if (comp.example?.header_handle?.length > 0) {
                    headerComp.example = {
                        header_handle: [comp.example.header_handle[0]]
                    };
                }
            } else if (comp.format === 'VIDEO') {
                headerComp.format = 'VIDEO';
                if (comp.example?.header_handle?.length > 0) {
                    headerComp.example = {
                        header_handle: [comp.example.header_handle[0]]
                    };
                }
            } else if (comp.format === 'DOCUMENT') {
                headerComp.format = 'DOCUMENT';
                if (comp.example?.header_handle?.length > 0) {
                    headerComp.example = {
                        header_handle: [comp.example.header_handle[0]]
                    };
                }
            }
            
            metaComponents.push(headerComp);
            
        } else if (comp.type === 'BODY') {
            metaComponents.push({
                type: 'BODY',
                text: comp.text || ' '
            });
            
        } else if (comp.type === 'FOOTER') {
            metaComponents.push({
                type: 'FOOTER',
                text: comp.text || ' '
            });
            
        } else if (comp.type === 'BUTTONS') {
            if (comp.buttons?.length > 0) {
                let validButtons = [];
                
                for (const b of comp.buttons) {
                    if (!b.text || !b.text.trim()) continue;
                    
                    const btn = { type: b.type, text: b.text.trim() };
                    
                    if (b.type === 'URL') {
                        btn.url = b.url || 'https://example.com';
                    } else if (b.type === 'PHONE_NUMBER') {
                        btn.phone_number = (b.phone_number || '+910000000000').replace(/[^0-9+]/g, '');
                    } else if (b.type === 'COPY_CODE') {
                        btn.example = b.example || 'demo-code';
                    }
                    
                    validButtons.push(btn);
                }
                
                if (validButtons.length > 0) {
                    metaComponents.push({
                        type: 'BUTTONS',
                        buttons: validButtons
                    });
                }
            }
        }
    }

    // Validate: Body must exist
    const hasBody = metaComponents.some(c => c.type === 'BODY' && c.text?.trim());
    if (!hasBody) {
        return showToast('❌ Template must have a body!', 'error');
    }

    const payload = {
        name: tpl.name,
        category: tpl.category || 'UTILITY',
        language: tpl.language || 'en_US',
        components: metaComponents
    };

    try {
        showToast('⏳ Submitting to Meta...', 'info');
        console.log('📤 Submitting:', JSON.stringify({ wabaId, payload }, null, 2));
        
        const res = await fetch(
            `https://graph.facebook.com/v22.0/${wabaId}/message_templates`,
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
        
        console.log('📥 Meta Response:', JSON.stringify(result, null, 2));
        
        if (res.ok && result.id) {
            await doc.ref.update({
                metaTemplateId: result.id,
                metaStatus: result.status || 'PENDING',
                submittedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            showToast('✅ Template submitted for review!', 'success');
            await this.fetchFromMeta();
            this.render();
        } else {
            let errorMsg = result.error?.message || result.error?.error_user_msg || 'Unknown error';
            showToast('❌ Submission failed: ' + errorMsg, 'error');
            console.error('Meta API Full Error:', result.error);
        }
    } catch (err) { 
        showToast('❌ Error: ' + err.message, 'error');
    }
  }

};
