  import { logout } from './logout.js';
  import { abrirModalConfirmacao, fecharModal } from './modalDeletar.js';

  export async function adicionarMenu() {
    let menuDiv = document.getElementById('menu');
    if (!menuDiv) {
      menuDiv = document.createElement('div');
      menuDiv.id = 'menu';
      document.body.insertAdjacentElement('afterbegin', menuDiv);
    }

    const res = await fetch('/html/menu.html');
    const html = await res.text();
    menuDiv.innerHTML = html;

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
          }
        });
      });
    }
  }