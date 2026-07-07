const Leads = {
  currentFilter: 'all',
  currentSource: 'all',
  dateFrom: null,
  dateTo: null,
  currentAssignee: null,

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading leads...</p>';

    let leads = [];
    let users = [];
    try {
      let query = db.collection('leads');
      if (shouldFilterByClient()) query = query.where('clientId', '==', window.currentUser.clientId);
      if (this.dateFrom) query = query.where('createdAt', '>=', new Date(this.dateFrom));
      if (this.dateTo) query = query.where('createdAt', '<=', new Date(this.dateTo + 'T23:59:59'));
      const snap = await query.orderBy('createdAt', 'desc').get();
      leads = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const userSnap = await db.collection('users').get();
      users = userSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) { console.error(err); }

    // क्लाइंट-साइड फ़िल्टर (source, status, assignee)
    if (this.currentSource !== 'all') leads = leads.filter(l => l.source === this.currentSource);
    if (this.currentFilter !== 'all') leads = leads.filter(l => l.status === this.currentFilter);
    if (this.currentAssignee) leads = leads.filter(l => l.assignedTo === this.currentAssignee);

    // ... बाकी का रेंडर कोड (स्टैट्स, फ़िल्टर चिप्स, टेबल) बिलकुल वही ...

    // केवल टेबल वाले हिस्से में कोई बदलाव नहीं
  },

  async addLead() {
    const name = document.getElementById('leadName').value.trim();
    if (!name) return alert('Name required!');
    await LeadCapture.fromManual(
      name,
      document.getElementById('leadPhone').value.trim(),
      document.getElementById('leadEmail').value.trim(),
      document.getElementById('leadSource').value
    );
    alert('✅ Lead added!');
    this.render();
  },

  async updateStatus(id, status) {
    await db.collection('leads').doc(id).update({ status });
    this.render();
  },

  async deleteLead(id) {
    if (!confirm('Delete this lead?')) return;
    await db.collection('leads').doc(id).delete();
    this.render();
  }
};
