const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Banco conectado');
  } catch (error) {
    console.error('Erro ao conectar:', error);
    process.exit(1);
  }
}

module.exports = connectDB;
