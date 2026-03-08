const express = require('express');
const router = express.Router();

const ResumoController = require('../controllers/ResumoController');
const autenticacao = require('../middlewares/autentication');
const asyncHandler = require('../middlewares/asyncHandler');

router.get('/', autenticacao, asyncHandler(ResumoController.obterResumo));

router.get(
  '/projecao',
  autenticacao,
  asyncHandler(ResumoController.obterProjecao)
);

module.exports = router;
