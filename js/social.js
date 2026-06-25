const Social = {
  currentTab: 'published',
  uploadedFiles: [],
  activePlatforms: { facebook: true, instagram: true },
  activeEditorTab: 'facebook',
  previewDevice: 'desktop',
  customizeEnabled: false,
  storyEnabled: false,

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
        * { box-sizing: border-box; }
        .meta-page { max-width: 1400px; margin: 0 auto; }
        .meta-composer-layout { display: grid; grid-template-columns: 1fr 380px; gap: 24px; align-items: start; }
        .meta-card { background: #fff; border: 1px solid #dadde1; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); margin-bottom: 20px; }
        .meta-card-title { font-size: 16px; font-weight: 600; color: #1c1e21; margin: 0 0 16px 0; }
        .meta-helper { font-size: 12px; color: #65676b; margin-top: 4px; }
        .meta-btn { height: 36px; padding: 0 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 6px; }
        .meta-btn-primary { background: #1877f2; color: #fff; }
        .meta-btn-primary:hover { background: #166fe5; }
        .meta-btn-outline { background: #fff; color: #1877f2; border: 1px solid #dadde1; }
        .meta-btn-outline:hover { background: #f5f6f7; }
        .meta-preview-panel { position: sticky; top: 20px; }
        .meta-preview-box { background: #f0f2f5; border-radius: 8px; padding: 16px; min-height: 300px; }
        .drop-zone { border: 2px dashed #dadde1; border-radius: 12px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.2s; background: #fafbfc; }
        .drop-zone:hover { border-color: #1877f2; background: #e7f3ff; }
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
    this.customizeEnabled = false;
    this.storyEnabled = false;
    document.getElementById('composerContainer').innerHTML = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:center;justify-content:center;" onclick="Social.closeComposer()">
        <div class="meta-page" style="background:#f0f2f5;border-radius:16px;padding:24px;max-height:90vh;overflow-y:auto;width:95%;" onclick="event.stopPropagation()">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 style="font-size:20px;font-weight:600;color:#1c1e21;margin:0;">Create Post</h4>
            <button class="btn-close" onclick="Social.closeComposer()"></button>
          </div>
          
          <div class="meta-composer-layout">
            <div>
              <!-- Account Selection -->
              <div class="meta-card">
                <div class="meta-card-title">Post to</div>
                <div class="d-flex gap-3">
                  <div style="flex:1;border:2px solid ${this.activePlatforms.facebook?'#1877f2':'#dadde1'};border-radius:12px;padding:12px;cursor:pointer;background:${this.activePlatforms.facebook?'#e7f3ff':'#fff'};" onclick="Social.togglePlatform('facebook')">
                    <div class="form-check"><input class="form-check-input" type="checkbox" ${this.activePlatforms.facebook?'checked':''} onclick="event.stopPropagation();"> <label class="form-check-label"><i class="fab fa-facebook text-primary me-1"></i> Facebook</label></div>
                    <small style="color:#65676b;">11 Avatar Digital Hub</small>
                  </div>
                  <div style="flex:1;border:2px solid ${this.activePlatforms.instagram?'#1877f2':'#dadde1'};border-radius:12px;padding:12px;cursor:pointer;background:${this.activePlatforms.instagram?'#e7f3ff':'#fff'};" onclick="Social.togglePlatform('instagram')">
                    <div class="form-check"><input class="form-check-input" type="checkbox" ${this.activePlatforms.instagram?'checked':''} onclick="event.stopPropagation();"> <label class="form-check-label"><i class="fab fa-instagram text-danger me-1"></i> Instagram</label></div>
                    <small style="color:#65676b;">11avatardigitalhub</small>
                  </div>
                </div>
              </div>

              <!-- Media Upload -->
              <div class="meta-card">
                <div class="meta-card-title">Media</div>
                <p class="meta-helper" style="margin-top:0;">Share photos or a video. Instagram posts can't exceed 10 photos.</p>
                <div class="drop-zone" id="dropZone" ondragover="event.preventDefault();this.style.borderColor='#1877f2';this.style.background='#e7f3ff';" ondragleave="this.style.borderColor='#dadde1';this.style.background='#fafbfc';" ondrop="Social.handleDrop(event)">
                  <i class="fas fa-cloud-upload-alt fa-2x" style="color:#1877f2;margin-bottom:8px;"></i>
                  <p style="font-weight:500;">Upload media</p>
                  <p class="meta-helper">Add photos or video by dragging and dropping.</p>
                  <div class="d-flex gap-2 justify-content-center mt-2">
                    <button class="meta-btn meta-btn-outline" onclick="event.stopPropagation();document.getElementById('composerFileInput').click();"><i class="fas fa-image me-1"></i> Add Photo</button>
                    <button class="meta-btn meta-btn-outline" onclick="event.stopPropagation();document.getElementById('composerFileInput').click();"><i class="fas fa-video me-1"></i> Add Video</button>
                  </div>
                </div>
                <input type="file" id="composerFileInput" multiple accept="image/*,video/*" style="display:none" onchange="Social.handleComposerFiles(event)">
                <div id="uploadProgress" style="font-size:12px;color:#1877f2;margin-top:8px;"></div>
                <div id="composerMediaGrid" class="d-flex gap-2 mt-3 flex-wrap"></div>
              </div>

              <!-- Post Details -->
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
                  <button class="btn btn-sm btn-light" onclick="Social.insertEmoji()">😊</button>
                  <button class="btn btn-sm btn-light" onclick="Social.insertText('📍 ')">📍</button>
                  <button class="btn btn-sm btn-light" onclick="Social.insertText('@')">@</button>
                  <button class="btn btn-sm btn-light" onclick="Social.insertText('#')">#</button>
                </div>
              </div>

              <!-- Schedule -->
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
                    <div class="col-6"><label class="meta-helper">Date</label><input type="date" id="scheduleDate" class="form-control form-control-sm" style="border-radius:8px;"></div>
                    <div class="col-6"><label class="meta-helper">Time</label><input type="time" id="scheduleTime" class="form-control form-control-sm" style="border-radius:8px;"></div>
                  </div>
                </div>
              </div>

              <!-- Story Sharing -->
              <div class="meta-card">
                <div class="meta-card-title">Share To</div>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="storyToggle" onchange="Social.toggleStory()">
                  <label class="form-check-label" for="storyToggle">Facebook Story · Public</label>
                </div>
              </div>

              <!-- Privacy -->
              <div class="meta-card">
                <div class="meta-card-title">Privacy Settings</div>
                <p class="meta-helper" style="margin-top:0;">Adjust who can see your post.</p>
                <div class="form-check"><input class="form-check-input" type="radio" name="privacy" value="public" checked> <label class="form-check-label">Public</label></div>
                <div class="form-check"><input class="form-check-input" type="radio" name="privacy" value="restricted"> <label class="form-check-label">Restricted</label></div>
              </div>

              <button class="meta-btn meta-btn-primary w-100" style="height:44px;font-size:16px;" onclick="Social.publishFromComposer()">Publish</button>
            </div>

            <!-- Preview -->
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
                  ${this.getFacebookPreviewHTML()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  getFacebookPreviewHTML() {
    return `
      <div style="background:#fff;border-radius:8px;padding:12px;width:100%;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <div style="width:36px;height:36px;border-radius:50%;background:#1877f2;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:14px;">A</div>
          <div><strong style="font-size:14px;">11 Avatar Digital Hub</strong><br><small style="color:#65676b;">Just now · 🌍</small></div>
        </div>
        <p style="font-size:14px;margin:8px 0;">Start writing...</p>
        <div style="display:flex;justify-content:space-between;color:#65676b;font-size:13px;border-top:1px solid #dadde1;padding-top:8px;">
          <span>👍 Like</span><span>💬 Comment</span><span>↗ Share</span>
        </div>
      </div>
    `;
  },

  updatePreview() {
    const preview = document.getElementById('composerPreview');
    if (!preview) return;
    const caption = document.getElementById('composerCaption')?.value || 'Start writing...';
    let mediaHTML = this.uploadedFiles.map(url => 
      url.includes('.mp4') || url.includes('.mov') 
        ? `<video src="${url}" controls style="width:100%;border-radius:8px;margin-bottom:4px;"></video>`
        : `<img src="${url}" style="width:100%;border-radius:8px;margin-bottom:4px;">`
    ).join('');
    preview.innerHTML = `
      <div style="background:#fff;border-radius:8px;padding:12px;width:100%;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <div style="width:36px;height:36px;border-radius:50%;background:#1877f2;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:14px;">A</div>
          <div><strong style="font-size:14px;">11 Avatar Digital Hub</strong><br><small style="color:#65676b;">Just now · 🌍</small></div>
        </div>
        <p style="font-size:14px;margin:8px 0;">${caption}</p>
        ${mediaHTML}
        <div style="display:flex;justify-content:space-between;color:#65676b;font-size:13px;border-top:1px solid #dadde1;padding-top:8px;">
          <span>👍 Like</span><span>💬 Comment</span><span>↗ Share</span>
        </div>
      </div>
    `;
  },

  setPreviewDevice(device) {
    this.previewDevice = device;
    const preview = document.getElementById('composerPreview');
    if (preview) {
      preview.parentElement.style.maxWidth = device === 'mobile' ? '375px' : '100%';
      preview.parentElement.style.margin = device === 'mobile' ? '0 auto' : '0';
    }
    document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.device-btn').forEach(b => {
      if (b.textContent.toLowerCase().includes(device)) b.classList.add('active');
    });
  },

  toggleCustomize() {
    this.customizeEnabled = !this.customizeEnabled;
    const tabs = document.getElementById('editorTabs');
    if (tabs) tabs.style.display = this.customizeEnabled ? 'flex' : 'none';
  },

  toggleSchedule() {
    const fields = document.getElementById('scheduleFields');
    if (fields) fields.style.display = fields.style.display === 'none' ? 'block' : 'none';
  },

  toggleStory() {
    this.storyEnabled = !this.storyEnabled;
    if (this.storyEnabled) {
      alert('✅ Story sharing enabled! Your post will also appear in Facebook Story.');
    }
  },

  switchEditorTab(tab) {
    this.activeEditorTab = tab;
    document.querySelectorAll('#editorTabs .tab-item').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#editorTabs .tab-item').forEach(t => {
      if (t.textContent.toLowerCase().includes(tab)) t.classList.add('active');
    });
  },

  insertEmoji() {
    const ta = document.getElementById('composerCaption');
    if (ta) { ta.value += ' 😊'; this.updatePreview(); }
  },

  insertText(text) {
    const ta = document.getElementById('composerCaption');
    if (ta) { ta.value += text; this.updatePreview(); }
  },

  togglePlatform(plat) {
    this.activePlatforms[plat] = !this.activePlatforms[plat];
    // Update the card visually
    const cards = document.querySelectorAll('[style*="border:2px solid"]');
    cards.forEach(card => {
      if (card.textContent.toLowerCase().includes(plat)) {
        card.style.borderColor = this.activePlatforms[plat] ? '#1877f2' : '#dadde1';
        card.style.background = this.activePlatforms[plat] ? '#e7f3ff' : '#fff';
        const cb = card.querySelector('input[type="checkbox"]');
        if (cb) cb.checked = this.activePlatforms[plat];
      }
    });
  },

  closeComposer() { document.getElementById('composerContainer').innerHTML = ''; },

  async handleDrop(event) {
    event.preventDefault();
    event.target.style.borderColor = '#dadde1';
    event.target.style.background = '#fafbfc';
    await this.uploadFiles(event.dataTransfer.files);
  },

  async handleComposerFiles(event) {
    await this.uploadFiles(event.target.files);
  },

  async uploadFiles(files) {
    const progressEl = document.getElementById('uploadProgress');
    for (const file of files) {
      if (this.uploadedFiles.length >= 10) { alert('Max 10 files'); break; }
      if (progressEl) progressEl.innerText = `Uploading ${file.name}...`;
      const storageRef = firebase.storage().ref('social/' + Date.now() + '_' + file.name);
      await storageRef.put(file);
      const url = await storageRef.ref.getDownloadURL();
      this.uploadedFiles.push(url);
    }
    if (progressEl) progressEl.innerText = '';
    this.refreshComposerMedia();
  },

  refreshComposerMedia() {
    const grid = document.getElementById('composerMediaGrid');
    if (!grid) return;
    grid.innerHTML = this.uploadedFiles.map((url, i) => `
      <div style="position:relative;width:80px;height:80px;border-radius:8px;overflow:hidden;">
        ${url.includes('.mp4') || url.includes('.mov') 
          ? `<video src="${url}" style="width:100%;height:100%;object-fit:cover;"></video>`
          : `<img src="${url}" style="width:100%;height:100%;object-fit:cover;">`}
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
    const message = document.getElementById('composerCaption')?.value?.trim() || '';
    const scheduleDate = document.getElementById('scheduleDate')?.value;
    const scheduleTime = document.getElementById('scheduleTime')?.value;
    const isScheduled = scheduleDate && scheduleTime;
    const privacy = document.querySelector('input[name="privacy"]:checked')?.value || 'public';

    if (!this.activePlatforms.facebook && !this.activePlatforms.instagram) {
      return alert('Select at least one platform!');
    }

    // Post to Facebook
    if (this.activePlatforms.facebook) {
      const cfg = (await db.collection('settings').doc('facebook').get()).data();
      if (cfg?.pageAccessToken && cfg?.pageId) {
        try {
          const params = new URLSearchParams({ message, access_token: cfg.pageAccessToken });
          if (this.uploadedFiles.length > 0) params.append('link', this.uploadedFiles[0]);
          const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.pageId}/feed`, { method: 'POST', body: params });
          const result = await res.json();
          if (res.ok) {
            await db.collection('socialPosts').add({
              platform: 'facebook', message, media: this.uploadedFiles,
              status: isScheduled ? 'scheduled' : 'published',
              scheduledAt: isScheduled ? new Date(scheduleDate + 'T' + scheduleTime).toISOString() : null,
              privacy, storyEnabled: this.storyEnabled,
              platformId: result.id,
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
          } else {
            alert('Facebook Error: ' + (result.error?.message || 'Failed'));
            return;
          }
        } catch (err) { alert('Facebook Error: ' + err.message); return; }
      }
    }

    // Post to Instagram
    if (this.activePlatforms.instagram) {
      const cfg = (await db.collection('settings').doc('instagram').get()).data();
      if (cfg?.accessToken && cfg?.accountId) {
        try {
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
          await db.collection('socialPosts').add({
            platform: 'instagram', message, media: this.uploadedFiles,
            status: isScheduled ? 'scheduled' : 'published',
            scheduledAt: isScheduled ? new Date(scheduleDate + 'T' + scheduleTime).toISOString() : null,
            privacy,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        } catch (err) { alert('Instagram Error: ' + err.message); return; }
      }
    }

    this.closeComposer();
    this.uploadedFiles = [];
    this.render();
    alert(`✅ Post ${isScheduled ? 'scheduled' : 'published'} successfully!`);
  },

  async publishDraft(id) {
    await db.collection('socialPosts').doc(id).update({ status: 'published' });
    this.render();
  },

  async deletePost(id) {
    if (!confirm('Delete this post?')) return;
    await db.collection('socialPosts').doc(id).delete();
    this.render();
  }
};
