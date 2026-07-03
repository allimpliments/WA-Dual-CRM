// ==================== SOCIAL COMPOSER ====================
const SocialComposer = {
  uploadedFiles: [],
  activePlatforms: { facebook: true, instagram: true },
  postType: 'post',
  previewPlatform: 'facebook',
  previewMode: 'feed',
  previewDevice: 'desktop',
  autoSaveTimer: null,
  hasUnsavedChanges: false,
  hashtagSuggestions: ['#socialmedia', '#marketing', '#digital', '#business', '#growth', '#branding', '#instagram', '#facebook', '#reels', '#story'],

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
        .btn-outline:hover { background: #f5f6f7; }
        .type-tab { padding: 10px 16px; border-radius: 20px; cursor: pointer; border: 1px solid #dadde1; background: #fff; font-size: 13px; font-weight: 500; }
        .type-tab.active { background: #1877f2; color: #fff; border-color: #1877f2; }
        .drop-zone { border: 2px dashed #dadde1; border-radius: 12px; padding: 30px; text-align: center; cursor: pointer; background: #fafbfc; transition: 0.2s; }
        .drop-zone:hover, .drop-zone.drag-over { border-color: #1877f2; background: #e7f3ff; }
        .media-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .media-item { position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 1; background: #f0f0f0; }
        .media-item img, .media-item video { width: 100%; height: 100%; object-fit: cover; }
        .media-item .remove-btn { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.6); color: #fff; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 14px; z-index: 1; }
        .media-item .progress-bar { position: absolute; bottom: 0; left: 0; height: 4px; background: #1877f2; border-radius: 2px; }
        .preview-feed { background: #fff; border-radius: 8px; padding: 12px; }
        .preview-story { background: #000; border-radius: 12px; min-height: 400px; color: #fff; position: relative; padding: 16px; }
        .preview-reel { background: #000; border-radius: 8px; aspect-ratio: 9/16; color: #fff; display: flex; align-items: center; justify-content: center; position: relative; }
        .emoji-picker { position: absolute; bottom: 40px; left: 0; background: #fff; border: 1px solid #dadde1; border-radius: 12px; padding: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); display: none; z-index: 10; }
        .emoji-picker.show { display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; }
        .emoji-picker span { cursor: pointer; font-size: 20px; padding: 4px; text-align: center; border-radius: 4px; }
        .emoji-picker span:hover { background: #f0f2f5; }
        .hashtag-dropdown { position: absolute; background: #fff; border: 1px solid #dadde1; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 10; display: none; max-height: 150px; overflow-y: auto; }
        .hashtag-dropdown.show { display: block; }
        .hashtag-dropdown div { padding: 8px 12px; cursor: pointer; font-size: 13px; }
        .hashtag-dropdown div:hover { background: #f0f7ff; }
        .toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; border-radius: 8px; color: #fff; font-weight: 500; z-index: 9999; animation: slideUp 0.3s ease; }
        .toast-success { background: #31a24c; }
        .toast-error { background: #fa3e3e; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @media (max-width: 1024px) { .composer-grid { grid-template-columns: 1fr; } }
      </style>

      <div class="composer-overlay" onclick="SocialComposer.close()">
        <div class="composer-panel" onclick="event.stopPropagation()">
          <!-- Sticky Header -->
          <div class="d-flex justify-content-between align-items-center mb-3" style="position:sticky;top:0;background:#f0f2f5;padding-bottom:12px;z-index:5;">
            <h4 style="font-weight:700;margin:0;">Create Post</h4>
            <button class="btn-close" onclick="SocialComposer.close()"></button>
          </div>

          <div class="composer-grid">
            <!-- LEFT PANEL -->
            <div>
              <!-- Post to -->
              <div class="card">
                <div class="card-title">Post to</div>
                <label class="d-flex align-items-center gap-2"><input type="checkbox" ${this.activePlatforms.facebook?'checked':''} onchange="SocialComposer.activePlatforms.facebook=this.checked"> <i class="fab fa-facebook text-primary"></i> Facebook Page</label>
                <label class="d-flex align-items-center gap-2 mt-1"><input type="checkbox" ${this.activePlatforms.instagram?'checked':''} onchange="SocialComposer.activePlatforms.instagram=this.checked"> <i class="fab fa-instagram text-danger"></i> Instagram Business</label>
              </div>

              <!-- Post Type -->
              <div class="card">
                <div class="card-title">Post Type</div>
                <div class="d-flex gap-2">
                  <div class="type-tab ${this.postType==='post'?'active':''}" onclick="SocialComposer.setPostType('post')">📄 Post</div>
                  <div class="type-tab ${this.postType==='story'?'active':''}" onclick="SocialComposer.setPostType('story')">📱 Story</div>
                  <div class="type-tab ${this.postType==='reel'?'active':''}" onclick="SocialComposer.setPostType('reel')">🎬 Reel</div>
                  <div class="type-tab ${this.postType==='carousel'?'active':''}" onclick="SocialComposer.setPostType('carousel')">🖼️ Carousel</div>
                </div>
              </div>

              <!-- Media Upload -->
              <div class="card">
                <div class="card-title">Media</div>
                <div class="drop-zone" id="dropZone" ondragover="event.preventDefault();this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="SocialComposer.handleDrop(event)">
                  <i class="fas fa-cloud-upload-alt fa-3x" style="color:#1877f2;margin-bottom:8px;"></i>
                  <p style="font-weight:600;">Upload Media</p>
                  <p class="text-muted small">Add photos or video by dragging and dropping</p>
                  <button class="btn btn-outline btn-sm mt-2" onclick="event.stopPropagation();document.getElementById('composerFileInput').click();">Browse Files</button>
                </div>
                <input type="file" id="composerFileInput" multiple accept="image/*,video/*" style="display:none" onchange="SocialComposer.handleFileSelect(event)">
                <div class="media-grid mt-3" id="composerMediaGrid"></div>
              </div>

              <!-- Caption -->
              <div class="card" style="position:relative;">
                <div class="card-title">Caption</div>
                <textarea id="composerCaption" class="form-control" rows="5" placeholder="Write a caption..." style="border-radius:8px;resize:vertical;" oninput="SocialComposer.onCaptionInput()"></textarea>
                <div class="d-flex justify-content-between align-items-center mt-1">
                  <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-light" id="emojiBtn" onclick="SocialComposer.toggleEmojiPicker()">😊</button>
                    <button class="btn btn-sm btn-light" onclick="SocialComposer.insertText('@')">@</button>
                    <button class="btn btn-sm btn-light" onclick="SocialComposer.insertText('#')">#</button>
                  </div>
                  <small class="text-muted" id="charCount">0 characters</small>
                </div>
                <!-- Emoji Picker -->
                <div class="emoji-picker" id="emojiPicker">
                  ${['😊','😂','❤️','🔥','👍','🎉','😍','🤔','💯','✨','😢','😡','🥳','🤩','😎','💪'].map(e => `<span onclick="SocialComposer.insertEmoji('${e}')">${e}</span>`).join('')}
                </div>
                <!-- Hashtag Dropdown -->
                <div class="hashtag-dropdown" id="hashtagDropdown"></div>
              </div>

              <!-- Schedule -->
              <div class="card">
                <div class="card-title">Schedule</div>
                <div class="row g-2">
                  <div class="col-6"><input type="date" id="scheduleDate" class="form-control form-control-sm" style="border-radius:8px;"></div>
                  <div class="col-6"><input type="time" id="scheduleTime" class="form-control form-control-sm" style="border-radius:8px;"></div>
                </div>
              </div>

              <!-- Actions -->
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
                  ${this.getPreviewHTML()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Keyboard shortcut
    document.addEventListener('keydown', this.handleKeyboard);
  },

  // ==================== KEYBOARD SHORTCUTS ====================
  handleKeyboard(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      SocialComposer.saveDraft();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      SocialComposer.publish();
    }
  },

  // ==================== POST TYPE ====================
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

  // ==================== CAPTION ====================
  onCaptionInput() {
    const caption = document.getElementById('composerCaption');
    const count = document.getElementById('charCount');
    if (count) count.innerText = (caption?.value?.length || 0) + ' characters';
    this.hasUnsavedChanges = true;
    this.updatePreview();
    // Hashtag suggestion
    const val = caption?.value || '';
    const lastWord = val.split(' ').pop();
    if (lastWord.startsWith('#') && lastWord.length > 1) {
      this.showHashtagSuggestions(lastWord);
    } else {
      document.getElementById('hashtagDropdown')?.classList.remove('show');
    }
  },

  showHashtagSuggestions(query) {
    const dd = document.getElementById('hashtagDropdown');
    if (!dd) return;
    const filtered = this.hashtagSuggestions.filter(h => h.toLowerCase().includes(query.toLowerCase()));
    if (filtered.length === 0) { dd.classList.remove('show'); return; }
    dd.innerHTML = filtered.map(h => `<div onclick="SocialComposer.insertHashtag('${h}')">${h}</div>`).join('');
    dd.classList.add('show');
  },

  insertHashtag(tag) {
    const ta = document.getElementById('composerCaption');
    if (!ta) return;
    const val = ta.value;
    const lastSpace = val.lastIndexOf(' ');
    ta.value = val.substring(0, lastSpace + 1) + tag + ' ';
    document.getElementById('hashtagDropdown')?.classList.remove('show');
    this.onCaptionInput();
  },

  insertText(text) {
    const ta = document.getElementById('composerCaption');
    if (ta) { ta.value += text; this.onCaptionInput(); }
  },

  // ==================== EMOJI PICKER ====================
  toggleEmojiPicker() {
    const picker = document.getElementById('emojiPicker');
    if (picker) picker.classList.toggle('show');
  },

  insertEmoji(emoji) {
    const ta = document.getElementById('composerCaption');
    if (ta) { ta.value += emoji; this.onCaptionInput(); }
    document.getElementById('emojiPicker')?.classList.remove('show');
  },

  // ==================== MEDIA UPLOAD ====================
  async handleDrop(e) {
    e.preventDefault();
    e.target.classList.remove('drag-over');
    await this.uploadFiles(e.dataTransfer.files);
  },

  async handleFileSelect(e) {
    await this.uploadFiles(e.target.files);
  },

  async uploadFiles(files) {
    const max = this.postType === 'carousel' ? 10 : 1;
    for (const file of files) {
      if (this.uploadedFiles.length >= max) { this.showToast(`Max ${max} file(s) for ${this.postType}`, 'error'); break; }
      // Show progress placeholder
      const tempId = 'temp_' + Date.now();
      this.uploadedFiles.push({ id: tempId, url: null, progress: 0 });
      this.refreshMediaGrid();
      // Upload
      const ref = firebase.storage().ref('social/' + Date.now() + '_' + file.name);
      const task = ref.put(file);
      task.on('state_changed', (snap) => {
        const progress = (snap.bytesTransferred / snap.totalBytes) * 100;
        const idx = this.uploadedFiles.findIndex(f => f.id === tempId);
        if (idx >= 0) this.uploadedFiles[idx].progress = progress;
        this.refreshMediaGrid();
      }, (err) => {
        this.showToast('Upload failed: ' + err.message, 'error');
        this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== tempId);
        this.refreshMediaGrid();
      }, async () => {
        const url = await task.snapshot.ref.getDownloadURL();
        const idx = this.uploadedFiles.findIndex(f => f.id === tempId);
        if (idx >= 0) { this.uploadedFiles[idx].url = url; this.uploadedFiles[idx].progress = 100; }
        this.refreshMediaGrid();
        this.hasUnsavedChanges = true;
      });
    }
  },

  refreshMediaGrid() {
    const grid = document.getElementById('composerMediaGrid');
    if (!grid) return;
    grid.innerHTML = this.uploadedFiles.map((f, i) => `
      <div class="media-item">
        ${f.url ? (f.url.match(/\.(mp4|mov|webm)/i) ? `<video src="${f.url}" controls></video>` : `<img src="${f.url}">`) : `<div class="d-flex align-items-center justify-content-center h-100 text-muted">Uploading...</div>`}
        ${f.progress !== undefined && f.progress < 100 ? `<div class="progress-bar" style="width:${f.progress}%;"></div>` : ''}
        <button class="remove-btn" onclick="SocialComposer.removeMedia(${i})">×</button>
      </div>
    `).join('');
    this.updatePreview();
  },

  removeMedia(i) { this.uploadedFiles.splice(i, 1); this.refreshMediaGrid(); this.hasUnsavedChanges = true; },

  // ==================== PREVIEW ====================
  getPreviewHTML() {
    const caption = document.getElementById?.('composerCaption')?.value || 'Start writing...';
    const media = this.uploadedFiles.filter(f => f.url).map(f => f.url);
    if (this.previewMode === 'story') {
      return `<div class="preview-story">${media.length>0 ? (media[0].match(/\.(mp4|mov)/i) ? `<video src="${media[0]}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;border-radius:12px;" autoplay muted loop></video>` : `<img src="${media[0]}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;border-radius:12px;">`) : ''}<div style="position:absolute;bottom:12px;left:12px;right:12px;background:rgba(0,0,0,0.5);padding:8px;border-radius:8px;">${caption}</div></div>`;
    }
    if (this.previewMode === 'reel') {
      return `<div class="preview-reel">${media.length>0 && media[0].match(/\.(mp4|mov)/i) ? `<video src="${media[0]}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" controls></video>` : '<p>🎬 Upload a video for Reel preview</p>'}</div>`;
    }
    return `<div class="preview-feed"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="width:32px;height:32px;border-radius:50%;background:#1877f2;color:#fff;display:flex;align-items:center;justify-content:center;">11</div><div><strong>11 Avatar Digital Hub</strong><br><small>Just now</small></div></div>${media.map(m => m.match(/\.(mp4|mov)/i) ? `<video src="${m}" controls style="width:100%;border-radius:8px;margin-bottom:4px;"></video>` : `<img src="${m}" style="width:100%;border-radius:8px;margin-bottom:4px;">`).join('')}<p style="margin-top:8px;">${caption}</p></div>`;
  },

  updatePreview() {
    const preview = document.getElementById('composerPreview');
    if (preview) preview.innerHTML = this.getPreviewHTML();
  },

  // ==================== AUTO-SAVE ====================
  startAutoSave() {
    if (this.autoSaveTimer) clearInterval(this.autoSaveTimer);
    this.autoSaveTimer = setInterval(() => {
      if (this.hasUnsavedChanges) {
        this.saveDraft(true);
      }
    }, 30000); // every 30 seconds
  },

  // ==================== TOAST ====================
  showToast(msg, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },

  // ==================== SAVE & PUBLISH ====================
  async saveDraft(silent = false) {
    const msg = document.getElementById('composerCaption')?.value || '';
    const data = {
      message: msg,
      media: this.uploadedFiles.filter(f => f.url).map(f => f.url),
      postType: this.postType,
      status: 'draft',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection('socialPosts').add(data);
    this.hasUnsavedChanges = false;
    if (!silent) this.showToast('💾 Draft saved!');
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

    for (const platform of ['facebook', 'instagram']) {
      if (!this.activePlatforms[platform]) continue;
      const configDoc = platform === 'facebook' ? 'facebook_page' : 'instagram_business';
      const cfg = (await db.collection('settings').doc(configDoc).get()).data();
      if (!cfg?.accessToken) { this.showToast(`${platform} not configured`, 'error'); return; }

      const data = { platform, message: msg, media, status: finalStatus, postType: this.postType, scheduledAt, createdAt: firebase.firestore.FieldValue.serverTimestamp() };

      if (finalStatus === 'published') {
        try {
          if (platform === 'facebook') {
            if (this.postType === 'story') {
              const isVideo = media[0]?.match(/\.(mp4|mov)/i);
              const ep = isVideo ? `/${cfg.pageId}/video_stories` : `/${cfg.pageId}/photo_stories`;
              const params = new URLSearchParams({ access_token: cfg.accessToken });
              if (isVideo) params.append('file_url', media[0]); else params.append('url', media[0]);
              const res = await fetch(`https://graph.facebook.com/v22.0${ep}`, { method: 'POST', body: params });
              const result = await res.json();
              if (result.id) data.platformId = result.id;
              else throw new Error(result.error?.message);
            } else if (this.postType === 'reel') {
              const params = new URLSearchParams({ file_url: media[0], description: msg, access_token: cfg.accessToken });
              const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.pageId}/videos`, { method: 'POST', body: params });
              const result = await res.json();
              if (result.id) data.platformId = result.id;
              else throw new Error(result.error?.message);
            } else {
              const params = new URLSearchParams({ message: msg, access_token: cfg.accessToken });
              if (media.length > 0) params.append('link', media[0]);
              const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.pageId}/feed`, { method: 'POST', body: params });
              const result = await res.json();
              if (result.id) data.platformId = result.id;
              else throw new Error(result.error?.message);
            }
          } else {
            if (media.length === 0) throw new Error('Media required');
            const igUserId = cfg.accountId;
            let mediaType = this.postType === 'reel' ? 'REELS' : this.postType === 'story' ? 'STORIES' : undefined;
            if (this.postType === 'carousel') {
              const children = [];
              for (const url of media.slice(0, 10)) {
                const isVideo = url.match(/\.(mp4|mov)/i);
                const params = new URLSearchParams({ access_token: cfg.accessToken });
                if (isVideo) { params.append('media_type', 'VIDEO'); params.append('video_url', url); }
                else params.append('image_url', url);
                const res = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media`, { method: 'POST', body: params });
                const r = await res.json();
                if (r.id) children.push(r.id);
                else throw new Error(r.error?.message);
              }
              const cp = new URLSearchParams({ caption: msg, media_type: 'CAROUSEL', access_token: cfg.accessToken });
              children.forEach((id, i) => cp.append(`children[${i}]`, id));
              const cr = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media`, { method: 'POST', body: cp });
              const cd = await cr.json();
              if (cd.id) {
                const pr = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media_publish`, { method: 'POST', body: new URLSearchParams({ creation_id: cd.id, access_token: cfg.accessToken }) });
                const pd = await pr.json();
                if (pd.id) data.platformId = pd.id;
                else throw new Error(pd.error?.message);
              } else throw new Error(cd.error?.message);
            } else {
              for (const url of media.slice(0, 1)) {
                const isVideo = url.match(/\.(mp4|mov)/i);
                const params = new URLSearchParams({ caption: msg, access_token: cfg.accessToken });
                if (isVideo || mediaType) { params.append('media_type', mediaType || (isVideo ? 'VIDEO' : 'IMAGE')); params.append(isVideo ? 'video_url' : 'image_url', url); }
                else params.append('image_url', url);
                const cr = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media`, { method: 'POST', body: params });
                const cd = await cr.json();
                if (cd.id) {
                  const pr = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/media_publish`, { method: 'POST', body: new URLSearchParams({ creation_id: cd.id, access_token: cfg.accessToken }) });
                  const pd = await pr.json();
                  if (pd.id) data.platformId = pd.id;
                  else throw new Error(pd.error?.message);
                } else throw new Error(cd.error?.message);
              }
            }
          }
        } catch (err) {
          this.showToast(`${platform}: ${err.message}`, 'error');
          return;
        }
      }
      await db.collection('socialPosts').add(data);
    }
    this.close();
    Social.render(); // Refresh main list
    this.showToast('✅ ' + (finalStatus === 'published' ? 'Posted!' : 'Scheduled!'));
  },

  close() {
    if (this.hasUnsavedChanges && !confirm('You have unsaved changes. Close anyway?')) return;
    if (this.autoSaveTimer) clearInterval(this.autoSaveTimer);
    document.removeEventListener('keydown', this.handleKeyboard);
    const container = document.getElementById('composerContainer');
    if (container) container.innerHTML = '';
  }
};
