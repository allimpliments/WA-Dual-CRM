// js/chatbot.js — World-Class Multi-Provider AI Chatbot Engine for SaaS
const Chatbot = {
  currentTab: 'config',
  provider: 'groq',
  testMessages: [],
  savedConfig: {},

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = '#f8fafc';

    if (this.currentTab === 'test') { await this.renderTestChat(); return; }
    if (this.currentTab === 'flows') { Flows.currentTab = 'myflows'; Flows.render(); return; }
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
    this.savedConfig = config;

    // Load API keys from setup
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
              <div id="keywordList" style="margin-bottom:10px;">${(config.keywords||[]).map((kw,i)=>`<span class="bot-keyword-tag">${kw.keyword}: ${kw.reply.substring(0,30)}... <button onclick="Chatbot.removeKeyword(${i})">×</button></span>`).join('')}</div>
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

  selectProvider(id) { this.savedConfig.provider = id; this.render(); },
  
  addKeyword() {
    const kw = document.getElementById('newKeyword')?.value?.trim();
    const reply = document.getElementById('newKeywordReply')?.value?.trim();
    if (!kw || !reply) return showToast('Enter both keyword and reply!', 'warning');
    if (!this.savedConfig.keywords) this.savedConfig.keywords = [];
    this.savedConfig.keywords.push({ keyword: kw.toLowerCase(), reply });
    this.render();
  },

  removeKeyword(index) { this.savedConfig.keywords.splice(index, 1); this.render(); },

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
  async getAIReply(incomingMsg, configOverride = null) {
    const config = configOverride || this.savedConfig;
    
    // Load config if not provided
    if (!config.apiKey) {
      try {
        const doc = await db.collection('settings').doc('chatbot').get();
        if (doc.exists) Object.assign(config, doc.data());
      } catch(e) {}
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
    if (!config.fallbackEnabled) return config.keywordFallback ? 'Thanks for your message! 🙏' : '';

    // Get API key based on provider
    let apiKey = config.apiKey;
    if (!apiKey) {
      try {
        const keyDoc = await db.collection('settings').doc(config.provider === 'openai' ? 'openai' : 'groq_ai').get();
        if (keyDoc.exists) apiKey = keyDoc.data().apiKey || '';
      } catch(e) {}
    }
    if (!apiKey) return 'AI is not configured. Please set up an API key.';

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
          method: 'POST', headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: config.model || 'gpt-4o', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: incomingMsg }], max_tokens: config.maxTokens || 150, temperature: config.temperature || 0.7 })
        });
        const d = await res.json();
        return d.choices?.[0]?.message?.content || 'Sorry, I could not process that.';
      } else {
        // Default: Groq
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST', headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: config.model || 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: incomingMsg }], max_tokens: config.maxTokens || 150, temperature: config.temperature || 0.7 })
        });
        const d = await res.json();
        return d.choices?.[0]?.message?.content || 'Sorry, I could not process that.';
      }
    } catch(e) { return 'AI service temporarily unavailable. Please try again later.'; }
  },

  // ==================== TRAINING DATA ====================
  async renderTraining() {
    let trainingData = [];
    try {
      const snap = await db.collection('botReplies').orderBy('createdAt','desc').limit(50).get();
      trainingData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) {}
    let html = `
      <div class="bot-wrap">
        <div class="d-flex align-items-center mb-3"><button class="bot-btn bot-btn-outline me-2" onclick="Chatbot.currentTab='config';Chatbot.render();"><i class="fas fa-arrow-left"></i> Back</button><h4 style="font-weight:800;margin:0;">📚 Training Data</h4></div>
        <div class="bot-card"><h5>Add Training Example</h5><div class="row g-2"><div class="col-md-5"><input type="text" id="trainQuestion" class="bot-input" placeholder="User question/message"></div><div class="col-md-5"><input type="text" id="trainAnswer" class="bot-input" placeholder="Expected AI response"></div><div class="col-md-2"><button class="bot-btn bot-btn-primary w-100" onclick="Chatbot.addTraining()"><i class="fas fa-plus"></i> Add</button></div></div></div>
        <div class="bot-card"><h5>Training Examples (${trainingData.length})</h5>${trainingData.length===0?'<p class="text-muted">No training data yet.</p>':trainingData.map(t=>`<div class="dash-recent-item"><div class="flex-grow-1"><strong>Q:</strong> ${t.question}<br><strong>A:</strong> ${t.answer}</div><button class="bot-btn bot-btn-danger btn-sm" onclick="Chatbot.deleteTraining('${t.id}')"><i class="fas fa-trash"></i></button></div>`).join('')}</div>
      </div>`;
    contentArea.innerHTML = html;
  },

  async addTraining() {
    const q = document.getElementById('trainQuestion')?.value?.trim();
    const a = document.getElementById('trainAnswer')?.value?.trim();
    if (!q || !a) return showToast('Enter both question and answer!', 'warning');
    await db.collection('botReplies').add({ question: q, answer: a, clientId: getCurrentClientId(), createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    showToast('✅ Training data added!', 'success'); this.render();
  },

  async deleteTraining(id) { if (!confirm('Delete?')) return; await db.collection('botReplies').doc(id).delete(); this.render(); },

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
