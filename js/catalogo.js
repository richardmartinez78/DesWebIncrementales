import { obtenerProductos } from './productos.js';
import { obtenerCarrito, guardarCarrito } from './carrito-state.js';

let listaProductos = [];

document.addEventListener('DOMContentLoaded', async () => {
    await cargarCatalogo();

    document.getElementById('input-busqueda')?.addEventListener('input', aplicarFiltros);
    document.getElementById('select-categoria')?.addEventListener('change', aplicarFiltros);
    document.getElementById('selectOrden')?.addEventListener('change', aplicarFiltros);

    document.getElementById('btn-limpiar')?.addEventListener('click', () => {
        const inputBusqueda = document.getElementById('input-busqueda');
        const selectCategoria = document.getElementById('select-categoria');
        const selectOrden = document.getElementById('selectOrden');

        if (inputBusqueda) inputBusqueda.value = '';
        if (selectCategoria) selectCategoria.value = 'todas';
        if (selectOrden) selectOrden.value = 'defecto';

        aplicarFiltros();
    });
});

async function cargarCatalogo() {
    const contenedor = document.getElementById('contenedor-catalogo');

    try {
        if (contenedor) {
            contenedor.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="spinner-border text-success" role="status">
                        <span class="visually-hidden">Cargando productos...</span>
                    </div>
                </div>`;
        }

        listaProductos = await obtenerProductos();
        poblarCategorias();
        aplicarFiltros();
    } catch (error) {
        mostrarMensajeError(error.message || "Error al cargar los productos.");
    }
}

function poblarCategorias() {
    const selectCat = document.getElementById('select-categoria');
    if (!selectCat || !listaProductos.length) return;

    const categoriasUnicas = [...new Set(listaProductos.map(p => p.categoria).filter(Boolean))];

    selectCat.innerHTML = '<option value="todas">Todas las categorías</option>';
    categoriasUnicas.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        selectCat.appendChild(option);
    });
}

function normalizarTexto(texto) {
    if (!texto) return '';
    return texto.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function aplicarFiltros() {
    const terminoBusqueda = normalizarTexto(document.getElementById('input-busqueda')?.value);
    const categoria = document.getElementById('select-categoria')?.value || "todas";
    const orden = document.getElementById('selectOrden')?.value || "defecto";

    let resultados = [...listaProductos];

    if (terminoBusqueda) {
        resultados = resultados.filter(p => {
            const nombre = normalizarTexto(p.nombre);
            const descripcion = normalizarTexto(p.descripcion);
            const cat = normalizarTexto(p.categoria);
            const marca = normalizarTexto(p.marca);

            return nombre.includes(terminoBusqueda) || 
                   descripcion.includes(terminoBusqueda) || 
                   cat.includes(terminoBusqueda) || 
                   marca.includes(terminoBusqueda);
        });
    }

    if (categoria !== "todas") {
        resultados = resultados.filter(p => p.categoria && p.categoria.toLowerCase() === categoria.toLowerCase());
    }

    if (orden === "precio-asc") {
        resultados.sort((a, b) => (a.precio || 0) - (b.precio || 0));
    } else if (orden === "precio-desc") {
        resultados.sort((a, b) => (b.precio || 0) - (a.precio || 0));
    } else if (orden === "nombre") {
        resultados.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
    }

    renderizarProductos(resultados);
}

function renderizarProductos(productos) {
    const contenedor = document.getElementById('contenedor-catalogo');
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (productos.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="fs-5 text-muted">No se encontraron productos que coincidan con la búsqueda.</p>
            </div>`;
        return;
    }

    productos.forEach(p => {
        const imagenUrl = Array.isArray(p.imagenes) && p.imagenes.length > 0 ? p.imagenes[0] : (p.imagen || 'https://via.placeholder.com/300');
        const precioFormateado = typeof p.precio === 'number' ? p.precio.toLocaleString('es-UY') : p.precio;
        const tieneStock = p.disponibilidad !== false && (p.stock > 0 || p.stock === undefined);

        const card = document.createElement('div');
        card.className = 'col-12 col-sm-6 col-md-4 col-lg-3 d-flex align-items-stretch mb-4';
        card.innerHTML = `
            <div class="card h-100 shadow-sm border-0 w-100 rounded-3 overflow-hidden">
                <div class="position-relative bg-white text-center p-3" style="height: 200px;">
                    <img src="${imagenUrl}" class="img-fluid h-100" alt="${p.nombre || 'Producto'}" style="object-fit: contain;">
                    <span class="badge bg-success position-absolute top-0 start-0 m-2 px-2 py-1">${p.categoria || 'General'}</span>
                </div>
                <div class="card-body d-flex flex-column justify-content-between bg-white border-top">
                    <div>
                        <h5 class="card-title fw-bold fs-6 text-dark mb-2" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.5em;">
                            ${p.nombre || 'Sin nombre'}
                        </h5>
                        <p class="card-text text-muted small mb-3" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.8em;">
                            ${p.descripcion || ''}
                        </p>
                    </div>
                    <div>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="fs-5 fw-bold text-success">$${precioFormateado}</span>
                            <small class="${tieneStock ? 'text-muted' : 'text-danger fw-semibold'}">
                                ${p.stock !== undefined ? (tieneStock ? `Stock: ${p.stock}` : 'Agotado') : ''}
                            </small>
                        </div>
                        <div class="d-grid gap-2">
                            <a href="producto.html?id=${p.id}" class="btn btn-outline-success btn-sm rounded-pill">Ver detalle</a>
                            <button class="btn btn-success btn-sm rounded-pill btn-agregar-carrito" data-id="${p.id}" ${!tieneStock ? 'disabled' : ''}>
                                Agregar al carrito
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        contenedor.appendChild(card);
    });

    asignarEventosAgregar();
}

function asignarEventosAgregar() {
    const botones = document.querySelectorAll('.btn-agregar-carrito');
    botones.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idProducto = e.currentTarget.getAttribute('data-id');
            const productoEncontrado = listaProductos.find(p => String(p.id) === String(idProducto));

            if (productoEncontrado) {
                agregarDesdeCatalogo(productoEncontrado);
            }
        });
    });
}

function agregarDesdeCatalogo(producto) {
    let carrito = obtenerCarrito();
    const index = carrito.findIndex(item => String(item.id) === String(producto.id));

    const precioNumerico = Number(producto.precio) || 0;
    const imagenProducto = Array.isArray(producto.imagenes) && producto.imagenes.length > 0 
        ? producto.imagenes[0] 
        : (producto.imagen || 'https://via.placeholder.com/150');

    if (index !== -1) {
        carrito[index].cantidad += 1;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre || 'Producto sin nombre',
            precio: precioNumerico,
            imagen: imagenProducto,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);

    if (window.bootstrap && document.getElementById('appToast')) {
        const toastEl = document.getElementById('appToast');
        const toastMsg = document.getElementById('toastMessage');
        if (toastMsg) toastMsg.textContent = `¡${producto.nombre} agregado al carrito!`;
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    } else {
        alert(`¡${producto.nombre} agregado al carrito!`);
    }
}

function mostrarMensajeError(mensaje) {
    const contenedor = document.getElementById('contenedor-catalogo');
    if (contenedor) {
        contenedor.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger text-center shadow-sm my-4" role="alert">
                    ${mensaje}
                </div>
            </div>`;
    }
}