const ResumoService = require('../services/ResumoService');

class ResumoController {
  // Obtém resumo financeiro do usuário
  async obterResumo(req, res) {
    // Recupera ID do usuário autenticado
    const usuarioId = req.user.id; // string é suficiente para os métodos de serviço

    // Gera resumo financeiro com dados do mês
    const dados = await ResumoService.gerarResumo(usuarioId);
    res.json(dados);
  }

  // Obtém projeção financeira futura do usuário
  async obterProjecao(req, res) {
    // Recupera ID do usuário autenticado
    const usuarioId = req.user.id;

    // Gera projeção financeira considerando transações pendentes
    const dados = await ResumoService.gerarProjecao(usuarioId);
    res.json(dados);
  }
}

module.exports = new ResumoController();
