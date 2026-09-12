// Arreglo de productos con su identificador único (id) y detalles
const productos = [
  // --- PRODUCTOS ORIGINALES ---
  {
    id: "p1",
    nombre: "Echo Dot 5ª Generación",
    descripcion: "Tu asistente de voz para control inteligente de tu hogar con bocina integrada.",
    categoria: "Entretenimiento",
    precio: 3500,
    stock: 3,
    imagen: "https://a.storyblok.com/f/325304/58045/70b9ad700a/domotica-alexa.jpg/m/900x0/smart/filters:format(webp)",
    imagenes: [
      "https://a.storyblok.com/f/325304/58045/70b9ad700a/domotica-alexa.jpg/m/900x0/smart/filters:format(webp)"
    ],
    especificaciones: {
      "Conectividad": "Wi-Fi 802.11a/b/g/n/ac (2.4 y 5 GHz) / Bluetooth",
      "Audio": "Bocina de 1.73 pulgadas (44 mm) de proyección frontal",
      "Asistente": "Amazon Alexa integrado"
    },
    relacionados: ["p2", "p4"]
  },
  {
    id: "p2",
    nombre: "Sistema de Automatización Domótica",
    descripcion: "Controla la temperatura, iluminación y más con ahorro energético y automatizaciones.",
    categoria: "Confort",
    precio: 1990,
    stock: 5,
    imagen: "https://image.made-in-china.com/202f0j00ELaeRtbhIBcI/Tuya-WiFi-Zigbee-3-0-Integrated-Domotic-Smart-Home-Automation-System-Products-Devices-Work-with-Alexa-and-Google-Home.webp",
    imagenes: [
      "https://image.made-in-china.com/202f0j00ELaeRtbhIBcI/Tuya-WiFi-Zigbee-3-0-Integrated-Domotic-Smart-Home-Automation-System-Products-Devices-Work-with-Alexa-and-Google-Home.webp"
    ],
    especificaciones: {
      "Protocolo": "Zigbee 3.0 / Wi-Fi",
      "Compatibilidad": "Tuya / Smart Life / Alexa / Google Home",
      "Voltaje": "100-240V AC"
    },
    relacionados: ["p1", "p4"]
  },
  {
    id: "p3",
    nombre: "Cámara seguridad IP exterior TP-Link",
    descripcion: "Monitorea tu hogar con visión nocturna, detección de movimiento y alertas instantáneas.",
    categoria: "Seguridad",
    precio: 2350,
    stock: 8,
    imagen: "https://tech.proaccesorios.com.uy/imgs/productos/productos34_3247.webp",
    imagenes: [
      "https://tech.proaccesorios.com.uy/imgs/productos/productos34_3247.webp"
    ],
    especificaciones: {
      "Resolución": "1080p Full HD",
      "Protección": "Resistencia a intemperie IP66",
      "Visión Nocturna": "Hasta 30 metros"
    },
    relacionados: ["1", "p2"]
  },
  {
    id: "p4",
    nombre: "X2 Lámpara Smart Inteligente RGB",
    descripcion: "Ambientes adaptables con control inteligente de color e intensidad desde tu smartphone.",
    categoria: "Hogar",
    precio: 990,
    stock: 15,
    imagen: "https://http2.mlstatic.com/D_NQ_NP_2X_995627-MLU92600735337_092025-F.webp",
    imagenes: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_995627-MLU92600735337_092025-F.webp"
    ],
    especificaciones: {
      "Rosca": "E27 estándar",
      "Colores": "16 Millones de colores RGB + Blanco Cálido/Frío",
      "Potencia": "9W"
    },
    relacionados: ["p1", "p2"]
  },
  {
    id: "1",
    nombre: "Cerradura Inteligente Biométrica",
    precio: 14999,
    categoria: "Seguridad",
    stock: 8,
    imagen: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
    imagenes: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80"
    ],
    descripcion: "Acceso mediante huella dactilar, clave numérica, tarjeta RFID y App móvil.",
    especificaciones: {
      "Conectividad": "Wi-Fi 2.4GHz / Bluetooth 5.0",
      "Alimentación": "4 Baterías AA (Duración 12 meses)",
      "Material": "Aleación de aluminio de alta densidad"
    },
    relacionados: ["p3", "3"]
  },
  {
    id: "3",
    nombre: "Sensor de Movimiento Wi-Fi",
    precio: 2499,
    categoria: "Seguridad",
    stock: 12,
    imagen: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80",
    imagenes: [
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80"
    ],
    descripcion: "Notificaciones instantáneas al móvil al detectar presencia en la zona configurada.",
    especificaciones: {
      "Ángulo de detección": "110°",
      "Alcance": "Hasta 7 metros",
      "Batería": "CR123A incluida"
    },
    relacionados: ["p3", "1"]
  },
  {
    id: "4",
    nombre: "Interruptor Táctil Inteligente 2 Canales",
    precio: 3299,
    categoria: "Hogar",
    stock: 15,
    imagen: "https://openhome.com.uy/wp-content/uploads/2022/08/Touch-Fase-Neutro-1C-29.png",
    imagenes: [
      "https://openhome.com.uy/wp-content/uploads/2022/08/Touch-Fase-Neutro-1C-29.png"
    ],
    descripcion: "Control táctil, por voz (Alexa/Google Home) y programación horaria desde la app.",
    especificaciones: {
      "Voltaje": "110V - 240V AC",
      "Carga máxima": "600W/canal",
      "Panel": "Vidrio templado capacitivo"
    },
    relacionados: ["p4"]
  },
  {
    id: "6",
    nombre: "Termostato Inteligente Wi-Fi",
    precio: 11499,
    categoria: "Confort",
    stock: 5,
    imagen: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80",
    imagenes: [
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80"
    ],
    descripcion: "Control preciso de temperatura y algoritmos para optimización del consumo eléctrico.",
    especificaciones: {
      "Pantalla": "LCD táctil retroiluminada",
      "Compatibilidad": "Sistemas de calefacción y AC centrales",
      "Precisión": "±0.5°C"
    },
    relacionados: ["p2"]
  },
  {
    id: "8",
    nombre: "Enchufe Inteligente con Medidor de Consumo",
    precio: 1999,
    categoria: "Hogar",
    stock: 18,
    imagen: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=600&q=80",
    imagenes: [
      "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=600&q=80"
    ],
    descripcion: "Monitorea el gasto de energía en tiempo real y programa encendidos automáticos.",
    especificaciones: {
      "Corriente máxima": "16A",
      "Medición": "Voltaje, Amperaje, kWh acumulados",
      "Protección": "Sobrecarga automática"
    },
    relacionados: ["p1", "p2"]
  }
];