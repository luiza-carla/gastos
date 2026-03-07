const Transacao = require('../models/Transacao');

class TransacaoService {

  // Cria nova transação
  async criar(dados, usuarioId) {
    const transacao = await Transacao.create({
      ...dados,
      usuario: usuarioId
    });
    return transacao;
  }

  // Lista todas as transações do usuário com dados relacionados
  async listar(usuarioId) {
    return Transacao.find({ usuario: usuarioId })
      .populate('conta', 'nome tipo')     
      .populate('categoria', 'nome tipo cor')
      .populate('tags', 'nome cor')
      .select('-__v');
  }

  // Atualiza transação existente
  async atualizar(id, dados, usuarioId) {
    const transacao = await Transacao.findOneAndUpdate(
      { _id: id, usuario: usuarioId },
      dados,
      { returnDocument: 'after' }
    );
    if (!transacao) throw new Error('Transação não encontrada');
    return transacao;
  }

  // Deleta transação
  async deletar(id, usuarioId) {
    const transacao = await Transacao.findOneAndDelete({ _id: id, usuario: usuarioId });
    if (!transacao) throw new Error('Transação não encontrada');
    return transacao;
  }

}

module.exports = new TransacaoService();