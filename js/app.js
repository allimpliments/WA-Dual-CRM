// ========== HEADER CONFIGURATION ==========
const headerMain = [
  { name: 'Dashboard', icon: 'fa-tachometer-alt', section: 'dashboard', status: 'done' },
  { name: 'Chats', icon: 'fa-comments', section: 'chats', status: 'done' },
  { name: 'Contacts', icon: 'fa-users', section: 'contacts', status: 'done' },
  { name: 'Leads', icon: 'fa-funnel-dollar', section: 'leads', status: 'done' },
  { name: 'Kanban', icon: 'fa-tasks', section: 'kanban', status: 'done' },
  { name: 'Campaigns', icon: 'fa-rocket', section: 'campaigns', status: 'done' },
  { name: 'Templates', icon: 'fa-layer-group', section: 'templates', status: 'done' },
  { name: 'Chatbot', icon: 'fa-robot', section: 'chatbot', status: 'done' },
  { name: 'Social', icon: 'fa-globe', section: 'social', status: 'done' },
  { name: 'Forms', icon: 'fa-wpforms', section: 'forms', status: 'done' },
];

const headerMore = [
  { name: 'Setup', icon: 'fa-cog', section: 'setup', status: 'done' },
  { name: 'Marketing', icon: 'fa-ad', section: 'marketing', status: 'done' },
  { name: 'Flows', icon: 'fa-sitemap', section: 'flows', status: 'done' },
  { name: 'E‑commerce', icon: 'fa-store', section: 'ecommerce', status: 'coming' },
  { name: 'Integrations', icon: 'fa-plug', section: 'integrations', status: 'coming' },
  { name: 'Agents', icon: 'fa-user-tie', section: 'agents', status: 'coming' },
  { name: 'Clients', icon: 'fa-building', section: 'clients', status: 'coming' },
  { name: 'Tickets', icon: 'fa-ticket-alt', section: 'tickets', status: 'coming' },
  { name: 'Knowledge', icon: 'fa-book', section: 'knowledge', status: 'coming' },
  { name: 'Analytics', icon: 'fa-chart-bar', section: 'analytics', status: 'coming' },
  { name: 'Reports', icon: 'fa-file-alt', section: 'reports', status: 'coming' },
  { name: 'Plan', icon: 'fa-wallet', section: 'plan', status: 'coming' },
];

// ========== RENDER GLOBAL HEADER ==========
function renderGlobalHeader(currentSection) {
  // Purane headers hatao
  document.querySelectorAll('.global-top-header, .global-bottom-menu').forEach(el => el.remove());

  const isMobile = window.innerWidth < 768;
  const visibleMain = isMobile ? headerMain.slice(0, 5) : headerMain;

  const mainLinks = visibleMain.map(s => `
    <a href="#" onclick="loadSection('${s.section}')" 
       class="header-link ${currentSection===s.section?'active':''}"
       title="${s.name}">
      <i class="fas ${s.icon}"></i>
      <span class="header-link-text">${s.name}</span>
      ${s.status==='coming'?'<span class="coming-dot"></span>':''}
    </a>
  `).join('');

  const moreLinks = headerMore.map(s => `
    <a href="#" onclick="loadSection('${s.section}')" class="dropdown-item ${currentSection===s.section?'active':''}">
      <i class="fas ${s.icon} me-2"></i> ${s.name}
      ${s.status==='coming'?'<span class="coming-soon-badge">Soon</span>':''}
    </a>
  `).join('');

  const headerHTML = `
    <style>
      .global-top-header {
        position: fixed;
        top: 0; left: 0; right: 0;
        z-index: 9999;
        background: rgba(255,255,255,0.95);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(0,0,0,0.06);
        padding: 0 16px;
        height: 50px;
        display: flex;
        align-items: center;
        gap: 0;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      }
      .header-brand {
        font-weight: 800;
        font-size: 15px;
        color: #1877f2;
        white-space: nowrap;
        margin-right: 16px;
        display: flex;
        align-items: center;
        gap: 6px;
        text-decoration: none;
      }
      .header-brand i { font-size: 18px; }
      .header-nav {
        display: flex;
        align-items: center;
        gap: 2px;
        flex: 1;
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      .header-nav::-webkit-scrollbar { display: none; }
      .header-link {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 7px 12px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        color: #4b5563;
        text-decoration: none;
        white-space: nowrap;
        transition: all 0.15s;
        position: relative;
      }
      .header-link:hover {
        background: #f3f4f6;
        color: #1877f2;
      }
      .header-link.active {
        background: #e7f3ff;
        color: #1877f2;
        font-weight: 600;
      }
      .header-link i { font-size: 14px; }
      .header-link-text {
        display: inline;
      }
      .coming-dot {
        width: 5px; height: 5px;
        background: #f59e0b;
        border-radius: 50%;
        position: absolute;
        top: 6px; right: 6px;
      }
      .header-more-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 7px 14px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        color: #4b5563;
        cursor: pointer;
        transition: all 0.15s;
        border: 1px solid #e5e7eb;
        background: #fff;
        white-space: nowrap;
      }
      .header-more-btn:hover { background: #f3f4f6; border-color: #1877f2; color: #1877f2; }
      .header-more-btn i { font-size: 12px; }
      .more-dropdown {
        position: absolute;
        top: 48px;
        right: 8px;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.12);
        min-width: 240px;
        max-height: 60vh;
        overflow-y: auto;
        z-index: 10000;
        display: none;
        padding: 6px;
      }
      .more-dropdown.show { display: block; }
      .more-dropdown .dropdown-item {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 13px;
        color: #374151;
        text-decoration: none;
        transition: 0.1s;
      }
      .more-dropdown .dropdown-item:hover { background: #f3f4f6; }
      .more-dropdown .dropdown-item.active { background: #e7f3ff; color: #1877f2; font-weight: 600; }
      .more-dropdown .dropdown-section {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #9ca3af;
        padding: 8px 12px 4px;
        font-weight: 600;
      }

      @media (max-width: 768px) {
        .global-top-header { padding: 0 8px; height: 46px; }
        .header-brand { font-size: 13px; margin-right: 8px; }
        .header-brand span { display: none; }
        .header-link { padding: 6px 8px; font-size: 12px; }
        .header-link-text { display: none; }
        .header-link i { font-size: 16px; }
        .header-more-btn { padding: 6px 10px; font-size: 12px; }
      }
    </style>

    <div class="global-top-header">
      <a class="header-brand" onclick="loadSection('dashboard')">
        <i class="fab fa-whatsapp text-success"></i>
        <span>11 Avatar CRM</span>
      </a>
      
      <div class="header-nav">
        ${mainLinks}
      </div>
      
      <div style="position:relative;">
        <button class="header-more-btn" id="moreBtn" onclick="toggleMoreDropdown()">
          <i class="fas fa-th-large"></i>
          <span>More</span>
          <i class="fas fa-chevron-down" style="font-size:10px;"></i>
        </button>
        <div class="more-dropdown" id="moreDropdown">
          <div class="dropdown-section">More Tools</div>
          ${moreLinks}
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('afterbegin', headerHTML);

  // Sub menu (bottom)
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

  // Close dropdown on outside click
  setTimeout(() => {
    document.addEventListener('click', function closeMore(e) {
      if (!e.target.closest('#moreBtn') && !e.target.closest('#moreDropdown')) {
        document.getElementById('moreDropdown')?.classList.remove('show');
        document.removeEventListener('click', closeMore);
      }
    });
  }, 100);
}

// Global toggle function
function toggleMoreDropdown() {
  document.getElementById('moreDropdown')?.classList.toggle('show');
}
