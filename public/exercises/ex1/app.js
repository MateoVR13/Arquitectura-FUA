const canvas2D = document.getElementById('ex1Canvas2D');
const ctx = canvas2D.getContext('2d');
const container3D = document.getElementById('ex1Canvas3D');

// Buttons & UI
const btnNext = document.getElementById('btnNext');
const btnPrev = document.getElementById('btnPrev');
const btnUndo = document.getElementById('btnUndo');
const btnClear = document.getElementById('btnClear');
const btnToggleGrid = document.getElementById('btnToggleGrid');
const btnMode2D = document.getElementById('btnMode2D');
const btnMode3D = document.getElementById('btnMode3D');

const progressBar = document.getElementById('progressBar');
const inventoryPanel = document.getElementById('inventoryPanel');
const gridConfigPanel = document.getElementById('gridConfigPanel');
const drawPanel = document.getElementById('drawPanel');

const sidebarStepTitle = document.getElementById('sidebarStepTitle');
const sidebarStepDesc = document.getElementById('sidebarStepDesc');

const finalModal = document.getElementById('finalModal');
const closeFinalModal = document.getElementById('closeFinalModal');

// Grid config elements
const gridSpacingSlider = document.getElementById('gridSpacing');
const gridRotationSlider = document.getElementById('gridRotation');
const gridSpacingVal = document.getElementById('gridSpacingVal');
const gridRotationVal = document.getElementById('gridRotationVal');
const btnApplyGrid = document.getElementById('btnApplyGrid');

// State
let currentStep = 1;
let currentMode = '2D';
let showGrid = true;
let isDrawing = false;
let startX, startY;
let gridApplied = false;
let linesDrawn = 0;
let step2ConceptShown = false;

// Grid config
let gridConfig = {
    spacing: 40,
    rotation: 0 // degrees
};

// Interactivity state
let selectedShapeIndex = -1;
let isDraggingShape = false;
let isResizingShape = false;
let dragOffsetX, dragOffsetY;

// Architecture Data
const history = [];
let currentShapes = [];

const stepsData = [
    { id: 1, title: 'Identificar', desc: 'Configura la malla estructural: define el espaciado y la orientación (ángulo de giro) que regirá toda tu composición.' },
    { id: 2, title: 'Posicionar', desc: 'Traza los ejes de composición sobre la malla. Las líneas se alinean automáticamente a las intersecciones de la grilla.' },
    { id: 3, title: 'Ocupar', desc: 'Despliega planos y muros levantando el espacio. Arrastra desde el inventario al lienzo.' },
    { id: 4, title: 'Aplicar (Redimensionar)', desc: 'Ajusta la posición y escala. Haz clic y arrastra desde la esquina inferior derecha de un objeto en planta para redimensionarlo.' },
    { id: 5, title: 'Generar', desc: 'Establece relaciones espaciales visualizando el volumen rotando la cámara en 3D.' }
];

// ── Concept Modal System (Block 2 style) ──
function showConcept(title, body) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').textContent = body;
    document.getElementById('concept-modal').classList.add('visible');
}

window.closeModal = function () {
    document.getElementById('concept-modal').classList.remove('visible');
};

// ── Tutor Messages ──
const TUTOR = {
    1: 'Configura el <strong>espaciado y rotación de la malla</strong> y luego haz clic en "Aplicar Malla" para definir la grilla de composición.',
    2: 'Traza <strong>ejes de composición</strong> sobre la malla haciendo clic y arrastrando en el lienzo. Las líneas se alinean a las intersecciones de la grilla.',
    3: 'Despliega <strong>planos y muros</strong> arrastrando las figuras desde el inventario lateral al lienzo para levantar el espacio.',
    4: 'Ajusta la <strong>posición y escala</strong>. Haz clic y arrastra la esquina inferior derecha de un objeto en planta para redimensionarlo.',
    5: 'Visualiza el <strong>volumen en 3D</strong> cambiando al modo perspectiva. Rota la cámara para inspeccionar tu composición tridimensional.'
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

// -------------------------------------------------------------------------------- //
// THREE.JS SETUP (3D ENGINE)
// -------------------------------------------------------------------------------- //
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x324000);

const camera = new THREE.PerspectiveCamera(45, 800 / 600, 0.1, 1000);
camera.position.set(200, 200, 300);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(800, 600);
renderer.shadowMap.enabled = true;
container3D.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting 3D
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(100, 200, 50);
dirLight.castShadow = true;
scene.add(dirLight);

// 3D grid (will be rebuilt when config changes)
let gridHelper = new THREE.GridHelper(400, 10, 0x444444, 0x222222);
scene.add(gridHelper);

function rebuild3DGrid() {
    scene.remove(gridHelper);
    const divisions = Math.round(400 / gridConfig.spacing);
    gridHelper = new THREE.GridHelper(400, divisions, 0x444444, 0x222222);
    gridHelper.rotation.y = (gridConfig.rotation * Math.PI) / 180;
    scene.add(gridHelper);
}

// Rendering Loop 3D
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Sync 2D data to 3D Space
const meshes3D = [];
function update3DObjects() {
    meshes3D.forEach(m => scene.remove(m));
    meshes3D.length = 0;

    currentShapes.forEach(shape => {
        let geometry, material, mesh;
        const posX = shape.x - 400 + (shape.w / 2) || 0;
        const posZ = shape.y - 300 + (shape.h / 2) || 0;

        if (shape.type === 'line') {
            const materialLine = new THREE.LineBasicMaterial({ color: 0xC8FF01 });
            const points = [];
            points.push(new THREE.Vector3(shape.x1 - 400, 0.5, shape.y1 - 300));
            points.push(new THREE.Vector3(shape.x2 - 400, 0.5, shape.y2 - 300));
            const geometryLine = new THREE.BufferGeometry().setFromPoints(points);
            mesh = new THREE.Line(geometryLine, materialLine);

        } else if (shape.type === 'rect') {
            geometry = new THREE.BoxGeometry(shape.w, 4, shape.h);
            material = new THREE.MeshLambertMaterial({ color: 0x00A4B5, transparent: true, opacity: 0.8 });
            mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(posX, 2, posZ);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

        } else if (shape.type === 'wall') {
            geometry = new THREE.BoxGeometry(shape.w, 80, shape.h);
            material = new THREE.MeshLambertMaterial({ color: 0x333333 });
            mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(posX, 40, posZ);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

        } else if (shape.type === 'column') {
            geometry = new THREE.CylinderGeometry(Math.min(shape.w, shape.h) / 2, Math.min(shape.w, shape.h) / 2, 80, 16);
            material = new THREE.MeshLambertMaterial({ color: 0x999999 });
            mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(posX, 40, posZ);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
        }

        if (mesh) {
            scene.add(mesh);
            meshes3D.push(mesh);
        }
    });
}

// -------------------------------------------------------------------------------- //
// 2D CANVAS LOGIC
// -------------------------------------------------------------------------------- //

function drawGrid2D() {
    if (!showGrid) return;
    ctx.save();

    const spacing = gridConfig.spacing;
    const angle = (gridConfig.rotation * Math.PI) / 180;
    const cx = canvas2D.width / 2;
    const cy = canvas2D.height / 2;

    // Translate to center, rotate, draw grid, then restore
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    ctx.strokeStyle = gridApplied ? 'rgba(200, 255, 1, 0.15)' : '#333';
    ctx.lineWidth = 1;

    // Calculate how many lines we need to cover the whole rotated canvas
    const diag = Math.sqrt(canvas2D.width * canvas2D.width + canvas2D.height * canvas2D.height);
    const halfDiag = diag / 2;
    const start = -Math.ceil(halfDiag / spacing) * spacing;
    const end = Math.ceil(halfDiag / spacing) * spacing;

    for (let x = start; x <= end; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, -halfDiag);
        ctx.lineTo(x, halfDiag);
        ctx.stroke();
    }
    for (let y = start; y <= end; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(-halfDiag, y);
        ctx.lineTo(halfDiag, y);
        ctx.stroke();
    }

    // Draw grid center marker
    if (gridApplied) {
        ctx.fillStyle = 'rgba(200, 255, 1, 0.4)';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

// ── Snap to Grid ──
// Transforms the point into the rotated grid space, snaps to nearest intersection, then transforms back
function snapToGrid(x, y) {
    const spacing = gridConfig.spacing;
    const angle = -(gridConfig.rotation * Math.PI) / 180; // inverse rotation
    const cx = canvas2D.width / 2;
    const cy = canvas2D.height / 2;

    // Translate to origin
    let dx = x - cx;
    let dy = y - cy;

    // Rotate to grid-aligned space
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    let gx = dx * cosA - dy * sinA;
    let gy = dx * sinA + dy * cosA;

    // Snap
    gx = Math.round(gx / spacing) * spacing;
    gy = Math.round(gy / spacing) * spacing;

    // Rotate back
    const cosB = Math.cos(-angle);
    const sinB = Math.sin(-angle);
    let fx = gx * cosB - gy * sinB;
    let fy = gx * sinB + gy * cosB;

    // Translate back
    return { x: fx + cx, y: fy + cy };
}

function render2D() {
    ctx.clearRect(0, 0, canvas2D.width, canvas2D.height);
    drawGrid2D();

    currentShapes.forEach((shape, idx) => {
        ctx.save();

        ctx.shadowColor = (idx === selectedShapeIndex) ? '#C8FF01' : 'transparent';
        ctx.shadowBlur = (idx === selectedShapeIndex) ? 15 : 0;

        if (shape.type === 'line') {
            ctx.strokeStyle = shape.color || '#C8FF01';
            ctx.lineWidth = shape.width || 2;
            ctx.beginPath();
            ctx.moveTo(shape.x1, shape.y1);
            ctx.lineTo(shape.x2, shape.y2);
            ctx.stroke();

            // Draw small dots at line endpoints
            ctx.fillStyle = shape.color || '#C8FF01';
            ctx.beginPath();
            ctx.arc(shape.x1, shape.y1, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(shape.x2, shape.y2, 3, 0, Math.PI * 2);
            ctx.fill();

        } else if (shape.type === 'rect') {
            ctx.fillStyle = 'rgba(0, 164, 181, 0.5)';
            ctx.fillRect(shape.x, shape.y, shape.w, shape.h);
            ctx.strokeStyle = (idx === selectedShapeIndex) ? '#C8FF01' : '#00A4B5';
            ctx.lineWidth = (idx === selectedShapeIndex) ? 2 : 1;
            ctx.strokeRect(shape.x, shape.y, shape.w, shape.h);

        } else if (shape.type === 'wall') {
            ctx.fillStyle = '#333';
            ctx.fillRect(shape.x, shape.y, shape.w, shape.h);
            ctx.strokeStyle = (idx === selectedShapeIndex) ? '#C8FF01' : '#666';
            ctx.lineWidth = (idx === selectedShapeIndex) ? 2 : 1;
            ctx.strokeRect(shape.x, shape.y, shape.w, shape.h);

        } else if (shape.type === 'column') {
            ctx.fillStyle = '#999';
            ctx.beginPath();
            ctx.arc(shape.x + Math.min(shape.w, shape.h) / 2, shape.y + Math.min(shape.w, shape.h) / 2, Math.min(shape.w, shape.h) / 2, 0, Math.PI * 2);
            ctx.fill();
            if (idx === selectedShapeIndex) {
                ctx.strokeStyle = '#C8FF01';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }

        // Draw resize handle if selected and in step 4
        if (idx === selectedShapeIndex && currentStep >= 4 && shape.type !== 'line') {
            ctx.fillStyle = '#fff';
            ctx.fillRect(shape.x + shape.w - 5, shape.y + shape.h - 5, 10, 10);
        }

        ctx.restore();
    });

    update3DObjects();
}


// -------------------------------------------------------------------------------- //
// UI & INTERACTION LOGIC
// -------------------------------------------------------------------------------- //

// Grid sliders live preview
gridSpacingSlider.addEventListener('input', (e) => {
    gridConfig.spacing = parseInt(e.target.value);
    gridSpacingVal.textContent = e.target.value + 'px';
    render2D();
});

gridRotationSlider.addEventListener('input', (e) => {
    gridConfig.rotation = parseInt(e.target.value);
    gridRotationVal.textContent = e.target.value + '°';
    render2D();
});

// Apply Grid button
btnApplyGrid.addEventListener('click', () => {
    gridApplied = true;
    rebuild3DGrid();
    render2D();
    showConcept(
        "La Malla Reguladora",
        "La malla es el esquema geométrico invisible que regula toda composición arquitectónica. Al definir su orientación y ritmo, estableces el ADN del proyecto. Es la retícula de orden que subyace bajo toda decisión espacial, desde Le Corbusier hasta Mies van der Rohe."
    );
    btnNext.disabled = false;
});

closeFinalModal.addEventListener('click', () => {
    finalModal.classList.remove('show');
});

document.getElementById('btnGoEx2').addEventListener('click', () => {
    try {
        window.parent.postMessage({ type: 'exercise-complete', exercise: 'ex1_sintesis' }, '*');
    } catch (e) {
        // Standalone mode fallback
        window.parent.location.href = '/bloques/1/ex2';
    }
});

function toggleMode(mode) {
    currentMode = mode;
    if (mode === '2D') {
        canvas2D.style.visibility = 'visible';
        container3D.style.visibility = 'hidden';
        btnMode2D.classList.add('active');
        btnMode3D.classList.remove('active');
    } else {
        canvas2D.style.visibility = 'hidden';
        container3D.style.visibility = 'visible';
        btnMode3D.classList.add('active');
        btnMode2D.classList.remove('active');
    }
}

btnMode2D.addEventListener('click', () => toggleMode('2D'));
btnMode3D.addEventListener('click', () => toggleMode('3D'));

function updateUI() {
    progressBar.style.width = `${(currentStep / 5) * 100}%`;

    const data = stepsData[currentStep - 1];
    sidebarStepTitle.textContent = data.title;
    sidebarStepDesc.textContent = data.desc;

    btnPrev.disabled = currentStep === 1;

    // Step-specific UI
    gridConfigPanel.style.display = (currentStep === 1) ? 'flex' : 'none';
    drawPanel.style.display = (currentStep === 2) ? 'flex' : 'none';

    // btnNext control
    if (currentStep === 1) {
        btnNext.disabled = !gridApplied;
    } else if (currentStep === 5) {
        btnNext.disabled = true;
    } else {
        btnNext.disabled = false;
    }

    // Show inventory from step 3 onwards
    if (currentStep >= 3) {
        inventoryPanel.classList.add('active');
    } else {
        inventoryPanel.classList.remove('active');
    }

    if (currentStep === 4) {
        btnMode3D.style.backgroundColor = 'var(--ua-teal)';
        btnMode3D.style.color = '#fff';
        setTimeout(() => { btnMode3D.style.backgroundColor = ''; }, 2000);
    }

    selectedShapeIndex = -1;
    render2D();

    if (currentStep === 5) {
        setTimeout(() => {
            finalModal.classList.add('show');
        }, 1000);
    }
}

btnNext.addEventListener('click', () => {
    if (currentStep < 5) {
        currentStep++;
        updateUI();
        updateTutor();

        // Show concept when entering step 2
        if (currentStep === 2) {
            showConcept(
                "Posicionar: Ejes de Composición",
                "Los ejes son las líneas directrices que organizan el vacío. Al alinearlos a la malla, garantizas un orden geométrico. Dibuja trazando sobre las intersecciones de la grilla para crear el esqueleto de tu composición."
            );
        } else if (currentStep === 3) {
            showConcept(
                "Ocupar: Desplegar Planos y Muros",
                "Arrastra las primitivas desde el inventario al lienzo; cada plano o muro que coloques define un límite espacial. Es el momento de trasladar el orden abstracto de la malla a materia construida."
            );
        } else if (currentStep === 4) {
            showConcept(
                "Aplicar: Ajustar Escala y Proporción",
                "Redimensiona cada elemento arrastrando la esquina inferior-derecha. La proporción entre llenos y vacíos define la calidad del espacio arquitectónico. Ajusta hasta encontrar el equilibrio."
            );
        }
    }
});

btnPrev.addEventListener('click', () => {
    if (currentStep > 1) {
        currentStep--;
        updateUI();
        updateTutor();
    }
});

btnToggleGrid.addEventListener('click', () => {
    showGrid = !showGrid;
    gridHelper.visible = showGrid;
    btnToggleGrid.classList.toggle('active', showGrid);
    render2D();
});

btnClear.addEventListener('click', () => {
    currentShapes = [];
    selectedShapeIndex = -1;
    render2D();
});

btnUndo.addEventListener('click', () => {
    if (history.length > 1) {
        history.pop();
        currentShapes = JSON.parse(JSON.stringify(history[history.length - 1]));
        selectedShapeIndex = -1;
        render2D();
    }
});

// Canvas Interactions
function getMousePos(e) {
    const rect = canvas2D.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

canvas2D.addEventListener('mousedown', (e) => {
    if (currentMode === '3D') return;
    const { x, y } = getMousePos(e);

    if (currentStep === 2) {
        // Drawing lines mode – snap start point to grid
        isDrawing = true;
        const snapped = snapToGrid(x, y);
        startX = snapped.x;
        startY = snapped.y;
        return;
    }

    // Step 3 & 4 (Select, Move, Resize)
    let found = -1;

    // Check resize handle first if step 4
    if (currentStep >= 4 && selectedShapeIndex !== -1) {
        const shape = currentShapes[selectedShapeIndex];
        if (shape.type !== 'line') {
            if (x >= shape.x + shape.w - 10 && x <= shape.x + shape.w + 10 &&
                y >= shape.y + shape.h - 10 && y <= shape.y + shape.h + 10) {
                isResizingShape = true;
                return;
            }
        }
    }

    // Check hit test for selection
    for (let i = currentShapes.length - 1; i >= 0; i--) {
        const shape = currentShapes[i];
        if (shape.type === 'line') continue;
        if (x >= shape.x && x <= shape.x + shape.w && y >= shape.y && y <= shape.y + shape.h) {
            found = i;
            break;
        }
    }

    selectedShapeIndex = found;
    if (found !== -1) {
        isDraggingShape = true;
        const sh = currentShapes[found];
        dragOffsetX = x - sh.x;
        dragOffsetY = y - sh.y;
    }
    render2D();
});

canvas2D.addEventListener('mousemove', (e) => {
    if (currentMode === '3D') return;
    const { x, y } = getMousePos(e);

    // Drawing lines (step 2)
    if (isDrawing && currentStep === 2) {
        render2D();
        const snapped = snapToGrid(x, y);
        ctx.save();
        ctx.strokeStyle = 'rgba(200, 255, 1, 0.5)';
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(snapped.x, snapped.y);
        ctx.stroke();

        // Draw snap indicator circle at end
        ctx.fillStyle = 'rgba(200, 255, 1, 0.7)';
        ctx.beginPath();
        ctx.arc(snapped.x, snapped.y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        return;
    }

    // Resizing shape
    if (isResizingShape && selectedShapeIndex !== -1) {
        const shape = currentShapes[selectedShapeIndex];
        shape.w = Math.max(20, x - shape.x);
        shape.h = Math.max(20, y - shape.y);
        render2D();
        return;
    }

    // Moving shape
    if (isDraggingShape && selectedShapeIndex !== -1) {
        const shape = currentShapes[selectedShapeIndex];
        shape.x = x - dragOffsetX;
        shape.y = y - dragOffsetY;
        render2D();
        return;
    }

    // Change cursor based on hover
    if (currentStep >= 4 && selectedShapeIndex !== -1) {
        const shape = currentShapes[selectedShapeIndex];
        if (shape.type !== 'line') {
            if (x >= shape.x + shape.w - 10 && x <= shape.x + shape.w + 10 &&
                y >= shape.y + shape.h - 10 && y <= shape.y + shape.h + 10) {
                canvas2D.style.cursor = 'nwse-resize';
                return;
            }
        }
    }
    canvas2D.style.cursor = (currentStep === 2) ? 'crosshair' : 'default';
});

canvas2D.addEventListener('mouseup', (e) => {
    if (currentMode === '3D') return;
    const { x, y } = getMousePos(e);

    if (isDrawing && currentStep === 2) {
        isDrawing = false;
        const snapped = snapToGrid(x, y);
        const dx = snapped.x - startX;
        const dy = snapped.y - startY;
        if (Math.sqrt(dx * dx + dy * dy) > 10) {
            currentShapes.push({
                type: 'line',
                x1: startX, y1: startY,
                x2: snapped.x, y2: snapped.y,
                color: '#C8FF01',
                width: 2
            });
            history.push(JSON.parse(JSON.stringify(currentShapes)));
            linesDrawn++;

            // After first 2 lines, show concept about axes
            if (linesDrawn === 2 && !step2ConceptShown) {
                step2ConceptShown = true;
                showConcept(
                    "Ejes y Composición Racional",
                    "Los ejes que has trazado son las líneas de fuerza que organizan el vacío. Al alinearlos a la malla, te aseguras de que la composición final tenga un orden racional subyacente, fundamental en toda obra arquitectónica."
                );
            }
        }
        render2D();
    }

    if (isDraggingShape || isResizingShape) {
        isDraggingShape = false;
        isResizingShape = false;
        history.push(JSON.parse(JSON.stringify(currentShapes)));
    }
});

// Drag & Drop from inventory
const invItems = document.querySelectorAll('.inv-item');
invItems.forEach(item => {
    item.addEventListener('dragstart', e => {
        e.dataTransfer.setData('type', e.target.getAttribute('data-type'));
    });
});

canvas2D.addEventListener('dragover', e => e.preventDefault());

canvas2D.addEventListener('drop', e => {
    e.preventDefault();
    if (currentStep < 3 || currentMode === '3D') return;

    const type = e.dataTransfer.getData('type');
    const { x, y } = getMousePos(e);

    let shape = null;
    if (type === 'rect') { shape = { type: 'rect', x: x - 40, y: y - 40, w: 80, h: 80 }; }
    if (type === 'wall-h') { shape = { type: 'wall', x: x - 60, y: y - 10, w: 120, h: 20 }; }
    if (type === 'wall-v') { shape = { type: 'wall', x: x - 10, y: y - 60, w: 20, h: 120 }; }
    if (type === 'column') { shape = { type: 'column', x: x - 15, y: y - 15, w: 30, h: 30 }; }

    if (shape) {
        currentShapes.push(shape);
        selectedShapeIndex = currentShapes.length - 1;
        history.push(JSON.parse(JSON.stringify(currentShapes)));
        render2D();
    }
});

// ── Init ──
history.push([]);

// Show welcome concept on load
showConcept(
    "Laboratorio de Síntesis Formal",
    "En este entorno dual (2D/3D) pondrás a prueba la teoría de los 5 pasos de Composición Arquitectónica. Comienza definiendo la malla que organizará tu proyecto. Sigue las instrucciones paso a paso."
);

updateUI();
