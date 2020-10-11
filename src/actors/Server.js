export const Server = ({container, receiveUpdate}) => {
    // graphics
    const sprite =
        new Graphics()
        .beginFill(0x0000ff)
        .drawCircle(0, 0, 8)
        .endFill();
    container.addChild(sprite);


    // instance variables
    let initialized = false;
    let playerVx = 0;
    let playerVy = 0;
    let playerX = 0;
    let playerY = 0;
    let playerKeys = { right: false, left: false, up: false, down: false };
    let intervalID = null;

    let pingMedian = 100;
    let pingVariation = 20;


    // private methods
    const playerAcceleration = () => {
        let dx = playerKeys.right - playerKeys.left;
        let dy = playerKeys.down - playerKeys.up;
        if (dx*dx + dy*dy === 2){
            dx *= Math.SQRT1_2;
            dy *= Math.SQRT1_2;
        }
        return {x: dx*0.5, y: dy*0.5};
    };

    const restart = () => {
        stop();
        start();
    };


    // public API
    const sendMessage = m => {
        const {message} = m;
        setTimeout(
            () => {
                if (message === "initialPosition" && !initialized){
                    initialized = true;
                    playerX = m.x;
                    playerY = m.y;
                }
                if (message === "movement") {
                    const {direction, on} = m;
                    playerKeys[direction] = on;
                }
            },
            pingMedian + 2*(Math.random()-0.5)*pingVariation
        );
    };

    const start = () => {
        if (intervalID !== null)
            return;

        intervalID = setInterval(
            () => {
                if (!initialized)
                    return;

                setTimeout(
                    () => receiveUpdate({
                        x: playerX,
                        y: playerY,
                        speed: {x: playerVx, y: playerVy},
                    }),
                    Math.random() * pingVariation
                );
            },
            pingMedian - pingVariation // ms
        )
    };

    const stop = () => {
        if (intervalID === null)
            return;

        clearInterval(intervalID);
        intervalID = null;
    };

    const onStep = () => {
        if (!initialized)
            return;

        const {x: ax, y: ay} = playerAcceleration();
        playerVx += ax;
        playerVy += ay;

        {
            const vSquared = playerVx*playerVx + playerVy*playerVy
            if (vSquared > 100){
                const cosPhi = playerVx/vSquared;
                const sinPhi = playerVy/vSquared;
                playerVx = cosPhi * 10;
                playerVy = sinPhi * 10;
            }
        }

        playerX += playerVx;
        playerY += playerVy;

        playerVx *= 0.95;
        playerVy *= 0.95;

        sprite.x = playerX;
        sprite.y = playerY;
    };

    const onDestroy = () => {
        stop();
        sprite.destroy();
        container.removeChild(sprite);
    };

    const changeSettings = ({ping}) => {
        console.log(ping);
        pingMedian = ping.median;
        pingVariation = ping.variation;
        restart();
    };

    return {sendMessage, start, stop, changeSettings, onStep, onDestroy};
};