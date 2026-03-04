const CategoriaService = require('../services/CategoriaService');

class CategoriaController {

  async criar(req, res) {
    try {
      const categoria = await CategoriaService.criar(req.body, req.user.id);
      return res.status(201).json(categoria);
    } catch (err) {
      return res.status(400).json({ mensagem: err.message });
    }
  }

  async listar(req, res) {
    try {
      const categorias = await CategoriaService.listar(req.user.id);
      return res.json(categorias);
    } catch (err) {
      return res.status(400).json({ mensagem: err.message });
    }
  }

  async atualizar(req, res) {
    try {
      const categoria = await CategoriaService.atualizar(req.params.id, req.body, req.user.id);
      return res.json(categoria);
    } catch (err) {
      return res.status(400).json({ mensagem: err.message });
    }
  }

  async deletar(req, res) {
    try {
      await CategoriaService.deletar(req.params.id, req.user.id);
      return res.json({ mensagem: 'Categoria deletada' });
    } catch (err) {
      return res.status(400).json({ mensagem: err.message });
    }
  }

}

module.exports = new CategoriaController();