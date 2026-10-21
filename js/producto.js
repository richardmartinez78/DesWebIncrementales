/**
 * js/producto.js - Carga dinámica de detalles de producto por ID con Firestore / Respaldo Local
 * Domótica Hogar
 */

import { actualizarBadgeCarrito, mostrarToast } from './base.js';

const IMAGEN_FALLBACK = 'https://placehold.co/600x400/146c43/ffffff?text=Dom%C3%B3tica+Hogar';

// Catálogo local de respaldo para garantizar que "Ver detalle" funcione siempre
const productosLocales = [
    {
        id: '1',
        nombre: 'Echo Dot 5ª Generación',
        categoria: 'Entretenimiento',
        precio: 3500,
        stock: 3,
        disponibilidad: true,
        descripcion: 'Tu asistente de voz inteligente con sonido mejorado, voces más claras y graves intensos en cualquier habitación. Controla tu hogar inteligente por voz o desde la aplicación.',
        imagen: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&auto=format&fit=crop&q=80',
        caracteristicas: [
            'Conectividad WiFi y Bluetooth integrados',
            'Compatible con Alexa, Zigbee y Matter',
            'Detección de temperatura y movimiento',
            'Controles táctiles superiores y botón para apagar micrófonos'
        ]
    },
    {
        id: '2',
        nombre: 'Sistema de Automatización Domótica',
        categoria: 'Confort',
        precio: 1990,
        stock: 5,
        disponibilidad: true,
        descripcion: 'Controla la temperatura, la iluminación y los accesos de tu hogar con este hub central inteligente de alta precisión y bajo consumo.',
        imagen: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80',
        caracteristicas: [
            'Hub central multitono con pantalla táctil',
            'Compatibilidad con asistentes de voz',
            'Ahorro energético programable hasta un 30%',
            'Instalación rápida Plug & Play'
        ]
    },
    {
        id: '3',
        nombre: 'Cámara Seguridad IP Exterior',
        categoria: 'Seguridad',
        precio: 2350,
        stock: 8,
        disponibilidad: true,
        descripcion: 'Monitorea el exterior de tu hogar en resolución Full HD 1080p con visión nocturna infrarroja, audio bidireccional y resistencia al agua IP66.',
        imagen: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80',
        caracteristicas: [
            'Visión nocturna HD hasta 30 metros',
            'Certificación de intemperie IP66',
            'Notificaciones de movimiento en tiempo real',
            'Almacenamiento en nube o tarjeta MicroSD'
        ]
    },
    {
        id: '4',
        nombre: 'X2 Lámpara Smart Inteligente RGB',
        categoria: 'Iluminacion',
        precio: 990,
        stock: 15,
        disponibilidad: true,
        descripcion: 'Pack de 2 lámparas LED inteligentes con 16 millones de colores y luz blanca regulable. Control directo desde tu celular o con comandos de voz.',
        imagen: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=600&auto=format&fit=crop&q=80',
        caracteristicas: [
            'Rosca estándar E27 de fácil instalación',
            'Sincronización con música y ritmos',
            'Bajo consumo de energía 9W LED',
            'Rutinas de encendido y apagado automáticas'
        ]
    },
    {
        id: '5',
        nombre: 'Cerradura Inteligente Biométrica WiFi',
        categoria: 'Seguridad',
        precio: 4800,
        stock: 4,
        disponibilidad: true,
        descripcion: 'Asegura tu hogar con tecnología de vanguardia. Apertura por huella dactilar, clave táctil, tarjeta RFID, llaves mecánicas o aplicación móvil.',
        imagen: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80',
        caracteristicas: [
            'Lector biométrico 360° ultra veloz',
            'Creación de claves temporales para visitas',
            'Alarma de intentos fallidos e intromisión',
            'Batería de larga duración con puerto USB de emergencia'
        ]
    },
    {
        id: '6',
        nombre: 'Interruptor Táctil Smart WiFi 3 Vías',
        categoria: 'Iluminacion',
        precio: 1250,
        stock: 12,
        disponibilidad: true,
        descripcion: 'Panel táctil de vidrio templado para el control elegante y moderno de luces en tu hogar. Programable desde cualquier lugar mediante WiFi.',
        imagen: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&auto=format&fit=crop&q=80',
        caracteristicas: [
            'Superficie de cristal templado anti-rayaduras',
            'Indicador LED retroiluminado sutil',
            'Sin necesidad de hub adicional',
            'Compatible con temporizadores y escenas'
        ]
    },
    {
        id: '7',
        nombre: 'Sensor de Presencia y Movimiento Zigbee',
        categoria: 'Seguridad',
        precio: 890,
        stock: 10,
        disponibilidad: true,
        descripcion: 'Detecta movimientos con un ángulo de 120 grados y hasta 7 metros. Ideal para automatizar encendido de luces y alertas de seguridad.',
        imagen: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
        caracteristicas: [
            'Ángulo de detección amplio 120°',
            'Batería ultra eficiente con hasta 2 años de duración',
            'Tamaño compacto y fácil montaje adhesivo',
            'Vinculación directa con sirenas y luces'
        ]
    },
    {
        id: '8',
        nombre: 'Termostato Inteligente Programable WiFi',
        categoria: 'Confort',
        precio: 3200,
        stock: 2,
        disponibilidad: true,
        descripcion: 'Ajusta y automatiza la temperatura ambiente desde tu teléfono. Aprende de tus hábitos para maximizar el confort y reducir costos de energía.',
        imagen: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop&q=80',
        caracteristicas: [
            'Pantalla LED de alto contraste',
            'Programación semanal personalizada',
            'Reportes de consumo energético mensual',
            'Geofencing: activa la climatización al acercarte a casa'
        ]
    },
    {
        id: '9',
        nombre: 'Google Nest Mini 2ª Generación',
        categoria: 'Entretenimiento',
        precio: 2900,
        stock: 6,
        disponibilidad: true,
        descripcion: 'El altavoz inteligente más versátil con el Asistente de Google. Graves dos veces más potentes para disfrutar tus listas de reproducción favoritas.',
        imagen: 'https://images.unsplash.com/photo-1507646221600-7821e27fb515?w=600&auto=format&fit=crop&q=80',
        caracteristicas: [
            'Reconocimiento de voz por usuario Voice Match',
            'Sonido de 360 grados mejorado',
            'Soporte integrado para colgar en pared',
            'Materiales sostenibles fabricados con botellas recicladas'
        ]
    },
    {
        id: '10',
        nombre: 'Tira LED Smart RGBIC 5m WiFi',
        categoria: 'Iluminacion',
        precio: 1450,
        stock: 9,
        disponibilidad: true,
        descripcion: 'Tira de luz LED flexible con tecnología RGBIC que permite mostrar múltiples colores en una misma línea de forma simultánea.',
        imagen: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=600&auto=format&fit=crop&q=80',
        caracteristicas: [
            'Efectos dinámicos en segmentos individuales',
            'Sincronización con micrófono integrado',
            'Recortable y fácil adherencia 3M',
            'Largo de 5 metros ampliables'
        ]
    },
    {
        id: '11',
        nombre: 'Motor para Cortinas y Persianas WiFi',
        categoria: 'Confort',
        precio: 3890,
        stock: 5,
        disponibilidad: true,
        descripcion: 'Motorización silenciosa para automatizar tus cortinas tradicionales sin cambiar los rieles. Abre o cierra según el sol o la hora.',
        imagen: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
        caracteristicas: [
            'Instalación rápida sobre rieles U/I',
            'Control de posición porcentual (ej. abrir al 50%)',
            'Sensor de luz solar integrado',
            'Batería recargable vía USB Type-C'
        ]
    },
    {
        id: '12',
        nombre: 'Enchufe Smart WiFi con Medidor de Consumo',
        categoria: 'Confort',
        precio: 650,
        stock: 20,
        disponibilidad: true,
        descripcion: 'Convierte cualquier dispositivo tradicional en inteligente. Monitorea el consumo eléctrico en Watts y kWh desde tu smartphone.',
        imagen: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&auto=format&fit=crop&q=80',
        caracteristicas: [
            'Protección contra sobrecargas e incendios',
            'Monitoreo del gasto de corriente en tiempo real',
            'Programación de temporizadores y cuenta regresiva',
            'Diseño compacto que no bloquea tomas contiguas'
        ]
    }
];

let productoActual = null;

/**
 * Obtiene el ID del producto desde los parámetros de la URL (?id=...)
 */
function obtenerIdDeURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

/**
 * Carga la información del producto correspondiente
 */
async function cargarProducto() {
    const productId = obtenerIdDeURL();

    // 1. Buscar en el catálogo local matching por ID
    let productoEncontrado = productosLocales.find(p => String(p.id) === String(productId));

    // 2. Si hay ID, consultar Firestore para obtener datos actualizados en tiempo real si existe
    if (productId) {
        try {
            const firebaseModule = await import('./firebase/config.js');
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            
            if (firebaseModule.db) {
                const docRef = firestoreModule.doc(firebaseModule.db, 'productos', String(productId));
                const docSnap = await firestoreModule.getDoc(docRef);

                if (docSnap.exists()) {
                    productoEncontrado = { id: docSnap.id, ...docSnap.data() };
                }
            }
        } catch (e) {
            console.warn("Firestore no disponible o error al consultar, usando datos del producto local:", e);
        }
    }

    // 3. Si no hay ID o no se encontró en ningún origen, mostrar el producto #1 por defecto
    if (!productoEncontrado) {
        productoEncontrado = productosLocales[0];
    }

    productoActual = productoEncontrado;
    renderizarDetalleProducto(productoActual);
}

/**
 * Dibuja los datos del producto en los elementos de producto.html
 */
function renderizarDetalleProducto(prod) {
    if (!prod) return;

    // Título y elementos informativos
    const tituloEl = document.getElementById('producto-nombre');
    const categoriaEl = document.getElementById('producto-categoria');
    const precioEl = document.getElementById('producto-precio');
    const descripcionEl = document.getElementById('producto-descripcion');
    const stockEl = document.getElementById('producto-stock');
    const imgPrincipal = document.getElementById('producto-imagen-principal');
    const caracteristicasUl = document.getElementById('producto-caracteristicas');

    if (tituloEl) tituloEl.textContent = prod.nombre || 'Producto';
    if (categoriaEl) categoriaEl.textContent = prod.categoria || 'General';
    if (precioEl) precioEl.textContent = `$ ${Number(prod.precio || 0).toLocaleString('es-UY')}`;
    if (descripcionEl) descripcionEl.textContent = prod.descripcion || 'Sin descripción disponible.';

    // Stock y disponibilidad
    const stockNum = parseInt(prod.stock, 10) || 0;
    const disponible = prod.disponibilidad !== false && stockNum > 0;

    if (stockEl) {
        if (disponible) {
            stockEl.className = 'badge text-bg-success-subtle text-success border border-success-subtle fs-6';
            stockEl.textContent = `En stock: ${stockNum} un.`;
        } else {
            stockEl.className = 'badge text-bg-danger-subtle text-danger border border-danger-subtle fs-6';
            stockEl.textContent = 'Agotado';
        }
    }

    // Imagen principal
    if (imgPrincipal) {
        imgPrincipal.src = prod.imagen || (Array.isArray(prod.imagenes) ? prod.imagenes[0] : IMAGEN_FALLBACK);
        imgPrincipal.onerror = () => { imgPrincipal.src = IMAGEN_FALLBACK; };
    }

    // Características
    if (caracteristicasUl) {
        const lista = Array.isArray(prod.caracteristicas) ? prod.caracteristicas : [];
        if (lista.length > 0) {
            caracteristicasUl.innerHTML = lista.map(item => `<li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>${item}</li>`).join('');
        } else {
            caracteristicasUl.innerHTML = '<li class="text-muted">Garantía oficial y soporte técnico incluido.</li>';
        }
    }

    // Configuración del botón "Agregar al Carrito"
    const btnAgregar = document.getElementById('btn-agregar-detalle');
    const inputCantidad = document.getElementById('input-cantidad-detalle');

    if (btnAgregar) {
        // Deshabilitar botón si el stock es 0
        if (!disponible) {
            btnAgregar.classList.add('disabled');
            btnAgregar.setAttribute('disabled', 'disabled');
        } else {
            btnAgregar.classList.remove('disabled');
            btnAgregar.removeAttribute('disabled');
        }

        btnAgregar.onclick = () => {
            const currentStock = parseInt(prod.stock, 10) || 0;
            
            // 1. Avisar inmediatamente si el producto está en stock 0
            if (prod.disponibilidad === false || currentStock <= 0) {
                mostrarToast('No hay stock disponible para este artículo.', 'error');
                return;
            }

            let cantidadDeseada = parseInt(inputCantidad?.value || 1, 10);
            if (isNaN(cantidadDeseada) || cantidadDeseada < 1) cantidadDeseada = 1;

            // 2. Verificar lo que ya se encuentra guardado en el carrito
            const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            const index = carrito.findIndex(item => String(item.id) === String(prod.id));
            const cantidadEnCarrito = index !== -1 ? (carrito[index].cantidad || 0) : 0;
            const cantidadTotalSolicitada = cantidadEnCarrito + cantidadDeseada;

            // 3. Bloquear si supera el límite de stock real
            if (cantidadTotalSolicitada > currentStock) {
                const disponibleRestante = Math.max(0, currentStock - cantidadEnCarrito);
                if (disponibleRestante === 0) {
                    mostrarToast(`Ya agregaste todo el stock disponible (${currentStock} un.) al carrito.`, 'error');
                } else {
                    mostrarToast(`Solo puedes agregar ${disponibleRestante} un. más. Stock total: ${currentStock} un.`, 'error');
                }
                return;
            }

            // 4. Agregar o actualizar en el almacenamiento local
            if (index !== -1) {
                carrito[index].cantidad = cantidadTotalSolicitada;
            } else {
                carrito.push({
                    id: String(prod.id),
                    nombre: prod.nombre,
                    categoria: prod.categoria,
                    precio: parseFloat(prod.precio),
                    imagen: prod.imagen || (Array.isArray(prod.imagenes) ? prod.imagenes[0] : IMAGEN_FALLBACK),
                    cantidad: cantidadDeseada
                });
            }

            localStorage.setItem('carrito', JSON.stringify(carrito));
            actualizarBadgeCarrito();
            mostrarToast(`"${prod.nombre}" (${cantidadDeseada} un.) se agregó al carrito.`);
        };
    }
}

/**
 * Descuenta el stock en Firestore y en la caché local tras confirmar una compra.
 * Llama a esta función al procesar el checkout con los items comprados.
 */
export async function descontarStockTrasCompra(itemsComprados) {
    if (!Array.isArray(itemsComprados) || itemsComprados.length === 0) return;

    // 1. Descuento en Firestore
    try {
        const firebaseModule = await import('./firebase/config.js');
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

        if (firebaseModule.db) {
            for (const item of itemsComprados) {
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
        console.warn("Fallo al actualizar stock en Firestore, aplicando descuento local:", e);
    }

    // 2. Descuento en catálogo local
    itemsComprados.forEach(item => {
        const prodLocal = productosLocales.find(p => String(p.id) === String(item.id));
        if (prodLocal) {
            const stockActual = parseInt(prodLocal.stock, 10) || 0;
            prodLocal.stock = Math.max(0, stockActual - (item.cantidad || 1));
            prodLocal.disponibilidad = prodLocal.stock > 0;
        }
    });

    // 3. Re-renderizar si el producto activo en pantalla fue el modificado
    if (productoActual) {
        const itemModificado = itemsComprados.find(i => String(i.id) === String(productoActual.id));
        if (itemModificado) {
            productoActual.stock = Math.max(0, (parseInt(productoActual.stock, 10) || 0) - (itemModificado.cantidad || 1));
            productoActual.disponibilidad = productoActual.stock > 0;
            renderizarDetalleProducto(productoActual);
        }
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    cargarProducto();
});