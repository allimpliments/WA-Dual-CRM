const Kanban = {
  stages: [
    { id: 'new', name: 'New Lead', color: '#6366f1', icon: 'fa-star' },
    { id: 'contacted', name: 'Contacted', color: '#8b5cf6', icon: 'fa-phone' },
    { id: 'qualified', name: 'Qualified', color: '#3b82f6', icon: 'fa-check' },
    { id: 'proposal', name: 'Proposal Sent', color: '#f59e0b', icon: 'fa-file' },
    { id: 'negotiation', name: 'Negotiation', color: '#ef4444', icon: 'fa-handshake' },
    { id: 'won', name: 'Won / Closed', color: '#10b981', icon: 'fa-trophy' },
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
        .kanban-wrap { padding: 10px; }
        .kanban-stats { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
        .kanban-stat { background: #fff; border-radius: 10px; padding: 14px 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); flex: 1; min-width: 120px; text-align: center; border-top: 3px solid var(--stat-color); }
        .kanban-stat .stat-num { font-size: 24px; font-weight: 700; }
        .kanban-stat .stat-label { font-size: 11px; color: #65676b; }
        .kanban-board { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px; }
        .kanban-col { background: #f0f2f5; border-radius: 12px; padding: 10px; min-width: 250px; flex: 1; }
        .kanban-col-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; margin-bottom: 8px; border-bottom: 3px solid var(--col-color); }
        .kanban-col-header h6 { font-size: 13px; font-weight: 600; margin: 0; }
        .kanban-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 10px; margin-bottom: 6px; cursor: grab; transition: all 0.15s; }
        .kanban-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .kanban-card.dragging { opacity: 0.4; }
        .kanban-card .card-type { font-size: 10px; text-transform: uppercase; font-weight: 600; margin-bottom: 2px; }
        .kanban-card .card-name { font-weight: 600; font-size: 13px; }
        .kanban-card .card-info { font-size: 11px; color: #65676b; }
        .kanban-card .card-actions { text-align: right; margin-top: 4px; }
        .add-card-btn { background: none; border: 1px dashed #c0c0c0; border-radius: 6px; padding: 8px; width: 100%; cursor: pointer; font-size: 11px; color: #888; }
        .add-card-btn:hover { background: #e7f3ff; border-color: #1877f2; color: #1877f2; }
        .form-inline { display: flex; gap: 4px; margin-top: 4px; }
        .form-inline input { flex: 1; padding: 4px 8px; border: 1px solid #dadde1; border-radius: 4px; font-size: 11px; }
        @media (max-width: 768px) { .kanban-board { flex-direction: column; } .kanban-col { min-width: 100%; } }
      </style>

      <div class="kanban-wrap">
        <div class="kanban-stats">
          <div class="kanban-stat" style="--stat-color:#6366f1;"><div class="stat-num">${this.leads.length + this.contacts.length}</div><div class="stat-label">Total Pipeline</div></div>
          <div class="kanban-stat" style="--stat-color:#3b82f6;"><div class="stat-num">${this.leads.filter(l => l.status === 'new').length}</div><div class="stat-label">New Leads</div></div>
          <div class="kanban-stat" style="--stat-color:#10b981;"><div class="stat-num">${this.leads.filter(l => l.status === 'won').length + this.contacts.filter(c => c.status === 'won').length}</div><div class="stat-label">Won</div></div>
          <div class="kanban-stat" style="--stat-color:#f59e0b;"><div class="stat-num">${this.leads.filter(l => ['qualified','proposal'].includes(l.status)).length}</div><div class="stat-label">Active Deals</div></div>
        </div>

        <div class="kanban-board" id="kanbanBoard">
          ${this.stages.map(stage => `
            <div class="kanban-col" data-stage="${stage.id}" style="--col-color:${stage.color};" ondragover="event.preventDefault()" ondrop="Kanban.drop(event)">
              <div class="kanban-col-header">
                <h6><i class="fas ${stage.icon} me-1" style="color:${stage.color};"></i> ${stage.name}</h6>
                <small>${this.leads.filter(l => l.status === stage.id).length + this.contacts.filter(c => c.status === stage.id).length}</small>
              </div>
              ${this.leads.filter(l => l.status === stage.id).map(lead => `
                <div class="kanban-card" draggable="true" data-id="${lead.id}" data-type="lead" ondragstart="Kanban.drag(event)" ondragend="Kanban.dragEnd(event)">
                  <div class="card-type text-primary">LEAD</div>
                  <div class="card-name">${lead.name}</div>
                  <div class="card-info">${lead.phone || lead.email || 'No contact'}</div>
                  <div class="card-info">Source: ${lead.source || 'Unknown'}</div>
                  <div class="card-actions">
                    <button class="btn btn-sm btn-outline-danger" style="font-size:10px;padding:1px 6px;" onclick="event.stopPropagation();Kanban.deleteItem('leads','${lead.id}')">×</button>
                  </div>
                </div>
              `).join('')}
              ${this.contacts.filter(c => c.status === stage.id).map(contact => `
                <div class="kanban-card" draggable="true" data-id="${contact.id}" data-type="contact" ondragstart="Kanban.drag(event)" ondragend="Kanban.dragEnd(event)">
                  <div class="card-type text-success">CONTACT</div>
                  <div class="card-name">${contact.firstName || ''} ${contact.lastName || ''}</div>
                  <div class="card-info">${contact.mobile || contact.email || 'No contact'}</div>
                  <div class="card-info">Group: ${contact.group || '-'}</div>
                  <div class="card-actions">
                    <button class="btn btn-sm btn-outline-danger" style="font-size:10px;padding:1px 6px;" onclick="event.stopPropagation();Kanban.deleteItem('contacts','${contact.id}')">×</button>
                  </div>
                </div>
              `).join('')}
              <div class="add-card-btn" onclick="Kanban.showQuickAdd('${stage.id}')">+ Add Lead</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
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
    const card = e.target.closest('.kanban-card');
    this.draggedId = card.dataset.id;
    this.draggedType = card.dataset.type;
    card.classList.add('dragging');
  },

  dragEnd(e) {
    e.target.closest('.kanban-card')?.classList.remove('dragging');
  },

  async drop(e) {
    const stage = e.target.closest('.kanban-col')?.dataset.stage;
    if (stage && this.draggedId && this.draggedType) {
      await db.collection(this.draggedType === 'lead' ? 'leads' : 'contacts').doc(this.draggedId).update({ status: stage });
      this.render();
    }
  },

  showQuickAdd(stage) {
    // Find the add button and replace with inline form
    const btn = event.target;
    btn.outerHTML = `
      <div class="form-inline">
        <input type="text" id="quickLeadName" placeholder="Name" onkeydown="if(event.key==='Enter')Kanban.quickAdd('${stage}')">
        <input type="text" id="quickLeadPhone" placeholder="Phone" onkeydown="if(event.key==='Enter')Kanban.quickAdd('${stage}')">
        <button class="btn btn-sm btn-primary" onclick="Kanban.quickAdd('${stage}')" style="font-size:10px;">Save</button>
      </div>
    `;
  },

  async quickAdd(stage) {
    const name = document.getElementById('quickLeadName').value.trim();
    const phone = document.getElementById('quickLeadPhone').value.trim();
    if (!name) return alert('Name required!');
    await db.collection('leads').add({
      name, phone, status: stage, source: 'Manual',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    this.render();
  },

  async deleteItem(collection, id) {
    if (!confirm('Remove from pipeline?')) return;
    await db.collection(collection).doc(id).delete();
    this.render();
  }
};
