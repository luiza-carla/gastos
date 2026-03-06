function somarCampo(lista = [], campo) {
  return lista.reduce((acc, item) => acc + Number(item[campo] || 0), 0);
}

function totaisTransacoes(transacoes = []) {
  let entradas = 0;
  let saidas = 0;
  transacoes.forEach(t => {
    if (t.tipo === 'entrada') entradas += Number(t.valor);
    if (t.tipo === 'saida') saidas += Number(t.valor);
  });
  return { entradas, saidas };
}

function somaSaidas(transacoes = []) {
  let saidas = 0;
  transacoes.forEach(t => {
    if (t.tipo === 'saida') saidas += Number(t.valor);
  });
  return saidas;
}

module.exports = {
  somarCampo,
  totaisTransacoes,
  somaSaidas
};
