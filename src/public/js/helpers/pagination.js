import {
  $,
  hideElement,
  onEventById,
  setDisabledById,
  setTextById,
  showElement,
} from './dom.js';

// Cria um controlador de paginacao reutilizavel para qualquer listagem.
export function criarPaginacao({
  containerId,
  prevButtonId,
  nextButtonId,
  infoId,
  limit = 10,
  onChange,
}) {
  let paginaAtual = 1;
  let totalItens = 0;
  let inicializado = false;

  function obterElementos() {
    return {
      container: $(containerId),
      btnAnterior: $(prevButtonId),
      btnProximo: $(nextButtonId),
      info: $(infoId),
    };
  }

  function totalPaginas() {
    return Math.max(1, Math.ceil(totalItens / limit));
  }

  function getParams() {
    return {
      paginaAtual,
      limit,
      skip: (paginaAtual - 1) * limit,
    };
  }

  function atualizarUI() {
    const { container, btnAnterior, btnProximo, info } = obterElementos();

    if (!container || !btnAnterior || !btnProximo || !info) return;

    if (totalItens <= limit) {
      hideElement(container);
      return;
    }

    showElement(container);

    const paginas = totalPaginas();
    setTextById(infoId, `Pagina ${paginaAtual} de ${paginas}`);
    setDisabledById(prevButtonId, paginaAtual <= 1);
    setDisabledById(nextButtonId, paginaAtual >= paginas);
  }

  function setTotal(total) {
    totalItens = Number(total || 0);

    const paginas = totalPaginas();
    const paginaAjustada = paginaAtual > paginas;
    if (paginaAjustada) {
      paginaAtual = paginas;
    }

    atualizarUI();
    return paginaAjustada;
  }

  async function notificarMudanca() {
    if (typeof onChange !== 'function') return;
    await onChange(getParams());
  }

  async function mudarPagina(delta) {
    const proximaPagina = paginaAtual + delta;
    if (proximaPagina < 1 || proximaPagina > totalPaginas()) return;

    paginaAtual = proximaPagina;
    atualizarUI();
    await notificarMudanca();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function irParaPaginaAnterior() {
    await mudarPagina(-1);
  }

  async function irParaProximaPagina() {
    await mudarPagina(1);
  }

  function resetar() {
    paginaAtual = 1;
    atualizarUI();
  }

  function init() {
    if (inicializado) return;

    onEventById(prevButtonId, 'click', irParaPaginaAnterior);
    onEventById(nextButtonId, 'click', irParaProximaPagina);

    inicializado = true;
    atualizarUI();
  }

  return {
    init,
    getParams,
    setTotal,
    resetar,
    notificarMudanca,
    irParaPaginaAnterior,
    irParaProximaPagina,
  };
}
