/* ============================================================
   DS DIGITAL STUDIO — script.js
   Aucun réglage à faire ici : tout se passe dans site-config.js
   ============================================================ */
(function () {
  'use strict';

  const CFG = window.DS_CONFIG || {};
  const EMAIL = (CFG.contactEmail || '').trim();
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));

  /* ---------- 1. Header : fond + barre de progression ---------- */
  const header = $('.site-header');
  const bar = $('#progressBar');
  const toTop = $('#toTop');

  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 16);
    if (toTop) toTop.classList.toggle('show', y > 700);
    if (bar) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: 'smooth' })
    );
  }

  /* ---------- 2. Menu mobile ---------- */
  const toggle = $('.menu-toggle');
  const nav = $('.nav');

  function closeMenu() {
    if (!nav) return;
    nav.classList.remove('open');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Ouvrir le menu');
    }
  }

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    });
    $$('.nav a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });
  }

  /* ---------- 3. Apparition au scroll ---------- */
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealables = $$('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(el => el.classList.add('visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealables.forEach(el => io.observe(el));
  }

  /* ---------- 4. Aperçus des sites réalisés ----------
     Les captures sont générées à la volée par le service mShots.
     La première demande peut prendre quelques secondes : on garde
     l'animation de chargement, puis on retente une fois.          */
  $$('.site-shot').forEach(img => {
    const box = img.closest('.shot');
    let retried = false;

    function done() {
      img.classList.add('loaded');
      if (box) box.classList.add('done');
    }

    function retry() {
      if (retried) return;
      retried = true;
      const src = img.getAttribute('src');
      fetch(src, { mode: 'no-cors', cache: 'reload' })
        .catch(() => {})
        .finally(() => { img.src = src; });
    }

    if (img.complete && img.naturalWidth > 0) {
      done();
    } else {
      img.addEventListener('load', done, { once: false });
      img.addEventListener('error', () => { if (box) box.classList.add('done'); });
      setTimeout(retry, 6000);
    }
  });

  /* ---------- 4 bis. Carrousel d'aperçus (hero) ---------- */
  const sc = $('#showcase');
  if (sc) {
    const slides = $$('.site-shot', sc);
    const dots = $$('.sc-dot', sc);
    const urlLabel = $('[data-sc-url]', sc);
    const openLink = $('[data-sc-link]', sc);
    let index = 0;
    let timer = null;
    const DELAY = 6000;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((img, n) => img.classList.toggle('active', n === index));
      dots.forEach((d, n) => {
        d.classList.toggle('active', n === index);
        d.setAttribute('aria-selected', n === index ? 'true' : 'false');
      });
      const cur = slides[index];
      if (urlLabel) urlLabel.textContent = cur.dataset.url || '';
      if (openLink) {
        openLink.setAttribute('href', cur.dataset.link || '#');
        openLink.setAttribute('aria-label', 'Voir le site ' + (cur.dataset.url || ''));
      }
    }

    function start() {
      if (reduced || slides.length < 2) return;
      stop();
      timer = setInterval(() => show(index + 1), DELAY);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function go(i) { show(i); start(); }

    $('.sc-next', sc).addEventListener('click', () => go(index + 1));
    $('.sc-prev', sc).addEventListener('click', () => go(index - 1));
    dots.forEach((d, n) => d.addEventListener('click', () => go(n)));

    sc.addEventListener('mouseenter', stop);
    sc.addEventListener('mouseleave', start);
    sc.addEventListener('focusin', stop);
    sc.addEventListener('focusout', start);

    /* navigation au clavier */
    sc.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
    });

    /* balayage tactile */
    let x0 = null;
    sc.addEventListener('touchstart', e => { x0 = e.changedTouches[0].clientX; stop(); }, { passive: true });
    sc.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1)); else start();
      x0 = null;
    }, { passive: true });

    /* pause quand la section n'est plus visible */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        entries.forEach(e => (e.isIntersecting ? start() : stop()));
      }, { threshold: 0.25 }).observe(sc);
    } else {
      start();
    }

    show(0);
  }

  /* ---------- 5. Coordonnées injectées depuis site-config.js ---------- */
  if (EMAIL) {
    $$('a[href^="mailto:"]').forEach(a => {
      a.setAttribute('href', 'mailto:' + EMAIL);
      if (a.textContent.indexOf('@') > -1) a.textContent = EMAIL;
    });
    $$('.contact-link em, .about-card strong').forEach(el => {
      if (el.textContent.indexOf('@') > -1) el.textContent = EMAIL;
    });
  }

  const links = $('.contact-links');
  if (links && CFG.phone) {
    const tel = String(CFG.phone).trim();
    const a = document.createElement('a');
    a.className = 'contact-link';
    a.href = 'tel:' + tel.replace(/[^+0-9]/g, '');
    a.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1.1 1A16 16 0 0 1 4 5.1 1 1 0 0 1 5 4Z"/></svg>' +
      '<span><b>Téléphone</b><em>' + tel + '</em></span>';
    links.appendChild(a);
  }

  const socialWrap = $('.footer-cols div:last-child');
  if (socialWrap) {
    [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['linkedin', 'LinkedIn']].forEach(([key, label]) => {
      if (!CFG[key]) return;
      const a = document.createElement('a');
      a.href = CFG[key];
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = label;
      socialWrap.appendChild(a);
    });
  }

  /* ---------- 6. Formulaire de contact ---------- */
  const form = $('[data-contact-form]');
  const alertBox = $('#formAlert');

  function say(type, text) {
    if (!alertBox) return;
    alertBox.hidden = false;
    alertBox.className = 'form-alert ' + type;
    alertBox.textContent = text;
    alertBox.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
  }

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      /* piège à robots */
      if (form.website && form.website.value) return;

      if (!form.checkValidity()) {
        say('error', 'Merci de compléter les champs obligatoires (nom, e-mail et description du projet).');
        const first = form.querySelector(':invalid');
        if (first) first.focus();
        return;
      }

      const data = new FormData(form);
      const get = k => (data.get(k) || '').toString().trim();
      const btn = form.querySelector('.submit-btn');

      /* --- Option A : envoi direct via Web3Forms --- */
      if (CFG.web3formsKey) {
        if (btn) { btn.disabled = true; btn.textContent = 'Envoi en cours…'; }
        try {
          const payload = {
            access_key: CFG.web3formsKey,
            subject: 'Nouvelle demande — DS Digital Studio',
            from_name: 'Site ds-digital.ch',
            Nom: get('name'),
            Entreprise: get('company'),
            'E-mail': get('email'),
            'Téléphone': get('phone'),
            Service: get('service'),
            Projet: get('message')
          };
          const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload)
          });
          const out = await res.json();
          if (out.success) {
            form.reset();
            say('success', 'Merci, votre demande a bien été envoyée. Une réponse vous parviendra rapidement.');
          } else {
            say('error', 'L’envoi a échoué. Écrivez directement à ' + (EMAIL || 'l’adresse de contact') + '.');
          }
        } catch (e) {
          say('error', 'L’envoi a échoué. Écrivez directement à ' + (EMAIL || 'l’adresse de contact') + '.');
        } finally {
          if (btn) { btn.disabled = false; btn.innerHTML = 'Envoyer ma demande <span>↗</span>'; }
        }
        return;
      }

      /* --- Option B : ouverture du logiciel e-mail --- */
      if (!EMAIL) {
        say('warning', 'Le formulaire doit encore être relié à une adresse e-mail dans le fichier site-config.js.');
        return;
      }

      const subject = encodeURIComponent('Nouvelle demande — DS Digital Studio');
      const body = encodeURIComponent(
        'Nom : ' + get('name') + '\n' +
        'Entreprise : ' + get('company') + '\n' +
        'E-mail : ' + get('email') + '\n' +
        'Téléphone : ' + get('phone') + '\n' +
        'Service : ' + get('service') + '\n\n' +
        'Projet :\n' + get('message')
      );
      window.location.href = 'mailto:' + EMAIL + '?subject=' + subject + '&body=' + body;
      say('success', 'Votre logiciel e-mail va s’ouvrir avec le message pré-rempli. S’il ne s’ouvre pas, écrivez à ' + EMAIL + '.');
    });
  }

  /* ---------- 7. Année automatique ---------- */
  const year = $('#currentYear');
  if (year) year.textContent = new Date().getFullYear();

})();
