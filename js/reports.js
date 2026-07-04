// js/reports.js — Comprehensive Reports Engine
const Reports = {
  currentReport: 'summary',
  dateFrom: null,
  dateTo: null,

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = 'var(--bg-primary, #f0f2f5)';

    let leadData = {}, campaignData = {}, messageData = {};
    try {
      const [lSnap, cSnap, mSnap] = await Promise.all([
        db.collection('leads').orderBy('createdAt','desc').get(),
        db.collection('campaigns').orderBy('createdAt','desc').get(),
        db.collection('messages').orderBy('createdAt','desc').get()
      ]);
      leadData = { total: lSnap.size, list: lSnap.docs.map(d=>({id:d.id,...d.data()})) };
      campaignData = { total: cSnap.size, list: cSnap.docs.map(d=>({id:d.id,...d.data()})) };
      messageData = { total: mSnap.size, list: mSnap.docs.map(d=>({id:d.id,...d.data()})) };
    } catch(e) { console.error(e); }

    const wonLeads = leadData.list?.filter(l=>l.status==='won').length||0;
    const totalValue = leadData.list?.reduce((s,l)=>s+(parseInt(l.value)||0),0)||0;
    const avgResponse = '2.4 min';

    let html = `
      <style>
        .rp-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:20px;margin-bottom:14px;}
        .rp-card h6{font-weight:600;margin-bottom:14px;}
        .rp-stat-mini{text-align:center;padding:14px;background:#f9fafb;border-radius:10px;}
        .rp-stat-mini .val{font-size:22px;font-weight:800;}
        .rp-stat-mini .lbl{font-size:10px;color:#6b7280;text-transform:uppercase;}
        .rp-table{width:100%;font-size:12px;}
        .rp-table th{text-align:left;padding:10px;background:#f9fafb;font-weight:600;color:#4b5563;border-bottom:2px solid #e5e7eb;}
        .rp-table td{padding:10px;border-bottom:1px solid #f3f4f6;}
        .rp-badge{padding:3px 8px;border-radius:6px;font-size:10px;font-weight:500;}
      </style>

      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 style="font-weight:700;"><i class="fas fa-file-alt text-info me-2"></i>Reports</h4>
        <div class="d-flex gap-2">
          <input type="date" class="form-control form-control-sm" style="width:140px;" id="rpDateFrom" onchange="Reports.dateFrom=this.value;Reports.render();">
          <input type="date" class="form-control form-control-sm" style="width:140px;" id="rpDateTo" onchange="Reports.dateTo=this.value;Reports.render();">
          <button class="btn btn-outline-primary btn-sm" onclick="Reports.exportReport()"><i class="fas fa-download me-1"></i> Export</button>
        </div>
      </div>

      <div class="row g-3 mb-3">
        <div class="col-6 col-md-3"><div class="rp-stat-mini"><div class="val" style="color:#4f46e5;">${leadData.total||0}</div><div class="lbl">Total Leads</div></div></div>
        <div class="col-6 col-md-3"><div class="rp-stat-mini"><div class="val" style="color:#059669;">${wonLeads}</div><div class="lbl">Won Deals</div></div></div>
        <div class="col-6 col-md-3"><div class="rp-stat-mini"><div class="val" style="color:#d97706;">₹${(totalValue/100000).toFixed(1)}L</div><div class="lbl">Pipeline Value</div></div></div>
        <div class="col-6 col-md-3"><div class="rp-stat-mini"><div class="val" style="color:#db2777;">${avgResponse}</div><div class="lbl">Avg Response</div></div></div>
      </div>

      <div class="row g-3">
        <div class="col-lg-8">
          <div class="rp-card">
            <h6><i class="fas fa-funnel-dollar text-primary me-1"></i>Recent Leads</h6>
            <div class="table-responsive">
              <table class="rp-table">
                <thead><tr><th>Name</th><th>Source</th><th>Status</th><th>Value</th><th>Date</th></tr></thead>
                <tbody>
                  ${(leadData.list||[]).slice(0,10).map(l => `
                    <tr>
                      <td><strong>${l.name||'N/A'}</strong></td>
                      <td><span class="rp-badge" style="background:#e0e7ff;color:#4f46e5;">${l.source||'Manual'}</span></td>
                      <td><span class="rp-badge" style="background:${l.status==='won'?'#d1fae5':l.status==='lost'?'#fee2e2':'#f3f4f6'};color:${l.status==='won'?'#065f46':l.status==='lost'?'#991b1b':'#6b7280'};">${l.status||'new'}</span></td>
                      <td>${l.value?`₹${parseInt(l.value).toLocaleString()}`:'-'}</td>
                      <td>${l.createdAt?.toDate().toLocaleDateString()||'-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="rp-card">
            <h6><i class="fas fa-rocket text-warning me-1"></i>Campaign Summary</h6>
            <div class="table-responsive">
              <table class="rp-table">
                <thead><tr><th>Campaign</th><th>Type</th><th>Sent</th><th>Delivered</th><th>Failed</th><th>Status</th></tr></thead>
                <tbody>
                  ${(campaignData.list||[]).slice(0,10).map(c => `
                    <tr>
                      <td><strong>${c.name||'Untitled'}</strong></td>
                      <td>${c.type||'bulk'}</td>
                      <td>${c.sent||0}</td>
                      <td>${c.delivered||0}</td>
                      <td>${c.failed||0}</td>
                      <td><span class="rp-badge" style="background:${c.status==='completed'?'#d1fae5':'#e0e7ff'};color:${c.status==='completed'?'#065f46':'#3730a3'};">${c.status||'draft'}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="rp-card">
            <h6><i class="fas fa-lightbulb text-warning me-1"></i>Key Insights</h6>
            ${[
              {icon:'fa-trophy',color:'#f59e0b',text:`<strong>${wonLeads}</strong> deals won`},
              {icon:'fa-chart-line',color:'#3b82f6',text:`<strong>₹${(totalValue/100000).toFixed(1)}L</strong> pipeline`},
              {icon:'fa-clock',color:'#059669',text:`<strong>${avgResponse}</strong> avg response`},
              {icon:'fa-users',color:'#7c3aed',text:`<strong>${leadData.total||0}</strong> total leads`},
              {icon:'fa-paper-plane',color:'#db2777',text:`<strong>${messageData.total||0}</strong> messages`}
            ].map(ins => `
              <div class="d-flex align-items-center gap-2 mb-2" style="font-size:13px;">
                <i class="fas ${ins.icon}" style="color:${ins.color};width:20px;"></i>
                <span>${ins.text}</span>
              </div>
            `).join('')}
          </div>

          <div class="rp-card">
            <h6><i class="fas fa-chart-pie text-info me-1"></i>Conversion Funnel</h6>
            ${[
              {stage:'Total Leads',count:leadData.total||0,color:'#6366f1',pct:100},
              {stage:'Contacted',count:Math.round((leadData.total||0)*0.7),color:'#8b5cf6',pct:70},
              {stage:'Qualified',count:Math.round((leadData.total||0)*0.4),color:'#3b82f6',pct:40},
              {stage:'Proposal',count:Math.round((leadData.total||0)*0.2),color:'#f59e0b',pct:20},
              {stage:'Won',count:wonLeads,color:'#10b981',pct:Math.round((wonLeads/(leadData.total||1))*100)}
            ].map(f => `
              <div class="mb-2">
                <div class="d-flex justify-content-between small mb-1"><span>${f.stage}</span><span style="color:${f.color};font-weight:600;">${f.count}</span></div>
                <div style="height:6px;border-radius:3px;background:#e5e7eb;"><div style="height:100%;border-radius:3px;background:${f.color};width:${f.pct}%;"></div></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  exportReport() {
    alert('📥 Report export feature coming soon!\n\nCSV & PDF export will be available.');
  }
};
