// js/knowledge/blog.js — Strategic Blog with Categories, Search & Featured
(function(Knowledge, contentArea, db, firebase) {
  const categories = ['All', 'WhatsApp Strategy', 'Digital Marketing', 'Lead Generation', 'Automation', 'Case Studies', 'Industry Trends'];
  let activeCategory = 'All';
  let searchQuery = '';

  const articles = [
    {
      title: 'The WhatsApp Business Revolution: Why 2026 Is the Tipping Point',
      category: 'Industry Trends',
      author: '11 Avatar Research Team',
      date: '2026-07-01',
      readTime: '8 min read',
      featured: true,
      excerpt: 'WhatsApp Business has evolved from a simple messaging tool into a complete commerce and communication platform. With over 200 million monthly active business users, the platform is reshaping how companies interact with customers worldwide. This comprehensive analysis explores the key technological, behavioral, and market trends driving this transformation.',
      image: 'fa-newspaper',
      color: '#4f46e5',
      tags: ['WhatsApp', 'Trends', 'Commerce']
    },
    {
      title: 'Lead Generation Strategies That Actually Convert in 2026',
      category: 'Lead Generation',
      author: 'Marketing Strategy Team',
      date: '2026-06-22',
      readTime: '12 min read',
      featured: true,
      excerpt: 'Traditional lead generation methods are delivering diminishing returns. The most successful businesses are adopting a multi-channel approach combining WhatsApp conversational widgets, AI-powered qualification bots, and behavioral trigger campaigns.',
      image: 'fa-magnet',
      color: '#059669',
      tags: ['Lead Gen', 'Conversion', 'Multi-Channel']
    },
    {
      title: 'Automating Customer Communication Without Losing the Human Touch',
      category: 'Automation',
      author: 'Product Innovation Lab',
      date: '2026-06-10',
      readTime: '10 min read',
      featured: false,
      excerpt: 'The art and science of conversational automation. How forward-thinking companies are designing chatbot flows that feel personal, handle edge cases gracefully, and seamlessly escalate to human agents when needed.',
      image: 'fa-robot',
      color: '#d97706',
      tags: ['Automation', 'Chatbot', 'Customer Experience']
    },
    {
      title: 'Case Study: Real Estate Firm Achieves 3x Lead Conversion with WhatsApp',
      category: 'Case Studies',
      author: 'Customer Success Team',
      date: '2026-05-18',
      readTime: '6 min read',
      featured: false,
      excerpt: 'A detailed breakdown of how Prestige Properties transformed their lead-to-visit conversion rate using automated WhatsApp virtual tours, instant query responses, and intelligent follow-up sequences.',
      image: 'fa-building',
      color: '#db2777',
      tags: ['Real Estate', 'Case Study', 'ROI']
    },
    {
      title: 'WhatsApp Broadcast vs Group vs Community: The Ultimate Strategic Guide',
      category: 'WhatsApp Strategy',
      author: 'Platform Strategy Team',
      date: '2026-05-05',
      readTime: '7 min read',
      featured: false,
      excerpt: 'Understanding the nuanced differences between WhatsApp communication channels and when to leverage each for maximum engagement while maintaining full compliance with platform policies.',
      image: 'fa-bullhorn',
      color: '#7c3aed',
      tags: ['Strategy', 'Broadcast', 'Compliance']
    },
    {
      title: 'Digital Marketing Metrics That Actually Predict Business Growth',
      category: 'Digital Marketing',
      author: 'Analytics & Data Team',
      date: '2026-04-20',
      readTime: '9 min read',
      featured: false,
      excerpt: 'Move beyond vanity metrics. A research-backed framework for identifying the KPIs that genuinely correlate with revenue growth and customer lifetime value in WhatsApp-driven businesses.',
      image: 'fa-chart-line',
      color: '#0369a1',
      tags: ['Analytics', 'Metrics', 'Growth']
    },
    {
      title: 'The Psychology Behind High-Converting WhatsApp Message Templates',
      category: 'WhatsApp Strategy',
      author: 'Content Strategy Team',
      date: '2026-04-08',
      readTime: '11 min read',
      featured: false,
      excerpt: 'Explore the psychological principles that make certain WhatsApp messages drive action. From urgency triggers to social proof frameworks — design templates that convert browsers into buyers.',
      image: 'fa-brain',
      color: '#0891b2',
      tags: ['Psychology', 'Templates', 'Conversion']
    },
    {
      title: 'From Manual to Automated: A Small Business WhatsApp Transformation',
      category: 'Case Studies',
      author: 'Implementation Team',
      date: '2026-03-25',
      readTime: '5 min read',
      featured: false,
      excerpt: 'How a 5-person bakery scaled their WhatsApp ordering system from 50 daily manual replies to handling 500+ automated conversations with zero additional staff.',
      image: 'fa-store-alt',
      color: '#be185d',
      tags: ['Small Business', 'Automation', 'Case Study']
    }
  ];

  const filtered = articles.filter(a => {
    if (activeCategory !== 'All' && a.category !== activeCategory) return false;
    if (searchQuery && !a.title.toLowerCase().includes(searchQuery) && !a.excerpt.toLowerCase().includes(searchQuery)) return false;
    return true;
  });

  function render() {
    const featured = articles.filter(a => a.featured);
    
    contentArea.innerHTML = `
      <style>
        .blog-hero-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;cursor:pointer;transition:0.25s;display:flex;flex-direction:column;}
        .blog-hero-card:hover{box-shadow:0 12px 30px rgba(0,0,0,0.08);border-color:#3b82f6;}
        .blog-hero-img{height:160px;display:flex;align-items:center;justify-content:center;font-size:48px;}
        .blog-hero-body{padding:20px;flex:1;}
        .blog-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;cursor:pointer;transition:0.25s;}
        .blog-card:hover{box-shadow:0 8px 20px rgba(0,0,0,0.05);border-color:#3b82f6;}
        .blog-card-img{height:100px;display:flex;align-items:center;justify-content:center;font-size:30px;}
        .blog-card-body{padding:14px;}
        .blog-meta{font-size:10px;color:#9ca3af;display:flex;gap:10px;flex-wrap:wrap;align-items:center;}
        .blog-tag{display:inline-block;padding:2px 6px;border-radius:4px;font-size:9px;background:#f3f4f6;color:#6b7280;}
        .blog-search{display:flex;gap:8px;margin-bottom:16px;}
        .blog-search input{flex:1;padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px;font-size:13px;}
        .blog-search button{padding:10px 16px;border:none;border-radius:10px;background:#3b82f6;color:#fff;cursor:pointer;font-weight:500;}
        .cat-pill{display:inline-block;padding:6px 14px;border-radius:20px;font-size:12px;cursor:pointer;border:1px solid #e5e7eb;margin:2px;transition:0.2s;background:#fff;}
        .cat-pill:hover,.cat-pill.active{background:#3b82f6;color:#fff;border-color:#3b82f6;}
      </style>

      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
        <button onclick="Knowledge.currentSection='home';Knowledge.render();" style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:13px;"><i class="fas fa-arrow-left me-1"></i> Hub</button>
        <div><h5 style="font-weight:700;margin:0;">Strategic Blog</h5><small class="text-muted">Research-backed insights on WhatsApp strategy & digital marketing</small></div>
      </div>

      <div class="blog-search">
        <input type="text" id="blogSearchInput" placeholder="Search articles by title or topic..." value="${searchQuery}" onkeyup="document.querySelector('#blogSearchInput').dispatchEvent(new Event('change'))">
        <button onclick="searchQuery=document.getElementById('blogSearchInput').value.toLowerCase();">Search</button>
      </div>

      <div style="margin-bottom:16px;" id="catPills">
        ${categories.map(c => `<span class="cat-pill ${activeCategory===c?'active':''}" onclick="document.querySelectorAll('.cat-pill').forEach(el=>el.classList.remove('active'));event.target.classList.add('active');">${c}</span>`).join('')}
      </div>

      ${featured.length > 0 && activeCategory === 'All' && !searchQuery ? `
        <h6 style="font-weight:600;margin-bottom:12px;"><i class="fas fa-star text-warning me-1"></i>Featured Articles</h6>
        <div class="row g-3 mb-4">
          ${featured.map(a => `
            <div class="col-md-6">
              <div class="blog-hero-card" onclick="Knowledge.showEmailPopup()">
                <div class="blog-hero-img" style="background:${a.color}10;color:${a.color};"><i class="fas ${a.image}"></i></div>
                <div class="blog-hero-body">
                  <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;background:${a.color}15;color:${a.color};margin-bottom:8px;">${a.category}</span>
                  <h6 style="font-weight:600;">${a.title}</h6>
                  <p style="font-size:12px;color:#6b7280;">${a.excerpt.substring(0,120)}...</p>
                  <div class="blog-meta mt-2"><span><i class="far fa-user me-1"></i>${a.author}</span><span><i class="far fa-clock me-1"></i>${a.readTime}</span><span>${a.date}</span></div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <h6 style="font-weight:600;margin-bottom:12px;">${activeCategory === 'All' ? 'Latest Articles' : activeCategory}</h6>
      <div class="row g-3">
        ${filtered.length === 0 ? '<div class="col-12 text-center py-4 text-muted">No articles found matching your criteria.</div>' : filtered.map(a => `
          <div class="col-md-6 col-lg-4">
            <div class="blog-card" onclick="Knowledge.showEmailPopup()">
              <div class="blog-card-img" style="background:${a.color}10;color:${a.color};"><i class="fas ${a.image}"></i></div>
              <div class="blog-card-body">
                <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;background:${a.color}15;color:${a.color};margin-bottom:6px;">${a.category}</span>
                <h6 style="font-weight:600;font-size:13px;">${a.title}</h6>
                <p style="font-size:11px;color:#6b7280;">${a.excerpt.substring(0,80)}...</p>
                <div class="blog-meta mt-2"><span>${a.author}</span><span>${a.readTime}</span></div>
                <div style="margin-top:6px;">${a.tags.map(t=>`<span class="blog-tag">${t}</span>`).join(' ')}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="text-align:center;margin-top:20px;padding:18px;background:#f9fafb;border-radius:12px;">
        <p style="font-size:13px;color:#6b7280;margin-bottom:6px;">Get the latest articles delivered to your inbox weekly.</p>
        <button onclick="Knowledge.showEmailPopup()" style="background:#3b82f6;color:#fff;border:none;padding:8px 18px;border-radius:8px;cursor:pointer;font-weight:500;">Subscribe to Newsletter</button>
      </div>
    `;

    // Re-attach handlers
    document.querySelectorAll('.cat-pill').forEach(pill => {
      pill.addEventListener('click', function() {
        activeCategory = this.textContent.trim();
        render();
      });
    });
    
    const searchInput = document.getElementById('blogSearchInput');
    if (searchInput) {
      searchInput.addEventListener('change', function() {
        searchQuery = this.value.toLowerCase();
        render();
      });
    }
  }

  render();
})
