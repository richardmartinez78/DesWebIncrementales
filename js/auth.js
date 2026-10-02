import { db, auth } from "./firebase/config.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import { 
  doc, 
  setDoc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// --- DICCIONARIO DE ERRORES COMPRENSIBLES ---
function obtenerMensajeError(codigo) {
  switch (codigo) {
    case "auth/email-already-in-use":
      return "El correo electrónico ya está registrado.";
    case "auth/invalid-email":
      return "El correo electrónico no es válido.";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Correo o contraseña incorrectos.";
    default:
      return "Ocurrió un error inesperado. Inténtalo de nuevo.";
  }
}

// --- REGISTRO DE USUARIOS ---
export async function registrarUsuario(nombre, apellido, email, password) {
  // Validación de campos
  if (!nombre.trim() || !apellido.trim() || !email.trim() || !password.trim()) {
    throw new Error("Todos los campos son obligatorios.");
  }
  if (password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres.");
  }

  try {
    // 1. Crear usuario en Auth
    const credencial = await createUserWithEmailAndPassword(auth, email, password);
    const user = credencial.user;

    // 2. Crear documento en Firestore usando el UID
    await setDoc(doc(db, "usuarios", user.uid), {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim(),
      rol: "estudiante",
      fechaRegistro: new Date()
    });

    return "Usuario registrado e iniciado sesión exitosamente.";
  } catch (error) {
    throw new Error(obtenerMensajeError(error.code) || error.message);
  }
}

// --- INICIO DE SESIÓN ---
export async function iniciarSesion(email, password) {
  if (!email.trim() || !password.trim()) {
    throw new Error("Por favor completa el correo y la contraseña.");
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    return "Sesión iniciada correctamente.";
  } catch (error) {
    throw new Error(obtenerMensajeError(error.code));
  }
}

// --- CIERRE DE SESIÓN ---
export async function cerrarSesion() {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
}

// --- ESCUCHADOR DE ESTADO (Mantiene sesión y actualiza Navbar) ---
export function observarEstadoUsuario(callbackProtegerRuta) {
  onAuthStateChanged(auth, async (user) => {
    actualizarNavbar(user);
    if (callbackProtegerRuta) {
      callbackProtegerRuta(user);
    }
  });
}

// --- ACTUALIZAR NAVBAR SEGÚN EL ESTADO ---
function actualizarNavbar(user) {
  const navAuth = document.querySelector("#navAuthOptions");
  if (!navAuth) return;

  if (user) {
    navAuth.innerHTML = `
      <li class="nav-item"><a class="nav-link" href="perfil.html">Mi Perfil</a></li>
      <li class="nav-item"><button class="btn btn-outline-light btn-sm ms-2" id="btnCerrarSesion">Cerrar Sesión</button></li>
    `;
    document.querySelector("#btnCerrarSesion")?.addEventListener("click", cerrarSesion);
  } else {
    navAuth.innerHTML = `
      <li class="nav-item"><a class="nav-link" href="login.html">Iniciar Sesión</a></li>
      <li class="nav-item"><a class="nav-link" href="registro.html">Registrarse</a></li>
    `;
  }
}

// --- OBTENER DATOS DEL USUARIO (Para perfil.html) ---
export async function obtenerDatosPerfil(uid) {
  const docRef = doc(db, "usuarios", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    throw new Error("No se encontraron los datos del perfil.");
  }
}