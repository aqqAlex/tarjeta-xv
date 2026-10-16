// js/carousel.js
document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("carousel-track");
  const dotsWrap = document.getElementById("carousel-dots");
  const btnPrev = document.getElementById("carousel-prev");
  const btnNext = document.getElementById("carousel-next");
  if (!track || !dotsWrap) return;

  const carousel = track.closest(".carousel");
  const slides = Array.from(track.children);
  const total = slides.length;

  const AUTOPLAY_MS = 4000; // tiempo que se ve cada foto
  const TRANSICION_MS = 1100; // duración de la animación entre fotos

  let current = 0;
  let timer = null;
  let animando = false;
  let rafId = null;
  let enPantalla = false;
  let interactuando = false;

  // Barra de progreso
  const barra = document.createElement("div");
  barra.className = "carousel-progress";
  barra.innerHTML = "<span></span>";
  carousel.appendChild(barra);
  const barraRelleno = barra.firstElementChild;

  function reiniciarBarra() {
    barraRelleno.style.animation = "none";
    void barraRelleno.offsetWidth;
    barraRelleno.style.animation = `carouselProgress ${AUTOPLAY_MS}ms linear forwards`;
  }
  function vaciarBarra() {
    barraRelleno.style.animation = "none";
  }

  // Puntos
  const dots = slides.map((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";
    dot.setAttribute("aria-label", `Ir a la foto ${i + 1}`);
    dot.addEventListener("click", () => irA(i));
    dotsWrap.appendChild(dot);
    return dot;
  });

  function marcarActual() {
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
    slides.forEach((s, i) => s.classList.toggle("active", i === current));
  }

  // ---- Animación de deslizamiento con suavizado ----
  const suavizar = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function cancelarAnimacion() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    animando = false;
    track.style.scrollSnapType = "";
  }

  function deslizarA(destino) {
    cancelarAnimacion();
    const inicio = track.scrollLeft;
    const delta = destino - inicio;
    if (delta === 0) return;

    animando = true;
    track.style.scrollSnapType = "none"; // evita que el snap pelee con la animación
    const t0 = performance.now();

    function paso(ahora) {
      const p = Math.min(1, (ahora - t0) / TRANSICION_MS);
      track.scrollLeft = inicio + delta * suavizar(p);
      if (p < 1) {
        rafId = requestAnimationFrame(paso);
      } else {
        animando = false;
        rafId = null;
        track.style.scrollSnapType = "";
      }
    }
    rafId = requestAnimationFrame(paso);
  }

  // Salto con desvanecido (para volver de la última a la primera)
  function saltarConFundido(destino) {
    cancelarAnimacion();
    track.classList.add("fundiendo");
    setTimeout(() => {
      track.scrollLeft = destino;
      track.classList.remove("fundiendo");
    }, 350);
  }

  // ---- Navegación ----
  function programar() {
    clearTimeout(timer);
    if (!enPantalla || interactuando || total < 2) {
      vaciarBarra();
      return;
    }
    reiniciarBarra();
    timer = setTimeout(() => irA(current + 1), AUTOPLAY_MS);
  }

  function irA(i) {
    const anterior = current;
    current = (i + total) % total;
    const destino = current * track.clientWidth;

    if (Math.abs(current - anterior) > 1) {
      saltarConFundido(destino); // vuelta al inicio / saltos largos
    } else {
      deslizarA(destino);
    }
    marcarActual();
    programar();
  }

  // Si el usuario desliza con el dedo, detectamos en qué foto quedó
  let scrollTimeout = null;
  track.addEventListener("scroll", () => {
    if (animando) return;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const nueva = Math.round(track.scrollLeft / track.clientWidth);
      if (nueva !== current) {
        current = nueva;
        marcarActual();
      }
    }, 80);
  });

  btnPrev?.addEventListener("click", () => irA(current - 1));
  btnNext?.addEventListener("click", () => irA(current + 1));

  // Pausa mientras el usuario interactúa
  const pausar = () => {
    interactuando = true;
    programar();
  };
  const reanudar = () => {
    interactuando = false;
    programar();
  };
  carousel.addEventListener("mouseenter", pausar);
  carousel.addEventListener("mouseleave", reanudar);
  carousel.addEventListener(
    "touchstart",
    () => {
      cancelarAnimacion();
      pausar();
    },
    { passive: true },
  );
  carousel.addEventListener("touchend", () => setTimeout(reanudar, 1200), {
    passive: true,
  });

  // Solo avanza cuando el carrusel se está viendo
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      ([entry]) => {
        enPantalla = entry.isIntersecting;
        programar();
      },
      { threshold: 0.4 },
    ).observe(carousel);
  } else {
    enPantalla = true;
  }

  window.addEventListener("resize", () => {
    cancelarAnimacion();
    track.scrollLeft = current * track.clientWidth;
  });

  marcarActual();
  programar();
});
