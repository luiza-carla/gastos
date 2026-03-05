import { apiFetch } from './config.js';

const salarioBaseUrl = window.location.origin + '/salarios';

export function criarSalario() {
  const form = document.getElementById('formSalario');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const valor = document.getElementById('valor')?.value;
    const frequencia = document.getElementById('frequencia')?.value;
    const dataRecebimento = document.getElementById('dataRecebimento')?.value;

    await apiFetch(salarioBaseUrl, {
      method: 'POST',
      body: JSON.stringify({
        valor: Number(valor),
        frequencia,
        dataRecebimento
      })
    });

    form.reset();

    await listarSalarios();
  });
}

export async function listarSalarios() {
  const salarios = await apiFetch(salarioBaseUrl);

  const container = document.getElementById('salariosContainer');

  if (!container) return;

  container.innerHTML = '';

  salarios.forEach(s => {
    container.innerHTML += `
      <div>
        <b>R$ ${s.valor}</b> - ${s.frequencia}
        ${s.dataRecebimento ? `| Recebimento: ${new Date(s.dataRecebimento).toLocaleDateString()}` : ''}
        <button onclick="editarSalario('${s._id}')">Editar</button>
        <button onclick="deletarSalario('${s._id}')">Deletar</button>
      </div>
      <hr>
    `;
  });

  return salarios;
}

window.editarSalario = async (id) => {
  const novoValor = prompt('Novo valor:');

  if (!novoValor) return;

  await apiFetch(`${salarioBaseUrl}/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      valor: Number(novoValor)
    })
  });

  listarSalarios();
};

window.deletarSalario = async (id) => {
  if (!confirm('Deseja deletar este salário?')) return;

  await apiFetch(`${salarioBaseUrl}/${id}`, {
    method: 'DELETE'
  });

  listarSalarios();
};