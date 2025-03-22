// Game Variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const SPAWN_RATE = 150; 
const BASE_SPEED = 2; 

let birdVelocity = 0;
let birdFlap = false;
let pipes = [];
let frame = 0;
let score = 0;
let gameOver = false;
let pipeSpeed = BASE_SPEED; 

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
function getGravity() {
    return window.innerWidth < 768 ? 0.3 : 0.6;  // Slower fall on mobile
}

function getFlap() {
    return window.innerWidth < 768 ? -5 : -10;  // Weaker jump on mobile
}
function getSpawnRate() {
    return window.innerWidth < 768 ? 140 : 100; // ✅ Slower pipe spawn on mobile
}

function getPipeSpeed() {
    return window.innerWidth < 768 ? 3: 4;  // Slower pipes on mobile
}



// Resize canvas
// Resize canvas dynamically for mobile & desktop
function resizeCanvas() {
    canvas.width = window.innerWidth * 0.9;  // ✅ Adjusted to fit screen without overflow
    canvas.height = window.innerHeight * 0.9;
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
            birdVelocity = getFlap();
            birdFlap = false;
        }
        birdVelocity += getGravity();
        this.y += birdVelocity;
    
        // If bird touches the ground, set game over and show restart button
        if (this.y + this.height >= canvas.height) {
            this.y = canvas.height - this.height;
            gameOver = true;
            document.getElementById('restartBtn').style.display = 'inline-block'; // ✅ Fix
        }
    
        this.draw();
    }    
};

// Pipe Object
function Pipe() {
    this.x = canvas.width;
    this.width = 90;
    this.height = Math.floor(Math.random() * (canvas.height / 4)) + 50;
    this.gap = window.innerWidth < 768 ? 250 : 200;  // ✅ Increase gap on mobile
    this.top = this.height;
    this.bottom = canvas.height - this.height - this.gap;
    this.scored = false;

    // ✅ Bind methods inside constructor
    this.draw = function() {
        ctx.drawImage(pipeTopImage, this.x, 0, this.width, this.top);
        ctx.drawImage(pipeBottomImage, this.x, canvas.height - this.bottom, this.width, this.bottom);
    };

    this.update = function() {
        this.x -= pipeSpeed;  
        if (this.x + this.width < 0) {
            pipes.splice(pipes.indexOf(this), 1);  // ✅ Correctly removes pipe
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

    if (frame % getSpawnRate() === 0) {
        pipes.push(new Pipe());
    }    

    pipes.forEach(pipe => {
        pipe.update();
        if (pipe.collidesWith(bird)) {
            gameOver = true;
            document.getElementById('restartBtn').style.display = 'inline-block';
        }
    });

    pipes.forEach(pipe => {
        if (pipe.x + pipe.width < bird.x && !pipe.scored) {
            score++;
            pipe.scored = true;
        }
    });

    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, 10, 30);

    frame++;

    if (!gameOver) requestAnimationFrame(gameLoop);
}


// Start or Restart the Game
function startGame() {
    resizeCanvas(); 
    bird.y = canvas.height / 2; 
    birdVelocity = 0;
    birdFlap = false;
    pipes = [];
    frame = 1;
    score = 0;
    gameOver = false;
    pipeSpeed = getPipeSpeed();  // ✅ Set pipe speed based on screen size

    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('restartBtn').style.display = 'none';

    requestAnimationFrame(gameLoop);
}

// Event Listeners
window.addEventListener('keydown', (e) => {
    if (e.key === 'w') birdFlap = true;
});

window.addEventListener('touchstart', (e) => {
    e.preventDefault();
    birdFlap = true;
});

window.addEventListener('resize', () => {
    resizeCanvas();
    startGame();  // ✅ Restart game on resize to adjust elements
});


document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);
window.addEventListener('resize', resizeCanvas);

resizeCanvas();
