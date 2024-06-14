"use strict";

window.addEventListener("load", start);

/* model */

const player = {
  x: 240,
  y: 230,
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
  health: 3,
  lastHitTime: 0,
};
const controls = {
  left: false,
  right: false,
  up: false,
  down: false,
};

const enemies = [{ type: "blob", row: 4, col: 8, path: [] }];

class Inventory {
  constructor() {
    this.items = new Map();
  }

  addItem({ type }, quantity = 1) {
    if (this.items.has(type)) {
      this.items.set(type, this.items.get(type) + quantity);
    } else {
      this.items.set(type, quantity);
    }
    console.log(`Added ${quantity} ${type} to inventory`);
  }

  removeItem(type, quantity = 1) {
    if (this.items.has(type)) {
      const currentQuantity = this.items.get(type);
      if (currentQuantity > quantity) {
        this.items.set(type, currentQuantity - quantity);
        console.log(`Removed ${quantity} ${type} from inventory.`);
      } else {
        this.items.delete(type);
        console.log(`Removed all ${type} from inventory.`);
      }
    } else {
      console.log(`${type} not found in inventory.`);
    }
  }
}

const inventory = new Inventory();

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

function posFromCoord({ row, col }) {
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;
  return { x, y };
}

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

function getTilesUnderPlayer(player, newPos = { x: player.x, y: player.y }) {
  const tileCoords = [];

  const topLeft = {
    x: newPos.x - player.regX + player.hitbox.x,
    y: newPos.y - player.regY + player.hitbox.y,
  };

  const topRight = {
    x: newPos.x - player.regX + player.hitbox.x + player.hitbox.w,
    y: newPos.y - player.regY + player.hitbox.y,
  };

  const bottomLeft = {
    x: newPos.x - player.regX + player.hitbox.x,
    y: newPos.y - player.regY + player.hitbox.y + player.hitbox.h,
  };

  const bottomRight = {
    x: newPos.x - player.regX + player.hitbox.x + player.hitbox.w,
    y: newPos.y - player.regY + player.hitbox.y + player.hitbox.h,
  };

  const topleftCoords = coordFromPos(topLeft);
  const toprightCoords = coordFromPos(topRight);
  const bottomleftCoords = coordFromPos(bottomLeft);
  const bottomRightCoords = coordFromPos(bottomRight);

  tileCoords.push(topleftCoords);
  tileCoords.push(toprightCoords);
  tileCoords.push(bottomRightCoords);
  tileCoords.push(bottomleftCoords);

  return tileCoords;
}

function canMovePlayerToPos(player, pos) {
  const coords = getTilesUnderPlayer(player, pos);
  return coords.every(canMoveTo);
}

function canMoveTo({ row, col }) {
  if (row < 0 || row >= GRID_HEIGHT || col < 0 || col >= GRID_WIDTH) {
    return false;
  }

  const tileType = getTileAtCoord({ row, col });
  switch (tileType) {
    case 0:
    case 1:
    case 2:
    case 6:
    case 4:
      return true;
    case 3:
    case 4:
    case 5:
      return false;
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
  }
}

let enemyMoveCooldown = 0;
const enemyMoveInterval = 0.5; // seconds

function moveEnemies(deltaTime) {
    enemyMoveCooldown -= deltaTime;

    if (enemyMoveCooldown <= 0) {
        enemyMoveCooldown = enemyMoveInterval;

        enemies.forEach(enemy => {
            if (enemy.path.length > 0) {
                const nextStep = enemy.path.shift();
                const { x, y } = posFromCoord(nextStep);
                enemy.row = nextStep.row;
                enemy.col = nextStep.col;
                enemy.x = x;
                enemy.y = y;
            } else {
                const playerPosition = coordFromPos({ x: player.x, y: player.y });
                enemy.path = findPath({ row: enemy.row, col: enemy.col }, playerPosition);
            }
        });

        displayEnemies();
    }
}

function pickupItems(player) {
  const playerPos = coordFromPos({ x: player.x, y: player.y });

  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (playerPos.row === item.row && playerPos.col === item.col && !item.pickedUp) {
      item.pickedUp = true; // Mark the item as picked up
      inventory.addItem(item); // Add item to inventory
      items.splice(i, 1); // Remove item from the items array
      displayItems(); // Update items display
      updateInventoryDisplay(); // Update inventory display
      break; // Exit loop after picking up an item
    }
  }
}

function dropItem(type) {
  console.log("Drop button clicked for item:", type);

  // Remove the item from the inventory
  inventory.removeItem(type, 1);

  // Get player's current position in grid coordinates
  const playerPos = coordFromPos({ x: player.x, y: player.y });

  // Add the dropped item to the items array
  items.push({
    type: type,
    row: playerPos.row,
    col: playerPos.col,
    pickedUp: false,
  });

  // Update the display of items and inventory
  displayItems();
  updateInventoryDisplay();
}

const HIT_COOLDOWN = 2000;

//Checks if the enemy tile and player tile are the same
function checkCollision() {
  const currentTime = Date.now();
  const playerPos = coordFromPos({ x: player.x, y: player.y });

  enemies.forEach(enemy => {
    const enemyPos = { row: enemy.row, col: enemy.col };

    if (playerPos.row === enemyPos.row && playerPos.col === enemyPos.col) {
      if (currentTime - player.lastHitTime >= HIT_COOLDOWN) {
        player.health -= 1;
        player.lastHitTime = currentTime;
        updateHealthDisplay();

        if (player.health <= 0) {
          showGameOverPopup();
        }
      }
    }
  });
}

function restartGame() {
  player.health = 3;
  player.x = 240;
  player.y = 230;

  enemies.forEach(enemy => {
    enemy.row = 4;
    enemy.col = 8;
    enemy.path = [];
  });

  document.getElementById("gameOverPopup").remove();
  displayPlayerAtPosition();
  displayEnemies();
  updateHealthDisplay();
}

// A* Pathfinding Algorithm and Helper Functions

class Node {
  constructor(position, g, h, parent = null) {
    this.position = position; // {row, col}
    this.g = g; // Cost from start to current node
    this.h = h; // Heuristic cost from current node to goal
    this.f = g + h; // Total cost
    this.parent = parent; // Reference to the parent node
  }
}

function heuristic(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function getNeighbors({ row, col }) {
  const neighbors = [];

  if (row > 0) neighbors.push({ row: row - 1, col }); // Up
  if (row < GRID_HEIGHT - 1) neighbors.push({ row: row + 1, col }); // Down
  if (col > 0) neighbors.push({ row, col: col - 1 }); // Left
  if (col < GRID_WIDTH - 1) neighbors.push({ row, col: col + 1 }); // Right

  return neighbors;
}

function findPath(start, goal) {
  const openSet = [];
  const closedSet = new Set();
  const startNode = new Node(start, 0, heuristic(start, goal));
  openSet.push(startNode);

  while (openSet.length > 0) {
    let current = openSet.reduce((lowest, node) => (node.f < lowest.f ? node : lowest));

    if (current.position.row === goal.row && current.position.col === goal.col) {
      const path = [];
      while (current) {
        path.push(current.position);
        current = current.parent;
      }
      console.log(path)
      return path.reverse();
    }

    openSet.splice(openSet.indexOf(current), 1);
    closedSet.add(`${current.position.row},${current.position.col}`);

    getNeighbors(current.position).forEach((neighbor) => {
      const neighborKey = `${neighbor.row},${neighbor.col}`;

      if (!canMoveTo(neighbor) || closedSet.has(neighborKey)) return;

      const tentativeG = current.g + 1;

      let neighborNode = openSet.find((node) => node.position.row === neighbor.row && node.position.col === neighbor.col);

      if (!neighborNode) {
        neighborNode = new Node(neighbor, tentativeG, heuristic(neighbor, goal), current);
        openSet.push(neighborNode);
      } else if (tentativeG < neighborNode.g) {
        neighborNode.g = tentativeG;
        neighborNode.f = neighborNode.g + neighborNode.h;
        neighborNode.parent = current;
      }
    });
  }
  return [];
}


/* ------------------------------------------view----------------------------------------- */

document.addEventListener("keydown", function (event) {
  if (event.key === "e" || event.key === "E") {
    // Check if 'e' or 'E' was pressed
    pickupItems(player); // Call your pickup function
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "i" || event.key === "I") {
    toggleInventoryDisplay();
  }
});

function showGameOverPopup() {
  //Hvis popup vinduet allerede er der
  if (document.getElementById("gameOverPopup")) {
    return; // Gå ud af funktionen
  }
  const popup = document.createElement("div");
  popup.id = "gameOverPopup";
  popup.innerHTML = `
    <div class="popup-content">
      <h2>Game Over</h2>
      <p>You have lost all your health. Do you want to restart?</p>
      <button id="restartButton">Restart</button>
    </div>
  `;

  document.body.appendChild(popup);

  document.getElementById("restartButton").addEventListener("click", restartGame);
}

function updateHealthDisplay() {
  const healthDisplay = document.getElementById("healthDisplay");
  healthDisplay.textContent = `Health: ${player.health}`;
}

function toggleInventoryDisplay() {
  const inventoryDisplay = document.querySelector("#inventoryDisplay");
  inventoryDisplay.style.display = inventoryDisplay.style.display === "none" ? "block" : "none";
  if (inventoryDisplay.style.display === "block") {
    updateInventoryDisplay();
  }
}

function updateInventoryDisplay() {
  const inventoryDisplay = document.querySelector("#inventoryDisplay");
  inventoryDisplay.innerHTML = ""; // Clear previous contents

  inventory.items.forEach((quantity, type) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "inventory-item";
    itemDiv.textContent = `${type}: ${quantity}`;

    const dropButton = document.createElement("button");
    dropButton.textContent = "Drop";
    dropButton.addEventListener("click", () => dropItem(type));

    itemDiv.appendChild(dropButton);
    inventoryDisplay.appendChild(itemDiv);
  });
}

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
  const enemyContainer = document.querySelector("#enemies");
  enemyContainer.innerHTML = "";
  const charactersContainer = document.querySelector("#characters");
  charactersContainer.style.setProperty("--GRID_WIDTH", GRID_WIDTH);
  charactersContainer.style.setProperty("--GRID_HEIGHT", GRID_HEIGHT);
  charactersContainer.style.setProperty("--TILE_SIZE", TILE_SIZE + "px");
  enemyContainer.style.setProperty("--GRID_WIDTH", GRID_WIDTH);
  enemyContainer.style.setProperty("--GRID_HEIGHT", GRID_HEIGHT);
  enemyContainer.style.setProperty("--TILE_SIZE", TILE_SIZE + "px");

  enemies.forEach((enemy) => {
    const enemyDiv = document.createElement("div");
    enemyDiv.classList.add("enemy", enemy.type); // Use item.type as a class for CSS styling
    enemyDiv.style.gridRowStart = enemy.row + 1;
    enemyDiv.style.gridColumnStart = enemy.col + 1;
    enemyContainer.appendChild(enemyDiv);
  });
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
    case 1:
      return "path";
    case 2:
      return "wall";
    case 3:
      return "water";
    case 4:
      return "flowers";
    case 5:
      return "cliff";
    case 6:
      return "floor";
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

let highlightedTiles = [];

function showDebugTilesUnderPlayer() {
  highlightedTiles.forEach(unhighlightTile);

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

function showDebugPlayerHitBox() {
  const visualPlayer = document.querySelector("#player");

  visualPlayer.style.setProperty("--hitboxX", player.hitbox.x + "px");
  visualPlayer.style.setProperty("--hitboxY", player.hitbox.y + "px");
  visualPlayer.style.setProperty("--hitboxW", player.hitbox.w + "px");
  visualPlayer.style.setProperty("--hitboxH", player.hitbox.h + "px");
  if (!visualPlayer.classList.contains("show-hitbox")) {
    visualPlayer.classList.add("show-hitbox");
  }
}

/* Controller */
let lastTimestamp = 0;

function tick(timestamp) {
  requestAnimationFrame(tick);

  const deltaTime = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;
   
  movePlayer(deltaTime);
  moveEnemies(deltaTime);
  checkCollision();
  

  showDebugging();

  displayPlayerAtPosition();
  displayPlayerAnimation();
}

function start() {
  console.log("javascript is running");
  createTiles();
  dislayTiles();
  displayItems();

  document.addEventListener("keydown", keyDown);
  document.addEventListener("keyup", keyUp);

  requestAnimationFrame(tick);
}


