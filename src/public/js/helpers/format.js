export function formatarValor(valor) {
  const num = Number(valor || 0);
  return num.toFixed(2);
}

export function capitalizar(texto = '') {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
