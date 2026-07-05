// js/knowledge/platform.js — Platform Mastery with All Module Guides
(function(Knowledge, contentArea, db, firebase) {

  const guides = [
    {
      title: '11 Avatar CRM — Complete System Guide',
      description: 'End-to-end walkthrough covering every module architecture, data flow patterns, API integration points, and best practices for optimal configuration.',
      sections: 12,
      difficulty: 'Intermediate',
      lastUpdated: 'July 2026',
      icon: 'fa-cube',
      color: '#4f46e5',
      chapters: ['Architecture Overview', 'Dashboard Configuration', 'Lead Pipeline Setup', 'Campaign Orchestration', 'Chatbot Integration', 'Form Builder Deep Dive', 'Social Media Connect', 'Analytics Framework', 'Team Management', 'Security & Permissions', 'Backup & Recovery', 'Performance Tuning']
    },
    {
      title: 'WhatsApp Business API — Complete Setup',
      description: 'Step-by-step Meta Business verification process, phone number registration, webhook configuration patterns, message template submission workflow, and production deployment checklist.',
      sections: 8,
      difficulty: 'Advanced',
      lastUpdated: 'June 2026',
      icon: 'fa-plug',
      color: '#059669',
      chapters: ['Meta Business Account', 'Phone Number Registration', 'Webhook Configuration', 'Template Submission', 'Production Checklist', 'Error Handling', 'Rate Limiting', 'Compliance Guide']
    },
    {
      title: 'Chatbot Architecture & Best Practices',
      description: 'Design principles for conversational AI systems. Intent mapping strategies, fallback handling patterns, multi-turn dialogue design, context management, and performance optimization.',
      sections: 10,
      difficulty: 'Advanced',
      lastUpdated: 'July 2026',
      icon: 'fa-brain',
      color: '#d97706',
      chapters: ['Intent Mapping', 'Fallback Strategies', 'Multi-Turn Dialogue', 'Context Management', 'Performance Optimization', 'Testing Framework', 'Analytics Integration', 'A/B Testing Bots', 'Human Handoff', 'Continuous Learning']
    },
    {
      title: 'Campaign Optimization — Data-Driven Approach',
      description: 'A/B testing frameworks, audience segmentation strategies, send time optimization algorithms, message personalization techniques, and comprehensive analytics interpretation guide.',
      sections: 6,
      difficulty: 'Intermediate',
      lastUpdated: 'May 2026',
      icon: 'fa-chart-bar',
      color: '#db2777',
      chapters: ['A/B Testing Framework', 'Audience Segmentation', 'Send Time Optimization', 'Personalization Techniques', 'Analytics Dashboard', 'ROI Calculation']
    },
    {
      title: 'Templates — Complete User Guide',
      description: 'WhatsApp message templates: create, sync from Meta, submit for approval, use variables, configure buttons, and send to customers. Step-by-step with troubleshooting.',
      sections: 5,
      difficulty: 'Beginner',
      lastUpdated: 'July 2026',
      icon: 'fa-layer-group',
      color: '#4f46e5',
      chapters: ['Overview & Use Cases', 'Step-by-Step Guide', 'Features Deep Dive', 'Troubleshooting', 'Best Practices & FAQ'],
      content: `<div style="max-height:60vh;overflow-y:auto;padding:10px;">
        <h4>Templates — Complete User Guide</h4>
        <h5>Overview</h5>
        <p><strong>Kya Hai:</strong> WhatsApp Message Templates pre-approved message formats hain jo Meta ke guidelines ke according bane hote hain. Ye templates WhatsApp Business API ke through bheje jaate hain.</p>
        <p><strong>Kyun Use Karein:</strong> Bina template ke sirf 24 hours ke andar reply kar sakte ho. Templates se kabhi bhi message bhej sakte ho (24/7). Professional, consistent branding. Meta approved = delivery guarantee.</p>
        <p><strong>Kaun Use Kar Sakta Hai:</strong> Admin, Team Members</p>
        
        <h5>Use Cases</h5>
        <table class="table table-sm"><thead><tr><th>Scenario</th><th>Template Type</th></tr></thead><tbody>
        <tr><td>Naye customer ko welcome message</td><td>Welcome Template</td></tr>
        <tr><td>Order confirmation bhejna</td><td>Utility Template</td></tr>
        <tr><td>Payment reminder</td><td>Utility Template</td></tr>
        <tr><td>Festival offer promotion</td><td>Marketing Template</td></tr>
        <tr><td>OTP/Verification code</td><td>Authentication Template</td></tr>
        </tbody></table>

        <h5>Step-by-Step Guide</h5>
        <h6>Step 1: Templates Tab Kholna</h6>
        <p><strong>Kahan Click:</strong> Header → Templates</p>
        <p><strong>Kya Hoga:</strong> Template list page khulega jahan 3 tabs hain: All Templates, Active, Pending</p>
        
        <h6>Step 2: Meta Se Templates Sync Karna</h6>
        <p><strong>Kahan Click:</strong> Templates page → Sync from Meta button</p>
        <p><strong>Kya Hoga:</strong> Meta ke server se tumhare sabhi templates fetch honge, Firestore mein save honge, list auto-refresh hogi.</p>
        
        <h6>Step 3: Naya Template Banana</h6>
        <p><strong>Kahan Click:</strong> Templates page → Create button</p>
        <table class="table table-sm"><thead><tr><th>Field</th><th>Kya Bharna Hai</th></tr></thead><tbody>
        <tr><td>Template Name</td><td>Unique name (no spaces)</td></tr>
        <tr><td>Category</td><td>UTILITY / MARKETING / AUTHENTICATION</td></tr>
        <tr><td>Language</td><td>Select language</td></tr>
        <tr><td>Header Type</td><td>None / Text</td></tr>
        <tr><td>Body</td><td>Main message with variables</td></tr>
        <tr><td>Footer</td><td>Optional text</td></tr>
        <tr><td>Button Type</td><td>None / Visit Website / Call</td></tr>
        </tbody></table>
        
        <h6>Step 4: Template Submit Karna Meta Ko</h6>
        <p><strong>Kahan Click:</strong> Template Builder → Submit to Meta button</p>
        <p><strong>Kya Hoga:</strong> Template Meta API ke through submit hoga. Status "Pending" hoga. Meta 24-48 hours mein review karega.</p>
        
        <h6>Step 5: Template Send Karna</h6>
        <p><strong>Kahan Click:</strong> Templates list → Template pe click → Send via WhatsApp</p>
        <p><strong>Pro Tip:</strong> Templates directly Chats ya Campaigns se bhi bhej sakte ho.</p>

        <h5>Troubleshooting</h5>
        <table class="table table-sm"><thead><tr><th>Problem</th><th>Cause</th><th>Solution</th></tr></thead><tbody>
        <tr><td>Sync button kaam nahi kar raha</td><td>WhatsApp token expired</td><td>Setup → WhatsApp → Token update</td></tr>
        <tr><td>Template rejected</td><td>Policy violation</td><td>Meta email check, content fix</td></tr>
        <tr><td>Template send fail</td><td>Phone number invalid</td><td>Country code ke saath number dalo</td></tr>
        </tbody></table>

        <h5>Best Practices</h5>
        <ul><li>Template name meaningful rakho</li><li>Ek template baar use karo</li><li>Variables test karo</li><li>Category sahi select karo</li><li>Footer mein opt-out option rakho</li></ul>
      </div>`
    },
    {
      title: 'Campaigns — Complete User Guide',
      description: 'Bulk & Drip Campaigns: create, target contact groups, personalize messages, schedule, and track performance with detailed analytics.',
      sections: 6,
      difficulty: 'Intermediate',
      lastUpdated: 'July 2026',
      icon: 'fa-rocket',
      color: '#f59e0b',
      chapters: ['Overview', 'Bulk Campaigns', 'Drip Sequences', 'Targeting', 'Analytics', 'Troubleshooting'],
      content: `<div style="max-height:60vh;overflow-y:auto;padding:10px;">
        <h4>Campaigns — Complete User Guide</h4>
        <h5>Overview</h5>
        <p><strong>Kya Hai:</strong> Campaigns module se aap ek saath hazaaron contacts ko WhatsApp messages bhej sakte hain. Do types hain: Bulk (ek baar send) aur Drip (step-by-step sequence).</p>
        
        <h5>Bulk Campaigns</h5>
        <p><strong>Kahan Click:</strong> Campaigns → Bulk Campaigns → New Bulk Campaign</p>
        <p><strong>Steps:</strong></p>
        <ol><li>Campaign Name dalo</li><li>Contact Group select karo (ya All Contacts)</li><li>Message type karo (use variables like {first_name})</li><li>Schedule: Send Now ya Later</li><li>Save & Send</li></ol>
        <p><strong>Kya Hoga:</strong> Selected group ke sabhi contacts ko WhatsApp message bheja jayega. Stats: Sent, Delivered, Failed track honge.</p>

        <h5>Drip Sequences</h5>
        <p><strong>Kahan Click:</strong> Campaigns → Drip Sequences → New Sequence</p>
        <p><strong>Steps:</strong></p>
        <ol><li>Sequence Name dalo</li><li>Contact Group select karo</li><li>Steps add karo: Step 1 (0 hrs), Step 2 (24 hrs), Step 3 (48 hrs)...</li><li>Har step mein message + delay set karo</li><li>Start</li></ol>
        <p><strong>Kya Hoga:</strong> Contacts ko auto-sequence follow karega. Example: Day 1 Welcome, Day 2 Product Info, Day 3 Offer.</p>

        <h5>Troubleshooting</h5>
        <table class="table table-sm"><thead><tr><th>Problem</th><th>Solution</th></tr></thead><tbody>
        <tr><td>Messages send nahi hue</td><td>WhatsApp token check karo Setup mein</td></tr>
        <tr><td>Contacts ko message nahi gaya</td><td>Phone number format check karo (+91...)</td></tr>
        <tr><td>Drip sequence ruk gaya</td><td>Worker running hai check karo</td></tr>
        </tbody></table>

        <h5>Best Practices</h5>
        <ul><li>Pehle test contact pe try karo</li><li>Variables sahi se map karo</li><li>Drip delays realistic rakho (min 1 hour gap)</li><li>Campaign performance analytics track karo</li></ul>
      </div>`
    },
    {
      title: 'Chats — Complete User Guide',
      description: 'Unified live chat: WhatsApp, FB Messenger, Instagram. Send messages, real-time receive, AI auto-reply test, and search message history.',
      sections: 5,
      difficulty: 'Beginner',
      lastUpdated: 'July 2026',
      icon: 'fa-comments',
      color: '#25D366',
      chapters: ['Overview', 'WhatsApp Chat', 'Social Platforms', 'AI Auto-Reply', 'Troubleshooting'],
      content: `<div style="max-height:60vh;overflow-y:auto;padding:10px;">
        <h4>Chats — Complete User Guide</h4>
        <h5>Overview</h5>
        <p><strong>Kya Hai:</strong> Unified inbox jahan WhatsApp, Facebook Messenger, Instagram, LinkedIn, YouTube sab ek jagah dikhte hain.</p>
        
        <h5>WhatsApp Chat</h5>
        <p><strong>Send Message:</strong> Phone number + Message type karo → Send button</p>
        <p><strong>Real-Time Receive:</strong> Jab koi WhatsApp message bhejega, turant Chats tab mein dikhega (auto-refresh).</p>
        <p><strong>AI Auto-Reply:</strong> Chatbot page pe jaakar AI enable karo. Worker + Groq AI automatically incoming messages ka reply karega.</p>
        <p><strong>Test AI:</strong> Chats → Test AI Reply button → Test message type karo → AI ka reply dekho</p>

        <h5>Social Platforms (FB, IG)</h5>
        <p>FB Messenger aur Instagram tabs Meta Inbox se connect hain. Open Meta Inbox button se direct messages manage karo. Free Meta Automations bhi available hain.</p>
        
        <h5>Troubleshooting</h5>
        <table class="table table-sm"><thead><tr><th>Problem</th><th>Solution</th></tr></thead><tbody>
        <tr><td>Messages real-time update nahi ho rahe</td><td>Page refresh karo</td></tr>
        <tr><td>Send fail ho raha</td><td>WhatsApp token check karo Setup mein</td></tr>
        <tr><td>AI reply nahi aa raha</td><td>Chatbot settings mein Enable AI Fallback ON karo</td></tr>
        </tbody></table>
      </div>`
    },
    {
      title: 'Contacts — Complete User Guide',
      description: 'Contact management: add, edit, delete, import/export CSV, create groups, custom fields, and sync with leads automatically.',
      sections: 5,
      difficulty: 'Beginner',
      lastUpdated: 'July 2026',
      icon: 'fa-users',
      color: '#1877f2',
      chapters: ['Overview', 'Add/Edit/Delete', 'Import/Export', 'Groups', 'Custom Fields'],
      content: `<div style="max-height:60vh;overflow-y:auto;padding:10px;">
        <h4>Contacts — Complete User Guide</h4>
        <h5>Overview</h5>
        <p><strong>Kya Hai:</strong> Contacts module mein aap apne sabhi customers/leads ka database manage karte hain. Groups bana sakte hain, custom fields add kar sakte hain.</p>
        
        <h5>Add Contact</h5>
        <p><strong>Kahan Click:</strong> Contacts → Add Contact button</p>
        <p>Form mein: First Name, Last Name, Mobile, Email, Group select karo → Save</p>
        
        <h5>Import/Export</h5>
        <p><strong>Import:</strong> Sample CSV download karo → Apna data fill karo → Import CSV button → File select → Auto-import</p>
        <p><strong>Export:</strong> Export CSV button → Current list CSV file mein download hogi</p>
        
        <h5>Groups</h5>
        <p><strong>Create Group:</strong> Manage Groups → Create Group → Name dalo → Save</p>
        <p><strong>Add Members:</strong> Group pe click → contacts select karo → Save</p>
        
        <h5>Custom Fields</h5>
        <p>Fields tab mein jaakar custom fields add karo (e.g., Budget, Source). Ye fields sabhi contacts ke form mein dikhenge.</p>
      </div>`
    },
    {
      title: 'Leads — Complete User Guide',
      description: 'Lead management: capture from 10+ sources, filter by status/source/date, pipeline view, auto-assign, and track conversion.',
      sections: 5,
      difficulty: 'Intermediate',
      lastUpdated: 'July 2026',
      icon: 'fa-funnel-dollar',
      color: '#4f46e5',
      chapters: ['Overview', 'Add/Edit Leads', 'Filters & Search', 'Pipeline/Kanban', 'Auto-Capture'],
      content: `<div style="max-height:60vh;overflow-y:auto;padding:10px;">
        <h4>Leads — Complete User Guide</h4>
        <h5>Overview</h5>
        <p><strong>Kya Hai:</strong> Leads module mein saare incoming leads ek jagah dikhte hain — chahe wo WhatsApp se aaye, Form se, Campaign se, ya Manual entry se.</p>
        
        <h5>Add Lead</h5>
        <p>Leads → Add Lead → Name, Phone, Email, Source → Save. LeadCapture engine automatically contact bhi create karega.</p>
        
        <h5>Filters</h5>
        <p>Status filter (New, Contacted, Qualified, Won, Lost), Source filter, Date range, Team member assignee — sab available hain.</p>
        
        <h5>Pipeline/Kanban</h5>
        <p>Pipeline View button → Kanban board khulega. Leads ko drag-drop karke stages (New → Contacted → Qualified → Won) change karo.</p>
        
        <h5>Auto-Capture Sources</h5>
        <ul><li>WhatsApp incoming message → Auto lead</li><li>Public Form submit → Auto lead</li><li>Campaign reply → Auto lead</li><li>Facebook Lead Ads → Auto lead (worker webhook)</li></ul>
      </div>`
    },
    {
      title: 'Kanban — Complete User Guide',
      description: 'Visual pipeline: 7 stages, drag-drop, card details with notes/follow-up/priority, team assignment, and value tracking.',
      sections: 5,
      difficulty: 'Beginner',
      lastUpdated: 'July 2026',
      icon: 'fa-tasks',
      color: '#6366f1',
      chapters: ['Overview', 'Drag & Drop', 'Card Details', 'Filters', 'Quick Add'],
      content: `<div style="max-height:60vh;overflow-y:auto;padding:10px;">
        <h4>Kanban — Complete User Guide</h4>
        <h5>Overview</h5>
        <p><strong>Kya Hai:</strong> Visual sales pipeline jahan leads aur contacts ko 7 stages mein manage karte hain: New → Contacted → Qualified → Proposal → Negotiation → Won → Lost.</p>
        
        <h5>Drag & Drop</h5>
        <p>Card ko pakdo → drag karo → dusre column mein drop karo. Status automatically update ho jayega. Lead aur Contact dono update honge.</p>
        
        <h5>Card Details</h5>
        <p>Card pe click karo → Right side panel khulega. Wahan: Status change, Priority set, Follow-up date, Notes, URL/Sheet link, Assignee, Value — sab edit kar sakte ho.</p>
        
        <h5>Filters</h5>
        <p>Top pe: Team Member filter, Date range filter. Sirf assigned leads dekho ya specific date range ki.</p>
        
        <h5>Quick Add</h5>
        <p>Kisi bhi column mein Quick Add button → Name + Phone → Turant lead create hoga us stage mein.</p>
      </div>`
    },
    {
      title: 'Flows — Complete User Guide',
      description: 'WhatsApp Flow Builder: Meta templates sync, visual builder with nodes & connections, multi-step interactive conversations.',
      sections: 5,
      difficulty: 'Advanced',
      lastUpdated: 'July 2026',
      icon: 'fa-sitemap',
      color: '#8b5cf6',
      chapters: ['Overview', 'Meta Templates', 'Visual Builder', 'My Flows', 'Testing'],
      content: `<div style="max-height:60vh;overflow-y:auto;padding:10px;">
        <h4>Flows — Complete User Guide</h4>
        <h5>Overview</h5>
        <p><strong>Kya Hai:</strong> WhatsApp Flows interactive multi-step conversations hain jo WhatsApp ke andar hi chalte hain. Meta Templates (paid) aur Visual Builder (free) dono available hain.</p>
        
        <h5>Meta Templates</h5>
        <p>Templates tab → Meta ke ready-made flows browse karo → Preview dekho → Copy to My Flows → Activate.</p>
        <p><strong>Categories:</strong> Sign up, Lead Generation, Appointment Booking, Survey, Shopping, Support.</p>
        <p><strong>Note:</strong> Meta Templates require Meta Business Account (paid).</p>
        
        <h5>Visual Builder (Free)</h5>
        <p>Builder tab → Left palette se nodes drag karo canvas pe → Connect karo → Properties edit karo → Save.</p>
        <p><strong>Node Types:</strong> Message, Question, Input, Condition, Delay, Action.</p>
        <p><strong>Preview:</strong> Test button se WhatsApp phone simulator mein flow test karo.</p>
        
        <h5>My Flows</h5>
        <p>Active flows yahan dikhte hain. Activate/Deactivate toggle. Copy link to share via WhatsApp.</p>
      </div>`
    },
    {
      title: 'Social — Complete User Guide',
      description: 'Social Media Posting: Facebook, Instagram, Meta Business, LinkedIn, Twitter/X, YouTube, YT Studio — all platforms from one dashboard.',
      sections: 5,
      difficulty: 'Beginner',
      lastUpdated: 'July 2026',
      icon: 'fa-globe',
      color: '#1877f2',
      chapters: ['Overview', 'Platform Connect', 'Post Types', 'Composer', 'Schedule'],
      content: `<div style="max-height:60vh;overflow-y:auto;padding:10px;">
        <h4>Social — Complete User Guide</h4>
        <h5>Overview</h5>
        <p><strong>Kya Hai:</strong> Ek jagah se sabhi social media platforms pe post karo. 7 platforms supported: Facebook, Instagram, Meta Business, LinkedIn, Twitter/X, YouTube, YT Studio.</p>
        
        <h5>Platform Connect</h5>
        <p>Social tab → Platform select karo (e.g., Facebook) → Open Facebook button → Popup window mein login karo → Credentials save karo.</p>
        <p>Setup page mein bhi platform tokens configure kar sakte ho.</p>
        
        <h5>Post Types</h5>
        <ul><li><strong>Post:</strong> Regular feed post with text + media</li><li><strong>Story:</strong> 9:16 vertical format</li><li><strong>Reel:</strong> Short video with audio</li><li><strong>Carousel:</strong> Multiple images/videos (up to 10)</li></ul>
        
        <h5>Composer</h5>
        <p>Create Post button → Full composer khulega. Media upload (drag-drop), Caption with emoji picker, Schedule date/time, Preview panel, Post type selector.</p>
        <p><strong>Publish:</strong> Publish Now ya Save as Draft.</p>
        
        <h5>Schedule</h5>
        <p>Composer mein date + time select karo → Post scheduled hoga. Content Calendar mein scheduled posts dikhenge.</p>
      </div>`
    }
  ];

  let activeGuide = null;

  function renderList() {
    contentArea.innerHTML = `
      <style>
        .pm-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:22px;cursor:pointer;transition:0.25s;position:relative;margin-bottom:10px;}
        .pm-card:hover{border-color:#3b82f6;box-shadow:0 10px 25px rgba(0,0,0,0.06);}
        .pm-card.active{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,0.1);}
        .pm-icon{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
        .pm-detail{background:#fff;border-radius:14px;padding:24px;margin-top:10px;border:1px solid #e5e7eb;}
      </style>

      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
        <button onclick="Knowledge.currentSection='home';Knowledge.render();" style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:13px;"><i class="fas fa-arrow-left me-1"></i> Hub</button>
        <div><h5 style="font-weight:700;margin:0;">Platform Mastery</h5><small class="text-muted">Technical documentation & user guides</small></div>
      </div>

      <div class="row g-3">
        ${guides.map((g, i) => `
          <div class="col-md-6">
            <div class="pm-card" id="pmCard${i}" onclick="document.querySelectorAll('.pm-card').forEach(c=>c.classList.remove('active'));this.classList.add('active');var panel=document.getElementById('pmDetail');if(g.content){panel.innerHTML='<div style=«max-height:60vh;overflow-y:auto;»>'+g.content+'</div>';}else{panel.innerHTML='<h5 style=«font-weight:700;»>'+g.title+'</h5><p style=«color:#6b7280;»>'+g.description+'</p><div class=«row g-2 mt-3»><div class=«col-4»><strong>Difficulty</strong><br><span class=«badge bg-»+(g.difficulty===\'Advanced\'?\'danger\':\'warning\')+'\'>'+g.difficulty+'</span></div><div class=«col-4»><strong>Sections</strong><br>'+g.sections+'</div><div class=«col-4»><strong>Updated</strong><br>'+g.lastUpdated+'</div></div><h6 style=«margin-top:14px;»>Chapters</h6>'+g.chapters.map(c=>'<div style=«display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:6px;font-size:12px;margin:2px 0;background:#f9fafb;»><i class=«fas fa-check-circle» style=«color:#10b981;font-size:10px;»></i> '+c+'</div>').join('')+'<button onclick=«Knowledge.showEmailPopup()» style=«margin-top:14px;background:#3b82f6;color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:600;width:100%;»>Access Complete Guide →</button>';}panel.style.display='block';panel.scrollIntoView({behavior:'smooth'});">
              <div style="display:flex;gap:14px;align-items:start;">
                <div class="pm-icon" style="background:${g.color}15;color:${g.color};"><i class="fas ${g.icon}"></i></div>
                <div class="flex-grow-1">
                  <h6 style="font-weight:600;">${g.title}</h6>
                  <p style="font-size:12px;color:#6b7280;">${g.description.substring(0,100)}...</p>
                  <div class="d-flex gap-3 mt-2">
                    <small class="text-muted"><i class="far fa-file-alt me-1"></i>${g.sections} sections</small>
                    <small class="text-muted"><i class="fas fa-signal me-1"></i>${g.difficulty}</small>
                    <small class="text-muted"><i class="far fa-clock me-1"></i>${g.lastUpdated}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div id="pmDetail" style="display:none;" class="pm-detail"></div>
    `;
  }
renderList();
})();
})
