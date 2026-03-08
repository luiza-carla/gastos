// Remove token e redireciona para login
export function logout() {
  localStorage.removeItem('token');
  window.location.href = '/html/login.html';
}
