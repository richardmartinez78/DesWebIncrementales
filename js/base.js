/**
 * js/base.js - Funciones globales de sesión, contador de carrito y notificaciones
 * Domótica Hogar
 */

export function obtenerSesion() {
    try {
        return JSON.parse(localStorage.getItem('usuario')) || null;
    } catch (e) {
        return null;
    }
}

export function actualizarBadgeCarrito() {
    let carrito = [];
    try {
        carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    } catch (e) {
        carrito = [];
    }

    const totalItems = carrito.reduce((sum, item) => sum + (parseInt(item.cantidad, 10) || 1), 0);

    const badge1 = document.getElementById('cant-carrito');
    const badge2 = document.getElementById('badge-carrito');

    if (badge1) badge1.textContent = totalItems;
    if (badge2) badge2.textContent = totalItems;
}

export function mostrarToast(mensaje, esError = false) {
    const toastEl = document.getElementById('appToast') || document.getElementById('toast-notificacion');
    const toastMessageEl = document.getElementById('toastMessage') || document.getElementById('toast-mensaje');

    if (toastMessageEl) {
        toastMessageEl.textContent = mensaje;
    }

    if (toastEl) {
        if (esError) {
            toastEl.classList.add('bg-danger', 'text-white');
        } else {
            toastEl.classList.remove('bg-danger');
        }

        if (window.bootstrap && window.bootstrap.Toast) {
            const toast = new window.bootstrap.Toast(toastEl);
            toast.show();
        } else {
            alert(mensaje);
        }
    } else {
        alert(mensaje);
    }
}

export function actualizarAuthNav() {
    const container = document.getElementById('nav-auth-container');
    if (!container) return;

    const usuario = obtenerSesion();

    if (usuario) {
        const esAdmin = usuario.rol === 'admin' || (usuario.email && usuario.email.toLowerCase().includes('admin'));
        container.innerHTML = `
            <a href="perfil.html" class="btn btn-outline-light btn-sm rounded-pill px-3 me-1">
                👤 ${usuario.nombre || usuario.email.split('@')[0]}
            </a>
            ${esAdmin ? `
                <a href="admin.html" class="btn btn-warning btn-sm fw-bold rounded-pill px-3">Panel Admin</a>
            ` : ''}
        `;
    } else {
        container.innerHTML = `
            <a href="perfil.html" class="btn btn-outline-light btn-sm rounded-pill px-3">Ingresar</a>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    actualizarBadgeCarrito();
    actualizarAuthNav();
});