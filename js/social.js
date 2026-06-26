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
        .drop-zone{border:2px dashed #dadde1;border-radius:12px;padding:40px;text-align:center;cursor:pointer;background:#fafbfc;}
        .drop-zone:hover{border-color:#1877f2;background:#e7f3ff;}
        .media-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
        .media-item{position:relative;border-radius:8px;overflow:hidden;aspect-ratio:1;}
        .media-item img,.media-item video{width:100%;height:100%;object-fit:cover;}
        .media-item .remove-btn{position:absolute;top:4px;right:4px;background:#fa3e3e;color:#fff;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;}
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
        <div class="post-card"><div class="d-flex gap-3">${p.media?.length?`<div class="d-flex gap-1">${p.media.slice(0,3).map(m=>`<img src="${m}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">`).join('')}</div>`:''}<div class="flex-grow-1"><div class="d-flex justify-content-between"><div><span class="badge bg-${p.platform==='facebook'?'primary':p.platform==='instagram'?'danger':p.platform==='linkedin'?'info':'danger'}">${p.platform}</span></div><small class="text-muted">${p.createdAt?.toDate().toLocaleDateString()}</small></div><p class="mt-2 mb-1">${p.message||'(no caption)'}</p><div class="d-flex gap-2 mt-2">${p.status!=='published'?`<button class="btn btn-sm btn-primary" onclick="Social.publishDraft('${p.id}')">Publish</button>`:''}<button class="btn btn-sm btn-outline-danger" onclick="Social.deletePost('${p.id}')"><i class="fas fa-trash"></i></button></div></div></div></div>
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
                <div class="platform-card ${this.activePlatforms.linkedin?'active':''}" onclick="Social.togglePlatform('linkedin')"><i class="fab fa-linkedin fa-2x text-info mb-2"></i><br><strong>LinkedIn</strong></div>
                <div class="platform-card ${this.activePlatforms.youtube?'active':''}" onclick="Social.togglePlatform('youtube')"><i class="fab fa-youtube fa-2x text-danger mb-2"></i><br><strong>YouTube</strong></div>
              </div></div>
              <div class="meta-card"><div class="fw-bold mb-3">Media</div><div class="drop-zone" ondragover="event.preventDefault();this.style.borderColor='#1877f2'" ondragleave="this.style.borderColor='#dadde1'" ondrop="Social.handleDrop(event)"><i class="fas fa-cloud-upload-alt fa-3x" style="color:#1877f2;margin-bottom:12px;"></i><p style="font-weight:600;">Upload Media</p><div class="d-flex gap-2 justify-content-center mt-3"><button class="meta-btn meta-btn-outline" onclick="event.stopPropagation();document.getElementById('composerFileInput').click();"><i class="fas fa-image"></i> Add Photo</button><button class="meta-btn meta-btn-outline" onclick="event.stopPropagation();document.getElementById('composerFileInput').click();"><i class="fas fa-video"></i> Add Video</button></div></div><input type="file" id="composerFileInput" multiple accept="image/*,video/*" style="display:none" onchange="Social.handleComposerFiles(event)"><div class="media-grid mt-3" id="composerMediaGrid"></div></div>
              <div class="meta-card"><div class="fw-bold mb-3">Caption</div><textarea id="composerCaption" class="form-control" style="min-height:150px;border-radius:8px;border:1px solid #dadde1;padding:12px;font-size:14px;" placeholder="What's on your mind?" oninput="Social.updatePreview()"></textarea></div>
              <div class="d-flex gap-2"><button class="meta-btn meta-btn-primary flex-grow-1" style="height:48px;font-size:16px;" onclick="Social.publishFromComposer()">🚀 Publish Now</button><button class="meta-btn meta-btn-outline" onclick="Social.saveAsDraft()">💾 Draft</button></div>
            </div>
            <div style="position:sticky;top:20px;"><div class="meta-card"><div class="fw-bold mb-3">Preview</div><div class="bg-light rounded p-3" id="composerPreview"><div style="background:#fff;border-radius:8px;padding:12px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="width:36px;height:36px;border-radius:50%;background:#1877f2;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;">11</div><div><strong>11 Avatar Digital Hub</strong><br><small style="color:#65676b;">Just now</small></div></div><p>Start writing...</p></div></div></div></div>
          </div>
        </div>
      </div>
    `;
  },

  updatePreview() {
    const p = document.getElementById('composerPreview'); if(!p) return;
    const c = document.getElementById('composerCaption')?.value||'Start writing...';
    const m = this.uploadedFiles.map(u=>u.includes('.mp4')?`<video src="${u}" controls style="width:100%;border-radius:8px;margin-bottom:4px;"></video>`:`<img src="${u}" style="width:100%;border-radius:8px;margin-bottom:4px;">`).join('');
    p.innerHTML = `<div style="background:#fff;border-radius:8px;padding:12px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="width:36px;height:36px;border-radius:50%;background:#1877f2;display:flex;align-items:center;justify-content:center;color:#fff;">11</div><div><strong>11 Avatar Digital Hub</strong><br><small style="color:#65676b;">Just now</small></div></div><p>${c}</p>${m}</div>`;
  },

  togglePlatform(p) { this.activePlatforms[p] = !this.activePlatforms[p]; this.openComposer(); },
  closeComposer() { document.getElementById('composerContainer').innerHTML = ''; },
  async handleDrop(e) { e.preventDefault(); await this.uploadFiles(e.dataTransfer.files); },
  async handleComposerFiles(e) { await this.uploadFiles(e.target.files); },

  async uploadFiles(files) {
    for(const f of files) {
      if(this.uploadedFiles.length>=10){alert('Max 10 files');break;}
      const ref = firebase.storage().ref('social/'+Date.now()+'_'+f.name);
      await ref.put(f);
      this.uploadedFiles.push(await ref.ref.getDownloadURL());
    }
    this.refreshMediaGrid();
  },

  refreshMediaGrid() {
    const g = document.getElementById('composerMediaGrid'); if(!g) return;
    g.innerHTML = this.uploadedFiles.map((u,i)=>`<div class="media-item">${u.includes('.mp4')?`<video src="${u}"></video>`:`<img src="${u}">`}<button class="remove-btn" onclick="Social.removeMedia(${i})">×</button></div>`).join('');
    this.updatePreview();
  },

  removeMedia(i) { this.uploadedFiles.splice(i,1); this.refreshMediaGrid(); },

  async publishFromComposer() { await this.savePost('published'); },
  async saveAsDraft() { await this.savePost('draft'); },

  async savePost(status) {
    const msg = document.getElementById('composerCaption')?.value||'';
    for(const p of ['facebook','instagram','linkedin','youtube']) {
      if(!this.activePlatforms[p]) continue;
      const configDoc = p==='facebook'?'facebook_page':p==='instagram'?'instagram_business':p;
      const cfg = (await db.collection('settings').doc(configDoc).get()).data();
      const data = {platform:p,message:msg,media:this.uploadedFiles,status,createdAt:firebase.firestore.FieldValue.serverTimestamp()};

      if(status==='published'&&cfg?.accessToken) {
        if(p==='facebook') {
          const prm = new URLSearchParams({message:msg,access_token:cfg.accessToken});
          if(this.uploadedFiles[0]) prm.append('link',this.uploadedFiles[0]);
          const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.pageId}/feed`,{method:'POST',body:prm});
          const d = await res.json();
          if(d.id) data.platformId = d.id;
        } else if(p==='instagram') {
          for(const url of this.uploadedFiles.slice(0,10)) {
            const prm = new URLSearchParams({caption:msg,image_url:url,access_token:cfg.accessToken});
            const cr = await fetch(`https://graph.facebook.com/v22.0/${cfg.accountId}/media`,{method:'POST',body:prm});
            const cd = await cr.json();
            if(cd.id) await fetch(`https://graph.facebook.com/v22.0/${cfg.accountId}/media_publish`,{method:'POST',body:new URLSearchParams({creation_id:cd.id,access_token:cfg.accessToken})});
          }
        }
      }
      await db.collection('socialPosts').add(data);
    }
    this.closeComposer(); this.uploadedFiles=[]; this.render();
    alert('✅ '+(status==='published'?'Posted!':'Draft saved!'));
  },

  async publishDraft(id) {
    const doc = await db.collection('socialPosts').doc(id).get();
    const post = doc.data();
    const configDoc = post.platform==='facebook'?'facebook_page':post.platform==='instagram'?'instagram_business':post.platform;
    const cfg = (await db.collection('settings').doc(configDoc).get()).data();
    if(!cfg?.accessToken) return alert('Not configured!');
    if(post.platform==='facebook'){
      const prm = new URLSearchParams({message:post.message,access_token:cfg.accessToken});
      if(post.media?.[0]) prm.append('link',post.media[0]);
      const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.pageId}/feed`,{method:'POST',body:prm});
      const d = await res.json();
      if(d.id) await db.collection('socialPosts').doc(id).update({status:'published',platformId:d.id});
      else return alert('Error: '+(d.error?.message||'Failed'));
    }
    if(post.platform==='instagram'){
      for(const url of (post.media||[]).slice(0,10)){
        const prm = new URLSearchParams({caption:post.message,image_url:url,access_token:cfg.accessToken});
        const cr = await fetch(`https://graph.facebook.com/v22.0/${cfg.accountId}/media`,{method:'POST',body:prm});
        const cd = await cr.json();
        if(cd.id) await fetch(`https://graph.facebook.com/v22.0/${cfg.accountId}/media_publish`,{method:'POST',body:new URLSearchParams({creation_id:cd.id,access_token:cfg.accessToken})});
      }
      await db.collection('socialPosts').doc(id).update({status:'published'});
    }
    this.render(); alert('✅ Published!');
  },

  async deletePost(id) { if(!confirm('Delete?')) return; await db.collection('socialPosts').doc(id).delete(); this.render(); }
};
