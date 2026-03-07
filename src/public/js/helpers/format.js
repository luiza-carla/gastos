// Formata número para 2 casas decimais
export function formatarValor(valor) {
  const num = Number(valor || 0);
  return num.toFixed(2);
}

// Capitaliza primeira letra de um texto
export function capitalizar(texto = '') {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Remove acentos de uma string para busca insensível
export function removerAcentos(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Escapa caracteres HTML para evitar XSS
export function escaparHtml(texto = '') {
  return texto
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
