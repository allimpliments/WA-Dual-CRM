(function(Knowledge, contentArea, db, firebase) {
  contentArea.innerHTML = `
    <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Hub</button>
    <h5 style="font-weight:700;">WhatsApp ROI Calculator</h5>
    <p class="text-muted small mb-3">Data-driven revenue projection based on your business metrics.</p>
    <div class="card-widget" style="max-width:500px;margin:0 auto;">
      <div class="mb-2"><label class="form-label small fw-bold">Monthly Leads</label><input type="number" id="roiLeads" class="form-control form-control-sm" placeholder="500"></div>
      <div class="mb-2"><label class="form-label small fw-bold">Deal Value (₹)</label><input type="number" id="roiValue" class="form-control form-control-sm" placeholder="10000"></div>
      <div class="mb-2"><label class="form-label small fw-bold">Conversion Rate (%)</label><input type="number" id="roiConv" class="form-control form-control-sm" placeholder="5" step="0.1"></div>
      <div class="mb-2"><label class="form-label small fw-bold">Expected Uplift (%)</label><input type="number" id="roiUplift" class="form-control form-control-sm" value="35"></div>
      <button class="btn btn-primary w-100" onclick="var l=parseInt(document.getElementById('roiLeads').value)||0,v=parseInt(document.getElementById('roiValue').value)||0,c=parseFloat(document.getElementById('roiConv').value)||0,u=parseFloat(document.getElementById('roiUplift').value)||35,cur=Math.round(l*(c/100)*v),nc=c*(1+u/100),nxt=Math.round(l*(nc/100)*v),up=nxt-cur;document.getElementById('roiResult').innerHTML='<div class=«mt-3 p-3 text-center» style=«background:#f0fdf4;border-radius:12px;»><div class=«row»><div class=«col-6»><small>Current</small><h5>₹'+cur.toLocaleString()+'</h5></div><div class=«col-6»><small>With WhatsApp</small><h5 style=«color:#059669;»>₹'+nxt.toLocaleString()+'</h5></div></div><h4 style=«color:#d97706;»>+₹'+up.toLocaleString()+'/mo</h4><button class=«btn btn-primary btn-sm» onclick=«Knowledge.showEmailPopup()»>Get Implementation Plan</button></div>';">Calculate ROI</button>
      <div id="roiResult"></div>
    </div>
  `;
})
