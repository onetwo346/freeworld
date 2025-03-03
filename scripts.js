document.addEventListener('DOMContentLoaded', () => {
  const enterBtn = document.getElementById('enter-btn');
  const loginBtn = document.getElementById('login-btn');
  const generateBtn = document.getElementById('generate-btn');
  const codeInput = document.getElementById('code-input');
  const warning = document.getElementById('warning');
  const generatedCodeSpan = document.getElementById('generated-code');

  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      window.location.href = 'login.html';
    });
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', async () => {
      const res = await fetch('http://localhost:3000/generate-code', { method: 'POST' });
      const data = await res.json();
      warning.classList.remove('hidden');
      generatedCodeSpan.textContent = data.code;
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      const code = codeInput.value;
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'profile.html';
      } else {
        alert(data.message);
      }
    });
  }

  if (document.querySelector('.profile-card')) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      document.getElementById('display-name').textContent = user.displayName || 'New Explorer';
      document.getElementById('bio').textContent = user.bio || 'No bio yet.';
      document.getElementById('coins').textContent = user.coins;
    }
  }
});
