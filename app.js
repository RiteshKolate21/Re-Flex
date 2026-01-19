const app = document.querySelector("#app");
const mainText = document.querySelector("#main-text");
const subText = document.querySelector("#sub-text");
const iconDisplay = document.querySelector(".icon-display");
const actionBtn = document.querySelector("#action-btn");
const scoreList = document.querySelector("#score-list");

let startTime;
let timeoutId;
let gameState = "START"; // START, WAITING, GO, RESULT, TOO_SOON
let highScores = JSON.parse(localStorage.getItem("reflexHighScores")) || [];

// Initialize High Scores on load
renderHighScores();

function renderHighScores() {
  scoreList.innerHTML = highScores
    .map((score, index) => {
      const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";
      return `<li><span>${medal} #${index + 1}</span> <span>${score} ms</span></li>`;
    })
    .join("");

  // Fill empty slots if less than 3
  if (highScores.length < 3) {
    for (let i = highScores.length; i < 3; i++) {
      scoreList.innerHTML += `<li><span>#${i + 1}</span> <span>--</span></li>`;
    }
  }
}

function updateHighScores(newScore) {
  highScores.push(newScore);
  highScores.sort((a, b) => a - b);
  highScores = highScores.slice(0, 3); // Keep top 3
  localStorage.setItem("reflexHighScores", JSON.stringify(highScores));
  renderHighScores();
}

// Elements update helper
function updateUI(state, title, subtitle, icon, btnText, showBtn) {
  // Reset classes
  app.className = "";
  app.classList.add(`state-${state.toLowerCase().replace("_", "-")}`);

  if (state === "GO") {
    app.classList.add("clickable");
  }

  mainText.textContent = title;
  subText.textContent = subtitle;
  iconDisplay.textContent = icon;

  if (showBtn) {
    actionBtn.textContent = btnText;
    actionBtn.classList.remove("hidden");
  } else {
    actionBtn.classList.add("hidden");
  }
}

function startGame(e) {
  if (e) e.stopPropagation(); // vital to prevent immediate trigger

  gameState = "WAITING";
  updateUI("WAITING", "Wait for Green", "Don't click yet...", "✋", "", false);

  const randomDelay = Math.floor(Math.random() * 4000) + 2000; // 2-6 seconds

  timeoutId = setTimeout(() => {
    if (gameState === "WAITING") {
      showClickScreen();
    }
  }, randomDelay);
}

function showClickScreen() {
  gameState = "GO";
  startTime = Date.now();
  updateUI("GO", "CLICK!", "Click anywhere now!", "💥", "", false);
}

function handleGlobalClick() {
  if (gameState === "WAITING") {
    // Too soon
    clearTimeout(timeoutId);
    gameState = "TOO_SOON";
    updateUI("TOO_SOON", "Too Soon!", "You clicked too early.", "⚠️", "Try Again", true);
    return;
  }

  if (gameState === "GO") {
    // Success
    const reactionTime = Date.now() - startTime;
    gameState = "RESULT";

    // Check for High Score
    const isHighScore = highScores.length < 3 || reactionTime < highScores[2];

    if (isHighScore) {
      updateHighScores(reactionTime);
    }

    let message = "Keep practicing!";
    if (reactionTime < 200) message = "Incredible speed! 🚀";
    else if (reactionTime < 300) message = "Great reflexes! 🔥";
    else if (reactionTime < 400) message = "Not bad! 👍";

    if (isHighScore) {
      message = "🎉 NEW HIGH SCORE! 🎉";
    }

    updateUI("RESULT", `${reactionTime} ms`, message, "⚡", "Play Again", true);
  }
}

// Event Listeners
actionBtn.addEventListener("click", startGame);

app.addEventListener("click", () => {
  if (gameState === "WAITING" || gameState === "GO") {
    handleGlobalClick();
  }
});

