// js/knowledge/roiCalculator.js — WhatsApp ROI Calculator Module
function(Knowledge, contentArea, db, firebase) {
  contentArea.innerHTML = `
    <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Hub</button>
    <h5 style="font-weight:700;">WhatsApp ROI Calculator</h5>
    <p class="text-muted small mb-3">Data-driven revenue projection based on your actual business metrics.</p>
    <div class="card-widget" style="max-width:580px;margin:0 auto;">
      <div class="mb-3"><label class="form-label fw-bold small">Average Monthly Leads</label><input type="number" id="roiLeads" class="form-control" placeholder="e.g. 500"></div>
      <div class="mb-3"><label class="form-label fw-bold small">Average Deal Value (₹)</label><input type="number" id="roiValue" class="form-control" placeholder="e.g. 15000"></div>
      <div class="mb-3"><label class="form-label fw-bold small">Current Conversion Rate (%)</label><input type="number" id="roiConv" class="form-control" placeholder="e.g. 4" step="0.1"></div>
      <div class="mb-3"><label class="form-label fw-bold small">Industry Average WhatsApp Uplift (%)</label><input type="number" id="roiUplift" class="form-control" value="35" step="1"><small class="text-muted">Average improvement: 30-45% across industries</small></div>
      <div class="mb-3"><label class="form-label fw-bold small">Monthly WhatsApp Cost (₹)</label><input type="number" id="roiCost" class="form-control" placeholder="e.g. 5000" value="5000"></div>
      <button class="btn btn-primary w-100" onclick="(function(){const l=parseInt(document.getElementById('roiLeads').value)||0;const v=parseInt(document.getElementById('roiValue').value)||0;const c=parseFloat(document.getElementById('roiConv').value)||0;const u=parseFloat(document.getElementById('roiUplift').value)||35;const cost=parseInt(document.getElementById('roiCost').value)||0;const curRev=Math.round(l*(c/100)*v);const newConv=c*(1+u/100);const newRev=Math.round(l*(newConv/100)*v);const uplift=newRev-curRev;const roi=Math.round((uplift-cost)/cost*100);document.getElementById('roiResult').innerHTML='<div class=«mt-3 p-3» style=«background:#f0fdf4;border-radius:12px;»><div class=«row g-3»><div class=«col-6»><small class=«text-muted»>Current Revenue</small><h5>₹'+curRev.toLocaleString()+'</h5></div><div class=«col-6»><small class=«text-muted»>With WhatsApp</small><h5 style=«color:#059669;»>₹'+newRev.toLocaleString()+'</h5></div></div><div class=«text-center mt-2»><h3 style=«color:#d97706;»>+₹'+uplift.toLocaleString()+'/month</h3><p class=«small»>Projected ROI: <strong>'+roi+'%</strong> after ₹'+cost.toLocaleString()+' monthly investment</p></div><button class=«btn btn-primary btn-sm w-100 mt-2» onclick=«Knowledge.showEmailPopup()»>Get Detailed Implementation Plan</button></div>';})()">Calculate Projected ROI</button>
      <div id="roiResult"></div>
    </div>
  `;
} 
