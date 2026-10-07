/**
 * js/base.js - Control global de sesión, navegación activa, carrito y toasts
 * Domótica Hogar
 */

const CLAVES_SESION = [
    'usuario', 'usuarioActual', 'usuario_actual', 'usuarioLogueado',
    'usuario_logueado', 'user', 'currentUser', 'current_user',
    'loggedUser', 'sesion', 'session', 'sesionIniciada', 'token',
    'auth', 'login', 'perfil'
];

/**
 * Detecta si existe un usuario con sesión activa en Firebase o localStorage/sessionStorage
 */
export function obtenerSesion() {
    const storages = [localStorage, sessionStorage];

    for (const storage of storages) {
        try {
            // 1. Verificación de Firebase Auth en Storage
            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                if (key && key.startsWith('firebase:authUser')) {
                    const val = storage.getItem(key);
                    if (val && val !== 'null' && val !== 'undefined' && val.trim() !== '') {
                        return true;
                    }
                }
            }

            // 2. Verificación de claves de sesión personalizadas
            for (const clave of CLAVES_SESION) {
                const val = storage.getItem(clave);
                if (!val) continue;

                const limpio = val.trim();
                if (
                    limpio !== '' &&
                    limpio !== 'null' &&
                    limpio !== 'undefined' &&
                    limpio !== 'false' &&
                    limpio !== '0' &&
                    limpio !== '[]' &&
                    limpio !== '{}'
                ) {
                    return true;
                }
            }
        } catch (e) {
            console.error("Error al verificar la sesión:", e);
        }
    }
    return false;
}

/**
 * Actualiza los botones de autenticación en la barra de navegación (#nav-auth-container)
 */
export function actualizarBotonAuth() {
    const authContainer = document.getElementById('nav-auth-container');
    if (!authContainer) return;

    const haySesion = obtenerSesion();

    if (haySesion) {
        authContainer.innerHTML = `
            <a href="perfil.html" class="btn btn-outline-light btn-sm rounded-pill px-3">Mi perfil</a>
            <button id="btn-logout" class="btn btn-danger btn-sm rounded-pill px-3" type="button">Salir</button>
        `;

        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.onclick = () => {
                [localStorage, sessionStorage].forEach(storage => {
                    try {
                        CLAVES_SESION.forEach(k => storage.removeItem(k));

                        const keysToRemove = [];
                        for (let i = 0; i < storage.length; i++) {
                            const key = storage.key(i);
                            if (key && key.startsWith('firebase:authUser')) {
                                keysToRemove.push(key);
                            }
                        }
                        keysToRemove.forEach(k => storage.removeItem(k));
                    } catch (e) {
                        console.error("Error al cerrar sesión:", e);
                    }
                });

                window.location.href = 'index.html';
            };
        }
    } else {
        authContainer.innerHTML = `
            <a href="perfil.html" class="btn btn-outline-light btn-sm rounded-pill px-3">Ingresar</a>
        `;
    }
}

/**
 * Resalta en color blanco brillante el enlace activo en la barra de navegación
 */
export function marcarNavegacionActiva() {
    const paginaActual = document.body ? document.body.dataset.page : '';
    let path = window.location.pathname.split('/').pop().toLowerCase();
    if (!path || path === '') path = 'index.html';

    const enlaces = document.querySelectorAll('.navbar-nav .nav-link');
    enlaces.forEach(link => {
        const pageAttr = link.dataset.page ? link.dataset.page.toLowerCase() : '';
        const hrefAttr = link.getAttribute('href') ? link.getAttribute('href').toLowerCase() : '';

        const esActivo = (paginaActual && pageAttr === paginaActual.toLowerCase()) ||
                         (hrefAttr === path) ||
                         (path === 'index.html' && pageAttr === 'inicio');

        if (esActivo) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
            link.style.setProperty('color', '#ffffff', 'important');
            link.style.setProperty('opacity', '1', 'important');
            link.style.fontWeight = '600';
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
            link.style.color = '';
            link.style.opacity = '';
            link.style.fontWeight = '';
        }
    });
}

/**
 * Actualiza el contador global de productos en el badge del carrito (#cant-carrito)
 */
export function actualizarBadgeCarrito() {
    const badge = document.getElementById('cant-carrito');
    if (!badge) return;

    try {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || JSON.parse(localStorage.getItem('cart')) || [];
        const total = carrito.reduce((acc, item) => acc + (parseInt(item.cantidad) || 1), 0);
        badge.textContent = total;
    } catch (e) {
        badge.textContent = '0';
    }
}

/**
 * Muestra alertas estilo Toast de Bootstrap
 */
export function mostrarToast(mensaje, esError = false) {
    const toastElement = document.getElementById('appToast');
    const toastMessage = document.getElementById('toastMessage');

    if (!toastElement || !toastMessage) return;

    toastMessage.textContent = mensaje;

    if (esError) {
        toastElement.classList.add('text-bg-danger');
    } else {
        toastElement.classList.remove('text-bg-danger');
    }

    if (window.bootstrap && window.bootstrap.Toast) {
        const bootstrapToast = window.bootstrap.Toast.getOrCreateInstance(toastElement);
        bootstrapToast.show();
    }
}

/**
 * Inicialización al cargar el DOM
 */
function initBase() {
    actualizarBotonAuth();
    marcarNavegacionActiva();
    actualizarBadgeCarrito();
}

window.addEventListener('storage', () => {
    actualizarBotonAuth();
    actualizarBadgeCarrito();
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBase);
} else {
    initBase();
}