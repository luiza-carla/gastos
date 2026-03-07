import { setHTMLById, showElement, hideElement, showModal, hideModal, $ } from './helpers/index.js';

// Armazena callback de confirmacao do modal
let confirmarCallback = null;

// Abre modal de confirmacao com titulo e mensagem
export function abrirModalConfirmacao({ titulo, mensagem, onConfirmar }) {

  // Atualiza titulo e conteudo do modal
  const tituloEl = $('modalTitulo');

  setHTMLById('modalTitulo', `<i class="fa-solid fa-triangle-exclamation" style="color: var(--vermelho-escuro);"></i> ${titulo}`);
  setHTMLById('modalConteudo', `<p style="margin: 0; padding: 10px 0; color: #666;">${mensagem}</p>`);

  // Define callback de confirmacao
  confirmarCallback = onConfirmar;

  // Ajusta botoes exibidos no modal
  hideElement($('modalFooterEditar'));
  showElement($('modalFooterConfirmar'));
  hideElement($('modalFooterErro'));

  showModal();
}

// Fecha modal global
export function fecharModal() {
  hideModal();
}

// Trata clique no botao de confirmar
document.addEventListener('click', (e) => {
  if (e.target.id === 'modalConfirmar') {
    if (confirmarCallback) confirmarCallback();
  }
});
