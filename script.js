document.addEventListener("DOMContentLoaded", () => {
    const discordLink = document.getElementById("discord-link");
    const notification = document.getElementById("notification");

    const music = document.getElementById("background-music");
    const musicSelect = document.getElementById("music-select");
    const musicToggle = document.getElementById("music-toggle");

    const welcomeScreen = document.getElementById("welcome-screen");
    const enterButton = document.getElementById("enter-site");

    const discordUsername = "archiste.";

    music.volume = 0.25;

    let audioContext;

    function initAudio() {
        if (!audioContext) {
            audioContext = new (
                window.AudioContext ||
                window.webkitAudioContext
            )();
        }

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }
    }

    function playHoverSound() {
        if (!audioContext) return;

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(
            650,
            audioContext.currentTime
        );

        oscillator.frequency.exponentialRampToValueAtTime(
            900,
            audioContext.currentTime + 0.06
        );

        gain.gain.setValueAtTime(
            0.0001,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.08,
            audioContext.currentTime + 0.01
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            audioContext.currentTime + 0.08
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.08);
    }


    discordLink.addEventListener("click", async (event) => {
        event.preventDefault();

        try {
            await navigator.clipboard.writeText(discordUsername);

            notification.classList.add("show");

            setTimeout(() => {
                notification.classList.remove("show");
            }, 2000);

        } catch (error) {
            console.error("Impossible de copier :", error);
        }
    });


    enterButton.addEventListener("click", async () => {
        initAudio();

        const selectedMusic = musicSelect.value;

        if (selectedMusic) {
            music.src = selectedMusic;

            try {
                await music.play();
                musicToggle.textContent = "⏸";
            } catch (error) {
                console.log("Musique bloquée :", error);
            }
        }

        welcomeScreen.classList.add("hidden");
    });

    musicSelect.addEventListener("change", async () => {
        initAudio();

        const selectedMusic = musicSelect.value;

        if (!selectedMusic) {
            music.pause();
            music.removeAttribute("src");
            music.load();
            musicToggle.textContent = "▶";
            return;
        }

        music.src = selectedMusic;

        try {
            await music.play();
            musicToggle.textContent = "⏸";
        } catch (error) {
            console.error("Impossible de lancer la musique :", error);
        }
    });


    musicToggle.addEventListener("click", async () => {
        initAudio();

        if (!music.src) {
            musicSelect.focus();
            return;
        }

        if (music.paused) {
            try {
                await music.play();
                musicToggle.textContent = "⏸";
            } catch (error) {
                console.error("Impossible de lancer la musique :", error);
            }
        } else {
            music.pause();
            musicToggle.textContent = "▶";
        }
    });

    document
        .querySelectorAll(".link-button, .music-player, #music-toggle")
        .forEach((element) => {
            element.addEventListener("mouseenter", () => {
                playHoverSound();
            });
        });


    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            music.pause();
            musicToggle.textContent = "▶";
        }
    });
});
