// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAEOvOCqCbVAV1TUR8c8DchvCYahkQxV6c",
  authDomain: "avatar-vcard-app.firebaseapp.com",
  projectId: "avatar-vcard-app",
  storageBucket: "avatar-vcard-app.firebasestorage.app",
  messagingSenderId: "362969682654",
  appId: "1:362969682654:web:db40ac95acc24025cf684f"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();