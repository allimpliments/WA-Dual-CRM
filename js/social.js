const Social = {
  currentTab: 'facebook-chat',

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading social...</p>';

    let fbConfig = {}, igConfig = {}, messages = [], scheduledPosts = [];
    try {
      const fbDoc = await db.collection('settings').doc('facebook').get();
      if (fbDoc.exists) fbConfig = fbDoc.data();
      const igDoc = await db.collection('settings').doc('instagram').get();
      if (igDoc.exists) igConfig = igDoc.data();
      const snap = await db.collection('socialMessages').orderBy('createdAt', 'desc').limit(100).get();
      messages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const schedSnap = await db.collection('scheduledPosts').orderBy('scheduledAt').get();
      scheduledPosts = schedSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) { console.error(err); }

    let html = `
      <ul class="nav nav-tabs mb-3">
        <li class="nav-item"><a class="nav-link ${this.currentTab==='facebook-chat'?'active':''}" onclick="Social.switchTab('facebook-chat')"><i class="fab fa-facebook text-primary me-1"></i>FB Chat</a></li>
        <li class="nav-item"><a class="nav-link ${this.currentTab==='instagram-chat'?'active':''}" onclick="Social.switchTab('instagram-chat')"><i class="fab fa-instagram text-danger me-1"></i>IG Chat</a></li>
        <li class="nav-item"><a class="nav-link ${this.currentTab==='create-post'?'active':''}" onclick="Social.switchTab('create-post')"><i class="fas fa-plus-circle me-1"></i>Create Post</a></li>
        <li class="nav-item"><a class="nav-link ${this.currentTab==='scheduled'?'active':''}" onclick="Social.switchTab('scheduled')"><i class="fas fa-calendar-alt me-1"></i>Scheduled</a></li>
        <li class="nav-item"><a class="nav-link ${this.currentTab==='settings'?'active':''}" onclick="Social.switchTab('settings')"><i class="fas fa-cog me-1"></i>Settings</a></li>
      </ul>
      <div id="socialTabContent"></div>
    `;
    contentArea.innerHTML = html;
    this.loadTabContent(fbConfig, igConfig, messages, scheduledPosts);
    this.startPolling();
  },

  switchTab(tab) {
    this.currentTab = tab;
    this.render();
  },

  loadTabContent(fbConfig, igConfig, messages, scheduledPosts) {
    const container = document.getElementById('socialTabContent');
    if (!container) return;

    if (this.currentTab === 'facebook-chat') {
      const fbMessages = messages.filter(m => m.platform === 'facebook');
      container.innerHTML = `
        <div class="card-widget">
          <h5><i class="fab fa-facebook text-primary me-2"></i>Facebook Messenger</h5>
          ${fbConfig.pageAccessToken
            ? '<div class="alert alert-success py-1 px-2 small">Connected ✅</div>'
            : '<div class="alert alert-warning py-1 px-2 small">Not configured. Go to Settings.</div>'}
          <div style="max-height:400px;overflow-y:auto;" id="fbChatList">
            ${fbMessages.length === 0
              ? '<p class="text-muted text-center py-3">No messages yet.</p>'
              : fbMessages.map(m => `
                <div class="border rounded p-2 mb-1 ${m.type === 'incoming' ? 'bg-light' : ''}">
                  <strong>${m.from || 'User'}</strong>: ${m.body || '(media)'}
                  <br><small class="text-muted">${m.createdAt ? new Date(m.createdAt.toDate()).toLocaleString() : ''}</small>
                </div>
              `).join('')}
          </div>
          <div class="input-group mt-2">
            <input id="fbMsgInput" class="form-control form-control-sm" placeholder="Type reply...">
            <button class="btn btn-primary btn-sm" onclick="Social.sendReply('facebook')"><i class="fas fa-paper-plane"></i> Send</button>
          </div>
        </div>
      `;
    } else if (this.currentTab === 'instagram-chat') {
      const igMessages = messages.filter(m => m.platform === 'instagram');
      container.innerHTML = `
        <div class="card-widget">
          <h5><i class="fab fa-instagram text-danger me-2"></i>Instagram Direct</h5>
          ${igConfig.accessToken
            ? '<div class="alert alert-success py-1 px-2 small">Connected ✅</div>'
            : '<div class="alert alert-warning py-1 px-2 small">Not configured. Go to Settings.</div>'}
          <div style="max-height:400px;overflow-y:auto;" id="igChatList">
            ${igMessages.length === 0
              ? '<p class="text-muted text-center py-3">No messages yet.</p>'
              : igMessages.map(m => `
                <div class="border rounded p-2 mb-1 ${m.type === 'incoming' ? 'bg-light' : ''}">
                  <strong>${m.from || 'User'}</strong>: ${m.body || '(media)'}
                  <br><small class="text-muted">${m.createdAt ? new Date(m.createdAt.toDate()).toLocaleString() : ''}</small>
                </div>
              `).join('')}
          </div>
          <div class="input-group mt-2">
            <input id="igMsgInput" class="form-control form-control-sm" placeholder="Type reply...">
            <button class="btn btn-danger btn-sm" onclick="Social.sendReply('instagram')"><i class="fas fa-paper-plane"></i> Send</button>
          </div>
        </div>
      `;
    } else if (this.currentTab === 'create-post') {
      container.innerHTML = `
        <div class="card-widget">
          <h5><i class="fas fa-plus-circle me-2"></i>Create Social Media Post</h5>
          <div class="mb-3">
            <label class="form-label small fw-bold">Platform</label>
            <select id="postPlatform" class="form-select form-select-sm">
              <option value="facebook">Facebook Page</option>
              <option value="instagram">Instagram Business</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label small fw-bold">Message</label>
            <textarea id="postMessage" class="form-control form-control-sm" rows="4" placeholder="What's on your mind?"></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label small fw-bold">Image URL (optional)</label>
            <input type="url" id="postImageUrl" class="form-control form-control-sm" placeholder="https://example.com/image.jpg">
          </div>
          <div class="row mb-3">
            <div class="col-6">
              <label class="form-label small fw-bold">Schedule (optional)</label>
              <input type="datetime-local" id="postSchedule" class="form-control form-control-sm">
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="Social.postNow()"><i class="fas fa-paper-plane me-1"></i> Post Now</button>
          <button class="btn btn-outline-primary btn-sm ms-1" onclick="Social.schedulePost()"><i class="fas fa-clock me-1"></i> Schedule</button>
          <div id="postResult" class="mt-2"></div>
        </div>
      `;
    } else if (this.currentTab === 'scheduled') {
      container.innerHTML = `
        <div class="card-widget">
          <h5><i class="fas fa-calendar-alt me-2"></i>Scheduled Posts</h5>
          ${scheduledPosts.length === 0
            ? '<p class="text-muted text-center py-3">No scheduled posts.</p>'
            : scheduledPosts.map(p => `
              <div class="border rounded p-2 mb-2">
                <div class="d-flex justify-content-between">
                  <strong><i class="fab fa-${p.platform === 'facebook' ? 'facebook text-primary' : 'instagram text-danger'} me-1"></i>${p.platform}</strong>
                  <span class="badge bg-${p.status === 'pending' ? 'warning' : 'success'}">${p.status || 'pending'}</span>
                </div>
                <p class="mb-1 small">${p.message}</p>
                ${p.imageUrl ? `<small class="text-muted">Image: ${p.imageUrl}</small><br>` : ''}
                <small class="text-muted">Scheduled: ${new Date(p.scheduledAt).toLocaleString()}</small>
                <button class="btn btn-sm btn-outline-danger float-end" onclick="Social.deleteScheduled('${p.id}')"><i class="fas fa-trash"></i></button>
              </div>
            `).join('')}
        </div>
      `;
    } else if (this.currentTab === 'settings') {
      container.innerHTML = `
        <div class="row g-3">
          <div class="col-md-6">
            <div class="card-widget">
              <h5><i class="fab fa-facebook text-primary me-2"></i>Facebook Setup</h5>
              <div class="mb-3">
                <label class="form-label small fw-bold">Facebook Page ID</label>
                <input type="text" id="fbPageId" class="form-control form-control-sm" value="${fbConfig.pageId || ''}" placeholder="Enter Page ID">
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold">Page Access Token</label>
                <input type="password" id="fbToken" class="form-control form-control-sm" value="${fbConfig.pageAccessToken || ''}" placeholder="EAA...">
              </div>
              <button class="btn btn-primary btn-sm" onclick="Social.saveConfig('facebook')"><i class="fas fa-save me-1"></i> Save</button>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card-widget">
              <h5><i class="fab fa-instagram text-danger me-2"></i>Instagram Setup</h5>
              <div class="mb-3">
                <label class="form-label small fw-bold">Instagram Business Account ID</label>
                <input type="text" id="igAccountId" class="form-control form-control-sm" value="${igConfig.accountId || ''}" placeholder="Enter Account ID">
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold">Access Token</label>
                <input type="password" id="igToken" class="form-control form-control-sm" value="${igConfig.accessToken || ''}" placeholder="EAA...">
              </div>
              <button class="btn btn-danger btn-sm" onclick="Social.saveConfig('instagram')"><i class="fas fa-save me-1"></i> Save</button>
            </div>
          </div>
        </div>
      `;
    }
  },

  async sendReply(platform) {
    const inputId = platform === 'facebook' ? 'fbMsgInput' : 'igMsgInput';
    const msg = document.getElementById(inputId)?.value?.trim();
    if (!msg) return alert('Type a message!');
    
    // Save to Firestore
    await db.collection('socialMessages').add({
      platform,
      from: 'You',
      body: msg,
      type: 'outgoing',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    document.getElementById(inputId).value = '';
    this.render();
    alert('✅ Reply sent! (Demo mode - Webhook needed for real send)');
  },

  async postNow() {
    const platform = document.getElementById('postPlatform').value;
    const message = document.getElementById('postMessage').value.trim();
    const imageUrl = document.getElementById('postImageUrl').value.trim();

    if (!message) return alert('Enter a message!');

    document.getElementById('postResult').innerHTML = '<span class="text-info">Posting...</span>';

    if (platform === 'facebook') {
      const cfg = (await db.collection('settings').doc('facebook').get()).data();
      if (!cfg?.pageAccessToken || !cfg?.pageId) return alert('Facebook not configured.');
      
      try {
        const params = new URLSearchParams({ message, access_token: cfg.pageAccessToken });
        if (imageUrl) params.append('link', imageUrl);
        
        const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.pageId}/feed`, {
          method: 'POST',
          body: params
        });
        const result = await res.json();
        document.getElementById('postResult').innerHTML = res.ok
          ? `<span class="text-success">✅ Posted! ID: ${result.id}</span>`
          : `<span class="text-danger">❌ ${result.error?.message || 'Failed'}</span>`;
      } catch (err) {
        document.getElementById('postResult').innerHTML = `<span class="text-danger">❌ ${err.message}</span>`;
      }
    } else if (platform === 'instagram') {
      const cfg = (await db.collection('settings').doc('instagram').get()).data();
      if (!cfg?.accessToken || !cfg?.accountId) return alert('Instagram not configured.');
      
      try {
        const igUserId = cfg.accountId;
        const params = new URLSearchParams({ caption: message, access_token: cfg.accessToken });
        if (imageUrl) params.append('image_url', imageUrl);
        
        const createRes = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media`, { method: 'POST', body: params });
        const createData = await createRes.json();
        
        if (createRes.ok && createData.id) {
          const publishRes = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media_publish`, {
            method: 'POST',
            body: new URLSearchParams({ creation_id: createData.id, access_token: cfg.accessToken })
          });
          const publishData = await publishRes.json();
          document.getElementById('postResult').innerHTML = publishRes.ok
            ? `<span class="text-success">✅ Posted! ID: ${publishData.id}</span>`
            : `<span class="text-danger">❌ ${publishData.error?.message || 'Failed'}</span>`;
        } else {
          document.getElementById('postResult').innerHTML = `<span class="text-danger">❌ ${createData.error?.message || 'Failed'}</span>`;
        }
      } catch (err) {
        document.getElementById('postResult').innerHTML = `<span class="text-danger">❌ ${err.message}</span>`;
      }
    }
  },

  async schedulePost() {
    const platform = document.getElementById('postPlatform').value;
    const message = document.getElementById('postMessage').value.trim();
    const imageUrl = document.getElementById('postImageUrl').value.trim();
    const scheduledAt = document.getElementById('postSchedule').value;

    if (!message) return alert('Enter a message!');
    if (!scheduledAt) return alert('Select schedule date/time!');

    await db.collection('scheduledPosts').add({
      platform,
      message,
      imageUrl,
      scheduledAt: new Date(scheduledAt).toISOString(),
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert('✅ Post scheduled!');
    this.render();
  },

  async deleteScheduled(id) {
    if (!confirm('Delete scheduled post?')) return;
    await db.collection('scheduledPosts').doc(id).delete();
    alert('Deleted.');
    this.render();
  },

  async saveConfig(platform) {
    if (platform === 'facebook') {
      const pageId = document.getElementById('fbPageId').value.trim();
      const pageAccessToken = document.getElementById('fbToken').value.trim();
      if (!pageId || !pageAccessToken) return alert('Both fields required!');
      await db.collection('settings').doc('facebook').set({
        pageId, pageAccessToken,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert('✅ Facebook saved!');
    } else if (platform === 'instagram') {
      const accountId = document.getElementById('igAccountId').value.trim();
      const accessToken = document.getElementById('igToken').value.trim();
      if (!accountId || !accessToken) return alert('Both fields required!');
      await db.collection('settings').doc('instagram').set({
        accountId, accessToken,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert('✅ Instagram saved!');
    }
    this.render();
  },

  startPolling() {
    if (this._polling) clearInterval(this._polling);
    this._polling = setInterval(() => {
      if (document.getElementById('socialTabContent') && 
          (this.currentTab === 'facebook-chat' || this.currentTab === 'instagram-chat')) {
        this.render();
      }
    }, 15000);
  }
};
