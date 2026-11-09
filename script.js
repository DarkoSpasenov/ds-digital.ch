/* ============================================================
   DS DIGITAL STUDIO — script.js
   Interface (menu, apparitions, inclinaison 3D, formulaire).
   La scène 3D du hero est dans assets/js/scene.min.js.
   ============================================================ */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  const CFG = window.DS_CONFIG || {};
  const EMAIL = (CFG.contactEmail || '').trim();
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 1. Header, barre de progression, bouton mobile ---------- */
  const header = $('.site-header');
  const bar = $('#progressBar');
  const mobileCta = $('.mobile-cta');
  const contact = $('#contact');
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 20);
    if (bar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    }
    if (mobileCta) {
      const nearContact = contact && contact.getBoundingClientRect().top < window.innerHeight * 0.9;
      mobileCta.classList.toggle('show', y > window.innerHeight * 0.7 && !nearContact);
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- 2. Menu mobile ---------- */
  const toggle = $('.menu-toggle');
  const nav = $('#mainnav');
  function closeMenu() {
    if (!nav) return;
    nav.classList.remove('open');
    document.body.classList.remove('menu-open');
    if (toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Ouvrir le menu'); }
  }
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    });
    $$('a', nav).forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  /* Lien actif dans le menu selon la section visible */
  const navLinks = $$('.nav a[href^="#"]:not(.nav-cta)');
  if ('IntersectionObserver' in window && navLinks.length) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(a => { const s = $(a.getAttribute('href')); if (s) spy.observe(s); });
  }

  /* ---------- 3. Apparition au défilement ---------- */
  const reveals = $$('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = el.parentElement ? $$(':scope > .reveal', el.parentElement) : [];
        el.style.transitionDelay = Math.min(siblings.indexOf(el), 4) * 70 + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(el => io.observe(el));
  }

  /* ---------- 4. Inclinaison 3D des cartes (souris uniquement) ---------- */
  if (finePointer && !reduced) {
    $$('[data-tilt]').forEach(card => {
      const target = card.querySelector('.about-photo') || card;
      let raf = 0;
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          target.style.transition = 'transform .15s ease-out';
          target.style.transform = 'rotateY(' + (x * 9).toFixed(2) + 'deg) rotateX(' + (-y * 7).toFixed(2) + 'deg) translateZ(10px)';
        });
      });
      card.addEventListener('pointerleave', () => {
        cancelAnimationFrame(raf);
        target.style.transition = '';
        target.style.transform = '';
      });
    });
  }

  /* ---------- 5. Bandeau clients qui défile ---------- */
  const marquee = $('.marquee');
  if (marquee && !reduced) {
    const track = $('.marquee-track', marquee);
    Array.from(track.children).forEach(a => {
      const c = a.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.tabIndex = -1;
      track.appendChild(c);
    });
    marquee.classList.add('is-moving');
  }

  /* ---------- 6. Aperçus des sites (service mShots) ----------
     La première demande peut prendre quelques secondes :
     on garde l'animation de chargement, puis on retente une fois. */
  $$('.site-shot').forEach(img => {
    const box = img.closest('.shot');
    let retried = false;
    const done = () => { img.classList.add('loaded'); if (box) box.classList.add('done'); };
    if (img.complete && img.naturalWidth > 0) { done(); return; }
    img.addEventListener('load', done);
    img.addEventListener('error', () => { if (box) box.classList.add('done'); });
    setTimeout(() => {
      if (retried || img.classList.contains('loaded')) return;
      retried = true;
      const src = img.getAttribute('src');
      fetch(src, { mode: 'no-cors', cache: 'reload' }).catch(() => {}).finally(() => { img.src = src; });
    }, 6000);
  });

  /* ---------- 7. Packs : sur mobile, ouvrir sur le Pack Pro ---------- */
  const track = $('#packsTrack');
  const featured = track && $('.pack-featured', track);
  if (track && featured && track.scrollWidth > track.clientWidth) {
    track.scrollLeft = featured.offsetLeft - (track.clientWidth - featured.offsetWidth) / 2;
  }

  /* ---------- 8. Les boutons « Devis » pré-remplissent le formulaire ---------- */
  const select = $('#serviceSelect');
  const message = $('#messageField');
  $$('[data-service]').forEach(btn => {
    btn.addEventListener('click', () => {
      const wanted = btn.getAttribute('data-service');
      if (select) {
        const opt = Array.from(select.options).find(o => o.text === wanted);
        if (opt) select.value = opt.value;
      }
      const pack = btn.getAttribute('data-pack');
      if (pack && message && !message.value.trim()) message.value = 'Je suis intéressé·e par le Pack ' + pack + '. ';
    });
  });

  /* ---------- 9. Coordonnées depuis site-config.js ---------- */
  if (EMAIL) {
    $$('a[href^="mailto:"]').forEach(a => {
      a.setAttribute('href', 'mailto:' + EMAIL);
      if (a.textContent.indexOf('@') > -1 && !a.children.length) a.textContent = EMAIL;
    });
    $$('.contact-link em').forEach(el => { if (el.textContent.indexOf('@') > -1) el.textContent = EMAIL; });
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
      '<span><b>Téléphone</b><em></em></span>';
    a.querySelector('em').textContent = tel;
    links.appendChild(a);
  }
  const socialWrap = $('[data-socials]');
  if (socialWrap) {
    [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['linkedin', 'LinkedIn']].forEach(([key, label]) => {
      if (!CFG[key]) return;
      const a = document.createElement('a');
      a.href = CFG[key]; a.target = '_blank'; a.rel = 'noopener'; a.textContent = label;
      socialWrap.appendChild(a);
    });
  }

  /* ---------- 10. Formulaire de contact (Formspree) ---------- */
  const form = $('[data-contact-form]');
  const alertBox = $('#formAlert');
  const fallback = () => 'Écrivez directement à ' + (EMAIL || 'l’adresse de contact') + '.';

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
      if (form.website && form.website.value) return; // piège à robots

      if (!form.checkValidity()) {
        say('error', 'Merci de compléter les champs obligatoires (nom, e-mail et description du projet).');
        const first = form.querySelector(':invalid');
        if (first) first.focus();
        return;
      }

      const endpoint = (CFG.formspreeEndpoint || form.getAttribute('action') || '').trim();
      const btn = form.querySelector('.submit-btn');
      if (!endpoint) { say('error', 'Le formulaire n’est pas configuré. ' + fallback()); return; }
      if (btn) { btn.disabled = true; btn.textContent = 'Envoi en cours…'; }

      try {
        const res = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (res.ok) {
          form.reset();
          say('success', 'Merci, votre demande a bien été envoyée. Une réponse vous parviendra rapidement.');
        } else {
          say('error', 'L’envoi a échoué. ' + fallback());
        }
      } catch (e) {
        say('error', 'L’envoi a échoué. Vérifiez votre connexion ou ' + fallback().toLowerCase());
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = 'Envoyer ma demande <span aria-hidden="true">↗</span>'; }
      }
    });
  }

  /* ---------- 11. Année automatique ---------- */
  const year = $('#currentYear');
  if (year) year.textContent = new Date().getFullYear();
})();
