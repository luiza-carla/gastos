const cron = require('node-cron');
const Transacao = require('../models/Transacao');
const Categoria = require('../models/Categoria');
const Conta = require('../models/Conta');
const Carteira = require('../models/Carteira');
const { formatarMoeda } = require('../utils/stringHelpers');
const logger = require('../utils/logger');

// Serviço responsável por agendar e processar salários automaticamente
class SalarioScheduler {
  constructor() {
    this.job = null;
  }

  // Inicia o agendador para verificar salários diariamente
  iniciar() {
    // Executa agenda de processamento diário
    this.job = cron.schedule('1 0 * * *', async () => {
      logger.info('Verificando salarios para processar', 'SalarioScheduler');
      await this.processarSalariosDodia();
    });

    logger.info('Agendador de salarios iniciado', 'SalarioScheduler');

    // Executa imediatamente ao iniciar (útil para testes/desenvolvimento)
    this.processarSalariosDodia();
  }

  // Para o agendador em execução
  parar() {
    if (this.job) {
      this.job.stop();
      logger.info('Agendador de salarios parado', 'SalarioScheduler');
    }
  }

  // Processa salários que devem ser creditados no dia
  async processarSalariosDodia() {
    try {
      const hoje = new Date();
      const diaAtual = hoje.getDate();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

      // Busca a categoria "Salário"
      const categoriaSalario = await Categoria.findOne({ nome: 'Salário' });

      if (!categoriaSalario) {
        logger.warn('Categoria Salario nao encontrada', 'SalarioScheduler');
        return;
      }

      // Busca transações de salário recorrentes que devem ser processadas hoje
      const salarios = await Transacao.find({
        categoria: categoriaSalario._id,
        ativa: true,
        frequencia: 'mensal',
        diaRecebimento: diaAtual,
        $or: [
          { fonteSaldo: 'carteira' },
          { conta: { $exists: true, $ne: null } },
        ],
      })
        .populate('usuario')
        .populate('conta');

      if (salarios.length === 0) {
        logger.info(
          `Nenhum salario para processar no dia ${diaAtual}`,
          'SalarioScheduler'
        );
        return;
      }

      logger.info(
        `Processando ${salarios.length} salario(s)`,
        'SalarioScheduler'
      );

      let processados = 0;
      let erros = 0;

      for (const salario of salarios) {
        try {
          // Verifica se já foi processado este mês
          const ultimoProcessamento = salario.dataUltimoProcessamento;
          const jaProcessadoEsteMes =
            ultimoProcessamento && new Date(ultimoProcessamento) >= inicioMes;

          if (jaProcessadoEsteMes) {
            logger.info(
              `Salario ${salario._id} ja processado neste mes`,
              'SalarioScheduler'
            );
            continue;
          }

          if (salario.fonteSaldo === 'carteira') {
            await Carteira.updateOne(
              { usuario: salario.usuario._id },
              { $inc: { saldo: Number(salario.valor) } },
              { upsert: true }
            );
          } else {
            // Atualiza o saldo da conta
            const conta = salario.conta
              ? await Conta.findById(salario.conta._id)
              : null;

            if (!conta) {
              logger.warn(
                `Salario ${salario._id} sem conta valida para processamento`,
                'SalarioScheduler'
              );
              continue;
            }

            conta.saldo += salario.valor;
            await conta.save();
          }

          // Atualiza a data de último processamento
          salario.dataUltimoProcessamento = hoje;
          salario.status = 'pago';
          await salario.save();

          processados++;
          logger.info(
            `Salario processado: ${formatarMoeda(salario.valor)} para usuario ${salario.usuario._id}`,
            'SalarioScheduler'
          );
        } catch (erro) {
          erros++;
          logger.error(
            `Erro ao processar salario ${salario._id}`,
            'SalarioScheduler',
            erro.message
          );
        }
      }

      logger.info(
        `Processamento concluido: ${processados} sucesso, ${erros} erros`,
        'SalarioScheduler'
      );
    } catch (erro) {
      logger.error(
        'Erro ao processar salarios do dia',
        'SalarioScheduler',
        erro
      );
    }
  }

  // Força o processamento manual de salários
  async processarManualmente() {
    logger.info('Processamento manual iniciado', 'SalarioScheduler');
    await this.processarSalariosDodia();
  }
}

module.exports = new SalarioScheduler();
