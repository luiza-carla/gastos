import { logout } from './logout.js';
import { abrirModalConfirmacao, fecharModal } from './modalDeletar.js';
import { $, addClass, getPaginaAtual, setHTMLById } from './helpers/index.js';

const MENU_CACHE_KEY = 'menuHtmlCacheV1';

async function obterHtmlMenu() {
  const htmlEmCache = sessionStorage.getItem(MENU_CACHE_KEY);
  if (htmlEmCache) {
    return htmlEmCache;
  }

  const res = await fetch('/html/menu.html');
  const html = await res.text();
  sessionStorage.setItem(MENU_CACHE_KEY, html);
  return html;
}

// Adiciona menu de navegação ao topo da página
export async function adicionarMenu() {
  let menuDiv = $('menu');
  // Cria div do menu se não existir
  if (!menuDiv) {
    menuDiv = document.createElement('div');
    menuDiv.id = 'menu';
    document.body.insertAdjacentElement('afterbegin', menuDiv);
  }

  // Reutiliza menu já renderizado para evitar trabalho duplicado.
  if (!menuDiv.querySelector('.sidebar')) {
    const html = await obterHtmlMenu();
    setHTMLById('menu', html);
  }

  // Destaca o item ativo conforme a página atual.
  const paginaAtual = getPaginaAtual('inicio.html');
  const links = menuDiv.querySelectorAll('.sidebar a[href]');
  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    if (href === paginaAtual) {
      addClass(link, 'active');
    }
  });

  // Registra acao de logout com confirmacao
  const btnLogout = menuDiv.querySelector('#btnLogout');
  if (btnLogout && !btnLogout.dataset.bound) {
    btnLogout.dataset.bound = '1';
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();

      abrirModalConfirmacao({
        titulo: 'Sair da conta',
        mensagem: 'Tem certeza que deseja sair da sua conta?',
        onConfirmar: () => {
          fecharModal();
          logout();
        },
      });
    });
  }
}
