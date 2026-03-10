const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    senha: {
      type: String,
      required: true,
    },

    ultimaLimpezaHistorico: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Usuario', UsuarioSchema);
