// js/agents.js — Next-Level Team Management for SaaS Platform
const Agents = {
  currentTab: 'list',
  editingAgent: null,
  searchQuery: '',
  filterRole: 'all',
  filterStatus: 'all',
  sortBy: 'name',

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = '#f8fafc';

    if (this.currentTab === 'invite') { await this.renderInvite(); return; }
    if (this.currentTab === 'performance') { await this.renderPerformance(); return; }
    await this.renderList();
  },

  // ==================== MAIN TEAM LIST ====================
  async renderList() {
    let users = [];
    let totalLeads = 0, totalContacts = 0;
    try {
      let query = db.collection('users');
      
      // ✅ NEW: Platform admin — सिर्फ platform roles दिखाओ (client_owner नहीं)
      if (isPlatformAdmin()) {
        query = query.where('role', 'in', ['platform_owner', 'platform_super_admin', 'admin']);
      } 
      // ✅ NEW: Client user — अपनी company के users दिखाओ
      else if (window.currentUser.clientId) {
        query = query.where('clientId', '==', window.currentUser.clientId);
      }
      
      const snap = await query.orderBy('createdAt', 'desc').get();
      users = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Get lead counts per user
      let lQuery = db.collection('leads');
      if (shouldFilterByClient()) lQuery = lQuery.where('clientId', '==', window.currentUser.clientId);
      const leadsSnap = await lQuery.get();
      totalLeads = leadsSnap.size;
      leadsSnap.docs.forEach(d => {
        const assignedTo = d.data().assignedTo;
        if (assignedTo) {
          const user = users.find(u => u.id === assignedTo);
          if (user) user.assignedLeads = (user.assignedLeads || 0) + 1;
        }
      });
    } catch(e) { console.error(e); }

    // Apply filters
    let filteredUsers = [...users];
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filteredUsers = filteredUsers.filter(u => (u.name||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q));
    }
    if (this.filterRole !== 'all') {
      filteredUsers = filteredUsers.filter(u => u.role === this.filterRole);
    }
    if (this.filterStatus !== 'all') {
      filteredUsers = filteredUsers.filter(u => u.status === this.filterStatus);
    }

    // Sort
    if (this.sortBy === 'name') filteredUsers.sort((a,b) => (a.name||'').localeCompare(b.name||''));
    else if (this.sortBy === 'leads') filteredUsers.sort((a,b) => (b.assignedLeads||0) - (a.assignedLeads||0));
    else if (this.sortBy === 'recent') filteredUsers.sort((a,b) => (b.createdAt?.toDate()||0) - (a.createdAt?.toDate()||0));

    const total = users.length;
    const active = users.filter(u => u.status === 'active' || u.status === 'approved').length;
    const pending = users.filter(u => u.status === 'pending' || u.status === 'invited').length;
    const inactive = users.filter(u => u.status === 'inactive').length;

    const roles = [...new Set(users.map(u => u.role).filter(Boolean))];
    const statuses = [...new Set(users.map(u => u.status).filter(Boolean))];

    let html = `
      <style>
        .agents-wrap { max-width: 1400px; margin: 0 auto; }
        .agents-header { background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 20px; padding: 28px 32px; margin-bottom: 24px; color: #fff; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .agents-header h4 { margin: 0; font-weight: 800; font-size: 22px; }
        .agents-header p { margin: 4px 0 0; color: #94a3b8; font-size: 13px; }
        .agents-tabs { display: flex; gap: 4px; margin-bottom: 24px; background: #fff; border-radius: 16px; padding: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; }
        .agents-tab { padding: 10px 20px; border-radius: 12px; font-size: 13px; cursor: pointer; font-weight: 500; transition: all 0.2s; color: #64748b; display: flex; align-items: center; gap: 6px; border: none; background: transparent; }
        .agents-tab:hover { background: #f1f5f9; color: #0f172a; }
        .agents-tab.active { background: #6366f1; color: #fff; box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
        .agent-stat { background: #fff; border-radius: 14px; padding: 20px; text-align: center; border: 1px solid #f1f5f9; transition: 0.2s; cursor: pointer; }
        .agent-stat:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.06); transform: translateY(-2px); }
        .agent-stat .val { font-size: 32px; font-weight: 800; }
        .agent-stat .lbl { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
        .agent-card { background: #fff; border-radius: 14px; padding: 20px; border: 1px solid #f1f5f9; transition: 0.2s; display: flex; align-items: center; gap: 16px; margin-bottom: 10px; }
        .agent-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); border-color: #e2e8f0; }
        .agent-avatar { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 20px; flex-shrink: 0; }
        .agent-avatar.platform_owner, .agent-avatar.platform_super_admin { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .agent-avatar.client_owner { background: linear-gradient(135deg, #8b5cf6, #6366f1); }
        .agent-avatar.client_admin, .agent-avatar.admin { background: linear-gradient(135deg, #6366f1, #4f46e5); }
        .agent-avatar.manager { background: linear-gradient(135deg, #06b6d4, #0891b2); }
        .agent-avatar.executive, .agent-avatar.team { background: linear-gradient(135deg, #10b981, #059669); }
        .agent-avatar.client { background: linear-gradient(135deg, #ec4899, #db2777); }
        .agent-badge { padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; display: inline-block; }
        .agent-info { flex: 1; min-width: 0; }
        .agent-name { font-weight: 600; font-size: 15px; color: #0f172a; }
        .agent-meta { font-size: 12px; color: #64748b; margin-top: 2px; }
        .agent-stats-row { display: flex; gap: 20px; margin-top: 8px; }
        .agent-mini-stat { text-align: center; }
        .agent-mini-stat .n { font-size: 18px; font-weight: 700; }
        .agent-mini-stat .l { font-size: 9px; color: #94a3b8; text-transform: uppercase; }
        .agent-actions { display: flex; gap: 6px; flex-shrink: 0; }
        .agent-btn { padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; display: inline-flex; align-items: center; gap: 4px; }
        .agent-btn-primary { background: #6366f1; color: #fff; }
        .agent-btn-primary:hover { background: #4f46e5; }
        .agent-btn-outline { background: #fff; color: #6366f1; border: 1px solid #6366f1; }
        .agent-btn-outline:hover { background: #eef2ff; }
        .agent-btn-danger { background: #ef4444; color: #fff; }
        .agent-btn-danger:hover { background: #dc2626; }
        .agent-filters { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
        .agent-search { padding: 8px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13px; width: 220px; outline: none; }
        .agent-search:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .agent-filter-select { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 12px; outline: none; cursor: pointer; background: #fff; }
        .agent-filter-select:focus { border-color: #6366f1; }
        .invite-card { background: #fff; border-radius: 16px; padding: 28px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .invite-card h5 { font-weight: 700; font-size: 16px; color: #0f172a; margin-bottom: 20px; }
        .invite-input { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13px; margin-bottom: 12px; outline: none; }
        .invite-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .perm-grid-invite { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 6px; margin-bottom: 12px; }
        .perm-check-item { padding: 8px 10px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 11px; cursor: pointer; transition: 0.15s; display: flex; align-items: center; gap: 6px; }
        .perm-check-item:hover { border-color: #6366f1; background: #eef2ff; }
        .perm-check-item input { margin: 0; }
        @media (max-width: 768px) { .agent-actions { flex-direction: column; } .agent-stats-row { gap: 12px; } .agents-header { padding: 20px; } }
      </style>

      <div class="agents-wrap">
        <div class="agents-header">
          <div>
            <h4><i class="fas fa-user-tie me-2"></i>Team Management</h4>
            <p>Manage agents, assign leads, control permissions</p>
          </div>
          <div class="d-flex gap-3">
            <div class="text-center"><div style="font-size:22px;font-weight:800;">${total}</div><small style="color:#94a3b8;">Total</small></div>
            <div class="text-center"><div style="font-size:22px;font-weight:800;color:#10b981;">${active}</div><small style="color:#94a3b8;">Active</small></div>
            <div class="text-center"><div style="font-size:22px;font-weight:800;color:#f59e0b;">${pending}</div><small style="color:#94a3b8;">Pending</small></div>
          </div>
        </div>

        <div class="agents-tabs">
          <button class="agents-tab ${this.currentTab==='list'?'active':''}" onclick="Agents.currentTab='list';Agents.render();"><i class="fas fa-list"></i> Team List</button>
          <button class="agents-tab ${this.currentTab==='invite'?'active':''}" onclick="Agents.currentTab='invite';Agents.render();"><i class="fas fa-user-plus"></i> Invite Member</button>
          <button class="agents-tab ${this.currentTab==='performance'?'active':''}" onclick="Agents.currentTab='performance';Agents.render();"><i class="fas fa-chart-bar"></i> Performance</button>
        </div>

        <!-- Stats Row -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-md-3"><div class="agent-stat"><div class="val" style="color:#6366f1;">${total}</div><div class="lbl">Total Members</div></div></div>
          <div class="col-6 col-md-3"><div class="agent-stat"><div class="val" style="color:#10b981;">${active}</div><div class="lbl">Active</div></div></div>
          <div class="col-6 col-md-3"><div class="agent-stat"><div class="val" style="color:#f59e0b;">${pending}</div><div class="lbl">Pending</div></div></div>
          <div class="col-6 col-md-3"><div class="agent-stat"><div class="val" style="color:#ef4444;">${inactive}</div><div class="lbl">Inactive</div></div></div>
        </div>

        <!-- Filters -->
        <div class="agent-filters">
          <input type="text" class="agent-search" placeholder="🔍 Search by name or email..." id="agentSearch" value="${this.searchQuery}" oninput="Agents.searchQuery=this.value;Agents.render();">
          <select class="agent-filter-select" onchange="Agents.filterRole=this.value;Agents.render();">
            <option value="all">All Roles</option>
            ${roles.map(r => `<option value="${r}" ${this.filterRole===r?'selected':''}>${r.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</option>`).join('')}
          </select>
          <select class="agent-filter-select" onchange="Agents.filterStatus=this.value;Agents.render();">
            <option value="all">All Status</option>
            ${statuses.map(s => `<option value="${s}" ${this.filterStatus===s?'selected':''}>${s}</option>`).join('')}
          </select>
          <select class="agent-filter-select" onchange="Agents.sortBy=this.value;Agents.render();">
            <option value="name">Sort by Name</option>
            <option value="leads" ${this.sortBy==='leads'?'selected':''}>Sort by Leads</option>
            <option value="recent" ${this.sortBy==='recent'?'selected':''}>Sort by Recent</option>
          </select>
        </div>

        <!-- Team Cards -->
        <div id="agentFormContainer"></div>
        ${filteredUsers.length === 0 ? `
          <div class="text-center py-5">
            <i class="fas fa-users fa-3x text-muted mb-3"></i>
            <h5>No team members found</h5>
            <p class="text-muted">${this.searchQuery || this.filterRole !== 'all' ? 'Try adjusting your filters.' : 'Invite your first team member!'}</p>
            ${!this.searchQuery && this.filterRole === 'all' ? '<button class="agent-btn agent-btn-primary" onclick="Agents.currentTab=\'invite\';Agents.render();"><i class="fas fa-user-plus me-1"></i> Invite Member</button>' : ''}
          </div>
        ` : filteredUsers.map(u => `
          <div class="agent-card">
            <div class="agent-avatar ${u.role||'client'}">${(u.name||u.email||'?')[0].toUpperCase()}</div>
            <div class="agent-info">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="agent-name">${u.name||'Unnamed'} ${u.status==='invited'?'<span class="agent-badge" style="background:#fef3c7;color:#92400e;margin-left:6px;">Invited</span>':''}</div>
                  <div class="agent-meta">${u.email||'No email'} ${u.phone ? '· '+u.phone : ''}</div>
                  <div style="margin-top:4px;">
                    <span class="agent-badge" style="background:#eef2ff;color:#6366f1;">${(u.role||'client').replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</span>
                    <span class="agent-badge" style="background:${u.status==='approved'||u.status==='active'?'#ecfdf5':u.status==='pending'||u.status==='invited'?'#fef3c7':'#f1f5f9'};color:${u.status==='approved'||u.status==='active'?'#10b981':u.status==='pending'||u.status==='invited'?'#92400e':'#64748b'};margin-left:4px;">${u.status||'active'}</span>
                  </div>
                </div>
              </div>
              <div class="agent-stats-row">
                <div class="agent-mini-stat"><div class="n" style="color:#6366f1;">${u.assignedLeads||0}</div><div class="l">Leads</div></div>
                <div class="agent-mini-stat"><div class="n" style="color:#10b981;">${u.wonDeals||0}</div><div class="l">Won</div></div>
                <div class="agent-mini-stat"><div class="n" style="color:#f59e0b;">${u.assignedContacts||0}</div><div class="l">Contacts</div></div>
                <div class="agent-mini-stat"><div class="n" style="color:#8b5cf6;">${u.createdAt?.toDate().toLocaleDateString()||'-'}</div><div class="l">Joined</div></div>
              </div>
            </div>
            <div class="agent-actions">
              <button class="agent-btn agent-btn-outline" onclick="Agents.showEditForm('${u.id}')"><i class="fas fa-edit"></i></button>
              <button class="agent-btn agent-btn-outline" onclick="Agents.showPermissionsForm('${u.id}')"><i class="fas fa-shield-alt"></i></button>
              <button class="agent-btn agent-btn-danger" onclick="Agents.removeAgent('${u.id}','${u.name||u.email}')"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        `).join('')}

        <div id="agentModal"></div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  // ==================== INVITE ====================
  async renderInvite() {
    let contacts = [];
    try {
      let query = db.collection('contacts');
      if (shouldFilterByClient()) query = query.where('clientId', '==', window.currentUser.clientId);
      const snap = await query.orderBy('firstName').get();
      contacts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) {}

    const allModules = ['dashboard','leads','contacts','chats','campaigns','templates','flows','social','forms','kanban','knowledge','chatbot','ecommerce','appointments','analytics','tickets','integrations','agents','clients','marketing','setup','reports'];
    const moduleChecks = allModules.map(mod => `<div class="perm-check-item"><input type="checkbox" value="${mod}" class="invite-module" checked> ${mod}</div>`).join('');

    let html = `
      <div class="agents-wrap">
        <div class="d-flex align-items-center mb-4">
          <button class="agent-btn agent-btn-outline me-3" onclick="Agents.currentTab='list';Agents.render();"><i class="fas fa-arrow-left me-1"></i> Back</button>
          <div>
            <h4 class="mb-0" style="font-weight:800;">📨 Invite Team Member</h4>
            <small class="text-muted">Send invitation and assign role & permissions</small>
          </div>
        </div>

        <div class="row g-4">
          <div class="col-lg-7">
            <div class="invite-card">
              <h5><i class="fas fa-envelope me-2"></i>Send Invitation</h5>
              <div class="row g-2">
                <div class="col-md-6"><label class="form-label small fw-bold">Email Address *</label><input type="email" id="inviteEmail" class="invite-input" placeholder="agent@example.com"></div>
                <div class="col-md-6"><label class="form-label small fw-bold">Full Name *</label><input type="text" id="inviteName" class="invite-input" placeholder="Agent name"></div>
                <div class="col-md-6"><label class="form-label small fw-bold">Phone</label><input type="text" id="invitePhone" class="invite-input" placeholder="+91 9810012345"></div>
                <div class="col-md-6"><label class="form-label small fw-bold">Role</label>
                  <select id="inviteRole" class="invite-input">
                    <option value="client_admin">Company Admin</option>
                    <option value="manager">Manager</option>
                    <option value="executive">Executive</option>
                    <option value="client_owner">Client Owner</option>
                  </select>
                </div>
                <div class="col-12"><label class="form-label small fw-bold">Assign to Contacts (optional)</label>
                  <select id="inviteAssign" class="invite-input" multiple style="height:100px;">
                    <option value="">All (no restriction)</option>
                    ${contacts.map(c => `<option value="${c.id}">${c.firstName||''} ${c.lastName||''} (${c.mobile||c.email||''})</option>`).join('')}
                  </select>
                  <small class="text-muted">Hold Ctrl/Cmd to select multiple</small>
                </div>
              </div>
              <button class="agent-btn agent-btn-primary mt-3" style="width:100%;padding:10px;" onclick="Agents.sendInvite()">
                <i class="fas fa-paper-plane me-2"></i> Send Invitation
              </button>
              <small class="text-muted d-block mt-2 text-center">An email will be sent with registration link.</small>
            </div>
          </div>

          <div class="col-lg-5">
            <div class="invite-card">
              <h5><i class="fas fa-link me-2"></i>Invite Link</h5>
              <p class="small text-muted mb-3">Share this link directly. New members can register with the assigned role.</p>
              <div class="input-group mb-3">
                <input type="text" id="inviteLink" class="invite-input" value="${window.location.origin}${window.location.pathname}?register=team" readonly>
                <button class="agent-btn agent-btn-outline" onclick="navigator.clipboard.writeText(document.getElementById('inviteLink').value);alert('✅ Link copied!')" style="margin-left:8px;"><i class="fas fa-copy"></i> Copy</button>
              </div>
            </div>

            <div class="invite-card mt-3">
              <h5><i class="fas fa-info-circle me-2"></i>Role Permissions</h5>
              <div class="table-responsive">
                <table class="table table-sm small" style="font-size:12px;">
                  <thead><tr><th>Feature</th><th>Admin</th><th>Manager</th><th>Executive</th></tr></thead>
                  <tbody>
                    <tr><td>Dashboard</td><td>✅</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Leads & Contacts</td><td>✅</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Campaigns</td><td>✅</td><td>✅</td><td>❌</td></tr>
                    <tr><td>Templates & Flows</td><td>✅</td><td>✅</td><td>❌</td></tr>
                    <tr><td>Chat & Social</td><td>✅</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Setup & Integrations</td><td>✅</td><td>❌</td><td>❌</td></tr>
                    <tr><td>Team Management</td><td>✅</td><td>❌</td><td>❌</td></tr>
                    <tr><td>Kanban Pipeline</td><td>✅</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Analytics & Reports</td><td>✅</td><td>✅</td><td>❌</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="invite-card mt-3">
              <h5><i class="fas fa-shield-alt me-2"></i>Module Permissions</h5>
              <p class="small text-muted mb-2">Default modules for new invitee (can be changed later)</p>
              <div class="perm-grid-invite">${moduleChecks}</div>
              <div class="d-flex gap-2 mt-2">
                <button class="agent-btn agent-btn-outline" onclick="document.querySelectorAll('.invite-module').forEach(cb=>cb.checked=true);">Select All</button>
                <button class="agent-btn agent-btn-outline" onclick="document.querySelectorAll('.invite-module').forEach(cb=>cb.checked=false);">Deselect All</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  async sendInvite() {
    const email = document.getElementById('inviteEmail')?.value?.trim();
    const name = document.getElementById('inviteName')?.value?.trim();
    const phone = document.getElementById('invitePhone')?.value?.trim();
    const role = document.getElementById('inviteRole')?.value;
    const assignedClients = Array.from(document.querySelectorAll('#inviteAssign option:checked')).map(o => o.value).filter(Boolean);
    const selectedModules = Array.from(document.querySelectorAll('.invite-module:checked')).map(cb => cb.value);

    if (!email || !name) return alert('Email and Name are required!');

    const permissions = {};
    selectedModules.forEach(mod => { permissions[mod] = { read: true, write: true }; });

    try {
      await db.collection('users').add({
        email, name, phone, role, permissions,
        status: 'invited',
        assignedClients,
        clientId: window.currentUser?.clientId || null,
        invitedAt: firebase.firestore.FieldValue.serverTimestamp(),
        invitedBy: window.currentUser?.uid || 'admin'
      });

      const subject = encodeURIComponent("You're invited to 11 Avatar CRM");
      const body = encodeURIComponent(`Hi ${name},\n\nYou've been invited as a ${role.replace(/_/g,' ')} to 11 Avatar CRM.\n\nRegister here: ${window.location.origin}${window.location.pathname}\n\nThanks!`);
      window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');

      alert('✅ Invitation sent! User can now register with this email.');
      this.currentTab = 'list';
      this.render();
    } catch(e) { alert('Error: ' + e.message); }
  },

  // ==================== EDIT AGENT ====================
  showEditForm(id) {
    db.collection('users').doc(id).get().then(doc => {
      const u = doc.data();
      const roles = ['client_admin','manager','executive','client_owner'];
      const roleOptions = roles.map(r => `<option value="${r}" ${u.role===r?'selected':''}>${r.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</option>`).join('');

      document.getElementById('agentModal').innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="document.getElementById('agentModal').innerHTML=''">
          <div style="background:#fff;border-radius:20px;width:480px;max-width:92vw;max-height:85vh;overflow-y:auto;padding:28px;box-shadow:0 25px 60px rgba(0,0,0,0.2);" onclick="event.stopPropagation()">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 style="font-weight:700;margin:0;">✏️ Edit Agent</h5>
              <button style="background:#f1f5f9;border:none;width:32px;height:32px;border-radius:50%;font-size:16px;cursor:pointer;" onclick="document.getElementById('agentModal').innerHTML=''">×</button>
            </div>
            <div class="mb-2"><label class="form-label small fw-bold">Name</label><input type="text" id="editName" class="invite-input" value="${u.name||''}"></div>
            <div class="mb-2"><label class="form-label small fw-bold">Email</label><input type="email" id="editEmail" class="invite-input" value="${u.email||''}"></div>
            <div class="mb-2"><label class="form-label small fw-bold">Phone</label><input type="text" id="editPhone" class="invite-input" value="${u.phone||''}"></div>
            <div class="mb-2"><label class="form-label small fw-bold">Role</label><select id="editRole" class="invite-input">${roleOptions}</select></div>
            <div class="mb-2"><label class="form-label small fw-bold">Status</label>
              <select id="editStatus" class="invite-input">
                <option value="active" ${u.status==='active'?'selected':''}>Active</option>
                <option value="inactive" ${u.status==='inactive'?'selected':''}>Inactive</option>
                <option value="pending" ${u.status==='pending'?'selected':''}>Pending</option>
              </select>
            </div>
            <button class="agent-btn agent-btn-primary" style="width:100%;padding:10px;" onclick="Agents.updateAgent('${id}')">💾 Save Changes</button>
          </div>
        </div>`;
    });
  },

  async updateAgent(id) {
    const data = {
      name: document.getElementById('editName')?.value?.trim()||'',
      email: document.getElementById('editEmail')?.value?.trim()||'',
      phone: document.getElementById('editPhone')?.value?.trim()||'',
      role: document.getElementById('editRole')?.value||'executive',
      status: document.getElementById('editStatus')?.value||'active',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection('users').doc(id).update(data);
    document.getElementById('agentModal').innerHTML = '';
    alert('✅ Agent updated!');
    this.render();
  },

  // ==================== PERMISSIONS FORM ====================
  showPermissionsForm(id) {
    db.collection('users').doc(id).get().then(doc => {
      const u = doc.data();
      const currentPerms = u.permissions || {};
      const allModules = ['dashboard','leads','contacts','chats','campaigns','templates','flows','social','forms','kanban','knowledge','chatbot','ecommerce','appointments','analytics','tickets','integrations','agents','clients','marketing','setup','reports'];

      let moduleChecks = allModules.map(mod => `
        <div class="perm-check-item">
          <input type="checkbox" value="${mod}" class="agent-perm-module" ${currentPerms[mod] ? 'checked' : ''}> ${mod}
        </div>
      `).join('');

      document.getElementById('agentModal').innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="document.getElementById('agentModal').innerHTML=''">
          <div style="background:#fff;border-radius:20px;width:550px;max-width:92vw;max-height:85vh;overflow-y:auto;padding:28px;box-shadow:0 25px 60px rgba(0,0,0,0.2);" onclick="event.stopPropagation()">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 style="font-weight:700;margin:0;">🔐 Permissions: ${u.name||u.email}</h5>
              <button style="background:#f1f5f9;border:none;width:32px;height:32px;border-radius:50%;font-size:16px;cursor:pointer;" onclick="document.getElementById('agentModal').innerHTML=''">×</button>
            </div>
            <div class="perm-grid-invite" style="max-height:350px;overflow-y:auto;">${moduleChecks}</div>
            <div class="d-flex gap-2 mt-3">
              <button class="agent-btn agent-btn-outline" onclick="document.querySelectorAll('.agent-perm-module').forEach(cb=>cb.checked=true);">Select All</button>
              <button class="agent-btn agent-btn-outline" onclick="document.querySelectorAll('.agent-perm-module').forEach(cb=>cb.checked=false);">Deselect All</button>
            </div>
            <button class="agent-btn agent-btn-primary" style="width:100%;padding:10px;margin-top:12px;" onclick="Agents.savePermissions('${id}')">💾 Save Permissions</button>
          </div>
        </div>`;
    });
  },

  async savePermissions(id) {
    const selectedModules = Array.from(document.querySelectorAll('.agent-perm-module:checked')).map(cb => cb.value);
    const permissions = {};
    selectedModules.forEach(mod => { permissions[mod] = { read: true, write: true }; });
    await db.collection('users').doc(id).update({ permissions, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    document.getElementById('agentModal').innerHTML = '';
    alert('✅ Permissions updated!');
    this.render();
  },

  async removeAgent(id, name) {
    if (!confirm(`Remove ${name||'this agent'}? This cannot be undone.`)) return;
    await db.collection('users').doc(id).delete();
    alert('✅ Agent removed.');
    this.render();
  },

  // ==================== PERFORMANCE ====================
  async renderPerformance() {
    let users = [];
    try {
      let query = db.collection('users');
      if (isPlatformAdmin()) {
        query = query.where('role', 'in', ['platform_owner', 'platform_super_admin', 'admin']);
      } else if (window.currentUser.clientId) {
        query = query.where('clientId', '==', window.currentUser.clientId);
      }
      const snap = await query.get();
      users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) {}

    let html = `
      <div class="agents-wrap">
        <div class="d-flex align-items-center mb-4">
          <button class="agent-btn agent-btn-outline me-3" onclick="Agents.currentTab='list';Agents.render();"><i class="fas fa-arrow-left me-1"></i> Back</button>
          <div>
            <h4 class="mb-0" style="font-weight:800;">📊 Team Performance</h4>
            <small class="text-muted">Track individual and team performance metrics</small>
          </div>
        </div>
        <div class="row g-3">
          ${users.length === 0 ? '<div class="col-12 text-center py-5 text-muted">No team members yet.</div>' : users.map(u => `
            <div class="col-md-6 col-lg-4">
              <div class="invite-card text-center">
                <div class="agent-avatar ${u.role||'client'}" style="width:60px;height:60px;font-size:24px;margin:0 auto 12px;">${(u.name||u.email||'?')[0].toUpperCase()}</div>
                <h6 style="font-weight:700;">${u.name||'Unnamed'}</h6>
                <span class="agent-badge" style="background:#eef2ff;color:#6366f1;">${(u.role||'client').replace(/_/g,' ')}</span>
                <div class="row g-2 mt-3">
                  <div class="col-4"><div class="agent-mini-stat"><div class="n" style="font-size:22px;color:#6366f1;">${u.assignedLeads||0}</div><div class="l">Leads</div></div></div>
                  <div class="col-4"><div class="agent-mini-stat"><div class="n" style="font-size:22px;color:#10b981;">${u.wonDeals||0}</div><div class="l">Won</div></div></div>
                  <div class="col-4"><div class="agent-mini-stat"><div class="n" style="font-size:22px;color:#f59e0b;">${u.assignedContacts||0}</div><div class="l">Contacts</div></div></div>
                </div>
                <button class="agent-btn agent-btn-outline mt-3" onclick="Agents.currentTab='list';Agents.render();">View Details</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  }
};

// Helper function for agents.js
function isPlatformAdmin() {
  const user = window.currentUser;
  if (!user) return false;
  return user.role === 'platform_owner' || user.role === 'platform_super_admin' || user.role === 'admin';
}
