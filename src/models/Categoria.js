const mongoose = require('mongoose');

const CategoriaSchema = new mongoose.Schema({

  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },

  nome: {
    type: String,
    required: true
  },

  tipo: {
    type: String,
    enum: ['receita', 'despesa'],
    required: true
  },

  cor: {
    type: String,
    default: '#000000'
  },

  ativa: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Categoria', CategoriaSchema);