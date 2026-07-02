const MIN_SPEED = 220;
const MAX_SPEED = 620;
const MIN_SIZE = 36;
const MAX_SIZE = 72;
const RAMP_TIME = 45;

export function addBlocks(elapsed = 0) {
    const t = clamp(elapsed / RAMP_TIME, 0, 1);
    const speed = lerp(MIN_SPEED, MAX_SPEED, t);
    const size = lerp(MIN_SIZE, MAX_SIZE, t);

    const block = add([
    rect(size, size),
    color(GREEN),
    anchor("center"),
    pos(rand(0, width()), -40),
    area({isSensor: true}),
    "block",
    ])
    
    block.onUpdate(() => {
            block.move(0, speed);;
            if (block.pos.y > height()) {
                destroy(block);
                debug.log("POW");
            }
    })
    
    block.onCollideUpdate("player", (player) => {
        destroy(player);
    })
    return block;
}
