const Leads = {
  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading leads...</p>';

    let leads = [];
    try {
      const snap = await db.collection('leads').orderBy('createdAt', 'desc').get();
      leads = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error('Error loading leads:', err);
    }

    let html = `
      <div class="card-widget">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="mb-0"><i class="fas fa-funnel-dollar text-primary me-2"></i>Lead Management</h4>
          <button class="btn btn-primary btn-sm" onclick="Leads.showAddForm()">
            <i class="fas fa-plus me-1"></i> Add Lead
          </button>
        </div>

        <div id="leadFormContainer"></div>

        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr><th>Name</th><th>Phone</th><th>Email</th><th>Source</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              ${leads.length === 0
                ? '<tr><td colspan="6" class="text-center text-muted py-4">No leads found. Add your first lead!</td></tr>'
                : leads.map(lead => `
                  <tr>
                    <td><strong>${lead.name || '-'}</strong></td>
                    <td>${lead.phone || '-'}</td>
                    <td>${lead.email || '-'}</td>
                    <td><span class="badge bg-info">${lead.source || 'Unknown'}</span></td>
                    <td><span class="badge bg-${lead.status === 'New' ? 'warning' : lead.status === 'Contacted' ? 'primary' : 'success'}">${lead.status || 'New'}</span></td>
                    <td>
                      <button class="btn btn-sm btn-outline-danger" onclick="Leads.deleteLead('${lead.id}')" title="Delete">
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
      <div class="card mb-3 border-primary">
        <div class="card-body">
          <h5 class="card-title">Add New Lead</h5>
          <div class="row g-2">
            <div class="col-md-6">
              <input type="text" id="leadName" class="form-control form-control-sm" placeholder="Full Name *" required>
            </div>
            <div class="col-md-6">
              <input type="text" id="leadPhone" class="form-control form-control-sm" placeholder="Phone Number">
            </div>
            <div class="col-md-6">
              <input type="email" id="leadEmail" class="form-control form-control-sm" placeholder="Email">
            </div>
            <div class="col-md-6">
              <select id="leadSource" class="form-select form-select-sm">
                <option value="Website">Website</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="col-12">
              <button class="btn btn-success btn-sm me-2" onclick="Leads.addLead()"><i class="fas fa-save me-1"></i> Save Lead</button>
              <button class="btn btn-secondary btn-sm" onclick="Leads.render()">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.getElementById('leadFormContainer').innerHTML = formHtml;
  },

  async addLead() {
    const name = document.getElementById('leadName').value.trim();
    const phone = document.getElementById('leadPhone').value.trim();
    const email = document.getElementById('leadEmail').value.trim();
    const source = document.getElementById('leadSource').value;

    if (!name) return alert('Name is required!');

    try {
      await db.collection('leads').add({
        name, phone, email, source,
        status: 'New',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert('Lead added successfully!');
      this.render();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  },

  async deleteLead(id) {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await db.collection('leads').doc(id).delete();
      alert('Lead deleted.');
      this.render();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }
};
