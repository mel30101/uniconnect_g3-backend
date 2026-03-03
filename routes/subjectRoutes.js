const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

router.get('/', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('subjects').get();
    const subjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(subjects);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;