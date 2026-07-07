// js/forms.js — Enterprise-Grade Form Builder for Global SaaS Platform
const Forms = {
  currentTab: 'forms',
  formFields: [],
  currentFormId: null,
  formDesign: {
    primaryColor: '#6366f1',
    buttonTextColor: '#ffffff',
    backgroundColor: '#ffffff',
    fontFamily: 'Inter, sans-serif',
    titleColor: '#0f172a',
    titleFontSize: '28px',
    borderStyle: 'solid',
    borderRadius: '12px',
    bannerUrl: '',
    logoUrl: '',
    customCSS: ''
  },
  formSettings: {
    name: '',
    source: 'General',
    successMsg: 'Thank you! Your response has been recorded.',
    redirectUrl: '',
    emailNotifications: false,
    notificationEmail: '',
    captcha: false,
    maxSubmissions: 0,
    active: true
  },

  // Pre-built templates
  templates: [
    { name: 'Contact Form', icon: 'fa-address-book', desc: 'Simple contact form with name, email, phone, message', fields: [
      { type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your full name', width: 'full' },
      { type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email', width: 'half' },
      { type: 'phone', label: 'Phone Number', required: false, placeholder: 'Enter your phone', width: 'half' },
      { type: 'textarea', label: 'Message', required: false, placeholder: 'How can we help?', width: 'full' }
    ]},
    { name: 'Lead Capture', icon: 'fa-funnel-dollar', desc: 'Capture qualified leads with source tracking', fields: [
      { type: 'text', label: 'Full Name', required: true, placeholder: 'Your name', width: 'full' },
      { type: 'email', label: 'Work Email', required: true, placeholder: 'you@company.com', width: 'half' },
      { type: 'phone', label: 'Phone', required: true, placeholder: '+91', width: 'half' },
      { type: 'dropdown', label: 'Industry', required: true, options: ['Technology','Healthcare','Finance','Education','Retail','Manufacturing','Other'], width: 'half' },
      { type: 'dropdown', label: 'Company Size', required: false, options: ['1-10','11-50','51-200','201-500','500+'], width: 'half' },
      { type: 'textarea', label: 'Requirements', required: false, placeholder: 'Tell us about your needs', width: 'full' }
    ]},
    { name: 'Feedback Survey', icon: 'fa-star', desc: 'Collect customer feedback and ratings', fields: [
      { type: 'text', label: 'Your Name', required: false, placeholder: 'Optional', width: 'full' },
      { type: 'radio', label: 'Overall Experience', required: true, options: ['Excellent','Good','Average','Poor','Very Poor'], width: 'full' },
      { type: 'radio', label: 'Would you recommend us?', required: true, options: ['Definitely','Probably','Not Sure','Probably Not','Definitely Not'], width: 'full' },
      { type: 'textarea', label: 'Additional Comments', required: false, placeholder: 'Tell us more...', width: 'full' }
    ]},
    { name: 'Job Application', icon: 'fa-briefcase', desc: 'Collect job applications with resume upload', fields: [
      { type: 'text', label: 'Full Name', required: true, placeholder: 'Your full name', width: 'half' },
      { type: 'email', label: 'Email', required: true, placeholder: 'you@email.com', width: 'half' },
      { type: 'phone', label: 'Phone', required: true, placeholder: 'Contact number', width: 'half' },
      { type: 'dropdown', label: 'Position Applying For', required: true, options: ['Software Engineer','Product Manager','Designer','Marketing','Sales','Other'], width: 'half' },
      { type: 'number', label: 'Years of Experience', required: false, placeholder: 'e.g. 5', width: 'half' },
      { type: 'text', label: 'Current CTC (LPA)', required: false, placeholder: 'e.g. 12', width: 'half' },
      { type: 'file', label: 'Upload Resume', required: true, placeholder: '', width: 'full' },
      { type: 'textarea', label: 'Cover Letter', required: false, placeholder: 'Tell us why you are a great fit', width: 'full' }
    ]},
    { name: 'Event Registration', icon: 'fa-calendar-check', desc: 'Register attendees for events and webinars', fields: [
      { type: 'text', label: 'Full Name', required: true, placeholder: 'Attendee name', width: 'full' },
      { type: 'email', label: 'Email', required: true, placeholder: 'you@email.com', width: 'half' },
      { type: 'phone', label: 'Phone', required: true, placeholder: 'Contact number', width: 'half' },
      { type: 'dropdown', label: 'Ticket Type', required: true, options: ['Free','Standard (₹999)','Premium (₹2,499)','VIP (₹4,999)'], width: 'half' },
      { type: 'number', label: 'Number of Tickets', required: true, placeholder: '1', width: 'half' },
      { type: 'dropdown', label: 'How did you hear about us?', required: false, options: ['Social Media','Email','Friend','Search Engine','Advertisement','Other'], width: 'full' },
      { type: 'textarea', label: 'Dietary Requirements', required: false, placeholder: 'Any special requirements?', width: 'full' }
    ]},
    { name: 'Support Ticket', icon: 'fa-ticket-alt', desc: 'Customer support request form', fields: [
      { type: 'text', label: 'Your Name', required: true, placeholder: 'Full name', width: 'half' },
      { type: 'email', label: 'Email', required: true, placeholder: 'you@email.com', width: 'half' },
      { type: 'dropdown', label: 'Issue Type', required: true, options: ['Technical Issue','Billing Question','Feature Request','Account Help','Bug Report','Other'], width: 'half' },
      { type: 'dropdown', label: 'Priority', required: true, options: ['Low','Medium','High','Urgent'], width: 'half' },
      { type: 'text', label: 'Subject', required: true, placeholder: 'Brief summary of issue', width: 'full' },
      { type: 'textarea', label: 'Description', required: true, placeholder: 'Please describe your issue in detail', width: 'full' },
      { type: 'file', label: 'Attach Screenshot', required: false, placeholder: '', width: 'full' }
    ]},
  ],

  // ==================== RENDER ====================
  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = '#f8fafc';

    if (this.currentTab === 'builder') { await this.renderBuilder(this.currentFormId); return; }
    if (this.currentTab === 'design') { await this.renderDesignPanel(); return; }
    if (this.currentTab === 'submissions') { await this.renderSubmissions(); return; }
    if (this.currentTab === 'analytics') { await this.renderFormAnalytics(); return; }
    if (this.currentTab === 'templates') { await this.renderTemplates(); return; }

    await this.renderFormList();
  },

  // ==================== TEMPLATES ====================
  async renderTemplates() {
    let html = `
      <style>
        .templates-wrap { max-width: 1400px; margin: 0 auto; }
        .template-card { background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #f1f5f9; transition: 0.2s; cursor: pointer; text-align: center; }
        .template-card:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.06); border-color: #6366f1; transform: translateY(-2px); }
        .template-icon { width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #fff; margin: 0 auto 12px; }
        .template-card h6 { font-weight: 700; margin-bottom: 4px; }
        .template-card p { font-size: 12px; color: #64748b; margin: 0; }
        .template-badge { position: absolute; top: 12px; right: 12px; }
        .form-btn { padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .form-btn-primary { background: #6366f1; color: #fff; }
        .form-btn-primary:hover { background: #4f46e5; }
        .form-btn-outline { background: #fff; color: #6366f1; border: 1px solid #6366f1; }
        .form-btn-outline:hover { background: #eef2ff; }
      </style>
      <div class="templates-wrap">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 style="font-weight:800;margin:0;"><i class="fas fa-layer-group text-primary me-2"></i>Form Templates</h4>
            <small class="text-muted">Choose a pre-built template to get started quickly</small>
          </div>
          <button class="form-btn form-btn-outline" onclick="Forms.currentTab='forms';Forms.render();"><i class="fas fa-arrow-left"></i> Back to Forms</button>
        </div>
        <div class="row g-4">
          ${this.templates.map((tpl, i) => `
            <div class="col-md-6 col-lg-4">
              <div class="template-card" style="position:relative;" onclick="Forms.useTemplate(${i})">
                <span class="template-badge" style="background:#eef2ff;color:#6366f1;font-size:10px;padding:3px 8px;border-radius:12px;">${tpl.fields.length} fields</span>
                <div class="template-icon" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);"><i class="fas ${tpl.icon}"></i></div>
                <h6>${tpl.name}</h6>
                <p>${tpl.desc}</p>
                <button class="form-btn form-btn-primary mt-3" onclick="event.stopPropagation();Forms.useTemplate(${i})"><i class="fas fa-plus"></i> Use Template</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  useTemplate(index) {
    const tpl = this.templates[index];
    this.formFields = JSON.parse(JSON.stringify(tpl.fields));
    this.formSettings.name = tpl.name;
    this.formSettings.source = 'General';
    this.currentFormId = null;
    this.currentTab = 'builder';
    this.render();
  },

  // ==================== FORM LIST ====================
  async renderFormList() {
    let forms = [];
    try {
      // ✅ clientId ISOLATION
      let query = db.collection('forms');
      if (shouldFilterByClient()) query = query.where('clientId', '==', window.currentUser.clientId);
      const snap = await query.orderBy('createdAt', 'desc').get();
      forms = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) { console.error(err); }

    const totalSubmissions = forms.reduce((sum, f) => sum + (f.submissionCount || 0), 0);
    const activeForms = forms.filter(f => f.active !== false).length;

    let html = `
      <style>
        .forms-wrap { max-width: 1400px; margin: 0 auto; }
        .forms-header { background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 20px; padding: 28px 32px; margin-bottom: 24px; color: #fff; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .forms-header h4 { margin: 0; font-weight: 800; font-size: 22px; }
        .forms-header p { margin: 4px 0 0; color: #94a3b8; font-size: 13px; }
        .form-card { background: #fff; border-radius: 16px; padding: 22px; border: 1px solid #f1f5f9; transition: 0.2s; cursor: pointer; }
        .form-card:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.06); border-color: #6366f1; transform: translateY(-2px); }
        .form-card-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #fff; flex-shrink: 0; }
        .form-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; }
        .form-btn { padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .form-btn-primary { background: #6366f1; color: #fff; }
        .form-btn-primary:hover { background: #4f46e5; }
        .form-btn-outline { background: #fff; color: #6366f1; border: 1px solid #6366f1; }
        .form-btn-outline:hover { background: #eef2ff; }
        .form-btn-danger { background: #ef4444; color: #fff; }
        .form-btn-danger:hover { background: #dc2626; }
        .form-btn-success { background: #10b981; color: #fff; }
        .form-btn-success:hover { background: #059669; }
        .form-stat { background: #fff; border-radius: 14px; padding: 20px; text-align: center; border: 1px solid #f1f5f9; }
        .form-stat .val { font-size: 28px; font-weight: 800; }
        .form-stat .lbl { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
      </style>

      <div class="forms-wrap">
        <div class="forms-header">
          <div>
            <h4><i class="fas fa-wpforms me-2"></i>Form Builder</h4>
            <p>Create, customize, and manage lead capture forms</p>
          </div>
          <div class="d-flex gap-3">
            <div class="text-center"><div style="font-size:22px;font-weight:800;">${forms.length}</div><small style="color:#94a3b8;">Total Forms</small></div>
            <div class="text-center"><div style="font-size:22px;font-weight:800;color:#10b981;">${activeForms}</div><small style="color:#94a3b8;">Active</small></div>
            <div class="text-center"><div style="font-size:22px;font-weight:800;color:#f59e0b;">${totalSubmissions}</div><small style="color:#94a3b8;">Submissions</small></div>
          </div>
        </div>

        <div class="row g-3 mb-4">
          <div class="col-6 col-md-3"><div class="form-stat"><div class="val" style="color:#6366f1;">${forms.length}</div><div class="lbl">Total Forms</div></div></div>
          <div class="col-6 col-md-3"><div class="form-stat"><div class="val" style="color:#10b981;">${activeForms}</div><div class="lbl">Active</div></div></div>
          <div class="col-6 col-md-3"><div class="form-stat"><div class="val" style="color:#f59e0b;">${totalSubmissions}</div><div class="lbl">Submissions</div></div></div>
          <div class="col-6 col-md-3"><div class="form-stat"><div class="val" style="color:#8b5cf6;">${forms.reduce((s,f)=>(f.fields||[]).length+s,0)}</div><div class="lbl">Total Fields</div></div></div>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 style="font-weight:700;color:#0f172a;margin:0;">All Forms</h5>
          <div class="d-flex gap-2">
            <button class="form-btn form-btn-success" onclick="Forms.currentTab='templates';Forms.render();"><i class="fas fa-layer-group"></i> Templates</button>
            <button class="form-btn form-btn-primary" onclick="Forms.currentTab='builder';Forms.currentFormId=null;Forms.formFields=[];Forms.render();"><i class="fas fa-plus"></i> Create New Form</button>
          </div>
        </div>

        <div class="row g-3">
          ${forms.length === 0 ? `
            <div class="col-12 text-center py-5">
              <i class="fas fa-wpforms fa-3x text-muted mb-3" style="opacity:0.3;"></i>
              <h5 style="font-weight:700;">No Forms Yet</h5>
              <p class="text-muted">Create your first lead capture form or start from a template.</p>
              <div class="d-flex gap-2 justify-content-center">
                <button class="form-btn form-btn-success" onclick="Forms.currentTab='templates';Forms.render();"><i class="fas fa-layer-group me-1"></i> Browse Templates</button>
                <button class="form-btn form-btn-primary" onclick="Forms.currentTab='builder';Forms.currentFormId=null;Forms.formFields=[];Forms.render();"><i class="fas fa-plus me-1"></i> Create Form</button>
              </div>
            </div>
          ` : forms.map(f => `
            <div class="col-md-6 col-lg-4">
              <div class="form-card" onclick="Forms.editForm('${f.id}')">
                <div class="d-flex gap-3">
                  <div class="form-card-icon" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);"><i class="fas fa-wpforms"></i></div>
                  <div class="flex-grow-1">
                    <div class="d-flex justify-content-between">
                      <h6 style="font-weight:700;margin:0;">${f.name || 'Untitled'}</h6>
                      <span class="form-badge" style="background:${f.active !== false ? '#ecfdf5' : '#f1f5f9'};color:${f.active !== false ? '#10b981' : '#94a3b8'};">${f.active !== false ? 'Active' : 'Draft'}</span>
                    </div>
                    <small style="color:#64748b;">${f.source || 'General'} · ${(f.fields||[]).length} fields</small>
                    <div style="margin-top:6px;font-size:12px;color:#94a3b8;">
                      <span><i class="fas fa-envelope me-1"></i> ${f.submissionCount||0} submissions</span>
                      <span class="ms-2"><i class="far fa-clock me-1"></i> ${f.createdAt?.toDate().toLocaleDateString()}</span>
                    </div>
                    <div class="d-flex gap-2 mt-2" onclick="event.stopPropagation();">
                      <button class="form-btn form-btn-outline btn-sm" onclick="Forms.getFormLink('${f.id}')"><i class="fas fa-link"></i> Link</button>
                      <button class="form-btn form-btn-outline btn-sm" onclick="Forms.currentTab='submissions';Forms.currentFormId='${f.id}';Forms.render();"><i class="fas fa-list"></i> Submissions</button>
                      <button class="form-btn form-btn-danger btn-sm" onclick="Forms.deleteForm('${f.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  editForm(id) { this.currentTab = 'builder'; this.currentFormId = id; this.render(); },

  // ==================== FORM BUILDER ====================
  async renderBuilder(formId = null) {
    const effectiveFormId = formId || this.currentFormId;

    if (effectiveFormId) {
      const doc = await db.collection('forms').doc(effectiveFormId).get();
      if (doc.exists) {
        const data = doc.data();
        this.formFields = JSON.parse(JSON.stringify(data.fields || []));
        this.formDesign = { ...this.formDesign, ...(data.design || {}) };
        this.formSettings = { ...this.formSettings, name: data.name || '', source: data.source || 'General', successMsg: data.successMsg || 'Thank you!', redirectUrl: data.redirectUrl || '', emailNotifications: data.emailNotifications || false, notificationEmail: data.notificationEmail || '', captcha: data.captcha || false, maxSubmissions: data.maxSubmissions || 0, active: data.active !== false };
        this.currentFormId = effectiveFormId;
      }
    } else {
      this.formFields = [];
      this.formSettings = { name: '', source: 'General', successMsg: 'Thank you! Your response has been recorded.', redirectUrl: '', emailNotifications: false, notificationEmail: '', captcha: false, maxSubmissions: 0, active: true };
      this.currentFormId = null;
    }

    let html = `
      <style>
        .builder-layout { display: grid; grid-template-columns: 200px 1fr 340px; gap: 16px; }
        .field-palette { background: #fff; border-radius: 16px; padding: 16px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.04); height: fit-content; position: sticky; top: 80px; }
        .palette-item { padding: 10px 14px; border-radius: 10px; cursor: pointer; margin-bottom: 4px; display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 500; transition: 0.15s; color: #475569; }
        .palette-item:hover { background: #eef2ff; color: #6366f1; }
        .palette-item i { width: 20px; text-align: center; color: #6366f1; }
        .canvas { background: #fff; border-radius: 16px; padding: 20px; min-height: 500px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .field-row { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; margin-bottom: 8px; cursor: grab; display: flex; gap: 12px; align-items: center; transition: 0.15s; }
        .field-row:hover { border-color: #6366f1; box-shadow: 0 2px 8px rgba(99,102,241,0.1); }
        .field-row .field-info { flex: 1; }
        .field-row .field-preview input, .field-row .field-preview select, .field-row .field-preview textarea { width: 100%; padding: 6px 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; background: #fff; }
        .preview-panel { background: #fff; border-radius: 16px; padding: 20px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.04); position: sticky; top: 80px; }
        .preview-phone { border-radius: 16px; padding: 24px; max-width: 360px; margin: 0 auto; box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
        .preview-field { margin-bottom: 14px; }
        .preview-field label { font-weight: 600; font-size: 12px; color: #475569; display: block; margin-bottom: 4px; }
        .preview-field input, .preview-field select, .preview-field textarea { width: 100%; padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; }
        .preview-half { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .btn-submit { width: 100%; padding: 12px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; border: none; transition: 0.2s; }
        .form-input { width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px; outline: none; background: #fff; }
        .form-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        @media (max-width: 1200px) { .builder-layout { grid-template-columns: 1fr; } .field-palette, .preview-panel { position: static; } }
      </style>

      <div style="max-width:1400px;margin:0 auto;">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 style="font-weight:800;margin:0;"><i class="fas fa-wpforms text-primary me-2"></i>${effectiveFormId ? 'Edit' : 'Create'} Form</h4>
            <small class="text-muted">Drag and drop fields to build your form</small>
          </div>
          <div class="d-flex gap-2">
            <button class="form-btn form-btn-outline" onclick="Forms.currentTab='forms';Forms.currentFormId=null;Forms.render();"><i class="fas fa-arrow-left"></i> Back</button>
            <button class="form-btn form-btn-outline" onclick="Forms.currentTab='design';Forms.render();"><i class="fas fa-palette"></i> Design</button>
            <button class="form-btn form-btn-outline" onclick="Forms.getFormLink(effectiveFormId||'preview')"><i class="fas fa-eye"></i> Preview</button>
            <button class="form-btn form-btn-primary" onclick="Forms.saveForm()"><i class="fas fa-save"></i> Save Form</button>
          </div>
        </div>

        <div class="card-widget mb-3" style="background:#fff;border-radius:16px;padding:16px;border:1px solid #f1f5f9;">
          <div class="row g-2">
            <div class="col-md-4"><label class="small fw-bold">Form Name *</label><input type="text" id="formName" class="form-input" value="${this.formSettings.name}"></div>
            <div class="col-md-3"><label class="small fw-bold">Lead Source</label><select id="formSource" class="form-input"><option value="General" ${this.formSettings.source==='General'?'selected':''}>General</option><option value="WhatsApp" ${this.formSettings.source==='WhatsApp'?'selected':''}>WhatsApp</option><option value="Facebook" ${this.formSettings.source==='Facebook'?'selected':''}>Facebook</option><option value="Website" ${this.formSettings.source==='Website'?'selected':''}>Website</option><option value="Campaign" ${this.formSettings.source==='Campaign'?'selected':''}>Campaign</option></select></div>
            <div class="col-md-3"><label class="small fw-bold">Success Message</label><input type="text" id="formSuccessMsg" class="form-input" value="${this.formSettings.successMsg}"></div>
            <div class="col-md-2"><label class="small fw-bold">Status</label><select id="formActive" class="form-input"><option value="true" ${this.formSettings.active?'selected':''}>Active</option><option value="false" ${!this.formSettings.active?'selected':''}>Draft</option></select></div>
          </div>
        </div>

        <div class="builder-layout">
          <div class="field-palette">
            <h6 style="font-weight:700;margin-bottom:12px;">Field Types</h6>
            <div class="palette-item" onclick="Forms.addField('text')"><i class="fas fa-font"></i> Text</div>
            <div class="palette-item" onclick="Forms.addField('number')"><i class="fas fa-sort-numeric-up"></i> Number</div>
            <div class="palette-item" onclick="Forms.addField('email')"><i class="fas fa-envelope"></i> Email</div>
            <div class="palette-item" onclick="Forms.addField('phone')"><i class="fas fa-phone"></i> Phone</div>
            <div class="palette-item" onclick="Forms.addField('date')"><i class="fas fa-calendar"></i> Date</div>
            <div class="palette-item" onclick="Forms.addField('dropdown')"><i class="fas fa-caret-down"></i> Dropdown</div>
            <div class="palette-item" onclick="Forms.addField('radio')"><i class="fas fa-dot-circle"></i> Radio</div>
            <div class="palette-item" onclick="Forms.addField('checkbox')"><i class="fas fa-check-square"></i> Checkbox</div>
            <div class="palette-item" onclick="Forms.addField('textarea')"><i class="fas fa-align-left"></i> Textarea</div>
            <div class="palette-item" onclick="Forms.addField('file')"><i class="fas fa-upload"></i> File Upload</div>
            <hr>
            <small class="text-muted">Drag fields to reorder. Click edit icon to configure.</small>
          </div>

          <div class="canvas" id="builderCanvas">
            <div id="canvasFields">
              ${this.formFields.length === 0 ? '<p class="text-muted text-center py-5">Click a field type from the left panel to add it here.</p>' : this.formFields.map((f, i) => this.renderCanvasField(f, i)).join('')}
            </div>
          </div>

          <div class="preview-panel">
            <h6 style="font-weight:700;margin-bottom:12px;">📱 Live Preview</h6>
            <div class="preview-phone" id="formPreview" style="background:${this.formDesign.backgroundColor};font-family:${this.formDesign.fontFamily};">
              ${this.renderPreview()}
            </div>
          </div>
        </div>
      </div>
      <div id="editFieldModal" style="display:none;"></div>
    `;
    contentArea.innerHTML = html;
    this.initSortable();
  },

  // ==================== FIELD HELPERS ====================
  renderCanvasField(field, index) {
    return `<div class="field-row" data-index="${index}">
      <div class="field-info">
        <strong>${field.label || 'Untitled'}</strong> <small class="text-muted">(${field.type}) ${field.required ? '<span style="color:#ef4444;">*Required</span>' : ''}</small>
        <div class="field-preview">${this.renderFieldHTML(field, index, true)}</div>
      </div>
      <div class="d-flex gap-1">
        <button class="btn btn-sm btn-outline-info" onclick="Forms.editField(${index})"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="Forms.removeField(${index})"><i class="fas fa-trash"></i></button>
      </div></div>`;
  },

  renderFieldHTML(field, index, disabled = false) {
    const dis = disabled ? 'disabled' : '';
    switch (field.type) {
      case 'dropdown': return `<select ${dis}><option>${field.options?.[0] || 'Select...'}</option>${(field.options||[]).slice(1).map(o=>`<option>${o}</option>`).join('')}</select>`;
      case 'radio': return (field.options||[]).map(o=>`<label style="display:block;font-size:12px;"><input type="radio" name="r_${index}" ${dis}> ${o}</label>`).join('');
      case 'checkbox': return (field.options||[]).map(o=>`<label style="display:block;font-size:12px;"><input type="checkbox" ${dis}> ${o}</label>`).join('');
      case 'textarea': return `<textarea rows="2" ${dis}></textarea>`;
      case 'file': return `<input type="file" ${dis}>`;
      default: return `<input type="${field.type}" ${dis} placeholder="${field.placeholder||''}">`;
    }
  },

  renderPreview() {
    let html = '';
    if (this.formDesign.bannerUrl) html += `<img src="${this.formDesign.bannerUrl}" style="width:100%;border-radius:8px;margin-bottom:12px;">`;
    if (this.formDesign.logoUrl) html += `<div style="text-align:center;margin-bottom:8px;"><img src="${this.formDesign.logoUrl}" style="max-height:50px;"></div>`;
    html += `<h4 style="text-align:center;color:${this.formDesign.titleColor};font-size:${this.formDesign.titleFontSize};margin-bottom:4px;">${this.formSettings.name||'Form Preview'}</h4>`;
    html += `<small class="text-muted d-block text-center mb-3">${this.formSettings.source}</small>`;

    let i = 0;
    while (i < this.formFields.length) {
      const f = this.formFields[i];
      if (f.width === 'half' && this.formFields[i+1]?.width === 'half') {
        html += '<div class="preview-half">';
        html += this.renderPreviewField(f, i);
        html += this.renderPreviewField(this.formFields[i+1], i+1);
        html += '</div>';
        i += 2;
      } else {
        html += this.renderPreviewField(f, i);
        i++;
      }
    }
    html += `<button class="btn-submit" style="background:${this.formDesign.primaryColor};color:${this.formDesign.buttonTextColor};">Submit</button>`;
    return html;
  },

  renderPreviewField(field, index) {
    return `<div class="preview-field"><label>${field.label} ${field.required?'<span style="color:#ef4444;">*</span>':''}</label>${this.renderFieldHTML(field, index, true)}</div>`;
  },

  addField(type) {
    this.formFields.push({ type, label: this.getDefaultLabel(type), required: false, options: ['dropdown','radio','checkbox'].includes(type)?['Option 1','Option 2','Option 3']:[], placeholder: '', width: 'full' });
    this.refreshCanvas(); this.refreshPreview();
  },

  getDefaultLabel(type) { const m={text:'Name',number:'Age',email:'Email',date:'Date',dropdown:'Select',radio:'Choose',checkbox:'Options',textarea:'Message',file:'File',phone:'Phone'}; return m[type]||'Field'; },

  editField(index) {
    const f = this.formFields[index];
    document.getElementById('editFieldModal').style.display = 'block';
    document.getElementById('editFieldModal').innerHTML = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:3000;display:flex;align-items:center;justify-content:center;" onclick="Forms.closeEditModal()">
        <div style="background:#fff;border-radius:20px;padding:28px;width:500px;max-width:92vw;max-height:80vh;overflow-y:auto;" onclick="event.stopPropagation()">
          <h5 style="font-weight:700;">Edit Field</h5>
          <input type="text" id="editLabel" class="form-input mb-2" placeholder="Label" value="${f.label}">
          <input type="text" id="editPlaceholder" class="form-input mb-2" placeholder="Placeholder" value="${f.placeholder||''}">
          <select id="editWidth" class="form-input mb-2"><option value="full" ${f.width==='full'?'selected':''}>Full Width</option><option value="half" ${f.width==='half'?'selected':''}>Half Width</option></select>
          ${['dropdown','radio','checkbox'].includes(f.type)?`<textarea id="editOptions" class="form-input mb-2" rows="4" placeholder="One option per line">${(f.options||[]).join('\n')}</textarea>`:''}
          <label style="display:flex;align-items:center;gap:8px;font-size:12px;"><input type="checkbox" id="editRequired" ${f.required?'checked':''}> Required Field</label>
          <div class="d-flex gap-2 mt-3">
            <button class="form-btn form-btn-primary" onclick="Forms.saveFieldEdit(${index})">Save</button>
            <button class="form-btn form-btn-outline" onclick="Forms.closeEditModal()">Cancel</button>
          </div>
        </div></div>`;
  },

  saveFieldEdit(index) {
    const f = this.formFields[index];
    f.label = document.getElementById('editLabel')?.value?.trim()||'';
    f.placeholder = document.getElementById('editPlaceholder')?.value?.trim()||'';
    f.width = document.getElementById('editWidth')?.value||'full';
    f.required = document.getElementById('editRequired')?.checked||false;
    const optsEl = document.getElementById('editOptions');
    if (optsEl) f.options = optsEl.value.split('\n').map(o=>o.trim()).filter(Boolean);
    this.closeEditModal(); this.refreshCanvas(); this.refreshPreview();
  },

  closeEditModal() { const el=document.getElementById('editFieldModal'); if(el){el.style.display='none';el.innerHTML='';} },
  removeField(index) { this.formFields.splice(index,1); this.refreshCanvas(); this.refreshPreview(); },

  refreshCanvas() {
    const canvas = document.getElementById('canvasFields');
    if (canvas) { canvas.innerHTML = this.formFields.length===0?'<p class="text-muted text-center py-5">Click a field type to add it here.</p>':this.formFields.map((f,i)=>this.renderCanvasField(f,i)).join(''); this.initSortable(); }
  },
  refreshPreview() { const p=document.getElementById('formPreview'); if(p) p.innerHTML = this.renderPreview(); },
  initSortable() {
    const canvas = document.getElementById('canvasFields');
    if (canvas && this.formFields.length>1) {
      if (window._sortableInstance) window._sortableInstance.destroy();
      window._sortableInstance = new Sortable(canvas, { animation:150, handle:'.field-row', onEnd:(evt)=>{ const m=this.formFields.splice(evt.oldIndex,1)[0]; this.formFields.splice(evt.newIndex,0,m); this.refreshCanvas(); this.refreshPreview(); } });
    }
  },

  // ==================== DESIGN PANEL ====================
  async renderDesignPanel() {
    let html = `
      <div style="max-width:1400px;margin:0 auto;">
        <div class="d-flex justify-content-between mb-3">
          <div>
            <h4 style="font-weight:800;"><i class="fas fa-palette me-2"></i>Form Design</h4>
            <small class="text-muted">Customize the look and feel of your form</small>
          </div>
          <button class="form-btn form-btn-outline" onclick="Forms.currentTab='builder';Forms.render();"><i class="fas fa-arrow-left"></i> Back to Builder</button>
        </div>
        <div class="row g-3">
          <div class="col-lg-8">
            <div class="card-widget" style="background:#fff;border-radius:16px;padding:20px;border:1px solid #f1f5f9;margin-bottom:16px;">
              <h5 style="font-weight:700;">Colors & Typography</h5>
              <div class="row g-2">
                <div class="col-md-4"><label class="small fw-bold">Primary Color</label><input type="color" id="designPrimary" class="form-control form-control-color" value="${this.formDesign.primaryColor}"></div>
                <div class="col-md-4"><label class="small fw-bold">Button Text Color</label><input type="color" id="designBtnText" class="form-control form-control-color" value="${this.formDesign.buttonTextColor}"></div>
                <div class="col-md-4"><label class="small fw-bold">Background Color</label><input type="color" id="designBg" class="form-control form-control-color" value="${this.formDesign.backgroundColor}"></div>
                <div class="col-md-4"><label class="small fw-bold">Title Color</label><input type="color" id="designTitleColor" class="form-control form-control-color" value="${this.formDesign.titleColor}"></div>
                <div class="col-md-4"><label class="small fw-bold">Title Font Size</label><input type="text" id="designTitleSize" class="form-input" value="${this.formDesign.titleFontSize}"></div>
                <div class="col-md-4"><label class="small fw-bold">Font Family</label><select id="designFont" class="form-input">
                  <option value="Inter, sans-serif" ${this.formDesign.fontFamily==='Inter, sans-serif'?'selected':''}>Inter</option>
                  <option value="Roboto, sans-serif" ${this.formDesign.fontFamily==='Roboto, sans-serif'?'selected':''}>Roboto</option>
                  <option value="Poppins, sans-serif" ${this.formDesign.fontFamily==='Poppins, sans-serif'?'selected':''}>Poppins</option>
                  <option value="Open Sans, sans-serif" ${this.formDesign.fontFamily==='Open Sans, sans-serif'?'selected':''}>Open Sans</option>
                </select></div>
              </div>
            </div>
            <div class="card-widget" style="background:#fff;border-radius:16px;padding:20px;border:1px solid #f1f5f9;margin-bottom:16px;">
              <h5 style="font-weight:700;">Banner & Logo</h5>
              <div class="row g-2">
                <div class="col-md-6">
                  <label class="small fw-bold">Banner Image (URL or Upload)</label>
                  <input type="text" id="designBanner" class="form-input mb-1" placeholder="https://example.com/banner.jpg" value="${this.formDesign.bannerUrl}">
                  <input type="file" id="bannerFileInput" accept="image/*" onchange="Forms.uploadDesignImage('banner')" class="form-input">
                  ${this.formDesign.bannerUrl ? `<img src="${this.formDesign.bannerUrl}" style="width:100%;border-radius:8px;margin-top:8px;max-height:80px;object-fit:cover;">` : ''}
                </div>
                <div class="col-md-6">
                  <label class="small fw-bold">Logo (URL or Upload)</label>
                  <input type="text" id="designLogo" class="form-input mb-1" placeholder="https://example.com/logo.png" value="${this.formDesign.logoUrl}">
                  <input type="file" id="logoFileInput" accept="image/*" onchange="Forms.uploadDesignImage('logo')" class="form-input">
                  ${this.formDesign.logoUrl ? `<img src="${this.formDesign.logoUrl}" style="max-height:50px;margin-top:8px;">` : ''}
                </div>
              </div>
            </div>
            <div class="card-widget" style="background:#fff;border-radius:16px;padding:20px;border:1px solid #f1f5f9;">
              <h5 style="font-weight:700;">Custom CSS</h5>
              <textarea id="designCSS" class="form-input" rows="4" placeholder="/* Add your custom CSS here */">${this.formDesign.customCSS}</textarea>
            </div>
            <button class="form-btn form-btn-primary mt-3" onclick="Forms.saveDesign()"><i class="fas fa-save"></i> Apply Design</button>
          </div>
          <div class="col-lg-4">
            <div class="card-widget" style="background:#fff;border-radius:16px;padding:20px;border:1px solid #f1f5f9;position:sticky;top:80px;">
              <h5 style="font-weight:700;">Preview</h5>
              <div class="preview-phone" id="designPreview" style="background:${this.formDesign.backgroundColor};font-family:${this.formDesign.fontFamily};">
                ${this.renderDesignPreview()}
              </div>
            </div>
          </div>
        </div>
      </div>`;
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
      <small class="text-muted d-block text-center mb-3">Preview</small>
      <div class="preview-field"><label>Sample Field</label><input type="text" disabled style="width:100%;padding:9px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;"></div>
      <button class="btn-submit" style="background:${this.formDesign.primaryColor};color:${this.formDesign.buttonTextColor};">Submit</button>
    `;
  },

  async uploadDesignImage(type) {
    const fileInput = document.getElementById(type === 'banner' ? 'bannerFileInput' : 'logoFileInput');
    const file = fileInput?.files?.[0];
    if (!file) return;
    const storageRef = firebase.storage().ref('form_design/' + Date.now() + '_' + file.name);
    const task = storageRef.put(file);
    task.on('state_changed', null, null, async () => {
      const url = await task.snapshot.ref.getDownloadURL();
      if (type === 'banner') {
        this.formDesign.bannerUrl = url;
        const el = document.getElementById('designBanner');
        if (el) el.value = url;
      } else {
        this.formDesign.logoUrl = url;
        const el = document.getElementById('designLogo');
        if (el) el.value = url;
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
    this.formDesign.customCSS = document.getElementById('designCSS')?.value || '';
    preview.style.background = this.formDesign.backgroundColor;
    preview.style.fontFamily = this.formDesign.fontFamily;
    preview.innerHTML = this.renderDesignPreview();
  },

  async saveDesign() {
    this.updateDesignPreview();
    if (this.currentFormId) {
      await db.collection('forms').doc(this.currentFormId).update({ design: this.formDesign });
      showToast('✅ Design saved to form!', 'success');
    } else {
      showToast('⚠️ Save the form first, then apply design.', 'warning');
    }
  },

  // ==================== SAVE FORM ====================
  async saveForm() {
    const name = document.getElementById('formName')?.value?.trim();
    if (!name) return showToast('Form name required!', 'warning');
    const data = {
      name,
      source: document.getElementById('formSource')?.value || 'General',
      successMsg: document.getElementById('formSuccessMsg')?.value?.trim() || 'Thank you!',
      active: document.getElementById('formActive')?.value === 'true',
      fields: this.formFields,
      design: this.formDesign,
      clientId: getCurrentClientId(),
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
      showToast('✅ Form saved!', 'success');
      this.currentTab = 'forms';
      this.render();
    } catch (err) { showToast('Error: ' + err.message, 'error'); }
  },

  getFormLink(formId) {
    if (formId === 'preview') { showToast('Save the form first to get a link.', 'warning'); return; }
    prompt('Share this link:', `${window.location.origin}${window.location.pathname}?form=${formId}`);
  },

  // ==================== SUBMISSIONS ====================
  async renderSubmissions() {
    const formId = this.currentFormId;
    if (!formId) { this.render(); return; }
    const formDoc = await db.collection('forms').doc(formId).get();
    if (!formDoc.exists) { this.render(); return; }
    const form = formDoc.data();
    
    // ✅ clientId ISOLATION
    let query = db.collection('formSubmissions').where('formId', '==', formId);
    if (shouldFilterByClient()) query = query.where('clientId', '==', window.currentUser.clientId);
    const snap = await query.orderBy('createdAt', 'desc').get();
    const submissions = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    let html = `
      <div style="max-width:1400px;margin:0 auto;">
        <div class="d-flex justify-content-between mb-3">
          <div>
            <h4 style="font-weight:800;">Submissions: ${form.name}</h4>
            <small class="text-muted">${submissions.length} total submissions</small>
          </div>
          <div class="d-flex gap-2">
            <button class="form-btn form-btn-outline" onclick="Forms.currentTab='forms';Forms.render();"><i class="fas fa-arrow-left"></i> Back</button>
            <button class="form-btn form-btn-danger" onclick="Forms.deleteSelectedSubmissions('${formId}')" id="deleteSelectedBtn" disabled><i class="fas fa-trash"></i> Delete Selected (<span id="selectedCount">0</span>)</button>
            <button class="form-btn form-btn-outline" onclick="Forms.exportSubmissions('${formId}')"><i class="fas fa-download"></i> Export CSV</button>
          </div>
        </div>
        <div class="card-widget" style="background:#fff;border-radius:16px;padding:20px;border:1px solid #f1f5f9;">
          ${submissions.length === 0 ? '<p class="text-muted text-center py-4">No submissions yet.</p>' : `
            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th><input type="checkbox" id="selectAllSubmissions" onchange="Forms.toggleSelectAll(this)"></th>
                    ${(form.fields || []).map(f => `<th>${f.label}</th>`).join('')}
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${submissions.map(s => `
                    <tr>
                      <td><input type="checkbox" class="submission-checkbox" value="${s.id}" onchange="Forms.updateDeleteButton()"></td>
                      ${(form.fields || []).map(f => `<td>${(s.data && s.data[f.label]) || '-'}</td>`).join('')}
                      <td style="font-size:12px;">${s.createdAt?.toDate().toLocaleString()}</td>
                      <td><button class="form-btn form-btn-danger btn-sm" onclick="Forms.deleteSubmission('${formId}','${s.id}')"><i class="fas fa-trash"></i></button></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>`;
    contentArea.innerHTML = html;
  },

  toggleSelectAll(checkbox) {
    document.querySelectorAll('.submission-checkbox').forEach(cb => cb.checked = checkbox.checked);
    this.updateDeleteButton();
  },

  updateDeleteButton() {
    const selected = document.querySelectorAll('.submission-checkbox:checked');
    const count = selected.length;
    const el = document.getElementById('selectedCount');
    if (el) el.textContent = count;
    const btn = document.getElementById('deleteSelectedBtn');
    if (btn) btn.disabled = count === 0;
  },

  async deleteSubmission(formId, submissionId) {
    if (!confirm('Delete this submission?')) return;
    try {
      await db.collection('formSubmissions').doc(submissionId).delete();
      await db.collection('forms').doc(formId).update({ submissionCount: firebase.firestore.FieldValue.increment(-1) });
      showToast('Submission deleted.', 'success');
      this.renderSubmissions();
    } catch (err) { showToast('Error: ' + err.message, 'error'); }
  },

  async deleteSelectedSubmissions(formId) {
    const checkboxes = document.querySelectorAll('.submission-checkbox:checked');
    if (checkboxes.length === 0) return showToast('Select submissions first!', 'warning');
    if (!confirm(`Delete ${checkboxes.length} selected submission(s)?`)) return;
    try {
      const batch = db.batch();
      checkboxes.forEach(cb => batch.delete(db.collection('formSubmissions').doc(cb.value)));
      await batch.commit();
      await db.collection('forms').doc(formId).update({ submissionCount: firebase.firestore.FieldValue.increment(-checkboxes.length) });
      showToast(`${checkboxes.length} submission(s) deleted.`, 'success');
      this.renderSubmissions();
    } catch (err) { showToast('Error: ' + err.message, 'error'); }
  },

  exportSubmissions(formId) {
    const rows = document.querySelectorAll('.table tbody tr');
    let csv = '';
    const headers = document.querySelectorAll('.table thead th');
    headers.forEach((h, i) => {
      if (i > 0 && i < headers.length - 1) csv += (i > 1 ? ',' : '') + '"' + h.innerText + '"';
    });
    csv += '\n';
    rows.forEach(row => {
      const cols = row.querySelectorAll('td');
      let line = '';
      for (let i = 1; i < cols.length - 1; i++) {
        if (i > 1) line += ',';
        line += '"' + cols[i].innerText.replace(/"/g, '""') + '"';
      }
      csv += line + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'form_submissions_' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('✅ CSV exported!', 'success');
  },

  // ==================== ANALYTICS ====================
  async renderFormAnalytics() {
    const formId = this.currentFormId;
    if (!formId) { this.render(); return; }
    
    // ✅ clientId ISOLATION
    let query = db.collection('formSubmissions').where('formId', '==', formId);
    if (shouldFilterByClient()) query = query.where('clientId', '==', window.currentUser.clientId);
    const snap = await query.get();
    const totalSubmissions = snap.size;

    contentArea.innerHTML = `
      <div style="max-width:800px;margin:40px auto;text-align:center;">
        <i class="fas fa-chart-bar fa-4x text-muted mb-3" style="opacity:0.3;"></i>
        <h5 style="font-weight:700;">Form Analytics</h5>
        <p class="text-muted">Total submissions: <strong>${totalSubmissions}</strong></p>
        <p class="text-muted">Detailed analytics with charts and conversion tracking coming soon.</p>
        <button class="form-btn form-btn-outline" onclick="Forms.currentTab='submissions';Forms.render();">View Submissions</button>
      </div>`;
  },

  async deleteForm(id) {
    if (!confirm('Delete this form and all its submissions?')) return;
    await db.collection('forms').doc(id).delete();
    showToast('Form deleted.', 'success');
    this.render();
  }
};
