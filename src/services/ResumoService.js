const Transacao = require('../models/Transacao');
const Salario = require('../models/Salario');
const Conta = require('../models/Conta');
const { somarCampo, totaisTransacoes, somaSaidas } = require('../utils/resumoHelpers');

class ResumoService {

  async gerarResumo(usuarioId) {
    const salarios = await Salario.find({ usuario: usuarioId });
    const contas = await Conta.find({ usuario: usuarioId });
    const transacoes = await Transacao.find({
      usuario: usuarioId,
      ativa: true,
      status: 'pago'
    });

    const totalSalarios = somarCampo(salarios, 'valor');
    const saldoContas = somarCampo(contas, 'saldo');

    const { entradas, saidas } = totaisTransacoes(transacoes);

    const saldo = totalSalarios + saldoContas;
    const saldoFinal = saldo + entradas - saidas;

    return {
      saldo,
      salarios: totalSalarios,
      saldoContas,
      entradas,
      saidas,
      saldoFinal
    };
  }

  async gerarProjecao(usuarioId) {
    const salarios = await Salario.find({ usuario: usuarioId });
    const contas = await Conta.find({ usuario: usuarioId });

    const pagas = await Transacao.find({
      usuario: usuarioId,
      ativa: true,
      status: 'pago'
    });

    const pendentes = await Transacao.find({
      usuario: usuarioId,
      ativa: true,
      status: 'pendente'
    });

    const totalSalarios = somarCampo(salarios, 'valor');
    const saldoContas = somarCampo(contas, 'saldo');

    const { entradas, saidas } = totaisTransacoes(pagas);
    const saidasPendentes = somaSaidas(pendentes);

    const saldoAtual = totalSalarios + saldoContas + entradas - saidas;
    const saldoProjetado = saldoAtual - saidasPendentes;

    return {
      saldoAtual,
      saldoProjetado,
      saidasPendentes
    };
  }

}

module.exports = new ResumoService();