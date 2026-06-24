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
                      <button class="btn btn-sm btn-success me-1" onclick="Campaigns.sendCampaign('${campaign.id}')" title="Send via WhatsApp">
                        <i class="fab fa-whatsapp"></i>
                      </button>
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
                <option value="Draft">Draft</option>
                <option value="Running">Running</option>
                <option value="Completed">Completed</option>
              </select>
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

    if (!name) return alert('Campaign Name is required!');

    try {
      await db.collection('campaigns').add({
        name, status, sent: 0, delivered: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert('Campaign added successfully!');
      this.render();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  },

  async sendCampaign(id) {
    // WhatsApp config लोड करें
    let config = {};
    try {
      const doc = await db.collection('settings').doc('whatsapp').get();
      if (doc.exists) config = doc.data();
    } catch (err) {}

    if (!config.phoneNumberId || !config.accessToken) {
      return alert('WhatsApp not configured. Please setup WhatsApp first.');
    }

    // सारे Contacts लोड करें
    let contacts = [];
    try {
      const snap = await db.collection('contacts').get();
      contacts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {}

    if (contacts.length === 0) return alert('No contacts found. Add contacts first.');

    const phone = prompt('Enter a single phone number to send test (with country code, e.g. 919810012345):');
    if (!phone) return;

    try {
      const url = `https://graph.facebook.com/v22.0/${config.phoneNumberId}/messages`;
      const payload = {
        messaging_product: 'whatsapp',
        to: phone,
        type: 'template',
        template: {
          name: 'hello_world',
          language: { code: 'en_US' }
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        // Campaign stats update करें
        const campDoc = await db.collection('campaigns').doc(id).get();
        const campData = campDoc.data();
        await db.collection('campaigns').doc(id).update({
          sent: (campData.sent || 0) + 1,
          delivered: (campData.delivered || 0) + 1,
          status: 'Running'
        });
        alert('Message sent successfully!');
        this.render();
      } else {
        alert('Error: ' + (result.error?.message || 'Unknown error'));
      }
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
