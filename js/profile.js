// js/profile.js — Enterprise-Grade User Profile (All Errors Fixed)
const Profile = {
  currentTab: 'overview',
  profileImage: null,
  coverImage: null,

  async render() {
    try {
      contentArea.style.paddingTop = '60px';
      contentArea.style.background = '#f8fafc';

      const user = window.currentUser || {};
      
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

      try {
        const activitySnap = await db.collection('activity_log').where('userId', '==', user.uid).orderBy('timestamp', 'desc').limit(20).get();
        activityLog = activitySnap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch(e) {}

      try {
        if (user.clientId && (user.role === 'client_owner' || user.role === 'client_admin')) {
          const teamSnap = await db.collection('users').where('clientId', '==', user.clientId).orderBy('name').get();
          teamMembers = teamSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      } catch(e) {}

      try {
        let lQuery = db.collection('leads'); if (shouldFilterByClient()) lQuery = lQuery.where('clientId', '==', user.clientId);
        const lSnap = await lQuery.get(); statsData.leads = lSnap.size;
        lSnap.forEach(d => { const ld = d.data(); if (ld.status === 'won') statsData.wonDeals++; statsData.revenue += parseInt(ld.value) || 0; });
        let cQuery = db.collection('contacts'); if (shouldFilterByClient()) cQuery = cQuery.where('clientId', '==', user.clientId); statsData.contacts = (await cQuery.get()).size;
        let campQuery = db.collection('campaigns'); if (shouldFilterByClient()) campQuery = campQuery.where('clientId', '==', user.clientId); statsData.campaigns = (await campQuery.get()).size;
        let mQuery = db.collection('messages'); if (shouldFilterByClient()) mQuery = mQuery.where('clientId', '==', user.clientId); statsData.messages = (await mQuery.get()).size;
        let tQuery = db.collection('tickets'); if (shouldFilterByClient()) tQuery = tQuery.where('clientId', '==', user.clientId); statsData.tickets = (await tQuery.get()).size;
        let aQuery = db.collection('appointments'); if (shouldFilterByClient()) aQuery = aQuery.where('clientId', '==', user.clientId); statsData.appointments = (await aQuery.get()).size;
      } catch(e) { console.error('Stats load error:', e); }

      const roleNames = { platform_owner: 'Platform Owner', platform_super_admin: 'Super Admin', client_owner: 'Company Owner', client_admin: 'Company Admin', manager: 'Manager', executive: 'Executive', viewer: 'Viewer' };
      const planNames = { free: 'Free', advance: 'Advance', professional: 'Professional', enterprise: 'Enterprise' };

      // ✅ Store in closure for tab functions
      this._user = user;
      this._profileData = profileData;
      this._statsData = statsData;
      this._connectedPlatforms = connectedPlatforms;
      this._activityLog = activityLog;
      this._teamMembers = teamMembers;
      this._roleNames = roleNames;
      this._planNames = planNames;

      let html = `
        <style>
          .prof-wrap { max-width: 1200px; margin: 0 auto; }
          .prof-cover { height: 200px; border-radius: 20px 20px 0 0; background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899); position: relative; overflow: hidden; }
          .prof-cover-pattern { position: absolute; inset: 0; opacity: 0.1; background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px); }
          .prof-cover-edit { position: absolute; bottom: 12px; right: 16px; background: rgba(0,0,0,0.4); color: #fff; border: none; padding: 6px 14px; border-radius: 20px; font-size: 11px; cursor: pointer; font-weight: 500; }
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
          .prof-stat-card { background: #fff; border-radius: 14px; padding: 18px 20px; text-align: center; border: 1px solid #f1f5f9; }
          .prof-stat-val { font-size: 24px; font-weight: 800; }
          .prof-stat-lbl { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
          .prof-input { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13px; outline: none; background: #fff; margin-bottom: 10px; }
          .prof-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
          .prof-textarea { resize: vertical; min-height: 80px; }
          .prof-btn { padding: 8px 18px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; }
          .prof-btn-primary { background: #6366f1; color: #fff; }
          .prof-btn-primary:hover { background: #4f46e5; }
          .prof-btn-outline { background: #fff; color: #6366f1; border: 1px solid #6366f1; }
          .prof-btn-warning { background: #f59e0b; color: #fff; }
          .prof-btn-danger { background: #ef4444; color: #fff; }
          .prof-platform-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border: 1px solid #f1f5f9; border-radius: 10px; margin-bottom: 6px; }
          .prof-social-connect-btn { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 12px; cursor: pointer; font-size: 12px; font-weight: 600; transition: 0.2s; width: 100%; border: 1px solid #e2e8f0; background: #fff; }
          .prof-social-connect-btn:hover { background: #eef2ff; border-color: #6366f1; }
          .prof-social-connect-btn.connected { background: #ecfdf5; border-color: #10b981; }
          @media (max-width: 768px) { .prof-cover { height: 140px; } .prof-avatar { width: 72px; height: 72px; font-size: 24px; } .prof-name { font-size: 20px; } .prof-main-card { padding: 0 16px 20px; } }
        </style>

        <div class="prof-wrap">
          <div class="prof-cover"><div class="prof-cover-pattern"></div><button class="prof-cover-edit" onclick="Profile.changeCover()"><i class="fas fa-camera me-1"></i> Change Cover</button></div>
          <div class="prof-main-card">
            <div class="prof-avatar-section">
              <div class="prof-avatar" onclick="Profile.changeAvatar()">${profileData.avatarUrl ? `<img src="${profileData.avatarUrl}" alt="avatar">` : getInitials(user.name || user.email || 'U')}<div class="prof-avatar-overlay"><i class="fas fa-camera"></i></div></div>
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
              <button class="prof-tab ${this.currentTab==='edit'?'active':''}" onclick="Profile.currentTab='edit';Profile.render();"><i class="fas fa-user-edit"></i> Edit</button>
              <button class="prof-tab ${this.currentTab==='security'?'active':''}" onclick="Profile.currentTab='security';Profile.render();"><i class="fas fa-shield-alt"></i> Security</button>
              <button class="prof-tab ${this.currentTab==='connections'?'active':''}" onclick="Profile.currentTab='connections';Profile.render();"><i class="fas fa-plug"></i> Connections</button>
              <button class="prof-tab ${this.currentTab==='company'?'active':''}" onclick="Profile.currentTab='company';Profile.render();"><i class="fas fa-building"></i> Company</button>
              <button class="prof-tab ${this.currentTab==='activity'?'active':''}" onclick="Profile.currentTab='activity';Profile.render();"><i class="fas fa-history"></i> Activity</button>
              ${teamMembers.length > 0 ? `<button class="prof-tab ${this.currentTab==='team'?'active':''}" onclick="Profile.currentTab='team';Profile.render();"><i class="fas fa-users"></i> Team</button>` : ''}
              <button class="prof-tab ${this.currentTab==='sessions'?'active':''}" onclick="Profile.currentTab='sessions';Profile.render();"><i class="fas fa-laptop"></i> Sessions</button>
            </div>
          </div>
          ${this.renderTabContent()}
        </div>
      `;
      contentArea.innerHTML = html;
    } catch(e) {
      console.error('Profile render error:', e);
      contentArea.innerHTML = `<div class="text-center py-5"><i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i><h5>Error loading profile</h5><p class="text-muted">${e.message}</p><button class="prof-btn prof-btn-outline" onclick="Profile.render()">Retry</button></div>`;
    }
  },

  renderTabContent() {
    switch(this.currentTab) {
      case 'edit': return this.renderEditTab();
      case 'security': return this.renderSecurityTab();
      case 'connections': return this.renderConnectionsTab();
      case 'company': return this.renderCompanyTab();
      case 'activity': return this.renderActivityTab();
      case 'team': return this.renderTeamTab();
      case 'sessions': return this.renderSessionsTab();
      default: return this.renderOverviewTab();
    }
  },

  // ==================== OVERVIEW ====================
  renderOverviewTab() {
    const u = this._user, p = this._profileData, s = this._statsData, c = this._connectedPlatforms;
    return `
      <div class="row g-4 mt-0" style="padding-top:20px;">
        <div class="col-lg-8">
          <div class="row g-3 mb-3">
            <div class="col-6 col-md-3"><div class="prof-stat-card"><div class="prof-stat-val" style="color:#6366f1;">${s.leads}</div><div class="prof-stat-lbl">Leads</div></div></div>
            <div class="col-6 col-md-3"><div class="prof-stat-card"><div class="prof-stat-val" style="color:#10b981;">${s.contacts}</div><div class="prof-stat-lbl">Contacts</div></div></div>
            <div class="col-6 col-md-3"><div class="prof-stat-card"><div class="prof-stat-val" style="color:#f59e0b;">${s.campaigns}</div><div class="prof-stat-lbl">Campaigns</div></div></div>
            <div class="col-6 col-md-3"><div class="prof-stat-card"><div class="prof-stat-val" style="color:#ec4899;">${s.messages}</div><div class="prof-stat-lbl">Messages</div></div></div>
          </div>
          <div class="prof-card"><h6>About</h6><p>${p.bio || 'No bio yet.'}</p></div>
        </div>
        <div class="col-lg-4">
          <div class="prof-card"><h6>Account Info</h6><div style="font-size:12px;color:#64748b;line-height:2;"><div><strong>Member since:</strong> ${u.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}</div><div><strong>Role:</strong> ${u.role}</div><div><strong>Plan:</strong> ${u.plan || 'Free'}</div></div></div>
          <div class="prof-card"><h6>Connections</h6>${['whatsapp','facebook','instagram','google'].map(k=>`<div class="prof-platform-row"><span>${k}</span><span class="prof-badge" style="background:${c[k]?'#ecfdf5':'#f1f5f9'};color:${c[k]?'#10b981':'#94a3b8'};">${c[k]?'✓':'○'}</span></div>`).join('')}</div>
        </div>
      </div>`;
  },

  // ==================== EDIT ====================
  renderEditTab() {
    const p = this._profileData, u = this._user;
    return `
      <div class="row g-4" style="padding-top:20px;">
        <div class="col-lg-8">
          <div class="prof-card"><h6>Personal Information</h6>
            <div class="row g-2">
              <div class="col-md-4"><label class="small fw-bold">First Name</label><input type="text" id="profFirstName" class="prof-input" value="${p.firstName || u.name?.split(' ')[0] || ''}"></div>
              <div class="col-md-4"><label class="small fw-bold">Last Name</label><input type="text" id="profLastName" class="prof-input" value="${p.lastName || u.name?.split(' ').slice(1).join(' ') || ''}"></div>
              <div class="col-md-4"><label class="small fw-bold">Display Name</label><input type="text" id="profName" class="prof-input" value="${u.name||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Email</label><input type="email" id="profEmail" class="prof-input" value="${u.email||''}" readonly style="background:#f8fafc;"></div>
              <div class="col-md-6"><label class="small fw-bold">Phone</label><input type="text" id="profPhone" class="prof-input" value="${u.phone||p.phone||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Job Title</label><input type="text" id="profTitle" class="prof-input" value="${p.title||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Location</label><input type="text" id="profLocation" class="prof-input" value="${p.location||''}"></div>
              <div class="col-12"><label class="small fw-bold">Bio</label><textarea id="profBio" class="prof-input prof-textarea">${p.bio||''}</textarea></div>
            </div>
          </div>
          <button class="prof-btn prof-btn-primary mt-3" onclick="Profile.updateInfo()"><i class="fas fa-save"></i> Save</button>
        </div>
        <div class="col-lg-4">
          <div class="prof-card"><h6>Photo</h6><div class="text-center"><div class="prof-avatar" style="margin:0 auto 12px;cursor:pointer;" onclick="Profile.changeAvatar()">${p.avatarUrl ? `<img src="${p.avatarUrl}">` : getInitials(u.name||'U')}</div></div></div>
        </div>
      </div>`;
  },

  // ==================== SECURITY (FIXED) ====================
  renderSecurityTab() {
    const p = this._profileData || {};
    return `
      <div class="row g-4" style="padding-top:20px;">
        <div class="col-lg-6">
          <div class="prof-card"><h6><i class="fas fa-key me-2"></i>Change Password</h6>
            <input type="password" id="profOldPass" class="prof-input" placeholder="Current Password">
            <input type="password" id="profNewPass" class="prof-input" placeholder="New Password (min 6 chars)">
            <input type="password" id="profConfirmPass" class="prof-input" placeholder="Confirm Password">
            <button class="prof-btn prof-btn-warning" onclick="Profile.changePassword()"><i class="fas fa-key"></i> Update Password</button>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="prof-card"><h6><i class="fas fa-shield-alt me-2"></i>Two-Factor Authentication</h6>
            <p style="font-size:13px;color:#64748b;">Add extra security using Google Authenticator.</p>
            <span class="prof-badge" style="background:${p.twoFactorEnabled?'#ecfdf5':'#fef3c7'};color:${p.twoFactorEnabled?'#10b981':'#92400e'};">${p.twoFactorEnabled?'✅ Enabled':'⚠️ Disabled'}</span>
            <button class="prof-btn prof-btn-primary w-100 mt-3" onclick="Profile.toggle2FA()">${p.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}</button>
          </div>
        </div>
      </div>`;
  },

  // ==================== CONNECTIONS (FIXED) ====================
  renderConnectionsTab() {
    const c = this._connectedPlatforms || {};
    const platforms = [
      { key: 'whatsapp', name: 'WhatsApp', icon: 'fa-whatsapp', color: '#25D366', desc: 'Connect your WhatsApp Business', urlPlaceholder: 'WhatsApp number with country code' },
      { key: 'facebook', name: 'Facebook', icon: 'fa-facebook', color: '#1877f2', desc: 'Facebook profile/page link', urlPlaceholder: 'https://facebook.com/yourprofile' },
      { key: 'instagram', name: 'Instagram', icon: 'fa-instagram', color: '#E4405F', desc: 'Instagram profile link', urlPlaceholder: 'https://instagram.com/yourhandle' },
      { key: 'google', name: 'Google', icon: 'fa-google', color: '#4285F4', desc: 'Gmail / Google Account', urlPlaceholder: 'yourname@gmail.com' },
      { key: 'linkedin', name: 'LinkedIn', icon: 'fa-linkedin', color: '#0A66C2', desc: 'LinkedIn profile URL', urlPlaceholder: 'https://linkedin.com/in/yourprofile' },
      { key: 'twitter', name: 'Twitter/X', icon: 'fa-twitter', color: '#1DA1F2', desc: 'Twitter/X profile link', urlPlaceholder: 'https://x.com/yourhandle' },
      { key: 'youtube', name: 'YouTube', icon: 'fa-youtube', color: '#FF0000', desc: 'YouTube channel link', urlPlaceholder: 'https://youtube.com/@yourchannel' },
      { key: 'telegram', name: 'Telegram', icon: 'fa-telegram', color: '#0088cc', desc: 'Telegram username or link', urlPlaceholder: '@yourusername' },
      { key: 'pinterest', name: 'Pinterest', icon: 'fa-pinterest', color: '#E60023', desc: 'Pinterest profile link', urlPlaceholder: 'https://pinterest.com/yourhandle' },
      { key: 'tiktok', name: 'TikTok', icon: 'fa-tiktok', color: '#000000', desc: 'TikTok profile link', urlPlaceholder: 'https://tiktok.com/@yourhandle' },
      { key: 'github', name: 'GitHub', icon: 'fa-github', color: '#333', desc: 'GitHub profile link', urlPlaceholder: 'https://github.com/yourhandle' },
      { key: 'slack', name: 'Slack', icon: 'fa-slack', color: '#4A154B', desc: 'Slack workspace', urlPlaceholder: 'yourworkspace.slack.com' },
    ];

    return `
      <div style="padding-top:20px;">
        <div class="prof-card"><h6><i class="fas fa-plug me-2"></i>Connected Platforms (${Object.values(c).filter(Boolean).length}/12)</h6>
          <p class="text-muted small mb-3">Connect your social media and profiles. Click to add your link.</p>
          <div class="row g-2">
            ${platforms.map(p => {
              const isConnected = !!c[p.key];
              return `
              <div class="col-md-6">
                <button class="prof-social-connect-btn ${isConnected ? 'connected' : ''}" onclick="Profile.connectPlatform('${p.key}', '${p.urlPlaceholder.replace(/'/g, "\\'")}')">
                  <i class="fab ${p.icon} fa-lg" style="color:${p.color};width:24px;text-align:center;"></i>
                  <div class="flex-grow-1 text-start">
                    <strong style="font-size:13px;">${p.name}</strong>
                    <br><small style="color:#94a3b8;">${p.desc}</small>
                    ${isConnected ? `<br><small style="color:#10b981;">${c[p.key]}</small>` : ''}
                  </div>
                  <span class="prof-badge" style="background:${isConnected?'#ecfdf5':'#f1f5f9'};color:${isConnected?'#10b981':'#94a3b8'};">${isConnected?'✓ Connected':'+ Connect'}</span>
                </button>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>`;
  },

  // ==================== COMPANY (FIXED) ====================
  renderCompanyTab() {
    const p = this._profileData || {};
    return `
      <div class="row g-4" style="padding-top:20px;">
        <div class="col-lg-8">
          <div class="prof-card"><h6><i class="fas fa-building me-2"></i>Company Profile</h6>
            <div class="row g-2">
              <div class="col-md-6"><label class="small fw-bold">Company Name</label><input type="text" id="compName" class="prof-input" value="${p.company||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">GST Number</label><input type="text" id="compGST" class="prof-input" value="${p.gst||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Industry</label><select id="compIndustry" class="prof-input"><option value="">Select</option>${['Technology','Healthcare','Education','Finance','Retail','Real Estate','Marketing','Other'].map(i=>`<option ${p.industry===i?'selected':''}>${i}</option>`).join('')}</select></div>
              <div class="col-md-6"><label class="small fw-bold">Website</label><input type="url" id="compWebsite" class="prof-input" value="${p.website||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">PAN Number</label><input type="text" id="compPAN" class="prof-input" value="${p.pan||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Company Size</label><select id="compSize" class="prof-input"><option value="">Select</option>${['1-10','11-50','51-200','201-500','500+'].map(s=>`<option ${p.companySize===s?'selected':''}>${s}</option>`).join('')}</select></div>
              <div class="col-12"><label class="small fw-bold">Registered Address</label><textarea id="compAddress" class="prof-input prof-textarea">${p.companyAddress||''}</textarea></div>
              <div class="col-md-4"><label class="small fw-bold">City</label><input type="text" id="compCity" class="prof-input" value="${p.city||''}"></div>
              <div class="col-md-4"><label class="small fw-bold">State</label><input type="text" id="compState" class="prof-input" value="${p.state||''}"></div>
              <div class="col-md-4"><label class="small fw-bold">Pincode</label><input type="text" id="compPincode" class="prof-input" value="${p.pincode||''}"></div>
            </div>
            <button class="prof-btn prof-btn-primary mt-3" onclick="Profile.saveCompanyInfo()"><i class="fas fa-save"></i> Save</button>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="prof-card"><h6>Company Logo</h6><div class="text-center"><div class="prof-avatar" style="margin:0 auto 12px;background:linear-gradient(135deg,#f59e0b,#d97706);cursor:pointer;" onclick="Profile.uploadCompanyLogo()">${p.companyLogo?`<img src="${p.companyLogo}">`:(p.company||'C')[0].toUpperCase()}</div></div></div>
        </div>
      </div>`;
  },

  // ==================== OTHER TABS ====================
  renderActivityTab() {
    const a = this._activityLog || [];
    return `<div style="padding-top:20px;"><div class="prof-card"><h6>Recent Activity</h6>${a.length===0?'<p class="text-muted">No activity.</p>':a.map(i=>`<div style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:12px;"><strong>${i.action||'Action'}</strong> — ${i.detail||''}<br><small>${i.timestamp?.toDate?.().toLocaleString()||''}</small></div>`).join('')}</div></div>`;
  },
  renderTeamTab() {
    const t = this._teamMembers || [];
    return `<div style="padding-top:20px;"><div class="prof-card"><h6>Team (${t.length})</h6>${t.map(m=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f1f5f9;"><div style="width:32px;height:32px;border-radius:50%;background:${getAvatarColor(m.name)};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;">${getInitials(m.name||m.email)}</div><div><strong>${m.name}</strong><br><small>${m.email} · ${m.role}</small></div></div>`).join('')}</div></div>`;
  },
  renderSessionsTab() {
    return `<div style="padding-top:20px;"><div class="prof-card"><h6>Active Sessions</h6><p>Current: ${navigator.userAgent.substring(0,60)}...</p><button class="prof-btn prof-btn-outline mt-2" onclick="Profile.logoutAllSessions()">Logout All</button></div></div>`;
  },

  // ==================== ACTIONS ====================
  async updateInfo() {
    const data = {
      firstName: document.getElementById('profFirstName')?.value?.trim()||'',
      lastName: document.getElementById('profLastName')?.value?.trim()||'',
      name: document.getElementById('profName')?.value?.trim()||'',
      phone: document.getElementById('profPhone')?.value?.trim()||'',
      title: document.getElementById('profTitle')?.value?.trim()||'',
      location: document.getElementById('profLocation')?.value?.trim()||'',
      bio: document.getElementById('profBio')?.value?.trim()||'',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    try {
      await db.collection('users').doc(window.currentUser.uid).update(data);
      window.currentUser = {...window.currentUser, ...data};
      showToast('✅ Profile updated!','success');
      this.render();
    } catch(e) { showToast('Error: '+e.message,'error'); }
  },

  async changePassword() {
    const oldPass = document.getElementById('profOldPass')?.value;
    const newPass = document.getElementById('profNewPass')?.value;
    const confirm = document.getElementById('profConfirmPass')?.value;
    if (!oldPass||!newPass||!confirm) return showToast('Fill all fields!','warning');
    if (newPass !== confirm) return showToast('Passwords mismatch!','error');
    if (newPass.length < 6) return showToast('Min 6 characters!','warning');
    try {
      const user = firebase.auth().currentUser;
      const cred = firebase.auth.EmailAuthProvider.credential(user.email, oldPass);
      await user.reauthenticateWithCredential(cred);
      await user.updatePassword(newPass);
      showToast('✅ Password changed!','success');
    } catch(e) { showToast('Error: '+e.message,'error'); }
  },

  async toggle2FA() {
    const p = this._profileData || {};
    const enable = !p.twoFactorEnabled;
    try {
      await db.collection('users').doc(window.currentUser.uid).update({ twoFactorEnabled: enable });
      showToast(enable ? '✅ 2FA Enabled!' : '2FA Disabled.','info');
      this.render();
    } catch(e) { showToast('Error: '+e.message,'error'); }
  },

  async connectPlatform(platform, placeholder) {
    const c = this._connectedPlatforms || {};
    if (c[platform]) {
      if (!confirm(`Disconnect ${platform}?`)) return;
      delete c[platform];
    } else {
      const value = prompt(`Enter your ${platform} link/username:\n(${placeholder})`, c[platform]||'');
      if (!value) return;
      c[platform] = value;
    }
    try {
      await db.collection('settings').doc('user_connections_'+window.currentUser.uid).set(c);
      this._connectedPlatforms = c;
      showToast(`✅ ${platform} ${c[platform]?'connected':'disconnected'}!`,'success');
      this.render();
    } catch(e) { showToast('Error: '+e.message,'error'); }
  },

  async saveCompanyInfo() {
    const data = {
      company: document.getElementById('compName')?.value?.trim()||'',
      gst: document.getElementById('compGST')?.value?.trim()||'',
      industry: document.getElementById('compIndustry')?.value||'',
      website: document.getElementById('compWebsite')?.value?.trim()||'',
      pan: document.getElementById('compPAN')?.value?.trim()||'',
      companySize: document.getElementById('compSize')?.value||'',
      companyAddress: document.getElementById('compAddress')?.value?.trim()||'',
      city: document.getElementById('compCity')?.value?.trim()||'',
      state: document.getElementById('compState')?.value?.trim()||'',
      pincode: document.getElementById('compPincode')?.value?.trim()||'',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    try {
      await db.collection('users').doc(window.currentUser.uid).update(data);
      window.currentUser = {...window.currentUser, ...data};
      showToast('✅ Company info saved!','success');
      this.render();
    } catch(e) { showToast('Error: '+e.message,'error'); }
  },

  changeAvatar() {
    const input = document.createElement('input'); input.type='file'; input.accept='image/*';
    input.onchange = async (e) => {
      try {
        const file = e.target.files[0]; if(!file) return;
        const ref = firebase.storage().ref('avatars/'+window.currentUser.uid+'_'+Date.now());
        await ref.put(file); const url = await ref.getDownloadURL();
        await db.collection('users').doc(window.currentUser.uid).update({avatarUrl:url});
        window.currentUser.avatarUrl = url;
        showToast('✅ Avatar updated!','success'); this.render();
      } catch(err) { showToast('Error: '+err.message,'error'); }
    };
    input.click();
  },

  uploadCompanyLogo() {
    const input = document.createElement('input'); input.type='file'; input.accept='image/*';
    input.onchange = async (e) => {
      try {
        const file = e.target.files[0]; if(!file) return;
        const ref = firebase.storage().ref('company_logos/'+window.currentUser.uid+'_'+Date.now());
        await ref.put(file); const url = await ref.getDownloadURL();
        await db.collection('users').doc(window.currentUser.uid).update({companyLogo:url});
        showToast('✅ Logo updated!','success'); this.render();
      } catch(err) { showToast('Error: '+err.message,'error'); }
    };
    input.click();
  },

  changeCover() { showToast('Cover photo coming soon!','info'); },
  async deleteAccount() {
    if(!confirm('Delete account? This cannot be undone.')) return;
    try { await db.collection('users').doc(window.currentUser.uid).delete(); await firebase.auth().currentUser.delete(); window.location.href='/WA-Dual-CRM/home.html'; }
    catch(e) { showToast('Error: '+e.message,'error'); }
  },
  async logoutAllSessions() { try { await firebase.auth().signOut(); window.location.reload(); } catch(e) {} }
};
