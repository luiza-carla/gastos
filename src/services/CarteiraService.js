const Carteira = require('../models/Carteira');
const Conta = require('../models/Conta');
const HistoricoService = require('./HistoricoService');
const { criarErro } = require('../utils/errorHelpers');

class CarteiraService {
  // Obtém ou cria carteira do usuário
  async obterOuCriar(usuarioId) {
    let carteira = await Carteira.findOne({ usuario: usuarioId });

    if (!carteira) {
      carteira = await Carteira.create({
        usuario: usuarioId,
        saldo: 0,
      });
    }

    return carteira;
  }

  // Adiciona ou remove valor da carteira
  async adicionarSaldo(usuarioId, valor) {
    if (!valor || valor === 0) {
      throw criarErro(400, 'Valor inválido');
    }

    let carteira = await this.obterOuCriar(usuarioId);
    const novoSaldo = carteira.saldo + valor;

    if (novoSaldo < 0) {
      throw criarErro(400, 'Saldo insuficiente na carteira');
    }

    carteira.saldo = novoSaldo;
    await carteira.save();

    return carteira;
  }

  // Transfere entre carteira e conta
  async transferir(usuarioId, contaId, valor, direcao) {
    if (!contaId || !valor || valor <= 0) {
      throw criarErro(400, 'Conta e valor são obrigatórios');
    }

    if (!['carteira-para-conta', 'conta-para-carteira'].includes(direcao)) {
      throw criarErro(400, 'Direção inválida');
    }

    // Obtém carteira e conta
    const carteira = await this.obterOuCriar(usuarioId);
    const conta = await Conta.findOne({
      _id: contaId,
      usuario: usuarioId,
    });

    if (!conta) {
      throw criarErro(404, 'Conta não encontrada');
    }

    // Valida saldos
    if (direcao === 'carteira-para-conta' && carteira.saldo < valor) {
      throw criarErro(400, 'Saldo insuficiente na carteira');
    }

    if (direcao === 'conta-para-carteira' && conta.saldo < valor) {
      throw criarErro(400, 'Saldo insuficiente na conta');
    }

    // Executa transferência
    const saldoCarteiraAnterior = carteira.saldo;
    const saldoContaAnterior = conta.saldo;

    if (direcao === 'carteira-para-conta') {
      carteira.saldo -= valor;
      conta.saldo += valor;
    } else {
      carteira.saldo += valor;
      conta.saldo -= valor;
    }

    await carteira.save();
    await conta.save();

    // Registra transferência no histórico
    await HistoricoService.registrar({
      usuario: usuarioId,
      entidade: 'carteira',
      entidadeId: carteira._id,
      acao: 'transferencia',
      descricao: HistoricoService.formatarDescricaoTransferenciaCarteira(
        conta,
        valor,
        direcao
      ),
      dadosAnteriores: {
        carteiraSaldo: saldoCarteiraAnterior,
        contaId: conta._id,
        contaSaldo: saldoContaAnterior,
        direcao,
      },
      dadosNovos: {
        carteiraSaldo: carteira.saldo,
        contaId: conta._id,
        contaSaldo: conta.saldo,
        direcao,
      },
    });

    return {
      carteira,
      conta,
      mensagem: 'Transferência realizada com sucesso',
    };
  }
}

module.exports = new CarteiraService();
