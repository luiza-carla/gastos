import { setToken, apiFetch } from './config.js';
import { $ } from './helpers/index.js';

// URL base da API de usuários
const baseUrl = window.location.origin + '/usuarios';

// Trata envio do formulário de registro
$('formRegistrar').onsubmit = async (e) => {
  e.preventDefault();

  try {
    // Faz requisição de registro com dados do formulário
    const data = await apiFetch(`${baseUrl}/registrar`, {
      method: 'POST',
      body: JSON.stringify({
        nome: $('nome').value,
        email: $('email').value,
        senha: $('senha').value,
      }),
    });

    // Salva token e redireciona se sucesso
    if (data.token) {
      setToken(data.token);
      window.location.href = '/html/inicio.html';
    }
  } catch (err) {
    alert(err.message || 'Erro ao registrar');
  }
};
