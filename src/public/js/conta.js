import { apiFetch } from './config.js';
import { abrirModal, fecharModal, abrirModalErro } from './modalEditar.js';
import { abrirModalConfirmacao } from './modalDeletar.js';
import {
  formatarValor,
  criarOpcao,
  criarCardsHTML,
  capitalizar,
  $,
  clearElement,
  setHTMLById,
} from './helpers/index.js';

// Lista todas as contas do usuário
export async function listarContas() {
  const contas = await apiFetch('/contas');

  const container = $('contas');

  if (container) {
    const gerarCard = (c) => `
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

    setHTMLById('contas', criarCardsHTML(contas, gerarCard));
  }

  return contas;
}

// Cria nova conta a partir de formulário
export async function criarConta(formId, callback) {
  const form = $(formId);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    await apiFetch(window.location.origin + '/contas', {
      method: 'POST',
      body: JSON.stringify({
        nome: form.nome.value,
        tipo: form.tipo.value,
        saldo: Number(form.saldoInicial.value || 0),
      }),
    });

    listarContas();
    if (callback) callback();
  });
}

// Abre modal para editar conta existente
window.editarConta = async (id) => {
  const conta = (await apiFetch('/contas')).find((c) => c._id === id);
  if (!conta) return;

  abrirModal({
    titulo: 'Editar conta',
    conteudoHTML: `
      <div class="form-group">
        <label>Nome</label>
        <input type="text" id="modalNomeConta" value="${conta.nome}" required>
      </div>
      <div class="form-group">
        <label>Tipo</label>
        <select id="modalTipoConta" required>
          <option value="corrente" ${conta.tipo === 'corrente' ? 'selected' : ''}>Corrente</option>
          <option value="credito" ${conta.tipo === 'credito' ? 'selected' : ''}>Crédito</option>
          <option value="dinheiro" ${conta.tipo === 'dinheiro' ? 'selected' : ''}>Dinheiro</option>
          <option value="investimento" ${conta.tipo === 'investimento' ? 'selected' : ''}>Investimento</option>
        </select>
      </div>
    `,
    onSalvar: async () => {
      const novoNome = $('modalNomeConta')?.value;
      const novoTipo = $('modalTipoConta')?.value;

      if (!novoNome || !novoTipo) return;

      await apiFetch(`${window.location.origin}/contas/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          nome: novoNome,
          tipo: novoTipo,
        }),
      });

      fecharModal();
      listarContas();
    },
  });
};

// Abre modal de confirmação para deletar conta
window.deletarConta = async (id) => {
  abrirModalConfirmacao({
    titulo: 'Confirmar exclusão',
    mensagem: 'Tem certeza que deseja deletar esta conta?',
    onConfirmar: async () => {
      try {
        await apiFetch(`${window.location.origin}/contas/${id}`, {
          method: 'DELETE',
        });
        fecharModal();
        listarContas();
      } catch (err) {
        fecharModal();
        abrirModalErro(err.message);
      }
    },
  });
};

// Popula select com lista de contas disponíveis
export async function popularSelectContas(selectId = 'conta') {
  const select = $(selectId);
  if (!select) return;

  const contas = await listarContas();

  clearElement(select);

  const placeholderTexto = 'Selecione a conta';

  const placeholderAttrs =
    selectId === 'contaSalario' ? 'selected' : 'selected disabled';

  select.innerHTML = `<option value="" ${placeholderAttrs}>${placeholderTexto}</option>`;

  contas.forEach((c) => {
    select.innerHTML += criarOpcao(c._id, `${c.nome} (${capitalizar(c.tipo)})`);
  });
}
