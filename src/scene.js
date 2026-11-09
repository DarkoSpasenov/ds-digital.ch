/* ============================================================
   DS DIGITAL STUDIO — scène 3D du hero (Three.js)
   Source. Le fichier publié est assets/js/scene.min.js,
   généré avec : npm install && npm run build
   ============================================================ */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, Points,
  ExtrudeGeometry, SphereGeometry, TorusGeometry, BufferGeometry,
  Float32BufferAttribute, MeshPhysicalMaterial, MeshBasicMaterial,
  PointsMaterial, ShapePath, PMREMGenerator, DirectionalLight,
  AmbientLight, Color, ACESFilmicToneMapping, SRGBColorSpace,
  AdditiveBlending, MathUtils
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import GLYPHS from './ds-glyphs.json';

const GOLD = 0xd5a33c;

export function initScene(canvas, host) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Rendu ---------- */
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    return null; // pas de WebGL : le visuel de secours CSS reste affiché
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  /* Reflets doux type studio photo */
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const key = new DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 4, 5);
  const rim = new DirectionalLight(new Color(GOLD), 2.2);
  rim.position.set(-4, -1, -3);
  scene.add(key, rim, new AmbientLight(0xffffff, 0.15));

  /* ---------- Le monogramme « DS. » ---------- */
  const shapePath = new ShapePath();
  const t = GLYPHS.d.split(' ');
  for (let i = 0; i < t.length;) {
    const c = t[i++];
    const n = () => parseFloat(t[i++]);
    if (c === 'M') shapePath.moveTo(n(), n());
    else if (c === 'L') shapePath.lineTo(n(), n());
    else if (c === 'Q') { const a = n(), b = n(), x = n(), y = n(); shapePath.quadraticCurveTo(a, b, x, y); }
    else if (c === 'C') { const a = n(), b = n(), d = n(), e = n(), x = n(), y = n(); shapePath.bezierCurveTo(a, b, d, e, x, y); }
    // 'Z' : rien à faire, ShapePath ferme les contours
  }
  const shapes = shapePath.toShapes(false);
  const letterGeo = new ExtrudeGeometry(shapes, {
    depth: 0.16, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.012,
    bevelSegments: 4, curveSegments: 18
  });
  letterGeo.translate(-0.07, 0, -0.08);

  const letterMat = new MeshPhysicalMaterial({
    color: 0xf1eee7, roughness: 0.32, metalness: 0.05,
    clearcoat: 1, clearcoatRoughness: 0.18
  });
  const goldMat = new MeshPhysicalMaterial({
    color: GOLD, roughness: 0.22, metalness: 1, clearcoat: 0.6, clearcoatRoughness: 0.2
  });

  const mark = new Group();
  const letters = new Mesh(letterGeo, letterMat);
  mark.add(letters);

  const dot = new Mesh(new SphereGeometry(0.075, 48, 32), goldMat);
  dot.position.set(GLYPHS.right + 0.03, -0.29, 0);
  mark.add(dot);

  /* Anneau du logo, en or fin */
  const ring = new Mesh(new TorusGeometry(1.15, 0.006, 16, 180), goldMat);
  const ring2 = new Mesh(new TorusGeometry(1.32, 0.0025, 8, 180),
    new MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.35 }));
  ring.rotation.x = ring2.rotation.x = Math.PI / 2.3;

  const rig = new Group();
  rig.add(mark, ring, ring2);
  rig.scale.setScalar(1.25);
  scene.add(rig);

  /* Poussière dorée pour la profondeur */
  const COUNT = window.innerWidth < 760 ? 220 : 520;
  const pos = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const r = 2.2 + Math.random() * 4.5;
    const a = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
    pos[i * 3 + 2] = Math.sin(a) * r - 3;
  }
  const dustGeo = new BufferGeometry();
  dustGeo.setAttribute('position', new Float32BufferAttribute(pos, 3));
  const dust = new Points(dustGeo, new PointsMaterial({
    color: GOLD, size: 0.022, transparent: true, opacity: 0.55,
    depthWrite: false, blending: AdditiveBlending
  }));
  scene.add(dust);

  /* ---------- Mise en page (desktop : à droite ; mobile : en haut) ---------- */
  let base = { x: 0, y: 0, s: 1 };
  function layout() {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const visH = 2 * Math.tan(MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const visW = visH * camera.aspect;
    if (camera.aspect > 1.05) {
      base = { x: visW * 0.245, y: 0.05, s: Math.min(1.5, visW / 5) };
    } else {
      base = { x: 0, y: visH * 0.25, s: Math.min(1, visW / 3.1) };
    }
    rig.scale.setScalar(base.s);
  }
  layout();

  /* ---------- Interactions ---------- */
  const pointer = { x: 0, y: 0 }, smooth = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  let scrollP = 0;
  function onScroll() {
    scrollP = MathUtils.clamp(window.scrollY / Math.max(1, host.clientHeight), 0, 1);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { layout(); if (!running) renderer.render(scene, camera); }, 120);
  });

  /* ---------- Boucle ---------- */
  const start = performance.now();
  let running = false, visible = true, raf = 0;

  function frame(now) {
    const time = (now - start) / 1000;
    const intro = reduce ? 1 : MathUtils.smootherstep(Math.min(time / 1.8, 1), 0, 1);

    smooth.x += (pointer.x - smooth.x) * 0.05;
    smooth.y += (pointer.y - smooth.y) * 0.05;

    rig.position.set(base.x, base.y + scrollP * 1.2 - (1 - intro) * 0.6, -scrollP * 1.5);
    rig.scale.setScalar(base.s * (0.85 + intro * 0.15));

    mark.rotation.y = smooth.x * 0.45 + Math.sin(time * 0.5) * 0.12 + (1 - intro) * -1.2 + scrollP * 0.9;
    mark.rotation.x = smooth.y * 0.25 + Math.sin(time * 0.35) * 0.05;
    dot.position.y = -0.29 + Math.sin(time * 1.6) * 0.025;

    ring.rotation.z = time * 0.18;
    ring.rotation.y = smooth.x * 0.2;
    ring2.rotation.z = -time * 0.1;
    ring.scale.setScalar(intro * (1 + scrollP * 0.4));
    ring2.scale.setScalar(intro * (1 + scrollP * 0.6));

    dust.rotation.y = time * 0.02 + smooth.x * 0.05;
    dust.position.y = scrollP * 0.8;

    renderer.render(scene, camera);
    raf = running ? requestAnimationFrame(frame) : 0;
  }

  function play() {
    if (running || reduce) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }
  function pause() { running = false; cancelAnimationFrame(raf); }

  /* On ne calcule rien quand le hero n'est pas à l'écran */
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible && !document.hidden ? play() : pause();
  }).observe(host);
  document.addEventListener('visibilitychange', () => {
    document.hidden ? pause() : visible && play();
  });

  if (reduce) frame(start + 5000); // une image fixe, sans mouvement
  else play();

  return { pause, play };
}
