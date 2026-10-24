/**
 * js/firebase/config.js - Configuración central de conexión con Firebase
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Credenciales oficiales asociadas al proyecto 'fir-authentication-20451'
const firebaseConfig = {
    apiKey: "AIzaSyCgj_twZ_2oNGnQSePSahjyCapZnyMwijg",
    authDomain: "fir-authentication-20451.firebaseapp.com",
    projectId: "fir-authentication-20451",
    storageBucket: "fir-authentication-20451.appspot.com",
    messagingSenderId: "179675001258",
    appId: "1:179675001258:web:abcdef1234567890" // <--- Reemplaza esta cadena con el appId exacto de tu consola
};

// Inicializar la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// Exportar las instancias de Autenticación y Base de Datos
export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };