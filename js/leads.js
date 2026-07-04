const Leads = {
  currentFilter: 'all',
  currentSource: 'all',
  dateFrom: null,
  dateTo: null,
  currentAssignee: null,

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading leads...</p>';

    let leads = [];
    let users = [];
    try {
      // Load all leads
      let query = db.collection('leads').orderBy('createdAt', 'desc');
      // Apply date filters if set
      if (this.dateFrom) query = query.where('createdAt', '>=', new Date(this.dateFrom));
      if (this.dateTo) query = query.where('createdAt', '<=', new Date(this.dateTo + 'T23:59:59'));
      const snap = await query.get();
      leads = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Load users for assignee filter
      const userSnap = await db.collection('users').get();
      users = userSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) { console.error(err); }

    // Apply source & status & assignee filters after fetch (client-side)
    if (this.currentSource !== 'all') {
      leads = leads.filter(l => l.source === this.currentSource);
    }
    if (this.currentFilter !== 'all') {
      leads = leads.filter(l => l.status === this.currentFilter);
    }
    if (this.currentAssignee) {
      leads = leads.filter(l => l.assignedTo === this.currentAssignee);
    }

    const sources = [...new Set(leads.map(l => l.source).filter(Boolean))];
    const statuses = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

    let html = `
      <style>
        .lead-stats { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-bottom: 16px; }
        .lead-stat { background: #fff; border-radius: 8px; padding: 10px; text-align: center; border: 1px solid #e0e0e0; cursor: pointer; transition: 0.15s; }
        .lead-stat:hover { border-color: #1877f2; background: #e7f3ff; }
        .lead-stat.active { border-color: #1877f2; background: #e7f3ff; }
        .lead-stat .stat-count { font-size: 20px; font-weight: 700; }
        .lead-stat .stat-label { font-size: 10px; color: #65676b; text-transform: uppercase; }
        .lead-filters { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; align-items: center; }
        .lead-filter-chip { padding: 6px 12px; border-radius: 16px; font-size: 11px; cursor: pointer; border: 1px solid #dadde1; background: #fff; }
        .lead-filter-chip.active { background: #1877f2; color: #fff; border-color: #1877f2; }
        .lead-table { width: 100%; border-collapse: collapse; }
        .lead-table th { text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 600; color: #65676b; text-transform: uppercase; background: #fafbfc; border-bottom: 1px solid #e0e0e0; }
        .lead-table td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
        .lead-table tr:hover td { background: #f5f6f7; }
        .source-badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 500; }
        .source-badge.whatsapp { background: #dcf8c6; color: #075e54; }
        .source-badge.facebook { background: #e7f3ff; color: #1877f2; }
        .source-badge.website { background: #e8f5e9; color: #2e7d32; }
        .source-badge.form { background: #f3e5f5; color: #7b1fa2; }
        .source-badge.manual { background: #fff3e0; color: #e65100; }
        .source-badge.campaign { background: #e0f7fa; color: #006064; }
        @media (max-width: 768px) { .lead-stats { grid-template-columns: repeat(4, 1fr); } }
      </style>

      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="mb-0"><i class="fas fa-funnel-dollar text-primary me-2"></i>Lead Management</h4>
        <div>
          <button class="btn btn-outline-primary btn-sm me-1" onclick="Kanban.render()">
            <i class="fas fa-tasks me-1"></i> Pipeline View
          </button>
          <button class="btn btn-primary btn-sm" onclick="Leads.showAddForm()">
            <i class="fas fa-plus me-1"></i> Add Lead
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="lead-stats">
        <div class="lead-stat ${this.currentFilter==='all'?'active':''}" onclick="Leads.currentFilter='all';Leads.render();">
          <div class="stat-count">${leads.length}</div><div class="stat-label">All</div>
        </div>
        ${statuses.map(s => `
          <div class="lead-stat ${this.currentFilter===s?'active':''}" onclick="Leads.currentFilter='${s}';Leads.render();">
            <div class="stat-count">${leads.filter(l => l.status === s).length}</div>
            <div class="stat-label">${s}</div>
          </div>
        `).join('')}
      </div>

      <!-- Advanced Filters -->
      <div class="lead-filters">
        <div class="lead-filter-chip ${this.currentSource==='all'?'active':''}" onclick="Leads.currentSource='all';Leads.render();">All Sources</div>
        ${sources.map(s => `
          <div class="lead-filter-chip ${this.currentSource===s?'active':''}" onclick="Leads.currentSource='${s}';Leads.render();">${s}</div>
        `).join('')}
        <div class="d-flex gap-2 align-items-center ms-2">
          <label class="form-label small mb-0">Date:</label>
          <input type="date" class="form-control form-control-sm" style="width:130px;" id="dateFrom" value="${this.dateFrom||''}" onchange="Leads.dateFrom=this.value;Leads.render();">
          <span>-</span>
          <input type="date" class="form-control form-control-sm" style="width:130px;" id="dateTo" value="${this.dateTo||''}" onchange="Leads.dateTo=this.value;Leads.render();">
        </div>
        <div class="ms-2">
          <label class="form-label small mb-0">Assigned to:</label>
          <select id="assigneeFilter" class="form-select form-select-sm" style="width:auto;" onchange="Leads.currentAssignee=this.value||null;Leads.render();">
            <option value="">Anyone</option>
            ${users.map(u => `<option value="${u.id}" ${Leads.currentAssignee===u.id?'selected':''}>${u.name||u.email}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="card-widget">
        <div id="leadFormContainer"></div>
        <div class="table-responsive">
          <table class="lead-table">
            <thead>
              <tr>
                <th>Name</th><th>Contact</th><th>Source</th><th>Status</th><th>Assigned To</th><th>Created</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${leads.length === 0 ? '<tr><td colspan="7" class="text-center text-muted py-4">No leads found.</td></tr>' : leads.map(lead => `
                <tr>
                  <td><strong>${lead.name || '-'}</strong></td>
                  <td>${lead.phone || lead.email || '-'}</td>
                  <td><span class="source-badge ${(lead.source||'').toLowerCase()}">${lead.source || 'Manual'}</span></td>
                  <td>
                    <select class="form-select form-select-sm" style="width:auto;font-size:11px;" onchange="Leads.updateStatus('${lead.id}', this.value)">
                      ${statuses.map(s => `<option value="${s}" ${lead.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                  </td>
                  <td><small>${this.getAssignedName(lead.assignedTo, users)}</small></td>
                  <td><small>${lead.createdAt?.toDate().toLocaleDateString() || '-'}</small></td>
                  <td>
                    <button class="btn btn-sm btn-outline-info me-1" onclick="Leads.showEditForm('${lead.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="Leads.deleteLead('${lead.id}')"><i class="fas fa-trash"></i></button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  getAssignedName(uid, users) {
    if (!uid) return 'Unassigned';
    const user = users.find(u => u.id === uid);
    return user ? (user.name || user.email) : uid;
  },

  showAddForm() {
    // Use LeadCapture.fromManual inside addLead()
    document.getElementById('leadFormContainer').innerHTML = `
      <div class="card mb-3 border-primary">
        <div class="card-body p-2">
          <div class="row g-2">
            <div class="col-md-4"><input type="text" id="leadName" class="form-control form-control-sm" placeholder="Full Name *"></div>
            <div class="col-md-3"><input type="text" id="leadPhone" class="form-control form-control-sm" placeholder="Phone"></div>
            <div class="col-md-3"><input type="email" id="leadEmail" class="form-control form-control-sm" placeholder="Email"></div>
            <div class="col-md-2">
              <select id="leadSource" class="form-select form-select-sm">
                <option value="Manual">Manual</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Facebook">Facebook</option>
                <option value="Website">Website</option>
                <option value="Form">Form</option>
                <option value="Campaign">Campaign</option>
                <option value="Google">Google Ads</option>
              </select>
            </div>
          </div>
          <button class="btn btn-success btn-sm mt-2" onclick="Leads.addLead()">Save Lead</button>
          <button class="btn btn-light btn-sm mt-2" onclick="document.getElementById('leadFormContainer').innerHTML=''">Cancel</button>
        </div>
      </div>
    `;
  },

  async addLead() {
    const name = document.getElementById('leadName').value.trim();
    if (!name) return alert('Name required!');
    await LeadCapture.fromManual(
      name,
      document.getElementById('leadPhone').value.trim(),
      document.getElementById('leadEmail').value.trim(),
      document.getElementById('leadSource').value
    );
    alert('✅ Lead added!');
    this.render();
  },

  async updateStatus(id, status) {
    await db.collection('leads').doc(id).update({ status });
    this.render();
  },

  async deleteLead(id) {
    if (!confirm('Delete this lead?')) return;
    await db.collection('leads').doc(id).delete();
    this.render();
  }
};
