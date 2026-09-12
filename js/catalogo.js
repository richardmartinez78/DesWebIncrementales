document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("contenedor-catalogo");
  const selectCategoria = document.getElementById("select-categoria");
  const inputBusqueda = document.getElementById("input-busqueda");
  const btnLimpiar = document.getElementById("btn-limpiar");

  if (!contenedor) return;

  function cargarCategorias() {
    if (!selectCategoria) return;
    const categorias = [...new Set(productos.map(p => p.categoria))];
    categorias.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      selectCategoria.appendChild(option);
    });
  }

  function renderizarProductos(lista) {
    contenedor.innerHTML = "";

    if (lista.length === 0) {
      contenedor.innerHTML = `
        <div class="col-12 text-center py-5">
          <p class="fs-5 text-muted">No se encontraron productos coincidentes.</p>
        </div>`;
      return;
    }

    lista.forEach(prod => {
      const col = document.createElement("div");
      col.className = "col-md-6 col-lg-4";
      col.innerHTML = `
        <div class="card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
          <img src="${prod.imagen}" class="card-img-top style-card-img" alt="${prod.nombre}" style="height: 200px; object-fit: cover;">
          <div class="card-body d-flex flex-column">
            <span class="badge bg-secondary mb-2 align-self-start">${prod.categoria}</span>
            <h5 class="card-title fw-bold">${prod.nombre}</h5>
            <p class="card-text text-secondary small flex-grow-1">${prod.descripcion}</p>
            <div class="d-flex justify-content-between align-items-center mt-3">
              <span class="fs-5 fw-bold">$ ${prod.precio.toLocaleString()}</span>
              <span class="small text-${prod.stock > 0 ? 'success' : 'danger'}">
                ${prod.stock > 0 ? `Stock: ${prod.stock}` : 'Agotado'}
              </span>
            </div>
            <div class="d-grid gap-2 mt-3">
              <a href="producto.html?id=${prod.id}" class="btn btn-outline-dark btn-sm rounded-pill">Ver detalle</a>
              <button class="btn btn-success btn-sm rounded-pill btn-agregar" data-id="${prod.id}" ${prod.stock === 0 ? 'disabled' : ''}>
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      `;
      contenedor.appendChild(col);
    });

    // Delegación de eventos para botones agregar
    contenedor.querySelectorAll(".btn-agregar").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-id");
        const res = agregarAlCarrito(id, 1);
        mostrarToast(res.mensaje, !res.exito);
      });
    });
  }

  function filtrar() {
    const texto = inputBusqueda ? inputBusqueda.value.toLowerCase().trim() : "";
    const cat = selectCategoria ? selectCategoria.value : "todas";

    const filtrados = productos.filter(p => {
      const coincideNombre = p.nombre.toLowerCase().includes(texto) || p.descripcion.toLowerCase().includes(texto);
      const coincideCat = cat === "todas" || p.categoria === cat;
      return coincideNombre && coincideCat;
    });

    renderizarProductos(filtrados);
  }

  cargarCategorias();
  renderizarProductos(productos);

  if (inputBusqueda) inputBusqueda.addEventListener("input", filtrar);
  if (selectCategoria) selectCategoria.addEventListener("change", filtrar);
  if (btnLimpiar) {
    btnLimpiar.addEventListener("click", () => {
      if (inputBusqueda) inputBusqueda.value = "";
      if (selectCategoria) selectCategoria.value = "todas";
      renderizarProductos(productos);
    });
  }
});