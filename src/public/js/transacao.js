import { apiFetch } from './config.js';

export async function criarTransacao() {
  const form = document.getElementById('formTransacao');
  form?.addEventListener('submit', async e => {
    e.preventDefault();

    await apiFetch(window.location.origin + '/transacoes', {
      method: 'POST',
      body: JSON.stringify({
        titulo: form.titulo.value,
        valor: Number(form.valor.value),
        tipo: form.tipo.value,
        conta: form.conta.value,
        categoria: form.categoria.value,
        status: form.status.value,
        recorrencia: form.recorrencia.value,
        parcelamento: {
          totalParcelas: Number(form.totalParcelas.value || 1),
          parcelaAtual: Number(form.parcelaAtual.value || 1)
        }
      })
    });

    listarTransacoes();
  });
}

export async function listarTransacoes() {
  const transacoes = await apiFetch(window.location.origin + '/transacoes');
  const container = document.getElementById('transacoes');
  if(container) container.innerHTML = '';

  transacoes.forEach(t => {
    container.innerHTML += `
      <div>
        <b>${t.titulo}</b> - ${t.tipo} - ${t.valor}
        <br>Conta: ${t.conta.nome} | Categoria: ${t.categoria.nome}
        <br>Status: ${t.status} | Recorrência: ${t.recorrencia} 
        | Parcela: ${t.parcelamento.parcelaAtual}/${t.parcelamento.totalParcelas}
        <button onclick="editarTransacao('${t._id}')">Editar</button>
        <button onclick="deletarTransacao('${t._id}')">Deletar</button>
      </div>
    `;
  });
}

window.editarTransacao = async id => {
  const novoTitulo = prompt('Novo título:');
  if(!novoTitulo) return;
  await apiFetch(`${window.location.origin}/transacoes/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ titulo: novoTitulo })
  });
  listarTransacoes();
};

window.deletarTransacao = async id => {
  if(!confirm('Deletar transação?')) return;
  await apiFetch(`${window.location.origin}/transacoes/${id}`, { method: 'DELETE' });
  listarTransacoes();
};
