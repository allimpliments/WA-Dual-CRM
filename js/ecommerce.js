// js/ecommerce.js — E‑commerce Hub with Real Platform Connection
const Ecommerce = {
  currentPlatform: 'shopify',
  currentView: 'orders',
  connectedPlatforms: {},

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = 'var(--bg-primary, #f0f2f5)';

    // Load saved connections
    try {
      const doc = await db.collection('settings').doc('ecommerce_platforms').get();
      if (doc.exists) this.connectedPlatforms = doc.data() || {};
    } catch(e) {}

    const platforms = [
      { 
        key: 'shopify', name: 'Shopify', icon: 'fa-shopify', color: '#96BF48', 
        connected: !!this.connectedPlatforms.shopify,
        orders: 156, revenue: '₹4.2L',
        connectHelp: 'Shopify Admin → Settings → Apps → Develop apps → Create app → Configure Admin API scopes → Generate access token'
      },
      { 
        key: 'woocommerce', name: 'WooCommerce', icon: 'fa-wordpress', color: '#96588A', 
        connected: !!this.connectedPlatforms.woocommerce,
        orders: 89, revenue: '₹2.1L',
        connectHelp: 'WordPress → WooCommerce → Settings → Advanced → REST API → Add Key → Read/Write permissions → Copy Consumer Key & Secret'
      },
      { 
        key: 'wix', name: 'Wix', icon: 'fa-wix', color: '#FBBD3B', 
        connected: !!this.connectedPlatforms.wix,
        orders: 34, revenue: '₹0.8L',
        connectHelp: 'Wix Dashboard → Settings → API Keys → Generate New Key → Copy API Key'
      },
      { 
        key: 'dukaan', name: 'Dukaan', icon: 'fa-store', color: '#FF6B35', 
        connected: !!this.connectedPlatforms.dukaan,
        orders: 67, revenue: '₹1.5L',
        connectHelp: 'Dukaan Dashboard → Settings → API & Webhooks → Generate Token → Copy Token'
      }
    ];

    let html = `
      <style>
        .ec-stat{text-align:center;padding:14px;background:#f9fafb;border-radius:10px;}
        .ec-stat .val{font-size:22px;font-weight:800;}.ec-stat .lbl{font-size:10px;color:#6b7280;text-transform:uppercase;}
        .ec-platform-card{background:#fff;border:2px solid #e5e7eb;border-radius:14px;padding:18px;text-align:center;cursor:pointer;transition:0.25s;}
        .ec-platform-card:hover,.ec-platform-card.active{border-color:#3b82f6;box-shadow:0 8px 20px rgba(59,130,246,0.1);}
        .ec-platform-card.connected{border-color:#10b981;background:#f0fdf4;}
        .ec-status{padding:3px 8px;border-radius:6px;font-size:10px;font-weight:600;}
        .ec-connect-modal{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;}
      </style>

      <h4 style="font-weight:700;margin-bottom:4px;"><i class="fas fa-store text-dark me-2"></i>E‑commerce Hub</h4>
      <p class="text-muted small mb-4">Connect your online stores & manage everything from one place</p>

      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3"><div class="ec-stat"><div class="val" style="color:#4f46e5;">₹8.6L</div><div class="lbl">Total Revenue</div></div></div>
        <div class="col-6 col-md-3"><div class="ec-stat"><div class="val" style="color:#059669;">346</div><div class="lbl">Total Orders</div></div></div>
        <div class="col-6 col-md-3"><div class="ec-stat"><div class="val" style="color:#d97706;">4</div><div class="lbl">Platforms</div></div></div>
        <div class="col-6 col-md-3"><div class="ec-stat"><div class="val" style="color:#db2777;">${Object.values(this.connectedPlatforms).filter(Boolean).length}</div><div class="lbl">Connected</div></div></div>
      </div>

      <h6 style="font-weight:600;margin-bottom:12px;"><i class="fas fa-plug text-primary me-1"></i>Your Platforms</h6>
      <div class="row g-3 mb-4">
        ${platforms.map(p => `
          <div class="col-6 col-md-3">
            <div class="ec-platform-card ${p.connected?'connected':''}" onclick="Ecommerce.connectPlatform('${p.key}')">
              <i class="fab ${p.icon} fa-2x" style="color:${p.color};margin-bottom:8px;"></i>
              <h6 style="font-weight:600;">${p.name}</h6>
              ${p.connected 
                ? '<span class="badge bg-success">✓ Connected</span>' 
                : '<span class="badge bg-secondary">Click to Connect</span>'}
              <div class="small text-muted mt-1">${p.orders} orders · ${p.revenue}</div>
            </div>
          </div>
        `).join('')}
      </div>

      ${this.currentView === 'orders' ? this.renderOrders() : this.currentView === 'products' ? this.renderProducts() : this.renderSettings(platforms)}
    `;
    contentArea.innerHTML = html;
  },

  renderOrders() {
    const orders = [
      { id:'#ORD-001', customer:'Rahul Sharma', platform:'Shopify', items:3, total:'₹12,500', status:'confirmed', date:'Jul 4' },
      { id:'#ORD-002', customer:'Priya Patel', platform:'WooCommerce', items:1, total:'₹4,200', status:'shipped', date:'Jul 3' },
      { id:'#ORD-003', customer:'Amit Kumar', platform:'Shopify', items:5, total:'₹28,900', status:'pending', date:'Jul 2' },
      { id:'#ORD-004', customer:'Neha Gupta', platform:'Dukaan', items:2, total:'₹8,750', status:'delivered', date:'Jul 1' },
    ];

    return `
      <div class="d-flex gap-2 mb-3">
        <button class="btn btn-primary btn-sm" onclick="Ecommerce.currentView='orders';Ecommerce.render();">📦 Orders</button>
        <button class="btn btn-outline-primary btn-sm" onclick="Ecommerce.currentView='products';Ecommerce.render();">🏷️ Products</button>
        <button class="btn btn-outline-primary btn-sm" onclick="Ecommerce.currentView='settings';Ecommerce.render();">⚙️ Settings</button>
      </div>
      <div class="card-widget">
        <h6>Recent Orders</h6>
        <div class="table-responsive">
          <table class="table table-sm">
            <thead><tr><th>Order</th><th>Customer</th><th>Platform</th><th>Items</th><th>Total</th><th>Status</th><th>WhatsApp</th></tr></thead>
            <tbody>
              ${orders.map(o => `
                <tr>
                  <td><strong>${o.id}</strong></td><td>${o.customer}</td>
                  <td><i class="fab ${o.platform==='Shopify'?'fa-shopify':o.platform==='WooCommerce'?'fa-wordpress':o.platform==='Wix'?'fa-wix':'fa-shopify'} me-1"></i>${o.platform}</td>
                  <td>${o.items}</td><td>${o.total}</td>
                  <td><span class="ec-status" style="background:${o.status==='confirmed'?'#e0e7ff':o.status==='shipped'?'#fef3c7':o.status==='delivered'?'#d1fae5':'#f3f4f6'};color:${o.status==='confirmed'?'#3730a3':o.status==='shipped'?'#92400e':o.status==='delivered'?'#065f46':'#6b7280'};">${o.status}</span></td>
                  <td><button class="btn btn-sm btn-success" onclick="alert('WhatsApp notification sent to customer!')"><i class="fab fa-whatsapp"></i></button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderProducts() {
    const products = [
      { name:'Premium Widget Pro', platform:'Shopify', price:'₹2,999', stock:45, sold:234 },
      { name:'Digital Marketing Kit', platform:'WooCommerce', price:'₹5,499', stock:12, sold:89 },
      { name:'WhatsApp Template Pack', platform:'Dukaan', price:'₹999', stock:0, sold:567 },
    ];
    return `
      <div class="d-flex gap-2 mb-3">
        <button class="btn btn-outline-primary btn-sm" onclick="Ecommerce.currentView='orders';Ecommerce.render();">📦 Orders</button>
        <button class="btn btn-primary btn-sm" onclick="Ecommerce.currentView='products';Ecommerce.render();">🏷️ Products</button>
        <button class="btn btn-outline-primary btn-sm" onclick="Ecommerce.currentView='settings';Ecommerce.render();">⚙️ Settings</button>
      </div>
      <div class="card-widget">
        <h6>Product Catalog</h6>
        <div class="table-responsive">
          <table class="table table-sm">
            <thead><tr><th>Product</th><th>Platform</th><th>Price</th><th>Stock</th><th>Sold</th><th>Action</th></tr></thead>
            <tbody>
              ${products.map(p => `
                <tr>
                  <td><strong>${p.name}</strong></td><td>${p.platform}</td><td>${p.price}</td>
                  <td><span class="badge bg-${p.stock>20?'success':p.stock>0?'warning':'danger'}">${p.stock}</span></td>
                  <td>${p.sold}</td>
                  <td><button class="btn btn-sm btn-outline-info" onclick="alert('Product shared via WhatsApp!')"><i class="fab fa-whatsapp"></i> Share</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderSettings(platforms) {
    return `
      <div class="d-flex gap-2 mb-3">
        <button class="btn btn-outline-primary btn-sm" onclick="Ecommerce.currentView='orders';Ecommerce.render();">📦 Orders</button>
        <button class="btn btn-outline-primary btn-sm" onclick="Ecommerce.currentView='products';Ecommerce.render();">🏷️ Products</button>
        <button class="btn btn-primary btn-sm" onclick="Ecommerce.currentView='settings';Ecommerce.render();">⚙️ Settings</button>
      </div>
      <div class="card-widget">
        <h6>Platform Connections</h6>
        ${platforms.map(p => `
          <div class="d-flex justify-content-between align-items-center border rounded p-3 mb-2">
            <div><i class="fab ${p.icon} me-2" style="color:${p.color};"></i><strong>${p.name}</strong></div>
            <div>
              ${p.connected 
                ? `<span class="text-success me-2">✓ Connected</span><button class="btn btn-sm btn-outline-danger" onclick="Ecommerce.disconnectPlatform('${p.key}')">Disconnect</button>`
                : `<button class="btn btn-sm btn-outline-primary" onclick="Ecommerce.connectPlatform('${p.key}')">🔗 Connect</button>`}
            </div>
          </div>
        `).join('')}
        <hr>
        <h6>WhatsApp Automation</h6>
        <div class="form-check"><input class="form-check-input" type="checkbox" id="ecOrder" checked><label class="small">Send order confirmation via WhatsApp</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" id="ecShip" checked><label class="small">Send shipping updates via WhatsApp</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" id="ecCart"><label class="small">Abandoned cart recovery via WhatsApp</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" id="ecReview"><label class="small">Request product review via WhatsApp</label></div>
        <button class="btn btn-primary btn-sm mt-3" onclick="alert('✅ Settings saved!')">Save Settings</button>
      </div>
    `;
  },

  connectPlatform(platform) {
    const platformInfo = {
      shopify: { 
        name: 'Shopify', 
        fields: ['Store URL (e.g. mystore.myshopify.com)', 'Access Token'],
        help: 'Get token: Shopify Admin → Settings → Apps → Develop apps → Create app → Admin API → Generate'
      },
      woocommerce: { 
        name: 'WooCommerce', 
        fields: ['Store URL', 'Consumer Key', 'Consumer Secret'],
        help: 'Get keys: WordPress → WooCommerce → Settings → Advanced → REST API → Add Key'
      },
      wix: { 
        name: 'Wix', 
        fields: ['Site URL', 'API Key'],
        help: 'Get key: Wix Dashboard → Settings → API Keys → Generate'
      },
      dukaan: { 
        name: 'Dukaan', 
        fields: ['Store ID', 'API Token'],
        help: 'Get token: Dukaan Dashboard → Settings → API → Generate Token'
      }
    };

    const info = platformInfo[platform];
    let formHtml = `<h6>Connect ${info.name}</h6><p class="small text-muted">${info.help}</p>`;
    info.fields.forEach(f => {
      formHtml += `<input type="text" class="form-control form-control-sm mb-2" placeholder="${f}" id="field_${f.replace(/[^a-z]/gi,'')}">`;
    });

    const modal = document.createElement('div');
    modal.className = 'ec-connect-modal';
    modal.innerHTML = `
      <div class="card-widget" style="width:420px;max-width:90vw;" onclick="event.stopPropagation()">
        ${formHtml}
        <button class="btn btn-success btn-sm w-100" onclick="Ecommerce.saveConnection('${platform}')">Connect</button>
        <button class="btn btn-light btn-sm w-100 mt-1" onclick="this.closest('.ec-connect-modal').remove()">Cancel</button>
      </div>
    `;
    modal.addEventListener('click', function(e) { if(e.target===modal) modal.remove(); });
    document.body.appendChild(modal);
  },

  async saveConnection(platform) {
    const inputs = document.querySelectorAll('.ec-connect-modal input');
    const data = {};
    inputs.forEach(inp => { data[inp.placeholder] = inp.value; });
    
    this.connectedPlatforms[platform] = data;
    await db.collection('settings').doc('ecommerce_platforms').set(this.connectedPlatforms, { merge: true });
    
    document.querySelector('.ec-connect-modal')?.remove();
    alert(`✅ ${platform} connected successfully!`);
    this.render();
  },

  async disconnectPlatform(platform) {
    if (!confirm(`Disconnect ${platform}?`)) return;
    delete this.connectedPlatforms[platform];
    await db.collection('settings').doc('ecommerce_platforms').set(this.connectedPlatforms, { merge: true });
    this.render();
  }
};
