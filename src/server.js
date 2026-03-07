require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const garantirCategoriasPadrao = require('./utils/seedCategoria');
const salarioScheduler = require('./services/SalarioScheduler');

async function iniciarServidor() {
  await connectDB();
  // Garante categorias padrão no banco
  await garantirCategoriasPadrao();

  // Inicia agendador de salários recorrentes
  salarioScheduler.iniciar();

  app.listen(process.env.PORT, () => {
    console.log('Servidor rodando');
  });
}

iniciarServidor();