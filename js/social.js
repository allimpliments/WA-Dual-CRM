const Social = {
  currentTab: 'published',
  selectedPage: null,
  selectedInsta: null,
  pages: [],
  instaAccounts: [],

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading social dashboard...</p>';

    // Load connected pages & instagram accounts
    await this.loadBusinessAssets();

    let fbConfig = {}, igConfig = {};
    try {
      const fbDoc = await db.collection('settings').doc('facebook').get();
      if (fbDoc.exists) fbConfig = fbDoc.data();
      const igDoc = await db.collection('settings').doc('instagram').get();
      if (igDoc.exists) igConfig = igDoc.data();
    } catch (err) { console.error(err); }

    // Auto-select first available asset
    if (!this.selectedPage && fbConfig.pageId) this.selectedPage = fbConfig.pageId;
    if (!this.selectedInsta && igConfig.accountId) this.selectedInsta = igConfig.accountId;

    // Load posts from Firestore
    let posts = [];
    try {
      const snap = await db.collection('socialPosts').orderBy('createdAt', 'desc').get();
      posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {}

    // Filter by current tab
    if (this.currentTab === 'published') posts = posts.filter(p => p.status === 'published');
    else if (this.currentTab === 'scheduled') posts = posts.filter(p => p.status === 'scheduled');
    else if (this.currentTab === 'drafts') posts = posts.filter(p => p.status === 'draft');

    let html = `
      <style>
        .content-calendar { background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
        .asset-selector { display: flex; gap: 10px; margin-bottom: 16px; }
        .asset-chip { padding: 8px 16px; border-radius: 20px; cursor: pointer; border: 2px solid #e0e0e0; font-weight: 500; font-size: 13px; }
        .asset-chip.active { border-color: #2563eb; background: #eff6ff; color: #2563eb; }
        .tab-bar { display: flex; gap: 0; border-bottom: 2px solid #e0e0e0; margin-bottom: 16px; }
        .tab-item { padding: 10px 20px; cursor: pointer; font-weight: 500; font-size: 14px; color: #666; border-bottom: 2px solid transparent; margin-bottom: -2px; }
        .tab-item.active { color: #2563eb; border-bottom-color: #2563eb; }
        .post-card { border: 1px solid #e0e0e0; border-radius: 12px; padding: 12px; margin-bottom: 10px; display: flex; gap: 12px; align-items: start; }
        .post-card img, .post-card video { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; }
        .carousel-thumbs { display: flex; gap: 4px; flex-wrap: wrap; }
        .carousel-thumbs img { width: 56px; height: 56px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd; }
        .create-btn { background: #2563eb; color: #fff; border: none; padding: 10px 20px; border-radius: 24px; font-weight: 600; cursor: pointer; }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center; }
        .modal-card { background: #fff; border-radius: 16px; padding: 24px; width: 90%; max-width: 640px; max-height: 80vh; overflow-y: auto; }
      </style>

      <!-- Business Asset Selector -->
      <div class="content-calendar">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0"><i class="fas fa-calendar-alt me-2"></i>Content Calendar</h5>
          <button class="create-btn" onclick="Social.openCreateModal()"><i class="fas fa-plus me-1"></i> Create Post</button>
        </div>

        <!-- Asset Chips -->
        <div class="asset-selector">
          ${fbConfig.pageId ? `<span class="asset-chip ${this.selectedPage === fbConfig.pageId ? 'active' : ''}" onclick="Social.selectPage('${fbConfig.pageId}')"><i class="fab fa-facebook text-primary me-1"></i> Facebook Page</span>` : ''}
          ${igConfig.accountId ? `<span class="asset-chip ${this.selectedInsta === igConfig.accountId ? 'active' : ''}" onclick="Social.selectInsta('${igConfig.accountId}')"><i class="fab fa-instagram text-danger me-1"></i> Instagram</span>` : ''}
        </div>

        <!-- Tabs -->
        <div class="tab-bar">
          <div class="tab-item ${this.currentTab==='published'?'active':''}" onclick="Social.switchTab('published')">Published</div>
          <div class="tab-item ${this.currentTab==='scheduled'?'active':''}" onclick="Social.switchTab('scheduled')">Scheduled</div>
          <div class="tab-item ${this.currentTab==='drafts'?'active':''}" onclick="Social.switchTab('drafts')">Drafts</div>
        </div>

        <!-- Posts Grid -->
        <div id="postsContainer">
          ${posts.length === 0 ? '<p class="text-muted text-center py-4">No posts found.</p>' : posts.map(p => `
            <div class="post-card">
              ${p.media && p.media.length > 0 ? `
                <div class="carousel-thumbs">
                  ${p.media.slice(0, 4).map(m => `<img src="${m}" alt="media">`).join('')}
                  ${p.media.length > 4 ? `<span class="small text-muted">+${p.media.length - 4} more</span>` : ''}
                </div>
              ` : ''}
              <div class="flex-grow-1">
                <div class="d-flex justify-content-between">
                  <span class="badge bg-${p.platform === 'facebook' ? 'primary' : 'danger'}">${p.platform}</span>
                  <small class="text-muted">${new Date(p.createdAt?.toDate()).toLocaleString()}</small>
                </div>
                <p class="mb-1 mt-1">${p.message || '(no caption)'}</p>
                <small class="text-muted">Type: ${p.postType || 'post'} | Status: ${p.status}</small>
                <div class="mt-1">
                  ${p.status === 'draft' ? `<button class="btn btn-sm btn-outline-primary" onclick="Social.publishDraft('${p.id}')">Publish</button>` : ''}
                  <button class="btn btn-sm btn-outline-danger" onclick="Social.deletePost('${p.id}')"><i class="fas fa-trash"></i></button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div id="createModal"></div>
    `;
    contentArea.innerHTML = html;
  },

  selectPage(id) { this.selectedPage = id; this.render(); },
  selectInsta(id) { this.selectedInsta = id; this.render(); },
  switchTab(tab) { this.currentTab = tab; this.render(); },

  async loadBusinessAssets() {
    try {
      const fbDoc = await db.collection('settings').doc('facebook').get();
      if (fbDoc.exists) this.pages = [fbDoc.data()];
      const igDoc = await db.collection('settings').doc('instagram').get();
      if (igDoc.exists) this.instaAccounts = [igDoc.data()];
    } catch (e) {}
  },

  openCreateModal() {
    document.getElementById('createModal').innerHTML = `
      <div class="modal-overlay" onclick="Social.closeModal()">
        <div class="modal-card" onclick="event.stopPropagation()">
          <h5><i class="fas fa-plus-circle me-2"></i>Create New Post</h5>
          <div class="row g-2 mt-2">
            <div class="col-md-6">
              <label class="form-label small fw-bold">Platform</label>
              <select id="postPlatform" class="form-select form-select-sm">
                ${this.selectedPage ? '<option value="facebook">Facebook Page</option>' : ''}
                ${this.selectedInsta ? '<option value="instagram">Instagram Business</option>' : ''}
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-bold">Post Type</label>
              <select id="postType" class="form-select form-select-sm">
                <option value="post">Post</option>
                <option value="reel">Reel</option>
                <option value="story">Story</option>
              </select>
            </div>
            <div class="col-12">
              <label class="form-label small fw-bold">Caption</label>
              <textarea id="postCaption" class="form-control form-control-sm" rows="4" placeholder="Write your caption..."></textarea>
            </div>
            <div class="col-12">
              <label class="form-label small fw-bold">Media URLs (comma separated for carousel)</label>
              <input type="text" id="postMediaUrls" class="form-control form-control-sm" placeholder="https://image1.jpg, https://image2.jpg">
              <small class="text-muted">Max 10 images for carousel</small>
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-bold">Schedule (optional)</label>
              <input type="datetime-local" id="postSchedule" class="form-control form-control-sm">
            </div>
            <div class="col-md-6 d-flex align-items-end">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="saveAsDraft">
                <label class="form-check-label small">Save as Draft</label>
              </div>
            </div>
          </div>
          <div class="mt-3 d-flex gap-2">
            <button class="btn btn-primary btn-sm" onclick="Social.publishPost()"><i class="fas fa-paper-plane me-1"></i> Publish</button>
            <button class="btn btn-outline-primary btn-sm" onclick="Social.saveDraft()"><i class="fas fa-save me-1"></i> Save Draft</button>
            <button class="btn btn-light btn-sm" onclick="Social.closeModal()">Cancel</button>
          </div>
        </div>
      </div>
    `;
  },

  closeModal() { document.getElementById('createModal').innerHTML = ''; },

  async publishPost() {
    await this.savePost('published');
  },

  async saveDraft() {
    await this.savePost('draft');
  },

  async savePost(status) {
    const platform = document.getElementById('postPlatform').value;
    const postType = document.getElementById('postType').value;
    const message = document.getElementById('postCaption').value.trim();
    const mediaUrls = document.getElementById('postMediaUrls').value.split(',').map(s => s.trim()).filter(Boolean);
    const scheduledAt = document.getElementById('postSchedule').value;
    const isDraft = document.getElementById('saveAsDraft')?.checked;

    if (!message && mediaUrls.length === 0) return alert('Enter caption or media!');

    const finalStatus = isDraft ? 'draft' : (scheduledAt ? 'scheduled' : status);

    const postData = {
      platform, postType, message, media: mediaUrls,
      status: finalStatus,
      scheduledAt: scheduledAt || null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      pageId: this.selectedPage,
      instaId: this.selectedInsta
    };

    if (finalStatus === 'published') {
      await this.sendToPlatform(platform, postType, message, mediaUrls, postData);
    } else {
      await db.collection('socialPosts').add(postData);
      alert(`✅ ${finalStatus === 'scheduled' ? 'Scheduled' : 'Draft saved'}!`);
    }

    this.closeModal();
    this.render();
  },

  async sendToPlatform(platform, postType, message, mediaUrls, postData) {
    if (platform === 'facebook') {
      const cfg = (await db.collection('settings').doc('facebook').get()).data();
      if (!cfg?.pageAccessToken || !cfg?.pageId) return alert('Facebook not configured.');
      try {
        const params = new URLSearchParams({ message, access_token: cfg.pageAccessToken });
        if (mediaUrls.length > 0) params.append('link', mediaUrls[0]);
        const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.pageId}/feed`, { method: 'POST', body: params });
        const result = await res.json();
        if (res.ok) {
          postData.status = 'published';
          postData.platformId = result.id;
          await db.collection('socialPosts').add(postData);
          alert('✅ Posted to Facebook!');
        } else {
          alert('❌ ' + (result.error?.message || 'Failed'));
        }
      } catch (err) { alert('Error: ' + err.message); }
    } else if (platform === 'instagram') {
      const cfg = (await db.collection('settings').doc('instagram').get()).data();
      if (!cfg?.accessToken || !cfg?.accountId) return alert('Instagram not configured.');
      try {
        const igUserId = cfg.accountId;
        let creationId = null;
        if (mediaUrls.length > 0) {
          for (const url of mediaUrls.slice(0, 10)) {
            const params = new URLSearchParams({ image_url: url, caption: message, access_token: cfg.accessToken });
            const createRes = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media`, { method: 'POST', body: params });
            const createData = await createRes.json();
            if (createData.id) {
              const publishRes = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media_publish`, {
                method: 'POST',
                body: new URLSearchParams({ creation_id: createData.id, access_token: cfg.accessToken })
              });
              const publishData = await publishRes.json();
              creationId = publishData.id;
            }
          }
        } else {
          const params = new URLSearchParams({ caption: message, access_token: cfg.accessToken });
          const createRes = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media`, { method: 'POST', body: params });
          const createData = await createRes.json();
          if (createData.id) {
            const publishRes = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media_publish`, {
              method: 'POST',
              body: new URLSearchParams({ creation_id: createData.id, access_token: cfg.accessToken })
            });
            const publishData = await publishRes.json();
            creationId = publishData.id;
          }
        }
        if (creationId) {
          postData.status = 'published';
          postData.platformId = creationId;
          await db.collection('socialPosts').add(postData);
          alert('✅ Posted to Instagram!');
        } else {
          alert('❌ Failed to post');
        }
      } catch (err) { alert('Error: ' + err.message); }
    }
  },

  async publishDraft(id) {
    const doc = await db.collection('socialPosts').doc(id).get();
    const post = doc.data();
    await this.sendToPlatform(post.platform, post.postType, post.message, post.media, post);
    await db.collection('socialPosts').doc(id).delete();
    this.render();
  },

  async deletePost(id) {
    if (!confirm('Delete this post?')) return;
    await db.collection('socialPosts').doc(id).delete();
    alert('Deleted.');
    this.render();
  }
};
