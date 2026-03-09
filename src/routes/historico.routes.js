const express = require('express');
const router = express.Router();
const HistoricoController = require('../controllers/HistoricoController');
const autenticacao = require('../middlewares/autentication');
const asyncHandler = require('../middlewares/asyncHandler');

router.use(autenticacao);

router.get('/', asyncHandler(HistoricoController.listar));

router.get(
  '/:entidade/:entidadeId',
  asyncHandler(HistoricoController.buscarPorEntidade)
);

router.post('/:id/desfazer', asyncHandler(HistoricoController.desfazer));

router.delete('/limpar', asyncHandler(HistoricoController.limparAntigo));

module.exports = router;
