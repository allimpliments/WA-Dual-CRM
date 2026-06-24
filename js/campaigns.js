const Campaigns = {
  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading campaigns...</p>';

    let campaigns = [];
    try {
      const snap = await db.collection('campaigns').orderBy('createdAt', 'desc').get();
      campaigns = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error('Error loading campaigns:', err);
    }

    let html = `
      <div class="card-widget">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="mb-0"><i class="fas fa-rocket text-warning me-2"></i>Campaign Management</h4>
          <button class="btn btn-primary btn-sm" onclick="Campaigns.showAddForm()">
            <i class="fas fa-plus me-1"></i> Add Campaign
          </button>
        </div>
        <div id="campaignFormContainer"></div>
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr><th>Name</th><th>Status</th><th>Sent</th><th>Delivered</th><th>Actions</th></tr>
            </thead>
            <tbody>
              ${campaigns.length === 0
                ? '<tr><td colspan="5" class="text-center text-muted py-4">No campaigns found. Add your first campaign!</td></tr>'
                : campaigns.map(campaign => `
                  <tr>
                    <td><strong>${campaign.name || '-'}</strong></td>
                    <td><span class="badge bg-${campaign.status === 'Running' ? 'success' : campaign.status === 'Completed' ? 'primary' : 'secondary'}">${campaign.status || '-'}</span></td>
                    <td>${campaign.sent || 0}</td>
                    <td>${campaign.delivered || 0}</td>
                    <td>
                      <button class="btn btn-sm btn-outline-danger" onclick="Campaigns.deleteCampaign('${campaign.id}')" title="Delete">
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
      <div class="card mb-3 border-warning">
        <div class="card-body">
          <h5 class="card-title">Add New Campaign</h5>
          <div class="row g-2">
            <div class="col-md-6">
              <input type="text" id="campaignName" class="form-control form-control-sm" placeholder="Campaign Name *" required>
            </div>
            <div class="col-md-6">
              <select id="campaignStatus" class="form-select form-select-sm">
                <option value="Running">Running</option>
                <option value="Completed">Completed</option>
                <option value="Scheduled">Scheduled</option>
              </select>
            </div>
            <div class="col-md-6">
              <input type="number" id="campaignSent" class="form-control form-control-sm" placeholder="Messages Sent" value="0">
            </div>
            <div class="col-md-6">
              <input type="number" id="campaignDelivered" class="form-control form-control-sm" placeholder="Messages Delivered" value="0">
            </div>
            <div class="col-12 mt-2">
              <button class="btn btn-success btn-sm me-2" onclick="Campaigns.addCampaign()"><i class="fas fa-save me-1"></i> Save Campaign</button>
              <button class="btn btn-secondary btn-sm" onclick="Campaigns.render()">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.getElementById('campaignFormContainer').innerHTML = formHtml;
  },

  async addCampaign() {
    const name = document.getElementById('campaignName').value.trim();
    const status = document.getElementById('campaignStatus').value;
    const sent = parseInt(document.getElementById('campaignSent').value) || 0;
    const delivered = parseInt(document.getElementById('campaignDelivered').value) || 0;

    if (!name) return alert('Campaign Name is required!');

    try {
      await db.collection('campaigns').add({
        name, status, sent, delivered,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert('Campaign added successfully!');
      this.render();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  },

  async deleteCampaign(id) {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await db.collection('campaigns').doc(id).delete();
      alert('Campaign deleted.');
      this.render();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }
};
