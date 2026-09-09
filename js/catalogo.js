const productos = [
  {
    id: "p1",
    nombre: "Echo Dot 5ª Generación",
    descripcion: "Tu asistente de voz para control inteligente de tu hogar.",
    categoria: "Entretenimiento",
    precio: 3500,
    stock: 3,
    imagen: "https://a.storyblok.com/f/325304/58045/70b9ad700a/domotica-alexa.jpg/m/900x0/smart/filters:format(webp)"
  },
  {
    id: "p2",
    nombre: "Sistema de Automatización Domótica",
    descripcion: "Controla la temperatura, iluminación y más con ahorro energético.",
    categoria: "Confort",
    precio: 1990,
    stock: 5,
    imagen: "https://image.made-in-china.com/202f0j00ELaeRtbhIBcI/Tuya-WiFi-Zigbee-3-0-Integrated-Domotic-Smart-Home-Automation-System-Products-Devices-Work-with-Alexa-and-Google-Home.webp"
  },
  {
    id: "p3",
    nombre: "Cámara seguridad IP exterior TP-Link",
    descripcion: "Monitorea tu hogar con visión nocturna y alertas instantáneas.",
    categoria: "Seguridad",
    precio: 2350,
    stock: 8,
    imagen: "https://tech.proaccesorios.com.uy/imgs/productos/productos34_3247.webp"
  },
  {
    id: "p4",
    nombre: "X2 Lámpara Smart Inteligente RGB",
    descripcion: "Ambientes adaptables con control desde la palma de tu mano.",
    categoria: "Hogar",
    precio: 990,
    stock: 15,
    imagen: "https://http2.mlstatic.com/D_NQ_NP_2X_995627-MLU92600735337_092025-F.webp"
  }
];
const contenedorCatalogo = document.querySelector("#contenedor-catalogo");

function renderizarCatalogo(listaProductos) {
  contenedorCatalogo.innerHTML = "";

  listaProductos.forEach(producto => {
    const columna = document.createElement("div");
    columna.className = "col-md-6 col-xl-3";

    // Lógica para renderizar la etiqueta de stock con los colores de la marca
    const badgeStock = producto.stock <= 5
      ? `<span class="badge text-bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-semibold">¡Últimas ${producto.stock} un.!</span>`
      : `<span class="badge text-bg-success-subtle text-success border border-success-subtle fw-semibold">Stock: ${producto.stock} un.</span>`;

    columna.innerHTML = `
    <a href="producto.html?id=${producto.id}" class="btn btn-success">Ver detalle</a>
      <article class="placeholder-product border rounded-3 overflow-hidden bg-white shadow-sm h-100 d-flex flex-column justify-content-between">
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

// Ejecutar la función al cargar
renderizarCatalogo(productos);