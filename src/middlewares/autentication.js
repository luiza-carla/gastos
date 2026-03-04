const jwt = require('jsonwebtoken');

function autenticacao(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ mensagem: 'Token não fornecido' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (erro) {
    return res.status(401).json({ mensagem: 'Token inválido' });
  }
}

module.exports = autenticacao;