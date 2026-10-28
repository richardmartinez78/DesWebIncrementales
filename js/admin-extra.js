/**
 * js/admin-extra.js - Módulo de Gestión de Usuarios y Moderación de Reseñas
 * Domótica Hogar
 */

import { mostrarToast } from './base.js';

// -------------------------------------------------------------
// 1. GESTIÓN DE USUARIOS (Cambio de Roles)
// -------------------------------------------------------------
export async function cargarUsuariosAdmin() {
    const tbody = document.getElementById('tabla-usuarios-body');
    if (!tbody) return;

    try {
        const firebaseModule = await import('./firebase/config.js');
        if (!firebaseModule.db) throw new Error("Firestore no inicializado");

        const { collection, getDocs, doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        const querySnapshot = await getDocs(collection(firebaseModule.db, 'usuarios'));

        if (querySnapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay usuarios registrados.</td></tr>';
            return;
        }

        tbody.innerHTML = querySnapshot.docs.map(docSnap => {
            const u = docSnap.data();
            const uid = docSnap.id;
            const esAdmin = u.rol === 'admin';

            return `
                <tr>
                    <td><strong>${u.nombre || 'Sin nombre'}</strong></td>
                    <td>${u.email}</td>
                    <td>
                        <span class="badge ${esAdmin ? 'bg-danger' : 'bg-primary'}">
                            ${u.rol || 'cliente'}
                        </span>
                    </td>
                    <td class="text-end">
                        <button class="btn btn-sm ${esAdmin ? 'btn-outline-secondary' : 'btn-outline-danger'} btn-cambiar-rol" 
                                data-uid="${uid}" 
                                data-nuevo-rol="${esAdmin ? 'cliente' : 'admin'}">
                            Cambiar a ${esAdmin ? 'Cliente' : 'Administrador'}
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Eventos para cambiar rol
        document.querySelectorAll('.btn-cambiar-rol').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const uid = e.currentTarget.dataset.uid;
                const nuevoRol = e.currentTarget.dataset.nuevoRol;

                try {
                    await updateDoc(doc(firebaseModule.db, 'usuarios', uid), { rol: nuevoRol });
                    mostrarToast(`Rol actualizado a ${nuevoRol} con éxito.`);
                    cargarUsuariosAdmin();
                } catch (err) {
                    console.error("Error al actualizar rol:", err);
                    mostrarToast("Error al actualizar el rol.", true);
                }
            });
        });

    } catch (e) {
        console.warn("Cargando usuarios desde almacenamiento local fallback.");
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Gestión disponible con conexión a Firestore.</td></tr>';
    }
}

// -------------------------------------------------------------
// 2. MODERACIÓN DE RESEÑAS / COMENTARIOS
// -------------------------------------------------------------
export async function cargarResenasAdmin() {
    const tbody = document.getElementById('tabla-resenas-body');
    if (!tbody) return;

    try {
        const firebaseModule = await import('./firebase/config.js');
        if (!firebaseModule.db) throw new Error("Firestore no inicializado");

        const { collection, getDocs, doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        const querySnapshot = await getDocs(collection(firebaseModule.db, 'comentarios'));

        if (querySnapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay comentarios para moderar.</td></tr>';
            return;
        }

        tbody.innerHTML = querySnapshot.docs.map(docSnap => {
            const res = docSnap.data();
            const id = docSnap.id;

            return `
                <tr>
                    <td><small class="text-muted">${res.productoId || 'N/A'}</small></td>
                    <td><strong>${res.usuarioNombre || res.usuarioEmail || 'Anónimo'}</strong></td>
                    <td>${res.comentario || ''}</td>
                    <td><span class="text-warning">★ ${res.puntuacion || 5}/5</span></td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-danger btn-eliminar-resena" data-id="${id}">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Eventos para borrar reseñas inapropiadas
        document.querySelectorAll('.btn-eliminar-resena').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                if (!confirm("¿Deseas eliminar este comentario?")) return;

                try {
                    await deleteDoc(doc(firebaseModule.db, 'comentarios', id));
                    mostrarToast("Comentario eliminado correctamente.");
                    cargarResenasAdmin();
                } catch (err) {
                    console.error("Error al eliminar comentario:", err);
                    mostrarToast("Error al eliminar comentario.", true);
                }
            });
        });

    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Sin comentarios guardados.</td></tr>';
    }
}

// Inicialización de escuchadores cuando cambian de pestaña
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('usuarios-tab')?.addEventListener('click', cargarUsuariosAdmin);
    document.getElementById('resenas-tab')?.addEventListener('click', cargarResenasAdmin);
});