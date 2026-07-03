// 6) The player/camera object - imported by scenes/game.js.
//
// This one object does double duty: it's a real KAPLAY entity with a
// physics body (pos/area/body) so movement collides with walls normally,
// AND it has a custom draw() that renders the fake-3D raycast view plus the
// weapon/HUD/game-over overlay as a fixed inset window on screen.
//
// createCamera() is a *factory* - it must be called from inside
// scene("game", ...) (see scenes/game.js), not at file-load time, same
// reasoning as buildLevel()/spawnEnemies(). Health/score/cooldowns live
// directly on the returned object (this.hp, this.score, ...) instead of
// separate globals, so a fresh camera = a fresh game state, and restarting
// is just "run the scene again".
//
// Walls/enemies are rendered as solid, distance-shaded colored strips
// (drawRect) instead of textured sprites (drawUVQuad + loadSprite). The
// black/gray screen you saw was almost certainly this: the data-URL
// generated sprites either never finished loading or KAPLAY's sprite
// pipeline didn't like a data: URL, so wallTex/enemyTex stayed undefined -
// every frame's draw() threw partway through (right after the two
// background rects, which is exactly why you saw solid gray/black and
// nothing else: no wall strips, no HUD, no weapon, all of which run AFTER
// the crash point, and the per-frame draw() error is silently swallowed by
// KAPLAY instead of showing in the console). Solid-color rects have no
// loading step at all, so this removes that failure mode entirely. You can
// always layer real sprites back in later once the core game is solid.

import k from "../kaplay.js";
const {
    add, pos, rotate, z, rect, anchor, area, opacity, body,
    pushTransform, pushRotate, pushTranslate, popTransform,
    drawCircle, drawLine, drawRect, drawText,
    vec2, Vec2, lerp, RED, BLACK, WHITE, rgb,
} = k;
import { grid } from "./level.js";
import { rayCastAsciiGrid } from "../utils/raycast.js";
import { ENEMY_SPAWNS } from "./enemies.js";

const ENEMY_COLOR = rgb(46, 139, 87);

export function createCamera() {
    return add([
    pos(7 * 16, 11 * 16 + 8),
    rotate(0),
    z(-1),
    rect(8, 8),
    anchor("center"),
    area(),
    opacity(0),
    body(),
    {
        draw() {
            pushTransform();
            pushRotate(-this.angle);
            drawCircle({
                pos: vec2(),
                radius: 4,
                color: RED,
            });
            const dir = Vec2.fromAngle(this.angle);
            const perp = dir.normal();
            const planeP1 = this.pos.add(dir.scale(this.focalLength)).add(
                perp.scale(this.fov),
            ).sub(this.pos);
            const planeP2 = this.pos.add(dir.scale(this.focalLength)).sub(
                perp.scale(this.fov),
            ).sub(this.pos);
            drawLine({
                p1: planeP1,
                p2: planeP2,
                width: 1,
                color: RED,
            });
            pushTranslate(this.pos.scale(-1).add(300, 50));
            drawRect({
                width: 240,
                height: 120,
                color: rgb(100, 100, 100),
            });
            drawRect({
                pos: vec2(0, 120),
                width: 240,
                height: 120,
                color: rgb(128, 128, 128),
            });
            for (let x = 0; x <= 120; x++) {
                let direction = lerp(planeP1, planeP2, x / 120).scale(6);
                const hit = rayCastAsciiGrid(this.pos, direction, grid);
                if (hit && hit.object) {
                    const t = hit.t;
                    const shade = (1 - t) * ((hit.normal.x + hit.normal.y) < 0 ? 0.5 : 1);
                    const h = 240 / (t * direction.len() / 16);

                    drawRect({
                        width: 2,
                        height: h,
                        pos: vec2(x * 2, 120 - h / 2),
                        color: (hit.object.color || WHITE).lerp(BLACK, Math.max(0, 1 - shade)),
                    });
                }

                if (hit.objects.length > 0) {
                    hit.objects
                        .sort((a, b) => b.t - a.t) // draw far to near
                        .forEach(o => {
                            if (hit.object && o.t > hit.t) return; // behind a wall
                            const wh = 240 / (o.t * direction.len() / 16);
                            const oh = 140 / (o.t * direction.len() / 16);
                            const shade = 1 - o.t;
                            const baseColor = o.enemy.hitFlash > 0 ? RED : ENEMY_COLOR;
                            drawRect({
                                width: 2,
                                height: oh,
                                pos: vec2(x * 2, 120 + wh / 2 - oh),
                                color: baseColor.lerp(BLACK, Math.max(0, 1 - shade)),
                            });
                        });
                }
            }

            // ---- Weapon shape, muzzle flash, crosshair, HUD, game-over ----
            // Same fixed "screen window" coordinate space as the view above,
            // (0,0)-(240,240).

            if (this.muzzleFlash > 0) {
                drawRect({
                    width: 240,
                    height: 240,
                    color: rgb(255, 255, 200),
                    opacity: this.muzzleFlash * 1.5,
                });
            }

            // Simple drawn weapon silhouette (no sprite/texture needed).
            drawRect({ pos: vec2(120, 235), width: 40, height: 18, anchor: "bot", color: rgb(70, 70, 70) });
            drawRect({ pos: vec2(120, 217), width: 14, height: 45, anchor: "bot", color: rgb(90, 90, 90) });

            drawLine({ p1: vec2(114, 120), p2: vec2(126, 120), width: 1, color: WHITE });
            drawLine({ p1: vec2(120, 114), p2: vec2(120, 126), width: 1, color: WHITE });

            drawRect({ pos: vec2(0, 0), width: 240, height: 14, color: BLACK, opacity: 0.5 });
            drawText({ text: `HP ${Math.max(0, this.hp)}`, pos: vec2(4, 2), size: 10, color: WHITE });
            drawText({ text: `Kills ${this.score}/${ENEMY_SPAWNS.length}`, pos: vec2(140, 2), size: 10, color: WHITE });

            if (this.gameOver) {
                drawRect({ width: 240, height: 240, color: BLACK, opacity: 0.6 });
                drawText({ text: "GAME OVER", pos: vec2(120, 110), size: 16, anchor: "center", color: RED });
                drawText({ text: "Enter = Neustart", pos: vec2(120, 132), size: 10, anchor: "center", color: WHITE });
            }
            else if (this.score >= ENEMY_SPAWNS.length) {
                drawRect({ width: 240, height: 240, color: BLACK, opacity: 0.6 });
                drawText({ text: "GESCHAFFT!", pos: vec2(120, 110), size: 16, anchor: "center", color: rgb(120, 255, 120) });
                drawText({ text: "Enter = Neustart", pos: vec2(120, 132), size: 10, anchor: "center", color: WHITE });
            }

            popTransform();
        },
        focalLength: 40,
        fov: 10,
        hp: 100,
        score: 0,
        gameOver: false,
        shootCooldown: 0,
        muzzleFlash: 0,
    },
    ]);
}
