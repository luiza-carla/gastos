const ICONES_NOTIFICACAO = {
  sucesso: 'fa-circle-check',
  erro: 'fa-circle-xmark',
  aviso: 'fa-triangle-exclamation',
};

const CHAVE_NOTIFICACAO_PENDENTE = 'notificacaoPendente';

/**
 * Mostra uma notificação temporária na tela
 * @param {string} mensagem - Mensagem a ser exibida
 * @param {string} tipo - Tipo da notificação: 'sucesso', 'erro', 'aviso' (padrão: 'sucesso')
 * @param {number} duracao - Duração em milissegundos (padrão: 3000)
 */
export function mostrarNotificacao(mensagem, tipo = 'sucesso', duracao = 3000) {
  // Criar container da notificação
  const notificacao = document.createElement('div');
  notificacao.className = `notificacao notificacao-${tipo}`;

  const icone = ICONES_NOTIFICACAO[tipo] || ICONES_NOTIFICACAO.sucesso;
  
  notificacao.innerHTML = `
    <i class="fa-solid ${icone}"></i>
    <span>${mensagem}</span>
  `;
  
  // Adicionar à página
  document.body.appendChild(notificacao);

  // Animar entrada
  setTimeout(() => {
    notificacao.classList.add('notificacao-visivel');
  }, 10);

  // Remover notificação após duração
  setTimeout(() => {
    notificacao.classList.remove('notificacao-visivel');
    setTimeout(() => {
      notificacao.remove();
    }, 300);
  }, duracao);
}

export function persistirNotificacaoParaProximaTela(
  mensagem,
  tipo = 'sucesso',
  duracao = 3000
) {
  try {
    const payload = {
      mensagem,
      tipo,
      expiraEm: Date.now() + duracao,
    };
    sessionStorage.setItem(CHAVE_NOTIFICACAO_PENDENTE, JSON.stringify(payload));
  } catch {
    // Ignora falhas de storage e segue sem persistir notificacao
  }
}

function exibirNotificacaoPersistida() {
  try {
    const bruto = sessionStorage.getItem(CHAVE_NOTIFICACAO_PENDENTE);
    if (!bruto) return;

    sessionStorage.removeItem(CHAVE_NOTIFICACAO_PENDENTE);

    const payload = JSON.parse(bruto);
    const restante = Number(payload.expiraEm) - Date.now();

    if (!payload?.mensagem || restante <= 0) return;

    mostrarNotificacao(payload.mensagem, payload.tipo || 'sucesso', restante);
  } catch {
    sessionStorage.removeItem(CHAVE_NOTIFICACAO_PENDENTE);
  }
}

exibirNotificacaoPersistida();
