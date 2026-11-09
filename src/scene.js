/* ============================================================
   DS DIGITAL STUDIO — scène 3D du hero (Three.js)
   Les réalisations flottent en orbite au-dessus d'une planète,
   dans l'espace. Source : le fichier publié est assets/js/scene.min.js,
   généré avec : npm install && npm run build
   ============================================================ */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, Points,
  PlaneGeometry, SphereGeometry, BufferGeometry, Float32BufferAttribute,
  MeshBasicMaterial, ShaderMaterial, CanvasTexture, Vector2, Vector3,
  Raycaster, Color, SRGBColorSpace, AdditiveBlending, BackSide, MathUtils
} from 'three';

const GOLD = new Color(0xd5a33c);

/* ---------- Petits outils ---------- */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* Fenêtre de navigateur dessinée autour de la capture */
function drawWindow(img, domain) {
  const W = 1024, BAR = 46, H = 640 + BAR, R = 26;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  roundRect(ctx, 0, 0, W, H, R);
  ctx.clip();
  ctx.fillStyle = '#1b1b1e';
  ctx.fillRect(0, 0, W, BAR);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(26 + i * 22, BAR / 2, 6.5, 0, Math.PI * 2); ctx.fill();
  });
  ctx.fillStyle = 'rgba(255,255,255,.07)';
  roundRect(ctx, W / 2 - 140, 10, 280, BAR - 20, 13); ctx.fill();
  ctx.fillStyle = '#c9c7c0';
  ctx.font = '500 17px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(domain, W / 2, BAR / 2 + 1);
  if (img) ctx.drawImage(img, 0, BAR, W, 640);
  else { ctx.fillStyle = '#151517'; ctx.fillRect(0, BAR, W, 640); }
  /* liseré doré */
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(213,163,60,.55)';
  roundRect(ctx, 1.5, 1.5, W - 3, H - 3, R - 1); ctx.stroke();
  return c;
}

function glowTexture(inner, outer) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/* ---------- Shaders ---------- */
const NOISE = /* glsl */`
  float hash(vec3 p){ p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float noise(vec3 x){
    vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
`;

const planetVert = /* glsl */`
  varying vec3 vObj; varying vec3 vNormalW; varying vec3 vViewDir;
  void main(){
    vObj = normalize(position);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }`;

const planetFrag = /* glsl */`
  uniform vec3 uLight; uniform vec3 uGold; uniform float uTime;
  varying vec3 vObj; varying vec3 vNormalW; varying vec3 vViewDir;
  ${NOISE}
  void main(){
    float h = fbm(vObj * 2.6);
    float land = smoothstep(0.48, 0.56, h);
    vec3 ocean = vec3(0.015, 0.06, 0.16);
    vec3 ground = mix(vec3(0.08, 0.11, 0.06), vec3(0.2, 0.17, 0.1), fbm(vObj * 9.0));
    vec3 col = mix(ocean, ground, land);
    float clouds = smoothstep(0.55, 0.8, fbm(vObj * 4.0 + vec3(uTime * 0.01, 0.0, 0.0)));
    float diff = clamp(dot(vNormalW, uLight), 0.0, 1.0);
    col = mix(col, vec3(0.5), clouds * 0.35);
    col *= 0.18 + diff * 1.1;
    /* lumières des villes côté nuit */
    float city = smoothstep(0.78, 0.9, noise(vObj * 70.0)) * land * (1.0 - smoothstep(0.0, 0.25, diff));
    col += uGold * city * 1.4;
    /* bord lumineux */
    float rim = pow(1.0 - clamp(dot(vNormalW, vViewDir), 0.0, 1.0), 3.0);
    col += mix(vec3(0.3, 0.55, 1.0), uGold, 0.3 + 0.5 * diff) * rim * (0.45 + diff);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }`;

const atmoVert = /* glsl */`
  varying vec3 vNormalW; varying vec3 vViewDir;
  void main(){
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }`;
const atmoFrag = /* glsl */`
  uniform vec3 uGold; uniform vec3 uLight;
  varying vec3 vNormalW; varying vec3 vViewDir;
  void main(){
    float i = pow(clamp(0.78 + dot(vNormalW, vViewDir), 0.0, 1.0), 3.0);
    float lit = 0.35 + 0.65 * clamp(dot(-vNormalW, uLight) * 0.5 + 0.5, 0.0, 1.0);
    vec3 col = mix(vec3(0.3, 0.55, 1.0), uGold, 0.55 * lit) * i * (0.6 + lit) * 2.4;
    gl_FragColor = vec4(col, i);
  }`;

const starVert = /* glsl */`
  attribute float aSize; attribute float aPhase; attribute vec3 aColor;
  uniform float uTime; uniform float uPR;
  varying float vAlpha; varying vec3 vColor;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPR * (14.0 / -mv.z);
    vAlpha = 0.45 + 0.55 * sin(uTime * (0.6 + aPhase) + aPhase * 30.0);
    vColor = aColor;
  }`;
const starFrag = /* glsl */`
  varying float vAlpha; varying vec3 vColor;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(vColor, a);
  }`;

/* ============================================================ */
export function initScene(canvas, host, projects, onHover) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = window.innerWidth < 760;

  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: !small, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    return null; // pas de WebGL : le visuel de secours CSS reste affiché
  }
  const PR = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
  renderer.setPixelRatio(PR);
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.1, 200);
  camera.position.set(0, 0, 10);
  const lightDir = new Vector3(0.6, 0.75, 0.35).normalize();

  /* ---------- Étoiles ---------- */
  const N = small ? 1400 : 3000;
  const sp = new Float32Array(N * 3), ss = new Float32Array(N), sph = new Float32Array(N), sc = new Float32Array(N * 3);
  const white = new Color(0xffffff), warm = new Color(0xffe2a8);
  for (let i = 0; i < N; i++) {
    sp[i * 3] = (Math.random() - 0.5) * 90;
    sp[i * 3 + 1] = (Math.random() - 0.5) * 60;
    sp[i * 3 + 2] = -10 - Math.random() * 70;
    ss[i] = 0.6 + Math.pow(Math.random(), 4) * 3.2;
    sph[i] = Math.random();
    const c = Math.random() < 0.15 ? GOLD : (Math.random() < 0.3 ? warm : white);
    sc[i * 3] = c.r; sc[i * 3 + 1] = c.g; sc[i * 3 + 2] = c.b;
  }
  const starGeo = new BufferGeometry();
  starGeo.setAttribute('position', new Float32BufferAttribute(sp, 3));
  starGeo.setAttribute('aSize', new Float32BufferAttribute(ss, 1));
  starGeo.setAttribute('aPhase', new Float32BufferAttribute(sph, 1));
  starGeo.setAttribute('aColor', new Float32BufferAttribute(sc, 3));
  const starMat = new ShaderMaterial({
    vertexShader: starVert, fragmentShader: starFrag,
    uniforms: { uTime: { value: 0 }, uPR: { value: PR } },
    transparent: true, depthWrite: false, blending: AdditiveBlending
  });
  const stars = new Points(starGeo, starMat);
  scene.add(stars);

  /* ---------- Nébuleuses ---------- */
  const nebula = new Group();
  [
    { c: 'rgba(213,163,60,.55)', x: 9, y: 4, s: 34, z: -45 },
    { c: 'rgba(70,60,160,.45)', x: -14, y: 6, s: 40, z: -55 },
    { c: 'rgba(190,90,60,.30)', x: 2, y: -6, s: 30, z: -50 }
  ].forEach(n => {
    const m = new Mesh(new PlaneGeometry(n.s, n.s), new MeshBasicMaterial({
      map: glowTexture(n.c, 'rgba(0,0,0,0)'), transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0.55
    }));
    m.position.set(n.x, n.y, n.z);
    nebula.add(m);
  });
  scene.add(nebula);

  /* ---------- Planète ---------- */
  const planet = new Group();
  const planetMesh = new Mesh(
    new SphereGeometry(1, small ? 96 : 160, small ? 64 : 100),
    new ShaderMaterial({
      vertexShader: planetVert, fragmentShader: planetFrag,
      uniforms: { uLight: { value: lightDir }, uGold: { value: GOLD }, uTime: { value: 0 } }
    })
  );
  const atmo = new Mesh(
    new SphereGeometry(1.07, 96, 64),
    new ShaderMaterial({
      vertexShader: atmoVert, fragmentShader: atmoFrag,
      uniforms: { uGold: { value: GOLD }, uLight: { value: lightDir } },
      side: BackSide, transparent: true, depthWrite: false, blending: AdditiveBlending
    })
  );
  planet.add(planetMesh, atmo);
  planetMesh.rotation.z = 0.35;
  scene.add(planet);

  /* ---------- Réalisations en orbite ---------- */
  const orbit = new Group();
  scene.add(orbit);
  const PANEL_H = 0.625 + 0.045; // proportions de la fenêtre dessinée (1024 x 686)
  const panels = projects.map((p, i) => {
    const tex = new CanvasTexture(drawWindow(null, p.domain));
    tex.colorSpace = SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const mesh = new Mesh(
      new PlaneGeometry(1, PANEL_H),
      new MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
    );
    const glow = new Mesh(
      new PlaneGeometry(1.7, 1.7 * PANEL_H * 1.25),
      new MeshBasicMaterial({ map: glowTexture('rgba(213,163,60,.45)', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0 })
    );
    glow.position.z = -0.02;
    const holder = new Group();
    holder.add(glow, mesh);
    holder.userData = { i, project: p, mesh, glow, hover: 0, base: (i / projects.length) * Math.PI * 2 };
    mesh.userData.holder = holder;
    orbit.add(holder);
    loadImage(p.img).then(img => {
      tex.image = drawWindow(img, p.domain);
      tex.needsUpdate = true;
      if (!running) render(performance.now());
    }).catch(() => {});
    return holder;
  });

  /* ---------- Mise en page ---------- */
  const L = { cx: 0, cy: 0, rx: 3, ry: 0.6, rz: 1.6, panelW: 2.2 };
  let planetBase = { x: 0, y: -12, r: 10 };
  function layout() {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const visH = 2 * Math.tan(MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const visW = visH * camera.aspect;
    if (camera.aspect > 1.05) {
      L.cx = visW * 0.23; L.cy = visH * 0.06;
      L.rx = Math.min(visW * 0.14, 2.5); L.ry = 0.75; L.rz = 2.2;
      L.panelW = Math.min(visW * 0.19, 2.8);
      planetBase = { x: visW * 0.18, r: visW * 0.62, y: 0 };
      planetBase.y = -visH * 0.5 - planetBase.r * 0.86;
    } else {
      L.cx = 0; L.cy = visH * 0.22;
      L.rx = visW * 0.27; L.ry = 0.4; L.rz = 1.4;
      L.panelW = visW * 0.46;
      planetBase = { x: 0, r: visW * 1.1, y: 0 };
      planetBase.y = visH * 0.05 - planetBase.r * 1.02;
    }
    planet.scale.setScalar(planetBase.r);
  }
  layout();

  /* ---------- Interactions ---------- */
  const pointer = { x: 0, y: 0 }, smooth = { x: 0, y: 0 };
  const ndc = new Vector2(-9, -9);
  const ray = new Raycaster();
  let hovered = null, spin = 0, spinVel = 0, dragging = false, lastX = 0, moved = 0;

  window.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    if (dragging) {
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      spinVel = dx * 0.004;
      spin += spinVel;
    }
  }, { passive: true });
  canvas.addEventListener('pointerleave', () => { ndc.set(-9, -9); dragging = false; });
  canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return; // sur mobile, on laisse défiler la page
    dragging = true; moved = 0; lastX = e.clientX;
  });
  window.addEventListener('pointerup', () => { dragging = false; });
  canvas.addEventListener('click', (e) => {
    if (moved > 6) return;
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    const hit = pick();
    if (hit) window.open(hit.userData.project.url, '_blank', 'noopener');
  });

  function pick() {
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(panels.map(p => p.userData.mesh), false);
    return hits.length ? hits[0].object.userData.holder : null;
  }

  let scrollP = 0;
  window.addEventListener('scroll', () => {
    scrollP = MathUtils.clamp(window.scrollY / Math.max(1, host.clientHeight), 0, 1);
  }, { passive: true });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { layout(); if (!running) render(performance.now()); }, 120);
  });

  /* ---------- Boucle ---------- */
  const start = performance.now();
  let running = false, visible = true, raf = 0, last = start;
  const tmp = new Vector3();

  function render(now) {
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    const time = reduce ? 6 : (now - start) / 1000;
    /* décollage : on part de la surface et on s'éloigne de la planète */
    const intro = reduce ? 1 : MathUtils.smootherstep(Math.min(time / 2.8, 1), 0, 1);

    smooth.x += (pointer.x - smooth.x) * 0.05;
    smooth.y += (pointer.y - smooth.y) * 0.05;

    starMat.uniforms.uTime.value = time;
    planetMesh.material.uniforms.uTime.value = time;

    /* caméra : parallaxe + éloignement au défilement */
    camera.position.x = smooth.x * 0.5;
    camera.position.y = -smooth.y * 0.3 + scrollP * 1.5;
    camera.position.z = 10 + scrollP * 3;
    camera.lookAt(camera.position.x * 0.4, camera.position.y * 0.6, 0);

    planet.position.set(planetBase.x, planetBase.y + (1 - intro) * planetBase.r * 0.32 - scrollP * 3, -2);
    planetMesh.rotation.y = time * 0.02;

    stars.rotation.y = time * 0.004;
    stars.position.y = -(1 - intro) * 6 + scrollP * 2;
    nebula.rotation.z = time * 0.003;

    /* orbite */
    if (!dragging) { spinVel *= 0.95; spin += spinVel; }
    const speed = hovered ? 0.02 : 0.12;
    if (!reduce) spin += dt * speed;

    let hoverHit = null;
    if (!reduce && ndc.x > -2) hoverHit = pick();
    if (hoverHit !== hovered) {
      hovered = hoverHit;
      canvas.style.cursor = hovered ? 'pointer' : '';
      onHover && onHover(hovered ? hovered.userData.project : null);
    }

    panels.forEach(holder => {
      const d = holder.userData;
      const a = d.base + spin;
      const appear = MathUtils.clamp((intro - 0.25 - d.i * 0.08) / 0.5, 0, 1);
      tmp.set(
        L.cx + Math.cos(a) * L.rx,
        L.cy + Math.sin(a) * L.ry + Math.sin(time * 0.8 + d.i) * 0.06,
        Math.sin(a) * L.rz
      );
      holder.position.copy(tmp);
      holder.position.y -= (1 - appear) * 3;
      const depth = (Math.sin(a) + 1) / 2; // 0 = derrière, 1 = devant
      d.hover += ((hovered === holder ? 1 : 0) - d.hover) * 0.12;
      const s = L.panelW * (0.62 + depth * 0.38) * (1 + d.hover * 0.12) * appear;
      holder.scale.setScalar(Math.max(s, 0.0001));
      holder.quaternion.copy(camera.quaternion);
      holder.rotateY(-Math.cos(a) * 0.35);
      d.mesh.material.opacity = 0.45 + depth * 0.55;
      d.glow.material.opacity = d.hover * 0.9 + depth * 0.15;
      holder.renderOrder = Math.round(depth * 100);
    });

    renderer.render(scene, camera);
    raf = running ? requestAnimationFrame(render) : 0;
  }

  function play() {
    if (running || reduce) return;
    running = true; last = performance.now();
    raf = requestAnimationFrame(render);
  }
  function pause() { running = false; cancelAnimationFrame(raf); }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible && !document.hidden ? play() : pause();
  }).observe(host);
  document.addEventListener('visibilitychange', () => {
    document.hidden ? pause() : visible && play();
  });

  if (reduce) render(start); else play();
  return { pause, play };
}
