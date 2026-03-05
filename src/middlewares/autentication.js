const jwt = require('jsonwebtoken');

function autenticacao(req, res, next) {
  const authHeader = req.headers.authorization;

  console.log('--- Middleware autenticacao ---');
  console.log('Headers da requisição:', req.headers);

  if (!authHeader) {
    console.log('Token não fornecido');
    return res.status(401).json({ mensagem: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token recebido:', token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', decoded);

    req.user = { id: decoded.id };
    next();
  } catch (erro) {
    console.log('Token inválido ou expirado:', erro.message);
    return res.status(401).json({ mensagem: 'Token inválido' });
  }
}

module.exports = autenticacao;