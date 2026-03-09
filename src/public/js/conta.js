import { apiFetch } from './config.js';
import { abrirModal, fecharModal, abrirModalErro, mostrarErroInline, limparErroInline } from './modalEditar.js';
import { abrirModalConfirmacao } from './modalDeletar.js';
import {
  formatarValor,
  criarOpcao,
  criarCardsHTML,
  populateSelect,
  capitalizar,
  escaparHtml,
  $,
  setHTMLById,
} from './helpers/index.js';

const VALOR_CARTEIRA = 'carteira';

async function buscarContas() {
  return apiFetch('/contas');
}

function formatarNomeConta(conta) {
  return `${escaparHtml(conta.nome)} (${capitalizar(conta.tipo)})`;
}

async function atualizarSaldosTela() {
  await listarContas();

  if (window.exibirCarteira) {
    await window.exibirCarteira();
  }
}

// Lista todas as contas do usuário
export async function listarContas() {
  const contas = await buscarContas();

  const container = $('contas');

  if (container) {
    const gerarCard = (c) => `
  <div class="conta-card">

  <div class="conta-nome">
  ${escaparHtml(c.nome)}
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

  <button class="btn-transferir-conta" onclick="transferirDaConta('${c._id}')">
  <i class="fa-solid fa-exchange"></i>
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

// Torna listarContas acessível globalmente
window.listarContas = listarContas;

// Cria nova conta a partir de formulário
export async function criarConta(formId, callback) {
  const form = $(formId);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    await apiFetch('/contas', {
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
  const conta = (await buscarContas()).find((c) => c._id === id);
  if (!conta) return;

  abrirModal({
    titulo: 'Editar conta',
    conteudoHTML: `
      <div class="form-group">
        <label>Nome</label>
        <input type="text" id="modalNomeConta" value="${escaparHtml(conta.nome)}" required>
      </div>
      <div class="form-group">
        <label>Tipo</label>
        <select id="modalTipoConta" required>
          <option value="corrente" ${conta.tipo === 'corrente' ? 'selected' : ''}>Corrente</option>
          <option value="credito" ${conta.tipo === 'credito' ? 'selected' : ''}>Crédito</option>
          <option value="investimento" ${conta.tipo === 'investimento' ? 'selected' : ''}>Investimento</option>
        </select>
      </div>
    `,
    onSalvar: async () => {
      limparErroInline();
      
      const novoNome = $('modalNomeConta')?.value;
      const novoTipo = $('modalTipoConta')?.value;

      if (!novoNome || !novoTipo) {
        mostrarErroInline('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      try {
        await apiFetch(`/contas/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            nome: novoNome,
            tipo: novoTipo,
          }),
        });

        fecharModal();
        listarContas();
      } catch (err) {
        mostrarErroInline(err.message || 'Erro ao atualizar conta');
      }
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
        await apiFetch(`/contas/${id}`, { method: 'DELETE' });
        fecharModal();
        listarContas();
      } catch (err) {
        abrirModalErro(err.message);
      }
    },
  });
};

// Popula select com lista de contas disponíveis
export async function popularSelectContas(selectId = 'conta') {
  const select = $(selectId);
  if (!select) return;

  const contas = await buscarContas();

  const placeholderTexto = 'Selecione a conta';

  const placeholderAttrs =
    selectId === 'contaSalario' ? 'selected' : 'selected disabled';

  select.innerHTML = `<option value="" ${placeholderAttrs}>${placeholderTexto}</option>`;

  if (selectId === 'conta') {
    select.innerHTML += criarOpcao(
      VALOR_CARTEIRA,
      'Carteira (dinheiro físico)'
    );
  }

  populateSelect(
    select,
    contas,
    (conta) => conta._id,
    (conta) => formatarNomeConta(conta)
  );
}

// Abre modal de transferência de conta para conta ou carteira
window.transferirDaConta = async (contaOrigemId) => {
  const contas = await buscarContas();
  const contaOrigem = contas.find((c) => c._id === contaOrigemId);

  if (!contaOrigem) return;

  // Outras contas (exceto a de origem)
  const outrasContas = contas.filter((c) => c._id !== contaOrigemId);

  let optionsHTML = `<option value="${VALOR_CARTEIRA}">Dinheiro físico</option>`;

  outrasContas.forEach((c) => {
    optionsHTML += `<option value="${c._id}">${formatarNomeConta(c)}</option>`;
  });

  abrirModal({
    titulo: 'Transferir de conta',
    conteudoHTML: `
      <div class="form-group">
        <label>De</label>
        <input type="text" value="${escaparHtml(contaOrigem.nome)}" disabled>
      </div>
      <div class="form-group">
        <label>Para</label>
        <select id="modalContaDestino" required>
          <option value="" selected disabled>Selecione o destino</option>
          ${optionsHTML}
        </select>
      </div>
      <div class="form-group">
        <label>Valor</label>
        <input type="number" id="modalValorTransferenciaConta" step="0.01" min="0" required>
      </div>
      <div class="form-group">
        <small style="color: var(--cinza-texto);">Saldo disponível: R$ ${formatarValor(contaOrigem.saldo)}</small>
      </div>
    `,
    onSalvar: async () => {
      const destino = $('modalContaDestino')?.value;
      const valor = parseFloat($('modalValorTransferenciaConta')?.value);

      if (!destino || !valor || valor <= 0) {
        abrirModalErro('Preencha todos os campos com valores válidos');
        return;
      }

      if (valor > contaOrigem.saldo) {
        abrirModalErro('Saldo insuficiente na conta');
        return;
      }

      try {
        // Se o destino é carteira
        if (destino === VALOR_CARTEIRA) {
          await apiFetch('/carteira/transferir', {
            method: 'POST',
            body: JSON.stringify({
              contaId: contaOrigemId,
              valor,
              direcao: 'conta-para-carteira',
            }),
          });
        } else {
          // Transferência entre contas
          await apiFetch(`/contas/${contaOrigemId}/transferir`, {
            method: 'POST',
            body: JSON.stringify({
              contaDestinoId: destino,
              valor,
            }),
          });
        }

        fecharModal();
        await atualizarSaldosTela();
      } catch (err) {
        abrirModalErro(err.message);
      }
    },
  });
};

