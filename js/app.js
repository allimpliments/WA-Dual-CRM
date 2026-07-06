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
  { title: 'Services', items: [
    { name: 'Appointments', icon: 'fa-calendar-check', section: 'appointments', roles: ['admin','team'] }
  ]},
  { title: 'Account', items: [
    { name: 'My Profile', icon: 'fa-user-circle', section: 'profile', roles: ['admin','team','client'] },
    { name: 'My Plan', icon: 'fa-wallet', section: 'plan', roles: ['admin','team','client'] },
    { name: 'Logout', icon: 'fa-sign-out-alt', action: 'logout', roles: ['admin','team','client'] }
  ]}
];

function buildSidebar(role) {
  let html = '<div class="brand"><i class="fab fa-whatsapp text-success fs-3"></i> Panel</div>';
  navSections.forEach(group => {
    let groupHasVisible = false;
    let groupHtml = `<div class="section-title">${group.title}</div>`;
    group.items.forEach(item => {
      if (item.section && !Permissions.canAccess(item.section, 'read')) return;
      if (!item.roles.includes(role)) return;
      groupHasVisible = true;
      groupHtml += `<div class="nav-item"><a class="nav-link" data-section="${item.section||''}" data-action="${item.action||''}"><i class="fas ${item.icon}"></i> ${item.name}</a></div>`;
    });
    if (groupHasVisible) html += groupHtml;
  });
  sidebar.innerHTML = html;
  document.querySelectorAll('.sidebar .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      const action = link.dataset.action;
      if (action === 'logout') { 
        auth.signOut();
        window.location.href = '/WA-Dual-CRM/home.html';
        return; 
      }
      loadSection(section);
      document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      currentSectionTitle.textContent = link.textContent.trim();
    });
  });
}

const headerMain = [
  { name: 'Dashboard', icon: 'fa-tachometer-alt', section: 'dashboard' },
  { name: 'Templates', icon: 'fa-layer-group', section: 'templates' },
  { name: 'Campaigns', icon: 'fa-rocket', section: 'campaigns' },
  { name: 'Chats', icon: 'fa-comments', section: 'chats' },
  { name: 'Contacts', icon: 'fa-users', section: 'contacts' },
  { name: 'Leads', icon: 'fa-funnel-dollar', section: 'leads' },
  { name: 'Kanban', icon: 'fa-tasks', section: 'kanban' },
  { name: 'Flows', icon: 'fa-sitemap', section: 'flows' },
  { name: 'Social', icon: 'fa-globe', section: 'social' },
  { name: 'Marketing', icon: 'fa-ad', section: 'marketing' },
  { name: 'E‑commerce', icon: 'fa-store', section: 'ecommerce' },
  { name: 'Appointments', icon: 'fa-calendar-check', section: 'appointments' },
  { name: 'Knowledge engine', icon: 'fa-book', section: 'knowledge' },
];

const headerMore = [
  { name: 'Chatbot', icon: 'fa-robot', section: 'chatbot' },
  { name: 'Forms', icon: 'fa-wpforms', section: 'forms' },
  { name: 'Integrations', icon: 'fa-plug', section: 'integrations' },
  { name: 'Agents', icon: 'fa-user-tie', section: 'agents' },
  { name: 'Clients', icon: 'fa-building', section: 'clients' },
  { name: 'Analytics', icon: 'fa-chart-bar', section: 'analytics' },
  { name: 'Reports', icon: 'fa-file-alt', section: 'reports' },
  { name: 'Setup', icon: 'fa-cog', section: 'setup' },
  { name: 'Tickets', icon: 'fa-ticket-alt', section: 'tickets' },
  { name: 'Admin', icon: 'fa-shield-alt', section: 'admin' },
];

const sectionSubMenus = {
  'social': [
    { name: 'Facebook', icon: 'fa-facebook', color: '#1877f2', action: `Social.switchTab('facebook')` },
    { name: 'Instagram', icon: 'fa-instagram', color: '#E4405F', action: `Social.switchTab('instagram')` },
  ],
  'chats': [
    { name: 'WhatsApp', icon: 'fa-whatsapp', color: '#25D366', action: `Chats.switchChatTab('whatsapp')` },
    { name: 'FB Messenger', icon: 'fa-facebook-messenger', color: '#00B2FF', action: `Chats.switchChatTab('facebook')` },
  ],
  'contacts': [
    { name: 'All Contacts', icon: 'fa-users', color: '#1877f2', action: `Contacts.currentTab='contacts';Contacts.render()` },
    { name: 'Manage Groups', icon: 'fa-layer-group', color: '#8b5cf6', action: `Contacts.currentTab='groups';Contacts.render()` },
  ],
  'forms': [
    { name: 'Form Builder', icon: 'fa-wpforms', color: '#1877f2', action: `Forms.currentTab='forms';Forms.render()` },
    { name: 'Submissions', icon: 'fa-list', color: '#10b981', action: `Forms.currentTab='submissions';Forms.render()` },
  ],
  'templates': [
    { name: 'All Templates', icon: 'fa-layer-group', color: '#1877f2', action: `Templates.setTab('all')` },
    { name: 'Active', icon: 'fa-check-circle', color: '#31a24c', action: `Templates.setTab('active')` },
  ],
  'campaigns': [
    { name: 'Bulk Campaigns', icon: 'fa-paper-plane', color: '#1877f2', action: `Campaigns.currentTab='bulk';Campaigns.render()` },
    { name: 'Drip Sequences', icon: 'fa-clock', color: '#f59e0b', action: `Campaigns.currentTab='drip';Campaigns.render()` },
  ],
  'flows': [
    { name: 'Meta Templates', icon: 'fa-meta', color: '#0668E1', action: `Flows.currentTab='templates';Flows.render()` },
    { name: 'Visual Builder', icon: 'fa-paint-brush', color: '#8b5cf6', action: `Flows.currentTab='builder';Flows.render()` },
  ],
  'kanban': [
    { name: 'Pipeline View', icon: 'fa-tasks', color: '#1877f2', action: `Kanban.render()` },
    { name: 'List View', icon: 'fa-list', color: '#10b981', action: `Leads.render()` },
  ],
  'dashboard': [
    { name: 'Add Lead', icon: 'fa-plus-circle', color: '#1877f2', action: `Leads.showAddForm()` },
    { name: 'Add Contact', icon: 'fa-user-plus', color: '#10b981', action: `Contacts.showAddForm()` },
  ],
  'leads': [
    { name: 'All Leads', icon: 'fa-list', color: '#1877f2', action: `Leads.currentFilter='all';Leads.render()` },
    { name: 'New Leads', icon: 'fa-star', color: '#6366f1', action: `Leads.currentFilter='new';Leads.render()` },
  ],
};

function renderGlobalHeader(currentSection) {
  document.querySelectorAll('.global-top-header, .global-bottom-menu').forEach(el => el.remove());

  const visibleMain = headerMain.filter(s => Permissions.canAccess(s.section, 'read'));
  const mainLinks = visibleMain.map(s => 
    `<a href="#" onclick="loadSection('${s.section}')" class="hl ${currentSection===s.section?'active':''}"><i class="fas ${s.icon}"></i><span class="hlt">${I18n.t(s.section)}</span></a>`
  ).join('');

  const visibleMore = headerMore.filter(s => Permissions.canAccess(s.section, 'read'));
  const moreLinks = visibleMore.map(s => 
    `<a href="#" onclick="loadSection('${s.section}')" class="di ${currentSection===s.section?'active':''}"><i class="fas ${s.icon} me-2"></i>${I18n.t(s.section)}</a>`
  ).join('');

  const userName = window.currentUser?.name || 'Profile';
  const userInitial = (userName||'A')[0].toUpperCase();

  const h = `
    <style>
      .global-top-header{position:fixed;top:0;left:0;right:0;z-index:9999;background:rgba(15,23,42,0.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,0.1);padding:0 12px;height:56px;display:flex;align-items:center;gap:4px;box-shadow:0 4px 20px rgba(0,0,0,0.3);}
      .hb{font-weight:800;font-size:15px;color:#fff;margin-right:10px;cursor:pointer;white-space:nowrap;text-decoration:none;display:flex;align-items:center;gap:6px;}
      .hb i{font-size:18px;color:#25D366;}
      .hn{display:flex;align-items:center;gap:2px;flex:1;overflow-x:auto;scrollbar-width:none;}
      .hn::-webkit-scrollbar{display:none;}
      .hl{display:flex;align-items:center;gap:5px;padding:6px 10px;border-radius:8px;font-size:13px;font-weight:500;color:#cbd5e1;text-decoration:none;white-space:nowrap;transition:all 0.2s;}
      .hl:hover{background:rgba(255,255,255,0.1);color:#fff;}
      .hl.active{background:rgba(24,119,242,0.25);color:#60a5fa;font-weight:600;box-shadow:0 0 16px rgba(24,119,242,0.3),inset 0 0 6px rgba(24,119,242,0.15);border:1px solid rgba(24,119,242,0.3);}
      .hl i{font-size:13px;}
      .header-right{display:flex;align-items:center;gap:6px;margin-left:6px;}
      .header-profile{display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:20px;cursor:pointer;color:#cbd5e1;font-size:12px;font-weight:500;transition:0.2s;text-decoration:none;border:1px solid rgba(255,255,255,0.15);white-space:nowrap;}
      .header-profile:hover{background:rgba(255,255,255,0.08);color:#fff;}
      .header-profile .av{width:26px;height:26px;border-radius:50%;background:#f59e0b;color:#000;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;}
      .header-logout{padding:5px 10px;border-radius:20px;cursor:pointer;color:#f87171;font-size:12px;font-weight:500;transition:0.2s;border:1px solid rgba(248,113,113,0.3);background:transparent;white-space:nowrap;}
      .header-logout:hover{background:rgba(248,113,113,0.15);}
      .hmb{display:flex;align-items:center;gap:4px;padding:5px 10px;border-radius:20px;font-size:12px;font-weight:500;color:#cbd5e1;cursor:pointer;border:1px solid rgba(255,255,255,0.15);background:transparent;white-space:nowrap;transition:0.2s;}
      .hmb:hover{background:rgba(255,255,255,0.08);color:#fff;}
      .md{position:absolute;top:46px;right:0;background:rgba(15,23,42,0.98);border:1px solid rgba(255,255,255,0.15);border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,0.5);min-width:220px;max-height:60vh;overflow-y:auto;z-index:10000;display:none;padding:6px;}
      .md.show{display:block;}
      .di{display:flex;align-items:center;padding:9px 12px;border-radius:10px;font-size:13px;color:#cbd5e1;text-decoration:none;transition:0.15s;}
      .di:hover{background:rgba(255,255,255,0.08);color:#fff;}
      .di.active{background:rgba(24,119,242,0.2);color:#60a5fa;font-weight:600;}
      .global-bottom-menu{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:9999;background:rgba(15,23,42,0.95);backdrop-filter:blur(12px);border-radius:30px;box-shadow:0 8px 32px rgba(0,0,0,0.4);padding:10px 18px;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;border:1px solid rgba(255,255,255,0.1);}
      .bottom-tab{padding:8px 16px;border-radius:22px;cursor:pointer;font-size:13px;font-weight:500;white-space:nowrap;background:rgba(255,255,255,0.05);color:#cbd5e1;transition:all 0.2s;display:flex;align-items:center;gap:6px;border:1px solid rgba(255,255,255,0.1);}
      .bottom-tab:hover{background:rgba(255,255,255,0.15);color:#fff;border-color:rgba(24,119,242,0.4);}
      @media(max-width:768px){.global-top-header{padding:0 6px;height:46px;}.hb{font-size:12px;margin-right:4px;}.hb .hlt{display:none;}.hl{padding:5px 7px;font-size:11px;}.hlt{display:none;}.hl i{font-size:15px;}.header-profile{padding:4px 7px;}.header-logout{padding:4px 7px;font-size:10px;}.hmb{padding:4px 7px;font-size:11px;}}
    </style>
    <div class="global-top-header">
      <a class="hb" onclick="loadSection('dashboard')"><i class="fab fa-whatsapp"></i> <span class="hlt">11 Avatar CRM</span></a>
      <div class="hn">${mainLinks}</div>
      <div class="header-right">
        <select id="langSelector" class="form-select form-select-sm" 
          style="width:auto; background:transparent; color:#fff; border:1px solid rgba(255,255,255,0.3); margin-right:8px;" 
          onchange="I18n.setLanguage(this.value)">
          <option value="en">English (US)</option>
          <option value="en-uk">English (UK)</option>
          <option value="hinglish">Hinglish</option>
          <option value="hi">हिन्दी</option>
          <option value="bn">বাংলা</option>
          <option value="te">తెలుగు</option>
          <option value="mr">मराठी</option>
          <option value="ta">தமிழ்</option>
          <option value="ur">اردو</option>
          <option value="gu">ગુજરાતી</option>
          <option value="kn">ಕನ್ನಡ</option>
          <option value="ml">മലയാളം</option>
          <option value="or">ଓଡ଼ିଆ</option>
          <option value="pa">ਪੰਜਾਬੀ</option>
          <option value="as">অসমীয়া</option>
          <option value="mai">मैथिली</option>
        </select>
        <div style="position:relative;">
          <button class="hmb" onclick="document.getElementById('moreDd').classList.toggle('show');event.stopPropagation();"><i class="fas fa-th-large"></i> <span class="hlt">${I18n.t('more')}</span></button>
          <div class="md" id="moreDd" onclick="event.stopPropagation()">${moreLinks}</div>
        </div>
        <a class="header-profile" onclick="loadSection('profile')">
          <div class="av">${userInitial}</div>
          <span class="hlt">${userName.split(' ')[0]}</span>
        </a>
        <button class="header-logout" onclick="auth.signOut();window.location.href='/WA-Dual-CRM/home.html';">
          <i class="fas fa-sign-out-alt"></i> <span class="hlt">${I18n.t('logout')}</span>
        </button>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('afterbegin', h);
  document.addEventListener('click', function(){ document.getElementById('moreDd')?.classList.remove('show'); });

  const subItems = sectionSubMenus[currentSection];
  if (subItems && subItems.length > 0) {
    const sub = `<div class="global-bottom-menu">${subItems.map(s => `<div class="bottom-tab" onclick="${s.action}"><i class="fab ${s.icon}" style="color:${s.color};font-size:15px;"></i> ${s.name}</div>`).join('')}</div>`;
    document.body.insertAdjacentHTML('beforeend', sub);
  }
}

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
    case 'knowledge': Knowledge.render(); break;
    case 'social': Social.render(); break;
    case 'analytics': Analytics.render(); break;
    case 'reports': Reports.render(); break;
    case 'marketing': Marketing.render(); break;
    case 'plan': Plan.render(); break;
    case 'tickets': Tickets.render(); break;
    case 'appointments': Appointments.render(); break;
    case 'profile': Profile.render(); break;
    case 'admin': Admin.render(); break;
    default: contentArea.innerHTML = `<div class="card-widget"><h4>${section}</h4><p>Coming soon...</p></div>`;
  }
}

function initApp(role) { buildSidebar(role); loadSection('dashboard'); }
menuToggle.addEventListener('click', () => { sidebar.classList.toggle('mobile-open'); });
