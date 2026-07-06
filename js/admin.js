// js/admin.js — Advanced Hierarchical Admin Panel
const Admin = {
  currentTab: 'dashboard',

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = 'var(--bg-primary, #f0f2f5)';

    const isPlatformAdmin = Permissions.canAccess('admin', 'manage');
    const isClientAdmin = window.currentUser?.role === 'client_owner' || 
                          window.currentUser?.role === 'client_admin' ||
                          window.currentUser?.role === 'client_super_admin';

    if (!isPlatformAdmin && !isClientAdmin) {
      contentArea.innerHTML = `<div class="card-widget text-center py-5"><h4>Access Denied</h4></div>`;
      return;
    }

    let tabs = [];
    if (isPlatformAdmin) {
      tabs = [
        { key: 'dashboard', label: 'Dashboard' },
        { key: 'clients', label: 'Clients' },
        { key: 'roles', label: 'Roles' },
        { key: 'plans', label: 'Plans' },
        { key: 'settings', label: 'Settings' },
      ];
    } else {
      tabs = [
        { key: 'dashboard', label: 'Company' },
        { key: 'users', label: 'Team' },
        { key: 'roles', label: 'Roles' },
        { key: 'plan', label: 'Subscription' },
      ];
    }

    let html = `
      <style>
        .admin-wrap{max-width:1300px;margin:0 auto;}
        .admin-tab{display:inline-block;padding:8px 16px;border-radius:20px;font-size:13px;cursor:pointer;margin:4px;border:1px solid #e5e7eb;background:#fff;transition:0.2s;}
        .admin-tab:hover,.admin-tab.active{background:#1877f2;color:#fff;border-color:#1877f2;}
        .admin-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:20px;margin-bottom:16px;}
        .perm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;}
        .perm-module{border:1px solid #e5e7eb;border-radius:8px;padding:12px;background:#f9fafb;}
        .perm-module h6{margin:0 0 6px;font-weight:600;font-size:13px;}
        .perm-check{margin-right:12px;font-size:12px;display:inline-flex;align-items:center;gap:3px;}
        .perm-check input{margin:0;width:14px;height:14px;}
        .modal-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;}
        .modal-box{background:#fff;border-radius:16px;width:90%;max-width:900px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);position:relative;padding:24px;}
        .modal-close{position:sticky;top:0;float:right;background:none;border:none;font-size:24px;cursor:pointer;padding:4px 8px;color:#6b7280;z-index:10;}
        .modal-close:hover{color:#1e293b;}
      </style>
      <div class="admin-wrap">
        <h4 style="font-weight:700;"><i class="fas fa-shield-alt text-primary me-2"></i>${isPlatformAdmin ? 'Platform Administration' : 'Company Settings'}</h4>
        <div style="margin-bottom:20px;">${tabs.map(t => `<span class="admin-tab ${this.currentTab===t.key?'active':''}" onclick="Admin.currentTab='${t.key}';Admin.render();">${t.label}</span>`).join('')}</div>
    `;

    if (this.currentTab === 'dashboard') html += await this.renderDashboard();
    else if (this.currentTab === 'clients') html += await this.renderClients();
    else if (this.currentTab === 'roles') html += await this.renderRoles();
    else if (this.currentTab === 'plans') html += await this.renderPlans();
    else if (this.currentTab === 'users') html += await this.renderUsers();
    else if (this.currentTab === 'settings') html += await this.renderSettings();
    else if (this.currentTab === 'plan') html += await this.renderSubscription();

    html += `</div>`;
    contentArea.innerHTML = html;
  },

  // ==================== DASHBOARD ====================
  async renderDashboard() {
    const isPlatform = Permissions.canAccess('admin', 'manage');
    if (isPlatform) {
      let totalClients = 0, totalUsers = 0;
      try {
        totalClients = (await db.collection('clients').get()).size;
        totalUsers = (await db.collection('users').get()).size;
      } catch(e) {}
      return `
        <div class="row g-3">
          <div class="col-md-4"><div class="admin-card text-center"><h2>${totalClients}</h2><small>Total Clients</small></div></div>
          <div class="col-md-4"><div class="admin-card text-center"><h2>${totalUsers}</h2><small>Total Users</small></div></div>
          <div class="col-md-4"><div class="admin-card text-center"><h2>6</h2><small>Roles Defined</small></div></div>
        </div>`;
    } else {
      const clientId = window.currentUser?.clientId;
      let users = 0;
      try { users = (await db.collection('users').where('clientId','==',clientId).get()).size; } catch(e) {}
      return `<div class="admin-card"><h5>Company Overview</h5><p>Team members: <strong>${users}</strong></p></div>`;
    }
  },

  // ==================== CLIENTS ====================
  async renderClients() {
    if (!Permissions.canAccess('admin','manage')) return '';
    let clients = [];
    try {
      const snap = await db.collection('clients').orderBy('name').get();
      clients = snap.docs.map(d => ({id:d.id, ...d.data()}));
    } catch(e) {}

    let rows = clients.map(c => `
      <tr>
        <td><strong>${c.name||'Unnamed'}</strong></td>
        <td>${c.planId||'Free'}</td>
        <td>${(c.modules||[]).join(', ')||'All'}</td>
        <td><span class="badge bg-${c.status==='active'?'success':'secondary'}">${c.status||'active'}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-info" onclick="Admin.showClientForm('${c.id}')"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-outline-danger" onclick="Admin.deleteClient('${c.id}')"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('');

    return `
      <div class="admin-card">
        <div class="d-flex justify-content-between mb-3">
          <h5>Client Companies</h5>
          <button class="btn btn-primary btn-sm" onclick="Admin.showClientForm()">+ Add Client</button>
        </div>
        <table class="table table-sm">
          <thead><tr><th>Name</th><th>Plan</th><th>Modules</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>${rows||'<tr><td colspan="5" class="text-muted text-center">No clients</td></tr>'}</tbody>
        </table>
      </div>
    `;
  },

  showClientForm(editId = null) {
    const loadForm = async () => {
      let client = { name: '', planId: 'free', modules: [] };
      if (editId) {
        const doc = await db.collection('clients').doc(editId).get();
        if (doc.exists) client = doc.data();
      }

      // Build checklist of all available modules (from platform_owner defaults)
      const allModules = Object.keys(DEFAULT_ROLES.platform_owner.modules);
      let moduleChecks = allModules.map(mod => `
        <div class="perm-module">
          <label class="perm-check">
            <input type="checkbox" value="${mod}" ${(client.modules||[]).includes(mod)?'checked':''}> ${mod}
          </label>
        </div>
      `).join('');

      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.id = 'clientModal';
      modal.innerHTML = `
        <div class="modal-box" onclick="event.stopPropagation()">
          <button class="modal-close" onclick="document.getElementById('clientModal').remove()">&times;</button>
          <h5>${editId?'Edit':'Add'} Client</h5>
          <input id="cName" class="form-control form-control-sm mb-2" placeholder="Company Name" value="${client.name||''}">
          <select id="cPlan" class="form-select form-select-sm mb-2">
            <option value="free" ${client.planId==='free'?'selected':''}>Free</option>
            <option value="professional" ${client.planId==='professional'?'selected':''}>Professional</option>
            <option value="enterprise" ${client.planId==='enterprise'?'selected':''}>Enterprise</option>
          </select>
          <h6>Enabled Modules</h6>
          <div class="perm-grid" style="max-height:300px;overflow-y:auto;">${moduleChecks}</div>
          <button class="btn btn-primary btn-sm mt-3" onclick="Admin.saveClient('${editId||''}')">Save</button>
          <button class="btn btn-light btn-sm mt-3" onclick="document.getElementById('clientModal').remove()">Cancel</button>
        </div>`;
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
      document.body.appendChild(modal);
    };
    loadForm();
  },

  async saveClient(editId) {
    const name = document.getElementById('cName')?.value?.trim();
    if (!name) return alert('Company name required');
    const planId = document.getElementById('cPlan')?.value;
    const modules = Array.from(document.querySelectorAll('#clientModal input[type=checkbox]:checked')).map(cb => cb.value);
    const data = { name, planId, modules, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
    try {
      if (editId) await db.collection('clients').doc(editId).update(data);
      else { data.createdAt = firebase.firestore.FieldValue.serverTimestamp(); data.status = 'active'; await db.collection('clients').add(data); }
      document.getElementById('clientModal')?.remove();
      this.render();
    } catch(e) { alert(e.message); }
  },

  async deleteClient(id) {
    if (!confirm('Delete this client?')) return;
    await db.collection('clients').doc(id).delete();
    this.render();
  },

  // ==================== ROLES ====================
  async renderRoles() {
    const isPlatform = Permissions.canAccess('admin','manage');
    let roles = [];
    if (isPlatform) {
      // Platform roles from separate collection
      try { const snap = await db.collection('roles').get(); roles = snap.docs.map(d => ({id:d.id, ...d.data()})); } catch(e) {}
      // Merge default roles
      if (roles.length === 0) roles = Object.entries(DEFAULT_ROLES).map(([id, r]) => ({id, ...r}));
    } else {
      // Client roles stored under client doc
      const clientId = window.currentUser?.clientId;
      if (clientId) {
        try {
          const snap = await db.collection('clients').doc(clientId).collection('roles').get();
          roles = snap.docs.map(d => ({id:d.id, ...d.data()}));
        } catch(e) {}
      }
    }

    let cards = roles.map(role => `
      <div class="perm-module">
        <h6>${role.name} <span class="badge bg-${role.isPlatformRole?'primary':'info'}">L${role.level||'?'}</span></h6>
        <div class="small">Modules: ${Object.keys(role.modules||{}).length}</div>
        <button class="btn btn-sm btn-outline-info mt-2" onclick="Admin.showRoleForm('${role.id}', ${isPlatform})">Edit</button>
        ${(!role.isPlatformRole || !DEFAULT_ROLES[role.id]) ? `<button class="btn btn-sm btn-outline-danger mt-2" onclick="Admin.deleteRole('${role.id}', ${isPlatform})">Delete</button>` : ''}
      </div>
    `).join('');

    return `
      <div class="admin-card">
        <div class="d-flex justify-content-between mb-3">
          <h5>Role Management</h5>
          <button class="btn btn-primary btn-sm" onclick="Admin.showRoleForm(null, ${isPlatform})">+ Create Role</button>
        </div>
        <div class="perm-grid">${cards||'<p class="text-muted">No roles defined yet.</p>'}</div>
      </div>
    `;
  },

  showRoleForm(roleId = null, isPlatform = true) {
    const loadForm = async () => {
      let role = { name: '', level: 5, isPlatformRole: false, modules: {} };
      if (roleId) {
        let doc;
        if (isPlatform) {
          doc = await db.collection('roles').doc(roleId).get();
        } else {
          const clientId = window.currentUser?.clientId;
          doc = await db.collection('clients').doc(clientId).collection('roles').doc(roleId).get();
        }
        if (doc && doc.exists) role = doc.data();
      }

      // Determine which modules the current admin can see (to limit what they can assign)
      let visibleModules = [];
      if (isPlatform) {
        visibleModules = Object.keys(DEFAULT_ROLES.platform_owner.modules);
      } else {
        // Client admin can only see modules that are in their own company's plan
        const clientId = window.currentUser?.clientId;
        const clientDoc = await db.collection('clients').doc(clientId).get();
        const clientData = clientDoc.data() || {};
        visibleModules = clientData.modules || Object.keys(DEFAULT_ROLES.platform_owner.modules);
      }

      let moduleChecks = visibleModules.map(mod => `
        <div class="perm-module">
          <h6>${mod}</h6>
          ${['create','read','update','delete'].map(action => `
            <label class="perm-check">
              <input type="checkbox" class="perm-checkbox" data-module="${mod}" data-action="${action}" 
                ${role.modules?.[mod]?.[action] ? 'checked' : ''}> ${action}
            </label>
          `).join('')}
        </div>
      `).join('');

      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.id = 'roleModal';
      modal.innerHTML = `
        <div class="modal-box" onclick="event.stopPropagation()">
          <button class="modal-close" onclick="document.getElementById('roleModal').remove()">&times;</button>
          <h5>${roleId?'Edit':'Create'} Role</h5>
          <input id="rName" class="form-control form-control-sm mb-2" placeholder="Role Name" value="${role.name||''}">
          <select id="rLevel" class="form-select form-select-sm mb-2">
            <option value="2" ${role.level===2?'selected':''}>Client Owner</option>
            <option value="3" ${role.level===3?'selected':''}>Admin</option>
            <option value="4" ${role.level===4?'selected':''}>Manager</option>
            <option value="5" ${role.level===5?'selected':''}>Executive</option>
          </select>
          <div class="form-check mb-2"><input class="form-check-input" type="checkbox" id="rPlatform" ${role.isPlatformRole?'checked':''}><label>Platform Role</label></div>
          <h6>Module Permissions</h6>
          <div class="perm-grid" style="max-height:300px;overflow-y:auto;">${moduleChecks}</div>
          <button class="btn btn-primary btn-sm mt-3" onclick="Admin.saveRole('${roleId||''}', ${isPlatform})">Save</button>
          <button class="btn btn-light btn-sm mt-3" onclick="document.getElementById('roleModal').remove()">Cancel</button>
        </div>`;
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
      document.body.appendChild(modal);
    };
    loadForm();
  },

  async saveRole(roleId, isPlatform) {
    const name = document.getElementById('rName')?.value?.trim();
    if (!name) return alert('Role name required');
    const level = parseInt(document.getElementById('rLevel')?.value);
    const isPlatformRole = document.getElementById('rPlatform')?.checked;
    const modules = {};
    document.querySelectorAll('#roleModal .perm-module').forEach(div => {
      const modName = div.querySelector('h6').innerText;
      modules[modName] = {};
      div.querySelectorAll('input[type=checkbox]').forEach(cb => {
        modules[modName][cb.dataset.action] = cb.checked;
      });
    });
    const data = { name, level, isPlatformRole, modules };
    try {
      if (isPlatform) {
        await db.collection('roles').doc(roleId || name.toLowerCase().replace(/\s/g,'_')).set(data, {merge: true});
      } else {
        const clientId = window.currentUser?.clientId;
        await db.collection('clients').doc(clientId).collection('roles').doc(roleId || name.toLowerCase().replace(/\s/g,'_')).set(data, {merge: true});
      }
      document.getElementById('roleModal')?.remove();
      this.render();
    } catch(e) { alert(e.message); }
  },

  async deleteRole(roleId, isPlatform) {
    if (!confirm('Delete this role?')) return;
    if (isPlatform) await db.collection('roles').doc(roleId).delete();
    else {
      const clientId = window.currentUser?.clientId;
      await db.collection('clients').doc(clientId).collection('roles').doc(roleId).delete();
    }
    this.render();
  },

  // ==================== PLANS ====================
  async renderPlans() {
    if (!Permissions.canAccess('admin','manage')) return '';
    let plans = [];
    try {
      const snap = await db.collection('plans').get();
      plans = snap.docs.map(d => ({id:d.id, ...d.data()}));
    } catch(e) {}

    let rows = plans.map(p => `
      <tr>
        <td>${p.name}</td>
        <td>₹${p.price||0}</td>
        <td>${(p.modules||[]).join(', ')}</td>
        <td>${p.maxUsers||'-'}</td>
        <td>
          <button class="btn btn-sm btn-outline-info" onclick="Admin.showPlanForm('${p.id}')">Edit</button>
          <button class="btn btn-sm btn-outline-danger" onclick="Admin.deletePlan('${p.id}')">Delete</button>
        </td>
      </tr>
    `).join('');

    return `
      <div class="admin-card">
        <div class="d-flex justify-content-between mb-3">
          <h5>Subscription Plans</h5>
          <button class="btn btn-primary btn-sm" onclick="Admin.showPlanForm()">+ Create Plan</button>
        </div>
        <table class="table table-sm">
          <thead><tr><th>Name</th><th>Price</th><th>Modules</th><th>Max Users</th><th>Actions</th></tr></thead>
          <tbody>${rows||'<tr><td colspan="5" class="text-muted text-center">No plans</td></tr>'}</tbody>
        </table>
      </div>
    `;
  },

  showPlanForm(editId = null) {
    const loadForm = async () => {
      let plan = { name: '', price: 0, modules: [], maxUsers: 10 };
      if (editId) {
        const doc = await db.collection('plans').doc(editId).get();
        if (doc.exists) plan = doc.data();
      }

      const allModules = Object.keys(DEFAULT_ROLES.platform_owner.modules);
      let moduleChecks = allModules.map(mod => `
        <div class="perm-module">
          <label class="perm-check">
            <input type="checkbox" value="${mod}" ${(plan.modules||[]).includes(mod)?'checked':''}> ${mod}
          </label>
        </div>
      `).join('');

      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.id = 'planModal';
      modal.innerHTML = `
        <div class="modal-box" onclick="event.stopPropagation()">
          <button class="modal-close" onclick="document.getElementById('planModal').remove()">&times;</button>
          <h5>${editId?'Edit':'Create'} Plan</h5>
          <input id="pName" class="form-control form-control-sm mb-2" placeholder="Plan Name" value="${plan.name||''}">
          <input id="pPrice" type="number" class="form-control form-control-sm mb-2" placeholder="Price (₹)" value="${plan.price||0}">
          <input id="pMaxUsers" type="number" class="form-control form-control-sm mb-2" placeholder="Max Users" value="${plan.maxUsers||10}">
          <h6>Included Modules</h6>
          <div class="perm-grid" style="max-height:300px;overflow-y:auto;">${moduleChecks}</div>
          <button class="btn btn-primary btn-sm mt-3" onclick="Admin.savePlan('${editId||''}')">Save</button>
          <button class="btn btn-light btn-sm mt-3" onclick="document.getElementById('planModal').remove()">Cancel</button>
        </div>`;
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
      document.body.appendChild(modal);
    };
    loadForm();
  },

  async savePlan(editId) {
    const name = document.getElementById('pName')?.value?.trim();
    if (!name) return alert('Plan name required');
    const price = parseInt(document.getElementById('pPrice')?.value) || 0;
    const maxUsers = parseInt(document.getElementById('pMaxUsers')?.value) || 10;
    const modules = Array.from(document.querySelectorAll('#planModal input[type=checkbox]:checked')).map(cb => cb.value);
    const data = { name, price, maxUsers, modules };
    try {
      if (editId) await db.collection('plans').doc(editId).update(data);
      else await db.collection('plans').add(data);
      document.getElementById('planModal')?.remove();
      this.render();
    } catch(e) { alert(e.message); }
  },

  async deletePlan(id) {
    if (!confirm('Delete plan?')) return;
    await db.collection('plans').doc(id).delete();
    this.render();
  },

  // ==================== USERS (Client Admins) ====================
  async renderUsers() {
    const clientId = window.currentUser?.clientId;
    if (!clientId) return '<p>Only company admins can manage users.</p>';
    let users = [];
    try {
      const snap = await db.collection('users').where('clientId','==',clientId).get();
      users = snap.docs.map(d => ({id:d.id, ...d.data()}));
    } catch(e) {}
    return `
      <div class="admin-card">
        <h5>Team Members</h5>
        <table class="table table-sm">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
          <tbody>
            ${users.map(u => `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td><button class="btn btn-sm btn-outline-info" onclick="Admin.changeUserRole('${u.id}')">Change Role</button></td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div id="userModal"></div>
    `;
  },

  async changeUserRole(userId) {
    // Simple prompt for now; can be enhanced to a modal listing available roles
    const newRole = prompt('Enter new role (e.g., client_owner, client_admin, manager, executive):');
    if (!newRole) return;
    await db.collection('users').doc(userId).update({ role: newRole });
    this.render();
  },

  // ==================== SETTINGS ====================
  async renderSettings() {
    return `
      <div class="admin-card">
        <h5>Platform Settings</h5>
        <p class="text-muted">Coming soon: Domain mapping, SMTP, API keys, and more.</p>
      </div>
    `;
  },

  // ==================== SUBSCRIPTION (Client) ====================
  async renderSubscription() {
    return `<div class="admin-card"><h5>Current Plan</h5><p>Your company is on the <strong>${window.currentUser?.plan||'Free'}</strong> plan.</p></div>`;
  }
};
