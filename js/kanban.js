// js/kanban.js – Complete Advanced Pipeline (Leads + Contacts + Deals)
const Kanban = {
  stages: [
    { id: 'new', name: 'New Lead', color: '#6366f1', icon: 'fa-star' },
    { id: 'contacted', name: 'Contacted', color: '#8b5cf6', icon: 'fa-phone' },
    { id: 'qualified', name: 'Qualified', color: '#3b82f6', icon: 'fa-check' },
    { id: 'proposal', name: 'Proposal', color: '#f59e0b', icon: 'fa-file' },
    { id: 'negotiation', name: 'Negotiation', color: '#ef4444', icon: 'fa-handshake' },
    { id: 'won', name: 'Won', color: '#10b981', icon: 'fa-trophy' },
    { id: 'lost', name: 'Lost', color: '#6b7280', icon: 'fa-times' },
  ],
  leads: [],
  contacts: [],
  draggedId: null,
  draggedType: null,

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading Pipeline...</p>';
    await this.loadData();

    let html = `
      <style>
        .pipeline-wrap { padding: 10px; }
        .pipeline-stats { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
        .pipe-stat { background: #fff; border-radius: 10px; padding: 12px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); flex: 1; min-width: 110px; text-align: center; border-left: 3px solid var(--s-color); }
        .pipe-stat .num { font-size: 22px; font-weight: 700; }
        .pipe-stat .lbl { font-size: 10px; color: #65676b; text-transform: uppercase; }
        .pipeline-board { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 12px; }
        .pipeline-col { background: #f0f2f5; border-radius: 12px; padding: 10px; min-width: 250px; max-width: 300px; flex: 1; }
        .pipeline-col-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 3px solid var(--col-color); }
        .pipeline-col-header h6 { font-size: 13px; font-weight: 600; margin: 0; }
        .pipe-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 10px; margin-bottom: 6px; cursor: grab; transition: all 0.15s; }
        .pipe-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .pipe-card.dragging { opacity: 0.4; transform: rotate(1deg); }
        .pipe-card .card-type { font-size: 10px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
        .pipe-card .card-name { font-weight: 600; font-size: 13px; margin: 2px 0; }
        .pipe-card .card-detail { font-size: 11px; color: #65676b; }
        .pipe-card .card-actions { margin-top: 4px; text-align: right; }
        .quick-add-btn { background: none; border: 1px dashed #c0c0c0; border-radius: 6px; padding: 8px; width: 100%; cursor: pointer; font-size: 11px; color: #888; text-align: center; }
        .quick-add-btn:hover { background: #e7f3ff; border-color: #1877f2; color: #1877f2; }
        .quick-add-form { display: flex; gap: 4px; margin-top: 4px; }
        .quick-add-form input { flex: 1; padding: 5px 8px; border: 1px solid #dadde1; border-radius: 4px; font-size: 11px; }
        .btn-xs { font-size: 10px; padding: 2px 8px; }
        @media (max-width: 768px) { .pipeline-board { flex-direction: column; } .pipeline-col { max-width: 100%; } }
      </style>

      <div class="pipeline-wrap">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4><i class="fas fa-tasks me-2"></i>Sales Pipeline</h4>
          <div>
            <button class="btn btn-outline-primary btn-sm me-1" onclick="Leads.render()"><i class="fas fa-list me-1"></i> List View</button>
            <button class="btn btn-primary btn-sm" onclick="Kanban.showAddForm()"><i class="fas fa-plus me-1"></i> Add Deal</button>
          </div>
        </div>

        <div class="pipeline-stats">
          <div class="pipe-stat" style="--s-color:#6366f1;"><div class="num">${this.leads.length + this.contacts.length}</div><div class="lbl">Total Pipeline</div></div>
          <div class="pipe-stat" style="--s-color:#3b82f6;"><div class="num">${this.leads.filter(l => l.status === 'new').length}</div><div class="lbl">New</div></div>
          <div class="pipe-stat" style="--s-color:#f59e0b;"><div class="num">${this.leads.filter(l => ['qualified','proposal','negotiation'].includes(l.status)).length}</div><div class="lbl">Active</div></div>
          <div class="pipe-stat" style="--s-color:#10b981;"><div class="num">${this.leads.filter(l => l.status === 'won').length + this.contacts.filter(c => c.status === 'won').length}</div><div class="lbl">Won</div></div>
          <div class="pipe-stat" style="--s-color:#ef4444;"><div class="num">₹${this.totalValue()}</div><div class="lbl">Pipeline Value</div></div>
        </div>

        <div class="pipeline-board" id="kanbanBoard">
          ${this.stages.map(stage => `
            <div class="pipeline-col" data-stage="${stage.id}" style="--col-color:${stage.color};" ondragover="event.preventDefault()" ondrop="Kanban.drop(event)">
              <div class="pipeline-col-header">
                <h6><i class="fas ${stage.icon} me-1" style="color:${stage.color};"></i> ${stage.name}</h6>
                <small>${this.leads.filter(l => l.status === stage.id).length + this.contacts.filter(c => c.status === stage.id).length}</small>
              </div>
              ${this.leads.filter(l => l.status === stage.id).map(lead => `
                <div class="pipe-card" draggable="true" data-id="${lead.id}" data-type="lead" ondragstart="Kanban.drag(event)" ondragend="Kanban.dragEnd(event)">
                  <div class="card-type text-primary">● LEAD</div>
                  <div class="card-name">${lead.name}</div>
                  <div class="card-detail">${lead.phone || lead.email || 'No contact'}</div>
                  <div class="card-detail">Source: ${lead.source || 'Unknown'}</div>
                  ${lead.value ? `<div class="card-detail"><strong>₹${lead.value}</strong></div>` : ''}
                  <div class="card-actions">
                    <button class="btn btn-xs btn-outline-danger" onclick="event.stopPropagation();Kanban.removeFromPipeline('leads','${lead.id}')">×</button>
                  </div>
                </div>
              `).join('')}
              ${this.contacts.filter(c => c.status === stage.id).map(contact => `
                <div class="pipe-card" draggable="true" data-id="${contact.id}" data-type="contact" ondragstart="Kanban.drag(event)" ondragend="Kanban.dragEnd(event)">
                  <div class="card-type text-success">● CONTACT</div>
                  <div class="card-name">${contact.firstName||''} ${contact.lastName||''}</div>
                  <div class="card-detail">${contact.mobile || contact.email || 'No contact'}</div>
                  ${contact.value ? `<div class="card-detail"><strong>₹${contact.value}</strong></div>` : ''}
                  <div class="card-actions">
                    <button class="btn btn-xs btn-outline-danger" onclick="event.stopPropagation();Kanban.removeFromPipeline('contacts','${contact.id}')">×</button>
                  </div>
                </div>
              `).join('')}
              <div class="quick-add-btn" onclick="Kanban.showQuickAdd('${stage.id}')">+ Quick Add</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div id="kanbanModal"></div>
    `;
    contentArea.innerHTML = html;
  },

  totalValue() {
    let total = 0;
    this.leads.forEach(l => { if (l.value) total += parseInt(l.value) || 0; });
    this.contacts.forEach(c => { if (c.value) total += parseInt(c.value) || 0; });
    return total.toLocaleString();
  },

  async loadData() {
    try {
      const lSnap = await db.collection('leads').orderBy('createdAt', 'desc').get();
      this.leads = lSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const cSnap = await db.collection('contacts').orderBy('createdAt', 'desc').get();
      this.contacts = cSnap.docs.map(d => ({ id: d.id, ...d.data(), status: d.data().status || 'new' }));
    } catch (e) { this.leads = []; this.contacts = []; }
  },

  drag(e) {
    const card = e.target.closest('.pipe-card');
    if (!card) return;
    this.draggedId = card.dataset.id;
    this.draggedType = card.dataset.type;
    card.classList.add('dragging');
  },

  dragEnd(e) {
    e.target.closest('.pipe-card')?.classList.remove('dragging');
  },

  async drop(e) {
    const stage = e.target.closest('.pipeline-col')?.dataset.stage;
    if (stage && this.draggedId && this.draggedType) {
      await db.collection(this.draggedType === 'lead' ? 'leads' : 'contacts').doc(this.draggedId).update({ status: stage });
      this.render();
    }
  },

  showQuickAdd(stage) {
    const btn = event.target;
    btn.outerHTML = `
      <div class="quick-add-form">
        <input type="text" id="qName" placeholder="Name" onkeydown="if(event.key==='Enter')Kanban.quickAdd('${stage}')">
        <input type="text" id="qPhone" placeholder="Phone" onkeydown="if(event.key==='Enter')Kanban.quickAdd('${stage}')">
        <button class="btn btn-primary btn-xs" onclick="Kanban.quickAdd('${stage}')">+</button>
      </div>
    `;
  },

  async quickAdd(stage) {
    const name = document.getElementById('qName').value.trim();
    const phone = document.getElementById('qPhone').value.trim();
    if (!name) return alert('Name required!');
    await db.collection('leads').add({
      name, phone, status: stage, source: 'Manual',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    this.render();
  },

  showAddForm() {
    document.getElementById('kanbanModal').innerHTML = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:3000;display:flex;align-items:center;justify-content:center;" onclick="document.getElementById('kanbanModal').innerHTML=''">
        <div class="card-widget" style="width:400px;max-width:90vw;" onclick="event.stopPropagation()">
          <h5>Add New Lead</h5>
          <input type="text" id="kName" class="form-control form-control-sm mb-2" placeholder="Name *">
          <input type="text" id="kPhone" class="form-control form-control-sm mb-2" placeholder="Phone">
          <input type="email" id="kEmail" class="form-control form-control-sm mb-2" placeholder="Email">
          <div class="row g-2 mb-2">
            <div class="col-6"><input type="number" id="kValue" class="form-control form-control-sm" placeholder="Value (₹)"></div>
            <div class="col-6">
              <select id="kSource" class="form-select form-select-sm">
                <option value="Manual">Manual</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Facebook">Facebook</option>
                <option value="Website">Website</option>
                <option value="Form">Form</option>
                <option value="Campaign">Campaign</option>
                <option value="Google">Google Ads</option>
              </select>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="Kanban.addDeal()">Save Lead</button>
          <button class="btn btn-light btn-sm" onclick="document.getElementById('kanbanModal').innerHTML=''">Cancel</button>
        </div>
      </div>
    `;
  },

  async addDeal() {
    const name = document.getElementById('kName').value.trim();
    if (!name) return alert('Name required!');
    await db.collection('leads').add({
      name,
      phone: document.getElementById('kPhone').value.trim(),
      email: document.getElementById('kEmail').value.trim(),
      value: document.getElementById('kValue').value.trim(),
      source: document.getElementById('kSource').value,
      status: 'new',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    document.getElementById('kanbanModal').innerHTML = '';
    this.render();
  },

  async removeFromPipeline(collection, id) {
    if (!confirm('Remove from pipeline? (Data stays in CRM)')) return;
    await db.collection(collection).doc(id).update({ status: 'lost' });
    this.render();
  }
};
