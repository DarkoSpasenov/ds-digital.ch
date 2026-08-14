const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
  if (header) header.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => {
  nav?.classList.remove('open');
  toggle?.setAttribute('aria-expanded', 'false');
}));

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
}

const year = document.getElementById('currentYear');
if (year) year.textContent = new Date().getFullYear();

const form = document.querySelector('[data-contact-form]');
const formAlert = document.getElementById('formAlert');

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = (window.DS_CONFIG?.contactEmail || '').trim();

    if (!email) {
      if (formAlert) {
        formAlert.hidden = false;
        formAlert.className = 'form-alert warning';
        formAlert.textContent = "Le formulaire doit encore être relié à l’adresse e-mail de DS Digital Studio.";
      }
      return;
    }

    const data = new FormData(form);
    const subject = encodeURIComponent('Nouvelle demande — DS Digital Studio');
    const body = encodeURIComponent(
      `Nom : ${data.get('name') || ''}\n` +
      `Entreprise : ${data.get('company') || ''}\n` +
      `E-mail : ${data.get('email') || ''}\n` +
      `Téléphone : ${data.get('phone') || ''}\n` +
      `Service : ${data.get('service') || ''}\n\n` +
      `Projet :\n${data.get('message') || ''}`
    );

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  });
}
