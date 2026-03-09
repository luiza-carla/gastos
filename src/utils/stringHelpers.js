// Conjuga a ação no gênero gramatical correto da entidade
function conjugarAcao(acao, entidade) {
  const masculinas = ['salario'];
  const terminacao = masculinas.includes(entidade) ? 'o' : 'a';

  const conjugacoes = {
    criacao: `criad${terminacao}`,
    edicao: `editad${terminacao}`,
    delecao: `deletad${terminacao}`,
    transferencia: `transferid${terminacao}`,
    realizacao: `realizad${terminacao}`,
  };

  return conjugacoes[acao] || acao;
}

// Formata valor numérico como moeda brasileira
function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(valor || 0));
}

module.exports = {
  conjugarAcao,
  formatarMoeda,
};
