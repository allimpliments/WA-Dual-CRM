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
      { name: 'Kanban', icon: 'fa-tasks', section: 'kanban', roles: ['admin', 'team'] },
      { name: 'Social Posting', icon: 'fa-share-alt', section: 'social', roles: ['admin', 'team'] }
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
      currentSectionTitle.textContent = link.textContent.trim();
    });
  });
}

function loadSection(section) {
  contentArea.innerHTML = '';
  switch (section) {
    case 'dashboard': Dashboard.render(); break;
    case 'leads': Leads.render(); break;
    case 'contacts': Contacts.render(); break;
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
  document.querySelectorAll('.sidebar .nav-link').forEach(l => {
    l.classList.remove('active');
    if (l.dataset.section === section) l.classList.add('active');
  });
}

function initApp(role) {
  buildSidebar(role);
  loadSection('dashboard');
}

menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('mobile-open');
});

function addMobileNav() {
  if (window.innerWidth < 768) {
    const nav = document.createElement('div');
    nav.className = 'bottom-nav';
    nav.innerHTML = `
      <a href="#" class="nav-item active" data-mob="dashboard"><i class="fas fa-home"></i><br>Home</a>
      <a href="#" class="nav-item" data-mob="chats"><i class="fas fa-comment"></i><br>Chats</a>
      <a href="#" class="nav-item" data-mob="contacts"><i class="fas fa-users"></i><br>Contacts</a>
      <a href="#" class="nav-item" data-mob="leads"><i class="fas fa-funnel-dollar"></i><br>Leads</a>
      <a href="#" class="nav-item" data-mob="settings"><i class="fas fa-cog"></i><br>Setup</a>
    `;
    document.body.appendChild(nav);
    nav.querySelectorAll('[data-mob]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        loadSection(item.dataset.mob);
        nav.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }
}
addMobileNav();
