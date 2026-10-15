/**
 * js/base.js - Helper global para manejo de sesión, UI y roles
 * Domótica Hogar
 */

// 1. OBTENER SESIÓN
export function obtenerSesion() {
    const usuarioStr = localStorage.getItem('usuario');
    return usuarioStr ? JSON.parse(usuarioStr) : null;
}

// 2. MOSTRAR TOAST (Notificaciones)
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
        
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }
}

// 3. ACTUALIZAR NAVBAR Y AUTH (Roles y Sesión)
export function actualizarAuthNav() {
    const usuario = obtenerSesion();
    const authContainer = document.getElementById('nav-auth-container');
    const adminLink = document.querySelector('a[data-page="admin"]');
    
    // A. Mostrar/Ocultar enlace de Administración según el rol
    if (adminLink) {
        const adminNavItem = adminLink.closest('.nav-item');
        // Validamos si es 'admin' o 'administrador'
        if (usuario && (usuario.rol === 'administrador' || usuario.rol === 'admin')) {
            adminNavItem.style.display = 'block';
        } else {
            adminNavItem.style.display = 'none';
        }
    }

    // B. Actualizar botones de ingreso/salida
    if (authContainer) {
        if (usuario) {
            authContainer.innerHTML = `
                <span class="text-light me-2 small d-none d-md-inline">Hola, ${usuario.nombre}</span>
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

// 4. ACTUALIZAR BADGE DEL CARRITO (Vital para que no falle JS en otras páginas)
export function actualizarBadgeCarrito() {
    const cantCarrito = document.getElementById('cant-carrito');
    if (cantCarrito) {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        cantCarrito.textContent = totalItems;
        
        // Si está en 0, ocultarlo visualmente si lo prefieres, o dejarlo en 0
        if(totalItems > 0) {
            cantCarrito.style.display = 'inline-block';
        }
    }
}

// 5. INICIALIZACIÓN GLOBAL (Se ejecuta en todas las páginas)
document.addEventListener('DOMContentLoaded', () => {
    actualizarAuthNav();
    actualizarBadgeCarrito();

    // Comprobar si hay mensajes de error pendientes (Ej. Expulsado de admin.html)
    const mensajePendiente = localStorage.getItem("toast_mensaje");
    if (mensajePendiente) {
        mostrarToast(mensajePendiente, "error");
        localStorage.removeItem("toast_mensaje");
    }
});