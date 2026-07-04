// js/knowledge/roiCalculator.js — Advanced WhatsApp ROI Calculator
(function(Knowledge, contentArea, db, firebase) {
  contentArea.innerHTML = `
    <style>
      .roi-card{background:#fff;border-radius:14px;padding:24px;border:1px solid #e5e7eb;}
      .roi-result{background:#f0fdf4;border-radius:14px;padding:24px;margin-top:20px;}
      .roi-stat{text-align:center;padding:16px;background:#fff;border-radius:10px;border:1px solid #e5e7eb;}
    </style>

    <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Hub</button>
    <h5 style="font-weight:700;">WhatsApp ROI Calculator</h5>
    <p class="text-muted small mb-3">Advanced revenue projection model based on your actual business metrics.</p>

    <div class="roi-card" style="max-width:650px;margin:0 auto;">
      <div class="row g-3">
        <div class="col-md-6"><label class="form-label small fw-bold">Average Monthly Leads</label><input type="number" id="rl" class="form-control" placeholder="e.g. 500" value="500"></div>
        <div class="col-md-6"><label class="form-label small fw-bold">Average Deal Value (₹)</label><input type="number" id="rv" class="form-control" placeholder="e.g. 15000" value="15000"></div>
        <div class="col-md-4"><label class="form-label small fw-bold">Current Conversion %</label><input type="number" id="rc" class="form-control" placeholder="5" value="5" step="0.1"></div>
        <div class="col-md-4"><label class="form-label small fw-bold">WhatsApp Uplift %</label><input type="number" id="ru" class="form-control" value="35" step="1"><small class="text-muted">Industry avg: 30-45%</small></div>
        <div class="col-md-4"><label class="form-label small fw-bold">Monthly Cost (₹)</label><input type="number" id="rcost" class="form-control" value="5000"></div>
      </div>
      <button class="btn btn-primary w-100 mt-3" onclick="var l=parseInt(document.getElementById('rl').value)||0,v=parseInt(document.getElementById('rv').value)||0,c=parseFloat(document.getElementById('rc').value)||0,u=parseFloat(document.getElementById('ru').value)||35,cost=parseInt(document.getElementById('rcost').value)||0;var curRev=Math.round(l*(c/100)*v);var newConv=c*(1+u/100);var newRev=Math.round(l*(newConv/100)*v);var uplift=newRev-curRev;var roi=Math.round((uplift-cost)/cost*100);var annual=(uplift-cost)*12;document.getElementById('roiResult').innerHTML='<h6 style=«font-weight:600;»>Projected Impact</h6><div class=«row g-3 mt-2»><div class=«col-4»><div class=«roi-stat»><small class=«text-muted»>Current</small><h5>₹'+curRev.toLocaleString()+'</h5></div></div><div class=«col-4»><div class=«roi-stat»><small class=«text-muted»>With WhatsApp</small><h5 style=«color:#059669;»>₹'+newRev.toLocaleString()+'</h5></div></div><div class=«col-4»><div class=«roi-stat»><small class=«text-muted»>Monthly Uplift</small><h5 style=«color:#d97706;»>₹'+uplift.toLocaleString()+'</h5></div></div></div><div class=«text-center mt-3»><h3 style=«color:#059669;»>+₹'+(uplift-cost).toLocaleString()+'/month net</h3><p style=«color:#6b7280;»>Annual net gain: <strong>₹'+annual.toLocaleString()+'</strong></p><p>ROI: <strong style=«color:#3b82f6;»>'+roi+'%</strong> after ₹'+cost.toLocaleString()+' investment</p></div><button class=«btn btn-primary btn-sm w-100 mt-2» onclick=«Knowledge.showEmailPopup()»>Get Detailed Implementation Plan</button>';">Calculate ROI</button>
      <div id="roiResult" class="roi-result"></div>
    </div>
  `;
})
