import { setToken, apiFetch } from './config.js';
import { verificarAutenticacao } from './auth.js';

verificarAutenticacao();

const formLogin = document.getElementById('formLogin');
const baseUrlUsuarios = window.location.origin + '/usuarios';

formLogin.onsubmit = async e => {
  e.preventDefault();
  try {
    const email = document.getElementById('loginEmail').value;
    const senha = document.getElementById('loginSenha').value;

    const data = await apiFetch(`${baseUrlUsuarios}/login`, {
      method: 'POST',
      body: JSON.stringify({ email, senha })
    });

    if (data.token) {
      setToken(data.token);
      window.location.href = '/html/inicio.html';
    }
  } catch (err) {
    alert(err.message);
  }
};