// js/knowledge/blog.js — Strategic Insights & Articles Module
function(Knowledge, contentArea, db, firebase) {
  const categories = ['All', 'WhatsApp Strategy', 'Digital Marketing', 'Lead Generation', 'Automation', 'Case Studies', 'Industry Trends'];
  let activeCategory = 'All';

  const articles = [
    {
      title: 'The WhatsApp Business Revolution: Why 2026 Is the Tipping Point',
      category: 'Industry Trends',
      author: '11 Avatar Team',
      date: '2026-06-15',
      readTime: '8 min',
      excerpt: 'WhatsApp Business has evolved from a messaging tool to a complete commerce platform. Explore the key trends driving this transformation and what it means for businesses worldwide.',
      image: 'https://images.unsplash.com/photo-1611746872915-643f39d3e5c1?w=600',
      icon: 'fa-newspaper',
      color: '#4f46e5'
    },
    {
      title: 'Lead Generation Strategies That Actually Work in 2026',
      category: 'Lead Generation',
      author: 'Marketing Team',
      date: '2026-05-28',
      readTime: '12 min',
      excerpt: 'Traditional lead generation is dead. Discover the multi-channel approach combining WhatsApp widgets, conversational forms, and AI-powered qualification that top performers use.',
      icon: 'fa-magnet',
      color: '#059669'
    },
    {
      title: 'Automating Customer Communication Without Losing the Human Touch',
      category: 'Automation',
      author: 'Product Team',
      date: '2026-05-10',
      readTime: '10 min',
      excerpt: 'The art and science of conversational automation. How to design flows that feel personal, handle edge cases gracefully, and know when to escalate to a human agent.',
      icon: 'fa-robot',
      color: '#d97706'
    },
    {
      title: 'Case Study: How a Real Estate Firm Doubled Conversions with WhatsApp',
      category: 'Case Studies',
      author: 'Success Team',
      date: '2026-04-22',
      readTime: '6 min',
      excerpt: 'Detailed breakdown of how a mid-size real estate company transformed their lead-to-visit ratio using automated WhatsApp tours, instant responses, and smart follow-ups.',
      icon: 'fa-building',
      color: '#db2777'
    },
    {
      title: 'WhatsApp Broadcast vs Group vs Community: A Strategic Guide',
      category: 'WhatsApp Strategy',
      author: 'Strategy Team',
      date: '2026-04-05',
      readTime: '7 min',
      excerpt: 'Understanding the nuanced differences between WhatsApp communication channels and when to use each for maximum engagement and compliance.',
      icon: 'fa-bullhorn',
      color: '#7c3aed'
    },
    {
      title: 'Digital Marketing Metrics That Actually Matter in 2026',
      category: 'Digital Marketing',
      author: 'Analytics Team',
      date: '2026-03-18',
      readTime: '9 min',
      excerpt: 'Move beyond vanity metrics. Learn which KPIs actually predict business growth and how to build a measurement framework that drives decisions.',
      icon: 'fa-chart-line',
      color: '#0369a1'
    }
  ];

  const filtered = activeCategory === 'All' ? articles : articles.filter(a => a.category === activeCategory);

  function render() {
    contentArea.innerHTML = `
      <style>
        .blog-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;cursor:pointer;transition:0.25s;}
        .blog-card:hover{box-shadow:0 10px 25px rgba(0,0,0,0.06);border-color:#3b82f6;}
        .blog-card-img{height:140px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-size:36px;}
        .blog-card-body{padding:18px;}
        .blog-meta{font-size:11px;color:#9ca3af;display:flex;gap:12px;align-items:center;}
        .blog-category{display:inline-block;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:500;}
        .cat-filter{display:inline-block;padding:6px 14px;border-radius:20px;font-size:12px;cursor:pointer;border:1px solid #e5e7eb;margin:3px;transition:0.2s;background:#fff;}
        .cat-filter:hover,.cat-filter.active{background:#3b82f6;color:#fff;border-color:#3b82f6;}
      </style>

      <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();">
        <i class="fas fa-arrow-left me-1"></i> Hub
      </button>
      
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h5 style="font-weight:700;margin:0;">Strategic Insights & Articles</h5>
          <small class="text-muted">Deep dives into WhatsApp strategy, marketing, and industry trends</small>
        </div>
      </div>

      <div class="mb-3" id="catFilters">
        ${categories.map(c => `<span class="cat-filter ${activeCategory===c?'active':''}" onclick="document.querySelectorAll('.cat-filter').forEach(el=>el.classList.remove('active'));event.target.classList.add('active');document.getElementById('blogGrid').innerHTML='${filtered.map(a=>`<div class=«col-md-6 col-lg-4»><div class=«blog-card» onclick=«Knowledge.showEmailPopup()»><div class=«blog-card-img» style=«background:${a.color}10;color:${a.color};»><i class=«fas ${a.icon}»></i></div><div class=«blog-card-body»><span class=«blog-category» style=«background:${a.color}15;color:${a.color};»>${a.category}</span><h6 style=«font-weight:600;margin-top:8px;»>${a.title}</h6><p style=«font-size:12px;color:#6b7280;»>${a.excerpt.substring(0,80)}...</p><div class=«blog-meta»><span><i class=«far fa-user»></i> ${a.author}</span><span><i class=«far fa-clock»></i> ${a.readTime}</span><span>${a.date}</span></div></div></div></div>`).join('')}');">${c}</span>`).join('')}
      </div>

      <div class="row g-3" id="blogGrid">
        ${filtered.map(a => `
          <div class="col-md-6 col-lg-4">
            <div class="blog-card" onclick="Knowledge.showEmailPopup()">
              <div class="blog-card-img" style="background:${a.color}10;color:${a.color};">
                <i class="fas ${a.icon}"></i>
              </div>
              <div class="blog-card-body">
                <span class="blog-category" style="background:${a.color}15;color:${a.color};">${a.category}</span>
                <h6 style="font-weight:600;margin-top:8px;">${a.title}</h6>
                <p style="font-size:12px;color:#6b7280;">${a.excerpt.substring(0,100)}...</p>
                <div class="blog-meta mt-2">
                  <span><i class="far fa-user me-1"></i>${a.author}</span>
                  <span><i class="far fa-clock me-1"></i>${a.readTime}</span>
                </div>
                <small class="text-muted mt-1 d-block">${a.date}</small>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="text-center mt-4">
        <button class="btn btn-outline-primary btn-sm" onclick="Knowledge.showEmailPopup()">
          <i class="fas fa-bell me-1"></i> Subscribe to Weekly Articles
        </button>
      </div>
    `;
  }

  render();

  // Re-attach category filter handlers
  document.querySelectorAll('.cat-filter').forEach(el => {
    el.addEventListener('click', function() {
      activeCategory = this.textContent.trim();
      render();
    });
  });
} 
