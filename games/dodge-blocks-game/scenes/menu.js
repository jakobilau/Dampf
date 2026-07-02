scene("menu", () => {
    add([rect(width(), height()), pos(0, 0), color(20, 20, 30), fixed()]);

    add([sprite("mark"), anchor("center"), pos(center().x, center().y - 140), scale(2.2)]);

    add([
        text("Dodge the Blocks", { size: 48 }),
        anchor("center"), pos(center().x, center().y - 10), fixed(), color(255, 255, 255),
    ]);

    add([
        text("Use \\[left\\] / \\[right\\] to dodge falling blocks.\nSurvive as long as you can!", { size: 18, align: "center" }),
        anchor("center"), pos(center().x, center().y + 55), fixed(), color(180, 180, 190),
    ]);

    const prompt = add([
        text("Press \\[space\\] to start", { size: 22 }),
        anchor("center"), pos(center().x, center().y + 140), fixed(), opacity(1), color(255, 220, 80),
    ]);
    prompt.onUpdate(() => {
        prompt.opacity = 0.5 + Math.sin(time() * 4) * 0.5; // sanftes Pulsieren
    });

    onKeyPress("space", () => { go("game"); });
});