const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UsuarioService {

  // Registra novo usuário com hash de senha
  async registrar(dados) {
    const { nome, email, senha, salario } = dados;

    // Valida se email já existe
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      throw new Error('Email já cadastrado');
    }

    // Cria hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Cria novo usuário no banco
    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha: senhaHash,
      salario
    });

    // Gera token JWT para autenticação
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

  // Realiza login validando credenciais e retornando token
  async login(dados) {
    const { email, senha } = dados;

    // Busca usuário por email
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      throw new Error('Credenciais inválidas');
    }

    // Valida senha com hash
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      throw new Error('Credenciais inválidas');
    }

    // Gera token JWT
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

  // Lista todos os usuários (sem expor senhas)
  async listar() {
    return Usuario.find().select('-senha');
  }

}

module.exports = new UsuarioService();