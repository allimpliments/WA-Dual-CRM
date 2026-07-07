// js/appointments.js — World-Class Appointment Booking System for SaaS Platform
const Appointments = {
  currentView: 'dashboard',
  selectedDate: new Date().toISOString().split('T')[0],
  filterStaff: 'all',
  filterService: 'all',
  filterStatus: 'all',
  searchQuery: '',

  // Pre-defined service templates for different industries
  serviceTemplates: {
    medical: ['General Consultation', 'Specialist Consultation', 'Follow-up Visit', 'Health Checkup', 'Vaccination', 'Lab Test', 'X-Ray/Scan', 'Surgery Consultation'],
    dental: ['Dental Checkup', 'Teeth Cleaning', 'Root Canal', 'Tooth Extraction', 'Braces Consultation', 'Crown/Bridge', 'Whitening'],
    salon: ['Haircut', 'Hair Color', 'Facial', 'Manicure', 'Pedicure', 'Massage', 'Bridal Package', 'Skin Treatment'],
    spa: ['Swedish Massage', 'Deep Tissue', 'Aromatherapy', 'Hot Stone', 'Body Scrub', 'Facial Spa', 'Couple Massage'],
    therapy: ['Individual Therapy', 'Couples Counseling', 'Family Therapy', 'Child Therapy', 'Group Session', 'Online Session'],
    fitness: ['Personal Training', 'Yoga Session', 'Pilates', 'Zumba', 'CrossFit', 'Nutrition Consultation'],
    astrology: ['Birth Chart Reading', 'Career Consultation', 'Relationship Guidance', 'Gemstone Recommendation', 'Vastu Consultation', 'Tarot Reading'],
    legal: ['Initial Consultation', 'Document Review', 'Court Representation', 'Legal Advice', 'Contract Drafting'],
    education: ['Academic Tutoring', 'Test Prep', 'Language Class', 'Music Lesson', 'Career Counseling', 'Admission Guidance'],
    business: ['Strategy Session', 'Financial Planning', 'Marketing Consultation', 'HR Consulting', 'Tax Filing', 'Audit'],
    veterinary: ['Pet Checkup', 'Vaccination', 'Surgery', 'Grooming', 'Dental Care', 'Emergency Visit'],
    realestate: ['Property Tour', 'Buyer Consultation', 'Seller Consultation', 'Property Valuation', 'Legal Check'],
  },

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = '#f8fafc';

    if (this.currentView === 'calendar') { await this.renderCalendar(); return; }
    if (this.currentView === 'staff') { await this.renderStaff(); return; }
    if (this.currentView === 'bookings') { await this.renderBookings(); return; }
    if (this.currentView === 'services') { await this.renderServices(); return; }
    if (this.currentView === 'settings') { await this.renderSettings(); return; }
    await this.renderDashboard();
  },

  // ==================== DASHBOARD ====================
  async renderDashboard() {
    let appointments = [], staffList = [], services = [], stats = { total: 0, confirmed: 0, completed: 0, cancelled: 0, revenue: 0, upcoming: 0 };

    try {
      const today = new Date().toISOString().split('T')[0];
      let aQuery = db.collection('appointments');
      if (shouldFilterByClient()) aQuery = aQuery.where('clientId', '==', window.currentUser.clientId);
      
      const [aSnap, sSnap, servSnap] = await Promise.all([
        aQuery.where('date', '>=', today).orderBy('date').orderBy('time').limit(50).get(),
        db.collection('staff').get(),
        db.collection('appointment_services').get()
      ]);
      appointments = aSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      staffList = sSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      services = servSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      stats.total = appointments.length;
      stats.confirmed = appointments.filter(a => a.status === 'confirmed').length;
      stats.completed = appointments.filter(a => a.status === 'completed').length;
      stats.cancelled = appointments.filter(a => a.status === 'cancelled').length;
      stats.upcoming = appointments.filter(a => a.date === today).length;
      appointments.forEach(a => { stats.revenue += parseInt(a.fees || 0); });
    } catch(e) { console.error(e); }

    const connectedCount = staffList.length;
    const todayAppointments = appointments.filter(a => a.date === new Date().toISOString().split('T')[0]);

    let html = `
      <style>
        .apt-wrap { max-width: 1400px; margin: 0 auto; }
        .apt-header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%); border-radius: 24px; padding: 28px 32px; margin-bottom: 24px; color: #fff; position: relative; overflow: hidden; }
        .apt-header::before { content: ''; position: absolute; top: -60px; right: -60px; width: 250px; height: 250px; background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%); border-radius: 50%; }
        .apt-header h4 { margin: 0; font-weight: 800; font-size: 22px; position: relative; z-index: 1; }
        .apt-header p { margin: 4px 0 0; color: #94a3b8; font-size: 13px; position: relative; z-index: 1; }
        .apt-stat { background: #fff; border-radius: 14px; padding: 18px 20px; display: flex; align-items: center; gap: 14px; border: 1px solid #f1f5f9; transition: 0.2s; cursor: pointer; }
        .apt-stat:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.06); transform: translateY(-2px); }
        .apt-stat-icon { width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .apt-stat-val { font-size: 24px; font-weight: 800; line-height: 1.1; color: #0f172a; }
        .apt-stat-lbl { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
        .apt-card { background: #fff; border-radius: 16px; padding: 22px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.04); margin-bottom: 16px; }
        .apt-card h6 { font-weight: 700; font-size: 14px; color: #0f172a; margin-bottom: 14px; }
        .apt-timeline { position: relative; padding-left: 24px; }
        .apt-timeline::before { content: ''; position: absolute; left: 8px; top: 0; bottom: 0; width: 2px; background: #e2e8f0; border-radius: 2px; }
        .apt-item { position: relative; margin-bottom: 12px; padding: 14px 16px 14px 20px; background: #f8fafc; border-radius: 10px; border-left: 4px solid #6366f1; transition: 0.15s; }
        .apt-item:hover { background: #eef2ff; }
        .apt-item::before { content: ''; position: absolute; left: -30px; top: 18px; width: 10px; height: 10px; border-radius: 50%; background: #6366f1; border: 2px solid #fff; box-shadow: 0 0 0 2px #6366f1; }
        .apt-item.confirmed { border-left-color: #6366f1; }
        .apt-item.confirmed::before { background: #6366f1; box-shadow: 0 0 0 2px #6366f1; }
        .apt-item.completed { border-left-color: #10b981; opacity: 0.85; }
        .apt-item.completed::before { background: #10b981; box-shadow: 0 0 0 2px #10b981; }
        .apt-item.cancelled { border-left-color: #ef4444; opacity: 0.6; text-decoration: line-through; }
        .apt-item.cancelled::before { background: #ef4444; box-shadow: 0 0 0 2px #ef4444; }
        .apt-item.waiting { border-left-color: #f59e0b; }
        .apt-item.waiting::before { background: #f59e0b; box-shadow: 0 0 0 2px #f59e0b; }
        .apt-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; }
        .apt-btn { padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; border: 1px solid #e2e8f0; background: #fff; transition: 0.2s; display: inline-flex; align-items: center; gap: 4px; color: #475569; }
        .apt-btn:hover { background: #6366f1; color: #fff; border-color: #6366f1; }
        .apt-btn-success { color: #10b981; border-color: #10b981; }
        .apt-btn-success:hover { background: #10b981; color: #fff; }
        .apt-btn-danger { color: #ef4444; border-color: #ef4444; }
        .apt-btn-danger:hover { background: #ef4444; color: #fff; }
        .apt-btn-warning { color: #f59e0b; border-color: #f59e0b; }
        .apt-btn-warning:hover { background: #f59e0b; color: #fff; }
        .apt-btn-primary { background: #6366f1; color: #fff; border: none; padding: 8px 16px; }
        .apt-btn-primary:hover { background: #4f46e5; }
        .apt-video-box { background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 10px; padding: 12px 16px; color: #fff; text-align: center; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; font-size: 13px; }
        .apt-video-box:hover { background: linear-gradient(135deg, #312e81, #1e293b); transform: scale(1.02); }
        .apt-industry-btn { padding: 6px 12px; border-radius: 20px; font-size: 11px; cursor: pointer; border: 1px solid #e2e8f0; background: #fff; transition: 0.2s; }
        .apt-industry-btn:hover, .apt-industry-btn.active { background: #6366f1; color: #fff; border-color: #6366f1; }
        .apt-input { width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px; outline: none; }
        .apt-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        @media (max-width: 768px) { .apt-header { padding: 20px; } }
      </style>

      <div class="apt-wrap">
        <div class="apt-header">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h4><i class="fas fa-calendar-check me-2"></i>Appointment Center</h4>
              <p>${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · ${stats.upcoming} appointments today</p>
            </div>
            <div class="d-flex gap-2">
              <button class="apt-btn-primary" onclick="Appointments.showBookForm()"><i class="fas fa-plus"></i> New Booking</button>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-md-2"><div class="apt-stat" onclick="Appointments.currentView='bookings';Appointments.render();"><div class="apt-stat-icon" style="background:#eef2ff;"><i class="fas fa-calendar-check" style="color:#6366f1;"></i></div><div><div class="apt-stat-val">${stats.total}</div><div class="apt-stat-lbl">Upcoming</div></div></div></div>
          <div class="col-6 col-md-2"><div class="apt-stat"><div class="apt-stat-icon" style="background:#ecfdf5;"><i class="fas fa-check-circle" style="color:#10b981;"></i></div><div><div class="apt-stat-val">${stats.confirmed}</div><div class="apt-stat-lbl">Confirmed</div></div></div></div>
          <div class="col-6 col-md-2"><div class="apt-stat"><div class="apt-stat-icon" style="background:#ecfdf5;"><i class="fas fa-check-double" style="color:#059669;"></i></div><div><div class="apt-stat-val">${stats.completed}</div><div class="apt-stat-lbl">Completed</div></div></div></div>
          <div class="col-6 col-md-2"><div class="apt-stat"><div class="apt-stat-icon" style="background:#fffbeb;"><i class="fas fa-rupee-sign" style="color:#f59e0b;"></i></div><div><div class="apt-stat-val">₹${stats.revenue >= 1000 ? (stats.revenue/1000).toFixed(0)+'K' : stats.revenue}</div><div class="apt-stat-lbl">Revenue</div></div></div></div>
          <div class="col-6 col-md-2"><div class="apt-stat"><div class="apt-stat-icon" style="background:#e0f2fe;"><i class="fas fa-user-md" style="color:#0ea5e9;"></i></div><div><div class="apt-stat-val">${staffList.length}</div><div class="apt-stat-lbl">Staff</div></div></div></div>
          <div class="col-6 col-md-2"><div class="apt-stat"><div class="apt-stat-icon" style="background:#f1f5f9;"><i class="fas fa-list" style="color:#64748b;"></i></div><div><div class="apt-stat-val">${services.length}</div><div class="apt-stat-lbl">Services</div></div></div></div>
        </div>

        <!-- Tabs -->
        <div class="d-flex gap-2 mb-3 flex-wrap">
          <button class="apt-btn ${this.currentView==='dashboard'?'active':''}" onclick="Appointments.currentView='dashboard';Appointments.render();"><i class="fas fa-th-large"></i> Dashboard</button>
          <button class="apt-btn ${this.currentView==='calendar'?'active':''}" onclick="Appointments.currentView='calendar';Appointments.render();"><i class="fas fa-calendar-alt"></i> Calendar</button>
          <button class="apt-btn ${this.currentView==='bookings'?'active':''}" onclick="Appointments.currentView='bookings';Appointments.render();"><i class="fas fa-list"></i> All Bookings</button>
          <button class="apt-btn ${this.currentView==='staff'?'active':''}" onclick="Appointments.currentView='staff';Appointments.render();"><i class="fas fa-user-md"></i> Staff</button>
          <button class="apt-btn ${this.currentView==='services'?'active':''}" onclick="Appointments.currentView='services';Appointments.render();"><i class="fas fa-cog"></i> Services</button>
        </div>

        <div class="row g-4">
          <div class="col-lg-8">
            <!-- Today's Schedule -->
            <div class="apt-card">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 style="margin:0;">📅 Today's Schedule (${todayAppointments.length})</h6>
                <button class="apt-btn apt-btn-warning btn-sm" onclick="Appointments.sendAllReminders()"><i class="fab fa-whatsapp"></i> Send All Reminders</button>
              </div>
              ${todayAppointments.length === 0 ? `<div class="text-center py-5"><i class="fas fa-calendar-check fa-3x text-muted mb-2" style="opacity:0.3;"></i><p class="text-muted">No appointments today. Enjoy your day! 🎉</p></div>` : 
              `<div class="apt-timeline">${todayAppointments.map(a => `
                <div class="apt-item ${a.status}">
                  <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div>
                      <strong style="font-size:15px;">${a.time || '--:--'}</strong>
                      <span style="font-weight:600;margin-left:8px;">${a.client || 'N/A'}</span>
                      <span class="apt-badge ms-2" style="background:#eef2ff;color:#6366f1;">${a.type === 'video' ? '🎥 Video' : a.type === 'call' ? '📞 Call' : '🏥 In-Person'}</span>
                    </div>
                    <span class="apt-badge" style="background:${a.status==='confirmed'?'#ecfdf5':a.status==='completed'?'#ecfdf5':a.status==='cancelled'?'#fef2f2':'#fffbeb'};color:${a.status==='confirmed'?'#10b981':a.status==='completed'?'#10b981':a.status==='cancelled'?'#ef4444':'#f59e0b'};">${a.status}</span>
                  </div>
                  <div style="font-size:12px;color:#64748b;margin-top:4px;">${a.service || ''} · ${a.staff || ''} · ₹${a.fees || 0} ${a.phone ? '· 📱 '+a.phone : ''}</div>
                  ${a.type === 'video' && a.meetLink ? `<div class="apt-video-box mt-2" onclick="window.open('${a.meetLink}','_blank')"><i class="fas fa-video"></i> Join Video Call</div>` : ''}
                  <div class="d-flex flex-wrap gap-1 mt-2">
                    ${a.phone ? `<button class="apt-btn apt-btn-success btn-sm" onclick="window.open('tel:${a.phone}','_blank')"><i class="fas fa-phone-alt"></i> Call</button>` : ''}
                    ${!a.meetLink ? `<button class="apt-btn btn-sm" onclick="Appointments.createMeet('${a.id}')"><i class="fas fa-video"></i> Create Meet</button>` : ''}
                    <button class="apt-btn apt-btn-warning btn-sm" onclick="Appointments.sendReminder('${a.id}')"><i class="fab fa-whatsapp"></i> Remind</button>
                    <button class="apt-btn btn-sm" onclick="Appointments.showBookForm('${a.id}')"><i class="fas fa-edit"></i></button>
                    <button class="apt-btn apt-btn-success btn-sm" onclick="Appointments.updateStatus('${a.id}','completed')">✓ Done</button>
                    <button class="apt-btn apt-btn-danger btn-sm" onclick="Appointments.updateStatus('${a.id}','cancelled')">✕ Cancel</button>
                  </div>
                </div>
              `).join('')}</div>`}
            </div>
          </div>

          <div class="col-lg-4">
            <!-- Staff on Duty -->
            <div class="apt-card">
              <h6><i class="fas fa-user-md me-2"></i>Staff on Duty</h6>
              ${staffList.length === 0 ? '<p class="text-muted small">No staff added yet.</p>' : staffList.slice(0, 6).map(s => `
                <div class="d-flex align-items-center gap-3 mb-3">
                  <div style="width:40px;height:40px;border-radius:50%;background:${(s.color||'#6366f1')}15;color:${s.color||'#6366f1'};display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;flex-shrink:0;">${(s.name||'?')[0].toUpperCase()}</div>
                  <div class="flex-grow-1"><strong style="font-size:13px;">${s.name}</strong><br><small class="text-muted">${s.speciality||''} · ₹${s.fees||0}/session</small></div>
                  <span class="apt-badge" style="background:#ecfdf5;color:#10b981;">Available</span>
                </div>
              `).join('')}
              <button class="apt-btn w-100 mt-2" onclick="Appointments.currentView='staff';Appointments.render();">Manage Staff →</button>
            </div>

            <!-- Industry Quick Templates -->
            <div class="apt-card">
              <h6><i class="fas fa-magic me-2"></i>Quick Setup by Industry</h6>
              <p class="text-muted small mb-2">Select your industry to pre-load relevant services</p>
              <div class="d-flex flex-wrap gap-1">
                ${Object.keys(this.serviceTemplates).map(key => `
                  <button class="apt-industry-btn" onclick="Appointments.loadIndustryTemplate('${key}')">${key.charAt(0).toUpperCase()+key.slice(1)}</button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="aptModal"></div>
    `;
    contentArea.innerHTML = html;
  },

  // ==================== BOOKING FORM ====================
  showBookForm(editId = null) {
    const loadForm = async () => {
      let staffList = [], services = [], data = {};
      try {
        const [sSnap, servSnap] = await Promise([db.collection('staff').get(), db.collection('appointment_services').get()]);
        staffList = sSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        services = servSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch(e) {}
      if (editId) { const d = await db.collection('appointments').doc(editId).get(); if (d.exists) data = d.data(); }

      document.getElementById('aptModal').innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
          <div style="background:#fff;border-radius:20px;padding:28px;width:560px;max-width:95vw;max-height:90vh;overflow-y:auto;" onclick="event.stopPropagation()">
            <h5 style="font-weight:700;"><i class="fas fa-calendar-plus me-2"></i>${editId?'Edit':'New'} Appointment</h5>
            <div class="row g-2">
              <div class="col-md-6"><label class="small fw-bold">Client Name *</label><input id="aptClient" class="apt-input" value="${data.client||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Phone *</label><input id="aptPhone" class="apt-input" value="${data.phone||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Email</label><input id="aptEmail" class="apt-input" value="${data.email||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Service</label><select id="aptService" class="apt-input">${services.map(s=>`<option value="${s.name}" ${data.service===s.name?'selected':''}>${s.name} (₹${s.price||0})</option>`).join('')}<option value="Other">Other</option></select></div>
              <div class="col-md-6"><label class="small fw-bold">Staff</label><select id="aptStaff" class="apt-input">${staffList.map(s=>`<option value="${s.name}" ${data.staff===s.name?'selected':''}>${s.name}</option>`).join('')}</select></div>
              <div class="col-md-6"><label class="small fw-bold">Type</label><select id="aptType" class="apt-input"><option value="video" ${data.type==='video'?'selected':''}>🎥 Video Call</option><option value="call" ${data.type==='call'?'selected':''}>📞 Phone Call</option><option value="clinic" ${data.type==='clinic'?'selected':''}>🏥 In-Person</option></select></div>
              <div class="col-4"><label class="small fw-bold">Date</label><input type="date" id="aptDate" class="apt-input" value="${data.date||this.selectedDate}"></div>
              <div class="col-4"><label class="small fw-bold">Time</label><input type="time" id="aptTime" class="apt-input" value="${data.time||'10:00'}"></div>
              <div class="col-4"><label class="small fw-bold">Fees ₹</label><input type="number" id="aptFees" class="apt-input" value="${data.fees||''}"></div>
              <div class="col-12"><label class="small fw-bold">Meet Link</label><input id="aptMeet" class="apt-input" value="${data.meetLink||''}" placeholder="https://meet.google.com/..."></div>
              <div class="col-12"><label class="small fw-bold">Notes</label><textarea id="aptNotes" class="apt-input" rows="2">${data.notes||''}</textarea></div>
              <div class="col-6"><label style="display:flex;align-items:center;gap:8px;font-size:12px;margin-top:8px;"><input type="checkbox" id="aptReminder" checked> Send WhatsApp reminder</label></div>
            </div>
            <button class="apt-btn-primary w-100 mt-3" style="padding:12px;" onclick="Appointments.saveBooking('${editId||''}')">${editId?'Update':'Book'} Appointment</button>
            <button class="apt-btn w-100 mt-2" onclick="document.getElementById('aptModal').innerHTML=''">Cancel</button>
          </div></div>`;
    };
    loadForm();
  },

  async saveBooking(editId) {
    const client = document.getElementById('aptClient')?.value?.trim();
    const phone = document.getElementById('aptPhone')?.value?.trim();
    if (!client || !phone) return showToast('Client name and phone required!', 'warning');
    const data = {
      client, phone, email: document.getElementById('aptEmail')?.value||'',
      service: document.getElementById('aptService')?.value,
      staff: document.getElementById('aptStaff')?.value,
      type: document.getElementById('aptType')?.value,
      date: document.getElementById('aptDate')?.value,
      time: document.getElementById('aptTime')?.value,
      fees: document.getElementById('aptFees')?.value||'',
      meetLink: document.getElementById('aptMeet')?.value||'',
      notes: document.getElementById('aptNotes')?.value||'',
      status: 'confirmed',
      clientId: getCurrentClientId(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    try {
      if (editId) { await db.collection('appointments').doc(editId).update(data); }
      else { data.createdAt = firebase.firestore.FieldValue.serverTimestamp(); await db.collection('appointments').add(data); }
      document.getElementById('aptModal').innerHTML = '';
      if (document.getElementById('aptReminder')?.checked && data.phone) {
        await this.sendWhatsApp(data.phone, `✅ Appointment Confirmed!\n\n📅 ${data.date} at ${data.time}\n👨‍⚕️ ${data.staff}\n📋 ${data.service}\n${data.meetLink ? '🔗 Join: '+data.meetLink : ''}\n\nThank you for booking! 🙏`);
      }
      this.render();
      showToast(`✅ ${editId?'Updated':'Booked'}!`, 'success');
    } catch(e) { showToast('Error: '+e.message, 'error'); }
  },

  editBooking(id) { this.showBookForm(id); },

  // ==================== ACTIONS ====================
  async updateStatus(id, status) {
    await db.collection('appointments').doc(id).update({ status, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    this.render();
  },
  async createMeet(id) {
    const link = 'https://meet.google.com/' + Math.random().toString(36).substring(2, 10);
    await db.collection('appointments').doc(id).update({ meetLink: link });
    showToast('✅ Google Meet link created!', 'success');
    this.render();
  },
  async sendReminder(id) {
    const d = await db.collection('appointments').doc(id).get();
    const a = d.data();
    if (a.phone) { await this.sendWhatsApp(a.phone, `⏰ Reminder: Your appointment is on ${a.date} at ${a.time} with ${a.staff}.\n${a.meetLink ? 'Join: ' + a.meetLink : ''}`); showToast('✅ Reminder sent!', 'success'); }
  },
  async sendAllReminders() {
    const today = new Date().toISOString().split('T')[0];
    let q = db.collection('appointments');
    if (shouldFilterByClient()) q = q.where('clientId', '==', window.currentUser.clientId);
    const snap = await q.where('date', '==', today).where('status', '==', 'confirmed').get();
    let sent = 0;
    for (const d of snap.docs) { const a = d.data(); if (a.phone) { await this.sendWhatsApp(a.phone, `⏰ Reminder: Today at ${a.time} with ${a.staff}.`); sent++; } }
    showToast(`✅ ${sent} reminders sent!`, 'success');
  },

  async sendWhatsApp(phone, msg) {
    try {
      const cfg = (await db.collection('settings').doc('whatsapp').get()).data();
      if (!cfg?.accessToken) return;
      phone = phone.replace(/[^0-9+]/g, '');
      if (!phone.startsWith('+') && phone.length === 10) phone = '+91' + phone;
      await fetch(`https://graph.facebook.com/v22.0/${cfg.phoneNumberId}/messages`, {
        method: 'POST', headers: { 'Authorization': 'Bearer ' + cfg.accessToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaging_product: 'whatsapp', to: phone, type: 'text', text: { body: msg } })
      });
    } catch(e) { /* silent */ }
  },

  // ==================== INDUSTRY TEMPLATES ====================
  async loadIndustryTemplate(industry) {
    const services = this.serviceTemplates[industry] || [];
    if (services.length === 0) return showToast('No templates for this industry.', 'warning');
    const batch = db.batch();
    services.forEach(name => {
      const ref = db.collection('appointment_services').doc();
      batch.set(ref, { name, price: '', duration: '30 min', category: industry, clientId: getCurrentClientId(), createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    });
    await batch.commit();
    showToast(`✅ ${services.length} services loaded for ${industry}!`, 'success');
    this.render();
  },

  // ==================== SERVICES ====================
  async renderServices() {
    let services = [];
    try { const s = await db.collection('appointment_services').get(); services = s.docs.map(d => ({ id: d.id, ...d.data() })); } catch(e) {}
    let html = `
      <div class="apt-wrap">
        <button class="apt-btn mb-3" onclick="Appointments.currentView='dashboard';Appointments.render();"><i class="fas fa-arrow-left"></i> Back</button>
        <div class="d-flex justify-content-between mb-3"><h5 style="font-weight:700;">Services</h5><button class="apt-btn-primary btn-sm" onclick="Appointments.showServiceForm()"><i class="fas fa-plus"></i> Add Service</button></div>
        <div class="apt-card"><div class="table-responsive"><table class="table table-sm"><thead><tr><th>Service</th><th>Price</th><th>Duration</th><th>Category</th><th>Actions</th></tr></thead><tbody>
          ${services.length===0?'<tr><td colspan="5" class="text-center text-muted">No services</td></tr>':services.map(s=>`
            <tr><td><strong>${s.name}</strong></td><td>₹${s.price||'N/A'}</td><td>${s.duration||'30 min'}</td><td>${s.category||'General'}</td>
            <td><button class="apt-btn btn-sm" onclick="Appointments.showServiceForm('${s.id}')"><i class="fas fa-edit"></i></button><button class="apt-btn apt-btn-danger btn-sm" onclick="Appointments.deleteService('${s.id}')"><i class="fas fa-trash"></i></button></td></tr>
          `).join('')}
        </tbody></table></div></div>
      </div><div id="aptModal"></div>`;
    contentArea.innerHTML = html;
  },

  showServiceForm(editId = null) {
    const load = async () => {
      let data = {};
      if (editId) { const d = await db.collection('appointment_services').doc(editId).get(); if (d.exists) data = d.data(); }
      document.getElementById('aptModal').innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
          <div style="background:#fff;border-radius:20px;padding:24px;width:420px;" onclick="event.stopPropagation()">
            <h5 style="font-weight:700;">${editId?'Edit':'Add'} Service</h5>
            <input id="servName" class="apt-input" placeholder="Service Name" value="${data.name||''}">
            <input id="servPrice" class="apt-input" placeholder="Price (₹)" value="${data.price||''}">
            <input id="servDuration" class="apt-input" placeholder="Duration (e.g. 30 min)" value="${data.duration||'30 min'}">
            <input id="servCategory" class="apt-input" placeholder="Category" value="${data.category||''}">
            <button class="apt-btn-primary w-100 mt-2" onclick="Appointments.saveService('${editId||''}')">Save</button>
            <button class="apt-btn w-100 mt-2" onclick="document.getElementById('aptModal').innerHTML=''">Cancel</button>
          </div></div>`;
    };
    load();
  },

  async saveService(editId) {
    const name = document.getElementById('servName')?.value?.trim();
    if (!name) return showToast('Service name required!', 'warning');
    const data = { name, price: document.getElementById('servPrice')?.value||'', duration: document.getElementById('servDuration')?.value||'30 min', category: document.getElementById('servCategory')?.value||'', updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
    try {
      if (editId) { await db.collection('appointment_services').doc(editId).update(data); }
      else { data.createdAt = firebase.firestore.FieldValue.serverTimestamp(); data.clientId = getCurrentClientId(); await db.collection('appointment_services').add(data); }
      document.getElementById('aptModal').innerHTML = '';
      showToast('✅ Service saved!', 'success');
      this.renderServices();
    } catch(e) { showToast('Error: '+e.message, 'error'); }
  },

  async deleteService(id) { if (confirm('Delete?')) { await db.collection('appointment_services').doc(id).delete(); this.renderServices(); } },

  // ==================== STAFF MANAGEMENT ====================
  async renderStaff() {
    let staffList = [];
    try { const s = await db.collection('staff').get(); staffList = s.docs.map(d => ({ id: d.id, ...d.data() })); } catch(e) {}
    let html = `
      <div class="apt-wrap">
        <button class="apt-btn mb-3" onclick="Appointments.currentView='dashboard';Appointments.render();"><i class="fas fa-arrow-left"></i> Back</button>
        <div class="d-flex justify-content-between mb-3"><h5 style="font-weight:700;">Staff Management</h5><button class="apt-btn-primary btn-sm" onclick="Appointments.showStaffForm()"><i class="fas fa-plus"></i> Add Staff</button></div>
        <div class="row g-3">
          ${staffList.length===0?'<div class="col-12 text-center py-4 text-muted">No staff members</div>':staffList.map(s=>`
            <div class="col-md-4"><div class="apt-card text-center">
              <div style="width:60px;height:60px;border-radius:50%;background:${(s.color||'#6366f1')}15;color:${s.color||'#6366f1'};display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;margin:0 auto 10px;">${(s.name||'?')[0].toUpperCase()}</div>
              <h6 style="font-weight:700;">${s.name||'N/A'}</h6><p class="small text-muted">${s.speciality||''} · ${s.experience||''}</p>
              <p class="small"><i class="far fa-clock me-1"></i>${s.availability||'N/A'}</p>
              <p class="fw-bold" style="color:${s.color||'#6366f1'};">₹${s.fees||'N/A'}/session</p>
              <div class="d-flex justify-content-center gap-1 mt-2">
                <button class="apt-btn btn-sm" onclick="Appointments.showStaffForm('${s.id}')"><i class="fas fa-edit"></i></button>
                <button class="apt-btn apt-btn-danger btn-sm" onclick="Appointments.deleteStaff('${s.id}')"><i class="fas fa-trash"></i></button>
              </div>
            </div></div>
          `).join('')}
        </div>
      </div><div id="aptModal"></div>`;
    contentArea.innerHTML = html;
  },

  showStaffForm(editId = null) {
    const load = async () => {
      let data = {};
      if (editId) { const d = await db.collection('staff').doc(editId).get(); if (d.exists) data = d.data(); }
      document.getElementById('aptModal').innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
          <div style="background:#fff;border-radius:20px;padding:24px;width:440px;" onclick="event.stopPropagation()">
            <h5 style="font-weight:700;">${editId?'Edit':'Add'} Staff</h5>
            <div class="row g-2">
              <div class="col-md-6"><input id="stName" class="apt-input" placeholder="Name *" value="${data.name||''}"></div>
              <div class="col-md-6"><input id="stSpeciality" class="apt-input" placeholder="Speciality" value="${data.speciality||''}"></div>
              <div class="col-md-6"><input id="stExperience" class="apt-input" placeholder="Experience" value="${data.experience||''}"></div>
              <div class="col-md-6"><input id="stFees" class="apt-input" placeholder="Fees (₹)" value="${data.fees||''}"></div>
              <div class="col-md-6"><input id="stPhone" class="apt-input" placeholder="Phone" value="${data.phone||''}"></div>
              <div class="col-md-6"><input id="stColor" class="apt-input" placeholder="Color (#hex)" value="${data.color||'#6366f1'}"></div>
              <div class="col-12"><input id="stAvailability" class="apt-input" placeholder="Availability (e.g. Mon-Fri, 9AM-5PM)" value="${data.availability||''}"></div>
            </div>
            <button class="apt-btn-primary w-100 mt-2" onclick="Appointments.saveStaff('${editId||''}')">Save</button>
            <button class="apt-btn w-100 mt-2" onclick="document.getElementById('aptModal').innerHTML=''">Cancel</button>
          </div></div>`;
    };
    load();
  },

  async saveStaff(editId) {
    const name = document.getElementById('stName')?.value?.trim();
    if (!name) return showToast('Name required!', 'warning');
    const data = { name, speciality: document.getElementById('stSpeciality')?.value||'', experience: document.getElementById('stExperience')?.value||'', fees: document.getElementById('stFees')?.value||'', phone: document.getElementById('stPhone')?.value||'', color: document.getElementById('stColor')?.value||'#6366f1', availability: document.getElementById('stAvailability')?.value||'' };
    try {
      if (editId) { await db.collection('staff').doc(editId).update(data); }
      else { await db.collection('staff').add(data); }
      document.getElementById('aptModal').innerHTML = '';
      showToast('✅ Staff saved!', 'success');
      this.renderStaff();
    } catch(e) { showToast('Error: '+e.message, 'error'); }
  },

  async deleteStaff(id) { if (confirm('Delete?')) { await db.collection('staff').doc(id).delete(); this.renderStaff(); } },

  // ==================== CALENDAR & BOOKINGS ====================
  async renderCalendar() {
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const today = new Date();
    const year = today.getFullYear(), month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    let calendarHTML = '';
    for (let i = 0; i < firstDay; i++) calendarHTML += '<div class="cal-day empty"></div>';
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const isToday = dateStr === today.toISOString().split('T')[0];
      calendarHTML += `<div class="cal-day ${isToday?'today':''}" onclick="Appointments.selectedDate='${dateStr}';Appointments.currentView='dashboard';Appointments.render();"><span class="cal-date">${d}</span></div>`;
    }
    let html = `
      <div class="apt-wrap">
        <button class="apt-btn mb-3" onclick="Appointments.currentView='dashboard';Appointments.render();"><i class="fas fa-arrow-left"></i> Back</button>
        <h5 style="font-weight:700;">${monthNames[month]} ${year}</h5>
        <style>.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;}.cal-day{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;min-height:60px;cursor:pointer;text-align:center;}.cal-day.today{border-color:#6366f1;background:#eef2ff;}.cal-day.empty{background:#f8fafc;}.cal-date{font-size:15px;font-weight:700;}.cal-header{text-align:center;font-size:11px;font-weight:600;color:#64748b;padding:8px;}</style>
        <div class="cal-grid mt-3">${days.map(d=>`<div class="cal-header">${d}</div>`).join('')}${calendarHTML}</div></div>`;
    contentArea.innerHTML = html;
  },

  async renderBookings() {
    let bookings = [];
    try {
      let q = db.collection('appointments');
      if (shouldFilterByClient()) q = q.where('clientId', '==', window.currentUser.clientId);
      const s = await q.orderBy('createdAt', 'desc').limit(100).get();
      bookings = s.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) {}
    let html = `
      <div class="apt-wrap">
        <button class="apt-btn mb-3" onclick="Appointments.currentView='dashboard';Appointments.render();"><i class="fas fa-arrow-left"></i> Back</button>
        <h5 style="font-weight:700;">All Bookings (${bookings.length})</h5>
        <div class="apt-card mt-3"><div class="table-responsive"><table class="table table-sm"><thead><tr><th>Date</th><th>Time</th><th>Client</th><th>Phone</th><th>Service</th><th>Staff</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          ${bookings.length===0?'<tr><td colspan="8" class="text-center text-muted">No bookings</td></tr>':bookings.map(b=>`
            <tr><td>${b.date||'-'}</td><td>${b.time||'-'}</td><td><strong>${b.client||'-'}</strong></td><td>${b.phone||'-'}</td><td>${b.service||'-'}</td><td>${b.staff||'-'}</td>
            <td><span class="apt-badge" style="background:${b.status==='confirmed'?'#ecfdf5':b.status==='completed'?'#ecfdf5':'#fef2f2'};color:${b.status==='confirmed'?'#10b981':b.status==='completed'?'#10b981':'#ef4444'};">${b.status}</span></td>
            <td><button class="apt-btn btn-sm" onclick="Appointments.showBookForm('${b.id}')"><i class="fas fa-edit"></i></button><button class="apt-btn apt-btn-danger btn-sm" onclick="Appointments.updateStatus('${b.id}','cancelled');Appointments.renderBookings();"><i class="fas fa-trash"></i></button></td></tr>
          `).join('')}
        </tbody></table></div></div></div>`;
    contentArea.innerHTML = html;
  },

  async renderSettings() {
    contentArea.innerHTML = `<div class="apt-wrap"><div class="apt-card"><h6>Settings</h6><p class="text-muted">Working hours, buffer time, notification settings — coming soon.</p></div></div>`;
  }
};
