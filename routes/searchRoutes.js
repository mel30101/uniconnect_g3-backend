const express = require('express');
const router = express.Router();
const searchService = require('../services/searchService');
const { asyncHandler } = require('../middlewares/errorMiddleware');

router.get('/', asyncHandler(async (req, res) => {
  const { name, subjectId, excludeId } = req.query;

  const results = await searchService.searchStudents({
    name,
    subjectId,
    excludeId
  });

  res.json(results);
}));

module.exports = router;