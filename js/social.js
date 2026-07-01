const Social = {
  currentTab: 'published',
  uploadedFiles: [],
  activePlatforms: { facebook: true, instagram: true },
  selectedFBPage: null,
  selectedIGAccount: null,
  fbPages: [],
  igAccounts: [],
  postType: 'post',
  previewDevice: 'desktop',

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
        .meta-card{background:#fff;border:1px solid #dadde1;border-radius:12px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,.04);margin-bottom:16px;}
        .meta-btn{height:40px;padding:0 20px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;border:none;display:inline-flex;align-items:center;gap:8px;}
        .meta-btn-primary{background:#1877f2;color:#fff;}
        .meta-btn-outline{background:#fff;color:#1877f2;border:1px solid #dadde1;}
        .platform-card{flex:1;border:2px solid #dadde1;border-radius:12px;padding:16px;cursor:pointer;text-align:center;transition:0.2s;}
        .platform-card.active{border-color:#1877f2;background:#e7f3ff;}
        .post-type-tabs{display:flex;gap:8px;margin-bottom:12px;}
        .post-type-tab{padding:8px 16px;border-radius:20px;font-size:13px;cursor:pointer;border:1px solid #dadde1;background:#fff;font-weight:500;}
        .post-type-tab.active{background:#1877f2;color:#fff;border-color:#1877f2;}
        .post-type-tab .icon{font-size:16px;}
        .drop-zone{border:2px dashed #dadde1;border-radius:12px;padding:30px;text-align:center;cursor:pointer;background:#fafbfc;transition:0.2s;}
        .drop-zone:hover{border-color:#1877f2;background:#e7f3ff;}
        .media-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
        .media-item{position:relative;border-radius:8px;overflow:hidden;aspect-ratio:1;background:#f0f0f0;}
        .media-item img,.media-item video{width:100%;height:100%;object-fit:cover;}
        .media-item .remove-btn{position:absolute;top:4px;right:4px;background:#fa3e3e;color:#fff;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;font-size:14px;}
        .preview-phone{background:#fff;border-radius:24px;padding:16px;max-width:360px;margin:0 auto;box-shadow:0 4px 20px rgba(0,0,0,0.1);}
        .preview-story{background:#000;border-radius:12px;padding:16px;max-width:320px;margin:0 auto;min-height:400px;color:#fff;position:relative;}
        .preview-reel{background:#000;border-radius:8px;padding:12px;max-width:320px;margin:0 auto;aspect-ratio:9/16;color:#fff;position:relative;display:flex;align-items:center;justify-content:center;}
        .caption-area textarea{width:100%;border:1px solid #dadde1;border-radius:8px;padding:12px;font-size:14px;resize:vertical;min-height:120px;}
      </style>
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 style="font-weight:700;margin:0;">📅 Content Calendar</h4>
        <button class="meta-btn meta-btn-primary" onclick="Social.openComposer()"><i class="fas fa-plus"></i> Create Post</button>
      </div>
      <div class="d-flex gap-2 mb-4">
        <button class="btn btn-sm btn-${this.currentTab==='published'?'primary':'light'} rounded-pill px-3" onclick="Social.switchTab('published')">📢 Published</button>
        <button class="btn btn-sm btn-${this.currentTab==='scheduled'?'primary':'light'} rounded-pill px-3" onclick="Social.switchTab('scheduled')">⏰ Scheduled</button>
        <button class="btn btn-sm btn-${this.currentTab==='drafts'?'primary':'light'} rounded-pill px-3" onclick="Social.switchTab('drafts')">📝 Drafts</button>
      </div>
      <div id="postsList">${posts.length === 0 ? '<p class="text-muted text-center py-4">No posts.</p>' : posts.map(p => `
        <div class="meta-card" style="padding:16px;">
          <div class="d-flex gap-3">
            ${p.media?.length ? `<div class="d-flex gap-1">${p.media.slice(0,3).map(m => `<img src="${m}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">`).join('')}</div>` : ''}
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between"><div><span class="badge bg-${p.platform==='facebook'?'primary':'danger'}">${p.platform}</span> <span class="badge bg-info">${p.postType||'post'}</span></div><small>${p.createdAt?.toDate().toLocaleDateString()}</small></div>
              <p class="mt-1 mb-0">${p.message||'(no caption)'}</p>
              <div class="mt-2">${p.status!=='published'?`<button class="btn btn-sm btn-primary" onclick="Social.publishDraft('${p.id}')">Publish</button>`:''}<button class="btn btn-sm btn-outline-danger ms-1" onclick="Social.deletePost('${p.id}')"><i class="fas fa-trash"></i></button></div>
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

  openComposer() {
    this.uploadedFiles = []; this.postType = 'post';
    document.getElementById('composerContainer').innerHTML = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);z-index:2000;display:flex;align-items:center;justify-content:center;" onclick="Social.closeComposer()">
        <div style="background:#f0f2f5;border-radius:16px;padding:32px;max-height:92vh;overflow-y:auto;width:96%;max-width:1300px;" onclick="event.stopPropagation()">
          <div class="d-flex justify-content-between mb-4"><h3 style="font-weight:700;margin:0;">Create Post</h3><button class="btn-close" onclick="Social.closeComposer()"></button></div>
          <div style="display:grid;grid-template-columns:1fr 380px;gap:24px;">
            <div>
              <!-- Platform -->
              <div class="meta-card">
                <div class="fw-bold mb-2">Post to</div>
                <div class="d-flex gap-2">
                  <div class="platform-card ${this.activePlatforms.facebook?'active':''}" onclick="Social.togglePlatform('facebook')"><i class="fab fa-facebook fa-2x text-primary mb-1"></i><br><strong>Facebook</strong></div>
                  <div class="platform-card ${this.activePlatforms.instagram?'active':''}" onclick="Social.togglePlatform('instagram')"><i class="fab fa-instagram fa-2x text-danger mb-1"></i><br><strong>Instagram</strong></div>
                </div>
              </div>

              <!-- Post Type Tabs -->
              <div class="meta-card">
                <div class="fw-bold mb-2">Post Type</div>
                <div class="post-type-tabs">
                  <div class="post-type-tab ${this.postType==='post'?'active':''}" onclick="Social.setPostType('post')">📄 Post</div>
                  <div class="post-type-tab ${this.postType==='reel'?'active':''}" onclick="Social.setPostType('reel')">🎬 Reel</div>
                  <div class="post-type-tab ${this.postType==='story'?'active':''}" onclick="Social.setPostType('story')">📱 Story</div>
                  <div class="post-type-tab ${this.postType==='carousel'?'active':''}" onclick="Social.setPostType('carousel')">🖼️ Carousel</div>
                </div>
                <small class="text-muted">
                  <span id="postTypeHint">Post — Share photos or a video. Instagram posts can't exceed 10 photos.</span>
                </small>
              </div>

              <!-- Media Upload -->
              <div class="meta-card">
                <div class="fw-bold mb-2">Media</div>
                <div class="drop-zone" ondragover="event.preventDefault();this.style.borderColor='#1877f2'" ondragleave="this.style.borderColor='#dadde1'" ondrop="Social.handleDrop(event)">
                  <i class="fas fa-cloud-upload-alt fa-3x" style="color:#1877f2;margin-bottom:8px;"></i>
                  <p style="font-weight:600;">Upload Media</p>
                  <p class="text-muted small">Add photos or video by dragging and dropping</p>
                  <button class="meta-btn meta-btn-outline mt-2" onclick="event.stopPropagation();document.getElementById('composerFileInput').click();"><i class="fas fa-image"></i> Browse Files</button>
                </div>
                <input type="file" id="composerFileInput" multiple accept="image/*,video/*" style="display:none" onchange="Social.handleComposerFiles(event)">
                <div class="media-grid mt-3" id="composerMediaGrid"></div>
              </div>

              <!-- Caption -->
              <div class="meta-card caption-area">
                <div class="fw-bold mb-2">Caption</div>
                <textarea id="composerCaption" placeholder="Write a caption..." oninput="Social.updatePreview()"></textarea>
                <div class="d-flex gap-1 mt-2">
                  <button class="btn btn-sm btn-light" onclick="Social.insertEmoji()">😊</button>
                  <button class="btn btn-sm btn-light" onclick="Social.insertText('@')">@</button>
                  <button class="btn btn-sm btn-light" onclick="Social.insertText('#')">#</button>
                </div>
              </div>

              <!-- Actions -->
              <div class="d-flex gap-2">
                <button class="meta-btn meta-btn-primary flex-grow-1" style="height:48px;" onclick="Social.publishFromComposer()">🚀 Publish Now</button>
                <button class="meta-btn meta-btn-outline" onclick="Social.saveAsDraft()">💾 Draft</button>
              </div>
            </div>

            <!-- Preview -->
            <div style="position:sticky;top:20px;">
              <div class="meta-card">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div class="fw-bold">Preview</div>
                  <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-light ${this.previewDevice==='desktop'?'active':''}" onclick="Social.previewDevice='desktop';Social.updatePreview();">🖥️</button>
                    <button class="btn btn-sm btn-light ${this.previewDevice==='mobile'?'active':''}" onclick="Social.previewDevice='mobile';Social.updatePreview();">📱</button>
                  </div>
                </div>
                <div id="composerPreview" style="max-width:${this.previewDevice==='mobile'?'320px':'100%'};margin:0 auto;">
                  ${this.getPreviewHTML()}
                </div>
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
    const hints = {
      post: 'Post — Share photos or a video. Instagram posts can\'t exceed 10 photos.',
      reel: 'Reel — Upload a vertical video (9:16). Ideal for short, engaging content.',
      story: 'Story — Upload a photo or short video (9:16). Expires after 24 hours.',
      carousel: 'Carousel — Upload up to 10 photos that users can swipe through.'
    };
    document.getElementById('postTypeHint').innerText = hints[type] || '';
    this.updatePreview();
  },

  getPreviewHTML() {
    const caption = document.getElementById?.('composerCaption')?.value || 'Start writing...';
    const media = this.uploadedFiles;
    if (this.postType === 'story') {
      return `<div class="preview-story"><div style="position:absolute;top:8px;left:8px;font-weight:600;">11 Avatar Digital Hub</div><div style="position:absolute;bottom:8px;left:8px;right:8px;background:rgba(0,0,0,0.5);padding:8px;border-radius:8px;">${caption}</div>${media.length>0 ? (media[0].match(/\.(mp4|mov)/i) ? `<video src="${media[0]}" style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;border-radius:12px;" autoplay muted loop></video>` : `<img src="${media[0]}" style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;border-radius:12px;">`) : '<p style="text-align:center;padding-top:150px;">Story Preview</p>'}</div>`;
    }
    if (this.postType === 'reel') {
      return `<div class="preview-reel">${media.length>0 && media[0].match(/\.(mp4|mov)/i) ? `<video src="${media[0]}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" controls></video>` : '<p>🎬 Reel Preview (upload a video)</p>'}</div>`;
    }
    if (this.postType === 'carousel') {
      return `<div class="preview-phone"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="width:32px;height:32px;border-radius:50%;background:#1877f2;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600;">11</div><div><strong>11 Avatar Digital Hub</strong></div></div><div style="display:flex;overflow-x:auto;gap:4px;">${media.map(m => `<img src="${m}" style="width:100%;flex-shrink:0;border-radius:8px;">`).join('')}</div><p style="margin-top:8px;">${caption}</p></div>`;
    }
    return `<div class="preview-phone"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="width:32px;height:32px;border-radius:50%;background:#1877f2;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600;">11</div><div><strong>11 Avatar Digital Hub</strong></div></div>${media.map(m => m.match(/\.(mp4|mov)/i) ? `<video src="${m}" controls style="width:100%;border-radius:8px;margin-bottom:4px;"></video>` : `<img src="${m}" style="width:100%;border-radius:8px;margin-bottom:4px;">`).join('')}<p style="margin-top:8px;">${caption}</p><div style="display:flex;justify-content:space-between;color:#65676b;font-size:12px;border-top:1px solid #dadde1;padding-top:8px;margin-top:8px;"><span>👍 Like</span><span>💬 Comment</span><span>↗ Share</span></div></div>`;
  },

  updatePreview() {
    const preview = document.getElementById('composerPreview');
    if (preview) preview.innerHTML = this.getPreviewHTML();
  },

  insertEmoji() { const ta = document.getElementById('composerCaption'); if (ta) { ta.value += ' 😊'; this.updatePreview(); } },
  insertText(t) { const ta = document.getElementById('composerCaption'); if (ta) { ta.value += t; this.updatePreview(); } },
  togglePlatform(p) { this.activePlatforms[p] = !this.activePlatforms[p]; this.openComposer(); },
  closeComposer() { document.getElementById('composerContainer').innerHTML = ''; },
  async handleDrop(e) { e.preventDefault(); await this.uploadFiles(e.dataTransfer.files); },
  async handleComposerFiles(e) { await this.uploadFiles(e.target.files); },

  async uploadFiles(files) {
    for (const file of files) {
      if (this.postType === 'carousel' && this.uploadedFiles.length >= 10) { alert('Max 10 photos for carousel'); break; }
      if (this.postType !== 'carousel' && this.uploadedFiles.length >= 1 && (this.postType === 'story' || this.postType === 'reel')) { alert('Only 1 file for story/reel'); break; }
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

  async publishFromComposer() { await this.savePost('published'); },
  async saveAsDraft() { await this.savePost('draft'); },

  async savePost(status) {
    const msg = document.getElementById('composerCaption')?.value || '';
    const postType = this.postType;

    for (const platform of ['facebook', 'instagram']) {
      if (!this.activePlatforms[platform]) continue;
      const configDoc = platform === 'facebook' ? 'facebook_page' : 'instagram_business';
      const cfg = (await db.collection('settings').doc(configDoc).get()).data();
      if (!cfg?.accessToken) continue;

      const data = {
        platform, message: msg, media: [...this.uploadedFiles], status, postType,
        pageId: platform === 'facebook' ? this.selectedFBPage : null,
        accountId: platform === 'instagram' ? this.selectedIGAccount : null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      if (status === 'published') {
        if (platform === 'facebook') {
          if (postType === 'story' || postType === 'reel') { alert('Facebook Story/Reel via API needs Page Access Token with special permissions. Saving as draft.'); data.status = 'draft'; }
          else {
            const params = new URLSearchParams({ message: msg, access_token: cfg.accessToken });
            if (this.uploadedFiles.length > 0) params.append('link', this.uploadedFiles[0]);
            const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.pageId}/feed`, { method: 'POST', body: params });
            const result = await res.json();
            if (result.id) data.platformId = result.id;
            else { alert('FB Error: ' + (result.error?.message || 'Failed')); return; }
          }
        } else if (platform === 'instagram') {
          if (this.uploadedFiles.length === 0) { alert('Instagram requires media!'); return; }
          const igUserId = cfg.accountId;
          let mediaType = postType === 'reel' ? 'REELS' : postType === 'story' ? 'STORIES' : undefined;
          for (const url of this.uploadedFiles.slice(0, postType === 'carousel' ? 10 : 1)) {
            const params = new URLSearchParams({ caption: msg, access_token: cfg.accessToken });
            const isVideo = url.match(/\.(mp4|mov|webm)/i);
            if (isVideo || mediaType) { params.append('media_type', mediaType || (isVideo ? 'VIDEO' : 'IMAGE')); params.append(isVideo ? 'video_url' : 'image_url', url); }
            else { params.append('image_url', url); }
            const createRes = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media`, { method: 'POST', body: params });
            const createData = await createRes.json();
            if (createData.id) {
              await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media_publish`, { method: 'POST', body: new URLSearchParams({ creation_id: createData.id, access_token: cfg.accessToken }) });
            } else { alert('IG Error: ' + JSON.stringify(createData.error || createData)); return; }
          }
        }
      }
      await db.collection('socialPosts').add(data);
    }
    this.closeComposer(); this.uploadedFiles = []; this.render();
    alert('✅ ' + (status === 'published' ? 'Posted!' : 'Draft saved!'));
  },

  async publishDraft(id) {
    const doc = await db.collection('socialPosts').doc(id).get();
    const post = doc.data();
    const configDoc = post.platform === 'facebook' ? 'facebook_page' : 'instagram_business';
    const cfg = (await db.collection('settings').doc(configDoc).get()).data();
    if (!cfg?.accessToken) return alert('Not configured!');
    if (post.platform === 'facebook') {
      const params = new URLSearchParams({ message: post.message, access_token: cfg.accessToken });
      if (post.media?.length) params.append('link', post.media[0]);
      const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.pageId}/feed`, { method: 'POST', body: params });
      const result = await res.json();
      if (result.id) await db.collection('socialPosts').doc(id).update({ status: 'published', platformId: result.id });
    }
    if (post.platform === 'instagram') {
      const igUserId = cfg.accountId;
      const mediaType = post.postType === 'reel' ? 'REELS' : post.postType === 'story' ? 'STORIES' : undefined;
      for (const url of (post.media || []).slice(0, 10)) {
        const params = new URLSearchParams({ caption: post.message, access_token: cfg.accessToken });
        const isVideo = url.match(/\.(mp4|mov|webm)/i);
        if (isVideo || mediaType) { params.append('media_type', mediaType || (isVideo ? 'VIDEO' : 'IMAGE')); params.append(isVideo ? 'video_url' : 'image_url', url); }
        else { params.append('image_url', url); }
        const cr = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media`, { method: 'POST', body: params });
        const cd = await cr.json();
        if (cd.id) await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media_publish`, { method: 'POST', body: new URLSearchParams({ creation_id: cd.id, access_token: cfg.accessToken }) });
      }
      await db.collection('socialPosts').doc(id).update({ status: 'published' });
    }
    this.render(); alert('✅ Published!');
  },

  async deletePost(id) { if (!confirm('Delete?')) return; await db.collection('socialPosts').doc(id).delete(); this.render(); }
};
