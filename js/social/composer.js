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
  isPublishing: false,
  theme: 'light',
  reelMuted: false,
  reelCoverUrl: null,
  repeatSchedule: 'none',
  timezone: 'Asia/Kolkata',

  // Emoji grid
  emojiGrid: ['😊','😂','❤️','🔥','👍','🎉','😍','🤔','💯','✨','😢','😡','🥳','🤩','😎','💪','🙏','👏','💀','👀','🎂','🍕','🚀','💡','⭐','🌈','🎵','📸','💼','💰','🏆','🎯'],

  // Hashtag suggestions
  hashtagSuggestions: ['#socialmedia','#marketing','#digital','#business','#growth','#branding','#instagram','#facebook','#reels','#story','#carousel','#viral','#trending','#content','#creator','#influencer','#photography','#video','#design','#tech'],

  // Mention suggestions (dummy)
  mentionList: ['@11avatardigitalhub', '@digitalexpert', '@marketingpro', '@contentcreator'],

  render() {
    const container = document.getElementById('composerContainer');
    if (!container) return;

    this.uploadedFiles = [];
    this.hasUnsavedChanges = false;
    this.carouselIndex = 0;
    this.isPublishing = false;
    this.theme = document.body.getAttribute('data-theme') || 'light';
    this.startAutoSave();

    container.innerHTML = `
      <style>
        .composer-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center; }
        .composer-panel { background: var(--bg-primary); border-radius: 16px; width: 96%; max-width: 1300px; max-height: 92vh; overflow-y: auto; padding: 24px; }
        .composer-grid { display: grid; grid-template-columns: 1fr 400px; gap: 24px; }
        .card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
        .card-title { font-weight: 600; margin-bottom: 12px; font-size: 14px; color: var(--text-primary); }
        .btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; font-size: 14px; display: inline-flex; align-items: center; gap: 6px; }
        .btn-primary { background: var(--primary); color: #fff; }
        .btn-outline { background: var(--bg-card); color: var(--primary); border: 1px solid var(--border-color); }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .type-tab { padding: 10px 16px; border-radius: 20px; cursor: pointer; border: 1px solid var(--border-color); background: var(--bg-card); font-size: 13px; font-weight: 500; color: var(--text-primary); }
        .type-tab.active { background: var(--primary); color: #fff; border-color: var(--primary); }
        .drop-zone { border: 2px dashed var(--border-color); border-radius: 12px; padding: 30px; text-align: center; cursor: pointer; background: var(--bg-card); }
        .drop-zone:hover { border-color: var(--primary); background: rgba(24,119,242,0.05); }
        .media-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .media-item { position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 1; background: #f0f0f0; cursor: grab; }
        .media-item img, .media-item video { width: 100%; height: 100%; object-fit: cover; }
        .media-item .remove-btn { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); color: #fff; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 14px; z-index: 2; }
        .media-item .retry-btn { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); background: var(--primary); color: #fff; border: none; border-radius: 20px; padding: 6px 14px; cursor: pointer; font-size: 12px; }
        .media-item .progress-wrap { position: absolute; bottom: 0; left: 0; width: 100%; height: 6px; background: rgba(0,0,0,0.3); }
        .media-item .progress-fill { height: 100%; background: var(--primary); transition: width 0.3s; }
        .media-item .progress-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 11px; font-weight: 600; color: var(--primary); background: rgba(255,255,255,0.9); padding: 2px 8px; border-radius: 4px; }
        .media-item .cover-badge { position: absolute; top: 4px; left: 4px; background: var(--primary); color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 4px; }
        .emoji-grid-popup { position: absolute; bottom: 40px; left: 0; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); display: none; z-index: 10; grid-template-columns: repeat(8, 1fr); gap: 4px; width: 320px; }
        .emoji-grid-popup.show { display: grid; }
        .emoji-grid-popup span { cursor: pointer; font-size: 20px; padding: 4px; text-align: center; border-radius: 4px; }
        .emoji-grid-popup span:hover { background: rgba(0,0,0,0.05); }
        .mention-dropdown, .hashtag-dropdown { position: absolute; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 10; display: none; max-height: 150px; overflow-y: auto; width: 220px; }
        .mention-dropdown.show, .hashtag-dropdown.show { display: block; }
        .mention-dropdown div, .hashtag-dropdown div { padding: 8px 12px; cursor: pointer; font-size: 13px; color: var(--text-primary); }
        .mention-dropdown div:hover, .hashtag-dropdown div:hover { background: rgba(24,119,242,0.08); }
        .toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; border-radius: 8px; color: #fff; font-weight: 500; z-index: 9999; animation: slideUp 0.3s ease; }
        .toast-success { background: var(--success); }
        .toast-error { background: var(--danger); }
        .toast-info { background: var(--primary); }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .theme-toggle { cursor: pointer; font-size: 18px; padding: 4px 8px; border-radius: 20px; border: 1px solid var(--border-color); background: var(--bg-card); }
        @media (max-width: 1024px) { .composer-grid { grid-template-columns: 1fr; } }
      </style>

      <div class="composer-overlay" onclick="SocialComposer.close()">
        <div class="composer-panel" onclick="event.stopPropagation()">
          <div class="d-flex justify-content-between align-items-center mb-3" style="position:sticky;top:0;background:var(--bg-primary);padding-bottom:12px;z-index:5;">
            <h4 style="font-weight:700;margin:0;color:var(--text-primary);">Create Post</h4>
            <div class="d-flex gap-2 align-items-center">
              <span class="theme-toggle" onclick="SocialComposer.toggleTheme()" title="Toggle theme">${this.theme==='light'?'🌙':'☀️'}</span>
              <button class="btn-close" onclick="SocialComposer.close()"></button>
            </div>
          </div>
          <div class="composer-grid">
            <div>
              <div class="card"><div class="card-title">Post to</div>
                <label><input type="checkbox" ${this.activePlatforms.facebook?'checked':''} onchange="SocialComposer.activePlatforms.facebook=this.checked"> <i class="fab fa-facebook text-primary"></i> Facebook</label>
                <label class="mt-1"><input type="checkbox" ${this.activePlatforms.instagram?'checked':''} onchange="SocialComposer.activePlatforms.instagram=this.checked"> <i class="fab fa-instagram text-danger"></i> Instagram</label>
              </div>
              <div class="card"><div class="card-title">Post Type</div>
                <div class="d-flex gap-2">
                  <div class="type-tab ${this.postType==='post'?'active':''}" onclick="SocialComposer.setPostType('post')">📄 Post</div>
                  <div class="type-tab ${this.postType==='story'?'active':''}" onclick="SocialComposer.setPostType('story')">📱 Story</div>
                  <div class="type-tab ${this.postType==='reel'?'active':''}" onclick="SocialComposer.setPostType('reel')">🎬 Reel</div>
                  <div class="type-tab ${this.postType==='carousel'?'active':''}" onclick="SocialComposer.setPostType('carousel')">🖼️ Carousel</div>
                </div>
              </div>
              <div class="card"><div class="card-title">Media</div>
                <div class="drop-zone" id="dropZone" ondragover="event.preventDefault();this.style.borderColor='#1877f2'" ondragleave="this.style.borderColor='var(--border-color)'" ondrop="SocialComposer.handleDrop(event)">
                  <i class="fas fa-cloud-upload-alt fa-3x" style="color:#1877f2;"></i>
                  <p style="font-weight:600;">Upload Media</p>
                  <button class="btn btn-outline btn-sm mt-2" onclick="event.stopPropagation();document.getElementById('composerFileInput').click();">Browse Files</button>
                </div>
                <input type="file" id="composerFileInput" multiple accept="image/*,video/*" style="display:none" onchange="SocialComposer.handleFileSelect(event)">
                <div class="media-grid mt-3" id="composerMediaGrid"><p class="text-muted small">No media yet.</p></div>
                ${this.postType==='reel' ? `
                <div class="mt-2">
                  <label class="form-check form-switch"><input class="form-check-input" type="checkbox" ${this.reelMuted?'checked':''} onchange="SocialComposer.reelMuted=this.checked"> <span class="form-check-label">Mute Audio</span></label>
                </div>` : ''}
              </div>
              <div class="card" style="position:relative;">
                <div class="card-title">Caption</div>
                <textarea id="composerCaption" class="form-control" rows="5" placeholder="Write a caption..." style="border-radius:8px;border:1px solid var(--border-color);background:var(--bg-card);color:var(--text-primary);" oninput="SocialComposer.onCaptionInput()"></textarea>
                <div class="d-flex justify-content-between align-items-center mt-1">
                  <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-light" id="emojiBtn" onclick="SocialComposer.toggleEmojiGrid()">😊</button>
                    <button class="btn btn-sm btn-light" onclick="SocialComposer.insertText('@')">@</button>
                    <button class="btn btn-sm btn-light" onclick="SocialComposer.insertText('#')">#</button>
                  </div>
                  <small class="text-muted" id="charCount">0 chars</small>
                </div>
                <div class="emoji-grid-popup" id="emojiGridPopup">
                  ${this.emojiGrid.map(e => `<span onclick="SocialComposer.insertEmoji('${e}')">${e}</span>`).join('')}
                </div>
                <div class="mention-dropdown" id="mentionDropdown"></div>
                <div class="hashtag-dropdown" id="hashtagDropdown"></div>
              </div>
              <div class="card"><div class="card-title">Schedule</div>
                <div class="row g-2">
                  <div class="col-6"><input type="date" id="scheduleDate" class="form-control form-control-sm" style="border-radius:8px;"></div>
                  <div class="col-6"><input type="time" id="scheduleTime" class="form-control form-control-sm" style="border-radius:8px;"></div>
                  <div class="col-6">
                    <select id="timezone" class="form-select form-select-sm" style="border-radius:8px;" onchange="SocialComposer.timezone=this.value">
                      <option value="Asia/Kolkata">IST (India)</option>
                      <option value="America/New_York">EST (New York)</option>
                      <option value="Europe/London">GMT (London)</option>
                      <option value="Asia/Dubai">GST (Dubai)</option>
                    </select>
                  </div>
                  <div class="col-6">
                    <select id="repeatSchedule" class="form-select form-select-sm" style="border-radius:8px;" onchange="SocialComposer.repeatSchedule=this.value">
                      <option value="none">No Repeat</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-primary flex-grow-1" style="height:48px;" id="publishBtn" onclick="SocialComposer.publish()">🚀 Publish Now</button>
                <button class="btn btn-outline" onclick="SocialComposer.saveDraft()">💾 Draft</button>
              </div>
            </div>
            <div style="position:sticky;top:20px;">
              <div class="card">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div class="card-title" style="margin:0;">Preview</div>
                  <div class="d-flex gap-1">
                    <select class="form-select form-select-sm" style="width:auto;" onchange="SocialComposer.previewPlatform=this.value;SocialComposer.updatePreview();"><option value="facebook">FB</option><option value="instagram">IG</option></select>
                    <select class="form-select form-select-sm" style="width:auto;" onchange="SocialComposer.previewMode=this.value;SocialComposer.updatePreview();"><option value="feed">Feed</option><option value="story">Story</option><option value="reel">Reel</option></select>
                    <button class="btn btn-sm btn-light" onclick="SocialComposer.previewDevice=SocialComposer.previewDevice==='desktop'?'mobile':'desktop';SocialComposer.updatePreview();"><i class="fas fa-${this.previewDevice==='desktop'?'mobile-alt':'desktop'}"></i></button>
                  </div>
                </div>
                <div id="composerPreview" style="max-width:${this.previewDevice==='mobile'?'320px':'100%'};margin:0 auto;"><p class="text-muted text-center py-4">Preview</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Init Sortable for drag reorder
    setTimeout(() => {
      const grid = document.getElementById('composerMediaGrid');
      if (grid && this.uploadedFiles.length > 1 && this.postType === 'carousel') {
        new Sortable(grid, {
          animation: 150,
          onEnd: (evt) => {
            const moved = this.uploadedFiles.splice(evt.oldIndex, 1)[0];
            this.uploadedFiles.splice(evt.newIndex, 0, moved);
            this.refreshMediaGrid();
          }
        });
      }
    }, 300);

    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyboard);
  },

  handleKeyboard(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); this.publish(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); this.saveDraft(); }
  },

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', this.theme);
    this.render();
  },

  toggleEmojiGrid() {
    const popup = document.getElementById('emojiGridPopup');
    if (popup) popup.classList.toggle('show');
  },

  setPostType(type) { this.postType = type; document.querySelectorAll('.type-tab').forEach(t => t.classList.remove('active')); event.target.classList.add('active'); if (type === 'story') this.previewMode = 'story'; else if (type === 'reel') this.previewMode = 'reel'; else this.previewMode = 'feed'; this.render(); },

  onCaptionInput() {
    const c = document.getElementById('composerCaption');
    const cnt = document.getElementById('charCount');
    if (cnt) cnt.innerText = (c?.value?.length || 0) + ' chars';
    this.hasUnsavedChanges = true;
    this.updatePreview();
    // Check for mention or hashtag
    const val = c?.value || '';
    const lastWord = val.split(' ').pop();
    if (lastWord.startsWith('@') && lastWord.length > 1) {
      this.showMentionDropdown(lastWord);
    } else if (lastWord.startsWith('#') && lastWord.length > 1) {
      this.showHashtagDropdown(lastWord);
    } else {
      document.getElementById('mentionDropdown')?.classList.remove('show');
      document.getElementById('hashtagDropdown')?.classList.remove('show');
    }
  },

  showMentionDropdown(query) {
    const dd = document.getElementById('mentionDropdown');
    if (!dd) return;
    const filtered = this.mentionList.filter(m => m.toLowerCase().includes(query.toLowerCase()));
    if (filtered.length === 0) { dd.classList.remove('show'); return; }
    dd.innerHTML = filtered.map(m => `<div onclick="SocialComposer.insertMention('${m}')">${m}</div>`).join('');
    dd.classList.add('show');
  },

  showHashtagDropdown(query) {
    const dd = document.getElementById('hashtagDropdown');
    if (!dd) return;
    const filtered = this.hashtagSuggestions.filter(h => h.toLowerCase().includes(query.toLowerCase()));
    if (filtered.length === 0) { dd.classList.remove('show'); return; }
    dd.innerHTML = filtered.map(h => `<div onclick="SocialComposer.insertHashtag('${h}')">${h}</div>`).join('');
    dd.classList.add('show');
  },

  insertMention(m) {
    const ta = document.getElementById('composerCaption');
    if (!ta) return;
    const val = ta.value;
    const lastSpace = val.lastIndexOf(' ');
    ta.value = val.substring(0, lastSpace + 1) + m + ' ';
    document.getElementById('mentionDropdown')?.classList.remove('show');
    this.onCaptionInput();
  },

  insertHashtag(h) {
    const ta = document.getElementById('composerCaption');
    if (!ta) return;
    const val = ta.value;
    const lastSpace = val.lastIndexOf(' ');
    ta.value = val.substring(0, lastSpace + 1) + h + ' ';
    document.getElementById('hashtagDropdown')?.classList.remove('show');
    this.onCaptionInput();
  },

  insertText(t) { const ta = document.getElementById('composerCaption'); if (ta) { ta.value += t; this.onCaptionInput(); } },
  insertEmoji(e) { const ta = document.getElementById('composerCaption'); if (ta) { ta.value += e; this.onCaptionInput(); document.getElementById('emojiGridPopup')?.classList.remove('show'); } },

  async handleDrop(e) { e.preventDefault(); await this.uploadFiles(e.dataTransfer.files); },
  async handleFileSelect(e) { if (e.target.files.length > 0) { await this.uploadFiles(e.target.files); e.target.value = ''; } },

  async uploadFiles(files, retryId = null) {
    const max = this.postType === 'carousel' ? 10 : 1;
    for (const file of files) {
      if (this.uploadedFiles.length >= max) { this.showToast('Max ' + max + ' files', 'error'); break; }
      const tempId = retryId || ('t' + Date.now());
      if (!retryId) {
        this.uploadedFiles.push({ id: tempId, url: null, progress: 0, name: file.name, failed: false });
      } else {
        const idx = this.uploadedFiles.findIndex(x => x.id === retryId);
        if (idx >= 0) { this.uploadedFiles[idx].progress = 0; this.uploadedFiles[idx].failed = false; }
      }
      this.refreshMediaGrid();
      const ref = firebase.storage().ref('social/' + Date.now() + '_' + file.name);
      const task = ref.put(file);
      task.on('state_changed', snap => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        const idx = this.uploadedFiles.findIndex(x => x.id === tempId);
        if (idx >= 0) this.uploadedFiles[idx].progress = pct;
        this.refreshMediaGrid();
      }, err => {
        const idx = this.uploadedFiles.findIndex(x => x.id === tempId);
        if (idx >= 0) this.uploadedFiles[idx].failed = true;
        this.refreshMediaGrid();
      }, async () => {
        const url = await task.snapshot.ref.getDownloadURL();
        const idx = this.uploadedFiles.findIndex(x => x.id === tempId);
        if (idx >= 0) { this.uploadedFiles[idx].url = url; this.uploadedFiles[idx].progress = 100; this.uploadedFiles[idx].failed = false; }
        this.refreshMediaGrid(); this.hasUnsavedChanges = true;
      });
    }
  },

  retryUpload(index) {
    const file = this.uploadedFiles[index];
    if (!file || !file.name) return;
    // Re-trigger upload with same file name? Need actual file object. Show message.
    this.showToast('Please re-select the file to retry', 'info');
    document.getElementById('composerFileInput').click();
  },

  setCoverImage(index) {
    this.reelCoverUrl = this.uploadedFiles[index]?.url;
    this.refreshMediaGrid();
  },

  refreshMediaGrid() {
    const g = document.getElementById('composerMediaGrid'); if (!g) return;
    if (this.uploadedFiles.length === 0) { g.innerHTML = '<p class="text-muted small">No media yet.</p>'; return; }
    g.innerHTML = this.uploadedFiles.map((f, i) => {
      let inner = '';
      if (f.url) {
        inner = f.url.match(/\.(mp4|mov|webm)/i) ? `<video src="${f.url}" controls></video>` : `<img src="${f.url}">`;
      } else if (f.failed) {
        inner = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;font-size:11px;color:#666;">❌ Failed<br><button class="retry-btn" onclick="SocialComposer.retryUpload(${i})">Retry</button></div>`;
      } else {
        inner = `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:11px;color:#666;">${f.name}</div>`;
      }
      let progressBar = '';
      if (f.progress < 100 && !f.failed) {
        progressBar = `<div class="progress-wrap"><div class="progress-fill" style="width:${f.progress}%;"></div></div><div class="progress-text">${f.progress}%</div>`;
      }
      let coverBadge = '';
      if (this.postType === 'reel' && f.url === this.reelCoverUrl) {
        coverBadge = '<div class="cover-badge">Cover</div>';
      }
      return `<div class="media-item">${inner}${progressBar}${coverBadge}<button class="remove-btn" onclick="SocialComposer.removeMedia(${i})">×</button>${this.postType==='reel' && f.url && !f.url.match(/\.(mp4|mov)/i) ? `<button class="btn btn-sm btn-light" style="position:absolute;bottom:4px;left:4px;font-size:10px;" onclick="SocialComposer.setCoverImage(${i})">Set Cover</button>` : ''}</div>`;
    }).join('');
    this.updatePreview();
  },

  removeMedia(i) { this.uploadedFiles.splice(i, 1); this.refreshMediaGrid(); this.hasUnsavedChanges = true; },
  carouselPrev() { if (this.uploadedFiles.length > 0) { this.carouselIndex = (this.carouselIndex - 1 + this.uploadedFiles.length) % this.uploadedFiles.length; this.updatePreview(); } },
  carouselNext() { if (this.uploadedFiles.length > 0) { this.carouselIndex = (this.carouselIndex + 1) % this.uploadedFiles.length; this.updatePreview(); } },
  carouselGoTo(i) { this.carouselIndex = i; this.updatePreview(); },

  getPreviewHTML() {
    const caption = document.getElementById?.('composerCaption')?.value || '';
    const media = this.uploadedFiles.filter(f => f.url).map(f => f.url);
    if (!caption && media.length === 0) return '<p class="text-muted text-center py-4">Preview</p>';
    if (this.previewMode === 'story') return `<div class="preview-story">${media[0] ? (media[0].match(/\.(mp4|mov)/i) ? `<video src="${media[0]}" autoplay muted loop></video>` : `<img src="${media[0]}">`) : ''}<div style="position:absolute;top:12px;left:12px;font-weight:600;">11 Avatar Digital Hub</div><div style="position:absolute;bottom:12px;left:12px;right:12px;background:rgba(0,0,0,0.5);padding:8px;border-radius:8px;">${caption}</div></div>`;
    if (this.previewMode === 'reel') return `<div class="preview-reel">${media[0] && media[0].match(/\.(mp4|mov)/i) ? `<video src="${media[0]}" controls ${this.reelMuted?'muted':''}></video>` : '<p>Upload video</p>'}</div>`;
    if (this.postType === 'carousel' && media.length > 0) {
      let h = `<div class="preview-feed"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="width:32px;height:32px;border-radius:50%;background:#1877f2;color:#fff;display:flex;align-items:center;justify-content:center;">11</div><div><strong>11 Avatar Digital Hub</strong><br><small style="color:#65676b;">Just now</small></div></div><div class="carousel-slider"><button class="nav-btn" style="left:8px;" onclick="SocialComposer.carouselPrev()">‹</button><button class="nav-btn" style="right:8px;" onclick="SocialComposer.carouselNext()">›</button><div class="slides" style="transform:translateX(-${this.carouselIndex * 100}%);">`;
      media.forEach(m => h += `<div class="slide">${m.match(/\.(mp4|mov)/i) ? `<video src="${m}" controls style="width:100%;height:300px;object-fit:contain;"></video>` : `<img src="${m}" style="width:100%;height:300px;object-fit:contain;">`}</div>`);
      h += `</div><div class="dots">${media.map((_, i) => `<span class="dot ${i === this.carouselIndex ? 'active' : ''}" onclick="SocialComposer.carouselGoTo(${i})"></span>`).join('')}</div></div><p style="margin-top:8px;">${caption}</p></div>`;
      return h;
    }
    let h = `<div class="preview-feed"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="width:32px;height:32px;border-radius:50%;background:#1877f2;color:#fff;display:flex;align-items:center;justify-content:center;">11</div><div><strong>11 Avatar Digital Hub</strong><br><small style="color:#65676b;">Just now</small></div></div>`;
    media.forEach(m => h += m.match(/\.(mp4|mov)/i) ? `<video src="${m}" controls style="width:100%;border-radius:8px;margin-bottom:4px;max-height:300px;"></video>` : `<img src="${m}" style="width:100%;border-radius:8px;margin-bottom:4px;max-height:300px;object-fit:cover;">`);
    h += `<p style="margin-top:8px;">${caption}</p></div>`;
    return h;
  },

  updatePreview() { const p = document.getElementById('composerPreview'); if (p) p.innerHTML = this.getPreviewHTML(); },
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
    if (this.isPublishing) return;
    this.isPublishing = true;
    const btn = document.getElementById('publishBtn');
    if (btn) { btn.disabled = true; btn.innerText = '⏳ Publishing...'; }
    this.close();
    this.showToast('🚀 Publishing in background...', 'info');

    const msg = document.getElementById('composerCaption')?.value || '';
    const scheduleDate = document.getElementById('scheduleDate')?.value;
    const scheduleTime = document.getElementById('scheduleTime')?.value;
    const scheduledAt = (scheduleDate && scheduleTime) ? new Date(scheduleDate + 'T' + scheduleTime).toISOString() : null;
    const finalStatus = scheduledAt ? 'scheduled' : 'published';
    const media = this.uploadedFiles.filter(f => f.url).map(f => f.url);
    const postType = this.postType;

    if (!this.activePlatforms.facebook && !this.activePlatforms.instagram) { this.showToast('Select a platform', 'error'); this.isPublishing = false; return; }

    let done = 0;
    for (const platform of ['facebook', 'instagram']) {
      if (!this.activePlatforms[platform]) continue;
      try {
        const cfg = (await db
