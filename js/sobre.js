document.addEventListener('DOMContentLoaded', () => {
  const sobre = document.getElementById('sobre-overlay');
  if (!sobre) return;

  sobre.addEventListener('click', () => {
    sobre.querySelector('.flap').style.transform = 'rotateX(180deg)';
    sobre.querySelector('.sello').style.opacity = '0';

    setTimeout(() => {
      sobre.classList.add('abierto');
    }, 300);
  });
});