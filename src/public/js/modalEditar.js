import { setHTMLById, showElement, hideElement, showModal, hideModal } from './helpers/index.js';

let salvarCallback = null;

export function abrirModal({ titulo, conteudoHTML, onSalvar }) {

  const modal = document.getElementById('modalGlobal');
  const tituloEl = document.getElementById('modalTitulo');

  tituloEl.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> ${titulo}`;
  setHTMLById('modalConteudo', conteudoHTML);

  salvarCallback = onSalvar;

  showElement(document.getElementById('modalFooterEditar'));
  hideElement(document.getElementById('modalFooterConfirmar'));
  hideElement(document.getElementById('modalFooterErro'));

  showModal();
}

export function fecharModal() {
  hideModal();
}

export function abrirModalErro(mensagem) {
  const tituloEl = document.getElementById('modalTitulo');
  
  tituloEl.innerHTML = '<i class="fa-solid fa-circle-xmark" style="color: var(--vermelho-escuro);"></i> Erro';
  setHTMLById('modalConteudo', `<p style="margin: 0; padding: 10px 0; color: #666; line-height: 1.6;">${mensagem}</p>`);
  
  hideElement(document.getElementById('modalFooterEditar'));
  hideElement(document.getElementById('modalFooterConfirmar'));
  showElement(document.getElementById('modalFooterErro'));
  
  showModal();
}

document.addEventListener('click', (e) => {
  if (e.target.id === 'modalSalvar') {
    if (salvarCallback) salvarCallback();
  }
  if (e.target.id === 'modalCancelar' || e.target.id === 'modalFechar' || e.target.id === 'modalFecharErro') {
    fecharModal();
  }
});