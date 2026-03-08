const CategoriaService = require('../services/CategoriaService');

class CategoriaController {
  // Lista todas as categorias
  async listar(req, res) {
    const categorias = await CategoriaService.listar();
    return res.json(categorias);
  }
}

module.exports = new CategoriaController();
