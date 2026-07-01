const Forms = {
  currentTab: 'forms',
  formFields: [],
  editingFieldIndex: -1,

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading forms...</p>';

    if (this.currentTab === 'builder') {
      await this.renderBuilder();
      return;
    }
    if (this.currentTab === 'submissions') {
      await this.renderSubmissions();
      return;
    }

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
        .template-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .template-card { background: #fff; border: 2px solid #e0e0e0; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: 0.2s; }
        .template-card:hover { border-color: #1877f2; background: #f0f7ff; }
        .template-card.active { border-color: #1877f2; background: #e7f3ff; }
        @media (max-width: 768px) { .template-grid { grid-template-columns: 1fr; } }
      </style>

      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="mb-0"><i class="fas fa-wpforms text-primary me-2"></i>Form Builder</h4>
        <button class="btn btn-primary" onclick="Forms.currentTab='builder'; Forms.render();">
          <i class="fas fa-plus me-1"></i> Create New Form
        </button>
      </div>

      <div class="row g-3" id="formsList">
        ${forms.length === 0 ? '<div class="col-12"><p class="text-muted text-center py-4">No forms yet. Create your first form!</p></div>' : forms.map(f => `
          <div class="col-md-6 col-lg-4">
            <div class="form-card" onclick="Forms.editForm('${f.id}')">
              <div class="d-flex gap-3 align-items-center mb-2">
                <div class="form-icon bg-${f.source==='WhatsApp'?'success':f.source==='Facebook'?'primary':f.source==='Website'?'info':'secondary'} bg-opacity-10">
                  <i class="fas fa-${f.source==='WhatsApp'?'whatsapp':f.source==='Facebook'?'facebook':f.source==='Website'?'globe':'wpforms'} text-${f.source==='WhatsApp'?'success':f.source==='Facebook'?'primary':f.source==='Website'?'info':'secondary'}"></i>
                </div>
                <div>
                  <strong>${f.name || 'Untitled'}</strong>
                  <br><small class="text-muted">${f.source || 'General'}</small>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">${(f.fields || []).length} fields · ${f.submissionCount || 0} submissions</small>
                <div class="d-flex gap-1" onclick="event.stopPropagation();">
                  <button class="btn btn-sm btn-outline-primary" onclick="Forms.getFormLink('${f.id}')" title="Get Link"><i class="fas fa-link"></i></button>
                  <button class="btn btn-sm btn-outline-info" onclick="Forms.currentTab='submissions'; Forms.currentFormId='${f.id}'; Forms.render();" title="View Submissions"><i class="fas fa-list"></i></button>
                  <button class="btn btn-sm btn-outline-danger" onclick="Forms.deleteForm('${f.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    contentArea.innerHTML = html;
  },

  // ==================== FORM BUILDER ====================
  async renderBuilder(formId = null) {
    let form = { name: '', source: 'General', fields: [] };
    if (formId) {
      const doc = await db.collection('forms').doc(formId).get();
      if (doc.exists) form = { id: formId, ...doc.data() };
    }
    this.formFields = [...(form.fields || [])];
    this.currentFormId = formId || null;

    let html = `
      <style>
        .builder-layout { display: grid; grid-template-columns: 280px 1fr 360px; gap: 20px; }
        .field-types-panel { background: #fff; border-radius: 12px; padding: 16px; border: 1px solid #e0e0e0; height: fit-content; }
        .field-type-item { padding: 10px 12px; border-radius: 8px; cursor: grab; margin-bottom: 6px; display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 500; border: 1px solid transparent; transition: 0.15s; }
        .field-type-item:hover { background: #f0f7ff; border-color: #1877f2; }
        .field-type-item .ft-icon { width: 32px; height: 32px; border-radius: 6px; background: #f0f2f5; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .builder-canvas { background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #e0e0e0; min-height: 500px; }
        .canvas-field { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 14px; margin-bottom: 8px; cursor: grab; transition: 0.15s; position: relative; }
        .canvas-field:hover { border-color: #1877f2; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .canvas-field.drag-over { border-color: #1877f2; background: #f0f7ff; }
        .canvas-field .field-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .canvas-field .field-label { font-weight: 600; font-size: 14px; }
        .canvas-field .field-required { color: #fa3e3e; margin-left: 2px; }
        .canvas-field .field-preview { }
        .canvas-field .field-preview input, .canvas-field .field-preview select { width: 100%; padding: 8px 12px; border: 1px solid #dadde1; border-radius: 6px; font-size: 13px; background: #f9fafb; }
        .canvas-field .field-actions { display: flex; gap: 4px; position: absolute; top: 8px; right: 8px; opacity: 0; transition: 0.15s; }
        .canvas-field:hover .field-actions { opacity: 1; }
        .preview-panel { background: #f0f2f5; border-radius: 12px; padding: 20px; border: 1px solid #e0e0e0; }
        .preview-phone { background: #fff; border-radius: 16px; padding: 20px; max-width: 320px; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .preview-phone .preview-field { margin-bottom: 14px; }
        .preview-phone label { font-weight: 500; font-size: 12px; color: #555; display: block; margin-bottom: 4px; }
        .preview-phone input, .preview-phone select, .preview-phone textarea { width: 100%; padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; }
        .preview-phone .preview-checkbox, .preview-phone .preview-radio { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; font-size: 13px; }
        .preview-phone .btn-submit { background: #1877f2; color: #fff; border: none; padding: 10px; border-radius: 8px; width: 100%; font-weight: 600; font-size: 14px; cursor: pointer; }
        @media (max-width: 1200px) { .builder-layout { grid-template-columns: 1fr; } .field-types-panel { display: flex; flex-wrap: wrap; gap: 8px; } .field-type-item { flex: 1; min-width: 120px; } }
      </style>

      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 class="mb-0"><i class="fas fa-wpforms text-primary me-2"></i>${formId ? 'Edit' : 'Create'} Form</h4>
          <button class="btn btn-link btn-sm p-0" onclick="Forms.currentTab='forms'; Forms.render();"><i class="fas fa-arrow-left me-1"></i> Back to Forms</button>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary btn-sm" onclick="Forms.getFormLink(formId || 'preview')"><i class="fas fa-eye me-1"></i> Preview</button>
          <button class="btn btn-success btn-sm" onclick="Forms.saveForm()"><i class="fas fa-save me-1"></i> Save Form</button>
        </div>
      </div>

      <!-- Form Settings -->
      <div class="card-widget mb-3">
        <div class="row g-2">
          <div class="col-md-4">
            <label class="form-label small fw-bold">Form Name</label>
            <input type="text" id="formName" class="form-control form-control-sm" value="${form.name}" placeholder="e.g. Website Contact Form">
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-bold">Lead Source</label>
            <select id="formSource" class="form-select form-select-sm">
              <option value="General" ${form.source==='General'?'selected':''}>General</option>
              <option value="WhatsApp" ${form.source==='WhatsApp'?'selected':''}>WhatsApp</option>
              <option value="Facebook" ${form.source==='Facebook'?'selected':''}>Facebook Lead Ads</option>
              <option value="Website" ${form.source==='Website'?'selected':''}>Website</option>
              <option value="Email" ${form.source==='Email'?'selected':''}>Email Marketing</option>
              <option value="Instagram" ${form.source==='Instagram'?'selected':''}>Instagram</option>
            </select>
          </div>
          <div class="col-md-5">
            <label class="form-label small fw-bold">Success Message</label>
            <input type="text" id="formSuccessMsg" class="form-control form-control-sm" value="${form.successMsg || 'Thank you! Your form has been submitted.'}" placeholder="Thank you message after submission">
          </div>
        </div>
      </div>

      <div class="builder-layout">
        <!-- LEFT: Field Types -->
        <div class="field-types-panel">
          <h6 class="mb-3">Add Fields</h6>
          <div class="field-type-item" onclick="Forms.addField('text')"><div class="ft-icon"><i class="fas fa-font"></i></div>Text</div>
          <div class="field-type-item" onclick="Forms.addField('number')"><div class="ft-icon"><i class="fas fa-sort-numeric-up"></i></div>Number</div>
          <div class="field-type-item" onclick="Forms.addField('email')"><div class="ft-icon"><i class="fas fa-envelope"></i></div>Email</div>
          <div class="field-type-item" onclick="Forms.addField('date')"><div class="ft-icon"><i class="fas fa-calendar"></i></div>Date</div>
          <div class="field-type-item" onclick="Forms.addField('dropdown')"><div class="ft-icon"><i class="fas fa-caret-down"></i></div>Dropdown</div>
          <div class="field-type-item" onclick="Forms.addField('radio')"><div class="ft-icon"><i class="fas fa-dot-circle"></i></div>Radio</div>
          <div class="field-type-item" onclick="Forms.addField('checkbox')"><div class="ft-icon"><i class="fas fa-check-square"></i></div>Checkbox</div>
          <div class="field-type-item" onclick="Forms.addField('textarea')"><div class="ft-icon"><i class="fas fa-align-left"></i></div>Textarea</div>
          <div class="field-type-item" onclick="Forms.addField('file')"><div class="ft-icon"><i class="fas fa-upload"></i></div>File Upload</div>
          <div class="field-type-item" onclick="Forms.addField('phone')"><div class="ft-icon"><i class="fas fa-phone"></i></div>Phone</div>
        </div>

        <!-- CENTER: Builder Canvas -->
        <div class="builder-canvas" id="builderCanvas">
          <h6 class="mb-3">Form Fields</h6>
          <div id="canvasFields">
            ${this.formFields.length === 0 ? '<p class="text-muted text-center py-4">Click on field types from left panel to add fields.</p>' : this.formFields.map((f, i) => this.renderCanvasField(f, i)).join('')}
          </div>
          ${this.formFields.length > 0 ? `<button class="btn btn-outline-secondary btn-sm w-100 mt-2" onclick="Forms.addField('text')"><i class="fas fa-plus me-1"></i> Add More Field</button>` : ''}
        </div>

        <!-- RIGHT: Live Preview -->
        <div class="preview-panel">
          <h6 class="mb-3">Live Preview</h6>
          <div class="preview-phone" id="formPreview">
            ${this.renderPreview()}
          </div>
        </div>
      </div>

      <!-- Edit Field Modal -->
      <div id="editFieldModal" style="display:none;"></div>
    `;
    contentArea.innerHTML = html;

    // Init Sortable
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

  renderCanvasField(field, index) {
    const typeIcons = { text: 'font', number: 'sort-numeric-up', email: 'envelope', date: 'calendar', dropdown: 'caret-down', radio: 'dot-circle', checkbox: 'check-square', textarea: 'align-left', file: 'upload', phone: 'phone' };
    return `
      <div class="canvas-field" data-index="${index}">
        <div class="field-header">
          <div>
            <span class="field-label">${field.label || 'Untitled'} ${field.required ? '<span class="field-required">*</span>' : ''}</span>
            <small class="text-muted ms-2">${field.type}</small>
          </div>
        </div>
        <div class="field-preview">
          ${field.type === 'dropdown' ? `<select><option>${field.options?.[0] || 'Select...'}</option>${(field.options || []).slice(1).map(o => `<option>${o}</option>`).join('')}</select>` :
            field.type === 'radio' ? (field.options || []).map(o => `<div class="preview-checkbox"><input type="radio" name="r_${index}" disabled> ${o}</div>`).join('') :
            field.type === 'checkbox' ? (field.options || []).map(o => `<div class="preview-checkbox"><input type="checkbox" disabled> ${o}</div>`).join('') :
            field.type === 'textarea' ? `<textarea rows="2" disabled style="width:100%;border:1px solid #dadde1;border-radius:6px;background:#f9fafb;"></textarea>` :
            field.type === 'file' ? `<input type="file" disabled>` :
            `<input type="${field.type || 'text'}" disabled placeholder="${field.placeholder || ''}">`}
        </div>
        <div class="field-actions">
          <button class="btn btn-sm btn-outline-info" onclick="Forms.editField(${index})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-outline-danger" onclick="Forms.removeField(${index})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
  },

  renderPreview() {
    const name = document.getElementById('formName')?.value || 'Untitled Form';
    const source = document.getElementById('formSource')?.value || 'General';
    return `
      <h5 style="text-align:center;margin-bottom:4px;">${name}</h5>
      <small class="text-muted d-block text-center mb-3">${source}</small>
      ${this.formFields.map((f, i) => `
        <div class="preview-field">
          <label>${f.label} ${f.required ? '<span style="color:#fa3e3e;">*</span>' : ''}</label>
          ${f.type === 'dropdown' ? `<select><option>${f.options?.[0] || 'Select...'}</option>${(f.options || []).slice(1).map(o => `<option>${o}</option>`).join('')}</select>` :
            f.type === 'radio' ? (f.options || []).map(o => `<div class="preview-checkbox"><input type="radio" name="pr_${i}" disabled> ${o}</div>`).join('') :
            f.type === 'checkbox' ? (f.options || []).map(o => `<div class="preview-checkbox"><input type="checkbox" disabled> ${o}</div>`).join('') :
            f.type === 'textarea' ? `<textarea rows="3" disabled style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;"></textarea>` :
            f.type === 'file' ? `<input type="file" disabled style="width:100%;">` :
            `<input type="${f.type || 'text'}" disabled placeholder="${f.placeholder || ''}">`}
        </div>
      `).join('')}
      <button class="btn-submit">Submit</button>
    `;
  },

  addField(type) {
    const newField = { type, label: this.getDefaultLabel(type), required: false, options: type === 'dropdown' || type === 'radio' || type === 'checkbox' ? ['Option 1', 'Option 2', 'Option 3'] : [], placeholder: '' };
    this.formFields.push(newField);
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
          ${['dropdown', 'radio', 'checkbox'].includes(f.type) ? `
            <div class="mb-3"><label class="form-label small">Options (one per line)</label><textarea id="editOptions" class="form-control form-control-sm" rows="4">${(f.options || []).join('\n')}</textarea></div>
          ` : ''}
          <div class="form-check mb-3"><input class="form-check-input" type="checkbox" id="editRequired" ${f.required ? 'checked' : ''}><label class="form-check-label">Required</label></div>
          <button class="btn btn-primary btn-sm" onclick="Forms.saveFieldEdit(${index})">Save</button>
          <button class="btn btn-light btn-sm" onclick="Forms.closeEditModal()">Cancel</button>
        </div>
      </div>
    `;
  },

  saveFieldEdit(index) {
    this.formFields[index].label = document.getElementById('editLabel').value.trim();
    this.formFields[index].placeholder = document.getElementById('editPlaceholder').value.trim();
    this.formFields[index].required = document.getElementById('editRequired').checked;
    if (document.getElementById('editOptions')) {
      this.formFields[index].options = document.getElementById('editOptions').value.split('\n').map(o => o.trim()).filter(Boolean);
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
    if (this.formFields.length > 0) {
      canvas.innerHTML += `<button class="btn btn-outline-secondary btn-sm w-100 mt-2" onclick="Forms.addField('text')"><i class="fas fa-plus me-1"></i> Add More Field</button>`;
    }
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
    const data = { name, source, successMsg, fields: this.formFields, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
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

  editForm(id) {
    this.currentTab = 'builder';
    this.currentFormId = id;
    this.render();
  },

  getFormLink(formId) {
    if (formId === 'preview') {
      alert('Save the form first to get a shareable link.');
      return;
    }
    const link = `https://allimpliments.github.io/WA-Dual-CRM/?form=${formId}`;
    prompt('Copy this link to share your form:', link);
  },

  // ==================== SUBMISSIONS ====================
  async renderSubmissions() {
    const formId = this.currentFormId;
    const formDoc = await db.collection('forms').doc(formId).get();
    const form = formDoc.data();
    const subsSnap = await db.collection('formSubmissions').where('formId', '==', formId).orderBy('createdAt', 'desc').get();
    const submissions = subsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    let html = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="mb-0"><i class="fas fa-list me-2"></i>Submissions: ${form.name}</h4>
        <button class="btn btn-outline-primary btn-sm" onclick="Forms.currentTab='forms'; Forms.render();"><i class="fas fa-arrow-left me-1"></i> Back</button>
      </div>
      <div class="card-widget">
        <p>Total Submissions: <strong>${submissions.length}</strong></p>
        ${submissions.length === 0 ? '<p class="text-muted">No submissions yet.</p>' : `
          <div class="table-responsive">
            <table class="table table-sm">
              <thead><tr><th>#</th>${(form.fields || []).map(f => `<th>${f.label}</th>`).join('')}<th>Date</th></tr></thead>
              <tbody>
                ${submissions.map((s, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    ${(form.fields || []).map(f => `<td>${(s.data && s.data[f.label]) || '-'}</td>`).join('')}
                    <td><small>${s.createdAt?.toDate().toLocaleString() || '-'}</small></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
    contentArea.innerHTML = html;
  },

  async deleteForm(id) {
    if (!confirm('Delete this form and all its submissions?')) return;
    await db.collection('forms').doc(id).delete();
    alert('Deleted.');
    this.render();
  }
};
