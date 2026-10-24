const admin = require('firebase-admin');

// 1. Inicializa Firebase Admin (requiere tu archivo de credenciales de servicio)
const serviceAccount = require('./clave-servicio.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 2. Coloca el UID exacto del usuario (se obtiene en la consola)
const uid = "99ToTR7ZVYVR03ilwt8UPd9DcYt2"; 

// 3. Ejecuta la actualización de contraseña
admin.auth().updateUser(uid, {
  password: "AdminPass1212" // Escribe la nueva clave aquí
})
.then((userRecord) => {
  console.log("✅ Contraseña actualizada correctamente para el correo:", userRecord.email);
})
.catch((error) => {
  console.error("❌ Error al cambiar la contraseña:", error);
});