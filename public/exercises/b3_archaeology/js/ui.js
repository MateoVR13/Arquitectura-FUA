/* ==========================================
   UI.JS — Panel Rendering & Interaction
   ========================================== */
const UI = (() => {
  function renderPiecePanel(era, type) {
    const container = document.getElementById('piece-list');
    const title = document.getElementById('pieces-panel-title');
    const eraData = ERAS[era];
    const pieces = PIECES[era][type] || [];

    title.textContent = `Piezas — ${eraData.name}`;
    container.innerHTML = '';

    pieces.forEach(piece => {
      const card = document.createElement('div');
      card.className = 'piece-card';
      card.dataset.pieceId = piece.id;
      card.innerHTML = `
        <div class="piece-icon">${piece.icon}</div>
        <div class="piece-name">${piece.name}</div>
      `;
      card.title = piece.desc;
      card.addEventListener('click', () => {
        document.querySelectorAll('.piece-card.selected').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        Builder.setSelectedPiece(piece);
        document.getElementById('placement-hint').classList.remove('hidden');
      });
      container.appendChild(card);
    });
  }

  function renderEraInfo(era) {
    const data = ERAS[era];
    document.getElementById('era-info-title').textContent = data.name;
    document.getElementById('era-info-desc').textContent = data.description;
    const chars = document.getElementById('era-characteristics');
    chars.innerHTML = data.characteristics.map(c => `<span class="era-char-tag">${c}</span>`).join('');
    document.getElementById('era-indicator').textContent = data.name;
  }

  function renderAlerts(alerts) {
    const container = document.getElementById('alerts-list');
    if (alerts.length === 0) {
      container.innerHTML = '<div class="alert-empty">Sin alertas — ¡Bien hecho!</div>';
      return;
    }
    container.innerHTML = '';
    // Show max 8 alerts
    alerts.slice(0, 8).forEach(alert => {
      const el = document.createElement('div');
      el.className = `alert-item ${alert.severity}`;
      el.innerHTML = `<span class="alert-icon">${alert.icon}</span><span>${alert.message}</span>`;
      container.appendChild(el);
    });
    if (alerts.length > 8) {
      const more = document.createElement('div');
      more.className = 'alert-empty';
      more.textContent = `+ ${alerts.length - 8} alertas más…`;
      container.appendChild(more);
    }
  }

  function renderChallengeModal() {
    const container = document.getElementById('challenge-list');
    container.innerHTML = '';
    Challenges.getList().forEach(ch => {
      const card = document.createElement('div');
      card.className = 'challenge-card';
      const eraData = ERAS[ch.era];
      card.innerHTML = `
        <h4>${ch.name}</h4>
        <p>${ch.description}</p>
        <span class="challenge-era" style="background:${eraData.color}22;color:${eraData.color};border:1px solid ${eraData.color}44">${eraData.name}</span>
      `;
      card.addEventListener('click', () => {
        App.startChallenge(ch.id);
        document.getElementById('challenge-modal').classList.add('hidden');
      });
      container.appendChild(card);
    });
  }

  function updateChallengeProgress(progress) {
    const bar = document.getElementById('challenge-progress');
    if (!progress) {
      bar.classList.add('hidden');
      return;
    }
    bar.classList.remove('hidden');
    const ch = Challenges.getActive();
    document.getElementById('challenge-name').textContent = `Reto: ${ch.name}`;
    document.getElementById('challenge-fill').style.width = progress.pct + '%';
    document.getElementById('challenge-pct').textContent = progress.pct + '%';
  }

  function updatePieceCounter(count) {
    document.getElementById('piece-counter').textContent = `${count} pieza${count !== 1 ? 's' : ''} colocada${count !== 1 ? 's' : ''}`;
  }

  function showToast(type, title, message, duration) {
    duration = duration || 4000;
    const container = document.getElementById('toast-container');
    const icons = { warning: '⚠️', error: '🔴', success: '✅', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${message}</div>
      </div>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('out');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }

  function setEraTheme(era) {
    document.body.classList.remove('era-clasica', 'era-gotica', 'era-renacentista');
    document.body.classList.add('era-' + era);
    document.querySelectorAll('.era-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.era === era);
    });
  }

  function setPieceTypeActive(type) {
    document.querySelectorAll('.type-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.type === type);
    });
  }

  return {
    renderPiecePanel,
    renderEraInfo,
    renderAlerts,
    renderChallengeModal,
    updateChallengeProgress,
    updatePieceCounter,
    showToast,
    setEraTheme,
    setPieceTypeActive
  };
})();
