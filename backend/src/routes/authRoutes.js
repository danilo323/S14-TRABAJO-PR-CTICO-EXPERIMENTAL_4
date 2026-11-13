const express = require('express');
const {
  register,
  login,
  getProfile,
  getUsers,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Rutas públicas de autenticación
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas con JWT
router.get('/profile', protect, getProfile);
router.get('/users', protect, getUsers);

module.exports = router;
