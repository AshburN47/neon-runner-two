const player = document.getElementById("player");
const objects = document.getElementById("objects");

const scoreText = document.getElementById("score");
const coinsText = document.getElementById("coins");
const hearts = document.querySelectorAll(".hearts i");

const startScreen = document.getElementById("startScreen");
const gameOver = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const jumpBtn = document.getElementById("jumpBtn");
const dashBtn = document.getElementById("dashBtn");

let running = false;
let score = 0;
let coins = 0;
let health = 3;

let speed = 6;
let spawnTimer = 0;
let gameTime = 0;

let jumping = false;
let dashing = false;

let gameObjects = [];

/* START */

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

function startGame() {

    score = 0;
    coins = 0;
    health = 3;
    speed = 6;
    spawnTimer = 0;
    gameTime = 0;

    scoreText.textContent = "000000";
    coinsText.textContent = "0";

    gameObjects.forEach(obj => obj.element.remove());
    gameObjects = [];

    updateHealth();

    startScreen.classList.add("hidden");
    gameOver.classList.add("hidden");

    running = true;

    requestAnimationFrame(gameLoop);
}

/* JUMP */

function jump() {

    if (!running || jumping) return;

    jumping = true;
    player.classList.add("jumping");

    setTimeout(() => {
        player.classList.remove("jumping");
        jumping = false;
    }, 650);
}

/* DASH */

function dash() {

    if (!running || dashing) return;

    dashing = true;
    player.classList.add("dashing");

    setTimeout(() => {
        player.classList.remove("dashing");
        dashing = false;
    }, 350);
}

/* BUTTONS */

jumpBtn.addEventListener("pointerdown", jump);
dashBtn.addEventListener("pointerdown", dash);

/* KEYBOARD */

document.addEventListener("keydown", e => {

    if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
    }

    if (e.code === "ArrowRight" || e.code === "KeyD") {
        dash();
    }
});

/* SPAWN OBJECT */

function spawnObject() {

    const type = Math.random();

    let element;
    let objectType;

    if (type < .55) {

        element = document.createElement("div");
        element.className = "object coin";
        objectType = "coin";

    } else if (type < .78) {

        element = document.createElement("div");
        element.className = "object enemy";
        objectType = "enemy";

    } else {

        element = document.createElement("div");
        element.className = "object obstacle";
        objectType = "obstacle";
    }

    const world = document.querySelector(".game-world");

    const groundHeight = world.clientHeight;

    element.style.left = "100%";

    if (objectType === "coin") {

        const heights = [30, 80, 130];
        const height =
            heights[Math.floor(Math.random() * heights.length)];

        element.style.bottom = `${height}px`;

    } else {

        element.style.bottom = "22%";
    }

    objects.appendChild(element);

    gameObjects.push({
        element: element,
        type: objectType,
        x: window.innerWidth + 50
    });
}

/* COLLISION */

function collision(a, b) {

    const r1 = a.getBoundingClientRect();
    const r2 = b.getBoundingClientRect();

    return (
        r1.left < r2.right &&
        r1.right > r2.left &&
        r1.top < r2.bottom &&
        r1.bottom > r2.top
    );
}

/* DAMAGE */

function takeDamage() {

    if (dashing) return;

    health--;

    updateHealth();

    if (health <= 0) {
        endGame();
    }
}

/* HEALTH */

function updateHealth() {

    hearts.forEach((heart, index) => {

        if (index < health) {
            heart.classList.remove("empty");
        } else {
            heart.classList.add("empty");
        }

    });
}

/* GAME LOOP */

function gameLoop() {

    if (!running) return;

    gameTime++;

    /* SCORE */

    if (gameTime % 5 === 0) {

        score++;

        scoreText.textContent =
            String(score).padStart(6, "0");
    }

    /* SPEED */

    speed = 6 + Math.floor(score / 100) * .5;

    /* SPAWN */

    spawnTimer--;

    if (spawnTimer <= 0) {

        spawnObject();

        spawnTimer =
            Math.max(35, 85 - Math.floor(score / 30));
    }

    /* MOVE OBJECTS */

    gameObjects.forEach((obj, index) => {

        obj.x -= speed;

        obj.element.style.left = `${obj.x}px`;

        /* COLLISION */

        if (collision(player, obj.element)) {

            if (obj.type === "coin") {

                coins++;

                coinsText.textContent = coins;

                score += 10;

                obj.element.remove();

                gameObjects.splice(index, 1);

            } else {

                takeDamage();

                obj.element.remove();

                gameObjects.splice(index, 1);
            }
        }

        /* REMOVE */

        if (obj.x < -100) {

            obj.element.remove();
            gameObjects.splice(index, 1);
        }

    });

    requestAnimationFrame(gameLoop);
}

/* GAME OVER */

function endGame() {

    running = false;

    finalScore.textContent = score;

    gameOver.classList.remove("hidden");
}