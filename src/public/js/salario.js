import { apiFetch } from './config.js';
import { abrirModal, fecharModal, abrirModalErro } from './modalEditar.js';
import { abrirModalConfirmacao } from './modalDeletar.js';
import {
  formatarValor,
  criarCardsHTML,
  capitalizar,
  $,
  clearElement,
  setHTMLById,
} from './helpers/index.js';
import { listarContas } from './conta.js';
import { carregarResumo } from './inicio.js';

// URL base da API de salarios
const salarioBaseUrl = window.location.origin + '/salarios';

// Popula select com dias possiveis de recebimento
function popularSelectDiasRecebimento(
  selectId = 'diaRecebimento',
  diaPadrao = 5
) {
  const select = $(selectId);
  if (!select) return;

  select.innerHTML = '<option value="">-- Selecione o dia --</option>';

  for (let dia = 1; dia <= 31; dia++) {
    const option = document.createElement('option');
    option.value = String(dia);
    option.textContent = `Dia ${dia}`;
    if (dia === diaPadrao) {
      option.selected = true;
    }
    select.appendChild(option);
  }
}

// Atualiza telas que dependem de contas e resumo
async function atualizarVisoesRelacionadas() {
  if ($('contas')) {
    await listarContas();
  }

  if ($('saldoFinal')) {
    await carregarResumo();
  }
}

// Inicializa envio do formulario de salario
export function criarSalario(formId = 'formSalario', callback) {
  const form = $(formId);
  if (!form) return;

  popularSelectDiasRecebimento();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const valor = $('valor')?.value;
    const diaRecebimento = $('diaRecebimento')?.value;
    const conta = $('contaSalario')?.value;

    await apiFetch(salarioBaseUrl, {
      method: 'POST',
      body: JSON.stringify({
        valor: Number(valor),
        diaRecebimento: Number(diaRecebimento),
        frequencia: 'mensal',
        conta: conta || null,
      }),
    });

    form.reset();

    const selectDiaRecebimento = $('diaRecebimento');
    if (selectDiaRecebimento) {
      selectDiaRecebimento.value = '5';
    }

    await listarSalarios();
    await atualizarVisoesRelacionadas();
    if (callback) callback();
  });
}

// Lista salarios do usuario na tela
export async function listarSalarios() {
  const salarios = await apiFetch(salarioBaseUrl);

  const container = $('salariosContainer');
  if (!container) return;

  clearElement(container);

  const gerarItem = (s) => {
    const contaNome = s.conta ? s.conta.nome : 'Sem conta';
    const diaRecebimento = s.diaRecebimento || 5;
    return `
      <div class="salario-item">

        <div>
          <div class="salario-valor">R$ ${formatarValor(s.valor)}</div>
          <div class="salario-conta">Conta: ${contaNome}</div>
          <div class="salario-dia">Recebimento: Todo dia ${diaRecebimento}</div>
        </div>

        <div class="acoes-salario">

          <button class="btn-editar" onclick="editarSalario('${s._id}', ${s.valor}, ${diaRecebimento})">
            <i class="fa-solid fa-pen"></i>
          </button>

          <button class="btn-deletar" onclick="deletarSalario('${s._id}')">
            <i class="fa-solid fa-trash"></i>
          </button>

        </div>

      </div>
    `;
  };

  setHTMLById('salariosContainer', criarCardsHTML(salarios, gerarItem));

  return salarios;
}

// Abre fluxo de confirmacao para deletar salario
window.deletarSalario = async (id) => {
  abrirModalConfirmacao({
    titulo: 'Confirmar exclusão',
    mensagem: 'Tem certeza que deseja deletar este salário?',
    onConfirmar: async () => {
      try {
        await apiFetch(`${salarioBaseUrl}/${id}`, { method: 'DELETE' });
        fecharModal();
        await listarSalarios();
        await atualizarVisoesRelacionadas();
      } catch (err) {
        fecharModal();
        abrirModalErro(err.message);
      }
    },
  });
};

// Abre modal para edicao de salario
window.editarSalario = (id, valor, diaRecebimento) => {
  abrirModal({
    titulo: 'Editar salário',

    conteudoHTML: `
      <div class="form-group">
        <label>Valor</label>
        <input type="number" id="modalValorSalario" value="${valor}">
      </div>
      <div class="form-group">
        <label>Dia do recebimento</label>
        <select id="modalDiaRecebimento">
          ${[...Array(31)]
            .map((_, i) => {
              const dia = i + 1;
              const selected = dia === diaRecebimento ? 'selected' : '';
              return `<option value="${dia}" ${selected}>Dia ${dia}</option>`;
            })
            .join('')}
        </select>
      </div>
    `,

    onSalvar: async () => {
      const novoValor = Number(
        document.getElementById('modalValorSalario')?.value
      );
      const novoDiaRecebimento = Number(
        document.getElementById('modalDiaRecebimento')?.value
      );

      await apiFetch(`${salarioBaseUrl}/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          valor: novoValor,
          diaRecebimento: novoDiaRecebimento,
          frequencia: 'mensal',
        }),
      });

      fecharModal();
      await listarSalarios();
      await atualizarVisoesRelacionadas();
    },
  });
};
