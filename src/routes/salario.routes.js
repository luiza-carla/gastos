const express = require('express');
const router = express.Router();
const SalarioController = require('../controllers/SalarioController');
const autenticacao = require('../middlewares/autentication');
const asyncHandler = require('../middlewares/asyncHandler');

router.post('/', autenticacao, asyncHandler(SalarioController.criar));
router.get('/', autenticacao, asyncHandler(SalarioController.listar));
router.put('/:id', autenticacao, asyncHandler(SalarioController.atualizar));
router.delete('/:id', autenticacao, asyncHandler(SalarioController.deletar));

module.exports = router;
