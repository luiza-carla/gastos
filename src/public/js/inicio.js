import { apiFetch } from './config.js';
import { formatarValor, setTextById, showById, hideById } from './helpers/index.js';

console.log("inicio.js carregou");

export async function carregarResumo() {
  try {
    const dados = await apiFetch(window.location.origin + '/resumo');
    console.log("RESUMO RECEBIDO:", dados);

    setTextById('saldo', formatarValor(dados.saldo));
    setTextById('totalSalarios', formatarValor(dados.salarios));
    setTextById('saldoContas', formatarValor(dados.saldoContas));
    setTextById('totalEntradas', formatarValor(dados.entradas));
    setTextById('totalSaidas', formatarValor(dados.saidas));
    setTextById('saldoFinal', formatarValor(dados.saldoFinal));

  } catch (erro) {
    console.error("Erro ao carregar resumo:", erro);
  }
}

async function abrirProjecao() {
  try {

    const dados = await apiFetch(window.location.origin + '/resumo/projecao');

    setTextById('projSaldoAtual', formatarValor(dados.saldoAtual));
    setTextById('projSaidasPendentes', formatarValor(dados.saidasPendentes));
    setTextById('projSaldoFinal', formatarValor(dados.saldoProjetado));

    showById('modalProjecao');

  } catch (erro) {
    console.error("Erro ao carregar projeção:", erro);
  }
}

document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("btnProjecao");
  const fechar = document.getElementById("fecharModal");

  if (btn) {
    btn.addEventListener("click", abrirProjecao);
  }

  if (fechar) {
    fechar.addEventListener("click", () => {
      hideById('modalProjecao');
    });
  }

});