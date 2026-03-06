const ResumoService = require('../services/ResumoService');

class ResumoController {

  async obterResumo(req, res) {
    try {
      const usuarioId = req.user.id; // string é suficiente para os métodos de serviço

      const dados = await ResumoService.gerarResumo(usuarioId);
      res.json(dados);

    } catch (erro) {
      res.status(500).json({ mensagem: erro.message });
    }
  }

  async obterProjecao(req, res) {
    try {
      const usuarioId = req.user.id;

      const dados = await ResumoService.gerarProjecao(usuarioId);
      res.json(dados);

    } catch (erro) {
      res.status(500).json({ mensagem: erro.message });
    }
  }

}

module.exports = new ResumoController();