// js/integrations.js — Enterprise-Grade Integration Hub for Global SaaS Platform
const Integrations = {
  currentTab: 'all',
  selectedPlatform: null,
  showConnectionModal: false,
  connectionStatus: {},

  platforms: [
    // ========== CRM ==========
    { id:'zoho', name:'Zoho CRM', icon:'fa-cloud', color:'#F04848', category:'crm', desc:'Bidirectional lead & contact sync with Zoho CRM', connectType:'webhook', docUrl:'https://www.zoho.com/crm/developer/docs/api/v6/', triggers:['lead.created','lead.updated','contact.created'], webhookTemplate:'/zoho' },
    { id:'hubspot', name:'HubSpot', icon:'fa-hubspot', color:'#FF7A59', category:'crm', desc:'Sync leads, contacts & deals with HubSpot CRM', connectType:'webhook', docUrl:'https://developers.hubspot.com/docs/api/webhooks', triggers:['contact.creation','deal.creation'], webhookTemplate:'/hubspot' },
    { id:'salesforce', name:'Salesforce', icon:'fa-salesforce', color:'#00A1E0', category:'crm', desc:'Enterprise-grade CRM sync with Salesforce', connectType:'webhook', docUrl:'https://developer.salesforce.com/docs', triggers:['lead.created','contact.created','opportunity.created'], webhookTemplate:'/salesforce' },
    { id:'pipedrive', name:'Pipedrive', icon:'fa-chart-line', color:'#203232', category:'crm', desc:'Pipeline & deal sync with Pipedrive', connectType:'webhook', docUrl:'https://pipedrive.readme.io/docs', triggers:['deal.created','deal.updated'], webhookTemplate:'/pipedrive' },
    { id:'bitrix24', name:'Bitrix24', icon:'fa-briefcase', color:'#2FC6F6', category:'crm', desc:'Full business suite integration', connectType:'webhook', docUrl:'https://training.bitrix24.com/rest_help/', triggers:['lead.add','contact.add'], webhookTemplate:'/bitrix24' },

    // ========== PAYMENT ==========
    { id:'razorpay', name:'Razorpay', icon:'fa-rupee-sign', color:'#3395FF', category:'payment', desc:'Accept UPI, cards, netbanking — India focused', connectType:'webhook', docUrl:'https://razorpay.com/docs/webhooks/', triggers:['payment.captured','payment.failed','order.paid'], webhookTemplate:'/razorpay' },
    { id:'stripe', name:'Stripe', icon:'fa-credit-card', color:'#635BFF', category:'payment', desc:'Global payments — cards, wallets, bank transfers', connectType:'webhook', docUrl:'https://stripe.com/docs/webhooks', triggers:['checkout.session.completed','invoice.paid','payment_intent.succeeded'], webhookTemplate:'/stripe' },
    { id:'paypal', name:'PayPal', icon:'fa-paypal', color:'#003087', category:'payment', desc:'International payments via PayPal', connectType:'webhook', docUrl:'https://developer.paypal.com/docs/webhooks/', triggers:['PAYMENT.SALE.COMPLETED','BILLING.SUBSCRIPTION.CREATED'], webhookTemplate:'/paypal' },
    { id:'phonepe', name:'PhonePe', icon:'fa-mobile-alt', color:'#5F259F', category:'payment', desc:'UPI payments via PhonePe Payment Gateway', connectType:'webhook', docUrl:'https://developer.phonepe.com/', triggers:['payment.success','payment.failed'], webhookTemplate:'/phonepe' },

    // ========== COMMUNICATION ==========
    { id:'slack', name:'Slack', icon:'fa-slack', color:'#4A154B', category:'communication', desc:'Real-time notifications to Slack channels', connectType:'webhook', docUrl:'https://api.slack.com/messaging/webhooks', triggers:['lead.created','ticket.created','payment.received'], webhookTemplate:'/slack' },
    { id:'discord', name:'Discord', icon:'fa-discord', color:'#5865F2', category:'communication', desc:'Community & team alerts via Discord', connectType:'webhook', docUrl:'https://discord.com/developers/docs/resources/webhook', triggers:['lead.created','campaign.completed'], webhookTemplate:'/discord' },
    { id:'telegram', name:'Telegram Bot', icon:'fa-telegram', color:'#26A5E4', category:'communication', desc:'Send notifications via Telegram bot', connectType:'webhook', docUrl:'https://core.telegram.org/bots/api', triggers:['lead.created','message.received'], webhookTemplate:'/telegram' },
    { id:'twilio', name:'Twilio (SMS/Voice)', icon:'fa-phone-alt', color:'#F22F46', category:'communication', desc:'Send SMS & make calls programmatically', connectType:'api', docUrl:'https://www.twilio.com/docs', triggers:['sms.send','call.initiate'], webhookTemplate:'/twilio' },

    // ========== EMAIL MARKETING ==========
    { id:'mailchimp', name:'Mailchimp', icon:'fa-envelope', color:'#FFE01B', category:'email', desc:'Sync contacts & trigger email campaigns', connectType:'webhook', docUrl:'https://mailchimp.com/developer/', triggers:['subscribe','unsubscribe'], webhookTemplate:'/mailchimp' },
    { id:'sendgrid', name:'SendGrid', icon:'fa-paper-plane', color:'#1A82E2', category:'email', desc:'Transactional email delivery at scale', connectType:'api', docUrl:'https://docs.sendgrid.com/', triggers:['email.sent','email.delivered','email.bounced'], webhookTemplate:'/sendgrid' },

    // ========== E-COMMERCE ==========
    { id:'shopify', name:'Shopify', icon:'fa-store-alt', color:'#96BF48', category:'ecommerce', desc:'Order, product & customer sync with Shopify', connectType:'webhook', docUrl:'https://shopify.dev/docs/api/webhooks', triggers:['orders/create','customers/create','products/create'], webhookTemplate:'/shopify' },
    { id:'woocommerce', name:'WooCommerce', icon:'fa-wordpress', color:'#96588A', category:'ecommerce', desc:'WordPress store integration', connectType:'webhook', docUrl:'https://woocommerce.com/document/webhooks/', triggers:['order.created','customer.created'], webhookTemplate:'/woocommerce' },

    // ========== ADS ==========
    { id:'meta_ads', name:'Meta Ads (FB/IG)', icon:'fa-meta', color:'#0668E1', category:'ads', desc:'Facebook & Instagram lead ads sync', connectType:'webhook', docUrl:'https://developers.facebook.com/docs/marketing-api/guides/lead-ads/', triggers:['leadgen.form.submitted'], webhookTemplate:'/fb-lead-webhook' },
    { id:'google_ads', name:'Google Ads', icon:'fa-google', color:'#4285F4', category:'ads', desc:'Google lead form extensions sync', connectType:'webhook', docUrl:'https://developers.google.com/google-ads/api/docs/lead-form-assets', triggers:['lead_form.submitted'], webhookTemplate:'/google-ads' },
    { id:'linkedin_ads', name:'LinkedIn Ads', icon:'fa-linkedin', color:'#0A66C2', category:'ads', desc:'LinkedIn lead gen forms sync', connectType:'webhook', docUrl:'https://learn.microsoft.com/en-us/linkedin/marketing/', triggers:['leadGenForm.submitted'], webhookTemplate:'/linkedin-ads' },

    // ========== SCHEDULING ==========
    { id:'calendly', name:'Calendly', icon:'fa-calendar-check', color:'#006BFF', category:'scheduling', desc:'Auto-sync booked meetings & create leads', connectType:'webhook', docUrl:'https://developer.calendly.com/api-docs/', triggers:['invitee.created','invitee.canceled'], webhookTemplate:'/calendly' },
    { id:'google_calendar', name:'Google Calendar', icon:'fa-calendar', color:'#4285F4', category:'scheduling', desc:'2-way sync with Google Calendar', connectType:'api', docUrl:'https://developers.google.com/calendar/api', triggers:['event.created','event.updated'], webhookTemplate:'/google-calendar' },

    // ========== AI ==========
    { id:'openai', name:'OpenAI / ChatGPT', icon:'fa-robot', color:'#10A37F', category:'ai', desc:'Power AI chatbot & content generation', connectType:'api', docUrl:'https://platform.openai.com/docs/api-reference', triggers:['chat.completion','image.generation'], webhookTemplate:'/openai' },
    { id:'dialogflow', name:'Dialogflow CX', icon:'fa-comment-dots', color:'#FF9800', category:'ai', desc:'Google AI chatbot for advanced flows', connectType:'api', docUrl:'https://cloud.google.com/dialogflow/cx/docs', triggers:['detect_intent'], webhookTemplate:'/dialogflow' },

    // ========== DATA & AUTOMATION ==========
    { id:'zapier', name:'Zapier', icon:'fa-bolt', color:'#FF4A00', category:'automation', desc:'Connect 5000+ apps without code', connectType:'webhook', docUrl:'https://zapier.com/developer/documentation/', triggers:['catch.hook'], webhookTemplate:'/zapier' },
    { id:'google_sheets', name:'Google Sheets', icon:'fa-table', color:'#34A853', category:'data', desc:'Auto-sync leads & contacts to sheets', connectType:'sheet', docUrl:'https://developers.google.com/sheets/api', triggers:['row.append','row.update'], webhookTemplate:'/google-sheets' },
    { id:'airtable', name:'Airtable', icon:'fa-database', color:'#18BFFF', category:'data', desc:'Database sync with Airtable bases', connectType:'api', docUrl:'https://airtable.com/developers/web/api', triggers:['record.created','record.updated'], webhookTemplate:'/airtable' },

    // ========== PRODUCTIVITY ==========
    { id:'notion', name:'Notion', icon:'fa-book', color:'#000000', category:'productivity', desc:'Sync data to Notion databases', connectType:'api', docUrl:'https://developers.notion.com/', triggers:['page.created','database.updated'], webhookTemplate:'/notion' },
    { id:'jira', name:'Jira', icon:'fa-jira', color:'#0052CC', category:'productivity', desc:'Create tickets from leads/tickets', connectType:'webhook', docUrl:'https://developer.atlassian.com/cloud/jira/platform/webhooks/', triggers:['issue.created'], webhookTemplate:'/jira' },

    // ========== DEVELOPER ==========
    { id:'custom_webhook', name:'Custom Webhook', icon:'fa-link', color:'#6B7280', category:'developer', desc:'Send data to any custom endpoint', connectType:'custom', docUrl:'#', triggers:['any.event'], webhookTemplate:'/custom' },
    { id:'api_access', name:'REST API Access', icon:'fa-code', color:'#8B5CF6', category:'developer', desc:'Full programmatic API access', connectType:'keys', docUrl:'#', triggers:['all.crud.operations'], webhookTemplate:'/api' },
  ],

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = '#f8fafc';

    // Load connection status
    try {
      const doc = await db.collection('settings').doc('integration_status').get();
      if (doc.exists) this.connectionStatus = doc.data() || {};
    } catch(e) {}

    if (this.selectedPlatform) { await this.renderPlatformDetail(this.selectedPlatform); return; }

    await this.renderHub();
  },

  async renderHub() {
    const categories = [...new Set(this.platforms.map(p => p.category))];
    const filtered = this.currentTab === 'all' ? this.platforms : this.platforms.filter(p => p.category === this.currentTab);

    const catLabels = {
      crm:'📋 CRM', payment:'💳 Payments', email:'📧 Email Marketing', automation:'⚡ Automation',
      communication:'💬 Communication', ecommerce:'🛒 E‑commerce', ads:'📢 Ads',
      ai:'🤖 AI', scheduling:'📅 Scheduling', data:'📊 Data & Sheets', developer:'🛠 Developer Tools',
      productivity:'📝 Productivity'
    };

    const connectedCount = Object.values(this.connectionStatus).filter(v=>v).length;

    let html = `
      <style>
        .int-wrap { max-width: 1400px; margin: 0 auto; }
        .int-header { background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 20px; padding: 28px 32px; margin-bottom: 24px; color: #fff; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .int-header h4 { margin: 0; font-weight: 800; font-size: 22px; }
        .int-header p { margin: 4px 0 0; color: #94a3b8; font-size: 13px; }
        .int-cat-chip { display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 12px; cursor: pointer; border: 1px solid #e2e8f0; margin: 2px; background: #fff; transition: 0.2s; font-weight: 500; color: #475569; }
        .int-cat-chip:hover, .int-cat-chip.active { background: #6366f1; color: #fff; border-color: #6366f1; }
        .int-card { background: #fff; border-radius: 16px; padding: 20px; border: 1px solid #f1f5f9; transition: 0.2s; cursor: pointer; position: relative; }
        .int-card:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.06); border-color: #6366f1; transform: translateY(-2px); }
        .int-card.connected { border-color: #10b981; }
        .int-card.connected::before { content: '✓ Connected'; position: absolute; top: 12px; right: 12px; background: #ecfdf5; color: #10b981; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 10px; }
        .int-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #fff; margin-bottom: 10px; }
        .int-connect-type { font-size: 9px; padding: 2px 8px; border-radius: 8px; font-weight: 600; display: inline-block; margin-bottom: 8px; }
        .int-connect-type.webhook { background: #eef2ff; color: #4f46e5; }
        .int-connect-type.api { background: #fef3c7; color: #92400e; }
        .int-connect-type.sheet { background: #ecfdf5; color: #065f46; }
        .int-connect-type.link { background: #fce7f3; color: #9d174d; }
        .int-connect-type.keys { background: #e0f2fe; color: #0369a1; }
        .int-connect-type.custom { background: #f1f5f9; color: #475569; }
        .int-btn { padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .int-btn-primary { background: #6366f1; color: #fff; }
        .int-btn-primary:hover { background: #4f46e5; }
        .int-btn-outline { background: #fff; color: #6366f1; border: 1px solid #6366f1; }
        .int-btn-outline:hover { background: #eef2ff; }
        .int-detail-card { background: #fff; border-radius: 16px; padding: 28px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .int-input { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13px; outline: none; margin-bottom: 10px; }
        .int-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .int-code-block { background: #1e293b; color: #e2e8f0; padding: 14px 18px; border-radius: 12px; font-family: 'Courier New', monospace; font-size: 12px; overflow-x: auto; margin: 8px 0; }
        @media (max-width: 768px) { .int-header { padding: 20px; } }
      </style>

      <div class="int-wrap">
        <div class="int-header">
          <div>
            <h4><i class="fas fa-plug me-2"></i>Integration Hub</h4>
            <p>Connect your favorite tools and automate workflows</p>
          </div>
          <div class="d-flex gap-3">
            <div class="text-center"><div style="font-size:22px;font-weight:800;">${this.platforms.length}</div><small style="color:#94a3b8;">Available</small></div>
            <div class="text-center"><div style="font-size:22px;font-weight:800;color:#10b981;">${connectedCount}</div><small style="color:#94a3b8;">Connected</small></div>
          </div>
        </div>

        <div class="mb-3">
          <span class="int-cat-chip ${this.currentTab==='all'?'active':''}" onclick="Integrations.currentTab='all';Integrations.render();">🔄 All (${this.platforms.length})</span>
          ${categories.map(c => `<span class="int-cat-chip ${this.currentTab===c?'active':''}" onclick="Integrations.currentTab='${c}';Integrations.render();">${catLabels[c]||c}</span>`).join('')}
        </div>

        <div class="row g-3">
          ${filtered.map(p => {
            const isConnected = !!this.connectionStatus[p.id];
            return `
            <div class="col-md-6 col-lg-3">
              <div class="int-card ${isConnected?'connected':''}" onclick="Integrations.selectedPlatform='${p.id}';Integrations.render();">
                <span class="int-connect-type ${p.connectType}">${p.connectType.toUpperCase()}</span>
                <div class="int-icon" style="background:${p.color};"><i class="fab ${p.icon}"></i></div>
                <h6 style="font-weight:700;font-size:14px;margin-bottom:2px;">${p.name}</h6>
                <p style="font-size:11px;color:#64748b;margin:0;">${p.desc}</p>
                <button class="int-btn int-btn-primary w-100 mt-3" onclick="event.stopPropagation();Integrations.selectedPlatform='${p.id}';Integrations.render();">
                  ${isConnected ? '⚙️ Manage' : '🔗 Connect'}
                </button>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  // ==================== PLATFORM DETAIL ====================
  async renderPlatformDetail(platformId) {
    const p = this.platforms.find(pl => pl.id === platformId);
    if (!p) { this.selectedPlatform = null; this.render(); return; }

    const isConnected = !!this.connectionStatus[p.id];
    const webhookBase = this.getWorkerUrl();
    const webhookUrl = webhookBase + (p.webhookTemplate || '/' + p.id);

    // Load saved config for this platform
    let savedConfig = {};
    try {
      const doc = await db.collection('settings').doc('integration_' + p.id).get();
      if (doc.exists) savedConfig = doc.data();
    } catch(e) {}

    // Generate API key for dev access
    let apiKeys = [];
    if (p.id === 'api_access') {
      try {
        const keyDoc = await db.collection('settings').doc('api_keys').get();
        if (keyDoc.exists) apiKeys = keyDoc.data().keys || [];
      } catch(e) {}
    }

    let html = `
      <div class="int-wrap">
        <button class="int-btn int-btn-outline mb-3" onclick="Integrations.selectedPlatform=null;Integrations.render();"><i class="fas fa-arrow-left me-1"></i> Back to Hub</button>
        
        <div class="int-detail-card">
          <div class="d-flex gap-4 align-items-start mb-4 flex-wrap">
            <div class="int-icon" style="width:64px;height:64px;font-size:28px;background:${p.color};flex-shrink:0;"><i class="fab ${p.icon}"></i></div>
            <div class="flex-grow-1">
              <h4 style="font-weight:800;margin:0;">${p.name}</h4>
              <p style="color:#64748b;margin:4px 0;">${p.desc}</p>
              <span class="int-connect-type ${p.connectType}">${p.connectType.toUpperCase()}</span>
              <span class="int-badge" style="background:${isConnected?'#ecfdf5':'#f1f5f9'};color:${isConnected?'#10b981':'#94a3b8'};padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;margin-left:8px;">${isConnected ? '● Connected' : '○ Not Connected'}</span>
            </div>
          </div>

          <div class="row g-4">
            <div class="col-lg-7">
              <h6 style="font-weight:700;">📋 Setup Instructions</h6>
              <div style="background:#f8fafc;border-radius:12px;padding:16px;font-size:13px;color:#475569;line-height:1.8;">
                ${this.getSetupInstructions(p)}
              </div>

              ${p.connectType === 'webhook' || p.connectType === 'custom' ? `
                <h6 style="font-weight:700;margin-top:16px;">🔗 Your Webhook URL</h6>
                <div class="int-code-block">${webhookUrl}</div>
                <button class="int-btn int-btn-outline btn-sm mt-2" onclick="navigator.clipboard.writeText('${webhookUrl}');showToast('✅ Webhook URL copied!','success');"><i class="fas fa-copy"></i> Copy URL</button>
                <button class="int-btn int-btn-outline btn-sm mt-2 ms-2" onclick="Integrations.testWebhook('${p.id}')"><i class="fas fa-flask"></i> Test Connection</button>
                <div id="webhookTestResult" class="mt-2"></div>
              ` : ''}

              ${p.connectType === 'api' || p.connectType === 'keys' ? `
                <h6 style="font-weight:700;margin-top:16px;">🔑 API Credentials</h6>
                <input type="text" id="intApiKey" class="int-input" placeholder="${p.id==='api_access'?'API Key':'Enter API Key / Token'}" value="${p.id==='api_access'?(apiKeys[0]?.key||''):(savedConfig.apiKey||savedConfig.token||savedConfig.sid||'')}">
                ${p.id === 'twilio' ? '<input type="text" id="intApiSecret" class="int-input" placeholder="Auth Token / Secret" value="'+ (savedConfig.token||savedConfig.authToken||'') +'">' : ''}
                ${p.id === 'api_access' ? '<input type="text" id="intApiName" class="int-input" placeholder="Key Name (e.g. Production)">' : ''}
                <button class="int-btn int-btn-primary btn-sm mt-2" onclick="Integrations.saveApiCredentials('${p.id}')"><i class="fas fa-save"></i> Save Credentials</button>
                ${p.id === 'api_access' ? '<button class="int-btn int-btn-outline btn-sm mt-2 ms-2" onclick="Integrations.generateNewApiKey()"><i class="fas fa-key"></i> Generate New Key</button>' : ''}
              ` : ''}
            </div>

            <div class="col-lg-5">
              <h6 style="font-weight:700;">⚡ Supported Triggers</h6>
              <div style="background:#f8fafc;border-radius:12px;padding:14px;">
                ${(p.triggers||[]).map(t => `<span class="int-badge" style="background:#eef2ff;color:#6366f1;padding:4px 10px;border-radius:20px;font-size:10px;font-weight:600;margin:2px;display:inline-block;">${t}</span>`).join(' ')}
              </div>

              <h6 style="font-weight:700;margin-top:16px;">📖 Documentation</h6>
              <a href="${p.docUrl}" target="_blank" class="int-btn int-btn-outline w-100"><i class="fas fa-external-link-alt"></i> Open ${p.name} API Docs</a>

              <h6 style="font-weight:700;margin-top:16px;">🔄 Connection Status</h6>
              <button class="int-btn int-btn-outline w-100" onclick="Integrations.testConnection('${p.id}')"><i class="fas fa-sync-alt"></i> Test Connection</button>
              <div id="connectionTestResult" class="mt-2"></div>

              ${isConnected ? `<button class="int-btn int-btn-danger w-100 mt-2" onclick="Integrations.disconnect('${p.id}')"><i class="fas fa-unlink"></i> Disconnect</button>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  getSetupInstructions(p) {
    const instructions = {
      zapier: `<strong>Step 1:</strong> Go to <a href="https://zapier.com/app/webhooks" target="_blank">Zapier Webhooks</a><br><strong>Step 2:</strong> Create a new Zap with "Webhooks by Zapier" as trigger<br><strong>Step 3:</strong> Choose "Catch Hook" and copy the webhook URL<br><strong>Step 4:</strong> Paste the webhook URL above into Zapier<br><strong>Done!</strong> Your CRM data will now flow to 5000+ apps via Zapier.`,
      calendly: `<strong>Step 1:</strong> Log in to <a href="https://calendly.com/integrations" target="_blank">Calendly Integrations</a><br><strong>Step 2:</strong> Find "Webhooks" under Developer section<br><strong>Step 3:</strong> Add the webhook URL above<br><strong>Step 4:</strong> Select "invitee.created" event<br><strong>Done!</strong> New bookings will automatically create leads in your CRM.`,
      razorpay: `<strong>Step 1:</strong> Go to <a href="https://dashboard.razorpay.com/app/webhooks" target="_blank">Razorpay Dashboard → Webhooks</a><br><strong>Step 2:</strong> Click "Add New Webhook"<br><strong>Step 3:</strong> Paste the webhook URL above<br><strong>Step 4:</strong> Select events: payment.captured, order.paid<br><strong>Step 5:</strong> Enter a secret (any string) and save<br><strong>Done!</strong> Payments will auto-sync and update lead status.`,
      stripe: `<strong>Step 1:</strong> Go to <a href="https://dashboard.stripe.com/webhooks" target="_blank">Stripe Dashboard → Webhooks</a><br><strong>Step 2:</strong> Click "Add Endpoint"<br><strong>Step 3:</strong> Paste the webhook URL above<br><strong>Step 4:</strong> Select events: checkout.session.completed, invoice.paid<br><strong>Done!</strong> Stripe payments will create/update leads automatically.`,
      meta_ads: `<strong>Step 1:</strong> Go to <a href="https://developers.facebook.com/apps/" target="_blank">Facebook Developers</a><br><strong>Step 2:</strong> Select your app → Products → Webhooks<br><strong>Step 3:</strong> Subscribe to "leadgen" object<br><strong>Step 4:</strong> Paste the webhook URL above<br><strong>Done!</strong> Meta Lead Ads will auto-capture into your CRM.`,
      google_sheets: `<strong>Step 1:</strong> Create a Google Sheet and share as Editor<br><strong>Step 2:</strong> Go to Extensions → Apps Script<br><strong>Step 3:</strong> Paste the webhook URL as a fetch call<br><strong>Done!</strong> New leads will auto-append to your sheet.`,
      api_access: `<strong>Step 1:</strong> Generate an API Key below<br><strong>Step 2:</strong> Use the key in your requests:<br><div class="int-code-block">curl -H "Authorization: Bearer YOUR_API_KEY" ${window.location.origin}/api/leads</div><strong>Step 3:</strong> Full CRUD access to leads, contacts, campaigns<br><strong>Done!</strong> Build custom integrations on top of the CRM.`,
    };
    return instructions[p.id] || `<strong>Step 1:</strong> Visit the official ${p.name} API documentation<br><strong>Step 2:</strong> Find the Webhooks / API Keys section<br><strong>Step 3:</strong> Add the webhook URL or API credentials shown here<br><strong>Done!</strong> ${p.name} will be connected to your CRM.`;
  },

  getWorkerUrl() { return 'https://wa-crm.11avatardigitalhub.workers.dev'; },

  // ==================== ACTIONS ====================
  async saveApiCredentials(platformId) {
    const key = document.getElementById('intApiKey')?.value?.trim();
    if (!key) return showToast('Enter a valid key!', 'warning');
    const data = { apiKey: key, connectedAt: new Date().toISOString() };
    
    if (platformId === 'twilio') {
      const secret = document.getElementById('intApiSecret')?.value?.trim();
      if (secret) data.authToken = secret;
    }
    if (platformId === 'api_access') {
      const name = document.getElementById('intApiName')?.value?.trim() || 'Default';
      const newKey = { name, key, createdAt: new Date().toISOString() };
      const keyDoc = await db.collection('settings').doc('api_keys').get();
      const keys = keyDoc.exists ? (keyDoc.data().keys||[]) : [];
      const existingIdx = keys.findIndex(k=>k.key===key);
      if (existingIdx >= 0) keys[existingIdx] = newKey; else keys.push(newKey);
      await db.collection('settings').doc('api_keys').set({ keys }, { merge: true });
    }

    await db.collection('settings').doc('integration_' + platformId).set(data, { merge: true });
    this.connectionStatus[platformId] = true;
    await db.collection('settings').doc('integration_status').set(this.connectionStatus, { merge: true });
    showToast('✅ Credentials saved!', 'success');
    this.render();
  },

  async generateNewApiKey() {
    const key = 'wa_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
    const input = document.getElementById('intApiKey');
    if (input) input.value = key;
    showToast('🔑 New API Key generated! Save it now.', 'info');
  },

  async testConnection(platformId) {
    const resultEl = document.getElementById('connectionTestResult');
    if (!resultEl) return;
    resultEl.innerHTML = '<span class="text-info"><i class="fas fa-spinner fa-spin"></i> Testing...</span>';
    
    try {
      // Simple connectivity test via worker
      const res = await fetch(this.getWorkerUrl() + '/ping');
      if (res.ok) {
        resultEl.innerHTML = '<span class="text-success">✅ Connection successful! Your webhook endpoint is live.</span>';
        if (!this.connectionStatus[platformId]) {
          this.connectionStatus[platformId] = true;
          await db.collection('settings').doc('integration_status').set(this.connectionStatus, { merge: true });
        }
      } else {
        resultEl.innerHTML = '<span class="text-danger">❌ Connection failed. Check your webhook URL.</span>';
      }
    } catch(e) {
      resultEl.innerHTML = '<span class="text-danger">❌ Connection failed: ' + e.message + '</span>';
    }
  },

  async testWebhook(platformId) {
    const resultEl = document.getElementById('webhookTestResult');
    if (!resultEl) return;
    resultEl.innerHTML = '<span class="text-info"><i class="fas fa-spinner fa-spin"></i> Sending test webhook...</span>';
    
    try {
      const res = await fetch(this.getWorkerUrl() + '/' + platformId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true, timestamp: new Date().toISOString(), source: platformId })
      });
      if (res.ok) {
        resultEl.innerHTML = '<span class="text-success">✅ Test webhook received successfully!</span>';
      } else {
        resultEl.innerHTML = '<span class="text-danger">❌ Webhook test failed. HTTP ' + res.status + '</span>';
      }
    } catch(e) {
      resultEl.innerHTML = '<span class="text-danger">❌ Error: ' + e.message + '</span>';
    }
  },

  async disconnect(platformId) {
    if (!confirm('Disconnect this integration?')) return;
    this.connectionStatus[platformId] = false;
    await db.collection('settings').doc('integration_status').set(this.connectionStatus, { merge: true });
    await db.collection('settings').doc('integration_' + platformId).delete().catch(()=>{});
    showToast('Disconnected.', 'info');
    this.render();
  }
};
