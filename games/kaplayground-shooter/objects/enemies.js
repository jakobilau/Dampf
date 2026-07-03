// 5) Enemy state + AI - imported by utils/raycast.js (to test billboard
//    hits), objects/player.js (for ENEMY_SPAWNS.length in the HUD) and
//    scenes/game.js.
//
// Enemies are plain data objects (not full KAPLAY entities) so the
// raycaster can treat them as billboards cheaply - each one also gets a
// small marker object added just so you can see it moving on the top-down
// debug view in the background.
//
// spawnEnemies() must be called from inside scene("game", ...) (see
// scenes/game.js), same reasoning as buildLevel() in objects/level.js -
// add()'ing the marker objects only works once a scene is actually
// running, and calling it again on every scene restart is what resets
// the enemies.
//
// `enemies` is exported as a `let` and reassigned inside spawnEnemies() -
// ES module imports are "live bindings", so utils/raycast.js always sees
// the current array, including after a restart.

import k from "../kaplay.js";
const { vec2, add, pos, circle, color, z, anchor, destroy, dt } = k;

export const ENEMY_SPAWNS = [
    vec2(1 * 16 + 8, 6 * 16 + 8),
    vec2(3 * 16 + 8, 6 * 16 + 8),
    vec2(14 * 16 + 8, 6 * 16 + 8),
    vec2(16 * 16 + 8, 6 * 16 + 8),
    vec2(11 * 16 + 8, 11 * 16 + 8),
];

export let enemies = [];

export function spawnEnemies() {
    for (const e of enemies) {
        if (e.marker) destroy(e.marker);
    }
    enemies = ENEMY_SPAWNS.map((spawnPos) => {
        const e = { pos: spawnPos.clone(), hp: 100, dead: false, hitFlash: 0, attackCooldown: 0 };
        e.marker = add([
            pos(e.pos),
            circle(4),
            color(200, 60, 60),
            z(1),
            anchor("center"),
        ]);
        return e;
    });
}

// Chase-and-attack AI, ticked once per frame from scenes/game.js's
// onUpdate. Returns the total damage enemies landed on the player this
// frame (0 if none), so the caller decides how to apply it instead of this
// file reaching into player/game state directly. Note: enemies currently
// ignore walls when chasing (no collision against the grid) - fine for a
// rudimentary prototype, but a natural next step if you want to harden
// this.
export function updateEnemies(playerPos) {
    let damage = 0;

    for (const e of enemies) {
        if (e.dead) continue;
        if (e.hitFlash > 0) e.hitFlash -= dt();

        const toPlayer = playerPos.sub(e.pos);
        const dist = toPlayer.len();

        if (dist < 200 && dist > 16) {
            e.pos = e.pos.add(toPlayer.unit().scale(28 * dt()));
        }

        if (dist <= 16) {
            e.attackCooldown -= dt();
            if (e.attackCooldown <= 0) {
                e.attackCooldown = 1;
                damage += 10;
            }
        }

        e.marker.pos = e.pos;
    }

    return damage;
}
