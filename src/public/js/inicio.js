import { criarConta, popularSelectContas, listarContas } from './conta.js';
import { criarCategoria, listarCategorias, inicializarCategorias } from './categoria.js';
import { criarTransacao, listarTransacoes } from './transacao.js';
import { criarSalario, listarSalarios } from './salario.js';

(async function inicializar() {
  await listarContas();
  await listarCategorias();
  await listarSalarios();

  await inicializarCategorias();
  await popularSelectContas();

  criarConta('formConta', async () => {
    await popularSelectContas();
  });

  criarCategoria('formCategoria', async () => {
    await listarCategorias();
  });

  criarSalario('formSalario', async () => {
    await listarSalarios();
  });

  criarTransacao('formTransacao');

  listarTransacoes();
})();