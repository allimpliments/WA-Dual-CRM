// js/dashboard.js — World-Class SaaS Dashboard with Full Multi-Tenant Isolation
const Dashboard = {
  charts: {},
  refreshInterval: null,

  async render() {
    contentArea.style.paddingTop = '0px';
    contentArea.style.background = '#f1f5f9';

    const user = window.currentUser || {};
    const isPlatformAdmin = user.role === 'platform_owner' || user.role === 'platform_super_admin' || user.role === 'admin';
    const isClientUser = !!user.clientId && !isPlatformAdmin;
    const clientId = user.clientId;
    const userPerms = window.__currentPermissions || {};
    const userModules = userPerms.modules || {};
    
    // ✅ CHECK: Agar user pending hai ya no modules — empty dashboard dikhao
    if (user.status === 'pending' || (isClientUser && Object.keys(userModules).length === 0)) {
      contentArea.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:80vh;text-align:center;">
          <div>
            <i class="fas fa-clock fa-4x" style="color:#f59e0b;margin-bottom:20px;"></i>
            <h3 style="font-weight:700;color:#0f172a;">⏳ Awaiting Module Assignment</h3>
            <p style="color:#64748b;max-width:400px;margin:12px auto;">Your account is approved but no modules have been assigned yet. Please wait for the admin to assign modules, or contact support.</p>
            <button onclick="auth.signOut();window.location.href='/WA-Dual-CRM/home.html';" style="margin-top:16px;padding:10px 24px;background:#6366f1;color:#fff;border:none;border-radius:10px;cursor:pointer;font-weight:600;">← Back to Home</button>
          </div>
        </div>`;
      return;
    }

    // ✅ Only fetch data for modules user has access to
    const canAccessLeads = Permissions.canAccess('leads', 'read') || isPlatformAdmin;
    const canAccessContacts = Permissions.canAccess('contacts', 'read') || isPlatformAdmin;
    const canAccessCampaigns = Permissions.canAccess('campaigns', 'read') || isPlatformAdmin;
    const canAccessChats = Permissions.canAccess('chats', 'read') || isPlatformAdmin;
    const canAccessTickets = Permissions.canAccess('tickets', 'read') || isPlatformAdmin;
    const canAccessAppointments = Permissions.canAccess('appointments', 'read') || isPlatformAdmin;
    const canAccessKanban = Permissions.canAccess('kanban', 'read') || isPlatformAdmin;

    // ========== DATA FETCHING (All clientId isolated) ==========
    let totalLeads = 0, totalContacts = 0, totalCampaigns = 0, totalMessages = 0, totalTickets = 0, totalAppointments = 0;
    let wonLeads = 0, lostLeads = 0, newLeadsThisMonth = 0, totalValue = 0, wonValue = 0;
    let recentLeads = [], leadSources = {}, leadStatuses = {}, leadsByMonth = [];
    let upcomingAppointments = [], activeTickets = [], recentActivity = [], teamPerformance = [];
    let waConnected = false, campaignStats = { sent: 0, delivered: 0, failed: 0 };

    try {
      // Leads — only if user has access
      if (canAccessLeads) {
        let lQuery = db.collection('leads');
        if (shouldFilterByClient()) lQuery = lQuery.where('clientId', '==', clientId);
        const leadsSnap = await lQuery.get();
        totalLeads = leadsSnap.size;
        leadsSnap.forEach(d => {
          const l = d.data();
          if (l.status === 'won') { wonLeads++; wonValue += parseInt(l.value) || 0; }
          if (l.status === 'lost') lostLeads++;
          totalValue += parseInt(l.value) || 0;
          const s = l.source || 'Unknown'; leadSources[s] = (leadSources[s] || 0) + 1;
          const st = l.status || 'new'; leadStatuses[st] = (leadStatuses[st] || 0) + 1;
          const created = l.createdAt?.toDate();
          if (created && created.getMonth() === new Date().getMonth() && created.getFullYear() === new Date().getFullYear()) newLeadsThisMonth++;
        });
        recentLeads = leadsSnap.docs.sort((a,b) => (b.data().createdAt?.toMillis()||0) - (a.data().createdAt?.toMillis()||0)).slice(0, 8).map(d => ({ id: d.id, ...d.data() }));
        leadsByMonth = this.getMonthlyLeads(leadsSnap);
      }

      // Contacts — only if user has access
      if (canAccessContacts) {
        let cQuery = db.collection('contacts');
        if (shouldFilterByClient()) cQuery = cQuery.where('clientId', '==', clientId);
        totalContacts = (await cQuery.get()).size;
      }

      // Campaigns — only if user has access
      if (canAccessCampaigns) {
        let campQuery = db.collection('campaigns');
        if (shouldFilterByClient()) campQuery = campQuery.where('clientId', '==', clientId);
        const campSnap = await campQuery.get();
        totalCampaigns = campSnap.size;
        campSnap.forEach(d => { const c = d.data(); campaignStats.sent += c.sent||0; campaignStats.delivered += c.delivered||0; campaignStats.failed += c.failed||0; });
      }

      // Messages — only if user has access
      if (canAccessChats) {
        let mQuery = db.collection('messages');
        if (shouldFilterByClient()) mQuery = mQuery.where('clientId', '==', clientId);
        totalMessages = (await mQuery.get()).size;
      }

      // Tickets — only if user has access
      if (canAccessTickets) {
        let tQuery = db.collection('tickets');
        if (shouldFilterByClient()) tQuery = tQuery.where('clientId', '==', clientId);
        const ticketSnap = await tQuery.orderBy('createdAt','desc').limit(5).get();
        totalTickets = ticketSnap.size;
        activeTickets = ticketSnap.docs.filter(d => d.data().status !== 'closed').map(d => ({ id: d.id, ...d.data() }));
      }

      // Appointments — only if user has access
      if (canAccessAppointments) {
        let aQuery = db.collection('appointments');
        if (shouldFilterByClient()) aQuery = aQuery.where('clientId', '==', clientId);
        const apptSnap = await aQuery.where('date', '>=', new Date().toISOString().split('T')[0]).orderBy('date').limit(5).get();
        totalAppointments = apptSnap.size;
        upcomingAppointments = apptSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      }

      // WhatsApp status
      const waDoc = await db.collection('settings').doc('whatsapp').get();
      waConnected = waDoc.exists && !!waDoc.data().accessToken;

      // Team performance (for client users)
      if (isClientUser) {
        const teamSnap = await db.collection('users').where('clientId','==',clientId).get();
        teamPerformance = teamSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (canAccessLeads) {
          for (let tm of teamPerformance) {
            const tmLeads = (await db.collection('leads').where('assignedTo','==',tm.id).where('clientId','==',clientId).get()).docs;
            tm.leadCount = tmLeads.length;
            tm.wonCount = tmLeads.filter(d => d.data().status === 'won').length;
          }
        }
        teamPerformance.sort((a,b) => (b.leadCount||0) - (a.leadCount||0));
      }

    } catch(e) { console.error('Dashboard error:', e); }

    // Platform admin stats
    let platformStats = {};
    if (isPlatformAdmin) {
      try {
        const [clSnap, usSnap, allLeadsSnap] = await Promise.all([
          db.collection('clients').get(), db.collection('users').get(), db.collection('leads').get()
        ]);
        platformStats.totalClients = clSnap.size;
        platformStats.totalUsers = usSnap.size;
        platformStats.totalLeads = allLeadsSnap.size;
        platformStats.pendingClients = clSnap.docs.filter(d => d.data().status === 'pending').length;
      } catch(e) {}
    }

    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
    const deliveryRate = campaignStats.sent > 0 ? Math.round((campaignStats.delivered / campaignStats.sent) * 100) : 0;
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    let html = `
      <style>
        .dash-wrap { max-width: 1500px; margin: 0 auto; padding: 12px; }
        .dash-hero { background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%); border-radius: 24px; padding: 32px 36px; margin-bottom: 24px; color: #fff; position: relative; overflow: hidden; }
        .dash-hero::before { content: ''; position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%); border-radius: 50%; }
        .dash-hero::after { content: ''; position: absolute; bottom: -80px; left: 20%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%); border-radius: 50%; }
        .dash-hero-content { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }
        .dash-hero h3 { font-size: 28px; font-weight: 800; margin: 0; }
        .dash-hero p { margin: 4px 0 0; color: #94a3b8; font-size: 14px; }
        .dash-hero-stats { display: flex; gap: 32px; }
        .dash-hero-stat { text-align: center; }
        .dash-hero-stat .val { font-size: 28px; font-weight: 800; }
        .dash-hero-stat .lbl { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
        .dash-kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; margin-bottom: 24px; }
        .dash-kpi { background: #fff; border-radius: 16px; padding: 20px 24px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; transition: all 0.2s; cursor: pointer; }
        .dash-kpi:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.06); transform: translateY(-2px); }
        .dash-kpi-icon { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
        .dash-kpi-info .num { font-size: 26px; font-weight: 800; line-height: 1.1; color: #0f172a; }
        .dash-kpi-info .lbl { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
        .dash-kpi-info .sub { font-size: 11px; font-weight: 600; margin-top: 2px; }
        .dash-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 16px; }
        .dash-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
        .dash-card { background: #fff; border-radius: 16px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; }
        .dash-card h5 { font-weight: 700; font-size: 15px; color: #0f172a; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .dash-card h5 i { color: #6366f1; }
        .dash-chart-box { height: 240px; position: relative; }
        .dash-recent-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
        .dash-recent-item:last-child { border-bottom: none; }
        .dash-avatar { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 14px; flex-shrink: 0; }
        .dash-status-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; margin-right: 4px; }
        .dash-progress-bar { height: 6px; border-radius: 10px; background: #f1f5f9; overflow: hidden; margin-top: 4px; }
        .dash-progress-fill { height: 100%; border-radius: 10px; transition: width 1s ease; }
        .dash-btn { padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .dash-btn-primary { background: #6366f1; color: #fff; }
        .dash-btn-primary:hover { background: #4f46e5; }
        .dash-btn-outline { background: #fff; color: #6366f1; border: 1px solid #e2e8f0; }
        .dash-btn-outline:hover { background: #eef2ff; border-color: #6366f1; }
        .dash-ai-insight { background: linear-gradient(135deg, #eef2ff, #faf5ff); border: 1px solid #c7d2fe; border-radius: 12px; padding: 14px 18px; margin-bottom: 10px; }
        .dash-ai-insight .icon { font-size: 20px; margin-right: 8px; }
        .dash-bar-row { margin-bottom: 14px; }
        .dash-bar-label { display: flex; justify-content: space-between; font-size: 12px; font-weight: 500; margin-bottom: 4px; color: #475569; }
        .dash-bar { height: 8px; border-radius: 10px; background: #f1f5f9; overflow: hidden; }
        .dash-bar-fill { height: 100%; border-radius: 10px; transition: width 1s ease; }
        @media (max-width: 1024px) { .dash-grid, .dash-grid-3 { grid-template-columns: 1fr; } .dash-hero-stats { gap: 16px; } }
        @media (max-width: 640px) { .dash-kpi-grid { grid-template-columns: repeat(2, 1fr); } .dash-hero { padding: 20px; } .dash-hero h3 { font-size: 20px; } }
      </style>

      <div class="dash-wrap">
        <!-- HERO -->
        <div class="dash-hero">
          <div class="dash-hero-content">
            <div>
              <h3>👋 Good ${new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, ${(user.name||'User').split(' ')[0]}</h3>
              <p>${waConnected ? '✅ All systems operational' : '⚠️ WhatsApp not configured'} · ${isPlatformAdmin ? 'Platform Overview' : 'Company Dashboard'} · ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div class="dash-hero-stats">
              <div class="dash-hero-stat"><div class="val" style="color:#6366f1;">${totalLeads}</div><div class="lbl">Leads</div></div>
              <div class="dash-hero-stat"><div class="val" style="color:#10b981;">${wonLeads}</div><div class="lbl">Won</div></div>
              <div class="dash-hero-stat"><div class="val" style="color:#f59e0b;">${conversionRate}%</div><div class="lbl">Conv.</div></div>
              ${isPlatformAdmin ? `<div class="dash-hero-stat"><div class="val" style="color:#ec4899;">${platformStats.pendingClients||0}</div><div class="lbl">Pending</div></div>` : ''}
            </div>
          </div>
        </div>

        <!-- KPI ROW -->
        <div class="dash-kpi-grid">
          ${canAccessLeads ? `
          <div class="dash-kpi" onclick="Leads.render()">
            <div class="dash-kpi-icon" style="background:#eef2ff;"><i class="fas fa-user-plus" style="color:#6366f1;"></i></div>
            <div class="dash-kpi-info"><div class="num">${totalLeads}</div><div class="lbl">Total Leads</div><div class="sub" style="color:#10b981;">↑ ${newLeadsThisMonth} this month</div></div>
          </div>` : ''}
          ${canAccessContacts ? `
          <div class="dash-kpi" onclick="Contacts.render()">
            <div class="dash-kpi-icon" style="background:#ecfdf5;"><i class="fas fa-users" style="color:#10b981;"></i></div>
            <div class="dash-kpi-info"><div class="num">${totalContacts}</div><div class="lbl">Contacts</div></div>
          </div>` : ''}
          ${canAccessKanban || canAccessLeads ? `
          <div class="dash-kpi" onclick="Kanban.render()">
            <div class="dash-kpi-icon" style="background:#fef3c7;"><i class="fas fa-trophy" style="color:#f59e0b;"></i></div>
            <div class="dash-kpi-info"><div class="num">${wonLeads}</div><div class="lbl">Won Deals</div><div class="sub" style="color:#6366f1;">₹${wonValue.toLocaleString()}</div></div>
          </div>` : ''}
          <div class="dash-kpi">
            <div class="dash-kpi-icon" style="background:#fce7f3;"><i class="fas fa-rupee-sign" style="color:#ec4899;"></i></div>
            <div class="dash-kpi-info"><div class="num">₹${totalValue >= 100000 ? (totalValue/100000).toFixed(1)+'L' : totalValue.toLocaleString()}</div><div class="lbl">Pipeline Value</div></div>
          </div>
          ${canAccessCampaigns ? `
          <div class="dash-kpi" onclick="Campaigns.render()">
            <div class="dash-kpi-icon" style="background:#f0fdf4;"><i class="fas fa-rocket" style="color:#22c55e;"></i></div>
            <div class="dash-kpi-info"><div class="num">${totalCampaigns}</div><div class="lbl">Campaigns</div><div class="sub" style="color:#f59e0b;">${deliveryRate}% delivery</div></div>
          </div>` : ''}
          ${canAccessChats ? `
          <div class="dash-kpi" onclick="Chats.render()">
            <div class="dash-kpi-icon" style="background:#e0f2fe;"><i class="fas fa-comments" style="color:#0ea5e9;"></i></div>
            <div class="dash-kpi-info"><div class="num">${totalMessages}</div><div class="lbl">Messages</div></div>
          </div>` : ''}
        </div>

        <div class="dash-grid">
          <!-- LEFT COLUMN -->
          <div>
            ${canAccessLeads ? `
            <div class="dash-card" style="margin-bottom:16px;">
              <h5><i class="fas fa-chart-line"></i> Lead Trend (Last 6 Months)</h5>
              <div class="dash-chart-box"><canvas id="leadTrendChart"></canvas></div>
            </div>` : ''}

            ${canAccessLeads ? `
            <div class="dash-card" style="margin-bottom:16px;">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 style="margin:0;"><i class="fas fa-clock"></i> Recent Leads</h5>
                <button class="dash-btn dash-btn-outline" style="padding:6px 12px;font-size:11px;" onclick="Leads.render()">View All →</button>
              </div>
              ${recentLeads.length === 0 ? '<p class="text-muted text-center py-3">No leads yet.</p>' : recentLeads.map(l => `
                <div class="dash-recent-item">
                  <div class="dash-avatar" style="background:${l.status==='won'?'#10b981':l.status==='lost'?'#94a3b8':'#6366f1'};">${(l.name||'?')[0].toUpperCase()}</div>
                  <div class="flex-grow-1">
                    <div style="font-weight:600;font-size:13px;">${l.name||'Unknown'} ${l.value ? '<span style="color:#10b981;font-weight:700;">₹'+parseInt(l.value).toLocaleString()+'</span>' : ''}</div>
                    <div style="font-size:11px;color:#64748b;">
                      <span class="dash-status-dot" style="background:${l.status==='won'?'#10b981':l.status==='lost'?'#ef4444':l.status==='new'?'#6366f1':l.status==='qualified'?'#3b82f6':'#f59e0b'};"></span>
                      ${l.status||'new'} · ${l.source||'Manual'} · ${l.createdAt?.toDate().toLocaleDateString()||''}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>` : ''}

            ${canAccessCampaigns && totalCampaigns > 0 ? `
            <div class="dash-card">
              <h5><i class="fas fa-paper-plane"></i> Campaign Delivery</h5>
              <div class="dash-bar-row">
                <div class="dash-bar-label"><span>Sent</span><span style="font-weight:600;">${campaignStats.sent}</span></div>
                <div class="dash-bar"><div class="dash-bar-fill" style="width:100%;background:#6366f1;"></div></div>
              </div>
              <div class="dash-bar-row">
                <div class="dash-bar-label"><span>Delivered</span><span style="font-weight:600;color:#10b981;">${campaignStats.delivered} (${deliveryRate}%)</span></div>
                <div class="dash-bar"><div class="dash-bar-fill" style="width:${deliveryRate}%;background:#10b981;"></div></div>
              </div>
              <div class="dash-bar-row">
                <div class="dash-bar-label"><span>Failed</span><span style="font-weight:600;color:#ef4444;">${campaignStats.failed}</span></div>
                <div class="dash-bar"><div class="dash-bar-fill" style="width:${campaignStats.sent>0?Math.round(campaignStats.failed/campaignStats.sent*100):0}%;background:#ef4444;"></div></div>
              </div>
            </div>` : ''}
          </div>

          <!-- RIGHT COLUMN -->
          <div>
            <!-- AI Insights -->
            <div class="dash-card" style="margin-bottom:16px;">
              <h5><i class="fas fa-robot" style="color:#8b5cf6;"></i> AI Insights</h5>
              ${conversionRate < 15 && totalLeads > 10 ? `<div class="dash-ai-insight"><span class="icon">⚠️</span><strong>Low Conversion:</strong> Your conversion rate is ${conversionRate}%. Try improving lead follow-up time.</div>` : ''}
              ${newLeadsThisMonth === 0 && totalLeads > 0 ? `<div class="dash-ai-insight"><span class="icon">📉</span><strong>No new leads this month.</strong> Consider running a campaign or sharing your lead form.</div>` : ''}
              ${deliveryRate < 70 && totalCampaigns > 0 ? `<div class="dash-ai-insight"><span class="icon">📊</span><strong>Delivery Issue:</strong> Only ${deliveryRate}% messages delivered. Check your WhatsApp templates.</div>` : ''}
              <div class="dash-ai-insight"><span class="icon">💡</span><strong>Tip:</strong> Leads with follow-up within 1 hour are <strong>7x more likely to convert</strong>.</div>
              <div class="dash-ai-insight"><span class="icon">🚀</span><strong>Growth:</strong> ${totalContacts > 0 ? `You have <strong>${totalContacts}</strong> contacts. Use campaigns to engage them!` : 'Start building your contact list to unlock campaign features.'}</div>
            </div>

            ${canAccessLeads ? `
            <div class="dash-card" style="margin-bottom:16px;">
              <h5><i class="fas fa-chart-pie"></i> Lead Status</h5>
              ${Object.keys(leadStatuses).length === 0 ? '<p class="text-muted text-center py-2">No data</p>' : Object.entries(leadStatuses).map(([k,v]) => {
                const pct = Math.round((v/totalLeads)*100);
                const colors = {new:'#6366f1',contacted:'#8b5cf6',qualified:'#3b82f6',proposal:'#f59e0b',negotiation:'#f97316',won:'#10b981',lost:'#ef4444'};
                return `<div class="dash-bar-row">
                  <div class="dash-bar-label"><span>${k.charAt(0).toUpperCase()+k.slice(1)}</span><span style="color:${colors[k]||'#6366f1'};font-weight:600;">${v} (${pct}%)</span></div>
                  <div class="dash-bar"><div class="dash-bar-fill" style="width:${pct}%;background:${colors[k]||'#6366f1'};"></div></div>
                </div>`;
              }).join('')}
            </div>` : ''}

            ${canAccessAppointments && upcomingAppointments.length > 0 ? `
            <div class="dash-card" style="margin-bottom:16px;">
              <h5><i class="fas fa-calendar-check" style="color:#f59e0b;"></i> Upcoming Appointments</h5>
              ${upcomingAppointments.map(a => `
                <div class="dash-recent-item">
                  <div class="dash-avatar" style="background:#f59e0b;"><i class="fas fa-calendar"></i></div>
                  <div class="flex-grow-1">
                    <div style="font-weight:600;font-size:13px;">${a.title||a.name||'Appointment'}</div>
                    <div style="font-size:11px;color:#64748b;">${a.date||''} ${a.time||''} · ${a.status||'Scheduled'}</div>
                  </div>
                </div>
              `).join('')}
            </div>` : ''}

            ${isClientUser && teamPerformance.length > 0 ? `
            <div class="dash-card">
              <h5><i class="fas fa-users" style="color:#8b5cf6;"></i> Team Performance</h5>
              ${teamPerformance.slice(0,5).map(tm => `
                <div class="dash-recent-item">
                  <div class="dash-avatar" style="background:${getAvatarColor(tm.name)};">${getInitials(tm.name||tm.email)}</div>
                  <div class="flex-grow-1">
                    <div style="font-weight:600;font-size:13px;">${tm.name||'Unnamed'}</div>
                    <div style="font-size:11px;color:#64748b;">${tm.leadCount||0} leads · ${tm.wonCount||0} won</div>
                  </div>
                  <div style="font-size:18px;font-weight:800;color:#6366f1;">${tm.wonCount||0}/${tm.leadCount||0}</div>
                </div>
              `).join('')}
            </div>` : ''}
          </div>
        </div>

        <!-- QUICK ACTIONS -->
        <div class="dash-grid-3">
          ${canAccessLeads ? `<button class="dash-btn dash-btn-primary" style="justify-content:center;padding:14px;" onclick="Leads.showAddForm()"><i class="fas fa-plus-circle"></i> Add New Lead</button>` : `<div></div>`}
          ${canAccessContacts ? `<button class="dash-btn dash-btn-outline" style="justify-content:center;padding:14px;" onclick="Contacts.showAddForm()"><i class="fas fa-user-plus"></i> Add Contact</button>` : `<div></div>`}
          ${canAccessKanban ? `<button class="dash-btn dash-btn-outline" style="justify-content:center;padding:14px;" onclick="Kanban.render()"><i class="fas fa-tasks"></i> Open Pipeline</button>` : `<div></div>`}
        </div>
      </div>
    `;
    contentArea.innerHTML = html;

    // Render Chart
    setTimeout(() => this.renderLeadTrendChart(leadsByMonth), 300);
  },

  getMonthlyLeads(snap) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const count = snap.docs.filter(doc => {
        const created = doc.data().createdAt?.toDate();
        return created && created.getMonth() === d.getMonth() && created.getFullYear() === d.getFullYear();
      }).length;
      result.push({ month: months[d.getMonth()], value: count });
    }
    return result;
  },

  renderLeadTrendChart(data) {
    const ctx = document.getElementById('leadTrendChart')?.getContext('2d');
    if (!ctx || !data.length) return;
    if (this.charts.leadTrend) this.charts.leadTrend.destroy();
    this.charts.leadTrend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.month),
        datasets: [{
          label: 'Leads',
          data: data.map(d => d.value),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
          x: { grid: { display: false }, ticks: { font: { size: 11 } } }
        }
      }
    });
  }
};
