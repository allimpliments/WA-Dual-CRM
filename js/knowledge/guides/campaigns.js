function(){return `
<div style="font-family:system-ui,sans-serif;color:#1e293b;line-height:1.7;">
  <div style="background:linear-gradient(135deg,#f59e0b,#fbbf24);border-radius:12px;padding:20px;color:#fff;margin-bottom:20px;">
    <h4 style="margin:0;font-weight:700;">📢 Campaigns — Complete User Guide</h4>
    <p style="opacity:0.9;font-size:13px;margin:4px 0 0;">Bulk & Drip campaigns: send thousands of messages on autopilot</p>
  </div>

  <div style="background:#f0fdf4;border-left:4px solid #10b981;padding:14px;border-radius:8px;margin-bottom:16px;">
    <strong>💡 Overview</strong>
    <p style="margin:4px 0;font-size:13px;">Campaigns module se ek saath <b>hazaaron contacts</b> ko WhatsApp messages bhej sakte ho. Do types hain: <b>Bulk</b> (ek baar send) aur <b>Drip</b> (step-by-step auto sequence).</p>
  </div>

  <h5 style="color:#f59e0b;font-weight:700;">📦 Bulk Campaign</h5>
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:12px;">
    <strong>Kahan Click:</strong> Campaigns → <b>Bulk Campaigns</b> → <b>New Bulk Campaign</b>
    <ol style="font-size:13px;color:#6b7280;margin-top:8px;">
      <li><b>Campaign Name</b> — e.g., "Summer Sale 2026"</li>
      <li><b>Contact Group</b> — Select target group (ya All Contacts)</li>
      <li><b>Message</b> — Type message. Variables use karo: <code>{first_name}, {phone}</code></li>
      <li><b>Media</b> (optional) — Image/Video URL add karo</li>
      <li><b>Schedule</b> — Send Now ya Later (date + time select)</li>
      <li><b>Save & Send</b></li>
    </ol>
    <p style="font-size:12px;color:#059669;margin-top:8px;"><b>Result:</b> Selected group ke sabhi contacts ko message bheja jayega. Stats track honge: Sent, Delivered, Failed.</p>
  </div>

  <h5 style="color:#f59e0b;font-weight:700;">🔄 Drip Sequence</h5>
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:12px;">
    <strong>Kahan Click:</strong> Campaigns → <b>Drip Sequences</b> → <b>New Sequence</b>
    <p style="font-size:13px;color:#6b7280;">Example: <b>Day 1</b> Welcome → <b>Day 2</b> Product Info → <b>Day 3</b> Special Offer</p>
    <ol style="font-size:13px;color:#6b7280;margin-top:8px;">
      <li>Sequence Name</li>
      <li>Contact Group select</li>
      <li>Add Steps: har step mein <b>message + delay (hours)</b></li>
      <li>Start button → Auto sequence follow hoga</li>
    </ol>
  </div>

  <h5 style="color:#ef4444;font-weight:700;">🔧 Troubleshooting</h5>
  <table style="width:100%;font-size:12px;border-collapse:collapse;margin-bottom:16px;">
    <tr style="background:#fef2f2;"><td style="padding:10px;font-weight:600;">Messages send nahi hue</td><td style="padding:10px;">WhatsApp token check karo Setup mein</td></tr>
    <tr><td style="padding:10px;font-weight:600;">Drip sequence ruk gaya</td><td style="padding:10px;">Cloudflare Worker active hai check karo</td></tr>
    <tr style="background:#fef2f2;"><td style="padding:10px;font-weight:600;">Wrong contacts targeted</td><td style="padding:10px;">Group mein sahi contacts selected hain verify karo</td></tr>
  </table>

  <div style="background:#e7f3ff;border-radius:8px;padding:14px;">
    <strong>✨ Best Practices</strong>
    <ul style="font-size:13px;margin:8px 0 0;">
      <li>Pehle 1-2 test contacts pe try karo</li>
      <li>Drip delays kam se kam 1 hour rakho</li>
      <li>Variables <code>{first_name}</code> personalization ke liye must-use hain</li>
      <li>Campaign performance analytics tab se track karo</li>
    </ul>
  </div>
</div>`;}
