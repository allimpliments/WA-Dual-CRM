const Dashboard = {
  async render() {
    // For now, dummy data
    const stats = { totalLeads: 0, activeClients: 0, aiUsed: 0, aiMax: 0, plan: 'Free' };
    // Later replace with Firestore queries
    // const leadsSnapshot = await db.collection('leads').get();
    // stats.totalLeads = leadsSnapshot.size;

    const html = `
      <div class="row g-3">
        <div class="col-md-3"><div class="card-widget"><h6>Total Leads</h6><h2>${stats.totalLeads}</h2></div></div>
        <div class="col-md-3"><div class="card-widget"><h6>Active Clients</h6><h2>${stats.activeClients}</h2></div></div>
        <div class="col-md-3"><div class="card-widget"><h6>AI Usage</h6><h2>${stats.aiUsed}/${stats.aiMax || '∞'}</h2></div></div>
        <div class="col-md-3"><div class="card-widget"><h6>Plan</h6><h2>${stats.plan}</h2></div></div>
      </div>
      <div class="row g-3 mt-3">
        <div class="col-md-8"><div class="card-widget"><canvas id="leadChart" class="chart-box"></canvas></div></div>
        <div class="col-md-4"><div class="card-widget"><h6>Follow‑ups</h6><ul class="list-unstyled" id="followupList"><li>No pending follow‑ups</li></ul></div></div>
      </div>
    `;
    contentArea.innerHTML = html;
    // Chart
    const ctx = document.getElementById('leadChart')?.getContext('2d');
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan','Feb','Mar','Apr','May','Jun'],
          datasets: [{
            label: 'Leads', data: [0,0,0,0,0,0], borderColor: '#2563eb', tension: 0.3
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  }
};