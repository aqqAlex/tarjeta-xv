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

  // 3. Envío del Formulario a Supabase
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
        const cancionVal = document.getElementById('cancion').value.trim();
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
        // Ocultar todo el bloque del formulario + títulos
        const rsvpContenido = document.getElementById('rsvp-contenido');
        if (rsvpContenido) rsvpContenido.classList.add('oculto');

        // Mostrar tarjeta de agradecimiento
        const contenedorAgradecimiento = document.getElementById('rsvp-agradecimiento');
        const tituloAgr = document.getElementById('agradecimiento-titulo');
        const textoAgr = document.getElementById('agradecimiento-texto');

        if (asisteVal) {
          tituloAgr.textContent = '¡Gracias por tu confirmación!';
          textoAgr.textContent = 'Tu respuesta ha sido registrada correctamente. ¡Nos vemos en la celebración!';
          
          // Efecto de Fuegos artificiales
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