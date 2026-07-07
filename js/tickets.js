// js/tickets.js — Enterprise-Grade Helpdesk Ticket System with Full clientId Isolation
const Tickets = {
  currentView: 'all',
  currentTicket: null,
  searchQuery: '',
  filterPriority: 'all',
  filterCategory: 'all',
  filterAssignee: 'all',
  sortBy: 'recent',

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = '#f8fafc';

    if (this.currentTicket) { await this.renderTicketDetail(this.currentTicket); return; }

    let tickets = [];
    let stats = { total: 0, open: 0, pending: 0, resolved: 0, closed: 0, urgent: 0 };
    let agents = [];

    try {
      // ✅ clientId ISOLATION
      let query = db.collection('tickets');
      if (shouldFilterByClient()) query = query.where('clientId', '==', window.currentUser.clientId);
      
      if (this.currentView === 'open') query = query.where('status', '==', 'open');
      else if (this.currentView === 'pending') query = query.where('status', '==', 'pending');
      else if (this.currentView === 'resolved') query = query.where('status', '==', 'resolved');
      else if (this.currentView === 'closed') query = query.where('status', '==', 'closed');
      
      const snap = await query.orderBy('createdAt', 'desc').get();
      tickets = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Stats
      stats.total = tickets.length;
      tickets.forEach(t => {
        if (t.status === 'open') stats.open++;
        if (t.status === 'pending') stats.pending++;
        if (t.status === 'resolved') stats.resolved++;
        if (t.status === 'closed') stats.closed++;
        if (t.priority === 'urgent') stats.urgent++;
      });

      // Client-side filters
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        tickets = tickets.filter(t => 
          (t.subject||'').toLowerCase().includes(q) || 
          (t.customerName||'').toLowerCase().includes(q) ||
          (t.email||'').toLowerCase().includes(q) ||
          (t.ticketId||'').toLowerCase().includes(q)
        );
      }
      if (this.filterPriority !== 'all') tickets = tickets.filter(t => t.priority === this.filterPriority);
      if (this.filterCategory !== 'all') tickets = tickets.filter(t => t.category === this.filterCategory);
      if (this.filterAssignee !== 'all') tickets = tickets.filter(t => t.assignedTo === this.filterAssignee);

      // Sort
      if (this.sortBy === 'oldest') tickets.reverse();
      else if (this.sortBy === 'priority') {
        const order = { urgent: 0, high: 1, medium: 2, low: 3 };
        tickets.sort((a,b) => (order[a.priority]||2) - (order[b.priority]||2));
      }

      // Load agents for assignee filter
      let aQuery = db.collection('users');
      if (shouldFilterByClient()) aQuery = aQuery.where('clientId', '==', window.currentUser.clientId);
      const agentSnap = await aQuery.get();
      agents = agentSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { console.error(e); }

    const priorities = [...new Set(tickets.map(t => t.priority).filter(Boolean))];
    const categories = [...new Set(tickets.map(t => t.category).filter(Boolean))];

    let html = `
      <style>
        .tickets-wrap { max-width: 1400px; margin: 0 auto; }
        .tickets-header { background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 20px; padding: 28px 32px; margin-bottom: 24px; color: #fff; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .tickets-header h4 { margin: 0; font-weight: 800; font-size: 22px; }
        .tickets-header p { margin: 4px 0 0; color: #94a3b8; font-size: 13px; }
        .tk-stat { background: #fff; border-radius: 14px; padding: 18px 20px; text-align: center; border: 1px solid #f1f5f9; cursor: pointer; transition: 0.2s; }
        .tk-stat:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .tk-stat .val { font-size: 26px; font-weight: 800; }
        .tk-stat .lbl { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
        .tk-stat.active { border-color: #6366f1; background: #eef2ff; }
        .tk-card { background: #fff; border-radius: 14px; padding: 18px 20px; border: 1px solid #f1f5f9; transition: 0.2s; cursor: pointer; display: flex; gap: 14px; margin-bottom: 8px; }
        .tk-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); border-color: #6366f1; }
        .tk-priority-bar { width: 4px; border-radius: 4px; flex-shrink: 0; }
        .tk-priority-bar.urgent { background: #ef4444; }
        .tk-priority-bar.high { background: #f59e0b; }
        .tk-priority-bar.medium { background: #3b82f6; }
        .tk-priority-bar.low { background: #94a3b8; }
        .tk-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; }
        .tk-filters { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
        .tk-search { padding: 8px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13px; width: 220px; outline: none; }
        .tk-search:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .tk-filter-select { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 12px; outline: none; cursor: pointer; background: #fff; }
        .tk-detail-card { background: #fff; border-radius: 16px; padding: 28px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .tk-reply { background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 10px; }
        .tk-reply.customer { border-left: 4px solid #6366f1; }
        .tk-reply.agent { border-left: 4px solid #10b981; }
        .tk-reply.system { border-left: 4px solid #f59e0b; background: #fffbeb; }
        .tk-btn { padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .tk-btn-primary { background: #6366f1; color: #fff; }
        .tk-btn-primary:hover { background: #4f46e5; }
        .tk-btn-outline { background: #fff; color: #6366f1; border: 1px solid #6366f1; }
        .tk-btn-outline:hover { background: #eef2ff; }
        .tk-btn-success { background: #10b981; color: #fff; }
        .tk-btn-success:hover { background: #059669; }
        .tk-btn-danger { background: #ef4444; color: #fff; }
        .tk-btn-danger:hover { background: #dc2626; }
        .tk-input { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13px; outline: none; margin-bottom: 8px; }
        .tk-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .tk-textarea { resize: vertical; min-height: 80px; }
        .tk-meta-row { display: flex; gap: 16px; flex-wrap: wrap; font-size: 12px; color: #64748b; margin-bottom: 12px; }
        .tk-meta-item { display: flex; align-items: center; gap: 4px; }
        @media (max-width: 768px) { .tickets-header { padding: 20px; } }
      </style>

      <div class="tickets-wrap">
        <div class="tickets-header">
          <div>
            <h4><i class="fas fa-ticket-alt me-2"></i>Support Tickets</h4>
            <p>Manage customer support requests and track resolutions</p>
          </div>
          <div class="d-flex gap-3">
            <div class="text-center"><div style="font-size:22px;font-weight:800;">${stats.total}</div><small style="color:#94a3b8;">Total</small></div>
            <div class="text-center"><div style="font-size:22px;font-weight:800;color:#ef4444;">${stats.open}</div><small style="color:#94a3b8;">Open</small></div>
            <div class="text-center"><div style="font-size:22px;font-weight:800;color:#ef4444;">${stats.urgent}</div><small style="color:#94a3b8;">Urgent</small></div>
          </div>
        </div>

        <!-- Stats Row -->
        <div class="row g-3 mb-4">
          ${[
            {key:'all',label:'All Tickets',val:stats.total,color:'#6366f1'},
            {key:'open',label:'Open',val:stats.open,color:'#ef4444'},
            {key:'pending',label:'Pending',val:stats.pending,color:'#f59e0b'},
            {key:'resolved',label:'Resolved',val:stats.resolved,color:'#10b981'},
            {key:'closed',label:'Closed',val:stats.closed,color:'#94a3b8'}
          ].map(s => `
            <div class="col-6 col-md"><div class="tk-stat ${this.currentView===s.key?'active':''}" onclick="Tickets.currentView='${s.key}';Tickets.render();"><div class="val" style="color:${s.color};">${s.val}</div><div class="lbl">${s.label}</div></div></div>
          `).join('')}
        </div>

        <!-- Filters -->
        <div class="tk-filters">
          <input type="text" class="tk-search" placeholder="🔍 Search tickets..." id="tkSearch" value="${this.searchQuery}" oninput="Tickets.searchQuery=this.value;Tickets.render();">
          <select class="tk-filter-select" onchange="Tickets.filterPriority=this.value;Tickets.render();"><option value="all">All Priority</option>${['urgent','high','medium','low'].map(p=>`<option value="${p}" ${this.filterPriority===p?'selected':''}>${p.charAt(0).toUpperCase()+p.slice(1)}</option>`).join('')}</select>
          <select class="tk-filter-select" onchange="Tickets.filterCategory=this.value;Tickets.render();"><option value="all">All Categories</option>${categories.map(c=>`<option value="${c}" ${this.filterCategory===c?'selected':''}>${c}</option>`).join('')}</select>
          <select class="tk-filter-select" onchange="Tickets.filterAssignee=this.value;Tickets.render();"><option value="all">All Agents</option>${agents.map(a=>`<option value="${a.id}" ${this.filterAssignee===a.id?'selected':''}>${a.name||a.email}</option>`).join('')}</select>
          <select class="tk-filter-select" onchange="Tickets.sortBy=this.value;Tickets.render();"><option value="recent">Newest</option><option value="oldest" ${this.sortBy==='oldest'?'selected':''}>Oldest</option><option value="priority" ${this.sortBy==='priority'?'selected':''}>Priority</option></select>
          <button class="tk-btn tk-btn-primary" style="margin-left:auto;" onclick="Tickets.showCreateForm()"><i class="fas fa-plus"></i> New Ticket</button>
        </div>

        <!-- Ticket List -->
        <div id="tkForm"></div>
        ${tickets.length === 0 ? `<div class="text-center py-5"><i class="fas fa-ticket-alt fa-3x text-muted mb-3" style="opacity:0.3;"></i><h5 style="font-weight:700;">No Tickets Found</h5><p class="text-muted">${this.searchQuery||this.filterPriority!=='all'?'No tickets match your filters.':'All clear! No support tickets yet.'}</p></div>` : tickets.map(t => `
          <div class="tk-card" onclick="Tickets.currentTicket='${t.id}';Tickets.render();">
            <div class="tk-priority-bar ${t.priority||'medium'}"></div>
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h6 style="font-weight:700;margin:0;color:#0f172a;">${t.subject||'No Subject'}</h6>
                  <div style="font-size:12px;color:#64748b;margin-top:2px;">#${t.ticketId||t.id.substring(0,8)} · ${t.customerName||'Unknown'} · ${t.email||''}</div>
                </div>
                <div class="d-flex gap-1 align-items-center">
                  <span class="tk-badge" style="background:${t.priority==='urgent'?'#fef2f2':t.priority==='high'?'#fffbeb':t.priority==='low'?'#f1f5f9':'#eef2ff'};color:${t.priority==='urgent'?'#ef4444':t.priority==='high'?'#f59e0b':t.priority==='low'?'#94a3b8':'#6366f1'};">${t.priority||'medium'}</span>
                  <span class="tk-badge" style="background:${t.status==='open'?'#fef2f2':t.status==='pending'?'#fffbeb':t.status==='resolved'?'#ecfdf5':'#f1f5f9'};color:${t.status==='open'?'#ef4444':t.status==='pending'?'#f59e0b':t.status==='resolved'?'#10b981':'#94a3b8'};">${t.status||'open'}</span>
                </div>
              </div>
              <p style="font-size:12px;color:#94a3b8;margin:4px 0;">${(t.description||'').substring(0,120)}${(t.description||'').length>120?'...':''}</p>
              <div class="d-flex justify-content-between align-items-center" style="font-size:11px;color:#94a3b8;">
                <span><i class="far fa-clock me-1"></i>${t.createdAt?.toDate().toLocaleString()||''}</span>
                <span>${t.assignedTo ? '<i class="fas fa-user-check me-1" style="color:#10b981;"></i>'+ (t.assignedName||'Assigned') : '<i class="fas fa-user-clock me-1" style="color:#f59e0b;"></i>Unassigned'}</span>
                <span><i class="fas fa-reply me-1"></i>${(t.replies||[]).length} replies</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    contentArea.innerHTML = html;
  },

  // ==================== CREATE TICKET ====================
  showCreateForm() {
    document.getElementById('tkForm').innerHTML = `
      <div class="tk-detail-card mb-3" style="border:2px solid #6366f1;">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 style="font-weight:700;margin:0;">📝 Create New Ticket</h5>
          <button class="tk-btn tk-btn-outline" onclick="document.getElementById('tkForm').innerHTML=''">✕</button>
        </div>
        <div class="row g-2">
          <div class="col-md-8"><label class="small fw-bold">Subject *</label><input type="text" id="tkSubject" class="tk-input" placeholder="Brief summary of the issue"></div>
          <div class="col-md-4"><label class="small fw-bold">Ticket ID</label><input type="text" id="tkTicketId" class="tk-input" placeholder="Auto-generated" readonly style="background:#f8fafc;"></div>
          <div class="col-md-6"><label class="small fw-bold">Customer Name *</label><input type="text" id="tkCustomer" class="tk-input" placeholder="Full name"></div>
          <div class="col-md-6"><label class="small fw-bold">Email</label><input type="email" id="tkEmail" class="tk-input" placeholder="customer@example.com"></div>
          <div class="col-md-3"><label class="small fw-bold">Priority</label><select id="tkPriority" class="tk-input"><option value="medium">Medium</option><option value="low">Low</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
          <div class="col-md-3"><label class="small fw-bold">Category</label><select id="tkCategory" class="tk-input"><option>General</option><option>Technical</option><option>Billing</option><option>Feature Request</option><option>Bug Report</option><option>Account</option><option>Other</option></select></div>
          <div class="col-md-3"><label class="small fw-bold">Assign To</label><select id="tkAssignee" class="tk-input"><option value="">Unassigned</option></select></div>
          <div class="col-md-3"><label class="small fw-bold">Status</label><select id="tkStatus" class="tk-input"><option value="open">Open</option><option value="pending">Pending</option></select></div>
          <div class="col-12"><label class="small fw-bold">Description</label><textarea id="tkDesc" class="tk-input tk-textarea" placeholder="Detailed description of the issue..."></textarea></div>
        </div>
        <div class="d-flex gap-2 mt-3">
          <button class="tk-btn tk-btn-primary" onclick="Tickets.createTicket()"><i class="fas fa-save"></i> Create Ticket</button>
          <button class="tk-btn tk-btn-outline" onclick="document.getElementById('tkForm').innerHTML=''">Cancel</button>
        </div>
      </div>`;
    
    // Load agents for dropdown
    (async () => {
      let q = db.collection('users');
      if (shouldFilterByClient()) q = q.where('clientId', '==', window.currentUser.clientId);
      const snap = await q.get();
      const sel = document.getElementById('tkAssignee');
      if (sel) snap.forEach(d => { const u=d.data(); const o=document.createElement('option'); o.value=d.id; o.textContent=u.name||u.email; sel.appendChild(o); });
    })();

    // Auto-generate ticket ID
    const tidEl = document.getElementById('tkTicketId');
    if (tidEl) tidEl.value = 'TK-' + Date.now().toString(36).toUpperCase();
  },

  async createTicket() {
    const subject = document.getElementById('tkSubject')?.value?.trim();
    const customerName = document.getElementById('tkCustomer')?.value?.trim();
    if (!subject || !customerName) return showToast('Subject and Customer Name are required!', 'warning');
    
    const assignedTo = document.getElementById('tkAssignee')?.value || null;
    let assignedName = 'Unassigned';
    if (assignedTo) {
      try { const d = await db.collection('users').doc(assignedTo).get(); if (d.exists) assignedName = d.data().name || 'Agent'; } catch(e) {}
    }

    const data = {
      ticketId: document.getElementById('tkTicketId')?.value || ('TK-'+Date.now().toString(36).toUpperCase()),
      subject, customerName,
      email: document.getElementById('tkEmail')?.value?.trim() || '',
      priority: document.getElementById('tkPriority')?.value || 'medium',
      category: document.getElementById('tkCategory')?.value || 'General',
      description: document.getElementById('tkDesc')?.value?.trim() || '',
      status: document.getElementById('tkStatus')?.value || 'open',
      assignedTo, assignedName,
      replies: [],
      clientId: getCurrentClientId(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    try {
      await db.collection('tickets').add(data);
      document.getElementById('tkForm').innerHTML = '';
      showToast('✅ Ticket created!', 'success');
      this.render();
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
  },

  // ==================== TICKET DETAIL ====================
  async renderTicketDetail(id) {
    const doc = await db.collection('tickets').doc(id).get();
    if (!doc.exists) { this.currentTicket = null; this.render(); return; }
    const t = doc.data();
    const replies = t.replies || [];

    let html = `
      <div class="tickets-wrap">
        <button class="tk-btn tk-btn-outline mb-3" onclick="Tickets.currentTicket=null;Tickets.render();"><i class="fas fa-arrow-left me-1"></i> Back to Tickets</button>
        <div class="tk-detail-card">
          <div class="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
            <div>
              <h5 style="font-weight:800;margin:0;">${t.subject}</h5>
              <div class="tk-meta-row mt-2">
                <span class="tk-meta-item"><i class="fas fa-hashtag"></i> ${t.ticketId||id.substring(0,8)}</span>
                <span class="tk-meta-item"><i class="fas fa-user"></i> ${t.customerName||'N/A'}</span>
                <span class="tk-meta-item"><i class="fas fa-envelope"></i> ${t.email||'N/A'}</span>
                <span class="tk-meta-item"><i class="far fa-clock"></i> ${t.createdAt?.toDate().toLocaleString()||''}</span>
              </div>
            </div>
            <div class="d-flex gap-2 align-items-center">
              <span class="tk-badge" style="background:${t.priority==='urgent'?'#fef2f2':t.priority==='high'?'#fffbeb':t.priority==='low'?'#f1f5f9':'#eef2ff'};color:${t.priority==='urgent'?'#ef4444':t.priority==='high'?'#f59e0b':t.priority==='low'?'#94a3b8':'#6366f1'};font-size:12px;padding:4px 12px;">${t.priority||'medium'}</span>
              <select class="tk-filter-select" onchange="Tickets.updateStatus('${id}',this.value)" style="font-size:12px;">
                <option value="open" ${t.status==='open'?'selected':''}>Open</option>
                <option value="pending" ${t.status==='pending'?'selected':''}>Pending</option>
                <option value="resolved" ${t.status==='resolved'?'selected':''}>Resolved</option>
                <option value="closed" ${t.status==='closed'?'selected':''}>Closed</option>
              </select>
              <button class="tk-btn tk-btn-danger btn-sm" onclick="Tickets.deleteTicket('${id}')"><i class="fas fa-trash"></i></button>
            </div>
          </div>

          <div class="tk-meta-row">
            <span class="tk-meta-item"><i class="fas fa-folder"></i> ${t.category||'General'}</span>
            <span class="tk-meta-item"><i class="fas fa-user-check"></i> ${t.assignedTo ? t.assignedName||'Assigned' : 'Unassigned'}</span>
            <span class="tk-meta-item"><i class="fas fa-reply"></i> ${replies.length} replies</span>
          </div>

          <div style="background:#f8fafc;border-radius:10px;padding:16px;margin-bottom:20px;">
            <p style="color:#475569;font-size:14px;margin:0;white-space:pre-wrap;">${t.description||'No description provided.'}</p>
          </div>

          <h6 style="font-weight:700;margin-bottom:12px;">💬 Replies (${replies.length})</h6>
          ${replies.length === 0 ? '<p class="text-muted text-center py-3">No replies yet. Be the first to respond.</p>' : replies.map(r => `
            <div class="tk-reply ${r.type||'agent'}">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <strong style="font-size:13px;">${r.type==='customer' ? '👤 ' + (t.customerName||'Customer') : r.type==='system' ? '🤖 System' : '💬 ' + (r.author||'Agent')}</strong>
                <small class="text-muted">${r.time||''}</small>
              </div>
              <p style="margin:0;font-size:13px;color:#475569;white-space:pre-wrap;">${r.message}</p>
              ${r.attachments?.length>0 ? `<div class="mt-2">${r.attachments.map(a=>`<a href="${a.url}" target="_blank" class="tk-badge" style="background:#eef2ff;color:#6366f1;text-decoration:none;">📎 ${a.name}</a>`).join(' ')}</div>` : ''}
            </div>
          `).join('')}

          <div class="mt-3" style="border-top:1px solid #f1f5f9;padding-top:16px;">
            <label class="small fw-bold">Add Reply</label>
            <textarea id="tkReply" class="tk-input tk-textarea" placeholder="Type your reply... (supports markdown)"></textarea>
            <div class="d-flex gap-2 mt-2">
              <select id="tkReplyType" class="tk-filter-select" style="font-size:11px;"><option value="agent">As Agent</option><option value="system">As System Note</option></select>
              <button class="tk-btn tk-btn-primary" onclick="Tickets.addReply('${id}')"><i class="fas fa-paper-plane"></i> Send Reply</button>
            </div>
          </div>
        </div>
      </div>`;
    contentArea.innerHTML = html;
  },

  async addReply(id) {
    const msg = document.getElementById('tkReply')?.value?.trim();
    if (!msg) return showToast('Type a reply!', 'warning');
    const type = document.getElementById('tkReplyType')?.value || 'agent';
    const doc = await db.collection('tickets').doc(id).get();
    const replies = doc.data().replies || [];
    replies.push({
      author: window.currentUser?.name || 'Agent',
      message: msg,
      type: type,
      time: new Date().toLocaleString()
    });
    await db.collection('tickets').doc(id).update({
      replies,
      status: type === 'system' ? doc.data().status : 'pending',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    showToast('✅ Reply sent!', 'success');
    this.renderTicketDetail(id);
  },

  async updateStatus(id, status) {
    await db.collection('tickets').doc(id).update({
      status,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      ...(status === 'resolved' || status === 'closed' ? { resolvedAt: firebase.firestore.FieldValue.serverTimestamp() } : {})
    });
    showToast(`Ticket marked as ${status}.`, 'success');
    this.renderTicketDetail(id);
  },

  async deleteTicket(id) {
    if (!confirm('Delete this ticket permanently? This cannot be undone.')) return;
    await db.collection('tickets').doc(id).delete();
    showToast('Ticket deleted.', 'success');
    this.currentTicket = null;
    this.render();
  }
};
