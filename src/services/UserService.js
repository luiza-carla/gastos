const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UsuarioService {

  async registrar(dados) {
    const { nome, email, senha, salario } = dados;

    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      throw new Error('Email já cadastrado');
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha: senhaHash,
      salario
    });

    const token = jwt.sign(
      { id: novoUsuario._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      usuario: {
        id: novoUsuario._id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        salario: novoUsuario.salario
      }
    };
  }

  async login(dados) {
    const { email, senha } = dados;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      throw new Error('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      throw new Error('Credenciais inválidas');
    }

    const token = jwt.sign(
      { id: usuario._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        salario: usuario.salario
      }
    };
  }

  async listar() {
    return Usuario.find().select('-senha');
  }

}

module.exports = new UsuarioService();