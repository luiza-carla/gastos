const Transacao = require('../models/Transacao');
const Categoria = require('../models/Categoria');
const Conta = require('../models/Conta');
const { somarCampo, totaisTransacoes, somaSaidas } = require('../utils/resumoHelpers');

class ResumoService {

  // Calcula data de vencimento de salário no mês
  calcularDataVencimentoNoMes(transacaoSalario, referencia) {
    const ano = referencia.getFullYear();
    const mes = referencia.getMonth();
    const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();
    const diaRecebimento = transacaoSalario.diaRecebimento || 5;
    const diaVencimento = Math.min(diaRecebimento, ultimoDiaDoMes);

    return new Date(ano, mes, diaVencimento, 0, 0, 0, 0);
  }

  // Valida se salário está ativo na data de vencimento
  salarioEstaValidoNoVencimento(transacaoSalario, dataVencimento) {
    // Transação de salário está ativa se ativa === true
    return transacaoSalario.ativa;
  }

  // Calcula total de salários que já venceram até hoje
  calcularSalariosDevidosAteHoje(transacoesSalario, hoje) {
    return transacoesSalario
      .filter((salario) => {
        const dataVencimento = this.calcularDataVencimentoNoMes(salario, hoje);
        const jaVenceuNoMes = dataVencimento <= hoje;
        const validoNoVencimento = this.salarioEstaValidoNoVencimento(salario, dataVencimento);

        return jaVenceuNoMes && validoNoVencimento;
      })
      .reduce((total, salario) => total + (salario.valor || 0), 0);
  }

  // Gera resumo financeiro atual do usuário
  async gerarResumo(usuarioId) {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1, 0, 0, 0, 0);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999);

    // Busca a categoria "Salário"
    const categoriaSalario = await Categoria.findOne({ nome: 'Salário' });

    // Busca transações de salário recorrentes (configuradas como salário)
    const salarios = categoriaSalario 
      ? await Transacao.find({ 
          usuario: usuarioId, 
          categoria: categoriaSalario._id,
          ativa: true
        })
      : [];

    const contas = await Conta.find({ usuario: usuarioId });
    
    // Busca transações do mês EXCLUINDO salários (para não duplicar)
    const filtroTransacoes = {
      usuario: usuarioId,
      ativa: true,
      status: 'pago',
      data: {
        $gte: inicioMes,
        $lte: fimMes
      }
    };

    // Exclui categoria Salário das transações normais
    if (categoriaSalario) {
      filtroTransacoes.categoria = { $ne: categoriaSalario._id };
    }

    const transacoesMes = await Transacao.find(filtroTransacoes);

    // Calcula salários devidos até hoje
    const salariosDevidosAteHoje = this.calcularSalariosDevidosAteHoje(salarios, hoje);
    
    // Calcula quanto dos salários devidos já foi processado neste mês
    const salariosProcessadosNoMes = salarios
      .filter(s => {
        const ultimoProc = s.dataUltimoProcessamento;
        return ultimoProc && new Date(ultimoProc) >= inicioMes;
      })
      .reduce((total, s) => total + s.valor, 0);

    const salariosPendentesLancamento = Math.max(0, salariosDevidosAteHoje - salariosProcessadosNoMes);
    const saldoContas = somarCampo(contas, 'saldo');

    // Calcula entradas e saídas do mês (SEM incluir salários)
    const { entradas, saidas } = totaisTransacoes(transacoesMes);

    // Saldo = saldo das contas + salários pendentes de processamento
    const saldo = saldoContas + salariosPendentesLancamento;
    const saldoFinal = saldoContas + salariosPendentesLancamento;

    return {
      saldo,
      salarios: salariosDevidosAteHoje,
      saldoContas,
      entradas,
      saidas,
      saldoFinal
    };
  }

  // Gera projeção financeira considerando transações pendentes
  async gerarProjecao(usuarioId) {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1, 0, 0, 0, 0);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999);

    // Busca a categoria "Salário"
    const categoriaSalario = await Categoria.findOne({ nome: 'Salário' });

    // Busca transações de salário recorrentes
    const salarios = categoriaSalario
      ? await Transacao.find({ 
          usuario: usuarioId, 
          categoria: categoriaSalario._id,
          ativa: true
        })
      : [];

    const contas = await Conta.find({ usuario: usuarioId });

    // Busca pendentes EXCLUINDO salários (salários têm tratamento separado)
    const filtroPendentes = {
      usuario: usuarioId,
      ativa: true,
      status: 'pendente'
    };

    if (categoriaSalario) {
      filtroPendentes.categoria = { $ne: categoriaSalario._id };
    }

    const pendentes = await Transacao.find(filtroPendentes);

    const salariosDevidosAteHoje = this.calcularSalariosDevidosAteHoje(salarios, hoje);
    
    // Calcula quanto dos salários devidos já foi processado neste mês
    const salariosProcessadosNoMes = salarios
      .filter(s => {
        const ultimoProc = s.dataUltimoProcessamento;
        return ultimoProc && new Date(ultimoProc) >= inicioMes;
      })
      .reduce((total, s) => total + s.valor, 0);

    const salariosPendentesLancamento = Math.max(0, salariosDevidosAteHoje - salariosProcessadosNoMes);

    const saldoContas = somarCampo(contas, 'saldo');
    const saidasPendentes = somaSaidas(pendentes);

    // O saldo atual já inclui todas as transações pagas + salários pendentes
    const saldoAtual = saldoContas + salariosPendentesLancamento;
    const saldoProjetado = saldoAtual - saidasPendentes;

    return {
      saldoAtual,
      saldoProjetado,
      saidasPendentes
    };
  }

}

module.exports = new ResumoService();