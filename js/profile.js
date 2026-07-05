// js/profile.js — User Profile Management
const Profile = {
  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = 'var(--bg-primary, #f0f2f5)';

    const user = window.currentUser || {};
    
    let connectedPlatforms = {};
    try {
      const doc = await db.collection('settings').doc('user_connections_' + user.uid).get();
      if (doc.exists) connectedPlatforms = doc.data() || {};
    } catch(e) {}

    let html = `
      <style>
        .profile-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:24px;margin-bottom:16px;}
        .profile-avatar{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#1877f2,#6366f1);color:#fff;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;margin:0 auto 16px;}
        .profile-stat{text-align:center;padding:14px;background:#f9fafb;border-radius:10px;}
        .profile-stat .val{font-size:20px;font-weight:800;color:#1877f2;}
        .platform-connect{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:8px;}
      </style>

      <h4 style="font-weight:700;margin-bottom:20px;"><i class="fas fa-user-circle text-primary me-2"></i>My Profile</h4>

      <div class="row g-3">
        <div class="col-lg-4">
          <div class="profile-card text-center">
            <div class="profile-avatar">${(user.name||user.email||'?')[0].toUpperCase()}</div>
            <h5>${user.name||'User'}</h5>
            <p class="text-muted small">${user.email||''}</p>
            <span class="badge bg-${user.role==='admin'?'primary':user.role==='team'?'info':'success'}">${user.role||'client'}</span>
            <span class="badge bg-warning ms-1">${user.plan||'free'} Plan</span>
          </div>

          <div class="profile-card">
            <h6>Quick Stats</h6>
            <div class="row g-2" id="profileStats">
              <div class="col-6"><div class="profile-stat"><div class="val">-</div><small>Leads</small></div></div>
              <div class="col-6"><div class="profile-stat"><div class="val">-</div><small>Campaigns</small></div></div>
              <div class="col-6"><div class="profile-stat"><div class="val">-</div><small>Messages</small></div></div>
              <div class="col-6"><div class="profile-stat"><div class="val">-</div><small>Contacts</small></div></div>
            </div>
          </div>
        </div>

        <div class="col-lg-8">
          <div class="profile-card">
            <h6>Personal Information</h6>
            <div class="row g-2">
              <div class="col-md-6"><label class="small fw-bold">Full Name</label><input type="text" id="profName" class="form-control form-control-sm" value="${user.name||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Email</label><input type="email" id="profEmail" class="form-control form-control-sm" value="${user.email||''}" readonly></div>
              <div class="col-md-6"><label class="small fw-bold">Phone</label><input type="text" id="profPhone" class="form-control form-control-sm" value="${user.phone||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Company</label><input type="text" id="profCompany" class="form-control form-control-sm" value="${user.company||''}"></div>
              <div class="col-12"><label class="small fw-bold">Bio</label><textarea id="profBio" class="form-control form-control-sm" rows="2">${user.bio||''}</textarea></div>
            </div>
            <button class="btn btn-primary btn-sm mt-3" onclick="Profile.updateInfo()"><i class="fas fa-save me-1"></i> Save Changes</button>
          </div>

          <div class="profile-card">
            <h6>Change Password</h6>
            <div class="row g-2">
              <div class="col-md-4"><input type="password" id="profOldPass" class="form-control form-control-sm" placeholder="Current Password"></div>
              <div class="col-md-4"><input type="password" id="profNewPass" class="form-control form-control-sm" placeholder="New Password"></div>
              <div class="col-md-4"><input type="password" id="profConfirmPass" class="form-control form-control-sm" placeholder="Confirm Password"></div>
            </div>
            <button class="btn btn-warning btn-sm mt-2" onclick="Profile.changePassword()"><i class="fas fa-key me-1"></i> Update Password</button>
          </div>

          <div class="profile-card">
            <h6>Connected Platforms</h6>
            ${[
              {key:'whatsapp',name:'WhatsApp',icon:'fa-whatsapp',color:'#25D366'},
              {key:'facebook',name:'Facebook',icon:'fa-facebook',color:'#1877f2'},
              {key:'instagram',name:'Instagram',icon:'fa-instagram',color:'#E4405F'},
              {key:'google',name:'Google',icon:'fa-google',color:'#4285F4'},
            ].map(p => `
              <div class="platform-connect">
                <span><i class="fab ${p.icon} me-2" style="color:${p.color};"></i> ${p.name}</span>
                <span class="badge bg-${connectedPlatforms[p.key]?'success':'secondary'}">${connectedPlatforms[p.key]?'Connected':'Not Connected'}</span>
              </div>
            `).join('')}
          </div>

          <div class="profile-card">
            <h6>Plan: <span class="text-warning">${(user.plan||'free').toUpperCase()}</span></h6>
            <p class="small text-muted">Upgrade your plan for more features.</p>
            <button class="btn btn-outline-warning btn-sm" onclick="Plan.render()">View Plans</button>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
    this.loadStats();
  },

  async loadStats() {
    try {
      const [lSnap, cSnap, mSnap, ctSnap] = await Promise.all([
        db.collection('leads').get(),
        db.collection('campaigns').get(),
        db.collection('messages').get(),
        db.collection('contacts').get()
      ]);
      document.getElementById('profileStats').innerHTML = `
        <div class="col-6"><div class="profile-stat"><div class="val">${lSnap.size}</div><small>Leads</small></div></div>
        <div class="col-6"><div class="profile-stat"><div class="val">${cSnap.size}</div><small>Campaigns</small></div></div>
        <div class="col-6"><div class="profile-stat"><div class="val">${mSnap.size}</div><small>Messages</small></div></div>
        <div class="col-6"><div class="profile-stat"><div class="val">${ctSnap.size}</div><small>Contacts</small></div></div>
      `;
    } catch(e) {}
  },

  async updateInfo() {
    const data = {
      name: document.getElementById('profName')?.value?.trim()||'',
      phone: document.getElementById('profPhone')?.value?.trim()||'',
      company: document.getElementById('profCompany')?.value?.trim()||'',
      bio: document.getElementById('profBio')?.value?.trim()||'',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection('users').doc(window.currentUser.uid).update(data);
    window.currentUser = {...window.currentUser, ...data};
    alert('✅ Profile updated!');
  },

  async changePassword() {
    const oldPass = document.getElementById('profOldPass')?.value;
    const newPass = document.getElementById('profNewPass')?.value;
    const confirm = document.getElementById('profConfirmPass')?.value;
    if (!oldPass||!newPass||!confirm) return alert('Fill all fields!');
    if (newPass !== confirm) return alert('Passwords do not match!');
    if (newPass.length < 6) return alert('Password must be 6+ characters!');
    try {
      const user = firebase.auth().currentUser;
      const cred = firebase.auth.EmailAuthProvider.credential(user.email, oldPass);
      await user.reauthenticateWithCredential(cred);
      await user.updatePassword(newPass);
      alert('✅ Password changed successfully!');
    } catch(e) { alert('Error: ' + e.message); }
  }
};
