document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.querySelector("#contenedor-producto");

  // 1. Obtener los parámetros de la URL
  const params = new URLSearchParams(window.location.search);
  const idProducto = params.get("id");

  // 2. Buscar el producto en el arreglo 'productos'
  const producto = productos.find(p => p.id === idProducto);

  // 3. Si el producto no existe o la URL no tiene id, mostrar mensaje de error
  if (!producto) {
    contenedor.innerHTML = `
      <div class="alert alert-warning text-center my-5 p-5 shadow-sm rounded-3" role="alert">
        <h2 class="h4 fw-bold mb-3">⚠️ Producto no encontrado</h2>
        <p class="text-secondary mb-4">El identificador de producto especificado no existe en nuestro catálogo.</p>
        <a href="catalogo.html" class="btn btn-outline-success rounded-pill px-4">Volver al catálogo</a>
      </div>
    `;
    return;
  }

  // 4. Determinar etiqueta de stock
  const badgeStock = producto.stock <= 5
    ? `<span class="badge text-bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-semibold">¡Últimas ${producto.stock} unidades!</span>`
    : `<span class="badge text-bg-success-subtle text-success border border-success-subtle fw-semibold">Stock disponible: ${producto.stock} un.</span>`;

  // 5. Renderizar la ficha del producto
  contenedor.innerHTML = `
    <div class="card border-0 shadow-sm overflow-hidden p-4 rounded-3 bg-white">
      <div class="row g-4 align-items-center">
        <div class="col-md-6 text-center">
          <img src="${producto.imagen}" alt="${producto.nombre}" class="img-fluid rounded-3 shadow-sm" style="max-height: 380px; object-fit: cover;">
        </div>
        <div class="col-md-6">
          <span class="text-uppercase text-muted small fw-bold mb-2 d-block">${producto.categoria}</span>
          <h1 class="h2 fw-bold mb-3">${producto.nombre}</h1>
          <div class="mb-3">${badgeStock}</div>
          <p class="text-secondary lead fs-6 mb-4">${producto.descripcion}</p>
          
          <div class="d-flex align-items-center justify-content-between border-top pt-4">
            <span class="fs-2 fw-bold text-dark">$ ${producto.precio}</span>
            <div class="d-flex gap-2">
              <a href="catalogo.html" class="btn btn-outline-secondary rounded-pill px-3">Volver al catálogo</a>
              <button class="btn text-white rounded-pill px-4 shadow-sm" style="background-color: #146c43; border-color: #146c43;">
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
});