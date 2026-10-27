/**
 * js/perfil.js - Renderizado dinámico del perfil de usuario y formularios de Auth
 * Domótica Hogar
 */

import { obtenerSesion, mostrarToast, actualizarAuthNav } from './base.js';

export async function renderizarPerfil() {
    const contenedor = document.getElementById('contenedor-perfil');
    if (!contenedor) return;

    const usuario = obtenerSesion();

    if (!usuario) {
        // -----------------------------------------------------------------
        // VISTA PARA USUARIOS NO AUTENTICADOS (LOGIN / REGISTRO)
        // -----------------------------------------------------------------
        contenedor.innerHTML = `
            <div class="row g-4 justify-content-center">
                <!-- FORMULARIO DE INICIO DE SESIÓN -->
                <div class="col-12 col-md-6 col-lg-5">
                    <div class="card border-0 shadow-sm p-4 bg-white h-100">
                        <h2 class="h4 fw-bold text-dark mb-3">Iniciar Sesión</h2>
                        <form id="form-login">
                            <div class="mb-3">
                                <label for="login-email" class="form-label small fw-bold">Correo Electrónico</label>
                                <input type="email" class="form-control" id="login-email" required placeholder="nombre@ejemplo.com">
                            </div>
                            <div class="mb-3">
                                <label for="login-password" class="form-label small fw-bold">Contraseña</label>
                                <input type="password" class="form-control" id="login-password" required placeholder="••••••••">
                            </div>
                            <button type="submit" class="btn btn-success w-100 fw-bold py-2 shadow-sm">Ingresar</button>
                        </form>
                    </div>
                </div>

                <!-- FORMULARIO DE REGISTRO CON CONFIRMACIÓN DE CONTRASEÑA Y TÉRMINOS -->
                <div class="col-12 col-md-6 col-lg-5">
                    <div class="card border-0 shadow-sm p-4 bg-white h-100">
                        <h2 class="h4 fw-bold text-dark mb-3">Crear Cuenta</h2>
                        <form id="form-registro">
                            <div class="mb-3">
                                <label for="registro-nombre" class="form-label small fw-bold">Nombre Completo</label>
                                <input type="text" class="form-control" id="registro-nombre" required placeholder="Ej: Juan Pérez">
                            </div>
                            <div class="mb-3">
                                <label for="registro-email" class="form-label small fw-bold">Correo Electrónico</label>
                                <input type="email" class="form-control" id="registro-email" required placeholder="nombre@ejemplo.com">
                            </div>
                            <div class="mb-3">
                                <label for="registro-password" class="form-label small fw-bold">Contraseña</label>
                                <input type="password" class="form-control" id="registro-password" required placeholder="Mínimo 6 caracteres" minlength="6">
                            </div>
                            <div class="mb-3">
                                <label for="registro-confirm" class="form-label small fw-bold">Repetir Contraseña</label>
                                <input type="password" class="form-control" id="registro-confirm" required placeholder="Repite tu contraseña" minlength="6">
                            </div>

                            <!-- CHECKBOX OBLIGATORIO DE TÉRMINOS Y CONDICIONES -->
                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" id="reg-terminos" required>
                                <label class="form-check-label small text-secondary" for="reg-terminos">
                                    Acepto los <a href="terminos.html" target="_blank" class="text-success fw-bold">Términos y Condiciones</a>
                                </label>
                            </div>

                            <button type="submit" class="btn btn-outline-success w-100 fw-bold py-2">Crear Cuenta</button>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Vincular inmediatamente los eventos del formulario renderizado
        const authModule = await import('./auth.js');
        if (authModule.inicializarEventosAuth) {
            authModule.inicializarEventosAuth();
        }
        return;
    }

    // -----------------------------------------------------------------
    // VISTA PARA USUARIOS CON SESIÓN ACTIVA
    // -----------------------------------------------------------------
    const esAdmin = usuario.rol === 'admin' || usuario.rol === 'administrador';
    const pedidosLocales = JSON.parse(localStorage.getItem('pedidos_locales')) || [];

    contenedor.innerHTML = `
        <div class="row g-4">
            <!-- TARJETA DE DATOS DEL USUARIO -->
            <div class="col-12 col-lg-4">
                <div class="card border-0 shadow-sm p-4 bg-white h-100">
                    <div class="text-center mb-3">
                        <div class="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center fw-bold fs-3 mb-2" style="width: 70px; height: 70px;">
                            ${(usuario.nombre || usuario.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <h2 class="h5 fw-bold text-dark mb-0">${usuario.nombre || 'Usuario'}</h2>
                        <span class="badge ${esAdmin ? 'text-bg-success' : 'text-bg-secondary'} mt-2">
                            ${esAdmin ? 'Administrador' : 'Cliente'}
                        </span>
                    </div>

                    <hr>

                    <div class="small">
                        <p class="mb-2"><strong>Correo:</strong> <span class="text-muted">${usuario.email}</span></p>
                        <p class="mb-2"><strong>ID de Usuario:</strong> <span class="text-muted extra-small">${usuario.uid}</span></p>
                        <p class="mb-0"><strong>Rol en Sistema:</strong> <span class="text-muted">${usuario.rol || 'cliente'}</span></p>
                    </div>

                    <div class="mt-4 pt-2">
                        <button id="btn-cerrar-sesion-perfil" class="btn btn-danger w-100 fw-bold shadow-sm">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>

            <!-- SECCIÓN DE PEDIDOS E HISTORIAL -->
            <div class="col-12 col-lg-8">
                <div class="card border-0 shadow-sm p-4 bg-white h-100">
                    <h3 class="h5 fw-bold text-dark mb-3">Historial de Compras</h3>
                    
                    ${pedidosLocales.length === 0 ? `
                        <div class="alert alert-light border text-center py-4 my-auto">
                            <p class="text-muted mb-2">No has realizado compras aún.</p>
                            <a href="catalogo.html" class="btn btn-success btn-sm fw-bold">Explorar Catálogo</a>
                        </div>
                    ` : `
                        <div class="table-responsive">
                            <table class="table table-hover align-middle small mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>ID Pedido</th>
                                        <th>Fecha</th>
                                        <th>Artículos</th>
                                        <th>Total</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${pedidosLocales.map(p => `
                                        <tr>
                                            <td><strong class="text-success">#${String(p.id).substring(0, 8)}</strong></td>
                                            <td>${p.fecha || 'Reciente'}</td>
                                            <td>${p.productos ? p.productos.map(i => `${i.nombre} (x${i.cantidad})`).join(', ') : 'Varios'}</td>
                                            <td class="fw-bold">$ ${Number(p.total || 0).toLocaleString('es-UY')}</td>
                                            <td><span class="badge text-bg-success">${p.estado || 'Entregado'}</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-cerrar-sesion-perfil')?.addEventListener('click', () => {
        localStorage.removeItem('usuario');
        actualizarAuthNav();
        renderizarPerfil();
        mostrarToast('Sesión cerrada correctamente.');
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderizarPerfil);
} else {
    renderizarPerfil();
}