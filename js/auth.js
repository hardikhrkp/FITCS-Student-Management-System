const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const msg = document.getElementById('message');
    msg.textContent = 'Signing in…'; msg.className = 'message';
    try {
      const result = await api('login', {
        enrollmentNo: document.getElementById('enrollmentNo').value.trim(),
        password: document.getElementById('password').value
      });
      setToken(result.token);
      location.href = result.mustChangePassword ? 'change-password.html' : 'dashboard.html';
    } catch (err) { msg.textContent = err.message; }
  });
}
const changeForm = document.getElementById('changePasswordForm');
if (changeForm) {
  if (!getToken()) location.href = 'index.html';
  changeForm.addEventListener('submit', async e => {
    e.preventDefault();
    const msg = document.getElementById('message');
    const password = document.getElementById('newPassword').value;
    if (password !== document.getElementById('confirmPassword').value) {
      msg.textContent = 'Passwords do not match.'; return;
    }
    msg.textContent = 'Updating password…'; msg.className = 'message';
    try {
      const result = await api('changePassword', { token: getToken(), newPassword: password });
      setToken(result.token); location.href = 'dashboard.html';
    } catch (err) { msg.textContent = err.message; }
  });
}
