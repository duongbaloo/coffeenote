/**
 * auth.js — CoffeeNote authentication
 * Phone + password login/register using localStorage.
 * Each user's coffee log is stored under a separate key.
 */

let currentUser = null; // { phone, displayPhone }
let authMode = 'login';

/* ── Simple hash (non-cryptographic, for local app only) ── */
function simpleHash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16);
}

/* ── User store ── */
function getUsers() {
  return JSON.parse(localStorage.getItem('cn_users') || '{}');
}

function saveUsers(users) {
  localStorage.setItem('cn_users', JSON.stringify(users));
}

/* ── Tab switching ── */
function switchAuthTab(mode) {
  authMode = mode;

  document.querySelectorAll('.auth-tab').forEach((t, i) => {
    t.classList.toggle('active',
      (mode === 'login' && i === 0) || (mode === 'register' && i === 1)
    );
  });

  document.getElementById('confirmField').style.display =
    mode === 'register' ? 'block' : 'none';

  document.getElementById('authSubmitBtn').textContent =
    mode === 'login' ? 'Sign In' : 'Create Account';

  document.getElementById('authHint').innerHTML = mode === 'login'
    ? 'Don\'t have an account? <a href="#" onclick="switchAuthTab(\'register\');return false;">Create one</a>'
    : 'Already have an account? <a href="#" onclick="switchAuthTab(\'login\');return false;">Sign in</a>';

  showAuthError('');
}

/* ── Error display ── */
function showAuthError(msg) {
  const el = document.getElementById('authError');
  el.textContent = msg;
  el.classList.toggle('show', !!msg);
}

/* ── Normalize phone ── */
function normalizePhone(raw) {
  return raw.replace(/\D/g, '');
}

/* ── Handle form submit ── */
function handleAuth() {
  const raw   = document.getElementById('authPhone').value.trim();
  const pw    = document.getElementById('authPassword').value;
  const phone = normalizePhone(raw);

  if (!phone || phone.length < 7) {
    showAuthError('Please enter a valid phone number.');
    return;
  }
  if (!pw || pw.length < 4) {
    showAuthError('Password must be at least 4 characters.');
    return;
  }

  const users = getUsers();

  if (authMode === 'register') {
    const confirm = document.getElementById('authConfirm').value;
    if (pw !== confirm) { showAuthError('Passwords do not match.'); return; }
    if (users[phone])   { showAuthError('This phone number is already registered.'); return; }

    users[phone] = { hash: simpleHash(phone + pw) };
    saveUsers(users);
    loginAs(phone);

  } else {
    if (!users[phone])                                  { showAuthError('No account found for this number.'); return; }
    if (users[phone].hash !== simpleHash(phone + pw))   { showAuthError('Incorrect password.'); return; }
    loginAs(phone);
  }
}

/* ── Login ── */
function loginAs(phone) {
  currentUser = { phone, displayPhone: '+' + phone };

  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('app').style.display = 'block';  // must be explicit — '' would leave CSS display:none in effect
  document.getElementById('userBadge').textContent = currentUser.displayPhone;

  loadUserData();
  initForm();
}

/* ── Logout ── */
function logout() {
  currentUser = null;
  entries = [];

  document.getElementById('app').style.display = 'none';
  document.getElementById('authScreen').style.display = 'flex';
  document.getElementById('authPassword').value = '';
  document.getElementById('authConfirm').value  = '';
  showAuthError('');
}

/* ── Allow Enter key on all auth inputs ── */
// Scripts are at end of <body>, so DOM is already ready — no need for DOMContentLoaded wrapper
['authPhone', 'authPassword', 'authConfirm'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') handleAuth(); });
});
