const sidebar = document.getElementById('sidebar');
const contentArea = document.getElementById('contentArea');
const menuToggle = document.getElementById('menuToggle');
const currentSectionTitle = document.getElementById('currentSectionTitle');

const navSections = [
  {
    title: 'Main',
    items: [
      { name: 'Dashboard', icon: 'fa-tachometer-alt', section: 'dashboard', roles: ['admin', 'team', 'client'] }
    ]
  },
  {
    title: 'Setup',
    items: [
      { name: 'Setup', icon: 'fa-cog', section: 'setup', roles: ['admin'] }
    ]
  },
  {
    title: 'Communication',
    items: [
      { name: 'All Chats', icon: 'fa-comments', section: 'chats', roles: ['admin', 'team'] },
      { name: 'Leads', icon: 'fa-funnel-dollar', section: 'leads', roles: ['admin', 'team'] },
      { name: 'Contacts', icon: 'fa-users', section: 'contacts', roles: ['admin', 'team'] },
      { name: 'Templates', icon: 'fa-layer-group', section: 'templates', roles: ['admin', 'team'] },
      { name: 'Campaigns', icon: 'fa-rocket', section: 'campaigns', roles: ['admin', 'team'] },
      { name: 'Flows', icon: 'fa-sitemap', section: 'flows', roles: ['admin', 'team'] }
    ]
  },
  {
    title: 'Social Media',
    items: [
      { name: 'All Platforms', icon: 'fa-globe', section: 'social', roles: ['admin', 'team'] }
    ]
  },
  {
    title: 'Forms',
    items: [
      { name: 'Form Builder', icon: 'fa-wpforms', section: 'forms', roles: ['admin', 'team'] }
    ]
  },
  {
    title: 'E-commerce',
    items: [
      { name: 'E-commerce', icon: 'fa-store', section: 'ecommerce', roles: ['admin'] }
    ]
  },
  {
    title: 'Automation',
    items: [
      { name: 'Chatbot', icon: 'fa-robot', section: 'chatbot', roles: ['admin', 'team'] },
      { name: 'Integrations', icon: 'fa-plug', section: 'integrations', roles: ['admin'] }
    ]
  },
  {
    title: 'Management',
    items: [
      { name: 'Agents', icon: 'fa-user-tie', section: 'agents', roles: ['admin'] },
      { name: 'Clients', icon: 'fa-building', section: 'clients', roles: ['admin'] },
      { name: 'Kanban', icon: 'fa-tasks', section: 'kanban', roles: ['admin', 'team'] }
    ]
  },
  {
    title: 'Account',
    items: [
      { name: 'My Plan', icon: 'fa-wallet', section: 'plan', roles: ['admin', 'team', 'client'] },
      { name: 'Logout', icon: 'fa-sign-out-alt', action: 'logout', roles: ['admin', 'team', 'client'] }
    ]
  }
];

function buildSidebar(role) {
  let html = '<div class="brand"><i class="fab fa-whatsapp text-success fs-3"></i> Panel</div>';
  navSections.forEach(group => {
    html += `<div class="section-title">${group.title}</div>`;
    group.items.forEach(item => {
      if (item.roles.includes(role)) {
        html += `<div class="nav-item"><a class="nav-link" data-section="${item.section || ''}" data-action="${item.action || ''}"><i class="fas ${item.icon}"></i> ${item.name}</a></div>`;
      }
    });
  });
  sidebar.innerHTML = html;

  document.querySelectorAll('.sidebar .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      const action = link.dataset.action;
      if (action === 'logout') {
        auth.signOut();
        return;
      }
      loadSection(section);
      document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

function loadSection(section) {
  contentArea.innerHTML = '';

  // Hide CRM sidebar using CSS class
  document.body.classList.add('sidebar-hidden');
  const crmSidebar = document.getElementById('sidebar');
  if (crmSidebar) crmSidebar.style.display = 'none';
  const mainArea = document.querySelector('.main-area');
  if (mainArea) mainArea.style.marginLeft = '0';

  // ====== GLOBAL: Top Auto-Hide Header ======
  const crmSections = [
    { name: 'Dashboard', icon: 'fa-tachometer-alt', section: 'dashboard' },
    { name: 'Chats', icon: 'fa-comments', section: 'chats' },
    { name: 'Contacts', icon: 'fa-users', section: 'contacts' },
    { name: 'Leads', icon: 'fa-funnel-dollar', section: 'leads' },
    { name: 'Templates', icon: 'fa-layer-group', section: 'templates' },
    { name: 'Campaigns', icon: 'fa-rocket', section: 'campaigns' },
    { name: 'Forms', icon: 'fa-wpforms', section: 'forms' },
    { name: 'Chatbot', icon: 'fa-robot', section: 'chatbot' },
    { name: 'Social', icon: 'fa-globe', section: 'social' },
    { name: 'Setup', icon: 'fa-cog', section: 'setup' },
  ];

  const topHeaderHTML = `
    <div class="header-trigger-zone" onmouseenter="document.getElementById('globalTopHeader').classList.add('visible')"></div>
    <div class="global-top-header" id="globalTopHeader" onmouseleave="document.getElementById('globalTopHeader').classList.remove('visible')">
      <span style="font-weight:700;font-size:12px;color:#1877f2;">📱 CRM</span>
      <div class="global-crm-nav">
        ${crmSections.map(s => `<a href="#" onclick="loadSection('${s.section}')"><i class="fas ${s.icon}"></i> ${s.name}</a>`).join('')}
      </div>
      <span style="font-size:11px;color:#65676b;" id="globalSectionTitle">${section}</span>
    </div>
  `;

  // Remove existing top header if any
  const existingHeader = document.querySelector('.global-top-header');
  if (existingHeader) existingHeader.remove();
  const existingTrigger = document.querySelector('.header-trigger-zone');
  if (existingTrigger) existingTrigger.remove();

  // Inject top header into body
  const headerDiv = document.createElement('div');
  headerDiv.innerHTML = topHeaderHTML;
  document.body.insertAdjacentHTML('afterbegin', topHeaderHTML);

  // ====== GLOBAL: Bottom Sticky Menu ======
  const bottomSections = [
    { name: 'Home', icon: 'fa-home', section: 'dashboard' },
    { name: 'Chats', icon: 'fa-comments', section: 'chats' },
    { name: 'Contacts', icon: 'fa-users', section: 'contacts' },
    { name: 'Leads', icon: 'fa-funnel-dollar', section: 'leads' },
    { name: 'Social', icon: 'fa-globe', section: 'social' },
    { name: 'Forms', icon: 'fa-wpforms', section: 'forms' },
    { name: 'Setup', icon: 'fa-cog', section: 'setup' },
  ];

  const existingBottom = document.querySelector('.global-bottom-menu');
  if (existingBottom) existingBottom.remove();

  const bottomHTML = `
    <div class="global-bottom-menu">
      ${bottomSections.map(s => `
        <div class="bottom-tab ${section === s.section ? 'active' : ''}" onclick="loadSection('${s.section}')">
          <i class="fas ${s.icon}"></i><br>${s.name}
        </div>
      `).join('')}
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', bottomHTML);

  // Update current section title in topbar
  if (currentSectionTitle) currentSectionTitle.textContent = section;

  // ====== Render Section Content ======
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

function initApp(role) {
  buildSidebar(role);
  loadSection('dashboard');
}

menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('mobile-open');
});
