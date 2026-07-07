// js/marketing.js — Advanced Marketing Hub for SaaS Platform (Ads + Campaigns + Analytics)
const Marketing = {
  currentTab: 'metaads',
  savedAccounts: {},
  adStats: { totalSpent: 0, totalImpressions: 0, totalClicks: 0, totalConversions: 0 },

  async render() {
    contentArea.style.paddingTop = '0px';
    contentArea.style.background = '#f8fafc';

    const crmSidebar = document.getElementById('sidebar');
    if (crmSidebar) crmSidebar.style.display = 'none';
    const mainArea = document.querySelector('.main-area');
    if (mainArea) mainArea.style.marginLeft = '0';
    await this.loadAccounts();
    await this.loadAdStats();

    const platforms = [
      { id: 'metaads', name: 'Meta Ads', icon: 'fa-meta', color: '#0668E1', url: 'https://adsmanager.facebook.com/', desc: 'Facebook & Instagram advertising platform' },
      { id: 'googleads', name: 'Google Ads', icon: 'fa-google', color: '#4285F4', url: 'https://ads.google.com/', desc: 'Search, Display & YouTube advertising' },
      { id: 'linkedinads', name: 'LinkedIn Ads', icon: 'fa-linkedin', color: '#0A66C2', url: 'https://www.linkedin.com/campaignmanager/', desc: 'B2B advertising & sponsored content' },
      { id: 'pinterestads', name: 'Pinterest Ads', icon: 'fa-pinterest', color: '#E60023', url: 'https://ads.pinterest.com/', desc: 'Visual discovery & shopping ads' },
      { id: 'twitterads', name: 'Twitter/X Ads', icon: 'fa-twitter', color: '#1DA1F2', url: 'https://ads.twitter.com/', desc: 'Promoted tweets & trends' },
      { id: 'tiktokads', name: 'TikTok Ads', icon: 'fa-tiktok', color: '#000000', url: 'https://ads.tiktok.com/', desc: 'Short-form video advertising' },
      { id: 'snapchatads', name: 'Snapchat Ads', icon: 'fa-snapchat', color: '#FFFC00', url: 'https://ads.snapchat.com/', desc: 'AR lenses & story ads' },
      { id: 'redditads', name: 'Reddit Ads', icon: 'fa-reddit', color: '#FF4500', url: 'https://ads.reddit.com/', desc: 'Community-targeted advertising' },
      { id: 'quoraads', name: 'Quora Ads', icon: 'fa-quora', color: '#B92B27', url: 'https://www.quora.com/ads/', desc: 'Intent-based question targeting' },
      { id: 'youtubeads', name: 'YouTube Ads', icon: 'fa-youtube', color: '#FF0000', url: 'https://www.youtube.com/ads/', desc: 'Video advertising platform' },
    ];

    let html = `
      <style>
        .mkt-wrap { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .mkt-header { background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 20px; padding: 28px 32px; margin-bottom: 24px; color: #fff; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .mkt-header h4 { margin: 0; font-weight: 800; font-size: 22px; }
        .mkt-header p { margin: 4px 0 0; color: #94a3b8; font-size: 13px; }
        .mkt-tabs { display: flex; gap: 4px; margin-bottom: 20px; background: #fff; border-radius: 16px; padding: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; overflow-x: auto; flex-wrap: wrap; }
        .mkt-tab { padding: 10px 16px; border-radius: 12px; font-size: 12px; cursor: pointer; font-weight: 500; transition: all 0.2s; color: #64748b; display: flex; align-items: center; gap: 6px; border: none; background: transparent; white-space: nowrap; }
        .mkt-tab:hover { background: #f1f5f9; color: #0f172a; }
        .mkt-tab.active { background: #6366f1; color: #fff; box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
        .mkt-tab.active i { color: #fff !important; }
        .mkt-card { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; margin-bottom: 16px; }
        .mkt-stat { background: #fff; border-radius: 14px; padding: 20px; text-align: center; border: 1px solid #f1f5f9; transition: 0.2s; }
        .mkt-stat:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.06); transform: translateY(-2px); }
        .mkt-stat .val { font-size: 28px; font-weight: 800; }
        .mkt-stat .lbl { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
        .mkt-platform-card { background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #f1f5f9; transition: 0.2s; cursor: pointer; position: relative; overflow: hidden; }
        .mkt-platform-card:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.06); transform: translateY(-2px); border-color: #6366f1; }
        .mkt-platform-card .platform-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #fff; margin-bottom: 12px; }
        .mkt-platform-card h6 { font-weight: 700; font-size: 14px; color: #0f172a; margin-bottom: 4px; }
        .mkt-platform-card p { font-size: 12px; color: #64748b; margin: 0; }
        .mkt-platform-card .status-badge { position: absolute; top: 16px; right: 16px; }
        .mkt-btn { padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .mkt-btn-primary { background: #6366f1; color: #fff; }
        .mkt-btn-primary:hover { background: #4f46e5; }
        .mkt-btn-outline { background: #fff; color: #6366f1; border: 1px solid #6366f1; }
        .mkt-btn-outline:hover { background: #eef2ff; }
        .mkt-btn-success { background: #10b981; color: #fff; }
        .mkt-btn-success:hover { background: #059669; }
        .mkt-input { width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px; outline: none; }
        .mkt-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .mkt-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; }
        .mkt-cred-row { display: flex; gap: 8px; align-items: flex-end; margin-top: 12px; padding-top: 12px; border-top: 1px solid #f1f5f9; }
        .mkt-tips-card { background: linear-gradient(135deg, #eef2ff, #f8fafc); border: 1px solid #c7d2fe; border-radius: 14px; padding: 20px; }
        .mkt-tips-card h6 { color: #3730a3; font-weight: 700; }
        @media (max-width: 768px) { .mkt-header { padding: 20px; } .mkt-tabs { flex-wrap: nowrap; } }
      </style>

      <div class="mkt-wrap">
        <div class="mkt-header">
          <div>
            <h4><i class="fas fa-bullhorn me-2"></i>Marketing Hub</h4>
            <p>Manage advertising campaigns across all platforms from one place</p>
          </div>
          <div class="d-flex gap-3">
            <div class="text-center"><div style="font-size:22px;font-weight:800;">${platforms.length}</div><small style="color:#94a3b8;">Platforms</small></div>
            <div class="text-center"><div style="font-size:22px;font-weight:800;color:#10b981;">${Object.keys(this.savedAccounts).length}</div><small style="color:#94a3b8;">Connected</small></div>
          </div>
        </div>

        <!-- Platform Tabs -->
        <div class="mkt-tabs">
          ${platforms.map(p => `
            <button class="mkt-tab ${this.currentTab === p.id ? 'active' : ''}" onclick="Marketing.currentTab='${p.id}';Marketing.render();">
              <i class="fab ${p.icon}" style="color:${p.color};font-size:14px;"></i> ${p.name}
            </button>
          `).join('')}
        </div>

        <!-- Stats Row -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-md-3"><div class="mkt-stat"><div class="val" style="color:#6366f1;">${this.adStats.totalImpressions.toLocaleString()}</div><div class="lbl">Impressions</div></div></div>
          <div class="col-6 col-md-3"><div class="mkt-stat"><div class="val" style="color:#10b981;">${this.adStats.totalClicks.toLocaleString()}</div><div class="lbl">Clicks</div></div></div>
          <div class="col-6 col-md-3"><div class="mkt-stat"><div class="val" style="color:#f59e0b;">${this.adStats.totalConversions.toLocaleString()}</div><div class="lbl">Conversions</div></div></div>
          <div class="col-6 col-md-3"><div class="mkt-stat"><div class="val" style="color:#ec4899;">₹${this.adStats.totalSpent.toLocaleString()}</div><div class="lbl">Total Spent</div></div></div>
        </div>

        <div class="row g-4">
          <!-- Platform Detail -->
          <div class="col-lg-8">
            <div class="mkt-card">
              ${(() => {
                const p = platforms.find(x => x.id === this.currentTab) || platforms[0];
                const isConnected = !!this.savedAccounts[this.currentTab];
                return `
                  <div class="d-flex align-items-start gap-4 mb-3">
                    <div class="platform-icon" style="background:${p.color};"><i class="fab ${p.icon}"></i></div>
                    <div class="flex-grow-1">
                      <h5 style="font-weight:700;margin:0;">${p.name}</h5>
                      <p style="color:#64748b;margin:4px 0;">${p.desc}</p>
                      <span class="mkt-badge" style="background:${isConnected ? '#ecfdf5' : '#fef3c7'};color:${isConnected ? '#10b981' : '#92400e'};">
                        ${isConnected ? '● Connected' : '○ Not Connected'}
                      </span>
                    </div>
                  </div>
                  <div class="mkt-cred-row">
                    <input type="text" id="credUser" class="mkt-input" placeholder="Account Email/ID" value="${(this.savedAccounts[this.currentTab] || {}).user || ''}">
                    <input type="password" id="credPass" class="mkt-input" placeholder="Password/Token" value="${(this.savedAccounts[this.currentTab] || {}).pass || ''}">
                    <button class="mkt-btn mkt-btn-primary" onclick="Marketing.saveCredentials('${this.currentTab}')"><i class="fas fa-save"></i> Save</button>
                  </div>
                  <div class="d-flex gap-2 mt-3">
                    <button class="mkt-btn mkt-btn-success" onclick="Marketing.openPlatform('${this.currentTab}')"><i class="fas fa-external-link-alt"></i> Open ${p.name}</button>
                    <button class="mkt-btn mkt-btn-outline" onclick="Marketing.openGuide('${this.currentTab}')"><i class="fas fa-book"></i> Setup Guide</button>
                  </div>
                `;
              })()}
            </div>

            <!-- Quick Tips -->
            <div class="mkt-tips-card">
              <h6><i class="fas fa-lightbulb text-warning me-2"></i>Marketing Tips for ${this.getName(this.currentTab)}</h6>
              <div class="row g-2 mt-2">
                ${this.getTips(this.currentTab).map(tip => `
                  <div class="col-md-6">
                    <div style="font-size:12px;color:#475569;display:flex;gap:8px;align-items:flex-start;">
                      <span style="color:#6366f1;font-weight:700;">•</span> ${tip}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Sidebar: All Platforms -->
          <div class="col-lg-4">
            <div class="mkt-card">
              <h6 style="font-weight:700;margin-bottom:16px;"><i class="fas fa-plug me-2"></i>All Ad Platforms</h6>
              ${platforms.map(p => `
                <div class="mkt-platform-card" onclick="Marketing.currentTab='${p.id}';Marketing.render();" style="margin-bottom:8px;padding:14px;">
                  <div class="d-flex align-items-center gap-3">
                    <div style="width:36px;height:36px;border-radius:10px;background:${p.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                      <i class="fab ${p.icon}" style="color:#fff;font-size:16px;"></i>
                    </div>
                    <div class="flex-grow-1">
                      <div style="font-weight:600;font-size:13px;color:#0f172a;">${p.name}</div>
                      <div style="font-size:11px;color:#94a3b8;">${p.desc}</div>
                    </div>
                    <span class="mkt-badge" style="background:${this.savedAccounts[p.id] ? '#ecfdf5' : '#f1f5f9'};color:${this.savedAccounts[p.id] ? '#10b981' : '#94a3b8'};">
                      ${this.savedAccounts[p.id] ? '✓' : '○'}
                    </span>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Ad Performance Summary -->
            <div class="mkt-card">
              <h6 style="font-weight:700;margin-bottom:16px;"><i class="fas fa-chart-bar me-2"></i>Campaign Integration</h6>
              <p style="font-size:12px;color:#64748b;">Connect your ad accounts to track performance and sync leads directly into your CRM.</p>
              <div style="background:#f8fafc;border-radius:10px;padding:12px;margin-top:12px;">
                <div style="font-size:12px;font-weight:600;color:#0f172a;margin-bottom:8px;">Setup Checklist:</div>
                <div style="font-size:11px;color:#64748b;">1. Save your ad account credentials</div>
                <div style="font-size:11px;color:#64748b;">2. Open the ad platform</div>
                <div style="font-size:11px;color:#64748b;">3. Create or manage campaigns</div>
                <div style="font-size:11px;color:#64748b;">4. Sync leads via Meta/Google integration</div>
                <div style="font-size:11px;color:#64748b;">5. Track performance in Analytics</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  getDomain(id) {
    const domains = {
      metaads: 'adsmanager.facebook.com', googleads: 'ads.google.com', linkedinads: 'linkedin.com/campaignmanager',
      pinterestads: 'ads.pinterest.com', twitterads: 'ads.twitter.com', tiktokads: 'ads.tiktok.com',
      snapchatads: 'ads.snapchat.com', redditads: 'ads.reddit.com', quoraads: 'quora.com/ads', youtubeads: 'youtube.com/ads'
    };
    return domains[id] || '';
  },
  getName(id) {
    const names = {
      metaads: 'Meta Ads', googleads: 'Google Ads', linkedinads: 'LinkedIn Ads',
      pinterestads: 'Pinterest Ads', twitterads: 'Twitter/X Ads', tiktokads: 'TikTok Ads',
      snapchatads: 'Snapchat Ads', redditads: 'Reddit Ads', quoraads: 'Quora Ads', youtubeads: 'YouTube Ads'
    };
    return names[id] || '';
  },
  getIcon(id) {
    const icons = {
      metaads: 'fa-meta', googleads: 'fa-google', linkedinads: 'fa-linkedin',
      pinterestads: 'fa-pinterest', twitterads: 'fa-twitter', tiktokads: 'fa-tiktok',
      snapchatads: 'fa-snapchat', redditads: 'fa-reddit', quoraads: 'fa-quora', youtubeads: 'fa-youtube'
    };
    return icons[id] || 'fa-globe';
  },
  getColor(id) {
    const colors = {
      metaads: '#0668E1', googleads: '#4285F4', linkedinads: '#0A66C2',
      pinterestads: '#E60023', twitterads: '#1DA1F2', tiktokads: '#000000',
      snapchatads: '#FFFC00', redditads: '#FF4500', quoraads: '#B92B27', youtubeads: '#FF0000'
    };
    return colors[id] || '#1877f2';
  },

  getTips(platform) {
    const tips = {
      metaads: ['Use Advantage+ for automated targeting', 'Test 3-5 ad creatives per ad set', 'Install Meta Pixel for conversion tracking', 'Use lookalike audiences for scaling'],
      googleads: ['Use exact match keywords for high intent', 'Set up conversion tracking with Google Tag', 'Use responsive search ads with 15 headlines', 'Set negative keywords to reduce waste'],
      linkedinads: ['Target by job title and company size', 'Use lead gen forms for higher conversion', 'Test sponsored content vs. message ads', 'Set up matched audiences for retargeting'],
      pinterestads: ['Use high-quality vertical images', 'Add rich pins for product catalogs', 'Target by interest and keyword', 'Use shopping ads for e-commerce'],
      twitterads: ['Use trending topics for relevance', 'Keep copy short and engaging', 'Test promoted tweets vs. trends', 'Target by follower lookalikes'],
      tiktokads: ['Use native-looking UGC content', 'Keep videos 15-30 seconds', 'Use trending sounds and effects', 'Target by interest and behavior'],
      snapchatads: ['Use vertical video format', 'Add AR lenses for engagement', 'Target by age and location', 'Use collection ads for products'],
      redditads: ['Target specific subreddits', 'Use authentic, conversational tone', 'Offer exclusive deals for Redditors', 'Engage in comments for trust'],
      quoraads: ['Target by question and topic', 'Write helpful, informative copy', 'Use lead gen forms on Quora', 'Focus on problem-solving angle'],
      youtubeads: ['Keep first 5 seconds attention-grabbing', 'Use call-to-action overlays', 'Target by interest and keywords', 'Set up remarketing lists'],
    };
    return tips[platform] || ['Connect your account to start', 'Define your target audience', 'Create compelling ad creatives', 'Track and optimize performance'];
  },

  switchTab(id) { this.currentTab = id; this.render(); },

  async loadAccounts() {
    try {
      const doc = await db.collection('settings').doc('marketing_accounts').get();
      if (doc.exists) this.savedAccounts = doc.data() || {};
    } catch (e) { this.savedAccounts = {}; }
  },

  async loadAdStats() {
    try {
      const doc = await db.collection('settings').doc('marketing_stats').get();
      if (doc.exists) this.adStats = { ...this.adStats, ...doc.data() };
    } catch(e) {}
  },

  async saveCredentials(platform) {
    const user = document.getElementById('credUser')?.value?.trim();
    const pass = document.getElementById('credPass')?.value?.trim();
    if (!user || !pass) return showToast('Enter both email/ID and password!', 'warning');
    this.savedAccounts[platform] = { user, pass, savedAt: new Date().toISOString() };
    await db.collection('settings').doc('marketing_accounts').set(this.savedAccounts, { merge: true });
    showToast('✅ Credentials saved for ' + this.getName(platform) + '!', 'success');
    this.render();
  },

  openPlatform(platform) {
    const urls = {
      metaads: 'https://adsmanager.facebook.com/',
      googleads: 'https://ads.google.com/',
      linkedinads: 'https://www.linkedin.com/campaignmanager/',
      pinterestads: 'https://ads.pinterest.com/',
      twitterads: 'https://ads.twitter.com/',
      tiktokads: 'https://ads.tiktok.com/',
      snapchatads: 'https://ads.snapchat.com/',
      redditads: 'https://ads.reddit.com/',
      quoraads: 'https://www.quora.com/ads/',
      youtubeads: 'https://www.youtube.com/ads/'
    };
    const url = urls[platform] || 'about:blank';
    const width = 430, height = 850;
    const left = (screen.width - width) / 2, top = (screen.height - height) / 2;
    const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,status=no,location=yes`;
    window.open(url, 'marketingPopup_' + platform, features);
  },

  openGuide(platform) {
    const guides = {
      metaads: 'https://www.facebook.com/business/learn',
      googleads: 'https://support.google.com/google-ads/',
      linkedinads: 'https://business.linkedin.com/marketing-solutions/ads',
      tiktokads: 'https://ads.tiktok.com/help/',
    };
    const url = guides[platform] || 'https://www.google.com/search?q=' + encodeURIComponent(this.getName(platform) + ' advertising guide');
    window.open(url, '_blank');
  }
};
