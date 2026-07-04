// js/clients.js — Complete Client Management System
const Clients = {
  currentTab: 'list', // list, add, detail
  selectedClient: null,
  clientFilter: 'all',
  searchQuery: '',

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading clients...</p>';

    if (this.currentTab === 'add') {
      await this.renderAddForm();
      return;
    }
    if (this.currentTab === 'detail' && this.selectedClient) {
      await this.renderClientDetail(this.selectedClient);
      return;
    }

    await this.renderList();
  },

  async renderList() {
    let clients = [];
    let stats = { total: 0, active: 0, pending: 0, totalRevenue: 0 };

    try {
      let query = db.collection('clients').orderBy('createdAt', 'desc');
      const snap = await query.get();
      clients = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Apply filters
      if (this.clientFilter === 'active') clients = clients.filter(c => c.status === 'active');
      if (this.clientFilter === 'inactive') clients = clients.filter(c => c.status === 'inactive');
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
        .client-avatar { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 20px; }
        .client-avatar.active { background: linear-gradient(135deg, #10b981, #34d399); }
        .client-avatar.inactive { background: linear-gradient(135deg, #6b7280, #9ca3af); }
        .client-avatar.pending { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
        .status-badge { display: inline-block; padding: 3px 10px; border-radius: 14px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
        .status-badge.active { background: #d1fae5; color: #065f46; }
        .status-badge.inactive { background: #f3f4f6; color: #374151; }
        .status-badge.pending { background: #fef3c7; color: #92400e; }
        .client-tags { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 6px; }
        .client-tag { padding: 2px 8px; border-radius: 10px; font-size: 10px; background: #e0e7ff; color: #3730a3; }
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

      <!-- Stats -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3">
          <div class="card-widget text-center py-3">
            <h3 class="mb-0 text-primary">${stats.total}</h3>
            <small class="text-muted">Total Clients</small>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card-widget text-center py-3">
            <h3 class="mb-0 text-success">${stats.active}</h3>
            <small class="text-muted">Active</small>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card-widget text-center py-3">
            <h3 class="mb-0 text-warning">${stats.pending}</h3>
            <small class="text-muted">Pending</small>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card-widget text-center py-3">
            <h3 class="mb-0 text-info">₹${stats.totalRevenue.toLocaleString()}</h3>
            <small class="text-muted">Total Revenue</small>
          </div>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="d-flex gap-2 mb-3 flex-wrap align-items-center">
        <input type="text" class="form-control form-control-sm" placeholder="🔍 Search clients..." style="width:220px;" id="clientSearch" oninput="Clients.searchQuery=this.value;Clients.render();" value="${this.searchQuery}">
        <div class="d-flex gap-1">
          <button class="btn btn-${this.clientFilter==='all'?'primary':'outline-primary'} btn-sm" onclick="Clients.clientFilter='all';Clients.render();">All</button>
          <button class="btn btn-${this.clientFilter==='active'?'primary':'outline-primary'} btn-sm" onclick="Clients.clientFilter='active';Clients.render();">Active</button>
          <button class="btn btn-${this.clientFilter==='inactive'?'primary':'outline-primary'} btn-sm" onclick="Clients.clientFilter='inactive';Clients.render();">Inactive</button>
          <button class="btn btn-${this.clientFilter==='pending'?'primary':'outline-primary'} btn-sm" onclick="Clients.clientFilter='pending';Clients.render();">Pending</button>
        </div>
      </div>

      <!-- Client Cards -->
      <div class="row g-3">
        ${clients.length === 0 ? `
          <div class="col-12 text-center py-5">
            <i class="fas fa-building fa-3x text-muted mb-3"></i>
            <h5>No Clients Yet</h5>
            <p class="text-muted">Add your first client to get started</p>
            <button class="btn btn-primary" onclick="Clients.currentTab='add';Clients.render();">
              <i class="fas fa-plus me-1"></i> Add Client
            </button>
          </div>
        ` : clients.map(client => `
          <div class="col-md-6 col-lg-4">
            <div class="client-card" onclick="Clients.selectedClient='${client.id}';Clients.currentTab='detail';Clients.render();">
              <div class="d-flex gap-3">
                <div class="client-avatar ${client.status||'pending'}">${(client.companyName||'C')[0].toUpperCase()}</div>
                <div class="flex-grow-1">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="mb-0">${client.companyName||'Untitled'}</h6>
                      <span class="status-badge ${client.status||'pending'}">${client.status||'pending'}</span>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation();Clients.deleteClient('${client.id}')">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                  <small class="text-muted d-block mt-1">👤 ${client.contactName||'N/A'}</small>
                  <small class="text-muted d-block">📧 ${client.email||'N/A'}</small>
                  <small class="text-muted d-block">📱 ${client.phone||'N/A'}</small>
                  ${client.tags && client.tags.length > 0 ? `
                    <div class="client-tags">
                      ${client.tags.map(t => `<span class="client-tag">${t}</span>`).join('')}
                    </div>
                  ` : ''}
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
      <div class="d-flex align-items-center mb-3">
        <button class="btn btn-outline-secondary btn-sm me-2" onclick="Clients.currentTab='list';Clients.render();">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h4 class="mb-0">Add New Client</h4>
      </div>

      <div class="row g-3">
        <div class="col-md-8">
          <div class="card-widget">
            <h5><i class="fas fa-building me-2"></i>Company Details</h5>
            <div class="row g-2">
              <div class="col-md-6">
                <label class="form-label small fw-bold">Company Name *</label>
                <input type="text" id="cCompany" class="form-control form-control-sm" placeholder="e.g. ABC Pvt Ltd">
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Industry</label>
                <select id="cIndustry" class="form-select form-select-sm">
                  <option value="">Select Industry</option>
                  <option>Technology</option><option>Healthcare</option><option>Education</option>
                  <option>Finance</option><option>Retail</option><option>Manufacturing</option>
                  <option>Real Estate</option><option>Marketing</option><option>Other</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Website</label>
                <input type="url" id="cWebsite" class="form-control form-control-sm" placeholder="https://">
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Status</label>
                <select id="cStatus" class="form-select form-select-sm">
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div class="mt-3">
              <label class="form-label small fw-bold">Tags (comma separated)</label>
              <input type="text" id="cTags" class="form-control form-control-sm" placeholder="e.g. VIP, Enterprise, Startup">
            </div>
            <div class="mt-2">
              <label class="form-label small fw-bold">Notes</label>
              <textarea id="cNotes" class="form-control form-control-sm" rows="3" placeholder="Internal notes about this client..."></textarea>
            </div>
          </div>

          <div class="card-widget mt-3">
            <h5><i class="fas fa-user me-2"></i>Contact Person</h5>
            <div class="row g-2">
              <div class="col-md-6">
                <label class="form-label small fw-bold">Contact Name *</label>
                <input type="text" id="cContactName" class="form-control form-control-sm" placeholder="Full name">
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Designation</label>
                <input type="text" id="cDesignation" class="form-control form-control-sm" placeholder="e.g. CEO, Manager">
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Email *</label>
                <input type="email" id="cEmail" class="form-control form-control-sm" placeholder="client@example.com">
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Phone</label>
                <input type="text" id="cPhone" class="form-control form-control-sm" placeholder="+91 9810012345">
              </div>
              <div class="col-12">
                <label class="form-label small fw-bold">Address</label>
                <textarea id="cAddress" class="form-control form-control-sm" rows="2" placeholder="Office address..."></textarea>
              </div>
            </div>
          </div>

          <div class="card-widget mt-3">
            <h5><i class="fas fa-money-bill me-2"></i>Billing & Plan</h5>
            <div class="row g-2">
              <div class="col-md-4">
                <label class="form-label small fw-bold">Plan</label>
                <select id="cPlan" class="form-select form-select-sm">
                  <option value="free">Free Trial</option>
                  <option value="basic">Basic</option>
                  <option value="pro">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-bold">Monthly Revenue (₹)</label>
                <input type="number" id="cRevenue" class="form-control form-control-sm" placeholder="0">
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-bold">Billing Cycle</label>
                <select id="cBilling" class="form-select form-select-sm">
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card-widget">
            <h5><i class="fas fa-user-tie me-2"></i>Assign Agent</h5>
            <div id="agentList"></div>
          </div>

          <div class="card-widget mt-3">
            <h5><i class="fas fa-link me-2"></i>Linked Resources</h5>
            <div class="mb-2">
              <label class="form-label small fw-bold">WhatsApp Group</label>
              <input type="text" id="cWaGroup" class="form-control form-control-sm" placeholder="Group link">
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Google Drive</label>
              <input type="text" id="cDrive" class="form-control form-control-sm" placeholder="Drive folder link">
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Contract/Agreement</label>
              <input type="text" id="cContract" class="form-control form-control-sm" placeholder="Document link">
            </div>
          </div>

          <button class="btn btn-primary w-100 mt-3 py-2" onclick="Clients.saveClient()">
            <i class="fas fa-save me-1"></i> Save Client
          </button>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;

    // Load agents for assignment
    try {
      const snap = await db.collection('users').where('role', 'in', ['admin', 'team']).get();
      const agents = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const agentList = document.getElementById('agentList');
      agentList.innerHTML = agents.length === 0 ? '<p class="text-muted small">No agents available</p>' : agents.map(a => `
        <div class="form-check mb-1">
          <input class="form-check-input" type="checkbox" value="${a.id}" id="agent-${a.id}">
          <label class="form-check-label small" for="agent-${a.id}">${a.name||a.email}</label>
        </div>
      `).join('');
    } catch(e) {}
  },

  async saveClient() {
    const company = document.getElementById('cCompany').value.trim();
    const contactName = document.getElementById('cContactName').value.trim();
    const email = document.getElementById('cEmail').value.trim();

    if (!company) return alert('Company name required!');
    if (!contactName) return alert('Contact name required!');
    if (!email) return alert('Email required!');

    const assignedAgents = Array.from(document.querySelectorAll('#agentList input:checked')).map(cb => cb.value);

    const data = {
      companyName: company,
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

  // ==================== CLIENT DETAIL VIEW ====================
  async renderClientDetail(id) {
    const doc = await db.collection('clients').doc(id).get();
    if (!doc.exists) { this.currentTab = 'list'; this.render(); return; }
    const c = doc.data();

    // Count associated leads
    let leadCount = 0;
    try {
      const leadSnap = await db.collection('leads').where('clientId', '==', id).get();
      leadCount = leadSnap.size;
    } catch(e) {}

    let html = `
      <div class="d-flex align-items-center mb-3">
        <button class="btn btn-outline-secondary btn-sm me-2" onclick="Clients.currentTab='list';Clients.selectedClient=null;Clients.render();">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h4 class="mb-0">${c.companyName||'Client Detail'}</h4>
        <span class="status-badge ${c.status||'pending'} ms-2">${c.status||'pending'}</span>
        <button class="btn btn-outline-info btn-sm ms-auto me-1" onclick="Clients.showEditModal('${id}')"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn btn-outline-danger btn-sm" onclick="Clients.deleteClient('${id}')"><i class="fas fa-trash"></i> Delete</button>
      </div>

      <div class="row g-3">
        <div class="col-md-8">
          <div class="card-widget">
            <h5>Company Info</h5>
            <div class="row g-2">
              <div class="col-6"><small class="text-muted">Industry</small><p>${c.industry||'N/A'}</p></div>
              <div class="col-6"><small class="text-muted">Website</small><p>${c.website ? `<a href="${c.website}" target="_blank">${c.website}</a>` : 'N/A'}</p></div>
              <div class="col-6"><small class="text-muted">Plan</small><p class="fw-bold">${c.plan||'Free Trial'}</p></div>
              <div class="col-6"><small class="text-muted">Revenue</small><p class="fw-bold text-success">₹${parseInt(c.revenue||0).toLocaleString()}</p></div>
            </div>
            ${c.tags && c.tags.length > 0 ? `<div class="mt-2">${c.tags.map(t=>`<span class="badge bg-info me-1">${t}</span>`).join('')}</div>` : ''}
            ${c.notes ? `<div class="mt-3"><small class="text-muted">Notes</small><p>${c.notes}</p></div>` : ''}
          </div>

          <div class="card-widget mt-3">
            <h5>Contact Person</h5>
            <p><strong>${c.contactName||'N/A'}</strong> ${c.designation ? `· ${c.designation}` : ''}</p>
            <p>📧 ${c.email||'N/A'} · 📱 ${c.phone||'N/A'}</p>
            <p>📍 ${c.address||'N/A'}</p>
          </div>

          <div class="card-widget mt-3">
            <h5>Quick Stats</h5>
            <div class="row g-2">
              <div class="col-4 text-center py-2"><h5>${leadCount}</h5><small>Leads</small></div>
              <div class="col-4 text-center py-2"><h5>${c.totalCampaigns||0}</h5><small>Campaigns</small></div>
              <div class="col-4 text-center py-2"><h5>${c.totalMessages||0}</h5><small>Messages</small></div>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card-widget">
            <h5>Assigned Agents</h5>
            ${c.assignedAgents && c.assignedAgents.length > 0 ? c.assignedAgents.map(id => `<p class="small">👤 Agent ID: ${id}</p>`).join('') : '<p class="text-muted small">No agents assigned</p>'}
          </div>
          <div class="card-widget mt-3">
            <h5>Linked Resources</h5>
            ${c.waGroup ? `<p><a href="${c.waGroup}" target="_blank">💬 WhatsApp Group</a></p>` : ''}
            ${c.driveLink ? `<p><a href="${c.driveLink}" target="_blank">📁 Google Drive</a></p>` : ''}
            ${c.contractLink ? `<p><a href="${c.contractLink}" target="_blank">📄 Contract</a></p>` : ''}
            ${!c.waGroup && !c.driveLink && !c.contractLink ? '<p class="text-muted small">No links</p>' : ''}
          </div>
          <div class="card-widget mt-3">
            <h5>Billing</h5>
            <p>Plan: <strong>${c.plan||'Free'}</strong></p>
            <p>Cycle: <strong>${c.billingCycle||'Monthly'}</strong></p>
            <p>Created: <small>${c.createdAt?.toDate().toLocaleDateString()||'N/A'}</small></p>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  async deleteClient(id) {
    if (!confirm('Delete this client? This cannot be undone.')) return;
    await db.collection('clients').doc(id).delete();
    this.currentTab = 'list';
    this.selectedClient = null;
    this.render();
  }
};
