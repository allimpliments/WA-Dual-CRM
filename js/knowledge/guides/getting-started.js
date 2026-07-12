// js/knowledge/guides/getting-started.js — Getting Started Guide (⭐ Complete Platform Introduction)
const GettingStartedGuide = {
  guideId: 'getting-started',

  async render(context) {
    const { guide, userProgress = 0, isBookmarked = false, onBack, onComplete, onBookmark, onNavigate, getAdjacentGuide, allGuides } = context;

    contentArea.style.paddingTop = '60px';
    contentArea.style.background = '#f8fafc';

    if (userProgress === 0) {
      try { await this.markInProgress(); } catch (e) {}
    }

    const isCompleted = userProgress >= 100;
    const prevGuide = getAdjacentGuide ? getAdjacentGuide('prev') : null;
    const nextGuide = getAdjacentGuide ? getAdjacentGuide('next') : null;

    let html = `
      <style>
        .gs-wrap { max-width: 1100px; margin: 0 auto; padding: 0 16px; }
        .gs-back-row { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
        .gs-back-btn { padding: 9px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid #e2e8f0; background: #fff; color: #475569; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .gs-back-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }
        .gs-breadcrumb { font-size: 12px; color: #94a3b8; display: flex; align-items: center; gap: 6px; }
        .gs-breadcrumb span { cursor: pointer; transition: color 0.2s; }
        .gs-breadcrumb span:hover { color: #6366f1; }
        .gs-hero { background: #fff; border-radius: 20px; padding: 40px 36px; margin-bottom: 24px; border: 1px solid #f1f5f9; position: relative; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gs-hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1); }
        .gs-hero-badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; background: #fef3c7; color: #92400e; margin-bottom: 14px; letter-spacing: 0.5px; }
        .gs-hero-icon { width: 72px; height: 72px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #fff; margin-bottom: 18px; background: linear-gradient(135deg, #6366f1, #8b5cf6); }
        .gs-hero h3 { font-weight: 900; font-size: 30px; margin: 0 0 12px; color: #0f172a; line-height: 1.3; }
        .gs-hero p { color: #64748b; font-size: 15px; margin: 0; max-width: 750px; line-height: 1.7; }
        .gs-hero-meta { display: flex; gap: 20px; margin-top: 20px; flex-wrap: wrap; align-items: center; }
        .gs-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; }
        .gs-meta-item i { color: #6366f1; font-size: 14px; }
        .gs-hero-actions { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
        .gs-btn { padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .gs-btn-primary { background: #6366f1; color: #fff; } .gs-btn-primary:hover { background: #4f46e5; transform: scale(1.03); }
        .gs-btn-outline { background: #fff; color: #6366f1; border: 1px solid #6366f1; } .gs-btn-outline:hover { background: #eef2ff; }
        .gs-btn-success { background: #10b981; color: #fff; } .gs-btn-success:hover { background: #059669; transform: scale(1.03); }
        .gs-btn-completed { background: #d1d5db; color: #fff; cursor: default; } .gs-btn-completed:hover { transform: none; }
        .gs-btn-warning { background: #f59e0b; color: #fff; } .gs-btn-warning:hover { background: #d97706; }
        .gs-content-card { background: #fff; border-radius: 20px; padding: 36px; margin-bottom: 20px; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gs-content-card h4 { font-weight: 800; font-size: 22px; margin: 0 0 8px; color: #0f172a; }
        .gs-content-card .gs-subtitle { color: #64748b; font-size: 14px; margin-bottom: 28px; line-height: 1.6; }
        .gs-overview { background: #f8fafc; border-radius: 14px; padding: 24px 28px; margin-bottom: 32px; border-left: 4px solid #6366f1; }
        .gs-overview p { margin: 0; font-size: 15px; color: #334155; line-height: 1.8; }
        .gs-section-title { font-weight: 800; font-size: 18px; color: #0f172a; margin: 32px 0 16px; display: flex; align-items: center; gap: 10px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9; }
        .gs-feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; margin-bottom: 8px; }
        .gs-feature-card { background: #f8fafc; border-radius: 14px; padding: 18px 20px; border: 1px solid #e2e8f0; transition: all 0.2s; cursor: pointer; }
        .gs-feature-card:hover { background: #eef2ff; border-color: #6366f1; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .gs-feature-card h6 { font-weight: 700; font-size: 14px; margin: 0 0 4px; color: #0f172a; display: flex; align-items: center; gap: 8px; }
        .gs-feature-card p { font-size: 12px; color: #64748b; margin: 0; line-height: 1.5; }
        .gs-feature-card .gs-feat-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #fff; flex-shrink: 0; }
        .gs-step { display: flex; gap: 18px; padding: 24px 0; border-bottom: 1px solid #f1f5f9; align-items: flex-start; }
        .gs-step:last-child { border-bottom: none; }
        .gs-step-num { width: 46px; height: 46px; border-radius: 14px; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 20px; flex-shrink: 0; }
        .gs-step-content { flex: 1; }
        .gs-step-content h6 { font-weight: 700; font-size: 16px; margin: 0 0 6px; color: #0f172a; display: flex; align-items: center; gap: 8px; }
        .gs-step-content p { font-size: 14px; color: #475569; margin: 0; line-height: 1.7; }
        .gs-step-content ul { margin: 10px 0 0; padding-left: 18px; }
        .gs-step-content li { font-size: 13px; color: #475569; margin-bottom: 4px; line-height: 1.6; }
        .gs-tips-card { background: linear-gradient(135deg, #fef3c7, #fffbeb); border-radius: 16px; padding: 24px 28px; margin-top: 28px; border: 1px solid #fcd34d; }
        .gs-tips-card h5 { font-weight: 800; color: #92400e; margin: 0 0 12px; display: flex; align-items: center; gap: 8px; }
        .gs-tips-card ul { margin: 0; padding-left: 20px; }
        .gs-tips-card li { font-size: 14px; color: #a16207; margin-bottom: 8px; line-height: 1.6; }
        .gs-tips-card li:last-child { margin-bottom: 0; }
        .gs-roadmap { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
        .gs-roadmap-item { padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; border: 1px solid #e2e8f0; background: #fff; color: #475569; display: flex; align-items: center; gap: 6px; }
        .gs-roadmap-item:hover { background: #eef2ff; border-color: #6366f1; color: #6366f1; }
        .gs-roadmap-item.featured { background: #6366f1; color: #fff; border-color: #6366f1; }
        .gs-upsell { background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 18px; padding: 32px; margin-top: 32px; border: 1px solid #c7d2fe; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .gs-upsell h5 { font-weight: 800; color: #3730a3; margin: 0; font-size: 18px; }
        .gs-upsell p { color: #4f46e5; margin: 4px 0 0; font-size: 14px; }
        .gs-nav-btns { display: flex; justify-content: space-between; margin-top: 36px; gap: 12px; flex-wrap: wrap; }
        .gs-checklist { list-style: none; padding: 0; margin: 20px 0 0; }
        .gs-checklist li { padding: 10px 0; display: flex; align-items: center; gap: 10px; font-size: 14px; color: #334155; border-bottom: 1px solid #f1f5f9; }
        .gs-checklist li:last-child { border-bottom: none; }
        .gs-checklist li i.fa-check-circle { color: #10b981; font-size: 16px; }
        .gs-checklist li i.fa-circle { color: #d1d5db; font-size: 16px; }
        @media (max-width: 768px) { .gs-hero { padding: 24px 18px; } .gs-hero h3 { font-size: 22px; } .gs-content-card { padding: 20px 16px; } .gs-feature-grid { grid-template-columns: 1fr; } .gs-step { flex-direction: column; gap: 12px; } .gs-upsell { flex-direction: column; text-align: center; } .gs-nav-btns { flex-direction: column; align-items: stretch; } }
      </style>

      <div class="gs-wrap">
        <!-- Back Navigation -->
        <div class="gs-back-row">
          <button class="gs-back-btn" onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();"><i class="fas fa-arrow-left"></i> Back to All Guides</button>
          <div class="gs-breadcrumb">
            <span onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();">📖 Platform Documentation</span>
            <i class="fas fa-chevron-right" style="font-size:10px;"></i>
            <span style="color:#6366f1;font-weight:600;">Getting Started Guide</span>
          </div>
        </div>

        <!-- Hero -->
        <div class="gs-hero">
          <div class="gs-hero-badge">⭐ START HERE — New User Onboarding</div>
          <div class="gs-hero-icon"><i class="fas fa-rocket"></i></div>
          <h3>Welcome to Your CRM — Let's Get You Set Up!</h3>
          <p>This is your complete introduction to the platform. We'll walk through everything — what the CRM can do, how it's structured, and the exact steps to go from zero to sending your first campaign. No prior experience needed. By the end, you'll understand every major feature and have a fully working CRM.</p>
          <div class="gs-hero-meta">
            <div class="gs-meta-item"><i class="fas fa-signal"></i> 🟢 Beginner</div>
            <div class="gs-meta-item"><i class="fas fa-clock"></i> 12 min read</div>
            <div class="gs-meta-item"><i class="fas fa-layer-group"></i> 8 Sections</div>
            <div class="gs-meta-item"><i class="fas fa-globe"></i> Updated: Jul 2026</div>
          </div>
          <div class="gs-hero-actions">
            ${isCompleted ? `<button class="gs-btn gs-btn-completed"><i class="fas fa-check-circle"></i> Completed ✓</button>` : `<button class="gs-btn gs-btn-success" onclick="GettingStartedGuide.triggerComplete()"><i class="fas fa-check"></i> Mark as Complete</button>`}
            <button class="gs-btn gs-btn-outline" onclick="PlatformDocs.toggleBookmark('getting-started');PlatformDocs.currentGuide='getting-started';PlatformDocs.render();"><i class="fas ${isBookmarked ? 'fa-star' : 'fa-star'}"></i> ${isBookmarked ? 'Bookmarked' : 'Bookmark'}</button>
            <button class="gs-btn gs-btn-outline" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
          </div>
        </div>

        <!-- Content -->
        <div class="gs-content-card">

          <!-- Section 1: Overview -->
          <h4>📋 What You'll Learn</h4>
          <p class="gs-subtitle">A complete walkthrough of the entire CRM platform — from understanding the dashboard to mastering advanced automation.</p>
          <div class="gs-overview">
            <p>This CRM is a <strong>complete business growth platform</strong> — not just a contact manager. It combines WhatsApp marketing, lead management, sales pipeline tracking, AI chatbots, e‑commerce integration, appointment scheduling, and advanced analytics into one unified system. Whether you're a freelancer, small business owner, or running an agency with multiple clients — this platform scales with you.</p>
          </div>

          <!-- Section 2: Platform Architecture -->
          <div class="gs-section-title"><i class="fas fa-cubes" style="color:#6366f1;"></i> 🏗️ Platform Architecture — How Everything Connects</div>
          <p style="font-size:14px;color:#475569;margin-bottom:20px;line-height:1.7;">The CRM is built around 5 core pillars. Understanding this structure will help you navigate the platform efficiently:</p>
          
          <div class="gs-feature-grid">
            <div class="gs-feature-card" onclick="PlatformDocs.openGuide('contacts')">
              <h6><span class="gs-feat-icon" style="background:linear-gradient(135deg,#06b6d4,#0891b2);"><i class="fas fa-address-book"></i></span> Contacts & Leads Hub</h6>
              <p>Your database — contacts, leads, segments, custom fields, import/export. Everything starts here.</p>
            </div>
            <div class="gs-feature-card" onclick="PlatformDocs.openGuide('chats')">
              <h6><span class="gs-feat-icon" style="background:linear-gradient(135deg,#25D366,#128C7E);"><i class="fab fa-whatsapp"></i></span> Communication Engine</h6>
              <p>WhatsApp API, live chat, quick replies, multi-agent inbox, chatbot integration.</p>
            </div>
            <div class="gs-feature-card" onclick="PlatformDocs.openGuide('campaigns')">
              <h6><span class="gs-feat-icon" style="background:linear-gradient(135deg,#ef4444,#dc2626);"><i class="fas fa-bullhorn"></i></span> Campaign System</h6>
              <p>Bulk broadcasts, drip sequences, A/B testing, scheduling, template-based messaging.</p>
            </div>
            <div class="gs-feature-card" onclick="PlatformDocs.openGuide('kanban')">
              <h6><span class="gs-feat-icon" style="background:linear-gradient(135deg,#ec4899,#db2777);"><i class="fas fa-columns"></i></span> Sales Pipeline</h6>
              <p>Kanban board, deal tracking, stage management, revenue forecasting, drag-and-drop.</p>
            </div>
            <div class="gs-feature-card" onclick="PlatformDocs.openGuide('analytics')">
              <h6><span class="gs-feat-icon" style="background:linear-gradient(135deg,#3b82f6,#2563eb);"><i class="fas fa-chart-pie"></i></span> Analytics & Intelligence</h6>
              <p>Campaign reports, agent performance, revenue analytics, custom dashboards, ROI tracking.</p>
            </div>
            <div class="gs-feature-card" onclick="PlatformDocs.openGuide('integrations')">
              <h6><span class="gs-feat-icon" style="background:linear-gradient(135deg,#7c3aed,#6d28d9);"><i class="fas fa-puzzle-piece"></i></span> Integrations & Ecosystem</h6>
              <p>30+ tools: payment gateways, e‑commerce, Google Calendar, Zapier, webhooks, API access.</p>
            </div>
          </div>

          <!-- Section 3: Full Feature Map -->
          <div class="gs-section-title"><i class="fas fa-map" style="color:#f59e0b;"></i> 🗺️ Complete Feature Map — What Every Module Does</div>
          <p style="font-size:14px;color:#475569;margin-bottom:16px;line-height:1.7;">Here's every major module and what you'll learn in each dedicated guide. Click any to jump directly:</p>
          
          <div class="gs-roadmap">
            <span class="gs-roadmap-item featured" onclick="PlatformDocs.openGuide('getting-started')">🚀 Getting Started</span>
            <span class="gs-roadmap-item" onclick="PlatformDocs.openGuide('dashboard')">📊 Dashboard</span>
            <span class="gs-roadmap-item" onclick="PlatformDocs.openGuide('leads')">🎯 Leads</span>
            <span class="gs-roadmap-item" onclick="PlatformDocs.openGuide('contacts')">📇 Contacts</span>
            <span class="gs-roadmap-item" onclick="PlatformDocs.openGuide('chats')">💬 WhatsApp Chat</span>
            <span class="gs-roadmap-item" onclick="PlatformDocs.openGuide('campaigns')">📨 Campaigns</span>
            <span class="gs-roadmap-item" onclick="PlatformDocs.openGuide('templates-flows')">🔄 Templates & Flows</span>
            <span class="gs-roadmap-item" onclick="PlatformDocs.openGuide('kanban')">📋 Kanban Pipeline</span>
            <span class="gs-roadmap-item" onclick="PlatformDocs.openGuide('social')">🌐 Social Media</span>
            <span class="gs-roadmap-item" onclick="PlatformDocs.openGuide('forms')">📝 Form Builder</span>
            <span class="gs-roadmap-item" onclick="PlatformDocs.openGuide('chatbot')">🤖 AI Chatbot</span>
            <span class="gs-roadmap-item" onclick="PlatformDocs.openGuide('ecommerce')">🛒 E‑commerce</span>
            <span class="gs-roadmap-item" onclick="PlatformDocs.openGuide('appointments')">📅 Appointments</span>
            <span class="gs-roadmap-item" onclick="PlatformDocs.openGuide('analytics')">📈 Analytics</span>
            <span class="gs-roadmap-item" onclick="PlatformDocs.openGuide('integrations')">🔌 Integrations</span>
            <span class="gs-roadmap-item" onclick="PlatformDocs.openGuide('agents')">👥 Team Management</span>
            <span class="gs-roadmap-item" onclick="PlatformDocs.openGuide('clients')">🏢 Client Management</span>
            <span class="gs-roadmap-item" onclick="PlatformDocs.openGuide('tickets')">🎫 Ticket System</span>
            <span class="gs-roadmap-item" onclick="PlatformDocs.openGuide('settings')">⚙️ Settings</span>
            <span class="gs-roadmap-item" onclick="PlatformDocs.openGuide('plans')">💳 Plans & Billing</span>
          </div>

          <!-- Section 4: Setup Steps -->
          <div class="gs-section-title"><i class="fas fa-list-ol" style="color:#10b981;"></i> 🔧 Step-by-Step Setup — Get Your CRM Ready</div>
          
          <div class="gs-step">
            <div class="gs-step-num">1</div>
            <div class="gs-step-content">
              <h6>📧 Create Your Account & Verify Email</h6>
              <p>Visit the signup page, enter your business details, and verify your email. Choose between a <strong>14-day Free Trial</strong> (all features, no card needed) or jump to a paid plan. Once verified, you'll land on your dashboard — your new command center.</p>
            </div>
          </div>

          <div class="gs-step">
            <div class="gs-step-num">2</div>
            <div class="gs-step-content">
              <h6>🏢 Complete Your Company Profile</h6>
              <p>Go to <strong>Settings → Company Profile</strong>. Add your business name, logo (500×500px PNG), address, GST number, website, timezone, and brand colors. A complete profile builds customer trust and appears on all invoices, forms, and WhatsApp messages.</p>
            </div>
          </div>

          <div class="gs-step">
            <div class="gs-step-num">3</div>
            <div class="gs-step-content">
              <h6>💬 Connect WhatsApp (Your Most Important Integration)</h6>
              <p>Navigate to <strong>Settings → WhatsApp Integration</strong>. Use <strong>WhatsApp Cloud API</strong> (recommended — supports unlimited agents, automation, works without phone online) or WhatsApp Web (basic, 1 agent, phone must stay online). Follow the step-by-step connection wizard.</p>
            </div>
          </div>

          <div class="gs-step">
            <div class="gs-step-num">4</div>
            <div class="gs-step-content">
              <h6>📥 Import Your Contacts</h6>
              <p>Go to <strong>Contacts → Import</strong>. Upload CSV/Excel files, sync Google Contacts, or import from WhatsApp. The system auto-deduplicates and validates numbers. Start with 50-100 contacts for testing, then import your full database.</p>
            </div>
          </div>

          <div class="gs-step">
            <div class="gs-step-num">5</div>
            <div class="gs-step-content">
              <h6>📊 Customize Your Pipeline</h6>
              <p>Go to <strong>Settings → Pipeline</strong>. Define your sales stages — default is New → Contacted → Qualified → Proposal → Negotiation → Won/Lost. Customize stages to match your exact sales process. This powers your Kanban board and analytics.</p>
            </div>
          </div>

          <div class="gs-step">
            <div class="gs-step-num">6</div>
            <div class="gs-step-content">
              <h6>📨 Launch Your First Campaign</h6>
              <p>Head to <strong>Campaigns → Create New</strong>. Select "Bulk Broadcast", choose your audience, craft your message (use <code>{{name}}</code> for personalization), add media, and schedule or send immediately. Pro tip: Always send a test to yourself first!</p>
            </div>
          </div>

          <div class="gs-step">
            <div class="gs-step-num">7</div>
            <div class="gs-step-content">
              <h6>📈 Track Results & Iterate</h6>
              <p>Visit <strong>Analytics → Campaign Reports</strong> to see delivery rates, read rates, reply rates, and conversions. Use this data to improve your next campaign. Set up daily email summaries in Settings → Notifications.</p>
            </div>
          </div>

          <!-- Section 5: What's Next — Learning Path -->
          <div class="gs-section-title"><i class="fas fa-road" style="color:#f59e0b;"></i> 🛣️ Recommended Learning Path After This Guide</div>
          <p style="font-size:14px;color:#475569;margin-bottom:16px;line-height:1.7;">Follow this sequence for the fastest path to CRM mastery:</p>
          <div class="gs-roadmap">
            <span class="gs-roadmap-item featured" style="background:#10b981;color:#fff;border-color:#10b981;">✅ 1. Getting Started (You Are Here)</span>
            <span class="gs-roadmap-item" onclick="PlatformDocs.openGuide('dashboard')">2. Dashboard Overview →</span>
            <span class="gs-roadmap-item" onclick="PlatformDocs.openGuide('leads')">3. Managing Leads →</span>
            <span class="gs-roadmap-item" onclick="PlatformDocs.openGuide('campaigns')">4. Campaign Creation →</span>
            <span class="gs-roadmap-item" onclick="PlatformDocs.openGuide('chats')">5. WhatsApp Chat →</span>
            <span class="gs-roadmap-item" onclick="PlatformDocs.openGuide('analytics')">6. Analytics →</span>
            <span class="gs-roadmap-item" onclick="PlatformDocs.openGuide('chatbot')">7. AI Chatbot →</span>
          </div>

          <!-- Section 6: Pro Tips -->
          <div class="gs-tips-card">
            <h5><i class="fas fa-lightbulb" style="color:#f59e0b;"></i> 💡 Pro Tips for New Users</h5>
            <ul>
              <li><strong>Bookmark this guide</strong> (⭐ button) — you'll want to reference it during your first week.</li>
              <li><strong>Complete your profile FIRST</strong> — it affects everything: forms, invoices, WhatsApp display name, email footers.</li>
              <li><strong>Use Cloud API, not WhatsApp Web</strong> — Cloud API supports unlimited agents, automation, and doesn't need your phone online.</li>
              <li><strong>Join the WhatsApp Community</strong> (Community section) — learn from 2500+ other CRM users.</li>
              <li><strong>Explore the Knowledge Hub regularly</strong> — new guides, courses, and webinars are added weekly.</li>
              <li><strong>Don't try to learn everything at once</strong> — master the basics (Contacts + Campaigns), then explore advanced features (Flows, Chatbot, E‑commerce).</li>
            </ul>
          </div>

          <!-- Section 7: Checklist -->
          <div style="background:#f0fdf4;border-radius:14px;padding:22px 26px;margin-top:24px;border:1px solid #bbf7d0;">
            <h6 style="font-weight:700;color:#065f46;margin:0 0 12px;font-size:15px;">✅ Your Getting Started Checklist</h6>
            <ul class="gs-checklist">
              <li><i class="fas ${userProgress >= 14 ? 'fa-check-circle' : 'fa-circle'}"></i> Create account & verify email</li>
              <li><i class="fas ${userProgress >= 28 ? 'fa-check-circle' : 'fa-circle'}"></i> Complete company profile with logo</li>
              <li><i class="fas ${userProgress >= 42 ? 'fa-check-circle' : 'fa-circle'}"></i> Connect WhatsApp (Cloud API recommended)</li>
              <li><i class="fas ${userProgress >= 57 ? 'fa-check-circle' : 'fa-circle'}"></i> Import first batch of contacts</li>
              <li><i class="fas ${userProgress >= 71 ? 'fa-check-circle' : 'fa-circle'}"></i> Customize your pipeline stages</li>
              <li><i class="fas ${userProgress >= 85 ? 'fa-check-circle' : 'fa-circle'}"></i> Send your first campaign (test to yourself first!)</li>
              <li><i class="fas ${userProgress >= 100 ? 'fa-check-circle' : 'fa-circle'}"></i> Review analytics & celebrate 🎉</li>
            </ul>
          </div>

          <!-- Section 8: Related Guides -->
          <h5 style="font-weight:700;margin-top:32px;color:#0f172a;">🔗 Continue Your Learning</h5>
          <p style="color:#64748b;font-size:13px;margin:4px 0 12px;">Now that you understand the platform, dive deeper into these core modules:</p>
          <div class="gs-related">
            <span class="gs-related-pill" onclick="PlatformDocs.openGuide('dashboard')">📊 Dashboard Overview</span>
            <span class="gs-related-pill" onclick="PlatformDocs.openGuide('leads')">🎯 Managing Leads</span>
            <span class="gs-related-pill" onclick="PlatformDocs.openGuide('campaigns')">📨 Campaign Creation</span>
            <span class="gs-related-pill" onclick="PlatformDocs.openGuide('chats')">💬 WhatsApp Chat Setup</span>
            <span class="gs-related-pill" onclick="PlatformDocs.openGuide('kanban')">📋 Kanban Pipeline</span>
            <span class="gs-related-pill" onclick="PlatformDocs.openGuide('analytics')">📈 Analytics & Reports</span>
          </div>
        </div>

        <!-- Upsell -->
        <div class="gs-upsell">
          <div>
            <h5>🚀 Ready to Unlock the Full Platform?</h5>
            <p>You've seen what's possible. Upgrade to Pro for unlimited campaigns, AI chatbots, advanced automation, white-label options, and 24/7 priority support.</p>
          </div>
          <button class="gs-btn gs-btn-primary" onclick="Plan.render()"><i class="fas fa-crown"></i> Upgrade to Pro</button>
        </div>

        <!-- Navigation -->
        <div class="gs-nav-btns">
          <div>${prevGuide ? `<button class="gs-btn gs-btn-outline" onclick="PlatformDocs.openGuide('${prevGuide.id}')"><i class="fas fa-arrow-left"></i> Previous: ${prevGuide.title}</button>` : ''}</div>
          <div>${nextGuide ? `<button class="gs-btn gs-btn-primary" onclick="PlatformDocs.openGuide('${nextGuide.id}')">Next: ${nextGuide.title} <i class="fas fa-arrow-right"></i></button>` : ''}</div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
    contentArea.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  triggerComplete() {
    PlatformDocs.markComplete('getting-started');
    PlatformDocs.currentGuide = 'getting-started';
    PlatformDocs.render();
    if (typeof showToast === 'function') showToast('✅ Guide completed! Great job!', 'success');
  },

  async markInProgress() {
    try {
      if (!window.currentUser?.uid) return;
      const docRef = db.collection('user_progress').doc(window.currentUser.uid);
      const doc = await docRef.get();
      let platformGuides = {};
      if (doc.exists && doc.data().platformGuides) platformGuides = doc.data().platformGuides;
      if (!platformGuides['getting-started'] || platformGuides['getting-started'] < 10) {
        platformGuides['getting-started'] = 10;
        await docRef.set({ platformGuides, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    } catch (e) { console.error('Progress error:', e); }
  }
};
window.GettingStartedGuide = GettingStartedGuide;
