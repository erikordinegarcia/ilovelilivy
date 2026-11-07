// =====================================================
// AUTENTICAÇÃO DO PAINEL
// =====================================================

const loginForm = document.getElementById('loginForm');

if (loginForm) {
  if (!supabaseClient) {
    document.getElementById('configAlert').hidden = false;
    document.getElementById('loginBtn').disabled = true;
  } else {
    // Já logada? vai direto para o painel
    supabaseClient.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = 'dashboard.html';
    });

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('loginBtn');
      const errorMsg = document.getElementById('loginError');

      errorMsg.textContent = '';
      btn.disabled = true;
      btn.textContent = 'Entrando...';

      const { error } = await supabaseClient.auth.signInWithPassword({
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value
      });

      if (error) {
        errorMsg.textContent = 'E-mail ou senha inválidos.';
        btn.disabled = false;
        btn.textContent = 'Entrar';
        return;
      }
      window.location.href = 'dashboard.html';
    });
  }
}

// Protege o dashboard
async function exigirLogin() {
  if (!supabaseClient) {
    window.location.href = 'index.html';
    return null;
  }
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    window.location.href = 'index.html';
    return null;
  }
  return data.session;
}

async function fazerLogout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'index.html';
}
