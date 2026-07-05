// js/ecommerce.js — Multi-Platform E‑commerce (Shopify, WooCommerce, Wix, Dukaan)
const Ecommerce = {
  currentPlatform: 'shopify',
  currentView: 'orders',

  async render() {
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = 'var(--bg-primary, #f0f2f5)';

    const platforms = [
      { key: 'shopify', name: 'Shopify', icon: 'fa-shopify', color: '#96BF48', connected: false, orders: 156, revenue: '₹4.2L' },
      { key: 'woocommerce', name: 'WooCommerce', icon: 'fa-wordpress', color: '#96588A', connected: false, orders: 89, revenue: '₹2.1L' },
      { key: 'wix', name: 'Wix', icon: 'fa-wix', color: '#FBBD3B', connected: false, orders: 34, revenue: '₹0.8L' },
      { key: 'dukaan', name: 'Dukaan', icon: 'fa-store', color: '#FF6B35', connected: false, orders: 67, revenue: '₹1.5L' }
    ];

    const orders = [
      { id: '#ORD-2026-001', customer: 'Rahul Sharma', platform: 'Shopify', items: 3, total: '₹12,500', status: 'confirmed', date: 'Jul 4, 2026' },
      { id: '#ORD-2026-002', customer: 'Priya Patel', platform: 'WooCommerce', items: 1, total: '₹4,200', status: 'shipped', date: 'Jul 3, 2026' },
      { id: '#ORD-2026-003', customer: 'Amit Kumar', platform: 'Shopify', items: 5, total: '₹28,900', status: 'pending', date: 'Jul 2, 2026' },
      { id: '#ORD-2026-004', customer: 'Neha Gupta', platform: 'Dukaan', items: 2, total: '₹8,750', status: 'delivered', date: 'Jul 1, 2026' },
      { id: '#ORD-2026-005', customer: 'Vikram Singh', platform: 'Wix', items: 4, total: '₹15,300', status: 'confirmed', date: 'Jun 30, 2026' }
    ];

    const products = [
      { name: 'Premium Widget Pro', platform: 'Shopify', price: '₹2,999', stock: 45, sold: 234, status: 'active' },
      { name: 'Digital Marketing Kit', platform: 'WooCommerce', price: '₹5,499', stock: 12, sold: 89, status: 'low' },
      { name: 'WhatsApp Template Pack', platform: 'Dukaan', price: '₹999', stock: 0, sold: 567, status: 'out' },
      { name: 'CRM Setup Service', platform: 'Shopify', price: '₹15,000', stock: 99, sold: 34, status: 'active' }
    ];

    let html = `
      <style>
        .ec-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:18px;transition:0.2s;margin-bottom:12px;}
        .ec-card:hover{border-color:#3b82f6;}
        .ec-platform-card{background:#fff;border:2px solid #e5e7eb;border-radius:14px;padding:18px;text-align:center;cursor:pointer;transition:0.25s;}
        .ec-platform-card:hover,.ec-platform-card.active{border-color:#3b82f6;box-shadow:0 8px 20px rgba(59,130,246,0.1);}
        .ec-stat{text-align:center;padding:14px;background:#f9fafb;border-radius:10px;}
        .ec-stat .val{font-size:22px;font-weight:800;}.ec-stat .lbl{font-size:10px;color:#6b7280;text-transform:uppercase;}
        .ec-status{padding:3px 8px;border-radius:6px;font-size:10px;font-weight:600;}
        .ec-status.confirmed{background:#e0e7ff;color:#3730a3;}.ec-status.shipped{background:#fef3c7;color:#92400e;}
        .ec-status.delivered{background:#d1fae5;color:#065f46;}.ec-status.pending{background:#f3f4f6;color:#6b7280;}
        .ec-status.active{background:#d1fae5;color:#065f46;}.ec-status.low{background:#fef3c7;color:#92400e;}.ec-status.out{background:#fee2e2;color:#991b1b;}
      </style>

      <h4 style="font-weight:700;margin-bottom:8px;"><i class="fas fa-store text-dark me-2"></i>E‑commerce Hub</h4>
      <p class="text-muted small mb-4">Multi-platform order & product management</p>

      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3"><div class="ec-stat"><div class="val" style="color:#4f46e5;">₹8.6L</div><div class="lbl">Total Revenue</div></div></div>
        <div class="col-6 col-md-3"><div class="ec-stat"><div class="val" style="color:#059669;">346</div><div class="lbl">Total Orders</div></div></div>
        <div class="col-6 col-md-3"><div class="ec-stat"><div class="val" style="color:#d97706;">924</div><div class="lbl">Products Sold</div></div></div>
        <div class="col-6 col-md-3"><div class="ec-stat"><div class="val" style="color:#db2777;">4</div><div class="lbl">Platforms</div></div></div>
      </div>

      <h6 style="font-weight:600;margin-bottom:12px;"><i class="fas fa-plug text-primary me-1"></i>Connected Platforms</h6>
      <div class="row g-3 mb-4">
        ${platforms.map(p => `
          <div class="col-6 col-md-3">
            <div class="ec-platform-card" onclick="Ecommerce.currentPlatform='${p.key}';Ecommerce.render();">
              <i class="fab ${p.icon} fa-2x" style="color:${p.color};margin-bottom:8px;"></i>
              <h6 style="font-weight:600;">${p.name}</h6>
              <span class="badge bg-${p.connected?'success':'secondary'}">${p.connected?'Connected':'Not Connected'}</span>
              <div class="small text-muted mt-1">${p.orders} orders · ${p.revenue}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="d-flex gap-2 mb-3">
        <button class="btn btn-${this.currentView==='orders'?'primary':'outline-primary'} btn-sm" onclick="Ecommerce.currentView='orders';Ecommerce.render();">📦 Orders</button>
        <button class="btn btn-${this.currentView==='products'?'primary':'outline-primary'} btn-sm" onclick="Ecommerce.currentView='products';Ecommerce.render();">🏷️ Products</button>
        <button class="btn btn-${this.currentView==='settings'?'primary':'outline-primary'} btn-sm" onclick="Ecommerce.currentView='settings';Ecommerce.render();">⚙️ Settings</button>
      </div>

      ${this.currentView === 'orders' ? `
        <div class="ec-card">
          <h6>Recent Orders</h6>
          <div class="table-responsive">
            <table class="table table-sm">
              <thead><tr><th>Order ID</th><th>Customer</th><th>Platform</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                ${orders.map(o => `
                  <tr>
                    <td><strong>${o.id}</strong></td><td>${o.customer}</td>
                    <td><i class="fab fa-${o.platform.toLowerCase()==='shopify'?'shopify':o.platform.toLowerCase()==='woocommerce'?'wordpress':o.platform.toLowerCase()==='wix'?'wix':'shopify'} me-1"></i>${o.platform}</td>
                    <td>${o.items}</td><td>${o.total}</td>
                    <td><span class="ec-status ${o.status}">${o.status}</span></td><td>${o.date}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : this.currentView === 'products' ? `
        <div class="ec-card">
          <h6>Product Catalog</h6>
          <div class="table-responsive">
            <table class="table table-sm">
              <thead><tr><th>Product</th><th>Platform</th><th>Price</th><th>Stock</th><th>Sold</th><th>Status</th></tr></thead>
              <tbody>
                ${products.map(p => `
                  <tr>
                    <td><strong>${p.name}</strong></td>
                    <td><i class="fab fa-${p.platform.toLowerCase()==='shopify'?'shopify':p.platform.toLowerCase()==='woocommerce'?'wordpress':'shopify'} me-1"></i>${p.platform}</td>
                    <td>${p.price}</td><td>${p.stock}</td><td>${p.sold}</td>
                    <td><span class="ec-status ${p.status}">${p.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : `
        <div class="ec-card">
          <h6>Platform Settings</h6>
          <p class="text-muted small">Connect your e‑commerce platforms to sync orders automatically.</p>
          ${platforms.map(p => `
            <div class="d-flex justify-content-between align-items-center border rounded p-3 mb-2">
              <div><i class="fab ${p.icon} me-2" style="color:${p.color};"></i><strong>${p.name}</strong></div>
              <div>
                ${p.connected ? '<span class="text-success">✓ Connected</span>' : `<button class="btn btn-sm btn-outline-primary" onclick="Ecommerce.connectPlatform('${p.key}')">Connect</button>`}
              </div>
            </div>
          `).join('')}
          <hr>
          <h6>WhatsApp Order Notifications</h6>
          <div class="form-check"><input class="form-check-input" type="checkbox" id="ecOrderConfirm" checked><label class="form-check-label small">Send order confirmation via WhatsApp</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" id="ecShipping" checked><label class="form-check-label small">Send shipping updates via WhatsApp</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" id="ecAbandoned"><label class="form-check-label small">Abandoned cart recovery via WhatsApp</label></div>
          <button class="btn btn-primary btn-sm mt-2" onclick="alert('Settings saved!')">Save Settings</button>
        </div>
      `}
    `;
    contentArea.innerHTML = html;
  },

  connectPlatform(platform) {
    const urls = {
      shopify: 'https://shopify.com/partners',
      woocommerce: 'https://woocommerce.com',
      wix: 'https://wix.com',
      dukaan: 'https://mydukaan.io'
    };
    prompt(`Connect ${platform}:\n\n1. Go to ${urls[platform]}\n2. Generate API key\n3. Paste API key here:`, '');
    if (confirm('API key saved! (Demo)')) {
      alert(`✅ ${platform} connected successfully!`);
    }
  }
};
