// js/admin.js — Complete Advanced Admin Panel with Pending Approvals Tab

const Admin = {
  currentTab: 'dashboard',
  currentSettingsTab: 'profile',

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
        { key: 'approvals', label: 'Pending Approvals' },   // <-- NEW TAB
        { key: 'clients', label: 'Clients' },
        { key: 'users', label: 'Users' },
        { key: 'roles', label: 'Roles & Permissions' },
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
        .admin-wrap { max-width:1300px; margin:0 auto; }
        .admin-tab { display:inline-block; padding:8px 16px; border-radius:20px; font-size:13px; cursor:pointer; margin:4px; border:1px solid #e5e7eb; background:#fff; transition:0.2s; }
        .admin-tab:hover, .admin-tab.active { background:#1877f2; color:#fff; border-color:#1877f2; }
        .admin-card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:20px; margin-bottom:16px; }
        .perm-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:12px; }
        .perm-module { border:1px solid #e5e7eb; border-radius:8px; padding:12px; background:#f9fafb; }
        .perm-module h6 { margin:0 0 6px; font-weight:600; font-size:13px; }
        .perm-check { margin-right:12px; font-size:12px; display:inline-flex; align-items:center; gap:3px; }
        .perm-check input { margin:0; width:14px; height:14px; }
        .modal-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; display:flex; align-items:center; justify-content:center; }
        .modal-box { background:#fff; border-radius:16px; width:90%; max-width:900px; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,0.3); position:relative; padding:24px; }
        .modal-close { position:sticky; top:0; float:right; background:none; border:none; font-size:24px; cursor:pointer; padding:4px 8px; color:#6b7280; z-index:10; }
        .modal-close:hover { color:#1e293b; }
        .settings-sidebar { width:200px; border-right:1px solid #e5e7eb; padding:12px; float:left; height:100%; }
        .settings-content { margin-left:220px; padding:12px; }
        .sub-tab { display:block; padding:8px 12px; border-radius:6px; cursor:pointer; font-size:13px; color:#4b5563; margin-bottom:4px; }
        .sub-tab:hover, .sub-tab.active { background:#e7f3ff; color:#1877f2; font-weight:500; }
        @media (max-width:768px) { .settings-sidebar { width:100%; float:none; border-right:none; } .settings-content { margin-left:0; } }
      </style>
      <div class="admin-wrap">
        <h4 style="font-weight:700;"><i class="fas fa-shield-alt text-primary me-2"></i>${isPlatformAdmin ? 'Platform Administration' : 'Company Settings'}</h4>
        <div style="margin-bottom:20px;">${tabs.map(t => `<span class="admin-tab ${this.currentTab===t.key?'active':''}" onclick="Admin.currentTab='${t.key}';Admin.render();">${t.label}</span>`).join('')}</div>
    `;

    if (this.currentTab === 'dashboard') html += await this.renderDashboard();
    else if (this.currentTab === 'approvals') html += await this.renderApprovals();   // <-- NEW
    else if (this.currentTab === 'clients') html += await this.renderClients();
    else if (this.currentTab === 'users') html += await this.renderUsers();
    else if (this.currentTab === 'roles') html += await this.renderRoles();
    else if (this.currentTab === 'plans') html += await this.renderPlans();
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

  // ==================== PENDING APPROVALS ====================
  async renderApprovals() {
    if (!Permissions.canAccess('admin','manage')) return '';
    let pending = [];
    try {
      const snap = await db.collection('clients').where('status', '==', 'pending').get();
      pending = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) {}
    let html = `<div class="admin-card"><h5>Pending Client Approvals</h5>`;
    if (pending.length === 0) html += `<p class="text-muted">No pending approvals.</p>`;
    else {
      html += `<table class="table table-sm"><thead><tr><th>Company</th><th>Contact</th><th>Plan</th><th>Modules</th><th>Actions</th></tr></thead><tbody>`;
      pending.forEach(c => {
        html += `<tr>
          <td>${c.companyName||'Unnamed'}</td>
          <td>${c.contactName||''}<br><small>${c.email||''}</small></td>
          <td>${c.planId||'Free'}</td>
          <td>${(c.modules||[]).join(', ')}</td>
          <td>
            <button class="btn btn-sm btn-outline-success" onclick="Admin.approveClient('${c.id}')">Approve</button>
            <button class="btn btn-sm btn-outline-danger" onclick="Admin.rejectClient('${c.id}')">Reject</button>
          </td>
        </tr>`;
      });
      html += `</tbody></table>`;
    }
    html += `</div>`;
    return html;
  },

  async approveClient(clientId) {
    // 1. Get client data
    const clientDoc = await db.collection('clients').doc(clientId).get();
    const clientData = clientDoc.data();
    if (!clientData) return alert('Client not found');
    // 2. Find the associated user (client_owner with this clientId)
    const userSnap = await db.collection('users').where('clientId', '==', clientId).where('role', '==', 'client_owner').get();
    if (userSnap.empty) return alert('No user found for this client!');
    const userDoc = userSnap.docs[0];
    // 3. Set default permissions based on role and modules (clone from DEFAULT_ROLES.client_owner but intersect with client's modules)
    const defaultPerms = JSON.parse(JSON.stringify(DEFAULT_ROLES.client_owner.modules));
    const allowedModules = {};
    (clientData.modules || []).forEach(mod => {
      if (defaultPerms[mod]) allowedModules[mod] = defaultPerms[mod];
    });
    // 4. Update client status to active
    await db.collection('clients').doc(clientId).update({ status: 'active' });
    // 5. Update user status and permissions
    await db.collection('users').doc(userDoc.id).update({
      status: 'active',
      permissions: allowedModules
    });
    alert('Client approved! User can now login with full access.');
    this.render();
  },

  async rejectClient(clientId) {
    if (!confirm('Reject this client? The user will not be able to access the platform.')) return;
    // Delete client document and associated user
    const userSnap = await db.collection('users').where('clientId', '==', clientId).get();
    const batch = db.batch();
    batch.delete(db.collection('clients').doc(clientId));
    userSnap.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    alert('Client rejected and removed.');
    this.render();
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

  // ==================== USERS ====================
  async renderUsers() {
    const isPlatform = Permissions.canAccess('admin','manage');
    const clientId = window.currentUser?.clientId;
    let users = [];
    try {
      let query = db.collection('users');
      if (!isPlatform && clientId) query = query.where('clientId','==',clientId);
      const snap = await query.orderBy('name').get();
      users = snap.docs.map(d => ({id:d.id, ...d.data()}));
    } catch(e) {}

    let rows = users.map(u => `
      <tr>
        <td>${u.name||''}</td>
        <td>${u.email||''}</td>
        <td>${u.phone||''}</td>
        <td>${u.role||''}</td>
        <td>${u.status||'active'}</td>
        <td>
          <button class="btn btn-sm btn-outline-info" onclick="Admin.showUserForm('${u.id}')"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-outline-danger" onclick="Admin.deleteUser('${u.id}')"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('');

    return `
      <div class="admin-card">
        <div class="d-flex justify-content-between mb-3">
          <h5>User Management</h5>
          <button class="btn btn-primary btn-sm" onclick="Admin.showUserForm()">+ Add User</button>
        </div>
        <input type="text" id="userSearch" class="form-control form-control-sm mb-3" placeholder="Search users..." oninput="Admin.filterUsers()">
        <table class="table table-sm" id="usersTable">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>${rows||'<tr><td colspan="6" class="text-muted text-center">No users</td></tr>'}</tbody>
        </table>
      </div>
    `;
  },

  filterUsers() {
    const s = document.getElementById('userSearch')?.value?.toLowerCase()||'';
    document.querySelectorAll('#usersTable tbody tr').forEach(r => {
      r.style.display = r.innerText.toLowerCase().includes(s) ? '' : 'none';
    });
  },

  showUserForm(editId = null) {
    const loadForm = async () => {
      let user = { name:'', email:'', phone:'', role:'executive', status:'active', clientId: window.currentUser?.clientId || null };
      if (editId) {
        const doc = await db.collection('users').doc(editId).get();
        if (doc.exists) user = doc.data();
      }

      let roles = [];
      if (Permissions.canAccess('admin','manage')) {
        roles = Object.keys(DEFAULT_ROLES);
      } else {
        const clientId = window.currentUser?.clientId;
        const snap = await db.collection('clients').doc(clientId).collection('roles').get();
        roles = snap.docs.map(d => d.id);
        if (roles.length === 0) roles = ['executive','manager','client_admin'];
      }
      const roleOptions = roles.map(r => `<option value="${r}" ${user.role===r?'selected':''}>${r}</option>`).join('');

      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.id = 'userModal';
      modal.innerHTML = `
        <div class="modal-box" style="max-width:500px;" onclick="event.stopPropagation()">
          <button class="modal-close" onclick="document.getElementById('userModal').remove()">&times;</button>
          <h5>${editId?'Edit':'Add'} User</h5>
          <input id="uName" class="form-control form-control-sm mb-2" placeholder="Full Name" value="${user.name||''}">
          <input id="uEmail" class="form-control form-control-sm mb-2" placeholder="Email" value="${user.email||''}">
          <input id="uPhone" class="form-control form-control-sm mb-2" placeholder="Phone" value="${user.phone||''}">
          <select id="uRole" class="form-select form-select-sm mb-2">${roleOptions}</select>
          <select id="uStatus" class="form-select form-select-sm mb-2">
            <option value="active" ${user.status==='active'?'selected':''}>Active</option>
            <option value="inactive" ${user.status==='inactive'?'selected':''}>Inactive</option>
          </select>
          <button class="btn btn-primary btn-sm mt-2" onclick="Admin.saveUser('${editId||''}')">Save</button>
          <button class="btn btn-light btn-sm mt-2" onclick="document.getElementById('userModal').remove()">Cancel</button>
        </div>`;
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
      document.body.appendChild(modal);
    };
    loadForm();
  },

  async saveUser(editId) {
    const name = document.getElementById('uName')?.value?.trim();
    const email = document.getElementById('uEmail')?.value?.trim();
    if (!name || !email) return alert('Name and email required');
    const data = {
      name, email,
      phone: document.getElementById('uPhone')?.value||'',
      role: document.getElementById('uRole')?.value,
      status: document.getElementById('uStatus')?.value,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    try {
      if (editId) await db.collection('users').doc(editId).update(data);
      else {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.clientId = window.currentUser?.clientId || null;
        await db.collection('users').add(data);
      }
      document.getElementById('userModal')?.remove();
      this.render();
    } catch(e) { alert(e.message); }
  },

  async deleteUser(id) {
    if (!confirm('Delete this user?')) return;
    await db.collection('users').doc(id).delete();
    this.render();
  },

  // ==================== ROLES & PERMISSIONS ====================
  async renderRoles() {
    const isPlatform = Permissions.canAccess('admin','manage');
    let roles = [];
    try {
      if (isPlatform) {
        const snap = await db.collection('roles').get();
        roles = snap.docs.map(d => ({id:d.id, ...d.data()}));
        if (roles.length === 0) roles = Object.entries(DEFAULT_ROLES).map(([id, r]) => ({id, ...r}));
      } else {
        const clientId = window.currentUser?.clientId;
        if (clientId) {
          const snap = await db.collection('clients').doc(clientId).collection('roles').get();
          roles = snap.docs.map(d => ({id:d.id, ...d.data()}));
        }
      }
    } catch(e) {}

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

      let visibleModules = [];
      if (isPlatform) {
        visibleModules = Object.keys(DEFAULT_ROLES.platform_owner.modules);
      } else {
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

  // ==================== SETTINGS ====================
  async renderSettings() {
    const subTabs = [
      { key:'profile', label:'Company Profile' },
      { key:'preferences', label:'Preferences' },
      { key:'pipeline', label:'Pipeline' },
      { key:'leadColumns', label:'Manage Columns' },
      { key:'customProperties', label:'Custom Properties' },
      { key:'notifications', label:'Notifications' },
      { key:'reports', label:'Automatic Reports' },
    ];

    let html = `<div class="row"><div class="col-md-3"><div class="admin-card" style="padding:12px;">`;
    subTabs.forEach(st => {
      html += `<div class="sub-tab ${this.currentSettingsTab===st.key?'active':''}" onclick="Admin.currentSettingsTab='${st.key}';Admin.renderSettingsContent()">${st.label}</div>`;
    });
    html += `</div><div class="col-md-9" id="settingsContent"></div></div>`;

    setTimeout(() => this.renderSettingsContent(), 50);
    return html;
  },

  async renderSettingsContent() {
    const container = document.getElementById('settingsContent');
    if (!container) return;
    switch(this.currentSettingsTab) {
      case 'profile': container.innerHTML = await this.settingsProfile(); break;
      case 'preferences': container.innerHTML = this.settingsPreferences(); break;
      case 'pipeline': container.innerHTML = await this.settingsPipeline(); break;
      case 'leadColumns': container.innerHTML = this.settingsLeadColumns(); break;
      case 'customProperties': container.innerHTML = await this.settingsCustomProperties(); break;
      case 'notifications': container.innerHTML = this.settingsNotifications(); break;
      case 'reports': container.innerHTML = this.settingsReports(); break;
      default: container.innerHTML = '<div class="admin-card"><p>Select a settings category.</p></div>';
    }
  },

  // ---------- Settings Sub‑pages ----------
  async settingsProfile() {
    let profile = {};
    try {
      const doc = await db.collection('settings').doc('company_profile').get();
      if (doc.exists) profile = doc.data();
    } catch(e) {}
    return `
      <div class="admin-card">
        <h5>Company Details</h5>
        <div class="row g-2">
          <div class="col-md-6"><input id="compName" class="form-control form-control-sm" placeholder="Company Name" value="${profile.name||''}"></div>
          <div class="col-md-6"><input id="compPhone" class="form-control form-control-sm" placeholder="Phone" value="${profile.phone||''}"></div>
          <div class="col-12"><input id="compAddress" class="form-control form-control-sm" placeholder="Address" value="${profile.address||''}"></div>
          <div class="col-md-4"><input id="compGST" class="form-control form-control-sm" placeholder="GST No" value="${profile.gst||''}"></div>
          <div class="col-md-4"><input id="compState" class="form-control form-control-sm" placeholder="State" value="${profile.state||''}"></div>
          <div class="col-md-4"><input id="compPincode" class="form-control form-control-sm" placeholder="Pincode" value="${profile.pincode||''}"></div>
        </div>
        <button class="btn btn-primary btn-sm mt-3" onclick="Admin.saveProfile()">Save</button>
      </div>`;
  },

  async saveProfile() {
    const data = {
      name: document.getElementById('compName')?.value,
      phone: document.getElementById('compPhone')?.value,
      address: document.getElementById('compAddress')?.value,
      gst: document.getElementById('compGST')?.value,
      state: document.getElementById('compState')?.value,
      pincode: document.getElementById('compPincode')?.value
    };
    await db.collection('settings').doc('company_profile').set(data, {merge:true});
    alert('Profile saved');
  },

  settingsPreferences() {
    return `<div class="admin-card"><h5>Preferences</h5><p>Currency, call settings, etc. (Coming soon)</p></div>`;
  },

  async settingsPipeline() {
    let pipeline = { stages: [] };
    try {
      const doc = await db.collection('settings').doc('pipeline').get();
      if (doc.exists) pipeline = doc.data();
    } catch(e) {}
    let stagesHtml = (pipeline.stages||[]).map((s,i) => `
      <div class="input-group mb-2">
        <input class="form-control form-control-sm" value="${s}" onchange="Admin.pipelineStages[${i}]=this.value">
        <button class="btn btn-sm btn-outline-danger" onclick="Admin.pipelineStages.splice(${i},1);Admin.renderSettingsContent()">&times;</button>
      </div>`).join('');
    if (!window.Admin) window.Admin = {};
    Admin.pipelineStages = [...(pipeline.stages||[])];
    return `
      <div class="admin-card">
        <h5>Sales Pipeline Stages</h5>
        <div id="pipelineStages">${stagesHtml}</div>
        <button class="btn btn-sm btn-outline-primary" onclick="Admin.pipelineStages.push('New Stage');Admin.renderSettingsContent()">+ Add Stage</button>
        <button class="btn btn-primary btn-sm mt-2" onclick="Admin.savePipeline()">Save</button>
      </div>`;
  },

  async savePipeline() {
    await db.collection('settings').doc('pipeline').set({ stages: Admin.pipelineStages }, {merge:true});
    alert('Pipeline stages saved');
  },

  settingsLeadColumns() {
    return `<div class="admin-card"><h5>Lead Table Columns</h5><p>Drag and drop columns (Coming soon).</p></div>`;
  },

  async settingsCustomProperties() {
    let fields = [];
    try {
      const snap = await db.collection('contactFields').get();
      fields = snap.docs.map(d => ({id:d.id, ...d.data()}));
    } catch(e) {}
    let rows = fields.map(f => `
      <tr>
        <td>${f.name}</td><td>${f.type}</td>
        <td><button class="btn btn-sm btn-outline-danger" onclick="Admin.deleteField('${f.id}')">Delete</button></td>
      </tr>`).join('');
    return `
      <div class="admin-card">
        <h5>Custom Contact Properties</h5>
        <button class="btn btn-primary btn-sm mb-3" onclick="Admin.showFieldForm()">+ Add Property</button>
        <table class="table table-sm">
          <thead><tr><th>Name</th><th>Type</th><th>Action</th></tr></thead>
          <tbody>${rows||'<tr><td colspan="3" class="text-muted">No custom fields</td></tr>'}</tbody>
        </table>
      </div>`;
  },

  showFieldForm() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'fieldModal';
    modal.innerHTML = `
      <div class="modal-box" style="max-width:400px;" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="document.getElementById('fieldModal').remove()">&times;</button>
        <h5>Add Custom Property</h5>
        <input id="fName" class="form-control form-control-sm mb-2" placeholder="Property Name">
        <select id="fType" class="form-select form-select-sm mb-2">
          <option value="text">Text</option><option value="number">Number</option><option value="date">Date</option>
        </select>
        <button class="btn btn-primary btn-sm" onclick="Admin.saveField()">Save</button>
        <button class="btn btn-light btn-sm" onclick="document.getElementById('fieldModal').remove()">Cancel</button>
      </div>`;
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
  },

  async saveField() {
    const name = document.getElementById('fName')?.value?.trim();
    const type = document.getElementById('fType')?.value;
    if (!name) return alert('Name required');
    await db.collection('contactFields').add({ name, type, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    document.getElementById('fieldModal')?.remove();
    this.renderSettingsContent();
  },

  async deleteField(id) {
    if (!confirm('Delete?')) return;
    await db.collection('contactFields').doc(id).delete();
    this.renderSettingsContent();
  },

  // ==================== NOTIFICATIONS ====================
  settingsNotifications() {
    (async () => {
      const doc = await db.collection('settings').doc('notification_preferences').get();
      const prefs = doc.exists ? doc.data() : {};
      
      const events = [
        { id: 'lead_creation', label: 'Lead Creation' },
        { id: 'lead_assignment', label: 'Lead Assignment' },
        { id: 'follow_up_reminder', label: 'Follow‑up Reminder' },
        { id: 'missed_call', label: 'Missed Call Alert' },
        { id: 'whatsapp_msg', label: 'WhatsApp Message Received' },
        { id: 'task_assigned', label: 'Task Assigned' }
      ];
      
      const channels = ['push','in_app','email','whatsapp'];
      const roles = ['admin','manager','executive'];

      let html = `<div class="admin-card"><h5>Notification Preferences</h5>
        <table class="table table-sm">
          <thead><tr><th>Event</th><th>Recipient</th>${channels.map(c=>`<th>${c.replace(/_/g,' ')}</th>`).join('')}</tr></thead>
          <tbody>`;

      events.forEach(ev => {
        roles.forEach(role => {
          html += `<tr><td>${ev.label}</td><td>${role}</td>`;
          channels.forEach(ch => {
            const key = `${ev.id}_${role}_${ch}`;
            const checked = prefs[key] ? 'checked' : '';
            html += `<td><input type="checkbox" class="notif-check" data-key="${key}" ${checked}></td>`;
          });
          html += `</tr>`;
        });
      });

      html += `</tbody></table>
        <button class="btn btn-primary btn-sm mt-3" onclick="Admin.saveNotificationPrefs()">Save</button>
      </div>`;

      document.getElementById('settingsContent').innerHTML = html;
    })();

    return '<div class="admin-card"><p>Loading...</p></div>';
  },

  saveNotificationPrefs() {
    const prefs = {};
    document.querySelectorAll('.notif-check').forEach(cb => {
      prefs[cb.dataset.key] = cb.checked;
    });
    db.collection('settings').doc('notification_preferences').set(prefs, {merge:true})
      .then(() => alert('Notification preferences saved!'));
  },

  // ==================== AUTOMATIC REPORTS ====================
  settingsReports() {
    (async () => {
      const doc = await db.collection('settings').doc('automatic_reports').get();
      const data = doc.exists ? doc.data() : { frequency:'weekly', email:true, whatsapp:false };

      const html = `
        <div class="admin-card">
          <h5>Automatic Reports</h5>
          <div class="mb-3">
            <label class="form-label">Frequency</label>
            <select id="reportFrequency" class="form-select form-select-sm">
              <option value="daily" ${data.frequency==='daily'?'selected':''}>Daily</option>
              <option value="weekly" ${data.frequency==='weekly'?'selected':''}>Weekly</option>
              <option value="monthly" ${data.frequency==='monthly'?'selected':''}>Monthly</option>
            </select>
          </div>
          <div class="form-check mb-2">
            <input class="form-check-input" type="checkbox" id="reportEmail" ${data.email?'checked':''}>
            <label class="form-check-label">Send via Email</label>
          </div>
          <div class="form-check mb-2">
            <input class="form-check-input" type="checkbox" id="reportWhatsapp" ${data.whatsapp?'checked':''}>
            <label class="form-check-label">Send via WhatsApp</label>
          </div>
          <button class="btn btn-primary btn-sm" onclick="Admin.saveReportSettings()">Save</button>
        </div>`;
      document.getElementById('settingsContent').innerHTML = html;
    })();

    return '<div class="admin-card"><p>Loading...</p></div>';
  },

  saveReportSettings() {
    const data = {
      frequency: document.getElementById('reportFrequency').value,
      email: document.getElementById('reportEmail').checked,
      whatsapp: document.getElementById('reportWhatsapp').checked
    };
    db.collection('settings').doc('automatic_reports').set(data, {merge:true})
      .then(() => alert('Report settings saved!'));
  },

  // ==================== SUBSCRIPTION (Client) ====================
  async renderSubscription() {
    return `<div class="admin-card"><h5>Current Plan</h5><p>Your company is on the <strong>${window.currentUser?.plan||'Free'}</strong> plan.</p></div>`;
  }
};
