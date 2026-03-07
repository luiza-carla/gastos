import { getToken } from './config.js';
import { adicionarMenu } from './menu.js';

// Verifica autenticação e redireciona se necessário
export async function verificarAutenticacao() {
  const token = getToken();
  // Obtém nome da página atual
  const pagina = window.location.pathname.split('/').pop();
  // Páginas que não requerem autenticação
  const paginasPublicas = ['login.html', 'registrar.html'];

  // Redireciona para login se não autenticado
  if (!token && !paginasPublicas.includes(pagina)) {
    window.location.href = '/html/login.html';
    return;
  }

  // Redireciona para início se já autenticado
  if (token && paginasPublicas.includes(pagina)) {
    window.location.href = '/html/inicio.html';
    return;
  }

  // Carrega menu se autenticado
  if (token) {
    await adicionarMenu();
  }
}