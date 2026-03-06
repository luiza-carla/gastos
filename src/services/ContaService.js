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

  async deletar(id, usuarioId) {
    const Transacao = require('../models/Transacao');
    const Salario = require('../models/Salario');

    const transCount = await Transacao.countDocuments({ conta: id, usuario: usuarioId });
    if (transCount > 0) {
      throw new Error('Não é possível apagar a conta pois existem transações associadas');
    }

    const salCount = await Salario.countDocuments({ conta: id, usuario: usuarioId });
    if (salCount > 0) {
      throw new Error('Não é possível apagar a conta pois existem salários associados');
    }

    return Conta.findByIdAndDelete(id);
  }
}

module.exports = new ContaService();