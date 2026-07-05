// js/tickets.js — Advanced Helpdesk Ticket System
const Tickets = {
  currentView: 'all', // all, open, pending, resolved, closed
  currentTicket: null,
  searchQuery: '',

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = 'var(--bg-primary, #f0f2f5)';

    if (this.currentTicket) { await this.renderTicketDetail(this.currentTicket); return; }

    let tickets = [];
    try {
      let query = db.collection('tickets').orderBy('createdAt', 'desc');
      if (this.currentView === 'open') query = query.where('status', '==', 'open');
      if (this.currentView === 'pending') query = query.where('status', '==', 'pending');
      if (this.currentView === 'resolved') query = query.where('status', '==', 'resolved');
      if (this.currentView === 'closed') query = query.where('status', '==', 'closed');
      const snap = await query.get();
      tickets = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        tickets = tickets.filter(t => (t.subject||'').toLowerCase().includes(q) || (t.customerName||'').toLowerCase().includes(q));
      }
    } catch(e) { console.error(e); }

    const counts = { all: tickets.length, open: tickets.filter(t=>t.status==='open').length, pending: tickets.filter(t=>t.status==='pending').length, resolved: tickets.filter(t=>t.status==='resolved').length };

    let html = `
      <style>
        .tk-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;cursor:pointer;transition:0.2s;margin-bottom:8px;}
        .tk-card:hover{border-color:#3b82f6;box-shadow:0 4px 12px rgba(0,0,0,0.04);}
        .tk-priority{width:4px;border-radius:2px;margin-right:12px;flex-shrink:0;}
        .tk-priority.urgent{background:#dc2626;}.tk-priority.high{background:#f59e0b;}.tk-priority.medium{background:#3b82f6;}.tk-priority.low{background:#6b7280;}
        .tk-status{display:inline-block;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:600;}
        .tk-status.open{background:#d1fae5;color:#065f46;}.tk-status.pending{background:#fef3c7;color:#92400e;}.tk-status.resolved{background:#e0e7ff;color:#3730a3;}.tk-status.closed{background:#f3f4f6;color:#6b7280;}
        .tk-tab{display:inline-block;padding:8px 16px;border-radius:8px;font-size:12px;cursor:pointer;margin:2px;border:1px solid #e5e7eb;background:#fff;transition:0.2s;}
        .tk-tab:hover,.tk-tab.active{background:#3b82f6;color:#fff;border-color:#3b82f6;}
        .tk-detail{background:#fff;border-radius:14px;padding:24px;border:1px solid #e5e7eb;}
        .tk-reply{background:#f9fafb;border-radius:10px;padding:14px;margin-bottom:10px;}
        .tk-reply.customer{border-left:3px solid #3b82f6;}
        .tk-reply.agent{border-left:3px solid #10b981;}
        .tk-badge-count{background:#3b82f6;color:#fff;border-radius:10px;padding:1px 8px;font-size:10px;margin-left:4px;}
      </style>

      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 style="font-weight:700;"><i class="fas fa-ticket-alt text-warning me-2"></i>Support Tickets</h4>
        <button class="btn btn-primary btn-sm" onclick="Tickets.showCreateForm()"><i class="fas fa-plus me-1"></i> New Ticket</button>
      </div>

      <div class="d-flex gap-2 mb-3 flex-wrap align-items-center">
        ${['all','open','pending','resolved','closed'].map(v => `
          <span class="tk-tab ${this.currentView===v?'active':''}" onclick="Tickets.currentView='${v}';Tickets.render();">${v.charAt(0).toUpperCase()+v.slice(1)}<span class="tk-badge-count">${counts[v]||0}</span></span>
        `).join('')}
        <input type="text" class="form-control form-control-sm ms-auto" style="width:200px;" placeholder="Search tickets..." id="tkSearch" value="${this.searchQuery}" onkeyup="Tickets.searchQuery=this.value;Tickets.render();">
      </div>

      <div id="tkForm"></div>

      ${tickets.length === 0 ? '<div class="text-center py-4 text-muted">No tickets found.</div>' : tickets.map(t => `
        <div class="tk-card d-flex" onclick="Tickets.currentTicket='${t.id}';Tickets.render();">
          <div class="tk-priority ${t.priority||'medium'}"></div>
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 style="font-weight:600;margin:0;">${t.subject||'No Subject'}</h6>
                <small class="text-muted">${t.customerName||'Unknown'} · ${t.email||''}</small>
              </div>
              <span class="tk-status ${t.status||'open'}">${t.status||'open'}</span>
            </div>
            <p style="font-size:11px;color:#6b7280;margin:4px 0;">${(t.description||'').substring(0,100)}...</p>
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted"><i class="far fa-clock me-1"></i>${t.createdAt?.toDate().toLocaleString()||''}</small>
              ${t.assignedTo ? `<small class="text-muted"><i class="fas fa-user me-1"></i>${t.assignedName||'Agent'}</small>` : '<small class="text-warning">Unassigned</small>'}
            </div>
          </div>
        </div>
      `).join('')}
    `;
    contentArea.innerHTML = html;
  },

  showCreateForm() {
    document.getElementById('tkForm').innerHTML = `
      <div class="tk-detail mb-3">
        <h6>Create New Ticket</h6>
        <div class="row g-2">
          <div class="col-md-6"><input id="tkSubject" class="form-control form-control-sm" placeholder="Subject *"></div>
          <div class="col-md-3"><input id="tkCustomer" class="form-control form-control-sm" placeholder="Customer Name"></div>
          <div class="col-md-3"><input id="tkEmail" class="form-control form-control-sm" placeholder="Email"></div>
          <div class="col-md-3">
            <select id="tkPriority" class="form-select form-select-sm"><option value="medium">Medium</option><option value="low">Low</option><option value="high">High</option><option value="urgent">Urgent</option></select>
          </div>
          <div class="col-md-3">
            <select id="tkCategory" class="form-select form-select-sm"><option>General</option><option>Technical</option><option>Billing</option><option>Feature Request</option><option>Bug Report</option></select>
          </div>
          <div class="col-12"><textarea id="tkDesc" class="form-control form-control-sm" rows="3" placeholder="Description"></textarea></div>
        </div>
        <button class="btn btn-success btn-sm mt-2" onclick="Tickets.createTicket()">Create Ticket</button>
        <button class="btn btn-light btn-sm mt-2" onclick="document.getElementById('tkForm').innerHTML=''">Cancel</button>
      </div>
    `;
  },

  async createTicket() {
    const subject = document.getElementById('tkSubject').value.trim();
    if (!subject) return alert('Subject required!');
    await db.collection('tickets').add({
      subject,
      customerName: document.getElementById('tkCustomer').value.trim(),
      email: document.getElementById('tkEmail').value.trim(),
      priority: document.getElementById('tkPriority').value,
      category: document.getElementById('tkCategory').value,
      description: document.getElementById('tkDesc').value.trim(),
      status: 'open',
      replies: [],
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    document.getElementById('tkForm').innerHTML = '';
    this.render();
  },

  async renderTicketDetail(id) {
    const doc = await db.collection('tickets').doc(id).get();
    if (!doc.exists) { this.currentTicket = null; this.render(); return; }
    const t = doc.data();
    const replies = t.replies || [];

    let html = `
      <button class="btn btn-outline-secondary btn-sm mb-3" onclick="Tickets.currentTicket=null;Tickets.render();"><i class="fas fa-arrow-left me-1"></i> Back</button>
      <div class="tk-detail">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 style="font-weight:700;">${t.subject}</h5>
            <span class="tk-status ${t.status}">${t.status}</span>
            <span class="badge bg-light text-dark ms-1">${t.priority||'medium'}</span>
            <span class="badge bg-light text-dark ms-1">${t.category||'General'}</span>
          </div>
          <div class="d-flex gap-1">
            <select class="form-select form-select-sm" style="width:auto;" onchange="Tickets.updateStatus('${id}',this.value)">
              <option value="open" ${t.status==='open'?'selected':''}>Open</option>
              <option value="pending" ${t.status==='pending'?'selected':''}>Pending</option>
              <option value="resolved" ${t.status==='resolved'?'selected':''}>Resolved</option>
              <option value="closed" ${t.status==='closed'?'selected':''}>Closed</option>
            </select>
          </div>
        </div>
        <p><strong>Customer:</strong> ${t.customerName||'N/A'} · ${t.email||''}</p>
        <p style="color:#6b7280;">${t.description||'No description'}</p>
        <small class="text-muted">Created: ${t.createdAt?.toDate().toLocaleString()||''}</small>

        <hr>
        <h6>Replies (${replies.length})</h6>
        ${replies.map(r => `
          <div class="tk-reply ${r.type||'agent'}">
            <div class="d-flex justify-content-between"><strong>${r.author||'Agent'}</strong><small class="text-muted">${r.time||''}</small></div>
            <p style="margin:4px 0;font-size:13px;">${r.message}</p>
          </div>
        `).join('')}

        <div class="mt-3">
          <textarea id="tkReply" class="form-control form-control-sm" rows="3" placeholder="Type your reply..."></textarea>
          <button class="btn btn-primary btn-sm mt-2" onclick="Tickets.addReply('${id}')"><i class="fas fa-paper-plane me-1"></i> Send Reply</button>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  async addReply(id) {
    const msg = document.getElementById('tkReply').value.trim();
    if (!msg) return alert('Type a reply!');
    const doc = await db.collection('tickets').doc(id).get();
    const replies = doc.data().replies || [];
    replies.push({ author: 'Agent', message: msg, type: 'agent', time: new Date().toLocaleString() });
    await db.collection('tickets').doc(id).update({ replies, status: 'pending' });
    this.renderTicketDetail(id);
  },

  async updateStatus(id, status) {
    await db.collection('tickets').doc(id).update({ status });
    this.renderTicketDetail(id);
  }
};
