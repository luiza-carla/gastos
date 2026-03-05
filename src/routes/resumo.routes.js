const express = require('express');
const router = express.Router();

const ResumoController = require('../controllers/ResumoController');
const autenticacao = require('../middlewares/autentication');

router.get('/', autenticacao, ResumoController.obterResumo);

module.exports = router;