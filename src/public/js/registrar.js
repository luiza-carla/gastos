import { setToken, apiFetch } from './config.js';

const baseUrl = window.location.origin + '/usuarios';

document.getElementById('formRegistrar').onsubmit = async e => {
  e.preventDefault();

  try {
    const data = await apiFetch(`${baseUrl}/registrar`, {
      method: 'POST',
      body: JSON.stringify({
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        senha: document.getElementById('senha').value,
      })
    });

    if (data.token) {
      setToken(data.token);
      window.location.href = '/html/inicio.html';
    }
  } catch (err) {
    alert(err.message || 'Erro ao registrar');
  }
};