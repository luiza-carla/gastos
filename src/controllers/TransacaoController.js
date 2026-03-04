const Transacao = require('../models/Transacao');

class TransacaoController {
async criar(req, res) {
  try {
    const { conta, titulo, valor, tipo, categoria, data, status, recorrencia, parcelamento, tags } = req.body;

    const novaTransacao = await Transacao.create({
      usuario: req.user.id,
      conta,
      titulo,
      valor,
      tipo,
      categoria,
      data: data || Date.now(),
      status: status || 'pago',
      recorrencia: recorrencia || 'nenhuma',
      parcelamento: parcelamento || { totalParcelas: 1, parcelaAtual: 1 },
      tags: tags || []
    });

    res.status(201).json(novaTransacao);
  } catch (err) {
    res.status(400).json({ mensagem: err.message });
  }
}

  async listar(req, res) {
    try {
      const transacoes = await Transacao.find({ usuario: req.user.id })
        .populate('conta', 'nome tipo')
        .populate('categoria', 'nome cor tipo');
      res.json(transacoes);
    } catch (err) {
      res.status(400).json({ mensagem: err.message });
    }
  }

  async atualizar(req, res) {
    try {
      const transacao = await Transacao.findOneAndUpdate(
        { _id: req.params.id, usuario: req.user.id },
        req.body,
        { new: true }
      );
      res.json(transacao);
    } catch (err) {
      res.status(400).json({ mensagem: err.message });
    }
  }

  async deletar(req, res) {
    try {
      await Transacao.findOneAndDelete({ _id: req.params.id, usuario: req.user.id });
      res.json({ mensagem: 'Transação deletada' });
    } catch (err) {
      res.status(400).json({ mensagem: err.message });
    }
  }
}

module.exports = new TransacaoController();