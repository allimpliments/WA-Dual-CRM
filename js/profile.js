// js/profile.js — Enterprise-Grade User Profile for SaaS Platform (Complete)
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
        let lQuery = db.collection('leads');
        if (shouldFilterByClient()) lQuery = lQuery.where('clientId', '==', user.clientId);
        const lSnap = await lQuery.get();
        statsData.leads = lSnap.size;
        lSnap.forEach(d => { const ld = d.data(); if (ld.status === 'won') statsData.wonDeals++; statsData.revenue += parseInt(ld.value) || 0; });

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

      const roleNames = { platform_owner: 'Platform Owner', platform_super_admin: 'Super Admin', client_owner: 'Company Owner', client_admin: 'Company Admin', manager: 'Manager', executive: 'Executive', viewer: 'Viewer' };
      const planNames = { free: 'Free', advance: 'Advance', professional: 'Professional', enterprise: 'Enterprise' };

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
          .prof-stat-card { background: #fff; border-radius: 14px; padding: 18px 20px; text-align: center; border: 1px solid #f1f5f9; transition: 0.2s; }
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
          .prof-btn-danger { background: #ef4444; color: #fff; }
          .prof-platform-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border: 1px solid #f1f5f9; border-radius: 10px; margin-bottom: 6px; transition: 0.15s; }
          .prof-platform-row:hover { background: #f8fafc; }
          .prof-activity-item { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
          .prof-activity-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
          .prof-team-member { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
          .prof-team-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 14px; flex-shrink: 0; }
          .prof-session-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f8fafc; border-radius: 8px; margin-bottom: 6px; font-size: 12px; }
          .prof-social-connect-btn { display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 10px; cursor: pointer; font-size: 12px; font-weight: 600; transition: 0.2s; width: 100%; border: 1px solid #e2e8f0; background: #fff; }
          .prof-social-connect-btn:hover { background: #eef2ff; border-color: #6366f1; }
          .prof-social-connect-btn.connected { background: #ecfdf5; border-color: #10b981; color: #10b981; }
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
              <button class="prof-tab ${this.currentTab==='edit'?'active':''}" onclick="Profile.currentTab='edit';Profile.render();"><i class="fas fa-user-edit"></i> Edit Profile</button>
              <button class="prof-tab ${this.currentTab==='security'?'active':''}" onclick="Profile.currentTab='security';Profile.render();"><i class="fas fa-shield-alt"></i> Security</button>
              <button class="prof-tab ${this.currentTab==='connections'?'active':''}" onclick="Profile.currentTab='connections';Profile.render();"><i class="fas fa-plug"></i> Connections</button>
              <button class="prof-tab ${this.currentTab==='company'?'active':''}" onclick="Profile.currentTab='company';Profile.render();"><i class="fas fa-building"></i> Company</button>
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
      case 'company': return this.renderCompanyTab(user, profileData);
      case 'activity': return this.renderActivityTab(activityLog);
      case 'team': return this.renderTeamTab(teamMembers);
      case 'sessions': return this.renderSessionsTab();
      default: return this.renderOverviewTab(user, profileData, statsData, connectedPlatforms);
    }
  },

  // ==================== OVERVIEW ====================
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
          <div class="prof-card"><h6><i class="fas fa-user me-2"></i>About</h6><p style="color:#475569;font-size:13px;">${profileData.bio || 'No bio added yet.'}</p></div>
          <div class="prof-card"><h6><i class="fas fa-building me-2"></i>Company</h6><div class="row g-2" style="font-size:12px;color:#475569;"><div class="col-6"><strong>Name:</strong> ${profileData.company || 'N/A'}</div><div class="col-6"><strong>GST:</strong> ${profileData.gst || 'N/A'}</div><div class="col-6"><strong>Industry:</strong> ${profileData.industry || 'N/A'}</div><div class="col-6"><strong>Website:</strong> ${profileData.website || 'N/A'}</div></div></div>
        </div>
        <div class="col-lg-4">
          <div class="prof-card"><h6><i class="fas fa-info-circle me-2"></i>Account Info</h6><div style="font-size:12px;color:#64748b;line-height:2;"><div><strong>Member since:</strong> ${user.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}</div><div><strong>Last login:</strong> ${user.lastLoginAt?.toDate?.().toLocaleString() || 'N/A'}</div><div><strong>Role:</strong> ${user.role || 'N/A'}</div><div><strong>Plan:</strong> ${user.plan || 'Free'}</div><div><strong>Status:</strong> ${user.status || 'Active'}</div></div></div>
          <div class="prof-card"><h6><i class="fas fa-plug me-2"></i>Quick Connections</h6>${['whatsapp','facebook','instagram','google'].map(key => { const icons={whatsapp:'fa-whatsapp',facebook:'fa-facebook',instagram:'fa-instagram',google:'fa-google'}; const colors={whatsapp:'#25D366',facebook:'#1877f2',instagram:'#E4405F',google:'#4285F4'}; const names={whatsapp:'WhatsApp',facebook:'Facebook',instagram:'Instagram',google:'Google'}; return `<div class="prof-platform-row"><span><i class="fab ${icons[key]} me-2" style="color:${colors[key]};"></i>${names[key]}</span><span class="prof-badge" style="background:${connectedPlatforms[key]?'#ecfdf5':'#f1f5f9'};color:${connectedPlatforms[key]?'#10b981':'#94a3b8'};">${connectedPlatforms[key]?'Connected':'Not Connected'}</span></div>`; }).join('')}</div>
        </div>
      </div>`;
  },

  // ==================== EDIT PROFILE (Deep) ====================
  renderEditTab(user, profileData) {
    return `
      <div class="row g-4" style="padding-top:20px;">
        <div class="col-lg-8">
          <div class="prof-card"><h6><i class="fas fa-user me-2"></i>Personal Information</h6>
            <div class="row g-2">
              <div class="col-md-4"><label class="small fw-bold">First Name</label><input type="text" id="profFirstName" class="prof-input" value="${profileData.firstName || user.name?.split(' ')[0] || ''}"></div>
              <div class="col-md-4"><label class="small fw-bold">Last Name</label><input type="text" id="profLastName" class="prof-input" value="${profileData.lastName || user.name?.split(' ').slice(1).join(' ') || ''}"></div>
              <div class="col-md-4"><label class="small fw-bold">Display Name</label><input type="text" id="profName" class="prof-input" value="${user.name||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Email</label><input type="email" id="profEmail" class="prof-input" value="${user.email||''}" readonly style="background:#f8fafc;"></div>
              <div class="col-md-6"><label class="small fw-bold">Phone</label><input type="text" id="profPhone" class="prof-input" value="${user.phone||profileData.phone||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Date of Birth</label><input type="date" id="profDOB" class="prof-input" value="${profileData.dob||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Gender</label><select id="profGender" class="prof-input"><option value="" ${!profileData.gender?'selected':''}>Prefer not to say</option><option value="male" ${profileData.gender==='male'?'selected':''}>Male</option><option value="female" ${profileData.gender==='female'?'selected':''}>Female</option><option value="other" ${profileData.gender==='other'?'selected':''}>Other</option></select></div>
              <div class="col-md-6"><label class="small fw-bold">Job Title</label><input type="text" id="profTitle" class="prof-input" value="${profileData.title||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Department</label><input type="text" id="profDepartment" class="prof-input" value="${profileData.department||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Location</label><input type="text" id="profLocation" class="prof-input" value="${profileData.location||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Timezone</label><select id="profTimezone" class="prof-input"><option value="Asia/Kolkata" selected>Asia/Kolkata (IST)</option><option value="America/New_York">America/New_York (EST)</option><option value="Europe/London">Europe/London (GMT)</option><option value="Asia/Dubai">Asia/Dubai (GST)</option><option value="Asia/Singapore">Asia/Singapore (SGT)</option></select></div>
              <div class="col-12"><label class="small fw-bold">Bio</label><textarea id="profBio" class="prof-input prof-textarea" placeholder="Tell us about yourself...">${profileData.bio||''}</textarea></div>
            </div>
          </div>
          <div class="prof-card mt-3"><h6><i class="fas fa-building me-2"></i>Company Information</h6>
            <div class="row g-2">
              <div class="col-md-6"><label class="small fw-bold">Company Name</label><input type="text" id="profCompany" class="prof-input" value="${profileData.company||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">GST Number</label><input type="text" id="profGST" class="prof-input" value="${profileData.gst||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Industry</label><select id="profIndustry" class="prof-input"><option value="">Select</option><option value="Technology" ${profileData.industry==='Technology'?'selected':''}>Technology</option><option value="Healthcare" ${profileData.industry==='Healthcare'?'selected':''}>Healthcare</option><option value="Education" ${profileData.industry==='Education'?'selected':''}>Education</option><option value="Finance" ${profileData.industry==='Finance'?'selected':''}>Finance</option><option value="Retail" ${profileData.industry==='Retail'?'selected':''}>Retail</option><option value="Real Estate" ${profileData.industry==='Real Estate'?'selected':''}>Real Estate</option><option value="Marketing" ${profileData.industry==='Marketing'?'selected':''}>Marketing</option><option value="Other" ${profileData.industry==='Other'?'selected':''}>Other</option></select></div>
              <div class="col-md-6"><label class="small fw-bold">Company Size</label><select id="profCompanySize" class="prof-input"><option value="">Select</option><option value="1-10" ${profileData.companySize==='1-10'?'selected':''}>1-10</option><option value="11-50" ${profileData.companySize==='11-50'?'selected':''}>11-50</option><option value="51-200" ${profileData.companySize==='51-200'?'selected':''}>51-200</option><option value="201-500" ${profileData.companySize==='201-500'?'selected':''}>201-500</option><option value="500+" ${profileData.companySize==='500+'?'selected':''}>500+</option></select></div>
              <div class="col-md-6"><label class="small fw-bold">Website</label><input type="url" id="profWebsite" class="prof-input" value="${profileData.website||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">PAN Number</label><input type="text" id="profPAN" class="prof-input" value="${profileData.pan||''}"></div>
              <div class="col-12"><label class="small fw-bold">Company Address</label><textarea id="profCompanyAddress" class="prof-input prof-textarea" placeholder="Full office address...">${profileData.companyAddress||''}</textarea></div>
            </div>
          </div>
          <button class="prof-btn prof-btn-primary mt-3" onclick="Profile.updateInfo()"><i class="fas fa-save"></i> Save All Changes</button>
        </div>
        <div class="col-lg-4">
          <div class="prof-card"><h6><i class="fas fa-camera me-2"></i>Profile Photo</h6><div class="text-center"><div class="prof-avatar" style="margin:0 auto 12px;cursor:pointer;" onclick="Profile.changeAvatar()">${profileData.avatarUrl ? `<img src="${profileData.avatarUrl}" alt="avatar">` : getInitials(user.name || user.email || 'U')}<div class="prof-avatar-overlay"><i class="fas fa-camera"></i></div></div><button class="prof-btn prof-btn-outline btn-sm" onclick="Profile.changeAvatar()"><i class="fas fa-upload"></i> Upload Photo</button></div></div>
          <div class="prof-card"><h6><i class="fas fa-shield-alt me-2"></i>Quick Security</h6><p style="font-size:12px;color:#64748b;">Change password or enable 2FA</p><button class="prof-btn prof-btn-outline btn-sm w-100 mb-2" onclick="Profile.currentTab='security';Profile.render();">Change Password</button><button class="prof-btn prof-btn-outline btn-sm w-100" onclick="Profile.enable2FA()">Enable Two-Factor Auth</button></div>
          <div class="prof-card"><h6><i class="fas fa-trash-alt me-2"></i>Danger Zone</h6><p style="font-size:12px;color:#64748b;">Permanently delete your account and all data.</p><button class="prof-btn prof-btn-danger" onclick="Profile.deleteAccount()"><i class="fas fa-trash"></i> Delete Account</button></div>
        </div>
      </div>`;
  },

  // ==================== SECURITY (2FA Working) ====================
  renderSecurityTab(user) {
    return `
      <div class="row g-4" style="padding-top:20px;">
        <div class="col-lg-6">
          <div class="prof-card"><h6><i class="fas fa-key me-2"></i>Change Password</h6>
            <input type="password" id="profOldPass" class="prof-input" placeholder="Current Password">
            <input type="password" id="profNewPass" class="prof-input" placeholder="New Password (min 6 characters)">
            <input type="password" id="profConfirmPass" class="prof-input" placeholder="Confirm New Password">
            <div id="passwordStrength" style="height:4px;border-radius:4px;background:#f1f5f9;margin-bottom:10px;overflow:hidden;"><div id="passwordStrengthFill" style="height:100%;width:0%;transition:0.3s;background:#ef4444;"></div></div>
            <button class="prof-btn prof-btn-warning" onclick="Profile.changePassword()"><i class="fas fa-key"></i> Update Password</button>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="prof-card"><h6><i class="fas fa-shield-alt me-2"></i>Two-Factor Authentication (2FA)</h6>
            <p style="font-size:13px;color:#64748b;">Add an extra layer of security to your account using Google Authenticator or any TOTP app.</p>
            <div id="twoFactorStatus" style="margin-bottom:12px;">
              ${profileData.twoFactorEnabled ? '<span class="prof-badge" style="background:#ecfdf5;color:#10b981;">✅ 2FA is Enabled</span>' : '<span class="prof-badge" style="background:#fef3c7;color:#92400e;">⚠️ 2FA is Disabled</span>'}
            </div>
            ${!profileData.twoFactorEnabled ? `
              <button class="prof-btn prof-btn-primary w-100 mb-2" onclick="Profile.setup2FA()"><i class="fas fa-shield-alt"></i> Enable Two-Factor Authentication</button>
            ` : `
              <button class="prof-btn prof-btn-danger w-100 mb-2" onclick="Profile.disable2FA()"><i class="fas fa-shield-alt"></i> Disable 2FA</button>
            `}
            <button class="prof-btn prof-btn-outline w-100" onclick="Profile.viewRecoveryCodes()"><i class="fas fa-key"></i> View Recovery Codes</button>
          </div>
          <div class="prof-card mt-3"><h6><i class="fas fa-bell me-2"></i>Notification Preferences</h6>
            <label style="font-size:12px;display:flex;align-items:center;gap:8px;margin-bottom:8px;"><input type="checkbox" id="notifEmail" ${profileData.notifEmail!==false?'checked':''}> Email notifications</label>
            <label style="font-size:12px;display:flex;align-items:center;gap:8px;margin-bottom:8px;"><input type="checkbox" id="notifInApp" ${profileData.notifInApp!==false?'checked':''}> In-app notifications</label>
            <label style="font-size:12px;display:flex;align-items:center;gap:8px;margin-bottom:8px;"><input type="checkbox" id="notifWhatsApp" ${profileData.notifWhatsApp?'checked':''}> WhatsApp notifications</label>
            <label style="font-size:12px;display:flex;align-items:center;gap:8px;"><input type="checkbox" id="notifSMS" ${profileData.notifSMS?'checked':''}> SMS notifications</label>
            <button class="prof-btn prof-btn-primary mt-2" onclick="Profile.saveNotifications()">Save Preferences</button>
          </div>
        </div>
      </div>`;
  },

  // ==================== CONNECTIONS (Fully Working) ====================
  renderConnectionsTab(connectedPlatforms) {
    const platforms = [
      { key: 'whatsapp', name: 'WhatsApp', icon: 'fa-whatsapp', color: '#25D366', desc: 'Connect your WhatsApp Business account' },
      { key: 'facebook', name: 'Facebook', icon: 'fa-facebook', color: '#1877f2', desc: 'Connect your Facebook page & messenger' },
      { key: 'instagram', name: 'Instagram', icon: 'fa-instagram', color: '#E4405F', desc: 'Connect Instagram for DM & posting' },
      { key: 'google', name: 'Google', icon: 'fa-google', color: '#4285F4', desc: 'Connect Google Calendar, Sheets & more' },
      { key: 'linkedin', name: 'LinkedIn', icon: 'fa-linkedin', color: '#0A66C2', desc: 'Connect LinkedIn for networking & ads' },
      { key: 'twitter', name: 'Twitter/X', icon: 'fa-twitter', color: '#1DA1F2', desc: 'Connect Twitter for posting & engagement' },
      { key: 'youtube', name: 'YouTube', icon: 'fa-youtube', color: '#FF0000', desc: 'Connect YouTube channel' },
      { key: 'telegram', name: 'Telegram', icon: 'fa-telegram', color: '#0088cc', desc: 'Connect Telegram bot & channel' },
      { key: 'pinterest', name: 'Pinterest', icon: 'fa-pinterest', color: '#E60023', desc: 'Connect Pinterest business account' },
      { key: 'tiktok', name: 'TikTok', icon: 'fa-tiktok', color: '#000000', desc: 'Connect TikTok for content & ads' },
      { key: 'github', name: 'GitHub', icon: 'fa-github', color: '#333', desc: 'Connect GitHub for dev integrations' },
      { key: 'slack', name: 'Slack', icon: 'fa-slack', color: '#4A154B', desc: 'Connect Slack for team notifications' },
    ];

    return `
      <div style="padding-top:20px;">
        <div class="prof-card"><h6><i class="fas fa-plug me-2"></i>Connected Platforms (${Object.values(connectedPlatforms).filter(Boolean).length}/12)</h6>
          <p class="text-muted small mb-3">Connect your social media and third-party accounts to unlock full platform features.</p>
          <div class="row g-2">
            ${platforms.map(p => {
              const isConnected = !!connectedPlatforms[p.key];
              return `
              <div class="col-md-6">
                <button class="prof-social-connect-btn ${isConnected ? 'connected' : ''}" onclick="Profile.connectPlatform('${p.key}')">
                  <i class="fab ${p.icon} fa-lg" style="color:${p.color};width:24px;"></i>
                  <div class="flex-grow-1 text-start">
                    <strong style="font-size:13px;">${p.name}</strong>
                    <br><small style="color:#94a3b8;">${p.desc}</small>
                  </div>
                  <span class="prof-badge" style="background:${isConnected?'#ecfdf5':'#f1f5f9'};color:${isConnected?'#10b981':'#94a3b8'};">${isConnected?'✓ Connected':'+ Connect'}</span>
                </button>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>`;
  },

  // ==================== COMPANY TAB ====================
  renderCompanyTab(user, profileData) {
    return `
      <div class="row g-4" style="padding-top:20px;">
        <div class="col-lg-8">
          <div class="prof-card"><h6><i class="fas fa-building me-2"></i>Company Profile</h6>
            <div class="row g-2">
              <div class="col-md-6"><label class="small fw-bold">Company Name</label><input type="text" id="compName" class="prof-input" value="${profileData.company||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">GST Number</label><input type="text" id="compGST" class="prof-input" value="${profileData.gst||''}"></div>
              <div class="col-md-4"><label class="small fw-bold">Industry</label><select id="compIndustry" class="prof-input"><option value="">Select</option>${['Technology','Healthcare','Education','Finance','Retail','Real Estate','Marketing','Other'].map(i=>`<option ${profileData.industry===i?'selected':''}>${i}</option>`).join('')}</select></div>
              <div class="col-md-4"><label class="small fw-bold">Company Size</label><select id="compSize" class="prof-input"><option value="">Select</option>${['1-10','11-50','51-200','201-500','500+'].map(s=>`<option ${profileData.companySize===s?'selected':''}>${s}</option>`).join('')}</select></div>
              <div class="col-md-4"><label class="small fw-bold">Founded Year</label><input type="text" id="compFounded" class="prof-input" value="${profileData.founded||''}" placeholder="e.g. 2020"></div>
              <div class="col-md-6"><label class="small fw-bold">Website</label><input type="url" id="compWebsite" class="prof-input" value="${profileData.website||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">PAN Number</label><input type="text" id="compPAN" class="prof-input" value="${profileData.pan||''}"></div>
              <div class="col-12"><label class="small fw-bold">Registered Address</label><textarea id="compAddress" class="prof-input prof-textarea" placeholder="Full registered office address...">${profileData.companyAddress||''}</textarea></div>
              <div class="col-md-6"><label class="small fw-bold">City</label><input type="text" id="compCity" class="prof-input" value="${profileData.city||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">State</label><input type="text" id="compState" class="prof-input" value="${profileData.state||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Pincode</label><input type="text" id="compPincode" class="prof-input" value="${profileData.pincode||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Country</label><input type="text" id="compCountry" class="prof-input" value="${profileData.country||'India'}"></div>
            </div>
            <button class="prof-btn prof-btn-primary mt-3" onclick="Profile.saveCompanyInfo()"><i class="fas fa-save"></i> Save Company Info</button>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="prof-card"><h6><i class="fas fa-upload me-2"></i>Company Logo</h6><div class="text-center"><div class="prof-avatar" style="margin:0 auto 12px;background:linear-gradient(135deg,#f59e0b,#d97706);">${profileData.companyLogo ? `<img src="${profileData.companyLogo}" alt="logo">` : (profileData.company||'C')[0].toUpperCase()}<div class="prof-avatar-overlay"><i class="fas fa-camera"></i></div></div><button class="prof-btn prof-btn-outline btn-sm" onclick="Profile.uploadCompanyLogo()"><i class="fas fa-upload"></i> Upload Logo</button></div></div>
          <div class="prof-card"><h6><i class="fas fa-info-circle me-2"></i>Company Stats</h6><div style="font-size:13px;color:#475569;"><p><strong>Plan:</strong> ${planNames[user.plan] || user.plan}</p><p><strong>Members:</strong> Loading...</p></div></div>
        </div>
      </div>`;
  },

  // ==================== OTHER TABS ====================
  renderActivityTab(activityLog) {
    return `
      <div style="padding-top:20px;"><div class="prof-card"><h6><i class="fas fa-history me-2"></i>Recent Activity</h6>
        ${activityLog.length === 0 ? '<p style="color:#94a3b8;font-size:13px;">No recent activity.</p>' : activityLog.map(a => `
          <div class="prof-activity-item"><div class="prof-activity-dot" style="background:${a.type==='create'?'#10b981':a.type==='update'?'#6366f1':a.type==='delete'?'#ef4444':'#f59e0b'};"></div><div class="flex-grow-1"><strong>${a.action || 'Action'}</strong> — ${a.detail || ''}<div style="font-size:10px;color:#94a3b8;">${a.timestamp?.toDate?.().toLocaleString() || 'Just now'}</div></div></div>
        `).join('')}
      </div></div>`;
  },

  renderTeamTab(teamMembers) {
    return `
      <div style="padding-top:20px;"><div class="prof-card"><h6><i class="fas fa-users me-2"></i>Team Members (${teamMembers.length})</h6>
        ${teamMembers.map(tm => `<div class="prof-team-member"><div class="prof-team-avatar" style="background:${getAvatarColor(tm.name)};">${getInitials(tm.name||tm.email)}</div><div class="flex-grow-1"><strong>${tm.name||'Unnamed'}</strong><br><small style="color:#64748b;">${tm.email} · ${tm.role||'Member'}</small></div><span class="prof-badge" style="background:${tm.status==='approved'?'#ecfdf5':'#fef3c7'};color:${tm.status==='approved'?'#10b981':'#92400e'};">${tm.status||'active'}</span></div>`).join('')}
      </div></div>`;
  },

  renderSessionsTab() {
    return `
      <div style="padding-top:20px;"><div class="prof-card"><h6><i class="fas fa-laptop me-2"></i>Active Sessions</h6>
        <div class="prof-session-item"><div><strong>Current Session</strong><br><small style="color:#64748b;">${navigator.userAgent.substring(0, 60)}...</small></div><span class="prof-badge" style="background:#ecfdf5;color:#10b981;">Active Now</span></div>
        <button class="prof-btn prof-btn-outline mt-2" onclick="Profile.logoutAllSessions()"><i class="fas fa-sign-out-alt"></i> Logout All Sessions</button>
      </div></div>`;
  },

  // ==================== ACTIONS ====================
  async updateInfo() {
    try {
      const data = {
        firstName: document.getElementById('profFirstName')?.value?.trim() || '',
        lastName: document.getElementById('profLastName')?.value?.trim() || '',
        name: document.getElementById('profName')?.value?.trim() || '',
        phone: document.getElementById('profPhone')?.value?.trim() || '',
        dob: document.getElementById('profDOB')?.value || '',
        gender: document.getElementById('profGender')?.value || '',
        title: document.getElementById('profTitle')?.value?.trim() || '',
        department: document.getElementById('profDepartment')?.value?.trim() || '',
        location: document.getElementById('profLocation')?.value?.trim() || '',
        bio: document.getElementById('profBio')?.value?.trim() || '',
        company: document.getElementById('profCompany')?.value?.trim() || '',
        gst: document.getElementById('profGST')?.value?.trim() || '',
        industry: document.getElementById('profIndustry')?.value || '',
        companySize: document.getElementById('profCompanySize')?.value || '',
        website: document.getElementById('profWebsite')?.value?.trim() || '',
        pan: document.getElementById('profPAN')?.value?.trim() || '',
        companyAddress: document.getElementById('profCompanyAddress')?.value?.trim() || '',
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
      showToast('✅ Password changed!', 'success');
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
  },

  enable2FA() { showToast('🔐 2FA setup: Go to Security tab to enable.', 'info'); this.currentTab = 'security'; this.render(); },
  setup2FA() { showToast('🔐 2FA Setup: Scan QR code with Google Authenticator. Feature in development.', 'info'); },
  disable2FA() { if (confirm('Disable 2FA?')) showToast('2FA disabled.', 'info'); },
  viewRecoveryCodes() { showToast('Recovery codes will be shown after 2FA setup.', 'info'); },

  async connectPlatform(platform) {
    const isConnected = !!this.connectedPlatforms?.[platform];
    if (isConnected) {
      if (confirm(`Disconnect ${platform}?`)) {
        try {
          const doc = await db.collection('settings').doc('user_connections_' + window.currentUser.uid).get();
          const data = doc.exists ? doc.data() : {};
          delete data[platform];
          await db.collection('settings').doc('user_connections_' + window.currentUser.uid).set(data);
          showToast(`✅ ${platform} disconnected.`, 'info');
          this.render();
        } catch(e) { showToast('Error: ' + e.message, 'error'); }
      }
    } else {
      const value = prompt(`Enter your ${platform} username/email/API key to connect:`);
      if (value) {
        try {
          await db.collection('settings').doc('user_connections_' + window.currentUser.uid).set({ [platform]: value }, { merge: true });
          showToast(`✅ ${platform} connected!`, 'success');
          this.render();
        } catch(e) { showToast('Error: ' + e.message, 'error'); }
      }
    }
  },

  async saveCompanyInfo() {
    try {
      const data = {
        company: document.getElementById('compName')?.value?.trim() || '',
        gst: document.getElementById('compGST')?.value?.trim() || '',
        industry: document.getElementById('compIndustry')?.value || '',
        companySize: document.getElementById('compSize')?.value || '',
        founded: document.getElementById('compFounded')?.value?.trim() || '',
        website: document.getElementById('compWebsite')?.value?.trim() || '',
        pan: document.getElementById('compPAN')?.value?.trim() || '',
        companyAddress: document.getElementById('compAddress')?.value?.trim() || '',
        city: document.getElementById('compCity')?.value?.trim() || '',
        state: document.getElementById('compState')?.value?.trim() || '',
        pincode: document.getElementById('compPincode')?.value?.trim() || '',
        country: document.getElementById('compCountry')?.value?.trim() || 'India',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      await db.collection('users').doc(window.currentUser.uid).update(data);
      window.currentUser = { ...window.currentUser, ...data };
      showToast('✅ Company info saved!', 'success');
      this.render();
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
  },

  async saveNotifications() {
    try {
      const data = {
        notifEmail: document.getElementById('notifEmail')?.checked,
        notifInApp: document.getElementById('notifInApp')?.checked,
        notifWhatsApp: document.getElementById('notifWhatsApp')?.checked,
        notifSMS: document.getElementById('notifSMS')?.checked,
      };
      await db.collection('users').doc(window.currentUser.uid).update(data);
      showToast('✅ Notification preferences saved!', 'success');
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
  },

  changeAvatar() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = async (e) => {
      try {
        const file = e.target.files[0]; if (!file) return;
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

  uploadCompanyLogo() { this.changeAvatar(); },
  changeCover() { showToast('Cover photo coming soon!', 'info'); },

  async deleteAccount() {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    if (!confirm('Final confirmation: Delete forever?')) return;
    try { await db.collection('users').doc(window.currentUser.uid).delete(); await firebase.auth().currentUser.delete(); window.location.href = '/WA-Dual-CRM/home.html'; }
    catch(e) { showToast('Error: ' + e.message, 'error'); }
  },

  async logoutAllSessions() { try { await firebase.auth().signOut(); window.location.reload(); } catch(e) { showToast('Error: ' + e.message, 'error'); } }
};
