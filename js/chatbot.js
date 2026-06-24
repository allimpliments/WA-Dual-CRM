const Chatbot = {
  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading chatbot settings...</p>';

    let botReplies = [];
    let aiSettings = {};
    try {
      const snap = await db.collection('botReplies').orderBy('createdAt', 'desc').get();
      botReplies = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const aiDoc = await db.collection('settings').doc('chatbot').get();
      if (aiDoc.exists) aiSettings = aiDoc.data();
    } catch (err) {
      console.error('Error loading chatbot:', err);
    }

    let html = `
      <div class="row g-3">
        <!-- AI Settings Card -->
        <div class="col-md-6">
          <div class="card-widget">
            <h5><i class="fas fa-robot text-purple me-2"></i>AI Auto-Reply Settings</h5>
            <div class="mb-3">
              <label class="form-label small fw-bold">OpenAI API Key</label>
              <input type="password" id="aiApiKey" class="form-control form-control-sm" value="${aiSettings.apiKey || ''}" placeholder="sk-...">
            </div>
            <div class="mb-3">
              <label class="form-label small fw-bold">Bot Name</label>
              <input type="text" id="aiBotName" class="form-control form-control-sm" value="${aiSettings.botName || 'Support Bot'}" placeholder="Support Bot">
            </div>
            <div class="mb-3">
              <label class="form-label small fw-bold">Business Info (for context)</label>
              <textarea id="aiBusinessInfo" class="form-control form-control-sm" rows="3" placeholder="We are a digital marketing agency...">${aiSettings.businessInfo || ''}</textarea>
            </div>
            <div class="form-check mb-2">
              <input class="form-check-input" type="checkbox" id="aiEnabled" ${aiSettings.enabled ? 'checked' : ''}>
              <label class="form-check-label small fw-bold">Enable AI Auto-Reply</label>
            </div>
            <button class="btn btn-primary btn-sm" onclick="Chatbot.saveAISettings()"><i class="fas fa-save me-1"></i> Save AI Settings</button>
          </div>
        </div>

        <!-- Keyword Bot Replies -->
        <div class="col-md-6">
          <div class="card-widget">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="mb-0"><i class="fas fa-reply text-info me-2"></i>Keyword Bot Replies</h5>
              <button class="btn btn-primary btn-sm" onclick="Chatbot.showAddReply()"><i class="fas fa-plus me-1"></i> Add Reply</button>
            </div>
            <div id="botReplyForm"></div>
            <div style="max-height:300px;overflow-y:auto;">
              ${botReplies.length === 0
                ? '<p class="text-muted text-center py-3">No keyword replies yet.</p>'
                : botReplies.map(br => `
                  <div class="border rounded p-2 mb-2">
                    <div class="d-flex justify-content-between">
                      <strong>${br.trigger || '-'}</strong>
                      <div>
                        <span class="badge bg-${br.status==='active'?'success':'secondary'}">${br.status || 'active'}</span>
                        <button class="btn btn-sm btn-outline-danger ms-1" onclick="Chatbot.deleteReply('${br.id}')"><i class="fas fa-trash"></i></button>
                      </div>
                    </div>
                    <small class="text-muted">Reply: ${br.reply || '-'}</small>
                  </div>
                `).join('')
              }
            </div>
          </div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
  },

  async saveAISettings() {
    const data = {
      apiKey: document.getElementById('aiApiKey').value.trim(),
      botName: document.getElementById('aiBotName').value.trim(),
      businessInfo: document.getElementById('aiBusinessInfo').value.trim(),
      enabled: document.getElementById('aiEnabled').checked,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    try {
      await db.collection('settings').doc('chatbot').set(data, { merge: true });
      alert('✅ AI Settings saved!');
    } catch (err) { alert('Error: ' + err.message); }
  },

  showAddReply() {
    document.getElementById('botReplyForm').innerHTML = `
      <div class="card mb-2 border-info">
        <div class="card-body p-2">
          <input type="text" id="newTrigger" class="form-control form-control-sm mb-1" placeholder="Trigger word (e.g. price, hello)">
          <textarea id="newReply" class="form-control form-control-sm mb-1" rows="2" placeholder="Auto reply text. Use {first_name} for name."></textarea>
          <button class="btn btn-success btn-sm" onclick="Chatbot.addReply()"><i class="fas fa-save me-1"></i> Save</button>
          <button class="btn btn-light btn-sm" onclick="Chatbot.render()">Cancel</button>
        </div>
      </div>
    `;
  },

  async addReply() {
    const trigger = document.getElementById('newTrigger').value.trim().toLowerCase();
    const reply = document.getElementById('newReply').value.trim();
    if (!trigger || !reply) return alert('Both fields required!');
    try {
      await db.collection('botReplies').add({
        trigger, reply, status: 'active',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert('✅ Reply added!'); this.render();
    } catch (err) { alert('Error: ' + err.message); }
  },

  async deleteReply(id) {
    if (!confirm('Delete?')) return;
    await db.collection('botReplies').doc(id).delete();
    alert('Deleted.'); this.render();
  }
};
