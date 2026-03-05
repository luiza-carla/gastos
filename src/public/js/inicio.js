import { apiFetch } from './config.js';

console.log("inicio.js carregou");

export async function carregarResumo() {
  try {
    const dados = await apiFetch(window.location.origin + '/resumo');
    console.log("RESUMO RECEBIDO:", dados);

    const saldoEl = document.getElementById('saldoTotal');
    const salariosEl = document.getElementById('totalSalarios');
    const entradasEl = document.getElementById('totalEntradas');
    const saidasEl = document.getElementById('totalSaidas');

    if (saldoEl) saldoEl.textContent = dados.saldo.toFixed(2);
    if (salariosEl) salariosEl.textContent = dados.salarios.toFixed(2);
    if (entradasEl) entradasEl.textContent = dados.entradas.toFixed(2);
    if (saidasEl) saidasEl.textContent = dados.saidas.toFixed(2);

    const saldoPorContaEl = document.getElementById('saldoPorConta');
    if (saldoPorContaEl && dados.saldoPorConta) {
      let html = '';
      dados.saldoPorConta.forEach(c => {
        html += `<p>🏦 ${c.nome} (${c.tipo}): R$ ${c.saldo.toFixed(2)}</p>`;
      });
      saldoPorContaEl.innerHTML = html;
    }

  } catch (erro) {
    console.error("Erro ao carregar resumo:", erro);
  }
}