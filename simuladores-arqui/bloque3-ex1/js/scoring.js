/* ==========================================
   SCORING.JS — Scoring Engine
   ========================================== */
const Scoring = (() => {
  const MAX_SCORE = 25;
  const CIRCUMFERENCE = 2 * Math.PI * 34; // ~213.6

  function calculate(placedPieces, currentEra, challenge) {
    if (placedPieces.length === 0) {
      return { coherence: 0, structure: 0, completeness: 0, spatial: 0, total: 0 };
    }

    // 1. Coherencia Histórica (0-25): % of pieces matching current era
    const matching = placedPieces.filter(p => p.def.era === currentEra).length;
    const coherence = Math.round((matching / placedPieces.length) * MAX_SCORE);

    // 2. Lógica Estructural (0-25): % of pieces without structural errors
    let structErrors = 0;
    placedPieces.forEach(p => {
      const issues = Validator.checkStructure(p, placedPieces);
      if (issues.some(i => i.severity === 'error')) structErrors++;
    });
    const structure = Math.round(((placedPieces.length - structErrors) / placedPieces.length) * MAX_SCORE);

    // 3. Completitud (0-25): pieces placed vs target
    let completeness = 0;
    if (challenge) {
      const target = challenge.targetCount || 10;
      completeness = Math.min(MAX_SCORE, Math.round((placedPieces.length / target) * MAX_SCORE));
    } else {
      completeness = Math.min(MAX_SCORE, Math.round((placedPieces.length / 10) * MAX_SCORE));
    }

    // 4. Organización Espacial (0-25): spread + symmetry
    const spatial = calculateSpatial(placedPieces);

    const total = coherence + structure + completeness + spatial;
    return { coherence, structure, completeness, spatial, total };
  }

  function calculateSpatial(pieces) {
    if (pieces.length < 2) return 0;

    // Calculate spread (how well pieces use the grid)
    const xs = pieces.map(p => p.gridX);
    const zs = pieces.map(p => p.gridZ);
    const rangeX = Math.max(...xs) - Math.min(...xs);
    const rangeZ = Math.max(...zs) - Math.min(...zs);
    const spreadScore = Math.min(1, (rangeX + rangeZ) / 16);

    // Calculate symmetry (mirror along X axis)
    const centerX = xs.reduce((a, b) => a + b, 0) / xs.length;
    let symCount = 0;
    pieces.forEach(p => {
      const mirrorX = 2 * centerX - p.gridX;
      if (pieces.some(q => q.id !== p.id && Math.abs(q.gridX - mirrorX) < 2.5 && Math.abs(q.gridZ - p.gridZ) < 2.5)) {
        symCount++;
      }
    });
    const symScore = symCount / pieces.length;

    // Variety bonus
    const types = new Set(pieces.map(p => p.def.geomType));
    const varietyScore = Math.min(1, types.size / 5);

    const raw = (spreadScore * 0.35 + symScore * 0.4 + varietyScore * 0.25) * MAX_SCORE;
    return Math.round(raw);
  }

  function updateGauges(scores) {
    const keys = ['coherence', 'structure', 'completeness', 'spatial'];
    keys.forEach(key => {
      const gauge = document.getElementById('gauge-' + key);
      const val = document.getElementById('val-' + key);
      if (gauge && val) {
        const pct = scores[key] / MAX_SCORE;
        const offset = CIRCUMFERENCE * (1 - pct);
        gauge.style.strokeDashoffset = offset;
        val.textContent = scores[key];
      }
    });
    const totalEl = document.getElementById('total-score');
    if (totalEl) totalEl.textContent = scores.total;
  }

  return { calculate, updateGauges };
})();
