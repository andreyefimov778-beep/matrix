/* ═══════════════════════════════════════════════════════
   ХРОНИКИ МАТРИЦЫ — Основная логика
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Audio Setup ───
  const audio = document.getElementById('bg-audio');
  const audioBtn = document.getElementById('audio-btn');
  let audioPlaying = false;

  function toggleAudio() {
    if (!audio) return;
    if (audioPlaying) {
      audio.pause();
      audioBtn.textContent = '🔇';
      audioPlaying = false;
    } else {
      audio.play().catch(() => {});
      audioBtn.textContent = '🔊';
      audioPlaying = true;
    }
  }

  if (audioBtn) {
    audioBtn.addEventListener('click', toggleAudio);
  }

  // ─── Intro → Main ───
  const introScreen = document.getElementById('intro-screen');
  const mainPage = document.getElementById('main-page');
  const enterBtn = document.getElementById('enter-btn');

  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      introScreen.style.transition = 'opacity 1s ease';
      introScreen.style.opacity = '0';

      setTimeout(() => {
        introScreen.style.display = 'none';
        mainPage.style.display = 'block';
        mainPage.classList.add('entering');

        // Try to play audio
        if (audio) {
          audio.volume = 0;
          audio.play().catch(() => {});
          // Fade in audio
          let vol = 0;
          const fadeIn = setInterval(() => {
            vol = Math.min(vol + 0.05, 0.6);
            audio.volume = vol;
            if (vol >= 0.6) {
              clearInterval(fadeIn);
              audioPlaying = true;
              if (audioBtn) audioBtn.textContent = '🔊';
            }
          }, 100);
        }

        // Trigger scroll animations
        setTimeout(() => {
          observeEpochs();
          generateStars();
        }, 100);
      }, 1000);
    });
  }

  // ─── Star Field ───
  function generateStars() {
    const field = document.getElementById('star-field');
    if (!field) return;
    for (let i = 0; i < 80; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.setProperty('--dur', (2 + Math.random() * 4) + 's');
      star.style.setProperty('--delay', (Math.random() * 4) + 's');
      star.style.setProperty('--opacity', (0.2 + Math.random() * 0.5).toString());
      field.appendChild(star);
    }
  }

  // ─── Scroll Observer ───
  function observeEpochs() {
    const blocks = document.querySelectorAll('.epoch-block');
    if (!blocks.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    blocks.forEach(block => observer.observe(block));
  }

  // ─── Build Timeline ───
  function buildTimeline() {
    const container = document.getElementById('timeline-container');
    if (!container || typeof EPOCHS === 'undefined') return;

    EPOCHS.forEach((epoch, idx) => {
      // Torch separator (before each block except first)
      if (idx > 0) {
        const sep = createTorchSeparator();
        container.appendChild(sep);
      }

      // Epoch block
      const block = createEpochBlock(epoch, idx);
      container.appendChild(block);
    });
  }

  function createTorchSeparator() {
    const sep = document.createElement('div');
    sep.className = 'torch-separator';
    sep.innerHTML = `
      <div class="separator-line"></div>
      <div class="torch">
        <span class="torch-flame">🔥</span>
        <div class="torch-handle"></div>
      </div>
      <div class="separator-line"></div>
      <div class="torch">
        <span class="torch-flame">🔥</span>
        <div class="torch-handle"></div>
      </div>
      <div class="separator-line"></div>
    `;
    return sep;
  }

  function createEpochBlock(epoch, idx) {
    const block = document.createElement('div');
    block.className = 'epoch-block';

    // Node in center
    const node = document.createElement('div');
    node.className = 'epoch-node';
    node.title = epoch.title;
    node.textContent = epoch.houseIcon;
    node.addEventListener('click', () => openModal(epoch));

    // Card
    const card = document.createElement('div');
    card.className = 'epoch-card';
    card.addEventListener('click', () => openModal(epoch));

    // Accent bar
    const accent = document.createElement('div');
    accent.className = 'epoch-accent';
    accent.style.background = epoch.color;
    card.appendChild(accent);

    card.innerHTML += `
      <span class="epoch-number">Блок ${String(idx).padStart(2, '0')}</span>
      <span class="epoch-period">${epoch.period}</span>
      <h3 class="epoch-title">${epoch.title}</h3>
      <p class="epoch-subtitle">${epoch.subtitle}</p>
      <p class="epoch-preview">${epoch.events[0].text}</p>
      <span class="epoch-cta">Открыть свиток →</span>
      <div class="epoch-control">${epoch.control}</div>
    `;

    block.appendChild(node);
    block.appendChild(card);

    return block;
  }

  // ─── Modal ───
  const modal = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close');

  function openModal(epoch) {
    if (!modal) return;

    // Set header color
    document.getElementById('modal-accent-bar').style.background = epoch.color;
    document.getElementById('modal-house-icon').textContent = epoch.houseIcon;
    document.getElementById('modal-period').textContent = epoch.period;
    document.getElementById('modal-title').textContent = epoch.title;
    document.getElementById('modal-subtitle').textContent = epoch.subtitle;

    // Build events
    const eventsContainer = document.getElementById('modal-events');
    eventsContainer.innerHTML = '';
    epoch.events.forEach(ev => {
      const item = document.createElement('div');
      item.className = 'event-item';
      item.innerHTML = `
        <div class="event-date">${ev.date}</div>
        <div class="event-text">${ev.text}</div>
      `;
      eventsContainer.appendChild(item);
    });

    // Hidden meaning
    document.getElementById('modal-hidden-text').textContent = epoch.hiddenMeaning;
    document.getElementById('modal-control-text').textContent = epoch.control;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // ─── Build Entities ───
  function buildEntities() {
    const grid = document.getElementById('entities-grid');
    if (!grid || typeof ENTITIES === 'undefined') return;

    ENTITIES.forEach(entity => {
      const card = document.createElement('div');
      card.className = 'entity-card';
      card.innerHTML = `
        <div class="entity-number">${entity.number}</div>
        <div class="entity-name">${entity.name}</div>
        <div class="entity-role">${entity.role}</div>
        <div class="entity-desc">${entity.desc}</div>
      `;
      grid.appendChild(card);
    });
  }

  // ─── Build Summary Table ───
  function buildSummaryTable() {
    const tbody = document.getElementById('summary-tbody');
    if (!tbody || typeof EPOCHS === 'undefined') return;

    EPOCHS.forEach(epoch => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${epoch.period}</td>
        <td>${epoch.title} — ${epoch.subtitle}</td>
        <td>${epoch.control}</td>
      `;
      tr.style.cursor = 'pointer';
      tr.addEventListener('click', () => {
        openModal(epoch);
      });
      tbody.appendChild(tr);
    });
  }

  // ─── Build Principles ───
  function buildPrinciples() {
    const grid = document.getElementById('principles-grid');
    if (!grid || typeof PRINCIPLES === 'undefined') return;

    PRINCIPLES.forEach(p => {
      const card = document.createElement('div');
      card.className = 'principle-card';
      card.innerHTML = `
        <div class="principle-name">${p.name}</div>
        <div class="principle-desc">${p.desc}</div>
      `;
      grid.appendChild(card);
    });
  }

  // ─── Init ───
  buildTimeline();
  buildEntities();
  buildSummaryTable();
  buildPrinciples();
});
