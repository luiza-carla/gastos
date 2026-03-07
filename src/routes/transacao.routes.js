const express = require('express');
const router = express.Router();
const TransacaoController = require('../controllers/TransacaoController');
const autenticacao = require('../middlewares/autentication');

router.post('/', autenticacao, TransacaoController.criar);
router.get('/', autenticacao, TransacaoController.listar);
router.put('/:id', autenticacao, TransacaoController.atualizar);
router.delete('/:id', autenticacao, TransacaoController.deletar);

module.exports = router;