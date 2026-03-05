import { apiFetch } from './config.js';

let tags = [];

function inicializarTags() {

  const input = document.getElementById('tagInput');
  const btnAdd = document.getElementById('btnAddTag');
  const btnNova = document.getElementById('btnNovaTag');
  const container = document.getElementById('tagsContainer');

  if (!input || !btnAdd || !btnNova || !container) return;

  function adicionarTag() {

    const valor = input.value.trim();

    if (!valor) return;

    if (tags.length >= 3) {
      alert('Máximo de 3 tags');
      return;
    }

    tags.push(valor);

    atualizarTagsVisual(container);

    input.value = '';

    if (tags.length >= 3) {
      btnNova.disabled = true;
      input.disabled = true;
    }
  }

  btnAdd.addEventListener('click', adicionarTag);

  btnNova.addEventListener('click', () => {
    input.disabled = false;
    input.focus();
  });

  input.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      adicionarTag();
    }
  });
}

function atualizarTagsVisual(container) {

  container.innerHTML = '';

  tags.forEach((tag, index) => {

    const tagEl = document.createElement('span');
    tagEl.textContent = tag + ' ✕';
    tagEl.style.marginRight = '8px';
    tagEl.style.cursor = 'pointer';
    tagEl.style.padding = '4px 8px';
    tagEl.style.background = '#eee';
    tagEl.style.borderRadius = '6px';
    tagEl.style.display = 'inline-block';

    tagEl.onclick = () => {

      tags.splice(index, 1);

      atualizarTagsVisual(container);

      const btnNova = document.getElementById('btnNovaTag');
      const input = document.getElementById('tagInput');

      btnNova.disabled = false;
      input.disabled = false;
    };

    container.appendChild(tagEl);
  });
}

export async function criarTransacao() {

  const form = document.getElementById('formTransacao');

  form?.addEventListener('submit', async e => {

    e.preventDefault();

    const conta = document.getElementById('conta')?.value;
    const categoria = document.getElementById('categoria')?.value;

    await apiFetch(window.location.origin + '/transacoes', {
      method: 'POST',
      body: JSON.stringify({
        titulo: form.titulo.value,
        valor: Number(form.valor.value),
        tipo: form.tipo.value,
        conta: conta,
        categoria: categoria,
        status: form.status.value,
        recorrencia: form.recorrencia.value,
        tags: tags,
        parcelamento: {
          totalParcelas: Number(form.totalParcelas.value || 1),
          parcelaAtual: Number(form.parcelaAtual.value || 1)
        }
      })
    });

    tags = [];
    atualizarTagsVisual(document.getElementById('tagsContainer'));

    document.getElementById('btnNovaTag').disabled = false;
    document.getElementById('tagInput').disabled = false;

    form.reset();

    listarTransacoes();
  });
}

export async function listarTransacoes() {

  const transacoes = await apiFetch(window.location.origin + '/transacoes');

  const container = document.getElementById('transacoes');

  if (!container) return;

  let html = '';

  transacoes.forEach(t => {

    html += `
      <div>
        <b>${t.titulo}</b> - ${t.tipo} - ${t.valor}
        <br>Conta: ${t.conta?.nome || 'Sem conta'} 
        | Categoria: ${t.categoria?.nome || 'Sem categoria'}
        <br>Tags: ${t.tags?.length ? t.tags.join(', ') : '-'}
        <br>Status: ${t.status} | Recorrência: ${t.recorrencia}
        | Parcela: ${t.parcelamento?.parcelaAtual || 1}/${t.parcelamento?.totalParcelas || 1}
        <br>
        <button onclick="editarTransacao('${t._id}')">Editar</button>
        <button onclick="deletarTransacao('${t._id}')">Deletar</button>
      </div>
      <hr>
    `;
  });

  container.innerHTML = html;
}

window.editarTransacao = async id => {

  const novoTitulo = prompt('Novo título:');

  if (!novoTitulo) return;

  await apiFetch(`${window.location.origin}/transacoes/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ titulo: novoTitulo })
  });

  listarTransacoes();
};

window.deletarTransacao = async id => {

  if (!confirm('Deletar transação?')) return;

  await apiFetch(`${window.location.origin}/transacoes/${id}`, {
    method: 'DELETE'
  });

  listarTransacoes();
};

document.addEventListener('DOMContentLoaded', () => {
  inicializarTags();
});