document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('cancion-input');
  const hiddenInput = document.getElementById('cancion');
  const resultsDropdown = document.getElementById('music-results');
  const selectedCard = document.getElementById('selected-track');
  const audioPlayer = document.getElementById('audio-preview');
  const btnPlaySelected = document.getElementById('btn-play-selected');
  const btnRemoveTrack = document.getElementById('btn-remove-track');

  let searchTimeout = null;
  let currentPlayingBtn = null;
  let selectedPreviewUrl = null;

  // Lista de términos o canciones recomendadas por defecto si el input está vacío
  const BUSQUEDA_RECOMENDADA = 'party hits'; 

  if (searchInput) {
    // 1. Recomendar canciones al hacer CLICK o FOCO
    searchInput.addEventListener('focus', () => {
      const query = searchInput.value.trim();
      if (query.length === 0) {
        buscarCancionesiTunes(BUSQUEDA_RECOMENDADA);
      } else if (query.length >= 2) {
        buscarCancionesiTunes(query);
      }
    });

    // 2. Búsqueda mientras escribe (con respuesta más rápida)
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();

      if (query.length === 0) {
        buscarCancionesiTunes(BUSQUEDA_RECOMENDADA);
        return;
      }

      // 150ms para que la búsqueda sea mucho más ágil
      searchTimeout = setTimeout(() => buscarCancionesiTunes(query), 150);
    });
  }

  async function buscarCancionesiTunes(query) {
    try {
      const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=6`);
      const data = await response.json();
      mostrarResultadosMusica(data.results);
    } catch (err) {
      console.error('Error al buscar música:', err);
    }
  }

  function mostrarResultadosMusica(tracks) {
    if (!resultsDropdown) return;
    resultsDropdown.innerHTML = '';

    if (!tracks || tracks.length === 0) {
      resultsDropdown.innerHTML = '<div class="track-item"><span class="track-item-artist">No se encontraron canciones</span></div>';
      resultsDropdown.classList.remove('oculto');
      return;
    }

    tracks.forEach(track => {
      const item = document.createElement('div');
      item.className = 'track-item';
      item.innerHTML = `
        <img src="${track.artworkUrl60}" alt="${track.trackName}">
        <div class="track-item-info">
          <span class="track-item-title">${track.trackName}</span>
          <span class="track-item-artist">${track.artistName}</span>
        </div>
        ${track.previewUrl ? `<button type="button" class="btn-play-preview">▶</button>` : ''}
      `;

      item.addEventListener('click', (e) => {
        if (!e.target.classList.contains('btn-play-preview')) {
          seleccionarCancion(track.trackName, track.artistName, track.artworkUrl100, track.previewUrl);
        }
      });

      const playBtn = item.querySelector('.btn-play-preview');
      if (playBtn) {
        playBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          togglePreview(track.previewUrl, playBtn);
        });
      }

      resultsDropdown.appendChild(item);
    });

    resultsDropdown.classList.remove('oculto');
  }

  function togglePreview(url, btn) {
    if (!audioPlayer) return;

    if (audioPlayer.src === url && !audioPlayer.paused) {
      audioPlayer.pause();
      btn.textContent = '▶';
    } else {
      if (currentPlayingBtn) currentPlayingBtn.textContent = '▶';
      audioPlayer.src = url;
      audioPlayer.play();
      btn.textContent = '❚❚';
      currentPlayingBtn = btn;
    }
  }

  function seleccionarCancion(titulo, artista, portada, previewUrl) {
    if (hiddenInput) hiddenInput.value = `${titulo} - ${artista}`;
    document.getElementById('selected-title').textContent = titulo;
    document.getElementById('selected-artist').textContent = artista;
    document.getElementById('selected-cover').src = portada;

    selectedPreviewUrl = previewUrl || null;

    if (btnPlaySelected) {
      btnPlaySelected.style.display = previewUrl ? 'flex' : 'none';
      btnPlaySelected.textContent = '▶';
    }

    if (selectedCard) selectedCard.classList.remove('oculto');
    if (resultsDropdown) resultsDropdown.classList.add('oculto');
    if (searchInput) searchInput.value = '';
    if (audioPlayer) audioPlayer.pause();
  }

  btnRemoveTrack?.addEventListener('click', () => {
    if (hiddenInput) hiddenInput.value = '';
    if (selectedCard) selectedCard.classList.add('oculto');
    if (audioPlayer) audioPlayer.pause();
  });

  btnPlaySelected?.addEventListener('click', () => {
    if (selectedPreviewUrl) togglePreview(selectedPreviewUrl, btnPlaySelected);
  });

  document.addEventListener('click', (e) => {
    if (resultsDropdown && !e.target.closest('.music-search-group')) {
      resultsDropdown.classList.add('oculto');
    }
  });
});