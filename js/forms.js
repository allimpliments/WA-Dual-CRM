const Forms = {
  currentTab: 'forms', // 'forms' or 'builder'

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading forms...</p>';

    if (this.currentTab === 'builder') {
      await this.renderBuilder();
      return;
    }

    let forms = [];
    try {
      const snap = await db.collection('forms').orderBy('createdAt', 'desc').get();
      forms = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) { console.error(err); }

    let html = `
      <div class="card-widget">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="mb-0"><i class="fas fa-wpforms text-primary me-2"></i>Form Builder</h4>
          <button class="btn btn-primary btn-sm" onclick="Forms.currentTab='builder'; Forms.render();">
            <i class="fas fa-plus me-1"></i> Create New Form
          </button>
        </div>
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr><th>Form Name</th><th>Source</th><th>Fields</th><th>Submissions</th><th>Actions</th></tr>
            </thead>
            <tbody>
              ${forms.length === 0 ? '<tr><td colspan="5" class="text-center text-muted py-4">No forms yet. Create your first form!</td></tr>' : forms.map(f => `
                <tr>
                  <td><strong>${f.name || 'Untitled'}</strong></td>
                  <td><span class="badge bg-info">${f.source || 'General'}</span></td>
                  <td>${(f.fields || []).length} fields</td>
                  <td>${f.submissionCount || 0}</td>
                  <td>
                    <button class="btn btn-sm btn-outline-info me-1" onclick="Forms.editForm('${f.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-success me-1" onclick="Forms.viewSubmissions('${f.id}')"><i class="fas fa-list"></i></button>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="Forms.getFormLink('${f.id}')"><i class="fas fa-link"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="Forms.deleteForm('${f.id}')"><i class="fas fa-trash"></i></button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  async renderBuilder(formId = null) {
    let form = { name: '', source: 'General', fields: [] };
    if (formId) {
      const doc = await db.collection('forms').doc(formId).get();
      if (doc.exists) form = { id: formId, ...doc.data() };
    }

    let html = `
      <style>
        .form-builder { display: grid; grid-template-columns: 1fr 400px; gap: 24px; }
        .field-card { background: #fff; border: 1px solid #dadde1; border-radius: 8px; padding: 12px; margin-bottom: 8px; display: flex; align-items: center; gap: 12px; cursor: move; }
        .field-card:hover { border-color: #1877f2; }
        .field-card .field-icon { width: 32px; height: 32px; border-radius: 6px; background: #f0f2f5; display: flex; align-items: center; justify-content: center; color: #65676b; }
        .field-card .field-info { flex: 1; }
        .field-card .field-name { font-weight: 600; font-size: 14px; }
        .field-card .field-type { font-size: 12px; color: #65676b; }
        .field-card .field-actions { display: flex; gap: 4px; }
        .preview-box { background: #f0f2f5; border-radius: 8px; padding: 16px; min-height: 400px; }
        .preview-field { margin-bottom: 12px; }
        .preview-field label { font-weight: 500; font-size: 13px; display: block; margin-bottom: 4px; }
        .preview-field input, .preview-field select { width: 100%; padding: 8px 12px; border: 1px solid #dadde1; border-radius: 6px; font-size: 14px; }
        @media (max-width: 1024px) { .form-builder { grid-template-columns: 1fr; } }
      </style>

      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="mb-0"><i class="fas fa-wpforms text-primary me-2"></i>${formId ? 'Edit' : 'Create'} Form</h4>
        <button class="btn btn-outline-primary btn-sm" onclick="Forms.currentTab='forms'; Forms.render();">
          <i class="fas fa-arrow-left me-1"></i> Back to Forms
        </button>
      </div>

      <div class="form-builder">
        <div>
          <div class="card-widget mb-3">
            <div class="row g-2">
              <div class="col-md-6">
                <label class="form-label small fw-bold">Form Name</label>
                <input type="text" id="formName" class="form-control form-control-sm" value="${form.name}" placeholder="e.g. Website Contact Form">
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Lead Source</label>
                <select id="formSource" class="form-select form-select-sm">
                  <option value="General" ${form.source==='General'?'selected':''}>General</option>
                  <option value="WhatsApp" ${form.source==='WhatsApp'?'selected':''}>WhatsApp</option>
                  <option value="Facebook" ${form.source==='Facebook'?'selected':''}>Facebook Lead Ads</option>
                  <option value="Website" ${form.source==='Website'?'selected':''}>Website</option>
                  <option value="Email" ${form.source==='Email'?'selected':''}>Email Marketing</option>
                  <option value="Instagram" ${form.source==='Instagram'?'selected':''}>Instagram</option>
                  <option value="Other" ${form.source==='Other'?'selected':''}>Other</option>
                </select>
              </div>
            </div>
          </div>

          <div class="card-widget mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="mb-0">Form Fields</h5>
              <button class="btn btn-primary btn-sm" onclick="Forms.showAddField()"><i class="fas fa-plus me-1"></i> Add Field</button>
            </div>
            <div id="addFieldForm"></div>
            <div id="fieldsList">
              ${(form.fields || []).length === 0 ? '<p class="text-muted text-center py-3">No fields yet. Add your first field.</p>' : form.fields.map((f, i) => `
                <div class="field-card">
                  <div class="field-icon"><i class="fas fa-${f.type==='text'?'font':f.type==='number'?'sort-numeric-up':f.type==='email'?'envelope':f.type==='dropdown'?'caret-down':f.type==='checkbox'?'check-square':f.type==='date'?'calendar':'circle'}"></i></div>
                  <div class="field-info">
                    <div class="field-name">${f.label} ${f.required ? '<span class="text-danger">*</span>' : ''}</div>
                    <div class="field-type">${f.type}${f.options ? ' (' + f.options + ')' : ''}</div>
                  </div>
                  <div class="field-actions">
                    <button class="btn btn-sm btn-outline-info" onclick="Forms.editField(${i})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="Forms.removeField(${i})"><i class="fas fa-trash"></i></button>
                    ${i > 0 ? `<button class="btn btn-sm btn-outline-secondary" onclick="Forms.moveField(${i}, 'up')"><i class="fas fa-arrow-up"></i></button>` : ''}
                    ${i < (form.fields||[]).length - 1 ? `<button class="btn btn-sm btn-outline-secondary" onclick="Forms.moveField(${i}, 'down')"><i class="fas fa-arrow-down"></i></button>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <button class="btn btn-success btn-sm me-2" onclick="Forms.saveForm('${formId || ''}')"><i class="fas fa-save me-1"></i> Save Form</button>
          <button class="btn btn-outline-primary btn-sm" onclick="Forms.saveForm('${formId || ''}')">Update Preview</button>
        </div>

        <div>
          <div class="card-widget">
            <h5 class="mb-3">Live Preview</h5>
            <div class="preview-box" id="formPreview">
              <h5 style="margin:0 0 4px 0;">${form.name || 'Untitled Form'}</h5>
              <small class="text-muted d-block mb-3">Source: ${form.source || 'General'}</small>
              ${(form.fields || []).map(f => `
                <div class="preview-field">
                  <label>${f.label} ${f.required ? '<span class="text-danger">*</span>' : ''}</label>
                  ${f.type === 'dropdown' ? `<select><option>${f.options?.split(',')[0]?.trim() || 'Select...'}</option>${(f.options||'').split(',').slice(1).map(o => `<option>${o.trim()}</option>`).join('')}</select>` :
                    f.type === 'checkbox' ? `<div><input type="checkbox"> ${f.options || 'Yes'}</div>` :
                    `<input type="${f.type || 'text'}" placeholder="${f.label}">`}
                </div>
              `).join('')}
              <button class="btn btn-primary btn-sm w-100 mt-2">Submit</button>
            </div>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
    window._currentFormFields = form.fields || [];
  },

  editForm(id) {
    this.currentTab = 'builder';
    this.renderBuilder(id);
  },

  showAddField() {
    document.getElementById('addFieldForm').innerHTML = `
      <div class="card mb-3 border-info"><div class="card-body p-2">
        <div class="row g-2">
          <div class="col-md-3"><input type="text" id="newFieldLabel" class="form-control form-control-sm" placeholder="Label (e.g. Full Name)"></div>
          <div class="col-md-2">
            <select id="newFieldType" class="form-select form-select-sm" onchange="Forms.toggleFieldOptions()">
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="email">Email</option>
              <option value="date">Date</option>
              <option value="dropdown">Dropdown</option>
              <option value="checkbox">Checkbox</option>
            </select>
          </div>
          <div class="col-md-3" id="fieldOptionsGroup" style="display:none;">
            <input type="text" id="newFieldOptions" class="form-control form-control-sm" placeholder="Option1, Option2, Option3">
          </div>
          <div class="col-md-2"><div class="form-check"><input class="form-check-input" type="checkbox" id="newFieldRequired"><label class="form-check-label">Required</label></div></div>
          <div class="col-md-2"><button class="btn btn-success btn-sm w-100" onclick="Forms.addField()">Add</button></div>
        </div>
      </div></div>
    `;
  },

  toggleFieldOptions() {
    const type = document.getElementById('newFieldType')?.value;
    const group = document.getElementById('fieldOptionsGroup');
    if (group) group.style.display = (type === 'dropdown' || type === 'checkbox') ? 'block' : 'none';
  },

  addField() {
    const label = document.getElementById('newFieldLabel').value.trim();
    const type = document.getElementById('newFieldType').value;
    const required = document.getElementById('newFieldRequired').checked;
    const options = document.getElementById('newFieldOptions')?.value.trim() || '';
    if (!label) return alert('Field label required!');
    window._currentFormFields = window._currentFormFields || [];
    window._currentFormFields.push({ label, type, required, options });
    this.refreshBuilderUI();
  },

  editField(index) {
    const f = window._currentFormFields[index];
    document.getElementById('addFieldForm').innerHTML = `
      <div class="card mb-3 border-info"><div class="card-body p-2">
        <div class="row g-2">
          <div class="col-md-3"><input type="text" id="editFieldLabel" class="form-control form-control-sm" value="${f.label}"></div>
          <div class="col-md-2">
            <select id="editFieldType" class="form-select form-select-sm" onchange="Forms.toggleEditFieldOptions()">
              <option value="text" ${f.type==='text'?'selected':''}>Text</option>
              <option value="number" ${f.type==='number'?'selected':''}>Number</option>
              <option value="email" ${f.type==='email'?'selected':''}>Email</option>
              <option value="date" ${f.type==='date'?'selected':''}>Date</option>
              <option value="dropdown" ${f.type==='dropdown'?'selected':''}>Dropdown</option>
              <option value="checkbox" ${f.type==='checkbox'?'selected':''}>Checkbox</option>
            </select>
          </div>
          <div class="col-md-3" id="editFieldOptionsGroup" style="display:${(f.type==='dropdown'||f.type==='checkbox')?'block':'none'};">
            <input type="text" id="editFieldOptions" class="form-control form-control-sm" value="${f.options||''}" placeholder="Option1, Option2">
          </div>
          <div class="col-md-2"><div class="form-check"><input class="form-check-input" type="checkbox" id="editFieldRequired" ${f.required?'checked':''}><label class="form-check-label">Required</label></div></div>
          <div class="col-md-2"><button class="btn btn-success btn-sm w-100" onclick="Forms.updateField(${index})">Update</button></div>
        </div>
      </div></div>
    `;
  },

  toggleEditFieldOptions() {
    const type = document.getElementById('editFieldType')?.value;
    const group = document.getElementById('editFieldOptionsGroup');
    if (group) group.style.display = (type === 'dropdown' || type === 'checkbox') ? 'block' : 'none';
  },

  updateField(index) {
    window._currentFormFields[index] = {
      label: document.getElementById('editFieldLabel').value.trim(),
      type: document.getElementById('editFieldType').value,
      required: document.getElementById('editFieldRequired').checked,
      options: document.getElementById('editFieldOptions')?.value.trim() || ''
    };
    this.refreshBuilderUI();
  },

  removeField(index) {
    window._currentFormFields.splice(index, 1);
    this.refreshBuilderUI();
  },

  moveField(index, direction) {
    const fields = window._currentFormFields;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;
    [fields[index], fields[newIndex]] = [fields[newIndex], fields[index]];
    this.refreshBuilderUI();
  },

  refreshBuilderUI() {
    // Re-render the fields list and preview
    const fields = window._currentFormFields;
    const fieldsList = document.getElementById('fieldsList');
    const preview = document.getElementById('formPreview');
    const formName = document.getElementById('formName')?.value || 'Untitled Form';
    const formSource = document.getElementById('formSource')?.value || 'General';

    if (fieldsList) {
      fieldsList.innerHTML = fields.length === 0 ? '<p class="text-muted text-center py-3">No fields yet.</p>' : fields.map((f, i) => `
        <div class="field-card">
          <div class="field-icon"><i class="fas fa-${f.type==='text'?'font':f.type==='number'?'sort-numeric-up':f.type==='email'?'envelope':f.type==='dropdown'?'caret-down':f.type==='checkbox'?'check-square':f.type==='date'?'calendar':'circle'}"></i></div>
          <div class="field-info">
            <div class="field-name">${f.label} ${f.required ? '<span class="text-danger">*</span>' : ''}</div>
            <div class="field-type">${f.type}${f.options ? ' (' + f.options + ')' : ''}</div>
          </div>
          <div class="field-actions">
            <button class="btn btn-sm btn-outline-info" onclick="Forms.editField(${i})"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-outline-danger" onclick="Forms.removeField(${i})"><i class="fas fa-trash"></i></button>
            ${i > 0 ? `<button class="btn btn-sm btn-outline-secondary" onclick="Forms.moveField(${i}, 'up')"><i class="fas fa-arrow-up"></i></button>` : ''}
            ${i < fields.length - 1 ? `<button class="btn btn-sm btn-outline-secondary" onclick="Forms.moveField(${i}, 'down')"><i class="fas fa-arrow-down"></i></button>` : ''}
          </div>
        </div>
      `).join('');
    }

    if (preview) {
      preview.innerHTML = `
        <h5 style="margin:0 0 4px 0;">${formName}</h5>
        <small class="text-muted d-block mb-3">Source: ${formSource}</small>
        ${fields.map(f => `
          <div class="preview-field">
            <label>${f.label} ${f.required ? '<span class="text-danger">*</span>' : ''}</label>
            ${f.type === 'dropdown' ? `<select><option>${f.options?.split(',')[0]?.trim() || 'Select...'}</option>${(f.options||'').split(',').slice(1).map(o => `<option>${o.trim()}</option>`).join('')}</select>` :
              f.type === 'checkbox' ? `<div><input type="checkbox"> ${f.options || 'Yes'}</div>` :
              `<input type="${f.type || 'text'}" placeholder="${f.label}">`}
          </div>
        `).join('')}
        <button class="btn btn-primary btn-sm w-100 mt-2">Submit</button>
      `;
    }
  },

  async saveForm(formId) {
    const name = document.getElementById('formName').value.trim();
    const source = document.getElementById('formSource').value;
    if (!name) return alert('Form name required!');
    const data = { name, source, fields: window._currentFormFields || [], updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
    try {
      if (formId) {
        await db.collection('forms').doc(formId).update(data);
      } else {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.submissionCount = 0;
        await db.collection('forms').add(data);
      }
      alert('✅ Form saved!');
      this.currentTab = 'forms';
      this.render();
    } catch (err) { alert('Error: ' + err.message); }
  },

  getFormLink(formId) {
    const link = `https://allimpliments.github.io/WA-Dual-CRM/?form=${formId}`;
    prompt('Copy this link to share your form:', link);
  },

  async viewSubmissions(formId) {
    const subs = await db.collection('formSubmissions').where('formId', '==', formId).orderBy('createdAt', 'desc').get();
    const submissions = subs.docs.map(d => ({ id: d.id, ...d.data() }));
    alert(`${submissions.length} submissions for this form.\n\nCheck Firebase Console for details.`);
  },

  async deleteForm(id) {
    if (!confirm('Delete this form?')) return;
    await db.collection('forms').doc(id).delete();
    alert('Deleted.');
    this.render();
  }
};
