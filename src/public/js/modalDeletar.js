import {
  setHTMLById,
  showById,
  hideById,
  showModal,
  hideModal,
} from './helpers/index.js';
import { limparErroInline } from './modalEditar.js';

// Armazena callback de confirmacao do modal
let confirmarCallback = null;

// Abre modal de confirmacao com titulo e mensagem
export function abrirModalConfirmacao({ titulo, mensagem, onConfirmar }) {
  limparErroInline();

  // Atualiza titulo e conteudo do modal
  setHTMLById(
    'modalTitulo',
    `<i class="fa-solid fa-triangle-exclamation" style="color: var(--vermelho-escuro);"></i> ${titulo}`
  );
  setHTMLById(
    'modalConteudo',
    `<p style="margin: 0; padding: 10px 0; color: #666;">${mensagem}</p>`
  );

  // Define callback de confirmacao
  confirmarCallback = onConfirmar;

  // Ajusta botoes exibidos no modal
  hideById('modalFooterEditar');
  showById('modalFooterConfirmar');
  hideById('modalFooterErro');

  showModal();
}

// Fecha modal global
export function fecharModal() {
  limparErroInline();
  confirmarCallback = null;
  hideModal();
}

// Trata clique no botao de confirmar
document.addEventListener('click', (e) => {
  if (e.target.id === 'modalConfirmar') {
    if (confirmarCallback) confirmarCallback();
  }
});
