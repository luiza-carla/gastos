const Transacao = require('../models/Transacao');
const Salario = require('../models/Salario');
const Conta = require('../models/Conta');
const mongoose = require('mongoose');

class ResumoController {

  async obterResumo(req, res) {
    try {
      const usuarioId = new mongoose.Types.ObjectId(req.user.id);

      const contas = await Conta.find({ usuario: usuarioId, ativa: true });

      const saldoPorConta = contas.map(c => ({
        id: c._id.toString(),
        nome: c.nome,
        tipo: c.tipo,
        saldo: c.saldo
      }));

      const salarios = await Salario.aggregate([
        { $match: { usuario: usuarioId } },
        { $group: { _id: null, total: { $sum: "$valor" } } }
      ]);
      const totalSalarios = salarios[0]?.total || 0;

      const transacoes = await Transacao.find({ usuario: usuarioId });

      let totalEntradas = 0;
      let totalSaidas = 0;

      transacoes.forEach(t => {
        const contaIndex = saldoPorConta.findIndex(c => c.id === t.conta?.toString());
        if (t.tipo === 'entrada') {
          totalEntradas += t.valor;
          if (contaIndex >= 0) saldoPorConta[contaIndex].saldo += t.valor;
        }
        if (t.tipo === 'saida') {
          totalSaidas += t.valor;
          if (contaIndex >= 0) saldoPorConta[contaIndex].saldo -= t.valor;
        }
      });

      const saldoContas = saldoPorConta.reduce((acc, c) => acc + c.saldo, 0);
      const saldo = saldoContas + totalSalarios;

      res.json({
        saldoContas,
        saldoPorConta,
        salarios: totalSalarios,
        entradas: totalEntradas,
        saidas: totalSaidas,
        saldo
      });

    } catch (erro) {
      res.status(500).json({ mensagem: erro.message });
    }
  }

}

module.exports = new ResumoController();