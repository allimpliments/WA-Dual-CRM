const loginScreen = document.getElementById('loginScreen');
const appMain = document.getElementById('appMain');
const loginFormDiv = document.getElementById('loginForm');
const registerFormDiv = document.getElementById('registerForm');

// ========== PUBLIC FORM VIEW ==========
const urlParams = new URLSearchParams(window.location.search);
const formId = urlParams.get('form');
if (formId) {
  // Hide login, show main area
  loginScreen.style.display = 'none';
  appMain.style.display = 'block';
  
  // Hide sidebar and topbar for clean public view
  document.getElementById('sidebar').style.display = 'none';
  document.querySelector('.topbar').style.display = 'none';
  
  (async () => {
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
        .public-form .preview-half { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .public-form .preview-full { grid-column: span 2; }
      </style>
      <div class="public-form">
        ${design.bannerUrl ? `<img src="${design.bannerUrl}" style="width:100%;border-radius:8px;margin-bottom:16px;">` : ''}
        ${design.logoUrl ? `<div style="text-align:center;margin-bottom:12px;"><img src="${design.logoUrl}" style="max-height:50px;"></div>` : ''}
        <h2>${form.name}</h2>
        <p style="text-align:center;color:#666;">${form.source || ''}</p>
        <form id="publicFormForm">
          ${(form.fields || []).map((f, i) => {
            let input = '';
            if (f.type === 'dropdown') {
              input = `<select ${f.required?'required':''}><option value="">Select...</option>${(f.options||[]).map(o => `<option>${o}</option>`).join('')}</select>`;
            } else if (f.type === 'radio') {
              input = (f.options||[]).map(o => `<label><input type="radio" name="field_${i}" value="${o}" ${f.required?'required':''}> ${o}</label><br>`).join('');
            } else if (f.type === 'checkbox') {
              input = (f.options||[]).map(o => `<label><input type="checkbox" name="field_${i}" value="${o}"> ${o}</label><br>`).join('');
            } else if (f.type === 'textarea') {
              input = `<textarea rows="3" ${f.required?'required':''}></textarea>`;
            } else if (f.type === 'file') {
              input = `<input type="file" ${f.required?'required':''}>`;
            } else {
              input = `<input type="${f.type}" ${f.required?'required':''} placeholder="${f.placeholder || ''}">`;
            }
            // Wrap in full or half width
            const widthClass = f.width === 'half' ? 'preview-half' : 'preview-full';
            return `<div class="${widthClass}"><div class="field"><label>${f.label} ${f.required?'*':''}</label>${input}</div></div>`;
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
      const formData = {};
      (form.fields || []).forEach((f, i) => {
        if (f.type === 'radio') {
          const selected = document.querySelector(`input[name="field_${i}"]:checked`);
          formData[f.label] = selected ? selected.value : '';
        } else if (f.type === 'checkbox') {
          const checked = document.querySelectorAll(`input[name="field_${i}"]:checked`);
          formData[f.label] = Array.from(checked).map(c => c.value).join(', ');
        } else {
          // Get the input by index
          const inputs = document.querySelectorAll('#publicFormForm input, #publicFormForm select, #publicFormForm textarea');
          if (inputs[i]) formData[f.label] = inputs[i].value;
        }
      });
      try {
        await db.collection('formSubmissions').add({
          formId: formId,
          data: formData,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        document.getElementById('publicFormMsg').innerHTML = '<span class="text-success">' + (form.successMsg || 'Thank you!') + '</span>';
        document.getElementById('publicFormForm').reset();
      } catch (err) {
        document.getElementById('publicFormMsg').innerHTML = '<span class="text-danger">Error submitting form.</span>';
      }
    });
  })();
  // Stop further execution
  return;
}

// ========== NORMAL AUTH FLOW ==========
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

document.getElementById('registerBtn').addEventListener('click', async () => {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  if (!name || !email || password.length < 6) return alert('Please fill all fields correctly.');
  try {
    const userCred = await auth.createUserWithEmailAndPassword(email, password);
    await db.collection('users').doc(userCred.user.uid).set({
      name, email, role: 'client',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (err) {
    alert(err.message);
  }
});

document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    alert(err.message);
  }
});

auth.onAuthStateChanged(async (user) => {
  if (user) {
    let userData = null;
    try {
      const doc = await db.collection('users').doc(user.uid).get();
      if (doc.exists) {
        userData = doc.data();
      } else {
        userData = { name: user.email, email: user.email, role: 'admin' };
        await db.collection('users').doc(user.uid).set({
          name: user.email,
          email: user.email,
          role: 'admin',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      userData = { name: user.email, email: user.email, role: 'admin' };
    }
    window.currentUser = { uid: user.uid, ...userData };
    loginScreen.style.display = 'none';
    appMain.style.display = 'block';
    initApp(userData.role);
    const roleBadge = document.getElementById('userRoleBadge');
    if (roleBadge) roleBadge.textContent = '(' + userData.role + ')';
  } else {
    window.currentUser = null;
    loginScreen.style.display = 'flex';
    appMain.style.display = 'none';
  }
});
