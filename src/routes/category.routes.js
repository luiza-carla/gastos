const express = require('express');
const router = express.Router();
const CategoriaController = require('../controllers/CategoriaController');
const autenticacao = require('../middlewares/autentication');
const asyncHandler = require('../middlewares/asyncHandler');

router.get('/', autenticacao, asyncHandler(CategoriaController.listar));

module.exports = router;
