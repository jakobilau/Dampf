const TILT_ANGLE = 20;   // Grad, wie stark die Neigung beim Bewegen ist
const TILT_SPEED = 10;   // wie schnell sich die Neigung anpasst (höher = ruckartiger)

export function addPlayer() {
    const player = add([
        sprite("mark"),
        pos(400, 500),
        anchor("center"),
        area({isSensor: true}),
        rotate(),
        "player",
    ]);
    const SPEED = 400;

    player.onUpdate(() => {
        let targetAngle = 0;

        if (isKeyDown("left")) {
            player.move(-SPEED, 0);
            targetAngle = -TILT_ANGLE;
        }
        if (isKeyDown("right")) {
            player.move(SPEED, 0);
            targetAngle = TILT_ANGLE;
        }

        player.angle = lerp(player.angle, targetAngle, TILT_SPEED * dt());
    });

    player.onCollideUpdate("block", (block) => {
        block.destroy()
        go("end", Math.floor(time()));
    })

    return player;
}