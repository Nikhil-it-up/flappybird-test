// Game Variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const GRAVITY = 0.6;
const FLAP = -10;
const SPAWN_RATE = 150; // Frames for pipe spawn rate
let birdY = canvas.height / 2;
let birdVelocity = 0;
let birdFlap = false;
let pipes = [];
let frame = 0;
let score = 0;
let gameOver = false;

// Preload images
const birdImage = new Image();
birdImage.src = 'bird.png'; // path to your bird image
const pipeTopImage = new Image();
pipeTopImage.src = 'pipe-top.png'; // Top pipe image
const pipeBottomImage = new Image();
pipeBottomImage.src = 'pipe-bottom.png'; // Bottom pipe image
const backgroundImage = new Image();
backgroundImage.src = 'background.png'; // path to your background image

// Set canvas size to fullscreen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  // Event Listener for Window Resize
  window.addEventListener('resize', () => {
    resizeCanvas(); // Resize the canvas when the window size changes
  });
  
  // Toggle Fullscreen function
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      canvas.requestFullscreen().catch(err => {
        console.error("Error attempting to enable fullscreen mode:", err);
      });
    } else {
      document.exitFullscreen();
    }
  }
  
  // Start the game and resize the canvas initially
  resizeCanvas();
  
  

// Bird Object
const bird = {
    width: 50,
    height: 50,
    x: 50,
    y: birdY,
    draw() {
      ctx.drawImage(birdImage, this.x, this.y, this.width, this.height);
    },
    update() {
      if (birdFlap && this.y > 0) {
        birdVelocity = FLAP;
        birdFlap = false;
      }
      birdVelocity += GRAVITY;
      this.y += birdVelocity;
      if (this.y + this.height > canvas.height) {
        this.y = canvas.height - this.height;
        birdVelocity = 0;
        gameOver = true;
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
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the background image (if it's larger than the canvas, it will scroll)
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  if (gameOver) {
    ctx.font = '35px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('Game Over!', canvas.width / 4, canvas.height / 2);
    ctx.fillText('Score: ' + score, canvas.width / 3, canvas.height / 2 + 40);
    return;
  }

  bird.update();
  
  if (frame % SPAWN_RATE === 0) {
    pipes.push(new Pipe());
  }
  
  pipes.forEach(pipe => {
    pipe.update();
    if (pipe.collidesWith(bird)) {
      gameOver = true;
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
  
  requestAnimationFrame(gameLoop);
}

// Event Listener for Flap
window.addEventListener('keydown', (e) => {
  if (e.key === 'w') {
    birdFlap = true;
  }
});
// Event Listener for Flap on mobile (touch)
window.addEventListener('touchstart', (e) => {
    // Prevent default to stop unwanted scrolling behavior on mobile
    e.preventDefault();
    
    // Trigger flap on touch
    birdFlap = true;
  });
  
// Start the game
gameLoop();
