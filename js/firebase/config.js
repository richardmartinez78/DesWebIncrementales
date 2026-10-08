/**
 * js/firebase/config.js
 * Configuración e instancias únicas de Firebase para toda la aplicación
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getFirestore, 
    doc, 
    collection, 
    runTransaction, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    // Coloca aquí tus credenciales de Firebase
    apiKey: "TU_API_KEY",
    authDomain: "tu-app.firebaseapp.com",
    projectId: "tu-app-id",
    storageBucket: "tu-app.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

let app = null;
let db = null;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (error) {
    console.warn("Modo local activo: Firebase no inicializado.", error);
}

// Exportamos las herramientas desde una única instancia
export { db, doc, collection, runTransaction, serverTimestamp };