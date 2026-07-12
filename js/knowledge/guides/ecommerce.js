// js/knowledge/guides/ecommerce.js — E‑commerce Integration Guide
const EcommerceGuide = {
  guideId: 'ecommerce',

  async render(context) {
    const { guide, userProgress = 0, isBookmarked = false, getAdjacentGuide } = context;
    contentArea.style.paddingTop = '60px';
    contentArea.style.background = '#f8fafc';
    if (userProgress === 0) { try { await this.markInProgress(); } catch (e) {} }
    const isCompleted = userProgress >= 100;
    const prevGuide = getAdjacentGuide ? getAdjacentGuide('prev') : null;
    const nextGuide = getAdjacentGuide ? getAdjacentGuide('next') : null;

    let html = `
      <style>
        .gd-wrap { max-width: 1100px; margin: 0 auto; padding: 0 16px; }
        .gd-back-row { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
        .gd-back-btn { padding: 9px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid #e2e8f0; background: #fff; color: #475569; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .gd-back-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }
        .gd-breadcrumb { font-size: 12px; color: #94a3b8; display: flex; align-items: center; gap: 6px; }
        .gd-breadcrumb span { cursor: pointer; transition: color 0.2s; } .gd-breadcrumb span:hover { color: #f97316; }
        .gd-hero { background: #fff; border-radius: 20px; padding: 36px 32px; margin-bottom: 24px; border: 1px solid #f1f5f9; position: relative; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #f97316, #ea580c, #f97316); }
        .gd-hero-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #fff; margin-bottom: 16px; background: linear-gradient(135deg, #f97316, #ea580c); }
        .gd-hero h3 { font-weight: 900; font-size: 28px; margin: 0 0 10px; color: #0f172a; line-height: 1.3; }
        .gd-hero p { color: #64748b; font-size: 15px; margin: 0; max-width: 700px; line-height: 1.7; }
        .gd-hero-meta { display: flex; gap: 18px; margin-top: 18px; flex-wrap: wrap; align-items: center; }
        .gd-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; } .gd-meta-item i { color: #f97316; font-size: 14px; }
        .gd-hero-actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
        .gd-btn { padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .gd-btn-primary { background: #f97316; color: #fff; } .gd-btn-primary:hover { background: #ea580c; transform: scale(1.03); }
        .gd-btn-outline { background: #fff; color: #f97316; border: 1px solid #f97316; } .gd-btn-outline:hover { background: #fff7ed; }
        .gd-btn-success { background: #10b981; color: #fff; } .gd-btn-success:hover { background: #059669; transform: scale(1.03); }
        .gd-btn-completed { background: #d1d5db; color: #fff; cursor: default; } .gd-btn-completed:hover { transform: none; }
        .gd-content-card { background: #fff; border-radius: 20px; padding: 32px; margin-bottom: 20px; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-content-card h4 { font-weight: 800; font-size: 20px; margin: 0 0 8px; color: #0f172a; }
        .gd-content-card .gd-subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
        .gd-overview { background: #fff7ed; border-radius: 14px; padding: 20px 24px; margin-bottom: 28px; border-left: 4px solid #f97316; }
        .gd-overview p { margin: 0; font-size: 14px; color: #7c2d12; line-height: 1.8; }
        .gd-section-title { font-weight: 800; font-size: 18px; color: #0f172a; margin: 28px 0 16px; display: flex; align-items: center; gap: 8px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9; }
        .gd-step { display: flex; gap: 16px; padding: 20px 0; border-bottom: 1px solid #f1f5f9; align-items: flex-start; }
        .gd-step:last-child { border-bottom: none; }
        .gd-step-num { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #f97316, #ea580c); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 17px; flex-shrink: 0; }
        .gd-step-content { flex: 1; } .gd-step-content h6 { font-weight: 700; font-size: 15px; margin: 0 0 4px; color: #0f172a; }
        .gd-step-content p { font-size: 14px; color: #475569; margin: 0; line-height: 1.7; }
        .gd-platform-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin: 14px 0; }
        .gd-platform-card { border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; background: #f8fafc; text-align: center; }
        .gd-platform-card i { font-size: 28px; margin-bottom: 8px; }
        .gd-platform-card h6 { font-weight: 700; font-size: 13px; margin: 0; } .gd-platform-card p { font-size: 11px; color: #64748b; margin: 2px 0 0; }
        .gd-tips-card { background: linear-gradient(135deg, #fef3c7, #fffbeb); border-radius: 16px; padding: 22px 26px; margin-top: 24px; border: 1px solid #fcd34d; }
        .gd-tips-card h5 { font-weight: 800; color: #92400e; margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
        .gd-tips-card ul { margin: 0; padding-left: 20px; } .gd-tips-card li { font-size: 13px; color: #a16207; margin-bottom: 6px; line-height: 1.6; } .gd-tips-card li:last-child { margin-bottom: 0; }
        .gd-related { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
        .gd-related-pill { padding: 9px 18px; border-radius: 20px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 13px; cursor: pointer; transition: 0.2s; color: #475569; display: inline-flex; align-items: center; gap: 6px; }
        .gd-related-pill:hover { background: #fff7ed; border-color: #f97316; color: #f97316; }
        .gd-upsell { background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 18px; padding: 28px 32px; margin-top: 28px; border: 1px solid #c7d2fe; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .gd-upsell h5 { font-weight: 800; color: #3730a3; margin: 0; font-size: 18px; } .gd-upsell p { color: #4f46e5; margin: 4px 0 0; font-size: 14px; }
        .gd-nav-btns { display: flex; justify-content: space-between; margin-top: 32px; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 768px) { .gd-hero { padding: 24px 18px; } .gd-hero h3 { font-size: 22px; } .gd-content-card { padding: 20px 16px; } .gd-step { flex-direction: column; gap: 10px; } .gd-platform-grid { grid-template-columns: 1fr 1fr; } .gd-upsell { flex-direction: column; text-align: center; } .gd-nav-btns { flex-direction: column; align-items: stretch; } }
      </style>

      <div class="gd-wrap">
        <div class="gd-back-row">
          <button class="gd-back-btn" onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();"><i class="fas fa-arrow-left"></i> Back to All Guides</button>
          <div class="gd-breadcrumb"><span onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();">📖 Platform Documentation</span><i class="fas fa-chevron-right" style="font-size:10px;"></i><span style="color:#f97316;font-weight:600;">E‑commerce Integration</span></div>
        </div>

        <div class="gd-hero">
          <div class="gd-hero-icon"><i class="fas fa-shopping-cart"></i></div>
          <h3>E‑commerce Integration — Sync Orders & Automate Follow-ups</h3>
          <p>Connect Shopify, WooCommerce, and other platforms. Sync orders automatically, recover abandoned carts via WhatsApp, and send personalized order updates that delight customers.</p>
          <div class="gd-hero-meta">
            <div class="gd-meta-item"><i class="fas fa-signal"></i> 🔴 Advanced</div>
            <div class="gd-meta-item"><i class="fas fa-clock"></i> 9 min read</div>
            <div class="gd-meta-item"><i class="fas fa-layer-group"></i> 5 Steps</div>
            <div class="gd-meta-item"><i class="fas fa-globe"></i> Updated: Jul 2026</div>
          </div>
          <div class="gd-hero-actions">
            ${isCompleted ? `<button class="gd-btn gd-btn-completed"><i class="fas fa-check-circle"></i> Completed ✓</button>` : `<button class="gd-btn gd-btn-success" onclick="EcommerceGuide.triggerComplete()"><i class="fas fa-check"></i> Mark as Complete</button>`}
            <button class="gd-btn gd-btn-outline" onclick="PlatformDocs.toggleBookmark('ecommerce');PlatformDocs.currentGuide='ecommerce';PlatformDocs.render();"><i class="fas ${isBookmarked ? 'fa-star' : 'fa-star'}"></i> ${isBookmarked ? 'Bookmarked' : 'Bookmark'}</button>
            <button class="gd-btn gd-btn-outline" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
          </div>
        </div>

        <div class="gd-content-card">
          <h4>🛒 Turn Your CRM into an E‑commerce Powerhouse</h4>
          <p class="gd-subtitle">Sync your store, automate order updates, recover lost sales, and build customer loyalty — all from one platform.</p>
          <div class="gd-overview"><p>Connect your e‑commerce store to the CRM and unlock powerful automation: <strong>orders sync in real-time</strong>, customers get <strong>WhatsApp order updates</strong> (confirmed → shipped → delivered), <strong>abandoned carts are recovered automatically</strong> (recover 15-25% of lost sales), and <strong>product recommendations</strong> are sent based on purchase history. Your CRM becomes the central hub for your entire e‑commerce operation.</p></div>

          <div class="gd-section-title"><i class="fas fa-store" style="color:#f97316;"></i> Supported Platforms</div>
          <div class="gd-platform-grid">
            <div class="gd-platform-card"><i class="fab fa-shopify" style="color:#96bf48;"></i><h6>Shopify</h6><p>One-click OAuth connect</p></div>
            <div class="gd-platform-card"><i class="fab fa-wordpress" style="color:#21759b;"></i><h6>WooCommerce</h6><p>Plugin + API key connect</p></div>
            <div class="gd-platform-card"><i class="fas fa-shopping-bag" style="color:#f97316;"></i><h6>Magento</h6><p>API integration</p></div>
            <div class="gd-platform-card"><i class="fas fa-code" style="color:#475569;"></i><h6>Custom API</h6><p>Connect any store</p></div>
          </div>

          <div class="gd-section-title"><i class="fas fa-list-ol" style="color:#f97316;"></i> Integration Steps</div>
          
          <div class="gd-step"><div class="gd-step-num">1</div><div class="gd-step-content"><h6>Connect Your Store</h6><p>Go to <strong>Settings → Integrations → E‑commerce</strong>. Choose your platform and authenticate: <strong>Shopify:</strong> One-click OAuth — log into your Shopify account and authorize. <strong>WooCommerce:</strong> Install our plugin, generate API keys in WooCommerce settings, paste into CRM. <strong>Magento:</strong> Generate API credentials, enter base URL + keys. <strong>Custom:</strong> Use our REST API or webhooks. Once connected, all your products, orders, and customers sync automatically. Test the connection before going live.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">2</div><div class="gd-step-content"><h6>Order Sync & Customer Matching</h6><p>All orders sync in <strong>real-time</strong>: Order number, Products purchased (SKU, name, quantity, price), Customer details (name, phone, email, shipping address), Order status (confirmed, processing, shipped, delivered, cancelled), Payment status (paid, pending, refunded). The CRM <strong>auto-matches</strong> customers by phone number or email — if they exist in your contacts, the order is linked to their profile. New customers are auto-created as contacts with source = store name.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">3</div><div class="gd-step-content"><h6>Abandoned Cart Recovery — Recover Lost Sales</h6><p>Set up the automated recovery sequence: <strong>1 hour after abandonment:</strong> "Hey {{name}}, you left something in your cart! Complete your order now and get free shipping: {{cart_link}}" <strong>24 hours later:</strong> "Still thinking about it? Here's 10% off to help you decide: {{discount_code}}" <strong>72 hours later:</strong> "Last chance! Your cart items are selling fast. Grab them before they're gone: {{cart_link}}" This sequence typically recovers <strong>15-25% of abandoned carts</strong> — pure revenue you would have lost otherwise.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">4</div><div class="gd-step-content"><h6>Order Updates via WhatsApp</h6><p>Automated WhatsApp notifications at every stage: <strong>Order Confirmed:</strong> "Thank you for your order #12345! We're preparing it now." <strong>Shipped:</strong> "Great news! Your order is on its way. Track it here: {{tracking_link}}" <strong>Out for Delivery:</strong> "Your package is out for delivery today! Keep an eye out for it." <strong>Delivered:</strong> "Your order has been delivered! We hope you love it. If you have a moment, please leave a review: {{review_link}}" Customers love real-time updates — this reduces "Where is my order?" inquiries by 70%.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">5</div><div class="gd-step-content"><h6>Product Recommendations & Loyalty</h6><p>Based on purchase history, send personalized recommendations: <strong>"Customers who bought X also loved Y — here's 10% off!"</strong> Set up segments: <strong>"VIP Customers"</strong> (purchased 3+ times) — send exclusive early-access offers, <strong>"High-Value"</strong> (spent > ₹10,000) — invite to loyalty program, <strong>"One-Time Buyers"</strong> — send "We miss you" with comeback discount after 60 days. Track <strong>ROI per campaign</strong> — see exactly how much revenue each WhatsApp message generates.</p></div></div>

          <div class="gd-tips-card">
            <h5><i class="fas fa-lightbulb" style="color:#f59e0b;"></i> Pro Tips</h5>
            <ul>
              <li><strong>Enable abandoned cart recovery immediately</strong> — this single automation often pays for the entire CRM subscription.</li>
              <li><strong>Use the product catalog feature</strong> to showcase products directly in WhatsApp chat — customers can browse without leaving the app.</li>
              <li><strong>Create a "VIP Customer" segment</strong> for 3+ time buyers — they're your most valuable customers, treat them specially.</li>
              <li><strong>Review order analytics monthly</strong> — identify top-selling products, best customers, and opportunities for cross-selling.</li>
            </ul>
          </div>

          <h5 style="font-weight:700;margin-top:28px;color:#0f172a;">🔗 Related Guides</h5>
          <div class="gd-related">
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('integrations')">🔌 Integrations Hub</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('campaigns')">📨 Campaign Creation</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('templates-flows')">🔄 Templates & Flows</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('analytics')">📈 Analytics & Reports</span>
          </div>
        </div>

        <div class="gd-upsell"><div><h5>🛒 Unlimited Orders & Cart Recovery</h5><p>Free plan: 100 orders/month. Pro: Unlimited orders, abandoned cart automation, and product recommendations via WhatsApp.</p></div><button class="gd-btn gd-btn-primary" onclick="Plan.render()"><i class="fas fa-crown"></i> Scale Your E‑commerce</button></div>

        <div class="gd-nav-btns">
          <div>${prevGuide ? `<button class="gd-btn gd-btn-outline" onclick="PlatformDocs.openGuide('${prevGuide.id}')"><i class="fas fa-arrow-left"></i> Previous: ${prevGuide.title}</button>` : ''}</div>
          <div>${nextGuide ? `<button class="gd-btn gd-btn-primary" onclick="PlatformDocs.openGuide('${nextGuide.id}')">Next: ${nextGuide.title} <i class="fas fa-arrow-right"></i></button>` : ''}</div>
        </div>
      </div>
    `;
    contentArea.innerHTML = html;
    contentArea.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  triggerComplete() {
    PlatformDocs.markComplete('ecommerce');
    PlatformDocs.currentGuide = 'ecommerce';
    PlatformDocs.render();
    if (typeof showToast === 'function') showToast('✅ Guide completed!', 'success');
  },

  async markInProgress() {
    try {
      if (!window.currentUser?.uid) return;
      const docRef = db.collection('user_progress').doc(window.currentUser.uid);
      const doc = await docRef.get();
      let pg = {};
      if (doc.exists && doc.data().platformGuides) pg = doc.data().platformGuides;
      if (!pg['ecommerce'] || pg['ecommerce'] < 10) {
        pg['ecommerce'] = 10;
        await docRef.set({ platformGuides: pg, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    } catch (e) { console.error('Progress error:', e); }
  }
};
window.EcommerceGuide = EcommerceGuide;