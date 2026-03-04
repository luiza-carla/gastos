document.getElementById('formRegistrar').onsubmit = async (e) => {
  e.preventDefault();

  const res = await fetch(`${baseUrl}/registrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome: document.getElementById('nome').value,
      email: document.getElementById('email').value,
      senha: document.getElementById('senha').value,
      salario: Number(document.getElementById('salario').value)
    })
  });

  const data = await res.json();
  if (res.ok) {
    alert('Registrado com sucesso! Faça login.');
    window.location.href = 'login.html';
  } else {
    alert(data.mensagem || 'Erro ao registrar');
  }
};