const Forms = {
  currentTab: 'forms',
  formFields: [],
  currentFormId: null,
  formDesign: {
    primaryColor: '#1877f2',
    buttonTextColor: '#ffffff',
    borderStyle: 'solid',
    bannerUrl: '',
    logoUrl: '',
    titleFontSize: '24px',
    titleColor: '#1c1e21',
    backgroundColor: '#ffffff',
    fontFamily: 'Inter, sans-serif'
  },

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading forms...</p>';

    if (this.currentTab === 'builder') { await this.renderBuilder(); return; }
    if (this.currentTab === 'submissions') { await this.renderSubmissions(); return; }
    if (this.currentTab === 'design') { await this.renderDesignPanel(); return; }

    let forms = [];
    try {
      const snap = await db.collection('forms').orderBy('createdAt', 'desc').get();
      forms = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) { console.error(err); }

    let html = `
      <style>
        .form-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px; margin-bottom: 16px; transition: 0.2s; cursor: pointer; }
        .form-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-color: #1877f2; }
        .form-card .form-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
      </style>
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="mb-0"><i class="fas fa-wpforms text-primary me-2"></i>Form Builder</h4>
        <button class="btn btn-primary" onclick="Forms.currentTab='builder'; Forms.render();"><i class="fas fa-plus me-1"></i> Create New Form</button>
      </div>
      <div class="row g-3" id="formsList">
        ${forms.length === 0 ? '<div class="col-12"><p class="text-muted text-center py-4">No forms yet.</p></div>' : forms.map(f => `
          <div class="col-md-6 col-lg-4">
            <div class="form-card" onclick="Forms.editForm('${f.id}')">
              <div class="d-flex gap-3 align-items-center mb-2">
                <div class="form-icon bg-primary bg-opacity-10"><i class="fas fa-wpforms text-primary"></i></div>
                <div><strong>${f.name || 'Untitled'}</strong><br><small class="text-muted">${f.source || 'General'}</small></div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">${(f.fields || []).length} fields</small>
                <div class="d-flex gap-1" onclick="event.stopPropagation();">
                  <button class="btn btn-sm btn-outline-primary" onclick="Forms.getFormLink('${f.id}')"><i class="fas fa-link"></i></button>
                  <button class="btn btn-sm btn-outline-info" onclick="Forms.currentTab='submissions'; Forms.currentFormId='${f.id}'; Forms.render();"><i class="fas fa-list"></i></button>
                  <button class="btn btn-sm btn-outline-danger" onclick="Forms.deleteForm('${f.id}')"><i class="fas fa-trash"></i></button>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    contentArea.innerHTML = html;
  },

  // ==================== BUILDER ====================
  async renderBuilder(formId = null) {
    let form = { name: '', source: 'General', fields: [], design: {} };
    if (formId) {
      const doc = await db.collection('forms').doc(formId).get();
      if (doc.exists) {
        form = { id: formId, ...doc.data() };
        this.formDesign = { ...this.formDesign, ...(form.design || {}) };
      }
    } else {
      this.formDesign = { ...Forms.formDesign };
    }
    this.formFields = [...(form.fields || [])];
    this.currentFormId = formId || null;

    let html = `
      <style>
        .builder-layout { display: grid; grid-template-columns: 260px 1fr 340px; gap: 16px; }
        .field-types-panel { background: #fff; border-radius: 12px; padding: 12px; border: 1px solid #e0e0e0; height: fit-content; }
        .field-type-item { padding: 8px 10px; border-radius: 8px; cursor: pointer; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; border: 1px solid transparent; transition: 0.15s; }
        .field-type-item:hover { background: #f0f7ff; border-color: #1877f2; }
        .builder-canvas { background: #fff; border-radius: 12px; padding: 16px; border: 1px solid #e0e0e0; min-height: 400px; }
        .canvas-field { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 10px; margin-bottom: 8px; cursor: grab; transition: 0.15s; position: relative; }
        .canvas-field:hover { border-color: #1877f2; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .canvas-field .field-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .canvas-field .field-label { font-weight: 600; font-size: 13px; }
        .canvas-field .field-preview input, .canvas-field .field-preview select, .canvas-field .field-preview textarea { width: 100%; padding: 6px 10px; border: 1px solid #dadde1; border-radius: 6px; font-size: 12px; background: #f9fafb; }
        .canvas-field .field-actions { display: flex; gap: 4px; position: absolute; top: 6px; right: 6px; opacity: 0; transition: 0.15s; }
        .canvas-field:hover .field-actions { opacity: 1; }
        .canvas-field.half-width { display: inline-block; width: calc(50% - 6px); margin-right: 8px; vertical-align: top; }
        .preview-panel { background: #fff; border-radius: 12px; padding: 16px; border: 1px solid #e0e0e0; }
        .preview-phone { border-radius: 12px; padding: 16px; max-width: 360px; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .preview-phone .preview-field { margin-bottom: 12px; }
        .preview-phone label { font-weight: 500; font-size: 11px; color: #555; display: block; margin-bottom: 3px; }
        .preview-phone input, .preview-phone select, .preview-phone textarea { width: 100%; padding: 7px 9px; border: 1px solid #ddd; border-radius: 5px; font-size: 12px; }
        .preview-phone .preview-checkbox, .preview-phone .preview-radio { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; font-size: 12px; }
        .preview-phone .btn-submit { color: #fff; border: none; padding: 10px; border-radius: 8px; width: 100%; font-weight: 600; font-size: 13px; cursor: pointer; }
        .preview-half { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .preview-full { grid-column: 1 / -1; }
        @media (max-width: 1200px) { .builder-layout { grid-template-columns: 1fr; } }
      </style>

      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 class="mb-0"><i class="fas fa-wpforms text-primary me-2"></i>${formId ? 'Edit' : 'Create'} Form</h4>
          <div class="d-flex gap-2 mt-1">
            <button class="btn btn-link btn-sm p-0" onclick="Forms.currentTab='forms'; Forms.render();"><i class="fas fa-arrow-left me-1"></i> Back</button>
            <button class="btn btn-outline-secondary btn-sm" onclick="Forms.currentTab='design'; Forms.renderBuilderDesign();"><i class="fas fa-palette me-1"></i> Design</button>
          </div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary btn-sm" onclick="Forms.getFormLink(formId || 'preview')"><i class="fas fa-eye me-1"></i> Preview</button>
          <button class="btn btn-success btn-sm" onclick="Forms.saveForm()"><i class="fas fa-save me-1"></i> Save Form</button>
        </div>
      </div>

      <div class="card-widget mb-3">
        <div class="row g-2">
          <div class="col-md-4"><label class="form-label small fw-bold">Form Name</label><input type="text" id="formName" class="form-control form-control-sm" value="${form.name}"></div>
          <div class="col-md-3"><label class="form-label small fw-bold">Lead Source</label><select id="formSource" class="form-select form-select-sm"><option value="General" ${form.source==='General'?'selected':''}>General</option><option value="WhatsApp" ${form.source==='WhatsApp'?'selected':''}>WhatsApp</option><option value="Facebook" ${form.source==='Facebook'?'selected':''}>Facebook</option><option value="Website" ${form.source==='Website'?'selected':''}>Website</option></select></div>
          <div class="col-md-5"><label class="form-label small fw-bold">Success Message</label><input type="text" id="formSuccessMsg" class="form-control form-control-sm" value="${form.successMsg || 'Thank you! Your form has been submitted.'}"></div>
        </div>
      </div>

      <div class="builder-layout">
        <div class="field-types-panel">
          <h6 class="mb-2">Add Fields</h6>
          <div class="field-type-item" onclick="Forms.addField('text')"><i class="fas fa-font"></i> Text</div>
          <div class="field-type-item" onclick="Forms.addField('number')"><i class="fas fa-sort-numeric-up"></i> Number</div>
          <div class="field-type-item" onclick="Forms.addField('email')"><i class="fas fa-envelope"></i> Email</div>
          <div class="field-type-item" onclick="Forms.addField('date')"><i class="fas fa-calendar"></i> Date</div>
          <div class="field-type-item" onclick="Forms.addField('dropdown')"><i class="fas fa-caret-down"></i> Dropdown</div>
          <div class="field-type-item" onclick="Forms.addField('radio')"><i class="fas fa-dot-circle"></i> Radio</div>
          <div class="field-type-item" onclick="Forms.addField('checkbox')"><i class="fas fa-check-square"></i> Checkbox</div>
          <div class="field-type-item" onclick="Forms.addField('textarea')"><i class="fas fa-align-left"></i> Textarea</div>
          <div class="field-type-item" onclick="Forms.addField('file')"><i class="fas fa-upload"></i> File Upload</div>
          <div class="field-type-item" onclick="Forms.addField('phone')"><i class="fas fa-phone"></i> Phone</div>
        </div>

        <div class="builder-canvas" id="builderCanvas">
          <h6 class="mb-2">Form Fields</h6>
          <div id="canvasFields">
            ${this.formFields.length === 0 ? '<p class="text-muted text-center py-4">Click on field types from left panel to add fields.</p>' : this.formFields.map((f, i) => this.renderCanvasField(f, i)).join('')}
          </div>
        </div>

        <div class="preview-panel">
          <h6 class="mb-2">Live Preview</h6>
          <div class="preview-phone" id="formPreview" style="background:${this.formDesign.backgroundColor}; font-family:${this.formDesign.fontFamily};">
            ${this.renderPreview()}
          </div>
        </div>
      </div>
      <div id="editFieldModal" style="display:none;"></div>
    `;
    contentArea.innerHTML = html;
    setTimeout(() => {
      const canvas = document.getElementById('canvasFields');
      if (canvas && this.formFields.length > 0) {
        new Sortable(canvas, {
          animation: 150,
          handle: '.canvas-field',
          onEnd: (evt) => {
            const moved = this.formFields.splice(evt.oldIndex, 1)[0];
            this.formFields.splice(evt.newIndex, 0, moved);
            this.refreshCanvas();
            this.refreshPreview();
          }
        });
      }
    }, 200);
  },

  renderBuilderDesign() {
    // Will be implemented in next step
  },

  renderCanvasField(field, index) {
    const widthClass = field.width === 'half' ? 'half-width' : '';
    return `
      <div class="canvas-field ${widthClass}" data-index="${index}">
        <div class="field-header">
          <span class="field-label">${field.label || 'Untitled'} ${field.required ? '<span class="text-danger">*</span>' : ''}</span>
          <small class="text-muted">${field.type}${field.width==='half'?' (50%)':''}</small>
        </div>
        <div class="field-preview">
          ${this.renderFieldPreview(field, index)}
        </div>
        <div class="field-actions">
          <button class="btn btn-sm btn-outline-info" onclick="Forms.editField(${index})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-outline-danger" onclick="Forms.removeField(${index})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
  },

  renderFieldPreview(field, index) {
    switch(field.type) {
      case 'dropdown': return `<select><option>${field.options?.[0] || 'Select...'}</option>${(field.options || []).slice(1).map(o => `<option>${o}</option>`).join('')}</select>`;
      case 'radio': return (field.options || []).map(o => `<div class="preview-checkbox"><input type="radio" name="r_${index}" disabled> ${o}</div>`).join('');
      case 'checkbox': return (field.options || []).map(o => `<div class="preview-checkbox"><input type="checkbox" disabled> ${o}</div>`).join('');
      case 'textarea': return `<textarea rows="2" disabled style="width:100%;border:1px solid #dadde1;border-radius:6px;background:#f9fafb;"></textarea>`;
      case 'file': return `<input type="file" disabled>`;
      default: return `<input type="${field.type || 'text'}" disabled placeholder="${field.placeholder || ''}">`;
    }
  },

  renderPreview() {
    let html = '';
    // Banner
    if (this.formDesign.bannerUrl) {
      html += `<img src="${this.formDesign.bannerUrl}" style="width:100%;border-radius:8px;margin-bottom:12px;">`;
    }
    // Logo + Title
    if (this.formDesign.logoUrl) {
      html += `<div style="text-align:center;margin-bottom:8px;"><img src="${this.formDesign.logoUrl}" style="max-height:50px;"></div>`;
    }
    html += `<h4 style="text-align:center;color:${this.formDesign.titleColor};font-size:${this.formDesign.titleFontSize};margin-bottom:4px;">${document.getElementById('formName')?.value || 'Untitled Form'}</h4>`;
    html += `<small class="text-muted d-block text-center mb-3">${document.getElementById('formSource')?.value || 'General'}</small>`;

    // Group fields by half/full
    let i = 0;
    while (i < this.formFields.length) {
      const f = this.formFields[i];
      if (f.width === 'half' && this.formFields[i + 1] && this.formFields[i + 1].width === 'half') {
        html += `<div class="preview-half">`;
        html += this.renderPreviewField(f, i);
        html += this.renderPreviewField(this.formFields[i + 1], i + 1);
        html += `</div>`;
        i += 2;
      } else {
        html += `<div class="preview-full">`;
        html += this.renderPreviewField(f, i);
        html += `</div>`;
        i++;
      }
    }
    html += `<button class="btn-submit" style="background:${this.formDesign.primaryColor};color:${this.formDesign.buttonTextColor};">Submit</button>`;
    return html;
  },

  renderPreviewField(field, index) {
    return `
      <div class="preview-field">
        <label>${field.label} ${field.required ? '<span style="color:#fa3e3e;">*</span>' : ''}</label>
        ${this.renderFieldPreview(field, index)}
      </div>
    `;
  },

  addField(type) {
    this.formFields.push({ type, label: this.getDefaultLabel(type), required: false, options: type === 'dropdown' || type === 'radio' || type === 'checkbox' ? ['Option 1', 'Option 2', 'Option 3'] : [], placeholder: '', width: 'full' });
    this.refreshCanvas();
    this.refreshPreview();
  },

  getDefaultLabel(type) {
    const labels = { text: 'Full Name', number: 'Age', email: 'Email Address', date: 'Date', dropdown: 'Select Option', radio: 'Choose One', checkbox: 'Select Options', textarea: 'Message', file: 'Upload File', phone: 'Phone Number' };
    return labels[type] || 'New Field';
  },

  editField(index) {
    const f = this.formFields[index];
    document.getElementById('editFieldModal').style.display = 'block';
    document.getElementById('editFieldModal').innerHTML = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:3000;display:flex;align-items:center;justify-content:center;" onclick="Forms.closeEditModal()">
        <div class="card-widget" style="width:480px;max-height:80vh;overflow-y:auto;" onclick="event.stopPropagation()">
          <h5>Edit Field</h5>
          <div class="mb-3"><label class="form-label small">Label</label><input type="text" id="editLabel" class="form-control form-control-sm" value="${f.label}"></div>
          <div class="mb-3"><label class="form-label small">Placeholder</label><input type="text" id="editPlaceholder" class="form-control form-control-sm" value="${f.placeholder || ''}"></div>
          <div class="mb-3">
            <label class="form-label small">Width</label>
            <select id="editWidth" class="form-select form-select-sm">
              <option value="full" ${f.width==='full'?'selected':''}>100% (Full)</option>
              <option value="half" ${f.width==='half'?'selected':''}>50% (Half)</option>
            </select>
          </div>
          ${['dropdown', 'radio', 'checkbox'].includes(f.type) ? `<div class="mb-3"><label class="form-label small">Options (one per line)</label><textarea id="editOptions" class="form-control form-control-sm" rows="4">${(f.options || []).join('\n')}</textarea></div>` : ''}
          <div class="form-check mb-3"><input class="form-check-input" type="checkbox" id="editRequired" ${f.required ? 'checked' : ''}><label class="form-check-label">Required</label></div>
          <button class="btn btn-primary btn-sm" onclick="Forms.saveFieldEdit(${index})">Save</button>
          <button class="btn btn-light btn-sm" onclick="Forms.closeEditModal()">Cancel</button>
        </div>
      </div>
    `;
  },

  saveFieldEdit(index) {
    const f = this.formFields[index];
    f.label = document.getElementById('editLabel').value.trim();
    f.placeholder = document.getElementById('editPlaceholder').value.trim();
    f.width = document.getElementById('editWidth').value;
    f.required = document.getElementById('editRequired').checked;
    if (document.getElementById('editOptions')) {
      f.options = document.getElementById('editOptions').value.split('\n').map(o => o.trim()).filter(Boolean);
    }
    this.closeEditModal();
    this.refreshCanvas();
    this.refreshPreview();
  },

  closeEditModal() {
    document.getElementById('editFieldModal').style.display = 'none';
    document.getElementById('editFieldModal').innerHTML = '';
  },

  removeField(index) {
    this.formFields.splice(index, 1);
    this.refreshCanvas();
    this.refreshPreview();
  },

  refreshCanvas() {
    const canvas = document.getElementById('canvasFields');
    if (!canvas) return;
    canvas.innerHTML = this.formFields.length === 0 ? '<p class="text-muted text-center py-4">Click on field types from left panel to add fields.</p>' : this.formFields.map((f, i) => this.renderCanvasField(f, i)).join('');
  },

  refreshPreview() {
    const preview = document.getElementById('formPreview');
    if (!preview) return;
    preview.innerHTML = this.renderPreview();
  },

  // ==================== SAVE ====================
  async saveForm() {
    const name = document.getElementById('formName').value.trim();
    const source = document.getElementById('formSource').value;
    const successMsg = document.getElementById('formSuccessMsg').value.trim();
    if (!name) return alert('Form name required!');
    const data = { name, source, successMsg, fields: this.formFields, design: this.formDesign, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
    try {
      if (this.currentFormId) {
        await db.collection('forms').doc(this.currentFormId).update(data);
      } else {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.submissionCount = 0;
        const ref = await db.collection('forms').add(data);
        this.currentFormId = ref.id;
      }
      alert('✅ Form saved!');
      this.currentTab = 'forms';
      this.render();
    } catch (err) { alert('Error: ' + err.message); }
  },

  editForm(id) { this.currentTab = 'builder'; this.currentFormId = id; this.render(); },
  getFormLink(formId) {
    if (formId === 'preview') { alert('Save the form first.'); return; }
    prompt('Share this link:', `https://allimpliments.github.io/WA-Dual-CRM/?form=${formId}`);
  },

  async renderSubmissions() {
    const formId = this.currentFormId;
    const formDoc = await db.collection('forms').doc(formId).get();
    const form = formDoc.data();
    const subsSnap = await db.collection('formSubmissions').where('formId', '==', formId).orderBy('createdAt', 'desc').get();
    const submissions = subsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    let html = `
      <div class="d-flex justify-content-between mb-3"><h4>Submissions: ${form.name}</h4><button class="btn btn-outline-primary btn-sm" onclick="Forms.currentTab='forms'; Forms.render();">Back</button></div>
      <div class="card-widget"><p>Total: <strong>${submissions.length}</strong></p></div>
    `;
    contentArea.innerHTML = html;
  },

  async deleteForm(id) {
    if (!confirm('Delete form?')) return;
    await db.collection('forms').doc(id).delete();
    alert('Deleted.'); this.render();
  },

  // ==================== DESIGN PANEL (Next Step) ====================
  async renderDesignPanel() {
    // Will be implemented in next message
    contentArea.innerHTML = '<p class="text-center py-5">Design panel coming in next step...</p>';
  }
};
