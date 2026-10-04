// Clave única utilizada en todo el proyecto
const STORAGE_KEY = 'carrito';

// Lee y parsea los datos desde localStorage de forma segura
export function obtenerCarrito() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        const carrito = data ? JSON.parse(data) : [];
        return Array.isArray(carrito) ? carrito : [];
    } catch (e) {
        console.error('Error al leer el carrito de localStorage:', e);
        return [];
    }
}

// Guarda en localStorage y actualiza la insignia en el Navbar
export function guardarCarrito(carrito) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
    actualizarBadgeCarrito();
}

// Calcula y muestra la suma total de unidades en el badge
export function actualizarBadgeCarrito() {
    const carrito = obtenerCarrito();
    const totalCantidad = carrito.reduce((acc, item) => {
        const cant = parseInt(item.cantidad, 10);
        return acc + (isNaN(cant) ? 0 : cant);
    }, 0);
    
    const badge = document.getElementById('cant-carrito');
    if (badge) {
        badge.textContent = totalCantidad;
    }
}

// Escucha eventos para actualizar automáticamente cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    actualizarBadgeCarrito();
});