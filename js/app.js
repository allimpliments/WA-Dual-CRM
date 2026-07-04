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
    { name: 'Knowledge Base', icon: 'fa-book', section: 'knowledge', roles: ['admin','team'] }
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
  { name: 'Templates', icon: 'fa-layer-group', section: 'templates' },
  { name: 'Chatbot', icon: 'fa-robot', section: 'chatbot' },
  { name: 'Social', icon: 'fa-globe', section: 'social' },
  { name: 'Forms', icon: 'fa-wpforms', section: 'forms' },
];

const headerMore = [
  { name: 'Setup', icon: 'fa-cog', section: 'setup' },
  { name: 'Marketing', icon: 'fa-ad', section: 'marketing' },
  { name: 'Flows', icon: 'fa-sitemap', section: 'flows' },
  { name: 'E‑commerce', icon: 'fa-store', section: 'ecommerce' },
  { name: 'Integrations', icon: 'fa-plug', section: 'integrations' },
  { name: 'Agents', icon: 'fa-user-tie', section: 'agents' },
  { name: 'Clients', icon: 'fa-building', section: 'clients' },
  { name: 'Tickets', icon: 'fa-ticket-alt', section: 'tickets' },
  { name: 'Knowledge', icon: 'fa-book', section: 'knowledge' },
  { name: 'Analytics', icon: 'fa-chart-bar', section: 'analytics' },
  { name: 'Reports', icon: 'fa-file-alt', section: 'reports' },
  { name: 'Plan', icon: 'fa-wallet', section: 'plan' },
];

const sectionSubMenus = {
  'social': [
    { name: 'Facebook', icon: 'fa-facebook', color: '#1877f2', action: `Social.switchTab('facebook')` },
    { name: 'Instagram', icon: 'fa-instagram', color: '#E4405F', action: `Social.switchTab('instagram')` },
  ],
  'chats': [
    { name: 'WhatsApp', icon: 'fa-whatsapp', color: '#25D366', action: `Chats.switchChatTab('whatsapp')` },
    { name: 'Messenger', icon: 'fa-facebook-messenger', color: '#00B2FF', action: `Chats.switchChatTab('facebook')` },
  ],
  'contacts': [
    { name: 'All Contacts', icon: 'fa-users', color: '#1877f2', action: `Contacts.currentTab='contacts';Contacts.render()` },
    { name: 'Custom Fields', icon: 'fa-list', color: '#1877f2', action: `Contacts.currentTab='fields';Contacts.render()` },
  ],
  'forms': [
    { name: 'Form Builder', icon: 'fa-wpforms', color: '#1877f2', action: `Forms.currentTab='forms';Forms.render()` },
    { name: 'Submissions', icon: 'fa-list', color: '#1877f2', action: `Forms.currentTab='submissions';Forms.render()` },
  ],
  'templates': [
    { name: 'All Templates', icon: 'fa-layer-group', color: '#1877f2', action: `Templates.setTab('all')` },
    { name: 'Active', icon: 'fa-check-circle', color: '#31a24c', action: `Templates.setTab('active')` },
  ],
};

// ========== GLOBAL HEADER RENDER ==========
function renderGlobalHeader(currentSection) {
  document.querySelectorAll('.global-top-header, .global-bottom-menu').forEach(el => el.remove());

  const isMobile = window.innerWidth < 768;
  const visibleMain = isMobile ? headerMain.slice(0, 5) : headerMain;

  const mainLinks = visibleMain.map(s => 
    `<a href="#" onclick="loadSection('${s.section}')" class="hl ${currentSection===s.section?'active':''}"><i class="fas ${s.icon}"></i><span class="hlt">${s.name}</span></a>`
  ).join('');

  const moreLinks = headerMore.map(s => 
    `<a href="#" onclick="loadSection('${s.section}')" class="di ${currentSection===s.section?'active':''}"><i class="fas ${s.icon} me-2"></i>${s.name}</a>`
  ).join('');

  const h = `
    <style>
      .global-top-header{position:fixed;top:0;left:0;right:0;z-index:9999;background:rgba(255,255,255,0.95);backdrop-filter:blur(8px);border-bottom:1px solid #e5e7eb;padding:0 12px;height:48px;display:flex;align-items:center;gap:4px;box-shadow:0 1px 3px rgba(0,0,0,0.04);}
      .hb{font-weight:800;font-size:14px;color:#1877f2;margin-right:10px;cursor:pointer;white-space:nowrap;text-decoration:none;}
      .hn{display:flex;align-items:center;gap:2px;flex:1;overflow-x:auto;scrollbar-width:none;}
      .hn::-webkit-scrollbar{display:none;}
      .hl{display:flex;align-items:center;gap:4px;padding:6px 10px;border-radius:8px;font-size:12px;font-weight:500;color:#4b5563;text-decoration:none;white-space:nowrap;transition:0.15s;}
      .hl:hover{background:#f3f4f6;color:#1877f2;}
      .hl.active{background:#e7f3ff;color:#1877f2;font-weight:600;}
      .hl i{font-size:13px;}
      .hmb{display:flex;align-items:center;gap:4px;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:500;color:#4b5563;cursor:pointer;border:1px solid #e5e7eb;background:#fff;white-space:nowrap;}
      .hmb:hover{background:#f3f4f6;border-color:#1877f2;color:#1877f2;}
      .md{position:absolute;top:46px;right:8px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,0.12);min-width:220px;max-height:55vh;overflow-y:auto;z-index:10000;display:none;padding:6px;}
      .md.show{display:block;}
      .di{display:flex;align-items:center;padding:8px 12px;border-radius:8px;font-size:12px;color:#374151;text-decoration:none;}
      .di:hover{background:#f3f4f6;}
      .di.active{background:#e7f3ff;color:#1877f2;font-weight:600;}
      @media(max-width:768px){.global-top-header{padding:0 6px;height:44px;}.hb{font-size:12px;}.hl{padding:5px 7px;font-size:11px;}.hlt{display:none;}.hl i{font-size:15px;}.hmb{padding:5px 8px;font-size:11px;}}
    </style>
    <div class="global-top-header">
      <a class="hb" onclick="loadSection('dashboard')"><i class="fab fa-whatsapp text-success"></i> 11 Avatar</a>
      <div class="hn">${mainLinks}</div>
      <div style="position:relative;">
        <button class="hmb" onclick="document.getElementById('moreDd').classList.toggle('show');event.stopPropagation();"><i class="fas fa-th-large"></i><span class="hlt">More</span></button>
        <div class="md" id="moreDd" onclick="event.stopPropagation()">${moreLinks}</div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('afterbegin', h);

  document.addEventListener('click', function(){ document.getElementById('moreDd')?.classList.remove('show'); });

  if (sectionSubMenus[currentSection]) {
    const sub = `<div class="global-bottom-menu">${sectionSubMenus[currentSection].map(s => `<div class="bottom-tab" onclick="${s.action}"><i class="fab ${s.icon}" style="color:${s.color};font-size:14px;"></i> ${s.name}</div>`).join('')}</div>`;
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
    case 'social': Social.render(); break;
    case 'marketing': Marketing.render(); break;
    case 'plan': Plan.render(); break;
    default: contentArea.innerHTML = `<div class="card-widget"><h4>${section}</h4><p>Coming soon...</p></div>`;
  }
}

function initApp(role) { buildSidebar(role); loadSection('dashboard'); }
menuToggle.addEventListener('click', () => { sidebar.classList.toggle('mobile-open'); });
