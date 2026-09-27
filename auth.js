(() => {
  const fragment = new URLSearchParams(location.hash.slice(1));
  let accessToken = fragment.get('access_token');
  const type = fragment.get('type');
  const error = fragment.get('error') || fragment.get('error_code');
  history.replaceState(null, '', location.pathname);

  const status = document.getElementById('status');
  const form = document.getElementById('password-form');
  if (error) {
    status.textContent = 'Ce lien a expiré ou a été refusé. Demandez un nouveau lien depuis Ma Bibliothèque.';
    return;
  }
  if (!accessToken) {
    status.textContent = 'Ouvrez Ma Bibliothèque sur votre téléphone. Si vous devez définir un mot de passe, utilisez « Mot de passe oublié » dans l’application.';
    return;
  }
  if (type !== 'invite' && type !== 'recovery') {
    accessToken = null;
    status.textContent = 'Votre adresse a été confirmée. Ouvrez Ma Bibliothèque sur votre téléphone.';
    return;
  }

  status.textContent = type === 'invite' ? 'Votre invitation est confirmée. Choisissez un mot de passe.' : 'Choisissez un nouveau mot de passe.';
  form.hidden = false;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const passwordInput = document.getElementById('password');
    const confirmationInput = document.getElementById('confirmation');
    const password = passwordInput.value;
    if (password !== confirmationInput.value) {
      status.textContent = 'Les deux mots de passe sont différents.';
      return;
    }
    const button = form.querySelector('button');
    button.disabled = true;
    status.textContent = 'Enregistrement en cours…';
    try {
      const response = await fetch('https://biqufagdklropvjkxctp.supabase.co/auth/v1/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          apikey: 'sb_publishable_7QGyye8lMHF0j7Po15p5pQ_CRa2RvO1',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) throw new Error('Modification refusée. Demandez un nouveau lien.');
      accessToken = null;
      passwordInput.value = '';
      confirmationInput.value = '';
      form.remove();
      status.textContent = 'Mot de passe enregistré. Vous pouvez vous connecter dans Ma Bibliothèque.';
    } catch (reason) {
      status.textContent = reason instanceof Error ? reason.message : 'Enregistrement impossible. Réessayez.';
      button.disabled = false;
    }
  });
})();
