/* ==========================================
   BUILDER.JS — Assembly Logic (V2)
   Fixes: stacking, orbit-drag guard, tool modes,
   red highlight for delete, move support
   ========================================== */
const Builder = (() => {
  let placedPieces = [];
  let selectedPieceDef = null;
  let ghostMesh = null;
  let selectedPlacedPiece = null;
  const placedMeshes = [];

  // Hover highlight for delete/rotate/move tools
  let hoveredPiece = null;
  const _origMaterials = new WeakMap();

  // --- Geometry creation (unchanged from V1) ---
  function createGeometry(def) {
    const era = ERAS[def.era];
    const mainColor = era.materialColor;
    const secColor = era.secondaryColor;
    let group = new THREE.Group();
    let mat = new THREE.MeshStandardMaterial({ color: mainColor, roughness: 0.55, metalness: 0.15 });
    let matDark = new THREE.MeshStandardMaterial({ color: secColor, roughness: 0.65, metalness: 0.1 });

    switch (def.geomType) {
      case 'column': {
        const base = new THREE.Mesh(new THREE.CylinderGeometry(def.radius * 1.3, def.radius * 1.4, 0.15, def.segments || 12), matDark);
        base.position.y = 0.075; group.add(base);
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(def.radius * 0.85, def.radius, def.height - 0.5, def.segments || 12), mat);
        shaft.position.y = def.height / 2; shaft.castShadow = true; group.add(shaft);
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(def.radius * 1.4, def.radius * 0.9, 0.3, def.segments || 12), matDark);
        cap.position.y = def.height - 0.1; group.add(cap);
        break;
      }
      case 'beam': {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(def.width, def.height, def.depth), mat);
        beam.position.y = def.height / 2; beam.castShadow = true; group.add(beam);
        const edge = new THREE.Mesh(new THREE.BoxGeometry(def.width + 0.1, 0.08, def.depth + 0.05), matDark);
        edge.position.y = 0; group.add(edge);
        break;
      }
      case 'pediment': {
        const shape = new THREE.Shape();
        shape.moveTo(-def.width / 2, 0); shape.lineTo(0, def.height);
        shape.lineTo(def.width / 2, 0); shape.lineTo(-def.width / 2, 0);
        const ped = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: def.depth, bevelEnabled: false }), mat);
        ped.position.z = -def.depth / 2; ped.castShadow = true; group.add(ped);
        break;
      }
      case 'barrel_vault': {
        const shape2 = new THREE.Shape(); shape2.moveTo(-def.width / 2, 0);
        for (let i = 0; i <= 20; i++) {
          const angle = Math.PI * (i / 20);
          shape2.lineTo(-def.width / 2 + (def.width * i) / 20, Math.sin(angle) * def.height);
        }
        shape2.lineTo(-def.width / 2, 0);
        const vault = new THREE.Mesh(new THREE.ExtrudeGeometry(shape2, { depth: def.depth, bevelEnabled: false }), mat);
        vault.position.z = -def.depth / 2; vault.castShadow = true; group.add(vault);
        break;
      }
      case 'wall': {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(def.width, def.height, def.depth), mat);
        wall.position.y = def.height / 2; wall.castShadow = true; group.add(wall);
        break;
      }
      case 'platform': {
        const plat = new THREE.Mesh(new THREE.BoxGeometry(def.width, def.height, def.depth), matDark);
        plat.position.y = def.height / 2; plat.receiveShadow = true; group.add(plat);
        break;
      }
      case 'pointed_arch': {
        const s = new THREE.Shape(); const hw = def.width / 2;
        s.moveTo(-hw, 0); s.lineTo(-hw, def.height * 0.5);
        s.quadraticCurveTo(-hw * 0.3, def.height, 0, def.height);
        s.quadraticCurveTo(hw * 0.3, def.height, hw, def.height * 0.5); s.lineTo(hw, 0);
        const hole = new THREE.Path(); const iw = hw * 0.75; const ih = def.height * 0.85;
        hole.moveTo(-iw, 0); hole.lineTo(-iw, ih * 0.5);
        hole.quadraticCurveTo(-iw * 0.3, ih, 0, ih);
        hole.quadraticCurveTo(iw * 0.3, ih, iw, ih * 0.5);
        hole.lineTo(iw, 0); hole.lineTo(-iw, 0); s.holes.push(hole);
        const arch = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: def.depth, bevelEnabled: false }), mat);
        arch.position.z = -def.depth / 2; arch.castShadow = true; group.add(arch);
        break;
      }
      case 'ribbed_vault': {
        const rv = new THREE.Mesh(new THREE.SphereGeometry(def.width * 0.7, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat);
        rv.castShadow = true; group.add(rv);
        const ribMat = new THREE.MeshStandardMaterial({ color: secColor, roughness: 0.5, metalness: 0.2 });
        for (let r = 0; r < 4; r++) {
          const curve = new THREE.EllipseCurve(0, 0, def.width * 0.72, def.width * 0.72, 0, Math.PI, false);
          const pts = curve.getPoints(16);
          const path3d = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p.x, p.y, 0)));
          const ribMesh = new THREE.Mesh(new THREE.TubeGeometry(path3d, 16, 0.04, 4, false), ribMat);
          ribMesh.rotation.y = (r * Math.PI) / 4; group.add(ribMesh);
        }
        break;
      }
      case 'flying_buttress': {
        const fbShape = new THREE.Shape();
        fbShape.moveTo(0, 0); fbShape.lineTo(def.width, def.height);
        fbShape.lineTo(def.width, def.height - 0.3); fbShape.lineTo(0.3, 0);
        const fb = new THREE.Mesh(new THREE.ExtrudeGeometry(fbShape, { depth: def.depth, bevelEnabled: false }), mat);
        fb.position.z = -def.depth / 2; fb.castShadow = true; group.add(fb);
        break;
      }
      case 'clustered_pier': {
        const mainShaft = new THREE.Mesh(new THREE.CylinderGeometry(def.radius, def.radius * 1.1, def.height, 8), mat);
        mainShaft.position.y = def.height / 2; mainShaft.castShadow = true; group.add(mainShaft);
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2;
          const sm = new THREE.Mesh(new THREE.CylinderGeometry(def.radius * 0.35, def.radius * 0.4, def.height, 6), matDark);
          sm.position.set(Math.cos(angle) * def.radius * 1.1, def.height / 2, Math.sin(angle) * def.radius * 1.1);
          sm.castShadow = true; group.add(sm);
        }
        break;
      }
      case 'counterfuerte': {
        const cf = new THREE.Mesh(new THREE.BoxGeometry(def.width, def.height, def.depth), mat);
        cf.position.y = def.height / 2; cf.castShadow = true; group.add(cf);
        const cfTop = new THREE.Mesh(new THREE.BoxGeometry(def.width + 0.1, 0.2, def.depth + 0.1), matDark);
        cfTop.position.y = def.height; group.add(cfTop);
        break;
      }
      case 'dome': {
        const dome = new THREE.Mesh(new THREE.SphereGeometry(def.radius, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat);
        dome.castShadow = true; group.add(dome);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(def.radius, 0.08, 8, 24), matDark);
        ring.rotation.x = Math.PI / 2; group.add(ring);
        break;
      }
      case 'round_arch': {
        const ra = new THREE.Shape(); const hw3 = def.width / 2;
        ra.moveTo(-hw3, 0); ra.lineTo(-hw3, def.height - hw3);
        ra.absarc(0, def.height - hw3, hw3, Math.PI, 0, false); ra.lineTo(hw3, 0);
        const hole3 = new THREE.Path(); const iw3 = hw3 * 0.75;
        hole3.moveTo(-iw3, 0); hole3.lineTo(-iw3, def.height - hw3);
        hole3.absarc(0, def.height - hw3, iw3, Math.PI, 0, false);
        hole3.lineTo(iw3, 0); hole3.lineTo(-iw3, 0); ra.holes.push(hole3);
        const raMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(ra, { depth: def.depth || 0.5, bevelEnabled: false }), mat);
        raMesh.position.z = -(def.depth || 0.5) / 2; raMesh.castShadow = true; group.add(raMesh);
        break;
      }
      case 'pilaster': {
        const pil = new THREE.Mesh(new THREE.BoxGeometry(def.width, def.height, def.depth), mat);
        pil.position.y = def.height / 2; pil.castShadow = true; group.add(pil);
        const pilCap = new THREE.Mesh(new THREE.BoxGeometry(def.width * 1.5, 0.2, def.depth * 2), matDark);
        pilCap.position.y = def.height; group.add(pilCap);
        break;
      }
      case 'cornice': {
        const cor = new THREE.Mesh(new THREE.BoxGeometry(def.width, def.height, def.depth), mat);
        cor.position.y = def.height / 2; group.add(cor);
        const corLip = new THREE.Mesh(new THREE.BoxGeometry(def.width + 0.05, 0.06, def.depth + 0.15), matDark);
        corLip.position.y = def.height; group.add(corLip);
        break;
      }
      case 'drum': {
        const drum = new THREE.Mesh(new THREE.CylinderGeometry(def.radius, def.radius * 1.05, def.height, 24), mat);
        drum.position.y = def.height / 2; drum.castShadow = true; group.add(drum);
        break;
      }
      case 'capital': case 'capital_ionic': case 'ornament_block':
      case 'ornament_small': case 'curved_pediment': {
        const w = def.width || 0.5, h = def.height || 0.3, d = def.depth || 0.3;
        const ornMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        ornMesh.position.y = h / 2; ornMesh.castShadow = true; group.add(ornMesh);
        break;
      }
      case 'molding': {
        const mol = new THREE.Mesh(new THREE.BoxGeometry(def.width, def.height, def.depth), mat);
        mol.position.y = def.height / 2; group.add(mol);
        break;
      }
      case 'rose_window': {
        const rw = new THREE.Mesh(new THREE.TorusGeometry(def.radius, 0.08, 8, 24), mat);
        rw.position.y = def.radius; group.add(rw);
        for (let i = 0; i < 8; i++) {
          const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.04, def.radius * 1.8, 0.04), matDark);
          spoke.rotation.z = (i * Math.PI) / 4; spoke.position.y = def.radius; group.add(spoke);
        }
        break;
      }
      case 'tracery_panel': {
        const tp = new THREE.Mesh(new THREE.BoxGeometry(def.width, def.height, 0.1), mat);
        tp.position.y = def.height / 2; tp.castShadow = true; group.add(tp);
        break;
      }
      case 'gargoyle': {
        const gar = new THREE.Mesh(new THREE.BoxGeometry(def.width, def.height, def.depth), mat);
        gar.position.y = def.height / 2; gar.position.z = def.depth / 2; gar.castShadow = true; group.add(gar);
        break;
      }
      case 'pinnacle': {
        const pin = new THREE.Mesh(new THREE.ConeGeometry(def.radius, def.height, 4), mat);
        pin.position.y = def.height / 2; pin.castShadow = true; group.add(pin);
        break;
      }
      case 'rustication': {
        for (let r = 0; r < 3; r++) {
          const block = new THREE.Mesh(new THREE.BoxGeometry(def.width - 0.04, def.height / 3 - 0.03, def.depth), mat);
          block.position.y = (r + 0.5) * (def.height / 3); block.castShadow = true; group.add(block);
        }
        break;
      }
      case 'balustrade': {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(def.width, 0.06, def.depth), matDark);
        rail.position.y = def.height; group.add(rail);
        const base2 = new THREE.Mesh(new THREE.BoxGeometry(def.width, 0.06, def.depth), matDark);
        base2.position.y = 0.03; group.add(base2);
        const count = Math.floor(def.width / 0.15);
        for (let b = 0; b < count; b++) {
          const bal = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, def.height - 0.12, 6), mat);
          bal.position.set(-def.width / 2 + 0.075 + b * (def.width / count), def.height / 2, 0);
          group.add(bal);
        }
        break;
      }
      case 'medallion': {
        const med = new THREE.Mesh(new THREE.CylinderGeometry(def.radius, def.radius, 0.1, 24), mat);
        med.rotation.x = Math.PI / 2; med.position.y = def.radius; med.castShadow = true; group.add(med);
        break;
      }
      case 'lantern': {
        const lanBase = new THREE.Mesh(new THREE.CylinderGeometry(def.radius, def.radius * 1.1, def.height * 0.6, 8), mat);
        lanBase.position.y = def.height * 0.3; group.add(lanBase);
        const lanTop = new THREE.Mesh(new THREE.ConeGeometry(def.radius * 0.8, def.height * 0.4, 8), matDark);
        lanTop.position.y = def.height * 0.8; group.add(lanTop);
        break;
      }
      default: {
        const fallback = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat);
        fallback.position.y = 0.5; fallback.castShadow = true; group.add(fallback);
      }
    }
    return group;
  }

  // --- Get piece height for stacking ---
  function getPieceHeight(def) {
    return def.height || def.radius || 1;
  }

  // --- Calculate Y position: stack on top of pieces in same cell ---
  function getStackY(gridX, gridZ) {
    let maxTop = 0;
    const tol = 0.5;
    placedPieces.forEach(p => {
      if (Math.abs(p.gridX - gridX) < tol && Math.abs(p.gridZ - gridZ) < tol) {
        const top = p.baseY + getPieceHeight(p.def);
        if (top > maxTop) maxTop = top;
      }
    });
    return maxTop;
  }

  // --- Ghost ---
  function setSelectedPiece(def) {
    clearGhost();
    selectedPieceDef = def;
    if (def) {
      ghostMesh = createGeometry(def);
      ghostMesh.traverse(child => {
        if (child.isMesh) {
          child.material = child.material.clone();
          child.material.transparent = true;
          child.material.opacity = 0.45;
          child.material.depthWrite = false;
        }
      });
      ghostMesh.visible = false;
      ghostMesh.name = '__ghost__';
      SceneManager.getScene().add(ghostMesh);
    }
  }

  function clearGhost() {
    if (ghostMesh) {
      SceneManager.getScene().remove(ghostMesh);
      ghostMesh = null;
    }
    selectedPieceDef = null;
  }

  function updateGhostPosition(worldPoint) {
    if (!ghostMesh) return;
    const snapped = SceneManager.snapToGrid(worldPoint);
    const y = getStackY(snapped.x, snapped.z);
    ghostMesh.position.set(snapped.x, y, snapped.z);
    ghostMesh.visible = true;
  }

  function hideGhost() {
    if (ghostMesh) ghostMesh.visible = false;
  }

  // --- Placement with stacking ---
  function placePiece(worldPoint) {
    if (!selectedPieceDef) return null;
    const snapped = SceneManager.snapToGrid(worldPoint);
    const y = getStackY(snapped.x, snapped.z);

    const mesh = createGeometry(selectedPieceDef);
    mesh.position.set(snapped.x, y, snapped.z);
    mesh.castShadow = true;
    mesh.name = 'placed_' + selectedPieceDef.id + '_' + Date.now();

    const pieceData = {
      id: mesh.name,
      def: selectedPieceDef,
      mesh: mesh,
      gridX: snapped.x,
      gridZ: snapped.z,
      baseY: y,
      rotation: 0
    };

    mesh.userData = pieceData;
    SceneManager.getScene().add(mesh);
    placedPieces.push(pieceData);
    placedMeshes.push(mesh);
    return pieceData;
  }

  function rotatePiece(pieceData) {
    if (!pieceData) return;
    pieceData.rotation = (pieceData.rotation + 90) % 360;
    pieceData.mesh.rotation.y = THREE.MathUtils.degToRad(pieceData.rotation);
  }

  function deletePiece(pieceData) {
    if (!pieceData) return;
    SceneManager.getScene().remove(pieceData.mesh);
    placedPieces = placedPieces.filter(p => p.id !== pieceData.id);
    const idx = placedMeshes.indexOf(pieceData.mesh);
    if (idx > -1) placedMeshes.splice(idx, 1);
    if (selectedPlacedPiece === pieceData) selectedPlacedPiece = null;
    if (hoveredPiece === pieceData) hoveredPiece = null;
  }

  // --- Move piece to new grid position ---
  function movePiece(pieceData, worldPoint) {
    if (!pieceData) return;
    const snapped = SceneManager.snapToGrid(worldPoint);
    const y = getStackY(snapped.x, snapped.z);
    pieceData.mesh.position.set(snapped.x, y, snapped.z);
    pieceData.gridX = snapped.x;
    pieceData.gridZ = snapped.z;
    pieceData.baseY = y;
  }

  // --- Selection & Highlighting ---
  function selectPlacedPiece(pieceData) {
    if (selectedPlacedPiece) {
      _applyEmissive(selectedPlacedPiece.mesh, 0x000000, 0);
    }
    selectedPlacedPiece = pieceData;
    if (pieceData) {
      const era = ERAS[pieceData.def.era];
      _applyEmissive(pieceData.mesh, era.materialColor, 0.25);
    }
  }

  function setHoveredPiece(pieceData, highlightColor) {
    if (hoveredPiece && hoveredPiece !== selectedPlacedPiece) {
      _applyEmissive(hoveredPiece.mesh, 0x000000, 0);
    }
    hoveredPiece = pieceData;
    if (pieceData) {
      _applyEmissive(pieceData.mesh, highlightColor || 0xff3333, 0.5);
    }
  }

  function clearHover() {
    if (hoveredPiece && hoveredPiece !== selectedPlacedPiece) {
      _applyEmissive(hoveredPiece.mesh, 0x000000, 0);
    }
    hoveredPiece = null;
  }

  function _applyEmissive(mesh, color, intensity) {
    mesh.traverse(c => {
      if (c.isMesh) {
        c.material.emissive = new THREE.Color(color);
        c.material.emissiveIntensity = intensity;
      }
    });
  }

  function clearAll() {
    [...placedPieces].forEach(p => deletePiece(p));
    placedPieces = [];
    placedMeshes.length = 0;
    selectedPlacedPiece = null;
    hoveredPiece = null;
  }

  // --- Find piece from raycast hit ---
  function findPieceFromHit(hitObject) {
    let obj = hitObject;
    while (obj) {
      if (obj.userData && obj.userData.def) return obj.userData;
      obj = obj.parent;
    }
    return null;
  }

  return {
    createGeometry, getPieceHeight, getStackY,
    setSelectedPiece, clearGhost, updateGhostPosition, hideGhost,
    placePiece, rotatePiece, deletePiece, movePiece,
    selectPlacedPiece, setHoveredPiece, clearHover, findPieceFromHit,
    clearAll,
    getGhostMesh: () => ghostMesh,
    getSelectedPieceDef: () => selectedPieceDef,
    getSelectedPlacedPiece: () => selectedPlacedPiece,
    getPlacedPieces: () => placedPieces,
    getPlacedMeshes: () => placedMeshes
  };
})();
