import { escaparHtml, setDisabledById, $, clearElement } from './index.js';

// Cria badge visual de categoria com cor personalizada
export function criarBadgeCategoria(categoria) {
  const nome = categoria?.nome || 'Sem categoria';
  const cor = categoria?.cor || '#95a5a6';

  return `<span class="categoria-badge" style="--categoria-cor:${cor};">${escaparHtml(nome)}</span>`;
}

// Atualiza a visualização das tags selecionadas no formulário
export function atualizarTagsVisual(container, tags) {
  clearElement(container);

  tags.forEach((tag, index) => {
    // Cria elemento visual para cada tag
    const tagEl = document.createElement('span');
    tagEl.textContent = tag + ' ✕';
    tagEl.style.marginRight = '8px';
    tagEl.style.cursor = 'pointer';
    tagEl.style.padding = '4px 8px';
    tagEl.style.background = '#eee';
    tagEl.style.borderRadius = '6px';
    tagEl.style.display = 'inline-block';

    // Permite remover tag ao clicar no X
    tagEl.onclick = () => {
      tags.splice(index, 1);
      atualizarTagsVisual(container, tags);
      setDisabledById('btnNovaTag', false);
      setDisabledById('tagInput', false);
    };

    container.appendChild(tagEl);
  });
}

// Inicializa sistema de tags no formulário (máximo 3 tags)
export function inicializarTags(tags) {
  const input = $('tagInput');
  const btnAdd = $('btnAddTag');
  const btnNova = $('btnNovaTag');
  const container = $('tagsContainer');

  if (!input || !btnAdd || !btnNova || !container) return;

  // Adiciona tag à lista quando usuário confirma
  function adicionarTag() {
    const valor = input.value.trim();
    if (!valor) return;

    // Valida limite de 3 tags
    if (tags.length >= 3) {
      alert('Máximo de 3 tags');
      return;
    }

    tags.push(valor);
    atualizarTagsVisual(container, tags);
    input.value = '';

    // Desabilita input ao atingir limite
    if (tags.length >= 3) {
      setDisabledById('btnNovaTag', true);
      setDisabledById('tagInput', true);
    }
  }

  // Adiciona tag ao clicar no botão
  btnAdd.addEventListener('click', adicionarTag);

  // Reabilita input ao clicar no botão nova tag
  btnNova.addEventListener('click', () => {
    input.disabled = false;
    input.focus();
  });

  // Adiciona tag ao pressionar Enter
  input.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      adicionarTag();
    }
  });
}

// Gera HTML das tags para exibição
export function gerarTags(tagsArray) {
  if (!tagsArray?.length) return '';

  return tagsArray
    .map(tag => `<span class="tag">${escaparHtml(tag)}</span>`)
    .join('');
}
