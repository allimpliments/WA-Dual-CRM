// js/knowledge/platform.js — Platform Documentation Card (List View + Routing)
const PlatformDocs = {
  currentView: 'list', // 'list' | 'guide'
  currentGuide: null,
  searchQuery: '',
  filterLevel: 'all',
  userProgress: {},
  bookmarkedGuides: [],

  // Guide metadata ONLY — NO CONTENT (content lives in guides/*.js)
  guides: [
    {
      id: 'getting-started',
      title: 'Getting Started Guide',
      slug: 'getting-started-with-crm',
      icon: 'fa-rocket',
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      desc: 'Complete walkthrough from login to launching your first campaign — everything a new user needs in one place.',
      level: 'beginner',
      timeToRead: '8 min',
      tags: ['onboarding', 'setup', 'basics'],
      seoTitle: 'Getting Started with CRM — Complete Beginner Guide 2026',
      seoDesc: 'Learn how to set up your CRM account, navigate the dashboard, and launch your first campaign. Step-by-step guide with screenshots.',
      featured: true
    },
    {
      id: 'dashboard',
      title: 'Dashboard Overview',
      slug: 'dashboard-overview-guide',
      icon: 'fa-tachometer-alt',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      desc: 'Master your command center — understand every widget, KPI card, quick action button, and customization option on your dashboard.',
      level: 'beginner',
      timeToRead: '6 min',
      tags: ['dashboard', 'analytics', 'kpi'],
      seoTitle: 'CRM Dashboard Overview — Master Your Command Center',
      seoDesc: 'Complete walkthrough of every dashboard widget, KPI metric, and quick action. Learn to customize your CRM dashboard for maximum productivity.'
    },
    {
      id: 'leads',
      title: 'Managing Leads',
      slug: 'lead-management-guide',
      icon: 'fa-funnel-dollar',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      desc: 'Complete lead lifecycle — capture, qualify, track, nurture, and convert. Master the pipeline that drives revenue.',
      level: 'intermediate',
      timeToRead: '10 min',
      tags: ['leads', 'pipeline', 'conversion', 'sales'],
      seoTitle: 'Lead Management Guide — Capture, Track & Convert More Leads',
      seoDesc: 'Master lead management: from capture forms to pipeline tracking. Learn lead scoring, auto-assignment, and conversion optimization strategies.'
    },
    {
      id: 'contacts',
      title: 'Contacts Management',
      slug: 'contacts-management-guide',
      icon: 'fa-address-book',
      color: '#06b6d4',
      gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      desc: 'Import, organize, segment, and enrich your contact database. Turn contacts into loyal customers.',
      level: 'beginner',
      timeToRead: '7 min',
      tags: ['contacts', 'segmentation', 'import', 'database'],
      seoTitle: 'Contacts Management — Organize & Segment Your Database',
      seoDesc: 'Learn to import contacts, create segments, add custom fields, and manage your CRM database like a pro. Tips for data hygiene.'
    },
    {
      id: 'chats',
      title: 'WhatsApp Chat Setup',
      slug: 'whatsapp-chat-setup-guide',
      icon: 'fa-whatsapp',
      color: '#25D366',
      gradient: 'linear-gradient(135deg, #25D366, #128C7E)',
      desc: 'Connect WhatsApp API, manage live chat, use quick replies, and handle multiple conversations seamlessly.',
      level: 'intermediate',
      timeToRead: '9 min',
      tags: ['whatsapp', 'chat', 'live-chat', 'messaging'],
      seoTitle: 'WhatsApp Chat Setup — Connect API & Manage Conversations',
      seoDesc: 'Step-by-step guide to connect WhatsApp Business API, set up live chat, use quick replies, and manage multiple agents on one number.'
    },
    {
      id: 'campaigns',
      title: 'Campaign Creation',
      slug: 'campaign-creation-guide',
      icon: 'fa-bullhorn',
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
      desc: 'Create bulk & drip campaigns with segmentation, scheduling, and A/B testing for maximum conversions.',
      level: 'intermediate',
      timeToRead: '11 min',
      tags: ['campaigns', 'broadcast', 'drip', 'marketing'],
      seoTitle: 'Campaign Creation Guide — Bulk & Drip Campaigns That Convert',
      seoDesc: 'Master campaign creation: bulk broadcasts, drip sequences, A/B testing, and performance optimization. Step-by-step with templates.'
    },
    {
      id: 'templates-flows',
      title: 'Templates & Flows',
      slug: 'templates-and-flows-guide',
      icon: 'fa-sitemap',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      desc: 'Create reusable message templates and visual automation flows for consistent, scalable communication.',
      level: 'advanced',
      timeToRead: '12 min',
      tags: ['templates', 'automation', 'flows', 'workflow'],
      seoTitle: 'Templates & Automation Flows — Scale Your Communication',
      seoDesc: 'Build reusable message templates and visual automation flows. Learn to create trigger-based workflows that save hours daily.'
    },
    {
      id: 'kanban',
      title: 'Kanban Pipeline',
      slug: 'kanban-pipeline-guide',
      icon: 'fa-columns',
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
      desc: 'Visual sales pipeline with drag-and-drop. Manage deals, track progress, and forecast revenue.',
      level: 'beginner',
      timeToRead: '5 min',
      tags: ['kanban', 'pipeline', 'deals', 'sales'],
      seoTitle: 'Kanban Pipeline Guide — Visual Sales Management',
      seoDesc: 'Master the Kanban board: drag-and-drop deals, customize pipeline stages, and forecast revenue with visual clarity.'
    },
    {
      id: 'social',
      title: 'Social Media Connect',
      slug: 'social-media-connect-guide',
      icon: 'fa-share-alt',
      color: '#0ea5e9',
      gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
      desc: 'Connect Instagram, Facebook, LinkedIn, and more. Manage all social conversations from one inbox.',
      level: 'intermediate',
      timeToRead: '8 min',
      tags: ['social-media', 'instagram', 'facebook', 'integration'],
      seoTitle: 'Social Media Connect Guide — Unified Social Inbox',
      seoDesc: 'Connect all social platforms to your CRM. Manage Instagram DMs, Facebook comments, and LinkedIn messages from one unified inbox.'
    },
    {
      id: 'forms',
      title: 'Form Builder',
      slug: 'form-builder-guide',
      icon: 'fa-wpforms',
      color: '#a855f7',
      gradient: 'linear-gradient(135deg, #a855f7, #9333ea)',
      desc: 'Create lead capture forms with drag-and-drop. Embed on your website or share as a link.',
      level: 'beginner',
      timeToRead: '7 min',
      tags: ['forms', 'lead-capture', 'landing-page', 'embed'],
      seoTitle: 'Form Builder Guide — Create High-Converting Lead Forms',
      seoDesc: 'Build beautiful lead capture forms with drag-and-drop. Embed on websites, share as links, or use as pop-ups. No coding required.'
    },
    {
      id: 'chatbot',
      title: 'AI Chatbot Setup',
      slug: 'ai-chatbot-setup-guide',
      icon: 'fa-robot',
      color: '#14b8a6',
      gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)',
      desc: 'Configure AI-powered auto-replies using ChatGPT, Groq, and Gemini. Provide 24/7 support without human agents.',
      level: 'advanced',
      timeToRead: '10 min',
      tags: ['ai', 'chatbot', 'automation', 'support'],
      seoTitle: 'AI Chatbot Setup Guide — 24/7 Automated Customer Support',
      seoDesc: 'Build AI chatbots with ChatGPT, Groq & Gemini. Handle FAQs, qualify leads, and book appointments automatically.'
    },
    {
      id: 'ecommerce',
      title: 'E‑commerce Integration',
      slug: 'ecommerce-integration-guide',
      icon: 'fa-shopping-cart',
      color: '#f97316',
      gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
      desc: 'Connect Shopify, WooCommerce, and other platforms. Sync orders, track abandoned carts, and automate follow-ups.',
      level: 'advanced',
      timeToRead: '9 min',
      tags: ['ecommerce', 'shopify', 'woocommerce', 'orders'],
      seoTitle: 'E‑commerce Integration Guide — Sync Orders & Automate Follow-ups',
      seoDesc: 'Connect your e-commerce store to the CRM. Sync orders, recover abandoned carts, and automate WhatsApp order updates.'
    },
    {
      id: 'appointments',
      title: 'Appointment System',
      slug: 'appointment-system-guide',
      icon: 'fa-calendar-check',
      color: '#84cc16',
      gradient: 'linear-gradient(135deg, #84cc16, #65a30d)',
      desc: 'Book and manage appointments with customers. Sync with Google Calendar and send automatic reminders.',
      level: 'beginner',
      timeToRead: '6 min',
      tags: ['appointments', 'calendar', 'scheduling', 'reminders'],
      seoTitle: 'Appointment System Guide — Book & Manage Meetings',
      seoDesc: 'Set up appointment booking, sync with Google Calendar, and automate reminders via WhatsApp. Reduce no-shows by 70%.'
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      slug: 'analytics-reports-guide',
      icon: 'fa-chart-pie',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      desc: 'Comprehensive analytics — track campaigns, agent performance, revenue, and customer behavior.',
      level: 'intermediate',
      timeToRead: '10 min',
      tags: ['analytics', 'reports', 'metrics', 'data'],
      seoTitle: 'Analytics & Reports Guide — Data-Driven Decision Making',
      seoDesc: 'Master CRM analytics: campaign reports, agent performance, revenue tracking, and custom dashboards. Export and share insights.'
    },
    {
      id: 'integrations',
      title: 'Integrations Hub',
      slug: 'integrations-hub-guide',
      icon: 'fa-puzzle-piece',
      color: '#7c3aed',
      gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
      desc: 'Connect 30+ third-party tools — payment gateways, email platforms, accounting software, and more.',
      level: 'advanced',
      timeToRead: '8 min',
      tags: ['integrations', 'api', 'webhooks', 'connectors'],
      seoTitle: 'Integrations Hub Guide — Connect 30+ Tools',
      seoDesc: 'Connect your CRM with payment gateways, email tools, accounting software, and more. Includes webhook and API documentation.'
    },
    {
      id: 'agents',
      title: 'Team & Agent Management',
      slug: 'team-agent-management-guide',
      icon: 'fa-user-tie',
      color: '#0f766e',
      gradient: 'linear-gradient(135deg, #0f766e, #115e59)',
      desc: 'Invite team members, assign roles and permissions, and manage agent workloads.',
      level: 'intermediate',
      timeToRead: '7 min',
      tags: ['team', 'agents', 'roles', 'permissions'],
      seoTitle: 'Team & Agent Management Guide — Roles & Permissions',
      seoDesc: 'Manage your sales team: invite agents, set roles and permissions, track performance, and optimize workloads.'
    },
    {
      id: 'clients',
      title: 'Client Management',
      slug: 'client-management-guide',
      icon: 'fa-building',
      color: '#1e40af',
      gradient: 'linear-gradient(135deg, #1e40af, #1e3a8a)',
      desc: 'Onboard and manage multiple clients if you\'re an agency. Each client gets their own workspace.',
      level: 'advanced',
      timeToRead: '8 min',
      tags: ['agency', 'clients', 'multi-tenant', 'white-label'],
      seoTitle: 'Client Management Guide — Multi-Client Agency Dashboard',
      seoDesc: 'Perfect for agencies: manage multiple clients with separate workspaces, white-label options, and consolidated reporting.'
    },
    {
      id: 'tickets',
      title: 'Ticket System',
      slug: 'ticket-system-guide',
      icon: 'fa-headset',
      color: '#dc2626',
      gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)',
      desc: 'Customer support ticketing system. Create, assign, prioritize, and resolve support tickets efficiently.',
      level: 'beginner',
      timeToRead: '6 min',
      tags: ['support', 'tickets', 'customer-service', 'helpdesk'],
      seoTitle: 'Ticket System Guide — Customer Support Management',
      seoDesc: 'Set up a professional helpdesk: ticket creation, auto-assignment, SLA tracking, and customer satisfaction measurement.'
    },
    {
      id: 'settings',
      title: 'Settings & Profile',
      slug: 'settings-profile-guide',
      icon: 'fa-cog',
      color: '#64748b',
      gradient: 'linear-gradient(135deg, #64748b, #475569)',
      desc: 'Configure your company profile, pipeline stages, notification preferences, and security settings.',
      level: 'beginner',
      timeToRead: '8 min',
      tags: ['settings', 'configuration', 'profile', 'security'],
      seoTitle: 'Settings & Profile Guide — Configure Your CRM',
      seoDesc: 'Complete settings walkthrough: company profile, pipeline customization, notification preferences, security, and data management.'
    },
    {
      id: 'plans',
      title: 'Subscription & Plans',
      slug: 'subscription-plans-guide',
      icon: 'fa-credit-card',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      desc: 'Understand pricing plans, upgrade/downgrade, billing, invoices, and payment methods.',
      level: 'beginner',
      timeToRead: '5 min',
      tags: ['pricing', 'billing', 'subscription', 'plans'],
      seoTitle: 'Subscription & Plans Guide — Choose the Right Plan',
      seoDesc: 'Compare CRM plans, understand features, manage billing, and upgrade when your business grows.'
    }
  ],

  // Map guide ID to global variable name for script tag loading
  guideGlobalNames: {
    'getting-started': 'GettingStartedGuide',
    'dashboard': 'DashboardGuide',
    'leads': 'LeadsGuide',
    'contacts': 'ContactsGuide',
    'chats': 'ChatsGuide',
    'campaigns': 'CampaignsGuide',
    'templates-flows': 'TemplatesFlowsGuide',
    'kanban': 'KanbanGuide',
    'social': 'SocialGuide',
    'forms': 'FormsGuide',
    'chatbot': 'ChatbotGuide',
    'ecommerce': 'EcommerceGuide',
    'appointments': 'AppointmentsGuide',
    'analytics': 'AnalyticsGuide',
    'integrations': 'IntegrationsGuide',
    'agents': 'AgentsGuide',
    'clients': 'ClientsGuide',
    'tickets': 'TicketsGuide',
    'settings': 'SettingsGuide',
    'plans': 'PlansGuide'
  },

  // ==================== RENDER: MAIN ENTRY POINT ====================
  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = '#f8fafc';

    if (this.currentGuide) {
      await this.loadGuideContent(this.currentGuide);
      return;
    }
    await this.loadUserProgress();
    await this.renderGuideList();
  },

  // ==================== RENDER: GUIDE LIST VIEW ====================
  async renderGuideList() {
    const levels = ['all', 'beginner', 'intermediate', 'advanced'];
    const levelLabels = { 
      all: 'All Levels', 
      beginner: '🟢 Beginner', 
      intermediate: '🟡 Intermediate', 
      advanced: '🔴 Advanced' 
    };

    let filteredGuides = this.guides;
    
    // Apply search filter
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filteredGuides = filteredGuides.filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.desc.toLowerCase().includes(q) ||
        g.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    
    // Apply level filter
    if (this.filterLevel !== 'all') {
      filteredGuides = filteredGuides.filter(g => g.level === this.filterLevel);
    }

    // Count stats
    const totalGuides = this.guides.length;
    const beginnerCount = this.guides.filter(g => g.level === 'beginner').length;
    const intermediateCount = this.guides.filter(g => g.level === 'intermediate').length;
    const advancedCount = this.guides.filter(g => g.level === 'advanced').length;
    const completedCount = Object.values(this.userProgress).filter(v => v >= 100).length;

    let html = `
      <style>
        .pd-wrap { max-width: 1400px; margin: 0 auto; padding: 0 16px; }
        
        /* Hero Section */
        .pd-hero { 
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 100%); 
          border-radius: 24px; 
          padding: 40px 36px; 
          margin-bottom: 28px; 
          color: #fff; 
          position: relative; 
          overflow: hidden; 
        }
        .pd-hero::before { 
          content: ''; 
          position: absolute; 
          top: -120px; 
          right: -80px; 
          width: 450px; 
          height: 450px; 
          background: radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 60%); 
          border-radius: 50%; 
        }
        .pd-hero::after { 
          content: ''; 
          position: absolute; 
          bottom: -80px; 
          left: 15%; 
          width: 350px; 
          height: 350px; 
          background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 60%); 
          border-radius: 50%; 
        }
        .pd-hero h3 { 
          font-size: 32px; 
          font-weight: 900; 
          margin: 0 0 8px; 
          position: relative; 
          z-index: 1; 
        }
        .pd-hero p { 
          font-size: 15px; 
          color: #cbd5e1; 
          margin: 0; 
          position: relative; 
          z-index: 1; 
          max-width: 650px; 
          line-height: 1.6;
        }
        .pd-hero-stats { 
          display: flex; 
          gap: 28px; 
          margin-top: 20px; 
          position: relative; 
          z-index: 1; 
          flex-wrap: wrap; 
        }
        .pd-hero-stat { 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          font-size: 14px; 
          color: #e2e8f0; 
        }
        .pd-hero-stat i { 
          color: #f59e0b; 
          font-size: 16px; 
        }
        .pd-hero-stat .val { 
          font-weight: 800; 
          color: #fff; 
          font-size: 16px; 
        }
        
        /* Back Button */
        .pd-back-row { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          margin-bottom: 20px; 
        }
        .pd-back-btn { 
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
        .pd-back-btn:hover { 
          background: #f1f5f9; 
          border-color: #cbd5e1; 
        }
        
        /* Filters */
        .pd-filters { 
          display: flex; 
          gap: 8px; 
          margin-bottom: 20px; 
          flex-wrap: wrap; 
          align-items: center; 
        }
        .pd-search { 
          padding: 10px 16px; 
          border: 1px solid #e2e8f0; 
          border-radius: 12px; 
          font-size: 13px; 
          width: 280px; 
          outline: none; 
          background: #fff; 
          transition: 0.2s; 
        }
        .pd-search:focus { 
          border-color: #f59e0b; 
          box-shadow: 0 0 0 3px rgba(245,158,11,0.1); 
        }
        .pd-filter-pill { 
          padding: 8px 16px; 
          border-radius: 20px; 
          font-size: 12px; 
          cursor: pointer; 
          border: 1px solid #e2e8f0; 
          background: #fff; 
          color: #475569; 
          font-weight: 500; 
          transition: all 0.2s; 
          white-space: nowrap; 
        }
        .pd-filter-pill:hover, 
        .pd-filter-pill.active { 
          background: #f59e0b; 
          color: #fff; 
          border-color: #f59e0b; 
        }
        .pd-filter-count { 
          margin-left: auto; 
          font-size: 12px; 
          color: #94a3b8; 
        }
        
        /* Guide Cards Grid */
        .pd-guide-card { 
          background: #fff; 
          border-radius: 18px; 
          padding: 24px 22px; 
          border: 1px solid #f1f5f9; 
          transition: all 0.25s; 
          cursor: pointer; 
          position: relative; 
          overflow: hidden; 
          height: 100%; 
          display: flex; 
          flex-direction: column; 
        }
        .pd-guide-card:hover { 
          transform: translateY(-4px); 
          box-shadow: 0 16px 40px rgba(0,0,0,0.08); 
          border-color: #6366f1; 
        }
        .pd-guide-card::before { 
          content: ''; 
          position: absolute; 
          top: 0; 
          left: 0; 
          right: 0; 
          height: 4px; 
          background: var(--card-gradient); 
        }
        .pd-guide-card.featured { 
          border: 2px solid #f59e0b; 
          box-shadow: 0 8px 30px rgba(245,158,11,0.12); 
          background: linear-gradient(135deg, #fff 0%, #fffbeb 100%); 
        }
        .pd-guide-card.featured::before { 
          height: 5px; 
          background: linear-gradient(90deg, #f59e0b, #d97706, #f59e0b); 
        }
        .pd-guide-card.featured::after { 
          content: '⭐ START HERE'; 
          position: absolute; 
          top: 14px; 
          right: 14px; 
          background: #f59e0b; 
          color: #fff; 
          padding: 4px 12px; 
          border-radius: 20px; 
          font-size: 10px; 
          font-weight: 700; 
          letter-spacing: 0.5px; 
        }
        .pd-guide-icon { 
          width: 48px; 
          height: 48px; 
          border-radius: 14px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 20px; 
          color: #fff; 
          margin-bottom: 14px; 
          flex-shrink: 0; 
        }
        .pd-guide-card h6 { 
          font-weight: 700; 
          font-size: 15px; 
          margin: 0 0 6px; 
          color: #0f172a; 
          line-height: 1.4;
        }
        .pd-guide-card p { 
          font-size: 12px; 
          color: #64748b; 
          margin: 0; 
          flex: 1; 
          line-height: 1.6; 
        }
        .pd-guide-meta { 
          display: flex; 
          gap: 6px; 
          margin-top: 14px; 
          flex-wrap: wrap; 
          align-items: center; 
        }
        .pd-badge { 
          display: inline-block; 
          padding: 4px 10px; 
          border-radius: 20px; 
          font-size: 10px; 
          font-weight: 600; 
        }
        .pd-progress-mini { 
          height: 3px; 
          border-radius: 3px; 
          background: #f1f5f9; 
          margin-top: 10px; 
          overflow: hidden; 
        }
        .pd-progress-fill-mini { 
          height: 100%; 
          border-radius: 3px; 
          background: #10b981; 
          transition: width 0.5s ease; 
        }
        .pd-bookmark { 
          position: absolute; 
          top: 14px; 
          right: 14px; 
          font-size: 16px; 
          color: #d1d5db; 
          transition: 0.2s; 
          z-index: 2; 
          cursor: pointer; 
        }
        .pd-guide-card.featured .pd-bookmark { 
          right: 100px; 
        }
        .pd-bookmark:hover, 
        .pd-bookmark.bookmarked { 
          color: #f59e0b; 
        }
        
        /* Progress Summary */
        .pd-progress-card { 
          background: #fff; 
          border-radius: 18px; 
          padding: 22px 24px; 
          margin-bottom: 24px; 
          border: 1px solid #f1f5f9; 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          flex-wrap: wrap; 
          gap: 16px; 
        }
        .pd-progress-info h5 { 
          font-weight: 700; 
          margin: 0; 
          color: #0f172a; 
          font-size: 16px; 
        }
        .pd-progress-info p { 
          margin: 2px 0 0; 
          font-size: 13px; 
          color: #64748b; 
        }
        .pd-progress-bar-lg { 
          flex: 1; 
          min-width: 200px; 
          height: 10px; 
          border-radius: 10px; 
          background: #f1f5f9; 
          overflow: hidden; 
        }
        .pd-progress-fill-lg { 
          height: 100%; 
          border-radius: 10px; 
          background: linear-gradient(90deg, #10b981, #059669); 
          transition: width 0.6s ease; 
        }
        .pd-progress-pct { 
          font-weight: 800; 
          font-size: 18px; 
          color: #10b981; 
        }
        
        /* CTA Banner */
        .pd-cta-banner { 
          background: linear-gradient(135deg, #eef2ff, #faf5ff); 
          border-radius: 20px; 
          padding: 28px 32px; 
          margin-top: 32px; 
          border: 1px solid #c7d2fe; 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          flex-wrap: wrap; 
          gap: 16px; 
        }
        .pd-cta-banner h5 { 
          font-weight: 800; 
          color: #3730a3; 
          margin: 0; 
        }
        .pd-cta-banner p { 
          color: #4f46e5; 
          margin: 4px 0 0; 
          font-size: 13px; 
        }
        .pd-btn { 
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
          text-decoration: none; 
        }
        .pd-btn-primary { 
          background: #6366f1; 
          color: #fff; 
        }
        .pd-btn-primary:hover { 
          background: #4f46e5; 
          transform: scale(1.03); 
        }
        .pd-btn-outline { 
          background: #fff; 
          color: #6366f1; 
          border: 1px solid #6366f1; 
        }
        .pd-btn-outline:hover { 
          background: #eef2ff; 
        }
        .pd-btn-warning { 
          background: #f59e0b; 
          color: #fff; 
        }
        .pd-btn-warning:hover { 
          background: #d97706; 
        }
        
        /* Empty State */
        .pd-empty { 
          text-align: center; 
          padding: 60px 20px; 
        }
        .pd-empty i { 
          opacity: 0.25; 
        }
        .pd-empty h5 { 
          font-weight: 700; 
          margin-top: 16px; 
          color: #0f172a; 
        }
        .pd-empty p { 
          color: #64748b; 
          font-size: 14px; 
        }
        
        @media (max-width: 768px) {
          .pd-hero { 
            padding: 24px 18px; 
          }
          .pd-hero h3 { 
            font-size: 22px; 
          }
          .pd-hero-stats { 
            gap: 14px; 
          }
          .pd-search { 
            width: 100%; 
          }
          .pd-guide-card.featured::after { 
            top: 10px; 
            right: 10px; 
            font-size: 9px; 
            padding: 3px 10px; 
          }
          .pd-guide-card.featured .pd-bookmark { 
            right: 85px; 
          }
          .pd-cta-banner { 
            flex-direction: column; 
            text-align: center; 
          }
        }
      </style>

      <div class="pd-wrap">
        <!-- Back Button -->
        <div class="pd-back-row">
          <button class="pd-back-btn" onclick="Knowledge.currentSubTab=null;Knowledge.render();">
            <i class="fas fa-arrow-left"></i> Back to Knowledge Hub
          </button>
        </div>

        <!-- Hero -->
        <div class="pd-hero">
          <h3>📖 Platform Documentation</h3>
          <p>Complete guides for every feature of the CRM. From absolute beginner to advanced automation — everything you need to become a CRM expert and scale your business.</p>
          <div class="pd-hero-stats">
            <div class="pd-hero-stat">
              <i class="fas fa-book"></i> 
              <span class="val">${totalGuides}</span> In-Depth Guides
            </div>
            <div class="pd-hero-stat">
              <i class="fas fa-clock"></i> 
              <span class="val">160+</span> Min Total Reading
            </div>
            <div class="pd-hero-stat">
              <i class="fas fa-layer-group"></i> 
              <span class="val">${beginnerCount}</span> Beginner · 
              <span class="val">${intermediateCount}</span> Intermediate · 
              <span class="val">${advancedCount}</span> Advanced
            </div>
            <div class="pd-hero-stat">
              <i class="fas fa-check-circle"></i> 
              <span class="val">${completedCount}</span> Completed
            </div>
          </div>
        </div>

        <!-- Progress Summary -->
        ${completedCount > 0 ? `
        <div class="pd-progress-card">
          <div class="pd-progress-info">
            <h5>📊 Your Learning Progress</h5>
            <p>${completedCount} of ${totalGuides} guides completed</p>
          </div>
          <div class="pd-progress-bar-lg">
            <div class="pd-progress-fill-lg" style="width:${Math.round((completedCount/totalGuides)*100)}%;"></div>
          </div>
          <div class="pd-progress-pct">${Math.round((completedCount/totalGuides)*100)}%</div>
        </div>
        ` : ''}

        <!-- Filters -->
        <div class="pd-filters">
          <input type="text" class="pd-search" placeholder="🔍 Search guides (e.g., WhatsApp, leads, automation)..." 
                 id="pdSearch" value="${this.searchQuery}" 
                 oninput="PlatformDocs.searchQuery=this.value;PlatformDocs.render();">
          ${levels.map(l => `
            <button class="pd-filter-pill ${this.filterLevel === l ? 'active' : ''}" 
                    onclick="PlatformDocs.filterLevel='${l}';PlatformDocs.render();">
              ${levelLabels[l]}
            </button>
          `).join('')}
          <span class="pd-filter-count">
            Showing ${filteredGuides.length} of ${totalGuides} guides
          </span>
        </div>

        <!-- Guide Cards Grid -->
        ${filteredGuides.length > 0 ? `
        <div class="row g-3">
          ${filteredGuides.map(g => {
            const progress = this.userProgress[g.id] || 0;
            const isBookmarked = this.bookmarkedGuides.includes(g.id);
            return `
            <div class="${g.featured ? 'col-12' : 'col-lg-4 col-md-6'}">
              <div class="pd-guide-card ${g.featured ? 'featured' : ''}" 
                   style="--card-gradient:${g.gradient};" 
                   onclick="PlatformDocs.openGuide('${g.id}')">
                
                ${!g.featured ? `
                <span class="pd-bookmark ${isBookmarked ? 'bookmarked' : ''}" 
                      onclick="event.stopPropagation();PlatformDocs.toggleBookmark('${g.id}');" 
                      title="${isBookmarked ? 'Remove bookmark' : 'Bookmark this guide'}">
                  <i class="fas fa-star"></i>
                </span>
                ` : `
                <span class="pd-bookmark ${isBookmarked ? 'bookmarked' : ''}" 
                      onclick="event.stopPropagation();PlatformDocs.toggleBookmark('${g.id}');" 
                      title="${isBookmarked ? 'Remove bookmark' : 'Bookmark this guide'}">
                  <i class="fas fa-star"></i>
                </span>
                `}
                
                <div class="pd-guide-icon" style="background:${g.gradient};">
                  <i class="fas ${g.icon}"></i>
                </div>
                <h6>${g.title}</h6>
                <p>${g.desc}</p>
                <div class="pd-guide-meta">
                  <span class="pd-badge" style="background:${g.level === 'beginner' ? '#ecfdf5' : g.level === 'intermediate' ? '#fef3c7' : '#fce7f3'};color:${g.level === 'beginner' ? '#065f46' : g.level === 'intermediate' ? '#92400e' : '#9d174d'};">
                    ${g.level === 'beginner' ? '🟢' : g.level === 'intermediate' ? '🟡' : '🔴'} ${g.level}
                  </span>
                  <span class="pd-badge" style="background:#f8fafc;color:#64748b;">
                    ⏱ ${g.timeToRead}
                  </span>
                  ${progress > 0 ? `<span class="pd-badge" style="background:#ecfdf5;color:#10b981;">${progress}% done</span>` : ''}
                </div>
                ${progress > 0 ? `
                <div class="pd-progress-mini">
                  <div class="pd-progress-fill-mini" style="width:${progress}%;"></div>
                </div>
                ` : ''}
              </div>
            </div>`;
          }).join('')}
        </div>
        ` : `
        <!-- Empty State -->
        <div class="pd-empty">
          <i class="fas fa-search fa-4x" style="color:#94a3b8;"></i>
          <h5>No guides found</h5>
          <p>Try a different search term or filter level.</p>
          <button class="pd-btn pd-btn-outline mt-3" onclick="PlatformDocs.searchQuery='';PlatformDocs.filterLevel='all';PlatformDocs.render();">
            <i class="fas fa-redo"></i> Clear Filters
          </button>
        </div>
        `}

        <!-- CTA Banner -->
        <div class="pd-cta-banner">
          <div>
            <h5>🎯 Want to Master This CRM?</h5>
            <p>Bookmark guides, track your progress, and earn a completion certificate when you finish all 20 guides.</p>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button class="pd-btn pd-btn-warning" onclick="PlatformDocs.startLearningPath()">
              <i class="fas fa-play-circle"></i> Start Learning Path
            </button>
            <button class="pd-btn pd-btn-primary" onclick="Plan.render()">
              <i class="fas fa-crown"></i> Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    `;

    contentArea.innerHTML = html;
  },

  // ==================== OPEN INDIVIDUAL GUIDE ====================
  openGuide(guideId) {
    const guide = this.guides.find(g => g.id === guideId);
    if (!guide) {
      if (typeof showToast === 'function') {
        showToast('Guide not found!', 'error');
      }
      return;
    }
    this.currentGuide = guideId;
    this.render();
  },

  // ==================== FIXED: Load external JS file helper ====================
  loadScript(src) {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) { resolve(); return; }
      // Create and append script tag
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  },

  // ==================== FIXED: LOAD INDIVIDUAL GUIDE FILE (script tag approach) ====================
  async loadGuideContent(guideId) {
    const guide = this.guides.find(g => g.id === guideId);
    if (!guide) {
      this.currentGuide = null;
      this.render();
      return;
    }

    try {
      const globalName = this.guideGlobalNames[guideId];
      const guidePath = `js/knowledge/guides/${guideId}.js`;

      // Load the guide file if not already loaded
      if (typeof window[globalName] === 'undefined') {
        await this.loadScript(guidePath);
      }

      // Get the guide module from global scope
      const guideModule = window[globalName];

      if (guideModule && typeof guideModule.render === 'function') {
        // Mark as in-progress on first view
        if (!this.userProgress[guideId] || this.userProgress[guideId] < 10) {
          this.userProgress[guideId] = 10;
          await this.saveUserProgress();
        }

        // Pass context to the guide module
        guideModule.render({
          guide: guide,
          userProgress: this.userProgress[guideId] || 0,
          isBookmarked: this.bookmarkedGuides.includes(guideId),
          onBack: () => {
            this.currentGuide = null;
            this.render();
          },
          onComplete: async () => {
            await this.markComplete(guideId);
            // Re-render guide with updated progress
            this.loadGuideContent(guideId);
          },
          onBookmark: () => {
            this.toggleBookmark(guideId);
            // Re-render guide with updated bookmark state
            this.loadGuideContent(guideId);
          },
          onNavigate: (nextGuideId) => {
            this.openGuide(nextGuideId);
          },
          getAdjacentGuide: (direction) => this.getAdjacentGuide(guideId, direction),
          allGuides: this.guides
        });
      } else {
        throw new Error(`Guide module "${globalName}" not found or missing render() method`);
      }
    } catch (error) {
      console.error('Error loading guide:', error);
      // Fallback if guide file doesn't exist yet
      this.renderGuideFallback(guide);
    }
  },

  // ==================== FALLBACK RENDER (if guide file missing) ====================
  renderGuideFallback(guide) {
    let html = `
      <style>
        .gf-wrap { max-width: 900px; margin: 0 auto; padding: 0 16px; }
        .gf-back-row { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .gf-back-btn { padding: 8px 16px; border-radius: 10px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid #e2e8f0; background: #fff; color: #475569; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .gf-back-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }
        .gf-card { background: #fff; border-radius: 20px; padding: 60px 30px; text-align: center; border: 1px solid #f1f5f9; }
        .gf-card h4 { font-weight: 800; margin: 16px 0 8px; color: #0f172a; }
        .gf-card p { color: #64748b; font-size: 14px; }
      </style>
      <div class="gf-wrap">
        <div class="gf-back-row">
          <button class="gf-back-btn" onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();">
            <i class="fas fa-arrow-left"></i> Back to All Guides
          </button>
        </div>
        <div class="gf-card">
          <div style="width:64px;height:64px;border-radius:16px;background:${guide.gradient};display:flex;align-items:center;justify-content:center;color:#fff;font-size:26px;margin:0 auto;">
            <i class="fas ${guide.icon}"></i>
          </div>
          <h4>${guide.title}</h4>
          <p>${guide.desc}</p>
          <p style="margin-top:16px;background:#fef3c7;padding:12px 20px;border-radius:12px;display:inline-block;font-size:13px;color:#92400e;">
            ⚠️ This guide content is being created. Check back soon!
          </p>
          <br>
          <button class="gf-back-btn mt-3" onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();" style="margin-top:16px;">
            ← Back to Guide List
          </button>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  // ==================== HELPER FUNCTIONS ====================
  getAdjacentGuide(currentId, direction) {
    const idx = this.guides.findIndex(g => g.id === currentId);
    if (idx === -1) return null;
    if (direction === 'prev' && idx > 0) return this.guides[idx - 1];
    if (direction === 'next' && idx < this.guides.length - 1) return this.guides[idx + 1];
    return null;
  },

  async markComplete(guideId) {
    if ((this.userProgress[guideId] || 0) >= 100) return;
    this.userProgress[guideId] = 100;
    await this.saveUserProgress();
    if (typeof showToast === 'function') {
      showToast('✅ Guide completed! Great job!', 'success');
    }
  },

  toggleBookmark(guideId) {
    const idx = this.bookmarkedGuides.indexOf(guideId);
    if (idx > -1) {
      this.bookmarkedGuides.splice(idx, 1);
    } else {
      this.bookmarkedGuides.push(guideId);
    }
    this.saveBookmarks();
    this.render();
  },

  startLearningPath() {
    const firstBeginner = this.guides.find(g => g.level === 'beginner');
    if (firstBeginner) {
      this.openGuide(firstBeginner.id);
    }
  },

  // ==================== PERSISTENCE (Firestore) ====================
  async loadUserProgress() {
    try {
      if (!window.currentUser?.uid) return;
      const doc = await db.collection('user_progress').doc(window.currentUser.uid).get();
      if (doc.exists) {
        const data = doc.data();
        this.userProgress = data.platformGuides || {};
        this.bookmarkedGuides = data.platformBookmarks || [];
      }
    } catch (e) {
      console.error('Load progress error:', e);
    }
  },

  async saveUserProgress() {
    try {
      if (!window.currentUser?.uid) return;
      await db.collection('user_progress').doc(window.currentUser.uid).set({
        platformGuides: this.userProgress,
        platformBookmarks: this.bookmarkedGuides,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.error('Save progress error:', e);
    }
  },

  async saveBookmarks() {
    await this.saveUserProgress();
  }
};
