const CARRITO_STORAGE_KEY = "dh_carrito_compras";
const REVIEWS_STORAGE_KEY = "dh_resenas_productos";

// --- GESTIÓN DEL CARRITO ---
function obtenerCarrito() {
  const carritoGuardado = localStorage.getItem(CARRITO_STORAGE_KEY);
  return carritoGuardado ? JSON.parse(carritoGuardado) : [];
}

function guardarCarrito(carrito) {
  localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(carrito));
  actualizarContadorMenu();
}

function agregarAlCarrito(idProducto, cantidad = 1) {
  const productosList = typeof productos !== "undefined" ? productos : [];
  const productoOriginal = productosList.find(p => String(p.id) === String(idProducto));

  if (!productoOriginal) return { exito: false, mensaje: "Producto no encontrado." };

  let carrito = obtenerCarrito();
  const indice = carrito.findIndex(item => String(item.id) === String(idProducto));
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
  const producto = carrito.find(p => String(p.id) === String(idProducto));

  if (!producto) return;

  const nuevaCantidad = Number(producto.cantidad) + Number(cambio);

  if (nuevaCantidad > producto.stock) {
    mostrarToast(`Stock máximo alcanzado (${producto.stock} un.)`, true);
    return;
  }

  if (nuevaCantidad <= 0) {
    eliminarDelCarrito(idProducto);
  } else {
    producto.cantidad = nuevaCantidad;
    guardarCarrito(carrito);
  }
}

function eliminarDelCarrito(idProducto) {
  let carrito = obtenerCarrito();
  carrito = carrito.filter(p => String(p.id) !== String(idProducto));
  guardarCarrito(carrito);
}

function vaciarCarrito() {
  localStorage.removeItem(CARRITO_STORAGE_KEY);
  actualizarContadorMenu();
}

function obtenerCantidadTotal() {
  const carrito = obtenerCarrito();
  return carrito.reduce((total, item) => total + Number(item.cantidad), 0);
}

function actualizarContadorMenu() {
  const badgeMenu = document.querySelectorAll("#cant-carrito");
  const totalUnidades = obtenerCantidadTotal();

  badgeMenu.forEach(badge => {
    badge.textContent = totalUnidades;
  });
}

// --- NOTIFICACIONES TOAST ---
function mostrarToast(mensaje, esError = false) {
  let toastEl = document.getElementById("appToast");
  let toastBody = document.getElementById("toastMessage");

  if (!toastEl || !toastBody) {
    alert(mensaje);
    return;
  }

  toastBody.textContent = mensaje;
  toastEl.className = `toast align-items-center text-white border-0 ${esError ? 'bg-danger' : 'bg-success'}`;

  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();
}

// --- RESEÑAS Y VALORACIONES ---
function obtenerResenas(idProducto) {
  const todas = JSON.parse(localStorage.getItem(REVIEWS_STORAGE_KEY)) || {};
  return todas[idProducto] || [];
}

function guardarResena(idProducto, resena) {
  const todas = JSON.parse(localStorage.getItem(REVIEWS_STORAGE_KEY)) || {};
  if (!todas[idProducto]) todas[idProducto] = [];

  todas[idProducto].push({
    ...resena,
    fecha: new Date().toLocaleDateString()
  });

  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(todas));
}

function obtenerPromedioValoracion(idProducto) {
  const resenas = obtenerResenas(idProducto);
  if (resenas.length === 0) return { promedio: 0, cantidad: 0 };

  const suma = resenas.reduce((acc, r) => acc + Number(r.estrellas), 0);
  return {
    promedio: (suma / resenas.length).toFixed(1),
    cantidad: resenas.length
  };
}

document.addEventListener("DOMContentLoaded", () => {
  actualizarContadorMenu();
});