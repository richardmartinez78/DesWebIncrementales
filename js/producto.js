document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.querySelector("#contenedor-producto");

  // 1. Obtener el ID desde la URL
  const params = new URLSearchParams(window.location.search);
  const idProducto = params.get("id");

  // CASO A: Si el usuario hizo clic en "Producto" en el menú (sin ?id=...)
  if (!idProducto) {
    window.location.href = "catalogo.html";
    return;
  }

  // Verificar que el catálogo de productos esté cargado
  if (typeof productos === "undefined") {
    if (contenedor) {
      contenedor.innerHTML = `
        <div class="alert alert-danger text-center my-5">
          Error al cargar los datos del catálogo.
        </div>`;
    }
    return;
  }

  // 2. Buscar el producto en la lista
  const producto = productos.find(p => p.id === idProducto);

  // CASO B: Si el ID existe en la URL pero NO coincide con ningún producto (Ej: id=999)
  if (!producto) {
    if (contenedor) {
      contenedor.innerHTML = `
        <div class="card border-0 shadow-sm p-5 text-center rounded-3 bg-white my-5">
          <span class="fs-1 d-block mb-3">⚠️</span>
          <h2 class="h4 fw-bold">Producto no encontrado</h2>
          <p class="text-secondary mb-4">El producto con el identificador "${idProducto}" no existe en nuestro catálogo.</p>
          <div>
            <a href="catalogo.html" class="btn text-white rounded-pill px-4" style="background-color: #146c43;">
              Volver al Catálogo
            </a>
          </div>
        </div>`;
    }
    return;
  }

  // 3. Renderizar la ficha completa si el producto SÍ existe
  const badgeStock = producto.stock <= 5
    ? `<span class="badge text-bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-semibold fs-6">¡Últimas ${producto.stock} unidades!</span>`
    : `<span class="badge text-bg-success-subtle text-success border border-success-subtle fw-semibold fs-6">Stock disponible: ${producto.stock} un.</span>`;

  contenedor.innerHTML = `
    <div class="card border-0 shadow-sm rounded-3 bg-white overflow-hidden my-4">
      <div class="row g-0">
        <div class="col-lg-6">
          <img src="${producto.imagen}" alt="${producto.nombre}" class="img-fluid w-100 h-100" style="object-fit: cover; min-height: 350px;">
        </div>
        <div class="col-lg-6 p-4 p-md-5 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="eyebrow text-uppercase text-muted fw-bold small">${producto.categoria}</span>
              ${badgeStock}
            </div>
            <h1 class="h2 fw-bold text-dark mb-3">${producto.nombre}</h1>
            <p class="text-secondary leading-relaxed mb-4">${producto.descripcion}</p>
            <div class="fs-2 fw-bold text-dark mb-4">$ ${producto.precio}</div>
          </div>

          <div class="border-top pt-4">
            <div class="row g-3 align-items-center">
              <div class="col-auto">
                <label for="input-cantidad" class="form-label small fw-semibold text-secondary mb-0">Cantidad:</label>
              </div>
              <div class="col-auto">
                <input type="number" id="input-cantidad" class="form-control text-center" value="1" min="1" max="${producto.stock}" style="width: 80px;">
              </div>
              <div class="col">
                <button type="button" id="btn-agregar-detalle" class="btn text-white w-100 py-2 rounded-pill shadow-sm fw-semibold" style="background-color: #146c43;">
                  🛒 Agregar al Carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Evento agregar al carrito
  const btnAgregar = document.querySelector("#btn-agregar-detalle");
  const inputCantidad = document.querySelector("#input-cantidad");

  btnAgregar?.addEventListener("click", () => {
    const cantidad = parseInt(inputCantidad.value, 10);

    if (isNaN(cantidad) || cantidad <= 0) {
      alert("Ingresa una cantidad válida.");
      return;
    }

    if (cantidad > producto.stock) {
      alert(`No puedes agregar más unidades del stock disponible (${producto.stock}).`);
      return;
    }

    if (typeof agregarAlCarrito === "function") {
      const respuesta = agregarAlCarrito(producto.id, cantidad);
      alert(respuesta.mensaje);
    }
  });
});