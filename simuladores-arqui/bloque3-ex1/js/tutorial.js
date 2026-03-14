/* ==========================================
   TUTORIAL.JS — Guided Step-by-Step Tutorial
   ========================================== */
const Tutorial = (() => {
  let currentStep = 0;
  let isActive = false;
  let onComplete = null;

  const steps = [
    {
      target: '#era-tabs',
      title: '🏛️ Eras Arquitectónicas',
      text: 'Aquí puedes seleccionar la era histórica en la que quieres construir: <b>Clásica</b>, <b>Gótica</b> o <b>Renacentista</b>. Cada era tiene piezas y reglas diferentes.',
      position: 'bottom',
      action: null
    },
    {
      target: '#panel-left',
      title: '🧱 Biblioteca de Piezas',
      text: 'Este panel contiene todas las piezas disponibles para la era seleccionada. Están divididas en <b>Estructurales</b> (columnas, muros, arcos) y <b>Ornamentales</b> (capiteles, molduras).',
      position: 'right',
      action: null
    },
    {
      target: '#toolbar',
      title: '🔧 Barra de Herramientas',
      text: 'Usa estas herramientas para interactuar con la escena:<br>• <b>Colocar</b>: selecciona una pieza y haz clic en el grid<br>• <b>Mover</b>: reubica piezas colocadas<br>• <b>Rotar</b>: gira piezas 90° al hacer clic<br>• <b>Eliminar</b>: borra piezas (se resaltan en rojo)',
      position: 'bottom',
      action: null
    },
    {
      target: '#viewport',
      title: '🖥️ Vista 3D',
      text: 'Este es el espacio de construcción. <b>Arrastra con el ratón</b> para rotar la cámara, usa la <b>rueda</b> para zoom. Las piezas se <b>apilan verticalmente</b> cuando las colocas en la misma posición.',
      position: 'left',
      action: null
    },
    {
      target: '#scoring-section',
      title: '📊 Puntuación',
      text: 'Tu construcción se evalúa en 4 ejes:<br>• <b>Coherencia</b>: piezas de la era correcta<br>• <b>Estructura</b>: lógica constructiva<br>• <b>Completitud</b>: cantidad de piezas<br>• <b>Espacial</b>: simetría y distribución',
      position: 'left',
      action: null
    },
    {
      target: '#alerts-section',
      title: '⚠️ Alertas',
      text: 'Si colocas una pieza de una era diferente, el sistema detecta el <b>anacronismo</b>. También te avisa si una pieza no tiene soporte estructural.',
      position: 'left',
      action: null
    },
    {
      target: '#btn-challenge',
      title: '⭐ Retos Arquitectónicos',
      text: 'Abre los retos para construir estructuras específicas como un <b>Templo Clásico</b>, una <b>Nave Gótica</b> o un <b>Palazzo Renacentista</b>. ¡Completa los objetivos para obtener la puntuación máxima!',
      position: 'bottom',
      action: null
    },
    {
      target: null,
      title: '🎉 ¡Listo para construir!',
      text: 'Ya conoces todas las herramientas. Ahora puedes explorar libremente, seleccionar una era y empezar a construir tu estructura histórica. ¡Buena suerte, arquitecto!',
      position: 'center',
      action: null
    }
  ];

  function start(callback) {
    onComplete = callback;
    isActive = true;
    currentStep = 0;
    _render();
  }

  function _render() {
    // Remove existing overlay
    _cleanup();

    if (currentStep >= steps.length) {
      _finish();
      return;
    }

    const step = steps[currentStep];
    const overlay = document.createElement('div');
    overlay.id = 'tutorial-overlay';
    overlay.className = 'tutorial-overlay';

    // Dark backdrop with spotlight
    const backdrop = document.createElement('div');
    backdrop.className = 'tutorial-backdrop';
    overlay.appendChild(backdrop);

    // Spotlight the target element
    let spotlightStyle = '';
    if (step.target) {
      const el = document.querySelector(step.target);
      if (el) {
        const rect = el.getBoundingClientRect();
        const pad = 8;
        spotlightStyle = `
          clip-path: polygon(
            0% 0%, 0% 100%, ${rect.left - pad}px 100%, ${rect.left - pad}px ${rect.top - pad}px,
            ${rect.right + pad}px ${rect.top - pad}px, ${rect.right + pad}px ${rect.bottom + pad}px,
            ${rect.left - pad}px ${rect.bottom + pad}px, ${rect.left - pad}px 100%, 100% 100%, 100% 0%
          );
        `;
        backdrop.style.cssText = spotlightStyle;

        // Highlight ring
        const ring = document.createElement('div');
        ring.className = 'tutorial-ring';
        ring.style.cssText = `left:${rect.left - pad}px;top:${rect.top - pad}px;width:${rect.width + pad * 2}px;height:${rect.height + pad * 2}px;`;
        overlay.appendChild(ring);
      }
    }

    // Tooltip card
    const card = document.createElement('div');
    card.className = 'tutorial-card';
    card.innerHTML = `
      <div class="tutorial-step-num">Paso ${currentStep + 1} de ${steps.length}</div>
      <h3 class="tutorial-title">${step.title}</h3>
      <p class="tutorial-text">${step.text}</p>
      <div class="tutorial-actions">
        ${currentStep > 0 ? '<button class="tutorial-btn tutorial-btn-back" id="tut-back">← Anterior</button>' : '<span></span>'}
        <button class="tutorial-btn tutorial-btn-next" id="tut-next">
          ${currentStep < steps.length - 1 ? 'Siguiente →' : '¡Empezar! 🚀'}
        </button>
      </div>
      <button class="tutorial-skip" id="tut-skip">Saltar tutorial</button>
    `;

    // Position the card
    if (step.target && step.position !== 'center') {
      const el = document.querySelector(step.target);
      if (el) {
        const rect = el.getBoundingClientRect();
        switch (step.position) {
          case 'bottom':
            card.style.cssText = `top:${rect.bottom + 16}px;left:${rect.left + rect.width / 2}px;transform:translateX(-50%);`;
            break;
          case 'right':
            card.style.cssText = `top:${rect.top + rect.height / 2}px;left:${rect.right + 16}px;transform:translateY(-50%);`;
            break;
          case 'left':
            card.style.cssText = `top:${rect.top + rect.height / 2}px;right:${window.innerWidth - rect.left + 16}px;transform:translateY(-50%);`;
            break;
          case 'top':
            card.style.cssText = `bottom:${window.innerHeight - rect.top + 16}px;left:${rect.left + rect.width / 2}px;transform:translateX(-50%);`;
            break;
        }
      }
    } else {
      card.style.cssText = 'top:50%;left:50%;transform:translate(-50%,-50%);';
    }

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // Wire events
    document.getElementById('tut-next').addEventListener('click', () => {
      currentStep++;
      _render();
    });
    const backBtn = document.getElementById('tut-back');
    if (backBtn) backBtn.addEventListener('click', () => { currentStep--; _render(); });
    document.getElementById('tut-skip').addEventListener('click', _finish);
  }

  function _cleanup() {
    const existing = document.getElementById('tutorial-overlay');
    if (existing) existing.remove();
  }

  function _finish() {
    _cleanup();
    isActive = false;
    localStorage.setItem('archbuilder_tutorial_done', '1');
    if (onComplete) onComplete();
  }

  function shouldShow() {
    return !localStorage.getItem('archbuilder_tutorial_done');
  }

  function reset() {
    localStorage.removeItem('archbuilder_tutorial_done');
  }

  return { start, shouldShow, reset, isActive: () => isActive };
})();
