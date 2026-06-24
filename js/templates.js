const Templates = {
  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading templates...</p>';

    let templates = [];
    try {
      const snap = await db.collection('templates').orderBy('createdAt', 'desc').get();
      templates = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error('Error loading templates:', err);
    }

    let html = `
      <div class="card-widget">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 class="mb-1"><i class="fas fa-layer-group text-info me-2"></i>WhatsApp Template Management</h4>
            <p class="text-muted small mb-0">Create templates with preview, policy checks, and action-based fields.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="Templates.showBuilder()">
            <i class="fas fa-plus me-1"></i> Create Template
          </button>
        </div>
        <div id="templateBuilderContainer"></div>
        <div class="table-responsive mt-3">
          <table class="table table-hover">
            <thead class="table-light">
              <tr><th>Template Name</th><th>Category</th><th>Language</th><th>Status</th><th>Meta</th><th>Actions</th></tr>
            </thead>
            <tbody>
              ${templates.length === 0
                ? '<tr><td colspan="6" class="text-center text-muted py-4">No templates yet.</td></tr>'
                : templates.map(tpl => `
                  <tr>
                    <td><strong>${tpl.name || '-'}</strong></td>
                    <td><span class="badge bg-${tpl.category==='MARKETING'?'warning':tpl.category==='UTILITY'?'info':'secondary'}">${tpl.category || '-'}</span></td>
                    <td>${tpl.language || 'en'}</td>
                    <td><span class="badge bg-${tpl.status==='Approved'?'success':'warning'}">${tpl.status || 'Draft'}</span></td>
                    <td><span class="badge bg-${tpl.metaStatus==='APPROVED'?'success':tpl.metaStatus==='PENDING'?'warning':tpl.metaStatus==='REJECTED'?'danger':'secondary'}">${tpl.metaStatus || '-'}</span></td>
                    <td>
                      <button class="btn btn-sm btn-outline-primary me-1" onclick="Templates.refreshMetaStatus('${tpl.id}')" title="Refresh"><i class="fas fa-sync-alt"></i></button>
                      <button class="btn btn-sm btn-outline-info me-1" onclick="Templates.showBuilder('${tpl.id}')"><i class="fas fa-edit"></i></button>
                      <button class="btn btn-sm btn-success me-1" onclick="Templates.sendTemplate('${tpl.id}')"><i class="fab fa-whatsapp"></i></button>
                      <button class="btn btn-sm btn-outline-danger" onclick="Templates.deleteTemplate('${tpl.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                  </tr>
                `).join('')
              }
            </tbody>
          </table>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  async showBuilder(editId = null) {
    let tpl = { name: '', category: 'UTILITY', language: 'en_US', headerType: 'none', headerValue: '', body: '', footer: '', buttonType: 'none', buttonText: '', buttonUrl: '', buttonPhone: '', buttonPhone2: '', quickReply: false };

    if (editId) {
      const doc = await db.collection('templates').doc(editId).get();
      if (doc.exists) tpl = { ...tpl, ...doc.data(), _id: editId };
    }

    const html = `
      <style>
        .wa-preview-phone { width: 280px; margin: 0 auto; background: #e5ddd5; border-radius: 24px; padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .wa-preview-msg { background: #fff; border-radius: 8px; padding: 10px 12px; max-width: 100%; box-shadow: 0 1px 2px rgba(0,0,0,0.1); position: relative; }
        .wa-preview-msg .wa-header-img { width: 100%; height: 140px; object-fit: cover; border-radius: 6px; margin-bottom: 6px; background: #dcf8c6; }
        .wa-preview-msg .wa-header-video { width: 100%; height: 140px; border-radius: 6px; margin-bottom: 6px; background: #000; display: flex; align-items: center; justify-content: center; color: #fff; }
        .wa-preview-msg .wa-header-doc { display: flex; align-items: center; gap: 8px; padding: 8px; background: #f0f0f0; border-radius: 6px; margin-bottom: 6px; }
        .wa-preview-msg .wa-header-text { font-weight: 700; font-size: 15px; margin-bottom: 4px; color: #111b21; }
        .wa-preview-msg .wa-body { font-size: 14px; color: #111b21; white-space: pre-wrap; line-height: 1.4; }
        .wa-preview-msg .wa-footer { font-size: 12px; color: #667781; margin-top: 4px; }
        .wa-preview-msg .wa-buttons { margin-top: 8px; display: flex; flex-direction: column; gap: 6px; }
        .wa-preview-msg .wa-btn { display: block; text-align: center; padding: 8px; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; }
        .wa-btn-primary { background: #fff; color: #008069; border: 1px solid #008069; }
        .wa-btn-outline { background: transparent; color: #008069; border: 1px solid #008069; }
      </style>

      <div class="row g-3">
        <div class="col-md-7">
          <div class="card border-info">
            <div class="card-body p-3">
              <h5 class="mb-3">${editId ? 'Edit Template' : 'Create Template'}</h5>
              <div class="row g-2 mb-2">
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Template Name</label>
                  <input type="text" id="tplName" class="form-control form-control-sm" value="${tpl.name}" placeholder="order_update_v1">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-bold">Category</label>
                  <select id="tplCategory" class="form-select form-select-sm">
                    <option value="UTILITY" ${tpl.category==='UTILITY'?'selected':''}>Utility</option>
                    <option value="MARKETING" ${tpl.category==='MARKETING'?'selected':''}>Marketing</option>
                    <option value="AUTHENTICATION" ${tpl.category==='AUTHENTICATION'?'selected':''}>Authentication</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-bold">Language</label>
                  <select id="tplLanguage" class="form-select form-select-sm">
                    <option value="en_US" ${tpl.language==='en_US'?'selected':''}>English (US)</option>
                    <option value="en_GB" ${tpl.language==='en_GB'?'selected':''}>English (UK)</option>
                    <option value="hi" ${tpl.language==='hi'?'selected':''}>Hindi</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Header Type</label>
                  <select id="tplHeaderType" class="form-select form-select-sm" onchange="Templates.toggleHeaderFields(); Templates.updatePreview();">
                    <option value="none" ${tpl.headerType==='none'?'selected':''}>None</option>
                    <option value="text" ${tpl.headerType==='text'?'selected':''}>Text</option>
                    <option value="image" ${tpl.headerType==='image'?'selected':''}>Image</option>
                    <option value="video" ${tpl.headerType==='video'?'selected':''}>Video</option>
                    <option value="document" ${tpl.headerType==='document'?'selected':''}>Document/PDF</option>
                  </select>
                </div>
                <div class="col-md-6" id="headerTextField" style="display:${tpl.headerType==='text'?'block':'none'}">
                  <label class="form-label small fw-bold">Header Text</label>
                  <input type="text" id="tplHeaderValue" class="form-control form-control-sm" value="${tpl.headerType==='text'?tpl.headerValue||'':''}" placeholder="Order Update" oninput="Templates.updatePreview()">
                </div>
                <div class="col-md-6" id="headerMediaField" style="display:${(tpl.headerType==='image'||tpl.headerType==='video'||tpl.headerType==='document')?'block':'none'}">
                  <label class="form-label small fw-bold">Upload sample media for Meta approval</label>
                  <input type="file" id="tplMediaFile" class="form-control form-control-sm" onchange="Templates.updatePreview()">
                </div>
              </div>

              <div class="d-flex gap-2 my-2">
                <button type="button" class="btn btn-outline-secondary btn-sm" onclick="Templates.insertFormat('bold')"><strong>B</strong></button>
                <button type="button" class="btn btn-outline-secondary btn-sm" onclick="Templates.insertFormat('italic')"><em>I</em></button>
              </div>

              <div class="mb-2">
                <label class="form-label small fw-bold">Body</label>
                <textarea id="tplBody" class="form-control form-control-sm" rows="5" placeholder="Hi {{1}}, your order is ready." oninput="Templates.updatePreview()">${tpl.body}</textarea>
              </div>

              <div class="border rounded p-2 mb-2 bg-light">
                <strong>Variable List</strong>
                <div class="input-group input-group-sm mt-1">
                  <input type="text" id="varName" class="form-control" placeholder="variable name">
                  <button class="btn btn-outline-primary" onclick="Templates.insertVariable()">Insert</button>
                </div>
              </div>

              <div class="mb-2">
                <label class="form-label small fw-bold">Footer (Optional)</label>
                <input type="text" id="tplFooter" class="form-control form-control-sm" value="${tpl.footer||''}" placeholder="Reply STOP to opt out." oninput="Templates.updatePreview()">
              </div>

              <div class="form-check mb-2">
                <input class="form-check-input" type="checkbox" id="tplQuickReply">
                <label class="form-check-label small fw-bold">Add Quick Reply Buttons</label>
              </div>

              <div class="mb-2">
                <label class="form-label small fw-bold">Call-to-Action</label>
                <select id="tplButtonType" class="form-select form-select-sm" onchange="Templates.toggleCTAFields(); Templates.updatePreview();">
                  <option value="none" ${tpl.buttonType==='none'?'selected':''}>No CTA</option>
                  <option value="visit" ${tpl.buttonType==='visit'?'selected':''}>Visit Website</option>
                  <option value="call" ${tpl.buttonType==='call'?'selected':''}>Call Number</option>
                  <option value="both" ${tpl.buttonType==='both'?'selected':''}>Website + Call</option>
                </select>
              </div>

              <div id="ctaFields" style="display:${tpl.buttonType!=='none'?'block':'none'}">
                <div class="row g-2" id="ctaVisitFields" style="display:${(tpl.buttonType==='visit'||tpl.buttonType==='both')?'flex':'none'}">
                  <div class="col-6"><input type="text" id="tplButtonText" class="form-control form-control-sm" value="${tpl.buttonText||''}" placeholder="Button Text" oninput="Templates.updatePreview()"></div>
                  <div class="col-6"><input type="text" id="tplButtonUrl" class="form-control form-control-sm" value="${tpl.buttonUrl||''}" placeholder="URL" oninput="Templates.updatePreview()"></div>
                </div>
                <div class="row g-2 mt-1" id="ctaCallFields" style="display:${(tpl.buttonType==='call'||tpl.buttonType==='both')?'flex':'none'}">
                  <div class="col-6"><input type="text" id="tplButtonPhone" class="form-control form-control-sm" value="${tpl.buttonPhone||''}" placeholder="Call Text" oninput="Templates.updatePreview()"></div>
                  <div class="col-6"><input type="text" id="tplButtonPhone2" class="form-control form-control-sm" value="${tpl.buttonPhone2||''}" placeholder="+91..." oninput="Templates.updatePreview()"></div>
                </div>
              </div>

              <div class="d-flex gap-2 mt-3 pt-2 border-top flex-wrap">
                <button class="btn btn-outline-secondary btn-sm" onclick="Templates.saveTemplate('${editId||''}','Draft')"><i class="far fa-save me-1"></i> Save Draft</button>
                <button class="btn btn-success btn-sm" onclick="Templates.saveTemplate('${editId||''}','Pending')"><i class="fas fa-paper-plane me-1"></i> Send For Approval</button>
                ${editId ? `<button class="btn btn-warning btn-sm" onclick="Templates.submitToMeta('${editId}')"><i class="fab fa-meta me-1"></i> Submit to Meta</button>` : ''}
                ${editId ? `<button class="btn btn-outline-primary btn-sm" onclick="Templates.refreshMetaStatus('${editId}')"><i class="fas fa-sync-alt me-1"></i> Refresh</button>` : ''}
                <button class="btn btn-light btn-sm ms-auto" onclick="Templates.render()">Cancel</button>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-5">
          <div class="card border-light">
            <div class="card-body text-center">
              <h6 class="mb-2">Template Preview</h6>
              <div class="wa-preview-phone" id="previewPhone"></div>
              <h6 class="mt-3">Approval Checklist</h6>
              <ul class="small text-start" id="checklist" style="color:#991b1b;"></ul>
            </div>
          </div>
        </div>
      </div>
    `;
    document.getElementById('templateBuilderContainer').innerHTML = html;
    setTimeout(() => Templates.updatePreview(), 100);
  },

  updatePreview() {
    const headerType = document.getElementById('tplHeaderType')?.value || 'none';
    const headerVal = document.getElementById('tplHeaderValue')?.value || '';
    const body = document.getElementById('tplBody')?.value || '';
    const footer = document.getElementById('tplFooter')?.value || '';
    const btnType = document.getElementById('tplButtonType')?.value || 'none';
    const btnText = document.getElementById('tplButtonText')?.value || 'Visit';
    const btnCall = document.getElementById('tplButtonPhone')?.value || 'Call';
    const fileEl = document.getElementById('tplMediaFile');
    const phone = document.getElementById('previewPhone');
    if (!phone) return;

    let headerHtml = '';
    if (headerType === 'text' && headerVal) {
      headerHtml = `<div class="wa-header-text">${headerVal}</div>`;
    } else if (headerType === 'image') {
      headerHtml = fileEl?.files[0] ? `<img class="wa-header-img" src="${URL.createObjectURL(fileEl.files[0])}" alt="Header">` : `<img class="wa-header-img" src="https://static.xx.fbcdn.net/rsrc.php/yV/r/CK4w8uZmN56.webp" alt="Sample">`;
    } else if (headerType === 'video') {
      headerHtml = `<div class="wa-header-video">▶ Video Preview</div>`;
    } else if (headerType === 'document') {
      headerHtml = `<div class="wa-header-doc">📄 Document.pdf</div>`;
    }

    let btnHtml = '';
    if (btnType === 'visit') btnHtml = `<a class="wa-btn wa-btn-primary">${btnText}</a>`;
    else if (btnType === 'call') btnHtml = `<a class="wa-btn wa-btn-outline">${btnCall}</a>`;
    else if (btnType === 'both') btnHtml = `<a class="wa-btn wa-btn-primary">${btnText}</a><a class="wa-btn wa-btn-outline">${btnCall}</a>`;

    phone.innerHTML = `
      <div class="wa-preview-msg">
        ${headerHtml}
        <div class="wa-body">${body || 'Your message will appear here.'}</div>
        ${footer ? `<div class="wa-footer">${footer}</div>` : ''}
        ${btnHtml ? `<div class="wa-buttons">${btnHtml}</div>` : ''}
      </div>
    `;

    const btnUrl = document.getElementById('tplButtonUrl')?.value || '';
    const btnCallNum = document.getElementById('tplButtonPhone2')?.value || '';
    const checks = [];
    if (!body) checks.push('Body message is required.');
    if (headerType === 'text' && !headerVal) checks.push('Header text is required.');
    if ((btnType === 'visit' || btnType === 'both') && !btnUrl) checks.push('CTA website URL is required.');
    if ((btnType === 'call' || btnType === 'both') && !btnCallNum) checks.push('CTA phone number is required.');
    const cl = document.getElementById('checklist');
    if (cl) cl.innerHTML = checks.map(c => `<li>${c}</li>`).join('') || '<li class="text-success">All checks passed!</li>';
  },

  toggleHeaderFields() {
    const val = document.getElementById('tplHeaderType').value;
    document.getElementById('headerTextField').style.display = val === 'text' ? 'block' : 'none';
    document.getElementById('headerMediaField').style.display = (val === 'image' || val === 'video' || val === 'document') ? 'block' : 'none';
  },

  toggleCTAFields() {
    const val = document.getElementById('tplButtonType').value;
    document.getElementById('ctaFields').style.display = val !== 'none' ? 'block' : 'none';
    document.getElementById('ctaVisitFields').style.display = (val === 'visit' || val === 'both') ? 'flex' : 'none';
    document.getElementById('ctaCallFields').style.display = (val === 'call' || val === 'both') ? 'flex' : 'none';
  },

  insertFormat(type) {
    const el = document.getElementById('tplBody');
    const s = el.selectionStart, e = el.selectionEnd;
    el.value = el.value.substring(0, s) + (type === 'bold' ? '*' : '_') + el.value.substring(s, e) + (type === 'bold' ? '*' : '_') + el.value.substring(e);
    Templates.updatePreview();
  },

  insertVariable() {
    const name = document.getElementById('varName').value.trim();
    if (!name) return;
    const el = document.getElementById('tplBody');
    const num = (el.value.match(/{{/g) || []).length + 1;
    el.value += ` {{${num}}}`;
    Templates.updatePreview();
  },

  async saveTemplate(editId, status) {
    const headerType = document.getElementById('tplHeaderType').value;
    let headerValue = document.getElementById('tplHeaderValue')?.value?.trim() || '';
    const data = {
      name: document.getElementById('tplName').value.trim(),
      category: document.getElementById('tplCategory').value,
      language: document.getElementById('tplLanguage').value,
      headerType, headerValue,
      body: document.getElementById('tplBody').value.trim(),
      footer: document.getElementById('tplFooter').value.trim(),
      buttonType: document.getElementById('tplButtonType').value,
      buttonText: document.getElementById('tplButtonText')?.value?.trim() || '',
      buttonUrl: document.getElementById('tplButtonUrl')?.value?.trim() || '',
      buttonPhone: document.getElementById('tplButtonPhone')?.value?.trim() || '',
      buttonPhone2: document.getElementById('tplButtonPhone2')?.value?.trim() || '',
      quickReply: document.getElementById('tplQuickReply')?.checked || false,
      status, updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    if (!data.name || !data.body) return alert('Name & Body required!');
    try {
      if (editId) await db.collection('templates').doc(editId).update(data);
      else { data.createdAt = firebase.firestore.FieldValue.serverTimestamp(); await db.collection('templates').add(data); }
      alert('✅ Saved!'); this.render();
    } catch (err) { alert('Error: ' + err.message); }
  },

  async submitToMeta(templateId) {
    const doc = await db.collection('templates').doc(templateId).get();
    const tpl = doc.data();
    const cfg = (await db.collection('settings').doc('whatsapp').get()).data();
    if (!cfg?.accessToken) return alert('WhatsApp not configured.');

    const wabaId = '342856675576986';
    const components = [];

    if (tpl.headerType === 'text' && tpl.headerValue) components.push({ type: 'HEADER', format: 'TEXT', text: tpl.headerValue });
    else if (tpl.headerType === 'image') components.push({ type: 'HEADER', format: 'IMAGE', example: { header_handle: [tpl.headerValue || 'https://example.com/img.jpg'] } });
    else if (tpl.headerType === 'video') components.push({ type: 'HEADER', format: 'VIDEO', example: { header_handle: [tpl.headerValue || 'https://example.com/vid.mp4'] } });
    else if (tpl.headerType === 'document') components.push({ type: 'HEADER', format: 'DOCUMENT', example: { header_handle: [tpl.headerValue || 'https://example.com/doc.pdf'] } });

    components.push({ type: 'BODY', text: tpl.body });
    if (tpl.footer) components.push({ type: 'FOOTER', text: tpl.footer });

    const buttons = [];
    if (tpl.quickReply) { buttons.push({ type: 'QUICK_REPLY', text: 'Yes' }, { type: 'QUICK_REPLY', text: 'No' }); }
    if (tpl.buttonType === 'visit' || tpl.buttonType === 'both') buttons.push({ type: 'URL', text: tpl.buttonText || 'Visit', url: tpl.buttonUrl || 'https://example.com' });
    if (tpl.buttonType === 'call' || tpl.buttonType === 'both') buttons.push({ type: 'PHONE_NUMBER', text: tpl.buttonPhone || 'Call', phone_number: tpl.buttonPhone2 || '+919999999999' });
    if (buttons.length) components.push({ type: 'BUTTONS', buttons });

    const payload = {
      name: tpl.name.toLowerCase().replace(/[^a-z0-9_]/g, '_').substring(0, 60),
      category: tpl.category,
      language: tpl.language,
      components
    };

    try {
      const res = await fetch(`https://graph.facebook.com/v22.0/${wabaId}/message_templates`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + cfg.accessToken, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.ok && result.id) {
        await db.collection('templates').doc(templateId).update({
          status: 'Submitted', metaTemplateId: result.id,
          metaStatus: result.status || 'PENDING',
          submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert('✅ Submitted to Meta! ID: ' + result.id);
        this.render();
      } else {
        alert('❌ Error: ' + JSON.stringify(result.error || result));
      }
    } catch (err) { alert('Error: ' + err.message); }
  },

  async refreshMetaStatus(templateId) {
    const doc = await db.collection('templates').doc(templateId).get();
    const tpl = doc.data();
    if (!tpl.name) return alert('Template name not found.');
    const cfg = (await db.collection('settings').doc('whatsapp').get()).data();
    if (!cfg?.accessToken) return alert('WhatsApp not configured.');

    try {
      const res = await fetch(`https://graph.facebook.com/v22.0/342856675576986/message_templates?name=${tpl.name}`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + cfg.accessToken }
      });
      const result = await res.json();
      if (res.ok && result.data && result.data.length > 0) {
        const metaTpl = result.data[0];
        await db.collection('templates').doc(templateId).update({
          metaStatus: metaTpl.status || 'PENDING',
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert('✅ Status refreshed: ' + metaTpl.status);
        this.render();
      } else {
        alert('⚠️ Template not found on Meta yet.');
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
      const result = await res.json();
      alert(res.ok ? '✅ Sent!' : '❌ ' + (result.error?.message || 'Failed'));
    } catch (err) { alert('Error: ' + err.message); }
  },

  async deleteTemplate(id) {
    if (!confirm('Delete?')) return;
    await db.collection('templates').doc(id).delete();
    alert('Deleted.'); this.render();
  }
};
