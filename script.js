const canvas=document.getElementById("gameCanvas");
const ctx=canvas.getContext('2d');

const tileSize=64;
const mapSize=8;
const player={
    x:0,
    y:0,
    steps:0,
    inventory: [],
    attackStreak: 0
};

const rules=[
    "Don’t attack more than twice in a row.",
  "Avoid red tiles.",
  "Carry only one item.",
  "Talk to all NPCs.",
  "Heal before battle.",
  "Rest every 5 steps."
];

let chosenRules=[];

const images = {
      player: new Image(),
      npc: new Image(),
      enemy: new Image(),
      item: new Image(),
    };
    
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
    for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
          const tile = map[y][x];
          ctx.fillStyle = tile === 'R' ? 'red' : tile === 'I' ? 'yellow' : tile === 'E' ? 'black' : tile === 'N' ? 'blue' : 'green';
          ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
      }
      ctx.fillStyle = 'white';
      ctx.fillRect(player.x * tileSize + 16, player.y * tileSize + 16, tileSize - 32, tileSize - 32);
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
        } else {
          player.inventory.push('item');
          map[player.y][player.x] = 'G';
        }
      }
      if (tile === 'N') {
        showMessage("You talked to an NPC.");
        map[player.y][player.x] = 'G';
      }
      if (tile === 'E') {
        if (chosenRules.includes("Heal before battle.")) {
          showMessage("You forgot to heal before battle!");
        } else {
          showMessage("Battle begins!");
          player.attackStreak = 0;
        }
      }
}

const movePlayer=(dx, dy)=>{
     const newX = player.x + dx;
      const newY = player.y + dy;
      if (newX >= 0 && newX < mapSize && newY >= 0 && newY < mapSize) {
        player.x = newX;
        player.y = newY;
        player.steps++;
        if (player.steps % 5 === 0 && chosenRules.includes("Rest every 5 steps.")) {
          showMessage("You must rest after 5 steps!");
        }
        handleTile(map[player.y][player.x]);
        drawMap();
      }
}

document.addEventListener("keydown", (e)=>{
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();

    if(e.key==="ArrowUp") movePlayer(0,-1);
    else if (e.key === 'ArrowDown') movePlayer(0, 1);
      else if (e.key === 'ArrowLeft') movePlayer(-1, 0);
      else if (e.key === 'ArrowRight') movePlayer(1, 0);
      else if (e.key === 'a') {
        if (chosenRules.includes("Don’t attack more than twice in a row.")) {
          if (player.attackStreak >= 2) {
            showMessage("You attacked more than twice in a row!");
          } else {
            showMessage("You attack the enemy!");
            player.attackStreak++;
          }
        } else {
          showMessage("You attack the enemy!");
        }
      } else if (e.key === 'h') {
        showMessage("You healed.");
      }
    });



pickRules();
drawMap();

