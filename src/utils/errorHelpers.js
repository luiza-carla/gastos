// Helpers para criação e manipulação de erros

// Cria erro HTTP com statusCode personalizado
function criarErro(statusCode, mensagem) {
  const erro = new Error(mensagem);
  erro.statusCode = statusCode;
  return erro;
}

module.exports = {
  criarErro,
};
