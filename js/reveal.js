// Aparición suave de TODOS los elementos al entrar en pantalla.
// Los elementos se marcan solos (lista AUTO); también podés sumar la clase
// .reveal a mano en el HTML (con reveal-zoom / reveal-left / reveal-right).
document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("js-reveal");

  // [selector, variante]  variante: "" (sube), "zoom", "left", "right", "alt" (izq/der alternado), "line"
  const AUTO = [
    [".countdown-container h3", ""],
    [".time-box", ""],
    ["main > .divider, section > .divider", "line"],
    [".info-section > *", ""],
    [".regalos-section > *", ""],
    [".alias-card > *", ""],
    [".rsvp-section #rsvp-contenido > h3", ""],
    [".rsvp-intro", ""],
    [".radio-title", ""],
    [".radio-card", "alt"],
    [".campos-dinamicos .form-group", ""],
    [".dress-code-card", "zoom"],
    [".dress-code-card > *", ""],
    [".evitar-chip", "left"],
    [".campos-dinamicos > .btn-primary", ""],
    [".footer", ""],
  ];
  const VARIANTES = { zoom: "reveal-zoom", left: "reveal-left", right: "reveal-right", line: "reveal-line" };
  const CLASES = ["reveal", "reveal-zoom", "reveal-left", "reveal-right", "reveal-line", "visible"];

  AUTO.forEach(([selector, variante]) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      if (el.closest(".header")) return; // la portada tiene su propia secuencia
      el.classList.add("reveal");

      if (variante === "alt") el.classList.add(i % 2 === 0 ? "reveal-left" : "reveal-right");
      else if (VARIANTES[variante]) el.classList.add(VARIANTES[variante]);

      // Escalonado según la posición entre hermanos (máx. ~400 ms)
      if (!el.dataset.delay && el.parentElement) {
        const pos = Array.prototype.indexOf.call(el.parentElement.children, el);
        el.dataset.delay = Math.min(pos, 5) * 80;
      }
    });
  });

  const items = document.querySelectorAll(".reveal");
  const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (sinMovimiento || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("visible"));
    return;
  }

  // Terminada la animación se quitan las clases: así no quedan retrasos en hover
  // ni capas extra que molesten (por ejemplo, el desplegable de canciones).
  function limpiar(el) {
    const espera = (parseInt(el.dataset.delay, 10) || 0) + 1100;
    setTimeout(() => {
      el.classList.remove(...CLASES);
      el.style.transitionDelay = "";
    }, espera);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
        limpiar(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -5% 0px" },
  );

  items.forEach((el) => {
    if (el.dataset.delay) el.style.transitionDelay = el.dataset.delay + "ms";
    observer.observe(el);
  });
});
