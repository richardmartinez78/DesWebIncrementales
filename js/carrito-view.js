/**
 * js/carrito-view.js - Vista del carrito
 * Domótica Hogar
 */

import { actualizarBadgeCarrito, mostrarToast, obtenerSesion } from './base.js';
import { obtenerCarrito, guardarCarrito, eliminarPorId, vaciarCarrito } from './carrito-state.js';

const PRODUCTOS_REF = [
    { id: '1', stock: 3 }, { id: '2', stock: 5 }, { id: '3', stock: 8 },
    { id: '4', stock: 15 }, { id: '5', stock: 4 }, { id: '6', stock: 12 },
    { id: '7', stock: 10 }, { id: '8', stock: 2 }, { id: '9', stock: 6 },
    { id: '10', stock: 9 }, { id: '11', stock: 5 }, { id: '12', stock: 20 }
];

function obtenerStockLimite(productoId) {
    try {
        const productosCache = JSON.parse(localStorage.getItem('productos_cache')) || [];
        const prodCache = productosCache.find(p => String(p.id) === String(productoId));
        if (prodCache && prodCache.stock !== undefined) {
            return parseInt(prodCache.stock, 10) || 0;
        }
    } catch (e) {
        console.warn("No se pudo leer productos_cache:", e);
    }
    const prodRef = PRODUCTOS_REF.find(p => String(p.id) === String(productoId));
    return prodRef ? prodRef.stock : 99;
}

export function renderizarCarrito() {
    // ID corregido para que coincida con carrito.html
    const contenedor = document.getElementById('contenedor-carrito-vista');
    if (!contenedor) return;

    const carrito = obtenerCarrito();

    if (!Array.isArray(carrito) || carrito.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12 text-center py-5 bg-white rounded shadow-sm p-4">
                <i class="bi bi-cart-x text-muted display-1"></i>
                <h2 class="h4 mt-3 fw-bold">Tu carrito está vacío</h2>
                <p class="text-muted">Parece que aún no has agregado productos a tu carrito.</p>
                <a href="catalogo.html" class="btn text-white rounded-pill px-4 mt-2" style="background-color: #146c43; border-color: #146c43;">
                    Explorar Catálogo
                </a>
            </div>
        `;
        return;
    }

    let subtotal = 0;

    const htmlProductos = carrito.map(item => {
        const itemPrecio = parseFloat(item.precio) || 0;
        const itemCantidad = parseInt(item.cantidad, 10) || 1;
        const totalItem = itemPrecio * itemCantidad;
        subtotal += totalItem;

        const stockMax = obtenerStockLimite(item.id);
        const imagenUrl = item.imagen || 'https://placehold.co/600x400/146c43/ffffff?text=Dom%C3%B3tica+Hogar';

        return `
            <div class="card mb-3 border-0 shadow-sm p-3 bg-white">
                <div class="row align-items-center g-3">
                    <div class="col-3 col-md-2">
                        <img src="${imagenUrl}" onerror="this.onerror=null; this.src='https://placehold.co/600x400/146c43/ffffff?text=Dom%C3%B3tica+Hogar';" class="img-fluid rounded" alt="${item.nombre || 'Producto'}" style="height: 70px; object-fit: cover;">
                    </div>
                    <div class="col-9 col-md-4">
                        <h3 class="h6 fw-bold mb-1">${item.nombre || 'Producto'}</h3>
                        <span class="text-muted small">$ ${itemPrecio.toLocaleString('es-UY')} c/u</span>
                        <div class="text-muted extra-small" style="font-size: 0.75rem;">Disponibles: ${stockMax} un.</div>
                    </div>
                    <div class="col-6 col-md-3">
                        <div class="input-group input-group-sm" style="max-width: 120px;">
                            <button class="btn btn-outline-secondary btn-restar" data-id="${item.id}">-</button>
                            <input type="text" class="form-control text-center fw-bold bg-light" value="${itemCantidad}" readonly>
                            <button class="btn btn-outline-secondary btn-sumar" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <div class="col-4 col-md-2 text-end">
                        <strong class="text-success">$ ${totalItem.toLocaleString('es-UY')}</strong>
                    </div>
                    <div class="col-2 col-md-1 text-end">
                        <button class="btn btn-sm btn-outline-danger border-0 btn-eliminar" data-id="${item.id}" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Estructura en 2 columnas: Lista a la izquierda (col-lg-8) y Resumen a la derecha (col-lg-4)
    contenedor.innerHTML = `
        <div class="col-lg-8">
            ${htmlProductos}
        </div>
        <div class="col-lg-4" id="resumen-compra">
            <div class="card border-0 shadow-sm p-4 bg-white sticky-top" style="top: 90px;">
                <h2 class="h5 fw-bold mb-3">Resumen de compra</h2>
                <hr>
                <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Subtotal</span>
                    <strong id="resumen-subtotal">$ ${subtotal.toLocaleString('es-UY')}</strong>
                </div>
                <div class="d-flex justify-content-between mb-3 fs-5 fw-bold">
                    <span>Total</span>
                    <strong class="text-success" id="resumen-total">$ ${subtotal.toLocaleString('es-UY')} UYU</strong>
                </div>
                <button id="btn-finalizar-compra" class="btn text-white w-100 rounded-pill py-2 fw-semibold" style="background-color: #146c43; border-color: #146c43;">
                    Finalizar Compra
                </button>
            </div>
        </div>
    `;

    asignarEventos();
}

function asignarEventos() {
    // Botón sumar (+) con validación estricta de stock
    document.querySelectorAll('.btn-sumar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = String(e.currentTarget.dataset.id);
            const carrito = obtenerCarrito();
            const item = carrito.find(p => String(p.id) === id);

            if (item) {
                const stockMax = obtenerStockLimite(id);
                const cantidadActual = parseInt(item.cantidad, 10) || 1;

                if (cantidadActual + 1 > stockMax) {
                    mostrarToast(`No puedes agregar más de ${stockMax} un. (Límite de stock).`, 'error');
                    return;
                }

                item.cantidad = cantidadActual + 1;
                guardarCarrito(carrito);
                actualizarBadgeCarrito();
                renderizarCarrito();
            }
        });
    });

    // Botón restar (-)
    document.querySelectorAll('.btn-restar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = String(e.currentTarget.dataset.id);
            let carrito = obtenerCarrito();
            const item = carrito.find(p => String(p.id) === id);

            if (item) {
                if (item.cantidad > 1) {
                    item.cantidad -= 1;
                    guardarCarrito(carrito);
                } else {
                    eliminarPorId(id);
                }
                actualizarBadgeCarrito();
                renderizarCarrito();
            }
        });
    });

    // Botón eliminar
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = String(e.currentTarget.dataset.id);
            eliminarPorId(id);
            actualizarBadgeCarrito();
            renderizarCarrito();
            mostrarToast('Producto eliminado del carrito.');
        });
    });

    // Botón finalizar compra
    const btnFinalizar = document.getElementById('btn-finalizar-compra');
    if (btnFinalizar) {
        btnFinalizar.onclick = procesarCompra;
    }
}

async function procesarCompra() {
    const carrito = obtenerCarrito();
    if (carrito.length === 0) return;

    const usuario = obtenerSesion();

    // 🔒 VALIDACIÓN DE AUTENTICACIÓN: Preserva los productos en localStorage y solicita sesión
    if (!usuario) {
        mostrarToast('⚠️ Debes iniciar sesión o registrarte para completar la compra.', 'error');
        setTimeout(() => {
            window.location.href = 'perfil.html';
        }, 1000);
        return;
    }

    const btnFinalizar = document.getElementById('btn-finalizar-compra');

    try {
        if (btnFinalizar) {
            btnFinalizar.disabled = true;
            btnFinalizar.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Procesando...';
        }

        const totalCompra = carrito.reduce((sum, item) => sum + ((parseFloat(item.precio) || 0) * (parseInt(item.cantidad, 10) || 1)), 0);

        const nuevoPedido = {
            id: `PED-${Date.now()}`,
            fecha: new Date().toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            fechaIso: new Date().toISOString(),
            usuario: usuario,
            productos: carrito.map(item => ({
                id: item.id,
                nombre: item.nombre,
                precio: item.precio,
                cantidad: item.cantidad,
                subtotal: (item.precio || 0) * (item.cantidad || 1)
            })),
            total: totalCompra,
            estado: 'completado'
        };

        try {
            const firebaseModule = await import('./firebase/config.js');
            if (firebaseModule.db) {
                const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
                await firestoreModule.setDoc(firestoreModule.doc(firebaseModule.db, 'pedidos', nuevoPedido.id), nuevoPedido);

                for (const item of carrito) {
                    const docRef = firestoreModule.doc(firebaseModule.db, 'productos', String(item.id));
                    const docSnap = await firestoreModule.getDoc(docRef);

                    if (docSnap.exists()) {
                        const stockActual = parseInt(docSnap.data().stock, 10) || 0;
                        const nuevoStock = Math.max(0, stockActual - (item.cantidad || 1));
                        await firestoreModule.updateDoc(docRef, {
                            stock: nuevoStock,
                            disponibilidad: nuevoStock > 0
                        });
                    }
                }
            }
        } catch (e) {
            console.warn("Compra procesada localmente.", e);
        }

        const pedidosLocales = JSON.parse(localStorage.getItem('pedidos_locales')) || [];
        pedidosLocales.push(nuevoPedido);
        localStorage.setItem('pedidos_locales', JSON.stringify(pedidosLocales));

        vaciarCarrito();
        actualizarBadgeCarrito();
        localStorage.setItem("toast_mensaje_exito", "¡Compra realizada con éxito!");
        window.location.href = 'perfil.html';

    } catch (error) {
        console.error("Error al procesar compra:", error);
        mostrarToast('Error al procesar tu compra. Intenta nuevamente.', 'error');
        if (btnFinalizar) {
            btnFinalizar.disabled = false;
            btnFinalizar.innerHTML = 'Finalizar Compra';
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderizarCarrito);
} else {
    renderizarCarrito();
}