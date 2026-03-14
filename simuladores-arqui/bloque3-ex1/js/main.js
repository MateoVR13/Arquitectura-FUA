/* ==========================================
   MAIN.JS — App Bootstrap & Event Wiring (V2)
   Fixes: orbit-drag guard, tool palette,
   tutorial integration
   ========================================== */
const App = (() => {
  let currentEra = 'clasica';
  let currentPieceType = 'structural';

  // Tool system: 'place' | 'delete' | 'rotate' | 'move'
  let activeTool = 'place';
  // For move tool: piece being moved
  let movingPiece = null;

  // Orbit-drag guard: track mousedown position
  let mouseDownPos = null;
  const DRAG_THRESHOLD = 5; // px — below this = click, above = orbit drag

  function init() {
    const canvas = document.getElementById('three-canvas');
    SceneManager.init(canvas);

    UI.setEraTheme(currentEra);
    UI.renderEraInfo(currentEra);
    UI.renderPiecePanel(currentEra, currentPieceType);
    UI.renderChallengeModal();
    UI.updatePieceCounter(0);

    wireEraTabs();
    wireTypeBtns();
    wireCanvas(canvas);
    wireKeyboard();
    wireHeaderButtons();
    wireToolbar();

    // Hide loading screen
    setTimeout(() => {
      document.getElementById('loading-screen').classList.add('hidden');

      // Start tutorial if first visit
      if (Tutorial.shouldShow()) {
        setTimeout(() => Tutorial.start(() => {
          UI.showToast('success', '¡Tutorial completado!', 'Ya puedes construir libremente. Selecciona una pieza y haz clic en el grid.', 5000);
        }), 600);
      } else {
        setTimeout(() => {
          UI.showToast('info', 'Bienvenido', 'Selecciona una pieza y haz clic en el grid para construir.', 4000);
        }, 400);
      }
    }, 2200);
  }

  // --- Tool system ---
  function setTool(tool) {
    activeTool = tool;
    movingPiece = null;
    Builder.clearHover();
    Builder.selectPlacedPiece(null);
    document.querySelectorAll('.tool-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tool === tool);
    });

    // Update cursor style
    const canvas = document.getElementById('three-canvas');
    canvas.style.cursor = tool === 'place' ? 'crosshair' : tool === 'delete' ? 'not-allowed' : tool === 'move' ? 'grab' : 'pointer';

    // If switching away from place, clear ghost
    if (tool !== 'place') {
      Builder.clearGhost();
      document.querySelectorAll('.piece-card.selected').forEach(c => c.classList.remove('selected'));
    }

    // Update placement hint
    const hint = document.getElementById('placement-hint');
    const labels = {
      place: 'Click en el grid para colocar · <kbd>Esc</kbd> Cancelar',
      delete: 'Click sobre una pieza para eliminarla (resaltada en rojo)',
      rotate: 'Click sobre una pieza para rotarla 90°',
      move: 'Click sobre una pieza y luego click en nueva posición'
    };
    hint.innerHTML = labels[tool];
    hint.classList.remove('hidden');
  }

  function wireToolbar() {
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => setTool(btn.dataset.tool));
    });
    // Tutorial reset (hidden feature for testing)
    const tutBtn = document.getElementById('btn-tutorial');
    if (tutBtn) {
      tutBtn.addEventListener('click', () => {
        Tutorial.reset();
        Tutorial.start(() => {
          UI.showToast('success', '¡Tutorial completado!', 'Ya puedes construir libremente.', 4000);
        });
      });
    }
  }

  function wireEraTabs() {
    document.querySelectorAll('.era-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        currentEra = tab.dataset.era;
        UI.setEraTheme(currentEra);
        UI.renderEraInfo(currentEra);
        UI.renderPiecePanel(currentEra, currentPieceType);
        Builder.clearGhost();
        refreshScoring();
      });
    });
  }

  function wireTypeBtns() {
    document.querySelectorAll('.type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPieceType = btn.dataset.type;
        UI.setPieceTypeActive(currentPieceType);
        UI.renderPiecePanel(currentEra, currentPieceType);
        Builder.clearGhost();
      });
    });
  }

  function wireCanvas(canvas) {
    const getRect = () => canvas.getBoundingClientRect();
    let wasDragging = false;

    // Track mousedown for drag detection
    canvas.addEventListener('mousedown', (e) => {
      mouseDownPos = { x: e.clientX, y: e.clientY };
      wasDragging = false;
    });

    // Movement: ghost preview, drag detection, tool hover highlights
    canvas.addEventListener('mousemove', (e) => {
      // Detect dragging for orbit guard
      if (mouseDownPos) {
        const dx = e.clientX - mouseDownPos.x;
        const dy = e.clientY - mouseDownPos.y;
        if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
          wasDragging = true;
        }
      }

      if (Tutorial.isActive()) return;

      if (activeTool === 'place' && Builder.getSelectedPieceDef()) {
        const point = SceneManager.raycastGround(e, getRect());
        if (point) Builder.updateGhostPosition(point);
        else Builder.hideGhost();
      }

      if (activeTool === 'delete' || activeTool === 'rotate' || (activeTool === 'move' && !movingPiece)) {
        const meshes = Builder.getPlacedMeshes();
        if (meshes.length > 0) {
          const hits = SceneManager.raycastObjects(e, getRect(), meshes);
          if (hits.length > 0) {
            const piece = Builder.findPieceFromHit(hits[0].object);
            if (piece) {
              const colors = { delete: 0xff3333, rotate: 0x33ff66, move: 0x3399ff };
              Builder.setHoveredPiece(piece, colors[activeTool]);
              canvas.style.cursor = activeTool === 'delete' ? 'not-allowed' : 'pointer';
            }
          } else {
            Builder.clearHover();
            const cursors = { delete: 'default', rotate: 'default', move: 'grab' };
            canvas.style.cursor = cursors[activeTool] || 'default';
          }
        }
      }

      // Move tool: show ghost of piece being moved
      if (activeTool === 'move' && movingPiece) {
        const point = SceneManager.raycastGround(e, getRect());
        if (point) {
          const snapped = SceneManager.snapToGrid(point);
          movingPiece.mesh.position.set(snapped.x, 0, snapped.z);
        }
      }
    });

    // Use 'click' event (fires reliably even with OrbitControls)
    // with wasDragging flag to distinguish orbit drags from placement clicks
    canvas.addEventListener('click', (e) => {
      if (Tutorial.isActive()) return;
      if (wasDragging) {
        wasDragging = false;
        mouseDownPos = null;
        return; // Was an orbit drag, not a placement click
      }
      mouseDownPos = null;
      handleCanvasClick(e, getRect());
    });

    canvas.addEventListener('mouseleave', () => {
      Builder.hideGhost();
      Builder.clearHover();
    });
  }

  function handleCanvasClick(e, canvasRect) {
    switch (activeTool) {
      case 'place': {
        if (!Builder.getSelectedPieceDef()) {
          // Try selecting existing piece
          const meshes = Builder.getPlacedMeshes();
          if (meshes.length > 0) {
            const hits = SceneManager.raycastObjects(e, canvasRect, meshes);
            if (hits.length > 0) {
              const piece = Builder.findPieceFromHit(hits[0].object);
              if (piece) Builder.selectPlacedPiece(piece);
            } else {
              Builder.selectPlacedPiece(null);
            }
          }
          return;
        }
        const point = SceneManager.raycastGround(e, canvasRect);
        if (point) {
          const placed = Builder.placePiece(point);
          if (placed) {
            const ana = Validator.checkAnachronism(placed.def, currentEra);
            if (ana) UI.showToast('warning', ana.title, ana.message);
            const struct = Validator.checkStructure(placed, Builder.getPlacedPieces());
            struct.forEach(s => UI.showToast(s.severity, s.title, s.message));
            refreshScoring();
          }
        }
        break;
      }
      case 'delete': {
        const meshes = Builder.getPlacedMeshes();
        const hits = SceneManager.raycastObjects(e, canvasRect, meshes);
        if (hits.length > 0) {
          const piece = Builder.findPieceFromHit(hits[0].object);
          if (piece) {
            Builder.deletePiece(piece);
            refreshScoring();
            UI.showToast('info', 'Pieza eliminada', `"${piece.def.name}" ha sido removida.`);
          }
        }
        break;
      }
      case 'rotate': {
        const meshes2 = Builder.getPlacedMeshes();
        const hits2 = SceneManager.raycastObjects(e, canvasRect, meshes2);
        if (hits2.length > 0) {
          const piece = Builder.findPieceFromHit(hits2[0].object);
          if (piece) {
            Builder.rotatePiece(piece);
            UI.showToast('info', 'Pieza rotada', `"${piece.def.name}" rotada a ${piece.rotation}°.`, 2000);
          }
        }
        break;
      }
      case 'move': {
        if (!movingPiece) {
          // Pick up piece
          const meshes3 = Builder.getPlacedMeshes();
          const hits3 = SceneManager.raycastObjects(e, canvasRect, meshes3);
          if (hits3.length > 0) {
            const piece = Builder.findPieceFromHit(hits3[0].object);
            if (piece) {
              movingPiece = piece;
              Builder.selectPlacedPiece(piece);
              const canvas = document.getElementById('three-canvas');
              canvas.style.cursor = 'grabbing';
              UI.showToast('info', 'Moviendo pieza', 'Haz clic en la nueva posición.', 2500);
            }
          }
        } else {
          // Place piece at new position
          const point = SceneManager.raycastGround(e, canvasRect);
          if (point) {
            Builder.movePiece(movingPiece, point);
            refreshScoring();
            UI.showToast('info', 'Pieza movida', `"${movingPiece.def.name}" reubicada.`, 2000);
            movingPiece = null;
            Builder.selectPlacedPiece(null);
            document.getElementById('three-canvas').style.cursor = 'grab';
          }
        }
        break;
      }
    }
  }

  function wireKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (Tutorial.isActive()) return;
      const key = e.key.toLowerCase();

      if (key === 'escape') {
        Builder.clearGhost();
        Builder.selectPlacedPiece(null);
        Builder.clearHover();
        movingPiece = null;
        document.querySelectorAll('.piece-card.selected').forEach(c => c.classList.remove('selected'));
        setTool('place');
        return;
      }
      if (key === '1') { setTool('place'); return; }
      if (key === '2') { setTool('move'); return; }
      if (key === '3') { setTool('rotate'); return; }
      if (key === '4') { setTool('delete'); return; }

      if (key === 'r' && activeTool === 'place') {
        const selected = Builder.getSelectedPlacedPiece();
        if (selected) Builder.rotatePiece(selected);
        return;
      }
      if ((key === 'delete' || key === 'backspace') && activeTool === 'place') {
        e.preventDefault();
        const selected = Builder.getSelectedPlacedPiece();
        if (selected) {
          Builder.deletePiece(selected);
          refreshScoring();
          UI.showToast('info', 'Pieza eliminada', 'La pieza ha sido removida.');
        }
      }
    });
  }

  function wireHeaderButtons() {
    document.getElementById('btn-challenge').addEventListener('click', () => {
      UI.renderChallengeModal();
      document.getElementById('challenge-modal').classList.remove('hidden');
    });
    document.getElementById('close-challenge-modal').addEventListener('click', () => {
      document.getElementById('challenge-modal').classList.add('hidden');
    });
    document.querySelector('.modal-backdrop')?.addEventListener('click', () => {
      document.getElementById('challenge-modal').classList.add('hidden');
    });
    document.getElementById('btn-clear').addEventListener('click', () => {
      if (Builder.getPlacedPieces().length === 0) return;
      Builder.clearAll();
      refreshScoring();
      UI.showToast('info', 'Escena limpiada', 'Todas las piezas han sido removidas.');
    });
  }

  function refreshScoring() {
    const pieces = Builder.getPlacedPieces();
    const challenge = Challenges.getActive();
    const scores = Scoring.calculate(pieces, currentEra, challenge);
    Scoring.updateGauges(scores);
    UI.updatePieceCounter(pieces.length);
    const alerts = Validator.validateAll(pieces, currentEra);
    UI.renderAlerts(alerts);
    if (challenge) {
      const progress = Challenges.checkProgress(pieces);
      UI.updateChallengeProgress(progress);
      if (progress && progress.allDone) {
        UI.showToast('success', '🎉 ¡Reto completado!', `Has completado todos los objetivos de "${challenge.name}".`, 6000);
      }
    }
  }

  function startChallenge(id) {
    const ch = Challenges.activate(id);
    if (!ch) return;
    currentEra = ch.era;
    UI.setEraTheme(currentEra);
    UI.renderEraInfo(currentEra);
    UI.renderPiecePanel(currentEra, currentPieceType);
    Builder.clearAll();
    setTool('place');
    refreshScoring();
    UI.showToast('info', `Reto: ${ch.name}`, ch.description, 6000);
  }

  return { init, startChallenge, refreshScoring, setTool };
})();

document.addEventListener('DOMContentLoaded', App.init);
