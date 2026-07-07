// js/analytics.js — Pro-Level Real-Time Analytics Dashboard with clientId isolation
const Analytics = {
  currentView: 'overview',
  dateRange: '30d',
  refreshTimer: null,

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = '#f8fafc';
    
    let data = {};
    try {
      // ✅ clientId फ़िल्टर के साथ सारा डेटा लोड
      let lQuery = db.collection('leads');
      if (shouldFilterByClient()) lQuery = lQuery.where('clientId', '==', window.currentUser.clientId);
      const leadsSnap = await lQuery.get();

      let cQuery = db.collection('contacts');
      if (shouldFilterByClient()) cQuery = cQuery.where('clientId', '==', window.currentUser.clientId);
      const contactsSnap = await cQuery.get();

      let campQuery = db.collection('campaigns');
      if (shouldFilterByClient()) campQuery = campQuery.where('clientId', '==', window.currentUser.clientId);
      const campaignsSnap = await campQuery.get();

      let mQuery = db.collection('messages');
      if (shouldFilterByClient()) mQuery = mQuery.where('clientId', '==', window.currentUser.clientId);
      const messagesSnap = await mQuery.get();
      
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

      // Lead values
      data.totalValue = 0;
      data.wonValue = 0;
      leadsSnap.forEach(d => {
        const ld = d.data();
        const val = parseInt(ld.value) || 0;
        data.totalValue += val;
        if (ld.status === 'won') data.wonValue += val;
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
      data.monthlyContacts = this.getMonthlyTrend(contactsSnap);

      // Conversion rate
      const wonLeads = leadsSnap.docs.filter(d => d.data().status === 'won').length;
      data.conversionRate = data.totalLeads > 0 ? Math.round((wonLeads / data.totalLeads) * 100) : 0;

      // Average response time (dummy for now)
      data.avgResponseTime = '2.4 min';
      
    } catch(e) { console.error('Analytics error:', e); }

    const stats = [
      { label: 'Total Leads', value: data.totalLeads||0, icon: 'fa-user-plus', color: '#6366f1', bg: '#eef2ff', change: `↑ ${data.monthlyLeads?.[5]?.value||0} this month` },
      { label: 'Contacts', value: data.totalContacts||0, icon: 'fa-users', color: '#10b981', bg: '#ecfdf5', change: `${data.conversionRate}% conversion` },
      { label: 'Campaigns', value: data.totalCampaigns||0, icon: 'fa-rocket', color: '#f59e0b', bg: '#fffbeb', change: `${data.campaignStats?.filter(c=>c.status==='running').length||0} active` },
      { label: 'Messages', value: data.totalMessages||0, icon: 'fa-comments', color: '#ec4899', bg: '#fdf2f8', change: `${data.incoming||0} in / ${data.outgoing||0} out` }
    ];

    const sourceLabels = Object.keys(data.sources||{});
    const sourceValues = Object.values(data.sources||{});
    const statusLabels = Object.keys(data.statuses||{});
    const statusValues = Object.values(data.statuses||{});

    // Pie chart data for sources
    const sourceColors = ['#6366f1','#10b981','#f59e0b','#ec4899','#8b5cf6','#06b6d4','#84cc16','#f97316'];
    const totalSource = sourceValues.reduce((a,b)=>a+b,0);
    let pieSegments = '';
    let cumulativePercent = 0;
    sourceLabels.forEach((l, i) => {
      const percent = (sourceValues[i] / totalSource) * 100;
      const start = cumulativePercent;
      cumulativePercent += percent;
      pieSegments += `<circle r="80" cx="120" cy="120" fill="transparent" stroke="${sourceColors[i]}" stroke-width="30" 
        stroke-dasharray="${percent * 5.027} ${(100 - percent) * 5.027}" 
        stroke-dashoffset="${-start * 5.027}" 
        transform="rotate(-90 120 120)" style="transition: all 1s ease;"/>`;
    });

    const statusColors = {new:'#6366f1', contacted:'#8b5cf6', qualified:'#3b82f6', proposal:'#f59e0b', negotiation:'#f97316', won:'#10b981', lost:'#ef4444'};

    let html = `
      <style>
        .an-wrap { max-width: 1400px; margin: 0 auto; }
        .an-stat-card { background: #fff; border-radius: 16px; padding: 20px 24px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; transition: all 0.2s; cursor: pointer; }
        .an-stat-card:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.06); transform: translateY(-2px); }
        .an-stat-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
        .an-stat-value { font-size: 28px; font-weight: 800; line-height: 1.1; color: #0f172a; }
        .an-stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
        .an-stat-sub { font-size: 11px; color: #10b981; font-weight: 500; margin-top: 2px; }
        .an-card { background: #fff; border-radius: 16px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; }
        .an-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .an-card-header h6 { font-weight: 700; font-size: 15px; color: #0f172a; margin: 0; }
        .an-badge { padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; }
        .an-bar-row { margin-bottom: 14px; }
        .an-bar-label { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; color: #475569; font-weight: 500; }
        .an-bar { height: 8px; border-radius: 10px; background: #f1f5f9; overflow: hidden; }
        .an-bar-fill { height: 100%; border-radius: 10px; transition: width 1s ease; }
        .an-chart-box { height: 220px; background: #f8fafc; border-radius: 12px; display: flex; align-items: flex-end; padding: 20px 16px; gap: 10px; }
        .an-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; }
        .an-bar-col .bar { width: 70%; border-radius: 8px 8px 0 0; background: linear-gradient(180deg, #6366f1, #818cf8); transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1); min-height: 4px; position: relative; }
        .an-bar-col .bar:hover { filter: brightness(1.1); }
        .an-bar-col .val { font-size: 10px; color: #6366f1; font-weight: 700; margin-bottom: 4px; }
        .an-bar-col .lbl { font-size: 10px; color: #94a3b8; margin-top: 8px; font-weight: 500; }
        .an-table { width: 100%; font-size: 13px; border-collapse: collapse; }
        .an-table th { text-align: left; padding: 12px 16px; background: #f8fafc; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        .an-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; }
        .an-table tr:hover td { background: #f8fafc; }
        .an-progress-ring { position: relative; width: 120px; height: 120px; margin: 0 auto; }
        .an-ring-value { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 24px; font-weight: 800; color: #0f172a; }
        .an-kpi-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 16px; }
        .an-kpi { text-align: center; padding: 12px; background: #f8fafc; border-radius: 10px; }
        .an-kpi .kpi-val { font-size: 20px; font-weight: 700; }
        .an-kpi .kpi-lbl { font-size: 10px; color: #64748b; text-transform: uppercase; }
        @media (max-width: 768px) { .an-kpi-row { grid-template-columns: repeat(2, 1fr); } }
      </style>

      <div class="an-wrap">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 style="font-weight:800; font-size:24px; color:#0f172a; margin:0;"><i class="fas fa-chart-pie text-primary me-2"></i>Analytics Dashboard</h4>
            <small class="text-muted">Real-time insights and performance metrics</small>
          </div>
          <div class="d-flex gap-2">
            <select class="form-select form-select-sm" style="width:120px;" onchange="Analytics.dateRange=this.value;Analytics.render();">
              <option value="7d">Last 7 days</option>
              <option value="30d" selected>Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button class="btn btn-outline-primary btn-sm" onclick="Analytics.render()"><i class="fas fa-sync-alt"></i></button>
          </div>
        </div>

        <!-- KPI Cards -->
        <div class="row g-3 mb-4">
          ${stats.map(s => `
            <div class="col-6 col-xl-3">
              <div class="an-stat-card">
                <div class="an-stat-icon" style="background:${s.bg};color:${s.color};"><i class="fas ${s.icon}"></i></div>
                <div>
                  <div class="an-stat-value">${typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</div>
                  <div class="an-stat-label">${s.label}</div>
                  <div class="an-stat-sub">${s.change}</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="row g-3">
          <!-- Main Chart Area -->
          <div class="col-lg-8">
            <!-- Lead Trend -->
            <div class="an-card">
              <div class="an-card-header">
                <h6><i class="fas fa-chart-line text-primary me-2"></i>Lead & Contact Trend</h6>
                <span class="an-badge" style="background:#eef2ff;color:#6366f1;">Last 6 Months</span>
              </div>
              <div class="an-chart-box" id="leadTrendChart">
                ${(data.monthlyLeads||[]).map((m, i) => {
                  const contactVal = data.monthlyContacts?.[i]?.value || 0;
                  const maxVal = Math.max(...(data.monthlyLeads||[1]).map(x=>x.value), ...(data.monthlyContacts||[0]).map(x=>x.value), 1);
                  const h = Math.max(8, (m.value/maxVal)*180);
                  const hc = Math.max(8, (contactVal/maxVal)*180);
                  return `
                    <div class="an-bar-col">
                      <div class="val">${m.value}</div>
                      <div class="bar" style="height:${h}px; background:linear-gradient(180deg,#6366f1,#818cf8);" title="Leads: ${m.value}"></div>
                      <div class="bar" style="height:${hc}px; background:linear-gradient(180deg,#10b981,#34d399); margin-top:2px;" title="Contacts: ${contactVal}"></div>
                      <div class="lbl">${m.month}</div>
                    </div>`;
                }).join('')}
              </div>
              <div class="d-flex justify-content-center gap-4 mt-3">
                <span style="font-size:11px;color:#6366f1;"><span style="display:inline-block;width:10px;height:10px;background:#6366f1;border-radius:2px;margin-right:4px;"></span>Leads</span>
                <span style="font-size:11px;color:#10b981;"><span style="display:inline-block;width:10px;height:10px;background:#10b981;border-radius:2px;margin-right:4px;"></span>Contacts</span>
              </div>
            </div>

            <!-- Campaign Performance Table -->
            <div class="an-card">
              <div class="an-card-header">
                <h6><i class="fas fa-rocket text-warning me-2"></i>Campaign Performance</h6>
                <span class="an-badge" style="background:#fffbeb;color:#f59e0b;">${data.campaignStats?.length||0} Total</span>
              </div>
              <div class="table-responsive">
                <table class="an-table">
                  <thead><tr><th>Campaign</th><th>Type</th><th>Sent</th><th>Delivered</th><th>Failed</th><th>Status</th><th>Progress</th></tr></thead>
                  <tbody>
                    ${(data.campaignStats||[]).slice(0,5).map(c => {
                      const pct = c.total > 0 ? Math.round((c.sent||0)/c.total*100) : 0;
                      return `
                        <tr>
                          <td><strong>${c.name||'Untitled'}</strong></td>
                          <td><span class="an-badge" style="background:#f1f5f9;color:#64748b;">${c.type||'bulk'}</span></td>
                          <td>${c.sent||0}</td>
                          <td style="color:#10b981;">${c.delivered||0}</td>
                          <td style="color:#ef4444;">${c.failed||0}</td>
                          <td><span class="an-badge" style="background:${c.status==='completed'?'#ecfdf5':c.status==='running'?'#eef2ff':'#f1f5f9'};color:${c.status==='completed'?'#10b981':c.status==='running'?'#6366f1':'#64748b'};">${c.status||'draft'}</span></td>
                          <td style="width:120px;">
                            <div class="an-bar"><div class="an-bar-fill" style="width:${pct}%;background:${pct===100?'#10b981':'#6366f1'};"></div></div>
                            <small style="font-size:10px;color:#94a3b8;">${pct}%</small>
                          </td>
                        </tr>`;
                    }).join('')}
                    ${(data.campaignStats||[]).length === 0 ? '<tr><td colspan="7" class="text-center text-muted py-4">No campaigns yet</td></tr>' : ''}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="col-lg-4">
            <!-- Conversion Ring -->
            <div class="an-card text-center">
              <h6 style="font-weight:700;font-size:14px;color:#0f172a;margin-bottom:16px;"><i class="fas fa-bullseye text-danger me-2"></i>Conversion Rate</h6>
              <div class="an-progress-ring">
                <svg width="120" height="120" viewBox="0 0 240 240">
                  <circle r="80" cx="120" cy="120" fill="transparent" stroke="#f1f5f9" stroke-width="30"/>
                  <circle r="80" cx="120" cy="120" fill="transparent" stroke="#10b981" stroke-width="30" 
                    stroke-dasharray="${data.conversionRate * 5.027} 502.7" 
                    stroke-dashoffset="0" transform="rotate(-90 120 120)" style="transition: all 1s ease;"/>
                </svg>
                <div class="an-ring-value">${data.conversionRate}%</div>
              </div>
              <p class="text-muted small mt-2">Lead to Won conversion</p>
              <div class="an-kpi-row">
                <div class="an-kpi">
                  <div class="kpi-val" style="color:#6366f1;">${data.totalValue ? '₹'+Math.round(data.totalValue/1000)+'K' : '₹0'}</div>
                  <div class="kpi-lbl">Pipeline Value</div>
                </div>
                <div class="an-kpi">
                  <div class="kpi-val" style="color:#10b981;">${data.wonValue ? '₹'+Math.round(data.wonValue/1000)+'K' : '₹0'}</div>
                  <div class="kpi-lbl">Won Value</div>
                </div>
                <div class="an-kpi">
                  <div class="kpi-val" style="color:#f59e0b;">${data.avgResponseTime}</div>
                  <div class="kpi-lbl">Avg Response</div>
                </div>
              </div>
            </div>

            <!-- Lead Sources -->
            <div class="an-card">
              <div class="an-card-header">
                <h6><i class="fas fa-pie-chart text-info me-2"></i>Lead Sources</h6>
              </div>
              ${sourceLabels.length === 0 ? '<p class="text-muted text-center py-4 small">No data yet</p>' : `
                <div style="position:relative;width:240px;height:240px;margin:0 auto 16px;">
                  <svg width="240" height="240" viewBox="0 0 240 240">
                    ${pieSegments}
                  </svg>
                  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">
                    <div style="font-size:22px;font-weight:800;color:#0f172a;">${data.totalLeads}</div>
                    <div style="font-size:10px;color:#94a3b8;">Total</div>
                  </div>
                </div>
                ${sourceLabels.map((l, i) => {
                  const pct = Math.round((sourceValues[i]/totalSource)*100);
                  return `
                    <div class="an-bar-row">
                      <div class="an-bar-label"><span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${sourceColors[i]};margin-right:6px;"></span>${l}</span><span style="font-weight:600;color:${sourceColors[i]};">${pct}%</span></div>
                      <div class="an-bar"><div class="an-bar-fill" style="width:${pct}%;background:${sourceColors[i]};"></div></div>
                    </div>`;
                }).join('')
              }`}
            </div>

            <!-- Lead Status -->
            <div class="an-card">
              <div class="an-card-header">
                <h6><i class="fas fa-list-check text-success me-2"></i>Lead Status</h6>
              </div>
              ${statusLabels.length === 0 ? '<p class="text-muted text-center py-4 small">No data yet</p>' : statusLabels.map((l, i) => {
                const pct = Math.round((statusValues[i]/data.totalLeads)*100);
                return `
                  <div class="an-bar-row">
                    <div class="an-bar-label">
                      <span>${l.charAt(0).toUpperCase()+l.slice(1)}</span>
                      <span style="font-weight:600;color:${statusColors[l]||'#64748b'};">${statusValues[i]} (${pct}%)</span>
                    </div>
                    <div class="an-bar"><div class="an-bar-fill" style="width:${pct}%;background:${statusColors[l]||'#6366f1'};"></div></div>
                  </div>`;
              }).join('')}
            </div>

            <!-- Message Stats -->
            <div class="an-card">
              <div class="an-card-header">
                <h6><i class="fas fa-comments text-pink me-2"></i>Message Activity</h6>
              </div>
              <div class="row g-3 text-center">
                <div class="col-4">
                  <div style="font-size:26px;font-weight:800;color:#10b981;">${data.incoming||0}</div>
                  <small style="color:#64748b;font-size:10px;text-transform:uppercase;">Incoming</small>
                </div>
                <div class="col-4">
                  <div style="font-size:26px;font-weight:800;color:#6366f1;">${data.outgoing||0}</div>
                  <small style="color:#64748b;font-size:10px;text-transform:uppercase;">Outgoing</small>
                </div>
                <div class="col-4">
                  <div style="font-size:26px;font-weight:800;color:#f59e0b;">${data.totalMessages||0}</div>
                  <small style="color:#64748b;font-size:10px;text-transform:uppercase;">Total</small>
                </div>
              </div>
              <div class="an-bar mt-3">
                <div class="an-bar-fill" style="width:${data.totalMessages>0?Math.round((data.outgoing||0)/data.totalMessages*100):50}%;background:linear-gradient(90deg,#6366f1,#10b981);"></div>
              </div>
              <div class="d-flex justify-content-between mt-1">
                <small style="color:#6366f1;font-size:10px;">Out: ${data.outgoing||0}</small>
                <small style="color:#10b981;font-size:10px;">In: ${data.incoming||0}</small>
              </div>
            </div>
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
      result.push({ month: key, value: count });
    }
    return result;
  }
};
