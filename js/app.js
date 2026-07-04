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

// ========== ALL 45 FEATURES HEADER ==========
const headerSections = [
  { name: 'Dashboard', icon: 'fa-tachometer-alt', section: 'dashboard', status: 'done' },
  { name: 'Chats', icon: 'fa-comments', section: 'chats', status: 'done' },
  { name: 'Contacts', icon: 'fa-users', section: 'contacts', status: 'done' },
  { name: 'Leads', icon: 'fa-funnel-dollar', section: 'leads', status: 'done' },
  { name: 'Templates', icon: 'fa-layer-group', section: 'templates', status: 'done' },
  { name: 'Campaigns', icon: 'fa-rocket', section: 'campaigns', status: 'done' },
  { name: 'Flows', icon: 'fa-sitemap', section: 'flows', status: 'done' },
  { name: 'Social', icon: 'fa-globe', section: 'social', status: 'done' },
  { name: 'Marketing', icon: 'fa-ad', section: 'marketing', status: 'done' },
  { name: 'Forms', icon: 'fa-wpforms', section: 'forms', status: 'done' },
  { name: 'E‑commerce', icon: 'fa-store', section: 'ecommerce', status: 'coming' },
  { name: 'Chatbot', icon: 'fa-robot', section: 'chatbot', status: 'done' },
  { name: 'Integrations', icon: 'fa-plug', section: 'integrations', status: 'coming' },
  { name: 'Agents', icon: 'fa-user-tie', section: 'agents', status: 'coming' },
  { name: 'Clients', icon: 'fa-building', section: 'clients', status: 'coming' },
  { name: 'Kanban', icon: 'fa-tasks', section: 'kanban', status: 'done' },
  { name: 'Tickets', icon: 'fa-ticket-alt', section: 'tickets', status: 'coming' },
  { name: 'Knowledge', icon: 'fa-book', section: 'knowledge', status: 'coming' },
  { name: 'Analytics', icon: 'fa-chart-bar', section: 'analytics', status: 'coming' },
  { name: 'Reports', icon: 'fa-file-alt', section: 'reports', status: 'coming' },
  { name: 'Setup', icon: 'fa-cog', section: 'setup', status: 'done' },
  { name: 'Plan', icon: 'fa-wallet', section: 'plan', status: 'coming' },
];

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
  'forms': [
    { name: 'Form Builder', icon: 'fa-wpforms', color: '#1877f2', action: `Forms.currentTab='forms';Forms.render()` },
    { name: 'Submissions', icon: 'fa-list', color: '#1877f2', action: `Forms.currentTab='submissions';Forms.render()` },
  ],
};

function loadSection(section) {
  contentArea.innerHTML = '';
  document.body.classList.add('sidebar-hidden');
  if (sidebar) sidebar.style.display = 'none';
  const mainArea = document.querySelector('.main-area');
  if (mainArea) mainArea.style.marginLeft = '0';
  if (currentSectionTitle) currentSectionTitle.textContent = section;

  // FIXED: Header ko remove nahi karenge, update karenge
  renderGlobalHeader(section);

  if (contentArea) contentArea.style.paddingTop = '0px';

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
    case 'tickets': Tickets.render(); break;
    case 'knowledge': Knowledge.render(); break;
    case 'analytics': Analytics.render(); break;
    case 'reports': Reports.render(); break;
    default: contentArea.innerHTML = `<div class="card-widget"><h4>${section}</h4><p>Coming soon...</p></div>`;
  }
}

// FIXED: New function — header ko remove nahi, sirf update karega
function renderGlobalHeader(currentSection) {
  // Purane header hatao
  document.querySelectorAll('.global-top-header, .global-bottom-menu').forEach(el => el.remove());

  const headerHTML = `
    <div class="global-top-header">
      <span style="font-weight:700;font-size:15px;color:#1877f2;">📱 11 Avatar CRM</span>
      <div class="global-crm-nav">
        ${headerSections.map(s => `
          <a href="#" onclick="loadSection('${s.section}')" style="${currentSection===s.section?'background:#e7f3ff;color:#1877f2;font-weight:600;':''}">
            <i class="fas ${s.icon}"></i> ${s.name}
            ${s.status === 'coming' ? '<span class="coming-soon-badge">Soon</span>' : ''}
          </a>
        `).join('')}
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('afterbegin', headerHTML);

  // Sub menu
  if (sectionSubMenus[currentSection]) {
    const subHTML = `
      <div class="global-bottom-menu">
        ${sectionSubMenus[currentSection].map(s => `
          <div class="bottom-tab" onclick="${s.action}">
            <i class="fab ${s.icon}" style="color:${s.color};font-size:15px;"></i> ${s.name}
          </div>
        `).join('')}
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', subHTML);
  }
}

function initApp(role) { buildSidebar(role); loadSection('dashboard'); }
menuToggle.addEventListener('click', () => { sidebar.classList.toggle('mobile-open'); });
