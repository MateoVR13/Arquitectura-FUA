/* ==========================================
   VALIDATOR.JS — Anachronism & Structure Logic
   ========================================== */
const Validator = (() => {

  function checkAnachronism(pieceDef, currentEra) {
    if (pieceDef.era !== currentEra) {
      const pieceEra = ERAS[pieceDef.era];
      const curEra = ERAS[currentEra];
      return {
        type: 'anachronism',
        severity: 'warning',
        icon: '⚠️',
        title: '¡Anacronismo detectado!',
        message: `"${pieceDef.name}" pertenece a la ${pieceEra.name} (${pieceEra.period}), pero estás construyendo en la ${curEra.name} (${curEra.period}).`,
        detail: `Esta pieza no es coherente con la era seleccionada. Perderás puntos de coherencia histórica.`
      };
    }
    return null;
  }

  function checkStructure(placedPiece, allPieces) {
    const warnings = [];
    const def = placedPiece.def;
    const gx = placedPiece.gridX;
    const gz = placedPiece.gridZ;

    // Helper: find pieces at/near a grid position
    const piecesAt = (x, z, tolerance) => {
      tolerance = tolerance || 0.5;
      return allPieces.filter(p =>
        p.id !== placedPiece.id &&
        Math.abs(p.gridX - x) < tolerance * 2 &&
        Math.abs(p.gridZ - z) < tolerance * 2
      );
    };

    const hasSupport = (x, z) => {
      const nearby = piecesAt(x, z, 1.2);
      return nearby.some(p =>
        p.def.geomType === 'column' ||
        p.def.geomType === 'clustered_pier' ||
        p.def.geomType === 'wall' ||
        p.def.geomType === 'pilaster' ||
        p.def.geomType === 'counterfuerte'
      );
    };

    // Structural rules
    switch (def.geomType) {
      case 'pointed_arch':
      case 'round_arch':
      case 'barrel_vault':
        if (!hasSupport(gx, gz)) {
          warnings.push({
            type: 'structure',
            severity: 'error',
            icon: '🔴',
            title: 'Sin soporte estructural',
            message: `"${def.name}" necesita columnas, pilares o muros debajo para sostenerse.`,
            detail: 'Coloca columnas o muros adyacentes antes de añadir arcos o bóvedas.'
          });
        }
        break;

      case 'ribbed_vault':
        if (!hasSupport(gx, gz)) {
          warnings.push({
            type: 'structure',
            severity: 'error',
            icon: '🔴',
            title: 'Bóveda sin soporte',
            message: `La bóveda de crucería necesita muros o pilares perimetrales.`,
            detail: 'Las bóvedas de crucería distribuyen empujes a los apoyos.'
          });
        }
        break;

      case 'dome':
        // Needs drum or walls beneath
        const hasDrum = piecesAt(gx, gz, 1.2).some(p => p.def.geomType === 'drum');
        if (!hasDrum && !hasSupport(gx, gz)) {
          warnings.push({
            type: 'structure',
            severity: 'error',
            icon: '🔴',
            title: 'Cúpula sin tambor ni muros',
            message: `La cúpula necesita un tambor o estructura de muros debajo.`,
            detail: 'Coloca un tambor o muros para soportar la cúpula.'
          });
        }
        break;

      case 'pediment':
      case 'beam':
      case 'cornice':
        if (!hasSupport(gx, gz)) {
          warnings.push({
            type: 'structure',
            severity: 'warning',
            icon: '⚠️',
            title: 'Elemento superior sin base',
            message: `"${def.name}" debería apoyarse sobre columnas o muros.`,
            detail: 'Los elementos horizontales requieren soporte vertical.'
          });
        }
        break;

      case 'flying_buttress':
        const hasWall = piecesAt(gx, gz, 1.5).some(p => p.def.geomType === 'wall');
        if (!hasWall) {
          warnings.push({
            type: 'structure',
            severity: 'warning',
            icon: '⚠️',
            title: 'Arbotante sin muro',
            message: `El arbotante debe conectarse a un muro lateral.`,
            detail: 'Los arbotantes transmiten empujes del muro al contrafuerte.'
          });
        }
        break;

      case 'lantern':
        const hasDome = piecesAt(gx, gz, 1.5).some(p => p.def.geomType === 'dome');
        if (!hasDome) {
          warnings.push({
            type: 'structure',
            severity: 'warning',
            icon: '⚠️',
            title: 'Linterna sin cúpula',
            message: `La linterna debería coronar una cúpula.`,
            detail: 'La linterna remata la cúpula permitiendo la entrada de luz.'
          });
        }
        break;
    }

    return warnings;
  }

  function validateAll(pieces, currentEra) {
    const allAlerts = [];
    pieces.forEach(p => {
      const ana = checkAnachronism(p.def, currentEra);
      if (ana) allAlerts.push({ ...ana, pieceId: p.id });
      const struct = checkStructure(p, pieces);
      struct.forEach(s => allAlerts.push({ ...s, pieceId: p.id }));
    });
    return allAlerts;
  }

  return { checkAnachronism, checkStructure, validateAll };
})();
