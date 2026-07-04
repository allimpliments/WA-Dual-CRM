// js/campaigns.js — Bulk + Drip + Stats Tabs
const Campaigns = {
  currentTab: 'bulk', // bulk, drip, stats
  editingCampaign: null,

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading...</p>';

    if (this.currentTab === 'drip') {
      await this.renderDrip();
      return;
    }
    if (this.currentTab === 'stats' && this.editingCampaign) {
      await this.renderStats(this.editingCampaign);
      return;
    }

    await this.renderBulk();
  },

  // ==================== TAB NAVIGATION ====================
  renderTabs(active) {
    return `
      <div class="d-flex gap-2 mb-3">
        <button class="btn btn-${active==='bulk'?'primary':'outline-primary'} btn-sm" onclick="Campaigns.currentTab='bulk';Campaigns.render();">
          📢 Bulk Campaigns
        </button>
        <button class="btn btn-${active==='drip'?'primary':'outline-primary'} btn-sm" onclick="Campaigns.currentTab='drip';Campaigns.render();">
          🔄 Drip Sequences
        </button>
      </div>
    `;
  },

  // ==================== 1. BULK CAMPAIGNS ====================
  async renderBulk() {
    let campaigns = [];
    try {
      const snap = await db.collection('campaigns').where('type', '==', 'bulk').orderBy('createdAt', 'desc').get();
      campaigns = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch(e){}

    let html = `
      ${this.renderTabs('bulk')}
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="mb-0"><i class="fas fa-paper-plane text-primary me-2"></i>Bulk Campaigns</h4>
        <button class="btn btn-primary btn-sm" onclick="Campaigns.showBulkCreate()">
          <i class="fas fa-plus me-1"></i> New Bulk Campaign
        </button>
      </div>
      <div id="campaignFormContainer"></div>
      <div class="row g-3">
        ${campaigns.length === 0 ? '<div class="col-12 text-center py-4 text-muted">No bulk campaigns yet.</div>' : campaigns.map(c => this.renderCampaignCard(c, 'bulk')).join('')}
      </div>
    `;
    contentArea.innerHTML = html;
  },

  async showBulkCreate() {
    let groups = [], templates = [];
    try {
      const gSnap = await db.collection('contactGroups').get();
      groups = gSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const tSnap = await db.collection('templates').where('metaStatus', '==', 'APPROVED').get();
      templates = tSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e){}

    document.getElementById('campaignFormContainer').innerHTML = `
      <div class="card-widget mb-3 border-primary">
        <h5>Create Bulk Campaign</h5>
        <div class="row g-2">
          <div class="col-md-6"><input type="text" id="bName" class="form-control form-control-sm" placeholder="Campaign Name *"></div>
          <div class="col-md-6">
            <select id="bGroup" class="form-select form-select-sm">
              <option value="">All Contacts</option>
              ${groups.map(g => `<option value="${g.id}">${g.name} (${(g.memberIds||[]).length})</option>`).join('')}
            </select>
          </div>
          <div class="col-md-6">
            <select id="bTemplate" class="form-select form-select-sm" onchange="Campaigns.loadTemplate('b')">
              <option value="">Custom Message</option>
              ${templates.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-6">
            <select id="bSchedule" class="form-select form-select-sm">
              <option value="now">Send Now</option><option value="later">Schedule</option>
            </select>
          </div>
        </div>
        <div class="row g-2 mt-1" id="bScheduleRow" style="display:none">
          <div class="col-6"><input type="date" id="bDate" class="form-control form-control-sm"></div>
          <div class="col-6"><input type="time" id="bTime" class="form-control form-control-sm"></div>
        </div>
        <textarea id="bMessage" class="form-control form-control-sm mt-2" rows="4" placeholder="Message. Use {first_name}, {last_name}, {phone}"></textarea>
        <div class="mt-2">
          <input type="text" id="bMedia" class="form-control form-control-sm" placeholder="Image/Video URL (optional)">
        </div>
        <button class="btn btn-success btn-sm mt-2" onclick="Campaigns.saveBulkCampaign('send')">Save & Send</button>
        <button class="btn btn-outline-primary btn-sm mt-2" onclick="Campaigns.saveBulkCampaign('draft')">Draft</button>
        <button class="btn btn-light btn-sm mt-2" onclick="Campaigns.currentTab='bulk';Campaigns.render();">Cancel</button>
      </div>
    `;

    document.getElementById('bSchedule').addEventListener('change', function(){
      document.getElementById('bScheduleRow').style.display = this.value==='later'?'flex':'none';
    });
  },

  async saveBulkCampaign(action) {
    const name = document.getElementById('bName').value.trim();
    if(!name) return alert('Name required!');
    const data = {
      name, type:'bulk',
      groupId: document.getElementById('bGroup').value,
      message: document.getElementById('bMessage').value.trim(),
      media: document.getElementById('bMedia').value.trim(),
      status: action==='send' ? (document.getElementById('bSchedule').value==='later'?'scheduled':'running') : 'draft',
      scheduledAt: document.getElementById('bSchedule').value==='later' ? new Date(document.getElementById('bDate').value+'T'+document.getElementById('bTime').value).toISOString() : null,
      total:0, sent:0, delivered:0, failed:0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    const ref = await db.collection('campaigns').add(data);
    if(data.status==='running') this.runBulkCampaign(ref.id);
    else alert('✅ Saved!');
    this.render();
  },

  // ==================== 2. DRIP CAMPAIGNS ====================
  async renderDrip() {
    let drips = [];
    try {
      const snap = await db.collection('campaigns').where('type', '==', 'drip').orderBy('createdAt', 'desc').get();
      drips = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch(e){}

    let html = `
      ${this.renderTabs('drip')}
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="mb-0"><i class="fas fa-clock text-warning me-2"></i>Drip Sequences</h4>
        <button class="btn btn-warning btn-sm" onclick="Campaigns.showDripCreate()">
          <i class="fas fa-plus me-1"></i> New Drip Sequence
        </button>
      </div>
      <div id="dripFormContainer"></div>
      <div class="row g-3">
        ${drips.length === 0 ? '<div class="col-12 text-center py-4 text-muted">No drip sequences yet. Create automated follow-ups!</div>' : drips.map(d => this.renderDripCard(d)).join('')}
      </div>
    `;
    contentArea.innerHTML = html;
  },

  renderDripCard(d) {
    const steps = d.dripSteps || [];
    const active = d.status === 'running';
    return `
      <div class="col-md-6 col-lg-4">
        <div class="card-widget border-${active?'success':'secondary'}">
          <div class="d-flex justify-content-between">
            <h6>${d.name}</h6>
            <span class="badge bg-${active?'success':'secondary'}">${active?'Running':'Draft'}</span>
          </div>
          <small class="text-muted">${steps.length} steps · ${d.total||0} contacts</small>
          <div class="mt-2">
            ${steps.map((s,i) => `<div class="small">${i+1}. ${s.message?.substring(0,40)}... <span class="text-muted">(${s.delayHours}h delay)</span></div>`).join('')}
          </div>
          <div class="d-flex gap-1 mt-2">
            ${d.status==='draft' ? `<button class="btn btn-success btn-sm flex-grow-1" onclick="Campaigns.runDripCampaign('${d.id}')">▶ Start</button>` :
              `<button class="btn btn-danger btn-sm flex-grow-1" onclick="Campaigns.stopDripCampaign('${d.id}')">⏹ Stop</button>`}
            <button class="btn btn-outline-danger btn-sm" onclick="Campaigns.deleteCampaign('${d.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>
    `;
  },

  async showDripCreate() {
    let groups = [];
    try { const sn = await db.collection('contactGroups').get(); groups = sn.docs.map(d=>({id:d.id,...d.data()})); } catch(e){}

    document.getElementById('dripFormContainer').innerHTML = `
      <div class="card-widget mb-3 border-warning">
        <h5><i class="fas fa-clock me-2"></i>Create Drip Sequence</h5>
        <div class="row g-2">
          <div class="col-md-6"><input type="text" id="dName" class="form-control form-control-sm" placeholder="Sequence Name *"></div>
          <div class="col-md-6">
            <select id="dGroup" class="form-select form-select-sm">
              <option value="">All Contacts</option>
              ${groups.map(g => `<option value="${g.id}">${g.name} (${(g.memberIds||[]).length})</option>`).join('')}
            </select>
          </div>
        </div>
        <div id="dripStepsContainer" class="mt-2">
          <div class="drip-step-row border rounded p-2 mb-2">
            <div class="row g-2">
              <div class="col-md-8"><textarea class="form-control form-control-sm" placeholder="Step 1 message. Use {first_name}, {phone}"></textarea></div>
              <div class="col-md-2"><input type="number" class="form-control form-control-sm" value="0" min="0" placeholder="Delay hrs"></div>
              <div class="col-md-2 d-flex align-items-end"><span class="small text-muted">Step 1</span></div>
            </div>
          </div>
        </div>
        <button class="btn btn-outline-primary btn-sm mt-1" onclick="Campaigns.addDripStepField()"><i class="fas fa-plus me-1"></i> Add Step</button>
        <div class="mt-2">
          <button class="btn btn-warning btn-sm" onclick="Campaigns.saveDripCampaign('send')">Save & Start</button>
          <button class="btn btn-outline-warning btn-sm" onclick="Campaigns.saveDripCampaign('draft')">Save Draft</button>
          <button class="btn btn-light btn-sm" onclick="Campaigns.currentTab='drip';Campaigns.render();">Cancel</button>
        </div>
      </div>
    `;
  },

  addDripStepField() {
    const c = document.getElementById('dripStepsContainer');
    const n = c.querySelectorAll('.drip-step-row').length + 1;
    const div = document.createElement('div');
    div.className = 'drip-step-row border rounded p-2 mb-2';
    div.innerHTML = `
      <div class="row g-2">
        <div class="col-md-8"><textarea class="form-control form-control-sm" placeholder="Step ${n} message"></textarea></div>
        <div class="col-md-2"><input type="number" class="form-control form-control-sm" value="${n*24}" min="0" placeholder="Hrs"></div>
        <div class="col-md-2 d-flex align-items-center"><button class="btn btn-sm btn-outline-danger" onclick="this.closest('.drip-step-row').remove()">×</button></div>
      </div>
    `;
    c.appendChild(div);
  },

  async saveDripCampaign(action) {
    const name = document.getElementById('dName').value.trim();
    if(!name) return alert('Name required!');
    const steps = [];
    document.querySelectorAll('.drip-step-row').forEach(r => {
      const msg = r.querySelector('textarea')?.value?.trim();
      const delay = parseInt(r.querySelector('input[type=number]')?.value) || 0;
      if(msg) steps.push({ message:msg, delayHours:delay });
    });
    if(steps.length===0) return alert('Add at least 1 step!');
    const data = {
      name, type:'drip', groupId: document.getElementById('dGroup').value,
      dripSteps: steps, total:0, sent:0, delivered:0, failed:0,
      status: action==='send'?'running':'draft',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    const ref = await db.collection('campaigns').add(data);
    if(data.status==='running') this.runDripCampaign(ref.id);
    else alert('✅ Draft saved!');
    this.render();
  },

  // ==================== EXECUTION ====================
  async getContacts(groupId) {
    if(groupId) {
      const g = await db.collection('contactGroups').doc(groupId).get();
      const ids = g.data().memberIds || [];
      const contacts = [];
      for(const id of ids) { const d=await db.collection('contacts').doc(id).get(); if(d.exists) contacts.push({id:d.id,...d.data()}); }
      return contacts;
    }
    const sn = await db.collection('contacts').get();
    return sn.docs.map(d=>({id:d.id,...d.data()}));
  },

  async sendWhatsApp(phone, message, media) {
    const cfg = (await db.collection('settings').doc('whatsapp').get()).data();
    if(!cfg?.accessToken) return false;
    phone = phone.replace(/[^0-9]/g,'');
    if(!phone) return false;
    try {
      const payload = { messaging_product:'whatsapp', to:phone, type:'text', text:{body:message} };
      if(media){ payload.type = media.match(/\.(mp4|mov)/i)?'video':'image'; payload[payload.type] = {link:media, caption:message}; }
      const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.phoneNumberId}/messages`,{method:'POST',headers:{'Authorization':'Bearer '+cfg.accessToken,'Content-Type':'application/json'},body:JSON.stringify(payload)});
      return res.ok;
    }catch(e){return false;}
  },

  async runBulkCampaign(id) {
    const doc = await db.collection('campaigns').doc(id).get();
    const c = doc.data();
    const contacts = await this.getContacts(c.groupId);
    if(contacts.length===0) return alert('No contacts!');
    await db.collection('campaigns').doc(id).update({total:contacts.length, status:'running'});
    for(const ct of contacts){
      const phone = ct.mobile||ct.phone||'';
      const msg = (c.message||'').replace(/\{first_name\}/g,ct.firstName||'').replace(/\{last_name\}/g,ct.lastName||'').replace(/\{phone\}/g,phone).replace(/\{email\}/g,ct.email||'');
      const ok = await this.sendWhatsApp(phone, msg, c.media);
      await db.collection('campaigns').doc(id).update({sent:firebase.firestore.FieldValue.increment(1), [ok?'delivered':'failed']:firebase.firestore.FieldValue.increment(1)});
      if(ok){ try{ const ex=await db.collection('leads').where('phone','==',phone).limit(1).get(); if(ex.empty) await LeadCapture.fromCampaign(phone,`${ct.firstName||''} ${ct.lastName||''}`.trim(),id); }catch(e){} }
      await new Promise(r=>setTimeout(r,500));
    }
    await db.collection('campaigns').doc(id).update({status:'completed'});
    alert('✅ Campaign completed!');
    this.render();
  },

  async runDripCampaign(id) {
    const doc = await db.collection('campaigns').doc(id).get();
    const c = doc.data();
    const contacts = await this.getContacts(c.groupId);
    if(contacts.length===0) return alert('No contacts!');
    await db.collection('campaigns').doc(id).update({total:contacts.length, status:'running'});
    const steps = c.dripSteps||[];
    for(let i=0;i<steps.length;i++){
      const delay = (steps[i].delayHours||0)*3600000;
      setTimeout(async ()=>{
        for(const ct of contacts){
          const phone = ct.mobile||ct.phone||'';
          const msg = (steps[i].message||'').replace(/\{first_name\}/g,ct.firstName||'').replace(/\{last_name\}/g,ct.lastName||'').replace(/\{phone\}/g,phone);
          await this.sendWhatsApp(phone, msg);
          await new Promise(r=>setTimeout(r,500));
        }
        if(i===steps.length-1) await db.collection('campaigns').doc(id).update({status:'completed'});
      },delay);
    }
    alert('🔄 Drip sequence started!');
    this.render();
  },

  async stopDripCampaign(id) {
    if(!confirm('Stop this drip sequence?')) return;
    await db.collection('campaigns').doc(id).update({status:'draft'});
    alert('⏹ Stopped');
    this.render();
  },

  renderCampaignCard(c, type) {
    const prog = c.total>0 ? Math.round((c.sent||0)/c.total*100) : 0;
    return `
      <div class="col-md-6 col-lg-4">
        <div class="card-widget">
          <div class="d-flex justify-content-between"><h6>${c.name}</h6><span class="badge bg-${c.status==='running'?'success':c.status==='completed'?'primary':'secondary'}">${c.status}</span></div>
          <small>Sent:${c.sent||0} Delivered:${c.delivered||0} Failed:${c.failed||0}</small>
          <div class="progress mt-1" style="height:6px"><div class="progress-bar" style="width:${prog}%"></div></div>
          <div class="mt-2">
            ${c.status==='draft'?`<button class="btn btn-success btn-sm" onclick="Campaigns.runBulkCampaign('${c.id}')">▶ Run</button>`:''}
            <button class="btn btn-outline-danger btn-sm" onclick="Campaigns.deleteCampaign('${c.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>
    `;
  },

  loadTemplate(prefix) {
    const id = document.getElementById(prefix+'Template').value;
    if(!id) return;
    db.collection('templates').doc(id).get().then(doc=>{
      const t=doc.data();
      document.getElementById(prefix+'Message').value = (t.components||[]).find(c=>c.type==='BODY')?.text||t.body||'';
    });
  },

  async renderStats(id) {
    const d = await db.collection('campaigns').doc(id).get();
    const c = d.data();
    contentArea.innerHTML = `
      <button class="btn btn-outline-secondary btn-sm mb-2" onclick="Campaigns.currentTab='${c.type||'bulk'}';Campaigns.editingCampaign=null;Campaigns.render();">← Back</button>
      <h5>${c.name}</h5>
      <div class="row g-2">
        <div class="col-3"><div class="card-widget text-center"><h3>${c.total||0}</h3><small>Total</small></div></div>
        <div class="col-3"><div class="card-widget text-center"><h3>${c.sent||0}</h3><small>Sent</small></div></div>
        <div class="col-3"><div class="card-widget text-center"><h3>${c.delivered||0}</h3><small>Delivered</small></div></div>
        <div class="col-3"><div class="card-widget text-center"><h3>${c.failed||0}</h3><small>Failed</small></div></div>
      </div>
    `;
  },

  async deleteCampaign(id) {
    if(!confirm('Delete?')) return;
    await db.collection('campaigns').doc(id).delete();
    this.render();
  }
};
