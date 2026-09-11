document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.querySelector("#contenedor-carrito");
  const btnConfirmar = document.querySelector("#btn-confirmar");

  function renderizarVistaCarrito() {
    // Re-obtener referencias directas del DOM
    const subtotalEl = document.querySelector("#resumen-subtotal");
    const totalEl = document.querySelector("#resumen-total");

    const carrito = obtenerCarrito();

    if (!carrito || carrito.length === 0) {
      if (contenedor) {
        contenedor.innerHTML = `
          <div class="card border-0 shadow-sm p-5 text-center rounded-3 bg-white">
            <span class="fs-1 d-block mb-3">🛒</span>
            <h2 class="h4 fw-bold">Tu carrito está vacío</h2>
            <p class="text-secondary mb-4">Parece que aún no has añadido dispositivos a tu pedido.</p>
            <div>
              <a href="catalogo.html" class="btn text-white rounded-pill px-4" style="background-color: #146c43;">
                Explorar catálogo
              </a>
            </div>
          </div>
        `;
      }
      if (subtotalEl) subtotalEl.textContent = "$ 0";
      if (totalEl) totalEl.textContent = "$ 0";
      if (btnConfirmar) btnConfirmar.disabled = true;
      return;
    }

    if (btnConfirmar) btnConfirmar.disabled = false;

    let totalGeneral = 0;
    let html = `<div class="card border-0 shadow-sm p-3 rounded-3 bg-white">`;

    carrito.forEach(item => {
      const precio = Number(item.precio) || 0;
      const cantidad = Number(item.cantidad) || 0;
      const subtotalItem = precio * cantidad;

      totalGeneral += subtotalItem;

      const deshabilitarMas = cantidad >= item.stock ? "disabled" : "";

      html += `
        <div class="d-flex align-items-center justify-content-between border-bottom py-3 flex-wrap gap-3">
          <div class="d-flex align-items-center gap-3" style="min-width: 220px;">
            <img src="${item.imagen}" alt="${item.nombre}" class="rounded-3" style="width: 70px; height: 70px; object-fit: cover;">
            <div>
              <h3 class="h6 fw-bold mb-1">${item.nombre}</h3>
              <span class="text-muted small">$ ${precio.toLocaleString()} c/u</span>
            </div>
          </div>

          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-outline-secondary btn-restar" data-id="${item.id}">-</button>
            <span class="fw-bold px-2">${cantidad}</span>
            <button class="btn btn-sm btn-outline-secondary btn-sumar" data-id="${item.id}" ${deshabilitarMas}>+</button>
          </div>

          <div class="d-flex align-items-center gap-3">
            <span class="fw-bold text-dark" style="min-width: 90px; text-align: right;">$ ${subtotalItem.toLocaleString()}</span>
            <button class="btn btn-sm btn-outline-danger border-0 btn-eliminar" data-id="${item.id}" title="Eliminar producto">
              🗑️
            </button>
          </div>
        </div>
      `;
    });

    html += `
      <div class="text-end pt-3">
        <button id="btn-vaciar" class="btn btn-sm btn-outline-secondary">Vaciar carrito</button>
      </div>
    </div>`;

    if (contenedor) contenedor.innerHTML = html;

    // Actualizar montos en la interfaz
    if (subtotalEl) subtotalEl.textContent = `$ ${totalGeneral.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `$ ${totalGeneral.toLocaleString()}`;

    asignarEventos();
  }

  function asignarEventos() {
    document.querySelectorAll(".btn-sumar").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        cambiarCantidad(id, 1);
        renderizarVistaCarrito();
      });
    });

    document.querySelectorAll(".btn-restar").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        cambiarCantidad(id, -1);
        renderizarVistaCarrito();
      });
    });

    document.querySelectorAll(".btn-eliminar").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        eliminarDelCarrito(id);
        renderizarVistaCarrito();
      });
    });

    document.querySelector("#btn-vaciar")?.addEventListener("click", () => {
      vaciarCarrito();
      renderizarVistaCarrito();
    });
  }

  btnConfirmar?.addEventListener("click", () => {
    alert("¡Gracias por tu compra! Esta es una simulación de pedido.");
    vaciarCarrito();
    renderizarVistaCarrito();
  });

  renderizarVistaCarrito();
});