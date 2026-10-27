/**
 * js/base.js - Control global de interfaz, carrito, autenticación y validación estricta de stock
 * Domótica Hogar
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
        
        if (tipo === 'error' || tipo === true) {
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
                <button id="btn-logout-nav" class="btn btn-danger btn-sm text-white fw-bold rounded-pill px-3 shadow-sm">Salir</button>
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
        const totalItems = carrito.reduce((sum, item) => sum + (parseInt(item.cantidad, 10) || 1), 0);
        cantCarrito.textContent = totalItems;
        cantCarrito.style.display = 'inline-block';
    }
}

/**
 * Función unificada para agregar productos al carrito con control estricto de límite de stock real
 */
export function agregarProductoAlCarritoGlobal(prod, cantidadDeseada = 1) {
    if (!prod) return false;

    const stockMaximo = parseInt(prod.stock, 10) || 0;

    // 1. Validar si el producto no tiene stock disponible
    if (prod.disponibilidad === false || stockMaximo <= 0) {
        mostrarToast('No hay stock disponible para este artículo.', 'error');
        return false;
    }

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const index = carrito.findIndex(item => String(item.id) === String(prod.id));
    const cantidadActualEnCarrito = index !== -1 ? (parseInt(carrito[index].cantidad, 10) || 0) : 0;
    const cantidadFinal = cantidadActualEnCarrito + cantidadDeseada;

    // 2. Bloquear si la suma deseada supera el stock real del producto
    if (cantidadFinal > stockMaximo) {
        const disponibleRestante = Math.max(0, stockMaximo - cantidadActualEnCarrito);
        if (disponibleRestante === 0) {
            mostrarToast(`Ya tienes todo el stock disponible (${stockMaximo} un.) en tu carrito.`, 'error');
        } else {
            mostrarToast(`Solo puedes agregar ${disponibleRestante} un. más. Límite de stock: ${stockMaximo} un.`, 'error');
        }
        return false;
    }

    // 3. Guardar en el almacenamiento local tras superar las validaciones
    if (index !== -1) {
        carrito[index].cantidad = cantidadFinal;
    } else {
        carrito.push({
            id: String(prod.id),
            nombre: prod.nombre,
            categoria: prod.categoria || 'General',
            precio: parseFloat(prod.precio),
            imagen: prod.imagen || 'https://placehold.co/600x400/146c43/ffffff?text=Dom%C3%B3tica+Hogar',
            cantidad: cantidadDeseada
        });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarBadgeCarrito();
    mostrarToast(`"${prod.nombre}" (${cantidadDeseada} un.) se agregó al carrito.`);
    return true;
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