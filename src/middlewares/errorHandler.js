// Middleware global para padronizar respostas de erro da API
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  let status = err.statusCode || err.status || 500;

  // Erros de validação/cast do Mongoose devem retornar 400
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    status = 400;
  }

  const mensagem = err.message || 'Erro interno do servidor';
  return res.status(status).json({ mensagem });
}

module.exports = errorHandler;
