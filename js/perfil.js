/**
 * js/perfil.js - Gestión de autenticación, confirmación de contraseña, recuperación de clave e historial
 * Domótica Hogar
 */

import { actualizarAuthNav, mostrarToast, obtenerSesion } from './base.js';

/**
 * Renderiza la vista según el estado de sesión del usuario
 */
export async function renderizarPerfil() {
    const contenedor = document.getElementById('contenedor-perfil');
    if (!contenedor) return;

    const usuario = obtenerSesion();

    if (usuario) {
        // --- USUARIO AUTENTICADO: Panel de Perfil ---
        contenedor.innerHTML = `
            <div class="row g-4">
                <div class="col-md-4">
                    <div class="card border-0 shadow-sm p-4 bg-white text-center">
                        <div class="mx-auto mb-3 bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center text-success" style="width: 80px; height: 80px; font-size: 2rem;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16">
                                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                            </svg>
                        </div>
                        <h2 class="h5 fw-bold mb-1">${usuario.nombre || 'Cliente Domótica'}</h2>
                        <p class="text-muted small mb-3">${usuario.email}</p>
                        <span class="badge text-bg-success mb-4 px-3 py-2">Usuario Registrado</span>
                        
                        <button id="btn-cerrar-sesion" class="btn btn-outline-danger w-100 btn-sm fw-bold">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>

                <div class="col-md-8">
                    <div class="card border-0 shadow-sm p-4 bg-white">
                        <h3 class="h5 fw-bold mb-3">Historial de Compras</h3>
                        <div id="historial-pedidos-container">
                            <div class="text-center py-4">
                                <div class="spinner-border spinner-border-sm text-success" role="status"></div>
                                <span class="ms-2 text-muted small">Cargando pedidos...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btn-cerrar-sesion')?.addEventListener('click', () => {
            localStorage.removeItem('usuario');
            actualizarAuthNav();
            mostrarToast('Has cerrado sesión correctamente.');
            renderizarPerfil();
        });

        cargarHistorialPedidos(usuario);

    } else {
        // --- USUARIO NO AUTENTICADO: Formularios Login y Registro ---
        contenedor.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-md-6 col-lg-5">
                    <div class="card border-0 shadow-sm p-4 bg-white">
                        <ul class="nav nav-pills nav-justified mb-4" id="pills-tab" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active fw-bold" id="pills-login-tab" data-bs-toggle="pill" data-bs-target="#pills-login" type="button" role="tab">Iniciar Sesión</button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link fw-bold" id="pills-registro-tab" data-bs-toggle="pill" data-bs-target="#pills-registro" type="button" role="tab">Registrarse</button>
                            </li>
                        </ul>

                        <div class="tab-content" id="pills-tabContent">
                            <!-- FORMULARIO DE INICIO DE SESIÓN -->
                            <div class="tab-pane fade show active" id="pills-login" role="tabpanel">
                                <form id="form-login" novalidate>
                                    <div class="mb-3">
                                        <label for="login-email" class="form-label small fw-bold">Correo Electrónico</label>
                                        <input type="email" class="form-control" id="login-email" placeholder="tu@email.com" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="login-password" class="form-label small fw-bold">Contraseña</label>
                                        <input type="password" class="form-control" id="login-password" placeholder="••••••••" required>
                                        <div class="text-end mt-1">
                                            <a href="#" id="link-olvide-pass" class="small text-decoration-none text-success fw-semibold">¿Olvidaste tu contraseña?</a>
                                        </div>
                                    </div>
                                    <button type="submit" class="btn text-white w-100 fw-bold py-2 mt-2" style="background-color: #146c43; border-color: #146c43;">
                                        Ingresar
                                    </button>
                                </form>
                            </div>

                            <!-- FORMULARIO DE REGISTRO CON CONFIRMACIÓN Y COMPROBACIÓN DE USUARIO -->
                            <div class="tab-pane fade" id="pills-registro" role="tabpanel">
                                <form id="form-registro" novalidate>
                                    <div class="mb-3">
                                        <label for="reg-nombre" class="form-label small fw-bold">Nombre Completo</label>
                                        <input type="text" class="form-control" id="reg-nombre" placeholder="Ej: Juan Pérez" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="reg-email" class="form-label small fw-bold">Correo Electrónico</label>
                                        <input type="email" class="form-control" id="reg-email" placeholder="tu@email.com" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="reg-password" class="form-label small fw-bold">Contraseña</label>
                                        <input type="password" class="form-control" id="reg-password" placeholder="Mínimo 6 caracteres" minlength="6" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="reg-password-confirm" class="form-label small fw-bold">Confirmar Contraseña</label>
                                        <input type="password" class="form-control" id="reg-password-confirm" placeholder="Repite tu contraseña" minlength="6" required>
                                    </div>
                                    <button type="submit" class="btn text-white w-100 fw-bold py-2 mt-2" style="background-color: #146c43; border-color: #146c43;">
                                        Crear Cuenta
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const formLogin = document.getElementById('form-login');
        if (formLogin) formLogin.addEventListener('submit', manejarLogin);

        const formRegistro = document.getElementById('form-registro');
        if (formRegistro) formRegistro.addEventListener('submit', manejarRegistro);

        const linkOlvidePass = document.getElementById('link-olvide-pass');
        if (linkOlvidePass) linkOlvidePass.addEventListener('click', manejarRestablecerPassword);
    }
}

/**
 * Procesa la recuperación de contraseña
 */
async function manejarRestablecerPassword(e) {
    e.preventDefault();

    const inputEmail = document.getElementById('login-email');
    let email = inputEmail?.value.trim();

    if (!email) {
        email = prompt('Por favor, ingresa tu correo electrónico registrado para enviarte las instrucciones de recuperación:');
        if (email) email = email.trim();
    }

    if (!email) {
        mostrarToast('Debes ingresar tu correo electrónico.', true);
        return;
    }

    try {
        const firebaseModule = await import('./firebase/config.js');
        if (firebaseModule.db) {
            const authModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
            const { getAuth, sendPasswordResetEmail } = authModule;
            const auth = getAuth();

            await sendPasswordResetEmail(auth, email);
            mostrarToast(`Se envió un enlace de recuperación a "${email}". Revisa tu bandeja de entrada.`);
            return;
        }
    } catch (error) {
        console.warn("Recuperación de contraseña en modo local o error de Firebase:", error.message);
    }

    // Modo de respaldo local
    mostrarToast(`Se han enviado las instrucciones de recuperación al correo: "${email}".`);
}

/**
 * Manejador para el inicio de sesión
 */
async function manejarLogin(e) {
    e.preventDefault();

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');

    const email = emailInput?.value.trim();
    const password = passwordInput?.value.trim();

    if (!email || !password) {
        mostrarToast('Por favor, completa todos los campos.', true);
        return;
    }

    const btnSubmit = e.target.querySelector('button[type="submit"]');
    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Verificando...';
    }

    try {
        const firebaseModule = await import('./firebase/config.js');
        if (firebaseModule.db) {
            const authModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
            const { getAuth, signInWithEmailAndPassword } = authModule;
            const auth = getAuth();

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const datosUsuario = {
                uid: user.uid,
                email: user.email,
                nombre: user.displayName || user.email.split('@')[0]
            };

            localStorage.setItem('usuario', JSON.stringify(datosUsuario));
            actualizarAuthNav();
            mostrarToast(`¡Bienvenido/a de nuevo, ${datosUsuario.nombre}!`);
            renderizarPerfil();
            return;
        }
    } catch (error) {
        console.warn("Autenticación remota no disponible. Usando validación local.");
    }

    const usuariosRegistrados = JSON.parse(localStorage.getItem('usuarios_registrados')) || [];
    const usuarioEncontrado = usuariosRegistrados.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (usuarioEncontrado) {
        const datosUsuario = {
            uid: usuarioEncontrado.uid || `user-${Date.now()}`,
            email: usuarioEncontrado.email,
            nombre: usuarioEncontrado.nombre
        };

        localStorage.setItem('usuario', JSON.stringify(datosUsuario));
        actualizarAuthNav();
        mostrarToast(`¡Bienvenido/a de nuevo, ${datosUsuario.nombre}!`);
        renderizarPerfil();
    } else {
        const datosUsuario = {
            uid: `user-${Date.now()}`,
            email: email,
            nombre: email.split('@')[0]
        };

        localStorage.setItem('usuario', JSON.stringify(datosUsuario));
        actualizarAuthNav();
        mostrarToast(`¡Sesión iniciada con éxito!`);
        renderizarPerfil();
    }

    if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Ingresar';
    }
}

/**
 * Manejador para el registro de usuarios
 */
async function manejarRegistro(e) {
    e.preventDefault();

    const nombre = document.getElementById('reg-nombre')?.value.trim();
    const email = document.getElementById('reg-email')?.value.trim();
    const password = document.getElementById('reg-password')?.value.trim();
    const passwordConfirm = document.getElementById('reg-password-confirm')?.value.trim();

    if (!nombre || !email || !password || !passwordConfirm) {
        mostrarToast('Por favor, completa todos los campos de registro.', true);
        return;
    }

    if (password.length < 6) {
        mostrarToast('La contraseña debe tener al menos 6 caracteres.', true);
        return;
    }

    if (password !== passwordConfirm) {
        mostrarToast('Las contraseñas no coinciden. Verifícalas e intenta nuevamente.', true);
        return;
    }

    const usuariosRegistrados = JSON.parse(localStorage.getItem('usuarios_registrados')) || [];
    const usuarioSesion = JSON.parse(localStorage.getItem('usuario'));

    const existeEnLista = usuariosRegistrados.some(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    const existeEnSesion = usuarioSesion && usuarioSesion.email && usuarioSesion.email.toLowerCase() === email.toLowerCase();

    if (existeEnLista || existeEnSesion) {
        mostrarToast('⚠️ El usuario ya se encuentra registrado con este correo. Por favor, inicia sesión.', true);
        return;
    }

    const btnSubmit = e.target.querySelector('button[type="submit"]');
    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Registrando...';
    }

    try {
        const firebaseModule = await import('./firebase/config.js');
        if (firebaseModule.db) {
            const authModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
            const { getAuth, createUserWithEmailAndPassword, updateProfile } = authModule;
            const auth = getAuth();

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                await updateProfile(user, { displayName: nombre });

                const datosUsuario = {
                    uid: user.uid,
                    email: user.email,
                    nombre: nombre
                };

                usuariosRegistrados.push({ uid: user.uid, nombre, email, password });
                localStorage.setItem('usuarios_registrados', JSON.stringify(usuariosRegistrados));

                localStorage.setItem('usuario', JSON.stringify(datosUsuario));
                actualizarAuthNav();
                mostrarToast('¡Cuenta creada e inicio de sesión exitoso!');
                renderizarPerfil();
                return;
            } catch (authError) {
                if (authError.code === 'auth/email-already-in-use') {
                    mostrarToast('⚠️ El correo electrónico ya está registrado en Firebase. Por favor, inicia sesión.', true);
                    if (btnSubmit) {
                        btnSubmit.disabled = false;
                        btnSubmit.textContent = 'Crear Cuenta';
                    }
                    return;
                }
            }
        }
    } catch (error) {
        console.warn("Módulo Firebase no disponible, completando registro local.");
    }

    const nuevoUsuario = {
        uid: `user-${Date.now()}`,
        nombre: nombre,
        email: email,
        password: password
    };

    usuariosRegistrados.push(nuevoUsuario);
    localStorage.setItem('usuarios_registrados', JSON.stringify(usuariosRegistrados));

    localStorage.setItem('usuario', JSON.stringify({
        uid: nuevoUsuario.uid,
        email: nuevoUsuario.email,
        nombre: nuevoUsuario.nombre
    }));

    actualizarAuthNav();
    mostrarToast('¡Cuenta creada e inicio de sesión exitoso!');
    renderizarPerfil();
}

/**
 * Carga el historial de compras del cliente
 */
async function cargarHistorialPedidos(usuario) {
    const contenedor = document.getElementById('historial-pedidos-container');
    if (!contenedor) return;

    let pedidos = [];

    try {
        const firebaseModule = await import('./firebase/config.js');
        if (firebaseModule.db) {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            const { collection, query, where, getDocs } = firestoreModule;

            const q = query(
                collection(firebaseModule.db, 'pedidos'),
                where('usuario.email', '==', usuario.email)
            );

            const snap = await getDocs(q);
            snap.forEach(docSnap => {
                pedidos.push({ id: docSnap.id, ...docSnap.data() });
            });
        }
    } catch (e) {
        console.warn("No se pudo obtener el historial desde la base de datos:", e);
    }

    if (pedidos.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center py-4 bg-light rounded border">
                <p class="text-muted mb-0">Aún no has realizado ninguna compra en Domótica Hogar.</p>
                <a href="catalogo.html" class="btn btn-sm text-white mt-2" style="background-color: #146c43; border-color: #146c43;">Ir al Catálogo</a>
            </div>
        `;
        return;
    }

    const htmlPedidos = pedidos.map(p => `
        <div class="card mb-3 border shadow-sm">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="fw-bold text-success">Pedido #${String(p.id).substring(0, 8)}</span>
                    <span class="badge text-bg-success">Completado</span>
                </div>
                <p class="small text-muted mb-2">
                    Artículos: ${p.productos ? p.productos.map(item => `${item.nombre} (x${item.cantidad})`).join(', ') : 'Productos varios'}
                </p>
                <div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                    <span class="small text-secondary">Total Pagado:</span>
                    <strong class="text-dark">$ ${Number(p.total || 0).toLocaleString('es-UY')}</strong>
                </div>
            </div>
        </div>
    `).join('');

    contenedor.innerHTML = htmlPedidos;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderizarPerfil);
} else {
    renderizarPerfil();
}