const express = require('express');
const router = express.Router();
const CategoriaController = require('../controllers/CategoriaController');
const autenticacao = require('../middlewares/autentication');

router.post('/', autenticacao, CategoriaController.criar);
router.get('/', autenticacao, CategoriaController.listar);
router.put('/:id', autenticacao, CategoriaController.atualizar);
router.delete('/:id', autenticacao, CategoriaController.deletar);

module.exports = router;