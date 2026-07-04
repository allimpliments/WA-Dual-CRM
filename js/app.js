const sidebar = document.getElementById('sidebar');
const contentArea = document.getElementById('contentArea');
const menuToggle = document.getElementById('menuToggle');
const currentSectionTitle = document.getElementById('currentSectionTitle');

const navSections = [
  { title: 'Main', items: [
    { name: 'Dashboard', icon: 'fa-tachometer-alt', section: 'dashboard', roles: ['admin','team','client'] }
  ]},
  { title: 'Setup', items: [
    { name: 'Setup', icon: 'fa-cog', section: 'setup', roles: ['admin'] }
  ]},
  { title: 'Communication', items: [
    { name: 'All Chats', icon: 'fa-comments', section: 'chats', roles: ['admin','team'] },
    { name: 'Leads', icon: 'fa-funnel-dollar', section: 'leads', roles: ['admin','team'] },
    { name: 'Contacts', icon: 'fa-users', section: 'contacts', roles: ['admin','team'] },
    { name: 'Templates', icon: 'fa-layer-group', section: 'templates', roles: ['admin','team'] },
    { name: 'Campaigns', icon: 'fa-rocket', section: 'campaigns', roles: ['admin','team'] },
    { name: 'Flows', icon: 'fa-sitemap', section: 'flows', roles: ['admin','team'] }
  ]},
  { title: 'Social Media', items: [
    { name: 'All Platforms', icon: 'fa-globe', section: 'social', roles: ['admin','team'] }
  ]},
  { title: 'Marketing', items: [
    { name: 'Ads Manager', icon: 'fa-ad', section: 'marketing', roles: ['admin','team'] }
  ]},
  { title: 'Forms', items: [
    { name: 'Form Builder', icon: 'fa-wpforms', section: 'forms', roles: ['admin','team'] }
  ]},
  { title: 'E‑commerce', items: [
    { name: 'E‑commerce', icon: 'fa-store', section: 'ecommerce', roles: ['admin'] }
  ]},
  { title: 'Automation', items: [
    { name: 'Chatbot', icon: 'fa-robot', section: 'chatbot', roles: ['admin','team'] },
    { name: 'Integrations', icon: 'fa-plug', section: 'integrations', roles: ['admin'] }
  ]},
  { title: 'Management', items: [
    { name: 'Agents', icon: 'fa-user-tie', section: 'agents', roles: ['admin'] },
    { name: 'Clients', icon: 'fa-building', section: 'clients', roles: ['admin'] },
    { name: 'Kanban', icon: 'fa-tasks', section: 'kanban', roles: ['admin','team'] }
  ]},
  { title: 'Support', items: [
    { name: 'Tickets', icon: 'fa-ticket-alt', section: 'tickets', roles: ['admin','team'] },
    { name: 'Knowledge engine', icon: 'fa-book', section: 'knowledge', roles: ['admin','team'] }
  ]},
  { title: 'Reports', items: [
    { name: 'Analytics', icon: 'fa-chart-bar', section: 'analytics', roles: ['admin'] },
    { name: 'Reports', icon: 'fa-file-alt', section: 'reports', roles: ['admin'] }
  ]},
  { title: 'Account', items: [
    { name: 'My Plan', icon: 'fa-wallet', section: 'plan', roles: ['admin','team','client'] },
    { name: 'Logout', icon: 'fa-sign-out-alt', action: 'logout', roles: ['admin','team','client'] }
  ]}
];

function buildSidebar(role) {
  let html = '<div class="brand"><i class="fab fa-whatsapp text-success fs-3"></i> Panel</div>';
  navSections.forEach(group => {
    html += `<div class="section-title">${group.title}</div>`;
    group.items.forEach(item => {
      if (item.roles.includes(role)) {
        html += `<div class="nav-item"><a class="nav-link" data-section="${item.section||''}" data-action="${item.action||''}"><i class="fas ${item.icon}"></i> ${item.name}</a></div>`;
      }
    });
  });
  sidebar.innerHTML = html;
  document.querySelectorAll('.sidebar .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      const action = link.dataset.action;
      if (action === 'logout') { auth.signOut(); return; }
      loadSection(section);
      document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      currentSectionTitle.textContent = link.textContent.trim();
    });
  });
}

// ========== HEADER ITEMS ==========
const headerMain = [
  { name: 'Dashboard', icon: 'fa-tachometer-alt', section: 'dashboard' },
  { name: 'Chats', icon: 'fa-comments', section: 'chats' },
  { name: 'Contacts', icon: 'fa-users', section: 'contacts' },
  { name: 'Leads', icon: 'fa-funnel-dollar', section: 'leads' },
  { name: 'Kanban', icon: 'fa-tasks', section: 'kanban' },
  { name: 'Campaigns', icon: 'fa-rocket', section: 'campaigns' },
  { name: 'Flows', icon: 'fa-sitemap', section: 'flows' },
  { name: 'Marketing', icon: 'fa-ad', section: 'marketing' },
  { name: 'E‑commerce', icon: 'fa-store', section: 'ecommerce' },
  { name: 'Social', icon: 'fa-globe', section: 'social' },
  { name: 'Forms', icon: 'fa-wpforms', section: 'forms' },
  { name: 'Templates', icon: 'fa-layer-group', section: 'templates' },
];

const headerMore = [
  { name: 'Chatbot', icon: 'fa-robot', section: 'chatbot' },
  { name: 'Setup', icon: 'fa-cog', section: 'setup' },
  { name: 'Integrations', icon: 'fa-plug', section: 'integrations' },
  { name: 'Agents', icon: 'fa-user-tie', section: 'agents' },
  { name: 'Clients', icon: 'fa-building', section: 'clients' },
  { name: 'Tickets', icon: 'fa-ticket-alt', section: 'tickets' },
  { name: 'Knowledge engine', icon: 'fa-book', section: 'knowledge' },
  { name: 'Analytics', icon: 'fa-chart-bar', section: 'analytics' },
  { name: 'Reports', icon: 'fa-file-alt', section: 'reports' },
  { name: 'Plan', icon: 'fa-wallet', section: 'plan' },
];

// ========== ALL SUB MENUS (CUSTOMIZED PER SECTION) ==========
const sectionSubMenus = {
  'social': [
    { name: 'Facebook', icon: 'fa-facebook', color: '#1877f2', action: `Social.switchTab('facebook')` },
    { name: 'Instagram', icon: 'fa-instagram', color: '#E4405F', action: `Social.switchTab('instagram')` },
    { name: 'Meta Business', icon: 'fa-meta', color: '#0668E1', action: `Social.switchTab('meta')` },
    { name: 'LinkedIn', icon: 'fa-linkedin', color: '#0A66C2', action: `Social.switchTab('linkedin')` },
    { name: 'Twitter/X', icon: 'fa-twitter', color: '#1DA1F2', action: `Social.switchTab('twitter')` },
    { name: 'YouTube', icon: 'fa-youtube', color: '#FF0000', action: `Social.switchTab('youtube')` },
    { name: 'YT Studio', icon: 'fa-youtube', color: '#FF0000', action: `Social.switchTab('ytstudio')` },
  ],
  'marketing': [
    { name: 'Meta Ads', icon: 'fa-meta', color: '#0668E1', action: `Marketing.switchTab('metaads')` },
    { name: 'Google Ads', icon: 'fa-google', color: '#4285F4', action: `Marketing.switchTab('googleads')` },
    { name: 'LinkedIn Ads', icon: 'fa-linkedin', color: '#0A66C2', action: `Marketing.switchTab('linkedinads')` },
    { name: 'Pinterest Ads', icon: 'fa-pinterest', color: '#E60023', action: `Marketing.switchTab('pinterestads')` },
  ],
  'chats': [
    { name: 'WhatsApp', icon: 'fa-whatsapp', color: '#25D366', action: `Chats.switchChatTab('whatsapp')` },
    { name: 'FB Messenger', icon: 'fa-facebook-messenger', color: '#00B2FF', action: `Chats.switchChatTab('facebook')` },
    { name: 'Instagram Direct', icon: 'fa-instagram', color: '#E4405F', action: `Chats.switchChatTab('instagram')` },
    { name: 'LinkedIn Chat', icon: 'fa-linkedin', color: '#0A66C2', action: `Chats.switchChatTab('linkedin')` },
    { name: 'YouTube', icon: 'fa-youtube', color: '#FF0000', action: `Chats.switchChatTab('youtube')` },
  ],
  'templates': [
    { name: 'All Templates', icon: 'fa-layer-group', color: '#1877f2', action: `Templates.setTab('all')` },
    { name: 'Active', icon: 'fa-check-circle', color: '#31a24c', action: `Templates.setTab('active')` },
    { name: 'Pending', icon: 'fa-clock', color: '#f59e0b', action: `Templates.setTab('pending')` },
    { name: 'Create New', icon: 'fa-plus-circle', color: '#8b5cf6', action: `Templates.showBuilder()` },
  ],
  'contacts': [
    { name: 'All Contacts', icon: 'fa-users', color: '#1877f2', action: `Contacts.currentTab='contacts';Contacts.render()` },
    { name: 'Manage Groups', icon: 'fa-layer-group', color: '#8b5cf6', action: `Contacts.currentTab='groups';Contacts.render()` },
    { name: 'Custom Fields', icon: 'fa-list', color: '#f59e0b', action: `Contacts.currentTab='fields';Contacts.render()` },
    { name: 'Import CSV', icon: 'fa-upload', color: '#10b981', action: `document.getElementById('importCSV')?.click()` },
  ],
  'forms': [
    { name: 'Form Builder', icon: 'fa-wpforms', color: '#1877f2', action: `Forms.currentTab='forms';Forms.render()` },
    { name: 'Submissions', icon: 'fa-list', color: '#10b981', action: `Forms.currentTab='submissions';Forms.render()` },
    { name: 'Create New', icon: 'fa-plus-circle', color: '#8b5cf6', action: `Forms.currentTab='builder';Forms.currentFormId=null;Forms.render()` },
  ],
  'campaigns': [
    { name: 'Bulk Campaigns', icon: 'fa-paper-plane', color: '#1877f2', action: `Campaigns.currentTab='bulk';Campaigns.render()` },
    { name: 'Drip Sequences', icon: 'fa-clock', color: '#f59e0b', action: `Campaigns.currentTab='drip';Campaigns.render()` },
    { name: 'Create New', icon: 'fa-plus-circle', color: '#10b981', action: `Campaigns.currentTab='bulk';Campaigns.showBulkCreate();Campaigns.render()` },
  ],
  'flows': [
    { name: 'Meta Templates', icon: 'fa-meta', color: '#0668E1', action: `Flows.currentTab='templates';Flows.render()` },
    { name: 'Visual Builder', icon: 'fa-paint-brush', color: '#8b5cf6', action: `Flows.currentTab='builder';Flows.render()` },
    { name: 'My Flows', icon: 'fa-star', color: '#f59e0b', action: `Flows.currentTab='myflows';Flows.render()` },
  ],
  'kanban': [
    { name: 'Pipeline View', icon: 'fa-tasks', color: '#1877f2', action: `Kanban.render()` },
    { name: 'List View', icon: 'fa-list', color: '#10b981', action: `Leads.render()` },
    { name: 'Add Deal', icon: 'fa-plus-circle', color: '#f59e0b', action: `Kanban.showAddForm()` },
  ],
  'chatbot': [
    { name: 'AI Settings', icon: 'fa-robot', color: '#8b5cf6', action: `Chatbot.render()` },
    { name: 'Keywords', icon: 'fa-bolt', color: '#f59e0b', action: `Chatbot.render()` },
    { name: 'Test AI', icon: 'fa-flask', color: '#10b981', action: `Chatbot.testAI()` },
  ],
  'dashboard': [
    { name: 'Add Lead', icon: 'fa-plus-circle', color: '#1877f2', action: `Leads.showAddForm()` },
    { name: 'Add Contact', icon: 'fa-user-plus', color: '#10b981', action: `Contacts.showAddForm()` },
    { name: 'New Campaign', icon: 'fa-rocket', color: '#f59e0b', action: `Campaigns.currentTab='bulk';Campaigns.showBulkCreate();Campaigns.render()` },
    { name: 'Open Pipeline', icon: 'fa-tasks', color: '#8b5cf6', action: `Kanban.render()` },
  ],
  'leads': [
    { name: 'All Leads', icon: 'fa-list', color: '#1877f2', action: `Leads.currentFilter='all';Leads.render()` },
    { name: 'New Leads', icon: 'fa-star', color: '#6366f1', action: `Leads.currentFilter='new';Leads.render()` },
    { name: 'Pipeline View', icon: 'fa-tasks', color: '#10b981', action: `Kanban.render()` },
    { name: 'Add Lead', icon: 'fa-plus-circle', color: '#f59e0b', action: `Leads.showAddForm()` },
  ],
};

// ========== GLOBAL HEADER RENDER ==========
function renderGlobalHeader(currentSection) {
  document.querySelectorAll('.global-top-header, .global-bottom-menu').forEach(el => el.remove());

  const isMobile = window.innerWidth < 768;
  const visibleMain = isMobile ? headerMain.slice(0, 6) : headerMain;

  const mainLinks = visibleMain.map(s => 
    `<a href="#" onclick="loadSection('${s.section}')" class="hl ${currentSection===s.section?'active':''}"><i class="fas ${s.icon}"></i><span class="hlt">${s.name}</span></a>`
  ).join('');

  const moreLinks = headerMore.map(s => 
    `<a href="#" onclick="loadSection('${s.section}')" class="di ${currentSection===s.section?'active':''}"><i class="fas ${s.icon} me-2"></i>${s.name}</a>`
  ).join('');

  const h = `
    <style>
      .global-top-header{position:fixed;top:0;left:0;right:0;z-index:9999;background:rgba(15,23,42,0.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,0.1);padding:0 16px;height:56px;display:flex;align-items:center;gap:6px;box-shadow:0 4px 20px rgba(0,0,0,0.3);}
      .hb{font-weight:800;font-size:16px;color:#fff;margin-right:16px;cursor:pointer;white-space:nowrap;text-decoration:none;display:flex;align-items:center;gap:8px;}
      .hb i{font-size:20px;color:#25D366;}
      .hn{display:flex;align-items:center;gap:4px;flex:1;overflow-x:auto;scrollbar-width:none;}
      .hn::-webkit-scrollbar{display:none;}
      .hl{display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;font-size:14px;font-weight:500;color:#cbd5e1;text-decoration:none;white-space:nowrap;transition:all 0.2s;position:relative;}
      .hl:hover{background:rgba(255,255,255,0.1);color:#fff;}
      .hl.active{background:rgba(24,119,242,0.25);color:#60a5fa;font-weight:600;box-shadow:0 0 20px rgba(24,119,242,0.4),inset 0 0 8px rgba(24,119,242,0.2);border:1px solid rgba(24,119,242,0.4);}
      .hl i{font-size:15px;}
      .hmb{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:10px;font-size:14px;font-weight:500;color:#cbd5e1;cursor:pointer;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);white-space:nowrap;transition:0.2s;}
      .hmb:hover{background:rgba(255,255,255,0.1);border-color:rgba(24,119,242,0.5);color:#fff;}
      .md{position:absolute;top:54px;right:8px;background:rgba(15,23,42,0.98);border:1px solid rgba(255,255,255,0.15);border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,0.5);min-width:240px;max-height:60vh;overflow-y:auto;z-index:10000;display:none;padding:8px;}
      .md.show{display:block;}
      .di{display:flex;align-items:center;padding:10px 14px;border-radius:10px;font-size:14px;color:#cbd5e1;text-decoration:none;transition:0.15s;}
      .di:hover{background:rgba(255,255,255,0.08);color:#fff;}
      .di.active{background:rgba(24,119,242,0.2);color:#60a5fa;font-weight:600;}
      .global-bottom-menu{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:9999;background:rgba(15,23,42,0.95);backdrop-filter:blur(12px);border-radius:30px;box-shadow:0 8px 32px rgba(0,0,0,0.4);padding:10px 18px;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;border:1px solid rgba(255,255,255,0.1);}
      .bottom-tab{padding:8px 16px;border-radius:22px;cursor:pointer;font-size:13px;font-weight:500;white-space:nowrap;background:rgba(255,255,255,0.05);color:#cbd5e1;transition:all 0.2s;display:flex;align-items:center;gap:6px;border:1px solid rgba(255,255,255,0.1);}
      .bottom-tab:hover{background:rgba(255,255,255,0.15);color:#fff;border-color:rgba(24,119,242,0.4);}
      @media(max-width:768px){.global-top-header{padding:0 8px;height:48px;}.hb{font-size:13px;margin-right:8px;}.hl{padding:6px 10px;font-size:13px;}.hlt{display:none;}.hl i{font-size:18px;}.hmb{padding:6px 10px;font-size:13px;}.global-bottom-menu{bottom:8px;padding:8px 12px;gap:4px;}.bottom-tab{padding:6px 12px;font-size:11px;}}
    </style>
    <div class="global-top-header">
      <a class="hb" onclick="loadSection('dashboard')"><i class="fab fa-whatsapp"></i> 11 Avatar CRM</a>
      <div class="hn">${mainLinks}</div>
      <div style="position:relative;">
        <button class="hmb" onclick="document.getElementById('moreDd').classList.toggle('show');event.stopPropagation();"><i class="fas fa-th-large"></i><span class="hlt">More</span> <i class="fas fa-chevron-down" style="font-size:10px;"></i></button>
        <div class="md" id="moreDd" onclick="event.stopPropagation()">${moreLinks}</div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('afterbegin', h);

  document.addEventListener('click', function(){ document.getElementById('moreDd')?.classList.remove('show'); });

  // Render bottom sub-menu if exists
  const subItems = sectionSubMenus[currentSection];
  if (subItems && subItems.length > 0) {
    const sub = `<div class="global-bottom-menu">${subItems.map(s => `<div class="bottom-tab" onclick="${s.action}"><i class="fab ${s.icon}" style="color:${s.color};font-size:15px;"></i> ${s.name}</div>`).join('')}</div>`;
    document.body.insertAdjacentHTML('beforeend', sub);
  }
}

// ========== LOAD SECTION ==========
function loadSection(section) {
  contentArea.innerHTML = '';
  document.body.classList.add('sidebar-hidden');
  if (sidebar) sidebar.style.display = 'none';
  const mainArea = document.querySelector('.main-area');
  if (mainArea) mainArea.style.marginLeft = '0';
  if (currentSectionTitle) currentSectionTitle.textContent = section;
  if (contentArea) contentArea.style.paddingTop = '0px';

  renderGlobalHeader(section);

  switch (section) {
    case 'dashboard': Dashboard.render(); break;
    case 'leads': Leads.render(); break;
    case 'contacts': Contacts.render(); break;
    case 'forms': Forms.currentTab = 'forms'; Forms.render(); break;
    case 'campaigns': Campaigns.render(); break;
    case 'setup': Setup.render(); break;
    case 'chats': Chats.render(); break;
    case 'templates': Templates.render(); break;
    case 'flows': Flows.render(); break;
    case 'ecommerce': Ecommerce.render(); break;
    case 'chatbot': Chatbot.render(); break;
    case 'integrations': Integrations.render(); break;
    case 'agents': Agents.render(); break;
    case 'clients': Clients.render(); break;
    case 'kanban': Kanban.render(); break;
    case 'knowledge': Knowledge.render(); break;   // ✅ ADD THIS
    case 'social': Social.render(); break;
    case 'marketing': Marketing.render(); break;
    case 'plan': Plan.render(); break;
    default: contentArea.innerHTML = `<div class="card-widget"><h4>${section}</h4><p>Coming soon...</p></div>`;
  }
}

function initApp(role) { buildSidebar(role); loadSection('dashboard'); }
menuToggle.addEventListener('click', () => { sidebar.classList.toggle('mobile-open'); });
