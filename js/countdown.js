document.addEventListener("DOMContentLoaded", () => {
  //fecha objetivo
  const eventDate = new Date("2026-11-07T21:30:00").getTime();

  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  const containerEl = document.querySelector(".countdown-container");

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
    return;
  }
  // Animación sutil solo cuando cambia el número
  function setValue(el, value) {
    if (el.textContent === value) return;
    el.textContent = value;
    el.classList.remove("tick");
    void el.offsetWidth;
    el.classList.add("tick");
  }

  function updateCountdown() {
    const now = new Date().getTime();
    const difference = eventDate - now;

    if (difference <= 0) {
      if (containerEl) {
        containerEl.innerHTML = "<p>¡El evento ha comenzado!</p>";
      }
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    setValue(daysEl, String(days).padStart(2, "0"));
    setValue(hoursEl, String(hours).padStart(2, "0"));
    setValue(minutesEl, String(minutes).padStart(2, "0"));
    setValue(secondsEl, String(seconds).padStart(2, "0"));
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
});
