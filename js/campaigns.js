// js/campaigns.js — Advanced Campaign Module with WhatsApp API Number Selection, Template Sync & Real Delivery
// FIXED: Template language 'en', Media upload for IMAGE/VIDEO/DOC headers, Variables only if exist
const Campaigns = {
  currentTab: 'bulk',
  editingCampaign: null,
  campaignTemplates: [],
  campaignContacts: [],
  whatsappNumbers: [],

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading...</p>';
    await this.loadTemplates();
    await this.loadContacts();
    await this.loadWhatsAppNumbers();

    if (this.currentTab === 'drip') { await this.renderDrip(); return; }
    if (this.currentTab === 'stats' && this.editingCampaign) { await this.renderStats(this.editingCampaign); return; }
    await this.renderBulk();
  },

  async loadTemplates() {
    try {
      let q = db.collection('templates');
      if (shouldFilterByClient()) q = q.where('clientId', '==', window.currentUser.clientId);
      const snap = await q.orderBy('name').get();
      this.campaignTemplates = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { this.campaignTemplates = []; }
  },

  async loadContacts() {
    try {
      let q = db.collection('contacts');
      if (shouldFilterByClient()) q = q.where('clientId', '==', window.currentUser.clientId);
      const snap = await q.orderBy('firstName').get();
      this.campaignContacts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { this.campaignContacts = []; }
  },

  async loadWhatsAppNumbers() {
    try {
      this.whatsappNumbers = [];
      const cfg = await db.collection('settings').doc('whatsapp').get();
      if (cfg.exists) {
        const data = cfg.data();
        if (data.phoneNumberId && data.accessToken) {
          this.whatsappNumbers.push({
            id: data.phoneNumberId,
            name: data.displayName || 'Primary WhatsApp Number',
            token: data.accessToken,
            businessId: data.businessId || '342354115627791',
            isDefault: true
          });
        }
      }
    } catch(e) { this.whatsappNumbers = []; }
  },

  // ==================== BULK CAMPAIGNS RENDER ====================
  async renderBulk() {
    let campaigns = [];
    try {
      let query = db.collection('campaigns').where('type', '==', 'bulk');
      if (shouldFilterByClient()) query = query.where('clientId', '==', window.currentUser.clientId);
      const snap = await query.orderBy('createdAt', 'desc').get();
      campaigns = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch(e) { console.error(e); }

    let html = `
      <style>
        .campaign-tabs { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        .campaign-tab { padding: 10px 20px; border-radius: 24px; font-weight: 600; font-size: 13px; cursor: pointer; border: 2px solid #e2e8f0; background: #fff; transition: 0.2s; }
        .campaign-tab:hover { border-color: #6366f1; }
        .campaign-tab.active { background: #6366f1; color: #fff; border-color: #6366f1; }
        .campaign-card { background: #fff; border-radius: 16px; padding: 20px; border: 1px solid #f1f5f9; transition: 0.2s; }
        .campaign-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .campaign-progress { height: 8px; border-radius: 10px; background: #f1f5f9; overflow: hidden; margin: 8px 0; }
        .campaign-progress-fill { height: 100%; border-radius: 10px; transition: width 0.5s; }
        .wa-preview-mini { background: #e5ddd5; border-radius: 8px; padding: 10px; max-width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; }
        .wa-preview-mini .wa-img { width: 100%; border-radius: 4px; margin-bottom: 6px; }
        .wa-preview-mini .wa-vid { background: #000; border-radius: 4px; padding: 15px; text-align: center; color: #fff; margin-bottom: 6px; }
        .wa-preview-mini .wa-doc { background: #fff; border-radius: 4px; padding: 6px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; font-size: 11px; }
        .wa-preview-mini .wa-header { font-weight: 700; margin-bottom: 3px; color: #111b21; }
        .wa-preview-mini .wa-body { color: #111b21; white-space: pre-wrap; line-height: 1.3; }
        .wa-preview-mini .wa-footer { font-size: 10px; color: #667781; margin-top: 3px; }
        .wa-preview-mini .wa-btn { display: block; text-align: center; padding: 5px 10px; border-radius: 16px; font-size: 11px; font-weight: 600; margin-top: 3px; background: #fff; color: #008069; border: 1px solid #008069; }
        .contact-chip { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 16px; font-size: 11px; background: #eef2ff; color: #6366f1; margin: 2px; }
        .contact-chip .remove { cursor: pointer; font-weight: 700; }
        .drip-step { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 10px; position: relative; }
        .drip-step .step-number { position: absolute; top: -10px; left: 12px; background: #6366f1; color: #fff; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
        .drip-arrow { text-align: center; color: #6366f1; font-size: 18px; margin: -5px 0; }
        .wa-number-selector { background: linear-gradient(135deg, #eef2ff, #faf5ff); border: 2px solid #6366f1; border-radius: 12px; padding: 14px; margin-bottom: 16px; }
        .campaign-type-btn { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: 0.2s; }
        .campaign-type-btn:hover { border-color: #6366f1; background: #eef2ff; }
        .campaign-type-btn i { font-size: 20px; color: #6366f1; }
        .media-upload-zone-campaign { border: 2px dashed #d1d5db; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; background: #fafbfc; margin-bottom: 8px; transition: 0.2s; }
        .media-upload-zone-campaign:hover { border-color: #6366f1; background: #f8f9fa; }
        .media-upload-zone-campaign i { font-size: 28px; color: #6366f1; }
      </style>

      <div class="campaign-tabs">
        <div class="campaign-tab ${this.currentTab==='bulk'?'active':''}" onclick="Campaigns.currentTab='bulk';Campaigns.render();">📢 Compose Campaign</div>
        <div class="campaign-tab ${this.currentTab==='drip'?'active':''}" onclick="Campaigns.currentTab='drip';Campaigns.render();">🔄 Drip Campaigns</div>
      </div>

      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="mb-0"><i class="fas fa-paper-plane text-primary me-2"></i>Compose Campaign</h4>
        <button class="btn btn-primary" onclick="Campaigns.showComposeTypes()"><i class="fas fa-plus me-1"></i> New Campaign</button>
      </div>
      <div id="campaignFormContainer"></div>

      <div class="row g-3">
        ${campaigns.length === 0 ? '<div class="col-12 text-center py-5 text-muted"><i class="fas fa-inbox fa-3x mb-3"></i><h5>No campaigns yet</h5></div>' : campaigns.map(c => {
          const p = c.total > 0 ? Math.round(((c.sent || 0) / c.total) * 100) : 0;
          const header = (c.templateComponents || []).find(cmp => cmp.type === 'HEADER');
          const body = (c.templateComponents || []).find(cmp => cmp.type === 'BODY');
          
          return `<div class="col-md-6 col-lg-4">
            <div class="campaign-card">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h6 class="mb-0">${c.name || '-'}</h6>
                  <small class="text-muted">${c.templateName || 'Custom Message'} · ${c.campaignType || 'single'}</small>
                </div>
                <span class="badge bg-${c.status==='running'?'success':c.status==='completed'?'primary':c.status==='paused'?'warning':'secondary'}">${c.status || 'draft'}</span>
              </div>
              
              ${body ? `<div class="wa-preview-mini mb-2">
                ${header?.format==='IMAGE' && header?.example?.header_handle?.[0] ? `<img src="${header.example.header_handle[0]}" class="wa-img">` : ''}
                ${header?.format==='VIDEO' ? `<div class="wa-vid"><i class="fas fa-play"></i> Video</div>` : ''}
                ${header?.format==='DOCUMENT' ? `<div class="wa-doc"><i class="fas fa-file"></i> Document</div>` : ''}
                ${header?.format==='TEXT' && header?.text ? `<div class="wa-header">${header.text.substring(0,40)}</div>` : ''}
                <div class="wa-body">${(body.text||'').substring(0,80)}</div>
              </div>` : ''}
              
              <div class="d-flex gap-2 text-muted small mb-2">
                <span><i class="fab fa-whatsapp"></i> ${c.whatsappNumberName || 'N/A'}</span>
                <span><i class="fas fa-users"></i> ${c.total || 0}</span>
                <span><i class="fas fa-check-circle text-success"></i> ${c.delivered || 0}</span>
                <span><i class="fas fa-times-circle text-danger"></i> ${c.failed || 0}</span>
              </div>
              
              <div class="campaign-progress">
                <div class="campaign-progress-fill" style="width:${p}%;background:${c.status==='completed'?'#10b981':'#6366f1'};"></div>
              </div>
              
              <div class="d-flex gap-2 mt-2">
                ${c.status === 'draft' ? `<button class="btn btn-success btn-sm" onclick="Campaigns.executeCampaign('${c.id}')"><i class="fas fa-play"></i> Run</button>` : ''}
                ${c.status === 'running' ? `<button class="btn btn-warning btn-sm" onclick="Campaigns.pauseCampaign('${c.id}')"><i class="fas fa-pause"></i> Pause</button>` : ''}
                ${c.status === 'paused' ? `<button class="btn btn-success btn-sm" onclick="Campaigns.resumeCampaign('${c.id}')"><i class="fas fa-play"></i> Resume</button>` : ''}
                <button class="btn btn-outline-info btn-sm" onclick="Campaigns.currentTab='stats';Campaigns.editingCampaign='${c.id}';Campaigns.render();"><i class="fas fa-chart-bar"></i></button>
                <button class="btn btn-outline-danger btn-sm" onclick="Campaigns.deleteCampaign('${c.id}')"><i class="fas fa-trash"></i></button>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
    contentArea.innerHTML = html;
  },

  // ==================== COMPOSE TYPE SELECTOR ====================
  showComposeTypes() {
    const types = [
      { id: 'single', icon: 'fa-user', name: 'Compose Single WA', desc: 'Send to one number' },
      { id: 'group', icon: 'fa-users', name: 'Compose Group WA', desc: 'Send to contact group' },
      { id: 'dynamic', icon: 'fa-magic', name: 'Compose Dynamic WA', desc: 'Personalized with variables' },
      { id: 'retargeting', icon: 'fa-bullseye', name: 'Compose Retargeting WA', desc: 'Based on user behavior' },
      { id: 'pdf', icon: 'fa-file-pdf', name: 'Compose Dynamic PDF WA', desc: 'Auto-generated PDF' },
      { id: 'catalog', icon: 'fa-shopping-cart', name: 'Compose Single Catalog WA', desc: 'Product catalog message' }
    ];

    document.getElementById('campaignFormContainer').innerHTML = `
      <div class="card-widget mb-3">
        <h5 class="mb-3">Select Campaign Type</h5>
        <div class="row g-3">
          ${types.map(t => `
            <div class="col-md-4">
              <div class="campaign-type-btn" onclick="Campaigns.showBulkCreate('${t.id}')">
                <i class="fas ${t.icon}"></i>
                <div>
                  <div style="font-weight:600;font-size:13px;">${t.name}</div>
                  <small class="text-muted">${t.desc}</small>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-light btn-sm mt-3" onclick="document.getElementById('campaignFormContainer').innerHTML=''">Cancel</button>
      </div>
    `;
  },

  // ==================== BULK CREATE FORM ====================
  async showBulkCreate(campaignType = 'single') {
    await this.loadWhatsAppNumbers();
    const groups = [];
    try {
      let gq = db.collection('contactGroups');
      if (shouldFilterByClient()) gq = gq.where('clientId', '==', window.currentUser.clientId);
      const gs = await gq.get();
      gs.forEach(d => groups.push({ id: d.id, ...d.data() }));
    } catch(e) {}

    const typeNames = {
      single: 'Compose Single WhatsApp',
      group: 'Compose Group WhatsApp',
      dynamic: 'Compose Dynamic WhatsApp',
      retargeting: 'Compose Retargeting WA',
      pdf: 'Compose Dynamic PDF WA',
      catalog: 'Compose Single Catalog WA'
    };

    let html = `
      <div class="card-widget mb-3 border-primary" style="border-left: 4px solid #6366f1;">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0"><i class="fas fa-paper-plane text-primary me-2"></i>${typeNames[campaignType] || 'Compose Campaign'}</h5>
          <button class="btn btn-light btn-sm" onclick="Campaigns.currentTab='bulk';Campaigns.render();">×</button>
        </div>

        <!-- WhatsApp Number Selector -->
        <div class="wa-number-selector">
          <label class="form-label small fw-bold"><i class="fab fa-whatsapp text-success"></i> Select WhatsApp API Number *</label>
          <select id="bWhatsappNumber" class="form-select">
            ${this.whatsappNumbers.length === 0 ? 
              '<option value="">⚠️ No WhatsApp numbers configured — Setup required</option>' :
              this.whatsappNumbers.map(n => `<option value="${n.id}" data-token="${n.token}">${n.name} (${n.id})</option>`).join('')
            }
          </select>
          <small class="text-muted">All messages will be sent from this number</small>
        </div>
        
        <div class="row g-3">
          <!-- LEFT: Form -->
          <div class="col-md-7">
            <div class="row g-2">
              <div class="col-md-6">
                <label class="form-label small fw-bold">Campaign Name *</label>
                <input id="bName" class="form-control" placeholder="e.g., Welcome Message">
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">${campaignType === 'single' ? 'Phone Number *' : 'Contact Group'}</label>
                ${campaignType === 'single' ? 
                  '<input id="bSinglePhone" class="form-control" placeholder="+919810012345">' :
                  `<select id="bGroup" class="form-select"><option value="">All Contacts (${this.campaignContacts.length})</option>${groups.map(g => `<option value="${g.id}">${g.name} (${(g.memberIds||[]).length})</option>`).join('')}</select>`
                }
              </div>
            </div>

            <!-- TEMPLATE SELECT -->
            <label class="form-label small fw-bold mt-2">Select Template</label>
            <select id="bTemplate" class="form-select mb-2" onchange="Campaigns.onTemplateSelect('b')">
              <option value="">Custom Message</option>
              ${this.campaignTemplates.filter(t => t.metaStatus === 'APPROVED').map(t => `<option value="${t.id}">${t.name} (${t.language})</option>`).join('')}
            </select>

            <!-- HEADER PREVIEW -->
            <div id="bHeaderPreview" style="display:none;" class="mb-2"></div>

            <!-- MESSAGE (auto-filled from template) -->
            <label class="form-label small fw-bold">Message *</label>
            <textarea id="bMessage" class="form-control mb-2" rows="4" placeholder="Type message or select a template above... Use {first_name}, {last_name}, {phone} for personalization"></textarea>
            
            <!-- MEDIA URL (auto-filled from template) -->
            <div id="bMediaField" style="display:none;">
              <label class="form-label small fw-bold">
                <i class="fas fa-paperclip me-1"></i> Media Attachment 
                <small class="text-muted">(Optional — Image, Video, Document)</small>
              </label>
              <div class="media-upload-zone-campaign" onclick="document.getElementById('campaignMediaUpload').click()">
                <i class="fas fa-cloud-upload-alt"></i>
                <p class="mt-2 mb-0" style="font-size:13px;">Click to upload media<br><small>JPG, PNG, MP4, PDF (Max 10MB)</small></p>
              </div>
              <input type="file" id="campaignMediaUpload" style="display:none" accept="image/*,video/*,.pdf" onchange="Campaigns.uploadCampaignMedia(this)">
              <input id="bMedia" class="form-control mb-2" placeholder="Or paste Image/Video/Document URL" oninput="Campaigns.updateBulkPreview()">
              <div id="bMediaPreview" style="display:none;" class="mb-2"></div>
            </div>

            <!-- FOOTER (auto-filled from template) -->
            <div id="bFooterField" style="display:none;">
              <label class="form-label small fw-bold">Footer</label>
              <input id="bFooter" class="form-control mb-2" placeholder="Footer text" readonly>
            </div>

            <!-- BUTTONS (auto-filled from template) -->
            <div id="bButtonsPreview" style="display:none;" class="mb-2"></div>

            <!-- SCHEDULE -->
            <label class="form-label small fw-bold">Schedule</label>
            <div class="row g-2">
              <div class="col-md-6">
                <select id="bSchedule" class="form-select" onchange="document.getElementById('bSRow').style.display=this.value==='later'?'flex':'none'">
                  <option value="now">Send Now</option>
                  <option value="later">Schedule for Later</option>
                </select>
              </div>
              <div id="bSRow" class="col-md-6" style="display:none;">
                <div class="row g-1">
                  <div class="col-6"><input type="date" id="bDate" class="form-control form-control-sm"></div>
                  <div class="col-6"><input type="time" id="bTime" class="form-control form-control-sm"></div>
                </div>
              </div>
            </div>

            <div class="d-flex gap-2 mt-3">
              <button class="btn btn-success" onclick="Campaigns.saveCampaign('send','${campaignType}')"><i class="fas fa-paper-plane me-1"></i> Save & Send</button>
              <button class="btn btn-outline-primary" onclick="Campaigns.saveCampaign('draft','${campaignType}')"><i class="fas fa-save me-1"></i> Draft</button>
              <button class="btn btn-light" onclick="Campaigns.currentTab='bulk';Campaigns.render();">Cancel</button>
            </div>
          </div>

          <!-- RIGHT: Live Preview -->
          <div class="col-md-5">
            <label class="form-label small fw-bold">Live Preview</label>
            <div class="wa-preview-mini" id="bPreview">
              <p class="text-muted text-center">Preview will appear here...</p>
            </div>
          </div>
        </div>
      </div>
    `;
    document.getElementById('campaignFormContainer').innerHTML = html;

    // Attach live preview listener
    setTimeout(() => {
      const msgEl = document.getElementById('bMessage');
      if (msgEl) msgEl.addEventListener('input', () => Campaigns.updateBulkPreview());
    }, 200);
  },

  // ✅ Upload campaign media
  async uploadCampaignMedia(input) {
    const file = input.files[0];
    if (!file) return;
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast('❌ File too large. Max 10MB', 'error');
      return;
    }
    try {
      showToast('Uploading...', 'info');
      const path = `campaigns/media/${getCurrentClientId() || 'system'}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const ref = storage.ref(path);
      const snapshot = await ref.put(file, { contentType: file.type });
      const url = await snapshot.ref.getDownloadURL();
      document.getElementById('bMedia').value = url;
      this.showCampaignMediaPreview(url, file.type);
      showToast('✅ Media uploaded!', 'success');
      this.updateBulkPreview();
    } catch(e) {
      showToast('❌ Upload failed: ' + e.message, 'error');
    }
  },

  // ✅ Show campaign media preview
  showCampaignMediaPreview(url, fileType) {
    const preview = document.getElementById('bMediaPreview');
    if (!preview) return;
    preview.style.display = 'block';
    if (fileType && fileType.startsWith('image/')) {
      preview.innerHTML = `
        <div style="position: relative; display: inline-block;">
          <img src="${url}" style="max-width: 200px; max-height: 150px; border-radius: 8px;" alt="Preview">
          <button onclick="document.getElementById('bMedia').value=''; document.getElementById('bMediaPreview').style.display='none'; Campaigns.updateBulkPreview();" 
                  style="position: absolute; top: -8px; right: -8px; background: #ef4444; color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; cursor: pointer;">×</button>
        </div>`;
    } else if (fileType && fileType.startsWith('video/')) {
      preview.innerHTML = `
        <div style="position: relative; display: inline-block;">
          <video src="${url}" style="max-width: 200px; max-height: 150px; border-radius: 8px;" controls></video>
          <button onclick="document.getElementById('bMedia').value=''; document.getElementById('bMediaPreview').style.display='none'; Campaigns.updateBulkPreview();" 
                  style="position: absolute; top: -8px; right: -8px; background: #ef4444; color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; cursor: pointer;">×</button>
        </div>`;
    } else {
      preview.innerHTML = `
        <div class="d-flex align-items-center gap-2 p-2 bg-light rounded" style="display: inline-flex;">
          <i class="fas fa-file" style="font-size: 20px; color: #6366f1;"></i>
          <span class="small">${url.split('/').pop().substring(0, 30)}</span>
          <button onclick="document.getElementById('bMedia').value=''; document.getElementById('bMediaPreview').style.display='none'; Campaigns.updateBulkPreview();" 
                  style="background: #ef4444; color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; cursor: pointer;">×</button>
        </div>`;
    }
  },

  // ✅ FIXED: onTemplateSelect — ALWAYS shows media field for IMAGE/VIDEO/DOCUMENT headers
  onTemplateSelect(prefix) {
    const templateId = document.getElementById(prefix + 'Template')?.value;
    if (!templateId) {
      this.clearTemplateFields(prefix);
      return;
    }

    const tpl = this.campaignTemplates.find(t => t.id === templateId);
    if (!tpl) return;

    const components = tpl.components || [];
    const header = components.find(c => c.type === 'HEADER');
    const body = components.find(c => c.type === 'BODY');
    const footer = components.find(c => c.type === 'FOOTER');
    const buttons = components.find(c => c.type === 'BUTTONS');

    // Fill Body
    if (body) {
      document.getElementById(prefix + 'Message').value = body.text || '';
    }

    // ✅ FIXED: Always show media field for IMAGE/VIDEO/DOCUMENT headers
    const mediaField = document.getElementById(prefix + 'MediaField');
    const headerPreview = document.getElementById(prefix + 'HeaderPreview');

    if (header && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(header.format)) {
      if (mediaField) {
        mediaField.style.display = 'block';
        document.getElementById(prefix + 'Media').value = header.example?.header_handle?.[0] || '';
        const mediaPreview = document.getElementById(prefix + 'MediaPreview');
        if (mediaPreview) mediaPreview.style.display = 'none';
      }
      if (headerPreview) {
        headerPreview.style.display = 'block';
        const labels = { IMAGE: '📷 Image Header', VIDEO: '🎬 Video Header', DOCUMENT: '📄 Document Header' };
        headerPreview.innerHTML = `
          <div class="p-2 rounded mb-2" style="background:#eef2ff; border:1px solid #6366f1; font-size:12px;">
            <i class="fas fa-info-circle text-primary me-1"></i>
            <strong>${labels[header.format] || 'Media Header'}</strong>
            <br><small class="text-muted">Upload your own media or use template default. Leave empty for default image.</small>
          </div>`;
      }
    } else if (header && header.format === 'TEXT') {
      if (mediaField) mediaField.style.display = 'none';
      if (headerPreview) {
        headerPreview.style.display = 'block';
        headerPreview.innerHTML = `<strong>${header.text || ''}</strong>`;
      }
    } else {
      if (mediaField) mediaField.style.display = 'block';
      if (headerPreview) headerPreview.style.display = 'none';
    }

    // Fill Footer
    if (footer) {
      document.getElementById(prefix + 'FooterField').style.display = 'block';
      document.getElementById(prefix + 'Footer').value = footer.text || '';
    } else {
      document.getElementById(prefix + 'FooterField').style.display = 'none';
    }

    // Fill Buttons
    const btnPreviewEl = document.getElementById(prefix + 'ButtonsPreview');
    if (buttons && buttons.buttons && buttons.buttons.length > 0) {
      if (btnPreviewEl) {
        btnPreviewEl.style.display = 'block';
        btnPreviewEl.innerHTML = `<label class="form-label small fw-bold">Buttons (${buttons.buttons.length})</label>` +
          buttons.buttons.map((b, i) => `
            <div class="row g-1 mb-1">
              <div class="col-5"><input class="form-control form-control-sm" value="${b.text||''}" placeholder="Btn ${i+1} text"></div>
              <div class="col-5"><input class="form-control form-control-sm" value="${b.url||b.phone_number||b.example||''}" placeholder="${b.type==='URL'?'URL':b.type==='PHONE_NUMBER'?'Phone':b.type==='COPY_CODE'?'Code':''}"></div>
              <div class="col-2"><span class="badge bg-secondary">${b.type}</span></div>
            </div>
          `).join('');
      }
    } else {
      if (btnPreviewEl) btnPreviewEl.style.display = 'none';
    }

    this.updateBulkPreview();
  },

  clearTemplateFields(prefix) {
    document.getElementById(prefix + 'Message').value = '';
    const mediaField = document.getElementById(prefix + 'MediaField');
    if (mediaField) mediaField.style.display = 'none';
    const footerField = document.getElementById(prefix + 'FooterField');
    if (footerField) footerField.style.display = 'none';
    const headerPreview = document.getElementById(prefix + 'HeaderPreview');
    if (headerPreview) headerPreview.style.display = 'none';
    const btnPreview = document.getElementById(prefix + 'ButtonsPreview');
    if (btnPreview) btnPreview.style.display = 'none';
  },

  updateBulkPreview() {
    const preview = document.getElementById('bPreview');
    if (!preview) return;
    
    const message = document.getElementById('bMessage')?.value || '';
    const media = document.getElementById('bMedia')?.value || '';
    const footer = document.getElementById('bFooter')?.value || '';
    
    let html = '<div style="font-size:12px;">';
    if (media) {
      if (media.match(/\.(mp4|mov)/i)) {
        html += `<div class="wa-vid"><i class="fas fa-play"></i> Video</div>`;
      } else if (media.match(/\.pdf/i)) {
        html += `<div class="wa-doc"><i class="fas fa-file-pdf"></i> Document</div>`;
      } else {
        html += `<img src="${media}" class="wa-img" onerror="this.style.display='none'">`;
      }
    }
    html += `<div class="wa-body">${message || 'Your message will appear here...'}</div>`;
    if (footer) html += `<div class="wa-footer">${footer}</div>`;
    html += '</div>';
    preview.innerHTML = html;
  },

  // ✅ FIXED: saveCampaign — Template language save karo
  async saveCampaign(action, campaignType) {
    const name = document.getElementById('bName')?.value?.trim();
    if (!name) return alert('Campaign name required!');
    
    const waSelect = document.getElementById('bWhatsappNumber');
    const waNumberId = waSelect?.value || '';
    const waToken = waSelect?.selectedOptions[0]?.dataset?.token || '';
    const waName = waSelect?.selectedOptions[0]?.text || '';
    
    if (!waNumberId) return alert('Please select a WhatsApp API Number!');
    
    const templateId = document.getElementById('bTemplate')?.value || '';
    const tpl = templateId ? this.campaignTemplates.find(t => t.id === templateId) : null;
    
    const data = {
      name,
      type: 'bulk',
      campaignType,
      groupId: document.getElementById('bGroup')?.value || '',
      singlePhone: document.getElementById('bSinglePhone')?.value?.trim() || '',
      message: document.getElementById('bMessage')?.value?.trim() || '',
      media: document.getElementById('bMedia')?.value?.trim() || '',
      footer: document.getElementById('bFooter')?.value?.trim() || '',
      templateId: templateId || null,
      templateName: tpl?.name || null,
      templateLanguage: tpl?.language || 'en',  // ✅ FIXED: Save template language
      templateComponents: tpl?.components || [],
      whatsappNumberId: waNumberId,
      whatsappToken: waToken,
      whatsappNumberName: waName,
      status: action === 'send' ? (document.getElementById('bSchedule')?.value === 'later' ? 'scheduled' : 'running') : 'draft',
      scheduleDate: document.getElementById('bDate')?.value || null,
      scheduleTime: document.getElementById('bTime')?.value || null,
      total: 0, sent: 0, delivered: 0, read: 0, failed: 0,
      clientId: getCurrentClientId(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      const ref = await db.collection('campaigns').add(data);
      if (data.status === 'running') {
        this.executeCampaign(ref.id);
      } else if (data.status === 'scheduled') {
        alert('✅ Campaign scheduled!');
      } else {
        alert('✅ Saved as draft!');
      }
      this.currentTab = 'bulk';
      this.render();
    } catch(e) { alert('Error: ' + e.message); }
  },

  async getContacts(groupId) {
    if (groupId) {
      const g = await db.collection('contactGroups').doc(groupId).get();
      const ids = g.data()?.memberIds || [];
      const contacts = [];
      for (const id of ids) {
        const d = await db.collection('contacts').doc(id).get();
        if (d.exists) contacts.push({ id: d.id, ...d.data() });
      }
      return contacts;
    }
    let query = db.collection('contacts');
    if (shouldFilterByClient()) query = query.where('clientId', '==', window.currentUser.clientId);
    const sn = await query.get();
    return sn.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  // ✅ FIXED: sendOne — Template components ONLY if variables/media exist
  async sendOne(phone, message, media, campaignId, accessToken, phoneNumberId, templateData) {
    if (!accessToken || !phoneNumberId) {
      return { ok: false, error: 'WhatsApp not configured', status: 'config_error' };
    }
    
    phone = phone.replace(/[^0-9]/g, '');
    if (!phone) return { ok: false, error: 'No phone', status: 'invalid_phone' };

    try {
      let payload;

      if (templateData?.name) {
        // ✅ Template message — BINA components ke bhejo agar variables nahi
        payload = {
          messaging_product: 'whatsapp',
          to: phone,
          type: 'template',
          template: {
            name: templateData.name,
            language: { code: templateData.language || 'en' }  // ✅ FIXED: 'en' fallback
          }
        };

        const components = templateData.components || [];
        const header = components.find(c => c.type === 'HEADER');
        const body = components.find(c => c.type === 'BODY');
        const templateComponents = [];

        // ✅ Header media — only if campaign has media uploaded
        if (header && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(header.format) && media) {
          const mediaUrl = media.trim();
          if (mediaUrl && !mediaUrl.includes('scontent.whatsapp.net') && !mediaUrl.includes('lookaside.fbsbx.com')) {
            templateComponents.push({
              type: 'header',
              parameters: [{
                type: header.format.toLowerCase(),
                [header.format.toLowerCase()]: { link: mediaUrl }
              }]
            });
          }
        }

        // ✅ Body variables — ONLY if template actually has {{1}}, {{2}}
        if (body && body.text) {
          const bodyVars = body.text.match(/\{\{(\d+)\}\}/g);
          if (bodyVars && bodyVars.length > 0) {
            const bodyParams = bodyVars.map(v => ({ type: 'text', text: v }));
            templateComponents.push({ type: 'body', parameters: bodyParams });
          }
        }

        // ✅ Only add components if there are any
        if (templateComponents.length > 0) {
          payload.template.components = templateComponents;
        }
        
      } else {
        // ✅ Regular text message
        payload = {
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: { body: message.substring(0, 4096) }
        };
        
        if (media) {
          const mediaUrl = media.trim();
          if (mediaUrl.match(/\.(mp4|mov)/i)) {
            payload.type = 'video';
            payload.video = { link: mediaUrl, caption: message.substring(0, 1024) };
          } else if (mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
            payload.type = 'image';
            payload.image = { link: mediaUrl, caption: message.substring(0, 1024) };
          } else if (mediaUrl.match(/\.pdf/i)) {
            payload.type = 'document';
            payload.document = { link: mediaUrl, caption: message.substring(0, 1024), filename: mediaUrl.split('/').pop() };
          }
        }
      }

      console.log('📤 Sending:', JSON.stringify(payload).substring(0, 300));

      const res = await fetch(
        `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );
      
      const result = await res.json();
      console.log('📥 Response:', result);
      
      if (!res.ok) {
        await db.collection('message_logs').add({
          phone, campaignId, status: 'failed',
          error: result.error?.message || 'API Error',
          metaCode: result.error?.code || 'unknown',
          clientId: getCurrentClientId(),
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { ok: false, error: result.error?.message, status: 'api_rejected' };
      }

      const waMessageId = result.messages?.[0]?.id;
      if (waMessageId && campaignId) {
        await db.collection('message_tracking').add({
          phone, messageId: waMessageId, campaignId,
          status: 'sent',
          sentAt: firebase.firestore.FieldValue.serverTimestamp(),
          clientId: getCurrentClientId()
        });
      }
      
      return { ok: true, status: 'sent', messageId: waMessageId };
      
    } catch(e) {
      console.error('Send error:', e);
      return { ok: false, error: e.message, status: 'network_error' };
    }
  },

  // ✅ FIXED: executeCampaign — Template ki actual language use karo
  async executeCampaign(id) {
    const doc = await db.collection('campaigns').doc(id).get();
    const c = doc.data();
    
    let contacts = [];
    if (c.campaignType === 'single' && c.singlePhone) {
      contacts = [{ mobile: c.singlePhone, phone: c.singlePhone, firstName: '', lastName: '' }];
    } else {
      contacts = await this.getContacts(c.groupId);
    }
    
    if (contacts.length === 0) {
      await db.collection('campaigns').doc(id).update({ status: 'draft' });
      return alert('No contacts found!');
    }

    await db.collection('campaigns').doc(id).update({ 
      total: contacts.length, 
      status: 'running',
      startedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    showToast(`Sending to ${contacts.length} contacts...`, 'info');

    // ✅ FIXED: Template data with actual template language
    const templateData = c.templateName ? {
      name: c.templateName,
      language: c.templateLanguage || 'en',  // ✅ FIXED: Use saved template language
      components: c.templateComponents || []
    } : null;

    let deliveredCount = 0;
    let failedCount = 0;

    for (const ct of contacts) {
      const phone = ct.mobile || ct.phone || '';
      const msg = (c.message || '')
        .replace(/\{first_name\}/g, ct.firstName || '')
        .replace(/\{last_name\}/g, ct.lastName || '')
        .replace(/\{phone\}/g, phone)
        .replace(/\{email\}/g, ct.email || '');
      
      const result = await this.sendOne(
        phone, msg, c.media, id, 
        c.whatsappToken, c.whatsappNumberId,
        templateData
      );
      
      if (result.status === 'sent') {
        deliveredCount++;
      } else {
        failedCount++;
      }
      
      await db.collection('campaigns').doc(id).update({
        sent: firebase.firestore.FieldValue.increment(1),
        delivered: result.status === 'sent' ? firebase.firestore.FieldValue.increment(1) : firebase.firestore.FieldValue.increment(0),
        failed: result.status !== 'sent' ? firebase.firestore.FieldValue.increment(1) : firebase.firestore.FieldValue.increment(0)
      });

      await new Promise(r => setTimeout(r, 1000));
    }

    await db.collection('campaigns').doc(id).update({ 
      status: 'completed',
      completedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    showToast(`✅ Done! Sent: ${deliveredCount}, Failed: ${failedCount}`, 'success');
    this.render();
  },

  async pauseCampaign(id) {
    await db.collection('campaigns').doc(id).update({ status: 'paused' });
    showToast('⏸ Campaign paused', 'warning');
    this.render();
  },

  async resumeCampaign(id) {
    await db.collection('campaigns').doc(id).update({ status: 'running' });
    this.executeCampaign(id);
  },

  // ==================== DRIP CAMPAIGNS ====================
  async renderDrip() {
    let drips = [];
    try {
      let query = db.collection('campaigns').where('type', '==', 'drip');
      if (shouldFilterByClient()) query = query.where('clientId', '==', window.currentUser.clientId);
      const sn = await query.orderBy('createdAt', 'desc').get();
      drips = sn.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) {}

    let html = `
      <div class="campaign-tabs">
        <div class="campaign-tab" onclick="Campaigns.currentTab='bulk';Campaigns.render();">📢 Compose Campaign</div>
        <div class="campaign-tab active" onclick="Campaigns.currentTab='drip';Campaigns.render();">🔄 Drip Campaigns</div>
      </div>

      <div class="d-flex justify-content-between mb-3">
        <h4><i class="fas fa-clock text-warning me-2"></i>Drip Campaigns</h4>
        <button class="btn btn-warning" onclick="Campaigns.showDripCreate()"><i class="fas fa-plus me-1"></i> New Drip</button>
      </div>
      <div id="dripFormContainer"></div>

      <div class="row g-3">
        ${drips.length === 0 ? '<div class="col-12 text-center py-5 text-muted"><i class="fas fa-inbox fa-3x mb-3"></i><h5>No drip campaigns yet</h5></div>' : drips.map(d => {
          const steps = d.dripSteps || [];
          return `<div class="col-md-6 col-lg-4">
            <div class="campaign-card">
              <div class="d-flex justify-content-between"><h6>${d.name}</h6><span class="badge bg-${d.status==='running'?'success':d.status==='completed'?'primary':'secondary'}">${d.status}</span></div>
              <small class="text-muted">${steps.length} steps · ${d.total||0} contacts · ${d.whatsappNumberName || 'N/A'}</small>
              <div class="mt-2">
                ${steps.map((s, i) => `
                  <div class="d-flex align-items-center gap-2 mb-1">
                    <span class="badge bg-light text-dark">Step ${i+1}</span>
                    <small class="text-truncate">${(s.message||'').substring(0,40)}</small>
                    <small class="text-muted ms-auto">⏱ ${s.delayHours}h</small>
                  </div>
                `).join('')}
              </div>
              <div class="mt-2">
                ${d.status==='draft'?`<button class="btn btn-success btn-sm" onclick="Campaigns.executeDrip('${d.id}')">▶ Start</button>`:''}
                ${d.status==='running'?`<button class="btn btn-danger btn-sm" onclick="Campaigns.stopDrip('${d.id}')">⏹ Stop</button>`:''}
                <button class="btn btn-outline-danger btn-sm" onclick="Campaigns.deleteCampaign('${d.id}')">🗑</button>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
    contentArea.innerHTML = html;
  },

  showDripCreate() {
    document.getElementById('dripFormContainer').innerHTML = `
      <div class="card-widget mb-3 border-warning" style="border-left: 4px solid #f59e0b;">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0"><i class="fas fa-clock text-warning me-2"></i>Create Drip Campaign</h5>
          <button class="btn btn-light btn-sm" onclick="Campaigns.currentTab='drip';Campaigns.render();">×</button>
        </div>

        <div class="wa-number-selector">
          <label class="form-label small fw-bold"><i class="fab fa-whatsapp text-success"></i> Select WhatsApp API Number *</label>
          <select id="dWhatsappNumber" class="form-select">
            ${this.whatsappNumbers.length === 0 ? 
              '<option value="">⚠️ No WhatsApp numbers configured</option>' :
              this.whatsappNumbers.map(n => `<option value="${n.id}" data-token="${n.token}">${n.name} (${n.id})</option>`).join('')
            }
          </select>
        </div>

        <div class="row g-2 mb-3">
          <div class="col-md-6">
            <label class="form-label small fw-bold">Sequence Name *</label>
            <input id="dName" class="form-control" placeholder="e.g., Welcome Series">
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-bold">Contact Group</label>
            <select id="dGroup" class="form-select">
              <option value="">All Contacts (${this.campaignContacts.length})</option>
            </select>
          </div>
        </div>

        <label class="form-label small fw-bold">Steps</label>
        <div id="dripStepsContainer">
          <div class="drip-step">
            <div class="step-number">1</div>
            <div class="row g-2 mt-2">
              <div class="col-md-8">
                <select class="form-select form-select-sm drip-template-select" onchange="Campaigns.onDripTemplateSelect(this, 0)">
                  <option value="">Custom Message</option>
                  ${this.campaignTemplates.filter(t => t.metaStatus === 'APPROVED').map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                </select>
                <textarea class="form-control form-control-sm mt-1 drip-message" rows="2" placeholder="Step 1 message... Use {first_name}, {last_name}"></textarea>
              </div>
              <div class="col-md-2">
                <label class="small">Delay (hours)</label>
                <input type="number" class="form-control form-control-sm drip-delay" value="0" min="0">
              </div>
              <div class="col-md-2">
                <label class="small">Media URL</label>
                <input class="form-control form-control-sm drip-media" placeholder="Optional">
              </div>
            </div>
          </div>
        </div>

        <button class="btn btn-outline-primary btn-sm mt-2" onclick="Campaigns.addDripStep()"><i class="fas fa-plus"></i> Add Step</button>
        
        <div class="d-flex gap-2 mt-3">
          <button class="btn btn-warning" onclick="Campaigns.saveDrip('send')"><i class="fas fa-play me-1"></i> Save & Start</button>
          <button class="btn btn-outline-warning" onclick="Campaigns.saveDrip('draft')"><i class="fas fa-save me-1"></i> Draft</button>
          <button class="btn btn-light" onclick="Campaigns.currentTab='drip';Campaigns.render();">Cancel</button>
        </div>
      </div>
    `;
  },

  onDripTemplateSelect(select, stepIndex) {
    const templateId = select.value;
    if (!templateId) return;

    const tpl = this.campaignTemplates.find(t => t.id === templateId);
    if (!tpl) return;

    const step = select.closest('.drip-step');
    const messageEl = step.querySelector('.drip-message');
    const mediaEl = step.querySelector('.drip-media');
    
    const body = (tpl.components || []).find(c => c.type === 'BODY');
    const header = (tpl.components || []).find(c => c.type === 'HEADER');
    
    if (body && messageEl) {
      messageEl.value = body.text || '';
    }
    if (header && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(header.format) && mediaEl) {
      mediaEl.value = header.example?.header_handle?.[0] || '';
    }
  },

  addDripStep() {
    const container = document.getElementById('dripStepsContainer');
    const stepCount = container.querySelectorAll('.drip-step').length;
    if (stepCount >= 10) return alert('Max 10 steps allowed!');

    const newStep = document.createElement('div');
    newStep.className = 'drip-step';
    newStep.innerHTML = `
      <div class="step-number">${stepCount + 1}</div>
      <div class="row g-2 mt-2">
        <div class="col-md-8">
          <select class="form-select form-select-sm drip-template-select" onchange="Campaigns.onDripTemplateSelect(this, ${stepCount})">
            <option value="">Custom Message</option>
            ${this.campaignTemplates.filter(t => t.metaStatus === 'APPROVED').map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
          </select>
          <textarea class="form-control form-control-sm mt-1 drip-message" rows="2" placeholder="Step ${stepCount + 1} message..."></textarea>
        </div>
        <div class="col-md-2">
          <label class="small">Delay (hours)</label>
          <input type="number" class="form-control form-control-sm drip-delay" value="${stepCount * 24}" min="0">
        </div>
        <div class="col-md-2">
          <label class="small">Media URL</label>
          <input class="form-control form-control-sm drip-media" placeholder="Optional">
          <button class="btn btn-sm btn-outline-danger mt-1" onclick="this.closest('.drip-step').remove()">×</button>
        </div>
      </div>
    `;
    container.appendChild(newStep);
  },

  async saveDrip(action) {
    const name = document.getElementById('dName')?.value?.trim();
    if (!name) return alert('Sequence name required!');

    const waSelect = document.getElementById('dWhatsappNumber');
    const waNumberId = waSelect?.value || '';
    const waToken = waSelect?.selectedOptions[0]?.dataset?.token || '';
    const waName = waSelect?.selectedOptions[0]?.text || '';

    if (!waNumberId) return alert('Please select a WhatsApp API Number!');

    const steps = [];
    document.querySelectorAll('#dripStepsContainer .drip-step').forEach(step => {
      const message = step.querySelector('.drip-message')?.value?.trim();
      const delay = parseInt(step.querySelector('.drip-delay')?.value) || 0;
      const media = step.querySelector('.drip-media')?.value?.trim() || '';
      if (message) steps.push({ message, delayHours: delay, media });
    });

    if (steps.length === 0) return alert('Add at least one step with a message!');

    const data = {
      name,
      type: 'drip',
      groupId: document.getElementById('dGroup')?.value || '',
      dripSteps: steps,
      whatsappNumberId: waNumberId,
      whatsappToken: waToken,
      whatsappNumberName: waName,
      total: 0, sent: 0, delivered: 0, failed: 0,
      status: action === 'send' ? 'running' : 'draft',
      clientId: getCurrentClientId(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      const ref = await db.collection('campaigns').add(data);
      if (data.status === 'running') {
        this.executeDrip(ref.id);
      } else {
        alert('✅ Saved as draft!');
      }
      this.currentTab = 'drip';
      this.render();
    } catch(e) { alert('Error: ' + e.message); }
  },

  async executeDrip(id) {
    const doc = await db.collection('campaigns').doc(id).get();
    const c = doc.data();
    const contacts = await this.getContacts(c.groupId);
    
    if (contacts.length === 0) {
      await db.collection('campaigns').doc(id).update({ status: 'draft' });
      return alert('No contacts found!');
    }

    await db.collection('campaigns').doc(id).update({ 
      total: contacts.length, 
      status: 'running',
      startedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    showToast(`Drip started for ${contacts.length} contacts...`, 'info');

    (c.dripSteps || []).forEach((step, i) => {
      const delay = (step.delayHours || 0) * 3600000;
      setTimeout(async () => {
        for (const ct of contacts) {
          const phone = ct.mobile || ct.phone || '';
          const msg = (step.message || '')
            .replace(/\{first_name\}/g, ct.firstName || '')
            .replace(/\{last_name\}/g, ct.lastName || '')
            .replace(/\{phone\}/g, phone);
          
          await this.sendOne(phone, msg, step.media, id, c.whatsappToken, c.whatsappNumberId);
          await new Promise(r => setTimeout(r, 500));
        }
        
        await db.collection('campaigns').doc(id).update({
          sent: firebase.firestore.FieldValue.increment(contacts.length),
          delivered: firebase.firestore.FieldValue.increment(contacts.length)
        });

        if (i === c.dripSteps.length - 1) {
          await db.collection('campaigns').doc(id).update({ 
            status: 'completed',
            completedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
          showToast('✅ Drip sequence completed!', 'success');
        }
      }, delay);
    });
    
    this.render();
  },

  async stopDrip(id) {
    if (!confirm('Stop this drip sequence?')) return;
    await db.collection('campaigns').doc(id).update({ status: 'draft' });
    showToast('⏹ Drip stopped', 'warning');
    this.render();
  },

  // ==================== STATS ====================
  async renderStats(campaignId) {
    const doc = await db.collection('campaigns').doc(campaignId).get();
    const c = doc.data();
    if (!c) return;

    contentArea.innerHTML = `
      <div class="card-widget">
        <button class="btn btn-light btn-sm mb-3" onclick="Campaigns.currentTab='${c.type||'bulk'}';Campaigns.render();">← Back</button>
        <h4>📊 ${c.name} — Stats</h4>
        <small class="text-muted">WhatsApp: ${c.whatsappNumberName || 'N/A'} · Type: ${c.campaignType || c.type}</small>
        <div class="row g-3 mt-2">
          <div class="col-6 col-md-3"><div class="card text-center p-3"><h3>${c.total||0}</h3><small>Total</small></div></div>
          <div class="col-6 col-md-3"><div class="card text-center p-3"><h3 class="text-primary">${c.sent||0}</h3><small>Sent</small></div></div>
          <div class="col-6 col-md-3"><div class="card text-center p-3"><h3 class="text-success">${c.delivered||0}</h3><small>Delivered</small></div></div>
          <div class="col-6 col-md-3"><div class="card text-center p-3"><h3 class="text-danger">${c.failed||0}</h3><small>Failed</small></div></div>
        </div>
        <p class="text-muted mt-3">Started: ${c.startedAt?.toDate().toLocaleString() || '-'}<br>Completed: ${c.completedAt?.toDate().toLocaleString() || '-'}</p>
      </div>
    `;
  },

  async deleteCampaign(id) {
    if (!confirm('Delete this campaign?')) return;
    await db.collection('campaigns').doc(id).delete();
    showToast('🗑 Campaign deleted', 'info');
    this.render();
  }
};
