const Transacao = require('../models/Transacao');

class TransacaoController {

  async criar(req, res) {
    try {

      const {
        conta,
        titulo,
        valor,
        tipo,
        categoria,
        data,
        status,
        recorrencia,
        parcelamento,
        tags,
        tipoDespesa
      } = req.body;

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
        parcelamento: {
          totalParcelas: parcelamento?.totalParcelas || 1,
          parcelaAtual: parcelamento?.parcelaAtual || 1
        },
        tags: tags || [],
        tipoDespesa: tipo === 'saida' ? tipoDespesa : undefined
      });

      const transacaoCompleta = await Transacao.findById(novaTransacao._id)
        .populate('conta', 'nome tipo')
        .populate('categoria', 'nome cor tipo');

      res.status(201).json(transacaoCompleta);

    } catch (err) {
      res.status(400).json({ mensagem: err.message });
    }
  }

  async listar(req, res) {
    try {

      const transacoes = await Transacao.find({ usuario: req.user.id })
        .populate('conta', 'nome tipo')
        .populate('categoria', 'nome cor tipo')
        .sort({ data: -1 });

      res.json(transacoes);

    } catch (err) {
      res.status(500).json({ mensagem: err.message });
    }
  }

  async atualizar(req, res) {
    try {
      const updateData = { ...req.body };
      if (updateData.tipo !== 'saida') {
        delete updateData.tipoDespesa;
      }

      const transacao = await Transacao.findOneAndUpdate(
        { _id: req.params.id, usuario: req.user.id },
        updateData,
        { new: true }
      )
        .populate('conta', 'nome tipo')
        .populate('categoria', 'nome cor tipo');

      if (!transacao) {
        return res.status(404).json({ mensagem: 'Transação não encontrada' });
      }

      res.json(transacao);

    } catch (err) {
      res.status(400).json({ mensagem: err.message });
    }
  }

  async deletar(req, res) {
    try {

      const transacao = await Transacao.findOneAndDelete({
        _id: req.params.id,
        usuario: req.user.id
      });

      if (!transacao) {
        return res.status(404).json({ mensagem: 'Transação não encontrada' });
      }

      res.json({ mensagem: 'Transação deletada' });

    } catch (err) {
      res.status(500).json({ mensagem: err.message });
    }
  }

}

module.exports = new TransacaoController();