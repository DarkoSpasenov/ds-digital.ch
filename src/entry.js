/* Point d'entrée : lance la scène 3D quand le navigateur est disponible. */
import { initScene } from './scene.js';

const host = document.querySelector('[data-hero3d]');
const canvas = host && host.querySelector('canvas');

function boot() {
  const api = initScene(canvas, host);
  if (api) requestAnimationFrame(() => host.classList.add('is-ready'));
}

if (canvas) {
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
  idle(boot, { timeout: 1200 });
}
