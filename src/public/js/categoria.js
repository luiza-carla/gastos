import { apiFetch, getToken } from './config.js';
import { populateSelect } from './helpers/index.js';

const categoriaBaseUrl = window.location.origin + '/categorias';

export async function listarCategorias() {
  const token = getToken();
  if (!token) throw new Error('Token não encontrado');

  const categorias = await apiFetch(categoriaBaseUrl);

  const select = document.getElementById('categoria');

  if (select) {
    populateSelect(select, categorias, item => item._id, item => item.nome);
  }

  return categorias;
}

export async function inicializarCategorias() {
  await listarCategorias();
}