# 🛒 Sprint 2 - Actualización del Proyecto

## 🚀 Funcionalidades Incorporadas
* **Catálogo interactivo:** Filtrado en tiempo real por búsqueda de texto y por categorías.
* **Página de detalle de producto:** Carga dinámica mediante parámetros URL (`?id=...`), selector de cantidad y vista de especificaciones técnicas.
* **Gestión de carrito:** Adición, modificación de cantidades, eliminación de ítems y vaciado de carrito con validación de stock disponible.
* **Feedback de usuario:** Notificaciones dinámicas tipo *Toast* y badge contador de productos en la barra de navegación actualizado en tiempo real.

## 📦 Representación de los Productos
Los productos se representan como una **colección de objetos JavaScript** (`productos.js`). Cada objeto contiene las siguientes propiedades clave:
* `id`: Identificador único (cadena de texto o número).
* `nombre`, `descripcion`, `categoria`, `precio` y `stock`.
* `imagen` / `imagenes`: URLs con las imágenes descriptivas.
* `especificaciones`: Objeto clave-valor con la ficha técnica.
* `relacionados`: Arreglo con IDs de productos recomendados.

## 📁 Organización de los Archivos JavaScript
La lógica se modularizó en archivos JS con responsabilidades claras:
* `js/productos.js`: Base de datos local e inventario de productos.
* `js/carrito-state.js`: Estado global del carrito, sincronización con el almacenamiento y helper de notificaciones (*Toasts*).
* `js/catalogo.js`: Renderizado y lógica de filtrado/búsqueda de la vista de catálogo.
* `js/producto.js`: Lógica para la vista de detalle de un producto específico.
* `js/carritoView.js`: Renderizado y gestión de la interfaz de la página del carrito.

## 💾 Información Guardada en LocalStorage
A través de la API `localStorage` del navegador se almacenan:
* `dh_carrito_compras`: Arreglo de objetos con los productos agregados (`id`, `nombre`, `precio`, `imagen`, `stock` y `cantidad`).
* `dh_resenas_productos`: Estructura con valoraciones y comentarios enviados por los usuarios.

## 🔮 Funcionalidades Pendientes (Próximo Sprint)
* **Autenticación de usuarios:** Registro, inicio de sesión y gestión de perfiles de cliente.
* **Integración de Pasarela de Pagos:** Proceso completo de checkout con simulación o integración real de pago.
* **Persistencia en Backend/API:** Conexión con un servidor para persistir pedidos, productos y usuarios en base de datos.
* **Historial de Pedidos:** Sección donde el usuario autenticado pueda consultar sus compras anteriores.


# Nexo Store — Proyecto Base

Proyecto base entregado a los estudiantes para el desarrollo del curso.

## Estado inicial

La estructura general del sistema ya se encuentra creada. En el **Sprint 1** únicamente se trabajará sobre la página de inicio. Los demás módulos serán desarrollados en los próximos sprints.

## Sprint 1

Durante este sprint deberán:

- Definir la temática y el público objetivo.
- Crear la identidad visual del sitio (nombre, colores y tipografías).
- Personalizar el hero principal.
- Incorporar tarjetas estáticas de productos o servicios.
- Utilizar HTML semántico y Bootstrap.
- Garantizar un diseño responsive.
- Agregar textos alternativos a las imágenes.
- Mantener la navegación entre todas las páginas del proyecto.

## Ejecución

Abrir el proyecto utilizando **Live Server** desde Visual Studio Code.
---
# Domótica Hogar — E-commerce de Automatización Inteligente

## 📌 Información del Proyecto
* **Nombre del Proyecto:** Domótica Hogar
* **Estudiante:** Richard Martínez
* **Fase del Proyecto:** Sprint 1

---

## 📝 Descripción del E-commerce
**Domótica Hogar** es una plataforma de comercio electrónico orientada a la comercialización e integración de dispositivos y soluciones de automatización inteligente. El sitio busca facilitar a los usuarios la transformación de sus espacios mediante tecnologías que optimizan el confort, la eficiencia energética y la seguridad del hogar.

---

## 🎯 Público Objetivo
El sitio está diseñado para responder a las necesidades de:
* Propietarios e inquilinos interesados en modernizar sus espacios y mejorar su calidad de vida.
* Entusiastas de la tecnología que buscan integrar ecosistemas como Alexa, Google Home o Zigbee.
* Personas que priorizan la seguridad de su hogar mediante cámaras y sensores de monitoreo en tiempo real.
* Usuarios orientados a la sostenibilidad que buscan reducir el consumo energético mediante climatización e iluminación eficiente.

---

## 📦 Categorías de Productos
1. **Entretenimiento:** Asistentes de voz, altavoces inteligentes y hubs de control centralizado.
2. **Confort y Climatización:** Termostatos inteligentes, controles de temperatura y motores para cortinas/persianas.
3. **Seguridad y Protección:** Cámaras IP de exterior e interior, sensores de movimiento/apertura y sistemas de alarma.
4. **Iluminación y Hogar:** Lámparas RGB inteligentes, interruptores automatizados y enchufes Wi-Fi.

---

## 🛠️ Tecnologías Utilizadas
* **HTML5:** Estructuración semántica y accesible del contenido web.
* **CSS3:** Estilos personalizados (`css/styles.css`) para reglas de diseño particulares.
* **Bootstrap v5.3.3:** Framework CSS utilizado para la maquetación responsive, sistema de grillas (*Grid System*) y componentes UI (Navbar, Carrusel, Modal, Toasts, Cards).
* **JavaScript (ES6):** Script base (`js/base.js`) para la interactividad de componentes Bootstrap y lógica del frontend.(En próximos Sprints)
* **Bootstrap Icons / SVG Vectorial:** Iconografía escalable e integrada para llamados a la acción y secciones informativas.

---

## 📁 Estructura General del Proyecto
```text
domotica-hogar/
├── css/
│   └── styles.css           # Estilos personalizados adicionales
├── js/
│   └── base.js              # Scripts y lógica del frontend
├── index.html               # Página principal (Landing Page)
├── catalogo.html            # Catálogo general de productos (Próximamente)
├── producto.html            # Vista detallada de producto (Próximamente)
├── carrito.html             # Carrito de compras (Próximamente)
├── perfil.html              # Perfil de usuario (Próximamente)
├── admin.html               # Panel de administración (Próximamente)
└── README.md                # Documentación del proyecto
```

---

## 🚀 Instrucciones de Ejecución
Este proyecto no requiere de entornos de servidor backend ni compiladores para la etapa actual (Sprint 1):

1. **Clonar o descargar** este repositorio en tu equipo local.
2. Navegar a la carpeta raíz del proyecto.
3. Abrir el archivo `index.html` en cualquier navegador web moderno (Google Chrome, Firefox, Microsoft Edge, Safari).
4. *(Opcional)* Si utilizas **Visual Studio Code**, se recomienda ejecutar la extensión **Live Server** haciendo clic derecho sobre `index.html` y seleccionando *Open with Live Server*.

---

## ✅ Funcionalidades Desarrolladas en el Sprint 1
* **Estructuración Semántica:** Maquetación limpia basada en estándares HTML5 (`<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
* **Diseño Adaptativo (Responsive):** Adaptación garantizada para dispositivos móviles, tablets y ordenadores mediante el sistema de columnas de Bootstrap.
* **Navegación Principal:** Barra superior (*Navbar*) colapsable con accesos directos, botón de carrito e ingreso.
* **Sección Hero & Banner Informativo:** Cabecera dinámica con información contextual y fecha de última actualización.
* **Carrusel Destacado:** Diapositivas interactivas para presentar las áreas principales de la tienda (Confort, Seguridad, Iluminación).
* **Grid de Productos Destacados:** Tarjetas de productos estandarizadas con imágenes proporcionales, títulos, categorías y precios.
* **Sección de Beneficios:** Módulo de tres columnas con la propuesta de valor (Atención al cliente, Envíos garantizados y Soporte técnico) con contacto directo.
* **Roadmap Interactivo:** Editado a modo de preguntas frecuentes.
* **Footer Institucional:** Pie de página funcional con derechos reservados y autoría del proyecto.

---

## ⏳ Funcionalidades Pendientes
* **Sprint 2:**
  * Renderizado dinámico del catálogo de productos mediante JavaScript.
  * Filtros de búsqueda por categoría y precio.
  * Vista de detalle de producto funcional.
  * Lógica del Carrito de Compras respaldada en `LocalStorage`.
* **Sprint 3:**
  * Integración con Firebase (Firestore y Authentication).
  * Autenticación de usuarios (Registro e Inicio de sesión).
  * Gestión de perfil de usuario y del historial de pedidos.
  * Panel de administración para la gestión inicial de productos.
* **Sprint 4:**
  * Control de acceso y roles (Cliente / Administrador).
  * Pruebas avanzadas de accesibilidad (A11Y) y usabilidad.
  * Despliegue final en servidor de producción (GitHub Pages / Firebase Hosting).

---

## 🎨 Decisiones de Diseño Adoptadas
1. **Enfoque Mobile-First:** Priorización de la correcta visualización en pantallas pequeñas utilizando clases utilitarias de Bootstrap y distribución flexible (*Flexbox*).
2. **Consistencia Visual en Imágenes:** Tratamiento unificado con la propiedad CSS `object-fit: cover;` y dimensiones fijas en contenedores para evitar deformaciones en las tarjetas de productos.
3. **Jerarquía Visual Clara:** Tipografía escalada, insignias (*badges*) en contraste y botones primarios de acción clara para facilitar la lectura del usuario.
4. **Accesibilidad y Buenas Prácticas:** Etiquetas `alt` descriptivas en todas las imágenes, atributos `aria-*` para componentes dinámicos e íconos vectoriales SVG incrustados directamente sin dependencias externas pesadas.
---
## Créditos y uso de contenido:
Este repositorio corresponde a un trabajo práctico de índole académico destinado exclusivamente a la evaluación de conocimientos sobre HTML, CSS y Bootstrap.
Las imágenes incluidas se utilizan como recurso de demostración sin fines comerciales ni difusión pública. Los derechos de autor de las mismas pertenecen a los respectivos creadores o titulares.
---


