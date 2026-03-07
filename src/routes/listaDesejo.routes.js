const express = require('express');
const router = express.Router();
const ListaDesejoController = require('../controllers/ListaDesejoController');
const autenticacao = require('../middlewares/autentication');

router.post('/', autenticacao, ListaDesejoController.criar);
router.get('/', autenticacao, ListaDesejoController.listar);
router.put('/:id', autenticacao, ListaDesejoController.atualizar);
router.delete('/:id', autenticacao, ListaDesejoController.deletar);

module.exports = router;