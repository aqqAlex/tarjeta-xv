document.addEventListener("DOMContentLoaded", () => {
  const sobre = document.getElementById("sobre-overlay");

  // Sin sobre, la portada anima directamente
  if (!sobre) {
    document.body.classList.add("invitacion-abierta");
    return;
  }

  document.body.classList.add("bloqueado"); // sin scroll mientras el sobre está cerrado
  let abierto = false;

  sobre.addEventListener("click", () => {
    if (abierto) return;
    abierto = true;

    sobre.querySelector(".flap").style.transform = "rotateX(180deg)";
    sobre.querySelector(".sello").style.opacity = "0";

    setTimeout(() => {
      sobre.classList.add("abierto");
      document.body.classList.remove("bloqueado");
      document.body.classList.add("invitacion-abierta"); // arranca la entrada de la portada
      window.scrollTo(0, 0);
    }, 500);
  });
});
