/**
 * js/carrito-view.js - Carga e interactividad instantánea del Carrito de Compras
 * Domótica Hogar
 */

import { actualizarBadgeCarrito, mostrarToast, obtenerSesion } from './base.js';

function limpiarPrecio(val) {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;
    const limpio = String(val).replace(/[^0-9.,]/g, '').replace(',', '.');
    const num = parseFloat(limpio);
    return isNaN(num) ? 0 : num;
}

export function obtenerCarrito() {
    try {
        return JSON.parse(localStorage.getItem('carrito')) || [];
    } catch (e) {
        return [];
    }
}

export function guardarCarrito(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarBadgeCarrito();
}

/**
 * Renderizado ultra rápido del Carrito (sin depender de red o Firebase)
 */
export function renderizarCarritoView() {
    const contenedor = document.getElementById('contenedor-carrito') || 
                       document.getElementById('carrito-container') || 
                       document.querySelector('main');

    if (!contenedor) return;

    const carrito = obtenerCarrito();
    actualizarBadgeCarrito();

    // 1. SI EL CARRITO ESTÁ VACÍO
    if (!carrito || carrito.length === 0) {
        contenedor.innerHTML = `
            <div class="card border-0 shadow-sm p-5 bg-white text-center my-4">
                <div class="mb-3 text-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-cart-x" viewBox="0 0 16 16">
                        <path d="M7.354 5.646a.5.5 0 1 0-.708.708L7.793 7.5 6.646 8.646a.5.5 0 1 0 .708.708L8.5 8.207l1.146 1.147a.5.5 0 0 0 .708-.708L9.207 7.5l1.147-1.146a.5.5 0 0 0-.708-.708L8.5 6.793z"/>
                        <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1zm3.915 10L3.102 4h10.796l-1.313 7zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                    </svg>
                </div>
                <h2 class="h4 fw-bold text-dark mb-2">Tu carrito está vacío</h2>
                <p class="text-muted small mb-4">Aún no has agregado productos inteligentes a tu pedido.</p>
                <div>
                    <a href="catalogo.html" class="btn text-white fw-bold px-4 py-2" style="background-color: #146c43; border-color: #146c43;">
                        Explorar Catálogo
                    </a>
                </div>
            </div>
        `;
        return;
    }

    // 2. SI HAY PRODUCTOS EN EL CARRITO
    let totalGeneral = 0;
    const itemsHTML = carrito.map((prod, index) => {
        const precioUnitario = limpiarPrecio(prod.precio);
        const cantidad = Math.max(1, parseInt(prod.cantidad, 10) || 1);
        const subtotal = precioUnitario * cantidad;
        totalGeneral += subtotal;

        return `
            <div class="card mb-3 border-0 shadow-sm p-3 bg-white">
                <div class="row align-items-center g-3">
                    <div class="col-3 col-md-2 text-center">
                        <img src="${prod.imagen || 'https://via.placeholder.com/80'}" class="img-fluid rounded" alt="${prod.nombre}" style="max-height: 75px; object-fit: cover; width: 100%;">
                    </div>
                    <div class="col-9 col-md-4">
                        <h3 class="h6 fw-bold mb-1">${prod.nombre}</h3>
                        <p class="text-muted small mb-0">Precio: $ ${precioUnitario.toLocaleString('es-UY')}</p>
                    </div>
                    <div class="col-6 col-md-3 d-flex align-items-center justify-content-center gap-2">
                        <button class="btn btn-outline-secondary btn-sm btn-decrementar px-2 py-0 fw-bold" data-index="${index}">-</button>
                        <span class="fw-bold px-2">${cantidad}</span>
                        <button class="btn btn-outline-secondary btn-sm btn-incrementar px-2 py-0 fw-bold" data-index="${index}">+</button>
                    </div>
                    <div class="col-6 col-md-3 text-end">
                        <span class="d-block fw-bold text-success fs-6">$ ${subtotal.toLocaleString('es-UY')}</span>
                        <button class="btn btn-link text-danger text-decoration-none p-0 extra-small btn-eliminar mt-1" data-index="${index}" style="font-size: 0.8rem;">Eliminar</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    contenedor.innerHTML = `
        <div class="row g-4">
            <div class="col-lg-8">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h2 class="h5 fw-bold mb-0">Artículos Seleccionados</h2>
                    <button id="btn-vaciar-carrito" class="btn btn-outline-danger btn-sm fw-semibold">Vaciar Carrito</button>
                </div>
                ${itemsHTML}
            </div>
            <div class="col-lg-4">
                <div class="card border-0 shadow-sm p-4 bg-white sticky-top" style="top: 90px;">
                    <h3 class="h5 fw-bold mb-3 border-bottom pb-2">Resumen del Pedido</h3>
                    <div class="d-flex justify-content-between align-items-center mb-2 small">
                        <span class="text-muted">Subtotal:</span>
                        <span class="fw-bold">$ ${totalGeneral.toLocaleString('es-UY')}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-3 small">
                        <span class="text-muted">Envío:</span>
                        <span class="text-success fw-bold">Gratis</span>
                    </div>
                    <hr>
                    <div class="d-flex justify-content-between align-items-center mb-4 fs-5 fw-bold">
                        <span>Total:</span>
                        <span class="text-success">$ ${totalGeneral.toLocaleString('es-UY')} UYU</span>
                    </div>
                    <button id="btn-comprar" class="btn text-white w-100 fw-bold py-2 shadow-sm" style="background-color: #146c43; border-color: #146c43;">
                        Finalizar Compra
                    </button>
                    <a href="catalogo.html" class="btn btn-outline-secondary w-100 btn-sm mt-2">Seguir Comprando</a>
                </div>
            </div>
        </div>
    `;

    // Eventos de botones (+ / - / eliminar / vaciar)
    contenedor.querySelectorAll('.btn-incrementar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = e.target.dataset.index;
            if (carrito[idx]) {
                carrito[idx].cantidad = (parseInt(carrito[idx].cantidad, 10) || 1) + 1;
                guardarCarrito(carrito);
                renderizarCarritoView();
            }
        });
    });

    contenedor.querySelectorAll('.btn-decrementar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = e.target.dataset.index;
            if (carrito[idx] && carrito[idx].cantidad > 1) {
                carrito[idx].cantidad -= 1;
                guardarCarrito(carrito);
                renderizarCarritoView();
            }
        });
    });

    contenedor.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = e.target.dataset.index;
            carrito.splice(idx, 1);
            guardarCarrito(carrito);
            renderizarCarritoView();
            mostrarToast('Producto eliminado del carrito.');
        });
    });

    document.getElementById('btn-vaciar-carrito')?.addEventListener('click', () => {
        guardarCarrito([]);
        renderizarCarritoView();
        mostrarToast('Carrito vaciado.');
    });

    configurarCheckout();
}

/**
 * Procesa la compra de forma inmediata
 */
function configurarCheckout() {
    const btnComprar = document.getElementById('btn-comprar');
    if (!btnComprar) return;

    btnComprar.addEventListener('click', async () => {
        const sesion = obtenerSesion();
        if (!sesion || (!sesion.email && !sesion.uid)) {
            mostrarToast('⚠️ Debes iniciar sesión para realizar la compra.', true);
            setTimeout(() => { window.location.href = 'perfil.html'; }, 1200);
            return;
        }

        const carrito = obtenerCarrito();
        if (carrito.length === 0) {
            mostrarToast('El carrito está vacío.', true);
            return;
        }

        btnComprar.disabled = true;
        btnComprar.textContent = 'Procesando compra...';

        let totalGeneral = 0;
        const productosRegistrados = carrito.map(item => {
            const precioUnitario = limpiarPrecio(item.precio);
            const cantidad = Math.max(1, parseInt(item.cantidad, 10) || 1);
            const subtotal = precioUnitario * cantidad;
            totalGeneral += subtotal;

            return {
                id: String(item.id),
                nombre: item.nombre || 'Producto',
                precio: precioUnitario,
                cantidad: cantidad,
                subtotal: subtotal
            };
        });

        const pedidoCompleto = {
            id: `pedido-${Date.now()}`,
            usuario: {
                uid: sesion.uid || `user-${Date.now()}`,
                nombre: sesion.nombre || sesion.email.split('@')[0],
                email: sesion.email
            },
            productos: productosRegistrados,
            total: totalGeneral,
            fecha: new Date().toLocaleString('es-UY', { dateStyle: 'short', timeStyle: 'short' }),
            fechaIso: new Date().toISOString(),
            estado: 'completado'
        };

        // 1. Registro inmediato en almacenamiento local
        let pedidosLocales = JSON.parse(localStorage.getItem('pedidos_locales')) || [];
        pedidosLocales.unshift(pedidoCompleto);
        localStorage.setItem('pedidos_locales', JSON.stringify(pedidosLocales));

        // 2. Intento de sincronización opcional con Firestore
        try {
            const firebaseModule = await import('./firebase/config.js');
            if (firebaseModule && firebaseModule.db) {
                const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
                const { collection, addDoc } = firestoreModule;
                
                const promesa = addDoc(collection(firebaseModule.db, 'pedidos'), pedidoCompleto);
                const timeout = new Promise((_, reject) => setTimeout(() => reject("Timeout"), 1000));
                await Promise.race([promesa, timeout]);
            }
        } catch (err) {
            console.warn("Transacción en la nube guardada en respaldo local.");
        }

        // 3. Limpiar carrito
        localStorage.removeItem('carrito');
        actualizarBadgeCarrito();
        mostrarToast('¡Compra realizada con éxito! Tu pedido ha sido registrado.');
        renderizarCarritoView();
    });
}

// Inicialización
function iniciar() {
    actualizarBadgeCarrito();
    renderizarCarritoView();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
} else {
    iniciar();
}