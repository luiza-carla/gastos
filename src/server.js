require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const garantirCategoriasPadrao = require('./utils/seedCategoria');

async function iniciarServidor() {
  await connectDB();
  await garantirCategoriasPadrao();

  app.listen(process.env.PORT, () => {
    console.log('Servidor rodando');
  });
}

iniciarServidor();