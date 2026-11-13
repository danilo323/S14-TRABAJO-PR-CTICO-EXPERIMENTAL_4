const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * POST /api/auth/register
 * Registra un nuevo usuario, encripta su contraseña y devuelve un JWT.
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: 'Todos los campos son obligatorios: nombre, correo y contraseña.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        ok: false,
        message: 'Este correo electrónico ya está registrado.',
      });
    }

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: String(password),
    });

    const token = signToken(user);

    res.status(201).json({
      ok: true,
      message: 'Usuario registrado correctamente.',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Autentica un usuario existente y devuelve su JWT.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: 'Ingresa tu correo electrónico y contraseña.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user || !(await user.comparePassword(String(password)))) {
      return res.status(401).json({
        ok: false,
        message: 'Credenciales incorrectas. Verifica tu correo y contraseña.',
      });
    }

    const token = signToken(user);

    res.json({
      ok: true,
      message: 'Inicio de sesión exitoso.',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/profile (Protegida)
 * Devuelve los datos del usuario autenticado mediante el token JWT.
 */
function getProfile(req, res) {
  res.json({
    ok: true,
    message: 'Acceso autorizado a ruta protegida.',
    user: req.user,
  });
}

/**
 * GET /api/auth/users (Protegida)
 * Consulta los usuarios registrados en MongoDB (sin exponer contraseñas).
 */
async function getUsers(_req, res, next) {
  try {
    const users = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 });

    res.json({
      ok: true,
      total: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, getProfile, getUsers };
