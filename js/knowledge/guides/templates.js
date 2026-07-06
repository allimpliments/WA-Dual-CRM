<div style="font-family:system-ui,sans-serif;color:#1e293b;line-height:1.7;max-width:800px;margin:0 auto;">
  
  <!-- Module Header -->
  <div style="background:linear-gradient(135deg,#4f46e5,#818cf8);border-radius:16px;padding:24px;color:#fff;margin-bottom:24px;box-shadow:0 8px 24px rgba(0,0,0,0.1);">
    <h4 style="margin:0;font-weight:800;font-size:20px;">📋 Templates — Complete User Guide</h4>
    <p style="opacity:0.9;font-size:13px;margin:6px 0 0;">Create, sync, submit & send WhatsApp message templates</p>
  </div>

  <!-- Overview -->
  <div style="background:#f0fdf4;border-left:4px solid #10b981;padding:16px;border-radius:8px;margin-bottom:20px;">
    <h5 style="margin:0 0 6px;color:#065f46;">📖 Overview</h5>
    <p style="margin:0;font-size:13px;"><strong>Kya Hai:</strong> Pre‑approved WhatsApp message formats. Bina template sirf 24hr reply, templates se 24/7 send.</p>
    <p style="margin:4px 0 0;font-size:13px;"><strong>Kaun Use Kare:</strong> Admin, Team Members</p>
  </div>

  <!-- Use Cases -->
  <h5 style="font-weight:700;color:#1e293b;">🎯 Use Cases</h5>
  <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;">
    <span style="background:#e0e7ff;color:#4f46e5;padding:4px 12px;border-radius:20px;font-size:12px;">Welcome message</span>
    <span style="background:#d1fae5;color:#065f46;padding:4px 12px;border-radius:20px;font-size:12px;">Order confirmation</span>
    <span style="background:#fef3c7;color:#92400e;padding:4px 12px;border-radius:20px;font-size:12px;">Payment reminder</span>
    <span style="background:#fce7f3;color:#9d174d;padding:4px 12px;border-radius:20px;font-size:12px;">Promotional offer</span>
  </div>

  <!-- Step-by-Step -->
  <h5 style="font-weight:700;color:#1e293b;">🚀 Step‑by‑Step Guide</h5>
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.02);">
    <h6 style="margin:0 0 4px;color:#4f46e5;">Step 1: Templates Page Kholna</h6>
    <p style="font-size:13px;color:#6b7280;margin:0;"><strong>Kahan Click:</strong> Header → <strong>Templates</strong>.<br><strong>Kya Hoga:</strong> 3 tabs (All, Active, Pending) ke saath list page khulega.</p>
  </div>
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.02);">
    <h6 style="margin:0 0 4px;color:#4f46e5;">Step 2: Meta Se Sync Karna</h6>
    <p style="font-size:13px;color:#6b7280;margin:0;"><strong>Kahan Click:</strong> <strong>Sync from Meta</strong> button.<br><strong>Kya Hoga:</strong> Meta ke saare templates Firestore mein fetch honge aur list update hogi.</p>
  </div>
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.02);">
    <h6 style="margin:0 0 4px;color:#4f46e5;">Step 3: Naya Template Banana</h6>
    <p style="font-size:13px;color:#6b7280;margin:0;"><strong>Kahan Click:</strong> <strong>Create</strong> button.<br>Form: Name (no spaces), Category, Language, Header, Body (variables), Footer, Buttons.</p>
  </div>
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.02);">
    <h6 style="margin:0 0 4px;color:#4f46e5;">Step 4: Meta Ko Submit Karna</h6>
    <p style="font-size:13px;color:#6b7280;margin:0;"><strong>Submit to Meta</strong> → 24‑48 hr approval. Status Pending → Approved/Rejected.</p>
  </div>
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.02);">
    <h6 style="margin:0 0 4px;color:#4f46e5;">Step 5: Send Karna</h6>
    <p style="font-size:13px;color:#6b7280;margin:0;">Template click → <strong>Send via WhatsApp</strong> → Phone number prompt.</p>
  </div>

  <!-- Features Deep Dive -->
  <h5 style="font-weight:700;color:#1e293b;">⚙️ Features Deep Dive</h5>
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:12px;">
    <h6 style="color:#4f46e5;">Variables</h6>
    <p style="font-size:13px;color:#6b7280;">`{first_name}` jaise placeholders send time pe real data se replace hote hain.</p>
    <p style="font-size:13px;color:#6b7280;"><strong>Pro Tip:</strong> Ek hi template multiple contacts ke liye personalise karo.</p>
  </div>

  <!-- Troubleshooting -->
  <h5 style="font-weight:700;color:#ef4444;">🔧 Troubleshooting</h5>
  <table style="width:100%;font-size:12px;border-collapse:collapse;margin-bottom:20px;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.02);">
    <tr style="background:#fef2f2;"><td style="padding:10px 12px;font-weight:600;">Sync button kaam nahi karta</td><td style="padding:10px;">WhatsApp token expired → Setup → WhatsApp → Token update</td></tr>
    <tr><td style="padding:10px 12px;font-weight:600;">Template rejected</td><td style="padding:10px;">Policy violation → Meta email check, content fix</td></tr>
    <tr style="background:#fef2f2;"><td style="padding:10px 12px;font-weight:600;">Send fail</td><td style="padding:10px;">Invalid phone → Country code (+91) lagao</td></tr>
  </table>

  <!-- FAQ -->
  <h5 style="font-weight:700;color:#1e293b;">❓ FAQ</h5>
  <div style="background:#f8fafc;border-radius:8px;padding:14px;margin-bottom:16px;">
    <p style="font-size:13px;"><strong>Q:</strong> Kitne templates free mein bana sakte hain?<br><strong>A:</strong> Unlimited. Meta koi limit nahi lagata.</p>
    <p style="font-size:13px;"><strong>Q:</strong> Approval kitna time leta hai?<br><strong>A:</strong> Usually 24‑48 hours.</p>
  </div>

  <!-- Best Practices -->
  <h5 style="font-weight:700;color:#1e293b;">📊 Best Practices</h5>
  <div style="background:#e7f3ff;border-radius:8px;padding:14px;">
    <ul style="font-size:13px;margin:0;padding-left:20px;">
      <li>Name meaningful rakho — `order_confirm` better than `temp1`.</li>
      <li>Send se pehle variables test karo.</li>
      <li>Utility category = 24hr approval, Marketing = 48hr.</li>
      <li>Footer mein opt‑out option rakho (compliance).</li>
    </ul>
  </div>

  <!-- Related Modules -->
  <h5 style="font-weight:700;color:#1e293b;margin-top:24px;">🔗 Related Modules</h5>
  <p style="font-size:13px;">Campaigns, Chats, Setup</p>

  <!-- Future Update Placeholder -->
  <div style="background:#fef3c7;border-radius:8px;padding:14px;margin-top:20px;text-align:center;color:#92400e;font-size:13px;">
    🖼️ <strong>Coming Soon:</strong> Step‑by‑step screenshots & video tutorials
  </div>
</div>
