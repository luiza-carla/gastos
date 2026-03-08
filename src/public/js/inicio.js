import { apiFetch } from './config.js';
import { formatarValor, setTextById, showById, hideById, $ } from './helpers/index.js';

// Carrega resumo financeiro do mês
export async function carregarResumo() {
  try {
    const dados = await apiFetch(window.location.origin + '/resumo');
    console.log("RESUMO RECEBIDO:", dados);

    setTextById('saldo', formatarValor(dados.saldo));
    setTextById('totalSalarios', formatarValor(dados.salarios));
    setTextById('saldoContas', formatarValor(dados.saldoContas));
    setTextById('totalEntradas', formatarValor(dados.entradas));
    setTextById('totalSaidas', formatarValor(dados.saidas));
    setTextById('saldoFinal', formatarValor(dados.saldoFinal ?? dados.saldo));

  } catch (erro) {
    console.error("Erro ao carregar resumo:", erro);
  }
}

// Abre modal com projeção financeira futura
async function abrirProjecao() {
  try {

    // Busca projeção financeira
    const dados = await apiFetch(window.location.origin + '/resumo/projecao');

    setTextById('projSaldoAtual', formatarValor(dados.saldoAtual));
    setTextById('projSaidasPendentes', formatarValor(dados.saidasPendentes));
    setTextById('projSaldoFinal', formatarValor(dados.saldoProjetado));

    // Exibe modal com projeção
    showById('modalProjecao');

  } catch (erro) {
    console.error("Erro ao carregar projeção:", erro);
  }
}

// Carrega listeners quando DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {

  const btn = $("btnProjecao");
  const fechar = $("fecharModal");

  if (btn) {
    btn.addEventListener("click", abrirProjecao);
  }

  if (fechar) {
    fechar.addEventListener("click", () => {
      hideById('modalProjecao');
    });
  }

});