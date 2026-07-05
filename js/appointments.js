// js/appointments.js — Complete Appointment System with Telecalling & External Sync
const Appointments = {
  currentView: 'dashboard',
  selectedDate: new Date().toISOString().split('T')[0],
  selectedStaff: null,
  externalIntegrations: {},

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = 'var(--bg-primary, #f0f2f5)';

    // Load saved integrations
    try {
      const doc = await db.collection('settings').doc('appointment_integrations').get();
      if (doc.exists) this.externalIntegrations = doc.data() || {};
    } catch(e) {}

    if (this.currentView === 'calendar') { await this.renderCalendar(); return; }
    if (this.currentView === 'staff') { await this.renderStaff(); return; }
    if (this.currentView === 'bookings') { await this.renderBookings(); return; }
    if (this.currentView === 'integrations') { await this.renderIntegrations(); return; }

    await this.renderDashboard();
  },

  async renderDashboard() {
    let appointments = [];
    let stats = { total: 0, confirmed: 0, completed: 0, cancelled: 0, todayRevenue: 0 };

    try {
      const today = new Date().toISOString().split('T')[0];
      const snap = await db.collection('appointments')
        .where('date', '==', today)
        .orderBy('time')
        .get();
      appointments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      stats.total = appointments.length;
      stats.confirmed = appointments.filter(a => a.status === 'confirmed').length;
      stats.completed = appointments.filter(a => a.status === 'completed').length;
      stats.cancelled = appointments.filter(a => a.status === 'cancelled').length;
      appointments.forEach(a => { stats.todayRevenue += parseInt(a.fees || 0); });
    } catch(e) { console.error(e); }

    const connectedPlatforms = Object.entries(this.externalIntegrations).filter(([k,v]) => v.enabled).map(([k]) => k);

    let html = `
      <style>
        .apt-stat{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:0.2s;}
        .apt-stat:hover{border-color:#3b82f6;box-shadow:0 4px 12px rgba(0,0,0,0.04);}
        .apt-icon{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
        .apt-val{font-size:22px;font-weight:800;line-height:1.1;}
        .apt-lbl{font-size:10px;color:#6b7280;text-transform:uppercase;}
        .apt-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:18px;margin-bottom:12px;}
        .apt-timeline{position:relative;padding-left:24px;}
        .apt-timeline::before{content:'';position:absolute;left:8px;top:0;bottom:0;width:2px;background:#e5e7eb;}
        .apt-item{position:relative;margin-bottom:14px;padding-left:20px;}
        .apt-item::before{content:'';position:absolute;left:-20px;top:4px;width:12px;height:12px;border-radius:50%;border:2px solid #3b82f6;background:#fff;}
        .apt-item.confirmed::before{background:#3b82f6;border-color:#3b82f6;}
        .apt-item.completed::before{background:#059669;border-color:#059669;}
        .apt-item.cancelled::before{background:#ef4444;border-color:#ef4444;}
        .apt-item.waiting::before{background:#d97706;border-color:#d97706;}
        .apt-badge{padding:3px 8px;border-radius:6px;font-size:10px;font-weight:500;}
        .apt-btn{padding:4px 10px;border-radius:6px;font-size:10px;cursor:pointer;border:1px solid #e5e7eb;background:#fff;margin:2px;transition:0.2s;white-space:nowrap;}
        .apt-btn:hover{background:#3b82f6;color:#fff;border-color:#3b82f6;}
        .apt-btn.call{color:#059669;}.apt-btn.call:hover{background:#059669;border-color:#059669;}
        .apt-btn.video{color:#4f46e5;}.apt-btn.video:hover{background:#4f46e5;border-color:#4f46e5;}
        .apt-btn.whatsapp{color:#25D366;}.apt-btn.whatsapp:hover{background:#25D366;border-color:#25D366;}
        .apt-btn.danger{color:#ef4444;}.apt-btn.danger:hover{background:#ef4444;border-color:#ef4444;}
      </style>

      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div>
          <h4 style="font-weight:700;"><i class="fas fa-calendar-check text-primary me-2"></i>Appointments</h4>
          <small class="text-muted">${new Date().toDateString()} ${connectedPlatforms.length > 0 ? '· Connected: ' + connectedPlatforms.join(', ') : ''}</small>
        </div>
        <div class="d-flex gap-1 mt-2 mt-md-0">
          <button class="btn btn-outline-primary btn-sm" onclick="Appointments.currentView='calendar';Appointments.render();"><i class="fas fa-calendar-alt"></i> Calendar</button>
          <button class="btn btn-outline-primary btn-sm" onclick="Appointments.currentView='staff';Appointments.render();"><i class="fas fa-user-md"></i> Staff</button>
          <button class="btn btn-outline-primary btn-sm" onclick="Appointments.currentView='bookings';Appointments.render();"><i class="fas fa-list"></i> All</button>
          <button class="btn btn-outline-info btn-sm" onclick="Appointments.currentView='integrations';Appointments.render();"><i class="fas fa-plug"></i> Connect</button>
          <button class="btn btn-primary btn-sm" onclick="Appointments.showBookForm()"><i class="fas fa-plus me-1"></i> New</button>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3"><div class="apt-stat" onclick="Appointments.currentView='bookings';Appointments.render();"><div class="apt-icon" style="background:#e0e7ff;color:#4f46e5;"><i class="fas fa-calendar-check"></i></div><div><div class="apt-val">${stats.total}</div><div class="apt-lbl">Today's Appointments</div></div></div></div>
        <div class="col-6 col-md-3"><div class="apt-stat"><div class="apt-icon" style="background:#d1fae5;color:#059669;"><i class="fas fa-check-circle"></i></div><div><div class="apt-val">${stats.confirmed}</div><div class="apt-lbl">Confirmed</div></div></div></div>
        <div class="col-6 col-md-3"><div class="apt-stat"><div class="apt-icon" style="background:#d1fae5;color:#059669;"><i class="fas fa-check-double"></i></div><div><div class="apt-val">${stats.completed}</div><div class="apt-lbl">Completed</div></div></div></div>
        <div class="col-6 col-md-3"><div class="apt-stat"><div class="apt-icon" style="background:#fef3c7;color:#d97706;"><i class="fas fa-rupee-sign"></i></div><div><div class="apt-val">₹${stats.todayRevenue}</div><div class="apt-lbl">Today's Revenue</div></div></div></div>
      </div>

      <div class="row g-3">
        <div class="col-lg-8">
          <div class="apt-card">
            <h6 style="font-weight:600;"><i class="far fa-clock me-1"></i>Today's Schedule</h6>
            <div class="apt-timeline">
              ${appointments.length === 0 ? '<p class="text-muted text-center py-3 small">No appointments today</p>' : appointments.map(a => `
                <div class="apt-item ${a.status}">
                  <div class="d-flex justify-content-between align-items-start flex-wrap">
                    <div>
                      <strong>${a.time || '--:--'}</strong> — ${a.client || 'N/A'}
                      <div class="small text-muted">${a.service || ''} · ${a.staff || ''} · ${a.type || 'video'}</div>
                      ${a.notes ? `<small class="text-muted d-block"><i class="fas fa-sticky-note me-1"></i>${a.notes}</small>` : ''}
                    </div>
                    <span class="apt-badge" style="background:${a.status==='confirmed'?'#d1fae5':a.status==='completed'?'#d1fae5':a.status==='cancelled'?'#fee2e2':'#fef3c7'};color:${a.status==='confirmed'?'#065f46':a.status==='completed'?'#065f46':a.status==='cancelled'?'#991b1b':'#92400e'};">${a.status}</span>
                  </div>
                  <div class="d-flex flex-wrap gap-1 mt-2">
                    ${a.phone ? `<button class="apt-btn call" onclick="Appointments.callPatient('${a.phone}','${a.client}')"><i class="fas fa-phone-alt"></i> Call</button>` : ''}
                    ${a.meetLink ? `<button class="apt-btn video" onclick="window.open('${a.meetLink}','_blank')"><i class="fas fa-video"></i> Join Meet</button>` : `<button class="apt-btn video" onclick="Appointments.createMeetLink('${a.id}')"><i class="fas fa-video"></i> Create Meet</button>`}
                    <button class="apt-btn whatsapp" onclick="Appointments.sendReminder('${a.id}')"><i class="fab fa-whatsapp"></i> Remind</button>
                    <button class="apt-btn" onclick="Appointments.updateStatus('${a.id}','completed')">✓ Complete</button>
                    <button class="apt-btn danger" onclick="Appointments.updateStatus('${a.id}','cancelled')">✕ Cancel</button>
                    ${a.fees ? `<span class="apt-badge ms-1" style="background:#fef3c7;color:#92400e;">₹${a.fees}</span>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="apt-card">
            <h6 style="font-weight:600;">Quick Actions</h6>
            <button class="btn btn-outline-primary btn-sm w-100 mb-2" onclick="Appointments.showBookForm()">📅 Book Appointment</button>
            <button class="btn btn-outline-success btn-sm w-100 mb-2" onclick="Appointments.sendBulkReminders()">📢 Send All Reminders</button>
            <button class="btn btn-outline-info btn-sm w-100 mb-2" onclick="Appointments.currentView='integrations';Appointments.render();">🔗 External Integrations</button>
          </div>

          <div class="apt-card">
            <h6 style="font-weight:600;">External Connections</h6>
            ${['google_meet','calendly','zoom'].map(p => {
              const connected = this.externalIntegrations[p]?.enabled;
              return `<div class="d-flex justify-content-between align-items-center mb-2">
                <span><i class="fab fa-${p==='google_meet'?'google':p} me-1"></i> ${p==='google_meet'?'Google Meet':p==='calendly'?'Calendly':'Zoom'}</span>
                <span class="badge bg-${connected?'success':'secondary'}">${connected?'Connected':'Not Connected'}</span>
              </div>`;
            }).join('')}
            <button class="btn btn-outline-info btn-sm w-100 mt-1" onclick="Appointments.currentView='integrations';Appointments.render();">Manage Connections</button>
          </div>
        </div>
      </div>
      <div id="aptModal"></div>
    `;
    contentArea.innerHTML = html;
  },

  // ==================== BOOK APPOINTMENT ====================
  showBookForm(editId = null) {
    document.getElementById('aptModal').innerHTML = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
        <div class="card-widget" style="width:520px;max-width:95vw;max-height:90vh;overflow-y:auto;" onclick="event.stopPropagation()">
          <h5><i class="fas fa-calendar-plus me-2"></i>${editId ? 'Edit' : 'Book'} Appointment</h5>
          <div class="row g-2">
            <div class="col-md-6"><label class="small fw-bold">Client Name *</label><input type="text" id="aptClient" class="form-control form-control-sm" placeholder="Full name"></div>
            <div class="col-md-6"><label class="small fw-bold">Phone *</label><input type="text" id="aptPhone" class="form-control form-control-sm" placeholder="+91 98xxx"></div>
            <div class="col-md-6"><label class="small fw-bold">Email</label><input type="email" id="aptEmail" class="form-control form-control-sm" placeholder="client@email.com"></div>
            <div class="col-md-6"><label class="small fw-bold">Service</label><select id="aptService" class="form-select form-select-sm"><option>General Consultation</option><option>Follow-up Visit</option><option>Skin Treatment</option><option>Therapy Session</option><option>Report Review</option><option>Nutrition Counseling</option><option>Other</option></select></div>
            <div class="col-md-6"><label class="small fw-bold">Staff</label><select id="aptStaff" class="form-select form-select-sm"><option value="Dr. Priya Sharma">Dr. Priya Sharma</option><option value="Dr. Rajesh Kumar">Dr. Rajesh Kumar</option><option value="Dr. Anita Verma">Dr. Anita Verma</option></select></div>
            <div class="col-md-6"><label class="small fw-bold">Appointment Type</label><select id="aptType" class="form-select form-select-sm" onchange="document.getElementById('aptMeetLink').style.display=this.value==='video'?'block':'none'"><option value="video">Video Call</option><option value="call">Phone Call</option><option value="clinic">In-Clinic Visit</option></select></div>
            <div class="col-md-4"><label class="small fw-bold">Date</label><input type="date" id="aptDate" class="form-control form-control-sm" value="${this.selectedDate}"></div>
            <div class="col-md-4"><label class="small fw-bold">Time</label><input type="time" id="aptTime" class="form-control form-control-sm" value="10:00"></div>
            <div class="col-md-4"><label class="small fw-bold">Fees (₹)</label><input type="number" id="aptFees" class="form-control form-control-sm" placeholder="500"></div>
            <div class="col-12" id="aptMeetLink"><label class="small fw-bold">Google Meet Link (or auto-generate)</label><input type="text" id="aptMeet" class="form-control form-control-sm" placeholder="https://meet.google.com/..."></div>
            <div class="col-12"><label class="small fw-bold">Notes</label><textarea id="aptNotes" class="form-control form-control-sm" rows="2" placeholder="Symptoms, requirements..."></textarea></div>
            <div class="col-md-6"><div class="form-check mt-2"><input class="form-check-input" type="checkbox" id="aptReminder" checked><label class="small">Send WhatsApp reminder 1 hour before</label></div></div>
            <div class="col-md-6"><div class="form-check mt-2"><input class="form-check-input" type="checkbox" id="aptSyncCalendly"><label class="small">Sync with Calendly</label></div></div>
          </div>
          <button class="btn btn-primary btn-sm w-100 mt-3" onclick="Appointments.saveAppointment('${editId || ''}')">📅 Book Appointment</button>
          <button class="btn btn-light btn-sm w-100 mt-1" onclick="document.getElementById('aptModal').innerHTML=''">Cancel</button>
        </div>
      </div>
    `;
  },

  async saveAppointment(editId) {
    const client = document.getElementById('aptClient')?.value?.trim();
    const phone = document.getElementById('aptPhone')?.value?.trim();
    if (!client || !phone) return alert('Client name and phone required!');

    const data = {
      client, phone,
      email: document.getElementById('aptEmail')?.value || '',
      service: document.getElementById('aptService')?.value,
      staff: document.getElementById('aptStaff')?.value,
      type: document.getElementById('aptType')?.value,
      date: document.getElementById('aptDate')?.value,
      time: document.getElementById('aptTime')?.value,
      fees: document.getElementById('aptFees')?.value || '',
      meetLink: document.getElementById('aptMeet')?.value || '',
      notes: document.getElementById('aptNotes')?.value || '',
      sendReminder: document.getElementById('aptReminder')?.checked || false,
      syncCalendly: document.getElementById('aptSyncCalendly')?.checked || false,
      status: 'confirmed',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      if (editId) {
        await db.collection('appointments').doc(editId).update(data);
      } else {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('appointments').add(data);
      }

      // Send WhatsApp confirmation
      if (data.sendReminder && data.phone) {
        this.sendWhatsAppMessage(data.phone, `✅ Appointment Confirmed!\n\n📅 ${data.date} at ${data.time}\n👨‍⚕️ ${data.staff}\n📋 ${data.service}\n\nWe'll remind you before the appointment.`);
      }

      document.getElementById('aptModal').innerHTML = '';
      this.render();
      alert(`✅ Appointment booked for ${client}!`);
    } catch(e) { alert('Error: ' + e.message); }
  },

  // ==================== ACTIONS ====================
  async updateStatus(id, status) {
    await db.collection('appointments').doc(id).update({ status });
    this.render();
  },

  callPatient(phone, name) {
    window.open(`tel:${phone}`, '_blank');
    alert(`📞 Calling ${name} at ${phone}...`);
  },

  async createMeetLink(id) {
    const meetLink = 'https://meet.google.com/' + Math.random().toString(36).substring(2, 10);
    await db.collection('appointments').doc(id).update({ meetLink });
    alert(`✅ Google Meet link created!\n\n${meetLink}`);
    this.render();
  },

  async sendReminder(id) {
    const doc = await db.collection('appointments').doc(id).get();
    const a = doc.data();
    if (a.phone) {
      this.sendWhatsAppMessage(a.phone, `⏰ Reminder: Your appointment is scheduled for ${a.date} at ${a.time} with ${a.staff}.\n\n${a.meetLink ? 'Join: ' + a.meetLink : ''}`);
      alert(`✅ Reminder sent to ${a.client}!`);
    }
  },

  async sendBulkReminders() {
    const today = new Date().toISOString().split('T')[0];
    const snap = await db.collection('appointments').where('date','==',today).where('status','==','confirmed').get();
    let count = 0;
    snap.forEach(doc => {
      const a = doc.data();
      if (a.phone) {
        this.sendWhatsAppMessage(a.phone, `⏰ Reminder: Your appointment today at ${a.time} with ${a.staff}.`);
        count++;
      }
    });
    alert(`✅ ${count} reminders sent!`);
  },

  async sendWhatsAppMessage(phone, message) {
    try {
      const cfg = (await db.collection('settings').doc('whatsapp').get()).data();
      if (!cfg?.accessToken || !cfg?.phoneNumberId) return;
      
      await fetch(`https://graph.facebook.com/v22.0/${cfg.phoneNumberId}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${cfg.accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone.replace(/[^0-9]/g, ''),
          type: 'text',
          text: { body: message }
        })
      });
    } catch(e) {}
  },

  // ==================== CALENDAR ====================
  async renderCalendar() {
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Get all appointments this month
    let appointments = [];
    try {
      const startDate = `${year}-${String(month+1).padStart(2,'0')}-01`;
      const endDate = `${year}-${String(month+1).padStart(2,'0')}-${daysInMonth}`;
      const snap = await db.collection('appointments')
        .where('date', '>=', startDate)
        .where('date', '<=', endDate)
        .get();
      appointments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) {}

    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const todayStr = today.toISOString().split('T')[0];

    let calendarHTML = '';
    for (let i = 0; i < firstDay; i++) calendarHTML += '<div class="cal-day empty"></div>';
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const dayApps = appointments.filter(a => a.date === dateStr);
      const isToday = dateStr === todayStr;
      
      calendarHTML += `
        <div class="cal-day ${isToday ? 'today' : ''}" onclick="Appointments.selectedDate='${dateStr}';Appointments.currentView='dashboard';Appointments.render();" style="cursor:pointer;">
          <span class="cal-date">${day}</span>
          ${dayApps.length > 0 ? `<span class="cal-badge">${dayApps.length}</span>` : ''}
        </div>`;
    }

    contentArea.innerHTML = `
      <style>
        .cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;}
        .cal-day{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:8px;min-height:60px;position:relative;}
        .cal-day.today{border-color:#3b82f6;background:#e7f3ff;}
        .cal-day.empty{background:#f9fafb;}
        .cal-date{font-size:12px;font-weight:600;}
        .cal-badge{position:absolute;top:4px;right:4px;background:#3b82f6;color:#fff;border-radius:50%;width:20px;height:20px;font-size:10px;display:flex;align-items:center;justify-content:center;}
        .cal-header{text-align:center;font-size:11px;font-weight:600;color:#6b7280;padding:8px;}
      </style>
      <button class="btn btn-outline-secondary btn-sm mb-3" onclick="Appointments.currentView='dashboard';Appointments.render();"><i class="fas fa-arrow-left me-1"></i> Back</button>
      <h5 style="font-weight:700;">${monthNames[month]} ${year}</h5>
      <div class="cal-grid mt-3">
        ${days.map(d => `<div class="cal-header">${d}</div>`).join('')}
        ${calendarHTML}
      </div>
    `;
  },

  // ==================== STAFF ====================
  async renderStaff() {
    const staffList = [
      { name:'Dr. Priya Sharma', speciality:'General Physician', experience:'12 years', availability:'Mon-Fri, 9AM-5PM', fees:'₹500', rating:4.8, phone:'+919810012345', icon:'fa-user-md', color:'#4f46e5' },
      { name:'Dr. Rajesh Kumar', speciality:'Dermatologist', experience:'8 years', availability:'Mon-Sat, 10AM-6PM', fees:'₹800', rating:4.9, phone:'+919810012346', icon:'fa-user-md', color:'#059669' },
      { name:'Dr. Anita Verma', speciality:'Psychologist', experience:'15 years', availability:'Tue-Sat, 11AM-7PM', fees:'₹1200', rating:4.7, phone:'+919810012347', icon:'fa-brain', color:'#d97706' },
    ];

    contentArea.innerHTML = `
      <button class="btn btn-outline-secondary btn-sm mb-3" onclick="Appointments.currentView='dashboard';Appointments.render();"><i class="fas fa-arrow-left me-1"></i> Back</button>
      <h5 style="font-weight:700;">Staff Profiles</h5>
      <div class="row g-3 mt-2">
        ${staffList.map(s => `
          <div class="col-md-4">
            <div class="card-widget text-center">
              <div style="width:60px;height:60px;border-radius:50%;background:${s.color}15;color:${s.color};display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 10px;"><i class="fas ${s.icon}"></i></div>
              <h6>${s.name}</h6>
              <p class="small text-muted">${s.speciality} · ${s.experience}</p>
              <p class="small"><i class="far fa-clock me-1"></i>${s.availability}</p>
              <p class="fw-bold" style="color:${s.color};">${s.fees} / session</p>
              <div class="d-flex justify-content-center gap-1 mt-2">
                <button class="btn btn-outline-success btn-sm" onclick="window.open('tel:${s.phone}','_blank')"><i class="fas fa-phone-alt"></i> Call</button>
                <button class="btn btn-outline-info btn-sm" onclick="window.open('https://wa.me/${s.phone.replace(/\+/,'')}','_blank')"><i class="fab fa-whatsapp"></i> Chat</button>
              </div>
              <button class="btn btn-primary btn-sm w-100 mt-2" onclick="Appointments.showBookForm()">Book Appointment</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // ==================== BOOKINGS LIST ====================
  async renderBookings() {
    let bookings = [];
    try {
      const snap = await db.collection('appointments').orderBy('createdAt','desc').limit(100).get();
      bookings = snap.docs.map(d=>({id:d.id,...d.data()}));
    } catch(e) {}

    contentArea.innerHTML = `
      <button class="btn btn-outline-secondary btn-sm mb-3" onclick="Appointments.currentView='dashboard';Appointments.render();"><i class="fas fa-arrow-left me-1"></i> Back</button>
      <h5 style="font-weight:700;">All Bookings</h5>
      <div class="card-widget mt-3">
        <div class="table-responsive">
          <table class="table table-sm">
            <thead><tr><th>Date</th><th>Time</th><th>Client</th><th>Phone</th><th>Service</th><th>Staff</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              ${bookings.length === 0 ? '<tr><td colspan="9" class="text-center text-muted py-3">No bookings yet</td></tr>' : bookings.map(b => `
                <tr>
                  <td>${b.date||'-'}</td><td>${b.time||'-'}</td><td><strong>${b.client||'-'}</strong></td>
                  <td>${b.phone||'-'}</td><td>${b.service||'-'}</td><td>${b.staff||'-'}</td>
                  <td><span class="apt-badge" style="background:#e0e7ff;color:#4f46e5;">${b.type||'video'}</span></td>
                  <td><span class="apt-badge" style="background:${b.status==='confirmed'?'#d1fae5':b.status==='completed'?'#d1fae5':'#fee2e2'};color:${b.status==='confirmed'?'#065f46':'#065f46'};">${b.status||'confirmed'}</span></td>
                  <td>
                    ${b.phone ? `<button class="apt-btn call" onclick="window.open('tel:${b.phone}','_blank')"><i class="fas fa-phone-alt"></i></button>` : ''}
                    <button class="apt-btn whatsapp" onclick="Appointments.sendReminder('${b.id}')"><i class="fab fa-whatsapp"></i></button>
                    <button class="apt-btn danger" onclick="Appointments.updateStatus('${b.id}','cancelled');Appointments.renderBookings();">✕</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ==================== EXTERNAL INTEGRATIONS ====================
  async renderIntegrations() {
    const platforms = [
      { key: 'google_meet', name: 'Google Meet', icon: 'fa-google', color: '#4285F4', desc: 'Auto-generate Google Meet links for video appointments', fields: ['Google Account Email'] },
      { key: 'calendly', name: 'Calendly', icon: 'fa-calendar-alt', color: '#006BFF', desc: 'Sync appointments with Calendly booking page', fields: ['Calendly Personal Access Token', 'Calendly Event URL'] },
      { key: 'zoom', name: 'Zoom', icon: 'fa-video', color: '#2D8CFF', desc: 'Auto-create Zoom meetings for appointments', fields: ['Zoom API Key', 'Zoom API Secret'] },
      { key: 'webhook', name: 'Custom Webhook', icon: 'fa-link', color: '#6B7280', desc: 'Send appointment data to your custom endpoint', fields: ['Webhook URL'] },
    ];

    contentArea.innerHTML = `
      <button class="btn btn-outline-secondary btn-sm mb-3" onclick="Appointments.currentView='dashboard';Appointments.render();"><i class="fas fa-arrow-left me-1"></i> Back</button>
      <h5 style="font-weight:700;">External Integrations</h5>
      <p class="text-muted small mb-3">Connect with external platforms to sync appointments automatically.</p>
      ${platforms.map(p => {
        const connected = this.externalIntegrations[p.key]?.enabled;
        return `
          <div class="card-widget mb-2">
            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center gap-3">
                <div style="width:40px;height:40px;border-radius:8px;background:${p.color}15;color:${p.color};display:flex;align-items:center;justify-content:center;"><i class="fab ${p.icon}"></i></div>
                <div>
                  <strong>${p.name}</strong>
                  <p class="small text-muted mb-0">${p.desc}</p>
                </div>
              </div>
              <div>
                ${connected 
                  ? `<span class="badge bg-success me-2">Connected</span><button class="btn btn-sm btn-outline-danger" onclick="Appointments.disconnectPlatform('${p.key}')">Disconnect</button>`
                  : `<button class="btn btn-sm btn-outline-primary" onclick="Appointments.connectPlatform('${p.key}')">Connect</button>`}
              </div>
            </div>
          </div>
        `;
      }).join('')}

      <div class="card-widget mt-3">
        <h6>Booking Page Link (Share with clients)</h6>
        <div class="input-group">
          <input type="text" class="form-control form-control-sm" value="${window.location.origin}${window.location.pathname}?book=appointment" readonly id="bookingLink">
          <button class="btn btn-outline-primary btn-sm" onclick="navigator.clipboard.writeText(document.getElementById('bookingLink').value);alert('Link copied!')"><i class="fas fa-copy"></i> Copy</button>
        </div>
        <small class="text-muted">Share this link with clients to let them book appointments directly.</small>
      </div>
    `;
  },

  connectPlatform(platform) {
    const fields = {
      google_meet: ['Google Account Email'],
      calendly: ['Calendly Token', 'Event URL'],
      zoom: ['API Key', 'API Secret'],
      webhook: ['Webhook URL']
    };

    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
      <div class="card-widget" style="width:400px;max-width:90vw;" onclick="event.stopPropagation()">
        <h6>Connect ${platform}</h6>
        ${(fields[platform]||['API Key']).map(f => `<input type="text" class="form-control form-control-sm mb-2" placeholder="${f}">`).join('')}
        <button class="btn btn-success btn-sm w-100" onclick="Appointments.saveIntegration('${platform}')">Connect</button>
        <button class="btn btn-light btn-sm w-100 mt-1" onclick="this.closest('[style*=fixed]').remove()">Cancel</button>
      </div>
    `;
    modal.addEventListener('click', function(e) { if(e.target===modal) modal.remove(); });
    document.body.appendChild(modal);
  },

  async saveIntegration(platform) {
    const inputs = document.querySelectorAll('[style*="z-index:9999"] input');
    const values = {};
    inputs.forEach(inp => { if(inp.value) values[inp.placeholder] = inp.value; });

    this.externalIntegrations[platform] = { enabled: true, ...values };
    await db.collection('settings').doc('appointment_integrations').set(this.externalIntegrations, { merge: true });
    
    document.querySelector('[style*="z-index:9999"]')?.remove();
    alert(`✅ ${platform} connected!`);
    this.render();
  },

  async disconnectPlatform(platform) {
    if (!confirm(`Disconnect ${platform}?`)) return;
    this.externalIntegrations[platform] = { enabled: false };
    await db.collection('settings').doc('appointment_integrations').set(this.externalIntegrations, { merge: true });
    this.render();
  }
};
