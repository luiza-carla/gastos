import { apiFetch } from './config.js';
import { verificarAutenticacao } from './auth.js';

verificarAutenticacao();

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

    alert('Registrado com sucesso! Faça login.');
    window.location.href = 'login.html';
  } catch (err) {
    alert(err.message || 'Erro ao registrar');
  }
};