// --- Localization Translations ---
const TRANSLATIONS = {
  en: {
    title: "BIT SMASH",
    highScore: "HIGH SCORE",
    start: "START",
    upgrades: "UPGRADES",
    settings: "SETTINGS",
    coins: "COINS",
    back: "BACK",
    sfx: "Sound Effects",
    bgm: "Background Music",
    lang: "Language",
    win: "YOU WIN!",
    lose: "GAME OVER",
    score: "SCORE",
    playAgain: "PLAY AGAIN",
    tryAgain: "TRY AGAIN",
    mainMenu: "MAIN MENU",
    upg1: "Paddle Size",
    upg2: "Ball Speed",
    upg3: "Extra Life",
    upg4: "Multi-Ball Drop",
    upg5: "Coin Multiplier"
  },
  tr: {
    title: "BIT SMASH",
    highScore: "YÜKSEK SKOR",
    start: "BAŞLA",
    upgrades: "GÜÇLENMELER",
    settings: "AYARLAR",
    coins: "JETON",
    back: "GERİ",
    sfx: "Ses Efektleri",
    bgm: "Arka Plan Müziği",
    lang: "Dil",
    win: "KAZANDIN!",
    lose: "OYNAMA BİTTİ",
    score: "SKOR",
    playAgain: "TEKRAR OYNA",
    tryAgain: "TEKRAR DENE",
    mainMenu: "ANA MENÜ",
    upg1: "Palet Boyutu",
    upg2: "Top Hızı",
    upg3: "Ekstra Can",
    upg4: "Çoklu Top",
    upg5: "Jeton Çarpanı"
  }
};

// --- Web Audio & BGM Synthesizer ---
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.bgmEnabled = true;
    this.bgmTimer = null;
    this.noteIndex = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playTone(freq, type, duration, vol = 0.1) {
    if (!this.sfxEnabled) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  paddleHit() { this.playTone(180, "triangle", 0.08); }
  wallHit() { this.playTone(320, "sine", 0.05); }
  brickHit() { this.playTone(580, "square", 0.08); }
  powerupHit() { this.playTone(880, "sine", 0.15, 0.12); }

  winSound() {
    this.playTone(440, "sine", 0.1);
    setTimeout(() => this.playTone(554, "sine", 0.1), 100);
    setTimeout(() => this.playTone(659, "sine", 0.2), 200);
  }

  gameOverSound() {
    if (!this.sfxEnabled) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(60, this.ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  startBGM() {
    if (this.bgmTimer) return;
    const notes = [130.81, 146.83, 164.81, 174.61, 196.00, 220.00];
    this.bgmTimer = setInterval(() => {
      if (this.bgmEnabled) {
        this.init();
        const freq = notes[this.noteIndex % notes.length];
        this.noteIndex++;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = "square"; // Retro sound
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime); // Increased volume
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
      }
    }, 300);
  }

  stopBGM() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

// --- Particle FX System ---
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.life = 1.0;
    this.decay = Math.random() * 0.05 + 0.02;
    this.size = Math.random() * 3 + 2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(this.life, 0);
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.restore();
  }
}

// --- Dynamic Entities ---
class Ball {
  constructor(canvas, speedMultiplier = 1) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.radius = 5;
    this.reset(speedMultiplier);
  }

  reset(speedMultiplier = 1) {
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height - 30;
    const baseSpeed = 2.8 * speedMultiplier;
    this.dx = (Math.random() > 0.5 ? 1 : -1) * baseSpeed;
    this.dy = -baseSpeed;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = "#38bdf8";
    this.ctx.fill();
    this.ctx.closePath();
  }
}

class Paddle {
  constructor(canvas, sizeMultiplier = 1) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.height = 10;
    this.baseWidth = 75;
    this.width = this.baseWidth * sizeMultiplier;
    this.x = (canvas.width - this.width) / 2;
    this.speed = 6;
    this.isMovingRight = false;
    this.isMovingLeft = false;
  }

  updateWidth(sizeMultiplier) {
    this.width = this.baseWidth * sizeMultiplier;
    this.clamp();
  }

  moveTo(xPosition) {
    this.x = xPosition - this.width / 2;
    this.clamp();
  }

  clamp() {
    if (this.x < 0) this.x = 0;
    if (this.x > this.canvas.width - this.width) {
      this.x = this.canvas.width - this.width;
    }
  }

  update() {
    if (this.isMovingRight) this.x += this.speed;
    if (this.isMovingLeft) this.x -= this.speed;
    this.clamp();
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.rect(this.x, this.canvas.height - this.height, this.width, this.height);
    this.ctx.fillStyle = "#f43f5e";
    this.ctx.fill();
    this.ctx.closePath();
  }
}

class Brick {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.isDestroyed = false;
  }

  draw(ctx) {
    if (this.isDestroyed) return;
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}

class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // "multiball", "expand", "life"
    this.width = 16;
    this.height = 10;
    this.dy = 1.5;
    this.isCollected = false;
  }

  update() { this.y += this.dy; }

  draw(ctx) {
    if (this.isCollected) return;
    ctx.fillStyle = this.type === "multiball" ? "#eab308" : this.type === "expand" ? "#22c55e" : "#ef4444";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

// --- Main Engine ---
class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");

    this.audio = new AudioEngine();
    this.lang = localStorage.getItem("bs_lang") || "en";
    
    // Save State
    this.highScore = parseInt(localStorage.getItem("bs_highscore") || "0");
    this.coins = parseInt(localStorage.getItem("bs_coins") || "0");
    this.upgrades = JSON.parse(localStorage.getItem("bs_upgrades") || JSON.stringify({
      upg1: 1, upg2: 1, upg3: 1, upg4: 1, upg5: 1
    }));

    this.score = 0;
    this.lives = 3;
    this.balls = [];
    this.paddle = new Paddle(this.canvas, 1 + (this.upgrades.upg1 - 1) * 0.15);
    this.bricks = [];
    this.particles = [];
    this.powerups = [];
    this.isRunning = false;

    this.initUI();
    this.bindEvents();
    this.applyLanguage();
  }

  initUI() {
    document.getElementById("btnStart").onclick = () => this.startGame();
    document.getElementById("btnUpgrades").onclick = () => this.showScreen("upgradesMenu");
    document.getElementById("btnSettings").onclick = () => this.showScreen("settingsMenu");
    document.getElementById("btnUpgradesBack").onclick = () => this.showScreen("mainMenu");
    document.getElementById("btnSettingsBack").onclick = () => this.showScreen("mainMenu");

    document.getElementById("btnWinRestart").onclick = () => this.startGame();
    document.getElementById("btnWinMenu").onclick = () => this.showScreen("mainMenu");
    document.getElementById("btnLoseRestart").onclick = () => this.startGame();
    document.getElementById("btnLoseMenu").onclick = () => this.showScreen("mainMenu");

    // Audio Toggles
    document.getElementById("btnToggleSfx").onclick = (e) => {
      this.audio.sfxEnabled = !this.audio.sfxEnabled;
      e.target.innerText = this.audio.sfxEnabled ? "ON" : "OFF";
    };
    document.getElementById("btnToggleBgm").onclick = (e) => {
      this.audio.bgmEnabled = !this.audio.bgmEnabled;
      e.target.innerText = this.audio.bgmEnabled ? "ON" : "OFF";
      if (!this.audio.bgmEnabled) this.audio.stopBGM();
      else if (this.isRunning) this.audio.startBGM();
    };

    // Language Toggle
    document.getElementById("btnLang").onclick = () => {
      this.lang = this.lang === "en" ? "tr" : "en";
      localStorage.setItem("bs_lang", this.lang);
      this.applyLanguage();
    };

    // Upgrade buttons setup
    for (let i = 1; i <= 5; i++) {
      document.getElementById(`btnUpg${i}`).onclick = () => this.buyUpgrade(i);
    }

    this.updateUIValues();
  }

  applyLanguage() {
    const t = TRANSLATIONS[this.lang];
    document.getElementById("titleText").innerText = t.title;
    document.getElementById("menuHeading").innerText = t.title;
    document.getElementById("lblHighScore").innerText = t.highScore;
    document.getElementById("btnStart").innerText = t.start;
    document.getElementById("btnUpgrades").innerText = t.upgrades;
    document.getElementById("btnSettings").innerText = t.settings;
    document.getElementById("upgradesHeading").innerText = t.upgrades;
    document.getElementById("lblCoins").innerText = t.coins;
    document.getElementById("btnUpgradesBack").innerText = t.back;
    document.getElementById("settingsHeading").innerText = t.settings;
    document.getElementById("lblSfx").innerText = t.sfx;
    document.getElementById("lblBgm").innerText = t.bgm;
    document.getElementById("lblLang").innerText = t.lang;
    document.getElementById("btnLang").innerText = this.lang.toUpperCase();
    document.getElementById("btnSettingsBack").innerText = t.back;
    document.getElementById("winHeading").innerText = t.win;
    document.getElementById("lblFinalScoreWin").innerText = t.score;
    document.getElementById("btnWinRestart").innerText = t.playAgain;
    document.getElementById("btnWinMenu").innerText = t.mainMenu;
    document.getElementById("loseHeading").innerText = t.lose;
    document.getElementById("lblFinalScoreLose").innerText = t.score;
    document.getElementById("btnLoseRestart").innerText = t.tryAgain;
    document.getElementById("btnLoseMenu").innerText = t.mainMenu;

    for (let i = 1; i <= 5; i++) {
      document.getElementById(`upg${i}Name`).innerText = t[`upg${i}`];
    }
  }

  updateUIValues() {
    document.getElementById("valHighScore").innerText = this.highScore;
    document.getElementById("valCoins").innerText = this.coins;

    const costs = [10, 15, 25, 30, 20];
    for (let i = 1; i <= 5; i++) {
      const lvl = this.upgrades[`upg${i}`];
      const cost = lvl * costs[i - 1];
      document.getElementById(`btnUpg${i}`).innerText = `LVL ${lvl} (${cost}C)`;
    }
  }

  buyUpgrade(id) {
    const costs = [10, 15, 25, 30, 20];
    const lvl = this.upgrades[`upg${id}`];
    const cost = lvl * costs[id - 1];

    if (this.coins >= cost) {
      this.coins -= cost;
      this.upgrades[`upg${id}`]++;
      localStorage.setItem("bs_coins", this.coins);
      localStorage.setItem("bs_upgrades", JSON.stringify(this.upgrades));
      this.updateUIValues();
    }
  }

  showScreen(id) {
    document.querySelectorAll(".menu-screen").forEach(s => s.classList.remove("active"));
    if (id) document.getElementById(id).classList.add("active");
  }

  initBricks() {
    const rows = 4, cols = 6, width = 65, height = 15, padding = 8, offsetTop = 30, offsetLeft = 23;
    const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
    this.bricks = [];
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        this.bricks.push(new Brick(c * (width + padding) + offsetLeft, r * (height + padding) + offsetTop, width, height, colors[r % colors.length]));
      }
    }
  }

  bindEvents() {
    // Keyboard Controls
    document.addEventListener("keydown", (e) => {
      this.audio.init();
      if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        this.paddle.isMovingRight = true;
      }
      if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        this.paddle.isMovingLeft = true;
      }
    });

    document.addEventListener("keyup", (e) => {
      if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        this.paddle.isMovingRight = false;
      }
      if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        this.paddle.isMovingLeft = false;
      }
    });

    // Mouse Movement on Document
    document.addEventListener("mousemove", (e) => {
      if (!this.isRunning) return;
      const rect = this.canvas.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      this.paddle.moveTo(relativeX);
    });

    // Direct Touch Movement (Attached to canvas to prevent swipe-hijacking)
    const handleTouchMove = (e) => {
      if (!this.isRunning) return;
      e.preventDefault(); 
      if (e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        const scale = this.canvas.width / rect.width;
        const relativeX = (e.touches[0].clientX - rect.left) * scale;
        this.paddle.moveTo(relativeX);
      }
    };

    const handleTouchStart = (e) => {
      if (!this.isRunning) return;
      e.preventDefault(); 
      this.audio.init();
      handleTouchMove(e);
    };

    // Bound directly to canvas, passive set to false
    this.canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    this.canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
  }

  startGame() {
    this.score = 0;
    this.lives = 3 + (this.upgrades.upg3 - 1);
    this.paddle.updateWidth(1 + (this.upgrades.upg1 - 1) * 0.15);
    
    this.balls = [new Ball(this.canvas, 1 + (this.upgrades.upg2 - 1) * 0.08)];
    this.particles = [];
    this.powerups = [];
    
    this.initBricks();
    this.showScreen(null);
    this.isRunning = true;
    if (this.audio.bgmEnabled) this.audio.startBGM();
    
    requestAnimationFrame(() => this.gameLoop());
  }

  spawnExplosion(x, y, color) {
    for (let i = 0; i < 12; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  handleCollisions() {
    // PowerUp Updates
    for (let p of this.powerups) {
      p.update();
      if (!p.isCollected && p.y + p.height >= this.canvas.height - this.paddle.height &&
          p.x + p.width >= this.paddle.x && p.x <= this.paddle.x + this.paddle.width) {
        p.isCollected = true;
        this.audio.powerupHit();
        if (p.type === "multiball") this.balls.push(new Ball(this.canvas, 1));
        if (p.type === "life") this.lives++;
        if (p.type === "expand") this.paddle.width += 15;
      }
    }

    // Ball Loop
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];
      ball.update();

      if (ball.x + ball.dx > this.canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
        this.audio.wallHit();
      }

      if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
        this.audio.wallHit();
      } else if (ball.y + ball.dy > this.canvas.height - ball.radius) {
        if (ball.x > this.paddle.x && ball.x < this.paddle.x + this.paddle.width) {
          ball.dy = -ball.dy;
          this.audio.paddleHit();
        } else {
          this.balls.splice(i, 1);
          if (this.balls.length === 0) {
            this.lives--;
            if (this.lives > 0) {
              this.balls.push(new Ball(this.canvas, 1 + (this.upgrades.upg2 - 1) * 0.08));
            } else {
              this.endGame(false);
              return;
            }
          }
        }
      }

      // Bricks
      for (const brick of this.bricks) {
        if (!brick.isDestroyed) {
          if (ball.x > brick.x && ball.x < brick.x + brick.width && ball.y > brick.y && ball.y < brick.y + brick.height) {
            ball.dy = -ball.dy;
            brick.isDestroyed = true;
            this.score += 10;
            
            const earnedCoins = Math.ceil(1 * (1 + (this.upgrades.upg5 - 1) * 0.5));
            this.coins += earnedCoins;

            this.audio.brickHit();
            this.spawnExplosion(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color);

            // Drop PowerUp Chance
            if (Math.random() < 0.25) {
              const types = ["multiball", "expand", "life"];
              this.powerups.push(new PowerUp(brick.x + brick.width / 2, brick.y, types[Math.floor(Math.random() * types.length)]));
            }

            if (this.bricks.every(b => b.isDestroyed)) {
              this.endGame(true);
              return;
            }
          }
        }
      }
    }
  }

  endGame(isWin) {
    this.isRunning = false;
    this.audio.stopBGM();

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("bs_highscore", this.highScore);
    }
    localStorage.setItem("bs_coins", this.coins);
    this.updateUIValues();

    if (isWin) {
      this.audio.winSound();
      document.getElementById("valFinalScoreWin").innerText = this.score;
      this.showScreen("winMenu");
    } else {
      this.audio.gameOverSound();
      document.getElementById("valFinalScoreLose").innerText = this.score;
      this.showScreen("loseMenu");
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const brick of this.bricks) brick.draw(this.ctx);
    for (const ball of this.balls) ball.draw();
    for (const powerup of this.powerups) powerup.draw(this.ctx);
    this.paddle.draw();

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      this.particles[i].draw(this.ctx);
      if (this.particles[i].life <= 0) this.particles.splice(i, 1);
    }

    // HUD
    this.ctx.font = "12px monospace";
    this.ctx.fillStyle = "#38bdf8";
    this.ctx.fillText(`SCORE: ${this.score}`, 10, 18);
    this.ctx.fillText(`LIVES: ${this.lives}`, 200, 18);
    this.ctx.fillText(`COINS: ${this.coins}`, 380, 18);
  }

  gameLoop() {
    if (!this.isRunning) return;
    this.paddle.update();
    this.handleCollisions();
    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Instantiate Game
const game = new Game();
