import { apiFetch } from './config.js';
import { limparCategoriaSelecionada } from './categoria.js';
import { abrirModal, fecharModal, abrirModalErro } from './modalEditar.js';
import { abrirModalConfirmacao } from './modalDeletar.js';
import { formatarValor, capitalizar, criarCardsHTML, setDisabledById, $, setHTMLById, escaparHtml } from './helpers/index.js';
import { criarBadgeCategoria, atualizarTagsVisual, inicializarTags, gerarTags } from './helpers/tagHelpers.js';

// Array para armazenar tags temporárias do formulário
let tags = [];

// Inicializa e gerencia envio do formulário de criação de desejo
export async function criarDesejo(formId = 'formListaDesejo') {
  const form = $(formId);
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const categoria = $('categoria')?.value;
    const tipoDespesa = $('tipoDespesa')?.value;

    // Valida que categoria foi selecionada (campo obrigatório)
    if (!categoria) {
      alert('Por favor, selecione uma categoria');
      return;
    }

    // Envia dados do desejo para API
    await apiFetch(window.location.origin + '/lista-desejos', {
      method: 'POST',
      body: JSON.stringify({
        titulo: form.titulo.value,
        valor: Number(form.valor.value),
        categoria,
        tipoDespesa: tipoDespesa || undefined,
        tags
      })
    });

    // Reseta estado do formulário
    tags = [];
    atualizarTagsVisual($('tagsContainer'), tags);
    setDisabledById('btnNovaTag', false);
    setDisabledById('tagInput', false);

    form.reset();
    limparCategoriaSelecionada();

    // Atualiza listagem na tela
    listarDesejos();
  });
}

// Lista todos os desejos do usuario e renderiza na tela
export async function listarDesejos() {
  const container = $('listaDesejos');
  if (!container) return;

  const desejos = await apiFetch(window.location.origin + '/lista-desejos');
  setHTMLById('listaDesejos', criarCardsHTML(desejos, criarCardDesejo));
}

// Cria HTML de um card de desejo para exibicao na lista
function criarCardDesejo(d) {
  const tipoDespesaCapitalizado = d.tipoDespesa ? capitalizar(d.tipoDespesa) : '';
  const valorFormatado = formatarValor(d.valor);
  const categoria = criarBadgeCategoria(d.categoria);
  const corCategoria = d.categoria?.cor || '#95a5a6';
  const tagsHtml = gerarTags(d.tags);

  return `
    <div class="transacao-card transacao-saida" style="--cor-categoria:${corCategoria};">
      <div class="transacao-header">
        <div class="transacao-titulo">${escaparHtml(d.titulo)}</div>
        <div class="transacao-valor transacao-saida">R$ ${valorFormatado}</div>
      </div>

      <div class="transacao-corpo">
        <div class="transacao-info-grid">
          <div class="info-linha">
            <span class="info-label">Categoria:</span>
            <span class="info-valor">${categoria}</span>
          </div>

          ${tipoDespesaCapitalizado ? `<div class="info-linha">
            <span class="info-label">Tipo de despesa:</span>
            <span class="info-valor">${tipoDespesaCapitalizado}</span>
          </div>` : ''}
        </div>

        ${tagsHtml ? `<div class="transacao-tags">${tagsHtml}</div>` : ''}
      </div>

      <div class="transacao-acoes">
        <button class="btn-realizar" onclick="realizarDesejo('${d._id}')" title="Realizar compra">
          <i class="fa-solid fa-circle-check"></i> Realizar
        </button>
        <button class="btn-editar" onclick="editarDesejo('${d._id}')" title="Editar">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn-deletar" onclick="deletarDesejo('${d._id}')" title="Deletar">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `;
}

// Abre modal para editar item da lista de desejos
window.editarDesejo = async id => {
  const desejo = (await apiFetch(window.location.origin + '/lista-desejos')).find(item => item._id === id);
  const categorias = await apiFetch(window.location.origin + '/categorias');

  if (!desejo) return;

  abrirModal({
    titulo: 'Editar item da lista de desejos',
    conteudoHTML: `
      <div class="form-group">
        <label>Titulo</label>
        <input type="text" id="modalTituloDesejo" value="${escaparHtml(desejo.titulo)}">
      </div>
      <div class="form-group">
        <label>Valor</label>
        <input type="number" id="modalValorDesejo" value="${desejo.valor}" step="0.01">
      </div>
      <div class="form-group">
        <label>Categoria</label>
        <select id="modalCategoriaDesejo">
          <option value="">-- Selecione --</option>
          ${categorias.map(c => `<option value="${c._id}" ${desejo.categoria?._id === c._id ? 'selected' : ''}>${escaparHtml(c.nome)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Tipo de Despesa</label>
        <select id="modalTipoDespesa">
          <option value="">-- Opcional --</option>
          <option value="essencial" ${desejo.tipoDespesa === 'essencial' ? 'selected' : ''}>Essencial</option>
          <option value="eventual" ${desejo.tipoDespesa === 'eventual' ? 'selected' : ''}>Eventual</option>
          <option value="opcional" ${desejo.tipoDespesa === 'opcional' ? 'selected' : ''}>Opcional</option>
        </select>
      </div>
    `,
    onSalvar: async () => {
      const novoTitulo = document.getElementById('modalTituloDesejo')?.value;
      const novoValor = Number(document.getElementById('modalValorDesejo')?.value);
      const novaCategoria = document.getElementById('modalCategoriaDesejo')?.value;
      const novoTipoDespesa = document.getElementById('modalTipoDespesa')?.value;

      // Valida campos obrigatórios
      if (!novoTitulo || !novoValor || !novaCategoria) {
        alert('Por favor, preencha todos os campos obrigatorios');
        return;
      }

      const dados = {
        titulo: novoTitulo,
        valor: novoValor,
        categoria: novaCategoria
      };

      if (novoTipoDespesa) {
        dados.tipoDespesa = novoTipoDespesa;
      }

      await apiFetch(`${window.location.origin}/lista-desejos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados)
      });

      fecharModal();
      listarDesejos();
    }
  });
};

// Converte um desejo em transacao real e remove da lista
window.realizarDesejo = async id => {
  const desejo = (await apiFetch(window.location.origin + '/lista-desejos')).find(item => item._id === id);
  const contas = await apiFetch(window.location.origin + '/contas');

  if (!desejo) return;

  abrirModal({
    titulo: 'Realizar compra',
    conteudoHTML: `
      <p style="margin-bottom: 16px; color: #666;">
        Transformar <strong>${escaparHtml(desejo.titulo)}</strong> em uma transacao real.
      </p>
      <div class="form-group">
        <label>Conta</label>
        <select id="modalContaDesejo" required>
          <option value="">-- Selecione uma conta --</option>
          ${contas.map(c => `<option value="${c._id}">${escaparHtml(c.nome)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Valor</label>
        <input type="number" id="modalValorTransacao" value="${desejo.valor}" step="0.01">
      </div>
      <div class="form-group">
        <label>Status do pagamento</label>
        <select id="modalStatusTransacao">
          <option value="pago">Pago</option>
          <option value="pendente">Pendente</option>
        </select>
      </div>
      <div class="form-group">
        <label>Data</label>
        <input type="date" id="modalDataTransacao" value="${new Date().toISOString().split('T')[0]}">
      </div>
    `,
    onSalvar: async () => {
      const conta = document.getElementById('modalContaDesejo')?.value;
      const valor = Number(document.getElementById('modalValorTransacao')?.value);
      const status = document.getElementById('modalStatusTransacao')?.value;
      const data = document.getElementById('modalDataTransacao')?.value;

      // Valida selecao de conta (obrigatorio para transacao)
      if (!conta) {
        alert('Por favor, selecione uma conta');
        return;
      }

      // Valida valor positivo
      if (!valor || valor <= 0) {
        alert('Por favor, informe um valor valido');
        return;
      }

      try {
        // Cria a transacao com dados do desejo
        await apiFetch(window.location.origin + '/transacoes', {
          method: 'POST',
          body: JSON.stringify({
            titulo: desejo.titulo,
            valor,
            tipo: 'saida',
            conta,
            categoria: desejo.categoria?._id,
            status,
            data: data || new Date().toISOString(),
            tags: desejo.tags || [],
            tipoDespesa: desejo.tipoDespesa,
            recorrencia: 'nenhuma',
            parcelamento: {
              totalParcelas: 1,
              parcelaAtual: 1
            }
          })
        });

        // Remove o desejo da lista apos conversao bem-sucedida
        await apiFetch(`${window.location.origin}/lista-desejos/${id}`, {
          method: 'DELETE'
        });

        fecharModal();
        listarDesejos();
        alert('Desejo realizado! Transacao criada com sucesso.');
      } catch (err) {
        fecharModal();
        abrirModalErro(err.message);
      }
    }
  });
};

// Remove item da lista de desejos com confirmacao
window.deletarDesejo = async id => {
  abrirModalConfirmacao({
    titulo: 'Confirmar exclusao',
    mensagem: 'Tem certeza que deseja deletar este item da lista de desejos?',
    onConfirmar: async () => {
      try {
        await apiFetch(`${window.location.origin}/lista-desejos/${id}`, {
          method: 'DELETE'
        });
        fecharModal();
        listarDesejos();
      } catch (err) {
        fecharModal();
        abrirModalErro(err.message);
      }
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  if ($('formListaDesejo')) {
    inicializarTags(tags);
  }
});
