const Transacao = require('../models/Transacao');
const Conta = require('../models/Conta');
const Categoria = require('../models/Categoria');
const CarteiraService = require('../services/CarteiraService');
const HistoricoService = require('../services/HistoricoService');
const { criarErro } = require('../utils/errorHelpers');
const { registrarHistoricoDaRequisicao } = require('../utils/historicoHelpers');

const MENSAGEM_TRANSACAO_NAO_ENCONTRADA = 'Transação não encontrada';

function obterDeltaAplicadoCarteira(transacao) {
  if (!transacao || transacao.fonteSaldo !== 'carteira') {
    return 0;
  }

  if (transacao.status !== 'pago') {
    return 0;
  }

  const valor = Number(transacao.valor || 0);
  if (!valor) {
    return 0;
  }

  return transacao.tipo === 'entrada' ? valor : -valor;
}

async function validarCarteiraNaoNegativaEmAtualizacao(
  usuarioId,
  transacaoAntiga,
  updateData
) {
  const transacaoSimulada = {
    ...transacaoAntiga.toObject(),
    ...updateData,
  };

  const deltaAntigo = obterDeltaAplicadoCarteira(transacaoAntiga);
  const deltaNovo = obterDeltaAplicadoCarteira(transacaoSimulada);

  // Na atualização, primeiro desfazemos o movimento antigo e depois aplicamos o novo.
  const deltaLiquidoCarteira = -deltaAntigo + deltaNovo;

  if (deltaLiquidoCarteira >= 0) {
    return;
  }

  const carteira = await CarteiraService.obterOuCriar(usuarioId);
  if (Number(carteira.saldo || 0) + deltaLiquidoCarteira < 0) {
    throw criarErro(400, 'Saldo insuficiente na carteira');
  }
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

function aplicarPopulacaoTransacao(query) {
  return query
    .populate('conta', 'nome tipo')
    .populate('categoria', 'nome cor tipo');
}

async function buscarTransacaoDoUsuario(transacaoId, usuarioId) {
  return aplicarPopulacaoTransacao(
    Transacao.findOne({
      _id: transacaoId,
      usuario: usuarioId,
    })
  );
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
    const transacaoCompleta = await aplicarPopulacaoTransacao(
      Transacao.findById(novaTransacao._id)
    );

    // Registra no histórico
    await registrarHistoricoDaRequisicao(req, 'transacao', {
      entidadeId: novaTransacao._id,
      acao: 'criacao',
      descricao: HistoricoService.formatarDescricaoTransacao(
        'criacao',
        novaTransacao
      ),
      dadosNovos: novaTransacao.toObject(),
    });

    res.status(201).json(transacaoCompleta);
  }

  // Lista todas as transações do usuário (excluindo salários)
  async listar(req, res) {
    // Busca categoria salário para excluir das transações
    const categoriaSalario = await Categoria.findOne({ nome: 'Salário' });

    // Monta filtro para excluir salários das transações
    const filtro = {
      usuario: req.user.id,
    };

    if (categoriaSalario) {
      filtro.categoria = { $ne: categoriaSalario._id };
    }

    const transacoes = await aplicarPopulacaoTransacao(
      Transacao.find(filtro).sort({ data: -1 })
    );

    res.json(transacoes);
  }

  // Atualiza transação existente e reajusta saldos de contas
  async atualizar(req, res) {
    // Busca transação antiga para comparar alterações
    const transacaoAntiga = await buscarTransacaoDoUsuario(
      req.params.id,
      req.user.id
    );

    if (!transacaoAntiga) {
      throw criarErro(404, MENSAGEM_TRANSACAO_NAO_ENCONTRADA);
    }

    const updateData = { ...req.body };
    if (updateData.conta === 'carteira') {
      updateData.fonteSaldo = 'carteira';
      updateData.conta = undefined;
    } else if (Object.prototype.hasOwnProperty.call(updateData, 'conta')) {
      updateData.fonteSaldo = 'conta';
    }

    await validarCarteiraNaoNegativaEmAtualizacao(
      req.user.id,
      transacaoAntiga,
      updateData
    );

    // Remove tipoDespesa se tipo não for saída
    if (updateData.tipo !== 'saida') {
      delete updateData.tipoDespesa;
    }

    // Reverte saldo anterior se transação estava paga
    if (transacaoAntiga.status === 'pago') {
      await reverterMovimento(transacaoAntiga, req.user.id);
    }

    // Atualiza transação no banco
    const transacao = await aplicarPopulacaoTransacao(
      Transacao.findOneAndUpdate(
        { _id: req.params.id, usuario: req.user.id },
        updateData,
        { returnDocument: 'after' }
      )
    );

    if (transacao.status === 'pago') {
      await aplicarMovimento(transacao, req.user.id);
    }

    // Registra no histórico
    await registrarHistoricoDaRequisicao(req, 'transacao', {
      entidadeId: transacao._id,
      acao: 'edicao',
      descricao: HistoricoService.formatarDescricaoTransacao(
        'edicao',
        transacao
      ),
      dadosAnteriores: transacaoAntiga.toObject(),
      dadosNovos: transacao.toObject(),
    });

    res.json(transacao);
  }

  // Deleta transação e reverte saldo da conta
  async deletar(req, res) {
    // Busca transação antes de deletar
    const transacao = await buscarTransacaoDoUsuario(
      req.params.id,
      req.user.id
    );

    if (!transacao) {
      throw criarErro(404, MENSAGEM_TRANSACAO_NAO_ENCONTRADA);
    }

    // Reverte saldo da conta se transação estava paga
    if (transacao.status === 'pago') {
      await reverterMovimento(transacao, req.user.id);
    }

    // Remove transação do banco
    await Transacao.findByIdAndDelete(transacao._id);

    // Registra no histórico
    await registrarHistoricoDaRequisicao(req, 'transacao', {
      entidadeId: transacao._id,
      acao: 'delecao',
      descricao: HistoricoService.formatarDescricaoTransacao(
        'delecao',
        transacao
      ),
      dadosAnteriores: transacao.toObject(),
    });

    res.json({ mensagem: 'Transação deletada' });
  }
}

module.exports = new TransacaoController();
