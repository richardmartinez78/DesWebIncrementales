// Importa los módulos necesarios de Firebase
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const auth = getAuth();
const db = getFirestore();

// Esta función la llamas cuando el administrador envía el formulario de registro
async function registrarAdministrador(email, password) {
  try {
    // 1. Crea la cuenta en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;

    // 2. Guarda el perfil con rol 'admin' en la colección 'users' de Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      rol: "admin",
      creadoEn: new Date()
    });

    console.log("✅ Administrador creado correctamente con UID:", user.uid);
  } catch (error) {
    console.error("❌ Error al registrar administrador:", error.code, error.message);
  }
}