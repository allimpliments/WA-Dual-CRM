const SocialComposer = {
  uploadedFiles: [],
  activePlatforms: { facebook: true, instagram: true },
  postType: 'post',
  previewPlatform: 'facebook',
  previewMode: 'feed',
  previewDevice: 'desktop',
  autoSaveTimer: null,
  hasUnsavedChanges: false,

  render() {
    const container = document.getElementById('composerContainer');
    if (!container) return;

    this.uploadedFiles = [];
    this.hasUnsavedChanges = false;
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
        .drop-zone { border: 2px dashed #dadde1; border-radius: 12px; padding: 30px; text-align: center; cursor: pointer; background: #fafbfc; transition: 0.2s; }
        .drop-zone:hover { border-color: #1877f2; background: #e7f3ff; }
        .media-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .media-item { position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 1; background: #f0f0f0; }
        .media-item img, .media-item video { width: 100%; height: 100%; object-fit: cover; }
        .media-item .remove-btn { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); color: #fff; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 14px; z-index: 2; }
        .media-item .progress-overlay { position: absolute; bottom: 0; left: 0; width: 100%; height: 6px; background: rgba(0,0,0,0.3); }
        .media-item .progress-fill { height: 100%; background: #1877f2; width: 0%; transition: width 0.3s; }
        .media-item .uploading-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); color: #1877f2; font-size: 12px; font-weight: 600; }
        .preview-feed { background: #fff; border-radius: 8px; padding: 12px; }
        .preview-story { background: #000; border-radius: 12px; min-height: 400px; color: #fff; position: relative; padding: 16px; overflow: hidden; }
        .preview-story img, .preview-story video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 12px; }
        .preview-reel { background: #000; border-radius: 8px; aspect-ratio: 9/16; color: #fff; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        .preview-reel video, .preview-reel img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }
        .preview-phone { max-width: 360px; margin: 0 auto; background: #fff; border-radius: 24px; padding: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .char-count { font-size: 12px; color: #65676b; }
        .toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; border-radius: 8px; color: #fff; font-weight: 500; z-index: 9999; animation: slideUp 0.3s ease; }
        .toast-success { background: #31a24c; }
        .toast-error { background: #fa3e3e; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @media (max-width: 1024px) { .composer-grid { grid-template-columns: 1fr; } }
      </style>

      <div class="composer-overlay" onclick="SocialComposer.close()">
        <div class="composer-panel" onclick="event.stopPropagation()">
          <div class="d-flex justify-content-between align-items-center mb-3" style="position:sticky;top:0;background:#f0f2f5;padding-bottom:12px;z-index:5;">
            <h4 style="font-weight:700;margin:0;">Create Post</h4>
            <button class="btn-close" onclick="SocialComposer.close()"></button>
          </div>

          <div class="composer-grid">
            <!-- LEFT PANEL -->
            <div>
              <div class="card">
                <div class="card-title">Post to</div>
                <label class="d-flex align-items-center gap-2"><input type="checkbox" ${this.activePlatforms.facebook?'checked':''} onchange="SocialComposer.activePlatforms.facebook=this.checked"> <i class="fab fa-facebook text-primary"></i> Facebook</label>
                <label class="d-flex align-items-center gap-2 mt-1"><input type="checkbox" ${this.activePlatforms.instagram?'checked':''} onchange="SocialComposer.activePlatforms.instagram=this.checked"> <i class="fab fa-instagram text-danger"></i> Instagram</label>
              </div>

              <div class="card">
                <div class="card-title">Post Type</div>
                <div class="d-flex gap-2">
                  <div class="type-tab ${this.postType==='post'?'active':''}" onclick="SocialComposer.setPostType('post')">📄 Post</div>
                  <div class="type-tab ${this.postType==='story'?'active':''}" onclick="SocialComposer.setPostType('story')">📱 Story</div>
                  <div class="type-tab ${this.postType==='reel'?'active':''}" onclick="SocialComposer.setPostType('reel')">🎬 Reel</div>
                  <div class="type-tab ${this.postType==='carousel'?'active':''}" onclick="SocialComposer.setPostType('carousel')">🖼️ Carousel</div>
                </div>
                <small class="text-muted mt-1 d-block">
                  ${this.postType==='post'?'Share photos or a video.':this.postType==='story'?'Upload a photo or short video. Expires after 24 hours.':this.postType==='reel'?'Upload a vertical video (9:16).':this.postType==='carousel'?'Upload up to 10 photos that users can swipe through.'}
                </small>
              </div>

              <div class="card">
                <div class="card-title">Media</div>
                <div class="drop-zone" ondragover="event.preventDefault();this.style.borderColor='#1877f2';this.style.background='#e7f3ff';" ondragleave="this.style.borderColor='#dadde1';this.style.background='#fafbfc';" ondrop="SocialComposer.handleDrop(event)">
                  <i class="fas fa-cloud-upload-alt fa-3x" style="color:#1877f2;margin-bottom:8px;"></i>
                  <p style="font-weight:600;">Upload Media</p>
                  <p class="text-muted small">Drag & drop or click to browse</p>
                  <button class="btn btn-outline btn-sm mt-2" onclick="event.stopPropagation();document.getElementById('composerFileInput').click();">Browse Files</button>
                </div>
                <input type="file" id="composerFileInput" multiple accept="image/*,video/*" style="display:none" onchange="SocialComposer.handleFileSelect(event)">
                <div class="media-grid mt-3" id="composerMediaGrid">
                  <p class="text-muted small">No media uploaded yet.</p>
                </div>
              </div>

              <div class="card">
                <div class="card-title">Caption</div>
                <textarea id="composerCaption" class="form-control" rows="5" placeholder="Write a caption..." style="border-radius:8px;resize:vertical;" oninput="SocialComposer.onCaptionInput()"></textarea>
                <div class="d-flex justify-content-between align-items-center mt-1">
                  <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-light" onclick="SocialComposer.insertEmoji('😊')">😊</button>
                    <button class="btn btn-sm btn-light" onclick="SocialComposer.insertEmoji('😂')">😂</button>
                    <button class="btn btn-sm btn-light" onclick="SocialComposer.insertEmoji('❤️')">❤️</button>
                    <button class="btn btn-sm btn-light" onclick="SocialComposer.insertEmoji('🔥')">🔥</button>
                    <button class="btn btn-sm btn-light" onclick="SocialComposer.insertText('@')">@</button>
                    <button class="btn btn-sm btn-light" onclick="SocialComposer.insertText('#')">#</button>
                  </div>
                  <span class="char-count" id="charCount">0 characters</span>
                </div>
              </div>

              <div class="card">
                <div class="card-title">Schedule</div>
                <div class="row g-2">
                  <div class="col-6"><input type="date" id="scheduleDate" class="form-control form-control-sm" style="border-radius:8px;"></div>
                  <div class="col-6"><input type="time" id="scheduleTime" class="form-control form-control-sm" style="border-radius:8px;"></div>
                </div>
              </div>

              <div class="d-flex gap-2">
                <button class="btn btn-primary flex-grow-1" style="height:48px;" onclick="SocialComposer.publish()">🚀 Publish Now</button>
                <button class="btn btn-outline" onclick="SocialComposer.saveDraft()">💾 Draft</button>
              </div>
            </div>

            <!-- RIGHT PANEL: Preview -->
            <div style="position:sticky;top:20px;">
              <div class="card">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div class="card-title" style="margin:0;">Preview</div>
                  <div class="d-flex gap-1">
                    <select class="form-select form-select-sm" style="width:auto;" onchange="SocialComposer.previewPlatform=this.value;SocialComposer.updatePreview();">
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                    </select>
                    <select class="form-select form-select-sm" style="width:auto;" onchange="SocialComposer.previewMode=this.value;SocialComposer.updatePreview();">
                      <option value="feed">Feed</option>
                      <option value="story">Story</option>
                      <option value="reel">Reel</option>
                    </select>
                    <button class="btn btn-sm btn-light" onclick="SocialComposer.previewDevice = SocialComposer.previewDevice==='desktop'?'mobile':'desktop'; SocialComposer.updatePreview();" title="Toggle Device">
                      <i class="fas fa-${this.previewDevice==='desktop'?'mobile-alt':'desktop'}"></i>
                    </button>
                  </div>
                </div>
                <div id="composerPreview" style="max-width:${this.previewDevice==='mobile'?'320px':'100%'};margin:0 auto;">
                  <p class="text-muted text-center py-4">Start writing to see preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.addEventListener('keydown', this.handleKeyboard);
  },

  handleKeyboard(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); SocialComposer.saveDraft(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); SocialComposer.publish(); }
  },

  setPostType(type) {
    this.postType = type;
    document.querySelectorAll('.type-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    if (type === 'story') this.previewMode = 'story';
    else if (type === 'reel') this.previewMode = 'reel';
    else this.previewMode = 'feed';
    const modeSel = document.getElementById('previewMode');
    if (modeSel) modeSel.value = this.previewMode;
    this.updatePreview();
  },

  onCaptionInput() {
    const caption = document.getElementById('composerCaption');
    const count = document.getElementById('charCount');
    if (count) count.innerText = (caption?.value?.length || 0) + ' characters';
    this.hasUnsavedChanges = true;
    this.updatePreview();
  },

  insertText(text) {
    const ta = document.getElementById('composerCaption');
    if (ta) { ta.value += text; this.onCaptionInput(); }
  },

  insertEmoji(emoji) {
    const ta = document.getElementById('composerCaption');
    if (ta) { ta.value += emoji; this.onCaptionInput(); }
  },

  async handleDrop(e) {
    e.preventDefault();
    e.target.style.borderColor = '#dadde1';
    e.target.style.background = '#fafbfc';
    await this.uploadFiles(e.dataTransfer.files);
  },

  async handleFileSelect(e) {
    if (e.target.files.length > 0) {
      await this.uploadFiles(e.target.files);
      e.target.value = '';
    }
  },

  async uploadFiles(files) {
    const max = this.postType === 'carousel' ? 10 : 1;
    for (const file of files) {
      if (this.uploadedFiles.length >= max) {
        this.showToast(`Max ${max} file(s) for ${this.postType}`, 'error');
        break;
      }
      const tempId = 'temp_' + Date.now() + Math.random();
      const fileObj = { id: tempId, url: null, progress: 0, name: file.name };
      this.uploadedFiles.push(fileObj);
      this.refreshMediaGrid();

      const storageRef = firebase.storage().ref('social/' + Date.now() + '_' + file.name);
      const uploadTask = storageRef.put(file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          const idx = this.uploadedFiles.findIndex(f => f.id === tempId);
          if (idx >= 0) this.uploadedFiles[idx].progress = Math.round(progress);
          this.refreshMediaGrid();
        },
        (error) => {
          this.showToast('Upload failed: ' + error.message, 'error');
          this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== tempId);
          this.refreshMediaGrid();
        },
        async () => {
          const url = await uploadTask.snapshot.ref.getDownloadURL();
          const idx = this.uploadedFiles.findIndex(f => f.id === tempId);
          if (idx >= 0) {
            this.uploadedFiles[idx].url = url;
            this.uploadedFiles[idx].progress = 100;
          }
          this.refreshMediaGrid();
          this.hasUnsavedChanges = true;
        }
      );
    }
  },

  refreshMediaGrid() {
    const grid = document.getElementById('composerMediaGrid');
    if (!grid) return;

    if (this.uploadedFiles.length === 0) {
      grid.innerHTML = '<p class="text-muted small">No media uploaded yet.</p>';
      return;
    }

    grid.innerHTML = this.uploadedFiles.map((f, i) => `
      <div class="media-item">
        ${f.url
          ? (f.url.match(/\.(mp4|mov|webm)/i)
              ? `<video src="${f.url}" controls></video>`
              : `<img src="${f.url}" alt="media">`)
          : `<div class="text-muted small" style="padding:8px;text-align:center;">${f.name}<br>Uploading...</div>`
        }
        ${f.progress < 100
          ? `<div class="progress-overlay"><div class="progress-fill" style="width:${f.progress}%;"></div></div>
             <div class="uploading-text">${f.progress}%</div>`
          : ''}
        <button class="remove-btn" onclick="SocialComposer.removeMedia(${i})">×</button>
      </div>
    `).join('');

    this.updatePreview();
  },

  removeMedia(i) {
    this.uploadedFiles.splice(i, 1);
    this.refreshMediaGrid();
    this.hasUnsavedChanges = true;
  },

  getPreviewHTML() {
    const caption = document.getElementById?.('composerCaption')?.value || 'Start writing...';
    const media = this.uploadedFiles.filter(f => f.url).map(f => f.url);

    if (media.length === 0 && !caption) {
      return '<p class="text-muted text-center py-4">Start writing to see preview</p>';
    }

    if (this.previewMode === 'story') {
      return `<div class="preview-story">
        ${media.length > 0 ? (media[0].match(/\.(mp4|mov)/i) ? `<video src="${media[0]}" autoplay muted loop></video>` : `<img src="${media[0]}">`) : ''}
        <div style="position:absolute;top:12px;left:12px;font-weight:600;font-size:13px;">11 Avatar Digital Hub</div>
        <div style="position:absolute;bottom:12px;left:12px;right:12px;background:rgba(0,0,0,0.5);padding:8px;border-radius:8px;font-size:13px;">${caption}</div>
      </div>`;
    }
    if (this.previewMode === 'reel') {
      return `<div class="preview-reel">
        ${media.length > 0 && media[0].match(/\.(mp4|mov)/i) ? `<video src="${media[0]}" controls></video>` : '<p style="color:#aaa;">🎬 Upload a video for Reel preview</p>'}
        <div style="position:absolute;bottom:8px;left:8px;right:8px;color:#fff;font-size:12px;background:rgba(0,0,0,0.5);padding:4px 8px;border-radius:4px;">${caption}</div>
      </div>`;
    }

    // Feed preview
    let html = `<div class="preview-feed">`;
    html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
      <div style="width:32px;height:32px;border-radius:50%;background:#1877f2;color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;">11</div>
      <div><strong style="font-size:13px;">11 Avatar Digital Hub</strong><br><small style="color:#65676b;">Just now · 🌍</small></div>
    </div>`;
    if (media.length > 0) {
      if (this.postType === 'carousel') {
        html += `<div style="display:flex;overflow-x:auto;gap:4px;">`;
        media.forEach(m => {
          html += `<img src="${m}" style="width:100%;flex-shrink:0;border-radius:8px;max-height:300px;object-fit:cover;">`;
        });
        html += `</div>`;
      } else {
        media.forEach(m => {
          html += m.match(/\.(mp4|mov)/i)
            ? `<video src="${m}" controls style="width:100%;border-radius:8px;margin-bottom:4px;max-height:300px;"></video>`
            : `<img src="${m}" style="width:100%;border-radius:8px;margin-bottom:4px;max-height:300px;object-fit:cover;">`;
        });
      }
    }
    html += `<p style="margin-top:8px;font-size:14px;">${caption}</p>`;
    html += `<div style="display:flex;justify-content:space-between;color:#65676b;font-size:12px;border-top:1px solid #dadde1;padding-top:8px;margin-top:8px;">
      <span>👍 Like</span><span>💬 Comment</span><span>↗ Share</span>
    </div></div>`;
    return html;
  },

  updatePreview() {
    const preview = document.getElementById('composerPreview');
    if (preview) preview.innerHTML = this.getPreviewHTML();
  },

  startAutoSave() {
    if (this.autoSaveTimer) clearInterval(this.autoSaveTimer);
    this.autoSaveTimer = setInterval(() => {
      if (this.hasUnsavedChanges && document.getElementById('composerCaption')?.value?.trim()) {
        this.saveDraft(true);
      }
    }, 30000);
  },

  showToast(msg, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },

  async saveDraft(silent = false) {
    const msg = document.getElementById('composerCaption')?.value || '';
    const media = this.uploadedFiles.filter(f => f.url).map(f => f.url);
    if (!msg && media.length === 0) return;
    try {
      await db.collection('socialPosts').add({
        platform: 'facebook',
        message: msg,
        media: media,
        postType: this.postType,
        status: 'draft',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this.hasUnsavedChanges = false;
      if (!silent) this.showToast('💾 Draft saved!');
    } catch (err) {
      this.showToast('Draft save failed', 'error');
    }
  },

  async publish() {
    const msg = document.getElementById('composerCaption')?.value || '';
    const scheduleDate = document.getElementById('scheduleDate')?.value;
    const scheduleTime = document.getElementById('scheduleTime')?.value;
    const scheduledAt = (scheduleDate && scheduleTime) ? new Date(scheduleDate + 'T' + scheduleTime).toISOString() : null;
    const finalStatus = scheduledAt ? 'scheduled' : 'published';
    const media = this.uploadedFiles.filter(f => f.url).map(f => f.url);

    if (!this.activePlatforms.facebook && !this.activePlatforms.instagram) {
      this.showToast('Select at least one platform', 'error');
      return;
    }
    if (media.length === 0) {
      this.showToast('Please upload at least one media file', 'error');
      return;
    }

    this.showToast('Publishing...', 'success');

    for (const platform of ['facebook', 'instagram']) {
      if (!this.activePlatforms[platform]) continue;
      const configDoc = platform === 'facebook' ? 'facebook_page' : 'instagram_business';
      const cfg = (await db.collection('settings').doc(configDoc).get()).data();
      if (!cfg?.accessToken) { this.showToast(`${platform} not configured`, 'error'); return; }

      try {
        if (platform === 'facebook') {
          const params = new URLSearchParams({ message: msg, access_token: cfg.accessToken });
          if (media.length > 0) params.append('link', media[0]);
          const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.pageId}/feed`, { method: 'POST', body: params });
          const result = await res.json();
          if (!result.id) throw new Error(result.error?.message || 'FB post failed');
        } else {
          const igUserId = cfg.accountId;
          for (const url of media.slice(0, this.postType === 'carousel' ? 10 : 1)) {
            const isVideo = url.match(/\.(mp4|mov)/i);
            const params = new URLSearchParams({ caption: msg, access_token: cfg.accessToken });
            if (isVideo) { params.append('media_type', 'VIDEO'); params.append('video_url', url); }
            else params.append('image_url', url);
            const cr = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media`, { method: 'POST', body: params });
            const cd = await cr.json();
            if (cd.id) {
              await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media_publish`, {
                method: 'POST',
                body: new URLSearchParams({ creation_id: cd.id, access_token: cfg.accessToken })
              });
            } else throw new Error(cd.error?.message || 'IG failed');
          }
        }

        await db.collection('socialPosts').add({
          platform, message: msg, media, postType: this.postType,
          status: finalStatus, scheduledAt,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (err) {
        this.showToast(`${platform}: ${err.message}`, 'error');
        return;
      }
    }

    this.close();
    Social.render();
    this.showToast('✅ ' + (finalStatus === 'published' ? 'Posted!' : 'Scheduled!'));
  },

  close() {
    if (this.hasUnsavedChanges && !confirm('You have unsaved changes. Close anyway?')) return;
    if (this.autoSaveTimer) clearInterval(this.autoSaveTimer);
    document.removeEventListener('keydown', this.handleKeyboard);
    document.getElementById('composerContainer').innerHTML = '';
  }
};
