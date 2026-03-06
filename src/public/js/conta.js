import { apiFetch } from './config.js';
import { abrirModal, fecharModal } from './modalEditar.js';
import { abrirModalConfirmacao } from './modalDeletar.js';
import { formatarValor, criarOpcao, criarCardsHTML, capitalizar } from './helpers/index.js';

export async function listarContas(){

const contas = await apiFetch('/contas');

const container = document.getElementById('contas');

if (container) {
  const gerarCard = c => `
  <div class="conta-card">

  <div class="conta-nome">
  <i class="fa-solid fa-wallet"></i>
  ${c.nome}
  </div>

  <div class="conta-tipo">
  Tipo: ${capitalizar(c.tipo)}
  </div>

  <div class="conta-saldo">
  R$ ${formatarValor(c.saldo)}
  </div>

  <div class="conta-acoes">

  <button class="btn-editar" onclick="editarConta('${c._id}')">
  <i class="fa-solid fa-pen"></i>
  </button>

  <button class="btn-deletar" onclick="deletarConta('${c._id}')">
  <i class="fa-solid fa-trash"></i>
  </button>

  </div>

  </div>
  `;

  container.innerHTML = criarCardsHTML(contas, gerarCard);
}

return contas;

}

export async function criarConta(formId, callback) {
  const form = document.getElementById(formId);

  form?.addEventListener('submit', async e => {
    e.preventDefault();

    await apiFetch(window.location.origin + '/contas', {
      method: 'POST',
      body: JSON.stringify({
        nome: form.nome.value,
        tipo: form.tipo.value,
        saldo: Number(form.saldoInicial.value || 0)
      })
    });

    listarContas();
    if (callback) callback();
  });
}

window.editarConta = async id => {
  abrirModal({
    titulo: 'Editar conta',
    conteudoHTML: `
      <div class="form-group">
        <label>Nome</label>
        <input type="text" id="modalNomeConta" placeholder="Digite o nome da conta">
      </div>
      <div class="form-group">
        <label>Tipo</label>
        <select id="modalTipoConta">
          <option value="">-- Selecione --</option>
          <option value="corrente">Corrente</option>
          <option value="credito">Crédito</option>
          <option value="dinheiro">Dinheiro</option>
          <option value="investimento">Investimento</option>
        </select>
      </div>
    `,
    onSalvar: async () => {
      const novoNome = document.getElementById('modalNomeConta')?.value;
      const novoTipo = document.getElementById('modalTipoConta')?.value;

      if (!novoNome || !novoTipo) return;

      await apiFetch(`${window.location.origin}/contas/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          nome: novoNome,
          tipo: novoTipo
        })
      });

      fecharModal();
      listarContas();
    }
  });
};

window.deletarConta = async id => {
  abrirModalConfirmacao({
    titulo: 'Confirmar exclusão',
    mensagem: 'Tem certeza que deseja deletar esta conta?',
    onConfirmar: async () => {
      await apiFetch(`${window.location.origin}/contas/${id}`, {
        method: 'DELETE'
      });
      fecharModal();
      listarContas();
    }
  });
};

export async function popularSelectContas(selectId = 'conta') {
  const select = document.getElementById(selectId);
  if (!select) return;

  const contas = await listarContas();

  select.innerHTML = '';

  contas.forEach(c => {
    select.innerHTML += criarOpcao(c._id, `${c.nome} (${capitalizar(c.tipo)})`);
  });
}