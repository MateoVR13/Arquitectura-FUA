/* ============================================
   Urban Block Lab 3D — Core Application
   SimCity-inspired 3D Urban Design Simulator
   ============================================ */
(function () {
    'use strict';

    // ─── CONSTANTS ─────────────────────────────
    const GRID_SIZE = 16;
    const CELL_SIZE = 4;
    const GRID_TOTAL = GRID_SIZE * CELL_SIZE;
    const HALF_GRID = GRID_TOTAL / 2;
    const FLOOR_HEIGHT = 1.2;

    const CELL_TYPES = {
        EMPTY: 'empty',
        RESIDENTIAL: 'residential',
        COMMERCIAL: 'commercial',
        MIXED: 'mixed',
        INSTITUTIONAL: 'institutional',
        PLAZA: 'plaza',
        PARK: 'park',
        CORRIDOR: 'corridor',
        CORRIDOR_ELBOW: 'corridor_elbow',
        PATH: 'path',
        PATH_ELBOW: 'path_elbow'
    };

    const BUILDING_TYPES = ['residential', 'commercial', 'mixed', 'institutional'];

    const BUILDING_COLORS = {
        residential: { base: 0x4ecdc4, roof: 0x3db5ae },
        commercial: { base: 0xf7b731, roof: 0xd9a028 },
        mixed: { base: 0xa55eea, roof: 0x8e4fd0 },
        institutional: { base: 0xfc5c65, roof: 0xd94f56 }
    };

    const POPULATION_PER_FLOOR = { residential: 8, commercial: 12, mixed: 10, institutional: 15 };

    // ─── STATE ─────────────────────────────
    let grid = [];
    let selectedTool = null;
    let isDragging = false;
    let dragTarget = null;
    let dragStartPos = null;
    let mouseDownPos = { x: 0, y: 0 };
    let mouseDownTime = 0;
    let simulationActive = true;
    let pedestrians = [];
    let undoStack = [];
    let redoStack = [];
    let hintTimeout = null;
    var sidewalkMeshes = []; // track sidewalk meshes for rebuilding

    // ─── THREE.JS SETUP ─────────────────────────────
    const canvas = document.getElementById('viewport');
    const container = document.getElementById('viewport-container');

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e17);
    scene.fog = new THREE.FogExp2(0x0a0e17, 0.008);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);
    camera.position.set(50, 40, 50);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 15;
    controls.maxDistance = 120;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.target.set(0, 0, 0);
    controls.update();

    console.log('[UrbanLab] Three.js + OrbitControls initialized');

    // ─── LIGHTING ─────────────────────────────
    scene.add(new THREE.AmbientLight(0x404860, 0.6));

    const dirLight = new THREE.DirectionalLight(0xffeedd, 1.0);
    dirLight.position.set(30, 50, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.camera.left = -60;
    dirLight.shadow.camera.right = 60;
    dirLight.shadow.camera.top = 60;
    dirLight.shadow.camera.bottom = -60;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 120;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    scene.add(new THREE.HemisphereLight(0x87ceeb, 0x362a1e, 0.4));

    var rimLight = new THREE.DirectionalLight(0x4ecdc4, 0.15);
    rimLight.position.set(-20, 30, -30);
    scene.add(rimLight);

    // ─── GROUND ─────────────────────────────
    var ground = new THREE.Mesh(
        new THREE.PlaneGeometry(GRID_TOTAL + 20, GRID_TOTAL + 20),
        new THREE.MeshStandardMaterial({ color: 0x1a1f2e, roughness: 0.95, metalness: 0.05 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    scene.add(ground);

    var gridHelper = new THREE.GridHelper(GRID_TOTAL, GRID_SIZE, 0x2a3050, 0x1e2640);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Cell highlight
    var cellHighlight = new THREE.Mesh(
        new THREE.PlaneGeometry(CELL_SIZE - 0.1, CELL_SIZE - 0.1),
        new THREE.MeshBasicMaterial({ color: 0x4ecdc4, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
    );
    cellHighlight.rotation.x = -Math.PI / 2;
    cellHighlight.position.y = 0.05;
    cellHighlight.visible = false;
    scene.add(cellHighlight);

    // Street borders & sidewalks
    createStreetBorders();
    buildSidewalks();

    // ─── RAYCASTER ─────────────────────────────
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    // ─── HELPER FUNCTIONS ─────────────────────────────
    function isBuildingType(type) {
        return BUILDING_TYPES.indexOf(type) !== -1;
    }

    function isBuildingAt(r, c) {
        return r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && isBuildingType(grid[r][c].type);
    }

    function clamp(v) { return Math.min(100, Math.max(0, v)); }

    function cellToWorld(row, col) {
        return {
            x: (col - GRID_SIZE / 2 + 0.5) * CELL_SIZE,
            z: (row - GRID_SIZE / 2 + 0.5) * CELL_SIZE
        };
    }

    function worldToCell(x, z) {
        var col = Math.floor(x / CELL_SIZE + GRID_SIZE / 2);
        var row = Math.floor(z / CELL_SIZE + GRID_SIZE / 2);
        if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) return { row: row, col: col };
        return null;
    }

    function countBuildings() {
        var n = 0;
        for (var r = 0; r < GRID_SIZE; r++)
            for (var c = 0; c < GRID_SIZE; c++)
                if (isBuildingAt(r, c)) n++;
        return n;
    }

    // ─── GRID ─────────────────────────────
    function initGrid() {
        grid = [];
        for (var r = 0; r < GRID_SIZE; r++) {
            grid[r] = [];
            for (var c = 0; c < GRID_SIZE; c++) {
                grid[r][c] = { type: CELL_TYPES.EMPTY, floors: 0, rotation: 0, meshGroup: null, row: r, col: c };
            }
        }
    }

    // ─── STREET BORDERS ─────────────────────────────
    function createStreetBorders() {
        var streetMat = new THREE.MeshStandardMaterial({ color: 0x2c3040, roughness: 0.9 });
        var bw = 3;
        var borders = [
            { x: 0, z: -(HALF_GRID + bw / 2), sx: GRID_TOTAL + bw * 2, sz: bw },
            { x: 0, z: (HALF_GRID + bw / 2), sx: GRID_TOTAL + bw * 2, sz: bw },
            { x: -(HALF_GRID + bw / 2), z: 0, sx: bw, sz: GRID_TOTAL },
            { x: (HALF_GRID + bw / 2), z: 0, sx: bw, sz: GRID_TOTAL },
        ];
        borders.forEach(function (p) {
            var m = new THREE.Mesh(new THREE.BoxGeometry(p.sx, 0.15, p.sz), streetMat);
            m.position.set(p.x, 0.07, p.z);
            m.receiveShadow = true;
            scene.add(m);
        });

        var dashMat = new THREE.MeshBasicMaterial({ color: 0x4a5568 });
        for (var side = 0; side < 4; side++) {
            for (var i = 0; i < 20; i++) {
                var horiz = side < 2;
                var geo = new THREE.BoxGeometry(horiz ? 1.5 : 0.12, 0.02, horiz ? 0.12 : 1.5);
                var dash = new THREE.Mesh(geo, dashMat);
                var t = (i / 19) * GRID_TOTAL - HALF_GRID;
                if (side === 0) dash.position.set(t, 0.16, -(HALF_GRID + bw / 2));
                else if (side === 1) dash.position.set(t, 0.16, (HALF_GRID + bw / 2));
                else if (side === 2) dash.position.set(-(HALF_GRID + bw / 2), 0.16, t);
                else dash.position.set((HALF_GRID + bw / 2), 0.16, t);
                scene.add(dash);
            }
        }
    }

    // ─── SIDEWALKS ─────────────────────────────
    function buildSidewalks() {
        // Remove old sidewalks
        for (var i = 0; i < sidewalkMeshes.length; i++) scene.remove(sidewalkMeshes[i]);
        sidewalkMeshes = [];

        var sw = parseFloat(document.getElementById('sliderSidewalk').value) || 2;
        var swWidth = sw * 0.35; // scale: 1=0.35, 5=1.75
        if (swWidth < 0.1) return;

        var sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x505868, roughness: 0.8, metalness: 0.05 });
        var curbMat = new THREE.MeshStandardMaterial({ color: 0x606878, roughness: 0.7 });
        var bw = 3; // border width (street)

        // Four sidewalk strips along the perimeter roads (inside edge)
        var strips = [
            // bottom (south)
            { x: 0, z: -(HALF_GRID - swWidth / 2), sx: GRID_TOTAL, sz: swWidth },
            // top (north)
            { x: 0, z: (HALF_GRID - swWidth / 2), sx: GRID_TOTAL, sz: swWidth },
            // left (west)
            { x: -(HALF_GRID - swWidth / 2), z: 0, sx: swWidth, sz: GRID_TOTAL - swWidth * 2 },
            // right (east)
            { x: (HALF_GRID - swWidth / 2), z: 0, sx: swWidth, sz: GRID_TOTAL - swWidth * 2 },
        ];

        for (var s = 0; s < strips.length; s++) {
            var p = strips[s];
            // sidewalk surface (raised slightly)
            var surf = new THREE.Mesh(new THREE.BoxGeometry(p.sx, 0.12, p.sz), sidewalkMat);
            surf.position.set(p.x, 0.06, p.z);
            surf.receiveShadow = true;
            scene.add(surf);
            sidewalkMeshes.push(surf);

            // curb edge (thin raised strip on street side)
            var curbSx = s < 2 ? p.sx : 0.06;
            var curbSz = s < 2 ? 0.06 : p.sz;
            var curbX = p.x + (s === 2 ? -swWidth / 2 : s === 3 ? swWidth / 2 : 0);
            var curbZ = p.z + (s === 0 ? -swWidth / 2 : s === 1 ? swWidth / 2 : 0);
            var curb = new THREE.Mesh(new THREE.BoxGeometry(curbSx, 0.18, curbSz), curbMat);
            curb.position.set(curbX, 0.09, curbZ);
            scene.add(curb);
            sidewalkMeshes.push(curb);
        }
    }

    // ─── BUILDING GEOMETRY ─────────────────────────────
    function createBuilding(type, floors, wx, wz) {
        var group = new THREE.Group();
        var colors = BUILDING_COLORS[type];
        var w = CELL_SIZE * 0.75;
        var d = CELL_SIZE * 0.75;
        var h = floors * FLOOR_HEIGHT;

        var body = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, d),
            new THREE.MeshStandardMaterial({ color: colors.base, roughness: 0.7, metalness: 0.1 })
        );
        body.position.y = h / 2;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        var winLit = new THREE.MeshBasicMaterial({ color: 0xfff4d6 });
        var winDark = new THREE.MeshBasicMaterial({ color: 0x2a3050 });
        var wGeo = new THREE.BoxGeometry(w / 6, FLOOR_HEIGHT * 0.4, 0.05);

        for (var f = 0; f < floors; f++) {
            var wy = f * FLOOR_HEIGHT + FLOOR_HEIGHT * 0.5;
            for (var i = 0; i < 3; i++) {
                var wx2 = (i - 1) * (w / 3.5);
                var wf = new THREE.Mesh(wGeo, Math.random() > 0.35 ? winLit : winDark);
                wf.position.set(wx2, wy, d / 2 + 0.03);
                group.add(wf);
                var wb = new THREE.Mesh(wGeo, Math.random() > 0.35 ? winLit : winDark);
                wb.position.set(wx2, wy, -(d / 2 + 0.03));
                group.add(wb);
            }
        }

        var roofExtra = type === 'institutional' ? 0.3 : 0.1;
        var roofH = type === 'institutional' ? 0.3 : 0.2;
        var roof = new THREE.Mesh(
            new THREE.BoxGeometry(w + roofExtra, roofH, d + roofExtra),
            new THREE.MeshStandardMaterial({ color: colors.roof, roughness: 0.5 })
        );
        roof.position.y = h + roofH / 2;
        roof.castShadow = true;
        group.add(roof);

        var lineMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.15 });
        for (var fl = 1; fl < floors; fl++) {
            var line = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, 0.04, d + 0.02), lineMat);
            line.position.y = fl * FLOOR_HEIGHT;
            group.add(line);
        }

        group.position.set(wx, 0, wz);
        return group;
    }

    // ─── TREE ─────────────────────────────
    function createTree(scale) {
        scale = scale || 1;
        var tree = new THREE.Group();
        var trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08 * scale, 0.12 * scale, 1.0 * scale, 6),
            new THREE.MeshStandardMaterial({ color: 0x5a3e28, roughness: 0.9 })
        );
        trunk.position.y = 0.5 * scale;
        trunk.castShadow = true;
        tree.add(trunk);

        var foliageMat = new THREE.MeshStandardMaterial({ color: 0x2d6b30, roughness: 0.85 });
        var layers = [[0.6, 0.8, 1.2], [0.45, 0.7, 1.7], [0.3, 0.5, 2.1]];
        layers.forEach(function (l) {
            var f = new THREE.Mesh(new THREE.ConeGeometry(l[0] * scale, l[1] * scale, 7), foliageMat);
            f.position.y = l[2] * scale;
            f.castShadow = true;
            tree.add(f);
        });
        return tree;
    }

    // ─── PUBLIC SPACE GEOMETRY ─────────────────────────────
    // rotation: 0=North-South, 1=East-West, 2=South-North, 3=West-East
    function createPublicSpace(type, wx, wz, rotation) {
        var group = new THREE.Group();
        var size = CELL_SIZE * 0.92;
        var rot = rotation || 0;

        if (type === CELL_TYPES.PLAZA) {
            var base = new THREE.Mesh(
                new THREE.BoxGeometry(size, 0.12, size),
                new THREE.MeshStandardMaterial({ color: 0x8a9a7c, roughness: 0.85 })
            );
            base.position.y = 0.06;
            base.receiveShadow = true;
            group.add(base);

            var benchMat = new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 0.9 });
            for (var i = 0; i < 4; i++) {
                var b = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.3), benchMat);
                var a = (i / 4) * Math.PI * 2;
                b.position.set(Math.cos(a) * size * 0.3, 0.27, Math.sin(a) * size * 0.3);
                b.rotation.y = a;
                b.castShadow = true;
                group.add(b);
            }

            var fountain = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.6, 0.4, 12),
                new THREE.MeshStandardMaterial({ color: 0x607888, roughness: 0.3, metalness: 0.4 })
            );
            fountain.position.y = 0.32;
            fountain.castShadow = true;
            group.add(fountain);

        } else if (type === CELL_TYPES.PARK) {
            var grass = new THREE.Mesh(
                new THREE.BoxGeometry(size, 0.1, size),
                new THREE.MeshStandardMaterial({ color: 0x3a7a40, roughness: 0.95 })
            );
            grass.position.y = 0.05;
            grass.receiveShadow = true;
            group.add(grass);

            var treePos = [[-0.25, -0.25], [0.25, 0.25], [-0.25, 0.2], [0.2, -0.3]];
            treePos.forEach(function (tp) {
                var t = createTree(1);
                t.position.set(tp[0] * size, 0.1, tp[1] * size);
                group.add(t);
            });

        } else if (type === CELL_TYPES.CORRIDOR) {
            // Build in default N-S direction, rotation applied to group
            // Green base strip
            var corrBase = new THREE.Mesh(
                new THREE.BoxGeometry(size * 0.7, 0.08, size),
                new THREE.MeshStandardMaterial({ color: 0x557755, roughness: 0.9 })
            );
            corrBase.position.y = 0.04;
            corrBase.receiveShadow = true;
            group.add(corrBase);

            // Center stone path
            var pathM = new THREE.Mesh(
                new THREE.BoxGeometry(size * 0.25, 0.1, size),
                new THREE.MeshStandardMaterial({ color: 0x8a8a78, roughness: 0.85 })
            );
            pathM.position.y = 0.05;
            pathM.receiveShadow = true;
            group.add(pathM);

            // Trees along sides
            [-1, 1].forEach(function (s) {
                var t = createTree(0.7);
                t.position.set(s * size * 0.25, 0.08, 0);
                group.add(t);
            });

            // Direction arrow on the path
            var arrowMat = new THREE.MeshBasicMaterial({ color: 0xbbddbb, transparent: true, opacity: 0.5 });
            var arrowShape = new THREE.Shape();
            arrowShape.moveTo(0, size * 0.35);
            arrowShape.lineTo(size * 0.08, size * 0.2);
            arrowShape.lineTo(-size * 0.08, size * 0.2);
            arrowShape.closePath();
            var arrowGeo = new THREE.ShapeGeometry(arrowShape);
            var arrow = new THREE.Mesh(arrowGeo, arrowMat);
            arrow.rotation.x = -Math.PI / 2;
            arrow.position.y = 0.11;
            group.add(arrow);

        } else if (type === CELL_TYPES.PATH) {
            // Pedestrian path — built N-S, rotation applied to group
            var pathMesh = new THREE.Mesh(
                new THREE.BoxGeometry(size * 0.45, 0.08, size),
                new THREE.MeshStandardMaterial({ color: 0x707878, roughness: 0.85 })
            );
            pathMesh.position.y = 0.04;
            pathMesh.receiveShadow = true;
            group.add(pathMesh);

            // Crosswalk stripes
            var cwMat = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
            for (var ci = -2; ci <= 2; ci++) {
                var cw = new THREE.Mesh(new THREE.BoxGeometry(size * 0.4, 0.01, 0.15), cwMat);
                cw.position.set(0, 0.09, ci * 0.5);
                group.add(cw);
            }

            // Direction arrow
            var arrMat = new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.4 });
            var arrShape = new THREE.Shape();
            arrShape.moveTo(0, size * 0.35);
            arrShape.lineTo(size * 0.06, size * 0.2);
            arrShape.lineTo(-size * 0.06, size * 0.2);
            arrShape.closePath();
            var arrGeo = new THREE.ShapeGeometry(arrShape);
            var arr = new THREE.Mesh(arrGeo, arrMat);
            arr.rotation.x = -Math.PI / 2;
            arr.position.y = 0.09;
            group.add(arr);
        } else if (type === CELL_TYPES.CORRIDOR_ELBOW) {
            // L-shaped green corridor: runs along -Z then turns to +X
            var elbowGreenMat = new THREE.MeshStandardMaterial({ color: 0x557755, roughness: 0.9 });
            var elbowPathMat = new THREE.MeshStandardMaterial({ color: 0x8a8a78, roughness: 0.85 });
            var hw = size * 0.35; // half-width of corridor strip

            // Vertical leg (south half: center to -Z edge)
            var legV = new THREE.Mesh(new THREE.BoxGeometry(size * 0.7, 0.08, size * 0.5 + hw), elbowGreenMat);
            legV.position.set(0, 0.04, -(size * 0.5 - (size * 0.5 + hw) / 2));
            legV.receiveShadow = true;
            group.add(legV);
            var pathV = new THREE.Mesh(new THREE.BoxGeometry(size * 0.25, 0.1, size * 0.5 + hw), elbowPathMat);
            pathV.position.set(0, 0.05, legV.position.z);
            pathV.receiveShadow = true;
            group.add(pathV);

            // Horizontal leg (east half: center to +X edge)
            var legH = new THREE.Mesh(new THREE.BoxGeometry(size * 0.5 + hw, 0.08, size * 0.7), elbowGreenMat);
            legH.position.set(size * 0.5 - (size * 0.5 + hw) / 2, 0.04, 0);
            legH.receiveShadow = true;
            group.add(legH);
            var pathH = new THREE.Mesh(new THREE.BoxGeometry(size * 0.5 + hw, 0.1, size * 0.25), elbowPathMat);
            pathH.position.set(legH.position.x, 0.05, 0);
            pathH.receiveShadow = true;
            group.add(pathH);

            // Corner tree
            var ct = createTree(0.6);
            ct.position.set(-size * 0.25, 0.08, size * 0.25);
            group.add(ct);

            // Corner arrow (curved L indicator)
            var caMat = new THREE.MeshBasicMaterial({ color: 0xbbddbb, transparent: true, opacity: 0.5 });
            var caShape = new THREE.Shape();
            caShape.moveTo(0, -size * 0.3);
            caShape.lineTo(size * 0.06, -size * 0.2);
            caShape.lineTo(-size * 0.06, -size * 0.2);
            caShape.closePath();
            var ca1 = new THREE.Mesh(new THREE.ShapeGeometry(caShape), caMat);
            ca1.rotation.x = -Math.PI / 2;
            ca1.position.set(0, 0.11, -size * 0.05);
            group.add(ca1);
            var ca2Shape = new THREE.Shape();
            ca2Shape.moveTo(size * 0.3, 0);
            ca2Shape.lineTo(size * 0.2, size * 0.06);
            ca2Shape.lineTo(size * 0.2, -size * 0.06);
            ca2Shape.closePath();
            var ca2 = new THREE.Mesh(new THREE.ShapeGeometry(ca2Shape), caMat);
            ca2.rotation.x = -Math.PI / 2;
            ca2.position.set(size * 0.05, 0.11, 0);
            group.add(ca2);

        } else if (type === CELL_TYPES.PATH_ELBOW) {
            // L-shaped pedestrian path
            var elbowPMat = new THREE.MeshStandardMaterial({ color: 0x707878, roughness: 0.85 });
            var phw = size * 0.225;

            // Vertical leg (south)
            var pLegV = new THREE.Mesh(new THREE.BoxGeometry(size * 0.45, 0.08, size * 0.5 + phw), elbowPMat);
            pLegV.position.set(0, 0.04, -(size * 0.5 - (size * 0.5 + phw) / 2));
            pLegV.receiveShadow = true;
            group.add(pLegV);

            // Horizontal leg (east)
            var pLegH = new THREE.Mesh(new THREE.BoxGeometry(size * 0.5 + phw, 0.08, size * 0.45), elbowPMat);
            pLegH.position.set(size * 0.5 - (size * 0.5 + phw) / 2, 0.04, 0);
            pLegH.receiveShadow = true;
            group.add(pLegH);

            // Stripes on vertical leg
            var sCwMat = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
            for (var si = -1; si <= 1; si++) {
                var sw = new THREE.Mesh(new THREE.BoxGeometry(size * 0.4, 0.01, 0.12), sCwMat);
                sw.position.set(0, 0.09, -size * 0.2 + si * 0.3);
                group.add(sw);
            }
            // Stripes on horizontal leg
            for (var sj = -1; sj <= 1; sj++) {
                var sh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.01, size * 0.4), sCwMat);
                sh.position.set(size * 0.2 + sj * 0.3, 0.09, 0);
                group.add(sh);
            }

            // Corner arrows
            var paMat = new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.4 });
            var paS = new THREE.Shape();
            paS.moveTo(0, -size * 0.3);
            paS.lineTo(size * 0.05, -size * 0.2);
            paS.lineTo(-size * 0.05, -size * 0.2);
            paS.closePath();
            var pa1 = new THREE.Mesh(new THREE.ShapeGeometry(paS), paMat);
            pa1.rotation.x = -Math.PI / 2;
            pa1.position.set(0, 0.09, -size * 0.05);
            group.add(pa1);
            var paS2 = new THREE.Shape();
            paS2.moveTo(size * 0.3, 0);
            paS2.lineTo(size * 0.2, size * 0.05);
            paS2.lineTo(size * 0.2, -size * 0.05);
            paS2.closePath();
            var pa2 = new THREE.Mesh(new THREE.ShapeGeometry(paS2), paMat);
            pa2.rotation.x = -Math.PI / 2;
            pa2.position.set(size * 0.05, 0.09, 0);
            group.add(pa2);
        }

        // Apply rotation (0=0°, 1=90°, 2=180°, 3=270°)
        group.rotation.y = rot * (Math.PI / 2);
        group.position.set(wx, 0, wz);
        return group;
    }

    // Rotate an existing cell's corridor/path by 90°
    function rotateCellElement(row, col) {
        var cell = grid[row][col];
        var rotatableTypes = [CELL_TYPES.CORRIDOR, CELL_TYPES.PATH, CELL_TYPES.CORRIDOR_ELBOW, CELL_TYPES.PATH_ELBOW];
        if (rotatableTypes.indexOf(cell.type) === -1) return;
        saveUndoState();
        cell.rotation = (cell.rotation + 1) % 4;
        // Rebuild mesh with new rotation
        if (cell.meshGroup) scene.remove(cell.meshGroup);
        var pos = cellToWorld(row, col);
        cell.meshGroup = createPublicSpace(cell.type, pos.x, pos.z, cell.rotation);
        scene.add(cell.meshGroup);
        var dirNames = ['↙ Sur-Este', '↘ Norte-Este', '↗ Norte-Oeste', '↖ Sur-Oeste'];
        var straightNames = ['Norte-Sur ↕', 'Este-Oeste ↔', 'Sur-Norte ↕', 'Oeste-Este ↔'];
        var isElbow = cell.type === CELL_TYPES.CORRIDOR_ELBOW || cell.type === CELL_TYPES.PATH_ELBOW;
        showToast('🔄 Rotado a: ' + (isElbow ? dirNames : straightNames)[cell.rotation]);
        console.log('[UrbanLab] Rotated [' + row + ',' + col + '] to rotation ' + cell.rotation);
    }

    // ─── UNDO / REDO ─────────────────────────────
    function saveUndoState() {
        var state = grid.map(function (row) {
            return row.map(function (cell) { return { type: cell.type, floors: cell.floors, rotation: cell.rotation || 0 }; });
        });
        undoStack.push(state);
        if (undoStack.length > 30) undoStack.shift();
        redoStack = [];
    }

    function getState() {
        return grid.map(function (row) {
            return row.map(function (cell) { return { type: cell.type, floors: cell.floors, rotation: cell.rotation || 0 }; });
        });
    }

    function restoreState(state) {
        for (var r = 0; r < GRID_SIZE; r++)
            for (var c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c].meshGroup) { scene.remove(grid[r][c].meshGroup); grid[r][c].meshGroup = null; }
            }
        for (var r2 = 0; r2 < GRID_SIZE; r2++)
            for (var c2 = 0; c2 < GRID_SIZE; c2++) {
                var s = state[r2][c2];
                grid[r2][c2].type = s.type;
                grid[r2][c2].floors = s.floors;
                grid[r2][c2].rotation = s.rotation || 0;
                if (s.type !== CELL_TYPES.EMPTY) {
                    var pos = cellToWorld(r2, c2);
                    if (isBuildingType(s.type))
                        grid[r2][c2].meshGroup = createBuilding(s.type, s.floors, pos.x, pos.z);
                    else
                        grid[r2][c2].meshGroup = createPublicSpace(s.type, pos.x, pos.z, s.rotation || 0);
                    scene.add(grid[r2][c2].meshGroup);
                }
            }
        recalculateIndicators();
        updateMinimap();
    }

    function undo() {
        if (!undoStack.length) return;
        redoStack.push(getState());
        restoreState(undoStack.pop());
    }

    function redo() {
        if (!redoStack.length) return;
        undoStack.push(getState());
        restoreState(redoStack.pop());
    }

    // ─── CELL OPERATIONS ─────────────────────────────
    function placeOnCell(row, col, type, floors) {
        var cell = grid[row][col];
        saveUndoState();
        if (cell.meshGroup) { scene.remove(cell.meshGroup); cell.meshGroup = null; }
        var pos = cellToWorld(row, col);

        if (type === CELL_TYPES.EMPTY) {
            cell.type = CELL_TYPES.EMPTY; cell.floors = 0; cell.rotation = 0;
        } else if (isBuildingType(type)) {
            cell.type = type;
            cell.floors = floors || 3;
            cell.rotation = 0;
            cell.meshGroup = createBuilding(type, cell.floors, pos.x, pos.z);
            scene.add(cell.meshGroup);
        } else {
            cell.type = type;
            cell.floors = 0;
            cell.rotation = 0;
            cell.meshGroup = createPublicSpace(type, pos.x, pos.z, 0);
            scene.add(cell.meshGroup);
        }
        recalculateIndicators();
        updateMinimap();
        showContextualTip(type);
        console.log('[UrbanLab] Placed ' + type + ' at [' + row + ',' + col + ']');
    }

    function removeFromCell(row, col) {
        var cell = grid[row][col];
        if (cell.type === CELL_TYPES.EMPTY) return;
        saveUndoState();
        if (cell.meshGroup) { scene.remove(cell.meshGroup); cell.meshGroup = null; }
        cell.type = CELL_TYPES.EMPTY;
        cell.rotation = 0;
        cell.floors = 0;
        recalculateIndicators();
        updateMinimap();
        console.log('[UrbanLab] Removed [' + row + ',' + col + ']');
    }

    function moveBuilding(fromR, fromC, toR, toC) {
        var from = grid[fromR][fromC];
        var to = grid[toR][toC];
        if (to.type !== CELL_TYPES.EMPTY) return false;
        saveUndoState();
        var pos = cellToWorld(toR, toC);
        if (from.meshGroup) from.meshGroup.position.set(pos.x, 0, pos.z);
        to.type = from.type; to.floors = from.floors; to.meshGroup = from.meshGroup;
        from.type = CELL_TYPES.EMPTY; from.floors = 0; from.meshGroup = null;
        recalculateIndicators();
        updateMinimap();
        return true;
    }

    // ─── GENERATE DETERIORATED CITY ─────────────────────────────
    function generateDeterioratedCity() {
        initGrid();
        var types = ['residential', 'commercial', 'mixed', 'institutional'];
        var center = GRID_SIZE / 2;

        for (var r = 3; r < GRID_SIZE - 3; r++) {
            for (var c = 3; c < GRID_SIZE - 3; c++) {
                var dist = Math.abs(r - center) + Math.abs(c - center);
                var prob = dist < 4 ? 0.9 : dist < 6 ? 0.6 : 0.3;
                if (Math.random() < prob) {
                    var type = types[Math.floor(Math.random() * types.length)];
                    var floors = dist < 3 ? Math.floor(Math.random() * 5) + 5 : Math.floor(Math.random() * 3) + 2;
                    var pos = cellToWorld(r, c);
                    grid[r][c].type = type;
                    grid[r][c].floors = floors;
                    grid[r][c].meshGroup = createBuilding(type, floors, pos.x, pos.z);
                    scene.add(grid[r][c].meshGroup);
                }
            }
        }
        recalculateIndicators();
        updateMinimap();
        showToast('🏚️ Sector urbano deteriorado — ¡Mejóralo con tus herramientas!');
        console.log('[UrbanLab] City generated ✓');
    }

    // ─── INDICATORS ─────────────────────────────
    function recalculateIndicators() {
        var total = GRID_SIZE * GRID_SIZE;
        var bCount = 0, pubCount = 0, emptyCount = 0, totalFloors = 0, pathCount = 0, population = 0;

        for (var r = 0; r < GRID_SIZE; r++) {
            for (var c = 0; c < GRID_SIZE; c++) {
                var t = grid[r][c].type;
                if (t === CELL_TYPES.EMPTY) { emptyCount++; continue; }
                if (t === CELL_TYPES.PLAZA || t === CELL_TYPES.PARK) { pubCount++; continue; }
                if (t === CELL_TYPES.CORRIDOR || t === CELL_TYPES.PATH || t === CELL_TYPES.CORRIDOR_ELBOW || t === CELL_TYPES.PATH_ELBOW) { pathCount++; pubCount++; continue; }
                bCount++;
                totalFloors += grid[r][c].floors;
                population += (POPULATION_PER_FLOOR[t] || 8) * grid[r][c].floors;
            }
        }

        // 1. Density
        var bRatio = bCount / total;
        var density = bRatio < 0.15 ? (bRatio / 0.15) * 50
            : bRatio <= 0.5 ? 50 + ((bRatio - 0.15) / 0.35) * 50
                : Math.max(0, 100 - (bRatio - 0.5) * 300);
        density = clamp(density);

        // 2. Human Scale
        var avgFloors = bCount > 0 ? totalFloors / bCount : 0;
        var openRatio = (emptyCount + pubCount) / total;
        var scale;
        if (bCount === 0) scale = 50;
        else {
            var hPen = avgFloors > 6 ? (avgFloors - 6) * 12 : avgFloors < 2 ? (2 - avgFloors) * 20 : 0;
            scale = clamp(80 + openRatio * 40 - hPen);
        }

        // 3. Permeability
        var connections = 0;
        var dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (var r2 = 0; r2 < GRID_SIZE; r2++) {
            for (var c2 = 0; c2 < GRID_SIZE; c2++) {
                if (!isBuildingAt(r2, c2) && grid[r2][c2].type !== CELL_TYPES.EMPTY) {
                    for (var d = 0; d < dirs.length; d++) {
                        var nr = r2 + dirs[d][0], nc = c2 + dirs[d][1];
                        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && !isBuildingAt(nr, nc) && grid[nr][nc].type !== CELL_TYPES.EMPTY) {
                            connections++;
                        }
                    }
                }
            }
        }
        var permeability = clamp((connections / Math.max(1, total * 2)) * 500);

        // 4. Public Space
        var pubRatio = pubCount / total;
        var pubScore = pubRatio < 0.05 ? (pubRatio / 0.05) * 30
            : pubRatio <= 0.3 ? 30 + ((pubRatio - 0.05) / 0.25) * 70 : 100;
        pubScore = clamp(pubScore);

        // 5. Connectivity (BFS)
        var connectivity = calcConnectivity();

        var overall = Math.round(density * 0.2 + scale * 0.2 + permeability * 0.2 + pubScore * 0.2 + connectivity * 0.2);

        updateIndicatorUI('Density', density);
        updateIndicatorUI('Scale', scale);
        updateIndicatorUI('Permeability', permeability);
        updateIndicatorUI('PublicSpace', pubScore);
        updateIndicatorUI('Connectivity', connectivity);
        updateOverallScore(overall);
        updateCityState(overall);
        updatePopulation(population, pathCount + pubCount);
        updateActivityMeter(overall, pubCount);
    }

    function calcConnectivity() {
        var visited = [];
        for (var r = 0; r < GRID_SIZE; r++) {
            visited[r] = [];
            for (var c = 0; c < GRID_SIZE; c++) visited[r][c] = false;
        }
        var queue = [];
        for (var r2 = 0; r2 < GRID_SIZE; r2++) {
            for (var c2 = 0; c2 < GRID_SIZE; c2++) {
                if ((r2 === 0 || r2 === GRID_SIZE - 1 || c2 === 0 || c2 === GRID_SIZE - 1) && !isBuildingAt(r2, c2)) {
                    queue.push([r2, c2]);
                    visited[r2][c2] = true;
                }
            }
        }
        var reachable = 0;
        var dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        while (queue.length > 0) {
            var cur = queue.shift();
            reachable++;
            for (var d = 0; d < dirs.length; d++) {
                var nr = cur[0] + dirs[d][0], nc = cur[1] + dirs[d][1];
                if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && !visited[nr][nc] && !isBuildingAt(nr, nc)) {
                    visited[nr][nc] = true;
                    queue.push([nr, nc]);
                }
            }
        }
        var nonB = GRID_SIZE * GRID_SIZE - countBuildings();
        return nonB === 0 ? 0 : clamp((reachable / nonB) * 100);
    }

    // ─── UI UPDATES ─────────────────────────────
    function updateIndicatorUI(name, value) {
        var val = Math.round(value);
        var el = document.getElementById('ind' + name);
        var bar = document.getElementById('bar' + name);
        if (!el || !bar) return;
        el.textContent = val;
        bar.style.width = val + '%';
        bar.style.background = val < 30 ? 'linear-gradient(90deg, #eb3b5a, #fc5c65)'
            : val < 60 ? 'linear-gradient(90deg, #f7b731, #fed330)'
                : 'linear-gradient(90deg, #4ecdc4, #26de81)';
    }

    function updateOverallScore(score) {
        var numEl = document.getElementById('scoreNumber');
        var ring = document.getElementById('scoreRing');
        if (!numEl || !ring) return;
        numEl.textContent = score;
        var circ = 2 * Math.PI * 52;
        ring.style.strokeDashoffset = (circ - (score / 100) * circ) + '';
        ring.style.stroke = score < 30 ? '#eb3b5a' : score < 50 ? '#f7b731' : score < 75 ? '#4ecdc4' : '#26de81';
    }

    function updateCityState(score) {
        var badge = document.getElementById('cityStateBadge');
        var label = badge.querySelector('.state-label');
        var state, text;
        if (score < 25) { state = 'fragmentado'; text = 'Barrio Fragmentado'; }
        else if (score < 50) { state = 'transicion'; text = 'Barrio en Transición'; }
        else if (score < 75) { state = 'equilibrado'; text = 'Barrio Equilibrado'; }
        else { state = 'vibrante'; text = 'Barrio Vibrante'; }
        // Notify parent (ArquiLab) that exercise is complete when score >= 70 (only once)
        if (score >= 70 && !window._b4ex2Done && window.parent && window.parent !== window) {
            window._b4ex2Done = true;
            window.parent.postMessage({ type: 'exercise-complete', exercise: 'b4_ex2' }, '*');
        }
        badge.setAttribute('data-state', state);
        label.textContent = text;
    }

    function updatePopulation(pop, walkable) {
        document.getElementById('popHabitantes').textContent = pop.toLocaleString();
        document.getElementById('popPeatones').textContent = Math.floor(pop * 0.3 * (walkable / (GRID_SIZE * GRID_SIZE) + 0.1)).toLocaleString();
    }

    function updateActivityMeter(score, pubSpaces) {
        var bar = document.getElementById('activityBar');
        var label = document.getElementById('activityLabel');
        var act = Math.min(100, score * 0.5 + pubSpaces * 8);
        bar.style.width = act + '%';
        label.textContent = act < 20 ? 'Sin actividad' : act < 40 ? 'Actividad baja'
            : act < 60 ? 'Actividad moderada' : act < 80 ? 'Actividad alta' : '¡Ciudad vibrante!';
    }

    // ─── PEDESTRIANS ─────────────────────────────
    var pedestrianGroup = new THREE.Group();
    scene.add(pedestrianGroup);

    function createPedestrian(x, z) {
        var colors = [0x4ecdc4, 0xf7b731, 0xa55eea, 0xfc5c65, 0x26de81, 0xffffff];
        var color = colors[Math.floor(Math.random() * colors.length)];
        var mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 6, 6),
            new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.3 })
        );
        mesh.position.set(x, 0.2, z);
        mesh.castShadow = true;
        var angle = Math.random() * Math.PI * 2;
        var speed = 0.015 + Math.random() * 0.02;
        return { mesh: mesh, vx: Math.cos(angle) * speed, vz: Math.sin(angle) * speed, phase: Math.random() * Math.PI * 2 };
    }

    function updatePedestrians() {
        if (!simulationActive) return;

        var totalPop = 0;
        var walkable = [];
        for (var r = 0; r < GRID_SIZE; r++) {
            for (var c = 0; c < GRID_SIZE; c++) {
                var cell = grid[r][c];
                if (isBuildingAt(r, c)) totalPop += (POPULATION_PER_FLOOR[cell.type] || 8) * cell.floors;
                if (!isBuildingAt(r, c) && cell.type !== CELL_TYPES.EMPTY) walkable.push({ row: r, col: c });
            }
        }

        // Nearby empty cells also walkable
        for (var r2 = 0; r2 < GRID_SIZE; r2++) {
            for (var c2 = 0; c2 < GRID_SIZE; c2++) {
                if (grid[r2][c2].type === CELL_TYPES.EMPTY) {
                    var dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                    for (var d = 0; d < dirs.length; d++) {
                        var nr = r2 + dirs[d][0], nc = c2 + dirs[d][1];
                        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && !isBuildingAt(nr, nc) && grid[nr][nc].type !== CELL_TYPES.EMPTY) {
                            walkable.push({ row: r2, col: c2 });
                            break;
                        }
                    }
                }
            }
        }

        var target = Math.min(80, Math.floor(totalPop * 0.02) + walkable.length * 2);

        while (pedestrians.length < target && walkable.length > 0) {
            var start = walkable[Math.floor(Math.random() * walkable.length)];
            var pos = cellToWorld(start.row, start.col);
            var ped = createPedestrian(pos.x + (Math.random() - 0.5) * 2, pos.z + (Math.random() - 0.5) * 2);
            pedestrianGroup.add(ped.mesh);
            pedestrians.push(ped);
        }
        while (pedestrians.length > target) {
            var removed = pedestrians.pop();
            pedestrianGroup.remove(removed.mesh);
        }

        for (var p = 0; p < pedestrians.length; p++) {
            var pd = pedestrians[p];
            pd.mesh.position.x += pd.vx;
            pd.mesh.position.z += pd.vz;
            if (Math.abs(pd.mesh.position.x) > HALF_GRID || Math.abs(pd.mesh.position.z) > HALF_GRID) {
                pd.vx *= -1; pd.vz *= -1;
            }
            if (Math.random() < 0.01) {
                pd.vx += (Math.random() - 0.5) * 0.02;
                pd.vz += (Math.random() - 0.5) * 0.02;
                var sp = Math.sqrt(pd.vx * pd.vx + pd.vz * pd.vz);
                if (sp > 0.04) { pd.vx = (pd.vx / sp) * 0.04; pd.vz = (pd.vz / sp) * 0.04; }
            }
            var cp = worldToCell(pd.mesh.position.x, pd.mesh.position.z);
            if (cp && isBuildingAt(cp.row, cp.col)) { pd.vx *= -1.5; pd.vz *= -1.5; }
            pd.phase += 0.1;
            pd.mesh.position.y = 0.2 + Math.abs(Math.sin(pd.phase)) * 0.08;
        }
    }

    // ─── INPUT — Click vs Drag ─────────────────────────────
    function getGroundPoint(event) {
        var rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        var point = new THREE.Vector3();
        var hit = raycaster.ray.intersectPlane(groundPlane, point);
        return hit ? point : null;
    }

    canvas.addEventListener('pointerdown', function (e) {
        if (e.button !== 0) return;
        mouseDownPos = { x: e.clientX, y: e.clientY };
        mouseDownTime = Date.now();

        if (selectedTool === 'move') {
            var pt = getGroundPoint(e);
            if (pt) {
                var cell = worldToCell(pt.x, pt.z);
                if (cell && isBuildingAt(cell.row, cell.col)) {
                    isDragging = true;
                    dragTarget = grid[cell.row][cell.col];
                    dragStartPos = { row: cell.row, col: cell.col };
                    controls.enabled = false;
                }
            }
        }
    });

    canvas.addEventListener('pointermove', function (e) {
        var pt = getGroundPoint(e);
        if (!pt) { cellHighlight.visible = false; return; }

        var cell = worldToCell(pt.x, pt.z);
        if (cell) {
            var pos = cellToWorld(cell.row, cell.col);
            cellHighlight.position.set(pos.x, 0.05, pos.z);
            cellHighlight.visible = true;
        } else {
            cellHighlight.visible = false;
        }

        if (isDragging && dragTarget && dragTarget.meshGroup) {
            var toCell = worldToCell(pt.x, pt.z);
            if (toCell && grid[toCell.row][toCell.col].type === CELL_TYPES.EMPTY) {
                var toPos = cellToWorld(toCell.row, toCell.col);
                dragTarget.meshGroup.position.set(toPos.x, 0, toPos.z);
            }
        }
    });

    canvas.addEventListener('pointerup', function (e) {
        if (e.button !== 0) return;

        // Finish drag
        if (isDragging && dragTarget && dragStartPos) {
            var pt = getGroundPoint(e);
            if (pt) {
                var toCell = worldToCell(pt.x, pt.z);
                if (toCell && (toCell.row !== dragStartPos.row || toCell.col !== dragStartPos.col)) {
                    if (!moveBuilding(dragStartPos.row, dragStartPos.col, toCell.row, toCell.col)) {
                        var orig = cellToWorld(dragStartPos.row, dragStartPos.col);
                        if (dragTarget.meshGroup) dragTarget.meshGroup.position.set(orig.x, 0, orig.z);
                    }
                } else {
                    var orig2 = cellToWorld(dragStartPos.row, dragStartPos.col);
                    if (dragTarget.meshGroup) dragTarget.meshGroup.position.set(orig2.x, 0, orig2.z);
                }
            }
            isDragging = false;
            dragTarget = null;
            dragStartPos = null;
            controls.enabled = true;
            return;
        }

        // Click detection — if mouse didn't move much, it's a click
        var dx = e.clientX - mouseDownPos.x;
        var dy = e.clientY - mouseDownPos.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var dt = Date.now() - mouseDownTime;
        if (dist > 5 || dt > 400) return; // orbit drag, not click

        if (!selectedTool) return;

        var pt2 = getGroundPoint(e);
        if (!pt2) return;
        var cell2 = worldToCell(pt2.x, pt2.z);
        if (!cell2) return;

        if (selectedTool === 'delete') {
            removeFromCell(cell2.row, cell2.col);
        } else if (selectedTool === 'rotate') {
            rotateCellElement(cell2.row, cell2.col);
        } else if (selectedTool !== 'move' && grid[cell2.row][cell2.col].type === CELL_TYPES.EMPTY) {
            var floors = parseInt(document.getElementById('sliderHeight').value) || 3;
            placeOnCell(cell2.row, cell2.col, selectedTool, floors);
        }
    });

    // ─── TOOL SELECTION ─────────────────────────────
    var toolBtns = document.querySelectorAll('.tool-btn[data-tool]');
    for (var i = 0; i < toolBtns.length; i++) {
        (function (btn) {
            btn.addEventListener('click', function () {
                var tool = btn.getAttribute('data-tool');
                var allBtns = document.querySelectorAll('.tool-btn');
                for (var j = 0; j < allBtns.length; j++) allBtns[j].classList.remove('selected');

                if (selectedTool === tool) {
                    selectedTool = null;
                    canvas.style.cursor = 'crosshair';
                } else {
                    selectedTool = tool;
                    btn.classList.add('selected');
                    canvas.style.cursor = tool === 'move' ? 'grab' : tool === 'delete' ? 'not-allowed' : 'cell';
                }
                console.log('[UrbanLab] Tool: ' + selectedTool);
            });
        })(toolBtns[i]);
    }

    // ─── SLIDERS ─────────────────────────────
    document.getElementById('sliderHeight').addEventListener('input', function (e) {
        document.getElementById('sliderHeightVal').textContent = e.target.value + ' pisos';
    });
    document.getElementById('sliderSidewalk').addEventListener('input', function (e) {
        document.getElementById('sliderSidewalkVal').textContent = e.target.value + 'm';
        buildSidewalks();
    });

    // ─── TOP BAR BUTTONS ─────────────────────────────
    document.getElementById('btnUndo').addEventListener('click', undo);
    document.getElementById('btnRedo').addEventListener('click', redo);

    document.getElementById('btnResetView').addEventListener('click', function () {
        camera.position.set(50, 40, 50);
        controls.target.set(0, 0, 0);
        controls.update();
    });

    document.getElementById('btnToggleSim').addEventListener('click', function () {
        simulationActive = !simulationActive;
        this.classList.toggle('active', simulationActive);
        if (!simulationActive) {
            for (var p = 0; p < pedestrians.length; p++) pedestrianGroup.remove(pedestrians[p].mesh);
            pedestrians = [];
        }
    });

    document.getElementById('btnEducation').addEventListener('click', function () {
        document.getElementById('education-panel').classList.toggle('hidden');
    });

    document.getElementById('btnCloseEdu').addEventListener('click', function () {
        document.getElementById('education-panel').classList.add('hidden');
    });

    // ─── MINIMAP ─────────────────────────────
    function updateMinimap() {
        var mc = document.getElementById('minimapCanvas');
        var ctx = mc.getContext('2d');
        var cs = mc.width / GRID_SIZE;
        ctx.fillStyle = '#1a1f2e';
        ctx.fillRect(0, 0, mc.width, mc.height);

        var colorMap = {
            residential: '#4ecdc4', commercial: '#f7b731', mixed: '#a55eea', institutional: '#fc5c65',
            plaza: '#7c8c6e', park: '#2d8a4e', corridor: '#0fb9b1', corridor_elbow: '#0fa8a1', path: '#607080', path_elbow: '#556070'
        };

        for (var r = 0; r < GRID_SIZE; r++) {
            for (var c = 0; c < GRID_SIZE; c++) {
                var color = colorMap[grid[r][c].type];
                if (color) {
                    ctx.fillStyle = color;
                    ctx.fillRect(c * cs + 0.5, r * cs + 0.5, cs - 1, cs - 1);
                }
            }
        }

        ctx.strokeStyle = 'rgba(78,205,196,0.1)';
        ctx.lineWidth = 0.5;
        for (var k = 0; k <= GRID_SIZE; k++) {
            ctx.beginPath(); ctx.moveTo(k * cs, 0); ctx.lineTo(k * cs, mc.height); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, k * cs); ctx.lineTo(mc.width, k * cs); ctx.stroke();
        }
    }

    // ─── TOAST ─────────────────────────────
    var tips = {
        residential: '🏠 Residencial — genera habitantes que necesitan espacio público.',
        commercial: '🏪 Comercial — atrae visitantes y actividad económica.',
        mixed: '🏢 Uso mixto — combina vivienda y comercio.',
        institutional: '🏛️ Institucional — ancla urbana con flujos constantes.',
        plaza: '⛲ ¡Plaza! El vacío urbano permite luz, ventilación y vida social.',
        park: '🌳 Parque — mejora calidad ambiental y bienestar.',
        corridor: '🌿 Corredor verde — conecta espacios y mejora permeabilidad.',
        corridor_elbow: '🌿↪ Codo de corredor — conecta tramos perpendiculares. Usa R para rotar.',
        path: '🚶 Sendero peatonal — mejora conectividad y flujos.',
        path_elbow: '🚶↪ Codo de sendero — conecta tramos perpendiculares. Usa R para rotar.'
    };

    function showContextualTip(type) { if (tips[type]) showToast(tips[type]); }

    function showToast(text) {
        var toast = document.getElementById('toast');
        var tt = document.getElementById('toastText');
        tt.textContent = text;
        toast.classList.remove('hidden');
        clearTimeout(hintTimeout);
        hintTimeout = setTimeout(function () { toast.classList.add('hidden'); }, 4000);
    }

    // ─── KEYBOARD ─────────────────────────────
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
        if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
        if (e.key === 'Escape') {
            selectedTool = null;
            var allBtns = document.querySelectorAll('.tool-btn');
            for (var j = 0; j < allBtns.length; j++) allBtns[j].classList.remove('selected');
            canvas.style.cursor = 'crosshair';
        }
        // R key: rotate element under cursor
        if (e.key === 'r' || e.key === 'R') {
            if (cellHighlight.visible) {
                var hx = cellHighlight.position.x;
                var hz = cellHighlight.position.z;
                var hCell = worldToCell(hx, hz);
                if (hCell) rotateCellElement(hCell.row, hCell.col);
            }
        }
    });

    // ─── RESIZE ─────────────────────────────
    function onResize() {
        var w = container.clientWidth, h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    // ─── ANIMATION LOOP ─────────────────────────────
    var frameCount = 0;
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        if (frameCount % 2 === 0) updatePedestrians();
        renderer.render(scene, camera);
        frameCount++;
    }

    // ─── INIT ─────────────────────────────
    onResize();
    generateDeterioratedCity();
    animate();
    console.log('[UrbanLab] ✅ Simulator ready');

    setTimeout(function () {
        var hint = document.getElementById('hintOverlay');
        if (hint) {
            hint.style.transition = 'opacity 1s';
            hint.style.opacity = '0';
            setTimeout(function () { if (hint.parentNode) hint.parentNode.removeChild(hint); }, 1000);
        }
    }, 8000);

})();
