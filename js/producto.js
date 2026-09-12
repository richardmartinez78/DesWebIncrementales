document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("contenedor-producto");
  if (!contenedor) return;

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id") || "p1";

  const producto = productos.find(p => String(p.id) === String(productId));

  if (!producto) {
    contenedor.innerHTML = `
      <div class="alert alert-warning text-center py-5">
        <h2>Producto no encontrado</h2>
        <a href="catalogo.html" class="btn btn-dark mt-3">Volver al catálogo</a>
      </div>`;
    return;
  }

  // Especificaciones
  let especificacionesHTML = "";
  if (producto.especificaciones) {
    especificacionesHTML = Object.entries(producto.especificaciones)
      .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`)
      .join("");
  }

  // Productos relacionados
  let relacionadosHTML = "";
  if (producto.relacionados && producto.relacionados.length > 0) {
    const relProds = productos.filter(p => producto.relacionados.map(String).includes(String(p.id)));
    relacionadosHTML = relProds.map(r => `
      <div class="col-6 col-md-3">
        <div class="card h-100 border-0 shadow-sm text-center p-2">
          <img src="${r.imagen}" class="card-img-top mx-auto" style="max-height: 100px; object-fit: contain;">
          <div class="card-body p-2">
            <h6 class="card-title text-truncate">${r.nombre}</h6>
            <a href="producto.html?id=${r.id}" class="btn btn-sm btn-outline-primary mt-2">Ver</a>
          </div>
        </div>
      </div>
    `).join("");
  }

  contenedor.innerHTML = `
    <div class="row g-4">
      <div class="col-md-6">
        <img src="${producto.imagen}" class="img-fluid rounded-3 shadow-sm w-100" style="max-height: 400px; object-fit: cover;" alt="${producto.nombre}">
      </div>
      <div class="col-md-6">
        <span class="badge bg-secondary mb-2">${producto.categoria}</span>
        <h1 class="fw-bold">${producto.nombre}</h1>
        <p class="fs-3 fw-bold text-success">$ ${producto.precio.toLocaleString()}</p>
        <p class="text-secondary">${producto.descripcion}</p>
        
        <div class="mb-3">
          <label for="cant-prod" class="form-label fw-semibold">Cantidad:</label>
          <input type="number" id="cant-prod" class="form-control w-25" value="1" min="1" max="${producto.stock}">
        </div>

        <button id="btn-agregar-detalle" class="btn btn-success btn-lg rounded-pill px-4">
          Agregar al carrito
        </button>
      </div>
    </div>

    ${especificacionesHTML ? `
    <div class="mt-5">
      <h3 class="fw-bold mb-3">Especificaciones Técnicas</h3>
      <table class="table table-striped border">
        <tbody>${especificacionesHTML}</tbody>
      </table>
    </div>` : ''}

    ${relacionadosHTML ? `
    <div class="mt-5">
      <h3 class="fw-bold mb-3">Productos Relacionados</h3>
      <div class="row g-3">${relacionadosHTML}</div>
    </div>` : ''}
  `;

  document.getElementById("btn-agregar-detalle").addEventListener("click", () => {
    const cantInput = document.getElementById("cant-prod");
    const cantidad = Number(cantInput.value) || 1;
    const res = agregarAlCarrito(producto.id, cantidad);
    mostrarToast(res.mensaje, !res.exito);
  });
});