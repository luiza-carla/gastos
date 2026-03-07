import { apiFetch } from './config.js';
import { limparCategoriaSelecionada } from './categoria.js';
import { abrirModal, fecharModal, abrirModalErro } from './modalEditar.js';
import { abrirModalConfirmacao } from './modalDeletar.js';
import { formatarValor, capitalizar, criarCardsHTML, showById, hideById, setDisabledById, showElement, hideElement, $, clearElement, setHTMLById, escaparHtml } from './helpers/index.js';
import { criarBadgeCategoria, atualizarTagsVisual, inicializarTags, gerarTags } from './helpers/tagHelpers.js';

// Armazena tags temporarias do formulario
let tags = [];

// Inicializa envio do formulario de transacao
export async function criarTransacao(formId = 'formTransacao') {

  const form = $(formId);
  const tipoSelect = $('tipo');
  const tipoDespesaSelect = $('tipoDespesaContainer')?.querySelector('#tipoDespesa');
  const recorrenciaSelect = $('recorrencia');
  const parcelasContainer = $('parcelasContainer');

  // Controla exibicao de campos condicionais
  tipoSelect?.addEventListener('change', () => {
    if (tipoSelect.value === 'saida') {
      showById('tipoDespesaContainer');
    } else {
      hideById('tipoDespesaContainer');
      tipoDespesaSelect.value = '';
    }
  });

  recorrenciaSelect?.addEventListener('change', () => {
    if (recorrenciaSelect.value === 'nenhuma') {
      hideElement(parcelasContainer);
    } else {
      showElement(parcelasContainer);
    }
  });

  // Envia dados da transacao para API
  form?.addEventListener('submit', async e => {

    e.preventDefault();

    const conta = $('conta')?.value;
    const categoria = $('categoria')?.value;
    const tipoDespesa = tipoSelect.value === 'saida' ? tipoDespesaSelect.value : null;

    await apiFetch(window.location.origin + '/transacoes', {
      method: 'POST',
      body: JSON.stringify({
        titulo: form.titulo.value,
        valor: Number(form.valor.value),
        tipo: tipoSelect.value,
        tipoDespesa,
        conta: conta,
        categoria: categoria,
        status: form.status.value,
        recorrencia: form.recorrencia.value,
        tags: tags,
        parcelamento: {
          totalParcelas: Number(form.totalParcelas.value || 1),
          parcelaAtual: Number(form.parcelaAtual.value || 1)
        }
      })
    });

    tags = [];
    atualizarTagsVisual($('tagsContainer'), tags);

    setDisabledById('btnNovaTag', false);
    setDisabledById('tagInput', false);

    form.reset();
    limparCategoriaSelecionada();

    listarTransacoes();
  });
}

// Lista transacoes do usuario na tela
export async function listarTransacoes() {

  const container = $('transacoes');
// Gera HTML de um card de transacao
  if (!container) return;

  const transacoes = await apiFetch(window.location.origin + '/transacoes');
// Gera HTML das tags da transacao

  setHTMLById('transacoes', criarCardsHTML(transacoes, criarCardTransacao));
}


function criarCardTransacao(t) {

  const tipoClasse = t.tipo === 'entrada'
    ? 'transacao-entrada'
    : 'transacao-saida';

  const tipoCapitalizado = capitalizar(t.tipo);
  const tipoDespesaCapitalizado = t.tipoDespesa ? capitalizar(t.tipoDespesa) : '';
  const recorrenciaCapitalizada = t.recorrencia && t.recorrencia.toLowerCase() !== 'nenhuma'
    ? capitalizar(t.recorrencia)
    : '';
  const statusCapitalizado = capitalizar(t.status);
  
  const temRecorrencia = t.recorrencia && t.recorrencia.toLowerCase() !== 'nenhuma';

  const valorFormatado = formatarValor(t.valor);

  const conta = t.conta?.nome || 'Sem conta';
  const categoria = criarBadgeCategoria(t.categoria);
  const corCategoria = t.categoria?.cor || '#95a5a6';

  const tags = gerarTags(t.tags);

  const parcelaAtual = t.parcelamento?.parcelaAtual || 1;
  const totalParcelas = t.parcelamento?.totalParcelas || 1;

  return `
    <div class="transacao-card ${tipoClasse}" style="--cor-categoria:${corCategoria};">

      <div class="transacao-header">
        <div class="transacao-titulo">
          ${escaparHtml(t.titulo)}
        </div>
        <div class="transacao-valor ${tipoClasse}">
          R$ ${valorFormatado}
        </div>
      </div>

      <div class="transacao-corpo">
        <div class="transacao-info-grid">
          
          <div class="info-linha">
            <span class="info-label">Tipo:</span>
            <span class="info-valor">${tipoCapitalizado}${tipoDespesaCapitalizado ? ' • ' + tipoDespesaCapitalizado : ''}</span>
          </div>

          <div class="info-linha">
            <span class="info-label">Categoria:</span>
            <span class="info-valor">${categoria}</span>
          </div>

          <div class="info-linha">
            <span class="info-label">Conta:</span>
            <span class="info-valor">${escaparHtml(conta)}</span>
          </div>

          <div class="info-linha">
            <span class="info-label">Status:</span>
            <span class="info-valor">${statusCapitalizado}</span>
          </div>

          <div class="info-linha">
            <span class="info-label">Recorrência:</span>
            <span class="info-valor">${recorrenciaCapitalizada || 'Nenhuma'}</span>
          </div>

          ${temRecorrencia ? `<div class="info-linha">
            <span class="info-label">Parcela:</span>
            <span class="info-valor">${parcelaAtual}/${totalParcelas}</span>
          </div>` : ''}
        </div>

        ${tags ? `<div class="transacao-tags">
          ${tags}
        </div>` : ''}
      </div>

      <div class="transacao-acoes">
        <button class="btn-editar" onclick="editarTransacao('${t._id}')" title="Editar">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn-deletar" onclick="deletarTransacao('${t._id}')" title="Deletar">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>

    </div>
  `;
}

// Abre modal para edicao de transacao
window.editarTransacao = async id => {

  const transacao = (await apiFetch(window.location.origin + '/transacoes')).find(t => t._id === id);
  const categorias = await apiFetch(window.location.origin + '/categorias');

  if (!transacao) return;

  const tipoDespesaField = `
    <div class="form-group" id="modalGrupoTipoDespesa" style="display: ${transacao.tipo === 'saida' ? '' : 'none'};">
      <label>Tipo de Despesa</label>
      <select id="modalTipoDespesa">
        <option value="">-- Selecione --</option>
        <option value="essencial" ${transacao.tipoDespesa === 'essencial' ? 'selected' : ''}>Essencial</option>
        <option value="eventual" ${transacao.tipoDespesa === 'eventual' ? 'selected' : ''}>Eventual</option>
        <option value="opcional" ${transacao.tipoDespesa === 'opcional' ? 'selected' : ''}>Opcional</option>
      </select>
    </div>
  `;

  abrirModal({
    titulo: 'Editar transação',
    conteudoHTML: `
      <div class="form-group">
        <label>Título</label>
        <input type="text" id="modalTituloTransacao" value="${transacao.titulo}">
      </div>
      <div class="form-group">
        <label>Valor</label>
        <input type="number" id="modalValorTransacao" value="${transacao.valor}" step="0.01">
      </div>
      <div class="form-group">
        <label>Tipo</label>
        <select id="modalTipoTransacao">
          <option value="entrada" ${transacao.tipo === 'entrada' ? 'selected' : ''}>Entrada</option>
          <option value="saida" ${transacao.tipo === 'saida' ? 'selected' : ''}>Saída</option>
        </select>
      </div>
      <div class="form-group">
        <label>Categoria</label>
        <select id="modalCategoriaTransacao">
          <option value="">-- Selecione --</option>
          ${categorias.map(c => `<option value="${c._id}" ${transacao.categoria?._id === c._id ? 'selected' : ''}>${c.nome}</option>`).join('')}
        </select>
      </div>
      ${tipoDespesaField}
    `,
    onSalvar: async () => {
      const novoTitulo = document.getElementById('modalTituloTransacao')?.value;
      const novoValor = Number(document.getElementById('modalValorTransacao')?.value);
      const novoTipo = document.getElementById('modalTipoTransacao')?.value;
      const novaCategoria = document.getElementById('modalCategoriaTransacao')?.value;
      const novoTipoDespesa = document.getElementById('modalTipoDespesa')?.value;

      if (!novoTitulo || !novoValor || !novoTipo || !novaCategoria) return;

      const dados = {
        titulo: novoTitulo,
        valor: novoValor,
        tipo: novoTipo,
        categoria: novaCategoria
      };

      if (novoTipoDespesa) {
        dados.tipoDespesa = novoTipoDespesa;
      }

      await apiFetch(`${window.location.origin}/transacoes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados)
      });

      fecharModal();
      listarTransacoes();
    }
  });

  const selectTipo = document.getElementById('modalTipoTransacao');
  const despField = document.getElementById('modalGrupoTipoDespesa');
  if (selectTipo && despField) {
    const toggle = () => {
      despField.style.display = selectTipo.value === 'saida' ? '' : 'none';
    };
    selectTipo.addEventListener('change', toggle);
    toggle();
  }
};

window.deletarTransacao = async id => {

  abrirModalConfirmacao({
    titulo: 'Confirmar exclusão',
    mensagem: 'Tem certeza que deseja deletar esta transação?',
    onConfirmar: async () => {
      try {
        await apiFetch(`${window.location.origin}/transacoes/${id}`, {
          method: 'DELETE'
        });
        fecharModal();
        listarTransacoes();
      } catch (err) {
        fecharModal();
        abrirModalErro(err.message);
      }
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  inicializarTags(tags);
});