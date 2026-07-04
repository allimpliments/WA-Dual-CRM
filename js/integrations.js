// js/integrations.js — All 32 Platforms Ready to Connect
const Integrations = {
  currentTab: 'all',

  platforms: [
    { id:'zapier', name:'Zapier', icon:'fa-bolt', color:'#FF4A00', category:'automation', desc:'Connect 5000+ apps', connectType:'webhook' },
    { id:'calendly', name:'Calendly', icon:'fa-calendar-check', color:'#006BFF', category:'scheduling', desc:'Meeting scheduler', connectType:'link' },
    { id:'zoho', name:'Zoho CRM', icon:'fa-cloud', color:'#F04848', category:'crm', desc:'Sync leads bidirectionally', connectType:'webhook' },
    { id:'razorpay', name:'Razorpay', icon:'fa-rupee-sign', color:'#3395FF', category:'payment', desc:'Accept payments', connectType:'webhook' },
    { id:'stripe', name:'Stripe', icon:'fa-credit-card', color:'#635BFF', category:'payment', desc:'Global payments', connectType:'webhook' },
    { id:'hubspot', name:'HubSpot', icon:'fa-hubspot', color:'#FF7A59', category:'crm', desc:'CRM sync', connectType:'webhook' },
    { id:'salesforce', name:'Salesforce', icon:'fa-salesforce', color:'#00A1E0', category:'crm', desc:'Enterprise CRM', connectType:'webhook' },
    { id:'pipedrive', name:'Pipedrive', icon:'fa-chart-line', color:'#203232', category:'crm', desc:'Pipeline sync', connectType:'webhook' },
    { id:'mailchimp', name:'Mailchimp', icon:'fa-envelope', color:'#FFE01B', category:'email', desc:'Email marketing', connectType:'webhook' },
    { id:'sendgrid', name:'SendGrid', icon:'fa-paper-plane', color:'#1A82E2', category:'email', desc:'Email delivery', connectType:'api' },
    { id:'slack', name:'Slack', icon:'fa-slack', color:'#4A154B', category:'communication', desc:'Team notifications', connectType:'webhook' },
    { id:'discord', name:'Discord', icon:'fa-discord', color:'#5865F2', category:'communication', desc:'Community alerts', connectType:'webhook' },
    { id:'telegram', name:'Telegram', icon:'fa-telegram', color:'#26A5E4', category:'communication', desc:'Bot notifications', connectType:'webhook' },
    { id:'twilio', name:'Twilio', icon:'fa-phone-alt', color:'#F22F46', category:'communication', desc:'SMS & voice', connectType:'api' },
    { id:'shopify', name:'Shopify', icon:'fa-store-alt', color:'#96BF48', category:'ecommerce', desc:'Order alerts', connectType:'webhook' },
    { id:'woocommerce', name:'WooCommerce', icon:'fa-wordpress', color:'#96588A', category:'ecommerce', desc:'Store integration', connectType:'webhook' },
    { id:'google_sheets', name:'Google Sheets', icon:'fa-table', color:'#34A853', category:'data', desc:'Auto-sync data', connectType:'sheet' },
    { id:'google_analytics', name:'Google Analytics', icon:'fa-chart-bar', color:'#E37400', category:'analytics', desc:'Track conversions', connectType:'api' },
    { id:'google_ads', name:'Google Ads', icon:'fa-google', color:'#4285F4', category:'ads', desc:'Lead form sync', connectType:'webhook' },
    { id:'meta_ads', name:'Meta Ads', icon:'fa-meta', color:'#0668E1', category:'ads', desc:'FB/IG lead ads', connectType:'webhook' },
    { id:'tiktok', name:'TikTok Ads', icon:'fa-music', color:'#000000', category:'ads', desc:'Lead generation', connectType:'webhook' },
    { id:'linkedin_ads', name:'LinkedIn Ads', icon:'fa-linkedin', color:'#0A66C2', category:'ads', desc:'Lead gen forms', connectType:'webhook' },
    { id:'openai', name:'OpenAI/ChatGPT', icon:'fa-robot', color:'#10A37F', category:'ai', desc:'AI auto-replies', connectType:'api' },
    { id:'dialogflow', name:'Dialogflow', icon:'fa-comment-dots', color:'#FF9800', category:'ai', desc:'Google AI chatbot', connectType:'api' },
    { id:'manychat', name:'ManyChat', icon:'fa-comments', color:'#FF6B35', category:'chat', desc:'Chat automation', connectType:'webhook' },
    { id:'notion', name:'Notion', icon:'fa-book', color:'#000000', category:'productivity', desc:'Knowledge base', connectType:'api' },
    { id:'airtable', name:'Airtable', icon:'fa-database', color:'#18BFFF', category:'data', desc:'Database sync', connectType:'api' },
    { id:'bitrix24', name:'Bitrix24', icon:'fa-briefcase', color:'#2FC6F6', category:'crm', desc:'Business suite', connectType:'webhook' },
    { id:'quickbooks', name:'QuickBooks', icon:'fa-calculator', color:'#2CA01C', category:'finance', desc:'Accounting sync', connectType:'webhook' },
    { id:'jira', name:'Jira', icon:'fa-jira', color:'#0052CC', category:'productivity', desc:'Issue tracking', connectType:'webhook' },
    { id:'custom_webhook', name:'Custom Webhook', icon:'fa-link', color:'#6B7280', category:'developer', desc:'Your own endpoint', connectType:'custom' },
    { id:'api_access', name:'REST API', icon:'fa-code', color:'#8B5CF6', category:'developer', desc:'Full API access', connectType:'keys' },
  ],

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading...</p>';
    await this.renderHub();
  },

  async renderHub() {
    const categories = [...new Set(this.platforms.map(p => p.category))];
    const filtered = this.currentTab === 'all' ? this.platforms : this.platforms.filter(p => p.category === this.currentTab);

    const catLabels = {
      crm:'📋 CRM', payment:'💳 Payments', email:'📧 Email', automation:'⚡ Automation',
      communication:'💬 Communication', ecommerce:'🛒 E‑commerce', ads:'📢 Ads',
      ai:'🤖 AI', scheduling:'📅 Scheduling', data:'📊 Data', developer:'🛠 Dev Tools',
      analytics:'📈 Analytics', productivity:'📝 Productivity', finance:'💰 Finance', chat:'💭 Chat'
    };

    let html = `
      <style>
        .hub-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 24px; color: #fff; margin-bottom: 16px; }
        .cat-chip { display: inline-block; padding: 8px 14px; border-radius: 20px; font-size: 12px; cursor: pointer; border: 1px solid #e0e0e0; margin: 2px; background: #fff; transition: 0.2s; }
        .cat-chip:hover, .cat-chip.active { background: #1877f2; color: #fff; border-color: #1877f2; }
        .int-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 16px; transition: 0.2s; cursor: pointer; height: 100%; position: relative; }
        .int-card:hover { box-shadow: 0 8px 20px rgba(0,0,0,0.08); border-color: #1877f2; transform: translateY(-2px); }
        .int-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #fff; }
        .connect-type { font-size: 9px; padding: 2px 6px; border-radius: 8px; position: absolute; top: 10px; right: 10px; }
        .connect-type.webhook { background: #e0e7ff; color: #3730a3; }
        .connect-type.api { background: #fef3c7; color: #92400e; }
        .connect-type.sheet { background: #d1fae5; color: #065f46; }
        .connect-type.link { background: #fce7f3; color: #9d174d; }
        .connect-type.keys { background: #e0f2fe; color: #0369a1; }
        .connect-type.custom { background: #f3f4f6; color: #374151; }
      </style>

      <div class="hub-header">
        <h4><i class="fas fa-plug me-2"></i>Integrations Hub</h4>
        <p class="mb-0 opacity-75 small">${this.platforms.length} platforms — all ready to connect</p>
      </div>

      <div class="mb-3">
        <span class="cat-chip ${this.currentTab==='all'?'active':''}" onclick="Integrations.currentTab='all';Integrations.render();">🔄 All</span>
        ${categories.map(c => `<span class="cat-chip ${this.currentTab===c?'active':''}" onclick="Integrations.currentTab='${c}';Integrations.render();">${catLabels[c]||c}</span>`).join('')}
      </div>

      <div class="row g-3">
        ${filtered.map(p => `
          <div class="col-md-4 col-lg-3">
            <div class="int-card" onclick="Integrations.connect('${p.id}')">
              <span class="connect-type ${p.connectType}">${p.connectType.toUpperCase()}</span>
              <div class="int-icon" style="background:${p.color};">
                <i class="fab ${p.icon}"></i>
              </div>
              <h6 class="mt-2 mb-1">${p.name}</h6>
              <small class="text-muted">${p.desc}</small>
              <button class="btn btn-sm btn-primary w-100 mt-2">🔗 Connect</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    contentArea.innerHTML = html;
  },

  getWorkerUrl() {
    return 'https://wa-crm.11avatardigitalhub.workers.dev';
  },

  connect(id) {
    const p = this.platforms.find(pl => pl.id === id);
    const W = this.getWorkerUrl();

    const actions = {
      zapier: () => prompt('Zapier Webhook URL (use "Catch Hook" trigger):', W + '/zapier'),
      calendly: () => window.open('https://calendly.com/integrations', '_blank'),
      zoho: () => prompt('Zoho CRM Webhook URL:', W + '/zoho'),
      razorpay: () => alert(`Razorpay → Settings → Webhooks\nURL: ${W}/razorpay`),
      stripe: () => alert(`Stripe → Developers → Webhooks\nURL: ${W}/stripe`),
      hubspot: () => prompt('HubSpot Webhook URL:', W + '/hubspot'),
      salesforce: () => prompt('Salesforce Webhook URL:', W + '/salesforce'),
      pipedrive: () => prompt('Pipedrive Webhook URL:', W + '/pipedrive'),
      mailchimp: () => prompt('Mailchimp Webhook URL:', W + '/mailchimp'),
      sendgrid: () => { const k = prompt('SendGrid API Key:'); if(k) this.saveConfig('sendgrid',{apiKey:k}); },
      slack: () => alert(`Slack → Incoming Webhooks → New\nPaste URL: ${W}/slack`),
      discord: () => alert(`Discord → Server Settings → Integrations → Webhooks\nCopy webhook URL`),
      telegram: () => { const t = prompt('Telegram Bot Token (from @BotFather):'); if(t) this.saveConfig('telegram',{token:t}); alert(`Set webhook: ${W}/telegram`); },
      twilio: () => { const s = prompt('Twilio Account SID:'); const a = prompt('Auth Token:'); if(s&&a) this.saveConfig('twilio',{sid:s,token:a}); },
      shopify: () => alert(`Shopify → Settings → Notifications → Webhooks\nURL: ${W}/shopify`),
      woocommerce: () => prompt('WooCommerce Webhook URL:', W + '/woocommerce'),
      google_sheets: () => { const u = prompt('Google Sheet URL (shared as Editor):'); if(u) this.saveConfig('google_sheets',{url:u,sheetName:'Sheet1'}); },
      google_analytics: () => { const g = prompt('Google Analytics Measurement ID (G-...):'); if(g) this.saveConfig('google_analytics',{id:g}); },
      google_ads: () => prompt('Google Ads Webhook URL:', W + '/google-ads'),
      meta_ads: () => prompt('Meta Ads Webhook URL:', W + '/fb-lead-webhook'),
      tiktok: () => prompt('TikTok Webhook URL:', W + '/tiktok'),
      linkedin_ads: () => prompt('LinkedIn Ads Webhook URL:', W + '/linkedin-ads'),
      openai: () => { const o = prompt('OpenAI API Key (sk-...):'); if(o) this.saveConfig('chatbot',{apiKey:o,enabled:true}); },
      dialogflow: () => { const d = prompt('Dialogflow Project ID:'); if(d) this.saveConfig('dialogflow',{projectId:d}); },
      manychat: () => prompt('ManyChat Webhook URL:', W + '/manychat'),
      notion: () => { const n = prompt('Notion Integration Token:'); if(n) this.saveConfig('notion',{token:n}); },
      airtable: () => { const a = prompt('Airtable Personal Access Token:'); if(a) this.saveConfig('airtable',{token:a}); },
      bitrix24: () => prompt('Bitrix24 Webhook URL:', W + '/bitrix24'),
      quickbooks: () => prompt('QuickBooks Webhook URL:', W + '/quickbooks'),
      jira: () => prompt('Jira Webhook URL:', W + '/jira'),
      custom_webhook: () => { const c = prompt('Your webhook endpoint URL:'); if(c) this.saveConfig('webhooks',{customUrl:c}); },
      api_access: () => { const key = 'wa_' + Date.now().toString(36) + Math.random().toString(36).substring(2,10); prompt('API Key (copy now):', key); this.saveConfig('api_keys',{keys:[{name:'Default',key,createdAt:new Date().toISOString()}]}); },
    };

    if (actions[id]) actions[id]();
    else alert(`Connect ${p.name} via: ${p.docUrl || W + '/' + id}`);
  },

  async saveConfig(docId, data) {
    try {
      await db.collection('settings').doc(docId).set(data, { merge: true });
      alert('✅ Connected successfully!');
    } catch(e) { alert('Error: ' + e.message); }
  }
};
