const Social = {
  currentTab: 'facebook',
  savedAccounts: {},
  sidebarOpen: true,

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading...</p>';
    await this.loadAccounts();

    const platforms = [
      { id: 'facebook', name: 'Facebook', icon: 'fa-facebook', color: '#1877f2', url: 'https://m.facebook.com/' },
      { id: 'instagram', name: 'Instagram', icon: 'fa-instagram', color: '#E4405F', url: 'https://www.instagram.com/' },
      { id: 'meta', name: 'Meta Business', icon: 'fa-meta', color: '#0668E1', url: 'https://business.facebook.com/' },
      { id: 'linkedin', name: 'LinkedIn', icon: 'fa-linkedin', color: '#0A66C2', url: 'https://www.linkedin.com/' },
      { id: 'twitter', name: 'Twitter/X', icon: 'fa-twitter', color: '#1DA1F2', url: 'https://x.com/' },
      { id: 'youtube', name: 'YouTube', icon: 'fa-youtube', color: '#FF0000', url: 'https://m.youtube.com/' },
      { id: 'ytstudio', name: 'YT Studio', icon: 'fa-youtube', color: '#FF0000', url: 'https://studio.youtube.com/' },
    ];

    let html = `
      <style>
        .social-shell { display: flex; height: calc(100vh - 90px); position: relative; overflow: hidden; }
        .social-sidebar { width: 240px; background: #fff; border-right: 1px solid #e0e0e0; overflow-y: auto; flex-shrink: 0; transition: margin-left 0.3s ease; z-index: 10; }
        .social-sidebar.collapsed { margin-left: -240px; }
        .social-sidebar .platform-item { padding: 12px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
        .social-sidebar .platform-item:hover { background: #f5f6f7; }
        .social-sidebar .platform-item.active { background: #e7f3ff; color: #1877f2; border-left: 3px solid #1877f2; }
        .social-main { flex: 1; display: flex; flex-direction: column; background: #e8eaed; align-items: center; justify-content: center; padding: 20px; }
        .phone-frame { width: 430px; max-width: 100%; height: 100%; background: #fff; border-radius: 24px; box-shadow: 0 8px 40px rgba(0,0,0,0.12); overflow: hidden; display: flex; flex-direction: column; position: relative; }
        .phone-frame .phone-toolbar { height: 44px; background: #f8f9fa; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; padding: 0 12px; gap: 8px; flex-shrink: 0; }
        .phone-frame .phone-toolbar .dot { width: 10px; height: 10px; border-radius: 50%; }
        .phone-frame .phone-toolbar .dot.red { background: #fa3e3e; }
        .phone-frame .phone-toolbar .dot.yellow { background: #f59e0b; }
        .phone-frame .phone-toolbar .dot.green { background: #31a24c; }
        .phone-frame .phone-toolbar .url-bar { flex: 1; padding: 4px 10px; background: #fff; border: 1px solid #dadde1; border-radius: 6px; font-size: 11px; text-align: center; color: #666; }
        .phone-frame .phone-content { flex: 1; overflow: hidden; position: relative; }
        .phone-frame .phone-content webview, .phone-frame .phone-content iframe { width: 100%; height: 100%; border: none; }
        .phone-frame .phone-content .blocked-msg { display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; padding: 20px; text-align: center; }
        .toggle-sidebar-btn { position: absolute; left: 0; top: 50%; transform: translateY(-50%); background: #1877f2; color: #fff; border: none; border-radius: 0 8px 8px 0; padding: 16px 6px; cursor: pointer; z-index: 20; font-size: 14px; box-shadow: 2px 0 8px rgba(0,0,0,0.1); }
        .save-float { position: absolute; bottom: 10px; right: 10px; background: #fff; border-radius: 12px; padding: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); display: flex; gap: 4px; z-index: 5; }
        .save-float input { width: 100px; padding: 4px 6px; border: 1px solid #dadde1; border-radius: 4px; font-size: 10px; }
        .save-float button { padding: 4px 8px; font-size: 10px; }
        @media (max-width: 768px) {
          .phone-frame { width: 100%; border-radius: 0; }
          .social-sidebar { position: absolute; left: 0; top: 0; height: 100%; }
        }
      </style>

      <div class="social-shell">
        <button class="toggle-sidebar-btn" onclick="Social.toggleSidebar()" title="Toggle Sidebar">
          <i class="fas fa-chevron-${this.sidebarOpen ? 'left' : 'right'}"></i>
        </button>

        <div class="social-sidebar ${this.sidebarOpen ? '' : 'collapsed'}">
          <div style="padding:14px 16px;font-weight:700;font-size:12px;color:#65676b;">Platforms</div>
          ${platforms.map(p => `
            <div class="platform-item ${this.currentTab === p.id ? 'active' : ''}" onclick="Social.switchTab('${p.id}')">
              <i class="fab ${p.icon}" style="color:${p.color};width:18px;"></i> ${p.name}
              <span style="margin-left:auto;width:8px;height:8px;border-radius:50%;background:${this.savedAccounts[p.id] ? '#31a24c' : '#dadde1'};"></span>
            </div>
          `).join('')}
          <div style="padding:12px 16px;margin-top:auto;border-top:1px solid #e0e0e0;">
            <small class="text-muted">💡 Tip: Use mobile versions for better experience</small>
          </div>
        </div>

        <div class="social-main">
          <div class="phone-frame">
            <div class="phone-toolbar">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
              <div class="url-bar">${this.getPlatformUrl(this.currentTab)}</div>
              <button class="btn btn-sm btn-light" style="font-size:10px;" onclick="Social.openInNewTab('${this.currentTab}')">↗</button>
            </div>
            <div class="phone-content" id="phoneContent">
              <div class="blocked-msg">
                <i class="fab ${this.getPlatformIcon(this.currentTab)} fa-4x" style="color:#1877f2;margin-bottom:12px;"></i>
                <h6>${this.getPlatformName(this.currentTab)}</h6>
                <p class="text-muted small">This platform blocks embedding. Use the ↗ button to open in a new tab.</p>
                <button class="btn btn-primary btn-sm mt-2" onclick="Social.openInNewTab('${this.currentTab}')">🔗 Open ${this.getPlatformName(this.currentTab)}</button>
              </div>
            </div>
            <div class="save-float">
              <input type="text" id="credUser" placeholder="User">
              <input type="password" id="credPass" placeholder="Pass">
              <button class="btn btn-sm btn-primary" onclick="Social.saveCredentials('${this.currentTab}')">💾</button>
            </div>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  getPlatformUrl(id) {
    const urls = { facebook: 'm.facebook.com', instagram: 'instagram.com', meta: 'business.facebook.com', linkedin: 'linkedin.com', twitter: 'x.com', youtube: 'm.youtube.com', ytstudio: 'studio.youtube.com' };
    return urls[id] || '';
  },
  getPlatformName(id) {
    const names = { facebook: 'Facebook', instagram: 'Instagram', meta: 'Meta Business', linkedin: 'LinkedIn', twitter: 'Twitter/X', youtube: 'YouTube', ytstudio: 'YT Studio' };
    return names[id] || '';
  },
  getPlatformIcon(id) {
    return { facebook: 'fa-facebook', instagram: 'fa-instagram', meta: 'fa-meta', linkedin: 'fa-linkedin', twitter: 'fa-twitter', youtube: 'fa-youtube', ytstudio: 'fa-youtube' }[id] || 'fa-globe';
  },

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    document.querySelector('.social-sidebar').classList.toggle('collapsed');
    const btn = document.querySelector('.toggle-sidebar-btn i');
    if (btn) btn.className = 'fas fa-chevron-' + (this.sidebarOpen ? 'left' : 'right');
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

  openInNewTab(platform) {
    const urls = { facebook: 'https://m.facebook.com/', instagram: 'https://www.instagram.com/', meta: 'https://business.facebook.com/', linkedin: 'https://www.linkedin.com/', twitter: 'https://x.com/', youtube: 'https://m.youtube.com/', ytstudio: 'https://studio.youtube.com/' };
    window.open(urls[platform] || 'about:blank', '_blank');
  }
};
