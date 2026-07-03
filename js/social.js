const Social = {
  currentTab: 'published',
  uploadedFiles: [],
  activePlatforms: { facebook: true, instagram: true },
  selectedFBPage: null,
  selectedIGAccount: null,
  postType: 'post',
  previewMode: 'feed', // 'feed', 'story', 'reel'
  previewPlatform: 'facebook', // 'facebook', 'instagram'

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading...</p>';
    await this.loadAccounts();
    let posts = [];
    try { const snap = await db.collection('socialPosts').orderBy('createdAt', 'desc').get(); posts = snap.docs.map(d => ({ id: d.id, ...d.data() })); } catch (e) {}
    if (this.currentTab === 'published') posts = posts.filter(p => p.status === 'published');
    else if (this.currentTab === 'scheduled') posts = posts.filter(p => p.status === 'scheduled');
    else if (this.currentTab === 'drafts') posts = posts.filter(p => p.status === 'draft');

    let html = `
      <style>
        .composer-grid { display: grid; grid-template-columns: 1fr 420px; gap: 24px; }
        .card { background: #fff; border: 1px solid #dadde1; border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
        .btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; font-size: 14px; }
        .btn-primary { background: #1877f2; color: #fff; }
        .btn-outline { background: #fff; color: #1877f2; border: 1px solid #dadde1; }
        .btn-danger { background: #fa3e3e; color: #fff; }
        .post-type-tabs { display: flex; gap: 8px; }
        .post-type-tab { padding: 10px 18px; border-radius: 20px; cursor: pointer; border: 1px solid #dadde1; background: #fff; font-size: 13px; font-weight: 500; }
        .post-type-tab.active { background: #1877f2; color: #fff; border-color: #1877f2; }
        .drop-zone { border: 2px dashed #dadde1; border-radius: 12px; padding: 30px; text-align: center; cursor: pointer; background: #fafbfc; }
        .drop-zone:hover { border-color: #1877f2; background: #e7f3ff; }
        .media-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .media-item { position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 1; background: #f0f0f0; }
        .media-item img, .media-item video { width: 100%; height: 100%; object-fit: cover; }
        .media-item .remove-btn { position: absolute; top: 4px; right: 4px; background: #fa3e3e; color: #fff; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; }
        .preview-box { border-radius: 12px; overflow: hidden; }
        .preview-feed { background: #fff; border-radius: 8px; padding: 12px; }
        .preview-story { background: #000; border-radius: 12px; min-height: 400px; color: #fff; position: relative; padding: 16px; }
        .preview-reel { background: #000; border-radius: 8px; aspect-ratio: 9/16; color: #fff; display: flex; align-items: center; justify-content: center; }
        @media (max-width: 1024px) { .composer-grid { grid-template-columns: 1fr; } }
      </style>
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 style="font-weight:700;">📅 Content Calendar</h4>
        <button class="btn btn-primary" onclick="Social.openComposer()"><i class="fas fa-plus"></i> Create Post</button>
      </div>
      <div class="d-flex gap-2 mb-4">
        <button class="btn btn-sm btn-${this.currentTab==='published'?'primary':'light'} rounded-pill" onclick="Social.switchTab('published')">📢 Published</button>
        <button class="btn btn-sm btn-${this.currentTab==='scheduled'?'primary':'light'} rounded-pill" onclick="Social.switchTab('scheduled')">⏰ Scheduled</button>
        <button class="btn btn-sm btn-${this.currentTab==='drafts'?'primary':'light'} rounded-pill" onclick="Social.switchTab('drafts')">📝 Drafts</button>
      </div>
      <div id="postsList">${posts.length === 0 ? '<p class="text-muted text-center py-4">No posts.</p>' : posts.map(p => `
        <div class="card" style="padding:16px;">
          <div class="d-flex gap-3">
            ${p.media?.length ? `<div class="d-flex gap-1">${p.media.slice(0,3).map(m => `<img src="${m}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">`).join('')}</div>` : ''}
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between"><div><span class="badge bg-${p.platform==='facebook'?'primary':'danger'}">${p.platform}</span> <span class="badge bg-info">${p.postType}</span></div><small>${p.createdAt?.toDate().toLocaleDateString()}</small></div>
              <p class="mt-1">${p.message||'(no caption)'}</p>
              ${p.status!=='published'?`<button class="btn btn-sm btn-primary" onclick="Social.publishDraft('${p.id}')">Publish</button>`:''}
              <button class="btn btn-sm btn-outline ms-1" onclick="Social.deletePost('${p.id}')"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        </div>
      `).join('')}</div>
      <div id="composerContainer"></div>
    `;
    contentArea.innerHTML = html;
  },

  async loadAccounts() {
    this.fbPages = []; this.igAccounts = [];
    try {
      const fbDoc = await db.collection('settings').doc('facebook_page').get();
      if (fbDoc.exists && fbDoc.data().accessToken) { this.fbPages = [{ id: fbDoc.data().pageId, name: '11 Avatar Digital Hub' }]; if (!this.selectedFBPage) this.selectedFBPage = fbDoc.data().pageId; }
      const igDoc = await db.collection('settings').doc('instagram_business').get();
      if (igDoc.exists && igDoc.data().accessToken) { this.igAccounts = [{ id: igDoc.data().accountId, name: '11avatardigitalhub' }]; if (!this.selectedIGAccount) this.selectedIGAccount = igDoc.data().accountId; }
    } catch (e) {}
  },

  switchTab(tab) { this.currentTab = tab; this.render(); },

  // ==================== COMPOSER ====================
  openComposer() {
    this.uploadedFiles = []; this.postType = 'post';
    document.getElementById('composerContainer').innerHTML = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);z-index:2000;display:flex;align-items:center;justify-content:center;" onclick="Social.closeComposer()">
        <div style="background:#f0f2f5;border-radius:16px;padding:32px;max-height:92vh;overflow-y:auto;width:96%;max-width:1400px;" onclick="event.stopPropagation()">
          <div class="d-flex justify-content-between mb-4"><h3 style="font-weight:700;">Create Post</h3><button class="btn-close" onclick="Social.closeComposer()"></button></div>
          <div class="composer-grid">
            <div>
              <!-- Account Selection -->
              <div class="card"><div class="fw-bold mb-2">Post to</div>
                <div class="d-flex gap-2">
                  <label class="d-flex align-items-center gap-2"><input type="checkbox" ${this.activePlatforms.facebook?'checked':''} onchange="Social.activePlatforms.facebook=this.checked"> <i class="fab fa-facebook text-primary"></i> Facebook</label>
                  <label class="d-flex align-items-center gap-2"><input type="checkbox" ${this.activePlatforms.instagram?'checked':''} onchange="Social.activePlatforms.instagram=this.checked"> <i class="fab fa-instagram text-danger"></i> Instagram</label>
                </div>
              </div>

              <!-- Post Type -->
              <div class="card"><div class="fw-bold mb-2">Create</div>
                <div class="post-type-tabs">
                  <div class="post-type-tab ${this.postType==='post'?'active':''}" onclick="Social.setPostType('post')">📄 Post</div>
                  <div class="post-type-tab ${this.postType==='story'?'active':''}" onclick="Social.setPostType('story')">📱 Story</div>
                  <div class="post-type-tab ${this.postType==='reel'?'active':''}" onclick="Social.setPostType('reel')">🎬 Reel</div>
                  <div class="post-type-tab ${this.postType==='carousel'?'active':''}" onclick="Social.setPostType('carousel')">🖼️ Carousel</div>
                </div>
              </div>

              <!-- Media -->
              <div class="card"><div class="fw-bold mb-2">Media</div>
                <div class="drop-zone" ondragover="event.preventDefault();this.style.borderColor='#1877f2'" ondragleave="this.style.borderColor='#dadde1'" ondrop="Social.handleDrop(event)">
                  <i class="fas fa-cloud-upload-alt fa-3x" style="color:#1877f2;margin-bottom:8px;"></i>
                  <p style="font-weight:600;">Upload Media</p>
                  <p class="text-muted small">Add photos or video by dragging and dropping</p>
                  <div class="d-flex gap-2 justify-content-center mt-2">
                    <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();document.getElementById('composerFileInput').click();"><i class="fas fa-image"></i> Add Photos</button>
                    <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();document.getElementById('composerFileInput').click();"><i class="fas fa-video"></i> Add Video</button>
                  </div>
                </div>
                <input type="file" id="composerFileInput" multiple accept="image/*,video/*" style="display:none" onchange="Social.handleComposerFiles(event)">
                <div class="media-grid mt-3" id="composerMediaGrid"></div>
                ${this.postType === 'carousel' ? '<small class="text-muted mt-1">Drag to reorder images</small>' : ''}
              </div>

              <!-- Caption -->
              <div class="card"><div class="fw-bold mb-2">Caption</div>
                <textarea id="composerCaption" class="form-control" rows="4" placeholder="Write a caption..." style="border-radius:8px;" oninput="Social.updatePreview()"></textarea>
                <div class="d-flex gap-1 mt-2">
                  <button class="btn btn-sm btn-light" onclick="Social.insertText('😊')">😊</button>
                  <button class="btn btn-sm btn-light" onclick="Social.insertText('#')">#</button>
                  <button class="btn btn-sm btn-light" onclick="Social.insertText('@')">@</button>
                  <button class="btn btn-sm btn-light" onclick="Social.insertText('📍')">📍</button>
                </div>
              </div>

              <!-- Schedule -->
              <div class="card"><div class="fw-bold mb-2">Schedule</div>
                <div class="row g-2">
                  <div class="col-6"><input type="date" id="scheduleDate" class="form-control form-control-sm" style="border-radius:8px;"></div>
                  <div class="col-6"><input type="time" id="scheduleTime" class="form-control form-control-sm" style="border-radius:8px;"></div>
                </div>
              </div>

              <!-- Actions -->
              <div class="d-flex gap-2">
                <button class="btn btn-primary flex-grow-1" style="height:48px;" onclick="Social.publishFromComposer()">🚀 Publish Now</button>
                <button class="btn btn-outline" onclick="Social.saveAsDraft()">💾 Draft</button>
              </div>
            </div>

            <!-- Preview -->
            <div style="position:sticky;top:20px;">
              <div class="card">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div class="fw-bold">Preview</div>
                  <div class="d-flex gap-1">
                    <select id="previewPlatform" class="form-select form-select-sm" style="width:auto;" onchange="Social.previewPlatform=this.value;Social.updatePreview();">
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                    </select>
                    <select id="previewMode" class="form-select form-select-sm" style="width:auto;" onchange="Social.previewMode=this.value;Social.updatePreview();">
                      <option value="feed">Feed</option>
                      <option value="story">Story</option>
                      <option value="reel">Reel</option>
                    </select>
                  </div>
                </div>
                <div id="composerPreview">${this.getPreviewHTML()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  setPostType(type) {
    this.postType = type;
    document.querySelectorAll('.post-type-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    // Update preview mode based on type
    if (type === 'story') this.previewMode = 'story';
    else if (type === 'reel') this.previewMode = 'reel';
    else this.previewMode = 'feed';
    document.getElementById('previewMode').value = this.previewMode;
    this.updatePreview();
  },

  getPreviewHTML() {
    const caption = document.getElementById?.('composerCaption')?.value || 'Start writing...';
    const media = this.uploadedFiles;
    const isFB = this.previewPlatform === 'facebook';

    if (this.previewMode === 'story') {
      return `<div class="preview-story">${media.length>0 ? (media[0].match(/\.(mp4|mov)/i) ? `<video src="${media[0]}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;border-radius:12px;" autoplay muted loop></video>` : `<img src="${media[0]}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;border-radius:12px;">`) : ''}<div style="position:absolute;top:12px;left:12px;font-weight:600;">${isFB?'Facebook':'Instagram'} Story</div><div style="position:absolute;bottom:12px;left:12px;right:12px;background:rgba(0,0,0,0.5);padding:8px;border-radius:8px;">${caption}</div></div>`;
    }
    if (this.previewMode === 'reel') {
      return `<div class="preview-reel">${media.length>0 && media[0].match(/\.(mp4|mov)/i) ? `<video src="${media[0]}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" controls></video>` : '<p>🎬 Upload a video for Reel preview</p>'}</div>`;
    }
    // Feed Preview
    return `<div class="preview-feed"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="width:32px;height:32px;border-radius:50%;background:#1877f2;color:#fff;display:flex;align-items:center;justify-content:center;">11</div><div><strong>11 Avatar Digital Hub</strong><br><small style="color:#65676b;">Just now</small></div></div>${this.postType==='carousel' ? `<div style="display:flex;overflow-x:auto;gap:4px;">${media.map(m => `<img src="${m}" style="width:100%;flex-shrink:0;border-radius:8px;">`).join('')}</div>` : media.map(m => m.match(/\.(mp4|mov)/i) ? `<video src="${m}" controls style="width:100%;border-radius:8px;margin-bottom:4px;"></video>` : `<img src="${m}" style="width:100%;border-radius:8px;margin-bottom:4px;">`).join('')}<p style="margin-top:8px;">${caption}</p><div style="display:flex;justify-content:space-between;color:#65676b;font-size:12px;border-top:1px solid #dadde1;padding-top:8px;margin-top:8px;"><span>👍 Like</span><span>💬 Comment</span><span>↗ Share</span></div></div>`;
  },

  updatePreview() {
    const preview = document.getElementById('composerPreview');
    if (preview) preview.innerHTML = this.getPreviewHTML();
  },

  insertText(t) { const ta = document.getElementById('composerCaption'); if (ta) { ta.value += t; this.updatePreview(); } },
  closeComposer() { document.getElementById('composerContainer').innerHTML = ''; },
  async handleDrop(e) { e.preventDefault(); await this.uploadFiles(e.dataTransfer.files); },
  async handleComposerFiles(e) { await this.uploadFiles(e.target.files); },

  async uploadFiles(files) {
    for (const file of files) {
      if (this.postType === 'carousel' && this.uploadedFiles.length >= 10) { alert('Max 10 for carousel'); break; }
      if ((this.postType === 'story' || this.postType === 'reel') && this.uploadedFiles.length >= 1) { alert('Only 1 file for story/reel'); break; }
      const ref = firebase.storage().ref('social/' + Date.now() + '_' + file.name);
      await ref.put(file);
      this.uploadedFiles.push(await ref.ref.getDownloadURL());
    }
    this.refreshMediaGrid();
  },

  refreshMediaGrid() {
    const grid = document.getElementById('composerMediaGrid'); if (!grid) return;
    grid.innerHTML = this.uploadedFiles.map((url, i) => `
      <div class="media-item">
        ${url.match(/\.(mp4|mov|webm)/i) ? `<video src="${url}" controls></video>` : `<img src="${url}">`}
        <button class="remove-btn" onclick="Social.removeMedia(${i})">×</button>
      </div>
    `).join('');
    this.updatePreview();
  },

  removeMedia(i) { this.uploadedFiles.splice(i, 1); this.refreshMediaGrid(); },

  // ==================== PUBLISH ====================
  async publishFromComposer() { await this.savePost('published'); },
  async saveAsDraft() { await this.savePost('draft'); },

  async savePost(status) {
    const msg = document.getElementById('composerCaption')?.value || '';
    const scheduleDate = document.getElementById('scheduleDate')?.value;
    const scheduleTime = document.getElementById('scheduleTime')?.value;
    const scheduledAt = (scheduleDate && scheduleTime) ? new Date(scheduleDate + 'T' + scheduleTime).toISOString() : null;
    const finalStatus = scheduledAt ? 'scheduled' : status;

    for (const platform of ['facebook', 'instagram']) {
      if (!this.activePlatforms[platform]) continue;
      const configDoc = platform === 'facebook' ? 'facebook_page' : 'instagram_business';
      const cfg = (await db.collection('settings').doc(configDoc).get()).data();
      if (!cfg?.accessToken) continue;

      const data = {
        platform, message: msg, media: [...this.uploadedFiles], status: finalStatus, postType: this.postType,
        scheduledAt, createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      if (finalStatus === 'published') {
        try {
          if (platform === 'facebook') {
            await this.publishToFacebook(cfg, msg, this.uploadedFiles, this.postType, data);
          } else {
            await this.publishToInstagram(cfg, msg, this.uploadedFiles, this.postType, data);
          }
        } catch (err) {
          alert(`${platform} Error: ` + err.message);
          return;
        }
      }
      await db.collection('socialPosts').add(data);
    }
    this.closeComposer(); this.uploadedFiles = []; this.render();
    alert('✅ ' + (finalStatus === 'published' ? 'Posted!' : finalStatus === 'scheduled' ? 'Scheduled!' : 'Draft saved!'));
  },

  async publishToFacebook(cfg, msg, media, postType, data) {
    if (postType === 'story') {
      // Facebook Story via API requires special endpoint
      if (media.length > 0) {
        const isVideo = media[0].match(/\.(mp4|mov)/i);
        const endpoint = isVideo ? `/${cfg.pageId}/video_stories` : `/${cfg.pageId}/photo_stories`;
        const params = new URLSearchParams({ access_token: cfg.accessToken });
        if (isVideo) params.append('file_url', media[0]);
        else params.append('url', media[0]);
        const res = await fetch(`https://graph.facebook.com/v22.0${endpoint}`, { method: 'POST', body: params });
        const result = await res.json();
        if (result.id) data.platformId = result.id;
        else throw new Error(result.error?.message || 'Story failed');
      }
    } else if (postType === 'reel') {
      if (media.length > 0 && media[0].match(/\.(mp4|mov)/i)) {
        const params = new URLSearchParams({ file_url: media[0], description: msg, access_token: cfg.accessToken });
        const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.pageId}/videos`, { method: 'POST', body: params });
        const result = await res.json();
        if (result.id) data.platformId = result.id;
        else throw new Error(result.error?.message || 'Video upload failed');
      }
    } else {
      const params = new URLSearchParams({ message: msg, access_token: cfg.accessToken });
      if (media.length > 0) params.append('link', media[0]);
      const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.pageId}/feed`, { method: 'POST', body: params });
      const result = await res.json();
      if (result.id) data.platformId = result.id;
      else throw new Error(result.error?.message || 'Post failed');
    }
  },

  async publishToInstagram(cfg, msg, media, postType, data) {
    if (media.length === 0) throw new Error('Instagram requires media');
    const igUserId = cfg.accountId;
    let mediaType;
    if (postType === 'reel') mediaType = 'REELS';
    else if (postType === 'story') mediaType = 'STORIES';

    if (postType === 'carousel') {
      // Create individual media containers first
      const children = [];
      for (const url of media.slice(0, 10)) {
        const isVideo = url.match(/\.(mp4|mov)/i);
        const params = new URLSearchParams({ access_token: cfg.accessToken });
        if (isVideo) { params.append('media_type', 'VIDEO'); params.append('video_url', url); }
        else params.append('image_url', url);
        const res = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media`, { method: 'POST', body: params });
        const result = await res.json();
        if (result.id) children.push(result.id);
        else throw new Error(result.error?.message || 'Carousel media creation failed');
      }
      // Create carousel container
      const carouselParams = new URLSearchParams({ caption: msg, media_type: 'CAROUSEL', access_token: cfg.accessToken });
      children.forEach((id, i) => carouselParams.append(`children[${i}]`, id));
      const carouselRes = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media`, { method: 'POST', body: carouselParams });
      const carouselData = await carouselRes.json();
      if (carouselData.id) {
        const publishRes = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media_publish`, { method: 'POST', body: new URLSearchParams({ creation_id: carouselData.id, access_token: cfg.accessToken }) });
        const publishData = await publishRes.json();
        if (publishData.id) data.platformId = publishData.id;
        else throw new Error(publishData.error?.message || 'Carousel publish failed');
      } else throw new Error(carouselData.error?.message || 'Carousel creation failed');
    } else {
      for (const url of media.slice(0, 1)) {
        const isVideo = url.match(/\.(mp4|mov)/i);
        const params = new URLSearchParams({ caption: msg, access_token: cfg.accessToken });
        if (isVideo || mediaType) {
          params.append('media_type', mediaType || (isVideo ? 'VIDEO' : 'IMAGE'));
          params.append(isVideo ? 'video_url' : 'image_url', url);
        } else {
          params.append('image_url', url);
        }
        const createRes = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media`, { method: 'POST', body: params });
        const createData = await createRes.json();
        if (createData.id) {
          const publishRes = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media_publish`, { method: 'POST', body: new URLSearchParams({ creation_id: createData.id, access_token: cfg.accessToken }) });
          const publishData = await publishRes.json();
          if (publishData.id) data.platformId = publishData.id;
          else throw new Error(publishData.error?.message || 'Publish failed');
        } else throw new Error(createData.error?.message || 'Media creation failed');
      }
    }
  },

  async publishDraft(id) {
    const doc = await db.collection('socialPosts').doc(id).get();
    const post = doc.data();
    const configDoc = post.platform === 'facebook' ? 'facebook_page' : 'instagram_business';
    const cfg = (await db.collection('settings').doc(configDoc).get()).data();
    if (!cfg?.accessToken) return alert('Not configured!');
    try {
      if (post.platform === 'facebook') {
        await this.publishToFacebook(cfg, post.message, post.media || [], post.postType || 'post', {});
      } else {
        await this.publishToInstagram(cfg, post.message, post.media || [], post.postType || 'post', {});
      }
      await db.collection('socialPosts').doc(id).update({ status: 'published' });
      this.render(); alert('✅ Published!');
    } catch (err) { alert('Error: ' + err.message); }
  },

  async deletePost(id) { if (!confirm('Delete?')) return; await db.collection('socialPosts').doc(id).delete(); this.render(); }
};
