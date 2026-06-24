const loginScreen = document.getElementById('loginScreen');
const appMain = document.getElementById('appMain');
const loginFormDiv = document.getElementById('loginForm');
const registerFormDiv = document.getElementById('registerForm');

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
    // Firestore में user document create करें (default role = client)
    await db.collection('users').doc(userCred.user.uid).set({
      name, email, role: 'client',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    // Registration के बाद UI अपने आप update हो जाएगा (onAuthStateChanged)
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
    // Firestore से user data लाएँ (role सहित)
    let userData = null;
    try {
      const doc = await db.collection('users').doc(user.uid).get();
      if (doc.exists) {
        userData = doc.data();
      } else {
        // अगर document मौजूद नहीं है (जैसे Console से सिर्फ Auth में user बनाया), तो default role के साथ बना दें
        userData = { name: user.email, email: user.email, role: 'admin' }; // fallback role
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
    initApp(userData.role); // role के अनुसार sidebar और dashboard load करें
    // Topbar में role दिखाएँ (वैकल्पिक)
    const roleBadge = document.getElementById('userRoleBadge');
    if (roleBadge) roleBadge.textContent = '(' + userData.role + ')';
  } else {
    window.currentUser = null;
    loginScreen.style.display = 'flex';
    appMain.style.display = 'none';
  }
});