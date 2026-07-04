function(Knowledge) {
  return {
    render(section) {
      const items = [
        {t:'WhatsApp Marketing Mastery',d:'Setup to scaling.',l:'Beginner',time:'30 min'},
        {t:'Lead Generation Blueprint',d:'Forms, widgets, ads.',l:'Intermediate',time:'45 min'},
        {t:'Sales Automation Guide',d:'Chatbots, drip sequences.',l:'Advanced',time:'60 min'},
        {t:'Customer Retention',d:'Loyalty, re-engagement.',l:'Intermediate',time:'25 min'},
        {t:'Scaling 0 to 1000',d:'Infrastructure, team.',l:'Advanced',time:'90 min'},
      ];
      let h = `<style>.ke-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:20px;cursor:pointer;transition:0.3s;}.ke-card:hover{transform:translateY(-3px);box-shadow:0 12px 30px rgba(24,119,242,0.15);}.ke-badge{position:absolute;top:10px;right:10px;padding:4px 10px;border-radius:12px;font-size:10px;font-weight:600;}.ke-badge-free{background:#d1fae5;color:#065f46;}.ke-badge-premium{background:#fef3c7;color:#92400e;}</style>`;
      h += `<button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();">← Back</button><h5>📚 Business Growth Playbooks</h5><div class="row g-3">`;
      items.forEach(p => {
        h += `<div class="col-md-4"><div class="ke-card" style="position:relative;"><span class="ke-badge ke-badge-${p.l==='Beginner'?'free':'premium'}">${p.l}</span><h6>${p.t}</h6><small class="text-muted">${p.d}</small><br><small>⏱ ${p.time}</small></div></div>`;
      });
      h += `</div><div class="mt-3"><button class="btn btn-outline-primary btn-sm" onclick="Knowledge.showEmailPopup()">📩 Add More Playbooks (Request)</button></div>`;
      contentArea.innerHTML = h;
    }
  };
}
