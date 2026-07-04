const Social = {
  currentTab: 'facebook',
  savedAccounts: {},

  async render() {
    // Auto-hide CRM sidebar when social tab is active
    const crmSidebar = document.getElementById('sidebar');
    if (crmSidebar) crmSidebar.style.display = 'none';
    const mainArea = document.querySelector('.main-area');
    if (mainArea) mainArea.style.marginLeft = '0';

    contentArea.innerHTML = '<p class="text-center py-5">Loading...</p>';
    await this.loadAccounts();

    const platforms = [
      { id: 'facebook', name: 'Facebook', icon: 'fa-facebook', color: '#1877f2', url: 'https://m.facebook.com/login.php' },
      { id: 'instagram', name: 'Instagram', icon: 'fa-instagram', color: '#E4405F', url: 'https://www.instagram.com/accounts/login/' },
      { id: 'meta', name: 'Meta Business', icon: 'fa-meta', color: '#0668E1', url: 'https://business.facebook.com/login/' },
      { id: 'linkedin', name: 'LinkedIn', icon: 'fa-linkedin', color: '#0A66C2', url: 'https://www.linkedin.com/login' },
      { id: 'twitter', name: 'Twitter/X', icon: 'fa-twitter', color: '#1DA1F2', url: 'https://x.com/i/flow/login' },
      { id: 'youtube', name: 'YouTube', icon: 'fa-youtube', color: '#FF0000', url: 'https://m.youtube.com/' },
      { id: 'ytstudio', name: 'YT Studio', icon: 'fa-youtube', color: '#FF0000', url: 'https://studio.youtube.com/' },
    ];

    let html = `
      <style>
        .social-full { height: calc(100vh - 60px); display: flex; flex-direction: column; background: #f0f2f5; }
        .social-topbar { height: 48px; background: #fff; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; padding: 0 16px; gap: 12px; flex-shrink: 0; }
        .social-topbar .platform-tabs { display: flex; gap: 4px; overflow-x: auto; flex: 1; }
        .social-topbar .platform-tab { padding: 8px 14px; border-radius: 20px; cursor: pointer; font-size: 12px; font-weight: 500; white-space: nowrap; border: 1px solid #dadde1; background: #fff; transition: 0.15s; }
        .social-topbar .platform-tab:hover { background: #f5f6f7; }
        .social-topbar .platform-tab.active { background: #1877f2; color: #fff; border-color: #1877f2; }
        .social-topbar .saved-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; margin-left: 4px; }
        .social-topbar .saved-dot.yes { background: #31a24c; }
        .social-topbar .saved-dot.no { background: #dadde1; }
        .social-frame-wrap { flex: 1; background: #e8eaed; display: flex; align-items: center; justify-content: center; padding: 16px; }
        .phone-frame { width: 420px; max-width: 100%; height: 100%; background: #fff; border-radius: 20px; box-shadow: 0 8px 40px rgba(0,0,0,0.12); overflow: hidden; display: flex; flex-direction: column; }
        .phone-frame .phone-header { height: 40px; background: #f8f9fa; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; padding: 0 10px; gap: 6px; flex-shrink: 0; }
        .phone-frame .phone-header .dot { width: 8px; height: 8px; border-radius: 50%; }
        .phone-frame .phone-header .dot.r { background: #fa3e3e; } .phone-frame .phone-header .dot.y { background: #f59e0b; } .phone-frame .phone-header .dot.g { background: #31a24c; }
        .phone-frame .phone-header .addr { flex: 1; padding: 3px 8px; background: #fff; border: 1px solid #dadde1; border-radius: 4px; font-size: 10px; text-align: center; color: #888; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .phone-frame .phone-body { flex: 1; position: relative; overflow: hidden; }
        .phone-frame .phone-body iframe { width: 100%; height: 100%; border: none; }
        .phone-frame .phone-body .blocked { display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; padding: 20px; text-align: center; background: #fafbfc; }
        .cred-bar { padding: 8px 12px; background: #fff; border-top: 1px solid #e0e0e0; display: flex; gap: 6px; align-items: center; flex-shrink: 0; }
        .cred-bar input { flex: 1; padding: 5px 8px; border: 1px solid #dadde1; border-radius: 6px; font-size: 11px; }
        .cred-bar button { padding: 5px 10px; font-size: 11px; white-space: nowrap; }
        @media (max-width: 768px) { .phone-frame { width: 100%; border-radius: 0; } }
      </style>

      <div class="social-full">
        <div class="social-topbar">
          <span style="font-weight:700;font-size:13px;color:#1c1e21;">📱</span>
          <div class="platform-tabs">
            ${platforms.map(p => `
              <div class="platform-tab ${this.currentTab === p.id ? 'active' : ''}" onclick="Social.switchTab('${p.id}')">
                <i class="fab ${p.icon}" style="color:${this.currentTab===p.id?'#fff':p.color};"></i> ${p.name}
                <span class="saved-dot ${this.savedAccounts[p.id] ? 'yes' : 'no'}"></span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="social-frame-wrap">
          <div class="phone-frame">
            <div class="phone-header">
              <span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>
              <div class="addr">${this.getPlatformUrl(this.currentTab)}</div>
            </div>
            <div class="phone-body" id="phoneBody">
              <div class="blocked" id="blockedMsg">
                <i class="fab ${this.getPlatformIcon(this.currentTab)} fa-3x" style="color:#1877f2;margin-bottom:10px;"></i>
                <h6>${this.getPlatformName(this.currentTab)}</h6>
                <p class="text-muted small">This platform blocks direct embedding in iframe.</p>
                <button class="btn btn-primary btn-sm" onclick="Social.openPopup('${this.currentTab}')">🔐 Open ${this.getPlatformName(this.currentTab)} in Popup Window</button>
              </div>
              <iframe id="socialFrame" style="display:none;" src="about:blank"></iframe>
            </div>
            <div class="cred-bar">
              <input type="text" id="credUser" placeholder="Username/Email">
              <input type="password" id="credPass" placeholder="Password">
              <button class="btn btn-sm btn-primary" onclick="Social.saveCredentials('${this.currentTab}')">💾 Save</button>
            </div>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  getPlatformUrl(id) {
    return { facebook: 'm.facebook.com', instagram: 'instagram.com', meta: 'business.facebook.com', linkedin: 'linkedin.com', twitter: 'x.com', youtube: 'm.youtube.com', ytstudio: 'studio.youtube.com' }[id] || '';
  },
  getPlatformName(id) {
    return { facebook: 'Facebook', instagram: 'Instagram', meta: 'Meta Business', linkedin: 'LinkedIn', twitter: 'Twitter/X', youtube: 'YouTube', ytstudio: 'YT Studio' }[id] || '';
  },
  getPlatformIcon(id) {
    return { facebook: 'fa-facebook', instagram: 'fa-instagram', meta: 'fa-meta', linkedin: 'fa-linkedin', twitter: 'fa-twitter', youtube: 'fa-youtube', ytstudio: 'fa-youtube' }[id] || 'fa-globe';
  },

  switchTab(id) {
    this.currentTab = id;
    this.render();
  },

  async loadAccounts() {
    try {
      const doc = await db.collection('settings').doc('social_accounts').get();
      if (doc.exists) this.savedAccounts = doc.data() || {};
    } catch (e) { this.savedAccounts = {}; }
  },

  async saveCredentials(platform) {
    const user = document.getElementById('credUser').value.trim();
    const pass = document.getElementById('credPass').value.trim();
    if (!user || !pass) return alert('Enter both!');
    this.savedAccounts[platform] = { user, pass };
    await db.collection('settings').doc('social_accounts').set(this.savedAccounts, { merge: true });
    alert('✅ Saved!');
  },

  openPopup(platform) {
    const urls = {
      facebook: 'https://m.facebook.com/login.php',
      instagram: 'https://www.instagram.com/accounts/login/',
      meta: 'https://business.facebook.com/login/',
      linkedin: 'https://www.linkedin.com/login',
      twitter: 'https://x.com/i/flow/login',
      youtube: 'https://m.youtube.com/',
      ytstudio: 'https://studio.youtube.com/'
    };
    const url = urls[platform] || 'about:blank';
    // Open a popup window styled like it's inside our app
    const w = 430, h = 800;
    const left = (screen.width - w) / 2, top = (screen.height - h) / 2;
    window.open(url, 'socialPopup', `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`);
  },

  // Cleanup when leaving social tab
  destroy() {
    const crmSidebar = document.getElementById('sidebar');
    if (crmSidebar) crmSidebar.style.display = '';
    const mainArea = document.querySelector('.main-area');
    if (mainArea) mainArea.style.marginLeft = 'var(--sidebar-width)';
  }
};
