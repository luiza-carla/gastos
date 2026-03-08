const express = require('express');
const router = express.Router();
const ListaDesejoController = require('../controllers/ListaDesejoController');
const autenticacao = require('../middlewares/autentication');
const asyncHandler = require('../middlewares/asyncHandler');

router.post('/', autenticacao, asyncHandler(ListaDesejoController.criar));
router.get('/', autenticacao, asyncHandler(ListaDesejoController.listar));
router.put('/:id', autenticacao, asyncHandler(ListaDesejoController.atualizar));
router.delete('/:id', autenticacao, asyncHandler(ListaDesejoController.deletar));

module.exports = router;