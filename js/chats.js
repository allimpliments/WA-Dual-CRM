const Chats = {
  contactCache: {},
  currentChatTab: 'whatsapp',

  async getContactName(number) {
    if (!number || number === 'unknown') return null;
    if (number === '342354115627791') return '11 Avatar Digital Hub';
    if (this.contactCache[number]) return this.contactCache[number];
    try {
      const clean = number.replace(/\+/g, '');
      const snap = await db.collection('contacts').where('mobile', '==', clean).limit(1).get();
      if (!snap.empty) {
        const c = snap.docs[0].data();
        const name = `${c.firstName || ''} ${c.lastName || ''}`.trim();
        this.contactCache[number] = name || number;
        return this.contactCache[number];
      }
    } catch(e) {}
    try {
      const clean = number.replace(/\+/g, '');
      const snap = await db.collection('leads').where('phone', '==', clean).limit(1).get();
      if (!snap.empty) {
        const name = snap.docs[0].data().name;
        this.contactCache[number] = name || number;
        return this.contactCache[number];
      }
    } catch(e) {}
    this.contactCache[number] = number;
    return number;
  },

  isSystemMessage(msg) {
    if (!msg.from || msg.from === 'unknown') return true;
    if (msg.from === '342354115627791' && msg.type === 'incoming') return true;
    const body = (msg.body || '').toLowerCase();
    if (body.includes('key advantages') || body.includes('tech provider') || body.includes('verified')) return true;
    if (msg.body === '(media)' && (!msg.from || msg.from === 'unknown')) return true;
    return false;
  },

  async render() {
    if (this.currentChatTab === 'facebook') { await this.renderSocialChat('facebook'); return; }
    if (this.currentChatTab === 'instagram') { await this.renderSocialChat('instagram'); return; }
    if (this.currentChatTab === 'linkedin') { await this.renderSocialChat('linkedin'); return; }
    if (this.currentChatTab === 'youtube') { await this.renderSocialChat('youtube'); return; }
    await this.renderWhatsApp();
  },

  async renderWhatsApp() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading WhatsApp chats...</p>';
    let messages = [];
    try {
      const snap = await db.collection('messages').orderBy('createdAt', 'desc').limit(100).get();
      messages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      for (const msg of messages) {
        if (msg.from && msg.from !== 'unknown' && msg.from !== '342354115627791') await this.getContactName(msg.from);
        if (msg.to && msg.to !== '342354115627791') await this.getContactName(msg.to);
      }
    } catch (err) { console.error(err); }
    const displayMessages = messages.filter(msg => !this.isSystemMessage(msg));

    let html = `
      <ul class="nav nav-tabs mb-3">
        <li class="nav-item"><a class="nav-link ${this.currentChatTab==='whatsapp'?'active':''}" onclick="Chats.switchChatTab('whatsapp')"><i class="fab fa-whatsapp text-success me-1"></i>WhatsApp</a></li>
        <li class="nav-item"><a class="nav-link ${this.currentChatTab==='facebook'?'active':''}" onclick="Chats.switchChatTab('facebook')"><i class="fab fa-facebook-messenger text-primary me-1"></i>FB Messenger</a></li>
        <li class="nav-item"><a class="nav-link ${this.currentChatTab==='instagram'?'active':''}" onclick="Chats.switchChatTab('instagram')"><i class="fab fa-instagram text-danger me-1"></i>IG Direct</a></li>
        <li class="nav-item"><a class="nav-link ${this.currentChatTab==='linkedin'?'active':''}" onclick="Chats.switchChatTab('linkedin')"><i class="fab fa-linkedin text-info me-1"></i>LinkedIn</a></li>
        <li class="nav-item"><a class="nav-link ${this.currentChatTab==='youtube'?'active':''}" onclick="Chats.switchChatTab('youtube')"><i class="fab fa-youtube text-danger me-1"></i>YouTube</a></li>
      </ul>
      <div class="row g-3">
        <div class="col-md-4">
          <div class="card-widget">
            <h5><i class="fab fa-whatsapp text-success me-2"></i>Send WhatsApp</h5>
            <div class="mb-3"><label class="form-label">Phone Number</label><input type="text" id="chatPhone" class="form-control form-control-sm" placeholder="+919810012345"></div>
            <div class="mb-3"><label class="form-label">Message</label><textarea id="chatMessage" class="form-control form-control-sm" rows="3" placeholder="Type message..."></textarea></div>
            <button class="btn btn-success btn-sm w-100" onclick="Chats.sendMessage()"><i class="fab fa-whatsapp me-1"></i> Send</button>
            <div id="chatResult" class="mt-2"></div>
          </div>
        </div>
        <div class="col-md-8">
          <div class="card-widget">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="mb-0"><i class="fas fa-history text-primary me-2"></i>History</h5>
              <button class="btn btn-outline-primary btn-sm" onclick="Chats.refreshFromMeta()"><i class="fas fa-sync-alt me-1"></i> Refresh</button>
            </div>
            <input type="text" id="chatSearch" class="form-control form-control-sm mb-2" placeholder="Search..." oninput="Chats.filterMessages()">
            <div style="max-height:450px;overflow-y:auto;" id="messageList">
              ${displayMessages.length === 0 ? '<p class="text-muted text-center py-4">No messages.</p>' : displayMessages.map(msg => `
                <div class="d-flex mb-2 p-2 border rounded message-row ${msg.type==='incoming'?'bg-light':''}">
                  <div class="me-2"><i class="fas fa-arrow-${msg.type==='incoming'?'down text-info':'up text-success'}"></i></div>
                  <div class="flex-grow-1">
                    <div class="d-flex justify-content-between"><strong>${msg.type==='incoming'?(Chats.contactCache[msg.from]||msg.from||'Unknown'):(Chats.contactCache[msg.to]||msg.to||'Unknown')}</strong><small>${msg.createdAt?.toDate().toLocaleString()||''}</small></div>
                    <p class="mb-0 small message-body">${msg.body||'(media)'}</p>
                    <span class="badge bg-${msg.type==='incoming'?'info':'success'}">${msg.type}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
    this.setupRealtimeListener();
  },

  async renderSocialChat(platform) {
    contentArea.innerHTML = `<p class="text-center py-5">Loading ${platform} chats...</p>`;
    const icons = {facebook:'fa-facebook-messenger text-primary',instagram:'fa-instagram text-danger',linkedin:'fa-linkedin text-info',youtube:'fa-youtube text-danger'};
    const names = {facebook:'Facebook Messenger',instagram:'Instagram Direct',linkedin:'LinkedIn Messages',youtube:'YouTube Comments'};
    const configs = {facebook:'facebook_messenger',instagram:'instagram_messenger',linkedin:'linkedin',youtube:'youtube'};

    let cfg = {};
    try {
      const doc = await db.collection('settings').doc(configs[platform]).get();
      if(doc.exists) cfg = doc.data();
    } catch(e){}

    let msgs = [];
    try {
      const snap = await db.collection('socialMessages').where('platform','==',platform).orderBy('createdAt','desc').limit(100).get();
      msgs = snap.docs.map(d=>({id:d.id,...d.data()}));
    } catch(e){}

    const configured = cfg.accessToken || cfg.apiKey;
    let html = `
      <ul class="nav nav-tabs mb-3">
        <li class="nav-item"><a class="nav-link ${this.currentChatTab==='whatsapp'?'active':''}" onclick="Chats.switchChatTab('whatsapp')"><i class="fab fa-whatsapp text-success me-1"></i>WhatsApp</a></li>
        <li class="nav-item"><a class="nav-link ${this.currentChatTab==='facebook'?'active':''}" onclick="Chats.switchChatTab('facebook')"><i class="fab fa-facebook-messenger text-primary me-1"></i>FB</a></li>
        <li class="nav-item"><a class="nav-link ${this.currentChatTab==='instagram'?'active':''}" onclick="Chats.switchChatTab('instagram')"><i class="fab fa-instagram text-danger me-1"></i>IG</a></li>
        <li class="nav-item"><a class="nav-link ${this.currentChatTab==='linkedin'?'active':''}" onclick="Chats.switchChatTab('linkedin')"><i class="fab fa-linkedin text-info me-1"></i>LinkedIn</a></li>
        <li class="nav-item"><a class="nav-link ${this.currentChatTab==='youtube'?'active':''}" onclick="Chats.switchChatTab('youtube')"><i class="fab fa-youtube text-danger me-1"></i>YouTube</a></li>
      </ul>
      <div class="card-widget">
        <h5><i class="fab ${icons[platform]} me-2"></i>${names[platform]}</h5>
        ${configured ? '<div class="alert alert-success py-1 px-2 small">Connected ✅</div>' : '<div class="alert alert-warning py-1 px-2 small">Not configured. Go to Setup.</div>'}
        <div style="max-height:400px;overflow-y:auto;">
          ${msgs.length===0?'<p class="text-muted text-center py-3">No messages yet.</p>':msgs.map(m=>`
            <div class="border rounded p-2 mb-1 ${m.type==='incoming'?'bg-light':''}">
              <strong>${m.from||'User'}</strong><p class="mb-0 small">${m.body||'(media)'}</p>
              <small class="text-muted">${m.createdAt?.toDate().toLocaleString()||''}</small>
            </div>
          `).join('')}
        </div>
        ${configured?`<div class="input-group mt-2"><input id="${platform}MsgInput" class="form-control form-control-sm" placeholder="Reply..."><button class="btn btn-sm btn-primary" onclick="Chats.sendSocialReply('${platform}')">Send</button></div>`:''}
      </div>
    `;
    contentArea.innerHTML = html;
  },

  switchChatTab(tab) { this.currentChatTab = tab; this.render(); },

  setupRealtimeListener() {
    if (window._chatUnsubscribe) window._chatUnsubscribe();
    window._chatUnsubscribe = db.collection('messages').orderBy('createdAt','desc').limit(100).onSnapshot(async snap => {
      const msgs = snap.docs.map(d=>({id:d.id,...d.data()}));
      for(const m of msgs){
        if(m.from && m.from !== 'unknown' && m.from !== '342354115627791') {
          await this.getContactName(m.from);
          // ✅ Lead Capture: अगर incoming मैसेज नया है तो लीड बनाएँ
          if (m.type === 'incoming') {
            const phone = m.from.replace(/^\+/, '');
            const existing = await db.collection('leads').where('phone', '==', phone).limit(1).get();
            if (existing.empty) {
              // नया लीड बनाएँ (LeadCapture इंजन यूज़ करें)
              await LeadCapture.fromWhatsApp(phone, m.body || '', this.contactCache[m.from] || '');
            }
          }
        }
        if(m.to && m.to !== '342354115627791') await this.getContactName(m.to);
      }
      const filtered = msgs.filter(m=>!this.isSystemMessage(m));
      const list = document.getElementById('messageList'); if(!list) return;
      list.innerHTML = filtered.length===0?'<p class="text-muted text-center py-4">No messages.</p>':filtered.map(msg=>`
        <div class="d-flex mb-2 p-2 border rounded ${msg.type==='incoming'?'bg-light':''}">
          <div class="me-2"><i class="fas fa-arrow-${msg.type==='incoming'?'down text-info':'up text-success'}"></i></div>
          <div class="flex-grow-1"><div class="d-flex justify-content-between"><strong>${msg.type==='incoming'?(this.contactCache[msg.from]||msg.from):(this.contactCache[msg.to]||msg.to)}</strong><small>${msg.createdAt?.toDate().toLocaleString()||''}</small></div><p class="mb-0 small">${msg.body||'(media)'}</p><span class="badge bg-${msg.type==='incoming'?'info':'success'}">${msg.type}</span></div>
        </div>
      `).join('');
    });
  },

  filterMessages() {
    const s = document.getElementById('chatSearch')?.value?.toLowerCase()||'';
    document.querySelectorAll('.message-row').forEach(r=>{r.style.display=(r.querySelector('.message-body')?.textContent?.toLowerCase()||'').includes(s)?'':'none';});
  },

  async sendMessage() {
    let phone = document.getElementById('chatPhone').value.trim();
    const msg = document.getElementById('chatMessage').value.trim();
    if(!phone||!msg) return alert('Fill both fields!');
    phone = phone.replace(/[^0-9+]/g,'');
    if(!phone.startsWith('+')&&phone.length===10) phone='+91'+phone;
    const cfg = (await db.collection('settings').doc('whatsapp').get()).data();
    if(!cfg?.accessToken) return alert('WhatsApp not configured.');
    document.getElementById('chatResult').innerHTML='<span class="text-info">Sending...</span>';
    try{
      const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.phoneNumberId}/messages`,{method:'POST',headers:{'Authorization':'Bearer '+cfg.accessToken,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to:phone,type:'text',text:{body:msg}})});
      const d = await res.json();
      if(res.ok&&d.messages){await db.collection('messages').add({to:phone,from:cfg.phoneNumberId,body:msg,type:'outgoing',createdAt:firebase.firestore.FieldValue.serverTimestamp()});document.getElementById('chatResult').innerHTML='<span class="text-success">✅ Sent!</span>';}
      else document.getElementById('chatResult').innerHTML='<span class="text-danger">❌ '+(d.error?.message||'Failed')+'</span>';
    }catch(e){document.getElementById('chatResult').innerHTML='<span class="text-danger">❌ '+e.message+'</span>';}
  },

  async sendSocialReply(platform) {
    const msg = document.getElementById(platform+'MsgInput')?.value?.trim();
    if(!msg) return alert('Type a message!');
    await db.collection('socialMessages').add({platform,from:'You',body:msg,type:'outgoing',createdAt:firebase.firestore.FieldValue.serverTimestamp()});
    document.getElementById(platform+'MsgInput').value='';
    this.renderSocialChat(platform);
  },

  async refreshFromMeta() {
    const cfg = (await db.collection('settings').doc('whatsapp').get()).data();
    if(!cfg?.accessToken) return alert('Not configured.');
    contentArea.innerHTML='<p class="text-center py-5">Refreshing...</p>';
    let added=0;
    try{
      const cr = await fetch('https://graph.facebook.com/v22.0/342856675576986/conversations?limit=10',{headers:{'Authorization':'Bearer '+cfg.accessToken}});
      const cd = await cr.json();
      if(cd.data){for(const c of cd.data){try{const mr=await fetch(`https://graph.facebook.com/v22.0/${c.id}/messages?limit=20`,{headers:{'Authorization':'Bearer '+cfg.accessToken}});const md=await mr.json();if(md.data){for(const m of md.data){const ex=await db.collection('messages').where('waMessageId','==',m.id).get();if(ex.empty){await db.collection('messages').add({from:m.from,to:m.to,body:m.text?.body||'(media)',type:m.from===cfg.phoneNumberId?'outgoing':'incoming',waMessageId:m.id,createdAt:firebase.firestore.FieldValue.serverTimestamp()});added++;}}}}catch(e){}}}
      alert(`✅ Refreshed! ${added} new messages.`);this.render();
    }catch(e){alert('Error: '+e.message);this.render();}
  }
};
