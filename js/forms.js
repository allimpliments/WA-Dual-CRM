const Forms = {
  currentTab: 'forms',
  formFields: [],
  currentFormId: null,
  formDesign: {
    primaryColor: '#1877f2',
    buttonTextColor: '#ffffff',
    backgroundColor: '#ffffff',
    fontFamily: 'Inter, sans-serif',
    titleColor: '#1c1e21',
    titleFontSize: '24px',
    borderStyle: 'solid',
    bannerUrl: '',
    logoUrl: '',
    customCSS: ''
  },

  // ==================== RENDER ====================
  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading...</p>';

    if (this.currentTab === 'builder') {
      await this.renderBuilder(this.currentFormId);
      return;
    }
    if (this.currentTab === 'design') {
      await this.renderDesignPanel();
      return;
    }
    if (this.currentTab === 'submissions') {
      await this.renderSubmissions();
      return;
    }

    // Main Forms List
    let forms = [];
    try {
      const snap = await db.collection('forms').orderBy('createdAt', 'desc').get();
      forms = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) { console.error(err); }

    let html = `
      <style>
        .form-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px; margin-bottom: 16px; cursor: pointer; transition: 0.2s; }
        .form-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-color: #1877f2; }
      </style>
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="mb-0"><i class="fas fa-wpforms text-primary me-2"></i>Form Builder</h4>
        <button class="btn btn-primary" onclick="Forms.currentTab='builder'; Forms.currentFormId=null; Forms.render();"><i class="fas fa-plus me-1"></i> Create New Form</button>
      </div>
      <div class="row g-3">
        ${forms.length === 0 ? '<div class="col-12"><p class="text-muted text-center py-4">No forms yet.</p></div>' : forms.map(f => `
          <div class="col-md-6 col-lg-4">
            <div class="form-card" onclick="Forms.editForm('${f.id}')">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <strong>${f.name || 'Untitled'}</strong><br>
                  <small class="text-muted">${f.source || 'General'}</small>
                </div>
                <div class="d-flex gap-1" onclick="event.stopPropagation();">
                  <button class="btn btn-sm btn-outline-primary" onclick="Forms.getFormLink('${f.id}')"><i class="fas fa-link"></i></button>
                  <button class="btn btn-sm btn-outline-info" onclick="Forms.currentTab='submissions'; Forms.currentFormId='${f.id}'; Forms.render();"><i class="fas fa-list"></i></button>
                  <button class="btn btn-sm btn-outline-danger" onclick="Forms.deleteForm('${f.id}')"><i class="fas fa-trash"></i></button>
                </div>
              </div>
              <small class="text-muted">${(f.fields || []).length} fields · ${f.submissionCount || 0} submissions</small>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    contentArea.innerHTML = html;
  },

  editForm(id) {
    this.currentTab = 'builder';
    this.currentFormId = id;
    this.render();
  },

  // ==================== FORM BUILDER ====================
  async renderBuilder(formId = null) {
    const effectiveFormId = formId || this.currentFormId;

    if (effectiveFormId) {
      const doc = await db.collection('forms').doc(effectiveFormId).get();
      if (doc.exists) {
        const data = doc.data();
        this.formFields = JSON.parse(JSON.stringify(data.fields || []));
        this.formDesign = { ...this.formDesign, ...(data.design || {}) };
        this.currentFormId = effectiveFormId;
      }
    } else {
      this.formFields = [];
      this.currentFormId = null;
    }

    let html = `
      <style>
        .builder-layout { display: grid; grid-template-columns: 220px 1fr 360px; gap: 16px; }
        .field-palette { background: #fff; border: 1px solid #e0e0e0; border-radius: 12px; padding: 12px; height: fit-content; }
        .palette-item { padding: 8px 12px; border-radius: 8px; cursor: pointer; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; transition: 0.15s; }
        .palette-item:hover { background: #e7f3ff; }
        .canvas { background: #fff; border: 1px solid #e0e0e0; border-radius: 12px; padding: 16px; min-height: 500px; }
        .field-row { background: #fafbfc; border: 1px solid #e0e0e0; border-radius: 8px; padding: 10px; margin-bottom: 8px; cursor: grab; display: flex; gap: 12px; align-items: center; transition: 0.15s; }
        .field-row:hover { border-color: #1877f2; box-shadow: 0 2px 6px rgba(0,0,0,0.04); }
        .field-row .field-info { flex: 1; }
        .field-row .field-preview { margin-top: 4px; }
        .field-row .field-preview input, .field-row .field-preview select, .field-row .field-preview textarea { width: 100%; padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; background: #fff; }
        .preview-panel { background: #fff; border: 1px solid #e0e0e0; border-radius: 12px; padding: 16px; }
        .preview-phone { border-radius: 16px; padding: 20px; max-width: 360px; margin: 0 auto; box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
        .preview-field { margin-bottom: 12px; }
        .preview-field label { font-weight: 500; font-size: 12px; color: #555; display: block; margin-bottom: 4px; }
        .preview-field input, .preview-field select, .preview-field textarea { width: 100%; padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; }
        .preview-half { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .preview-full { grid-column: span 2; }
        .btn-submit { width: 100%; padding: 10px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; border: none; }
        @media (max-width: 1200px) { .builder-layout { grid-template-columns: 1fr; } }
      </style>

      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="mb-0"><i class="fas fa-wpforms text-primary me-2"></i>${effectiveFormId ? 'Edit' : 'Create'} Form</h4>
        <div class="d-flex gap-2">
          <button class="btn btn-light btn-sm" onclick="Forms.currentTab='forms'; Forms.currentFormId=null; Forms.render();"><i class="fas fa-times me-1"></i> Cancel</button>
          <button class="btn btn-outline-secondary btn-sm" onclick="Forms.currentTab='design'; Forms.render();"><i class="fas fa-palette me-1"></i> Design</button>
          <button class="btn btn-outline-primary btn-sm" onclick="Forms.getFormLink(effectiveFormId || 'preview')"><i class="fas fa-eye me-1"></i> Preview</button>
          <button class="btn btn-success btn-sm" onclick="Forms.saveForm()"><i class="fas fa-save me-1"></i> Save</button>
        </div>
      </div>

      <div class="card-widget mb-3">
        <div class="row g-2">
          <div class="col-md-4"><label class="form-label small fw-bold">Form Name</label><input type="text" id="formName" class="form-control form-control-sm" value="${effectiveFormId ? (await db.collection('forms').doc(effectiveFormId).get()).data().name || '' : ''}"></div>
          <div class="col-md-3"><label class="form-label small fw-bold">Lead Source</label><select id="formSource" class="form-select form-select-sm"><option value="General">General</option><option value="WhatsApp">WhatsApp</option><option value="Facebook">Facebook</option><option value="Website">Website</option></select></div>
          <div class="col-md-5"><label class="form-label small fw-bold">Success Message</label><input type="text" id="formSuccessMsg" class="form-control form-control-sm" value="${effectiveFormId ? (await db.collection('forms').doc(effectiveFormId).get()).data().successMsg || 'Thank you!' : 'Thank you!'}"></div>
        </div>
      </div>

      <div class="builder-layout">
        <div class="field-palette">
          <h6 class="mb-2">Field Types</h6>
          <div class="palette-item" onclick="Forms.addField('text')"><i class="fas fa-font"></i> Text</div>
          <div class="palette-item" onclick="Forms.addField('number')"><i class="fas fa-sort-numeric-up"></i> Number</div>
          <div class="palette-item" onclick="Forms.addField('email')"><i class="fas fa-envelope"></i> Email</div>
          <div class="palette-item" onclick="Forms.addField('date')"><i class="fas fa-calendar"></i> Date</div>
          <div class="palette-item" onclick="Forms.addField('dropdown')"><i class="fas fa-caret-down"></i> Dropdown</div>
          <div class="palette-item" onclick="Forms.addField('radio')"><i class="fas fa-dot-circle"></i> Radio</div>
          <div class="palette-item" onclick="Forms.addField('checkbox')"><i class="fas fa-check-square"></i> Checkbox</div>
          <div class="palette-item" onclick="Forms.addField('textarea')"><i class="fas fa-align-left"></i> Textarea</div>
          <div class="palette-item" onclick="Forms.addField('file')"><i class="fas fa-upload"></i> File</div>
          <div class="palette-item" onclick="Forms.addField('phone')"><i class="fas fa-phone"></i> Phone</div>
        </div>

        <div class="canvas" id="builderCanvas">
          <div id="canvasFields">
            ${this.formFields.length === 0 ? '<p class="text-muted text-center py-4">Click a field type to add it here.</p>' : this.formFields.map((f, i) => this.renderCanvasField(f, i)).join('')}
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

    // Set source dropdown after rendering
    if (effectiveFormId) {
      const doc = await db.collection('forms').doc(effectiveFormId).get();
      if (doc.exists) {
        const source = doc.data().source || 'General';
        const sel = document.getElementById('formSource');
        if (sel) sel.value = source;
      }
    }

    // Init Sortable
    setTimeout(() => {
      const canvas = document.getElementById('canvasFields');
      if (canvas && this.formFields.length > 0) {
        if (window._sortableInstance) window._sortableInstance.destroy();
        window._sortableInstance = new Sortable(canvas, {
          animation: 150,
          handle: '.field-row',
          onEnd: (evt) => {
            const moved = this.formFields.splice(evt.oldIndex, 1)[0];
            this.formFields.splice(evt.newIndex, 0, moved);
            this.refreshCanvas();
            this.refreshPreview();
          }
        });
      }
    }, 300);
  },

  renderCanvasField(field, index) {
    return `
      <div class="field-row" data-index="${index}">
        <div class="field-info">
          <strong>${field.label || 'Untitled'}</strong> <small class="text-muted">(${field.type})</small>
          <div class="field-preview">
            ${this.renderFieldHTML(field, index, true)}
          </div>
        </div>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-info" onclick="Forms.editField(${index})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-outline-danger" onclick="Forms.removeField(${index})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
  },

  renderFieldHTML(field, index, disabled = false) {
    const dis = disabled ? 'disabled' : '';
    switch (field.type) {
      case 'dropdown':
        return `<select ${dis}><option>${field.options?.[0] || 'Select...'}</option>${(field.options || []).slice(1).map(o => `<option>${o}</option>`).join('')}</select>`;
      case 'radio':
        return (field.options || []).map(o => `<div class="preview-checkbox"><input type="radio" name="r_${index}" ${dis}> ${o}</div>`).join('');
      case 'checkbox':
        return (field.options || []).map(o => `<div class="preview-checkbox"><input type="checkbox" ${dis}> ${o}</div>`).join('');
      case 'textarea':
        return `<textarea rows="2" ${dis}></textarea>`;
      case 'file':
        return `<input type="file" ${dis}>`;
      default:
        return `<input type="${field.type}" ${dis} placeholder="${field.placeholder || ''}">`;
    }
  },

  renderPreview() {
    let html = '';
    const name = document.getElementById('formName')?.value || 'Untitled Form';
    const source = document.getElementById('formSource')?.value || 'General';

    if (this.formDesign.bannerUrl) {
      html += `<img src="${this.formDesign.bannerUrl}" style="width:100%;border-radius:8px;margin-bottom:12px;">`;
    }
    if (this.formDesign.logoUrl) {
      html += `<div style="text-align:center;margin-bottom:8px;"><img src="${this.formDesign.logoUrl}" style="max-height:50px;"></div>`;
    }
    html += `<h4 style="text-align:center;color:${this.formDesign.titleColor};font-size:${this.formDesign.titleFontSize};margin-bottom:4px;">${name}</h4>`;
    html += `<small class="text-muted d-block text-center mb-3">${source}</small>`;

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
    if (this.formDesign.customCSS) {
      html += `<style>${this.formDesign.customCSS}</style>`;
    }
    return html;
  },

  renderPreviewField(field, index) {
    return `
      <div class="preview-field">
        <label>${field.label} ${field.required ? '<span style="color:#fa3e3e;">*</span>' : ''}</label>
        ${this.renderFieldHTML(field, index, true)}
      </div>
    `;
  },

  // ==================== FIELD CRUD ====================
  addField(type) {
    this.formFields.push({
      type, label: this.getDefaultLabel(type), required: false,
      options: ['dropdown', 'radio', 'checkbox'].includes(type) ? ['Option 1', 'Option 2', 'Option 3'] : [],
      placeholder: '', width: 'full'
    });
    this.refreshCanvas();
    this.refreshPreview();
  },

  getDefaultLabel(type) {
    const labels = { text: 'Name', number: 'Age', email: 'Email', date: 'Date', dropdown: 'Select', radio: 'Choose', checkbox: 'Options', textarea: 'Message', file: 'File', phone: 'Phone' };
    return labels[type] || 'Field';
  },

  editField(index) {
    const f = this.formFields[index];
    document.getElementById('editFieldModal').style.display = 'block';
    document.getElementById('editFieldModal').innerHTML = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:3000;display:flex;align-items:center;justify-content:center;" onclick="Forms.closeEditModal()">
        <div class="card-widget" style="width:480px;max-height:80vh;overflow-y:auto;" onclick="event.stopPropagation()">
          <h5>Edit Field</h5>
          <div class="mb-3"><label>Label</label><input type="text" id="editLabel" class="form-control form-control-sm" value="${f.label}"></div>
          <div class="mb-3"><label>Placeholder</label><input type="text" id="editPlaceholder" class="form-control form-control-sm" value="${f.placeholder || ''}"></div>
          <div class="mb-3"><label>Width</label><select id="editWidth" class="form-select form-select-sm"><option value="full" ${f.width==='full'?'selected':''}>100%</option><option value="half" ${f.width==='half'?'selected':''}>50%</option></select></div>
          ${['dropdown', 'radio', 'checkbox'].includes(f.type) ? `<div class="mb-3"><label>Options (one per line)</label><textarea id="editOptions" class="form-control form-control-sm" rows="4">${(f.options || []).join('\n')}</textarea></div>` : ''}
          <div class="form-check mb-3"><input class="form-check-input" type="checkbox" id="editRequired" ${f.required?'checked':''}><label>Required</label></div>
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
    if (canvas) {
      canvas.innerHTML = this.formFields.length === 0 ? '<p class="text-muted text-center py-4">Click a field type to add it here.</p>' : this.formFields.map((f, i) => this.renderCanvasField(f, i)).join('');
      if (this.formFields.length > 0) {
        if (window._sortableInstance) window._sortableInstance.destroy();
        window._sortableInstance = new Sortable(canvas, {
          animation: 150,
          handle: '.field-row',
          onEnd: (evt) => {
            const moved = this.formFields.splice(evt.oldIndex, 1)[0];
            this.formFields.splice(evt.newIndex, 0, moved);
            this.refreshCanvas();
            this.refreshPreview();
          }
        });
      }
    }
  },

  refreshPreview() {
    const preview = document.getElementById('formPreview');
    if (preview) preview.innerHTML = this.renderPreview();
  },

  // ==================== DESIGN PANEL ====================
  async renderDesignPanel() {
    let html = `
      <div class="d-flex justify-content-between mb-3">
        <h4 class="mb-0"><i class="fas fa-palette me-2"></i>Form Design</h4>
        <button class="btn btn-outline-primary btn-sm" onclick="Forms.currentTab='builder'; Forms.render();"><i class="fas fa-arrow-left me-1"></i> Back to Builder</button>
      </div>
      <div class="row g-3">
        <div class="col-md-8">
          <div class="card-widget">
            <h5>Colors & Typography</h5>
            <div class="row g-2">
              <div class="col-md-4"><label>Primary Color</label><input type="color" id="designPrimary" class="form-control form-control-color" value="${this.formDesign.primaryColor}"></div>
              <div class="col-md-4"><label>Button Text</label><input type="color" id="designBtnText" class="form-control form-control-color" value="${this.formDesign.buttonTextColor}"></div>
              <div class="col-md-4"><label>Background</label><input type="color" id="designBg" class="form-control form-control-color" value="${this.formDesign.backgroundColor}"></div>
              <div class="col-md-4"><label>Title Color</label><input type="color" id="designTitleColor" class="form-control form-control-color" value="${this.formDesign.titleColor}"></div>
              <div class="col-md-4"><label>Title Font Size</label><input type="text" id="designTitleSize" class="form-control form-control-sm" value="${this.formDesign.titleFontSize}"></div>
              <div class="col-md-4"><label>Font Family</label><select id="designFont" class="form-select form-select-sm">
                <option value="Inter, sans-serif" ${this.formDesign.fontFamily==='Inter, sans-serif'?'selected':''}>Inter</option>
                <option value="Roboto, sans-serif">Roboto</option>
                <option value="Poppins, sans-serif">Poppins</option>
                <option value="Open Sans, sans-serif">Open Sans</option>
              </select></div>
            </div>
          </div>
          <div class="card-widget mt-3">
            <h5>Banner & Logo</h5>
            <div class="row g-2">
              <div class="col-md-6">
                <label>Banner (Image URL or Upload)</label>
                <input type="text" id="designBanner" class="form-control form-control-sm mb-1" value="${this.formDesign.bannerUrl}">
                <input type="file" id="bannerFileInput" accept="image/*" onchange="Forms.uploadDesignImage('banner')" class="form-control form-control-sm">
              </div>
              <div class="col-md-6">
                <label>Logo (Image URL or Upload)</label>
                <input type="text" id="designLogo" class="form-control form-control-sm mb-1" value="${this.formDesign.logoUrl}">
                <input type="file" id="logoFileInput" accept="image/*" onchange="Forms.uploadDesignImage('logo')" class="form-control form-control-sm">
              </div>
            </div>
          </div>
          <div class="card-widget mt-3">
            <h5>Custom CSS</h5>
            <textarea id="designCSS" class="form-control form-control-sm" rows="4">${this.formDesign.customCSS}</textarea>
          </div>
          <button class="btn btn-success btn-sm mt-3" onclick="Forms.saveDesign()">Apply Design</button>
        </div>
        <div class="col-md-4">
          <div class="card-widget">
            <h5>Preview</h5>
            <div class="preview-phone" id="designPreview" style="background:${this.formDesign.backgroundColor}; font-family:${this.formDesign.fontFamily};">
              ${this.renderDesignPreview()}
            </div>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
    ['designPrimary','designBtnText','designBg','designTitleColor','designTitleSize','designFont','designBanner','designLogo','designCSS'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => this.updateDesignPreview());
    });
  },

  renderDesignPreview() {
    return `
      ${this.formDesign.bannerUrl ? `<img src="${this.formDesign.bannerUrl}" style="width:100%;border-radius:8px;margin-bottom:12px;">` : ''}
      ${this.formDesign.logoUrl ? `<div style="text-align:center;margin-bottom:8px;"><img src="${this.formDesign.logoUrl}" style="max-height:50px;"></div>` : ''}
      <h4 style="text-align:center;color:${this.formDesign.titleColor};font-size:${this.formDesign.titleFontSize};">Sample Form</h4>
      <div class="preview-field"><label>Sample Field</label><input type="text" disabled></div>
      <button class="btn-submit" style="background:${this.formDesign.primaryColor};color:${this.formDesign.buttonTextColor};">Submit</button>
    `;
  },

  async uploadDesignImage(type) {
    const fileInput = document.getElementById(type === 'banner' ? 'bannerFileInput' : 'logoFileInput');
    const file = fileInput.files[0];
    if (!file) return;
    const storageRef = firebase.storage().ref('form_design/' + Date.now() + '_' + file.name);
    const task = storageRef.put(file);
    task.on('state_changed', null, null, async () => {
      const url = await task.snapshot.ref.getDownloadURL();
      if (type === 'banner') {
        this.formDesign.bannerUrl = url;
        document.getElementById('designBanner').value = url;
      } else {
        this.formDesign.logoUrl = url;
        document.getElementById('designLogo').value = url;
      }
      this.updateDesignPreview();
    });
  },

  updateDesignPreview() {
    const preview = document.getElementById('designPreview');
    if (!preview) return;
    this.formDesign.primaryColor = document.getElementById('designPrimary')?.value || this.formDesign.primaryColor;
    this.formDesign.buttonTextColor = document.getElementById('designBtnText')?.value || this.formDesign.buttonTextColor;
    this.formDesign.backgroundColor = document.getElementById('designBg')?.value || this.formDesign.backgroundColor;
    this.formDesign.titleColor = document.getElementById('designTitleColor')?.value || this.formDesign.titleColor;
    this.formDesign.titleFontSize = document.getElementById('designTitleSize')?.value || this.formDesign.titleFontSize;
    this.formDesign.fontFamily = document.getElementById('designFont')?.value || this.formDesign.fontFamily;
    this.formDesign.bannerUrl = document.getElementById('designBanner')?.value || '';
    this.formDesign.logoUrl = document.getElementById('designLogo')?.value || '';
    preview.style.background = this.formDesign.backgroundColor;
    preview.style.fontFamily = this.formDesign.fontFamily;
    preview.innerHTML = this.renderDesignPreview();
    if (document.getElementById('designCSS')) {
      this.formDesign.customCSS = document.getElementById('designCSS').value;
    }
  },

  saveDesign() {
    this.updateDesignPreview();
    if (this.currentFormId) {
      db.collection('forms').doc(this.currentFormId).update({ design: this.formDesign });
      alert('✅ Design saved to form!');
    } else {
      alert('⚠️ Save the form first, then apply design.');
    }
  },

  // ==================== SAVE FORM ====================
  async saveForm() {
    const name = document.getElementById('formName').value.trim();
    const source = document.getElementById('formSource').value;
    const successMsg = document.getElementById('formSuccessMsg').value.trim();
    if (!name) return alert('Form name required!');
    const data = {
      name, source, successMsg,
      fields: this.formFields,
      design: this.formDesign,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
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

  getFormLink(formId) {
    if (formId === 'preview') { alert('Save the form first to get a link.'); return; }
    prompt('Share this link:', `${window.location.origin}${window.location.pathname}?form=${formId}`);
  },

  // ==================== SUBMISSIONS ====================
  async renderSubmissions() {
    const formId = this.currentFormId;
    if (!formId) { this.render(); return; }
    const formDoc = await db.collection('forms').doc(formId).get();
    const form = formDoc.data();
    const snap = await db.collection('formSubmissions').where('formId', '==', formId).orderBy('createdAt', 'desc').get();
    const submissions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    let html = `
      <div class="d-flex justify-content-between mb-3">
        <h4>Submissions: ${form.name}</h4>
        <button class="btn btn-outline-primary btn-sm" onclick="Forms.currentTab='forms'; Forms.render();">Back</button>
      </div>
      <div class="card-widget">
        <p>Total: <strong>${submissions.length}</strong></p>
        ${submissions.length === 0 ? '<p class="text-muted">No submissions.</p>' : `
          <div class="table-responsive">
            <table class="table table-sm">
              <thead><tr>${(form.fields || []).map(f => `<th>${f.label}</th>`).join('')}<th>Date</th></tr></thead>
              <tbody>
                ${submissions.map(s => `
                  <tr>${(form.fields || []).map(f => `<td>${(s.data && s.data[f.label]) || '-'}</td>`).join('')}<td>${s.createdAt?.toDate().toLocaleString()}</td></tr>
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
    if (!confirm('Delete this form and its submissions?')) return;
    await db.collection('forms').doc(id).delete();
    alert('Deleted.'); this.render();
  }
};
