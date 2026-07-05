// js/appointments.js — Professional Appointment System
const Appointments = {
  currentView: 'dashboard',
  selectedDate: new Date().toISOString().split('T')[0],

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = 'var(--bg-primary, #f0f2f5)';

    if (this.currentView === 'calendar') { await this.renderCalendar(); return; }
    if (this.currentView === 'staff') { await this.renderStaff(); return; }
    if (this.currentView === 'bookings') { await this.renderBookings(); return; }
    await this.renderDashboard();
  },

  // ==================== DASHBOARD ====================
  async renderDashboard() {
    let appointments = [], staffList = [], stats = { total: 0, confirmed: 0, completed: 0, revenue: 0 };

    try {
      const today = new Date().toISOString().split('T')[0];
      const [aSnap, sSnap] = await Promise.all([
        db.collection('appointments').where('date','==',today).orderBy('time').get(),
        db.collection('staff').get()
      ]);
      appointments = aSnap.docs.map(d=>({id:d.id,...d.data()}));
      staffList = sSnap.docs.map(d=>({id:d.id,...d.data()}));
      stats.total = appointments.length;
      stats.confirmed = appointments.filter(a=>a.status==='confirmed').length;
      stats.completed = appointments.filter(a=>a.status==='completed').length;
      appointments.forEach(a=>{stats.revenue+=parseInt(a.fees||0);});
    } catch(e){}

    let html = `
      <style>
        .apt-wrap{max-width:1400px;}
        .apt-stat{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;display:flex;align-items:center;gap:12px;}
        .apt-icon{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
        .apt-val{font-size:22px;font-weight:800;line-height:1.1;}
        .apt-lbl{font-size:10px;color:#6b7280;text-transform:uppercase;}
        .apt-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:18px;margin-bottom:14px;}
        .apt-timeline{position:relative;padding-left:20px;}
        .apt-timeline::before{content:'';position:absolute;left:6px;top:0;bottom:0;width:2px;background:#e5e7eb;}
        .apt-item{position:relative;margin-bottom:12px;padding:12px 12px 12px 20px;background:#f9fafb;border-radius:8px;border-left:3px solid #3b82f6;}
        .apt-item.confirmed{border-left-color:#3b82f6;}
        .apt-item.completed{border-left-color:#059669;opacity:0.8;}
        .apt-item.cancelled{border-left-color:#ef4444;opacity:0.6;text-decoration:line-through;}
        .apt-item.waiting{border-left-color:#d97706;}
        .apt-badge{padding:3px 8px;border-radius:6px;font-size:10px;font-weight:500;}
        .apt-btn{padding:5px 10px;border-radius:6px;font-size:10px;cursor:pointer;border:1px solid #e5e7eb;background:#fff;margin:2px;transition:0.2s;white-space:nowrap;display:inline-flex;align-items:center;gap:4px;}
        .apt-btn:hover{background:#3b82f6;color:#fff;border-color:#3b82f6;}
        .apt-btn.success{color:#059669;}.apt-btn.success:hover{background:#059669;border-color:#059669;}
        .apt-btn.danger{color:#ef4444;}.apt-btn.danger:hover{background:#ef4444;border-color:#ef4444;}
        .apt-btn.warning{color:#d97706;}.apt-btn.warning:hover{background:#d97706;border-color:#d97706;}
        .apt-video-box{background:#000;border-radius:8px;padding:12px;color:#fff;text-align:center;margin-top:6px;cursor:pointer;}
        .apt-video-box:hover{background:#1a1a2e;}
      </style>
      <div class="apt-wrap">
        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap">
          <div><h4 style="font-weight:700;"><i class="fas fa-calendar-check text-primary me-2"></i>Appointments</h4><small class="text-muted">${new Date().toDateString()}</small></div>
          <div class="d-flex gap-1 mt-2 mt-md-0">
            <button class="btn btn-outline-primary btn-sm" onclick="Appointments.currentView='calendar';Appointments.render();"><i class="fas fa-calendar-alt"></i> Calendar</button>
            <button class="btn btn-outline-primary btn-sm" onclick="Appointments.currentView='staff';Appointments.render();"><i class="fas fa-user-md"></i> Staff</button>
            <button class="btn btn-outline-primary btn-sm" onclick="Appointments.currentView='bookings';Appointments.render();"><i class="fas fa-list"></i> All Bookings</button>
            <button class="btn btn-primary btn-sm" onclick="Appointments.showBookForm()"><i class="fas fa-plus"></i> Book</button>
          </div>
        </div>

        <div class="row g-3 mb-4">
          <div class="col-6 col-md-3"><div class="apt-stat"><div class="apt-icon" style="background:#e0e7ff;color:#4f46e5;"><i class="fas fa-calendar-check"></i></div><div><div class="apt-val">${stats.total}</div><div class="apt-lbl">Today</div></div></div></div>
          <div class="col-6 col-md-3"><div class="apt-stat"><div class="apt-icon" style="background:#d1fae5;color:#059669;"><i class="fas fa-check-circle"></i></div><div><div class="apt-val">${stats.confirmed}</div><div class="apt-lbl">Confirmed</div></div></div></div>
          <div class="col-6 col-md-3"><div class="apt-stat"><div class="apt-icon" style="background:#d1fae5;color:#059669;"><i class="fas fa-check-double"></i></div><div><div class="apt-val">${stats.completed}</div><div class="apt-lbl">Completed</div></div></div></div>
          <div class="col-6 col-md-3"><div class="apt-stat"><div class="apt-icon" style="background:#fef3c7;color:#d97706;"><i class="fas fa-rupee-sign"></i></div><div><div class="apt-val">₹${stats.revenue.toLocaleString()}</div><div class="apt-lbl">Revenue</div></div></div></div>
        </div>

        <div class="row g-3">
          <div class="col-lg-8">
            <div class="apt-card"><h6 style="font-weight:600;">Today's Schedule</h6>
              ${appointments.length===0?'<p class="text-muted text-center py-3 small">No appointments today</p>':appointments.map(a=>`
                <div class="apt-item ${a.status}">
                  <div class="d-flex justify-content-between align-items-start flex-wrap">
                    <div><strong>${a.time||'--:--'}</strong> — ${a.client||'N/A'} <span class="apt-badge ms-1" style="background:#e0e7ff;color:#4f46e5;">${a.type||'video'}</span></div>
                    <span class="apt-badge" style="background:${a.status==='confirmed'?'#d1fae5':a.status==='completed'?'#d1fae5':a.status==='cancelled'?'#fee2e2':'#fef3c7'};color:${a.status==='confirmed'?'#065f46':a.status==='completed'?'#065f46':a.status==='cancelled'?'#991b1b':'#92400e'};">${a.status}</span>
                  </div>
                  <div class="small text-muted">${a.service||''} · ${a.staff||''} · ₹${a.fees||0}</div>
                  ${a.type==='video' && a.meetLink ? `<div class="apt-video-box" onclick="window.open('${a.meetLink}','_blank')"><i class="fas fa-video me-2"></i>Join Video Call — Click Here</div>` : ''}
                  <div class="d-flex flex-wrap gap-1 mt-2">
                    ${a.phone?`<button class="apt-btn success" onclick="window.open('tel:${a.phone}','_blank')"><i class="fas fa-phone-alt"></i> Call</button>`:''}
                    ${!a.meetLink?`<button class="apt-btn" onclick="Appointments.createMeet('${a.id}')"><i class="fas fa-video"></i> Create Meet</button>`:''}
                    <button class="apt-btn warning" onclick="Appointments.sendReminder('${a.id}')"><i class="fab fa-whatsapp"></i> Remind</button>
                    <button class="apt-btn" onclick="Appointments.editBooking('${a.id}')"><i class="fas fa-edit"></i></button>
                    <button class="apt-btn success" onclick="Appointments.updateStatus('${a.id}','completed')">✓ Done</button>
                    <button class="apt-btn danger" onclick="Appointments.updateStatus('${a.id}','cancelled')">✕ Cancel</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="col-lg-4">
            <div class="apt-card"><h6 style="font-weight:600;">Quick Actions</h6>
              <button class="btn btn-outline-primary btn-sm w-100 mb-2" onclick="Appointments.showBookForm()">📅 New Appointment</button>
              <button class="btn btn-outline-success btn-sm w-100 mb-2" onclick="Appointments.sendAllReminders()">📢 Send All Reminders</button>
              <button class="btn btn-outline-info btn-sm w-100" onclick="Appointments.currentView='staff';Appointments.render();">👨‍⚕️ Manage Staff</button>
            </div>
            <div class="apt-card"><h6 style="font-weight:600;">Staff on Duty</h6>
              ${staffList.length===0?'<p class="text-muted small">No staff added</p>':staffList.slice(0,5).map(s=>`
                <div class="d-flex align-items-center gap-2 mb-2"><div style="width:32px;height:32px;border-radius:50%;background:${(s.color||'#3b82f6')}15;color:${s.color||'#3b82f6'};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;">${(s.name||'?')[0]}</div><div><strong class="small">${s.name}</strong><br><small class="text-muted">${s.speciality||''}</small></div></div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
      <div id="aptModal"></div>
    `;
    contentArea.innerHTML = html;
  },

  // ==================== BOOK / EDIT FORM ====================
  showBookForm(editId = null) {
    const loadStaff = async () => {
      let staffList = [];
      try { const s = await db.collection('staff').get(); staffList = s.docs.map(d=>({id:d.id,...d.data()})); } catch(e){}
      let data = {};
      if (editId) { const d = await db.collection('appointments').doc(editId).get(); if(d.exists) data = d.data(); }

      document.getElementById('aptModal').innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
          <div class="card-widget" style="width:520px;max-width:95vw;max-height:90vh;overflow-y:auto;" onclick="event.stopPropagation()">
            <h5><i class="fas fa-calendar-plus me-2"></i>${editId?'Edit':'Book'} Appointment</h5>
            <div class="row g-2">
              <div class="col-md-6"><label class="small fw-bold">Client *</label><input id="aptClient" class="form-control form-control-sm" value="${data.client||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Phone *</label><input id="aptPhone" class="form-control form-control-sm" value="${data.phone||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Email</label><input id="aptEmail" class="form-control form-control-sm" value="${data.email||''}"></div>
              <div class="col-md-6"><label class="small fw-bold">Service</label><select id="aptService" class="form-select form-select-sm"><option>Consultation</option><option>Follow-up</option><option>Treatment</option><option>Therapy</option><option>Review</option></select></div>
              <div class="col-md-6"><label class="small fw-bold">Staff</label><select id="aptStaff" class="form-select form-select-sm">${staffList.map(s=>`<option value="${s.name}">${s.name}</option>`).join('')}</select></div>
              <div class="col-md-6"><label class="small fw-bold">Type</label><select id="aptType" class="form-select form-select-sm"><option value="video">Video Call</option><option value="call">Phone Call</option><option value="clinic">In-Clinic</option></select></div>
              <div class="col-4"><label class="small fw-bold">Date</label><input type="date" id="aptDate" class="form-control form-control-sm" value="${data.date||this.selectedDate}"></div>
              <div class="col-4"><label class="small fw-bold">Time</label><input type="time" id="aptTime" class="form-control form-control-sm" value="${data.time||'10:00'}"></div>
              <div class="col-4"><label class="small fw-bold">Fees ₹</label><input type="number" id="aptFees" class="form-control form-control-sm" value="${data.fees||''}"></div>
              <div class="col-12"><label class="small fw-bold">Meet Link</label><input id="aptMeet" class="form-control form-control-sm" value="${data.meetLink||''}" placeholder="https://meet.google.com/..."></div>
              <div class="col-12"><label class="small fw-bold">Notes</label><textarea id="aptNotes" class="form-control form-control-sm" rows="2">${data.notes||''}</textarea></div>
              <div class="col-6"><div class="form-check mt-2"><input class="form-check-input" type="checkbox" id="aptReminder" checked><label class="small">Send WhatsApp reminder</label></div></div>
            </div>
            <button class="btn btn-primary btn-sm w-100 mt-3" onclick="Appointments.saveBooking('${editId||''}')">${editId?'Update':'Book'} Appointment</button>
            <button class="btn btn-light btn-sm w-100 mt-1" onclick="document.getElementById('aptModal').innerHTML=''">Cancel</button>
          </div>
        </div>`;
    };
    loadStaff();
  },

  async saveBooking(editId) {
    const client = document.getElementById('aptClient')?.value?.trim();
    const phone = document.getElementById('aptPhone')?.value?.trim();
    if (!client || !phone) return alert('Client name and phone required!');
    const data = {
      client, phone,
      email: document.getElementById('aptEmail')?.value||'',
      service: document.getElementById('aptService')?.value,
      staff: document.getElementById('aptStaff')?.value,
      type: document.getElementById('aptType')?.value,
      date: document.getElementById('aptDate')?.value,
      time: document.getElementById('aptTime')?.value,
      fees: document.getElementById('aptFees')?.value||'',
      meetLink: document.getElementById('aptMeet')?.value||'',
      notes: document.getElementById('aptNotes')?.value||'',
      status: 'confirmed',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    try {
      if (editId) { await db.collection('appointments').doc(editId).update(data); }
      else { data.createdAt = firebase.firestore.FieldValue.serverTimestamp(); await db.collection('appointments').add(data); }
      document.getElementById('aptModal').innerHTML = '';
      if (document.getElementById('aptReminder')?.checked && data.phone) {
        this.sendWhatsApp(data.phone, `✅ Appointment: ${data.date} at ${data.time}\n👨‍⚕️ ${data.staff}\n📋 ${data.service}`);
      }
      this.render();
      alert(`✅ ${editId?'Updated':'Booked'}!`);
    } catch(e) { alert('Error: '+e.message); }
  },

  editBooking(id) { this.showBookForm(id); },

  // ==================== ACTIONS ====================
  async updateStatus(id, status) { await db.collection('appointments').doc(id).update({status}); this.render(); },
  async createMeet(id) { const link = 'https://meet.google.com/'+Math.random().toString(36).substring(2,10); await db.collection('appointments').doc(id).update({meetLink:link}); this.render(); },
  
  async sendReminder(id) {
    const d = await db.collection('appointments').doc(id).get();
    const a = d.data();
    if (a.phone) { this.sendWhatsApp(a.phone, `⏰ Reminder: ${a.date} at ${a.time}\n👨‍⚕️ ${a.staff}\n${a.meetLink?'Join: '+a.meetLink:''}`); alert('✅ Sent!'); }
  },

  async sendAllReminders() {
    const today = new Date().toISOString().split('T')[0];
    const snap = await db.collection('appointments').where('date','==',today).where('status','==','confirmed').get();
    snap.forEach(d=>{const a=d.data();if(a.phone)this.sendWhatsApp(a.phone,`⏰ Reminder: Today at ${a.time} with ${a.staff}`);});
    alert(`✅ ${snap.size} reminders sent!`);
  },

  async sendWhatsApp(phone, msg) {
    try {
      const cfg = (await db.collection('settings').doc('whatsapp').get()).data();
      if(!cfg?.accessToken) return;
      await fetch(`https://graph.facebook.com/v22.0/${cfg.phoneNumberId}/messages`,{method:'POST',headers:{'Authorization':'Bearer '+cfg.accessToken,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to:phone.replace(/[^0-9]/g,''),type:'text',text:{body:msg}})});
    } catch(e){}
  },

  // ==================== STAFF MANAGEMENT ====================
  async renderStaff() {
    let staffList = [];
    try { const s = await db.collection('staff').get(); staffList = s.docs.map(d=>({id:d.id,...d.data()})); } catch(e){}
    contentArea.innerHTML = `
      <style>.st-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:18px;text-align:center;transition:0.2s;}.st-card:hover{border-color:#3b82f6;}</style>
      <button class="btn btn-outline-secondary btn-sm mb-3" onclick="Appointments.currentView='dashboard';Appointments.render();"><i class="fas fa-arrow-left me-1"></i> Back</button>
      <div class="d-flex justify-content-between mb-3"><h5 style="font-weight:700;">Staff Management</h5><button class="btn btn-primary btn-sm" onclick="Appointments.showStaffForm()"><i class="fas fa-plus me-1"></i> Add Staff</button></div>
      <div class="row g-3" id="staffGrid">
        ${staffList.length===0?'<div class="col-12 text-center py-4 text-muted">No staff members</div>':staffList.map(s=>`
          <div class="col-md-4"><div class="st-card">
            <div style="width:56px;height:56px;border-radius:50%;background:${(s.color||'#3b82f6')}15;color:${s.color||'#3b82f6'};display:flex;align-items:center;justify-content:center;font-size:22px;margin:0 auto 10px;">${(s.name||'?')[0]}</div>
            <h6>${s.name||'N/A'}</h6><p class="small text-muted">${s.speciality||''} · ${s.experience||''}</p>
            <p class="small"><i class="far fa-clock me-1"></i>${s.availability||'N/A'}</p>
            <p class="fw-bold" style="color:${s.color||'#3b82f6'};">₹${s.fees||'N/A'}/session</p>
            <div class="d-flex justify-content-center gap-1 mt-2">
              <button class="btn btn-sm btn-outline-info" onclick="Appointments.showStaffForm('${s.id}')"><i class="fas fa-edit"></i></button>
              <button class="btn btn-sm btn-outline-danger" onclick="Appointments.deleteStaff('${s.id}')"><i class="fas fa-trash"></i></button>
            </div>
          </div></div>
        `).join('')}
      </div>
      <div id="staffModal"></div>`;
  },

  showStaffForm(editId = null) {
    const load = async () => {
      let data = {};
      if (editId) { const d = await db.collection('staff').doc(editId).get(); if(d.exists) data = d.data(); }
      document.getElementById('staffModal').innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
          <div class="card-widget" style="width:420px;max-width:90vw;" onclick="event.stopPropagation()">
            <h5>${editId?'Edit':'Add'} Staff</h5>
            <div class="row g-2">
              <div class="col-md-6"><input id="stName" class="form-control form-control-sm" placeholder="Name *" value="${data.name||''}"></div>
              <div class="col-md-6"><input id="stSpeciality" class="form-control form-control-sm" placeholder="Speciality" value="${data.speciality||''}"></div>
              <div class="col-md-6"><input id="stExperience" class="form-control form-control-sm" placeholder="Experience" value="${data.experience||''}"></div>
              <div class="col-md-6"><input id="stFees" class="form-control form-control-sm" placeholder="Fees (₹)" value="${data.fees||''}"></div>
              <div class="col-md-6"><input id="stPhone" class="form-control form-control-sm" placeholder="Phone" value="${data.phone||''}"></div>
              <div class="col-md-6"><input id="stColor" class="form-control form-control-sm" placeholder="Color (#hex)" value="${data.color||'#3b82f6'}"></div>
              <div class="col-12"><input id="stAvailability" class="form-control form-control-sm" placeholder="Availability (e.g. Mon-Fri, 9AM-5PM)" value="${data.availability||''}"></div>
            </div>
            <button class="btn btn-primary btn-sm w-100 mt-2" onclick="Appointments.saveStaff('${editId||''}')">Save</button>
            <button class="btn btn-light btn-sm w-100 mt-1" onclick="document.getElementById('staffModal').innerHTML=''">Cancel</button>
          </div></div>`;
    };
    load();
  },

  async saveStaff(editId) {
    const name = document.getElementById('stName')?.value?.trim();
    if (!name) return alert('Name required!');
    const data = {
      name, speciality: document.getElementById('stSpeciality')?.value||'',
      experience: document.getElementById('stExperience')?.value||'',
      fees: document.getElementById('stFees')?.value||'',
      phone: document.getElementById('stPhone')?.value||'',
      color: document.getElementById('stColor')?.value||'#3b82f6',
      availability: document.getElementById('stAvailability')?.value||''
    };
    try {
      if (editId) { await db.collection('staff').doc(editId).update(data); }
      else { await db.collection('staff').add(data); }
      document.getElementById('staffModal').innerHTML = '';
      this.renderStaff();
    } catch(e) { alert('Error: '+e.message); }
  },

  async deleteStaff(id) { if(confirm('Delete?')) { await db.collection('staff').doc(id).delete(); this.renderStaff(); } },

  // ==================== CALENDAR & BOOKINGS ====================
  async renderCalendar() {
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const today = new Date();
    const year = today.getFullYear(), month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    let calendarHTML = '';
    for (let i=0;i<firstDay;i++) calendarHTML += '<div class="cal-day empty"></div>';
    for (let d=1;d<=daysInMonth;d++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const isToday = dateStr===today.toISOString().split('T')[0];
      calendarHTML += `<div class="cal-day ${isToday?'today':''}" onclick="Appointments.selectedDate='${dateStr}';Appointments.currentView='dashboard';Appointments.render();"><span class="cal-date">${d}</span></div>`;
    }
    contentArea.innerHTML = `
      <style>.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;}.cal-day{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:10px;min-height:50px;cursor:pointer;}.cal-day.today{border-color:#3b82f6;background:#e7f3ff;}.cal-day.empty{background:#f9fafb;}.cal-date{font-size:13px;font-weight:600;}.cal-header{text-align:center;font-size:11px;font-weight:600;color:#6b7280;padding:8px;}</style>
      <button class="btn btn-outline-secondary btn-sm mb-3" onclick="Appointments.currentView='dashboard';Appointments.render();"><i class="fas fa-arrow-left me-1"></i> Back</button>
      <h5 style="font-weight:700;">${monthNames[month]} ${year}</h5>
      <div class="cal-grid mt-3">${days.map(d=>`<div class="cal-header">${d}</div>`).join('')}${calendarHTML}</div>`;
  },

  async renderBookings() {
    let bookings = [];
    try { const s = await db.collection('appointments').orderBy('createdAt','desc').limit(100).get(); bookings = s.docs.map(d=>({id:d.id,...d.data()})); } catch(e){}
    contentArea.innerHTML = `
      <button class="btn btn-outline-secondary btn-sm mb-3" onclick="Appointments.currentView='dashboard';Appointments.render();"><i class="fas fa-arrow-left me-1"></i> Back</button>
      <h5 style="font-weight:700;">All Bookings</h5>
      <div class="card-widget mt-3"><div class="table-responsive"><table class="table table-sm"><thead><tr><th>Date</th><th>Time</th><th>Client</th><th>Phone</th><th>Service</th><th>Staff</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        ${bookings.length===0?'<tr><td colspan="8" class="text-center text-muted">No bookings</td></tr>':bookings.map(b=>`
          <tr><td>${b.date||'-'}</td><td>${b.time||'-'}</td><td><strong>${b.client||'-'}</strong></td><td>${b.phone||'-'}</td><td>${b.service||'-'}</td><td>${b.staff||'-'}</td>
          <td><span class="apt-badge" style="background:${b.status==='confirmed'?'#d1fae5':'#f3f4f6'};color:#065f46;">${b.status}</span></td>
          <td>
            <button class="apt-btn" onclick="Appointments.editBooking('${b.id}')"><i class="fas fa-edit"></i></button>
            <button class="apt-btn danger" onclick="Appointments.updateStatus('${b.id}','cancelled');Appointments.renderBookings();"><i class="fas fa-trash"></i></button>
          </td></tr>
        `).join('')}
      </tbody></table></div></div>`;
  }
};
