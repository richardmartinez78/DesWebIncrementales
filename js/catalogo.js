document.addEventListener("DOMContentLoaded", () => {
  // Referencias a elementos del DOM
  const contenedorCatalogo = document.querySelector("#contenedor-catalogo");
  const inputBusqueda = document.querySelector("#input-busqueda");
  const selectCategoria = document.querySelector("#select-categoria");
  const btnLimpiar = document.querySelector("#btn-limpiar");

  // 1. Cargar dinámicamente las categorías únicas en el selector <select>
  function cargarCategorias() {
    const categoriasUnicas = [...new Set(productos.map(p => p.categoria))];
    categoriasUnicas.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      selectCategoria.appendChild(option);
    });
  }

  // 2. Función para renderizar tarjetas en el catálogo
  function renderizarProductos(lista) {
    contenedorCatalogo.innerHTML = "";

    // Si el arreglo filtrado está vacío, mostrar mensaje sin coincidencias
    if (lista.length === 0) {
      contenedorCatalogo.innerHTML = `
        <div class="col-12">
          <div class="alert alert-light text-center py-5 border rounded-3 shadow-sm">
            <span class="fs-1 d-block mb-2">🔍</span>
            <h3 class="h5 fw-bold text-dark">No se encontraron productos</h3>
            <p class="text-muted small mb-3">No hay coincidencias que se adapten a tu búsqueda o filtro seleccionado.</p>
            <button id="btn-reset-alert" class="btn btn-sm btn-outline-success rounded-pill px-3">
              Restablecer filtros
            </button>
          </div>
        </div>
      `;

      document.querySelector("#btn-reset-alert")?.addEventListener("click", limpiarFiltros);
      return;
    }

    // Dibujar cada producto
    lista.forEach(producto => {
      const columna = document.createElement("div");
      columna.className = "col-md-6 col-xl-3";

      const badgeStock = producto.stock <= 5
        ? `<span class="badge text-bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-semibold">¡Últimas ${producto.stock} un.!</span>`
        : `<span class="badge text-bg-success-subtle text-success border border-success-subtle fw-semibold">Stock: ${producto.stock} un.</span>`;

      columna.innerHTML = `
        <article class="border rounded-3 overflow-hidden bg-white shadow-sm h-100 d-flex flex-column justify-content-between">
          <div>
            <img src="${producto.imagen}" class="img-fluid w-100" alt="${producto.nombre}" style="height: 200px; object-fit: cover;">
            <div class="p-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="eyebrow text-uppercase text-muted small fw-bold">${producto.categoria}</span>
                ${badgeStock}
              </div>
              <h3 class="h5 mt-2">${producto.nombre}</h3>
              <p class="text-secondary small mb-3">${producto.descripcion}</p>
            </div>
          </div>
          <div class="p-3 pt-0">
            <div class="d-flex justify-content-between align-items-center">
              <strong>$ ${producto.precio}</strong>
              <a href="producto.html?id=${producto.id}" class="btn text-white rounded-pill px-3 shadow-sm" style="background-color: #146c43; border-color: #146c43;">
                Ver detalle
              </a>
            </div>
          </div>
        </article>
      `;

      contenedorCatalogo.appendChild(columna);
    });
  }

  // 3. Función principal de filtrado que combina texto y categoría
  function aplicarFiltros() {
    const texto = inputBusqueda.value.trim().toLowerCase();
    const categoriaSeleccionada = selectCategoria.value;

    const productosFiltrados = productos.filter(p => {
      // Coincidencia por nombre o descripción
      const coincideTexto = p.nombre.toLowerCase().includes(texto) ||
                            p.descripcion.toLowerCase().includes(texto);

      // Coincidencia por categoría
      const coincideCategoria = categoriaSeleccionada === "todas" || p.categoria === categoriaSeleccionada;

      return coincideTexto && coincideCategoria;
    });

    renderizarProductos(productosFiltrados);
  }

  // 4. Función para limpiar filtros
  function limpiarFiltros() {
    inputBusqueda.value = "";
    selectCategoria.value = "todas";
    renderizarProductos(productos);
  }

  // 5. Escuchadores de eventos (Event Listeners)
  inputBusqueda.addEventListener("input", aplicarFiltros);
  selectCategoria.addEventListener("change", aplicarFiltros);
  btnLimpiar.addEventListener("click", limpiarFiltros);

  // Inicialización
  cargarCategorias();
  renderizarProductos(productos);
});