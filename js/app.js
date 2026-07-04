const sidebar = document.getElementById('sidebar');
const contentArea = document.getElementById('contentArea');
const menuToggle = document.getElementById('menuToggle');
const currentSectionTitle = document.getElementById('currentSectionTitle');

const navSections = [
  { title: 'Main', items: [{ name: 'Dashboard', icon: 'fa-tachometer-alt', section: 'dashboard', roles: ['admin','team','client'] }] },
  { title: 'Setup', items: [{ name: 'Setup', icon: 'fa-cog', section: 'setup', roles: ['admin'] }] },
  { title: 'Communication', items: [
    { name: 'All Chats', icon: 'fa-comments', section: 'chats', roles: ['admin','team'] },
    { name: 'Leads', icon: 'fa-funnel-dollar', section: 'leads', roles: ['admin','team'] },
    { name: 'Contacts', icon: 'fa-users', section: 'contacts', roles: ['admin','team'] },
    { name: 'Templates', icon: 'fa-layer-group', section: 'templates', roles: ['admin','team'] },
    { name: 'Campaigns', icon: 'fa-rocket', section: 'campaigns', roles: ['admin','team'] },
    { name: 'Flows', icon: 'fa-sitemap', section: 'flows', roles: ['admin','team'] }
  ]},
  { title: 'Social Media', items: [{ name: 'All Platforms', icon: 'fa-globe', section: 'social', roles: ['admin','team'] }] },
  { title: 'Forms', items: [{ name: 'Form Builder', icon: 'fa-wpforms', section: 'forms', roles: ['admin','team'] }] },
  { title: 'E-commerce', items: [{ name: 'E-commerce', icon: 'fa-store', section: 'ecommerce', roles: ['admin'] }] },
  { title: 'Automation', items: [
    { name: 'Chatbot', icon: 'fa-robot', section: 'chatbot', roles: ['admin','team'] },
    { name: 'Integrations', icon: 'fa-plug', section: 'integrations', roles: ['admin'] }
  ]},
  { title: 'Management', items: [
    { name: 'Agents', icon: 'fa-user-tie', section: 'agents', roles: ['admin'] },
    { name: 'Clients', icon: 'fa-building', section: 'clients', roles: ['admin'] },
    { name: 'Kanban', icon: 'fa-tasks', section: 'kanban', roles: ['admin','team'] }
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

function loadSection(section) {
  contentArea.innerHTML = '';

  // FULL SCREEN
  document.body.classList.add('sidebar-hidden');
  if (sidebar) sidebar.style.display = 'none';
  const mainArea = document.querySelector('.main-area');
  if (mainArea) mainArea.style.marginLeft = '0';
  if (currentSectionTitle) currentSectionTitle.textContent = section;

  // Remove old global components
  document.querySelectorAll('.global-top-header, .header-trigger-zone, .global-bottom-menu').forEach(el => el.remove());

  // ========== FIXED TOP HEADER (Always visible, thin bar) ==========
  const headerSections = [
    { name: 'Dashboard', icon: 'fa-tachometer-alt', section: 'dashboard' },
    { name: 'Chats', icon: 'fa-comments', section: 'chats' },
    { name: 'Contacts', icon: 'fa-users', section: 'contacts' },
    { name: 'Leads', icon: 'fa-funnel-dollar', section: 'leads' },
    { name: 'Templates', icon: 'fa-layer-group', section: 'templates' },
    { name: 'Campaigns', icon: 'fa-rocket', section: 'campaigns' },
    { name: 'Forms', icon: 'fa-wpforms', section: 'forms' },
    { name: 'Social', icon: 'fa-globe', section: 'social' },
    { name: 'Chatbot', icon: 'fa-robot', section: 'chatbot' },
    { name: 'Setup', icon: 'fa-cog', section: 'setup' },
  ];

  const topHTML = `
    <div class="global-top-header" id="globalTopHeader">
      <span style="font-weight:700;font-size:13px;color:#1877f2;white-space:nowrap;">📱 11 Avatar CRM</span>
      <div class="global-crm-nav">
        ${headerSections.map(s => `<a href="#" onclick="loadSection('${s.section}')" style="${section===s.section?'background:#e7f3ff;color:#1877f2;font-weight:600;':''}"><i class="fas ${s.icon}"></i> ${s.name}</a>`).join('')}
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('afterbegin', topHTML);

  // ========== PREMIUM BOTTOM SUB MENU (Same style as Social tab) ==========
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
    'chats': [
      { name: 'WhatsApp', icon: 'fa-whatsapp', color: '#25D366', action: `Chats.switchChatTab('whatsapp')` },
      { name: 'Messenger', icon: 'fa-facebook-messenger', color: '#00B2FF', action: `Chats.switchChatTab('facebook')` },
      { name: 'Instagram Direct', icon: 'fa-instagram', color: '#E4405F', action: `Chats.switchChatTab('instagram')` },
    ],
    'templates': [
      { name: 'All Templates', icon: 'fa-layer-group', color: '#1877f2', action: `Templates.setTab('all')` },
      { name: 'Active', icon: 'fa-check-circle', color: '#31a24c', action: `Templates.setTab('active')` },
      { name: 'Pending', icon: 'fa-clock', color: '#f59e0b', action: `Templates.setTab('pending')` },
    ],
    'contacts': [
      { name: 'All Contacts', icon: 'fa-users', color: '#1877f2', action: `Contacts.currentTab='contacts';Contacts.render()` },
      { name: 'Custom Fields', icon: 'fa-list', color: '#1877f2', action: `Contacts.currentTab='fields';Contacts.render()` },
    ],
  };

  if (sectionSubMenus[section]) {
    const subHTML = `
      <div class="global-bottom-menu">
        ${sectionSubMenus[section].map(s => `
          <div class="bottom-tab" onclick="${s.action}">
            <i class="fab ${s.icon}" style="color:${s.color};font-size:15px;"></i>
            <span style="color:${s.color};">${s.name}</span>
          </div>
        `).join('')}
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', subHTML);
  }

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
    case 'plan': Plan.render(); break;
    default: contentArea.innerHTML = `<div class="card-widget"><h4>${section}</h4><p>Coming soon...</p></div>`;
  }
}

function initApp(role) { buildSidebar(role); loadSection('dashboard'); }
menuToggle.addEventListener('click', () => { sidebar.classList.toggle('mobile-open'); });

function addMobileNav() {
  if (window.innerWidth < 768) {
    const nav = document.createElement('div'); nav.className = 'bottom-nav';
    nav.innerHTML = `<a href="#" class="nav-item active" data-mob="dashboard"><i class="fas fa-home"></i><br>Home</a><a href="#" class="nav-item" data-mob="chats"><i class="fas fa-comment"></i><br>Chats</a><a href="#" class="nav-item" data-mob="contacts"><i class="fas fa-users"></i><br>Contacts</a><a href="#" class="nav-item" data-mob="leads"><i class="fas fa-funnel-dollar"></i><br>Leads</a><a href="#" class="nav-item" data-mob="social"><i class="fas fa-share-alt"></i><br>Social</a>`;
    document.body.appendChild(nav);
    nav.querySelectorAll('[data-mob]').forEach(item => { item.addEventListener('click', (e) => { e.preventDefault(); loadSection(item.dataset.mob); nav.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active')); item.classList.add('active'); }); });
  }
}
addMobileNav();
