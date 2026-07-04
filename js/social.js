// js/social.js — Full Fixed Version
const Social = {
  currentTab: 'facebook',
  savedAccounts: {},

  async render() {
    const crmSidebar = document.getElementById('sidebar');
    if (crmSidebar) crmSidebar.style.display = 'none';
    const mainArea = document.querySelector('.main-area');
    if (mainArea) mainArea.style.marginLeft = '0';
    await this.loadAccounts();

    const platforms = [
      { id: 'facebook', name: 'Facebook', icon: 'fa-facebook', color: '#1877f2' },
      { id: 'instagram', name: 'Instagram', icon: 'fa-instagram', color: '#E4405F' },
      { id: 'meta', name: 'Meta Business', icon: 'fa-meta', color: '#0668E1' },
      { id: 'linkedin', name: 'LinkedIn', icon: 'fa-linkedin', color: '#0A66C2' },
      { id: 'twitter', name: 'Twitter/X', icon: 'fa-twitter', color: '#1DA1F2' },
      { id: 'youtube', name: 'YouTube', icon: 'fa-youtube', color: '#FF0000' },
      { id: 'ytstudio', name: 'YT Studio', icon: 'fa-youtube', color: '#FF0000' },
    ];

    let html = `
      <style>
        .social-full { height: calc(100vh - 120px); display: flex; flex-direction: column; background: #f0f2f5; }
        .social-main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 10px; }
        .phone-frame { width: 420px; max-width: 100%; height: 100%; max-height: 700px; background: #fff; border-radius: 20px; box-shadow: 0 8px 40px rgba(0,0,0,0.12); overflow: hidden; display: flex; flex-direction: column; }
        .phone-top { height: 36px; background: #f8f9fa; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; padding: 0 10px; gap: 6px; }
        .dot { width: 7px; height: 7px; border-radius: 50%; }
        .dot.r{background:#fa3e3e;}.dot.y{background:#f59e0b;}.dot.g{background:#31a24c;}
        .addr { flex: 1; padding: 2px 6px; background: #fff; border: 1px solid #dadde1; border-radius: 4px; font-size: 9px; text-align: center; color: #888; }
        .phone-body { flex: 1; background: #fafbfc; display: flex; align-items: center; justify-content: center; }
        .platform-card { text-align: center; padding: 20px; }
        .platform-card i { font-size: 48px; margin-bottom: 12px; }
        .cred-row { padding: 6px 10px; background: #fff; border-top: 1px solid #e0e0e0; display: flex; gap: 4px; }
        .cred-row input { flex: 1; padding: 4px 6px; border: 1px solid #dadde1; border-radius: 4px; font-size: 10px; }
        .cred-row button { padding: 4px 8px; font-size: 10px; }
        @media (max-width: 768px) { .phone-frame { width: 100%; border-radius: 0; max-height: 100%; } }
      </style>
      <div class="social-full">
        <div class="social-main">
          <div class="phone-frame">
            <div class="phone-top"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><div class="addr">${this.getDomain(this.currentTab)}</div></div>
            <div class="phone-body">
              <div class="platform-card">
                <i class="fab ${this.getIcon(this.currentTab)}" style="color:${this.getColor(this.currentTab)};"></i>
                <h5>${this.getName(this.currentTab)}</h5>
                <p class="text-muted small">Login to access this platform directly.</p>
                <button class="btn btn-primary btn-sm mt-2" onclick="Social.openPopup('${this.currentTab}')">🔐 Open ${this.getName(this.currentTab)}</button>
                ${this.savedAccounts[this.currentTab] ? '<p class="text-success small mt-2">✅ Credentials Saved</p>' : ''}
              </div>
            </div>
            <div class="cred-row">
              <input type="text" id="credUser" placeholder="User/Email">
              <input type="password" id="credPass" placeholder="Password">
              <button class="btn btn-sm btn-primary" onclick="Social.saveCredentials('${this.currentTab}')">💾 Save</button>
            </div>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  getDomain(id) { return { facebook: 'm.facebook.com', instagram: 'instagram.com', meta: 'business.facebook.com', linkedin: 'linkedin.com', twitter: 'x.com', youtube: 'm.youtube.com', ytstudio: 'studio.youtube.com' }[id]||''; },
  getName(id) { return { facebook: 'Facebook', instagram: 'Instagram', meta: 'Meta Business', linkedin: 'LinkedIn', twitter: 'Twitter/X', youtube: 'YouTube', ytstudio: 'YT Studio' }[id]||''; },
  getIcon(id) { return { facebook: 'fa-facebook', instagram: 'fa-instagram', meta: 'fa-meta', linkedin: 'fa-linkedin', twitter: 'fa-twitter', youtube: 'fa-youtube', ytstudio: 'fa-youtube' }[id]||'fa-globe'; },
  getColor(id) { return { facebook: '#1877f2', instagram: '#E4405F', meta: '#0668E1', linkedin: '#0A66C2', twitter: '#1DA1F2', youtube: '#FF0000', ytstudio: '#FF0000' }[id]||'#1877f2'; },

  switchTab(id) { this.currentTab = id; this.render(); },

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
    const name = this.getName(platform);
    
    // Full screen overlay — works for all platforms
    const existing = document.querySelector('.social-fullscreen-frame');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'social-fullscreen-frame';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:20000;background:#fff;';
    overlay.innerHTML = `
      <div style="height:44px;background:#f8f9fa;display:flex;align-items:center;padding:0 14px;gap:10px;border-bottom:1px solid #e0e0e0;">
        <button id="socialCloseBtn" style="background:#fa3e3e;color:#fff;border:none;border-radius:50%;width:26px;height:26px;cursor:pointer;font-size:15px;line-height:1;">×</button>
        <span style="font-size:13px;color:#333;font-weight:500;">${name}</span>
        <span style="flex:1;"></span>
        <button id="socialRefreshBtn" style="background:none;border:1px solid #dadde1;border-radius:4px;padding:3px 10px;font-size:11px;cursor:pointer;">↻ Refresh</button>
        <button id="socialBrowserBtn" style="background:none;border:1px solid #dadde1;border-radius:4px;padding:3px 10px;font-size:11px;cursor:pointer;">↗ Browser</button>
      </div>
      <webview id="socialWebview" src="${url}" style="width:100%;height:calc(100% - 44px);border:none;"></webview>
    `;
    document.body.appendChild(overlay);

    document.getElementById('socialCloseBtn').onclick = () => overlay.remove();
    document.getElementById('socialBrowserBtn').onclick = () => window.open(url, '_blank');
    document.getElementById('socialRefreshBtn').onclick = () => {
      const wv = document.getElementById('socialWebview');
      if (wv) wv.reload();
    };
  }
};
