export function criarOpcao(valor, texto) {
  return `<option value="${valor}">${texto}</option>`;
}

export function criarCardsHTML(lista, gerador) {
  return lista.map(gerador).join('');
}

export function setTextById(id, texto) {
  const el = document.getElementById(id);
  if (el) el.textContent = texto;
}

export function setHTMLById(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

export function showElement(el) {
  if (el) el.style.display = '';
}

export function hideElement(el) {
  if (el) el.style.display = 'none';
}

export function clearElement(el) {
  if (el) el.innerHTML = '';
}

export function populateSelect(selectEl, items, valueFn, textFn) {
  if (!selectEl) return;
  selectEl.innerHTML = '';
  items.forEach(item => {
    const valor = valueFn ? valueFn(item) : item._id;
    const texto = textFn ? textFn(item) : item.nome || '';
    selectEl.innerHTML += criarOpcao(valor, texto);
  });
}

export function $(id) {
  return document.getElementById(id);
}

export function showById(id) {
  const el = $(id);
  if (el) el.style.display = '';
}

export function hideById(id) {
  const el = $(id);
  if (el) el.style.display = 'none';
}

export function setDisabledById(id, disabled) {
  const el = $(id);
  if (el) el.disabled = disabled;
}

// helpers específicos para o modal global
export function showModal() {
  const modal = document.getElementById('modalGlobal');
  if (modal) modal.style.display = 'flex';
}

export function hideModal() {
  const modal = document.getElementById('modalGlobal');
  if (modal) modal.style.display = 'none';
}

export function addCSS(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}
