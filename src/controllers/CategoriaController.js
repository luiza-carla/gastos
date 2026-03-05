const CategoriaService = require('../services/CategoriaService');

class CategoriaController {

  async listar(req, res) {
    try {
      const categorias = await CategoriaService.listar();
      return res.json(categorias);
    } catch (err) {
      return res.status(500).json({ mensagem: err.message });
    }
  }

}

module.exports = new CategoriaController();