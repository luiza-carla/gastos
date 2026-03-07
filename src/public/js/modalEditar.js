import { setHTMLById, showElement, hideElement, showModal, hideModal, $ } from './helpers/index.js';

// Armazena callback de salvamento do modal
let salvarCallback = null;

// Abre modal de edicao com titulo e conteudo personalizados
export function abrirModal({ titulo, conteudoHTML, onSalvar }) {

  // Atualiza titulo e conteudo do modal
  const modal = $('modalGlobal');
  const tituloEl = $('modalTitulo');

  setHTMLById('modalTitulo', `<i class="fa-solid fa-pen-to-square"></i> ${titulo}`);
  setHTMLById('modalConteudo', conteudoHTML);

  // Define callback de salvar
  salvarCallback = onSalvar;

  // Ajusta botoes exibidos no modal
  showElement($('modalFooterEditar'));
  hideElement($('modalFooterConfirmar'));
  hideElement($('modalFooterErro'));

  showModal();
}

// Fecha modal global
export function fecharModal() {
  hideModal();
}

// Abre modal de erro com mensagem informada
export function abrirModalErro(mensagem) {
  const tituloEl = $('modalTitulo');
  
  setHTMLById('modalTitulo', '<i class="fa-solid fa-circle-xmark" style="color: var(--vermelho-escuro);"></i> Erro');
  setHTMLById('modalConteudo', `<p style="margin: 0; padding: 10px 0; color: #666; line-height: 1.6;">${mensagem}</p>`);
  
  hideElement($('modalFooterEditar'));
  hideElement($('modalFooterConfirmar'));
  showElement($('modalFooterErro'));
  
  showModal();
}

// Trata cliques dos botoes do modal
document.addEventListener('click', (e) => {
  if (e.target.id === 'modalSalvar') {
    if (salvarCallback) salvarCallback();
  }
  if (e.target.id === 'modalCancelar' || e.target.id === 'modalFechar' || e.target.id === 'modalFecharErro') {
    fecharModal();
  }
});