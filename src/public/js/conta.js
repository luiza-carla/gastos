import { apiFetch } from './config.js';

export async function listarContas() {
  const contas = await apiFetch(window.location.origin + '/contas');

  const container = document.getElementById('contas');
  if (container) {

    let html = '';

    contas.forEach(c => {
      html += `
        <div>
          <b>${c.nome}</b> (${c.tipo}) - Saldo: ${c.saldoInicial}
          <button onclick="editarConta('${c._id}')">Editar</button>
          <button onclick="deletarConta('${c._id}')">Deletar</button>
        </div>
        <hr>
      `;
    });

    container.innerHTML = html;
  }

  return contas;
}

export async function criarConta(formId) {
  const form = document.getElementById(formId);

  form?.addEventListener('submit', async e => {
    e.preventDefault();

    await apiFetch(window.location.origin + '/contas', {
      method: 'POST',
      body: JSON.stringify({
        nome: form.nome.value,
        tipo: form.tipo.value,
        saldoInicial: Number(form.saldoInicial.value || 0)
      })
    });

    listarContas();
  });
}

window.editarConta = async id => {
  const novoNome = prompt('Novo nome:');
  const novoTipo = prompt('Novo tipo (corrente/credito/dinheiro/investimento):');

  if (!novoNome || !novoTipo) return;

  await apiFetch(`${window.location.origin}/contas/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      nome: novoNome,
      tipo: novoTipo
    })
  });

  listarContas();
};

window.deletarConta = async id => {
  if (!confirm('Deletar conta?')) return;

  await apiFetch(`${window.location.origin}/contas/${id}`, {
    method: 'DELETE'
  });

  listarContas();
};

export async function popularSelectContas() {
  const select = document.getElementById('conta');
  if (!select) return;

  const contas = await listarContas();

  select.innerHTML = '';

  contas.forEach(c => {
    select.innerHTML += `
      <option value="${c._id}">
        ${c.nome} (${c.tipo})
      </option>
    `;
  });
}