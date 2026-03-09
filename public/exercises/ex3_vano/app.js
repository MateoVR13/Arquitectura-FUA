console.log("Iniciando Ejercicio 1: El Reto del Vano");

// Basic Three.js setup
const canvasContainer = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1d2500);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
canvasContainer.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
scene.add(dirLight);

// Grid Floor
const gridHelper = new THREE.GridHelper(50, 50, 0xc8ff01, 0x444444);
gridHelper.material.opacity = 0.2;
gridHelper.material.transparent = true;
scene.add(gridHelper);

const planeGeo = new THREE.PlaneGeometry(50, 50);
const planeMat = new THREE.MeshStandardMaterial({ color: 0x1d2500, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -0.01;
plane.receiveShadow = true;
scene.add(plane);

// State
let currentStep = 0;
let supports = [];
let beamMesh = null;
let beamMaterialType = 'madera';
let beamCanto = 0.2;

// ── Tutor Messages ──
const TUTOR = {
    0: 'Haz clic en <strong>2 puntos del suelo</strong> para colocar los apoyos verticales (muros o columnas).',
    1: 'Ahora haz clic en el botón <strong>"Trazar Viga"</strong> en el panel inferior para conectar los apoyos con un elemento horizontal.',
    2: '<strong>Arrastra uno de los apoyos</strong> para alejarlo y observar cómo la viga se deforma por la flexión. Cuanto mayor es el vano, mayor la deflexión.',
    3: 'Usa los controles de <strong>Material</strong> y <strong>Canto</strong> en el panel inferior para contrarrestar la deformación.',
    4: '🎉 ¡Felicidades! Has dominado los conceptos de apoyo, vano y flexión.'
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

// Materials — distinctly different colors and properties
const matMadera = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9, metalness: 0.0 });
const matConcreto = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, roughness: 0.7, metalness: 0.05 });
const matAcero = new THREE.MeshStandardMaterial({ color: 0x2288DD, roughness: 0.15, metalness: 0.9 });
const matApoyo = new THREE.MeshStandardMaterial({ color: 0x555555 });

const beamMaterials = {
    'madera': matMadera,
    'concreto': matConcreto,
    'acero': matAcero
};

// UI Elements
const matSelect = document.getElementById('material-select');
const cantoSlider = document.getElementById('canto-slider');
const controlsPanel = document.getElementById('controls-panel');
const btnTrazar = document.getElementById('btn-trazar');
const configControls = document.querySelectorAll('.config-control');

// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// ── UI Step Management ──
function updateUI() {
    document.querySelectorAll('.step').forEach((el, index) => {
        if (index === currentStep) {
            el.classList.add('active');
            el.style.opacity = '1';
        } else if (index < currentStep) {
            el.classList.remove('active');
            el.style.opacity = '0.5';
        } else {
            el.classList.remove('active');
            el.style.opacity = '0.4';
        }
    });

    // Step 1: show "Trazar Viga" button
    if (currentStep === 1) {
        controlsPanel.style.opacity = '1';
        btnTrazar.style.display = 'flex';
        btnTrazar.removeAttribute('disabled');
    }

    // Step 2: keep panel visible but hide trazar button
    if (currentStep === 2) {
        controlsPanel.style.opacity = '1';
        btnTrazar.style.display = 'none';
    }

    // Step 3+: show material/canto controls
    if (currentStep >= 3) {
        controlsPanel.style.opacity = '1';
        btnTrazar.style.display = 'none';
        configControls.forEach(c => c.style.display = 'flex');
        matSelect.removeAttribute('disabled');
        cantoSlider.removeAttribute('disabled');
    }
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

// ── Step 1 button: Trazar Viga ──
btnTrazar.addEventListener('click', () => {
    if (supports.length !== 2 || beamMesh) return;
    btnTrazar.disabled = true;
    updateBeamGeometry();
    showConcept(
        "La Línea como Conector",
        "La viga es el elemento lineal que transfiere el peso horizontalmente hacia los apoyos verticales."
    );
});

// ── Beam Geometry (rectangular cross-section with bending simulation) ──
function updateBeamGeometry() {
    if (supports.length < 2) return;

    const p1 = supports[0].position.clone();
    p1.y = 4;
    const p2 = supports[1].position.clone();
    p2.y = 4;

    const distance = p1.distanceTo(p2);

    let materialFactor = 1.0;
    if (beamMaterialType === 'concreto') materialFactor = 0.6;
    if (beamMaterialType === 'acero') materialFactor = 0.2;

    let deflection = (Math.pow(distance, 2) * materialFactor * 0.008) / Math.pow(beamCanto, 1.5);
    if (deflection > distance * 0.2) deflection = distance * 0.2;
    if (distance < 5) deflection = 0;

    // Remove old beam
    if (beamMesh) {
        scene.remove(beamMesh);
        if (beamMesh.geometry) beamMesh.geometry.dispose();
    }

    // Build rectangular beam along a bending curve
    const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    midPoint.y -= deflection;

    const curve = new THREE.QuadraticBezierCurve3(p1, midPoint, p2);
    const beamWidth = 0.6; // Fixed width of the rectangular beam

    // Create a custom extruded shape along the curve
    const rectShape = new THREE.Shape();
    rectShape.moveTo(-beamWidth / 2, -beamCanto / 2);
    rectShape.lineTo(beamWidth / 2, -beamCanto / 2);
    rectShape.lineTo(beamWidth / 2, beamCanto / 2);
    rectShape.lineTo(-beamWidth / 2, beamCanto / 2);
    rectShape.lineTo(-beamWidth / 2, -beamCanto / 2);

    const extrudeSettings = {
        steps: 64,
        extrudePath: curve
    };

    const beamGeo = new THREE.ExtrudeGeometry(rectShape, extrudeSettings);
    beamMesh = new THREE.Mesh(beamGeo, beamMaterials[beamMaterialType]);
    beamMesh.castShadow = true;
    beamMesh.receiveShadow = true;
    scene.add(beamMesh);

    // Color red if excessive deflection
    if (deflection > distance * 0.1) {
        beamMesh.material = beamMaterials[beamMaterialType].clone();
        beamMesh.material.color.setHex(0xff3333);
    }
}

// ── Drag State ──
let draggedObject = null;
let isDragging = false;
let didDrag = false;

// ── Unified Pointer Handlers ──
function onPointerDown(event) {
    if (document.getElementById('concept-modal').classList.contains('visible')) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    // Step 0: Place supports
    if (currentStep === 0 && supports.length < 2) {
        const hits = raycaster.intersectObject(plane);
        if (hits.length > 0) {
            const pt = hits[0].point;
            const geo = new THREE.BoxGeometry(2, 4, 2);
            const mesh = new THREE.Mesh(geo, matApoyo);
            mesh.position.set(pt.x, 2, pt.z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            scene.add(mesh);
            supports.push(mesh);

            if (supports.length === 2) {
                showConcept(
                    "Apoyo y Reacción",
                    "Has establecido los puntos donde la carga llegará al suelo. En arquitectura, todo lo que sube debe bajar a través de estos puntos."
                );
            }
        }
        return;
    }

    // Step 2+: Drag supports
    if (currentStep >= 2) {
        const hits = raycaster.intersectObjects(supports);
        if (hits.length > 0) {
            controls.enabled = false;
            isDragging = true;
            didDrag = false;
            draggedObject = hits[0].object;
        }
    }
}

function onPointerMove(event) {
    if (!isDragging || !draggedObject) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObject(plane);

    if (hits.length > 0) {
        draggedObject.position.x = hits[0].point.x;
        draggedObject.position.z = hits[0].point.z;
        updateBeamGeometry();
        didDrag = true;
    }
}

function onPointerUp() {
    if (isDragging && currentStep === 2 && didDrag) {
        const dist = supports[0].position.distanceTo(supports[1].position);
        if (dist > 8) {
            showConcept(
                "La Flexión",
                "Al separar los apoyos, la gravedad empuja el centro de la viga hacia abajo. Este esfuerzo se llama flexión: la parte de arriba se comprime y la de abajo se estira."
            );
        }
    }
    isDragging = false;
    draggedObject = null;
    controls.enabled = true;
}

// ── Event Listeners (pointer events, not mouse) ──
renderer.domElement.addEventListener('pointerdown', onPointerDown);
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);

// ── Material / Canto controls (Step 3) ──
matSelect.addEventListener('change', (e) => {
    beamMaterialType = e.target.value;
    updateBeamGeometry();
});

cantoSlider.addEventListener('input', (e) => {
    beamCanto = parseFloat(e.target.value);
    updateBeamGeometry();
});

// ── Render Loop ──
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
