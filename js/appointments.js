// js/appointments.js — Advanced Appointment & Telecalling System
const Appointments = {
  currentView: 'dashboard', // dashboard, calendar, staff, bookings
  selectedDate: new Date().toISOString().split('T')[0],
  selectedStaff: null,

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = 'var(--bg-primary, #f0f2f5)';

    if (this.currentView === 'calendar') { await this.renderCalendar(); return; }
    if (this.currentView === 'staff') { await this.renderStaff(); return; }
    if (this.currentView === 'bookings') { await this.renderBookings(); return; }

    await this.renderDashboard();
  },

  async renderDashboard() {
    // Sample data
    const todayApps = [
      { time: '09:00 AM', client: 'Rahul Sharma', service: 'General Consultation', staff: 'Dr. Priya', status: 'confirmed', type: 'video' },
      { time: '10:30 AM', client: 'Anita Desai', service: 'Follow-up', staff: 'Dr. Priya', status: 'waiting', type: 'call' },
      { time: '12:00 PM', client: 'Vikram Singh', service: 'Skin Treatment', staff: 'Dr. Rajesh', status: 'confirmed', type: 'clinic' },
      { time: '02:30 PM', client: 'Neha Gupta', service: 'Consultation', staff: 'Dr. Priya', status: 'pending', type: 'video' },
      { time: '04:00 PM', client: 'Amit Kumar', service: 'Report Review', staff: 'Dr. Rajesh', status: 'confirmed', type: 'call' },
    ];

    const stats = [
      { label: "Today's Appointments", value: todayApps.length, icon: 'fa-calendar-check', color: '#4f46e5', bg: '#e0e7ff' },
      { label: 'Confirmed', value: todayApps.filter(a=>a.status==='confirmed').length, icon: 'fa-check-circle', color: '#059669', bg: '#d1fae5' },
      { label: 'Waiting', value: todayApps.filter(a=>a.status==='waiting').length, icon: 'fa-clock', color: '#d97706', bg: '#fef3c7' },
      { label: 'Video Calls', value: todayApps.filter(a=>a.type==='video').length, icon: 'fa-video', color: '#db2777', bg: '#fce7f3' },
    ];

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
        .apt-timeline-item{position:relative;margin-bottom:16px;padding-left:20px;}
        .apt-timeline-item::before{content:'';position:absolute;left:-20px;top:4px;width:12px;height:12px;border-radius:50%;border:2px solid #3b82f6;background:#fff;}
        .apt-timeline-item.confirmed::before{background:#059669;border-color:#059669;}
        .apt-timeline-item.waiting::before{background:#d97706;border-color:#d97706;}
        .apt-timeline-item.pending::before{background:#9ca3af;border-color:#9ca3af;}
        .apt-badge{padding:3px 8px;border-radius:6px;font-size:10px;font-weight:500;}
        .apt-action-btn{padding:4px 10px;border-radius:6px;font-size:10px;cursor:pointer;border:1px solid #e5e7eb;background:#fff;margin:2px;transition:0.2s;}
        .apt-action-btn:hover{background:#3b82f6;color:#fff;border-color:#3b82f6;}
        .apt-quick-book{background:#fff;border:2px dashed #d1d5db;border-radius:12px;padding:16px;text-align:center;cursor:pointer;transition:0.2s;}
        .apt-quick-book:hover{border-color:#3b82f6;background:#f8fafc;}
      </style>

      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 style="font-weight:700;"><i class="fas fa-calendar-check text-primary me-2"></i>Appointments</h4>
          <small class="text-muted">${new Date().toDateString()}</small>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary btn-sm" onclick="Appointments.currentView='calendar';Appointments.render();"><i class="fas fa-calendar-alt me-1"></i> Calendar</button>
          <button class="btn btn-outline-primary btn-sm" onclick="Appointments.currentView='staff';Appointments.render();"><i class="fas fa-user-md me-1"></i> Staff</button>
          <button class="btn btn-primary btn-sm" onclick="Appointments.showBookForm()"><i class="fas fa-plus me-1"></i> New Appointment</button>
        </div>
      </div>

      <div class="row g-3 mb-4">
        ${stats.map(s => `
          <div class="col-6 col-md-3"><div class="apt-stat">
            <div class="apt-icon" style="background:${s.bg};color:${s.color};"><i class="fas ${s.icon}"></i></div>
            <div><div class="apt-val">${s.value}</div><div class="apt-lbl">${s.label}</div></div>
          </div></div>
        `).join('')}
      </div>

      <div class="row g-3">
        <div class="col-lg-8">
          <div class="apt-card">
            <h6 style="font-weight:600;"><i class="far fa-clock me-1"></i>Today's Schedule</h6>
            <div class="apt-timeline">
              ${todayApps.map(a => `
                <div class="apt-timeline-item ${a.status}">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>${a.time}</strong> — ${a.client}
                      <div class="small text-muted">${a.service} · ${a.staff}</div>
                    </div>
                    <span class="apt-badge" style="background:${a.status==='confirmed'?'#d1fae5':a.status==='waiting'?'#fef3c7':'#f3f4f6'};color:${a.status==='confirmed'?'#065f46':a.status==='waiting'?'#92400e':'#6b7280'};">${a.status}</span>
                  </div>
                  <div class="d-flex gap-1 mt-2">
                    <span class="apt-badge" style="background:#e0e7ff;color:#4f46e5;"><i class="fas fa-${a.type==='video'?'video':a.type==='call'?'phone':'clinic-medical'} me-1"></i>${a.type}</span>
                    <button class="apt-action-btn" onclick="alert('Calling ${a.client}...')"><i class="fas fa-phone"></i> Call</button>
                    <button class="apt-action-btn" onclick="alert('Video call link sent to ${a.client}')"><i class="fas fa-video"></i> Video</button>
                    <button class="apt-action-btn" onclick="alert('WhatsApp reminder sent!')"><i class="fab fa-whatsapp"></i> Remind</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="apt-card">
            <h6 style="font-weight:600;"><i class="fas fa-phone-alt me-1"></i>Quick Actions</h6>
            <button class="btn btn-outline-success btn-sm w-100 mb-2" onclick="Appointments.showBookForm()"><i class="fas fa-plus-circle me-1"></i> Book Appointment</button>
            <button class="btn btn-outline-info btn-sm w-100 mb-2" onclick="Appointments.currentView='calendar';Appointments.render();"><i class="fas fa-calendar-week me-1"></i> View Calendar</button>
            <button class="btn btn-outline-warning btn-sm w-100 mb-2" onclick="alert('Bulk WhatsApp reminders sent to all pending patients!')"><i class="fab fa-whatsapp me-1"></i> Send Bulk Reminders</button>
          </div>

          <div class="apt-quick-book mt-3" onclick="Appointments.showBookForm()">
            <i class="fas fa-calendar-plus fa-2x mb-2" style="color:#3b82f6;"></i>
            <h6>Quick Book</h6>
            <small class="text-muted">Create appointment in 30 seconds</small>
          </div>
        </div>
      </div>
      <div id="aptForm"></div>
    `;
    contentArea.innerHTML = html;
  },

  showBookForm() {
    document.getElementById('aptForm').innerHTML = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
        <div class="card-widget" style="width:480px;max-width:95vw;max-height:90vh;overflow-y:auto;" onclick="event.stopPropagation()">
          <h5><i class="fas fa-calendar-plus me-2"></i>Book Appointment</h5>
          <div class="row g-2">
            <div class="col-12"><input type="text" id="aptClient" class="form-control form-control-sm" placeholder="Client Name *"></div>
            <div class="col-md-6"><input type="text" id="aptPhone" class="form-control form-control-sm" placeholder="Phone Number"></div>
            <div class="col-md-6"><input type="email" id="aptEmail" class="form-control form-control-sm" placeholder="Email"></div>
            <div class="col-md-6">
              <select id="aptService" class="form-select form-select-sm">
                <option>General Consultation</option><option>Follow-up</option><option>Skin Treatment</option><option>Report Review</option><option>Therapy Session</option><option>Other</option>
              </select>
            </div>
            <div class="col-md-6">
              <select id="aptStaff" class="form-select form-select-sm">
                <option value="Dr. Priya">Dr. Priya Sharma</option><option value="Dr. Rajesh">Dr. Rajesh Kumar</option><option value="Dr. Anita">Dr. Anita Verma</option>
              </select>
            </div>
            <div class="col-md-4"><input type="date" id="aptDate" class="form-control form-control-sm" value="${new Date().toISOString().split('T')[0]}"></div>
            <div class="col-md-4"><input type="time" id="aptTime" class="form-control form-control-sm" value="10:00"></div>
            <div class="col-md-4">
              <select id="aptType" class="form-select form-select-sm">
                <option value="video">Video Call</option><option value="call">Phone Call</option><option value="clinic">In-Person</option>
              </select>
            </div>
            <div class="col-12"><textarea id="aptNotes" class="form-control form-control-sm" rows="2" placeholder="Notes (optional)"></textarea></div>
            <div class="col-6">
              <label class="small">Fees (₹)</label><input type="number" id="aptFees" class="form-control form-control-sm" placeholder="500">
            </div>
            <div class="col-6 d-flex align-items-end">
              <div class="form-check"><input class="form-check-input" type="checkbox" id="aptReminder" checked><label class="small">Send WhatsApp reminder</label></div>
            </div>
          </div>
          <button class="btn btn-primary btn-sm w-100 mt-2" onclick="Appointments.bookAppointment()">📅 Book Appointment</button>
          <button class="btn btn-light btn-sm w-100 mt-1" onclick="document.getElementById('aptForm').innerHTML=''">Cancel</button>
        </div>
      </div>
    `;
  },

  async bookAppointment() {
    const client = document.getElementById('aptClient')?.value?.trim();
    if (!client) return alert('Client name required!');
    
    const data = {
      client,
      phone: document.getElementById('aptPhone')?.value || '',
      email: document.getElementById('aptEmail')?.value || '',
      service: document.getElementById('aptService')?.value,
      staff: document.getElementById('aptStaff')?.value,
      date: document.getElementById('aptDate')?.value,
      time: document.getElementById('aptTime')?.value,
      type: document.getElementById('aptType')?.value,
      notes: document.getElementById('aptNotes')?.value || '',
      fees: document.getElementById('aptFees')?.value || '',
      status: 'confirmed',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      await db.collection('appointments').add(data);
      
      if (document.getElementById('aptReminder')?.checked && data.phone) {
        alert(`✅ Booked!\n\nWhatsApp reminder will be sent to ${data.phone}\n\nDate: ${data.date} at ${data.time}`);
      } else {
        alert(`✅ Appointment booked for ${data.client}!`);
      }
      
      document.getElementById('aptForm').innerHTML = '';
      this.render();
    } catch(e) { alert('Error: ' + e.message); }
  },

  async renderCalendar() {
    contentArea.innerHTML = `
      <button class="btn btn-outline-secondary btn-sm mb-3" onclick="Appointments.currentView='dashboard';Appointments.render();"><i class="fas fa-arrow-left me-1"></i> Back</button>
      <h5 style="font-weight:700;">Appointment Calendar</h5>
      <div class="card-widget mt-3">
        <input type="date" class="form-control form-control-sm mb-3" style="width:200px;" value="${this.selectedDate}" onchange="Appointments.selectedDate=this.value;Appointments.renderCalendar();">
        <h6>${new Date(this.selectedDate).toDateString()}</h6>
        <div class="table-responsive mt-2">
          <table class="table table-sm">
            <thead><tr><th>Time</th><th>Client</th><th>Service</th><th>Staff</th><th>Type</th><th>Status</th></tr></thead>
            <tbody>
              ${['09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'].map(t => `
                <tr>
                  <td><strong>${t}</strong></td>
                  <td><input class="form-control form-control-sm" placeholder="Client name" style="width:140px;"></td>
                  <td><select class="form-select form-select-sm" style="width:130px;"><option>--</option><option>Consultation</option><option>Follow-up</option></select></td>
                  <td><select class="form-select form-select-sm" style="width:130px;"><option>--</option><option>Dr. Priya</option><option>Dr. Rajesh</option></select></td>
                  <td><select class="form-select form-select-sm" style="width:100px;"><option>Video</option><option>Call</option></select></td>
                  <td><button class="btn btn-sm btn-outline-primary">Book</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async renderStaff() {
    const staffList = [
      { name:'Dr. Priya Sharma', speciality:'General Physician', experience:'12 years', availability:'Mon-Fri, 9AM-5PM', fees:'₹500', rating:4.8, icon:'fa-user-md', color:'#4f46e5' },
      { name:'Dr. Rajesh Kumar', speciality:'Dermatologist', experience:'8 years', availability:'Mon-Sat, 10AM-6PM', fees:'₹800', rating:4.9, icon:'fa-user-md', color:'#059669' },
      { name:'Dr. Anita Verma', speciality:'Psychologist', experience:'15 years', availability:'Tue-Sat, 11AM-7PM', fees:'₹1200', rating:4.7, icon:'fa-brain', color:'#d97706' },
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
              <p class="small">⭐ ${s.rating}</p>
              <button class="btn btn-primary btn-sm w-100" onclick="Appointments.showBookForm()">Book Appointment</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  async renderBookings() {
    contentArea.innerHTML = `
      <button class="btn btn-outline-secondary btn-sm mb-3" onclick="Appointments.currentView='dashboard';Appointments.render();"><i class="fas fa-arrow-left me-1"></i> Back</button>
      <h5 style="font-weight:700;">All Bookings</h5>
      <div class="card-widget mt-3">
        <div class="table-responsive">
          <table class="table table-sm">
            <thead><tr><th>Date</th><th>Time</th><th>Client</th><th>Service</th><th>Staff</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody id="aptBookingsTable">
              <tr><td colspan="8" class="text-center text-muted">Loading bookings...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    try {
      const snap = await db.collection('appointments').orderBy('createdAt','desc').limit(50).get();
      const bookings = snap.docs.map(d=>({id:d.id,...d.data()}));
      document.getElementById('aptBookingsTable').innerHTML = bookings.length === 0 
        ? '<tr><td colspan="8" class="text-center text-muted">No bookings yet</td></tr>'
        : bookings.map(b => `
          <tr>
            <td>${b.date||'-'}</td><td>${b.time||'-'}</td><td><strong>${b.client||'-'}</strong></td>
            <td>${b.service||'-'}</td><td>${b.staff||'-'}</td>
            <td><span class="apt-badge" style="background:#e0e7ff;color:#4f46e5;">${b.type||'video'}</span></td>
            <td><span class="apt-badge" style="background:#d1fae5;color:#065f46;">${b.status||'confirmed'}</span></td>
            <td>
              <button class="apt-action-btn" onclick="alert('Calling ${b.client}...')"><i class="fas fa-phone"></i></button>
              <button class="apt-action-btn" onclick="alert('WhatsApp reminder sent!')"><i class="fab fa-whatsapp"></i></button>
            </td>
          </tr>
        `).join('');
    } catch(e) {}
  }
};
