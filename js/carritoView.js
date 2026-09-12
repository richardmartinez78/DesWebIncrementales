document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("contenedor-carrito");
  const subtotalEl = document.getElementById("resumen-subtotal");
  const totalEl = document.getElementById("resumen-total");
  const btnConfirmar = document.getElementById("btn-confirmar");

  if (!contenedor) return;

  function renderizarCarrito() {
    const carrito = obtenerCarrito();
    contenedor.innerHTML = "";

    if (carrito.length === 0) {
      contenedor.innerHTML = `
        <div class="alert alert-info text-center py-4">
          <h4>Tu carrito está vacío</h4>
          <a href="catalogo.html" class="btn btn-outline-dark mt-2">Explorar catálogo</a>
        </div>`;
      if (subtotalEl) subtotalEl.textContent = "$ 0";
      if (totalEl) totalEl.textContent = "$ 0";
      if (btnConfirmar) btnConfirmar.disabled = true;
      return;
    }

    if (btnConfirmar) btnConfirmar.disabled = false;
    let total = 0;

    carrito.forEach(item => {
      const itemSubtotal = item.precio * item.cantidad;
      total += itemSubtotal;

      const card = document.createElement("div");
      card.className = "card border-0 shadow-sm p-3 mb-3 bg-white rounded-3";
      card.innerHTML = `
        <div class="row g-3 align-items-center">
          <div class="col-3 col-md-2">
            <img src="${item.imagen}" class="img-fluid rounded" alt="${item.nombre}">
          </div>
          <div class="col-9 col-md-4">
            <h5 class="h6 fw-bold mb-1">${item.nombre}</h5>
            <span class="text-secondary small">$ ${item.precio.toLocaleString()} c/u</span>
          </div>
          <div class="col-6 col-md-3 d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-outline-secondary btn-restar" data-id="${item.id}">-</button>
            <span class="fw-semibold px-2">${item.cantidad}</span>
            <button class="btn btn-sm btn-outline-secondary btn-sumar" data-id="${item.id}">+</button>
          </div>
          <div class="col-6 col-md-3 text-end">
            <span class="fw-bold d-block">$ ${itemSubtotal.toLocaleString()}</span>
            <button class="btn btn-sm text-danger p-0 border-0 btn-eliminar" data-id="${item.id}">Eliminar</button>
          </div>
        </div>
      `;
      contenedor.appendChild(card);
    });

    if (subtotalEl) subtotalEl.textContent = `$ ${total.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `$ ${total.toLocaleString()}`;

    // Eventos
    contenedor.querySelectorAll(".btn-sumar").forEach(b => {
      b.addEventListener("click", e => {
        cambiarCantidad(e.target.getAttribute("data-id"), 1);
        renderizarCarrito();
      });
    });

    contenedor.querySelectorAll(".btn-restar").forEach(b => {
      b.addEventListener("click", e => {
        cambiarCantidad(e.target.getAttribute("data-id"), -1);
        renderizarCarrito();
      });
    });

    contenedor.querySelectorAll(".btn-eliminar").forEach(b => {
      b.addEventListener("click", e => {
        eliminarDelCarrito(e.target.getAttribute("data-id"));
        renderizarCarrito();
        mostrarToast("Producto eliminado del carrito");
      });
    });
  }

  if (btnConfirmar) {
    btnConfirmar.addEventListener("click", () => {
      vaciarCarrito();
      renderizarCarrito();
      mostrarToast("¡Gracias por tu compra! Tu pedido fue procesado.");
    });
  }

  renderizarCarrito();
});