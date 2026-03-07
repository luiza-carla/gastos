const cron = require('node-cron');
const Transacao = require('../models/Transacao');
const Categoria = require('../models/Categoria');
const Conta = require('../models/Conta');

// Serviço responsável por agendar e processar salários automaticamente
class SalarioScheduler {
  constructor() {
    this.job = null;
  }

  // Inicia o agendador para verificar salários diariamente
  iniciar() {
    // Executa agenda de processamento diário
    this.job = cron.schedule('1 0 * * *', async () => {
      console.log('Verificando salários para processar...');
      await this.processarSalariosDodia();
    });

    console.log('Agendador de salários iniciado');
    
    // Executa imediatamente ao iniciar (útil para testes/desenvolvimento)
    this.processarSalariosDodia();
  }

  // Para o agendador em execução
  parar() {
    if (this.job) {
      this.job.stop();
      console.log('Agendador de salários parado');
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
        console.log('Categoria Salário não encontrada!');
        return;
      }

      // Busca transações de salário recorrentes que devem ser processadas hoje
      const salarios = await Transacao.find({
        categoria: categoriaSalario._id,
        ativa: true,
        frequencia: 'mensal',
        diaRecebimento: diaAtual,
        conta: { $exists: true, $ne: null }
      }).populate('usuario').populate('conta');

      if (salarios.length === 0) {
        console.log(`ℹNenhum salário para processar no dia ${diaAtual}`);
        return;
      }

      console.log(`Processando ${salarios.length} salário(s)...`);

      let processados = 0;
      let erros = 0;

      for (const salario of salarios) {
        try {
          // Verifica se já foi processado este mês
          const ultimoProcessamento = salario.dataUltimoProcessamento;
          const jaProcessadoEsteMes = ultimoProcessamento && new Date(ultimoProcessamento) >= inicioMes;

          if (jaProcessadoEsteMes) {
            console.log(`⏭Salário ${salario._id} já processado este mês`);
            continue;
          }

          // Atualiza o saldo da conta
          const conta = await Conta.findById(salario.conta._id);
          if (conta) {
            conta.saldo += salario.valor;
            await conta.save();
          }

          // Atualiza a data de último processamento
          salario.dataUltimoProcessamento = hoje;
          await salario.save();

          processados++;
          console.log(`Salário processado: R$ ${salario.valor} para usuário ${salario.usuario._id}`);

        } catch (erro) {
          erros++;
          console.error(`Erro ao processar salário ${salario._id}:`, erro.message);
        }
      }

      console.log(`Processamento concluído: ${processados} sucesso, ${erros} erros`);

    } catch (erro) {
      console.error('Erro ao processar salários do dia:', erro);
    }
  }

  // Retorna o nome do mês em português
  obterNomeMes(data) {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[data.getMonth()];
  }

  // Força o processamento manual de salários
  async processarManualmente() {
    console.log('🔧 Processamento manual iniciado...');
    await this.processarSalariosDodia();
  }
}

module.exports = new SalarioScheduler();
