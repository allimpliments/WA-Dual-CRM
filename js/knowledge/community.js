// js/knowledge/community.js — Expert Community Module
function(Knowledge, contentArea, db, firebase) {
  contentArea.innerHTML = `
    <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Hub</button>
    <h5 style="font-weight:700;">Expert Community</h5>
    <p class="text-muted small mb-3">Connect with peers, learn from experts, and share your transformation journey.</p>
    <div class="row g-3">
      <div class="col-md-4">
        <div class="card-widget text-center py-4">
          <div style="width:48px;height:48px;border-radius:12px;background:#e0e7ff;color:#4f46e5;display:flex;align-items:center;justify-content:center;font-size:20px;margin:0 auto 12px;"><i class="fas fa-comments"></i></div>
          <h6 style="font-weight:600;">Q&A Forum</h6>
          <p style="font-size:12px;color:#6b7280;">Ask questions, share knowledge, and get answers from industry experts and peers.</p>
          <button class="btn btn-outline-primary btn-sm" onclick="Knowledge.showEmailPopup()">Join Discussion</button>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card-widget text-center py-4">
          <div style="width:48px;height:48px;border-radius:12px;background:#d1fae5;color:#059669;display:flex;align-items:center;justify-content:center;font-size:20px;margin:0 auto 12px;"><i class="fas fa-video"></i></div>
          <h6 style="font-weight:600;">Live Webinars</h6>
          <p style="font-size:12px;color:#6b7280;">Weekly sessions on WhatsApp strategy, case study breakdowns, and expert AMAs.</p>
          <button class="btn btn-outline-primary btn-sm" onclick="Knowledge.showEmailPopup()">Register Next</button>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card-widget text-center py-4">
          <div style="width:48px;height:48px;border-radius:12px;background:#fef3c7;color:#d97706;display:flex;align-items:center;justify-content:center;font-size:20px;margin:0 auto 12px;"><i class="fas fa-trophy"></i></div>
          <h6 style="font-weight:600;">Transformation Stories</h6>
          <p style="font-size:12px;color:#6b7280;">Real businesses, real metrics. See how companies transformed with WhatsApp.</p>
          <button class="btn btn-outline-primary btn-sm" onclick="Knowledge.showEmailPopup()">Read Stories</button>
        </div>
      </div>
    </div>
  `;
} 
