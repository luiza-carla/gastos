import { apiFetch } from './config.js';
import { abrirModal, fecharModal, abrirModalErro } from './modalEditar.js';
import { formatarValor, capitalizar, escaparHtml, $ } from './helpers/index.js';

// Obtém dados de carteira do usuário
export async function obterCarteira() {
  try {
    const carteira = await apiFetch('/carteira');
    return carteira;
  } catch (err) {
    console.error('Erro ao obter carteira:', err);
    return null;
  }
}

// Atualiza saldo da carteira na página
export async function exibirCarteira() {
  const carteira = await obterCarteira();
  const saldoElement = $('carteiraSaldo');

  if (saldoElement && carteira) {
    saldoElement.textContent = `R$ ${formatarValor(carteira.saldo)}`;
  }

  return carteira;
}

// Torna exibirCarteira acessível globalmente
window.exibirCarteira = exibirCarteira;

// Adiciona dinheiro à carteira
window.adicionarDinheiro = async () => {
  abrirModal({
    titulo: 'Adicionar dinheiro',
    conteudoHTML: `
      <div class="form-group">
        <label>Valor a adicionar</label>
        <input type="number" id="modalValorDinheiro" step="0.01" min="0" required>
      </div>
    `,
    onSalvar: async () => {
      const valor = parseFloat($('modalValorDinheiro')?.value);

      if (!valor || valor <= 0) {
        abrirModalErro('Valor inválido');
        return;
      }

      try {
        await apiFetch('/carteira', {
          method: 'PUT',
          body: JSON.stringify({ valor }),
        });

        fecharModal();
        await exibirCarteira();
      } catch (err) {
        abrirModalErro(err.message);
      }
    },
  });
};

// Remove dinheiro da carteira
window.removerDinheiro = async () => {
  const carteira = await obterCarteira();

  abrirModal({
    titulo: 'Remover dinheiro',
    conteudoHTML: `
      <div class="form-group">
        <label>Valor a remover</label>
        <input type="number" id="modalValorRemover" step="0.01" min="0" required>
      </div>
      <div class="form-group">
        <small style="color: var(--cinza-texto);">Saldo disponível: R$ ${formatarValor(carteira.saldo)}</small>
      </div>
    `,
    onSalvar: async () => {
      const valor = parseFloat($('modalValorRemover')?.value);

      if (!valor || valor <= 0) {
        abrirModalErro('Valor inválido');
        return;
      }

      if (valor > carteira.saldo) {
        abrirModalErro('Saldo insuficiente na carteira');
        return;
      }

      try {
        await apiFetch('/carteira', {
          method: 'PUT',
          body: JSON.stringify({ valor: -valor }),
        });

        fecharModal();
        await exibirCarteira();
      } catch (err) {
        abrirModalErro(err.message);
      }
    },
  });
};

// Abre modal de transferência da carteira para conta
window.abrirTransferencia = async () => {
  const carteira = await obterCarteira();
  const contas = await apiFetch('/contas');

  if (!contas || contas.length === 0) {
    abrirModalErro('Você precisa ter pelo menos uma conta para transferir');
    return;
  }

  let optionsHTML = contas
    .map(
      (c) =>
        `<option value="${c._id}">${escaparHtml(c.nome)} (${capitalizar(c.tipo)})</option>`
    )
    .join('');

  abrirModal({
    titulo: 'Transferir para conta',
    conteudoHTML: `
      <div class="form-group">
        <label>Conta de destino</label>
        <select id="modalContaTransferencia" required>
          <option value="" selected disabled>Selecione a conta</option>
          ${optionsHTML}
        </select>
      </div>
      <div class="form-group">
        <label>Valor</label>
        <input type="number" id="modalValorTransferencia" step="0.01" min="0" required>
      </div>
      <div class="form-group">
        <small style="color: var(--cinza-texto);">Saldo disponível: R$ ${formatarValor(carteira.saldo)}</small>
      </div>
    `,
    onSalvar: async () => {
      const contaId = $('modalContaTransferencia')?.value;
      const valor = parseFloat($('modalValorTransferencia')?.value);

      if (!contaId || !valor || valor <= 0) {
        abrirModalErro('Preencha o campo com um valor válido');
        return;
      }

      if (valor > carteira.saldo) {
        abrirModalErro('Saldo insuficiente na carteira');
        return;
      }

      try {
        await apiFetch('/carteira/transferir', {
          method: 'POST',
          body: JSON.stringify({
            contaId,
            valor,
            direcao: 'carteira-para-conta',
          }),
        });

        fecharModal();
        await exibirCarteira();
        if (window.listarContas) {
          await window.listarContas();
        }
      } catch (err) {
        abrirModalErro(err.message);
      }
    },
  });
};
