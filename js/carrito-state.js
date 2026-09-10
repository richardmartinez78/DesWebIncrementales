// Clave para guardar en LocalStorage
const CARRITO_STORAGE_KEY = "dh_carrito_compras";

// 1. Obtener carrito desde LocalStorage
function obtenerCarrito() {
  const carritoGuardado = localStorage.getItem(CARRITO_STORAGE_KEY);
  return carritoGuardado ? JSON.parse(carritoGuardado) : [];
}

// 2. Guardar carrito en LocalStorage
function guardarCarrito(carrito) {
  localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(carrito));
}

// 3. Agregar producto al carrito (respetando stock)
function agregarAlCarrito(idProducto, cantidad = 1) {
  const productosList = typeof productos !== "undefined" ? productos : [];
  const productoOriginal = productosList.find(p => p.id === idProducto);

  if (!productoOriginal) return { exito: false, mensaje: "Producto no encontrado." };

  let carrito = obtenerCarrito();
  const indice = carrito.findIndex(item => item.id === idProducto);

  if (indice !== -1) {
    const nuevaCantidad = carrito[indice].cantidad + cantidad;
    if (nuevaCantidad > productoOriginal.stock) {
      return { exito: false, mensaje: `No puedes agregar más de ${productoOriginal.stock} unidades (stock máximo).` };
    }
    carrito[indice].cantidad = nuevaCantidad;
  } else {
    if (cantidad > productoOriginal.stock) {
      return { exito: false, mensaje: `Stock insuficiente. Máximo disponible: ${productoOriginal.stock}.` };
    }
    carrito.push({
      id: productoOriginal.id,
      nombre: productoOriginal.nombre,
      precio: productoOriginal.precio,
      imagen: productoOriginal.imagen,
      stock: productoOriginal.stock,
      cantidad: cantidad
    });
  }

  guardarCarrito(carrito);
  return { exito: true, mensaje: `¡"${productoOriginal.nombre}" agregado al carrito!` };
}

// 4. Modificar cantidad (+1 o -1)
function cambiarCantidad(idProducto, cambio) {
  let carrito = obtenerCarrito();
  const producto = carrito.find(p => p.id === idProducto);

  if (!producto) return;

  const nuevaCantidad = producto.cantidad + cambio;

  if (nuevaCantidad > producto.stock) return;

  if (nuevaCantidad <= 0) {
    eliminarDelCarrito(idProducto);
  } else {
    producto.cantidad = nuevaCantidad;
    guardarCarrito(carrito);
  }
}

// 5. Eliminar producto del carrito
function eliminarDelCarrito(idProducto) {
  let carrito = obtenerCarrito();
  carrito = carrito.filter(p => p.id !== idProducto);
  guardarCarrito(carrito);
}

// 6. Vaciar carrito completo
function vaciarCarrito() {
  localStorage.removeItem(CARRITO_STORAGE_KEY);
}