// =============================================
// La Revolución Gótica — 3D Engine
// Three.js procedural Romanesque → Gothic simulation
// =============================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ---- STATE ----
const state = {
  archType: 'roman',    // 'roman' | 'gothic'
  buttress: 0,          // 0-100
  windows: 0,           // 0-100
  height: 0,            // 0-100
  // targets for lerping
  target: {
    archType: 'roman',
    buttress: 0,
    windows: 0,
    height: 0
  }
};

// ---- SCENE SETUP ----
const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.6;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);
scene.fog = new THREE.FogExp2(0x1a1a2e, 0.006);

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
camera.position.set(22, 16, 28);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 8;
controls.maxDistance = 60;
controls.maxPolarAngle = Math.PI * 0.48;
controls.target.set(0, 5, 0);

// ---- LIGHTING ----
const ambientLight = new THREE.AmbientLight(0x6070a0, 1.8);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffe8c0, 2.5);
dirLight.position.set(15, 25, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.left = -30;
dirLight.shadow.camera.right = 30;
dirLight.shadow.camera.top = 30;
dirLight.shadow.camera.bottom = -30;
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0x8090c0, 0.8);
fillLight.position.set(-10, 15, -10);
scene.add(fillLight);

// Back-fill for constant visibility
const backLight = new THREE.DirectionalLight(0xa0a0c0, 0.5);
backLight.position.set(-15, 10, 20);
scene.add(backLight);

// Interior light (increases with windows)
const interiorLight = new THREE.PointLight(0xffd070, 0, 20);
interiorLight.position.set(0, 6, 0);
scene.add(interiorLight);

// ---- DYNAMIC LIGHTING SYSTEM ----
// Sun hemisphere for ambient color shift
const hemiLight = new THREE.HemisphereLight(0xffe0a0, 0x303050, 0.0);
scene.add(hemiLight);

// Per-window SpotLights — cast colored light from each window into interior
const windowSpots = [];
const lightRaysGroup = new THREE.Group();
scene.add(lightRaysGroup);

// Stained glass colored lights (legacy point lights, now enhanced)
const stainedLights = [];
const stainedColors = [0xc94c4c, 0x4c7ec9, 0xc9a84c, 0x4cc97e, 0x9944aa];
for (let i = 0; i < 5; i++) {
  const sl = new THREE.PointLight(stainedColors[i], 0, 12);
  sl.position.set(0, 5, 0);
  scene.add(sl);
  stainedLights.push(sl);
}

// Sun angle state (animated)
let sunAngle = 0; // radians, cycles 0 to 2PI

// ---- GROUND ----
const groundGeo = new THREE.PlaneGeometry(80, 80);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x1a1a24,
  roughness: 0.95,
  metalness: 0.05
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Subtle grid
const gridHelper = new THREE.GridHelper(80, 80, 0x222233, 0x181825);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

// ---- MATERIALS ----
const mat = {
  stone: new THREE.MeshStandardMaterial({
    color: 0x8a8070,
    roughness: 0.85,
    metalness: 0.05
  }),
  stoneLight: new THREE.MeshStandardMaterial({
    color: 0xa09888,
    roughness: 0.8,
    metalness: 0.05
  }),
  stoneDark: new THREE.MeshStandardMaterial({
    color: 0x605850,
    roughness: 0.9,
    metalness: 0.05
  }),
  roof: new THREE.MeshStandardMaterial({
    color: 0x4a4038,
    roughness: 0.7,
    metalness: 0.1
  }),
  window: new THREE.MeshStandardMaterial({
    color: 0x202025,
    roughness: 0.3,
    metalness: 0.1,
    transparent: true,
    opacity: 0.6
  }),
  stainedGlass: new THREE.MeshStandardMaterial({
    color: 0x4c7ec9,
    roughness: 0.2,
    metalness: 0.3,
    transparent: true,
    opacity: 0.7,
    emissive: 0x2244aa,
    emissiveIntensity: 0.3,
    side: THREE.DoubleSide
  }),
  buttressMat: new THREE.MeshStandardMaterial({
    color: 0x7a7268,
    roughness: 0.85,
    metalness: 0.05
  }),
  column: new THREE.MeshStandardMaterial({
    color: 0x9a9080,
    roughness: 0.7,
    metalness: 0.1
  }),
  floor: new THREE.MeshStandardMaterial({
    color: 0x3a352e,
    roughness: 0.95,
    metalness: 0.0
  })
};

// ---- CHURCH GROUPS ----
const churchGroup = new THREE.Group();
scene.add(churchGroup);

// Sub-groups
const wallsGroup = new THREE.Group();
const archesGroup = new THREE.Group();
const columnsGroup = new THREE.Group();
const roofGroup = new THREE.Group();
const windowsGroup = new THREE.Group();
const buttressGroup = new THREE.Group();
const flyingButtressGroup = new THREE.Group();
const ribsGroup = new THREE.Group();
const lightFxGroup = new THREE.Group(); // volumetric light cones

churchGroup.add(wallsGroup, archesGroup, columnsGroup, roofGroup, windowsGroup, buttressGroup, flyingButtressGroup, ribsGroup, lightFxGroup);

// ---- DIMENSIONS ----
const DIM = {
  naveLength: 20,
  naveWidth: 8,
  wallHeight: 7,
  wallThickness: 1.2,
  baseWallThickness: 1.2,
  aisleWidth: 4,
  bays: 5,
  columnRadius: 0.35,
  archRadius: 3.5,
  heightMultiplier: 1.0,
  maxHeightMultiplier: 1.8,
  buttressDepth: 1.0,
  buttressWidth: 0.8,
  maxButtressOffset: 4.5,
};

// ---- BUILD FUNCTIONS ----

function buildFloor() {
  const geo = new THREE.BoxGeometry(DIM.naveWidth + DIM.aisleWidth * 2 + 4, 0.3, DIM.naveLength + 2);
  const mesh = new THREE.Mesh(geo, mat.floor);
  mesh.position.y = 0.15;
  mesh.receiveShadow = true;
  wallsGroup.add(mesh);
}

function buildWalls() {
  // Clear
  while (wallsGroup.children.length > 0) wallsGroup.remove(wallsGroup.children[0]);
  buildFloor();

  const h = DIM.wallHeight * DIM.heightMultiplier;
  const t = DIM.wallThickness;
  const halfLen = DIM.naveLength / 2;
  const halfW = DIM.naveWidth / 2;

  // North wall (back)
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(DIM.naveWidth + t * 2, h, t),
    mat.stone
  );
  backWall.position.set(0, h / 2 + 0.3, -halfLen);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  wallsGroup.add(backWall);

  // Front wall (with door opening cutout effect via two pieces)
  const doorW = 2.5, doorH = Math.min(4, h * 0.6);
  // left piece
  const frontL = new THREE.Mesh(
    new THREE.BoxGeometry((DIM.naveWidth + t * 2 - doorW) / 2, h, t),
    mat.stone
  );
  frontL.position.set(-(doorW / 2 + (DIM.naveWidth + t * 2 - doorW) / 4), h / 2 + 0.3, halfLen);
  frontL.castShadow = true;
  wallsGroup.add(frontL);

  const frontR = frontL.clone();
  frontR.position.x = -frontL.position.x;
  wallsGroup.add(frontR);

  // top piece above door
  const topPiece = new THREE.Mesh(
    new THREE.BoxGeometry(doorW, h - doorH, t),
    mat.stone
  );
  topPiece.position.set(0, doorH + (h - doorH) / 2 + 0.3, halfLen);
  wallsGroup.add(topPiece);

  // Side walls (nave) — left and right
  for (const side of [-1, 1]) {
    const sideWall = new THREE.Mesh(
      new THREE.BoxGeometry(t, h, DIM.naveLength),
      mat.stone
    );
    sideWall.position.set(side * (halfW + t / 2), h / 2 + 0.3, 0);
    sideWall.castShadow = true;
    sideWall.receiveShadow = true;
    wallsGroup.add(sideWall);

    // Aisle outer walls
    const aisleWall = new THREE.Mesh(
      new THREE.BoxGeometry(t * 0.7, h * 0.65, DIM.naveLength),
      mat.stone
    );
    aisleWall.position.set(side * (halfW + DIM.aisleWidth + t), h * 0.65 / 2 + 0.3, 0);
    aisleWall.castShadow = true;
    wallsGroup.add(aisleWall);

    // Aisle roof (lean-to)
    const aisleRoof = new THREE.Mesh(
      new THREE.BoxGeometry(DIM.aisleWidth + t, 0.25, DIM.naveLength + 0.5),
      mat.roof
    );
    aisleRoof.position.set(side * (halfW + DIM.aisleWidth / 2 + t / 2), h * 0.65 + 0.3, 0);
    aisleRoof.rotation.z = side * 0.15;
    aisleRoof.castShadow = true;
    wallsGroup.add(aisleRoof);
  }
}

function buildColumns() {
  while (columnsGroup.children.length > 0) columnsGroup.remove(columnsGroup.children[0]);

  const h = DIM.wallHeight * DIM.heightMultiplier;
  const halfW = DIM.naveWidth / 2;
  const baySpacing = DIM.naveLength / DIM.bays;

  for (let i = 0; i <= DIM.bays; i++) {
    const z = -DIM.naveLength / 2 + i * baySpacing;
    for (const side of [-1, 1]) {
      // Main column
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(DIM.columnRadius, DIM.columnRadius * 1.1, h, 12),
        mat.column
      );
      col.position.set(side * halfW, h / 2 + 0.3, z);
      col.castShadow = true;
      columnsGroup.add(col);

      // Capital
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(DIM.columnRadius * 1.6, DIM.columnRadius * 1.1, 0.3, 12),
        mat.stoneLight
      );
      cap.position.set(side * halfW, h + 0.3, z);
      columnsGroup.add(cap);

      // Base
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(DIM.columnRadius * 1.3, DIM.columnRadius * 1.4, 0.25, 12),
        mat.stoneLight
      );
      base.position.set(side * halfW, 0.42, z);
      columnsGroup.add(base);

      // Vertical ribs (for gothic continuity)
      const ribH = h * 0.3;
      const rib = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, ribH, 6),
        mat.stoneLight
      );
      rib.position.set(side * halfW, h + ribH / 2 + 0.3, z);
      rib.visible = false;
      rib.userData.isRib = true;
      columnsGroup.add(rib);
    }
  }
}

function createArchCurve(type, radius, segments = 32) {
  const points = [];
  if (type === 'roman') {
    // True semicircle — points along a half-circle from -radius to +radius
    for (let i = 0; i <= segments; i++) {
      const theta = Math.PI * (i / segments); // 0 to PI
      const x = -Math.cos(theta) * radius;    // -R to +R
      const y = Math.sin(theta) * radius;      // 0 up to R down to 0
      points.push(new THREE.Vector3(x, y, 0));
    }
  } else {
    // True ogival (pointed) arch — two circular arcs from offset centers meeting at apex
    // Each arc has its center at the opposite springing point
    const halfSegs = Math.floor(segments / 2);
    const arcRadius = radius * 1.2; // arc radius > half-span for pointed shape
    // Left arc: center at +radius, sweeps from left springing to apex
    const startAngleL = Math.PI - Math.acos(radius / arcRadius);
    const apexAngleL = Math.PI / 2;
    for (let i = 0; i <= halfSegs; i++) {
      const t = i / halfSegs;
      const theta = startAngleL + (apexAngleL - startAngleL) * t;
      const x = radius + Math.cos(theta) * arcRadius;  // center offset at +radius
      const y = Math.sin(theta) * arcRadius;
      points.push(new THREE.Vector3(x, y, 0));
    }
    // Right arc: center at -radius, sweeps from apex down to right springing
    const endAngleR = Math.acos(radius / arcRadius);
    const apexAngleR = Math.PI / 2;
    for (let i = 1; i <= halfSegs; i++) {
      const t = i / halfSegs;
      const theta = apexAngleR + (endAngleR - apexAngleR) * t;
      const x = -radius + Math.cos(theta) * arcRadius; // center offset at -radius
      const y = Math.sin(theta) * arcRadius;
      points.push(new THREE.Vector3(x, y, 0));
    }
  }
  return points;
}

function buildArches() {
  while (archesGroup.children.length > 0) archesGroup.remove(archesGroup.children[0]);

  const h = DIM.wallHeight * DIM.heightMultiplier;
  const halfW = DIM.naveWidth / 2;
  const baySpacing = DIM.naveLength / DIM.bays;
  const archR = halfW * 0.95;

  for (let i = 0; i <= DIM.bays; i++) {
    const z = -DIM.naveLength / 2 + i * baySpacing;

    // Transverse arch across nave
    const curvePoints = createArchCurve(state.archType, archR);
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.18, 8, false);
    const arch = new THREE.Mesh(tubeGeo, mat.stoneLight);
    arch.position.set(0, h + 0.3, z);
    arch.castShadow = true;
    archesGroup.add(arch);
  }
}

function buildRoof() {
  while (roofGroup.children.length > 0) roofGroup.remove(roofGroup.children[0]);

  const h = DIM.wallHeight * DIM.heightMultiplier;
  const halfW = DIM.naveWidth / 2 + DIM.wallThickness;
  const roofHeight = state.archType === 'gothic' ? halfW * 1.35 : halfW;
  const curveSegments = 24;

  // Build a curved vault cross-section Shape
  const shape = new THREE.Shape();
  shape.moveTo(-halfW - 0.3, 0);

  if (state.archType === 'gothic') {
    // Pointed vault — two smooth arcs meeting at apex (use quadratic curves)
    // Left side: curve from bottom-left up to center-top
    shape.quadraticCurveTo(-halfW * 0.15, roofHeight * 0.95, 0, roofHeight);
    // Right side: curve from center-top down to bottom-right
    shape.quadraticCurveTo(halfW * 0.15, roofHeight * 0.95, halfW + 0.3, 0);
  } else {
    // Barrel vault — smooth semicircular arc
    // Approximate semicircle with two cubic bezier curves
    const cp = halfW * 0.552; // magic number for circular approx with cubic bezier
    shape.bezierCurveTo(-halfW - 0.3, roofHeight * 0.75, -cp, roofHeight + 0.3, 0, roofHeight + 0.3);
    shape.bezierCurveTo(cp, roofHeight + 0.3, halfW + 0.3, roofHeight * 0.75, halfW + 0.3, 0);
  }

  shape.lineTo(-halfW - 0.3, 0); // close

  const extrudeSettings = {
    depth: DIM.naveLength + 1,
    bevelEnabled: false,
    curveSegments: curveSegments
  };
  const roofGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const roofMesh = new THREE.Mesh(roofGeo, mat.roof);
  roofMesh.position.set(0, h + 0.3, -DIM.naveLength / 2 - 0.5);
  roofMesh.castShadow = true;
  roofGroup.add(roofMesh);
}

function buildWindows() {
  while (windowsGroup.children.length > 0) windowsGroup.remove(windowsGroup.children[0]);
  while (lightFxGroup.children.length > 0) lightFxGroup.remove(lightFxGroup.children[0]);

  // Clear old window spots
  windowSpots.forEach(s => { scene.remove(s.spot); if(s.target) scene.remove(s.target); });
  windowSpots.length = 0;

  const h = DIM.wallHeight * DIM.heightMultiplier;
  const halfW = DIM.naveWidth / 2;
  const t = DIM.wallThickness;
  const baySpacing = DIM.naveLength / DIM.bays;
  const winProgress = state.windows / 100;

  // Window size grows with slider
  const baseWinW = 0.6;
  const baseWinH = 1.2;
  const winW = baseWinW + winProgress * 1.2;
  const winH = baseWinH + winProgress * (h * 0.4);

  for (let i = 0; i < DIM.bays; i++) {
    const z = -DIM.naveLength / 2 + (i + 0.5) * baySpacing;
    for (const side of [-1, 1]) {
      // Window on nave wall — FLUSH on outer face of nave side wall
      // Nave wall center is at X = side*(halfW + t/2), thickness = t
      // Place window at outer face: side*(halfW + t) with normal facing outward
      const wallOuterX = side * (halfW + t);

      const winMat = winProgress > 0.1 ? mat.stainedGlass.clone() : mat.window.clone();
      const hue = (i * 0.15 + (side > 0 ? 0 : 0.5)) % 1;

      if (winProgress > 0.1) {
        winMat.color.setHSL(hue, 0.7, 0.45);
        winMat.emissive.setHSL(hue, 0.8, 0.2);
        winMat.emissiveIntensity = 0.2 + winProgress * 0.8;
        winMat.opacity = 0.5 + winProgress * 0.4;
      }

      // PlaneGeometry(width, height) creates a plane in XY.
      // We want the plane to lie flat against the wall (wall runs along Z).
      // So the plane's "width" should go along Z, "height" along Y.
      // Rotate PI/2 around Y so the plane normal faces along X (outward).
      const winGeo = new THREE.PlaneGeometry(winW, winH);
      const win = new THREE.Mesh(winGeo, winMat);
      const winCenterY = h * 0.55 + winH / 2 + 0.3;
      win.position.set(wallOuterX, winCenterY, z);
      // Normal must face outward (away from interior)
      win.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
      windowsGroup.add(win);

      // Inner face of the same window (visible from inside)
      // Use polygonOffset to prevent Z-fighting
      const winInnerMat = winMat.clone();
      winInnerMat.polygonOffset = true;
      winInnerMat.polygonOffsetFactor = -1;
      winInnerMat.polygonOffsetUnits = -1;
      const winInner = new THREE.Mesh(winGeo, winInnerMat);
      winInner.position.set(
        side * (halfW - 0.1),  // well inside the inner wall face
        winCenterY,
        z
      );
      winInner.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
      windowsGroup.add(winInner);

      // Pointed arch frame above window
      if (winProgress > 0.2) {
        const frameH = winW * 0.5;
        const archPts = state.archType === 'gothic'
          ? createArchCurve('gothic', winW * 0.5, 12)
          : createArchCurve('roman', winW * 0.5, 12);
        const archCurve = new THREE.CatmullRomCurve3(archPts);
        const archGeo = new THREE.TubeGeometry(archCurve, 12, 0.06, 6, false);
        const archMesh = new THREE.Mesh(archGeo, mat.stoneLight);
        archMesh.position.set(wallOuterX, winCenterY + winH / 2, z);
        archMesh.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
        windowsGroup.add(archMesh);
      }

      // Gothic tracery (mullion + rosette) when medium+
      if (winProgress > 0.35) {
        // Central mullion (vertical bar)
        const mullGeo = new THREE.BoxGeometry(0.06, winH, 0.06);
        const mull = new THREE.Mesh(mullGeo, mat.stoneLight);
        mull.position.set(wallOuterX, winCenterY, z);
        windowsGroup.add(mull);

        // Small rosette at top
        const rosR = winW * 0.25;
        const rosGeo = new THREE.RingGeometry(rosR * 0.6, rosR, state.archType === 'gothic' ? 6 : 12, 1);
        const rosFrame = new THREE.Mesh(rosGeo, mat.stoneLight);
        rosFrame.position.set(wallOuterX + side * 0.01, winCenterY + winH * 0.35, z);
        rosFrame.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
        windowsGroup.add(rosFrame);
      }

      // ---- VOLUMETRIC LIGHT RAY from each window ----
      if (winProgress > 0.15) {
        const rayLen = halfW * 1.6;
        const rayGeo = new THREE.ConeGeometry(winW * 0.7, rayLen, 8, 1, true);
        const rayColor = new THREE.Color();
        rayColor.setHSL(hue, 0.6, 0.5);
        const rayMat = new THREE.MeshBasicMaterial({
          color: rayColor,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide
        });
        const ray = new THREE.Mesh(rayGeo, rayMat);
        // Position at window, angled inward and downward
        ray.position.set(
          side * (halfW - rayLen / 2 * 0.3),
          winCenterY - rayLen * 0.2,
          z
        );
        // Rotate so cone points inward from the window
        ray.rotation.z = side > 0 ? Math.PI / 2 + 0.4 : -Math.PI / 2 - 0.4;
        ray.userData.isLightRay = true;
        ray.userData.side = side;
        ray.userData.baseOpacity = winProgress * 0.12;
        ray.userData.hue = hue;
        lightFxGroup.add(ray);
      }

      // ---- SpotLight from each window casting colored light inside ----
      if (winProgress > 0.25) {
        const spotColor = new THREE.Color();
        spotColor.setHSL(hue, 0.7, 0.6);
        const spot = new THREE.SpotLight(spotColor, 0, halfW * 2, Math.PI / 5, 0.6, 1.5);
        spot.position.set(wallOuterX, winCenterY, z);
        // Target aims inward and down toward floor
        const tgt = new THREE.Object3D();
        tgt.position.set(side * -1, 0.5, z);
        scene.add(tgt);
        spot.target = tgt;
        scene.add(spot);
        windowSpots.push({ spot, target: tgt, side, hue, baseIntensity: winProgress * 2.0 });
      }
    }
  }

  // ---- ROSE WINDOW on front wall ----
  if (winProgress > 0.5) {
    const roseR = 1.0 + winProgress * 1.2;
    const roseGeo = new THREE.CircleGeometry(roseR, 24);
    const roseMat = mat.stainedGlass.clone();
    roseMat.color.setHSL(0.08, 0.8, 0.5);
    roseMat.emissive.setHSL(0.08, 0.9, 0.25);
    roseMat.emissiveIntensity = 0.3 + winProgress * 0.7;
    roseMat.side = THREE.DoubleSide;
    const rose = new THREE.Mesh(roseGeo, roseMat);
    const roseY = h * 0.7 + 0.3;
    rose.position.set(0, roseY, DIM.naveLength / 2 + 0.02);
    windowsGroup.add(rose);

    // Tracery spokes — lie in XY plane (front face is Z-plane)
    for (let s = 0; s < 8; s++) {
      const angle = (s / 8) * Math.PI;
      const spokeLen = roseR * 1.9;
      const spokeGeo = new THREE.CylinderGeometry(0.04, 0.04, spokeLen, 4);
      const spoke = new THREE.Mesh(spokeGeo, mat.stoneLight);
      spoke.position.set(0, roseY, DIM.naveLength / 2 + 0.04);
      // Rotate in XY plane: axis is Z
      spoke.rotation.z = angle;
      // Lay cylinder perpendicular to Z (it defaults along Y, rotation.z spins within XY, perfect)
      windowsGroup.add(spoke);
    }

    // Inner concentric ring
    const innerRing = new THREE.Mesh(
      new THREE.RingGeometry(roseR * 0.45, roseR * 0.55, 16, 1),
      mat.stoneLight
    );
    innerRing.position.set(0, roseY, DIM.naveLength / 2 + 0.05);
    windowsGroup.add(innerRing);

    // Rose window light ray (volumetric cone into interior)
    if (winProgress > 0.6) {
      const rRayLen = DIM.naveLength * 0.4;
      const rRayGeo = new THREE.ConeGeometry(roseR * 1.3, rRayLen, 12, 1, true);
      const rRayMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.08, 0.5, 0.5),
        transparent: true,
        opacity: winProgress * 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const rRay = new THREE.Mesh(rRayGeo, rRayMat);
      rRay.position.set(0, roseY - 1, DIM.naveLength / 2 - rRayLen / 2);
      rRay.rotation.x = -Math.PI / 2 + 0.15;
      rRay.userData.isLightRay = true;
      rRay.userData.baseOpacity = winProgress * 0.08;
      lightFxGroup.add(rRay);
    }
  }
}

function buildButtresses() {
  while (buttressGroup.children.length > 0) buttressGroup.remove(buttressGroup.children[0]);
  while (flyingButtressGroup.children.length > 0) flyingButtressGroup.remove(flyingButtressGroup.children[0]);

  const h = DIM.wallHeight * DIM.heightMultiplier;
  const halfW = DIM.naveWidth / 2 + DIM.wallThickness;
  const baySpacing = DIM.naveLength / DIM.bays;
  const progress = state.buttress / 100;

  // Buttress offset from wall
  const offset = DIM.aisleWidth + DIM.wallThickness + progress * DIM.maxButtressOffset;

  for (let i = 0; i <= DIM.bays; i++) {
    const z = -DIM.naveLength / 2 + i * baySpacing;
    for (const side of [-1, 1]) {
      // External buttress pier
      const bH = h * (0.5 + progress * 0.3);
      const buttress = new THREE.Mesh(
        new THREE.BoxGeometry(DIM.buttressWidth, bH, DIM.buttressDepth),
        mat.buttressMat
      );
      buttress.position.set(side * (halfW + offset), bH / 2 + 0.3, z);
      buttress.castShadow = true;
      buttressGroup.add(buttress);

      // Buttress cap (pinnacle when gothic)
      if (progress > 0.3) {
        const pinH = 1.0 + progress * 2.0;
        const pinGeo = new THREE.ConeGeometry(DIM.buttressWidth * 0.5, pinH, 4);
        const pin = new THREE.Mesh(pinGeo, mat.stoneDark);
        pin.position.set(side * (halfW + offset), bH + pinH / 2 + 0.3, z);
        pin.castShadow = true;
        buttressGroup.add(pin);
      }

      // Flying buttress arc
      if (progress > 0.15) {
        const arcStart = new THREE.Vector3(
          side * (halfW + 0.5),
          h * 0.75 + 0.3,
          z
        );
        const arcEnd = new THREE.Vector3(
          side * (halfW + offset),
          bH * 0.7 + 0.3,
          z
        );
        const arcMid = new THREE.Vector3(
          (arcStart.x + arcEnd.x) / 2,
          Math.max(arcStart.y, arcEnd.y) + 1.5,
          z
        );

        const fbCurve = new THREE.QuadraticBezierCurve3(arcStart, arcMid, arcEnd);
        const fbGeo = new THREE.TubeGeometry(fbCurve, 16, 0.2 + progress * 0.15, 6, false);
        const fb = new THREE.Mesh(fbGeo, mat.buttressMat);
        fb.castShadow = true;
        flyingButtressGroup.add(fb);

        // Second tier flying buttress (when high progress)
        if (progress > 0.6) {
          const arc2Start = new THREE.Vector3(
            side * (halfW + 0.5),
            h * 0.5 + 0.3,
            z
          );
          const arc2End = new THREE.Vector3(
            side * (halfW + offset),
            bH * 0.4 + 0.3,
            z
          );
          const arc2Mid = new THREE.Vector3(
            (arc2Start.x + arc2End.x) / 2,
            Math.max(arc2Start.y, arc2End.y) + 1.0,
            z
          );
          const fb2Curve = new THREE.QuadraticBezierCurve3(arc2Start, arc2Mid, arc2End);
          const fb2Geo = new THREE.TubeGeometry(fb2Curve, 16, 0.15, 6, false);
          const fb2 = new THREE.Mesh(fb2Geo, mat.buttressMat);
          fb2.castShadow = true;
          flyingButtressGroup.add(fb2);
        }
      }
    }
  }
}

function buildRibs() {
  while (ribsGroup.children.length > 0) ribsGroup.remove(ribsGroup.children[0]);

  if (state.archType !== 'gothic') return;

  const h = DIM.wallHeight * DIM.heightMultiplier;
  const halfW = DIM.naveWidth / 2;
  const baySpacing = DIM.naveLength / DIM.bays;

  for (let i = 0; i < DIM.bays; i++) {
    const z1 = -DIM.naveLength / 2 + i * baySpacing;
    const z2 = z1 + baySpacing;
    const zMid = (z1 + z2) / 2;

    // Diagonal ribs (criss-cross)
    for (const [sx, sz, ex, ez] of [
      [-halfW, z1, halfW, z2],
      [halfW, z1, -halfW, z2]
    ]) {
      const ribStart = new THREE.Vector3(sx, h + 0.3, sz);
      const ribEnd = new THREE.Vector3(ex, h + 0.3, ez);
      const ribMid = new THREE.Vector3(0, h + halfW * 1.2 + 0.3, zMid);

      const ribCurve = new THREE.QuadraticBezierCurve3(ribStart, ribMid, ribEnd);
      const ribGeo = new THREE.TubeGeometry(ribCurve, 12, 0.1, 6, false);
      const rib = new THREE.Mesh(ribGeo, mat.stoneLight);
      ribsGroup.add(rib);
    }

    // Transverse rib at center
    const tStart = new THREE.Vector3(-halfW, h + 0.3, zMid);
    const tEnd = new THREE.Vector3(halfW, h + 0.3, zMid);
    const tMid = new THREE.Vector3(0, h + halfW * 1.1 + 0.3, zMid);
    const tCurve = new THREE.QuadraticBezierCurve3(tStart, tMid, tEnd);
    const tGeo = new THREE.TubeGeometry(tCurve, 12, 0.08, 6, false);
    const tRib = new THREE.Mesh(tGeo, mat.stoneLight);
    ribsGroup.add(tRib);

    // Longitudinal ridge rib
    if (i < DIM.bays - 1) {
      const lGeo = new THREE.CylinderGeometry(0.06, 0.06, baySpacing, 4);
      const lRib = new THREE.Mesh(lGeo, mat.stoneLight);
      lRib.position.set(0, h + halfW * 1.15 + 0.3, zMid);
      lRib.rotation.x = Math.PI / 2;
      ribsGroup.add(lRib);
    }
  }
}

// ---- PARTICLE DUST ----
let dustParticles = null;

function createDustParticles() {
  const count = 200;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const halfW = DIM.naveWidth / 2;
  const h = DIM.wallHeight * DIM.heightMultiplier;

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * DIM.naveWidth;
    positions[i * 3 + 1] = Math.random() * h + 1;
    positions[i * 3 + 2] = (Math.random() - 0.5) * DIM.naveLength;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const dustMat = new THREE.PointsMaterial({
    color: 0xffd070,
    size: 0.08,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  dustParticles = new THREE.Points(geo, dustMat);
  scene.add(dustParticles);
}

// ---- FULL BUILD ----
function rebuildChurch() {
  buildWalls();
  buildColumns();
  buildArches();
  buildRoof();
  buildWindows();  // also rebuilds light rays and spots
  buildButtresses();
  buildRibs();
}

// ---- EVALUATION ----
function calculateScores() {
  const archScore = state.archType === 'gothic' ? 25 : 0;
  const vertScore = Math.round(state.height / 100 * 25);
  const lumScore = Math.round(state.windows / 100 * 25);
  const structScore = Math.round(
    (state.buttress / 100 * 15) +
    (state.archType === 'gothic' ? 10 : 0)
  );
  const contScore = Math.round(
    (state.archType === 'gothic' ? 10 : 0) +
    (state.height / 100 * 15)
  );

  const total = Math.min(100, archScore + vertScore + lumScore + Math.round((structScore + contScore) / 2));

  return {
    vert: vertScore,
    lum: lumScore,
    struct: structScore,
    cont: contScore,
    total
  };
}

function updateUI() {
  const scores = calculateScores();

  // Gauges
  document.getElementById('fill-vert').style.width = `${scores.vert / 25 * 100}%`;
  document.getElementById('fill-lum').style.width = `${scores.lum / 25 * 100}%`;
  document.getElementById('fill-struct').style.width = `${scores.struct / 25 * 100}%`;
  document.getElementById('fill-cont').style.width = `${scores.cont / 25 * 100}%`;

  document.getElementById('val-vert').textContent = scores.vert;
  document.getElementById('val-lum').textContent = scores.lum;
  document.getElementById('val-struct').textContent = scores.struct;
  document.getElementById('val-cont').textContent = scores.cont;

  document.getElementById('eval-total').textContent = `${scores.total}%`;

  // Building state badge
  const badge = document.getElementById('building-state');
  if (scores.total <= 30) {
    badge.textContent = 'Iglesia Románica';
    badge.className = 'state-badge';
  } else if (scores.total <= 65) {
    badge.textContent = 'Transición';
    badge.className = 'state-badge transition';
  } else {
    badge.textContent = 'Catedral Gótica';
    badge.className = 'state-badge gothic';
  }

  // Slider values
  document.getElementById('buttress-val').textContent = `${state.target.buttress}%`;
  document.getElementById('windows-val').textContent = `${state.target.windows}%`;
  document.getElementById('height-val').textContent = `${state.target.height}%`;

  // Arch toggle
  document.getElementById('btn-arch-roman').classList.toggle('active', state.target.archType === 'roman');
  document.getElementById('btn-arch-gothic').classList.toggle('active', state.target.archType === 'gothic');
}

// ---- SMOOTH TRANSITIONS ----
function lerpState(dt) {
  let needsRebuild = false;
  const speed = 2.5 * dt;

  if (state.archType !== state.target.archType) {
    state.archType = state.target.archType;
    needsRebuild = true;
  }

  const fields = ['buttress', 'windows', 'height'];
  for (const f of fields) {
    if (Math.abs(state[f] - state.target[f]) > 0.5) {
      state[f] += (state.target[f] - state[f]) * Math.min(speed, 1);
      needsRebuild = true;
    } else if (state[f] !== state.target[f]) {
      state[f] = state.target[f];
      needsRebuild = true;
    }
  }

  // Update height multiplier
  DIM.heightMultiplier = 1.0 + (state.height / 100) * (DIM.maxHeightMultiplier - 1.0);

  // Wall thickness thins as buttress increases
  DIM.wallThickness = DIM.baseWallThickness * (1 - state.buttress / 100 * 0.5);

  if (needsRebuild) {
    rebuildChurch();
    updateUI();
  }

  // Interior light
  interiorLight.intensity = (state.windows / 100) * 5.0;
  interiorLight.position.y = 4 + DIM.heightMultiplier * 2;

  // Stained glass lights
  const winP = state.windows / 100;
  const baySpacing = DIM.naveLength / DIM.bays;
  stainedLights.forEach((sl, i) => {
    sl.intensity = winP > 0.2 ? winP * 3.0 : 0;
    sl.position.set(
      Math.sin(i * 1.2) * 3,
      3 + DIM.heightMultiplier * 2,
      -DIM.naveLength / 2 + (i + 0.5) * baySpacing
    );
  });

  // ---- DYNAMIC SUN ANIMATION ----
  sunAngle += dt * 0.15; // slow cycle
  const sunX = Math.cos(sunAngle) * 30;
  const sunZ = Math.sin(sunAngle) * 20;
  const sunElevation = 25 + Math.sin(sunAngle * 0.5) * 5;
  dirLight.position.set(sunX, sunElevation, sunZ);

  // Sun color shifts warm → cool
  const sunPhase = (Math.sin(sunAngle * 0.5) + 1) / 2; // 0-1
  const sunColor = new THREE.Color();
  sunColor.setHSL(0.1 - sunPhase * 0.04, 0.2 + sunPhase * 0.2, 0.8 + sunPhase * 0.1);
  dirLight.color.copy(sunColor);
  dirLight.intensity = 2.2 + sunPhase * 0.8;

  // Hemisphere shifts with sun
  hemiLight.intensity = 0.5 + winP * 0.5;
  hemiLight.color.setHSL(0.12, 0.3, 0.7 + sunPhase * 0.15);

  // ---- VOLUMETRIC LIGHT RAYS animation ----
  lightFxGroup.children.forEach(ray => {
    if (ray.userData.isLightRay) {
      // Opacity pulses with sun angle & window progress
      const sideInfluence = ray.userData.side !== undefined
        ? (ray.userData.side > 0 ? Math.max(0.1, Math.cos(sunAngle)) : Math.max(0.1, -Math.cos(sunAngle)))
        : Math.max(0.1, Math.sin(sunAngle + 0.5));
      ray.material.opacity = ray.userData.baseOpacity * sideInfluence * (0.8 + Math.sin(sunAngle * 2) * 0.2);

      // Subtle sway
      if (ray.userData.side !== undefined) {
        ray.rotation.z = (ray.userData.side > 0 ? Math.PI / 2 + 0.4 : -Math.PI / 2 - 0.4)
          + Math.sin(sunAngle * 0.7) * 0.08;
      }
    }
  });

  // Window SpotLights — intensity varies with sun side
  windowSpots.forEach(ws => {
    const sideInfluence = ws.side > 0
      ? Math.max(0.15, Math.cos(sunAngle))
      : Math.max(0.15, -Math.cos(sunAngle));
    ws.spot.intensity = ws.baseIntensity * sideInfluence * (0.7 + Math.sin(sunAngle * 1.5) * 0.3);
  });

  // Ambient exposure shift
  renderer.toneMappingExposure = 1.5 + sunPhase * 0.4;

  // Dust particles
  if (dustParticles) {
    dustParticles.material.opacity = winP > 0.4 ? (winP - 0.4) * 0.6 : 0;
    dustParticles.rotation.y += dt * 0.05;
    // Slowly float upward
    const pos = dustParticles.geometry.attributes.position;
    const h = DIM.wallHeight * DIM.heightMultiplier;
    for (let i = 0; i < pos.count; i++) {
      pos.array[i * 3 + 1] += dt * 0.3;
      if (pos.array[i * 3 + 1] > h + 2) {
        pos.array[i * 3 + 1] = 0.5;
      }
    }
    pos.needsUpdate = true;
  }

  // Column ribs visibility
  columnsGroup.children.forEach(child => {
    if (child.userData.isRib) {
      child.visible = state.archType === 'gothic' && state.height > 20;
    }
  });
}

// ---- EVENT LISTENERS ----
document.getElementById('btn-arch-roman').addEventListener('click', () => {
  state.target.archType = 'roman';
  updateUI();
});

document.getElementById('btn-arch-gothic').addEventListener('click', () => {
  state.target.archType = 'gothic';
  updateUI();
});

document.getElementById('slider-buttress').addEventListener('input', (e) => {
  state.target.buttress = parseInt(e.target.value);
  updateUI();
});

document.getElementById('slider-windows').addEventListener('input', (e) => {
  state.target.windows = parseInt(e.target.value);
  updateUI();
});

document.getElementById('slider-height').addEventListener('input', (e) => {
  state.target.height = parseInt(e.target.value);
  updateUI();
});

document.getElementById('btn-reset').addEventListener('click', () => {
  state.target.archType = 'roman';
  state.target.buttress = 0;
  state.target.windows = 0;
  state.target.height = 0;

  document.getElementById('slider-buttress').value = 0;
  document.getElementById('slider-windows').value = 0;
  document.getElementById('slider-height').value = 0;

  updateUI();
});

// =============================================
// TUTOR SYSTEM — Step-by-step guided experience
// =============================================
const TUTOR_STEPS = [
  {
    id: 0,
    message: '👀 <strong>Observa esta iglesia románica del siglo XII.</strong> Fíjate en sus muros gruesos, ventanas pequeñas y arcos de medio punto. Rota la cámara arrastrando con el ratón para explorarla. Cuando estés listo, pulsa "Siguiente".',
    highlight: null,
    autoAdvance: false,
    nextLabel: 'Entendido, sigamos →'
  },
  {
    id: 1,
    message: '⛪ <strong>Paso 1: Cambiar el arco.</strong> El arco ojival (apuntado) dirige las fuerzas hacia abajo en vez de hacia los lados. Esto permite construir más alto con muros más delgados. <strong>Haz clic en "Ojival"</strong> en el panel izquierdo.',
    highlight: 'tool-arch',
    autoAdvance: () => state.archType === 'gothic',
    nextLabel: null // auto-avanza
  },
  {
    id: 2,
    message: '🏗️ <strong>Paso 2: Liberar el muro.</strong> Los arbotantes son "brazos" exteriores que sostienen el empuje del techo. Al sacar la estructura afuera, los muros interiores pueden ser más finos. <strong>Sube el control de Arbotantes al 60% o más.</strong>',
    highlight: 'tool-buttress',
    autoAdvance: () => state.buttress >= 60,
    nextLabel: null
  },
  {
    id: 3,
    message: '✨ <strong>Paso 3: Perforar el límite.</strong> Con muros delgados sostenidos por arbotantes, ya se pueden abrir grandes ventanas con vitrales de colores. La luz coloreada transforma el espacio interior en algo sagrado. <strong>Sube los Vitrales al 60% o más.</strong>',
    highlight: 'tool-windows',
    autoAdvance: () => state.windows >= 60,
    nextLabel: null
  },
  {
    id: 4,
    message: '🕍 <strong>Paso 4: Añadir verticalidad.</strong> La catedral gótica busca elevarse hacia el cielo. Las columnas, nervaduras y bóvedas crecen para crear una sensación de ascensión espiritual. <strong>Sube la Altura al 50% o más.</strong>',
    highlight: 'tool-height',
    autoAdvance: () => state.height >= 50,
    nextLabel: null
  }
];

const TUTOR_COMPLETION_MESSAGE = '🎉 <strong>¡Felicidades, Arquitecto!</strong> Has transformado una iglesia románica en una catedral gótica. Observa cómo las 4 innovaciones trabajan juntas: arcos ojivales + arbotantes + vitrales + verticalidad = la revolución gótica.';

let tutorActive = false;
let tutorStep = -1;

const welcomeEl = document.getElementById('tutor-welcome');
const barEl = document.getElementById('tutor-bar');
const msgEl = document.getElementById('tutor-message');
const stepNumEl = document.getElementById('tutor-step-num');
const dotsEl = document.getElementById('tutor-dots');
const nextBtn = document.getElementById('btn-tutor-next');
const tutorToggleBtn = document.getElementById('btn-tutor');

// Build dots
for (let i = 0; i < TUTOR_STEPS.length; i++) {
  const dot = document.createElement('div');
  dot.className = 'tutor-dot';
  dot.dataset.step = i;
  dotsEl.appendChild(dot);
}

function updateTutorDots() {
  dotsEl.querySelectorAll('.tutor-dot').forEach((dot, i) => {
    dot.classList.remove('active', 'done');
    if (i < tutorStep) dot.classList.add('done');
    else if (i === tutorStep) dot.classList.add('active');
  });
}

function updateMissionChecklist() {
  for (let i = 0; i < 5; i++) {
    const el = document.getElementById(`mission-${i}`);
    if (!el) continue;
    const check = el.querySelector('.mission-check');
    el.classList.remove('current', 'done');

    if (tutorActive && i === tutorStep) {
      el.classList.add('current');
      check.textContent = '▶';
    } else if (tutorActive && i < tutorStep) {
      el.classList.add('done');
      check.textContent = '✓';
    } else if (!tutorActive) {
      // Check completion state based on actual values
      const checks = [
        true, // step 0 always done if started
        state.archType === 'gothic',
        state.buttress >= 60,
        state.windows >= 60,
        state.height >= 50
      ];
      if (checks[i]) {
        el.classList.add('done');
        check.textContent = '✓';
      } else {
        check.textContent = '○';
      }
    } else {
      check.textContent = '○';
    }
  }
}

function clearHighlights() {
  document.querySelectorAll('.tool-card').forEach(el => el.classList.remove('tutor-highlight'));
}

function showTutorStep(stepIndex) {
  if (stepIndex >= TUTOR_STEPS.length) {
    // Completed!
    msgEl.innerHTML = TUTOR_COMPLETION_MESSAGE;
    stepNumEl.textContent = '✓';
    nextBtn.textContent = '¡Cerrar Tutor!';
    nextBtn.style.display = 'inline-block';
    nextBtn.disabled = false;
    nextBtn.onclick = () => {
      closeTutor();
    };
    clearHighlights();
    updateTutorDots();
    updateMissionChecklist();
    return;
  }

  tutorStep = stepIndex;
  const step = TUTOR_STEPS[stepIndex];

  stepNumEl.textContent = stepIndex + 1;
  msgEl.innerHTML = step.message;

  // Highlight the relevant tool card
  clearHighlights();
  if (step.highlight) {
    const card = document.getElementById(step.highlight);
    if (card) card.classList.add('tutor-highlight');
  }

  // Next button
  if (step.autoAdvance && typeof step.autoAdvance === 'function') {
    // Check if already fulfilled
    if (step.autoAdvance()) {
      nextBtn.textContent = 'Siguiente →';
      nextBtn.style.display = 'inline-block';
      nextBtn.disabled = false;
      nextBtn.onclick = () => showTutorStep(tutorStep + 1);
    } else {
      nextBtn.textContent = 'Esperando...';
      nextBtn.style.display = 'inline-block';
      nextBtn.disabled = true;
    }
  } else {
    nextBtn.textContent = step.nextLabel || 'Siguiente →';
    nextBtn.style.display = 'inline-block';
    nextBtn.disabled = false;
    nextBtn.onclick = () => showTutorStep(tutorStep + 1);
  }

  updateTutorDots();
  updateMissionChecklist();
}

// Check auto-advance in each frame
function checkTutorAutoAdvance() {
  if (!tutorActive || tutorStep < 0 || tutorStep >= TUTOR_STEPS.length) return;
  const step = TUTOR_STEPS[tutorStep];
  if (step.autoAdvance && typeof step.autoAdvance === 'function' && step.autoAdvance()) {
    // Enable the next button and update text
    nextBtn.textContent = '¡Hecho! Siguiente →';
    nextBtn.disabled = false;
    nextBtn.onclick = () => showTutorStep(tutorStep + 1);

    // Mark mission done
    updateMissionChecklist();
  }
}

function updateTutorBarHeight() {
  if (!barEl.classList.contains('hidden')) {
    const h = barEl.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--tutor-bar-height', h + 'px');
  } else {
    document.documentElement.style.setProperty('--tutor-bar-height', '0px');
  }
  // Trigger resize so canvas updates
  setTimeout(() => onResize(), 50);
}

function startTutor() {
  tutorActive = true;
  welcomeEl.classList.add('hidden');
  barEl.classList.remove('hidden');
  tutorToggleBtn.classList.remove('tutor-off');
  showTutorStep(0);
  updateTutorBarHeight();
}

function closeTutor() {
  tutorActive = false;
  barEl.classList.add('hidden');
  clearHighlights();
  tutorToggleBtn.classList.add('tutor-off');
  updateMissionChecklist();
  updateTutorBarHeight();
}

function toggleTutor() {
  if (tutorActive) {
    closeTutor();
  } else {
    tutorActive = true;
    barEl.classList.remove('hidden');
    tutorToggleBtn.classList.remove('tutor-off');
    // Resume from current step or restart
    if (tutorStep < 0) tutorStep = 0;
    showTutorStep(tutorStep);
    updateTutorBarHeight();
  }
}

// Welcome screen buttons
document.getElementById('btn-start-tutor').addEventListener('click', startTutor);
document.getElementById('btn-skip-tutor').addEventListener('click', () => {
  welcomeEl.classList.add('hidden');
  tutorToggleBtn.classList.add('tutor-off');
  updateMissionChecklist();
});

// Tutor toggle
tutorToggleBtn.addEventListener('click', toggleTutor);

// ---- RESIZE ----
function onResize() {
  const rect = canvas.parentElement.getBoundingClientRect();
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
  renderer.setSize(rect.width, rect.height);
}

window.addEventListener('resize', onResize);

// ---- ANIMATION LOOP ----
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.05);

  controls.update();
  lerpState(dt);

  // Check tutor auto-advance
  if (tutorActive) checkTutorAutoAdvance();

  renderer.render(scene, camera);
}

// ---- INIT ----
function init() {
  onResize();
  rebuildChurch();
  createDustParticles();
  updateUI();
  updateMissionChecklist();
  animate();

  // Fade out hint after 4 seconds
  setTimeout(() => {
    const hint = document.getElementById('viewport-hint');
    if (hint) hint.style.opacity = '0';
  }, 4000);
}

init();

