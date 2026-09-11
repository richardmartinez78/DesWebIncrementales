document.addEventListener("DOMContentLoaded", () => {
  // Referencias a elementos del DOM
  const contenedorCatalogo = document.querySelector("#contenedor-catalogo");
  const inputBusqueda = document.querySelector("#input-busqueda");
  const selectCategoria = document.querySelector("#select-categoria");
  const btnLimpiar = document.querySelector("#btn-limpiar");

  // 1. Cargar dinámicamente las categorías únicas en el selector <select>
  function cargarCategorias() {
    if (!selectCategoria || typeof productos === "undefined") return;

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
    if (!contenedorCatalogo) return;

    // Limpiar el contenedor antes de dibujar
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

      // Distintivo de stock según disponibilidad
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
            <div class="d-flex justify-content-between align-items-center gap-2">
              <strong class="fs-5">$ ${producto.precio}</strong>
              <div class="d-flex gap-1">
                <a href="producto.html?id=${producto.id}" class="btn btn-sm btn-outline-secondary rounded-pill px-3">
                  Detalle
                </a>
                <button type="button" class="btn btn-sm btn-agregar-cart text-white rounded-pill px-3" data-id="${producto.id}" style="background-color: #146c43;">
                  + Carrito
                </button>
              </div>
            </div>
          </div>
        </article>
      `;

      contenedorCatalogo.appendChild(columna);
    });

    // Asignar eventos a los nuevos botones de agregar al carrito
    asignarEventosAgregar();
  }

  // 3. Conectar los botones "+ Carrito" con la función global de carrito-state.js
  function asignarEventosAgregar() {
    const botonesAgregar = document.querySelectorAll(".btn-agregar-cart");
    botonesAgregar.forEach(boton => {
      boton.addEventListener("click", (e) => {
        const idProducto = e.currentTarget.getAttribute("data-id");

        if (typeof agregarAlCarrito === "function") {
          const respuesta = agregarAlCarrito(idProducto, 1);
          alert(respuesta.mensaje);
        } else {
          console.error("La función agregarAlCarrito no está disponible. Revisa que js/carrito-state.js esté cargado.");
        }
      });
    });
  }

  // 4. Función principal de filtrado que combina texto y categoría
  function aplicarFiltros() {
    if (typeof productos === "undefined") return;

    const texto = inputBusqueda ? inputBusqueda.value.trim().toLowerCase() : "";
    const categoriaSeleccionada = selectCategoria ? selectCategoria.value : "todas";

    const productosFiltrados = productos.filter(p => {
      const coincideTexto = p.nombre.toLowerCase().includes(texto) ||
                            p.descripcion.toLowerCase().includes(texto);

      const coincideCategoria = categoriaSeleccionada === "todas" || p.categoria === categoriaSeleccionada;

      return coincideTexto && coincideCategoria;
    });

    renderizarProductos(productosFiltrados);
  }

  // 5. Función para limpiar filtros
  function limpiarFiltros() {
    if (inputBusqueda) inputBusqueda.value = "";
    if (selectCategoria) selectCategoria.value = "todas";
    if (typeof productos !== "undefined") {
      renderizarProductos(productos);
    }
  }

  // 6. Escuchadores de eventos (Event Listeners)
  if (inputBusqueda) inputBusqueda.addEventListener("input", aplicarFiltros);
  if (selectCategoria) selectCategoria.addEventListener("change", aplicarFiltros);
  if (btnLimpiar) btnLimpiar.addEventListener("click", limpiarFiltros);

  // Inicialización al cargar la vista
  cargarCategorias();
  if (typeof productos !== "undefined") {
    renderizarProductos(productos);
  }
});