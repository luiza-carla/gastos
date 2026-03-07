const express = require('express');
const path = require('path');
require('dotenv').config();
const cors = require('cors');

// Inicialização da aplicação
const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Arquivos estáticos (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da aplicação
const userRoutes = require('./routes/user.routes');
app.use('/usuarios', userRoutes);

const contaRoutes = require('./routes/conta.routes');
app.use('/contas', contaRoutes);

const categoriaRoutes = require('./routes/category.routes');
app.use('/categorias', categoriaRoutes);

const transacaoRoutes = require('./routes/transacao.routes');
app.use('/transacoes', transacaoRoutes);

const salarioRoutes = require('./routes/salario.routes');
app.use('/salarios', salarioRoutes);

const resumoRoutes = require('./routes/resumo.routes');
app.use('/resumo', resumoRoutes);

const listaDesejoRoutes = require('./routes/listaDesejo.routes');
app.use('/lista-desejos', listaDesejoRoutes);

module.exports = app;