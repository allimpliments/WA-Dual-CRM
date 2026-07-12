// js/knowledge/guides/forms.js — Form Builder Guide
const FormsGuide = {
  guideId: 'forms',

  async render(context) {
    const { guide, userProgress = 0, isBookmarked = false, getAdjacentGuide } = context;
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = '#f8fafc';
    if (userProgress === 0) { try { await this.markInProgress(); } catch (e) {} }
    const isCompleted = userProgress >= 100;
    const prevGuide = getAdjacentGuide ? getAdjacentGuide('prev') : null;
    const nextGuide = getAdjacentGuide ? getAdjacentGuide('next') : null;

    let html = `
      <style>
        .gd-wrap { max-width: 1100px; margin: 0 auto; padding: 0 16px; }
        .gd-back-row { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
        .gd-back-btn { padding: 9px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid #e2e8f0; background: #fff; color: #475569; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .gd-back-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }
        .gd-breadcrumb { font-size: 12px; color: #94a3b8; display: flex; align-items: center; gap: 6px; }
        .gd-breadcrumb span { cursor: pointer; transition: color 0.2s; } .gd-breadcrumb span:hover { color: #a855f7; }
        .gd-hero { background: #fff; border-radius: 20px; padding: 36px 32px; margin-bottom: 24px; border: 1px solid #f1f5f9; position: relative; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #a855f7, #9333ea, #a855f7); }
        .gd-hero-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #fff; margin-bottom: 16px; background: linear-gradient(135deg, #a855f7, #9333ea); }
        .gd-hero h3 { font-weight: 900; font-size: 28px; margin: 0 0 10px; color: #0f172a; line-height: 1.3; }
        .gd-hero p { color: #64748b; font-size: 15px; margin: 0; max-width: 700px; line-height: 1.7; }
        .gd-hero-meta { display: flex; gap: 18px; margin-top: 18px; flex-wrap: wrap; align-items: center; }
        .gd-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; } .gd-meta-item i { color: #a855f7; font-size: 14px; }
        .gd-hero-actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
        .gd-btn { padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .gd-btn-primary { background: #a855f7; color: #fff; } .gd-btn-primary:hover { background: #9333ea; transform: scale(1.03); }
        .gd-btn-outline { background: #fff; color: #a855f7; border: 1px solid #a855f7; } .gd-btn-outline:hover { background: #faf5ff; }
        .gd-btn-success { background: #10b981; color: #fff; } .gd-btn-success:hover { background: #059669; transform: scale(1.03); }
        .gd-btn-completed { background: #d1d5db; color: #fff; cursor: default; } .gd-btn-completed:hover { transform: none; }
        .gd-content-card { background: #fff; border-radius: 20px; padding: 32px; margin-bottom: 20px; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-content-card h4 { font-weight: 800; font-size: 20px; margin: 0 0 8px; color: #0f172a; }
        .gd-content-card .gd-subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
        .gd-overview { background: #faf5ff; border-radius: 14px; padding: 20px 24px; margin-bottom: 28px; border-left: 4px solid #a855f7; }
        .gd-overview p { margin: 0; font-size: 14px; color: #581c87; line-height: 1.8; }
        .gd-section-title { font-weight: 800; font-size: 18px; color: #0f172a; margin: 28px 0 16px; display: flex; align-items: center; gap: 8px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9; }
        .gd-step { display: flex; gap: 16px; padding: 20px 0; border-bottom: 1px solid #f1f5f9; align-items: flex-start; }
        .gd-step:last-child { border-bottom: none; }
        .gd-step-num { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #a855f7, #9333ea); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 17px; flex-shrink: 0; }
        .gd-step-content { flex: 1; } .gd-step-content h6 { font-weight: 700; font-size: 15px; margin: 0 0 4px; color: #0f172a; }
        .gd-step-content p { font-size: 14px; color: #475569; margin: 0; line-height: 1.7; }
        .gd-field-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 14px 0; }
        .gd-field-card { background: #f8fafc; border-radius: 10px; padding: 12px 14px; border: 1px solid #e2e8f0; text-align: center; }
        .gd-field-card i { font-size: 18px; color: #a855f7; margin-bottom: 4px; } .gd-field-card h6 { font-weight: 700; font-size: 11px; margin: 0; }
        .gd-tips-card { background: linear-gradient(135deg, #fef3c7, #fffbeb); border-radius: 16px; padding: 22px 26px; margin-top: 24px; border: 1px solid #fcd34d; }
        .gd-tips-card h5 { font-weight: 800; color: #92400e; margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
        .gd-tips-card ul { margin: 0; padding-left: 20px; } .gd-tips-card li { font-size: 13px; color: #a16207; margin-bottom: 6px; line-height: 1.6; } .gd-tips-card li:last-child { margin-bottom: 0; }
        .gd-related { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
        .gd-related-pill { padding: 9px 18px; border-radius: 20px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 13px; cursor: pointer; transition: 0.2s; color: #475569; display: inline-flex; align-items: center; gap: 6px; }
        .gd-related-pill:hover { background: #faf5ff; border-color: #a855f7; color: #a855f7; }
        .gd-upsell { background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 18px; padding: 28px 32px; margin-top: 28px; border: 1px solid #c7d2fe; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .gd-upsell h5 { font-weight: 800; color: #3730a3; margin: 0; font-size: 18px; } .gd-upsell p { color: #4f46e5; margin: 4px 0 0; font-size: 14px; }
        .gd-nav-btns { display: flex; justify-content: space-between; margin-top: 32px; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 768px) { .gd-hero { padding: 24px 18px; } .gd-hero h3 { font-size: 22px; } .gd-content-card { padding: 20px 16px; } .gd-step { flex-direction: column; gap: 10px; } .gd-field-grid { grid-template-columns: 1fr 1fr; } .gd-upsell { flex-direction: column; text-align: center; } .gd-nav-btns { flex-direction: column; align-items: stretch; } }
      </style>

      <div class="gd-wrap">
        <div class="gd-back-row">
          <button class="gd-back-btn" onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();"><i class="fas fa-arrow-left"></i> Back to All Guides</button>
          <div class="gd-breadcrumb"><span onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();">📖 Platform Documentation</span><i class="fas fa-chevron-right" style="font-size:10px;"></i><span style="color:#a855f7;font-weight:600;">Form Builder</span></div>
        </div>

        <div class="gd-hero">
          <div class="gd-hero-icon"><i class="fas fa-wpforms"></i></div>
          <h3>Form Builder — Create High-Converting Lead Forms</h3>
          <p>Build beautiful lead capture forms with drag-and-drop simplicity. Embed on your website, share as a link, or use as pop-ups — no coding required. Every submission flows directly into your CRM.</p>
          <div class="gd-hero-meta">
            <div class="gd-meta-item"><i class="fas fa-signal"></i> 🟢 Beginner</div>
            <div class="gd-meta-item"><i class="fas fa-clock"></i> 7 min read</div>
            <div class="gd-meta-item"><i class="fas fa-layer-group"></i> 5 Steps</div>
            <div class="gd-meta-item"><i class="fas fa-globe"></i> Updated: Jul 2026</div>
          </div>
          <div class="gd-hero-actions">
            ${isCompleted ? `<button class="gd-btn gd-btn-completed"><i class="fas fa-check-circle"></i> Completed ✓</button>` : `<button class="gd-btn gd-btn-success" onclick="FormsGuide.triggerComplete()"><i class="fas fa-check"></i> Mark as Complete</button>`}
            <button class="gd-btn gd-btn-outline" onclick="PlatformDocs.toggleBookmark('forms');PlatformDocs.currentGuide='forms';PlatformDocs.render();"><i class="fas ${isBookmarked ? 'fa-star' : 'fa-star'}"></i> ${isBookmarked ? 'Bookmarked' : 'Bookmark'}</button>
            <button class="gd-btn gd-btn-outline" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
          </div>
        </div>

        <div class="gd-content-card">
          <h4>📝 Turn Visitors into Leads — Automatically</h4>
          <p class="gd-subtitle">Forms are your 24/7 lead capture machines. Build them in minutes and watch leads flow into your CRM.</p>
          <div class="gd-overview"><p>Forms are your primary lead capture tool. Whether embedded on your website, shared as a link on social media, or triggered as a pop-up — every submission creates a new lead in your CRM automatically. <strong>No manual data entry. No missed leads. No coding needed.</strong> Build professional forms in minutes with the drag-and-drop builder.</p></div>

          <div class="gd-section-title"><i class="fas fa-th-list" style="color:#a855f7;"></i> Available Field Types</div>
          <div class="gd-field-grid">
            <div class="gd-field-card"><i class="fas fa-font"></i><h6>Text Input</h6></div>
            <div class="gd-field-card"><i class="fas fa-envelope"></i><h6>Email</h6></div>
            <div class="gd-field-card"><i class="fas fa-phone"></i><h6>Phone Number</h6></div>
            <div class="gd-field-card"><i class="fas fa-list"></i><h6>Dropdown</h6></div>
            <div class="gd-field-card"><i class="fas fa-check-square"></i><h6>Checkboxes</h6></div>
            <div class="gd-field-card"><i class="fas fa-dot-circle"></i><h6>Radio Buttons</h6></div>
            <div class="gd-field-card"><i class="fas fa-file-upload"></i><h6>File Upload</h6></div>
            <div class="gd-field-card"><i class="fas fa-calendar"></i><h6>Date Picker</h6></div>
            <div class="gd-field-card"><i class="fas fa-star"></i><h6>Rating</h6></div>
            <div class="gd-field-card"><i class="fas fa-credit-card"></i><h6>Payment</h6></div>
            <div class="gd-field-card"><i class="fas fa-signature"></i><h6>Signature</h6></div>
            <div class="gd-field-card"><i class="fas fa-heading"></i><h6>Section Header</h6></div>
          </div>

          <div class="gd-section-title"><i class="fas fa-list-ol" style="color:#a855f7;"></i> Form Building Steps</div>
          
          <div class="gd-step"><div class="gd-step-num">1</div><div class="gd-step-content"><h6>Drag & Drop Builder</h6><p>Access the builder from <strong>Forms → Create New</strong>. You'll see a visual canvas with a sidebar of field types. Simply <strong>drag fields</strong> onto the canvas — reorder by dragging up/down. Each field has settings: label, placeholder text, required/optional toggle, and help text. Preview your form on <strong>desktop and mobile simultaneously</strong> with the split preview mode. Start from scratch or choose from 15+ pre-built templates (Contact Us, Lead Capture, Event Registration, Feedback Survey, Job Application, etc.).</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">2</div><div class="gd-step-content"><h6>Design & Branding</h6><p>Customize your form's appearance to match your brand: <strong>Colors</strong> (background, text, button, accent — use brand colors from your Company Profile), <strong>Fonts</strong> (choose from 20+ Google Fonts), <strong>Button style</strong> (rounded, square, pill), <strong>Logo upload</strong> (appears at the top of the form), <strong>Background</strong> (solid color, gradient, or custom image). Add a <strong>progress bar</strong> for multi-step forms. Changes preview in real-time.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">3</div><div class="gd-step-content"><h6>Form Settings & Behavior</h6><p>Configure what happens after submission: <strong>Thank You message</strong> (customizable with HTML), <strong>Redirect URL</strong> (send to a specific page after submission), <strong>Email notifications</strong> (send to lead: "Thank you for your inquiry!" / send to you: "New lead received!"), <strong>Spam protection</strong> (enable reCAPTCHA v3 — invisible to users), <strong>Submission limits</strong> (max submissions per day), <strong>Conditional logic</strong> (show/hide fields based on previous answers — e.g., "If Country = India, show State dropdown").</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">4</div><div class="gd-step-content"><h6>Publish & Embed Options</h6><p>Multiple ways to deploy your form: <strong>Embed code</strong> (copy-paste HTML/JavaScript snippet into your website — form renders inline), <strong>Direct link</strong> (shareable URL — perfect for social media bios, WhatsApp, email signatures), <strong>Popup trigger</strong> (appears as popup on your site — triggers: on page load, on scroll %, on exit intent, after time delay), <strong>Landing page</strong> (standalone hosted page with your branding — no website needed!), <strong>QR code</strong> (auto-generated — print on flyers, banners, business cards).</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">5</div><div class="gd-step-content"><h6>Lead Mapping & Automation</h6><p>Map form fields to CRM contact fields: e.g., "Full Name" → Contact Name, "Email" → Email, "Phone" → Phone. <strong>Auto-tag submissions:</strong> all "Website Form" leads get #WebLead tag, "Event Registration" gets #Event2026 tag. <strong>Auto-assign to agent</strong> (round-robin or specific agent). <strong>Trigger a flow</strong> on submission: send welcome WhatsApp message, add to nurture sequence, create follow-up task. Every submission appears in your Leads section instantly with source = form name.</p></div></div>

          <div class="gd-tips-card">
            <h5><i class="fas fa-lightbulb" style="color:#f59e0b;"></i> Pro Tips</h5>
            <ul>
              <li><strong>Keep forms short:</strong> 3-4 fields get 40% more conversions than 7+ fields. Only ask for what you absolutely need.</li>
              <li><strong>Use conditional logic</strong> to create a personalized experience — show relevant questions based on previous answers.</li>
              <li><strong>A/B test your CTA button text</strong> — "Get Free Quote" often outperforms "Submit" by 25%+.</li>
              <li><strong>Always enable reCAPTCHA</strong> — prevents spam submissions that waste your agents' time.</li>
              <li><strong>Add the form link to your WhatsApp auto-reply</strong> — "Fill this quick form and we'll get back to you: [link]"</li>
            </ul>
          </div>

          <h5 style="font-weight:700;margin-top:28px;color:#0f172a;">🔗 Related Guides</h5>
          <div class="gd-related">
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('leads')">🎯 Managing Leads</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('integrations')">🔌 Integrations Hub</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('templates-flows')">🔄 Templates & Flows</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('analytics')">📈 Analytics & Reports</span>
          </div>
        </div>

        <div class="gd-upsell"><div><h5>📝 Unlimited Forms & Advanced Fields</h5><p>Free plan: 3 forms. Pro: Unlimited forms, conditional logic, file uploads, payment collection, and custom branding.</p></div><button class="gd-btn gd-btn-primary" onclick="Plan.render()"><i class="fas fa-crown"></i> Build Unlimited Forms</button></div>

        <div class="gd-nav-btns">
          <div>${prevGuide ? `<button class="gd-btn gd-btn-outline" onclick="PlatformDocs.openGuide('${prevGuide.id}')"><i class="fas fa-arrow-left"></i> Previous: ${prevGuide.title}</button>` : ''}</div>
          <div>${nextGuide ? `<button class="gd-btn gd-btn-primary" onclick="PlatformDocs.openGuide('${nextGuide.id}')">Next: ${nextGuide.title} <i class="fas fa-arrow-right"></i></button>` : ''}</div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
    contentArea.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  triggerComplete() {
    PlatformDocs.markComplete('forms');
    PlatformDocs.currentGuide = 'forms';
    PlatformDocs.render();
    if (typeof showToast === 'function') showToast('✅ Guide completed!', 'success');
  },

  async markInProgress() {
    try {
      if (!window.currentUser?.uid) return;
      const docRef = db.collection('user_progress').doc(window.currentUser.uid);
      const doc = await docRef.get();
      let pg = {};
      if (doc.exists && doc.data().platformGuides) pg = doc.data().platformGuides;
      if (!pg['forms'] || pg['forms'] < 10) {
        pg['forms'] = 10;
        await docRef.set({ platformGuides: pg, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    } catch (e) { console.error('Progress error:', e); }
  }
};
window.FormsGuide = FormsGuide;