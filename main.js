// ===== Global state & helpers =====
const ambientAudio = document.getElementById("ambientAudio");
const voiceToggle  = document.getElementById("voiceToggle");
const titleEl      = document.getElementById("title");
const storyEl      = document.getElementById("storyText");
const buttonsEl    = document.getElementById("buttonsContainer");
const gameWrap     = document.getElementById("gameContainer");

let soundEnabled = false;
let narrationUtterance = null;
let currentStage = "intro";

// ===== Stage data =====
const STAGES = {
  intro: {
    bg: "assets/gorgo.jpg",
    title: "YOUR GORGO EXPERIENCE",
    text: `Gorgo Is The Protector`,
    buttons: [
      { label: "Your Search Begins", action: () => {
          enableSound();
          playAmbient();
          speak(STAGES.intro.text);
          buttonsEl.innerHTML = "";
          const contBtn = document.createElement("button");
          contBtn.textContent = "Continue";
          contBtn.addEventListener("click", () => goTo("role"));
          buttonsEl.appendChild(contBtn);
      }}
    ]
  },

  role: {
    bg: "assets/gorgolum1.jpg",
    title: "YOUR GORGO EXPERIENCE",
    text: `DISCOVER HER MYTH.`,
    buttons: [
      { label: "The Divine Bond", action: () => goTo("lore") },
      { label: "Instructions", action: () => goTo("instructions") }
    ]
  },

  lore: {
    bg: "assets/medusa3.jpg",
    title: "The Divine Bond",
    text: `Use AR to reveal the protectors of the temple.`,
    buttons: [
      { label: "START AR EXPERIENCE", action: () => {
          stopAmbient();
          window.open(`ar.html?from=${currentStage}`, "_blank");
      }},
      { label: "Finish Task", action: () => goTo("end") },
      { label: "Back", action: () => goTo("role") }
    ]
  },

  instructions: {
    bg: "assets/templegorgo1.jpg",
    title: "Discover the secrets of Artemis temple",
    text: `
      • You play as the <b>Pegasus</b>.<br>
      • Use your device camera to find 2 hidden markers on the pediment.<br>
      • Each marker reveals a voice information and a symbol.<br>
      • Scan 2 pieces of Artemis Temple to understand why Gorgo is the true protector of the Temple .<br>
    `,
    buttons: [
      { label: "Back", action: () => goTo("role") }
    ]
  },

  // ——— Minimal edits so the end "has meaning" ———
  end: {
  bg: "assets/back.jpg",
  title: "Ολοκλήρωση",
  text: `Ολοκλήρωσες το ταξίδι σου.<br><br>Θέλεις να ξαναρχίσεις;`,
  buttons: [
    { label: "Ξεκίνημα ξανά", action: () => goTo("intro", true) }
  ]
}
};

// ===== Sound / Narration =====
function enableSound() {
  soundEnabled = true;
  voiceToggle.classList.add("active");
  voiceToggle.textContent = "🔊";
}

function disableSound() {
  soundEnabled = false;
  voiceToggle.classList.remove("active");
  voiceToggle.textContent = "🔇";
  cancelNarration();
  stopAmbient();
}

function playAmbient() {
  if (!soundEnabled) return;
  ambientAudio.volume = 0.4;
  ambientAudio.play().catch(() => {});
}

function stopAmbient() { ambientAudio.pause(); }

function cancelNarration() {
  try {
    if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
  } catch {}
}

function speak(text) {
  cancelNarration();
  if (!soundEnabled) return;
  let plainText = text.replace(/<a[^>]*>.*?<\/a>/gi, "");
  plainText = plainText.replace(/(<([^>]+)>)/gi, "");
  plainText = plainText.replace(/&[a-z]+;/gi, " ");
  plainText = plainText.replace(/\s+/g, " ").trim();
  const u = new SpeechSynthesisUtterance(plainText);
  u.lang = "en-GB";
  u.rate = 1.05;
  u.pitch = 1.0;
  narrationUtterance = u;
  speechSynthesis.speak(u);
}

voiceToggle.addEventListener("click", () => {
  if (soundEnabled) {
    disableSound();
  } else {
    enableSound();
    playAmbient();
    if (STAGES[currentStage]) speak(STAGES[currentStage].text);
  }
});

// ===== Navigation =====
function goTo(stage, resetAll = false) {
  // If called as Restart with resetAll=true, do a soft reset so the action έχει νόημα
  if (resetAll === true) {
    cancelNarration();
    stopAmbient();
    disableSound();               // επιστρέφει το σύστημα σε «σίγαση»
    try { history.replaceState({}, "", location.pathname); } catch {}
  }

  currentStage = stage;
  const s = STAGES[stage];
  if (!s) return;

  if (s.bg) gameWrap.style.backgroundImage = `url('${s.bg}')`;
  titleEl.textContent = s.title || "";
  storyEl.innerHTML = s.text || "";

  buttonsEl.innerHTML = "";
  (s.buttons || []).forEach(b => {
    const btn = document.createElement("button");
    btn.textContent = b.label;
    btn.addEventListener("click", b.action);
    buttonsEl.appendChild(btn);
  });

  if (soundEnabled) speak(s.text || "");
}

// ===== Init =====
window.addEventListener("load", () => {
  const params = new URLSearchParams(window.location.search);
  const section = params.get("section");
  if (section && STAGES[section]) {
    goTo(section);
  } else {
    goTo("intro");
  }
});
