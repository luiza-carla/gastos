import { apiFetch, getToken } from './config.js';

const categoriaBaseUrl = window.location.origin + '/categorias';

export async function listarCategorias() {
  const token = getToken();
  if (!token) throw new Error('Token não encontrado');

  const categorias = await apiFetch(categoriaBaseUrl);

  const select = document.getElementById('categoria');

  if (select) {
    select.innerHTML = '';

    categorias.forEach(c => {
      const option = document.createElement('option');
      option.value = c._id;
      option.textContent = `${c.nome}`;
      select.appendChild(option);
    });
  }

  return categorias;
}

export async function inicializarCategorias() {
  await listarCategorias();
}