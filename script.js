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

let lastGlitch = 0;

function playGlitch(strong) {
  try {
    const now = performance.now();
    if (!strong && now - lastGlitch < 90) return;
    lastGlitch = now;

    if (!hoverAudioContext) {
      hoverAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = hoverAudioContext;
    if (ctx.state === "suspended") ctx.resume();

    const t = ctx.currentTime;
    const dur = strong ? 0.28 : 0.13;
    const level = strong ? 0.07 : 0.035;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);

    // Bruit haché et écrasé (bitcrush + stutter)
    let i = 0;
    while (i < len) {
      const step = 8 + Math.floor(Math.random() * 60);
      const v = Math.random() * 2 - 1;
      const gate = Math.random() > 0.35 ? 1 : 0;
      for (let k = 0; k < step && i < len; k++, i++) d[i] = v * gate;
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 1.2;
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.exponentialRampToValueAtTime(5000, t + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(level, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(t);

    // Blips carrés à hauteur aléatoire
    const osc = ctx.createOscillator();
    const og = ctx.createGain();
    osc.type = "square";
    for (let k = 0; k < 5; k++) {
      osc.frequency.setValueAtTime(120 + Math.random() * 1700, t + k * 0.03);
    }
    og.gain.setValueAtTime(level / 3, t);
    og.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.8);
    osc.connect(og);
    og.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  } catch (error) {}
}

function playHoverSfx() {
  playGlitch(false);
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


  



  music.volume = 0.22;

  function updateMusicButton() {

    const playing = !music.paused;
    document.querySelector(".music-disc")?.classList.toggle("playing", playing);

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

  

  discordStatus.textContent =
    statusNames[status] || "Offline";

  discordStatusDot.className =
    "discord-status-dot discord-status-" + status;

  // Avatar Discord
  if (user.avatar) {
    const extension = user.avatar.startsWith("a_") ? "gif" : "png";

    discordAvatar.src =
      `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${user.avatar}.${extension}?size=128`;
  }

  // Activité Discord
  const activities = Array.isArray(data.activities)
    ? data.activities
    : [];

  // On ignore uniquement le Custom Status (type 4)
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

  document.addEventListener("click", (event) => {
    if (event.target.closest("button, a, select")) playGlitch(true);
  });

  const glow = document.querySelector(".cursor-glow");
  window.addEventListener("mousemove", (event) => {
    if (!glow) return;
    glow.style.left = event.clientX + "px";
    glow.style.top = event.clientY + "px";
  });

  enterButton.focus();
});

