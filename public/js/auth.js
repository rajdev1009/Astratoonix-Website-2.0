// public/js/auth.js

function openAuth() { openModal('auth-modal'); }

function toggleAuthMode() {
  ATX.authMode = ATX.authMode === 'login' ? 'register' : 'login';
  document.getElementById('auth-title').textContent       = ATX.authMode === 'login' ? 'LOGIN' : 'REGISTER';
  document.getElementById('auth-switch-text').textContent = ATX.authMode === 'login' ? 'New user?' : 'Have account?';
  document.getElementById('auth-switch-link').textContent = ATX.authMode === 'login' ? 'Register here' : 'Login here';
  document.getElementById('auth-msg').textContent = '';
}

async function submitAuth() {
  const email    = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const msg      = document.getElementById('auth-msg');
  if (!email || !password) { msg.className = 'msg error'; msg.textContent = 'Fill all fields'; return; }

  const url = ATX.authMode === 'login' ? '/api/users/login' : '/api/users/register';
  try {
    const d = await API.post(url, { email, password });
    if (d.error) { msg.className = 'msg error'; msg.textContent = d.error; return; }
    ATX.currentUser = d.user;
    sessionStorage.setItem('atx_user', JSON.stringify(d.user));
    updateUserBar();
    initAds();
    closeModal('auth-modal');
    notify('Welcome, ' + email.split('@')[0] + '!', 'success');
    // Notify socket server
    if (window._socket) window._socket.emit('userLogin');
  } catch (e) { msg.className = 'msg error'; msg.textContent = 'Server error'; }
}

function logoutUser() {
  ATX.currentUser = null;
  sessionStorage.removeItem('atx_user');
  updateUserBar();
  initAds();
  notify('Logged out');
  if (window._socket) window._socket.emit('userLogout');
}

function updateUserBar() {
  const bar     = document.getElementById('user-bar');
  const authBtn = document.getElementById('auth-btn');
  if (ATX.currentUser) {
    bar.classList.add('active');
    document.getElementById('bar-email').textContent = ATX.currentUser.email;
    const badgeEl = document.getElementById('bar-status');
    if (badgeEl) badgeEl.innerHTML = getStatusBadge(ATX.currentUser.status, ATX.currentUser.planExpiry);
    if (authBtn) authBtn.style.display = 'none';
  } else {
    bar.classList.remove('active');
    if (authBtn) authBtn.style.display = '';
  }
}

function isUserPremium() {
  const u = ATX.currentUser;
  if (!u) return false;
  if (u.isForever) return true;
  if (u.isPremium && u.planExpiry && new Date() < new Date(u.planExpiry)) return true;
  if (u.isTrial)   return true;
  return false;
}
