// js/admin.js — Hierarchical Admin Panel for all levels
const Admin = {
  currentTab: 'dashboard', // dashboard | clients | roles | plans | users | company
  editingId: null,

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = 'var(--bg-primary, #f0f2f5)';

    // Only platform roles see full admin, client roles see company settings
    const isPlatformAdmin = Permissions.canAccess('admin', 'manage');
    const isClientAdmin = window.currentUser?.role === 'client_owner' || window.currentUser?.role === 'client_admin' || window.currentUser?.role === 'client_super_admin';

    if (!isPlatformAdmin && !isClientAdmin) {
      contentArea.innerHTML = `<div class="card-widget text-center py-5"><h4>Access Denied</h4><p>You do not have administrator privileges.</p></div>`;
      return;
    }

    // Build tabs based on role
    let tabs = [];
    if (isPlatformAdmin) {
      tabs = [
        { key: 'dashboard', label: 'Dashboard' },
        { key: 'clients', label: 'Clients' },
        { key: 'roles', label: 'Roles' },
        { key: 'plans', label: 'Plans' },
        { key: 'settings', label: 'Settings' },
      ];
    } else if (isClientAdmin) {
      tabs = [
        { key: 'dashboard', label: 'Company' },
        { key: 'users', label: 'Users' },
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
        .perm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;}
        .perm-module{border:1px solid #e5e7eb;border-radius:8px;padding:12px;}
        .perm-module h6{margin:0 0 6px;font-weight:600;}
        .perm-check{margin-right:12px;font-size:12px;}
        .perm-check input{margin-right:4px;}
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
    else if (this.currentTab === 'company') html += await this.renderCompany();

    html += `</div>`;
    contentArea.innerHTML = html;
  },

  // ==================== DASHBOARD ====================
  async renderDashboard() {
    const isPlatform = Permissions.canAccess('admin', 'manage');
    if (isPlatform) {
      let totalClients=0, totalUsers=0, totalRevenue=0;
      try {
        const clientsSnap = await db.collection('clients').get();
        totalClients = clientsSnap.size;
        const usersSnap = await db.collection('users').get();
        totalUsers = usersSnap.size;
        // revenue from plans
        clientsSnap.forEach(doc => {
          const client = doc.data();
          if (client.planId) {
            // simplistic revenue calculation
            totalRevenue += client.planId === 'professional' ? 2499 : client.planId === 'enterprise' ? 9999 : 0;
          }
        });
      } catch(e) {}
      return `
        <div class="row g-3 mb-4">
          <div class="col-md-3"><div class="admin-card text-center"><h2>${totalClients}</h2><small>Total Clients</small></div></div>
          <div class="col-md-3"><div class="admin-card text-center"><h2>${totalUsers}</h2><small>Total Users</small></div></div>
          <div class="col-md-3"><div class="admin-card text-center"><h2>₹${totalRevenue.toLocaleString()}</h2><small>Monthly Revenue</small></div></div>
          <div class="col-md-3"><div class="admin-card text-center"><h2>5</h2><small>Active Plans</small></div></div>
        </div>
      `;
    } else {
      const clientId = window.currentUser?.clientId;
      let users=0;
      try {
        const snap = await db.collection('users').where('clientId','==',clientId).get();
        users = snap.size;
      } catch(e) {}
      return `
        <div class="admin-card"><h5>Company Overview</h5><p>Total team members: <strong>${users}</strong></p></div>
      `;
    }
  },

  // ==================== CLIENTS (Platform Only) ====================
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
        <td>${c.status||'active'}</td>
        <td>
          <button class="btn btn-sm btn-outline-info" onclick="Admin.editClient('${c.id}')"><i class="fas fa-edit"></i></button>
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
      <div id="clientModal"></div>
    `;
  },

  showClientForm(editId=null) {
    let data = {name:'', planId:'free', modules:[]};
    if (editId) {
      db.collection('clients').doc(editId).get().then(doc => { if(doc.exists) data = doc.data(); renderForm(); });
    } else renderForm();

    function renderForm() {
      document.getElementById('clientModal').innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
          <div class="card-widget" style="width:500px;max-width:90vw;" onclick="event.stopPropagation()">
            <h5>${editId?'Edit':'Add'} Client</h5>
            <input id="cName" class="form-control form-control-sm mb-2" placeholder="Company Name" value="${data.name}">
            <select id="cPlan" class="form-select form-select-sm mb-2">
              <option value="free" ${data.planId==='free'?'selected':''}>Free</option>
              <option value="professional" ${data.planId==='professional'?'selected':''}>Professional</option>
              <option value="enterprise" ${data.planId==='enterprise'?'selected':''}>Enterprise</option>
            </select>
            <label class="small">Enabled Modules (comma separated)</label>
            <input id="cModules" class="form-control form-control-sm mb-2" value="${(data.modules||[]).join(',')}">
            <button class="btn btn-primary btn-sm" onclick="Admin.saveClient('${editId||''}')">Save</button>
            <button class="btn btn-light btn-sm" onclick="document.getElementById('clientModal').innerHTML=''">Cancel</button>
          </div>
        </div>`;
    }
  },

  async saveClient(editId) {
    const name = document.getElementById('cName').value.trim();
    const planId = document.getElementById('cPlan').value;
    const modules = document.getElementById('cModules').value.split(',').map(m=>m.trim()).filter(Boolean);
    const data = { name, planId, modules, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
    try {
      if (editId) await db.collection('clients').doc(editId).update(data);
      else { data.createdAt = firebase.firestore.FieldValue.serverTimestamp(); await db.collection('clients').add(data); }
      document.getElementById('clientModal').innerHTML = '';
      this.render();
    } catch(e) { alert(e.message); }
  },

  async deleteClient(id) {
    if(!confirm('Delete client?')) return;
    await db.collection('clients').doc(id).delete();
    this.render();
  },

  // ==================== ROLES MANAGEMENT ====================
  async renderRoles() {
    const isPlatform = Permissions.canAccess('admin','manage');
    const clientId = window.currentUser?.clientId;
    let roles = [];
    try {
      let snap;
      if (isPlatform) {
        snap = await db.collection('roles').get();
      } else {
        snap = await db.collection('clients').doc(clientId).collection('roles').get();
      }
      roles = snap.docs.map(d => ({id:d.id, ...d.data()}));
    } catch(e) {}

    // Merge default roles if none exist
    if (roles.length === 0) {
      roles = Object.entries(DEFAULT_ROLES).map(([id, r]) => ({id, ...r}));
    }

    let html = `<div class="admin-card"><h5>Role Management</h5>
      <button class="btn btn-primary btn-sm mb-3" onclick="Admin.showRoleForm()">+ Create Role</button>
      <div class="perm-grid">`;

    roles.forEach(role => {
      html += `<div class="perm-module">
        <h6>${role.name} <span class="badge bg-${role.isPlatformRole?'primary':'info'}">${role.level}</span></h6>
        <div>Modules: ${Object.keys(role.modules||{}).join(', ') || 'None'}</div>
        <button class="btn btn-sm btn-outline-info mt-2" onclick="Admin.showRoleForm('${role.id}')">Edit</button>
        ${!role.isPlatformRole ? `<button class="btn btn-sm btn-outline-danger mt-2" onclick="Admin.deleteRole('${role.id}')">Delete</button>` : ''}
      </div>`;
    });

    html += `</div></div><div id="roleModal"></div>`;
    return html;
  },

  showRoleForm(editId=null) {
    let data = {name:'', level:5, isPlatformRole:false, modules:{}};
    if (editId) {
      // fetch from roles collection
      const fetchDoc = async () => {
        const doc = await db.collection('roles').doc(editId).get();
        if (doc.exists) data = doc.data();
        renderForm();
      };
      fetchDoc();
    } else renderForm();

    function renderForm() {
      document.getElementById('roleModal').innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
          <div class="card-widget" style="width:600px;max-width:90vw;max-height:90vh;overflow-y:auto;" onclick="event.stopPropagation()">
            <h5>${editId?'Edit':'Create'} Role</h5>
            <input id="rName" class="form-control form-control-sm mb-2" placeholder="Role Name" value="${data.name}">
            <select id="rLevel" class="form-select form-select-sm mb-2">
              <option value="2" ${data.level===2?'selected':''}>Client Owner</option>
              <option value="3" ${data.level===3?'selected':''}>Admin</option>
              <option value="4" ${data.level===4?'selected':''}>Manager</option>
              <option value="5" ${data.level===5?'selected':''}>Executive</option>
            </select>
            <div class="form-check mb-2"><input class="form-check-input" type="checkbox" id="rPlatform" ${data.isPlatformRole?'checked':''}><label>Platform Role</label></div>
            <h6>Module Permissions</h6>
            <div class="perm-grid">
              ${Object.keys(DEFAULT_ROLES.platform_owner.modules).map(mod => `
                <div class="perm-module">
                  <h6>${mod}</h6>
                  ${['create','read','update','delete'].map(action => `
                    <label class="perm-check"><input type="checkbox" class="perm-${mod}" data-action="${action}" ${data.modules?.[mod]?.[action]?'checked':''}>${action}</label>
                  `).join('')}
                </div>
              `).join('')}
            </div>
            <button class="btn btn-primary btn-sm mt-2" onclick="Admin.saveRole('${editId||''}')">Save</button>
            <button class="btn btn-light btn-sm mt-2" onclick="document.getElementById('roleModal').innerHTML=''">Cancel</button>
          </div>
        </div>`;
    }
  },

  async saveRole(editId) {
    const name = document.getElementById('rName').value.trim();
    const level = parseInt(document.getElementById('rLevel').value);
    const isPlatformRole = document.getElementById('rPlatform').checked;
    const modules = {};
    document.querySelectorAll('.perm-module').forEach(div => {
      const modName = div.querySelector('h6').innerText;
      modules[modName] = {};
      div.querySelectorAll('input[type=checkbox]').forEach(cb => {
        modules[modName][cb.dataset.action] = cb.checked;
      });
    });
    const data = { name, level, isPlatformRole, modules };
    try {
      const clientId = window.currentUser?.clientId;
      if (isPlatformRole) {
        await db.collection('roles').doc(editId || name.toLowerCase().replace(/\s/g,'_')).set(data, {merge:true});
      } else if (clientId) {
        await db.collection('clients').doc(clientId).collection('roles').doc(editId || name.toLowerCase().replace(/\s/g,'_')).set(data, {merge:true});
      }
      document.getElementById('roleModal').innerHTML = '';
      this.render();
    } catch(e) { alert(e.message); }
  },

  async deleteRole(id) {
    if(!confirm('Delete role?')) return;
    await db.collection('roles').doc(id).delete();
    this.render();
  },

  // ==================== PLANS (Platform) ====================
  async renderPlans() {
    let plans = [];
    try {
      const snap = await db.collection('plans').get();
      plans = snap.docs.map(d => ({id:d.id, ...d.data()}));
    } catch(e) {}
    return `
      <div class="admin-card">
        <h5>Subscription Plans</h5>
        <button class="btn btn-primary btn-sm mb-3" onclick="Admin.showPlanForm()">+ Create Plan</button>
        <table class="table table-sm">
          <thead><tr><th>Name</th><th>Price</th><th>Modules</th><th>Max Users</th><th>Actions</th></tr></thead>
          <tbody>
            ${plans.map(p => `<tr><td>${p.name}</td><td>₹${p.price||0}</td><td>${(p.modules||[]).join(', ')}</td><td>${p.maxUsers||'-'}</td><td><button class="btn btn-sm btn-outline-info" onclick="Admin.showPlanForm('${p.id}')">Edit</button> <button class="btn btn-sm btn-outline-danger" onclick="Admin.deletePlan('${p.id}')">Delete</button></td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div id="planModal"></div>
    `;
  },

  // ... additional methods for users, settings, etc.

  // ==================== USERS (Client admins) ====================
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
            ${users.map(u => `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td><button class="btn btn-sm btn-outline-info" onclick="Admin.editUserRole('${u.id}')">Change Role</button></td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div id="userModal"></div>
    `;
  },

  // ... other tabs as needed
};
