import { obtenerProductos, obtenerProductoPorId } from './productos.js';
import { obtenerCarrito, guardarCarrito } from './carrito-state.js';

let productoActual = null;

document.addEventListener('DOMContentLoaded', async () => {
    await cargarDetalleProducto();
});

async function cargarDetalleProducto() {
    const contenedor = document.getElementById('contenedor-producto');
    if (!contenedor) return;

    contenedor.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-success" role="status">
                <span class="visually-hidden">Cargando producto...</span>
            </div>
        </div>
    `;

    const urlParams = new URLSearchParams(window.location.search);
    const productoId = urlParams.get('id');

    try {
        if (productoId) {
            productoActual = await obtenerProductoPorId(productoId);
        }

        if (!productoActual) {
            const lista = await obtenerProductos();
            if (lista && lista.length > 0) {
                productoActual = lista[0];
            } else {
                mostrarMensajeError("No se encontraron productos disponibles.");
                return;
            }
        }

        renderizarProducto(productoActual);
    } catch (error) {
        mostrarMensajeError(error.message || "Error al cargar la información del producto.");
    }
}

function renderizarProducto(prod) {
    const contenedor = document.getElementById('contenedor-producto');
    if (!contenedor) return;

    const imagenUrl = (prod.imagenes && prod.imagenes.length > 0) ? prod.imagenes[0] : 'https://via.placeholder.com/400';
    const precioFormateado = typeof prod.precio === 'number' ? prod.precio.toLocaleString('es-UY') : prod.precio;
    const estaDisponible = prod.disponibilidad !== false && prod.stock > 0;

    contenedor.innerHTML = `
        <div class="row g-4 bg-white p-4 rounded-3 shadow-sm align-items-center">
            <div class="col-md-6 text-center">
                <img src="${imagenUrl}" alt="${prod.nombre || 'Producto'}" class="img-fluid rounded-3" style="max-height: 380px; object-fit: contain;">
            </div>
            <div class="col-md-6 d-flex flex-column">
                <span class="badge bg-success align-self-start mb-2 px-3 py-2 fs-6">${prod.categoria || 'General'}</span>
                <h1 class="fw-bold mb-3">${prod.nombre || 'Producto sin nombre'}</h1>
                <p class="text-muted mb-4 fs-6">${prod.descripcion || 'Sin descripción disponible.'}</p>
                
                <div class="d-flex align-items-center justify-content-between mb-4">
                    <span class="display-6 fw-bold text-success">$${precioFormateado}</span>
                    <span class="badge ${estaDisponible ? 'bg-success-subtle text-success border border-success' : 'bg-danger-subtle text-danger border border-danger'} fs-6 px-3 py-2">
                        ${estaDisponible ? `Stock disponible: ${prod.stock}` : 'Agotado'}
                    </span>
                </div>

                <div class="row g-3 align-items-center mt-auto">
                    <div class="col-auto">
                        <label for="input-cantidad" class="col-form-label fw-semibold">Cantidad:</label>
                    </div>
                    <div class="col-auto">
                        <input type="number" id="input-cantidad" class="form-control text-center" value="1" min="1" max="${prod.stock || 1}" style="width: 80px;" ${!estaDisponible ? 'disabled' : ''}>
                    </div>
                    <div class="col">
                        <button id="btn-agregar-carrito" class="btn btn-success w-100 rounded-pill py-2 fw-semibold" ${!estaDisponible ? 'disabled' : ''}>
                            Agregar al carrito
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-agregar-carrito')?.addEventListener('click', agregarAlCarrito);
}

function agregarAlCarrito() {
    if (!productoActual) return;

    const inputCantidad = document.getElementById('input-cantidad');
    const cantidad = parseInt(inputCantidad ? inputCantidad.value : 1) || 1;

    if (cantidad > productoActual.stock) {
        alert(`Solo hay ${productoActual.stock} unidades disponibles.`);
        return;
    }

    let carrito = obtenerCarrito();
    const index = carrito.findIndex(item => item.id === productoActual.id);

    if (index !== -1) {
        if (carrito[index].cantidad + cantidad > productoActual.stock) {
            alert(`No puedes agregar más unidades. Supera el stock disponible (${productoActual.stock}).`);
            return;
        }
        carrito[index].cantidad += cantidad;
    } else {
        carrito.push({
            id: productoActual.id,
            nombre: productoActual.nombre,
            precio: productoActual.precio,
            imagen: (productoActual.imagenes && productoActual.imagenes.length > 0) ? productoActual.imagenes[0] : '',
            cantidad: cantidad,
            stockMaximo: productoActual.stock
        });
    }

    guardarCarrito(carrito);
    alert("¡Producto agregado al carrito con éxito!");
}

function mostrarMensajeError(mensaje) {
    const contenedor = document.getElementById('contenedor-producto');
    if (contenedor) {
        contenedor.innerHTML = `
            <div class="alert alert-danger text-center my-5 shadow-sm" role="alert">
                ${mensaje}
                <div class="mt-3">
                    <a href="catalogo.html" class="btn btn-outline-danger btn-sm rounded-pill">Volver al catálogo</a>
                </div>
            </div>`;
    }
}