const ListaDesejo = require('../models/ListaDesejo');

class ListaDesejoController {
  // Cria item da lista de desejos
  async criar(req, res) {
    const { titulo, valor, categoria, tags, tipoDespesa } = req.body;

    const novoItem = await ListaDesejo.create({
      usuario: req.user.id,
      titulo,
      valor,
      categoria,
      tags: tags || [],
      tipoDespesa,
    });

    const itemCompleto = await ListaDesejo.findById(novoItem._id).populate(
      'categoria',
      'nome cor tipo'
    );

    res.status(201).json(itemCompleto);
  }

  // Lista itens da lista de desejos do usuario
  async listar(req, res) {
    const itens = await ListaDesejo.find({ usuario: req.user.id })
      .populate('categoria', 'nome cor tipo')
      .sort({ createdAt: -1 });

    res.json(itens);
  }

  // Atualiza item da lista de desejos
  async atualizar(req, res) {
    const { titulo, valor, categoria, tipoDespesa, tags } = req.body;

    const updateData = {};
    if (titulo) updateData.titulo = titulo;
    if (valor) updateData.valor = valor;
    if (categoria) updateData.categoria = categoria;
    if (tipoDespesa) updateData.tipoDespesa = tipoDespesa;
    if (tags) updateData.tags = tags;

    const item = await ListaDesejo.findOneAndUpdate(
      { _id: req.params.id, usuario: req.user.id },
      updateData,
      { returnDocument: 'after' }
    ).populate('categoria', 'nome cor tipo');

    if (!item) {
      return res
        .status(404)
        .json({ mensagem: 'Item da lista de desejos nao encontrado' });
    }

    res.json(item);
  }

  // Remove item da lista de desejos
  async deletar(req, res) {
    const item = await ListaDesejo.findOneAndDelete({
      _id: req.params.id,
      usuario: req.user.id,
    });

    if (!item) {
      return res
        .status(404)
        .json({ mensagem: 'Item da lista de desejos nao encontrado' });
    }

    res.json({ mensagem: 'Item da lista de desejos deletado' });
  }
}

module.exports = new ListaDesejoController();
