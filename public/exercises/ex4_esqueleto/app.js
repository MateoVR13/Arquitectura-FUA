console.log("Iniciando Ejercicio 2: El Esqueleto Racional");

// Basic Three.js setup
const canvasContainer = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1d2500);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
canvasContainer.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = (Math.PI / 2) - 0.1;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(20, 30, 20);
dirLight.castShadow = true;
scene.add(dirLight);

// The Grid (La Malla)
const gridHelper = new THREE.GridHelper(30, 6, 0xc8ff01, 0x444444); // 6x6 grid, 5 units apart
scene.add(gridHelper);

const planeGeo = new THREE.PlaneGeometry(30, 30);
const planeMat = new THREE.MeshStandardMaterial({ color: 0x1d2500, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -0.05;
plane.receiveShadow = true;
scene.add(plane);

// State Variables
let currentStep = 0;
let columns = [];
let beams = [];
let walls = [];
let nodes = []; // Grid intersection points picked
let structureGroup = new THREE.Group();
scene.add(structureGroup);

// ── Tutor Messages ──
const TUTOR = {
    0: 'Haz clic en las <strong>intersecciones de la malla</strong> para plantar 4 columnas y formar tu primer pórtico.',
    1: 'Haz clic en el botón <strong>"Cerrar Marco"</strong> en el panel inferior para articular un marco rígido con vigas superiores.',
    2: 'Haz clic en <strong>"Simular Viento"</strong> para enviar fuerzas laterales y observar cómo se deforma la estructura sin arriostramiento.',
    3: 'Haz clic en <strong>"Añadir Muro (Plano)"</strong> para colocar un muro de corte que estabilice la estructura.',
    4: '🎉 ¡Felicidades! Has comprendido el sistema aporticado y la importancia del arriostramiento.'
};

function updateTutor() {
    const msg = TUTOR[currentStep];
    const el = document.getElementById('tutorText');
    if (el && msg) {
        el.innerHTML = msg;
        const bubble = document.getElementById('tutor-bubble');
        bubble.classList.remove('pulse');
        void bubble.offsetWidth;
        bubble.classList.add('pulse');
    }
}

let windForceApplied = false;
let isBraced = false;

// Materials
const matColumn = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.6 });
const matBeam = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.4 });
const matWall = new THREE.MeshStandardMaterial({ color: 0xc8ff01, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
const matIndicator = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });

// Interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// UI Elements
const btnVigas = document.getElementById('btn-vigas');
const btnViento = document.getElementById('btn-viento');
const btnMuro = document.getElementById('btn-muro');
const warningToast = document.getElementById('warning-toast');

// Highlight intersection points on hover
const hoverGeo = new THREE.BoxGeometry(1.2, 0.2, 1.2);
const hoverMesh = new THREE.Mesh(hoverGeo, matIndicator);
hoverMesh.visible = false;
scene.add(hoverMesh);

// Helper to snap to 5-unit grid
function snapToGrid(val) {
    return Math.round(val / 5) * 5;
}

function updateUI() {
    document.querySelectorAll('.step').forEach((el, index) => {
        if (index === currentStep) {
            el.classList.add('active');
            el.style.opacity = '1';
        } else if (index < currentStep) {
            el.classList.remove('active');
            el.style.opacity = '0.4';
        } else {
            el.classList.remove('active');
            el.style.opacity = '0.4';
        }
    });

    const controlsPanel = document.getElementById('controls-panel');
    if (currentStep >= 1) {
        controlsPanel.style.opacity = '1';
        btnVigas.removeAttribute('disabled');
    }
    if (currentStep >= 2) btnViento.removeAttribute('disabled');
    if (currentStep >= 3) btnMuro.removeAttribute('disabled');
}

function showConcept(title, desc) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-body').innerText = desc;
    document.getElementById('concept-modal').classList.add('visible');
}

window.closeModal = function () {
    document.getElementById('concept-modal').classList.remove('visible');
    currentStep++;
    updateUI();
    updateTutor();

    // If we just advanced past 3 (step index), show completion modal
    if (currentStep > 3) {
        const cm = document.getElementById('completion-modal');
        cm.style.display = 'flex';
    }
};

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (currentStep === 0) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(plane);
        if (intersects.length > 0) {
            let px = snapToGrid(intersects[0].point.x);
            let pz = snapToGrid(intersects[0].point.z);
            hoverMesh.position.set(px, 0.1, pz);

            // Only show hover if within grid bounds (15) and not already picked
            if (Math.abs(px) <= 15 && Math.abs(pz) <= 15) {
                const alreadyPicked = nodes.some(n => n.x === px && n.z === pz);
                hoverMesh.visible = !alreadyPicked;
            } else {
                hoverMesh.visible = false;
            }
        }
    } else {
        hoverMesh.visible = false;
    }
}

function onClick(event) {
    if (document.getElementById('concept-modal').classList.contains('visible')) return;

    if (currentStep === 0 && hoverMesh.visible) {
        // Plant Column
        const pos = hoverMesh.position.clone();
        nodes.push(pos);

        const colGeo = new THREE.BoxGeometry(0.8, 8, 0.8);
        const colMesh = new THREE.Mesh(colGeo, matColumn);
        colMesh.position.set(pos.x, 4, pos.z); // Height 8, center at 4
        colMesh.castShadow = true;
        structureGroup.add(colMesh);
        columns.push(colMesh);

        hoverMesh.visible = false;

        if (columns.length === 4) {
            showConcept(
                "Carga Axial y Retícula",
                "Has usado la malla para organizar el soporte. Las columnas reciben el peso de forma directa (compresión), llevándolo hasta la cimentación de manera lógica y ordenada."
            );
        }
    }
}

// Step 1: Draw Beams
btnVigas.addEventListener('click', () => {
    if (columns.length < 4) return;

    // Connect all columns with beams (assuming they form a rectangular frame for simplicity)
    // Find min/max x and z to draw the perimeter
    let minX = Math.min(...nodes.map(n => n.x));
    let maxX = Math.max(...nodes.map(n => n.x));
    let minZ = Math.min(...nodes.map(n => n.z));
    let maxZ = Math.max(...nodes.map(n => n.z));

    const beamPositions = [
        { start: new THREE.Vector3(minX, 8, minZ), end: new THREE.Vector3(maxX, 8, minZ) },
        { start: new THREE.Vector3(maxX, 8, minZ), end: new THREE.Vector3(maxX, 8, maxZ) },
        { start: new THREE.Vector3(maxX, 8, maxZ), end: new THREE.Vector3(minX, 8, maxZ) },
        { start: new THREE.Vector3(minX, 8, maxZ), end: new THREE.Vector3(minX, 8, minZ) },
    ];

    beamPositions.forEach(pos => {
        const length = pos.start.distanceTo(pos.end);
        if (length === 0) return;

        const beamGeo = new THREE.BoxGeometry(2.0, 0.5, length + 1); // Wide & flat beam vs narrow columns
        const beamMesh = new THREE.Mesh(beamGeo, matBeam);

        beamMesh.position.copy(pos.start).lerp(pos.end, 0.5);
        beamMesh.lookAt(pos.end);
        beamMesh.castShadow = true;

        structureGroup.add(beamMesh);
        beams.push(beamMesh);
    });

    btnVigas.disabled = true;
    showConcept(
        "Sistema Aporticado (Marco Rígido)",
        "Has creado un marco rígido de vigas y columnas. Este esqueleto permite que los muros ya no sean necesarios para sostener el techo, liberando el espacio interior para el habitante."
    );
});

// Step 2: Simulate Wind
btnViento.addEventListener('click', () => {
    if (windForceApplied) return;
    windForceApplied = true;

    // Animate structural deformation (shear)
    const targetSkew = isBraced ? 0.02 : 0.3; // If braced, almost no movement

    // We simulate skewing by rotating the whole group slightly from the base, 
    // or by modifying geometries. Let's do a simple group rotation pivot at y=0 
    // for a quick visual effect of failure.

    // Move pivot down
    const box = new THREE.Box3().setFromObject(structureGroup);
    const center = box.getCenter(new THREE.Vector3());
    structureGroup.position.set(-center.x, 0, -center.z);

    // Group inside an offset wrapper to rotate from bottom
    const wrapper = new THREE.Group();
    wrapper.position.set(center.x, 0, center.z);
    scene.add(wrapper);
    wrapper.add(structureGroup);

    new TWEEN.Tween(wrapper.rotation)
        .to({ z: targetSkew }, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(() => {
            if (!isBraced) {
                warningToast.classList.add('show');
                // Color columns red
                columns.forEach(c => c.material = new THREE.MeshStandardMaterial({ color: 0xff3333 }));

                setTimeout(() => {
                    showConcept(
                        "Deformación Lateral",
                        "Tu estructura es buena soportando peso vertical, pero es un mecanismo inestable ante fuerzas horizontales (viento o sismos). Tiende a romperse en las uniones de vigas y columnas (nudos)."
                    );
                }, 200);
            }
        })
        .start();

    btnViento.disabled = true;
});

// Step 3: Add Shear Wall (Arriostramiento)
btnMuro.addEventListener('click', () => {
    // Return structure to upright
    TWEEN.removeAll();
    scene.children.forEach(c => {
        if (c.type === 'Group') {
            new TWEEN.Tween(c.rotation).to({ z: 0 }, 500).start();
        }
    });

    warningToast.classList.remove('show');
    // Restore column color
    columns.forEach(c => c.material = matColumn);

    // Add wall panel on one face
    let minX = Math.min(...nodes.map(n => n.x));
    let maxX = Math.max(...nodes.map(n => n.x));
    let minZ = Math.min(...nodes.map(n => n.z));

    const width = maxX - minX;
    const wallGeo = new THREE.PlaneGeometry(width, 8);
    const wallMesh = new THREE.Mesh(wallGeo, matWall);
    wallMesh.position.set(minX + width / 2, 4, minZ);
    structureGroup.add(wallMesh);

    isBraced = true;
    btnMuro.disabled = true;

    showConcept(
        "El Plano como Arriostramiento",
        "Al insertar un plano rígido (muro de corte), bloqueas el movimiento lateral. El plano ahora cumple dos funciones simultáneas: define el límite del espacio vacío y rigidiza toda la estructura."
    );
});

// Event Listeners
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('click', onClick);

// Render Loop
function animate(time) {
    requestAnimationFrame(animate);
    TWEEN.update(time);
    controls.update();
    renderer.render(scene, camera);
}

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
