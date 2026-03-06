import { verificarAutenticacao } from './auth.js';
import { criarConta, popularSelectContas, listarContas } from './conta.js';
import { inicializarCategorias } from './categoria.js';
import { criarTransacao, listarTransacoes } from './transacao.js';
import { criarSalario, listarSalarios } from './salario.js';
import { carregarResumo } from './inicio.js';

(async function () {
  await verificarAutenticacao();
  
  await import('./modalEditar.js');

  await inicializarCategorias();
})();


// TRANSAÇÕES
(async function () {
  if (document.getElementById('formTransacao')) {
    criarTransacao('formTransacao');
  }

  if (document.getElementById('transacoes')) {
    await listarTransacoes();
  }
})();


// CONTAS
(async function () {

  if (document.getElementById('contas')) {
    await listarContas();
  }

  if (document.getElementById('conta') || document.getElementById('contaSalario')) {
    await popularSelectContas();
  }

  if (document.getElementById('formConta')) {
    criarConta('formConta', async () => {
      await popularSelectContas();
    });
  }

})();


// RESUMO
(async function () {
  if (document.getElementById('saldoFinal')) {
    await carregarResumo();
  }
})();


// SALÁRIOS
(async function () {

  if (document.getElementById('salariosContainer')) {
    await listarSalarios();
  }

  if (document.getElementById('contaSalario')) {
    await popularSelectContas('contaSalario');
  }

  if (document.getElementById('formSalario')) {
    criarSalario('formSalario');
  }

})();