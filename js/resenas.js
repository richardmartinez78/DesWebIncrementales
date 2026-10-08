/**
 * js/resenas.js - Módulo de opiniones y valoraciones verificado con guardado instantáneo
 * Domótica Hogar
 */

import { mostrarToast, obtenerSesion } from './base.js';

/**
 * Compara dos IDs ignorando prefijos como "prod-" y mayúsculas/minúsculas
 */
function idsCoinciden(id1, id2) {
    if (!id1 || !id2) return false;
    const s1 = String(id1).trim().toLowerCase().replace(/^prod-/, '');
    const s2 = String(id2).trim().toLowerCase().replace(/^prod-/, '');
    return s1 === s2;
}

/**
 * Comprueba si el usuario autenticado tiene una compra registrada del producto
 */
export async function haCompradoProducto(usuario, productoId) {
    if (!usuario || (!usuario.email && !usuario.uid)) return false;

    const emailUsuario = usuario.email ? usuario.email.toLowerCase().trim() : '';
    const uidUsuario = usuario.uid ? String(usuario.uid) : '';

    // 1. Verificación instantánea en LocalStorage
    const pedidosLocales = JSON.parse(localStorage.getItem('pedidos_locales')) || [];
    const compradoEnLocal = pedidosLocales.some(pedido => {
        if (!pedido || !pedido.usuario) return false;
        const matchEmail = pedido.usuario.email && (pedido.usuario.email.toLowerCase().trim() === emailUsuario);
        const matchUid = pedido.usuario.uid && (String(pedido.usuario.uid) === uidUsuario);

        if (matchEmail || matchUid) {
            return (pedido.productos || []).some(prod => idsCoinciden(prod.id, productoId));
        }
        return false;
    });

    if (compradoEnLocal) return true;

    // 2. Verificación en Firestore (con timeout de 1s)
    try {
        const firebaseModule = await import('./firebase/config.js');
        if (firebaseModule.db && usuario.email) {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            const { collection, query, where, getDocs } = firestoreModule;

            const q = query(
                collection(firebaseModule.db, 'pedidos'),
                where('usuario.email', '==', usuario.email)
            );

            const promesa = getDocs(q);
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1000));
            const snap = await Promise.race([promesa, timeout]);

            let encontrado = false;
            snap.forEach(docSnap => {
                const data = docSnap.data();
                if (data && data.productos) {
                    if (data.productos.some(prod => idsCoinciden(prod.id, productoId))) {
                        encontrado = true;
                    }
                }
            });

            return encontrado;
        }
    } catch (e) {
        console.warn("Verificación de compra completada mediante historial local.");
    }

    return false;
}

/**
 * Consulta las opiniones de un producto unificando LocalStorage y Firestore
 */
export async function obtenerResenasProducto(productoId) {
    if (!productoId) return [];

    let resenas = [];

    // 1. Obtener reseñas guardadas localmente
    const resenasLocales = JSON.parse(localStorage.getItem('resenas_locales')) || [];
    const localesDelProducto = resenasLocales.filter(r => idsCoinciden(r.productoId, productoId));
    resenas = [...localesDelProducto];

    // 2. Obtener reseñas de Firestore (ordenadas localmente para evitar errores de índice)
    try {
        const firebaseModule = await import('./firebase/config.js');
        if (firebaseModule.db) {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            const { collection, query, where, getDocs } = firestoreModule;

            const q = query(
                collection(firebaseModule.db, 'resenas'),
                where('productoId', '==', String(productoId))
            );

            const promesa = getDocs(q);
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1000));
            const snap = await Promise.race([promesa, timeout]);

            snap.forEach(docSnap => {
                const data = docSnap.data();
                const yaExiste = resenas.some(r => 
                    (r.id && r.id === docSnap.id) || 
                    (r.usuario?.email === data.usuario?.email && r.comentario === data.comentario)
                );
                if (!yaExiste) {
                    resenas.push({ id: docSnap.id, ...data });
                }
            });
        }
    } catch (e) {
        console.warn("Recuperación de opiniones utilizando respaldo local.");
    }

    // Ordenar por fecha más reciente
    resenas.sort((a, b) => new Date(b.fechaIso || 0) - new Date(a.fechaIso || 0));

    return resenas;
}

/**
 * Valida la entrada del usuario
 */
export function validarEntradaResena(calificacion, comentario) {
    const calificacionNum = parseInt(calificacion, 10);

    if (isNaN(calificacionNum) || calificacionNum < 1 || calificacionNum > 5) {
        return { valido: false, mensaje: '⚠️ Selecciona una puntuación entre 1 y 5 estrellas.' };
    }

    const comentarioLimpio = String(comentario || '').trim();

    if (!comentarioLimpio) {
        return { valido: false, mensaje: '⚠️ Por favor escribe tu opinión.' };
    }

    if (comentarioLimpio.length < 3) {
        return { valido: false, mensaje: '⚠️ La opinión debe contener al menos 3 caracteres.' };
    }

    if (comentarioLimpio.length > 500) {
        return { valido: false, mensaje: '⚠️ La opinión no puede superar los 500 caracteres.' };
    }

    return { valido: true, calificacionNum, comentarioLimpio };
}

/**
 * Publica y registra una nueva reseña
 */
export async function agregarResena(productoId, calificacion, comentario) {
    const usuario = obtenerSesion();

    if (!usuario || (!usuario.email && !usuario.uid)) {
        mostrarToast('⚠️ Debes iniciar sesión para publicar una valoración.', true);
        return false;
    }

    const validacion = validarEntradaResena(calificacion, comentario);
    if (!validacion.valido) {
        mostrarToast(validacion.mensaje, true);
        return false;
    }

    const comprado = await haCompradoProducto(usuario, productoId);
    if (!comprado) {
        mostrarToast('⚠️ Debes realizar una compra de este producto para poder calificarlo.', true);
        return false;
    }

    const prodIdStr = String(productoId);
    const emailUsuario = usuario.email.toLowerCase().trim();

    const nuevaResena = {
        productoId: prodIdStr,
        usuario: {
            uid: usuario.uid || `uid-${Date.now()}`,
            nombre: usuario.nombre || emailUsuario.split('@')[0],
            email: emailUsuario
        },
        calificacion: validacion.calificacionNum,
        comentario: validacion.comentarioLimpio,
        fecha: new Date().toLocaleDateString('es-UY', { year: 'numeric', month: 'long', day: 'numeric' }),
        fechaIso: new Date().toISOString()
    };

    // 1. Guardado inmediato e incondicional en LocalStorage
    let resenasLocales = JSON.parse(localStorage.getItem('resenas_locales')) || [];

    const yaOpino = resenasLocales.some(r => 
        idsCoinciden(r.productoId, prodIdStr) && 
        r.usuario?.email?.toLowerCase() === emailUsuario
    );

    if (yaOpino) {
        mostrarToast('⚠️ Ya has publicado una opinión para este producto.', true);
        return false;
    }

    resenasLocales.unshift(nuevaResena);
    localStorage.setItem('resenas_locales', JSON.stringify(resenasLocales));

    // 2. Envío diferido a Firestore en segundo plano
    try {
        const firebaseModule = await import('./firebase/config.js');
        if (firebaseModule && firebaseModule.db) {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            const { collection, addDoc } = firestoreModule;

            const promesa = addDoc(collection(firebaseModule.db, 'resenas'), nuevaResena);
            const timeout = new Promise((_, reject) => setTimeout(() => reject("Timeout"), 1000));
            await Promise.race([promesa, timeout]);
        }
    } catch (e) {
        console.warn("Reseña guardada localmente.");
    }

    mostrarToast('¡Gracias! Tu opinión y puntuación han sido registradas.');
    return true;
}