document.addEventListener('DOMContentLoaded', () => {
  const swatches = document.querySelectorAll('.color-swatch');
  const indicador = document.getElementById('color-indicador');

  if (swatches.length && indicador) {
    swatches.forEach(swatch => {
      // Evento para escritorio (Hover)
      swatch.addEventListener('mouseenter', (e) => {
        const colorNombre = e.target.getAttribute('data-color');
        indicador.textContent = colorNombre;
        indicador.style.opacity = '1';
      });

      // Evento para pantallas táctiles / Clic
      swatch.addEventListener('click', (e) => {
        swatches.forEach(s => s.classList.remove('active'));
        e.target.classList.add('active');
        const colorNombre = e.target.getAttribute('data-color');
        indicador.textContent = colorNombre;
      });
    });

    // Restaurar texto sutil al quitar el cursor de la barra
    const gradientBar = document.getElementById('gradient-bar');
    gradientBar?.addEventListener('mouseleave', () => {
      indicador.textContent = 'Pasá el cursor o tocá un color';
    });
  }
});