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


let npcInteracting = false;
let enemyInteracting = false;

const rules=[
  "Avoid the lava.",
  "Prepare yourself.",
  "Defeat the great beast."
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
      lava: new Image()
    };

let imagesLoaded=0;
const totalImages=Object.keys(images).length+1;

const backgroundImage= new Image();
backgroundImage.src="assets/first-map.jpg"

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

backgroundImage.onload = onImageLoad;

images.player.src = 'assets/player.png';
images.npc.src = 'assets/npc.png';
images.enemy.src = 'assets/demon.png';
images.item.src = 'assets/item.png';
images.lava.src='assets/lava.jpg';

const map = [
      ['G','G','G','R','G','G','G','G'],
      ['G','G','G','G','G','G','G','G'],
      ['G','G','E','G','G','G','G','G'],
      ['G','G','G','G','G','G','R','G'],
      ['G','G','G','G','N','G','G','G'],
      ['G','G','G','G','G','G','G','G'],
      ['G','G','G','G','G','G','G','G'],
      ['G','G','G','G','I','G','G','G']
    ];

const pickRules=()=>{
    const shuffled=rules.sort(()=>0.5-Math.random());
    chosenRules=shuffled.slice(0,3);
    document.getElementById('rule-list').innerHTML=chosenRules.map(r=>`<li>${r}</li>`).join("");
}

const drawMap=()=>{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
          const tile = map[y][x];
            //Item
          if (tile === 'I') ctx.drawImage(images.item, x * tileSize, y * tileSize, tileSize, tileSize);
            //NPC
          if (tile === 'N'){
            ctx.save();
            const px = x * tileSize;
            const py = y * tileSize;
            if (npcInteracting && player.facing === "ArrowRight") {
                ctx.translate(px + tileSize, py);
                ctx.scale(-1, 1);
                ctx.drawImage(images.npc, 0, 0, tileSize, tileSize);
            } else {
                ctx.translate(px, py);
                ctx.drawImage(images.npc, 0, 0, tileSize, tileSize);
            }
            ctx.restore();
          } 
             //Enemy
          if (tile === 'E') {
            ctx.save();
            const px = x * tileSize;
            const py = y * tileSize;
            if (enemyInteracting && player.facing === "ArrowLeft") {
                ctx.translate(px + tileSize, py);
                ctx.scale(-1, 1);
                ctx.drawImage(images.enemy, 0, 0, tileSize, tileSize);
            } else {
                ctx.translate(px, py);
                ctx.drawImage(images.enemy, 0, 0, tileSize, tileSize);
            }
            ctx.restore();
          }
            //Lava
          if (tile === 'R') ctx.drawImage(images.lava, x * tileSize, y * tileSize, tileSize, tileSize);
        }
      }
      if (!player.isDead){
        ctx.save();
        const px = player.x * tileSize;
        const py = player.y * tileSize;

        if (player.facing === "ArrowRight") {
            // Flip horizontally
            ctx.translate(px + tileSize, py); // move to right edge of sprite
            ctx.scale(-1, 1);                 // flip horizontally
            ctx.drawImage(images.player, 0, 0, tileSize, tileSize);
        } 
        else {
            ctx.translate(px, py);
            ctx.drawImage(images.player, 0, 0, tileSize, tileSize);
        }
        ctx.restore();
      }
        
}

const showMessage=(msg)=>{
    const msgBox = document.getElementById('message');
      msgBox.textContent = msg;
      msgBox.style.color = 'red';
      setTimeout(() => msgBox.textContent = '', 5000);
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
        endGame(false, "You stepped on lava and died!");
    }
}

const interact = () => {
    if (gameOver) return;

    npcInteracting = false;
    enemyInteracting = false;

    const adjacentTiles = [
    [player.x, player.y - 1], // Up
    [player.x, player.y + 1], // Down
    [player.x - 1, player.y], // Left
    [player.x + 1, player.y]  // Right
    ];

    for (const [tx, ty] of adjacentTiles) {
        const tile = map[ty]?.[tx];
        if (!tile) continue;

        switch (tile) {
            case "I":
                player.inventory.push('item');
                player.hasWeapon = true;
                map[ty][tx] = "G";
                showMessage("You picked up a weapon!");
                drawMap();
                return;  // stop after one interaction
            case "N":               
                npcInteracting = true; // <-- Set only now
                if (player.inventory.includes('item')) {
                    showMessage("NPC says: 'Nice sword you got there! I'm sure you'll be able to defeat the beast with that.'");
                } else {
                    showMessage("NPC says: 'I wouldn't break the rules if I were you, stranger'");
                }
                drawMap();
                return;
            case "E":
                enemyInteracting = true; // <-- Set only now
                if (!player.hasWeapon && chosenRules.includes("Prepare yourself.")) {
                    endGame(false, "You forgot your weapon before battle and got defeated!");
                } else {
                    inBattle = true;
                    currentEnemy = { x: tx, y: ty };
                    enemyHealth = 3;
                    showMessage("Enemy encountered! Press 'a' to attack.");
                }
                drawMap();
                return;
            default:
                // nothing to interact with in this tile, continue checking others
                break;
        }
    }
    // If no interactions found around player
    showMessage("There's nothing to interact with.");
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
                currentEnemy = null;
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
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", " "].includes(e.key)) e.preventDefault();
    
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        npcInteracting = false;
        enemyInteracting = false;
    }

    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
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
    else if (e.key === ' ' || e.key === "Space") interact();
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