/**
 * js/catalogo.js - Lógica de renderizado, filtrado y sincronización estricta con Firestore
 * Domótica Hogar
 */

import { actualizarBadgeCarrito, mostrarToast, agregarProductoAlCarritoGlobal } from './base.js';

// SVG Fallback en formato Data URI (Garantiza carga offline y evita errores)
const IMAGEN_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='100%25' height='100%25' fill='%23146c43'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='24' fill='%23ffffff' text-anchor='middle' dy='.3em'%3EDom%C3%B3tica Hogar%3E%3C/text%3E%3C/svg%3E";

// Catálogo local de respaldo (solo se usará si Firestore falla o está vacío)
const productosIniciales = [
    { id: '1', nombre: 'Echo Dot 5ª Generación', categoria: 'Entretenimiento', precio: 3500, stock: 3, disponibilidad: true, descripcion: 'Tu asistente de voz para control inteligente y música en streaming.', imagen: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&auto=format&fit=crop&q=80' },
    { id: '2', nombre: 'Sistema de Automatización Domótica', categoria: 'Confort', precio: 1990, stock: 5, disponibilidad: true, descripcion: 'Controla la temperatura, la iluminación y más con inteligencia y ahorro.', imagen: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80' },
    { id: '3', nombre: 'Cámara Seguridad IP Exterior', categoria: 'Seguridad', precio: 2350, stock: 8, disponibilidad: true, descripcion: 'Monitorea tu hogar con visión nocturna en alta definición y alertas instantáneas.', imagen: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80' },
    { id: '4', nombre: 'X2 Lámpara Smart Inteligente RGB', categoria: 'Iluminacion', precio: 990, stock: 15, disponibilidad: true, descripcion: 'Ambientes adaptables con millones de colores y control desde tu smartphone.', imagen: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=600&auto=format&fit=crop&q=80' },
    { id: '5', nombre: 'Cerradura Inteligente Biométrica WiFi', categoria: 'Seguridad', precio: 4800, stock: 4, disponibilidad: true, descripcion: 'Acceso por huella dactilar, clave numérica, tarjeta RFID o app móvil.', imagen: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80' },
    { id: '6', nombre: 'Interruptor Táctil Smart WiFi 3 Vías', categoria: 'Iluminacion', precio: 1250, stock: 12, disponibilidad: true, descripcion: 'Reemplaza tus llaves tradicionales y programa encendidos automáticos.', imagen: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&auto=format&fit=crop&q=80' },
    { id: '7', nombre: 'Sensor de Presencia y Movimiento Zigbee', categoria: 'Seguridad', precio: 890, stock: 10, disponibilidad: true, descripcion: 'Detecta intrusiones y automatiza el encendido de luces al entrar.', imagen: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80' },
    { id: '8', nombre: 'Termostato Inteligente Programable WiFi', categoria: 'Confort', precio: 3200, stock: 2, disponibilidad: true, descripcion: 'Optimiza la temperatura de la calefacción o aire y reduce el consumo eléctrico.', imagen: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop&q=80' },
    { id: '9', nombre: 'Google Nest Mini 2ª Generación', categoria: 'Entretenimiento', precio: 2900, stock: 6, disponibilidad: true, descripcion: 'Asistente de Google integrado con bajos mejorados y reconocimiento de voz.', imagen: 'https://images.unsplash.com/photo-1507646221600-7821e27fb515?w=600&auto=format&fit=crop&q=80' },
    { id: '10', nombre: 'Tira LED Smart RGBIC 5m WiFi', categoria: 'Iluminacion', precio: 1450, stock: 9, disponibilidad: true, descripcion: 'Efectos multicolor simultáneos con sincronización al ritmo de la música.', imagen: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=600&auto=format&fit=crop&q=80' },
    { id: '11', nombre: 'Motor para Cortinas y Persianas WiFi', categoria: 'Confort', precio: 3890, stock: 5, disponibilidad: true, descripcion: 'Abre y cierra tus cortinas automáticamente según el horario solar.', imagen: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80' },
    { id: '12', nombre: 'Enchufe Smart WiFi con Medidor de Consumo', categoria: 'Confort', precio: 650, stock: 20, disponibilidad: true, descripcion: 'Monitorea en tiempo real el gasto de energía de cualquier electrodoméstico.', imagen: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&auto=format&fit=crop&q=80' }
];

let productos = [...productosIniciales];

/**
 * Función adaptada para verificar el estado activo/disponible del producto.
 * Valida variantes de nombres de propiedades en BD, tipos de datos y stock > 0.
 */
function comprobarActivo(prod) {
    if (!prod) return false;

    // 1. Evaluación de stock
    const stockActual = parseInt(prod.stock, 10);
    if (isNaN(stockActual) || stockActual <= 0) {
        return false;
    }

    // 2. Lista extendida de claves de disponibilidad
    const camposClave = ['disponibilidad', 'disponible', 'activo', 'estado', 'visible', 'publicado'];

    // 3. Inspección insensible a mayúsculas/minúsculas sobre las propiedades del producto
    for (let key in prod) {
        if (Object.prototype.hasOwnProperty.call(prod, key)) {
            const keyMinuscula = key.toLowerCase();

            if (camposClave.includes(keyMinuscula)) {
                const valor = prod[key];

                // Falsy directo o explícito
                if (valor === false || valor === null || valor === undefined || valor === "") {
                    return false;
                }

                // Evaluación de cadenas equivalentes a inactivo
                if (typeof valor === 'string') {
                    const str = valor.toLowerCase().trim();
                    if (str === 'false' || str === '0' || str === 'inactivo' || str === 'off' || str === 'no') {
                        return false;
                    }
                }
            }
        }
    }

    return true;
}

/**
 * Carga estricta desde Firestore. Si hay datos, reemplaza el catálogo local.
 */
async function sincronizarCatalogoConFirestore() {
    try {
        const firebaseModule = await import('./firebase/config.js');
        if (firebaseModule.db) {
            const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            const querySnapshot = await getDocs(collection(firebaseModule.db, 'productos'));

            if (!querySnapshot.empty) {
                const productosFirestore = [];
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    productosFirestore.push({ id: String(doc.id), ...data });
                    console.log(`📦 Firebase cargó: ${data.nombre} | Disponibilidad:`, data.disponibilidad);
                });

                // Reemplazo de respaldo local con datos reales de Firestore
                productos = productosFirestore;
                aplicarFiltros();
            } else {
                console.warn("⚠️ Firebase está vacío. Usando catálogo local de respaldo.");
            }
        }
    } catch (e) {
        console.error("Error sincronizando catálogo:", e);
    }
}

function renderizarProductos(lista) {
    const contenedor = document.getElementById('contenedor-catalogo');
    if (!contenedor) return;

    if (lista.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted fs-5">No se encontraron productos disponibles que coincidan con la búsqueda.</p>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = lista.map(prod => {
        const stockNum = parseInt(prod.stock, 10) || 0;
        const sePuedeComprar = stockNum > 0;

        let badgeClass = sePuedeComprar ? 'text-bg-success-subtle text-success border-success-subtle' : 'text-bg-danger-subtle text-danger border-danger-subtle';
        let badgeText = sePuedeComprar ? `Stock: ${stockNum} un.` : 'Agotado';

        if (sePuedeComprar && stockNum <= 3) {
            badgeClass = 'text-bg-warning-subtle text-warning-emphasis border-warning-subtle';
            badgeText = `¡Últimas ${stockNum} un.!`;
        }

        const urlImg = prod.imagen || prod.imagenUrl || prod.img || prod.url || prod.foto || IMAGEN_FALLBACK;

        return `
            <div class="col-md-6 col-xl-3">
                <article class="placeholder-product border rounded-3 overflow-hidden bg-white shadow-sm h-100 d-flex flex-column justify-content-between">
                    <div>
                        <a href="producto.html?id=${prod.id}" class="d-block text-decoration-none">
                            <img 
                                src="${urlImg}" 
                                crossorigin="anonymous"
                                loading="lazy"
                                onerror="this.onerror=null; this.src='${IMAGEN_FALLBACK}';" 
                                class="img-fluid w-100" 
                                alt="${prod.nombre || 'Producto'}" 
                                style="height: 200px; object-fit: cover;"
                            >
                        </a>
                        <div class="p-3">
                            <span class="eyebrow text-uppercase text-muted small fw-bold">${prod.categoria || 'Domótica'}</span>
                            <span class="badge ${badgeClass} border fw-semibold">${badgeText}</span>
                            <h3 class="h5 mt-2">
                                <a href="producto.html?id=${prod.id}" class="text-dark text-decoration-none hover-primary">
                                    ${prod.nombre || 'Sin nombre'}
                                </a>
                            </h3>
                            <p class="text-secondary small text-truncate-2">${prod.descripcion || ''}</p>
                        </div>
                    </div>
                    <div class="p-3 pt-0 d-flex justify-content-between align-items-center gap-2">
                        <strong class="fs-6 text-nowrap">$ ${Number(prod.precio || 0).toLocaleString('es-UY')}</strong>
                        <div class="d-flex gap-1">
                            <a href="producto.html?id=${prod.id}" class="btn btn-sm btn-outline-secondary rounded-pill px-2" title="Ver detalle">
                                Ver detalle
                            </a>
                            <button 
                                data-id="${prod.id}" 
                                class="btn btn-sm btn-agregar-cart text-white rounded-pill px-2 ${!sePuedeComprar ? 'disabled' : ''}" 
                                ${!sePuedeComprar ? 'disabled' : ''}
                                style="background-color: #146c43; border-color: #146c43;"
                            >
                                ${sePuedeComprar ? 'Agregar' : 'Sin Stock'}
                            </button>
                        </div>
                    </div>
                </article>
            </div>
        `;
    }).join('');

    // Eventos de interacción con el carrito
    document.querySelectorAll('.btn-agregar-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = String(e.currentTarget.dataset.id);
            const productoAgregado = productos.find(p => String(p.id) === id);

            if (productoAgregado) {
                agregarProductoAlCarritoGlobal(productoAgregado, 1);
            }
        });
    });
}

function aplicarFiltros() {
    const textoBusqueda = (document.getElementById('input-busqueda')?.value || '').toLowerCase();
    const categoriaSeleccionada = document.getElementById('select-categoria')?.value || '';
    const ordenSeleccionado = document.getElementById('select-orden')?.value || 'defecto';

    let resultado = productos.filter(prod => {
        const coincideTexto = (prod.nombre || '').toLowerCase().includes(textoBusqueda) || 
                               (prod.descripcion || '').toLowerCase().includes(textoBusqueda);
        const coincideCat = !categoriaSeleccionada || (prod.categoria || '').toLowerCase() === categoriaSeleccionada.toLowerCase();
        const estaActivo = comprobarActivo(prod);

        if (!estaActivo) {
            console.log(`❌ Ocultando producto (No disponible o sin stock): ${prod.nombre}`);
        }

        return coincideTexto && coincideCat && estaActivo;
    });

    // Criterios de ordenamiento
    if (ordenSeleccionado === 'precio-asc') {
        resultado.sort((a, b) => a.precio - b.precio);
    } else if (ordenSeleccionado === 'precio-desc') {
        resultado.sort((a, b) => b.precio - a.precio);
    } else if (ordenSeleccionado === 'nombre') {
        resultado.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
    }

    renderizarProductos(resultado);
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Carga inicial de vista local de respaldo
    aplicarFiltros();

    // 2. Sincronización asíncrona con la colección en Firestore
    sincronizarCatalogoConFirestore();

    // 3. Listeners para filtrado dinámico en tiempo real
    document.getElementById('input-busqueda')?.addEventListener('input', aplicarFiltros);
    document.getElementById('select-categoria')?.addEventListener('change', aplicarFiltros);
    document.getElementById('select-orden')?.addEventListener('change', aplicarFiltros);

    document.getElementById('btn-limpiar-filtros')?.addEventListener('click', () => {
        const inputB = document.getElementById('input-busqueda');
        const selectC = document.getElementById('select-categoria');
        const selectO = document.getElementById('select-orden');

        if (inputB) inputB.value = '';
        if (selectC) selectC.value = '';
        if (selectO) selectO.value = 'defecto';

        aplicarFiltros();
    });
});