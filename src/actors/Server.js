import { PlayerModel } from "./PlayerModel.js";


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
    const player = PlayerModel({
        x: 0,
        y: 0,
        wasd: {
            right: () => playerKeys.right,
            left: () => playerKeys.left,
            up: () => playerKeys.up,
            down: () => playerKeys.down,
        }
    });
    let playerKeys = { right: false, left: false, up: false, down: false };
    let intervalID = null;

    let pingMedian = 100;
    let pingVariation = 20;


    // private methods
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
                    player.setPosition({x: m.x, y: m.y});
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
                        x: player.getPosition().x,
                        y: player.getPosition().y,
                        speed: player.getSpeed(),
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

        player.update();
        sprite.x = player.getPosition().x;
        sprite.y = player.getPosition().y;
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