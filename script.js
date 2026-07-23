// Credenciales públicas de tu proyecto
const SUPABASE_URL = 'https://vqrggwytoxbesiyizzar.supabase.co';
const SUPABASE_KEY = 'sb_publishable_91CQ7N9k-O-IA5MpRHbmpA_vIp674x_';

// Inicializar Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
  // 1. Interacción para abrir el sobre
  const sobre = document.getElementById('sobre-overlay');
  if (sobre) {
    sobre.addEventListener('click', () => {
      sobre.classList.add('abierto');
    });
  }

  // 2. Envío del formulario RSVP a Supabase
  const form = document.getElementById('form-rsvp');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const menuVal = document.getElementById('menu').value.trim();
      const cancionVal = document.getElementById('cancion').value.trim();

      const datos = {
        nombre: document.getElementById('nombre').value.trim(),
        asiste: document.getElementById('asiste').value === 'true',
        menu_especial: menuVal !== '' ? menuVal : null,
        cancion: cancionVal !== '' ? cancionVal : null
      };

      console.log("Enviando asistencia...", datos);

      const { data, error } = await supabaseClient
        .from('confirmaciones')
        .insert([datos]);

      if (error) {
        console.error("Error al insertar:", error);
        alert("❌ Error al enviar la confirmación: " + error.message);
      } else {
        console.log("¡Insert exitoso!", data);
        alert("🎉 ¡Gracias por confirmar tu asistencia!");
        form.reset();
      }
    });
  }
});