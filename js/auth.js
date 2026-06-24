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
        // fallback admin
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

    // Force hide login, show main
    loginScreen.style.display = 'none';
    loginScreen.style.visibility = 'hidden';
    loginScreen.style.height = '0px';
    appMain.style.display = 'block';

    initApp(userData.role);

    const roleBadge = document.getElementById('userRoleBadge');
    if (roleBadge) roleBadge.textContent = '(' + userData.role + ')';
  } else {
    window.currentUser = null;
    loginScreen.style.display = 'flex';
    loginScreen.style.visibility = 'visible';
    loginScreen.style.height = '100vh';
    appMain.style.display = 'none';
  }
});
