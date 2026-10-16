document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("cancion-input");
  const hiddenInput = document.getElementById("cancion");
  const resultsDropdown = document.getElementById("music-results");
  const selectedCard = document.getElementById("selected-track");
  const audioPlayer = document.getElementById("audio-preview");
  const btnPlaySelected = document.getElementById("btn-play-selected");
  const btnRemoveTrack = document.getElementById("btn-remove-track");

  if (!searchInput || !resultsDropdown) return;

  const BUSQUEDA_RECOMENDADA = "party hits";
  const DEBOUNCE_MS = 350; // iTunes limita ~20 pedidos/min: no conviene disparar por cada tecla
  const cache = new Map();

  let debounceTimer = null;
  let contadorBusquedas = 0; // para ignorar respuestas que llegan fuera de orden
  let botonSonando = null;
  let urlSonando = null;
  let selectedPreviewUrl = null;

  // ---------- Búsqueda ----------
  async function buscarCanciones(query) {
    const idBusqueda = ++contadorBusquedas;

    if (cache.has(query)) {
      renderizarResultados(cache.get(query));
      return;
    }

    mostrarEstado("Buscando...");
    try {
      const resultados = await pedirITunes(query);
      cache.set(query, resultados);
      if (idBusqueda !== contadorBusquedas) return;
      renderizarResultados(resultados);
    } catch (err) {
      console.error("Error al buscar música:", err);
      if (idBusqueda !== contadorBusquedas) return;
      mostrarEstado("No pudimos cargar las canciones. Probá de nuevo en un momento.");
    }
  }

  async function pedirITunes(query) {
    const url =
      "https://itunes.apple.com/search?" +
      `term=${encodeURIComponent(query)}&media=music&entity=song&country=AR&limit=8`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const data = await resp.json();
      return data.results || [];
    } catch (e) {
      // Si fetch falla (CORS, bloqueo, red), probamos por JSONP
      return pedirITunesJSONP(url);
    }
  }

  function pedirITunesJSONP(url) {
    return new Promise((resolve, reject) => {
      const nombreCb = "itunesCb_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
      const script = document.createElement("script");
      let timeout = null;

      const limpiar = () => {
        clearTimeout(timeout);
        delete window[nombreCb];
        script.remove();
      };

      window[nombreCb] = (data) => {
        limpiar();
        resolve((data && data.results) || []);
      };
      script.onerror = () => {
        limpiar();
        reject(new Error("JSONP falló"));
      };
      timeout = setTimeout(() => {
        limpiar();
        reject(new Error("JSONP timeout"));
      }, 8000);

      script.src = `${url}&callback=${nombreCb}`;
      document.head.appendChild(script);
    });
  }

  // ---------- Render ----------
  function mostrarEstado(texto) {
    resultsDropdown.innerHTML = "";
    const fila = document.createElement("div");
    fila.className = "track-item track-item-estado";
    const span = document.createElement("span");
    span.className = "track-item-artist";
    span.textContent = texto;
    fila.appendChild(span);
    resultsDropdown.appendChild(fila);
    resultsDropdown.classList.remove("oculto");
  }

  function renderizarResultados(tracks) {
    detenerAudio();
    if (!tracks || tracks.length === 0) {
      mostrarEstado("No se encontraron canciones");
      return;
    }

    resultsDropdown.innerHTML = "";
    tracks.forEach((track) => {
      const item = document.createElement("div");
      item.className = "track-item";

      const img = document.createElement("img");
      img.src = track.artworkUrl60 || "";
      img.alt = "";

      const info = document.createElement("div");
      info.className = "track-item-info";
      const titulo = document.createElement("span");
      titulo.className = "track-item-title";
      titulo.textContent = track.trackName;
      const artista = document.createElement("span");
      artista.className = "track-item-artist";
      artista.textContent = track.artistName;
      info.append(titulo, artista);

      item.append(img, info);

      if (track.previewUrl) {
        const playBtn = document.createElement("button");
        playBtn.type = "button";
        playBtn.className = "btn-play-preview";
        playBtn.textContent = "▶";
        playBtn.setAttribute("aria-label", "Escuchar vista previa");
        playBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          togglePreview(track.previewUrl, playBtn);
        });
        item.appendChild(playBtn);
      }

      item.addEventListener("click", () => seleccionarCancion(track));
      resultsDropdown.appendChild(item);
    });

    resultsDropdown.classList.remove("oculto");
  }

  // ---------- Audio ----------
  function detenerAudio() {
    if (audioPlayer) audioPlayer.pause();
    if (botonSonando) botonSonando.textContent = "▶";
    botonSonando = null;
    urlSonando = null;
  }

  function togglePreview(url, btn) {
    if (!audioPlayer || !url) return;

    if (urlSonando === url && !audioPlayer.paused) {
      detenerAudio();
      return;
    }

    if (botonSonando) botonSonando.textContent = "▶";
    urlSonando = url;
    botonSonando = btn;
    audioPlayer.src = url;
    btn.textContent = "❚❚";

    const promesa = audioPlayer.play();
    if (promesa && typeof promesa.catch === "function") {
      promesa.catch((err) => {
        console.warn("No se pudo reproducir la vista previa:", err);
        btn.textContent = "▶";
        botonSonando = null;
        urlSonando = null;
      });
    }
  }

  audioPlayer?.addEventListener("ended", detenerAudio);

  // Corte total del audio (lo usa rsvp.js al enviar el formulario)
  window.detenerMusica = () => {
    detenerAudio();
    if (audioPlayer) {
      audioPlayer.removeAttribute("src");
      audioPlayer.load();
    }
  };

  // Si se cambia de pestaña / app o se sale de la página (ej. al abrir WhatsApp), pausa
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) detenerAudio();
  });
  window.addEventListener("pagehide", () => window.detenerMusica());

  // ---------- Selección ----------
  function seleccionarCancion(track) {
    detenerAudio();
    if (hiddenInput) hiddenInput.value = `${track.trackName} - ${track.artistName}`;
    document.getElementById("selected-title").textContent = track.trackName;
    document.getElementById("selected-artist").textContent = track.artistName;
    document.getElementById("selected-cover").src =
      track.artworkUrl100 || track.artworkUrl60 || "";

    selectedPreviewUrl = track.previewUrl || null;
    if (btnPlaySelected) {
      btnPlaySelected.style.display = selectedPreviewUrl ? "flex" : "none";
      btnPlaySelected.textContent = "▶";
    }

    selectedCard?.classList.remove("oculto");
    resultsDropdown.classList.add("oculto");
    searchInput.value = "";
  }

  btnRemoveTrack?.addEventListener("click", () => {
    detenerAudio();
    if (hiddenInput) hiddenInput.value = "";
    selectedPreviewUrl = null;
    selectedCard?.classList.add("oculto");
  });

  btnPlaySelected?.addEventListener("click", () => {
    if (selectedPreviewUrl) togglePreview(selectedPreviewUrl, btnPlaySelected);
  });

  // ---------- Eventos del buscador ----------
  searchInput.addEventListener("focus", () => {
    const query = searchInput.value.trim();
    buscarCanciones(query.length >= 2 ? query : BUSQUEDA_RECOMENDADA);
  });

  searchInput.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    const query = e.target.value.trim();

    if (query.length === 0) {
      buscarCanciones(BUSQUEDA_RECOMENDADA);
      return;
    }
    if (query.length < 2) return;

    debounceTimer = setTimeout(() => buscarCanciones(query), DEBOUNCE_MS);
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") resultsDropdown.classList.add("oculto");
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".music-search-group")) {
      resultsDropdown.classList.add("oculto");
    }
  });
});
