/**
 * Middleware para rutas inexistentes (404).
 */
function notFound(req, res) {
  res.status(404).json({
    ok: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Manejador global de errores para devolver respuestas consistentes en JSON.
 */
function errorHandler(err, _req, res, _next) {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((item) => item.message);
    return res.status(400).json({
      ok: false,
      message: errors[0] || 'Error de validación en los datos enviados.',
      errors,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'campo';
    return res.status(409).json({
      ok: false,
      message: `Ya existe un registro con ese ${field}.`,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      ok: false,
      message: 'El identificador proporcionado no tiene un formato válido.',
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    ok: false,
    message: err.message || 'Error interno del servidor.',
  });
}

module.exports = { notFound, errorHandler };
