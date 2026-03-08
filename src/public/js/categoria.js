import { apiFetch, getToken } from './config.js';
import { $, onEventById, setupCategoriaAutocomplete } from './helpers/index.js';

// URL base da API de categorias
const categoriaBaseUrl = window.location.origin + '/categorias';

// Armazena todas as categorias para filtro
let todasCategorias = [];
let categoriaAutocomplete = null;

export function limparCategoriaSelecionada() {
  categoriaAutocomplete?.limpar?.();
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

// Filtra categorias com base no texto de busca
export function filtrarCategorias(textoBusca) {
  categoriaAutocomplete?.filtrar?.(textoBusca || '');
}

// Inicializa categorias ao carregar a página
export async function inicializarCategorias() {
  await listarCategorias();

  categoriaAutocomplete = setupCategoriaAutocomplete(
    'buscaCategoria',
    'categoria',
    'dropdownCategorias',
    todasCategorias
  );

  // Garante limpeza visual da categoria quando formulario for resetado.
  const form = $('formTransacao');
  form?.addEventListener('reset', () => {
    limparCategoriaSelecionada();
  });

  const formDesejo = $('formListaDesejo');
  formDesejo?.addEventListener('reset', () => {
    limparCategoriaSelecionada();
  });

  // Mantem compatibilidade com quem chamar filtrarCategorias manualmente.
  onEventById('buscaCategoria', 'focus', () => {
    filtrarCategorias($('buscaCategoria')?.value || '');
  });
}
