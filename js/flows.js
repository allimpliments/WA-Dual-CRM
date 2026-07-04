// js/flows.js — WhatsApp Flow Builder (Meta Flows API)
const Flows = {
  currentTab: 'list', // list, create, edit
  editingFlow: null,
  flowSteps: [],
  currentStepIndex: 0,

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading flows...</p>';

    if (this.currentTab === 'create' || this.currentTab === 'edit') {
      await this.renderBuilder();
      return;
    }

    await this.renderList();
  },

  // ==================== FLOW LIST ====================
  async renderList() {
    let flows = [];
    try {
      const snap = await db.collection('botFlows').orderBy('createdAt', 'desc').get();
      flows = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch(e) { console.error(e); }

    let html = `
      <style>
        .flow-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 12px; padding: 16px; margin-bottom: 12px; transition: 0.2s; cursor: pointer; }
        .flow-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); border-color: #1877f2; }
        .flow-visual { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; margin: 8px 0; }
        .flow-node { background: #e7f3ff; color: #1877f2; border-radius: 16px; padding: 4px 10px; font-size: 11px; font-weight: 500; white-space: nowrap; }
        .flow-arrow { color: #94a3b8; font-size: 12px; }
        .flow-step-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; margin-bottom: 8px; position: relative; }
        .flow-step-card:not(:last-child)::after { content: '↓'; position: absolute; bottom: -22px; left: 50%; transform: translateX(-50%); color: #1877f2; font-size: 18px; font-weight: bold; z-index: 1; }
        .step-type-badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
        .step-type-badge.message { background: #dcfce7; color: #166534; }
        .step-type-badge.question { background: #e0e7ff; color: #3730a3; }
        .step-type-badge.input { background: #fef3c7; color: #92400e; }
        .step-type-badge.condition { background: #fce7f3; color: #9d174d; }
        .step-type-badge.action { background: #e0f2fe; color: #0369a1; }
      </style>

      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="mb-0"><i class="fas fa-sitemap text-primary me-2"></i>WhatsApp Flows</h4>
          <small class="text-muted">Interactive multi-step conversations for WhatsApp</small>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-info btn-sm" onclick="window.open('https://business.facebook.com/wa/manage/flows/','_blank')">
            <i class="fas fa-external-link-alt me-1"></i> Meta Flow Manager
          </button>
          <button class="btn btn-primary btn-sm" onclick="Flows.currentTab='create'; Flows.flowSteps=[]; Flows.editingFlow=null; Flows.render();">
            <i class="fas fa-plus me-1"></i> Create Flow
          </button>
        </div>
      </div>

      <div class="row g-3">
        ${flows.length === 0 ? `
          <div class="col-12 text-center py-5">
            <i class="fas fa-sitemap fa-3x text-muted mb-3"></i>
            <h5>No Flows Yet</h5>
            <p class="text-muted">Create interactive WhatsApp conversations with buttons, questions, and conditions.</p>
            <button class="btn btn-primary" onclick="Flows.currentTab='create'; Flows.flowSteps=[]; Flows.render();">
              <i class="fas fa-plus me-1"></i> Create Your First Flow
            </button>
          </div>
        ` : flows.map(flow => {
          const steps = flow.steps || [];
          return `
            <div class="col-md-6 col-lg-4">
              <div class="flow-card" onclick="Flows.currentTab='edit'; Flows.editingFlow='${flow.id}'; Flows.flowSteps=${JSON.stringify(steps).replace(/"/g,'&quot;')}; Flows.render();">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 class="mb-1">${flow.title || 'Untitled Flow'}</h6>
                    <span class="badge bg-${flow.status==='active'?'success':'secondary'}">${flow.status||'draft'}</span>
                    <span class="badge bg-info ms-1">${steps.length} steps</span>
                  </div>
                </div>
                <div class="flow-visual mt-2">
                  ${steps.map((s, i) => `
                    <span class="flow-node">${s.type||'message'}</span>
                    ${i < steps.length-1 ? '<span class="flow-arrow">→</span>' : ''}
                  `).join('')}
                </div>
                <small class="text-muted">${flow.description || 'No description'}</small>
                <div class="mt-2 d-flex gap-1">
                  <button class="btn btn-sm btn-outline-success" onclick="event.stopPropagation(); Flows.activateFlow('${flow.id}')">
                    <i class="fas fa-${flow.status==='active'?'pause':'play'}"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-info" onclick="event.stopPropagation(); Flows.previewFlow('${flow.id}')">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation(); Flows.deleteFlow('${flow.id}')">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div id="flowPreviewModal"></div>
    `;
    contentArea.innerHTML = html;
  },

  // ==================== FLOW BUILDER ====================
  async renderBuilder() {
    const isEdit = this.currentTab === 'edit' && this.editingFlow;
    let existingData = { title: '', description: '', triggerKeyword: '' };

    if (isEdit) {
      try {
        const doc = await db.collection('botFlows').doc(this.editingFlow).get();
        if (doc.exists) {
          const d = doc.data();
          existingData = { title: d.title || '', description: d.description || '', triggerKeyword: d.triggerKeyword || '' };
          if (!this.flowSteps.length) this.flowSteps = d.steps || [];
        }
      } catch(e) {}
    }

    let html = `
      <style>
        .builder-container { display: grid; grid-template-columns: 1fr 400px; gap: 20px; }
        .step-card { background: #fff; border: 2px solid #e0e0e0; border-radius: 12px; padding: 16px; margin-bottom: 12px; position: relative; transition: 0.2s; }
        .step-card.active { border-color: #1877f2; box-shadow: 0 4px 12px rgba(24,119,242,0.1); }
        .step-card .step-number { position: absolute; top: -12px; left: 12px; background: #1877f2; color: #fff; border-radius: 20px; padding: 2px 12px; font-size: 11px; font-weight: 600; }
        .step-connector { text-align: center; color: #1877f2; font-size: 20px; margin: -8px 0; }
        .preview-phone { width: 340px; background: #e5ddd5; border-radius: 20px; padding: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12); position: sticky; top: 20px; }
        .preview-screen { background: #efeae2; border-radius: 12px; min-height: 500px; padding: 16px; }
        .preview-msg { max-width: 80%; padding: 8px 12px; border-radius: 8px; margin-bottom: 8px; font-size: 13px; }
        .preview-msg.bot { background: #fff; margin-right: auto; }
        .preview-msg.user { background: #d9fdd3; margin-left: auto; text-align: right; }
        .preview-buttons { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
        .preview-btn { background: #fff; border: 1px solid #1877f2; color: #1877f2; padding: 6px 14px; border-radius: 20px; font-size: 12px; cursor: pointer; }
        .preview-input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 8px; font-size: 12px; margin: 4px 0; }
        @media (max-width: 900px) { .builder-container { grid-template-columns: 1fr; } }
      </style>

      <div class="d-flex align-items-center mb-3">
        <button class="btn btn-outline-secondary btn-sm me-2" onclick="Flows.currentTab='list'; Flows.render();">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h4 class="mb-0">${isEdit ? 'Edit' : 'Create'} Flow</h4>
      </div>

      <div class="builder-container">
        <div>
          <!-- Flow Settings -->
          <div class="card-widget mb-3">
            <h5>Flow Settings</h5>
            <div class="row g-2">
              <div class="col-md-6">
                <label class="form-label small fw-bold">Flow Name *</label>
                <input type="text" id="flowTitle" class="form-control form-control-sm" value="${existingData.title}" placeholder="e.g. Welcome Flow">
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Trigger Keyword</label>
                <input type="text" id="flowTrigger" class="form-control form-control-sm" value="${existingData.triggerKeyword}" placeholder="e.g. start, help, menu">
                <small class="text-muted">When user sends this word, flow starts automatically</small>
              </div>
            </div>
            <div class="mt-2">
              <label class="form-label small fw-bold">Description</label>
              <input type="text" id="flowDesc" class="form-control form-control-sm" value="${existingData.description}" placeholder="What this flow does...">
            </div>
          </div>

          <!-- Steps -->
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="mb-0">Flow Steps</h5>
            <div class="d-flex gap-1">
              <button class="btn btn-outline-primary btn-sm" onclick="Flows.addStep('message')"><i class="fas fa-comment me-1"></i> Message</button>
              <button class="btn btn-outline-info btn-sm" onclick="Flows.addStep('question')"><i class="fas fa-question-circle me-1"></i> Question</button>
              <button class="btn btn-outline-warning btn-sm" onclick="Flows.addStep('input')"><i class="fas fa-keyboard me-1"></i> Input</button>
              <button class="btn btn-outline-success btn-sm" onclick="Flows.addStep('condition')"><i class="fas fa-code-branch me-1"></i> Condition</button>
            </div>
          </div>

          <div id="stepsContainer">
            ${this.flowSteps.length === 0 ? `
              <div class="text-center py-4 text-muted">
                <i class="fas fa-plus-circle fa-2x mb-2"></i>
                <p>Add steps to build your flow</p>
              </div>
            ` : this.flowSteps.map((step, i) => this.renderStepCard(step, i)).join('')}
          </div>

          <button class="btn btn-primary w-100 mt-3" onclick="Flows.saveFlow()">
            <i class="fas fa-save me-1"></i> ${isEdit ? 'Update' : 'Save'} Flow
          </button>
        </div>

        <!-- Live Preview -->
        <div class="preview-phone">
          <div style="text-align:center;color:#666;font-size:11px;margin-bottom:6px;">📱 Live Preview</div>
          <div class="preview-screen" id="flowPreview">
            <div class="text-center text-muted py-4">
              <i class="fab fa-whatsapp fa-2x mb-2" style="color:#25D366;"></i>
              <p class="small">Flow preview will appear here</p>
              <button class="btn btn-sm btn-outline-primary" onclick="Flows.startPreview()">▶ Preview Flow</button>
            </div>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  renderStepCard(step, index) {
    const types = {
      message: { icon: 'fa-comment', color: '#10b981', label: 'Message' },
      question: { icon: 'fa-question-circle', color: '#6366f1', label: 'Question' },
      input: { icon: 'fa-keyboard', color: '#f59e0b', label: 'User Input' },
      condition: { icon: 'fa-code-branch', color: '#ec4899', label: 'Condition' }
    };
    const t = types[step.type] || types.message;

    let configHTML = '';
    if (step.type === 'message') {
      configHTML = `
        <textarea class="form-control form-control-sm mt-1" placeholder="Message text..." onchange="Flows.flowSteps[${index}].text=this.value">${step.text||''}</textarea>
        <input type="text" class="form-control form-control-sm mt-1" placeholder="Button text (optional)" onchange="Flows.flowSteps[${index}].button=this.value" value="${step.button||''}">
      `;
    } else if (step.type === 'question') {
      configHTML = `
        <input type="text" class="form-control form-control-sm mt-1" placeholder="Question text" onchange="Flows.flowSteps[${index}].text=this.value" value="${step.text||''}">
        <div class="mt-1"><small>Options (comma separated):</small></div>
        <input type="text" class="form-control form-control-sm" placeholder="Yes, No, Maybe" onchange="Flows.flowSteps[${index}].options=this.value.split(',').map(o=>o.trim())" value="${(step.options||[]).join(', ')}">
      `;
    } else if (step.type === 'input') {
      configHTML = `
        <input type="text" class="form-control form-control-sm mt-1" placeholder="Question text" onchange="Flows.flowSteps[${index}].text=this.value" value="${step.text||''}">
        <select class="form-select form-select-sm mt-1" onchange="Flows.flowSteps[${index}].inputType=this.value">
          <option value="text" ${step.inputType==='text'?'selected':''}>Text</option>
          <option value="number" ${step.inputType==='number'?'selected':''}>Number</option>
          <option value="email" ${step.inputType==='email'?'selected':''}>Email</option>
          <option value="phone" ${step.inputType==='phone'?'selected':''}>Phone</option>
        </select>
        <input type="text" class="form-control form-control-sm mt-1" placeholder="Save answer as (variable name)" onchange="Flows.flowSteps[${index}].variable=this.value" value="${step.variable||''}">
      `;
    } else if (step.type === 'condition') {
      configHTML = `
        <input type="text" class="form-control form-control-sm mt-1" placeholder="Variable name" onchange="Flows.flowSteps[${index}].variable=this.value" value="${step.variable||''}">
        <select class="form-select form-select-sm mt-1" onchange="Flows.flowSteps[${index}].operator=this.value">
          <option value="equals" ${step.operator==='equals'?'selected':''}>Equals</option>
          <option value="contains" ${step.operator==='contains'?'selected':''}>Contains</option>
          <option value="greater" ${step.operator==='greater'?'selected':''}>Greater than</option>
        </select>
        <input type="text" class="form-control form-control-sm mt-1" placeholder="Value to compare" onchange="Flows.flowSteps[${index}].compareValue=this.value" value="${step.compareValue||''}">
        <div class="row g-1 mt-1">
          <div class="col-6"><small>If TRUE → Step</small><input type="number" class="form-control form-control-sm" placeholder="Step #" onchange="Flows.flowSteps[${index}].trueStep=parseInt(this.value)" value="${step.trueStep||''}"></div>
          <div class="col-6"><small>If FALSE → Step</small><input type="number" class="form-control form-control-sm" placeholder="Step #" onchange="Flows.flowSteps[${index}].falseStep=parseInt(this.value)" value="${step.falseStep||''}"></div>
        </div>
      `;
    }

    return `
      <div class="step-card">
        <span class="step-number">Step ${index + 1}</span>
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="step-type-badge ${step.type}" style="background:${t.color}20;color:${t.color};">
            <i class="fas ${t.icon} me-1"></i> ${t.label}
          </span>
          <div>
            ${index > 0 ? `<button class="btn btn-xs btn-outline-secondary me-1" onclick="Flows.moveStep(${index},'up')">↑</button>` : ''}
            ${index < this.flowSteps.length-1 ? `<button class="btn btn-xs btn-outline-secondary me-1" onclick="Flows.moveStep(${index},'down')">↓</button>` : ''}
            <button class="btn btn-xs btn-outline-danger" onclick="Flows.removeStep(${index})">×</button>
          </div>
        </div>
        ${configHTML}
      </div>
      <div class="step-connector">↓</div>
    `;
  },

  // ==================== STEP MANAGEMENT ====================
  addStep(type) {
    const newStep = { type, text: '', options: [], inputType: 'text', variable: '', operator: 'equals', compareValue: '', button: '' };
    this.flowSteps.push(newStep);
    this.renderBuilder();
  },

  removeStep(index) {
    this.flowSteps.splice(index, 1);
    this.renderBuilder();
  },

  moveStep(index, direction) {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= this.flowSteps.length) return;
    const temp = this.flowSteps[index];
    this.flowSteps[index] = this.flowSteps[newIndex];
    this.flowSteps[newIndex] = temp;
    this.renderBuilder();
  },

  // ==================== SAVE ====================
  async saveFlow() {
    const title = document.getElementById('flowTitle').value.trim();
    if (!title) return alert('Flow name required!');
    if (this.flowSteps.length === 0) return alert('Add at least 1 step!');

    const data = {
      title,
      description: document.getElementById('flowDesc').value.trim(),
      triggerKeyword: document.getElementById('flowTrigger').value.trim().toLowerCase(),
      steps: this.flowSteps,
      status: this.editingFlow ? undefined : 'draft',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      if (this.currentTab === 'edit' && this.editingFlow) {
        await db.collection('botFlows').doc(this.editingFlow).update(data);
      } else {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('botFlows').add(data);
      }
      alert('✅ Flow saved!');
      this.currentTab = 'list';
      this.flowSteps = [];
      this.editingFlow = null;
      this.render();
    } catch(e) { alert('Error: ' + e.message); }
  },

  // ==================== ACTIVATE / DEACTIVATE ====================
  async activateFlow(id) {
    const doc = await db.collection('botFlows').doc(id).get();
    const current = doc.data().status || 'draft';
    const newStatus = current === 'active' ? 'draft' : 'active';
    await db.collection('botFlows').doc(id).update({ status: newStatus });
    this.render();
  },

  // ==================== PREVIEW ====================
  startPreview() {
    if (this.flowSteps.length === 0) return;
    this.currentStepIndex = 0;
    this.renderPreviewStep();
  },

  renderPreviewStep(userInput = null) {
    if (this.currentStepIndex >= this.flowSteps.length) {
      document.getElementById('flowPreview').innerHTML = `
        <div class="text-center py-4">
          <i class="fas fa-check-circle fa-2x text-success mb-2"></i>
          <p class="small">Flow Complete! ✅</p>
          <button class="btn btn-sm btn-outline-primary" onclick="Flows.startPreview()">🔄 Restart</button>
        </div>
      `;
      return;
    }

    const step = this.flowSteps[this.currentStepIndex];
    let html = '';

    if (step.type === 'message') {
      html += `<div class="preview-msg bot">${step.text||'Hello!'}</div>`;
      if (step.button) {
        html += `<div class="preview-buttons"><button class="preview-btn" onclick="Flows.flowSteps[${this.currentStepIndex}]._clicked=true; Flows.currentStepIndex++; Flows.renderPreviewStep();">${step.button}</button></div>`;
      } else {
        html += `<button class="btn btn-sm btn-outline-primary w-100 mt-2" onclick="Flows.currentStepIndex++; Flows.renderPreviewStep();">Continue →</button>`;
      }
    } else if (step.type === 'question') {
      html += `<div class="preview-msg bot">${step.text||'Choose an option:'}</div>`;
      html += `<div class="preview-buttons">${(step.options||['Yes','No']).map(o => `<button class="preview-btn" onclick="Flows.flowSteps[${this.currentStepIndex}]._answer='${o}'; Flows.currentStepIndex++; Flows.renderPreviewStep();">${o}</button>`).join('')}</div>`;
    } else if (step.type === 'input') {
      html += `<div class="preview-msg bot">${step.text||'Please enter:'}</div>`;
      html += `<input type="${step.inputType||'text'}" class="preview-input" id="previewInput" placeholder="Type here...">`;
      html += `<button class="btn btn-sm btn-primary w-100 mt-1" onclick="Flows.flowSteps[${this.currentStepIndex}]._answer=document.getElementById('previewInput').value; Flows.currentStepIndex++; Flows.renderPreviewStep();">Submit</button>`;
    } else if (step.type === 'condition') {
      const answer = Flows.flowSteps.find(s => s.variable === step.variable)?._answer || '';
      let match = false;
      if (step.operator === 'equals') match = answer === step.compareValue;
      else if (step.operator === 'contains') match = answer.includes(step.compareValue);
      else if (step.operator === 'greater') match = parseInt(answer) > parseInt(step.compareValue);
      this.currentStepIndex = match ? (step.trueStep-1) : (step.falseStep-1);
      this.renderPreviewStep();
      return;
    }

    document.getElementById('flowPreview').innerHTML = html;
  },

  async previewFlow(id) {
    const doc = await db.collection('botFlows').doc(id).get();
    const flow = doc.data();
    const steps = flow.steps || [];

    let previewHTML = '<div style="max-height:400px;overflow-y:auto;">';
    steps.forEach((s, i) => {
      previewHTML += `<div class="preview-msg bot"><strong>Step ${i+1}:</strong> ${s.text||'(No text)'}</div>`;
      if (s.options?.length) previewHTML += `<div class="preview-buttons">${s.options.map(o=>`<span class="preview-btn">${o}</span>`).join('')}</div>`;
    });
    previewHTML += '</div>';

    document.getElementById('flowPreviewModal').innerHTML = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:3000;display:flex;align-items:center;justify-content:center;" onclick="document.getElementById('flowPreviewModal').innerHTML=''">
        <div class="card-widget" style="width:380px;max-width:90vw;" onclick="event.stopPropagation()">
          <h5>📱 ${flow.title}</h5>
          ${previewHTML}
          <button class="btn btn-secondary btn-sm w-100 mt-2" onclick="document.getElementById('flowPreviewModal').innerHTML=''">Close</button>
        </div>
      </div>
    `;
  },

  // ==================== DELETE ====================
  async deleteFlow(id) {
    if (!confirm('Delete this flow?')) return;
    await db.collection('botFlows').doc(id).delete();
    this.render();
  }
};
