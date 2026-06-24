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
              <tr><th>Template Name</th><th>Category</th><th>Language</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              ${templates.length === 0
                ? '<tr><td colspan="5" class="text-center text-muted py-4">No templates yet. Create your first template!</td></tr>'
                : templates.map(tpl => `
                  <tr>
                    <td><strong>${tpl.name || '-'}</strong></td>
                    <td><span class="badge bg-${tpl.category==='MARKETING'?'warning':tpl.category==='UTILITY'?'info':'secondary'}">${tpl.category || '-'}</span></td>
                    <td>${tpl.language || 'en'}</td>
                    <td><span class="badge bg-${tpl.status==='Approved'?'success':'warning'}">${tpl.status || 'Draft'}</span></td>
                    <td>
                      <button class="btn btn-sm btn-outline-info me-1" onclick="Templates.showBuilder('${tpl.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                      <button class="btn btn-sm btn-success me-1" onclick="Templates.sendTemplate('${tpl.id}')" title="Send Test"><i class="fab fa-whatsapp"></i></button>
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
      <div class="row g-3">
        <div class="col-md-7">
          <div class="card border-info">
            <div class="card-body p-3">
              <h5 class="mb-3">Create Template</h5>

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
                  <select id="tplHeaderType" class="form-select form-select-sm" onchange="Templates.toggleHeaderFields()">
                    <option value="none" ${tpl.headerType==='none'?'selected':''}>None</option>
                    <option value="text" ${tpl.headerType==='text'?'selected':''}>Text</option>
                    <option value="image" ${tpl.headerType==='image'?'selected':''}>Image</option>
                    <option value="video" ${tpl.headerType==='video'?'selected':''}>Video</option>
                    <option value="document" ${tpl.headerType==='document'?'selected':''}>Document/PDF</option>
                  </select>
                </div>

                <!-- Text Header Field -->
                <div class="col-md-6" id="headerTextField" style="display:${tpl.headerType==='text'?'block':'none'}">
                  <label class="form-label small fw-bold">Header Text</label>
                  <input type="text" id="tplHeaderValue" class="form-control form-control-sm" value="${tpl.headerType==='text'?tpl.headerValue||'':''}" placeholder="Order Update">
                </div>

                <!-- Media Upload Field -->
                <div class="col-md-6" id="headerMediaField" style="display:${(tpl.headerType==='image'||tpl.headerType==='video'||tpl.headerType==='document')?'block':'none'}">
                  <label class="form-label small fw-bold">Upload sample media for Meta approval</label>
                  <small class="text-muted d-block mb-1">This reduces rejection for media templates.</small>
                  <input type="file" id="tplMediaFile" class="form-control form-control-sm" accept="${tpl.headerType==='image'?'image/*':tpl.headerType==='video'?'video/*':tpl.headerType==='document'?'.pdf,.doc,.docx':''}">
                  ${tpl.headerValue && tpl.headerType!=='text' ? `<small class="text-success">Current: ${tpl.headerValue}</small>` : ''}
                </div>
              </div>

              <div class="d-flex gap-2 my-2">
                <button type="button" class="btn btn-outline-secondary btn-sm" onclick="Templates.insertFormat('bold')"><strong>B</strong> Bold</button>
                <button type="button" class="btn btn-outline-secondary btn-sm" onclick="Templates.insertFormat('italic')"><em>I</em> Italic</button>
              </div>

              <div class="mb-2">
                <label class="form-label small fw-bold">Body</label>
                <textarea id="tplBody" class="form-control form-control-sm" rows="7" placeholder="Hi {{1}}, your order *{{2}}* is ready.">${tpl.body}</textarea>
              </div>

              <div class="alert alert-light border small py-2 px-3">
                <strong>How to use variables</strong>
                <p class="mb-1">Variables are dynamic values that change per customer.</p>
                <span class="badge bg-warning text-dark me-1">{{1}} = Customer Name</span>
                <span class="badge bg-warning text-dark me-1">{{2}} = Order Number</span>
                <span class="badge bg-warning text-dark me-1">{{3}} = Delivery Date</span>
                <p class="mt-1 mb-0">Example: <code>Hi {{1}}, your order *{{2}}* will arrive on {{3}}.</code></p>
                <p class="mb-0">Text style tips: <code>*bold*</code>, <code>_italic_</code></p>
              </div>

              <div class="border rounded p-2 mb-2 bg-light">
                <strong>Variable List (Type Your Own Variable Name)</strong>
                <p class="small text-muted mb-1">Type normal name (example: <code>customer name</code>). System auto-maps to Meta format like <code>{{3}}</code>.</p>
                <div class="input-group input-group-sm">
                  <input type="text" id="varName" class="form-control" placeholder="your variable name">
                  <button class="btn btn-outline-primary" onclick="Templates.insertVariable()">Insert Variable</button>
                </div>
                <small class="text-muted">These values can be mapped at send time from lead fields, CSV columns, or manual input.</small>
              </div>

              <div class="mb-2">
                <label class="form-label small fw-bold">Footer (Optional)</label>
                <input type="text" id="tplFooter" class="form-control form-control-sm" value="${tpl.footer||''}" placeholder="Reply STOP to opt out.">
              </div>

              <div class="form-check mb-2">
                <input class="form-check-input" type="checkbox" id="tplQuickReply">
                <label class="form-check-label small fw-bold">Add Quick Reply Buttons</label>
              </div>

              <div class="mb-2">
                <label class="form-label small fw-bold">Call-to-Action</label>
                <select id="tplButtonType" class="form-select form-select-sm" onchange="Templates.toggleCTAFields()">
                  <option value="none" ${tpl.buttonType==='none'?'selected':''}>No CTA</option>
                  <option value="visit" ${tpl.buttonType==='visit'?'selected':''}>Visit Website</option>
                  <option value="call" ${tpl.buttonType==='call'?'selected':''}>Call Number</option>
                  <option value="both" ${tpl.buttonType==='both'?'selected':''}>Website + Call</option>
                </select>
              </div>

              <div id="ctaFields" style="display:${tpl.buttonType!=='none'?'block':'none'}">
                <div class="row g-2" id="ctaVisitFields" style="display:${(tpl.buttonType==='visit'||tpl.buttonType==='both')?'flex':'none'}">
                  <div class="col-md-6">
                    <label class="form-label small">Website Button Text</label>
                    <input type="text" id="tplButtonText" class="form-control form-control-sm" value="${tpl.buttonText||''}" placeholder="Track Order">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small">Website URL</label>
                    <input type="text" id="tplButtonUrl" class="form-control form-control-sm" value="${tpl.buttonUrl||''}" placeholder="https://example.com/track">
                  </div>
                </div>
                <div class="row g-2 mt-1" id="ctaCallFields" style="display:${(tpl.buttonType==='call'||tpl.buttonType==='both')?'flex':'none'}">
                  <div class="col-md-6">
                    <label class="form-label small">Call Button Text</label>
                    <input type="text" id="tplButtonPhone" class="form-control form-control-sm" value="${tpl.buttonPhone||''}" placeholder="Call Support">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small">Phone Number</label>
                    <input type="text" id="tplButtonPhone2" class="form-control form-control-sm" value="${tpl.buttonPhone2||''}" placeholder="+91XXXXXXXXXX">
                  </div>
                </div>
              </div>

              <div class="d-flex gap-2 mt-3 pt-2 border-top">
                <button class="btn btn-outline-secondary btn-sm" onclick="Templates.saveTemplate('${editId||''}','Draft')"><i class="far fa-save me-1"></i> Save Draft</button>
                <button class="btn btn-success btn-sm" onclick="Templates.saveTemplate('${editId||''}','Pending')"><i class="fas fa-paper-plane me-1"></i> Send For Approval</button>
                <button class="btn btn-light btn-sm ms-auto" onclick="Templates.render()">Cancel</button>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-5">
          <div class="card border-light">
            <div class="card-body">
              <h6>Live Preview</h6>
              <div class="border rounded p-3 bg-light" id="previewArea">
                <p class="text-muted mb-0">Your message preview will appear here.</p>
              </div>
              <h6 class="mt-3">Approval Checklist</h6>
              <ul class="small" id="checklist" style="color:#991b1b;"></ul>
            </div>
          </div>
        </div>
      </div>
    `;
    document.getElementById('templateBuilderContainer').innerHTML = html;

    const updatePreviewAndChecklist = () => {
      const headerType = document.getElementById('tplHeaderType').value;
      const headerVal = document.getElementById('tplHeaderValue')?.value || '';
      const body = document.getElementById('tplBody').value;
      const footer = document.getElementById('tplFooter').value;
      const btnType = document.getElementById('tplButtonType').value;
      const btnUrl = document.getElementById('tplButtonUrl')?.value || '';
      const btnPhone = document.getElementById('tplButtonPhone2')?.value || '';

      let prev = '';
      if (headerType === 'text' && headerVal) prev += `<p class="fw-bold mb-1">${headerVal}</p>`;
      else if (headerType === 'image') prev += `<p class="fst-italic mb-1">[Image Header]</p>`;
      else if (headerType === 'video') prev += `<p class="fst-italic mb-1">[Video Header]</p>`;
      else if (headerType === 'document') prev += `<p class="fst-italic mb-1">[Document Header]</p>`;
      prev += `<p class="mb-1">${body || 'Your message preview will appear here.'}</p>`;
      if (footer) prev += `<small class="text-muted">${footer}</small>`;
      document.getElementById('previewArea').innerHTML = prev || '<p class="text-muted mb-0">Your message preview will appear here.</p>';

      const checks = [];
      if (!body) checks.push('Body message is required.');
      if (headerType === 'text' && !headerVal) checks.push('Header text is required when header type is Text.');
      if ((btnType === 'visit' || btnType === 'both') && !btnUrl) checks.push('CTA website URL is required.');
      if ((btnType === 'call' || btnType === 'both') && !btnPhone) checks.push('CTA phone number is required.');
      document.getElementById('checklist').innerHTML = checks.map(c => `<li>${c}</li>`).join('');
    };

    ['tplBody', 'tplHeaderValue', 'tplFooter', 'tplHeaderType', 'tplButtonType', 'tplButtonUrl', 'tplButtonPhone2'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', updatePreviewAndChecklist);
    });
    updatePreviewAndChecklist();
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
    const txt = el.value.substring(s, e);
    const fmt = type === 'bold' ? '*' + txt + '*' : '_' + txt + '_';
    el.value = el.value.substring(0, s) + fmt + el.value.substring(e);
  },

  insertVariable() {
    const name = document.getElementById('varName').value.trim();
    if (!name) return;
    const el = document.getElementById('tplBody');
    const num = (el.value.match(/{{/g) || []).length + 1;
    el.value += ` {{${num}}}`;
  },

  async saveTemplate(editId, status) {
    const headerType = document.getElementById('tplHeaderType').value;
    let headerValue = '';

    if (headerType === 'text') {
      headerValue = document.getElementById('tplHeaderValue')?.value?.trim() || '';
    } else if (headerType === 'image' || headerType === 'video' || headerType === 'document') {
      const fileInput = document.getElementById('tplMediaFile');
      if (fileInput?.files[0]) {
        headerValue = fileInput.files[0].name; // Real app me Firebase Storage me upload karna
      }
    }

    const data = {
      name: document.getElementById('tplName').value.trim(),
      category: document.getElementById('tplCategory').value,
      language: document.getElementById('tplLanguage').value,
      headerType,
      headerValue,
      body: document.getElementById('tplBody').value.trim(),
      footer: document.getElementById('tplFooter').value.trim(),
      buttonType: document.getElementById('tplButtonType').value,
      buttonText: document.getElementById('tplButtonText')?.value?.trim() || '',
      buttonUrl: document.getElementById('tplButtonUrl')?.value?.trim() || '',
      buttonPhone: document.getElementById('tplButtonPhone')?.value?.trim() || '',
      buttonPhone2: document.getElementById('tplButtonPhone2')?.value?.trim() || '',
      quickReply: document.getElementById('tplQuickReply')?.checked || false,
      status,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (!data.name) return alert('Template Name is required!');
    if (!data.body) return alert('Body is required!');

    try {
      if (editId) {
        await db.collection('templates').doc(editId).update(data);
      } else {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('templates').add(data);
      }
      alert('✅ Template ' + (status === 'Draft' ? 'saved!' : 'submitted!'));
      this.render();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  },

  async sendTemplate(id) {
    let phone = prompt('Enter phone number (+91 or 10-digit):');
    if (!phone) return;
    phone = phone.replace(/\s|-/g, '');
    if (!phone.startsWith('+') && phone.length === 10) phone = '+91' + phone;
    if (phone.startsWith('91') && phone.length === 12) phone = '+' + phone;

    const doc = await db.collection('templates').doc(id).get();
    const tpl = doc.data();
    let config = {};
    try {
      const snap = await db.collection('settings').doc('whatsapp').get();
      if (snap.exists) config = snap.data();
    } catch (err) {}
    if (!config.phoneNumberId || !config.accessToken) return alert('WhatsApp not configured.');

    try {
      const payload = {
        messaging_product: 'whatsapp', to: phone, type: 'template',
        template: { name: tpl.name, language: { code: tpl.language || 'en' } }
      };
      const res = await fetch(`https://graph.facebook.com/v22.0/${config.phoneNumberId}/messages`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + config.accessToken, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      alert(res.ok && result.messages ? '✅ Sent!' : '❌ ' + (result.error?.message || 'Failed'));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  },

  async deleteTemplate(id) {
    if (!confirm('Delete this template?')) return;
    try {
      await db.collection('templates').doc(id).delete();
      alert('Template deleted.');
      this.render();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }
};
