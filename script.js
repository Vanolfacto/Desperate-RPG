const canvas=document.getElementById("gameCanvas");
const ctx=canvas.getContext('2d');

const tileSize=64;
const mapSize=8;
const player={
    x:0,
    y:0,
    health:100,
    maxHealth:100,
    inventory: [],
    hasWeapon: false,
    isDead: false
};

let gameWon=false;

const rules=[
  "Avoid red tiles.",
  "Get a weapon before battle.",
  "Make sure your health bar isn't empty."
];

let gameOver = false;
let chosenRules=[];
let inBattle = false;
let enemyHealth = 3;
let currentEnemy = null;

const images = {
      player: new Image(),
      npc: new Image(),
      enemy: new Image(),
      item: new Image(),
    };

let imagesLoaded=0;
const totalImages=Object.keys(images).length;

const onImageLoad=()=>{
    imagesLoaded++;
    if(imagesLoaded === totalImages){
        pickRules();
        drawMap();
    }
};

for (let key in images){
    images[key].onload=onImageLoad;
}

images.player.src = 'assets/player.png';
images.npc.src = 'assets/npc.png';
images.enemy.src = 'assets/enemy.png';
images.item.src = 'assets/item.png';

const map = [
      ['G','G','G','R','G','G','G','G'],
      ['G','I','G','G','G','R','G','G'],
      ['G','G','E','G','G','G','G','G'],
      ['G','G','G','G','G','G','G','G'],
      ['G','G','G','G','N','G','G','G'],
      ['G','G','G','G','G','G','G','G'],
      ['G','G','G','G','G','G','G','G'],
      ['G','G','G','G','G','G','G','G']
    ];

const pickRules=()=>{
    const shuffled=rules.sort(()=>0.5-Math.random());
    chosenRules=shuffled.slice(0,3);
    document.getElementById('rule-list').innerHTML=chosenRules.map(r=>`<li>${r}</li>`).join("");
}

const drawMap=()=>{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let showBubble = false;

    for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
          const tile = map[y][x];
          ctx.fillStyle = tile === 'R' ? 'red' : tile === 'I' ? 'yellow' : tile === 'E' ? 'black' : tile === 'N' ? 'blue' : 'green';
          ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        
          if (tile === 'I') ctx.drawImage(images.item, x * tileSize, y * tileSize, tileSize, tileSize);
          if (tile === 'N') ctx.drawImage(images.npc, x * tileSize, y * tileSize, tileSize, tileSize);
          if (tile === 'E') ctx.drawImage(images.enemy, x * tileSize, y * tileSize, tileSize, tileSize);
        }
      }
      if (!player.isDead)
        ctx.drawImage(images.player, player.x * tileSize, player.y * tileSize, tileSize, tileSize);
}

const showMessage=(msg)=>{
    const msgBox = document.getElementById('message');
      msgBox.textContent = msg;
      msgBox.style.color = 'red';
      setTimeout(() => msgBox.textContent = '', 3000);
}

const handleTile=(tile)=>{
    if (tile === 'R' && chosenRules.includes("Avoid red tiles.")) {
        showMessage("You stepped on a red tile! Rule broken.");
      }
      if (tile === 'I') {
         if (player.inventory.length >= 1 && chosenRules.includes("Carry only one item.")) {
            showMessage("You can't carry more than one item!");
        } 
        else {
            player.inventory.push('item');
            player.hasWeapon = true;
            map[player.y][player.x] = 'G';
            showMessage("You picked up a weapon!");
        }
      }
      if (tile === 'N') {
        showMessage("NPC says: 'I wouldn't break the rules if I were you, stranger'");    
      }
      if (tile === 'E') {
        if (!player.hasWeapon && chosenRules.includes("Get a weapon before battle.")) {
            showMessage("You forgot your weapon before battle and got defeated!");
            endGame(false);
        } 
        else {
            inBattle = true;
            enemyHealth = 3;
            showMessage("Enemy encountered! Press 'a' to attack.");
        }
      }
}

const movePlayer=(dx, dy)=>{
    if (gameOver) return;

    const newX = player.x + dx;
    const newY = player.y + dy;

    const target = map[newY]?.[newX];

    if (!["G", "R"].includes(target)) {
        showMessage("You can't move there!");
        return;
    }

    // Standard movement
    player.x = newX;
    player.y = newY;
    drawMap();

    if (target === 'R') {
        player.health = 0;
        updateHealthBar();
        endGame(false, "You stepped on a red tile and died!");
    }
}

const interact = () => {
    if (gameOver) return;

    const directionMap = {
        "ArrowUp": [0, -1],
        "ArrowDown": [0, 1],
        "ArrowLeft": [-1, 0],
        "ArrowRight": [1, 0]
    };

    const [dx, dy] = directionMap[player.facing] || [0, 0];
    const targetX = player.x + dx;
    const targetY = player.y + dy;

    const tile = map[targetY]?.[targetX];

    switch (tile) {
        case "I":
            player.inventory.push('item');
            player.hasWeapon = true;
            map[targetY][targetX] = "G";
            showMessage("You picked up a weapon!");
            drawMap();
            break;
        case "N":
            showMessage("NPC says: 'I wouldn't break the rules if I were you, stranger...'");
            break;
        case "E":
            if (!player.hasWeapon && chosenRules.includes("Get a weapon before battle.")) {         
                endGame(false, "You forgot your weapon before battle and got defeated!"); 
            } else {
                inBattle = true;
                currentEnemy = { x: targetX, y: targetY }; // ⬅️ Track enemy position
                enemyHealth = 3;
                showMessage("Enemy encountered! Press 'a' to attack.");
            }
            break;
        default:
            showMessage("There's nothing to interact with.");
    }
}

const attackEnemy = () => {
    if (!inBattle) return;

    if (!player.hasWeapon) {
        player.health = 0;  // Set health to zero
        updateHealthBar();  // Update UI
        endGame(false, "You attacked bare-handed and were defeated!");     // End the game and remove the hero
        return;
    } else {
        enemyHealth--;
        player.health -= 25;
        updateHealthBar();

        if (player.health <= 0) {
            player.isDead = true;
            gameOver = true;
            inBattle = false;
            drawMap();
            showMessage("Your health dropped to zero. You died!");
            showRestartButton();
            return;
        }

        if (enemyHealth <= 0) {
            showMessage("You defeated the enemy! You win! 🎉");

            if (currentEnemy) {
                map[currentEnemy.y][currentEnemy.x] = "G"; // Clear map
                drawMap(); // Redraw before ending game
            }

            endGame(true);
        } 
        else {
            showMessage(`You hit the enemy! (${3 - enemyHealth}/3)`);
        }
    }
}

document.addEventListener("keydown", (e)=>{
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.key)) e.preventDefault();
    
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        player.facing = e.key;
    }

    if (inBattle && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        showMessage("You're in battle! Press 'A' to attack.");
        return;
    }
    
    if(e.key==="ArrowUp") movePlayer(0,-1);
    else if (e.key === 'ArrowDown') movePlayer(0, 1);
    else if (e.key === 'ArrowLeft') movePlayer(-1, 0);
    else if (e.key === 'ArrowRight') movePlayer(1, 0);
    else if (e.key === ' ') interact();
    else if (e.key === 'a') attackEnemy();
});

const endGame=(won, message=null)=>{
    gameOver = true;
    inBattle = false;

    player.isDead=!won;

    if (!won) {
        player.health = 0;  // Set health to 0 only if player lost
        updateHealthBar();
    }
    

    showMessage(message ?? (won ? "You win!" : "You died..."));
    drawMap();
    showRestartButton();
}

const removeEnemy = (enemy) => {
  // Remove enemy from enemies array
  enemies = enemies.filter(e => e !== enemy);

  // Clear the map tile
  map[enemy.y][enemy.x] = ".";

  drawMap(); // Redraw without enemy
};

const showRestartButton=()=>{
    const btn = document.getElementById('restart-btn');
    btn.style.display = 'block';
};

document.getElementById('restart-btn').addEventListener('click', () => {
  location.reload();
});

const updateHealthBar=()=>{
  const healthBar = document.getElementById("health-bar");
  const healthText = document.getElementById("health-bar-text");

  const healthPercent = Math.max(0, (player.health / player.maxHealth) * 100);
  healthBar.style.width = `${healthPercent}%`;
  healthText.textContent = `Health: ${player.health}`;

  if (player.health <= 0) {
    showMessage("Your health is gone! Game over.");
  }
}

const enemyCounterAttack=()=>{
  player.health -= 25;
  showMessage("Enemy counterattacked! You lost 25 health.");
  updateHealthBar();
}

updateHealthBar();
pickRules();
drawMap();

