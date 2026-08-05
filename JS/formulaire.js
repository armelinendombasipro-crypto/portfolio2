// Formulaire de contact : validation "au moins un sujet coché", puis envoi
// à Formspree en AJAX (reste sur la page, affiche un petit toast de confirmation).

const contactForm = document.getElementById('contact-form');

function afficherToastEnvoye() {
  const toast = document.createElement('div');
  toast.className = 'toast-envoye';
  toast.textContent = 'Message envoyé';
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 500);
  }, 3500);
}

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const sujets = document.querySelectorAll('input[name="sujet[]"]:checked');
  if (sujets.length === 0) {
    alert('Merci de sélectionner au moins un sujet.');
    return;
  }

  const submitBtn = contactForm.querySelector('.btn-submit');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Envoi en cours...';
  submitBtn.disabled = true;

  fetch(contactForm.action, {
    method: 'POST',
    body: new FormData(contactForm),
    headers: { 'Accept': 'application/json' }
  })
    .then((response) => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      if (response.ok) {
        contactForm.reset();
        afficherToastEnvoye();
      } else {
        alert("Une erreur s'est produite, réessayez ou écrivez-moi directement par mail.");
      }
    })
    .catch(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      alert("Une erreur s'est produite, réessayez ou écrivez-moi directement par mail.");
    });
});
