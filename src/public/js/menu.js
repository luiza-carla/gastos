import { logout } from './logout.js';
import { abrirModalConfirmacao, fecharModal } from './modalDeletar.js';
import { $, addClass, getPaginaAtual, setHTMLById } from './helpers/index.js';

// Adiciona menu de navegação ao topo da página
export async function adicionarMenu() {
  let menuDiv = $('menu');
  // Cria div do menu se não existir
  if (!menuDiv) {
    menuDiv = document.createElement('div');
    menuDiv.id = 'menu';
    document.body.insertAdjacentElement('afterbegin', menuDiv);
  }

  // Carrega menu HTML
  const res = await fetch('/html/menu.html');
  const html = await res.text();
  setHTMLById('menu', html);

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
  if (btnLogout) {
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
