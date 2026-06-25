const Social = {
  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading social chats...</p>';

    let fbConfig = {};
    let igConfig = {};
    let messages = [];
    try {
      const fbDoc = await db.collection('settings').doc('facebook').get();
      if (fbDoc.exists) fbConfig = fbDoc.data();
      const igDoc = await db.collection('settings').doc('instagram').get();
      if (igDoc.exists) igConfig = igDoc.data();
      const snap = await db.collection('socialMessages').orderBy('createdAt', 'desc').limit(100).get();
      messages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error('Error:', err);
    }

    let html = `
      <div class="row g-3">
        <div class="col-12">
          <ul class="nav nav-tabs" id="socialTabs">
            <li class="nav-item"><a class="nav-link active" data-tab="facebook" onclick="Social.switchTab('facebook')"><i class="fab fa-facebook text-primary me-1"></i>Facebook</a></li>
            <li class="nav-item"><a class="nav-link" data-tab="instagram" onclick="Social.switchTab('instagram')"><i class="fab fa-instagram text-danger me-1"></i>Instagram</a></li>
            <li class="nav-item"><a class="nav-link" data-tab="config" onclick="Social.switchTab('config')"><i class="fas fa-cog me-1"></i>Settings</a></li>
          </ul>
        </div>

        <div class="col-12" id="socialTabContent"></div>
      </div>
    `;
    contentArea.innerHTML = html;
    this.loadTab('facebook', fbConfig, igConfig, messages);
  },

  switchTab(tab) {
    document.querySelectorAll('#socialTabs .nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    this.loadTab(tab);
  },

  async loadTab(tab) {
    let fbConfig = {};
    let igConfig = {};
    let messages = [];
    try {
      const fbDoc = await db.collection('settings').doc('facebook').get();
      if (fbDoc.exists) fbConfig = fbDoc.data();
      const igDoc = await db.collection('settings').doc('instagram').get();
      if (igDoc.exists) igConfig = igDoc.data();
      const snap = await db.collection('socialMessages').orderBy('createdAt', 'desc').limit(100).get();
      messages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {}

    const container = document.getElementById('socialTabContent');
    if (!container) return;

    if (tab === 'facebook') {
      container.innerHTML = `
        <div class="card-widget">
          <h5><i class="fab fa-facebook text-primary me-2"></i>Facebook Messenger</h5>
          ${fbConfig.pageAccessToken ? `
            <div class="alert alert-success py-1 px-2 small">Connected to Facebook Page</div>
            <div style="max-height:400px;overflow-y:auto;" id="fbMessages">
              ${messages.filter(m => m.platform === 'facebook').length === 0
                ? '<p class="text-muted text-center py-3">No Facebook messages yet.</p>'
                : messages.filter(m => m.platform === 'facebook').map(msg => `
                  <div class="border rounded p-2 mb-2 ${msg.type === 'incoming' ? 'bg-light' : ''}">
                    <strong>${msg.from || 'User'}</strong>
                    <p class="mb-0 small">${msg.body || '(media)'}</p>
                    <small class="text-muted">${msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleString() : ''}</small>
                  </div>
                `).join('')
              }
            </div>
            <div class="input-group mt-2">
              <input type="text" id="fbMessage" class="form-control form-control-sm" placeholder="Type reply...">
              <button class="btn btn-primary btn-sm" onclick="Social.sendReply('facebook')">Send</button>
            </div>
          ` : `
            <div class="alert alert-warning">Facebook not configured. Go to Settings tab.</div>
          `}
        </div>
      `;
    } else if (tab === 'instagram') {
      container.innerHTML = `
        <div class="card-widget">
          <h5><i class="fab fa-instagram text-danger me-2"></i>Instagram Direct</h5>
          ${igConfig.accessToken ? `
            <div class="alert alert-success py-1 px-2 small">Connected to Instagram</div>
            <div style="max-height:400px;overflow-y:auto;">
              ${messages.filter(m => m.platform === 'instagram').length === 0
                ? '<p class="text-muted text-center py-3">No Instagram messages yet.</p>'
                : messages.filter(m => m.platform === 'instagram').map(msg => `
                  <div class="border rounded p-2 mb-2 ${msg.type === 'incoming' ? 'bg-light' : ''}">
                    <strong>${msg.from || 'User'}</strong>
                    <p class="mb-0 small">${msg.body || '(media)'}</p>
                    <small class="text-muted">${msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleString() : ''}</small>
                  </div>
                `).join('')
              }
            </div>
            <div class="input-group mt-2">
              <input type="text" id="igMessage" class="form-control form-control-sm" placeholder="Type reply...">
              <button class="btn btn-danger btn-sm" onclick="Social.sendReply('instagram')">Send</button>
            </div>
          ` : `
            <div class="alert alert-warning">Instagram not configured. Go to Settings tab.</div>
          `}
        </div>
      `;
    } else if (tab === 'config') {
      container.innerHTML = `
        <div class="row g-3">
          <div class="col-md-6">
            <div class="card-widget">
              <h5><i class="fab fa-facebook text-primary me-2"></i>Facebook Setup</h5>
              <div class="mb-3">
                <label class="form-label small">Facebook Page ID</label>
                <input type="text" id="fbPageId" class="form-control form-control-sm" value="${fbConfig.pageId || ''}" placeholder="Enter Page ID">
              </div>
              <div class="mb-3">
                <label class="form-label small">Page Access Token</label>
                <input type="password" id="fbToken" class="form-control form-control-sm" value="${fbConfig.pageAccessToken || ''}" placeholder="EAA...">
              </div>
              <button class="btn btn-primary btn-sm" onclick="Social.saveConfig('facebook')"><i class="fas fa-save me-1"></i> Save</button>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card-widget">
              <h5><i class="fab fa-instagram text-danger me-2"></i>Instagram Setup</h5>
              <div class="mb-3">
                <label class="form-label small">Instagram Account ID</label>
                <input type="text" id="igAccountId" class="form-control form-control-sm" value="${igConfig.accountId || ''}" placeholder="Enter Account ID">
              </div>
              <div class="mb-3">
                <label class="form-label small">Access Token</label>
                <input type="password" id="igToken" class="form-control form-control-sm" value="${igConfig.accessToken || ''}" placeholder="EAA...">
              </div>
              <button class="btn btn-danger btn-sm" onclick="Social.saveConfig('instagram')"><i class="fas fa-save me-1"></i> Save</button>
            </div>
          </div>
        </div>
      `;
    }
  },

  async saveConfig(platform) {
    if (platform === 'facebook') {
      const pageId = document.getElementById('fbPageId').value.trim();
      const pageAccessToken = document.getElementById('fbToken').value.trim();
      if (!pageId || !pageAccessToken) return alert('Both fields required!');
      await db.collection('settings').doc('facebook').set({ pageId, pageAccessToken, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
      alert('✅ Facebook saved!');
    } else if (platform === 'instagram') {
      const accountId = document.getElementById('igAccountId').value.trim();
      const accessToken = document.getElementById('igToken').value.trim();
      if (!accountId || !accessToken) return alert('Both fields required!');
      await db.collection('settings').doc('instagram').set({ accountId, accessToken, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
      alert('✅ Instagram saved!');
    }
    this.render();
  },

  async sendReply(platform) {
    const msgId = platform === 'facebook' ? 'fbMessage' : 'igMessage';
    const message = document.getElementById(msgId)?.value.trim();
    if (!message) return alert('Type a message!');

    const cfg = (await db.collection('settings').doc(platform).get()).data();
    if (!cfg) return alert('Not configured!');

    await db.collection('socialMessages').add({
      platform, from: 'You', body: message, type: 'outgoing',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    document.getElementById(msgId).value = '';
    alert('✅ Reply sent! (Demo mode)');
    this.render();
  }
};
