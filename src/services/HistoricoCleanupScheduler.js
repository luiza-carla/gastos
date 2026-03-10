const cron = require('node-cron');
const HistoricoService = require('./HistoricoService');
const logger = require('../utils/logger');

const DIAS_CICLO = Number(process.env.HISTORICO_CICLO_DIAS || 30);
const DIAS_RETENCAO = Number(process.env.HISTORICO_RETENCAO_DIAS || 30);

class HistoricoCleanupScheduler {
  constructor() {
    this.job = null;
  }

  iniciar() {
    // Executa diariamente às 00:20
    // Verifica usuários que passaram X dias desde a última limpeza
    this.job = cron.schedule('20 0 * * *', async () => {
      await this.executarLimpeza();
    });

    logger.info(
      `Agendador de limpeza de historico iniciado (ciclo: ${DIAS_CICLO} dias, retencao: ${DIAS_RETENCAO} dias)`,
      'HistoricoCleanup'
    );
  }

  parar() {
    if (!this.job) return;
    this.job.stop();
    logger.info('Agendador de limpeza de historico parado', 'HistoricoCleanup');
  }

  async executarLimpeza(diasCiclo = DIAS_CICLO, diasRetencao = DIAS_RETENCAO) {
    try {
      const removidos = await HistoricoService.limparPorCiclo(
        diasCiclo,
        diasRetencao
      );
      logger.info(
        `Limpeza concluida: ${removidos} registro(s) removido(s)`,
        'HistoricoCleanup'
      );
    } catch (error) {
      logger.error(
        'Falha na limpeza automatica do historico',
        'HistoricoCleanup',
        error
      );
    }
  }
}

module.exports = new HistoricoCleanupScheduler();
