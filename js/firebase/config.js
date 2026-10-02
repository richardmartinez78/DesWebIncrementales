import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgj_twZ_2oNGnQSePSahjyCapZnyMwijg",
  authDomain: "fir-authentication-20451.firebaseapp.com",
  projectId: "fir-authentication-20451",
  storageBucket: "fir-authentication-20451.firebasestorage.app",
  messagingSenderId: "179675001258",
  appId: "1:179675001258:web:76d8a32ab0925430ecbbd3"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);