const Carteira = require('../models/Carteira');
const Conta = require('../models/Conta');

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
      const erro = new Error('Valor inválido');
      erro.statusCode = 400;
      throw erro;
    }

    let carteira = await this.obterOuCriar(usuarioId);
    const novoSaldo = carteira.saldo + valor;

    if (novoSaldo < 0) {
      const erro = new Error('Saldo insuficiente na carteira');
      erro.statusCode = 400;
      throw erro;
    }

    carteira.saldo = novoSaldo;
    await carteira.save();

    return carteira;
  }

  // Transfere entre carteira e conta
  async transferir(usuarioId, contaId, valor, direcao) {
    if (!contaId || !valor || valor <= 0) {
      const erro = new Error('Conta e valor são obrigatórios');
      erro.statusCode = 400;
      throw erro;
    }

    if (!['carteira-para-conta', 'conta-para-carteira'].includes(direcao)) {
      const erro = new Error('Direção inválida');
      erro.statusCode = 400;
      throw erro;
    }

    // Obtém carteira e conta
    const carteira = await this.obterOuCriar(usuarioId);
    const conta = await Conta.findOne({
      _id: contaId,
      usuario: usuarioId,
    });

    if (!conta) {
      const erro = new Error('Conta não encontrada');
      erro.statusCode = 404;
      throw erro;
    }

    // Valida saldos
    if (direcao === 'carteira-para-conta' && carteira.saldo < valor) {
      const erro = new Error('Saldo insuficiente na carteira');
      erro.statusCode = 400;
      throw erro;
    }

    if (direcao === 'conta-para-carteira' && conta.saldo < valor) {
      const erro = new Error('Saldo insuficiente na conta');
      erro.statusCode = 400;
      throw erro;
    }

    // Executa transferência
    if (direcao === 'carteira-para-conta') {
      carteira.saldo -= valor;
      conta.saldo += valor;
    } else {
      carteira.saldo += valor;
      conta.saldo -= valor;
    }

    await carteira.save();
    await conta.save();

    return {
      carteira,
      conta,
      mensagem: 'Transferência realizada com sucesso',
    };
  }
}

module.exports = new CarteiraService();
