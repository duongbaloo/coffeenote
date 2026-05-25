/**
 * auth.js — CoffeeNote authentication via Supabase Auth
 *
 * Strategy: Supabase requires an email address for sign-up.
 * We convert the user's phone number into a fake internal email
 * (phone@coffeenote.local) so the phone+password UX stays intact.
 * Email confirmation is disabled in the Supabase dashboard.
 */

// ── Supabase client (SUPABASE_URL + SUPABASE_ANON_KEY from config.js) ──
const _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;   // populated after successful auth
let authMode    = 'login';

/* ── Helpers ── */
function phoneToEmail(phone) {
  return `${phone}@coffeenote.local`;
}

function extractPhone(email) {
  return email.replace('@coffeenote.local', '');
}

function normalizePhone(raw) {
  return raw.replace(/\D/g, '');
}

/* ── UI helpers ── */
function showAuthError(msg) {
  const el = document.getElementById('authError');
  el.textContent = msg;
  el.classList.toggle('show', !!msg);
}

function setAuthLoading(on) {
  const btn = document.getElementById('authSubmitBtn');
  btn.disabled    = on;
  btn.textContent = on
    ? 'Please wait…'
    : (authMode === 'login' ? 'Sign In' : 'Create Account');
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

/* ── Handle auth form submit ── */
async function handleAuth() {
  const raw   = document.getElementById('authPhone').value.trim();
  const pw    = document.getElementById('authPassword').value;
  const phone = normalizePhone(raw);

  if (!phone || phone.length < 7) {
    showAuthError('Please enter a valid phone number.');
    return;
  }
  if (!pw || pw.length < 6) {
    showAuthError('Password must be at least 6 characters.');
    return;
  }

  setAuthLoading(true);
  showAuthError('');

  if (authMode === 'register') {
    const confirm = document.getElementById('authConfirm').value;
    if (pw !== confirm) {
      showAuthError('Passwords do not match.');
      setAuthLoading(false);
      return;
    }

    const { error } = await _sb.auth.signUp({
      email:    phoneToEmail(phone),
      password: pw,
    });

    if (error) {
      // Common Supabase error for duplicate accounts
      const msg = error.message.toLowerCase().includes('already registered')
        ? 'This number is already registered. Try signing in.'
        : error.message;
      showAuthError(msg);
      setAuthLoading(false);
    }
    // On success → onAuthStateChange fires → loginAs()

  } else {
    const { error } = await _sb.auth.signInWithPassword({
      email:    phoneToEmail(phone),
      password: pw,
    });

    if (error) {
      showAuthError('Incorrect phone number or password.');
      setAuthLoading(false);
    }
    // On success → onAuthStateChange fires → loginAs()
  }
}

/* ── Session listener — single source of truth for auth state ── */
_sb.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    currentUser       = session.user;
    currentUser.phone = extractPhone(currentUser.email);
    await loginAs();
  } else {
    currentUser = null;
    _showAuthScreen();
  }
});

/* ── Transition to app ── */
async function loginAs() {
  document.getElementById('loadingScreen').style.display = 'none';
  document.getElementById('authScreen').style.display   = 'none';
  document.getElementById('app').style.display          = 'block';
  document.getElementById('userBadge').textContent      = '+' + currentUser.phone;

  setAuthLoading(false);
  await loadUserData();
  initForm();
}

/* ── Transition to auth screen ── */
function _showAuthScreen() {
  document.getElementById('loadingScreen').style.display = 'none';
  document.getElementById('app').style.display          = 'none';
  document.getElementById('authScreen').style.display   = 'flex';
  setAuthLoading(false);
}

/* ── Logout ── */
async function logout() {
  await _sb.auth.signOut();
  // onAuthStateChange fires → _showAuthScreen()
  entries = [];
  brewEntries = [];
  document.getElementById('authPassword').value = '';
  document.getElementById('authConfirm').value  = '';
  showAuthError('');
}

/* ── Check for existing session on page load ── */
(async () => {
  const { data: { session } } = await _sb.auth.getSession();
  if (!session) {
    // No session — show login screen
    _showAuthScreen();
  }
  // If session exists, onAuthStateChange will call loginAs()
})();

/* ── Enter key on auth inputs ── */
['authPhone', 'authPassword', 'authConfirm'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') handleAuth(); });
});
