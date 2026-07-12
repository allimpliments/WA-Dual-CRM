// js/knowledge/guides/chatbot.js — AI Chatbot Setup Guide
const ChatbotGuide = {
  guideId: 'chatbot',

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
        .gd-breadcrumb span { cursor: pointer; transition: color 0.2s; } .gd-breadcrumb span:hover { color: #14b8a6; }
        .gd-hero { background: #fff; border-radius: 20px; padding: 36px 32px; margin-bottom: 24px; border: 1px solid #f1f5f9; position: relative; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #14b8a6, #0d9488, #14b8a6); }
        .gd-hero-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #fff; margin-bottom: 16px; background: linear-gradient(135deg, #14b8a6, #0d9488); }
        .gd-hero h3 { font-weight: 900; font-size: 28px; margin: 0 0 10px; color: #0f172a; line-height: 1.3; }
        .gd-hero p { color: #64748b; font-size: 15px; margin: 0; max-width: 700px; line-height: 1.7; }
        .gd-hero-meta { display: flex; gap: 18px; margin-top: 18px; flex-wrap: wrap; align-items: center; }
        .gd-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; } .gd-meta-item i { color: #14b8a6; font-size: 14px; }
        .gd-hero-actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
        .gd-btn { padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .gd-btn-primary { background: #14b8a6; color: #fff; } .gd-btn-primary:hover { background: #0d9488; transform: scale(1.03); }
        .gd-btn-outline { background: #fff; color: #14b8a6; border: 1px solid #14b8a6; } .gd-btn-outline:hover { background: #f0fdfa; }
        .gd-btn-success { background: #10b981; color: #fff; } .gd-btn-success:hover { background: #059669; transform: scale(1.03); }
        .gd-btn-completed { background: #d1d5db; color: #fff; cursor: default; } .gd-btn-completed:hover { transform: none; }
        .gd-content-card { background: #fff; border-radius: 20px; padding: 32px; margin-bottom: 20px; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .gd-content-card h4 { font-weight: 800; font-size: 20px; margin: 0 0 8px; color: #0f172a; }
        .gd-content-card .gd-subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
        .gd-overview { background: #f0fdfa; border-radius: 14px; padding: 20px 24px; margin-bottom: 28px; border-left: 4px solid #14b8a6; }
        .gd-overview p { margin: 0; font-size: 14px; color: #134e4a; line-height: 1.8; }
        .gd-section-title { font-weight: 800; font-size: 18px; color: #0f172a; margin: 28px 0 16px; display: flex; align-items: center; gap: 8px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9; }
        .gd-step { display: flex; gap: 16px; padding: 20px 0; border-bottom: 1px solid #f1f5f9; align-items: flex-start; }
        .gd-step:last-child { border-bottom: none; }
        .gd-step-num { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #14b8a6, #0d9488); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 17px; flex-shrink: 0; }
        .gd-step-content { flex: 1; } .gd-step-content h6 { font-weight: 700; font-size: 15px; margin: 0 0 4px; color: #0f172a; }
        .gd-step-content p { font-size: 14px; color: #475569; margin: 0; line-height: 1.7; }
        .gd-model-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin: 14px 0; }
        .gd-model-card { border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; background: #f8fafc; }
        .gd-model-card h6 { font-weight: 700; font-size: 13px; margin: 0 0 4px; } .gd-model-card p { font-size: 11px; color: #64748b; margin: 0; line-height: 1.5; }
        .gd-tips-card { background: linear-gradient(135deg, #fef3c7, #fffbeb); border-radius: 16px; padding: 22px 26px; margin-top: 24px; border: 1px solid #fcd34d; }
        .gd-tips-card h5 { font-weight: 800; color: #92400e; margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
        .gd-tips-card ul { margin: 0; padding-left: 20px; } .gd-tips-card li { font-size: 13px; color: #a16207; margin-bottom: 6px; line-height: 1.6; } .gd-tips-card li:last-child { margin-bottom: 0; }
        .gd-related { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
        .gd-related-pill { padding: 9px 18px; border-radius: 20px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 13px; cursor: pointer; transition: 0.2s; color: #475569; display: inline-flex; align-items: center; gap: 6px; }
        .gd-related-pill:hover { background: #f0fdfa; border-color: #14b8a6; color: #14b8a6; }
        .gd-upsell { background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 18px; padding: 28px 32px; margin-top: 28px; border: 1px solid #c7d2fe; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .gd-upsell h5 { font-weight: 800; color: #3730a3; margin: 0; font-size: 18px; } .gd-upsell p { color: #4f46e5; margin: 4px 0 0; font-size: 14px; }
        .gd-nav-btns { display: flex; justify-content: space-between; margin-top: 32px; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 768px) { .gd-hero { padding: 24px 18px; } .gd-hero h3 { font-size: 22px; } .gd-content-card { padding: 20px 16px; } .gd-step { flex-direction: column; gap: 10px; } .gd-model-grid { grid-template-columns: 1fr; } .gd-upsell { flex-direction: column; text-align: center; } .gd-nav-btns { flex-direction: column; align-items: stretch; } }
      </style>

      <div class="gd-wrap">
        <div class="gd-back-row">
          <button class="gd-back-btn" onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();"><i class="fas fa-arrow-left"></i> Back to All Guides</button>
          <div class="gd-breadcrumb"><span onclick="PlatformDocs.currentGuide=null;PlatformDocs.render();">📖 Platform Documentation</span><i class="fas fa-chevron-right" style="font-size:10px;"></i><span style="color:#14b8a6;font-weight:600;">AI Chatbot Setup</span></div>
        </div>

        <div class="gd-hero">
          <div class="gd-hero-icon"><i class="fas fa-robot"></i></div>
          <h3>AI Chatbot Setup — 24/7 Automated Support & Sales</h3>
          <p>Configure AI-powered chatbots using ChatGPT, Groq, and Gemini. Handle FAQs, qualify leads, book appointments, and provide instant support — all without human intervention.</p>
          <div class="gd-hero-meta">
            <div class="gd-meta-item"><i class="fas fa-signal"></i> 🔴 Advanced</div>
            <div class="gd-meta-item"><i class="fas fa-clock"></i> 10 min read</div>
            <div class="gd-meta-item"><i class="fas fa-layer-group"></i> 5 Steps</div>
            <div class="gd-meta-item"><i class="fas fa-globe"></i> Updated: Jul 2026</div>
          </div>
          <div class="gd-hero-actions">
            ${isCompleted ? `<button class="gd-btn gd-btn-completed"><i class="fas fa-check-circle"></i> Completed ✓</button>` : `<button class="gd-btn gd-btn-success" onclick="ChatbotGuide.triggerComplete()"><i class="fas fa-check"></i> Mark as Complete</button>`}
            <button class="gd-btn gd-btn-outline" onclick="PlatformDocs.toggleBookmark('chatbot');PlatformDocs.currentGuide='chatbot';PlatformDocs.render();"><i class="fas ${isBookmarked ? 'fa-star' : 'fa-star'}"></i> ${isBookmarked ? 'Bookmarked' : 'Bookmark'}</button>
            <button class="gd-btn gd-btn-outline" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
          </div>
        </div>

        <div class="gd-content-card">
          <h4>🤖 Your 24/7 AI Assistant</h4>
          <p class="gd-subtitle">AI chatbots never sleep. They handle 80% of customer queries automatically — freeing your team for high-value work.</p>
          <div class="gd-overview"><p>AI chatbots can handle <strong>FAQs, lead qualification, appointment booking, product recommendations, and basic support</strong> — all without a human agent. By automating routine conversations, you free up your team to focus on complex queries and closing deals. Plus, customers get <strong>instant responses 24/7</strong> — no more "We'll get back to you during business hours."</p></div>

          <div class="gd-section-title"><i class="fas fa-brain" style="color:#14b8a6;"></i> Choose Your AI Model</div>
          <div class="gd-model-grid">
            <div class="gd-model-card"><h6>🧠 ChatGPT (OpenAI)</h6><p>Most advanced reasoning. Best for complex conversations. Supports GPT-3.5 and GPT-4.</p></div>
            <div class="gd-model-card"><h6>⚡ Groq</h6><p>Fastest response time. Best for high-volume, simple queries. Lower cost per response.</p></div>
            <div class="gd-model-card"><h6>🌐 Gemini (Google)</h6><p>Best for multilingual support. Strong at understanding context across 40+ languages.</p></div>
          </div>

          <div class="gd-section-title"><i class="fas fa-list-ol" style="color:#14b8a6;"></i> Chatbot Setup Steps</div>
          
          <div class="gd-step"><div class="gd-step-num">1</div><div class="gd-step-content"><h6>Knowledge Base Training</h6><p>Feed your chatbot with information it needs to answer accurately: <strong>FAQ documents</strong> (upload PDFs, URLs, or paste text — common questions about pricing, features, policies), <strong>Product details</strong> (descriptions, specifications, pricing), <strong>Business information</strong> (hours, location, contact details, team bios), <strong>Policies</strong> (return policy, privacy policy, terms of service). The AI uses this knowledge base to generate accurate, contextual responses. Update anytime — changes reflect instantly.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">2</div><div class="gd-step-content"><h6>Conversation Flow Design</h6><p>Define how your chatbot behaves: <strong>Greeting message:</strong> "Hello! I'm [Bot Name], your virtual assistant. How can I help you today? You can ask me about pricing, features, or book a demo." <strong>Fallback responses:</strong> When AI doesn't know the answer — "I'm not sure about that. Let me connect you with a human agent who can help." <strong>Handoff triggers:</strong> When to transfer to human — keywords like "manager", "complaint", "refund", "urgent", or when AI confidence < 70%. <strong>Lead qualification questions:</strong> "Before I connect you, may I know your name and what you're looking for?"</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">3</div><div class="gd-step-content"><h6>Channel Activation</h6><p>Activate your chatbot on multiple channels: <strong>WhatsApp</strong> (your business number — customers message and get instant AI replies), <strong>Website widget</strong> (floating chat bubble on your site — embed with one line of code), <strong>Instagram DM</strong> (auto-reply to direct messages), <strong>Facebook Messenger</strong> (auto-reply on your page). Choose <strong>different behavior per channel</strong> if needed: WhatsApp can be more casual, website widget more formal. Toggle chatbot on/off per channel anytime.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">4</div><div class="gd-step-content"><h6>Actions & Integrations</h6><p>Go beyond just answering questions — let your chatbot <strong>take actions:</strong> <strong>Book appointments</strong> (check agent availability and schedule directly), <strong>Create leads</strong> (capture name, phone, and requirement → creates lead in CRM), <strong>Create tickets</strong> (for support issues that need human follow-up), <strong>Send documents</strong> (share PDFs, brochures, price lists automatically), <strong>Check order status</strong> (if integrated with e‑commerce). Each action is configurable — enable only what makes sense for your business.</p></div></div>
          
          <div class="gd-step"><div class="gd-step-num">5</div><div class="gd-step-content"><h6>Monitor, Review & Improve</h6><p>The chatbot gets smarter over time — but only if you review and train it. <strong>Review conversations:</strong> See every chatbot interaction — what it answered correctly, where it struggled, what questions it couldn't answer. <strong>Identify gaps:</strong> Add missing information to the knowledge base. <strong>Improve responses:</strong> Edit fallback messages, adjust handoff triggers, fine-tune the greeting. <strong>Track metrics:</strong> Conversations handled, handoff rate (goal: < 20%), customer satisfaction (post-chat survey: 😊 😐 😞), response time (goal: < 3 seconds).</p></div></div>

          <div class="gd-tips-card">
            <h5><i class="fas fa-lightbulb" style="color:#f59e0b;"></i> Pro Tips</h5>
            <ul>
              <li><strong>Always include a "Talk to Human" option</strong> — chatbots handle 80% of queries, but humans are essential for the complex 20%.</li>
              <li><strong>Train on your top 20 FAQs first</strong> — this alone covers 90% of customer queries and gives immediate ROI.</li>
              <li><strong>Set the chatbot personality:</strong> Professional for B2B, Friendly for B2C, Funny for lifestyle brands — match your brand voice.</li>
              <li><strong>Start with Groq if you have high volume</strong> — it's the most cost-effective for simple FAQ handling.</li>
            </ul>
          </div>

          <h5 style="font-weight:700;margin-top:28px;color:#0f172a;">🔗 Related Guides</h5>
          <div class="gd-related">
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('chats')">💬 WhatsApp Chat Setup</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('templates-flows')">🔄 Templates & Flows</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('integrations')">🔌 Integrations Hub</span>
            <span class="gd-related-pill" onclick="PlatformDocs.openGuide('appointments')">📅 Appointment System</span>
          </div>
        </div>

        <div class="gd-upsell"><div><h5>🤖 More AI Credits & Advanced Models</h5><p>Free plan: 100 AI responses/month. Pro: 10,000+ responses, GPT-4 access, custom training on your data.</p></div><button class="gd-btn gd-btn-primary" onclick="Plan.render()"><i class="fas fa-crown"></i> Get More AI Credits</button></div>

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
    PlatformDocs.markComplete('chatbot');
    PlatformDocs.currentGuide = 'chatbot';
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
      if (!pg['chatbot'] || pg['chatbot'] < 10) {
        pg['chatbot'] = 10;
        await docRef.set({ platformGuides: pg, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    } catch (e) { console.error('Progress error:', e); }
  }
};
window.ChatbotGuide = ChatbotGuide;