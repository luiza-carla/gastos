export function setToken(token) {
  localStorage.setItem('token', token);
}

// Recupera token do localStorage
export function getToken() {
  return localStorage.getItem('token');
}

// Faz requisição HTTP com token de autenticação
export async function apiFetch(url, options = {}) {
  const token = getToken();
  // Adiciona headers padrão (autent)
  options.headers = {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
    ...options.headers,
  };

  // Faz requisição
  const res = await fetch(url, options);

  // Valida resposta
  if (!res.ok) {
    const text = await res.text();
    try {
      // Tenta parsear JSON com mensagem de erro
      const json = JSON.parse(text);
      throw new Error(json.mensagem || text);
    } catch (e) {
      if (e.message && e.message !== text) {
        throw e;
      }
      throw new Error(text, { cause: e });
    }
  }

  return res.json();
}
