const SalarioService = require('../services/SalarioService');

class SalarioController {

  async criar(req, res) {
    try {
      const salario = await SalarioService.criar(req.body, req.user.id);
      res.status(201).json(salario);
    } catch (err) {
      res.status(400).json({ mensagem: err.message });
    }
  }

  async listar(req, res) {
    try {
      const salarios = await SalarioService.listar(req.user.id);
      res.json(salarios);
    } catch (err) {
      res.status(400).json({ mensagem: err.message });
    }
  }

  async atualizar(req, res) {
    try {
      const salario = await SalarioService.atualizar(req.params.id, req.body, req.user.id);
      res.json(salario);
    } catch (err) {
      res.status(400).json({ mensagem: err.message });
    }
  }

  async deletar(req, res) {
    try {
      await SalarioService.deletar(req.params.id, req.user.id);
      res.json({ mensagem: 'Salário deletado' });
    } catch (err) {
      res.status(400).json({ mensagem: err.message });
    }
  }

}

module.exports = new SalarioController();