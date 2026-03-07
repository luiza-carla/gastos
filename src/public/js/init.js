import { verificarAutenticacao } from './auth.js';
import { criarConta, popularSelectContas, listarContas } from './conta.js';
import { inicializarCategorias } from './categoria.js';
import { criarTransacao, listarTransacoes } from './transacao.js';
import { criarSalario, listarSalarios } from './salario.js';
import { carregarResumo } from './inicio.js';
import { $ } from './helpers/index.js';

(async function () {
  await verificarAutenticacao();
  
  await import('./modalEditar.js');

  // Inicializa categorias
  await inicializarCategorias();
})();

// Inicializa transações
(async function () {
  if ($('formTransacao')) {
    criarTransacao('formTransacao');
  }

  if ($('transacoes')) {
    await listarTransacoes();
  }
})();

// Inicializa contas
(async function () {

  if ($('contas')) {
    await listarContas();
  }

  if ($('conta') || $('contaSalario')) {
    await popularSelectContas();
  }

  if ($('formConta')) {
    criarConta('formConta', async () => {
      await popularSelectContas();
    });
  }

})();


// Inicializa resumo financeiro
(async function () {
  if ($('saldoFinal')) {
    await carregarResumo();
  }
})();


// Inicializa salarios
(async function () {

  if ($('salariosContainer')) {
    await listarSalarios();
  }

  if ($('contaSalario')) {
    await popularSelectContas('contaSalario');
  }

  if ($('formSalario')) {
    criarSalario('formSalario');
  }

})();