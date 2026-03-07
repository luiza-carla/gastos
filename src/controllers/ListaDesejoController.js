const ListaDesejo = require('../models/ListaDesejo');

class ListaDesejoController {

  // Cria item da lista de desejos
  async criar(req, res) {
    try {
      const {
        titulo,
        valor,
        categoria,
        tags,
        tipoDespesa
      } = req.body;

      const novoItem = await ListaDesejo.create({
        usuario: req.user.id,
        titulo,
        valor,
        categoria,
        tags: tags || [],
        tipoDespesa
      });

      const itemCompleto = await ListaDesejo.findById(novoItem._id)
        .populate('categoria', 'nome cor tipo');

      res.status(201).json(itemCompleto);
    } catch (err) {
      res.status(400).json({ mensagem: err.message });
    }
  }

  // Lista itens da lista de desejos do usuario
  async listar(req, res) {
    try {
      const itens = await ListaDesejo.find({ usuario: req.user.id })
        .populate('categoria', 'nome cor tipo')
        .sort({ createdAt: -1 });

      res.json(itens);
    } catch (err) {
      res.status(500).json({ mensagem: err.message });
    }
  }

  // Atualiza item da lista de desejos
  async atualizar(req, res) {
    try {
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
      )
        .populate('categoria', 'nome cor tipo');

      if (!item) {
        return res.status(404).json({ mensagem: 'Item da lista de desejos nao encontrado' });
      }

      res.json(item);
    } catch (err) {
      res.status(400).json({ mensagem: err.message });
    }
  }

  // Remove item da lista de desejos
  async deletar(req, res) {
    try {
      const item = await ListaDesejo.findOneAndDelete({
        _id: req.params.id,
        usuario: req.user.id
      });

      if (!item) {
        return res.status(404).json({ mensagem: 'Item da lista de desejos nao encontrado' });
      }

      res.json({ mensagem: 'Item da lista de desejos deletado' });
    } catch (err) {
      res.status(500).json({ mensagem: err.message });
    }
  }

}

module.exports = new ListaDesejoController();