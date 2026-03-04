import { apiFetch, getToken } from './config.js';

const categoriaBaseUrl = window.location.origin + '/categorias';

export async function listarCategorias() {
  const token = getToken();
  if (!token) throw new Error('Token não encontrado');

  const categorias = await apiFetch(categoriaBaseUrl);

  const select = document.getElementById('categoria');
  const container = document.getElementById('categoriasContainer');

  if (select) {
    select.innerHTML = '';
    categorias.forEach(c => {
      select.innerHTML += `<option value="${c._id}">${c.nome} (${c.tipo})</option>`;
    });
  }

  if (container) {
    container.innerHTML = '';
    categorias.forEach(c => {
      const div = document.createElement('div');
      div.innerHTML = `
        <b>${c.nome}</b> (${c.tipo})
        <button onclick="editarCategoria('${c._id}', '${c.nome}', '${c.tipo}')">Editar</button>
        <button onclick="deletarCategoria('${c._id}')">Deletar</button>
      `;
      container.appendChild(div);
    });
  }

  return categorias;
}

export async function criarCategoria(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const nome = form.nomeCategoria.value;
    const tipo = form.tipoCategoria.value;

    if (!nome || !tipo) return;

    const token = getToken();
    if (!token) throw new Error('Token não encontrado');

    await apiFetch(categoriaBaseUrl, {
      method: 'POST',
      body: JSON.stringify({ nome, tipo })
    });

    form.reset();
    await listarCategorias();
  });
}

export async function editarCategoria(id, nomeAtual, tipoAtual) {
  const novoNome = prompt('Novo nome:', nomeAtual);
  const novoTipo = prompt('Novo tipo (receita/despesa):', tipoAtual);
  if (!novoNome || !novoTipo) return;

  await apiFetch(`${categoriaBaseUrl}/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ nome: novoNome, tipo: novoTipo })
  });
  alert('Categoria atualizada!');
  listarCategorias();
}

export async function deletarCategoria(id) {
  if (!confirm('Deseja realmente deletar esta categoria?')) return;

  await apiFetch(`${categoriaBaseUrl}/${id}`, { method: 'DELETE' });
  alert('Categoria deletada!');
  listarCategorias();
}

export async function inicializarCategorias() {
  await listarCategorias();
}