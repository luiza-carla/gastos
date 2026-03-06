const express = require('express');
const router = express.Router();

const ResumoController = require('../controllers/ResumoController');
const autenticacao = require('../middlewares/autentication');

router.get('/', autenticacao, ResumoController.obterResumo);

router.get('/projecao', autenticacao, ResumoController.obterProjecao);

module.exports = router;