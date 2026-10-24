/**
 * js/catalogo.js - Lógica de renderizado, enlaces a detalle, filtrado y control estricto de stock
 * Domótica Hogar
 */

import { actualizarBadgeCarrito, mostrarToast, agregarProductoAlCarritoGlobal } from './base.js';

// SVG Fallback en formato Data URI (Garantiza carga offline y evita errores de SSL/CORS)
const IMAGEN_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='100%25' height='100%25' fill='%23146c43'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='24' fill='%23ffffff' text-anchor='middle' dy='.3em'%3EDom%C3%B3tica Hogar%3E%3C/text%3E%3C/svg%3E";

const productosIniciales = [
    {
        id: '1',
        nombre: 'Echo Dot 5ª Generación',
        categoria: 'Entretenimiento',
        precio: 3500,
        badgeText: '¡Últimas 3 un.!',
        badgeClass: 'text-bg-warning-subtle text-warning-emphasis border-warning-subtle',
        descripcion: 'Tu asistente de voz para control inteligente y música en streaming.',
        imagen: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&auto=format&fit=crop&q=80',
        stock: 3,
        disponibilidad: true
    },
    {
        id: '2',
        nombre: 'Sistema de Automatización Domótica',
        categoria: 'Confort',
        precio: 1990,
        badgeText: '¡Últimas 5 un.!',
        badgeClass: 'text-bg-warning-subtle text-warning-emphasis border-warning-subtle',
        descripcion: 'Controla la temperatura, la iluminación y más con inteligencia y ahorro.',
        imagen: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80',
        stock: 5,
        disponibilidad: true
    },
    {
        id: '3',
        nombre: 'Cámara Seguridad IP Exterior',
        categoria: 'Seguridad',
        precio: 2350,
        badgeText: 'Stock: 8 un.',
        badgeClass: 'text-bg-success-subtle text-success border-success-subtle',
        descripcion: 'Monitorea tu hogar con visión nocturna en alta definición y alertas instantáneas.',
        imagen: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80',
        stock: 8,
        disponibilidad: true
    },
    {
        id: '4',
        nombre: 'X2 Lámpara Smart Inteligente RGB',
        categoria: 'Iluminacion',
        precio: 990,
        badgeText: 'Stock: 15 un.',
        badgeClass: 'text-bg-success-subtle text-success border-success-subtle',
        descripcion: 'Ambientes adaptables con millones de colores y control desde tu smartphone.',
        imagen: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=600&auto=format&fit=crop&q=80',
        stock: 15,
        disponibilidad: true
    },
    {
        id: '5',
        nombre: 'Cerradura Inteligente Biométrica WiFi',
        categoria: 'Seguridad',
        precio: 4800,
        badgeText: 'Stock: 4 un.',
        badgeClass: 'text-bg-success-subtle text-success border-success-subtle',
        descripcion: 'Acceso por huella dactilar, clave numérica, tarjeta RFID o app móvil.',
        imagen: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80',
        stock: 4,
        disponibilidad: true
    },
    {
        id: '6',
        nombre: 'Interruptor Táctil Smart WiFi 3 Vías',
        categoria: 'Iluminacion',
        precio: 1250,
        badgeText: 'Stock: 12 un.',
        badgeClass: 'text-bg-success-subtle text-success border-success-subtle',
        descripcion: 'Reemplaza tus llaves tradicionales y programa encendidos automáticos.',
        imagen: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&auto=format&fit=crop&q=80',
        stock: 12,
        disponibilidad: true
    },
    {
        id: '7',
        nombre: 'Sensor de Presencia y Movimiento Zigbee',
        categoria: 'Seguridad',
        precio: 890,
        badgeText: 'Stock: 10 un.',
        badgeClass: 'text-bg-success-subtle text-success border-success-subtle',
        descripcion: 'Detecta intrusiones y automatiza el encendido de luces al entrar.',
        imagen: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
        stock: 10,
        disponibilidad: true
    },
    {
        id: '8',
        nombre: 'Termostato Inteligente Programable WiFi',
        categoria: 'Confort',
        precio: 3200,
        badgeText: '¡Últimas 2 un.!',
        badgeClass: 'text-bg-warning-subtle text-warning-emphasis border-warning-subtle',
        descripcion: 'Optimiza la temperatura de la calefacción o aire y reduce el consumo eléctrico.',
        imagen: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop&q=80',
        stock: 2,
        disponibilidad: true
    },
    {
        id: '9',
        nombre: 'Google Nest Mini 2ª Generación',
        categoria: 'Entretenimiento',
        precio: 2900,
        badgeText: 'Stock: 6 un.',
        badgeClass: 'text-bg-success-subtle text-success border-success-subtle',
        descripcion: 'Asistente de Google integrado con bajos mejorados y reconocimiento de voz.',
        imagen: 'https://images.unsplash.com/photo-1507646221600-7821e27fb515?w=600&auto=format&fit=crop&q=80',
        stock: 6,
        disponibilidad: true
    },
    {
        id: '10',
        nombre: 'Tira LED Smart RGBIC 5m WiFi',
        categoria: 'Iluminacion',
        precio: 1450,
        badgeText: 'Stock: 9 un.',
        badgeClass: 'text-bg-success-subtle text-success border-success-subtle',
        descripcion: 'Efectos multicolor simultáneos con sincronización al ritmo de la música.',
        imagen: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=600&auto=format&fit=crop&q=80',
        stock: 9,
        disponibilidad: true
    },
    {
        id: '11',
        nombre: 'Motor para Cortinas y Persianas WiFi',
        categoria: 'Confort',
        precio: 3890,
        badgeText: 'Stock: 5 un.',
        badgeClass: 'text-bg-success-subtle text-success border-success-subtle',
        descripcion: 'Abre y cierra tus cortinas automáticamente según el horario solar.',
        imagen: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
        stock: 5,
        disponibilidad: true
    },
    {
        id: '12',
        nombre: 'Enchufe Smart WiFi con Medidor de Consumo',
        categoria: 'Confort',
        precio: 650,
        badgeText: 'Stock: 20 un.',
        badgeClass: 'text-bg-success-subtle text-success border-success-subtle',
        descripcion: 'Monitorea en tiempo real el gasto de energía de cualquier electrodoméstico.',
        imagen: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&auto=format&fit=crop&q=80',
        stock: 20,
        disponibilidad: true
    }
];

let productos = [...productosIniciales];

/**
 * Carga opcional desde Firestore para mantener stock sincronizado
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
                    productosFirestore.push({ id: String(doc.id), ...doc.data() });
                });

                // Reemplazar o actualizar los items locales con datos remotos
                productos = productosIniciales.map(localItem => {
                    const remoto = productosFirestore.find(f => String(f.id) === String(localItem.id));
                    return remoto ? { ...localItem, ...remoto } : localItem;
                });
                
                aplicarFiltros();
            }
        }
    } catch (e) {
        console.warn("Utilizando datos de catálogo local.", e);
    }
}

function renderizarProductos(lista) {
    const contenedor = document.getElementById('contenedor-catalogo');
    if (!contenedor) return;

    if (lista.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted fs-5">No se encontraron productos que coincidan con la búsqueda.</p>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = lista.map(prod => {
        const stockNum = parseInt(prod.stock, 10) || 0;
        const disponible = prod.disponibilidad !== false && stockNum > 0;

        let badgeClass = prod.badgeClass || 'text-bg-success-subtle text-success border-success-subtle';
        let badgeText = prod.badgeText || `Stock: ${stockNum} un.`;

        if (!disponible) {
            badgeClass = 'text-bg-danger-subtle text-danger border-danger-subtle';
            badgeText = 'Agotado';
        } else if (stockNum <= 3) {
            badgeClass = 'text-bg-warning-subtle text-warning-emphasis border-warning-subtle';
            badgeText = `¡Últimas ${stockNum} un.!`;
        }

        // Búsqueda flexible de campos de imagen y fallback seguro
        const urlImg = prod.imagen || prod.imagenUrl || prod.img || prod.url || prod.foto || IMAGEN_FALLBACK;

        return `
            <div class="col-md-6 col-xl-3">
                <article class="placeholder-product border rounded-3 overflow-hidden bg-white shadow-sm h-100 d-flex flex-column justify-content-between">
                    <div>
                        <a href="producto.html?id=${prod.id}" class="d-block text-decoration-none">
                            <img 
                                src="${urlImg}" 
                                crossorigin="anonymous"
                                loading="eager"
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
                                class="btn btn-sm btn-agregar-cart text-white rounded-pill px-2 ${!disponible ? 'disabled' : ''}" 
                                ${!disponible ? 'disabled' : ''}
                                style="background-color: #146c43; border-color: #146c43;"
                            >
                                ${disponible ? 'Agregar' : 'Sin Stock'}
                            </button>
                        </div>
                    </div>
                </article>
            </div>
        `;
    }).join('');

    // Event listeners asociados a la función global unificada de validación de stock
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
        return coincideTexto && coincideCat;
    });

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
    renderizarProductos(productos);
    sincronizarCatalogoConFirestore();

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

        renderizarProductos(productos);
    });
});