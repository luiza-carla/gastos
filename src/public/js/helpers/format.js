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
