/**
 * js/carrito-state.js - Manejo puro de datos y estado del carrito
 * Domótica Hogar
 */

import { obtenerSesion } from './base.js';

export function obtenerCarrito() {
    try {
        return JSON.parse(localStorage.getItem('carrito')) || JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        console.error("Error al leer localStorage:", e);
        return [];
    }
}

export function guardarCarrito(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarritoGlobal();
}

export function eliminarPorId(id) {
    const carrito = obtenerCarrito();
    const nuevoCarrito = carrito.filter(item => String(item.id) !== String(id));
    guardarCarrito(nuevoCarrito);
    return nuevoCarrito;
}

export function vaciarCarrito() {
    localStorage.removeItem('carrito');
    localStorage.removeItem('cart');
    actualizarContadorCarritoGlobal();
}

/**
 * Actualiza el contador/badge del carrito en la interfaz global
 */
export function actualizarContadorCarritoGlobal() {
    const carrito = obtenerCarrito();
    const totalItems = carrito.reduce((acc, item) => acc + (item.cantidad || 1), 0);
    const badge = document.getElementById('cant-carrito');
    if (badge) badge.textContent = totalItems;
}

/**
 * Modifica la cantidad de un producto (+ / -) o lo elimina por índice
 */
export function actualizarCantidadProducto(index, operacion) {
    const carrito = obtenerCarrito();
    if (!carrito[index]) return;

    if (operacion === 'sumar') {
        carrito[index].cantidad = (carrito[index].cantidad || 1) + 1;
    } else if (operacion === 'restar') {
        if (carrito[index].cantidad > 1) {
            carrito[index].cantidad -= 1;
        } else {
            carrito.splice(index, 1);
        }
    } else if (operacion === 'eliminar') {
        carrito.splice(index, 1);
    }

    guardarCarrito(carrito);
}

/**
 * Procesa la orden de compra evaluando la autenticación del usuario.
 * Preserva el estado en localStorage si no ha iniciado sesión.
 */
export function procesarOrdenDeCompra() {
    const usuario = obtenerSesion();
    const carrito = obtenerCarrito();

    // 🔒 SI NO HAY SESIÓN: Mantiene los productos en el estado y solicita autenticación
    if (!usuario) {
        return { exito: false, requiereAuth: true };
    }

    // 🔒 SI HAY SESIÓN: Registra la orden en el historial local del cliente
    const pedidosLocales = JSON.parse(localStorage.getItem('pedidos_locales')) || [];
    const nuevoPedido = {
        id: Date.now(),
        fecha: new Date().toLocaleDateString('es-UY'),
        productos: [...carrito],
        total: carrito.reduce((acc, p) => acc + ((p.precio || 0) * (p.cantidad || 1)), 0),
        estado: 'Entregado'
    };

    pedidosLocales.push(nuevoPedido);
    localStorage.setItem('pedidos_locales', JSON.stringify(pedidosLocales));

    // Se vacía el carrito únicamente tras la compra confirmada
    vaciarCarrito();

    return { exito: true, requiereAuth: false };
}