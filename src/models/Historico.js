const mongoose = require('mongoose');

const HistoricoSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
      index: true,
    },

    entidade: {
      type: String,
      enum: ['transacao', 'conta', 'carteira', 'salario', 'listaDesejo'],
      required: true,
    },

    entidadeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    acao: {
      type: String,
      enum: ['criacao', 'edicao', 'delecao', 'transferencia', 'realizacao'],
      required: true,
    },

    descricao: {
      type: String,
      required: true,
    },

    dadosAnteriores: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    dadosNovos: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    metadata: {
      ip: String,
      userAgent: String,
    },

    desfeito: {
      type: Boolean,
      default: false,
    },

    desfeitoEm: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Índices compostos para queries eficientes
HistoricoSchema.index({ usuario: 1, createdAt: -1 });
HistoricoSchema.index({ entidade: 1, entidadeId: 1 });

module.exports = mongoose.model('Historico', HistoricoSchema);
