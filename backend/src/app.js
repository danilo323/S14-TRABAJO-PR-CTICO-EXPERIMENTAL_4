const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());

// Ruta pública de estado de la API
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'TaskFlow API - Práctica 4 Desarrollo Web',
    timestamp: new Date().toISOString(),
  });
});

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Manejo de errores y rutas no encontradas
app.use(notFound);
app.use(errorHandler);

module.exports = app;
