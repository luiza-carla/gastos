import { apiFetch } from './config.js';
import { popularSelectContas } from './conta.js';
import { abrirModal, fecharModal } from './modalEditar.js';
import { abrirModalConfirmacao } from './modalDeletar.js';
import { formatarValor, criarCardsHTML, capitalizar } from './helpers/index.js';

const salarioBaseUrl = window.location.origin + '/salarios';

export function criarSalario(formId = 'formSalario', callback) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const valor = document.getElementById('valor')?.value;
    // const frequencia = document.getElementById('frequencia')?.value;
    // const dataRecebimento = document.getElementById('dataRecebimento')?.value;
    const conta = document.getElementById('contaSalario')?.value;

    await apiFetch(salarioBaseUrl, {
      method: 'POST',
      body: JSON.stringify({
        valor: Number(valor),
        // frequencia,
        // dataRecebimento,
        conta: conta || null
      })
    });

    form.reset();

    await listarSalarios();
    if (callback) callback();
  });
}

export async function listarSalarios() {
  const salarios = await apiFetch(salarioBaseUrl);

  const container = document.getElementById('salariosContainer');
  if (!container) return;

  container.innerHTML = '';

  const gerarItem = s => {
    const contaNome = s.conta ? s.conta.nome : 'Sem conta';
    return `
      <div class="salario-item">

        <div>
          <div class="salario-valor">R$ ${formatarValor(s.valor)}</div>
          <div class="salario-conta">Conta: ${contaNome}</div>
        </div>

        <div class="acoes-salario">

          <button class="btn-editar" onclick="editarSalario('${s._id}', ${s.valor})">
            <i class="fa-solid fa-pen"></i>
          </button>

          <button class="btn-deletar" onclick="deletarSalario('${s._id}')">
            <i class="fa-solid fa-trash"></i>
          </button>

        </div>

      </div>
    `;
  };

  container.innerHTML = criarCardsHTML(salarios, gerarItem);

  return salarios;
}

window.editarSalario = async (id) => {
  const novoValor = prompt('Novo valor:');
  if (!novoValor) return;

  await apiFetch(`${salarioBaseUrl}/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ valor: Number(novoValor) })
  });

  listarSalarios();
};

window.deletarSalario = async (id) => {
  abrirModalConfirmacao({
    titulo: 'Confirmar exclusão',
    mensagem: 'Tem certeza que deseja deletar este salário?',
    onConfirmar: async () => {
      await apiFetch(`${salarioBaseUrl}/${id}`, { method: 'DELETE' });
      fecharModal();
      await listarSalarios();
    }
  });
};

window.editarSalario = (id, valor) => {

  abrirModal({

    titulo: 'Editar salário',

    conteudoHTML: `
      <div class="form-group">
        <label>Valor</label>
        <input type="number" id="modalValorSalario" value="${valor}">
      </div>
    `,

    onSalvar: async () => {

      const novoValor = Number(
        document.getElementById('modalValorSalario')?.value
      );

      await apiFetch(`${salarioBaseUrl}/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ valor: novoValor })
      });

      fecharModal();
      listarSalarios();
    }

  });

};