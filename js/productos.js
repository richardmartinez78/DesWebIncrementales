import { db } from './firebase/config.js';
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export async function obtenerProductos() {
    try {
        const querySnapshot = await getDocs(collection(db, "productos"));
        const productos = [];
        querySnapshot.forEach((docSnap) => {
            productos.push({
                id: docSnap.id,
                ...docSnap.data()
            });
        });
        return productos;
    } catch (error) {
        console.error("Error al obtener productos de Firestore:", error);
        throw new Error("No se pudo conectar con la base de datos de productos.");
    }
}

export async function obtenerProductoPorId(id) {
    try {
        const docRef = doc(db, "productos", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error al obtener el producto:", error);
        throw new Error("Error al consultar el detalle del producto.");
    }
}