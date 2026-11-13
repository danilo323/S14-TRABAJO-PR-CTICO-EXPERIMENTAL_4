const mongoose = require('mongoose');

/**
 * Establece la conexión con MongoDB usando la URI configurada en .env.
 */
async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('La variable de entorno MONGO_URI no está definida.');
  }

  const conn = await mongoose.connect(mongoUri);
  console.log(`MongoDB conectado: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
}

module.exports = connectDB;
