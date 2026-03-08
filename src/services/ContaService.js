const Conta = require('../models/Conta');

class ContaService {
  // Cria nova conta
  async criar(dados) {
    return Conta.create(dados);
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
    const transCount = await Transacao.countDocuments({
      conta: id,
      usuario: usuarioId,
    });
    if (transCount > 0) {
      const erro = new Error(
        'Não é possível apagar a conta pois existem transações ou salários associados.'
      );
      erro.statusCode = 400;
      throw erro;
    }

    return Conta.findByIdAndDelete(id);
  }
}

module.exports = new ContaService();
