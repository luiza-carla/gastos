import { setHTMLById, showElement, hideElement, showModal, hideModal } from './helpers/index.js';

let salvarCallback = null;

export function abrirModal({ titulo, conteudoHTML, onSalvar }) {

  const modal = document.getElementById('modalGlobal');
  const tituloEl = document.getElementById('modalTitulo');

  tituloEl.textContent = titulo;
  setHTMLById('modalConteudo', conteudoHTML);

  salvarCallback = onSalvar;

  showElement(document.getElementById('modalFooterEditar'));
  hideElement(document.getElementById('modalFooterConfirmar'));

  showModal();
}

export function fecharModal() {
  hideModal();
}

document.addEventListener('click', (e) => {
  if (e.target.id === 'modalSalvar') {
    if (salvarCallback) salvarCallback();
  }
  if (e.target.id === 'modalCancelar' || e.target.id === 'modalFechar') {
    fecharModal();
  }
});