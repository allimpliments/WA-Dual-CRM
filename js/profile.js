// js/profile.js — Enterprise-Grade User Profile for SaaS Platform (Fixed)
const Profile = {
  currentTab: 'overview',
  profileImage: null,
  coverImage: null,

  async render() {
    try {
      contentArea.style.paddingTop = '60px';
      contentArea.style.background = '#f8fafc';

      const user = window.currentUser || {};
      
      // Load profile data
      let connectedPlatforms = {};
      let profileData = {};
      let activityLog = [];
      let teamMembers = [];
      let statsData = { leads: 0, contacts: 0, campaigns: 0, messages: 0, wonDeals: 0, revenue: 0, tickets: 0, appointments: 0 };
      
      try {
        const connDoc = await db.collection('settings').doc('user_connections_' + user.uid).get();
        if (connDoc.exists) connectedPlatforms = connDoc.data() || {};

        const profileDoc = await db.collection('users').doc(user.uid).get();
        if (profileDoc.exists) profileData = profileDoc.data() || {};
      } catch(e) { console.error('Basic profile load error:', e); }

      // Activity log — safe load
      try {
        const activitySnap = await db.collection('activity_log')
          .where('userId', '==', user.uid)
          .orderBy('timestamp', 'desc')
          .limit(20)
          .get();
        activityLog = activitySnap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch(e) { /* silent */ }

      // Team members — safe load
      try {
        if (user.clientId && (user.role === 'client_owner' || user.role === 'client_admin')) {
          const teamSnap = await db.collection('users')
            .where('clientId', '==', user.clientId)
            .orderBy('name')
            .get();
          teamMembers = teamSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      } catch(e) { /* silent */ }

      // Stats — safe load
      try {
        let lQuery = db.collection('leads');
        if (shouldFilterByClient()) lQuery = lQuery.where('clientId', '==', user.clientId);
        const lSnap = await lQuery.get();
        statsData.leads = lSnap.size;
        lSnap.forEach(d => {
          const ld = d.data();
          if (ld.status === 'won') statsData.wonDeals++;
          statsData.revenue += parseInt(ld.value) || 0;
        });

        let cQuery = db.collection('contacts');
        if (shouldFilterByClient()) cQuery = cQuery.where('clientId', '==', user.clientId);
        statsData.contacts = (await cQuery.get()).size;

        let campQuery = db.collection('campaigns');
        if (shouldFilterByClient()) campQuery = campQuery.where('clientId', '==', user.clientId);
        statsData.campaigns = (await campQuery.get()).size;

        let mQuery = db.collection('messages');
        if (shouldFilterByClient()) mQuery = mQuery.where('clientId', '==', user.clientId);
        statsData.messages = (await mQuery.get()).size;

        let tQuery = db.collection('tickets');
        if (shouldFilterByClient()) tQuery = tQuery.where('clientId', '==', user.clientId);
        statsData.tickets = (await tQuery.get()).size;

        let aQuery = db.collection('appointments');
        if (shouldFilterByClient()) aQuery = aQuery.where('clientId', '==', user.clientId);
        statsData.appointments = (await aQuery.get()).size;
      } catch(e) { console.error('Stats load error:', e); }

      const roleNames = {
        platform_owner: 'Platform Owner', platform_super_admin: 'Super Admin',
        client_owner: 'Company Owner', client_admin: 'Company Admin',
        manager: 'Manager', executive: 'Executive', viewer: 'Viewer'
      };
      const planNames = { free: 'Free', advance: 'Advance', professional: 'Professional', enterprise: 'Enterprise' };

      let html = `
        <style>
          .prof-wrap { max-width: 1200px; margin: 0 auto; }
          .prof-cover { height: 200px; border-radius: 20px 20px 0 0; background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899); position: relative; overflow: hidden; }
          .prof-cover-pattern { position: absolute; inset: 0; opacity: 0.1; background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px); }
          .prof-cover-edit { position: absolute; bottom: 12px; right: 16px; background: rgba(0,0,0,0.4); color: #fff; border: none; padding: 6px 14px; border-radius: 20px; font-size: 11px; cursor: pointer; font-weight: 500; }
          .prof-cover-edit:hover { background: rgba(0,0,0,0.6); }
          .prof-main-card { background: #fff; border-radius: 0 0 20px 20px; padding: 0 32px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #f1f5f9; margin-bottom: 24px; }
          .prof-avatar-section { margin-top: -50px; display: flex; align-items: flex-end; gap: 20px; margin-bottom: 20px; }
          .prof-avatar { width: 100px; height: 100px; border-radius: 50%; border: 4px solid #fff; box-shadow: 0 4px 16px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 36px; background: linear-gradient(135deg, #6366f1, #8b5cf6); position: relative; cursor: pointer; overflow: hidden; flex-shrink: 0; }
          .prof-avatar img { width: 100%; height: 100%; object-fit: cover; }
          .prof-avatar-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.2s; color: #fff; font-size: 20px; }
          .prof-avatar:hover .prof-avatar-overlay { opacity: 1; }
          .prof-name-section { flex: 1; padding-bottom: 8px; }
          .prof-name { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0; }
          .prof-title { font-size: 14px; color: #64748b; margin: 4px 0 0; }
          .prof-meta-row { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 8px; }
          .prof-meta-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #475569; }
          .prof-meta-item i { color: #6366f1; width: 16px; }
          .prof-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; }
          .prof-tabs { display: flex; gap: 4px; border-bottom: 2px solid #f1f5f9; padding-bottom: 0; margin-bottom: 0; overflow-x: auto; }
          .prof-tab { padding: 12px 20px; border: none; background: transparent; font-size: 13px; font-weight: 500; color: #64748b; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: 0.2s; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
          .prof-tab:hover { color: #0f172a; }
          .prof-tab.active { color: #6366f1; border-bottom-color: #6366f1; font-weight: 600; }
          .prof-card { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; margin-bottom: 16px; }
          .prof-card h6 { font-weight: 700; font-size: 15px; color: #0f172a; margin-bottom: 16px; }
          .prof-stat-card { background: #fff; border-radius: 14px; padding: 18px 20px; text-align: center; border: 1px solid #f1f5f9; transition: 0.2s; }
          .prof-stat-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
          .prof-stat-val { font-size: 24px; font-weight: 800; }
          .prof-stat-lbl { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
          .prof-input { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13px; outline: none; background: #fff; margin-bottom: 10px; transition: 0.2s; }
          .prof-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
          .prof-textarea { resize: vertical; min-height: 80px; }
          .prof-btn { padding: 8px 18px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; }
          .prof-btn-primary { background: #6366f1; color: #fff; }
          .prof-btn-primary:hover { background: #4f46e5; }
          .prof-btn-outline { background: #fff; color: #6366f1; border: 1px solid #6366f1; }
          .prof-btn-outline:hover { background: #eef2ff; }
          .prof-btn-warning { background: #f59e0b; color: #fff; }
          .prof-btn-warning:hover { background: #d97706; }
          .prof-btn-danger { background: #ef4444; color: #fff; }
          .prof-btn-danger:hover { background: #dc2626; }
          .prof-platform-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border: 1px solid #f1f5f9; border-radius: 10px; margin-bottom: 6px; transition: 0.15s; }
          .prof-platform-row:hover { background: #f8fafc; }
          .prof-activity-item { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
          .prof-activity-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
          .prof-team-member { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
          .prof-team-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 14px; flex-shrink: 0; }
          .prof-session-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f8fafc; border-radius: 8px; margin-bottom: 6px; font-size: 12px; }
          @media (max-width: 768px) { .prof-cover { height: 140px; } .prof-avatar { width: 72px; height: 72px; font-size: 24px; } .prof-name { font-size: 20px; } .prof-main-card { padding: 0 16px 20px; } }
        </style>

        <div class="prof-wrap">
          <div class="prof-cover">
            <div class="prof-cover-pattern"></div>
            <button class="prof-cover-edit" onclick="Profile.changeCover()"><i class="fas fa-camera me-1"></i> Change Cover</button>
          </div>
          <div class="prof-main-card">
            <div class="prof-avatar-section">
              <div class="prof-avatar" onclick="Profile.changeAvatar()">
                ${profileData.avatarUrl ? `<img src="${profileData.avatarUrl}" alt="avatar">` : getInitials(user.name || user.email || 'U')}
                <div class="prof-avatar-overlay"><i class="fas fa-camera"></i></div>
              </div>
              <div class="prof-name-section">
                <h1 class="prof-name">${user.name || 'User'}</h1>
                <div class="prof-title">${profileData.title || roleNames[user.role] || user.role || 'Member'}</div>
                <div class="prof-meta-row">
                  <span class="prof-meta-item"><i class="fas fa-envelope"></i> ${user.email || 'N/A'}</span>
                  <span class="prof-meta-item"><i class="fas fa-phone"></i> ${user.phone || profileData.phone || 'Not set'}</span>
                  <span class="prof-meta-item"><i class="fas fa-building"></i> ${profileData.company || 'N/A'}</span>
                  <span class="prof-meta-item"><i class="fas fa-map-marker-alt"></i> ${profileData.location || 'Not set'}</span>
                </div>
                <div style="margin-top:10px;">
                  <span class="prof-badge" style="background:#eef2ff;color:#6366f1;">${roleNames[user.role] || user.role}</span>
                  <span class="prof-badge" style="background:#fef3c7;color:#92400e;margin-left:6px;">${planNames[user.plan] || user.plan} Plan</span>
                  <span class="prof-badge" style="background:#ecfdf5;color:#10b981;margin-left:6px;">${user.status === 'approved' ? 'Active' : user.status || 'Active'}</span>
                </div>
              </div>
            </div>
            <div class="prof-tabs">
              <button class="prof-tab ${this.currentTab==='overview'?'active':''}" onclick="Profile.currentTab='overview';Profile.render();"><i class="fas fa-chart-pie"></i> Overview</button>
              <button class="prof-tab ${this.currentTab==='edit'?'active':''}" onclick="Profile.currentTab='edit';Profile.render();"><i class="fas fa-user-edit"></i> Edit Profile</button>
              <button class="prof-tab ${this.currentTab==='security'?'active':''}" onclick="Profile.currentTab='security';Profile.render();"><i class="fas fa-shield-alt"></i> Security</button>
              <button class="prof-tab ${this.currentTab==='connections'?'active':''}" onclick="Profile.currentTab='connections';Profile.render();"><i class="fas fa-plug"></i> Connections</button>
              <button class="prof-tab ${this.currentTab==='activity'?'active':''}" onclick="Profile.currentTab='activity';Profile.render();"><i class="fas fa-history"></i> Activity</button>
              ${teamMembers.length > 0 ? `<button class="prof-tab ${this.currentTab==='team'?'active':''}" onclick="Profile.currentTab='team';Profile.render();"><i class="fas fa-users"></i> Team</button>` : ''}
              <button class="prof-tab ${this.currentTab==='sessions'?'active':''}" onclick="Profile.currentTab='sessions';Profile.render();"><i class="fas fa-laptop"></i> Sessions</button>
            </div>
          </div>
          ${this.renderTabContent(user, profileData, statsData, connectedPlatforms, activityLog, teamMembers)}
        </div>
      `;
      contentArea.innerHTML = html;
    } catch(e) {
      console.error('Profile render error:', e);
      contentArea.innerHTML = `<div class="text-center py-5"><i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i><h5>Error loading profile</h5><p class="text-muted">${e.message}</p><button class="prof-btn prof-btn-outline" onclick="Profile.render()">Retry</button></div>`;
    }
  },

  renderTabContent(user, profileData, statsData, connectedPlatforms, activityLog, teamMembers) {
    switch(this.currentTab) {
      case 'edit': return this.renderEditTab(user, profileData);
      case 'security': return this.renderSecurityTab(user);
      case 'connections': return this.renderConnectionsTab(connectedPlatforms);
      case 'activity': return this.renderActivityTab(activityLog);
      case 'team': return this.renderTeamTab(teamMembers);
      case 'sessions': return this.renderSessionsTab();
      default: return this.renderOverviewTab(user, profileData, statsData, connectedPlatforms);
    }
  },

  renderOverviewTab(user, profileData, statsData, connectedPlatforms) {
    return `
      <div class="row g-4 mt-0" style="padding-top:20px;">
        <div class="col-lg-8">
          <div class="row g-3 mb-3">
            <div class="col-6 col-md-3"><div class="prof-stat-card"><div class="prof-stat-val" style="color:#6366f1;">${statsData.leads}</div><div class="prof-stat-lbl">Leads</div></div></div>
            <div class="col-6 col-md-3"><div class="prof-stat-card"><div class="prof-stat-val" style="color:#10b981;">${statsData.contacts}</div><div class="prof-stat-lbl">Contacts</div></div></div>
            <div class="col-6 col-md-3"><div class="prof-stat-card"><div class="prof-stat-val" style="color:#f59e0b;">${statsData.campaigns}</div><div class="prof-stat-lbl">Campaigns</div></div></div>
            <div class="col-6 col-md-3"><div class="prof-stat-card"><div class="prof-stat-val" style="color:#ec4899;">${statsData.messages}</div><div class="prof-stat-lbl">Messages</div></div></div>
            <div class="col-6 col-md-3"><div class="prof-stat-card"><div class="prof-stat-val" style="color:#8b5cf6;">${statsData.wonDeals}</div><div class="prof-stat-lbl">Won Deals</div></div></div>
            <div class="col-6 col-md-3"><div class="prof-stat-card"><div class="prof-stat-val" style="color:#06b6d4;">₹${statsData.revenue >= 1000 ? (statsData.revenue/1000).toFixed(0)+'K' : statsData.revenue}</div><div class="prof-stat-lbl">Revenue</div></div></div>
            <div class="col-6 col-md-3"><div class="prof-stat-card"><div class="prof-stat-val" style="color:#ef4444;">${statsData.tickets}</div><div class="prof-stat-lbl">Tickets</div></div></div>
            <div class="col-6 col-md-3"><div class="prof-stat-card"><div class="prof-stat-val" style="color:#84cc16;">${statsData.appointments}</div><div class="prof-stat-lbl">Appointments</div></div></div>
          </div>
          <div class="prof-card">
            <h6><i class="fas fa-user me-2"></i>About</h6>
            <p style="color:#475569;font-size:13px;">${profileData.bio || 'No bio added yet. Click "Edit Profile" to add your bio.'}</p>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="prof-card">
            <h6><i class="fas fa-info-circle me-2"></i>Account Info</h6>
            <div style="font-size:12px;color:#64748b;line-height:2;">
              <div><strong>Member since:</strong> ${user.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}</div>
              <div><strong>Last login:</strong> ${user.lastLoginAt?.toDate?.().toLocaleString() || 'N/A'}</div>
              <div><strong>Role:</strong> ${user.role || 'N/A'}</div>
              <div><strong>Plan:</strong> ${user.plan || 'Free'}</div>
              <div><strong>Status:</strong> ${user.status || 'Active'}</div>
            </div>
          </div>
          <div class="prof-card">
            <h6><i class="fas fa-plug me-2"></i>Quick Connections</h6>
            ${['whatsapp','facebook','instagram','google'].map(key => {
              const icons = {whatsapp:'fa-whatsapp',facebook:'fa-facebook',instagram:'fa-instagram',google:'fa-google'};
              const colors = {whatsapp:'#25D366',facebook:'#1877f2',instagram:'#E4405F',google:'#4285F4'};
              const names = {whatsapp:'WhatsApp',facebook:'Facebook',instagram:'Instagram',google:'Google'};
              return `<div class="prof-platform-row"><span><i class="fab ${icons[key]} me-2" style="color:${colors[key]};"></i>${names[key]}</span><span class="prof-badge" style="background:${connectedPlatforms[key]?'#ecfdf5':'#f1f5f9'};color:${connectedPlatforms[key]?'#10b981':'#94a3b8'};">${connectedPlatforms[key]?'Connected':'Not Connected'}</span></div>`;
            }).join('')}
          </div>
        </div>
      </div>`;
  },

  renderEditTab(user, profileData) {
    return `
      <div class="row g-4" style="padding-top:20px;">
        <div class="col-lg-8">
          <div class="prof-card">
            <h6><i class="fas fa-user-edit me-2"></i>Personal Information</h6>
            <div class="row g-2">
              <div class="col-md-6"><label class="small fw-bold">Full Name</label><input type="text" id="profName" class="prof-input" value="${user.name||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Email</label><input type="email" id="profEmail" class="prof-input" value="${user.email||''}" readonly style="background:#f8fafc;"></div>
              <div class="col-md-6"><label class="small fw-bold">Phone</label><input type="text" id="profPhone" class="prof-input" value="${user.phone||profileData.phone||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Job Title</label><input type="text" id="profTitle" class="prof-input" value="${profileData.title||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Company</label><input type="text" id="profCompany" class="prof-input" value="${profileData.company||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Location</label><input type="text" id="profLocation" class="prof-input" value="${profileData.location||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Website</label><input type="url" id="profWebsite" class="prof-input" value="${profileData.website||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Timezone</label><select id="profTimezone" class="prof-input"><option value="Asia/Kolkata" selected>Asia/Kolkata (IST)</option><option value="America/New_York">America/New_York (EST)</option><option value="Europe/London">Europe/London (GMT)</option></select></div>
              <div class="col-12"><label class="small fw-bold">Bio</label><textarea id="profBio" class="prof-input prof-textarea">${profileData.bio||''}</textarea></div>
            </div>
            <button class="prof-btn prof-btn-primary mt-2" onclick="Profile.updateInfo()"><i class="fas fa-save"></i> Save Changes</button>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="prof-card">
            <h6><i class="fas fa-camera me-2"></i>Profile Photo</h6>
            <div class="text-center">
              <div class="prof-avatar" style="margin:0 auto 12px;cursor:pointer;" onclick="Profile.changeAvatar()">
                ${profileData.avatarUrl ? `<img src="${profileData.avatarUrl}" alt="avatar">` : getInitials(user.name || user.email || 'U')}
                <div class="prof-avatar-overlay"><i class="fas fa-camera"></i></div>
              </div>
              <button class="prof-btn prof-btn-outline btn-sm" onclick="Profile.changeAvatar()"><i class="fas fa-upload"></i> Upload Photo</button>
            </div>
          </div>
          <div class="prof-card">
            <h6><i class="fas fa-trash-alt me-2"></i>Danger Zone</h6>
            <p style="font-size:12px;color:#64748b;">Once you delete your account, there is no going back. Please be certain.</p>
            <button class="prof-btn prof-btn-danger" onclick="Profile.deleteAccount()"><i class="fas fa-trash"></i> Delete Account</button>
          </div>
        </div>
      </div>`;
  },

  renderSecurityTab(user) {
    return `
      <div class="row g-4" style="padding-top:20px;">
        <div class="col-lg-6">
          <div class="prof-card">
            <h6><i class="fas fa-key me-2"></i>Change Password</h6>
            <input type="password" id="profOldPass" class="prof-input" placeholder="Current Password">
            <input type="password" id="profNewPass" class="prof-input" placeholder="New Password (min 6 characters)">
            <input type="password" id="profConfirmPass" class="prof-input" placeholder="Confirm New Password">
            <button class="prof-btn prof-btn-warning" onclick="Profile.changePassword()"><i class="fas fa-key"></i> Update Password</button>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="prof-card">
            <h6><i class="fas fa-shield-alt me-2"></i>Two-Factor Authentication</h6>
            <p style="font-size:13px;color:#64748b;">Add an extra layer of security to your account.</p>
            <button class="prof-btn prof-btn-outline" onclick="showToast('2FA coming soon!', 'info')"><i class="fas fa-shield-alt"></i> Enable 2FA</button>
          </div>
          <div class="prof-card">
            <h6><i class="fas fa-bell me-2"></i>Notification Preferences</h6>
            <label style="font-size:12px;display:flex;align-items:center;gap:8px;margin-bottom:8px;"><input type="checkbox" checked> Email notifications</label>
            <label style="font-size:12px;display:flex;align-items:center;gap:8px;margin-bottom:8px;"><input type="checkbox" checked> In-app notifications</label>
            <label style="font-size:12px;display:flex;align-items:center;gap:8px;"><input type="checkbox"> WhatsApp notifications</label>
          </div>
        </div>
      </div>`;
  },

  renderConnectionsTab(connectedPlatforms) {
    const platforms = [
      {key:'whatsapp',name:'WhatsApp',icon:'fa-whatsapp',color:'#25D366'},
      {key:'facebook',name:'Facebook',icon:'fa-facebook',color:'#1877f2'},
      {key:'instagram',name:'Instagram',icon:'fa-instagram',color:'#E4405F'},
      {key:'google',name:'Google',icon:'fa-google',color:'#4285F4'},
      {key:'linkedin',name:'LinkedIn',icon:'fa-linkedin',color:'#0A66C2'},
      {key:'twitter',name:'Twitter/X',icon:'fa-twitter',color:'#1DA1F2'},
    ];
    return `
      <div style="padding-top:20px;">
        <div class="prof-card">
          <h6><i class="fas fa-plug me-2"></i>Connected Platforms</h6>
          ${platforms.map(p => `
            <div class="prof-platform-row">
              <span><i class="fab ${p.icon} me-2" style="color:${p.color};"></i> ${p.name}</span>
              <span class="prof-badge" style="background:${connectedPlatforms[p.key]?'#ecfdf5':'#f1f5f9'};color:${connectedPlatforms[p.key]?'#10b981':'#94a3b8'};">
                ${connectedPlatforms[p.key]?'● Connected':'○ Not Connected'}
              </span>
            </div>
          `).join('')}
        </div>
      </div>`;
  },

  renderActivityTab(activityLog) {
    return `
      <div style="padding-top:20px;">
        <div class="prof-card">
          <h6><i class="fas fa-history me-2"></i>Recent Activity</h6>
          ${activityLog.length === 0 ? '<p style="color:#94a3b8;font-size:13px;">No recent activity.</p>' : activityLog.map(a => `
            <div class="prof-activity-item">
              <div class="prof-activity-dot" style="background:${a.type==='create'?'#10b981':a.type==='update'?'#6366f1':a.type==='delete'?'#ef4444':'#f59e0b'};"></div>
              <div class="flex-grow-1">
                <strong>${a.action || 'Action'}</strong> — ${a.detail || ''}
                <div style="font-size:10px;color:#94a3b8;">${a.timestamp?.toDate?.().toLocaleString() || 'Just now'}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;
  },

  renderTeamTab(teamMembers) {
    return `
      <div style="padding-top:20px;">
        <div class="prof-card">
          <h6><i class="fas fa-users me-2"></i>Team Members (${teamMembers.length})</h6>
          ${teamMembers.map(tm => `
            <div class="prof-team-member">
              <div class="prof-team-avatar" style="background:${getAvatarColor(tm.name)};">${getInitials(tm.name||tm.email)}</div>
              <div class="flex-grow-1"><strong>${tm.name||'Unnamed'}</strong><br><small style="color:#64748b;">${tm.email} · ${tm.role||'Member'}</small></div>
              <span class="prof-badge" style="background:${tm.status==='approved'?'#ecfdf5':'#fef3c7'};color:${tm.status==='approved'?'#10b981':'#92400e'};">${tm.status||'active'}</span>
            </div>
          `).join('')}
        </div>
      </div>`;
  },

  renderSessionsTab() {
    return `
      <div style="padding-top:20px;">
        <div class="prof-card">
          <h6><i class="fas fa-laptop me-2"></i>Active Sessions</h6>
          <div class="prof-session-item">
            <div><strong>Current Session</strong><br><small style="color:#64748b;">${navigator.userAgent.substring(0, 60)}...</small></div>
            <span class="prof-badge" style="background:#ecfdf5;color:#10b981;">Active Now</span>
          </div>
          <button class="prof-btn prof-btn-outline mt-2" onclick="Profile.logoutAllSessions()"><i class="fas fa-sign-out-alt"></i> Logout All Sessions</button>
        </div>
      </div>`;
  },

  // ==================== ACTIONS ====================
  async updateInfo() {
    try {
      const data = {
        name: document.getElementById('profName')?.value?.trim() || '',
        phone: document.getElementById('profPhone')?.value?.trim() || '',
        title: document.getElementById('profTitle')?.value?.trim() || '',
        company: document.getElementById('profCompany')?.value?.trim() || '',
        location: document.getElementById('profLocation')?.value?.trim() || '',
        website: document.getElementById('profWebsite')?.value?.trim() || '',
        bio: document.getElementById('profBio')?.value?.trim() || '',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      await db.collection('users').doc(window.currentUser.uid).update(data);
      window.currentUser = { ...window.currentUser, ...data };
      showToast('✅ Profile updated successfully!', 'success');
      this.render();
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
  },

  async changePassword() {
    try {
      const oldPass = document.getElementById('profOldPass')?.value;
      const newPass = document.getElementById('profNewPass')?.value;
      const confirm = document.getElementById('profConfirmPass')?.value;
      if (!oldPass || !newPass || !confirm) return showToast('Fill all password fields!', 'warning');
      if (newPass !== confirm) return showToast('Passwords do not match!', 'error');
      if (newPass.length < 6) return showToast('Password must be 6+ characters!', 'warning');
      const user = firebase.auth().currentUser;
      const cred = firebase.auth.EmailAuthProvider.credential(user.email, oldPass);
      await user.reauthenticateWithCredential(cred);
      await user.updatePassword(newPass);
      showToast('✅ Password changed successfully!', 'success');
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
  },

  changeAvatar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      try {
        const file = e.target.files[0];
        if (!file) return;
        const ref = firebase.storage().ref(`avatars/${window.currentUser.uid}_${Date.now()}`);
        await ref.put(file);
        const url = await ref.getDownloadURL();
        await db.collection('users').doc(window.currentUser.uid).update({ avatarUrl: url });
        window.currentUser.avatarUrl = url;
        showToast('✅ Avatar updated!', 'success');
        this.render();
      } catch(err) { showToast('Error: ' + err.message, 'error'); }
    };
    input.click();
  },

  changeCover() { showToast('Cover photo feature coming soon!', 'info'); },

  async deleteAccount() {
    if (!confirm('Are you absolutely sure? This action cannot be undone.')) return;
    if (!confirm('Final confirmation: Delete your account forever?')) return;
    try {
      await db.collection('users').doc(window.currentUser.uid).delete();
      await firebase.auth().currentUser.delete();
      window.location.href = '/WA-Dual-CRM/home.html';
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
  },

  async logoutAllSessions() {
    try {
      await firebase.auth().signOut();
      window.location.reload();
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
  }
};
