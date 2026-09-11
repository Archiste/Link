document.addEventListener("DOMContentLoaded", () => {

  const welcomeScreen = document.getElementById("welcome-screen");
  const enterButton = document.getElementById("enter-site");

  const music = document.getElementById("background-music");
  const musicSelect = document.getElementById("music-select");
  const musicToggle = document.getElementById("music-toggle");
  const currentSong = document.getElementById("current-song");

  const notification = document.getElementById("notification");

  const discordAvatar = document.getElementById("discord-avatar");
  const discordDisplayName = document.getElementById("discord-display-name");
  const discordName = document.getElementById("discord-name");
  const discordStatus = document.getElementById("discord-status");
  const discordActivity = document.getElementById("discord-activity");
  const discordStatusDot = document.getElementById("discord-status-dot");
  const profileStatusText = document.getElementById("profile-status-text");
  const discordCopy = document.getElementById("discord-copy");

  const video = document.querySelector(".background-video");

  const DISCORD_ID = "659094544939352064";
  const DISCORD_USERNAME = "archiste.";

  let notificationTimer = null;
  let audioContext = null;

  let hoverAudioContext = null;

function playHoverSfx() {
  try {
    if (!hoverAudioContext) {
      hoverAudioContext = new (
        window.AudioContext ||
        window.webkitAudioContext
      )();
    }

    if (hoverAudioContext.state === "suspended") {
      hoverAudioContext.resume();
    }

    const oscillator = hoverAudioContext.createOscillator();
    const gain = hoverAudioContext.createGain();

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(
      720,
      hoverAudioContext.currentTime
    );

    oscillator.frequency.exponentialRampToValueAtTime(
      980,
      hoverAudioContext.currentTime + 0.055
    );

    gain.gain.setValueAtTime(
      0.0001,
      hoverAudioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.025,
      hoverAudioContext.currentTime + 0.008
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      hoverAudioContext.currentTime + 0.07
    );

    oscillator.connect(gain);
    gain.connect(hoverAudioContext.destination);

    oscillator.start();
    oscillator.stop(hoverAudioContext.currentTime + 0.075);
  } catch (error) {

  }
}

   const hoverElements = document.querySelectorAll(
    ".link-card, .featured-button, .discord-card, .music-toggle, button, select"
  );

  hoverElements.forEach((element) => {
    element.addEventListener("mouseenter", playHoverSfx);
  });

  function initAudioContext() {
    if (!audioContext) {
      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      if (AudioContext) {
        audioContext = new AudioContext();
      }
    }

    if (
      audioContext &&
      audioContext.state === "suspended"
    ) {
      audioContext.resume().catch(() => {});
    }
  }

  function playHoverSound() {
    if (!audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "sine";

      oscillator.frequency.setValueAtTime(
        620,
        audioContext.currentTime
      );

      oscillator.frequency.exponentialRampToValueAtTime(
        820,
        audioContext.currentTime + 0.045
      );

      gain.gain.setValueAtTime(
        0.0001,
        audioContext.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.045,
        audioContext.currentTime + 0.008
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + 0.07
      );

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(
        audioContext.currentTime + 0.075
      );

    } catch {}
  }

  document
    .querySelectorAll(".sfx-button")
    .forEach((button) => {

      button.addEventListener("mouseenter", () => {
        playHoverSound();
      });

    });



  music.volume = 0.22;

  function updateMusicButton() {

    const playing = !music.paused;

    musicToggle.textContent =
      playing ? "Ⅱ" : "▶";

    musicToggle.setAttribute(
      "aria-label",
      playing
        ? "Mettre la musique en pause"
        : "Lire la musique"
    );

  }

  function updateSongName() {

    const option =
      musicSelect.options[
        musicSelect.selectedIndex
      ];

    currentSong.textContent =
      option && musicSelect.value
        ? option.textContent.trim()
        : "No song selected";
  }

  async function playMusic() {

    if (!musicSelect.value) {

      music.pause();
      music.removeAttribute("src");
      music.load();

      updateSongName();
      updateMusicButton();

      return;
    }

    music.src = musicSelect.value;
    updateSongName();

    try {

      await music.play();

    } catch (error) {

      console.warn(
        "Impossible de lire la musique :",
        error
      );

    }

    updateMusicButton();
  }

  musicSelect.addEventListener(
    "change",
    playMusic
  );

  musicToggle.addEventListener(
    "click",
    async () => {

      initAudioContext();

      if (!music.src) {
        musicSelect.focus();
        return;
      }

      if (music.paused) {

        try {
          await music.play();
        } catch {}

      } else {

        music.pause();

      }

      updateMusicButton();

    }
  );

  music.addEventListener(
    "play",
    updateMusicButton
  );

  music.addEventListener(
    "pause",
    updateMusicButton
  );


  enterButton.addEventListener(
    "click",
    async () => {

      initAudioContext();

      welcomeScreen.classList.add("hidden");

      if (musicSelect.value) {
        await playMusic();
      }

    }
  );

  const statusNames = {
    online: "Online",
    idle: "Idle",
    dnd: "Do Not Disturb",
    offline: "Offline"
  };
function updateDiscord(data) {
  if (!data || !data.discord_user) return;

  const user = data.discord_user;
  const status = data.discord_status || "offline";

  discordName.textContent =
    user.global_name ||
    user.username ||
    "Archiste";

  discordStatus.textContent =
    statusNames[status] || "Offline";

  discordStatusDot.className =
    "discord-status-dot discord-status-" + status;

  if (user.avatar) {
    const extension = user.avatar.startsWith("a_") ? "gif" : "png";

    discordAvatar.src =
      `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${user.avatar}.${extension}?size=128`;
  }

  
  const activities = Array.isArray(data.activities)
    ? data.activities
    : [];

  const activity = activities.find(
    activity => activity.type !== 4
  );

  if (activity) {
    if (activity.name === "Spotify") {
      discordActivity.textContent =
        activity.details
          ? `♫ ${activity.details}`
          : "♫ Listening to Spotify";
    } else if (activity.name) {
      discordActivity.textContent =
        activity.details
          ? `${activity.name} — ${activity.details}`
          : activity.name;
    }
  } else {
    discordActivity.textContent =
      status === "offline"
        ? "Currently offline"
        : "Discord";
  }
}

  async function fetchDiscord() {

    try {

      const response = await fetch(
        `https://api.lanyard.rest/v1/users/${DISCORD_ID}`
      );

      if (!response.ok) {
        throw new Error("Lanyard request failed");
      }

      const json = await response.json();

      updateDiscord(json.data);

    } catch (error) {

      console.warn(
        "Impossible de récupérer Discord via Lanyard:",
        error
      );

    }
  }

  fetchDiscord();

  setInterval(
    fetchDiscord,
    15000
  );

  discordCopy.addEventListener(
    "click",
    async () => {

      initAudioContext();

      try {

        await navigator.clipboard.writeText(
          DISCORD_USERNAME
        );

        showNotification(
          "Discord copié : " +
          DISCORD_USERNAME
        );

      } catch {

        showNotification(
          "Discord : " +
          DISCORD_USERNAME
        );

      }

    }
  );

  function showNotification(message) {

    notification.textContent =
      message;

    notification.classList.add("show");

    clearTimeout(notificationTimer);

    notificationTimer =
      setTimeout(() => {

        notification.classList.remove(
          "show"
        );

      }, 2200);
  }

  if (video) {

    video.muted = true;

    function playVideo() {

      const promise = video.play();

      if (promise) {
        promise.catch(() => {});
      }

    }

    playVideo();

    document.addEventListener(
      "visibilitychange",
      () => {

        if (
          document.visibilityState ===
          "visible"
        ) {
          playVideo();
        }

      }
    );
  }

  updateMusicButton();
  updateSongName();

});

enterButton.addEventListener("click", async () => {
  welcomeScreen.classList.add("hidden");
  document.body.classList.add("entered");

  if (musicSelect.value) {
    await playMusic();
  }
});
