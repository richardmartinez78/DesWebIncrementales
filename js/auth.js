/**
 * js/auth.js - Gestión estricta de autenticación (Login y Registro)
 * Domótica Hogar
 */

import { mostrarToast, actualizarBotonAuth } from './base.js';

let auth = null;
let createUserWithEmailAndPassword = null;
let signInWithEmailAndPassword = null;
let updateProfile = null;

try {
    const firebaseModule = await import('./firebase/config.js');
    auth = firebaseModule.auth;

    const firebaseAuthModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    createUserWithEmailAndPassword = firebaseAuthModule.createUserWithEmailAndPassword;
    signInWithEmailAndPassword = firebaseAuthModule.signInWithEmailAndPassword;
    updateProfile = firebaseAuthModule.updateProfile;
} catch (e) {
    console.warn("Firebase no está disponible. Se aplicará validación local estricta.");
}

/**
 * Obtiene la lista de usuarios registrados en el navegador
 */
function obtenerUsuariosRegistrados() {
    return JSON.parse(localStorage.getItem('usuarios_registrados')) || [];
}

/**
 * Guarda un usuario en la lista local de registros
 */
function guardarUsuarioLocal(nuevoUsuario) {
    const usuarios = obtenerUsuariosRegistrados();
    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuarios_registrados', JSON.stringify(usuarios));
}

// -------------------------------------------------------------
// 1. REGISTRO DE USUARIOS
// -------------------------------------------------------------
const formRegistro = document.getElementById('form-registro');

if (formRegistro) {
    formRegistro.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('registro-nombre')?.value.trim();
        const email = document.getElementById('registro-email')?.value.trim().toLowerCase();
        const password = document.getElementById('registro-password')?.value;
        const confirmPassword = document.getElementById('registro-confirm')?.value;

        // Validar coincidencia de contraseñas
        if (password !== confirmPassword) {
            mostrarToast('Las contraseñas no coinciden.', true);
            return;
        }

        const btnSubmit = formRegistro.querySelector('button[type="submit"]');
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Creando cuenta...';
        }

        try {
            let usuarioSesion = null;
            const rolPredeterminado = 'cliente'; // Todo registro público adopta el rol cliente

            if (auth && createUserWithEmailAndPassword) {
                // Registro real en Firebase Auth
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                if (nombre && userCredential.user && updateProfile) {
                    await updateProfile(userCredential.user, { displayName: nombre });
                }

                const uid = userCredential.user.uid;
                const nombreFinal = nombre || email.split('@')[0];

                // Crear documento obligatorio en Firestore: /usuarios/{uid}
                try {
                    const firebaseModule = await import('./firebase/config.js');
                    if (firebaseModule.db) {
                        const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
                        await setDoc(doc(firebaseModule.db, 'usuarios', uid), {
                            nombre: nombreFinal,
                            email: email,
                            rol: rolPredeterminado
                        }, { merge: true });
                    }
                } catch (fsError) {
                    console.warn("No se pudo escribir el perfil en Firestore:", fsError);
                }

                usuarioSesion = {
                    uid: uid,
                    email: email,
                    nombre: nombreFinal,
                    rol: rolPredeterminado
                };
            } else {
                // Validación local: Verificar si el correo ya existe
                const usuariosLocales = obtenerUsuariosRegistrados();
                if (usuariosLocales.some(u => u.email === email)) {
                    mostrarToast('El correo electrónico ya se encuentra registrado.', true);
                    if (btnSubmit) {
                        btnSubmit.disabled = false;
                        btnSubmit.textContent = 'Crear Cuenta';
                    }
                    return;
                }

                usuarioSesion = {
                    uid: 'local-' + Date.now(),
                    email: email,
                    nombre: nombre || email.split('@')[0],
                    rol: rolPredeterminado
                };
            }

            // Guardar usuario en el registro local
            guardarUsuarioLocal({ nombre: nombre || email.split('@')[0], email, password, rol: rolPredeterminado });

            // Activar sesión actual
            localStorage.setItem('usuario', JSON.stringify(usuarioSesion));
            mostrarToast('¡Cuenta registrada e iniciada con éxito!');
            actualizarBotonAuth();

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);

        } catch (error) {
            console.error("Error durante el registro:", error);
            let mensaje = 'Ocurrió un error al registrar la cuenta.';

            if (error.code === 'auth/email-already-in-use') {
                mensaje = 'El correo electrónico ya se encuentra registrado.';
            } else if (error.code === 'auth/weak-password') {
                mensaje = 'La contraseña debe tener al menos 6 caracteres.';
            } else if (error.code === 'auth/invalid-email') {
                mensaje = 'El correo electrónico no es válido.';
            }

            mostrarToast(mensaje, true);

            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Crear Cuenta';
            }
        }
    });
}

// -------------------------------------------------------------
// 2. INICIO DE SESIÓN (LOGIN ESTRICTO)
// -------------------------------------------------------------
const formLogin = document.getElementById('form-login');

if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email')?.value.trim().toLowerCase();
        const password = document.getElementById('login-password')?.value;

        const btnSubmit = formLogin.querySelector('button[type="submit"]');
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Ingresando...';
        }

        try {
            let usuarioSesion = null;

            if (auth && signInWithEmailAndPassword) {
                // Intento de autenticación en Firebase
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const uid = userCredential.user.uid;
                let rolUsuario = 'cliente';

                // Consultar Firestore para recuperar el campo "rol" exacto
                try {
                    const firebaseModule = await import('./firebase/config.js');
                    if (firebaseModule.db) {
                        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
                        const docSnap = await getDoc(doc(firebaseModule.db, 'usuarios', uid));
                        if (docSnap.exists()) {
                            rolUsuario = docSnap.data().rol || 'cliente';
                        }
                    }
                } catch (fsError) {
                    console.warn("No se pudo obtener el rol desde Firestore:", fsError);
                }

                usuarioSesion = {
                    uid: uid,
                    email: userCredential.user.email,
                    nombre: userCredential.user.displayName || email.split('@')[0],
                    rol: rolUsuario
                };
            } else {
                // Validación local: Verificar que el usuario exista y la contraseña coincida
                const usuariosLocales = obtenerUsuariosRegistrados();
                const usuarioEncontrado = usuariosLocales.find(u => u.email === email && u.password === password);

                if (!usuarioEncontrado) {
                    mostrarToast('Usuario no registrado o contraseña incorrecta.', true);
                    if (btnSubmit) {
                        btnSubmit.disabled = false;
                        btnSubmit.textContent = 'Ingresar';
                    }
                    return;
                }

                usuarioSesion = {
                    uid: 'local-' + Date.now(),
                    email: usuarioEncontrado.email,
                    nombre: usuarioEncontrado.nombre,
                    rol: usuarioEncontrado.rol || 'cliente'
                };
            }

            // Activar sesión
            localStorage.setItem('usuario', JSON.stringify(usuarioSesion));
            mostrarToast('¡Inicio de sesión exitoso!');
            actualizarBotonAuth();

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);

        } catch (error) {
            console.error("Error durante el login:", error);
            let mensaje = 'Correo electrónico o contraseña incorrectos.';

            if (
                error.code === 'auth/user-not-found' ||
                error.code === 'auth/wrong-password' ||
                error.code === 'auth/invalid-credential'
            ) {
                mensaje = 'Usuario no registrado o contraseña incorrecta.';
            } else if (error.code === 'auth/invalid-email') {
                mensaje = 'El correo electrónico no es válido.';
            }

            mostrarToast(mensaje, true);

            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Ingresar';
            }
        }
    });
}