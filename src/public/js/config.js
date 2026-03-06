export function setToken(token) {
  localStorage.setItem('token', token);
}

export function getToken() {
  return localStorage.getItem('token');
}

export async function apiFetch(url, options = {}) {
  const token = getToken();
  options.headers = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    ...options.headers
  };

  const res = await fetch(url, options);

  if (!res.ok) {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      throw new Error(json.mensagem || text);
    } catch (e) {
      if (e.message && e.message !== text) {
        throw e;
      }
      throw new Error(text);
    }
  }

  return res.json();
}