const express = require('express');
const router = express.Router();
const ContaController = require('../controllers/ContaController');
const autenticacao = require('../middlewares/autentication');
const asyncHandler = require('../middlewares/asyncHandler');

router.post('/', autenticacao, asyncHandler(ContaController.criar));
router.get('/', autenticacao, asyncHandler(ContaController.listar));
router.put('/:id', autenticacao, asyncHandler(ContaController.atualizar));
router.delete('/:id', autenticacao, asyncHandler(ContaController.deletar));

module.exports = router;