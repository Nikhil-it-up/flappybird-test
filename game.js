// Game Variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const GRAVITY = 0.6;
const FLAP = -10;
const SPAWN_RATE = 150; // Frames for pipe spawn rate
let birdVelocity = 0;
let birdFlap = false;
let pipes = [];
let frame = 0;
let score = 0;
let gameOver = false;

// Preload images
const birdImage = new Image();
birdImage.src = 'bird.png';
const pipeTopImage = new Image();
pipeTopImage.src = 'pipe-top.png';
const pipeBottomImage = new Image();
pipeBottomImage.src = 'pipe-bottom.png';
const backgroundImage = new Image();
backgroundImage.src = 'background.png';

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Bird Object
const bird = {
    width: 50,
    height: 50,
    x: 50,
    y: canvas.height / 2,
    draw() {
        ctx.drawImage(birdImage, this.x, this.y, this.width, this.height);
    },
    update() {
        if (birdFlap) {
            birdVelocity = FLAP;
            birdFlap = false;
        }
        birdVelocity += GRAVITY;
        this.y += birdVelocity;

        if (this.y + this.height >= canvas.height) {
            this.y = canvas.height - this.height;
            birdVelocity = 0;
            setTimeout(() => (gameOver = true), 200); // Small delay before game over
        }

        this.draw();
    }
};

// Pipe Object
function Pipe() {
  this.x = canvas.width;
  this.width = 90;
  this.height = Math.floor(Math.random() * (canvas.height / 4)) + 50;
  this.gap = 200;
  this.top = this.height;
  this.bottom = canvas.height - this.height - this.gap;
  this.scored = false;  // To prevent double scoring
  
  this.draw = function() {
    // Draw top pipe
    ctx.drawImage(pipeTopImage, this.x, 0, this.width, this.top);
    // Draw bottom pipe
    ctx.drawImage(pipeBottomImage, this.x, canvas.height - this.bottom, this.width, this.bottom);
  };
  
  this.update = function() {
    this.x -= 2;
    if (this.x + this.width < 0) {
      pipes.splice(pipes.indexOf(this), 1);
    }
    this.draw();
  };

  this.collidesWith = function(bird) {
    if (bird.x + bird.width > this.x && bird.x < this.x + this.width) {
      if (bird.y < this.top || bird.y + bird.height > canvas.height - this.bottom) {
        return true;
      }
    }
    return false;
  };
}

// Game Loop

// Set a target FPS (frames per second)
const FPS = 60;
const interval = 1000 / FPS; // Calculate the interval between frames (in milliseconds)
let lastTime = 0; // Track the last time the game was updated

// Game Loop with FPS control
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  if (gameOver) {
      ctx.font = '35px Arial';
      ctx.fillStyle = 'black';
      ctx.fillText('Game Over!', canvas.width / 4, canvas.height / 2);
      ctx.fillText('Score: ' + score, canvas.width / 3, canvas.height / 2 + 40);

      document.getElementById('restartBtn').style.display = 'inline-block'; // ✅ Show Restart button
      return; // ✅ Stop game loop
  }

  bird.update();

  if (frame % SPAWN_RATE === 0) {
      pipes.push(new Pipe());
  }

  pipes.forEach(pipe => {
      pipe.update();

      // ✅ If collision happens, end game and show restart button
      if (pipe.collidesWith(bird)) {
          gameOver = true;
          document.getElementById('restartBtn').style.display = 'inline-block'; // ✅ Show restart button on collision
      }
  });

  frame++;

  // Score Calculation
  pipes.forEach(pipe => {
      if (pipe.x + pipe.width < bird.x && !pipe.scored) {
          score++;
          pipe.scored = true;
      }
  });

  ctx.font = '20px Arial';
  ctx.fillStyle = 'black';
  ctx.fillText('Score: ' + score, 10, 30);

  if (!gameOver) {
      requestAnimationFrame(gameLoop);
  }
}

// Start or Restart the game
function startGame() {
    bird.y = canvas.height / 2; // Reset bird position properly
    birdVelocity = 0;
    birdFlap = false;
    pipes = [];
    frame = 0;
    score = 0;
    gameOver = false;

    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('restartBtn').style.display = 'none';

    gameLoop();
}

// Restart Game

function restartGame() {
  console.log("Restarting game..."); // Debugging log
  bird.y = canvas.height / 2;
  birdVelocity = 0;
  pipes = [];
  frame = 0;
  score = 0;
  gameOver = false;

  document.getElementById('restartBtn').style.display = 'none'; // ✅ Hide restart button
  gameLoop(); // ✅ Restart the game loop
}



// Event Listeners
window.addEventListener('keydown', (e) => {
    if (e.key === 'w') {
        birdFlap = true;
    }
});

window.addEventListener('touchstart', (e) => {
    e.preventDefault();
    birdFlap = true;
});

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', restartGame);
window.addEventListener('resize', resizeCanvas);

// Initialize canvas size
resizeCanvas();
