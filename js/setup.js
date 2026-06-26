const Setup = {
  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading setup...</p>';

    let wa = {}, fbPage = {}, fbMsg = {}, igBiz = {}, igMsg = {};
    try {
      const w = await db.collection('settings').doc('whatsapp').get(); if(w.exists) wa = w.data();
      const fp = await db.collection('settings').doc('facebook_page').get(); if(fp.exists) fbPage = fp.data();
      const fm = await db.collection('settings').doc('facebook_messenger').get(); if(fm.exists) fbMsg = fm.data();
      const ib = await db.collection('settings').doc('instagram_business').get(); if(ib.exists) igBiz = ib.data();
      const im = await db.collection('settings').doc('instagram_messenger').get(); if(im.exists) igMsg = im.data();
    } catch(e){}

    let html = `
      <h4 class="mb-4"><i class="fas fa-cog me-2"></i>Platform Setup</h4>

      <!-- WhatsApp Cloud API -->
      <div class="card-widget mb-4">
        <h5><i class="fab fa-whatsapp text-success me-2"></i>WhatsApp Cloud API</h5>
        <div class="row g-2">
          <div class="col-md-6"><label class="form-label small">Phone Number ID</label><input type="text" id="waPhoneId" class="form-control form-control-sm" value="${wa.phoneNumberId||''}"></div>
          <div class="col-md-6"><label class="form-label small">Access Token</label><input type="password" id="waToken" class="form-control form-control-sm" value="${wa.accessToken||''}"></div>
        </div>
        <button class="btn btn-success btn-sm mt-2" onclick="Setup.saveWhatsApp()">Save WhatsApp</button>
        <button class="btn btn-outline-success btn-sm mt-2 ms-1" onclick="Setup.testWhatsApp()">Test</button>
        <span class="badge bg-${wa.phoneNumberId?'success':'warning'} ms-2">${wa.phoneNumberId?'✅':'⚠️'}</span>
      </div>

      <!-- Facebook Messenger (Chat) -->
      <div class="card-widget mb-4">
        <h5><i class="fab fa-facebook-messenger text-primary me-2"></i>Facebook Messenger (Live Chat)</h5>
        <div class="row g-2">
          <div class="col-md-6"><label class="form-label small">Page ID</label><input type="text" id="fbMsgPageId" class="form-control form-control-sm" value="${fbMsg.pageId||'335971479599720'}"></div>
          <div class="col-md-6"><label class="form-label small">Page Access Token</label><input type="password" id="fbMsgToken" class="form-control form-control-sm" value="${fbMsg.pageAccessToken||''}"></div>
        </div>
        <button class="btn btn-primary btn-sm mt-2" onclick="Setup.saveFacebookMessenger()">Save Messenger</button>
        <span class="badge bg-${fbMsg.pageAccessToken?'success':'warning'} ms-2">${fbMsg.pageAccessToken?'✅':'⚠️'}</span>
      </div>

      <!-- Instagram Messenger (Chat) -->
      <div class="card-widget mb-4">
        <h5><i class="fab fa-instagram text-danger me-2"></i>Instagram Direct (Live Chat)</h5>
        <div class="row g-2">
          <div class="col-md-6"><label class="form-label small">Instagram Account ID</label><input type="text" id="igMsgAccId" class="form-control form-control-sm" value="${igMsg.accountId||'17841467479420121'}"></div>
          <div class="col-md-6"><label class="form-label small">Access Token</label><input type="password" id="igMsgToken" class="form-control form-control-sm" value="${igMsg.accessToken||''}"></div>
        </div>
        <button class="btn btn-danger btn-sm mt-2" onclick="Setup.saveInstagramMessenger()">Save Messenger</button>
        <span class="badge bg-${igMsg.accessToken?'success':'warning'} ms-2">${igMsg.accessToken?'✅':'⚠️'}</span>
      </div>

      <!-- Facebook Page (Posting) -->
      <div class="card-widget mb-4">
        <h5><i class="fab fa-facebook text-primary me-2"></i>Facebook Page (Posting)</h5>
        <div class="row g-2">
          <div class="col-md-6"><label class="form-label small">Page ID</label><input type="text" id="fbPostPageId" class="form-control form-control-sm" value="${fbPage.pageId||'335971479599720'}"></div>
          <div class="col-md-6"><label class="form-label small">Page Access Token</label><input type="password" id="fbPostToken" class="form-control form-control-sm" value="${fbPage.pageAccessToken||''}"></div>
        </div>
        <button class="btn btn-primary btn-sm mt-2" onclick="Setup.saveFacebookPage()">Save Page</button>
        <span class="badge bg-${fbPage.pageAccessToken?'success':'warning'} ms-2">${fbPage.pageAccessToken?'✅':'⚠️'}</span>
      </div>

      <!-- Instagram Business (Posting) -->
      <div class="card-widget mb-4">
        <h5><i class="fab fa-instagram text-danger me-2"></i>Instagram Business (Posting)</h5>
        <div class="row g-2">
          <div class="col-md-6"><label class="form-label small">Account ID</label><input type="text" id="igPostAccId" class="form-control form-control-sm" value="${igBiz.accountId||'17841467479420121'}"></div>
          <div class="col-md-6"><label class="form-label small">Access Token</label><input type="password" id="igPostToken" class="form-control form-control-sm" value="${igBiz.accessToken||''}"></div>
        </div>
        <button class="btn btn-danger btn-sm mt-2" onclick="Setup.saveInstagramBusiness()">Save Business</button>
        <span class="badge bg-${igBiz.accessToken?'success':'warning'} ms-2">${igBiz.accessToken?'✅':'⚠️'}</span>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  async saveWhatsApp() {
    await db.collection('settings').doc('whatsapp').set({
      phoneNumberId: document.getElementById('waPhoneId').value.trim(),
      accessToken: document.getElementById('waToken').value.trim()
    });
    alert('✅ WhatsApp saved!'); this.render();
  },

  async testWhatsApp() {
    const cfg = (await db.collection('settings').doc('whatsapp').get()).data();
    if(!cfg?.accessToken) return alert('Save first!');
    const res = await fetch(`https://graph.facebook.com/v22.0/${cfg.phoneNumberId}`, {headers:{'Authorization':'Bearer '+cfg.accessToken}});
    const d = await res.json();
    alert(res.ok ? '✅ WhatsApp Connected!' : '❌ '+(d.error?.message||'Failed'));
  },

  async saveFacebookMessenger() {
    await db.collection('settings').doc('facebook_messenger').set({
      pageId: document.getElementById('fbMsgPageId').value.trim(),
      pageAccessToken: document.getElementById('fbMsgToken').value.trim()
    });
    alert('✅ FB Messenger saved!'); this.render();
  },

  async saveInstagramMessenger() {
    await db.collection('settings').doc('instagram_messenger').set({
      accountId: document.getElementById('igMsgAccId').value.trim(),
      accessToken: document.getElementById('igMsgToken').value.trim()
    });
    alert('✅ IG Messenger saved!'); this.render();
  },

  async saveFacebookPage() {
    await db.collection('settings').doc('facebook_page').set({
      pageId: document.getElementById('fbPostPageId').value.trim(),
      pageAccessToken: document.getElementById('fbPostToken').value.trim()
    });
    alert('✅ FB Page saved!'); this.render();
  },

  async saveInstagramBusiness() {
    await db.collection('settings').doc('instagram_business').set({
      accountId: document.getElementById('igPostAccId').value.trim(),
      accessToken: document.getElementById('igPostToken').value.trim()
    });
    alert('✅ IG Business saved!'); this.render();
  }
};
