// Credenciales públicas
const SUPABASE_URL = 'https://vqrggwytoxbesiyizzar.supabase.co';
const SUPABASE_KEY = 'sb_publishable_91CQ7N9k-O-IA5MpRHbmpA_vIp674x_';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {

  // 1. Interacción para abrir el sobre con animación
  const sobre = document.getElementById('sobre-overlay');
  if (sobre) {
    sobre.addEventListener('click', () => {
      sobre.querySelector('.flap').style.transform = 'rotateX(180deg)';
      sobre.querySelector('.sello').style.opacity = '0';

      setTimeout(() => {
        sobre.classList.add('abierto');
      }, 300);
    });
  }

  // 2. Mostrar campos dinámicos según la respuesta del invitado
  const radioAsiste = document.querySelectorAll('input[name="asiste"]');
  const camposSi = document.getElementById('campos-si');
  const camposNo = document.getElementById('campos-no');

  const inputNombreSi = document.getElementById('nombre-si');
  const inputNombreNo = document.getElementById('nombre-no');

  radioAsiste.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'true') {
        camposSi.classList.remove('oculto');
        camposNo.classList.add('oculto');
        inputNombreSi.setAttribute('required', 'true');
        inputNombreNo.removeAttribute('required');
      } else {
        camposNo.classList.remove('oculto');
        camposSi.classList.add('oculto');
        inputNombreNo.setAttribute('required', 'true');
        inputNombreSi.removeAttribute('required');
      }
    });
  });

  // 3. BUSCADOR DE MÚSICA (iTunes API)
  const searchInput = document.getElementById('cancion-input');
  const hiddenInput = document.getElementById('cancion');
  const resultsDropdown = document.getElementById('music-results');
  const selectedCard = document.getElementById('selected-track');
  const audioPlayer = document.getElementById('audio-preview');

  let searchTimeout = null;
  let currentPlayingBtn = null;
  let selectedPreviewUrl = null;

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();

      clearTimeout(searchTimeout);

      if (query.length < 3) {
        if (resultsDropdown) {
          resultsDropdown.classList.add('oculto');
          resultsDropdown.innerHTML = '';
        }
        return;
      }

      searchTimeout = setTimeout(() => {
        buscarCancionesiTunes(query);
      }, 300);
    });
  }

  async function buscarCancionesiTunes(query) {
    try {
      const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`);
      const data = await response.json();
      mostrarResultadosMusica(data.results);
    } catch (err) {
      console.error("Error al buscar música en iTunes:", err);
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

      const artworkUrl = track.artworkUrl100 || track.artworkUrl60;

      item.innerHTML = `
        <img src="${artworkUrl}" alt="${track.trackName}">
        <div class="track-item-info">
          <span class="track-item-title">${track.trackName}</span>
          <span class="track-item-artist">${track.artistName}</span>
        </div>
        ${track.previewUrl ? `<button type="button" class="btn-play-preview" data-preview="${track.previewUrl}">▶</button>` : ''}
      `;

      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-play-preview')) return;
        seleccionarCancion(track.trackName, track.artistName, artworkUrl, track.previewUrl);
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
    const cancionTexto = `${titulo} - ${artista}`;
    
    if (hiddenInput) hiddenInput.value = cancionTexto;
    
    const selectedTitle = document.getElementById('selected-title');
    const selectedArtist = document.getElementById('selected-artist');
    const selectedCover = document.getElementById('selected-cover');
    const btnPlaySelected = document.getElementById('btn-play-selected');

    if (selectedTitle) selectedTitle.textContent = titulo;
    if (selectedArtist) selectedArtist.textContent = artista;
    if (selectedCover) selectedCover.src = portada;
    
    if (btnPlaySelected) {
      if (previewUrl) {
        selectedPreviewUrl = previewUrl;
        btnPlaySelected.style.display = 'flex';
        btnPlaySelected.textContent = '▶';
      } else {
        selectedPreviewUrl = null;
        btnPlaySelected.style.display = 'none';
      }
    }

    if (selectedCard) selectedCard.classList.remove('oculto');
    if (resultsDropdown) resultsDropdown.classList.add('oculto');
    if (searchInput) searchInput.value = '';
    
    if (audioPlayer) audioPlayer.pause();
  }

  const btnRemoveTrack = document.getElementById('btn-remove-track');
  if (btnRemoveTrack) {
    btnRemoveTrack.addEventListener('click', () => {
      if (hiddenInput) hiddenInput.value = '';
      if (selectedCard) selectedCard.classList.add('oculto');
      if (audioPlayer) audioPlayer.pause();
    });
  }

  const btnPlaySelected = document.getElementById('btn-play-selected');
  if (btnPlaySelected) {
    btnPlaySelected.addEventListener('click', () => {
      if (selectedPreviewUrl) {
        togglePreview(selectedPreviewUrl, btnPlaySelected);
      }
    });
  }
  
  document.addEventListener('click', (e) => {
    if (resultsDropdown && !e.target.closest('.music-search-group')) {
      resultsDropdown.classList.add('oculto');
    }
  });

  // 4. Envío del Formulario a Supabase
  const form = document.getElementById('form-rsvp');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const asisteVal = document.querySelector('input[name="asiste"]:checked').value === 'true';
      const submitBtn = form.querySelector('.campos-dinamicos:not(.oculto) button[type="submit"]');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';

      let datos = {};

      if (asisteVal) {
        const menuVal = document.getElementById('menu').value.trim();
        const cancionVal = hiddenInput ? hiddenInput.value.trim() : '';

        datos = {
          nombre: inputNombreSi.value.trim(),
          asiste: true,
          menu_especial: menuVal !== '' ? menuVal : null,
          cancion: cancionVal !== '' ? cancionVal : null
        };
      } else {
        const mensajeVal = document.getElementById('mensaje-no').value.trim();
        datos = {
          nombre: inputNombreNo.value.trim(),
          asiste: false,
          menu_especial: mensajeVal !== '' ? `Mensaje: ${mensajeVal}` : null,
          cancion: null
        };
      }

      const { data, error } = await supabaseClient
        .from('confirmaciones')
        .insert([datos]);

      if (error) {
        console.error("Error al insertar:", error);
        alert("❌ Error al enviar la confirmación: " + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'ENVIAR';
      } else {
        const rsvpContenido = document.getElementById('rsvp-contenido');
        if (rsvpContenido) rsvpContenido.classList.add('oculto');

        const contenedorAgradecimiento = document.getElementById('rsvp-agradecimiento');
        const tituloAgr = document.getElementById('agradecimiento-titulo');
        const textoAgr = document.getElementById('agradecimiento-texto');

        if (asisteVal) {
          tituloAgr.textContent = '¡Gracias por tu confirmación!';
          textoAgr.textContent = 'Tu respuesta ha sido registrada correctamente. ¡Nos vemos en la celebración!';
          
          lanzarFuegosArtificiales();
        } else {
          tituloAgr.textContent = '¡Gracias por tu respuesta!';
          textoAgr.textContent = 'Lamentamos que no puedas asistir, pero agradecemos tu mensaje. ¡Esperamos verte en otra ocasión!';
        }
        
        contenedorAgradecimiento.classList.remove('oculto');
      }
    });
  }
});

// Función independiente para Confeti / Fuegos artificiales
function lanzarFuegosArtificiales() { 
  if (typeof confetti === 'function') {
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  }
}