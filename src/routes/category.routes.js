const express = require('express');
const router = express.Router();
const autenticacao = require('../middlewares/autentication');

router.get('/', autenticacao, (req, res) => {
  res.json({ mensagem: 'Rota categorias funcionando' });
});

module.exports = router;