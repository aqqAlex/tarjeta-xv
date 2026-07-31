document.addEventListener('DOMContentLoaded', () => {
    //fecha objetivo
    const eventDate = new Date('2026-11-07T21:30:00').getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const containerEl = document.querySelector('.countdown-container');

    if(!daysEl || !hoursEl || !minutesEl || !secondsEl) {
        return;
    }
        function updateCountdown() {
            const now = new Date().getTime();
            const difference = eventDate - now;

            if(difference <= 0) {
                if (containerEl) {
                    containerEl.innerHTML = '<p>¡El evento ha comenzado!</p>';
                }
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            daysEl.innerText = days < 10 ? '0' + days : days;
            hoursEl.innerText = hours < 10 ? '0' + hours : hours;
            minutesEl.innerText = minutes < 10 ? '0' + minutes : minutes;
            secondsEl.innerText = seconds < 10 ? '0' + seconds : seconds;
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
    });