// js/clients.js — Complete Client Management with Agent Assignment, Logo Upload, clientId & SaaS Ready
const Clients = {
  currentTab: 'list',
  selectedClient: null,
  clientFilter: 'all',
  searchQuery: '',
  sortBy: 'recent',

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = '#f8fafc';

    if (this.currentTab === 'add') { await this.renderAddForm(); return; }
    if (this.currentTab === 'edit' && this.selectedClient) { await this.renderEditForm(this.selectedClient); return; }
    if (this.currentTab === 'detail' && this.selectedClient) { await this.renderClientDetail(this.selectedClient); return; }

    await this.renderList();
  },

  // ==================== CLIENT LIST ====================
  async renderList() {
    let clients = [];
    let stats = { total: 0, approved: 0, pending: 0, suspended: 0, totalRevenue: 0 };

    try {
      let query = db.collection('clients');
      if (shouldFilterByClient()) query = query.where('clientId', '==', window.currentUser.clientId);
      const snap = await query.orderBy('createdAt', 'desc').get();
      clients = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Apply filters
      if (this.clientFilter === 'approved') clients = clients.filter(c => c.status === 'approved');
      if (this.clientFilter === 'pending') clients = clients.filter(c => c.status === 'pending');
      if (this.clientFilter === 'suspended') clients = clients.filter(c => c.status === 'suspended');
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        clients = clients.filter(c => 
          (c.companyName||'').toLowerCase().includes(q) ||
          (c.contactName||'').toLowerCase().includes(q) ||
          (c.email||'').toLowerCase().includes(q) ||
          (c.phone||'').toLowerCase().includes(q)
        );
      }

      // Sort
      if (this.sortBy === 'name') clients.sort((a,b) => (a.companyName||'').localeCompare(b.companyName||''));
      else if (this.sortBy === 'revenue') clients.sort((a,b) => (parseInt(b.revenue)||0) - (parseInt(a.revenue)||0));

      stats.total = clients.length;
      stats.approved = clients.filter(c => c.status === 'approved').length;
      stats.pending = clients.filter(c => c.status === 'pending').length;
      stats.suspended = clients.filter(c => c.status === 'suspended').length;
      clients.forEach(c => { stats.totalRevenue += parseInt(c.revenue||0); });
    } catch(e) { console.error(e); }

    let html = `
      <style>
        .clients-wrap { max-width: 1400px; margin: 0 auto; }
        .clients-header { background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 20px; padding: 28px 32px; margin-bottom: 24px; color: #fff; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .clients-header h4 { margin: 0; font-weight: 800; font-size: 22px; }
        .clients-header p { margin: 4px 0 0; color: #94a3b8; font-size: 13px; }
        .client-stat { background: #fff; border-radius: 14px; padding: 20px; text-align: center; border: 1px solid #f1f5f9; transition: 0.2s; cursor: pointer; }
        .client-stat:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.06); transform: translateY(-2px); }
        .client-stat .val { font-size: 32px; font-weight: 800; }
        .client-stat .lbl { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
        .client-card { background: #fff; border-radius: 16px; padding: 22px; border: 1px solid #f1f5f9; transition: 0.2s; cursor: pointer; }
        .client-card:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.06); border-color: #6366f1; transform: translateY(-2px); }
        .client-logo { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 22px; overflow: hidden; flex-shrink: 0; }
        .client-logo img { width: 100%; height: 100%; object-fit: cover; }
        .client-badge { padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; display: inline-block; }
        .client-filters { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
        .client-search { padding: 8px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13px; width: 220px; outline: none; }
        .client-search:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .client-filter-btn { padding: 6px 14px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; border: 1px solid #e2e8f0; background: #fff; color: #64748b; transition: 0.2s; }
        .client-filter-btn:hover, .client-filter-btn.active { background: #6366f1; color: #fff; border-color: #6366f1; }
        .client-sort { padding: 6px 10px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 11px; outline: none; cursor: pointer; background: #fff; }
        .invite-card { background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.04); margin-bottom: 16px; }
        .invite-input, .invite-select, .invite-textarea { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13px; margin-bottom: 12px; outline: none; background: #fff; }
        .invite-input:focus, .invite-select:focus, .invite-textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .invite-textarea { resize: vertical; min-height: 60px; }
        .agent-btn { padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; display: inline-flex; align-items: center; gap: 4px; }
        .agent-btn-primary { background: #6366f1; color: #fff; }
        .agent-btn-primary:hover { background: #4f46e5; }
        .agent-btn-outline { background: #fff; color: #6366f1; border: 1px solid #6366f1; }
        .agent-btn-outline:hover { background: #eef2ff; }
        .agent-btn-danger { background: #ef4444; color: #fff; }
        .agent-btn-danger:hover { background: #dc2626; }
        .agent-btn-success { background: #10b981; color: #fff; }
        .agent-btn-success:hover { background: #059669; }
        .logo-upload-area { width: 80px; height: 80px; border: 2px dashed #d1d5db; border-radius: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; background: #f9fafb; overflow: hidden; transition: 0.2s; flex-shrink: 0; }
        .logo-upload-area:hover { border-color: #6366f1; background: #eef2ff; }
        .logo-upload-area img { width: 100%; height: 100%; object-fit: cover; }
        @media (max-width: 768px) { .clients-header { padding: 20px; } }
      </style>

      <div class="clients-wrap">
        <div class="clients-header">
          <div>
            <h4><i class="fas fa-building me-2"></i>Client Management</h4>
            <p>Manage your business clients, accounts, and relationships</p>
          </div>
          <div class="d-flex gap-3">
            <div class="text-center"><div style="font-size:22px;font-weight:800;">${stats.total}</div><small style="color:#94a3b8;">Total</small></div>
            <div class="text-center"><div style="font-size:22px;font-weight:800;color:#10b981;">${stats.approved}</div><small style="color:#94a3b8;">Approved</small></div>
            <div class="text-center"><div style="font-size:22px;font-weight:800;color:#f59e0b;">${stats.pending}</div><small style="color:#94a3b8;">Pending</small></div>
          </div>
        </div>

        <!-- Stats -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-md-3"><div class="client-stat" onclick="Clients.clientFilter='all';Clients.render();"><div class="val" style="color:#6366f1;">${stats.total}</div><div class="lbl">Total Clients</div></div></div>
          <div class="col-6 col-md-3"><div class="client-stat" onclick="Clients.clientFilter='approved';Clients.render();"><div class="val" style="color:#10b981;">${stats.approved}</div><div class="lbl">Approved</div></div></div>
          <div class="col-6 col-md-3"><div class="client-stat" onclick="Clients.clientFilter='pending';Clients.render();"><div class="val" style="color:#f59e0b;">${stats.pending}</div><div class="lbl">Pending</div></div></div>
          <div class="col-6 col-md-3"><div class="client-stat"><div class="val" style="color:#8b5cf6;">₹${stats.totalRevenue >= 100000 ? (stats.totalRevenue/100000).toFixed(1)+'L' : stats.totalRevenue.toLocaleString()}</div><div class="lbl">Revenue</div></div></div>
        </div>

        <!-- Filters -->
        <div class="client-filters">
          <input type="text" class="client-search" placeholder="🔍 Search clients..." id="clientSearch" value="${this.searchQuery}" oninput="Clients.searchQuery=this.value;Clients.render();">
          <button class="client-filter-btn ${this.clientFilter==='all'?'active':''}" onclick="Clients.clientFilter='all';Clients.render();">All</button>
          <button class="client-filter-btn ${this.clientFilter==='approved'?'active':''}" onclick="Clients.clientFilter='approved';Clients.render();">Approved</button>
          <button class="client-filter-btn ${this.clientFilter==='pending'?'active':''}" onclick="Clients.clientFilter='pending';Clients.render();">Pending</button>
          <button class="client-filter-btn ${this.clientFilter==='suspended'?'active':''}" onclick="Clients.clientFilter='suspended';Clients.render();">Suspended</button>
          <select class="client-sort" onchange="Clients.sortBy=this.value;Clients.render();">
            <option value="recent">Sort: Recent</option>
            <option value="name" ${this.sortBy==='name'?'selected':''}>Sort: Name</option>
            <option value="revenue" ${this.sortBy==='revenue'?'selected':''}>Sort: Revenue</option>
          </select>
          <button class="agent-btn agent-btn-primary" style="margin-left:auto;" onclick="Clients.currentTab='add';Clients.render();"><i class="fas fa-plus"></i> Add Client</button>
        </div>

        <!-- Client Cards -->
        <div class="row g-3">
          ${clients.length === 0 ? `
            <div class="col-12 text-center py-5">
              <i class="fas fa-building fa-3x text-muted mb-3" style="opacity:0.3;"></i>
              <h5 style="font-weight:700;">No Clients Yet</h5>
              <p class="text-muted">${this.searchQuery || this.clientFilter !== 'all' ? 'No clients match your filters.' : 'Add your first client to get started.'}</p>
              ${!this.searchQuery && this.clientFilter === 'all' ? '<button class="agent-btn agent-btn-primary" onclick="Clients.currentTab=\'add\';Clients.render();"><i class="fas fa-plus me-1"></i> Add Client</button>' : ''}
            </div>
          ` : clients.map(client => `
            <div class="col-md-6 col-lg-4">
              <div class="client-card" onclick="Clients.selectedClient='${client.id}';Clients.currentTab='detail';Clients.render();">
                <div class="d-flex gap-3">
                  <div class="client-logo" style="background:${client.logoUrl?'transparent':'linear-gradient(135deg,#6366f1,#8b5cf6)'};">
                    ${client.logoUrl ? `<img src="${client.logoUrl}" alt="logo">` : (client.companyName||'C')[0].toUpperCase()}
                  </div>
                  <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 style="font-weight:700;margin:0;color:#0f172a;">${client.companyName||'Untitled'}</h6>
                        <span class="client-badge" style="background:${client.status==='approved'?'#ecfdf5':client.status==='pending'?'#fef3c7':client.status==='suspended'?'#fef2f2':'#f1f5f9'};color:${client.status==='approved'?'#10b981':client.status==='pending'?'#92400e':client.status==='suspended'?'#ef4444':'#64748b'};">${client.status||'pending'}</span>
                      </div>
                      <div class="d-flex gap-1">
                        <button class="agent-btn agent-btn-outline" style="padding:4px 8px;font-size:10px;" onclick="event.stopPropagation();Clients.selectedClient='${client.id}';Clients.currentTab='edit';Clients.render();"><i class="fas fa-edit"></i></button>
                        <button class="agent-btn agent-btn-danger" style="padding:4px 8px;font-size:10px;" onclick="event.stopPropagation();Clients.deleteClient('${client.id}')"><i class="fas fa-trash"></i></button>
                      </div>
                    </div>
                    <div style="font-size:12px;color:#64748b;margin-top:4px;">👤 ${client.contactName||'N/A'}</div>
                    <div style="font-size:12px;color:#64748b;">📧 ${client.email||'N/A'} ${client.phone ? '· 📱 '+client.phone : ''}</div>
                    <div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap;">
                      <span class="client-badge" style="background:#eef2ff;color:#6366f1;">${client.planId||'Free'}</span>
                      ${client.revenue ? `<span class="client-badge" style="background:#ecfdf5;color:#10b981;">💰 ₹${parseInt(client.revenue).toLocaleString()}</span>` : ''}
                      ${client.industry ? `<span class="client-badge" style="background:#f1f5f9;color:#64748b;">${client.industry}</span>` : ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        <div id="clientModal"></div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  // ==================== ADD CLIENT FORM ====================
  async renderAddForm() {
    let html = `
      <div class="clients-wrap">
        <div class="d-flex align-items-center mb-4">
          <button class="agent-btn agent-btn-outline me-3" onclick="Clients.currentTab='list';Clients.render();"><i class="fas fa-arrow-left me-1"></i> Back</button>
          <div>
            <h4 style="font-weight:800;margin:0;">➕ Add New Client</h4>
            <small class="text-muted">Fill in the details to onboard a new client</small>
          </div>
        </div>

        <div class="row g-4">
          <div class="col-lg-8">
            <!-- Company Details -->
            <div class="invite-card">
              <h5 style="font-weight:700;"><i class="fas fa-building me-2"></i>Company Details</h5>
              <div class="d-flex gap-3 align-items-start mb-3">
                <div class="logo-upload-area" onclick="document.getElementById('logoFileInput').click()">
                  <span id="logoPlaceholder" style="color:#9ca3af;font-size:11px;text-align:center;">🏢<br>Upload Logo</span>
                  <img id="logoPreview" style="display:none;">
                </div>
                <input type="file" id="logoFileInput" accept="image/*" style="display:none;" onchange="Clients.uploadLogo()">
                <div class="flex-grow-1">
                  <div class="row g-2">
                    <div class="col-md-6"><label class="form-label small fw-bold">Company Name *</label><input type="text" id="cCompany" class="invite-input" placeholder="e.g. ABC Pvt Ltd"></div>
                    <div class="col-md-6"><label class="form-label small fw-bold">Industry</label><select id="cIndustry" class="invite-select"><option value="">Select</option><option>Technology</option><option>Healthcare</option><option>Education</option><option>Finance</option><option>Retail</option><option>Manufacturing</option><option>Real Estate</option><option>Marketing</option><option>Other</option></select></div>
                    <div class="col-md-6"><label class="form-label small fw-bold">Website</label><input type="url" id="cWebsite" class="invite-input" placeholder="https://"></div>
                    <div class="col-md-6"><label class="form-label small fw-bold">GST Number</label><input type="text" id="cGST" class="invite-input" placeholder="GSTIN"></div>
                    <div class="col-md-6"><label class="form-label small fw-bold">Status</label><select id="cStatus" class="invite-select"><option value="pending">Pending</option><option value="approved">Approved</option><option value="suspended">Suspended</option></select></div>
                  </div>
                </div>
              </div>
              <div><label class="form-label small fw-bold">Tags (comma separated)</label><input type="text" id="cTags" class="invite-input" placeholder="e.g. VIP, Enterprise, Startup"></div>
              <div><label class="form-label small fw-bold">Notes</label><textarea id="cNotes" class="invite-textarea" placeholder="Internal notes..."></textarea></div>
            </div>

            <!-- Contact Person -->
            <div class="invite-card">
              <h5 style="font-weight:700;"><i class="fas fa-user me-2"></i>Contact Person</h5>
              <div class="row g-2">
                <div class="col-md-6"><label class="form-label small fw-bold">Contact Name *</label><input type="text" id="cContactName" class="invite-input" placeholder="Full name"></div>
                <div class="col-md-6"><label class="form-label small fw-bold">Designation</label><input type="text" id="cDesignation" class="invite-input" placeholder="e.g. CEO, Manager"></div>
                <div class="col-md-6"><label class="form-label small fw-bold">Email *</label><input type="email" id="cEmail" class="invite-input" placeholder="client@example.com"></div>
                <div class="col-md-6"><label class="form-label small fw-bold">Phone</label><input type="text" id="cPhone" class="invite-input" placeholder="+91 9810012345"></div>
                <div class="col-12"><label class="form-label small fw-bold">Address</label><textarea id="cAddress" class="invite-textarea" placeholder="Office address..."></textarea></div>
              </div>
            </div>

            <!-- Billing -->
            <div class="invite-card">
              <h5 style="font-weight:700;"><i class="fas fa-money-bill me-2"></i>Billing & Plan</h5>
              <div class="row g-2">
                <div class="col-md-4"><label class="form-label small fw-bold">Plan</label><select id="cPlan" class="invite-select"><option value="free">Free Trial</option><option value="advance">Advance</option><option value="professional">Professional</option><option value="enterprise">Enterprise</option></select></div>
                <div class="col-md-4"><label class="form-label small fw-bold">Revenue (₹)</label><input type="number" id="cRevenue" class="invite-input" placeholder="0"></div>
                <div class="col-md-4"><label class="form-label small fw-bold">Billing Cycle</label><select id="cBilling" class="invite-select"><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select></div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <!-- Assign Agents -->
            <div class="invite-card">
              <h5 style="font-weight:700;"><i class="fas fa-user-tie me-2"></i>Assign Agents</h5>
              <p class="text-muted small mb-2">Select team members to manage this client</p>
              <div id="agentCheckboxList" style="max-height:250px;overflow-y:auto;"><p class="text-muted small">Loading agents...</p></div>
            </div>

            <!-- Modules -->
            <div class="invite-card mt-3">
              <h5 style="font-weight:700;"><i class="fas fa-cubes me-2"></i>Enabled Modules</h5>
              <div id="moduleCheckboxList" style="max-height:250px;overflow-y:auto;"></div>
            </div>

            <!-- Linked Resources -->
            <div class="invite-card mt-3">
              <h5 style="font-weight:700;"><i class="fas fa-link me-2"></i>Linked Resources</h5>
              <div><label class="form-label small fw-bold">WhatsApp Group</label><input type="text" id="cWaGroup" class="invite-input" placeholder="Group link"></div>
              <div><label class="form-label small fw-bold">Google Drive</label><input type="text" id="cDrive" class="invite-input" placeholder="Drive folder link"></div>
              <div><label class="form-label small fw-bold">Contract/Agreement</label><input type="text" id="cContract" class="invite-input" placeholder="Document link"></div>
            </div>

            <button class="agent-btn agent-btn-primary mt-3" style="width:100%;padding:12px;" onclick="Clients.saveClient()">
              <i class="fas fa-save me-2"></i> Save Client
            </button>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
    this.loadAgentCheckboxes();
    this.loadModuleCheckboxes();
  },

  // ==================== EDIT CLIENT FORM ====================
  async renderEditForm(clientId) {
    const doc = await db.collection('clients').doc(clientId).get();
    if (!doc.exists) { this.currentTab = 'list'; this.render(); return; }
    const c = doc.data();

    let html = `
      <div class="clients-wrap">
        <div class="d-flex align-items-center mb-4">
          <button class="agent-btn agent-btn-outline me-3" onclick="Clients.currentTab='list';Clients.selectedClient=null;Clients.render();"><i class="fas fa-arrow-left me-1"></i> Back</button>
          <div>
            <h4 style="font-weight:800;margin:0;">✏️ Edit Client: ${c.companyName||'Unnamed'}</h4>
            <small class="text-muted">Update client details and settings</small>
          </div>
        </div>

        <div class="row g-4">
          <div class="col-lg-8">
            <div class="invite-card">
              <h5 style="font-weight:700;"><i class="fas fa-building me-2"></i>Company Details</h5>
              <div class="d-flex gap-3 align-items-start mb-3">
                <div class="logo-upload-area" onclick="document.getElementById('logoFileInput').click()">
                  ${c.logoUrl ? `<img src="${c.logoUrl}" id="logoPreview">` : '<span id="logoPlaceholder" style="color:#9ca3af;font-size:11px;text-align:center;">🏢<br>Upload Logo</span><img id="logoPreview" style="display:none;">'}
                </div>
                <input type="file" id="logoFileInput" accept="image/*" style="display:none;" onchange="Clients.uploadLogo()">
                <div class="flex-grow-1">
                  <div class="row g-2">
                    <div class="col-md-6"><label class="form-label small fw-bold">Company Name *</label><input type="text" id="cCompany" class="invite-input" value="${c.companyName||''}"></div>
                    <div class="col-md-6"><label class="form-label small fw-bold">Industry</label><select id="cIndustry" class="invite-select"><option value="">Select</option>${['Technology','Healthcare','Education','Finance','Retail','Manufacturing','Real Estate','Marketing','Other'].map(i=>`<option ${c.industry===i?'selected':''}>${i}</option>`).join('')}</select></div>
                    <div class="col-md-6"><label class="form-label small fw-bold">Website</label><input type="url" id="cWebsite" class="invite-input" value="${c.website||''}"></div>
                    <div class="col-md-6"><label class="form-label small fw-bold">GST Number</label><input type="text" id="cGST" class="invite-input" value="${c.gst||''}"></div>
                    <div class="col-md-6"><label class="form-label small fw-bold">Status</label><select id="cStatus" class="invite-select"><option value="pending" ${c.status==='pending'?'selected':''}>Pending</option><option value="approved" ${c.status==='approved'?'selected':''}>Approved</option><option value="suspended" ${c.status==='suspended'?'selected':''}>Suspended</option></select></div>
                  </div>
                </div>
              </div>
              <div><label class="form-label small fw-bold">Tags</label><input type="text" id="cTags" class="invite-input" value="${(c.tags||[]).join(', ')}"></div>
              <div><label class="form-label small fw-bold">Notes</label><textarea id="cNotes" class="invite-textarea">${c.notes||''}</textarea></div>
            </div>

            <div class="invite-card">
              <h5 style="font-weight:700;"><i class="fas fa-user me-2"></i>Contact Person</h5>
              <div class="row g-2">
                <div class="col-md-6"><label class="form-label small fw-bold">Contact Name *</label><input type="text" id="cContactName" class="invite-input" value="${c.contactName||''}"></div>
                <div class="col-md-6"><label class="form-label small fw-bold">Designation</label><input type="text" id="cDesignation" class="invite-input" value="${c.designation||''}"></div>
                <div class="col-md-6"><label class="form-label small fw-bold">Email *</label><input type="email" id="cEmail" class="invite-input" value="${c.email||''}"></div>
                <div class="col-md-6"><label class="form-label small fw-bold">Phone</label><input type="text" id="cPhone" class="invite-input" value="${c.phone||''}"></div>
                <div class="col-12"><label class="form-label small fw-bold">Address</label><textarea id="cAddress" class="invite-textarea">${c.address||''}</textarea></div>
              </div>
            </div>

            <div class="invite-card">
              <h5 style="font-weight:700;"><i class="fas fa-money-bill me-2"></i>Billing & Plan</h5>
              <div class="row g-2">
                <div class="col-md-4"><label class="form-label small fw-bold">Plan</label><select id="cPlan" class="invite-select"><option value="free" ${c.planId==='free'?'selected':''}>Free Trial</option><option value="advance" ${c.planId==='advance'?'selected':''}>Advance</option><option value="professional" ${c.planId==='professional'?'selected':''}>Professional</option><option value="enterprise" ${c.planId==='enterprise'?'selected':''}>Enterprise</option></select></div>
                <div class="col-md-4"><label class="form-label small fw-bold">Revenue (₹)</label><input type="number" id="cRevenue" class="invite-input" value="${c.revenue||''}"></div>
                <div class="col-md-4"><label class="form-label small fw-bold">Billing Cycle</label><select id="cBilling" class="invite-select"><option value="monthly" ${c.billingCycle==='monthly'?'selected':''}>Monthly</option><option value="quarterly" ${c.billingCycle==='quarterly'?'selected':''}>Quarterly</option><option value="yearly" ${c.billingCycle==='yearly'?'selected':''}>Yearly</option></select></div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="invite-card">
              <h5 style="font-weight:700;"><i class="fas fa-user-tie me-2"></i>Assign Agents</h5>
              <div id="agentCheckboxList" style="max-height:250px;overflow-y:auto;"><p class="text-muted small">Loading agents...</p></div>
            </div>
            <div class="invite-card mt-3">
              <h5 style="font-weight:700;"><i class="fas fa-cubes me-2"></i>Enabled Modules</h5>
              <div id="moduleCheckboxList" style="max-height:250px;overflow-y:auto;"></div>
            </div>
            <div class="invite-card mt-3">
              <h5 style="font-weight:700;"><i class="fas fa-link me-2"></i>Linked Resources</h5>
              <div><label class="form-label small fw-bold">WhatsApp Group</label><input type="text" id="cWaGroup" class="invite-input" value="${c.waGroup||''}"></div>
              <div><label class="form-label small fw-bold">Google Drive</label><input type="text" id="cDrive" class="invite-input" value="${c.driveLink||''}"></div>
              <div><label class="form-label small fw-bold">Contract/Agreement</label><input type="text" id="cContract" class="invite-input" value="${c.contractLink||''}"></div>
            </div>
            <button class="agent-btn agent-btn-primary mt-3" style="width:100%;padding:12px;" onclick="Clients.updateClient('${clientId}')">
              <i class="fas fa-save me-2"></i> Update Client
            </button>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
    this.loadAgentCheckboxes(c.assignedAgents || []);
    this.loadModuleCheckboxes(c.modules || []);
  },

  // ==================== HELPERS ====================
  async loadAgentCheckboxes(selectedAgents = []) {
    try {
      let query = db.collection('users');
      if (shouldFilterByClient()) query = query.where('clientId', '==', window.currentUser.clientId);
      const snap = await query.where('role', 'in', ['admin', 'team', 'client_admin', 'manager', 'executive']).get();
      const agents = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const container = document.getElementById('agentCheckboxList');
      if (!container) return;
      
      if (agents.length === 0) {
        container.innerHTML = '<p class="text-muted small">No agents available.</p>';
        return;
      }

      const selectedIds = selectedAgents.map(a => a.id || a);
      container.innerHTML = agents.map(a => `
        <div class="form-check mb-2 d-flex align-items-center gap-2">
          <input class="form-check-input" type="checkbox" value="${a.id}" data-name="${a.name||a.email}" id="agent-${a.id}" ${selectedIds.includes(a.id)?'checked':''}>
          <label class="form-check-label small d-flex align-items-center gap-2" for="agent-${a.id}">
            <span style="width:28px;height:28px;border-radius:50%;background:${a.role==='admin'?'#6366f1':'#10b981'};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;">${(a.name||a.email||'?')[0].toUpperCase()}</span>
            <div><strong>${a.name||'Unnamed'}</strong><br><small class="text-muted">${a.email||''}</small></div>
          </label>
        </div>
      `).join('');
    } catch(e) { 
      const container = document.getElementById('agentCheckboxList');
      if (container) container.innerHTML = '<p class="text-muted small">Error loading agents</p>';
    }
  },

  loadModuleCheckboxes(selectedModules = []) {
    const allModules = ['dashboard','leads','contacts','chats','campaigns','templates','flows','social','forms','kanban','knowledge','chatbot','ecommerce','appointments','analytics','tickets','integrations','agents','clients','marketing','setup','reports'];
    const container = document.getElementById('moduleCheckboxList');
    if (!container) return;
    container.innerHTML = allModules.map(mod => `
      <div class="form-check mb-1">
        <input class="form-check-input" type="checkbox" value="${mod}" id="mod-${mod}" ${selectedModules.includes(mod)?'checked':''}>
        <label class="form-check-label small" for="mod-${mod}">${mod}</label>
      </div>
    `).join('');
  },

  async uploadLogo() {
    const file = document.getElementById('logoFileInput').files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const placeholder = document.getElementById('logoPlaceholder');
      if (placeholder) placeholder.style.display = 'none';
      const preview = document.getElementById('logoPreview');
      if (preview) { preview.src = e.target.result; preview.style.display = 'block'; }
    };
    reader.readAsDataURL(file);
    const clientId = getCurrentClientId();
    const filePath = `client_logos/${clientId || 'platform'}/${Date.now()}_${file.name}`;
    const ref = firebase.storage().ref(filePath);
    const task = ref.put(file);
    task.on('state_changed', null, null, async () => {
      const url = await task.snapshot.ref.getDownloadURL();
      const preview = document.getElementById('logoPreview');
      if (preview) preview.dataset.url = url;
    });
  },

  // ==================== SAVE & UPDATE ====================
  async saveClient() {
    const company = document.getElementById('cCompany')?.value?.trim();
    const contactName = document.getElementById('cContactName')?.value?.trim();
    const email = document.getElementById('cEmail')?.value?.trim();
    if (!company || !contactName || !email) return alert('Company name, contact name, and email are required!');

    const assignedAgents = Array.from(document.querySelectorAll('#agentCheckboxList input:checked')).map(cb => ({ id: cb.value, name: cb.dataset.name || 'Unknown' }));
    const modules = Array.from(document.querySelectorAll('#moduleCheckboxList input:checked')).map(cb => cb.value);
    const logoUrl = document.getElementById('logoPreview')?.dataset?.url || '';

    const data = {
      companyName: company, logoUrl, contactName, email,
      industry: document.getElementById('cIndustry')?.value || '',
      website: document.getElementById('cWebsite')?.value?.trim() || '',
      gst: document.getElementById('cGST')?.value?.trim() || '',
      status: document.getElementById('cStatus')?.value || 'pending',
      tags: (document.getElementById('cTags')?.value || '').split(',').map(t => t.trim()).filter(Boolean),
      notes: document.getElementById('cNotes')?.value?.trim() || '',
      designation: document.getElementById('cDesignation')?.value?.trim() || '',
      phone: document.getElementById('cPhone')?.value?.trim() || '',
      address: document.getElementById('cAddress')?.value?.trim() || '',
      planId: document.getElementById('cPlan')?.value || 'free',
      revenue: document.getElementById('cRevenue')?.value?.trim() || '',
      billingCycle: document.getElementById('cBilling')?.value || 'monthly',
      waGroup: document.getElementById('cWaGroup')?.value?.trim() || '',
      driveLink: document.getElementById('cDrive')?.value?.trim() || '',
      contractLink: document.getElementById('cContract')?.value?.trim() || '',
      modules: modules,
      assignedAgents: assignedAgents,
      clientId: getCurrentClientId(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      await db.collection('clients').add(data);
      alert('✅ Client added successfully!');
      this.currentTab = 'list';
      this.render();
    } catch(e) { alert('Error: ' + e.message); }
  },

  async updateClient(clientId) {
    const company = document.getElementById('cCompany')?.value?.trim();
    const contactName = document.getElementById('cContactName')?.value?.trim();
    const email = document.getElementById('cEmail')?.value?.trim();
    if (!company || !contactName || !email) return alert('Company name, contact name, and email are required!');

    const assignedAgents = Array.from(document.querySelectorAll('#agentCheckboxList input:checked')).map(cb => ({ id: cb.value, name: cb.dataset.name || 'Unknown' }));
    const modules = Array.from(document.querySelectorAll('#moduleCheckboxList input:checked')).map(cb => cb.value);
    const logoUrl = document.getElementById('logoPreview')?.dataset?.url || document.getElementById('logoPreview')?.src || '';

    const data = {
      companyName: company, logoUrl, contactName, email,
      industry: document.getElementById('cIndustry')?.value || '',
      website: document.getElementById('cWebsite')?.value?.trim() || '',
      gst: document.getElementById('cGST')?.value?.trim() || '',
      status: document.getElementById('cStatus')?.value || 'pending',
      tags: (document.getElementById('cTags')?.value || '').split(',').map(t => t.trim()).filter(Boolean),
      notes: document.getElementById('cNotes')?.value?.trim() || '',
      designation: document.getElementById('cDesignation')?.value?.trim() || '',
      phone: document.getElementById('cPhone')?.value?.trim() || '',
      address: document.getElementById('cAddress')?.value?.trim() || '',
      planId: document.getElementById('cPlan')?.value || 'free',
      revenue: document.getElementById('cRevenue')?.value?.trim() || '',
      billingCycle: document.getElementById('cBilling')?.value || 'monthly',
      waGroup: document.getElementById('cWaGroup')?.value?.trim() || '',
      driveLink: document.getElementById('cDrive')?.value?.trim() || '',
      contractLink: document.getElementById('cContract')?.value?.trim() || '',
      modules: modules,
      assignedAgents: assignedAgents,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      await db.collection('clients').doc(clientId).update(data);

      // Sync modules to users
      const permissions = {};
      modules.forEach(mod => { permissions[mod] = { read: true, write: true }; });
      const usersSnap = await db.collection('users').where('clientId', '==', clientId).get();
      const batch = db.batch();
      usersSnap.forEach(userDoc => { batch.update(userDoc.ref, { permissions: permissions }); });
      await batch.commit();

      alert('✅ Client updated successfully!');
      this.currentTab = 'list';
      this.selectedClient = null;
      this.render();
    } catch(e) { alert('Error: ' + e.message); }
  },

  // ==================== CLIENT DETAIL ====================
  async renderClientDetail(id) {
    const doc = await db.collection('clients').doc(id).get();
    if (!doc.exists) { this.currentTab = 'list'; this.render(); return; }
    const c = doc.data();

    let leadCount = 0, contactCount = 0;
    try {
      leadCount = (await db.collection('leads').where('clientId','==',id).get()).size;
      contactCount = (await db.collection('contacts').where('clientId','==',id).get()).size;
    } catch(e) {}

    let html = `
      <div class="clients-wrap">
        <div class="d-flex align-items-center mb-4">
          <button class="agent-btn agent-btn-outline me-3" onclick="Clients.currentTab='list';Clients.selectedClient=null;Clients.render();"><i class="fas fa-arrow-left me-1"></i> Back</button>
          <div class="client-logo me-3" style="width:48px;height:48px;background:${c.logoUrl?'transparent':'linear-gradient(135deg,#6366f1,#8b5cf6)'};">${c.logoUrl?`<img src="${c.logoUrl}" style="width:100%;height:100%;object-fit:cover;">`:(c.companyName||'?')[0].toUpperCase()}</div>
          <div class="flex-grow-1">
            <h4 style="font-weight:800;margin:0;">${c.companyName||'Client'}</h4>
            <span class="client-badge" style="background:${c.status==='approved'?'#ecfdf5':c.status==='pending'?'#fef3c7':'#f1f5f9'};color:${c.status==='approved'?'#10b981':c.status==='pending'?'#92400e':'#64748b'};">${c.status||'pending'}</span>
            <span class="client-badge" style="background:#eef2ff;color:#6366f1;margin-left:6px;">${c.planId||'Free'}</span>
          </div>
          <div class="d-flex gap-2">
            <button class="agent-btn agent-btn-outline" onclick="Clients.selectedClient='${id}';Clients.currentTab='edit';Clients.render();"><i class="fas fa-edit"></i> Edit</button>
            <button class="agent-btn agent-btn-danger" onclick="Clients.deleteClient('${id}')"><i class="fas fa-trash"></i> Delete</button>
          </div>
        </div>

        <div class="row g-4">
          <div class="col-lg-8">
            <div class="invite-card">
              <h5 style="font-weight:700;">Company Info</h5>
              <div class="row g-3">
                <div class="col-md-6"><small class="text-muted">Industry</small><p style="font-weight:500;">${c.industry||'N/A'}</p></div>
                <div class="col-md-6"><small class="text-muted">Website</small><p>${c.website?`<a href="${c.website}" target="_blank">${c.website}</a>`:'N/A'}</p></div>
                <div class="col-md-6"><small class="text-muted">GST</small><p>${c.gst||'N/A'}</p></div>
                <div class="col-md-6"><small class="text-muted">Revenue</small><p class="fw-bold text-success">₹${parseInt(c.revenue||0).toLocaleString()}</p></div>
                <div class="col-md-6"><small class="text-muted">Billing</small><p>${c.billingCycle||'N/A'}</p></div>
                <div class="col-md-6"><small class="text-muted">Created</small><p>${c.createdAt?.toDate().toLocaleDateString()||'N/A'}</p></div>
              </div>
              ${c.tags?.length>0?`<div class="mt-2">${c.tags.map(t=>`<span class="client-badge" style="background:#eef2ff;color:#6366f1;">${t}</span>`).join(' ')}</div>`:''}
              ${c.notes?`<div class="mt-3"><small class="text-muted">Notes</small><p>${c.notes}</p></div>`:''}
            </div>
            <div class="invite-card">
              <h5 style="font-weight:700;">Contact Person</h5>
              <p><strong>${c.contactName||'N/A'}</strong> ${c.designation?`· ${c.designation}`:''}</p>
              <p>📧 ${c.email||'N/A'} · 📱 ${c.phone||'N/A'}</p>
              <p>📍 ${c.address||'N/A'}</p>
            </div>
            <div class="invite-card">
              <h5 style="font-weight:700;">Data Summary</h5>
              <div class="row g-3">
                <div class="col-4"><div class="client-stat"><div class="val" style="color:#6366f1;">${leadCount}</div><div class="lbl">Leads</div></div></div>
                <div class="col-4"><div class="client-stat"><div class="val" style="color:#10b981;">${contactCount}</div><div class="lbl">Contacts</div></div></div>
                <div class="col-4"><div class="client-stat"><div class="val" style="color:#8b5cf6;">${(c.modules||[]).length}</div><div class="lbl">Modules</div></div></div>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="invite-card">
              <h5 style="font-weight:700;"><i class="fas fa-user-tie me-2"></i>Assigned Agents</h5>
              ${c.assignedAgents?.length>0 ? c.assignedAgents.map(a => `
                <div class="d-flex align-items-center gap-2 mb-2">
                  <div style="width:28px;height:28px;border-radius:50%;background:#6366f1;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;">${(a.name||'?')[0].toUpperCase()}</div>
                  <span class="small">${a.name||a.id||'Unknown'}</span>
                </div>
              `).join('') : '<p class="text-muted small">No agents assigned</p>'}
            </div>
            <div class="invite-card mt-3">
              <h5 style="font-weight:700;"><i class="fas fa-cubes me-2"></i>Enabled Modules</h5>
              ${(c.modules||[]).length>0 ? c.modules.map(m=>`<span class="client-badge" style="background:#eef2ff;color:#6366f1;margin:2px;">${m}</span>`).join(' ') : '<p class="text-muted small">No modules assigned</p>'}
            </div>
            <div class="invite-card mt-3">
              <h5 style="font-weight:700;">Resources</h5>
              ${c.waGroup?`<p><a href="${c.waGroup}" target="_blank">💬 WhatsApp Group</a></p>`:''}
              ${c.driveLink?`<p><a href="${c.driveLink}" target="_blank">📁 Google Drive</a></p>`:''}
              ${c.contractLink?`<p><a href="${c.contractLink}" target="_blank">📄 Contract</a></p>`:''}
              ${!c.waGroup && !c.driveLink && !c.contractLink ? '<p class="text-muted small">No resources linked</p>' : ''}
            </div>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  async deleteClient(id) {
    if (!confirm('Delete this client? This will also remove all associated data.')) return;
    await db.collection('clients').doc(id).delete();
    this.currentTab = 'list';
    this.selectedClient = null;
    this.render();
  }
};
