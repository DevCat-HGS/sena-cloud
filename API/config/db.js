const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Configurar opciones de conexión
    const conn = await mongoose.connect(process.env.MONGO_URI, { 
      serverSelectionTimeoutMS: 5000, // Timeout para la selección del servidor
      socketTimeoutMS: 45000, // Timeout para operaciones de socket
    });

    console.log(`📦 MongoDB Conectado: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Error de conexión a MongoDB: ${error.message}`);
    // No terminamos el proceso para permitir que la aplicación funcione sin BD
    throw error;
  }
};

module.exports = connectDB;