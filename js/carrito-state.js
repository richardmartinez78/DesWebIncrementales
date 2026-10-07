/**
 * js/carrito-state.js - Estado y lógica del carrito
 * Domótica Hogar
 */

/**
 * Lee los elementos guardados en localStorage
 */
export function obtenerCarrito() {
    try {
        return JSON.parse(localStorage.getItem('carrito')) || JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        console.error("Error al leer localStorage:", e);
        return [];
    }
}

/**
 * Guarda el array de productos en localStorage
 */
export function guardarCarrito(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

/**
 * Actualiza la cantidad de un ítem por su índice
 */
export function actualizarCantidad(index, nuevaCantidad) {
    const carrito = obtenerCarrito();
    if (carrito[index]) {
        carrito[index].cantidad = Math.max(1, parseInt(nuevaCantidad) || 1);
        guardarCarrito(carrito);
    }
    return carrito;
}

/**
 * Elimina un producto por su índice y retorna el producto eliminado
 */
export function eliminarDelCarrito(index) {
    const carrito = obtenerCarrito();
    let eliminado = null;
    if (index >= 0 && index < carrito.length) {
        eliminado = carrito.splice(index, 1)[0];
        guardarCarrito(carrito);
    }
    return { carrito, eliminado };
}

/**
 * Vacía completamente el carrito
 */
export function vaciarCarrito() {
    localStorage.removeItem('carrito');
    localStorage.removeItem('cart');
}

/**
 * Calcula la suma total del carrito
 */
export function calcularTotal(carrito) {
    return carrito.reduce((acc, prod) => {
        const cantidad = parseInt(prod.cantidad) || 1;
        const precio = parseFloat(prod.precio) || 0;
        return acc + (precio * cantidad);
    }, 0);
}