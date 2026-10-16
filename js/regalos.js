// Copiar alias al portapapeles
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btn-copiar-alias");
  const alias = document.getElementById("alias-valor");
  const msg = document.getElementById("copiado-msg");
  if (!btn || !alias) return;

  const texto = alias.textContent.trim();

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
    } catch (e) {
      // Plan B para navegadores sin Clipboard API
      const ta = document.createElement("textarea");
      ta.value = texto;
      ta.style.cssText = "position:fixed;opacity:0;";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (_) {}
      ta.remove();
    }
    btn.textContent = "¡COPIADO!";
    btn.classList.add("copiado");
    if (msg) msg.textContent = "Alias copiado al portapapeles";
    setTimeout(() => {
      btn.textContent = "COPIAR ALIAS";
      btn.classList.remove("copiado");
      if (msg) msg.textContent = "";
    }, 2200);
  }

  btn.addEventListener("click", copiar);
});
