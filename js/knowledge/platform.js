window.__renderPlatformGuides = function(Knowledge, contentArea, db, firebase) {
  var guides = [
    {t:'Templates',d:'WhatsApp message templates: create, sync, submit, send.',f:'js/knowledge/guides/templates.js',icon:'fa-layer-group',c:'#4f46e5'},
    {t:'Campaigns',d:'Bulk & Drip campaigns with targeting.',f:'js/knowledge/guides/campaigns.js',icon:'fa-rocket',c:'#f59e0b'},
    {t:'Chats',d:'Unified inbox: WhatsApp, FB, IG.',f:'js/knowledge/guides/chats.js',icon:'fa-comments',c:'#25D366'},
    {t:'Contacts',d:'Manage contacts, groups, CSV import.',f:'js/knowledge/guides/contacts.js',icon:'fa-users',c:'#1877f2'},
    {t:'Leads',d:'Lead capture, pipeline, filters.',f:'js/knowledge/guides/leads.js',icon:'fa-funnel-dollar',c:'#4f46e5'},
    {t:'Kanban',d:'Visual pipeline: 7 stages.',f:'js/knowledge/guides/kanban.js',icon:'fa-tasks',c:'#6366f1'},
    {t:'Flows',d:'Meta templates + visual builder.',f:'js/knowledge/guides/flows.js',icon:'fa-sitemap',c:'#8b5cf6'},
    {t:'Social',d:'Multi-platform posting.',f:'js/knowledge/guides/social.js',icon:'fa-globe',c:'#1877f2'}
  ];

  var h = '<style>.kh-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:18px;cursor:pointer;transition:0.25s;}.kh-card:hover{border-color:#3b82f6;box-shadow:0 8px 20px rgba(0,0,0,0.05);}</style>';
  h += '<button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection=\'home\';Knowledge.render();">← Back to Hub</button>';
  h += '<h5 style="font-weight:700;">Platform Mastery</h5><p class="text-muted small mb-3">Complete user guides for all CRM features. Click any card to view.</p><div class="row g-3">';

  guides.forEach(function(g) {
    h += '<div class="col-md-6"><div class="kh-card" onclick="var d=document.getElementById(\'gd\');d.style.display=\'block\';d.innerHTML=\'Loading...\';d.scrollIntoView({behavior:\'smooth\'});fetch(\''+g.f+'\').then(function(r){return r.text()}).then(function(c){d.innerHTML=c;});" style="display:flex;gap:12px;cursor:pointer;"><div style="width:40px;height:40px;border-radius:8px;background:'+g.c+'15;color:'+g.c+';display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fas '+g.icon+'"></i></div><div><h6 style="font-weight:600;">'+g.t+'</h6><p style="font-size:11px;color:#6b7280;">'+g.d+'</p></div></div></div>';
  });

  h += '</div><div id="gd" style="display:none;background:#fff;border-radius:14px;padding:24px;margin-top:16px;border:1px solid #e5e7eb;"></div>';
  contentArea.innerHTML = h;
}; 
