import { logout } from './logout.js';
import { abrirModalConfirmacao, fecharModal } from './modalDeletar.js';
import { $, setHTMLById } from './helpers/index.js';

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
