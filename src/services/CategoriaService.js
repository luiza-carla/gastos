const Categoria = require('../models/Categoria');

class CategoriaService {

  async listar() {
    return Categoria.find({ ativa: true }).select('-__v');
  }

}

module.exports = new CategoriaService();