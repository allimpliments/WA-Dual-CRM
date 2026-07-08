// js/admin.js — Next-Level Platform Administration with Full Control
const Admin = {
  currentTab: 'dashboard',
  currentSettingsTab: 'profile',

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = '#f8fafc';

    const isPlatformAdmin = Permissions.canAccess('admin', 'manage');
    const isClientAdmin = window.currentUser?.role === 'client_owner' || 
                          window.currentUser?.role === 'client_admin' ||
                          window.currentUser?.role === 'client_super_admin';

    if (!isPlatformAdmin && !isClientAdmin) {
      contentArea.innerHTML = `<div class="text-center py-5"><i class="fas fa-lock fa-3x text-muted mb-3"></i><h4>Access Denied</h4><p class="text-muted">You don't have permission to access this area.</p></div>`;
      return;
    }

    let tabs = [];
    if (isPlatformAdmin) {
      tabs = [
        { key: 'dashboard', label: '📊 Dashboard', icon: 'fa-chart-pie' },
        { key: 'approvals', label: '⏳ Pending Approvals', icon: 'fa-clock' },
        { key: 'clients', label: '🏢 Clients', icon: 'fa-building' },
        { key: 'users', label: '👥 Users', icon: 'fa-users' },
        { key: 'roles', label: '🔐 Roles & Permissions', icon: 'fa-shield-alt' },
        { key: 'plans', label: '💳 Plans', icon: 'fa-credit-card' },
        { key: 'settings', label: '⚙️ Settings', icon: 'fa-cog' },
      ];
    } else {
      tabs = [
        { key: 'dashboard', label: '📊 Company', icon: 'fa-building' },
        { key: 'users', label: '👥 Team', icon: 'fa-users' },
        { key: 'roles', label: '🔐 Roles', icon: 'fa-shield-alt' },
        { key: 'plan', label: '💳 Subscription', icon: 'fa-credit-card' },
      ];
    }

    let pendingCount = 0, totalClients = 0, totalUsers = 0, totalLeads = 0;
    if (isPlatformAdmin) {
      try {
        const [pendingSnap, clientsSnap, usersSnap, leadsSnap] = await Promise.all([
          db.collection('clients').where('status', '==', 'pending').get(),
          db.collection('clients').get(),
          db.collection('users').get(),
          db.collection('leads').get()
        ]);
        pendingCount = pendingSnap.size;
        totalClients = clientsSnap.size;
        totalUsers = usersSnap.size;
        totalLeads = leadsSnap.size;
      } catch(e) {}
    }

    let html = `
      <style>
        .admin-wrap { max-width: 1400px; margin: 0 auto; }
        .admin-header { background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 20px; padding: 28px 32px; margin-bottom: 24px; color: #fff; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .admin-header h4 { margin: 0; font-weight: 800; font-size: 22px; }
        .admin-header p { margin: 4px 0 0; color: #94a3b8; font-size: 13px; }
        .admin-tabs { display: flex; gap: 4px; margin-bottom: 24px; flex-wrap: wrap; background: #fff; border-radius: 16px; padding: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; }
        .admin-tab { padding: 10px 18px; border-radius: 12px; font-size: 13px; cursor: pointer; font-weight: 500; transition: all 0.2s; color: #64748b; display: flex; align-items: center; gap: 6px; border: none; background: transparent; }
        .admin-tab:hover { background: #f1f5f9; color: #0f172a; }
        .admin-tab.active { background: #6366f1; color: #fff; box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
        .admin-card { background: #fff; border-radius: 16px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; }
        .admin-card h5 { font-weight: 700; font-size: 16px; color: #0f172a; margin-bottom: 20px; }
        .admin-stat { background: #fff; border-radius: 14px; padding: 20px; text-align: center; border: 1px solid #f1f5f9; transition: 0.2s; cursor: pointer; }
        .admin-stat:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.06); transform: translateY(-2px); }
        .admin-stat .val { font-size: 32px; font-weight: 800; }
        .admin-stat .lbl { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
        .admin-table { width: 100%; font-size: 13px; border-collapse: collapse; }
        .admin-table th { text-align: left; padding: 12px 16px; background: #f8fafc; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        .admin-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; }
        .admin-table tr:hover td { background: #f8fafc; }
        .admin-badge { padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; display: inline-block; }
        .admin-btn { padding: 6px 14px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; display: inline-flex; align-items: center; gap: 4px; }
        .admin-btn-primary { background: #6366f1; color: #fff; }
        .admin-btn-primary:hover { background: #4f46e5; }
        .admin-btn-success { background: #10b981; color: #fff; }
        .admin-btn-success:hover { background: #059669; }
        .admin-btn-danger { background: #ef4444; color: #fff; }
        .admin-btn-danger:hover { background: #dc2626; }
        .admin-btn-outline { background: #fff; color: #6366f1; border: 1px solid #6366f1; }
        .admin-btn-outline:hover { background: #eef2ff; }
        .admin-search { padding: 8px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13px; width: 250px; outline: none; }
        .admin-search:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-box { background: #fff; border-radius: 20px; width: 90%; max-width: 700px; max-height: 85vh; overflow-y: auto; box-shadow: 0 25px 60px rgba(0,0,0,0.2); position: relative; padding: 28px; animation: slideUp 0.3s ease; }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .modal-close { position: sticky; top: 0; float: right; background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; font-size: 18px; cursor: pointer; color: #64748b; z-index: 10; display: flex; align-items: center; justify-content: center; }
        .modal-close:hover { background: #e2e8f0; color: #0f172a; }
        .perm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
        .perm-item { padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px; cursor: pointer; transition: 0.15s; display: flex; align-items: center; gap: 6px; }
        .perm-item:hover { border-color: #6366f1; background: #eef2ff; }
        .perm-item input { margin: 0; }
        .settings-sidebar { width: 220px; border-right: 1px solid #e2e8f0; padding: 16px; float: left; height: 100%; min-height: 400px; }
        .settings-content { margin-left: 240px; padding: 0; }
        .sub-tab { display: block; padding: 10px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; color: #475569; margin-bottom: 4px; transition: 0.15s; }
        .sub-tab:hover { background: #f1f5f9; }
        .sub-tab.active { background: #eef2ff; color: #6366f1; font-weight: 600; }
        @media (max-width: 768px) { .admin-tabs { overflow-x: auto; flex-wrap: nowrap; } .admin-tab { white-space: nowrap; font-size: 11px; padding: 8px 12px; } .settings-sidebar { width: 100%; float: none; border-right: none; min-height: auto; } .settings-content { margin-left: 0; margin-top: 16px; } }
      </style>
      <div class="admin-wrap">
        <div class="admin-header">
          <div>
            <h4><i class="fas fa-shield-alt me-2"></i>${isPlatformAdmin ? 'Platform Administration' : 'Company Settings'}</h4>
            <p>${isPlatformAdmin ? 'Manage clients, users, roles, and platform settings' : 'Manage your team and company settings'}</p>
          </div>
          ${isPlatformAdmin ? `<div class="d-flex gap-3">
            <div class="text-center"><div style="font-size:22px;font-weight:800;">${pendingCount}</div><small style="color:#94a3b8;">Pending</small></div>
            <div class="text-center"><div style="font-size:22px;font-weight:800;">${totalClients}</div><small style="color:#94a3b8;">Clients</small></div>
            <div class="text-center"><div style="font-size:22px;font-weight:800;">${totalUsers}</div><small style="color:#94a3b8;">Users</small></div>
          </div>` : ''}
        </div>
        <div class="admin-tabs">
          ${tabs.map(t => `
            <button class="admin-tab ${this.currentTab===t.key?'active':''}" onclick="Admin.currentTab='${t.key}';Admin.render();">
              <i class="fas ${t.icon}"></i> ${t.label}
              ${t.key === 'approvals' && pendingCount > 0 ? `<span class="badge bg-danger" style="font-size:10px;">${pendingCount}</span>` : ''}
            </button>
          `).join('')}
        </div>
    `;

    if (this.currentTab === 'dashboard') html += await this.renderDashboard(isPlatformAdmin);
    else if (this.currentTab === 'approvals') html += await this.renderApprovals();
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
  async renderDashboard(isPlatform) {
    if (isPlatform) {
      let totalClients = 0, totalUsers = 0, totalLeads = 0, totalMessages = 0, pendingCount = 0, approvedCount = 0;
      try {
        const [clientsSnap, usersSnap, leadsSnap, messagesSnap] = await Promise.all([
          db.collection('clients').get(), db.collection('users').get(),
          db.collection('leads').get(), db.collection('messages').get()
        ]);
        totalClients = clientsSnap.size;
        totalUsers = usersSnap.size;
        totalLeads = leadsSnap.size;
        totalMessages = messagesSnap.size;
        clientsSnap.forEach(d => {
          if (d.data().status === 'pending') pendingCount++;
          if (d.data().status === 'approved') approvedCount++;
        });
      } catch(e) {}

      return `
        <div class="row g-3 mb-4">
          <div class="col-6 col-md-4 col-lg-2"><div class="admin-stat"><div class="val" style="color:#6366f1;">${totalClients}</div><div class="lbl">Total Clients</div></div></div>
          <div class="col-6 col-md-4 col-lg-2"><div class="admin-stat"><div class="val" style="color:#f59e0b;">${pendingCount}</div><div class="lbl">Pending</div></div></div>
          <div class="col-6 col-md-4 col-lg-2"><div class="admin-stat"><div class="val" style="color:#10b981;">${approvedCount}</div><div class="lbl">Approved</div></div></div>
          <div class="col-6 col-md-4 col-lg-2"><div class="admin-stat"><div class="val" style="color:#8b5cf6;">${totalUsers}</div><div class="lbl">Total Users</div></div></div>
          <div class="col-6 col-md-4 col-lg-2"><div class="admin-stat"><div class="val" style="color:#06b6d4;">${totalLeads}</div><div class="lbl">Total Leads</div></div></div>
          <div class="col-6 col-md-4 col-lg-2"><div class="admin-stat"><div class="val" style="color:#ec4899;">${totalMessages}</div><div class="lbl">Messages</div></div></div>
        </div>
        <div class="admin-card">
          <h5><i class="fas fa-clock me-2"></i>Recent Pending Approvals</h5>
          <div id="dashboardPendingList">Loading...</div>
        </div>
        <script>
          (async () => {
            const snap = await db.collection('clients').where('status', '==', 'pending').orderBy('createdAt', 'desc').limit(5).get();
            const pending = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            const el = document.getElementById('dashboardPendingList');
            if (!el) return;
            if (pending.length === 0) { el.innerHTML = '<p class="text-muted">No pending approvals.</p>'; return; }
            el.innerHTML = '<table class="admin-table"><thead><tr><th>Company</th><th>Email</th><th>Plan</th><th>Date</th><th>Action</th></tr></thead><tbody>' +
              pending.map(c => '<tr><td><strong>'+(c.companyName||'N/A')+'</strong></td><td>'+(c.email||'-')+'</td><td>'+(c.planId||'Free')+'</td><td>'+(c.createdAt?.toDate().toLocaleDateString()||'-')+'</td>' +
                '<td><button class="admin-btn admin-btn-success" onclick="Admin.showApprovalModal(\''+c.id+'\')">Approve</button></td></tr>').join('') + '</tbody></table>';
          })();
        </script>`;
    } else {
      const clientId = window.currentUser?.clientId;
      let users = 0, leads = 0;
      try {
        users = (await db.collection('users').where('clientId','==',clientId).get()).size;
        leads = (await db.collection('leads').where('clientId','==',clientId).get()).size;
      } catch(e) {}
      return `
        <div class="row g-3 mb-4">
          <div class="col-6 col-md-4"><div class="admin-stat"><div class="val" style="color:#6366f1;">${users}</div><div class="lbl">Team Members</div></div></div>
          <div class="col-6 col-md-4"><div class="admin-stat"><div class="val" style="color:#10b981;">${leads}</div><div class="lbl">Total Leads</div></div></div>
          <div class="col-6 col-md-4"><div class="admin-stat"><div class="val" style="color:#f59e0b;">${window.currentUser?.plan||'Free'}</div><div class="lbl">Current Plan</div></div></div>
        </div>`;
    }
  },

  // ==================== PENDING APPROVALS ====================
  async renderApprovals() {
    if (!Permissions.canAccess('admin','manage')) return '';
    let pending = [];
    try {
      const snap = await db.collection('clients').where('status', '==', 'pending').orderBy('createdAt', 'desc').get();
      pending = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) {}

    let html = '<div class="admin-card"><div class="d-flex justify-content-between align-items-center mb-3"><h5 class="mb-0">⏳ Pending Client Approvals</h5><span class="admin-badge" style="background:#fef3c7;color:#92400e;">'+pending.length+' Pending</span></div>';
    if (pending.length === 0) {
      html += '<div class="text-center py-5"><i class="fas fa-check-circle fa-3x text-success mb-3"></i><h6>All Clear!</h6><p class="text-muted">No pending approvals at the moment.</p></div>';
    } else {
      html += '<table class="admin-table"><thead><tr><th>Company</th><th>Contact</th><th>Email</th><th>Plan</th><th>Modules</th><th>Date</th><th>Actions</th></tr></thead><tbody>';
      pending.forEach(c => {
        html += '<tr><td><strong>'+(c.companyName||'Unnamed')+'</strong></td><td>'+(c.contactName||'-')+'</td><td>'+(c.email||'-')+'</td>'+
          '<td><span class="admin-badge" style="background:#eef2ff;color:#6366f1;">'+(c.planId||'Free')+'</span></td>'+
          '<td>'+((c.modules||[]).slice(0,3).join(', '))+((c.modules||[]).length > 3 ? ' +'+(c.modules.length-3) : '')+'</td>'+
          '<td style="font-size:12px;">'+(c.createdAt?.toDate().toLocaleDateString()||'-')+'</td>'+
          '<td><button class="admin-btn admin-btn-success" onclick="Admin.showApprovalModal(\''+c.id+'\')">✅ Approve</button>'+
          '<button class="admin-btn admin-btn-danger" onclick="Admin.rejectClient(\''+c.id+'\')" style="margin-left:4px;">❌ Reject</button></td></tr>';
      });
      html += '</tbody></table>';
    }
    html += '</div>';
    return html;
  },

  showApprovalModal(clientId) {
    db.collection('clients').doc(clientId).get().then(doc => {
      const client = doc.data();
      const currentModules = client.modules || [];
      const allModules = ['dashboard','leads','contacts','chats','campaigns','templates','flows','social','forms','kanban','knowledge','chatbot','ecommerce','appointments','analytics','tickets','integrations','agents','clients','marketing','setup','reports'];

      let moduleChecks = allModules.map(mod => '<div class="perm-item"><input type="checkbox" value="'+mod+'" class="approval-module" '+(currentModules.includes(mod)?'checked':'')+'> '+mod+'</div>').join('');

      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.innerHTML = '<div class="modal-box" onclick="event.stopPropagation()"><button class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()">×</button>'+
        '<h5 style="font-weight:700;margin-bottom:16px;">✅ Approve Client</h5>'+
        '<div class="row g-3 mb-3"><div class="col-md-6"><strong>Company:</strong> '+client.companyName+'</div><div class="col-md-6"><strong>Plan:</strong> '+client.planId+'</div>'+
        '<div class="col-md-6"><strong>Email:</strong> '+client.email+'</div><div class="col-md-6"><strong>Phone:</strong> '+(client.phone||'N/A')+'</div>'+
        '<div class="col-12"><strong>GST:</strong> '+(client.gst||'N/A')+'</div></div>'+
        '<h6 style="font-weight:600;">Assign Modules</h6><div class="perm-grid" style="max-height:250px;overflow-y:auto;">'+moduleChecks+'</div>'+
        '<button class="admin-btn admin-btn-success" style="width:100%;margin-top:16px;padding:10px;" onclick="Admin.approveWithModules(\''+clientId+'\')">💾 Save & Approve</button></div>';
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
      document.body.appendChild(modal);
    });
  },

  async approveWithModules(clientId) {
    const selectedModules = Array.from(document.querySelectorAll('.approval-module:checked')).map(cb => cb.value);
    
    // ✅ FIX: अगर प्लेटफ़ॉर्म ओनर ने कोई मॉड्यूल सेलेक्ट नहीं किया, तो कम से कम dashboard दे दो
    if (selectedModules.length === 0) {
        selectedModules.push('dashboard');
    }
    
    const permissions = {};
    selectedModules.forEach(mod => { permissions[mod] = { read: true, write: true }; });

    try {
      await db.collection('clients').doc(clientId).update({
        status: 'approved', modules: selectedModules, permissions: permissions,
        approvedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      const usersSnap = await db.collection('users').where('clientId', '==', clientId).get();
      const batch = db.batch();
      usersSnap.forEach(userDoc => { 
        batch.update(userDoc.ref, { 
          status: 'approved', 
          permissions: permissions 
        }); 
      });
      await batch.commit();

      document.querySelector('.modal-overlay')?.remove();
      alert('✅ Client approved with ' + selectedModules.length + ' modules!');
      this.render();
    } catch (err) { 
      alert('Error: ' + err.message); 
    }
  },

  async rejectClient(clientId) {
    if (!confirm('Reject this client? This will delete the client and all associated users.')) return;
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
      const snap = await db.collection('clients').orderBy('createdAt', 'desc').get();
      clients = snap.docs.map(d => ({id:d.id, ...d.data()}));
    } catch(e) {}

    let rows = clients.map(c => '<tr><td><strong>'+(c.companyName||'Unnamed')+'</strong></td><td>'+(c.email||'-')+'</td>'+
      '<td><span class="admin-badge" style="background:#eef2ff;color:#6366f1;">'+(c.planId||'Free')+'</span></td>'+
      '<td>'+((c.modules||[]).slice(0,3).join(', '))+((c.modules||[]).length > 3 ? ' +'+(c.modules.length-3) : '')+'</td>'+
      '<td><span class="admin-badge" style="background:'+(c.status==='approved'?'#ecfdf5':c.status==='pending'?'#fef3c7':'#f1f5f9')+';color:'+(c.status==='approved'?'#10b981':c.status==='pending'?'#92400e':'#64748b')+';">'+(c.status||'unknown')+'</span></td>'+
      '<td style="font-size:12px;">'+(c.createdAt?.toDate().toLocaleDateString()||'-')+'</td>'+
      '<td><button class="admin-btn admin-btn-outline" onclick="Admin.editClientModules(\''+c.id+'\')"><i class="fas fa-edit"></i></button>'+
      '<button class="admin-btn admin-btn-danger" onclick="Admin.deleteClient(\''+c.id+'\')" style="margin-left:4px;"><i class="fas fa-trash"></i></button></td></tr>').join('');

    return '<div class="admin-card"><div class="d-flex justify-content-between align-items-center mb-3"><h5 class="mb-0">🏢 All Clients</h5><span class="admin-badge" style="background:#eef2ff;color:#6366f1;">'+clients.length+' Total</span></div>'+
      '<input type="text" class="admin-search mb-3" placeholder="🔍 Search clients..." id="clientSearch" oninput="Admin.filterTable(\'clientsTable\', this.value)">'+
      '<div class="table-responsive"><table class="admin-table" id="clientsTable"><thead><tr><th>Name</th><th>Email</th><th>Plan</th><th>Modules</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>'+
      '<tbody>'+(rows||'<tr><td colspan="7" class="text-center text-muted py-4">No clients found</td></tr>')+'</tbody></table></div></div>';
  },

  async editClientModules(clientId) {
    const doc = await db.collection('clients').doc(clientId).get();
    if (!doc.exists) return alert('Client not found');
    const client = doc.data();
    const currentModules = client.modules || [];
    const allModules = ['dashboard','leads','contacts','chats','campaigns','templates','flows','social','forms','kanban','knowledge','chatbot','ecommerce','appointments','analytics','tickets','integrations','agents','clients','marketing','setup','reports'];

    let checks = allModules.map(mod => '<div class="perm-item"><input type="checkbox" value="'+mod+'" class="edit-client-module" '+(currentModules.includes(mod)?'checked':'')+'> '+mod+'</div>').join('');

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = '<div class="modal-box" onclick="event.stopPropagation()"><button class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()">×</button>'+
      '<h5 style="font-weight:700;">Edit Modules: '+client.companyName+'</h5><div class="perm-grid" style="max-height:300px;overflow-y:auto;">'+checks+'</div>'+
      '<button class="admin-btn admin-btn-primary" style="width:100%;margin-top:16px;padding:10px;" onclick="Admin.updateClientModules(\''+clientId+'\')">💾 Update Modules</button></div>';
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
  },

  async updateClientModules(clientId) {
    const selectedModules = Array.from(document.querySelectorAll('.edit-client-module:checked')).map(cb => cb.value);
    const permissions = {};
    selectedModules.forEach(mod => { permissions[mod] = { read: true, write: true }; });

    try {
      await db.collection('clients').doc(clientId).update({ modules: selectedModules, permissions: permissions });
      const usersSnap = await db.collection('users').where('clientId', '==', clientId).get();
      const batch = db.batch();
      usersSnap.forEach(userDoc => { batch.update(userDoc.ref, { permissions: permissions }); });
      await batch.commit();
      document.querySelector('.modal-overlay')?.remove();
      alert('✅ Modules updated successfully!');
      this.render();
    } catch (err) { alert('Error: ' + err.message); }
  },

  async deleteClient(id) {
    if (!confirm('Delete this client and all associated users?')) return;
    const usersSnap = await db.collection('users').where('clientId', '==', id).get();
    const batch = db.batch();
    usersSnap.forEach(doc => batch.delete(doc.ref));
    batch.delete(db.collection('clients').doc(id));
    await batch.commit();
    alert('✅ Client deleted.');
    this.render();
  },

  filterTable(tableId, query) {
    const rows = document.querySelectorAll('#'+tableId+' tbody tr');
    const q = query.toLowerCase();
    rows.forEach(row => { row.style.display = row.innerText.toLowerCase().includes(q) ? '' : 'none'; });
  },

  // ==================== USERS ====================
  async renderUsers() {
    const isPlatform = Permissions.canAccess('admin','manage');
    const clientId = window.currentUser?.clientId;
    let users = [];
    try {
      let query = db.collection('users');
      
      // ✅ FIX: Platform admin — सिर्फ platform roles वाले users
      if (isPlatform) {
        query = query.where('role', 'in', ['platform_owner', 'platform_super_admin', 'admin']);
      } else if (clientId) {
        query = query.where('clientId', '==', clientId);
      }
      
      const snap = await query.orderBy('name').get();
      users = snap.docs.map(d => ({id:d.id, ...d.data()}));
    } catch(e) {}

    let rows = users.map(u => '<tr><td>'+(u.name||'')+'</td><td>'+(u.email||'')+'</td><td>'+(u.phone||'')+'</td>'+
      '<td><span class="admin-badge" style="background:#eef2ff;color:#6366f1;">'+(u.role||'')+'</span></td>'+
      '<td><span class="admin-badge" style="background:'+(u.status==='approved'?'#ecfdf5':u.status==='pending'?'#fef3c7':'#f1f5f9')+';color:'+(u.status==='approved'?'#10b981':u.status==='pending'?'#92400e':'#64748b')+';">'+(u.status||'active')+'</span></td>'+
      '<td><button class="admin-btn admin-btn-outline" onclick="Admin.showUserForm(\''+u.id+'\')"><i class="fas fa-edit"></i></button>'+
      '<button class="admin-btn admin-btn-danger" onclick="Admin.deleteUser(\''+u.id+'\')" style="margin-left:4px;"><i class="fas fa-trash"></i></button></td></tr>').join('');

    return '<div class="admin-card"><div class="d-flex justify-content-between align-items-center mb-3"><h5 class="mb-0">👥 User Management</h5>'+
      '<button class="admin-btn admin-btn-primary" onclick="Admin.showUserForm()"><i class="fas fa-plus"></i> Add User</button></div>'+
      '<input type="text" class="admin-search mb-3" placeholder="🔍 Search users..." id="userSearch" oninput="Admin.filterTable(\'usersTable\', this.value)">'+
      '<div class="table-responsive"><table class="admin-table" id="usersTable"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>'+
      '<tbody>'+(rows||'<tr><td colspan="6" class="text-center text-muted py-4">No users found</td></tr>')+'</tbody></table></div></div>';
  },

  showUserForm(editId = null) {
    const loadForm = async () => {
      let user = { name:'', email:'', phone:'', role:'executive', status:'active', clientId: window.currentUser?.clientId || null };
      if (editId) {
        const doc = await db.collection('users').doc(editId).get();
        if (doc.exists) user = doc.data();
      }

      let roles = [];
      // ✅ FIX: Platform admin को सिर्फ platform roles
      if (Permissions.canAccess('admin','manage')) {
        roles = ['platform_super_admin', 'admin'];
      } else {
        const clientId = window.currentUser?.clientId;
        if (clientId) {
          const snap = await db.collection('clients').doc(clientId).collection('roles').get();
          roles = snap.docs.map(d => d.id);
        }
        if (!roles || roles.length === 0) roles = ['client_admin', 'manager', 'executive', 'viewer'];
      }
      const roleOptions = roles.map(r => '<option value="'+r+'" '+(user.role===r?'selected':'')+'>'+r+'</option>').join('');

      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.innerHTML = '<div class="modal-box" style="max-width:500px;" onclick="event.stopPropagation()"><button class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()">×</button>'+
        '<h5 style="font-weight:700;">'+(editId?'Edit':'Add')+' User</h5>'+
        '<input id="uName" class="form-control form-control-sm mb-2" placeholder="Full Name" value="'+(user.name||'')+'" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px;">'+
        '<input id="uEmail" class="form-control form-control-sm mb-2" placeholder="Email" value="'+(user.email||'')+'" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px;">'+
        '<input id="uPhone" class="form-control form-control-sm mb-2" placeholder="Phone" value="'+(user.phone||'')+'" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px;">'+
        '<select id="uRole" class="form-select form-select-sm mb-2" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px;">'+roleOptions+'</select>'+
        '<select id="uStatus" class="form-select form-select-sm mb-2" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px;">'+
        '<option value="active" '+(user.status==='active'?'selected':'')+'>Active</option><option value="inactive" '+(user.status==='inactive'?'selected':'')+'>Inactive</option></select>'+
        '<button class="admin-btn admin-btn-primary" style="width:100%;padding:10px;" onclick="Admin.saveUser(\''+(editId||'')+'\')">💾 Save</button></div>';
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
      document.querySelector('.modal-overlay')?.remove();
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

    let cards = roles.map(role => '<div class="perm-item" style="flex-direction:column;align-items:flex-start;gap:8px;">'+
      '<div><strong>'+(role.name||'Unnamed')+'</strong> <span class="admin-badge" style="background:'+(role.isPlatformRole?'#eef2ff':'#f1f5f9')+';color:'+(role.isPlatformRole?'#6366f1':'#64748b')+';">L'+(role.level||'?')+'</span></div>'+
      '<div style="font-size:11px;color:#64748b;">Modules: '+Object.keys(role.modules||{}).length+'</div>'+
      '<div><button class="admin-btn admin-btn-outline" onclick="Admin.showRoleForm(\''+role.id+'\', '+isPlatform+')"><i class="fas fa-edit"></i></button>'+
      ((!role.isPlatformRole || !DEFAULT_ROLES[role.id]) ? '<button class="admin-btn admin-btn-danger" onclick="Admin.deleteRole(\''+role.id+'\', '+isPlatform+')" style="margin-left:4px;"><i class="fas fa-trash"></i></button>' : '')+'</div></div>').join('');

    return '<div class="admin-card"><div class="d-flex justify-content-between align-items-center mb-3"><h5 class="mb-0">🔐 Role Management</h5>'+
      '<button class="admin-btn admin-btn-primary" onclick="Admin.showRoleForm(null, '+isPlatform+')"><i class="fas fa-plus"></i> Create Role</button></div>'+
      '<div class="perm-grid">'+(cards||'<p class="text-muted">No roles defined yet.</p>')+'</div></div>';
  },

  showRoleForm(roleId = null, isPlatform = true) {
    const loadForm = async () => {
      let role = { name: '', level: 5, isPlatformRole: false, modules: {} };
      if (roleId) {
        let doc;
        if (isPlatform) doc = await db.collection('roles').doc(roleId).get();
        else { const clientId = window.currentUser?.clientId; doc = await db.collection('clients').doc(clientId).collection('roles').doc(roleId).get(); }
        if (doc && doc.exists) role = doc.data();
      }

      let visibleModules = [];
      if (isPlatform) visibleModules = Object.keys(DEFAULT_ROLES.platform_owner.modules);
      else { const clientId = window.currentUser?.clientId; const clientDoc = await db.collection('clients').doc(clientId).get(); const clientData = clientDoc.data() || {}; visibleModules = clientData.modules || Object.keys(DEFAULT_ROLES.platform_owner.modules); }

      let moduleChecks = visibleModules.map(mod => '<div class="perm-item" style="flex-direction:column;align-items:flex-start;gap:4px;"><strong style="font-size:12px;">'+mod+'</strong><div>'+
        ['create','read','update','delete'].map(action => '<label style="font-size:11px;margin-right:8px;cursor:pointer;"><input type="checkbox" class="perm-checkbox" data-module="'+mod+'" data-action="'+action+'" '+(role.modules?.[mod]?.[action]?'checked':'')+'> '+action+'</label>').join('')+'</div></div>').join('');

      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.innerHTML = '<div class="modal-box" onclick="event.stopPropagation()"><button class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()">×</button>'+
        '<h5 style="font-weight:700;">'+(roleId?'Edit':'Create')+' Role</h5>'+
        '<input id="rName" class="form-control form-control-sm mb-2" placeholder="Role Name" value="'+(role.name||'')+'" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px;">'+
        '<select id="rLevel" class="form-select form-select-sm mb-2" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px;">'+
        '<option value="2" '+(role.level===2?'selected':'')+'>Client Owner</option><option value="3" '+(role.level===3?'selected':'')+'>Admin</option><option value="4" '+(role.level===4?'selected':'')+'>Manager</option><option value="5" '+(role.level===5?'selected':'')+'>Executive</option></select>'+
        '<div class="form-check mb-2"><input class="form-check-input" type="checkbox" id="rPlatform" '+(role.isPlatformRole?'checked':'')+'><label>Platform Role</label></div>'+
        '<h6>Module Permissions</h6><div class="perm-grid" style="max-height:300px;overflow-y:auto;">'+moduleChecks+'</div>'+
        '<button class="admin-btn admin-btn-primary" style="width:100%;margin-top:16px;padding:10px;" onclick="Admin.saveRole(\''+(roleId||'')+'\', '+isPlatform+')">💾 Save Role</button></div>';
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
    document.querySelectorAll('.modal-box .perm-item').forEach(div => {
      const modName = div.querySelector('strong')?.innerText;
      if (!modName) return;
      modules[modName] = {};
      div.querySelectorAll('input[type=checkbox]').forEach(cb => {
        if (cb.dataset.action) modules[modName][cb.dataset.action] = cb.checked;
      });
    });
    const data = { name, level, isPlatformRole, modules };
    try {
      if (isPlatform) await db.collection('roles').doc(roleId || name.toLowerCase().replace(/\s/g,'_')).set(data, {merge: true});
      else { const clientId = window.currentUser?.clientId; await db.collection('clients').doc(clientId).collection('roles').doc(roleId || name.toLowerCase().replace(/\s/g,'_')).set(data, {merge: true}); }
      document.querySelector('.modal-overlay')?.remove();
      this.render();
    } catch(e) { alert(e.message); }
  },

  async deleteRole(roleId, isPlatform) {
    if (!confirm('Delete this role?')) return;
    if (isPlatform) await db.collection('roles').doc(roleId).delete();
    else { const clientId = window.currentUser?.clientId; await db.collection('clients').doc(clientId).collection('roles').doc(roleId).delete(); }
    this.render();
  },

  // ==================== PLANS ====================
  async renderPlans() {
    if (!Permissions.canAccess('admin','manage')) return '';
    let plans = [];
    try { const snap = await db.collection('plans').get(); plans = snap.docs.map(d => ({id:d.id, ...d.data()})); } catch(e) {}

    let rows = plans.map(p => '<tr><td><strong>'+(p.name||'')+'</strong></td><td>₹'+(p.price||0)+'</td>'+
      '<td>'+((p.modules||[]).slice(0,3).join(', '))+((p.modules||[]).length > 3 ? ' +'+(p.modules.length-3) : '')+'</td><td>'+(p.maxUsers||'-')+'</td>'+
      '<td><button class="admin-btn admin-btn-outline" onclick="Admin.showPlanForm(\''+p.id+'\')"><i class="fas fa-edit"></i></button>'+
      '<button class="admin-btn admin-btn-danger" onclick="Admin.deletePlan(\''+p.id+'\')" style="margin-left:4px;"><i class="fas fa-trash"></i></button></td></tr>').join('');

    return '<div class="admin-card"><div class="d-flex justify-content-between align-items-center mb-3"><h5 class="mb-0">💳 Subscription Plans</h5>'+
      '<button class="admin-btn admin-btn-primary" onclick="Admin.showPlanForm()"><i class="fas fa-plus"></i> Create Plan</button></div>'+
      '<div class="table-responsive"><table class="admin-table"><thead><tr><th>Name</th><th>Price</th><th>Modules</th><th>Max Users</th><th>Actions</th></tr></thead>'+
      '<tbody>'+(rows||'<tr><td colspan="5" class="text-center text-muted py-4">No plans yet</td></tr>')+'</tbody></table></div></div>';
  },

  showPlanForm(editId = null) {
    const loadForm = async () => {
      let plan = { name: '', price: 0, modules: [], maxUsers: 10 };
      if (editId) { const doc = await db.collection('plans').doc(editId).get(); if (doc.exists) plan = doc.data(); }
      const allModules = Object.keys(DEFAULT_ROLES.platform_owner.modules);
      let moduleChecks = allModules.map(mod => '<div class="perm-item"><input type="checkbox" value="'+mod+'" '+(plan.modules||[]).includes(mod)?'checked':''+'> '+mod+'</div>').join('');

      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.innerHTML = '<div class="modal-box" onclick="event.stopPropagation()"><button class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()">×</button>'+
        '<h5 style="font-weight:700;">'+(editId?'Edit':'Create')+' Plan</h5>'+
        '<input id="pName" class="form-control form-control-sm mb-2" placeholder="Plan Name" value="'+(plan.name||'')+'" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px;">'+
        '<input id="pPrice" type="number" class="form-control form-control-sm mb-2" placeholder="Price (₹)" value="'+(plan.price||0)+'" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px;">'+
        '<input id="pMaxUsers" type="number" class="form-control form-control-sm mb-2" placeholder="Max Users" value="'+(plan.maxUsers||10)+'" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px;">'+
        '<h6>Included Modules</h6><div class="perm-grid" style="max-height:300px;overflow-y:auto;">'+moduleChecks+'</div>'+
        '<button class="admin-btn admin-btn-primary" style="width:100%;margin-top:16px;padding:10px;" onclick="Admin.savePlan(\''+(editId||'')+'\')">💾 Save Plan</button></div>';
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
    const modules = Array.from(document.querySelectorAll('.modal-box input[type=checkbox]:checked')).map(cb => cb.value);
    const data = { name, price, maxUsers, modules };
    try {
      if (editId) await db.collection('plans').doc(editId).update(data);
      else await db.collection('plans').add(data);
      document.querySelector('.modal-overlay')?.remove();
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
      { key:'profile', label:'Company Profile', icon:'fa-building' },
      { key:'preferences', label:'Preferences', icon:'fa-sliders-h' },
      { key:'pipeline', label:'Pipeline', icon:'fa-tasks' },
      { key:'leadColumns', label:'Manage Columns', icon:'fa-columns' },
      { key:'customProperties', label:'Custom Properties', icon:'fa-cogs' },
      { key:'notifications', label:'Notifications', icon:'fa-bell' },
      { key:'reports', label:'Automatic Reports', icon:'fa-file-alt' },
    ];

    let html = '<div class="row"><div class="col-md-3"><div class="admin-card" style="padding:16px;">';
    subTabs.forEach(st => {
      html += '<div class="sub-tab '+(this.currentSettingsTab===st.key?'active':'')+'" onclick="Admin.currentSettingsTab=\''+st.key+'\';Admin.renderSettingsContent();"><i class="fas '+st.icon+' me-2"></i>'+st.label+'</div>';
    });
    html += '</div><div class="col-md-9" id="settingsContent"></div></div>';
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

  async settingsProfile() {
    let profile = {};
    try { const doc = await db.collection('settings').doc('company_profile').get(); if (doc.exists) profile = doc.data(); } catch(e) {}
    return '<div class="admin-card"><h5>Company Details</h5><div class="row g-2">'+
      '<div class="col-md-6"><input id="compName" class="form-control form-control-sm" placeholder="Company Name" value="'+(profile.name||'')+'" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px;"></div>'+
      '<div class="col-md-6"><input id="compPhone" class="form-control form-control-sm" placeholder="Phone" value="'+(profile.phone||'')+'" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px;"></div>'+
      '<div class="col-12"><input id="compAddress" class="form-control form-control-sm" placeholder="Address" value="'+(profile.address||'')+'" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px;"></div>'+
      '<div class="col-md-4"><input id="compGST" class="form-control form-control-sm" placeholder="GST No" value="'+(profile.gst||'')+'" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px;"></div>'+
      '<div class="col-md-4"><input id="compState" class="form-control form-control-sm" placeholder="State" value="'+(profile.state||'')+'" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px;"></div>'+
      '<div class="col-md-4"><input id="compPincode" class="form-control form-control-sm" placeholder="Pincode" value="'+(profile.pincode||'')+'" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px;"></div></div>'+
      '<button class="admin-btn admin-btn-primary mt-3" onclick="Admin.saveProfile()">💾 Save</button></div>';
  },

  async saveProfile() {
    const data = { name: document.getElementById('compName')?.value, phone: document.getElementById('compPhone')?.value, address: document.getElementById('compAddress')?.value, gst: document.getElementById('compGST')?.value, state: document.getElementById('compState')?.value, pincode: document.getElementById('compPincode')?.value };
    await db.collection('settings').doc('company_profile').set(data, {merge:true});
    alert('Profile saved');
  },

  settingsPreferences() { return '<div class="admin-card"><h5>Preferences</h5><p class="text-muted">Currency, call settings, etc. (Coming soon)</p></div>'; },

  async settingsPipeline() {
    let pipeline = { stages: [] };
    try { const doc = await db.collection('settings').doc('pipeline').get(); if (doc.exists) pipeline = doc.data(); } catch(e) {}
    let stagesHtml = (pipeline.stages||[]).map((s,i) => '<div class="input-group mb-2"><input class="form-control form-control-sm" value="'+s+'" onchange="Admin.pipelineStages['+i+']=this.value" style="padding:8px;border:1px solid #e2e8f0;border-radius:8px;"><button class="admin-btn admin-btn-danger" onclick="Admin.pipelineStages.splice('+i+',1);Admin.renderSettingsContent()">×</button></div>').join('');
    if (!window.Admin) window.Admin = {};
    Admin.pipelineStages = [...(pipeline.stages||[])];
    return '<div class="admin-card"><h5>Sales Pipeline Stages</h5><div id="pipelineStages">'+stagesHtml+'</div>'+
      '<button class="admin-btn admin-btn-outline mt-2" onclick="Admin.pipelineStages.push(\'New Stage\');Admin.renderSettingsContent()">+ Add Stage</button>'+
      '<button class="admin-btn admin-btn-primary mt-2" onclick="Admin.savePipeline()" style="margin-left:8px;">💾 Save</button></div>';
  },

  async savePipeline() { await db.collection('settings').doc('pipeline').set({ stages: Admin.pipelineStages }, {merge:true}); alert('Pipeline stages saved'); },

  settingsLeadColumns() { return '<div class="admin-card"><h5>Lead Table Columns</h5><p class="text-muted">Drag and drop columns (Coming soon).</p></div>'; },

  async settingsCustomProperties() {
    let fields = [];
    try { const snap = await db.collection('contactFields').get(); fields = snap.docs.map(d => ({id:d.id, ...d.data()})); } catch(e) {}
    let rows = fields.map(f => '<tr><td>'+f.name+'</td><td>'+f.type+'</td><td><button class="admin-btn admin-btn-danger" onclick="Admin.deleteField(\''+f.id+'\')"><i class="fas fa-trash"></i></button></td></tr>').join('');
    return '<div class="admin-card"><h5>Custom Contact Properties</h5><button class="admin-btn admin-btn-primary mb-3" onclick="Admin.showFieldForm()"><i class="fas fa-plus"></i> Add Property</button>'+
      '<div class="table-responsive"><table class="admin-table"><thead><tr><th>Name</th><th>Type</th><th>Action</th></tr></thead><tbody>'+(rows||'<tr><td colspan="3" class="text-muted">No custom fields</td></tr>')+'</tbody></table></div></div>';
  },

  showFieldForm() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = '<div class="modal-box" style="max-width:400px;" onclick="event.stopPropagation()"><button class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()">×</button>'+
      '<h5 style="font-weight:700;">Add Custom Property</h5><input id="fName" class="form-control form-control-sm mb-2" placeholder="Property Name" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px;">'+
      '<select id="fType" class="form-select form-select-sm mb-2" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px;"><option value="text">Text</option><option value="number">Number</option><option value="date">Date</option></select>'+
      '<button class="admin-btn admin-btn-primary" onclick="Admin.saveField()">💾 Save</button></div>';
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
  },

  async saveField() {
    const name = document.getElementById('fName')?.value?.trim();
    const type = document.getElementById('fType')?.value;
    if (!name) return alert('Name required');
    await db.collection('contactFields').add({ name, type, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    document.querySelector('.modal-overlay')?.remove();
    this.renderSettingsContent();
  },

  async deleteField(id) { if (!confirm('Delete?')) return; await db.collection('contactFields').doc(id).delete(); this.renderSettingsContent(); },

  settingsNotifications() {
    (async () => {
      const doc = await db.collection('settings').doc('notification_preferences').get();
      const prefs = doc.exists ? doc.data() : {};
      const events = [{ id: 'lead_creation', label: 'Lead Creation' },{ id: 'lead_assignment', label: 'Lead Assignment' },{ id: 'follow_up_reminder', label: 'Follow‑up Reminder' },{ id: 'missed_call', label: 'Missed Call Alert' },{ id: 'whatsapp_msg', label: 'WhatsApp Message Received' },{ id: 'task_assigned', label: 'Task Assigned' }];
      const channels = ['push','in_app','email','whatsapp'];
      const roles = ['admin','manager','executive'];
      let html = '<div class="admin-card"><h5>Notification Preferences</h5><div class="table-responsive"><table class="admin-table"><thead><tr><th>Event</th><th>Recipient</th>'+channels.map(c=>'<th>'+c.replace(/_/g,' ')+'</th>').join('')+'</tr></thead><tbody>';
      events.forEach(ev => { roles.forEach(role => { html += '<tr><td>'+ev.label+'</td><td>'+role+'</td>'; channels.forEach(ch => { const key = ev.id+'_'+role+'_'+ch; const checked = prefs[key] ? 'checked' : ''; html += '<td><input type="checkbox" class="notif-check" data-key="'+key+'" '+checked+'></td>'; }); html += '</tr>'; }); });
      html += '</tbody></table></div><button class="admin-btn admin-btn-primary mt-3" onclick="Admin.saveNotificationPrefs()">💾 Save</button></div>';
      document.getElementById('settingsContent').innerHTML = html;
    })();
    return '<div class="admin-card"><p>Loading...</p></div>';
  },

  saveNotificationPrefs() { const prefs = {}; document.querySelectorAll('.notif-check').forEach(cb => { prefs[cb.dataset.key] = cb.checked; }); db.collection('settings').doc('notification_preferences').set(prefs, {merge:true}).then(() => alert('Notification preferences saved!')); },

  settingsReports() {
    (async () => {
      const doc = await db.collection('settings').doc('automatic_reports').get();
      const data = doc.exists ? doc.data() : { frequency:'weekly', email:true, whatsapp:false };
      const html = '<div class="admin-card"><h5>Automatic Reports</h5><div class="mb-3"><label class="form-label">Frequency</label><select id="reportFrequency" class="form-select form-select-sm" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px;"><option value="daily" '+(data.frequency==='daily'?'selected':'')+'>Daily</option><option value="weekly" '+(data.frequency==='weekly'?'selected':'')+'>Weekly</option><option value="monthly" '+(data.frequency==='monthly'?'selected':'')+'>Monthly</option></select></div>'+
        '<div class="form-check mb-2"><input class="form-check-input" type="checkbox" id="reportEmail" '+(data.email?'checked':'')+'><label class="form-check-label">Send via Email</label></div>'+
        '<div class="form-check mb-2"><input class="form-check-input" type="checkbox" id="reportWhatsapp" '+(data.whatsapp?'checked':'')+'><label class="form-check-label">Send via WhatsApp</label></div>'+
        '<button class="admin-btn admin-btn-primary" onclick="Admin.saveReportSettings()">💾 Save</button></div>';
      document.getElementById('settingsContent').innerHTML = html;
    })();
    return '<div class="admin-card"><p>Loading...</p></div>';
  },

  saveReportSettings() { const data = { frequency: document.getElementById('reportFrequency').value, email: document.getElementById('reportEmail').checked, whatsapp: document.getElementById('reportWhatsapp').checked }; db.collection('settings').doc('automatic_reports').set(data, {merge:true}).then(() => alert('Report settings saved!')); },

  // ==================== SUBSCRIPTION (Client) ====================
  async renderSubscription() {
    return '<div class="admin-card"><h5>💳 Current Plan</h5><p>Your company is on the <strong>'+(window.currentUser?.plan||'Free')+'</strong> plan.</p></div>';
  }
};
