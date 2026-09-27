(() => {
  const fragment = new URLSearchParams(location.hash.slice(1));
  let accessToken = fragment.get('access_token');
  const type = fragment.get('type');
  const error = fragment.get('error') || fragment.get('error_code');
  history.replaceState(null, '', location.pathname);

  const status = document.getElementById('status');
  const form = document.getElementById('password-form');
  const recoveryForm = document.getElementById('recovery-form');
  if (error) {
    status.textContent = 'Ce lien a expiré ou a été refusé. Demandez un nouveau lien.';
    recoveryForm.hidden = false;
  } else if (!accessToken) {
    status.textContent = 'Vous pouvez demander un lien pour définir votre mot de passe.';
    recoveryForm.hidden = false;
  } else if (type !== 'invite' && type !== 'recovery') {
    accessToken = null;
    status.textContent = 'Votre adresse a été confirmée. Ouvrez Ma Bibliothèque sur votre téléphone.';
    recoveryForm.hidden = false;
  } else {
    status.textContent = type === 'invite' ? 'Votre invitation est confirmée. Choisissez un mot de passe.' : 'Choisissez un nouveau mot de passe.';
    form.hidden = false;
  }

  recoveryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const emailInput = document.getElementById('email');
    const button = recoveryForm.querySelector('button');
    button.disabled = true;
    status.textContent = 'Demande en cours…';
    try {
      const response = await fetch('https://biqufagdklropvjkxctp.supabase.co/auth/v1/recover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: 'sb_publishable_7QGyye8lMHF0j7Po15p5pQ_CRa2RvO1',
        },
        body: JSON.stringify({ email: emailInput.value.trim().toLowerCase() }),
      });
      if (response.status === 429) throw new Error('Trop de courriels ont été demandés. Réessayez plus tard.');
      if (!response.ok) throw new Error('Envoi impossible pour le moment. Réessayez plus tard.');
      emailInput.value = '';
      recoveryForm.hidden = true;
      status.textContent = 'Si ce compte existe, un nouveau lien a été envoyé. Ouvrez-le dans ce navigateur.';
    } catch (reason) {
      status.textContent = reason instanceof Error ? reason.message : 'Envoi impossible pour le moment.';
      button.disabled = false;
    }
  });
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
