// js/knowledge/guides/getting-started.js — Getting Started Guide (Featured ⭐)
const GettingStartedGuide = {
  guideId: 'getting-started',
  
  // ==================== RENDER: MAIN ENTRY POINT ====================
  async render(context) {
    const { 
      guide, 
      userProgress = 0, 
      isBookmarked = false, 
      onBack, 
      onComplete, 
      onBookmark, 
      onNavigate, 
      getAdjacentGuide, 
      allGuides 
    } = context;

    contentArea.style.paddingTop = '60px';
    contentArea.style.background = '#f8fafc';

    // Mark as in-progress if first time viewing
    if (userProgress === 0) {
      try {
        await this.markInProgress();
        if (typeof onComplete === 'function') {
          // Don't mark complete, just track that they started
        }
      } catch (e) {
        console.error('Progress update error:', e);
      }
    }

    const isCompleted = userProgress >= 100;
    const prevGuide = getAdjacentGuide ? getAdjacentGuide('prev') : null;
    const nextGuide = getAdjacentGuide ? getAdjacentGuide('next') : null;

    let html = `
      <style>
        .gs-wrap { max-width: 1100px; margin: 0 auto; padding: 0 16px; }
        
        /* Back Navigation */
        .gs-back-row { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          margin-bottom: 24px; 
          flex-wrap: wrap;
        }
        .gs-back-btn { 
          padding: 9px 18px; 
          border-radius: 10px; 
          font-size: 13px; 
          font-weight: 600; 
          cursor: pointer; 
          border: 1px solid #e2e8f0; 
          background: #fff; 
          color: #475569; 
          transition: all 0.2s; 
          display: inline-flex; 
          align-items: center; 
          gap: 6px; 
        }
        .gs-back-btn:hover { 
          background: #f1f5f9; 
          border-color: #cbd5e1; 
        }
        .gs-breadcrumb {
          font-size: 12px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .gs-breadcrumb span {
          cursor: pointer;
          transition: color 0.2s;
        }
        .gs-breadcrumb span:hover {
          color: #6366f1;
        }
        
        /* Hero Card */
        .gs-hero { 
          background: #fff; 
          border-radius: 20px; 
          padding: 36px 32px; 
          margin-bottom: 24px; 
          border: 1px solid #f1f5f9; 
          position: relative; 
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .gs-hero::before { 
          content: ''; 
          position: absolute; 
          top: 0; 
          left: 0; 
          right: 0; 
          height: 5px; 
          background: linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1); 
        }
        .gs-hero-badge {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          background: #fef3c7;
          color: #92400e;
          margin-bottom: 14px;
          letter-spacing: 0.5px;
        }
        .gs-hero-icon { 
          width: 64px; 
          height: 64px; 
          border-radius: 16px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 28px; 
          color: #fff; 
          margin-bottom: 16px; 
          background: linear-gradient(135deg, #6366f1, #8b5cf6); 
        }
        .gs-hero h3 { 
          font-weight: 900; 
          font-size: 28px; 
          margin: 0 0 10px; 
          color: #0f172a; 
          line-height: 1.3;
        }
        .gs-hero p { 
          color: #64748b; 
          font-size: 15px; 
          margin: 0; 
          max-width: 700px; 
          line-height: 1.7; 
        }
        .gs-hero-meta { 
          display: flex; 
          gap: 18px; 
          margin-top: 18px; 
          flex-wrap: wrap; 
          align-items: center;
        }
        .gs-meta-item { 
          display: flex; 
          align-items: center; 
          gap: 6px; 
          font-size: 13px; 
          color: #64748b; 
        }
        .gs-meta-item i { 
          color: #6366f1; 
          font-size: 14px; 
        }
        .gs-hero-actions {
          display: flex;
          gap: 10px;
          margin-top: 18px;
          flex-wrap: wrap;
        }
        .gs-btn { 
          padding: 10px 22px; 
          border-radius: 10px; 
          font-size: 13px; 
          font-weight: 700; 
          cursor: pointer; 
          border: none; 
          transition: all 0.2s; 
          display: inline-flex; 
          align-items: center; 
          gap: 6px; 
        }
        .gs-btn-primary { 
          background: #6366f1; 
          color: #fff; 
        }
        .gs-btn-primary:hover { 
          background: #4f46e5; 
          transform: scale(1.03); 
        }
        .gs-btn-outline { 
          background: #fff; 
          color: #6366f1; 
          border: 1px solid #6366f1; 
        }
        .gs-btn-outline:hover { 
          background: #eef2ff; 
        }
        .gs-btn-success { 
          background: #10b981; 
          color: #fff; 
        }
        .gs-btn-success:hover { 
          background: #059669; 
          transform: scale(1.03); 
        }
        .gs-btn-completed { 
          background: #d1d5db; 
          color: #fff; 
          cursor: default; 
        }
        .gs-btn-completed:hover { 
          transform: none; 
        }
        
        /* Content Card */
        .gs-content-card { 
          background: #fff; 
          border-radius: 20px; 
          padding: 32px; 
          margin-bottom: 20px; 
          border: 1px solid #f1f5f9; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .gs-content-card h4 { 
          font-weight: 800; 
          font-size: 20px; 
          margin: 0 0 8px; 
          color: #0f172a; 
        }
        .gs-content-card .gs-subtitle {
          color: #64748b;
          font-size: 14px;
          margin-bottom: 24px;
        }
        
        /* Overview Box */
        .gs-overview { 
          background: #f8fafc; 
          border-radius: 14px; 
          padding: 20px 24px; 
          margin-bottom: 28px; 
          border-left: 4px solid #6366f1; 
        }
        .gs-overview p { 
          margin: 0; 
          font-size: 14px; 
          color: #334155; 
          line-height: 1.8; 
        }
        
        /* Steps */
        .gs-steps-title {
          font-weight: 800;
          font-size: 18px;
          color: #0f172a;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .gs-step { 
          display: flex; 
          gap: 18px; 
          padding: 22px 0; 
          border-bottom: 1px solid #f1f5f9; 
          align-items: flex-start; 
          transition: background 0.2s;
        }
        .gs-step:hover {
          background: #fafafa;
          margin: 0 -12px;
          padding-left: 12px;
          padding-right: 12px;
          border-radius: 12px;
        }
        .gs-step:last-child { 
          border-bottom: none; 
        }
        .gs-step-num { 
          width: 42px; 
          height: 42px; 
          border-radius: 12px; 
          background: linear-gradient(135deg, #6366f1, #8b5cf6); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: #fff; 
          font-weight: 800; 
          font-size: 18px; 
          flex-shrink: 0; 
        }
        .gs-step-content { 
          flex: 1; 
        }
        .gs-step-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .gs-step-icon { 
          width: 36px; 
          height: 36px; 
          border-radius: 10px; 
          background: #eef2ff; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: #6366f1; 
          font-size: 15px; 
          flex-shrink: 0; 
        }
        .gs-step-content h6 { 
          font-weight: 700; 
          font-size: 16px; 
          margin: 0; 
          color: #0f172a; 
        }
        .gs-step-content p { 
          font-size: 14px; 
          color: #475569; 
          margin: 0; 
          line-height: 1.7; 
        }
        
        /* Pro Tips Card */
        .gs-tips-card { 
          background: linear-gradient(135deg, #fef3c7, #fffbeb); 
          border-radius: 16px; 
          padding: 24px 28px; 
          margin-top: 24px; 
          border: 1px solid #fcd34d; 
        }
        .gs-tips-card h5 { 
          font-weight: 800; 
          color: #92400e; 
          margin: 0 0 12px; 
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .gs-tips-card ul { 
          margin: 0; 
          padding-left: 20px; 
        }
        .gs-tips-card li { 
          font-size: 14px; 
          color: #a16207; 
          margin-bottom: 8px; 
          line-height: 1.6; 
        }
        .gs-tips-card li:last-child {
          margin-bottom: 0;
        }
        
        /* Video Embed Placeholder */
        .gs-video-placeholder {
          background: linear-gradient(135deg, #0f172a, #1e293b);
          border-radius: 14px;
          padding: 40px;
          text-align: center;
          margin-top: 24px;
          color: #fff;
          border: 2px dashed #334155;
        }
        .gs-video-placeholder i {
          font-size: 48px;
          color: #6366f1;
          margin-bottom: 12px;
        }
        .gs-video-placeholder h6 {
          font-weight: 700;
          margin: 0 0 6px;
          color: #e2e8f0;
        }
        .gs-video-placeholder p {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
        }
        
        /* Related Guides */
        .gs-related { 
          display: flex; 
          gap: 10px; 
          margin-top: 24px; 
          flex-wrap: wrap; 
        }
        .gs-related-pill { 
          padding: 9px 18px; 
          border-radius: 20px; 
          background: #f8fafc; 
          border: 1px solid #e2e8f0; 
          font-size: 13px; 
          cursor: pointer; 
          transition: 0.2s; 
          color: #475569; 
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .gs-related-pill:hover { 
          background: #eef2ff; 
          border-color: #6366f1; 
          color: #6366f1; 
        }
        
        /* Upsell Banner */
        .gs-upsell { 
          background: linear-gradient(135deg, #eef2ff, #faf5ff); 
          border-radius: 18px; 
          padding: 28px 32px; 
          margin-top: 28px; 
          border: 1px solid #c7d2fe; 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          flex-wrap: wrap; 
          gap: 16px; 
        }
        .gs-upsell h5 { 
          font-weight: 800; 
          color: #3730a3; 
          margin: 0; 
          font-size: 18px;
        }
        .gs-upsell p { 
          color: #4f46e5; 
          margin: 4px 0 0; 
          font-size: 14px; 
        }
        
        /* Navigation Buttons */
        .gs-nav-btns { 
          display: flex; 
          justify-content: space-between; 
          margin-top: 32px; 
          gap: 12px; 
          flex-wrap: wrap;
        }
        
        /* Checklist */
        .gs-checklist {
          list-style: none;
          padding: 0;
          margin: 20px 0 0;
        }
        .gs-checklist li {
          padding: 10px 0;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
        }
        .gs-checklist li:last-child {
          border-bottom: none;
        }
        .gs-checklist li i {
          color: #10b981;
          font-size: 16px;
        }
        .gs-checklist li i.fa-circle {
          color: #d1d5db;
        }
        
        @media (max-width: 768px) {
          .gs-hero { 
            padding: 24px 18px; 
          }
          .gs-hero h3 { 
            font-size: 22px; 
          }
          .gs-content-card {
            padding: 20px 16px;
          }
          .gs-step { 
            flex-direction: column; 
            gap: 12px; 
          }
          .gs-upsell { 
            flex-direction: column; 
            text-align: center; 
          }
          .gs-nav-btns {
            flex-direction: column;
            align-items: stretch;
          }
        }
      </style>

      <div class="gs-wrap">
        <!-- Back Navigation -->
        <div class="gs-back-row">
          <button class="gs-back-btn" onclick="(${onBack.toString()})()">
            <i class="fas fa-arrow-left"></i> Back to All Guides
          </button>
          <div class="gs-breadcrumb">
            <span onclick="(${onBack.toString()})()">📖 Platform Documentation</span>
            <i class="fas fa-chevron-right" style="font-size:10px;"></i>
            <span style="color:#6366f1;font-weight:600;">Getting Started Guide</span>
          </div>
        </div>

        <!-- Hero -->
        <div class="gs-hero">
          <div class="gs-hero-badge">⭐ START HERE — First Time Users</div>
          <div class="gs-hero-icon"><i class="fas fa-rocket"></i></div>
          <h3>Getting Started Guide</h3>
          <p>Welcome to your new CRM! This guide walks you through everything you need — from creating your account to sending your first WhatsApp campaign. By the end, you'll have a fully functional CRM setup ready to generate leads and revenue.</p>
          
          <div class="gs-hero-meta">
            <div class="gs-meta-item"><i class="fas fa-signal"></i> 🟢 Beginner</div>
            <div class="gs-meta-item"><i class="fas fa-clock"></i> 8 min read</div>
            <div class="gs-meta-item"><i class="fas fa-layer-group"></i> 6 Steps</div>
            <div class="gs-meta-item"><i class="fas fa-globe"></i> Updated: Jul 2026</div>
          </div>
          
          <div class="gs-hero-actions">
            ${isCompleted ? `
              <button class="gs-btn gs-btn-completed">
                <i class="fas fa-check-circle"></i> Completed ✓
              </button>
            ` : `
              <button class="gs-btn gs-btn-success" onclick="GettingStartedGuide.markComplete(${onComplete.toString()})">
                <i class="fas fa-check"></i> Mark as Complete
              </button>
            `}
            <button class="gs-btn gs-btn-outline" onclick="(${onBookmark.toString()})()">
              <i class="fas ${isBookmarked ? 'fa-star' : 'fa-star'}"></i> 
              ${isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
            <button class="gs-btn gs-btn-outline" onclick="window.print()">
              <i class="fas fa-print"></i> Print
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="gs-content-card">
          <h4>📋 What You'll Learn</h4>
          <p class="gs-subtitle">By the end of this guide, your CRM will be fully set up and ready to generate leads.</p>
          
          <div class="gs-overview">
            <p>This guide is designed for absolute beginners. No prior CRM experience needed. We'll start from account creation and go all the way to launching your first campaign. Each step builds on the previous one, so follow along in order for the best experience.</p>
          </div>

          <!-- Quick Checklist -->
          <div style="background:#f0fdf4;border-radius:14px;padding:18px 22px;margin-bottom:24px;border:1px solid #bbf7d0;">
            <h6 style="font-weight:700;color:#065f46;margin:0 0 10px;">✅ Your Getting Started Checklist</h6>
            <ul class="gs-checklist">
              <li><i class="fas ${userProgress >= 16 ? 'fa-check-circle' : 'fa-circle'}"></i> Create your account & verify email</li>
              <li><i class="fas ${userProgress >= 33 ? 'fa-check-circle' : 'fa-circle'}"></i> Complete your company profile</li>
              <li><i class="fas ${userProgress >= 50 ? 'fa-check-circle' : 'fa-circle'}"></i> Connect WhatsApp</li>
              <li><i class="fas ${userProgress >= 66 ? 'fa-check-circle' : 'fa-circle'}"></i> Import your contacts</li>
              <li><i class="fas ${userProgress >= 83 ? 'fa-check-circle' : 'fa-circle'}"></i> Create your first campaign</li>
              <li><i class="fas ${userProgress >= 100 ? 'fa-check-circle' : 'fa-circle'}"></i> Track results & celebrate 🎉</li>
            </ul>
          </div>

          <!-- Steps -->
          <div class="gs-steps-title">
            <i class="fas fa-list-ol" style="color:#6366f1;"></i> Step-by-Step Instructions
          </div>

          <!-- Step 1 -->
          <div class="gs-step">
            <div class="gs-step-num">1</div>
            <div class="gs-step-content">
              <div class="gs-step-header">
                <div class="gs-step-icon"><i class="fas fa-user-plus"></i></div>
                <h6>Create Your Account</h6>
              </div>
              <p>
                <strong>Visit the signup page</strong> at your CRM's URL and click "Start Free Trial" or "Sign Up". Enter your full name, business email, phone number, and create a strong password (min 8 characters, 1 uppercase, 1 number, 1 special character).
                <br><br>
                <strong>Verify your email:</strong> Check your inbox (and spam folder) for the verification link. Click it within 24 hours. Once verified, you'll be redirected to the dashboard.
                <br><br>
                <strong>Choose your plan:</strong> You can start with a <span style="background:#ecfdf5;color:#065f46;padding:2px 8px;border-radius:4px;font-size:12px;">14-day Free Trial</span> (all features included, no credit card required) or jump straight to a paid plan for uninterrupted access.
                <br><br>
                <em style="color:#64748b;">💡 Tip: Start with the free trial to explore all features risk-free. You can upgrade anytime without losing data.</em>
              </p>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="gs-step">
            <div class="gs-step-num">2</div>
            <div class="gs-step-content">
              <div class="gs-step-header">
                <div class="gs-step-icon"><i class="fas fa-building"></i></div>
                <h6>Complete Your Company Profile</h6>
              </div>
              <p>
                Navigate to <strong>Settings → Company Profile</strong>. This is crucial — a complete profile builds trust with your customers and appears on invoices, forms, and WhatsApp messages.
                <br><br>
                <strong>Required fields:</strong>
                • Business name & display name<br>
                • Upload logo (recommended: 500×500px PNG)<br>
                • Business address & GST number (for Indian businesses)<br>
                • Website URL & industry type<br>
                • Timezone & currency (set correctly — affects scheduling & reports)<br>
                • Brand colors (primary & accent — used on forms & emails)
                <br><br>
                <em style="color:#64748b;">💡 A complete profile increases customer trust by 40%. Don't skip this step!</em>
              </p>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="gs-step">
            <div class="gs-step-num">3</div>
            <div class="gs-step-content">
              <div class="gs-step-header">
                <div class="gs-step-icon"><i class="fab fa-whatsapp"></i></div>
                <h6>Connect WhatsApp</h6>
              </div>
              <p>
                This is your most important integration. <strong>Navigate to Settings → WhatsApp Integration.</strong>
                <br><br>
                <strong>Option A — WhatsApp Cloud API (Recommended):</strong>
                1. Go to Meta Business Suite (business.facebook.com)<br>
                2. Create a WhatsApp Business App<br>
                3. Copy your Business ID, Phone Number ID, and generate a Permanent Access Token<br>
                4. Paste these into the CRM's WhatsApp settings page<br>
                5. Click "Test Connection" — you should see ✅ Connected
                <br><br>
                <strong>Option B — WhatsApp Web (Basic):</strong>
                Scan the QR code with your WhatsApp mobile app (Settings → Linked Devices → Link a Device). Note: This only works with 1 agent and requires your phone to stay online.
                <br><br>
                <em style="color:#64748b;">💡 Cloud API supports unlimited agents, automation, and doesn't require your phone to be online.</em>
              </p>
            </div>
          </div>

          <!-- Step 4 -->
          <div class="gs-step">
            <div class="gs-step-num">4</div>
            <div class="gs-step-content">
              <div class="gs-step-header">
                <div class="gs-step-icon"><i class="fas fa-upload"></i></div>
                <h6>Import Your Contacts</h6>
              </div>
              <p>
                Go to <strong>Contacts → Import</strong>. You have multiple options:
                <br><br>
                • <strong>Upload CSV/Excel:</strong> Download our template first, fill in your contacts, and upload. Map columns to CRM fields (Name, Phone, Email, Company, Tags).<br>
                • <strong>Google Contacts Sync:</strong> One-time authorization for real-time sync.<br>
                • <strong>WhatsApp Contacts:</strong> Import contacts from your connected WhatsApp account.<br>
                • <strong>Manual Entry:</strong> Use + Add Contact button for individual entries.
                <br><br>
                The system automatically <strong>deduplicates</strong> contacts (same phone number = merged) and <strong>validates</strong> WhatsApp numbers.
                <br><br>
                <em style="color:#64748b;">💡 Start with 50-100 contacts to test, then import your full database once you're comfortable.</em>
              </p>
            </div>
          </div>

          <!-- Step 5 -->
          <div class="gs-step">
            <div class="gs-step-num">5</div>
            <div class="gs-step-content">
              <div class="gs-step-header">
                <div class="gs-step-icon"><i class="fas fa-paper-plane"></i></div>
                <h6>Create Your First Campaign</h6>
              </div>
              <p>
                Head to <strong>Campaigns → Create New</strong>. This is where the magic happens!
                <br><br>
                <strong>Step-by-step:</strong>
                1. <strong>Choose Campaign Type:</strong> Select "Bulk Broadcast" for your first campaign<br>
                2. <strong>Select Audience:</strong> Choose a segment or select specific contacts<br>
                3. <strong>Craft Your Message:</strong> Use the rich text editor. Include variables like <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;">{{name}}</code> to personalize each message<br>
                4. <strong>Add Media:</strong> Attach images, PDFs, or videos (under 16MB)<br>
                5. <strong>Schedule:</strong> Send now or schedule for later. Pro tip: Use "Best Time to Send" for AI-optimized delivery<br>
                6. <strong>Review & Send:</strong> Double-check everything, send a test to yourself first, then launch!
                <br><br>
                <em style="color:#64748b;">💡 For your first campaign, keep it simple — a welcome message introducing your business to your contacts.</em>
              </p>
            </div>
          </div>

          <!-- Step 6 -->
          <div class="gs-step">
            <div class="gs-step-num">6</div>
            <div class="gs-step-content">
              <div class="gs-step-header">
                <div class="gs-step-icon"><i class="fas fa-chart-line"></i></div>
                <h6>Track Results & Celebrate 🎉</h6>
              </div>
              <p>
                Visit <strong>Analytics → Campaign Reports</strong> to see how your first campaign performed. You'll see:
                <br><br>
                • <strong>Delivery Rate:</strong> How many messages were successfully delivered<br>
                • <strong>Read Rate:</strong> How many people opened your message<br>
                • <strong>Reply Rate:</strong> How many people responded<br>
                • <strong>Conversion:</strong> How many leads moved to the next pipeline stage
                <br><br>
                <strong>Congratulations!</strong> You've just completed your CRM setup and sent your first campaign. This is a huge milestone — most businesses never get this far. Take a moment to celebrate! 🎉
                <br><br>
                <em style="color:#64748b;">💡 Set up daily email summaries in Settings → Notifications to get campaign performance updates automatically.</em>
              </p>
            </div>
          </div>

          <!-- Pro Tips -->
          <div class="gs-tips-card">
            <h5><i class="fas fa-lightbulb" style="color:#f59e0b;"></i> Pro Tips for Beginners</h5>
            <ul>
              <li><strong>Set up pipeline stages first</strong> (Settings → Pipeline) before importing contacts — this auto-assigns leads to the correct stage.</li>
              <li><strong>Use the AI Template Generator</strong> in Campaigns — it creates high-converting message templates based on your business type.</li>
              <li><strong>Bookmark this guide</strong> (click the ⭐ button) for quick access during your first week.</li>
              <li><strong>Join the Community</strong> (WhatsApp group link in Community section) — learn from other CRM users.</li>
              <li><strong>Explore other guides:</strong> After this, read "Dashboard Overview" and "Managing Leads" to deepen your knowledge.</li>
            </ul>
          </div>

          <!-- Video Placeholder -->
          <div class="gs-video-placeholder">
            <i class="fas fa-play-circle"></i>
            <h6>📹 Video Walkthrough — Coming Soon</h6>
            <p>We're creating a step-by-step video tutorial for this guide. Subscribe to our YouTube channel to get notified when it's released!</p>
            <button class="gs-btn gs-btn-outline mt-3" style="color:#fff;border-color:#6366f1;" onclick="window.open('https://youtube.com','_blank')">
              <i class="fab fa-youtube"></i> Subscribe on YouTube
            </button>
          </div>

          <!-- Related Guides -->
          <h5 style="font-weight:700;margin-top:28px;color:#0f172a;">🔗 Continue Your Learning</h5>
          <p style="color:#64748b;font-size:13px;margin:4px 0 12px;">Now that you're set up, explore these related guides:</p>
          <div class="gs-related">
            <span class="gs-related-pill" onclick="(${onNavigate.toString()})('dashboard')">
              📊 Dashboard Overview
            </span>
            <span class="gs-related-pill" onclick="(${onNavigate.toString()})('campaigns')">
              📨 Campaign Creation
            </span>
            <span class="gs-related-pill" onclick="(${onNavigate.toString()})('contacts')">
              📇 Contacts Management
            </span>
            <span class="gs-related-pill" onclick="(${onNavigate.toString()})('chats')">
              💬 WhatsApp Chat Setup
            </span>
          </div>
        </div>

        <!-- Upsell Banner -->
        <div class="gs-upsell">
          <div>
            <h5>🚀 Ready to Scale?</h5>
            <p>Now that you know the basics, unlock advanced automation, AI chatbots, and unlimited campaigns with our Pro plan.</p>
          </div>
          <button class="gs-btn gs-btn-primary" onclick="Plan.render()">
            <i class="fas fa-crown"></i> Upgrade to Pro
          </button>
        </div>

        <!-- Navigation -->
        <div class="gs-nav-btns">
          <div>
            ${prevGuide ? `
              <button class="gs-btn gs-btn-outline" onclick="(${onNavigate.toString()})('${prevGuide.id}')">
                <i class="fas fa-arrow-left"></i> Previous: ${prevGuide.title}
              </button>
            ` : ''}
          </div>
          <div>
            ${nextGuide ? `
              <button class="gs-btn gs-btn-primary" onclick="(${onNavigate.toString()})('${nextGuide.id}')">
                Next: ${nextGuide.title} <i class="fas fa-arrow-right"></i>
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    contentArea.innerHTML = html;
    contentArea.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // ==================== HELPERS ====================
  async markInProgress() {
    try {
      if (!window.currentUser?.uid) return;
      const docRef = db.collection('user_progress').doc(window.currentUser.uid);
      const doc = await docRef.get();
      let platformGuides = {};
      if (doc.exists && doc.data().platformGuides) {
        platformGuides = doc.data().platformGuides;
      }
      if (!platformGuides[this.guideId] || platformGuides[this.guideId] < 10) {
        platformGuides[this.guideId] = 10; // Started reading
        await docRef.set({
          platformGuides: platformGuides,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }
    } catch (e) {
      console.error('Progress update error:', e);
    }
  },

  async markComplete(onCompleteCallback) {
    try {
      if (!window.currentUser?.uid) return;
      const docRef = db.collection('user_progress').doc(window.currentUser.uid);
      const doc = await docRef.get();
      let platformGuides = {};
      if (doc.exists && doc.data().platformGuides) {
        platformGuides = doc.data().platformGuides;
      }
      platformGuides[this.guideId] = 100;
      await docRef.set({
        platformGuides: platformGuides,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      if (typeof showToast === 'function') {
        showToast('✅ Guide completed! Great job!', 'success');
      }
      
      // Call the parent callback to refresh UI
      if (typeof onCompleteCallback === 'function') {
        onCompleteCallback();
      }
    } catch (e) {
      console.error('Complete error:', e);
      if (typeof showToast === 'function') {
        showToast('Error saving progress. Try again.', 'error');
      }
    }
  }
};

// Export for dynamic import
export default GettingStartedGuide;