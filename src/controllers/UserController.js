const UserService = require('../services/UserService');

class UserController {
  // Registra novo usuário
  async registrar(req, res) {
    const usuario = await UserService.registrar(req.body);
    return res.status(201).json(usuario);
  }

  // Realiza login do usuário
  async login(req, res) {
    const resultado = await UserService.login(req.body);
    return res.json(resultado);
  }

  // Lista todos os usuários
  async listar(req, res) {
    const usuarios = await UserService.listar();
    return res.json(usuarios);
  }
}

module.exports = new UserController();
