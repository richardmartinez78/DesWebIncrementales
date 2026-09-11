const CARRITO_STORAGE_KEY = "dh_carrito_compras";

function obtenerCarrito() {
  const carritoGuardado = localStorage.getItem(CARRITO_STORAGE_KEY);
  return carritoGuardado ? JSON.parse(carritoGuardado) : [];
}

function guardarCarrito(carrito) {
  localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(carrito));
}

function agregarAlCarrito(idProducto, cantidad = 1) {
  const productosList = typeof productos !== "undefined" ? productos : [];
  const productoOriginal = productosList.find(p => p.id === idProducto);

  if (!productoOriginal) return { exito: false, mensaje: "Producto no encontrado." };

  let carrito = obtenerCarrito();
  const indice = carrito.findIndex(item => item.id === idProducto);
  const cantSumar = Number(cantidad);

  if (indice !== -1) {
    const nuevaCantidad = Number(carrito[indice].cantidad) + cantSumar;
    if (nuevaCantidad > productoOriginal.stock) {
      return { exito: false, mensaje: `Máximo disponible: ${productoOriginal.stock} unidades.` };
    }
    carrito[indice].cantidad = nuevaCantidad;
  } else {
    if (cantSumar > productoOriginal.stock) {
      return { exito: false, mensaje: `Stock insuficiente. Máximo: ${productoOriginal.stock}.` };
    }
    carrito.push({
      id: productoOriginal.id,
      nombre: productoOriginal.nombre,
      precio: Number(productoOriginal.precio),
      imagen: productoOriginal.imagen,
      stock: Number(productoOriginal.stock),
      cantidad: cantSumar
    });
  }

  guardarCarrito(carrito);
  return { exito: true, mensaje: `¡"${productoOriginal.nombre}" agregado al carrito!` };
}

function cambiarCantidad(idProducto, cambio) {
  let carrito = obtenerCarrito();
  const producto = carrito.find(p => p.id === idProducto);

  if (!producto) return;

  const nuevaCantidad = Number(producto.cantidad) + Number(cambio);

  if (nuevaCantidad > producto.stock) return;

  if (nuevaCantidad <= 0) {
    eliminarDelCarrito(idProducto);
  } else {
    producto.cantidad = nuevaCantidad;
    guardarCarrito(carrito);
  }
}

function eliminarDelCarrito(idProducto) {
  let carrito = obtenerCarrito();
  carrito = carrito.filter(p => p.id !== idProducto);
  guardarCarrito(carrito);
}

function vaciarCarrito() {
  localStorage.removeItem(CARRITO_STORAGE_KEY);
}
// 1. Obtener la suma total de unidades guardadas en el carrito
function obtenerCantidadTotal() {
  const carrito = obtenerCarrito();
  return carrito.reduce((total, item) => total + Number(item.cantidad), 0);
}

// 2. Actualizar la etiqueta del menú con el contador actual
function actualizarContadorMenu() {
  const badgeMenu = document.querySelectorAll("#cant-carrito");
  const totalUnidades = obtenerCantidadTotal();

  badgeMenu.forEach(badge => {
    badge.textContent = totalUnidades;
  });
}

// 3. Modificar guardarCarrito para refrescar el badge automáticamente
const guardarCarritoOriginal = guardarCarrito;
guardarCarrito = function(carrito) {
  localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(carrito));
  actualizarContadorMenu();
};

const vaciarCarritoOriginal = vaciarCarrito;
vaciarCarrito = function() {
  localStorage.removeItem(CARRITO_STORAGE_KEY);
  actualizarContadorMenu();
};

// 4. Cargar el contador en pantalla al iniciar el sitio
document.addEventListener("DOMContentLoaded", () => {
  actualizarContadorMenu();
});