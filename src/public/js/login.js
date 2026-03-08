import { setToken, apiFetch } from './config.js';
import { $ } from './helpers/index.js';

// Referência do formulário e URL da API
const formLogin = document.getElementById('formLogin');
const baseUrlUsuarios = window.location.origin + '/usuarios';

// Trata envio do formulário de login
formLogin.onsubmit = async e => {
  e.preventDefault();
  try {
    // Recupera valores do formulário
    const email = $('loginEmail').value;
    const senha = $('loginSenha').value;

    // Faz requisição de login
    const data = await apiFetch(`${baseUrlUsuarios}/login`, {
      method: 'POST',
      body: JSON.stringify({ email, senha })
    });

    // Salva token e redireciona se sucesso
    if (data.token) {
      setToken(data.token);
      window.location.href = '/html/inicio.html';
    }
  } catch (err) {
    alert(err.message);
  }
};