// js/kanban.js — Trello-Style Advanced Kanban with Detail Panel
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
  users: [],
  draggedId: null,
  draggedType: null,
  filterAssignee: null,
  filterDateFrom: null,
  filterDateTo: null,
  selectedCard: null, // { id, type, data }

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading Pipeline...</p>';
    await this.loadData();
    await this.loadUsers();

    let filteredLeads = this.leads;
    let filteredContacts = this.contacts;
    if (this.filterAssignee) {
      filteredLeads = filteredLeads.filter(l => l.assignedTo === this.filterAssignee);
      filteredContacts = filteredContacts.filter(c => c.assignedTo === this.filterAssignee);
    }
    if (this.filterDateFrom) {
      filteredLeads = filteredLeads.filter(l => l.createdAt?.toDate() >= new Date(this.filterDateFrom));
      filteredContacts = filteredContacts.filter(c => c.createdAt?.toDate() >= new Date(this.filterDateFrom));
    }
    if (this.filterDateTo) {
      filteredLeads = filteredLeads.filter(l => l.createdAt?.toDate() <= new Date(this.filterDateTo + 'T23:59:59'));
      filteredContacts = filteredContacts.filter(c => c.createdAt?.toDate() <= new Date(this.filterDateTo + 'T23:59:59'));
    }

    let html = `
      <style>
        .pipeline-wrap { padding: 10px; }
        .pipeline-stats { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
        .pipe-stat { background: #fff; border-radius: 10px; padding: 12px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); flex: 1; min-width: 110px; text-align: center; border-left: 3px solid var(--s-color); }
        .pipe-stat .num { font-size: 22px; font-weight: 700; }
        .pipe-stat .lbl { font-size: 10px; color: #65676b; text-transform: uppercase; }
        .pipeline-board { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 12px; min-height: 400px; }
        .pipeline-col { background: #f0f2f5; border-radius: 12px; padding: 10px; min-width: 260px; max-width: 300px; flex: 1; display: flex; flex-direction: column; }
        .pipeline-col-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 3px solid var(--col-color); }
        .pipeline-col-header h6 { font-size: 13px; font-weight: 600; margin: 0; }
        .pipeline-cards { flex: 1; min-height: 60px; }
        .pipe-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 10px; margin-bottom: 6px; cursor: pointer; transition: all 0.15s; position: relative; }
        .pipe-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-color: #1877f2; }
        .pipe-card.dragging { opacity: 0.4; transform: rotate(2deg); }
        .pipe-card .card-type { font-size: 10px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
        .pipe-card .card-name { font-weight: 600; font-size: 13px; margin: 2px 0; }
        .pipe-card .card-detail { font-size: 11px; color: #65676b; }
        .pipe-card .card-badges { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px; }
        .pipe-card .card-badge { font-size: 10px; padding: 1px 6px; border-radius: 8px; }
        .pipe-card .card-badge.priority-high { background: #fde8e8; color: #c81e1e; }
        .pipe-card .card-badge.priority-medium { background: #fef3c7; color: #92400e; }
        .pipe-card .card-badge.priority-low { background: #e0f2fe; color: #0369a1; }
        .pipe-card .card-badge.followup { background: #dcfce7; color: #166534; }
        .quick-add-btn { background: none; border: 1px dashed #c0c0c0; border-radius: 6px; padding: 8px; width: 100%; cursor: pointer; font-size: 11px; color: #888; text-align: center; margin-top: 4px; }
        .quick-add-btn:hover { background: #e7f3ff; border-color: #1877f2; color: #1877f2; }
        .quick-add-form { display: flex; gap: 4px; margin-top: 4px; flex-wrap: wrap; }
        .quick-add-form input, .quick-add-form select { flex: 1; padding: 5px 8px; border: 1px solid #dadde1; border-radius: 4px; font-size: 11px; min-width: 60px; }
        .btn-xs { font-size: 10px; padding: 2px 8px; }
        .drag-over { background: #e7f3ff !important; border: 2px dashed #1877f2 !important; }
        .card-detail-panel { position: fixed; top: 0; right: 0; width: 450px; max-width: 95vw; height: 100vh; background: #fff; box-shadow: -4px 0 20px rgba(0,0,0,0.15); z-index: 3000; overflow-y: auto; padding: 20px; animation: slideInRight 0.2s ease; }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .detail-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.3); z-index: 2999; }
        @media (max-width: 768px) { .pipeline-board { flex-direction: column; } .pipeline-col { max-width: 100%; } .card-detail-panel { width: 100%; } }
      </style>

      <div class="pipeline-wrap">
        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap">
          <h4><i class="fas fa-tasks me-2"></i>Sales Pipeline</h4>
          <div class="d-flex gap-2 flex-wrap">
            <select id="kanbanAssigneeFilter" class="form-select form-select-sm" style="width:auto;" onchange="Kanban.filterAssignee=this.value||null;Kanban.render();">
              <option value="">All Team</option>
              ${this.users.map(u => `<option value="${u.id}" ${Kanban.filterAssignee===u.id?'selected':''}>${u.name||u.email}</option>`).join('')}
            </select>
            <input type="date" class="form-control form-control-sm" style="width:130px;" id="kanbanDateFrom" value="${this.filterDateFrom||''}" onchange="Kanban.filterDateFrom=this.value;Kanban.render();">
            <input type="date" class="form-control form-control-sm" style="width:130px;" id="kanbanDateTo" value="${this.filterDateTo||''}" onchange="Kanban.filterDateTo=this.value;Kanban.render();">
            <button class="btn btn-outline-primary btn-sm" onclick="Leads.render()"><i class="fas fa-list me-1"></i> List View</button>
            <button class="btn btn-primary btn-sm" onclick="Kanban.showAddForm()"><i class="fas fa-plus me-1"></i> Add Deal</button>
          </div>
        </div>

        <div class="pipeline-stats">
          <div class="pipe-stat" style="--s-color:#6366f1;"><div class="num">${filteredLeads.length + filteredContacts.length}</div><div class="lbl">Total</div></div>
          <div class="pipe-stat" style="--s-color:#3b82f6;"><div class="num">${filteredLeads.filter(l => l.status === 'new').length}</div><div class="lbl">New</div></div>
          <div class="pipe-stat" style="--s-color:#f59e0b;"><div class="num">${filteredLeads.filter(l => ['qualified','proposal','negotiation'].includes(l.status)).length}</div><div class="lbl">Active</div></div>
          <div class="pipe-stat" style="--s-color:#10b981;"><div class="num">${filteredLeads.filter(l => l.status === 'won').length + filteredContacts.filter(c => c.status === 'won').length}</div><div class="lbl">Won</div></div>
          <div class="pipe-stat" style="--s-color:#ef4444;"><div class="num">₹${this.totalValue(filteredLeads, filteredContacts)}</div><div class="lbl">Value</div></div>
        </div>

        <div class="pipeline-board" id="kanbanBoard">
          ${this.stages.map(stage => `
            <div class="pipeline-col" data-stage="${stage.id}" style="--col-color:${stage.color};">
              <div class="pipeline-col-header">
                <h6><i class="fas ${stage.icon} me-1" style="color:${stage.color};"></i> ${stage.name}</h6>
                <small>${filteredLeads.filter(l => l.status === stage.id).length + filteredContacts.filter(c => c.status === stage.id).length}</small>
              </div>
              <div class="pipeline-cards" 
                   ondragover="Kanban.dragOver(event)" 
                   ondragleave="Kanban.dragLeave(event)" 
                   ondrop="Kanban.drop(event, '${stage.id}')">
                ${filteredLeads.filter(l => l.status === stage.id).map(lead => this.renderCard(lead, 'lead')).join('')}
                ${filteredContacts.filter(c => c.status === stage.id).map(contact => this.renderCard(contact, 'contact')).join('')}
              </div>
              <div class="quick-add-btn" onclick="Kanban.showQuickAdd('${stage.id}', event)">+ Quick Add</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div id="kanbanModal"></div>
      <div id="detailPanel"></div>
    `;
    contentArea.innerHTML = html;

    // Detail panel open karo agar selectedCard hai
    if (this.selectedCard) {
      setTimeout(() => this.openDetailPanel(this.selectedCard), 100);
    }
  },

  renderCard(item, type) {
    const name = type === 'lead' ? item.name : `${item.firstName||''} ${item.lastName||''}`.trim();
    const detail = item.phone || item.email || item.mobile || 'No contact';
    const priority = item.priority || 'medium';
    const hasFollowup = item.followupDate ? true : false;
    const hasNotes = item.notes ? true : false;

    let badges = '';
    if (priority === 'high') badges += '<span class="card-badge priority-high">🔴 High</span>';
    else if (priority === 'low') badges += '<span class="card-badge priority-low">🔵 Low</span>';
    if (hasFollowup) badges += '<span class="card-badge followup">📅 Follow-up</span>';
    if (hasNotes) badges += '<span class="card-badge" style="background:#f3e8ff;color:#6b21a8;">📝 Notes</span>';

    return `
      <div class="pipe-card" draggable="true" 
           data-id="${item.id}" data-type="${type}" 
           ondragstart="Kanban.drag(event)" 
           ondragend="Kanban.dragEnd(event)"
           onclick="Kanban.openCardDetail('${item.id}', '${type}')">
        <div class="card-type text-${type==='lead'?'primary':'success'}">● ${type.toUpperCase()}</div>
        <div class="card-name">${name}</div>
        <div class="card-detail">${detail}</div>
        ${type==='lead' ? `<div class="card-detail">Source: ${item.source || 'Unknown'}</div>` : ''}
        ${item.value ? `<div class="card-detail"><strong>₹${item.value}</strong></div>` : ''}
        ${badges ? `<div class="card-badges">${badges}</div>` : ''}
      </div>
    `;
  },

  // ========== DRAG & DROP (FIXED) ==========
  drag(e) {
    const card = e.target.closest('.pipe-card');
    if (!card) return;
    this.draggedId = card.dataset.id;
    this.draggedType = card.dataset.type;
    card.classList.add('dragging');
    e.dataTransfer.setData('text/plain', '');
    e.dataTransfer.effectAllowed = 'move';
  },

  dragEnd(e) {
    document.querySelectorAll('.pipe-card.dragging').forEach(c => c.classList.remove('dragging'));
    document.querySelectorAll('.pipeline-cards.drag-over').forEach(c => c.classList.remove('drag-over'));
  },

  dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const container = e.target.closest('.pipeline-cards');
    if (container) container.classList.add('drag-over');
  },

  dragLeave(e) {
    const container = e.target.closest('.pipeline-cards');
    if (container && !container.contains(e.relatedTarget)) {
      container.classList.remove('drag-over');
    }
  },

  async drop(e, stage) {
    e.preventDefault();
    e.target.closest('.pipeline-cards')?.classList.remove('drag-over');
    if (stage && this.draggedId && this.draggedType) {
      const collection = this.draggedType === 'lead' ? 'leads' : 'contacts';
      await db.collection(collection).doc(this.draggedId).update({ status: stage });

      // Agar Lead ka status change ho, toh corresponding Contact bhi update karo
      if (this.draggedType === 'lead') {
        const lead = this.leads.find(l => l.id === this.draggedId);
        if (lead && (lead.phone || lead.email)) {
          const contactSnap = await db.collection('contacts')
            .where('mobile', '==', lead.phone || '')
            .where('email', '==', lead.email || '')
            .get();
          contactSnap.forEach(async doc => {
            await doc.ref.update({ status: stage });
          });
        }
      }

      // Agar Contact ka status change ho, toh corresponding Lead bhi update karo
      if (this.draggedType === 'contact') {
        const contact = this.contacts.find(c => c.id === this.draggedId);
        if (contact && (contact.mobile || contact.email)) {
          const leadSnap = await db.collection('leads')
            .where('phone', '==', contact.mobile || '')
            .where('email', '==', contact.email || '')
            .get();
          leadSnap.forEach(async doc => {
            await doc.ref.update({ status: stage });
          });
        }
      }

      this.draggedId = null;
      this.draggedType = null;
      this.render();
    }
  },

  // ========== CARD DETAIL PANEL ==========
  openCardDetail(id, type) {
    this.selectedCard = { id, type };
    this.render();
  },

  closeDetailPanel() {
    this.selectedCard = null;
    document.getElementById('detailPanel').innerHTML = '';
    this.render();
  },

  async openDetailPanel(card) {
    const collection = card.type === 'lead' ? 'leads' : 'contacts';
    const doc = await db.collection(collection).doc(card.id).get();
    const data = doc.data();
    const name = card.type === 'lead' ? data.name : `${data.firstName||''} ${data.lastName||''}`.trim();
    const detail = data.phone || data.email || data.mobile || '';

    let html = `
      <div class="detail-backdrop" onclick="Kanban.closeDetailPanel()"></div>
      <div class="card-detail-panel" id="cardDetailPanel">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">${name}</h5>
          <div>
            <button class="btn btn-sm btn-outline-danger me-1" onclick="Kanban.deleteCard('${card.type}','${card.id}')"><i class="fas fa-trash"></i></button>
            <button class="btn btn-sm btn-outline-secondary" onclick="Kanban.closeDetailPanel()">✕</button>
          </div>
        </div>

        <!-- Status & Priority -->
        <div class="row g-2 mb-3">
          <div class="col-6">
            <label class="form-label small fw-bold">Status</label>
            <select id="detailStatus" class="form-select form-select-sm" onchange="Kanban.updateField('${card.type}','${card.id}','status',this.value)">
              ${this.stages.map(s => `<option value="${s.id}" ${data.status===s.id?'selected':''}>${s.name}</option>`).join('')}
            </select>
          </div>
          <div class="col-6">
            <label class="form-label small fw-bold">Priority</label>
            <select id="detailPriority" class="form-select form-select-sm" onchange="Kanban.updateField('${card.type}','${card.id}','priority',this.value)">
              <option value="low" ${data.priority==='low'?'selected':''}>🔵 Low</option>
              <option value="medium" ${data.priority==='medium'?'selected':''}>🟡 Medium</option>
              <option value="high" ${data.priority==='high'?'selected':''}>🔴 High</option>
            </select>
          </div>
        </div>

        <!-- Contact Info -->
        <div class="mb-3">
          <label class="form-label small fw-bold">Phone / Email</label>
          <input type="text" class="form-control form-control-sm mb-1" value="${detail}" readonly>
        </div>

        <!-- Assignee -->
        <div class="mb-3">
          <label class="form-label small fw-bold">Assigned To</label>
          <select id="detailAssignee" class="form-select form-select-sm" onchange="Kanban.updateField('${card.type}','${card.id}','assignedTo',this.value)">
            <option value="">Unassigned</option>
            ${this.users.map(u => `<option value="${u.id}" ${data.assignedTo===u.id?'selected':''}>${u.name||u.email}</option>`).join('')}
          </select>
        </div>

        <!-- Follow-up Date -->
        <div class="mb-3">
          <label class="form-label small fw-bold">📅 Follow-up Date</label>
          <input type="date" id="detailFollowup" class="form-control form-control-sm" value="${data.followupDate || ''}" onchange="Kanban.updateField('${card.type}','${card.id}','followupDate',this.value)">
        </div>

        <!-- Notes -->
        <div class="mb-3">
          <label class="form-label small fw-bold">📝 Notes</label>
          <textarea id="detailNotes" class="form-control form-control-sm" rows="4" placeholder="Add notes...">${data.notes || ''}</textarea>
          <button class="btn btn-outline-primary btn-sm mt-1" onclick="Kanban.saveNotes('${card.type}','${card.id}')">Save Notes</button>
        </div>

        <!-- URL / Sheet -->
        <div class="mb-3">
          <label class="form-label small fw-bold">🔗 URL / Google Sheet Link</label>
          <input type="url" id="detailUrl" class="form-control form-control-sm" value="${data.url || ''}" onchange="Kanban.updateField('${card.type}','${card.id}','url',this.value)">
        </div>

        <!-- Value -->
        ${card.type === 'lead' ? `
        <div class="mb-3">
          <label class="form-label small fw-bold">💰 Deal Value (₹)</label>
          <input type="number" id="detailValue" class="form-control form-control-sm" value="${data.value || ''}" onchange="Kanban.updateField('${card.type}','${card.id}','value',this.value)">
        </div>` : ''}

        <!-- Source -->
        <div class="mb-3">
          <label class="form-label small fw-bold">Source</label>
          <input type="text" class="form-control form-control-sm" value="${data.source || 'Manual'}" readonly>
        </div>

        <!-- Created -->
        <div class="mb-3">
          <label class="form-label small fw-bold">Created</label>
          <p class="small text-muted">${data.createdAt?.toDate().toLocaleString() || '-'}</p>
        </div>
      </div>
    `;

    document.getElementById('detailPanel').innerHTML = html;
  },

  async updateField(type, id, field, value) {
    const collection = type === 'lead' ? 'leads' : 'contacts';
    await db.collection(collection).doc(id).update({ [field]: value });

    // Sync status to other collection
    if (field === 'status') {
      const doc = await db.collection(collection).doc(id).get();
      const data = doc.data();
      const phone = data.phone || data.mobile || '';
      const email = data.email || '';
      if (phone || email) {
        const otherCollection = type === 'lead' ? 'contacts' : 'leads';
        const snap = await db.collection(otherCollection)
          .where(type==='lead'?'mobile':'phone', '==', phone)
          .where('email', '==', email)
          .get();
        snap.forEach(async d => { await d.ref.update({ status: value }); });
      }
    }
  },

  async saveNotes(type, id) {
    const notes = document.getElementById('detailNotes')?.value || '';
    const collection = type === 'lead' ? 'leads' : 'contacts';
    await db.collection(collection).doc(id).update({ notes });
    this.selectedCard = null;
    this.render();
  },

  // ========== DELETE CARD ==========
  async deleteCard(type, id) {
    if (!confirm('Delete permanently?')) return;
    const collection = type === 'lead' ? 'leads' : 'contacts';
    await db.collection(collection).doc(id).delete();
    this.selectedCard = null;
    this.render();
  },

  // ========== QUICK ADD (FIXED) ==========
  showQuickAdd(stage, e) {
    e.stopPropagation();
    const btn = e.target.closest('.quick-add-btn');
    if (!btn) return;
    const userOptions = this.users.map(u => `<option value="${u.id}">${u.name||u.email}</option>`).join('');
    btn.outerHTML = `
      <div class="quick-add-form" onclick="event.stopPropagation()">
        <input type="text" id="qName_${stage}" placeholder="Name" onkeydown="if(event.key==='Enter')Kanban.quickAdd('${stage}')">
        <input type="text" id="qPhone_${stage}" placeholder="Phone" onkeydown="if(event.key==='Enter')Kanban.quickAdd('${stage}')">
        <button class="btn btn-primary btn-xs" onclick="Kanban.quickAdd('${stage}')">+</button>
      </div>
    `;
    setTimeout(() => {
      const inp = document.getElementById(`qName_${stage}`);
      if (inp) inp.focus();
    }, 100);
  },

  async quickAdd(stage) {
    const nameEl = document.getElementById(`qName_${stage}`);
    const phoneEl = document.getElementById(`qPhone_${stage}`);
    const name = nameEl?.value?.trim() || '';
    const phone = phoneEl?.value?.trim() || '';
    if (!name) return alert('Name required!');
    await db.collection('leads').add({
      name, phone, status: stage, source: 'Manual', priority: 'medium',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    this.render();
  },

  // ========== ADD DEAL MODAL ==========
  showAddForm() {
    const userOptions = this.users.map(u => `<option value="${u.id}">${u.name||u.email}</option>`).join('');
    document.getElementById('kanbanModal').innerHTML = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:3100;display:flex;align-items:center;justify-content:center;" onclick="document.getElementById('kanbanModal').innerHTML=''">
        <div class="card-widget" style="width:400px;max-width:90vw;" onclick="event.stopPropagation()">
          <h5>Add New Lead</h5>
          <input type="text" id="kName" class="form-control form-control-sm mb-2" placeholder="Name *">
          <input type="text" id="kPhone" class="form-control form-control-sm mb-2" placeholder="Phone">
          <input type="email" id="kEmail" class="form-control form-control-sm mb-2" placeholder="Email">
          <div class="row g-2 mb-2">
            <div class="col-6"><input type="number" id="kValue" class="form-control form-control-sm" placeholder="Value (₹)"></div>
            <div class="col-6">
              <select id="kSource" class="form-select form-select-sm">
                <option value="Manual">Manual</option><option value="WhatsApp">WhatsApp</option>
                <option value="Facebook">Facebook</option><option value="Website">Website</option>
                <option value="Form">Form</option><option value="Campaign">Campaign</option>
                <option value="Google">Google Ads</option>
              </select>
            </div>
          </div>
          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label small">Priority</label>
              <select id="kPriority" class="form-select form-select-sm">
                <option value="medium">🟡 Medium</option><option value="high">🔴 High</option><option value="low">🔵 Low</option>
              </select>
            </div>
            <div class="col-6">
              <label class="form-label small">Follow-up</label>
              <input type="date" id="kFollowup" class="form-control form-control-sm">
            </div>
          </div>
          <div class="mb-2">
            <label class="form-label small">Assign To</label>
            <select id="kAssignee" class="form-select form-select-sm"><option value="">Unassigned</option>${userOptions}</select>
          </div>
          <button class="btn btn-primary btn-sm" onclick="Kanban.addDeal()">Save Lead</button>
          <button class="btn btn-light btn-sm" onclick="document.getElementById('kanbanModal').innerHTML=''">Cancel</button>
        </div>
      </div>
    `;
  },

  async addDeal() {
    const name = document.getElementById('kName')?.value?.trim();
    if (!name) return alert('Name required!');
    await db.collection('leads').add({
      name,
      phone: document.getElementById('kPhone')?.value?.trim() || '',
      email: document.getElementById('kEmail')?.value?.trim() || '',
      value: document.getElementById('kValue')?.value?.trim() || '',
      source: document.getElementById('kSource')?.value || 'Manual',
      priority: document.getElementById('kPriority')?.value || 'medium',
      followupDate: document.getElementById('kFollowup')?.value || '',
      assignedTo: document.getElementById('kAssignee')?.value || null,
      status: 'new',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    document.getElementById('kanbanModal').innerHTML = '';
    this.render();
  },

  // ========== HELPERS ==========
  totalValue(leads, contacts) {
    let total = 0;
    leads.forEach(l => { if (l.value) total += parseInt(l.value) || 0; });
    contacts.forEach(c => { if (c.value) total += parseInt(c.value) || 0; });
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

  async loadUsers() {
    try {
      const snap = await db.collection('users').get();
      this.users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { this.users = []; }
  }
};
