const express = require('express');
const router = express.Router();
const { db } = require('../config/firestrore');

router.get('/:careerId', async (req, res) => {
  try {
    const { careerId } = req.params;

    // 1. Obtener secciones de la carrera
    const sectionsSnapshot = await db.collection('sections').where('careerId', '==', careerId).get();

    if (sectionsSnapshot.empty) {
      return res.status(404).json({ error: "No se encontró estructura para esta carrera" });
    }

    const sectionIds = sectionsSnapshot.docs.map(doc => doc.id);

    // 2. Obtener TODAS las materias (para descartar problemas con la query 'in')
    // Nota: En una app real, esto debería estar filtrado, pero para depurar y asegurar consistencia:
    const subjectsSnapshot = await db.collection('subjects').get();

    const allSubjects = subjectsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        sectionId: data.sectionId || ""
      };
    });

    // 3. Organizar materias dentro de sus secciones
    const structure = sectionsSnapshot.docs.map(doc => {
      const sectionData = doc.data();
      const sectionId = doc.id;

      // Filtramos localmente para asegurar el match
      const sectionSubjects = allSubjects.filter(sub =>
        String(sub.sectionId).trim() === String(sectionId).trim()
      );

      return {
        sectionId: sectionId,
        sectionName: sectionData.name,
        subjects: sectionSubjects
      };
    });

    res.status(200).json(structure);
  } catch (error) {
    console.error("Error en sectionRoutes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;