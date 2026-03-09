const express = require('express');
const router = express.Router();
const CarteiraController = require('../controllers/CarteiraController');
const autentication = require('../middlewares/autentication');
const asyncHandler = require('../middlewares/asyncHandler');

router.use(autentication);

// Obtém carteira do usuário
router.get(
  '/',
  asyncHandler(async (req, res) => CarteiraController.obter(req, res))
);

// Atualiza saldo da carteira (entrada)
router.put(
  '/',
  asyncHandler(async (req, res) => CarteiraController.atualizarSaldo(req, res))
);

// Transfere entre carteira e conta
router.post(
  '/transferir',
  asyncHandler(async (req, res) => CarteiraController.transferir(req, res))
);

module.exports = router;
