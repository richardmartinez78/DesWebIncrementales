/**
 * js/productos.js - Gestión unificada del catálogo y detalle de producto con saneamiento de precios
 * Domótica Hogar
 */

import { db } from './firebase/config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { actualizarBadgeCarrito, mostrarToast } from './base.js';

export const PRODUCTOS_MOCK = [
    {
        id: "1",
        nombre: "Echo Dot 5ª Generación",
        categoria: "Entretenimiento",
        precio: 3500,
        stock: 8,
        disponibilidad: true,
        descripcion: "Tu asistente de voz inteligente Alexa para controlar música, dispositivos inteligentes y rutinas del hogar.",
        imagen: "https://bgreat.uy/wp-content/uploads/2024/11/199538-Asistente-de-Voz-Alexa-Echo-Dot-5ta-Gen-Charcole-4-510x510.jpg"
    },
    {
        id: "2",
        nombre: "Sistema de Automatización Domótica Tuya",
        categoria: "Confort",
        precio: 1990,
        stock: 5,
        disponibilidad: true,
        descripcion: "Central HUB Zigbee y WiFi para automatización integral de luces, persianas y sensores.",
        imagen: "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80"
    },
    {
        id: "3",
        nombre: "Cámara Seguridad IP Exterior TP-Link Tapo",
        categoria: "Seguridad",
        precio: 2350,
        stock: 12,
        disponibilidad: true,
        descripcion: "Cámara resistente a la intemperie IP66 con detección de movimiento por IA y visión nocturna HD.",
        imagen: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80"
    },
    {
        id: "4",
        nombre: "Pack X2 Lámparas Smart RGB E27",
        categoria: "Iluminación",
        precio: 990,
        stock: 15,
        disponibilidad: true,
        descripcion: "Lámparas LED inteligentes Wi-Fi con 16 millones de colores y control mediante app móvil.",
        imagen: "https://images.unsplash.com/photo-1550985616-10810253b84d?w=600&auto=format&fit=crop&q=80"
    },
    {
        id: "5",
        nombre: "Cerradura Biométrica Inteligente Wi-Fi",
        categoria: "Seguridad",
        precio: 6800,
        stock: 4,
        disponibilidad: true,
        descripcion: "Apertura por huella dactilar, clave numérica, tarjeta RFID, llave física o desde la app.",
        imagen: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "6",
        nombre: "Enchufe Inteligente Wi-Fi con Monitoreo",
        categoria: "Ahorro Energético",
        precio: 750,
        stock: 20,
        disponibilidad: true,
        descripcion: "Programación de encendido/apagado automático y medición en tiempo real del consumo eléctrico.",
        imagen: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "7",
        nombre: "Termostato Inteligente Wi-Fi para Calefacción",
        categoria: "Climatización",
        precio: 3200,
        stock: 6,
        disponibilidad: true,
        descripcion: "Regula la temperatura ambiente de tu hogar con horarios inteligentes y ahorro en la factura.",
        imagen: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "8",
        nombre: "Sensor Inteligente de Apertura de Puertas",
        categoria: "Seguridad",
        precio: 650,
        stock: 18,
        disponibilidad: true,
        descripcion: "Recibe notificaciones inmediatas en tu smartphone al detectar apertura no autorizada.",
        imagen: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "9",
        nombre: "Interruptor Táctil de Pared Inteligente 2 Ch",
        categoria: "Iluminación",
        precio: 1250,
        stock: 10,
        disponibilidad: true,
        descripcion: "Reemplaza llaves de luz tradicionales por control táctil de vidrio templado y comandos de voz.",
        imagen: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "10",
        nombre: "Sensor Inteligente de Fuga de Agua",
        categoria: "Protección",
        precio: 890,
        stock: 7,
        disponibilidad: true,
        descripcion: "Alarma sonora y notificación remota al detectar presencia anómala de agua en cocina o baño.",
        imagen: "https://images.unsplash.com/photo-1507646221600-7821e27fb515?auto=format&fit=crop&w=600&q=80"
    }
];

function limpiarPrecio(val) {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;
    const limpio = String(val).replace(/[^0-9.,]/g, '').replace(',', '.');
    const num = parseFloat(limpio);
    return isNaN(num) ? 0 : num;
}

export async function obtenerProductos() {
    try {
        if (!db) return PRODUCTOS_MOCK;
        const querySnapshot = await getDocs(collection(db, "productos"));
        const productosFirestore = [];

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            productosFirestore.push({ 
                id: String(docSnap.id),
                idInterno: data.id ? String(data.id) : null,
                ...data 
            });
        });

        return productosFirestore.length > 0 ? productosFirestore : PRODUCTOS_MOCK;
    } catch (error) {
        console.warn("Cargando catálogo local de respaldo:", error.message);
        return PRODUCTOS_MOCK;
    }
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

            return pIdStr === targetId || 
                   pIdLimpio === cleanTargetId || 
                   pIdInternoStr === targetId ||
                   pIdInternoStr === cleanTargetId;
        });

        if (!producto) {
            producto = PRODUCTOS_MOCK.find(p => {
                const pIdStr = String(p.id).trim();
                const pIdLimpio = pIdStr.replace(/^prod-/, '');
                return pIdStr === targetId || pIdLimpio === cleanTargetId;
            });
        }

        if (!producto && !isNaN(cleanTargetId)) {
            const index = parseInt(cleanTargetId, 10) - 1;
            if (index >= 0 && index < productos.length) {
                producto = productos[index];
            } else if (index >= 0 && index < PRODUCTOS_MOCK.length) {
                producto = PRODUCTOS_MOCK[index];
            }
        }
    }

    if (!producto) {
        producto = productos[0] || PRODUCTOS_MOCK[0];
    }

    const precioLimpio = limpiarPrecio(producto.precio);

    contenedor.innerHTML = `
        <div class="row g-4 align-items-center">
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
                        <span class="badge text-bg-light border p-2">Unidades disponibles: ${producto.stock}</span>
                    </div>
                </div>

                <div class="row g-3 align-items-center mb-4">
                    <div class="col-auto">
                        <label for="cantidad-prod" class="col-form-label fw-bold">Cantidad:</label>
                    </div>
                    <div class="col-auto">
                        <input type="number" id="cantidad-prod" class="form-control text-center" value="1" min="1" max="${producto.stock}" style="width: 80px;">
                    </div>
                </div>
                
                <div class="d-flex gap-3 flex-wrap">
                    <button id="btn-detalle-agregar" class="btn text-white btn-lg px-4 shadow-sm" style="background-color: #146c43; border-color: #146c43;">
                        Agregar al carrito
                    </button>
                    <a href="catalogo.html" class="btn btn-outline-secondary btn-lg">Volver al catálogo</a>
                </div>
            </div>
        </div>
    `;

    const btnAgregar = document.getElementById('btn-detalle-agregar');
    if (btnAgregar) {
        btnAgregar.addEventListener('click', () => {
            const inputCant = document.getElementById('cantidad-prod');
            const cantidad = parseInt(inputCant ? inputCant.value : 1, 10) || 1;
            agregarAlCarrito(producto, cantidad);
        });
    }
}

export async function renderizarCatalogo() {
    const contenedor = document.getElementById('grilla-productos');
    if (!contenedor) return;

    const productos = await obtenerProductos();
    contenedor.innerHTML = '';

    productos.forEach(prod => {
        const precioLimpio = limpiarPrecio(prod.precio);
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 col-xl-3 mb-4';
        col.innerHTML = `
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
                            <span class="badge text-bg-light border">Stock: ${prod.stock}</span>
                        </div>
                        <div class="d-grid gap-2">
                            <a href="producto.html?id=${prod.id}" class="btn btn-outline-secondary btn-sm">Ver detalle</a>
                            <button class="btn btn-sm btn-agregar-carrito text-white" data-id="${prod.id}" style="background-color: #146c43; border-color: #146c43;">
                                Agregar al carrito
                            </button>
                        </div>
                    </div>
                </div>
            </article>
        `;
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

export function agregarAlCarrito(producto, cantidad = 1) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    const index = carrito.findIndex(item => String(item.id) === String(producto.id));
    if (index !== -1) {
        carrito[index].cantidad = (parseInt(carrito[index].cantidad, 10) || 0) + cantidad;
    } else {
        carrito.push({
            id: String(producto.id),
            nombre: producto.nombre,
            precio: limpiarPrecio(producto.precio),
            imagen: producto.imagen,
            cantidad: cantidad
        });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarBadgeCarrito();
    mostrarToast(`¡Se agregaron ${cantidad} unidad(es) de "${producto.nombre}" al carrito!`);
}

function iniciarApp() {
    actualizarBadgeCarrito();
    const pageAttr = document.body.dataset.page;
    const ruta = window.location.pathname.toLowerCase();

    if (pageAttr === 'producto' || ruta.includes('producto.html')) {
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