const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.get('/:studentId', profileController.getProfile);
router.post('/', profileController.upsertProfile);

module.exports = router;