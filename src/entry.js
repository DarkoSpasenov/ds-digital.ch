/* Point d'entrée : lance la scène 3D quand le navigateur est disponible.
   Les réalisations affichées en 3D sont lues dans la section
   « Réalisations » de index.html (attributs data-img / data-domain). */
import { initScene } from './scene.js';

const host = document.querySelector('[data-hero3d]');
const canvas = host && host.querySelector('canvas');
const caption = host && host.querySelector('[data-orbit-caption]');

const projects = Array.from(document.querySelectorAll('.project[data-img]')).map((el) => ({
  name: el.querySelector('h3').textContent.trim(),
  sector: (el.querySelector('.pill') || {}).textContent || '',
  url: el.querySelector('a').href,
  domain: el.getAttribute('data-domain'),
  img: el.getAttribute('data-img')
}));

function onHover(p) {
  if (!caption) return;
  caption.classList.toggle('show', !!p);
  if (p) caption.innerHTML = '<b></b><span></span>';
  if (p) {
    caption.querySelector('b').textContent = p.name;
    caption.querySelector('span').textContent = p.sector + ' · Visiter le site ↗';
  }
}

function boot() {
  const api = initScene(canvas, host, projects, onHover);
  if (api) requestAnimationFrame(() => host.classList.add('is-ready'));
}

if (canvas && projects.length) {
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
  idle(boot, { timeout: 1200 });
}
