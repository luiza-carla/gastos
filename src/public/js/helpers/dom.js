// Cria opcao HTML para select
export function criarOpcao(valor, texto) {
  return `<option value="${valor}">${texto}</option>`;
}

// Transforma array de itens em HTML de cards
export function criarCardsHTML(lista, gerador) {
  return lista.map(gerador).join('');
}

// Define texto de elemento por ID
export function setTextById(id, texto) {
  const el = document.getElementById(id);
  if (el) el.textContent = texto;
}

// Define conteudo HTML de elemento por ID
export function setHTMLById(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

// Mostra elemento (remove display none)
export function showElement(el) {
  if (el) el.style.display = '';
}

// Oculta elemento
export function hideElement(el) {
  if (el) el.style.display = 'none';
}

// Limpa conteudo HTML de elemento
export function clearElement(el) {
  if (el) el.innerHTML = '';
}

// Popula select com opcoes de um array
export function populateSelect(selectEl, items, valueFn, textFn) {
  if (!selectEl) return;
  selectEl.innerHTML = '';
  items.forEach((item) => {
    const valor = valueFn ? valueFn(item) : item._id;
    const texto = textFn ? textFn(item) : item.nome || '';
    selectEl.innerHTML += criarOpcao(valor, texto);
  });
}

// Atalho para document.getElementById
export function $(id) {
  return document.getElementById(id);
}

// Mostra elemento por ID
export function showById(id) {
  const el = $(id);
  if (el) el.style.display = '';
}

// Oculta elemento por ID
export function hideById(id) {
  const el = $(id);
  if (el) el.style.display = 'none';
}

// Ativa ou desativa elemento por ID
export function setDisabledById(id, disabled) {
  const el = $(id);
  if (el) el.disabled = disabled;
}

// Mostra modal global
export function showModal() {
  const modal = document.getElementById('modalGlobal');
  if (modal) modal.style.display = 'flex';
}

// Oculta modal global
export function hideModal() {
  const modal = document.getElementById('modalGlobal');
  if (modal) modal.style.display = 'none';
}

// Adiciona arquivo CSS se ainda nao existir
export function addCSS(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

// Adiciona evento a elemento por ID
export function onEventById(id, evento, handler) {
  const el = $(id);
  if (el) el.addEventListener(evento, handler);
}

// Adiciona classe a elemento
export function addClass(el, classe) {
  if (el) el.classList.add(classe);
}

// Remove classe de elemento
export function removeClass(el, classe) {
  if (el) el.classList.remove(classe);
}
