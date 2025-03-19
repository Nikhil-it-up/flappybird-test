// Game Variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const GRAVITY = 0.6;
const FLAP = -10;
const SPAWN_RATE = 150; // Frames for pipe spawn rate
const BASE_SPEED = 2; // Default speed
let birdVelocity = 0;
let birdFlap = false;
let pipes = [];
let frame = 0;
let score = 0;
let gameOver = false;
let pipeSpeed = BASE_SPEED; // Dynamic speed

function adjustForMobile() {
  if (window.innerWidth < 768) {  // Mobile screens
      GRAVITY = 0.8;
      FLAP = -9;
      pipeSpeed = 1;
  } else {  // Desktop screens
      GRAVITY = 0.6;
      FLAP = -10;
      pipeSpeed = BASE_SPEED;
  }
}

// Preload images
const birdImage = new Image();
birdImage.src = 'bird.png';
const pipeTopImage = new Image();
pipeTopImage.src = 'pipe-top.png';
const pipeBottomImage = new Image();
pipeBottomImage.src = 'pipe-bottom.png';
const backgroundImage = new Image();
backgroundImage.src = 'background.png';

// Adjust speed for mobile devices
function adjustSpeed() {
    pipeSpeed = window.innerWidth < 768 ? 1.2 : BASE_SPEED;
}

// Resize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    adjustSpeed();
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
    this.scored = false;

    this.draw = function() {
        ctx.drawImage(pipeTopImage, this.x, 0, this.width, this.top);
        ctx.drawImage(pipeBottomImage, this.x, canvas.height - this.bottom, this.width, this.bottom);
    };

    this.update = function() {
        this.x -=2;
        if (this.x + this.width < 0) {
            pipes.splice(pipes.indexOf(this), 1);
        }
        this.draw();
    };

    this.collidesWith = function(bird) {
        return (
            bird.x + bird.width > this.x &&
            bird.x < this.x + this.width &&
            (bird.y < this.top || bird.y + bird.height > canvas.height - this.bottom)
        );
    };
}

// Game Loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    if (gameOver) {
        ctx.font = '35px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText('Game Over!', canvas.width / 4, canvas.height / 2);
        ctx.fillText('Score: ' + score, canvas.width / 3, canvas.height / 2 + 40);
        document.getElementById('restartBtn').style.display = 'inline-block';
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
            document.getElementById('restartBtn').style.display = 'inline-block';
        }
    });
    frame++;

    pipes.forEach(pipe => {
        if (pipe.x + pipe.width < bird.x && !pipe.scored) {
            score++;
            pipe.scored = true;
        }
    });

    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, 10, 30);

    if (!gameOver) requestAnimationFrame(gameLoop);
}

// Start or Restart the Game
function startGame() {
    bird.y = canvas.height / 2;
    birdVelocity = 0;
    birdFlap = false;
    pipes = [];
    frame = 0;
    score = 0;
    gameOver = false;
    adjustSpeed();

    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('restartBtn').style.display = 'none';

    gameLoop();
}

// Restart Game
function restartGame() {
    startGame();
}

// Event Listeners
window.addEventListener('keydown', (e) => {
    if (e.key === 'w') birdFlap = true;
});

window.addEventListener('touchstart', (e) => {
    e.preventDefault();
    birdFlap = true;
});

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', restartGame);
window.addEventListener('resize', resizeCanvas);

// Initialize
resizeCanvas();
