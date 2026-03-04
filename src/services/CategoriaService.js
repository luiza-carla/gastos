const Categoria = require('../models/Categoria');

class CategoriaService {

  async criar(dados, usuarioId) {
    const categoria = await Categoria.create({
      ...dados,
      usuario: usuarioId
    });
    return categoria;
  }

  async listar(usuarioId) {
    return Categoria.find({ usuario: usuarioId }).select('-__v');
  }

  async atualizar(id, dados, usuarioId) {
    const categoria = await Categoria.findOneAndUpdate(
      { _id: id, usuario: usuarioId },
      dados,
      { new: true }
    );
    if (!categoria) throw new Error('Categoria não encontrada');
    return categoria;
  }

  async deletar(id, usuarioId) {
    const categoria = await Categoria.findOneAndDelete({ _id: id, usuario: usuarioId });
    if (!categoria) throw new Error('Categoria não encontrada');
    return categoria;
  }

}

module.exports = new CategoriaService();