const Contacts = {
  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading contacts...</p>';

    let contacts = [];
    try {
      const snap = await db.collection('contacts').orderBy('createdAt', 'desc').get();
      contacts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error('Error loading contacts:', err);
    }

    let html = `
      <div class="card-widget">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="mb-0"><i class="fas fa-users text-success me-2"></i>Contact Management</h4>
          <button class="btn btn-primary btn-sm" onclick="Contacts.showAddForm()">
            <i class="fas fa-plus me-1"></i> Add Contact
          </button>
        </div>
        <div id="contactFormContainer"></div>
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr><th>Name</th><th>Phone</th><th>Email</th><th>Group</th><th>Actions</th></tr>
            </thead>
            <tbody>
              ${contacts.length === 0
                ? '<tr><td colspan="5" class="text-center text-muted py-4">No contacts found. Add your first contact!</td></tr>'
                : contacts.map(contact => `
                  <tr>
                    <td><strong>${contact.firstName || ''} ${contact.lastName || ''}</strong></td>
                    <td>${contact.mobile || '-'}</td>
                    <td>${contact.email || '-'}</td>
                    <td><span class="badge bg-info">${contact.group || '-'}</span></td>
                    <td>
                      <button class="btn btn-sm btn-outline-danger" onclick="Contacts.deleteContact('${contact.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                      </button>
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

  showAddForm() {
    const formHtml = `
      <div class="card mb-3 border-success">
        <div class="card-body">
          <h5 class="card-title">Add New Contact</h5>
          <div class="row g-2">
            <div class="col-md-6">
              <input type="text" id="contactFirstName" class="form-control form-control-sm" placeholder="First Name *" required>
            </div>
            <div class="col-md-6">
              <input type="text" id="contactLastName" class="form-control form-control-sm" placeholder="Last Name">
            </div>
            <div class="col-md-6">
              <input type="text" id="contactMobile" class="form-control form-control-sm" placeholder="Mobile Number">
            </div>
            <div class="col-md-6">
              <input type="email" id="contactEmail" class="form-control form-control-sm" placeholder="Email">
            </div>
            <div class="col-md-6">
              <select id="contactGroup" class="form-select form-select-sm">
                <option value="Customers">Customers</option>
                <option value="Leads">Leads</option>
                <option value="Partners">Partners</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="col-12 mt-2">
              <button class="btn btn-success btn-sm me-2" onclick="Contacts.addContact()"><i class="fas fa-save me-1"></i> Save Contact</button>
              <button class="btn btn-secondary btn-sm" onclick="Contacts.render()">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.getElementById('contactFormContainer').innerHTML = formHtml;
  },

  async addContact() {
    const firstName = document.getElementById('contactFirstName').value.trim();
    const lastName = document.getElementById('contactLastName').value.trim();
    const mobile = document.getElementById('contactMobile').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const group = document.getElementById('contactGroup').value;

    if (!firstName) return alert('First Name is required!');

    try {
      await db.collection('contacts').add({
        firstName, lastName, mobile, email, group,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert('Contact added successfully!');
      this.render();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  },

  async deleteContact(id) {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      await db.collection('contacts').doc(id).delete();
      alert('Contact deleted.');
      this.render();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }
};
