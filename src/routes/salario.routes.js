const express = require('express');
const router = express.Router();
const SalarioController = require('../controllers/SalarioController');
const autenticacao = require('../middlewares/autentication');

router.post('/', autenticacao, SalarioController.criar);
router.get('/', autenticacao, SalarioController.listar);
router.put('/:id', autenticacao, SalarioController.atualizar);
router.delete('/:id', autenticacao, SalarioController.deletar);

module.exports = router;