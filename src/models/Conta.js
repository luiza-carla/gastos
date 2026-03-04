const mongoose = require('mongoose');

const ContaSchema = new mongoose.Schema({

  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  nome: {
    type: String,
    required: true
  },

  tipo: {
    type: String,
    enum: ['corrente', 'credito', 'dinheiro', 'investimento'],
    required: true
  },

  saldoInicial: {
    type: Number,
    default: 0
  },

  ativa: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Conta', ContaSchema);