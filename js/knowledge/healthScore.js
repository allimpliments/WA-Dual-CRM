// js/knowledge/healthScore.js — Business Health Diagnostic Module
function(Knowledge, contentArea, db, firebase) {
  contentArea.innerHTML = `
    <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Hub</button>
    <h5 style="font-weight:700;">Business Health Diagnostic</h5>
    <p class="text-muted small mb-3">Comprehensive assessment across four critical business pillars.</p>
    <div class="card-widget" style="max-width:580px;margin:0 auto;">
      <div class="mb-3"><label class="form-label fw-bold small">Industry Vertical</label><select id="hsIndustry" class="form-select"><option>Real Estate</option><option>Healthcare</option><option>Education</option><option>E-commerce</option><option>Financial Services</option><option>Other</option></select></div>
      <div class="mb-3"><label class="form-label fw-bold small">Monthly Lead Volume</label><input type="number" id="hsLeads" class="form-control" placeholder="Enter average monthly leads"></div>
      <div class="mb-3"><label class="form-label fw-bold small">Current Conversion Rate (%)</label><input type="number" id="hsConv" class="form-control" placeholder="Enter your conversion percentage" step="0.1"></div>
      <div class="mb-3"><label class="form-label fw-bold small">WhatsApp Integration Level</label><select id="hsWA" class="form-select"><option value="none">Not using WhatsApp</option><option value="basic">Basic (manual messaging)</option><option value="advanced">Advanced (API/CRM integrated)</option></select></div>
      <div class="mb-3"><label class="form-label fw-bold small">Team Size</label><select id="hsTeam" class="form-select"><option value="solo">Solo / 1-3</option><option value="small">Small / 4-15</option><option value="medium">Medium / 16-50</option><option value="large">Large / 50+</option></select></div>
      <button class="btn btn-primary w-100" onclick="(function(){const l=parseInt(document.getElementById('hsLeads').value)||0;const c=parseFloat(document.getElementById('hsConv').value)||0;const w=document.getElementById('hsWA').value;const t=document.getElementById('hsTeam').value;let s=25;if(l>500)s+=20;else if(l>100)s+=10;if(c>10)s+=20;else if(c>5)s+=10;if(w==='advanced')s+=25;else if(w==='basic')s+=10;if(t==='medium'||t==='large')s+=10;s=Math.min(s,100);const g=s>=80?'Excellent — You are ahead of the curve.':s>=60?'Good — Solid foundation with room for optimization.':s>=40?'Developing — Clear opportunities for improvement.':'Early Stage — Significant growth potential ahead.';document.getElementById('hsResult').innerHTML='<div class=«alert alert-»+(s>=60?'success':'warning')+'« mt-3»><h4>'+s+'/100</h4><p><strong>'+g+'</strong></p><p class=«small»>Based on '+l+' leads/mo, '+c+'% conversion, '+w+' WhatsApp setup.</p><button class=«btn btn-primary btn-sm» onclick=«Knowledge.showEmailPopup()»>Get Full Report with Recommendations</button></div>';})()">Generate Diagnostic Report</button>
      <div id="hsResult"></div>
    </div>
  `;
}
