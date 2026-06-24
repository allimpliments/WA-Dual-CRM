const Dashboard = {
  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading dashboard...</p>';

    let totalLeads = 0, totalContacts = 0, totalCampaigns = 0;

    try {
      // Firestore से real data लाएं
      const leadsSnap = await db.collection('leads').get();
      totalLeads = leadsSnap.size;

      const contactsSnap = await db.collection('contacts').get();
      totalContacts = contactsSnap.size;

      const campaignsSnap = await db.collection('campaigns').get();
      totalCampaigns = campaignsSnap.size;

    } catch (err) {
      console.error('Dashboard data load error:', err);
    }

    const planName = (window.currentUser?.role === 'admin') ? 'Premium' : 'Free';

    const html = `
      <div class="row g-3">
        <div class="col-md-3">
          <div class="card-widget text-center">
            <i class="fas fa-users fa-2x text-primary mb-2"></i>
            <h6>Total Leads</h6>
            <h2>${totalLeads}</h2>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card-widget text-center">
            <i class="fas fa-address-book fa-2x text-success mb-2"></i>
            <h6>Contacts</h6>
            <h2>${totalContacts}</h2>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card-widget text-center">
            <i class="fas fa-rocket fa-2x text-warning mb-2"></i>
            <h6>Campaigns</h6>
            <h2>${totalCampaigns}</h2>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card-widget text-center">
            <i class="fas fa-crown fa-2x text-dark mb-2"></i>
            <h6>Plan</h6>
            <h2>${planName}</h2>
          </div>
        </div>
      </div>

      <div class="row g-3 mt-3">
        <div class="col-md-8">
          <div class="card-widget">
            <h6 class="mb-3">Lead Trend</h6>
            <canvas id="leadChart" class="chart-box"></canvas>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card-widget">
            <h6 class="mb-3">Quick Actions</h6>
            <button class="btn btn-primary btn-sm w-100 mb-2" onclick="alert('Add Lead form coming soon!')">
              <i class="fas fa-plus me-1"></i> Add Lead
            </button>
            <button class="btn btn-outline-primary btn-sm w-100 mb-2" onclick="alert('Add Contact form coming soon!')">
              <i class="fas fa-user-plus me-1"></i> Add Contact
            </button>
            <button class="btn btn-outline-success btn-sm w-100" onclick="alert('Campaign builder coming soon!')">
              <i class="fas fa-paper-plane me-1"></i> New Campaign
            </button>
          </div>
        </div>
      </div>
    `;

    contentArea.innerHTML = html;

    // Chart render करें
    const ctx = document.getElementById('leadChart')?.getContext('2d');
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Leads',
            data: [0, 0, totalLeads, 0, 0, 0],
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37,99,235,0.1)',
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  }
};
