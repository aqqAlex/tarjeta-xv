const SUPABASE_URL = 'https://vqrggwytoxbesiyizzar.supabase.co';
const SUPABASE_KEY = 'sb_publishable_91CQ7N9k-O-IA5MpRHbmpA_vIp674x_';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
  const radioAsiste = document.querySelectorAll('input[name="asiste"]');
  const camposSi = document.getElementById('campos-si');
  const camposNo = document.getElementById('campos-no');
  const inputNombreSi = document.getElementById('nombre-si');
  const inputNombreNo = document.getElementById('nombre-no');
  const form = document.getElementById('form-rsvp');

  // Alternar Visibilidad de Campos
  radioAsiste.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const esSi = e.target.value === 'true';
      camposSi.classList.toggle('oculto', !esSi);
      camposNo.classList.toggle('oculto', esSi);
      inputNombreSi.toggleAttribute('required', esSi);
      inputNombreNo.toggleAttribute('required', !esSi);
    });
  });

  // Envío a Supabase
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const radioSelected = document.querySelector('input[name="asiste"]:checked');
      if (!radioSelected) {
        return alert('Por favor selecciona si vas a asistir o no.');
      }

      const asisteVal = radioSelected.value === 'true';
      const submitBtn = form.querySelector('.campos-dinamicos:not(.oculto) button[type="submit"]');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';

      let datos = {};
      if (asisteVal) {
        datos = {
          nombre: inputNombreSi.value.trim(),
          asiste: true,
          menu_especial: document.getElementById('menu').value.trim() || null,
          cancion: document.getElementById('cancion')?.value.trim() || null
        };
      } else {
        const mensajeVal = document.getElementById('mensaje-no').value.trim();
        datos = {
          nombre: inputNombreNo.value.trim(),
          asiste: false,
          menu_especial: mensajeVal ? `Mensaje: ${mensajeVal}` : null,
          cancion: null
        };
      }

      const { error } = await supabaseClient.from('confirmaciones').insert([datos]);

      if (error) {
        console.error('Error al insertar:', error);
        alert('❌ Error al enviar la confirmación: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'ENVIAR';
      } else {
        document.getElementById('rsvp-contenido')?.classList.add('oculto');

        const tituloAgr = document.getElementById('agradecimiento-titulo');
        const textoAgr = document.getElementById('agradecimiento-texto');

        if (asisteVal) {
          tituloAgr.textContent = '¡Gracias por tu confirmación!';
          textoAgr.textContent = 'Tu respuesta ha sido registrada correctamente. ¡Nos vemos en la celebración!';
          if (typeof lanzarFuegosArtificiales === 'function') {
            lanzarFuegosArtificiales();
          }
        } else {
          tituloAgr.textContent = '¡Gracias por tu respuesta!';
          textoAgr.textContent = 'Lamentamos que no puedas asistir, pero agradecemos tu mensaje.';
        }

        document.getElementById('rsvp-agradecimiento')?.classList.remove('oculto');
      }
    });
  }
});