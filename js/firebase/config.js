// js/firebase/config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Configuración de tu proyecto en Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCgj_twZ_2oNGnQSePSahjyCapZnyMwijg",
  authDomain: "fir-authentication-20451.firebaseapp.com",
  projectId: "fir-authentication-20451",
  storageBucket: "fir-authentication-20451.firebasestorage.app",
  messagingSenderId: "179675001258",
  appId: "1:179675001258:web:76d8a32ab0925430ecbbd3"
};

// Inicializar servicios de Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Re-exportar métodos requeridos por auth.js
export { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    doc, 
    setDoc, 
    getDoc 
};