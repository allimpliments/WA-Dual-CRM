// auth.js — Multi-User Auth with Home Page Redirect, Permissions, Pending Approval, clientId, SaaS Ready
const loginScreen = document.getElementById('loginScreen');
const appMain = document.getElementById('appMain');
const loginFormDiv = document.getElementById('loginForm');
const registerFormDiv = document.getElementById('registerForm');

// ========== PUBLIC FORM VIEW ==========
const urlParams = new URLSearchParams(window.location.search);
const formId = urlParams.get('form');

if (formId) {
  loginScreen.style.display = 'none';
  appMain.style.display = 'block';
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.style.display = 'none';
  const topbar = document.querySelector('.topbar');
  if (topbar) topbar.style.display = 'none';

  (async () => {
    try {
      const doc = await db.collection('forms').doc(formId).get();
      if (!doc.exists) {
        document.getElementById('contentArea').innerHTML = '<p class="text-center py-5">Form not found.</p>';
        return;
      }
      const form = doc.data();
      const design = form.design || {};

      let html = `
        <style>
          body { background: #f0f2f5; }
          .public-form { max-width: 600px; margin: 40px auto; background: ${design.backgroundColor || '#fff'}; border-radius: 12px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); font-family: ${design.fontFamily || 'Inter, sans-serif'}; }
          .public-form h2 { color: ${design.titleColor || '#1c1e21'}; font-size: ${design.titleFontSize || '24px'}; text-align: center; }
          .public-form .field { margin-bottom: 16px; }
          .public-form label { display: block; font-weight: 500; margin-bottom: 4px; }
          .public-form input, .public-form select, .public-form textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
          .public-form button { background: ${design.primaryColor || '#1877f2'}; color: ${design.buttonTextColor || '#fff'}; border: none; padding: 12px; border-radius: 8px; font-weight: 600; width: 100%; cursor: pointer; font-size: 16px; }
          .public-form .half { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .public-form .full { grid-column: span 2; }
          .error { border: 2px solid red !important; }
        </style>
        <div class="public-form">
          ${design.bannerUrl ? `<img src="${design.bannerUrl}" style="width:100%;border-radius:8px;margin-bottom:16px;">` : ''}
          ${design.logoUrl ? `<div style="text-align:center;margin-bottom:12px;"><img src="${design.logoUrl}" style="max-height:50px;"></div>` : ''}
          <h2>${form.name}</h2>
          <p style="text-align:center;color:#666;">${form.source || ''}</p>
          <form id="publicFormForm">
            ${(form.fields || []).map((f, i) => {
              let input = '';
              const reqAttr = f.required ? 'data-required="true"' : '';
              if (f.type === 'dropdown') {
                input = `<select ${reqAttr}><option value="">Select...</option>${(f.options||[]).map(o => `<option>${o}</option>`).join('')}</select>`;
              } else if (f.type === 'radio') {
                input = (f.options||[]).map(o => `<label><input type="radio" name="field_${i}" value="${o}" ${reqAttr}> ${o}</label><br>`).join('');
              } else if (f.type === 'checkbox') {
                input = (f.options||[]).map(o => `<label><input type="checkbox" name="field_${i}" value="${o}"> ${o}</label><br>`).join('');
              } else if (f.type === 'textarea') {
                input = `<textarea rows="3" ${reqAttr}></textarea>`;
              } else if (f.type === 'file') {
                input = `<input type="file" ${reqAttr}>`;
              } else {
                input = `<input type="${f.type}" ${reqAttr} placeholder="${f.placeholder || ''}">`;
              }
              const widthClass = f.width === 'half' ? 'half' : 'full';
              return `<div class="${widthClass}"><div class="field"><label>${f.label} ${f.required ? '<span style="color:red;">*</span>' : ''}</label>${input}</div></div>`;
            }).join('')}
            <button type="submit">Submit</button>
          </form>
          <p id="publicFormMsg" style="text-align:center;margin-top:12px;"></p>
        </div>
        ${design.customCSS ? `<style>${design.customCSS}</style>` : ''}
      `;
      document.getElementById('contentArea').innerHTML = html;

      document.getElementById('publicFormForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fields = form.fields || [];
        let isValid = true;
        document.querySelectorAll('#publicFormForm .error').forEach(el => el.classList.remove('error'));
        fields.forEach((f, i) => {
          if (!f.required) return;
          let value = '';
          if (f.type === 'radio') {
            const selected = document.querySelector(`input[name="field_${i}"]:checked`);
            value = selected ? selected.value : '';
          } else if (f.type === 'checkbox') {
            const checked = document.querySelectorAll(`input[name="field_${i}"]:checked`);
            value = Array.from(checked).map(c => c.value).join(', ');
          } else {
            const inputs = document.querySelectorAll('#publicFormForm input, #publicFormForm select, #publicFormForm textarea');
            if (inputs[i]) value = inputs[i].value.trim();
          }
          if (!value) {
            isValid = false;
            const fieldContainer = document.querySelector(`#publicFormForm .field:nth-of-type(${i+1})`);
            if (fieldContainer) {
              const inputEl = fieldContainer.querySelector('input, select, textarea');
              if (inputEl) inputEl.classList.add('error');
            }
          }
        });
        if (!isValid) {
          document.getElementById('publicFormMsg').innerHTML = '<span class="text-danger">Please fill all required fields.</span>';
          return;
        }
        const formData = {};
        fields.forEach((f, i) => {
          if (f.type === 'radio') {
            const selected = document.querySelector(`input[name="field_${i}"]:checked`);
            formData[f.label] = selected ? selected.value : '';
          } else if (f.type === 'checkbox') {
            const checked = document.querySelectorAll(`input[name="field_${i}"]:checked`);
            formData[f.label] = Array.from(checked).map(c => c.value).join(', ');
          } else {
            const inputs = document.querySelectorAll('#publicFormForm input, #publicFormForm select, #publicFormForm textarea');
            if (inputs[i]) formData[f.label] = inputs[i].value;
          }
        });
        try {
          await db.collection('formSubmissions').add({
            formId: formId,
            data: formData,
            clientId: form.clientId || null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
          await db.collection('forms').doc(formId).update({ submissionCount: firebase.firestore.FieldValue.increment(1) });
          await LeadCapture.fromForm(formData, formId);
          document.getElementById('publicFormMsg').innerHTML = `<span class="text-success">${form.successMsg || 'Thank you! Your response has been recorded.'}</span>`;
          document.getElementById('publicFormForm').reset();
        } catch (err) { console.error(err); document.getElementById('publicFormMsg').innerHTML = '<span class="text-danger">Error submitting form. Please try again.</span>'; }
      });
    } catch (e) { console.error(e); document.getElementById('contentArea').innerHTML = '<p class="text-center py-5">Error loading form.</p>'; }
  })();
} else {
  // ========== NORMAL AUTH FLOW ==========
  console.log('Auth script loaded — SaaS Multi-Tenant Mode');

  // Toggle between Login and Register forms
  document.getElementById('showRegister').addEventListener('click', (e) => {
    e.preventDefault();
    loginFormDiv.style.display = 'none';
    registerFormDiv.style.display = 'block';
  });
  document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault();
    registerFormDiv.style.display = 'none';
    loginFormDiv.style.display = 'block';
  });

  // ========== REGISTER (Direct on Index Page - Fallback) ==========
  document.getElementById('registerBtn').addEventListener('click', async () => {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    if (!name || !email || password.length < 6) return alert('Please fill all fields correctly.');
    try {
      const userCred = await auth.createUserWithEmailAndPassword(email, password);
      await db.collection('users').doc(userCred.user.uid).set({
        name, email, role: 'client_owner', plan: 'free',
        status: 'pending',
        permissions: {},
        clientId: null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert('Registration successful! Your account is pending approval. You will be redirected to the CRM.');
      window.location.href = '/WA-Dual-CRM/';
    } catch (err) { alert(err.message); }
  });

  // ========== LOGIN ==========
  document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) return alert('Please enter email and password.');
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (err) { alert(err.message); }
  });

  // ========== AUTH STATE CHANGE — MAIN ENTRY POINT ==========
  auth.onAuthStateChanged(async (user) => {
    console.log('Auth state changed', user ? 'logged in' : 'logged out');
    if (user) {
      let userData = null;
      try {
        const doc = await db.collection('users').doc(user.uid).get();
        if (doc.exists) {
          userData = doc.data();
        } else {
          // Auto-create user document if not exists (fallback)
          userData = { name: user.email, email: user.email, role: 'admin', status: 'approved', permissions: {}, clientId: null };
          await db.collection('users').doc(user.uid).set({
            name: user.email,
            email: user.email,
            role: 'admin',
            status: 'approved',
            permissions: {},
            clientId: null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        userData = { name: user.email, email: user.email, role: 'admin', status: 'approved', permissions: {}, clientId: null };
      }

      // Set global currentUser object
      window.currentUser = {
        uid: user.uid,
        name: userData.name || user.email,
        email: userData.email || user.email,
        role: userData.role || 'admin',
        status: userData.status || 'approved',
        clientId: userData.clientId || null,
        permissions: userData.permissions || {},
        plan: userData.plan || 'free',
        phone: userData.phone || ''
      };

      // ====== PENDING APPROVAL CHECK ======
      if (userData.status === 'pending') {
        loginScreen.style.display = 'none';
        appMain.style.display = 'block';
        const ca = document.getElementById('contentArea');
        if (ca) ca.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#f8fafc;">
            <div style="text-align:center;max-width:500px;padding:40px;background:#fff;border-radius:20px;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
              <i class="fas fa-clock fa-4x" style="color:#f59e0b;margin-bottom:20px;"></i>
              <h3 style="font-weight:800;color:#0f172a;">Account Pending Approval</h3>
              <p style="color:#64748b;margin:12px 0;">Your account is currently under review by the platform administrator. You will receive access once approved.</p>
              <div style="background:#fef3c7;padding:12px;border-radius:10px;margin-top:16px;">
                <small style="color:#92400e;"><i class="fas fa-info-circle me-1"></i> If this is urgent, please contact your platform administrator.</small>
              </div>
              <button onclick="auth.signOut();window.location.reload();" style="margin-top:20px;padding:8px 24px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:10px;cursor:pointer;font-weight:600;color:#64748b;">← Back to Login</button>
            </div>
          </div>`;
        return;
      }

      // ====== REJECTED CHECK ======
      if (userData.status === 'rejected') {
        loginScreen.style.display = 'none';
        appMain.style.display = 'block';
        const ca = document.getElementById('contentArea');
        if (ca) ca.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#f8fafc;">
            <div style="text-align:center;max-width:500px;padding:40px;background:#fff;border-radius:20px;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
              <i class="fas fa-times-circle fa-4x" style="color:#ef4444;margin-bottom:20px;"></i>
              <h3 style="font-weight:800;color:#0f172a;">Account Rejected</h3>
              <p style="color:#64748b;margin:12px 0;">Your account registration has been rejected by the platform administrator. Please contact support for more information.</p>
              <button onclick="auth.signOut();window.location.reload();" style="margin-top:20px;padding:8px 24px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:10px;cursor:pointer;font-weight:600;color:#64748b;">← Back to Login</button>
            </div>
          </div>`;
        return;
      }

      // ====== SUSPENDED CHECK ======
      if (userData.status === 'suspended') {
        loginScreen.style.display = 'none';
        appMain.style.display = 'block';
        const ca = document.getElementById('contentArea');
        if (ca) ca.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#f8fafc;">
            <div style="text-align:center;max-width:500px;padding:40px;background:#fff;border-radius:20px;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
              <i class="fas fa-ban fa-4x" style="color:#f59e0b;margin-bottom:20px;"></i>
              <h3 style="font-weight:800;color:#0f172a;">Account Suspended</h3>
              <p style="color:#64748b;margin:12px 0;">Your account has been temporarily suspended. Please contact your platform administrator for assistance.</p>
              <button onclick="auth.signOut();window.location.reload();" style="margin-top:20px;padding:8px 24px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:10px;cursor:pointer;font-weight:600;color:#64748b;">← Back to Login</button>
            </div>
          </div>`;
        return;
      }

      // ====== INACTIVE CHECK ======
      if (userData.status === 'inactive') {
        loginScreen.style.display = 'none';
        appMain.style.display = 'block';
        const ca = document.getElementById('contentArea');
        if (ca) ca.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#f8fafc;">
            <div style="text-align:center;max-width:500px;padding:40px;background:#fff;border-radius:20px;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
              <i class="fas fa-user-slash fa-4x" style="color:#94a3b8;margin-bottom:20px;"></i>
              <h3 style="font-weight:800;color:#0f172a;">Account Inactive</h3>
              <p style="color:#64748b;margin:12px 0;">Your account is currently inactive. Please contact your platform administrator to reactivate it.</p>
              <button onclick="auth.signOut();window.location.reload();" style="margin-top:20px;padding:8px 24px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:10px;cursor:pointer;font-weight:600;color:#64748b;">← Back to Login</button>
            </div>
          </div>`;
        return;
      }

      // 🔐 Load permissions BEFORE initApp
      try {
        const perms = await Permissions.getEffectivePermissions();
        window.__currentPermissions = perms;
      } catch (e) {
        console.error('Permissions load error:', e);
        window.__currentPermissions = { modules: {}, isPlatformRole: false, level: 99 };
      }

      // 🌐 Load user language preference
      if (typeof I18n !== 'undefined' && I18n.init) {
        I18n.init();
      }

      // Update last login timestamp
      try {
        await db.collection('users').doc(user.uid).update({
          lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch(e) { /* silent */ }

      // Show the app
      loginScreen.style.display = 'none';
      appMain.style.display = 'block';
      initApp(userData.role);
      const roleBadge = document.getElementById('userRoleBadge');
      if (roleBadge) roleBadge.textContent = '(' + (userData.role || 'admin') + ')';
    } else {
      // User logged out
      window.currentUser = null;
      window.__currentPermissions = null;
      loginScreen.style.display = 'flex';
      appMain.style.display = 'none';
    }
  });
}
