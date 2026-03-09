const Transacao = require('../models/Transacao');
const Categoria = require('../models/Categoria');
const Conta = require('../models/Conta');

class SalarioController {
  constructor() {
    this.listar = this.listar.bind(this);
    this.criar = this.criar.bind(this);
    this.atualizar = this.atualizar.bind(this);
    this.deletar = this.deletar.bind(this);
  }

  // Obtém primeira data do mês para uma data de referência
  obterInicioMes(dataReferencia = new Date()) {
    return new Date(
      dataReferencia.getFullYear(),
      dataReferencia.getMonth(),
      1,
      0,
      0,
      0,
      0
    );
  }

  // Verifica se salário já foi processado no mês atual
  salarioJaProcessadoNoMes(salario, dataReferencia = new Date()) {
    if (!salario || !salario.dataUltimoProcessamento) {
      return false;
    }

    return (
      new Date(salario.dataUltimoProcessamento) >=
      this.obterInicioMes(dataReferencia)
    );
  }

  // Verifica se salário deve ser processado na data informada
  salarioDeveSerProcessadoAgora(salario, dataReferencia = new Date()) {
    if (!salario || !salario.ativa || !salario.conta) {
      return false;
    }

    const diaRecebimento = Number(salario.diaRecebimento || 5);
    return diaRecebimento <= dataReferencia.getDate();
  }

  // Extrai ID de ObjectId (mongo) de diferentes formatos de referência
  extrairContaId(contaRef) {
    if (!contaRef) {
      return null;
    }

    if (typeof contaRef === 'string') {
      const matchObjectId = contaRef.match(/[a-fA-F0-9]{24}/);
      return matchObjectId ? matchObjectId[0] : null;
    }

    if (typeof contaRef === 'object' && contaRef._id) {
      return contaRef._id.toString();
    }

    if (typeof contaRef?.toString === 'function') {
      const valor = contaRef.toString();
      return /^[a-fA-F0-9]{24}$/.test(valor) ? valor : null;
    }

    return null;
  }

  // Aplica variações de saldo em múltiplas contas
  async aplicarDeltaContas(deltas, usuarioId) {
    const entradas = Object.entries(deltas).filter(([, valor]) => valor !== 0);

    for (const [contaId, delta] of entradas) {
      const contaIdNormalizado = this.extrairContaId(contaId);
      if (!contaIdNormalizado) {
        continue;
      }

      await Conta.updateOne(
        { _id: contaIdNormalizado, usuario: usuarioId },
        { $inc: { saldo: Number(delta) } }
      );
    }
  }

  // Lista todos os salários do usuário
  async listar(req, res) {
    const categoriaSalario = await Categoria.findOne({ nome: 'Salário' });

    if (!categoriaSalario) {
      return res.json([]);
    }

    const salarios = await Transacao.find({
      usuario: req.user.id,
      categoria: categoriaSalario._id,
    })
      .sort({ data: -1, createdAt: -1 })
      .populate('conta', 'nome tipo')
      .populate('categoria', 'nome');

    res.json(salarios);
  }

  // Cria novo salário recorrente
  async criar(req, res) {
    const categoriaSalario = await Categoria.findOne({ nome: 'Salário' });

    if (!categoriaSalario) {
      return res
        .status(400)
        .json({ mensagem: 'Categoria Salário não encontrada' });
    }

    const contaId = this.extrairContaId(req.body.conta);

    const hoje = new Date();

    const salario = await Transacao.create({
      ...req.body,
      conta: contaId,
      usuario: req.user.id,
      categoria: categoriaSalario._id,
      tipo: 'entrada',
      titulo: req.body.titulo || 'Salário',
      status: 'pendente',
      ativa: true,
    });

    if (this.salarioDeveSerProcessadoAgora(salario, hoje)) {
      const contaSalarioId = this.extrairContaId(salario.conta);
      if (contaSalarioId) {
        await this.aplicarDeltaContas(
          { [contaSalarioId]: salario.valor },
          req.user.id
        );
      }

      await Transacao.updateOne(
        { _id: salario._id },
        { dataUltimoProcessamento: hoje, status: 'pago' }
      );
    }

    const salarioPopulado = await Transacao.findById(salario._id)
      .populate('conta', 'nome tipo')
      .populate('categoria', 'nome');

    res.status(201).json(salarioPopulado);
  }

  // Atualiza salário existente
  async atualizar(req, res) {
    const categoriaSalario = await Categoria.findOne({ nome: 'Salário' });

    if (!categoriaSalario) {
      return res
        .status(400)
        .json({ mensagem: 'Categoria Salário não encontrada' });
    }

    const transacaoAntiga = await Transacao.findOne({
      _id: req.params.id,
      usuario: req.user.id,
      categoria: categoriaSalario._id,
    });

    if (!transacaoAntiga) {
      return res.status(404).json({ mensagem: 'Salário não encontrado' });
    }

    const hoje = new Date();
    const antigoProcessadoNoMes = this.salarioJaProcessadoNoMes(
      transacaoAntiga,
      hoje
    );

    const payloadAtualizacao = {
      ...req.body,
    };

    if (Object.prototype.hasOwnProperty.call(req.body, 'conta')) {
      payloadAtualizacao.conta = this.extrairContaId(req.body.conta);
    }

    const salario = await Transacao.findOneAndUpdate(
      {
        _id: req.params.id,
        usuario: req.user.id,
        categoria: categoriaSalario._id,
      },
      payloadAtualizacao,
      { returnDocument: 'after' }
    )
      .populate('conta', 'nome tipo')
      .populate('categoria', 'nome');

    const novoProcessadoNoMes = this.salarioDeveSerProcessadoAgora(
      salario,
      hoje
    );

    const deltas = {};

    const contaAntigaId = this.extrairContaId(transacaoAntiga.conta);
    const contaNovaId = this.extrairContaId(salario.conta);

    if (antigoProcessadoNoMes && contaAntigaId) {
      deltas[contaAntigaId] =
        (deltas[contaAntigaId] || 0) - transacaoAntiga.valor;
    }

    if (novoProcessadoNoMes && contaNovaId) {
      deltas[contaNovaId] = (deltas[contaNovaId] || 0) + salario.valor;
    }

    await this.aplicarDeltaContas(deltas, req.user.id);

    await Transacao.updateOne(
      { _id: salario._id },
      {
        dataUltimoProcessamento: novoProcessadoNoMes ? hoje : null,
        status: novoProcessadoNoMes ? 'pago' : 'pendente',
      }
    );

    const salarioAtualizado = await Transacao.findById(salario._id)
      .populate('conta', 'nome tipo')
      .populate('categoria', 'nome');

    res.json(salarioAtualizado);
  }

  // Deleta salário e reverte saldo se necessário
  async deletar(req, res) {
    const categoriaSalario = await Categoria.findOne({ nome: 'Salário' });

    if (!categoriaSalario) {
      return res
        .status(400)
        .json({ mensagem: 'Categoria Salário não encontrada' });
    }

    const salario = await Transacao.findOne({
      _id: req.params.id,
      usuario: req.user.id,
      categoria: categoriaSalario._id,
    });

    if (!salario) {
      return res.status(404).json({ mensagem: 'Salário não encontrado' });
    }

    const contaSalarioId = this.extrairContaId(salario.conta);
    if (this.salarioJaProcessadoNoMes(salario) && contaSalarioId) {
      await this.aplicarDeltaContas(
        { [contaSalarioId]: -salario.valor },
        req.user.id
      );
    }

    await salario.deleteOne();

    res.json({ mensagem: 'Salário deletado' });
  }
}

module.exports = new SalarioController();
