const Social = {
  currentTab: 'published',
  uploadedFiles: [],
  activePlatforms: { facebook: true, instagram: true, linkedin: false, youtube: false },
  previewDevice: 'desktop',

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading...</p>';
    let posts = [];
    try { const snap = await db.collection('socialPosts').orderBy('createdAt','desc').get(); posts = snap.docs.map(d=>({id:d.id,...d.data()})); } catch(e){}
    if(this.currentTab==='published') posts=posts.filter(p=>p.status==='published');
    else if(this.currentTab==='scheduled') posts=posts.filter(p=>p.status==='scheduled');
    else if(this.currentTab==='drafts') posts=posts.filter(p=>p.status==='draft');

    let html = `
      <style>
        .meta-card{background:#fff;border:1px solid #dadde1;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,.04);margin-bottom:20px;}
        .meta-btn{height:40px;padding:0 20px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;border:none;display:inline-flex;align-items:center;gap:8px;}
        .meta-btn-primary{background:#1877f2;color:#fff;}
        .meta-btn-outline{background:#fff;color:#1877f2;border:1px solid #dadde1;}
        .platform-card{flex:1;border:2px solid #dadde1;border-radius:12px;padding:16px;cursor:pointer;text-align:center;}
        .platform-card.active{border-color:#1877f2;background:#e7f3ff;}
        .post-card{border:1px solid #dadde1;border-radius:12px;padding:16px;margin-bottom:12px;}
        .drop-zone{border:2px dashed #dadde1;border-radius:12px;padding:40px;text-align:center;cursor:pointer;background:#fafbfc;transition:0.2s;}
        .drop-zone:hover,.drop-zone.drag-active{border-color:#1877f2;background:#e7f3ff;}
        .media-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
        .media-item{position:relative;border-radius:8px;overflow:hidden;aspect-ratio:1;background:#f0f0f0;}
        .media-item img,.media-item video{width:100%;height:100%;object-fit:cover;}
        .media-item .remove-btn{position:absolute;top:4px;right:4px;background:#fa3e3e;color:#fff;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;}
        .upload-progress{height:4px;background:#1877f2;border-radius:2px;margin-top:8px;transition:width 0.3s;}
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
      <div id="postsList">${posts.length===0?'<p class="text-muted text-center py-4">No posts.</p>':posts.map(p=>`
        <div class="post-card"><div class="d-flex gap-3">${p.media?.length?`<div class="d-flex gap-1">${p.media.slice(0,3).map(m=>`<img src="${m}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">`).join('')}</div>`:''}<div class="flex-grow-1"><div class="d-flex justify-content-between"><div><span class="badge bg-${p.platform==='facebook'?'primary':p.platform==='instagram'?'danger':'info'}">${p.platform}</span></div><small class="text-muted">${p.createdAt?.toDate().toLocaleDateString()}</small></div><p class="mt-2 mb-1">${p.message||'(no caption)'}</p><div class="d-flex gap-2 mt-2">${p.status!=='published'?`<button class="btn btn-sm btn-primary" onclick="Social.publishDraft('${p.id}')">Publish</button>`:''}<button class="btn btn-sm btn-outline-danger" onclick="Social.deletePost('${p.id}')"><i class="fas fa-trash"></i></button></div></div></div></div>
      `).join('')}</div>
      <div id="composerContainer"></div>
    `;
    contentArea.innerHTML = html;
  },

  switchTab(tab) { this.currentTab = tab; this.render(); },

  openComposer() {
    this.uploadedFiles = [];
    document.getElementById('composerContainer').innerHTML = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);z-index:2000;display:flex;align-items:center;justify-content:center;" onclick="Social.closeComposer()">
        <div style="background:#f0f2f5;border-radius:16px;padding:32px;max-height:92vh;overflow-y:auto;width:96%;max-width:1300px;" onclick="event.stopPropagation()">
          <div class="d-flex justify-content-between mb-4"><h3 style="font-weight:700;margin:0;">Create Post</h3><button class="btn-close" onclick="Social.closeComposer()"></button></div>
          <div style="display:grid;grid-template-columns:1fr 400px;gap:24px;">
            <div>
              <div class="meta-card"><div class="fw-bold mb-3">Post to</div><div class="d-flex gap-3">
                <div class="platform-card ${this.activePlatforms.facebook?'active':''}" onclick="Social.togglePlatform('facebook')"><i class="fab fa-facebook fa-2x text-primary mb-2"></i><br><strong>Facebook</strong></div>
                <div class="platform-card ${this.activePlatforms.instagram?'active':''}" onclick="Social.togglePlatform('instagram')"><i class="fab fa-instagram fa-2x text-danger mb-2"></i><br><strong>Instagram</strong></div>
              </div></div>

              <div class="meta-card">
                <div class="fw-bold mb-3">Media <small class="text-muted">(Drag & Drop or Click)</small></div>
                <div class="drop-zone" id="dropZone" 
                  ondragover="event.preventDefault();this.classList.add('drag-active');" 
                  ondragleave="this.classList.remove('drag-active');" 
                  ondrop="Social.handleDrop(event)">
                  <i class="fas fa-cloud-upload-alt fa-3x" style="color:#1877f2;margin-bottom:12px;"></i>
                  <p style="font-weight:600;">Upload Media</p>
                  <p class="text-muted">Add photos or video by dragging and dropping</p>
                  <div class="d-flex gap-2 justify-content-center mt-3">
                    <button class="meta-btn meta-btn-outline" onclick="event.stopPropagation();document.getElementById('composerFileInput').click();"><i class="fas fa-image"></i> Add Photo</button>
                    <button class="meta-btn meta-btn-outline" onclick="event.stopPropagation();document.getElementById('composerFileInput').click();"><i class="fas fa-video"></i> Add Video</button>
                  </div>
                </div>
                <input type="file" id="composerFileInput" multiple accept="image/*,video/*" style="display:none" onchange="Social.handleComposerFiles(event)">
                <div id="uploadProgressBar" class="upload-progress" style="width:0%;"></div>
                <div class="media-grid mt-3" id="composerMediaGrid"></div>
              </div>

              <div class="meta-card">
                <div class="fw-bold mb-3">Caption</div>
                <textarea id="composerCaption" class="form-control" style="min-height:150px;border-radius:8px;border:1px solid #dadde1;padding:12px;font-size:14px;" placeholder="What's on your mind?" oninput="Social.updatePreview()"></textarea>
              </div>

              <div class="d-flex gap-2">
                <button class="meta-btn meta-btn-primary flex-grow-1" style="height:48px;font-size:16px;" onclick="Social.publishFromComposer()">🚀 Publish Now</button>
                <button class="meta-btn meta-btn-outline" onclick="Social.saveAsDraft()">💾 Draft</button>
              </div>
              <div id="publishStatus" class="mt-2 small"></div>
            </div>

            <div style="position:sticky;top:20px;">
              <div class="meta-card">
                <div class="fw-bold mb-3">Preview</div>
                <div class="bg-light rounded p-3" id="composerPreview" style="min-height:300px;">
                  <div style="background:#fff;border-radius:8px;padding:12px;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="width:36px;height:36px;border-radius:50%;background:#1877f2;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;">11</div><div><strong>11 Avatar Digital Hub</strong><br><small style="color:#65676b;">Just now</small></div></div>
                    <p style="color:#65676b;">Start writing...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  togglePlatform(p) { this.activePlatforms[p] = !this.activePlatforms[p]; this.openComposer(); },
  closeComposer() { document.getElementById('composerContainer').innerHTML = ''; },

  async handleDrop(e) {
    e.preventDefault();
    e.target.classList.remove('drag-active');
    const files = e.dataTransfer.files;
    if(files.length > 0) await this.uploadFiles(files);
  },

  async handleComposerFiles(e) {
    const files = e.target.files;
    if(files.length > 0) await this.uploadFiles(files);
  },

  async uploadFiles(files) {
    const progressBar = document.getElementById('uploadProgressBar');
    const total = files.length;
    let uploaded = 0;

    for(const file of files) {
      if(this.uploadedFiles.length >= 10) { alert('Max 10 files for Instagram'); break; }
      
      const storageRef = firebase.storage().ref('social/' + Date.now() + '_' + file.name);
      const task = storageRef.put(file);
      
      task.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if(progressBar) progressBar.style.width = progress + '%';
        },
        (error) => { alert('Upload failed: ' + error.message); },
        async () => {
          const url = await task.snapshot.ref.getDownloadURL();
          this.uploadedFiles.push(url);
          uploaded++;
          if(uploaded === total) {
            if(progressBar) progressBar.style.width = '0%';
            this.refreshMediaGrid();
          }
        }
      );
    }
  },

  refreshMediaGrid() {
    const grid = document.getElementById('composerMediaGrid');
    if(!grid) return;
    grid.innerHTML = this.uploadedFiles.map((url, i) => `
      <div class="media-item">
        ${url.match(/\.(mp4|mov|webm)/i) ? `<video src="${url}" controls></video>` : `<img src="${url}" alt="media">`}
        <button class="remove-btn" onclick="Social.removeMedia(${i})">×</button>
      </div>
    `).join('');
    this.updatePreview();
  },

  removeMedia(i) { this.uploadedFiles.splice(i,1); this.refreshMediaGrid(); },

  updatePreview() {
    const preview = document.getElementById('composerPreview');
    if(!preview) return;
    const caption = document.getElementById('composerCaption')?.value || 'Start writing...';
    const mediaHTML = this.uploadedFiles.map(url => 
      url.match(/\.(mp4|mov|webm)/i) 
        ? `<video src="${url}" controls style="width:100%;border-radius:8px;margin-bottom:4px;"></video>` 
        : `<img src="${url}" style="width:100%;border-radius:8px;margin-bottom:4px;">`
    ).join('');
    preview.innerHTML = `
      <div style="background:#fff;border-radius:8px;padding:12px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="width:36px;height:36px;border-radius:50%;background:#1877f2;display:flex;align-items:center;justify-content:center;color:#fff;">11</div><div><strong>11 Avatar Digital Hub</strong><br><small style="color:#65676b;">Just now</small></div></div>
        <p style="white-space:pre-wrap;">${caption}</p>
        ${mediaHTML}
      </div>
    `;
  },

  async publishFromComposer() {
    const statusEl = document.getElementById('publishStatus');
    if(statusEl) statusEl.innerHTML = '<span class="text-info">Publishing...</span>';
    await this.savePost('published');
    if(statusEl) statusEl.innerHTML = '';
  },

  async saveAsDraft() { await this.savePost('draft'); },

  async savePost(status) {
    const msg = document.getElementById('composerCaption')?.value || '';
    
    for(const platform of ['facebook','instagram']) {
      if(!this.activePlatforms[platform]) continue;
      
      const configDoc = platform === 'facebook' ? 'facebook_page' : 'instagram_business';
      const cfg = (await db.collection('settings').doc(configDoc).get()).data();
      const data = { platform, message: msg, media: [...this.uploadedFiles], status, createdAt: firebase.firestore.FieldValue.serverTimestamp() };

      if(status === 'published' && cfg?.accessToken) {
        if(platform === 'facebook') {
          try {
            const params = new URLSearchParams({ message: msg, access_token: cfg.accessToken });
            if(this.uploadedFiles.length > 0) {
              for(const url of this.uploadedFiles) {
                params.append('link', url);
              }
            }
            const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.pageId}/feed`, { method: 'POST', body: params });
            const result = await res.json();
            if(result.id) data.platformId = result.id;
            else { alert('FB Error: ' + (result.error?.message || 'Failed')); return; }
          } catch(err) { alert('FB Error: ' + err.message); return; }
        } 
        else if(platform === 'instagram') {
          if(this.uploadedFiles.length === 0) {
            alert('Instagram requires at least one image or video!');
            return;
          }
          try {
            for(const url of this.uploadedFiles.slice(0, 10)) {
              const isVideo = url.match(/\.(mp4|mov|webm)/i);
              const params = new URLSearchParams({ caption: msg, access_token: cfg.accessToken });
              if(isVideo) {
                params.append('media_type', 'VIDEO');
                params.append('video_url', url);
              } else {
                params.append('image_url', url);
              }
              const createRes = await fetch(`https://graph.facebook.com/v22.0/${cfg.accountId}/media`, { method: 'POST', body: params });
              const createData = await createRes.json();
              if(createData.id) {
                const publishRes = await fetch(`https://graph.facebook.com/v22.0/${cfg.accountId}/media_publish`, {
                  method: 'POST',
                  body: new URLSearchParams({ creation_id: createData.id, access_token: cfg.accessToken })
                });
                const publishData = await publishRes.json();
                if(publishData.id) data.platformId = publishData.id;
              } else {
                alert('IG Error: ' + JSON.stringify(createData.error || createData));
                return;
              }
            }
          } catch(err) { alert('IG Error: ' + err.message); return; }
        }
      }

      await db.collection('socialPosts').add(data);
    }

    this.closeComposer();
    this.uploadedFiles = [];
    this.render();
    alert('✅ ' + (status === 'published' ? 'Posted successfully!' : 'Draft saved!'));
  },

  async publishDraft(id) {
    const doc = await db.collection('socialPosts').doc(id).get();
    const post = doc.data();
    const configDoc = post.platform === 'facebook' ? 'facebook_page' : 'instagram_business';
    const cfg = (await db.collection('settings').doc(configDoc).get()).data();
    if(!cfg?.accessToken) return alert('Not configured!');

    if(post.platform === 'facebook') {
      const params = new URLSearchParams({ message: post.message, access_token: cfg.accessToken });
      if(post.media?.length) {
        for(const url of post.media) params.append('link', url);
      }
      const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.pageId}/feed`, { method: 'POST', body: params });
      const result = await res.json();
      if(result.id) await db.collection('socialPosts').doc(id).update({ status: 'published', platformId: result.id });
      else return alert('Error: ' + (result.error?.message || 'Failed'));
    }

    if(post.platform === 'instagram') {
      if(!post.media?.length) return alert('Instagram requires media!');
      for(const url of post.media.slice(0, 10)) {
        const isVideo = url.match(/\.(mp4|mov|webm)/i);
        const params = new URLSearchParams({ caption: post.message, access_token: cfg.accessToken });
        if(isVideo) { params.append('media_type', 'VIDEO'); params.append('video_url', url); }
        else { params.append('image_url', url); }
        const createRes = await fetch(`https://graph.facebook.com/v22.0/${cfg.accountId}/media`, { method: 'POST', body: params });
        const createData = await createRes.json();
        if(createData.id) {
          await fetch(`https://graph.facebook.com/v22.0/${cfg.accountId}/media_publish`, {
            method: 'POST',
            body: new URLSearchParams({ creation_id: createData.id, access_token: cfg.accessToken })
          });
        }
      }
      await db.collection('socialPosts').doc(id).update({ status: 'published' });
    }

    this.render();
    alert('✅ Published!');
  },

  async deletePost(id) { if(!confirm('Delete?')) return; await db.collection('socialPosts').doc(id).delete(); this.render(); }
};
