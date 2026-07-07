// js/contacts.js — Advanced Contact Management with Import/Export & Groups + clientId
const Contacts = {
  currentTab: 'contacts',
  selectedGroup: null,

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading contacts...</p>';

    if (this.currentTab === 'fields') { await this.renderFieldManager(); return; }
    if (this.currentTab === 'groups') { await this.renderGroupManager(); return; }

    let contacts = [];
    let fields = [];
    let groups = [];
    try {
      // ✅ clientId फ़िल्टर जोड़ा
      let query = db.collection('contacts');
      if (shouldFilterByClient()) query = query.where('clientId', '==', window.currentUser.clientId);
      if (this.selectedGroup) query = query.where('group', '==', this.selectedGroup);
      const snap = await query.orderBy('createdAt', 'desc').get();
      contacts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const fieldSnap = await db.collection('contactFields').orderBy('createdAt').get();
      fields = fieldSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const groupSnap = await db.collection('contactGroups').get();
      groups = groupSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) { console.error(err); }

    let html = `
      <div class="card-widget">
        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap">
          <h4 class="mb-0"><i class="fas fa-users text-success me-2"></i>Contact Management</h4>
          <div class="d-flex gap-1 flex-wrap">
            <select class="form-select form-select-sm" style="width:auto;" id="groupFilter" onchange="Contacts.selectedGroup=this.value||null;Contacts.render();">
              <option value="">All Groups</option>
              ${groups.map(g => `<option value="${g.name}" ${this.selectedGroup===g.name?'selected':''}>${g.name}</option>`).join('')}
            </select>
            <button class="btn btn-outline-primary btn-sm" onclick="Contacts.currentTab='groups'; Contacts.render();"><i class="fas fa-layer-group me-1"></i> Manage Groups</button>
            <button class="btn btn-outline-primary btn-sm" onclick="Contacts.currentTab='fields'; Contacts.render();"><i class="fas fa-cog me-1"></i> Fields</button>
            <button class="btn btn-primary btn-sm" onclick="Contacts.showAddForm()"><i class="fas fa-plus me-1"></i> Add Contact</button>
          </div>
        </div>
        <div id="contactFormContainer"></div>
        <div class="mb-2 d-flex gap-2 flex-wrap">
          <button class="btn btn-outline-success btn-sm" onclick="Contacts.downloadSample()"><i class="fas fa-download me-1"></i> Sample CSV</button>
          <button class="btn btn-outline-info btn-sm" onclick="document.getElementById('importCSV').click()"><i class="fas fa-upload me-1"></i> Import CSV</button>
          <input type="file" id="importCSV" accept=".csv" style="display:none" onchange="Contacts.importCSV(event)">
          <button class="btn btn-outline-secondary btn-sm" onclick="Contacts.exportCSV()"><i class="fas fa-file-export me-1"></i> Export CSV</button>
        </div>
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
                ? `<tr><td colspan="${5 + fields.length}" class="text-center text-muted py-4">No contacts found.</td></tr>`
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

  // ==================== GROUPS ====================
  async renderGroupManager() {
    let groups = [];
    try {
      const snap = await db.collection('contactGroups').get();
      groups = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e){}
    let html = `
      <div class="card-widget">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4><i class="fas fa-layer-group me-2"></i>Contact Groups</h4>
          <button class="btn btn-outline-primary btn-sm" onclick="Contacts.currentTab='contacts'; Contacts.render();">
            <i class="fas fa-arrow-left me-1"></i> Back to Contacts
          </button>
        </div>
        <button class="btn btn-primary btn-sm mb-3" onclick="Contacts.showAddGroupForm()"><i class="fas fa-plus me-1"></i> Create Group</button>
        <div id="groupFormContainer"></div>
        <table class="table">
          <thead><tr><th>Group Name</th><th>Members</th><th>Actions</th></tr></thead>
          <tbody>
            ${groups.length === 0 ? '<tr><td colspan="3" class="text-muted">No groups yet.</td></tr>' : groups.map(g => `
              <tr>
                <td>${g.name}</td>
                <td>${(g.memberIds || []).length}</td>
                <td>
                  <button class="btn btn-sm btn-outline-info me-1" onclick="Contacts.showEditGroupForm('${g.id}')"><i class="fas fa-edit"></i></button>
                  <button class="btn btn-sm btn-outline-warning me-1" onclick="Contacts.manageGroupMembers('${g.id}')"><i class="fas fa-user-plus"></i></button>
                  <button class="btn btn-sm btn-outline-danger" onclick="Contacts.deleteGroup('${g.id}')"><i class="fas fa-trash"></i></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  showAddGroupForm() {
    document.getElementById('groupFormContainer').innerHTML = `
      <div class="card mb-3 border-success"><div class="card-body p-2">
        <div class="input-group"><input type="text" id="newGroupName" class="form-control form-control-sm" placeholder="Group Name"><button class="btn btn-success btn-sm" onclick="Contacts.addGroup()">Save</button></div>
      </div></div>`;
  },

  async addGroup() {
    const name = document.getElementById('newGroupName').value.trim();
    if(!name) return alert('Group name required!');
    await db.collection('contactGroups').add({ name, memberIds: [], createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    this.renderGroupManager();
  },

  async deleteGroup(id) {
    if(!confirm('Delete group?')) return;
    await db.collection('contactGroups').doc(id).delete();
    this.renderGroupManager();
  },

  async manageGroupMembers(groupId) {
    const groupDoc = await db.collection('contactGroups').doc(groupId).get();
    const group = groupDoc.data();
    // ✅ clientId फ़िल्टर
    let query = db.collection('contacts');
    if (shouldFilterByClient()) query = query.where('clientId', '==', window.currentUser.clientId);
    let contactsSnap = await query.get();
    let contacts = contactsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    let html = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:3000;display:flex;align-items:center;justify-content:center;" onclick="document.getElementById('groupMembersModal').remove()">
        <div class="card-widget" style="width:500px;max-width:90vw;max-height:80vh;overflow-y:auto;" onclick="event.stopPropagation()">
          <h5>Manage Members: ${group.name}</h5>
          <div class="mb-3"><input type="text" id="memberSearch" class="form-control form-control-sm" placeholder="Search..." oninput="Contacts.filterGroupMembers()"></div>
          <div id="memberList">
            ${contacts.map(c => `
              <div class="form-check member-row">
                <input class="form-check-input" type="checkbox" value="${c.id}" id="mem-${c.id}" ${(group.memberIds||[]).includes(c.id)?'checked':''}>
                <label class="form-check-label" for="mem-${c.id}">${c.firstName} ${c.lastName} (${c.mobile||c.email||'-'})</label>
              </div>
            `).join('')}
          </div>
          <button class="btn btn-primary btn-sm mt-2" onclick="Contacts.saveGroupMembers('${groupId}')">Save</button>
          <button class="btn btn-light btn-sm mt-2" onclick="document.getElementById('groupMembersModal').remove()">Cancel</button>
        </div>
      </div>
    `;
    const modal = document.createElement('div');
    modal.id = 'groupMembersModal';
    modal.innerHTML = html;
    document.body.appendChild(modal);
  },

  filterGroupMembers() {
    const s = document.getElementById('memberSearch')?.value?.toLowerCase()||'';
    document.querySelectorAll('.member-row').forEach(r=>{
      const label = r.querySelector('label')?.textContent?.toLowerCase()||'';
      r.style.display = label.includes(s)?'':'none';
    });
  },

  async saveGroupMembers(groupId) {
    const checkboxes = document.querySelectorAll('#memberList input[type=checkbox]:checked');
    const ids = Array.from(checkboxes).map(cb => cb.value);
    await db.collection('contactGroups').doc(groupId).update({ memberIds: ids });
    document.getElementById('groupMembersModal')?.remove();
    alert('Group members updated!');
  },

  // ==================== IMPORT / EXPORT ====================
  downloadSample() {
    let csv = "firstName,lastName,mobile,email,group\n";
    csv += "John,Doe,+919810012345,john@example.com,Customers\n";
    csv += "Jane,Smith,+919810012346,jane@example.com,Leads\n";
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_contacts.csv';
    a.click();
    URL.revokeObjectURL(url);
  },

  importCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) return alert('No data rows found.');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      let added = 0;
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length < headers.length) continue;
        const obj = {};
        headers.forEach((h, idx) => obj[h] = values[idx]);
        const contact = {
          firstName: obj.firstname || obj.first_name || '',
          lastName: obj.lastname || obj.last_name || '',
          mobile: obj.mobile || obj.phone || '',
          email: obj.email || '',
          group: obj.group || 'Customers',
          source: 'Import',
          clientId: window.currentUser?.clientId || null,   // ✅ clientId जोड़ा
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await db.collection('contacts').add(contact);
        added++;
      }
      alert(`✅ Imported ${added} contacts!`);
      this.render();
    };
    reader.readAsText(file);
  },

  exportCSV() {
    let csv = "firstName,lastName,mobile,email,group\n";
    const rows = document.querySelectorAll('table tbody tr');
    rows.forEach(row => {
      const cols = row.querySelectorAll('td');
      if (cols.length < 4) return;
      const firstName = cols[0].innerText.trim();
      const phone = cols[1].innerText.trim();
      const email = cols[2].innerText.trim();
      const group = cols[3].innerText.trim();
      csv += `"${firstName}","${phone}","${email}","${group}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  },

  // ==================== FIELD MANAGER ====================
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
        <button class="btn btn-primary btn-sm mb-3" onclick="Contacts.showAddFieldForm()"><i class="fas fa-plus me-1"></i> Add Field</button>
        <div id="fieldFormContainer"></div>
        <table class="table">
          <thead><tr><th>Field Name</th><th>Type</th><th>Required</th><th>Actions</th></tr></thead>
          <tbody>
            ${fields.length === 0 ? '<tr><td colspan="4" class="text-muted">No custom fields yet.</td></tr>' : fields.map(f => `
              <tr>
                <td>${f.name}</td><td>${f.type || 'text'}</td><td>${f.required ? '✅' : '❌'}</td>
                <td>
                  <button class="btn btn-sm btn-outline-info me-1" onclick="Contacts.showEditFieldForm('${f.id}')"><i class="fas fa-edit"></i></button>
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

  showAddFieldForm() {
    document.getElementById('fieldFormContainer').innerHTML = `
      <div class="card mb-3 border-info"><div class="card-body p-2">
        <div class="row g-2">
          <div class="col-md-4"><input type="text" id="fieldName" class="form-control form-control-sm" placeholder="Field Name"></div>
          <div class="col-md-3"><select id="fieldType" class="form-select form-select-sm"><option value="text">Text</option><option value="number">Number</option><option value="email">Email</option><option value="url">URL</option><option value="date">Date</option></select></div>
          <div class="col-md-2"><div class="form-check"><input class="form-check-input" type="checkbox" id="fieldRequired"><label class="form-check-label">Required</label></div></div>
          <div class="col-md-3"><button class="btn btn-success btn-sm" onclick="Contacts.addField()">Save</button></div>
        </div>
      </div></div>`;
  },

  async addField() {
    const name = document.getElementById('fieldName').value.trim();
    if (!name) return alert('Field name required!');
    await db.collection('contactFields').add({
      name, type: document.getElementById('fieldType').value,
      required: document.getElementById('fieldRequired').checked,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    this.renderFieldManager();
  },

  showEditFieldForm(id) {
    db.collection('contactFields').doc(id).get().then(doc => {
      const f = doc.data();
      document.getElementById('fieldFormContainer').innerHTML = `
        <div class="card mb-3 border-info"><div class="card-body p-2">
          <div class="row g-2">
            <div class="col-md-4"><input type="text" id="editFieldName" class="form-control form-control-sm" value="${f.name}"></div>
            <div class="col-md-3"><select id="editFieldType" class="form-select form-select-sm"><option value="text" ${f.type==='text'?'selected':''}>Text</option><option value="number" ${f.type==='number'?'selected':''}>Number</option><option value="email" ${f.type==='email'?'selected':''}>Email</option><option value="url" ${f.type==='url'?'selected':''}>URL</option><option value="date" ${f.type==='date'?'selected':''}>Date</option></select></div>
            <div class="col-md-2"><div class="form-check"><input class="form-check-input" type="checkbox" id="editFieldRequired" ${f.required?'checked':''}><label class="form-check-label">Required</label></div></div>
            <div class="col-md-3"><button class="btn btn-success btn-sm" onclick="Contacts.updateField('${id}')">Update</button></div>
          </div>
        </div></div>`;
    });
  },

  async updateField(id) {
    await db.collection('contactFields').doc(id).update({
      name: document.getElementById('editFieldName').value.trim(),
      type: document.getElementById('editFieldType').value,
      required: document.getElementById('editFieldRequired').checked
    });
    this.renderFieldManager();
  },

  async deleteField(id) {
    if (!confirm('Delete this field?')) return;
    await db.collection('contactFields').doc(id).delete();
    this.renderFieldManager();
  },

  async getFields() {
    try { const snap = await db.collection('contactFields').orderBy('createdAt').get(); return snap.docs.map(d => ({ id: d.id, ...d.data() })); }
    catch (e) { return []; }
  },

  // ==================== CONTACT CRUD ====================
  async showAddForm() {
    const fields = await this.getFields();
    const groupsSnap = await db.collection('contactGroups').get();
    const groups = groupsSnap.docs.map(d => d.data().name);
    let html = `
      <div class="card mb-3 border-success"><div class="card-body">
        <h5>Add New Contact</h5>
        <div class="row g-2">
          <div class="col-md-6"><input type="text" id="cFirstName" class="form-control form-control-sm" placeholder="First Name *"></div>
          <div class="col-md-6"><input type="text" id="cLastName" class="form-control form-control-sm" placeholder="Last Name"></div>
          <div class="col-md-6"><input type="text" id="cMobile" class="form-control form-control-sm" placeholder="Mobile Number"></div>
          <div class="col-md-6"><input type="email" id="cEmail" class="form-control form-control-sm" placeholder="Email"></div>
          <div class="col-md-6"><select id="cGroup" class="form-select form-select-sm"><option value="">Select Group</option>${groups.map(g => `<option value="${g}">${g}</option>`).join('')}</select></div>
          ${fields.map(f => `<div class="col-md-6"><label class="form-label small">${f.name} ${f.required ? '*' : ''}</label><input type="${f.type || 'text'}" id="cf_${f.id}" class="form-control form-control-sm" placeholder="${f.name}"></div>`).join('')}
        </div>
        <button class="btn btn-success btn-sm mt-2" onclick="Contacts.addContact()">Save Contact</button>
        <button class="btn btn-secondary btn-sm mt-2" onclick="Contacts.render()">Cancel</button>
      </div></div>`;
    document.getElementById('contactFormContainer').innerHTML = html;
  },

  async addContact() {
    const firstName = document.getElementById('cFirstName').value.trim();
    if (!firstName) return alert('First Name required!');
    const fields = await this.getFields();
    const customFields = {};
    fields.forEach(f => { const el = document.getElementById('cf_' + f.id); if (el) customFields[f.id] = el.value; });
    await db.collection('contacts').add({
      firstName, lastName: document.getElementById('cLastName').value.trim(),
      mobile: document.getElementById('cMobile').value.trim(),
      email: document.getElementById('cEmail').value.trim(),
      group: document.getElementById('cGroup').value,
      clientId: window.currentUser?.clientId || null,   // ✅ clientId जोड़ा
      customFields, source: 'Manual',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert('✅ Contact added!');
    this.render();
  },

  async showEditForm(id) {
    const fields = await this.getFields();
    const doc = await db.collection('contacts').doc(id).get();
    const c = doc.data();
    const groupsSnap = await db.collection('contactGroups').get();
    const groups = groupsSnap.docs.map(d => d.data().name);
    let html = `
      <div class="card mb-3 border-warning"><div class="card-body">
        <h5>Edit Contact</h5>
        <div class="row g-2">
          <div class="col-md-6"><input type="text" id="ecFirstName" class="form-control form-control-sm" value="${c.firstName||''}"></div>
          <div class="col-md-6"><input type="text" id="ecLastName" class="form-control form-control-sm" value="${c.lastName||''}"></div>
          <div class="col-md-6"><input type="text" id="ecMobile" class="form-control form-control-sm" value="${c.mobile||''}"></div>
          <div class="col-md-6"><input type="email" id="ecEmail" class="form-control form-control-sm" value="${c.email||''}"></div>
          <div class="col-md-6"><select id="ecGroup" class="form-select form-select-sm"><option value="">Select Group</option>${groups.map(g => `<option value="${g}" ${c.group===g?'selected':''}>${g}</option>`).join('')}</select></div>
          ${fields.map(f => `<div class="col-md-6"><label class="form-label small">${f.name}</label><input type="${f.type||'text'}" id="ecf_${f.id}" class="form-control form-control-sm" value="${(c.customFields&&c.customFields[f.id])||''}"></div>`).join('')}
        </div>
        <button class="btn btn-warning btn-sm mt-2" onclick="Contacts.updateContact('${id}')">Update Contact</button>
        <button class="btn btn-secondary btn-sm mt-2" onclick="Contacts.render()">Cancel</button>
      </div></div>`;
    document.getElementById('contactFormContainer').innerHTML = html;
  },

  async updateContact(id) {
    const firstName = document.getElementById('ecFirstName').value.trim();
    if (!firstName) return alert('First Name required!');
    const fields = await this.getFields();
    const customFields = {};
    fields.forEach(f => { const el = document.getElementById('ecf_' + f.id); if (el) customFields[f.id] = el.value; });
    await db.collection('contacts').doc(id).update({
      firstName, lastName: document.getElementById('ecLastName').value.trim(),
      mobile: document.getElementById('ecMobile').value.trim(),
      email: document.getElementById('ecEmail').value.trim(),
      group: document.getElementById('ecGroup').value,
      customFields, updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert('✅ Contact updated!');
    this.render();
  },

  async deleteContact(id) {
    if (!confirm('Delete this contact?')) return;
    await db.collection('contacts').doc(id).delete();
    this.render();
  }
};
