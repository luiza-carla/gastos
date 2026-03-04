const express = require('express');
const router = express.Router();
const ContaController = require('../controllers/ContaController');
const autenticacao = require('../middlewares/autentication');

router.post('/', autenticacao, ContaController.criar);
router.get('/', autenticacao, ContaController.listar);
router.put('/:id', autenticacao, ContaController.atualizar);
router.delete('/:id', autenticacao, ContaController.deletar);

module.exports = router;