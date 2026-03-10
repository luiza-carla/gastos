function criarPrefixo(level, contexto) {
  const nivel = String(level || 'log').toUpperCase();
  const escopo = contexto ? ` [${contexto}]` : '';
  return `[${nivel}]${escopo}`;
}

export function info(mensagem, contexto, ...detalhes) {
  console.log(criarPrefixo('info', contexto), mensagem, ...detalhes);
}

export function warn(mensagem, contexto, ...detalhes) {
  console.warn(criarPrefixo('warn', contexto), mensagem, ...detalhes);
}

export function error(mensagem, contexto, ...detalhes) {
  console.error(criarPrefixo('error', contexto), mensagem, ...detalhes);
}
