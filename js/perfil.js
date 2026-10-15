/**
 * js/perfil.js - Carga instantánea del perfil, autenticación y roles con Firestore
 * Domótica Hogar
 */

import { actualizarAuthNav, mostrarToast, obtenerSesion } from './base.js';

export async function renderizarPerfil() {
    const contenedor = document.getElementById('contenedor-perfil');
    if (!contenedor) return;

    const usuario = obtenerSesion();

    if (usuario) {
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
                        <p class="text-muted small mb-1">${usuario.email}</p>
                        <p class="text-success small fw-bold mb-3 text-uppercase">Rol: ${usuario.rol || 'cliente'}</p>
                        
                        <button id="btn-cerrar-sesion" class="btn btn-outline-danger w-100 btn-sm fw-bold">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>

                <div class="col-md-8">
                    <div class="card border-0 shadow-sm p-4 bg-white">
                        <h3 class="h5 fw-bold mb-3">Mis Pedidos Realizados</h3>
                        <div id="historial-pedidos-container">
                            <div class="text-center py-4">
                                <div class="spinner-border spinner-border-sm text-success" role="status"></div>
                                <span class="ms-2 text-muted small">Cargando tus pedidos...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btn-cerrar-sesion')?.addEventListener('click', async () => {
            try {
                const firebaseModule = await import('./firebase/config.js');
                const authModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
                if (firebaseModule.auth) {
                    await authModule.signOut(firebaseModule.auth);
                }
            } catch (e) {
                console.warn("Cierre de sesión local");
            }
            localStorage.removeItem('usuario');
            actualizarAuthNav();
            mostrarToast('Has cerrado sesión correctamente.');
            renderizarPerfil();
        });

        cargarHistorialPedidos(usuario);

    } else {
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
                            <div class="tab-pane fade show active" id="pills-login" role="tabpanel">
                                <form id="form-login" novalidate>
                                    <div class="mb-3">
                                        <label for="login-email" class="form-label small fw-bold">Correo Electrónico</label>
                                        <input type="email" class="form-control" id="login-email" placeholder="tu@email.com" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="login-password" class="form-label small fw-bold">Contraseña</label>
                                        <input type="password" class="form-control" id="login-password" placeholder="••••••••" required>
                                    </div>
                                    <button type="submit" class="btn text-white w-100 fw-bold py-2 mt-2" style="background-color: #146c43; border-color: #146c43;">
                                        Ingresar
                                    </button>
                                </form>
                            </div>

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

        document.getElementById('form-login')?.addEventListener('submit', manejarLogin);
        document.getElementById('form-registro')?.addEventListener('submit', manejarRegistro);
    }
}

async function manejarLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value.trim();
    const btnSubmit = e.target.querySelector('button[type="submit"]');

    if (!email || !password) {
        mostrarToast('Por favor, completa todos los campos.', true);
        return;
    }

    try {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Ingresando...';

        const firebaseModule = await import('./firebase/config.js');
        const authModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

        // 1. Iniciar sesión Firebase Auth
        const userCredential = await authModule.signInWithEmailAndPassword(firebaseModule.auth, email, password);
        const user = userCredential.user;

        // 2. Obtener rol desde Firestore
        const docRef = firestoreModule.doc(firebaseModule.db, 'usuarios', user.uid);
        const docSnap = await firestoreModule.getDoc(docRef);
        
        let rolUsuario = 'cliente';
        let nombreUsuario = user.displayName || email.split('@')[0];

        if (docSnap.exists()) {
            rolUsuario = docSnap.data().rol || 'cliente';
            nombreUsuario = docSnap.data().nombre || nombreUsuario;
        }

        const datosUsuario = {
            uid: user.uid,
            email: user.email,
            nombre: nombreUsuario,
            rol: rolUsuario
        };

        localStorage.setItem('usuario', JSON.stringify(datosUsuario));
        actualizarAuthNav();
        mostrarToast(`¡Bienvenido/a, ${datosUsuario.nombre}!`);
        renderizarPerfil();

    } catch (error) {
        console.error("Error en login:", error);
        mostrarToast('Credenciales incorrectas o el servicio no está disponible.', true);
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = 'Ingresar';
    }
}

async function manejarRegistro(e) {
    e.preventDefault();
    const nombre = document.getElementById('reg-nombre')?.value.trim();
    const email = document.getElementById('reg-email')?.value.trim();
    const password = document.getElementById('reg-password')?.value.trim();
    const passwordConfirm = document.getElementById('reg-password-confirm')?.value.trim();
    const btnSubmit = e.target.querySelector('button[type="submit"]');

    if (!nombre || !email || !password || !passwordConfirm) {
        mostrarToast('Por favor, completa todos los campos.', true);
        return;
    }

    if (password !== passwordConfirm) {
        mostrarToast('Las contraseñas no coinciden.', true);
        return;
    }

    try {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Creando cuenta...';

        const firebaseModule = await import('./firebase/config.js');
        const authModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

        // 1. Crear en Firebase Auth
        const userCredential = await authModule.createUserWithEmailAndPassword(firebaseModule.auth, email, password);
        const user = userCredential.user;

        // 2. Guardar documento en Firestore con rol cliente
        await firestoreModule.setDoc(firestoreModule.doc(firebaseModule.db, 'usuarios', user.uid), {
            nombre: nombre,
            email: email,
            rol: 'cliente',
            fechaRegistro: new Date().toISOString()
        });

        const datosUsuario = {
            uid: user.uid,
            email: user.email,
            nombre: nombre,
            rol: 'cliente'
        };

        localStorage.setItem('usuario', JSON.stringify(datosUsuario));
        actualizarAuthNav();
        mostrarToast('¡Cuenta creada con éxito!');
        renderizarPerfil();

    } catch (error) {
        console.error("Error en registro:", error);
        let mensaje = 'Error al crear la cuenta.';
        if (error.code === 'auth/email-already-in-use') mensaje = 'El correo ya está registrado.';
        if (error.code === 'auth/weak-password') mensaje = 'La contraseña debe tener al menos 6 caracteres.';
        
        mostrarToast(mensaje, true);
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = 'Crear Cuenta';
    }
}

async function cargarHistorialPedidos(usuario) {
    const contenedor = document.getElementById('historial-pedidos-container');
    if (!contenedor) return;

    if (!usuario || (!usuario.email && !usuario.uid)) {
        contenedor.innerHTML = `
            <div class="text-center py-4 bg-light rounded border">
                <p class="text-muted mb-0">Debes iniciar sesión para ver tus compras.</p>
            </div>
        `;
        return;
    }

    const emailUsuario = usuario.email ? usuario.email.toLowerCase().trim() : '';
    let pedidos = [];

    // 1. Carga Local (Respaldo/Instantáneo)
    const pedidosLocales = JSON.parse(localStorage.getItem('pedidos_locales')) || [];
    pedidos = pedidosLocales.filter(p => p.usuario && p.usuario.email && p.usuario.email.toLowerCase() === emailUsuario);

    // 2. Consulta a Firestore (Actualizado)
    try {
        const firebaseModule = await import('./firebase/config.js');
        if (firebaseModule.db && usuario.email) {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            const { collection, query, where, getDocs } = firestoreModule;

            const q = query(collection(firebaseModule.db, 'pedidos'), where('usuario.email', '==', usuario.email));
            
            const promesaFirestore = getDocs(q);
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1500));
            const snap = await Promise.race([promesaFirestore, timeout]);

            snap.forEach(docSnap => {
                const data = docSnap.data();
                if (!pedidos.some(p => p.id === docSnap.id)) {
                    pedidos.push({ id: docSnap.id, ...data });
                }
            });
        }
    } catch (e) {
        console.warn("Carga de pedidos con fallback local (Timeout o sin conexión).");
    }

    if (pedidos.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center py-4 bg-light rounded border">
                <p class="text-muted mb-0">No hay compras registradas para la cuenta <strong>${usuario.email}</strong>.</p>
                <a href="catalogo.html" class="btn btn-sm text-white mt-2" style="background-color: #146c43; border-color: #146c43;">Ir al Catálogo</a>
            </div>
        `;
        return;
    }

    pedidos.sort((a, b) => new Date(b.fechaIso || b.fecha || 0) - new Date(a.fechaIso || a.fecha || 0));

    contenedor.innerHTML = pedidos.map(p => {
        const fechaMostrar = p.fecha || 'Reciente';
        const estadoMostrar = p.estado || 'completado';
        const productosList = p.productos || [];

        const detalleItemsHTML = productosList.map(prod => `
            <div class="d-flex justify-content-between align-items-center small border-bottom py-2">
                <div>
                    <span class="fw-bold">${prod.nombre}</span>
                    <span class="text-muted ms-1">(x${prod.cantidad} un. a $ ${Number(prod.precio).toLocaleString('es-UY')})</span>
                </div>
                <span class="fw-bold text-dark">$ ${Number(prod.subtotal).toLocaleString('es-UY')}</span>
            </div>
        `).join('');

        return `
            <div class="card mb-3 border shadow-sm">
                <div class="card-header bg-white d-flex justify-content-between align-items-center py-2">
                    <span class="small fw-bold text-success">ID: #${String(p.id).substring(0, 10)}</span>
                    <span class="badge text-bg-success text-uppercase">${estadoMostrar}</span>
                </div>
                <div class="card-body py-2">
                    <p class="extra-small text-muted mb-2" style="font-size: 0.8rem;">Fecha de compra: ${fechaMostrar}</p>
                    <div class="mb-2">
                        ${detalleItemsHTML}
                    </div>
                    <div class="d-flex justify-content-between align-items-center pt-2 mt-1 fw-bold">
                        <span>Total Pagado:</span>
                        <span class="text-success fs-6">$ ${Number(p.total || 0).toLocaleString('es-UY')} UYU</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderizarPerfil);
} else {
    renderizarPerfil();
}