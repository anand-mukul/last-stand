const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth * 0.7;
canvas.height = window.innerHeight;

const background = new Image();
background.src = "https://i.ibb.co/Smr7vwZ/bg.png";

let gamePaused = false;
let score = 0;
let gameOver = false;
let lastZombieSpawn = 0;
const zombieSpawnInterval = 2000;

const player = {
   x: canvas.width / 2,
   y: canvas.height - 150,
   width: 80,
   height: 80,
   speed: 5,
   jumpPower: 20,
   health: 100,
   isJumping: false,
   velocityY: 0,
   gravity: 1,
   canShoot: true,
   shootingCooldown: 500,
   facingRight: true,
};

const zombies = [];
const bullets = [];
const redBlocks = [
   { x: canvas.width / 4, y: canvas.height - 200, width: 100, height: 200, health: 300 },
   { x: (canvas.width / 4) * 3, y: canvas.height - 200, width: 100, height: 200, health: 300 },
];

const zombieProperties = {
   width: 80,
   height: 80,
   speedRange: [2, 5],
};

const playerImgRight = new Image();
playerImgRight.src = "https://i.ibb.co/m6v76rW/playerR.png";
const playerImgLeft = new Image();
playerImgLeft.src = "https://i.ibb.co/f0b1VpQ/playerL.png";
const zombieImg = new Image();
zombieImg.src = "https://i.ibb.co/SwzPhd1/zombie.png"; 
const bulletImg = new Image();
bulletImg.src = "https://i.ibb.co/hW1phQf/bullet.png"; 

const redBlockImg = new Image();
redBlockImg.src = "https://i.ibb.co/XstgJPx/image.png";

const shootSound = new Audio("/assets/shoot.mp3"); 
const hitSound = new Audio("/assets/hit.mp3");

function drawBackground() {
   ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
   if (player.facingRight) {
      ctx.drawImage(playerImgRight, player.x, player.y, player.width, player.height);
   } else {
      ctx.drawImage(playerImgLeft, player.x, player.y, player.width, player.height);
   }
}

function updatePlayer() {
   if (leftPressed && player.x > 0) {
      player.x -= player.speed;
      player.facingRight = false;
   }
   if (rightPressed && player.x < canvas.width - player.width) {
      player.x += player.speed;
      player.facingRight = true;
   }
   if (upPressed && !player.isJumping) {
      player.velocityY = -player.jumpPower;
      player.isJumping = true;
   }
   player.velocityY += player.gravity;
   player.y += player.velocityY;
   if (player.y + player.height > canvas.height) {
      player.y = canvas.height - player.height;
      player.isJumping = false;
   }
}

function spawnZombie() {
   const side = Math.random() < 0.5 ? "left" : "right";
   const x = side === "left" ? 0 : canvas.width - zombieProperties.width;
   const speed =
      side === "left"
         ? zombieProperties.speedRange[0] + Math.random() * (zombieProperties.speedRange[1] - zombieProperties.speedRange[0])
         : -(zombieProperties.speedRange[0] + Math.random() * (zombieProperties.speedRange[1] - zombieProperties.speedRange[0]));
   zombies.push({
      x: x,
      y: canvas.height - zombieProperties.height,
      width: zombieProperties.width,
      height: zombieProperties.height,
      speed: speed,
      health: 100,
   });
}

function drawZombies() {
   zombies.forEach((zombie) => {
      ctx.drawImage(zombieImg, zombie.x, zombie.y, zombie.width, zombie.height);
   });
}

function updateZombies() {
   zombies.forEach((zombie) => {
      zombie.x += zombie.speed;

      if (zombie.x < 0 - zombie.width || zombie.x > canvas.width + zombie.width) {
         zombies.splice(zombies.indexOf(zombie), 1);
      }
   });
}

function drawBullets() {
   bullets.forEach((bullet) => {
      ctx.drawImage(bulletImg, bullet.x, bullet.y, bullet.radius * 2, bullet.radius * 2);
   });
}

function updateBullets() {
   bullets.forEach((bullet, index) => {
      bullet.x += bullet.velocityX;

      if (bullet.x < 0 || bullet.x > canvas.width) {
         bullets.splice(index, 1);
      }
   });
}

function shootBullet() {
   if (player.canShoot) {
      const velocityX = player.facingRight ? 15 : -15;
      bullets.push({
         x: player.x + player.width / 2,
         y: player.y + player.height / 2,
         radius: 5,
         velocityX: velocityX,
      });
      shootSound.play();
      player.canShoot = false;
      setTimeout(() => (player.canShoot = true), player.shootingCooldown);
   }
}

function drawRedBlocks() {
   redBlocks.forEach((block) => {
      ctx.drawImage(redBlockImg, block.x, block.y, block.width, block.height);

      ctx.fillStyle = "green";
      ctx.fillRect(block.x, block.y - 20, block.width * (block.health / 300), 10);
   });
}

function updateRedBlocks() {
   redBlocks.forEach((block) => {
      zombies.forEach((zombie) => {
         if (zombie.x + zombie.width > block.x && zombie.x < block.x + block.width && zombie.y + zombie.height > block.y) {
            block.health -= 1;
            if (block.health <= 0) {
               block.health = 0;
               
            }
         }
      });
   });
}

function detectCollisions() {
   bullets.forEach((bullet, bulletIndex) => {
      zombies.forEach((zombie, zombieIndex) => {
         if (bullet.x < zombie.x + zombie.width && bullet.x + bullet.radius * 2 > zombie.x && bullet.y < zombie.y + zombie.height && bullet.y + bullet.radius * 2 > zombie.y) {
            hitSound.play();
            zombies.splice(zombieIndex, 1);
            bullets.splice(bulletIndex, 1);
            score += 10;
         }
      });
   });

   zombies.forEach((zombie, zombieIndex) => {
      if (zombie.x < player.x + player.width && zombie.x + zombie.width > player.x && zombie.y < player.y + player.height && zombie.y + zombie.height > player.y) {
         player.health -= 10;
         zombies.splice(zombieIndex, 1);
         if (player.health <= 0) {
            gameOver = true;
         }
      }
   });
}

function checkGameOver() {
   if (player.health <= 0) {
      gameOver = true;
   }
}
function displayScore() {
   document.getElementById("playerScore").innerText = score;
}

function displayHealth() {
   document.getElementById("playerHealth").innerText = player.health;
}

function displayGameOver() {
   ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
   ctx.fillRect(0, 0, canvas.width, canvas.height);
   ctx.fillStyle = "white";
   ctx.font = "40px Arial";
   ctx.textAlign = "center";
   ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
   ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 50);
}

function restartGame() {
   player.health = 100;
   player.x = canvas.width / 2;
   player.y = canvas.height - 150;
   zombies.length = 0;
   bullets.length = 0;
   redBlocks[0].health = 300;
   redBlocks[1].health = 300;
   score = 0;
   gameOver = false;
   gamePaused = false;
   gameLoop(0);
}

function togglePause() {
   gamePaused = !gamePaused;
   if (!gamePaused) {
      gameLoop(0);
   }
}

function exitGame() {
   alert("Game has ended. Thanks for playing!");
   window.location.reload();
}

let leftPressed = false;
let rightPressed = false;
let upPressed = false;

document.addEventListener("keydown", (e) => {
   if (e.code === "ArrowLeft") leftPressed = true;
   if (e.code === "ArrowRight") rightPressed = true;
   if (e.code === "ArrowUp") upPressed = true;
   if (e.code === "Space") shootBullet();
   if (e.code === "KeyP") togglePause();
   if (e.code === "KeyR" && gameOver) restartGame();
});

document.addEventListener("keyup", (e) => {
   if (e.code === "ArrowLeft") leftPressed = false;
   if (e.code === "ArrowRight") rightPressed = false;
   if (e.code === "ArrowUp") upPressed = false;
});

document.getElementById("pauseButton").addEventListener("click", togglePause);
document.getElementById("exitButton").addEventListener("click", exitGame);
document.getElementById("restartButton").addEventListener("click", restartGame);

function gameLoop(timestamp) {
   if (!gamePaused && !gameOver) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground();
      drawPlayer();
      drawZombies();
      drawBullets();
      drawRedBlocks();
      updatePlayer();
      updateZombies();
      updateBullets();
      updateRedBlocks();
      detectCollisions();
      checkGameOver();
      displayScore();
      displayHealth();

      if (timestamp - lastZombieSpawn > zombieSpawnInterval) {
         spawnZombie();
         lastZombieSpawn = timestamp;
      }
      requestAnimationFrame(gameLoop);
   } else if (gameOver) {
      displayGameOver();
   }
}

background.onload = () => {
   drawBackground();
   gameLoop(0);
};
