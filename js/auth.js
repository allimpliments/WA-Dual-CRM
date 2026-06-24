// js/auth.js – Complete file for 11 Avatar WA Dual CRM

const loginScreen = document.getElementById('loginScreen');
const appMain = document.getElementById('appMain');
const loginFormDiv = document.getElementById('loginForm');
const registerFormDiv = document.getElementById('registerForm');

// Toggle between Login and Register
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

// Register new user
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
    // onAuthStateChanged will handle the rest
  } catch (err) {
    alert(err.message);
  }
});

// Login existing user
document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    alert(err.message);
  }
});

// Auth state listener
auth.onAuthStateChanged(async (user) => {
  if (user) {
    // Fetch user data from Firestore
    let userData = null;
    try {
      const doc = await db.collection('users').doc(user.uid).get();
      if (doc.exists) {
        userData = doc.data();
      } else {
        // Fallback: create admin document if it doesn't exist
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

    // Hide login screen completely (no gap)
    loginScreen.style.display = 'none';
    loginScreen.style.height = '0px';
    loginScreen.style.minHeight = '0px';
    loginScreen.style.overflow = 'hidden';
    loginScreen.style.padding = '0px';
    loginScreen.style.margin = '0px';

    // Show main app
    appMain.style.display = 'block';

    // Initialize the panel
    initApp(userData.role);

    // Show role in topbar
    const roleBadge = document.getElementById('userRoleBadge');
    if (roleBadge) roleBadge.textContent = '(' + userData.role + ')';

  } else {
    window.currentUser = null;

    // Show login screen again
    loginScreen.style.display = 'flex';
    loginScreen.style.height = '100vh';
    loginScreen.style.minHeight = '100vh';
    loginScreen.style.overflow = '';
    loginScreen.style.padding = '';
    loginScreen.style.margin = '';

    // Hide main app
    appMain.style.display = 'none';
  }
});
