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
# Domótica Hogar — E-commerce de Automatización Inteligente

#ENTREGA 1 - SPRINT 1
## 📌 Información del Proyecto
* **Nombre del Proyecto:** Domótica Hogar
* **Estudiante:** Richard Martínez
* **Fase del Proyecto:** Sprint 1

---

## 📝 Descripción del E-commerce
**Domótica Hogar** es una plataforma de comercio electrónico orientada a la comercialización e integración de dispositivos y soluciones de automatización inteligente. El sitio busca facilitar a los usuarios la transformación de sus hogares mediante tecnologías que optimizan el confort, la eficiencia energética y la seguridad.

---

## 🎯 Público Objetivo
El sitio está dirigido a:
* Propietarios o inquilinos interesados en modernizar sus espacios y mejorar su calidad de vida.
* Entusiastas de la tecnología que buscan integrar ecosistemas como Alexa, Google Home o Zigbee.
* Personas que priorizan la seguridad de su hogar mediante cámaras y sensores inteligentes.
* Usuarios que buscan reducir el consumo energético a través de un control inteligente de climatización e iluminación.

---

## 📦 Categorías de Productos
1. **Entretenimiento:** Asistentes de voz, altavoces inteligentes y hubs de control.
2. **Confort y Climatización:** Termostatos inteligentes, motores para persianas y cortinas automatizadas.
3. **Seguridad y Protección:** Cámaras IP de exterior e interior, sensores de apertura/movimiento y alarmas.
4. **Iluminación y Hogar:** Lámparas RGB inteligentes, interruptores y enchufes Wi-Fi.

---

## 🛠️ Tecnologías Utilizadas
* **HTML5:** Estructuración semántica y accesible del contenido.
* **CSS3:** Estilos personalizados (`css/styles.css`) para reglas de diseño específicas.
* **Bootstrap v5.3.3:** Framework CSS utilizado para la maquetación *responsive*, grillas (*Grid System*) y componentes UI (Navbar, Carrusel, Modal, Toasts, Cards).
* **Bootstrap Icons / SVG Vectorial:** Iconografía escalable para llamados a la acción y secciones informativas.

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
└── README.md                # Documentación del proyecto.
```
---
##🚀 Instrucciones de Ejecución

Este proyecto no requiere de entornos de servidor backend ni compiladores para la etapa actual (Sprint 1):
Clonar o descargar este repositorio en tu equipo local.
Navegar a la carpeta raíz del proyecto.
Abrir el archivo index.html en cualquier navegador web moderno (Google Chrome, Firefox, Microsoft Edge, Safari).
(Opcional) Si utilizas Visual Studio Code, se recomienda ejecutar la extensión Live Server haciendo clic derecho sobre index.html y seleccionando Open with Live Server.
---

##✅ Funcionalidades Desarrolladas en el Sprint 1

Estructuración Semántica: Maquetación limpia basada en estándares HTML5 (<nav>, <main>, <section>, <article>, <footer>).
Diseño Adaptaivo (Responsive): Adaptación garantizada para dispositivos móviles, tablets y ordenadores mediante la grilla de Bootstrap.
Navegación Principal: Barra superior (Navbar) colapsable con accesos directos e íconos interactivos.
Sección Hero & Banner Informativo: Cabecera dinámica con fecha de última actualización del sitio.
Carrusel Destacado: Diapositivas dinámicas para presentar categorías principales de la tienda.
Grid de Productos Destacados: Tarjetas de productos estandarizadas con títulos, descripciones, precios e imágenes adaptables.
Sección de Beneficios: Módulo de tres columnas con la propuesta de valor (Atención al cliente, Envíos garantizados y Soporte técnico).
Roadmap Interactivo: Modal integrado que permite conocer el alcance y planificación del proyecto a través de sus cuatro Sprints.
Footer Institucional: Pie de página funcional con derechos reservados y nombre del autor.
---

##⏳ Funcionalidades Pendientes (Próximos Sprints)
Sprint 2:

Renderizado dinámico del catálogo de productos mediante JS.
Filtros de búsqueda por categoría y precio.
Vista de detalle para cada producto.
Funcionalidad completa del Carrito de Compras respaldada en LocalStorage.

Sprint 3:

Integración con Firebase (Firestore y Auth).
Autenticación de usuarios (Login / Registro).
Gestión de perfil de usuario y del historial de pedidos.
Panel de administración inicial para gestión de inventario.

Sprint 4:

Sistema de roles (Cliente / Administrador).
Pruebas avanzadas de accesibilidad (A11Y) y usabilidad.
Despliegue final en servidor de producción (GitHub Pages / Firebase Hosting).
---

##🎨 Decisiones de Diseño Adoptadas

Enfoque Mobile-First: Priorización de la correcta visualización en dispositivos móviles utilizando las clases utilitarias de flexbox y la grilla de Bootstrap.
Coherencia Visual: Tratamiento estandarizado de imágenes mediante object-fit: cover; y alturas fijas en las tarjetas para evitar deformaciones visuales en el layout.
Jerarquía Visual y Tipográfica: Uso contrastado de encabezados (h1 a h5), insignias (badges) y botones primarios/secundarios para guiar la lectura del usuario hacia las acciones principales.
Accesibilidad Semántica: Inclusión de etiquetas alt en todas las imágenes del sitio, atributos aria-* en componentes interactivos e íconos SVG independientes de fuentes externas.
---
## Créditos y uso de contenido:
Este repositorio corresponde a un trabajo práctico de índole académico destinado exclusivamente a la evaluación de conocimientos sobre HTML, CSS y Boostrap.
Las imágenes incluidas se utilizan como recurso de demostración sin fines comerciales ni difusión pública. los derechos de autor de las mismas pertenecen a los respectivos creadores o titulares.
---


