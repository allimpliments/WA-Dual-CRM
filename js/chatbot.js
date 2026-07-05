// js/chatbot.js — Fixed AI Chatbot (Groq + Gemini)
const Chatbot = {
  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.innerHTML = '<p class="text-center py-5">Loading...</p>';

    let botReplies = [], aiSettings = {}, flows = [];
    try {
      const [rSnap, aiDoc, fSnap] = await Promise.all([
        db.collection('botReplies').orderBy('createdAt','desc').get(),
        db.collection('settings').doc('chatbot').get(),
        db.collection('botFlows').orderBy('createdAt','desc').get()
      ]);
      botReplies = rSnap.docs.map(d=>({id:d.id,...d.data()}));
      if(aiDoc.exists) aiSettings = aiDoc.data();
      flows = fSnap.docs.map(d=>({id:d.id,...d.data()}));
    } catch(e){}

    const provider = aiSettings.provider || 'groq';
    const apiKey = aiSettings.apiKey || '';
    const botName = aiSettings.botName || 'Support Bot';
    const bizName = aiSettings.businessName || 'My Business';
    const bizInfo = aiSettings.businessInfo || '';
    const model = aiSettings.model || 'llama-3.3-70b-versatile';
    const maxTokens = aiSettings.maxTokens || 150;
    const temp = aiSettings.temperature || 0.7;
    const enabled = aiSettings.enabled || false;

    contentArea.innerHTML = `
      <div class="row g-3">
        <div class="col-12"><div class="alert alert-info small py-2"><strong>Priority:</strong> Keyword → Flow → AI → Human</div></div>

        <div class="col-12">
          <div class="card-widget">
            <h5><i class="fas fa-robot me-2"></i>AI Settings <span class="badge bg-${enabled?'success':'secondary'}">${enabled?'ON':'OFF'}</span></h5>
            <div class="row g-2">
              <div class="col-md-3"><label class="small fw-bold">Provider</label><select id="aiprov" class="form-select form-select-sm"><option value="groq" ${provider==='groq'?'selected':''}>Groq (Free)</option><option value="gemini" ${provider==='gemini'?'selected':''}>Gemini (Free)</option><option value="openai" ${provider==='openai'?'selected':''}>OpenAI</option></select></div>
              <div class="col-md-6"><label class="small fw-bold">API Key</label><input type="password" id="aikey" class="form-control form-control-sm" value="${apiKey}"></div>
              <div class="col-md-3"><label class="small fw-bold">Model</label><select id="aimodel" class="form-select form-select-sm"><option value="llama-3.3-70b-versatile" ${model==='llama-3.3-70b-versatile'?'selected':''}>Llama 3.3 70B</option><option value="gemini-2.0-flash" ${model==='gemini-2.0-flash'?'selected':''}>Gemini 2.0 Flash</option><option value="gpt-4o-mini" ${model==='gpt-4o-mini'?'selected':''}>GPT-4o Mini</option></select></div>
              <div class="col-md-4"><label class="small fw-bold">Bot Name</label><input type="text" id="aibotname" class="form-control form-control-sm" value="${botName}"></div>
              <div class="col-md-4"><label class="small fw-bold">Business</label><input type="text" id="aibizname" class="form-control form-control-sm" value="${bizName}"></div>
              <div class="col-md-4"><label class="small fw-bold">Max Tokens</label><input type="number" id="aitokens" class="form-control form-control-sm" value="${maxTokens}"></div>
              <div class="col-12"><label class="small fw-bold">Instructions</label><textarea id="aiinfo" class="form-control form-control-sm" rows="2">${bizInfo}</textarea></div>
              <div class="col-md-6"><div class="form-check mt-3"><input class="form-check-input" type="checkbox" id="aienabled" ${enabled?'checked':''}><label class="small">Enable AI Fallback</label></div></div>
            </div>
            <button class="btn btn-primary btn-sm mt-2" onclick="Chatbot.save()">Save</button>
            <button class="btn btn-outline-info btn-sm mt-2 ms-1" onclick="Chatbot.test()">Test AI</button>
            <div id="airesult" class="mt-2"></div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card-widget">
            <h5><i class="fas fa-bolt text-warning me-1"></i>Keywords</h5>
            <button class="btn btn-primary btn-sm mb-2" onclick="Chatbot.addReplyForm()">+ Add</button>
            <div id="replyform"></div>
            ${botReplies.length===0?'<p class="text-muted small">No keywords</p>':botReplies.map(b=>`<div class="border rounded p-2 mb-1"><strong>${b.trigger}</strong> <span class="badge bg-${b.status==='active'?'success':'secondary'}">${b.status}</span><button class="btn btn-sm btn-outline-danger ms-1" onclick="Chatbot.delReply('${b.id}')">×</button></div>`).join('')}
          </div>
        </div>

        <div class="col-md-6">
          <div class="card-widget">
            <h5><i class="fas fa-project-diagram text-success me-1"></i>Flows</h5>
            <button class="btn btn-primary btn-sm mb-2" onclick="Chatbot.addFlowForm()">+ Add</button>
            <div id="flowform"></div>
            ${flows.length===0?'<p class="text-muted small">No flows</p>':flows.map(f=>`<div class="border rounded p-2 mb-1"><strong>${f.title}</strong> <span class="badge bg-${f.status==='active'?'success':'secondary'}">${f.status}</span><button class="btn btn-sm btn-outline-danger ms-1" onclick="Chatbot.delFlow('${f.id}')">×</button></div>`).join('')}
          </div>
        </div>
      </div>
    `;
  },

  async save() {
    const prov = document.getElementById('aiprov');
    const key = document.getElementById('aikey');
    if (!prov || !key) return alert('Page not loaded properly. Refresh.');
    
    await db.collection('settings').doc('chatbot').set({
      provider: prov.value, apiKey: key.value,
      botName: document.getElementById('aibotname')?.value||'',
      businessName: document.getElementById('aibizname')?.value||'',
      businessInfo: document.getElementById('aiinfo')?.value||'',
      model: document.getElementById('aimodel')?.value||'',
      maxTokens: parseInt(document.getElementById('aitokens')?.value)||150,
      temperature: 0.7,
      enabled: document.getElementById('aienabled')?.checked||false,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, {merge:true});
    alert('✅ Saved!');
  },

  async test() {
    const prov = document.getElementById('aiprov');
    const key = document.getElementById('aikey');
    if (!prov || !key) return alert('Refresh page first.');
    
    const msg = prompt('Test message:');
    if(!msg) return;
    
    const resultDiv = document.getElementById('airesult');
    resultDiv.innerHTML = '<span class="text-info">Thinking...</span>';

    try {
      let reply = '';
      if (prov.value === 'groq') {
        const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method:'POST', headers:{'Authorization':'Bearer '+key.value,'Content-Type':'application/json'},
          body:JSON.stringify({model:document.getElementById('aimodel')?.value||'llama-3.3-70b-versatile',messages:[{role:'user',content:msg}],max_tokens:parseInt(document.getElementById('aitokens')?.value)||150})
        });
        const d = await r.json();
        reply = d.choices?.[0]?.message?.content || d.error?.message || JSON.stringify(d);
      } else if (prov.value === 'gemini') {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${document.getElementById('aimodel')?.value||'gemini-2.0-flash'}:generateContent?key=${key.value}`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({contents:[{parts:[{text:msg}]}]})
        });
        const d = await r.json();
        reply = d.candidates?.[0]?.content?.parts?.[0]?.text || d.error?.message || JSON.stringify(d);
      } else {
        const r = await fetch('https://api.openai.com/v1/chat/completions', {
          method:'POST', headers:{'Authorization':'Bearer '+key.value,'Content-Type':'application/json'},
          body:JSON.stringify({model:'gpt-4o-mini',messages:[{role:'user',content:msg}],max_tokens:150})
        });
        const d = await r.json();
        reply = d.choices?.[0]?.message?.content || d.error?.message || JSON.stringify(d);
      }
      resultDiv.innerHTML = `<div class="alert alert-success py-1 px-2 mt-1"><strong>🤖</strong> ${reply}</div>`;
    } catch(e) {
      resultDiv.innerHTML = `<div class="alert alert-danger py-1 px-2 mt-1">${e.message}</div>`;
    }
  },

  addReplyForm() {
    document.getElementById('replyform').innerHTML = `<div class="card p-2 mb-2 border-warning"><input id="ntrigger" class="form-control form-control-sm mb-1" placeholder="Trigger word"><textarea id="nreply" class="form-control form-control-sm mb-1" rows="2" placeholder="Reply"></textarea><button class="btn btn-success btn-sm" onclick="Chatbot.saveReply()">Save</button></div>`;
  },
  async saveReply() {
    const t=document.getElementById('ntrigger')?.value?.trim(),r=document.getElementById('nreply')?.value?.trim();
    if(!t||!r)return alert('Fill both!');
    await db.collection('botReplies').add({trigger:t.toLowerCase(),reply:r,status:'active',createdAt:firebase.firestore.FieldValue.serverTimestamp()});
    this.render();
  },
  async delReply(id){if(confirm('Delete?')){await db.collection('botReplies').doc(id).delete();this.render();}},

  addFlowForm() {
    document.getElementById('flowform').innerHTML = `<div class="card p-2 mb-2 border-success"><input id="nftitle" class="form-control form-control-sm mb-1" placeholder="Flow title"><button class="btn btn-success btn-sm" onclick="Chatbot.saveFlow()">Save</button></div>`;
  },
  async saveFlow() {
    const t=document.getElementById('nftitle')?.value?.trim();
    if(!t)return alert('Title required!');
    await db.collection('botFlows').add({title:t,status:'active',createdAt:firebase.firestore.FieldValue.serverTimestamp()});
    this.render();
  },
  async delFlow(id){if(confirm('Delete?')){await db.collection('botFlows').doc(id).delete();this.render();}}
};
