/**
 * js/carrito-state.js - Manejo puro de datos y estado del carrito
 * Domótica Hogar
 */

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
}