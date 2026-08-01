// --- Web Audio API Synthesizer ---
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playTone(frequency, type, duration) {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type; // "sine", "square", "sawtooth", "triangle"
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  paddleHit() {
    this.playTone(180, "triangle", 0.08);
  }

  wallHit() {
    this.playTone(320, "sine", 0.05);
  }

  brickHit() {
    this.playTone(580, "square", 0.08);
  }

  winSound() {
    this.playTone(440, "sine", 0.1);
    setTimeout(() => this.playTone(554, "sine", 0.1), 100);
    setTimeout(() => this.playTone(659, "sine", 0.2), 200);
  }

  gameOverSound() {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(60, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }
}

// --- Game Objects ---
class Ball {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.radius = 6;
    this.reset();
  }

  reset() {
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height - 30;
    this.dx = 3;
    this.dy = -3;
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
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.height = 10;
    this.width = 75;
    this.x = (canvas.width - this.width) / 2;
    this.speed = 6;
    this.isMovingRight = false;
    this.isMovingLeft = false;
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
  constructor(canvas, x, y, width, height, color) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.isDestroyed = false;
  }

  draw() {
    if (this.isDestroyed) return;
    this.ctx.beginPath();
    this.ctx.rect(this.x, this.y, this.width, this.height);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    this.ctx.closePath();
  }
}

// --- Main Engine ---
class Game {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");

    this.ball = new Ball(this.canvas);
    this.paddle = new Paddle(this.canvas);
    this.sounds = new SoundFX();
    this.bricks = [];
    this.score = 0;

    this.initBricks();
    this.bindEvents();
  }

  initBricks() {
    const rows = 4;
    const cols = 6;
    const width = 65;
    const height = 15;
    const padding = 8;
    const offsetTop = 30;
    const offsetLeft = 23;
    const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];

    this.bricks = [];
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = c * (width + padding) + offsetLeft;
        const y = r * (height + padding) + offsetTop;
        const color = colors[r % colors.length];
        this.bricks.push(new Brick(this.canvas, x, y, width, height, color));
      }
    }
  }

  bindEvents() {
    // Keyboard Controls
    document.addEventListener("keydown", (e) => {
      if (e.key === "Right" || e.key === "ArrowRight") this.paddle.isMovingRight = true;
      if (e.key === "Left" || e.key === "ArrowLeft") this.paddle.isMovingLeft = true;
    });

    document.addEventListener("keyup", (e) => {
      if (e.key === "Right" || e.key === "ArrowRight") this.paddle.isMovingRight = false;
      if (e.key === "Left" || e.key === "ArrowLeft") this.paddle.isMovingLeft = false;
    });

    // Mouse Movement
    document.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      if (relativeX > 0 && relativeX < this.canvas.width) {
        this.paddle.moveTo(relativeX);
      }
    });

    // Mobile Touch Dragging
    const handleTouch = (e) => {
      if (e.target === this.canvas) e.preventDefault();
      if (e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const touchX = (e.touches[0].clientX - rect.left) * scaleX;
        this.paddle.moveTo(touchX);
      }
    };

    this.canvas.addEventListener("touchstart", handleTouch, { passive: false });
    this.canvas.addEventListener("touchmove", handleTouch, { passive: false });
  }

  handleCollisions() {
    const ball = this.ball;
    const paddle = this.paddle;

    // Wall Bounce (Left / Right)
    if (ball.x + ball.dx > this.canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
      ball.dx = -ball.dx;
      this.sounds.wallHit();
    }

    // Ceiling Bounce
    if (ball.y + ball.dy < ball.radius) {
      ball.dy = -ball.dy;
      this.sounds.wallHit();
    } else if (ball.y + ball.dy > this.canvas.height - ball.radius) {
      // Paddle Bounce Check
      if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        ball.dy = -ball.dy;
        this.sounds.paddleHit();
      } else {
        this.sounds.gameOverSound();
        setTimeout(() => {
          alert("GAME OVER");
          document.location.reload();
        }, 100);
        return false;
      }
    }

    // Brick Collisions
    for (const brick of this.bricks) {
      if (!brick.isDestroyed) {
        if (
          ball.x > brick.x &&
          ball.x < brick.x + brick.width &&
          ball.y > brick.y &&
          ball.y < brick.y + brick.height
        ) {
          ball.dy = -ball.dy;
          brick.isDestroyed = true;
          this.score++;
          this.sounds.brickHit();

          if (this.score === this.bricks.length) {
            this.sounds.winSound();
            setTimeout(() => {
              alert("YOU WIN! CONGRATS!");
              document.location.reload();
            }, 100);
            return false;
          }
        }
      }
    }

    return true;
  }

  drawScore() {
    this.ctx.font = "14px monospace";
    this.ctx.fillStyle = "#38bdf8";
    this.ctx.fillText(`Score: ${this.score}`, 12, 22);
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const brick of this.bricks) {
      brick.draw();
    }
    this.ball.draw();
    this.paddle.draw();
    this.drawScore();
  }

  start() {
    const loop = () => {
      this.paddle.update();
      this.ball.update();

      const gameRunning = this.handleCollisions();
      if (!gameRunning) return;

      this.render();
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

// Instantiate & Run Game
const game = new Game("gameCanvas");
game.start();

