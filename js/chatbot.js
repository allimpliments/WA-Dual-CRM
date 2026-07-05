// js/chatbot.js — AI Chatbot with Free Gemini + Groq + OpenAI Support
const Chatbot = {
  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading chatbot...</p>';
    contentArea.style.paddingTop = '60px';

    let botReplies = [];
    let aiSettings = {};
    let flows = [];
    try {
      const snap = await db.collection('botReplies').orderBy('createdAt', 'desc').get();
      botReplies = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const aiDoc = await db.collection('settings').doc('chatbot').get();
      if (aiDoc.exists) aiSettings = aiDoc.data();
      const flowSnap = await db.collection('botFlows').orderBy('createdAt', 'desc').get();
      flows = flowSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) { console.error('Error:', err); }

    let html = `
      <div class="row g-3">
        <div class="col-12">
          <div class="alert alert-info mb-2 py-2 small">
            <strong><i class="fas fa-sort-amount-down me-1"></i>Bot Priority:</strong>
            <span class="badge bg-dark">1. Keyword Match</span> →
            <span class="badge bg-dark">2. Bot Flow</span> →
            <span class="badge bg-dark">3. AI Fallback</span> →
            <span class="badge bg-dark">4. Human Agent</span>
          </div>
        </div>

        <div class="col-12">
          <div class="card-widget">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="mb-0"><i class="fas fa-robot text-purple me-2"></i>AI Auto-Reply</h5>
              <span class="badge bg-${aiSettings.enabled ? 'success' : 'secondary'}">${aiSettings.enabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            <p class="text-muted small">Choose your AI provider. <strong>Gemini & Groq are FREE.</strong></p>
            <div class="row g-2">
              <div class="col-md-3">
                <label class="form-label small fw-bold">AI Provider</label>
                <select id="aiModel" class="form-select form-select-sm">
                <option value="gemini-1.5-flash" ${aiSettings.model==='gemini-1.5-flash'?'selected':''}>Gemini 1.5 Flash (Free)</option>
                <option value="gemini-1.5-pro" ${aiSettings.model==='gemini-1.5-pro'?'selected':''}>Gemini 1.5 Pro (Free)</option>
                <option value="gemini-pro" ${aiSettings.model==='gemini-pro'?'selected':''}>Gemini Pro (Free)</option>
                <option value="llama-3.3-70b" ${aiSettings.model==='llama-3.3-70b'?'selected':''}>Llama 3.3 (Groq)</option>
                <option value="gpt-4o-mini" ${aiSettings.model==='gpt-4o-mini'?'selected':''}>GPT-4o Mini (Paid)</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">API Key</label>
                <input type="password" id="aiApiKey" class="form-control form-control-sm" value="${aiSettings.apiKey || ''}" placeholder="${aiSettings.provider==='gemini'?'Gemini API key...':aiSettings.provider==='groq'?'Groq API key...':'sk-...'}">
                <small class="text-muted">
                  ${aiSettings.provider==='gemini'?'Free: <a href=«https://aistudio.google.com/apikey» target=«_blank»>Get Gemini Key</a>':aiSettings.provider==='groq'?'Free: <a href=«https://console.groq.com/keys» target=«_blank»>Get Groq Key</a>':'Paid: <a href=«https://platform.openai.com/api-keys» target=«_blank»>Get OpenAI Key</a>'}
                </small>
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-bold">Bot Name</label>
                <input type="text" id="aiBotName" class="form-control form-control-sm" value="${aiSettings.botName || 'Support Bot'}">
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Business Name</label>
                <input type="text" id="aiBusinessName" class="form-control form-control-sm" value="${aiSettings.businessName || 'My Business'}">
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Model</label>
                <select id="aiModel" class="form-select form-select-sm">
                <option value="gemini-1.5-flash" ${aiSettings.model==='gemini-1.5-flash'?'selected':''}>Gemini 1.5 Flash (Free)</option>
                <option value="gemini-1.5-pro" ${aiSettings.model==='gemini-1.5-pro'?'selected':''}>Gemini 1.5 Pro (Free)</option>
                <option value="gemini-pro" ${aiSettings.model==='gemini-pro'?'selected':''}>Gemini Pro (Free)</option>
                <option value="llama-3.3-70b" ${aiSettings.model==='llama-3.3-70b'?'selected':''}>Llama 3.3 (Groq)</option>
                <option value="gpt-4o-mini" ${aiSettings.model==='gpt-4o-mini'?'selected':''}>GPT-4o Mini (Paid)</option>
                </select>
              </div>
              <div class="col-12">
                <label class="form-label small fw-bold">AI Instructions</label>
                <textarea id="aiBusinessInfo" class="form-control form-control-sm" rows="2" placeholder="You are a helpful support agent. Keep replies short and friendly.">${aiSettings.businessInfo || ''}</textarea>
              </div>
              <div class="col-md-2">
                <label class="form-label small fw-bold">Max Tokens</label>
                <input type="number" id="aiMaxTokens" class="form-control form-control-sm" value="${aiSettings.maxTokens || 150}">
              </div>
              <div class="col-md-2">
                <label class="form-label small fw-bold">Temperature</label>
                <input type="number" id="aiTemperature" class="form-control form-control-sm" value="${aiSettings.temperature || 0.7}" step="0.1" min="0" max="1">
              </div>
              <div class="col-md-3 d-flex align-items-end">
                <div class="form-check mb-2">
                  <input class="form-check-input" type="checkbox" id="aiEnabled" ${aiSettings.enabled?'checked':''}>
                  <label class="form-check-label small fw-bold">Enable AI Fallback</label>
                </div>
              </div>
            </div>
            <button class="btn btn-primary btn-sm mt-2" onclick="Chatbot.saveAISettings()"><i class="fas fa-save me-1"></i> Save</button>
            <button class="btn btn-outline-info btn-sm mt-2 ms-1" onclick="Chatbot.testAI()"><i class="fas fa-flask me-1"></i> Test AI</button>
            <div id="aiTestResult" class="mt-2"></div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card-widget">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="mb-0"><i class="fas fa-bolt text-warning me-2"></i>Keyword Replies</h5>
              <button class="btn btn-primary btn-sm" onclick="Chatbot.showAddReply()"><i class="fas fa-plus me-1"></i> Add</button>
            </div>
            <div id="botReplyForm"></div>
            <div style="max-height:350px;overflow-y:auto;" class="mt-2">
              ${botReplies.length===0?'<p class="text-muted text-center py-3">No keyword replies.</p>':botReplies.map(br=>`
                <div class="border rounded p-2 mb-2">
                  <div class="d-flex justify-content-between">
                    <div><strong>${br.trigger}</strong></div>
                    <div><span class="badge bg-${br.status==='active'?'success':'secondary'}">${br.status}</span><button class="btn btn-sm btn-outline-danger ms-1" onclick="Chatbot.deleteReply('${br.id}')"><i class="fas fa-trash"></i></button></div>
                  </div>
                  <small class="text-muted">${(br.reply||'').substring(0,80)}</small>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card-widget">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="mb-0"><i class="fas fa-project-diagram text-success me-2"></i>Bot Flows</h5>
              <button class="btn btn-primary btn-sm" onclick="Chatbot.showAddFlow()"><i class="fas fa-plus me-1"></i> Add</button>
            </div>
            <div id="botFlowForm"></div>
            <div style="max-height:350px;overflow-y:auto;" class="mt-2">
              ${flows.length===0?'<p class="text-muted text-center py-3">No flows.</p>':flows.map(fl=>`
                <div class="border rounded p-2 mb-2">
                  <strong>${fl.title}</strong><span class="badge bg-${fl.status==='active'?'success':'secondary'} ms-1">${fl.status}</span>
                  <button class="btn btn-sm btn-outline-danger ms-1" onclick="Chatbot.deleteFlow('${fl.id}')"><i class="fas fa-trash"></i></button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  async saveAISettings() {
    const data = {
      provider: document.getElementById('aiProvider').value,
      apiKey: document.getElementById('aiApiKey').value.trim(),
      botName: document.getElementById('aiBotName').value.trim(),
      businessName: document.getElementById('aiBusinessName').value.trim(),
      businessInfo: document.getElementById('aiBusinessInfo').value.trim(),
      model: document.getElementById('aiModel').value,
      maxTokens: parseInt(document.getElementById('aiMaxTokens').value) || 150,
      temperature: parseFloat(document.getElementById('aiTemperature').value) || 0.7,
      enabled: document.getElementById('aiEnabled').checked,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    try {
      await db.collection('settings').doc('chatbot').set(data, { merge: true });
      alert('✅ Settings saved!');
    } catch (err) { alert('Error: ' + err.message); }
  },

  async testAI() {
    const apiKey = document.getElementById('aiApiKey').value.trim();
    const provider = document.getElementById('aiProvider').value;
    
    if (!apiKey) return alert('Enter API Key first!');
    
    const testMsg = prompt('Enter test message:');
    if (!testMsg) return;
    
    document.getElementById('aiTestResult').innerHTML = '<span class="text-info">Thinking...</span>';

    try {
      const aiDoc = await db.collection('settings').doc('chatbot').get();
      const ai = aiDoc.data() || {};
      let reply = '';

      if (provider === 'gemini') {
        const model = ai.model || 'gemini-1.5-flash';
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are ${ai.botName||'Support Bot'} for ${ai.businessName||'a business'}. ${ai.businessInfo||'Keep replies short and helpful.'} Reply in the same language as the user.\n\nUser: ${testMsg}`
              }]
            }],
            generationConfig: { maxOutputTokens: ai.maxTokens||150, temperature: ai.temperature||0.7 }
          })
        });
        const data = await res.json();
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || data.error?.message || 'No response';
      } else if (provider === 'groq') {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: ai.model || 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: `You are ${ai.botName||'Support Bot'} for ${ai.businessName||'a business'}. Keep replies short.` },
              { role: 'user', content: testMsg }
            ],
            max_tokens: ai.maxTokens||150,
            temperature: ai.temperature||0.7
          })
        });
        const data = await res.json();
        reply = data.choices?.[0]?.message?.content || data.error?.message || 'No response';
      } else {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: ai.model || 'gpt-4o-mini',
            max_tokens: ai.maxTokens||150,
            temperature: ai.temperature||0.7,
            messages: [
              { role: 'system', content: `You are ${ai.botName||'Support Bot'} for ${ai.businessName||'a business'}. Keep replies short.` },
              { role: 'user', content: testMsg }
            ]
          })
        });
        const data = await res.json();
        reply = data.choices?.[0]?.message?.content || data.error?.message || 'No response';
      }

      document.getElementById('aiTestResult').innerHTML = `
        <div class="alert alert-success py-1 px-2 mt-1">
          <strong>🤖 AI (${provider}):</strong> ${reply}
        </div>`;
    } catch (err) {
      document.getElementById('aiTestResult').innerHTML = `
        <div class="alert alert-danger py-1 px-2 mt-1">
          Error: ${err.message}
        </div>`;
    }
  },

  showAddReply() {
    document.getElementById('botReplyForm').innerHTML = `
      <div class="card mb-2 border-warning"><div class="card-body p-2">
        <div class="row g-2">
          <div class="col-md-6"><input type="text" id="newTrigger" class="form-control form-control-sm" placeholder="e.g. price, pricing"></div>
          <div class="col-md-6"><textarea id="newReply" class="form-control form-control-sm" rows="2" placeholder="Reply text"></textarea></div>
          <div class="col-md-6"><div class="form-check"><input class="form-check-input" type="checkbox" id="newIsActive" checked><label class="form-check-label small">Active</label></div></div>
        </div>
        <button class="btn btn-success btn-sm mt-2" onclick="Chatbot.addReply()"><i class="fas fa-save me-1"></i> Save</button>
        <button class="btn btn-light btn-sm mt-2" onclick="Chatbot.render()">Cancel</button>
      </div></div>`;
  },

  async addReply() {
    const trigger = document.getElementById('newTrigger').value.trim().toLowerCase();
    const reply = document.getElementById('newReply').value.trim();
    if (!trigger || !reply) return alert('Required!');
    await db.collection('botReplies').add({
      trigger, reply,
      isExact: false,
      status: document.getElementById('newIsActive').checked ? 'active' : 'inactive',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert('✅ Added!'); this.render();
  },

  async deleteReply(id) { if (!confirm('Delete?')) return; await db.collection('botReplies').doc(id).delete(); alert('Deleted.'); this.render(); },

  showAddFlow() {
    document.getElementById('botFlowForm').innerHTML = `
      <div class="card mb-2 border-success"><div class="card-body p-2">
        <input type="text" id="newFlowTitle" class="form-control form-control-sm mb-1" placeholder="Flow Title">
        <textarea id="newFlowDesc" class="form-control form-control-sm mb-1" rows="2" placeholder="Description"></textarea>
        <div class="form-check mb-1"><input class="form-check-input" type="checkbox" id="newFlowActive" checked><label class="form-check-label small">Active</label></div>
        <button class="btn btn-success btn-sm" onclick="Chatbot.addFlow()"><i class="fas fa-save me-1"></i> Save</button>
        <button class="btn btn-light btn-sm" onclick="Chatbot.render()">Cancel</button>
      </div></div>`;
  },

  async addFlow() {
    const title = document.getElementById('newFlowTitle').value.trim();
    if (!title) return alert('Required!');
    await db.collection('botFlows').add({
      title, description: document.getElementById('newFlowDesc').value.trim(),
      status: document.getElementById('newFlowActive').checked ? 'active' : 'inactive',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert('✅ Added!'); this.render();
  },

  async deleteFlow(id) { if (!confirm('Delete?')) return; await db.collection('botFlows').doc(id).delete(); alert('Deleted.'); this.render(); }
};
