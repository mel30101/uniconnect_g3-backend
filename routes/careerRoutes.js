const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Endpoint para obtener todas las carreras
router.get('/', async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('careers').get();
    
    if (snapshot.empty) {
      return res.status(404).json({ message: "No se encontraron carreras" });
    }

    const careers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(careers);
  } catch (error) {
    console.error("Error al obtener carreras:", error);
    res.status(500).json({ error: "Error interno al obtener carreras" });
  }
});

module.exports = router;