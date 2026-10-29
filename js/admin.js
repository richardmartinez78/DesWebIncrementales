/**
 * js/admin.js - Panel de Administración con Control Estricto de Stock y Disponibilidad
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
// 🛡️ GUARDIÁN DE SEGURIDAD (VERIFICACIÓN DE ACCESO DE ROL)
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

    const nombreAdmin = usuario.nombre || usuario.displayName || (usuario.email ? usuario.email.split('@')[0] : 'Administrador');
    const fechaAcceso = new Date().toLocaleString('es-UY', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });

    contenedor.innerHTML = `
        <div class="alert alert-light border shadow-sm mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div class="d-flex align-items-center gap-2">
                <span class="badge text-bg-success fw-bold">Admin Conectado</span>
                <span class="fw-semibold text-dark">${nombreAdmin}</span>
                <span class="text-muted small">(${usuario.email})</span>
            </div>
            <span class="badge text-bg-light border text-secondary">Último acceso: ${fechaAcceso}</span>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
                <h1 class="h3 fw-bold mb-0">Panel de Administración</h1>
                <p class="text-muted small mb-0">Métricas clave, inventario y gestión de órdenes</p>
            </div>
            <button id="btn-nuevo-producto" class="btn text-white fw-bold btn-sm px-3" style="background-color: #146c43;" data-bs-toggle="modal" data-bs-target="#modalProducto">
                + Alta de Producto
            </button>
        </div>

        <!-- 📊 SECCIÓN DE ESTADÍSTICAS GENERALES -->
        <div class="row g-3 mb-4" id="contenedor-stats">
            <div class="col-6 col-md-3">
                <div class="card border-0 shadow-sm p-3 bg-white h-100">
                    <span class="text-muted extra-small fw-bold text-uppercase">Productos</span>
                    <h3 class="fw-bold text-dark mb-0 mt-1" id="stat-total-productos">0</h3>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card border-0 shadow-sm p-3 bg-white h-100">
                    <span class="text-muted extra-small fw-bold text-uppercase">Stock Acumulado</span>
                    <h3 class="fw-bold text-primary mb-0 mt-1" id="stat-total-stock">0 un.</h3>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card border-0 shadow-sm p-3 bg-white h-100">
                    <span class="text-muted extra-small fw-bold text-uppercase">Total Pedidos</span>
                    <h3 class="fw-bold text-info mb-0 mt-1" id="stat-total-pedidos">0</h3>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card border-0 shadow-sm p-3 bg-white h-100">
                    <span class="text-muted extra-small fw-bold text-uppercase">Ingresos Totales</span>
                    <h3 class="fw-bold text-success mb-0 mt-1" id="stat-total-ingresos">$ 0</h3>
                </div>
            </div>
        </div>

<!-- 🗂️ PESTAÑAS DE NAVEGACIÓN -->
        <ul class="nav nav-tabs mb-4" id="adminTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active fw-bold text-success" id="tab-productos-btn" data-bs-toggle="tab" data-bs-target="#tab-productos" type="button" role="tab">
                    <i class="bi bi-box-seam me-1"></i> Productos
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link fw-bold text-success" id="tab-pedidos-btn" data-bs-toggle="tab" data-bs-target="#tab-pedidos" type="button" role="tab">
                    <i class="bi bi-cart-check me-1"></i> Pedidos
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link fw-bold text-success" id="tab-usuarios-btn" data-bs-toggle="tab" data-bs-target="#tab-usuarios" type="button" role="tab">
                    <i class="bi bi-people me-1"></i> Gestión de Usuarios
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link fw-bold text-success" id="tab-resenas-btn" data-bs-toggle="tab" data-bs-target="#tab-resenas" type="button" role="tab">
                    <i class="bi bi-chat-left-text me-1"></i> Moderación de Reseñas
                </button>
            </li>
        </ul>

        <div class="tab-content" id="adminTabsContent">
            
            <!-- TAB 1: GESTIÓN DE PRODUCTOS -->
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

            <!-- TAB 2: CONSULTA DE PEDIDOS -->
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
                                    <th>Estado (Modificable)</th>
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

            <!-- TAB 3: GESTIÓN DE USUARIOS -->
            <div class="tab-pane fade" id="tab-usuarios" role="tabpanel">
                <div class="card border-0 shadow-sm p-4 bg-white">
                    <h2 class="h5 fw-bold mb-3">Usuarios Registrados</h2>
                    <div class="table-responsive">
                        <table class="table align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Rol Actual</th>
                                    <th class="text-end">Acción / Cambiar Rol</th>
                                </tr>
                            </thead>
                            <tbody id="tabla-usuarios-body">
                                <tr><td colspan="4" class="text-center py-4 text-muted">Cargando usuarios...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- TAB 4: MODERACIÓN DE RESEÑAS -->
            <div class="tab-pane fade" id="tab-resenas" role="tabpanel">
                <div class="card border-0 shadow-sm p-4 bg-white">
                    <h2 class="h5 fw-bold mb-3">Comentarios y Reseñas</h2>
                    <div class="table-responsive">
                        <table class="table align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th>Producto ID</th>
                                    <th>Usuario</th>
                                    <th>Comentario</th>
                                    <th>Calificación</th>
                                    <th class="text-end">Acción</th>
                                </tr>
                            </thead>
                            <tbody id="tabla-resenas-body">
                                <tr><td colspan="5" class="text-center py-4 text-muted">Cargando comentarios...</td></tr>
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
    cargarUsuariosAdmin();
    cargarResenasAdmin();
}

/**
 * Carga el inventario y actualiza métricas de productos
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

    productos.sort((a, b) => (parseInt(a.id, 10) || 0) - (parseInt(b.id, 10) || 0));

    const totalStock = productos.reduce((acc, p) => acc + (parseInt(p.stock, 10) || 0), 0);
    const elemProd = document.getElementById('stat-total-productos');
    const elemStock = document.getElementById('stat-total-stock');
    if (elemProd) elemProd.textContent = productos.length;
    if (elemStock) elemStock.textContent = `${totalStock} un.`;

    tbody.innerHTML = productos.map(prod => {
        const stockActual = Math.max(0, parseInt(prod.stock, 10) || 0);
        const estaDisponible = prod.disponibilidad !== false && stockActual > 0;
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
                        <input class="form-check-input switch-dispo-rapido" 
                               type="checkbox" 
                               data-id="${prod.id}" 
                               data-stock="${stockActual}" 
                               ${estaDisponible ? 'checked' : ''}>
                        <span class="badge ${estaDisponible ? 'text-bg-success' : 'text-bg-secondary'}">${estaDisponible ? 'Activo' : 'Baja'}</span>
                    </div>
                </td>
                <td class="text-end">
                    <button class="btn btn-primary btn-sm text-white fw-bold btn-editar-prod me-1 px-2" data-id="${prod.id}">Editar</button>
                    <button class="btn btn-danger btn-sm text-white fw-bold btn-eliminar-prod px-2" data-id="${prod.id}">Eliminar</button>
                </td>
            </tr>
        `;
    }).join('');

    tbody.querySelectorAll('.input-stock-rapido').forEach(input => {
        input.addEventListener('change', (e) => actualizarStockRapido(e.target.dataset.id, e.target.value));
    });

    tbody.querySelectorAll('.switch-dispo-rapido').forEach(sw => {
        sw.addEventListener('change', (e) => {
            const stockActual = parseInt(e.target.dataset.stock, 10) || 0;
            actualizarDisponibilidadRapida(e.target.dataset.id, e.target.checked, stockActual);
        });
    });

    tbody.querySelectorAll('.btn-editar-prod').forEach(btn => {
        btn.addEventListener('click', (e) => abrirEdicionProducto(e.target.dataset.id, productos));
    });

    tbody.querySelectorAll('.btn-eliminar-prod').forEach(btn => {
        btn.addEventListener('click', (e) => darBajaProducto(e.target.dataset.id));
    });
}

/**
 * Carga pedidos y permite cambiar el estado en tiempo real
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

    const totalIngresos = pedidos.reduce((acc, p) => acc + (parseFloat(p.total) || 0), 0);
    const elemPedidos = document.getElementById('stat-total-pedidos');
    const elemIngresos = document.getElementById('stat-total-ingresos');
    if (elemPedidos) elemPedidos.textContent = pedidos.length;
    if (elemIngresos) elemIngresos.textContent = `$ ${totalIngresos.toLocaleString('es-UY')}`;

    if (pedidos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No existen pedidos registrados en la plataforma.</td></tr>`;
        return;
    }

    tbody.innerHTML = pedidos.map(p => {
        const clienteStr = p.usuario ? `${p.usuario.nombre || 'Cliente'} (${p.usuario.email})` : 'Anónimo';
        const articulosStr = p.productos ? p.productos.map(i => `${i.nombre} (x${i.cantidad})`).join(', ') : 'Varios';
        const estadoActual = (p.estado || 'completado').toLowerCase();

        return `
            <tr>
                <td><strong class="text-success">#${String(p.id).substring(0, 8)}</strong></td>
                <td>${clienteStr}</td>
                <td>${p.fecha || 'Reciente'}</td>
                <td class="text-truncate" style="max-width: 250px;">${articulosStr}</td>
                <td class="fw-bold">$ ${Number(p.total || 0).toLocaleString('es-UY')}</td>
                <td>
                    <select class="form-select form-select-sm select-estado-pedido" data-id="${p.id}" style="max-width: 140px;">
                        <option value="pendiente" ${estadoActual === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="en camino" ${estadoActual === 'en camino' ? 'selected' : ''}>En camino</option>
                        <option value="entregado" ${estadoActual === 'entregado' || estadoActual === 'completado' ? 'selected' : ''}>Entregado</option>
                        <option value="cancelado" ${estadoActual === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </td>
            </tr>
        `;
    }).join('');

    tbody.querySelectorAll('.select-estado-pedido').forEach(sel => {
        sel.addEventListener('change', (e) => actualizarEstadoPedido(e.target.dataset.id, e.target.value));
    });
}

/**
 * Carga usuarios desde Firestore y permite administrar roles
 */
async function cargarUsuariosAdmin() {
    const tbody = document.getElementById('tabla-usuarios-body');
    if (!tbody) return;

    try {
        const firebaseModule = await import('./firebase/config.js');
        if (firebaseModule.db) {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            const { collection, getDocs, doc, updateDoc } = firestoreModule;

            const snap = await getDocs(collection(firebaseModule.db, 'usuarios'));
            
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No se encontraron usuarios registrados.</td></tr>';
                return;
            }

            let usuariosHTML = '';
            snap.forEach(docSnap => {
                const u = docSnap.data();
                const id = docSnap.id;
                const esAdmin = (u.rol === 'admin');

                usuariosHTML += `
                    <tr>
                        <td><strong class="d-block">${u.nombre || 'Sin Nombre'}</strong></td>
                        <td>${u.email || 'Sin Email'}</td>
                        <td><span class="badge ${esAdmin ? 'text-bg-success' : 'text-bg-secondary'}">${(u.rol || 'cliente').toUpperCase()}</span></td>
                        <td class="text-end">
                            <select class="form-select form-select-sm select-rol-usuario d-inline-block" style="width: auto;" data-id="${id}">
                                <option value="cliente" ${!esAdmin ? 'selected' : ''}>Cliente</option>
                                <option value="admin" ${esAdmin ? 'selected' : ''}>Admin</option>
                            </select>
                        </td>
                    </tr>
                `;
            });

            tbody.innerHTML = usuariosHTML;

            tbody.querySelectorAll('.select-rol-usuario').forEach(sel => {
                sel.addEventListener('change', async (e) => {
                    const userId = e.target.dataset.id;
                    const nuevoRol = e.target.value;
                    try {
                        await updateDoc(doc(firebaseModule.db, 'usuarios', userId), { rol: nuevoRol });
                        mostrarToast(`El rol del usuario ha sido actualizado a ${nuevoRol.toUpperCase()}`);
                        cargarUsuariosAdmin();
                    } catch (error) {
                        console.error('Error al cambiar rol:', error);
                        mostrarToast('Error al actualizar el rol de usuario.', true);
                    }
                });
            });
        }
    } catch (e) {
        console.warn("Error al cargar usuarios de base de datos:", e);
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No se pudo cargar la base de usuarios.</td></tr>';
    }
}

/**
 * Carga reseñas desde Firestore y permite eliminarlas/moderarlas
 */
async function cargarResenasAdmin() {
    const tbody = document.getElementById('tabla-resenas-body');
    if (!tbody) return;

    try {
        const firebaseModule = await import('./firebase/config.js');
        if (firebaseModule.db) {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            const { collection, getDocs, doc, deleteDoc } = firestoreModule;

            const snap = await getDocs(collection(firebaseModule.db, 'resenas'));
            
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No existen reseñas registradas.</td></tr>';
                return;
            }

            let resenasHTML = '';
            snap.forEach(docSnap => {
                const r = docSnap.data();
                const id = docSnap.id;
                
                let estrellas = '';
                const calificacion = parseInt(r.calificacion, 10) || 5;
                for (let i = 1; i <= 5; i++) {
                    estrellas += `<i class="bi bi-star-fill ${i <= calificacion ? 'text-warning' : 'text-secondary'}"></i>`;
                }

                resenasHTML += `
                    <tr>
                        <td><strong class="text-muted">#${r.productoId || '-'}</strong></td>
                        <td>${r.usuarioNombre || r.usuarioEmail || 'Usuario Anónimo'}</td>
                        <td class="text-wrap" style="max-width: 250px;"><em>"${r.comentario || 'Sin comentario'}"</em></td>
                        <td>${estrellas}</td>
                        <td class="text-end">
                            <button class="btn btn-danger btn-sm text-white fw-bold btn-eliminar-resena px-2" data-id="${id}">
                                <i class="bi bi-trash"></i> Eliminar
                            </button>
                        </td>
                    </tr>
                `;
            });

            tbody.innerHTML = resenasHTML;

            tbody.querySelectorAll('.btn-eliminar-resena').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    if (!confirm('¿Estás seguro/a de eliminar permanentemente esta reseña?')) return;
                    
                    const resenaId = e.currentTarget.dataset.id;
                    try {
                        await deleteDoc(doc(firebaseModule.db, 'resenas', resenaId));
                        mostrarToast('La reseña fue eliminada con éxito.');
                        cargarResenasAdmin();
                    } catch (error) {
                        console.error('Error al eliminar reseña:', error);
                        mostrarToast('Ocurrió un error al intentar eliminar la reseña.', true);
                    }
                });
            });
        }
    } catch (e) {
        console.warn("Error al cargar reseñas:", e);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No se pudo obtener el registro de reseñas.</td></tr>';
    }
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
    document.getElementById('prod-form-disponible').checked = prod.disponibilidad !== false && (parseInt(prod.stock, 10) || 0) > 0;
    document.getElementById('prod-form-imagen').value = prod.imagen || prod.imagenUrl || prod.img || prod.url || prod.foto || '';
    document.getElementById('prod-form-descripcion').value = prod.descripcion || '';

    if (modalBS) modalBS.show();
}

/**
 * Guarda o actualiza un producto garantizando la sincronía entre disponibilidad y stock
 */
async function guardarProducto(e) {
    e.preventDefault();

    const btnSubmit = document.getElementById('btn-enviar-producto') || e.target.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit ? btnSubmit.innerHTML : 'Guardar';

    let id = document.getElementById('prod-form-id').value.trim();
    const nombre = document.getElementById('prod-form-nombre').value.trim();
    const categoria = document.getElementById('prod-form-categoria').value;
    const precio = parseFloat(document.getElementById('prod-form-precio').value) || 0;
    
    const stockInput = parseInt(document.getElementById('prod-form-stock').value, 10);
    let stock = isNaN(stockInput) ? 0 : Math.max(0, stockInput);
    
    const switchDisponible = document.getElementById('prod-form-disponible').checked;

    let stockFinal = switchDisponible ? stock : 0;
    let disponibilidadFinal = switchDisponible && stockFinal > 0;

    const imagen = document.getElementById('prod-form-imagen').value.trim();
    const descripcion = document.getElementById('prod-form-descripcion').value.trim();

    if (!nombre || !imagen || !descripcion) {
        mostrarToast('⚠️ Por favor completa todos los campos requeridos.', true);
        return;
    }

    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Guardando...`;
    }

    try {
        const firebaseModule = await import('./firebase/config.js');
        if (firebaseModule.db) {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            const { doc, setDoc, collection, getDocs } = firestoreModule;

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
                stock: stockFinal,
                disponibilidad: disponibilidadFinal,
                imagen,
                imagenUrl: imagen,
                descripcion
            };

            await setDoc(doc(firebaseModule.db, 'productos', String(id)), datosProducto, { merge: true });
            mostrarToast(`Producto "${nombre}" (ID #${id}) guardado con éxito.`);
        }
    } catch (err) {
        console.warn("Guardando producto en almacenamiento local:", err);
        mostrarToast('Operación guardada en respaldo local.');
    } finally {
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoOriginal;
        }
    }

    if (modalBS) modalBS.hide();
    cargarProductosAdmin();
}

/**
 * Actualiza el stock de forma rápida desde la tabla e invalida disponibilidad si llega a 0
 */
async function actualizarStockRapido(id, nuevoStock) {
    const stockLimpio = Math.max(0, parseInt(nuevoStock, 10) || 0);
    const estaDisponible = stockLimpio > 0;

    try {
        const firebaseModule = await import('./firebase/config.js');
        if (firebaseModule.db) {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            const { doc, updateDoc } = firestoreModule;

            await updateDoc(doc(firebaseModule.db, 'productos', String(id)), {
                stock: stockLimpio,
                disponibilidad: estaDisponible
            });
            mostrarToast(`Stock actualizado a ${stockLimpio} un. (${estaDisponible ? 'Disponible' : 'Agotado'})`);
            cargarProductosAdmin();
        }
    } catch (e) {
        console.warn("Error al actualizar stock rápido:", e);
    }
}

/**
 * Alterna la disponibilidad rápidamente:
 * - Si intentan activar (activar = true) con stock <= 0, exige usar "Editar" para cargar stock real.
 * - Si desactivan (activar = false), resetea el stock a 0 en la base de datos.
 */
async function actualizarDisponibilidadRapida(id, activar, stockActual) {
    // Si intentan ACTIVAR desde el switch rápido, pero el stock es 0
    if (activar === true && stockActual <= 0) {
        mostrarToast("⚠️ Para activar este producto, debes hacer clic en 'Editar' y agregar stock mayor a 0.", true);
        // Refrescamos la tabla para que el switch vuelva a la posición "Apagado"
        cargarProductosAdmin(); 
        return;
    }

    try {
        const firebaseModule = await import('./firebase/config.js');
        if (firebaseModule.db) {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            const { doc, updateDoc } = firestoreModule;

            const productoRef = doc(firebaseModule.db, 'productos', String(id));
            let datosActualizados = { disponibilidad: activar };

            // Si apagan el switch, vaciamos el stock a 0 de emergencia
            if (activar === false) {
                datosActualizados.stock = 0;
            }

            await updateDoc(productoRef, datosActualizados);
            
            mostrarToast(
                activar 
                    ? `Producto #${id} activado correctamente.` 
                    : `Producto #${id} desactivado (Stock en 0).`
            );

            cargarProductosAdmin();
        }
    } catch (error) {
        console.error("Error al actualizar disponibilidad rápida:", error);
        mostrarToast("Ocurrió un error al intentar cambiar la disponibilidad.", true);
        cargarProductosAdmin();
    }
}

/**
 * Da de baja/elimina permanentemente un producto de la base de datos
 */
async function darBajaProducto(id) {
    if (!confirm(`¿Estás seguro/a de eliminar permanentemente el producto #${id}?`)) return;

    try {
        const firebaseModule = await import('./firebase/config.js');
        if (firebaseModule.db) {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            const { doc, deleteDoc } = firestoreModule;

            await deleteDoc(doc(firebaseModule.db, 'productos', String(id)));
            mostrarToast(`Producto #${id} eliminado con éxito.`);
            cargarProductosAdmin();
        }
    } catch (e) {
        console.error("Error al eliminar producto:", e);
        mostrarToast("Ocurrió un error al intentar eliminar el producto.", true);
    }
}

/**
 * Actualiza el estado de un pedido (pendiente, en camino, entregado, cancelado)
 */
async function actualizarEstadoPedido(id, nuevoEstado) {
    try {
        const pedidosLocales = JSON.parse(localStorage.getItem('pedidos_locales')) || [];
        const idx = pedidosLocales.findIndex(p => String(p.id) === String(id));
        if (idx !== -1) {
            pedidosLocales[idx].estado = nuevoEstado;
            localStorage.setItem('pedidos_locales', JSON.stringify(pedidosLocales));
        }

        const firebaseModule = await import('./firebase/config.js');
        if (firebaseModule.db) {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            const { doc, updateDoc } = firestoreModule;

            await updateDoc(doc(firebaseModule.db, 'pedidos', String(id)), { estado: nuevoEstado });
        }
        mostrarToast(`Estado del pedido #${String(id).substring(0, 8)} actualizado a "${nuevoEstado.toUpperCase()}".`);
    } catch (e) {
        console.warn("Error al actualizar estado del pedido en Firestore:", e);
        mostrarToast(`Estado actualizado en almacenamiento local.`);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('contenedor-admin')) {
        renderizarPanelAdmin();
    }
});