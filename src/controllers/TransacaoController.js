const Transacao = require('../models/Transacao');
const Conta = require('../models/Conta');

class TransacaoController {
  // Cria nova transação e atualiza saldo da conta
  async criar(req, res) {
    // Desestrutura campos da requisição
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
      tipoDespesa,
    } = req.body;

    // Cria nova transação no banco
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
        parcelaAtual: parcelamento?.parcelaAtual || 1,
      },
      tags: tags || [],
      tipoDespesa: tipo === 'saida' ? tipoDespesa : undefined,
    });

    // Atualiza saldo da conta se transação foi marcada como paga
    if (status === 'pago' || !status) {
      const contaObj = await Conta.findById(conta);
      if (contaObj) {
        if (tipo === 'entrada') {
          contaObj.saldo += valor;
        } else if (tipo === 'saida') {
          contaObj.saldo -= valor;
        }
        await contaObj.save();
      }
    }

    // Recupera transação completa com relações populadas
    const transacaoCompleta = await Transacao.findById(novaTransacao._id)
      .populate('conta', 'nome tipo')
      .populate('categoria', 'nome cor tipo');

    res.status(201).json(transacaoCompleta);
  }

  // Lista todas as transações do usuário (excluindo salários)
  async listar(req, res) {
    // Busca categoria salário para excluir das transações
    const Categoria = require('../models/Categoria');

    const categoriaSalario = await Categoria.findOne({ nome: 'Salário' });

    // Monta filtro para excluir salários das transações
    const filtro = {
      usuario: req.user.id,
    };

    if (categoriaSalario) {
      filtro.categoria = { $ne: categoriaSalario._id };
    }

    const transacoes = await Transacao.find(filtro)
      .populate('conta', 'nome tipo')
      .populate('categoria', 'nome cor tipo')
      .sort({ data: -1 });

    res.json(transacoes);
  }

  // Atualiza transação existente e reajusta saldos de contas
  async atualizar(req, res) {
    // Busca transação antiga para comparar alterações
    const transacaoAntiga = await Transacao.findOne({
      _id: req.params.id,
      usuario: req.user.id,
    });

    if (!transacaoAntiga) {
      return res.status(404).json({ mensagem: 'Transação não encontrada' });
    }

    const updateData = { ...req.body };
    // Remove tipoDespesa se tipo não for saída
    if (updateData.tipo !== 'saida') {
      delete updateData.tipoDespesa;
    }

    // Reverte saldo anterior se transação estava paga
    if (transacaoAntiga.status === 'pago') {
      const contaObj = await Conta.findById(transacaoAntiga.conta);
      if (contaObj) {
        if (transacaoAntiga.tipo === 'entrada') {
          contaObj.saldo -= transacaoAntiga.valor;
        } else if (transacaoAntiga.tipo === 'saida') {
          contaObj.saldo += transacaoAntiga.valor;
        }
        await contaObj.save();
      }
    }

    // Atualiza transação no banco
    const transacao = await Transacao.findOneAndUpdate(
      { _id: req.params.id, usuario: req.user.id },
      updateData,
      { returnDocument: 'after' }
    )
      .populate('conta', 'nome tipo')
      .populate('categoria', 'nome cor tipo');

    if (transacao.status === 'pago') {
      const contaObj = await Conta.findById(transacao.conta);
      if (contaObj) {
        if (transacao.tipo === 'entrada') {
          contaObj.saldo += transacao.valor;
        } else if (transacao.tipo === 'saida') {
          contaObj.saldo -= transacao.valor;
        }
        await contaObj.save();
      }
    }

    res.json(transacao);
  }

  // Deleta transação e reverte saldo da conta
  async deletar(req, res) {
    // Busca transação antes de deletar
    const transacao = await Transacao.findOne({
      _id: req.params.id,
      usuario: req.user.id,
    });

    if (!transacao) {
      return res.status(404).json({ mensagem: 'Transação não encontrada' });
    }

    // Reverte saldo da conta se transação estava paga
    if (transacao.status === 'pago') {
      const contaObj = await Conta.findById(transacao.conta);
      if (contaObj) {
        if (transacao.tipo === 'entrada') {
          contaObj.saldo -= transacao.valor;
        } else if (transacao.tipo === 'saida') {
          contaObj.saldo += transacao.valor;
        }
        await contaObj.save();
      }
    }

    // Remove transação do banco
    await Transacao.findByIdAndDelete(transacao._id);

    res.json({ mensagem: 'Transação deletada' });
  }
}

module.exports = new TransacaoController();
