const Social = {
  currentTab: 'facebook',
  savedAccounts: {},

  async render() {
    // Hide CRM sidebar completely
    const crmSidebar = document.getElementById('sidebar');
    if (crmSidebar) crmSidebar.style.display = 'none';
    const mainArea = document.querySelector('.main-area');
    if (mainArea) mainArea.style.marginLeft = '0';

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

    const crmSections = [
      { name: 'Dashboard', icon: 'fa-tachometer-alt', section: 'dashboard' },
      { name: 'Chats', icon: 'fa-comments', section: 'chats' },
      { name: 'Contacts', icon: 'fa-users', section: 'contacts' },
      { name: 'Leads', icon: 'fa-funnel-dollar', section: 'leads' },
      { name: 'Templates', icon: 'fa-layer-group', section: 'templates' },
      { name: 'Campaigns', icon: 'fa-rocket', section: 'campaigns' },
      { name: 'Forms', icon: 'fa-wpforms', section: 'forms' },
      { name: 'Chatbot', icon: 'fa-robot', section: 'chatbot' },
      { name: 'Setup', icon: 'fa-cog', section: 'setup' },
    ];

    let html = `
      <style>
        .social-full { height: 100vh; display: flex; flex-direction: column; background: #f0f2f5; overflow: hidden; }
        
        /* Top Auto-Hide Header */
        .social-top-header { position: fixed; top: 0; left: 0; right: 0; z-index: 100; transform: translateY(-100%); transition: transform 0.3s ease; background: #fff; border-bottom: 1px solid #e0e0e0; padding: 6px 16px; display: flex; align-items: center; gap: 8px; }
        .social-top-header.visible { transform: translateY(0); }
        .social-top-header .crm-nav { display: flex; gap: 2px; overflow-x: auto; flex: 1; }
        .social-top-header .crm-nav a { padding: 5px 10px; border-radius: 14px; font-size: 11px; font-weight: 500; text-decoration: none; color: #1c1e21; white-space: nowrap; }
        .social-top-header .crm-nav a:hover { background: #f0f2f5; }
        .social-top-header .crm-nav a i { margin-right: 3px; font-size: 10px; }
        
        /* Trigger zone at top */
        .header-trigger-zone { position: fixed; top: 0; left: 0; right: 0; height: 10px; z-index: 101; }
        
        /* Main content area - full window */
        .social-main-area { flex: 1; display: flex; align-items: center; justify-content: center; padding: 10px; }
        .phone-frame { width: 420px; max-width: 100%; height: 100%; max-height: 780px; background: #fff; border-radius: 20px; box-shadow: 0 8px 40px rgba(0,0,0,0.12); overflow: hidden; display: flex; flex-direction: column; }
        .phone-frame .phone-top { height: 36px; background: #f8f9fa; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; padding: 0 10px; gap: 6px; flex-shrink: 0; }
        .phone-frame .phone-top .dot { width: 7px; height: 7px; border-radius: 50%; }
        .phone-frame .phone-top .dot.r { background: #fa3e3e; } .dot.y { background: #f59e0b; } .dot.g { background: #31a24c; }
        .phone-frame .phone-top .addr { flex: 1; padding: 2px 6px; background: #fff; border: 1px solid #dadde1; border-radius: 4px; font-size: 9px; text-align: center; color: #888; }
        .phone-frame .phone-body { flex: 1; position: relative; overflow: hidden; background: #fff; }
        .phone-frame .phone-body .blocked-msg { display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; padding: 20px; text-align: center; background: #fafbfc; }
        .phone-frame .cred-row { padding: 6px 10px; background: #fff; border-top: 1px solid #e0e0e0; display: flex; gap: 4px; flex-shrink: 0; }
        .phone-frame .cred-row input { flex: 1; padding: 4px 6px; border: 1px solid #dadde1; border-radius: 4px; font-size: 10px; }
        .phone-frame .cred-row button { padding: 4px 8px; font-size: 10px; }
        
        /* Bottom Sticky Sub Menu */
        .social-submenu { position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%); z-index: 100; background: #fff; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.12); padding: 6px 12px; display: flex; gap: 3px; }
        .social-submenu .sub-tab { padding: 6px 12px; border-radius: 18px; cursor: pointer; font-size: 11px; font-weight: 500; white-space: nowrap; border: 1px solid #dadde1; background: #fff; transition: 0.15s; }
        .social-submenu .sub-tab:hover { background: #f5f6f7; }
        .social-submenu .sub-tab.active { background: #1877f2; color: #fff; border-color: #1877f2; }
        .social-submenu .sub-tab .saved-dot { width: 5px; height: 5px; border-radius: 50%; display: inline-block; margin-left: 4px; }
        .social-submenu .sub-tab .saved-dot.yes { background: #31a24c; }
        .social-submenu .sub-tab .saved-dot.no { background: #dadde1; }
        
        @media (max-width: 768px) { 
          .phone-frame { width: 100%; border-radius: 0; max-height: 100%; } 
          .social-submenu { bottom: 8px; padding: 4px 8px; } 
          .social-submenu .sub-tab { padding: 5px 8px; font-size: 10px; } 
        }
      </style>

      <div class="social-full">
        <!-- Top Auto-Hide Header -->
        <div class="header-trigger-zone" onmouseenter="Social.showHeader()"></div>
        <div class="social-top-header" id="socialTopHeader" onmouseleave="Social.hideHeader()">
          <span style="font-weight:700;font-size:12px;color:#1877f2;">📱 CRM</span>
          <div class="crm-nav">
            ${crmSections.map(s => `<a href="#" onclick="Social.goToSection('${s.section}')"><i class="fas ${s.icon}"></i> ${s.name}</a>`).join('')}
          </div>
        </div>

        <!-- Main Content -->
        <div class="social-main-area">
          <div class="phone-frame">
            <div class="phone-top">
              <span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>
              <div class="addr">${this.getPlatformUrl(this.currentTab)}</div>
            </div>
            <div class="phone-body" id="phoneBody">
              <div class="blocked-msg" id="blockedMsg">
                <i class="fab ${this.getPlatformIcon(this.currentTab)} fa-3x" style="color:#1877f2;margin-bottom:10px;"></i>
                <h6>${this.getPlatformName(this.currentTab)}</h6>
                <p class="text-muted small">This platform blocks direct embedding.</p>
                <button class="btn btn-primary btn-sm" onclick="Social.openPopup('${this.currentTab}')">🔐 Open ${this.getPlatformName(this.currentTab)} in Popup</button>
              </div>
            </div>
            <div class="cred-row">
              <input type="text" id="credUser" placeholder="User/Email">
              <input type="password" id="credPass" placeholder="Password">
              <button class="btn btn-sm btn-primary" onclick="Social.saveCredentials('${this.currentTab}')">💾</button>
            </div>
          </div>
        </div>

        <!-- Bottom Sticky Sub Menu -->
        <div class="social-submenu">
          ${platforms.map(p => `
            <div class="sub-tab ${this.currentTab === p.id ? 'active' : ''}" onclick="Social.switchTab('${p.id}')">
              <i class="fab ${p.icon}"></i> ${p.name}
              <span class="saved-dot ${this.savedAccounts[p.id] ? 'yes' : 'no'}"></span>
            </div>
          `).join('')}
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

  showHeader() { document.getElementById('socialTopHeader')?.classList.add('visible'); },
  hideHeader() { document.getElementById('socialTopHeader')?.classList.remove('visible'); },

  switchTab(id) { this.currentTab = id; this.render(); },

  goToSection(section) {
    const crmSidebar = document.getElementById('sidebar');
    if (crmSidebar) crmSidebar.style.display = '';
    const mainArea = document.querySelector('.main-area');
    if (mainArea) mainArea.style.marginLeft = 'var(--sidebar-width)';
    loadSection(section);
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
    const w = 440, h = 780;
    const left = (screen.width - w) / 2, top = (screen.height - h) / 2;
    window.open(url, 'socialPopup', `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no`);
  }
};
