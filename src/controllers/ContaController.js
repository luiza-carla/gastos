const ContaService = require('../services/ContaService');

class ContaController {
  // Cria nova conta
  async criar(req, res) {
    try {
      const dados = { ...req.body, usuario: req.user.id };
      const conta = await ContaService.criar(dados);
      res.status(201).json(conta);
    } catch (err) {
      res.status(400).json({ mensagem: err.message });
    }
  }

  // Lista todas as contas do usuário
  async listar(req, res) {
    try {
      const contas = await ContaService.listar(req.user.id);
      res.json(contas);
    } catch (err) {
      res.status(400).json({ mensagem: err.message });
    }
  }

  // Atualiza conta existente
  async atualizar(req, res) {
    try {
      const conta = await ContaService.atualizar(req.params.id, req.body);
      res.json(conta);
    } catch (err) {
      res.status(400).json({ mensagem: err.message });
    }
  }

  // Deleta uma conta
  async deletar(req, res) {
    try {
      await ContaService.deletar(req.params.id, req.user.id);
      res.json({ mensagem: 'Conta deletada' });
    } catch (err) {
      res.status(400).json({ mensagem: err.message });
    }
  }
}

module.exports = new ContaController();