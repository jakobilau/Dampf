import { addPlayer } from "../objects/Player.js";
import { addBlocks } from "../objects/Blocks.js";
let score = 0;

const SPAWN_RAMP_TIME = 45;      
const MAX_SPAWN_INTERVAL = 1;    
const MIN_SPAWN_INTERVAL = 0.35; 
const MIN_BLOCK_COUNT = 1;     
const MAX_BLOCK_COUNT = 4;  
scene("game", () => {
    score = 0;
    onUpdate(() => {
        score += dt();
        scoreLabel.text = `Score: ${Math.floor(score)}`;
    })
       const scoreLabel = add([
    text(`Score: ${Math.floor(score)}`, { size: 24 }),
    pos(16, 16),
    fixed(),
  ]);
     const player = addPlayer();
    function spawnWave() {
        const t = clamp(score / SPAWN_RAMP_TIME, 0, 1);
        const count = Math.round(lerp(MIN_BLOCK_COUNT, MAX_BLOCK_COUNT, t));
        for (let i = 0; i < count; i++) {
            addBlocks(score);
        }
        const interval = lerp(MAX_SPAWN_INTERVAL, MIN_SPAWN_INTERVAL, t);
        wait(interval, spawnWave);
    }
    spawnWave();
});