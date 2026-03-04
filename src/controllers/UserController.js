const UserService = require('../services/UserService');

class UserController {

  async registrar(req, res) {
    try {
      const usuario = await UserService.registrar(req.body);
      return res.status(201).json(usuario);
    } catch (erro) {
      return res.status(400).json({ mensagem: erro.message });
    }
  }

  async login(req, res) {
    try {
      const resultado = await UserService.login(req.body);
      return res.json(resultado);
    } catch (erro) {
      return res.status(400).json({ mensagem: erro.message });
    }
  }

  async listar(req, res) {
    const usuarios = await UserService.listar();
    return res.json(usuarios);
  }

}

module.exports = new UserController();