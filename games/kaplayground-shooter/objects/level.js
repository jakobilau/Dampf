// 4) The wall grid - imported by utils/raycast.js, objects/player.js and
//    scenes/game.js.
//
// "&" from the original demo (fixed-position billboard tiles) is gone -
// enemies are independent, movable objects now (see objects/enemies.js),
// so every former "&" is just open floor here.
//
// buildLevel() only *adds* the wall entities to the currently running
// scene - it must be called from inside scene("game", ...) (see
// scenes/game.js), not at file-load time, otherwise it'd try to add
// objects before any scene exists (and couldn't be re-run on restart).

import k from "../kaplay.js";
const { vec2, addLevel, rect, color, area, body, RED, GREEN, BLUE } = k;

export const colors = {
    "#": RED,
    "$": GREEN,
    "%": BLUE,
};

export const grid = [
    "##################",
    "#                #",
    "# $$$$$$$ $$$$$$ #",
    "# $            $ #",
    "# $ %% %%%%%%% $ #",
    "# $ %        % $ #",
    "# $ %%%%%  %%% $ #",
    "# $ %          $ #",
    "# $ %%%%%%%%%%   #",
    "# $            $ #",
    "# $$$$$$$ $$$$$$ #",
    "#                #",
    "##################",
];

export function buildLevel() {
    addLevel(grid, {
        pos: vec2(0, 0),
        tileWidth: 16,
        tileHeight: 16,
        tiles: {
            "#": () => [rect(16, 16), color(RED), area(), body({ isStatic: true })],
            "$": () => [rect(16, 16), color(GREEN), area(), body({ isStatic: true })],
            "%": () => [rect(16, 16), color(BLUE), area(), body({ isStatic: true })],
        },
    });
}
