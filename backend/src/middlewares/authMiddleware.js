const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware que protege rutas verificando el token JWT enviado en el header Authorization.
 */
async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        ok: false,
        message: 'Acceso no autorizado. Se requiere un token Bearer en el encabezado Authorization.',
      });
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      return res.status(401).json({
        ok: false,
        message: 'Acceso no autorizado. El token está vacío.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: 'Token inválido. El usuario asociado ya no existe.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    const message =
      error.name === 'TokenExpiredError'
        ? 'Tu sesión ha expirado. Inicia sesión nuevamente.'
        : 'Token JWT inválido o manipulado.';

    return res.status(401).json({ ok: false, message });
  }
}

module.exports = { protect };
