const Transacao = require('../models/Transacao');

class TransacaoService {
  // Cria nova transação
  async criar(dados, usuarioId) {
    return Transacao.create({
      ...dados,
      usuario: usuarioId,
    });
  }

  // Lista todas as transações do usuário com dados relacionados
  async listar(usuarioId) {
    return Transacao.find({ usuario: usuarioId })
      .sort({ data: -1, createdAt: -1 })
      .populate('conta', 'nome tipo')
      .populate('categoria', 'nome tipo cor')
      .select('-__v');
  }

  // Atualiza transação existente
  async atualizar(id, dados, usuarioId) {
    const transacao = await Transacao.findOneAndUpdate(
      { _id: id, usuario: usuarioId },
      dados,
      { returnDocument: 'after' }
    );

    if (!transacao) {
      const erro = new Error('Transação não encontrada');
      erro.statusCode = 404;
      throw erro;
    }

    return transacao;
  }

  // Deleta transação
  async deletar(id, usuarioId) {
    const transacao = await Transacao.findOneAndDelete({
      _id: id,
      usuario: usuarioId,
    });

    if (!transacao) {
      const erro = new Error('Transação não encontrada');
      erro.statusCode = 404;
      throw erro;
    }

    return transacao;
  }
}

module.exports = new TransacaoService();
