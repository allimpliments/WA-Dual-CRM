const Kanban = {
  stages: [
    { id: 'lead', name: 'Lead', color: '#6366f1' },
    { id: 'contacted', name: 'Contacted', color: '#8b5cf6' },
    { id: 'qualified', name: 'Qualified', color: '#3b82f6' },
    { id: 'proposal', name: 'Proposal', color: '#f59e0b' },
    { id: 'negotiation', name: 'Negotiation', color: '#ef4444' },
    { id: 'won', name: 'Won', color: '#10b981' },
    { id: 'lost', name: 'Lost', color: '#6b7280' },
  ],
  deals: [],
  draggedDeal: null,

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading Pipeline...</p>';
    await this.loadDeals();

    let html = `
      <style>
        .pipeline-container { padding: 10px; overflow-x: auto; }
        .pipeline-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .pipeline-header h4 { font-weight: 700; margin: 0; }
        .pipeline-stats { display: flex; gap: 16px; }
        .stat-card { background: #fff; border-radius: 10px; padding: 14px 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); text-align: center; min-width: 100px; }
        .stat-card .stat-value { font-size: 22px; font-weight: 700; }
        .stat-card .stat-label { font-size: 11px; color: #65676b; }
        .pipeline-board { display: flex; gap: 12px; min-width: max-content; }
        .pipeline-col { background: #f0f2f5; border-radius: 12px; padding: 12px; min-width: 240px; max-width: 280px; flex: 1; }
        .pipeline-col-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid var(--col-color); }
        .pipeline-col-header h6 { font-size: 13px; font-weight: 600; margin: 0; }
        .pipeline-col-count { font-size: 12px; color: #65676b; }
        .deal-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 10px; padding: 12px; margin-bottom: 8px; cursor: grab; transition: all 0.15s; position: relative; }
        .deal-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-1px); }
        .deal-card.dragging { opacity: 0.5; transform: rotate(2deg); }
        .deal-card .deal-title { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
        .deal-card .deal-company { font-size: 12px; color: #65676b; }
        .deal-card .deal-value { font-size: 15px; font-weight: 700; margin-top: 4px; }
        .deal-card .deal-meta { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
        .deal-card .deal-avatar { width: 26px; height: 26px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; }
        .deal-card .deal-actions { position: absolute; top: 6px; right: 6px; opacity: 0; transition: opacity 0.15s; }
        .deal-card:hover .deal-actions { opacity: 1; }
        .add-deal-btn { background: none; border: 1px dashed #dadde1; border-radius: 8px; padding: 10px; width: 100%; cursor: pointer; color: #65676b; font-size: 12px; text-align: center; }
        .add-deal-btn:hover { background: #e7f3ff; border-color: #1877f2; color: #1877f2; }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 3000; display: flex; align-items: center; justify-content: center; }
        .modal-card { background: #fff; border-radius: 14px; padding: 24px; width: 440px; max-width: 90vw; max-height: 80vh; overflow-y: auto; }
        @media (max-width: 768px) { .pipeline-board { flex-direction: column; } .pipeline-col { max-width: 100%; } }
      </style>

      <div class="pipeline-container">
        <div class="pipeline-header">
          <h4><i class="fas fa-funnel-dollar me-2"></i>Sales Pipeline</h4>
          <div class="pipeline-stats">
            <div class="stat-card"><div class="stat-value text-primary">${this.deals.length}</div><div class="stat-label">Total Deals</div></div>
            <div class="stat-card"><div class="stat-value text-success">₹${this.totalValue()}</div><div class="stat-label">Pipeline Value</div></div>
            <div class="stat-card"><div class="stat-value text-warning">${this.deals.filter(d => d.stage === 'won').length}</div><div class="stat-label">Won</div></div>
          </div>
        </div>

        <div class="pipeline-board" id="pipelineBoard">
          ${this.stages.map(stage => `
            <div class="pipeline-col" data-stage="${stage.id}" style="--col-color:${stage.color};" ondragover="event.preventDefault()" ondrop="Kanban.drop(event)">
              <div class="pipeline-col-header">
                <h6><span style="color:${stage.color};">●</span> ${stage.name}</h6>
                <span class="pipeline-col-count">${this.deals.filter(d => d.stage === stage.id).length}</span>
              </div>
              ${this.deals.filter(d => d.stage === stage.id).map(deal => `
                <div class="deal-card" draggable="true" data-id="${deal.id}" ondragstart="Kanban.drag(event)" ondragend="Kanban.dragEnd(event)">
                  <div class="deal-actions">
                    <button class="btn btn-sm btn-outline-danger" style="font-size:10px;padding:2px 6px;" onclick="event.stopPropagation();Kanban.deleteDeal('${deal.id}')">×</button>
                  </div>
                  <div class="deal-title">${deal.title}</div>
                  <div class="deal-company">${deal.company || 'No Company'}</div>
                  <div class="deal-value">₹${deal.value || 0}</div>
                  <div class="deal-meta">
                    <small class="text-muted">${deal.contact || '-'}</small>
                    <div class="deal-avatar">${(deal.contact || 'U')[0].toUpperCase()}</div>
                  </div>
                </div>
              `).join('')}
              <div class="add-deal-btn" onclick="Kanban.showAddForm('${stage.id}')">+ Add Deal</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div id="dealModal"></div>
    `;
    contentArea.innerHTML = html;
  },

  totalValue() {
    return this.deals.reduce((sum, d) => sum + (parseInt(d.value) || 0), 0).toLocaleString();
  },

  async loadDeals() {
    try {
      const snap = await db.collection('deals').orderBy('createdAt', 'desc').get();
      this.deals = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { this.deals = []; }
  },

  drag(e) {
    this.draggedDeal = e.target.closest('.deal-card').dataset.id;
    e.target.closest('.deal-card').classList.add('dragging');
  },

  dragEnd(e) {
    e.target.closest('.deal-card')?.classList.remove('dragging');
  },

  async drop(e) {
    const stage = e.target.closest('.pipeline-col')?.dataset.stage;
    if (stage && this.draggedDeal) {
      await db.collection('deals').doc(this.draggedDeal).update({ stage });
      this.render();
    }
  },

  showAddForm(stage) {
    document.getElementById('dealModal').innerHTML = `
      <div class="modal-overlay" onclick="document.getElementById('dealModal').innerHTML=''">
        <div class="modal-card" onclick="event.stopPropagation()">
          <h5>Add New Deal</h5>
          <div class="mb-3"><label class="form-label small">Deal Title *</label><input type="text" id="dealTitle" class="form-control form-control-sm" placeholder="e.g. Website Redesign"></div>
          <div class="mb-3"><label class="form-label small">Company</label><input type="text" id="dealCompany" class="form-control form-control-sm" placeholder="Company name"></div>
          <div class="row g-2 mb-3">
            <div class="col-6"><label class="form-label small">Value (₹)</label><input type="number" id="dealValue" class="form-control form-control-sm" placeholder="50000"></div>
            <div class="col-6"><label class="form-label small">Contact</label><input type="text" id="dealContact" class="form-control form-control-sm" placeholder="Contact person"></div>
          </div>
          <div class="mb-3"><label class="form-label small">Stage</label><select id="dealStage" class="form-select form-select-sm">
            ${this.stages.map(s => `<option value="${s.id}" ${s.id === stage ? 'selected' : ''}>${s.name}</option>`).join('')}
          </select></div>
          <button class="btn btn-primary btn-sm" onclick="Kanban.addDeal()">Save Deal</button>
          <button class="btn btn-light btn-sm" onclick="document.getElementById('dealModal').innerHTML=''">Cancel</button>
        </div>
      </div>
    `;
  },

  async addDeal() {
    const title = document.getElementById('dealTitle').value.trim();
    if (!title) return alert('Title required!');
    await db.collection('deals').add({
      title,
      company: document.getElementById('dealCompany').value.trim(),
      value: document.getElementById('dealValue').value.trim(),
      contact: document.getElementById('dealContact').value.trim(),
      stage: document.getElementById('dealStage').value,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    document.getElementById('dealModal').innerHTML = '';
    this.render();
  },

  async deleteDeal(id) {
    if (!confirm('Delete this deal?')) return;
    await db.collection('deals').doc(id).delete();
    this.render();
  }
};
