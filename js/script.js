const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;

//Variables
const cellSize = 50;
const cellGap = 2;

let resource = 1000;
let interval = 700;
let frame = 0;
let score = 0;
let health = 100;

let gameOver = false;
let youWin = false;
let gameStopped = true;

let ammunition = [];
let enemies = [];
let gameGrid = [];
let defenders = [];

let enemy01 = new Image();
enemy01.src = "js/Images/skeleton-fly_00.png";

let enemy02 = new Image();
enemy02.src = "js/Images/skeleton-walking_0.png";

let laser = new Image();
laser.src = "js/Images/laser.png";

const mouse = {
  x: 10,
  y: 10,
  width: 0.1,
  height: 0.1,
};

let canvasPosition = canvas.getBoundingClientRect();
console.log(canvasPosition);

canvas.addEventListener("mousemove", function (event) {
  mouse.x = event.x - canvasPosition.left;
  mouse.y = event.y - canvasPosition.top;
});

canvas.addEventListener("mouseleave", function () {
  mouse.y = undefined;
  mouse.x = undefined;
});

const startButton = document.getElementById("startId");
startButton.addEventListener("click", function () {
  gameStopped === true ? (gameStopped = false, animate()) : gameStopped = true;
}); 

const resetButton = document.getElementById("resetId");
resetButton.addEventListener("click", function () {
  resource = 1000;
  interval = 700;
  frame = 0;
  score = 0;
  health = 100;
  gameOver = false;
  youWin = false;
  ammunition = [];
  enemies = [];
  gameGrid = [];
  defenders = [];
}); 

//Criando a celula.
class cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize;
    this.height = cellSize;
  }
  draw() {
    if (mouse.x && mouse.y && collision(this, mouse)) {
      context.strokeStyle = "black";
      context.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}
//Criand a grade de posiçẽs:

function createGrid() {
  for (let y = cellSize; y < canvas.height; y += cellSize) {
    for (let x = 0; x < canvas.width; x += cellSize) {
      gameGrid.push(new cell(x, y));
    }
  }
}
createGrid();

function handleGameGrid() {
  for (let i = 0; i < gameGrid.length; i++) {
    gameGrid[i].draw();
  }
}

class Shoot {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 3;
    this.power = 20;
    this.speed = 7;
    /* this.image = image; */
  }
  update() {
    this.x += this.speed;
  }
  draw() {

 /*    context.drawImage(this.image, this.x, this.y, this.width, this.height); */
   context.fillStyle = "#F5364C";
    context.beginPath();
    context.fillRect(this.x, this.y, this.width, this.height);
    context.fill();
  }
}

function handleAmmunition() {
  for (let i = 0; i < ammunition.length; i++) {
    ammunition[i].update();
    ammunition[i].draw();

    for (let j = 0; j < enemies.length; j++) {
      if (
        enemies[j] &&
        ammunition[i] &&
        collision(ammunition[i] , enemies[j])
      ) {
        enemies[j].health -= ammunition[i].power;
        ammunition.splice(i, 1);
        i--;
      }

      if (ammunition[i] && ammunition[i].x > canvas.width - cellSize ) {
        ammunition.splice(i, 1);
        i--;
      }
    }
  }
}

class Defender {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize - cellGap * 4;
    this.height = cellSize - cellGap * 4;
    this.shooting = false;
    this.health = 100;
    this.ammunition = [];
    this.timer = 0;
    this.image = new Image();
    this.image.src = "js/Images/skeleton-animation_00.png";
  }
  draw() {
    //context.fillStyle = "purple";
    context.drawImage(this.image, this.x, this.y, this.width, this.height);
    context.fillStyle = "red";
    context.font = "1px Press Start 2P', cursive";
    context.fillText(Math.floor(this.health), this.x - 4, this.y + 15);
  }
  update() {
    this.timer++;
    if (this.timer % 150 === 0) {
      ammunition.push(new Shoot(this.x + 13, this.y + 30));
    }
  }
}
canvas.addEventListener("click", function () {
  const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
  const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
  if (gridPositionY < cellSize) return;
  for (let i = 0; i < defenders.length; i++) {
    if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY)
      return;
  }
  let defendersCost = 100;
  if (gameStopped === false && resource >= defendersCost) {
    defenders.push(new Defender(gridPositionX, gridPositionY));
    resource -= defendersCost;
  }
});

function handleDefenders() {
  for (let i = 0; i < defenders.length; i++) {
    defenders[i].draw();
    defenders[i].update();
    for (let j = 0; j < enemies.length; j++) {
      if (defenders[i] && collision(defenders[i], enemies[j])) {
        enemies[j].movement = 0;
        defenders[i].health -= 0.1;
      }
      if (defenders[i] && defenders[i].health <= 0) {
        defenders.splice(i, 1);
        i--;
        enemies[j].movement = enemies[j].speed;
      }
    }
  }
  if(score === 50){
    youWin = true;
    gameStopped = true;
  }
}
//Enemy
class Enemy {
  constructor(VerticalPosition, speedRandom, health, image) {
    this.x = canvas.width;
    this.y = VerticalPosition;
    this.width = cellSize - cellGap * 4;
    this.height = cellSize - cellGap * 4;
    this.speed = speedRandom;
    this.movement = this.speed;
    this.health = health;
    this.maxHealth = this.health;
    this.image = image;
    this.frameX = 0;
    this.frameY = 0;
    this.minFrame = 0;
    this.maxFrame = 11;
    this.spriteWidht = 473;
    this.spriteHeight = 468;

  }
  update() {
    this.x -= this.movement;
/*     if(frame % 1 === 0){
    if(this.frameX < this.maxFrame) this.frameX ++;
    else this.frameX = this.minFrame;
  } */

  
}
  draw() {
    context.drawImage(this.image, /* this.frameX * this.spriteWidht , 0, this.spriteWidht, this.spriteHeight,  */this.x, this.y, this.width, this.height);
    //context.fillRect(this.x, this.y, this.width, this.height);
    context.fillStyle = "red";
    context.font = "1px Press Start 2P', cursive";
    context.fillText(Math.floor(this.health), this.x + 15, this.y + 15);
  }
}

function handleEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].update();
    enemies[i].draw();
    if (enemies[i].x < 0) {
      gameOver = true;
      gameStopped = true;
    }
    if (enemies[i].health <= 0) {
      let newResources = enemies[i].maxHealth / 5;
      resource += newResources;
      score += 1;
      enemies.splice(i, 1);
      i--;
    }
  }
  if (frame % interval === 0) {
    let speedX = Math.random() * 0.1 + 0.9;
    let VerticalPosition = Math.floor(Math.random() * 11 + 1) * cellSize;
    enemies.push(new Enemy(VerticalPosition, speedX, health, enemy01));
   //console.log('teste')
    if (interval > 50) {
      interval -= 40;
    }
    if (enemies.length > 8) {
      interval += 200;
    }
  }
  if (frame % 2500 === 0) {
    let speedX = Math.random() * 0.1 + 0.6;
    let VerticalPosition = Math.floor(Math.random() * 11 + 1) * cellSize;
    enemies.push(new Enemy(VerticalPosition, speedX, 300, enemy02));
    console.log('thiswillrunnow??')
  }
}
//jogabilidade

function handleGameStatus() {
  context.fillStyle = "black";
  context.font = "15px 'Press Start 2P', cursive";
  context.fillText(
    "$ " + resource + "  Score: " + score,
    20,
    30
  );
  if (gameOver) {
    context.fillStyle = "black";
    context.font = "60px 'Press Start 2P', cursive";
    context.fillText("GAME OVER", 160, 400);
  }
  if(youWin){
  context.fillStyle = "Green";
  context.font = "50px 'Press Start 2P', cursive";
  context.fillText("Congratulations!!!", 30, 190);
  }
}

//Imagem de fundo
const background = new Image();
background.src = 'js/Images/output-onlinepngtools.png';

function handleBackground(){
  context.drawImage(background, 0, cellSize, 900, 600);
}



function animate() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  handleBackground()
  handleGameGrid();
  handleDefenders();
  handleAmmunition();
  handleEnemies();
  handleGameStatus();
  frame++;
  console.log(interval);
  if (!gameStopped) {
    requestAnimationFrame(animate);
  }
}

function collision(first, second) {
  if (
    !(
      first.x > second.x + second.width ||
      first.x + first.width < second.x ||
      first.y > second.y + second.height ||
      first.y + first.height < second.y
    )
  ) {
    return true;
  }
}
