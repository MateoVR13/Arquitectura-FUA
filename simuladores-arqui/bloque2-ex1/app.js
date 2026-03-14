/* ============================================
   BeamLab 3D — Core Application
   ============================================ */

// ==========================================
// 1. MATERIAL DATABASE
// ==========================================
const MATERIALS = {
  wood: {
    name: 'Madera',
    E: 12e9,           // Pa (12 GPa)
    yieldStress: 40e6, // Pa (40 MPa)
    density: 600,      // kg/m³
    tension: 'Media',
    compression: 'Media',
    color: 0xb5854b,
    emissive: 0x3d2a10,
  },
  steel: {
    name: 'Acero',
    E: 200e9,          // Pa (200 GPa)
    yieldStress: 250e6,// Pa (250 MPa)
    density: 7850,
    tension: 'Alta',
    compression: 'Alta',
    color: 0x8899aa,
    emissive: 0x222833,
  },
  concrete: {
    name: 'Concreto',
    E: 30e9,           // Pa (30 GPa)
    yieldStress: 30e6, // Pa (30 MPa — tension limit)
    density: 2400,
    tension: 'Baja',
    compression: 'Alta',
    color: 0x9a9a9a,
    emissive: 0x2a2a2a,
  },
};

// ==========================================
// 2. STATE
// ==========================================
const state = {
  span: 6,          // m
  sectionH: 0.40,   // m  (height / canto)
  sectionB: 0.25,   // m  (width)
  load: 20,         // kN/m
  material: 'steel',
  // Computed
  deflection: 0,    // m
  momentMax: 0,     // kN·m
  shearMax: 0,      // kN
  stressMax: 0,     // MPa
  efficiency: 0,    // %
  status: 'optimized', // failure | functional | optimized
};

// ==========================================
// 3. THREE.JS SCENE SETUP
// ==========================================
let scene, camera, renderer, controls;
let beamMesh, beamGeometry;
let supportLeft, supportRight;
let loadArrows = [];
let groundMesh;

const BEAM_SEGMENTS = 80; // Longitudinal segments for deformation

function initScene() {
  const canvas = document.getElementById('three-canvas');
  const container = document.getElementById('center-panel');

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111c05);
  scene.fog = new THREE.FogExp2(0x111c05, 0.04);

  // Camera
  camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(8, 5, 8);
  camera.lookAt(0, 1, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 1.2, 0);
  controls.minDistance = 3;
  controls.maxDistance = 25;
  controls.maxPolarAngle = Math.PI / 2.05;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x405878, 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffeedd, 1.2);
  dirLight.position.set(8, 12, 6);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(2048, 2048);
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 40;
  dirLight.shadow.camera.left = -12;
  dirLight.shadow.camera.right = 12;
  dirLight.shadow.camera.top = 12;
  dirLight.shadow.camera.bottom = -12;
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0x6385ff, 0.3);
  fillLight.position.set(-5, 6, -4);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(0x22d3ee, 0.4, 20);
  rimLight.position.set(0, 8, -6);
  scene.add(rimLight);

  // Ground
  const groundGeo = new THREE.PlaneGeometry(40, 40);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x141e06,
    roughness: 0.9,
    metalness: 0.1,
  });
  groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  // Grid helper
  const grid = new THREE.GridHelper(30, 30, 0x1e2a0b, 0x1e2a0b);
  grid.position.y = 0.005;
  scene.add(grid);

  // Build structural elements
  buildSupports();
  buildBeam();
  buildLoadArrows();

  // Resize
  window.addEventListener('resize', onResize);
}

// ==========================================
// 4. STRUCTURAL ELEMENTS
// ==========================================

function buildSupports() {
  // Clean old
  if (supportLeft) { scene.remove(supportLeft); supportLeft.geometry.dispose(); }
  if (supportRight) { scene.remove(supportRight); supportRight.geometry.dispose(); }

  const halfSpan = state.span / 2;
  const supportH = 1.0;
  const supportW = 0.35;

  // Create a trapezoidal support shape (wider at bottom)
  const supportGeo = new THREE.CylinderGeometry(supportW * 0.5, supportW * 0.8, supportH, 6);
  const supportMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.5,
    metalness: 0.6,
  });

  supportLeft = new THREE.Mesh(supportGeo, supportMat);
  supportLeft.position.set(-halfSpan, supportH / 2, 0);
  supportLeft.castShadow = true;
  supportLeft.receiveShadow = true;
  scene.add(supportLeft);

  supportRight = new THREE.Mesh(supportGeo.clone(), supportMat.clone());
  supportRight.position.set(halfSpan, supportH / 2, 0);
  supportRight.castShadow = true;
  supportRight.receiveShadow = true;
  scene.add(supportRight);

  // Support base markers (triangular indicators)
  const triangleShape = new THREE.ConeGeometry(0.18, 0.25, 3);
  const triMat = new THREE.MeshStandardMaterial({ color: 0xC8FF01, emissive: 0xC8FF01, emissiveIntensity: 0.3 });

  // Remove old triangles
  scene.children = scene.children.filter(c => !c.userData.isTriMarker);

  const triLeft = new THREE.Mesh(triangleShape, triMat);
  triLeft.position.set(-halfSpan, 0.13, 0);
  triLeft.userData.isTriMarker = true;
  scene.add(triLeft);

  const triRight = new THREE.Mesh(triangleShape.clone(), triMat.clone());
  triRight.position.set(halfSpan, 0.13, 0);
  triRight.userData.isTriMarker = true;
  scene.add(triRight);
}

function buildBeam() {
  if (beamMesh) { scene.remove(beamMesh); beamGeometry.dispose(); }

  // Box geometry with enough segments for vertex deformation
  beamGeometry = new THREE.BoxGeometry(state.span, state.sectionH, state.sectionB, BEAM_SEGMENTS, 4, 4);
  const mat = MATERIALS[state.material];
  const beamMat = new THREE.MeshStandardMaterial({
    color: mat.color,
    emissive: mat.emissive,
    emissiveIntensity: 0.15,
    roughness: 0.45,
    metalness: 0.55,
  });

  beamMesh = new THREE.Mesh(beamGeometry, beamMat);
  beamMesh.position.set(0, 1.0 + state.sectionH / 2, 0);
  beamMesh.castShadow = true;
  beamMesh.receiveShadow = true;
  scene.add(beamMesh);

  // Store original vertex Y positions
  const pos = beamGeometry.attributes.position;
  beamGeometry.userData.originalY = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    beamGeometry.userData.originalY[i] = pos.getY(i);
  }
}

function buildLoadArrows() {
  // Remove old arrows
  loadArrows.forEach(a => { scene.remove(a); });
  loadArrows = [];

  const halfSpan = state.span / 2;
  const arrowCount = Math.max(3, Math.floor(state.span / 0.7));
  const arrowColor = 0xf87171;

  for (let i = 0; i < arrowCount; i++) {
    const x = -halfSpan + (state.span / (arrowCount - 1)) * i;
    const dir = new THREE.Vector3(0, -1, 0);
    const origin = new THREE.Vector3(x, 1.0 + state.sectionH + 0.9, 0);
    const length = 0.5 + (state.load / 100) * 0.6;
    const arrow = new THREE.ArrowHelper(dir, origin, length, arrowColor, 0.12, 0.08);
    arrow.userData.isLoadArrow = true;
    scene.add(arrow);
    loadArrows.push(arrow);
  }
}

// ==========================================
// 5. STRUCTURAL ENGINE (Euler-Bernoulli)
// ==========================================
function computeStructural() {
  const mat = MATERIALS[state.material];
  const L = state.span;       // m
  const w = state.load * 1e3; // N/m (from kN/m)
  const b = state.sectionB;   // m
  const h = state.sectionH;   // m
  const E = mat.E;            // Pa

  // Second moment of area (rectangular)
  const I = (b * Math.pow(h, 3)) / 12; // m⁴

  // Max deflection (simply supported, uniform load)
  // δ = 5wL⁴ / (384EI)
  const delta = (5 * w * Math.pow(L, 4)) / (384 * E * I);

  // Max bending moment (center)
  // M = wL² / 8
  const Mmax = (w * Math.pow(L, 2)) / 8;

  // Max shear force (at supports)
  // V = wL / 2
  const Vmax = (w * L) / 2;

  // Max bending stress
  // σ = M·c / I where c = h/2
  const c = h / 2;
  const sigmaMax = (Mmax * c) / I;

  // Stress ratio
  const stressRatio = sigmaMax / mat.yieldStress;

  // Efficiency: inverse of stress ratio, capped
  let efficiency;
  if (stressRatio >= 1) {
    efficiency = Math.max(0, (1 - (stressRatio - 1)) * 50);
  } else if (stressRatio > 0.7) {
    efficiency = 100 - (stressRatio - 0.7) / 0.3 * 15;
  } else if (stressRatio > 0.3) {
    efficiency = 70 + (stressRatio - 0.3) / 0.4 * 30;
  } else {
    efficiency = stressRatio / 0.3 * 70; // Oversized = less efficient
  }
  efficiency = Math.max(0, Math.min(100, efficiency));

  // Status
  let status;
  if (stressRatio >= 1.0) {
    status = 'failure';
  } else if (efficiency >= 80) {
    status = 'optimized';
  } else {
    status = 'functional';
  }

  // Deflection limit check (L/250 for serviceability)
  const deflLimit = L / 250;
  if (delta > deflLimit && status !== 'failure') {
    status = 'functional'; // Serviceability issue
  }

  state.deflection = delta;
  state.momentMax = Mmax / 1e3; // kN·m
  state.shearMax = Vmax / 1e3;  // kN
  state.stressMax = sigmaMax / 1e6; // MPa
  state.efficiency = efficiency;
  state.status = status;
  state.stressRatio = stressRatio;
  state.I = I;
}

// ==========================================
// 6. VISUAL DEFORMATION
// ==========================================
function applyDeformation() {
  if (!beamGeometry || !beamGeometry.userData.originalY) return;

  const pos = beamGeometry.attributes.position;
  const origY = beamGeometry.userData.originalY;
  const L = state.span;

  // Scale deformation for visibility (exaggerated)
  const visualScale = Math.min(state.deflection * 30, 1.5); // Cap visual deformation

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    // Normalized position along beam (0 to 1)
    const t = (x / L) + 0.5;
    // Parabolic deflection curve: 4t(1-t) peaks at center
    const defl = 4 * t * (1 - t);
    pos.setY(i, origY[i] - defl * visualScale);
  }
  pos.needsUpdate = true;
  beamGeometry.computeVertexNormals();

  // Color feedback based on stress ratio
  const ratio = state.stressRatio || 0;
  let color;
  if (ratio < 0.5) {
    // Green to yellow
    const t = ratio / 0.5;
    color = new THREE.Color().setHSL(0.33 - t * 0.2, 0.8, 0.5);
  } else if (ratio < 1.0) {
    // Yellow to red
    const t = (ratio - 0.5) / 0.5;
    color = new THREE.Color().setHSL(0.13 - t * 0.13, 0.9, 0.5);
  } else {
    // Red pulsing
    const pulse = 0.4 + Math.sin(Date.now() * 0.008) * 0.1;
    color = new THREE.Color().setHSL(0, 0.9, pulse);
  }
  beamMesh.material.color.copy(color);
  beamMesh.material.emissive.copy(color).multiplyScalar(0.2);
}

// ==========================================
// 7. UI UPDATES
// ==========================================
function updateUI() {
  // Left panel values
  document.getElementById('span-val').textContent = state.span.toFixed(1) + ' m';
  document.getElementById('height-val').textContent = state.sectionH.toFixed(2) + ' m';
  document.getElementById('width-val').textContent = state.sectionB.toFixed(2) + ' m';
  document.getElementById('load-val').textContent = state.load + ' kN/m';
  document.getElementById('load-big').textContent = state.load;

  // Material properties
  const mat = MATERIALS[state.material];
  document.getElementById('prop-e').textContent = (mat.E / 1e9).toFixed(0) + ' GPa';
  document.getElementById('prop-yield').textContent = (mat.yieldStress / 1e6).toFixed(0) + ' MPa';
  document.getElementById('prop-tension').textContent = mat.tension;
  document.getElementById('prop-compression').textContent = mat.compression;

  // Bottom indicators
  document.getElementById('ind-deflection').textContent = (state.deflection * 1000).toFixed(2);
  document.getElementById('ind-moment').textContent = state.momentMax.toFixed(2);
  document.getElementById('ind-shear').textContent = state.shearMax.toFixed(2);
  document.getElementById('ind-stress').textContent = state.stressMax.toFixed(1);
  document.getElementById('ind-efficiency').textContent = Math.round(state.efficiency);

  // Status badge
  const badge = document.getElementById('status-badge');
  const icon = document.getElementById('status-icon');
  const text = document.getElementById('status-text');
  badge.className = 'status-badge ' + state.status;
  if (state.status === 'optimized') {
    icon.textContent = '✅';
    text.textContent = 'Optimizada';
  } else if (state.status === 'functional') {
    icon.textContent = '⚠️';
    text.textContent = 'Funcional';
  } else {
    icon.textContent = '❌';
    text.textContent = 'Fallo Estructural';
  }

  // Theory dynamic text
  updateTheoryText();
}

function updateTheoryText() {
  const el = document.getElementById('theory-text');
  const r = state.stressRatio || 0;
  const mat = MATERIALS[state.material];

  if (state.status === 'failure') {
    el.textContent = `¡Fallo estructural! El esfuerzo (${state.stressMax.toFixed(0)} MPa) supera el límite del ${mat.name.toLowerCase()} (${(mat.yieldStress/1e6).toFixed(0)} MPa). Reduce la carga, el vano, o aumenta la sección.`;
  } else if (r > 0.7) {
    el.textContent = `La viga está cerca del límite. Esfuerzo al ${(r*100).toFixed(0)}% de la capacidad. Considera aumentar el canto o usar un material más resistente.`;
  } else if (state.deflection > state.span / 250) {
    el.textContent = `Deflexión excesiva (${(state.deflection*1000).toFixed(1)} mm). Supera el límite de servicio L/250 = ${(state.span/250*1000).toFixed(1)} mm. Aumenta la inercia de la sección.`;
  } else if (r < 0.2) {
    el.textContent = `La sección está sobredimensionada. Podrías reducir el canto o el ancho para una solución más eficiente, o usar un material más económico.`;
  } else {
    el.textContent = `Buen diseño. La viga trabaja al ${(r*100).toFixed(0)}% de su capacidad con deflexión admisible. La geometría influye más que la cantidad de material.`;
  }
}

// ==========================================
// 8. 2D DIAGRAMS (Canvas)
// ==========================================
function drawMomentDiagram() {
  const canvas = document.getElementById('moment-canvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth * 2;
  const H = canvas.height = canvas.offsetHeight * 2;
  ctx.scale(2, 2);
  const w = W / 2;
  const h = H / 2;

  ctx.clearRect(0, 0, w, h);

  const pad = 20;
  const drawW = w - pad * 2;
  const drawH = h - pad * 2;

  // Axis
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, pad);
  ctx.lineTo(pad, h - pad);
  ctx.lineTo(w - pad, h - pad);
  ctx.stroke();

  // Zero line
  ctx.strokeStyle = '#475569';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(pad, h - pad);
  ctx.lineTo(w - pad, h - pad);
  ctx.stroke();
  ctx.setLineDash([]);

  // Parabolic moment diagram (positive = sagging for simply supported)
  const Mmax = state.momentMax;
  const maxH = drawH * 0.85;

  ctx.beginPath();
  ctx.moveTo(pad, h - pad);
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const x = pad + t * drawW;
    // M(x) = (wLx/2) - (wx²/2) = Mmax * 4t(1-t)
    const Mnorm = 4 * t * (1 - t);
    const y = (h - pad) - Mnorm * maxH;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w - pad, h - pad);
  ctx.closePath();

  // Gradient fill
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(99, 133, 255, 0.4)');
  grad.addColorStop(1, 'rgba(99, 133, 255, 0.05)');
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = '#C8FF01';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, h - pad);
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const x = pad + t * drawW;
    const Mnorm = 4 * t * (1 - t);
    const y = (h - pad) - Mnorm * maxH;
    ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Max value label
  ctx.fillStyle = '#f0f4ff';
  ctx.font = '600 10px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(`Mmáx = ${Mmax.toFixed(1)} kN·m`, w / 2, (h - pad) - maxH - 6);

  // Support labels
  ctx.fillStyle = '#64748b';
  ctx.font = '500 9px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('A', pad, h - 6);
  ctx.fillText('B', w - pad, h - 6);
}

function drawShearDiagram() {
  const canvas = document.getElementById('shear-canvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth * 2;
  const H = canvas.height = canvas.offsetHeight * 2;
  ctx.scale(2, 2);
  const w = W / 2;
  const h = H / 2;

  ctx.clearRect(0, 0, w, h);

  const pad = 20;
  const drawW = w - pad * 2;
  const drawH = h - pad * 2;
  const midY = pad + drawH / 2;

  // Axis
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, pad);
  ctx.lineTo(pad, h - pad);
  ctx.lineTo(w - pad, h - pad);
  ctx.stroke();

  // Zero line
  ctx.strokeStyle = '#475569';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(pad, midY);
  ctx.lineTo(w - pad, midY);
  ctx.stroke();
  ctx.setLineDash([]);

  const Vmax = state.shearMax;
  const maxAmplitude = drawH / 2 * 0.85;

  // Shear: V(x) = wL/2 - wx = Vmax * (1 - 2t)   linear
  // Positive fill (top)
  ctx.beginPath();
  ctx.moveTo(pad, midY);
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const x = pad + t * drawW;
    const Vnorm = 1 - 2 * t; // Goes from +1 to -1
    const y = midY - Vnorm * maxAmplitude;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w - pad, midY);
  ctx.closePath();

  const gradShear = ctx.createLinearGradient(0, pad, 0, h - pad);
  gradShear.addColorStop(0, 'rgba(34, 211, 238, 0.35)');
  gradShear.addColorStop(0.5, 'rgba(34, 211, 238, 0.05)');
  gradShear.addColorStop(1, 'rgba(248, 113, 113, 0.35)');
  ctx.fillStyle = gradShear;
  ctx.fill();

  // Line
  ctx.strokeStyle = '#00A4B5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, midY - maxAmplitude);
  ctx.lineTo(w - pad, midY + maxAmplitude);
  ctx.stroke();

  // Labels
  ctx.fillStyle = '#22d3ee';
  ctx.font = '600 9px Inter';
  ctx.textAlign = 'left';
  ctx.fillText(`+${Vmax.toFixed(1)} kN`, pad + 4, midY - maxAmplitude - 5);

  ctx.fillStyle = '#f87171';
  ctx.textAlign = 'right';
  ctx.fillText(`-${Vmax.toFixed(1)} kN`, w - pad - 4, midY + maxAmplitude + 12);

  // Support labels
  ctx.fillStyle = '#64748b';
  ctx.font = '500 9px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('A', pad, h - 6);
  ctx.fillText('B', w - pad, h - 6);
}

function drawCrossSection() {
  const canvas = document.getElementById('section-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 100;
  canvas.height = 100;

  ctx.clearRect(0, 0, 100, 100);

  // Draw rectangular cross-section to scale
  const maxDim = 0.6; // max section dimension for scaling
  const scale = 70 / maxDim;
  const rectW = state.sectionB * scale;
  const rectH = state.sectionH * scale;
  const cx = 50;
  const cy = 50;

  // Background
  ctx.fillStyle = '#141e06';
  ctx.fillRect(0, 0, 100, 100);

  // Section fill
  const mat = MATERIALS[state.material];
  const hex = '#' + mat.color.toString(16).padStart(6, '0');
  ctx.fillStyle = hex + '80';
  ctx.strokeStyle = '#C8FF01';
  ctx.lineWidth = 2;
  ctx.fillRect(cx - rectW / 2, cy - rectH / 2, rectW, rectH);
  ctx.strokeRect(cx - rectW / 2, cy - rectH / 2, rectW, rectH);

  // Dimension labels
  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 9px Inter';
  ctx.textAlign = 'center';

  // Width label
  ctx.fillText(`b=${state.sectionB.toFixed(2)}`, cx, cy + rectH / 2 + 14);

  // Height label
  ctx.save();
  ctx.translate(cx - rectW / 2 - 12, cy);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`h=${state.sectionH.toFixed(2)}`, 0, 0);
  ctx.restore();
}

// ==========================================
// 9. EVENT HANDLERS
// ==========================================
function setupControls() {
  // Span slider
  document.getElementById('span-slider').addEventListener('input', (e) => {
    state.span = parseFloat(e.target.value);
    rebuildScene('span');
  });

  // Section height slider
  document.getElementById('height-slider').addEventListener('input', (e) => {
    state.sectionH = parseFloat(e.target.value);
    rebuildScene('height');
  });

  // Section width slider
  document.getElementById('width-slider').addEventListener('input', (e) => {
    state.sectionB = parseFloat(e.target.value);
    rebuildScene('width');
  });

  // Load slider
  document.getElementById('load-slider').addEventListener('input', (e) => {
    state.load = parseInt(e.target.value);
    rebuildScene('load');
  });

  // Material buttons
  document.querySelectorAll('.material-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.material-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.material = btn.dataset.mat;
      rebuildScene('material');
    });
  });
}

function rebuildScene(trigger) {
  buildSupports();
  buildBeam();
  buildLoadArrows();
  computeStructural();
  applyDeformation();
  updateUI();
  drawMomentDiagram();
  drawShearDiagram();
  drawCrossSection();

  // Tutorial integration
  if (trigger) checkTutorialProgress(trigger);
}

// ==========================================
// 10. RESIZE HANDLER
// ==========================================
function onResize() {
  const container = document.getElementById('center-panel');
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
  drawMomentDiagram();
  drawShearDiagram();
}

// ==========================================
// 11. ANIMATION LOOP
// ==========================================
function animate() {
  requestAnimationFrame(animate);
  controls.update();

  // Continuous deformation update for pulse effect on failure
  if (state.status === 'failure') {
    applyDeformation();
  }

  renderer.render(scene, camera);
}

// ==========================================
// 12. INIT
// ==========================================
function init() {
  initScene();
  setupControls();
  computeStructural();
  applyDeformation();
  updateUI();
  drawMomentDiagram();
  drawShearDiagram();
  drawCrossSection();
  animate();

  // Initialize tutorial system
  initTutorial();
}

// Wait for DOM + Three.js
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// ==========================================
// 13. GUIDED TUTORIAL SYSTEM
// ==========================================

const TUTORIAL_STEPS = [
  {
    id: 0,
    name: 'Definir los Apoyos',
    targetControl: 'cg-span',
    tutorMsg: 'Primero, define dónde irán los apoyos. Los apoyos son los puntos donde la carga llegará al suelo. Usa el deslizador de "Distancia entre Apoyos" para colocarlos.',
    hintText: 'Mueve el deslizador de Distancia entre Apoyos (Vano)',
    detectEvent: 'span',
    conceptIcon: '🏛️',
    conceptTitle: 'Apoyo y Reacción',
    conceptHTML: `
      <h3>Los Puntos de Apoyo</h3>
      <p>Has establecido los puntos donde la carga llegará al suelo. En arquitectura, <strong>todo lo que sube debe bajar</strong> a través de estos puntos.</p>
      <div class="concept-highlight">
        💡 Los apoyos son los elementos que reciben las reacciones de la viga. Sin apoyos, no hay estructura: la carga necesita un camino para llegar al suelo.
      </div>
      <p>En una viga simplemente apoyada, las reacciones en los apoyos equilibran la carga total. Cada apoyo recibe la mitad de la carga cuando esta es simétrica.</p>
    `,
  },
  {
    id: 1,
    name: 'Seleccionar Material',
    targetControl: 'cg-material',
    tutorMsg: 'Ahora elige el material de la viga. Cada material tiene propiedades diferentes: el acero resiste tracciones, el concreto compresiones, y la madera es intermedia. ¡Experimenta!',
    hintText: 'Haz clic en uno de los materiales: Madera, Acero o Concreto',
    detectEvent: 'material',
    conceptIcon: '🧪',
    conceptTitle: 'Propiedades de la Materia',
    conceptHTML: `
      <h3>¿Por qué importa el material?</h3>
      <p>No todos los materiales sufren igual. El <strong>acero</strong> es elástico y resiste tirones (tracción), mientras que el <strong>concreto</strong> es pétreo y resiste ser aplastado (compresión).</p>
      <div class="concept-highlight">
        💡 El Módulo de Elasticidad (E) define qué tan rígido es un material. A mayor E, menor deformación bajo la misma carga.
      </div>
      <p>La <strong>madera</strong> tiene resistencia media en ambos sentidos, pero es mucho más ligera. En la práctica, se elige el material según el tipo de esfuerzo dominante y las condiciones del proyecto.</p>
    `,
  },
  {
    id: 2,
    name: 'Trazar la Viga',
    targetControl: 'cg-load',
    tutorMsg: 'La viga ya conecta ambos apoyos. Ahora aplica una carga distribuida usando el deslizador. Observa cómo la viga transfiere el peso horizontalmente hacia los apoyos verticales.',
    hintText: 'Ajusta la Carga Distribuida con el deslizador',
    detectEvent: 'load',
    conceptIcon: '📏',
    conceptTitle: 'La Línea como Conector',
    conceptHTML: `
      <h3>La Viga: el elemento que conecta</h3>
      <p>La viga es el elemento lineal que <strong>transfiere el peso horizontalmente</strong> hacia los apoyos verticales. Es el puente entre dos puntos de apoyo.</p>
      <div class="concept-highlight">
        💡 Cuando aplicas una carga sobre la viga, esta genera fuerzas internas: el momento flector (que intenta curvarla) y la fuerza cortante (que intenta deslizar sus secciones).
      </div>
      <p>Observa los diagramas en el panel derecho: el momento flector es máximo en el centro y la fuerza cortante es máxima en los apoyos.</p>
    `,
  },
  {
    id: 3,
    name: 'Aumentar Distancia',
    targetControl: 'cg-span',
    tutorMsg: 'Ahora aumenta la distancia entre apoyos (vano). Observa cómo la deflexión crece dramáticamente. A mayor vano, mayor es el esfuerzo que debe soportar la viga.',
    hintText: 'Aumenta la longitud del vano a más de 8 metros',
    detectEvent: 'span-increase',
    conceptIcon: '📐',
    conceptTitle: 'La Flexión',
    conceptHTML: `
      <h3>El efecto del vano sobre la flexión</h3>
      <p>Al separar los apoyos, la gravedad empuja el centro de la viga hacia abajo. Este esfuerzo se llama <strong>flexión</strong>: la parte de arriba se comprime y la de abajo se estira.</p>
      <div class="concept-highlight">
        💡 La deflexión crece con la <strong>cuarta potencia</strong> de la longitud: δ = 5wL⁴ / (384EI). Duplicar el vano multiplica la deflexión por 16.
      </div>
      <p>Por eso los ingenieros evitan vanos excesivos o, cuando son necesarios, usan vigas de gran canto o materiales muy rígidos como el acero pretensado.</p>
    `,
  },
  {
    id: 4,
    name: 'Ajustar el Canto',
    targetControl: 'cg-section',
    tutorMsg: 'Finalmente, ajusta el canto (altura h) de la viga. Verás que aumentar la altura incrementa la resistencia mucho más que aumentar el ancho. ¡La geometría es clave!',
    hintText: 'Usa el deslizador de Canto (h) para cambiar la altura de la sección',
    detectEvent: 'height',
    conceptIcon: '🔬',
    conceptTitle: 'Inercia y Canto',
    conceptHTML: `
      <h3>La geometría manda</h3>
      <p>Para que una viga no se doble, es más eficiente darle altura que anchura. La resistencia al doblado crece <strong>exponencialmente con la altura</strong>.</p>
      <div class="concept-highlight">
        💡 La Inercia (I) de una sección rectangular es I = b·h³/12. La altura (h) está elevada al cubo, por lo que duplicar el canto multiplica la inercia por 8.
      </div>
      <p>Este principio explica por qué las vigas de acero tienen forma de "I": concentran material arriba y abajo (donde están los máximos esfuerzos de compresión y tracción), eliminando material del centro donde no es necesario.</p>
    `,
  },
];

const tutorialState = {
  active: false,
  currentStep: -1,
  completed: [],
  initialSpan: 6, // To detect span increase
};

function initTutorial() {
  // Splash: start button
  document.getElementById('start-tutorial-btn').addEventListener('click', startTutorial);

  // Concept window buttons
  document.getElementById('concept-close').addEventListener('click', closeConceptWindow);
  document.getElementById('concept-next-btn').addEventListener('click', conceptNextStep);
}

function startTutorial() {
  // Hide splash
  document.getElementById('tutorial-splash').classList.add('hidden');

  // Show mission panel & tutor
  document.getElementById('mission-panel').classList.remove('hidden');
  document.getElementById('tutor-bubble').classList.remove('hidden');

  tutorialState.active = true;
  tutorialState.currentStep = -1;
  tutorialState.completed = [];
  tutorialState.initialSpan = state.span;

  // Go to step 0
  goToTutorialStep(0);
}

function goToTutorialStep(stepIndex) {
  if (stepIndex >= TUTORIAL_STEPS.length) {
    completeTutorial();
    return;
  }

  const step = TUTORIAL_STEPS[stepIndex];
  tutorialState.currentStep = stepIndex;

  // Update mission checklist UI
  updateMissionUI();

  // Highlight the target control
  clearHighlights();
  const target = document.getElementById(step.targetControl);
  if (target) target.classList.add('tut-active');

  // Update tutor message
  document.getElementById('tutor-msg').textContent = step.tutorMsg;

  // Update hint
  document.getElementById('hint-text').textContent = step.hintText;

  // Scroll left panel to show highlighted control
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function clearHighlights() {
  document.querySelectorAll('.control-group.tut-active').forEach(el => {
    el.classList.remove('tut-active');
  });
}

function updateMissionUI() {
  for (let i = 0; i < TUTORIAL_STEPS.length; i++) {
    const msEl = document.getElementById('ms-' + i);
    const check = msEl.querySelector('.ms-check');

    msEl.classList.remove('active', 'done');

    if (tutorialState.completed.includes(i)) {
      msEl.classList.add('done');
      check.textContent = '✓';
    } else if (i === tutorialState.currentStep) {
      msEl.classList.add('active');
      check.textContent = '▸';
    } else {
      check.textContent = '○';
    }
  }
}

// Called from rebuildScene to detect tutorial step completion
function checkTutorialProgress(trigger) {
  if (!tutorialState.active) return;
  const step = TUTORIAL_STEPS[tutorialState.currentStep];
  if (!step) return;

  let completed = false;

  switch (step.detectEvent) {
    case 'span':
      if (trigger === 'span') completed = true;
      break;
    case 'material':
      if (trigger === 'material') completed = true;
      break;
    case 'load':
      if (trigger === 'load') completed = true;
      break;
    case 'span-increase':
      if (trigger === 'span' && state.span > 8) completed = true;
      break;
    case 'height':
      if (trigger === 'height') completed = true;
      break;
  }

  if (completed) {
    completeTutorialStep(tutorialState.currentStep);
  }
}

function completeTutorialStep(stepIndex) {
  if (tutorialState.completed.includes(stepIndex)) return;

  tutorialState.completed.push(stepIndex);
  updateMissionUI();

  // Show concept window
  const step = TUTORIAL_STEPS[stepIndex];
  showConceptWindow(step);
}

function showConceptWindow(step) {
  document.getElementById('concept-icon').textContent = step.conceptIcon;
  document.getElementById('concept-title').textContent = step.conceptTitle;
  document.getElementById('concept-body').innerHTML = step.conceptHTML;

  // Button text
  const btn = document.getElementById('concept-next-btn');
  if (tutorialState.currentStep >= TUTORIAL_STEPS.length - 1) {
    btn.textContent = '🎉 ¡Misión Completada!';
  } else {
    btn.textContent = 'Siguiente Paso →';
  }

  document.getElementById('concept-window').classList.remove('hidden');
}

function closeConceptWindow() {
  document.getElementById('concept-window').classList.add('hidden');
}

function conceptNextStep() {
  closeConceptWindow();
  goToTutorialStep(tutorialState.currentStep + 1);
}

function completeTutorial() {
  tutorialState.active = false;
  clearHighlights();

  // Unlock all controls
  document.getElementById('app').classList.remove('tutorial-locked');

  // Update tutor
  document.getElementById('tutor-msg').textContent = '¡Excelente trabajo! Has completado todos los pasos. Ahora puedes experimentar libremente con todos los controles. ¡Diseña tu propia estructura!';

  // Update hint
  document.getElementById('hint-text').textContent = '¡Modo libre activado!';

  // Add completion badge to mission panel
  const missionSteps = document.querySelector('.mission-steps');
  const badge = document.createElement('div');
  badge.className = 'mission-complete';
  badge.textContent = '✅ MISIÓN COMPLETADA';
  missionSteps.parentElement.appendChild(badge);

  // Update all checklist items
  updateMissionUI();
}
