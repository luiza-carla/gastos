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
    throw new Error(`Erro ${res.status}: ${text}`);
  }

  return res.json();
}