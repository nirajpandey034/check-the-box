// script.js
const gameArea = document.getElementById('gameArea');
const scoreText = document.getElementById('score');
const countdownText = document.getElementById('countdown');
const clickSound = document.getElementById('clickSound');
const startSound = document.getElementById('startSound');
const restartBtn = document.getElementById('restartBtn');
const levelInfo = document.getElementById('levelInfo');

let round = 0;
let totalTime = 0;
let appearTime = 0;
let isPlaying = false;
let currentLevelIndex = 0;
let currentTargets = [];
let roundTargets = [];

const allShapes = ['square', 'circle', 'star'];
const allColors = ['red', 'yellow', 'purple', 'blue', 'green'];

const levels = [
  { name: 'Level 1', difficulty: 1000, targetCount: 1, distractorCount: 1 },
  { name: 'Level 2', difficulty: 800, targetCount: 2, distractorCount: 2 },
  { name: 'Level 3', difficulty: 700, targetCount: 2, distractorCount: 3 },
  { name: 'Level 4', difficulty: 600, targetCount: 2, distractorCount: 4 },
  { name: 'Level 5', difficulty: 500, targetCount: 3, distractorCount: 4 },
];

function getRandomItems(arr, count) {
  const copy = [...arr];
  const result = [];
  while (result.length < count && copy.length > 0) {
    const index = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(index, 1)[0]);
  }
  return result;
}

function generateRoundTargets(level) {
  const combinations = [];
  for (let shape of allShapes) {
    for (let color of allColors) {
      combinations.push(`${color}-${shape}`);
    }
  }
  const targets = getRandomItems(combinations, level.targetCount);
  const distractors = getRandomItems(
    combinations.filter((item) => !targets.includes(item)),
    level.distractorCount
  );
  return { targets, distractors };
}

function createShape(type) {
  const [color, shape] = type.split('-');
  const el = document.createElement('div');
  el.classList.add('shape', shape, color);
  el.dataset.type = type;
  const x = Math.random() * (gameArea.clientWidth - 50);
  const y = Math.random() * (gameArea.clientHeight - 50);
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  return el;
}

function startCountdown(callback) {
  let timeLeft = 2; // reduced from 3 to 2 seconds
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

function showShapes() {
  gameArea.innerHTML = '';
  const level = levels[currentLevelIndex];
  const { targets, distractors } = generateRoundTargets(level);
  roundTargets = targets;

  const all = [...targets, ...distractors];
  for (let type of all) {
    const el = createShape(type);
    gameArea.appendChild(el);
  }

  levelInfo.textContent = `🎯 ${level.name} — Click only: ${roundTargets.join(
    ', '
  )}`;
  appearTime = Date.now();
}

function handleClick(e) {
  if (!isPlaying) return;
  const el = e.target;
  if (!el.classList.contains('shape')) return;

  const type = el.dataset.type;

  if (roundTargets.includes(type)) {
    const reactionTime = Date.now() - appearTime;
    clickSound.play();
    totalTime += reactionTime;
    round++;
    scoreText.textContent = `✅ Round ${round} | ${reactionTime} ms`;
    nextRound();
  } else {
    scoreText.textContent = `❌ Wrong shape! Game Over`;
    isPlaying = false;
    restartBtn.style.display = 'inline-block';
  }
}

function nextRound() {
  if (round >= 5) {
    currentLevelIndex++;
    round = 0;
    if (currentLevelIndex >= levels.length) {
      endGame();
      return;
    }
  }
  setTimeout(showShapes, 300); // reduced wait between rounds
}

function setupLevel() {
  scoreText.textContent = `Round 1`;
  showShapes();
}

function startGame() {
  if (isPlaying) return;
  isPlaying = true;
  round = 0;
  totalTime = 0;
  currentLevelIndex = 0;
  restartBtn.style.display = 'none';
  scoreText.textContent = 'Get Ready...';
  gameArea.innerHTML = '';
  startCountdown(() => setupLevel());
}

function endGame() {
  isPlaying = false;
  const avg = totalTime / (levels.length * 5);
  scoreText.textContent = `🎉 Game Over! Avg Time: ${avg.toFixed(2)} ms`;
  updateLeaderboard(avg);
  restartBtn.style.display = 'inline-block';
}

function updateLeaderboard(score) {
  try {
    let scores = JSON.parse(localStorage.getItem('leaderboard')) || [];
    if (typeof score !== 'number' || isNaN(score)) return;
    scores.push(score);
    scores.sort((a, b) => a - b);
    scores = scores.slice(0, 5);
    localStorage.setItem('leaderboard', JSON.stringify(scores));
    renderLeaderboard();
  } catch (e) {
    console.error('Leaderboard update failed', e);
  }
}

function renderLeaderboard() {
  const list = document.getElementById('leaderboardList');
  list.innerHTML = '';
  const scores = JSON.parse(localStorage.getItem('leaderboard')) || [];
  scores.forEach((s, i) => {
    const li = document.createElement('li');
    li.textContent = `#${i + 1}: ${s.toFixed(2)} ms`;
    list.appendChild(li);
  });
}

restartBtn.addEventListener('click', startGame);
gameArea.addEventListener('click', handleClick);
window.onload = renderLeaderboard;

gameArea.addEventListener('click', function initStart(e) {
  if (isPlaying || e.target.classList.contains('shape')) return;
  gameArea.removeEventListener('click', initStart);
  startGame();
});
