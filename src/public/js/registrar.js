import { setToken, apiFetch } from './config.js';
import { $ } from './helpers/index.js';
import {
  mostrarErroInline,
  limparErroInline,
  garantirErroInline,
} from './modalEditar.js';

// URL base da API de usuários
const baseUrl = window.location.origin + '/usuarios';
const formRegistrar = $('formRegistrar');
if (formRegistrar) formRegistrar.noValidate = true;

const FORM_ERRO_ID = 'formErroInlineRegistrar';
const FORM_MSG_ERRO_ID = 'formMensagemErroRegistrar';

garantirErroInline(formRegistrar, FORM_ERRO_ID, FORM_MSG_ERRO_ID);

// Trata envio do formulário de registro
if (formRegistrar) {
  formRegistrar.onsubmit = async (e) => {
    e.preventDefault();
    limparErroInline(FORM_ERRO_ID, FORM_MSG_ERRO_ID);

    try {
      const nome = $('nome').value?.trim();
      const email = $('email').value?.trim();
      const senha = $('senha').value;

      if (!nome || !email || !senha) {
        mostrarErroInline(
          'Por favor, preencha todos os campos obrigatórios',
          FORM_ERRO_ID,
          FORM_MSG_ERRO_ID
        );
        return;
      }

      // Faz requisição de registro com dados do formulário
      const data = await apiFetch(`${baseUrl}/registrar`, {
        method: 'POST',
        body: JSON.stringify({
          nome,
          email,
          senha,
        }),
      });

      // Salva token e redireciona se sucesso
      if (data.token) {
        setToken(data.token);
        window.location.href = '/html/inicio.html';
      }
    } catch (err) {
      mostrarErroInline(
        err.message || 'Erro ao registrar',
        FORM_ERRO_ID,
        FORM_MSG_ERRO_ID
      );
    }
  };
}
