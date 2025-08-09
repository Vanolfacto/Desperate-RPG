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
    isDead: false,
    coins: 0,
    facing: "ArrowRight",
    weapon: 'basic',       
    armor: 0,              
    maxArmor: 100  
};

let merchantInventory = {
  alastorAvailable: true
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
let enemyHealth = 250;
let maxEnemyHealth = 250;
let currentEnemy = null;

const images = {
      player: new Image(),
      npc: new Image(),
      enemy: new Image(),
      item: new Image(),
      lava: new Image(),
      cave: new Image(),
      slime: new Image(),
      merchant: new Image()
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

const newBackgroundImage = new Image();
newBackgroundImage.src = 'assets/cave.jpg';

newBackgroundImage.onload = () => {
  drawMap(); // Redraw when loaded
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
images.cave.src='assets/cave-door.png';
images.slime.src='assets/slime.png';
images.merchant.src='assets/motivated-merchant.png'

let slimes = [
  { x: 4, y: 2, health: 2 },
  { x: 3, y: 5, health: 2 },  
  { x: 0, y: 6, health: 2 },  
  { x: 6, y: 6, health: 2 }  
];

const map = [
      ['G','G','G','R','G','G','G','G'],
      ['G','G','G','G','G','G','G','G'],
      ['G','G','E','G','G','G','G','G'],
      ['G','G','G','G','G','G','R','G'],
      ['G','G','G','G','N','G','G','G'],
      ['G','G','G','G','G','G','G','G'],
      ['G','R','G','G','G','G','G','X'],
      ['G','G','G','G','I','G','G','G']
    ];

const caveMap = [
    ['C','C','C','C','C','C','C','C'],
    ['X','C','C','C','G','G','C','C'],
    ['G','C','C','G','E','G','C','C'],
    ['G','G','C','G','G','G','G','M'],
    ['G','G','G','G','G','G','G','G'],
    ['G','G','G','E','G','G','G','G'],
    ['E','G','G','G','G','G','E','C'],
    ['C','C','G','C','G','G','C','C']
];

let currentMap = map;

const pickRules=()=>{
    const shuffled=rules.sort(()=>0.5-Math.random());
    chosenRules=shuffled.slice(0,3);
    document.getElementById('rule-list').innerHTML=chosenRules.map(r=>`<li>${r}</li>`).join("");
}

const drawMap=()=>{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(activeBackground, 0, 0, canvas.width, canvas.height);

    if(currentMap === map){
        for (let y = 0; y < mapSize; y++) {
            for (let x = 0; x < mapSize; x++) {
                const tile = currentMap[y][x];
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
          if (tile === 'X') ctx.drawImage(images.cave, x * tileSize, y * tileSize, tileSize, tileSize);
        }
      }
    }

    else if (currentMap === caveMap) {
      for (let y=0;y<mapSize;y++){
        for(let x=0;x<mapSize;x++){
            const tile = currentMap[y][x];
            // if (tile === 'S') ctx.drawImage(images.slime, x * tileSize, y * tileSize, tileSize, tileSize);
            if (tile === 'M') ctx.drawImage(images.merchant, x * tileSize, y * tileSize, tileSize, tileSize);

            const slimeHere = slimes.find(s => s.x === x && s.y === y);
                if (slimeHere) {
                    ctx.save();
                    const px = x * tileSize;
                    const py = y * tileSize;
                    if (enemyInteracting && player.facing === "ArrowLeft") {
                        ctx.translate(px + tileSize, py);
                        ctx.scale(-1, 1);
                        ctx.drawImage(images.slime, 0, 0, tileSize, tileSize);
                    } else {
                    ctx.translate(px, py);
                    ctx.drawImage(images.slime, 0, 0, tileSize, tileSize);
                }
            ctx.restore();
        }
      }
    }
}
    
      if (!player.isDead){
        ctx.save();
        const px = player.x * tileSize;
        const py = player.y * tileSize;

        if (player.facing === "ArrowLeft") {
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

let messageTimeoutId=null;

const showMessage=(msg)=>{
    const msgBox = document.getElementById('message');
    msgBox.textContent = msg;
    msgBox.style.color = 'red';
    if(messageTimeoutId){
        clearTimeout(messageTimeoutId);
    }

    messageTimeoutId=setTimeout(()=>{
        msgBox.textContent="";
        messageTimeoutId=null;
    }, 8000)
}

let activeBackground = backgroundImage;

const movePlayer=(dx, dy)=>{
    if (gameOver) return;

    const newX = player.x + dx;
    const newY = player.y + dy;
    const target = currentMap[newY]?.[newX];

    if (!["G", "R", "X"].includes(target)) {
        showMessage("You can't move there!");
        return;
    }

    // Standard movement
    player.x = newX;
    player.y = newY;

    // Cave entrance transition
    if (target === 'X' && currentMap===map) {
        currentMap = caveMap;
        activeBackground = newBackgroundImage;
        player.x = 0;
        player.y = 1;

         slimes = [
        { x: 4, y: 2, health: 2 },
        { x: 3, y: 5, health: 2 },
        { x: 0, y: 6, health: 2 },
        { x: 6, y: 6, health: 2 }
        ];

        // Update caveMap tiles to 'E' where slimes are located
        for (const slime of slimes) {
            caveMap[slime.y][slime.x] = 'E';
        }

        npcInteracting = false;
        enemyInteracting = false;

        showMessage("You entered the cave!");

        drawMap();
        return;
    }
    else if (target==='X' && currentMap===caveMap){
        currentMap = map;
        activeBackground = backgroundImage;
        player.x = 7;
        player.y = 6;

        if (slimeRespawnTimeoutId) {
            clearTimeout(slimeRespawnTimeoutId);
            slimeRespawnTimeoutId = null;
        }

        slimes = [
        { x: 4, y: 2, health: 2 },
        { x: 3, y: 5, health: 2 },
        { x: 0, y: 6, health: 2 },
        { x: 6, y: 6, health: 2 }
        ];

        for (const slime of slimes) {
        caveMap[slime.y][slime.x] = 'E';
        }

        npcInteracting=false;
        enemyInteracting=false;

        showMessage("You exited the cave!");
    }


    drawMap();

    if (target === 'R') {
        player.health = 0;
        updateHealthBar();
        endGame(false, "You stepped on lava and died!");
    }
}

const openMerchantShop=()=>{
  let menu = "Greetings. If you want to be fully motivated, then you should buy some of my stuff.\nAnd no, you can't have my Yamato...\n";

  menu += "1. Berry Delight ( heals 50% HP ) - 5 coins\n";
  menu += merchantInventory.alastorAvailable ? "2. Alastor Sword (double damage) - 100 coins\n" : "2. Alastor Sword (Sold Out)\n";
  menu += "3. Demon Armor (100 armor points) - 70 coins\n";
  menu += "Enter number to buy or Cancel to exit:";

  const choice = prompt(menu);

  if (choice === null) {
    showMessage("Motivated merchant.");
    merchantInteracting = false;
    drawMap();
    return;
  }

  switch (choice.trim()) {
    case '1':
      buyBerryDelight();
      break;
    case '2':
      if (merchantInventory.alastorAvailable) buyAlastor();
      else {
        showMessage("Alastor is sold out.");
      }
      break;
    case '3':
      buyDemonArmor();
      break;
    default:
      showMessage("Invalid choice.");
      break;
  }
  merchantInteracting = false;
  drawMap();
};

const buyBerryDelight=()=>{
    if (player.coins < 5) {
    showMessage("Merchant: You can't have my Berry Delight deep within your pockets with that ammount of coins...");
    return;
  }
  if (player.health >= player.maxHealth) {
    showMessage("Merchant: Your health is already full, you fool!");
    return;
  }
  player.coins -= 5;
  const healAmount = Math.floor(player.maxHealth * 0.5);
  player.health = Math.min(player.maxHealth, player.health + healAmount);
  showMessage(`Merchant: You better enjoy it. It took me 14 years to think of the recipee.`);
  updateHealthBar();
  updateCoins();
};

const buyAlastor=()=>{
  if (player.coins < 100) {
    showMessage("Merchant: You don't have enough coins for Alastor.");
    return;
  }
  player.coins -= 100;
  player.weapon = 'alastor';
  player.hasWeapon = true;  // keep for compatibility if you check hasWeapon elsewhere
  merchantInventory.alastorAvailable = false;
  showMessage("Merchant: Here, your Alastor. If you were my brother, I wouldn't have even thought about selling you this sword.");
  updateCoins();
};

const buyDemonArmor=()=>{
  if (player.coins < 70) {
    showMessage("Merchant: You don't have enough money for the armor.");
    return;
  }
  if (player.armor >= player.maxArmor) {
    showMessage("Merchant: Go and test out your armor already! You don't need to get a new one now...");
    return;
  }
  player.coins -= 70;
  player.armor = player.maxArmor;
  updateArmorBar();
  showMessage("Merchant: Here's your armor. Now I can pay my child support.");
  updateCoins();
};

const applyDamageToPlayer=(damage)=>{
  if (player.armor > 0) {
    const armorDamage = Math.min(damage, player.armor);
    player.armor -= armorDamage;
    damage -= armorDamage;
  }
  if (damage > 0) {
    player.health -= damage;
  }
  updateHealthBar();
  updateArmorBar();
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
        const tile = currentMap[ty]?.[tx];
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
                 if (player.weapon === 'alastor') {
                    showMessage("Pizza-Man: Is that Alastor!? Can I trade my pistols for it?");}
                else if (player.inventory.includes('item')) {
                    showMessage("Pizza-Man: Nice sword you got there! I'm sure you'll be able to defeat the beast with that.");
                } else {
                    showMessage("Pizza-Man: I wouldn't break the rules if I were you, stranger.");
                }
                drawMap();
                return;
            case "E":
                if (currentMap === caveMap) {
                    const slimeIndex = slimes.findIndex(s => s.x === tx && s.y === ty);
                     if (slimeIndex === -1) {
                         showMessage("There's no slime here.");
                        return;
                     }
                    enemyInteracting = true;
                    if (!player.hasWeapon && chosenRules.includes("Prepare yourself.")) {
                        endGame(false, "You forgot your weapon before battle and got defeated!");
                    }
                    else{
                    inBattle = true;
                    currentEnemy = slimes[slimeIndex];
                    enemyHealth = 100; 
                    maxEnemyHealth = 100;
                    updateEnemyHealthBar(enemyHealth, maxEnemyHealth);
                    document.getElementById('enemy-health-container').style.display = 'block';
                    showMessage("Slime encountered! Press 'a' to attack.");
                    }
                    drawMap();
                    return;
                }
                else {
                    enemyHealth = 250;
                    maxEnemyHealth = 250;
                    enemyInteracting = true; // <-- Set only now
                    if (!player.hasWeapon && chosenRules.includes("Prepare yourself.")) {
                        endGame(false, "You forgot your weapon before battle and got defeated!");
                    } else {
                        inBattle = true;
                        currentEnemy = { x: tx, y: ty };
                        enemyHealth = 250; 
                        maxEnemyHealth = 250;
                        updateEnemyHealthBar(enemyHealth, maxEnemyHealth);
                        document.getElementById('enemy-health-container').style.display = 'block';
                        showMessage("Enemy encountered! Press 'a' to attack.");
                    }
                    drawMap();
                    return;
                }
            case "M":
                merchantInteracting = true;
                drawMap();

                openMerchantShop();
            default:
            // nothing to interact with in this tile, continue checking others
            break;
        }
    }
}

const updateCoins = () => {
  const coinsDisplay = document.getElementById("coins");
  if (coinsDisplay) {
    coinsDisplay.textContent = `Coins: ${player.coins}`;
  }
};

const attackEnemy = () => {
    if (!inBattle) return;

    enemyInteracting = true;
    drawMap();

    if (!player.hasWeapon) {
        player.health = 0;  // Set health to zero
        updateHealthBar();  // Update UI
        endGame(false, "You attacked bare-handed and were defeated!");     // End the game and remove the hero
        return;
    }
    
    let playerDamage;
    if (player.weapon === 'alastor') {
        playerDamage = getRandomDamage(100, 150);
    } else {
        playerDamage = getRandomDamage(50, 75);
    }

    // const playerDamage = (player.weapon === 'alastor') ? 2 : 1;

    enemyHealth -= playerDamage;
    updateEnemyHealthBar(enemyHealth, maxEnemyHealth);

    enemyCounterAttack();
        // enemyHealth--;
        // player.health -= 25;
        // updateHealthBar();

    if (player.health <= 0) {
        player.isDead = true;
        gameOver = true;
        inBattle = false;
        enemyInteracting = false;
        drawMap();
        showMessage("Your health dropped to zero. You died!");
        showRestartButton();
        return;
    }

    if (enemyHealth <= 0) {
        if (currentMap === caveMap) {
            const defeatedSlimeX = currentEnemy.x;
            const defeatedSlimeY = currentEnemy.y;

            // Remove the defeated slime from array
             slimes = slimes.filter(s => !(s.x === currentEnemy.x && s.y === currentEnemy.y));
             currentMap[currentEnemy.y][currentEnemy.x] = 'G';

            player.coins += 15;
            updateCoins();
            showMessage("You defeated the slime! Coins +15");

            currentEnemy = null;
            inBattle = false;
            enemyInteracting = false;
            drawMap();
            document.getElementById('enemy-health-container').style.display = 'none';

            let slimeRespawnTimeoutId = null;

            // Respawn slime after 5 seconds
            setTimeout(() => {
            
            if (currentMap !== caveMap) {
                return;
            }

            const respawnedSlime = { x: defeatedSlimeX, y: defeatedSlimeY, health: 100 };
            slimes.push(respawnedSlime);
            currentMap[defeatedSlimeY][defeatedSlimeX] = 'E';
            drawMap();
            showMessage("A slime has appeared again!");
            }, 5000);
            }
            else{
                // Existing overworld defeat logic
                showMessage("You defeated the enemy! You win! 🎉");
                if (currentEnemy) {
                    map[currentEnemy.y][currentEnemy.x] = "G";
                    currentEnemy = null;
                }
                inBattle = false;
                enemyInteracting = false;
                drawMap();

                document.getElementById('enemy-health-container').style.display = 'none';
                
                endGame(true);
            }
        } 
        else {
            const hitsDone = maxEnemyHealth - enemyHealth;
            showMessage(`You hit the enemy for ${playerDamage} damage! (${enemyHealth}/${maxEnemyHealth} HP left)`);
        }
    
};

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

    if (player.health < 0) {
        player.health = 0;
    }
  const healthBar = document.getElementById("health-bar");
  const healthText = document.getElementById("health-bar-text");

  const healthPercent = Math.max(0, (player.health / player.maxHealth) * 100);
  healthBar.style.width = `${healthPercent}%`;
  healthText.textContent = `Health: ${player.health}`;

  if (player.health <= 0) {
    showMessage("Your health is gone! Game over.");
  }
}

const updateArmorBar = () => {
  const armorBar = document.getElementById("armor-bar");
  const armorText = document.getElementById("armor-bar-text");

  const armorPercent = Math.max(0, (player.armor / player.maxArmor) * 100);
  armorBar.style.width = `${armorPercent}%`;
  armorText.textContent = `Armor: ${player.armor}`;
};

updateArmorBar();

const updateEnemyHealthBar = (current, max) => {
  const bar = document.getElementById('enemy-health-bar');
  const text = document.getElementById('enemy-health-text');
  const percent = Math.max(0, (current / max) * 100);
  bar.style.width = `${percent}%`;
  text.textContent = `Enemy Health: ${current} / ${max}`;
};

const getRandomDamage = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const enemyCounterAttack=()=>{
    let damage=0;

    if (!inBattle || !currentEnemy) return;

    if (currentMap === caveMap) {
        // Slime damage between 20-30
        damage = getRandomDamage(20, 30);
    } else {
        // Main enemy damage between 55-70
        damage = getRandomDamage(55, 70);
    }

    applyDamageToPlayer(damage)
    showMessage(`Enemy counterattacked! You lost ${damage} health.`);
    updateHealthBar();

    if (player.health <= 0) {
        player.isDead = true;
        gameOver = true;
        inBattle = false;
        enemyInteracting = false;
        drawMap();
        showMessage("You were defeated by the enemy’s counterattack!");
        showRestartButton();
  }
}

updateHealthBar();
pickRules();
drawMap();
