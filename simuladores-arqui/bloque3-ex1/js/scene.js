/* ==========================================
   SCENE.JS — Three.js Scene Setup
   ========================================== */
const SceneManager = (() => {
  let scene, camera, renderer, controls, raycaster, mouse;
  let gridHelper, groundPlane;
  const GRID_SIZE = 20;
  const CELL_SIZE = 2;

  function init(canvas) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07070d);
    scene.fog = new THREE.FogExp2(0x07070d, 0.018);

    // Camera
    camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
    camera.position.set(12, 14, 16);
    camera.lookAt(0, 2, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.target.set(0, 1.5, 0);

    // Raycaster
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xc8d8ff, 0x2a2a1a, 0.5);
    scene.add(hemi);

    const dirLight = new THREE.DirectionalLight(0xfff4e8, 0.9);
    dirLight.position.set(10, 18, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.camera.left = -15;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.top = 15;
    dirLight.shadow.camera.bottom = -15;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 40;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x6b8cc7, 0.3);
    rimLight.position.set(-8, 10, -6);
    scene.add(rimLight);

    // Ground
    createGround();
    createGrid();

    // Handle resize
    handleResize();
    window.addEventListener('resize', handleResize);

    // Start loop
    animate();
  }

  function createGround() {
    const geometry = new THREE.PlaneGeometry(60, 60);
    const material = new THREE.MeshStandardMaterial({
      color: 0x0a0a12,
      roughness: 0.95,
      metalness: 0.05
    });
    groundPlane = new THREE.Mesh(geometry, material);
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = -0.01;
    groundPlane.receiveShadow = true;
    groundPlane.name = 'ground';
    scene.add(groundPlane);
  }

  function createGrid() {
    // Custom grid
    const half = (GRID_SIZE * CELL_SIZE) / 2;
    const gridGroup = new THREE.Group();
    gridGroup.name = 'grid';

    const lineMat = new THREE.LineBasicMaterial({ color: 0x1a1a2e, transparent: true, opacity: 0.6 });
    const accentMat = new THREE.LineBasicMaterial({ color: 0x252540, transparent: true, opacity: 0.8 });

    for (let i = 0; i <= GRID_SIZE; i++) {
      const offset = i * CELL_SIZE - half;
      const mat = (i % 5 === 0) ? accentMat : lineMat;

      // X direction
      const geoX = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(offset, 0.005, -half),
        new THREE.Vector3(offset, 0.005, half)
      ]);
      gridGroup.add(new THREE.Line(geoX, mat));

      // Z direction
      const geoZ = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-half, 0.005, offset),
        new THREE.Vector3(half, 0.005, offset)
      ]);
      gridGroup.add(new THREE.Line(geoZ, mat));
    }
    scene.add(gridGroup);

    // Center marker
    const markerGeo = new THREE.RingGeometry(0.08, 0.15, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x3a3a5a, side: THREE.DoubleSide });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.rotation.x = -Math.PI / 2;
    marker.position.y = 0.01;
    scene.add(marker);
  }

  function handleResize() {
    const container = renderer.domElement.parentElement;
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  // Snap world position to grid cell center
  function snapToGrid(worldPos) {
    const half = (GRID_SIZE * CELL_SIZE) / 2;
    const x = Math.round((worldPos.x + half) / CELL_SIZE) * CELL_SIZE - half + CELL_SIZE / 2;
    const z = Math.round((worldPos.z + half) / CELL_SIZE) * CELL_SIZE - half + CELL_SIZE / 2;
    // Clamp to grid bounds
    const clamped = {
      x: Math.max(-half + CELL_SIZE / 2, Math.min(half - CELL_SIZE / 2, x)),
      z: Math.max(-half + CELL_SIZE / 2, Math.min(half - CELL_SIZE / 2, z))
    };
    return new THREE.Vector3(clamped.x, 0, clamped.z);
  }

  function raycastGround(event, canvasRect) {
    const x = ((event.clientX - canvasRect.left) / canvasRect.width) * 2 - 1;
    const y = -((event.clientY - canvasRect.top) / canvasRect.height) * 2 + 1;
    mouse.set(x, y);
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(groundPlane);
    if (intersects.length > 0) return intersects[0].point;
    return null;
  }

  function raycastObjects(event, canvasRect, objects) {
    const x = ((event.clientX - canvasRect.left) / canvasRect.width) * 2 - 1;
    const y = -((event.clientY - canvasRect.top) / canvasRect.height) * 2 + 1;
    mouse.set(x, y);
    raycaster.setFromCamera(mouse, camera);
    return raycaster.intersectObjects(objects, true);
  }

  return {
    init,
    getScene: () => scene,
    getCamera: () => camera,
    getRenderer: () => renderer,
    getControls: () => controls,
    snapToGrid,
    raycastGround,
    raycastObjects,
    handleResize,
    GRID_SIZE,
    CELL_SIZE
  };
})();
