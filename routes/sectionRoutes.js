const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

router.get('/:careerId', async (req, res) => {
  try {
    const { careerId } = req.params;
    const db = admin.firestore();

    // Consultas en paralelo para evitar el lag de 5 segundos
    const [sectionsSnapshot, subjectsSnapshot] = await Promise.all([
      db.collection('sections').where('careerId', '==', careerId).get(),
      db.collection('subjects').where('careerId', '==', careerId).get()
    ]);

    if (sectionsSnapshot.empty) {
      return res.status(404).json({ error: "No se encontró estructura para esta carrera" });
    }

    const allSubjects = subjectsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Organizar materias dentro de sus secciones (Lógica de Negocio)
    const structure = sectionsSnapshot.docs.map(doc => {
      const sectionData = doc.data();
      const sectionId = doc.id;

      return {
        sectionId: sectionId,
        sectionName: sectionData.name,
        subjects: allSubjects.filter(sub => sub.sectionId === sectionId)
      };
    });

    res.status(200).json(structure);
  } catch (error) {
    console.error("Error en sectionRoutes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;