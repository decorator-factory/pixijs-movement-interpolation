export const Player = ({container, x, y, server: {sendMessage}, wasd}) => {
    // graphics
    const sprite =
        new Graphics()
        .beginFill(0xff0000)
        .drawCircle(0, 0, 32)
        .endFill();
    sprite.x = x;
    sprite.y = y;
    container.addChild(sprite);

    const target =
        new Graphics()
        .lineStyle(2, 0x00ff00)
        .drawCircle(0, 0, 8);
    target.x = x;
    target.y = y;
    container.addChild(target);

    // instance variables
    const movement = { right: false, left: false, up: false, down: false };
    let initialized = false;

    let vx = 0;
    let vy = 0;
    let lastUpdateTime = Date.now();

    // private methods
    const deltaFrames = () => {
        const deltaTimeMs = Date.now() - lastUpdateTime;
        return deltaTimeMs * 60 / 1000;
    }

    const interpolate = (a, b, delta) => a * (1 - delta) + b * delta;

    // public API
    const receiveUpdate = ({x, y, speed}) => {
        const delta = Math.min(1, deltaFrames()/60);
        let px = interpolate(sprite.x, sprite.x + vx*60, delta);
        let py = interpolate(sprite.y, sprite.y + vy*60, delta);
        sprite.x = (px + x)/2;
        sprite.y = (py + y)/2;
        target.x = x;
        target.y = y;
        vx = speed.x;
        vy = speed.y;
        lastUpdateTime = Date.now();
    };

    const onStep = () => {
        if (!initialized){
            initialized = true;
            sendMessage({
                message: "initialPosition",
                x,
                y,
            });
        }

        for (const d of ["right", "left", "up", "down"])
            if (movement[d] != wasd[d]()){
                movement[d] = !movement[d];
                sendMessage({
                    message: "movement",
                    direction: d,
                    on: movement[d],
                });
            }

        vx *= 0.95;
        vy *= 0.95;

        sprite.x += vx;
        sprite.y += vy;
    };

    const onDestroy = () => {
        target.destroy();
        container.removeChild(target);
        target.destroy();
        container.removeChild(target);
    };

    return {onStep, onDestroy, receiveUpdate};
};