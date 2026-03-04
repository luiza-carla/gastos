const Salario = require('../models/Salario');

class SalarioService {

  async criar(dados, usuarioId) {
    const salario = await Salario.create({
      ...dados,
      usuario: usuarioId
    });
    return salario;
  }

  async listar(usuarioId) {
    return Salario.find({ usuario: usuarioId }).select('-__v');
  }

  async atualizar(id, dados, usuarioId) {
    const salario = await Salario.findOneAndUpdate(
      { _id: id, usuario: usuarioId },
      dados,
      { new: true }
    );
    if (!salario) throw new Error('Salário não encontrado');
    return salario;
  }

  async deletar(id, usuarioId) {
    const salario = await Salario.findOneAndDelete({ _id: id, usuario: usuarioId });
    if (!salario) throw new Error('Salário não encontrado');
    return salario;
  }

}

module.exports = new SalarioService();