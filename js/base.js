/**
 * js/base.js - Control global de interfaz, carrito y autenticación
 */

export function obtenerSesion() {
    try {
        const usuarioStr = localStorage.getItem('usuario');
        return usuarioStr ? JSON.parse(usuarioStr) : null;
    } catch (e) {
        return null;
    }
}

export function mostrarToast(mensaje, tipo = 'success') {
    const toastEl = document.getElementById('appToast');
    const toastBody = document.getElementById('toastMessage');
    
    if (toastEl && toastBody) {
        toastBody.textContent = mensaje;
        toastEl.className = 'toast'; 
        
        if (tipo === 'error') {
            toastEl.classList.add('bg-danger', 'text-white');
        } else {
            toastEl.classList.add('bg-success', 'text-white');
        }
        
        if (window.bootstrap && bootstrap.Toast) {
            const toast = new bootstrap.Toast(toastEl);
            toast.show();
        } else {
            alert(mensaje);
        }
    }
}

export function actualizarAuthNav() {
    const usuario = obtenerSesion();
    const authContainer = document.getElementById('nav-auth-container');
    const adminLink = document.querySelector('a[data-page="admin"]');
    
    if (adminLink) {
        const adminNavItem = adminLink.closest('.nav-item');
        if (adminNavItem) {
            if (usuario && (usuario.rol === 'administrador' || usuario.rol === 'admin')) {
                adminNavItem.style.display = 'block';
            } else {
                adminNavItem.style.display = 'none';
            }
        }
    }

    if (authContainer) {
        if (usuario) {
            authContainer.innerHTML = `
                <span class="text-light me-2 small d-none d-md-inline">Hola, ${usuario.nombre || 'Usuario'}</span>
                <button id="btn-logout-nav" class="btn btn-outline-danger btn-sm rounded-pill px-3">Salir</button>
            `;
            
            document.getElementById('btn-logout-nav')?.addEventListener('click', () => {
                localStorage.removeItem('usuario');
                window.location.reload();
            });
        } else {
            authContainer.innerHTML = `
                <a href="perfil.html" class="btn btn-outline-light btn-sm rounded-pill px-3">Ingresar</a>
            `;
        }
    }
}

export function actualizarBadgeCarrito() {
    const cantCarrito = document.getElementById('cant-carrito');
    if (cantCarrito) {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
        cantCarrito.textContent = totalItems;
        cantCarrito.style.display = 'inline-block';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    actualizarAuthNav();
    actualizarBadgeCarrito();

    const mensajePendiente = localStorage.getItem("toast_mensaje");
    if (mensajePendiente) {
        mostrarToast(mensajePendiente, "error");
        localStorage.removeItem("toast_mensaje");
    }
});