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
          <h4 class="mb-0"><i class="fas fa-layer-group text-info me-2"></i>WhatsApp Message Templates</h4>
          <button class="btn btn-primary btn-sm" onclick="Templates.showAddForm()">
            <i class="fas fa-plus me-1"></i> Create Template
          </button>
        </div>
        <div id="templateFormContainer"></div>
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr><th>Name</th><th>Category</th><th>Header</th><th>Language</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              ${templates.length === 0
                ? '<tr><td colspan="6" class="text-center text-muted py-4">No templates yet.</td></tr>'
                : templates.map(tpl => `
                  <tr>
                    <td><strong>${tpl.name || '-'}</strong></td>
                    <td><span class="badge bg-${tpl.category==='MARKETING'?'warning':tpl.category==='UTILITY'?'info':'secondary'}">${tpl.category || '-'}</span></td>
                    <td>${tpl.headerType || 'None'}</td>
                    <td>${tpl.language || 'en'}</td>
                    <td><span class="badge bg-${tpl.status==='Approved'?'success':'warning'}">${tpl.status || 'Draft'}</span></td>
                    <td>
                      <button class="btn btn-sm btn-success me-1" onclick="Templates.sendTemplate('${tpl.id}')" title="Send Test"><i class="fab fa-whatsapp"></i></button>
                      <button class="btn btn-sm btn-outline-danger" onclick="Templates.deleteTemplate('${tpl.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                  </tr>
                `).join('')
              }
            </tbody>
          </table>
        </div>
        <div class="alert alert-info mt-3">
          <strong><i class="fas fa-info-circle me-1"></i>Note:</strong> WhatsApp templates must be approved by Meta before use.
          <a href="https://business.facebook.com/wa/manage/message-templates/" target="_blank" class="ms-2">Manage on Meta ↗</a>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  showAddForm() {
    const formHtml = `
      <div class="card mb-3 border-info">
        <div class="card-body">
          <h5 class="card-title"><i class="fas fa-plus-circle me-1"></i>Create New Template</h5>
          <div class="row g-2">
            <div class="col-md-6">
              <label class="form-label small">Template Name *</label>
              <input type="text" id="tplName" class="form-control form-control-sm" placeholder="e.g. welcome_msg">
            </div>
            <div class="col-md-3">
              <label class="form-label small">Category *</label>
              <select id="tplCategory" class="form-select form-select-sm">
                <option value="UTILITY">Utility</option>
                <option value="MARKETING">Marketing</option>
                <option value="AUTHENTICATION">Authentication</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label small">Language *</label>
              <select id="tplLanguage" class="form-select form-select-sm">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="en_US">English (US)</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label small">Header Type</label>
              <select id="tplHeaderType" class="form-select form-select-sm">
                <option value="NONE">None</option>
                <option value="TEXT">Text</option>
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
                <option value="DOCUMENT">Document</option>
                <option value="LOCATION">Location</option>
              </select>
            </div>
            <div class="col-md-8">
              <label class="form-label small">Header Text / URL</label>
              <input type="text" id="tplHeaderValue" class="form-control form-control-sm" placeholder="Header text or media URL">
            </div>
            <div class="col-12">
              <label class="form-label small">Body * (use {{1}}, {{2}} for variables)</label>
              <textarea id="tplBody" class="form-control form-control-sm" rows="3" placeholder="Hello {{1}}, your order {{2}} is confirmed! Amount: {{3}}"></textarea>
            </div>
            <div class="col-md-6">
              <label class="form-label small">Footer (Optional)</label>
              <input type="text" id="tplFooter" class="form-control form-control-sm" placeholder="e.g. Thank you for choosing us!">
            </div>
            <div class="col-md-6">
              <label class="form-label small">Button Type</label>
              <select id="tplButtonType" class="form-select form-select-sm">
                <option value="NONE">None</option>
                <option value="QUICK_REPLY">Quick Reply</option>
                <option value="URL">Visit Website</option>
                <option value="PHONE_NUMBER">Call Phone</option>
                <option value="COPY_CODE">Copy Code</option>
                <option value="FLOW">Start Flow</option>
                <option value="CATALOG">View Catalog</option>
              </select>
            </div>
            <div class="col-md-6" id="buttonLabelGroup">
              <label class="form-label small">Button Label(s) (comma separated)</label>
              <input type="text" id="tplButtonLabels" class="form-control form-control-sm" placeholder="e.g. Yes, No, Talk to Agent">
            </div>
            <div class="col-12 mt-3">
              <button class="btn btn-success btn-sm me-2" onclick="Templates.addTemplate()"><i class="fas fa-save me-1"></i> Save Template</button>
              <button class="btn btn-secondary btn-sm" onclick="Templates.render()">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.getElementById('templateFormContainer').innerHTML = formHtml;

    // Button type change hone par label group dikhana/chhupana
    document.getElementById('tplButtonType').addEventListener('change', function() {
      const lbl = document.getElementById('buttonLabelGroup');
      if (this.value === 'NONE' || this.value === 'CATALOG') {
        lbl.style.display = 'none';
      } else {
        lbl.style.display = 'block';
      }
    });
  },

  async addTemplate() {
    const name = document.getElementById('tplName').value.trim();
    const category = document.getElementById('tplCategory').value;
    const language = document.getElementById('tplLanguage').value;
    const headerType = document.getElementById('tplHeaderType').value;
    const headerValue = document.getElementById('tplHeaderValue').value.trim();
    const body = document.getElementById('tplBody').value.trim();
    const footer = document.getElementById('tplFooter').value.trim();
    const buttonType = document.getElementById('tplButtonType').value;
    const buttonLabels = document.getElementById('tplButtonLabels').value.trim();

    if (!name) return alert('Template Name is required!');
    if (!body) return alert('Template Body is required!');

    try {
      await db.collection('templates').add({
        name, category, language,
        headerType, headerValue,
        body, footer,
        buttonType, buttonLabels,
        status: 'Draft',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert('✅ Template saved successfully! Submit to Meta for approval.');
      this.render();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  },

  async sendTemplate(id) {
    let phone = prompt('Enter phone number to send test (+91 or 10-digit):');
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

    if (!config.phoneNumberId || !config.accessToken) {
      return alert('WhatsApp not configured.');
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

      const res = await fetch(`https://graph.facebook.com/v22.0/${config.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (res.ok && result.messages) {
        alert('✅ Template message sent!');
      } else {
        alert('❌ Error: ' + (result.error?.message || 'Failed'));
      }
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
