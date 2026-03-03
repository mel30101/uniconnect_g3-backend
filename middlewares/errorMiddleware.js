// Captura errores de funciones async automáticamente
exports.asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Manejador central de errores
exports.globalErrorHandler = (err, req, res, next) => {
  console.error("Error log:", err.stack);
  const status = err.message === 'PROFILE_NOT_FOUND' ? 404 : 500;
  res.status(status).json({
    error: true,
    message: err.message || "Internal Server Error"
  });
};