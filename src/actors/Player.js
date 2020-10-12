import { PlayerModel } from "./PlayerModel.js";


export const Player = ({container, x, y, server: {sendMessage}, wasd}) => {
    const model = PlayerModel({ x, y, wasd });

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
        const delta = Math.min(1, deltaFrames()/20);
        let px = model.getPosition().x;
        let py = model.getPosition().y;
        sprite.x = (px + interpolate(px, x, delta))/2;
        sprite.y = (py + interpolate(py, y, delta))/2;
        model.setPosition({x: sprite.x, y: sprite.y});
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

        model.update();
        sprite.x = model.getPosition().x;
        sprite.y = model.getPosition().y;
    };

    const onDestroy = () => {
        target.destroy();
        container.removeChild(target);
        target.destroy();
        container.removeChild(target);
    };

    return {onStep, onDestroy, receiveUpdate};
};