const mongoose = require('mongoose');

const TransacaoSchema = new mongoose.Schema({

  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },

  conta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conta',
    required: true
  },

  titulo: {
    type: String,
    required: true
  },

  valor: {
    type: Number,
    required: true
  },

  tipo: {
    type: String,
    enum: ['entrada', 'saida'],
    required: true
  },

  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria',
    required: true
  },

  data: {
    type: Date,
    default: Date.now
  },

  ativa: {
    type: Boolean,
    default: true
  },

  tags: [
      {
        type: String
      }
    ]
  ,

  recorrencia: {
    type: String,
    enum: ['nenhuma', 'mensal'],
    default: 'nenhuma'
  },

  parcelamento: {
    totalParcelas: { type: Number, default: 1 },
    parcelaAtual: { type: Number, default: 1 }
  },

  status: {
    type: String,
    enum: ['pendente', 'pago'],
    default: 'pago'
  }

}, { timestamps: true });

module.exports = mongoose.model('Transacao', TransacaoSchema);