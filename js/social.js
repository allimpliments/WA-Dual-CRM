const Social = {
  currentTab: 'published',
  selectedFB: null,
  selectedIG: null,
  uploadedFiles: [],

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading...</p>';

    let fbConfig = {}, igConfig = {};
    try {
      const fbDoc = await db.collection('settings').doc('facebook').get();
      if (fbDoc.exists) { fbConfig = fbDoc.data(); this.selectedFB = fbConfig.pageId; }
      const igDoc = await db.collection('settings').doc('instagram').get();
      if (igDoc.exists) { igConfig = igDoc.data(); this.selectedIG = igConfig.accountId; }
    } catch (err) { console.error(err); }

    let posts = [];
    try {
      const snap = await db.collection('socialPosts').orderBy('createdAt', 'desc').get();
      posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {}

    if (this.currentTab === 'published') posts = posts.filter(p => p.status === 'published');
    else if (this.currentTab === 'scheduled') posts = posts.filter(p => p.status === 'scheduled');
    else if (this.currentTab === 'drafts') posts = posts.filter(p => p.status === 'draft');

    let html = `
      <style>
        .composer-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; align-items: center; justify-content: center; }
        .composer-card { background: #fff; border-radius: 16px; width: 95%; max-width: 700px; max-height: 90vh; overflow-y: auto; padding: 24px; }
        .media-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 10px 0; }
        .media-item { position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 1; background: #f0f0f0; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px dashed #ccc; }
        .media-item img, .media-item video { width: 100%; height: 100%; object-fit: cover; }
        .media-item .remove-btn { position: absolute; top: 4px; right: 4px; background: #ff4444; color: #fff; border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 14px; cursor: pointer; }
        .platform-toggle { display: flex; gap: 12px; }
        .platform-option { flex: 1; border: 2px solid #e0e0e0; border-radius: 12px; padding: 16px; text-align: center; cursor: pointer; }
        .platform-option.active { border-color: #2563eb; background: #eff6ff; }
        .story-toggle { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
        .preview-box { background: #f7f7f7; border-radius: 8px; padding: 12px; margin-top: 12px; }
      </style>

      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0"><i class="fas fa-calendar-alt me-2"></i>Content Calendar</h5>
        <button class="btn btn-primary rounded-pill" onclick="Social.openComposer()"><i class="fas fa-plus me-1"></i> Create Post</button>
      </div>

      <div class="d-flex gap-2 mb-3">
        <button class="btn btn-sm btn-${this.currentTab==='published'?'primary':'outline-primary'} rounded-pill" onclick="Social.switchTab('published')">Published</button>
        <button class="btn btn-sm btn-${this.currentTab==='scheduled'?'primary':'outline-primary'} rounded-pill" onclick="Social.switchTab('scheduled')">Scheduled</button>
        <button class="btn btn-sm btn-${this.currentTab==='drafts'?'primary':'outline-primary'} rounded-pill" onclick="Social.switchTab('drafts')">Drafts</button>
      </div>

      <div id="postsList">
        ${posts.length === 0 ? '<p class="text-muted text-center py-4">No posts.</p>' : posts.map(p => `
          <div class="border rounded p-3 mb-2 d-flex gap-3 align-items-start">
            ${p.media && p.media.length > 0 ? `<div class="d-flex gap-1">${p.media.slice(0,3).map(m => `<img src="${m}" style="width:56px;height:56px;object-fit:cover;border-radius:6px;">`).join('')}</div>` : ''}
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between">
                <span class="badge bg-${p.platform==='facebook'?'primary':'danger'}">${p.platform}</span>
                <small class="text-muted">${p.createdAt?.toDate().toLocaleString()}</small>
              </div>
              <p class="mb-1 mt-1">${p.message || '(no caption)'}</p>
              <small>Type: ${p.postType} | ${p.shareToStory ? '📱 Story' : ''}</small>
              <div class="mt-1">
                ${p.status==='draft'?`<button class="btn btn-sm btn-outline-primary" onclick="Social.publishDraft('${p.id}')">Publish</button>`:''}
                <button class="btn btn-sm btn-outline-danger" onclick="Social.deletePost('${p.id}')"><i class="fas fa-trash"></i></button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <div id="composerContainer"></div>
    `;
    contentArea.innerHTML = html;
  },

  switchTab(tab) { this.currentTab = tab; this.render(); },

  openComposer() {
    this.uploadedFiles = [];
    document.getElementById('composerContainer').innerHTML = `
      <div class="composer-overlay" onclick="Social.closeComposer()">
        <div class="composer-card" onclick="event.stopPropagation()">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0">Create Post</h5>
            <button class="btn-close" onclick="Social.closeComposer()"></button>
          </div>

          <!-- Platform Selection -->
          <label class="form-label small fw-bold">Post to</label>
          <div class="platform-toggle mb-3">
            ${this.selectedFB ? `
              <div class="platform-option active" id="platFB" onclick="Social.togglePlatform('facebook')">
                <i class="fab fa-facebook fa-2x text-primary mb-1"></i><br>
                <strong>Facebook</strong><br>
                <small class="text-muted">11 Avatar Digital Hub</small>
                <div class="form-check mt-1 story-toggle">
                  <input class="form-check-input" type="checkbox" id="shareFBStory">
                  <label class="form-check-label small">Share to Story</label>
                </div>
              </div>
            ` : ''}
            ${this.selectedIG ? `
              <div class="platform-option active" id="platIG" onclick="Social.togglePlatform('instagram')">
                <i class="fab fa-instagram fa-2x text-danger mb-1"></i><br>
                <strong>Instagram</strong><br>
                <small class="text-muted">11avatardigitalhub</small>
              </div>
            ` : ''}
          </div>

          <!-- Media Upload -->
          <label class="form-label small fw-bold">Media <small class="text-muted">(Max 10 photos or 1 video)</small></label>
          <div class="media-grid" id="mediaGrid">
            <div class="media-item" onclick="document.getElementById('fileInput').click()">
              <i class="fas fa-plus fa-2x text-muted"></i>
            </div>
          </div>
          <input type="file" id="fileInput" multiple accept="image/*,video/*" style="display:none" onchange="Social.handleFileSelect(event)">
          <div id="uploadProgress" class="small text-info mt-1"></div>

          <!-- Caption -->
          <div class="mb-3 mt-2">
            <label class="form-label small fw-bold">Text</label>
            <textarea id="postCaption" class="form-control form-control-sm" rows="4" placeholder="Write your caption..."></textarea>
          </div>

          <!-- Schedule -->
          <div class="row g-2 mb-3">
            <div class="col-md-6">
              <label class="form-label small fw-bold">Schedule</label>
              <input type="datetime-local" id="postSchedule" class="form-control form-control-sm">
            </div>
            <div class="col-md-6 d-flex align-items-end">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="saveAsDraft">
                <label class="form-check-label small">Save as Draft</label>
              </div>
            </div>
          </div>

          <!-- Preview -->
          <div class="preview-box" id="previewArea">
            <small class="text-muted">Preview will appear here</small>
          </div>

          <!-- Actions -->
          <div class="d-flex gap-2 mt-3">
            <button class="btn btn-primary btn-sm" onclick="Social.publishPost()"><i class="fas fa-paper-plane me-1"></i> Publish</button>
            <button class="btn btn-outline-primary btn-sm" onclick="Social.saveDraft()"><i class="fas fa-save me-1"></i> Save Draft</button>
            <button class="btn btn-light btn-sm" onclick="Social.closeComposer()">Cancel</button>
          </div>
        </div>
      </div>
    `;
  },

  closeComposer() { document.getElementById('composerContainer').innerHTML = ''; },

  togglePlatform(plat) {
    const el = document.getElementById('plat' + (plat === 'facebook' ? 'FB' : 'IG'));
    el.classList.toggle('active');
  },

  async handleFileSelect(event) {
    const files = event.target.files;
    document.getElementById('uploadProgress').innerText = `Uploading ${files.length} file(s)...`;
    for (const file of files) {
      if (this.uploadedFiles.length >= 10) { alert('Max 10 files'); break; }
      const storageRef = firebase.storage().ref('social/' + Date.now() + '_' + file.name);
      const uploadTask = await storageRef.put(file);
      const url = await uploadTask.ref.getDownloadURL();
      this.uploadedFiles.push(url);
      this.refreshMediaGrid();
    }
    document.getElementById('uploadProgress').innerText = '';
    this.updatePreview();
  },

  refreshMediaGrid() {
    const grid = document.getElementById('mediaGrid');
    if (!grid) return;
    grid.innerHTML = this.uploadedFiles.map((url, i) => `
      <div class="media-item">
        ${url.includes('.mp4') || url.includes('.mov') 
          ? `<video src="${url}" controls></video>` 
          : `<img src="${url}" alt="media">`}
        <button class="remove-btn" onclick="Social.removeMedia(${i})">×</button>
      </div>
    `).join('') + `
      <div class="media-item" onclick="document.getElementById('fileInput').click()">
        <i class="fas fa-plus fa-2x text-muted"></i>
      </div>
    `;
  },

  removeMedia(index) {
    this.uploadedFiles.splice(index, 1);
    this.refreshMediaGrid();
    this.updatePreview();
  },

  updatePreview() {
    const preview = document.getElementById('previewArea');
    if (!preview) return;
    const caption = document.getElementById('postCaption')?.value || '';
    preview.innerHTML = this.uploadedFiles.map(url => 
      url.includes('.mp4') ? `<video src="${url}" controls style="width:100%;max-height:200px;border-radius:8px;"></video>` 
      : `<img src="${url}" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;">`
    ).join('') + `<p class="mt-2 mb-0">${caption || 'Your caption...'}</p>`;
  },

  async publishPost() {
    await this.savePost('published');
  },

  async saveDraft() {
    await this.savePost('draft');
  },

  async savePost(status) {
    const message = document.getElementById('postCaption')?.value?.trim() || '';
    const scheduledAt = document.getElementById('postSchedule')?.value || '';
    const isDraft = document.getElementById('saveAsDraft')?.checked;
    const shareFBStory = document.getElementById('shareFBStory')?.checked;
    const fbActive = document.getElementById('platFB')?.classList.contains('active');
    const igActive = document.getElementById('platIG')?.classList.contains('active');

    const finalStatus = isDraft ? 'draft' : (scheduledAt ? 'scheduled' : status);

    for (const platform of [fbActive ? 'facebook' : null, igActive ? 'instagram' : null].filter(Boolean)) {
      const postData = {
        platform, message, media: this.uploadedFiles,
        postType: this.uploadedFiles.some(f => f.includes('.mp4')) ? 'video' : 'photo',
        status: finalStatus,
        shareToStory: platform === 'facebook' ? shareFBStory : false,
        scheduledAt: scheduledAt || null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      if (finalStatus === 'published') {
        if (platform === 'facebook') {
          const cfg = (await db.collection('settings').doc('facebook').get()).data();
          const params = new URLSearchParams({ message, access_token: cfg.pageAccessToken });
          for (const url of this.uploadedFiles.slice(0, 1)) params.append('link', url);
          const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.pageId}/feed`, { method: 'POST', body: params });
          const result = await res.json();
          if (res.ok) { postData.platformId = result.id; await db.collection('socialPosts').add(postData); }
          else alert('FB Error: ' + (result.error?.message || 'Failed'));
        } else if (platform === 'instagram') {
          const cfg = (await db.collection('settings').doc('instagram').get()).data();
          for (const url of this.uploadedFiles.slice(0, 10)) {
            const params = new URLSearchParams({ caption: message, image_url: url, access_token: cfg.accessToken });
            const createRes = await fetch(`https://graph.facebook.com/v22.0/${cfg.accountId}/media`, { method: 'POST', body: params });
            const createData = await createRes.json();
            if (createData.id) {
              await fetch(`https://graph.facebook.com/v22.0/${cfg.accountId}/media_publish`, {
                method: 'POST',
                body: new URLSearchParams({ creation_id: createData.id, access_token: cfg.accessToken })
              });
            }
          }
          postData.platformId = 'ig-' + Date.now();
          await db.collection('socialPosts').add(postData);
        }
      } else {
        await db.collection('socialPosts').add(postData);
      }
    }

    this.closeComposer();
    this.render();
    alert(`✅ ${finalStatus === 'published' ? 'Posted!' : finalStatus === 'scheduled' ? 'Scheduled!' : 'Draft saved!'}`);
  },

  async publishDraft(id) {
    const doc = await db.collection('socialPosts').doc(id).get();
    const post = doc.data();
    post.status = 'published';
    if (post.platform === 'facebook') {
      const cfg = (await db.collection('settings').doc('facebook').get()).data();
      const params = new URLSearchParams({ message: post.message, access_token: cfg.pageAccessToken });
      if (post.media?.[0]) params.append('link', post.media[0]);
      await fetch(`https://graph.facebook.com/v22.0/${cfg.pageId}/feed`, { method: 'POST', body: params });
    }
    await db.collection('socialPosts').doc(id).update({ status: 'published' });
    this.render();
  },

  async deletePost(id) {
    if (!confirm('Delete?')) return;
    await db.collection('socialPosts').doc(id).delete();
    this.render();
  }
};
