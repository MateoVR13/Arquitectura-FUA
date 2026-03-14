/* ==========================================
   CHALLENGES.JS — Challenge Scenarios
   ========================================== */
const Challenges = (() => {
  const list = [
    {
      id: 'templo_clasico',
      name: '🏛️ Templo Clásico',
      era: 'clasica',
      description: 'Construye un templo griego con columnata, entablamento y frontón. Logra la simetría y la proporción de los órdenes clásicos.',
      objectives: [
        { label: 'Columnas (mín. 6)', check: (pieces) => pieces.filter(p => p.def.geomType === 'column').length >= 6 },
        { label: 'Entablamento', check: (pieces) => pieces.some(p => p.def.geomType === 'beam') },
        { label: 'Frontón', check: (pieces) => pieces.some(p => p.def.geomType === 'pediment') },
        { label: 'Plataforma base', check: (pieces) => pieces.some(p => p.def.geomType === 'platform') }
      ],
      targetCount: 12,
      bonusLabel: 'Bonus: Usa los 3 órdenes de columnas'
    },
    {
      id: 'nave_gotica',
      name: '⛪ Nave Gótica',
      era: 'gotica',
      description: 'Construye la nave central de una catedral gótica con arcos apuntados, bóvedas de crucería y arbotantes. Busca la verticalidad.',
      objectives: [
        { label: 'Arcos apuntados (mín. 3)', check: (pieces) => pieces.filter(p => p.def.geomType === 'pointed_arch').length >= 3 },
        { label: 'Bóveda de crucería', check: (pieces) => pieces.some(p => p.def.geomType === 'ribbed_vault') },
        { label: 'Arbotante', check: (pieces) => pieces.some(p => p.def.geomType === 'flying_buttress') },
        { label: 'Pilares compuestos (mín. 4)', check: (pieces) => pieces.filter(p => p.def.geomType === 'clustered_pier').length >= 4 },
        { label: 'Rosetón', check: (pieces) => pieces.some(p => p.def.geomType === 'rose_window') }
      ],
      targetCount: 14,
      bonusLabel: 'Bonus: Añade pináculos y gárgolas'
    },
    {
      id: 'palazzo_renacentista',
      name: '🏰 Palazzo Renacentista',
      era: 'renacentista',
      description: 'Construye una fachada de palacio renacentista con cúpula central, arcos de medio punto y pilastras. La proporción es clave.',
      objectives: [
        { label: 'Cúpula', check: (pieces) => pieces.some(p => p.def.geomType === 'dome') },
        { label: 'Tambor', check: (pieces) => pieces.some(p => p.def.geomType === 'drum') },
        { label: 'Arcos de medio punto (mín. 2)', check: (pieces) => pieces.filter(p => p.def.geomType === 'round_arch').length >= 2 },
        { label: 'Pilastras (mín. 4)', check: (pieces) => pieces.filter(p => p.def.geomType === 'pilaster').length >= 4 },
        { label: 'Balaustrada', check: (pieces) => pieces.some(p => p.def.geomType === 'balustrade') }
      ],
      targetCount: 14,
      bonusLabel: 'Bonus: Añade linterna y almohadillado'
    }
  ];

  let activeChallenge = null;

  function getList() { return list; }
  function getActive() { return activeChallenge; }

  function activate(challengeId) {
    activeChallenge = list.find(c => c.id === challengeId) || null;
    return activeChallenge;
  }

  function deactivate() {
    activeChallenge = null;
  }

  function checkProgress(pieces) {
    if (!activeChallenge) return null;
    const results = activeChallenge.objectives.map(obj => ({
      label: obj.label,
      completed: obj.check(pieces)
    }));
    const completed = results.filter(r => r.completed).length;
    const total = results.length;
    const pct = Math.round((completed / total) * 100);
    return { results, completed, total, pct, allDone: completed === total };
  }

  return { getList, getActive, activate, deactivate, checkProgress };
})();
