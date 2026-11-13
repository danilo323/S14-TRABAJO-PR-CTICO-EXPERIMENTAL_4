require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('La variable de entorno JWT_SECRET no está definida.');
    }

    await connectDB();

    app.listen(PORT, () => {
      console.log(`Servidor API escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
}

startServer();
