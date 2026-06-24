const firebaseConfig = {
  apiKey: "AIzaSyBZDaHJSt-4AV6EJYG76p8kcsIHf6LOxdU",
  authDomain: "avatar-wa-dual-crm.firebaseapp.com",
  projectId: "avatar-wa-dual-crm",
  storageBucket: "avatar-wa-dual-crm.firebasestorage.app",
  messagingSenderId: "946959261009",
  appId: "1:946959261009:web:db7ce59b52e454caf8c770"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();