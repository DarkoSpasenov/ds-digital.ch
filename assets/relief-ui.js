/* RELIEF — interactions (navigation, showroom 3D, cartes en relief, formulaire) */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- configuration (site-config.js) ---------- */
  var cfg = window.DS_CONFIG || {};
  if (cfg.contactEmail) {
    document.querySelectorAll('[data-email]').forEach(function (a) {
      a.href = 'mailto:' + cfg.contactEmail; a.textContent = cfg.contactEmail;
    });
  }
  var form = document.querySelector('[data-form]');
  if (form && cfg.formspreeEndpoint) form.action = cfg.formspreeEndpoint;
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- navigation ---------- */
  var nav = document.querySelector('[data-nav]');
  function onScroll() { if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 20); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var burger = document.querySelector('[data-burger]');
  var menu = document.querySelector('[data-menu]');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      menu.hidden = open;
      if (nav) nav.classList.toggle('is-scrolled', !open || window.scrollY > 20);
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) { burger.setAttribute('aria-expanded', 'false'); menu.hidden = true; }
    });
  }

  /* ---------- showroom : carrousel 3D ---------- */
  var car = document.querySelector('[data-carousel]');
  if (car) {
    var stage = car.querySelector('.carousel-stage');
    var slides = Array.prototype.slice.call(car.querySelectorAll('.slide'));
    var n = slides.length;
    var pos = 0;           // position continue (index flottant)
    var active = 0;
    var dotsBox = car.querySelector('[data-dots]');
    var info = {
      tag: car.querySelector('[data-info-tag]'), name: car.querySelector('[data-info-name]'),
      desc: car.querySelector('[data-info-desc]'), url: car.querySelector('[data-info-url]')
    };

    slides.forEach(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', s.dataset.name);
      b.addEventListener('click', function () { goTo(i); });
      dotsBox.appendChild(b);
    });
    var dots = dotsBox.querySelectorAll('button');

    function wrap(d) { d = ((d % n) + n) % n; return d > n / 2 ? d - n : d; }

    function layout() {
      var w = stage.clientWidth;
      var step = Math.min(w * 0.36, 430);
      slides.forEach(function (s, i) {
        var d = wrap(i - pos);
        var a = Math.abs(d);
        var x = d * step;
        var z = -a * 280;
        var ry = -Math.max(-1.4, Math.min(1.4, d)) * 42;
        var sc = 1 - Math.min(a, 2) * 0.06;
        s.style.transform = 'translateX(' + x + 'px) translateZ(' + z + 'px) rotateY(' + ry + 'deg) scale(' + sc + ')';
        s.style.opacity = a > 1.6 ? 0 : (1 - Math.max(0, a - 1) * 1.6).toFixed(3);
        s.style.zIndex = String(100 - Math.round(a * 10));
        s.style.filter = a > 0.5 ? 'saturate(.75) brightness(.96)' : 'none';
      });
    }

    function setActive(i) {
      active = ((i % n) + n) % n;
      slides.forEach(function (s, k) {
        s.classList.toggle('is-active', k === active);
        var link = s.querySelector('a'); if (link) link.tabIndex = k === active ? 0 : -1;
        s.setAttribute('aria-hidden', k === active ? 'false' : 'true');
      });
      dots.forEach(function (d, k) { d.setAttribute('aria-selected', k === active ? 'true' : 'false'); });
      var s = slides[active];
      info.tag.textContent = s.dataset.tag; info.name.textContent = s.dataset.name;
      info.desc.textContent = s.dataset.desc; info.url.href = s.dataset.url;
    }

    function goTo(i) {
      // choisir le chemin le plus court
      var d = wrap(i - pos);
      pos = pos + d;
      setActive(Math.round(pos));
      layout();
    }

    car.querySelector('[data-prev]').addEventListener('click', function () { goTo(Math.round(pos) - 1); stopAuto(); });
    car.querySelector('[data-next]').addEventListener('click', function () { goTo(Math.round(pos) + 1); stopAuto(); });
    dotsBox.addEventListener('click', stopAuto);
    car.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { goTo(Math.round(pos) - 1); stopAuto(); }
      if (e.key === 'ArrowRight') { goTo(Math.round(pos) + 1); stopAuto(); }
    });

    // glisser (souris + tactile)
    var startX = 0, startPos = 0, dragging = false, moved = 0;
    stage.addEventListener('pointerdown', function (e) {
      dragging = true; moved = 0; startX = e.clientX; startPos = pos;
      stage.classList.add('is-drag'); stopAuto();
    });
    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX; moved = Math.max(moved, Math.abs(dx));
      pos = startPos - dx / Math.min(stage.clientWidth * 0.36, 430);
      layout();
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false; stage.classList.remove('is-drag');
      pos = Math.round(pos); setActive(pos); layout();
    }
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    // un clic sur une slide latérale la ramène au centre ; un glissé n'ouvre pas le lien
    stage.addEventListener('click', function (e) {
      if (moved > 6) { e.preventDefault(); return; }
      var s = e.target.closest('.slide');
      if (s && !s.classList.contains('is-active')) { e.preventDefault(); goTo(slides.indexOf(s)); }
    }, true);
    slides.forEach(function (s) { s.addEventListener('click', function (e) { if (moved > 6) e.preventDefault(); }); });

    // inclinaison de la slide active selon la souris
    if (finePointer && !reduce) {
      stage.addEventListener('mousemove', function (e) {
        var dev = slides[active].querySelector('.device');
        var r = dev.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        dev.style.setProperty('--ry', ((px - 0.5) * 10).toFixed(2) + 'deg');
        dev.style.setProperty('--rx', ((0.5 - py) * 8).toFixed(2) + 'deg');
        dev.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        dev.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
      });
      stage.addEventListener('mouseleave', function () {
        slides.forEach(function (s) { var d = s.querySelector('.device'); d.style.setProperty('--rx', '0deg'); d.style.setProperty('--ry', '0deg'); });
      });
    }

    // rotation automatique douce tant que l'utilisateur n'interagit pas
    var auto = null;
    function stopAuto() { if (auto) { clearInterval(auto); auto = null; } }
    if (!reduce) {
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (x) {
          if (x.isIntersecting && auto === null) auto = setInterval(function () { goTo(Math.round(pos) + 1); }, 4200);
          else if (!x.isIntersecting && auto) { clearInterval(auto); auto = null; }
        });
      }, { threshold: 0.4 });
      io.observe(car);
      car.addEventListener('mouseenter', function () { stopAuto(); auto = false; });
    }

    window.addEventListener('resize', layout);
    setActive(0); layout();
  }

  /* ---------- cartes en relief (tilt) ---------- */
  if (finePointer && !reduce) {
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      var target = el.querySelector('.card3d-in') || el;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        target.style.setProperty('--ry', ((px - 0.5) * 12).toFixed(2) + 'deg');
        target.style.setProperty('--rx', ((0.5 - py) * 10).toFixed(2) + 'deg');
        target.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        target.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
      });
      el.addEventListener('mouseleave', function () {
        target.style.setProperty('--rx', '0deg'); target.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- apparition au scroll ---------- */
  var toReveal = document.querySelectorAll('.sec-head, .team > *, .steps > *, .contact-card, .carousel');
  if ('IntersectionObserver' in window && !reduce) {
    var rio = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); rio.unobserve(x.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    toReveal.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (el.parentElement.classList.contains('steps') || el.parentElement.classList.contains('team') ? (Array.prototype.indexOf.call(el.parentElement.children, el) * 0.12) : 0) + 's';
      rio.observe(el);
    });
  }

  /* ---------- formulaire (Formspree) ---------- */
  if (form && window.fetch) {
    var status = form.querySelector('[data-form-status]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; status.textContent = 'Envoi en cours…';
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error();
          form.reset(); status.textContent = 'Merci ! Votre message est bien parti.';
        })
        .catch(function () { status.textContent = 'Oups, l’envoi a échoué. Écrivez-nous directement par e-mail.'; })
        .then(function () { btn.disabled = false; });
    });
  }
})();
