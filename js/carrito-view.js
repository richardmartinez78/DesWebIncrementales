/**
 * js/carrito-view.js - Renderizado y eventos de la interfaz
 * Domótica Hogar
 */

import { 
    obtenerCarrito, 
    actualizarCantidad, 
    eliminarDelCarrito, 
    vaciarCarrito, 
    calcularTotal 
} from './carrito-state.js';

import { actualizarBadgeCarrito, mostrarToast } from './base.js';

const IMAGEN_FALLBACK = 'https://placehold.co/600x400/146c43/ffffff?text=Dom%C3%B3tica+Hogar';

/**
 * Dibuja el carrito en el HTML
 */
export function renderizarCarritoView() {
    const tbody = document.getElementById('tbody-carrito');
    const container = document.getElementById('tabla-carrito-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');

    const carrito = obtenerCarrito();

    // Actualizar el número del badge superior en la navbar
    actualizarBadgeCarrito();

    // Si el carrito está vacío
    if (carrito.length === 0) {
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center py-5 bg-white rounded shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-cart-x text-muted mb-3" viewBox="0 0 16 16">
                        <path d="M7.354 5.646a.5.5 0 1 0-.708.708L7.293 7.5l-1.147 1.146a.5.5 0 0 0 .708.708L8 8.207l1.146 1.147a.5.5 0 0 0 .708-.708L8.707 7.5l1.147-1.146a.5.5 0 0 0-.708-.708L8 6.793z"/>
                        <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 13H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
                    </svg>
                    <h3 class="h4 fw-bold">Tu carrito está vacío</h3>
                    <p class="text-secondary">Explora nuestro catálogo para agregar productos inteligentes.</p>
                    <a href="catalogo.html" class="btn btn-success rounded-pill px-4 mt-2" style="background-color: #146c43; border-color: #146c43;">Ir al Catálogo</a>
                </div>
            `;
        }
        if (subtotalEl) subtotalEl.textContent = '$ 0';
        if (totalEl) totalEl.textContent = '$ 0';
        return;
    }

    if (!tbody) return;

    // Renderizado de las filas de la tabla
    tbody.innerHTML = carrito.map((prod, index) => {
        const cantidad = parseInt(prod.cantidad) || 1;
        const precio = parseFloat(prod.precio) || 0;
        const subtotalFila = precio * cantidad;

        return `
            <tr>
                <td>
                    <div class="d-flex align-items-center gap-3">
                        <img src="${prod.imagen || IMAGEN_FALLBACK}" 
                             onerror="this.onerror=null; this.src='${IMAGEN_FALLBACK}';" 
                             alt="${prod.nombre}" 
                             class="rounded" 
                             style="width: 50px; height: 50px; object-fit: cover;">
                        <div>
                            <strong class="d-block">${prod.nombre}</strong>
                            <small class="text-muted">${prod.categoria || 'Producto'}</small>
                        </div>
                    </div>
                </td>
                <td>$ ${precio.toLocaleString('es-UY')}</td>
                <td style="width: 120px;">
                    <input type="number" 
                           class="form-control form-control-sm input-cantidad" 
                           data-index="${index}" 
                           value="${cantidad}" 
                           min="1" 
                           max="99">
                </td>
                <td class="fw-bold">$ ${subtotalFila.toLocaleString('es-UY')}</td>
                <td>
                    <button class="btn btn-outline-danger btn-sm rounded-circle btn-eliminar" data-index="${index}" title="Eliminar producto">
                        &times;
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // Totales
    const totalMonto = calcularTotal(carrito);
    if (subtotalEl) subtotalEl.textContent = `$ ${totalMonto.toLocaleString('es-UY')}`;
    if (totalEl) totalEl.textContent = `$ ${totalMonto.toLocaleString('es-UY')}`;

    // Eventos de cambios en cantidades
    document.querySelectorAll('.input-cantidad').forEach(input => {
        input.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.index);
            const cantidad = parseInt(e.target.value);
            actualizarCantidad(index, cantidad);
            renderizarCarritoView();
        });
    });

    // Eventos de eliminación
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            const { eliminado } = eliminarDelCarrito(index);
            renderizarCarritoView();
            if (eliminado) {
                mostrarToast(`"${eliminado.nombre}" fue eliminado del carrito.`);
            }
        });
    });
}

/**
 * Asigna el evento al botón de compra
 */
export function initCheckoutView() {
    const btnComprar = document.getElementById('btn-comprar');
    if (btnComprar) {
        btnComprar.addEventListener('click', () => {
            const carrito = obtenerCarrito();
            if (carrito.length === 0) {
                mostrarToast('El carrito está vacío.', true);
                return;
            }

            vaciarCarrito();
            mostrarToast('¡Gracias por tu compra! Tu pedido ha sido procesado.');
            renderizarCarritoView();
        });
    }
}

// Inicialización automática al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    renderizarCarritoView();
    initCheckoutView();
});