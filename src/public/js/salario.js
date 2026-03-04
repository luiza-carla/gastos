import { apiFetch } from './config.js';

const salarioBaseUrl = window.location.origin + '/salarios';

export async function listarSalarios() {
  const salarios = await apiFetch(salarioBaseUrl);
  const container = document.getElementById('salariosContainer');
  if(container) container.innerHTML = '';
  salarios.forEach(s => {
    container.innerHTML += `
      <div>
        <b>R$ ${s.valor}</b> - ${s.frequencia} 
        ${s.dataRecebimento ? `| Recebimento: ${new Date(s.dataRecebimento).toLocaleDateString()}` : ''}
        <button onclick="editarSalario('${s._id}')">Editar</button>
        <button onclick="deletarSalario('${s._id}')">Deletar</button>
      </div>
    `;
  });
  return salarios;
}

export async function criarSalario(formId) {
  const form = document.getElementById(formId);
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    await apiFetch(salarioBaseUrl, {
      method: 'POST',
      body: JSON.stringify({
        valor: Number(form.valorSalario.value),
        frequencia: form.frequencia.value,
        dataRecebimento: form.dataRecebimento.value ? new Date(form.dataRecebimento.value) : null
      })
    });
    form.reset();
    listarSalarios();
  });
}

window.editarSalario = async id => {
  const novoValor = prompt('Novo valor:');
  const novaFrequencia = prompt('Nova frequência (mensal/semanal/diario/anual/outra):');
  if(!novoValor || !novaFrequencia) return;
  await apiFetch(`${salarioBaseUrl}/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ valor: Number(novoValor), frequencia: novaFrequencia })
  });
  listarSalarios();
};

window.deletarSalario = async id => {
  if(!confirm('Deseja deletar este salário?')) return;
  await apiFetch(`${salarioBaseUrl}/${id}`, { method: 'DELETE' });
  listarSalarios();
};