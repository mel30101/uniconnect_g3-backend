const profileService = require('../services/profileService');
const { asyncHandler } = require('../middlewares/errorMiddleware');

exports.getProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getFullProfile(req.params.studentId);
  res.status(200).json(profile);
});

exports.upsertProfile = asyncHandler(async (req, res) => {
  const { studentId, subjects, careerId } = req.body;
  if (!studentId || !subjects || !careerId) {
    return res.status(400).json({ error: "Datos incompletos (studentId, subjects y careerId son requeridos)" });
  }
  const result = await profileService.saveAcademicProfile(req.body);
  res.status(200).json(result);
});