// js/clients.js — Complete Client Management with Agent Assignment & Logo Upload
const Clients = {
  currentTab: 'list',
  selectedClient: null,
  clientFilter: 'all',
  searchQuery: '',

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading clients...</p>';

    if (this.currentTab === 'add') { await this.renderAddForm(); return; }
    if (this.currentTab === 'detail' && this.selectedClient) { await this.renderClientDetail(this.selectedClient); return; }

    await this.renderList();
  },

  async renderList() {
    let clients = [];
    let stats = { total: 0, active: 0, pending: 0, totalRevenue: 0 };

    try {
      const snap = await db.collection('clients').orderBy('createdAt', 'desc').get();
      clients = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (this.clientFilter === 'active') clients = clients.filter(c => c.status === 'active');
      if (this.clientFilter === 'inactive') clients = clients.filter(c => c.status === 'inactive');
      if (this.clientFilter === 'pending') clients = clients.filter(c => c.status === 'pending');
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        clients = clients.filter(c => 
          (c.companyName||'').toLowerCase().includes(q) ||
          (c.contactName||'').toLowerCase().includes(q) ||
          (c.email||'').toLowerCase().includes(q)
        );
      }

      stats.total = clients.length;
      stats.active = clients.filter(c => c.status === 'active').length;
      stats.pending = clients.filter(c => c.status === 'pending').length;
      clients.forEach(c => { stats.totalRevenue += parseInt(c.revenue||0); });
    } catch(e) { console.error(e); }

    let html = `
      <style>
        .client-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 20px; transition: 0.2s; cursor: pointer; }
        .client-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); border-color: #1877f2; }
        .client-logo { width: 52px; height: 52px; border-radius: 14px; object-fit: cover; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 20px; overflow: hidden; }
        .client-logo img { width: 100%; height: 100%; object-fit: cover; }
        .status-badge { display: inline-block; padding: 3px 10px; border-radius: 14px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
        .status-badge.active { background: #d1fae5; color: #065f46; }
        .status-badge.inactive { background: #f3f4f6; color: #374151; }
        .status-badge.pending { background: #fef3c7; color: #92400e; }
      </style>

      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="mb-0"><i class="fas fa-building text-info me-2"></i>Client Management</h4>
          <small class="text-muted">Manage your business clients and their accounts</small>
        </div>
        <button class="btn btn-primary" onclick="Clients.currentTab='add';Clients.render();">
          <i class="fas fa-plus me-1"></i> Add Client
        </button>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3"><div class="card-widget text-center py-3"><h3 class="mb-0 text-primary">${stats.total}</h3><small class="text-muted">Total Clients</small></div></div>
        <div class="col-6 col-md-3"><div class="card-widget text-center py-3"><h3 class="mb-0 text-success">${stats.active}</h3><small class="text-muted">Active</small></div></div>
        <div class="col-6 col-md-3"><div class="card-widget text-center py-3"><h3 class="mb-0 text-warning">${stats.pending}</h3><small class="text-muted">Pending</small></div></div>
        <div class="col-6 col-md-3"><div class="card-widget text-center py-3"><h3 class="mb-0 text-info">₹${stats.totalRevenue.toLocaleString()}</h3><small class="text-muted">Revenue</small></div></div>
      </div>

      <div class="d-flex gap-2 mb-3 flex-wrap align-items-center">
        <input type="text" class="form-control form-control-sm" placeholder="🔍 Search clients..." style="width:220px;" id="clientSearch" oninput="Clients.searchQuery=this.value;Clients.render();" value="${this.searchQuery}">
        <div class="d-flex gap-1">
          <button class="btn btn-${this.clientFilter==='all'?'primary':'outline-primary'} btn-sm" onclick="Clients.clientFilter='all';Clients.render();">All</button>
          <button class="btn btn-${this.clientFilter==='active'?'primary':'outline-primary'} btn-sm" onclick="Clients.clientFilter='active';Clients.render();">Active</button>
          <button class="btn btn-${this.clientFilter==='inactive'?'primary':'outline-primary'} btn-sm" onclick="Clients.clientFilter='inactive';Clients.render();">Inactive</button>
          <button class="btn btn-${this.clientFilter==='pending'?'primary':'outline-primary'} btn-sm" onclick="Clients.clientFilter='pending';Clients.render();">Pending</button>
        </div>
      </div>

      <div class="row g-3">
        ${clients.length === 0 ? `
          <div class="col-12 text-center py-5">
            <i class="fas fa-building fa-3x text-muted mb-3"></i>
            <h5>No Clients Yet</h5>
            <p class="text-muted">Add your first client to get started</p>
            <button class="btn btn-primary" onclick="Clients.currentTab='add';Clients.render();"><i class="fas fa-plus me-1"></i> Add Client</button>
          </div>
        ` : clients.map(client => `
          <div class="col-md-6 col-lg-4">
            <div class="client-card" onclick="Clients.selectedClient='${client.id}';Clients.currentTab='detail';Clients.render();">
              <div class="d-flex gap-3">
                <div class="client-logo" style="background:${client.logoUrl?'transparent':'linear-gradient(135deg,#1877f2,#0ea5e9)'};">
                  ${client.logoUrl ? `<img src="${client.logoUrl}" alt="logo">` : (client.companyName||'C')[0].toUpperCase()}
                </div>
                <div class="flex-grow-1">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="mb-0">${client.companyName||'Untitled'}</h6>
                      <span class="status-badge ${client.status||'pending'}">${client.status||'pending'}</span>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation();Clients.deleteClient('${client.id}')"><i class="fas fa-trash"></i></button>
                  </div>
                  <small class="text-muted d-block mt-1">👤 ${client.contactName||'N/A'}</small>
                  <small class="text-muted d-block">📧 ${client.email||'N/A'}</small>
                  ${client.revenue ? `<div class="mt-2"><small class="fw-bold text-success">💰 ₹${parseInt(client.revenue).toLocaleString()}</small></div>` : ''}
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <div id="clientModal"></div>
    `;
    contentArea.innerHTML = html;
  },

  // ==================== ADD CLIENT FORM ====================
  async renderAddForm() {
    let html = `
      <style>
        .logo-upload-area { width: 80px; height: 80px; border: 2px dashed #d1d5db; border-radius: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; background: #f9fafb; overflow: hidden; transition: 0.2s; }
        .logo-upload-area:hover { border-color: #1877f2; background: #e7f3ff; }
        .logo-upload-area img { width: 100%; height: 100%; object-fit: cover; }
      </style>

      <div class="d-flex align-items-center mb-3">
        <button class="btn btn-outline-secondary btn-sm me-2" onclick="Clients.currentTab='list';Clients.render();"><i class="fas fa-arrow-left"></i></button>
        <h4 class="mb-0">Add New Client</h4>
      </div>

      <div class="row g-3">
        <div class="col-md-8">
          <!-- Company Details -->
          <div class="card-widget">
            <div class="d-flex gap-3 align-items-start mb-3">
              <div class="logo-upload-area" onclick="document.getElementById('logoFileInput').click()">
                <span id="logoPlaceholder" style="color:#9ca3af;font-size:11px;text-align:center;">🏢<br>Upload Logo</span>
                <img id="logoPreview" style="display:none;">
              </div>
              <input type="file" id="logoFileInput" accept="image/*" style="display:none;" onchange="Clients.uploadLogo()">
              <div class="flex-grow-1">
                <div class="row g-2">
                  <div class="col-md-6"><label class="form-label small fw-bold">Company Name *</label><input type="text" id="cCompany" class="form-control form-control-sm" placeholder="e.g. ABC Pvt Ltd"></div>
                  <div class="col-md-6"><label class="form-label small fw-bold">Industry</label><select id="cIndustry" class="form-select form-select-sm"><option value="">Select</option><option>Technology</option><option>Healthcare</option><option>Education</option><option>Finance</option><option>Retail</option><option>Manufacturing</option><option>Real Estate</option><option>Marketing</option><option>Other</option></select></div>
                  <div class="col-md-6"><label class="form-label small fw-bold">Website</label><input type="url" id="cWebsite" class="form-control form-control-sm" placeholder="https://"></div>
                  <div class="col-md-6"><label class="form-label small fw-bold">Status</label><select id="cStatus" class="form-select form-select-sm"><option value="active">Active</option><option value="pending">Pending</option><option value="inactive">Inactive</option></select></div>
                </div>
              </div>
            </div>
            <div class="mt-2"><label class="form-label small fw-bold">Tags (comma separated)</label><input type="text" id="cTags" class="form-control form-control-sm" placeholder="e.g. VIP, Enterprise, Startup"></div>
            <div class="mt-2"><label class="form-label small fw-bold">Notes</label><textarea id="cNotes" class="form-control form-control-sm" rows="2" placeholder="Internal notes..."></textarea></div>
          </div>

          <!-- Contact Person -->
          <div class="card-widget mt-3">
            <h5><i class="fas fa-user me-2"></i>Contact Person</h5>
            <div class="row g-2">
              <div class="col-md-6"><label class="form-label small fw-bold">Contact Name *</label><input type="text" id="cContactName" class="form-control form-control-sm" placeholder="Full name"></div>
              <div class="col-md-6"><label class="form-label small fw-bold">Designation</label><input type="text" id="cDesignation" class="form-control form-control-sm" placeholder="e.g. CEO, Manager"></div>
              <div class="col-md-6"><label class="form-label small fw-bold">Email *</label><input type="email" id="cEmail" class="form-control form-control-sm" placeholder="client@example.com"></div>
              <div class="col-md-6"><label class="form-label small fw-bold">Phone</label><input type="text" id="cPhone" class="form-control form-control-sm" placeholder="+91 9810012345"></div>
              <div class="col-12"><label class="form-label small fw-bold">Address</label><textarea id="cAddress" class="form-control form-control-sm" rows="2" placeholder="Office address..."></textarea></div>
            </div>
          </div>

          <!-- Billing -->
          <div class="card-widget mt-3">
            <h5><i class="fas fa-money-bill me-2"></i>Billing & Plan</h5>
            <div class="row g-2">
              <div class="col-md-4"><label class="form-label small fw-bold">Plan</label><select id="cPlan" class="form-select form-select-sm"><option value="free">Free Trial</option><option value="basic">Basic</option><option value="pro">Professional</option><option value="enterprise">Enterprise</option></select></div>
              <div class="col-md-4"><label class="form-label small fw-bold">Revenue (₹)</label><input type="number" id="cRevenue" class="form-control form-control-sm" placeholder="0"></div>
              <div class="col-md-4"><label class="form-label small fw-bold">Billing Cycle</label><select id="cBilling" class="form-select form-select-sm"><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select></div>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <!-- Assign Agents -->
          <div class="card-widget">
            <h5><i class="fas fa-user-tie me-2"></i>Assign Agents</h5>
            <p class="text-muted small mb-2">Select team members to manage this client</p>
            <div id="agentCheckboxList" style="max-height:200px;overflow-y:auto;">
              <p class="text-muted small">Loading agents...</p>
            </div>
          </div>

          <!-- Linked Resources -->
          <div class="card-widget mt-3">
            <h5><i class="fas fa-link me-2"></i>Linked Resources</h5>
            <div class="mb-2"><label class="form-label small fw-bold">WhatsApp Group</label><input type="text" id="cWaGroup" class="form-control form-control-sm" placeholder="Group link"></div>
            <div class="mb-2"><label class="form-label small fw-bold">Google Drive</label><input type="text" id="cDrive" class="form-control form-control-sm" placeholder="Drive folder link"></div>
            <div class="mb-2"><label class="form-label small fw-bold">Contract/Agreement</label><input type="text" id="cContract" class="form-control form-control-sm" placeholder="Document link"></div>
          </div>

          <button class="btn btn-primary w-100 mt-3 py-2" onclick="Clients.saveClient()">
            <i class="fas fa-save me-1"></i> Save Client
          </button>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;

    // ✅ Load agents with checkboxes
    this.loadAgentCheckboxes();
  },

  async loadAgentCheckboxes() {
    try {
      const snap = await db.collection('users').where('role', 'in', ['admin', 'team']).get();
      const agents = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const container = document.getElementById('agentCheckboxList');
      
      if (agents.length === 0) {
        container.innerHTML = '<p class="text-muted small">No agents available. Add team members first.</p>';
        return;
      }

      container.innerHTML = agents.map(a => `
        <div class="form-check mb-2 d-flex align-items-center gap-2">
          <input class="form-check-input" type="checkbox" value="${a.id}" data-name="${a.name||a.email}" id="agent-${a.id}">
          <label class="form-check-label small d-flex align-items-center gap-2" for="agent-${a.id}">
            <span style="width:28px;height:28px;border-radius:50%;background:${a.role==='admin'?'#6366f1':'#1877f2'};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;">${(a.name||a.email||'?')[0].toUpperCase()}</span>
            <div>
              <strong>${a.name||'Unnamed'}</strong>
              <span class="badge bg-${a.role==='admin'?'primary':'info'} ms-1" style="font-size:9px;">${a.role}</span>
              <br><small class="text-muted">${a.email||''}</small>
            </div>
          </label>
        </div>
      `).join('');
    } catch(e) { 
      document.getElementById('agentCheckboxList').innerHTML = '<p class="text-muted small">Error loading agents</p>';
    }
  },

  // ✅ Logo Upload
  async uploadLogo() {
    const file = document.getElementById('logoFileInput').files[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('logoPlaceholder').style.display = 'none';
      const preview = document.getElementById('logoPreview');
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);

    // Upload to Firebase Storage
    const ref = firebase.storage().ref('client_logos/' + Date.now() + '_' + file.name);
    const task = ref.put(file);
    task.on('state_changed', null, null, async () => {
      const url = await task.snapshot.ref.getDownloadURL();
      document.getElementById('logoPreview').dataset.url = url;
    });
  },

  async saveClient() {
    const company = document.getElementById('cCompany').value.trim();
    const contactName = document.getElementById('cContactName').value.trim();
    const email = document.getElementById('cEmail').value.trim();

    if (!company) return alert('Company name required!');
    if (!contactName) return alert('Contact name required!');
    if (!email) return alert('Email required!');

    // ✅ Get selected agents with name + ID
    const assignedAgents = Array.from(document.querySelectorAll('#agentCheckboxList input:checked')).map(cb => ({
      id: cb.value,
      name: cb.dataset.name || 'Unknown'
    }));

    // Get uploaded logo URL
    const logoUrl = document.getElementById('logoPreview')?.dataset?.url || '';

    const data = {
      companyName: company,
      logoUrl,
      industry: document.getElementById('cIndustry').value,
      website: document.getElementById('cWebsite').value.trim(),
      status: document.getElementById('cStatus').value,
      tags: document.getElementById('cTags').value.split(',').map(t => t.trim()).filter(Boolean),
      notes: document.getElementById('cNotes').value.trim(),
      contactName,
      designation: document.getElementById('cDesignation').value.trim(),
      email,
      phone: document.getElementById('cPhone').value.trim(),
      address: document.getElementById('cAddress').value.trim(),
      plan: document.getElementById('cPlan').value,
      revenue: document.getElementById('cRevenue').value.trim(),
      billingCycle: document.getElementById('cBilling').value,
      waGroup: document.getElementById('cWaGroup').value.trim(),
      driveLink: document.getElementById('cDrive').value.trim(),
      contractLink: document.getElementById('cContract').value.trim(),
      assignedAgents,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      await db.collection('clients').add(data);
      alert('✅ Client added successfully!');
      this.currentTab = 'list';
      this.render();
    } catch(e) { alert('Error: ' + e.message); }
  },

  // ==================== CLIENT DETAIL ====================
  async renderClientDetail(id) {
    const doc = await db.collection('clients').doc(id).get();
    if (!doc.exists) { this.currentTab = 'list'; this.render(); return; }
    const c = doc.data();

    let leadCount = 0;
    try { leadCount = (await db.collection('leads').where('clientId','==',id).get()).size; } catch(e) {}

    let html = `
      <div class="d-flex align-items-center mb-3">
        <button class="btn btn-outline-secondary btn-sm me-2" onclick="Clients.currentTab='list';Clients.selectedClient=null;Clients.render();"><i class="fas fa-arrow-left"></i></button>
        <div class="client-logo me-2" style="width:40px;height:40px;border-radius:10px;background:${c.logoUrl?'transparent':'#1877f2'};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;overflow:hidden;">${c.logoUrl?`<img src="${c.logoUrl}" style="width:100%;height:100%;object-fit:cover;">`:(c.companyName||'?')[0].toUpperCase()}</div>
        <h4 class="mb-0">${c.companyName||'Client'}</h4>
        <span class="status-badge ${c.status||'pending'} ms-2">${c.status||'pending'}</span>
        <button class="btn btn-outline-danger btn-sm ms-auto" onclick="Clients.deleteClient('${id}')"><i class="fas fa-trash"></i></button>
      </div>

      <div class="row g-3">
        <div class="col-md-8">
          <div class="card-widget">
            <h5>Company Info</h5>
            <div class="row g-2">
              <div class="col-6"><small class="text-muted">Industry</small><p>${c.industry||'N/A'}</p></div>
              <div class="col-6"><small class="text-muted">Website</small><p>${c.website?`<a href="${c.website}" target="_blank">${c.website}</a>`:'N/A'}</p></div>
              <div class="col-6"><small class="text-muted">Plan</small><p class="fw-bold">${c.plan||'Free'}</p></div>
              <div class="col-6"><small class="text-muted">Revenue</small><p class="fw-bold text-success">₹${parseInt(c.revenue||0).toLocaleString()}</p></div>
            </div>
            ${c.tags?.length>0?`<div class="mt-2">${c.tags.map(t=>`<span class="badge bg-info me-1">${t}</span>`).join('')}</div>`:''}
            ${c.notes?`<div class="mt-2"><small class="text-muted">Notes</small><p>${c.notes}</p></div>`:''}
          </div>
          <div class="card-widget mt-3">
            <h5>Contact Person</h5>
            <p><strong>${c.contactName||'N/A'}</strong> ${c.designation?`· ${c.designation}`:''}</p>
            <p>📧 ${c.email||'N/A'} · 📱 ${c.phone||'N/A'}</p>
            <p>📍 ${c.address||'N/A'}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card-widget">
            <h5><i class="fas fa-user-tie me-2"></i>Assigned Agents</h5>
            ${c.assignedAgents?.length>0 ? c.assignedAgents.map(a => `
              <div class="d-flex align-items-center gap-2 mb-2">
                <div style="width:28px;height:28px;border-radius:50%;background:#1877f2;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;">${(a.name||'?')[0].toUpperCase()}</div>
                <span class="small">${a.name||a.id||'Unknown'}</span>
              </div>
            `).join('') : '<p class="text-muted small">No agents assigned</p>'}
          </div>
          <div class="card-widget mt-3">
            <h5>Resources</h5>
            ${c.waGroup?`<p><a href="${c.waGroup}" target="_blank">💬 WhatsApp Group</a></p>`:''}
            ${c.driveLink?`<p><a href="${c.driveLink}" target="_blank">📁 Google Drive</a></p>`:''}
            ${c.contractLink?`<p><a href="${c.contractLink}" target="_blank">📄 Contract</a></p>`:''}
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  async deleteClient(id) {
    if (!confirm('Delete this client?')) return;
    await db.collection('clients').doc(id).delete();
    this.currentTab = 'list';
    this.selectedClient = null;
    this.render();
  }
};
