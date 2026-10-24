/**
 * js/productos.js - Gestión unificada de stock, catálogo, inicio y detalle de producto
 * Domótica Hogar
 */

import { db } from './firebase/config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { actualizarBadgeCarrito, mostrarToast } from './base.js';
import { obtenerResenasProducto, agregarResena, haCompradoProducto } from './resenas.js';

export const PRODUCTOS_MOCK = [
    { id: "1", nombre: "Echo Dot 5ª Generación", categoria: "Entretenimiento", precio: 3500, stock: 8, disponibilidad: true, descripcion: "Tu asistente de voz inteligente Alexa para controlar música, dispositivos inteligentes y rutinas del hogar.", imagen: "https://bgreat.uy/wp-content/uploads/2024/11/199538-Asistente-de-Voz-Alexa-Echo-Dot-5ta-Gen-Charcole-4-510x510.jpg" },
    { id: "2", nombre: "Sistema de Automatización Domótica Tuya", categoria: "Confort", precio: 1990, stock: 5, disponibilidad: true, descripcion: "Central HUB Zigbee y WiFi para automatización integral de luces, persianas y sensores.", imagen: "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80" },
    { id: "3", nombre: "Cámara Seguridad IP Exterior TP-Link Tapo", categoria: "Seguridad", precio: 2350, stock: 12, disponibilidad: true, descripcion: "Cámara resistente a la intemperie IP66 con detección de movimiento por IA y visión nocturna HD.", imagen: "https://sampler.com.uy/imgs/productos/productos34_65938.jpg" },
    { id: "4", nombre: "Pack X2 Lámparas Smart RGB E27", categoria: "Iluminación", precio: 990, stock: 15, disponibilidad: true, descripcion: "Lámparas LED inteligentes Wi-Fi con 16 millones de colores y control mediante app móvil.", imagen: "https://static.bidcom.com.ar/publicacionesML/productos/KLAMPRGB1/1000x1000-KLAMPRGB1.jpg" },
    { id: "5", nombre: "Cerradura Biométrica Inteligente Wi-Fi", categoria: "Seguridad", precio: 6800, stock: 4, disponibilidad: true, descripcion: "Apertura por huella dactilar, clave numérica, tarjeta RFID, llave física o desde la app.", imagen: "https://tech.proaccesorios.com.uy/imgs/productos/productos34_3156.webp" },
    { id: "6", nombre: "Enchufe Inteligente Wi-Fi con Monitoreo", categoria: "Ahorro Energético", precio: 750, stock: 20, disponibilidad: true, descripcion: "Programación de encendido/apagado automático y medición en tiempo real del consumo eléctrico.", imagen: "https://prolink2u.com/cdn/shop/files/DS-3202M-EU_banner3_C_copy_3.png?v=1681111206&width=1500" },
    { id: "7", nombre: "Termostato Inteligente Wi-Fi para Calefacción", categoria: "Climatización", precio: 3200, stock: 6, disponibilidad: true, descripcion: "Regula la temperatura ambiente de tu hogar con horarios inteligentes y ahorro en la factura.", imagen: "https://e01-elmundo.uecdn.es/assets/multimedia/imagenes/2021/10/27/16353336397285.jpg" },
    { id: "8", nombre: "Sensor Inteligente de Apertura de Puertas", categoria: "Seguridad", precio: 650, stock: 18, disponibilidad: true, descripcion: "Recibe notificaciones inmediatas en tu smartphone al detectar apertura no autorizada.", imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2SWTIALb5tvHaY0oHPSnrMKodVIbTLSBzeja03lUU5c1cvgul5YVEPbs&s=10" },
    { id: "9", nombre: "Interruptor Táctil de Pared Inteligente 2 Ch", categoria: "Iluminación", precio: 1250, stock: 10, disponibilidad: true, descripcion: "Reemplaza llaves de luz tradicionales por control táctil de vidrio templado y comandos de voz.", imagen: "https://http2.mlstatic.com/D_NQ_NP_909826-MEC93409908268_092025-O.webp" },
    { id: "10", nombre: "Sensor Inteligente de Fuga de Agua", categoria: "Protección", precio: 890, stock: 7, disponibilidad: true, descripcion: "Alarma sonora y notificación remota al detectar presencia anómala de agua en cocina o baño.", imagen: "https://m.media-amazon.com/images/I/61FeRChj4TL.jpg" }
];

function limpiarPrecio(val) {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;
    const limpio = String(val).replace(/[^0-9.,]/g, '').replace(',', '.');
    const num = parseFloat(limpio);
    return isNaN(num) ? 0 : num;
}

/**
 * Obtiene la lista de productos conectando con Firestore
 */
export async function obtenerProductos() {
    if (!db) return PRODUCTOS_MOCK;

    try {
        const promesaFirestore = getDocs(collection(db, "productos"));
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Timeout Firestore")), 1200)
        );

        const querySnapshot = await Promise.race([promesaFirestore, timeout]);
        const productosFirestore = [];

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            productosFirestore.push({ 
                id: String(docSnap.id),
                idInterno: data.id ? String(data.id) : null,
                ...data,
                stock: Math.max(0, parseInt(data.stock, 10) || 0)
            });
        });

        return productosFirestore.length > 0 ? productosFirestore : PRODUCTOS_MOCK;
    } catch (error) {
        console.warn("Cargando catálogo local unificado:", error.message);
        return PRODUCTOS_MOCK;
    }
}

/**
 * Plantilla HTML única e idéntica para renderizar tarjetas de producto
 */
export function crearTarjetaProductoHTML(prod) {
    const precioLimpio = limpiarPrecio(prod.precio);
    const stockMax = Math.max(0, parseInt(prod.stock, 10) || 0);

    return `
        <article class="card h-100 shadow-sm border-0">
            <a href="producto.html?id=${prod.id}">
                <img src="${prod.imagen}" class="card-img-top" alt="${prod.nombre}" style="height: 200px; object-fit: cover;">
            </a>
            <div class="card-body d-flex flex-column justify-content-between">
                <div>
                    <span class="eyebrow text-uppercase text-muted small fw-bold">${prod.categoria || 'Domótica'}</span>
                    <h3 class="h5 card-title mt-1">
                        <a href="producto.html?id=${prod.id}" class="text-dark text-decoration-none">${prod.nombre}</a>
                    </h3>
                    <p class="card-text text-secondary small">${prod.descripcion}</p>
                </div>
                <div class="mt-3">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <strong class="fs-5 text-success">$ ${precioLimpio.toLocaleString('es-UY')}</strong>
                        <span class="badge text-bg-light border">Stock: ${stockMax}</span>
                    </div>
                    <div class="d-grid gap-2">
                        <a href="producto.html?id=${prod.id}" class="btn btn-outline-secondary btn-sm">Ver detalle</a>
                        <button class="btn btn-sm btn-agregar-carrito text-white" data-id="${prod.id}" style="background-color: #146c43; border-color: #146c43;" ${stockMax <= 0 ? 'disabled' : ''}>
                            ${stockMax > 0 ? 'Agregar al carrito' : 'Sin stock'}
                        </button>
                    </div>
                </div>
            </div>
        </article>
    `;
}

export async function renderizarInicio() {
    const contenedor = document.getElementById('productos-destacados') || 
                       document.getElementById('grilla-inicio') || 
                       document.getElementById('destacados-container');
    if (!contenedor) return;

    const productos = await obtenerProductos();
    const destacados = productos.slice(0, 4);

    contenedor.innerHTML = '';
    destacados.forEach(prod => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-3 mb-4';
        col.innerHTML = crearTarjetaProductoHTML(prod);
        contenedor.appendChild(col);
    });

    contenedor.onclick = (e) => {
        const btn = e.target.closest('.btn-agregar-carrito');
        if (btn) {
            const id = String(btn.getAttribute('data-id'));
            const producto = productos.find(p => String(p.id) === id);
            if (producto) agregarAlCarrito(producto, 1);
        }
    };
}

export async function renderizarCatalogo() {
    const contenedor = document.getElementById('grilla-productos') || document.getElementById('catalogo-container');
    if (!contenedor) return;

    const productos = await obtenerProductos();
    contenedor.innerHTML = '';

    productos.forEach(prod => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 col-xl-3 mb-4';
        col.innerHTML = crearTarjetaProductoHTML(prod);
        contenedor.appendChild(col);
    });

    contenedor.onclick = (e) => {
        const btn = e.target.closest('.btn-agregar-carrito');
        if (btn) {
            const id = String(btn.getAttribute('data-id'));
            const producto = productos.find(p => String(p.id) === id);
            if (producto) agregarAlCarrito(producto, 1);
        }
    };
}

export async function renderizarDetalleProducto() {
    const contenedor = document.getElementById('contenedor-producto');
    if (!contenedor) return;

    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');

    const productos = await obtenerProductos();
    let producto = null;

    if (idParam) {
        const targetId = String(idParam).trim();
        const cleanTargetId = targetId.replace(/^prod-/, '');

        producto = productos.find(p => {
            const pIdStr = String(p.id).trim();
            const pIdLimpio = pIdStr.replace(/^prod-/, '');
            const pIdInternoStr = p.idInterno ? String(p.idInterno).trim() : '';

            return pIdStr === targetId || pIdLimpio === cleanTargetId || pIdInternoStr === targetId || pIdInternoStr === cleanTargetId;
        });

        if (!producto) {
            producto = PRODUCTOS_MOCK.find(p => {
                const pIdStr = String(p.id).trim();
                const pIdLimpio = pIdStr.replace(/^prod-/, '');
                return pIdStr === targetId || pIdLimpio === cleanTargetId;
            });
        }
    }

    if (!producto) {
        producto = productos[0] || PRODUCTOS_MOCK[0];
    }

    const precioLimpio = limpiarPrecio(producto.precio);
    const stockMax = Math.max(0, parseInt(producto.stock, 10) || 0);

    contenedor.innerHTML = `
        <div class="row g-4 align-items-center mb-5">
            <div class="col-md-6">
                <div class="p-3 bg-white border rounded-4 text-center shadow-sm">
                    <img src="${producto.imagen}" class="img-fluid rounded-3" alt="${producto.nombre}" style="max-height: 380px; object-fit: cover; width: 100%;">
                </div>
            </div>
            <div class="col-md-6">
                <span class="badge text-bg-success mb-2 px-3 py-2 text-uppercase">${producto.categoria || 'Domótica'}</span>
                <h1 class="fw-bold mb-3">${producto.nombre}</h1>
                <p class="lead text-secondary mb-4">${producto.descripcion}</p>
                
                <div class="p-3 bg-light rounded-3 mb-4">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <span class="text-muted small">Precio Unitario</span>
                            <h2 class="display-6 fw-bold text-success mb-0">$ ${precioLimpio.toLocaleString('es-UY')}</h2>
                        </div>
                        <span class="badge text-bg-light border p-2">Unidades disponibles: ${stockMax}</span>
                    </div>
                </div>

                <div class="row g-3 align-items-center mb-4">
                    <div class="col-auto">
                        <label for="cantidad-prod" class="col-form-label fw-bold">Cantidad:</label>
                    </div>
                    <div class="col-auto">
                        <input type="number" id="cantidad-prod" class="form-control text-center" value="1" min="1" max="${stockMax}" style="width: 80px;" ${stockMax <= 0 ? 'disabled' : ''}>
                    </div>
                </div>
                
                <div class="d-flex gap-3 flex-wrap">
                    <button id="btn-detalle-agregar" class="btn text-white btn-lg px-4 shadow-sm" style="background-color: #146c43; border-color: #146c43;" ${stockMax <= 0 ? 'disabled' : ''}>
                        ${stockMax > 0 ? 'Agregar al carrito' : 'Agotado'}
                    </button>
                    <a href="catalogo.html" class="btn btn-outline-secondary btn-lg">Volver al catálogo</a>
                </div>
            </div>
        </div>

        <div id="contenedor-opiniones" class="pt-4 border-top"></div>
    `;

    const inputCant = document.getElementById('cantidad-prod');
    if (inputCant) {
        inputCant.addEventListener('change', () => {
            let val = parseInt(inputCant.value, 10) || 1;
            if (val > stockMax) {
                inputCant.value = stockMax;
                mostrarToast(`⚠️ Solo hay ${stockMax} unidad(es) disponibles.`, true);
            } else if (val < 1) {
                inputCant.value = 1;
            }
        });
    }

    const btnAgregar = document.getElementById('btn-detalle-agregar');
    if (btnAgregar && stockMax > 0) {
        btnAgregar.addEventListener('click', () => {
            let cantidad = parseInt(inputCant ? inputCant.value : 1, 10) || 1;
            if (cantidad > stockMax) cantidad = stockMax;
            agregarAlCarrito(producto, cantidad);
        });
    }

    renderizarSeccionOpiniones(producto.id);
}

export function agregarAlCarrito(producto, cantidad = 1) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const stockMax = Math.max(0, parseInt(producto.stock, 10) || 0);

    if (stockMax <= 0) {
        mostrarToast(`⚠️ El producto "${producto.nombre}" está agotado.`, true);
        return;
    }

    const index = carrito.findIndex(item => String(item.id) === String(producto.id));
    const cantidadPrevia = index !== -1 ? (parseInt(carrito[index].cantidad, 10) || 0) : 0;

    if (cantidadPrevia + cantidad > stockMax) {
        const disponiblesParaAgregar = stockMax - cantidadPrevia;
        if (disponiblesParaAgregar <= 0) {
            mostrarToast(`⚠️ Ya tienes las ${stockMax} unidades disponibles de "${producto.nombre}" en tu carrito.`, true);
            return;
        }
        carrito[index].cantidad = stockMax;
        carrito[index].stock = stockMax;
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarBadgeCarrito();
        mostrarToast(`⚠️ Se ajustó al stock máximo (${stockMax} un.). Se agregaron ${disponiblesParaAgregar} unidad(es) restantes.`, true);
        return;
    }

    if (index !== -1) {
        carrito[index].cantidad = cantidadPrevia + cantidad;
        carrito[index].stock = stockMax;
    } else {
        carrito.push({
            id: String(producto.id),
            nombre: producto.nombre,
            precio: limpiarPrecio(producto.precio),
            imagen: producto.imagen,
            cantidad: cantidad,
            stock: stockMax
        });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarBadgeCarrito();
    mostrarToast(`¡Se agregaron ${cantidad} unidad(es) de "${producto.nombre}" al carrito!`);
}

export async function renderizarSeccionOpiniones(productoId) {
    const contenedor = document.getElementById('contenedor-opiniones');
    if (!contenedor) return;

    const { obtenerSesion } = await import('./base.js');
    const usuario = obtenerSesion();

    const resenas = await obtenerResenasProducto(productoId);
    const tieneCompra = usuario ? await haCompradoProducto(usuario, productoId) : false;

    let bloqueFormulario = '';

    if (!usuario) {
        bloqueFormulario = `
            <div class="alert alert-warning small d-flex align-items-center gap-2 mb-4">
                <span>Debes <a href="perfil.html" class="alert-link">iniciar sesión</a> para opinar sobre este producto.</span>
            </div>
        `;
    } else if (!tieneCompra) {
        bloqueFormulario = `
            <div class="alert alert-info small d-flex align-items-center justify-content-between mb-4">
                <div>
                    <strong>🔒 Opiniones verificadas:</strong> Debes realizar una compra de este producto para calificarlo y dejar tu opinión.
                </div>
                <a href="carrito.html" class="btn btn-sm btn-outline-success ms-2 text-nowrap">Ir al Carrito</a>
            </div>
        `;
    } else {
        bloqueFormulario = `
            <form id="form-opinion" class="card border-0 shadow-sm p-3 mb-4 bg-light">
                <h5 class="h6 fw-bold mb-2">Deja tu opinión como comprador: <span class="text-success">${usuario.nombre || usuario.email}</span></h5>
                
                <div class="mb-3">
                    <label for="puntuacion" class="form-label small fw-bold mb-1">Puntuación:</label>
                    <select id="puntuacion" class="form-select form-select-sm" style="max-width: 200px;" required>
                        <option value="">Selecciona...</option>
                        <option value="5">⭐⭐⭐⭐⭐ (5/5) Excelente</option>
                        <option value="4">⭐⭐⭐⭐ (4/5) Muy Bueno</option>
                        <option value="3">⭐⭐⭐ (3/5) Bueno</option>
                        <option value="2">⭐⭐ (2/5) Regular</option>
                        <option value="1">⭐ (1/5) Deficiente</option>
                    </select>
                </div>

                <div class="mb-2">
                    <label for="comentario" class="form-label small fw-bold mb-1">Comentario:</label>
                    <textarea id="comentario" class="form-control form-control-sm" rows="3" 
                              maxlength="500" placeholder="Escribe tu experiencia con el producto..." required></textarea>
                    <div class="d-flex justify-content-between mt-1 extra-small text-muted" style="font-size: 0.75rem;">
                        <span id="contador-caracteres">0 / 500</span>
                    </div>
                </div>

                <button type="submit" id="btn-enviar-opinion" class="btn btn-sm text-white fw-bold align-self-start" style="background-color: #146c43;">
                    Publicar Opinión
                </button>
            </form>
        `;
    }

    const listaHTML = resenas.map(r => `
        <div class="border-bottom py-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <strong class="small">${r.usuario?.nombre || 'Comprador Verificado'}</strong>
                <span class="text-muted extra-small" style="font-size: 0.75rem;">${r.fecha}</span>
            </div>
            <div class="text-warning mb-1">${'★'.repeat(r.calificacion)}${'☆'.repeat(5 - r.calificacion)}</div>
            <p class="small text-secondary mb-0">${r.comentario}</p>
        </div>
    `).join('') || '<p class="text-muted small py-2">Este producto aún no cuenta con opiniones.</p>';

    contenedor.innerHTML = `
        <h4 class="h5 fw-bold mb-3">Opiniones de Clientes</h4>
        ${bloqueFormulario}
        <div id="lista-opiniones">${listaHTML}</div>
    `;

    if (usuario && tieneCompra) {
        const textarea = document.getElementById('comentario');
        const contador = document.getElementById('contador-caracteres');

        textarea?.addEventListener('input', () => {
            if (contador) contador.textContent = `${textarea.value.length} / 500`;
        });

        document.getElementById('form-opinion')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const puntuacion = document.getElementById('puntuacion').value;
            const comentario = textarea.value;

            const exito = await agregarResena(productoId, puntuacion, comentario);
            if (exito) {
                renderizarSeccionOpiniones(productoId);
            }
        });
    }
}

function iniciarApp() {
    actualizarBadgeCarrito();
    const pageAttr = document.body.dataset.page;
    const ruta = window.location.pathname.toLowerCase();

    if (pageAttr === 'inicio' || pageAttr === 'index' || ruta.endsWith('/') || ruta.includes('index.html')) {
        renderizarInicio();
    } else if (pageAttr === 'producto' || ruta.includes('producto.html')) {
        renderizarDetalleProducto();
    } else if (pageAttr === 'catalogo' || ruta.includes('catalogo.html')) {
        renderizarCatalogo();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarApp);
} else {
    iniciarApp();
}