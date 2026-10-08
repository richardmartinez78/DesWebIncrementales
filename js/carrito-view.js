/**
 * js/carrito-view.js - Lógica de renderizado del carrito, control de sesión estricto y compras
 * Domótica Hogar
 */

import { actualizarBadgeCarrito, mostrarToast, obtenerSesion } from './base.js';

const IMAGEN_FALLBACK = 'https://placehold.co/600x400/146c43/ffffff?text=Dom%C3%B3tica+Hogar';

/**
 * Sanea cualquier representación de precio a un número flotante válido
 */
function limpiarPrecio(val) {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;
    const limpio = String(val).replace(/[^0-9.,]/g, '').replace(',', '.');
    const num = parseFloat(limpio);
    return isNaN(num) ? 0 : num;
}

/**
 * Obtiene la lista de productos del carrito desde LocalStorage
 */
function obtenerCarrito() {
    try {
        const items = JSON.parse(localStorage.getItem('carrito')) || [];
        return Array.isArray(items) ? items : [];
    } catch (e) {
        return [];
    }
}

/**
 * Renderiza dinámicamente los artículos, precios y subtotales en la vista
 */
export function renderizarCarritoView() {
    const container = document.getElementById('contenedor-carrito-vista');
    if (!container) return;

    const carrito = obtenerCarrito();
    const sesion = obtenerSesion();
    actualizarBadgeCarrito();

    // Estado cuando el carrito está vacío
    if (carrito.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5 bg-white rounded shadow-sm border">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-cart-x text-muted mb-3" viewBox="0 0 16 16">
                    <path d="M7.354 5.646a.5.5 0 1 0-.708.708L7.293 7.5l-1.147 1.146a.5.5 0 0 0 .708.708L8 8.207l1.146 1.147a.5.5 0 0 0 .708-.708L8.707 7.5l1.147-1.146a.5.5 0 0 0-.708-.708L8 6.793z"/>
                    <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 13H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
                </svg>
                <h3 class="h4 fw-bold">Tu carrito está vacío</h3>
                <p class="text-secondary">Explora nuestro catálogo para agregar productos inteligentes.</p>
                <a href="catalogo.html" class="btn text-white rounded-pill px-4 mt-2" style="background-color: #146c43; border-color: #146c43;">Ir al Catálogo</a>
            </div>
        `;
        return;
    }

    let subtotalGeneral = 0;

    const itemsHTML = carrito.map((prod, index) => {
        const cantidad = parseInt(prod.cantidad, 10) || 1;
        const precioUnitario = limpiarPrecio(prod.precio);
        const subtotalFila = precioUnitario * cantidad;
        subtotalGeneral += subtotalFila;

        return `
            <div class="card mb-3 border-0 shadow-sm">
                <div class="card-body">
                    <div class="row align-items-center g-3">
                        <div class="col-3 col-md-2">
                            <img src="${prod.imagen || IMAGEN_FALLBACK}" 
                                 onerror="this.onerror=null; this.src='${IMAGEN_FALLBACK}';" 
                                 alt="${prod.nombre || 'Producto'}" 
                                 class="img-fluid rounded" 
                                 style="max-height: 80px; object-fit: cover; width: 100%;">
                        </div>
                        <div class="col-9 col-md-4">
                            <h5 class="h6 mb-1 fw-bold">${prod.nombre || 'Producto sin nombre'}</h5>
                            <span class="text-muted small">$ ${precioUnitario.toLocaleString('es-UY')} c/u</span>
                        </div>
                        <div class="col-6 col-md-3">
                            <div class="input-group input-group-sm" style="max-width: 120px;">
                                <button class="btn btn-outline-secondary btn-cant" data-index="${index}" data-delta="-1" type="button">-</button>
                                <input type="text" class="form-control text-center bg-white" value="${cantidad}" readonly>
                                <button class="btn btn-outline-secondary btn-cant" data-index="${index}" data-delta="1" type="button">+</button>
                            </div>
                        </div>
                        <div class="col-4 col-md-2 text-end fw-bold text-success">
                            $ ${subtotalFila.toLocaleString('es-UY')}
                        </div>
                        <div class="col-2 col-md-1 text-end">
                            <button class="btn btn-outline-danger btn-sm btn-eliminar" data-index="${index}" title="Eliminar producto" type="button">
                                &times;
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Banner de advertencia si no hay sesión
    const alertaSesionHTML = !sesion ? `
        <div class="alert alert-warning py-2 px-3 mb-3 small d-flex align-items-center gap-2 rounded-3 border-warning-subtle">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0" viewBox="0 0 16 16">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>
            <div>Debes <a href="perfil.html" class="alert-link">iniciar sesión</a> para completar la compra.</div>
        </div>
    ` : '';

    container.innerHTML = `
        <div class="col-lg-8">
            ${itemsHTML}
            <div class="d-flex justify-content-between align-items-center mt-3">
                <a href="catalogo.html" class="btn btn-outline-secondary btn-sm">
                    &larr; Seguir comprando
                </a>
                <button id="btn-vaciar" class="btn btn-outline-danger btn-sm" type="button">
                    Vaciar Carrito
                </button>
            </div>
        </div>
        <div class="col-lg-4">
            <div class="card border-0 shadow-sm p-4 bg-white">
                <h5 class="fw-bold mb-3">Resumen de Compra</h5>
                ${alertaSesionHTML}
                <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Subtotal</span>
                    <strong id="cart-subtotal" class="fw-bold">$ ${subtotalGeneral.toLocaleString('es-UY')}</strong>
                </div>
                <div class="d-flex justify-content-between mb-3">
                    <span class="text-muted">Envío</span>
                    <span class="text-success fw-bold">Gratis</span>
                </div>
                <hr>
                <div class="d-flex justify-content-between fs-5 fw-bold mb-4">
                    <span>Total</span>
                    <strong id="cart-total" class="text-success">$ ${subtotalGeneral.toLocaleString('es-UY')}</strong>
                </div>
                <button id="btn-comprar" class="btn text-white w-100 py-2 fw-bold" style="background-color: #146c43; border-color: #146c43;" type="button">
                    Finalizar Compra
                </button>
            </div>
        </div>
    `;

    // Eventos de interactividad (+ / -)
    container.querySelectorAll('.btn-cant').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index, 10);
            const delta = parseInt(e.currentTarget.dataset.delta, 10);
            let car = obtenerCarrito();
            if (car[index]) {
                car[index].cantidad = (parseInt(car[index].cantidad, 10) || 1) + delta;
                if (car[index].cantidad <= 0) {
                    car.splice(index, 1);
                }
                localStorage.setItem('carrito', JSON.stringify(car));
                renderizarCarritoView();
            }
        });
    });

    // Evento de eliminar
    container.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index, 10);
            let car = obtenerCarrito();
            if (car[index]) {
                const eliminado = car.splice(index, 1)[0];
                localStorage.setItem('carrito', JSON.stringify(car));
                renderizarCarritoView();
                if (eliminado) mostrarToast(`"${eliminado.nombre}" fue eliminado del carrito.`);
            }
        });
    });

    // Vaciar carrito
    const btnVaciar = document.getElementById('btn-vaciar');
    if (btnVaciar) {
        btnVaciar.addEventListener('click', () => {
            localStorage.removeItem('carrito');
            renderizarCarritoView();
            mostrarToast('El carrito ha sido vaciado.');
        });
    }

    // Inicializar checkout con protección de sesión
    initCheckout();
}

/**
 * Procesa la compra con verificación estricta de sesión y transacción en Firestore
 */
export function initCheckout() {
    const btnComprar = document.getElementById('btn-comprar');
    if (!btnComprar) return;

    btnComprar.addEventListener('click', async () => {
        // 1. VALIDACIÓN ESTRICTA DE SESIÓN
        const sesion = obtenerSesion();
        if (!sesion || (!sesion.email && !sesion.uid)) {
            mostrarToast('⚠️ Debes iniciar sesión para realizar la compra.', true);
            setTimeout(() => { 
                window.location.href = 'perfil.html'; 
            }, 1500);
            return; // DENEGADO
        }

        // 2. VALIDACIÓN DE CARRITO CON ELEMENTOS
        const carrito = obtenerCarrito();
        if (carrito.length === 0) {
            mostrarToast('El carrito está vacío.', true);
            return;
        }

        btnComprar.disabled = true;
        btnComprar.textContent = 'Procesando compra...';

        try {
            const firebaseModule = await import('./firebase/config.js');
            const db = firebaseModule.db;

            if (!db) {
                localStorage.removeItem('carrito');
                mostrarToast('¡Compra realizada con éxito!');
                renderizarCarritoView();
                return;
            }

            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            const { doc, collection, runTransaction, serverTimestamp } = firestoreModule;

            let totalReal = 0;
            const productosDetalle = [];

            await runTransaction(db, async (transaction) => {
                for (const item of carrito) {
                    const prodRef = doc(db, 'productos', String(item.id));
                    const prodSnap = await transaction.get(prodRef);

                    if (prodSnap.exists()) {
                        const prodData = prodSnap.data();
                        const stockActual = parseInt(prodData.stock, 10) || 0;
                        const cantidadDeseada = parseInt(item.cantidad, 10) || 1;

                        if (stockActual < cantidadDeseada) {
                            throw new Error(`Stock insuficiente para "${prodData.nombre}". Disponible: ${stockActual}.`);
                        }

                        const precioOficial = limpiarPrecio(prodData.precio);
                        const subtotalItem = precioOficial * cantidadDeseada;
                        totalReal += subtotalItem;

                        productosDetalle.push({
                            id: String(item.id),
                            nombre: prodData.nombre,
                            precio: precioOficial,
                            cantidad: cantidadDeseada,
                            subtotal: subtotalItem
                        });

                        transaction.update(prodRef, {
                            stock: stockActual - cantidadDeseada,
                            disponibilidad: (stockActual - cantidadDeseada) > 0
                        });
                    }
                }

                const pedidoRef = doc(collection(db, 'pedidos'));
                transaction.set(pedidoRef, {
                    usuario: {
                        uid: sesion.uid || sesion.email || 'sin-id',
                        email: sesion.email || '',
                        nombre: sesion.nombre || sesion.email || 'Cliente'
                    },
                    productos: productosDetalle,
                    total: totalReal,
                    fecha: serverTimestamp ? serverTimestamp() : new Date().toISOString(),
                    estado: 'completado'
                });
            });

            localStorage.removeItem('carrito');
            mostrarToast('¡Compra realizada con éxito! Tu pedido ha sido registrado.');
            renderizarCarritoView();

        } catch (error) {
            console.error("Error al procesar la compra:", error);
            mostrarToast(error.message || 'Error al procesar la compra.', true);
        } finally {
            btnComprar.disabled = false;
            btnComprar.textContent = 'Finalizar Compra';
        }
    });
}

// Inicialización garantizada
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderizarCarritoView);
} else {
    renderizarCarritoView();
}