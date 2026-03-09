const Conta = require('../models/Conta');

class ContaService {
  // Cria nova conta
  async criar(dados) {
    return Conta.create(dados);
  }

  // Lista todas as contas do usuário
  async listar(usuarioId) {
    return Conta.find({ usuario: usuarioId }).sort({ createdAt: -1 });
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

  // Transfere valor entre contas do mesmo usuário
  async transferir(contaOrigemId, contaDestinoId, valor, usuarioId) {
    // Valida parâmetros
    if (!contaDestinoId || !valor || valor <= 0) {
      const erro = new Error('Conta destino e valor são obrigatórios');
      erro.statusCode = 400;
      throw erro;
    }

    // Busca ambas as contas
    const contaOrigem = await Conta.findOne({
      _id: contaOrigemId,
      usuario: usuarioId,
    });

    const contaDestino = await Conta.findOne({
      _id: contaDestinoId,
      usuario: usuarioId,
    });

    if (!contaOrigem) {
      const erro = new Error('Conta de origem não encontrada');
      erro.statusCode = 404;
      throw erro;
    }

    if (!contaDestino) {
      const erro = new Error('Conta de destino não encontrada');
      erro.statusCode = 404;
      throw erro;
    }

    if (contaOrigem.saldo < valor) {
      const erro = new Error('Saldo insuficiente na conta de origem');
      erro.statusCode = 400;
      throw erro;
    }

    // Realiza a transferência
    contaOrigem.saldo -= valor;
    contaDestino.saldo += valor;

    await contaOrigem.save();
    await contaDestino.save();

    return {
      mensagem: 'Transferência realizada com sucesso',
      contaOrigem,
      contaDestino,
    };
  }
}

module.exports = new ContaService();
