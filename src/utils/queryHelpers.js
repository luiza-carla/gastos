// Helpers para parsing e validação de query parameters

// Converte query parameter para inteiro com fallback
function parseQueryInt(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

module.exports = {
  parseQueryInt,
};
