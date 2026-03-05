const Transacao = require('../models/Transacao');
const Salario = require('../models/Salario');

class ResumoService {

  async calcularSaldo(usuarioId) {

    const salarios = await Salario.find({ usuario: usuarioId });
    const transacoes = await Transacao.find({ usuario: usuarioId });

    let saldo = 0;

    salarios.forEach(s => {
      saldo += Number(s.valor);
    });

    transacoes.forEach(t => {
      if (t.tipo === 'entrada') {
        saldo += Number(t.valor);
      } else if (t.tipo === 'saida') {
        saldo -= Number(t.valor);
      }
    });

    return saldo;
  }

}

module.exports = new ResumoService();