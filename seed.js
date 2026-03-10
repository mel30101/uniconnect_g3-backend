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

        // 1. Facultades (Genéricas)
        const faculties = [
            { id: "FAC_ARTES", name: "Artes y Humanidades" },
            { id: "FAC_INGENIERIAS", name: "Inteligencia Artificial e Ingenierías" }
        ];
        for (const fac of faculties) {
            await db.collection('faculties').doc(fac.id).set({ name: fac.name });
        }

        // 2. Niveles Académicos (Genéricos y únicos)
        const academicLevels = [
            { id: "PREGRADO", name: "Pregrado" },
            { id: "POSGRADO", name: "Posgrado" },
            { id: "TECNICOS", name: "Técnico y Tecnólogo" },
            { id: "EDUCACION_CONTINUADA", name: "Educación Continuada" }
        ];
        for (const al of academicLevels) {
            await db.collection('academic_levels').doc(al.id).set({ name: al.name });
        }

        // 3. Niveles de Formación (Genéricos y únicos)
        const formationLevels = [
            { id: "PROFESIONAL", name: "Profesional" },
            { id: "TECNOLOGICO", name: "Tecnología" },
            { id: "MAESTRIA", name: "Maestría" },
            { id: "ESPECIALIZACION", name: "Especialización" },
            { id: "DOCTORADO", name: "Doctorado" },
            { id: "CURSOS", name: "Cursos, diplomados y seminarios" },
            { id: "LICENCIATURA", name: "Licenciatura" }
        ];
        for (const fl of formationLevels) {
            await db.collection('formation_levels').doc(fl.id).set({ name: fl.name });
        }

        // 4. Carreras
        const careers = [
            { id: "C1", name: "Diseño Visual" },
            { id: "C2", name: "Maestro en Música" },
            { id: "C3", name: "Licenciatura en Música" },
            { id: "C4", name: "Licenciatura en Filosofía y Letras" },
            { id: "C5", name: "Maestría en Artes" },
            { id: "C6", name: "Maestría en Didáctica del Inglés" },
            { id: "C7", name: "Doctorado en Didáctica" },
            { id: "C8", name: "Doctorado en Diseño y Creación" },
            { id: "C9", name: "Conservatorio de Música" },
            { id: "C10", name: "Prelex" },
            { id: "422", name: "Ingeniería de Sistemas y Computación" },
            { id: "423", name: "Ingeniería de Alimentos" },
            { id: "424", name: "Tecnología en Logística" },
            { id: "425", name: "Tecnología en Producción Agroindustrial" },
            { id: "426", name: "Maestría en Agronegocios de Café" },
            { id: "427", name: "Maestría en Bioinformática y Biología Computacional" },
            { id: "428", name: "Especialización en Inteligencia Artificial y Analítica de Datos" },
            { id: "429", name: "Doctorado en Ingeniería" },
            { id: "430", name: "Cursos, diplomados" },
        ];
        for (const car of careers) {
            await db.collection('careers').doc(car.id).set({ name: car.name });
        }

        // 5. Tabla de Relaciones (Mapping)
        const mappings = [

            // FACULTAD ARTES Y HUMANIDADES

            // Pregrado → Profesional
            { id: "M1", facultyId: "FAC_ARTES", academicLevelId: "PREGRADO", formationLevelId: "PROFESIONAL", careerId: "C1" }, // Diseño Visual
            { id: "M2", facultyId: "FAC_ARTES", academicLevelId: "PREGRADO", formationLevelId: "PROFESIONAL", careerId: "C2" }, // Maestro en Música

            // Pregrado → Licenciatura
            { id: "M3", facultyId: "FAC_ARTES", academicLevelId: "PREGRADO", formationLevelId: "LICENCIATURA", careerId: "C3" }, // Licenciatura en Música
            { id: "M4", facultyId: "FAC_ARTES", academicLevelId: "PREGRADO", formationLevelId: "LICENCIATURA", careerId: "C4" }, // Licenciatura en Filosofía y Letras

            // Posgrado → Maestría
            { id: "M5", facultyId: "FAC_ARTES", academicLevelId: "POSGRADO", formationLevelId: "MAESTRIA", careerId: "C5" }, // Maestría en Artes
            { id: "M6", facultyId: "FAC_ARTES", academicLevelId: "POSGRADO", formationLevelId: "MAESTRIA", careerId: "C6" }, // Maestría en Didáctica del Inglés

            // Posgrado → Doctorado
            { id: "M7", facultyId: "FAC_ARTES", academicLevelId: "POSGRADO", formationLevelId: "DOCTORADO", careerId: "C7" }, // Doctorado en Didáctica
            { id: "M8", facultyId: "FAC_ARTES", academicLevelId: "POSGRADO", formationLevelId: "DOCTORADO", careerId: "C8" }, // Doctorado en Diseño y Creación

            // Educacion continua → Cursos
            { id: "M9", facultyId: "FAC_ARTES", academicLevelId: "EDUCACION_CONTINUADA", formationLevelId: "CURSOS", careerId: "C9" }, // Conservatorio de Música
            { id: "M10", facultyId: "FAC_ARTES", academicLevelId: "EDUCACION_CONTINUADA", formationLevelId: "CURSOS", careerId: "C10" }, // Prelex


            // FACULTAD INTELIGENCIA ARTIFICIAL E INGENIERÍAS

            // Pregrado → Profesional
            { id: "M11", facultyId: "FAC_INGENIERIAS", academicLevelId: "PREGRADO", formationLevelId: "PROFESIONAL", careerId: "422" }, // Ingeniería de Sistemas
            { id: "M12", facultyId: "FAC_INGENIERIAS", academicLevelId: "PREGRADO", formationLevelId: "PROFESIONAL", careerId: "423" }, // Ingeniería de Alimentos

            // Técnicos y tecnológicos → Tecnología
            { id: "M13", facultyId: "FAC_INGENIERIAS", academicLevelId: "TECNICOS", formationLevelId: "TECNOLOGICO", careerId: "424" }, // Tecnología en Logística
            { id: "M14", facultyId: "FAC_INGENIERIAS", academicLevelId: "TECNICOS", formationLevelId: "TECNOLOGICO", careerId: "425" }, // Tecnología en Producción Agroindustrial

            // Posgrado → Maestría
            { id: "M15", facultyId: "FAC_INGENIERIAS", academicLevelId: "POSGRADO", formationLevelId: "MAESTRIA", careerId: "426" }, // Maestría en Agronegocios de Café
            { id: "M16", facultyId: "FAC_INGENIERIAS", academicLevelId: "POSGRADO", formationLevelId: "MAESTRIA", careerId: "427" }, // Maestría en Bioinformática

            // Posgrado → Especialización
            { id: "M17", facultyId: "FAC_INGENIERIAS", academicLevelId: "POSGRADO", formationLevelId: "ESPECIALIZACION", careerId: "428" },

            // Posgrado → Doctorado
            { id: "M18", facultyId: "FAC_INGENIERIAS", academicLevelId: "POSGRADO", formationLevelId: "DOCTORADO", careerId: "429" },

            // Educación continuada → Cursos
            { id: "M19", facultyId: "FAC_INGENIERIAS", academicLevelId: "EDUCACION_CONTINUADA", formationLevelId: "CURSOS", careerId: "430" }

        ];
        for (const m of mappings) {
            await db.collection('academic_mappings').doc(m.id).set(m);
        }

        // 6. Secciones
        const careerId = "422";
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

        // 7. Materias
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
                sectionId: sub.sectionId
            });
        }

        // 8. Secciones y materias para las demás carreras
        const otherCareers = careers.filter(c => c.id !== "422");

        for (const career of otherCareers) {

            const sectionId = `SEC_${career.id}`;
            const subjectId = `SUB_${career.id}`;

            // Crear sección
            await db.collection('sections').doc(sectionId).set({
                name: `Sección General ${career.name}`,
                careerId: career.id
            });

            // Crear materia
            await db.collection('subjects').doc(subjectId).set({
                name: `Introducción a ${career.name}`,
                credits: 3,
                sectionId: sectionId
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