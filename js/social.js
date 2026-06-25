const Social = {
  currentTab: 'published',
  uploadedFiles: [],
  activePlatforms: { facebook: true, instagram: true },
  previewDevice: 'desktop',

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading social...</p>';

    let fbConfig = {}, igConfig = {};
    try {
      const fbDoc = await db.collection('settings').doc('facebook').get();
      if (fbDoc.exists) fbConfig = fbDoc.data();
      const igDoc = await db.collection('settings').doc('instagram').get();
      if (igDoc.exists) igConfig = igDoc.data();
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
        .meta-composer-layout { display: grid; grid-template-columns: 1fr 400px; gap: 24px; align-items: start; }
        .meta-card { background: #fff; border: 1px solid #dadde1; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); margin-bottom: 20px; }
        .meta-card-title { font-size: 16px; font-weight: 600; color: #1c1e21; margin: 0 0 16px 0; }
        .meta-btn { height: 40px; padding: 0 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 8px; }
        .meta-btn-primary { background: #1877f2; color: #fff; }
        .meta-btn-primary:hover { background: #166fe5; }
        .meta-btn-outline { background: #fff; color: #1877f2; border: 1px solid #dadde1; }
        .meta-btn-outline:hover { background: #f5f6f7; }
        .meta-btn-dark { background: #1c1e21; color: #fff; }
        .drop-zone { border: 2px dashed #dadde1; border-radius: 12px; padding: 40px; text-align: center; cursor: pointer; background: #fafbfc; transition: 0.2s; }
        .drop-zone:hover { border-color: #1877f2; background: #e7f3ff; }
        .media-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .media-item { position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 1; }
        .media-item img, .media-item video { width: 100%; height: 100%; object-fit: cover; }
        .media-item .remove-btn { position: absolute; top: 4px; right: 4px; background: #fa3e3e; color: #fff; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; font-size: 14px; }
        .platform-card { flex: 1; border: 2px solid #dadde1; border-radius: 12px; padding: 16px; cursor: pointer; text-align: center; transition: 0.2s; }
        .platform-card.active { border-color: #1877f2; background: #e7f3ff; }
        .platform-card:hover { border-color: #1877f2; }
        .preview-panel { position: sticky; top: 20px; }
        .preview-box { background: #f0f2f5; border-radius: 8px; padding: 16px; }
        .post-card { border: 1px solid #dadde1; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
        .post-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .device-toggle { display: flex; gap: 4px; background: #f0f2f5; border-radius: 8px; padding: 2px; }
        .device-btn { padding: 6px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; border: none; background: transparent; }
        .device-btn.active { background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        @media (max-width: 1024px) { .meta-composer-layout { grid-template-columns: 1fr; } }
      </style>

      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 style="font-weight:700;color:#1c1e21;margin:0;"><i class="fas fa-calendar-alt me-2"></i>Content Calendar</h4>
        <button class="meta-btn meta-btn-primary" onclick="Social.openComposer()"><i class="fas fa-plus"></i> Create Post</button>
      </div>

      <div class="d-flex gap-2 mb-4">
        <button class="btn btn-sm btn-${this.currentTab==='published'?'primary':'light'} rounded-pill px-3" onclick="Social.switchTab('published')">📢 Published</button>
        <button class="btn btn-sm btn-${this.currentTab==='scheduled'?'primary':'light'} rounded-pill px-3" onclick="Social.switchTab('scheduled')">⏰ Scheduled</button>
        <button class="btn btn-sm btn-${this.currentTab==='drafts'?'primary':'light'} rounded-pill px-3" onclick="Social.switchTab('drafts')">📝 Drafts</button>
      </div>

      <div id="postsList">
        ${posts.length === 0 ? '<p class="text-muted text-center py-4">No posts yet. Create your first post!</p>' : posts.map(p => `
          <div class="post-card">
            <div class="d-flex gap-3">
              ${p.media && p.media.length > 0 ? `<div class="d-flex gap-1">${p.media.slice(0,3).map(m => `<img src="${m}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">`).join('')}</div>` : ''}
              <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <span class="badge bg-${p.platform==='facebook'?'primary':'danger'} me-1">${p.platform}</span>
                    <span class="badge bg-secondary">${p.postType || 'post'}</span>
                    ${p.carousel ? '<span class="badge bg-info ms-1">Carousel</span>' : ''}
                  </div>
                  <small class="text-muted">${p.createdAt?.toDate().toLocaleDateString()}</small>
                </div>
                <p class="mt-2 mb-1">${p.message || '(no caption)'}</p>
                <div class="d-flex gap-2 mt-2">
                  ${p.status==='draft'?`<button class="btn btn-sm btn-primary" onclick="Social.publishDraft('${p.id}')">Publish Now</button>`:''}
                  ${p.status==='scheduled'?`<button class="btn btn-sm btn-outline-primary" onclick="Social.publishNow('${p.id}')">Publish Now</button>`:''}
                  <button class="btn btn-sm btn-outline-danger" onclick="Social.deletePost('${p.id}')"><i class="fas fa-trash"></i></button>
                </div>
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
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:center;justify-content:center;" onclick="Social.closeComposer()">
        <div style="background:#f0f2f5;border-radius:16px;padding:32px;max-height:92vh;overflow-y:auto;width:96%;max-width:1300px;" onclick="event.stopPropagation()">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h3 style="font-weight:700;color:#1c1e21;margin:0;">Create Post</h3>
            <button class="btn-close" onclick="Social.closeComposer()"></button>
          </div>
          
          <div class="meta-composer-layout">
            <div>
              <!-- Platform Selection -->
              <div class="meta-card">
                <div class="meta-card-title">Post to</div>
                <div class="d-flex gap-3">
                  <div class="platform-card ${this.activePlatforms.facebook?'active':''}" onclick="Social.togglePlatform('facebook')">
                    <i class="fab fa-facebook fa-2x text-primary mb-2"></i><br>
                    <strong>Facebook</strong><br>
                    <small class="text-muted">11 Avatar Digital Hub</small>
                  </div>
                  <div class="platform-card ${this.activePlatforms.instagram?'active':''}" onclick="Social.togglePlatform('instagram')">
                    <i class="fab fa-instagram fa-2x text-danger mb-2"></i><br>
                    <strong>Instagram</strong><br>
                    <small class="text-muted">11avatardigitalhub</small>
                  </div>
                </div>
              </div>

              <!-- Post Type -->
              <div class="meta-card">
                <div class="meta-card-title">Post Type</div>
                <div class="d-flex gap-2">
                  <button class="meta-btn meta-btn-outline" id="typePost" onclick="Social.setPostType('post')" style="background:#e7f3ff;border-color:#1877f2;">📄 Post</button>
                  <button class="meta-btn meta-btn-outline" id="typeReel" onclick="Social.setPostType('reel')">🎬 Reel</button>
                  <button class="meta-btn meta-btn-outline" id="typeStory" onclick="Social.setPostType('story')">📱 Story</button>
                  <button class="meta-btn meta-btn-outline" id="typeCarousel" onclick="Social.setPostType('carousel')">🖼️ Carousel</button>
                </div>
                <input type="hidden" id="postType" value="post">
              </div>

              <!-- Media Upload -->
              <div class="meta-card">
                <div class="meta-card-title">Media</div>
                <div class="drop-zone" ondragover="event.preventDefault();this.style.borderColor='#1877f2';this.style.background='#e7f3ff';" ondragleave="this.style.borderColor='#dadde1';this.style.background='#fafbfc';" ondrop="Social.handleDrop(event)">
                  <i class="fas fa-cloud-upload-alt fa-3x" style="color:#1877f2;margin-bottom:12px;"></i>
                  <p style="font-weight:600;font-size:16px;">Upload Media</p>
                  <p class="text-muted">Add photos or video by dragging and dropping</p>
                  <div class="d-flex gap-2 justify-content-center mt-3">
                    <button class="meta-btn meta-btn-outline" onclick="event.stopPropagation();document.getElementById('composerFileInput').click();"><i class="fas fa-image"></i> Add Photo</button>
                    <button class="meta-btn meta-btn-outline" onclick="event.stopPropagation();document.getElementById('composerFileInput').click();"><i class="fas fa-video"></i> Add Video</button>
                  </div>
                </div>
                <input type="file" id="composerFileInput" multiple accept="image/*,video/*" style="display:none" onchange="Social.handleComposerFiles(event)">
                <div id="uploadProgress" class="text-info small mt-2"></div>
                <div class="media-grid mt-3" id="composerMediaGrid"></div>
              </div>

              <!-- Caption -->
              <div class="meta-card">
                <div class="meta-card-title">Post Details</div>
                <textarea id="composerCaption" class="form-control" style="min-height:150px;border-radius:8px;border:1px solid #dadde1;padding:12px;font-size:14px;" placeholder="What's on your mind?" oninput="Social.updatePreview()"></textarea>
                <div class="d-flex gap-1 mt-2">
                  <button class="btn btn-sm btn-light" onclick="Social.insertEmoji()">😊</button>
                  <button class="btn btn-sm btn-light" onclick="Social.insertText('@')">@</button>
                  <button class="btn btn-sm btn-light" onclick="Social.insertText('#')">#</button>
                </div>
              </div>

              <!-- Schedule -->
              <div class="meta-card">
                <div class="d-flex justify-content-between align-items-center">
                  <div class="meta-card-title" style="margin:0;">Schedule</div>
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="scheduleToggle" onchange="Social.toggleSchedule()">
                    <label class="form-check-label" for="scheduleToggle">Set Date & Time</label>
                  </div>
                </div>
                <div id="scheduleFields" style="display:none;margin-top:12px;">
                  <div class="row g-2">
                    <div class="col-6"><input type="date" id="scheduleDate" class="form-control form-control-sm" style="border-radius:8px;"></div>
                    <div class="col-6"><input type="time" id="scheduleTime" class="form-control form-control-sm" style="border-radius:8px;"></div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="d-flex gap-2">
                <button class="meta-btn meta-btn-primary flex-grow-1" style="height:48px;font-size:16px;" onclick="Social.publishFromComposer()">🚀 Publish Now</button>
                <button class="meta-btn meta-btn-dark" onclick="Social.saveAsDraft()">💾 Save Draft</button>
                <button class="meta-btn meta-btn-outline" onclick="Social.scheduleFromComposer()">⏰ Schedule</button>
              </div>
            </div>

            <!-- Preview -->
            <div class="preview-panel">
              <div class="meta-card">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div class="meta-card-title" style="margin:0;">Preview</div>
                  <div class="device-toggle">
                    <button class="device-btn active" onclick="Social.setPreviewDevice('desktop')">🖥️ Desktop</button>
                    <button class="device-btn" onclick="Social.setPreviewDevice('mobile')">📱 Mobile</button>
                  </div>
                </div>
                <div class="preview-box" id="composerPreview" style="max-width:${this.previewDevice==='mobile'?'375px':'100%'};margin:${this.previewDevice==='mobile'?'0 auto':'0'};">
                  ${this.getPreviewHTML()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  getPreviewHTML() {
    return `
      <div style="background:#fff;border-radius:8px;padding:12px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <div style="width:36px;height:36px;border-radius:50%;background:#1877f2;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;">11</div>
          <div><strong>11 Avatar Digital Hub</strong><br><small style="color:#65676b;">Just now · 🌍</small></div>
        </div>
        <p style="margin:8px 0;">Start writing...</p>
        <div style="display:flex;justify-content:space-around;color:#65676b;font-size:13px;border-top:1px solid #dadde1;padding-top:8px;">
          <span>👍 Like</span><span>💬 Comment</span><span>↗ Share</span>
        </div>
      </div>
    `;
  },

  updatePreview() {
    const preview = document.getElementById('composerPreview');
    if (!preview) return;
    const caption = document.getElementById('composerCaption')?.value || 'Start writing...';
    const mediaHTML = this.uploadedFiles.map(url => 
      url.includes('.mp4') ? `<video src="${url}" controls style="width:100%;border-radius:8px;margin-bottom:4px;"></video>` :
      `<img src="${url}" style="width:100%;border-radius:8px;margin-bottom:4px;">`
    ).join('');
    preview.innerHTML = `
      <div style="background:#fff;border-radius:8px;padding:12px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <div style="width:36px;height:36px;border-radius:50%;background:#1877f2;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;">11</div>
          <div><strong>11 Avatar Digital Hub</strong><br><small style="color:#65676b;">Just now · 🌍</small></div>
        </div>
        <p style="margin:8px 0;">${caption}</p>
        ${mediaHTML}
        <div style="display:flex;justify-content:space-around;color:#65676b;font-size:13px;border-top:1px solid #dadde1;padding-top:8px;">
          <span>👍 Like</span><span>💬 Comment</span><span>↗ Share</span>
        </div>
      </div>
    `;
  },

  setPostType(type) {
    document.getElementById('postType').value = type;
    document.querySelectorAll('[id^="type"]').forEach(b => { b.style.background = '#fff'; b.style.borderColor = '#dadde1'; });
    const btn = document.getElementById('type' + type.charAt(0).toUpperCase() + type.slice(1));
    if (btn) { btn.style.background = '#e7f3ff'; btn.style.borderColor = '#1877f2'; }
  },

  setPreviewDevice(device) {
    this.previewDevice = device;
    const box = document.getElementById('composerPreview');
    if (box) { box.style.maxWidth = device === 'mobile' ? '375px' : '100%'; box.style.margin = device === 'mobile' ? '0 auto' : '0'; }
  },

  togglePlatform(plat) { this.activePlatforms[plat] = !this.activePlatforms[plat]; this.openComposer(); },
  toggleSchedule() { const f = document.getElementById('scheduleFields'); if (f) f.style.display = f.style.display === 'none' ? 'block' : 'none'; },
  insertEmoji() { const ta = document.getElementById('composerCaption'); if (ta) { ta.value += ' 😊'; this.updatePreview(); } },
  insertText(t) { const ta = document.getElementById('composerCaption'); if (ta) { ta.value += t; this.updatePreview(); } },
  closeComposer() { document.getElementById('composerContainer').innerHTML = ''; },

  async handleDrop(e) { e.preventDefault(); e.target.style.borderColor = '#dadde1'; e.target.style.background = '#fafbfc'; await this.uploadFiles(e.dataTransfer.files); },
  async handleComposerFiles(e) { await this.uploadFiles(e.target.files); },

  async uploadFiles(files) {
    const progress = document.getElementById('uploadProgress');
    for (const f of files) {
      if (this.uploadedFiles.length >= 10) { alert('Max 10 files for Instagram'); break; }
      if (progress) progress.innerText = `Uploading ${f.name}...`;
      const ref = firebase.storage().ref('social/' + Date.now() + '_' + f.name);
      await ref.put(f);
      const url = await ref.ref.getDownloadURL();
      this.uploadedFiles.push(url);
    }
    if (progress) progress.innerText = '';
    this.refreshMediaGrid();
  },

  refreshMediaGrid() {
    const grid = document.getElementById('composerMediaGrid');
    if (!grid) return;
    grid.innerHTML = this.uploadedFiles.map((url, i) => `
      <div class="media-item">
        ${url.includes('.mp4') ? `<video src="${url}"></video>` : `<img src="${url}">`}
        <button class="remove-btn" onclick="Social.removeMedia(${i})">×</button>
      </div>
    `).join('');
    this.updatePreview();
  },

  removeMedia(i) { this.uploadedFiles.splice(i, 1); this.refreshMediaGrid(); },

  async publishFromComposer() { await this.savePost('published'); },
  async saveAsDraft() { await this.savePost('draft'); },
  async scheduleFromComposer() {
    const date = document.getElementById('scheduleDate')?.value;
    const time = document.getElementById('scheduleTime')?.value;
    if (!date || !time) return alert('Please set schedule date and time!');
    await this.savePost('scheduled', new Date(date + 'T' + time).toISOString());
  },

  async savePost(status, scheduledAt = null) {
    const message = document.getElementById('composerCaption')?.value || '';
    const postType = document.getElementById('postType')?.value || 'post';
    
    if (!this.activePlatforms.facebook && !this.activePlatforms.instagram) return alert('Select at least one platform!');

    for (const platform of ['facebook', 'instagram']) {
      if (!this.activePlatforms[platform]) continue;
      
      const postData = {
        platform, message, media: this.uploadedFiles, postType,
        carousel: postType === 'carousel',
        status, scheduledAt,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      if (status === 'published') {
        if (platform === 'facebook') {
          const cfg = (await db.collection('settings').doc('facebook').get()).data();
          if (cfg?.pageAccessToken) {
            const params = new URLSearchParams({ message, access_token: cfg.pageAccessToken });
            if (this.uploadedFiles[0]) params.append('link', this.uploadedFiles[0]);
            const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.pageId}/feed`, { method: 'POST', body: params });
            const data = await res.json();
            if (data.id) postData.platformId = data.id;
          }
        } else if (platform === 'instagram') {
          const cfg = (await db.collection('settings').doc('instagram').get()).data();
          if (cfg?.accessToken) {
            for (const url of this.uploadedFiles.slice(0, 10)) {
              const params = new URLSearchParams({ caption: message, image_url: url, access_token: cfg.accessToken });
              const createRes = await fetch(`https://graph.facebook.com/v22.0/${cfg.accountId}/media`, { method: 'POST', body: params });
              const createData = await createRes.json();
              if (createData.id) {
                await fetch(`https://graph.facebook.com/v22.0/${cfg.accountId}/media_publish`, {
                  method: 'POST', body: new URLSearchParams({ creation_id: createData.id, access_token: cfg.accessToken })
                });
              }
            }
          }
        }
      }

      await db.collection('socialPosts').add(postData);
    }

    this.closeComposer();
    this.uploadedFiles = [];
    this.render();
    alert(`✅ Post ${status === 'published' ? 'published' : status === 'scheduled' ? 'scheduled' : 'saved as draft'}!`);
  },

  async publishDraft(id) { await db.collection('socialPosts').doc(id).update({ status: 'published' }); this.render(); },
  async publishNow(id) { await db.collection('socialPosts').doc(id).update({ status: 'published', scheduledAt: null }); this.render(); },
  async deletePost(id) { if (!confirm('Delete?')) return; await db.collection('socialPosts').doc(id).delete(); this.render(); }
};
