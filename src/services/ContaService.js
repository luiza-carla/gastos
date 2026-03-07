const Conta = require('../models/Conta');

class ContaService {
  // Cria nova conta
  async criar(dados) {
    const conta = await Conta.create(dados);
    return conta;
  }

  // Lista todas as contas do usuário
  async listar(usuarioId) {
    return Conta.find({ usuario: usuarioId });
  }

  // Busca conta por ID
  async buscarPorId(id) {
    return Conta.findById(id);
  }

  // Atualiza dados de uma conta
  async atualizar(id, dados) {
    return Conta.findByIdAndUpdate(id, dados, { returnDocument: 'after' });
  }

  // Deleta conta se não houver transações associadas
  async deletar(id, usuarioId) {
    const Transacao = require('../models/Transacao');

    // Valida se existem transações na conta
    const transCount = await Transacao.countDocuments({ conta: id, usuario: usuarioId });
    if (transCount > 0) {
      throw new Error('Não é possível apagar a conta pois existem transações ou salários associados.');
    }

    return Conta.findByIdAndDelete(id);
  }
}

module.exports = new ContaService();