const SocialComposer = {
  uploadedFiles: [],
  activePlatforms: { facebook: true, instagram: true },
  postType: 'post',
  previewPlatform: 'facebook',
  previewMode: 'feed',
  previewDevice: 'desktop',
  autoSaveTimer: null,
  hasUnsavedChanges: false,
  carouselIndex: 0,

  render() {
    const container = document.getElementById('composerContainer');
    if (!container) return;

    this.uploadedFiles = [];
    this.hasUnsavedChanges = false;
    this.carouselIndex = 0;
    this.startAutoSave();

    container.innerHTML = `
      <style>
        .composer-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center; }
        .composer-panel { background: #f0f2f5; border-radius: 16px; width: 96%; max-width: 1300px; max-height: 92vh; overflow-y: auto; padding: 24px; }
        .composer-grid { display: grid; grid-template-columns: 1fr 400px; gap: 24px; }
        .card { background: #fff; border: 1px solid #dadde1; border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
        .card-title { font-weight: 600; margin-bottom: 12px; font-size: 14px; color: #1c1e21; }
        .btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; font-size: 14px; display: inline-flex; align-items: center; gap: 6px; }
        .btn-primary { background: #1877f2; color: #fff; }
        .btn-outline { background: #fff; color: #1877f2; border: 1px solid #dadde1; }
        .type-tab { padding: 10px 16px; border-radius: 20px; cursor: pointer; border: 1px solid #dadde1; background: #fff; font-size: 13px; font-weight: 500; }
        .type-tab.active { background: #1877f2; color: #fff; border-color: #1877f2; }
        .drop-zone { border: 2px dashed #dadde1; border-radius: 12px; padding: 30px; text-align: center; cursor: pointer; background: #fafbfc; }
        .drop-zone:hover { border-color: #1877f2; background: #e7f3ff; }
        .media-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .media-item { position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 1; background: #f0f0f0; }
        .media-item img, .media-item video { width: 100%; height: 100%; object-fit: cover; }
        .media-item .remove-btn { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); color: #fff; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 14px; z-index: 2; }
        .toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; border-radius: 8px; color: #fff; font-weight: 500; z-index: 9999; animation: slideUp 0.3s ease; }
        .toast-success { background: #31a24c; }
        .toast-error { background: #fa3e3e; }
        .toast-info { background: #1877f2; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @media (max-width: 1024px) { .composer-grid { grid-template-columns: 1fr; } }
      </style>

      <div class="composer-overlay" onclick="SocialComposer.close()">
        <div class="composer-panel" onclick="event.stopPropagation()">
          <h4 style="font-weight:700;margin:0 0 16px 0;">Create Post</h4>
          <div class="composer-grid">
            <div>
              <div class="card"><div class="card-title">Post to</div>
                <label><input type="checkbox" ${this.activePlatforms.facebook?'checked':''} onchange="SocialComposer.activePlatforms.facebook=this.checked"> <i class="fab fa-facebook text-primary"></i> Facebook</label>
                <label class="mt-1"><input type="checkbox" ${this.activePlatforms.instagram?'checked':''} onchange="SocialComposer.activePlatforms.instagram=this.checked"> <i class="fab fa-instagram text-danger"></i> Instagram</label>
              </div>
              <div class="card"><div class="card-title">Post Type</div>
                <div class="d-flex gap-2">
                  <div class="type-tab ${this.postType==='post'?'active':''}" onclick="SocialComposer.setPostType('post')">📄 Post</div>
                  <div class="type-tab ${this.postType==='reel'?'active':''}" onclick="SocialComposer.setPostType('reel')">🎬 Reel</div>
                  <div class="type-tab ${this.postType==='carousel'?'active':''}" onclick="SocialComposer.setPostType('carousel')">🖼️ Carousel</div>
                </div>
              </div>
              <div class="card"><div class="card-title">Media</div>
                <div class="drop-zone" ondragover="event.preventDefault();this.style.borderColor='#1877f2'" ondragleave="this.style.borderColor='#dadde1'" ondrop="SocialComposer.handleDrop(event)">
                  <i class="fas fa-cloud-upload-alt fa-3x" style="color:#1877f2;"></i>
                  <p style="font-weight:600;">Upload Media</p>
                  <button class="btn btn-outline btn-sm mt-2" onclick="event.stopPropagation();document.getElementById('composerFileInput').click();">Browse Files</button>
                </div>
                <input type="file" id="composerFileInput" multiple accept="image/*,video/*" style="display:none" onchange="SocialComposer.handleFileSelect(event)">
                <div class="media-grid mt-3" id="composerMediaGrid"><p class="text-muted small">No media yet.</p></div>
              </div>
              <div class="card"><div class="card-title">Caption</div>
                <textarea id="composerCaption" class="form-control" rows="5" placeholder="Write a caption..." style="border-radius:8px;" oninput="SocialComposer.onCaptionInput()"></textarea>
                <div class="d-flex justify-content-between align-items-center mt-1">
                  <div class="d-flex gap-1"><button class="btn btn-sm btn-light" onclick="SocialComposer.insertEmoji('😊')">😊</button><button class="btn btn-sm btn-light" onclick="SocialComposer.insertText('@')">@</button><button class="btn btn-sm btn-light" onclick="SocialComposer.insertText('#')">#</button></div>
                  <small class="text-muted" id="charCount">0 chars</small>
                </div>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-primary flex-grow-1" style="height:48px;" id="publishBtn" onclick="SocialComposer.publish()">🚀 Publish Now</button>
                <button class="btn btn-outline" onclick="SocialComposer.saveDraft()">💾 Draft</button>
              </div>
            </div>
            <div style="position:sticky;top:20px;">
              <div class="card">
                <div class="card-title">Preview</div>
                <div id="composerPreview"><p class="text-muted text-center py-4">Preview</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  setPostType(type) { this.postType = type; document.querySelectorAll('.type-tab').forEach(t => t.classList.remove('active')); event.target.classList.add('active'); },
  onCaptionInput() { const c = document.getElementById('composerCaption'); const cnt = document.getElementById('charCount'); if (cnt) cnt.innerText = (c?.value?.length || 0) + ' chars'; this.hasUnsavedChanges = true; },
  insertText(t) { const ta = document.getElementById('composerCaption'); if (ta) { ta.value += t; this.onCaptionInput(); } },
  insertEmoji(e) { const ta = document.getElementById('composerCaption'); if (ta) { ta.value += e; this.onCaptionInput(); } },
  async handleDrop(e) { e.preventDefault(); await this.uploadFiles(e.dataTransfer.files); },
  async handleFileSelect(e) { if (e.target.files.length > 0) { await this.uploadFiles(e.target.files); e.target.value = ''; } },

  async uploadFiles(files) {
    const max = this.postType === 'carousel' ? 10 : 1;
    for (const file of files) {
      if (this.uploadedFiles.length >= max) { this.showToast('Max ' + max + ' files', 'error'); break; }
      const tempId = 't' + Date.now();
      this.uploadedFiles.push({ id: tempId, url: null, progress: 0, name: file.name });
      this.refreshMediaGrid();
      const ref = firebase.storage().ref('social/' + Date.now() + '_' + file.name);
      const task = ref.put(file);
      task.on('state_changed', snap => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        const idx = this.uploadedFiles.findIndex(x => x.id === tempId);
        if (idx >= 0) this.uploadedFiles[idx].progress = pct;
        this.refreshMediaGrid();
      }, err => { this.showToast('Upload failed', 'error'); this.uploadedFiles = this.uploadedFiles.filter(x => x.id !== tempId); this.refreshMediaGrid(); },
      async () => {
        const url = await task.snapshot.ref.getDownloadURL();
        const idx = this.uploadedFiles.findIndex(x => x.id === tempId);
        if (idx >= 0) { this.uploadedFiles[idx].url = url; this.uploadedFiles[idx].progress = 100; }
        this.refreshMediaGrid(); this.hasUnsavedChanges = true;
      });
    }
  },

  refreshMediaGrid() {
    const g = document.getElementById('composerMediaGrid'); if (!g) return;
    if (this.uploadedFiles.length === 0) { g.innerHTML = '<p class="text-muted small">No media yet.</p>'; return; }
    g.innerHTML = this.uploadedFiles.map((f, i) => {
      let inner = f.url ? (f.url.match(/\.(mp4|mov|webm)/i) ? `<video src="${f.url}" controls></video>` : `<img src="${f.url}">`) : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:11px;color:#666;">${f.name}</div>`;
      let bar = f.progress < 100 ? `<div style="position:absolute;bottom:0;left:0;width:100%;height:6px;background:rgba(0,0,0,0.3);"><div style="height:100%;background:#1877f2;width:${f.progress}%;"></div></div>` : '';
      return `<div class="media-item">${inner}${bar}<button class="remove-btn" onclick="SocialComposer.removeMedia(${i})">×</button></div>`;
    }).join('');
  },

  removeMedia(i) { this.uploadedFiles.splice(i, 1); this.refreshMediaGrid(); this.hasUnsavedChanges = true; },
  startAutoSave() { if (this.autoSaveTimer) clearInterval(this.autoSaveTimer); this.autoSaveTimer = setInterval(() => { if (this.hasUnsavedChanges && document.getElementById('composerCaption')?.value?.trim()) this.saveDraft(true); }, 30000); },
  showToast(msg, type) { const old = document.querySelector('.toast'); if (old) old.remove(); const t = document.createElement('div'); t.className = 'toast toast-' + (type || 'success'); t.innerText = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 4000); },

  async saveDraft(silent) {
    const msg = document.getElementById('composerCaption')?.value || '';
    const media = this.uploadedFiles.filter(f => f.url).map(f => f.url);
    if (!msg && media.length === 0) return;
    await db.collection('socialPosts').add({ platform: 'facebook', message: msg, media, postType: this.postType, status: 'draft', createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    this.hasUnsavedChanges = false;
    if (!silent) this.showToast('💾 Draft saved!');
  },

  async publish() {
    const btn = document.getElementById('publishBtn');
    if (btn) { btn.disabled = true; btn.innerText = '⏳ Publishing...'; }

    const msg = document.getElementById('composerCaption')?.value || '';
    const media = this.uploadedFiles.filter(f => f.url).map(f => f.url);
    const postType = this.postType;

    if (!this.activePlatforms.facebook && !this.activePlatforms.instagram) {
      this.showToast('Select at least one platform', 'error');
      if (btn) { btn.disabled = false; btn.innerText = '🚀 Publish Now'; }
      return;
    }

    let successCount = 0;
    let errorMsg = '';

    for (const platform of ['facebook', 'instagram']) {
      if (!this.activePlatforms[platform]) continue;

      try {
        const cfg = (await db.collection('settings').doc(platform === 'facebook' ? 'facebook_page' : 'instagram_business').get()).data();
        if (!cfg?.accessToken) {
          errorMsg += platform + ' not configured. ';
          continue;
        }

        this.showToast('Posting to ' + platform + '...', 'info');

        if (platform === 'facebook') {
          if (media.length > 0) {
            for (const url of media) {
              const isVideo = url.match(/\.(mp4|mov|webm)/i);
              if (isVideo) {
                const p = new URLSearchParams({ access_token: cfg.accessToken, file_url: url, description: msg });
                const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.pageId}/videos`, { method: 'POST', body: p });
                const d = await res.json();
                if (!d.id) throw new Error(d.error?.message || 'Video failed');
              } else {
                const p = new URLSearchParams({ access_token: cfg.accessToken, url: url, caption: msg });
                const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.pageId}/photos`, { method: 'POST', body: p });
                const d = await res.json();
                if (!d.id && !d.post_id) throw new Error(d.error?.message || 'Photo failed');
              }
            }
          } else {
            const p = new URLSearchParams({ message: msg, access_token: cfg.accessToken });
            const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.pageId}/feed`, { method: 'POST', body: p });
            const d = await res.json();
            if (!d.id) throw new Error(d.error?.message || 'Post failed');
          }
        } else {
          // Instagram
          const igUserId = cfg.accountId;
          let mediaType;
          if (postType === 'reel') mediaType = 'REELS';

          if (media.length === 0) throw new Error('Instagram requires media');

          if (postType === 'carousel' && media.length > 1) {
            const children = [];
            for (const url of media.slice(0, 10)) {
              const isV = url.match(/\.(mp4|mov)/i);
              const p = new URLSearchParams({ access_token: cfg.accessToken });
              if (isV) { p.append('media_type', 'VIDEO'); p.append('video_url', url); }
              else p.append('image_url', url);
              const r = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media`, { method: 'POST', body: p });
              const d = await r.json();
              if (d.id) children.push(d.id);
              else throw new Error(d.error?.message || 'Carousel item failed');
            }
            const cp = new URLSearchParams({ caption: msg, media_type: 'CAROUSEL', access_token: cfg.accessToken });
            children.forEach((id, i) => cp.append(`children[${i}]`, id));
            const cr = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media`, { method: 'POST', body: cp });
            const cd = await cr.json();
            if (!cd.id) throw new Error(cd.error?.message || 'Carousel create failed');
            const pr = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media_publish`, { method: 'POST', body: new URLSearchParams({ creation_id: cd.id, access_token: cfg.accessToken }) });
            const pd = await pr.json();
            if (!pd.id) throw new Error(pd.error?.message || 'Carousel publish failed');
          } else {
            for (const url of media.slice(0, 1)) {
              const isV = url.match(/\.(mp4|mov|webm)/i);
              const p = new URLSearchParams({ caption: msg, access_token: cfg.accessToken });
              if (isV || mediaType) {
                p.append('media_type', mediaType || (isV ? 'VIDEO' : 'IMAGE'));
                p.append(isV ? 'video_url' : 'image_url', url);
              } else {
                p.append('image_url', url);
              }
              const cr = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media`, { method: 'POST', body: p });
              const cd = await cr.json();
              if (!cd.id) throw new Error(cd.error?.message || 'Media create failed');
              // Wait for REELS processing
              if (mediaType === 'REELS') await new Promise(r => setTimeout(r, 5000));
              const pr = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media_publish`, { method: 'POST', body: new URLSearchParams({ creation_id: cd.id, access_token: cfg.accessToken }) });
              const pd = await pr.json();
              if (!pd.id) throw new Error(pd.error?.message || 'Publish failed');
            }
          }
        }

        await db.collection('socialPosts').add({
          platform, message: msg, media, postType,
          status: 'published',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        successCount++;
      } catch (err) {
        errorMsg += platform + ': ' + err.message + ' | ';
      }
    }

    if (btn) { btn.disabled = false; btn.innerText = '🚀 Publish Now'; }

    if (successCount > 0) {
      this.close();
      Social.render();
      this.showToast('✅ Posted to ' + successCount + ' platform(s)!');
    }
    if (errorMsg) {
      this.showToast('❌ ' + errorMsg, 'error');
    }
  },

  close() {
    if (this.autoSaveTimer) clearInterval(this.autoSaveTimer);
    document.getElementById('composerContainer').innerHTML = '';
  }
};
