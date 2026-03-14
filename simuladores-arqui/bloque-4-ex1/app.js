/* =========================================
   Simulador de Gestión Urbana — 3D Grid Cell Engine
   Three.js + Click-to-Place Cell System
   ========================================= */

// ─── State ───────────────────────────────────────
var AppState = {
    buildingMaxHeight: 10,
    groundOccupation: 75,
    flowMode: 'pedestrian',
    sidewalkWidth: 2,
    connectivity: 3,
    hwRatio: 3.0,
    selectedTool: 'building',
    indices: { density: 25, connectivity: 30, publicSpace: 15, humanScale: 40, pedestrianFlow: 20 },
    gridCols: 6,
    gridRows: 5,
    cells: [],        // persistent grid cells
    streets: [],
    time: 0,
    interactionCount: 0
};

// ─── Three.js globals ────────────────────────────
var scene, camera, renderer, controls;
var cellGroup, streetGroup, vehicleGroup, pedestrianGroup, crosswalkGroup;
var vehicles = [];
var pedestrians = [];
var cellMeshes = []; // for raycasting
var clock, raycaster, mouse;

// ─── City dimensions ─────────────────────────────
var CITY_W = 120, CITY_D = 100, STREET_W = 3;
var CIRC = 2 * Math.PI * 52;

// ─── Boot ────────────────────────────────────────
window.onerror = function (msg, url, line) { console.error('[3D ERROR]', msg, 'at', url, ':', line); };

window.addEventListener('load', function () {
    console.log('[3D] Booting...');
    initThree();
    initGrid();
    setupModal();
    setupSliders();
    setupFlowButtons();
    setupPalette();
    setupToolToggles();
    setupConceptToggles();
    setupResetButton();
    buildStreets();
    buildAllCells();
    spawnTraffic();
    computeIndices();
    updateAllUI();
    updateScaleVisual();
    animate();
    console.log('[3D] Ready. Grid:', AppState.gridCols, 'x', AppState.gridRows);
});

// ─── Three.js Setup ──────────────────────────────
function initThree() {
    var container = document.getElementById('canvas-container');
    var w = container.clientWidth, h = container.clientHeight;

    scene = new THREE.Scene();

    // Sky gradient
    var skyC = document.createElement('canvas');
    skyC.width = 2; skyC.height = 512;
    var skyX = skyC.getContext('2d');
    var g = skyX.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, '#0a1628'); g.addColorStop(0.3, '#1a2a3a');
    g.addColorStop(0.6, '#2a3a2a'); g.addColorStop(1, '#1a2403');
    skyX.fillStyle = g; skyX.fillRect(0, 0, 2, 512);
    scene.background = new THREE.CanvasTexture(skyC);
    scene.fog = new THREE.FogExp2(0x1a2403, 0.007);

    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 500);
    camera.position.set(70, 55, 90);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;

    var old = container.querySelector('canvas');
    if (old) old.remove();
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.minDistance = 15;
    controls.maxDistance = 200;
    controls.target.set(CITY_W / 2, 0, CITY_D / 2);

    // Lighting
    scene.add(new THREE.AmbientLight(0x4a5a3a, 0.6));
    var dl = new THREE.DirectionalLight(0xffeedd, 1.0);
    dl.position.set(60, 80, 40);
    dl.castShadow = true;
    dl.shadow.mapSize.set(2048, 2048);
    dl.shadow.camera.near = 1; dl.shadow.camera.far = 200;
    dl.shadow.camera.left = -80; dl.shadow.camera.right = 80;
    dl.shadow.camera.top = 80; dl.shadow.camera.bottom = -80;
    scene.add(dl);
    scene.add(new THREE.HemisphereLight(0x87ceeb, 0x2a3a1a, 0.3));
    var neon = new THREE.PointLight(0xc8ff01, 0.4, 120);
    neon.position.set(CITY_W / 2, 25, CITY_D / 2);
    scene.add(neon);

    // Groups
    cellGroup = new THREE.Group(); scene.add(cellGroup);
    streetGroup = new THREE.Group(); scene.add(streetGroup);
    vehicleGroup = new THREE.Group(); scene.add(vehicleGroup);
    pedestrianGroup = new THREE.Group(); scene.add(pedestrianGroup);
    crosswalkGroup = new THREE.Group(); scene.add(crosswalkGroup);

    // Ground
    var gnd = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshStandardMaterial({ color: 0x1a2a0a, roughness: 0.9 })
    );
    gnd.rotation.x = -Math.PI / 2;
    gnd.position.set(CITY_W / 2, -0.05, CITY_D / 2);
    gnd.receiveShadow = true;
    scene.add(gnd);

    var grid = new THREE.GridHelper(200, 80, 0x2a3a1a, 0x1a2a0a);
    grid.position.set(CITY_W / 2, 0.01, CITY_D / 2);
    grid.material.opacity = 0.12; grid.material.transparent = true;
    scene.add(grid);

    clock = new THREE.Clock();
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    window.addEventListener('resize', function () {
        var w2 = container.clientWidth, h2 = container.clientHeight;
        camera.aspect = w2 / h2;
        camera.updateProjectionMatrix();
        renderer.setSize(w2, h2);
    });

    renderer.domElement.addEventListener('click', onSceneClick);
}

// ─── Grid Initialization ─────────────────────────
function initGrid() {
    var cols = AppState.gridCols, rows = AppState.gridRows;
    AppState.cells = [];
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
            AppState.cells.push({
                row: r, col: c,
                type: 'building',  // building | park | plaza | green-belt | water | empty
                buildingHeights: generateBuildingHeights(),
                seed: Math.random() * 1000
            });
        }
    }
}

function generateBuildingHeights() {
    var heights = [];
    var nb = Math.min(6, 3 + Math.floor(Math.random() * 4));
    for (var i = 0; i < nb; i++) {
        heights.push(1 + Math.random() * (AppState.buildingMaxHeight - 1));
    }
    return heights;
}

function getCellPos(cell) {
    var cols = AppState.gridCols;
    var blockW = (CITY_W - (cols + 1) * STREET_W) / cols;
    var blockD = (CITY_D - (AppState.gridRows + 1) * STREET_W) / AppState.gridRows;
    return {
        x: STREET_W + cell.col * (blockW + STREET_W),
        z: STREET_W + cell.row * (blockD + STREET_W),
        w: blockW,
        d: blockD
    };
}

// ─── Build Streets (only rebuilds on sidewalk/connectivity change) ──
function buildStreets() {
    clearGroup(streetGroup);
    clearGroup(crosswalkGroup);
    AppState.streets = [];

    var cols = AppState.gridCols, rows = AppState.gridRows;
    var blockW = (CITY_W - (cols + 1) * STREET_W) / cols;
    var blockD = (CITY_D - (rows + 1) * STREET_W) / rows;

    var isPed = AppState.flowMode === 'pedestrian';
    var streetMat = new THREE.MeshStandardMaterial({
        color: isPed ? 0x5a6a4a : 0x3a3a3a, roughness: 0.85
    });
    var swMat = new THREE.MeshStandardMaterial({ color: 0x8a8a7a, roughness: 0.7 });
    var swW = Math.min(AppState.sidewalkWidth * 0.3, 1.2);

    // Horizontal streets
    for (var r = 0; r <= rows; r++) {
        var z = r * (blockD + STREET_W) + STREET_W / 2;
        var s = new THREE.Mesh(new THREE.BoxGeometry(CITY_W, 0.08, STREET_W), streetMat);
        s.position.set(CITY_W / 2, 0.04, z);
        s.receiveShadow = true;
        streetGroup.add(s);

        if (swW > 0.1) {
            var sg = new THREE.BoxGeometry(CITY_W, 0.15, swW);
            var s1 = new THREE.Mesh(sg, swMat); s1.position.set(CITY_W / 2, 0.075, z - STREET_W / 2 - swW / 2); s1.receiveShadow = true; streetGroup.add(s1);
            var s2 = new THREE.Mesh(sg, swMat); s2.position.set(CITY_W / 2, 0.075, z + STREET_W / 2 + swW / 2); s2.receiveShadow = true; streetGroup.add(s2);
        }

        // Lane marks
        for (var lx = 2; lx < CITY_W; lx += 4) {
            var m = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0xffff88, transparent: true, opacity: 0.4 }));
            m.position.set(lx, 0.09, z); streetGroup.add(m);
        }

        AppState.streets.push({ x1: 0, z1: z, x2: CITY_W, z2: z, dir: 'right', ped: false, horiz: true });
    }

    // Vertical streets
    for (var c = 0; c <= cols; c++) {
        var x = c * (blockW + STREET_W) + STREET_W / 2;
        var s3 = new THREE.Mesh(new THREE.BoxGeometry(STREET_W, 0.08, CITY_D), streetMat);
        s3.position.set(x, 0.04, CITY_D / 2);
        s3.receiveShadow = true;
        streetGroup.add(s3);

        if (swW > 0.1) {
            var sg2 = new THREE.BoxGeometry(swW, 0.15, CITY_D);
            var s4 = new THREE.Mesh(sg2, swMat); s4.position.set(x - STREET_W / 2 - swW / 2, 0.075, CITY_D / 2); s4.receiveShadow = true; streetGroup.add(s4);
            var s5 = new THREE.Mesh(sg2, swMat); s5.position.set(x + STREET_W / 2 + swW / 2, 0.075, CITY_D / 2); s5.receiveShadow = true; streetGroup.add(s5);
        }

        for (var lz = 2; lz < CITY_D; lz += 4) {
            var m2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.5), new THREE.MeshBasicMaterial({ color: 0xffff88, transparent: true, opacity: 0.4 }));
            m2.position.set(x, 0.09, lz); streetGroup.add(m2);
        }

        AppState.streets.push({ x1: x, z1: 0, x2: x, z2: CITY_D, dir: 'down', ped: false, horiz: false });
    }

    // Crosswalks — more crosswalks when connectivity is higher
    buildCrosswalks(cols, rows, blockW, blockD);
}

function buildCrosswalks(cols, rows, blockW, blockD) {
    var cwMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    var numCrosswalks = AppState.connectivity; // 1-10

    // Horizontal crosswalks on vertical streets
    for (var c = 0; c <= cols; c++) {
        var x = c * (blockW + STREET_W) + STREET_W / 2;
        for (var r = 0; r < rows; r++) {
            if (r >= numCrosswalks) break;
            var z = STREET_W + r * (blockD + STREET_W) + blockD / 2;
            for (var stripe = -1; stripe <= 1; stripe += 0.5) {
                var cw = new THREE.Mesh(new THREE.BoxGeometry(STREET_W * 0.8, 0.1, 0.25), cwMat);
                cw.position.set(x, 0.09, z + stripe);
                crosswalkGroup.add(cw);
            }
        }
    }

    // Vertical crosswalks on horizontal streets
    for (var r2 = 0; r2 <= rows; r2++) {
        var z2 = r2 * (blockD + STREET_W) + STREET_W / 2;
        for (var c2 = 0; c2 < cols; c2++) {
            if (c2 >= numCrosswalks) break;
            var x2 = STREET_W + c2 * (blockW + STREET_W) + blockW / 2;
            for (var stripe2 = -1; stripe2 <= 1; stripe2 += 0.5) {
                var cw2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.1, STREET_W * 0.8), cwMat);
                cw2.position.set(x2 + stripe2, 0.09, z2);
                crosswalkGroup.add(cw2);
            }
        }
    }

    // Traffic lights at intersections (based on connectivity)
    var lightPostMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, metalness: 0.6 });
    for (var ci = 0; ci < Math.min(numCrosswalks, cols); ci++) {
        for (var ri = 0; ri < Math.min(numCrosswalks, rows); ri++) {
            var px = STREET_W + ci * (blockW + STREET_W) + blockW + STREET_W * 0.3;
            var pz = STREET_W + ri * (blockD + STREET_W) + blockD + STREET_W * 0.3;
            // Post
            var post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.5), lightPostMat);
            post.position.set(px, 1.25, pz); crosswalkGroup.add(post);
            // Red/Green light
            var lightG = new THREE.Mesh(new THREE.SphereGeometry(0.12), new THREE.MeshBasicMaterial({ color: 0x00ff44 }));
            lightG.position.set(px, 2.5, pz);
            lightG.userData.trafficLight = true;
            crosswalkGroup.add(lightG);
        }
    }
}

// ─── Build All Cells ─────────────────────────────
function buildAllCells() {
    clearGroup(cellGroup);
    cellMeshes = [];
    AppState.cells.forEach(function (cell) { buildCellContent(cell); });
}

function buildCellContent(cell) {
    var pos = getCellPos(cell);
    var x = pos.x, z = pos.z, w = pos.w, d = pos.d;
    var cx = x + w / 2, cz = z + d / 2;

    // Clickable base plate (for raycasting)
    var baseGeo = new THREE.BoxGeometry(w, 0.12, d);
    var baseColor = getBaseColor(cell.type);
    var baseMat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.8 });
    var base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(cx, 0.06, cz);
    base.receiveShadow = true;
    base.userData.cellIndex = cell.row * AppState.gridCols + cell.col;
    cellGroup.add(base);
    cellMeshes.push(base);

    // Content based on type
    if (cell.type === 'building') {
        buildBuildingsInCell(cell, x, z, w, d);
    } else if (cell.type === 'park') {
        buildPark(cx, cz, w, d);
    } else if (cell.type === 'plaza') {
        buildPlaza(cx, cz, w, d);
    } else if (cell.type === 'green-belt') {
        buildGreenBelt(cx, cz, w, d);
    } else if (cell.type === 'water') {
        buildWater(cx, cz, w, d);
    }
    // 'empty' = just the base plate
}

function getBaseColor(type) {
    switch (type) {
        case 'building': return 0x2a3a1a;
        case 'park': return 0x1a5a1a;
        case 'plaza': return 0x8a7a5a;
        case 'green-belt': return 0x1a6a2a;
        case 'water': return 0x1a3a5a;
        case 'empty': return 0x2a2a1a;
        default: return 0x2a3a1a;
    }
}

function buildBuildingsInCell(cell, x, z, w, d) {
    var heights = cell.buildingHeights;
    var nb = heights.length;
    var occ = AppState.groundOccupation / 100;
    var bCols = Math.min(nb, 3);
    var bRows = Math.ceil(nb / bCols);
    var padX = w * (1 - occ) / 2;
    var padZ = d * (1 - occ) / 2;
    var cellBW = (w * occ) / bCols;
    var cellBD = (d * occ) / bRows;

    for (var i = 0; i < nb; i++) {
        var row = Math.floor(i / bCols);
        var col = i % bCols;
        var bx = x + padX + col * cellBW + cellBW / 2;
        var bz = z + padZ + row * cellBD + cellBD / 2;
        var bw = cellBW * 0.82;
        var bd = cellBD * 0.82;
        var ht = Math.min(heights[i], AppState.buildingMaxHeight) * 0.8;

        createBuilding(bx, bz, bw, bd, ht, cell.seed + i);
    }
}

function createBuilding(cx, cz, bw, bd, ht, seed) {
    var color;
    if (ht > 5) {
        // Skyscraper
        color = lerpColor(0x2a4a5a, 0x3a6a7a, (seed * 13.7) % 1);
        var geo = new THREE.BoxGeometry(bw * 0.9, ht, bd * 0.9);
        var mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.2, metalness: 0.7, transparent: true, opacity: 0.85 });
        var mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(cx, ht / 2, cz);
        mesh.castShadow = true; mesh.receiveShadow = true;
        cellGroup.add(mesh);

        if (ht > 6) {
            var ant = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.5), new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.9 }));
            ant.position.set(cx, ht + 0.75, cz); cellGroup.add(ant);
            var bl = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
            bl.position.set(cx, ht + 1.5, cz); bl.userData.blink = true; cellGroup.add(bl);
        }
        addWindows(cx, cz, bw * 0.9, bd * 0.9, ht);
    } else if (ht > 2.5) {
        // Medium
        color = lerpColor(0x5a6a3a, 0x7a8a4a, (seed * 7.3) % 1);
        var geo2 = new THREE.BoxGeometry(bw, ht, bd);
        var mesh2 = new THREE.Mesh(geo2, new THREE.MeshStandardMaterial({ color: color, roughness: 0.6, metalness: 0.2 }));
        mesh2.position.set(cx, ht / 2, cz);
        mesh2.castShadow = true; mesh2.receiveShadow = true;
        cellGroup.add(mesh2);
        var roof = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.2, 0.15, bd + 0.2), new THREE.MeshStandardMaterial({ color: 0x4a5a2a }));
        roof.position.set(cx, ht + 0.075, cz); roof.castShadow = true; cellGroup.add(roof);
        addWindows(cx, cz, bw, bd, ht);
    } else {
        // Low residential
        color = lerpColor(0x6a7a4a, 0x8a9a5a, (seed * 11.1) % 1);
        var geo3 = new THREE.BoxGeometry(bw, ht, bd);
        var mesh3 = new THREE.Mesh(geo3, new THREE.MeshStandardMaterial({ color: color, roughness: 0.7, metalness: 0.1 }));
        mesh3.position.set(cx, ht / 2, cz);
        mesh3.castShadow = true; mesh3.receiveShadow = true;
        cellGroup.add(mesh3);
        var roofC = new THREE.Mesh(new THREE.ConeGeometry(Math.max(bw, bd) * 0.7, 0.8, 4), new THREE.MeshStandardMaterial({ color: 0x8a4a2a }));
        roofC.position.set(cx, ht + 0.4, cz); roofC.rotation.y = Math.PI / 4; roofC.castShadow = true; cellGroup.add(roofC);
    }
}

function addWindows(cx, cz, bw, bd, ht) {
    var wMat = new THREE.MeshBasicMaterial({ color: 0xffeeaa, transparent: true, opacity: 0.6 });
    var floors = Math.max(1, Math.floor(ht / 1.2));
    var wPer = Math.max(1, Math.floor(bw / 1.2));
    for (var f = 0; f < floors; f++) {
        var wy = 0.8 + f * 1.2;
        for (var wi = 0; wi < wPer; wi++) {
            var wx = cx - bw / 2 + 0.5 + wi * (bw - 1) / Math.max(1, wPer - 1);
            var wg = new THREE.PlaneGeometry(0.4, 0.5);
            var wm1 = new THREE.Mesh(wg, wMat);
            wm1.position.set(wx, wy, cz + bd / 2 + 0.01); cellGroup.add(wm1);
            var wm2 = new THREE.Mesh(wg, wMat);
            wm2.position.set(wx, wy, cz - bd / 2 - 0.01); wm2.rotation.y = Math.PI; cellGroup.add(wm2);
        }
    }
}

// ─── Park ────────────────────────────────────────
function buildPark(cx, cz, w, d) {
    // Grass
    var grass = new THREE.Mesh(new THREE.BoxGeometry(w * 0.95, 0.08, d * 0.95), new THREE.MeshStandardMaterial({ color: 0x2a8a2a, roughness: 0.9 }));
    grass.position.set(cx, 0.16, cz); grass.receiveShadow = true; cellGroup.add(grass);
    // Trees
    for (var i = 0; i < 5; i++) {
        cellGroup.add(createTree(cx + (Math.random() - 0.5) * w * 0.7, cz + (Math.random() - 0.5) * d * 0.7, 0.5 + Math.random() * 0.5));
    }
    // Bench
    var bench = new THREE.Mesh(new THREE.BoxGeometry(1, 0.2, 0.3), new THREE.MeshStandardMaterial({ color: 0x5a3a1a }));
    bench.position.set(cx, 0.3, cz + d * 0.25); cellGroup.add(bench);
    // Path
    var path = new THREE.Mesh(new THREE.BoxGeometry(w * 0.12, 0.13, d * 0.8), new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 0.8 }));
    path.position.set(cx, 0.14, cz); cellGroup.add(path);
}

// ─── Plaza ───────────────────────────────────────
function buildPlaza(cx, cz, w, d) {
    var pave = new THREE.Mesh(new THREE.BoxGeometry(w * 0.95, 0.08, d * 0.95), new THREE.MeshStandardMaterial({ color: 0xc8b888, roughness: 0.5 }));
    pave.position.set(cx, 0.16, cz); pave.receiveShadow = true; cellGroup.add(pave);
    // Fountain
    var bowl = new THREE.Mesh(new THREE.CylinderGeometry(d * 0.2, d * 0.25, 0.4, 16), new THREE.MeshStandardMaterial({ color: 0x7a7a8a, roughness: 0.3, metalness: 0.5 }));
    bowl.position.set(cx, 0.35, cz); cellGroup.add(bowl);
    var water = new THREE.Mesh(new THREE.CylinderGeometry(d * 0.17, d * 0.17, 0.1, 16), new THREE.MeshStandardMaterial({ color: 0x3498db, transparent: true, opacity: 0.7, roughness: 0.1 }));
    water.position.set(cx, 0.5, cz); water.userData.isWater = true; cellGroup.add(water);
    // Corner trees
    cellGroup.add(createTree(cx - w * 0.3, cz - d * 0.3, 0.4));
    cellGroup.add(createTree(cx + w * 0.3, cz + d * 0.3, 0.4));
}

// ─── Green Belt ──────────────────────────────────
function buildGreenBelt(cx, cz, w, d) {
    var belt = new THREE.Mesh(new THREE.BoxGeometry(w * 0.95, 0.1, d * 0.95), new THREE.MeshStandardMaterial({ color: 0x1a7a2a, roughness: 0.9 }));
    belt.position.set(cx, 0.17, cz); belt.receiveShadow = true; cellGroup.add(belt);
    // Dense tree line
    var treeCount = Math.max(3, Math.floor(w / 2.5));
    for (var i = 0; i < treeCount; i++) {
        var tx = cx - w * 0.4 + (i / (treeCount - 1)) * w * 0.8;
        cellGroup.add(createTree(tx, cz + (Math.random() - 0.5) * d * 0.5, 0.4 + Math.random() * 0.6));
    }
    // Bushes
    for (var j = 0; j < 6; j++) {
        var bush = new THREE.Mesh(new THREE.SphereGeometry(0.3 + Math.random() * 0.2, 6, 4), new THREE.MeshStandardMaterial({ color: lerpColor(0x2a7a2a, 0x3a9a3a, Math.random()) }));
        bush.position.set(cx + (Math.random() - 0.5) * w * 0.8, 0.3, cz + (Math.random() - 0.5) * d * 0.6);
        cellGroup.add(bush);
    }
}

// ─── Water ───────────────────────────────────────
function buildWater(cx, cz, w, d) {
    var wMesh = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.9, 0.08, d * 0.9),
        new THREE.MeshStandardMaterial({ color: 0x2980b9, transparent: true, opacity: 0.75, roughness: 0.05, metalness: 0.4 })
    );
    wMesh.position.set(cx, 0.1, cz);
    wMesh.userData.isWater = true;
    cellGroup.add(wMesh);
    // Rocks around edge
    for (var i = 0; i < 8; i++) {
        var angle = (i / 8) * Math.PI * 2;
        var rx = cx + Math.cos(angle) * w * 0.4;
        var rz = cz + Math.sin(angle) * d * 0.4;
        var rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2 + Math.random() * 0.15), new THREE.MeshStandardMaterial({ color: 0x6a6a6a, roughness: 0.9 }));
        rock.position.set(rx, 0.15, rz);
        cellGroup.add(rock);
    }
}

// ─── Tree ────────────────────────────────────────
function createTree(x, z, scale) {
    scale = scale || 1;
    var g = new THREE.Group();
    var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.18 * scale, 1.2 * scale), new THREE.MeshStandardMaterial({ color: 0x5a3a1a }));
    trunk.position.set(0, 0.6 * scale, 0);
    trunk.castShadow = true;
    g.add(trunk);
    var cols = [0x2a8a3a, 0x3a9a4a, 0x2a7a2a];
    for (var i = 0; i < 3; i++) {
        var f = new THREE.Mesh(new THREE.ConeGeometry((1.2 - i * 0.25) * scale, (0.8 - i * 0.15) * scale, 8), new THREE.MeshStandardMaterial({ color: cols[i] }));
        f.position.y = (1.2 + i * 0.5) * scale;
        f.castShadow = true;
        g.add(f);
    }
    g.position.set(x, 0, z);
    return g;
}

// ─── Traffic (only rebuilds on flow mode change) ─
function spawnTraffic() {
    clearGroup(vehicleGroup);
    clearGroup(pedestrianGroup);
    vehicles = [];
    pedestrians = [];

    // Vehicles
    var vCount = AppState.flowMode === 'vehicular' ? 25 : AppState.flowMode === 'mixed' ? 15 : 4;
    for (var i = 0; i < vCount; i++) {
        var st = AppState.streets[Math.floor(Math.random() * AppState.streets.length)];
        var veh = createVehicle();
        var t = Math.random();
        var speed = (0.5 + Math.random() * 1.5) * (AppState.flowMode === 'vehicular' ? 1.5 : 0.8);
        if (st.horiz) { veh.position.set(lerp(st.x1, st.x2, t), 0.25, st.z1 + (Math.random() - 0.5)); veh.rotation.y = 0; }
        else { veh.position.set(st.x1 + (Math.random() - 0.5), 0.25, lerp(st.z1, st.z2, t)); veh.rotation.y = Math.PI / 2; }
        vehicleGroup.add(veh);
        vehicles.push({ mesh: veh, street: st, t: t, speed: speed });
    }

    // Pedestrians
    var pCount = AppState.flowMode === 'pedestrian' ? 40 : AppState.flowMode === 'mixed' ? 20 : 5;
    for (var j = 0; j < pCount; j++) {
        var st2 = AppState.streets[Math.floor(Math.random() * AppState.streets.length)];
        var ped = createPedestrian();
        var t2 = Math.random();
        var off = (STREET_W / 2 + AppState.sidewalkWidth * 0.3) * (Math.random() > 0.5 ? 1 : -1);
        if (st2.horiz) ped.position.set(lerp(st2.x1, st2.x2, t2), 0, st2.z1 + off);
        else ped.position.set(st2.x1 + off, 0, lerp(st2.z1, st2.z2, t2));
        pedestrianGroup.add(ped);
        pedestrians.push({ mesh: ped, street: st2, t: t2, speed: 0.2 + Math.random() * 0.4, offset: off });
    }
}

function createVehicle() {
    var g = new THREE.Group();
    var cc = [0x3a5a8a, 0x8a3a3a, 0xdadada, 0x5a5a5a, 0xc8ff01, 0x2a6a5a, 0xaa7a2a][Math.floor(Math.random() * 7)];
    var body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 0.7), new THREE.MeshStandardMaterial({ color: cc, roughness: 0.3, metalness: 0.6 }));
    body.castShadow = true; g.add(body);
    var roof = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.6), new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.2, metalness: 0.5 }));
    roof.position.set(-0.1, 0.35, 0); g.add(roof);
    var wg = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 8);
    var wm = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    [[-0.5, -0.15, 0.35], [-0.5, -0.15, -0.35], [0.5, -0.15, 0.35], [0.5, -0.15, -0.35]].forEach(function (p) {
        var wh = new THREE.Mesh(wg, wm); wh.position.set(p[0], p[1], p[2]); wh.rotation.x = Math.PI / 2; g.add(wh);
    });
    g.scale.set(0.5, 0.5, 0.5);
    return g;
}

function createPedestrian() {
    var g = new THREE.Group();
    var skin = [0xf5c6a8, 0xd4a574, 0x8d5524, 0xc68642][Math.floor(Math.random() * 4)];
    var shirt = [0x3a5a8a, 0x8a3a5a, 0x5a8a3a, 0xffffff, 0x2a2a2a, 0xc8ff01][Math.floor(Math.random() * 6)];
    var torso = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.15), new THREE.MeshStandardMaterial({ color: shirt }));
    torso.position.set(0, 0.5, 0); g.add(torso);
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshStandardMaterial({ color: skin }));
    head.position.set(0, 0.8, 0); g.add(head);
    var legM = new THREE.MeshStandardMaterial({ color: 0x2a2a3a });
    var l1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), legM);
    l1.position.set(-0.05, 0.15, 0); g.add(l1);
    var l2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), legM);
    l2.position.set(0.05, 0.15, 0); g.add(l2);
    return g;
}

// ─── Scene Click → Place Element ─────────────────
function onSceneClick(e) {
    var rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    var hits = raycaster.intersectObjects(cellMeshes);
    if (hits.length > 0) {
        var idx = hits[0].object.userData.cellIndex;
        if (idx !== undefined && idx >= 0 && idx < AppState.cells.length) {
            var cell = AppState.cells[idx];
            var newType = AppState.selectedTool;

            if (cell.type === newType) return; // same type, no change

            cell.type = newType;
            if (newType === 'building') {
                cell.buildingHeights = generateBuildingHeights();
            }

            // Rebuild just this cell's content
            buildAllCells();
            computeIndices();
            updateAllUI();
        }
    }
}

// ─── Palette ─────────────────────────────────────
function setupPalette() {
    var items = document.querySelectorAll('.palette-item');
    items.forEach(function (item) {
        item.addEventListener('click', function () {
            items.forEach(function (i) { i.classList.remove('active'); });
            item.classList.add('active');
            AppState.selectedTool = item.getAttribute('data-element');
        });
    });
}

// ─── Animation Loop ──────────────────────────────
function animate() {
    requestAnimationFrame(animate);
    var delta = clock.getDelta();
    AppState.time += delta;
    controls.update();

    // Vehicles
    vehicles.forEach(function (v) {
        v.t += v.speed * delta * 0.05;
        if (v.t > 1) v.t -= 1;
        var st = v.street;
        if (st.horiz) v.mesh.position.x = lerp(st.x1, st.x2, v.t);
        else v.mesh.position.z = lerp(st.z1, st.z2, v.t);
    });

    // Pedestrians
    pedestrians.forEach(function (p) {
        p.t += p.speed * delta * 0.03;
        if (p.t > 1) p.t -= 1;
        var st = p.street;
        if (st.horiz) p.mesh.position.x = lerp(st.x1, st.x2, p.t);
        else p.mesh.position.z = lerp(st.z1, st.z2, p.t);
        p.mesh.position.y = Math.abs(Math.sin(AppState.time * 8 + p.t * 20)) * 0.05;
    });

    // Blink
    cellGroup.traverse(function (c) { if (c.userData.blink) c.visible = Math.sin(AppState.time * 3) > 0; });

    // Water shimmer
    cellGroup.traverse(function (c) { if (c.userData.isWater) c.material.opacity = 0.6 + Math.sin(AppState.time * 2) * 0.15; });

    // Traffic lights
    crosswalkGroup.traverse(function (c) {
        if (c.userData.trafficLight) {
            c.material.color.setHex(Math.sin(AppState.time * 1.5) > 0 ? 0x00ff44 : 0xff2222);
        }
    });

    renderer.render(scene, camera);
}

// ─── Sliders (separated: building sliders rebuild cells, others rebuild streets) ──
function setupSliders() {
    bind('slider-building-count', 'val-building-count', function (v) {
        // Regenerate building heights for building cells
        AppState.cells.forEach(function (cell) {
            if (cell.type === 'building') {
                while (cell.buildingHeights.length < Math.min(v, 6)) cell.buildingHeights.push(1 + Math.random() * (AppState.buildingMaxHeight - 1));
                while (cell.buildingHeights.length > Math.min(v, 6)) cell.buildingHeights.pop();
            }
        });
        buildAllCells();
        onInteract();
        return v;
    });
    bind('slider-building-height', 'val-building-height', function (v) {
        AppState.buildingMaxHeight = v;
        buildAllCells(); // only visual cap changes
        onInteract();
        return v;
    });
    bind('slider-ground-occupation', 'val-ground-occupation', function (v) {
        AppState.groundOccupation = v;
        buildAllCells();
        onInteract();
        return v + '%';
    });
    bind('slider-sidewalk', 'val-sidewalk', function (v) {
        AppState.sidewalkWidth = v;
        buildStreets(); // does NOT touch cells
        onInteract();
        return v + 'm';
    });
    bind('slider-connectivity', 'val-connectivity', function (v) {
        AppState.connectivity = v;
        buildStreets(); // rebuilds crosswalks/traffic lights, NOT cells
        onInteract();
        return v;
    });
    bind('slider-hw-ratio', 'val-hw-ratio', function (v) {
        AppState.hwRatio = v / 10;
        updateScaleVisual();
        onInteract();
        return (v / 10).toFixed(1);
    });
}

function bind(id, vid, handler) {
    var sl = document.getElementById(id);
    var vl = document.getElementById(vid);
    if (!sl) return;
    function update() { var r = handler(parseInt(sl.value)); if (vl) vl.textContent = r; }
    sl.addEventListener('input', update);
    update();
}

// ─── Flow Buttons ────────────────────────────────
function setupFlowButtons() {
    var btns = document.querySelectorAll('.flow-btn');
    btns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            btns.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            AppState.flowMode = btn.getAttribute('data-flow');
            buildStreets();
            spawnTraffic();
            onInteract();
        });
    });
}

// ─── Toggles ─────────────────────────────────────
function setupToolToggles() {
    document.querySelectorAll('.tool-header').forEach(function (h) {
        h.addEventListener('click', function (e) {
            if (e.target.closest('.flow-btn') || e.target.closest('.ua-slider') || e.target.closest('.palette-item')) return;
            var b = h.nextElementSibling;
            if (b && b.classList.contains('tool-body')) { b.classList.toggle('open'); h.classList.toggle('collapsed'); }
        });
    });
}
function setupConceptToggles() {
    document.querySelectorAll('.concept-header').forEach(function (h) {
        h.addEventListener('click', function () { h.classList.toggle('open'); var b = h.nextElementSibling; if (b) b.classList.toggle('open'); });
    });
}

// ─── Modal ───────────────────────────────────────
function setupModal() {
    var m = document.getElementById('tutorial-modal');
    var c = document.getElementById('modal-close');
    var s = document.getElementById('btn-start-sim');
    var h = document.getElementById('btn-help');
    function cls() { if (m) m.style.display = 'none'; }
    function opn() { if (m) m.style.display = 'flex'; }
    if (c) c.addEventListener('click', cls);
    if (s) s.addEventListener('click', cls);
    if (h) h.addEventListener('click', opn);
}

// ─── Reset ───────────────────────────────────────
function setupResetButton() {
    var btn = document.getElementById('btn-reset');
    if (!btn) return;
    btn.addEventListener('click', function () {
        AppState.buildingMaxHeight = 10;
        AppState.groundOccupation = 75;
        AppState.flowMode = 'pedestrian';
        AppState.sidewalkWidth = 2;
        AppState.connectivity = 3;
        AppState.hwRatio = 3.0;
        AppState.selectedTool = 'building';
        AppState.interactionCount = 0;

        setSlider('slider-building-count', 12);
        setSlider('slider-building-height', 10);
        setSlider('slider-ground-occupation', 75);
        setSlider('slider-sidewalk', 2);
        setSlider('slider-connectivity', 3);
        setSlider('slider-hw-ratio', 30);

        document.querySelectorAll('.flow-btn').forEach(function (b) { b.classList.remove('active'); });
        var ped = document.getElementById('btn-pedestrian'); if (ped) ped.classList.add('active');
        document.querySelectorAll('.palette-item').forEach(function (i) { i.classList.remove('active'); });
        var bld = document.querySelector('.palette-item[data-element="building"]'); if (bld) bld.classList.add('active');

        initGrid();
        buildStreets();
        buildAllCells();
        spawnTraffic();
        computeIndices();
        updateAllUI();
        setupSliders();
        updateScaleVisual();
    });
}

function setSlider(id, v) { var e = document.getElementById(id); if (e) e.value = v; }

// ─── Scale Visual ────────────────────────────────
function updateScaleVisual() {
    var b1 = document.getElementById('scale-building'), b2 = document.getElementById('scale-building-2');
    var st = document.getElementById('scale-street'), ind = document.getElementById('scale-indicator');
    if (!b1 || !st) return;
    var r = AppState.hwRatio;
    b1.style.height = Math.min(75, r * 20) + 'px';
    if (b2) b2.style.height = Math.min(75, r * 20) + 'px';
    st.style.width = Math.max(10, 60 / r) + 'px';
    var good = r >= 0.8 && r <= 1.8;
    if (ind) {
        ind.className = 'scale-indicator' + (good ? ' good' : '');
        var w = ind.querySelector('.scale-warning');
        if (w) w.innerHTML = good ? '<i class="fas fa-check-circle"></i> Escala humana adecuada' : '<i class="fas fa-exclamation-triangle"></i> Fuera de escala humana';
    }
}

// ─── Compute Indices ─────────────────────────────
function computeIndices() {
    var s = AppState;
    var buildingCells = s.cells.filter(function (c) { return c.type === 'building'; }).length;
    var totalCells = s.cells.length;
    var buildingRatio = buildingCells / totalCells;

    // Density: optimal around 50-60% building coverage
    s.indices.density = clamp(Math.round(100 - Math.abs(buildingRatio - 0.55) * 200), 0, 100);

    // Connectivity: based on slider + pedestrian streets
    var pedSt = s.streets.filter(function (st) { return st.ped; }).length;
    s.indices.connectivity = clamp(Math.round(s.connectivity * 8 + pedSt * 3), 0, 100);

    // Public space: count non-building, non-empty cells
    var parkCells = s.cells.filter(function (c) { return c.type === 'park'; }).length;
    var plazaCells = s.cells.filter(function (c) { return c.type === 'plaza'; }).length;
    var greenCells = s.cells.filter(function (c) { return c.type === 'green-belt'; }).length;
    var waterCells = s.cells.filter(function (c) { return c.type === 'water'; }).length;
    var types = new Set();
    if (parkCells > 0) types.add('park');
    if (plazaCells > 0) types.add('plaza');
    if (greenCells > 0) types.add('green-belt');
    if (waterCells > 0) types.add('water');
    var spaceScore = (parkCells + plazaCells + greenCells + waterCells) * 12 + types.size * 10;
    s.indices.publicSpace = clamp(Math.round(spaceScore), 0, 100);

    // Human Scale
    s.indices.humanScale = clamp(Math.round(100 - Math.abs(s.hwRatio - 1.2) * 35), 0, 100);

    // Pedestrian flow
    var fb = s.flowMode === 'pedestrian' ? 50 : s.flowMode === 'mixed' ? 25 : 5;
    s.indices.pedestrianFlow = clamp(Math.round(fb + s.sidewalkWidth * 5 + s.connectivity * 3), 0, 100);
}

// ─── Update UI ───────────────────────────────────
function updateAllUI() {
    var keys = [['density', AppState.indices.density], ['connectivity', AppState.indices.connectivity], ['public', AppState.indices.publicSpace], ['humanscale', AppState.indices.humanScale], ['pedestrian', AppState.indices.pedestrianFlow]];
    keys.forEach(function (p) {
        var fill = document.getElementById('gauge-fill-' + p[0]);
        var val = document.getElementById('gauge-val-' + p[0]);
        if (fill) { fill.style.strokeDashoffset = CIRC - (p[1] / 100) * CIRC; fill.setAttribute('class', 'gauge-fill ' + (p[1] < 40 ? 'low' : p[1] < 70 ? 'mid' : 'high')); }
        if (val) val.textContent = p[1];
    });
    var avg = Math.round((AppState.indices.density + AppState.indices.connectivity + AppState.indices.publicSpace + AppState.indices.humanScale + AppState.indices.pedestrianFlow) / 5);
    var mk = document.getElementById('result-marker'); if (mk) mk.style.left = avg + '%';
    var gs = document.getElementById('global-score'); if (gs) gs.textContent = avg;
    var badge = document.getElementById('equilibrium-badge'), statusEl = document.getElementById('city-status');
    var status, cls;
    if (avg >= 70) { status = 'Ciudad Equilibrada'; cls = 'balanced'; }
    else if (avg >= 40) { status = 'En Transición'; cls = 'transition'; }
    else { status = 'Ciudad Desequilibrada'; cls = 'unbalanced'; }
    if (badge) badge.className = 'equilibrium-badge ' + cls;
    if (statusEl) { statusEl.textContent = status; statusEl.className = 'badge-value ' + cls; }
    // Stats
    var parkC = AppState.cells.filter(function (c) { return c.type === 'park' || c.type === 'green-belt'; }).length;
    var waterC = AppState.cells.filter(function (c) { return c.type === 'water'; }).length;
    setStat('stat-vegetation', 'val-vegetation', clamp(parkC * 15 + waterC * 5, 0, 100));
    setStat('stat-accessibility', 'val-accessibility', clamp(AppState.sidewalkWidth * 8 + AppState.connectivity * 5, 0, 100));
    setStat('stat-connectivity', 'val-connectivity-stat', AppState.indices.connectivity);
    setStat('stat-humanscale', 'val-humanscale', AppState.indices.humanScale);
    // Feedback
    var card = document.getElementById('feedback-card'), text = document.getElementById('feedback-text');
    if (card && text) {
        var si = AppState.indices, fb2 = '', cls2 = 'feedback-card';
        if (avg >= 75) { fb2 = '¡Excelente! Has logrado un equilibrio urbano excepcional. 🌟'; cls2 += ' positive'; }
        else if (avg >= 55) { fb2 = 'Buen progreso. '; if (si.publicSpace < 50) fb2 += 'Más espacios verdes. '; if (si.humanScale < 50) fb2 += 'Ajusta H/W ≈ 1:1. '; }
        else if (avg >= 35) { fb2 = 'En transición. Concentra esfuerzos en los indicadores más bajos.'; cls2 += ' negative'; }
        else { fb2 = 'Estado crítico. '; if (si.density < 40) fb2 += '• Reduce densificación. '; if (si.publicSpace < 40) fb2 += '• Agrega espacios verdes. '; if (si.pedestrianFlow < 40) fb2 += '• Prioriza peatones. '; cls2 += ' negative'; }
        text.textContent = fb2; card.className = cls2;
    }
}

function setStat(bid, vid, v) { var b = document.getElementById(bid), vl = document.getElementById(vid); if (b) b.style.width = v + '%'; if (vl) vl.textContent = v + '%'; }
function onInteract() { AppState.interactionCount++; computeIndices(); updateAllUI(); }

// ─── Utilities ───────────────────────────────────
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function clearGroup(g) {
    while (g.children.length) {
        var c = g.children[0];
        if (c.children && c.children.length) clearGroup(c); // recurse into sub-groups
        if (c.geometry) c.geometry.dispose();
        if (c.material) {
            if (Array.isArray(c.material)) c.material.forEach(function (m) { m.dispose(); });
            else c.material.dispose();
        }
        g.remove(c);
    }
}
function lerpColor(a, b, t) { var ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff; var br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff; return ((ar + (br - ar) * t) << 16) | ((ag + (bg - ag) * t) << 8) | (ab + (bb - ab) * t); }
