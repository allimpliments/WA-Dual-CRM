const Contacts = {
  currentTab: 'contacts', // 'contacts' or 'fields'

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading contacts...</p>';

    if (this.currentTab === 'fields') {
      await this.renderFieldManager();
      return;
    }

    // Load contacts and custom fields definitions
    let contacts = [];
    let fields = [];
    try {
      const snap = await db.collection('contacts').orderBy('createdAt', 'desc').get();
      contacts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const fieldSnap = await db.collection('contactFields').get();
      fields = fieldSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) { console.error(err); }

    let html = `
      <div class="card-widget">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="mb-0"><i class="fas fa-users text-success me-2"></i>Contact Management</h4>
          <div>
            <button class="btn btn-outline-primary btn-sm me-1" onclick="Contacts.currentTab='fields'; Contacts.render();">
              <i class="fas fa-cog me-1"></i> Manage Fields
            </button>
            <button class="btn btn-primary btn-sm" onclick="Contacts.showAddForm()">
              <i class="fas fa-plus me-1"></i> Add Contact
            </button>
          </div>
        </div>
        <div id="contactFormContainer"></div>
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>Name</th><th>Phone</th><th>Email</th><th>Group</th>
                ${fields.map(f => `<th>${f.name}</th>`).join('')}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${contacts.length === 0
                ? '<tr><td colspan="5" class="text-center text-muted py-4">No contacts found.</td></tr>'
                : contacts.map(c => `
                  <tr>
                    <td><strong>${c.firstName || ''} ${c.lastName || ''}</strong></td>
                    <td>${c.mobile || '-'}</td>
                    <td>${c.email || '-'}</td>
                    <td><span class="badge bg-info">${c.group || '-'}</span></td>
                    ${fields.map(f => `<td>${(c.customFields && c.customFields[f.id]) || '-'}</td>`).join('')}
                    <td>
                      <button class="btn btn-sm btn-outline-info me-1" onclick="Contacts.showEditForm('${c.id}')"><i class="fas fa-edit"></i></button>
                      <button class="btn btn-sm btn-outline-danger" onclick="Contacts.deleteContact('${c.id}')"><i class="fas fa-trash"></i></button>
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

  async renderFieldManager() {
    let fields = [];
    try {
      const snap = await db.collection('contactFields').orderBy('createdAt').get();
      fields = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {}

    let html = `
      <div class="card-widget">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="mb-0"><i class="fas fa-cog text-primary me-2"></i>Custom Contact Fields</h4>
          <button class="btn btn-outline-primary btn-sm" onclick="Contacts.currentTab='contacts'; Contacts.render();">
            <i class="fas fa-arrow-left me-1"></i> Back to Contacts
          </button>
        </div>
        <button class="btn btn-primary btn-sm mb-3" onclick="Contacts.showAddFieldForm()">
          <i class="fas fa-plus me-1"></i> Add Field
        </button>
        <div id="fieldFormContainer"></div>
        <table class="table">
          <thead><tr><th>Field Name</th><th>Type</th><th>Required</th><th>Actions</th></tr></thead>
          <tbody>
            ${fields.length === 0 ? '<tr><td colspan="4" class="text-muted">No custom fields.</td></tr>' : fields.map(f => `
              <tr>
                <td>${f.name}</td>
                <td>${f.type || 'text'}</td>
                <td>${f.required ? '✅' : '❌'}</td>
                <td>
                  <button class="btn btn-sm btn-outline-info" onclick="Contacts.showEditFieldForm('${f.id}')"><i class="fas fa-edit"></i></button>
                  <button class="btn btn-sm btn-outline-danger" onclick="Contacts.deleteField('${f.id}')"><i class="fas fa-trash"></i></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  // ----- Custom Fields CRUD -----
  showAddFieldForm() {
    document.getElementById('fieldFormContainer').innerHTML = `
      <div class="card mb-3 border-info"><div class="card-body p-2">
        <div class="row g-2">
          <div class="col-md-4"><input type="text" id="fieldName" class="form-control form-control-sm" placeholder="Field Name"></div>
          <div class="col-md-3">
            <select id="fieldType" class="form-select form-select-sm">
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="email">Email</option>
              <option value="url">URL</option>
              <option value="date">Date</option>
            </select>
          </div>
          <div class="col-md-2"><div class="form-check"><input class="form-check-input" type="checkbox" id="fieldRequired"><label class="form-check-label">Required</label></div></div>
          <div class="col-md-3"><button class="btn btn-success btn-sm" onclick="Contacts.addField()">Save</button></div>
        </div>
      </div></div>
    `;
  },

  async addField() {
    const name = document.getElementById('fieldName').value.trim();
    const type = document.getElementById('fieldType').value;
    const required = document.getElementById('fieldRequired').checked;
    if (!name) return alert('Field name required!');
    await db.collection('contactFields').add({ name, type, required, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    this.renderFieldManager();
  },

  async deleteField(id) {
    if (!confirm('Delete field?')) return;
    await db.collection('contactFields').doc(id).delete();
    this.renderFieldManager();
  },

  // ----- Contact CRUD with Custom Fields -----
  async showAddForm() {
    const fields = await this.getFields();
    let html = `
      <div class="card mb-3 border-success"><div class="card-body">
        <h5>Add New Contact</h5>
        <div class="row g-2">
          <div class="col-md-6"><input type="text" id="cFirstName" class="form-control form-control-sm" placeholder="First Name *"></div>
          <div class="col-md-6"><input type="text" id="cLastName" class="form-control form-control-sm" placeholder="Last Name"></div>
          <div class="col-md-6"><input type="text" id="cMobile" class="form-control form-control-sm" placeholder="Mobile"></div>
          <div class="col-md-6"><input type="email" id="cEmail" class="form-control form-control-sm" placeholder="Email"></div>
          <div class="col-md-6">
            <select id="cGroup" class="form-select form-select-sm">
              <option value="">Select Group</option>
              <option value="Customers">Customers</option>
              <option value="Leads">Leads</option>
              <option value="Partners">Partners</option>
            </select>
          </div>
          ${fields.map(f => `
            <div class="col-md-6">
              <label class="form-label small">${f.name} ${f.required ? '*' : ''}</label>
              <input type="${f.type || 'text'}" id="cf_${f.id}" class="form-control form-control-sm" placeholder="${f.name}">
            </div>
          `).join('')}
        </div>
        <button class="btn btn-success btn-sm mt-2" onclick="Contacts.addContact()">Save</button>
        <button class="btn btn-secondary btn-sm mt-2" onclick="Contacts.render()">Cancel</button>
      </div></div>
    `;
    document.getElementById('contactFormContainer').innerHTML = html;
  },

  async addContact() {
    const firstName = document.getElementById('cFirstName').value.trim();
    if (!firstName) return alert('First Name required!');
    const data = {
      firstName,
      lastName: document.getElementById('cLastName').value.trim(),
      mobile: document.getElementById('cMobile').value.trim(),
      email: document.getElementById('cEmail').value.trim(),
      group: document.getElementById('cGroup').value,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    // Collect custom fields
    const fields = await this.getFields();
    data.customFields = {};
    fields.forEach(f => {
      const val = document.getElementById('cf_' + f.id)?.value?.trim() || '';
      if (f.required && !val) return alert(`${f.name} is required!`);
      data.customFields[f.id] = val;
    });
    await db.collection('contacts').add(data);
    alert('Contact added!');
    this.render();
  },

  async showEditForm(id) {
    const doc = await db.collection('contacts').doc(id).get();
    const c = doc.data();
    const fields = await this.getFields();
    let html = `
      <div class="card mb-3 border-info"><div class="card-body">
        <h5>Edit Contact</h5>
        <div class="row g-2">
          <div class="col-md-6"><input type="text" id="cFirstName" class="form-control form-control-sm" value="${c.firstName || ''}"></div>
          <div class="col-md-6"><input type="text" id="cLastName" class="form-control form-control-sm" value="${c.lastName || ''}"></div>
          <div class="col-md-6"><input type="text" id="cMobile" class="form-control form-control-sm" value="${c.mobile || ''}"></div>
          <div class="col-md-6"><input type="email" id="cEmail" class="form-control form-control-sm" value="${c.email || ''}"></div>
          <div class="col-md-6">
            <select id="cGroup" class="form-select form-select-sm">
              <option value="Customers" ${c.group==='Customers'?'selected':''}>Customers</option>
              <option value="Leads" ${c.group==='Leads'?'selected':''}>Leads</option>
              <option value="Partners" ${c.group==='Partners'?'selected':''}>Partners</option>
            </select>
          </div>
          ${fields.map(f => `
            <div class="col-md-6">
              <label class="form-label small">${f.name}</label>
              <input type="${f.type || 'text'}" id="cf_${f.id}" class="form-control form-control-sm" value="${(c.customFields && c.customFields[f.id]) || ''}">
            </div>
          `).join('')}
        </div>
        <button class="btn btn-success btn-sm mt-2" onclick="Contacts.updateContact('${id}')">Update</button>
        <button class="btn btn-secondary btn-sm mt-2" onclick="Contacts.render()">Cancel</button>
      </div></div>
    `;
    document.getElementById('contactFormContainer').innerHTML = html;
  },

  async updateContact(id) {
    const data = {
      firstName: document.getElementById('cFirstName').value.trim(),
      lastName: document.getElementById('cLastName').value.trim(),
      mobile: document.getElementById('cMobile').value.trim(),
      email: document.getElementById('cEmail').value.trim(),
      group: document.getElementById('cGroup').value
    };
    const fields = await this.getFields();
    data.customFields = {};
    fields.forEach(f => {
      data.customFields[f.id] = document.getElementById('cf_' + f.id)?.value?.trim() || '';
    });
    await db.collection('contacts').doc(id).update(data);
    alert('Contact updated!');
    this.render();
  },

  async deleteContact(id) {
    if (!confirm('Delete?')) return;
    await db.collection('contacts').doc(id).delete();
    this.render();
  },

  async getFields() {
    const snap = await db.collection('contactFields').orderBy('createdAt').get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};
