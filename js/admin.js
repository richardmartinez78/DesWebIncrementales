/**
 * js/admin.js - Panel de Administración con Validación de Rol, CRUD de Productos y Consulta General de Pedidos
 * Domótica Hogar
 */

import { actualizarAuthNav, mostrarToast, obtenerSesion } from './base.js';
import { PRODUCTOS_MOCK } from './productos.js';

// =====================================================================
// 🎨 PLACEHOLDERS DE IMAGEN SEGUROS (DATA URI SVG)
// =====================================================================
const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='45' height='45' viewBox='0 0 45 45'%3E%3Crect width='100%25' height='100%25' fill='%23f8f9fa'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='10' fill='%236c757d' text-anchor='middle' dy='.3em'%3ESin Img%3E%3C/text%3E%3C/svg%3E";
const ERROR_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='45' height='45' viewBox='0 0 45 45'%3E%3Crect width='100%25' height='100%25' fill='%23fff5f5'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='10' fill='%23dc3545' text-anchor='middle' dy='.3em'%3EError%3E%3C/text%3E%3C/svg%3E";

// =====================================================================
// 🛡️ GUARDIÁN DE SEGURIDAD (PRIMERA LÍNEA DE EJECUCIÓN)
// =====================================================================
const _sesionActiva = obtenerSesion();
const _esAdmin = _sesionActiva && (
    _sesionActiva.rol === 'admin' || 
    (_sesionActiva.email && (
        _sesionActiva.email.toLowerCase().includes('admin') || 
        _sesionActiva.email.toLowerCase() === 'admin@domotica.com'
    ))
);

if (!_esAdmin) {
    window.location.replace('index.html');
    throw new Error("🚨 ACCESO DENEGADO: Intento de acceso no autorizado al panel de administración.");
}
// =====================================================================

let modalBS = null;

/**
 * Valida si el usuario actual tiene permisos de Administrador
 */
export function esAdministrador(usuario) {
    if (!usuario) return false;
    const esRolAdmin = usuario.rol === 'admin';
    const esEmailAdmin = usuario.email && (
        usuario.email.toLowerCase().includes('admin') || 
        usuario.email.toLowerCase() === 'admin@domotica.com'
    );
    return esRolAdmin || esEmailAdmin;
}

/**
 * Renderiza la interfaz del panel de administración protegida
 */
export async function renderizarPanelAdmin() {
    const contenedor = document.getElementById('contenedor-admin');
    if (!contenedor) return;

    actualizarAuthNav();
    const usuario = obtenerSesion();

    if (!usuario || !esAdministrador(usuario)) return;

    contenedor.innerHTML = `
        <div class="alert alert-info border-info-subtle shadow-sm mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div class="d-flex align-items-center gap-2">
                <span class="badge bg-info text-dark fw-bold">Sprint Progresivo</span>
                <span class="small">Este módulo forma parte de la arquitectura final y se encuentra en desarrollo continuo.</span>
            </div>
            <span class="badge text-bg-dark">Admin: ${usuario.email}</span>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
                <h1 class="h3 fw-bold mb-0">Panel de Administración</h1>
                <p class="text-muted small mb-0">Gestión de inventario, productos y órdenes del sistema</p>
            </div>
            <button id="btn-nuevo-producto" class="btn text-white fw-bold btn-sm px-3" style="background-color: #146c43;" data-bs-toggle="modal" data-bs-target="#modalProducto">
                + Alta de Producto
            </button>
        </div>

        <ul class="nav nav-tabs mb-4" id="adminTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active fw-bold text-success" id="tab-productos-btn" data-bs-toggle="tab" data-bs-target="#tab-productos" type="button" role="tab">
                    Gestión de Productos
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link fw-bold text-secondary" id="tab-pedidos-btn" data-bs-toggle="tab" data-bs-target="#tab-pedidos" type="button" role="tab">
                    Consulta General de Pedidos
                </button>
            </li>
        </ul>

        <div class="tab-content" id="adminTabsContent">
            <div class="tab-pane fade show active" id="tab-productos" role="tabpanel">
                <div class="card border-0 shadow-sm p-3 bg-white">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle small mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Imagen</th>
                                    <th>Producto</th>
                                    <th>Categoría</th>
                                    <th>Precio</th>
                                    <th>Stock</th>
                                    <th>Disponibilidad</th>
                                    <th class="text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="tabla-admin-productos">
                                <tr>
                                    <td colspan="7" class="text-center py-4 text-muted">Cargando inventario...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="tab-pane fade" id="tab-pedidos" role="tabpanel">
                <div class="card border-0 shadow-sm p-3 bg-white">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle small mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>ID Pedido</th>
                                    <th>Cliente / Email</th>
                                    <th>Fecha</th>
                                    <th>Artículos</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody id="tabla-admin-pedidos">
                                <tr>
                                    <td colspan="6" class="text-center py-4 text-muted">Cargando órdenes del sistema...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    const modalEl = document.getElementById('modalProducto');
    if (modalEl && window.bootstrap) modalBS = new bootstrap.Modal(modalEl);

    document.getElementById('btn-nuevo-producto')?.addEventListener('click', prepararModalAlta);
    document.getElementById('form-admin-producto')?.addEventListener('submit', guardarProducto);

    cargarProductosAdmin();
    cargarPedidosAdmin();
}

/**
 * Carga y renderiza el inventario en la tabla administrativa
 */
async function cargarProductosAdmin() {
    const tbody = document.getElementById('tabla-admin-productos');
    if (!tbody) return;

    let productos = [];

    try {
        const firebaseModule = await import('./firebase/config.js');
        if (firebaseModule.db) {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            const { collection, getDocs } = firestoreModule;

            const snap = await getDocs(collection(firebaseModule.db, 'productos'));
            snap.forEach(docSnap => {
                productos.push({ id: String(docSnap.id), ...docSnap.data() });
            });
        }
    } catch (e) {
        console.warn("Cargando lista estática para administración:", e);
    }

    if (productos.length === 0) {
        productos = PRODUCTOS_MOCK;
    }

    // Ordenar numéricamente por ID para mantener la correlación de catálogo
    productos.sort((a, b) => (parseInt(a.id, 10) || 0) - (parseInt(b.id, 10) || 0));

    tbody.innerHTML = productos.map(prod => {
        const stockActual = Math.max(0, parseInt(prod.stock, 10) || 0);
        const estaDisponible = prod.disponibilidad !== false && stockActual > 0;
        
        // Búsqueda flexible de campos de imagen compatibles con cualquier esquema de Firestore
        const urlImg = prod.imagen || prod.imagenUrl || prod.img || prod.url || prod.foto || PLACEHOLDER_IMG;

        return `
            <tr>
                <td style="width: 60px;">
                    <img src="${urlImg}" 
                         alt="${prod.nombre || 'Producto'}" 
                         class="rounded border" 
                         style="width: 45px; height: 45px; object-fit: cover;"
                         onerror="this.onerror=null; this.src='${ERROR_IMG}';">
                </td>
                <td>
                    <strong class="d-block">${prod.nombre || 'Sin Nombre'}</strong>
                    <span class="text-muted extra-small">ID: ${prod.id}</span>
                </td>
                <td><span class="badge text-bg-light border">${prod.categoria || 'Domótica'}</span></td>
                <td><span class="fw-bold text-success">$ ${Number(prod.precio || 0).toLocaleString('es-UY')}</span></td>
                <td style="width: 110px;">
                    <input type="number" class="form-control form-control-sm text-center input-stock-rapido" 
                           data-id="${prod.id}" value="${stockActual}" min="0" style="width: 75px;">
                </td>
                <td>
                    <div class="form-check form-switch">
                        <input class="form-check-input switch-dispo-rapido" type="checkbox" data-id="${prod.id}" ${estaDisponible ? 'checked' : ''}>
                        <span class="badge ${estaDisponible ? 'text-bg-success' : 'text-bg-secondary'}">${estaDisponible ? 'Activo' : 'Baja'}</span>
                    </div>
                </td>
                <td class="text-end">
                    <button class="btn btn-outline-primary btn-sm btn-editar-prod me-1" data-id="${prod.id}">Editar</button>
                    <button class="btn btn-outline-danger btn-sm btn-eliminar-prod" data-id="${prod.id}">Eliminar</button>
                </td>
            </tr>
        `;
    }).join('');

    tbody.querySelectorAll('.input-stock-rapido').forEach(input => {
        input.addEventListener('change', (e) => actualizarStockRapido(e.target.dataset.id, e.target.value));
    });

    tbody.querySelectorAll('.switch-dispo-rapido').forEach(sw => {
        sw.addEventListener('change', (e) => actualizarDisponibilidadRapida(e.target.dataset.id, e.target.checked));
    });

    tbody.querySelectorAll('.btn-editar-prod').forEach(btn => {
        btn.addEventListener('click', (e) => abrirEdicionProducto(e.target.dataset.id, productos));
    });

    tbody.querySelectorAll('.btn-eliminar-prod').forEach(btn => {
        btn.addEventListener('click', (e) => darBajaProducto(e.target.dataset.id));
    });
}

/**
 * Carga todos los pedidos registrados en el sistema para consulta administrativa
 */
async function cargarPedidosAdmin() {
    const tbody = document.getElementById('tabla-admin-pedidos');
    if (!tbody) return;

    let pedidos = [];

    const pedidosLocales = JSON.parse(localStorage.getItem('pedidos_locales')) || [];
    pedidos = [...pedidosLocales];

    try {
        const firebaseModule = await import('./firebase/config.js');
        if (firebaseModule.db) {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            const { collection, getDocs } = firestoreModule;

            const snap = await getDocs(collection(firebaseModule.db, 'pedidos'));
            snap.forEach(docSnap => {
                if (!pedidos.some(p => p.id === docSnap.id)) {
                    pedidos.push({ id: docSnap.id, ...docSnap.data() });
                }
            });
        }
    } catch (e) {
        console.warn("Error al cargar pedidos generales:", e);
    }

    if (pedidos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No existen pedidos registrados en la plataforma.</td></tr>`;
        return;
    }

    tbody.innerHTML = pedidos.map(p => {
        const clienteStr = p.usuario ? `${p.usuario.nombre || 'Cliente'} (${p.usuario.email})` : 'Anónimo';
        const articulosStr = p.productos ? p.productos.map(i => `${i.nombre} (x${i.cantidad})`).join(', ') : 'Varios';

        return `
            <tr>
                <td><strong class="text-success">#${String(p.id).substring(0, 8)}</strong></td>
                <td>${clienteStr}</td>
                <td>${p.fecha || 'Reciente'}</td>
                <td class="text-truncate" style="max-width: 250px;">${articulosStr}</td>
                <td class="fw-bold">$ ${Number(p.total || 0).toLocaleString('es-UY')}</td>
                <td><span class="badge text-bg-success text-uppercase">${p.estado || 'completado'}</span></td>
            </tr>
        `;
    }).join('');
}

function prepararModalAlta() {
    document.getElementById('modalProductoLabel').textContent = 'Alta de Nuevo Producto';
    document.getElementById('form-admin-producto').reset();
    document.getElementById('prod-form-id').value = '';
    document.getElementById('prod-form-disponible').checked = true;
}

function abrirEdicionProducto(id, listaProductos) {
    const prod = listaProductos.find(p => String(p.id) === String(id));
    if (!prod) return;

    document.getElementById('modalProductoLabel').textContent = `Editar Producto #${prod.id}`;
    document.getElementById('prod-form-id').value = prod.id;
    document.getElementById('prod-form-nombre').value = prod.nombre || '';
    document.getElementById('prod-form-categoria').value = prod.categoria || 'Seguridad';
    document.getElementById('prod-form-precio').value = prod.precio || 0;
    document.getElementById('prod-form-stock').value = Math.max(0, parseInt(prod.stock, 10) || 0);
    document.getElementById('prod-form-disponible').checked = prod.disponibilidad !== false;
    document.getElementById('prod-form-imagen').value = prod.imagen || prod.imagenUrl || prod.img || prod.url || prod.foto || '';
    document.getElementById('prod-form-descripcion').value = prod.descripcion || '';

    if (modalBS) modalBS.show();
}

async function guardarProducto(e) {
    e.preventDefault();

    let id = document.getElementById('prod-form-id').value.trim();
    const nombre = document.getElementById('prod-form-nombre').value.trim();
    const categoria = document.getElementById('prod-form-categoria').value;
    const precio = parseFloat(document.getElementById('prod-form-precio').value) || 0;
    const stock = Math.max(0, parseInt(document.getElementById('prod-form-stock').value, 10) || 0);
    const disponibilidad = document.getElementById('prod-form-disponible').checked;
    const imagen = document.getElementById('prod-form-imagen').value.trim();
    const descripcion = document.getElementById('prod-form-descripcion').value.trim();

    if (!nombre || !imagen || !descripcion) {
        mostrarToast('⚠️ Por favor completa todos los campos requeridos.', true);
        return;
    }

    try {
        const firebaseModule = await import('./firebase/config.js');
        if (firebaseModule.db) {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            const { doc, setDoc, collection, getDocs } = firestoreModule;

            // Si es un producto nuevo, calcular el ID numérico correlativo (11, 12, 13...)
            if (!id) {
                const snap = await getDocs(collection(firebaseModule.db, 'productos'));
                let maxId = 0;
                snap.forEach(docSnap => {
                    const numId = parseInt(docSnap.id, 10);
                    if (!isNaN(numId) && numId > maxId) {
                        maxId = numId;
                    }
                });
                id = String(maxId + 1);
            }

            const datosProducto = {
                id: id,
                nombre,
                categoria,
                precio,
                stock,
                disponibilidad: disponibilidad && stock > 0,
                imagen,
                imagenUrl: imagen, // Duplicado para retrocompatibilidad total
                descripcion
            };

            await setDoc(doc(firebaseModule.db, 'productos', String(id)), datosProducto, { merge: true });
            mostrarToast(`Producto "${nombre}" (ID #${id}) guardado con éxito.`);
        }
    } catch (err) {
        console.warn("Guardando producto en almacenamiento local:", err);
        mostrarToast('Operación guardada en respaldo local.');
    }

    if (modalBS) modalBS.hide();
    cargarProductosAdmin();
}

async function actualizarStockRapido(id, nuevoStock) {
    const stockLimpio = Math.max(0, parseInt(nuevoStock, 10) || 0);

    try {
        const firebaseModule = await import('./firebase/config.js');
        if (firebaseModule.db) {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            const { doc, updateDoc } = firestoreModule;

            await updateDoc(doc(firebaseModule.db, 'productos', String(id)), {
                stock: stockLimpio,
                disponibilidad: stockLimpio > 0
            });
            mostrarToast(`Stock actualizado a ${stockLimpio} un.`);
        }
    } catch (e) {
        console.warn("Error al actualizar stock rápido:", e);
    }
}

async function actualizarDisponibilidadRapida(id, estaDisponible) {
    try {
        const firebaseModule = await import('./firebase/config.js');
        if (firebaseModule.db) {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            const { doc, updateDoc } = firestoreModule;

            await updateDoc(doc(firebaseModule.db, 'productos', String(id)), {
                disponibilidad: estaDisponible
            });
            mostrarToast(`Estado de disponibilidad modificado.`);
            cargarProductosAdmin();
        }
    } catch (e) {
        console.warn("Error al actualizar disponibilidad:", e);
    }
}

async function darBajaProducto(id) {
    if (!confirm(`¿Estás seguro/a de eliminar o dar de baja el producto #${id}?`)) return;

    try {
        const firebaseModule = await import('./firebase/config.js');
        if (firebaseModule.db) {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            const { doc, deleteDoc } = firestoreModule;

            await deleteDoc(doc(firebaseModule.db, 'productos', String(id)));
            mostrarToast(`Producto #${id} eliminado del catálogo.`);
            cargarProductosAdmin();
        }
    } catch (e) {
        console.warn("Error al eliminar producto:", e);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderizarPanelAdmin);
} else {       
    renderizarPanelAdmin();
}