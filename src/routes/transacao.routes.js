const express = require('express');
const router = express.Router();
const TransacaoController = require('../controllers/TransacaoController');
const autenticacao = require('../middlewares/autentication');
const asyncHandler = require('../middlewares/asyncHandler');

router.post('/', autenticacao, asyncHandler(TransacaoController.criar));
router.get('/', autenticacao, asyncHandler(TransacaoController.listar));
router.put('/:id', autenticacao, asyncHandler(TransacaoController.atualizar));
router.delete('/:id', autenticacao, asyncHandler(TransacaoController.deletar));

module.exports = router;
