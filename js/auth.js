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
    // Automatically log in after registration
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
    const doc = await db.collection('users').doc(user.uid).get();
    const userData = doc.data();
    window.currentUser = { uid: user.uid, ...userData };
    loginScreen.style.display = 'none';
    appMain.style.display = 'block';
    initApp(userData.role);
  } else {
    window.currentUser = null;
    loginScreen.style.display = 'flex';
    appMain.style.display = 'none';
  }
});