"use strict";

window.addEventListener("load", start);

/* model */

const player = {
  x: 25,
  y: 160,
  regX: 14,
  regY: 18,
  hitbox: {
    x: 9,
    y: 20,
    w: 14,
    h: 15,
  },
  speed: 100,
  move: false,
  direction: undefined,
};
const controls = {
  left: false,
  right: false,
  up: false,
  down: false,
};

const enemies = [
   {type: "blob", row: 3, col: 8}, 
   {type: "blob", row: 3, col: 11},
   {type: "blob", row: 7, col: 11}
];

const items = [
  { type: "gold", row: 2, col: 9, pickedUp: false },
  { type: "pot", row: 2, col: 10, pickedUp: false },
  { type: "gems", row: 8, col: 12, pickedUp: false },
];

const tiles = [
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 4, 0, 3, 3, 3, 3, 3, 3],
  [3, 3, 3, 3, 3, 3, 0, 4, 0, 0, 4, 0, 0, 3, 3, 3, 3, 3, 3],
  [3, 3, 3, 3, 3, 3, 0, 0, 4, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3],
  [6, 6, 6, 6, 6, 6, 1, 1, 1, 1, 1, 1, 1, 6, 6, 6, 6, 6, 6],
  [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3],
  [3, 3, 3, 3, 3, 3, 0, 4, 0, 0, 0, 4, 0, 3, 3, 3, 3, 3, 3],
  [3, 3, 3, 3, 3, 3, 0, 0, 0, 4, 0, 0, 0, 3, 3, 3, 3, 3, 3],
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
];

const GRID_WIDTH = tiles[0].length;
const GRID_HEIGHT = tiles.length;
const TILE_SIZE = 32;

function getTileAtCoord({ row, col }) {
  return tiles[row][col];
}

function coordFromPos({ x, y }) {
  const row = Math.floor(y / TILE_SIZE);
  const col = Math.floor(x / TILE_SIZE);
  const coord = { row, col };
  return coord;
}

function posFromCoord({ row, col }) {}

function keyDown(event) {
  switch (event.key) {
    case "ArrowLeft":
      controls.left = true;
      break;
    case "ArrowRight":
      controls.right = true;
      break;
    case "ArrowUp":
      controls.up = true;
      break;
    case "ArrowDown":
      controls.down = true;
      break;
  }
  /* console.log(controls); */
}

function keyUp(event) {
  switch (event.key) {
    case "ArrowLeft":
      controls.left = false;
      break;
    case "ArrowRight":
      controls.right = false;
      break;
    case "ArrowUp":
      controls.up = false;
      break;
    case "ArrowDown":
      controls.down = false;
      break;
  }
}

function getTilesUnderPlayer( player, newPos={x: player.x, y: player.y } ) {
  const tileCoords = [];
  
  const topLeft = {x: newPos.x - player.regX + player.hitbox.x, 
    y: newPos.y - player.regY + player.hitbox.y}

const topRight = {x: newPos.x - player.regX + player.hitbox.x + player.hitbox.w, 
     y: newPos.y - player.regY + player.hitbox.y}

const bottomLeft = {x: newPos.x - player.regX + player.hitbox.x, 
       y: newPos.y - player.regY + player.hitbox.y + player.hitbox.h};

const bottomRight = {x: newPos.x - player.regX + player.hitbox.x + player.hitbox.w, 
        y: newPos.y - player.regY + player.hitbox.y + player.hitbox.h};

  const topleftCoords = coordFromPos( topLeft );
  const toprightCoords = coordFromPos(topRight)
  const bottomleftCoords = coordFromPos(bottomLeft)
  const bottomRightCoords = coordFromPos(bottomRight)

  tileCoords.push(topleftCoords)
  tileCoords.push(toprightCoords)
  tileCoords.push(bottomRightCoords)
  tileCoords.push(bottomleftCoords)
  
  return tileCoords
}
function canMovePlayerToPos(player, pos){
  const coords = getTilesUnderPlayer( player, pos );
  return coords.every(canMoveTo);
  
}

function canMoveTo( { row, col } ) {

  if (row < 0 || row >= GRID_HEIGHT || col < 0 || col >= GRID_WIDTH) {
    return false;
  }
  /* if (pos.x < -5 || pos.y < -10 || pos.x > 484 || pos.y > 474) {
    player.moving = false; */

  const tileType = getTileAtCoord({ row, col });
  switch (tileType) {
    case 0:
    case 1:
    case 2:
    case 6:
    case 4:
      return true;
      break;
    case 3:
    case 4:
    case 5:
      return false;
      break;
  }
  return true;
}

function movePlayer(deltaTime) {
  player.moving = false;

  const newPos = {
    x: player.x,
    y: player.y,
  };

  if (controls.left) {
    player.moving = true;
    player.direction = "left";
    newPos.x -= player.speed * deltaTime;
  } else if (controls.right) {
    player.moving = true;
    player.direction = "right";
    newPos.x += player.speed * deltaTime;
  }

  if (controls.up) {
    player.moving = true;
    player.direction = "up";
    newPos.y -= player.speed * deltaTime;
  } else if (controls.down) {
    player.moving = true;
    player.direction = "down";
    newPos.y += player.speed * deltaTime;
  }
  if (canMovePlayerToPos(player, newPos)) {
    player.x = newPos.x;
    player.y = newPos.y;
  } else {
  }
}

function pickupItems(player) {
  // Convert player's current position to grid coordinates
  const playerPos = coordFromPos({ x: player.x, y: player.y });

  items.forEach((item) => {
    if (playerPos.row === item.row && playerPos.col === item.col && !item.pickedUp) {
      console.log("Virker");
      item.pickedUp = true; // Mark the item as picked up
      displayItems();
    }
  });
}

/* view */

document.addEventListener("keydown", function (event) {
  if (event.key === "e" || event.key === "E") {
    // Check if 'e' or 'E' was pressed
    pickupItems(player); // Call your pickup function
  }
});

function displayItems() {
  const itemsContainer = document.querySelector("#items");
  itemsContainer.innerHTML = "";
  itemsContainer.style.setProperty("--GRID_WIDTH", GRID_WIDTH);
  itemsContainer.style.setProperty("--GRID_HEIGHT", GRID_HEIGHT);
  itemsContainer.style.setProperty("--TILE_SIZE", TILE_SIZE + "px");

  items.forEach((item) => {
    if (!item.pickedUp) {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("item", item.type); // Use item.type as a class for CSS styling
      itemDiv.style.gridRowStart = item.row + 1;
      itemDiv.style.gridColumnStart = item.col + 1;
      itemsContainer.appendChild(itemDiv);
    }
  });
}


function displayEnemies() {
  const enemyContainer = document.querySelector("#characters");
  enemyContainer.style.setProperty("--GRID_WIDTH", GRID_WIDTH);
  enemyContainer.style.setProperty("--GRID_HEIGHT", GRID_HEIGHT);
  enemyContainer.style.setProperty("--TILE_SIZE", TILE_SIZE + "px");

  enemies.forEach((enemy )=> {
      const enemyDiv = document.createElement("div");
      enemyDiv.classList.add("enemy", enemy.type); // Use item.type as a class for CSS styling
      enemyDiv.style.gridRowStart = enemy.row + 1;
      enemyDiv.style.gridColumnStart = enemy.col + 1;
      enemyContainer.appendChild(enemyDiv);
    }
  );
}

function createTiles() {
  const background = document.querySelector("#background");
  // scan igennem alle rows og cols
  // for hver af dem lav en div.item  og tilføj til background
  for (let row = 0; row < GRID_HEIGHT; row++) {
    for (let col = 0; col < GRID_WIDTH; col++) {
      let tile = document.createElement("div");
      tile.classList.add("tile");
      background.append(tile);
    }
  }
  background.style.setProperty("--GRID_WIDTH", GRID_WIDTH);
  background.style.setProperty("--GRID_HEIGHT", GRID_HEIGHT);
  background.style.setProperty("--TILE_SIZE", TILE_SIZE + "px");
}

function dislayTiles() {
  const visualTiles = document.querySelectorAll("#background .tile");

  for (let row = 0; row < GRID_HEIGHT; row++) {
    for (let col = 0; col < GRID_WIDTH; col++) {
      const modelTile = getTileAtCoord({ row, col });
      const visualTile = visualTiles[row * GRID_WIDTH + col];

      visualTile.classList.add(getClassForTiletype(modelTile));
    }
  }
}

function getClassForTiletype(tiletype) {
  switch (tiletype) {
    case 0:
      return "grass";
      break;
    case 1:
      return "path";
      break;
    case 2:
      return "wall";
      break;
    case 3:
      return "water";
      break;
    case 4:
      return "flowers";
      break;
    case 5:
      return "cliff";
      break;
    case 6:
      return "floor";
      break;
  }
}

function displayPlayerAtPosition() {
  const visualPlayer = document.querySelector("#player");
  visualPlayer.style.translate = `${player.x - player.regX}px ${player.y - player.regY}px`;
}
function displayPlayerAnimation() {
  const visualPlayer = document.querySelector("#player");

  if (player.direction && !visualPlayer.classList.contains(player.direction)) {
    visualPlayer.classList.remove("up", "down", "left", "right");
    visualPlayer.classList.add(player.direction);
  }
  if (!player.moving) {
    visualPlayer.classList.remove("animate");
  } else if (!visualPlayer.classList.contains("animate")) {
    visualPlayer.classList.add("animate");
  }
}

// debugging
function showDebugging() {
  showDebugTilesUnderPlayer();
  showDebuglayerRect();
  showDebugPlayerRegistrationPoint();
  showDebugPlayerHitBox();
}

let lastPlayerCoord = { row: 0, col: 0 };

let highlightedTiles = []

function showDebugTilesUnderPlayer() {
 
  highlightedTiles.forEach(unhighlightTile)
  

  const tileCoords = getTilesUnderPlayer(player);
  tileCoords.forEach(highlightTile);

  highlightedTiles = tileCoords;
}

function showDebuglayerRect() {
  const visualPlayer = document.querySelector("#player");
  if (!visualPlayer.classList.contains("show-rect")) {
    visualPlayer.classList.add("show-rect");
  }
}

function showDebugPlayerRegistrationPoint() {
  const visualPlayer = document.querySelector("#player");
  if (!visualPlayer.classList.contains("show-reg-point")) {
    visualPlayer.classList.add("show-reg-point");
  }
  visualPlayer.style.setProperty("--regX", player.regX + "px");
  visualPlayer.style.setProperty("--regY", player.regY + "px");
}

function highlightTile({ row, col }) {
  const highlightTiles = document.querySelectorAll("#background .tile");
  const highlightTile = highlightTiles[row * GRID_WIDTH + col];

  highlightTile.classList.add("highlight");
}

function unhighlightTile({ row, col }) {
  const highlightTiles = document.querySelectorAll("#background .tile");
  const highlightTile = highlightTiles[row * GRID_WIDTH + col];

  highlightTile.classList.remove("highlight");
}
 
function showDebugPlayerHitBox(){
  const visualPlayer = document.querySelector("#player");

  visualPlayer.style.setProperty("--hitboxX", player.hitbox.x + "px")
  visualPlayer.style.setProperty("--hitboxY", player.hitbox.y + "px")
  visualPlayer.style.setProperty("--hitboxW", player.hitbox.w + "px")
  visualPlayer.style.setProperty("--hitboxH", player.hitbox.h + "px")
  if(!visualPlayer.classList.contains("show-hitbox")){
    visualPlayer.classList.add("show-hitbox")
  }

}


/* Controller */
let lastTimestamp = 0;

function tick(timestamp) {
  requestAnimationFrame(tick);

  const deltaTime = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;

  movePlayer(deltaTime);

  showDebugging();

  displayPlayerAtPosition();
  displayPlayerAnimation();
}

function start() {
  console.log("javascript is running");
  createTiles();
  dislayTiles();
  displayItems();
  displayEnemies();

  document.addEventListener("keydown", keyDown);
  document.addEventListener("keyup", keyUp);

  requestAnimationFrame(tick);
}
