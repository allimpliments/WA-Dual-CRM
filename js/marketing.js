const Marketing = {
  currentTab: 'metaads',
  savedAccounts: {},

  async render() {
    const crmSidebar = document.getElementById('sidebar');
    if (crmSidebar) crmSidebar.style.display = 'none';
    const mainArea = document.querySelector('.main-area');
    if (mainArea) mainArea.style.marginLeft = '0';
    await this.loadAccounts();

    const platforms = [
      { id: 'metaads', name: 'Meta Ads', icon: 'fa-meta', color: '#0668E1' },
      { id: 'googleads', name: 'Google Ads', icon: 'fa-google', color: '#4285F4' },
      { id: 'linkedinads', name: 'LinkedIn Ads', icon: 'fa-linkedin', color: '#0A66C2' },
      { id: 'pinterestads', name: 'Pinterest Ads', icon: 'fa-pinterest', color: '#E60023' },
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
                <p class="text-muted small">Click below to open ${this.getName(this.currentTab)}</p>
                <button class="btn btn-primary btn-sm mt-2" onclick="Marketing.openPlatform('${this.currentTab}')">
                  🔐 Open ${this.getName(this.currentTab)}
                </button>
                ${this.savedAccounts[this.currentTab] ? '<p class="text-success small mt-2">✅ Credentials Saved</p>' : ''}
              </div>
            </div>
            <div class="cred-row">
              <input type="text" id="credUser" placeholder="User/Email">
              <input type="password" id="credPass" placeholder="Password">
              <button class="btn btn-sm btn-primary" onclick="Marketing.saveCredentials('${this.currentTab}')">💾 Save</button>
            </div>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
    if (contentArea) contentArea.style.paddingTop = '0px';
  },

  getDomain(id) { return { metaads: 'adsmanager.facebook.com', googleads: 'ads.google.com', linkedinads: 'linkedin.com/campaignmanager', pinterestads: 'ads.pinterest.com' }[id]||''; },
  getName(id) { return { metaads: 'Meta Ads', googleads: 'Google Ads', linkedinads: 'LinkedIn Ads', pinterestads: 'Pinterest Ads' }[id]||''; },
  getIcon(id) { return { metaads: 'fa-meta', googleads: 'fa-google', linkedinads: 'fa-linkedin', pinterestads: 'fa-pinterest' }[id]||'fa-globe'; },
  getColor(id) { return { metaads: '#0668E1', googleads: '#4285F4', linkedinads: '#0A66C2', pinterestads: '#E60023' }[id]||'#1877f2'; },

  switchTab(id) { this.currentTab = id; this.render(); },

  async loadAccounts() {
    try {
      const doc = await db.collection('settings').doc('marketing_accounts').get();
      if (doc.exists) this.savedAccounts = doc.data() || {};
    } catch (e) { this.savedAccounts = {}; }
  },

  async saveCredentials(platform) {
    const user = document.getElementById('credUser').value.trim();
    const pass = document.getElementById('credPass').value.trim();
    if (!user || !pass) return alert('Enter both!');
    this.savedAccounts[platform] = { user, pass };
    await db.collection('settings').doc('marketing_accounts').set(this.savedAccounts, { merge: true });
    alert('✅ Saved!');
  },

  openPlatform(platform) {
    const urls = {
      metaads: 'https://adsmanager.facebook.com/',
      googleads: 'https://ads.google.com/',
      linkedinads: 'https://www.linkedin.com/campaignmanager/',
      pinterestads: 'https://ads.pinterest.com/'
    };
    const url = urls[platform] || 'about:blank';

    const width = 430, height = 850;
    const left = (screen.width - width) / 2, top = (screen.height - height) / 2;
    const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,status=no,location=yes`;

    window.open(url, 'marketingPopup_' + platform, features);
  }
};
