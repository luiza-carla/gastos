const jwt = require('jsonwebtoken');

// Middleware para verificar autenticação via token JWT
function autenticacao(req, res, next) {
  // Extrai header de autorização
  const authHeader = req.headers.authorization;

  // Valida se token foi fornecido
  if (!authHeader) {
    console.log('Token não fornecido');
    return res.status(401).json({ mensagem: 'Token não fornecido' });
  }

  // Extrai token do formato "Bearer <token>"
  const token = authHeader.split(' ')[1];

  try {
    // Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Armazena ID do usuário na requisição para uso posterior
    req.user = { id: decoded.id };
    next();
  } catch (erro) {
    // Token inválido ou expirado
    console.log('Token inválido ou expirado:', erro.message);
    return res.status(401).json({ mensagem: 'Token inválido' });
  }
}

module.exports = autenticacao;