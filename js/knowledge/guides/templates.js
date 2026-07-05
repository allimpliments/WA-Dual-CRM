function(){return '<h4>Templates — User Guide</h4><h5>Overview</h5><p>WhatsApp Message Templates pre-approved message formats hain. Bina template sirf 24hr reply, templates se 24/7.</p><h5>Steps</h5><p><b>1.</b> Header → Templates.<br><b>2.</b> Sync from Meta.<br><b>3.</b> Create button → Fill form.<br><b>4.</b> Submit to Meta.<br><b>5.</b> Send via WhatsApp.</p><h5>Troubleshooting</h5><p>Sync fail = Token expired. Rejected = Policy violation.</p>';}
function(){return `
<div style="font-family:system-ui,sans-serif;color:#1e293b;line-height:1.7;">
  <div style="background:linear-gradient(135deg,#4f46e5,#818cf8);border-radius:12px;padding:20px;color:#fff;margin-bottom:20px;">
    <h4 style="margin:0;font-weight:700;">📋 Templates — Complete User Guide</h4>
    <p style="opacity:0.9;font-size:13px;margin:4px 0 0;">WhatsApp message templates: create, sync, submit & send</p>
  </div>

  <div style="background:#f0fdf4;border-left:4px solid #10b981;padding:14px;border-radius:8px;margin-bottom:16px;">
    <strong>💡 Overview</strong>
    <p style="margin:4px 0;font-size:13px;">WhatsApp Message Templates pre-approved message formats hain jo Meta guidelines follow karte hain. Bina template sirf <b>24 hours</b> ke andar reply kar sakte ho. Templates se <b>24/7 kabhi bhi</b> message bhej sakte ho.</p>
  </div>

  <h5 style="color:#4f46e5;font-weight:700;">📝 Step-by-Step Guide</h5>

  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:12px;">
    <strong>Step 1: Templates Page Kholna</strong>
    <p style="font-size:13px;color:#6b7280;">Header mein <b>Templates</b> click karo. 3 tabs dikhenge: <span class="badge bg-primary">All Templates</span> <span class="badge bg-success">Active</span> <span class="badge bg-warning">Pending</span></p>
  </div>

  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:12px;">
    <strong>Step 2: Meta Se Sync Karna</strong>
    <p style="font-size:13px;color:#6b7280;"><b>Sync from Meta</b> button click karo. Meta se sabhi templates fetch ho kar list mein dikhenge. <span style="color:#ef4444;">Setup mein WhatsApp token valid hona chahiye.</span></p>
  </div>

  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:12px;">
    <strong>Step 3: Naya Template Banana</strong>
    <p style="font-size:13px;color:#6b7280;"><b>Create</b> button click karo. Form fill karo:</p>
    <table style="width:100%;font-size:12px;border-collapse:collapse;">
      <tr style="background:#f9fafb;"><td style="padding:8px;font-weight:600;">Template Name</td><td style="padding:8px;">Unique, no spaces (e.g., welcome_msg)</td></tr>
      <tr><td style="padding:8px;font-weight:600;">Category</td><td style="padding:8px;">UTILITY / MARKETING / AUTHENTICATION</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:8px;font-weight:600;">Language</td><td style="padding:8px;">Select your language</td></tr>
      <tr><td style="padding:8px;font-weight:600;">Body</td><td style="padding:8px;">Message text. Use <code>{first_name}</code> for variables</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:8px;font-weight:600;">Footer</td><td style="padding:8px;">Optional text (e.g., Reply STOP to unsubscribe)</td></tr>
      <tr><td style="padding:8px;font-weight:600;">Buttons</td><td style="padding:8px;">Visit Website / Call / Quick Reply</td></tr>
    </table>
  </div>

  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:12px;">
    <strong>Step 4: Meta Ko Submit Karna</strong>
    <p style="font-size:13px;color:#6b7280;">Form save ke baad <b>Submit to Meta</b> button click karo. Status <b>Pending</b> ho jayega. Meta <b>24-48 hours</b> mein review karega. Approved ya Rejected status update hoga.</p>
  </div>

  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:12px;">
    <strong>Step 5: Template Send Karna</strong>
    <p style="font-size:13px;color:#6b7280;">Approved template pe click karo → <b>Send via WhatsApp</b>. Phone number prompt mein number dalo → template send ho jayega.</p>
  </div>

  <h5 style="color:#ef4444;font-weight:700;">🔧 Troubleshooting</h5>
  <table style="width:100%;font-size:12px;border-collapse:collapse;margin-bottom:16px;">
    <tr style="background:#fef2f2;"><td style="padding:10px;font-weight:600;">Sync button kaam nahi kar raha</td><td style="padding:10px;">WhatsApp token expired → Setup → WhatsApp → Token update karo</td></tr>
    <tr><td style="padding:10px;font-weight:600;">Template rejected</td><td style="padding:10px;">Policy violation → Meta email check karo, content fix karo</td></tr>
    <tr style="background:#fef2f2;"><td style="padding:10px;font-weight:600;">Send fail</td><td style="padding:10px;">Phone number invalid → Country code (+91) ke saath dalo</td></tr>
  </table>

  <div style="background:#e7f3ff;border-radius:8px;padding:14px;">
    <strong>✨ Best Practices</strong>
    <ul style="font-size:13px;margin:8px 0 0;">
      <li>Template name meaningful rakho — <code>order_confirm</code> better than <code>temp1</code></li>
      <li>Variables <code>{first_name}</code> test karo send se pehle</li>
      <li>Marketing category = 48hr approval, Utility = 24hr</li>
      <li>Footer mein hamesha opt-out option rakho</li>
    </ul>
  </div>
</div>`;}
