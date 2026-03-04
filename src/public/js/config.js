const baseUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/usuarios'
  : 'https://seu-dominio.com/usuarios';

let token = '';