const Dashboard = {
  chart: null,

  async render() {
    contentArea.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';

    let totalLeads = 0, totalContacts = 0, totalCampaigns = 0, totalMessages = 0;
    let wonLeads = 0, totalValue = 0, recentLeads = [], leadSources = {};
    let waConnected = false;
    const planName = (window.currentUser?.role === 'admin') ? 'Premium' : 'Free';

    try {
      const leadsSnap = await db.collection('leads').get();
      const contactsSnap = await db.collection('contacts').get();
      const campaignsSnap = await db.collection('campaigns').get();
      const messagesSnap = await db.collection('messages').get();
      const settingsDoc = await db.collection('settings').doc('whatsapp').get();

      totalLeads = leadsSnap.size;
      totalContacts = contactsSnap.size;
      totalCampaigns = campaignsSnap.size;
      totalMessages = messagesSnap.size;
      waConnected = settingsDoc.exists && settingsDoc.data().phoneNumberId;

      wonLeads = leadsSnap.docs.filter(d => d.data().status === 'won').length;

      leadsSnap.forEach(d => { const v = parseInt(d.data().value) || 0; totalValue += v; });

      recentLeads = leadsSnap.docs
        .sort((a,b) => (b.data().createdAt?.toMillis()||0) - (a.data().createdAt?.toMillis()||0))
        .slice(0, 5)
        .map(d => ({ id: d.id, ...d.data() }));

      leadsSnap.forEach(d => {
        const s = d.data().source || 'Unknown';
        leadSources[s] = (leadSources[s] || 0) + 1;
      });

    } catch (err) { console.error('Dashboard error:', err); }

    const sourceLabels = Object.keys(leadSources);
    const sourceData = Object.values(leadSources);
    const sourceColors = ['#1877f2','#31a24c','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899'];

    let html = `
      <style>
        .db-welcome { background: linear-gradient(135deg, #1877f2 0%, #0ea5e9 100%); border-radius: 16px; padding: 24px; color: #fff; margin-bottom: 20px; }
        .db-welcome h4 { font-weight: 700; }
        .db-stat-card { background: #fff; border-radius: 14px; padding: 18px; display: flex; align-items: center; gap: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: 0.2s; cursor: pointer; height: 100%; }
        .db-stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
        .db-stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .db-stat-info .db-num { font-size: 22px; font-weight: 700; line-height: 1.1; }
        .db-stat-info .db-lbl { font-size: 11px; color: #65676b; text-transform: uppercase; letter-spacing: 0.5px; }
        .db-recent-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
        .db-recent-item:last-child { border-bottom: none; }
        .db-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 600; font-size: 14px; }
        .db-avatar.lead { background: #6366f1; }
        .db-avatar.won { background: #10b981; }
        .db-status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 4px; }
      </style>

      <div class="db-welcome">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h4>👋 Welcome back, ${window.currentUser?.name || 'Admin'}</h4>
            <p class="mb-0 opacity-75">${waConnected ? '✅ WhatsApp Connected & Ready' : '⚠️ WhatsApp not configured. Go to Setup.'}</p>
          </div>
          <div class="col-md-4 text-md-end mt-2 mt-md-0">
            <span class="badge bg-light text-dark px-3 py-2 fs-6">Plan: ${planName}</span>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3" onclick="Leads.render()">
          <div class="db-stat-card">
            <div class="db-stat-icon" style="background:#e0e7ff;color:#4f46e5;"><i class="fas fa-user-plus"></i></div>
            <div class="db-stat-info"><div class="db-num">${totalLeads}</div><div class="db-lbl">Total Leads</div></div>
          </div>
        </div>
        <div class="col-6 col-md-3" onclick="Contacts.render()">
          <div class="db-stat-card">
            <div class="db-stat-icon" style="background:#d1fae5;color:#059669;"><i class="fas fa-users"></i></div>
            <div class="db-stat-info"><div class="db-num">${totalContacts}</div><div class="db-lbl">Contacts</div></div>
          </div>
        </div>
        <div class="col-6 col-md-3" onclick="Kanban.render()">
          <div class="db-stat-card">
            <div class="db-stat-icon" style="background:#fef3c7;color:#d97706;"><i class="fas fa-trophy"></i></div>
            <div class="db-stat-info"><div class="db-num">${wonLeads}</div><div class="db-lbl">Won Deals</div></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="db-stat-card">
            <div class="db-stat-icon" style="background:#fce7f3;color:#db2777;"><i class="fas fa-rupee-sign"></i></div>
            <div class="db-stat-info"><div class="db-num">₹${totalValue.toLocaleString()}</div><div class="db-lbl">Pipeline Value</div></div>
          </div>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-md-8">
          <div class="card-widget" style="min-height:320px;">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="mb-0"><i class="fas fa-chart-pie text-primary me-2"></i>Lead Sources</h5>
              <small class="text-muted">${totalLeads} leads total</small>
            </div>
            <div style="height:250px;"><canvas id="leadSourceChart"></canvas></div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card-widget" style="min-height:320px;">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="mb-0"><i class="fas fa-clock text-info me-2"></i>Recent Leads</h5>
              <button class="btn btn-outline-primary btn-sm" onclick="Leads.render()">View All</button>
            </div>
            ${recentLeads.length === 0 ? '<p class="text-muted text-center py-4">No leads yet.</p>' : recentLeads.map(l => `
              <div class="db-recent-item">
                <div class="db-avatar ${l.status==='won'?'won':'lead'}">${(l.name||'?')[0].toUpperCase()}</div>
                <div class="flex-grow-1">
                  <strong>${l.name||'Unknown'}</strong>
                  <div class="small text-muted">
                    <span class="db-status-dot" style="background:${l.status==='won'?'#10b981':l.status==='lost'?'#6b7280':'#6366f1'};"></span>
                    ${l.status||'new'} · ${l.source||'Manual'}
                  </div>
                </div>
                <small class="text-muted">${l.createdAt?.toDate().toLocaleDateString()||''}</small>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="row g-3 mt-3">
        <div class="col-md-3">
          <button class="btn btn-primary w-100 py-3" onclick="Leads.showAddForm()"><i class="fas fa-plus-circle me-2"></i> Add Lead</button>
        </div>
        <div class="col-md-3">
          <button class="btn btn-outline-primary w-100 py-3" onclick="Contacts.showAddForm()"><i class="fas fa-user-plus me-2"></i> Add Contact</button>
        </div>
        <div class="col-md-3">
          <button class="btn btn-outline-success w-100 py-3" onclick="Campaigns.showAddForm()"><i class="fas fa-rocket me-2"></i> New Campaign</button>
        </div>
        <div class="col-md-3">
          <button class="btn btn-outline-info w-100 py-3" onclick="Kanban.render()"><i class="fas fa-tasks me-2"></i> Open Pipeline</button>
        </div>
      </div>
    `;

    contentArea.innerHTML = html;

    setTimeout(() => {
      const ctx = document.getElementById('leadSourceChart')?.getContext('2d');
      if (ctx && sourceLabels.length > 0) {
        if (this.chart) this.chart.destroy();
        this.chart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: sourceLabels,
            datasets: [{
              data: sourceData,
              backgroundColor: sourceColors.slice(0, sourceLabels.length),
              borderWidth: 2,
              borderColor: '#fff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true } } }
          }
        });
      }
    }, 200);
  }
};
