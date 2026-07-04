(function(Knowledge, contentArea, db, firebase) {
  contentArea.innerHTML = `
    <button class="btn btn-outline-primary btn-sm mb-3" onclick="Knowledge.currentSection='home';Knowledge.render();"><i class="fas fa-arrow-left me-1"></i> Hub</button>
    <h5 style="font-weight:700;">Business Health Diagnostic</h5>
    <p class="text-muted small mb-3">Comprehensive assessment across four critical business pillars.</p>
    <div class="card-widget" style="max-width:500px;margin:0 auto;">
      <div class="mb-2"><label class="form-label small fw-bold">Industry</label><select id="hsIndustry" class="form-select form-select-sm"><option>Real Estate</option><option>Healthcare</option><option>Education</option><option>E-commerce</option><option>Financial Services</option><option>Other</option></select></div>
      <div class="mb-2"><label class="form-label small fw-bold">Monthly Leads</label><input type="number" id="hsLeads" class="form-control form-control-sm" placeholder="e.g. 200"></div>
      <div class="mb-2"><label class="form-label small fw-bold">Conversion Rate (%)</label><input type="number" id="hsConv" class="form-control form-control-sm" placeholder="e.g. 5" step="0.1"></div>
      <div class="mb-2"><label class="form-label small fw-bold">WhatsApp Setup</label><select id="hsWA" class="form-select form-select-sm"><option value="none">Not using</option><option value="basic">Basic</option><option value="advanced">Advanced</option></select></div>
      <button class="btn btn-primary w-100" onclick="var l=parseInt(document.getElementById('hsLeads').value)||0,c=parseFloat(document.getElementById('hsConv').value)||0,w=document.getElementById('hsWA').value,s=25;if(l>500)s+=20;else if(l>100)s+=10;if(c>10)s+=20;else if(c>5)s+=10;if(w==='advanced')s+=25;else if(w==='basic')s+=10;s=Math.min(s,100);var g=s>=80?'Excellent':s>=60?'Good':s>=40?'Developing':'Early Stage';document.getElementById('hsResult').innerHTML='<div class=«alert alert-»+(s>=60?\'success\':\'warning\')+'« mt-3 text-center»><h3>'+s+'/100</h3><p><strong>'+g+'</strong></p><button class=«btn btn-primary btn-sm» onclick=«Knowledge.showEmailPopup()»>Get Full Report</button></div>';">Generate Report</button>
      <div id="hsResult"></div>
    </div>
  `;
}) 
