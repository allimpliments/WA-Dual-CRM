// js/campaigns.js — Bulk + Drip Campaigns with clientId isolation
const Campaigns = {
  currentTab: 'bulk',
  editingCampaign: null,

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading...</p>';

    if (this.currentTab === 'drip') { await this.renderDrip(); return; }
    if (this.currentTab === 'stats' && this.editingCampaign) { await this.renderStats(this.editingCampaign); return; }

    await this.renderBulk();
  },

  // ==================== BULK ====================
  async renderBulk() {
    let campaigns = [];
    try {
      // ✅ clientId फ़िल्टर
      let query = db.collection('campaigns').where('type', '==', 'bulk');
      if (shouldFilterByClient()) query = query.where('clientId', '==', window.currentUser.clientId);
      const snap = await query.orderBy('createdAt', 'desc').get();
      campaigns = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch(e){ console.error(e); }

    let html = `
      <div class="d-flex gap-2 mb-3">
        <button class="btn btn-primary btn-sm" onclick="Campaigns.currentTab='bulk';Campaigns.render();">📢 Bulk Campaigns</button>
        <button class="btn btn-outline-primary btn-sm" onclick="Campaigns.currentTab='drip';Campaigns.render();">🔄 Drip Sequences</button>
      </div>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="mb-0"><i class="fas fa-paper-plane text-primary me-2"></i>Bulk Campaigns</h4>
        <button class="btn btn-primary btn-sm" onclick="Campaigns.showBulkCreate()"><i class="fas fa-plus me-1"></i> New Bulk Campaign</button>
      </div>
      <div id="campaignFormContainer"></div>
      <div class="row g-3">
        ${campaigns.length === 0 ? '<div class="col-12 text-center py-4 text-muted">No bulk campaigns yet.</div>' : campaigns.map(c => {
          const p = c.total > 0 ? Math.round((c.sent||0)/c.total*100) : 0;
          return `<div class="col-md-6 col-lg-4"><div class="card-widget">
            <div class="d-flex justify-content-between"><h6>${c.name||'-'}</h6><span class="badge bg-${c.status==='running'?'success':c.status==='completed'?'primary':'secondary'}">${c.status||'draft'}</span></div>
            <small>Sent:${c.sent||0} Del:${c.delivered||0} Fail:${c.failed||0}</small>
            <div class="progress mt-1" style="height:6px"><div class="progress-bar" style="width:${p}%"></div></div>
            <div class="mt-2">${c.status==='draft'?`<button class="btn btn-success btn-sm" onclick="Campaigns.executeBulk('${c.id}')">▶ Run</button>`:''} <button class="btn btn-outline-danger btn-sm" onclick="Campaigns.deleteCampaign('${c.id}')">🗑</button></div>
          </div></div>`;
        }).join('')}
      </div>
    `;
    contentArea.innerHTML = html;
  },

  async showBulkCreate() {
    let groups=[], templates=[];
    try {
      const gs=await db.collection('contactGroups').get(); groups=gs.docs.map(d=>({id:d.id,...d.data()}));
      const ts=await db.collection('templates').where('metaStatus','==','APPROVED').get(); templates=ts.docs.map(d=>({id:d.id,...d.data()}));
    } catch(e){}
    document.getElementById('campaignFormContainer').innerHTML = `
      <div class="card-widget mb-3 border-primary">
        <h5>Create Bulk Campaign</h5>
        <div class="row g-2">
          <div class="col-md-6"><input id="bName" class="form-control form-control-sm" placeholder="Campaign Name *"></div>
          <div class="col-md-6"><select id="bGroup" class="form-select form-select-sm"><option value="">All Contacts</option>${groups.map(g=>`<option value="${g.id}">${g.name} (${(g.memberIds||[]).length})</option>`).join('')}</select></div>
          <div class="col-md-6"><select id="bTemplate" class="form-select form-select-sm" onchange="Campaigns.loadTemplate('b')"><option value="">Custom Message</option>${templates.map(t=>`<option value="${t.id}">${t.name}</option>`).join('')}</select></div>
          <div class="col-md-6"><select id="bSchedule" class="form-select form-select-sm" onchange="document.getElementById('bSRow').style.display=this.value==='later'?'flex':'none'"><option value="now">Send Now</option><option value="later">Schedule</option></select></div>
        </div>
        <div id="bSRow" class="row g-2 mt-1" style="display:none"><div class="col-6"><input type="date" id="bDate" class="form-control form-control-sm"></div><div class="col-6"><input type="time" id="bTime" class="form-control form-control-sm"></div></div>
        <textarea id="bMessage" class="form-control form-control-sm mt-2" rows="4" placeholder="Message. {first_name}, {last_name}, {phone}"></textarea>
        <input id="bMedia" class="form-control form-control-sm mt-1" placeholder="Image/Video URL (optional)">
        <button class="btn btn-success btn-sm mt-2" onclick="Campaigns.saveBulk('send')">Save & Send</button>
        <button class="btn btn-outline-primary btn-sm mt-2" onclick="Campaigns.saveBulk('draft')">Draft</button>
        <button class="btn btn-light btn-sm mt-2" onclick="Campaigns.currentTab='bulk';Campaigns.render();">Cancel</button>
      </div>
    `;
  },

  async saveBulk(action) {
    const name=document.getElementById('bName').value.trim();
    if(!name) return alert('Name required!');
    const data={
      name, type:'bulk', groupId:document.getElementById('bGroup').value,
      message:document.getElementById('bMessage').value.trim(),
      media:document.getElementById('bMedia').value.trim(),
      status:action==='send'?(document.getElementById('bSchedule').value==='later'?'scheduled':'running'):'draft',
      total:0, sent:0, delivered:0, failed:0,
      clientId: getCurrentClientId(),   // ✅ clientId जोड़ा
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    };
    const ref=await db.collection('campaigns').add(data);
    if(data.status==='running') this.executeBulk(ref.id);
    else alert('✅ Saved!');
    this.render();
  },

  async getContacts(groupId) {
    if(groupId){
      const g=await db.collection('contactGroups').doc(groupId).get();
      const ids=g.data().memberIds||[];
      const cs=[];
      for(const id of ids){
        const d=await db.collection('contacts').doc(id).get();
        if(d.exists) cs.push({id:d.id,...d.data()});
      }
      return cs;
    }
    // ✅ clientId फ़िल्टर
    let query = db.collection('contacts');
    if (shouldFilterByClient()) query = query.where('clientId', '==', window.currentUser.clientId);
    const sn=await query.get();
    return sn.docs.map(d=>({id:d.id,...d.data()}));
  },

  async sendOne(phone, msg, media) {
    const cfg=(await db.collection('settings').doc('whatsapp').get()).data();
    if(!cfg?.accessToken) return false;
    phone=phone.replace(/[^0-9]/g,''); if(!phone) return false;
    try{
      const p={messaging_product:'whatsapp',to:phone,type:'text',text:{body:msg}};
      if(media){p.type=media.match(/\.(mp4|mov)/i)?'video':'image';p[p.type]={link:media,caption:msg};}
      const r=await fetch(`https://graph.facebook.com/v22.0/${cfg.phoneNumberId}/messages`,{method:'POST',headers:{'Authorization':'Bearer '+cfg.accessToken,'Content-Type':'application/json'},body:JSON.stringify(p)});
      return r.ok;
    }catch(e){return false;}
  },

  async executeBulk(id) {
    const doc=await db.collection('campaigns').doc(id).get(); const c=doc.data();
    const contacts=await this.getContacts(c.groupId);
    if(contacts.length===0) return alert('No contacts!');
    await db.collection('campaigns').doc(id).update({total:contacts.length,status:'running'});
    for(const ct of contacts){
      const phone=ct.mobile||ct.phone||'';
      const msg=(c.message||'').replace(/\{first_name\}/g,ct.firstName||'').replace(/\{last_name\}/g,ct.lastName||'').replace(/\{phone\}/g,phone).replace(/\{email\}/g,ct.email||'');
      const ok=await this.sendOne(phone,msg,c.media);
      await db.collection('campaigns').doc(id).update({sent:firebase.firestore.FieldValue.increment(1),[ok?'delivered':'failed']:firebase.firestore.FieldValue.increment(1)});
      await new Promise(r=>setTimeout(r,500));
    }
    await db.collection('campaigns').doc(id).update({status:'completed'});
    alert('✅ Done!'); this.render();
  },

  // ==================== DRIP ====================
  async renderDrip() {
    let drips=[];
    try{
      // ✅ clientId फ़िल्टर
      let query = db.collection('campaigns').where('type', '==', 'drip');
      if (shouldFilterByClient()) query = query.where('clientId', '==', window.currentUser.clientId);
      const sn=await query.orderBy('createdAt', 'desc').get();
      drips=sn.docs.map(d=>({id:d.id,...d.data()}));
    }catch(e){}
    let html=`
      <div class="d-flex gap-2 mb-3">
        <button class="btn btn-outline-primary btn-sm" onclick="Campaigns.currentTab='bulk';Campaigns.render();">📢 Bulk</button>
        <button class="btn btn-primary btn-sm" onclick="Campaigns.currentTab='drip';Campaigns.render();">🔄 Drip Sequences</button>
      </div>
      <div class="d-flex justify-content-between mb-3">
        <h4><i class="fas fa-clock text-warning me-2"></i>Drip Sequences</h4>
        <button class="btn btn-warning btn-sm" onclick="Campaigns.showDripCreate()"><i class="fas fa-plus me-1"></i> New Sequence</button>
      </div>
      <div id="dripFormContainer"></div>
      <div class="row g-3">
        ${drips.length===0?'<div class="col-12 text-center py-4 text-muted">No drip sequences yet.</div>':drips.map(d=>{
          const steps=d.dripSteps||[];
          return `<div class="col-md-6 col-lg-4"><div class="card-widget">
            <div class="d-flex justify-content-between"><h6>${d.name}</h6><span class="badge bg-${d.status==='running'?'success':'secondary'}">${d.status}</span></div>
            <small>${steps.length} steps · ${d.total||0} contacts</small>
            <div class="mt-1">${steps.map((s,i)=>`<small class="d-block">${i+1}. ${s.message?.substring(0,30)}... (${s.delayHours}h)</small>`).join('')}</div>
            <div class="mt-2">${d.status==='draft'?`<button class="btn btn-success btn-sm" onclick="Campaigns.executeDrip('${d.id}')">▶ Start</button>`:`<button class="btn btn-danger btn-sm" onclick="Campaigns.stopDrip('${d.id}')">⏹ Stop</button>`} <button class="btn btn-outline-danger btn-sm" onclick="Campaigns.deleteCampaign('${d.id}')">🗑</button></div>
          </div></div>`;
        }).join('')}
      </div>
    `;
    contentArea.innerHTML=html;
  },

  showDripCreate() {
    let groups=[];
    try{db.collection('contactGroups').get().then(sn=>{groups=sn.docs.map(d=>({id:d.id,...d.data()}));});}catch(e){}
    document.getElementById('dripFormContainer').innerHTML=`
      <div class="card-widget mb-3 border-warning">
        <h5>Create Drip Sequence</h5>
        <div class="row g-2"><div class="col-md-6"><input id="dName" class="form-control form-control-sm" placeholder="Sequence Name *"></div><div class="col-md-6"><select id="dGroup" class="form-select form-select-sm"><option value="">All Contacts</option></select></div></div>
        <div id="dripStepsContainer" class="mt-2">
          <div class="border rounded p-2 mb-2"><div class="row g-2"><div class="col-md-8"><textarea class="form-control form-control-sm" placeholder="Step 1 message"></textarea></div><div class="col-md-2"><input type="number" class="form-control form-control-sm" value="0" min="0"></div><div class="col-md-2"><small>Step 1</small></div></div></div>
        </div>
        <button class="btn btn-outline-primary btn-sm mt-1" onclick="Campaigns.addDripStep()">+ Add Step</button>
        <button class="btn btn-warning btn-sm mt-2" onclick="Campaigns.saveDrip('send')">Save & Start</button>
        <button class="btn btn-outline-warning btn-sm mt-2" onclick="Campaigns.saveDrip('draft')">Draft</button>
        <button class="btn btn-light btn-sm mt-2" onclick="Campaigns.currentTab='drip';Campaigns.render();">Cancel</button>
      </div>
    `;
  },

  addDripStep() {
    const c=document.getElementById('dripStepsContainer');const n=c.querySelectorAll('.border').length+1;
    const d=document.createElement('div');d.className='border rounded p-2 mb-2';
    d.innerHTML=`<div class="row g-2"><div class="col-md-8"><textarea class="form-control form-control-sm" placeholder="Step ${n} message"></textarea></div><div class="col-md-2"><input type="number" class="form-control form-control-sm" value="${n*24}" min="0"></div><div class="col-md-2"><button class="btn btn-sm btn-outline-danger" onclick="this.closest('.border').remove()">×</button></div></div>`;
    c.appendChild(d);
  },

  async saveDrip(action) {
    const name=document.getElementById('dName').value.trim(); if(!name) return alert('Name!');
    const steps=[];
    document.querySelectorAll('#dripStepsContainer .border').forEach(r=>{const m=r.querySelector('textarea')?.value.trim();const d=parseInt(r.querySelector('input')?.value)||0;if(m)steps.push({message:m,delayHours:d});});
    if(steps.length===0) return alert('Add steps!');
    const data={
      name, type:'drip', groupId:document.getElementById('dGroup').value,
      dripSteps:steps, total:0, sent:0, delivered:0, failed:0,
      status:action==='send'?'running':'draft',
      clientId: getCurrentClientId(),   // ✅ clientId जोड़ा
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    };
    const ref=await db.collection('campaigns').add(data);
    if(data.status==='running') this.executeDrip(ref.id); else alert('✅ Saved!');
    this.render();
  },

  async executeDrip(id) {
    const doc=await db.collection('campaigns').doc(id).get();const c=doc.data();
    const contacts=await this.getContacts(c.groupId); if(contacts.length===0) return alert('No contacts!');
    await db.collection('campaigns').doc(id).update({total:contacts.length,status:'running'});
    (c.dripSteps||[]).forEach((step,i)=>{
      const delay=(step.delayHours||0)*3600000;
      setTimeout(async()=>{
        for(const ct of contacts){
          const phone=ct.mobile||ct.phone||'';
          const msg=(step.message||'').replace(/\{first_name\}/g,ct.firstName||'').replace(/\{last_name\}/g,ct.lastName||'').replace(/\{phone\}/g,phone);
          await this.sendOne(phone,msg);
          await new Promise(r=>setTimeout(r,500));
        }
        if(i===c.dripSteps.length-1) await db.collection('campaigns').doc(id).update({status:'completed'});
      },delay);
    });
    alert('🔄 Drip started!'); this.render();
  },

  async stopDrip(id) { if(!confirm('Stop?')) return; await db.collection('campaigns').doc(id).update({status:'draft'}); alert('Stopped'); this.render(); },

  loadTemplate(p) {
    const id=document.getElementById(p+'Template').value; if(!id) return;
    db.collection('templates').doc(id).get().then(d=>{const t=d.data();document.getElementById(p+'Message').value=(t.components||[]).find(c=>c.type==='BODY')?.text||t.body||'';});
  },

  renderStats(id) { /* same as before */ },
  async deleteCampaign(id) { if(!confirm('Delete?')) return; await db.collection('campaigns').doc(id).delete(); this.render(); }
};
