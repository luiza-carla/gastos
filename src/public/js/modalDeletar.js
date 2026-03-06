import { setHTMLById, showElement, hideElement, showModal, hideModal } from './helpers/index.js';

let confirmarCallback = null;

export function abrirModalConfirmacao({ titulo, mensagem, onConfirmar }) {

  const tituloEl = document.getElementById('modalTitulo');

  tituloEl.textContent = titulo;
  setHTMLById('modalConteudo', `<p style="margin: 0; padding: 10px 0; color: #666;">${mensagem}</p>`);

  confirmarCallback = onConfirmar;

  hideElement(document.getElementById('modalFooterEditar'));
  showElement(document.getElementById('modalFooterConfirmar'));

  showModal();
}

export function fecharModal() {
  hideModal();
}

document.addEventListener('click', (e) => {
  if (e.target.id === 'modalConfirmar') {
    if (confirmarCallback) confirmarCallback();
  }
});
