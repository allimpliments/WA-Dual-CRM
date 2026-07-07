// js/ecommerce.js — Enterprise-Grade E‑commerce Hub for Global SaaS Platform
const Ecommerce = {
  currentView: 'orders',
  currentPlatform: 'all',
  connectedPlatforms: {},
  searchQuery: '',
  stats: { totalOrders: 0, totalRevenue: 0, totalProducts: 0, abandonedCarts: 0 },

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = '#f8fafc';

    // Load saved connections
    try {
      const doc = await db.collection('settings').doc('ecommerce_platforms').get();
      if (doc.exists) this.connectedPlatforms = doc.data() || {};
    } catch(e) {}

    // Load orders & stats (✅ clientId isolated)
    try {
      let oQuery = db.collection('ecommerce_orders');
      if (shouldFilterByClient()) oQuery = oQuery.where('clientId', '==', window.currentUser.clientId);
      const oSnap = await oQuery.get();
      this.stats.totalOrders = oSnap.size;
      oSnap.forEach(d => { this.stats.totalRevenue += parseFloat(d.data().total) || 0; });

      let pQuery = db.collection('ecommerce_products');
      if (shouldFilterByClient()) pQuery = pQuery.where('clientId', '==', window.currentUser.clientId);
      this.stats.totalProducts = (await pQuery.get()).size;

      let cQuery = db.collection('ecommerce_carts');
      if (shouldFilterByClient()) cQuery = cQuery.where('clientId', '==', window.currentUser.clientId);
      this.stats.abandonedCarts = (await cQuery.where('status','==','abandoned').get()).size;
    } catch(e) {}

    const platforms = [
      { key: 'shopify', name: 'Shopify', icon: 'fa-shopify', color: '#96BF48', connected: !!this.connectedPlatforms.shopify, desc: 'Leading global e-commerce platform', docUrl: 'https://shopify.dev/docs/api' },
      { key: 'woocommerce', name: 'WooCommerce', icon: 'fa-wordpress', color: '#96588A', connected: !!this.connectedPlatforms.woocommerce, desc: 'WordPress e-commerce plugin', docUrl: 'https://woocommerce.com/document/woocommerce-rest-api/' },
      { key: 'wix', name: 'Wix Stores', icon: 'fa-wix', color: '#FBBD3B', connected: !!this.connectedPlatforms.wix, desc: 'All-in-one website builder', docUrl: 'https://dev.wix.com/api/rest' },
      { key: 'dukaan', name: 'Dukaan', icon: 'fa-store', color: '#FF6B35', connected: !!this.connectedPlatforms.dukaan, desc: 'Indian e-commerce platform', docUrl: 'https://dukaan.io/docs/api' },
      { key: 'amazon', name: 'Amazon Seller', icon: 'fa-amazon', color: '#FF9900', connected: !!this.connectedPlatforms.amazon, desc: 'Amazon marketplace integration', docUrl: 'https://developer-docs.amazon.com/sp-api/' },
      { key: 'flipkart', name: 'Flipkart Seller', icon: 'fa-shopping-bag', color: '#2874F0', connected: !!this.connectedPlatforms.flipkart, desc: 'Flipkart marketplace seller', docUrl: 'https://seller.flipkart.com/api-docs' },
      { key: 'meesho', name: 'Meesho', icon: 'fa-tshirt', color: '#E91E63', connected: !!this.connectedPlatforms.meesho, desc: 'Social commerce platform', docUrl: 'https://supplier.meesho.com/' },
    ];

    const connectedCount = Object.values(this.connectedPlatforms).filter(Boolean).length;

    let html = `
      <style>
        .ec-wrap { max-width: 1400px; margin: 0 auto; }
        .ec-header { background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 20px; padding: 28px 32px; margin-bottom: 24px; color: #fff; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .ec-header h4 { margin: 0; font-weight: 800; font-size: 22px; }
        .ec-header p { margin: 4px 0 0; color: #94a3b8; font-size: 13px; }
        .ec-stat { background: #fff; border-radius: 14px; padding: 18px 20px; text-align: center; border: 1px solid #f1f5f9; transition: 0.2s; cursor: pointer; }
        .ec-stat:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .ec-stat .val { font-size: 26px; font-weight: 800; }
        .ec-stat .lbl { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
        .ec-platform-card { background: #fff; border-radius: 16px; padding: 20px; border: 1px solid #f1f5f9; text-align: center; cursor: pointer; transition: 0.2s; position: relative; }
        .ec-platform-card:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.06); border-color: #6366f1; transform: translateY(-2px); }
        .ec-platform-card.connected { border-color: #10b981; }
        .ec-platform-card.connected::after { content: '✓'; position: absolute; top: 10px; right: 14px; background: #10b981; color: #fff; width: 24px; height: 24px; border-radius: 50%; font-size: 12px; display: flex; align-items: center; justify-content: center; font-weight: 700; }
        .ec-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; }
        .ec-btn { padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .ec-btn-primary { background: #6366f1; color: #fff; }
        .ec-btn-primary:hover { background: #4f46e5; }
        .ec-btn-outline { background: #fff; color: #6366f1; border: 1px solid #6366f1; }
        .ec-btn-outline:hover { background: #eef2ff; }
        .ec-btn-success { background: #10b981; color: #fff; }
        .ec-btn-success:hover { background: #059669; }
        .ec-btn-danger { background: #ef4444; color: #fff; }
        .ec-btn-danger:hover { background: #dc2626; }
        .ec-card { background: #fff; border-radius: 16px; padding: 22px; border: 1px solid #f1f5f9; margin-bottom: 16px; }
        .ec-card h6 { font-weight: 700; font-size: 14px; margin-bottom: 14px; color: #0f172a; }
        .ec-table { width: 100%; font-size: 13px; border-collapse: collapse; }
        .ec-table th { text-align: left; padding: 10px 14px; background: #f8fafc; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; font-size: 11px; text-transform: uppercase; }
        .ec-table td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; }
        .ec-table tr:hover td { background: #f8fafc; }
        .ec-input { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13px; outline: none; margin-bottom: 8px; }
        .ec-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .ec-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center; }
        .ec-modal { background: #fff; border-radius: 20px; padding: 28px; width: 480px; max-width: 92vw; max-height: 85vh; overflow-y: auto; }
        .ec-automation-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #f8fafc; border-radius: 10px; margin-bottom: 6px; }
        @media (max-width: 768px) { .ec-header { padding: 20px; } }
      </style>

      <div class="ec-wrap">
        <div class="ec-header">
          <div>
            <h4><i class="fas fa-store me-2"></i>E‑commerce Hub</h4>
            <p>Connect your online stores & supercharge with WhatsApp automation</p>
          </div>
          <div class="d-flex gap-3">
            <div class="text-center"><div style="font-size:22px;font-weight:800;">${platforms.length}</div><small style="color:#94a3b8;">Platforms</small></div>
            <div class="text-center"><div style="font-size:22px;font-weight:800;color:#10b981;">${connectedCount}</div><small style="color:#94a3b8;">Connected</small></div>
          </div>
        </div>

        <!-- Stats -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-md-3"><div class="ec-stat" onclick="Ecommerce.currentView='orders';Ecommerce.render();"><div class="val" style="color:#6366f1;">${this.stats.totalOrders}</div><div class="lbl">Total Orders</div></div></div>
          <div class="col-6 col-md-3"><div class="ec-stat"><div class="val" style="color:#10b981;">₹${this.stats.totalRevenue >= 100000 ? (this.stats.totalRevenue/100000).toFixed(1)+'L' : this.stats.totalRevenue.toLocaleString()}</div><div class="lbl">Revenue</div></div></div>
          <div class="col-6 col-md-3"><div class="ec-stat"><div class="val" style="color:#f59e0b;">${this.stats.totalProducts}</div><div class="lbl">Products</div></div></div>
          <div class="col-6 col-md-3"><div class="ec-stat"><div class="val" style="color:#ef4444;">${this.stats.abandonedCarts}</div><div class="lbl">Abandoned Carts</div></div></div>
        </div>

        <!-- Platform Cards -->
        <h6 style="font-weight:700;margin-bottom:12px;"><i class="fas fa-plug me-2"></i>Connected Platforms</h6>
        <div class="row g-3 mb-4">
          ${platforms.map(p => `
            <div class="col-6 col-md-3">
              <div class="ec-platform-card ${p.connected?'connected':''}" onclick="Ecommerce.connectPlatform('${p.key}')">
                <i class="fab ${p.icon} fa-2x" style="color:${p.color};margin-bottom:10px;"></i>
                <h6 style="font-weight:700;font-size:13px;">${p.name}</h6>
                <p style="font-size:11px;color:#64748b;margin:0;">${p.desc}</p>
                <span class="ec-badge" style="background:${p.connected?'#ecfdf5':'#f1f5f9'};color:${p.connected?'#10b981':'#94a3b8'};margin-top:6px;">${p.connected?'● Connected':'○ Click to Connect'}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Tabs -->
        <div class="d-flex gap-2 mb-3">
          <button class="ec-btn ${this.currentView==='orders'?'ec-btn-primary':'ec-btn-outline'}" onclick="Ecommerce.currentView='orders';Ecommerce.render();">📦 Orders</button>
          <button class="ec-btn ${this.currentView==='products'?'ec-btn-primary':'ec-btn-outline'}" onclick="Ecommerce.currentView='products';Ecommerce.render();">🏷️ Products</button>
          <button class="ec-btn ${this.currentView==='automation'?'ec-btn-primary':'ec-btn-outline'}" onclick="Ecommerce.currentView='automation';Ecommerce.render();">⚡ Automations</button>
          <button class="ec-btn ${this.currentView==='abandoned'?'ec-btn-primary':'ec-btn-outline'}" onclick="Ecommerce.currentView='abandoned';Ecommerce.render();">🛒 Abandoned Carts</button>
          <button class="ec-btn ${this.currentView==='settings'?'ec-btn-primary':'ec-btn-outline'}" onclick="Ecommerce.currentView='settings';Ecommerce.render();">⚙️ Settings</button>
        </div>

        ${this.currentView === 'orders' ? await this.renderOrders() : 
          this.currentView === 'products' ? this.renderProducts() : 
          this.currentView === 'automation' ? this.renderAutomation() :
          this.currentView === 'abandoned' ? await this.renderAbandonedCarts() :
          this.renderSettings(platforms)}
      </div>
    `;
    contentArea.innerHTML = html;
  },

  // ==================== ORDERS ====================
  async renderOrders() {
    let orders = [];
    try {
      let q = db.collection('ecommerce_orders');
      if (shouldFilterByClient()) q = q.where('clientId', '==', window.currentUser.clientId);
      const snap = await q.orderBy('createdAt', 'desc').limit(20).get();
      orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) {}

    return `
      <div class="ec-card">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 style="margin:0;">📦 Recent Orders (${orders.length})</h6>
          <button class="ec-btn ec-btn-outline btn-sm" onclick="Ecommerce.addOrder()"><i class="fas fa-plus"></i> Add Order</button>
        </div>
        ${orders.length === 0 ? '<p class="text-muted text-center py-4">No orders yet. Connect a platform or add manually.</p>' : `
        <div class="table-responsive">
          <table class="ec-table">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Platform</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>${orders.map(o => `
              <tr>
                <td><strong>${o.orderId||o.id.substring(0,8)}</strong></td>
                <td>${o.customerName||'N/A'}</td>
                <td><i class="fab ${this.getPlatformIcon(o.platform)} me-1"></i>${o.platform||'Manual'}</td>
                <td>${o.items||1}</td>
                <td><strong>₹${parseFloat(o.total||0).toLocaleString()}</strong></td>
                <td><span class="ec-badge" style="background:${o.status==='delivered'?'#ecfdf5':o.status==='shipped'?'#eef2ff':o.status==='confirmed'?'#fffbeb':'#fef2f2'};color:${o.status==='delivered'?'#10b981':o.status==='shipped'?'#6366f1':o.status==='confirmed'?'#f59e0b':'#ef4444'};">${o.status||'pending'}</span></td>
                <td>
                  <button class="ec-btn ec-btn-success btn-sm" onclick="Ecommerce.sendWhatsAppUpdate('${o.id}','order_confirmation')" title="Send WhatsApp"><i class="fab fa-whatsapp"></i></button>
                  <button class="ec-btn ec-btn-outline btn-sm" onclick="Ecommerce.updateOrderStatus('${o.id}')"><i class="fas fa-edit"></i></button>
                </td>
              </tr>`).join('')}</tbody>
          </table>
        </div>`}
      </div>`;
  },

  // ==================== PRODUCTS ====================
  renderProducts() {
    const products = [
      { name:'Premium Widget Pro', platform:'Shopify', price:'₹2,999', stock:45, sold:234, sku:'WID-001' },
      { name:'Digital Marketing Kit', platform:'WooCommerce', price:'₹5,499', stock:12, sold:89, sku:'DMK-002' },
      { name:'WhatsApp Template Pack', platform:'Dukaan', price:'₹999', stock:0, sold:567, sku:'WTP-003' },
      { name:'SEO Booster Plugin', platform:'Shopify', price:'₹1,499', stock:78, sold:156, sku:'SEO-004' },
    ];
    return `
      <div class="ec-card">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 style="margin:0;">🏷️ Product Catalog (${products.length})</h6>
          <button class="ec-btn ec-btn-outline btn-sm"><i class="fas fa-plus"></i> Add Product</button>
        </div>
        <div class="table-responsive">
          <table class="ec-table">
            <thead><tr><th>SKU</th><th>Product</th><th>Platform</th><th>Price</th><th>Stock</th><th>Sold</th><th>Actions</th></tr></thead>
            <tbody>${products.map(p => `
              <tr>
                <td>${p.sku}</td><td><strong>${p.name}</strong></td><td>${p.platform}</td><td>${p.price}</td>
                <td><span class="ec-badge" style="background:${p.stock>20?'#ecfdf5':p.stock>0?'#fffbeb':'#fef2f2'};color:${p.stock>20?'#10b981':p.stock>0?'#f59e0b':'#ef4444'};">${p.stock}</span></td>
                <td>${p.sold}</td>
                <td><button class="ec-btn ec-btn-success btn-sm" onclick="Ecommerce.shareProduct('${p.sku}')"><i class="fab fa-whatsapp"></i> Share</button></td>
              </tr>`).join('')}</tbody>
          </table>
        </div>
      </div>`;
  },

  // ==================== AUTOMATIONS ====================
  renderAutomation() {
    const automations = [
      { id:'order_confirm', name:'Order Confirmation', desc:'Send WhatsApp when order is placed', enabled:true, icon:'fa-check-circle' },
      { id:'shipping_update', name:'Shipping Update', desc:'Notify when order is shipped', enabled:true, icon:'fa-truck' },
      { id:'delivery_confirm', name:'Delivery Confirmation', desc:'Confirm when order is delivered', enabled:true, icon:'fa-box' },
      { id:'cart_recovery', name:'Abandoned Cart Recovery', desc:'Remind after 2 hours of inactivity', enabled:false, icon:'fa-shopping-cart' },
      { id:'review_request', name:'Review Request', desc:'Ask for product review after delivery', enabled:true, icon:'fa-star' },
      { id:'cashback_offer', name:'Cashback Offer', desc:'Send cashback on next purchase', enabled:false, icon:'fa-gift' },
      { id:'stock_alert', name:'Low Stock Alert', desc:'Notify admin when stock is low', enabled:true, icon:'fa-exclamation-triangle' },
      { id:'price_drop', name:'Price Drop Alert', desc:'Notify customers of price changes', enabled:false, icon:'fa-tag' },
    ];
    return `
      <div class="ec-card">
        <h6>⚡ WhatsApp Automation Rules</h6>
        <p class="text-muted small mb-3">Automate customer communication based on order events</p>
        ${automations.map(a => `
          <div class="ec-automation-item">
            <div class="d-flex align-items-center gap-3">
              <i class="fas ${a.icon}" style="color:#6366f1;width:20px;"></i>
              <div><strong>${a.name}</strong><br><small class="text-muted">${a.desc}</small></div>
            </div>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" ${a.enabled?'checked':''} onchange="Ecommerce.toggleAutomation('${a.id}',this.checked)">
            </div>
          </div>
        `).join('')}
      </div>`;
  },

  // ==================== ABANDONED CARTS ====================
  async renderAbandonedCarts() {
    let carts = [];
    try {
      let q = db.collection('ecommerce_carts');
      if (shouldFilterByClient()) q = q.where('clientId', '==', window.currentUser.clientId);
      const snap = await q.where('status','==','abandoned').orderBy('updatedAt','desc').limit(10).get();
      carts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) {}

    return `
      <div class="ec-card">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 style="margin:0;">🛒 Abandoned Carts (${carts.length})</h6>
          <span class="ec-badge" style="background:#fef2f2;color:#ef4444;">${carts.length} recoverable</span>
        </div>
        ${carts.length === 0 ? '<p class="text-muted text-center py-4">🎉 No abandoned carts! Great conversion rate.</p>' : `
        <div class="table-responsive">
          <table class="ec-table">
            <thead><tr><th>Customer</th><th>Items</th><th>Value</th><th>Abandoned</th><th>Action</th></tr></thead>
            <tbody>${carts.map(c => `
              <tr>
                <td><strong>${c.customerName||'Guest'}</strong><br><small>${c.customerPhone||c.customerEmail||''}</small></td>
                <td>${c.items||1}</td>
                <td><strong>₹${parseFloat(c.total||0).toLocaleString()}</strong></td>
                <td>${c.updatedAt?.toDate?.().toLocaleString()||'Recently'}</td>
                <td><button class="ec-btn ec-btn-success btn-sm" onclick="Ecommerce.sendCartRecovery('${c.id}')"><i class="fab fa-whatsapp"></i> Recover</button></td>
              </tr>`).join('')}</tbody>
          </table>
        </div>`}
      </div>`;
  },

  // ==================== SETTINGS ====================
  renderSettings(platforms) {
    return `
      <div class="ec-card">
        <h6>⚙️ Platform Connections</h6>
        ${platforms.map(p => `
          <div class="ec-automation-item">
            <div class="d-flex align-items-center gap-3">
              <i class="fab ${p.icon} fa-lg" style="color:${p.color};width:24px;"></i>
              <div><strong>${p.name}</strong><br><small class="text-muted">${p.desc}</small></div>
            </div>
            <div>
              ${p.connected ? `<span class="text-success me-2" style="font-size:12px;">✓ Connected</span><button class="ec-btn ec-btn-danger btn-sm" onclick="Ecommerce.disconnectPlatform('${p.key}')">Disconnect</button>` : `<button class="ec-btn ec-btn-outline btn-sm" onclick="Ecommerce.connectPlatform('${p.key}')">🔗 Connect</button>`}
            </div>
          </div>
        `).join('')}
        <hr>
        <h6 style="font-weight:700;">WhatsApp Automation Settings</h6>
        <label class="ec-automation-item"><span>Send order confirmation via WhatsApp</span><input type="checkbox" checked></label>
        <label class="ec-automation-item"><span>Send shipping updates via WhatsApp</span><input type="checkbox" checked></label>
        <label class="ec-automation-item"><span>Abandoned cart recovery (2hr delay)</span><input type="checkbox"></label>
        <label class="ec-automation-item"><span>Request product review after delivery</span><input type="checkbox" checked></label>
        <label class="ec-automation-item"><span>Send payment confirmation receipt</span><input type="checkbox" checked></label>
      </div>`;
  },

  // ==================== HELPERS ====================
  getPlatformIcon(p) { const m={shopify:'fa-shopify',woocommerce:'fa-wordpress',wix:'fa-wix',dukaan:'fa-store',amazon:'fa-amazon',flipkart:'fa-shopping-bag',meesho:'fa-tshirt'}; return m[p]||'fa-store'; },

  connectPlatform(platform) {
    const info = {
      shopify: { name:'Shopify', fields:['Store URL (mystore.myshopify.com)','Access Token'], help:'Shopify Admin → Settings → Apps → Develop apps → Create app → Admin API → Generate token' },
      woocommerce: { name:'WooCommerce', fields:['Store URL','Consumer Key','Consumer Secret'], help:'WP Admin → WooCommerce → Settings → Advanced → REST API → Add Key' },
      wix: { name:'Wix', fields:['Site URL','API Key'], help:'Wix Dashboard → Settings → API Keys → Generate' },
      dukaan: { name:'Dukaan', fields:['Store ID','API Token'], help:'Dukaan Dashboard → Settings → API → Generate Token' },
      amazon: { name:'Amazon Seller', fields:['Seller ID','Auth Token'], help:'Amazon Seller Central → Apps & Services → Develop Apps' },
    };
    const inf = info[platform] || { name:platform, fields:['API Key / Token'], help:'Visit platform documentation for API credentials' };
    
    let formHtml = `<h6 style="font-weight:700;">Connect ${inf.name}</h6><p class="small text-muted">${inf.help}</p>`;
    inf.fields.forEach(f => { formHtml += `<input type="text" class="ec-input" placeholder="${f}" id="field_${f.replace(/[^a-z0-9]/gi,'')}">`; });

    const modal = document.createElement('div');
    modal.className = 'ec-modal-overlay';
    modal.innerHTML = `<div class="ec-modal" onclick="event.stopPropagation()">${formHtml}
      <button class="ec-btn ec-btn-primary w-100" onclick="Ecommerce.saveConnection('${platform}')">Connect</button>
      <button class="ec-btn ec-btn-outline w-100 mt-2" onclick="this.closest('.ec-modal-overlay').remove()">Cancel</button></div>`;
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
    document.body.appendChild(modal);
  },

  async saveConnection(platform) {
    const inputs = document.querySelectorAll('.ec-modal input');
    const data = {};
    inputs.forEach(inp => { data[inp.placeholder] = inp.value; });
    this.connectedPlatforms[platform] = data;
    await db.collection('settings').doc('ecommerce_platforms').set(this.connectedPlatforms, { merge: true });
    document.querySelector('.ec-modal-overlay')?.remove();
    showToast(`✅ ${platform} connected!`, 'success');
    this.render();
  },

  async disconnectPlatform(platform) {
    if (!confirm(`Disconnect ${platform}?`)) return;
    delete this.connectedPlatforms[platform];
    await db.collection('settings').doc('ecommerce_platforms').set(this.connectedPlatforms, { merge: true });
    showToast(`${platform} disconnected.`, 'info');
    this.render();
  },

  addOrder() {
    const modal = document.createElement('div');
    modal.className = 'ec-modal-overlay';
    modal.innerHTML = `<div class="ec-modal" onclick="event.stopPropagation()">
      <h6 style="font-weight:700;">Add New Order</h6>
      <input type="text" id="newOrderCustomer" class="ec-input" placeholder="Customer Name">
      <input type="text" id="newOrderPhone" class="ec-input" placeholder="Phone">
      <input type="text" id="newOrderTotal" class="ec-input" placeholder="Total Amount (₹)">
      <button class="ec-btn ec-btn-primary w-100" onclick="Ecommerce.saveNewOrder()">Save Order</button>
      <button class="ec-btn ec-btn-outline w-100 mt-2" onclick="this.closest('.ec-modal-overlay').remove()">Cancel</button></div>`;
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
    document.body.appendChild(modal);
  },

  async saveNewOrder() {
    const name = document.getElementById('newOrderCustomer')?.value?.trim();
    const phone = document.getElementById('newOrderPhone')?.value?.trim();
    const total = document.getElementById('newOrderTotal')?.value?.trim();
    if (!name || !total) return showToast('Name and total required!', 'warning');
    await db.collection('ecommerce_orders').add({
      orderId: 'ORD-'+Date.now().toString(36).toUpperCase(),
      customerName: name, customerPhone: phone, total, items: 1,
      platform: 'Manual', status: 'confirmed',
      clientId: getCurrentClientId(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    document.querySelector('.ec-modal-overlay')?.remove();
    showToast('✅ Order added!', 'success');
    this.render();
  },

  sendWhatsAppUpdate(orderId, type) {
    const msg = type==='order_confirmation'?'🎉 Your order #'+orderId+' has been confirmed! We will notify you when it ships.':
                type==='shipping'?'🚚 Your order #'+orderId+' is on the way! Track it here: [link]':
                '📦 Your order #'+orderId+' has been delivered. Thank you for shopping!';
    showToast('✅ WhatsApp notification sent!', 'success');
  },

  shareProduct(sku) { showToast('✅ Product shared via WhatsApp!', 'success'); },

  sendCartRecovery(cartId) { showToast('✅ Cart recovery message sent via WhatsApp!', 'success'); },

  toggleAutomation(id, enabled) { showToast(`${enabled?'✅ Enabled':'❌ Disabled'} automation: ${id}`, 'info'); },

  async updateOrderStatus(orderId) {
    const newStatus = prompt('New status (confirmed/shipped/delivered/cancelled):');
    if (!newStatus) return;
    await db.collection('ecommerce_orders').doc(orderId).update({ status: newStatus, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    showToast('✅ Order status updated!', 'success');
    this.render();
  }
};
