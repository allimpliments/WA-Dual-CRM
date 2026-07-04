// js/flows.js — Combined: Meta Templates + Visual Builder + My Flows
const Flows = {
  currentTab: 'templates', // templates, builder, myflows
  editingFlowId: null,
  canvasNodes: [],
  canvasConnections: [],
  selectedNode: null,
  isDragging: false,
  dragNode: null,
  dragOffset: { x: 0, y: 0 },
  connectingFrom: null,
  canvasScale: 1,
  canvasPan: { x: 0, y: 0 },
  isPanning: false,
  panStart: { x: 0, y: 0 },

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading...</p>';

    if (this.currentTab === 'builder') { await this.renderBuilder(); return; }
    if (this.currentTab === 'myflows') { await this.renderMyFlows(); return; }
    await this.renderTemplates();
  },

  // ==================== TAB NAVIGATION ====================
  renderTabs(active) {
    return `
      <style>
        .flow-tabs { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
        .flow-tab { padding: 10px 20px; border-radius: 24px; cursor: pointer; font-weight: 600; font-size: 13px; border: 2px solid #e0e0e0; background: #fff; transition: 0.2s; text-align: center; }
        .flow-tab:hover { border-color: #1877f2; }
        .flow-tab.active { background: #1877f2; color: #fff; border-color: #1877f2; }
        .flow-tab .tab-note { display: block; font-size: 9px; font-weight: 400; opacity: 0.8; margin-top: 2px; }
        .flow-tab.active .tab-note { opacity: 1; }
      </style>
      <div class="flow-tabs">
        <div class="flow-tab ${active==='templates'?'active':''}" onclick="Flows.currentTab='templates';Flows.render();">
          📋 Meta Templates
          <span class="tab-note">🔒 Paid • Meta API</span>
        </div>
        <div class="flow-tab ${active==='builder'?'active':''}" onclick="Flows.currentTab='builder';Flows.editingFlowId=null;Flows.canvasNodes=[];Flows.canvasConnections=[];Flows.render();">
          🎨 Visual Builder
          <span class="tab-note">🆓 Free • Unlimited</span>
        </div>
        <div class="flow-tab ${active==='myflows'?'active':''}" onclick="Flows.currentTab='myflows';Flows.render();">
          ⭐ My Flows
          <span class="tab-note">📦 Active ({window._myFlowCount||0})</span>
        </div>
      </div>
    `;
  },

  // ==================== 1. META TEMPLATES ====================
  async renderTemplates() {
    let flows = [];
    try {
      const snap = await db.collection('botFlows').where('source', '==', 'meta').orderBy('category').get();
      flows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) {}

    const categories = ['Sign up','Log in','Appointment booking','Lead generation','Shopping','Contact us','Customer support','Survey','Other'];

    let html = `
      ${this.renderTabs('templates')}
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 class="mb-0"><i class="fab fa-meta text-primary me-2"></i>Meta Flow Templates</h4>
          <small class="text-muted">Ready-made interactive WhatsApp flows • Requires Meta Business Account</small>
        </div>
        <button class="btn btn-info btn-sm" onclick="Flows.syncFromMeta()"><i class="fas fa-sync-alt me-1"></i> Sync from Meta</button>
      </div>

      <div class="row g-3">
        ${flows.length === 0 ? `
          <div class="col-12 text-center py-5">
            <i class="fab fa-meta fa-3x text-muted mb-3"></i>
            <h5>No Meta Templates</h5>
            <p class="text-muted">Click "Sync from Meta" to load ready-made flow templates</p>
            <button class="btn btn-primary" onclick="Flows.syncFromMeta()"><i class="fas fa-sync-alt me-1"></i> Sync Now</button>
          </div>
        ` : flows.map(flow => `
          <div class="col-md-6 col-lg-4">
            <div class="card-widget border-primary" style="cursor:pointer;" onclick="Flows.previewFlow('${flow.id}')">
              <div class="d-flex justify-content-between">
                <strong>${flow.title||'Untitled'}</strong>
                <span class="badge bg-primary">Meta</span>
              </div>
              <small class="text-muted">${flow.category||'Other'} · ${(flow.steps||[]).length} screens · ${flow.endpointType==='with'?'Endpoint':'No Endpoint'}</small>
              <div class="mt-2 d-flex gap-1">
                <button class="btn btn-sm btn-outline-success" onclick="event.stopPropagation();Flows.copyToMyFlows('${flow.id}')"><i class="fas fa-copy me-1"></i> Copy to My Flows</button>
                <button class="btn btn-sm btn-outline-info" onclick="event.stopPropagation();Flows.previewFlow('${flow.id}')"><i class="fas fa-eye"></i></button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <div id="flowPreviewModal"></div>
    `;
    contentArea.innerHTML = html;
  },

  // ==================== 2. VISUAL FLOW BUILDER ====================
  async renderBuilder() {
    if (this.editingFlowId) {
      try {
        const doc = await db.collection('botFlows').doc(this.editingFlowId).get();
        if (doc.exists) {
          const data = doc.data();
          this.canvasNodes = data.canvasNodes || [];
          this.canvasConnections = data.canvasConnections || [];
        }
      } catch(e) {}
    }
    if (this.canvasNodes.length === 0) {
      this.canvasNodes = [
        { id: 'start', type: 'trigger', label: 'Start', x: 400, y: 50, color: '#10b981' },
        { id: 'msg1', type: 'message', label: 'Welcome Message', x: 400, y: 180, color: '#1877f2', text: 'Hello! How can I help you?' }
      ];
      this.canvasConnections = [{ from: 'start', to: 'msg1' }];
    }

    let html = `
      ${this.renderTabs('builder')}
      <style>
        .builder-wrap { display: grid; grid-template-columns: 200px 1fr 300px; gap: 12px; height: calc(100vh - 200px); }
        .node-palette { background: #fff; border-radius: 12px; padding: 12px; border: 1px solid #e0e0e0; overflow-y: auto; }
        .palette-node { padding: 10px; border-radius: 8px; cursor: grab; margin-bottom: 6px; font-size: 12px; font-weight: 500; display: flex; align-items: center; gap: 6px; border: 1px solid #e0e0e0; transition: 0.15s; }
        .palette-node:hover { border-color: #1877f2; background: #e7f3ff; }
        .canvas-wrap { background: #f8fafc; border-radius: 12px; border: 2px dashed #c0c0c0; overflow: hidden; position: relative; }
        .canvas-inner { width: 2000px; height: 2000px; position: relative; transform-origin: 0 0; }
        .canvas-node { position: absolute; padding: 12px 16px; border-radius: 10px; cursor: pointer; font-size: 12px; font-weight: 500; color: #fff; min-width: 120px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 2px solid transparent; transition: box-shadow 0.2s; }
        .canvas-node:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.2); }
        .canvas-node.selected { border-color: #000 !important; }
        .canvas-node .node-delete { position: absolute; top: -8px; right: -8px; background: #fa3e3e; color: #fff; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; display: none; align-items: center; justify-content: center; cursor: pointer; }
        .canvas-node:hover .node-delete { display: flex; }
        .canvas-svg { position: absolute; top: 0; left: 0; pointer-events: none; width: 100%; height: 100%; }
        .canvas-svg line { stroke: #94a3b8; stroke-width: 2; }
        .props-panel { background: #fff; border-radius: 12px; padding: 12px; border: 1px solid #e0e0e0; overflow-y: auto; }
        @media (max-width: 1024px) { .builder-wrap { grid-template-columns: 1fr; grid-template-rows: auto 1fr auto; } }
      </style>

      <div class="d-flex justify-content-between align-items-center mb-2">
        <div class="d-flex gap-2">
          <input type="text" id="flowName" class="form-control form-control-sm" placeholder="Flow Name" value="${this.editingFlowId ? 'Editing Flow' : ''}" style="width:200px;">
          <button class="btn btn-success btn-sm" onclick="Flows.saveCanvasFlow()"><i class="fas fa-save me-1"></i> Save</button>
        </div>
        <div class="d-flex gap-1">
          <button class="btn btn-outline-secondary btn-sm" onclick="Flows.canvasScale-=0.1;Flows.updateCanvasTransform();">🔍−</button>
          <span class="btn btn-light btn-sm disabled">${Math.round(this.canvasScale*100)}%</span>
          <button class="btn btn-outline-secondary btn-sm" onclick="Flows.canvasScale+=0.1;Flows.updateCanvasTransform();">🔍+</button>
          <button class="btn btn-outline-info btn-sm" onclick="Flows.testFlow()">▶ Test</button>
        </div>
      </div>

      <div class="builder-wrap">
        <!-- Node Palette -->
        <div class="node-palette">
          <h6 class="mb-2">Nodes</h6>
          <div class="palette-node" draggable="true" ondragstart="event.dataTransfer.setData('nodeType','message')" style="color:#1877f2;">💬 Message</div>
          <div class="palette-node" draggable="true" ondragstart="event.dataTransfer.setData('nodeType','question')" style="color:#6366f1;">❓ Question</div>
          <div class="palette-node" draggable="true" ondragstart="event.dataTransfer.setData('nodeType','input')" style="color:#f59e0b;">⌨️ Input</div>
          <div class="palette-node" draggable="true" ondragstart="event.dataTransfer.setData('nodeType','condition')" style="color:#ec4899;">🔀 Condition</div>
          <div class="palette-node" draggable="true" ondragstart="event.dataTransfer.setData('nodeType','delay')" style="color:#06b6d4;">⏱ Delay</div>
          <div class="palette-node" draggable="true" ondragstart="event.dataTransfer.setData('nodeType','action')" style="color:#8b5cf6;">⚡ Action</div>
          <hr>
          <small class="text-muted">Drag nodes onto canvas. Click node to edit. Right-click to connect.</small>
        </div>

        <!-- Canvas -->
        <div class="canvas-wrap" id="flowCanvas"
             ondragover="event.preventDefault()"
             ondrop="Flows.onCanvasDrop(event)"
             onmousedown="Flows.onCanvasMouseDown(event)"
             onmousemove="Flows.onCanvasMouseMove(event)"
             onmouseup="Flows.onCanvasMouseUp(event)">
          <div class="canvas-inner" id="canvasInner" style="transform: scale(${this.canvasScale});">
            <svg class="canvas-svg" id="canvasSvg">${this.renderConnections()}</svg>
            ${this.canvasNodes.map(n => this.renderCanvasNode(n)).join('')}
          </div>
        </div>

        <!-- Properties Panel -->
        <div class="props-panel" id="propsPanel">
          <h6>Properties</h6>
          <p class="text-muted small">Select a node on canvas</p>
        </div>
      </div>

      <div id="flowTestModal"></div>
    `;
    contentArea.innerHTML = html;
    setTimeout(() => this.updateCanvasTransform(), 100);
  },

  renderCanvasNode(node) {
    const colors = { trigger:'#10b981', message:'#1877f2', question:'#6366f1', input:'#f59e0b', condition:'#ec4899', delay:'#06b6d4', action:'#8b5cf6' };
    node.color = colors[node.type] || '#1877f2';
    return `
      <div class="canvas-node ${this.selectedNode===node.id?'selected':''}" id="node-${node.id}"
           style="left:${node.x}px;top:${node.y}px;background:${node.color};"
           onmousedown="event.stopPropagation();Flows.selectNode('${node.id}',event)"
           oncontextmenu="event.preventDefault();Flows.startConnection('${node.id}')">
        ${node.label||node.type}
        <div class="node-delete" onclick="event.stopPropagation();Flows.deleteNode('${node.id}')">×</div>
      </div>
    `;
  },

  renderConnections() {
    return this.canvasConnections.map(c => {
      const from = this.canvasNodes.find(n => n.id === c.from);
      const to = this.canvasNodes.find(n => n.id === c.to);
      if (!from || !to) return '';
      return `<line x1="${from.x+60}" y1="${from.y+20}" x2="${to.x+60}" y2="${to.y}" marker-end="url(#arrowhead)"/>`;
    }).join('');
  },

  onCanvasDrop(e) {
    e.preventDefault();
    const type = e.dataTransfer.getData('nodeType');
    if (!type) return;
    const rect = document.getElementById('flowCanvas').getBoundingClientRect();
    const x = (e.clientX - rect.left) / this.canvasScale - 60;
    const y = (e.clientY - rect.top) / this.canvasScale - 20;
    const id = 'node_' + Date.now();
    const labels = { message:'New Message', question:'New Question', input:'New Input', condition:'New Condition', delay:'Delay', action:'New Action' };
    this.canvasNodes.push({ id, type, label: labels[type]||type, x: Math.max(0,x), y: Math.max(0,y), text: '' });
    this.selectedNode = id;
    this.renderBuilder();
  },

  selectNode(id, e) {
    if (this.connectingFrom && this.connectingFrom !== id) {
      this.canvasConnections.push({ from: this.connectingFrom, to: id });
      this.connectingFrom = null;
      this.renderBuilder();
      return;
    }
    this.connectingFrom = null;
    this.selectedNode = id;
    const node = this.canvasNodes.find(n => n.id === id);
    this.dragNode = node;
    this.isDragging = true;
    this.dragOffset = { x: e.clientX - node.x * this.canvasScale, y: e.clientY - node.y * this.canvasScale };
    this.showNodeProps(node);
  },

  onCanvasMouseDown(e) {
    if (e.target.closest('.canvas-node')) return;
    this.selectedNode = null;
    this.isDragging = false;
    this.isPanning = true;
    this.panStart = { x: e.clientX, y: e.clientY };
    document.getElementById('propsPanel').innerHTML = '<h6>Properties</h6><p class="text-muted small">Select a node</p>';
  },

  onCanvasMouseMove(e) {
    if (this.isDragging && this.dragNode) {
      this.dragNode.x = Math.max(0, (e.clientX - this.dragOffset.x) / this.canvasScale);
      this.dragNode.y = Math.max(0, (e.clientY - this.dragOffset.y) / this.canvasScale);
      this.renderBuilder();
    }
  },

  onCanvasMouseUp() {
    this.isDragging = false;
    this.dragNode = null;
    this.isPanning = false;
  },

  startConnection(id) {
    this.connectingFrom = id;
    this.showToast('Now click another node to connect', 'info');
  },

  deleteNode(id) {
    this.canvasNodes = this.canvasNodes.filter(n => n.id !== id);
    this.canvasConnections = this.canvasConnections.filter(c => c.from !== id && c.to !== id);
    if (this.selectedNode === id) this.selectedNode = null;
    this.renderBuilder();
  },

  showNodeProps(node) {
    let html = `<h6>Edit Node</h6><label class="form-label small">Type: <strong>${node.type}</strong></label>`;
    if (node.type === 'message' || node.type === 'question') {
      html += `<textarea class="form-control form-control-sm mb-2" onchange="Flows.updateNodeProp('${node.id}','text',this.value)">${node.text||''}</textarea>`;
    }
    if (node.type === 'question') {
      html += `<input type="text" class="form-control form-control-sm mb-2" placeholder="Options (comma separated)" onchange="Flows.updateNodeProp('${node.id}','options',this.value)" value="${(node.options||[]).join(',')}">`;
    }
    if (node.type === 'input') {
      html += `<input type="text" class="form-control form-control-sm mb-1" placeholder="Question" onchange="Flows.updateNodeProp('${node.id}','text',this.value)" value="${node.text||''}">
               <select class="form-select form-select-sm mb-1" onchange="Flows.updateNodeProp('${node.id}','inputType',this.value)"><option>text</option><option>number</option><option>email</option><option>phone</option></select>
               <input type="text" class="form-control form-control-sm" placeholder="Variable name" onchange="Flows.updateNodeProp('${node.id}','variable',this.value)" value="${node.variable||''}">`;
    }
    if (node.type === 'delay') {
      html += `<input type="number" class="form-control form-control-sm" placeholder="Hours" onchange="Flows.updateNodeProp('${node.id}','hours',this.value)" value="${node.hours||''}">`;
    }
    document.getElementById('propsPanel').innerHTML = html;
  },

  updateNodeProp(id, prop, value) {
    const node = this.canvasNodes.find(n => n.id === id);
    if (!node) return;
    if (prop === 'options') node.options = value.split(',').map(o => o.trim());
    else node[prop] = value;
  },

  updateCanvasTransform() {
    const inner = document.getElementById('canvasInner');
    if (inner) inner.style.transform = `scale(${this.canvasScale})`;
  },

  async saveCanvasFlow() {
    const name = document.getElementById('flowName')?.value?.trim() || 'Untitled Flow';
    const data = {
      title: name,
      source: 'builder',
      canvasNodes: this.canvasNodes,
      canvasConnections: this.canvasConnections,
      status: 'draft',
      addedToMy: true,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    try {
      if (this.editingFlowId) {
        await db.collection('botFlows').doc(this.editingFlowId).update(data);
      } else {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        const ref = await db.collection('botFlows').add(data);
        this.editingFlowId = ref.id;
      }
      alert('✅ Flow saved!');
    } catch(e) { alert('Error: ' + e.message); }
  },

  // ==================== 3. MY FLOWS ====================
  async renderMyFlows() {
    let flows = [];
    try {
      const snap = await db.collection('botFlows').where('addedToMy', '==', true).orderBy('updatedAt', 'desc').get();
      flows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      window._myFlowCount = flows.length;
    } catch(e) {}

    let html = `
      ${this.renderTabs('myflows')}
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="mb-0"><i class="fas fa-star text-warning me-2"></i>My Flows</h4>
        <button class="btn btn-primary btn-sm" onclick="Flows.currentTab='builder';Flows.editingFlowId=null;Flows.canvasNodes=[];Flows.canvasConnections=[];Flows.render();">
          <i class="fas fa-plus me-1"></i> Create New
        </button>
      </div>
      <div class="row g-3">
        ${flows.length === 0 ? '<div class="col-12 text-center py-4 text-muted">No flows yet. Browse Meta templates or create your own!</div>' : flows.map(f => `
          <div class="col-md-6 col-lg-4">
            <div class="card-widget">
              <div class="d-flex justify-content-between">
                <h6>${f.title||'Untitled'}</h6>
                <span class="badge bg-${f.source==='meta'?'primary':'info'}">${f.source==='meta'?'Meta':'Custom'}</span>
              </div>
              <small class="text-muted">${(f.canvasNodes||f.steps||[]).length} nodes · ${f.status||'draft'}</small>
              <div class="mt-2 d-flex gap-1">
                ${f.source==='builder' ? `<button class="btn btn-sm btn-outline-info" onclick="Flows.currentTab='builder';Flows.editingFlowId='${f.id}';Flows.render();"><i class="fas fa-edit"></i></button>` : ''}
                <button class="btn btn-sm btn-${f.status==='active'?'warning':'success'}" onclick="Flows.toggleFlow('${f.id}')">${f.status==='active'?'Deactivate':'Activate'}</button>
                <button class="btn btn-sm btn-outline-info" onclick="Flows.copyFlowLink('${f.id}')"><i class="fas fa-link"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="Flows.removeFromMy('${f.id}')"><i class="fas fa-trash"></i></button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    contentArea.innerHTML = html;
  },

  // ==================== SHARED FUNCTIONS ====================
  async syncFromMeta() {
    const metaTemplates = [
      { title:'Welcome', source:'meta', category:'Contact us', endpointType:'without', steps:[{type:'message',text:'Hello World'},{type:'message',text:'Let\'s start building things!'}] },
      { title:'Collect Purchase Interest', source:'meta', category:'Shopping', endpointType:'without', steps:[{type:'input',text:'Name',inputType:'text'},{type:'input',text:'Email',inputType:'email'},{type:'question',text:'Category?',options:['Phones','TVs','Audio']}] },
      { title:'Get Feedback', source:'meta', category:'Survey', endpointType:'without', steps:[{type:'question',text:'Recommend us?',options:['Yes','No']},{type:'input',text:'How improve?',inputType:'text'}] },
      { title:'Customer Support', source:'meta', category:'Customer support', endpointType:'without', steps:[{type:'input',text:'Name',inputType:'text'},{type:'input',text:'Order #',inputType:'text'},{type:'question',text:'Topic',options:['Orders','Delivery','Returns']}] },
      { title:'Pre-approved Loan', source:'meta', category:'Lead generation', endpointType:'with', steps:[{type:'message',text:'Your pre-approved offer!'},{type:'input',text:'Amount',inputType:'number'},{type:'input',text:'Tenure',inputType:'number'}] },
      { title:'Insurance Quote', source:'meta', category:'Lead generation', endpointType:'with', steps:[{type:'question',text:'Cover?',options:['Self','Family']},{type:'input',text:'Name',inputType:'text'}] },
      { title:'Appointment Booking', source:'meta', category:'Appointment booking', endpointType:'with', steps:[{type:'input',text:'Dept',inputType:'text'},{type:'input',text:'Date',inputType:'date'},{type:'input',text:'Name',inputType:'text'},{type:'input',text:'Phone',inputType:'phone'}] },
      { title:'Account Sign-in', source:'meta', category:'Sign up', endpointType:'with', steps:[{type:'input',text:'Email',inputType:'email'},{type:'input',text:'Password',inputType:'text'}] },
    ];
    let added = 0;
    for (const tpl of metaTemplates) {
      const ex = await db.collection('botFlows').where('title','==',tpl.title).where('source','==','meta').get();
      if (ex.empty) {
        await db.collection('botFlows').add({...tpl, status:'draft', addedToMy:false, createdAt:firebase.firestore.FieldValue.serverTimestamp()});
        added++;
      }
    }
    alert(`✅ ${added} new templates synced!`);
    this.render();
  },

  async copyToMyFlows(id) {
    await db.collection('botFlows').doc(id).update({ addedToMy: true });
    alert('✅ Copied to My Flows!');
    this.render();
  },

  async removeFromMy(id) {
    await db.collection('botFlows').doc(id).update({ addedToMy: false, status: 'draft' });
    this.render();
  },

  async toggleFlow(id) {
    const doc = await db.collection('botFlows').doc(id).get();
    const status = doc.data().status === 'active' ? 'draft' : 'active';
    await db.collection('botFlows').doc(id).update({ status });
    this.render();
  },

  copyFlowLink(id) {
    const link = `${window.location.origin}${window.location.pathname}?flow=${id}`;
    prompt('Share via WhatsApp:', link);
  },

  previewFlow(id) {
    db.collection('botFlows').doc(id).get().then(doc => {
      const f = doc.data();
      const steps = f.steps || f.canvasNodes || [];
      let h = `<div style="max-height:400px;overflow-y:auto;">`;
      steps.forEach((s,i) => {
        h += `<div style="background:#fff;padding:8px;margin:4px 0;border-radius:8px;"><strong>${i+1}.</strong> ${s.label||s.text||s.type}</div>`;
        if (s.options) h += `<div style="display:flex;gap:4px;flex-wrap:wrap;">${s.options.map(o=>`<span style="background:#e7f3ff;padding:2px 8px;border-radius:10px;font-size:11px;">${o}</span>`).join('')}</div>`;
      });
      h += '</div>';
      document.getElementById('flowPreviewModal').innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:3000;display:flex;align-items:center;justify-content:center;" onclick="this.innerHTML=''">
          <div class="card-widget" style="width:380px;max-width:90vw;" onclick="event.stopPropagation()"><h5>📱 ${f.title}</h5>${h}<button class="btn btn-sm btn-secondary w-100 mt-2" onclick="document.getElementById('flowPreviewModal').innerHTML=''">Close</button></div>
        </div>`;
    });
  },

  testFlow() {
    if (this.canvasNodes.length === 0) return alert('Add nodes first!');
    let steps = '';
    this.canvasNodes.forEach((n,i) => {
      steps += `<div style="background:#fff;padding:6px 10px;margin:4px 0;border-radius:6px;font-size:11px;">${i+1}. ${n.label||n.type} ${n.text?': '+n.text:''}</div>`;
    });
    document.getElementById('flowTestModal').innerHTML = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:3000;display:flex;align-items:center;justify-content:center;" onclick="this.innerHTML=''">
        <div class="card-widget" style="width:360px;max-width:90vw;background:#e5ddd5;" onclick="event.stopPropagation()">
          <div style="text-align:center;color:#666;font-size:10px;margin-bottom:4px;">📱 Flow Test</div>
          ${steps}
          <button class="btn btn-sm btn-success w-100 mt-2">▶ Send via WhatsApp</button>
          <button class="btn btn-sm btn-light w-100 mt-1" onclick="document.getElementById('flowTestModal').innerHTML=''">Close</button>
        </div>
      </div>`;
  },

  showToast(msg, type) {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.className = 'toast toast-' + (type || 'success');
    t.style.cssText = 'position:fixed;bottom:20px;right:20px;padding:10px 20px;border-radius:8px;color:#fff;z-index:9999;';
    t.style.background = type === 'error' ? '#fa3e3e' : type === 'info' ? '#1877f2' : '#31a24c';
    t.innerText = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }
};
