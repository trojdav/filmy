(() => {
  const $ = (id) => document.getElementById(id);
  const drawView = $('drawView');
  const galleryView = $('galleryView');
  const drawStage = $('drawStage');
  const deck = $('deck');
  const deckImages = Array.from(deck.querySelectorAll('.deck-poster'));
  const snowfall = $('snowfall');
  const resultCard = $('resultCard');
  const resultImage = $('resultImage');
  const resultPlaceholder = $('resultPlaceholder');
  const stageCaption = $('stageCaption');
  const emptyState = $('emptyState');
  const galleryGrid = $('galleryGrid');
  const galleryEmpty = $('galleryEmpty');
  const galleryFoot = $('galleryFoot');
  const searchInput = $('searchInput');
  const modal = $('posterModal');
  const modalImage = $('modalImage');
  const modalTitle = $('modalTitle');

  const files = Array.isArray(window.FILM_POSTERS) ? window.FILM_POSTERS : [];
  const filmTitles = window.FILM_TITLES || {};
  let posters = files.map((file, index) => ({
    file,
    url: 'images/' + encodeURIComponent(file).replace(/%2F/gi, '/'),
    name: file.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim(),
    title: filmTitles[Number(file.replace(/\.[^.]+$/, ''))] || '',
    index
  }));
  let currentPoster = null;
  let busy = false;

  for (let index = 0; index < 28; index++) {
    const flake = document.createElement('span');
    flake.className = 'snowflake';
    flake.textContent = '❄';
    flake.style.left = `${Math.random() * 100}%`;
    flake.style.animationDuration = `${14 + Math.random() * 14}s`;
    flake.style.animationDelay = `${-Math.random() * 28}s`;
    flake.style.fontSize = `${8 + Math.random() * 7}px`;
    flake.style.opacity = `${0.35 + Math.random() * 0.5}`;
    flake.style.setProperty('--drift', `${Math.round(Math.random() * 90 - 45)}px`);
    snowfall.append(flake);
  }

  function randomPosters(count) {
    const shuffled = posters.slice();
    const sampleSize = Math.min(count, shuffled.length);
    for (let index = 0; index < sampleSize; index++) {
      const swapIndex = index + Math.floor(Math.random() * (shuffled.length - index));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled.slice(0, sampleSize);
  }

  function showView(view) {
    const gallery = view === 'gallery';
    drawView.classList.toggle('active-view', !gallery);
    galleryView.classList.toggle('active-view', gallery);
    $('tabDraw').classList.toggle('active', !gallery);
    $('tabGallery').classList.toggle('active', gallery);
    if (gallery) renderGallery();
  }
  $('tabDraw').addEventListener('click', () => showView('draw'));
  $('tabGallery').addEventListener('click', () => showView('gallery'));

  function draw() {
    if (busy) return;
    if (!posters.length) {
      emptyState.classList.add('visible');
      stageCaption.textContent = 'ZKONTROLUJ PLAKÁTY VE SLOŽCE IMAGES';
      return;
    }
    busy = true;
    drawStage.classList.remove('has-result');
    drawStage.classList.add('is-shuffling');
    deck.classList.add('is-shuffling');
    deck.setAttribute('aria-disabled', 'true');
    resultImage.style.display = 'none';
    resultPlaceholder.style.display = 'none';
    stageCaption.textContent = 'MÍCHÁM KARTY…';
    const candidates = posters.filter(p => !currentPoster || posters.length < 2 || p.file !== currentPoster.file);
    const chosen = (candidates.length ? candidates : posters)[Math.floor(Math.random() * (candidates.length || posters.length))];
    const updateDeck = () => {
      randomPosters(deckImages.length).forEach((poster, index) => {
        deckImages[index].src = poster.url;
      });
    };
    updateDeck();
    const shuffleInterval = window.setInterval(updateDeck, 180);
    window.setTimeout(() => {
      window.clearInterval(shuffleInterval);
      deck.classList.remove('is-shuffling');
      deckImages.forEach(image => image.removeAttribute('src'));
      currentPoster = chosen;
      drawStage.classList.remove('is-shuffling');
      resultImage.onload = () => {
        resultImage.style.display = 'block';
        resultPlaceholder.style.display = 'none';
        drawStage.classList.add('has-result');
        deck.setAttribute('aria-label', 'Losovat znovu. Kliknutím na vánoční karty zamícháš další film.');
        deck.setAttribute('aria-disabled', 'false');
        stageCaption.textContent = 'FILM JE VYBRÁN · KLIKNI NA KARTY PRO DALŠÍ LOS';
        busy = false;
      };
      resultImage.onerror = () => {
        resultImage.style.display = 'none';
        resultPlaceholder.style.display = 'flex';
        drawStage.classList.add('has-result');
        deck.setAttribute('aria-label', 'Losovat znovu. Kliknutím na vánoční karty zamícháš další film.');
        deck.setAttribute('aria-disabled', 'false');
        stageCaption.textContent = 'PLAKÁT SE NEPODAŘILO NAČÍST · KLIKNI PRO NOVÝ LOS';
        busy = false;
      };
      resultImage.src = chosen.url;
    }, 1550);
  }
  deck.addEventListener('click', draw);
  deck.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && !busy) {
      e.preventDefault();
      draw();
    }
  });
  resultCard.addEventListener('click', () => { if (currentPoster && !busy) openModal(currentPoster); });
  resultCard.setAttribute('role', 'button');
  resultCard.setAttribute('tabindex', '0');
  resultCard.setAttribute('aria-label', 'Zvětšit vylosovaný plakát');
  resultCard.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && currentPoster && !busy) { e.preventDefault(); openModal(currentPoster); } });

  function renderGallery() {
    const query = searchInput.value.trim().toLocaleLowerCase('cs');
    const filtered = posters.filter(p => p.title.toLocaleLowerCase('cs').includes(query) || p.name.toLocaleLowerCase('cs').includes(query) || p.file.toLocaleLowerCase('cs').includes(query));
    galleryGrid.replaceChildren();
    filtered.forEach(poster => {
      const button = document.createElement('button');
      button.className = 'poster-tile'; button.type = 'button';
      const title = poster.title || poster.name || poster.file;
      button.setAttribute('aria-label', `Zvětšit plakát ${title}`);
      const imageWrap = document.createElement('span'); imageWrap.className = 'tile-image';
      const img = document.createElement('img'); img.src = poster.url; img.alt = title || 'Filmový plakát'; img.loading = 'lazy';
      const zoom = document.createElement('span'); zoom.className = 'tile-zoom'; zoom.textContent = '↗';
      imageWrap.append(img, zoom);
      const name = document.createElement('span'); name.className = 'tile-name'; name.textContent = title; name.title = title;
      const index = document.createElement('span'); index.className = 'tile-index'; index.textContent = `PLAKÁT ${(poster.index + 1).toString().padStart(3,'0')}`;
      button.append(imageWrap, name, index);
      button.addEventListener('click', () => openModal(poster));
      galleryGrid.append(button);
    });
    $('galleryCount').textContent = filtered.length;
    galleryEmpty.classList.toggle('visible', posters.length === 0 || filtered.length === 0);
    galleryGrid.style.display = filtered.length ? 'grid' : 'none';
    if (posters.length === 0) {
      galleryEmpty.querySelector('strong').textContent = 'Galerie je zatím prázdná';
      galleryEmpty.querySelector('p').textContent = 'Vlož obrázky 1.png až 250.png do složky images.';
    } else if (filtered.length === 0) {
      galleryEmpty.querySelector('strong').textContent = 'Nic jsme nenašli';
      galleryEmpty.querySelector('p').textContent = 'Zkus jiný název nebo část názvu souboru.';
    }
    galleryFoot.textContent = posters.length ? `Zobrazeno ${filtered.length} z ${posters.length} plakátů · Kliknutím otevřeš detail` : '';
  }
  searchInput.addEventListener('input', renderGallery);

  function openModal(poster) {
    const title = poster.title || poster.name || poster.file;
    modalImage.src = poster.url;
    modalImage.alt = title || 'Filmový plakát';
    modalTitle.textContent = title;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    $('closeModal').focus();
  }
  function closeModal() { modal.classList.remove('open'); document.body.style.overflow = ''; }
  $('closeModal').addEventListener('click', closeModal);
  $('closeModalBackdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); showView('gallery'); searchInput.focus(); }
  });
  $('navCount').textContent = posters.length;
  $('galleryCount').textContent = posters.length;
  emptyState.classList.toggle('visible', posters.length === 0);
  galleryEmpty.classList.toggle('visible', posters.length === 0);
  if (!posters.length) {
    galleryEmpty.querySelector('strong').textContent = 'Galerie je zatím prázdná';
    galleryEmpty.querySelector('p').textContent = 'Vlož obrázky 1.png až 250.png do složky images.';
  }
  galleryGrid.style.display = 'none';
  renderGallery();
})();
