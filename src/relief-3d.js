/*
  RELIEF — scène 3D du hero (three.js)
  Source lisible. Le fichier servi est assets/relief-3d.min.js (voir README.txt pour le build).
  Les écrans flottants affichent les captures de nos réalisations ;
  un clic sur un écran ouvre le site.
*/
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, PlaneGeometry, SphereGeometry,
  TorusGeometry, CapsuleGeometry, MeshPhysicalMaterial, MeshBasicMaterial, CanvasTexture,
  PMREMGenerator, ACESFilmicToneMapping, SRGBColorSpace, DirectionalLight, PointLight,
  Raycaster, Vector2, MathUtils, Color, IcosahedronGeometry
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const SITES = [
  { img: 'assets/work/delta-view.webp', url: 'https://delta-view.ch', domain: 'delta-view.ch',
    pos: [-2.25, 0.95, -1.7], rot: [0.04, 0.5, 0.02], s: 0.92 },
  { img: 'assets/work/fit2010.webp', url: 'https://fit2010.ch', domain: 'fit2010.ch',
    pos: [0.15, -0.35, 0.5], rot: [0.06, -0.2, 0], s: 1.0 },
  { img: 'assets/work/dymatec.webp', url: 'https://dymatec.ch', domain: 'dymatec.ch',
    pos: [2.25, 1.25, -2.6], rot: [0.02, -0.55, -0.02], s: 0.9 },
];

const canvas = document.querySelector('[data-hero-canvas]');
const stage = document.querySelector('[data-stage]');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function noWebGL() { document.documentElement.classList.add('no-webgl'); }

if (canvas && stage) {
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { renderer = null; }
  if (!renderer) noWebGL(); else start(renderer);
}

function start(renderer) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  const root = new Group();
  scene.add(root);

  const key = new DirectionalLight(0xffffff, 1.4); key.position.set(4, 6, 6); scene.add(key);
  const rim = new PointLight(0xff4d8d, 30, 20); rim.position.set(-4, -2, 3); scene.add(rim);
  const rim2 = new PointLight(0x5b2eff, 30, 20); rim2.position.set(4, 3, -2); scene.add(rim2);

  /* ---------- écrans ---------- */
  const W = 3.2, H = 2.16, D = 0.09;
  const frameGeo = new RoundedBoxGeometry(W, H, D, 4, 0.09);
  const frameMat = new MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12 });
  const screenGeo = new PlaneGeometry(W - 0.14, (W - 0.14) * (848 / 1280));
  const items = [];
  const screens = [];

  SITES.forEach((site, i) => {
    const g = new Group();
    const frame = new Mesh(frameGeo, frameMat);
    const tex = makeScreenTexture(site, renderer);
    const screen = new Mesh(screenGeo, new MeshBasicMaterial({ map: tex, toneMapped: false }));
    screen.position.z = D / 2 + 0.002;
    screen.userData.site = site;
    g.add(frame, screen);
    g.scale.setScalar(site.s);
    root.add(g);
    screens.push(screen);
    items.push({ obj: g, base: site.pos, rot: site.rot, amp: 0.08, speed: 0.55 + i * 0.12, phase: i * 1.7, delay: 0.15 * i, screen: true });
  });

  /* ---------- formes iridescentes ---------- */
  const glossy = (c, extra = {}) => new MeshPhysicalMaterial(Object.assign({
    color: new Color(c), roughness: 0.12, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.05,
    iridescence: 0.9, iridescenceIOR: 1.5, iridescenceThicknessRange: [180, 620]
  }, extra));

  const shapes = [
    { geo: new TorusGeometry(0.55, 0.22, 48, 120), mat: glossy('#6A3BFF'), pos: [-2.55, -1.45, 0.9], rot: [0.9, 0.3, 0] },
    { geo: new SphereGeometry(0.5, 64, 64), mat: glossy('#FF4D8D'), pos: [2.6, -1.25, 1.1], rot: [0, 0, 0] },
    { geo: new RoundedBoxGeometry(0.85, 0.85, 0.85, 6, 0.18), mat: glossy('#FFB38A'), pos: [-0.85, 2.05, -0.6], rot: [0.6, 0.7, 0.2] },
    { geo: new CapsuleGeometry(0.17, 0.75, 12, 32), mat: glossy('#D9FF4A', { iridescence: 0.4 }), pos: [1.35, 1.95, 0.9], rot: [0.3, 0, 0.9] },
    { geo: new IcosahedronGeometry(0.26, 0), mat: glossy('#5B2EFF', { flatShading: true }), pos: [0.9, -2.0, 1.6], rot: [0.2, 0.4, 0] },
    { geo: new SphereGeometry(0.16, 32, 32), mat: glossy('#FFFFFF', { iridescence: 1 }), pos: [-1.3, -0.4, 1.9], rot: [0, 0, 0] },
  ];
  shapes.forEach((s, i) => {
    const m = new Mesh(s.geo, s.mat);
    root.add(m);
    items.push({ obj: m, base: s.pos, rot: s.rot, amp: 0.18, speed: 0.7 + i * 0.15, phase: i * 2.1, delay: 0.35 + 0.08 * i, spin: 0.25 + (i % 3) * 0.12 });
  });

  /* ---------- ombre douce au sol ---------- */
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 256;
  const sc = shadowCanvas.getContext('2d');
  const grd = sc.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, 'rgba(60,30,140,0.35)'); grd.addColorStop(1, 'rgba(60,30,140,0)');
  sc.fillStyle = grd; sc.fillRect(0, 0, 256, 256);
  const shadow = new Mesh(new PlaneGeometry(9, 3.2), new MeshBasicMaterial({ map: new CanvasTexture(shadowCanvas), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, -2.9, -0.5);
  root.add(shadow);

  /* ---------- taille / caméra ---------- */
  let width = 1, height = 1;
  function resize() {
    const r = stage.getBoundingClientRect();
    width = Math.max(1, r.width); height = Math.max(1, r.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // reculer la caméra pour que toute la composition reste visible
    const fitW = 7.4 / (2 * Math.tan(MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
    const fitH = 6.0 / (2 * Math.tan(MathUtils.degToRad(camera.fov / 2)));
    camera.position.set(0, 0, MathUtils.clamp(Math.max(fitW, fitH), 8.6, 17));
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  /* ---------- interactions ---------- */
  const pointer = new Vector2(0, 0);      // -1..1, pour la parallaxe
  const ndc = new Vector2(9, 9);          // pour le survol
  let dragging = false, dragX = 0, spin = 0, spinVel = 0, hovered = null, downAt = [0, 0];
  const ray = new Raycaster();

  window.addEventListener('pointermove', (e) => {
    pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    if (dragging) { const dx = e.clientX - dragX; dragX = e.clientX; spinVel = dx * 0.004; spin += spinVel; }
  }, { passive: true });
  canvas.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') { dragging = true; dragX = e.clientX; downAt = [e.clientX, e.clientY]; } });
  window.addEventListener('pointerup', () => { dragging = false; });
  canvas.addEventListener('pointerleave', () => ndc.set(9, 9));
  canvas.addEventListener('click', (e) => {
    if (Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6 && e.pointerType !== 'touch') return;
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(screens, false)[0];
    if (hit) window.open(hit.object.userData.site.url, '_blank', 'noopener');
  });

  /* ---------- boucle ---------- */
  let visible = true, t0 = performance.now(), last = t0;
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) loop(); }, { threshold: 0 });
  io.observe(stage);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) loop(); });

  const easeOut = (x) => 1 - Math.pow(1 - MathUtils.clamp(x, 0, 1), 4);
  let raf = 0;

  function frame(now) {
    raf = 0;
    const t = (now - t0) / 1000;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const heroH = stage.closest('.hero').offsetHeight || window.innerHeight;
    const sp = MathUtils.clamp(window.scrollY / heroH, 0, 1);

    // inertie de la rotation à la souris
    if (!dragging) { spinVel *= 0.94; spin += spinVel; spin *= 0.985; }

    const tx = pointer.y * 0.12 + sp * 0.25;
    const ty = pointer.x * 0.32 + spin + sp * 0.7;
    root.rotation.x += (tx - root.rotation.x) * 0.06;
    root.rotation.y += (ty - root.rotation.y) * 0.06;
    root.position.y = sp * 1.6;

    items.forEach((it) => {
      const k = reduce ? 1 : easeOut((t - it.delay) / 1.6);
      const spread = 1 + sp * 0.5;
      const fl = reduce ? 0 : Math.sin(t * it.speed + it.phase) * it.amp;
      it.obj.position.set(it.base[0] * spread, it.base[1] * spread + fl, it.base[2] - (1 - k) * 12);
      if (it.spin) {
        it.obj.rotation.set(it.rot[0] + t * it.spin * 0.6, it.rot[1] + t * it.spin, it.rot[2]);
      } else {
        it.obj.rotation.set(it.rot[0] + Math.sin(t * 0.4 + it.phase) * 0.03, it.rot[1] + (1 - k) * 1.2, it.rot[2]);
      }
      it.k = k;
    });

    // survol des écrans
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(screens, false)[0];
    const h = hit ? hit.object.parent : null;
    if (h !== hovered) { hovered = h; canvas.style.cursor = h ? 'pointer' : ''; }
    items.forEach((it) => {
      if (!it.screen) return;
      const target = it.obj === hovered ? 1.07 : 1;
      const base = SITES[items.indexOf(it)].s;
      const cur = it.obj.scale.x / base;
      it.obj.scale.setScalar(base * (cur + (target - cur) * 0.12));
    });

    renderer.render(scene, camera);
    if (visible && !document.hidden && !reduce) loop();
    else if (reduce && t < 0.1) loop();
  }
  function loop() { if (!raf) raf = requestAnimationFrame(frame); }
  loop();
  if (reduce) { window.addEventListener('pointermove', loop, { passive: true }); }
}

/* Compose une texture d'écran : barre de navigateur + capture du site. */
function makeScreenTexture(site, renderer) {
  const c = document.createElement('canvas');
  c.width = 1280; c.height = 848;
  const x = c.getContext('2d');
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const drawBar = () => {
    x.fillStyle = '#F1EFF5'; x.fillRect(0, 0, 1280, 48);
    ['#FF6B8F', '#FFC36B', '#7BE38A'].forEach((col, i) => { x.fillStyle = col; x.beginPath(); x.arc(28 + i * 22, 24, 7, 0, Math.PI * 2); x.fill(); });
    x.fillStyle = '#FFFFFF';
    roundRect(x, 520, 10, 240, 28, 14); x.fill();
    x.fillStyle = '#615E6C'; x.font = '500 16px Inter, system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(site.domain, 640, 25);
  };
  // fond en attendant l'image
  const g = x.createLinearGradient(0, 0, 1280, 848);
  g.addColorStop(0, '#5B2EFF'); g.addColorStop(1, '#FF4D8D');
  x.fillStyle = g; x.fillRect(0, 0, 1280, 848);
  drawBar();

  const img = new Image();
  img.decoding = 'async';
  img.onload = () => { x.drawImage(img, 0, 48, 1280, 800); drawBar(); tex.needsUpdate = true; };
  img.src = site.img;
  return tex;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
