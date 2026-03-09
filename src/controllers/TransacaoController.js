const Transacao = require('../models/Transacao');
const Conta = require('../models/Conta');
const CarteiraService = require('../services/CarteiraService');

function criarErro(statusCode, mensagem) {
  const erro = new Error(mensagem);
  erro.statusCode = statusCode;
  return erro;
}

async function buscarContaDoUsuario(contaId, usuarioId) {
  if (!contaId) {
    throw criarErro(400, 'Conta é obrigatória para transações em conta');
  }

  const contaObj = await Conta.findOne({
    _id: contaId,
    usuario: usuarioId,
  });

  if (!contaObj) {
    throw criarErro(404, 'Conta não encontrada');
  }

  return contaObj;
}

async function ajustarSaldoConta(contaId, usuarioId, delta) {
  const contaObj = await buscarContaDoUsuario(contaId, usuarioId);
  contaObj.saldo += delta;
  await contaObj.save();
}

async function aplicarMovimento(transacao, usuarioId) {
  const valor = Number(transacao.valor || 0);
  const multiplicador = transacao.tipo === 'entrada' ? 1 : -1;
  const delta = multiplicador * valor;

  if (transacao.fonteSaldo === 'carteira') {
    await CarteiraService.adicionarSaldo(usuarioId, delta);
    return;
  }

  await ajustarSaldoConta(transacao.conta, usuarioId, delta);
}

async function reverterMovimento(transacao, usuarioId) {
  const valor = Number(transacao.valor || 0);
  const multiplicador = transacao.tipo === 'entrada' ? -1 : 1;
  const delta = multiplicador * valor;

  if (transacao.fonteSaldo === 'carteira') {
    await CarteiraService.adicionarSaldo(usuarioId, delta);
    return;
  }

  await ajustarSaldoConta(transacao.conta, usuarioId, delta);
}

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

    const fonteSaldo = conta === 'carteira' ? 'carteira' : 'conta';
    const statusFinal = status || 'pago';

    if (fonteSaldo === 'conta' && !conta) {
      throw criarErro(400, 'Conta é obrigatória');
    }

    if (
      fonteSaldo === 'carteira' &&
      statusFinal === 'pago' &&
      tipo === 'saida'
    ) {
      const carteira = await CarteiraService.obterOuCriar(req.user.id);
      if (Number(valor) > carteira.saldo) {
        throw criarErro(400, 'Saldo insuficiente na carteira');
      }
    }

    // Cria nova transação no banco
    const novaTransacao = await Transacao.create({
      usuario: req.user.id,
      conta: fonteSaldo === 'carteira' ? undefined : conta,
      fonteSaldo,
      titulo,
      valor,
      tipo,
      categoria,
      data: data || Date.now(),
      status: statusFinal,
      recorrencia: recorrencia || 'nenhuma',
      parcelamento: {
        totalParcelas: parcelamento?.totalParcelas || 1,
        parcelaAtual: parcelamento?.parcelaAtual || 1,
      },
      tags: tags || [],
      tipoDespesa: tipo === 'saida' ? tipoDespesa : undefined,
    });

    // Atualiza saldo da conta se transação foi marcada como paga
    if (statusFinal === 'pago') {
      await aplicarMovimento(novaTransacao, req.user.id);
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
    if (updateData.conta === 'carteira') {
      updateData.fonteSaldo = 'carteira';
      updateData.conta = undefined;
    } else if (Object.prototype.hasOwnProperty.call(updateData, 'conta')) {
      updateData.fonteSaldo = 'conta';
    }

    // Remove tipoDespesa se tipo não for saída
    if (updateData.tipo !== 'saida') {
      delete updateData.tipoDespesa;
    }

    // Reverte saldo anterior se transação estava paga
    if (transacaoAntiga.status === 'pago') {
      await reverterMovimento(transacaoAntiga, req.user.id);
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
      await aplicarMovimento(transacao, req.user.id);
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
      await reverterMovimento(transacao, req.user.id);
    }

    // Remove transação do banco
    await Transacao.findByIdAndDelete(transacao._id);

    res.json({ mensagem: 'Transação deletada' });
  }
}

module.exports = new TransacaoController();
