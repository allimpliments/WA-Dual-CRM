// js/reports.js — Pro-Level Comprehensive Reports Engine with clientId isolation
const Reports = {
  currentReport: 'summary',
  dateFrom: null,
  dateTo: null,
  exportFormat: 'csv',

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = '#f8fafc';

    let leadData = {}, campaignData = {}, messageData = {}, contactsData = {}, dealsData = {};
    try {
      // ✅ clientId फ़िल्टर के साथ सारा डेटा लोड
      let lQuery = db.collection('leads');
      if (shouldFilterByClient()) lQuery = lQuery.where('clientId', '==', window.currentUser.clientId);
      if (this.dateFrom) lQuery = lQuery.where('createdAt', '>=', new Date(this.dateFrom));
      if (this.dateTo) lQuery = lQuery.where('createdAt', '<=', new Date(this.dateTo + 'T23:59:59'));
      const lSnap = await lQuery.orderBy('createdAt','desc').get();
      leadData = { total: lSnap.size, list: lSnap.docs.map(d=>({id:d.id,...d.data()})) };

      let cQuery = db.collection('contacts');
      if (shouldFilterByClient()) cQuery = cQuery.where('clientId', '==', window.currentUser.clientId);
      if (this.dateFrom) cQuery = cQuery.where('createdAt', '>=', new Date(this.dateFrom));
      if (this.dateTo) cQuery = cQuery.where('createdAt', '<=', new Date(this.dateTo + 'T23:59:59'));
      const cSnap = await cQuery.orderBy('createdAt','desc').get();
      contactsData = { total: cSnap.size, list: cSnap.docs.map(d=>({id:d.id,...d.data()})) };

      let campQuery = db.collection('campaigns');
      if (shouldFilterByClient()) campQuery = campQuery.where('clientId', '==', window.currentUser.clientId);
      if (this.dateFrom) campQuery = campQuery.where('createdAt', '>=', new Date(this.dateFrom));
      if (this.dateTo) campQuery = campQuery.where('createdAt', '<=', new Date(this.dateTo + 'T23:59:59'));
      const campSnap = await campQuery.orderBy('createdAt','desc').get();
      campaignData = { total: campSnap.size, list: campSnap.docs.map(d=>({id:d.id,...d.data()})) };

      let mQuery = db.collection('messages');
      if (shouldFilterByClient()) mQuery = mQuery.where('clientId', '==', window.currentUser.clientId);
      if (this.dateFrom) mQuery = mQuery.where('createdAt', '>=', new Date(this.dateFrom));
      if (this.dateTo) mQuery = mQuery.where('createdAt', '<=', new Date(this.dateTo + 'T23:59:59'));
      const mSnap = await mQuery.orderBy('createdAt','desc').get();
      messageData = { total: mSnap.size, list: mSnap.docs.map(d=>({id:d.id,...d.data()})) };
    } catch(e) { console.error(e); }

    // Calculations
    const totalLeads = leadData.total || 0;
    const totalContacts = contactsData.total || 0;
    const totalCampaigns = campaignData.total || 0;
    const totalMessages = messageData.total || 0;

    const wonLeads = leadData.list?.filter(l=>l.status==='won').length || 0;
    const lostLeads = leadData.list?.filter(l=>l.status==='lost').length || 0;
    const newLeads = leadData.list?.filter(l=>l.status==='new').length || 0;
    const activeLeads = leadData.list?.filter(l=>!['won','lost'].includes(l.status||'')).length || 0;

    const totalValue = leadData.list?.reduce((s,l)=>s+(parseInt(l.value)||0),0) || 0;
    const wonValue = leadData.list?.filter(l=>l.status==='won').reduce((s,l)=>s+(parseInt(l.value)||0),0) || 0;
    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

    const incoming = messageData.list?.filter(m=>m.type==='incoming').length || 0;
    const outgoing = messageData.list?.filter(m=>m.type==='outgoing').length || 0;
    const deliveredMsgs = messageData.list?.filter(m=>m.status==='delivered').length || 0;
    const failedMsgs = messageData.list?.filter(m=>m.status==='failed').length || 0;

    const runningCampaigns = campaignData.list?.filter(c=>c.status==='running').length || 0;
    const completedCampaigns = campaignData.list?.filter(c=>c.status==='completed').length || 0;
    const totalSent = campaignData.list?.reduce((s,c)=>s+(c.sent||0),0) || 0;
    const totalDelivered = campaignData.list?.reduce((s,c)=>s+(c.delivered||0),0) || 0;

    const avgDealSize = wonLeads > 0 ? Math.round(wonValue / wonLeads) : 0;
    const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;

    // Source distribution
    const sources = {};
    leadData.list?.forEach(l => { const s = l.source || 'Unknown'; sources[s] = (sources[s]||0)+1; });
    const sourceLabels = Object.keys(sources);
    const sourceValues = Object.values(sources);
    const sourceColors = ['#6366f1','#10b981','#f59e0b','#ec4899','#8b5cf6','#06b6d4','#84cc16'];

    // Monthly leads trend
    const monthlyLeads = this.getMonthlyTrend(leadData.list || []);
    const monthlyContacts = this.getMonthlyTrend(contactsData.list || []);

    // Top performing sources
    const topSources = sourceLabels.map((l,i) => ({name:l, count:sourceValues[i], pct: Math.round((sourceValues[i]/totalLeads)*100)})).sort((a,b)=>b.count-a.count).slice(0,5);

    let html = `
      <style>
        .rp-wrap { max-width: 1400px; margin: 0 auto; }
        .rp-hero-card { background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 20px; padding: 28px 32px; margin-bottom: 24px; color: #fff; position: relative; overflow: hidden; }
        .rp-hero-card::after { content: ''; position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(99,102,241,0.15); border-radius: 50%; }
        .rp-hero-title { font-size: 24px; font-weight: 800; margin-bottom: 4px; }
        .rp-hero-sub { font-size: 13px; color: #94a3b8; }
        .rp-stat-card { background: #fff; border-radius: 16px; padding: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; transition: all 0.2s; }
        .rp-stat-card:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.06); transform: translateY(-2px); }
        .rp-stat-value { font-size: 32px; font-weight: 800; line-height: 1; }
        .rp-stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-top: 4px; }
        .rp-stat-change { font-size: 12px; font-weight: 600; margin-top: 2px; }
        .rp-card { background: #fff; border-radius: 16px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; }
        .rp-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .rp-card-header h6 { font-weight: 700; font-size: 15px; color: #0f172a; margin: 0; }
        .rp-table { width: 100%; font-size: 13px; border-collapse: collapse; }
        .rp-table th { text-align: left; padding: 12px 16px; background: #f8fafc; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        .rp-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; }
        .rp-table tr:hover td { background: #f8fafc; }
        .rp-badge { padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; display: inline-block; }
        .rp-bar { height: 8px; border-radius: 10px; background: #f1f5f9; overflow: hidden; }
        .rp-bar-fill { height: 100%; border-radius: 10px; transition: width 1s ease; }
        .rp-funnel-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
        .rp-funnel-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #fff; flex-shrink: 0; }
        .rp-funnel-info { flex: 1; }
        .rp-funnel-name { font-size: 13px; font-weight: 600; color: #0f172a; }
        .rp-funnel-count { font-size: 20px; font-weight: 800; }
        .rp-insight-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 18px; margin-bottom: 10px; }
        .rp-insight-box.warning { background: #fffbeb; border-color: #fde68a; }
        .rp-insight-box.info { background: #eef2ff; border-color: #c7d2fe; }
        .rp-export-btn { padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; }
        .rp-chart-box { height: 200px; background: #f8fafc; border-radius: 12px; display: flex; align-items: flex-end; padding: 20px 16px; gap: 10px; }
        .rp-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; }
        .rp-bar-col .bar { width: 70%; border-radius: 8px 8px 0 0; transition: height 0.8s ease; min-height: 4px; }
        .rp-bar-col .bar:hover { filter: brightness(1.1); }
        .rp-bar-col .val { font-size: 10px; font-weight: 700; margin-bottom: 4px; }
        .rp-bar-col .lbl { font-size: 10px; color: #94a3b8; margin-top: 8px; font-weight: 500; }
        @media (max-width: 768px) { .rp-hero-card { padding: 20px; } .rp-stat-value { font-size: 24px; } }
      </style>

      <div class="rp-wrap">
        <!-- Hero Header -->
        <div class="rp-hero-card">
          <div class="row align-items-center">
            <div class="col-md-8">
              <div class="rp-hero-title"><i class="fas fa-file-alt me-2"></i>Business Reports</div>
              <div class="rp-hero-sub">Comprehensive analytics & performance insights ${this.dateFrom || this.dateTo ? '• Filtered by date' : '• All time'}</div>
            </div>
            <div class="col-md-4 text-md-end mt-3 mt-md-0">
              <div class="d-flex gap-2 justify-content-md-end">
                <input type="date" class="form-control form-control-sm" style="width:140px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;" id="rpDateFrom" value="${this.dateFrom||''}" onchange="Reports.dateFrom=this.value;Reports.render();">
                <input type="date" class="form-control form-control-sm" style="width:140px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;" id="rpDateTo" value="${this.dateTo||''}" onchange="Reports.dateTo=this.value;Reports.render();">
              </div>
            </div>
          </div>
        </div>

        <!-- KPI Row -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-md-4 col-lg-2">
            <div class="rp-stat-card text-center">
              <div class="rp-stat-value" style="color:#6366f1;">${totalLeads}</div>
              <div class="rp-stat-label">Total Leads</div>
              <div class="rp-stat-change" style="color:#10b981;">${newLeads} new</div>
            </div>
          </div>
          <div class="col-6 col-md-4 col-lg-2">
            <div class="rp-stat-card text-center">
              <div class="rp-stat-value" style="color:#10b981;">${wonLeads}</div>
              <div class="rp-stat-label">Won Deals</div>
              <div class="rp-stat-change" style="color:#6366f1;">${conversionRate}% conv.</div>
            </div>
          </div>
          <div class="col-6 col-md-4 col-lg-2">
            <div class="rp-stat-card text-center">
              <div class="rp-stat-value" style="color:#f59e0b;">₹${totalValue >= 100000 ? (totalValue/100000).toFixed(1)+'L' : (totalValue/1000).toFixed(0)+'K'}</div>
              <div class="rp-stat-label">Pipeline Value</div>
              <div class="rp-stat-change" style="color:#10b981;">₹${avgDealSize.toLocaleString()} avg</div>
            </div>
          </div>
          <div class="col-6 col-md-4 col-lg-2">
            <div class="rp-stat-card text-center">
              <div class="rp-stat-value" style="color:#ec4899;">${totalMessages}</div>
              <div class="rp-stat-label">Messages</div>
              <div class="rp-stat-change" style="color:#6366f1;">${incoming} in / ${outgoing} out</div>
            </div>
          </div>
          <div class="col-6 col-md-4 col-lg-2">
            <div class="rp-stat-card text-center">
              <div class="rp-stat-value" style="color:#06b6d4;">${totalCampaigns}</div>
              <div class="rp-stat-label">Campaigns</div>
              <div class="rp-stat-change" style="color:#f59e0b;">${runningCampaigns} active</div>
            </div>
          </div>
          <div class="col-6 col-md-4 col-lg-2">
            <div class="rp-stat-card text-center">
              <div class="rp-stat-value" style="color:#8b5cf6;">${deliveryRate}%</div>
              <div class="rp-stat-label">Delivery Rate</div>
              <div class="rp-stat-change" style="color:#10b981;">${totalDelivered} delivered</div>
            </div>
          </div>
        </div>

        <div class="row g-3">
          <!-- Main Content -->
          <div class="col-lg-8">
            <!-- Monthly Trend Chart -->
            <div class="rp-card">
              <div class="rp-card-header">
                <h6><i class="fas fa-chart-bar text-primary me-2"></i>Monthly Lead & Contact Growth</h6>
                <span class="rp-badge" style="background:#eef2ff;color:#6366f1;">Last 6 Months</span>
              </div>
              <div class="rp-chart-box">
                ${monthlyLeads.map((m, i) => {
                  const contactVal = monthlyContacts[i]?.value || 0;
                  const maxVal = Math.max(...monthlyLeads.map(x=>x.value), ...monthlyContacts.map(x=>x.value), 1);
                  const h = Math.max(8, (m.value/maxVal)*160);
                  const hc = Math.max(8, (contactVal/maxVal)*160);
                  return `
                    <div class="rp-bar-col">
                      <div class="val" style="color:#6366f1;">${m.value}</div>
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

            <!-- Recent Leads Table -->
            <div class="rp-card">
              <div class="rp-card-header">
                <h6><i class="fas fa-funnel-dollar text-primary me-2"></i>Recent Leads</h6>
                <button class="rp-export-btn" style="background:#eef2ff;color:#6366f1;" onclick="Reports.exportTable('leads')"><i class="fas fa-download me-1"></i> Export</button>
              </div>
              <div class="table-responsive">
                <table class="rp-table">
                  <thead><tr><th>Name</th><th>Contact</th><th>Source</th><th>Status</th><th>Value</th><th>Date</th></tr></thead>
                  <tbody>
                    ${(leadData.list||[]).length === 0 ? '<tr><td colspan="6" class="text-center text-muted py-4">No leads found</td></tr>' : 
                    (leadData.list||[]).slice(0,10).map(l => `
                      <tr>
                        <td><strong>${l.name||'N/A'}</strong></td>
                        <td style="font-size:12px;">${l.phone||l.email||'-'}</td>
                        <td><span class="rp-badge" style="background:#eef2ff;color:#6366f1;">${l.source||'Manual'}</span></td>
                        <td><span class="rp-badge" style="background:${l.status==='won'?'#ecfdf5':l.status==='lost'?'#fef2f2':'#f8fafc'};color:${l.status==='won'?'#10b981':l.status==='lost'?'#ef4444':'#64748b'};">${l.status||'new'}</span></td>
                        <td>${l.value?`₹${parseInt(l.value).toLocaleString()}`:'-'}</td>
                        <td style="font-size:12px;">${l.createdAt?.toDate().toLocaleDateString()||'-'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Campaign Summary Table -->
            <div class="rp-card">
              <div class="rp-card-header">
                <h6><i class="fas fa-rocket text-warning me-2"></i>Campaign Summary</h6>
                <button class="rp-export-btn" style="background:#fffbeb;color:#f59e0b;" onclick="Reports.exportTable('campaigns')"><i class="fas fa-download me-1"></i> Export</button>
              </div>
              <div class="table-responsive">
                <table class="rp-table">
                  <thead><tr><th>Campaign</th><th>Type</th><th>Sent</th><th>Delivered</th><th>Failed</th><th>Status</th></tr></thead>
                  <tbody>
                    ${(campaignData.list||[]).length === 0 ? '<tr><td colspan="6" class="text-center text-muted py-4">No campaigns yet</td></tr>' :
                    (campaignData.list||[]).slice(0,10).map(c => `
                      <tr>
                        <td><strong>${c.name||'Untitled'}</strong></td>
                        <td><span class="rp-badge" style="background:#f1f5f9;color:#64748b;">${c.type||'bulk'}</span></td>
                        <td>${c.sent||0}</td>
                        <td style="color:#10b981;">${c.delivered||0}</td>
                        <td style="color:#ef4444;">${c.failed||0}</td>
                        <td><span class="rp-badge" style="background:${c.status==='completed'?'#ecfdf5':c.status==='running'?'#eef2ff':'#f8fafc'};color:${c.status==='completed'?'#10b981':c.status==='running'?'#6366f1':'#64748b'};">${c.status||'draft'}</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="col-lg-4">
            <!-- Key Insights -->
            <div class="rp-card">
              <div class="rp-card-header">
                <h6><i class="fas fa-lightbulb text-warning me-2"></i>Key Insights</h6>
              </div>
              <div class="rp-insight-box">
                <div style="font-size:12px;font-weight:600;color:#065f46;"><i class="fas fa-trophy me-1"></i> Top Performance</div>
                <p class="mb-0 mt-1" style="font-size:13px;"><strong>${wonLeads}</strong> deals won worth <strong>₹${wonValue >= 100000 ? (wonValue/100000).toFixed(1)+'L' : '₹'+wonValue.toLocaleString()}</strong></p>
              </div>
              ${conversionRate < 20 ? `
              <div class="rp-insight-box warning">
                <div style="font-size:12px;font-weight:600;color:#92400e;"><i class="fas fa-exclamation-triangle me-1"></i> Needs Attention</div>
                <p class="mb-0 mt-1" style="font-size:13px;">Conversion rate is <strong>${conversionRate}%</strong>. Consider improving follow-ups.</p>
              </div>` : ''}
              ${deliveryRate < 80 && totalSent > 0 ? `
              <div class="rp-insight-box warning">
                <div style="font-size:12px;font-weight:600;color:#92400e;"><i class="fas fa-exclamation-triangle me-1"></i> Delivery Issue</div>
                <p class="mb-0 mt-1" style="font-size:13px;">Message delivery rate: <strong>${deliveryRate}%</strong>. Check WhatsApp templates.</p>
              </div>` : ''}
              <div class="rp-insight-box info">
                <div style="font-size:12px;font-weight:600;color:#3730a3;"><i class="fas fa-chart-line me-1"></i> Growth</div>
                <p class="mb-0 mt-1" style="font-size:13px;"><strong>${totalContacts}</strong> contacts • <strong>${totalMessages}</strong> messages exchanged</p>
              </div>
              ${activeLeads > 0 ? `
              <div class="rp-insight-box info">
                <div style="font-size:12px;font-weight:600;color:#3730a3;"><i class="fas fa-clock me-1"></i> Active Pipeline</div>
                <p class="mb-0 mt-1" style="font-size:13px;"><strong>${activeLeads}</strong> active leads worth <strong>₹${totalValue.toLocaleString()}</strong></p>
              </div>` : ''}
            </div>

            <!-- Top Sources -->
            <div class="rp-card">
              <div class="rp-card-header">
                <h6><i class="fas fa-pie-chart text-info me-2"></i>Top Sources</h6>
              </div>
              ${topSources.length === 0 ? '<p class="text-muted text-center py-3 small">No data yet</p>' : topSources.map((s,i) => `
                <div style="margin-bottom:12px;">
                  <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
                    <span style="font-weight:500;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${sourceColors[i]};margin-right:6px;"></span>${s.name}</span>
                    <span style="font-weight:600;color:${sourceColors[i]};">${s.count} (${s.pct}%)</span>
                  </div>
                  <div class="rp-bar"><div class="rp-bar-fill" style="width:${s.pct}%;background:${sourceColors[i]};"></div></div>
                </div>
              `).join('')}
            </div>

            <!-- Conversion Funnel -->
            <div class="rp-card">
              <div class="rp-card-header">
                <h6><i class="fas fa-filter text-success me-2"></i>Conversion Funnel</h6>
                <span class="rp-badge" style="background:#ecfdf5;color:#10b981;">${conversionRate}%</span>
              </div>
              ${[
                {stage:'Total Leads', count:totalLeads, color:'#6366f1', icon:'fa-users'},
                {stage:'Active', count:activeLeads, color:'#8b5cf6', icon:'fa-spinner'},
                {stage:'Qualified', count:leadData.list?.filter(l=>['qualified','proposal','negotiation'].includes(l.status)).length||0, color:'#3b82f6', icon:'fa-check-circle'},
                {stage:'Proposal Sent', count:leadData.list?.filter(l=>l.status==='proposal').length||0, color:'#f59e0b', icon:'fa-file-alt'},
                {stage:'Won', count:wonLeads, color:'#10b981', icon:'fa-trophy'},
              ].map(f => `
                <div class="rp-funnel-item">
                  <div class="rp-funnel-icon" style="background:${f.color};"><i class="fas ${f.icon}"></i></div>
                  <div class="rp-funnel-info">
                    <div class="rp-funnel-name">${f.stage}</div>
                    <div style="font-size:11px;color:#94a3b8;">${f.count > 0 && f.stage !== 'Total Leads' ? Math.round((f.count/totalLeads)*100)+'% of total' : ''}</div>
                  </div>
                  <div class="rp-funnel-count" style="color:${f.color};">${f.count}</div>
                </div>
              `).join('')}
            </div>

            <!-- Export Buttons -->
            <div class="rp-card">
              <div class="rp-card-header">
                <h6><i class="fas fa-download text-primary me-2"></i>Export Reports</h6>
              </div>
              <div class="d-grid gap-2">
                <button class="rp-export-btn" style="background:#eef2ff;color:#6366f1;width:100%;" onclick="Reports.exportReport('csv')">
                  <i class="fas fa-file-csv me-2"></i> Export as CSV
                </button>
                <button class="rp-export-btn" style="background:#fef2f2;color:#ef4444;width:100%;" onclick="Reports.exportReport('pdf')">
                  <i class="fas fa-file-pdf me-2"></i> Export as PDF
                </button>
                <button class="rp-export-btn" style="background:#f8fafc;color:#64748b;width:100%;" onclick="Reports.printReport()">
                  <i class="fas fa-print me-2"></i> Print Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  getMonthlyTrend(list) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = months[d.getMonth()];
      const count = list.filter(item => {
        const created = item.createdAt?.toDate();
        return created && created.getMonth() === d.getMonth() && created.getFullYear() === d.getFullYear();
      }).length;
      result.push({ month: key, value: count });
    }
    return result;
  },

  exportTable(type) {
    let csv = '';
    if (type === 'leads') {
      csv = 'Name,Phone,Email,Source,Status,Value,Date\n';
      document.querySelectorAll('.rp-table:first-of-type tbody tr').forEach(row => {
        const cols = row.querySelectorAll('td');
        if (cols.length >= 6) {
          csv += `"${cols[0].innerText}","${cols[1].innerText}","${cols[2].innerText}","${cols[3].innerText}","${cols[4].innerText}","${cols[5].innerText}"\n`;
        }
      });
    } else if (type === 'campaigns') {
      csv = 'Campaign,Type,Sent,Delivered,Failed,Status\n';
      document.querySelectorAll('.rp-table:last-of-type tbody tr').forEach(row => {
        const cols = row.querySelectorAll('td');
        if (cols.length >= 6) {
          csv += `"${cols[0].innerText}","${cols[1].innerText}","${cols[2].innerText}","${cols[3].innerText}","${cols[4].innerText}","${cols[5].innerText}"\n`;
        }
      });
    }
    if (csv) {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  },

  exportReport(format) {
    if (format === 'csv') {
      this.exportTable('leads');
      setTimeout(() => this.exportTable('campaigns'), 500);
    } else if (format === 'pdf') {
      window.print();
    }
  },

  printReport() {
    window.print();
  }
};
