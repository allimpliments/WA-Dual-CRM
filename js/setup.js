// js/setup.js — Platform Connections & Integration Setup for SaaS
const Setup = {
  currentTab: 'connections',
  testingConnection: false,

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = '#f8fafc';

    const isAdmin = isPlatformAdmin();
    if (!isAdmin) {
      contentArea.innerHTML = `<div class="text-center py-5"><i class="fas fa-lock fa-3x text-muted mb-3"></i><h4>Access Denied</h4><p class="text-muted">Only platform administrators can access setup.</p></div>`;
      return;
    }

    // Load all platform settings
    let wa = {}, fbPage = {}, fbMsg = {}, igBiz = {}, igMsg = {}, li = {}, yt = {}, tw = {}, pi = {}, tk = {}, tel = {}, emailCfg = {}, smsCfg = {}, groqAI = {}, openAI = {}, smtpCfg = {}, generalCfg = {};
    
    try {
      const settings = [
        'whatsapp', 'facebook_page', 'facebook_messenger', 'instagram_business', 'instagram_messenger',
        'linkedin', 'youtube', 'twitter', 'pinterest', 'tiktok', 'telegram',
        'email_config', 'sms_config', 'groq_ai', 'openai', 'smtp_config', 'general_settings'
      ];
      
      for (const key of settings) {
        const doc = await db.collection('settings').doc(key).get();
        if (doc.exists) {
          switch(key) {
            case 'whatsapp': wa = doc.data(); break;
            case 'facebook_page': fbPage = doc.data(); break;
            case 'facebook_messenger': fbMsg = doc.data(); break;
            case 'instagram_business': igBiz = doc.data(); break;
            case 'instagram_messenger': igMsg = doc.data(); break;
            case 'linkedin': li = doc.data(); break;
            case 'youtube': yt = doc.data(); break;
            case 'twitter': tw = doc.data(); break;
            case 'pinterest': pi = doc.data(); break;
            case 'tiktok': tk = doc.data(); break;
            case 'telegram': tel = doc.data(); break;
            case 'email_config': emailCfg = doc.data(); break;
            case 'sms_config': smsCfg = doc.data(); break;
            case 'groq_ai': groqAI = doc.data(); break;
            case 'openai': openAI = doc.data(); break;
            case 'smtp_config': smtpCfg = doc.data(); break;
            case 'general_settings': generalCfg = doc.data(); break;
          }
        }
      }
    } catch(e) { console.error('Setup load error:', e); }

    // Count connected platforms
    const connectedCount = [
      wa.accessToken, fbMsg.accessToken, igMsg.accessToken,
      fbPage.accessToken, igBiz.accessToken, li.accessToken,
      yt.apiKey, tw.accessToken, pi.accessToken, tk.accessToken, tel.botToken
    ].filter(Boolean).length;

    let html = `
      <style>
        .setup-wrap { max-width: 1400px; margin: 0 auto; }
        .setup-header { background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 20px; padding: 28px 32px; margin-bottom: 24px; color: #fff; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .setup-header h4 { margin: 0; font-weight: 800; font-size: 22px; }
        .setup-header p { margin: 4px 0 0; color: #94a3b8; font-size: 13px; }
        .setup-card { background: #fff; border-radius: 16px; padding: 24px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; transition: 0.2s; }
        .setup-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
        .setup-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .setup-card-header h5 { font-weight: 700; font-size: 15px; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 8px; }
        .setup-input { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13px; outline: none; margin-bottom: 8px; background: #fff; transition: 0.2s; }
        .setup-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .setup-input-sm { padding: 8px 12px; font-size: 12px; }
        .setup-label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; display: block; }
        .setup-btn { padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; display: inline-flex; align-items: center; gap: 4px; }
        .setup-btn-primary { background: #6366f1; color: #fff; }
        .setup-btn-primary:hover { background: #4f46e5; }
        .setup-btn-success { background: #10b981; color: #fff; }
        .setup-btn-success:hover { background: #059669; }
        .setup-btn-outline { background: #fff; color: #6366f1; border: 1px solid #6366f1; }
        .setup-btn-outline:hover { background: #eef2ff; }
        .setup-btn-test { background: #f59e0b; color: #fff; }
        .setup-btn-test:hover { background: #d97706; }
        .setup-status { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; }
        .setup-status.connected { background: #ecfdf5; color: #10b981; }
        .setup-status.disconnected { background: #fef3c7; color: #92400e; }
        .setup-status.coming { background: #f1f5f9; color: #64748b; }
        .setup-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; }
        .setup-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(450px, 1fr)); gap: 16px; }
        .setup-test-result { margin-top: 8px; padding: 8px 12px; border-radius: 8px; font-size: 12px; display: none; }
        .setup-test-result.success { display: block; background: #ecfdf5; color: #10b981; border: 1px solid #a7f3d0; }
        .setup-test-result.error { display: block; background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }
        @media (max-width: 768px) { .setup-grid { grid-template-columns: 1fr; } .setup-header { padding: 20px; } }
      </style>

      <div class="setup-wrap">
        <div class="setup-header">
          <div>
            <h4><i class="fas fa-plug me-2"></i>Platform Connections</h4>
            <p>Connect your social media, messaging, and AI accounts to power the platform</p>
          </div>
          <div class="d-flex gap-3">
            <div class="text-center"><div style="font-size:22px;font-weight:800;">${connectedCount}</div><small style="color:#94a3b8;">Connected</small></div>
            <div class="text-center"><div style="font-size:22px;font-weight:800;">11</div><small style="color:#94a3b8;">Available</small></div>
          </div>
        </div>

        <div class="setup-grid">
          ${this.renderPlatformCard({
            id: 'whatsapp', name: 'WhatsApp Cloud API', icon: 'fa-whatsapp', color: '#25D366',
            connected: !!wa.accessToken, fields: [
              { id: 'waPhoneId', label: 'Phone Number ID', value: wa.phoneNumberId || '', type: 'text', placeholder: '123456789' },
              { id: 'waToken', label: 'Access Token', value: wa.accessToken || '', type: 'password', placeholder: 'EAA...' },
              { id: 'waBusinessId', label: 'Business ID', value: wa.businessId || '', type: 'text', placeholder: 'Optional' }
            ]
          })}

          ${this.renderPlatformCard({
            id: 'facebook_messenger', name: 'FB Messenger (Live Chat)', icon: 'fa-facebook-messenger', color: '#00B2FF',
            connected: !!fbMsg.accessToken, fields: [
              { id: 'fbMsgPageId', label: 'Page ID', value: fbMsg.pageId || '', type: 'text' },
              { id: 'fbMsgToken', label: 'Access Token', value: fbMsg.accessToken || '', type: 'password' }
            ]
          })}

          ${this.renderPlatformCard({
            id: 'instagram_messenger', name: 'Instagram Direct (Live Chat)', icon: 'fa-instagram', color: '#E4405F',
            connected: !!igMsg.accessToken, fields: [
              { id: 'igMsgAccId', label: 'Account ID', value: igMsg.accountId || '', type: 'text' },
              { id: 'igMsgToken', label: 'Access Token', value: igMsg.accessToken || '', type: 'password' }
            ]
          })}

          ${this.renderPlatformCard({
            id: 'facebook_page', name: 'Facebook Page (Posting)', icon: 'fa-facebook', color: '#1877f2',
            connected: !!fbPage.accessToken, fields: [
              { id: 'fbPostPageId', label: 'Page ID', value: fbPage.pageId || '', type: 'text' },
              { id: 'fbPostToken', label: 'Access Token', value: fbPage.accessToken || '', type: 'password' }
            ]
          })}

          ${this.renderPlatformCard({
            id: 'instagram_business', name: 'Instagram Business (Posting)', icon: 'fa-instagram', color: '#E4405F',
            connected: !!igBiz.accessToken, fields: [
              { id: 'igPostAccId', label: 'Account ID', value: igBiz.accountId || '', type: 'text' },
              { id: 'igPostToken', label: 'Access Token', value: igBiz.accessToken || '', type: 'password' }
            ]
          })}

          ${this.renderPlatformCard({
            id: 'linkedin', name: 'LinkedIn', icon: 'fa-linkedin', color: '#0A66C2', coming: true,
            connected: !!li.accessToken, fields: [
              { id: 'liOrgId', label: 'Organization ID', value: li.orgId || '', type: 'text' },
              { id: 'liToken', label: 'Access Token', value: li.accessToken || '', type: 'password' }
            ]
          })}

          ${this.renderPlatformCard({
            id: 'youtube', name: 'YouTube', icon: 'fa-youtube', color: '#FF0000', coming: true,
            connected: !!yt.apiKey, fields: [
              { id: 'ytChannelId', label: 'Channel ID', value: yt.channelId || '', type: 'text' },
              { id: 'ytApiKey', label: 'API Key', value: yt.apiKey || '', type: 'password' }
            ]
          })}

          ${this.renderPlatformCard({
            id: 'twitter', name: 'Twitter/X', icon: 'fa-twitter', color: '#1DA1F2', coming: true,
            connected: !!tw.accessToken, fields: [
              { id: 'twApiKey', label: 'API Key', value: tw.apiKey || '', type: 'text' },
              { id: 'twApiSecret', label: 'API Secret', value: tw.apiSecret || '', type: 'password' },
              { id: 'twAccessToken', label: 'Access Token', value: tw.accessToken || '', type: 'password' },
              { id: 'twAccessSecret', label: 'Access Secret', value: tw.accessSecret || '', type: 'password' }
            ]
          })}

          ${this.renderPlatformCard({
            id: 'telegram', name: 'Telegram Bot', icon: 'fa-telegram', color: '#0088cc', coming: true,
            connected: !!tel.botToken, fields: [
              { id: 'telBotToken', label: 'Bot Token', value: tel.botToken || '', type: 'password' },
              { id: 'telChatId', label: 'Default Chat ID', value: tel.chatId || '', type: 'text' }
            ]
          })}

          ${this.renderPlatformCard({
            id: 'groq_ai', name: 'Groq AI (Chatbot)', icon: 'fa-robot', color: '#f59e0b',
            connected: !!groqAI.apiKey, fields: [
              { id: 'groqApiKey', label: 'API Key', value: groqAI.apiKey || '', type: 'password' },
              { id: 'groqModel', label: 'Model', value: groqAI.model || 'llama-3.3-70b-versatile', type: 'text' }
            ]
          })}

          ${this.renderPlatformCard({
            id: 'openai', name: 'OpenAI (ChatGPT)', icon: 'fa-brain', color: '#10b981',
            connected: !!openAI.apiKey, fields: [
              { id: 'openaiApiKey', label: 'API Key', value: openAI.apiKey || '', type: 'password' },
              { id: 'openaiModel', label: 'Model', value: openAI.model || 'gpt-4', type: 'text' }
            ]
          })}
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  renderPlatformCard(config) {
    const { id, name, icon, color, connected, fields, coming } = config;
    return `
      <div class="setup-card">
        <div class="setup-card-header">
          <h5>
            <span style="width:32px;height:32px;border-radius:8px;background:${color};display:flex;align-items:center;justify-content:center;">
              <i class="fab ${icon}" style="color:#fff;font-size:14px;"></i>
            </span>
            ${name}
            ${coming ? '<span class="setup-badge" style="background:#f1f5f9;color:#64748b;font-size:9px;">Coming Soon</span>' : ''}
          </h5>
          <span class="setup-status ${connected ? 'connected' : 'disconnected'}">
            ${connected ? '● Connected' : '○ Not Configured'}
          </span>
        </div>
        <div class="row g-2">
          ${fields.map(f => `
            <div class="${fields.length > 2 ? 'col-md-4' : 'col-md-6'}">
              <label class="setup-label">${f.label}</label>
              <input type="${f.type}" id="${f.id}" class="setup-input setup-input-sm" value="${f.value}" placeholder="${f.placeholder || ''}">
            </div>
          `).join('')}
          <div class="${fields.length > 2 ? 'col-md-4' : 'col-md-6'} d-flex align-items-end">
            <div class="d-flex gap-2 w-100">
              <button class="setup-btn setup-btn-primary flex-grow-1" onclick="Setup.savePlatform('${id}')"><i class="fas fa-save"></i> Save</button>
              <button class="setup-btn setup-btn-test" onclick="Setup.testConnection('${id}')" title="Test Connection"><i class="fas fa-plug"></i></button>
            </div>
          </div>
        </div>
        <div class="setup-test-result" id="testResult_${id}"></div>
      </div>
    `;
  },

  async savePlatform(platform) {
    const data = { updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
    const fieldMap = {
      whatsapp: { phoneNumberId: 'waPhoneId', accessToken: 'waToken', businessId: 'waBusinessId' },
      facebook_messenger: { pageId: 'fbMsgPageId', accessToken: 'fbMsgToken' },
      instagram_messenger: { accountId: 'igMsgAccId', accessToken: 'igMsgToken' },
      facebook_page: { pageId: 'fbPostPageId', accessToken: 'fbPostToken' },
      instagram_business: { accountId: 'igPostAccId', accessToken: 'igPostToken' },
      linkedin: { orgId: 'liOrgId', accessToken: 'liToken' },
      youtube: { channelId: 'ytChannelId', apiKey: 'ytApiKey' },
      twitter: { apiKey: 'twApiKey', apiSecret: 'twApiSecret', accessToken: 'twAccessToken', accessSecret: 'twAccessSecret' },
      telegram: { botToken: 'telBotToken', chatId: 'telChatId' },
      groq_ai: { apiKey: 'groqApiKey', model: 'groqModel' },
      openai: { apiKey: 'openaiApiKey', model: 'openaiModel' }
    };

    const mapping = fieldMap[platform];
    if (mapping) {
      Object.keys(mapping).forEach(key => {
        const el = document.getElementById(mapping[key]);
        if (el) data[key] = el.value.trim();
      });
    }

    try {
      await db.collection('settings').doc(platform).set(data);
      showToast('✅ Settings saved successfully!', 'success');
      this.render();
    } catch(e) {
      showToast('❌ Failed to save: ' + e.message, 'error');
    }
  },

  async testConnection(platform) {
    const resultEl = document.getElementById('testResult_' + platform);
    if (!resultEl) return;
    
    resultEl.style.display = 'block';
    resultEl.className = 'setup-test-result';
    resultEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing connection...';

    try {
      let success = false;
      let message = '';

      switch(platform) {
        case 'whatsapp':
          const waPhoneId = document.getElementById('waPhoneId')?.value?.trim();
          const waToken = document.getElementById('waToken')?.value?.trim();
          if (!waPhoneId || !waToken) { message = 'Phone Number ID and Access Token required'; break; }
          const waRes = await fetch(`https://graph.facebook.com/v22.0/${waPhoneId}?fields=id,name`, {
            headers: { 'Authorization': 'Bearer ' + waToken }
          });
          const waData = await waRes.json();
          success = waRes.ok && !!waData.id;
          message = success ? `✅ Connected to: ${waData.name || waData.id}` : `❌ ${waData.error?.message || 'Connection failed'}`;
          break;

        case 'groq_ai':
          const groqKey = document.getElementById('groqApiKey')?.value?.trim();
          if (!groqKey) { message = 'API Key required'; break; }
          const groqRes = await fetch('https://api.groq.com/openai/v1/models', {
            headers: { 'Authorization': 'Bearer ' + groqKey }
          });
          const groqData = await groqRes.json();
          success = groqRes.ok && !!groqData.data;
          message = success ? '✅ Connected! Models available.' : `❌ ${groqData.error?.message || 'Connection failed'}`;
          break;

        case 'openai':
          const openaiKey = document.getElementById('openaiApiKey')?.value?.trim();
          if (!openaiKey) { message = 'API Key required'; break; }
          const openaiRes = await fetch('https://api.openai.com/v1/models', {
            headers: { 'Authorization': 'Bearer ' + openaiKey }
          });
          const openaiData = await openaiRes.json();
          success = openaiRes.ok && !!openaiData.data;
          message = success ? '✅ Connected! Models available.' : `❌ ${openaiData.error?.message || 'Connection failed'}`;
          break;

        default:
          // Generic test — save and reload
          await this.savePlatform(platform);
          message = '✅ Settings saved. Test by using the platform.';
          success = true;
      }

      resultEl.className = 'setup-test-result ' + (success ? 'success' : 'error');
      resultEl.innerHTML = message;
    } catch(e) {
      resultEl.className = 'setup-test-result error';
      resultEl.innerHTML = '❌ Error: ' + e.message;
    }

    setTimeout(() => { resultEl.style.display = 'none'; }, 5000);
  }
};
