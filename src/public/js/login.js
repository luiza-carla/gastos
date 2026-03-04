document.getElementById('formLogin').onsubmit = async (e) => {
  e.preventDefault();

  const res = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: document.getElementById('loginEmail').value,
      senha: document.getElementById('loginSenha').value
    })
  });

  const data = await res.json();
  if (res.ok && data.token) {
    token = data.token;
    localStorage.setItem('token', token);
    alert('Login feito com sucesso!');

    window.location.href = 'inicio.html';
  } else {
    alert(data.mensagem || 'Erro no login');
  }
};