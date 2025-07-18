const box = document.getElementById('box');
const scoreText = document.getElementById('score');
const countdownText = document.getElementById('countdown');
const clickSound = document.getElementById('clickSound');
const startSound = document.getElementById('startSound');
const difficultySelect = document.getElementById('difficulty');
const restartBtn = document.getElementById('restartBtn');

let round = 0;
let totalTime = 0;
let appearTime = 0;
let isPlaying = false;

function getRandomPosition() {
  const area = document.getElementById('gameArea');
  const x = Math.random() * (area.clientWidth - box.clientWidth);
  const y = Math.random() * (area.clientHeight - box.clientHeight);
  return { x, y };
}

function getDelay() {
  const difficulty = difficultySelect.value;
  switch (difficulty) {
    case 'easy':
      return Math.random() * 2000 + 1000;
    case 'medium':
      return Math.random() * 1500 + 700;
    case 'hard':
      return Math.random() * 1000 + 300;
    default:
      return 1500;
  }
}

function showBox() {
  const { x, y } = getRandomPosition();
  box.style.left = `${x}px`;
  box.style.top = `${y}px`;
  box.style.display = 'block';
  appearTime = Date.now();
}

function hideBox() {
  box.style.display = 'none';
}

function startRound() {
  if (round >= 10) {
    isPlaying = false;
    const avgTime = totalTime / 5;
    scoreText.textContent = `🎉 Game Over! Avg. reaction time: ${avgTime.toFixed(
      2
    )} ms`;
    updateLeaderboard(avgTime);
    restartBtn.style.display = 'inline-block';
    return;
  }

  setTimeout(() => {
    showBox();
  }, getDelay());
}

function startCountdown(callback) {
  let timeLeft = 3;
  countdownText.textContent = `Starting in ${timeLeft}...`;
  const interval = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) {
      countdownText.textContent = `Starting in ${timeLeft}...`;
    } else {
      clearInterval(interval);
      countdownText.textContent = '';
      startSound.play();
      callback();
    }
  }, 1000);
}

function resetGame() {
  round = 0;
  totalTime = 0;
  isPlaying = true;
  scoreText.textContent = `Get Ready...`;
  restartBtn.style.display = 'none';
  startCountdown(() => {
    scoreText.textContent = `Round: 0`;
    startRound();
  });
}

box.addEventListener('click', () => {
  if (!isPlaying) return;

  const reactionTime = Date.now() - appearTime;
  clickSound.play();
  totalTime += reactionTime;
  round++;
  hideBox();
  scoreText.textContent = `Round: ${round} | Reaction time: ${reactionTime} ms`;
  startRound();
});

document
  .getElementById('gameArea')
  .addEventListener('click', function startGameOnce() {
    if (isPlaying) return;

    resetGame();

    // Disable repeated starts mid-game
    this.removeEventListener('click', startGameOnce);
  });

restartBtn.addEventListener('click', resetGame);

function updateLeaderboard(avgTime) {
  let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  leaderboard.push(avgTime);
  leaderboard.sort((a, b) => a - b);
  leaderboard = leaderboard.slice(0, 5);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
  displayLeaderboard();
}

function displayLeaderboard() {
  const list = document.getElementById('leaderboardList');
  list.innerHTML = '';
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  leaderboard.forEach((time, index) => {
    const li = document.createElement('li');
    li.textContent = `#${index + 1}: ${time.toFixed(2)} ms`;
    list.appendChild(li);
  });
}

window.onload = () => {
  displayLeaderboard();
};
