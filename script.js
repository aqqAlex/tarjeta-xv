// Credenciales públicas de tu proyecto
const SUPABASE_URL = 'https://vqrggwytoxbesiyizzar.supabase.co';
const SUPABASE_KEY = 'sb_publishable_91CQ7N9k-O-IA5MpRHbmpA_vIp674x_';

// Inicializar Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('form-test');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const menuVal = document.getElementById('menu').value.trim();
  const cancionVal = document.getElementById('cancion').value.trim();

  // Armamos el objeto con los nombres exactos de tus columnas
  const datos = {
    nombre: document.getElementById('nombre').value.trim(),
    asiste: document.getElementById('asiste').checked,
    menu_especial: menuVal !== '' ? menuVal : null,
    cancion: cancionVal !== '' ? cancionVal : null
  };

  console.log("Enviando datos a Supabase...", datos);

  const { data, error } = await supabaseClient
    .from('confirmaciones')
    .insert([datos]);

  if (error) {
    console.error("Error al insertar:", error);
    alert("❌ Error: " + error.message);
  } else {
    console.log("¡Insert exitoso!", data);
    alert("🎉 ¡Prueba exitosa! Revisa la tabla en Supabase.");
    form.reset();
  }
});