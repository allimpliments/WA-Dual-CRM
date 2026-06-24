(async () => {
  const doc = await db.collection('settings').doc('whatsapp').get();
  const config = doc.data();
  
  // बिना Template का सीधा मैसेज
  const payload = {
    messaging_product: 'whatsapp',
    to: '918269549932',
    type: 'text',
    text: { body: '👋 नमस्ते! यह आपके CRM से बिना Template के भेजा गया टेस्ट मैसेज है।' }
  };
  
  const res = await fetch(`https://graph.facebook.com/v22.0/${config.phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  const result = await res.json();
  alert(res.ok ? '✅ भेज दिया!' : '❌ ' + JSON.stringify(result.error));
})();
