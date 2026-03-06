const Salario = require('../models/Salario');

class SalarioController {

  async listar(req, res) {
    try {
      const salarios = await Salario.find({ usuario: req.user.id })
        .populate('conta', 'nome tipo');
      res.json(salarios);
    } catch (err) {
      res.status(400).json({ mensagem: err.message });
    }
  }

  async criar(req, res) {
    try {
      const salario = await Salario.create({ ...req.body, usuario: req.user.id });
      res.status(201).json(salario);
    } catch (err) {
      res.status(400).json({ mensagem: err.message });
    }
  }

  async atualizar(req, res) {
    try {
      const salario = await Salario.findOneAndUpdate(
        { _id: req.params.id, usuario: req.user.id },
        req.body,
        { new: true }
      ).populate('conta', 'nome tipo');
      res.json(salario);
    } catch (err) {
      res.status(400).json({ mensagem: err.message });
    }
  }

  async deletar(req, res) {
    try {
      await Salario.deleteOne({ _id: req.params.id, usuario: req.user.id });
      res.json({ mensagem: 'Salário deletado' });
    } catch (err) {
      res.status(400).json({ mensagem: err.message });
    }
  }

}

module.exports = new SalarioController();