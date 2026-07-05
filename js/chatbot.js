// js/chatbot.js — Updated with Free Gemini API Support
const Chatbot = {
  // ... saara existing code same rahega ...
  // Sirf testAI() function update karo:

  async testAI() {
    const apiKey = document.getElementById('aiApiKey').value.trim();
    const useProvider = document.getElementById('aiProvider')?.value || 'gemini';
    
    if (!apiKey) return alert('Enter API Key first!');
    
    const testMsg = prompt('Enter test message:');
    if (!testMsg) return;

    document.getElementById('aiTestResult').innerHTML = '<span class="text-info">Thinking...</span>';

    try {
      const aiDoc = await db.collection('settings').doc('chatbot').get();
      const ai = aiDoc.data() || {};
      let reply = '';

      if (useProvider === 'gemini') {
        // Google Gemini API (FREE)
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are ${ai.botName||'Support Bot'} for ${ai.businessName||'a business'}. ${ai.businessInfo||'Keep replies short and helpful.'} Reply in the same language as the user.\n\nUser: ${testMsg}`
              }]
            }]
          })
        });
        const data = await res.json();
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
      } else if (useProvider === 'groq') {
        // Groq API (FREE tier)
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: `You are ${ai.botName||'Support Bot'} for ${ai.businessName||'a business'}. Keep replies short.` },
              { role: 'user', content: testMsg }
            ],
            max_tokens: 150
          })
        });
        const data = await res.json();
        reply = data.choices?.[0]?.message?.content || 'No response';
      } else if (useProvider === 'openai') {
        // Original OpenAI (paid)
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: ai.model || 'gpt-4o-mini',
            max_tokens: ai.maxTokens || 150,
            messages: [
              { role: 'system', content: `You are ${ai.botName||'Support Bot'} for ${ai.businessName||'a business'}. Keep replies short.` },
              { role: 'user', content: testMsg }
            ]
          })
        });
        const data = await res.json();
        reply = data.choices?.[0]?.message?.content || 'No response';
      }

      document.getElementById('aiTestResult').innerHTML = `
        <div class="alert alert-success py-1 px-2 mt-1">
          <strong>AI (${useProvider}):</strong> ${reply}
        </div>`;
    } catch (err) {
      document.getElementById('aiTestResult').innerHTML = `
        <div class="alert alert-danger py-1 px-2 mt-1">
          Error: ${err.message}
        </div>`;
    }
  }
};
