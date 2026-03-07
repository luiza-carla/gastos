import { apiFetch, getToken } from './config.js';
import { $, setHTMLById, onEventById, addClass, removeClass, escaparHtml, removerAcentos } from './helpers/index.js';

// URL base da API de categorias
const categoriaBaseUrl = window.location.origin + '/categorias';

// Armazena todas as categorias para filtro
let todasCategorias = [];
let categoriaSelecionada = null;

function aplicarCorNoInputCategoria(cor = '') {
  const inputBusca = $('buscaCategoria');
  if (!inputBusca) return;

  if (!cor) {
    inputBusca.style.boxShadow = '';
    return;
  }

  // Usa sombra interna para nao alterar largura/padding do texto no input.
  inputBusca.style.boxShadow = `inset 4px 0 0 ${cor}`;
}

export function limparCategoriaSelecionada() {
  const inputBusca = $('buscaCategoria');
  const inputHidden = $('categoria');

  if (inputBusca) inputBusca.value = '';
  if (inputHidden) inputHidden.value = '';

  categoriaSelecionada = null;
  aplicarCorNoInputCategoria();
  esconderDropdown();
}

// Lista todas as categorias e popula select
export async function listarCategorias() {
  const token = getToken();
  if (!token) throw new Error('Token não encontrado');

  // Busca categorias da API
  const categorias = await apiFetch(categoriaBaseUrl);
  todasCategorias = categorias;

  return categorias;
}

// Exibe dropdown com categorias filtradas
function mostrarDropdown(categorias) {
  const dropdown = $('dropdownCategorias');
  if (!dropdown) return;

  if (categorias.length === 0) {
    setHTMLById('dropdownCategorias', '<div class="categoria-item">Nenhuma categoria encontrada</div>');
    addClass(dropdown, 'show');
    return;
  }

  const html = categorias.map(cat => 
    `<div class="categoria-item" data-id="${cat._id}" data-nome="${escaparHtml(cat.nome)}" data-cor="${cat.cor}">
      <span class="categoria-cor" style="background:${cat.cor};"></span>
      <span class="categoria-nome">${escaparHtml(cat.nome)}</span>
    </div>`
  ).join('');

  setHTMLById('dropdownCategorias', html);

  // Adiciona evento de clique em cada item
  dropdown.querySelectorAll('.categoria-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      const nome = item.getAttribute('data-nome');
      const cor = item.getAttribute('data-cor');
      if (id && nome) {
        selecionarCategoria(id, nome, cor);
      }
    });
  });

  addClass(dropdown, 'show');
}

// Esconde dropdown
function esconderDropdown() {
  const dropdown = $('dropdownCategorias');
  if (dropdown) {
    removeClass(dropdown, 'show');
  }
}

// Seleciona uma categoria
function selecionarCategoria(id, nome, cor = '') {
  const inputBusca = $('buscaCategoria');
  const inputHidden = $('categoria');

  if (inputBusca) inputBusca.value = nome;
  if (inputHidden) inputHidden.value = id;
  
  categoriaSelecionada = { id, nome, cor };
  aplicarCorNoInputCategoria(cor);
  esconderDropdown();
}

// Filtra categorias com base no texto de busca
export function filtrarCategorias(textoBusca) {
  const termo = removerAcentos(textoBusca.toLowerCase().trim());
  
  const categoriasFiltradas = termo
    ? todasCategorias.filter(cat => 
        removerAcentos(cat.nome.toLowerCase()).includes(termo)
      )
    : todasCategorias;

  mostrarDropdown(categoriasFiltradas);
}

// Inicializa categorias ao carregar a página
export async function inicializarCategorias() {
  await listarCategorias();
  
  const inputBusca = $('buscaCategoria');
  const dropdown = $('dropdownCategorias');
  
  // Mostra dropdown ao focar
  onEventById('buscaCategoria', 'focus', () => {
    filtrarCategorias(inputBusca?.value || '');
  });

  // Filtra ao digitar
  onEventById('buscaCategoria', 'input', (e) => {
    if (categoriaSelecionada && e.target.value !== categoriaSelecionada.nome) {
      const inputHidden = $('categoria');
      if (inputHidden) inputHidden.value = '';
      categoriaSelecionada = null;
      aplicarCorNoInputCategoria();
    }

    filtrarCategorias(e.target.value);
  });

  // Fecha dropdown ao clicar fora
  document.addEventListener('click', (e) => {
    const autocomplete = document.querySelector('.categoria-autocomplete');
    if (autocomplete && !autocomplete.contains(e.target) && dropdown) {
      removeClass(dropdown, 'show');
    }
  });

  // Garante limpeza visual da categoria quando formulario for resetado.
  const form = document.getElementById('formTransacao');
  form?.addEventListener('reset', () => {
    limparCategoriaSelecionada();
  });
}