// js/agents.js — Full Team Management (Invite, Roles, Assignment)
const Agents = {
  currentTab: 'list', // list, invite
  editingAgent: null,

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading team...</p>';

    if (this.currentTab === 'invite') {
      await this.renderInvite();
      return;
    }

    await this.renderList();
  },

  async renderList() {
    let users = [];
    try {
      const snap = await db.collection('users').orderBy('createdAt', 'desc').get();
      users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { console.error(e); }

    // Stats
    const total = users.length;
    const admins = users.filter(u => u.role === 'admin').length;
    const team = users.filter(u => u.role === 'team').length;
    const clients = users.filter(u => u.role === 'client').length;

    let html = `
      <style>
        .agent-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 12px; padding: 16px; margin-bottom: 10px; transition: 0.2s; }
        .agent-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .agent-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 18px; }
        .agent-avatar.admin { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
        .agent-avatar.team { background: linear-gradient(135deg, #1877f2, #0ea5e9); }
        .agent-avatar.client { background: linear-gradient(135deg, #10b981, #34d399); }
        .role-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
        .role-badge.admin { background: #e0e7ff; color: #4f46e5; }
        .role-badge.team { background: #e0f2fe; color: #0369a1; }
        .role-badge.client { background: #d1fae5; color: #065f46; }
      </style>

      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="mb-0"><i class="fas fa-user-tie text-primary me-2"></i>Team Management</h4>
          <small class="text-muted">Manage agents, assign leads, control permissions</small>
        </div>
        <button class="btn btn-primary btn-sm" onclick="Agents.currentTab='invite'; Agents.render();">
          <i class="fas fa-user-plus me-1"></i> Invite Member
        </button>
      </div>

      <!-- Stats -->
      <div class="row g-2 mb-3">
        <div class="col-3"><div class="card-widget text-center py-2"><h5 class="mb-0">${total}</h5><small class="text-muted">Total</small></div></div>
        <div class="col-3"><div class="card-widget text-center py-2"><h5 class="mb-0 text-primary">${admins}</h5><small class="text-muted">Admins</small></div></div>
        <div class="col-3"><div class="card-widget text-center py-2"><h5 class="mb-0 text-info">${team}</h5><small class="text-muted">Team</small></div></div>
        <div class="col-3"><div class="card-widget text-center py-2"><h5 class="mb-0 text-success">${clients}</h5><small class="text-muted">Clients</small></div></div>
      </div>

      <!-- Team List -->
      <div id="agentFormContainer"></div>
      ${users.length === 0 ? '<div class="text-center py-4 text-muted">No team members yet.</div>' : users.map(u => `
        <div class="agent-card">
          <div class="d-flex align-items-center gap-3">
            <div class="agent-avatar ${u.role||'client'}">${(u.name||u.email||'?')[0].toUpperCase()}</div>
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <strong>${u.name||'Unnamed'}</strong>
                  <span class="role-badge ${u.role||'client'} ms-2">${u.role||'client'}</span>
                  ${u.status === 'invited' ? '<span class="badge bg-warning ms-1">Invited</span>' : ''}
                </div>
                <div class="d-flex gap-1">
                  <button class="btn btn-sm btn-outline-info" onclick="Agents.showEditForm('${u.id}')"><i class="fas fa-edit"></i></button>
                  <button class="btn btn-sm btn-outline-danger" onclick="Agents.removeAgent('${u.id}','${u.name||u.email}')"><i class="fas fa-trash"></i></button>
                </div>
              </div>
              <small class="text-muted">${u.email||'No email'}</small>
              ${u.phone ? `<small class="text-muted ms-2">· ${u.phone}</small>` : ''}
              <div class="mt-1">
                <small class="text-muted">Assigned Leads: <strong>${u.assignedLeads||0}</strong> · Won: <strong>${u.wonDeals||0}</strong></small>
              </div>
            </div>
          </div>
        </div>
      `).join('')}

      <div id="agentModal"></div>
    `;
    contentArea.innerHTML = html;
  },

  // ==================== INVITE ====================
  async renderInvite() {
    let html = `
      <div class="d-flex align-items-center mb-3">
        <button class="btn btn-outline-secondary btn-sm me-2" onclick="Agents.currentTab='list';Agents.render();"><i class="fas fa-arrow-left"></i></button>
        <h4 class="mb-0">Invite Team Member</h4>
      </div>

      <div class="row g-3">
        <div class="col-md-6">
          <div class="card-widget">
            <h5><i class="fas fa-envelope me-2"></i>Send Invitation</h5>
            <div class="mb-2">
              <label class="form-label small fw-bold">Email Address *</label>
              <input type="email" id="inviteEmail" class="form-control form-control-sm" placeholder="agent@example.com">
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Full Name</label>
              <input type="text" id="inviteName" class="form-control form-control-sm" placeholder="Agent name">
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Role</label>
              <select id="inviteRole" class="form-select form-select-sm">
                <option value="team">Team Member</option>
                <option value="admin">Admin</option>
                <option value="client">Client</option>
              </select>
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Assign to Clients/Leads</label>
              <select id="inviteAssign" class="form-select form-select-sm" multiple style="height:100px;">
                <option value="">All (no restriction)</option>
              </select>
              <small class="text-muted">Hold Ctrl/Cmd to select multiple</small>
            </div>
            <button class="btn btn-primary btn-sm w-100" onclick="Agents.sendInvite()">
              <i class="fas fa-paper-plane me-1"></i> Send Invitation
            </button>
            <small class="text-muted d-block mt-2">An email will be sent with registration link. Agent can also register directly.</small>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card-widget">
            <h5><i class="fas fa-link me-2"></i>Invite Link</h5>
            <p class="small text-muted">Share this link directly. New members will register with "Team" role.</p>
            <div class="input-group">
              <input type="text" id="inviteLink" class="form-control form-control-sm" value="${window.location.origin}${window.location.pathname}?register=team" readonly>
              <button class="btn btn-outline-primary btn-sm" onclick="navigator.clipboard.writeText(document.getElementById('inviteLink').value);alert('Link copied!')">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>

          <div class="card-widget mt-3">
            <h5><i class="fas fa-info-circle me-2"></i>Role Permissions</h5>
            <table class="table table-sm small">
              <tr><th>Feature</th><th>Admin</th><th>Team</th><th>Client</th></tr>
              <tr><td>Dashboard</td><td>✅</td><td>✅</td><td>✅</td></tr>
              <tr><td>Leads/Contacts</td><td>✅</td><td>✅</td><td>❌</td></tr>
              <tr><td>Campaigns</td><td>✅</td><td>✅</td><td>❌</td></tr>
              <tr><td>Setup/Integrations</td><td>✅</td><td>❌</td><td>❌</td></tr>
              <tr><td>Team Management</td><td>✅</td><td>❌</td><td>❌</td></tr>
              <tr><td>Kanban Pipeline</td><td>✅</td><td>✅</td><td>❌</td></tr>
            </table>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;

    // Load clients for assignment dropdown
    try {
      const snap = await db.collection('contacts').orderBy('firstName').get();
      const select = document.getElementById('inviteAssign');
      snap.forEach(d => {
        const c = d.data();
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = `${c.firstName||''} ${c.lastName||''} (${c.mobile||c.email||''})`;
        select.appendChild(opt);
      });
    } catch(e) {}
  },

  async sendInvite() {
    const email = document.getElementById('inviteEmail').value.trim();
    const name = document.getElementById('inviteName').value.trim();
    const role = document.getElementById('inviteRole').value;
    const assignedClients = Array.from(document.getElementById('inviteAssign').selectedOptions).map(o => o.value).filter(Boolean);

    if (!email) return alert('Email required!');

    try {
      // Save invited user
      await db.collection('users').add({
        email, name: name || email, role,
        status: 'invited',
        invitedAt: firebase.firestore.FieldValue.serverTimestamp(),
        invitedBy: window.currentUser?.uid || 'admin',
        assignedClients
      });

      // Send invitation email (using a simple mailto or backend)
      const subject = encodeURIComponent('You\'re invited to 11 Avatar CRM');
      const body = encodeURIComponent(`Hi ${name||'there'},\n\nYou've been invited as a ${role} to 11 Avatar CRM.\n\nRegister here: ${window.location.origin}${window.location.pathname}\n\nThanks!`);
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
      document.getElementById('agentModal').innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:3000;display:flex;align-items:center;justify-content:center;" onclick="document.getElementById('agentModal').innerHTML=''">
          <div class="card-widget" style="width:450px;max-width:90vw;" onclick="event.stopPropagation()">
            <h5>Edit Agent: ${u.name||u.email}</h5>
            <div class="mb-2">
              <label class="form-label small fw-bold">Name</label>
              <input type="text" id="editName" class="form-control form-control-sm" value="${u.name||''}">
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Email</label>
              <input type="email" id="editEmail" class="form-control form-control-sm" value="${u.email||''}">
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Phone</label>
              <input type="text" id="editPhone" class="form-control form-control-sm" value="${u.phone||''}">
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Role</label>
              <select id="editRole" class="form-select form-select-sm">
                <option value="admin" ${u.role==='admin'?'selected':''}>Admin</option>
                <option value="team" ${u.role==='team'?'selected':''}>Team Member</option>
                <option value="client" ${u.role==='client'?'selected':''}>Client</option>
              </select>
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Permissions</label>
              <div class="form-check"><input class="form-check-input" type="checkbox" id="permLeads" ${u.permissions?.leads!==false?'checked':''}><label class="form-check-label small">Leads & Contacts</label></div>
              <div class="form-check"><input class="form-check-input" type="checkbox" id="permCampaigns" ${u.permissions?.campaigns!==false?'checked':''}><label class="form-check-label small">Campaigns</label></div>
              <div class="form-check"><input class="form-check-input" type="checkbox" id="permKanban" ${u.permissions?.kanban!==false?'checked':''}><label class="form-check-label small">Kanban Pipeline</label></div>
            </div>
            <button class="btn btn-success btn-sm" onclick="Agents.updateAgent('${id}')">Save</button>
            <button class="btn btn-light btn-sm" onclick="document.getElementById('agentModal').innerHTML=''">Cancel</button>
          </div>
        </div>
      `;
    });
  },

  async updateAgent(id) {
    const data = {
      name: document.getElementById('editName').value.trim(),
      email: document.getElementById('editEmail').value.trim(),
      phone: document.getElementById('editPhone').value.trim(),
      role: document.getElementById('editRole').value,
      permissions: {
        leads: document.getElementById('permLeads').checked,
        campaigns: document.getElementById('permCampaigns').checked,
        kanban: document.getElementById('permKanban').checked
      }
    };
    await db.collection('users').doc(id).update(data);
    document.getElementById('agentModal').innerHTML = '';
    alert('✅ Agent updated!');
    this.render();
  },

  async removeAgent(id, name) {
    if (!confirm(`Remove ${name||'this agent'}? This cannot be undone.`)) return;
    await db.collection('users').doc(id).delete();
    alert('✅ Agent removed.');
    this.render();
  }
};
