// js/productos.js
import { db } from './firebase/config.js';
import { 
    collection, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { actualizarContadorCarritoGlobal } from './base.js';

// Catálogo completo de 10 productos con IMÁGENES ÚNICAS para cada artículo
const PRODUCTOS_MOCK = [
    {
        id: "prod-1",
        nombre: "Echo Dot 5ª Generación",
        categoria: "Entretenimiento",
        precio: 3500,
        stock: 8,
        descripcion: "Tu asistente de voz inteligente Alexa para controlar música, dispositivos inteligentes y rutinas del hogar.",
        imagen: "https://bgreat.uy/wp-content/uploads/2024/11/199538-Asistente-de-Voz-Alexa-Echo-Dot-5ta-Gen-Charcole-4-510x510.jpg"
    },
    {
        id: "prod-2",
        nombre: "Sistema de Automatización Domótica Tuya",
        categoria: "Confort",
        precio: 1990,
        stock: 5,
        descripcion: "Central HUB Zigbee y WiFi para automatización integral de luces, persianas y sensores.",
        imagen: "https://image.made-in-china.com/202f0j00ELaeRtbhIBcI/Tuya-WiFi-Zigbee-3-0-Integrated-Domotic-Smart-Home-Automation-System-Products-Devices-Work-with-Alexa-and-Google-Home.webp"
    },
    {
        id: "prod-3",
        nombre: "Cámara Seguridad IP Exterior TP-Link Tapo",
        categoria: "Seguridad",
        precio: 2350,
        stock: 12,
        descripcion: "Cámara resistente a la intemperie IP66 con detección de movimiento por IA y visión nocturna HD.",
        imagen: "https://tech.proaccesorios.com.uy/imgs/productos/productos34_3247.webp"
    },
    {
        id: "prod-4",
        nombre: "Pack X2 Lámparas Smart RGB E27",
        categoria: "Iluminación",
        precio: 990,
        stock: 15,
        descripcion: "Lámparas LED inteligentes Wi-Fi con 16 millones de colores y control mediante app móvil.",
        imagen: "https://http2.mlstatic.com/D_NQ_NP_2X_995627-MLU92600735337_092025-F.webp"
    },
    {
        id: "prod-5",
        nombre: "Cerradura Biométrica Inteligente Wi-Fi",
        categoria: "Seguridad",
        precio: 6800,
        stock: 4,
        descripcion: "Apertura por huella dactilar, clave numérica, tarjeta RFID, llave física o desde la app.",
        imagen: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "prod-6",
        nombre: "Enchufe Inteligente Wi-Fi con Monitoreo",
        categoria: "Ahorro Energético",
        precio: 750,
        stock: 20,
        descripcion: "Programación de encendido/apagado automático y medición en tiempo real del consumo eléctrico.",
        imagen: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "prod-7",
        nombre: "Termostato Inteligente Wi-Fi para Calefacción",
        categoria: "Climatización",
        precio: 3200,
        stock: 6,
        descripcion: "Regula la temperatura ambiente de tu hogar con horarios inteligentes y ahorro en la factura.",
        imagen: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "prod-8",
        nombre: "Sensor Inteligente de Apertura de Puertas",
        categoria: "Seguridad",
        precio: 650,
        stock: 18,
        descripcion: "Recibe notificaciones inmediatas en tu smartphone al detectar apertura no autorizada.",
        imagen: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "prod-9",
        nombre: "Interruptor Táctil de Pared Inteligente 2 Ch",
        categoria: "Iluminación",
        precio: 1250,
        stock: 10,
        descripcion: "Reemplaza llaves de luz tradicionales por control táctil de vidrio templado y comandos de voz.",
        imagen: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "prod-10",
        nombre: "Sensor Inteligente de Fuga de Agua",
        categoria: "Protección",
        precio: 890,
        stock: 7,
        descripcion: "Alarma sonora y notificación remota al detectar presencia anómala de agua en cocina o baño.",
        imagen: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=600&q=80"
    }
];

// ==========================================================================
// 1. OBTENER PRODUCTOS (FIRESTORE CON FALLBACK A MOCK LOCAL)
// ==========================================================================
export async function obtenerProductos() {
    try {
        const querySnapshot = await getDocs(collection(db, "productos"));
        const productosFirestore = [];

        querySnapshot.forEach((docSnap) => {
            productosFirestore.push({ id: docSnap.id, ...docSnap.data() });
        });

        if (productosFirestore.length > 0) {
            return productosFirestore;
        } else {
            return PRODUCTOS_MOCK;
        }
    } catch (error) {
        console.warn("Usando catálogo local de respaldo:", error.message);
        return PRODUCTOS_MOCK;
    }
}

// ==========================================================================
// 2. RENDERIZAR CATÁLOGO (catalogo.html)
// ==========================================================================
export async function renderizarCatalogo() {
    const contenedor = document.getElementById('grilla-productos');
    if (!contenedor) return;

    const productos = await obtenerProductos();
    contenedor.innerHTML = '';

    productos.forEach(prod => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 col-xl-3 mb-4';
        col.innerHTML = `
            <article class="card h-100 shadow-sm border-0">
                <img src="${prod.imagen}" class="card-img-top" alt="${prod.nombre}" style="height: 200px; object-fit: cover;">
                <div class="card-body d-flex flex-column justify-content-between">
                    <div>
                        <span class="eyebrow text-uppercase text-muted small fw-bold">${prod.categoria || 'Domótica'}</span>
                        <h3 class="h5 card-title mt-1">${prod.nombre}</h3>
                        <p class="card-text text-secondary small">${prod.descripcion}</p>
                    </div>
                    <div class="mt-3">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <strong class="fs-5 text-success">$ ${prod.precio}</strong>
                            <span class="badge text-bg-light border">Stock: ${prod.stock}</span>
                        </div>
                        <div class="d-grid gap-2">
                            <a href="producto.html?id=${prod.id}" class="btn btn-outline-secondary btn-sm">Ver detalle</a>
                            <button class="btn btn-verde-domotica btn-sm btn-agregar-carrito" data-id="${prod.id}">
                                Agregar al carrito
                            </button>
                        </div>
                    </div>
                </div>
            </article>
        `;
        contenedor.appendChild(col);
    });

    contenedor.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-agregar-carrito')) {
            const id = e.target.getAttribute('data-id');
            const producto = productos.find(p => p.id === id);
            if (producto) agregarAlCarrito(producto, 1);
        }
    });
}

// ==========================================================================
// 3. RENDERIZAR DETALLE DE PRODUCTO (producto.html)
// ==========================================================================
export async function renderizarDetalleProducto() {
    const contenedor = document.getElementById('contenedor-producto');
    if (!contenedor) return;

    const urlParams = new URLSearchParams(window.location.search);
    const idProducto = urlParams.get('id');

    const productos = await obtenerProductos();
    const producto = productos.find(p => p.id === idProducto) || productos[0];

    if (!producto) {
        contenedor.innerHTML = `<div class="alert alert-warning text-center">No se encontró el producto especificado.</div>`;
        return;
    }

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
                            <h2 class="display-6 fw-bold text-success mb-0">$ ${producto.precio}</h2>
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
                    <button id="btn-detalle-agregar" class="btn btn-verde-domotica btn-lg px-4 shadow-sm">
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
            const cantidad = parseInt(inputCant ? inputCant.value : 1) || 1;
            agregarAlCarrito(producto, cantidad);
        });
    }
}

// ==========================================================================
// 4. LÓGICA DE AGREGAR AL CARRITO
// ==========================================================================
export function agregarAlCarrito(producto, cantidad = 1) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    const index = carrito.findIndex(item => item.id === producto.id);
    if (index !== -1) {
        carrito[index].cantidad = (parseInt(carrito[index].cantidad) || 0) + cantidad;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: cantidad
        });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarritoGlobal();

    const toastEl = document.getElementById('appToast');
    const toastBody = document.getElementById('toastMessage');
    if (toastEl && toastBody) {
        toastBody.textContent = `¡Se agregaron ${cantidad} unidad(es) de "${producto.nombre}" al carrito!`;
        toastEl.className = 'toast align-items-center text-bg-success border-0 show';
        setTimeout(() => toastEl.classList.remove('show'), 3500);
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    actualizarContadorCarritoGlobal();
    
    if (document.getElementById('grilla-productos')) {
        renderizarCatalogo();
    }
    
    if (document.getElementById('contenedor-producto')) {
        renderizarDetalleProducto();
    }
});