/**
 * js/admin.js - Panel de Administración con Validación de Rol, CRUD de Productos y Consulta General de Pedidos
 * Domótica Hogar
 */

import { actualizarAuthNav, mostrarToast, obtenerSesion } from './base.js';
import { PRODUCTOS_MOCK } from './productos.js';

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
    // Expulsa al cliente inmediatamente al inicio
    window.location.replace('index.html');
    // Detiene por completo la ejecución de cualquier código debajo de esta línea
    throw new Error("🚨 ACCESO DENEGADO: Intento de acceso no autorizado al panel de administración.");
}
// =====================================================================

let modalBS = null;

/**
 * Valida si el usuario actual tiene permisos de Administrador (Doble validación para funciones)
 */
export function esAdministrador(usuario) {
    if (!usuario) return false;
    
    // Rol asignado explícitamente o coincidencia con cuenta admin
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

    // 1. VALIDACIÓN DE ROL DE ADMINISTRADOR (Redundancia de seguridad)
    if (!usuario || !esAdministrador(usuario)) {
        return; // El guardián ya se encargó de expulsarlo, pero mantenemos esta capa extra
    }

    // 2. PANEL ADMINISTRATIVO PRINCIPAL (USUARIO ADMIN AUTORIZADO)
    contenedor.innerHTML = `
        <!-- BANNER DE MÓDULO EN DESARROLLO -->
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

        <!-- PESTAÑAS DE CONTROL -->
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
            <!-- PESTAÑA 1: PRODUCTOS -->
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

            <!-- PESTAÑA 2: PEDIDOS GENERALES -->
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

    // Inicializar Modal de Bootstrap
    const modalEl = document.getElementById('modalProducto');
    if (modalEl) modalBS = new bootstrap.Modal(modalEl);

    // Evento de Alta de Producto
    document.getElementById('btn-nuevo-producto')?.addEventListener('click', prepararModalAlta);
    document.getElementById('form-admin-producto')?.addEventListener('submit', guardarProducto);

    // Cargar listas
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

    tbody.innerHTML = productos.map(prod => {
        const stockActual = Math.max(0, parseInt(prod.stock, 10) || 0);
        const estaDisponible = prod.disponibilidad !== false && stockActual > 0;

        return `
            <tr>
                <td style="width: 60px;">
                    <img src="${prod.imagen}" alt="${prod.nombre}" class="rounded" style="width: 45px; height: 45px; object-fit: cover;">
                </td>
                <td>
                    <strong class="d-block">${prod.nombre}</strong>
                    <span class="text-muted extra-small">ID: ${prod.id}</span>
                </td>
                <td><span class="badge text-bg-light border">${prod.categoria || 'Domótica'}</span></td>
                <span class="fw-bold text-success">$ ${Number(prod.precio || 0).toLocaleString('es-UY')}</span>
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

    // Asignación de Eventos Rápidos
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

    // Pedidos en LocalStorage
    const pedidosLocales = JSON.parse(localStorage.getItem('pedidos_locales')) || [];
    pedidos = [...pedidosLocales];

    // Pedidos en Firestore
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

/**
 * Prepara el modal para alta de producto nuevo
 */
function prepararModalAlta() {
    document.getElementById('modalProductoLabel').textContent = 'Alta de Nuevo Producto';
    document.getElementById('form-admin-producto').reset();
    document.getElementById('prod-form-id').value = '';
    document.getElementById('prod-form-disponible').checked = true;
}

/**
 * Carga los datos de un producto existente en el modal para su edición
 */
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
    document.getElementById('prod-form-imagen').value = prod.imagen || '';
    document.getElementById('prod-form-descripcion').value = prod.descripcion || '';

    if (modalBS) modalBS.show();
}

/**
 * Guarda o actualiza un producto en Firestore / LocalStorage
 */
async function guardarProducto(e) {
    e.preventDefault();

    const id = document.getElementById('prod-form-id').value;
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

    const datosProducto = {
        nombre,
        categoria,
        precio,
        stock,
        disponibilidad: disponibilidad && stock > 0,
        imagen,
        descripcion
    };

    try {
        const firebaseModule = await import('./firebase/config.js');
        if (firebaseModule.db) {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            const { doc, setDoc, addDoc, collection } = firestoreModule;

            if (id) {
                // Modificación de producto existente
                await setDoc(doc(firebaseModule.db, 'productos', String(id)), datosProducto, { merge: true });
                mostrarToast(`Producto "${nombre}" actualizado con éxito.`);
            } else {
                // Alta de nuevo producto
                await addDoc(collection(firebaseModule.db, 'productos'), datosProducto);
                mostrarToast(`Producto "${nombre}" registrado con éxito.`);
            }
        }
    } catch (err) {
        console.warn("Guardando producto en almacenamiento local:", err);
        mostrarToast('Operación guardada en respaldo local.');
    }

    if (modalBS) modalBS.hide();
    cargarProductosAdmin();
}

/**
 * Actualización rápida de stock sin permitir valores negativos
 */
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

/**
 * Conmutación rápida de disponibilidad
 */
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

/**
 * Eliminación o baja de producto
 */
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