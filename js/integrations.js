// js/integrations.js — Mega Integrations Hub (30+ Platforms)
const Integrations = {
  currentTab: 'all',

  // All integrations catalog
  platforms: [
    { id:'zapier', name:'Zapier', icon:'fa-bolt', color:'#FF4A00', category:'automation', desc:'Connect 5000+ apps without code', status:'ready', docUrl:'https://zapier.com/apps/webhook' },
    { id:'calendly', name:'Calendly', icon:'fa-calendar-check', color:'#006BFF', category:'scheduling', desc:'Automated meeting scheduling', status:'ready', docUrl:'https://developer.calendly.com' },
    { id:'zoho', name:'Zoho CRM', icon:'fa-cloud', color:'#F04848', category:'crm', desc:'Sync leads with Zoho CRM', status:'ready', docUrl:'https://www.zoho.com/crm/developer' },
    { id:'razorpay', name:'Razorpay', icon:'fa-rupee-sign', color:'#3395FF', category:'payment', desc:'Accept payments via WhatsApp', status:'ready', docUrl:'https://razorpay.com/docs/api' },
    { id:'stripe', name:'Stripe', icon:'fa-credit-card', color:'#635BFF', category:'payment', desc:'Global payment processing', status:'ready', docUrl:'https://stripe.com/docs/api' },
    { id:'hubspot', name:'HubSpot', icon:'fa-hubspot', color:'#FF7A59', category:'crm', desc:'Enterprise CRM sync', status:'ready', docUrl:'https://developers.hubspot.com' },
    { id:'salesforce', name:'Salesforce', icon:'fa-salesforce', color:'#00A1E0', category:'crm', desc:'Enterprise sales cloud', status:'coming', docUrl:'#' },
    { id:'pipedrive', name:'Pipedrive', icon:'fa-chart-line', color:'#203232', category:'crm', desc:'Sales pipeline sync', status:'coming', docUrl:'#' },
    { id:'mailchimp', name:'Mailchimp', icon:'fa-envelope', color:'#FFE01B', category:'email', desc:'Email marketing automation', status:'ready', docUrl:'https://mailchimp.com/developer' },
    { id:'sendgrid', name:'SendGrid', icon:'fa-paper-plane', color:'#1A82E2', category:'email', desc:'Transactional email delivery', status:'coming', docUrl:'#' },
    { id:'slack', name:'Slack', icon:'fa-slack', color:'#4A154B', category:'communication', desc:'Team notifications', status:'ready', docUrl:'https://api.slack.com/messaging/webhooks' },
    { id:'discord', name:'Discord', icon:'fa-discord', color:'#5865F2', category:'communication', desc:'Community notifications', status:'ready', docUrl:'https://discord.com/developers' },
    { id:'telegram', name:'Telegram', icon:'fa-telegram', color:'#26A5E4', category:'communication', desc:'Bot notifications', status:'ready', docUrl:'https://core.telegram.org/bots/api' },
    { id:'shopify', name:'Shopify', icon:'fa-store-alt', color:'#96BF48', category:'ecommerce', desc:'Order notifications via WhatsApp', status:'coming', docUrl:'#' },
    { id:'woocommerce', name:'WooCommerce', icon:'fa-wordpress', color:'#96588A', category:'ecommerce', desc:'WordPress store integration', status:'coming', docUrl:'#' },
    { id:'google_sheets', name:'Google Sheets', icon:'fa-table', color:'#34A853', category:'data', desc:'Auto-sync leads to sheets', status:'ready', docUrl:'https://developers.google.com/sheets/api' },
    { id:'google_analytics', name:'Google Analytics', icon:'fa-chart-bar', color:'#E37400', category:'analytics', desc:'Track conversions', status:'coming', docUrl:'#' },
    { id:'google_ads', name:'Google Ads', icon:'fa-google', color:'#4285F4', category:'ads', desc:'Sync lead forms', status:'ready', docUrl:'https://developers.google.com/google-ads' },
    { id:'meta_ads', name:'Meta Ads', icon:'fa-meta', color:'#0668E1', category:'ads', desc:'Facebook/Instagram lead ads', status:'ready', docUrl:'https://developers.facebook.com' },
    { id:'tiktok', name:'TikTok Ads', icon:'fa-music', color:'#000000', category:'ads', desc:'TikTok lead generation', status:'coming', docUrl:'#' },
    { id:'linkedin_ads', name:'LinkedIn Ads', icon:'fa-linkedin', color:'#0A66C2', category:'ads', desc:'LinkedIn lead gen forms', status:'coming', docUrl:'#' },
    { id:'webhook', name:'Custom Webhook', icon:'fa-link', color:'#6B7280', category:'developer', desc:'Send data to any URL', status:'ready', docUrl:'#' },
    { id:'api_keys', name:'API Access', icon:'fa-key', color:'#8B5CF6', category:'developer', desc:'REST API for developers', status:'ready', docUrl:'#' },
    { id:'openai', name:'OpenAI / ChatGPT', icon:'fa-robot', color:'#10A37F', category:'ai', desc:'AI-powered auto replies', status:'ready', docUrl:'https://platform.openai.com/docs' },
    { id:'dialogflow', name:'Dialogflow', icon:'fa-comment-dots', color:'#FF9800', category:'ai', desc:'Google AI chatbot', status:'coming', docUrl:'#' },
    { id:'manychat', name:'ManyChat', icon:'fa-comments', color:'#FF6B35', category:'chat', desc:'Visual chatbot builder', status:'coming', docUrl:'#' },
    { id:'twilio', name:'Twilio', icon:'fa-phone-alt', color:'#F22F46', category:'communication', desc:'SMS & voice integration', status:'ready', docUrl:'https://www.twilio.com/docs' },
    { id:'bitrix24', name:'Bitrix24', icon:'fa-briefcase', color:'#2FC6F6', category:'crm', desc:'Full business suite', status:'coming', docUrl:'#' },
    { id:'notion', name:'Notion', icon:'fa-book', color:'#000000', category:'productivity', desc:'Knowledge base & notes', status:'coming', docUrl:'#' },
    { id:'airtable', name:'Airtable', icon:'fa-database', color:'#18BFFF', category:'data', desc:'Spreadsheet-database hybrid', status:'ready', docUrl:'https://airtable.com/api' },
    { id:'quickbooks', name:'QuickBooks', icon:'fa-calculator', color:'#2CA01C', category:'finance', desc:'Accounting & invoicing', status:'coming', docUrl:'#' },
    { id:'jira', name:'Jira', icon:'fa-jira', color:'#0052CC', category:'productivity', desc:'Project & ticket tracking', status:'coming', docUrl:'#' },
  ],

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading integrations...</p>';
    await this.renderHub();
  },

  async renderHub() {
    const categories = [...new Set(this.platforms.map(p => p.category))];
    const filtered = this.currentTab === 'all' ? this.platforms : this.platforms.filter(p => p.category === this.currentTab);

    const getIcon = (p) => {
      if (p.id === 'hubspot') return '<i class="fab fa-hubspot"></i>';
      if (p.id === 'discord') return '<i class="fab fa-discord"></i>';
      if (p.id === 'telegram') return '<i class="fab fa-telegram"></i>';
      if (p.id === 'shopify') return '<i class="fas fa-store-alt"></i>';
      if (p.id === 'woocommerce') return '<i class="fab fa-wordpress"></i>';
      if (p.id === 'tiktok') return '<i class="fab fa-tiktok"></i>';
      if (p.id === 'bitrix24') return '<i class="fas fa-briefcase"></i>';
      if (p.id === 'jira') return '<i class="fab fa-jira"></i>';
      if (p.id === 'salesforce') return '<i class="fab fa-salesforce"></i>';
      if (p.icon.startsWith('fa-')) return `<i class="fas ${p.icon}"></i>`;
      return `<i class="fas ${p.icon}"></i>`;
    };

    let html = `
      <style>
        .integrations-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 24px; color: #fff; margin-bottom: 20px; }
        .category-chip { display: inline-block; padding: 8px 16px; border-radius: 24px; font-size: 13px; cursor: pointer; border: 1px solid #e0e0e0; margin: 3px; background: #fff; transition: 0.2s; }
        .category-chip:hover, .category-chip.active { background: #1877f2; color: #fff; border-color: #1877f2; }
        .integration-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 20px; transition: 0.2s; cursor: pointer; height: 100%; display: flex; flex-direction: column; }
        .integration-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); border-color: #1877f2; transform: translateY(-2px); }
        .integration-card.coming { opacity: 0.7; }
        .integration-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #fff; }
        .status-badge { position: absolute; top: 12px; right: 12px; padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: 600; }
        .status-badge.ready { background: #d1fae5; color: #065f46; }
        .status-badge.coming { background: #fef3c7; color: #92400e; }
        .connect-btn { margin-top: auto; }
      </style>

      <div class="integrations-header">
        <h3><i class="fas fa-plug me-2"></i>Integrations Hub</h3>
        <p class="mb-0 opacity-75">Connect your favorite tools and automate your workflow</p>
        <div class="row g-2 mt-3">
          <div class="col-6 col-md-3"><small>🔌 ${this.platforms.length} Platforms</small></div>
          <div class="col-6 col-md-3"><small>✅ ${this.platforms.filter(p=>p.status==='ready').length} Ready</small></div>
          <div class="col-6 col-md-3"><small>🔜 ${this.platforms.filter(p=>p.status==='coming').length} Coming Soon</small></div>
          <div class="col-6 col-md-3"><small>📂 ${categories.length} Categories</small></div>
        </div>
      </div>

      <!-- Category Filters -->
      <div class="mb-3">
        <span class="category-chip ${this.currentTab==='all'?'active':''}" onclick="Integrations.currentTab='all';Integrations.render();">🔄 All</span>
        ${categories.map(c => `
          <span class="category-chip ${this.currentTab===c?'active':''}" onclick="Integrations.currentTab='${c}';Integrations.render();">
            ${c === 'crm' ? '📋 CRM' : c === 'payment' ? '💳 Payments' : c === 'email' ? '📧 Email' : c === 'automation' ? '⚡ Automation' : c === 'communication' ? '💬 Chat' : c === 'ecommerce' ? '🛒 E-commerce' : c === 'ads' ? '📢 Ads' : c === 'ai' ? '🤖 AI' : c === 'scheduling' ? '📅 Schedule' : c === 'data' ? '📊 Data' : c === 'developer' ? '🛠 Dev Tools' : c === 'analytics' ? '📈 Analytics' : c === 'productivity' ? '📝 Productivity' : c === 'finance' ? '💰 Finance' : c === 'chat' ? '💭 Chat' : c}
          </span>
        `).join('')}
      </div>

      <!-- Integration Cards -->
      <div class="row g-3">
        ${filtered.map(p => `
          <div class="col-md-4 col-lg-3">
            <div class="integration-card ${p.status==='coming'?'coming':''}" style="position:relative;">
              <span class="status-badge ${p.status}">${p.status==='ready'?'Ready':'Soon'}</span>
              <div class="integration-icon" style="background:${p.color};">${getIcon(p)}</div>
              <h6 class="mt-2 mb-1">${p.name}</h6>
              <small class="text-muted">${p.desc}</small>
              <button class="btn btn-sm btn-${p.status==='ready'?'outline-primary':'outline-secondary'} w-100 mt-2 connect-btn" 
                ${p.status==='coming'?'disabled':''}
                onclick="Integrations.connectPlatform('${p.id}')">
                ${p.status==='ready'?'🔗 Connect':'🔜 Coming Soon'}
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    contentArea.innerHTML = html;
  },

  connectPlatform(id) {
    const p = this.platforms.find(pl => pl.id === id);
    if (!p) return;

    switch(id) {
      case 'zapier':
        const zapWebhook = this.getWorkerUrl() + '/zapier';
        prompt('Zapier Webhook URL (use "Catch Hook" trigger):', zapWebhook);
        break;
      case 'calendly':
        window.open('https://calendly.com/integrations', '_blank');
        break;
      case 'razorpay':
        alert('Go to Razorpay Dashboard → Settings → Webhooks\n\nWebhook URL: ' + this.getWorkerUrl() + '/razorpay');
        break;
      case 'stripe':
        alert('Go to Stripe Dashboard → Developers → Webhooks\n\nEndpoint URL: ' + this.getWorkerUrl() + '/stripe');
        break;
      case 'slack':
        alert('Go to Slack → Apps → Incoming Webhooks\n\nPaste the webhook URL in settings to receive CRM notifications.');
        break;
      case 'discord':
        alert('Go to Discord Server → Integrations → Webhooks\n\nUse webhook URL to send lead alerts.');
        break;
      case 'telegram':
        alert('Create a Telegram Bot via @BotFather\n\nSet webhook to: ' + this.getWorkerUrl() + '/telegram');
        break;
      case 'google_sheets':
        alert('Enter Google Sheet URL to auto-sync leads.\n\nMake sure sheet is shared as "Anyone with link → Editor".');
        break;
      case 'webhook':
        const customUrl = prompt('Enter your webhook endpoint URL:');
        if (customUrl) {
          db.collection('settings').doc('webhooks').set({ customUrl }, { merge: true });
          alert('✅ Custom webhook saved!');
        }
        break;
      case 'api_keys':
        const key = 'wa_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
        prompt('Your API Key (copy now):', key);
        db.collection('settings').doc('api_keys').set({ keys: [{ name:'Default', key, createdAt: new Date().toISOString() }] }, { merge: true });
        break;
      case 'openai':
        const apiKey = prompt('Enter your OpenAI API Key (sk-...):');
        if (apiKey) {
          db.collection('settings').doc('chatbot').set({ apiKey, enabled: true }, { merge: true });
          alert('✅ OpenAI connected!');
        }
        break;
      default:
        alert(`📘 ${p.name} Integration Guide:\n\n${p.docUrl}\n\nUse webhook URL: ${this.getWorkerUrl()}/${id}`);
    }
  },

  getWorkerUrl() {
    return 'https://wa-crm.11avatardigitalhub.workers.dev';
  }
};
