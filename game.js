// Select Canvas & Buttons
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Game Variables
let birdVelocity = 0;
let birdFlap = false;
let pipes = [];
let frame = 0;
let score = 0;
let gameOver = false;
let pipeSpeed = 2;

// Load Images
const birdImage = new Image();
birdImage.src = 'bird.png';
const pipeTopImage = new Image();
pipeTopImage.src = 'pipe-top.png';
const pipeBottomImage = new Image();
pipeBottomImage.src = 'pipe-bottom.png';
const backgroundImage = new Image();
backgroundImage.src = 'background.png';

// Load Sounds (Ensure Files Exist)
const flapSound = new Audio('flap.mp3');
const hitSound = new Audio('hit.wav');
const pointSound = new Audio('point.mp3');

// Adjustments for Mobile Devices
function getGravity() { return window.innerWidth < 768 ? 0.2 : 0.6; }
function getFlap() { return window.innerWidth < 768 ? -5 : -10; }
function getPipeSpeed() { return window.innerWidth < 768 ? 2 : 4; }

// Resize Canvas
function resizeCanvas() {
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.9;
}
resizeCanvas();

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
            flapSound.play();
            if (navigator.vibrate) navigator.vibrate(50);
        }
        birdVelocity += getGravity();
        this.y += birdVelocity;

        if (this.y + this.height >= canvas.height) {
            this.y = canvas.height - this.height;
            gameOver = true;
            hitSound.play();
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            restartBtn.style.display = 'inline-block';
        }
        this.draw();
    }
};

// Pipe Object
function Pipe() {
    this.x = canvas.width;
    this.width = 90;
    this.height = Math.random() * (canvas.height / 3) + 50;
    this.gap = window.innerWidth < 768 ? 250 : 200;
    this.bottomY = this.height + this.gap;
    this.scored = false;

    this.draw = function() {
        ctx.drawImage(pipeTopImage, this.x, 0, this.width, this.height);
        ctx.drawImage(pipeBottomImage, this.x, this.bottomY, this.width, canvas.height - this.bottomY);
    };

    this.update = function() {
        this.x -= pipeSpeed;
        if (this.x + this.width < 0) pipes.shift();
        this.draw();
    };

    this.collidesWith = function(bird) {
        return (
            bird.x + bird.width > this.x &&
            bird.x < this.x + this.width &&
            (bird.y < this.height || bird.y + bird.height > this.bottomY)
        );
    };
}

// Game Loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    if (gameOver) {
        ctx.font = '30px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText('Game Over!', canvas.width / 4, canvas.height / 2);
        ctx.fillText('Score: ' + score, canvas.width / 3, canvas.height / 2 + 40);
        return;
    }

    bird.update();

    if (frame % 100 === 0) pipes.push(new Pipe());

    pipes.forEach(pipe => {
        pipe.update();
        if (pipe.collidesWith(bird)) {
            gameOver = true;
            hitSound.play();
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            restartBtn.style.display = 'inline-block';
        }
    });

    pipes.forEach(pipe => {
        if (pipe.x + pipe.width < bird.x && !pipe.scored) {
            score++;
            pipe.scored = true;
            pointSound.play();
        }
    });

    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, 10, 30);

    frame++;
    if (!gameOver) requestAnimationFrame(gameLoop);
}

// Start Game
function startGame() {
    resizeCanvas();
    bird.y = canvas.height / 2;
    birdVelocity = 0;
    birdFlap = false;
    pipes = [];
    frame = 1;
    score = 0;
    gameOver = false;
    pipeSpeed = getPipeSpeed();

    startBtn.style.display = 'none';
    restartBtn.style.display = 'none';

    requestAnimationFrame(gameLoop);
}

// Event Listeners
window.addEventListener('keydown', (e) => {
    if (e.key === 'w' || e.key === 'ArrowUp') birdFlap = true;
});
window.addEventListener('touchstart', () => { birdFlap = true; });

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
window.addEventListener('resize', resizeCanvas);
