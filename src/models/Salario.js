const mongoose = require('mongoose');

const SalarioSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },

  valor: {
    type: Number,
    required: true
  },

  frequencia: {
    type: String,
    enum: ['mensal', 'semanal', 'diario', 'anual', 'outra'],
    default: 'mensal'
  },

  ativo: {
    type: Boolean,
    default: true 
  },

  dataInicio: {
    type: Date,
    default: Date.now
  },

  dataFim: {
    type: Date
  },

  dataRecebimento: {
    type: Date
  },

  conta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conta',
    required: false
  }

}, { timestamps: true });

module.exports = mongoose.model('Salario', SalarioSchema);