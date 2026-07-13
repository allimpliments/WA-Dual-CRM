// js/chatbot.js — World-Class Multi-Provider AI Chatbot Engine for SaaS
// FIXED: addKeyword(), addTraining(), removeKeyword() — No page refresh, just UI update
// FIXED: Training Data add/delete working properly

// ✅ Ensure helper functions exist
if (typeof showToast !== 'function') {
  window.showToast = function(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; padding: 12px 24px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#6366f1'};
      color: #fff; border-radius: 8px; z-index: 99999; font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 400px;
      animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };
}

if (typeof getCurrentClientId !== 'function') {
  window.getCurrentClientId = function() {
    return window.currentUser?.clientId || null;
  };
}

if (typeof shouldFilterByClient !== 'function') {
  window.shouldFilterByClient = function() {
    const role = window.currentUser?.role;
    return role !== 'platform_owner' && role !== 'platform_super_admin' && role !== 'admin';
  };
}

const Chatbot = {
  currentTab: 'config',
  provider: 'groq',
  testMessages: [],
  savedConfig: {},

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = '#f8fafc';

    if (this.currentTab === 'test') { await this.renderTestChat(); return; }
    if (this.currentTab === 'flows') { 
      if (typeof Flows !== 'undefined') {
        Flows.currentTab = 'myflows'; 
        Flows.render(); 
      }
      return; 
    }
    if (this.currentTab === 'training') { await this.renderTraining(); return; }
    if (this.currentTab === 'analytics') { await this.renderAnalytics(); return; }

    await this.renderConfig();
  },

  // ==================== CONFIG PANEL ====================
  async renderConfig() {
    // Load saved config
    let config = {
      provider: 'groq', enabled: false, apiKey: '', model: 'llama-3.3-70b-versatile',
      businessName: '', businessInfo: '', instructions: '', tone: 'professional',
      fallbackEnabled: true, keywordFallback: true, maxTokens: 150, temperature: 0.7,
      workingHours: { enabled: false, start: '09:00', end: '18:00', message: 'We are currently offline. We will get back to you during business hours.' },
      greetingMessage: 'Hello! 👋 How can I help you today?',
      keywords: []
    };
    try {
      const doc = await db.collection('settings').doc('chatbot').get();
      if (doc.exists) config = { ...config, ...doc.data() };
    } catch(e) {}
    
    // ✅ FIX: API key load karke config mein save karo
    try {
      const groqDoc = await db.collection('settings').doc('groq_ai').get();
      if (groqDoc.exists) {
        const groqKey = groqDoc.data().apiKey || '';
        if (groqKey && config.provider === 'groq') {
          config.apiKey = groqKey;
        }
      }
      const openaiDoc = await db.collection('settings').doc('openai').get();
      if (openaiDoc.exists) {
        const openaiKey = openaiDoc.data().apiKey || '';
        if (openaiKey && config.provider === 'openai') {
          config.apiKey = openaiKey;
        }
      }
    } catch(e) {}
    
    this.savedConfig = config;

    // Load API keys for display
    let groqKey = '', openaiKey = '', claudeKey = '', geminiKey = '';
    try {
      const groqDoc = await db.collection('settings').doc('groq_ai').get();
      if (groqDoc.exists) groqKey = groqDoc.data().apiKey || '';
      const openaiDoc = await db.collection('settings').doc('openai').get();
      if (openaiDoc.exists) openaiKey = openaiDoc.data().apiKey || '';
    } catch(e) {}

    const providerModels = {
      groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
      openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
      claude: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
      gemini: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro']
    };

    let html = `
      <style>
        .bot-wrap { max-width: 1300px; margin: 0 auto; }
        .bot-header { background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 20px; padding: 28px 32px; margin-bottom: 24px; color: #fff; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .bot-header h4 { margin: 0; font-weight: 800; font-size: 22px; }
        .bot-tabs { display: flex; gap: 4px; margin-bottom: 20px; background: #fff; border-radius: 16px; padding: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; }
        .bot-tab { padding: 10px 20px; border-radius: 12px; font-size: 13px; cursor: pointer; font-weight: 500; transition: 0.2s; color: #64748b; display: flex; align-items: center; gap: 6px; border: none; background: transparent; }
        .bot-tab:hover { background: #f1f5f9; color: #0f172a; }
        .bot-tab.active { background: #6366f1; color: #fff; }
        .bot-card { background: #fff; border-radius: 16px; padding: 24px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; }
        .bot-card h5 { font-weight: 700; font-size: 15px; color: #0f172a; margin-bottom: 16px; }
        .bot-input { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13px; outline: none; margin-bottom: 10px; background: #fff; }
        .bot-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .bot-textarea { resize: vertical; min-height: 80px; }
        .bot-label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; display: block; }
        .bot-btn { padding: 8px 18px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .bot-btn-primary { background: #6366f1; color: #fff; }
        .bot-btn-primary:hover { background: #4f46e5; }
        .bot-btn-success { background: #10b981; color: #fff; }
        .bot-btn-success:hover { background: #059669; }
        .bot-btn-outline { background: #fff; color: #6366f1; border: 1px solid #6366f1; }
        .bot-btn-outline:hover { background: #eef2ff; }
        .bot-btn-danger { background: #ef4444; color: #fff; }
        .bot-btn-danger:hover { background: #dc2626; }
        .bot-provider-card { border: 2px solid #e2e8f0; border-radius: 12px; padding: 16px; cursor: pointer; transition: 0.2s; text-align: center; }
        .bot-provider-card:hover { border-color: #6366f1; }
        .bot-provider-card.active { border-color: #6366f1; background: #eef2ff; }
        .bot-provider-card .icon { font-size: 32px; margin-bottom: 8px; }
        .bot-keyword-tag { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 11px; background: #eef2ff; color: #6366f1; margin: 2px; }
        .bot-keyword-tag button { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 14px; padding: 0; line-height: 1; }
        .bot-check { display: flex; align-items: center; gap: 8px; font-size: 13px; margin-bottom: 8px; }
        .bot-test-chat { max-height: 400px; overflow-y: auto; padding: 12px; background: #f8fafc; border-radius: 12px; margin-bottom: 12px; }
        .bot-msg { display: flex; gap: 8px; margin-bottom: 10px; }
        .bot-msg.user { justify-content: flex-end; }
        .bot-msg-bubble { max-width: 75%; padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.5; }
        .bot-msg.user .bot-msg-bubble { background: #6366f1; color: #fff; border-radius: 12px 12px 0 12px; }
        .bot-msg.bot .bot-msg-bubble { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px 12px 12px 0; }
        .bot-preset-btn { padding: 6px 12px; border-radius: 20px; font-size: 10px; cursor: pointer; border: 1px solid #6366f1; background: #eef2ff; color: #6366f1; margin: 2px; transition: 0.2s; }
        .bot-preset-btn:hover { background: #6366f1; color: #fff; }
        .bot-preset-btn.active { background: #6366f1; color: #fff; }
        .dash-recent-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
        .dash-recent-item:last-child { border-bottom: none; }
        @media (max-width: 768px) { .bot-tabs { overflow-x: auto; flex-wrap: nowrap; } }
      </style>
      <div class="bot-wrap">
        <div class="bot-header">
          <div><h4><i class="fas fa-robot me-2"></i>AI Chatbot Configuration</h4><p>Configure AI-powered auto-replies for WhatsApp & live chat</p></div>
          <div><span class="bot-badge" style="background:${config.enabled?'#ecfdf5':'#fef3c7'};color:${config.enabled?'#10b981':'#92400e'};padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;">${config.enabled?'● Active':'○ Inactive'}</span></div>
        </div>

        <div class="bot-tabs">
          <button class="bot-tab ${this.currentTab==='config'?'active':''}" onclick="Chatbot.currentTab='config';Chatbot.render();"><i class="fas fa-cog"></i> Configuration</button>
          <button class="bot-tab ${this.currentTab==='test'?'active':''}" onclick="Chatbot.currentTab='test';Chatbot.render();"><i class="fas fa-comment-dots"></i> Test Chat</button>
          <button class="bot-tab ${this.currentTab==='training'?'active':''}" onclick="Chatbot.currentTab='training';Chatbot.render();"><i class="fas fa-database"></i> Training Data</button>
          <button class="bot-tab ${this.currentTab==='flows'?'active':''}" onclick="Chatbot.currentTab='flows';Chatbot.render();"><i class="fas fa-sitemap"></i> Flows</button>
          <button class="bot-tab ${this.currentTab==='analytics'?'active':''}" onclick="Chatbot.currentTab='analytics';Chatbot.render();"><i class="fas fa-chart-bar"></i> Analytics</button>
        </div>

        <div class="row g-4">
          <div class="col-lg-8">
            <!-- Provider Selection -->
            <div class="bot-card">
              <h5><i class="fas fa-brain me-2"></i>AI Provider</h5>
              <div class="row g-3">
                ${[
                  { id:'groq', name:'Groq', icon:'fa-bolt', color:'#f59e0b', desc:'Ultra-fast inference • Free tier available', connected: !!groqKey },
                  { id:'openai', name:'OpenAI (ChatGPT)', icon:'fa-brain', color:'#10b981', desc:'GPT-4o & GPT-3.5 • Most powerful', connected: !!openaiKey },
                  { id:'claude', name:'Anthropic Claude', icon:'fa-robot', color:'#8b5cf6', desc:'Safe & reliable • Great for business', connected: false },
                  { id:'gemini', name:'Google Gemini', icon:'fa-google', color:'#4285F4', desc:'Multimodal AI • Google ecosystem', connected: false }
                ].map(p => `
                  <div class="col-6 col-md-3">
                    <div class="bot-provider-card ${config.provider===p.id?'active':''}" onclick="Chatbot.selectProvider('${p.id}')">
                      <div class="icon"><i class="fas ${p.icon}" style="color:${p.color};"></i></div>
                      <div style="font-weight:700;font-size:14px;">${p.name}</div>
                      <div style="font-size:10px;color:#64748b;">${p.desc}</div>
                      <span class="bot-badge" style="background:${p.connected?'#ecfdf5':'#f1f5f9'};color:${p.connected?'#10b981':'#94a3b8'};font-size:9px;margin-top:4px;display:inline-block;padding:2px 8px;border-radius:10px;">${p.connected?'Connected':'Setup Required'}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
              <div class="row g-2 mt-3">
                <div class="col-md-6"><label class="bot-label">Model</label><select id="botModel" class="bot-input">${(providerModels[config.provider]||providerModels.groq).map(m=>`<option ${config.model===m?'selected':''}>${m}</option>`).join('')}</select></div>
                <div class="col-md-3"><label class="bot-label">Temperature</label><input type="number" id="botTemp" class="bot-input" value="${config.temperature}" step="0.1" min="0" max="2"></div>
                <div class="col-md-3"><label class="bot-label">Max Tokens</label><input type="number" id="botMaxTokens" class="bot-input" value="${config.maxTokens}" min="50" max="2000"></div>
              </div>
            </div>

            <!-- Business Instructions (AI Fallback) -->
            <div class="bot-card">
              <h5><i class="fas fa-building me-2"></i>Business Instructions (AI Fallback)</h5>
              <p class="text-muted small">These instructions teach the AI about your business. When no keyword matches, AI uses this to generate relevant responses.</p>
              
              <!-- ✅ PRESET BUTTONS — Quick fill for common businesses -->
              <div class="mb-3">
                <small class="text-muted d-block mb-1">Quick Fill Presets:</small>
                <button class="bot-preset-btn" onclick="Chatbot.fillPreset('digital_marketing')">📱 Digital Marketing Agency</button>
                <button class="bot-preset-btn" onclick="Chatbot.fillPreset('real_estate')">🏠 Real Estate</button>
                <button class="bot-preset-btn" onclick="Chatbot.fillPreset('healthcare')">🏥 Healthcare</button>
                <button class="bot-preset-btn" onclick="Chatbot.fillPreset('education')">📚 Education</button>
                <button class="bot-preset-btn" onclick="Chatbot.fillPreset('ecommerce')">🛒 E-Commerce</button>
                <button class="bot-preset-btn" onclick="Chatbot.fillPreset('custom')">✏️ Custom</button>
              </div>
              
              <div class="row g-2">
                <div class="col-md-6"><label class="bot-label">Business Name</label><input type="text" id="botBizName" class="bot-input" value="${config.businessName||''}" placeholder="e.g. 11 Avatar Digital Hub"></div>
                <div class="col-md-6"><label class="bot-label">Response Tone</label><select id="botTone" class="bot-input"><option value="professional" ${config.tone==='professional'?'selected':''}>Professional</option><option value="friendly" ${config.tone==='friendly'?'selected':''}>Friendly</option><option value="casual" ${config.tone==='casual'?'selected':''}>Casual</option><option value="formal" ${config.tone==='formal'?'selected':''}>Formal</option></select></div>
                <div class="col-12"><label class="bot-label">Business Description & Services</label><textarea id="botBizInfo" class="bot-input bot-textarea" placeholder="Describe your business, products, services, pricing, and any important information...">${config.businessInfo||''}</textarea></div>
                <div class="col-12"><label class="bot-label">Custom AI Instructions (System Prompt)</label><textarea id="botInstructions" class="bot-input bot-textarea" placeholder="Specific instructions for the AI... e.g. 'Always greet with Namaste. Offer 10% discount code WELCOME10. Never discuss competitor pricing.'">${config.instructions||''}</textarea></div>
              </div>
            </div>

            <!-- Keywords -->
            <div class="bot-card">
              <h5><i class="fas fa-key me-2"></i>Keyword Auto-Replies</h5>
              <div id="keywordList" style="margin-bottom:10px;">${(config.keywords||[]).length === 0 ? '<span class="text-muted small">No keywords added. Add keywords below for instant auto-replies.</span>' : config.keywords.map((kw,i)=>`<span class="bot-keyword-tag">${kw.keyword}: ${kw.reply.substring(0,30)}... <button onclick="Chatbot.removeKeyword(${i})">×</button></span>`).join('')}</div>
              <div class="row g-2">
                <div class="col-md-4"><input type="text" id="newKeyword" class="bot-input" placeholder="Keyword (e.g. price)"></div>
                <div class="col-md-6"><input type="text" id="newKeywordReply" class="bot-input" placeholder="Auto-reply message"></div>
                <div class="col-md-2"><button class="bot-btn bot-btn-primary w-100" onclick="Chatbot.addKeyword()"><i class="fas fa-plus"></i> Add</button></div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <!-- Settings -->
            <div class="bot-card">
              <h5><i class="fas fa-sliders-h me-2"></i>Settings</h5>
              <label class="bot-check"><input type="checkbox" id="botEnabled" ${config.enabled?'checked':''}> Enable AI Chatbot</label>
              <label class="bot-check"><input type="checkbox" id="botFallback" ${config.fallbackEnabled?'checked':''}> Enable AI Fallback (Use AI when no keyword matches)</label>
              <label class="bot-check"><input type="checkbox" id="botKeywordFallback" ${config.keywordFallback?'checked':''}> Enable Keyword Matching</label>
              <hr>
              <label class="bot-label">Greeting Message</label>
              <input type="text" id="botGreeting" class="bot-input" value="${config.greetingMessage||''}">
              <hr>
              <label class="bot-check"><input type="checkbox" id="botWorkingHours" ${config.workingHours?.enabled?'checked':''} onchange="document.getElementById('workingHoursRow').style.display=this.checked?'flex':'none'"> Enable Working Hours</label>
              <div id="workingHoursRow" style="display:${config.workingHours?.enabled?'flex':'none'};gap:8px;margin-top:8px;">
                <input type="time" id="botStartTime" class="bot-input" value="${config.workingHours?.start||'09:00'}" style="width:48%;">
                <input type="time" id="botEndTime" class="bot-input" value="${config.workingHours?.end||'18:00'}" style="width:48%;">
              </div>
              <input type="text" id="botOfflineMsg" class="bot-input mt-2" value="${config.workingHours?.message||''}" placeholder="Offline message">
            </div>

            <button class="bot-btn bot-btn-success w-100" style="padding:14px;font-size:14px;" onclick="Chatbot.saveConfig()"><i class="fas fa-save"></i> Save Configuration</button>
            <button class="bot-btn bot-btn-outline w-100 mt-2" onclick="Chatbot.currentTab='test';Chatbot.render();"><i class="fas fa-comment-dots"></i> Test Chatbot</button>
            <button class="bot-btn bot-btn-outline w-100 mt-2" onclick="Chatbot.currentTab='flows';Chatbot.render();"><i class="fas fa-sitemap"></i> Manage Flows</button>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  // ==================== PRESET FILL ====================
  fillPreset(type) {
    const presets = {
      digital_marketing: {
        name: '11 Avatar Digital Hub',
        info: `11 Avatar Digital Hub is a full-service digital marketing agency and SaaS platform. We offer:

1. Business Automation (₹4,999) - Auto-replies, WhatsApp/Email funnel, CRM lite dashboard, Lead tagging
2. Website Design (₹5,999-₹14,999) - Mobile-responsive, SEO-ready, E-commerce
3. Google & YouTube Ads - SEM (₹4,999) - Campaign setup, Keyword strategy, A/B testing
4. Social Media Marketing - SMM (₹4,999) - FB/Insta ads, Retargeting, Pixel setup
5. Social Media Optimization - SMO (₹4,999) - Profile setup, Bio, CTA, 12 posts, 2 reels/week
6. Bulk WhatsApp Marketing (₹1,999) - 10,000 messages/month, Templates, Scheduling
7. Google My Business - GMB (₹2,999) - Setup, Weekly posts, Review management
8. SEO (₹9,999) - 10 keywords, On-page, Off-page, 2 blogs/week, Technical SEO

Our SaaS CRM offers: WhatsApp Cloud API, Multi-agent, Lead Management, Campaign Builder, AI Chatbot, Templates, Appointments, Analytics.
Contact: +91 74897 71499`,
        instructions: `You are a helpful support agent for 11 Avatar Digital Hub, a WhatsApp CRM platform and digital marketing agency.

Rules:
1. Always greet with "Namaste! 👋 Main 11 Avatar Digital Hub ka AI assistant hoon."
2. Keep replies friendly, short (2-3 sentences max), and in Hinglish.
3. For pricing questions, mention the starting price and ask for their requirement.
4. For service inquiries, ask what business they have and what they need.
5. Always end with a question to engage the user.`
      },
      real_estate: {
        name: '[Your Real Estate Company]',
        info: `[Company Name] is a real estate agency specializing in residential and commercial properties. We help clients buy, sell, and rent properties in [City/Region].

Services:
- Property Sales (Residential & Commercial)
- Rental Management
- Property Valuation
- Home Loans Assistance
- Legal Documentation
- Property Inspection

Contact: [Phone Number]
Website: [Website URL]`,
        instructions: `You are a helpful real estate agent assistant for [Company Name].

Rules:
1. Always greet politely and ask about their property requirements.
2. Ask about: Budget, Location preference, Property type (1BHK/2BHK/Villa/Commercial), Ready to move or under construction.
3. Offer to schedule a site visit.
4. Keep responses short and helpful.
5. Always end with a question.`
      },
      healthcare: {
        name: '[Your Clinic/Hospital Name]',
        info: `[Clinic Name] is a healthcare facility providing quality medical care in [City]. We specialize in [Specialization - e.g., General Medicine, Dental, Cardiology].

Services:
- OPD Consultation (₹[Fee])
- Diagnostics & Lab Tests
- Health Checkup Packages
- Online Consultation
- Emergency Services

Timings: [Timings]
Contact: [Phone Number]
Address: [Address]`,
        instructions: `You are a helpful medical assistant for [Clinic Name].

Rules:
1. Ask about symptoms and suggest appropriate doctor/department.
2. Help with appointment booking — ask preferred date and time.
3. Mention consultation fees when asked.
4. For emergencies, provide contact number immediately.
5. Never provide medical advice — always suggest consulting a doctor.`
      },
      education: {
        name: '[Your Institute Name]',
        info: `[Institute Name] is an educational institution offering courses in [Subjects]. We provide quality education for students from [Level - e.g., School, College, Professional].

Courses:
- [Course 1] (₹[Fee])
- [Course 2] (₹[Fee])
- Online & Offline batches available
- Free demo class available

Contact: [Phone Number]
Website: [Website URL]`,
        instructions: `You are a helpful education counselor for [Institute Name].

Rules:
1. Ask about student's interest and educational background.
2. Suggest relevant courses based on their goals.
3. Offer free demo class scheduling.
4. Mention fees, duration, and batch timings when asked.
5. Keep tone encouraging and supportive.`
      },
      ecommerce: {
        name: '[Your Store Name]',
        info: `[Store Name] is an online store selling [Product Categories]. We offer quality products at competitive prices with fast delivery across India.

Product Categories:
- [Category 1] (Starting ₹[Price])
- [Category 2] (Starting ₹[Price])
- Free Delivery on orders above ₹[Amount]
- Easy Returns & Exchange
- COD Available

Contact: [Phone Number]
Website: [Website URL]`,
        instructions: `You are a helpful support agent for [Store Name].

Rules:
1. Help customers find products — ask what they're looking for.
2. Assist with order tracking — ask for order ID.
3. For complaints/issues, offer refund/replacement options.
4. Keep tone friendly and helpful.
5. Always thank them for shopping with you.`
      },
      custom: {
        name: '',
        info: '',
        instructions: ''
      }
    };

    const preset = presets[type];
    if (!preset) return;
    
    if (type === 'custom') {
      // Clear all fields for custom input
      const nameEl = document.getElementById('botBizName');
      const infoEl = document.getElementById('botBizInfo');
      const instrEl = document.getElementById('botInstructions');
      if (nameEl) nameEl.value = '';
      if (infoEl) infoEl.value = '';
      if (instrEl) instrEl.value = '';
      showToast('✏️ Fill your custom business details', 'info');
      return;
    }

    // Fill the form with preset data
    const nameEl = document.getElementById('botBizName');
    const infoEl = document.getElementById('botBizInfo');
    const instrEl = document.getElementById('botInstructions');
    if (nameEl) nameEl.value = preset.name;
    if (infoEl) infoEl.value = preset.info;
    if (instrEl) instrEl.value = preset.instructions;
    
    // Highlight active preset
    document.querySelectorAll('.bot-preset-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.bot-preset-btn[onclick*="${type}"]`)?.classList.add('active');
    
    showToast('✅ Preset filled! Update details as needed and Save.', 'success');
  },

  selectProvider(id) { this.savedConfig.provider = id; this.render(); },
  
  // ✅ FIXED: addKeyword — No page refresh, just UI update
  addKeyword() {
    const kw = document.getElementById('newKeyword')?.value?.trim();
    const reply = document.getElementById('newKeywordReply')?.value?.trim();
    if (!kw || !reply) return showToast('Enter both keyword and reply!', 'warning');
    if (!this.savedConfig.keywords) this.savedConfig.keywords = [];
    this.savedConfig.keywords.push({ keyword: kw.toLowerCase(), reply });
    
    // Clear input fields
    const kwEl = document.getElementById('newKeyword');
    const replyEl = document.getElementById('newKeywordReply');
    if (kwEl) kwEl.value = '';
    if (replyEl) replyEl.value = '';
    
    // Update just the keyword list display
    const keywordList = document.getElementById('keywordList');
    if (keywordList) {
      keywordList.innerHTML = this.savedConfig.keywords.length === 0 
        ? '<span class="text-muted small">No keywords added. Add keywords below for instant auto-replies.</span>'
        : this.savedConfig.keywords.map((kw, i) => 
            `<span class="bot-keyword-tag">${kw.keyword}: ${kw.reply.substring(0,30)}... <button onclick="Chatbot.removeKeyword(${i})">×</button></span>`
          ).join('');
    }
    
    showToast('✅ Keyword added! Save configuration to persist.', 'success');
  },

  // ✅ FIXED: removeKeyword — No page refresh, just UI update
  removeKeyword(index) { 
    this.savedConfig.keywords.splice(index, 1);
    
    // Update just the keyword list display
    const keywordList = document.getElementById('keywordList');
    if (keywordList) {
      keywordList.innerHTML = this.savedConfig.keywords.length === 0 
        ? '<span class="text-muted small">No keywords added. Add keywords below for instant auto-replies.</span>'
        : this.savedConfig.keywords.map((kw, i) => 
            `<span class="bot-keyword-tag">${kw.keyword}: ${kw.reply.substring(0,30)}... <button onclick="Chatbot.removeKeyword(${i})">×</button></span>`
          ).join('');
    }
  },

  async saveConfig() {
    const data = {
      provider: this.savedConfig.provider,
      enabled: document.getElementById('botEnabled')?.checked || false,
      model: document.getElementById('botModel')?.value || 'llama-3.3-70b-versatile',
      temperature: parseFloat(document.getElementById('botTemp')?.value) || 0.7,
      maxTokens: parseInt(document.getElementById('botMaxTokens')?.value) || 150,
      fallbackEnabled: document.getElementById('botFallback')?.checked || false,
      keywordFallback: document.getElementById('botKeywordFallback')?.checked || false,
      businessName: document.getElementById('botBizName')?.value?.trim() || '',
      businessInfo: document.getElementById('botBizInfo')?.value?.trim() || '',
      instructions: document.getElementById('botInstructions')?.value?.trim() || '',
      tone: document.getElementById('botTone')?.value || 'professional',
      greetingMessage: document.getElementById('botGreeting')?.value?.trim() || '',
      workingHours: {
        enabled: document.getElementById('botWorkingHours')?.checked || false,
        start: document.getElementById('botStartTime')?.value || '09:00',
        end: document.getElementById('botEndTime')?.value || '18:00',
        message: document.getElementById('botOfflineMsg')?.value?.trim() || 'We are currently offline.'
      },
      keywords: this.savedConfig.keywords || [],
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    try {
      await db.collection('settings').doc('chatbot').set(data);
      this.savedConfig = data;
      showToast('✅ Chatbot configuration saved!', 'success');
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
  },

  // ==================== TEST CHAT ====================
  async renderTestChat() {
    let html = `
      <div class="bot-wrap">
        <div class="d-flex align-items-center mb-3"><button class="bot-btn bot-btn-outline me-2" onclick="Chatbot.currentTab='config';Chatbot.render();"><i class="fas fa-arrow-left"></i> Back</button><h4 style="font-weight:800;margin:0;">🧪 Test Chatbot</h4></div>
        <div class="bot-card">
          <div class="bot-test-chat" id="testChatWindow">
            <div class="bot-msg bot"><div class="bot-msg-bubble">👋 Hi! I'm your AI assistant. Type a message to test how I respond.</div></div>
          </div>
          <div class="d-flex gap-2">
            <input type="text" id="testChatInput" class="bot-input" placeholder="Type a test message..." onkeydown="if(event.key==='Enter')Chatbot.sendTestMessage()">
            <button class="bot-btn bot-btn-primary" onclick="Chatbot.sendTestMessage()"><i class="fas fa-paper-plane"></i></button>
          </div>
        </div>
      </div>`;
    contentArea.innerHTML = html;
  },

  async sendTestMessage() {
    const input = document.getElementById('testChatInput');
    const msg = input?.value?.trim();
    if (!msg) return;
    const win = document.getElementById('testChatWindow');
    if (win) { win.innerHTML += `<div class="bot-msg user"><div class="bot-msg-bubble">${msg}</div></div>`; win.scrollTop = win.scrollHeight; }
    if (input) input.value = '';
    
    const reply = await this.getAIReply(msg, this.savedConfig);
    if (win) { win.innerHTML += `<div class="bot-msg bot"><div class="bot-msg-bubble">${reply}</div></div>`; win.scrollTop = win.scrollHeight; }
  },

  // ==================== AI ENGINE (Used by Chats module) ====================
  // ✅ FIXED: Properly load API key from provider settings
  async getAIReply(incomingMsg, configOverride = null) {
    const config = configOverride || this.savedConfig;
    
    // Load config if not provided or apiKey missing
    if (!config.apiKey || !config.enabled) {
      try {
        const doc = await db.collection('settings').doc('chatbot').get();
        if (doc.exists) {
          const data = doc.data();
          // Merge but don't override apiKey if we're about to load it
          Object.assign(config, data);
        }
      } catch(e) {
        console.error('Error loading chatbot config:', e);
      }
    }

    // ✅ FIX: If API key still not set, try to load from provider settings
    if (!config.apiKey) {
      try {
        const providerKey = config.provider === 'openai' ? 'openai' : 'groq_ai';
        const keyDoc = await db.collection('settings').doc(providerKey).get();
        if (keyDoc.exists) {
          const keyData = keyDoc.data();
          config.apiKey = keyData.apiKey || '';
          // Also save it back to savedConfig for future use
          this.savedConfig.apiKey = config.apiKey;
        }
      } catch(e) {
        console.error('Error loading API key:', e);
      }
    }

    // Check if enabled
    if (!config.enabled) return '';

    // 1. Keyword matching (if enabled)
    if (config.keywordFallback && config.keywords?.length > 0) {
      const msgLower = incomingMsg.toLowerCase();
      for (const kw of config.keywords) {
        if (msgLower.includes(kw.keyword.toLowerCase())) return kw.reply;
      }
    }

    // 2. AI Fallback (if enabled)
    if (!config.fallbackEnabled) {
      return config.keywordFallback ? 'Thanks for your message! 🙏' : '';
    }

    // Final check: do we have API key?
    if (!config.apiKey) {
      return 'AI is not configured. Please set up an API key in settings.';
    }

    // Build system prompt from business instructions
    let systemPrompt = `You are a helpful AI assistant`;
    if (config.businessName) systemPrompt += ` for ${config.businessName}`;
    systemPrompt += `. Respond in a ${config.tone} tone. Keep responses under 150 words.`;
    if (config.businessInfo) systemPrompt += `\n\nBusiness Information: ${config.businessInfo}`;
    if (config.instructions) systemPrompt += `\n\nSpecial Instructions: ${config.instructions}`;
    systemPrompt += `\n\nIf asked about pricing, products, services, or business details, use the business information provided. If you don't know something, politely say so and offer to connect them with a human agent.`;

    try {
      if (config.provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST', 
          headers: { 'Authorization': 'Bearer ' + config.apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            model: config.model || 'gpt-4o', 
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: incomingMsg }], 
            max_tokens: config.maxTokens || 150, 
            temperature: config.temperature || 0.7 
          })
        });
        const d = await res.json();
        if (d.error) {
          console.error('OpenAI API Error:', d.error);
          return 'AI service error: ' + (d.error.message || 'Unknown error');
        }
        return d.choices?.[0]?.message?.content || 'Sorry, I could not process that.';
      } else {
        // Default: Groq
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST', 
          headers: { 'Authorization': 'Bearer ' + config.apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            model: config.model || 'llama-3.3-70b-versatile', 
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: incomingMsg }], 
            max_tokens: config.maxTokens || 150, 
            temperature: config.temperature || 0.7 
          })
        });
        const d = await res.json();
        if (d.error) {
          console.error('Groq API Error:', d.error);
          return 'AI service error: ' + (d.error.message || 'Unknown error');
        }
        return d.choices?.[0]?.message?.content || 'Sorry, I could not process that.';
      }
    } catch(e) {
      console.error('AI Error:', e);
      return 'AI service temporarily unavailable. Please try again later.';
    }
  },

  // ==================== TRAINING DATA ====================
  async renderTraining() {
    let trainingData = [];
    try {
      // ✅ FIX: Add client filter for training data
      let query = db.collection('botReplies');
      if (shouldFilterByClient()) {
        const clientId = getCurrentClientId();
        if (clientId) query = query.where('clientId', '==', clientId);
      }
      const snap = await query.orderBy('createdAt','desc').limit(50).get();
      trainingData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) {
      console.error('Error loading training data:', e);
    }
    
    let html = `
      <div class="bot-wrap">
        <div class="d-flex align-items-center mb-3">
          <button class="bot-btn bot-btn-outline me-2" onclick="Chatbot.currentTab='config';Chatbot.render();"><i class="fas fa-arrow-left"></i> Back</button>
          <h4 style="font-weight:800;margin:0;">📚 Training Data</h4>
          <span class="badge bg-info ms-2">${trainingData.length} entries</span>
        </div>
        <div class="bot-card">
          <h5><i class="fas fa-plus-circle me-2"></i>Add Training Example</h5>
          <div class="row g-2">
            <div class="col-md-5">
              <input type="text" id="trainQuestion" class="bot-input" placeholder="User question/message">
            </div>
            <div class="col-md-5">
              <input type="text" id="trainAnswer" class="bot-input" placeholder="Expected AI response">
            </div>
            <div class="col-md-2">
              <button class="bot-btn bot-btn-primary w-100" onclick="Chatbot.addTraining()">
                <i class="fas fa-plus"></i> Add
              </button>
            </div>
          </div>
          <div id="trainingStatus" class="mt-2"></div>
        </div>
        <div class="bot-card" id="trainingListCard">
          <h5><i class="fas fa-list me-2"></i>Training Examples (${trainingData.length})</h5>
          <div id="trainingList">
            ${trainingData.length === 0 ? '<p class="text-muted text-center py-3">No training data yet. Add your first example above!</p>' : 
              trainingData.map(t => `
                <div class="dash-recent-item">
                  <div class="flex-grow-1">
                    <strong>Q:</strong> ${t.question || 'N/A'}<br>
                    <strong>A:</strong> ${t.answer || 'N/A'}
                    ${t.clientId ? `<span class="badge bg-light text-muted ms-1">client:${t.clientId}</span>` : ''}
                  </div>
                  <button class="bot-btn bot-btn-danger btn-sm" onclick="Chatbot.deleteTraining('${t.id}')">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              `).join('')
            }
          </div>
        </div>
      </div>`;
    contentArea.innerHTML = html;
  },

  // ✅ FIXED: addTraining — No page refresh, just UI update
  async addTraining() {
    const qEl = document.getElementById('trainQuestion');
    const aEl = document.getElementById('trainAnswer');
    const statusEl = document.getElementById('trainingStatus');
    
    const q = qEl?.value?.trim();
    const a = aEl?.value?.trim();
    
    if (!q || !a) {
      showToast('⚠️ Enter both question and answer!', 'warning');
      if (statusEl) statusEl.innerHTML = '<span class="text-warning">⚠️ Please enter both question and answer.</span>';
      return;
    }
    
    try {
      if (statusEl) statusEl.innerHTML = '<span class="text-info">⏳ Saving...</span>';
      
      const clientId = getCurrentClientId();
      await db.collection('botReplies').add({ 
        question: q, 
        answer: a, 
        clientId: clientId || null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp() 
      });
      
      // Clear input fields
      if (qEl) qEl.value = '';
      if (aEl) aEl.value = '';
      if (statusEl) statusEl.innerHTML = '<span class="text-success">✅ Training data added!</span>';
      
      showToast('✅ Training data added successfully!', 'success');
      
      // Refresh training data list without full page reload
      await this.refreshTrainingList();
      
    } catch(e) {
      console.error('Error adding training:', e);
      if (statusEl) statusEl.innerHTML = `<span class="text-danger">❌ Error: ${e.message}</span>`;
      showToast('❌ Error: ' + e.message, 'error');
    }
  },

  // ✅ FIXED: Helper method to refresh training list
  async refreshTrainingList() {
    try {
      let query = db.collection('botReplies');
      if (shouldFilterByClient()) {
        const clientId = getCurrentClientId();
        if (clientId) query = query.where('clientId', '==', clientId);
      }
      const snap = await query.orderBy('createdAt','desc').limit(50).get();
      const trainingData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      const trainingListEl = document.getElementById('trainingList');
      const h5El = document.querySelector('#trainingListCard h5');
      
      if (h5El) h5El.innerHTML = `<i class="fas fa-list me-2"></i>Training Examples (${trainingData.length})`;
      
      if (trainingListEl) {
        trainingListEl.innerHTML = trainingData.length === 0 
          ? '<p class="text-muted text-center py-3">No training data yet. Add your first example above!</p>'
          : trainingData.map(t => `
              <div class="dash-recent-item">
                <div class="flex-grow-1">
                  <strong>Q:</strong> ${t.question || 'N/A'}<br>
                  <strong>A:</strong> ${t.answer || 'N/A'}
                  ${t.clientId ? `<span class="badge bg-light text-muted ms-1">client:${t.clientId}</span>` : ''}
                </div>
                <button class="bot-btn bot-btn-danger btn-sm" onclick="Chatbot.deleteTraining('${t.id}')">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            `).join('');
      }
    } catch(e) {
      console.error('Error refreshing training list:', e);
    }
  },

  // ✅ FIXED: deleteTraining — No page refresh
  async deleteTraining(id) { 
    if (!confirm('Delete this training example?')) return; 
    
    try {
      await db.collection('botReplies').doc(id).delete();
      showToast('✅ Training example deleted!', 'success');
      
      // Refresh training data list without full page reload
      await this.refreshTrainingList();
    } catch(e) {
      console.error('Error deleting training:', e);
      showToast('❌ Error: ' + e.message, 'error');
    }
  },

  // ==================== ANALYTICS ====================
  async renderAnalytics() {
    let totalConvos = 0, aiReplies = 0, keywordReplies = 0;
    try {
      let q = db.collection('messages');
      if (shouldFilterByClient()) q = q.where('clientId','==',window.currentUser.clientId);
      const snap = await q.get();
      totalConvos = snap.size;
      aiReplies = snap.docs.filter(d=>d.data().aiReply).length;
      keywordReplies = snap.docs.filter(d=>d.data().keywordReply).length;
    } catch(e) {}
    let html = `
      <div class="bot-wrap">
        <div class="d-flex align-items-center mb-3"><button class="bot-btn bot-btn-outline me-2" onclick="Chatbot.currentTab='config';Chatbot.render();"><i class="fas fa-arrow-left"></i> Back</button><h4 style="font-weight:800;margin:0;">📊 Chatbot Analytics</h4></div>
        <div class="row g-3"><div class="col-4"><div class="bot-card text-center"><div style="font-size:32px;font-weight:800;color:#6366f1;">${totalConvos}</div><div class="bot-label">Total Conversations</div></div></div><div class="col-4"><div class="bot-card text-center"><div style="font-size:32px;font-weight:800;color:#10b981;">${aiReplies}</div><div class="bot-label">AI Replies</div></div></div><div class="col-4"><div class="bot-card text-center"><div style="font-size:32px;font-weight:800;color:#f59e0b;">${keywordReplies}</div><div class="bot-label">Keyword Matches</div></div></div></div>
      </div>`;
    contentArea.innerHTML = html;
  }
};
