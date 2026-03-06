  import { logout } from './logout.js';
  import { addCSS } from './helpers/index.js';

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
    if (btnLogout) btnLogout.addEventListener('click', logout);
  }

  export async function carregarCSS(href) {
    addCSS(href);
  }