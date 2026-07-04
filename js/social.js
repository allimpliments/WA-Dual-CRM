const Social = {
  currentTab: 'facebook',
  savedAccounts: {},

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading...</p>';
    await this.loadAccounts();

    const platforms = [
      { id: 'facebook', name: 'Facebook', icon: 'fa-facebook', color: '#1877f2', url: 'https://www.facebook.com/' },
      { id: 'instagram', name: 'Instagram', icon: 'fa-instagram', color: '#E4405F', url: 'https://www.instagram.com/' },
      { id: 'meta', name: 'Meta Business Suite', icon: 'fa-meta', color: '#0668E1', url: 'https://business.facebook.com/' },
      { id: 'linkedin', name: 'LinkedIn', icon: 'fa-linkedin', color: '#0A66C2', url: 'https://www.linkedin.com/' },
      { id: 'twitter', name: 'Twitter/X', icon: 'fa-twitter', color: '#1DA1F2', url: 'https://x.com/' },
      { id: 'youtube', name: 'YouTube', icon: 'fa-youtube', color: '#FF0000', url: 'https://www.youtube.com/' },
      { id: 'ytstudio', name: 'YouTube Studio', icon: 'fa-youtube', color: '#FF0000', url: 'https://studio.youtube.com/' },
    ];

    let html = `
      <style>
        .social-container { display: flex; height: calc(100vh - 100px); gap: 0; }
        .social-sidebar { width: 240px; background: #fff; border-right: 1px solid #e0e0e0; overflow-y: auto; flex-shrink: 0; }
        .social-sidebar .platform-item { padding: 14px 18px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-weight: 500; font-size: 14px; border-bottom: 1px solid #f0f0f0; transition: 0.15s; }
        .social-sidebar .platform-item:hover { background: #f5f6f7; }
        .social-sidebar .platform-item.active { background: #e7f3ff; color: #1877f2; border-left: 3px solid #1877f2; }
        .social-sidebar .platform-item i { width: 20px; text-align: center; }
        .social-sidebar .status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
        .social-sidebar .status-dot.saved { background: #31a24c; }
        .social-sidebar .status-dot.unsaved { background: #dadde1; }
        .social-main { flex: 1; display: flex; flex-direction: column; }
        .social-toolbar { padding: 10px 16px; background: #fff; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
        .social-toolbar .url-bar { flex: 1; margin: 0 12px; padding: 8px 12px; border: 1px solid #dadde1; border-radius: 8px; font-size: 13px; background: #fafbfc; }
        .social-iframe-wrap { flex: 1; position: relative; background: #fff; }
        .social-iframe-wrap iframe { width: 100%; height: 100%; border: none; }
        .social-iframe-wrap .iframe-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #fafbfc; flex-direction: column; }
        .save-credential-form { display: flex; gap: 8px; align-items: center; }
        .save-credential-form input { padding: 6px 10px; border: 1px solid #dadde1; border-radius: 6px; font-size: 12px; }
      </style>
      <div class="social-container">
        <div class="social-sidebar">
          <div style="padding:14px 18px;font-weight:700;font-size:13px;color:#65676b;text-transform:uppercase;">Social Media</div>
          ${platforms.map(p => `
            <div class="platform-item ${this.currentTab === p.id ? 'active' : ''}" onclick="Social.switchTab('${p.id}')">
              <i class="fab ${p.icon}" style="color:${p.color};"></i> ${p.name}
              <span class="status-dot ${this.savedAccounts[p.id] ? 'saved' : 'unsaved'}" style="margin-left:auto;" title="${this.savedAccounts[p.id] ? 'Credentials Saved' : 'No Credentials'}"></span>
            </div>
          `).join('')}
        </div>
        <div class="social-main">
          <div class="social-toolbar">
            <div style="display:flex;align-items:center;gap:8px;">
              <button class="btn btn-sm btn-light" onclick="document.getElementById('socialIframe').contentWindow.history.back()">←</button>
              <button class="btn btn-sm btn-light" onclick="document.getElementById('socialIframe').contentWindow.history.forward()">→</button>
              <button class="btn btn-sm btn-light" onclick="document.getElementById('socialIframe').contentWindow.location.reload()">↻</button>
            </div>
            <input class="url-bar" id="iframeUrl" value="${this.getPlatformUrl(this.currentTab)}" readonly>
            <div class="save-credential-form">
              <input type="text" id="credUser" placeholder="Username/Email" style="width:140px;">
              <input type="password" id="credPass" placeholder="Password" style="width:120px;">
              <button class="btn btn-sm btn-primary" onclick="Social.saveCredentials('${this.currentTab}')">💾 Save</button>
              <button class="btn btn-sm btn-outline" onclick="Social.openInNewTab('${this.currentTab}')" title="Open in New Tab">🔗</button>
            </div>
          </div>
          <div class="social-iframe-wrap" id="iframeContainer">
            ${this.savedAccounts[this.currentTab] ? '' : `
              <div class="iframe-overlay" id="iframeOverlay">
                <i class="fab ${this.getPlatformIcon(this.currentTab)} fa-4x" style="color:#1877f2;margin-bottom:16px;"></i>
                <h5>${this.getPlatformName(this.currentTab)}</h5>
                <p class="text-muted">Save your credentials above and click "Open" to load this platform.</p>
                <button class="btn btn-primary mt-2" onclick="Social.loadIframe('${this.currentTab}')">🔓 Open ${this.getPlatformName(this.currentTab)}</button>
              </div>
            `}
            <iframe id="socialIframe" style="display:${this.savedAccounts[this.currentTab] ? 'block' : 'none'};" src="${this.savedAccounts[this.currentTab] ? this.getPlatformUrl(this.currentTab) : 'about:blank'}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"></iframe>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;

    if (this.savedAccounts[this.currentTab]) {
      this.loadIframe(this.currentTab);
    }
  },

  getPlatformUrl(id) {
    const urls = { facebook: 'https://www.facebook.com/', instagram: 'https://www.instagram.com/', meta: 'https://business.facebook.com/latest/home', linkedin: 'https://www.linkedin.com/feed/', twitter: 'https://x.com/', youtube: 'https://www.youtube.com/', ytstudio: 'https://studio.youtube.com/' };
    return urls[id] || 'about:blank';
  },

  getPlatformName(id) {
    const names = { facebook: 'Facebook', instagram: 'Instagram', meta: 'Meta Business Suite', linkedin: 'LinkedIn', twitter: 'Twitter/X', youtube: 'YouTube', ytstudio: 'YouTube Studio' };
    return names[id] || 'Platform';
  },

  getPlatformIcon(id) {
    const icons = { facebook: 'fa-facebook', instagram: 'fa-instagram', meta: 'fa-meta', linkedin: 'fa-linkedin', twitter: 'fa-twitter', youtube: 'fa-youtube', ytstudio: 'fa-youtube' };
    return icons[id] || 'fa-globe';
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
    if (!user || !pass) return alert('Enter both username and password!');
    this.savedAccounts[platform] = { user, pass };
    try {
      await db.collection('settings').doc('social_accounts').set(this.savedAccounts, { merge: true });
      alert('✅ Credentials saved!');
      this.render();
    } catch (err) { alert('Error: ' + err.message); }
  },

  loadIframe(platform) {
    const overlay = document.getElementById('iframeOverlay');
    const iframe = document.getElementById('socialIframe');
    if (overlay) overlay.style.display = 'none';
    if (iframe) {
      iframe.style.display = 'block';
      iframe.src = this.getPlatformUrl(platform);
    }
    document.getElementById('iframeUrl').value = this.getPlatformUrl(platform);
  },

  openInNewTab(platform) {
    window.open(this.getPlatformUrl(platform), '_blank');
  }
};
