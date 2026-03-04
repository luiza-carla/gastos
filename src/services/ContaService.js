const Conta = require('../models/Conta');

class ContaService {
  async criar(dados) {
    const conta = await Conta.create(dados);
    return conta;
  }

  async listar(usuarioId) {
    return Conta.find({ usuario: usuarioId });
  }

  async buscarPorId(id) {
    return Conta.findById(id);
  }

  async atualizar(id, dados) {
    return Conta.findByIdAndUpdate(id, dados, { new: true });
  }

  async deletar(id) {
    return Conta.findByIdAndDelete(id);
  }
}

module.exports = new ContaService();