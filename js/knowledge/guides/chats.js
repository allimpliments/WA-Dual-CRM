function(){return `
<div style="font-family:system-ui,sans-serif;color:#1e293b;line-height:1.7;">
  <div style="background:linear-gradient(135deg,#25D366,#128C7E);border-radius:12px;padding:20px;color:#fff;margin-bottom:20px;">
    <h4 style="margin:0;font-weight:700;">💬 Chats — Complete User Guide</h4>
    <p style="opacity:0.9;font-size:13px;margin:4px 0 0;">Unified inbox: WhatsApp, FB Messenger, Instagram live chat</p>
  </div>

  <h5 style="color:#25D366;font-weight:700;">📱 WhatsApp Chat (LIVE)</h5>
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:12px;">
    <strong>Send Message:</strong> Phone number + Message type → <b>Send</b> button
    <p style="font-size:13px;color:#6b7280;margin-top:4px;">WhatsApp API ke through real message bheja jayega. Firestore mein save hoga.</p>
    
    <strong style="display:block;margin-top:12px;">Real-Time Receive:</strong> Jab koi WhatsApp message bhejega, turant Chats tab mein auto-refresh hoga.
    
    <strong style="display:block;margin-top:12px;">AI Auto-Reply:</strong> Chatbot page pe AI enable karo. Worker + Groq AI automatically incoming messages ka reply karega. <b>Free forever.</b>
    
    <strong style="display:block;margin-top:12px;">Test AI:</strong> Chats → <b>Test AI Reply</b> → Test message type → AI ka reply dekho.
  </div>

  <h5 style="color:#25D366;font-weight:700;">📘 FB Messenger & Instagram</h5>
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:12px;">
    <p style="font-size:13px;color:#6b7280;">FB Messenger aur Instagram tabs <b>Meta Inbox</b> se connect hain. <b>Open Meta Inbox</b> button se direct messages manage karo.</p>
    <p style="font-size:13px;color:#059669;">Meta ki <b>free Automations</b> bhi available hain — keywords, away messages, greetings.</p>
  </div>

  <h5 style="color:#ef4444;font-weight:700;">🔧 Troubleshooting</h5>
  <table style="width:100%;font-size:12px;border-collapse:collapse;margin-bottom:16px;">
    <tr style="background:#fef2f2;"><td style="padding:10px;font-weight:600;">Messages update nahi ho rahe</td><td style="padding:10px;">Page refresh karo (Ctrl+R)</td></tr>
    <tr><td style="padding:10px;font-weight:600;">Send fail ho raha</td><td style="padding:10px;">Setup → WhatsApp token check karo</td></tr>
    <tr style="background:#fef2f2;"><td style="padding:10px;font-weight:600;">AI reply nahi aa raha</td><td style="padding:10px;">Chatbot settings → Enable AI Fallback ON</td></tr>
  </table>
</div>`;}
