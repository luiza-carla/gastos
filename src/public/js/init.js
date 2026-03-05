import { verificarAutenticacao } from './auth.js';
import { criarConta, popularSelectContas, listarContas } from './conta.js';
import { listarCategorias, inicializarCategorias } from './categoria.js';
import { criarTransacao, listarTransacoes } from './transacao.js';
import { criarSalario, listarSalarios } from './salario.js';
import { carregarResumo } from './inicio.js';

verificarAutenticacao();

(async function inicializar() {

  await listarContas();
  await popularSelectContas();

  criarConta('formConta', async () => {
    await popularSelectContas();
  });

  await listarCategorias();
  await inicializarCategorias();

  await listarSalarios();
  criarSalario('formSalario', async () => {
    await listarSalarios();
  });

  criarTransacao('formTransacao');
  listarTransacoes();

  await carregarResumo();

})();