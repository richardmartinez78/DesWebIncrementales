/**
 * js/base.js - Funciones globales, contador de carrito, notificaciones Toast e inicio de sesión
 * Domótica Hogar
 */

/**
 * Actualiza el contador de insignias del carrito en la barra de navegación
 */
export function actualizarBadgeCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalCantidad = carrito.reduce((sum, item) => sum + (parseInt(item.cantidad, 10) || 0), 0);

    const badges = document.querySelectorAll('#cant-carrito, #badge-carrito, .badge-carrito, #contador-carrito');
    badges.forEach(badge => {
        badge.textContent = totalCantidad;
    });
}

export const actualizarContadorCarritoGlobal = actualizarBadgeCarrito;

/**
 * Muestra las notificaciones flotantes Toast
 */
export function mostrarToast(mensaje, esError = false) {
    const toastEl = document.getElementById('appToast');
    const toastMessage = document.getElementById('toastMessage');

    if (toastEl && toastMessage) {
        toastMessage.textContent = mensaje;
        if (window.bootstrap && window.bootstrap.Toast) {
            const toastInstance = window.bootstrap.Toast.getOrCreateInstance(toastEl);
            toastEl.className = `toast align-items-center border-0 text-bg-${esError ? 'danger' : 'success'} show`;
            toastInstance.show();
        } else {
            toastEl.className = `toast align-items-center border-0 text-bg-${esError ? 'danger' : 'success'} show`;
            setTimeout(() => toastEl.classList.remove('show'), 3500);
        }
    } else {
        alert(mensaje);
    }
}

/**
 * Obtiene la sesión activa desde LocalStorage
 */
export function obtenerSesion() {
    try {
        const usuario = localStorage.getItem('usuario');
        return usuario ? JSON.parse(usuario) : null;
    } catch (e) {
        return null;
    }
}

/**
 * Actualiza el Navbar indicando si el usuario ingresó
 */
export function actualizarAuthNav() {
    const authContainer = document.getElementById('nav-auth-container');
    if (!authContainer) return;

    const sesion = obtenerSesion();

    if (sesion && (sesion.email || sesion.nombre)) {
        const nombreMostrar = sesion.nombre || sesion.email.split('@')[0];
        authContainer.innerHTML = `
            <span class="text-white small fw-semibold d-none d-sm-inline">Hola, ${nombreMostrar}</span>
            <a href="perfil.html" class="btn btn-outline-light btn-sm rounded-pill px-3">Mi Perfil</a>
        `;
    } else {
        authContainer.innerHTML = `
            <a href="perfil.html" class="btn btn-outline-light btn-sm rounded-pill px-3">Ingresar</a>
        `;
    }
}

function iniciarBase() {
    actualizarBadgeCarrito();
    actualizarAuthNav();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarBase);
} else {
    iniciarBase();
}