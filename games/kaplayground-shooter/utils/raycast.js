// 3) Pure raycasting helpers, imported by objects/player.js and
//    scenes/game.js.
//
// rayCastGrid and raycastEdge don't know anything about walls or enemies -
// they're generic grid-DDA and line-intersection math. rayCastAsciiGrid is
// the game-specific glue: it walks the wall grid (passed in by the caller)
// AND separately tests every living enemy as a camera-facing billboard
// plane, which is why it needs `enemies` imported from objects/enemies.js.

import k from "../kaplay.js";
const { vec2 } = k;
import { enemies } from "../objects/enemies.js";
import { colors } from "../objects/level.js";

export function rayCastGrid(origin, direction, gridPosHit, maxDistance = 64) {
    const pos = origin;
    const len = direction.len();
    const dir = direction.scale(1 / len);
    let t = 0;
    let gridPos = vec2(Math.floor(origin.x), Math.floor(origin.y));
    const step = vec2(dir.x > 0 ? 1 : -1, dir.y > 0 ? 1 : -1);
    const tDelta = vec2(Math.abs(1 / dir.x), Math.abs(1 / dir.y));
    let dist = vec2(
        (step.x > 0) ? (gridPos.x + 1 - origin.x) : (origin.x - gridPos.x),
        (step.y > 0) ? (gridPos.y + 1 - origin.y) : (origin.y - gridPos.y),
    );
    let tMax = vec2(
        (tDelta.x < Infinity) ? tDelta.x * dist.x : Infinity,
        (tDelta.y < Infinity) ? tDelta.y * dist.y : Infinity,
    );
    let steppedIndex = -1;
    while (t <= maxDistance) {
        const hit = gridPosHit(gridPos);
        if (hit === true) {
            return {
                point: pos.add(dir.scale(t)),
                normal: vec2(
                    steppedIndex === 0 ? -step.x : 0,
                    steppedIndex === 1 ? -step.y : 0,
                ),
                t: t / len,
                gridPos,
            };
        }
        else if (hit) {
            return hit;
        }
        if (tMax.x < tMax.y) {
            gridPos.x += step.x;
            t = tMax.x;
            tMax.x += tDelta.x;
            steppedIndex = 0;
        }
        else {
            gridPos.y += step.y;
            t = tMax.y;
            tMax.y += tDelta.y;
            steppedIndex = 1;
        }
    }

    return null;
}

export function raycastEdge(origin, direction, line) {
    const a = origin;
    const c = line.p1.add(line.pos);
    const d = line.p2.add(line.pos);
    const ab = direction;
    const cd = d.sub(c);
    let abxcd = ab.cross(cd);
    if (Math.abs(abxcd) < Number.EPSILON) {
        return false;
    }
    const ac = c.sub(a);
    const s = ac.cross(cd) / abxcd;
    if (s <= 0 || s >= 1) {
        return false;
    }
    const t = ac.cross(ab) / abxcd;
    if (t <= 0 || t >= 1) {
        return false;
    }

    const normal = cd.normal().unit();
    if (direction.dot(normal) > 0) {
        normal.x *= -1;
        normal.y *= -1;
    }

    return {
        point: a.add(ab.scale(s)),
        normal: normal,
        t: s,
        s: t,
        object: line,
    };
}

// Casts one column's ray through the wall grid, AND separately tests every
// living enemy as a billboard. Returns { t, object, point, normal, objects }
// where `objects` is an array of enemy hits (possibly empty), each tagged
// with `.enemy` so callers know which enemy was hit.
export function rayCastAsciiGrid(origin, direction, grid) {
    const o = origin.scale(1 / 16);
    const d = direction.scale(1 / 16);

    const wallHit = rayCastGrid(o, d, ({ x, y }) => {
        if (y >= 0 && y < grid.length) {
            const row = grid[y];
            if (x >= 0 && x < row.length) {
                return row[x] !== " ";
            }
        }
        return false;
    }, d.len());

    const objects = [];
    const perp = d.normal().unit().scale(0.35);
    for (const e of enemies) {
        if (e.dead) continue;
        const hit = raycastEdge(o, d, {
            pos: e.pos.scale(1 / 16),
            p1: perp.scale(-1),
            p2: perp.scale(1),
        });
        if (hit) {
            hit.enemy = e;
            objects.push(hit);
        }
    }

    if (wallHit) {
        wallHit.point = wallHit.point.scale(16);
        wallHit.object = { color: colors[grid[wallHit.gridPos.y][wallHit.gridPos.x]] };
    }

    const result = wallHit || { t: Infinity };
    result.objects = objects;
    return result;
}
