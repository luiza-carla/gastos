import { getToken } from './config.js';
import { adicionarMenu } from './menu.js';

export async function verificarAutenticacao() {
  const token = getToken();
  const pagina = window.location.pathname.split('/').pop();
  const paginasPublicas = ['login.html', 'registrar.html'];

  if (!token && !paginasPublicas.includes(pagina)) {
    window.location.href = '/html/login.html';
    return;
  }

  if (token && paginasPublicas.includes(pagina)) {
    window.location.href = '/html/inicio.html';
    return;
  }

  if (token) {
    await adicionarMenu();
  }
}