scene("end", (score) => {
  add([
    rect(width(), height()),
    pos(0, 0),
    color(0, 0, 0),
    opacity(0.6),
    fixed(),
  ]);

  add([
    text("Game Over", { size: 64 }),
    anchor("center"),
    pos(center()),
    fixed(),
  ]);

  add([
    text(`Score: ${score}`, { size: 32 }),
    anchor("center"),
    pos(center().add(0, 60)),
    fixed(),
  ]);

  add([
    text("Press \\[space\\] to restart", { size: 20 }), // eckige Klammern müssen escaped werden!
    anchor("center"),
    pos(center().add(0, 110)),
    fixed(),
  ]);

  onKeyPress("space", () => {
    go("game");
  });
});

