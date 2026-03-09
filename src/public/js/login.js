import { setToken, apiFetch } from './config.js';
import { $, configurarToggleSenha } from './helpers/index.js';
import {
  mostrarErroInline,
  limparErroInline,
  garantirErroInline,
} from './modalEditar.js';

// Referência do formulário e URL da API
const formLogin = document.getElementById('formLogin');
const baseUrlUsuarios = window.location.origin + '/usuarios';
if (formLogin) formLogin.noValidate = true;

const FORM_ERRO_ID = 'formErroInlineLogin';
const FORM_MSG_ERRO_ID = 'formMensagemErroLogin';

garantirErroInline(formLogin, FORM_ERRO_ID, FORM_MSG_ERRO_ID);
configurarToggleSenha('loginSenha');

// Trata envio do formulário de login
if (formLogin) {
  formLogin.onsubmit = async (e) => {
    e.preventDefault();
    limparErroInline(FORM_ERRO_ID, FORM_MSG_ERRO_ID);
    try {
      // Recupera valores do formulário
      const email = $('loginEmail').value?.trim();
      const senha = $('loginSenha').value;

      if (!email || !senha) {
        mostrarErroInline(
          'Por favor, preencha email e senha',
          FORM_ERRO_ID,
          FORM_MSG_ERRO_ID
        );
        return;
      }

      // Faz requisição de login
      const data = await apiFetch(`${baseUrlUsuarios}/login`, {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      });

      // Salva token e redireciona se sucesso
      if (data.token) {
        setToken(data.token);
        window.location.href = '/html/inicio.html';
      }
    } catch (err) {
      mostrarErroInline(
        err.message || 'Erro ao fazer login',
        FORM_ERRO_ID,
        FORM_MSG_ERRO_ID
      );
    }
  };
}
