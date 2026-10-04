// Actualización global del contador de carrito al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    actualizarContadorCarritoGlobal();
});

export function actualizarContadorCarritoGlobal() {
    const badge = document.getElementById('cant-carrito');
    if (!badge) return;

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalArticulos = carrito.reduce((suma, item) => suma + (parseInt(item.cantidad) || 0), 0);

    badge.textContent = totalArticulos;
}