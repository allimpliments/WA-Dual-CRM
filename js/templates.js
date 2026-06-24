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
          <h4 class="mb-0"><i class="fas fa-layer-group text-info me-2"></i>Message Templates</h4>
          <button class="btn btn-primary btn-sm" onclick="Templates.showAddForm()">
            <i class="fas fa-plus me-1"></i> Create Template
          </button>
        </div>
        <div id="templateFormContainer"></div>
        <div class="table-responsive">
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
                    <td><span class="badge bg-secondary">${tpl.category || 'Marketing'}</span></td>
                    <td>${tpl.language || 'en'}</td>
                    <td><span class="badge bg-${tpl.status === 'Approved' ? 'success' : 'warning'}">${tpl.status || 'Draft'}</span></td>
                    <td>
                      <button class="btn btn-sm btn-success me-1" onclick="Templates.sendTemplate('${tpl.id}')" title="Send Test">
                        <i class="fab fa-whatsapp"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" onclick="Templates.deleteTemplate('${tpl.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')
              }
            </tbody>
          </table>
        </div>

        <div class="alert alert-info mt-3">
          <strong>Note:</strong> WhatsApp templates must be approved by Meta before use.
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
          <h5 class="card-title">Create New Template</h5>
          <div class="row g-2">
            <div class="col-md-6">
              <input type="text" id="tplName" class="form-control form-control-sm" placeholder="Template Name * (e.g. welcome_msg)">
            </div>
            <div class="col-md-3">
              <select id="tplCategory" class="form-select form-select-sm">
                <option value="MARKETING">Marketing</option>
                <option value="UTILITY">Utility</option>
                <option value="AUTHENTICATION">Authentication</option>
              </select>
            </div>
            <div class="col-md-3">
              <select id="tplLanguage" class="form-select form-select-sm">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="en_US">English (US)</option>
              </select>
            </div>
            <div class="col-12">
              <textarea id="tplBody" class="form-control form-control-sm" rows="3" placeholder="Template body. Use {{1}} for variables. Example: Hello {{1}}, your order {{2}} is confirmed!"></textarea>
            </div>
            <div class="col-12">
              <label class="form-label small text-muted">Header (Optional)</label>
              <input type="text" id="tplHeader" class="form-control form-control-sm" placeholder="e.g. Order Confirmation">
            </div>
            <div class="col-12">
              <label class="form-label small text-muted">Footer (Optional)</label>
              <input type="text" id="tplFooter" class="form-control form-control-sm" placeholder="e.g. Thank you for choosing us!">
            </div>
            <div class="col-12 mt-2">
              <button class="btn btn-success btn-sm me-2" onclick="Templates.addTemplate()"><i class="fas fa-save me-1"></i> Save Template</button>
              <button class="btn btn-secondary btn-sm" onclick="Templates.render()">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.getElementById('templateFormContainer').innerHTML = formHtml;
  },

  async addTemplate() {
    const name = document.getElementById('tplName').value.trim();
    const category = document.getElementById('tplCategory').value;
    const language = document.getElementById('tplLanguage').value;
    const body = document.getElementById('tplBody').value.trim();
    const header = document.getElementById('tplHeader').value.trim();
    const footer = document.getElementById('tplFooter').value.trim();

    if (!name) return alert('Template Name is required!');
    if (!body) return alert('Template Body is required!');

    try {
      await db.collection('templates').add({
        name, category, language, body, header, footer,
        status: 'Draft',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert('Template saved! Submit to Meta for approval.');
      this.render();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  },

  async sendTemplate(id) {
    const phone = prompt('Enter phone number to send test:');
    if (!phone) return;

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
        alert('Template message sent!');
      } else {
        alert('Error: ' + (result.error?.message || 'Failed'));
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
