const Categoria = require('../models/Categoria');

class CategoriaService {

  // Lista categorias ativas (excluindo salário)
  async listar() {
    return Categoria.find({ 
      ativa: true,
      nome: { $ne: 'Salário' }
    }).select('-__v');
  }

}

module.exports = new CategoriaService();