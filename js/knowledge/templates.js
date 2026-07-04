(function(Knowledge, contentArea, db, firebase) {
  contentArea.innerHTML = `
    <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Hub</button>
    <h5 style="font-weight:700;">Expert Webinars</h5>
    <p class="text-muted small mb-3">Live sessions and recorded content from industry practitioners.</p>
    <h6 class="mb-2"><i class="fas fa-calendar-alt text-primary me-1"></i>Upcoming</h6>
    <div class="row g-3 mb-4">
      <div class="col-md-6"><div class="ke-module-card" onclick="Knowledge.showEmailPopup()"><div class="d-flex gap-3"><div style="width:40px;height:40px;border-radius:8px;background:#4f46e515;color:#4f46e5;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fas fa-video"></i></div><div><h6 style="font-weight:600;">WhatsApp Marketing Masterclass 2026</h6><small class="text-muted">July 15 · 4:00 PM · 90 min</small><br><span class="badge bg-success mt-1">Limited Seats</span></div></div></div></div>
      <div class="col-md-6"><div class="ke-module-card" onclick="Knowledge.showEmailPopup()"><div class="d-flex gap-3"><div style="width:40px;height:40px;border-radius:8px;background:#05966915;color:#059669;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fas fa-laptop-code"></i></div><div><h6 style="font-weight:600;">Lead Generation Workshop</h6><small class="text-muted">July 22 · 3:00 PM · 60 min</small><br><span class="badge bg-info mt-1">Open</span></div></div></div></div>
    </div>
    <h6 class="mb-2"><i class="fas fa-play text-success me-1"></i>Recorded</h6>
    ${[{t:'Getting Started with WhatsApp API',v:'1.2K',d:'45 min'},{t:'Advanced Chatbot Design',v:'890',d:'55 min'},{t:'Campaign Analytics Deep Dive',v:'650',d:'40 min'},{t:'Customer Retention Workshop',v:'720',d:'50 min'}].map(r => `
      <div class="ke-module-card mb-2" onclick="Knowledge.showEmailPopup()" style="display:flex;align-items:center;gap:12px;padding:12px;"><i class="fas fa-play-circle text-muted"></i><div class="flex-grow-1"><strong style="font-size:13px;">${r.t}</strong><br><small class="text-muted">${r.d} · ${r.v} views</small></div><i class="fas fa-chevron-right text-muted"></i></div>
    `).join('')}
    <style>.ke-module-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;cursor:pointer;transition:0.25s;}.ke-module-card:hover{border-color:#3b82f6;box-shadow:0 8px 20px rgba(0,0,0,0.05);}</style>
  `;
}) 
