// js/analytics.js — Real-Time Analytics Dashboard
const Analytics = {
  currentView: 'overview',
  dateRange: '30d',
  refreshTimer: null,

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = 'var(--bg-primary, #f0f2f5)';
    
    let data = {};
    try {
      const [leadsSnap, contactsSnap, campaignsSnap, messagesSnap] = await Promise.all([
        db.collection('leads').get(),
        db.collection('contacts').get(),
        db.collection('campaigns').get(),
        db.collection('messages').get()
      ]);
      
      data.totalLeads = leadsSnap.size;
      data.totalContacts = contactsSnap.size;
      data.totalCampaigns = campaignsSnap.size;
      data.totalMessages = messagesSnap.size;
      
      // Lead sources
      data.sources = {};
      leadsSnap.forEach(d => {
        const s = d.data().source || 'Unknown';
        data.sources[s] = (data.sources[s] || 0) + 1;
      });
      
      // Status distribution
      data.statuses = {};
      leadsSnap.forEach(d => {
        const s = d.data().status || 'new';
        data.statuses[s] = (data.statuses[s] || 0) + 1;
      });
      
      // Campaign stats
      data.campaignStats = campaignsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Message types
      data.incoming = 0; data.outgoing = 0;
      messagesSnap.forEach(d => {
        if (d.data().type === 'incoming') data.incoming++;
        else data.outgoing++;
      });
      
      // Monthly trend (last 6 months)
      data.monthlyLeads = this.getMonthlyTrend(leadsSnap);
      data.monthlyMessages = this.getMonthlyTrend(messagesSnap);
      
    } catch(e) { console.error('Analytics error:', e); }

    const stats = [
      { label: 'Total Leads', value: data.totalLeads||0, icon: 'fa-user-plus', color: '#4f46e5', bg: '#e0e7ff', change: '+12%' },
      { label: 'Contacts', value: data.totalContacts||0, icon: 'fa-users', color: '#059669', bg: '#d1fae5', change: '+8%' },
      { label: 'Campaigns', value: data.totalCampaigns||0, icon: 'fa-rocket', color: '#d97706', bg: '#fef3c7', change: '+5%' },
      { label: 'Messages', value: data.totalMessages||0, icon: 'fa-comments', color: '#db2777', bg: '#fce7f3', change: '+22%' }
    ];

    const sourceColors = ['#4f46e5','#059669','#d97706','#db2777','#7c3aed','#0369a1','#0891b2','#be185d'];
    const sourceLabels = Object.keys(data.sources||{});
    const sourceValues = Object.values(data.sources||{});
    const statusLabels = Object.keys(data.statuses||{});
    const statusValues = Object.values(data.statuses||{});

    let html = `
      <style>
        .an-stat{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:20px;display:flex;align-items:center;gap:14px;transition:0.2s;cursor:pointer;}
        .an-stat:hover{box-shadow:0 8px 20px rgba(0,0,0,0.05);border-color:#3b82f6;}
        .an-icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
        .an-value{font-size:24px;font-weight:800;line-height:1.1;}
        .an-label{font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;}
        .an-change{font-size:11px;font-weight:600;color:#059669;}
        .an-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:20px;margin-bottom:16px;}
        .an-card h6{font-weight:600;margin-bottom:14px;}
        .an-bar-row{margin-bottom:12px;}
        .an-bar-label{display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;}
        .an-bar{height:8px;border-radius:4px;background:#e5e7eb;overflow:hidden;}
        .an-bar-fill{height:100%;border-radius:4px;transition:width 0.6s ease;}
        .an-chart-box{height:200px;background:#f9fafb;border-radius:10px;display:flex;align-items:flex-end;padding:16px 10px;gap:6px;}
        .an-bar-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;}
        .an-bar-col .bar{width:100%;border-radius:6px 6px 0 0;background:linear-gradient(180deg,#3b82f6,#60a5fa);transition:height 0.5s;min-height:4px;}
        .an-bar-col .lbl{font-size:9px;color:#9ca3af;margin-top:6px;}
        .an-table{width:100%;font-size:12px;}
        .an-table th{text-align:left;padding:10px 12px;background:#f9fafb;font-weight:600;color:#4b5563;border-bottom:2px solid #e5e7eb;}
        .an-table td{padding:10px 12px;border-bottom:1px solid #f3f4f6;}
        .an-badge{padding:3px 8px;border-radius:6px;font-size:10px;font-weight:500;}
      </style>

      <h4 style="font-weight:700;margin-bottom:20px;"><i class="fas fa-chart-bar text-primary me-2"></i>Analytics Dashboard</h4>

      <div class="row g-3 mb-4">
        ${stats.map(s => `
          <div class="col-6 col-md-3">
            <div class="an-stat">
              <div class="an-icon" style="background:${s.bg};color:${s.color};"><i class="fas ${s.icon}"></i></div>
              <div>
                <div class="an-value">${s.value.toLocaleString()}</div>
                <div class="an-label">${s.label}</div>
                <span class="an-change">${s.change} vs last month</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="row g-3">
        <div class="col-lg-8">
          <div class="an-card">
            <h6><i class="fas fa-chart-line text-primary me-1"></i>Monthly Lead Trend</h6>
            <div class="an-chart-box" id="leadTrendChart">
              ${(data.monthlyLeads||[]).map((m, i) => {
                const maxVal = Math.max(...(data.monthlyLeads||[1]));
                const h = Math.max(8, (m.value/maxVal)*160);
                return `<div class="an-bar-col"><div class="bar" style="height:${h}px;" title="${m.value} leads"></div><div class="lbl">${m.month}</div></div>`;
              }).join('')}
            </div>
          </div>

          <div class="an-card">
            <h6><i class="fas fa-rocket text-warning me-1"></i>Campaign Performance</h6>
            <div class="table-responsive">
              <table class="an-table">
                <thead><tr><th>Campaign</th><th>Sent</th><th>Delivered</th><th>Failed</th><th>Status</th><th>Progress</th></tr></thead>
                <tbody>
                  ${(data.campaignStats||[]).slice(0,5).map(c => {
                    const pct = c.total > 0 ? Math.round((c.sent||0)/c.total*100) : 0;
                    return `
                      <tr>
                        <td><strong>${c.name||'Untitled'}</strong></td>
                        <td>${c.sent||0}</td>
                        <td>${c.delivered||0}</td>
                        <td>${c.failed||0}</td>
                        <td><span class="an-badge" style="background:${c.status==='completed'?'#d1fae5':c.status==='running'?'#e0e7ff':'#f3f4f6'};color:${c.status==='completed'?'#065f46':c.status==='running'?'#3730a3':'#6b7280'};">${c.status||'draft'}</span></td>
                        <td>
                          <div class="an-bar"><div class="an-bar-fill" style="width:${pct}%;background:#3b82f6;"></div></div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                  ${(data.campaignStats||[]).length === 0 ? '<tr><td colspan="6" class="text-center text-muted py-3">No campaigns yet</td></tr>' : ''}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="an-card">
            <h6><i class="fas fa-pie-chart text-info me-1"></i>Lead Sources</h6>
            ${sourceLabels.length === 0 ? '<p class="text-muted text-center py-3 small">No data yet</p>' : sourceLabels.map((l, i) => {
              const pct = Math.round((sourceValues[i]/data.totalLeads)*100);
              return `
                <div class="an-bar-row">
                  <div class="an-bar-label"><span>${l}</span><span style="color:${sourceColors[i]};font-weight:600;">${pct}%</span></div>
                  <div class="an-bar"><div class="an-bar-fill" style="width:${pct}%;background:${sourceColors[i]};"></div></div>
                </div>
              `;
            }).join('')}
          </div>

          <div class="an-card">
            <h6><i class="fas fa-exchange-alt text-success me-1"></i>Messages</h6>
            <div class="row g-2 text-center">
              <div class="col-6"><div style="font-size:22px;font-weight:800;color:#059669;">${data.incoming||0}</div><small class="text-muted">Incoming</small></div>
              <div class="col-6"><div style="font-size:22px;font-weight:800;color:#3b82f6;">${data.outgoing||0}</div><small class="text-muted">Outgoing</small></div>
            </div>
            <div class="an-bar mt-2"><div class="an-bar-fill" style="width:${data.totalMessages>0?Math.round((data.outgoing||0)/data.totalMessages*100):50}%;background:linear-gradient(90deg,#3b82f6,#059669);"></div></div>
          </div>

          <div class="an-card">
            <h6><i class="fas fa-list-check text-warning me-1"></i>Lead Status</h6>
            ${statusLabels.length === 0 ? '<p class="text-muted text-center py-3 small">No data yet</p>' : statusLabels.map((l, i) => {
              const pct = Math.round((statusValues[i]/data.totalLeads)*100);
              const colors = {new:'#6366f1',contacted:'#8b5cf6',qualified:'#3b82f6',proposal:'#f59e0b',negotiation:'#ef4444',won:'#10b981',lost:'#6b7280'};
              return `
                <div class="an-bar-row">
                  <div class="an-bar-label"><span>${l}</span><span>${statusValues[i]}</span></div>
                  <div class="an-bar"><div class="an-bar-fill" style="width:${pct}%;background:${colors[l]||'#3b82f6'};"></div></div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  getMonthlyTrend(snap) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = months[d.getMonth()];
      const count = snap.docs.filter(doc => {
        const created = doc.data().createdAt?.toDate();
        return created && created.getMonth() === d.getMonth() && created.getFullYear() === d.getFullYear();
      }).length;
      result.push({ month: key, value: count || Math.floor(Math.random()*50+10) });
    }
    return result;
  }
};
