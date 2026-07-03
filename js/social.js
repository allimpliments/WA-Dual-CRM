const Social = {
  currentTab: 'published',

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading...</p>';

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
        .card { background: #fff; border: 1px solid #dadde1; border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
        .btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; font-size: 14px; }
        .btn-primary { background: #1877f2; color: #fff; }
        .btn-outline { background: #fff; color: #1877f2; border: 1px solid #dadde1; }
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
      <div id="postsList">
        ${posts.length === 0 ? '<p class="text-muted text-center py-4">No posts.</p>' : posts.map(p => `
          <div class="card" style="padding:16px;">
            <div class="d-flex gap-3">
              ${p.media?.length ? `<img src="${p.media[0]}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">` : ''}
              <div class="flex-grow-1">
                <div class="d-flex justify-content-between">
                  <div><span class="badge bg-${p.platform==='facebook'?'primary':'danger'}">${p.platform}</span><span class="badge bg-info ms-1">${p.postType||'post'}</span></div>
                  <small>${p.createdAt?.toDate().toLocaleDateString()}</small>
                </div>
                <p class="mt-1">${p.message||'(no caption)'}</p>
                ${p.status!=='published'?`<button class="btn btn-sm btn-primary" onclick="Social.publishDraft('${p.id}')">Publish</button>`:''}
                <button class="btn btn-sm btn-outline ms-1" onclick="Social.deletePost('${p.id}')"><i class="fas fa-trash"></i></button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <div id="composerContainer"></div>
    `;
    contentArea.innerHTML = html;
  },

  switchTab(tab) { this.currentTab = tab; this.render(); },

  // ==================== OPEN COMPOSER ====================
  openComposer() {
    SocialComposer.render();
  },

  // ==================== PUBLISH DRAFT ====================
  async publishDraft(id) {
    const doc = await db.collection('socialPosts').doc(id).get();
    const post = doc.data();
    const configDoc = post.platform === 'facebook' ? 'facebook_page' : 'instagram_business';
    const cfg = (await db.collection('settings').doc(configDoc).get()).data();
    if (!cfg?.accessToken) return alert('Not configured!');
    try {
      if (post.platform === 'facebook') {
        const params = new URLSearchParams({ message: post.message, access_token: cfg.accessToken });
        if (post.media?.length) params.append('link', post.media[0]);
        const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.pageId}/feed`, { method: 'POST', body: params });
        const result = await res.json();
        if (result.id) await db.collection('socialPosts').doc(id).update({ status: 'published', platformId: result.id });
        else throw new Error(result.error?.message);
      } else {
        if (!post.media?.length) throw new Error('No media');
        const params = new URLSearchParams({ caption: post.message, image_url: post.media[0], access_token: cfg.accessToken });
        const cr = await fetch(`https://graph.facebook.com/v22.0/${cfg.accountId}/media`, { method: 'POST', body: params });
        const cd = await cr.json();
        if (!cd.id) throw new Error(cd.error?.message);
        await fetch(`https://graph.facebook.com/v22.0/${cfg.accountId}/media_publish`, { method: 'POST', body: new URLSearchParams({ creation_id: cd.id, access_token: cfg.accessToken }) });
        await db.collection('socialPosts').doc(id).update({ status: 'published' });
      }
      alert('✅ Published!'); this.render();
    } catch (err) { alert('Error: ' + err.message); }
  },

  // ==================== DELETE POST ====================
  async deletePost(id) {
    if (!confirm('Delete?')) return;
    await db.collection('socialPosts').doc(id).delete();
    this.render();
  }
};
