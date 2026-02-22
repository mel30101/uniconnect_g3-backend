const admin = require('firebase-admin');
const serviceAccount = require('./config/serviceAccountKey.json');

// Evitar inicializar doble si ya está corriendo en otro lado
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const seedDatabase = async () => {
    try {
        console.log("Iniciando carga de datos...");

        // 1. Crear Carrera: Ingeniería de Sistemas y Computación
        const careerId = "422";
        await db.collection('careers').doc(careerId).set({
            name: "Ingeniería de Sistemas y Computación"
        });

        // 2. Crear Secciones (Referenciando a la carrera 422)
        const sections = [
            { id: "INFO_TEORICA", name: "Informática Teórica" },
            { id: "MATEMATICAS", name: "Matemáticas" },
            { id: "PROG", name: "Programación" }
        ];

        for (const sec of sections) {
            await db.collection('sections').doc(sec.id).set({
                name: sec.name,
                careerId: careerId
            });
        }

        // 3. Crear Materias (Basadas en tu imagen)
        const subjects = [
            { id: "59G8F", name: "Análisis y Diseño de Algoritmo", credits: 3, sectionId: "INFO_TEORICA" },
            { id: "63G8F", name: "Estructura de Lenguajes", credits: 2, sectionId: "INFO_TEORICA" },
            { id: "56G8F", name: "Autómatas y Lenguajes Formales", credits: 2, sectionId: "INFO_TEORICA" },
            { id: "64G8F", name: "Sistemas Inteligentes I", credits: 2, sectionId: "INFO_TEORICA" },
            { id: "CALC1", name: "Cálculo I", credits: 4, sectionId: "MATEMATICAS" }
        ];

        for (const sub of subjects) {
            await db.collection('subjects').doc(sub.id).set({
                name: sub.name,
                credits: sub.credits,
                sectionId: sub.sectionId,
                careerId: careerId
            });
        }

        console.log("¡Datos cargados con éxito en Firestore!");
        process.exit();
    } catch (error) {
        console.error("Error cargando datos:", error);
        process.exit(1);
    }
};

seedDatabase();