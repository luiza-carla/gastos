import { apiFetch, getToken } from './config.js';
import { $, setHTMLById, onEventById, addClass, removeClass } from './helpers/index.js';

// URL base da API de categorias
const categoriaBaseUrl = window.location.origin + '/categorias';

// Armazena todas as categorias para filtro
let todasCategorias = [];
let categoriaSelecionada = null;

// Remove acentos de uma string para busca insensível
function removerAcentos(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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
    `<div class="categoria-item" data-id="${cat._id}">${cat.nome}</div>`
  ).join('');

  setHTMLById('dropdownCategorias', html);

  // Adiciona evento de clique em cada item
  dropdown.querySelectorAll('.categoria-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      if (id) {
        selecionarCategoria(id, item.textContent);
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
function selecionarCategoria(id, nome) {
  const inputBusca = $('buscaCategoria');
  const inputHidden = $('categoria');

  if (inputBusca) inputBusca.value = nome;
  if (inputHidden) inputHidden.value = id;
  
  categoriaSelecionada = { id, nome };
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
    filtrarCategorias(e.target.value);
  });

  // Fecha dropdown ao clicar fora
  document.addEventListener('click', (e) => {
    const autocomplete = document.querySelector('.categoria-autocomplete');
    if (autocomplete && !autocomplete.contains(e.target) && dropdown) {
      removeClass(dropdown, 'show');
    }
  });
}