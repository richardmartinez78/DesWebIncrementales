import { obtenerCarrito, guardarCarrito, actualizarBadgeCarrito } from './carrito-state.js';

// Función principal que inicia la vista del carrito
function inicializarVistaCarrito() {
    console.log("-> Inicializando vista de carrito...");
    renderizarCarrito();

    const btnConfirmar = document.getElementById('btn-confirmar');
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', () => {
            const carrito = obtenerCarrito();
            if (!carrito || carrito.length === 0) {
                alert('El carrito está vacío.');
                return;
            }
            alert('¡Gracias por tu compra! Procesando pedido...');
            guardarCarrito([]);
            renderizarCarrito();
        });
    }
}

// Ejecutar inmediatamente si el DOM ya cargó, o esperar al evento DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarVistaCarrito);
} else {
    inicializarVistaCarrito();
}

export function renderizarCarrito() {
    const contenedor = document.getElementById('contenedor-carrito');
    const elemSubtotal = document.getElementById('resumen-subtotal');
    const elemTotal = document.getElementById('resumen-total');

    console.log("Contenedor encontrado:", contenedor);
    console.log("Elemento subtotal encontrado:", elemSubtotal);

    if (!contenedor) {
        console.error("ERROR CRÍTICO: No se encontró el elemento con id 'contenedor-carrito' en el HTML.");
        return;
    }

    const carrito = obtenerCarrito();
    console.log("Datos del carrito obtenidos:", carrito);

    actualizarBadgeCarrito();

    // 1. Caso Carrito Vacío
    if (!carrito || !Array.isArray(carrito) || carrito.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center py-5 bg-white rounded-3 shadow-sm border">
                <p class="text-muted fs-5 mb-3">Tu carrito está vacío.</p>
                <a href="catalogo.html" class="btn text-white px-4 rounded-pill" style="background-color: #146c43;">
                    Ir al Catálogo
                </a>
            </div>
        `;
        if (elemSubtotal) elemSubtotal.textContent = '$ 0';
        if (elemTotal) elemTotal.textContent = '$ 0';
        return;
    }

    // 2. Construcción del HTML de las tarjetas
    let html = '<div class="d-flex flex-column gap-3">';
    let subtotalCalculado = 0;

    carrito.forEach((item, index) => {
        // Garantizamos que la cantidad y precio sean números válidos
        const cantidad = Number(item.cantidad) || 1;
        
        // Manejo flexible de precios si vienen como string o con signo "$"
        let precio = 0;
        if (typeof item.precio === 'number') {
            precio = item.precio;
        } else if (typeof item.precio === 'string') {
            precio = parseFloat(item.precio.replace(/[^0-9.-]+/g, "")) || 0;
        }

        const itemSubtotal = precio * cantidad;
        subtotalCalculado += itemSubtotal;

        // Selección segura de imagen
        let imagenSrc = 'https://via.placeholder.com/150';
        if (item.imagen && typeof item.imagen === 'string' && item.imagen.trim() !== '') {
            imagenSrc = item.imagen;
        } else if (Array.isArray(item.imagenes) && item.imagenes.length > 0) {
            imagenSrc = item.imagenes[0];
        }

        const nombreProd = item.nombre || item.title || 'Producto sin nombre';

        html += `
            <div class="card border-0 shadow-sm p-3 rounded-3 bg-white">
                <div class="row align-items-center g-3">
                    <div class="col-3 col-md-2 text-center">
                        <img src="${imagenSrc}" class="img-fluid rounded" alt="${nombreProd}" style="max-height: 80px; object-fit: contain;">
                    </div>
                    <div class="col-9 col-md-4">
                        <h5 class="h6 fw-bold mb-1 text-dark">${nombreProd}</h5>
                        <p class="text-muted small mb-0">Precio unitario: $ ${precio.toLocaleString('es-UY')}</p>
                    </div>
                    <div class="col-6 col-md-3 d-flex align-items-center gap-2">
                        <button class="btn btn-sm btn-outline-secondary btn-restar" data-index="${index}">-</button>
                        <span class="fw-bold px-2">${cantidad}</span>
                        <button class="btn btn-sm btn-outline-secondary btn-sumar" data-index="${index}">+</button>
                    </div>
                    <div class="col-6 col-md-3 text-end">
                        <span class="fw-bold d-block mb-1 text-dark">$ ${itemSubtotal.toLocaleString('es-UY')}</span>
                        <button class="btn btn-sm btn-link text-danger p-0 text-decoration-none btn-eliminar" data-index="${index}">
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    contenedor.innerHTML = html;

    // Actualización de montos
    const formatoSubtotal = `$ ${subtotalCalculado.toLocaleString('es-UY')}`;
    if (elemSubtotal) elemSubtotal.textContent = formatoSubtotal;
    if (elemTotal) elemTotal.textContent = formatoSubtotal;

    console.log("-> Renderizado del carrito completado exitosamente. Subtotal:", formatoSubtotal);

    asignarEventosModificacion();
}

function asignarEventosModificacion() {
    const carrito = obtenerCarrito();

    document.querySelectorAll('.btn-restar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = Number(e.currentTarget.getAttribute('data-index'));
            if (carrito[index]) {
                if (carrito[index].cantidad > 1) {
                    carrito[index].cantidad -= 1;
                } else {
                    carrito.splice(index, 1);
                }
                guardarCarrito(carrito);
                renderizarCarrito();
            }
        });
    });

    document.querySelectorAll('.btn-sumar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = Number(e.currentTarget.getAttribute('data-index'));
            if (carrito[index]) {
                carrito[index].cantidad += 1;
                guardarCarrito(carrito);
                renderizarCarrito();
            }
        });
    });

    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = Number(e.currentTarget.getAttribute('data-index'));
            if (carrito[index]) {
                carrito.splice(index, 1);
                guardarCarrito(carrito);
                renderizarCarrito();
            }
        });
    });
}