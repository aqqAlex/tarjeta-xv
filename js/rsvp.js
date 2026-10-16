const SUPABASE_URL = "https://vqrggwytoxbesiyizzar.supabase.co";
const SUPABASE_KEY = "sb_publishable_91CQ7N9k-O-IA5MpRHbmpA_vIp674x_";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============ CONFIGURACIÓN DE WHATSAPP ============
const WHATSAPP_NUMERO = "5492346527126";
const SEGUNDOS_REDIRECCION = 7;
// ===================================================

function armarMensajeWhatsApp(d) {
  if (d.asiste) {
    let msg = `¡Hola Paz! Soy ${d.nombre} y confirmo que voy a ir a tus XV el 07/11/2026. ¡Nos vemos en la fiesta! ✨`;
    if (d.menu_especial) msg += `\n🍽️ Restricción alimentaria: ${d.menu_especial}`;
    if (d.cancion) msg += `\n🎵 Canción que no puede faltar: ${d.cancion}`;
    return msg;
  }
  let msg = `¡Hola Paz! Soy ${d.nombre}. Lamentablemente no voy a poder ir a tus XV. 💔`;
  if (d.mensaje) msg += `\n💌 ${d.mensaje}`;
  return msg;
}

function iniciarRedireccion(url) {
  const segundosEl = document.getElementById("redirect-segundos");
  const unidadEl = document.getElementById("redirect-unidad");
  const barra = document.getElementById("redirect-barra");
  const btnAhora = document.getElementById("btn-whatsapp-ahora");

  let restantes = SEGUNDOS_REDIRECCION;
  segundosEl.textContent = restantes;
  unidadEl.textContent = restantes === 1 ? "segundo" : "segundos";
  btnAhora.href = url;

  // Reutiliza el keyframe carouselProgress (width 0 → 100%) de carousel.css
  barra.style.animation = `carouselProgress ${SEGUNDOS_REDIRECCION}s linear forwards`;

  const intervalo = setInterval(() => {
    restantes--;
    if (restantes <= 0) {
      clearInterval(intervalo);
      segundosEl.textContent = 0;
      unidadEl.textContent = "segundos";
      window.detenerMusica?.();
      window.location.href = url;
      return;
    }
    segundosEl.textContent = restantes;
    unidadEl.textContent = restantes === 1 ? "segundo" : "segundos";
  }, 1000);

  // Si toca el botón manual, cancelamos la cuenta para no abrir dos veces
  btnAhora.addEventListener("click", () => clearInterval(intervalo), {
    once: true,
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const radioAsiste = document.querySelectorAll('input[name="asiste"]');
  const camposSi = document.getElementById("campos-si");
  const camposNo = document.getElementById("campos-no");
  const inputNombreSi = document.getElementById("nombre-si");
  const inputNombreNo = document.getElementById("nombre-no");
  const form = document.getElementById("form-rsvp");

  // Alternar visibilidad de campos
  radioAsiste.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const esSi = e.target.value === "true";
      camposSi.classList.toggle("oculto", !esSi);
      camposNo.classList.toggle("oculto", esSi);
      inputNombreSi.toggleAttribute("required", esSi);
      inputNombreNo.toggleAttribute("required", !esSi);

      // Baja sola hasta el formulario para no tener que scrollear
      requestAnimationFrame(() => {
        document
          .querySelector(".rsvp-attendance-selector")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  });

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const radioSelected = document.querySelector('input[name="asiste"]:checked');
    if (!radioSelected) {
      return alert("Por favor seleccioná si vas a asistir o no.");
    }

    const asisteVal = radioSelected.value === "true";
    const submitBtn = form.querySelector(
      '.campos-dinamicos:not(.oculto) button[type="submit"]',
    );
    const textoOriginal = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";

    let datos = {};
    let mensajeNo = "";
    if (asisteVal) {
      datos = {
        nombre: inputNombreSi.value.trim(),
        asiste: true,
        menu_especial: document.getElementById("menu").value.trim() || null,
        cancion: document.getElementById("cancion")?.value.trim() || null,
      };
    } else {
      mensajeNo = document.getElementById("mensaje-no").value.trim();
      datos = {
        nombre: inputNombreNo.value.trim(),
        asiste: false,
        menu_especial: mensajeNo ? `Mensaje: ${mensajeNo}` : null,
        cancion: null,
      };
    }

    const { error } = await supabaseClient.from("confirmaciones").insert([datos]);

    if (error) {
      console.error("Error al insertar:", error);
      alert("❌ Error al enviar la confirmación: " + error.message);
      submitBtn.disabled = false;
      submitBtn.textContent = textoOriginal;
      return;
    }

    // --- Éxito: cortar la música si estaba sonando ---
    window.detenerMusica?.();

    // --- Mostrar agradecimiento + contador de redirección ---
    document.getElementById("rsvp-contenido")?.classList.add("oculto");

    const tituloAgr = document.getElementById("agradecimiento-titulo");
    const textoAgr = document.getElementById("agradecimiento-texto");

    if (asisteVal) {
      tituloAgr.textContent = "¡Gracias por tu confirmación!";
      textoAgr.textContent =
        "Tu respuesta fue registrada. Falta un último paso para avisarle a Paz.";
      if (typeof lanzarFuegosArtificiales === "function") {
        lanzarFuegosArtificiales();
      }
    } else {
      tituloAgr.textContent = "¡Gracias por tu respuesta!";
      textoAgr.textContent =
        "Lamentamos que no puedas venir, pero agradecemos tu mensaje.";
    }

    const bloque = document.getElementById("rsvp-agradecimiento");
    bloque?.classList.remove("oculto");
    bloque?.scrollIntoView({ behavior: "smooth", block: "center" });

    const mensaje = armarMensajeWhatsApp({ ...datos, mensaje: mensajeNo });
    const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
    iniciarRedireccion(url);
  });
});
