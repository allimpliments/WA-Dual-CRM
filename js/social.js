const Social = {
  currentTab: 'published',
  uploadedFiles: [],
  activePlatforms: { facebook: true, instagram: true },
  activeEditorTab: 'facebook',
  previewDevice: 'desktop',

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading social...</p>';

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
        * { box-sizing: border-box; }
        .meta-page { max-width: 1400px; margin: 0 auto; }
        .meta-composer-layout { display: grid; grid-template-columns: 1fr 380px; gap: 24px; align-items: start; }
        .meta-card { background: #fff; border: 1px solid #dadde1; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); margin-bottom: 20px; }
        .meta-card-title { font-size: 16px; font-weight: 600; color: #1c1e21; margin: 0 0 16px 0; }
        .meta-helper { font-size: 12px; color: #65676b; margin-top: 4px; }
        .meta-btn { height: 36px; padding: 0 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 6px; }
        .meta-btn-primary { background: #1877f2; color: #fff; }
        .meta-btn-outline { background: #fff; color: #1877f2; border: 1px solid #dadde1; }
        .meta-btn-outline:hover { background: #f5f6f7; }
        .meta-preview-panel { position: sticky; top: 20px; }
        .meta-preview-box { background: #f0f2f5; border-radius: 8px; padding: 16px; min-height: 300px; }
        .drop-zone { border: 2px dashed #dadde1; border-radius: 12px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.2s; background: #fafbfc; }
        .drop-zone:hover, .drop-zone.drag-over { border-color: #1877f2; background: #e7f3ff; }
        .tab-bar { display: flex; border-bottom: 2px solid #dadde1; margin-bottom: 12px; }
        .tab-item { padding: 8px 16px; cursor: pointer; font-weight: 500; font-size: 14px; color: #65676b; border-bottom: 2px solid transparent; margin-bottom: -2px; }
        .tab-item.active { color: #1877f2; border-bottom-color: #1877f2; }
        .device-toggle { display: flex; gap: 8px; }
        .device-btn { padding: 6px 14px; border-radius: 20px; font-size: 13px; cursor: pointer; border: 1px solid #dadde1; background: #fff; }
        .device-btn.active { background: #e7f3ff; border-color: #1877f2; color: #1877f2; }
        @media (max-width: 1024px) { .meta-composer-layout { grid-template-columns: 1fr; } .meta-preview-panel { position: static; } }
      </style>

      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 style="font-weight:600;color:#1c1e21;margin:0;"><i class="fas fa-calendar-alt me-2"></i>Content Calendar</h5>
        <button class="meta-btn meta-btn-primary" onclick="Social.openComposer()"><i class="fas fa-plus me-1"></i> Create Post</button>
      </div>

      <div class="d-flex gap-2 mb-3">
        <button class="btn btn-sm btn-${this.currentTab==='published'?'primary':'outline-primary'} rounded-pill" onclick="Social.switchTab('published')">Published</button>
        <button class="btn btn-sm btn-${this.currentTab==='scheduled'?'primary':'outline-primary'} rounded-pill" onclick="Social.switchTab('scheduled')">Scheduled</button>
        <button class="btn btn-sm btn-${this.currentTab==='drafts'?'primary':'outline-primary'} rounded-pill" onclick="Social.switchTab('drafts')">Drafts</button>
      </div>

      <div id="postsList">
        ${posts.length === 0 ? '<p class="text-muted text-center py-4">No posts.</p>' : posts.map(p => `
          <div class="meta-card" style="padding:16px;margin-bottom:12px;">
            <div class="d-flex justify-content-between">
              <span class="badge bg-${p.platform==='facebook'?'primary':'danger'}">${p.platform}</span>
              <small style="color:#65676b;">${p.createdAt?.toDate().toLocaleString()}</small>
            </div>
            <p style="margin:8px 0;">${p.message || '(no caption)'}</p>
            <div class="mt-2">
              ${p.status==='draft'?`<button class="btn btn-sm btn-outline-primary" onclick="Social.publishDraft('${p.id}')">Publish</button>`:''}
              <button class="btn btn-sm btn-outline-danger" onclick="Social.deletePost('${p.id}')"><i class="fas fa-trash"></i></button>
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
        <div class="meta-page" style="background:#f0f2f5;border-radius:16px;padding:24px;max-height:90vh;overflow-y:auto;width:95%;" onclick="event.stopPropagation()">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 style="font-size:20px;font-weight:600;color:#1c1e21;margin:0;">Create Post</h4>
            <button class="btn-close" onclick="Social.closeComposer()"></button>
          </div>
          
          <div class="meta-composer-layout">
            <div>
              <!-- 1. Account Selection -->
              <div class="meta-card">
                <div class="meta-card-title">Post to</div>
                <div class="d-flex gap-3">
                  <div style="flex:1;border:2px solid ${this.activePlatforms.facebook?'#1877f2':'#dadde1'};border-radius:12px;padding:12px;cursor:pointer;background:${this.activePlatforms.facebook?'#e7f3ff':'#fff'};" onclick="Social.togglePlatform('facebook')">
                    <div class="form-check"><input class="form-check-input" type="checkbox" ${this.activePlatforms.facebook?'checked':''}> <label class="form-check-label"><i class="fab fa-facebook text-primary me-1"></i> Facebook</label></div>
                    <small style="color:#65676b;">11 Avatar Digital Hub</small>
                  </div>
                  <div style="flex:1;border:2px solid ${this.activePlatforms.instagram?'#1877f2':'#dadde1'};border-radius:12px;padding:12px;cursor:pointer;background:${this.activePlatforms.instagram?'#e7f3ff':'#fff'};" onclick="Social.togglePlatform('instagram')">
                    <div class="form-check"><input class="form-check-input" type="checkbox" ${this.activePlatforms.instagram?'checked':''}> <label class="form-check-label"><i class="fab fa-instagram text-danger me-1"></i> Instagram</label></div>
                    <small style="color:#65676b;">11avatardigitalhub</small>
                  </div>
                </div>
              </div>

              <!-- 2. Media Upload with Drag & Drop -->
              <div class="meta-card">
                <div class="meta-card-title">Media</div>
                <p class="meta-helper" style="margin-top:0;">Share photos or a video. Instagram posts can't exceed 10 photos.</p>
                <div class="drop-zone" id="dropZone" ondragover="event.preventDefault();this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="Social.handleDrop(event)">
                  <i class="fas fa-cloud-upload-alt fa-2x" style="color:#1877f2;margin-bottom:8px;"></i>
                  <p style="font-weight:500;">Upload media</p>
                  <p class="meta-helper">Add photos or video by dragging and dropping.</p>
                  <div class="d-flex gap-2 justify-content-center mt-2">
                    <button class="meta-btn meta-btn-outline" onclick="document.getElementById('composerFileInput').click()"><i class="fas fa-image me-1"></i> Add Photo</button>
                    <button class="meta-btn meta-btn-outline" onclick="document.getElementById('composerFileInput').click()"><i class="fas fa-video me-1"></i> Add Video</button>
                  </div>
                </div>
                <input type="file" id="composerFileInput" multiple accept="image/*,video/*" style="display:none" onchange="Social.handleComposerFiles(event)">
                <div id="composerMediaGrid" class="d-flex gap-2 mt-3 flex-wrap"></div>
              </div>

              <!-- 3. Post Details with Tabs -->
              <div class="meta-card">
                <div class="d-flex justify-content-between align-items-center">
                  <div class="meta-card-title" style="margin:0;">Post Details</div>
                  <div class="form-check form-switch" style="margin:0;">
                    <input class="form-check-input" type="checkbox" id="customizeToggle" onchange="Social.toggleCustomize()">
                    <label class="form-check-label" for="customizeToggle" style="font-size:13px;">Customise post for Facebook and Instagram</label>
                  </div>
                </div>
                <div id="editorTabs" class="tab-bar mt-3" style="display:none;">
                  <div class="tab-item active" onclick="Social.switchEditorTab('facebook')">Facebook</div>
                  <div class="tab-item" onclick="Social.switchEditorTab('instagram')">Instagram</div>
                </div>
                <textarea id="composerCaption" class="form-control" style="min-height:180px;border-radius:8px;border:1px solid #dadde1;padding:12px;font-size:14px;resize:vertical;" placeholder="What's on your mind?" oninput="Social.updatePreview()"></textarea>
                <div class="d-flex gap-1 mt-2">
                  <button class="btn btn-sm btn-light">😊</button>
                  <button class="btn btn-sm btn-light">📍</button>
                  <button class="btn btn-sm btn-light">@</button>
                  <button class="btn btn-sm btn-light">#</button>
                </div>
              </div>

              <!-- 4. Schedule -->
              <div class="meta-card">
                <div class="d-flex justify-content-between align-items-center">
                  <div class="meta-card-title" style="margin:0;">Schedule</div>
                  <div class="form-check form-switch" style="margin:0;">
                    <input class="form-check-input" type="checkbox" id="scheduleToggle" onchange="Social.toggleSchedule()">
                    <label class="form-check-label" for="scheduleToggle" style="font-size:13px;">Set Date & Time</label>
                  </div>
                </div>
                <div id="scheduleFields" style="display:none;margin-top:12px;">
                  <div class="row g-2">
                    <div class="col-6"><label class="meta-helper">Date</label><input type="date" class="form-control form-control-sm" style="border-radius:8px;"></div>
                    <div class="col-6"><label class="meta-helper">Time</label><input type="time" class="form-control form-control-sm" style="border-radius:8px;"></div>
                  </div>
                </div>
              </div>

              <!-- 5. Story Sharing -->
              <div class="meta-card">
                <div class="meta-card-title">Share To</div>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="storyToggle" onchange="Social.showStoryModal()">
                  <label class="form-check-label" for="storyToggle">Facebook Story · Public</label>
                </div>
              </div>

              <!-- 6. Privacy -->
              <div class="meta-card">
                <div class="meta-card-title">Privacy Settings</div>
                <p class="meta-helper" style="margin-top:0;">Adjust who can see your post.</p>
                <div class="form-check"><input class="form-check-input" type="radio" name="privacy" checked> <label class="form-check-label">Public</label></div>
                <div class="form-check"><input class="form-check-input" type="radio" name="privacy"> <label class="form-check-label">Restricted</label></div>
              </div>

              <button class="meta-btn meta-btn-primary w-100" style="height:44px;font-size:16px;" onclick="Social.publishFromComposer()">Publish</button>
            </div>

            <!-- 7. Preview Panel -->
            <div class="meta-preview-panel">
              <div class="meta-card">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div class="meta-card-title" style="margin:0;">Preview</div>
                  <div class="device-toggle">
                    <button class="device-btn ${this.previewDevice==='desktop'?'active':''}" onclick="Social.setPreviewDevice('desktop')">Desktop</button>
                    <button class="device-btn ${this.previewDevice==='mobile'?'active':''}" onclick="Social.setPreviewDevice('mobile')">Mobile</button>
                  </div>
                </div>
                <div class="meta-preview-box" id="composerPreview" style="${this.previewDevice==='mobile'?'max-width:375px;margin:0 auto;':''}">
                  ${this.renderFacebookPreview()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Story Confirmation Modal -->
      <div id="storyModal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:3000;display:none;align-items:center;justify-content:center;" onclick="Social.hideStoryModal()">
        <div class="meta-card" style="max-width:440px;width:90%;" onclick="event.stopPropagation()">
          <h5 style="margin:0 0 16px 0;">Share to Facebook Story</h5>
          <div class="form-check mb-2"><input class="form-check-input" type="radio" name="storyOption" checked> <label class="form-check-label">Share this story</label></div>
          <div class="form-check mb-3"><input class="form-check-input" type="radio" name="storyOption"> <label class="form-check-label">Always share stories</label></div>
          <div class="d-flex gap-2 justify-content-end">
            <button class="meta-btn meta-btn-outline" onclick="Social.hideStoryModal()">Cancel</button>
            <button class="meta-btn meta-btn-primary" onclick="Social.confirmStory()">Confirm</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('storyModal').style.display = 'none';
  },

  renderFacebookPreview() {
    const caption = document.getElementById?.('composerCaption')?.value || '';
    return `
      <div style="background:#fff;border-radius:8px;padding:12px;width:100%;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <div style="width:36px;height:36px;border-radius:50%;background:#1877f2;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;">A</div>
          <div><strong style="font-size:14px;">11 Avatar Digital Hub</strong><br><small style="color:#65676b;">Just now · 🌍</small></div>
        </div>
        <p style="font-size:14px;margin:8px 0;">${caption || 'Your caption...'}</p>
        ${this.uploadedFiles.map(url => `<img src="${url}" style="width:100%;border-radius:8px;margin-bottom:4px;">`).join('')}
        <div style="display:flex;justify-content:space-between;color:#65676b;font-size:13px;border-top:1px solid #dadde1;padding-top:8px;">
          <span>👍 Like</span><span>💬 Comment</span><span>↗ Share</span>
        </div>
      </div>
    `;
  },

  setPreviewDevice(device) {
    this.previewDevice = device;
    this.openComposer();
  },

  closeComposer() { document.getElementById('composerContainer').innerHTML = ''; },
  togglePlatform(plat) { this.activePlatforms[plat] = !this.activePlatforms[plat]; this.openComposer(); },
  toggleSchedule() { const f = document.getElementById('scheduleFields'); if (f) f.style.display = f.style.display === 'none' ? 'block' : 'none'; },
  toggleCustomize() { const t = document.getElementById('editorTabs'); if (t) t.style.display = t.style.display === 'none' ? 'flex' : 'none'; },
  switchEditorTab(tab) { this.activeEditorTab = tab; this.openComposer(); },
  showStoryModal() { const m = document.getElementById('storyModal'); if (m) m.style.display = 'flex'; },
  hideStoryModal() { const m = document.getElementById('storyModal'); if (m) m.style.display = 'none'; },
  confirmStory() { this.hideStoryModal(); alert('✅ Story sharing enabled!'); },
  updatePreview() { const preview = document.getElementById('composerPreview'); if (preview) preview.innerHTML = this.renderFacebookPreview(); },

  async handleDrop(event) {
    event.preventDefault();
    event.target.classList.remove('drag-over');
    const files = event.dataTransfer.files;
    await this.uploadFiles(files);
  },

  async handleComposerFiles(event) {
    await this.uploadFiles(event.target.files);
  },

  async uploadFiles(files) {
    for (const file of files) {
      if (this.uploadedFiles.length >= 10) { alert('Max 10 files'); break; }
      const storageRef = firebase.storage().ref('social/' + Date.now() + '_' + file.name);
      await storageRef.put(file);
      const url = await storageRef.ref.getDownloadURL();
      this.uploadedFiles.push(url);
    }
    this.refreshComposerMedia();
  },

  refreshComposerMedia() {
    const grid = document.getElementById('composerMediaGrid');
    if (!grid) return;
    grid.innerHTML = this.uploadedFiles.map((url, i) => `
      <div style="position:relative;width:80px;height:80px;border-radius:8px;overflow:hidden;">
        <img src="${url}" style="width:100%;height:100%;object-fit:cover;">
        <button style="position:absolute;top:2px;right:2px;background:#fa3e3e;color:#fff;border:none;border-radius:50%;width:20px;height:20px;font-size:12px;cursor:pointer;" onclick="Social.removeComposerMedia(${i})">×</button>
      </div>
    `).join('');
    this.updatePreview();
  },

  removeComposerMedia(index) {
    this.uploadedFiles.splice(index, 1);
    this.refreshComposerMedia();
  },

  async publishFromComposer() {
    const message = document.getElementById('composerCaption')?.value || '';
    await db.collection('socialPosts').add({
      platform: 'facebook', message, media: this.uploadedFiles,
      postType: this.uploadedFiles.length > 0 ? 'photo' : 'text',
      status: 'published',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    this.closeComposer();
    this.uploadedFiles = [];
    this.render();
    alert('✅ Post published!');
  },

  async publishDraft(id) { await db.collection('socialPosts').doc(id).update({ status: 'published' }); this.render(); },
  async deletePost(id) { if (!confirm('Delete?')) return; await db.collection('socialPosts').doc(id).delete(); this.render(); }
};
