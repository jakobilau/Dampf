// 7) Registers the "game" scene - imported (for its side effect) by
//    main.js. Defining a scene here doesn't run any of this code yet -
//    scene() just registers it. main.js calls go("game") to actually
//    start it.
//
// Restarting the level is simply calling go("game") again: KAPLAY destroys
// every object added by the previous scene run automatically, and this
// callback re-runs buildLevel()/spawnEnemies()/createCamera() from
// scratch, so there's no manual state-reset code needed anywhere.

import k from "../kaplay.js";
const {
    scene, go, Vec2, vec2, dt, debug,
    onKeyDown, onKeyPress, onUpdate, onTouchStart, onTouchMove,
    // onClick is the long-standing stable name; onMousePress/onMouseDown
    // are tried as fallbacks below in case your KAPLAY version names it
    // differently. Destructuring a name that doesn't exist on `k` just
    // gives `undefined` here, it doesn't throw - the typeof guard below
    // handles picking whichever one is actually a function.
    onClick, onMousePress, onMouseDown,
} = k;
import { buildLevel, grid } from "../objects/level.js";
import { spawnEnemies, updateEnemies, ENEMY_SPAWNS } from "../objects/enemies.js";
import { createCamera } from "../objects/player.js";
import { rayCastAsciiGrid } from "../utils/raycast.js";

scene("game", () => {
    buildLevel();
    spawnEnemies();
    const camera = createCamera();

    function shoot() {
        if (camera.shootCooldown > 0 || camera.gameOver || camera.score >= ENEMY_SPAWNS.length) {
            return;
        }
        camera.shootCooldown = 0.35;
        camera.muzzleFlash = 0.15;

        const dir = Vec2.fromAngle(camera.angle).scale(16 * 20); // ~20 tiles range
        const result = rayCastAsciiGrid(camera.pos, dir, grid);

        let closest = null;
        for (const o of result.objects) {
            if (!closest || o.t < closest.t) closest = o;
        }

        if (closest && closest.t < result.t) {
            const e = closest.enemy;
            e.hp -= 40;
            e.hitFlash = 0.15;
            if (e.hp <= 0 && !e.dead) {
                e.dead = true;
                e.marker.opacity = 0.15; // faint corpse marker on the minimap
                camera.score++;
            }
        }
    }

    // Mouse-click-to-shoot: KAPLAY versions differ a bit on the exact global
    // mouse-input function name, so we try the common ones instead of
    // hard-crashing if one isn't available in your build. Space always works
    // regardless.
    if (typeof onClick === "function") {
        onClick(() => shoot());
    }
    else if (typeof onMousePress === "function") {
        onMousePress(() => shoot());
    }
    else if (typeof onMouseDown === "function") {
        onMouseDown(() => shoot());
    }

    onKeyPress("space", () => shoot());
    onKeyPress("enter", () => {
        if (camera.gameOver || camera.score >= ENEMY_SPAWNS.length) go("game");
    });

    // ---- Movement ----

    onKeyDown("up", () => {
        camera.move(Vec2.fromAngle(camera.angle).scale(40));
    });

    onKeyDown("down", () => {
        camera.move(Vec2.fromAngle(camera.angle).scale(-40));
    });

    onKeyDown("left", () => {
        camera.angle -= 90 * dt();
    });

    onKeyDown("right", () => {
        camera.angle += 90 * dt();
    });

    // Debug keys carried over from the original demo.
    onKeyDown("f", () => {
        camera.focalLength = Math.max(1, camera.focalLength - 10 * dt());
    });

    onKeyDown("g", () => {
        camera.focalLength += 10 * dt();
    });

    onKeyDown("r", () => {
        camera.fov = Math.max(1, camera.fov - 10 * dt());
    });

    onKeyDown("t", () => {
        camera.fov += 10 * dt();
    });

    onKeyDown("p", () => {
        debug.paused = !debug.paused;
    });

    let lastTouchPos = vec2();

    onTouchStart(p => {
        lastTouchPos = p;
    });

    onTouchMove(p => {
        const delta = p.sub(lastTouchPos);
        if (delta.x < 0) camera.angle -= 90 * dt();
        else if (delta.x > 0) camera.angle += 90 * dt();
        if (delta.y < 0) camera.move(Vec2.fromAngle(camera.angle).scale(40));
        else if (delta.y > 0) camera.move(Vec2.fromAngle(camera.angle).scale(-40));
        lastTouchPos = p;
    });

    // ---- Per-frame timers + enemy AI ----

    onUpdate(() => {
        if (camera.shootCooldown > 0) camera.shootCooldown -= dt();
        if (camera.muzzleFlash > 0) camera.muzzleFlash -= dt();
        if (camera.gameOver) return;

        const damage = updateEnemies(camera.pos);
        if (damage > 0) {
            camera.hp -= damage;
            if (camera.hp <= 0) {
                camera.hp = 0;
                camera.gameOver = true;
            }
        }
    });
});
