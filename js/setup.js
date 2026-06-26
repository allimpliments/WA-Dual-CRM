const Setup = {
  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading setup...</p>';

    let wa = {}, fbPage = {}, fbMsg = {}, igBiz = {}, igMsg = {}, li = {}, yt = {};
    try {
      const w = await db.collection('settings').doc('whatsapp').get(); if(w.exists) wa = w.data();
      const fp = await db.collection('settings').doc('facebook_page').get(); if(fp.exists) fbPage = fp.data();
      const fm = await db.collection('settings').doc('facebook_messenger').get(); if(fm.exists) fbMsg = fm.data();
      const ib = await db.collection('settings').doc('instagram_business').get(); if(ib.exists) igBiz = ib.data();
      const im = await db.collection('settings').doc('instagram_messenger').get(); if(im.exists) igMsg = im.data();
      const l = await db.collection('settings').doc('linkedin').get(); if(l.exists) li = l.data();
      const y = await db.collection('settings').doc('youtube').get(); if(y.exists) yt = y.data();
    } catch(e){}

    let html = `
      <h4 class="mb-4"><i class="fas fa-cog me-2"></i>Platform Connections</h4>
      <p class="text-muted mb-4">Connect your social media accounts. Once connected, all features will work automatically.</p>

      <!-- WhatsApp -->
      <div class="card-widget mb-4">
        <h5><i class="fab fa-whatsapp text-success me-2"></i>WhatsApp Cloud API</h5>
        <div class="row g-2">
          <div class="col-md-5"><label class="form-label small">Phone Number ID</label><input type="text" id="waPhoneId" class="form-control form-control-sm" value="${wa.phoneNumberId||''}"></div>
          <div class="col-md-5"><label class="form-label small">Access Token</label><input type="password" id="waToken" class="form-control form-control-sm" value="${wa.accessToken||''}"></div>
          <div class="col-md-2 d-flex align-items-end"><button class="btn btn-success btn-sm w-100" onclick="Setup.save('whatsapp')">Save</button></div>
        </div>
        <span class="badge bg-${wa.phoneNumberId?'success':'warning'} mt-2">${wa.phoneNumberId?'Connected ✅':'Not Connected ⚠️'}</span>
      </div>

      <!-- Facebook Messenger (Chat) -->
      <div class="card-widget mb-4">
        <h5><i class="fab fa-facebook-messenger text-primary me-2"></i>Facebook Messenger (Live Chat)</h5>
        <div class="row g-2">
          <div class="col-md-5"><label class="form-label small">Page ID</label><input type="text" id="fbMsgPageId" class="form-control form-control-sm" value="${fbMsg.pageId||''}"></div>
          <div class="col-md-5"><label class="form-label small">Access Token</label><input type="password" id="fbMsgToken" class="form-control form-control-sm" value="${fbMsg.accessToken||''}"></div>
          <div class="col-md-2 d-flex align-items-end"><button class="btn btn-primary btn-sm w-100" onclick="Setup.save('facebook_messenger')">Save</button></div>
        </div>
        <span class="badge bg-${fbMsg.accessToken?'success':'warning'} mt-2">${fbMsg.accessToken?'Connected ✅':'Not Connected ⚠️'}</span>
      </div>

      <!-- Instagram Messenger (Chat) -->
      <div class="card-widget mb-4">
        <h5><i class="fab fa-instagram text-danger me-2"></i>Instagram Direct (Live Chat)</h5>
        <div class="row g-2">
          <div class="col-md-5"><label class="form-label small">Account ID</label><input type="text" id="igMsgAccId" class="form-control form-control-sm" value="${igMsg.accountId||''}"></div>
          <div class="col-md-5"><label class="form-label small">Access Token</label><input type="password" id="igMsgToken" class="form-control form-control-sm" value="${igMsg.accessToken||''}"></div>
          <div class="col-md-2 d-flex align-items-end"><button class="btn btn-danger btn-sm w-100" onclick="Setup.save('instagram_messenger')">Save</button></div>
        </div>
        <span class="badge bg-${igMsg.accessToken?'success':'warning'} mt-2">${igMsg.accessToken?'Connected ✅':'Not Connected ⚠️'}</span>
      </div>

      <!-- Facebook Page (Posting) -->
      <div class="card-widget mb-4">
        <h5><i class="fab fa-facebook text-primary me-2"></i>Facebook Page (Posting)</h5>
        <div class="row g-2">
          <div class="col-md-5"><label class="form-label small">Page ID</label><input type="text" id="fbPostPageId" class="form-control form-control-sm" value="${fbPage.pageId||''}"></div>
          <div class="col-md-5"><label class="form-label small">Access Token</label><input type="password" id="fbPostToken" class="form-control form-control-sm" value="${fbPage.accessToken||''}"></div>
          <div class="col-md-2 d-flex align-items-end"><button class="btn btn-primary btn-sm w-100" onclick="Setup.save('facebook_page')">Save</button></div>
        </div>
        <span class="badge bg-${fbPage.accessToken?'success':'warning'} mt-2">${fbPage.accessToken?'Connected ✅':'Not Connected ⚠️'}</span>
      </div>

      <!-- Instagram Business (Posting) -->
      <div class="card-widget mb-4">
        <h5><i class="fab fa-instagram text-danger me-2"></i>Instagram Business (Posting)</h5>
        <div class="row g-2">
          <div class="col-md-5"><label class="form-label small">Account ID</label><input type="text" id="igPostAccId" class="form-control form-control-sm" value="${igBiz.accountId||''}"></div>
          <div class="col-md-5"><label class="form-label small">Access Token</label><input type="password" id="igPostToken" class="form-control form-control-sm" value="${igBiz.accessToken||''}"></div>
          <div class="col-md-2 d-flex align-items-end"><button class="btn btn-danger btn-sm w-100" onclick="Setup.save('instagram_business')">Save</button></div>
        </div>
        <span class="badge bg-${igBiz.accessToken?'success':'warning'} mt-2">${igBiz.accessToken?'Connected ✅':'Not Connected ⚠️'}</span>
      </div>

      <!-- LinkedIn (Future) -->
      <div class="card-widget mb-4">
        <h5><i class="fab fa-linkedin text-info me-2"></i>LinkedIn (Posting & Chat) <span class="badge bg-secondary">Coming Soon</span></h5>
        <div class="row g-2">
          <div class="col-md-5"><label class="form-label small">Organization ID</label><input type="text" id="liOrgId" class="form-control form-control-sm" value="${li.orgId||''}" placeholder="Enter when available"></div>
          <div class="col-md-5"><label class="form-label small">Access Token</label><input type="password" id="liToken" class="form-control form-control-sm" value="${li.accessToken||''}" placeholder="Enter when available"></div>
          <div class="col-md-2 d-flex align-items-end"><button class="btn btn-info btn-sm w-100" onclick="Setup.save('linkedin')">Save</button></div>
        </div>
        <span class="badge bg-${li.accessToken?'success':'warning'} mt-2">${li.accessToken?'Connected ✅':'Not Connected ⚠️'}</span>
      </div>

      <!-- YouTube (Future) -->
      <div class="card-widget mb-4">
        <h5><i class="fab fa-youtube text-danger me-2"></i>YouTube (Posting) <span class="badge bg-secondary">Coming Soon</span></h5>
        <div class="row g-2">
          <div class="col-md-5"><label class="form-label small">Channel ID</label><input type="text" id="ytChannelId" class="form-control form-control-sm" value="${yt.channelId||''}" placeholder="Enter when available"></div>
          <div class="col-md-5"><label class="form-label small">API Key</label><input type="password" id="ytApiKey" class="form-control form-control-sm" value="${yt.apiKey||''}" placeholder="Enter when available"></div>
          <div class="col-md-2 d-flex align-items-end"><button class="btn btn-danger btn-sm w-100" onclick="Setup.save('youtube')">Save</button></div>
        </div>
        <span class="badge bg-${yt.apiKey?'success':'warning'} mt-2">${yt.apiKey?'Connected ✅':'Not Connected ⚠️'}</span>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  async save(platform) {
    const data = {};
    if (platform === 'whatsapp') {
      data.phoneNumberId = document.getElementById('waPhoneId').value.trim();
      data.accessToken = document.getElementById('waToken').value.trim();
    } else if (platform === 'facebook_messenger') {
      data.pageId = document.getElementById('fbMsgPageId').value.trim();
      data.accessToken = document.getElementById('fbMsgToken').value.trim();
    } else if (platform === 'instagram_messenger') {
      data.accountId = document.getElementById('igMsgAccId').value.trim();
      data.accessToken = document.getElementById('igMsgToken').value.trim();
    } else if (platform === 'facebook_page') {
      data.pageId = document.getElementById('fbPostPageId').value.trim();
      data.accessToken = document.getElementById('fbPostToken').value.trim();
    } else if (platform === 'instagram_business') {
      data.accountId = document.getElementById('igPostAccId').value.trim();
      data.accessToken = document.getElementById('igPostToken').value.trim();
    } else if (platform === 'linkedin') {
      data.orgId = document.getElementById('liOrgId').value.trim();
      data.accessToken = document.getElementById('liToken').value.trim();
    } else if (platform === 'youtube') {
      data.channelId = document.getElementById('ytChannelId').value.trim();
      data.apiKey = document.getElementById('ytApiKey').value.trim();
    }
    await db.collection('settings').doc(platform).set(data);
    alert('✅ Saved!');
    this.render();
  }
};
